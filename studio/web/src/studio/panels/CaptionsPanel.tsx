import { useState } from 'react'
import { Icon } from '../../components/Icon'

type PositionId = 'bottom' | 'middle' | 'top'
type SizeId = 'sm' | 'md' | 'lg'

const LANGUAGES: { id: string; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'it', label: 'Italian' },
  { id: 'ja', label: 'Japanese' },
  { id: 'hi', label: 'Hindi' },
]

const POSITIONS: { id: PositionId; label: string }[] = [
  { id: 'bottom', label: 'Bottom' },
  { id: 'middle', label: 'Middle' },
  { id: 'top', label: 'Top' },
]

const SIZES: { id: SizeId; label: string; px: number }[] = [
  { id: 'sm', label: 'Small', px: 9 },
  { id: 'md', label: 'Medium', px: 11 },
  { id: 'lg', label: 'Large', px: 14 },
]

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: 'var(--c-text-mute)',
  fontWeight: 'var(--fw-semibold)' as unknown as number,
  marginBottom: 6,
  display: 'block',
}

const sectionStyle: React.CSSProperties = { padding: '12px 12px 0' }

function Segmented<T extends string>(props: {
  value: T
  options: { id: T; label: string }[]
  disabled: boolean
  onPick: (id: T) => void
}) {
  const { value, options, disabled, onPick } = props
  return (
    <div
      role="radiogroup"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        gap: 3,
        background: 'var(--c-surface)',
        border: '1px solid var(--c-line)',
        borderRadius: 'var(--r-md)',
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const active = opt.id === value
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onPick(opt.id)}
            style={{
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              borderRadius: 'var(--r-sm)',
              padding: '5px 0',
              fontSize: 11,
              fontWeight: 'var(--fw-medium)' as unknown as number,
              background: active ? 'var(--c-elevated)' : 'transparent',
              color: active ? 'var(--c-text)' : 'var(--c-text-dim)',
              boxShadow: active ? 'inset 0 0 0 1px var(--c-line)' : 'none',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function SwitchRow(props: {
  label: string
  hint?: string
  on: boolean
  disabled: boolean
  onToggle: () => void
}) {
  const { label, hint, on, disabled, onToggle } = props
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        textAlign: 'left',
        background: 'var(--c-surface)',
        border: '1px solid var(--c-line)',
        borderRadius: 'var(--r-md)',
        padding: '7px 9px',
        marginBottom: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: 'var(--c-text)',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 12 }}>{label}</span>
        {hint ? (
          <span style={{ display: 'block', fontSize: 10, color: 'var(--c-text-mute)', marginTop: 1 }}>
            {hint}
          </span>
        ) : null}
      </span>
      <span
        style={{
          width: 28,
          height: 16,
          flex: '0 0 auto',
          borderRadius: 999,
          background: on ? 'var(--brand-primary)' : 'var(--c-elevated)',
          border: '1px solid var(--c-line)',
          position: 'relative',
          transition: 'background .15s',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 1,
            left: on ? 13 : 1,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: 'var(--c-text)',
            transition: 'left .15s',
          }}
        />
      </span>
    </button>
  )
}

