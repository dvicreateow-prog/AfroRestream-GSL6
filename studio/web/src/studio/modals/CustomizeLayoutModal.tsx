/*
 * Customize layout - fine placement controls for the tiles on stage.
 * Every control drives the live 16:9 preview above it.
 */
import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { useStudio } from '../../state/studioStore'

type Fit = 'cover' | 'contain'
type Shape = 'rect' | 'rounded' | 'circle'
type Box = { x: number; y: number; w: number; h: number }

const GRAVITIES: { id: string; label: string; origin: string; ax: string; ay: string }[] = [
  { id: 'top-left', label: 'Top left', origin: 'left top', ax: 'flex-start', ay: 'flex-start' },
  { id: 'top', label: 'Top', origin: 'center top', ax: 'center', ay: 'flex-start' },
  { id: 'top-right', label: 'Top right', origin: 'right top', ax: 'flex-end', ay: 'flex-start' },
  { id: 'left', label: 'Left', origin: 'left center', ax: 'flex-start', ay: 'center' },
  { id: 'center', label: 'Center', origin: 'center center', ax: 'center', ay: 'center' },
  { id: 'right', label: 'Right', origin: 'right center', ax: 'flex-end', ay: 'center' },
  { id: 'bottom-left', label: 'Bottom left', origin: 'left bottom', ax: 'flex-start', ay: 'flex-end' },
  { id: 'bottom', label: 'Bottom', origin: 'center bottom', ax: 'center', ay: 'flex-end' },
  { id: 'bottom-right', label: 'Bottom right', origin: 'right bottom', ax: 'flex-end', ay: 'flex-end' },
]

const LAYOUT_META: Record<string, { name: string; icon: 'layoutSolo' | 'layoutSplit' | 'layoutStacked' | 'layoutGrid' | 'layoutPip' | 'layoutSpotlight' | 'layoutScreen' | 'layoutCustom'; boxes: Box[] }> = {
  solo: { name: 'Solo', icon: 'layoutSolo', boxes: [{ x: 0, y: 0, w: 100, h: 100 }] },
  split: { name: 'Split', icon: 'layoutSplit', boxes: [{ x: 0, y: 0, w: 50, h: 100 }, { x: 50, y: 0, w: 50, h: 100 }] },
  stacked: { name: 'Stacked', icon: 'layoutStacked', boxes: [{ x: 0, y: 0, w: 100, h: 50 }, { x: 0, y: 50, w: 100, h: 50 }] },
  grid: { name: 'Grid', icon: 'layoutGrid', boxes: [{ x: 0, y: 0, w: 50, h: 50 }, { x: 50, y: 0, w: 50, h: 50 }] },
  pip: { name: 'Picture in picture', icon: 'layoutPip', boxes: [{ x: 0, y: 0, w: 100, h: 100 }, { x: 66, y: 62, w: 32, h: 34 }] },
  spotlight: { name: 'Spotlight', icon: 'layoutSpotlight', boxes: [{ x: 0, y: 0, w: 74, h: 100 }, { x: 74, y: 0, w: 26, h: 100 }] },
  screen: { name: 'Screen share', icon: 'layoutScreen', boxes: [{ x: 0, y: 0, w: 100, h: 76 }, { x: 0, y: 76, w: 100, h: 24 }] },
  custom: { name: 'Custom', icon: 'layoutCustom', boxes: [{ x: 3, y: 8, w: 55, h: 84 }, { x: 60, y: 22, w: 37, h: 56 }] },
}

const DEFAULTS = { fit: 'cover' as Fit, gravity: 'center', size: 100, radius: 12, gap: 12, shape: 'rounded' as Shape, names: true }

const TILES = [
  { initials: 'AR', name: 'Ava Reyes', tint: '#5b8cff' },
  { initials: 'MC', name: 'Milo Chen', tint: '#b06bff' },
]

const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }
const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--c-text-dim)', fontWeight: 'var(--fw-medium)' as unknown as number }
const valueStyle: React.CSSProperties = { fontSize: 11, color: 'var(--c-text-mute)', fontVariantNumeric: 'tabular-nums', minWidth: 34, textAlign: 'right' }

