import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useStudio } from '../../state/studioStore'

const SEED = [
  'Cold open — welcome, thanks for joining.',
  'Housekeeping: replay goes out tomorrow.',
  'Segment 1 — product walkthrough (8 min).',
  'Ask the room for questions before the demo.',
].join('\n')

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 28,
    padding: '0 8px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--c-line)',
    background: active ? 'var(--c-elevated)' : 'var(--c-surface)',
    color: active ? 'var(--c-text)' : 'var(--c-text-dim)',
    fontSize: 11,
    fontWeight: 'var(--fw-medium)' as unknown as number,
    cursor: 'pointer',
  }
}

export function NotesPanel() {
  const scenes = useStudio((s) => s.scenes)
  const activeSceneId = useStudio((s) => s.activeSceneId)

  const activeScene = scenes.find((s) => s.id === activeSceneId)
  const firstSceneId = scenes.length > 0 ? scenes[0].id : ''
  const noteKey = activeScene ? activeScene.id : '__none__'

  const [notes, setNotes] = useState<Record<string, string>>(() =>
    firstSceneId ? { [firstSceneId]: SEED } : {},
  )
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [autoOpen, setAutoOpen] = useState(true)

  const saveTimer = useRef<number | null>(null)
  const copyTimer = useRef<number | null>(null)
  const clearTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
      if (clearTimer.current !== null) window.clearTimeout(clearTimer.current)
    }
  }, [])

  const text = notes[noteKey] ?? ''

  function markSaved() {
    setSaved(false)
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => setSaved(true), 1500)
  }

  function handleChange(value: string) {
    setNotes((prev) => ({ ...prev, [noteKey]: value }))
    markSaved()
  }

  function handleCopy() {
    if (navigator.clipboard) void navigator.clipboard.writeText(text)
    setCopied(true)
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1500)
  }

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true)
      if (clearTimer.current !== null) window.clearTimeout(clearTimer.current)
      clearTimer.current = window.setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    if (clearTimer.current !== null) window.clearTimeout(clearTimer.current)
    setConfirmClear(false)
    setNotes((prev) => ({ ...prev, [noteKey]: '' }))
    markSaved()
  }

  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        height: '100%',
        padding: 12,
        boxSizing: 'border-box',
        color: 'var(--c-text)',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--c-text-mute)',
            fontWeight: 'var(--fw-semibold)' as unknown as number,
          }}
        >
          Notes for
        </div>
        <div style={{ ...rowStyle, marginTop: 3 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              flex: '0 0 auto',
              background: activeScene ? activeScene.color : 'var(--c-text-mute)',
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 'var(--fw-semibold)' as unknown as number,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeScene ? activeScene.title : 'No scene selected'}
          </span>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value)}
        placeholder="Talking points, cues, links, names to thank..."
        spellCheck={false}
        style={{
          flex: 1,
          minHeight: 200,
          width: '100%',
          boxSizing: 'border-box',
          resize: 'none',
          padding: 10,
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--c-line)',
          background: 'var(--c-surface)',
          color: 'var(--c-text)',
          fontSize: 12,
          lineHeight: 1.55,
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />

      <div style={{ ...rowStyle, justifyContent: 'space-between', fontSize: 11 }}>
        <span style={{ color: 'var(--c-text-mute)' }}>
          {text.length} chars · {words} words
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: saved ? 'var(--c-green)' : 'var(--c-text-mute)',
          }}
        >
          {saved ? <Icon name="check" size={12} /> : null}
          {saved ? 'Auto-saved' : 'Saves as you type'}
        </span>
      </div>

      <div style={rowStyle}>
        <button type="button" onClick={handleCopy} style={btnStyle(copied)}>
          <Icon name={copied ? 'check' : 'copy'} size={12} />
          {copied ? 'Copied' : 'Copy notes'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          style={{
            ...btnStyle(confirmClear),
            color: confirmClear ? 'var(--c-red)' : 'var(--c-text-dim)',
            borderColor: confirmClear ? 'var(--c-red)' : 'var(--c-line)',
          }}
        >
          <Icon name={confirmClear ? 'warning' : 'trash'} size={12} />
          {confirmClear ? 'Sure?' : 'Clear'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setAutoOpen((v) => !v)}
        style={{
          ...rowStyle,
          justifyContent: 'space-between',
          height: 30,
          padding: '0 8px',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--c-line)',
          background: 'var(--c-surface)',
          color: 'var(--c-text-dim)',
          fontSize: 11,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span style={{ color: autoOpen ? 'var(--c-text)' : 'var(--c-text-dim)' }}>
          Open notes automatically with this scene
        </span>
        <span
          style={{
            flex: '0 0 auto',
            width: 26,
            height: 15,
            borderRadius: 999,
            padding: 2,
            display: 'flex',
            justifyContent: autoOpen ? 'flex-end' : 'flex-start',
            background: autoOpen ? 'var(--brand-primary)' : 'var(--c-elevated)',
            border: '1px solid var(--c-line)',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ width: 11, height: 11, borderRadius: 999, background: 'var(--c-text)' }} />
        </span>
      </button>

      <div
        style={{
          ...rowStyle,
          alignItems: 'flex-start',
          gap: 6,
          padding: 8,
          borderRadius: 'var(--r-md)',
          background: 'var(--c-panel)',
          border: '1px solid var(--c-line)',
          color: 'var(--c-text-mute)',
          fontSize: 11,
          lineHeight: 1.45,
        }}
      >
        <span style={{ flex: '0 0 auto', marginTop: 1, color: 'var(--c-cyan)' }}>
          <Icon name="eye" size={12} />
        </span>
        <span>Notes stay on your screen only — they are never rendered into the stream or recording.</span>
      </div>
    </div>
  )
}
