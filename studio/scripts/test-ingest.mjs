/*
 * End-to-end test of the programme ingest path:
 *   WebM chunks -> /ws/ingest -> ffmpeg -> MP4 (+ RTMP if destinations exist)
 * Streams the file in ~200ms slices to imitate MediaRecorder's timeslice behaviour.
 */
import fs from 'node:fs'
import WebSocket from 'ws'

const FILE = process.argv[2]
const SERVER = process.env.SERVER ?? 'ws://localhost:4000/ws/ingest'
const CHUNK = 32 * 1024

const data = fs.readFileSync(FILE)
console.log(`feeding ${data.length} bytes from ${FILE}`)

const ws = new WebSocket(SERVER)
let lastStats = null

ws.on('open', async () => {
  console.log('ingest socket open')
  ws.send(JSON.stringify({ t: 'start', profile: '720p30', record: true }))

  // let ffmpeg spin up before the first byte
  await new Promise((r) => setTimeout(r, 600))

  for (let off = 0; off < data.length; off += CHUNK) {
    ws.send(data.subarray(off, Math.min(off + CHUNK, data.length)))
    // pace roughly at realtime so ffmpeg sees a live-ish feed
    if ((off / CHUNK) % 8 === 0) await new Promise((r) => setTimeout(r, 40))
  }
  console.log('all chunks sent, waiting for ffmpeg to drain...')

  await new Promise((r) => setTimeout(r, 3000))
  ws.send(JSON.stringify({ t: 'stop' }))
  await new Promise((r) => setTimeout(r, 3000))
  ws.close()
})

ws.on('message', (raw) => {
  try {
    const msg = JSON.parse(String(raw))
    if (msg.t === 'stream') {
      lastStats = msg.stats
    } else if (msg.t === 'error') {
      console.error('SERVER ERROR:', msg.message)
    }
  } catch {
    /* ignore */
  }
})

ws.on('close', () => {
  console.log('socket closed')
  console.log('final stats:', JSON.stringify(lastStats, null, 2))
  process.exit(0)
})

ws.on('error', (e) => {
  console.error('ws error', e.message)
  process.exit(1)
})