function Segmented({ value, options, onChange }: { value: string; options: { id: string; label: string }[]; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', gap: 2, padding: 2, background: 'var(--c-surface)', border: '1px solid var(--c-line)', borderRadius: 'var(--r-md)' }}>
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            style={{
              appearance: 'none',
              border: 0,
              cursor: 'pointer',
              padding: '5px 12px',
              fontSize: 11,
              borderRadius: 'var(--r-sm)',
              fontWeight: 'var(--fw-medium)' as unknown as number,
              background: on ? 'var(--c-elevated)' : 'transparent',
              color: on ? 'var(--c-text)' : 'var(--c-text-mute)',
              boxShadow: on ? 'inset 0 0 0 1px var(--c-line)' : 'none',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function Slider({ label, value, min, max, suffix, onChange }: { label: string; value: number; min: number; max: number; suffix: string; onChange: (n: number) => void }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={rowStyle}>
        <span style={labelStyle}>{label}</span>
        <span style={valueStyle}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
      />
    </div>
  )
}

export function CustomizeLayoutModal({ onClose }: { onClose: () => void }) {
  const { scenes, activeSceneId } = useStudio()
  const scene = scenes.find((s) => s.id === activeSceneId)
  const meta = LAYOUT_META[scene?.layout ?? 'split'] ?? LAYOUT_META.split

  const [fit, setFit] = useState<Fit>(DEFAULTS.fit)
  const [gravity, setGravity] = useState<string>(DEFAULTS.gravity)
  const [size, setSize] = useState<number>(DEFAULTS.size)
  const [radius, setRadius] = useState<number>(DEFAULTS.radius)
  const [gap, setGap] = useState<number>(DEFAULTS.gap)
  const [shape, setShape] = useState<Shape>(DEFAULTS.shape)
  const [names, setNames] = useState<boolean>(DEFAULTS.names)

  const g = GRAVITIES.find((x) => x.id === gravity) ?? GRAVITIES[4]

  const pickShape = (id: string) => {
    const next = id as Shape
    setShape(next)
    if (next === 'rect') setRadius(0)
    if (next === 'rounded' && radius === 0) setRadius(12)
  }

  const pickRadius = (n: number) => {
    setRadius(n)
    if (shape !== 'rounded' && n > 0) setShape('rounded')
    if (shape !== 'rect' && n === 0) setShape('rect')
  }

  const reset = () => {
    setFit(DEFAULTS.fit)
    setGravity(DEFAULTS.gravity)
    setSize(DEFAULTS.size)
    setRadius(DEFAULTS.radius)
    setGap(DEFAULTS.gap)
    setShape(DEFAULTS.shape)
    setNames(DEFAULTS.names)
  }

  const footBtn: React.CSSProperties = {
    appearance: 'none',
    cursor: 'pointer',
    padding: '7px 14px',
    fontSize: 12,
    borderRadius: 'var(--r-md)',
    border: '1px solid var(--c-line)',
    background: 'transparent',
    color: 'var(--c-text-dim)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  }

  return (
    <Modal
      title="Customize layout"
      description="Fine-tune how sources sit on the stage."
      width="lg"
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 10 }}>
          <button type="button" onClick={reset} style={footBtn}>
            <Icon name="refresh" size={13} />
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...footBtn,
              background: 'var(--brand-primary)',
              borderColor: 'var(--brand-primary)',
              color: 'var(--c-text)',
              fontWeight: 'var(--fw-semibold)' as unknown as number,
            }}
          >
            Done
          </button>
        </div>
      }
    >
      <div className="modal__section">
        <div style={{ ...rowStyle, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--c-text-dim)', fontSize: 11 }}>
            <Icon name={meta.icon} size={14} />
            <span style={{ fontWeight: 'var(--fw-medium)' as unknown as number }}>{meta.name}</span>
            <span style={{ color: 'var(--c-text-mute)' }}>· {scene?.title ?? 'Stage'}</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--c-text-mute)' }}>
            {fit === 'cover' ? 'Cropped to fill' : 'Fitted with bars'} · {g.label}
          </span>
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-line)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          {meta.boxes.map((b, i) => {
            const tile = TILES[i % TILES.length]
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: `${b.w}%`,
                  height: `${b.h}%`,
                  padding: gap / 2,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    height: `${size}%`,
                    width: shape === 'circle' ? 'auto' : `${size}%`,
                    aspectRatio: shape === 'circle' ? '1 / 1' : undefined,
                    borderRadius: shape === 'circle' ? '50%' : radius,
                    overflow: 'hidden',
                    background: 'var(--c-panel)',
                    boxShadow: 'inset 0 0 0 1px var(--c-line)',
                    display: 'flex',
                    alignItems: g.ay,
                    justifyContent: g.ax,
                  }}
                >
                  <div
                    style={{
                      width: fit === 'cover' ? '100%' : '74%',
                      height: fit === 'cover' ? '100%' : '74%',
                      transform: fit === 'cover' ? 'scale(1.2)' : 'none',
                      transformOrigin: g.origin,
                      background: `linear-gradient(140deg, ${tile.tint}, var(--c-elevated))`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--c-text)',
                      fontSize: 20,
                      letterSpacing: 1,
                      fontWeight: 'var(--fw-semibold)' as unknown as number,
                    }}
                  >
                    {tile.initials}
                  </div>
                  {names && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 8,
                        bottom: 8,
                        padding: '3px 8px',
                        fontSize: 10,
                        borderRadius: 'var(--r-sm)',
                        background: 'rgba(0,0,0,0.55)',
                        color: 'var(--c-text)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tile.name}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="modal__section">
        <div className="modal__split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <div style={rowStyle}>
              <span style={labelStyle}>Fit</span>
              <Segmented
                value={fit}
                onChange={(id: string) => setFit(id as Fit)}
                options={[{ id: 'cover', label: 'Cover' }, { id: 'contain', label: 'Contain' }]}
              />
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Shape</span>
              <Segmented
                value={shape}
                onChange={pickShape}
                options={[{ id: 'rect', label: 'Rectangle' }, { id: 'rounded', label: 'Rounded' }, { id: 'circle', label: 'Circle' }]}
              />
            </div>
            <Slider label="Size" value={size} min={50} max={100} suffix="%" onChange={setSize} />
            <Slider label="Corner radius" value={radius} min={0} max={32} suffix="px" onChange={pickRadius} />
            <Slider label="Gap" value={gap} min={0} max={40} suffix="px" onChange={setGap} />
          </div>

          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={rowStyle}>
                <span style={labelStyle}>Gravity</span>
                <span style={{ fontSize: 11, color: 'var(--c-text-mute)' }}>{g.label}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 30px)', gap: 4 }}>
                {GRAVITIES.map((opt) => {
                  const on = opt.id === gravity
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      title={opt.label}
                      aria-label={opt.label}
                      aria-pressed={on}
                      onClick={() => setGravity(opt.id)}
                      style={{
                        appearance: 'none',
                        cursor: 'pointer',
                        height: 30,
                        borderRadius: 'var(--r-sm)',
                        border: `1px solid ${on ? 'var(--brand-primary)' : 'var(--c-line)'}`,
                        background: on ? 'var(--brand-primary)' : 'var(--c-surface)',
                        display: 'flex',
                        alignItems: opt.ay,
                        justifyContent: opt.ax,
                        padding: 5,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 2,
                          background: on ? 'var(--c-text)' : 'var(--c-text-mute)',
                          display: 'block',
                        }}
                      />
                    </button>
                  )
                })}
              </div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--c-text-mute)', lineHeight: 1.5 }}>
                Sets which part of the frame is kept when a source is cropped to fill its tile.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNames(!names)}
              style={{
                appearance: 'none',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '9px 11px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--c-line)',
                background: 'var(--c-surface)',
                color: 'var(--c-text)',
                fontSize: 12,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="people" size={14} />
                Show participant names
              </span>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 'var(--r-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: names ? 'var(--brand-primary)' : 'transparent',
                  border: `1px solid ${names ? 'var(--brand-primary)' : 'var(--c-line)'}`,
                  color: 'var(--c-text)',
                }}
              >
                {names && <Icon name="check" size={11} />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
