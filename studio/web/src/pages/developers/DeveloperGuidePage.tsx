import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Button, Card, PageHeader, Badge } from '../../components/ui'

const BASE = 'http://localhost:4000'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'WS'

const METHOD_TONE: Record<Method, 'info' | 'success' | 'warning' | 'danger' | 'brand'> = {
  GET: 'info',
  POST: 'success',
  PATCH: 'warning',
  DELETE: 'danger',
  WS: 'brand',
}

type Endpoint = { method: Method; path: string; note: string }

const DESTINATION_ROUTES: Endpoint[] = [
  { method: 'GET', path: '/api/destinations', note: 'List every configured destination.' },
  { method: 'POST', path: '/api/destinations', note: 'Create one. Body: platform, name, url, streamKey, enabled.' },
  { method: 'PATCH', path: '/api/destinations/:id', note: 'Partial update — send only the fields you want changed.' },
  { method: 'DELETE', path: '/api/destinations/:id', note: 'Remove a destination. Returns 204 on success.' },
]

const BROADCAST_ROUTES: Endpoint[] = [
  { method: 'GET', path: '/api/stream/stats', note: 'Live encoder + per-destination telemetry.' },
  { method: 'POST', path: '/api/stream/start', note: 'Body: profile (480p30 | 720p30 | 720p60 | 1080p30), record (boolean).' },
  { method: 'POST', path: '/api/stream/stop', note: 'Stops the encoder and closes every destination.' },
]

const CLIENT_MESSAGES: { name: string; note: string }[] = [
  { name: 'join', note: 'Enter a room: { t:"join", roomId, name, role }.' },
  { name: 'signal', note: 'Relay an SDP offer/answer or ICE candidate to one peer.' },
  { name: 'setMedia', note: 'Publish your mic/camera/screen state to the room.' },
  { name: 'admit', note: 'Host only — move a waiting guest into the room.' },
  { name: 'deny', note: 'Host only — reject a waiting guest.' },
  { name: 'setStage', note: 'Host only — set layout and which peers are on air.' },
  { name: 'chat', note: 'Send a chat line to everyone in the room.' },
  { name: 'ping', note: 'Keep-alive. The server answers with the same sequence number.' },
]

const SERVER_MESSAGES: { name: string; note: string }[] = [
  { name: 'welcome', note: 'First frame after connect: your peerId and server capabilities.' },
  { name: 'room', note: 'Full room snapshot — peers, stage, lobby, chat backlog.' },
  { name: 'peerJoined', note: 'A peer was admitted. Start your offer from here.' },
  { name: 'peerLeft', note: 'A peer disconnected — tear down that RTCPeerConnection.' },
  { name: 'signal', note: 'A relayed SDP/ICE payload from another peer.' },
  { name: 'chat', note: 'A chat line, with author, body and timestamp.' },
  { name: 'stream', note: 'Broadcast state changed (idle, starting, live, stopping).' },
  { name: 'error', note: 'Rejected message: { t:"error", code, message }.' },
]

const HEALTH = `curl ${BASE}/api/health

{
  "ok": true,
  "uptime": 5821,
  "version": "0.4.0"
}`

const AUTH_CODE = `GET ${BASE}/oauth/authorize
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=https://your.app/callback
  &response_type=code
  &scope=destinations:read destinations:write stream:control
  &state=RANDOM_NONCE`

const AUTH_TOKEN = `curl -X POST ${BASE}/oauth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type": "authorization_code",
    "code": "AUTH_CODE_FROM_REDIRECT",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "https://your.app/callback"
  }'

{
  "access_token": "sk_live_...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "rt_...",
  "scope": "destinations:read destinations:write stream:control"
}`

const DEST_POST = `curl -X POST ${BASE}/api/destinations \\
  -H "Content-Type: application/json" \\
  -d '{
    "platform": "youtube",
    "name": "Main channel",
    "url": "rtmp://a.rtmp.youtube.com/live2",
    "streamKey": "abcd-efgh-ijkl-mnop",
    "enabled": true
  }'

{
  "id": "dst_7f2a91",
  "platform": "youtube",
  "name": "Main channel",
  "url": "rtmp://a.rtmp.youtube.com/live2",
  "streamKey": "abcd-****-****-mnop",
  "enabled": true,
  "status": "idle",
  "createdAt": "2026-08-25T09:14:02.118Z"
}`

const BROADCAST_CURL = `# start
curl -X POST ${BASE}/api/stream/start \\
  -H "Content-Type: application/json" \\
  -d '{ "profile": "1080p30", "record": true }'

# stop
curl -X POST ${BASE}/api/stream/stop`

const STATS = `curl ${BASE}/api/stream/stats

{
  "live": true,
  "profile": "1080p30",
  "recording": true,
  "uptimeMs": 742000,
  "bitrateKbps": 5820,
  "fps": 29.97,
  "droppedFrames": 4,
  "destinations": [
    { "id": "dst_7f2a91", "status": "live", "bitrateKbps": 5810, "retries": 0 },
    { "id": "dst_11c4d0", "status": "reconnecting", "bitrateKbps": 0, "retries": 2 }
  ]
}`

