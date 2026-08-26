import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useStudio } from '../../state/studioStore'

type Platform = 'youtube' | 'twitch' | 'facebook' | 'x' | 'studio'

type ChatMessage = {
  id: string
  platform: Platform
  author: string
  color: string
  text: string
  time: string
  pinned: boolean
}

type FilterId = 'all' | 'youtube' | 'twitch' | 'facebook' | 'x'

const FILTERS: { id: FilterId; label: string; icon: 'chat' | 'youtube' | 'twitch' | 'facebook' | 'x' }[] = [
  { id: 'all', label: 'All', icon: 'chat' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube' },
  { id: 'twitch', label: 'Twitch', icon: 'twitch' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook' },
  { id: 'x', label: 'X', icon: 'x' },
]

const PLATFORM_ICON: Record<Platform, 'youtube' | 'twitch' | 'facebook' | 'x' | 'chat'> = {
  youtube: 'youtube',
  twitch: 'twitch',
  facebook: 'facebook',
  x: 'x',
  studio: 'chat',
}

const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: 'YouTube',
  twitch: 'Twitch',
  facebook: 'Facebook',
  x: 'X',
  studio: 'Studio',
}

const SEED: ChatMessage[] = [
  { id: 'm1', platform: 'youtube', author: 'Nadia Foss', color: 'var(--c-red)', text: 'The new scene switcher looks so clean, what did you build it in?', time: '19:02', pinned: false },
  { id: 'm2', platform: 'twitch', author: 'pixelhaze', color: 'var(--c-purple)', text: 'audio is perfect tonight, no clipping at all', time: '19:03', pinned: false },
  { id: 'm3', platform: 'facebook', author: 'Marcus Reyes', color: 'var(--c-cyan)', text: 'Joining late from Lisbon. Did I miss the layout demo?', time: '19:04', pinned: false },
  { id: 'm4', platform: 'x', author: '@lumenlabs', color: 'var(--c-text)', text: 'Can you show the lower third editor again please', time: '19:06', pinned: false },
  { id: 'm5', platform: 'youtube', author: 'Priya Raman', color: 'var(--c-yellow)', text: 'Question for the Q&A: how do you handle guest bandwidth drops?', time: '19:08', pinned: false },
  { id: 'm6', platform: 'twitch', author: 'orbital_dev', color: 'var(--c-green)', text: 'that picture in picture transition is buttery', time: '19:09', pinned: false },
  { id: 'm7', platform: 'facebook', author: 'Elena Wu', color: 'var(--brand-primary)', text: 'Sharing this with my team right now', time: '19:11', pinned: false },
  { id: 'm8', platform: 'x', author: '@brightsignal', color: 'var(--c-cyan)', text: 'Does the ticker overlay pull from an RSS feed?', time: '19:12', pinned: false },
]

const REPLY_TARGETS: { id: string; label: string }[] = [
  { id: 'all', label: 'All channels' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'twitch', label: 'Twitch' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'x', label: 'X' },
]

export function ChatPanel() {
  const viewers = useStudio((s) => s.viewers)
  const [filter, setFilter] = useState<FilterId>('all')
  const [messages, setMessages] = useState<ChatMessage[]>(SEED)
  const [onStreamId, setOnStreamId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState('all')

  const visible = useMemo(
    () => messages.filter((m) => filter === 'all' || m.platform === filter),
    [messages, filter],
  )
  const pinned = visible.filter((m) => m.pinned)
  const rest = visible.filter((m) => !m.pinned)

  const togglePin = (id: string) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)))

  const toggleOnStream = (id: string) => setOnStreamId((prev) => (prev === id ? null : id))

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const platform: Platform = replyTo === 'all' ? 'studio' : (replyTo as Platform)
    setMessages((prev) => [
      ...prev,
      { id: `me-${now.getTime()}`, platform, author: 'You', color: 'var(--brand-primary)', text, time, pinned: false },
    ])
    setDraft('')
  }

  const row = (m: ChatMessage, isPinned: boolean) => {
    const live = onStreamId === m.id
    const hovered = hoverId === m.id
    return (
      <div
        key={m.id}
        onMouseEnter={() => setHoverId(m.id)}
        onMouseLeave={() => setHoverId((prev) => (prev === m.id ? null : prev))}
        style={{
          position: 'relative',
          display: 'flex',
          gap: 6,
          padding: '6px 8px',
          borderRadius: 'var(--r-sm)',
          borderLeft: isPinned ? '2px solid var(--brand-primary)' : '2px solid transparent',
          outline: live ? '1px solid var(--c-green)' : '1px solid transparent',
          background: hovered ? 'var(--c-elevated)' : isPinned ? 'var(--c-surface)' : 'transparent',
        }}
      >
        <span style={{ marginTop: 1, opacity: 0.85, flexShrink: 0 }}>
          <Icon name={PLATFORM_ICON[m.platform]} size={12} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1 }}>
            {isPinned && <Icon name="pin" size={10} />}
            <span style={{ fontSize: 11, fontWeight: 'var(--fw-semibold)', color: m.color }}>{m.author}</span>
            <span style={{ fontSize: 10, color: 'var(--c-text-mute)' }}>{m.time}</span>
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.4, color: 'var(--c-text-dim)', wordBreak: 'break-word' }}>
            {m.text}
          </div>
        </div>
        {hovered && (
          <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 2 }}>
            <button
              type="button"
              title={m.pinned ? 'Unpin message' : 'Pin message'}
              onClick={() => togglePin(m.id)}
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 18,
                height: 18,
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--c-line)',
                background: m.pinned ? 'var(--brand-primary)' : 'var(--c-panel)',
                color: 'var(--c-text)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <Icon name="pin" size={10} />
            </button>
            <button
              type="button"
              title={live ? 'Remove from stream' : 'Show on stream'}
              onClick={() => toggleOnStream(m.id)}
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 18,
                height: 18,
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--c-line)',
                background: live ? 'var(--c-green)' : 'var(--c-panel)',
                color: live ? '#04140b' : 'var(--c-text)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <Icon name="eye" size={10} />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, color: 'var(--c-text)' }}>
      <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid var(--c-line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'var(--fw-semibold)' }}>Live chat</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--c-text-mute)' }}>
            <Icon name="eye" size={11} />
            {viewers}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {FILTERS.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 'var(--fw-medium)',
                  borderRadius: 999,
                  border: `1px solid ${active ? 'var(--brand-primary)' : 'var(--c-line)'}`,
                  background: active ? 'var(--brand-primary)' : 'var(--c-surface)',
                  color: active ? '#fff' : 'var(--c-text-dim)',
                  cursor: 'pointer',
                }}
              >
                <Icon name={f.icon} size={11} />
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {pinned.length > 0 && (
          <>
            <div style={{ fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--c-text-mute)', padding: '4px 2px' }}>
              Pinned
            </div>
            {pinned.map((m) => row(m, true))}
            <div style={{ height: 1, background: 'var(--c-line)', margin: '6px 2px' }} />
          </>
        )}
        {rest.map((m) => row(m, false))}
        {visible.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--c-text-mute)', padding: '12px 4px', textAlign: 'center' }}>
            No messages from this channel yet.
          </div>
        )}
      </div>

      {onStreamId && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
            padding: '6px 10px',
            borderTop: '1px solid var(--c-line)',
            background: 'var(--c-surface)',
            fontSize: 11,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--c-green)' }}>
            <Icon name="eye" size={11} />1 message on stream
          </span>
          <button
            type="button"
            onClick={() => setOnStreamId(null)}
            style={{
              padding: '3px 8px',
              fontSize: 11,
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--c-line)',
              background: 'var(--c-panel)',
              color: 'var(--c-text-dim)',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      )}

      <div style={{ padding: 10, borderTop: '1px solid var(--c-line)', background: 'var(--c-panel)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <input
            value={draft}
            placeholder="Send a message"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                send()
              }
            }}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '6px 8px',
              fontSize: 11,
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--c-line)',
              background: 'var(--c-surface)',
              color: 'var(--c-text)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={draft.trim().length === 0}
            title="Send"
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 28,
              flexShrink: 0,
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--c-line)',
              background: draft.trim() ? 'var(--brand-primary)' : 'var(--c-surface)',
              color: draft.trim() ? '#fff' : 'var(--c-text-mute)',
              cursor: draft.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <Icon name="send" size={12} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--c-text-mute)' }}>Reply to</span>
          <select
            value={replyTo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReplyTo(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '3px 6px',
              fontSize: 11,
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--c-line)',
              background: 'var(--c-surface)',
              color: 'var(--c-text-dim)',
              cursor: 'pointer',
            }}
          >
            {REPLY_TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 10, color: 'var(--c-text-mute)' }}>
            {replyTo === 'all' ? 'Broadcast' : PLATFORM_LABEL[replyTo as Platform]}
          </span>
        </div>
      </div>
    </div>
  )
}
