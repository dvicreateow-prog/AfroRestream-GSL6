/*
 * Isolation and auth-primitive tests.
 *
 * These guard the two holes the pre-database server had: a single process-global
 * stream key shared by every caller, and no per-user scoping on any read or write.
 * Run against a scratch database:  npm --workspace server run test
 */
import { users, sessions, destinations, streamKeys, apiClients } from '../src/repos.ts'

let failures = 0
const ok = (label: string, cond: boolean) => {
  if (!cond) failures++
  console.log(`  ${cond ? 'PASS' : '**FAIL**'}  ${label}`)
}

// Two separate accounts
const alice = users.upsertFromOAuth({ provider: 'google', subject: 'g-1', email: 'A@x.com', name: 'Alice' })
const bob = users.upsertFromOAuth({ provider: 'github', subject: 'h-1', email: 'b@x.com', name: 'Bob' })

console.log('--- identity ---')
ok('emails normalised to lowercase', alice.email === 'a@x.com')
ok('distinct users created', alice.id !== bob.id)

// Same person, second provider, same verified email -> one account
const aliceViaGithub = users.upsertFromOAuth({ provider: 'github', subject: 'h-2', email: 'a@x.com', name: 'Alice' })
ok('second provider links to existing account', aliceViaGithub.id === alice.id)

// Same provider+subject returns same user, no duplicate
const aliceAgain = users.upsertFromOAuth({ provider: 'google', subject: 'g-1', email: 'a@x.com', name: 'Alice' })
ok('repeat login does not duplicate', aliceAgain.id === alice.id)

console.log('--- per-user isolation ---')
destinations.create(alice.id, { url: 'rtmp://a/live', name: 'Alice YT' })
destinations.create(bob.id, { url: 'rtmp://b/live', name: 'Bob Twitch' })
ok('alice sees only her own', destinations.listFor(alice.id).length === 1)
ok('bob sees only his own', destinations.listFor(bob.id).length === 1)

const aliceDest = destinations.listFor(alice.id)[0]
ok('bob cannot read alice destination', destinations.get(bob.id, aliceDest.id) === null)
ok('bob cannot delete alice destination', destinations.remove(bob.id, aliceDest.id) === false)
ok('alice destination survived', destinations.get(alice.id, aliceDest.id) !== null)

console.log('--- stream keys ---')
const ka = streamKeys.for(alice.id)
const kb = streamKeys.for(bob.id)
ok('each user has a key', !!ka.key && !!kb.key)
ok('keys are distinct (was one global before)', ka.key !== kb.key)
ok('key resolves to its owner', streamKeys.ownerOf(ka.key) === alice.id)
const rotated = streamKeys.rotate(alice.id)
ok('rotation changes the key', rotated.key !== ka.key)
ok('old key no longer resolves', streamKeys.ownerOf(ka.key) === null)

console.log('--- sessions ---')
const sess = sessions.create(alice.id, { ip: '127.0.0.1' })
ok('session resolves to user', sessions.resolve(sess.id)?.id === alice.id)
ok('garbage session rejected', sessions.resolve('nope') === null)
sessions.revoke(sess.id)
ok('revoked session rejected', sessions.resolve(sess.id) === null)

console.log('--- api clients ---')
const { client, secret } = apiClients.create(alice.id, { name: 'My app' })
ok('secret returned once', secret.startsWith('csk_'))
ok('secret verifies', apiClients.verify(client.clientId, secret)?.id === client.id)
ok('wrong secret rejected', apiClients.verify(client.clientId, 'csk_wrong') === null)
ok('bob cannot delete alice client', apiClients.remove(bob.id, client.id) === false)

console.log()
if (failures > 0) {
  console.error(`${failures} assertion(s) failed`)
  process.exit(1)
}
console.log('all assertions passed')
