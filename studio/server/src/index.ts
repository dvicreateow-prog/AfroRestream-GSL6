/*
 * Studio server.
 *
 *   /api/*        destinations CRUD, broadcast control, stats
 *   /ws           room signaling (JSON)
 *   /ws/ingest    programme feed (binary WebM chunks) -> ffmpeg -> RTMP fan-out
 */
import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { WebSocketServer, type WebSocket } from 'ws'
import { randomUUID } from 'node:crypto'
import type {
  ClientMessage,
  Destination,
  ChatMessage,
  IceServer,
} from '@studio/shared'
import { Broadcaster, PROFILES } from './broadcaster.ts'
import { RoomRegistry, ROOM_CAPACITY } from './rooms.ts'
import { toolsRouter } from './tools.ts'

const PORT = Number(process.env.PORT ?? 4000)

const app = express()

/* In production, restrict the API to the origins that should be calling it.
 * CORS_ORIGIN takes a comma-separated list; unset means allow any origin, which
 * is fine for local development but should be set once deployed. */
const ALLOWED = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: ALLOWED.length ? ALLOWED : true,
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))

const rooms = new RoomRegistry()
const broadcaster = new Broadcaster()

/* In-memory destination store. Swap for a database when auth lands. */
const destinations = new Map<string, Destination>()

function iceServers(): IceServer[] {
  const list: IceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]
  if (process.env.TURN_URL) {
    list.push({
      urls: process.env.TURN_URL,
      username: process.env.TURN_USER,
      credential: process.env.TURN_PASS,
    })
  }
  return list
}

/* ------------------------------------------------------------------ */
/* REST                                                                */
/* ------------------------------------------------------------------ */

app.use('/api', toolsRouter())

/* ---- ingest / stream key ---- */

const INGEST_REGIONS = [
  { id: 'eu-west',   label: 'EU West (Amsterdam)',   host: 'live-ams.local' },
  { id: 'eu-central',label: 'EU Central (Frankfurt)',host: 'live-fra.local' },
  { id: 'us-east',   label: 'US East (New York)',    host: 'live-nyc.local' },
  { id: 'us-west',   label: 'US West (Los Angeles)', host: 'live-lax.local' },
  { id: 'ap-south',  label: 'Asia Pacific (Singapore)', host: 'live-sin.local' },
]

let streamKey = 're_' + randomUUID().replace(/-/g, '').slice(0, 24)

app.get('/api/ingest-servers', (_req, res) => res.json(INGEST_REGIONS))

app.get('/api/stream-key', (req, res) => {
  const region = INGEST_REGIONS.find((r) => r.id === req.query.region) ?? INGEST_REGIONS[0]
  res.json({
    region: region.id,
    rtmpUrl: `rtmp://${region.host}/live`,
    rtmpsUrl: `rtmps://${region.host}:443/live`,
    srtUrl: `srt://${region.host}:9000?streamid=${streamKey}`,
    streamKey,
  })
})

app.post('/api/stream-key/reset', (_req, res) => {
  streamKey = 're_' + randomUUID().replace(/-/g, '').slice(0, 24)
  res.json({ streamKey })
})

/* ---- speed test ----
 * The client POSTs a payload and times the round trip. We only need to drain the
 * body and report the byte count; throughput is measured client-side. */
app.post('/api/speed-test', express.raw({ type: '*/*', limit: '32mb' }), (req, res) => {
  const bytes = Buffer.isBuffer(req.body) ? req.body.length : 0
  res.json({ bytes, at: Date.now() })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, rooms: rooms.count, live: broadcaster.live })
})

app.get('/api/destinations', (_req, res) => {
  res.json([...destinations.values()])
})

app.post('/api/destinations', (req, res) => {
  const { platform, name, url, streamKey, enabled } = req.body ?? {}
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' })
  }
  if (!/^rtmps?:\/\//i.test(url) && !/^srt:\/\//i.test(url)) {
    return res.status(400).json({ error: 'url must be rtmp://, rtmps:// or srt://' })
  }
  const dest: Destination = {
    id: randomUUID(),
    platform: platform ?? 'custom',
    name: name ?? 'Custom RTMP',
    url,
    streamKey: streamKey ?? '',
    enabled: enabled ?? true,
  }
  destinations.set(dest.id, dest)
  res.status(201).json(dest)
})

