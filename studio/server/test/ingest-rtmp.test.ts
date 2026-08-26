/*
 * End-to-end broadcast test.
 *
 * Feeds WebM chunks into /ws/ingest exactly as the browser's MediaRecorder does,
 * and lets the server fan them out to whatever destinations are registered.
 *
 * Point a real RTMP receiver at the destination first, e.g.
 *   ffmpeg -listen 1 -f flv -i rtmp://127.0.0.1:1935/live/testkey -c copy out.flv
 *
 *   npx tsx server/test/ingest-rtmp.test.ts <file.webm>
 */
import fs from 'node:fs'
import WebSocket from 'ws'

const FILE = process.argv[2]
const SERVER = process.env.INGEST_URL ?? 'ws://localhost:4000/ws/ingest'
const CHUNK = 32 * 1024

if (!FILE || !fs.existsSync(FILE)) {
  console.error('usage: tsx server/test/ingest-rtmp.test.ts <file.webm>')
  process.exit(2)
}

const data = fs.readFileSync(FILE)
console.log(`feeding ${data.length} bytes -> ${SERVER}`)

const ws = new WebSocket(SERVER)
let lastStats: unknown = null
let errored: string | null = null

ws.on('open', async () => {
  console.log('socket open, requesting start')
  ws.send(JSON.stringify({ t: 'start', profile: '720p30', record: false }))

  /* Give ffmpeg a moment to spawn and connect to the RTMP endpoint. */
  await new Promise((r) => setTimeout(r, 1200))

  for (let off = 0; off < data.length; off += CHUNK) {
    ws.send(data.subarray(off, Math.min(off + CHUNK, data.length)))
    /* Pace roughly to realtime so the encoder is not flooded. */
    if ((off / CHUNK) % 8 === 0) await new Promise((r) => setTimeout(r, 40))
  }
  console.log('all chunks sent, draining')

  await new Promise((r) => setTimeout(r, 4000))
  ws.send(JSON.stringify({ t: 'stop' }))
  await new Promise((r) => setTimeout(r, 2500))
  ws.close()
})

ws.on('message', (raw) => {
  try {
    const msg = JSON.parse(String(raw)) as { t: string; stats?: unknown; message?: string }
    if (msg.t === 'stream') lastStats = msg.stats
    else if (msg.t === 'error') {
      errored = msg.message ?? 'unknown'
      console.error('SERVER ERROR:', errored)
    }
  } catch {
    /* binary frame */
  }
})

ws.on('close', () => {
  console.log('socket closed')
  console.log('final stats:', JSON.stringify(lastStats))
  process.exit(errored ? 1 : 0)
})

ws.on('error', (e) => {
  console.error('ws error:', (e as Error).message)
  process.exit(1)
})
