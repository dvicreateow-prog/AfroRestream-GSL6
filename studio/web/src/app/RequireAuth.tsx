/*
 * Route guard.
 *
 * Everything behind the shell needs an account, because destinations, stream keys
 * and settings are all per-user. The guard resolves the session once and holds the
 * result in context so each page does not re-check.
 *
 * When the API is unreachable it does NOT bounce to sign-in - that would trap the
 * user in a redirect loop against a server that is simply not running. It says so
 * instead, and offers a retry.
 *
 * A backend that sleeps (Render's free plan spins down after ~15 minutes idle)
 * takes tens of seconds to answer its first request, and while it wakes the edge
 * returns 404/502/503 - or the browser reports a CORS failure, because an edge
 * error carries no CORS headers. None of those mean "signed out". They are
 * retried with a backoff, and only a genuine 401 sends anyone to sign in.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { ApiError, auth, captureTokenFromUrl, type SessionUser } from '../lib/session'

interface SessionState {
  user: SessionUser | null
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const SessionContext = createContext<SessionState>({
  user: null,
  signOut: async () => {},
  refresh: async () => {},
})

export const useSession = () => useContext(SessionContext)

type Status = 'checking' | 'waking' | 'authed' | 'anonymous' | 'offline'

/* 0 is a network or CORS failure. The rest are what a proxy returns while the
 * service behind it is still starting. */
const WAKEABLE = new Set([0, 404, 429, 500, 502, 503, 504])

/* Roughly 60s of patience in total, which covers a cold start on a free plan. */
const BACKOFF_MS = [1000, 2000, 3000, 5000, 7000, 9000, 11000, 22000]

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [status, setStatus] = useState<Status>('checking')
  const [user, setUser] = useState<SessionUser | null>(null)
  const [detail, setDetail] = useState('')
  const [attempt, setAttempt] = useState(0)
  const timer = useRef<number | null>(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  const check = useCallback(async (tries = 0) => {
    /* An OAuth redirect lands here with the token in the fragment. */
    captureTokenFromUrl()
    if (tries === 0) setStatus('checking')

    /* Always ask the server rather than short-circuiting on a missing token: in
     * single-user mode it answers with the local operator and no sign-in is
     * needed at all. Only a genuine 401 means we must send the user to sign in. */
    try {
      const next = await auth.me()
      if (!alive.current) return
      setUser(next)
      setAttempt(0)
      setStatus('authed')
    } catch (e) {
      if (!alive.current) return
      const code = e instanceof ApiError ? e.status : 0

      /* 401: the token was stale and has already been cleared. */
      if (code === 401) {
        setStatus('anonymous')
        return
      }

      if (WAKEABLE.has(code) && tries < BACKOFF_MS.length) {
        setAttempt(tries + 1)
        setStatus('waking')
        timer.current = window.setTimeout(() => {
          void check(tries + 1)
        }, BACKOFF_MS[tries])
        return
      }

      setDetail(e instanceof ApiError ? e.message : 'Could not reach the studio server.')
      setStatus('offline')
    }
  }, [])

  useEffect(() => {
    void check()
  }, [check])

  const signOut = useCallback(async () => {
    await auth.logout()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const retry = useCallback(() => {
    setAttempt(0)
    void check()
  }, [check])

  if (status === 'checking') {
    return (
      <div className="authGate">
        <span className="ui-spinner" />
        <p>Checking your session…</p>
      </div>
    )
  }

  if (status === 'waking') {
    return (
      <div className="authGate" role="status" aria-live="polite">
        <span className="ui-spinner" />
        <h2>Waking the studio server…</h2>
        <p>
          The backend sleeps when idle and takes a moment to start. Retrying
          automatically — attempt {attempt} of {BACKOFF_MS.length}.
        </p>
      </div>
    )
  }

  if (status === 'offline') {
    return (
      <div className="authGate">
        <Icon name="warning" size={26} />
        <h2>Can&apos;t reach the studio server</h2>
        <p>{detail}</p>
        <button className="authGate__btn" onClick={retry}>
          <Icon name="refresh" size={15} />
          Try again
        </button>
      </div>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  return (
    <SessionContext.Provider value={{ user, signOut, refresh: () => check() }}>
      {children}
    </SessionContext.Provider>
  )
}
