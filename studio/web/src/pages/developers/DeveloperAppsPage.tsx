import { useState } from 'react'
import {
  Button, Card, PageHeader, Field, Input, Textarea,
  SecretField, EmptyState,
} from '../../components/ui'

const ALL_SCOPES = [
  'profile.read',
  'channel.read',
  'channel.write',
  'stream.read',
  'stream.write',
  'chat.read',
  'chat.write',
  'clips.read',
]

type App = {
  id: string
  name: string
  description: string
  clientId: string
  clientSecret: string
  redirects: string[]
  scopes: string[]
  createdAt: string
}

function rand(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
}

function newClientId(): string {
  return 'rsc_' + rand()
}

function newClientSecret(): string {
  return 'rsc_sec_' + rand() + rand()
}

const SEED: App[] = [
  {
    id: 'a1',
    name: 'Green Room Companion',
    description: 'Mobile companion that lets guests join a show and check their mic before going live.',
    clientId: 'rsc_7fd2a9c41b8e0347',
    clientSecret: 'rsc_sec_91ab34cd77e2f508be1049ac',
    redirects: ['https://greenroom.example.com/oauth/callback', 'http://localhost:5173/callback'],
    scopes: ['profile.read', 'channel.read', 'stream.read'],
    createdAt: 'Mar 4, 2026',
  },
  {
    id: 'a2',
    name: 'Clip Harvester',
    description: 'Pulls highlight clips after each broadcast and pushes them to our editing queue.',
    clientId: 'rsc_c05e18b7d4a92f66',
    clientSecret: 'rsc_sec_4d7c22fa9b310e85cc74d162',
    redirects: ['https://harvester.example.com/auth/return'],
    scopes: ['clips.read', 'stream.read', 'chat.read'],
    createdAt: 'Jan 22, 2026',
  },
]

function isValidUri(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://')
}

const chipStyle = (selected: boolean): React.CSSProperties => ({
  padding: '5px 12px',
  borderRadius: 999,
  border: '1px solid var(--c-line)',
  background: selected ? 'var(--brand-primary)' : 'var(--c-elevated)',
  color: selected ? '#fff' : 'var(--c-text-dim)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  lineHeight: 1.6,
})