function Select(props: {
  value: string
  disabled: boolean
  onChange: (value: string) => void
  options: { id: string; label: string }[]
}) {
  const { value, disabled, onChange, options } = props
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      style={{
        width: '100%',
        appearance: 'none',
        background: 'var(--c-surface)',
        border: '1px solid var(--c-line)',
        borderRadius: 'var(--r-md)',
        color: 'var(--c-text)',
        fontSize: 12,
        padding: '7px 9px',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export function CaptionsPanel() {
  const [enabled, setEnabled] = useState(false)
  const [spoken, setSpoken] = useState('en')
  const [translate, setTranslate] = useState('off')
  const [position, setPosition] = useState<PositionId>('bottom')
  const [size, setSize] = useState<SizeId>('md')
  const [profanity, setProfanity] = useState(true)
  const [speakerName, setSpeakerName] = useState(false)
  const [boxed, setBoxed] = useState(true)

  const off = !enabled
  const sizePx = SIZES.find((s) => s.id === size)?.px ?? 11
  const translateOptions = [{ id: 'off', label: 'Off — keep spoken language' }, ...LANGUAGES]
  const spokenLabel = LANGUAGES.find((l) => l.id === spoken)?.label ?? 'English'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ ...sectionStyle, paddingTop: 12 }}>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Enable live captions"
          onClick={() => setEnabled((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            textAlign: 'left',
            cursor: 'pointer',
            padding: '9px 10px',
            borderRadius: 'var(--r-lg)',
            color: 'var(--c-text)',
            background: enabled ? 'color-mix(in srgb, var(--brand-primary) 16%, var(--c-surface))' : 'var(--c-surface)',
            border: `1px solid ${enabled ? 'var(--brand-primary)' : 'var(--c-line)'}`,
          }}
        >
          <Icon name="captions" size={15} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 'var(--fw-semibold)' as unknown as number }}>
              Live captions
            </span>
            <span style={{ display: 'block', fontSize: 10, color: 'var(--c-text-mute)', marginTop: 1 }}>
              Burned into the outgoing stream
            </span>
          </span>
          <span
            style={{
              width: 30,
              height: 17,
              flex: '0 0 auto',
              borderRadius: 999,
              background: enabled ? 'var(--brand-primary)' : 'var(--c-elevated)',
              border: '1px solid var(--c-line)',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 1,
                left: enabled ? 14 : 1,
                width: 13,
                height: 13,
                borderRadius: 999,
                background: 'var(--c-text)',
                transition: 'left .15s',
              }}
            />
          </span>
        </button>
      </div>

      <div style={{ opacity: off ? 0.42 : 1, transition: 'opacity .15s', pointerEvents: off ? 'none' : 'auto' }}>
        <div style={sectionStyle}>
          <label style={labelStyle}>Spoken language</label>
          <Select value={spoken} disabled={off} onChange={setSpoken} options={LANGUAGES} />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Translate to</label>
          <Select value={translate} disabled={off} onChange={setTranslate} options={translateOptions} />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Position</label>
          <Segmented value={position} options={POSITIONS} disabled={off} onPick={setPosition} />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Size</label>
          <Segmented
            value={size}
            options={SIZES.map((s) => ({ id: s.id, label: s.label }))}
            disabled={off}
            onPick={setSize}
          />
        </div>

        <div style={{ ...sectionStyle, paddingTop: 14 }}>
          <label style={labelStyle}>Options</label>
          <SwitchRow
            label="Profanity filter"
            hint="Mask flagged words with asterisks"
            on={profanity}
            disabled={off}
            onToggle={() => setProfanity((v) => !v)}
          />
          <SwitchRow
            label="Show speaker name"
            hint="Prefix each line with who is talking"
            on={speakerName}
            disabled={off}
            onToggle={() => setSpeakerName((v) => !v)}
          />
          <SwitchRow
            label="Background box"
            hint="Dark plate behind the text"
            on={boxed}
            disabled={off}
            onToggle={() => setBoxed((v) => !v)}
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Preview</label>
          <div
            style={{
              height: 96,
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--c-line)',
              background: 'linear-gradient(150deg, var(--c-elevated), var(--c-panel))',
              display: 'flex',
              flexDirection: 'column',
              justifyContent:
                position === 'top' ? 'flex-start' : position === 'middle' ? 'center' : 'flex-end',
              padding: 8,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  fontSize: sizePx,
                  lineHeight: 1.35,
                  fontWeight: 'var(--fw-medium)' as unknown as number,
                  color: 'var(--c-text)',
                  padding: boxed ? '3px 7px' : 0,
                  borderRadius: 'var(--r-sm)',
                  background: boxed ? 'rgba(0,0,0,.62)' : 'transparent',
                  textShadow: boxed ? 'none' : '0 1px 3px rgba(0,0,0,.9)',
                }}
              >
                {speakerName ? (
                  <span style={{ color: 'var(--c-cyan)' }}>Host: </span>
                ) : null}
                {translate === 'off'
                  ? 'thanks for joining us today, let us dive in'
                  : `translating live into ${translateOptions.find((o) => o.id === translate)?.label ?? ''}`}
              </span>
            </div>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 10, color: 'var(--c-text-mute)', lineHeight: 1.45 }}>
            Sample only — reflects size, position and box settings, not real audio.
          </p>
        </div>
      </div>

      <div style={{ ...sectionStyle, paddingBottom: 12, marginTop: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 9px',
            borderRadius: 'var(--r-md)',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-line)',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              flex: '0 0 auto',
              background: enabled ? 'var(--c-green)' : 'var(--c-text-mute)',
              boxShadow: enabled ? '0 0 0 3px color-mix(in srgb, var(--c-green) 22%, transparent)' : 'none',
            }}
          />
          <span style={{ fontSize: 11, color: enabled ? 'var(--c-text)' : 'var(--c-text-dim)', flex: 1 }}>
            {enabled ? `Listening — ${spokenLabel}` : 'Captions off'}
          </span>
          <Icon name={enabled ? 'signal' : 'micOff'} size={12} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'flex-start' }}>
          <span style={{ marginTop: 1, color: 'var(--c-yellow)', flex: '0 0 auto' }}>
            <Icon name="warning" size={12} />
          </span>
          <p style={{ margin: 0, fontSize: 10, lineHeight: 1.45, color: 'var(--c-text-mute)' }}>
            No speech provider is connected yet, so nothing is transcribed. These settings are saved
            for this session and will apply once a transcription service is linked.
          </p>
        </div>
      </div>
    </div>
  )
}
