import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { useStudio } from '../../state/studioStore'

type TabId = 'brand' | 'backgrounds' | 'overlays'

type OverlayKind =
  | 'banner'
  | 'lowerThird'
  | 'ticker'
  | 'logo'
  | 'background'
  | 'caption'
  | 'qr'
  | 'chat'
  | 'countdown'

type IconName = Parameters<typeof Icon>[0]['name']

type OverlayPreset = {
  kind: OverlayKind
  name: string
  icon: IconName
  hint: string
  rect: { x: number; y: number; w: number; h: number }
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'brand', label: 'Brand' },
  { id: 'backgrounds', label: 'Backgrounds' },
  { id: 'overlays', label: 'Overlays' },
]

const SWATCHES = [
  '#6d5efc',
  '#2fb8ff',
  '#22c98a',
  '#ffc93c',
  '#ff7a45',
  '#f2456b',
  '#b06bff',
  '#8a94a6',
]

const FONTS = [
  'Inter',
  'Poppins',
  'Space Grotesk',
  'Source Serif',
  'DM Sans',
  'JetBrains Mono',
]

const BACKGROUNDS: { id: string; name: string; css: string }[] = [
  { id: 'none', name: 'None', css: 'repeating-linear-gradient(45deg,#20242e 0 6px,#1a1e26 6px 12px)' },
  { id: 'aurora', name: 'Aurora', css: 'linear-gradient(135deg,#6d5efc 0%,#2fb8ff 55%,#22c98a 100%)' },
  { id: 'ember', name: 'Ember', css: 'linear-gradient(140deg,#f2456b 0%,#ff7a45 50%,#ffc93c 100%)' },
  { id: 'studio', name: 'Studio', css: 'radial-gradient(circle at 30% 20%,#3a4256 0%,#171a22 70%)' },
  { id: 'mint', name: 'Mint Desk', css: 'linear-gradient(160deg,#0f3b34 0%,#22c98a 100%)' },
  { id: 'nebula', name: 'Nebula', css: 'conic-gradient(from 210deg,#b06bff,#2fb8ff,#6d5efc,#b06bff)' },
]

const PRESETS: OverlayPreset[] = [
  {
    kind: 'lowerThird',
    name: 'Lower third',
    icon: 'notes',
    hint: 'Name + role strap',
    rect: { x: 6, y: 68, w: 42, h: 18 },
  },
  {
    kind: 'ticker',
    name: 'Ticker',
    icon: 'arrowRight',
    hint: 'Scrolling headline',
    rect: { x: 0, y: 90, w: 100, h: 10 },
  },
  {
    kind: 'logo',
    name: 'Logo',
    icon: 'star',
    hint: 'Corner watermark',
    rect: { x: 82, y: 5, w: 14, h: 14 },
  },
  {
    kind: 'banner',
    name: 'Frame',
    icon: 'layers',
    hint: 'Branded border',
    rect: { x: 0, y: 0, w: 100, h: 100 },
  },
  {
    kind: 'chat',
    name: 'Chat',
    icon: 'chat',
    hint: 'Live audience feed',
    rect: { x: 68, y: 22, w: 30, h: 52 },
  },
]

const rowBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '7px 8px',
  borderRadius: 'var(--r-md)',
  border: '1px solid var(--c-line)',
  background: 'var(--c-surface)',
  color: 'var(--c-text)',
  font: 'inherit',
  fontSize: 12,
  textAlign: 'left',
  cursor: 'pointer',
}

const sectionTitle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: 'var(--c-text-mute)',
  fontWeight: 'var(--fw-semibold)' as React.CSSProperties['fontWeight'],
  margin: '2px 0 6px',
}

const iconBtn: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: 22,
  height: 22,
  flex: '0 0 auto',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--c-line)',
  background: 'var(--c-elevated)',
  color: 'var(--c-text-dim)',
  cursor: 'pointer',
}

