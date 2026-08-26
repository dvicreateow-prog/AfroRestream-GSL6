import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Badge, Button, Card, Field, Meter, PageHeader, Select, Stat } from '../../components/ui'
import { api } from '../../lib/api'

const REGIONS: { value: string; label: string }[] = [
  { value: 'us-east', label: 'US East - Ashburn' },
  { value: 'us-west', label: 'US West - Portland' },
  { value: 'eu-west', label: 'EU West - Amsterdam' },
  { value: 'ap-south', label: 'Asia Pacific - Singapore' },
  { value: 'sa-east', label: 'South America - Sao Paulo' },
]

const PRESETS: { label: string; kbps: number; detail: string }[] = [
  { label: '1080p 30fps', kbps: 12000, detail: 'Full HD with motion headroom' },
  { label: '720p 60fps', kbps: 4000, detail: 'Smooth motion, gaming and sport' },
  { label: '720p 30fps', kbps: 3500, detail: 'Balanced default for most shows' },
  { label: '480p 30fps', kbps: 1900, detail: 'Safe fallback on a weak link' },
]

const PAYLOAD_BYTES = 2 * 1024 * 1024
const ROUNDS = 3

type RoundResult = { round: number; ms: number; mbps: number }
type TestResult = { mbps: number; latency: number; jitter: number }

/*
 * Random bytes so nothing compresses in transit and the measurement stays honest.
 * The explicit ArrayBuffer type parameter matters: TS 5.7 types Uint8Array over
 * ArrayBufferLike, which is not assignable to BlobPart.
 */
function makePayload(bytes: number): Uint8Array<ArrayBuffer> {
  const data = new Uint8Array(bytes)
  const chunk = 65536
  for (let i = 0; i < data.length; i += chunk) {
    crypto.getRandomValues(data.subarray(i, Math.min(i + chunk, data.length)))
  }
  return data
}

