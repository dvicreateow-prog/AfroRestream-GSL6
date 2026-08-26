/*
 * End-to-end product flow: sign in, add a destination, broadcast.
 *
 * Also asserts the negative cases, which are the whole point of the account model:
 * destinations hold platform stream keys, so an unauthenticated caller must not be
 * able to read them, and one user must never see another's.
 *
 * Requires the server running on :4000 and an RTMP receiver on :1935.
 *   npx tsx server/test/auth-stream.test.ts <file.webm>
 */
import fs from 'node:fs'
import WebSocket from 'ws'

const API = process.env.API ?? 'http://localhost:4000'
const WS = API.replace(/^http/, 'ws')
const FILE = process.argv[2]

let failures = 0
const ok = (label: string, cond: boolean, detail = '') => {
  if (!cond) failures++
  console.log(`  ${cond ? 'PASS' : '**FAIL**'}  ${label}${detail ? `  (${detail})` : ''}`)
}

const json = async (path: string, init: RequestInit = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
  })
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* empty body */
  }
  return { status: res.status, body }
}

const auth = (token: string) => ({ authorization: `Bearer ${token}` })

async function main() {
  console.log('--- unauthenticated access is refused ---')
  ok('GET /api/destinations -> 401', (await json('/api/destinations')).status === 401)
  ok('GET /api/stream-key -> 401', (await json('/api/stream-key')).status === 401)
  ok('POST /api/stream/start -> 401', (await json('/api/stream/start', { method: 'POST' })).status === 401)
  ok('GET /api/health stays public', (await json('/api/health')).status === 200)

  console.log('\n--- sign in ---')
  const alice = await json('/auth/dev-login'.replace('/auth', '/api/auth'), {
    method: 'POST',
    body: JSON.stringify({ email: 'alice@studio.test', name: 'Alice' }),
  })
  const aliceToken = (alice.body as { token?: string })?.token ?? ''
  ok('dev-login returns a token', !!aliceToken)

  const me = await json('/api/auth/me', { headers: auth(aliceToken) })
  ok('/auth/me resolves the session', (me.body as { user?: { email: string } })?.user?.email === 'alice@studio.test')

  console.log('\n--- destinations belong to the account ---')
  const created = await json('/api/destinations', {
    method: 'POST',
    headers: auth(aliceToken),
    body: JSON.stringify({
      platform: 'custom',
      name: 'Local RTMP',
      url: 'rtmp://127.0.0.1:1935/live',
      streamKey: 'testkey',
      enabled: true,
    }),
  })
  ok('destination created', created.status === 201)

  const list = await json('/api/destinations', { headers: auth(aliceToken) })
  ok('alice sees her destination', (list.body as unknown[])?.length === 1)

  const bob = await json('/api/auth/dev-login', {
    method: 'POST',
    body: JSON.stringify({ email: 'bob@studio.test', name: 'Bob' }),
  })
  const bobToken = (bob.body as { token?: string })?.token ?? ''
  const bobList = await json('/api/destinations', { headers: auth(bobToken) })
  ok('bob sees none of alice\'s', (bobList.body as unknown[])?.length === 0)

  const aliceDestId = (list.body as { id: string }[])[0]?.id
  const bobDelete = await json(`/api/destinations/${aliceDestId}`, {
    method: 'DELETE',
    headers: auth(bobToken),
  })
  ok('bob cannot delete alice\'s destination', bobDelete.status === 404)

  console.log('\n--- stream keys are per-account ---')
  const ka = (await json('/api/stream-key', { headers: auth(aliceToken) })).body as { streamKey: string }
  const kb = (await json('/api/stream-key', { headers: auth(bobToken) })).body as { streamKey: string }
  ok('alice has a key', !!ka?.streamKey)
  ok('keys differ between accounts', ka?.streamKey !== kb?.streamKey)

  console.log('\n--- ingest socket requires a session ---')
  const anon = await new Promise<string>((resolve) => {
    const s = new WebSocket(`${WS}/ws/ingest`)
    s.on('open', () => { s.close(); resolve('opened') })
    s.on('error', () => resolve('rejected'))
  })
  ok('anonymous ingest rejected', anon === 'rejected', anon)

  if (!FILE || !fs.existsSync(FILE)) {
    console.log('\n(no media file given - skipping the broadcast leg)')
    return
  }

  console.log('\n--- broadcast as the signed-in user ---')
  const data = fs.readFileSync(FILE)
  const result = await new Promise<string>((resolve) => {
    const s = new WebSocket(`${WS}/ws/ingest?access_token=${encodeURIComponent(aliceToken)}`)
    s.on('error', (e) => resolve('error: ' + (e as Error).message))
    s.on('open', async () => {
      s.send(JSON.stringify({ t: 'start', profile: '720p30', record: false }))
      await new Promise((r) => setTimeout(r, 1200))
      const CHUNK = 32 * 1024
      for (let off = 0; off < data.length; off += CHUNK) {
        s.send(data.subarray(off, Math.min(off + CHUNK, data.length)))
        if ((off / CHUNK) % 8 === 0) await new Promise((r) => setTimeout(r, 40))
      }
      await new Promise((r) => setTimeout(r, 3500))
      s.send(JSON.stringify({ t: 'stop' }))
      await new Promise((r) => setTimeout(r, 2000))
      s.close()
      resolve('streamed')
    })
  })
  ok('authenticated ingest accepted and streamed', result === 'streamed', result)
}

main()
  .then(() => {
    console.log()
    if (failures > 0) {
      console.error(`${failures} assertion(s) failed`)
      process.exit(1)
    }
    console.log('all assertions passed')
  })
  .catch((e) => {
    console.error('test crashed:', (e as Error).message)
    process.exit(1)
  })
