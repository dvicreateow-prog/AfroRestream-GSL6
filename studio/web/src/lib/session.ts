/*
 * Client session.
 *
 * The API uses bearer tokens rather than cookies, because the app and the API are
 * served from different origins and browsers increasingly block third-party cookies.
 * The token is kept in localStorage and attached to every request.
 */
import { api } from './api'

const TOKEN_KEY = 'studio.session.token'

export interface SessionUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

let cachedToken: string | null = null

export function getToken(): string | null {
  if (cachedToken !== null) return cachedToken
  try {
    cachedToken = localStorage.getItem(TOKEN_KEY)
  } catch {
    cachedToken = null
  }
  return cachedToken
}

export function setToken(token: string | null) {
  cachedToken = token
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private mode - the in-memory copy still works for this tab */
  }
}

/**
 * OAuth hands the token back in the URL fragment, which never reaches a server and
 * stays out of proxy and referrer logs. Consume it and clean the address bar.
 */
export function captureTokenFromUrl(): boolean {
  const hash = window.location.hash
  if (!hash.startsWith('#token=')) return false
  const token = decodeURIComponent(hash.slice('#token='.length))
  if (!token) return false
  setToken(token)
  history.replaceState(null, '', window.location.pathname + window.location.search)
  return true
}

/* ------------------------------------------------------------------ */
/* Authenticated fetch                                                 */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(init.body ? { 'content-type': 'application/json' } : {}),
    ...((init.headers as Record<string, string>) ?? {}),
  }
  if (token) headers.authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(api(path), { ...init, headers })
  } catch {
    throw new ApiError('Could not reach the studio server.', 0)
  }

  /* A stale or revoked token should log the user out rather than loop. */
  if (res.status === 401) {
    setToken(null)
    throw new ApiError('Sign in required.', 401)
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) message = body.error
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/* ------------------------------------------------------------------ */
/* Auth operations                                                     */
/* ------------------------------------------------------------------ */

export interface AuthProviders {
  providers: { id: string; label: string }[]
  devLogin: boolean
}

export const auth = {
  providers: () => apiFetch<AuthProviders>('/api/auth/providers'),

  me: () => apiFetch<{ user: SessionUser }>('/api/auth/me').then((r) => r.user),

  /** Full-page redirect: OAuth cannot complete inside fetch. */
  startOAuth(provider: string) {
    const returnTo = window.location.origin + window.location.pathname
    window.location.href = api(
      `/api/auth/${provider}/start?returnTo=${encodeURIComponent(returnTo)}`,
    )
  },

  /** Development only; the server refuses this in production. */
  async devLogin(email: string, name: string): Promise<SessionUser> {
    const r = await apiFetch<{ token: string; user: SessionUser }>('/api/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    })
    setToken(r.token)
    return r.user
  },

  async logout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      /* revoking server-side is best effort; the local token goes regardless */
    }
    setToken(null)
  },
}
