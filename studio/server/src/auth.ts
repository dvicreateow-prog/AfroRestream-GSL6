/*
 * Authentication.
 *
 * Flow: sign in with a provider -> a session token -> every API call carries it.
 * Destinations, stream keys and settings all hang off the resulting account, so a
 * user only ever sees their own.
 *
 * Bearer tokens rather than cookies, deliberately: the front end is served from a
 * different origin to the API (static host + API host), which makes session cookies
 * third-party. Browsers increasingly block those by default. A token in the
 * Authorization header has no such problem.
 *
 * Only OAuth is supported - no passwords are stored, hashed or reset anywhere.
 */
import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { sessions, users, type User } from './repos.ts'

/* ------------------------------------------------------------------ */
/* Request typing                                                      */
/* ------------------------------------------------------------------ */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User
      sessionId?: string
    }
  }
}

/* ------------------------------------------------------------------ */
/* Providers                                                           */
/* ------------------------------------------------------------------ */

interface ProviderConfig {
  id: 'github' | 'google'
  label: string
  authorizeUrl: string
  tokenUrl: string
  scope: string
  clientId?: string
  clientSecret?: string
}

const PROVIDERS: Record<string, ProviderConfig> = {
  github: {
    id: 'github',
    label: 'GitHub',
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: 'read:user user:email',
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  google: {
    id: 'google',
    label: 'Google',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'openid email profile',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
}

export const configuredProviders = (): { id: string; label: string }[] =>
  Object.values(PROVIDERS)
    .filter((p) => p.clientId && p.clientSecret)
    .map((p) => ({ id: p.id, label: p.label }))

/* The public origin of this API, used to build the OAuth redirect. */
const apiOrigin = (req: Request): string =>
  process.env.PUBLIC_API_ORIGIN ?? `${req.protocol}://${req.get('host')}`

/* Where to send the browser once sign-in completes. */
const appOrigin = (): string =>
  process.env.PUBLIC_APP_ORIGIN ?? process.env.CORS_ORIGIN?.split(',')[0]?.trim() ?? ''

/* ------------------------------------------------------------------ */
/* CSRF state                                                          */
/* ------------------------------------------------------------------ */

/**
 * Short-lived state values. An OAuth callback whose state we did not issue is
 * rejected, which is what stops a third party from replaying a callback at us.
 */
const pendingStates = new Map<string, { provider: string; createdAt: number; returnTo?: string }>()
const STATE_TTL_MS = 10 * 60 * 1000

function issueState(provider: string, returnTo?: string): string {
  const state = randomBytes(24).toString('base64url')
  pendingStates.set(state, { provider, createdAt: Date.now(), returnTo })
  /* Opportunistic sweep - this map should never grow large. */
  for (const [k, v] of pendingStates) {
    if (Date.now() - v.createdAt > STATE_TTL_MS) pendingStates.delete(k)
  }
  return state
}

function consumeState(state: string, provider: string) {
  const entry = pendingStates.get(state)
  if (!entry) return null
  pendingStates.delete(state)
  if (entry.provider !== provider) return null
  if (Date.now() - entry.createdAt > STATE_TTL_MS) return null
  return entry
}

/* ------------------------------------------------------------------ */
/* Middleware                                                          */
/* ------------------------------------------------------------------ */

function readToken(req: Request): string | null {
  const header = req.get('authorization')
  if (header?.startsWith('Bearer ')) return header.slice(7).trim()
  /* Allows the ingest WebSocket to authenticate via query string. */
  const q = req.query.access_token
  return typeof q === 'string' && q ? q : null
}

/** Populates req.user when a valid token is present. Never rejects. */
export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req)
  if (token) {
    const user = sessions.resolve(token)
    if (user) {
      req.user = user
      req.sessionId = token
    }
  }
  next()
}

/** Rejects the request unless a valid session is present. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Sign in required' })
    return
  }
  next()
}

/** Resolve a session token outside Express, for WebSocket upgrades. */
export function userFromToken(token: string | null | undefined): User | null {
  return token ? sessions.resolve(token) : null
}

/* ------------------------------------------------------------------ */
/* Provider profile fetching                                           */
/* ------------------------------------------------------------------ */

interface Profile {
  subject: string
  email: string
  name: string
  avatarUrl: string | null
}

async function fetchGitHubProfile(accessToken: string): Promise<Profile> {
  const headers = {
    authorization: `Bearer ${accessToken}`,
    accept: 'application/vnd.github+json',
    'user-agent': 'studio-api',
  }

  const me = (await (await fetch('https://api.github.com/user', { headers })).json()) as {
    id?: number
    login?: string
    name?: string
    email?: string
    avatar_url?: string
  }
  if (!me.id) throw new Error('GitHub did not return a profile')

  let email = me.email ?? ''
  if (!email) {
    /* Primary email is private by default and needs the dedicated endpoint. */
    const list = (await (
      await fetch('https://api.github.com/user/emails', { headers })
    ).json()) as { email: string; primary: boolean; verified: boolean }[]
    email = list?.find((e) => e.primary && e.verified)?.email ?? list?.[0]?.email ?? ''
  }
  if (!email) throw new Error('No verified email on the GitHub account')

  return {
    subject: String(me.id),
    email,
    name: me.name || me.login || email,
    avatarUrl: me.avatar_url ?? null,
  }
}