app.patch('/api/destinations/:id', (req, res) => {
  const dest = destinations.get(req.params.id)
  if (!dest) return res.status(404).json({ error: 'not found' })
  Object.assign(dest, req.body ?? {}, { id: dest.id })
  res.json(dest)
})

app.delete('/api/destinations/:id', (req, res) => {
  if (!destinations.delete(req.params.id)) {
    return res.status(404).json({ error: 'not found' })
  }
  res.status(204).end()
})

app.get('/api/stream/stats', (_req, res) => res.json(broadcaster.stats()))

app.post('/api/stream/start', (req, res) => {
  if (broadcaster.live) return res.status(409).json({ error: 'already live' })
  const profile = req.body?.profile ?? '1080p30'
  if (!(profile in PROFILES)) {
    return res.status(400).json({ error: `unknown profile: ${profile}` })
  }
  try {
    const result = broadcaster.start({
      destinations: [...destinations.values()],
      profile,
      record: Boolean(req.body?.record),
    })
    res.json({ ok: true, ...result, stats: broadcaster.stats() })
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
  }
})

app.post('/api/stream/stop', (_req, res) => {
  broadcaster.stop()
  res.json({ ok: true })
})

/* ------------------------------------------------------------------ */
/* WebSocket                                                           */
/* ------------------------------------------------------------------ */

const server = createServer(app)
const signalWss = new WebSocketServer({ noServer: true })
const ingestWss = new WebSocketServer({ noServer: true })

server.on('upgrade', (req, socket, head) => {
  const { pathname } = new URL(req.url ?? '/', `http://${req.headers.host}`)
  if (pathname === '/ws') {
    signalWss.handleUpgrade(req, socket, head, (ws) => signalWss.emit('connection', ws, req))
  } else if (pathname === '/ws/ingest') {
    ingestWss.handleUpgrade(req, socket, head, (ws) => ingestWss.emit('connection', ws, req))
  } else {
    socket.destroy()
  }
})

/* ---- signaling ---- */

interface SocketCtx {
  roomId?: string
  selfId?: string
}