const INGEST = `const ws = new WebSocket('ws://localhost:4000/ws/ingest')
ws.binaryType = 'arraybuffer'

ws.onopen = () => {
  // control frames are JSON text, media frames are binary
  ws.send(JSON.stringify({ t: 'start', profile: '1080p30', record: true }))

  const rec = new MediaRecorder(programmeStream, {
    mimeType: 'video/webm;codecs=vp8,opus',
    videoBitsPerSecond: 6_000_000,
  })

  rec.ondataavailable = async (e) => {
    if (e.data.size && ws.readyState === WebSocket.OPEN) {
      ws.send(await e.data.arrayBuffer())
    }
  }

  rec.onstop = () => ws.send(JSON.stringify({ t: 'stop' }))
  rec.start(250) // one WebM chunk every 250ms
}`

const SIGNAL_SHAPE = `// client -> server
{ "t": "signal", "to": "peer_3fd1", "data": { "sdp": "..." } }

// server -> client
{ "t": "signal", "from": "peer_9ab7", "data": { "candidate": "..." } }`

export function DeveloperGuidePage() {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(id: string, text: string) {
    void navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(id)
        window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1400)
      },
      () => setCopied(null),
    )
  }

  function Code({ id, label, code }: { id: string; label?: string; code: string }) {
    return (
      <div style={{ marginTop: 'var(--sp-sm)' }}>
        <div
          className="ui-row"
          style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}
        >
          <span style={{ color: 'var(--c-text-mute)', fontSize: 12, letterSpacing: '.04em' }}>
            {label ?? 'Example'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={copied === id ? 'check' : 'copy'}
            onClick={() => copy(id, code)}
          >
            {copied === id ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <pre className="ui-code">{code}</pre>
      </div>
    )
  }

  function Routes({ rows }: { rows: Endpoint[] }) {
    return (
      <ul className="ui-list">
        {rows.map((r) => (
          <li className="ui-list__item" key={r.method + r.path}>
            <Badge tone={METHOD_TONE[r.method]}>{r.method}</Badge>
            <div className="ui-list__grow">
              <div className="ui-list__title" style={{ fontFamily: 'ui-monospace, monospace' }}>
                {r.path}
              </div>
              <div className="ui-list__sub">{r.note}</div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  function Messages({ title, icon, rows }: { title: string; icon: 'send' | 'signal'; rows: { name: string; note: string }[] }) {
    return (
      <div>
        <div className="ui-row" style={{ alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name={icon} />
          <strong style={{ fontSize: 13 }}>{title}</strong>
        </div>
        <ul className="ui-list">
          {rows.map((m) => (
            <li className="ui-list__item" key={title + m.name}>
              <div className="ui-list__grow">
                <div className="ui-list__title" style={{ fontFamily: 'ui-monospace, monospace' }}>
                  {m.name}
                </div>
                <div className="ui-list__sub">{m.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="ui-stack">
      <PageHeader
        title="Developer guide"
        description="Everything the studio server exposes: REST for setup and control, WebSockets for signaling and the programme feed."
        actions={
          <Button variant="secondary" icon="copy" onClick={() => copy('base', BASE)}>
            {copied === 'base' ? 'Copied base URL' : BASE}
          </Button>
        }
      />

      <Card
        title="Getting started"
        description="Run the server locally and talk to it over plain HTTP. No SDK required."
      >
        <div className="ui-stack">
          <p style={{ color: 'var(--c-text-dim)', margin: 0, lineHeight: 1.6 }}>
            The API is served from <code>{BASE}</code>. Every request and response is JSON
            (<code>Content-Type: application/json</code>), IDs are opaque strings, and timestamps are
            ISO-8601 in UTC. In local development there is <strong>no authentication</strong> — the
            server trusts anything on the loopback interface, so keep the port off your public
            network. Errors come back as{' '}
            <code>{'{ error: { code, message } }'}</code> with a matching HTTP status.
          </p>
          <Routes
            rows={[{ method: 'GET', path: '/api/health', note: 'Liveness probe. Cheap, unauthenticated, safe to poll.' }]}
          />
          <Code id="health" label="Health check" code={HEALTH} />
        </div>
      </Card>

      <Card
        title="Authentication"
        description="How remote clients will authorize once the studio runs outside your machine."
        actions={<Badge tone="warning">Planned</Badge>}
      >
        <div className="ui-stack">
          <div
            className="ui-row"
            style={{
              alignItems: 'flex-start',
              gap: 10,
              padding: 'var(--sp-md)',
              background: 'var(--c-surface)',
              border: '1px solid var(--c-line)',
              borderRadius: 'var(--r-lg)',
            }}
          >
            <Icon name="warning" />
            <span style={{ color: 'var(--c-text-dim)', fontSize: 13, lineHeight: 1.6 }}>
              None of the endpoints below exist yet. They describe the OAuth2 authorization-code flow
              we intend to ship for hosted deployments — the shapes may still change before release.
            </span>
          </div>
          <p style={{ color: 'var(--c-text-dim)', margin: 0, lineHeight: 1.6 }}>
            You will register an application to receive a <code>client_id</code> and{' '}
            <code>client_secret</code>, plus one or more allow-listed <code>redirect_uri</code>{' '}
            values. Send the operator to the authorize screen, and they pick which scopes to grant.
          </p>
          <Code id="authz" label="1 — Redirect to the authorize screen" code={AUTH_CODE} />
          <p style={{ color: 'var(--c-text-dim)', margin: 0, lineHeight: 1.6 }}>
            The browser returns to your <code>redirect_uri</code> with <code>?code=…&amp;state=…</code>.
            Verify <code>state</code> matches the nonce you generated, then exchange the code from
            your backend — never from the browser, since the exchange carries the client secret.
          </p>
          <Code id="authtok" label="2 — Exchange the code for tokens" code={AUTH_TOKEN} />
          <p style={{ color: 'var(--c-text-dim)', margin: 0, lineHeight: 1.6 }}>
            Send <code>Authorization: Bearer &lt;access_token&gt;</code> on every call. Access tokens
            last an hour; when one expires, POST the same token endpoint with{' '}
            <code>grant_type=refresh_token</code> and your stored <code>refresh_token</code> to get a
            fresh pair. Refresh tokens rotate on use, so always persist the newest one.
          </p>
        </div>
      </Card>

      <Card
        title="Destinations"
        description="Where the programme feed gets pushed. Each destination is an RTMP target with its own key."
      >
        <div className="ui-stack">
          <Routes rows={DESTINATION_ROUTES} />
          <p style={{ color: 'var(--c-text-dim)', margin: 0, lineHeight: 1.6 }}>
            <code>platform</code> is a free-form slug used for the icon and colour in the UI —{' '}
            <code>youtube</code>, <code>twitch</code>, <code>facebook</code>, <code>linkedin</code>,{' '}
            <code>kick</code> or <code>custom</code>. Stream keys are write-only: they are stored
            whole but masked in every response.
          </p>
          <Code id="dest" label="Create a destination" code={DEST_POST} />
        </div>
      </Card>

      <Card
        title="Broadcast control"
        description="Start and stop the encoder, and read telemetry while it runs."
      >
        <div className="ui-stack">
          <Routes rows={BROADCAST_ROUTES} />
          <p style={{ color: 'var(--c-text-dim)', margin: 0, lineHeight: 1.6 }}>
            Starting fans the programme feed out to every destination with{' '}
            <code>enabled: true</code>. Set <code>record: true</code> to also write a local copy.
            Both calls are idempotent — starting an already-live session returns the current state
            instead of erroring.
          </p>
          <Code id="bctl" label="Start and stop" code={BROADCAST_CURL} />
          <Code id="stats" label="Telemetry — poll once a second or less" code={STATS} />
        </div>
      </Card>

      <Card
        title="Programme ingest"
        description="Push the mixed programme output to the server as a WebSocket media stream."
      >
        <div className="ui-stack">
          <Routes
            rows={[
              {
                method: 'WS',
                path: '/ws/ingest',
                note: 'Binary WebM chunks, framed by JSON control messages.',
              },
            ]}
          />
          <p style={{ color: 'var(--c-text-dim)', margin: 0, lineHeight: 1.6 }}>
            The socket mixes two frame kinds. Text frames are control JSON —{' '}
            <code>{"{ t: 'start', profile, record }"}</code> to open the encoder and{' '}
            <code>{"{ t: 'stop' }"}</code> to close it cleanly. Binary frames are raw{' '}
            <code>MediaRecorder</code> chunks, forwarded in arrival order. Send{' '}
            <code>start</code> before the first chunk: chunks that arrive early are dropped, and the
            first chunk must carry the WebM header the recorder emits.
          </p>
          <Code id="ingest" label="Browser capture to ingest" code={INGEST} />
        </div>
      </Card>

      <Card
        title="Room signaling"
        description="One JSON-over-WebSocket channel carries presence, WebRTC negotiation, stage control and chat."
      >
        <div className="ui-stack">
          <Routes
            rows={[
              {
                method: 'WS',
                path: '/ws',
                note: 'Every message is a JSON object with a "t" discriminator.',
              },
            ]}
          />
          <div className="ui-grid ui-grid--2">
            <Messages title="Client to server" icon="send" rows={CLIENT_MESSAGES} />
            <Messages title="Server to client" icon="signal" rows={SERVER_MESSAGES} />
          </div>
          <p style={{ color: 'var(--c-text-dim)', margin: 0, lineHeight: 1.6 }}>
            The server never inspects the <code>data</code> payload on a <code>signal</code> message
            — it swaps <code>to</code> for <code>from</code> and relays it, so any WebRTC negotiation
            style works. Send <code>join</code> as your first message; anything before it is answered
            with an <code>error</code>. A <code>ping</code> every 20 seconds keeps proxies from
            closing an idle socket.
          </p>
          <Code id="sig" label="Signal envelope" code={SIGNAL_SHAPE} />
        </div>
      </Card>
    </div>
  )
}