async function fetchGoogleProfile(accessToken: string): Promise<Profile> {
  const info = (await (
    await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { authorization: `Bearer ${accessToken}` },
    })
  ).json()) as {
    sub?: string
    email?: string
    email_verified?: boolean
    name?: string
    picture?: string
  }
  if (!info.sub) throw new Error('Google did not return a profile')
  if (!info.email || info.email_verified === false) {
    throw new Error('A verified Google email is required')
  }
  return {
    subject: info.sub,
    email: info.email,
    name: info.name || info.email,
    avatarUrl: info.picture ?? null,
  }
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

export function authRouter() {
  const router = express.Router()

  /** Which sign-in buttons the client should show. */
  router.get('/auth/providers', (_req, res) => {
    res.json({
      providers: configuredProviders(),
      devLogin: process.env.NODE_ENV !== 'production',
    })
  })

  router.get('/auth/me', (req, res) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not signed in' })
      return
    }
    res.json({ user: req.user })
  })

  router.post('/auth/logout', (req, res) => {
    if (req.sessionId) sessions.revoke(req.sessionId)
    res.json({ ok: true })
  })

  /**
   * Development sign-in. Never available in production - without it there would be
   * no way to exercise the authenticated API before OAuth apps exist.
   */
  router.post('/auth/dev-login', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.status(404).json({ error: 'Not available' })
      return
    }
    const email = String(req.body?.email ?? 'dev@localhost').toLowerCase()
    const user = users.upsertFromOAuth({
      provider: 'dev',
      subject: email,
      email,
      name: String(req.body?.name ?? 'Developer'),
    })
    const session = sessions.create(user.id, { ip: req.ip })
    res.json({ token: session.id, user })
  })

  /** Step 1: redirect the browser to the provider. */
  router.get('/auth/:provider/start', (req, res) => {
    const provider = PROVIDERS[req.params.provider]
    if (!provider?.clientId || !provider.clientSecret) {
      res.status(404).json({ error: `${req.params.provider} sign-in is not configured` })
      return
    }
    const state = issueState(provider.id, String(req.query.returnTo ?? ''))
    const url = new URL(provider.authorizeUrl)
    url.searchParams.set('client_id', provider.clientId)
    url.searchParams.set('redirect_uri', `${apiOrigin(req)}/api/auth/${provider.id}/callback`)
    url.searchParams.set('scope', provider.scope)
    url.searchParams.set('state', state)
    url.searchParams.set('response_type', 'code')
    if (provider.id === 'google') url.searchParams.set('access_type', 'online')
    res.redirect(url.toString())
  })

  /** Step 2: exchange the code, create a session, hand the token to the app. */
  router.get('/auth/:provider/callback', async (req, res) => {
    const provider = PROVIDERS[req.params.provider]
    if (!provider?.clientId || !provider.clientSecret) {
      res.status(404).send('Provider not configured')
      return
    }

    const code = String(req.query.code ?? '')
    const state = String(req.query.state ?? '')
    const entry = consumeState(state, provider.id)

    if (!code || !entry) {
      res.status(400).send('Invalid or expired sign-in attempt. Please try again.')
      return
    }

    try {
      const tokenRes = await fetch(provider.tokenUrl, {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: provider.clientId,
          client_secret: provider.clientSecret,
          code,
          redirect_uri: `${apiOrigin(req)}/api/auth/${provider.id}/callback`,
          grant_type: 'authorization_code',
        }),
      })
      const payload = (await tokenRes.json()) as { access_token?: string; error?: string }
      if (!payload.access_token) {
        throw new Error(payload.error || 'Token exchange failed')
      }

      const profile =
        provider.id === 'github'
          ? await fetchGitHubProfile(payload.access_token)
          : await fetchGoogleProfile(payload.access_token)

      const user = users.upsertFromOAuth({ provider: provider.id, ...profile })
      const session = sessions.create(user.id, {
        userAgent: req.get('user-agent') ?? undefined,
        ip: req.ip,
      })

      /* Hand the token back through the URL fragment: fragments are not sent to
       * servers and stay out of proxy and referrer logs. */
      const target = entry.returnTo || appOrigin()
      if (!target) {
        res.json({ token: session.id, user })
        return
      }
      res.redirect(`${target}#token=${encodeURIComponent(session.id)}`)
    } catch (err) {
      res.status(502).send(`Sign-in failed: ${(err as Error).message}`)
    }
  })

  return router
}

/** Constant-time compare, for any future shared-secret checks. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}
