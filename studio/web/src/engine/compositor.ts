/*
 * Canvas compositor.
 *
 * Draws every on-air tile plus overlays onto a 1920x1080 canvas at 30 fps, then
 * exposes the result as a MediaStream via captureStream(). That stream is what gets
 * recorded locally and pushed to the server for RTMP fan-out.
 *
 * Matches the shipped pipeline's constants (SPEC-features-layouts.md / TOOLS-02):
 * fixed 30 fps render loop, Cover/Contain fit with 9-way gravity, no per-tile zoom.
 */
import { CANVAS_H, CANVAS_W } from '@studio/shared'
import type { LayoutId } from '@studio/shared'
import {
  computeLayout,
  containBox,
  sourceCrop,
  type Fit,
  type Gravity,
  type Rect,
} from './layouts'

export interface Tile {
  id: string
  /** Anything drawImage accepts; video for cameras/screens/clips. */
  el: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  label?: string
  sublabel?: string
  color?: string
  fit?: Fit
  gravity?: Gravity
  /** Draw a muted indicator on the tile. */
  muted?: boolean
}

export interface OverlayDraw {
  id: string
  /** x/y/w/h are percentages of the canvas (0-100). */
  kind: 'lowerThird' | 'ticker' | 'logo' | 'caption' | 'qr' | 'banner'
  visible: boolean
  x: number
  y: number
  w: number
  h: number
  text?: string
  subtext?: string
  color?: string
  image?: HTMLImageElement
}

/** Paints onto the composited frame. `now` is a monotonic ms timestamp. */
export type Painter = (
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  now: number,
) => void

export type TransitionPaint = (
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  now: number,
) => boolean

export interface CompositorOptions {
  fps?: number
  background?: string
  /** Draw participant name plates. */
  nameplates?: boolean
}

const RADIUS = 16

export class Compositor {
  readonly canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private raf = 0
  private last = 0
  private running = false

  private tiles: Tile[] = []
  private overlays: OverlayDraw[] = []
  /* Extra painters (countdown, chat-on-stream, ...) drawn after overlays.
   * Keyed so a subsystem can replace or remove its own painter. */
  private painters = new Map<string, Painter>()
  /* Called with the finished frame so a transition can blend the previous scene
   * over the top. Returns true while a transition is still running. */
  private transition: TransitionPaint | null = null
  private layout: LayoutId = 'grid'
  private primary = 0

  readonly fps: number
  private background: string
  private nameplates: boolean

