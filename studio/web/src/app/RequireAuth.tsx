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
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

type Status = 'checking' | 'authed' | 'anonymous' | 'offline'

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [status, setStatus] = useState<Status>('checking')
  const [user, setUser] = useState<SessionUser | null>(null)
  const [detail, setDetail] = useState('')

  const check = useCallback(async () => {
    /* An OAuth redirect lands here with the token in the fragment. */
    captureTokenFromUrl()

    /* Always ask the server rather than short-circuiting on a missing token: in
     * single-user mode it answers with the local operator and no sign-in is
     * needed at all. Only a genuine 401 means we must send the user to sign in. */
    try {
      setUser(await auth.me())
      setStatus('authed')
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) {
        setDetail(e.message)
        setStatus('offline')
      } else {
        /* 401: the token was stale and has already been cleared. */
        setStatus('anonymous')
      }
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

  if (status === 'checking') {
    return (
      <div className="authGate">
        <span className="ui-spinner" />
        <p>Checking your session…</p>
      </div>
    )
  }

  if (status === 'offline') {
    return (
      <div className="authGate">
        <Icon name="warning" size={26} />
        <h2>Can&apos;t reach the studio server</h2>
        <p>{detail}</p>
        <button className="authGate__btn" onClick={() => void check()}>
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
    <SessionContext.Provider value={{ user, signOut, refresh: check }}>
      {children}
    </SessionContext.Provider>
  )
}
