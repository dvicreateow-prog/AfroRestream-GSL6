/*
 * Channels dialog.
 *
 * Talks to the real destinations API. The previous version held everything in local
 * state, so nothing it showed ever reached the server and Go Live had nowhere to
 * send the broadcast.
 */
import { useCallback, useEffect, useState } from 'react'
import { Icon, type IconName } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import {
  destinationsApi,
  PLATFORM_PRESETS,
  validateIngestUrl,
  type Destination,
} from '../../lib/destinations'
import { ApiError } from '../../lib/session'

const PLATFORM_ICON: Record<string, IconName> = {
  youtube: 'youtube',
  twitch: 'twitch',
  facebook: 'facebook',
  linkedin: 'linkedin',
  kick: 'kick',
  x: 'x',
  custom: 'rtmp',
}

const PLATFORM_COLOR: Record<string, string> = {
  youtube: '#ef4b55',
  twitch: '#7c5cfc',
  facebook: '#2864f0',
  linkedin: '#43c7e8',
  kick: '#24c875',
  custom: 'var(--c-text-mute)',
}

export function ChannelsModal({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const [adding, setAdding] = useState(false)
  const [preset, setPreset] = useState('youtube')
  const [name, setName] = useState('')
  const [url, setUrl] = useState(PLATFORM_PRESETS[0].ingest)
  const [key, setKey] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)


  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await destinationsApi.list())
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 401
          ? 'Sign in to manage your channels.'
          : (e as Error).message,
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const choosePreset = (id: string) => {
    setPreset(id)
    const p = PLATFORM_PRESETS.find((x) => x.id === id)
    if (p) {
      setUrl(p.ingest)
      if (!name) setName(p.label)
    }
  }

  const submit = async () => {
    const problem = validateIngestUrl(url)
    if (problem) {
      setFormError(problem)
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const created = await destinationsApi.create({
        platform: preset,
        name: name.trim() || PLATFORM_PRESETS.find((p) => p.id === preset)?.label || 'Channel',
        url: url.trim(),
        streamKey: key.trim(),
        enabled: true,
      })
      setRows((r) => [...r, created])
      setAdding(false)
      setName('')
      setKey('')
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (d: Destination) => {
    setBusyId(d.id)
    /* Optimistic, reverted if the server disagrees. */
    setRows((r) => r.map((x) => (x.id === d.id ? { ...x, enabled: !x.enabled } : x)))
    try {
      await destinationsApi.update(d.id, { enabled: !d.enabled })
    } catch (e) {
      setRows((r) => r.map((x) => (x.id === d.id ? { ...x, enabled: d.enabled } : x)))
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (d: Destination) => {
    setBusyId(d.id)
    try {
      await destinationsApi.remove(d.id)
      setRows((r) => r.filter((x) => x.id !== d.id))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  const enabledCount = rows.filter((r) => r.enabled).length
  const activePreset = PLATFORM_PRESETS.find((p) => p.id === preset)

  return (
    <Modal
      title="Channels"
      description="Every enabled channel receives the broadcast when you go live."
      width="lg"
      onClose={onClose}
      footer={
        <>
          <span style={{ marginRight: 'auto', fontSize: 12, color: 'var(--c-text-dim)' }}>
            {enabledCount} of {rows.length} enabled
          </span>
          <button className="ui-btn ui-btn--secondary ui-btn--md" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      {error && (
        <div className="panel__error" style={{ marginTop: 0, marginBottom: 14 }}>
          <Icon name="warning" size={14} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="ui-empty">
          <span className="ui-spinner" />
          <p>Loading your channels…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="ui-empty">
          <Icon name="rtmp" size={28} />
          <h3>No channels yet</h3>
          <p>Add the first place your broadcast should go.</p>
        </div>
      ) : (
        <div className="ui-list">
          {rows.map((d) => (
            <div className="ui-list__item" key={d.id}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 'var(--r-md)',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--c-surface)',
                  color: PLATFORM_COLOR[d.platform] ?? 'var(--c-text-dim)',
                  flex: 'none',
                }}
              >
                <Icon name={PLATFORM_ICON[d.platform] ?? 'rtmp'} size={16} />
              </span>

              <div className="ui-list__grow">
                <div className="ui-list__title">{d.name}</div>
                <div
                  className="ui-list__sub"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {d.url}
                  {d.streamKey ? ' · key set' : ' · no key'}
                </div>
              </div>

              <button
                role="switch"
                aria-checked={d.enabled}
                aria-label={d.enabled ? `Disable ${d.name}` : `Enable ${d.name}`}
                disabled={busyId === d.id}
                onClick={() => void toggle(d)}
                className={`ui-toggle ${d.enabled ? 'ui-toggle--on' : ''}`}
              >
                <span className="ui-toggle__knob" />
              </button>

              <button
                className="srcCard__mini srcCard__mini--danger"
                onClick={() => void remove(d)}
                disabled={busyId === d.id}
                aria-label={`Remove ${d.name}`}
              >
                <Icon name="trash" size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 'var(--r-lg)',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-line)',
          }}
        >
          <div className="modal__sectionTitle">Add a channel</div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
              gap: 6,
              marginBottom: 14,
            }}
          >
            {PLATFORM_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => choosePreset(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 9px',
                  borderRadius: 'var(--r-md)',
                  fontSize: 11,
                  fontWeight: 'var(--fw-medium)' as unknown as number,
                  background: preset === p.id ? 'var(--brand-primary)' : 'var(--c-elevated)',
                  color: preset === p.id ? '#fff' : 'var(--c-text-dim)',
                }}
              >
                <Icon name={PLATFORM_ICON[p.id] ?? 'rtmp'} size={13} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="ui-field">
            <label className="ui-field__label">Channel name</label>
            <input
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={activePreset?.label ?? 'My channel'}
            />
          </div>

          <div className="ui-field">
            <label className="ui-field__label">Ingest URL</label>
            <input
              className="ui-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="rtmp://…"
              spellCheck={false}
            />
            <p className="ui-field__hint">{activePreset?.help}</p>
          </div>

          <div className="ui-field">
            <label className="ui-field__label">Stream key</label>
            <input
              className="ui-input"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste the key from the platform"
              spellCheck={false}
              autoComplete="off"
            />
            <p className="ui-field__hint">
              Stored against your account and sent only to this platform.
            </p>
          </div>

          {formError && <p className="ui-field__error">{formError}</p>}

          <div className="ui-row" style={{ marginTop: 12 }}>
            <button
              className="ui-btn ui-btn--primary ui-btn--md"
              onClick={() => void submit()}
              disabled={saving}
            >
              {saving ? 'Adding…' : 'Add channel'}
            </button>
            <button
              className="ui-btn ui-btn--ghost ui-btn--md"
              onClick={() => {
                setAdding(false)
                setFormError('')
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="panel__add"
          style={{ marginTop: 16 }}
          onClick={() => setAdding(true)}
        >
          <Icon name="plus" size={14} />
          Add channel
        </button>
      )}
    </Modal>
  )
}