signalWss.on('connection', (ws: WebSocket) => {
  const ctx: SocketCtx = {}

  ws.on('message', (raw) => {
    let msg: ClientMessage
    try {
      msg = JSON.parse(String(raw))
    } catch {
      return
    }

    /* Every message except `join` requires an established identity. */
    if (msg.t !== 'join' && (!ctx.roomId || !ctx.selfId)) return
    const room = ctx.roomId ? rooms.get(ctx.roomId) : undefined

    switch (msg.t) {
      case 'join': {
        if (ctx.selfId) return
        const target = rooms.getOrCreate(msg.roomId)
        if (target.size >= ROOM_CAPACITY) {
          ws.send(JSON.stringify({ t: 'denied', reason: 'Room is full' }))
          ws.close()
          return
        }
        const me = target.join(msg.name, msg.role, ws)
        ctx.roomId = msg.roomId
        ctx.selfId = me.id

        ws.send(
          JSON.stringify({
            t: 'welcome',
            selfId: me.id,
            room: target.snapshot(),
            iceServers: iceServers(),
          }),
        )
        if (!me.approved) ws.send(JSON.stringify({ t: 'waiting' }))
        target.broadcast({ t: 'peerJoined', participant: me }, me.id)
        target.broadcastRoom()
        break
      }

      case 'signal': {
        /* Relay verbatim; the server never inspects SDP. */
        room?.send(msg.to, { t: 'signal', from: ctx.selfId!, data: msg.data })
        break
      }

      case 'setMedia': {
        room?.setMedia(ctx.selfId!, {
          ...(msg.micOn !== undefined && { micOn: msg.micOn }),
          ...(msg.camOn !== undefined && { camOn: msg.camOn }),
          ...(msg.screenOn !== undefined && { screenOn: msg.screenOn }),
        })
        room?.broadcastRoom()
        break
      }

      case 'admit':
      case 'deny':
      case 'setStage':
      case 'removeParticipant':
      case 'setRoom': {
        if (!room?.isHost(ctx.selfId!)) return
        if (msg.t === 'admit') {
          room.setApproved(msg.participantId, true)
          room.send(msg.participantId, { t: 'room', room: room.snapshot() })
        } else if (msg.t === 'deny') {
          room.send(msg.participantId, { t: 'denied', reason: 'The host declined your request' })
          room.socketOf(msg.participantId)?.close()
          room.leave(msg.participantId)
        } else if (msg.t === 'setStage') {
          room.setStage(msg.participantId, msg.state)
        } else if (msg.t === 'removeParticipant') {
          room.send(msg.participantId, { t: 'denied', reason: 'Removed by the host' })
          room.socketOf(msg.participantId)?.close()
          room.leave(msg.participantId)
        } else {
          if (msg.title !== undefined) room.title = msg.title
          if (msg.requireApproval !== undefined) room.requireApproval = msg.requireApproval
        }
        room.broadcastRoom()
        break
      }

      case 'chat': {
        const me = room?.get(ctx.selfId!)
        if (!room || !me) return
        const message: ChatMessage = {
          id: randomUUID(),
          author: me.name,
          authorColor: me.color,
          text: String(msg.text).slice(0, 2000),
          source: 'studio',
          at: Date.now(),
        }
        room.addChat(message)
        room.broadcast({ t: 'chat', message })
        break
      }

      case 'ping':
        ws.send(JSON.stringify({ t: 'pong' }))
        break

      case 'leave':
        ws.close()
        break
    }
  })

  ws.on('close', () => {
    if (!ctx.roomId || !ctx.selfId) return
    const room = rooms.get(ctx.roomId)
    if (!room) return
    room.leave(ctx.selfId)
    room.broadcast({ t: 'peerLeft', participantId: ctx.selfId })
    room.broadcastRoom()
    rooms.prune(ctx.roomId)
  })
})

/* ---- programme ingest ---- */

ingestWss.on('connection', (ws: WebSocket) => {
  ws.binaryType = 'nodebuffer'
  let bytesIn = 0
  let framesIn = 0
  let rejected = 0

  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      const buf = data as Buffer
      bytesIn += buf.length
      framesIn++
      if (!broadcaster.write(buf)) rejected++
      if (framesIn % 20 === 0) {
        console.log(`[ingest] ${framesIn} frames, ${bytesIn} bytes, backpressure=${rejected}`)
      }
      return
    }
    console.log('[ingest] control:', String(data).slice(0, 120))
    /* Control frames on the same socket keep start/stop in lockstep with the feed. */
    try {
      const msg = JSON.parse(String(data))
      if (msg.t === 'start') {
        broadcaster.start({
          destinations: [...destinations.values()],
          profile: msg.profile ?? '1080p30',
          record: Boolean(msg.record),
        })
      } else if (msg.t === 'stop') {
        broadcaster.stop()
      }
    } catch (err) {
      ws.send(JSON.stringify({ t: 'error', message: (err as Error).message }))
    }
  })

  const onStats = (stats: unknown) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ t: 'stream', stats }))
  }
  const onError = (err: Error) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ t: 'error', message: err.message }))
  }

  broadcaster.on('stats', onStats)
  broadcaster.on('error', onError)

  ws.on('close', () => {
    console.log(`[ingest] closed after ${framesIn} frames / ${bytesIn} bytes`)
    broadcaster.off('stats', onStats)
    broadcaster.off('error', onError)
    /* Losing the programme feed ends the broadcast - a stalled ffmpeg helps nobody. */
    broadcaster.stop()
  })
})

broadcaster.on('log', (line: string) => console.warn('[ffmpeg]', line))
broadcaster.on('started', (info: unknown) => console.log('[broadcast] started', info))
broadcaster.on('ended', (info: unknown) => console.log('[broadcast] ended', info))

server.listen(PORT, () => {
  console.log(`studio server listening on http://localhost:${PORT}`)
})