export function DeveloperAppsPage() {
  const [apps, setApps] = useState<App[]>(SEED)
  const [creating, setCreating] = useState(false)
  const [formName, setFormName] = useState('')
  const [formRedirect, setFormRedirect] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formError, setFormError] = useState<string | undefined>(undefined)
  const [uriDrafts, setUriDrafts] = useState<Record<string, string>>({})
  const [uriErrors, setUriErrors] = useState<Record<string, string | undefined>>({})

  function openForm() {
    setFormName('')
    setFormRedirect('')
    setFormDesc('')
    setFormError(undefined)
    setCreating(true)
  }

  function createApp() {
    if (!formName.trim()) {
      setFormError('Give the application a name.')
      return
    }
    if (!isValidUri(formRedirect.trim())) {
      setFormError('Redirect URI must start with http:// or https://')
      return
    }
    const app: App = {
      id: rand(),
      name: formName.trim(),
      description: formDesc.trim(),
      clientId: newClientId(),
      clientSecret: newClientSecret(),
      redirects: [formRedirect.trim()],
      scopes: ['profile.read'],
      createdAt: 'Just now',
    }
    setApps((prev: App[]) => [app, ...prev])
    setCreating(false)
  }

  function updateApp(id: string, patch: Partial<App>) {
    setApps((prev: App[]) => prev.map((a: App) => (a.id === id ? { ...a, ...patch } : a)))
  }

  function removeApp(id: string) {
    setApps((prev: App[]) => prev.filter((a: App) => a.id !== id))
  }

  function toggleScope(app: App, scope: string) {
    const next = app.scopes.includes(scope)
      ? app.scopes.filter((s: string) => s !== scope)
      : [...app.scopes, scope]
    updateApp(app.id, { scopes: next })
  }

  function addUri(app: App) {
    const draft = (uriDrafts[app.id] ?? '').trim()
    if (!isValidUri(draft)) {
      setUriErrors((prev: Record<string, string | undefined>) => ({
        ...prev,
        [app.id]: 'Enter a full URI starting with http:// or https://',
      }))
      return
    }
    if (app.redirects.includes(draft)) {
      setUriErrors((prev: Record<string, string | undefined>) => ({
        ...prev,
        [app.id]: 'That URI is already registered.',
      }))
      return
    }
    updateApp(app.id, { redirects: [...app.redirects, draft] })
    setUriDrafts((prev: Record<string, string>) => ({ ...prev, [app.id]: '' }))
    setUriErrors((prev: Record<string, string | undefined>) => ({ ...prev, [app.id]: undefined }))
  }

  function removeUri(app: App, uri: string) {
    updateApp(app.id, { redirects: app.redirects.filter((u: string) => u !== uri) })
  }

  return (
    <div className="ui-stack">
      <PageHeader
        title="Applications"
        description="Register the apps and integrations that talk to our API. Each application gets its own credentials, redirect URIs and scope grants."
        actions={
          <Button icon="plus" variant="primary" onClick={openForm}>
            New application
          </Button>
        }
      />

      {creating && (
        <Card title="Register an application" description="You can change any of this later.">
          <div className="ui-stack">
            <Field label="Application name" hint="Shown to people on the consent screen.">
              <Input
                value={formName}
                placeholder="Green Room Companion"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
              />
            </Field>
            <Field
              label="Redirect URI"
              hint="Where we send people back after they approve access."
              error={formError}
            >
              <Input
                value={formRedirect}
                placeholder="https://your-app.example.com/oauth/callback"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormRedirect(e.target.value)}
              />
            </Field>
            <Field label="Description" hint="Optional. A sentence about what the app does.">
              <Textarea
                value={formDesc}
                rows={3}
                placeholder="Lets guests check their camera and mic before a show."
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormDesc(e.target.value)}
              />
            </Field>
            <div className="ui-row">
              <Button variant="primary" icon="check" onClick={createApp}>
                Create application
              </Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {apps.length === 0 && !creating && (
        <EmptyState
          icon="browser"
          title="No applications yet"
          description="Register an application to get a client ID and secret, then send people through the OAuth flow to connect their account."
          action={
            <Button icon="plus" variant="primary" onClick={openForm}>
              New application
            </Button>
          }
        />
      )}

      {apps.map((app: App) => (
        <Card
          key={app.id}
          title={app.name}
          description={app.description || `Created ${app.createdAt}`}
          actions={
            <div className="ui-row">
              <Button variant="ghost" icon="pencil" size="sm">
                Edit
              </Button>
              <Button variant="ghost" icon="trash" size="sm" onClick={() => removeApp(app.id)}>
                Delete
              </Button>
            </div>
          }
        >
          <div className="ui-stack">
            <SecretField label="Client ID" value={app.clientId} readOnly />
            <SecretField
              label="Client secret"
              hint="Regenerating immediately invalidates the previous secret."
              value={app.clientSecret}
              readOnly
              onRegenerate={() => updateApp(app.id, { clientSecret: newClientSecret() })}
            />

            <Field
              label="Redirect URIs"
              hint="Exact matches only — query strings and trailing slashes count."
              error={uriErrors[app.id]}
            >
              <div className="ui-stack">
                {app.redirects.length > 0 && (
                  <div className="ui-list">
                    {app.redirects.map((uri: string) => (
                      <div className="ui-list__item" key={uri}>
                        <div className="ui-list__grow">
                          <div className="ui-list__title" style={{ wordBreak: 'break-all' }}>
                            {uri}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          icon="trash"
                          size="sm"
                          onClick={() => removeUri(app, uri)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="ui-row">
                  <Input
                    value={uriDrafts[app.id] ?? ''}
                    placeholder="https://your-app.example.com/oauth/callback"
                    style={{ flex: 1 }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUriDrafts((prev: Record<string, string>) => ({
                        ...prev,
                        [app.id]: e.target.value,
                      }))
                    }
                  />
                  <Button variant="secondary" icon="plus" onClick={() => addUri(app)}>
                    Add URI
                  </Button>
                </div>
              </div>
            </Field>

            <Field label="Scopes" hint="Only what the app requests will appear on the consent screen.">
              <div className="ui-row" style={{ flexWrap: 'wrap', gap: 'var(--sp-sm, 8px)' }}>
                {ALL_SCOPES.map((scope: string) => {
                  const selected = app.scopes.includes(scope)
                  return (
                    <button
                      key={scope}
                      type="button"
                      aria-pressed={selected}
                      style={chipStyle(selected)}
                      onClick={() => toggleScope(app, scope)}
                    >
                      {scope}
                    </button>
                  )
                })}
              </div>
            </Field>
          </div>
        </Card>
      ))}
    </div>
  )
}