  constructor(opts: CompositorOptions = {}) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = CANVAS_W
    this.canvas.height = CANVAS_H
    const ctx = this.canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('2D canvas context unavailable')
    this.ctx = ctx
    this.fps = opts.fps ?? 30
    this.background = opts.background ?? '#0c0c0c'
    this.nameplates = opts.nameplates ?? true
  }

  /* ---------------- public API ---------------- */

  setTiles(tiles: Tile[]) {
    this.tiles = tiles
  }

  setOverlays(overlays: OverlayDraw[]) {
    this.overlays = overlays
  }

  /** Register a painter drawn on top of tiles and overlays. */
  setPainter(id: string, fn: Painter | null) {
    if (fn) this.painters.set(id, fn)
    else this.painters.delete(id)
  }

  setTransition(fn: TransitionPaint | null) {
    this.transition = fn
  }

  setLayout(layout: LayoutId, primary = 0) {
    this.layout = layout
    this.primary = primary
  }

  setBackground(color: string) {
    this.background = color
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = 0
    const loop = (t: number) => {
      if (!this.running) return
      this.raf = requestAnimationFrame(loop)
      /* Throttle to the target frame rate rather than the display refresh. */
      const interval = 1000 / this.fps
      if (this.last && t - this.last < interval - 1) return
      this.last = t
      this.draw()
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  /** Video track of the composed programme output. */
  captureStream(): MediaStream {
    return this.canvas.captureStream(this.fps)
  }

  dispose() {
    this.stop()
    this.tiles = []
    this.overlays = []
  }

  /* ---------------- drawing ---------------- */

  private draw() {
    const { ctx } = this
    ctx.fillStyle = this.background
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    const rects = computeLayout(this.layout, this.tiles.length, this.primary)

    /* PiP and spotlight need the featured tile painted first so insets sit on top. */
    const order = this.tiles.map((_, i) => i)
    if (this.layout === 'pip') {
      order.sort((a, b) => (a === this.primary ? -1 : b === this.primary ? 1 : 0))
    }

    for (const i of order) {
      const tile = this.tiles[i]
      const rect = rects[i]
      if (!tile || !rect) continue
      this.drawTile(tile, rect)
    }

    for (const ov of this.overlays) {
      if (ov.visible) this.drawOverlay(ov)
    }

    const now = performance.now()
    for (const paint of this.painters.values()) {
      ctx.save()
      try {
        paint(ctx, CANVAS_W, CANVAS_H, now)
      } catch {
        /* One bad painter must not kill the render loop. */
      }
      ctx.restore()
    }

    if (this.transition) {
      ctx.save()
      try {
        if (!this.transition(ctx, CANVAS_W, CANVAS_H, now)) this.transition = null
      } catch {
        this.transition = null
      }
      ctx.restore()
    }
  }

  private drawTile(tile: Tile, rect: Rect) {
    const { ctx } = this
    const el = tile.el

    const sw =
      el instanceof HTMLVideoElement
        ? el.videoWidth
        : el instanceof HTMLImageElement
          ? el.naturalWidth
          : el.width
    const sh =
      el instanceof HTMLVideoElement
        ? el.videoHeight
        : el instanceof HTMLImageElement
          ? el.naturalHeight
          : el.height

    ctx.save()
    this.roundRect(rect, RADIUS)
    ctx.clip()

    /* Tile backdrop, visible while a source is still connecting. */
    ctx.fillStyle = '#242428'
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h)

    if (sw > 0 && sh > 0) {
      const fit = tile.fit ?? 'cover'
      if (fit === 'contain') {
        const box = containBox(sw, sh, rect)
        ctx.drawImage(el, 0, 0, sw, sh, box.x, box.y, box.w, box.h)
      } else {
        const crop = sourceCrop(sw, sh, rect, 'cover', tile.gravity ?? 'center')
        ctx.drawImage(el, crop.x, crop.y, crop.w, crop.h, rect.x, rect.y, rect.w, rect.h)
      }
    } else if (tile.label) {
      /* Avatar fallback: initials on the participant colour. */
      const cx = rect.x + rect.w / 2
      const cy = rect.y + rect.h / 2
      const r = Math.min(rect.w, rect.h) * 0.16
      ctx.fillStyle = tile.color ?? '#2864f0'
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = `600 ${r * 0.7}px Inter, Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.initials(tile.label), cx, cy + 1)
    }

    ctx.restore()

    if (this.nameplates && tile.label) this.drawNameplate(tile, rect)
  }

  private drawNameplate(tile: Tile, rect: Rect) {
    const { ctx } = this
    const padX = 16
    const h = 44
    const x = rect.x + 20
    const y = rect.y + rect.h - h - 20

    ctx.font = '500 22px Inter, Arial, sans-serif'
    const w = Math.min(ctx.measureText(tile.label!).width + padX * 2, rect.w - 40)

    ctx.save()
    ctx.fillStyle = 'rgba(20,20,22,0.82)'
    this.roundRect({ x, y, w, h }, 8)
    ctx.fill()

    ctx.fillStyle = '#f6f6f7'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(tile.label!, x + padX, y + h / 2 + 1)
    ctx.restore()

    if (tile.muted) {
      const s = 30
      const mx = rect.x + rect.w - s - 20
      const my = rect.y + 20
      ctx.save()
      ctx.fillStyle = 'rgba(239,75,85,0.92)'
      this.roundRect({ x: mx, y: my, w: s, h: s }, 8)
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(mx + 8, my + 8)
      ctx.lineTo(mx + s - 8, my + s - 8)
      ctx.stroke()
      ctx.restore()
    }
  }

  private drawOverlay(ov: OverlayDraw) {
    const { ctx } = this
    /* Overlay rects are percentages of the canvas, matching the Graphics panel. */
    const rect: Rect = {
      x: (ov.x / 100) * CANVAS_W,
      y: (ov.y / 100) * CANVAS_H,
      w: (ov.w / 100) * CANVAS_W,
      h: (ov.h / 100) * CANVAS_H,
    }

    ctx.save()
    switch (ov.kind) {
      case 'lowerThird': {
        ctx.fillStyle = ov.color ?? '#2864f0'
        this.roundRect(rect, 10)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'
        ctx.font = '600 30px Inter, Arial, sans-serif'
        ctx.fillText(ov.text ?? '', rect.x + 24, rect.y + 16)
        if (ov.subtext) {
          ctx.font = '400 21px Inter, Arial, sans-serif'
          ctx.fillStyle = 'rgba(255,255,255,0.82)'
          ctx.fillText(ov.subtext, rect.x + 24, rect.y + 56)
        }
        break
      }
      case 'banner':
      case 'ticker': {
        ctx.fillStyle = ov.color ?? 'rgba(20,20,22,0.88)'
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
        ctx.fillStyle = '#fff'
        ctx.font = '500 26px Inter, Arial, sans-serif'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        ctx.fillText(ov.text ?? '', rect.x + 24, rect.y + rect.h / 2)
        break
      }
      case 'caption': {
        const text = ov.text ?? ''
        ctx.font = '500 34px Inter, Arial, sans-serif'
        const tw = ctx.measureText(text).width
        const bx = (CANVAS_W - tw) / 2 - 20
        ctx.fillStyle = 'rgba(0,0,0,0.68)'
        this.roundRect({ x: bx, y: rect.y, w: tw + 40, h: 56 }, 8)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, CANVAS_W / 2, rect.y + 28)
        break
      }
      case 'logo':
      case 'qr': {
        if (ov.image && ov.image.naturalWidth) {
          ctx.drawImage(ov.image, rect.x, rect.y, rect.w, rect.h)
        }
        break
      }
    }
    ctx.restore()
  }

  /* ---------------- helpers ---------------- */

  private roundRect(r: Rect, radius: number) {
    const { ctx } = this
    const rr = Math.min(radius, r.w / 2, r.h / 2)
    ctx.beginPath()
    ctx.moveTo(r.x + rr, r.y)
    ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rr)
    ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rr)
    ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rr)
    ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rr)
    ctx.closePath()
  }

  private initials(name: string) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')
  }
}
