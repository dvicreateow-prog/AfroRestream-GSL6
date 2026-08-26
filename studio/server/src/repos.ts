/*
 * Typed data access.
 *
 * Every read and write is scoped by user_id. That is the whole point: the previous
 * in-memory version had one global destinations Map and one process-wide stream key,
 * so any caller saw and mutated everyone's state.
 */
import { createHash, randomBytes } from 'node:crypto'
import { db, fromBool, newId, now, parseJson, toBool, transaction } from './db.ts'
import type { DestinationPlatform } from '@studio/shared'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  createdAt: number
  lastSeenAt: number | null
}

export interface Session {
  id: string
  userId: string
  expiresAt: number
}

export interface Destination {
  id: string
  userId: string
  platform: DestinationPlatform
  name: string
  url: string
  streamKey: string
  enabled: boolean
  createdAt: number
}

export interface StreamKey {
  userId: string
  key: string
  region: string
  rotatedAt: number
}

export interface Broadcast {
  id: string
  userId: string
  title: string
  profile: string
  startedAt: number
  endedAt: number | null
  destinationIds: string[]
  peakViewers: number
  error: string | null
}

export interface Recording {
  id: string
  userId: string
  broadcastId: string | null
  filename: string
  bytes: number
  durationMs: number
  status: string
  createdAt: number
}

export interface ApiClient {
  id: string
  userId: string
  name: string
  description: string
  clientId: string
  redirectUris: string[]
  scopes: string[]
  createdAt: number
}

/* ------------------------------------------------------------------ */
/* Row mapping                                                         */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>

const s = (v: unknown): string => (v == null ? '' : String(v))
const sn = (v: unknown): string | null => (v == null ? null : String(v))
const n = (v: unknown): number => (v == null ? 0 : Number(v))
const nn = (v: unknown): number | null => (v == null ? null : Number(v))

const toUser = (r: Row): User => ({
  id: s(r.id),
  email: s(r.email),
  name: s(r.name),
  avatarUrl: sn(r.avatar_url),
  createdAt: n(r.created_at),
  lastSeenAt: nn(r.last_seen_at),
})

const toDestination = (r: Row): Destination => ({
  id: s(r.id),
  userId: s(r.user_id),
  platform: s(r.platform) as DestinationPlatform,
  name: s(r.name),
  url: s(r.url),
  streamKey: s(r.stream_key),
  enabled: toBool(r.enabled),
  createdAt: n(r.created_at),
})

const toBroadcast = (r: Row): Broadcast => ({
  id: s(r.id),
  userId: s(r.user_id),
  title: s(r.title),
  profile: s(r.profile),
  startedAt: n(r.started_at),
  endedAt: nn(r.ended_at),
  destinationIds: parseJson<string[]>(r.destination_ids, []),
  peakViewers: n(r.peak_viewers),
  error: sn(r.error),
})

const toRecording = (r: Row): Recording => ({
  id: s(r.id),
  userId: s(r.user_id),
  broadcastId: sn(r.broadcast_id),
  filename: s(r.filename),
  bytes: n(r.bytes),
  durationMs: n(r.duration_ms),
  status: s(r.status),
  createdAt: n(r.created_at),
})

const toApiClient = (r: Row): ApiClient => ({
  id: s(r.id),
  userId: s(r.user_id),
  name: s(r.name),
  description: s(r.description),
  clientId: s(r.client_id),
  redirectUris: parseJson<string[]>(r.redirect_uris, []),
  scopes: parseJson<string[]>(r.scopes, []),
  createdAt: n(r.created_at),
})

/* ------------------------------------------------------------------ */
/* Users & identities                                                  */
/* ------------------------------------------------------------------ */

