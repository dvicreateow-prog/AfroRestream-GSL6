/*
 * Sign in.
 *
 * Talks to the real auth API: provider buttons are rendered from whatever the
 * server actually has configured, so nothing here is a button that does nothing.
 * If no provider is configured yet, the development sign-in is offered instead -
 * the server refuses that route in production.
 */
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { ApiError, auth, captureTokenFromUrl, getToken, type AuthProviders } from '../lib/session'
import './signin.css'

const PROVIDER_ICON: Record<string, IconName> = {
  github: 'browser',
  google: 'people',
}

export function SignInPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<AuthProviders | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const [devEmail, setDevEmail] = useState('')
  const [devName, setDevName] = useState('')

  /* If we already hold a session, or OAuth just handed one back, go straight in. */
  const settle = useCallback(async () => {
    captureTokenFromUrl()
    if (!getToken()) return false
    try {
      await auth.me()
      navigate('/home', { replace: true })
      return true
    } catch {
      return false
    }
  }, [navigate])

  useEffect(() => {
    void (async () => {
      if (await settle()) return
      try {
        setState(await auth.providers())
      } catch (e) {
        setError(
          e instanceof ApiError && e.status === 0
            ? 'Cannot reach the studio server. Start it locally, or deploy the backend and set VITE_API_BASE.'
            : (e as Error).message,
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [settle])

  const devSignIn = async () => {
    setBusy(true)
    setError('')
    try {
      await auth.devLogin(devEmail.trim() || 'you@studio.local', devName.trim() || 'Studio user')
      navigate('/home', { replace: true })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const providers = state?.providers ?? []

  return (
    <div className="signin">
      <aside className="signin__story">
        <div className="signin__brand">
          <span className="signin__mark">STUDIO</span>
          <span className="signin__tag">CLONE</span>
        </div>

        <div>
          <h1 className="signin__headline">
            Every audience.
            <br />
            One broadcast.
          </h1>
          <p className="signin__sub">
            Compose your camera, screen and media onto one stage, then send it to every
            channel at once.
          </p>

          <ul className="signin__points">
            <li>
              <Icon name="layers" size={15} />
              Scenes, layouts and overlays on a 1920&times;1080 stage
            </li>
            <li>
              <Icon name="people" size={15} />
              Bring guests in from a browser link
            </li>
            <li>
              <Icon name="rtmp" size={15} />
              One encode, fanned out to every enabled channel
            </li>
          </ul>
        </div>

        <footer className="signin__foot">
          Your channels and stream keys stay on your own account.
        </footer>
      </aside>

      <main className="signin__main">
        <div className="signin__card">
          <span className="signin__eyebrow">WELCOME</span>
          <h2 className="signin__title">Sign in to your studio</h2>
          <p className="signin__lead">
            Your channels, stream keys and settings live on your account.
          </p>

          {loading ? (
            <div className="signin__loading">
              <span className="ui-spinner" />
              <span>Checking sign-in options…</span>
            </div>
          ) : (
            <>
              {providers.map((p) => (
                <button
                  key={p.id}
                  className="signin__provider"
                  onClick={() => auth.startOAuth(p.id)}
                >
                  <Icon name={PROVIDER_ICON[p.id] ?? 'people'} size={17} />
                  Continue with {p.label}
                </button>
              ))}

              {providers.length === 0 && !error && (
                <p className="signin__note">
                  No sign-in provider is configured on the server yet. Add
                  <code> GITHUB_CLIENT_ID </code> and <code> GITHUB_CLIENT_SECRET </code>
                  to enable it.
                </p>
              )}

              {state?.devLogin && (
                <>
                  {providers.length > 0 && (
                    <div className="signin__divider">
                      <span>or, while developing</span>
                    </div>
                  )}

                  <label className="signin__label" htmlFor="dev-email">
                    Email
                  </label>
                  <input
                    id="dev-email"
                    className="signin__input"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void devSignIn()}
                    placeholder="you@studio.local"
                    autoComplete="email"
                  />

                  <label className="signin__label" htmlFor="dev-name">
                    Display name
                  </label>
                  <input
                    id="dev-name"
                    className="signin__input"
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void devSignIn()}
                    placeholder="Studio user"
                    autoComplete="name"
                  />

                  <button
                    className="signin__go"
                    onClick={() => void devSignIn()}
                    disabled={busy}
                  >
                    {busy ? 'Signing in…' : 'Continue'}
                    <Icon name="arrowRight" size={16} />
                  </button>

                  <p className="signin__note">
                    Development sign-in. The server refuses this once
                    <code> NODE_ENV=production </code>.
                  </p>
                </>
              )}
            </>
          )}

          {error && (
            <div className="signin__error">
              <Icon name="warning" size={15} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
