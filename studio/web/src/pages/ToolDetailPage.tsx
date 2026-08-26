/*
 * Individual tool implementations.
 *
 * Device tests run entirely in the browser. Conversions POST to the ffmpeg-backed
 * /api/tools/:tool endpoint and stream the result straight back as a download.
 * Tools that need an external provider (STT, LLM) say so plainly rather than faking it.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import {
  Badge, Button, Card, EmptyState, Field, Meter, PageHeader, Select, Stat,
} from '../components/ui'
import { TOOLS } from './ToolsPage'
import { api } from '../lib/api'

/* ------------------------------------------------------------------ */
/* Camera test                                                         */
/* ------------------------------------------------------------------ */

function CameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState<{ w: number; h: number; fps: number; label: string } | null>(null)
  const [on, setOn] = useState(false)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setOn(false)
    setInfo(null)
  }, [])

  const start = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      const track = stream.getVideoTracks()[0]
      const s = track.getSettings()
      setInfo({
        w: s.width ?? 0,
        h: s.height ?? 0,
        fps: Math.round(s.frameRate ?? 0),
        label: track.label || 'Camera',
      })
      setOn(true)
      /* Labels are only populated once permission is granted. */
      setDevices((await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput'))
    } catch (e) {
      setError((e as Error).message || 'Could not access the camera')
      setOn(false)
    }
  }, [deviceId])

  useEffect(() => stop, [stop])

  return (
    <div className="ui-stack">
      <Card title="Preview">
        <div
          style={{
            aspectRatio: '16 / 9', background: 'var(--c-void)',
            borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative',
            display: 'grid', placeItems: 'center',
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: on ? 'block' : 'none' }}
          />
          {!on && (
            <div style={{ textAlign: 'center', color: 'var(--c-text-mute)' }}>
              <Icon name="cam" size={30} style={{ margin: '0 auto 8px' }} />
              <div>Camera preview appears here</div>
            </div>
          )}
        </div>

        <div className="ui-row" style={{ marginTop: 16 }}>
          {on ? (
            <Button variant="danger" icon="camOff" onClick={stop}>Stop camera</Button>
          ) : (
            <Button variant="primary" icon="cam" onClick={start}>Start camera</Button>
          )}
          {devices.length > 1 && (
            <div style={{ minWidth: 240 }}>
              <Select
                value={deviceId}
                onChange={(v) => setDeviceId(v)}
                options={[
                  { value: '', label: 'Default camera' },
                  ...devices.map((d) => ({ value: d.deviceId, label: d.label || 'Camera' })),
                ]}
              />
            </div>
          )}
        </div>

        {error && <p style={{ color: 'var(--c-red)', marginTop: 12 }}>{error}</p>}
      </Card>

      {info && (
        <Card title="Detected">
          <div className="ui-grid ui-grid--3">
            <Stat label="Resolution" value={`${info.w} × ${info.h}`} />
            <Stat label="Frame rate" value={`${info.fps} fps`} />
            <Stat label="Device" value={<span style={{ fontSize: 15 }}>{info.label}</span>} />
          </div>
        </Card>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mic test                                                            */
/* ------------------------------------------------------------------ */

function MicTest() {
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef(0)
  const streamRef = useRef<MediaStream | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState('')
  const [level, setLevel] = useState(0)
  const [peak, setPeak] = useState(0)
  const [on, setOn] = useState(false)
  const [error, setError] = useState('')

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    void ctxRef.current?.close()
    ctxRef.current = null
    setOn(false)
    setLevel(0)
  }, [])

  const start = useCallback(async () => {
    setError('')
    setPeak(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      })
      streamRef.current = stream
      const ctx = new AudioContext()
      ctxRef.current = ctx
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.1
      src.connect(analyser)

      const buf = new Float32Array(new ArrayBuffer(analyser.fftSize * 4))
      const tick = () => {
        analyser.getFloatTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
        const rms = Math.sqrt(sum / buf.length) + 1e-10
        /* -60..0 dBFS normalised, matching the studio meter. */
        const db = Math.max(-60, 20 * Math.log10(rms))
        const norm = (db + 60) / 60
        setLevel(norm)
        setPeak((p) => Math.max(p, norm))
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
      setOn(true)
      setDevices((await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput'))
    } catch (e) {
      setError((e as Error).message || 'Could not access the microphone')
    }
  }, [deviceId])

  useEffect(() => stop, [stop])

  const tone = level > 0.85 ? 'var(--c-red)' : level > 0.6 ? 'var(--c-yellow)' : 'var(--c-green)'

  return (
    <div className="ui-stack">
      <Card title="Input level" description="Speak normally — aim for the green band, peaking below red.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Meter value={level} tone={tone} />
          <div className="ui-grid ui-grid--3">
            <Stat label="Current" value={`${Math.round(level * 100)}%`} />
            <Stat label="Peak" value={`${Math.round(peak * 100)}%`} tone={peak > 0.95 ? 'danger' : 'success'} />
            <Stat label="Status" value={on ? (peak > 0.02 ? 'Signal detected' : 'Silent') : 'Idle'} />
          </div>
        </div>

        <div className="ui-row" style={{ marginTop: 16 }}>
          {on ? (
            <Button variant="danger" icon="micOff" onClick={stop}>Stop</Button>
          ) : (
            <Button variant="primary" icon="mic" onClick={start}>Start mic test</Button>
          )}
          {devices.length > 1 && (
            <div style={{ minWidth: 240 }}>
              <Select
                value={deviceId}
                onChange={(v) => setDeviceId(v)}
                options={[
                  { value: '', label: 'Default microphone' },
                  ...devices.map((d) => ({ value: d.deviceId, label: d.label || 'Microphone' })),
                ]}
              />
            </div>
          )}
        </div>
        {error && <p style={{ color: 'var(--c-red)', marginTop: 12 }}>{error}</p>}
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ffmpeg-backed conversion                                            */
/* ------------------------------------------------------------------ */

const CONVERT: Record<string, { endpoint: string; formats: string[]; accept: string; verb: string }> = {
  'video-converter': { endpoint: 'video-converter', formats: ['mp4', 'webm'], accept: 'video/*', verb: 'Convert video' },
  'audio-converter': { endpoint: 'audio-converter', formats: ['mp3', 'wav'], accept: 'audio/*', verb: 'Convert audio' },
  'remove-audio': { endpoint: 'remove-audio', formats: ['mp4'], accept: 'video/*', verb: 'Remove audio' },
  'audio-extractor': { endpoint: 'audio-extractor', formats: ['mp3', 'wav', 'aac'], accept: 'video/*', verb: 'Extract audio' },
}

function ConvertTool({ slug }: { slug: string }) {
  const cfg = CONVERT[slug]
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState(cfg.formats[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    setDone('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('format', format)
      const res = await fetch(api(`/api/tools/${cfg.endpoint}`), { method: 'POST', body })
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: `Request failed (${res.status})` }))
        throw new Error(j.detail ? `${j.error}\n${j.detail}` : j.error)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file.name.replace(/\.[^.]+$/, '')}.${format}`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      setDone(`Saved ${a.download} (${(blob.size / 1024 / 1024).toFixed(1)} MB)`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const mb = file ? (file.size / 1024 / 1024).toFixed(1) : null

  return (
    <Card title="Choose a file" description="Processing runs on your own server. Files are deleted immediately after conversion.">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f) setFile(f)
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '1.5px dashed var(--c-line)', borderRadius: 'var(--r-xl)',
          padding: '34px 20px', textAlign: 'center', cursor: 'pointer',
          background: 'var(--c-surface)',
        }}
      >
        <Icon name="upload" size={26} style={{ margin: '0 auto 10px', color: 'var(--c-text-dim)' }} />
        {file ? (
          <>
            <div style={{ fontWeight: 500 }}>{file.name}</div>
            <div style={{ color: 'var(--c-text-mute)', fontSize: 12, marginTop: 4 }}>{mb} MB — click to replace</div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 500 }}>Drop a file here, or click to browse</div>
            <div style={{ color: 'var(--c-text-mute)', fontSize: 12, marginTop: 4 }}>Up to 512 MB</div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={cfg.accept}
          hidden
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="ui-row" style={{ marginTop: 18 }}>
        {cfg.formats.length > 1 && (
          <div style={{ minWidth: 160 }}>
            <Field label="Output format">
              <Select
                value={format}
                onChange={(v) => setFormat(v)}
                options={cfg.formats.map((f) => ({ value: f, label: f.toUpperCase() }))}
              />
            </Field>
          </div>
        )}
        <Button variant="primary" size="lg" onClick={submit} disabled={!file} loading={busy} icon="refresh">
          {busy ? 'Processing…' : cfg.verb}
        </Button>
      </div>

      {error && (
        <pre className="ui-code" style={{ marginTop: 14, color: 'var(--c-red)', whiteSpace: 'pre-wrap' }}>{error}</pre>
      )}
      {done && (
        <p style={{ marginTop: 14, color: 'var(--c-green)', display: 'flex', alignItems: 'center', gap: 7 }}>
          <Icon name="check" size={16} />
          {done}
        </p>
      )}
    </Card>
  )
}

/* ------------------------------------------------------------------ */

function NeedsProvider({ name }: { name: string }) {
  return (
    <Card>
      <EmptyState
        icon="lock"
        title={`${name} needs a provider`}
        description="This tool depends on an external speech-to-text or language model service. Connect a provider in settings and it will light up here — nothing is stubbed or faked."
        action={<Button variant="secondary" icon="settings">Configure providers</Button>}
      />
    </Card>
  )
}

export function ToolDetailPage() {
  const { slug = '' } = useParams()
  const tool = TOOLS.find((t) => t.slug === slug)

  if (!tool) {
    return (
      <>
        <PageHeader title="Tool not found" />
        <Card>
          <EmptyState
            icon="warning"
            title="No such tool"
            description="That tool does not exist or has been renamed."
            action={<Link to="/tools"><Button variant="primary">Back to tools</Button></Link>}
          />
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={tool.name}
        description={tool.blurb}
        actions={
          <Link to="/tools">
            <Button variant="ghost" icon="chevronLeft">All tools</Button>
          </Link>
        }
      />
      <div style={{ marginBottom: 18 }}>
        <Badge tone={tool.status === 'ready' ? 'success' : 'warning'}>
          {tool.status === 'ready' ? 'Ready to use' : 'Needs a provider'}
        </Badge>
      </div>

      {slug === 'webcam-test' && <CameraTest />}
      {slug === 'mic-test' && <MicTest />}
      {CONVERT[slug] && <ConvertTool slug={slug} />}
      {tool.status === 'needs-provider' && <NeedsProvider name={tool.name} />}
    </>
  )
}