export const users = {
  byId(id: string): User | null {
    const r = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Row | undefined
    return r ? toUser(r) : null
  },

  byEmail(email: string): User | null {
    const r = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email.toLowerCase()) as Row | undefined
    return r ? toUser(r) : null
  },

  /**
   * Resolve an OAuth login to a user, creating one if needed.
   *
   * If the provider's verified email already belongs to a user, the identity is
   * linked to that account rather than creating a duplicate - so signing in with
   * Google and then GitHub on the same address lands in one place.
   */
  upsertFromOAuth(input: {
    provider: string
    subject: string
    email: string
    name: string
    avatarUrl?: string | null
  }): User {
    return transaction(() => {
      const existingIdentity = db
        .prepare('SELECT user_id FROM identities WHERE provider = ? AND subject = ?')
        .get(input.provider, input.subject) as Row | undefined

      if (existingIdentity) {
        const u = this.byId(s(existingIdentity.user_id))
        if (u) {
          db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').run(now(), u.id)
          return u
        }
      }

      const email = input.email.toLowerCase()
      let user = this.byEmail(email)

      if (!user) {
        const id = newId('usr')
        db.prepare(
          `INSERT INTO users (id, email, name, avatar_url, created_at, last_seen_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        ).run(id, email, input.name || email, input.avatarUrl ?? null, now(), now())
        user = this.byId(id)!
        /* Give every new account its own ingest key immediately. */
        streamKeys.rotate(id)
      } else {
        db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').run(now(), user.id)
      }

      db.prepare(
        `INSERT OR IGNORE INTO identities (id, user_id, provider, subject, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(newId('idn'), user.id, input.provider, input.subject, now())

      return user
    })
  },

  update(id: string, patch: Partial<Pick<User, 'name' | 'email' | 'avatarUrl'>>): User | null {
    const cur = this.byId(id)
    if (!cur) return null
    db.prepare('UPDATE users SET name = ?, email = ?, avatar_url = ? WHERE id = ?').run(
      patch.name ?? cur.name,
      (patch.email ?? cur.email).toLowerCase(),
      patch.avatarUrl === undefined ? cur.avatarUrl : patch.avatarUrl,
      id,
    )
    return this.byId(id)
  },
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

export const sessions = {
  create(userId: string, meta: { userAgent?: string; ip?: string } = {}): Session {
    /* Opaque, high-entropy id - this value is the bearer credential. */
    const id = randomBytes(32).toString('base64url')
    const expiresAt = now() + SESSION_TTL_MS
    db.prepare(
      `INSERT INTO sessions (id, user_id, created_at, expires_at, user_agent, ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, userId, now(), expiresAt, meta.userAgent ?? null, meta.ip ?? null)
    return { id, userId, expiresAt }
  },

  /** Returns the owning user, or null if missing or expired. */
  resolve(id: string): User | null {
    const r = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Row | undefined
    if (!r) return null
    if (n(r.expires_at) < now()) {
      this.revoke(id)
      return null
    }
    return users.byId(s(r.user_id))
  },

  revoke(id: string) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
  },

  revokeAllFor(userId: string) {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId)
  },

  listFor(userId: string) {
    return (
      db
        .prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC')
        .all(userId) as Row[]
    ).map((r) => ({
      id: s(r.id),
      createdAt: n(r.created_at),
      expiresAt: n(r.expires_at),
      userAgent: sn(r.user_agent),
      ip: sn(r.ip),
    }))
  },

  purgeExpired(): number {
    const before = n(
      (db.prepare('SELECT COUNT(*) AS c FROM sessions').get() as Row).c,
    )
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now())
    const after = n((db.prepare('SELECT COUNT(*) AS c FROM sessions').get() as Row).c)
    return before - after
  },
}

/* ------------------------------------------------------------------ */
/* Stream keys                                                         */
/* ------------------------------------------------------------------ */

export const streamKeys = {
  for(userId: string): StreamKey {
    const r = db.prepare('SELECT * FROM stream_keys WHERE user_id = ?').get(userId) as
      | Row
      | undefined
    if (r) {
      return {
        userId: s(r.user_id),
        key: s(r.key),
        region: s(r.region),
        rotatedAt: n(r.rotated_at),
      }
    }
    return this.rotate(userId)
  },

  rotate(userId: string, region?: string): StreamKey {
    const key = `sk_${randomBytes(18).toString('base64url')}`
    const existing = db.prepare('SELECT region FROM stream_keys WHERE user_id = ?').get(userId) as
      | Row
      | undefined
    const useRegion = region ?? (existing ? s(existing.region) : 'eu-west')
    db.prepare(
      `INSERT INTO stream_keys (user_id, key, region, rotated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET key = excluded.key,
                                          region = excluded.region,
                                          rotated_at = excluded.rotated_at`,
    ).run(userId, key, useRegion, now())
    return { userId, key, region: useRegion, rotatedAt: now() }
  },

  /** Resolve an inbound ingest key to its owner. */
  ownerOf(key: string): string | null {
    const r = db.prepare('SELECT user_id FROM stream_keys WHERE key = ?').get(key) as
      | Row
      | undefined
    return r ? s(r.user_id) : null
  },
}

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */

export const destinations = {
  listFor(userId: string): Destination[] {
    return (
      db
        .prepare('SELECT * FROM destinations WHERE user_id = ? ORDER BY created_at')
        .all(userId) as Row[]
    ).map(toDestination)
  },

  enabledFor(userId: string): Destination[] {
    return this.listFor(userId).filter((d) => d.enabled)
  },

  get(userId: string, id: string): Destination | null {
    const r = db
      .prepare('SELECT * FROM destinations WHERE id = ? AND user_id = ?')
      .get(id, userId) as Row | undefined
    return r ? toDestination(r) : null
  },

  create(
    userId: string,
    input: {
      platform?: DestinationPlatform
      name?: string
      url: string
      streamKey?: string
      enabled?: boolean
    },
  ): Destination {
    const id = newId('dst')
    db.prepare(
      `INSERT INTO destinations (id, user_id, platform, name, url, stream_key, enabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      userId,
      input.platform ?? 'custom',
      input.name ?? 'Custom RTMP',
      input.url,
      input.streamKey ?? '',
      fromBool(input.enabled ?? true),
      now(),
    )
    return this.get(userId, id)!
  },

  update(userId: string, id: string, patch: Partial<Destination>): Destination | null {
    const cur = this.get(userId, id)
    if (!cur) return null
    db.prepare(
      `UPDATE destinations SET platform = ?, name = ?, url = ?, stream_key = ?, enabled = ?
       WHERE id = ? AND user_id = ?`,
    ).run(
      patch.platform ?? cur.platform,
      patch.name ?? cur.name,
      patch.url ?? cur.url,
      patch.streamKey ?? cur.streamKey,
      fromBool(patch.enabled ?? cur.enabled),
      id,
      userId,
    )
    return this.get(userId, id)
  },

  remove(userId: string, id: string): boolean {
    const r = db.prepare('DELETE FROM destinations WHERE id = ? AND user_id = ?').run(id, userId)
    return Number(r.changes) > 0
  },
}

/* ------------------------------------------------------------------ */
/* Broadcasts & recordings                                             */
/* ------------------------------------------------------------------ */

export const broadcasts = {
  start(userId: string, input: { title?: string; profile: string; destinationIds: string[] }): Broadcast {
    const id = newId('brd')
    db.prepare(
      `INSERT INTO broadcasts (id, user_id, title, profile, started_at, destination_ids)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, userId, input.title ?? '', input.profile, now(), JSON.stringify(input.destinationIds))
    return this.get(userId, id)!
  },

  end(userId: string, id: string, error?: string): Broadcast | null {
    db.prepare('UPDATE broadcasts SET ended_at = ?, error = ? WHERE id = ? AND user_id = ?').run(
      now(),
      error ?? null,
      id,
      userId,
    )
    return this.get(userId, id)
  },

  get(userId: string, id: string): Broadcast | null {
    const r = db
      .prepare('SELECT * FROM broadcasts WHERE id = ? AND user_id = ?')
      .get(id, userId) as Row | undefined
    return r ? toBroadcast(r) : null
  },

  listFor(userId: string, limit = 50): Broadcast[] {
    return (
      db
        .prepare('SELECT * FROM broadcasts WHERE user_id = ? ORDER BY started_at DESC LIMIT ?')
        .all(userId, limit) as Row[]
    ).map(toBroadcast)
  },

  active(userId: string): Broadcast | null {
    const r = db
      .prepare('SELECT * FROM broadcasts WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1')
      .get(userId) as Row | undefined
    return r ? toBroadcast(r) : null
  },
}

export const recordings = {
  create(userId: string, input: { broadcastId?: string | null; filename: string }): Recording {
    const id = newId('rec')
    db.prepare(
      `INSERT INTO recordings (id, user_id, broadcast_id, filename, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(id, userId, input.broadcastId ?? null, input.filename, now())
    return this.get(userId, id)!
  },

  finish(userId: string, id: string, info: { bytes: number; durationMs: number }): Recording | null {
    db.prepare(
      `UPDATE recordings SET bytes = ?, duration_ms = ?, status = 'ready'
       WHERE id = ? AND user_id = ?`,
    ).run(info.bytes, info.durationMs, id, userId)
    return this.get(userId, id)
  },

  get(userId: string, id: string): Recording | null {
    const r = db
      .prepare('SELECT * FROM recordings WHERE id = ? AND user_id = ?')
      .get(id, userId) as Row | undefined
    return r ? toRecording(r) : null
  },

  listFor(userId: string, limit = 100): Recording[] {
    return (
      db
        .prepare('SELECT * FROM recordings WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
        .all(userId, limit) as Row[]
    ).map(toRecording)
  },

  remove(userId: string, id: string): boolean {
    const r = db.prepare('DELETE FROM recordings WHERE id = ? AND user_id = ?').run(id, userId)
    return Number(r.changes) > 0
  },
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const settings = {
  get(userId: string): Record<string, unknown> {
    const r = db.prepare('SELECT json FROM settings WHERE user_id = ?').get(userId) as
      | Row
      | undefined
    return parseJson<Record<string, unknown>>(r?.json, {})
  },

  /** Shallow merge, so a client can PATCH one section without sending the rest. */
  merge(userId: string, patch: Record<string, unknown>): Record<string, unknown> {
    const next = { ...this.get(userId), ...patch }
    db.prepare(
      `INSERT INTO settings (user_id, json, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
    ).run(userId, JSON.stringify(next), now())
    return next
  },
}

/* ------------------------------------------------------------------ */
/* API clients                                                         */
/* ------------------------------------------------------------------ */

const hash = (v: string) => createHash('sha256').update(v).digest('hex')

export const apiClients = {
  listFor(userId: string): ApiClient[] {
    return (
      db
        .prepare('SELECT * FROM api_clients WHERE user_id = ? ORDER BY created_at DESC')
        .all(userId) as Row[]
    ).map(toApiClient)
  },

  /** The plaintext secret is returned once here and never stored. */
  create(
    userId: string,
    input: { name: string; description?: string; redirectUris?: string[]; scopes?: string[] },
  ): { client: ApiClient; secret: string } {
    const id = newId('apc')
    const clientId = `cid_${randomBytes(12).toString('base64url')}`
    const secret = `csk_${randomBytes(24).toString('base64url')}`
    db.prepare(
      `INSERT INTO api_clients
         (id, user_id, name, description, client_id, secret_hash, redirect_uris, scopes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      userId,
      input.name,
      input.description ?? '',
      clientId,
      hash(secret),
      JSON.stringify(input.redirectUris ?? []),
      JSON.stringify(input.scopes ?? []),
      now(),
    )
    const client = db.prepare('SELECT * FROM api_clients WHERE id = ?').get(id) as Row
    return { client: toApiClient(client), secret }
  },

  rotateSecret(userId: string, id: string): string | null {
    const owned = db
      .prepare('SELECT id FROM api_clients WHERE id = ? AND user_id = ?')
      .get(id, userId)
    if (!owned) return null
    const secret = `csk_${randomBytes(24).toString('base64url')}`
    db.prepare('UPDATE api_clients SET secret_hash = ? WHERE id = ?').run(hash(secret), id)
    return secret
  },

  verify(clientId: string, secret: string): ApiClient | null {
    const r = db.prepare('SELECT * FROM api_clients WHERE client_id = ?').get(clientId) as
      | Row
      | undefined
    if (!r) return null
    return hash(secret) === s(r.secret_hash) ? toApiClient(r) : null
  },

  remove(userId: string, id: string): boolean {
    const r = db.prepare('DELETE FROM api_clients WHERE id = ? AND user_id = ?').run(id, userId)
    return Number(r.changes) > 0
  },
}
