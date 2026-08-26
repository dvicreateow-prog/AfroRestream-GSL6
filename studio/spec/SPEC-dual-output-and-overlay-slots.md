# Dual output and the overlay-slot model

Derived from a live DOM sample of the reference product's player, read structurally.
This records the **model** — how the pieces relate and what properties each carries —
so we can build our own equivalent. No vendor markup or class names are reproduced.

Flagged because the gap audit missed it: auditors were scoped one-per-spec-file, and
dual output is spread across eight files without owning any, so nobody claimed it.

---

## 1. Dual output

The player can render **two programme outputs at once**, side by side:

| Output | Canvas | Notes |
|---|---|---|
| Portrait | 1080 × 1920 | 9:16 |
| Landscape | 1920 × 1080 | 16:9 |

Both draw the *same* scene graph, laid out independently. Observed consequences:

- Each output has **its own destination set** — a channel is bound to portrait or
  landscape, not to the broadcast as a whole. This is why the destination model needs
  an `output` discriminator, not just an `enabled` flag.
- Each output can be **collapsed** independently, leaving the other full width.
- The same source appears in both with **different item geometry**. In the sample the
  webcam is full-bleed in landscape, and in portrait is scaled ~316% and offset
  negatively on X so a 16:9 camera fills a 9:16 frame. So per-output item transforms
  are required — a single shared layout will not do.

### What this means for us

Our compositor renders one 1920×1080 canvas. Supporting this means:

1. Two `Compositor` instances sharing one tile registry, each with its own layout
   solve and its own `captureStream()`.
2. `Destination` gains `output: 'landscape' | 'portrait'`.
3. The broadcaster runs two encode chains, or one with a scaler branch per output.
4. `MediaRecorder` per output, or a single mux with two video tracks.

Non-trivial. Landscape-only remains a legitimate first release.

---

## 2. Overlay slots are fixed, not free-form

The overlay layer is **not** a bag of arbitrary boxes. It is a fixed set of named
slots, each owning one concern:

| Slot | Purpose |
|---|---|
| `countdown` | Pre-show timer |
| `chat` | Chat on stream |
| `overlay-image` | Full-frame image, with a crossfade pair for transitions |
| `air-theme-background` | Theme backdrop, driven by a text-height multiplier |
| `caption` | Live captions, bottom-offset aware |
| `ticker` | Scrolling strip |
| `qr-code` | Scannable code |
| `logo` | Brand mark, with its own remove affordance |
| `alert` | Transient notifications |

Each slot is present in the DOM at all times and toggles a hidden state, rather than
being created and destroyed. The image slot keeps **two** elements so one can fade out
while the next fades in.

### Why this matters to us

Our `Overlay` type is free-form (`kind` + rect), and `compositor.drawOverlay` has cases
for only six kinds. The Graphics panel can add a `chat` overlay that paints nothing,
because no case handles it — a silent no-op the audit caught.

Moving to a slot model fixes that class of bug by construction: a slot either exists
and renders, or does not exist at all.

---

## 3. Layout item properties

Every item on the stage carries more than a rectangle. Observed per-item properties:

| Property | Meaning |
|---|---|
| `width` / `height` / `left` / `top` | Slot rect, in percent of canvas |
| `cropWidth` / `cropHeight` / `cropLeft` / `cropTop` | Source crop window, percent |
| `itemWidth` / `itemHeight` / `itemLeft` / `itemTop` | Source transform inside the slot |
| `borderRadius` | Corner rounding |
| `backgroundColor` | Fill behind the source |
| `zIndex` | Stacking, e.g. nameplate 101 above video 100 |
| `opacity` | Per-item alpha |

Our `Tile` has `fit`, `gravity`, `label`, `color`, `muted` — and **none** of crop,
radius, background, zIndex or opacity. The audit's "layout system is a hand-rolled
substitute" finding is precisely this.

The separation of *slot rect* from *item transform* is the key idea: the slot says
where the tile sits on the canvas; the item transform says how the source is scaled and
offset within it. That is what lets one camera fill both a 16:9 and a 9:16 frame.

---

## 4. Scaling ratios

Two distinct scale factors are carried alongside each output:

- **preview scale** — canvas pixels to on-screen preview pixels
- **stream scale** — canvas pixels to encoded output pixels

Plus per-feature scales for browser sources, and explicit container widths for caption
and ticker. This is the reserved-space maths the audit lists as a blocker: overlays
declare how much of the frame they consume, and the layout solver reflows sources
around them. We compute neither today.

---

## 5. Per-item controls

Items expose contextual controls on hover: **Edit**, **Hide**, **Mute**, **Maximize**,
**Customize**, and an overflow menu. Ours has none — sources can only be toggled from
the panel, never manipulated on the stage itself.

---

## Priority

Against the gap report, this reorders things:

1. **Item property model** (crop / radius / zIndex / opacity, slot rect vs item
   transform) — everything else builds on it, and it is a contained change to
   `Tile` plus `layouts.ts`.
2. **Overlay slots** — removes a whole class of silent no-op.
3. **Reserved space** — already a listed blocker; needs 1 and 2 first.
4. **Per-item stage controls** — visible, self-contained.
5. **Dual output** — the largest, and reasonable to defer.
