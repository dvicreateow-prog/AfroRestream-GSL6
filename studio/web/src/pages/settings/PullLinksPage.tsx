import { useState } from 'react'
import {
  Button, Card, PageHeader, Field, Input, Select, Toggle, Badge, EmptyState,
} from '../../components/ui'

type Protocol = 'HLS' | 'RTMP' | 'SRT'

type PullLink = {
  id: string
  name: string
  protocol: Protocol
  url: string
  auth: boolean
}

const PROTOCOLS: { value: Protocol; label: string }[] = [
  { value: 'HLS', label: 'HLS (.m3u8)' },
  { value: 'RTMP', label: 'RTMP' },
  { value: 'SRT', label: 'SRT' },
]

const TONES: Record<Protocol, 'info' | 'brand' | 'success'> = {
  HLS: 'info',
  RTMP: 'brand',
  SRT: 'success',
}

const SEED: PullLink[] = [
  {
    id: 'pl_1',
    name: 'Main show - HLS',
    protocol: 'HLS',
    url: 'https://pull.livestudio.io/live/main-show/index.m3u8',
    auth: false,
  },
  {
    id: 'pl_2',
    name: 'Partner network feed',
    protocol: 'RTMP',
    url: 'rtmp://pull.livestudio.io/live/partner-feed?token=a91f3c',
    auth: true,
  },
  {
    id: 'pl_3',
    name: 'Low latency backup',
    protocol: 'SRT',
    url: 'srt://pull.livestudio.io:9000?streamid=backup-01&latency=200',
    auth: true,
  },
]

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return slug || 'untitled-link'
}

function buildUrl(protocol: Protocol, name: string, auth: boolean): string {
  const slug = slugify(name)
  const token = Math.random().toString(16).slice(2, 8)
  if (protocol === 'HLS') {
    return `https://pull.livestudio.io/live/${slug}/index.m3u8${auth ? `?token=${token}` : ''}`
  }
  if (protocol === 'RTMP') {
    return `rtmp://pull.livestudio.io/live/${slug}${auth ? `?token=${token}` : ''}`
  }
  return `srt://pull.livestudio.io:9000?streamid=${slug}${auth ? `&passphrase=${token}` : ''}&latency=200`
}

const FFMPEG_EXAMPLE = `# Pull a live HLS feed and re-publish it to another destination
ffmpeg -re \\
  -i "https://pull.livestudio.io/live/main-show/index.m3u8" \\
  -c:v copy -c:a aac -b:a 160k \\
  -f flv "rtmp://your-destination.example/live/STREAM_KEY"

# Quick check: read one segment and print the stream layout
ffprobe -hide_banner "https://pull.livestudio.io/live/main-show/index.m3u8"`

export function PullLinksPage() {
  const [links, setLinks] = useState<PullLink[]>(SEED)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [protocol, setProtocol] = useState<Protocol>('HLS')
  const [auth, setAuth] = useState(true)

  const copy = (link: PullLink) => {
    void navigator.clipboard?.writeText(link.url)
    setCopiedId(link.id)
    window.setTimeout(() => setCopiedId((current) => (current === link.id ? null : current)), 1500)
  }

  const remove = (id: string) => setLinks((current) => current.filter((link) => link.id !== id))

  const resetForm = () => {
    setCreating(false)
    setName('')
    setProtocol('HLS')
    setAuth(true)
  }

  const create = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setLinks((current) => [
      ...current,
      {
        id: `pl_${Date.now()}`,
        name: trimmed,
        protocol,
        url: buildUrl(protocol, trimmed, auth),
        auth,
      },
    ])
    resetForm()
  }

  return (
    <div className="ui-stack">
      <PageHeader
        title="Pull links"
        description="Publish a readable endpoint so another platform, encoder, or partner can pull your live output instead of you pushing a separate stream to them."
        actions={
          <Button icon="plus" onClick={() => setCreating((open) => !open)}>
            Create pull link
          </Button>
        }
      />

      {creating && (
        <Card title="New pull link" description="The endpoint is generated as soon as you create it.">
          <div className="ui-stack">
            <div className="ui-grid ui-grid--2">
              <Field label="Name" hint="Shown only to your team.">
                <Input
                  value={name}
                  placeholder="Weekly broadcast"
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field label="Protocol" hint="HLS is the most compatible; SRT is the lowest latency.">
                <Select
                  value={protocol}
                  onChange={(v) => setProtocol(v as Protocol)}
                  options={PROTOCOLS}
                />
              </Field>
            </div>
            <Toggle
              checked={auth}
              onChange={(value: boolean) => setAuth(value)}
              label="Require authentication"
              hint="Adds a rotating token to the endpoint so only recipients you share it with can connect."
            />
            <div className="ui-row">
              <Button onClick={create} disabled={!name.trim()}>
                Create link
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card title="Your pull links" description="Anyone with one of these URLs can watch or restream the feed while you are live.">
        {links.length === 0 ? (
          <EmptyState
            icon="link"
            title="No pull links yet"
            description="Create a link to hand a partner a URL they can pull from during your next broadcast."
            action={<Button icon="plus" onClick={() => setCreating(true)}>Create pull link</Button>}
          />
        ) : (
          <ul className="ui-list">
            {links.map((link) => (
              <li className="ui-list__item" key={link.id}>
                <div className="ui-list__grow" style={{ minWidth: 0 }}>
                  <div className="ui-row" style={{ gap: 'var(--sp-sm)' }}>
                    <span className="ui-list__title">{link.name}</span>
                    <Badge tone={TONES[link.protocol]}>{link.protocol}</Badge>
                    {link.auth && <Badge tone="neutral">Token</Badge>}
                  </div>
                  <span
                    className="ui-list__sub"
                    title={link.url}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                      color: 'var(--c-text-mute)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {link.url}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={copiedId === link.id ? 'check' : 'copy'}
                  onClick={() => copy(link)}
                >
                  {copiedId === link.id ? 'Copied' : 'Copy'}
                </Button>
                <Button variant="ghost" size="sm" icon="trash" onClick={() => remove(link.id)} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="How pull links work" description="A pull link inverts the usual direction of a stream hand-off.">
        <div className="ui-stack">
          <p style={{ color: 'var(--c-text-dim)', margin: 0, lineHeight: 1.6 }}>
            Normally you push a copy of your broadcast to every destination, which costs you upload
            bandwidth for each one. A pull link flips that around: we keep one live copy on our edge
            and publish an address for it. The other side connects whenever it needs the feed, so your
            encoder still sends a single stream no matter how many partners are watching.
          </p>
          <p style={{ color: 'var(--c-text-dim)', margin: 0, lineHeight: 1.6 }}>
            Links stay idle until you go live and stop serving the moment your broadcast ends. Turn on
            authentication to attach a rotating token, and delete a link to cut off access immediately.
          </p>
          <pre className="ui-code">{FFMPEG_EXAMPLE}</pre>
        </div>
      </Card>
    </div>
  )
}
