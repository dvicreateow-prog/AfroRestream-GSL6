import { useState, type CSSProperties } from 'react'
import { Icon } from '../../components/Icon'
import { Modal, OptionGrid } from '../../components/Modal'
import { useStudio } from '../../state/studioStore'

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

const SOURCE_OPTIONS = [
  {
    id: 'video',
    name: 'Video',
    description: 'Play a clip on stage',
    icon: 'video',
    color: '#2864f0',
    kind: 'video',
    subtitle: 'Hosted clip',
  },
  {
    id: 'screen',
    name: 'Screen',
    description: 'Share a tab, window or display',
    icon: 'screen',
    color: '#24c875',
    kind: 'screen',
    subtitle: 'Shared display',
  },
  {
    id: 'slides',
    name: 'Presentation',
    description: 'Step through slides',
    icon: 'slides',
    color: '#7c5cfc',
    kind: 'presentation',
    subtitle: 'Slide deck',
  },
  {
    id: 'image',
    name: 'Image',
    description: 'Show a still on stage',
    icon: 'image',
    color: '#43c7e8',
    kind: 'image',
    subtitle: 'Still image',
  },
  {
    id: 'local',
    name: 'Local video',
    description: 'Play a file from this computer',
    icon: 'upload',
    color: '#ef4b55',
    kind: 'video',
    subtitle: 'File on this computer',
  },
  {
    id: 'browser',
    name: 'Browser source',
    description: 'Render a live web page',
    icon: 'browser',
    color: '#f4c84a',
    kind: 'browser',
    subtitle: 'Live web page',
  },
  {
    id: 'rtmp',
    name: 'RTMP source',
    description: 'Pull in a remote encoder',
    icon: 'rtmp',
    color: '#ea7c36',
    kind: 'rtmp',
    subtitle: 'Remote encoder feed',
  },
  {
    id: 'camera2',
    name: 'Extra camera',
    description: 'Add a second camera angle',
    icon: 'cam',
    color: '#2ed3b7',
    kind: 'camera',
    subtitle: 'Second angle',
  },
] as const

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function AddSourceModal({ onClose }: { onClose: () => void }) {
  const addSource = useStudio((s) => s.addSource)
  const [query, setQuery] = useState('')
  const [keepOpen, setKeepOpen] = useState(false)
  const [added, setAdded] = useState<string[]>([])

  const needle = query.trim().toLowerCase()
  const visible = SOURCE_OPTIONS.filter(
    (o) =>
      needle === '' ||
      o.name.toLowerCase().includes(needle) ||
      o.description.toLowerCase().includes(needle),
  )

  function handlePick(id: string) {
    const option = SOURCE_OPTIONS.find((o) => o.id === id)
    if (!option) return
    addSource({ kind: option.kind, name: option.name, subtitle: option.subtitle })
    if (keepOpen) {
      setAdded((prev) => [option.name, ...prev].slice(0, 4))
      setQuery('')
      return
    }
    onClose()
  }

  const searchRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 34,
    padding: '0 10px',
    borderRadius: 'var(--r-md)',
    border: '1px solid var(--c-line)',
    background: 'var(--c-surface)',
    marginBottom: 12,
  }

  const inputStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: 'var(--c-text)',
    fontSize: 12,
    fontWeight: 500,
  }

  const toggleStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    height: 28,
    padding: '0 10px',
    borderRadius: 'var(--r-sm)',
    border: `1px solid ${keepOpen ? 'var(--brand-primary)' : 'var(--c-line)'}`,
    background: keepOpen ? 'color-mix(in srgb, var(--brand-primary) 18%, transparent)' : 'transparent',
    color: keepOpen ? 'var(--c-text)' : 'var(--c-text-dim)',
    fontSize: 11,
    cursor: 'pointer',
  }

  const doneStyle: CSSProperties = {
    height: 28,
    padding: '0 14px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--c-line)',
    background: 'var(--c-elevated)',
    color: 'var(--c-text)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  }

  return (
    <Modal
      title="Add a source"
      description="Bring something new onto the stage."
      width="lg"
      onClose={onClose}
      footer={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            width: '100%',
          }}
        >
          <button type="button" style={toggleStyle} onClick={() => setKeepOpen((v) => !v)}>
            <Icon name={keepOpen ? 'check' : 'plus'} size={13} />
            Keep adding after each pick
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {added.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--c-text-mute)' }}>
                Added {added.join(', ')}
              </span>
            )}
            <button type="button" style={doneStyle} onClick={onClose}>
              {added.length > 0 ? 'Done' : 'Cancel'}
            </button>
          </div>
        </div>
      }
    >
      <div style={searchRow}>
        <Icon name="search" size={14} />
        <input
          style={inputStyle}
          value={query}
          placeholder="Search sources"
          onChange={(e) => setQuery(e.target.value)}
        />
        {query !== '' && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery('')}
            style={{
              display: 'inline-flex',
              border: 'none',
              background: 'transparent',
              color: 'var(--c-text-mute)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Icon name="close" size={13} />
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <OptionGrid columns={2} onPick={handlePick} options={visible.slice()} />
      ) : (
        <div
          style={{
            padding: '28px 12px',
            textAlign: 'center',
            border: '1px dashed var(--c-line)',
            borderRadius: 'var(--r-lg)',
            color: 'var(--c-text-mute)',
            fontSize: 12,
          }}
        >
          Nothing matches &ldquo;{query}&rdquo;.
        </div>
      )}
    </Modal>
  )
}
