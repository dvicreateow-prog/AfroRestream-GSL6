import { useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useStudio } from '../../state/studioStore'

type Role = 'user' | 'assistant'

interface Message {
  id: string
  role: Role
  text: string
}

interface Capability {
  id: string
  label: string
  icon: 'layers' | 'graphics' | 'image' | 'captions'
  color: string
}

const CAPABILITIES: Capability[] = [
  { id: 'scenes', label: 'Scenes', icon: 'layers', color: 'var(--brand-primary)' },
  { id: 'overlays', label: 'Overlays', icon: 'graphics', color: 'var(--c-purple)' },
  { id: 'media', label: 'Media', icon: 'image', color: 'var(--c-cyan)' },
  { id: 'captions', label: 'Captions', icon: 'captions', color: 'var(--c-green)' },
]

const STARTERS: string[] = [
  'Build me a three-scene show open',
  'Add a lower third for my guest',
  'Generate a calm studio background',
  'Draft captions for the last segment',
]

const GREETING =
  "Hi - I'm the studio assistant. Tell me what you want on screen and I'll lay out the steps. Heads up: no model provider is wired up yet, so I can plan but not act."

const REPLY = [
  'No model provider is connected yet, so I cannot actually run that.',
  '',
  'Once a provider is linked I would be able to:',
  '- create and arrange scenes with the right layout',
  '- add overlays like lower thirds, banners and tickers',
  '- generate backgrounds and stage art for a scene',
  '- write captions and summaries from your audio',
  '',
  'Connect a provider in settings and ask me again.',
].join('\n')

let seq = 0
function nextId(prefix: string): string {
  seq += 1
  return `${prefix}-${seq}-${Date.now().toString(36)}`
}

export function AiPanel() {
  const openModal = useStudio((s) => s.openModal)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'seed', role: 'assistant', text: GREETING },
  ])
  const [draft, setDraft] = useState('')
  const [activeCap, setActiveCap] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  function send(): void {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { id: nextId('u'), role: 'user', text },
      { id: nextId('a'), role: 'assistant', text: REPLY },
    ])
    setDraft('')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function pickStarter(text: string): void {
    setDraft(text)
    inputRef.current?.focus()
  }

  function pickCapability(cap: Capability): void {
    setActiveCap((prev) => (prev === cap.id ? null : cap.id))
    setDraft(`Help me with ${cap.label.toLowerCase()}: `)
    inputRef.current?.focus()
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        fontSize: 12,
        color: 'var(--c-text)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          padding: '10px 12px',
          borderBottom: '1px solid var(--c-line)',
        }}
      >
        {CAPABILITIES.map((cap) => {
          const on = activeCap === cap.id
          return (
            <button
              key={cap.id}
              type="button"
              onClick={() => pickCapability(cap)}
              title={`Ask about ${cap.label.toLowerCase()}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 8px',
                borderRadius: 'var(--r-md)',
                border: `1px solid ${on ? cap.color : 'var(--c-line)'}`,
                background: on ? 'var(--c-elevated)' : 'var(--c-surface)',
                color: on ? 'var(--c-text)' : 'var(--c-text-dim)',
                fontSize: 11,
                fontWeight: 'var(--fw-medium)' as unknown as number,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ color: cap.color, display: 'flex' }}>
                <Icon name={cap.icon} size={13} />
              </span>
              {cap.label}
            </button>
          )
        })}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {messages.map((m) => {
          const mine = m.role === 'user'
          return (
            <div
              key={m.id}
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
                padding: '7px 9px',
                borderRadius: 'var(--r-md)',
                background: mine ? 'var(--brand-primary)' : 'var(--c-surface)',
                border: mine ? '1px solid transparent' : '1px solid var(--c-line)',
                color: mine ? '#fff' : 'var(--c-text-dim)',
                fontSize: 11.5,
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {m.text}
            </div>
          )
        })}
      </div>

      <div style={{ padding: '0 12px 10px', borderTop: '1px solid var(--c-line)' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5,
            padding: '10px 0 8px',
          }}
        >
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => pickStarter(s)}
              style={{
                padding: '4px 8px',
                borderRadius: 999,
                border: '1px solid var(--c-line)',
                background: 'var(--c-surface)',
                color: 'var(--c-text-mute)',
                fontSize: 10.5,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 6,
            padding: 6,
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--c-line)',
            background: 'var(--c-panel)',
          }}
        >
          <textarea
            ref={inputRef}
            value={draft}
            rows={2}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask the studio assistant..."
            style={{
              flex: 1,
              minWidth: 0,
              resize: 'none',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--c-text)',
              fontSize: 11.5,
              lineHeight: 1.45,
              fontFamily: 'inherit',
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim()}
            title="Send (Enter)"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              flex: '0 0 auto',
              borderRadius: 'var(--r-sm)',
              border: 'none',
              background: draft.trim() ? 'var(--brand-primary)' : 'var(--c-elevated)',
              color: draft.trim() ? '#fff' : 'var(--c-text-mute)',
              cursor: draft.trim() ? 'pointer' : 'default',
            }}
          >
            <Icon name="send" size={13} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            paddingTop: 8,
            fontSize: 10.5,
            color: 'var(--c-text-mute)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: 'var(--c-yellow)',
              flex: '0 0 auto',
            }}
          />
          <span>No provider connected</span>
          <button
            type="button"
            onClick={() => openModal('settings')}
            style={{
              marginLeft: 'auto',
              border: 'none',
              background: 'none',
              padding: 0,
              color: 'var(--brand-primary)',
              fontSize: 10.5,
              fontWeight: 'var(--fw-semibold)' as unknown as number,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}
