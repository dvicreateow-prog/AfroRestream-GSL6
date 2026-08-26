import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { useStudio } from '../../state/studioStore'

type QrStyle = 'classic' | 'compact'
type QrSize = 'sm' | 'md' | 'lg'

type QrCode = {
  id: string
  label: string
  url: string
  style: QrStyle
  size: QrSize
  visible: boolean
  sceneId: string
}

const SIZE_LABEL: Record<QrSize, string> = { sm: 'Small', md: 'Medium', lg: 'Large' }
const SIZE_ORDER: QrSize[] = ['sm', 'md', 'lg']
const STYLE_ORDER: QrStyle[] = ['classic', 'compact']
const STYLE_LABEL: Record<QrStyle, string> = { classic: 'Classic', compact: 'Compact' }

const SEED: QrCode[] = [
  {
    id: 'qr-follow',
    label: 'Follow the show',
    url: 'https://links.example.com/follow',
    style: 'classic',
    size: 'md',
    visible: true,
    sceneId: 'all',
  },
  {
    id: 'qr-notes',
    label: 'Episode notes',
    url: 'https://links.example.com/episode-notes',
    style: 'compact',
    size: 'sm',
    visible: false,
    sceneId: 'all',
  },
]

function truncate(value: string, max: number): string {
  const bare = value.replace(/^https?:\/\//, '')
  return bare.length > max ? bare.slice(0, max - 1) + '…' : bare
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '7px 8px',
  borderRadius: 'var(--r-md)',
  background: 'var(--c-surface)',
  border: '1px solid var(--c-line)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '6px 8px',
  fontSize: 11,
  color: 'var(--c-text)',
  background: 'var(--c-panel)',
  border: '1px solid var(--c-line)',
  borderRadius: 'var(--r-sm)',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: 'var(--c-text-mute)',
  marginBottom: 4,
  fontWeight: 'var(--fw-medium)' as React.CSSProperties['fontWeight'],
}

const iconBtn: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: 22,
  height: 22,
  flex: '0 0 auto',
  borderRadius: 'var(--r-sm)',
  border: '1px solid transparent',
  background: 'transparent',
  color: 'var(--c-text-mute)',
  cursor: 'pointer',
  padding: 0,
}

