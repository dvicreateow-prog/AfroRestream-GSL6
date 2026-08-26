import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'

type IconName =
  | 'youtube' | 'twitch' | 'facebook' | 'linkedin' | 'x' | 'rtmp'

type Channel = {
  id: string
  name: string
  handle: string
  icon: IconName
  color: string
  enabled: boolean
}

const INITIAL: Channel[] = [
  { id: 'yt', name: 'YouTube', handle: 'Main Stage Live', icon: 'youtube', color: '#ff0033', enabled: true },
  { id: 'tw', name: 'Twitch', handle: 'mainstage_tv', icon: 'twitch', color: '#9146ff', enabled: true },
  { id: 'fb', name: 'Facebook', handle: 'Main Stage Page', icon: 'facebook', color: '#1877f2', enabled: false },
  { id: 'li', name: 'LinkedIn', handle: 'Main Stage Co.', icon: 'linkedin', color: '#0a66c2', enabled: false },
  { id: 'x', name: 'X', handle: '@mainstage', icon: 'x', color: '#e7e9ea', enabled: false },
  { id: 'rtmp', name: 'Custom RTMP', handle: 'rtmp://edge.mainstage.io/live', icon: 'rtmp', color: '#22d3ee', enabled: false },
]

const ZONES = [
  'UTC — Coordinated Universal Time',
  'America/Los_Angeles — Pacific',
  'America/New_York — Eastern',
  'Europe/London — GMT/BST',
  'Europe/Berlin — Central European',
  'Asia/Singapore — Singapore',
  'Australia/Sydney — Eastern Australia',
]

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 'var(--fw-medium)' as unknown as number,
  color: 'var(--c-text-mute)',
  marginBottom: 5,
  letterSpacing: '.02em',
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--c-surface)',
  border: '1px solid var(--c-line)',
  borderRadius: 'var(--r-sm)',
  color: 'var(--c-text)',
  fontSize: 12,
  padding: '8px 9px',
  outline: 'none',
  fontFamily: 'inherit',
}

