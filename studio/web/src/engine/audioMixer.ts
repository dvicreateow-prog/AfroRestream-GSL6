/*
 * Audio mixer.
 *
 * Constants mirror the shipped mixer (TOOLS-03-audio.md):
 *   gain range MIN 0 / DEFAULT 1 / MAX 1.5, background music default 0.5
 *   music ducking divisor 6
 *   metering range -60..0 dBFS, "loud" threshold -36 dBFS (0.4 normalised)
 *
 * Restream meters via an AudioWorklet ("volumeMeter", block RMS -> dBFS with instant
 * attack and one-pole release). We do the same, with an AnalyserNode fallback for
 * browsers where addModule fails.
 */

export const GAIN = { MIN: 0, DEFAULT: 1, MAX: 1.5, MUSIC_DEFAULT: 0.5 } as const
export const DUCK_DIVISOR = 6
export const MIN_DB = -60
export const LOUD_THRESHOLD = 0.4

const WORKLET_SOURCE = `
class VolumeMeterWorklet extends AudioWorkletProcessor {
  constructor() {
    super()
    this.db = ${MIN_DB}
    this.smoothing = 0.85
    this.frames = 0
    this.interval = Math.round(sampleRate / 24)
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0]
    if (!ch) return true
    let sum = 0
    for (let i = 0; i < ch.length; i++) sum += ch[i] * ch[i]
    const rms = Math.sqrt(sum / ch.length) + 1e-10
    const db = Math.max(${MIN_DB}, 20 * Math.log10(rms))
    // instant attack, smoothed release
    this.db = db > this.db ? db : this.db * this.smoothing + db * (1 - this.smoothing)
    this.frames += ch.length
    if (this.frames >= this.interval) {
      this.frames = 0
      this.port.postMessage(this.db)
    }
    return true
  }
}
registerProcessor('volumeMeter', VolumeMeterWorklet)
`

export interface MixerSource {
  id: string
  stream: MediaStream
  gain: number
  muted: boolean
  solo: boolean
  /** Background music ducks when any non-music source is loud. */
  isMusic?: boolean
}

interface Node_ {
  source: MediaStreamAudioSourceNode
  gain: GainNode
  meter?: AudioWorkletNode | AnalyserNode
  analyserBuf?: Float32Array<ArrayBuffer>
  level: number
  cfg: MixerSource
}

export class AudioMixer {
  private ctx: AudioContext
  private dest: MediaStreamAudioDestinationNode
  private nodes = new Map<string, Node_>()
  private workletReady: Promise<boolean>
  private onLevels?: (levels: Record<string, number>) => void
  private levelTimer = 0

  constructor() {
    this.ctx = new AudioContext()
    this.dest = this.ctx.createMediaStreamDestination()
    this.workletReady = this.loadWorklet()
  }

  private async loadWorklet(): Promise<boolean> {
    try {
      const blob = new Blob([WORKLET_SOURCE], { type: 'application/javascript' })
      const url = URL.createObjectURL(blob)
      await this.ctx.audioWorklet.addModule(url)
      URL.revokeObjectURL(url)
      return true
    } catch {
      return false
    }
  }

  get stream(): MediaStream {
    return this.dest.stream
  }

  get context(): AudioContext {
    return this.ctx
  }

  async resume() {
    if (this.ctx.state === 'suspended') await this.ctx.resume()
  }

  async addSource(cfg: MixerSource) {
    if (this.nodes.has(cfg.id)) this.removeSource(cfg.id)
    if (cfg.stream.getAudioTracks().length === 0) return

    const source = this.ctx.createMediaStreamSource(cfg.stream)
    const gain = this.ctx.createGain()
    gain.gain.value = cfg.muted ? 0 : cfg.gain

    source.connect(gain)
    gain.connect(this.dest)

    const node: Node_ = { source, gain, level: MIN_DB, cfg }

    if (await this.workletReady) {
      try {
        const meter = new AudioWorkletNode(this.ctx, 'volumeMeter', { numberOfInputs: 1 })
        meter.port.onmessage = (e) => {
          node.level = e.data as number
        }
        source.connect(meter)
        node.meter = meter
      } catch {
        this.attachAnalyser(node)
      }
    } else {
      this.attachAnalyser(node)
    }

    this.nodes.set(cfg.id, node)
    this.applyMix()
  }

  private attachAnalyser(node: Node_) {
    const an = this.ctx.createAnalyser()
    an.fftSize = 512
    an.smoothingTimeConstant = 0.1
    node.source.connect(an)
    node.meter = an
    node.analyserBuf = new Float32Array(new ArrayBuffer(an.fftSize * 4))
  }

  removeSource(id: string) {
    const n = this.nodes.get(id)
    if (!n) return
    try {
      n.source.disconnect()
      n.gain.disconnect()
      n.meter?.disconnect()
    } catch {
      /* already torn down */
    }
    this.nodes.delete(id)
    this.applyMix()
  }

  setGain(id: string, gain: number) {
    const n = this.nodes.get(id)
    if (!n) return
    n.cfg.gain = Math.min(GAIN.MAX, Math.max(GAIN.MIN, gain))
    this.applyMix()
  }

  setMuted(id: string, muted: boolean) {
    const n = this.nodes.get(id)
    if (!n) return
    n.cfg.muted = muted
    this.applyMix()
  }

  setSolo(id: string, solo: boolean) {
    for (const [nid, n] of this.nodes) n.cfg.solo = solo && nid === id
    this.applyMix()
  }

  /** Recompute every gain from mute / solo / ducking state. */
  private applyMix() {
    const anySolo = [...this.nodes.values()].some((n) => n.cfg.solo)
    const speechLoud = [...this.nodes.values()].some(
      (n) => !n.cfg.isMusic && !n.cfg.muted && this.normalised(n.level) > LOUD_THRESHOLD,
    )

    for (const n of this.nodes.values()) {
      let g = n.cfg.muted ? 0 : n.cfg.gain
      if (anySolo && !n.cfg.solo) g = 0
      if (n.cfg.isMusic && speechLoud) g = g / DUCK_DIVISOR
      n.gain.gain.value = g
    }
  }

  private normalised(db: number) {
    return Math.min(1, Math.max(0, (db - MIN_DB) / (0 - MIN_DB)))
  }

  /** Subscribe to normalised 0..1 levels per source, ~24 Hz. */
  onLevelUpdate(cb: (levels: Record<string, number>) => void) {
    this.onLevels = cb
    if (this.levelTimer) return
    this.levelTimer = window.setInterval(() => {
      const out: Record<string, number> = {}
      for (const [id, n] of this.nodes) {
        if (n.meter instanceof AnalyserNode && n.analyserBuf) {
          n.meter.getFloatTimeDomainData(n.analyserBuf)
          let sum = 0
          for (let i = 0; i < n.analyserBuf.length; i++) {
            sum += n.analyserBuf[i] * n.analyserBuf[i]
          }
          const rms = Math.sqrt(sum / n.analyserBuf.length) + 1e-10
          n.level = Math.max(MIN_DB, 20 * Math.log10(rms))
        }
        out[id] = this.normalised(n.level)
      }
      /* Ducking depends on live levels, so re-evaluate as they arrive. */
      this.applyMix()
      this.onLevels?.(out)
    }, 1000 / 24)
  }

  dispose() {
    if (this.levelTimer) clearInterval(this.levelTimer)
    this.levelTimer = 0
    for (const id of [...this.nodes.keys()]) this.removeSource(id)
    void this.ctx.close()
  }
}