export function SpeedTestPage() {
  const [region, setRegion] = useState<string>('us-east')
  const [running, setRunning] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [status, setStatus] = useState<string>('')
  const [rounds, setRounds] = useState<RoundResult[]>([])
  const [result, setResult] = useState<TestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const regionLabel = REGIONS.find((r) => r.value === region)?.label ?? region

  async function timedPost(body: BodyInit, stage: string): Promise<number> {
    const started = performance.now()
    const res = await fetch(
      api(`/api/speed-test?region=${encodeURIComponent(region)}&stage=${encodeURIComponent(stage)}`),
      {
        method: 'POST',
        cache: 'no-store',
        headers: { 'content-type': 'application/octet-stream' },
        body,
      },
    )
    if (!res.ok) throw new Error(`ingest endpoint replied ${res.status} ${res.statusText}`.trim())
    await res.arrayBuffer()
    return performance.now() - started
  }

  async function runTest(): Promise<void> {
    setRunning(true)
    setError(null)
    setResult(null)
    setRounds([])
    setProgress(0)
    setStatus(`Warming up the link to ${regionLabel}...`)

    let target = 0.1
    const timer = window.setInterval(() => {
      setProgress((p: number) => (p < target ? p + (target - p) * 0.16 + 0.002 : p))
    }, 80)

    try {
      const latency = await timedPost(new Blob([makePayload(1024)]), 'warmup')
      target = 0.2

      const payload = new Blob([makePayload(PAYLOAD_BYTES)])
      const collected: RoundResult[] = []
      for (let i = 1; i <= ROUNDS; i += 1) {
        setStatus(`Round ${i} of ${ROUNDS} - pushing 2 MB upstream...`)
        const ms = await timedPost(payload, `round-${i}`)
        const mbps = (PAYLOAD_BYTES * 8) / (ms / 1000) / 1e6
        collected.push({ round: i, ms, mbps })
        setRounds([...collected])
        target = 0.2 + i * (0.8 / ROUNDS)
      }

      const avgMbps = collected.reduce((s, r) => s + r.mbps, 0) / collected.length
      const meanMs = collected.reduce((s, r) => s + r.ms, 0) / collected.length
      const jitter = Math.sqrt(
        collected.reduce((s, r) => s + (r.ms - meanMs) ** 2, 0) / collected.length,
      )

      setResult({ mbps: avgMbps, latency, jitter })
      setProgress(1)
      setStatus(`Finished ${ROUNDS} rounds against ${regionLabel}.`)
    } catch (e) {
      setError(
        e instanceof Error
          ? `Measurement failed: ${e.message}`
          : 'Measurement failed: the upload endpoint could not be reached.',
      )
      setStatus('')
      setProgress(0)
      setRounds([])
    } finally {
      window.clearInterval(timer)
      setRunning(false)
    }
  }

  const recommendedKbps = result ? Math.round(result.mbps * 1000 * 0.6) : 0
  const meterTone = result && result.mbps < 3 ? 'var(--c-red)' : 'var(--c-green)'

  return (
    <div className="ui-stack">
      <PageHeader
        title="Speed test"
        description="Measure the real upload headroom to an ingest region before you go live, so you can pick a bitrate the connection can actually hold."
      />

      <Card
        title="Run a test"
        description="We upload a few megabytes of random data and time the round trip. Pause other uploads first for an honest reading."
      >
        <div className="ui-stack">
          <div className="ui-grid ui-grid--2">
            <Field label="Ingest region" hint="Pick the region closest to where you stream from.">
              <Select
                value={region}
                onChange={(v) => setRegion(v)}
                disabled={running}
                options={REGIONS}
              />
            </Field>
            <Field label="Test size" hint={`${ROUNDS} rounds of 2 MB plus a small latency probe.`}>
              <div className="ui-row" style={{ alignItems: 'center', minHeight: 38 }}>
                <Badge tone="info">6 MB total</Badge>
                <Badge tone="neutral">about 10 seconds</Badge>
              </div>
            </Field>
          </div>

          <Button size="lg" icon="signal" loading={running} onClick={() => void runTest()}>
            {running ? 'Testing...' : 'Start test'}
          </Button>

          {(running || progress > 0) && (
            <div className="ui-stack" style={{ gap: 'var(--sp-sm)' }}>
              <Meter value={progress} tone={meterTone} />
              {status && <span style={{ color: 'var(--c-text-dim)', fontSize: 13 }}>{status}</span>}
            </div>
          )}

          {error && (
            <div
              className="ui-row"
              style={{
                gap: 'var(--sp-sm)',
                alignItems: 'flex-start',
                padding: 'var(--sp-md)',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--c-red)',
                background: 'var(--c-surface)',
                color: 'var(--c-text)',
              }}
            >
              <Icon name="warning" size={16} />
              <span style={{ fontSize: 13 }}>
                {error} Nothing is reported for a failed run - fix the connection or the ingest
                endpoint, then test again.
              </span>
            </div>
          )}

          {rounds.length > 0 && (
            <ul className="ui-list">
              {rounds.map((r) => (
                <li key={r.round} className="ui-list__item">
                  <div className="ui-list__grow">
                    <span className="ui-list__title">Round {r.round}</span>
                    <span className="ui-list__sub">{Math.round(r.ms)} ms to send 2 MB</span>
                  </div>
                  <Badge tone={r.mbps >= 6 ? 'success' : r.mbps >= 3 ? 'warning' : 'danger'}>
                    {r.mbps.toFixed(2)} Mbps
                  </Badge>
                </li>
              ))}
            </ul>
          )}

          {result && (
            <div className="ui-grid ui-grid--3">
              <Stat
                label="Upload"
                value={`${result.mbps.toFixed(2)} Mbps`}
                sub={`Average of ${ROUNDS} rounds`}
                tone={result.mbps >= 6 ? 'success' : result.mbps < 3 ? 'danger' : undefined}
              />
              <Stat
                label="Latency"
                value={`${Math.round(result.latency)} ms`}
                sub="Warm-up round trip"
              />
              <Stat
                label="Jitter"
                value={`${result.jitter.toFixed(1)} ms`}
                sub="Spread across round timings"
              />
            </div>
          )}
        </div>
      </Card>

      {result && (
        <Card
          title="What this means"
          description={`We hold back 40 percent for spikes, so plan on about ${recommendedKbps.toLocaleString()} kbps of video and audio to ${regionLabel}.`}
        >
          <div className="ui-stack">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: 'var(--c-text-mute)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0', fontWeight: 500 }}>Preset</th>
                  <th style={{ padding: '8px 0', fontWeight: 500 }}>Needs</th>
                  <th style={{ padding: '8px 0', fontWeight: 500, textAlign: 'right' }}>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {PRESETS.map((p) => {
                  const fits = recommendedKbps >= p.kbps
                  return (
                    <tr key={p.label} style={{ borderTop: '1px solid var(--c-line)' }}>
                      <td style={{ padding: '10px 0', color: 'var(--c-text)' }}>
                        <div>{p.label}</div>
                        <div style={{ color: 'var(--c-text-mute)', fontSize: 12 }}>{p.detail}</div>
                      </td>
                      <td style={{ padding: '10px 0', color: 'var(--c-text-dim)' }}>
                        {p.kbps.toLocaleString()} kbps
                      </td>
                      <td style={{ padding: '10px 0', textAlign: 'right' }}>
                        <Badge tone={fits ? 'success' : 'danger'}>
                          {fits ? 'Fits' : 'Too heavy'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p style={{ color: 'var(--c-text-dim)', fontSize: 13, margin: 0 }}>
              Jitter above roughly 30 ms usually points at a shared or wireless link. Wire in, drop
              one rung down this list, and keep a local recording running as a backup.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
