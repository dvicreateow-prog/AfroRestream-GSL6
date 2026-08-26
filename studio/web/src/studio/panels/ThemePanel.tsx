import { useState, type CSSProperties, type ReactNode } from 'react'
import { Icon, type IconName } from '../../components/Icon'
import { useStudio } from '../../state/studioStore'

type PresetId = 'default' | 'news' | 'rounded' | 'air'
type CornerId = 'square' | 'soft' | 'round'
type FontId = 'inter' | 'poppins' | 'grotesk' | 'slab' | 'serif' | 'mono'
type ToggleKey = 'motion' | 'plates' | 'badges' | 'match'

interface Preset {
  id: PresetId
  name: string
  hint: string
  accent: string
  plate: string
  font: FontId
  corner: CornerId
}

const PRESETS: Preset[] = [
  { id: 'default', name: 'Default', hint: 'House look', accent: '#5B5BD6', plate: '#0E1116', font: 'inter', corner: 'soft' },
  { id: 'news', name: 'News', hint: 'Hard edges', accent: '#E4443B', plate: '#12161C', font: 'slab', corner: 'square' },
  { id: 'rounded', name: 'Rounded', hint: 'Soft pills', accent: '#12B76A', plate: '#101A16', font: 'poppins', corner: 'round' },
  { id: 'air', name: 'Air', hint: 'Light + minimal', accent: '#22B8CF', plate: '#ECF1F4', font: 'grotesk', corner: 'soft' },
]

const SWATCHES: string[] = [
  '#5B5BD6', '#7C5CFF', '#2F6FED', '#22B8CF', '#12B76A',
  '#A3E635', '#EAB308', '#F97316', '#E4443B', '#EC4899',
]

const FONTS: { id: FontId; name: string; stack: string }[] = [
  { id: 'inter', name: 'Inter - clean sans', stack: 'Inter, system-ui, sans-serif' },
  { id: 'poppins', name: 'Poppins - friendly geometric', stack: 'Poppins, Avenir, system-ui, sans-serif' },
  { id: 'grotesk', name: 'Space Grotesk - technical', stack: '"Space Grotesk", Inter, system-ui, sans-serif' },
  { id: 'slab', name: 'Roboto Slab - editorial', stack: '"Roboto Slab", Rockwell, Georgia, serif' },
  { id: 'serif', name: 'Georgia - classic serif', stack: 'Georgia, "Times New Roman", serif' },
  { id: 'mono', name: 'JetBrains Mono - console', stack: '"JetBrains Mono", Consolas, monospace' },
]

const CORNERS: { id: CornerId; name: string; radius: number }[] = [
  { id: 'square', name: 'Square', radius: 2 },
  { id: 'soft', name: 'Soft', radius: 10 },
  { id: 'round', name: 'Round', radius: 22 },
]

const TOGGLES: { key: ToggleKey; label: string; hint: string }[] = [
  { key: 'motion', label: 'Animated overlays', hint: 'Slide graphics in and out' },
  { key: 'plates', label: 'Show name plates', hint: 'Name chip on every speaker' },
  { key: 'badges', label: 'Show platform badges', hint: 'Mark where viewers watch' },
  { key: 'match', label: 'Match overlay colour to accent', hint: 'Tint plates and tickers' },
]

const rowLabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '.02em',
  color: 'var(--c-text-dim)',
}

