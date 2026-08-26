/*
 * Persistence.
 *
 * Everything used to live in module-level Maps, so a restart wiped all state and a
 * single stream key was shared by every caller. This gives the API real storage.
 *
 * SQLite via node:sqlite - built into Node 22+, so no native module to compile and
 * nothing to provision in development. The queries are ordinary SQL, so moving to
 * Postgres later means swapping this file, not the callers.
 */
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const DB_PATH = process.env.DATABASE_PATH ?? path.resolve('server/data/studio.db')

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

export const db = new DatabaseSync(DB_PATH)

/* WAL keeps reads from blocking behind the broadcast writer. */
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')
db.exec('PRAGMA busy_timeout = 5000')

/* ------------------------------------------------------------------ */
/* Migrations                                                          */
/* ------------------------------------------------------------------ */

/**
 * Ordered, append-only. Each entry runs once and is recorded; never edit a
 * migration that has shipped - add a new one.
 */
const MIGRATIONS: { id: string; sql: string }[] = [
  {
    id: '001-core',
    sql: `
      CREATE TABLE users (
        id           TEXT PRIMARY KEY,
        email        TEXT UNIQUE NOT NULL,
        name         TEXT NOT NULL,
        avatar_url   TEXT,
        created_at   INTEGER NOT NULL,
        last_seen_at INTEGER
      );

      -- One row per linked provider, so a user can sign in with Google or GitHub
      -- and land on the same account when the verified email matches.
      CREATE TABLE identities (
        id          TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider    TEXT NOT NULL,
        subject     TEXT NOT NULL,
        created_at  INTEGER NOT NULL,
        UNIQUE (provider, subject)
      );

      CREATE TABLE sessions (
        id         TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        user_agent TEXT,
        ip         TEXT
      );
      CREATE INDEX idx_sessions_user ON sessions(user_id);

      -- Per-user ingest credential. Replaces the single process-global key.
      CREATE TABLE stream_keys (
        user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        key         TEXT UNIQUE NOT NULL,
        region      TEXT NOT NULL DEFAULT 'eu-west',
        rotated_at  INTEGER NOT NULL
      );

      CREATE TABLE destinations (
        id          TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform    TEXT NOT NULL,
        name        TEXT NOT NULL,
        url         TEXT NOT NULL,
        stream_key  TEXT NOT NULL DEFAULT '',
        enabled     INTEGER NOT NULL DEFAULT 1,
        created_at  INTEGER NOT NULL
      );
      CREATE INDEX idx_destinations_user ON destinations(user_id);
    `,
  },
  {
    id: '002-studio-state',
    sql: `
      CREATE TABLE scenes (
        id          TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        position    INTEGER NOT NULL,
        kind        TEXT NOT NULL,
        title       TEXT NOT NULL,
        subtitle    TEXT NOT NULL DEFAULT '',
        color       TEXT NOT NULL,
        layout      TEXT NOT NULL DEFAULT 'grid',
        source_ids  TEXT NOT NULL DEFAULT '[]',
        updated_at  INTEGER NOT NULL
      );
      CREATE INDEX idx_scenes_user ON scenes(user_id, position);

      CREATE TABLE overlays (
        id         TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scene_id   TEXT REFERENCES scenes(id) ON DELETE CASCADE,
        kind       TEXT NOT NULL,
        name       TEXT NOT NULL,
        visible    INTEGER NOT NULL DEFAULT 1,
        x REAL NOT NULL, y REAL NOT NULL, w REAL NOT NULL, h REAL NOT NULL,
        payload    TEXT NOT NULL DEFAULT '{}',
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX idx_overlays_user ON overlays(user_id);

      -- Free-form per-user settings, mirroring the client settings store.
      CREATE TABLE settings (
        user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        json       TEXT NOT NULL DEFAULT '{}',
        updated_at INTEGER NOT NULL
      );
    `,
  },
  {
    id: '003-broadcasts',
    sql: `
      CREATE TABLE broadcasts (
        id             TEXT PRIMARY KEY,
        user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title          TEXT NOT NULL DEFAULT '',
        profile        TEXT NOT NULL,
        started_at     INTEGER NOT NULL,
        ended_at       INTEGER,
        destination_ids TEXT NOT NULL DEFAULT '[]',
        peak_viewers   INTEGER NOT NULL DEFAULT 0,
        error          TEXT
      );
      CREATE INDEX idx_broadcasts_user ON broadcasts(user_id, started_at DESC);

      CREATE TABLE recordings (
        id           TEXT PRIMARY KEY,
        user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        broadcast_id TEXT REFERENCES broadcasts(id) ON DELETE SET NULL,
        filename     TEXT NOT NULL,
        bytes        INTEGER NOT NULL DEFAULT 0,
        duration_ms  INTEGER NOT NULL DEFAULT 0,
        status       TEXT NOT NULL DEFAULT 'recording',
        created_at   INTEGER NOT NULL
      );
      CREATE INDEX idx_recordings_user ON recordings(user_id, created_at DESC);

      CREATE TABLE clips (
        id           TEXT PRIMARY KEY,
        user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recording_id TEXT REFERENCES recordings(id) ON DELETE CASCADE,
        title        TEXT NOT NULL DEFAULT 'Clip',
        start_ms     INTEGER NOT NULL,
        end_ms       INTEGER NOT NULL,
        aspect       TEXT NOT NULL DEFAULT '16:9',
        status       TEXT NOT NULL DEFAULT 'queued',
        filename     TEXT,
        created_at   INTEGER NOT NULL
      );
      CREATE INDEX idx_clips_user ON clips(user_id, created_at DESC);

      CREATE TABLE events (
        id              TEXT PRIMARY KEY,
        user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title           TEXT NOT NULL,
        description     TEXT NOT NULL DEFAULT '',
        scheduled_for   INTEGER NOT NULL,
        timezone        TEXT NOT NULL DEFAULT 'UTC',
        destination_ids TEXT NOT NULL DEFAULT '[]',
        status          TEXT NOT NULL DEFAULT 'scheduled',
        created_at      INTEGER NOT NULL
      );
      CREATE INDEX idx_events_user ON events(user_id, scheduled_for);
    `,
  },
  {
    id: '004-api-clients',
    sql: `
      -- OAuth clients registered by users on the Developers page.
      CREATE TABLE api_clients (
        id            TEXT PRIMARY KEY,
        user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name          TEXT NOT NULL,
        description   TEXT NOT NULL DEFAULT '',
        client_id     TEXT UNIQUE NOT NULL,
        -- Stored as a SHA-256 hash; the plaintext is shown once at creation.
        secret_hash   TEXT NOT NULL,
        redirect_uris TEXT NOT NULL DEFAULT '[]',
        scopes        TEXT NOT NULL DEFAULT '[]',
        created_at    INTEGER NOT NULL
      );
      CREATE INDEX idx_api_clients_user ON api_clients(user_id);

      CREATE TABLE pull_links (
        id         TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        protocol   TEXT NOT NULL,
        url        TEXT NOT NULL,
        require_auth INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX idx_pull_links_user ON pull_links(user_id);
    `,
  },
]

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id      TEXT PRIMARY KEY,
      ran_at  INTEGER NOT NULL
    )
  `)

  const done = new Set(
    db.prepare('SELECT id FROM migrations').all().map((r) => String((r as { id: string }).id)),
  )

  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue
    /* Each migration is atomic: a failure leaves the schema untouched. */
    db.exec('BEGIN')
    try {
      db.exec(m.sql)
      db.prepare('INSERT INTO migrations (id, ran_at) VALUES (?, ?)').run(m.id, Date.now())
      db.exec('COMMIT')
      console.log(`[db] migrated ${m.id}`)
    } catch (err) {
      db.exec('ROLLBACK')
      throw new Error(`migration ${m.id} failed: ${(err as Error).message}`)
    }
  }
}

migrate()

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const newId = (prefix: string): string =>
  `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 22)}`

export const now = (): number => Date.now()

/** SQLite has no boolean type; store 0/1 and convert at the boundary. */
export const toBool = (v: unknown): boolean => v === 1 || v === true
export const fromBool = (v: boolean): number => (v ? 1 : 0)

export function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string') return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Run a set of statements atomically. */
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN')
  try {
    const out = fn()
    db.exec('COMMIT')
    return out
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

export function dbStats() {
  const count = (t: string) =>
    Number((db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n)
  return {
    path: DB_PATH,
    users: count('users'),
    destinations: count('destinations'),
    broadcasts: count('broadcasts'),
    recordings: count('recordings'),
  }
}