export function GraphicsPanel() {
  const overlays = useStudio((s) => s.overlays)
  const addOverlay = useStudio((s) => s.addOverlay)
  const toggleOverlay = useStudio((s) => s.toggleOverlay)
  const removeOverlay = useStudio((s) => s.removeOverlay)

  const [tab, setTab] = useState<TabId>('brand')
  const [color, setColor] = useState<string>(SWATCHES[0])
  const [font, setFont] = useState<string>(FONTS[0])
  const [logoName, setLogoName] = useState<string>('')
  const [dragging, setDragging] = useState(false)
  const [background, setBackground] = useState<string>('none')

  const pickLogo = () => {
    const stamp = new Date().toISOString().slice(11, 19).replace(/:/g, '')
    setLogoName(`brand-mark-${stamp}.png`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 10, fontSize: 12 }}>
      <div
        style={{
          display: 'flex',
          gap: 2,
          padding: 2,
          borderRadius: 'var(--r-md)',
          background: 'var(--c-surface)',
          border: '1px solid var(--c-line)',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '5px 0',
              fontSize: 11,
              fontWeight: 'var(--fw-medium)' as React.CSSProperties['fontWeight'],
              borderRadius: 'var(--r-sm)',
              border: 'none',
              cursor: 'pointer',
              background: tab === t.id ? 'var(--c-elevated)' : 'transparent',
              color: tab === t.id ? 'var(--c-text)' : 'var(--c-text-mute)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'brand' && (
        <>
          <div>
            <div style={sectionTitle}>Palette</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  title={hex}
                  onClick={() => setColor(hex)}
                  style={{
                    height: 30,
                    borderRadius: 'var(--r-sm)',
                    background: hex,
                    cursor: 'pointer',
                    border: '1px solid rgba(0,0,0,.35)',
                    outline: color === hex ? '2px solid var(--c-text)' : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--c-text-mute)' }}>
              Accent {color}
            </div>
          </div>

          <div>
            <div style={sectionTitle}>Logo</div>
            <button
              type="button"
              onClick={pickLogo}
              onDragOver={(e: React.DragEvent<HTMLButtonElement>) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e: React.DragEvent<HTMLButtonElement>) => {
                e.preventDefault()
                setDragging(false)
                pickLogo()
              }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '14px 8px',
                borderRadius: 'var(--r-lg)',
                border: `1px dashed ${dragging ? 'var(--brand-primary)' : 'var(--c-line)'}`,
                background: dragging ? 'var(--c-elevated)' : 'var(--c-surface)',
                color: 'var(--c-text-dim)',
                cursor: 'pointer',
                font: 'inherit',
                fontSize: 11,
              }}
            >
              <Icon name="upload" size={16} />
              <span style={{ color: 'var(--c-text)' }}>
                {logoName ? logoName : 'Drop a PNG or SVG'}
              </span>
              <span style={{ color: 'var(--c-text-mute)' }}>
                {logoName ? 'Click to replace' : 'Transparent, 512px min'}
              </span>
            </button>
            {logoName && (
              <button
                type="button"
                onClick={() => setLogoName('')}
                style={{ ...rowBase, marginTop: 6, justifyContent: 'center', color: 'var(--c-text-dim)' }}
              >
                <Icon name="trash" size={12} />
                Remove logo
              </button>
            )}
          </div>

          <div>
            <div style={sectionTitle}>Typeface</div>
            <select
              value={font}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFont(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 8px',
                fontSize: 12,
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--c-line)',
                background: 'var(--c-surface)',
                color: 'var(--c-text)',
              }}
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--c-text-mute)' }}>
              Titles and lower thirds use {font}.
            </div>
          </div>
        </>
      )}

      {tab === 'backgrounds' && (
        <div>
          <div style={sectionTitle}>Scene backdrop</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {BACKGROUNDS.map((bg) => {
              const active = background === bg.id
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setBackground(bg.id)}
                  style={{
                    position: 'relative',
                    padding: 0,
                    borderRadius: 'var(--r-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'var(--c-surface)',
                    border: `1px solid ${active ? 'var(--brand-primary)' : 'var(--c-line)'}`,
                    outline: active ? '1px solid var(--brand-primary)' : 'none',
                  }}
                >
                  <div style={{ height: 46, background: bg.css }} />
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        display: 'grid',
                        placeItems: 'center',
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        background: 'var(--c-green)',
                        color: '#08120d',
                      }}
                    >
                      <Icon name="check" size={10} />
                    </span>
                  )}
                  <div
                    style={{
                      padding: '5px 6px',
                      fontSize: 11,
                      textAlign: 'left',
                      color: active ? 'var(--c-text)' : 'var(--c-text-dim)',
                    }}
                  >
                    {bg.name}
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--c-text-mute)' }}>
            Backdrops apply to camera scenes with removal enabled.
          </div>
        </div>
      )}

      {tab === 'overlays' && (
        <>
          <div>
            <div style={sectionTitle}>Add overlay</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {PRESETS.map((p) => (
                <div key={p.name} style={{ ...rowBase, cursor: 'default' }}>
                  <Icon name={p.icon} size={13} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'var(--fw-medium)' as React.CSSProperties['fontWeight'] }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--c-text-mute)' }}>{p.hint}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      addOverlay({ kind: p.kind, name: p.name, visible: true, ...p.rect })
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      padding: '3px 7px',
                      fontSize: 11,
                      borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--c-line)',
                      background: 'var(--c-elevated)',
                      color: 'var(--c-text)',
                      cursor: 'pointer',
                      font: 'inherit',
                    }}
                  >
                    <Icon name="plus" size={10} />
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={sectionTitle}>On this stream</div>
            {overlays.length === 0 ? (
              <div
                style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  fontSize: 11,
                  color: 'var(--c-text-mute)',
                  border: '1px dashed var(--c-line)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                Nothing added yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {overlays.map((o) => (
                  <div key={o.id} style={{ ...rowBase, cursor: 'default' }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        flex: '0 0 auto',
                        background: o.visible === false ? 'var(--c-text-mute)' : 'var(--c-green)',
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: o.visible === false ? 'var(--c-text-mute)' : 'var(--c-text)',
                      }}
                    >
                      {o.name}
                    </span>
                    <button
                      type="button"
                      title="Toggle visibility"
                      onClick={() => toggleOverlay(o.id)}
                      style={iconBtn}
                    >
                      <Icon name="eye" size={12} />
                    </button>
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => removeOverlay(o.id)}
                      style={iconBtn}
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
