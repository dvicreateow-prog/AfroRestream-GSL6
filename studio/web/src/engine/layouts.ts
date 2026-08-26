/*
 * Layout geometry.
 *
 * Restream composes onto a fixed 1920x1080 canvas at 30 fps (SPEC-features-layouts.md;
 * the render loop is hard-coded `frameRate ?? 30`). Tile fitting is Cover or Contain
 * with 9-way gravity - there is no per-tile crop/zoom/pan.
 */
import { CANVAS_H, CANVAS_W, type LayoutId } from '@studio/shared'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export type Fit = 'cover' | 'contain'

export type Gravity =
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'center' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right'

const W = CANVAS_W
const H = CANVAS_H

/** Outer margin and inter-tile gap, in canvas px. */
const PAD = 24
const GAP = 16

function grid(n: number, cols: number, rows: number): Rect[] {
  const cellW = (W - PAD * 2 - GAP * (cols - 1)) / cols
  const cellH = (H - PAD * 2 - GAP * (rows - 1)) / rows
  const out: Rect[] = []
  for (let i = 0; i < n; i++) {
    const c = i % cols
    const r = Math.floor(i / cols)
    out.push({
      x: PAD + c * (cellW + GAP),
      y: PAD + r * (cellH + GAP),
      w: cellW,
      h: cellH,
    })
  }
  return out
}

/** Centre the last row when it is short, so a 3-up grid doesn't hang left. */
function balance(rects: Rect[], cols: number): Rect[] {
  const rows = Math.ceil(rects.length / cols)
  const lastCount = rects.length - (rows - 1) * cols
  if (lastCount === 0 || lastCount === cols) return rects
  const cellW = rects[0].w
  const shift = ((cols - lastCount) * (cellW + GAP)) / 2
  return rects.map((r, i) => (i >= (rows - 1) * cols ? { ...r, x: r.x + shift } : r))
}

/**
 * Compute tile rects for a layout.
 * `n` is the number of on-air sources; `primary` is the index treated as the
 * featured tile for spotlight / pip / screen layouts.
 */
export function computeLayout(layout: LayoutId, n: number, primary = 0): Rect[] {
  if (n <= 0) return []

  const full: Rect = { x: 0, y: 0, w: W, h: H }

  switch (layout) {
    case 'solo':
      return [full]

    case 'split': {
      if (n === 1) return [full]
      return grid(Math.min(n, 2), 2, 1)
    }

    case 'stacked': {
      if (n === 1) return [full]
      return grid(Math.min(n, 2), 1, 2)
    }

    case 'grid': {
      const cols = n <= 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4
      const rows = Math.ceil(n / cols)
      return balance(grid(n, cols, rows), cols)
    }

    case 'pip': {
      if (n === 1) return [full]
      /* Featured fills the frame; the rest inset bottom-right, newest nearest the edge. */
      const pipW = W * 0.24
      const pipH = (pipW * 9) / 16
      const rects: Rect[] = []
      let k = 0
      for (let i = 0; i < n; i++) {
        if (i === primary) {
          rects[i] = full
        } else {
          rects[i] = {
            x: W - PAD - pipW - k * (pipW + GAP),
            y: H - PAD - pipH,
            w: pipW,
            h: pipH,
          }
          k++
        }
      }
      return rects
    }

    case 'spotlight':
    case 'screen': {
      if (n === 1) return [full]
      /* Featured left ~72%, others stacked in a right column. */
      const mainW = (W - PAD * 2 - GAP) * 0.72
      const sideW = W - PAD * 2 - GAP - mainW
      const others = n - 1
      const sideH = (H - PAD * 2 - GAP * (others - 1)) / others
      const rects: Rect[] = []
      let k = 0
      for (let i = 0; i < n; i++) {
        if (i === primary) {
          rects[i] = { x: PAD, y: PAD, w: mainW, h: H - PAD * 2 }
        } else {
          rects[i] = {
            x: PAD + mainW + GAP,
            y: PAD + k * (sideH + GAP),
            w: sideW,
            h: sideH,
          }
          k++
        }
      }
      return rects
    }

    case 'custom':
    default:
      return computeLayout('grid', n, primary)
  }
}

/**
 * Source rect for drawImage, honouring fit + gravity.
 * Returns the crop window in the *source* image's coordinate space.
 */
export function sourceCrop(
  srcW: number,
  srcH: number,
  dest: Rect,
  fit: Fit = 'cover',
  gravity: Gravity = 'center',
): Rect {
  if (!srcW || !srcH) return { x: 0, y: 0, w: srcW || 1, h: srcH || 1 }

  const srcAspect = srcW / srcH
  const dstAspect = dest.w / dest.h

  if (fit === 'contain') {
    /* No cropping - the whole frame is drawn, letterboxed by the caller. */
    return { x: 0, y: 0, w: srcW, h: srcH }
  }

  let cw = srcW
  let ch = srcH
  if (srcAspect > dstAspect) {
    cw = srcH * dstAspect
  } else {
    ch = srcW / dstAspect
  }

  const gx = gravity.includes('left') ? 0 : gravity.includes('right') ? 1 : 0.5
  const gy = gravity.includes('top') ? 0 : gravity.includes('bottom') ? 1 : 0.5

  return { x: (srcW - cw) * gx, y: (srcH - ch) * gy, w: cw, h: ch }
}

/** Fit a source into dest preserving aspect (used by `contain`). */
export function containBox(srcW: number, srcH: number, dest: Rect): Rect {
  if (!srcW || !srcH) return dest
  const scale = Math.min(dest.w / srcW, dest.h / srcH)
  const w = srcW * scale
  const h = srcH * scale
  return { x: dest.x + (dest.w - w) / 2, y: dest.y + (dest.h - h) / 2, w, h }
}
