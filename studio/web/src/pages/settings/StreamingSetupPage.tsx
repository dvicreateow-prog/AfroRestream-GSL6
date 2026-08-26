/*
 * Streaming setup: the ingest endpoint and key an external encoder (OBS, vMix,
 * a hardware encoder) uses to push into this server.
 * Backed by GET /api/stream-key and GET /api/ingest-servers.
 */
import { useCallback, useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'
import {
  Badge, Button, Card, Field, PageHeader, SecretField, Select, Toggle,
} from '../../components/ui'
import { api } from '../../lib/api'

interface Region {
  id: string
  label: string
  host: string
}

interface KeyInfo {
  region: string
  rtmpUrl: string
  rtmpsUrl: string
  srtUrl: string
  streamKey: string
}

type Protocol = 'rtmp' | 'rtmps' | 'srt'

const PRESETS = [
  { label: '1080p 30 fps', res: '1920×1080', fps: 30, kbps: 12000, keyframe: 2 },
  { label: '720p 60 fps', res: '1280×720', fps: 60, kbps: 4000, keyframe: 2 },
  { label: '720p 30 fps', res: '1280×720', fps: 30, kbps: 3500, keyframe: 2 },
  { label: '480p 30 fps', res: '854×480', fps: 30, kbps: 1900, keyframe: 2 },
]

export function StreamingSetupPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [region, setRegion] = useState('')
  const [info, setInfo] = useState<KeyInfo | null>(null)
  const [protocol, setProtocol] = useState<Protocol>('rtmp')
  const [autoRecord, setAutoRecord] = useState(true)
  const [lowLatency, setLowLatency] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const load = useCallback(async (regionId: string) => {
    setError('')
    try {
      const q = regionId ? `?region=${encodeURIComponent(regionId)}` : ''
      const res = await fetch(api(`/api/stream-key${q}`))
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setInfo(await res.json())
    } catch (e) {
      setError(`Could not load your stream key: ${(e as Error).message}`)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(api('/api/ingest-servers'))
        if (!res.ok) throw new Error(`Server returned ${res.status}`)
        const list: Region[] = await res.json()
        setRegions(list)
        setRegion(list[0]?.id ?? '')
        await load(list[0]?.id ?? '')
      } catch (e) {
        setError(`Could not reach the server: ${(e as Error).message}`)
      }
    })()
  }, [load])

  const reset = async () => {
    try {
      await fetch(api('/api/stream-key/reset'), { method: 'POST' })
      await load(region)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(''), 1600)
    } catch {
      /* clipboard unavailable; the field is selectable */
    }
  }

  const url =
    info && (protocol === 'rtmps' ? info.rtmpsUrl : protocol === 'srt' ? info.srtUrl : info.rtmpUrl)

  return (
    <>
      <PageHeader
        title="Streaming setup"
        description="Point OBS, vMix or any hardware encoder at this endpoint to push a stream into your workspace."
      />

      {error && (
        <div style={{ marginBottom: 18 }}>
          <Card>
            <p style={{ margin: 0, color: 'var(--c-red)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Icon name="warning" size={16} />
              {error}
            </p>
          </Card>
        </div>
      )}

      <div className="ui-stack">
        <Card
          title="Ingest endpoint"
          description="Keep your key private — anyone holding it can stream to your workspace."
          actions={<Badge tone="brand">{protocol.toUpperCase()}</Badge>}
        >
          <div className="ui-grid ui-grid--2">
            <Field label="Ingest region" hint="Pick the region closest to you for the lowest latency.">
              <Select
                value={region}
                onChange={(v) => {
                  setRegion(v)
                  void load(v)
                }}
                options={regions.map((r) => ({ value: r.id, label: r.label }))}
              />
            </Field>

            <Field label="Protocol" hint="SRT tolerates lossy networks better than RTMP.">
              <Select
                value={protocol}
                onChange={(v) => setProtocol(v as Protocol)}
                options={[
                  { value: 'rtmp', label: 'RTMP' },
                  { value: 'rtmps', label: 'RTMPS (encrypted)' },
                  { value: 'srt', label: 'SRT' },
                ]}
              />
            </Field>
          </div>

          <Field label="Server URL">
            <div className="ui-row" style={{ flexWrap: 'nowrap' }}>
              <input className="ui-input" readOnly value={url ?? 'Loading…'} onFocus={(e) => e.currentTarget.select()} />
              <Button size="sm" variant="ghost" onClick={() => url && copy(url, 'url')}>
                <Icon name={copied === 'url' ? 'check' : 'copy'} size={15} />
                {copied === 'url' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </Field>

          <SecretField
            label="Stream key"
            value={info?.streamKey ?? ''}
            hint="Resetting the key immediately disconnects any encoder using the old one."
            onRegenerate={reset}
          />
        </Card>

        <Card title="Ingest options">
          <Toggle
            checked={autoRecord}
            onChange={setAutoRecord}
            label="Record incoming streams"
            hint="Save a local MP4 whenever an encoder connects."
          />
          <Toggle
            checked={lowLatency}
            onChange={setLowLatency}
            label="Low-latency mode"
            hint="Shrinks the buffer for faster interaction, at the cost of resilience on unstable networks."
          />
        </Card>

        <Card
          title="Encoder presets"
          description="Match one of these in your encoder. Keyframe interval should be 2 seconds for every preset."
        >
          <div className="ui-list">
            {PRESETS.map((p) => (
              <div className="ui-list__item" key={p.label}>
                <div className="ui-list__grow">
                  <div className="ui-list__title">{p.label}</div>
                  <div className="ui-list__sub">
                    {p.res} · {p.fps} fps · keyframe every {p.keyframe}s
                  </div>
                </div>
                <Badge tone="neutral">{(p.kbps / 1000).toFixed(1)} Mbps</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    copy(
                      `Resolution ${p.res}\nFrame rate ${p.fps}\nBitrate ${p.kbps} kbps\nKeyframe ${p.keyframe}s`,
                      p.label,
                    )
                  }
                >
                  <Icon name={copied === p.label ? 'check' : 'copy'} size={15} />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Push from ffmpeg" description="A quick way to verify the endpoint without opening an encoder.">
          <pre className="ui-code">
{`ffmpeg -re -i input.mp4 \\
  -c:v libx264 -preset veryfast -b:v 3500k \\
  -pix_fmt yuv420p -g 60 \\
  -c:a aac -b:a 160k -ar 48000 \\
  -f flv "${url ?? 'rtmp://…'}/${info?.streamKey ?? 'YOUR_KEY'}"`}
          </pre>
        </Card>
      </div>
    </>
  )
}