export function ChannelsModal({ onClose }: { onClose: () => void }) {
  const [channels, setChannels] = useState<Channel[]>(INITIAL)
  const [mode, setMode] = useState<'now' | 'later'>('now')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [zone, setZone] = useState(ZONES[0])
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)

  const enabledCount = channels.filter((c) => c.enabled).length
  const total = channels.length
  const noneOn = enabledCount === 0

  const toggle = (id: string) => {
    setSaved(false)
    setChannels((list) => list.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)))
  }

  const addChannel = () => {
    const name = draft.trim()
    if (!name) return
    setChannels((list) => [
      ...list,
      {
        id: `rtmp-${list.length}-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        handle: 'Custom destination',
        icon: 'rtmp',
        color: '#22d3ee',
        enabled: true,
      },
    ])
    setDraft('')
    setAdding(false)
  }

  const footer = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <span style={{ fontSize: 11, color: 'var(--c-text-mute)', marginRight: 'auto' }}>
        {saved
          ? 'Destinations saved.'
          : mode === 'later'
            ? 'Broadcast will start automatically at the scheduled time.'
            : 'Going out live as soon as you hit the air.'}
      </span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: '1px solid var(--c-line)',
          color: 'var(--c-text-dim)',
          borderRadius: 'var(--r-sm)',
          padding: '7px 14px',
          fontSize: 12,
          fontWeight: 'var(--fw-medium)' as unknown as number,
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={noneOn}
        onClick={() => setSaved(true)}
        style={{
          background: noneOn ? 'var(--c-surface)' : 'var(--brand-primary)',
          border: '1px solid transparent',
          color: noneOn ? 'var(--c-text-mute)' : '#fff',
          borderRadius: 'var(--r-sm)',
          padding: '7px 16px',
          fontSize: 12,
          fontWeight: 'var(--fw-semibold)' as unknown as number,
          cursor: noneOn ? 'not-allowed' : 'pointer',
          opacity: noneOn ? 0.6 : 1,
        }}
      >
        Save
      </button>
    </div>
  )

  return (
    <Modal
      title="Channels & schedule"
      description="Choose where this broadcast goes out."
      width="lg"
      onClose={onClose}
      footer={footer}
    >
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* ---------------- Channels ---------------- */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 'var(--fw-semibold)' as unknown as number, color: 'var(--c-text)' }}>
              Channels
            </div>
            <div style={{ fontSize: 11, color: noneOn ? 'var(--c-yellow)' : 'var(--c-text-mute)' }}>
              {enabledCount} of {total} enabled
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {channels.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  background: 'var(--c-surface)',
                  border: `1px solid ${c.enabled ? 'var(--c-line)' : 'transparent'}`,
                  borderRadius: 'var(--r-md)',
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 'var(--r-sm)',
                    display: 'grid',
                    placeItems: 'center',
                    background: `${c.color}1f`,
                    color: c.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon name={c.icon} size={14} />
                </span>

                <span style={{ minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 'var(--fw-medium)' as unknown as number,
                      color: c.enabled ? 'var(--c-text)' : 'var(--c-text-dim)',
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 11,
                      color: 'var(--c-text-mute)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.handle}
                  </span>
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={c.enabled}
                  aria-label={`${c.enabled ? 'Disable' : 'Enable'} ${c.name}`}
                  onClick={() => toggle(c.id)}
                  style={{
                    width: 34,
                    height: 19,
                    flexShrink: 0,
                    padding: 2,
                    borderRadius: 999,
                    border: '1px solid var(--c-line)',
                    background: c.enabled ? 'var(--c-green)' : 'var(--c-elevated)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: c.enabled ? 'flex-end' : 'flex-start',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      width: 13,
                      height: 13,
                      borderRadius: '50%',
                      background: c.enabled ? '#0b1410' : 'var(--c-text-mute)',
                      display: 'block',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>

          {adding ? (
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input
                autoFocus
                value={draft}
                placeholder="Destination name"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') addChannel()
                  if (e.key === 'Escape') setAdding(false)
                }}
                style={fieldStyle}
              />
              <button
                type="button"
                onClick={addChannel}
                style={{
                  background: 'var(--brand-primary)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 'var(--r-sm)',
                  padding: '0 12px',
                  fontSize: 12,
                  fontWeight: 'var(--fw-semibold)' as unknown as number,
                  cursor: 'pointer',
                }}
              >
                <Icon name="check" size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              style={{
                marginTop: 8,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: 'transparent',
                border: '1px dashed var(--c-line)',
                color: 'var(--c-text-dim)',
                borderRadius: 'var(--r-md)',
                padding: '9px 10px',
                fontSize: 12,
                fontWeight: 'var(--fw-medium)' as unknown as number,
                cursor: 'pointer',
              }}
            >
              <Icon name="plus" size={13} />
              Add channel
            </button>
          )}
        </div>

        {/* ---------------- Schedule ---------------- */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 'var(--fw-semibold)' as unknown as number,
              color: 'var(--c-text)',
              marginBottom: 10,
            }}
          >
            Schedule
          </div>

          <div
            role="group"
            aria-label="Broadcast timing"
            style={{
              display: 'flex',
              gap: 3,
              padding: 3,
              background: 'var(--c-surface)',
              border: '1px solid var(--c-line)',
              borderRadius: 'var(--r-md)',
            }}
          >
            {([
              { id: 'now' as const, label: 'Go live now', icon: 'signal' as const },
              { id: 'later' as const, label: 'Schedule for later', icon: 'calendar' as const },
            ]).map((seg) => (
              <button
                key={seg.id}
                type="button"
                aria-pressed={mode === seg.id}
                onClick={() => {
                  setMode(seg.id)
                  setSaved(false)
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 8px',
                  borderRadius: 'var(--r-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 'var(--fw-medium)' as unknown as number,
                  background: mode === seg.id ? 'var(--c-elevated)' : 'transparent',
                  color: mode === seg.id ? 'var(--c-text)' : 'var(--c-text-mute)',
                }}
              >
                <Icon name={seg.icon} size={13} />
                {seg.label}
              </button>
            ))}
          </div>

          {mode === 'now' ? (
            <div
              style={{
                marginTop: 12,
                padding: '12px 12px',
                background: 'var(--c-surface)',
                border: '1px solid var(--c-line)',
                borderRadius: 'var(--r-md)',
                fontSize: 12,
                color: 'var(--c-text-dim)',
                lineHeight: 1.5,
              }}
            >
              The broadcast opens the moment you press the air button. Every enabled channel
              receives the same feed at your current output quality.
            </div>
          ) : (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle} htmlFor="ch-date">Date</label>
                  <input
                    id="ch-date"
                    type="date"
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                    style={fieldStyle}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle} htmlFor="ch-time">Start time</label>
                  <input
                    id="ch-time"
                    type="time"
                    value={time}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)}
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="ch-zone">Time zone</label>
                <select
                  id="ch-zone"
                  value={zone}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setZone(e.target.value)}
                  style={fieldStyle}
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  fontSize: 11,
                  color: 'var(--c-text-mute)',
                  lineHeight: 1.5,
                }}
              >
                <Icon name="info" size={13} />
                <span>
                  A scheduled broadcast needs at least one enabled channel. We publish the
                  event page as soon as you save
                  {date && time ? ` — set for ${date} at ${time}.` : '.'}
                </span>
              </div>
            </div>
          )}

          {noneOn && (
            <div
              role="status"
              style={{
                marginTop: 12,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                padding: '9px 10px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--c-yellow)',
                background: 'transparent',
                color: 'var(--c-yellow)',
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              <Icon name="warning" size={13} />
              <span>No channels are enabled. Turn on at least one destination before saving.</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
