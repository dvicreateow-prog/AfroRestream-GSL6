/*
 * Broadcaster: browser -> ffmpeg -> N RTMP destinations.
 *
 * The host's browser composites everything onto a canvas, captures it with
 * MediaRecorder as WebM (VP8/Opus), and streams the chunks over a WebSocket.
 * We pipe those chunks straight into ffmpeg's stdin, transcode once to H.264/AAC,
 * and fan out to every enabled destination with the `tee` muxer - so N destinations
 * cost one encode, not N.
 *
 * Bitrate ladder from the shipped client (TOOLS-02-video-filters-backgrounds.md):
 *   854x480@30 1.9 Mbps | 1280x720@30 3.5 | 1280x720@60 4.0 | 1920x1080@30 12.0
 */
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { mkdirSync, createWriteStream, type WriteStream } from 'node:fs'
import { EventEmitter } from 'node:events'
import path from 'node:path'
import type { Destination, DestinationStatus, StreamStats } from '@studio/shared'

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg'

/** Drop incoming chunks once ffmpeg's stdin backlog exceeds this (bytes). */
const MAX_STDIN_BACKLOG = 8 * 1024 * 1024

export interface EncodeProfile {
  width: number
  height: number
  fps: number
  videoBitrateKbps: number
  audioBitrateKbps: number
}

export const PROFILES: Record<string, EncodeProfile> = {
  '480p30': { width: 854, height: 480, fps: 30, videoBitrateKbps: 1900, audioBitrateKbps: 128 },
  '720p30': { width: 1280, height: 720, fps: 30, videoBitrateKbps: 3500, audioBitrateKbps: 160 },
  '720p60': { width: 1280, height: 720, fps: 60, videoBitrateKbps: 4000, audioBitrateKbps: 160 },
  '1080p30': { width: 1920, height: 1080, fps: 30, videoBitrateKbps: 12000, audioBitrateKbps: 192 },
}

/*
 * The tee muxer treats a backslash as an escape character and `|` as a target
 * separator, so a Windows absolute path silently produces NO output while ffmpeg
 * still exits 0. Verified 2026-08-25: the backslash form wrote nothing, the
 * forward-slash form wrote a 4.7 MB MP4 from byte-identical input.
 * Normalise separators, then escape the remaining tee metacharacters.
 */
function teeTarget(options: string, target: string): string {
  const safe = target.split('\\').join('/').split('|').join('%7C')
  return `[${options}]${safe}`
}

function joinRtmp(d: Destination) {
  const base = d.url.replace(/\/+$/, '')
  const key = d.streamKey.replace(/^\/+/, '')
  return key ? `${base}/${key}` : base
}

export interface BroadcastOptions {
  destinations: Destination[]
  profile?: keyof typeof PROFILES
  record?: boolean
  recordDir?: string
}

export class Broadcaster extends EventEmitter {
  private proc: ChildProcessWithoutNullStreams | null = null
  private recordStream: WriteStream | null = null
  private statuses = new Map<string, DestinationStatus>()
  private startedAt: number | null = null
  private bitrateKbps = 0
  private fps = 0
  private droppedFrames = 0
  private recording = false
  private stderrTail: string[] = []
  private droppedChunks = 0

  get live() {
    return this.proc !== null
  }

