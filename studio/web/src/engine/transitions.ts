/**
 * transitions.ts
 * Scene transition support for the compositor.
 *
 * The compositor draws the *incoming* scene into its 2D context every frame.
 * To transition, take a `snapshot()` of the canvas at the moment the scene
 * changes, then let a `TransitionRunner` paint that snapshot back over the
 * freshly drawn frame each tick until the transition finishes.
 *
 * All timing is driven by an injected `now` (milliseconds, monotonic — pass
 * the value the render loop already receives from requestAnimationFrame).
 * Nothing in this module reads the wall clock.
 */

export type TransitionKind = 'cut' | 'fade' | 'slide' | 'wipe' | 'dissolve'

export interface TransitionState {
  kind: TransitionKind
  startedAt: number
  durationMs: number
}

export const TRANSITIONS: { id: TransitionKind; label: string; defaultMs: number }[] = [
  { id: 'cut', label: 'Cut', defaultMs: 0 },
  { id: 'fade', label: 'Fade', defaultMs: 420 },
  { id: 'dissolve', label: 'Dissolve', defaultMs: 640 },
  { id: 'slide', label: 'Slide', defaultMs: 520 },
  { id: 'wipe', label: 'Wipe', defaultMs: 560 },
]

/** Smooth acceleration then deceleration. Clamped to 0..1. */
export const easeInOutCubic = (t: number): number => {
  const c = t < 0 ? 0 : t > 1 ? 1 : t
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2
}

/** Slow start, long tail — used to keep dissolves from popping at the end. */
const easeInOutSine = (t: number): number => {
  const c = t < 0 ? 0 : t > 1 ? 1 : t
  return -(Math.cos(Math.PI * c) - 1) / 2
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)

const defaultMsFor = (kind: TransitionKind): number => {
  const found = TRANSITIONS.find((t) => t.id === kind)
  return found ? found.defaultMs : 420
}

/**
 * Copy the current pixels of `source` into a fresh offscreen canvas sized to it.
 * The result is detached from the live render loop, so it is safe to keep and
 * paint back over later frames.
 */
export function snapshot(source: HTMLCanvasElement): HTMLCanvasElement {
  const off = document.createElement('canvas')
  off.width = Math.max(1, source.width)
  off.height = Math.max(1, source.height)
  const ctx = off.getContext('2d')
  if (ctx) {
    ctx.drawImage(source, 0, 0, off.width, off.height)
  }
  return off
}

export class TransitionRunner {
  private state: TransitionState | null = null
  private kindPref: TransitionKind
  private msPref: number

  constructor(defaultKind: TransitionKind = 'fade', defaultMs?: number) {
    this.kindPref = defaultKind
    this.msPref = typeof defaultMs === 'number' ? defaultMs : defaultMsFor(defaultKind)
  }

  /** The kind used when `start()` is called without an explicit one. */
  get defaultKind(): TransitionKind {
    return this.kindPref
  }

  /** Change the fallback kind (and its duration, unless one is supplied). */
  setDefault(kind: TransitionKind, durationMs?: number): void {
    this.kindPref = kind
    this.msPref = typeof durationMs === 'number' ? durationMs : defaultMsFor(kind)
  }

  /** Begin a transition at `now`. A zero-length or 'cut' transition ends instantly. */
  start(kind: TransitionKind, now: number, durationMs?: number): void {
    const ms =
      kind === 'cut' ? 0 : typeof durationMs === 'number' ? Math.max(0, durationMs) : this.msPref
    if (kind === 'cut' || ms <= 0) {
      this.state = null
      return
    }
    this.state = { kind, startedAt: now, durationMs: ms }
  }

  /** Cancel any running transition immediately. */
  cancel(): void {
    this.state = null
  }

  /** A snapshot of what is currently running, or null when idle. */
  get current(): TransitionState | null {
    return this.state ? { ...this.state } : null
  }

  get active(): boolean {
    return this.state !== null
  }

  /** 0..1 eased progress; 1 when idle or finished. */
  progress(now: number): number {
    const s = this.state
    if (!s || s.durationMs <= 0) return 1
    const raw = clamp01((now - s.startedAt) / s.durationMs)
    return s.kind === 'dissolve' ? easeInOutSine(raw) : easeInOutCubic(raw)
  }

  /** 0..1 unshaped progress, before easing. */
  private linear(now: number): number {
    const s = this.state
    if (!s || s.durationMs <= 0) return 1
    return clamp01((now - s.startedAt) / s.durationMs)
  }

  /**
   * Paint the outgoing frame over the incoming one according to the transition.
   * `prev` is a snapshot canvas of the previous scene; the incoming scene is already
   * drawn into ctx. Returns true while still transitioning.
   */
  paint(
    ctx: CanvasRenderingContext2D,
    prev: HTMLCanvasElement | null,
    canvasW: number,
    canvasH: number,
    now: number,
  ): boolean {
    const s = this.state
    if (!s) return false
    if (!prev || prev.width === 0 || prev.height === 0 || canvasW <= 0 || canvasH <= 0) {
      this.state = null
      return false
    }

    const raw = this.linear(now)
    if (raw >= 1) {
      this.state = null
      return false
    }
    const eased = this.progress(now)

    ctx.save()
    switch (s.kind) {
      case 'fade':
      case 'dissolve': {
        ctx.globalAlpha = 1 - eased
        ctx.drawImage(prev, 0, 0, canvasW, canvasH)
        break
      }
      case 'slide': {
        // Outgoing frame slides off to the left; the incoming scene sits beneath it.
        const offset = -eased * canvasW
        ctx.globalAlpha = 1
        ctx.drawImage(prev, offset, 0, canvasW, canvasH)
        break
      }
      case 'wipe': {
        // Reveal the incoming scene left-to-right by clipping the outgoing frame
        // down to the not-yet-revealed remainder on the right.
        const edge = eased * canvasW
        const remaining = canvasW - edge
        if (remaining > 0) {
          ctx.beginPath()
          ctx.rect(edge, 0, remaining, canvasH)
          ctx.clip()
          ctx.globalAlpha = 1
          ctx.drawImage(prev, 0, 0, canvasW, canvasH)
        }
        break
      }
      case 'cut':
      default: {
        this.state = null
        ctx.restore()
        return false
      }
    }
    ctx.restore()
    return true
  }
}
