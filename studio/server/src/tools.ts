/*
 * Creator tools backed by ffmpeg.
 *
 * Each job: accept an upload, run one ffmpeg invocation, stream the result back,
 * then clean up. Nothing is retained on disk beyond the request.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync, statSync, createReadStream } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import express, { type Request, type Response } from 'express'
import multer from 'multer'

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg'
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe'

/** 512 MB ceiling - well past any reasonable clip, short of exhausting disk. */
const MAX_UPLOAD = 512 * 1024 * 1024

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, mkdtempSync(path.join(tmpdir(), 'tools-in-'))),
    filename: (_req, file, cb) => cb(null, `input${path.extname(file.originalname) || ''}`),
  }),
  limits: { fileSize: MAX_UPLOAD },
})

export type ToolId =
  | 'video-converter'
  | 'audio-converter'
  | 'remove-audio'
  | 'audio-extractor'

interface ToolSpec {
  /** ffmpeg args after the input, before the output path. */
  args: (format: string) => string[]
  /** Allowed output formats, first is the default. */
  formats: string[]
  ext: (format: string) => string
  mime: (format: string) => string
}

const TOOLS: Record<ToolId, ToolSpec> = {
  'video-converter': {
    formats: ['mp4', 'webm'],
    ext: (f) => f,
    mime: (f) => (f === 'webm' ? 'video/webm' : 'video/mp4'),
    args: (f) =>
      f === 'webm'
        ? ['-c:v', 'libvpx-vp9', '-b:v', '2M', '-deadline', 'good', '-cpu-used', '4',
           '-c:a', 'libopus', '-b:a', '128k']
        : ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart'],
  },
  'audio-converter': {
    formats: ['mp3', 'wav'],
    ext: (f) => f,
    mime: (f) => (f === 'wav' ? 'audio/wav' : 'audio/mpeg'),
    args: (f) =>
      f === 'wav'
        ? ['-vn', '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2']
        : ['-vn', '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100'],
  },
  'remove-audio': {
    formats: ['mp4'],
    ext: () => 'mp4',
    mime: () => 'video/mp4',
    /* Copy the video stream untouched so this is fast and lossless. */
    args: () => ['-c:v', 'copy', '-an', '-movflags', '+faststart'],
  },
  'audio-extractor': {
    formats: ['mp3', 'wav', 'aac'],
    ext: (f) => f,
    mime: (f) => (f === 'wav' ? 'audio/wav' : f === 'aac' ? 'audio/aac' : 'audio/mpeg'),
    args: (f) =>
      f === 'wav'
        ? ['-vn', '-c:a', 'pcm_s16le']
        : f === 'aac'
          ? ['-vn', '-c:a', 'aac', '-b:a', '192k']
          : ['-vn', '-c:a', 'libmp3lame', '-b:a', '192k'],
  },
}

function run(cmd: string, args: string[]): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    const p = spawn(cmd, args)
    let stderr = ''
    p.stderr.setEncoding('utf8')
    p.stderr.on('data', (d: string) => {
      stderr += d
      if (stderr.length > 64_000) stderr = stderr.slice(-32_000)
    })
    p.on('error', () => resolve({ code: -1, stderr: `${cmd} not found` }))
    p.on('close', (code) => resolve({ code: code ?? -1, stderr }))
  })
}

export function toolsRouter() {
  const router = express.Router()

  router.get('/tools', (_req, res) => {
    res.json({
      ffmpeg: FFMPEG,
      tools: Object.entries(TOOLS).map(([id, spec]) => ({
        id,
        formats: spec.formats,
        maxUploadBytes: MAX_UPLOAD,
      })),
    })
  })

  /** Probe a media file without converting it. */
  router.post('/tools/probe', upload.single('file'), async (req: Request, res: Response) => {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'file is required' })
    const dir = path.dirname(file.path)
    try {
      const { code, stderr } = await run(FFPROBE, [
        '-v', 'error', '-show_format', '-show_streams', '-of', 'json', file.path,
      ])
      if (code !== 0) return res.status(422).json({ error: 'Could not read this file', detail: stderr.slice(-400) })
      /* ffprobe writes JSON to stdout; re-run capturing stdout properly. */
      const probe = await new Promise<string>((resolve) => {
        const p = spawn(FFPROBE, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file.path])
        let out = ''
        p.stdout.setEncoding('utf8')
        p.stdout.on('data', (d: string) => (out += d))
        p.on('close', () => resolve(out))
        p.on('error', () => resolve('{}'))
      })
      res.type('application/json').send(probe || '{}')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  /** Convert an upload and stream the result back as a download. */
  router.post('/tools/:tool', upload.single('file'), async (req: Request, res: Response) => {
    const toolId = req.params.tool as ToolId
    const spec = TOOLS[toolId]
    if (!spec) return res.status(404).json({ error: `Unknown tool: ${req.params.tool}` })

    const file = req.file
    if (!file) return res.status(400).json({ error: 'file is required' })

    const inDir = path.dirname(file.path)
    const format = String(req.body?.format ?? spec.formats[0])
    if (!spec.formats.includes(format)) {
      rmSync(inDir, { recursive: true, force: true })
      return res.status(400).json({ error: `format must be one of: ${spec.formats.join(', ')}` })
    }

    const outDir = mkdtempSync(path.join(tmpdir(), 'tools-out-'))
    const outPath = path.join(outDir, `output.${spec.ext(format)}`)

    const cleanup = () => {
      rmSync(inDir, { recursive: true, force: true })
      rmSync(outDir, { recursive: true, force: true })
    }

    try {
      const { code, stderr } = await run(FFMPEG, [
        '-hide_banner', '-loglevel', 'error', '-y',
        '-i', file.path,
        ...spec.args(format),
        outPath,
      ])

      if (code !== 0 || !existsSync(outPath) || statSync(outPath).size === 0) {
        cleanup()
        return res.status(422).json({
          error: 'Conversion failed. The file may be corrupt or in an unsupported format.',
          detail: stderr.split('\n').filter(Boolean).slice(-4).join('\n'),
        })
      }

      const base = path.basename(file.originalname ?? 'output', path.extname(file.originalname ?? ''))
      res.setHeader('Content-Type', spec.mime(format))
      res.setHeader('Content-Length', String(statSync(outPath).size))
      res.setHeader('Content-Disposition', `attachment; filename="${base}.${spec.ext(format)}"`)

      const stream = createReadStream(outPath)
      stream.pipe(res)
      stream.on('close', cleanup)
      stream.on('error', cleanup)
    } catch (err) {
      cleanup()
      res.status(500).json({ error: (err as Error).message })
    }
  })

  return router
}
