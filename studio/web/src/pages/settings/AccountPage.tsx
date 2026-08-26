import { useState } from 'react'
import { Icon } from '../../components/Icon'
import {
  Button, Card, PageHeader, Field, Input, Select, Toggle,
  SecretField, Badge,
} from '../../components/ui'

type Session = {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  current: boolean
}

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-7)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-4)' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (UTC-3)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+1)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (UTC+2)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Espanol' },
  { value: 'pt', label: 'Portugues' },
  { value: 'de', label: 'Deutsch' },
]

const SEED_SESSIONS: Session[] = [
  {
    id: 's1',
    device: 'MacBook Pro 16"',
    browser: 'Chrome 128',
    location: 'Austin, TX',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: 's2',
    device: 'iPhone 15 Pro',
    browser: 'Studio Mobile',
    location: 'Austin, TX',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: 's3',
    device: 'Windows Desktop',
    browser: 'Edge 127',
    location: 'Denver, CO',
    lastActive: 'Yesterday, 9:14 PM',
    current: false,
  },
]

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AccountPage() {
  const [displayName, setDisplayName] = useState('Dana Ruiz')
  const [email, setEmail] = useState('dana@brightroom.tv')
  const [timezone, setTimezone] = useState('America/New_York')
  const [language, setLanguage] = useState('en')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwNotice, setPwNotice] = useState<string | null>(null)

  const [twoFactor, setTwoFactor] = useState(false)
  const [sessions, setSessions] = useState<Session[]>(SEED_SESSIONS)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteText, setDeleteText] = useState('')

  const mismatch = confirmPw.length > 0 && newPw !== confirmPw
  const tooShort = newPw.length > 0 && newPw.length < 8
  const canUpdatePw =
    currentPw.length > 0 && newPw.length >= 8 && newPw === confirmPw

  function handleSaveProfile() {
    setSavedAt(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    )
  }

  function handleUpdatePassword() {
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    setPwNotice('Password updated. Other devices will need to sign in again.')
  }

  function revoke(id: string) {
    setSessions((prev: Session[]) => prev.filter((s: Session) => s.id !== id))
  }

  return (
    <div className="ui-stack">
      <PageHeader
        title="Account"
        description="Manage your profile details, sign-in security, and the devices connected to your studio."
      />

      <Card
        title="Profile"
        description="This is how you appear to guests and teammates in the studio."
        actions={savedAt ? <Badge tone="success">Saved {savedAt}</Badge> : undefined}
      >
        <div className="ui-stack">
          <div className="ui-row" style={{ alignItems: 'center', gap: 'var(--sp-md)' }}>
            <div
              aria-hidden="true"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--brand-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '0.02em',
                flex: '0 0 auto',
              }}
            >
              {initialsOf(displayName)}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{displayName || 'Unnamed host'}</div>
              <div style={{ color: 'var(--c-text-dim)', fontSize: 13 }}>{email}</div>
            </div>
          </div>

          <div className="ui-grid ui-grid--2">
            <Field label="Display name" hint="Shown on lower thirds and in chat.">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </Field>
            <Field label="Email" hint="Used for sign-in and stream alerts.">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.tv"
              />
            </Field>
            <Field label="Timezone" hint="Schedules and analytics use this zone.">
              <Select value={timezone} onChange={setTimezone} options={TIMEZONES} />
            </Field>
            <Field label="Language">
              <Select value={language} onChange={setLanguage} options={LANGUAGES} />
            </Field>
          </div>

          <div className="ui-row">
            <Button variant="primary" icon="check" onClick={handleSaveProfile}>
              Save changes
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title="Password"
        description="Use at least 8 characters. A passphrase of three unrelated words works well."
      >
        <div className="ui-stack">
          <div className="ui-grid ui-grid--3">
            <Field label="Current password">
              <Input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <Field
              label="New password"
              hint="Minimum 8 characters."
              error={tooShort ? 'Too short - use at least 8 characters.' : undefined}
            >
              <Input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
            <Field
              label="Confirm new password"
              error={mismatch ? 'Passwords do not match.' : undefined}
            >
              <Input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
          </div>

          {pwNotice ? (
            <div style={{ color: 'var(--c-green)', fontSize: 13 }}>{pwNotice}</div>
          ) : null}

          <div className="ui-row">
            <Button variant="primary" disabled={!canUpdatePw} onClick={handleUpdatePassword}>
              Update password
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title="Two-factor authentication"
        description="Add a second step at sign-in so a leaked password is not enough on its own."
        actions={
          twoFactor ? <Badge tone="success">On</Badge> : <Badge tone="warning">Off</Badge>
        }
      >
        <div className="ui-stack">
          <Toggle
            checked={twoFactor}
            onChange={(v: boolean) => setTwoFactor(v)}
            label="Require a verification code"
            hint="We will ask for a 6-digit code from your authenticator app on every new device."
          />
          {twoFactor ? (
            <SecretField
              label="Recovery code"
              value="7QK4-92MD-XR18-VT60"
              hint="Store this somewhere safe. It is the only way back in if you lose your device."
              readOnly
            />
          ) : null}
        </div>
      </Card>

      <Card
        title="Sessions"
        description="Devices currently signed in to your account."
      >
        <div className="ui-list">
          {sessions.map((s: Session) => (
            <div className="ui-list__item" key={s.id}>
              <Icon name={s.current ? 'signal' : 'lock'} />
              <div className="ui-list__grow">
                <div className="ui-list__title">
                  {s.device}
                  {s.current ? (
                    <>
                      {' '}
                      <Badge tone="brand">This device</Badge>
                    </>
                  ) : null}
                </div>
                <div className="ui-list__sub">
                  {s.browser} - {s.location} - {s.lastActive}
                </div>
              </div>
              <Button variant="ghost" size="sm" icon="close" onClick={() => revoke(s.id)}>
                Revoke
              </Button>
            </div>
          ))}
          {sessions.length === 0 ? (
            <div className="ui-list__item">
              <div className="ui-list__grow">
                <div className="ui-list__sub">No other sessions are signed in.</div>
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      <Card
        title="Danger zone"
        description="Deleting your account removes every broadcast, recording, destination, and clip. This is permanent and cannot be undone."
      >
        <div className="ui-stack">
          {!deleteOpen ? (
            <div className="ui-row">
              <Button
                variant="danger"
                icon="trash"
                onClick={() => {
                  setDeleteOpen(true)
                  setDeleteText('')
                }}
              >
                Delete account
              </Button>
            </div>
          ) : (
            <div className="ui-stack">
              <Field
                label="Type DELETE to confirm"
                hint="This immediately schedules your workspace for erasure."
              >
                <Input
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="DELETE"
                />
              </Field>
              <div className="ui-row">
                <Button variant="danger" disabled={deleteText !== 'DELETE'}>
                  Confirm deletion
                </Button>
                <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