export function QrPanel() {
  const { scenes } = useStudio()
  const [codes, setCodes] = useState<QrCode[]>(SEED)
  const [formOpen, setFormOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [style, setStyle] = useState<QrStyle>('classic')
  const [size, setSize] = useState<QrSize>('md')
  const [touched, setTouched] = useState(false)
  const [alerts, setAlerts] = useState(true)

  const urlValid = /^https?:\/\/\S+$/i.test(url.trim())
  const showUrlError = touched && url.trim().length > 0 && !urlValid

  function resetForm() {
    setLabel('')
    setUrl('')
    setStyle('classic')
    setSize('md')
    setTouched(false)
  }

  function handleCreate() {
    setTouched(true)
    if (!urlValid) return
    const next: QrCode = {
      id: 'qr-' + Date.now().toString(36),
      label: label.trim() || 'Untitled code',
      url: url.trim(),
      style,
      size,
      visible: false,
      sceneId: 'all',
    }
    setCodes((prev) => [...prev, next])
    resetForm()
    setFormOpen(false)
  }

  function patch(id: string, changes: Partial<QrCode>) {
    setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10, fontSize: 12, color: 'var(--c-text)' }}>
      <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: 'var(--c-text-dim)' }}>
        Put a scannable code on screen so viewers can jump straight to a link without typing it.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {codes.length === 0 && (
          <div
            style={{
              padding: '14px 10px',
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--c-text-mute)',
              border: '1px dashed var(--c-line)',
              borderRadius: 'var(--r-md)',
            }}
          >
            No codes yet.
          </div>
        )}

        {codes.map((code) => (
          <div key={code.id} style={rowStyle}>
            <div
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 30,
                height: 30,
                flex: '0 0 auto',
                borderRadius: 'var(--r-sm)',
                background: 'var(--c-elevated)',
                border: '1px solid var(--c-line)',
                color: code.visible ? 'var(--c-cyan)' : 'var(--c-text-mute)',
              }}
            >
              <Icon name="qr" size={15} />
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 'var(--fw-semibold)' as React.CSSProperties['fontWeight'],
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={code.label}
              >
                {code.label}
              </div>
              <div
                style={{ fontSize: 10.5, color: 'var(--c-text-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                title={code.url}
              >
                {truncate(code.url, 26)}
              </div>
              <select
                value={code.sceneId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch(code.id, { sceneId: e.target.value })}
                style={{ ...inputStyle, padding: '3px 4px', fontSize: 10.5, color: 'var(--c-text-dim)' }}
              >
                <option value="all">All scenes</option>
                {scenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.index}. {scene.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button
                type="button"
                onClick={() => patch(code.id, { visible: !code.visible })}
                title={code.visible ? 'Hide from stream' : 'Show on stream'}
                style={{
                  ...iconBtn,
                  color: code.visible ? 'var(--c-green)' : 'var(--c-text-mute)',
                  borderColor: code.visible ? 'var(--c-green)' : 'transparent',
                  background: code.visible ? 'rgba(255,255,255,0.05)' : 'transparent',
                }}
              >
                <Icon name="eye" size={12} />
              </button>
              <button
                type="button"
                onClick={() => setCodes((prev) => prev.filter((c) => c.id !== code.id))}
                title="Delete code"
                style={iconBtn}
              >
                <Icon name="trash" size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!formOpen && (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            padding: '8px 10px',
            fontSize: 11.5,
            fontWeight: 'var(--fw-semibold)' as React.CSSProperties['fontWeight'],
            color: 'var(--c-text)',
            background: 'var(--brand-primary)',
            border: 'none',
            borderRadius: 'var(--r-md)',
            cursor: 'pointer',
          }}
        >
          <Icon name="plus" size={12} />
          Create QR code
        </button>
      )}

      {formOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 9,
            padding: 9,
            borderRadius: 'var(--r-lg)',
            background: 'var(--c-elevated)',
            border: '1px solid var(--c-line)',
          }}
        >
          <div>
            <span style={labelStyle}>Label</span>
            <input
              value={label}
              placeholder="Follow the show"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <span style={labelStyle}>Destination URL</span>
            <input
              value={url}
              placeholder="https://"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              onBlur={() => setTouched(true)}
              style={{ ...inputStyle, borderColor: showUrlError ? 'var(--c-red)' : 'var(--c-line)' }}
            />
            {showUrlError && (
              <div style={{ marginTop: 4, fontSize: 10.5, color: 'var(--c-red)' }}>
                Links must begin with http:// or https://
              </div>
            )}
          </div>

          <div>
            <span style={labelStyle}>Style</span>
            <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 'var(--r-md)', background: 'var(--c-panel)' }}>
              {STYLE_ORDER.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStyle(option)}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    fontSize: 11,
                    borderRadius: 'var(--r-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    color: style === option ? 'var(--c-text)' : 'var(--c-text-mute)',
                    background: style === option ? 'var(--c-surface)' : 'transparent',
                    fontWeight: 'var(--fw-medium)' as React.CSSProperties['fontWeight'],
                  }}
                >
                  {STYLE_LABEL[option]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={labelStyle}>Size on screen</span>
            <select
              value={size}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSize(e.target.value as QrSize)}
              style={inputStyle}
            >
              {SIZE_ORDER.map((option) => (
                <option key={option} value={option}>
                  {SIZE_LABEL[option]}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={handleCreate}
              style={{
                flex: 1,
                padding: '7px 0',
                fontSize: 11.5,
                borderRadius: 'var(--r-md)',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--c-text)',
                background: 'var(--brand-primary)',
                fontWeight: 'var(--fw-semibold)' as React.CSSProperties['fontWeight'],
              }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm()
                setFormOpen(false)
              }}
              style={{
                flex: 1,
                padding: '7px 0',
                fontSize: 11.5,
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--c-line)',
                cursor: 'pointer',
                color: 'var(--c-text-dim)',
                background: 'transparent',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ height: 1, background: 'var(--c-line)' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 'var(--fw-medium)' as React.CSSProperties['fontWeight'] }}>
            Show scan alerts on stream
          </div>
          <div style={{ marginTop: 3, fontSize: 10.5, lineHeight: 1.45, color: 'var(--c-text-mute)' }}>
            Pops a small counter on the canvas each time viewers scan, so you know the code landed.
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={alerts}
          onClick={() => setAlerts((prev) => !prev)}
          style={{
            position: 'relative',
            flex: '0 0 auto',
            width: 30,
            height: 17,
            marginTop: 2,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            background: alerts ? 'var(--c-green)' : 'var(--c-line)',
            transition: 'background 120ms ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: alerts ? 15 : 2,
              width: 13,
              height: 13,
              borderRadius: '50%',
              background: 'var(--c-text)',
              transition: 'left 120ms ease',
            }}
          />
        </button>
      </div>
    </div>
  )
}