function isLight(hex: string): boolean {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const r = parseInt(full.slice(0, 2), 16) || 0
  const g = parseInt(full.slice(2, 4), 16) || 0
  const b = parseInt(full.slice(4, 6), 16) || 0
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

function Section({ label, icon, right, children }: {
  label: string
  icon: IconName
  right?: ReactNode
  children: ReactNode
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name={icon} size={12} style={{ color: 'var(--c-text-mute)' }} />
        <span style={{ ...rowLabel, flex: 1, textTransform: 'uppercase' }}>{label}</span>
        {right}
      </div>
      {children}
    </section>
  )
}

function Toggle({ on, label, hint, onToggle }: {
  on: boolean
  label: string
  hint: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '7px 8px',
        background: on ? 'var(--c-elevated)' : 'var(--c-surface)',
        border: '1px solid var(--c-line)',
        borderRadius: 'var(--r-md)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: 'var(--c-text)' }}>{label}</span>
        <span style={{ display: 'block', fontSize: 10, color: 'var(--c-text-mute)', marginTop: 1 }}>{hint}</span>
      </span>
      <span
        aria-hidden="true"
        style={{
          flex: '0 0 auto',
          width: 28,
          height: 16,
          borderRadius: 999,
          padding: 2,
          background: on ? 'var(--c-green)' : 'var(--c-line)',
          transition: 'background 140ms ease',
        }}
      >
        <span
          style={{
            display: 'block',
            width: 12,
            height: 12,
            borderRadius: 999,
            background: '#fff',
            transform: on ? 'translateX(12px)' : 'none',
            transition: 'transform 140ms ease',
          }}
        />
      </span>
    </button>
  )
}

export function ThemePanel() {
  const { title } = useStudio()
  const [preset, setPreset] = useState<PresetId>('default')
  const [accent, setAccent] = useState<string>('#5B5BD6')
  const [plate, setPlate] = useState<string>('#0E1116')
  const [font, setFont] = useState<FontId>('inter')
  const [corner, setCorner] = useState<CornerId>('soft')
  const [edited, setEdited] = useState<boolean>(false)
  const [replay, setReplay] = useState<number>(0)
  const [flags, setFlags] = useState<Record<ToggleKey, boolean>>({
    motion: true,
    plates: true,
    badges: false,
    match: false,
  })

  const stack = FONTS.find((f) => f.id === font)?.stack ?? 'Inter, system-ui, sans-serif'
  const radius = CORNERS.find((c) => c.id === corner)?.radius ?? 10
  const plateBg = flags.match ? accent : plate
  const plateFg = isLight(plateBg) ? '#0D1014' : '#FFFFFF'
  const plateSub = isLight(plateBg) ? 'rgba(13,16,20,.62)' : 'rgba(255,255,255,.66)'
  const speaker = title.trim() ? title.trim() : 'Untitled broadcast'

  function applyPreset(p: Preset) {
    setPreset(p.id)
    setAccent(p.accent)
    setPlate(p.plate)
    setFont(p.font)
    setCorner(p.corner)
    setEdited(false)
    setReplay((n) => n + 1)
  }

  function touch() {
    setEdited(true)
    setReplay((n) => n + 1)
  }

  function pickAccent(hex: string) {
    setAccent(hex)
    touch()
  }

  function flip(key: ToggleKey) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }))
    setReplay((n) => n + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 10 }}>
      <style>
        {'@keyframes tpRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}'}
      </style>

      <Section
        label="Preset"
        icon="theme"
        right={edited ? (
          <span style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--c-yellow)' }}>EDITED</span>
        ) : null}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {PRESETS.map((p) => {
            const active = p.id === preset
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => applyPreset(p)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  padding: 6,
                  background: 'var(--c-surface)',
                  border: '1px solid ' + (active ? p.accent : 'var(--c-line)'),
                  boxShadow: active ? '0 0 0 1px ' + p.accent : 'none',
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'relative',
                    display: 'block',
                    height: 30,
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'linear-gradient(140deg,#232A33,#12161B)',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 5,
                      bottom: 5,
                      width: 3,
                      height: 11,
                      background: p.accent,
                      borderRadius: p.corner === 'round' ? 999 : 1,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: 10,
                      bottom: 5,
                      width: 34,
                      height: 11,
                      background: p.plate,
                      borderRadius: p.corner === 'square' ? 1 : p.corner === 'soft' ? 3 : 6,
                    }}
                  />
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text)' }}>{p.name}</span>
                  {active ? <Icon name="check" size={10} style={{ color: p.accent }} /> : null}
                </span>
                <span style={{ fontSize: 9.5, color: 'var(--c-text-mute)' }}>{p.hint}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section label="Accent" icon="star">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {SWATCHES.map((hex) => {
            const active = hex.toLowerCase() === accent.toLowerCase()
            return (
              <button
                key={hex}
                type="button"
                title={hex}
                aria-label={'Accent ' + hex}
                aria-pressed={active}
                onClick={() => pickAccent(hex)}
                style={{
                  height: 26,
                  background: hex,
                  border: active ? '2px solid var(--c-text)' : '1px solid var(--c-line)',
                  borderRadius: 'var(--r-sm)',
                  cursor: 'pointer',
                }}
              />
            )
          })}
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-line)',
            borderRadius: 'var(--r-md)',
            cursor: 'pointer',
          }}
        >
          <input
            type="color"
            value={accent}
            onChange={(e) => pickAccent(e.target.value)}
            style={{ width: 24, height: 20, padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
          />
          <span style={{ flex: 1, fontSize: 11, color: 'var(--c-text)' }}>Custom colour</span>
          <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'var(--c-text-mute)' }}>
            {accent.toUpperCase()}
          </span>
        </label>
      </Section>

      <Section label="Typeface" icon="captions">
        <select
          value={font}
          onChange={(e) => {
            setFont(e.target.value as FontId)
            touch()
          }}
          style={{
            width: '100%',
            padding: '7px 8px',
            fontSize: 11.5,
            color: 'var(--c-text)',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-line)',
            borderRadius: 'var(--r-md)',
            cursor: 'pointer',
          }}
        >
          {FONTS.map((f) => (
            <option key={f.id} value={f.id} style={{ background: 'var(--c-elevated)' }}>
              {f.name}
            </option>
          ))}
        </select>
      </Section>

      <Section label="Corners" icon="layers">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 2,
            padding: 2,
            background: 'var(--c-surface)',
            border: '1px solid var(--c-line)',
            borderRadius: 'var(--r-md)',
          }}
        >
          {CORNERS.map((c) => {
            const active = c.id === corner
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCorner(c.id)
                  touch()
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 2px',
                  background: active ? 'var(--c-elevated)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 10.5,
                  fontWeight: 500,
                  color: active ? 'var(--c-text)' : 'var(--c-text-mute)',
                  cursor: 'pointer',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 20,
                    height: 12,
                    borderRadius: c.id === 'round' ? 999 : c.radius / 2,
                    border: '1.5px solid ' + (active ? accent : 'var(--c-text-mute)'),
                  }}
                />
                {c.name}
              </button>
            )
          })}
        </div>
      </Section>

      <Section label="Behaviour" icon="settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {TOGGLES.map((t) => (
            <Toggle
              key={t.key}
              on={flags[t.key]}
              label={t.label}
              hint={t.hint}
              onToggle={() => flip(t.key)}
            />
          ))}
        </div>
      </Section>

      <Section
        label="Preview"
        icon="eye"
        right={
          <button
            type="button"
            title="Replay overlay motion"
            onClick={() => setReplay((n) => n + 1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              fontSize: 10,
              color: 'var(--c-text-dim)',
              background: 'var(--c-surface)',
              border: '1px solid var(--c-line)',
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
            }}
          >
            <Icon name="refresh" size={10} />
            Replay
          </button>
        }
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            border: '1px solid var(--c-line)',
            background: 'radial-gradient(120% 90% at 70% 20%, #2A3340 0%, #141920 55%, #0B0E12 100%)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '58%',
              top: '20%',
              width: 44,
              height: 44,
              borderRadius: 999,
              background: 'rgba(255,255,255,.10)',
            }}
          />
          {flags.plates ? (
            <span
              style={{
                position: 'absolute',
                left: 8,
                top: 8,
                padding: '2px 7px',
                fontFamily: stack,
                fontSize: 9,
                fontWeight: 600,
                color: isLight(accent) ? '#0D1014' : '#FFFFFF',
                background: accent,
                borderRadius: corner === 'round' ? 999 : radius / 2,
              }}
            >
              Host
            </span>
          ) : null}
          {flags.badges ? (
            <span style={{ position: 'absolute', right: 8, top: 8, display: 'flex', gap: 4 }}>
              <Icon name="youtube" size={12} style={{ color: '#FF3B30' }} />
              <Icon name="twitch" size={12} style={{ color: '#A970FF' }} />
              <Icon name="linkedin" size={12} style={{ color: '#3B82F6' }} />
            </span>
          ) : null}

          <div
            key={accent + corner + font + String(replay)}
            style={{
              position: 'absolute',
              left: 12,
              bottom: 22,
              display: 'flex',
              alignItems: 'stretch',
              gap: 5,
              maxWidth: 'calc(100% - 24px)',
              animation: flags.motion ? 'tpRise 460ms cubic-bezier(.2,.8,.2,1)' : 'none',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 3,
                background: flags.match ? '#FFFFFF' : accent,
                borderRadius: corner === 'square' ? 0 : 999,
              }}
            />
            <span
              style={{
                minWidth: 0,
                padding: '5px 10px',
                background: plateBg,
                borderRadius: radius,
                fontFamily: stack,
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: plateFg,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {speaker}
              </span>
              <span style={{ display: 'block', marginTop: 1, fontSize: 9, color: plateSub }}>
                Live now - say hello in chat
              </span>
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '3px 10px',
              fontFamily: stack,
              fontSize: 8.5,
              letterSpacing: '.04em',
              color: flags.match && isLight(accent) ? '#0D1014' : '#FFFFFF',
              background: flags.match ? accent : 'rgba(255,255,255,.14)',
            }}
          >
            {corner.toUpperCase()} CORNERS - {accent.toUpperCase()} ACCENT
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 10, lineHeight: 1.45, color: 'var(--c-text-mute)' }}>
          Scenes and overlays pick up these settings the moment you change them.
        </p>
      </Section>
    </div>
  )
}