  start(opts: BroadcastOptions) {
    if (this.proc) throw new Error('Broadcast already running')

    const enabled = opts.destinations.filter((d) => d.enabled && d.url)
    const profile = PROFILES[opts.profile ?? '1080p30']
    this.recording = Boolean(opts.record)

    if (enabled.length === 0 && !this.recording) {
      throw new Error('No enabled destinations and recording is off')
    }

    /* tee targets: each RTMP endpoint, plus an optional local MP4. */
    const targets: string[] = enabled.map((d) =>
      teeTarget('f=flv:onfail=ignore', joinRtmp(d)),
    )

    let recordPath: string | null = null
    if (this.recording) {
      /* RECORDINGS_PATH points at the mounted disk in production; without it the
       * files land on the container filesystem and vanish on every redeploy. */
      const dir =
        opts.recordDir ??
        process.env.RECORDINGS_PATH ??
        path.resolve(process.cwd(), 'recordings')
      mkdirSync(dir, { recursive: true })
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      recordPath = path.join(dir, `studio-${stamp}.mp4`)
      targets.push(teeTarget('f=mp4:movflags=+faststart', recordPath))
    }

    const args = [
      '-hide_banner',
      '-loglevel', 'info',
      '-stats_period', '1',
      /* Input: WebM stream arriving on stdin. */
      '-f', 'webm',
      '-i', 'pipe:0',
      /* Video */
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-tune', 'zerolatency',
      '-profile:v', 'high',
      '-pix_fmt', 'yuv420p',
      '-b:v', `${profile.videoBitrateKbps}k`,
      '-maxrate', `${profile.videoBitrateKbps}k`,
      '-bufsize', `${profile.videoBitrateKbps * 2}k`,
      '-r', String(profile.fps),
      '-g', String(profile.fps * 2),
      '-keyint_min', String(profile.fps),
      '-sc_threshold', '0',
      '-vf', `scale=${profile.width}:${profile.height}:force_original_aspect_ratio=decrease,pad=${profile.width}:${profile.height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p`,
      /* Audio */
      '-c:a', 'aac',
      '-b:a', `${profile.audioBitrateKbps}k`,
      '-ar', '48000',
      '-ac', '2',
      /* Keep the muxer from stalling on a slow destination. */
      '-max_muxing_queue_size', '2048',
    ]

    if (targets.length === 1 && enabled.length === 1 && !this.recording) {
      args.push('-f', 'flv', joinRtmp(enabled[0]))
    } else if (targets.length === 1 && this.recording && enabled.length === 0) {
      args.push('-f', 'mp4', '-movflags', '+faststart', recordPath!)
    } else {
      args.push('-f', 'tee', '-map', '0:v?', '-map', '0:a?', targets.join('|'))
    }

    const proc = spawn(FFMPEG, args, { stdio: ['pipe', 'pipe', 'pipe'] })
    this.proc = proc
    this.startedAt = Date.now()

    for (const d of enabled) {
      this.statuses.set(d.id, { id: d.id, health: 'connecting' })
    }
    this.emitStats()

    proc.stderr.setEncoding('utf8')
    proc.stderr.on('data', (chunk: string) => this.onFfmpegLog(chunk))

    proc.on('error', (err) => {
      this.emit('error', new Error(`ffmpeg failed to start: ${err.message}`))
      this.cleanup()
    })

    proc.on('close', (code, signal) => {
      const clean = code === 0 || signal === 'SIGINT' || signal === 'SIGTERM'
      if (!clean) {
        this.emit(
          'error',
          new Error(
            `ffmpeg exited with code ${code}${signal ? ` (${signal})` : ''}\n` +
              this.stderrTail.slice(-12).join('\n'),
          ),
        )
      }
      this.emit('ended', { code, signal, recordPath })
      this.cleanup()
    })

    /* A destination that rejects us shows up in stderr, not on stdin. Ignore
     * EPIPE here so a dead ffmpeg doesn't crash the whole server. */
    proc.stdin.on('error', () => {})

    this.emit('started', { profile, destinations: enabled.length, recordPath })
    return { recordPath }
  }

  /**
   * Feed one MediaRecorder chunk.
   * Live output must not buffer without limit: if ffmpeg falls far enough behind,
   * drop the chunk and count it rather than growing the heap.
   */
  write(chunk: Buffer) {
    if (!this.proc || this.proc.stdin.destroyed) return false
    if (this.proc.stdin.writableLength > MAX_STDIN_BACKLOG) {
      this.droppedChunks++
      return false
    }
    this.proc.stdin.write(chunk)
    return true
  }

  stop() {
    if (!this.proc) return
    const proc = this.proc
    try {
      proc.stdin.end()
    } catch {
      /* already closed */
    }
    /* Give ffmpeg a moment to flush the MP4 moov atom before forcing it down. */
    const timer = setTimeout(() => {
      if (!proc.killed) proc.kill('SIGKILL')
    }, 5000)
    proc.once('close', () => clearTimeout(timer))
  }

  private onFfmpegLog(chunk: string) {
    for (const line of chunk.split(/\r?\n/)) {
      if (!line.trim()) continue
      this.stderrTail.push(line)
      if (this.stderrTail.length > 200) this.stderrTail.shift()

      /* Progress line: frame= 123 fps= 30 q=.. size= .. bitrate=4500.0kbits/s drop=0 */
      const bitrate = line.match(/bitrate=\s*([\d.]+)kbits\/s/)
      if (bitrate) this.bitrateKbps = Math.round(parseFloat(bitrate[1]))
      const fps = line.match(/fps=\s*([\d.]+)/)
      if (fps) this.fps = Math.round(parseFloat(fps[1]))
      const drop = line.match(/drop=\s*(\d+)/)
      if (drop) this.droppedFrames = parseInt(drop[1], 10)

      if (bitrate || fps) {
        /* First progress line means every tee target accepted the connection. */
        for (const [id, s] of this.statuses) {
          if (s.health === 'connecting') {
            this.statuses.set(id, { id, health: 'live', bitrateKbps: this.bitrateKbps })
          } else if (s.health === 'live') {
            this.statuses.set(id, { ...s, bitrateKbps: this.bitrateKbps })
          }
        }
        this.emitStats()
      }

      if (/error|failed|unable to open|connection refused|403|401/i.test(line)) {
        this.emit('log', line)
      }
    }
  }

  private emitStats() {
    this.emit('stats', this.stats())
  }

  stats(): StreamStats {
    return {
      live: this.live,
      recording: this.recording,
      startedAt: this.startedAt,
      bitrateKbps: this.bitrateKbps,
      fps: this.fps,
      droppedFrames: this.droppedFrames,
      destinations: [...this.statuses.values()],
    }
  }

  private cleanup() {
    this.proc = null
    this.startedAt = null
    this.bitrateKbps = 0
    this.fps = 0
    this.recording = false
    this.droppedChunks = 0
    this.statuses.clear()
    this.recordStream?.end()
    this.recordStream = null
    this.emitStats()
  }
}
