# SPEC — Studio stage geometry

Pixel-level visual spec for the Restream Studio interface, reconstructed from 22 captured
window layouts and cross-checked against the production CSS / extracted SCSS sources.

**Sources**

| what | path |
|---|---|
| Captured layouts (22) | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/.tmp_restream_studio_build/slide-01.layout.json` … `slide-22.layout.json` |
| Production CSS | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/css/` |
| Extracted SCSS (source maps) | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/03-deep-static/source-maps/extracted/` |

**Reference frame** — every capture is `1280 x 720` (`slide.frame = {left:0, top:0, width:1280, height:720}`),
unit `px`, schema `openai.presentation.layout/v4`. All 22 are pure `shape` elements (no images, no groups);
`geometry` is only ever `rect`, `roundRect` or `ellipse`, and **no corner radius is recorded** — radii in
section 3 come from the CSS, not the capture.

**Authority** — where the capture and the CSS disagree, **the CSS is authoritative** (section 4).
The capture is a *reconstruction* at 1280x720; the real client's desktop breakpoint is
`min-width: 1080px and min-height: 660px` (`scripts/styles/viewport.scss`).

---

## 1. Window index

| # | screen | background | elements | distinguishing feature |
|---|---|---|--:|---|
| 01 | Pre-join lobby / device permission (`JoinScreen`) | `#19191A` | 17 | light `#F4F4F5` device card, 500x448 |
| 02 | Studio main — **Sources** tab, Camera scene | `#0F0F10` | 168 | canonical chrome; *base B* |
| 03 | **Add Scene** chooser modal | `#0F0F10` | 195 | 550x472 modal, 3 choice rows |
| 04 | **Add Media Scene** source chooser modal | `#0F0F10` | 217 | 680x584 modal, 2x4 grid of 290x88 cards |
| 05 | Sources tab — guest live | `#0F0F10` | 168 | same geometry as *B*; state only |
| 06 | Right panel — **Chat** | `#0F0F10` | 162 | 3 x 224x90 message cards + reply field |
| 07 | Right panel — **Graphics** | `#0F0F10` | 157 | 2x2 logo grid + 2x2 overlay grid, 102x66 tiles |
| 08 | Right panel — **Theme** | `#0F0F10` | 156 | 4 theme tiles + 6 colour swatches |
| 09 | Right panel — **Captions** | `#0F0F10` | 152 | 3 lower-third cards + ticker |
| 10 | Right panel — **QR Codes** | `#0F0F10` | 171 | 2 x 224x162 cards with 76x76 code + 3x3 pixels |
| 11 | Right panel — **Notes** | `#0F0F10` | 142 | 224x354 editor + counter |
| 12 | **Settings** modal — General | `#0F0F10` | 203 | 620x570 modal, 150px nav, 5 toggle rows |
| 13 | **Settings** modal — Video | `#0F0F10` | 197 | 392x180 camera preview |
| 14 | **Settings** modal — Audio | `#0F0F10` | 216 | 18-segment input meter |
| 15 | Right panel — **Customize Layout** | `#0F0F10` | 166 | 3px `#447CFF` selection outline on stage |
| 16 | **Countdown** scene (scene 3) | `#0F0F10` | 138 | 78px countdown numerals, stage tiles removed |
| 17 | **Presentation** scene (scene 2) | `#0F0F10` | 153 | 540x360 white slide + 135x152 presenter PiP |
| 18 | **Invite Guests** modal | `#0F0F10` | 193 | 580x480 modal |
| 19 | **Stream details** modal | `#0F0F10` | 194 | 620x585 modal, Cancel/Save footer |
| 20 | **Channels & Schedule** modal | `#0F0F10` | 227 | 780x566 modal, two 350x420 columns |
| 21 | **Dual output** preview | `#0F0F10` | 187 | 490x276 landscape + 180x320 portrait |
| 22 | **Live** state | `#0F0F10` | 159 | LIVE/REC pills, edit-mode banner, 4 stat rows |

Windows 02–22 share one chrome. Verified by diffing every named element against window 02:
outside of the deltas listed per section, **every shared element has byte-identical bbox, fill,
stroke, text and text style**.

---
## 2. Per-window element tables

Coordinates are absolute in the 1280x720 frame: `x`,`y` = top-left corner, `w`,`h` = size.
`fill` is the shape fill; `+ Npx #hex` is the stroke. `**b**` after the font size means bold.

### 2.1 Window 01 — Pre-join lobby / device-permission screen

Background `#19191A`. `JoinScreen` — camera+mic permission gate before entering Studio. Only slide with a light card and its own background (`#19191A`).

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `restream-logo-word` | 22 | 18 | 104 | 24 | — | 16 **b** | #F6F6F7 | RESTREAM |
| `restream-logo-studio-tag` | 127 | 19 | 61 | 22 | #2D2D32 | — | — |  |
| `restream-logo-studio` | 127 | 20 | 61 | 20 | — | 11 **b** | #F6F6F7 | STUDIO |
| `lobby-status-dot` | 150 | 224 | 23 | 23 | #EF4B55 + 1px #3A1114 | — | — |  |
| `lobby-host-status` | 182 | 221 | 395 | 30 | — | 16 **b** | #F6F6F7 | Studio host, you're setting up this stream |
| `lobby-heading` | 148 | 272 | 415 | 82 | — | 27 **b** | #F6F6F7 | Go live from your browser with ⏎ Restream Studio |
| `lobby-copy-invite-shape` | 224 | 374 | 265 | 46 | #2D2D32 | — | — |  |
| `lobby-copy-invite-label` | 224 | 376 | 265 | 42 | — | 13 **b** | #F6F6F7 | ＋ Copy Invite Link |
| `lobby-device-card` | 646 | 76 | 500 | 448 | #F4F4F5 | — | — |  |
| `lobby-device-heading` | 710 | 102 | 372 | 42 | — | 25 **b** | #17223A | Accessing your camera |
| `lobby-camera-preview` | 674 | 180 | 444 | 250 | #363636 | — | — |  |
| `lobby-camera-off` | 822 | 241 | 150 | 120 | — | 72 | #FFFFFF | ▱ |
| `lobby-device-copy` | 686 | 450 | 420 | 28 | — | 14 | #77777D | Studio needs access to your camera and microphone. |
| `lobby-allow-shape` | 674 | 480 | 444 | 48 | #2864F0 | — | — |  |
| `lobby-allow-label` | 674 | 482 | 444 | 44 | — | 13 **b** | #FFFFFF | Allow mic/cam access |
| `lobby-account` | 690 | 548 | 410 | 26 | — | 13 | #F6F6F7 | Signed in to your Restream workspace |
| `lobby-footer` | 18 | 655 | 460 | 24 | — | 12 | #73737D | © 2026 Restream, Inc. All Rights Reserved. |

### 2.2 Window 02 — Studio main — Sources panel, Camera scene (base chrome)

Background `#0F0F10`. Canonical Studio shell: header, scene rail, stage, right panel (Sources tab), tool rail, control bar. Every later slide reuses this chrome.

This is the **base chrome** referenced by every later section as *B*.

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `header-bg` | 0 | 0 | 1280 | 58 | #141416 | — | — |  |
| `restream-logo-word` | 20 | 17 | 104 | 24 | — | 16 **b** | #F6F6F7 | RESTREAM |
| `restream-logo-studio-tag` | 125 | 18 | 61 | 22 | #2D2D32 | — | — |  |
| `restream-logo-studio` | 125 | 19 | 61 | 20 | — | 11 **b** | #F6F6F7 | STUDIO |
| `stream-title` | 200 | 11 | 235 | 23 | — | 14 **b** | #F6F6F7 | Weekly Product Update |
| `stream-title-pencil` | 438 | 12 | 24 | 22 | — | 14 | #A3A3AD | ✎ |
| `channels-pill-shape` | 476 | 14 | 86 | 30 | #2D2D32 | — | — |  |
| `channels-pill-label` | 476 | 17 | 86 | 24 | — | 12 **b** | #F6F6F7 | Channels |
| `schedule-pill-shape` | 570 | 14 | 88 | 30 | #2D2D32 | — | — |  |
| `schedule-pill-label` | 570 | 17 | 88 | 24 | — | 12 **b** | #F6F6F7 | Schedule |
| `status-summary` | 675 | 18 | 330 | 22 | — | 11 | #A3A3AD | 1080p   •   00:00   •   0 viewers   •   0 scans |
| `record-pill-shape` | 1010 | 14 | 75 | 30 | #2D2D32 + 1px #484850 | — | — |  |
| `record-pill-label` | 1010 | 17 | 75 | 24 | — | 12 **b** | #F6F6F7 | Record |
| `settings-button-shape` | 1095 | 10 | 38 | 38 | #2D2D32 | — | — |  |
| `settings-button-icon` | 1095 | 11 | 38 | 36 | — | 15 **b** | #F6F6F7 | ⚙ |
| `go-live-button-shape` | 1144 | 10 | 114 | 38 | #2864F0 | — | — |  |
| `go-live-button-label` | 1144 | 12 | 114 | 34 | — | 13 **b** | #F6F6F7 | Go Live |
| `scene-rail-bg` | 0 | 58 | 182 | 662 | #111113 | — | — |  |
| `add-scene-button-shape` | 16 | 76 | 150 | 38 | #2D2D32 + 1px #484850 | — | — |  |
| `add-scene-button-label` | 16 | 78 | 150 | 34 | — | 13 **b** | #F6F6F7 | +  Add Scene |
| `scene-1-selection` | 12 | 126 | 158 | 94 | #2D2D32 + 2px #447CFF | — | — |  |
| `scene-1-thumb` | 20 | 134 | 142 | 62 | #242428 | — | — |  |
| `scene-1-accent` | 30 | 145 | 32 | 32 | #2864F0 | — | — |  |
| `scene-1-number` | 30 | 150 | 32 | 21 | — | 12 **b** | #FFFFFF | 1 |
| `scene-1-title` | 70 | 144 | 82 | 19 | — | 12 **b** | #F6F6F7 | Camera |
| `scene-1-subtitle` | 70 | 167 | 82 | 20 | — | 10 | #A3A3AD | Host + guest |
| `scene-1-more` | 145 | 197 | 18 | 18 | — | 14 **b** | #A3A3AD | ⋮ |
| `scene-2-selection` | 12 | 231 | 158 | 94 | — | — | — |  |
| `scene-2-thumb` | 20 | 239 | 142 | 62 | #242428 | — | — |  |
| `scene-2-accent` | 30 | 250 | 32 | 32 | #7C5CFC | — | — |  |
| `scene-2-number` | 30 | 255 | 32 | 21 | — | 12 **b** | #FFFFFF | 2 |
| `scene-2-title` | 70 | 249 | 82 | 19 | — | 12 **b** | #F6F6F7 | Presentation |
| `scene-2-subtitle` | 70 | 272 | 82 | 20 | — | 10 | #A3A3AD | Q3 roadmap |
| `scene-2-more` | 145 | 302 | 18 | 18 | — | 14 **b** | #A3A3AD | ⋮ |
| `scene-3-selection` | 12 | 336 | 158 | 94 | — | — | — |  |
| `scene-3-thumb` | 20 | 344 | 142 | 62 | #242428 | — | — |  |
| `scene-3-accent` | 30 | 355 | 32 | 32 | #EF4B55 | — | — |  |
| `scene-3-number` | 30 | 360 | 32 | 21 | — | 12 **b** | #FFFFFF | 3 |
| `scene-3-title` | 70 | 354 | 82 | 19 | — | 12 **b** | #F6F6F7 | Countdown |
| `scene-3-subtitle` | 70 | 377 | 82 | 20 | — | 10 | #A3A3AD | Starting soon |
| `scene-3-more` | 145 | 407 | 18 | 18 | — | 14 **b** | #A3A3AD | ⋮ |
| `scene-4-selection` | 12 | 441 | 158 | 94 | — | — | — |  |
| `scene-4-thumb` | 20 | 449 | 142 | 62 | #242428 | — | — |  |
| `scene-4-accent` | 30 | 460 | 32 | 32 | #43C7E8 | — | — |  |
| `scene-4-number` | 30 | 465 | 32 | 21 | — | 12 **b** | #FFFFFF | 4 |
| `scene-4-title` | 70 | 459 | 82 | 19 | — | 12 **b** | #F6F6F7 | Video |
| `scene-4-subtitle` | 70 | 482 | 82 | 20 | — | 10 | #A3A3AD | Product demo |
| `scene-4-more` | 145 | 512 | 18 | 18 | — | 14 **b** | #A3A3AD | ⋮ |
| `scene-5-selection` | 12 | 546 | 158 | 94 | — | — | — |  |
| `scene-5-thumb` | 20 | 554 | 142 | 62 | #242428 | — | — |  |
| `scene-5-accent` | 30 | 565 | 32 | 32 | #24C875 | — | — |  |
| `scene-5-number` | 30 | 570 | 32 | 21 | — | 12 **b** | #FFFFFF | 5 |
| `scene-5-title` | 70 | 564 | 82 | 19 | — | 12 **b** | #F6F6F7 | Q&A |
| `scene-5-subtitle` | 70 | 587 | 82 | 20 | — | 10 | #A3A3AD | Three speakers |
| `scene-5-more` | 145 | 617 | 18 | 18 | — | 14 **b** | #A3A3AD | ⋮ |
| `stage-area` | 182 | 58 | 788 | 662 | #0F0F10 | — | — |  |
| `canvas-frame` | 205 | 86 | 742 | 418 | #1C1C1F + 1px #34343A | — | — |  |
| `host-video` | 228 | 112 | 337 | 366 | #242428 + 1px #34343A | — | — |  |
| `host-halo` | 341.5 | 223 | 110 | 110 | #2864F0 | — | — |  |
| `host-avatar` | 354.5 | 236 | 84 | 84 | #2D2D32 | — | — |  |
| `host-initials` | 354.5 | 243 | 84 | 70 | — | 28 **b** | #FFFFFF | AM |
| `host-nameplate` | 240 | 436 | 145 | 28 | #141416 | — | — |  |
| `host-name` | 250 | 440 | 125 | 20 | — | 11 **b** | #F6F6F7 | Alex Morgan |
| `host-mic-dot` | 529 | 126 | 22 | 22 | #141416 | — | — |  |
| `host-mic` | 529 | 129 | 22 | 16 | — | 9 **b** | #F6F6F7 | M |
| `guest-video` | 586 | 112 | 337 | 366 | #242428 + 1px #34343A | — | — |  |
| `guest-halo` | 699.5 | 223 | 110 | 110 | #7C5CFC | — | — |  |
| `guest-avatar` | 712.5 | 236 | 84 | 84 | #2D2D32 | — | — |  |
| `guest-initials` | 712.5 | 243 | 84 | 70 | — | 28 **b** | #FFFFFF | MK |
| `guest-nameplate` | 598 | 436 | 145 | 28 | #141416 | — | — |  |
| `guest-name` | 608 | 440 | 125 | 20 | — | 11 **b** | #F6F6F7 | Maya Kim |
| `guest-mic-dot` | 887 | 126 | 22 | 22 | #141416 | — | — |  |
| `guest-mic` | 887 | 129 | 22 | 16 | — | 9 **b** | #F6F6F7 | M |
| `lower-third` | 246 | 417 | 288 | 48 | #2864F0 | — | — |  |
| `lower-third-name` | 262 | 423 | 160 | 20 | — | 14 **b** | #FFFFFF | Alex Morgan |
| `lower-third-title` | 262 | 445 | 220 | 15 | — | 10 | #DDE7FF | Host • Product Team |
| `canvas-watermark` | 842 | 474 | 84 | 18 | — | 10 **b** | #A3A3AD | RESTREAM |
| `layout-label` | 210 | 525 | 56 | 24 | — | 11 **b** | #A3A3AD | Layout |
| `layout-1-shape` | 272 | 518 | 38 | 38 | #2864F0 | — | — |  |
| `layout-1-icon` | 272 | 519 | 38 | 36 | — | 15 **b** | #F6F6F7 | ▦ |
| `layout-2-shape` | 320 | 518 | 38 | 38 | #2D2D32 | — | — |  |
| `layout-2-icon` | 320 | 519 | 38 | 36 | — | 15 **b** | #F6F6F7 | ▥ |
| `layout-3-shape` | 368 | 518 | 38 | 38 | #2D2D32 | — | — |  |
| `layout-3-icon` | 368 | 519 | 38 | 36 | — | 15 **b** | #F6F6F7 | ▤ |
| `layout-4-shape` | 416 | 518 | 38 | 38 | #2D2D32 | — | — |  |
| `layout-4-icon` | 416 | 519 | 38 | 36 | — | 15 **b** | #F6F6F7 | ▣ |
| `layout-5-shape` | 464 | 518 | 38 | 38 | #2D2D32 | — | — |  |
| `layout-5-icon` | 464 | 519 | 38 | 36 | — | 15 **b** | #F6F6F7 | ◫ |
| `layout-6-shape` | 512 | 518 | 38 | 38 | #2D2D32 | — | — |  |
| `layout-6-icon` | 512 | 519 | 38 | 36 | — | 15 **b** | #F6F6F7 | ◩ |
| `layout-7-shape` | 560 | 518 | 38 | 38 | #2D2D32 | — | — |  |
| `layout-7-icon` | 560 | 519 | 38 | 36 | — | 15 **b** | #F6F6F7 | □ |
| `customize-layout-shape` | 628 | 518 | 38 | 38 | #2D2D32 | — | — |  |
| `customize-layout-icon` | 628 | 519 | 38 | 36 | — | 15 **b** | #F6F6F7 | ✥ |
| `customize-label` | 674 | 524 | 74 | 24 | — | 11 | #A3A3AD | Customize |
| `control-mic-circle` | 320 | 590 | 50 | 50 | #2D2D32 + 1px #484850 | — | — |  |
| `control-mic-icon` | 320 | 602 | 50 | 25 | — | 13 **b** | #F6F6F7 | M |
| `control-mic-label` | 313 | 646 | 64 | 20 | — | 10 | #A3A3AD | Mic |
| `control-cam-circle` | 402 | 590 | 50 | 50 | #2D2D32 + 1px #484850 | — | — |  |
| `control-cam-icon` | 402 | 602 | 50 | 25 | — | 13 **b** | #F6F6F7 | C |
| `control-cam-label` | 395 | 646 | 64 | 20 | — | 10 | #A3A3AD | Camera |
| `control-share-circle` | 484 | 590 | 50 | 50 | #242428 + 1px #484850 | — | — |  |
| `control-share-icon` | 484 | 602 | 50 | 25 | — | 13 **b** | #F6F6F7 | S |
| `control-share-label` | 477 | 646 | 64 | 20 | — | 10 | #A3A3AD | Share |
| `control-invite-circle` | 566 | 590 | 50 | 50 | #242428 + 1px #484850 | — | — |  |
| `control-invite-icon` | 566 | 602 | 50 | 25 | — | 13 **b** | #F6F6F7 | + |
| `control-invite-label` | 559 | 646 | 64 | 20 | — | 10 | #A3A3AD | Invite |
| `control-more-circle` | 648 | 590 | 50 | 50 | #242428 + 1px #484850 | — | — |  |
| `control-more-icon` | 648 | 602 | 50 | 25 | — | 13 **b** | #F6F6F7 | ••• |
| `control-more-label` | 641 | 646 | 64 | 20 | — | 10 | #A3A3AD | More |
| `device-status` | 248 | 682 | 636 | 22 | — | 10 | #73737D | Camera off  •  Microphone muted |
| `right-panel-bg` | 970 | 58 | 266 | 662 | #141416 | — | — |  |
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | Sources |
| `right-panel-divider` | 986 | 118 | 234 | 1 | #34343A | — | — |  |
| `tool-rail-bg` | 1236 | 58 | 44 | 662 | #111113 | — | — |  |
| `tool-sources-button` | 1243 | 84 | 30 | 30 | #2864F0 + 1px #447CFF | — | — |  |
| `tool-sources-icon` | 1243 | 89 | 30 | 20 | — | 11 **b** | #F6F6F7 | S |
| `tool-chat-button` | 1243 | 142 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-chat-icon` | 1243 | 147 | 30 | 20 | — | 11 **b** | #F6F6F7 | C |
| `tool-graphics-button` | 1243 | 200 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-graphics-icon` | 1243 | 205 | 30 | 20 | — | 11 **b** | #F6F6F7 | G |
| `tool-theme-button` | 1243 | 258 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-theme-icon` | 1243 | 263 | 30 | 20 | — | 11 **b** | #F6F6F7 | T |
| `tool-captions-button` | 1243 | 316 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-captions-icon` | 1243 | 321 | 30 | 20 | — | 8 **b** | #F6F6F7 | CC |
| `tool-qr-button` | 1243 | 374 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-qr-icon` | 1243 | 379 | 30 | 20 | — | 8 **b** | #F6F6F7 | QR |
| `tool-notes-button` | 1243 | 432 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-notes-icon` | 1243 | 437 | 30 | 20 | — | 11 **b** | #F6F6F7 | N |
| `help-button-shape` | 1243 | 668 | 30 | 30 | #242428 | — | — |  |
| `help-button-icon` | 1243 | 669 | 30 | 28 | — | 15 **b** | #F6F6F7 | ? |
| `copy-invite-shape` | 990 | 134 | 224 | 36 | #2864F0 | — | — |  |
| `copy-invite-label` | 990 | 136 | 224 | 32 | — | 13 **b** | #F6F6F7 | Copy Invite Link |
| `sources-backstage` | 990 | 186 | 130 | 20 | — | 10 **b** | #73737D | BACKSTAGE |
| `source-host-card` | 990 | 212 | 224 | 66 | #1C1C1F + 1px #34343A | — | — |  |
| `source-host-avatar` | 1002 | 225 | 34 | 34 | #2864F0 | — | — |  |
| `source-host-initial` | 1002 | 232 | 34 | 20 | — | 10 **b** | #FFFFFF | AM |
| `source-host-title` | 1046 | 224 | 119 | 20 | — | 12 **b** | #F6F6F7 | Alex Morgan |
| `source-host-subtitle` | 1046 | 248 | 119 | 18 | — | 10 | #A3A3AD | Host • All scenes |
| `source-host-action-shape` | 1158 | 232 | 44 | 30 | #2D2D32 | — | — |  |
| `source-host-action-label` | 1158 | 235 | 44 | 24 | — | 12 **b** | #24C875 | On |
| `source-guest-card` | 990 | 288 | 224 | 66 | #1C1C1F + 1px #34343A | — | — |  |
| `source-guest-avatar` | 1002 | 301 | 34 | 34 | #7C5CFC | — | — |  |
| `source-guest-initial` | 1002 | 308 | 34 | 20 | — | 10 **b** | #FFFFFF | MK |
| `source-guest-title` | 1046 | 300 | 119 | 20 | — | 12 **b** | #F6F6F7 | Maya Kim |
| `source-guest-subtitle` | 1046 | 324 | 119 | 18 | — | 10 | #A3A3AD | Guest • Waiting |
| `source-guest-action-shape` | 1158 | 308 | 44 | 30 | #2D2D32 | — | — |  |
| `source-guest-action-label` | 1158 | 311 | 44 | 24 | — | 12 **b** | #F6F6F7 | Off |
| `sources-media` | 990 | 377 | 150 | 20 | — | 10 **b** | #73737D | MEDIA SOURCES |
| `source-screen-card` | 990 | 405 | 224 | 62 | #1C1C1F + 1px #34343A | — | — |  |
| `source-screen-avatar` | 1002 | 418 | 34 | 34 | #43C7E8 | — | — |  |
| `source-screen-initial` | 1002 | 425 | 34 | 20 | — | 10 **b** | #FFFFFF | Pd |
| `source-screen-title` | 1046 | 417 | 119 | 20 | — | 12 **b** | #F6F6F7 | Product demo |
| `source-screen-subtitle` | 1046 | 441 | 119 | 18 | — | 10 | #A3A3AD | Screen share |
| `source-screen-action-shape` | 1158 | 425 | 44 | 30 | #2D2D32 | — | — |  |
| `source-screen-action-label` | 1158 | 428 | 44 | 24 | — | 12 **b** | #F6F6F7 | Off |
| `source-slides-card` | 990 | 477 | 224 | 62 | #1C1C1F + 1px #34343A | — | — |  |
| `source-slides-avatar` | 1002 | 490 | 34 | 34 | #7C5CFC | — | — |  |
| `source-slides-initial` | 1002 | 497 | 34 | 20 | — | 10 **b** | #FFFFFF | QR |
| `source-slides-title` | 1046 | 489 | 119 | 20 | — | 12 **b** | #F6F6F7 | Q3 Roadmap |
| `source-slides-subtitle` | 1046 | 513 | 119 | 18 | — | 10 | #A3A3AD | Presentation • 12 slides |
| `source-slides-action-shape` | 1158 | 497 | 44 | 30 | #2D2D32 | — | — |  |
| `source-slides-action-label` | 1158 | 500 | 44 | 24 | — | 12 **b** | #F6F6F7 | Off |
| `add-source-shape` | 990 | 558 | 224 | 36 | #2D2D32 + 1px #484850 | — | — |  |
| `add-source-label` | 990 | 560 | 224 | 32 | — | 13 **b** | #F6F6F7 | +  Add source |
| `guest-control-label` | 990 | 617 | 176 | 34 | — | 12 | #F6F6F7 | Guest can control slides |
| `guest-control-track` | 1170 | 623 | 40 | 22 | #2D2D32 | — | — |  |
| `guest-control-knob` | 1174 | 626 | 16 | 16 | #FFFFFF | — | — |  |

### 2.3 Window 03 — "Add Scene" chooser modal

Modal over the Studio shell; three scene-type choices (Camera / Media / Countdown).

**Chrome:** base *B*, complete.

**Screen-specific elements** (27):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `scene-chooser-dim-top` | 0 | 0 | 1280 | 118 | #09090A | — | — |  |
| `scene-chooser-dim-left` | 0 | 118 | 365 | 472 | #09090A | — | — |  |
| `scene-chooser-dim-right` | 915 | 118 | 365 | 472 | #09090A | — | — |  |
| `scene-chooser-dim-bottom` | 0 | 590 | 1280 | 130 | #09090A | — | — |  |
| `scene-chooser-shell` | 365 | 118 | 550 | 472 | #141416 + 1px #484850 | — | — |  |
| `scene-chooser-title` | 393 | 142 | 460 | 34 | — | 24 **b** | #F6F6F7 | Add Scene |
| `scene-chooser-subtitle` | 393 | 180 | 494 | 32 | — | 12 | #A3A3AD | Choose a starting point. You can customize it later. |
| `scene-chooser-close-shape` | 861 | 138 | 34 | 34 | #2D2D32 | — | — |  |
| `scene-chooser-close-icon` | 861 | 139 | 34 | 32 | — | 15 **b** | #F6F6F7 | × |
| `scene-choice-1` | 400 | 226 | 480 | 82 | #1C1C1F + 1px #484850 | — | — |  |
| `scene-choice-1-icon-bg` | 420 | 241 | 52 | 52 | #2864F0 | — | — |  |
| `scene-choice-1-icon` | 420 | 252 | 52 | 28 | — | 17 **b** | #FFFFFF | C |
| `scene-choice-1-title` | 492 | 242 | 250 | 24 | — | 15 **b** | #F6F6F7 | Camera |
| `scene-choice-1-copy` | 492 | 270 | 330 | 22 | — | 11 | #A3A3AD | Start with people on screen |
| `scene-choice-1-arrow` | 836 | 252 | 24 | 28 | — | 20 | #A3A3AD | › |
| `scene-choice-2` | 400 | 326 | 480 | 82 | #1C1C1F + 1px #484850 | — | — |  |
| `scene-choice-2-icon-bg` | 420 | 341 | 52 | 52 | #7C5CFC | — | — |  |
| `scene-choice-2-icon` | 420 | 352 | 52 | 28 | — | 17 **b** | #FFFFFF | M |
| `scene-choice-2-title` | 492 | 342 | 250 | 24 | — | 15 **b** | #F6F6F7 | Media |
| `scene-choice-2-copy` | 492 | 370 | 330 | 22 | — | 11 | #A3A3AD | Video, screen, slides, image or RTMP |
| `scene-choice-2-arrow` | 836 | 352 | 24 | 28 | — | 20 | #A3A3AD | › |
| `scene-choice-3` | 400 | 426 | 480 | 82 | #1C1C1F + 1px #484850 | — | — |  |
| `scene-choice-3-icon-bg` | 420 | 441 | 52 | 52 | #EF4B55 | — | — |  |
| `scene-choice-3-icon` | 420 | 452 | 52 | 28 | — | 17 **b** | #FFFFFF | 5 |
| `scene-choice-3-title` | 492 | 442 | 250 | 24 | — | 15 **b** | #F6F6F7 | Countdown |
| `scene-choice-3-copy` | 492 | 470 | 330 | 22 | — | 11 | #A3A3AD | Build an intro or transition timer |
| `scene-choice-3-arrow` | 836 | 452 | 24 | 28 | — | 20 | #A3A3AD | › |

### 2.4 Window 04 — "Add Media Scene" source chooser modal

Wider modal, 2-column grid of 8 media source types.

**Chrome:** base *B*, complete.

**Screen-specific elements** (49):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `media-chooser-dim-top` | 0 | 0 | 1280 | 68 | #09090A | — | — |  |
| `media-chooser-dim-left` | 0 | 68 | 300 | 584 | #09090A | — | — |  |
| `media-chooser-dim-right` | 980 | 68 | 300 | 584 | #09090A | — | — |  |
| `media-chooser-dim-bottom` | 0 | 652 | 1280 | 68 | #09090A | — | — |  |
| `media-chooser-shell` | 300 | 68 | 680 | 584 | #141416 + 1px #484850 | — | — |  |
| `media-chooser-title` | 328 | 92 | 590 | 34 | — | 24 **b** | #F6F6F7 | Add Media Scene |
| `media-chooser-subtitle` | 328 | 130 | 624 | 32 | — | 12 | #A3A3AD | Select the source you want to add to this scene. |
| `media-chooser-close-shape` | 926 | 88 | 34 | 34 | #2D2D32 | — | — |  |
| `media-chooser-close-icon` | 926 | 89 | 34 | 32 | — | 15 **b** | #F6F6F7 | × |
| `media-choice-1` | 338 | 176 | 290 | 88 | #1C1C1F + 1px #484850 | — | — |  |
| `media-choice-1-icon` | 356 | 194 | 52 | 52 | #43C7E8 | — | — |  |
| `media-choice-1-letter` | 356 | 207 | 52 | 26 | — | 16 **b** | #FFFFFF | V |
| `media-choice-1-title` | 422 | 193 | 174 | 24 | — | 14 **b** | #F6F6F7 | Video |
| `media-choice-1-subtitle` | 422 | 223 | 180 | 24 | — | 10 | #A3A3AD | Cloud storage |
| `media-choice-2` | 648 | 176 | 290 | 88 | #1C1C1F + 1px #484850 | — | — |  |
| `media-choice-2-icon` | 666 | 194 | 52 | 52 | #2864F0 | — | — |  |
| `media-choice-2-letter` | 666 | 207 | 52 | 26 | — | 16 **b** | #FFFFFF | S |
| `media-choice-2-title` | 732 | 193 | 174 | 24 | — | 14 **b** | #F6F6F7 | Screen |
| `media-choice-2-subtitle` | 732 | 223 | 180 | 24 | — | 10 | #A3A3AD | Tab, window or display |
| `media-choice-3` | 338 | 281 | 290 | 88 | #1C1C1F + 1px #484850 | — | — |  |
| `media-choice-3-icon` | 356 | 299 | 52 | 52 | #7C5CFC | — | — |  |
| `media-choice-3-letter` | 356 | 312 | 52 | 26 | — | 16 **b** | #FFFFFF | P |
| `media-choice-3-title` | 422 | 298 | 174 | 24 | — | 14 **b** | #F6F6F7 | Presentation |
| `media-choice-3-subtitle` | 422 | 328 | 180 | 24 | — | 10 | #A3A3AD | PDF, PPTX, Keynote |
| `media-choice-4` | 648 | 281 | 290 | 88 | #1C1C1F + 1px #484850 | — | — |  |
| `media-choice-4-icon` | 666 | 299 | 52 | 52 | #24C875 | — | — |  |
| `media-choice-4-letter` | 666 | 312 | 52 | 26 | — | 16 **b** | #FFFFFF | I |
| `media-choice-4-title` | 732 | 298 | 174 | 24 | — | 14 **b** | #F6F6F7 | Image |
| `media-choice-4-subtitle` | 732 | 328 | 180 | 24 | — | 10 | #A3A3AD | PNG, JPG, SVG and more |
| `media-choice-5` | 338 | 386 | 290 | 88 | #1C1C1F + 1px #484850 | — | — |  |
| `media-choice-5-icon` | 356 | 404 | 52 | 52 | #EF4B55 | — | — |  |
| `media-choice-5-letter` | 356 | 417 | 52 | 26 | — | 16 **b** | #FFFFFF | L |
| `media-choice-5-title` | 422 | 403 | 174 | 24 | — | 14 **b** | #F6F6F7 | Local video |
| `media-choice-5-subtitle` | 422 | 433 | 180 | 24 | — | 10 | #A3A3AD | Play from this computer |
| `media-choice-6` | 648 | 386 | 290 | 88 | #1C1C1F + 1px #484850 | — | — |  |
| `media-choice-6-icon` | 666 | 404 | 52 | 52 | #F4C84A | — | — |  |
| `media-choice-6-letter` | 666 | 417 | 52 | 26 | — | 16 **b** | #FFFFFF | B |
| `media-choice-6-title` | 732 | 403 | 174 | 24 | — | 14 **b** | #F6F6F7 | Browser source |
| `media-choice-6-subtitle` | 732 | 433 | 180 | 24 | — | 10 | #A3A3AD | Embed a web source |
| `media-choice-7` | 338 | 491 | 290 | 88 | #1C1C1F + 1px #484850 | — | — |  |
| `media-choice-7-icon` | 356 | 509 | 52 | 52 | #EA7C36 | — | — |  |
| `media-choice-7-letter` | 356 | 522 | 52 | 26 | — | 16 **b** | #FFFFFF | R |
| `media-choice-7-title` | 422 | 508 | 174 | 24 | — | 14 **b** | #F6F6F7 | RTMP source |
| `media-choice-7-subtitle` | 422 | 538 | 180 | 24 | — | 10 | #A3A3AD | External encoder feed |
| `media-choice-8` | 648 | 491 | 290 | 88 | #1C1C1F + 1px #484850 | — | — |  |
| `media-choice-8-icon` | 666 | 509 | 52 | 52 | #5E8DFF | — | — |  |
| `media-choice-8-letter` | 666 | 522 | 52 | 26 | — | 16 **b** | #FFFFFF | E |
| `media-choice-8-title` | 732 | 508 | 174 | 24 | — | 14 **b** | #F6F6F7 | Extra camera |
| `media-choice-8-subtitle` | 732 | 538 | 180 | 24 | — | 10 | #A3A3AD | Add another camera |

### 2.5 Window 05 — Sources panel — guest live

Identical geometry to slide-02; only source states change (guest On, screen On, guest-control toggle on).

**Chrome:** base *B*, complete.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `source-guest-subtitle` | 1046 | 324 | 119 | 18 | — | 10 | #A3A3AD | Guest • Scenes 1, 5 |
| `source-guest-action-label` | 1158 | 311 | 44 | 24 | — | 12 **b** | #24C875 | On |
| `source-screen-action-label` | 1158 | 428 | 44 | 24 | — | 12 **b** | #24C875 | On |
| `guest-control-track` | 1170 | 623 | 40 | 22 | #2864F0 | — | — |  |
| `guest-control-knob` | 1190 | 626 | 16 | 16 | #FFFFFF | — | — |  |

<sub>Previous values in *B*: `source-guest-subtitle`="Guest • Waiting"; `source-guest-action-label`="Off"; `source-screen-action-label`="Off"; `guest-control-track`=#2D2D32; `guest-control-knob`=#FFFFFF</sub>

No screen-specific elements — geometry is identical to *B*.

### 2.6 Window 06 — Right panel — Chat tab

**Chrome:** base *B*, **minus** 37 elements: `copy-invite-shape`, `copy-invite-label`, `sources-backstage`, `source-host-card`, `source-host-avatar`, `source-host-initial`, `source-host-title`, `source-host-subtitle`, `source-host-action-shape`, `source-host-action-label`, `source-guest-card`, `source-guest-avatar`, `source-guest-initial`, `source-guest-title`, `source-guest-subtitle`, `source-guest-action-shape`, `source-guest-action-label`, `sources-media`, `source-screen-card`, `source-screen-avatar`, `source-screen-initial`, `source-screen-title`, `source-screen-subtitle`, `source-screen-action-shape`, `source-screen-action-label`, `source-slides-card`, `source-slides-avatar`, `source-slides-initial`, `source-slides-title`, `source-slides-subtitle`, `source-slides-action-shape`, `source-slides-action-label`, `add-source-shape`, `add-source-label`, `guest-control-label`, `guest-control-track`, `guest-control-knob`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | Chat |
| `tool-sources-button` | 1243 | 84 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-chat-button` | 1243 | 142 | 30 | 30 | #2864F0 + 1px #447CFF | — | — |  |

<sub>Previous values in *B*: `right-panel-title`="Sources"; `tool-sources-button`=#2864F0; `tool-chat-button`=#242428</sub>

**Screen-specific elements** (31):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `show-chat-label` | 990 | 134 | 176 | 34 | — | 12 | #F6F6F7 | Show on stream |
| `show-chat-track` | 1170 | 140 | 40 | 22 | #2864F0 | — | — |  |
| `show-chat-knob` | 1190 | 143 | 16 | 16 | #FFFFFF | — | — |  |
| `chat-all-shape` | 990 | 182 | 58 | 30 | #2864F0 | — | — |  |
| `chat-all-label` | 990 | 185 | 58 | 24 | — | 12 **b** | #F6F6F7 | All |
| `chat-pinned-shape` | 1056 | 182 | 94 | 30 | #2D2D32 | — | — |  |
| `chat-pinned-label` | 1056 | 185 | 94 | 24 | — | 12 **b** | #F6F6F7 | Pinned  2 |
| `chat-settings-shape` | 1178 | 178 | 36 | 36 | #2D2D32 | — | — |  |
| `chat-settings-icon` | 1178 | 179 | 36 | 34 | — | 15 **b** | #F6F6F7 | ⚙ |
| `chat-1-card` | 990 | 234 | 224 | 90 | #1C1C1F + 1px #34343A | — | — |  |
| `chat-1-platform` | 1002 | 247 | 24 | 24 | #EF4B55 | — | — |  |
| `chat-1-platform-letter` | 1002 | 251 | 24 | 16 | — | 9 **b** | #FFFFFF | Y |
| `chat-1-name` | 1035 | 246 | 120 | 18 | — | 11 **b** | #F6F6F7 | Nora |
| `chat-1-message` | 1035 | 271 | 164 | 36 | — | 11 | #A3A3AD | Love the new layout! |
| `chat-1-star` | 1184 | 244 | 20 | 20 | — | 14 | #F4C84A | ☆ |
| `chat-2-card` | 990 | 336 | 224 | 90 | #1C1C1F + 1px #34343A | — | — |  |
| `chat-2-platform` | 1002 | 349 | 24 | 24 | #2864F0 | — | — |  |
| `chat-2-platform-letter` | 1002 | 353 | 24 | 16 | — | 9 **b** | #FFFFFF | L |
| `chat-2-name` | 1035 | 348 | 120 | 18 | — | 11 **b** | #F6F6F7 | Sam |
| `chat-2-message` | 1035 | 373 | 164 | 36 | — | 11 | #A3A3AD | Can you share the roadmap? |
| `chat-2-star` | 1184 | 346 | 20 | 20 | — | 14 | #F4C84A | ☆ |
| `chat-3-card` | 990 | 438 | 224 | 90 | #1C1C1F + 1px #34343A | — | — |  |
| `chat-3-platform` | 1002 | 451 | 24 | 24 | #7C5CFC | — | — |  |
| `chat-3-platform-letter` | 1002 | 455 | 24 | 16 | — | 9 **b** | #FFFFFF | F |
| `chat-3-name` | 1035 | 450 | 120 | 18 | — | 11 **b** | #F6F6F7 | Tina |
| `chat-3-message` | 1035 | 475 | 164 | 36 | — | 11 | #A3A3AD | Watching from Kampala 👋 |
| `chat-3-star` | 1184 | 448 | 20 | 20 | — | 14 | #F4C84A | ☆ |
| `chat-reply-field` | 990 | 560 | 224 | 42 | #1C1C1F + 1px #484850 | — | — |  |
| `chat-reply-value` | 1002 | 564 | 200 | 34 | — | 13 | #F6F6F7 | Reply to all channels… |
| `chat-send-shape` | 1136 | 615 | 78 | 34 | #2864F0 | — | — |  |
| `chat-send-label` | 1136 | 617 | 78 | 30 | — | 13 **b** | #F6F6F7 | Send |

### 2.7 Window 07 — Right panel — Graphics tab

Brand folder selector, logo grid, overlay grid.

**Chrome:** base *B*, **minus** 37 elements: `copy-invite-shape`, `copy-invite-label`, `sources-backstage`, `source-host-card`, `source-host-avatar`, `source-host-initial`, `source-host-title`, `source-host-subtitle`, `source-host-action-shape`, `source-host-action-label`, `source-guest-card`, `source-guest-avatar`, `source-guest-initial`, `source-guest-title`, `source-guest-subtitle`, `source-guest-action-shape`, `source-guest-action-label`, `sources-media`, `source-screen-card`, `source-screen-avatar`, `source-screen-initial`, `source-screen-title`, `source-screen-subtitle`, `source-screen-action-shape`, `source-screen-action-label`, `source-slides-card`, `source-slides-avatar`, `source-slides-initial`, `source-slides-title`, `source-slides-subtitle`, `source-slides-action-shape`, `source-slides-action-label`, `add-source-shape`, `add-source-label`, `guest-control-label`, `guest-control-track`, `guest-control-knob`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | Graphics |
| `tool-sources-button` | 1243 | 84 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-graphics-button` | 1243 | 200 | 30 | 30 | #2864F0 + 1px #447CFF | — | — |  |

<sub>Previous values in *B*: `right-panel-title`="Sources"; `tool-sources-button`=#2864F0; `tool-graphics-button`=#242428</sub>

**Screen-specific elements** (26):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `brand-folder-shape` | 990 | 134 | 186 | 30 | #2D2D32 | — | — |  |
| `brand-folder-label` | 990 | 137 | 186 | 24 | — | 12 **b** | #F6F6F7 | Default brand  ▾ |
| `new-brand-folder-shape` | 1184 | 130 | 36 | 36 | #2D2D32 | — | — |  |
| `new-brand-folder-icon` | 1184 | 131 | 36 | 34 | — | 15 **b** | #F6F6F7 | + |
| `graphics-logo-heading` | 990 | 186 | 100 | 20 | — | 10 **b** | #73737D | LOGOS |
| `add-logo-shape` | 1174 | 180 | 40 | 30 | #2D2D32 | — | — |  |
| `add-logo-label` | 1174 | 182 | 40 | 26 | — | 13 **b** | #F6F6F7 | + |
| `logo-thumb-1` | 990 | 216 | 102 | 66 | #FFFFFF + 1px #484850 | — | — |  |
| `logo-thumb-1-label` | 990 | 288 | 102 | 18 | — | 10 | #A3A3AD | Light |
| `logo-thumb-2` | 1102 | 216 | 102 | 66 | #171719 + 1px #484850 | — | — |  |
| `logo-thumb-2-label` | 1102 | 288 | 102 | 18 | — | 10 | #A3A3AD | Dark |
| `logo-thumb-3` | 990 | 312 | 102 | 66 | #2A63F5 + 1px #484850 | — | — |  |
| `logo-thumb-3-label` | 990 | 384 | 102 | 18 | — | 10 | #A3A3AD | Blue |
| `logo-thumb-4` | 1102 | 312 | 102 | 66 | #7C5CFC + 1px #484850 | — | — |  |
| `logo-thumb-4-label` | 1102 | 384 | 102 | 18 | — | 10 | #A3A3AD | Purple |
| `graphics-overlay-heading` | 990 | 414 | 110 | 20 | — | 10 **b** | #73737D | OVERLAYS |
| `overlay-thumb-1` | 990 | 442 | 102 | 66 | #102B45 + 1px #484850 | — | — |  |
| `overlay-thumb-1-label` | 990 | 514 | 102 | 18 | — | 10 | #A3A3AD | Frame |
| `overlay-thumb-2` | 1102 | 442 | 102 | 66 | #34264B + 1px #484850 | — | — |  |
| `overlay-thumb-2-label` | 1102 | 514 | 102 | 18 | — | 10 | #A3A3AD | News |
| `overlay-thumb-3` | 990 | 538 | 102 | 66 | #173E35 + 1px #484850 | — | — |  |
| `overlay-thumb-3-label` | 990 | 610 | 102 | 18 | — | 10 | #A3A3AD | Minimal |
| `overlay-thumb-4` | 1102 | 538 | 102 | 66 | #4B2328 + 1px #484850 | — | — |  |
| `overlay-thumb-4-label` | 1102 | 610 | 102 | 18 | — | 10 | #A3A3AD | Launch |
| `graphics-more-shape` | 990 | 634 | 224 | 34 | #2D2D32 | — | — |  |
| `graphics-more-label` | 990 | 636 | 224 | 30 | — | 13 **b** | #F6F6F7 | View backgrounds |

### 2.8 Window 08 — Right panel — Theme tab

Display-theme thumbnails, primary colour swatches, hex + font fields.

**Chrome:** base *B*, **minus** 37 elements: `copy-invite-shape`, `copy-invite-label`, `sources-backstage`, `source-host-card`, `source-host-avatar`, `source-host-initial`, `source-host-title`, `source-host-subtitle`, `source-host-action-shape`, `source-host-action-label`, `source-guest-card`, `source-guest-avatar`, `source-guest-initial`, `source-guest-title`, `source-guest-subtitle`, `source-guest-action-shape`, `source-guest-action-label`, `sources-media`, `source-screen-card`, `source-screen-avatar`, `source-screen-initial`, `source-screen-title`, `source-screen-subtitle`, `source-screen-action-shape`, `source-screen-action-label`, `source-slides-card`, `source-slides-avatar`, `source-slides-initial`, `source-slides-title`, `source-slides-subtitle`, `source-slides-action-shape`, `source-slides-action-label`, `add-source-shape`, `add-source-label`, `guest-control-label`, `guest-control-track`, `guest-control-knob`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | Theme |
| `tool-sources-button` | 1243 | 84 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-theme-button` | 1243 | 258 | 30 | 30 | #2864F0 + 1px #447CFF | — | — |  |

<sub>Previous values in *B*: `right-panel-title`="Sources"; `tool-sources-button`=#2864F0; `tool-theme-button`=#242428</sub>

**Screen-specific elements** (25):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `theme-style-heading` | 990 | 134 | 160 | 20 | — | 10 **b** | #73737D | DISPLAY THEME |
| `theme-thumb-1` | 990 | 166 | 102 | 66 | #202024 + 1px #484850 | — | — |  |
| `theme-thumb-1-label` | 990 | 238 | 102 | 18 | — | 10 | #A3A3AD | Default |
| `theme-thumb-2` | 1102 | 166 | 102 | 66 | #F0F0F2 + 1px #484850 | — | — |  |
| `theme-thumb-2-label` | 1102 | 238 | 102 | 18 | — | 10 | #A3A3AD | Air |
| `theme-thumb-3` | 990 | 262 | 102 | 66 | #223447 + 1px #484850 | — | — |  |
| `theme-thumb-3-label` | 990 | 334 | 102 | 18 | — | 10 | #A3A3AD | News |
| `theme-thumb-4` | 1102 | 262 | 102 | 66 | #2C2544 + 1px #484850 | — | — |  |
| `theme-thumb-4-label` | 1102 | 334 | 102 | 18 | — | 10 | #A3A3AD | Rounded |
| `theme-color-heading` | 990 | 366 | 160 | 20 | — | 10 **b** | #73737D | PRIMARY COLOR |
| `theme-color-1` | 994 | 398 | 28 | 28 | #2864F0 + 2px #FFFFFF | — | — |  |
| `theme-color-2` | 1031 | 398 | 28 | 28 | #7C5CFC | — | — |  |
| `theme-color-3` | 1068 | 398 | 28 | 28 | #EF4B55 | — | — |  |
| `theme-color-4` | 1105 | 398 | 28 | 28 | #24C875 | — | — |  |
| `theme-color-5` | 1142 | 398 | 28 | 28 | #F4C84A | — | — |  |
| `theme-color-6` | 1179 | 398 | 28 | 28 | #43C7E8 | — | — |  |
| `theme-hex-label` | 990 | 452 | 224 | 20 | — | 11 **b** | #A3A3AD | Custom color |
| `theme-hex-field` | 990 | 475 | 224 | 40 | #1C1C1F + 1px #484850 | — | — |  |
| `theme-hex-value` | 1002 | 479 | 200 | 32 | — | 13 | #F6F6F7 | #2864F0 |
| `theme-font-label` | 990 | 536 | 224 | 20 | — | 11 **b** | #A3A3AD | Font |
| `theme-font-field` | 990 | 559 | 224 | 40 | #1C1C1F + 1px #484850 | — | — |  |
| `theme-font-value` | 1002 | 563 | 200 | 32 | — | 13 | #F6F6F7 | Inter  ▾ |
| `theme-animations-label` | 990 | 618 | 176 | 34 | — | 12 | #F6F6F7 | Animate overlays |
| `theme-animations-track` | 1170 | 624 | 40 | 22 | #2864F0 | — | — |  |
| `theme-animations-knob` | 1190 | 627 | 16 | 16 | #FFFFFF | — | — |  |

### 2.9 Window 09 — Right panel — Captions tab

Lower-third list + ticker section.

**Chrome:** base *B*, **minus** 37 elements: `copy-invite-shape`, `copy-invite-label`, `sources-backstage`, `source-host-card`, `source-host-avatar`, `source-host-initial`, `source-host-title`, `source-host-subtitle`, `source-host-action-shape`, `source-host-action-label`, `source-guest-card`, `source-guest-avatar`, `source-guest-initial`, `source-guest-title`, `source-guest-subtitle`, `source-guest-action-shape`, `source-guest-action-label`, `sources-media`, `source-screen-card`, `source-screen-avatar`, `source-screen-initial`, `source-screen-title`, `source-screen-subtitle`, `source-screen-action-shape`, `source-screen-action-label`, `source-slides-card`, `source-slides-avatar`, `source-slides-initial`, `source-slides-title`, `source-slides-subtitle`, `source-slides-action-shape`, `source-slides-action-label`, `add-source-shape`, `add-source-label`, `guest-control-label`, `guest-control-track`, `guest-control-knob`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | Captions |
| `tool-sources-button` | 1243 | 84 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-captions-button` | 1243 | 316 | 30 | 30 | #2864F0 + 1px #447CFF | — | — |  |

<sub>Previous values in *B*: `right-panel-title`="Sources"; `tool-sources-button`=#2864F0; `tool-captions-button`=#242428</sub>

**Screen-specific elements** (21):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `captions-lower-heading` | 990 | 134 | 150 | 20 | — | 10 **b** | #73737D | LOWER THIRD |
| `caption-add-shape` | 1152 | 128 | 62 | 32 | #2D2D32 | — | — |  |
| `caption-add-label` | 1152 | 130 | 62 | 28 | — | 13 **b** | #F6F6F7 | + Add |
| `caption-1-card` | 990 | 178 | 224 | 91 | #1C1C1F + 1px #34343A | — | — |  |
| `caption-1-copy` | 1004 | 191 | 188 | 40 | — | 12 **b** | #F6F6F7 | Welcome to the weekly update |
| `caption-1-action-shape` | 1128 | 233 | 70 | 26 | #2D2D32 | — | — |  |
| `caption-1-action-label` | 1128 | 235 | 70 | 22 | — | 13 **b** | #F6F6F7 | Show |
| `caption-2-card` | 990 | 282 | 224 | 91 | #1C1C1F + 1px #34343A | — | — |  |
| `caption-2-copy` | 1004 | 295 | 188 | 40 | — | 12 **b** | #F6F6F7 | Ask your questions in chat |
| `caption-2-action-shape` | 1128 | 337 | 70 | 26 | #2864F0 | — | — |  |
| `caption-2-action-label` | 1128 | 339 | 70 | 22 | — | 13 **b** | #F6F6F7 | Hide |
| `caption-3-card` | 990 | 386 | 224 | 91 | #1C1C1F + 1px #34343A | — | — |  |
| `caption-3-copy` | 1004 | 399 | 188 | 40 | — | 12 **b** | #F6F6F7 | Visit example.com to learn more |
| `caption-3-action-shape` | 1128 | 441 | 70 | 26 | #2D2D32 | — | — |  |
| `caption-3-action-label` | 1128 | 443 | 70 | 22 | — | 13 **b** | #F6F6F7 | Show |
| `captions-rule` | 990 | 509 | 224 | 1 | #34343A | — | — |  |
| `ticker-heading` | 990 | 531 | 120 | 20 | — | 10 **b** | #73737D | TICKER |
| `ticker-add-shape` | 1152 | 524 | 62 | 32 | #2D2D32 | — | — |  |
| `ticker-add-label` | 1152 | 526 | 62 | 28 | — | 13 **b** | #F6F6F7 | + Add |
| `ticker-card` | 990 | 570 | 224 | 70 | #1C1C1F + 1px #34343A | — | — |  |
| `ticker-copy` | 1004 | 585 | 188 | 36 | — | 11 | #F6F6F7 | New episodes every Friday • Subscribe now |

### 2.10 Window 10 — Right panel — QR Codes tab

**Chrome:** base *B*, **minus** 37 elements: `copy-invite-shape`, `copy-invite-label`, `sources-backstage`, `source-host-card`, `source-host-avatar`, `source-host-initial`, `source-host-title`, `source-host-subtitle`, `source-host-action-shape`, `source-host-action-label`, `source-guest-card`, `source-guest-avatar`, `source-guest-initial`, `source-guest-title`, `source-guest-subtitle`, `source-guest-action-shape`, `source-guest-action-label`, `sources-media`, `source-screen-card`, `source-screen-avatar`, `source-screen-initial`, `source-screen-title`, `source-screen-subtitle`, `source-screen-action-shape`, `source-screen-action-label`, `source-slides-card`, `source-slides-avatar`, `source-slides-initial`, `source-slides-title`, `source-slides-subtitle`, `source-slides-action-shape`, `source-slides-action-label`, `add-source-shape`, `add-source-label`, `guest-control-label`, `guest-control-track`, `guest-control-knob`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | QR Codes |
| `tool-sources-button` | 1243 | 84 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-qr-button` | 1243 | 374 | 30 | 30 | #2864F0 + 1px #447CFF | — | — |  |

<sub>Previous values in *B*: `right-panel-title`="Sources"; `tool-sources-button`=#2864F0; `tool-qr-button`=#242428</sub>

**Screen-specific elements** (40):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `qr-add-shape` | 1148 | 128 | 66 | 32 | #2864F0 | — | — |  |
| `qr-add-label` | 1148 | 130 | 66 | 28 | — | 13 **b** | #F6F6F7 | + Add |
| `qr-help` | 990 | 134 | 148 | 34 | — | 10 | #A3A3AD | Create up to 6 codes per brand folder. |
| `qr-1-card` | 990 | 190 | 224 | 162 | #1C1C1F + 1px #34343A | — | — |  |
| `qr-1-code-bg` | 1004 | 204 | 76 | 76 | #FFFFFF | — | — |  |
| `qr-1-pixel-0` | 1012 | 212 | 12 | 12 | #B6B6BA | — | — |  |
| `qr-1-pixel-1` | 1032 | 212 | 12 | 12 | #000000 | — | — |  |
| `qr-1-pixel-2` | 1052 | 212 | 12 | 12 | #B6B6BA | — | — |  |
| `qr-1-pixel-3` | 1012 | 232 | 12 | 12 | #000000 | — | — |  |
| `qr-1-pixel-4` | 1032 | 232 | 12 | 12 | #B6B6BA | — | — |  |
| `qr-1-pixel-5` | 1052 | 232 | 12 | 12 | #000000 | — | — |  |
| `qr-1-pixel-6` | 1012 | 252 | 12 | 12 | #B6B6BA | — | — |  |
| `qr-1-pixel-7` | 1032 | 252 | 12 | 12 | #000000 | — | — |  |
| `qr-1-pixel-8` | 1052 | 252 | 12 | 12 | #B6B6BA | — | — |  |
| `qr-1-title` | 1092 | 208 | 108 | 22 | — | 12 **b** | #F6F6F7 | Join newsletter |
| `qr-1-url` | 1092 | 238 | 108 | 34 | — | 10 | #A3A3AD | example.com/news |
| `qr-1-show-shape` | 1004 | 298 | 88 | 32 | #2864F0 | — | — |  |
| `qr-1-show-label` | 1004 | 300 | 88 | 28 | — | 13 **b** | #F6F6F7 | Hide |
| `qr-1-mode-shape` | 1102 | 299 | 98 | 30 | #2D2D32 | — | — |  |
| `qr-1-mode-label` | 1102 | 302 | 98 | 24 | — | 12 **b** | #F6F6F7 | Classic |
| `qr-2-card` | 990 | 368 | 224 | 162 | #1C1C1F + 1px #34343A | — | — |  |
| `qr-2-code-bg` | 1004 | 382 | 76 | 76 | #FFFFFF | — | — |  |
| `qr-2-pixel-0` | 1012 | 390 | 12 | 12 | #000000 | — | — |  |
| `qr-2-pixel-1` | 1032 | 390 | 12 | 12 | #B6B6BA | — | — |  |
| `qr-2-pixel-2` | 1052 | 390 | 12 | 12 | #000000 | — | — |  |
| `qr-2-pixel-3` | 1012 | 410 | 12 | 12 | #B6B6BA | — | — |  |
| `qr-2-pixel-4` | 1032 | 410 | 12 | 12 | #000000 | — | — |  |
| `qr-2-pixel-5` | 1052 | 410 | 12 | 12 | #B6B6BA | — | — |  |
| `qr-2-pixel-6` | 1012 | 430 | 12 | 12 | #000000 | — | — |  |
| `qr-2-pixel-7` | 1032 | 430 | 12 | 12 | #B6B6BA | — | — |  |
| `qr-2-pixel-8` | 1052 | 430 | 12 | 12 | #000000 | — | — |  |
| `qr-2-title` | 1092 | 386 | 108 | 22 | — | 12 **b** | #F6F6F7 | Download guide |
| `qr-2-url` | 1092 | 416 | 108 | 34 | — | 10 | #A3A3AD | example.com/guide |
| `qr-2-show-shape` | 1004 | 476 | 88 | 32 | #2D2D32 | — | — |  |
| `qr-2-show-label` | 1004 | 478 | 88 | 28 | — | 13 **b** | #F6F6F7 | Show |
| `qr-2-mode-shape` | 1102 | 477 | 98 | 30 | #2D2D32 | — | — |  |
| `qr-2-mode-label` | 1102 | 480 | 98 | 24 | — | 12 **b** | #F6F6F7 | Compact |
| `qr-alert-label` | 990 | 582 | 176 | 34 | — | 12 | #F6F6F7 | Show scan alerts |
| `qr-alert-track` | 1170 | 588 | 40 | 22 | #2864F0 | — | — |  |
| `qr-alert-knob` | 1190 | 591 | 16 | 16 | #FFFFFF | — | — |  |

### 2.11 Window 11 — Right panel — Notes tab

Per-scene private notes editor.

**Chrome:** base *B*, **minus** 37 elements: `copy-invite-shape`, `copy-invite-label`, `sources-backstage`, `source-host-card`, `source-host-avatar`, `source-host-initial`, `source-host-title`, `source-host-subtitle`, `source-host-action-shape`, `source-host-action-label`, `source-guest-card`, `source-guest-avatar`, `source-guest-initial`, `source-guest-title`, `source-guest-subtitle`, `source-guest-action-shape`, `source-guest-action-label`, `sources-media`, `source-screen-card`, `source-screen-avatar`, `source-screen-initial`, `source-screen-title`, `source-screen-subtitle`, `source-screen-action-shape`, `source-screen-action-label`, `source-slides-card`, `source-slides-avatar`, `source-slides-initial`, `source-slides-title`, `source-slides-subtitle`, `source-slides-action-shape`, `source-slides-action-label`, `add-source-shape`, `add-source-label`, `guest-control-label`, `guest-control-track`, `guest-control-knob`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | Notes |
| `tool-sources-button` | 1243 | 84 | 30 | 30 | #242428 + 1px #34343A | — | — |  |
| `tool-notes-button` | 1243 | 432 | 30 | 30 | #2864F0 + 1px #447CFF | — | — |  |

<sub>Previous values in *B*: `right-panel-title`="Sources"; `tool-sources-button`=#2864F0; `tool-notes-button`=#242428</sub>

**Screen-specific elements** (11):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `notes-helper` | 990 | 134 | 224 | 32 | — | 10 | #A3A3AD | Notes are private and saved per scene. |
| `notes-editor` | 990 | 180 | 224 | 354 | #1C1C1F + 1px #484850 | — | — |  |
| `notes-editor-copy` | 1005 | 198 | 194 | 305 | — | 12 | #F6F6F7 | OPENING ⏎ • Welcome viewers ⏎ • Introduce Maya ⏎  ⏎ ROADMAP ⏎ • Show slide 3 ⏎ • Ask for chat questions ⏎  ⏎ CLOSE ⏎ • Share QR code ⏎ • Preview next episode |
| `notes-counter` | 1104 | 511 | 94 | 18 | — | 9 | #73737D | 143 / 5000 |
| `notes-copy-shape` | 990 | 557 | 108 | 34 | #2D2D32 | — | — |  |
| `notes-copy-label` | 990 | 559 | 108 | 30 | — | 13 **b** | #F6F6F7 | Copy notes |
| `notes-clear-shape` | 1106 | 557 | 108 | 34 | #2D2D32 | — | — |  |
| `notes-clear-label` | 1106 | 559 | 108 | 30 | — | 13 **b** | #F6F6F7 | Clear |
| `notes-follow-scenes-label` | 990 | 617 | 176 | 34 | — | 12 | #F6F6F7 | Auto-open with scene |
| `notes-follow-scenes-track` | 1170 | 623 | 40 | 22 | #2864F0 | — | — |  |
| `notes-follow-scenes-knob` | 1190 | 626 | 16 | 16 | #FFFFFF | — | — |  |

### 2.12 Window 12 — Settings modal — General tab

**Chrome:** base *B*, complete.

**Screen-specific elements** (35):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `settings-general-dim-top` | 0 | 0 | 1280 | 76 | #09090A | — | — |  |
| `settings-general-dim-left` | 0 | 76 | 330 | 570 | #09090A | — | — |  |
| `settings-general-dim-right` | 950 | 76 | 330 | 570 | #09090A | — | — |  |
| `settings-general-dim-bottom` | 0 | 646 | 1280 | 74 | #09090A | — | — |  |
| `settings-general-shell` | 330 | 76 | 620 | 570 | #141416 + 1px #484850 | — | — |  |
| `settings-general-title` | 358 | 100 | 530 | 34 | — | 24 **b** | #F6F6F7 | Settings |
| `settings-general-subtitle` | 358 | 138 | 564 | 32 | — | 12 | #A3A3AD | Configure this Studio stream |
| `settings-general-close-shape` | 896 | 96 | 34 | 34 | #2D2D32 | — | — |  |
| `settings-general-close-icon` | 896 | 97 | 34 | 32 | — | 15 **b** | #F6F6F7 | × |
| `settings-general-nav` | 348 | 182 | 150 | 442 | #111113 | — | — |  |
| `settings-general-tab-0-active` | 360 | 194 | 126 | 40 | #2D2D32 | — | — |  |
| `settings-general-tab-0` | 378 | 202 | 96 | 24 | — | 12 **b** | #F6F6F7 | General |
| `settings-general-tab-1` | 378 | 256 | 96 | 24 | — | 12 | #A3A3AD | Video |
| `settings-general-tab-2` | 378 | 310 | 96 | 24 | — | 12 | #A3A3AD | Audio |
| `settings-general-tab-3` | 378 | 364 | 96 | 24 | — | 12 | #A3A3AD | Profile |
| `settings-general-tab-4` | 378 | 418 | 96 | 24 | — | 12 | #A3A3AD | Shortcuts |
| `settings-general-content-heading` | 526 | 190 | 392 | 30 | — | 19 **b** | #F6F6F7 | General |
| `quality-label` | 526 | 232 | 392 | 20 | — | 11 **b** | #A3A3AD | Live stream quality |
| `quality-field` | 526 | 255 | 392 | 42 | #1C1C1F + 1px #484850 | — | — |  |
| `quality-value` | 538 | 259 | 368 | 34 | — | 13 | #F6F6F7 | Full HD • 1080p 30fps  ▾ |
| `graphics-over-video-label` | 526 | 323 | 344 | 34 | — | 12 | #F6F6F7 | Show graphics and captions over videos |
| `graphics-over-video-track` | 874 | 329 | 40 | 22 | #2864F0 | — | — |  |
| `graphics-over-video-knob` | 894 | 332 | 16 | 16 | #FFFFFF | — | — |  |
| `guest-presentations-label` | 526 | 368 | 344 | 34 | — | 12 | #F6F6F7 | Guests can control all presentations |
| `guest-presentations-track` | 874 | 374 | 40 | 22 | #2864F0 | — | — |  |
| `guest-presentations-knob` | 894 | 377 | 16 | 16 | #FFFFFF | — | — |  |
| `non-video-label` | 526 | 413 | 344 | 34 | — | 12 | #F6F6F7 | Show non-video participants |
| `non-video-track` | 874 | 419 | 40 | 22 | #2864F0 | — | — |  |
| `non-video-knob` | 894 | 422 | 16 | 16 | #FFFFFF | — | — |  |
| `qr-alerts-setting-label` | 526 | 458 | 344 | 34 | — | 12 | #F6F6F7 | Show QR code scan alerts |
| `qr-alerts-setting-track` | 874 | 464 | 40 | 22 | #2864F0 | — | — |  |
| `qr-alerts-setting-knob` | 894 | 467 | 16 | 16 | #FFFFFF | — | — |  |
| `product-links-label` | 526 | 503 | 344 | 34 | — | 12 | #F6F6F7 | Push product links to live chat |
| `product-links-track` | 874 | 509 | 40 | 22 | #2D2D32 | — | — |  |
| `product-links-knob` | 878 | 512 | 16 | 16 | #FFFFFF | — | — |  |

### 2.13 Window 13 — Settings modal — Video tab

**Chrome:** base *B*, complete.

**Screen-specific elements** (29):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `settings-video-dim-top` | 0 | 0 | 1280 | 76 | #09090A | — | — |  |
| `settings-video-dim-left` | 0 | 76 | 330 | 570 | #09090A | — | — |  |
| `settings-video-dim-right` | 950 | 76 | 330 | 570 | #09090A | — | — |  |
| `settings-video-dim-bottom` | 0 | 646 | 1280 | 74 | #09090A | — | — |  |
| `settings-video-shell` | 330 | 76 | 620 | 570 | #141416 + 1px #484850 | — | — |  |
| `settings-video-title` | 358 | 100 | 530 | 34 | — | 24 **b** | #F6F6F7 | Settings |
| `settings-video-subtitle` | 358 | 138 | 564 | 32 | — | 12 | #A3A3AD | Configure this Studio stream |
| `settings-video-close-shape` | 896 | 96 | 34 | 34 | #2D2D32 | — | — |  |
| `settings-video-close-icon` | 896 | 97 | 34 | 32 | — | 15 **b** | #F6F6F7 | × |
| `settings-video-nav` | 348 | 182 | 150 | 442 | #111113 | — | — |  |
| `settings-video-tab-0` | 378 | 202 | 96 | 24 | — | 12 | #A3A3AD | General |
| `settings-video-tab-1-active` | 360 | 248 | 126 | 40 | #2D2D32 | — | — |  |
| `settings-video-tab-1` | 378 | 256 | 96 | 24 | — | 12 **b** | #F6F6F7 | Video |
| `settings-video-tab-2` | 378 | 310 | 96 | 24 | — | 12 | #A3A3AD | Audio |
| `settings-video-tab-3` | 378 | 364 | 96 | 24 | — | 12 | #A3A3AD | Profile |
| `settings-video-tab-4` | 378 | 418 | 96 | 24 | — | 12 | #A3A3AD | Shortcuts |
| `settings-video-content-heading` | 526 | 190 | 392 | 30 | — | 19 **b** | #F6F6F7 | Video |
| `video-input-label` | 526 | 232 | 392 | 20 | — | 11 **b** | #A3A3AD | Video input |
| `video-input-field` | 526 | 255 | 392 | 42 | #1C1C1F + 1px #484850 | — | — |  |
| `video-input-value` | 538 | 259 | 368 | 34 | — | 13 | #F6F6F7 | Integrated Camera  ▾ |
| `video-preview` | 526 | 321 | 392 | 180 | #242428 + 1px #484850 | — | — |  |
| `video-preview-avatar` | 679 | 352 | 86 | 86 | #2864F0 | — | — |  |
| `video-preview-initial` | 679 | 374 | 86 | 43 | — | 24 **b** | #FFFFFF | AM |
| `video-resolution-label` | 526 | 522 | 188 | 20 | — | 11 **b** | #A3A3AD | Resolution |
| `video-resolution-field` | 526 | 545 | 188 | 38 | #1C1C1F + 1px #484850 | — | — |  |
| `video-resolution-value` | 538 | 549 | 164 | 30 | — | 13 | #F6F6F7 | 1920 × 1080  ▾ |
| `video-mirror-label` | 728 | 542 | 142 | 34 | — | 12 | #F6F6F7 | Mirror camera |
| `video-mirror-track` | 874 | 548 | 40 | 22 | #2864F0 | — | — |  |
| `video-mirror-knob` | 894 | 551 | 16 | 16 | #FFFFFF | — | — |  |

### 2.14 Window 14 — Settings modal — Audio tab

**Chrome:** base *B*, complete.

**Screen-specific elements** (48):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `settings-audio-dim-top` | 0 | 0 | 1280 | 76 | #09090A | — | — |  |
| `settings-audio-dim-left` | 0 | 76 | 330 | 570 | #09090A | — | — |  |
| `settings-audio-dim-right` | 950 | 76 | 330 | 570 | #09090A | — | — |  |
| `settings-audio-dim-bottom` | 0 | 646 | 1280 | 74 | #09090A | — | — |  |
| `settings-audio-shell` | 330 | 76 | 620 | 570 | #141416 + 1px #484850 | — | — |  |
| `settings-audio-title` | 358 | 100 | 530 | 34 | — | 24 **b** | #F6F6F7 | Settings |
| `settings-audio-subtitle` | 358 | 138 | 564 | 32 | — | 12 | #A3A3AD | Configure this Studio stream |
| `settings-audio-close-shape` | 896 | 96 | 34 | 34 | #2D2D32 | — | — |  |
| `settings-audio-close-icon` | 896 | 97 | 34 | 32 | — | 15 **b** | #F6F6F7 | × |
| `settings-audio-nav` | 348 | 182 | 150 | 442 | #111113 | — | — |  |
| `settings-audio-tab-0` | 378 | 202 | 96 | 24 | — | 12 | #A3A3AD | General |
| `settings-audio-tab-1` | 378 | 256 | 96 | 24 | — | 12 | #A3A3AD | Video |
| `settings-audio-tab-2-active` | 360 | 302 | 126 | 40 | #2D2D32 | — | — |  |
| `settings-audio-tab-2` | 378 | 310 | 96 | 24 | — | 12 **b** | #F6F6F7 | Audio |
| `settings-audio-tab-3` | 378 | 364 | 96 | 24 | — | 12 | #A3A3AD | Profile |
| `settings-audio-tab-4` | 378 | 418 | 96 | 24 | — | 12 | #A3A3AD | Shortcuts |
| `settings-audio-content-heading` | 526 | 190 | 392 | 30 | — | 19 **b** | #F6F6F7 | Audio |
| `mic-input-label` | 526 | 232 | 392 | 20 | — | 11 **b** | #A3A3AD | Microphone |
| `mic-input-field` | 526 | 255 | 392 | 42 | #1C1C1F + 1px #484850 | — | — |  |
| `mic-input-value` | 538 | 259 | 368 | 34 | — | 13 | #F6F6F7 | Built-in Microphone  ▾ |
| `audio-level-label` | 526 | 321 | 90 | 20 | — | 11 **b** | #A3A3AD | Input level |
| `audio-meter-0` | 526 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-1` | 545 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-2` | 564 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-3` | 583 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-4` | 602 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-5` | 621 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-6` | 640 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-7` | 659 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-8` | 678 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-9` | 697 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-10` | 716 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-11` | 735 | 354 | 12 | 52 | #24C875 | — | — |  |
| `audio-meter-12` | 754 | 354 | 12 | 52 | #2D2D32 | — | — |  |
| `audio-meter-13` | 773 | 354 | 12 | 52 | #2D2D32 | — | — |  |
| `audio-meter-14` | 792 | 354 | 12 | 52 | #2D2D32 | — | — |  |
| `audio-meter-15` | 811 | 354 | 12 | 52 | #2D2D32 | — | — |  |
| `audio-meter-16` | 830 | 354 | 12 | 52 | #2D2D32 | — | — |  |
| `audio-meter-17` | 849 | 354 | 12 | 52 | #2D2D32 | — | — |  |
| `speaker-output-label` | 526 | 430 | 392 | 20 | — | 11 **b** | #A3A3AD | Speaker |
| `speaker-output-field` | 526 | 453 | 392 | 42 | #1C1C1F + 1px #484850 | — | — |  |
| `speaker-output-value` | 538 | 457 | 368 | 34 | — | 13 | #F6F6F7 | Default output  ▾ |
| `echo-cancel-label` | 526 | 519 | 344 | 34 | — | 12 | #F6F6F7 | Echo cancellation |
| `echo-cancel-track` | 874 | 525 | 40 | 22 | #2864F0 | — | — |  |
| `echo-cancel-knob` | 894 | 528 | 16 | 16 | #FFFFFF | — | — |  |
| `noise-suppress-label` | 526 | 564 | 344 | 34 | — | 12 | #F6F6F7 | Noise suppression |
| `noise-suppress-track` | 874 | 570 | 40 | 22 | #2864F0 | — | — |  |
| `noise-suppress-knob` | 894 | 573 | 16 | 16 | #FFFFFF | — | — |  |

### 2.15 Window 15 — Right panel — Customize Layout (source selected)

Stage shows a 3px selection outline on the host tile; panel shows sliders, position/shape controls.

**Chrome:** base *B*, **minus** 37 elements: `copy-invite-shape`, `copy-invite-label`, `sources-backstage`, `source-host-card`, `source-host-avatar`, `source-host-initial`, `source-host-title`, `source-host-subtitle`, `source-host-action-shape`, `source-host-action-label`, `source-guest-card`, `source-guest-avatar`, `source-guest-initial`, `source-guest-title`, `source-guest-subtitle`, `source-guest-action-shape`, `source-guest-action-label`, `sources-media`, `source-screen-card`, `source-screen-avatar`, `source-screen-initial`, `source-screen-title`, `source-screen-subtitle`, `source-screen-action-shape`, `source-screen-action-label`, `source-slides-card`, `source-slides-avatar`, `source-slides-initial`, `source-slides-title`, `source-slides-subtitle`, `source-slides-action-shape`, `source-slides-action-label`, `add-source-shape`, `add-source-label`, `guest-control-label`, `guest-control-track`, `guest-control-knob`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | Customize |

<sub>Previous values in *B*: `right-panel-title`="Sources"</sub>

**Screen-specific elements** (35):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `selected-source-outline` | 224 | 108 | 345 | 372 | — + 3px #447CFF | — | — |  |
| `customize-heading` | 990 | 134 | 220 | 28 | — | 18 **b** | #F6F6F7 | Customize Layout |
| `customize-source` | 990 | 166 | 220 | 22 | — | 10 | #A3A3AD | Alex Morgan • Camera |
| `custom-slider-1-label` | 990 | 214 | 110 | 22 | — | 12 **b** | #F6F6F7 | Radius |
| `custom-slider-1-value` | 1136 | 214 | 78 | 22 | — | 11 | #A3A3AD | 16 |
| `custom-slider-1-track` | 990 | 248 | 224 | 5 | #2D2D32 | — | — |  |
| `custom-slider-1-fill` | 990 | 248 | 108 | 5 | #2864F0 | — | — |  |
| `custom-slider-1-knob` | 1094 | 243 | 15 | 15 | #FFFFFF | — | — |  |
| `custom-slider-2-label` | 990 | 296 | 110 | 22 | — | 12 **b** | #F6F6F7 | Size |
| `custom-slider-2-value` | 1136 | 296 | 78 | 22 | — | 11 | #A3A3AD | 74% |
| `custom-slider-2-track` | 990 | 330 | 224 | 5 | #2D2D32 | — | — |  |
| `custom-slider-2-fill` | 990 | 330 | 166 | 5 | #2864F0 | — | — |  |
| `custom-slider-2-knob` | 1152 | 325 | 15 | 15 | #FFFFFF | — | — |  |
| `custom-slider-3-label` | 990 | 378 | 110 | 22 | — | 12 **b** | #F6F6F7 | Ratio |
| `custom-slider-3-value` | 1136 | 378 | 78 | 22 | — | 11 | #A3A3AD | 50 / 50 |
| `custom-slider-3-track` | 990 | 412 | 224 | 5 | #2D2D32 | — | — |  |
| `custom-slider-3-fill` | 990 | 412 | 116 | 5 | #2864F0 | — | — |  |
| `custom-slider-3-knob` | 1102 | 407 | 15 | 15 | #FFFFFF | — | — |  |
| `custom-position-label` | 990 | 461 | 110 | 22 | — | 12 **b** | #F6F6F7 | Position |
| `custom-fixed-shape` | 990 | 493 | 96 | 30 | #2864F0 | — | — |  |
| `custom-fixed-label` | 990 | 496 | 96 | 24 | — | 12 **b** | #F6F6F7 | Fixed |
| `custom-free-shape` | 1094 | 493 | 120 | 30 | #2D2D32 | — | — |  |
| `custom-free-label` | 1094 | 496 | 120 | 24 | — | 12 **b** | #F6F6F7 | Free Move |
| `custom-shape-label` | 990 | 545 | 110 | 22 | — | 12 **b** | #F6F6F7 | Shape |
| `custom-shape-1-shape` | 990 | 576 | 42 | 42 | #2864F0 | — | — |  |
| `custom-shape-1-icon` | 990 | 577 | 42 | 40 | — | 15 **b** | #F6F6F7 | ▭ |
| `custom-shape-2-shape` | 1042 | 576 | 42 | 42 | #2D2D32 | — | — |  |
| `custom-shape-2-icon` | 1042 | 577 | 42 | 40 | — | 15 **b** | #F6F6F7 | □ |
| `custom-shape-3-shape` | 1094 | 576 | 42 | 42 | #2D2D32 | — | — |  |
| `custom-shape-3-icon` | 1094 | 577 | 42 | 40 | — | 15 **b** | #F6F6F7 | ○ |
| `custom-names-label` | 990 | 628 | 176 | 34 | — | 12 | #F6F6F7 | Show participant names |
| `custom-names-track` | 1170 | 634 | 40 | 22 | #2864F0 | — | — |  |
| `custom-names-knob` | 1190 | 637 | 16 | 16 | #FFFFFF | — | — |  |
| `custom-reset-shape` | 990 | 674 | 224 | 32 | #2D2D32 | — | — |  |
| `custom-reset-label` | 990 | 676 | 224 | 28 | — | 13 **b** | #F6F6F7 | Reset changes |

### 2.16 Window 16 — Countdown scene (scene 3 active)

Stage replaced by countdown backdrop; right panel is the Countdown editor.

**Chrome:** base *B*, **minus** 56 elements: `host-video`, `host-halo`, `host-avatar`, `host-initials`, `host-nameplate`, `host-name`, `host-mic-dot`, `host-mic`, `guest-video`, `guest-halo`, `guest-avatar`, `guest-initials`, `guest-nameplate`, `guest-name`, `guest-mic-dot`, `guest-mic`, `lower-third`, `lower-third-name`, `lower-third-title`, `copy-invite-shape`, `copy-invite-label`, `sources-backstage`, `source-host-card`, `source-host-avatar`, `source-host-initial`, `source-host-title`, `source-host-subtitle`, `source-host-action-shape`, `source-host-action-label`, `source-guest-card`, `source-guest-avatar`, `source-guest-initial`, `source-guest-title`, `source-guest-subtitle`, `source-guest-action-shape`, `source-guest-action-label`, `sources-media`, `source-screen-card`, `source-screen-avatar`, `source-screen-initial`, `source-screen-title`, `source-screen-subtitle`, `source-screen-action-shape`, `source-screen-action-label`, `source-slides-card`, `source-slides-avatar`, `source-slides-initial`, `source-slides-title`, `source-slides-subtitle`, `source-slides-action-shape`, `source-slides-action-label`, `add-source-shape`, `add-source-label`, `guest-control-label`, `guest-control-track`, `guest-control-knob`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `scene-1-selection` | 12 | 126 | 158 | 94 | — | — | — |  |
| `scene-3-selection` | 12 | 336 | 158 | 94 | #2D2D32 + 2px #447CFF | — | — |  |
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | Customize |

<sub>Previous values in *B*: `scene-1-selection`=#2D2D32; `scene-3-selection`=—; `right-panel-title`="Sources"</sub>

**Screen-specific elements** (26):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `countdown-backdrop` | 216 | 97 | 720 | 396 | — | — | — |  |
| `countdown-kicker` | 350 | 188 | 450 | 28 | — | 16 **b** | #FFFFFF | WE'LL BE LIVE IN |
| `countdown-time` | 310 | 230 | 530 | 105 | — | 78 **b** | #FFFFFF | 05:00 |
| `countdown-subtitle` | 350 | 350 | 450 | 36 | — | 22 **b** | #FFFFFF | Weekly Product Update |
| `countdown-panel-heading` | 990 | 134 | 220 | 28 | — | 18 **b** | #F6F6F7 | Countdown |
| `countdown-duration-label` | 990 | 174 | 224 | 20 | — | 11 **b** | #A3A3AD | Duration |
| `countdown-duration-field` | 990 | 197 | 224 | 40 | #1C1C1F + 1px #484850 | — | — |  |
| `countdown-duration-value` | 1002 | 201 | 200 | 32 | — | 13 | #F6F6F7 | 05:00 |
| `countdown-style-label` | 990 | 264 | 120 | 20 | — | 10 **b** | #73737D | STYLE |
| `countdown-style-1` | 990 | 294 | 102 | 66 | #1D2848 + 1px #484850 | — | — |  |
| `countdown-style-1-label` | 990 | 366 | 102 | 18 | — | 10 | #A3A3AD | Clean |
| `countdown-style-2` | 1102 | 294 | 102 | 66 | #3F254B + 1px #484850 | — | — |  |
| `countdown-style-2-label` | 1102 | 366 | 102 | 18 | — | 10 | #A3A3AD | Bold |
| `countdown-style-3` | 990 | 390 | 102 | 66 | #174253 + 1px #484850 | — | — |  |
| `countdown-style-3-label` | 990 | 462 | 102 | 18 | — | 10 | #A3A3AD | Digital |
| `countdown-style-4` | 1102 | 390 | 102 | 66 | #38231F + 1px #484850 | — | — |  |
| `countdown-style-4-label` | 1102 | 462 | 102 | 18 | — | 10 | #A3A3AD | Classic |
| `countdown-music-label` | 990 | 488 | 224 | 20 | — | 11 **b** | #A3A3AD | Music |
| `countdown-music-field` | 990 | 511 | 224 | 40 | #1C1C1F + 1px #484850 | — | — |  |
| `countdown-music-value` | 1002 | 515 | 200 | 32 | — | 13 | #F6F6F7 | Ambient Pulse  ▾ |
| `countdown-font-label` | 990 | 572 | 224 | 20 | — | 11 **b** | #A3A3AD | Font |
| `countdown-font-field` | 990 | 595 | 224 | 40 | #1C1C1F + 1px #484850 | — | — |  |
| `countdown-font-value` | 1002 | 599 | 200 | 32 | — | 13 | #F6F6F7 | Geist Mono  ▾ |
| `countdown-autoswitch-label` | 990 | 653 | 176 | 34 | — | 12 | #F6F6F7 | Switch to next scene |
| `countdown-autoswitch-track` | 1170 | 659 | 40 | 22 | #2864F0 | — | — |  |
| `countdown-autoswitch-knob` | 1190 | 662 | 16 | 16 | #FFFFFF | — | — |  |

### 2.17 Window 17 — Presentation scene (scene 2 active)

Stage shows a slide + presenter PiP; right panel is the Media/Presentations tab with slide controls.

**Chrome:** base *B*, **minus** 56 elements: `host-video`, `host-halo`, `host-avatar`, `host-initials`, `host-nameplate`, `host-name`, `host-mic-dot`, `host-mic`, `guest-video`, `guest-halo`, `guest-avatar`, `guest-initials`, `guest-nameplate`, `guest-name`, `guest-mic-dot`, `guest-mic`, `lower-third`, `lower-third-name`, `lower-third-title`, `copy-invite-shape`, `copy-invite-label`, `sources-backstage`, `source-host-card`, `source-host-avatar`, `source-host-initial`, `source-host-title`, `source-host-subtitle`, `source-host-action-shape`, `source-host-action-label`, `source-guest-card`, `source-guest-avatar`, `source-guest-initial`, `source-guest-title`, `source-guest-subtitle`, `source-guest-action-shape`, `source-guest-action-label`, `sources-media`, `source-screen-card`, `source-screen-avatar`, `source-screen-initial`, `source-screen-title`, `source-screen-subtitle`, `source-screen-action-shape`, `source-screen-action-label`, `source-slides-card`, `source-slides-avatar`, `source-slides-initial`, `source-slides-title`, `source-slides-subtitle`, `source-slides-action-shape`, `source-slides-action-label`, `add-source-shape`, `add-source-label`, `guest-control-label`, `guest-control-track`, `guest-control-knob`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `scene-1-selection` | 12 | 126 | 158 | 94 | — | — | — |  |
| `scene-2-selection` | 12 | 231 | 158 | 94 | #2D2D32 + 2px #447CFF | — | — |  |
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | Media |

<sub>Previous values in *B*: `scene-1-selection`=#2D2D32; `scene-2-selection`=—; `right-panel-title`="Sources"</sub>

**Screen-specific elements** (41):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `presentation-slide` | 230 | 110 | 540 | 360 | #FFFFFF | — | — |  |
| `presentation-accent` | 230 | 110 | 540 | 16 | #7C5CFC | — | — |  |
| `presentation-eyebrow` | 270 | 166 | 410 | 24 | — | 13 **b** | #7C5CFC | Q3 PRODUCT ROADMAP |
| `presentation-title` | 270 | 205 | 380 | 92 | — | 36 **b** | #1E1E24 | Build faster. ⏎ Launch smarter. |
| `presentation-body` | 270 | 323 | 380 | 38 | — | 18 | #60606B | Three priorities for the next quarter |
| `presenter-pip-video` | 788 | 318 | 135 | 152 | #242428 + 1px #34343A | — | — |  |
| `presenter-pip-halo` | 800.5 | 322 | 110 | 110 | #2864F0 | — | — |  |
| `presenter-pip-avatar` | 813.5 | 335 | 84 | 84 | #2D2D32 | — | — |  |
| `presenter-pip-initials` | 813.5 | 342 | 84 | 70 | — | 28 **b** | #FFFFFF | AM |
| `presenter-pip-nameplate` | 800 | 428 | 111 | 28 | #141416 | — | — |  |
| `presenter-pip-name` | 810 | 432 | 91 | 20 | — | 11 **b** | #F6F6F7 | Alex Morgan |
| `presenter-pip-mic-dot` | 887 | 332 | 22 | 22 | #141416 | — | — |  |
| `presenter-pip-mic` | 887 | 335 | 22 | 16 | — | 9 **b** | #F6F6F7 | M |
| `presentation-page-shape` | 654 | 430 | 96 | 30 | #2D2D32 | — | — |  |
| `presentation-page-label` | 654 | 433 | 96 | 24 | — | 12 **b** | #F6F6F7 | 3 / 12 |
| `presentation-panel-heading` | 990 | 134 | 175 | 25 | — | 16 **b** | #F6F6F7 | Presentations |
| `presentation-upload-shape` | 1126 | 128 | 88 | 32 | #2864F0 | — | — |  |
| `presentation-upload-label` | 1126 | 130 | 88 | 28 | — | 13 **b** | #F6F6F7 | + Upload |
| `presentation-file-card` | 990 | 182 | 224 | 142 | #1C1C1F + 1px #34343A | — | — |  |
| `presentation-file-thumb` | 1004 | 196 | 82 | 58 | #FFFFFF | — | — |  |
| `presentation-file-accent` | 1004 | 196 | 82 | 7 | #7C5CFC | — | — |  |
| `presentation-file-title` | 1098 | 198 | 104 | 24 | — | 12 **b** | #F6F6F7 | Q3 Roadmap |
| `presentation-file-meta` | 1098 | 228 | 104 | 20 | — | 10 | #A3A3AD | 12 slides • PPTX |
| `presentation-present-shape` | 1004 | 272 | 94 | 34 | #2864F0 | — | — |  |
| `presentation-present-label` | 1004 | 274 | 94 | 30 | — | 13 **b** | #F6F6F7 | Present |
| `presentation-more-shape` | 1108 | 272 | 94 | 34 | #2D2D32 | — | — |  |
| `presentation-more-label` | 1108 | 274 | 94 | 30 | — | 13 **b** | #F6F6F7 | ••• |
| `presentation-controller-heading` | 990 | 354 | 130 | 20 | — | 10 **b** | #73737D | CONTROLS |
| `presentation-prev-shape` | 990 | 386 | 48 | 48 | #2D2D32 | — | — |  |
| `presentation-prev-icon` | 990 | 387 | 48 | 46 | — | 15 **b** | #F6F6F7 | ‹ |
| `presentation-slide-count-shape` | 1048 | 394 | 100 | 30 | #2D2D32 | — | — |  |
| `presentation-slide-count-label` | 1048 | 397 | 100 | 24 | — | 12 **b** | #F6F6F7 | 3 / 12 |
| `presentation-next-shape` | 1160 | 386 | 48 | 48 | #2D2D32 | — | — |  |
| `presentation-next-icon` | 1160 | 387 | 48 | 46 | — | 15 **b** | #F6F6F7 | › |
| `presentation-guest-control-label` | 990 | 462 | 176 | 34 | — | 12 | #F6F6F7 | Guest control |
| `presentation-guest-control-track` | 1170 | 468 | 40 | 22 | #2864F0 | — | — |  |
| `presentation-guest-control-knob` | 1190 | 471 | 16 | 16 | #FFFFFF | — | — |  |
| `presentation-autoplay-label` | 990 | 508 | 176 | 34 | — | 12 | #F6F6F7 | Auto-advance |
| `presentation-autoplay-track` | 1170 | 514 | 40 | 22 | #2D2D32 | — | — |  |
| `presentation-autoplay-knob` | 1174 | 517 | 16 | 16 | #FFFFFF | — | — |  |
| `presentation-tip` | 990 | 574 | 224 | 52 | — | 10 | #A3A3AD | Slides are static. Animations and video are not supported. |

### 2.18 Window 18 — "Invite Guests" modal

**Chrome:** base *B*, complete.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `source-guest-subtitle` | 1046 | 324 | 119 | 18 | — | 10 | #A3A3AD | Guest • Scenes 1, 5 |
| `source-guest-action-label` | 1158 | 311 | 44 | 24 | — | 12 **b** | #24C875 | On |
| `source-screen-action-label` | 1158 | 428 | 44 | 24 | — | 12 **b** | #24C875 | On |
| `guest-control-track` | 1170 | 623 | 40 | 22 | #2864F0 | — | — |  |
| `guest-control-knob` | 1190 | 626 | 16 | 16 | #FFFFFF | — | — |  |

<sub>Previous values in *B*: `source-guest-subtitle`="Guest • Waiting"; `source-guest-action-label`="Off"; `source-screen-action-label`="Off"; `guest-control-track`=#2D2D32; `guest-control-knob`=#FFFFFF</sub>

**Screen-specific elements** (25):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `invite-modal-dim-top` | 0 | 0 | 1280 | 116 | #09090A | — | — |  |
| `invite-modal-dim-left` | 0 | 116 | 350 | 480 | #09090A | — | — |  |
| `invite-modal-dim-right` | 930 | 116 | 350 | 480 | #09090A | — | — |  |
| `invite-modal-dim-bottom` | 0 | 596 | 1280 | 124 | #09090A | — | — |  |
| `invite-modal-shell` | 350 | 116 | 580 | 480 | #141416 + 1px #484850 | — | — |  |
| `invite-modal-title` | 378 | 140 | 490 | 34 | — | 24 **b** | #F6F6F7 | Invite Guests |
| `invite-modal-subtitle` | 378 | 178 | 524 | 32 | — | 12 | #A3A3AD | Share one link for guests to join your Studio backstage. |
| `invite-modal-close-shape` | 876 | 136 | 34 | 34 | #2D2D32 | — | — |  |
| `invite-modal-close-icon` | 876 | 137 | 34 | 32 | — | 15 **b** | #F6F6F7 | × |
| `invite-link-label` | 390 | 220 | 500 | 20 | — | 11 **b** | #A3A3AD | Guest invite link |
| `invite-link-field` | 390 | 243 | 500 | 44 | #1C1C1F + 1px #484850 | — | — |  |
| `invite-link-value` | 402 | 247 | 476 | 36 | — | 13 | #F6F6F7 | https://studio.restream.io/guest/example |
| `invite-copy-shape` | 754 | 293 | 136 | 38 | #2864F0 | — | — |  |
| `invite-copy-label` | 754 | 295 | 136 | 34 | — | 13 **b** | #F6F6F7 | Copy link |
| `invite-rebroadcast-label` | 390 | 352 | 452 | 34 | — | 12 | #F6F6F7 | Guests can re-broadcast on their channels |
| `invite-rebroadcast-track` | 846 | 358 | 40 | 22 | #2864F0 | — | — |  |
| `invite-rebroadcast-knob` | 866 | 361 | 16 | 16 | #FFFFFF | — | — |  |
| `invite-enter-label` | 390 | 400 | 452 | 34 | — | 12 | #F6F6F7 | Guests can enter without approval |
| `invite-enter-track` | 846 | 406 | 40 | 22 | #2D2D32 | — | — |  |
| `invite-enter-knob` | 850 | 409 | 16 | 16 | #FFFFFF | — | — |  |
| `invite-rule` | 390 | 456 | 500 | 1 | #34343A | — | — |  |
| `invite-limit` | 390 | 482 | 180 | 22 | — | 12 **b** | #F6F6F7 | Room capacity |
| `invite-limit-value` | 650 | 482 | 240 | 22 | — | 12 | #A3A3AD | 2 of 10 participants |
| `invite-refresh-shape` | 390 | 525 | 196 | 36 | #2D2D32 | — | — |  |
| `invite-refresh-label` | 390 | 527 | 196 | 32 | — | 13 **b** | #F6F6F7 | Refresh invite link |

### 2.19 Window 19 — "Stream details" modal

Title / description / thumbnail form with Cancel + Save footer.

**Chrome:** base *B*, complete.

**Screen-specific elements** (26):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `stream-info-dim-top` | 0 | 0 | 1280 | 70 | #09090A | — | — |  |
| `stream-info-dim-left` | 0 | 70 | 330 | 585 | #09090A | — | — |  |
| `stream-info-dim-right` | 950 | 70 | 330 | 585 | #09090A | — | — |  |
| `stream-info-dim-bottom` | 0 | 655 | 1280 | 65 | #09090A | — | — |  |
| `stream-info-shell` | 330 | 70 | 620 | 585 | #141416 + 1px #484850 | — | — |  |
| `stream-info-title` | 358 | 94 | 530 | 34 | — | 24 **b** | #F6F6F7 | Stream details |
| `stream-info-subtitle` | 358 | 132 | 564 | 32 | — | 12 | #A3A3AD | Update the title, description and thumbnail. |
| `stream-info-close-shape` | 896 | 90 | 34 | 34 | #2D2D32 | — | — |  |
| `stream-info-close-icon` | 896 | 91 | 34 | 32 | — | 15 **b** | #F6F6F7 | × |
| `stream-title-field-label` | 370 | 180 | 540 | 20 | — | 11 **b** | #A3A3AD | Title |
| `stream-title-field-field` | 370 | 203 | 540 | 44 | #1C1C1F + 1px #484850 | — | — |  |
| `stream-title-field-value` | 382 | 207 | 516 | 36 | — | 13 | #F6F6F7 | Weekly Product Update |
| `stream-title-ai-shape` | 842 | 188 | 52 | 30 | #7C5CFC | — | — |  |
| `stream-title-ai-label` | 842 | 191 | 52 | 24 | — | 12 **b** | #F6F6F7 | AI |
| `stream-description-label` | 370 | 274 | 540 | 20 | — | 11 **b** | #A3A3AD | Description |
| `stream-description-field` | 370 | 297 | 540 | 112 | #1C1C1F + 1px #484850 | — | — |  |
| `stream-description-value` | 382 | 301 | 516 | 104 | — | 13 | #F6F6F7 | Join Alex and Maya for product news, demos and a live Q&A. |
| `stream-thumbnail-label` | 370 | 441 | 150 | 20 | — | 11 **b** | #A3A3AD | Thumbnail |
| `stream-thumbnail-preview` | 370 | 468 | 170 | 96 | #242428 + 1px #484850 | — | — |  |
| `stream-thumbnail-text` | 370 | 490 | 170 | 50 | — | 17 **b** | #FFFFFF | WEEKLY ⏎ UPDATE |
| `stream-thumbnail-upload-shape` | 562 | 496 | 160 | 38 | #2D2D32 | — | — |  |
| `stream-thumbnail-upload-label` | 562 | 498 | 160 | 34 | — | 13 **b** | #F6F6F7 | Upload thumbnail |
| `stream-cancel-shape` | 706 | 590 | 92 | 38 | #2D2D32 | — | — |  |
| `stream-cancel-label` | 706 | 592 | 92 | 34 | — | 13 **b** | #F6F6F7 | Cancel |
| `stream-save-shape` | 808 | 590 | 102 | 38 | #2864F0 | — | — |  |
| `stream-save-label` | 808 | 592 | 102 | 34 | — | 13 **b** | #F6F6F7 | Save |

### 2.20 Window 20 — "Channels & Schedule" modal

Two 350px columns: channel destinations and schedule form.

**Chrome:** base *B*, complete.

**Screen-specific elements** (59):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `channels-schedule-dim-top` | 0 | 0 | 1280 | 78 | #09090A | — | — |  |
| `channels-schedule-dim-left` | 0 | 78 | 250 | 566 | #09090A | — | — |  |
| `channels-schedule-dim-right` | 1030 | 78 | 250 | 566 | #09090A | — | — |  |
| `channels-schedule-dim-bottom` | 0 | 644 | 1280 | 76 | #09090A | — | — |  |
| `channels-schedule-shell` | 250 | 78 | 780 | 566 | #141416 + 1px #484850 | — | — |  |
| `channels-schedule-title` | 278 | 102 | 690 | 34 | — | 24 **b** | #F6F6F7 | Channels & Schedule |
| `channels-schedule-subtitle` | 278 | 140 | 724 | 32 | — | 12 | #A3A3AD | Choose destinations and decide when your stream starts. |
| `channels-schedule-close-shape` | 976 | 98 | 34 | 34 | #2D2D32 | — | — |  |
| `channels-schedule-close-icon` | 976 | 99 | 34 | 32 | — | 15 **b** | #F6F6F7 | × |
| `channels-column` | 280 | 170 | 350 | 420 | #1C1C1F + 1px #34343A | — | — |  |
| `channels-heading` | 304 | 194 | 200 | 28 | — | 18 **b** | #F6F6F7 | Channels |
| `channel-1-icon` | 306 | 246 | 38 | 38 | #EF4B55 | — | — |  |
| `channel-1-letter` | 306 | 254 | 38 | 22 | — | 11 **b** | #FFFFFF | Y |
| `channel-1-name` | 356 | 245 | 150 | 22 | — | 12 **b** | #F6F6F7 | YouTube |
| `channel-1-account` | 356 | 269 | 160 | 20 | — | 10 | #A3A3AD | Product Channel |
| `channel-1-toggle-label` | 518 | 248 | 44 | 34 | — | 12 | #F6F6F7 |  |
| `channel-1-toggle-track` | 566 | 254 | 40 | 22 | #2864F0 | — | — |  |
| `channel-1-toggle-knob` | 586 | 257 | 16 | 16 | #FFFFFF | — | — |  |
| `channel-2-icon` | 306 | 318 | 38 | 38 | #2864F0 | — | — |  |
| `channel-2-letter` | 306 | 326 | 38 | 22 | — | 11 **b** | #FFFFFF | L |
| `channel-2-name` | 356 | 317 | 150 | 22 | — | 12 **b** | #F6F6F7 | LinkedIn |
| `channel-2-account` | 356 | 341 | 160 | 20 | — | 10 | #A3A3AD | Company Page |
| `channel-2-toggle-label` | 518 | 320 | 44 | 34 | — | 12 | #F6F6F7 |  |
| `channel-2-toggle-track` | 566 | 326 | 40 | 22 | #2864F0 | — | — |  |
| `channel-2-toggle-knob` | 586 | 329 | 16 | 16 | #FFFFFF | — | — |  |
| `channel-3-icon` | 306 | 390 | 38 | 38 | #7C5CFC | — | — |  |
| `channel-3-letter` | 306 | 398 | 38 | 22 | — | 11 **b** | #FFFFFF | F |
| `channel-3-name` | 356 | 389 | 150 | 22 | — | 12 **b** | #F6F6F7 | Facebook |
| `channel-3-account` | 356 | 413 | 160 | 20 | — | 10 | #A3A3AD | Brand Page |
| `channel-3-toggle-label` | 518 | 392 | 44 | 34 | — | 12 | #F6F6F7 |  |
| `channel-3-toggle-track` | 566 | 398 | 40 | 22 | #2D2D32 | — | — |  |
| `channel-3-toggle-knob` | 570 | 401 | 16 | 16 | #FFFFFF | — | — |  |
| `channel-4-icon` | 306 | 462 | 38 | 38 | #24C875 | — | — |  |
| `channel-4-letter` | 306 | 470 | 38 | 22 | — | 11 **b** | #FFFFFF | C |
| `channel-4-name` | 356 | 461 | 150 | 22 | — | 12 **b** | #F6F6F7 | Custom RTMP |
| `channel-4-account` | 356 | 485 | 160 | 20 | — | 10 | #A3A3AD | Add destination |
| `channel-4-toggle-label` | 518 | 464 | 44 | 34 | — | 12 | #F6F6F7 |  |
| `channel-4-toggle-track` | 566 | 470 | 40 | 22 | #2D2D32 | — | — |  |
| `channel-4-toggle-knob` | 570 | 473 | 16 | 16 | #FFFFFF | — | — |  |
| `schedule-column` | 650 | 170 | 350 | 420 | #1C1C1F + 1px #34343A | — | — |  |
| `schedule-heading` | 674 | 194 | 200 | 28 | — | 18 **b** | #F6F6F7 | Schedule |
| `schedule-now-shape` | 674 | 246 | 142 | 30 | #2864F0 | — | — |  |
| `schedule-now-label` | 674 | 249 | 142 | 24 | — | 12 **b** | #F6F6F7 | Go live now |
| `schedule-later-shape` | 824 | 246 | 150 | 30 | #2D2D32 | — | — |  |
| `schedule-later-label` | 824 | 249 | 150 | 24 | — | 12 **b** | #F6F6F7 | Schedule later |
| `schedule-date-label` | 674 | 305 | 300 | 20 | — | 11 **b** | #A3A3AD | Date |
| `schedule-date-field` | 674 | 328 | 300 | 40 | #1C1C1F + 1px #484850 | — | — |  |
| `schedule-date-value` | 686 | 332 | 276 | 32 | — | 13 | #F6F6F7 | August 28, 2026 |
| `schedule-time-label` | 674 | 389 | 144 | 20 | — | 11 **b** | #A3A3AD | Time |
| `schedule-time-field` | 674 | 412 | 144 | 40 | #1C1C1F + 1px #484850 | — | — |  |
| `schedule-time-value` | 686 | 416 | 120 | 32 | — | 13 | #F6F6F7 | 6:00 PM |
| `schedule-zone-label` | 830 | 389 | 144 | 20 | — | 11 **b** | #A3A3AD | Time zone |
| `schedule-zone-field` | 830 | 412 | 144 | 40 | #1C1C1F + 1px #484850 | — | — |  |
| `schedule-zone-value` | 842 | 416 | 120 | 32 | — | 13 | #F6F6F7 | EAT (UTC+3) |
| `schedule-event-box` | 674 | 491 | 18 | 18 | #2864F0 + 1px #2864F0 | — | — |  |
| `schedule-event-check` | 674 | 491 | 18 | 18 | — | 11 **b** | #FFFFFF | ✓ |
| `schedule-event-label` | 701 | 489 | 220 | 24 | — | 12 | #F6F6F7 | Create events on enabled channels |
| `schedule-save-shape` | 814 | 542 | 160 | 36 | #2864F0 | — | — |  |
| `schedule-save-label` | 814 | 544 | 160 | 32 | — | 13 **b** | #F6F6F7 | Save setup |

### 2.21 Window 21 — Dual output — landscape + portrait preview

Stage shows both output framings side by side.

**Chrome:** base *B*, **minus** 19 elements: `host-video`, `host-halo`, `host-avatar`, `host-initials`, `host-nameplate`, `host-name`, `host-mic-dot`, `host-mic`, `guest-video`, `guest-halo`, `guest-avatar`, `guest-initials`, `guest-nameplate`, `guest-name`, `guest-mic-dot`, `guest-mic`, `lower-third`, `lower-third-name`, `lower-third-title`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `source-guest-subtitle` | 1046 | 324 | 119 | 18 | — | 10 | #A3A3AD | Guest • Scenes 1, 5 |
| `source-guest-action-label` | 1158 | 311 | 44 | 24 | — | 12 **b** | #24C875 | On |
| `source-screen-action-label` | 1158 | 428 | 44 | 24 | — | 12 **b** | #24C875 | On |
| `guest-control-track` | 1170 | 623 | 40 | 22 | #2864F0 | — | — |  |
| `guest-control-knob` | 1190 | 626 | 16 | 16 | #FFFFFF | — | — |  |

<sub>Previous values in *B*: `source-guest-subtitle`="Guest • Waiting"; `source-guest-action-label`="Off"; `source-screen-action-label`="Off"; `guest-control-track`=#2D2D32; `guest-control-knob`=#FFFFFF</sub>

**Screen-specific elements** (38):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `landscape-preview` | 222 | 110 | 490 | 276 | #242428 + 2px #447CFF | — | — |  |
| `dual-landscape-host-video` | 240 | 128 | 218 | 232 | #242428 + 1px #34343A | — | — |  |
| `dual-landscape-host-halo` | 294 | 172 | 110 | 110 | #2864F0 | — | — |  |
| `dual-landscape-host-avatar` | 307 | 185 | 84 | 84 | #2D2D32 | — | — |  |
| `dual-landscape-host-initials` | 307 | 192 | 84 | 70 | — | 28 **b** | #FFFFFF | AM |
| `dual-landscape-host-nameplate` | 252 | 318 | 145 | 28 | #141416 | — | — |  |
| `dual-landscape-host-name` | 262 | 322 | 125 | 20 | — | 11 **b** | #F6F6F7 | Alex |
| `dual-landscape-host-mic-dot` | 422 | 142 | 22 | 22 | #141416 | — | — |  |
| `dual-landscape-host-mic` | 422 | 145 | 22 | 16 | — | 9 **b** | #F6F6F7 | M |
| `dual-landscape-guest-video` | 472 | 128 | 218 | 232 | #242428 + 1px #34343A | — | — |  |
| `dual-landscape-guest-halo` | 526 | 172 | 110 | 110 | #7C5CFC | — | — |  |
| `dual-landscape-guest-avatar` | 539 | 185 | 84 | 84 | #2D2D32 | — | — |  |
| `dual-landscape-guest-initials` | 539 | 192 | 84 | 70 | — | 28 **b** | #FFFFFF | MK |
| `dual-landscape-guest-nameplate` | 484 | 318 | 145 | 28 | #141416 | — | — |  |
| `dual-landscape-guest-name` | 494 | 322 | 125 | 20 | — | 11 **b** | #F6F6F7 | Maya |
| `dual-landscape-guest-mic-dot` | 654 | 142 | 22 | 22 | #141416 | — | — |  |
| `dual-landscape-guest-mic` | 654 | 145 | 22 | 16 | — | 9 **b** | #F6F6F7 | M |
| `portrait-preview` | 744 | 102 | 180 | 320 | #242428 + 2px #7C5CFC | — | — |  |
| `dual-portrait-host-video` | 760 | 120 | 148 | 132 | #242428 + 1px #34343A | — | — |  |
| `dual-portrait-host-halo` | 779 | 114 | 110 | 110 | #2864F0 | — | — |  |
| `dual-portrait-host-avatar` | 792 | 127 | 84 | 84 | #2D2D32 | — | — |  |
| `dual-portrait-host-initials` | 792 | 134 | 84 | 70 | — | 28 **b** | #FFFFFF | AM |
| `dual-portrait-host-nameplate` | 772 | 210 | 124 | 28 | #141416 | — | — |  |
| `dual-portrait-host-name` | 782 | 214 | 104 | 20 | — | 11 **b** | #F6F6F7 | Alex |
| `dual-portrait-host-mic-dot` | 872 | 134 | 22 | 22 | #141416 | — | — |  |
| `dual-portrait-host-mic` | 872 | 137 | 22 | 16 | — | 9 **b** | #F6F6F7 | M |
| `dual-portrait-guest-video` | 760 | 266 | 148 | 132 | #242428 + 1px #34343A | — | — |  |
| `dual-portrait-guest-halo` | 779 | 260 | 110 | 110 | #7C5CFC | — | — |  |
| `dual-portrait-guest-avatar` | 792 | 273 | 84 | 84 | #2D2D32 | — | — |  |
| `dual-portrait-guest-initials` | 792 | 280 | 84 | 70 | — | 28 **b** | #FFFFFF | MK |
| `dual-portrait-guest-nameplate` | 772 | 356 | 124 | 28 | #141416 | — | — |  |
| `dual-portrait-guest-name` | 782 | 360 | 104 | 20 | — | 11 **b** | #F6F6F7 | Maya |
| `dual-portrait-guest-mic-dot` | 872 | 280 | 22 | 22 | #141416 | — | — |  |
| `dual-portrait-guest-mic` | 872 | 283 | 22 | 16 | — | 9 **b** | #F6F6F7 | M |
| `landscape-label-shape` | 374 | 397 | 116 | 30 | #2D2D32 | — | — |  |
| `landscape-label-label` | 374 | 400 | 116 | 24 | — | 12 **b** | #F6F6F7 | Landscape |
| `portrait-label-shape` | 774 | 433 | 120 | 30 | #2D2D32 | — | — |  |
| `portrait-label-label` | 774 | 436 | 120 | 24 | — | 12 **b** | #F6F6F7 | Portrait |

### 2.22 Window 22 — Live state

LIVE/REC indicators replace Record+Settings+Go Live; scene edit-mode banner; right panel is the Live tab with stats.

**Chrome:** base *B*, **minus** 43 elements: `record-pill-shape`, `record-pill-label`, `settings-button-shape`, `settings-button-icon`, `go-live-button-shape`, `go-live-button-label`, `copy-invite-shape`, `copy-invite-label`, `sources-backstage`, `source-host-card`, `source-host-avatar`, `source-host-initial`, `source-host-title`, `source-host-subtitle`, `source-host-action-shape`, `source-host-action-label`, `source-guest-card`, `source-guest-avatar`, `source-guest-initial`, `source-guest-title`, `source-guest-subtitle`, `source-guest-action-shape`, `source-guest-action-label`, `sources-media`, `source-screen-card`, `source-screen-avatar`, `source-screen-initial`, `source-screen-title`, `source-screen-subtitle`, `source-screen-action-shape`, `source-screen-action-label`, `source-slides-card`, `source-slides-avatar`, `source-slides-initial`, `source-slides-title`, `source-slides-subtitle`, `source-slides-action-shape`, `source-slides-action-label`, `add-source-shape`, `add-source-label`, `guest-control-label`, `guest-control-track`, `guest-control-knob`.

**Chrome deltas** (vs base *B*):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `status-summary` | 675 | 18 | 330 | 22 | — | 11 | #A3A3AD | 1080p   •   00:18:42   •   148 viewers   •   3 scans |
| `right-panel-title` | 990 | 78 | 210 | 30 | — | 20 **b** | #F6F6F7 | Live |

<sub>Previous values in *B*: `status-summary`="1080p   •   00:00   •   0 viewers   •   0 scans"; `right-panel-title`="Sources"</sub>

**Screen-specific elements** (34):

| element | x | y | w | h | fill (+stroke) | font px | colour | text |
|---|--:|--:|--:|--:|---|--:|---|---|
| `live-indicator-shape` | 1007 | 14 | 76 | 30 | #EF4B55 | — | — |  |
| `live-indicator-label` | 1007 | 17 | 76 | 24 | — | 12 **b** | #FFFFFF | ● LIVE |
| `record-indicator-shape` | 1088 | 14 | 72 | 30 | #2D2D32 + 1px #484850 | — | — |  |
| `record-indicator-label` | 1088 | 17 | 72 | 24 | — | 12 **b** | #EF4B55 | ● REC |
| `end-stream-shape` | 1170 | 10 | 88 | 38 | #EF4B55 | — | — |  |
| `end-stream-label` | 1170 | 12 | 88 | 34 | — | 13 **b** | #F6F6F7 | End |
| `edit-mode-pill-shape` | 203 | 72 | 108 | 30 | #2864F0 | — | — |  |
| `edit-mode-pill-label` | 203 | 75 | 108 | 24 | — | 12 **b** | #F6F6F7 | EDIT MODE |
| `edit-mode-copy` | 324 | 77 | 430 | 20 | — | 11 | #A3A3AD | Changes stay backstage until you switch this scene live. |
| `push-live-shape` | 760 | 70 | 184 | 34 | #2864F0 | — | — |  |
| `push-live-label` | 760 | 72 | 184 | 30 | — | 13 **b** | #F6F6F7 | Switch updated scene |
| `live-preview-border` | 201 | 82 | 748 | 426 | — + 3px #447CFF | — | — |  |
| `on-air-scene-badge-shape` | 20 | 136 | 76 | 30 | #EF4B55 | — | — |  |
| `on-air-scene-badge-label` | 20 | 139 | 76 | 24 | — | 12 **b** | #F6F6F7 | ON AIR |
| `edit-scene-badge-shape` | 98 | 136 | 68 | 30 | #2864F0 | — | — |  |
| `edit-scene-badge-label` | 98 | 139 | 68 | 24 | — | 12 **b** | #F6F6F7 | EDITING |
| `live-clipping-label` | 990 | 134 | 176 | 34 | — | 12 | #F6F6F7 | Live clipping |
| `live-clipping-track` | 1170 | 140 | 40 | 22 | #2864F0 | — | — |  |
| `live-clipping-knob` | 1190 | 143 | 16 | 16 | #FFFFFF | — | — |  |
| `live-marker-shape` | 990 | 186 | 224 | 38 | #7C5CFC | — | — |  |
| `live-marker-label` | 990 | 188 | 224 | 34 | — | 13 **b** | #F6F6F7 | Create highlight marker |
| `live-stats-heading` | 990 | 246 | 150 | 20 | — | 10 **b** | #73737D | LIVE STATUS |
| `live-stat-1-label` | 990 | 278 | 150 | 22 | — | 11 | #A3A3AD | Viewers |
| `live-stat-1-value` | 1140 | 278 | 74 | 22 | — | 14 **b** | #F6F6F7 | 148 |
| `live-stat-1-rule` | 990 | 312 | 224 | 1 | #34343A | — | — |  |
| `live-stat-2-label` | 990 | 336 | 150 | 22 | — | 11 | #A3A3AD | Messages |
| `live-stat-2-value` | 1140 | 336 | 74 | 22 | — | 14 **b** | #F6F6F7 | 36 |
| `live-stat-2-rule` | 990 | 370 | 224 | 1 | #34343A | — | — |  |
| `live-stat-3-label` | 990 | 394 | 150 | 22 | — | 11 | #A3A3AD | QR scans |
| `live-stat-3-value` | 1140 | 394 | 74 | 22 | — | 14 **b** | #F6F6F7 | 3 |
| `live-stat-3-rule` | 990 | 428 | 224 | 1 | #34343A | — | — |  |
| `live-stat-4-label` | 990 | 452 | 150 | 22 | — | 11 | #A3A3AD | Dropped frames |
| `live-stat-4-value` | 1140 | 452 | 74 | 22 | — | 14 **b** | #F6F6F7 | 0 |
| `live-stat-4-rule` | 990 | 486 | 224 | 1 | #34343A | — | — |  |

---

## 3. Consolidated layout metrics

### 3.1 Shell — the five regions

Full-bleed bands, all starting at `y = 58` with `h = 662` (720 − 58):

| region | element | x | y | w | h | fill |
|---|---|--:|--:|--:|--:|---|
| header | `header-bg` | 0 | 0 | 1280 | **58** | `#141416` |
| scene rail | `scene-rail-bg` | 0 | 58 | **182** | 662 | `#111113` |
| stage | `stage-area` | 182 | 58 | **788** | 662 | `#0F0F10` |
| right panel | `right-panel-bg` | 970 | 58 | **266** | 662 | `#141416` |
| tool rail | `tool-rail-bg` | 1236 | 58 | **44** | 662 | `#111113` |

`182 + 788 + 266 + 44 = 1280` — the four columns tile the frame exactly, no gutters.

| metric | value |
|---|---|
| header height | **58** |
| scene-rail width | **182** |
| stage width | **788** |
| right-panel width | **266** (content column 224, see 3.4) |
| tool-rail width | **44** |
| body height | **662** |

### 3.2 Header (`y 0..58`)

| item | x | y | w | h | notes |
|---|--:|--:|--:|--:|---|
| `restream-logo-word` | 20 | 17 | 104 | 24 | 16px bold `#F6F6F7` |
| `restream-logo-studio-tag` | 125 | 18 | 61 | 22 | `#2D2D32` pill, 11px bold label |
| `stream-title` | 200 | 11 | 235 | 23 | 14px bold |
| `stream-title-pencil` | 438 | 12 | 24 | 22 | 14px `#A3A3AD` |
| `channels-pill-shape` | 476 | 14 | 86 | **30** | `#2D2D32`, 12px bold label |
| `schedule-pill-shape` | 570 | 14 | 88 | **30** | `#2D2D32`, 12px bold label |
| `status-summary` | 675 | 18 | 330 | 22 | 11px `#A3A3AD`, centred |
| `record-pill-shape` | 1010 | 14 | 75 | **30** | `#2D2D32` + 1px `#484850` |
| `settings-button-shape` | 1095 | 10 | **38** | **38** | square icon button |
| `go-live-button-shape` | 1144 | 10 | 114 | **38** | `#2864F0`, 13px bold |

Live variant (window 22) replaces the last three with `live-indicator` 1007,14,76,30 `#EF4B55`;
`record-indicator` 1088,14,72,30 `#2D2D32` with `#EF4B55` text; `end-stream` 1170,10,88,38 `#EF4B55`.

Header rhythm: the pill row is vertically centred on `y = 29` (14 + 30/2), and the 38px buttons at
`y = 10` share that centre (10 + 38/2 = 29). Right margin = 1280 − (1144 + 114) = **22**.

### 3.3 Scene rail (`x 0..182`)

| item | x | y | w | h |
|---|--:|--:|--:|--:|
| `add-scene-button-shape` | 16 | 76 | **150** | **38** |
| `scene-N-selection` | 12 | 126 + 105·(N−1) | **158** | **94** |
| `scene-N-thumb` | 20 | selection.y + 8 | **142** | **62** |
| `scene-N-accent` (circle) | 30 | selection.y + 19 | 32 | 32 |
| `scene-N-title` | 70 | selection.y + 18 | 82 | 19 |
| `scene-N-subtitle` | 70 | selection.y + 41 | 82 | 20 |
| `scene-N-more` (⋮) | 145 | selection.y + 71 | 18 | 18 |

Scene card pitch **105** (94 card + 11 gap); cards 1..5 at y = 126, 231, 336, 441, 546.
Active card fill `#2D2D32` + 2px `#447CFF` stroke; inactive card has neither fill nor stroke.
Thumb fill `#242428`. Accent circle colours in order: `#2864F0`, `#7C5CFC`, `#EF4B55`, `#43C7E8`, `#24C875`.

### 3.4 Right panel (`x 970..1236`)

| metric | value |
|---|---|
| panel background | `#141416`, `x 970 w 266` |
| content left edge | **990** (= 970 + 20) |
| content width | **224** |
| content right edge | 1214 → right padding **22** |
| panel title | `990, 78, 210, 30` — 20px bold `#F6F6F7` |
| divider under title | `986, 118, 234, 1` — `#34343A` |
| first content row | `y = 128..134` |

Every right-panel control is 224 wide or a sub-division of it:

| element class | w x h | fill |
|---|---|---|
| primary button (Copy Invite Link, Add source, Graphics more) | 224 x **36** / **34** | `#2864F0` / `#2D2D32` |
| person source card | 224 x **66** | `#1C1C1F` + 1px `#34343A` |
| media source card | 224 x **62** | `#1C1C1F` + 1px `#34343A` |
| chat message card | 224 x **90** | `#1C1C1F` |
| caption (lower-third) card | 224 x **91** | `#1C1C1F` |
| ticker card | 224 x **70** | `#1C1C1F` |
| QR card | 224 x **162** | `#1C1C1F` |
| presentation file card | 224 x **142** | `#1C1C1F` |
| notes editor | 224 x **354** | `#1C1C1F` |
| select / text field | 224 x **40** (chat reply 224 x 42) | `#1C1C1F` |
| thumbnail tile (logo, overlay, theme, countdown style) | **102 x 66**, label 102 x 18 at +72 | varies |
| section heading (`BACKSTAGE`, `LOGOS`, `TICKER`, …) | 10px bold `#73737D` | — |
| horizontal rule | 224 x 1 | `#34343A` |

Thumbnail grid: 2 columns at x = 990 and 1102 (pitch **112**), row pitch **96** (66 tile + 18 label + 12 gap).

Source-card internals (`y0` = card top):

| part | dx | dy | w | h |
|---|--:|--:|--:|--:|
| avatar circle | 12 | 13 | 34 | 34 |
| title | 56 | 12 | 119 | 20 (12px bold) |
| subtitle | 56 | 36 | 119 | 18 (10px `#A3A3AD`) |
| action pill | 168 | 20 | 44 | 30 |

### 3.5 Tool rail (`x 1236..1280`)

| metric | value |
|---|---|
| rail width | **44** |
| button | **30 x 30** circle at `x = 1243` (7px inset each side) |
| first button y | **84** |
| vertical pitch | **58** |
| buttons | Sources 84, Chat 142, Graphics 200, Theme 258, Captions 316, QR 374, Notes 432 |
| help button | `1243, 668, 30, 30` (roundRect) |
| active fill | `#2864F0` + 1px `#447CFF` |
| inactive fill | `#242428` + 1px `#34343A` |
| icon type | 11px bold (two-letter glyphs `CC` / `QR` drop to 8px) |

### 3.6 Stage and canvas

| metric | value |
|---|---|
| stage box | `182, 58, 788, 662` |
| canvas frame | `205, 86, **742 x 418**` |
| canvas aspect | 742 / 418 = **1.7751** (true 16:9 at w 742 would be h 417.375 — 0.6px off) |
| stage padding | left **23**, right **23**, top **28** |
| canvas fill / stroke | `#1C1C1F` + 1px `#34343A` |
| canvas watermark | `842, 474, 84, 18` — 10px bold `#A3A3AD`, right-aligned |

Two-up camera layout inside the canvas:

| item | x | y | w | h |
|---|--:|--:|--:|--:|
| `host-video` | 228 | 112 | **337** | **366** |
| `guest-video` | 586 | 112 | **337** | **366** |
| gap between tiles | — | — | **21** | — |
| avatar halo (circle) | tile centre | tile.y + 111 | 110 | 110 |
| avatar (circle) | tile centre | tile.y + 124 | 84 | 84 |
| initials | — | — | 28px bold `#FFFFFF` | — |
| nameplate | tile.x + 12 | tile.y + 324 | 145 | 28 (`#141416`) |
| mic dot (circle) | tile.right − 36 | tile.y + 14 | 22 | 22 (`#141416`) |
| lower third | 246 | 417 | 288 | 48 (`#2864F0`) |

Tile insets from the canvas frame: 23 left, 24 right, 26 top, 26 bottom (the 1px L/R asymmetry is in
the capture, not intentional).

Alternate stage contents:

* **Countdown** (w16): `countdown-backdrop 216, 97, 720 x 396` (no fill and no stroke recorded — the
  translucent backdrop did not survive the capture); kicker 16px, time **78px** bold, subtitle 22px.
* **Presentation** (w17): white slide `230, 110, 540 x 360` (3:2) with a 540 x 16 accent bar;
  presenter PiP `788, 318, 135 x 152`; page pill `654, 430, 96 x 30`.
* **Dual output** (w21): landscape `222, 110, 490 x 276` (16:9, 2px `#447CFF`),
  portrait `744, 102, 180 x 320` (9:16, 2px `#7C5CFC`).
* **Live** (w22): `live-preview-border 201, 82, 748 x 426` — a 3px `#447CFF` ring 4px outside the
  canvas frame; plus an edit-mode banner row at `y = 70..104`.

### 3.7 Layout switch row and control bar

Layout row (`y = 518`):

| item | x | y | w | h |
|---|--:|--:|--:|--:|
| `Layout` label | 210 | 525 | 56 | 24 (11px bold `#A3A3AD`) |
| layout button 1..7 | 272 + 48·(n−1) | 518 | **38** | **38** |
| customize button | 628 | 518 | 38 | 38 |
| `Customize` label | 674 | 524 | 74 | 24 |

Button pitch **48** (38 + 10 gap). Active `#2864F0`, inactive `#2D2D32`.

Control bar (`y = 590`):

| item | x | y | w | h |
|---|--:|--:|--:|--:|
| Mic | 320 | 590 | **50** | **50** |
| Camera | 402 | 590 | 50 | 50 |
| Share | 484 | 590 | 50 | 50 |
| Invite | 566 | 590 | 50 | 50 |
| More | 648 | 590 | 50 | 50 |
| label (each) | circle.x − 7 | 646 | 64 | 20 (10px `#A3A3AD`, centred) |
| device status line | 248 | 682 | 636 | 22 (10px `#73737D`, centred) |

Circle pitch **82** (50 + 32 gap). Row spans 320..698, midpoint **509**; the stage midpoint is 576, so
the control bar sits **67px left of stage centre** in the capture (see 4.5).
Enabled buttons `#2D2D32`, disabled `#242428`, all with a 1px `#484850` ring.

### 3.8 Modals

All modals are horizontally centred in the 1280 frame and sit on a four-piece scrim of `#09090A`
(`*-dim-top / -left / -right / -bottom` rects that tile the frame around the shell).

| modal | window | x | y | w | h | shell |
|---|--:|--:|--:|--:|--:|---|
| Add Scene | 03 | 365 | 118 | **550** | 472 | `#141416` + 1px `#484850` |
| Add Media Scene | 04 | 300 | 68 | **680** | 584 | `#141416` |
| Settings (General / Video / Audio) | 12–14 | 330 | 76 | **620** | 570 | `#141416` |
| Invite Guests | 18 | 350 | 116 | **580** | 480 | `#141416` |
| Stream details | 19 | 330 | 70 | **620** | 585 | `#141416` |
| Channels & Schedule | 20 | 250 | 78 | **780** | 566 | `#141416` |

Common modal chrome (offsets from the shell origin):

| part | dx | dy | size | type |
|---|--:|--:|---|---|
| title | +28 | +24 | h 34 | **24px bold** `#F6F6F7` |
| subtitle | +28 | +62 | h 32 | 12px `#A3A3AD` |
| close button | w − 54 | +20 | **34 x 34** | `#2D2D32`, 15px `×` |

Chooser rows: Add Scene 480 x **82** at pitch 100 (x 400); Add Media 290 x **88** in a 2-column grid,
columns at x 338 / 648 (pitch 310), rows at pitch 105.

Settings modal internals: nav panel `348, 182, 150 x 442` `#111113`; active tab chip **126 x 40** at
x 360 with tab pitch **54**; tab label 12px at x 378; content column `x 526, w 392`; content heading
19px bold; field label 11px bold `#A3A3AD`; field **392 x 42**; toggle column at x 874.

Channels & Schedule: two columns `280, 170, 350 x 420` and `650, 170, 350 x 420`, fill `#1C1C1F`;
column heading 18px bold; channel row pitch **72**; channel icon 38 x 38 circle.

### 3.9 Control primitives

| primitive | size (capture) | fill |
|---|---|---|
| primary button (panel width) | 224 x **36** | `#2864F0` |
| secondary button (panel width) | 224 x **34 / 32** | `#2D2D32` |
| header CTA | 114 x **38** | `#2864F0` |
| header pill | 75–88 x **30** | `#2D2D32` |
| icon button (square) | **38 x 38** / **36 x 36** / **34 x 34** | `#2D2D32` |
| small action pill (`On`/`Off`, `Show`/`Hide`) | 44 x **30**, 70 x **26**, 88 x **32** | `#2D2D32` / `#2864F0` |
| segmented tab (`All`, `Pinned 2`) | 58 / 94 x **30** | active `#2864F0` |
| modal footer button | 92–160 x **36 / 38** | `#2D2D32` / `#2864F0` |
| text / select field (panel) | 224 x **40** | `#1C1C1F` |
| text field (modal) | 500–540 x **44** | `#1C1C1F` |
| textarea (modal) | 540 x **112** | `#1C1C1F` |
| settings field | 392 x **42** (short 188 x 38) | `#1C1C1F` |
| toggle track | **40 x 22** pill | on `#2864F0`, off `#2D2D32` |
| toggle knob | **16 x 16** circle `#FFFFFF` | off dx +4, on dx +20 (travel 16) |
| slider track | 224 x **5** | `#2D2D32`, fill `#2864F0` |
| slider knob | **15 x 15** circle | `#FFFFFF` |
| checkbox | **18 x 18** roundRect | `#2864F0` + 11px `✓` |
| colour swatch | **28 x 28** circle | pitch 37 |
| audio meter segment | **12 x 52** roundRect | pitch 19; lit `#24C875`, dim `#2D2D32` |
| avatar — stage | **84** circle (halo 110) | `#2D2D32` |
| avatar — source card | **34** circle | accent |
| avatar — chat platform | **24** circle | platform accent |
| avatar — channel row | **38** circle | platform accent |
| avatar — chooser row | **52** circle | accent |

### 3.10 Corner radii per element class

The capture stores only `rect` / `roundRect` / `ellipse` and records **no radius**. These values come
from the production CSS (provenance in section 4):

| element class | radius | CSS source |
|---|--:|---|
| design-system token scale | 2 / 4 / 6 / 8 / 12 / 16 / 20 | `--border-radius-50 … --border-radius-500` |
| **default surface radius** | **8px** | `common.$conceptRadius: 8px`; `border-radius:8px` appears 551x in the bundles — the single most common value |
| panel / sidebar container | 8px | `HostPage .root__sidebar` |
| stage preview container | 8px (`8px 8px 0 0` outside scenes mode) | `Player .previewContainer` |
| scene thumbnail | **6px** (selection ring 11px = 6 + 5 outset, 2px wide) | `SceneItem $previewRadius`, `$previewRingOutset: 5px` |
| scene card (desktop) | `0 8px 8px 0` | `SceneItem .root` |
| scene card (mobile) | 14px (= 6 + 8) | `SceneItem $mobileCardRadius` |
| add-scene button | **9999px** (pill) | `AddSceneButton .addSceneButton` |
| tool-rail container | 8px | `HostSidebarV2 .verticalTabs` |
| tool-rail tab | **6px** | `HostSidebarV2 .verticalTab` |
| tool-rail content wrapper | 20px (inner content 12px) | `.verticalTabContentWrapper`, `.verticalTabContent` |
| header session button (Go Live / End) | **20px** | `SessionControls_actionButton` |
| header icon button | **50%** | `SessionControls_iconButton` |
| header status pill | 3.679px | `LogoAndStatus_statContainer` |
| header recording status chip | 99rem | `SessionControls_recordingStatus` |
| player / control-bar button | **50%** | `playerButton.mixin @mixin button` |
| floating control-bar container | 999rem | `HostPage .controlsNoWrap` |
| layout-switch button | **4px** | `LayoutSwitch .button` |
| caption / list option | **6px** | `CaptionOption_button` |
| QR / image option | **8px** / 6px | `QrCodeOption_button`, `ImageOption_button` |
| chat message bubble | **12px** | `ChatMessage_content` |
| settings tab button | 8px | `SettingsTabButton .root` |
| settings input / select | **4px** | `SettingsInputField .input`, `SettingsSelectField .input` |
| settings popover body | 12px | `PlayerControls .settings` |
| toggle track | 36px (pill) | `Togglik_slider` |
| toggle knob | 50% | `Togglik_slider::before` |
| slider track | 99px | `SimpleSlider` |
| preview / asset thumbnail | 6px | `BackgroundAsset_preview`, `ResourcePicker_thumbnail`, `WidgetAsset_preview` |
| theme preview tile | 8px | `ThemePreviewButton_scenesMode` |
| badge / chip | 3px (tab badge), 999px (editing badge) | `tabButtonBadge`, `editingBadge` |
| scene preview (`SceneItemPreview`) | 8px | `SceneItemPreview .root` — note it disagrees with `SceneItem` 6px |

### 3.11 Type scale actually used

Every distinct `resolvedTextStyle.fontSize` across the 22 captures, with occurrence counts:

| px | uses | role |
|--:|--:|---|
| 8 | 42 | two-letter rail glyphs (`CC`, `QR`) |
| 9 | 45 | mic glyph, notes counter, chat platform initial |
| 10 | 424 | section headings (bold `#73737D`), sub-labels, control-bar labels, card subtitles |
| 11 | 272 | secondary labels, field labels (bold `#A3A3AD`), nameplates, status summary |
| 12 | **456** | list titles, tab labels, toggle-row labels, pill labels — the workhorse size |
| 13 | 215 | button labels, field values |
| 14 | 181 | stream title, media-choice titles, live stat values |
| 15 | 227 | icon glyphs (⚙ × ‹ › ▦ …), scene-choice titles |
| 16 | 33 | logo wordmark, presentation panel heading, countdown kicker |
| 17 | 4 | chooser icon letters, thumbnail text |
| 18 | 5 | panel headings (Customize, Countdown), modal column headings, presentation body |
| 19 | 3 | settings content heading |
| 20 | 24 | right-panel title, chooser chevrons |
| 22 | 1 | countdown subtitle |
| 24 | 9 | **modal titles**, settings video-preview initials |
| 25 | 1 | lobby device heading |
| 27 | 1 | lobby heading |
| 28 | 41 | stage avatar initials |
| 36 | 1 | presentation slide title |
| 72 | 1 | lobby camera-off glyph |
| 78 | 1 | countdown numerals |

Weights: two only, bold and regular. Alignment: `left` (default), `center` (buttons, glyphs, badges),
`right` (watermark, notes counter, stat values, slider values). Typeface in the capture is `Arial`
throughout; see 4.7 for the real stack.

### 3.12 Palette

| role | hex | uses |
|---|---|--:|
| page background | `#0F0F10` | stage + slide bg (21) |
| lobby background | `#19191A` | window 01 only |
| header / right-panel surface | `#141416` | 132 |
| rail surface (scene rail, tool rail, settings nav) | `#111113` | 45 |
| raised surface / card | `#1C1C1F` | 106 |
| control / chip surface | `#2D2D32` | **496** |
| recessed / inactive surface | `#242428` | 360 |
| hairline / divider | `#34343A` | 27 (also the 1px stroke on cards and the canvas) |
| control ring | `#484850` | 1px stroke on buttons, fields, chooser rows |
| modal scrim | `#09090A` | 32 |
| accent (primary) | `#2864F0` | **192** |
| accent ring | `#447CFF` | 2–3px selection strokes |
| purple | `#7C5CFC` | 73 (guest, presentation, AI) |
| red | `#EF4B55` | 30 (live, record, countdown scene) |
| green | `#24C875` | 36 (`On` state, audio meter) |
| cyan | `#43C7E8` | 34 (video / screen scene) |
| amber | `#F4C84A` | star, browser source |
| text primary | `#F6F6F7` | 1099 |
| text secondary | `#A3A3AD` | 555 |
| text tertiary / section heading | `#73737D` | 54 |
| text on accent | `#FFFFFF` | 235 |
| text on accent (muted) | `#DDE7FF` | 18 (lower-third subtitle) |

---

## 4. Cross-check against the production CSS

The extracted source maps under `03-deep-static/source-maps/extracted/131.3055c017c9fa437e.css__4dd2e50e2a7e/`
and `.../575.e1ef7107da9191b7.css__b73ea12b79f6/` are the real Studio client
(`scripts/entries/Host/HostPage`, `scripts/modules/{ScenesSidebar,Sidebar,SourcesDeck,Player,Settings,…}`).
Where the reconstruction and the CSS disagree, **the CSS wins**.

### 4.0 The canonical layout variables

`scripts/styles/common.scss` — the whole shell is derived from these:

```scss
// source deck (left "streams" column)
$conceptStreamSourceWidth: 224px;
$conceptStreamSourceHeight: 126px;      // 16:9

// page / concept
$conceptVerticalSpace:   12px;
$conceptHorizontalSpace: 16px;
$conceptBlockPadding:    16px;
$conceptSidebarWidth:   360px;          // right panel content
$conceptRadius:           8px;

// scenes mode
$scenesSourcesV2Width:   64px;
$scenesSourcesV3Width:   61px;
$scenesSidebarWidth:    168px;          // scene rail
$verticalSidebarTabHeaderHeight: 48px;

// private chat / player controls
$privateChatDesktopWidth:     328px;
$playerControlsDesktopWidth:  432px;
```

`HostPage.module.scss` desktop grid (`@media (min-width: 1080px) and (min-height: 660px)`):

```scss
grid-template-areas:
  'header header header header'
  'streams scenes player sidebar'
  'streams scenes player sidebar';
grid-template-columns:
  ($conceptStreamSourceWidth + $conceptHorizontalSpace*2)   // 256px source deck
  ($scenesSidebarWidth + $conceptHorizontalSpace)           // 184px scene rail
  1fr                                                       // stage
  ($conceptSidebarWidth + $conceptHorizontalSpace*2);       // 392px right panel
grid-template-rows: max-content 1fr;
```

With `hideSourceDeck` (the state the captures depict) the first column drops and the grid becomes
`184px | 1fr | 392px`.

### 4.1 Shell metrics — capture vs CSS

| metric | capture | production CSS | source | verdict |
|---|--:|--:|---|---|
| header height | 58 | **56** | `HostPage .root__header { height: 56px }` (both mobile and `viewport.desktop`) | CSS: 56. The 64px in `grid-template-rows` is the *row*, the header itself is 56 |
| header inner control row | — | **44** | `HostHeaderV2 .root { height: 44px }` | 44px control row centred in the 56px band |
| header horizontal padding | 20 (logo x) | **16** | `padding: 0 $conceptHorizontalSpace` | CSS: 16 |
| scene-rail column | 182 | **184** = 168 + 16 | `$scenesSidebarWidth`, `HostPage` grid | CSS: rail content 168, gutter 16 |
| right-panel column | 266 | **392** = 360 + 2x16 | `$conceptSidebarWidth`, `.verticalTabContainer { min-width: 360px }` | **Large disagreement** — the capture's panel is 126px too narrow |
| right-panel content width | 224 | **360** | `.verticalTabHeader { min-width: 360px }` | 224 is actually `$conceptStreamSourceWidth` (the *source-deck card* width), used in the wrong place |
| tool-rail width | 44 | **64** | `HostSidebarV2 .verticalTabs { width: 64px }`, also `$scenesSourcesV2Width: 64px` | CSS: 64 |
| tool-rail tab | 30x30 circle, pitch 58 | **56 x 56**, radius 6, gap 4, container padding 4 → pitch **60** | `.verticalTab` | CSS: square 56 tiles, not circles |
| source-deck column (absent from capture) | — | **256** = 224 + 2x16 | `HostPage` grid | the captures all depict `hideSourceDeck` |
| stage column | 788 | `1fr` (= 1280 − 184 − 392 = **704** at 1280px) | `HostPage` grid | CSS: 704 |
| page padding | 0 | `padding: 0 !important` on desktop | `HostPage .root` | agrees |
| region gutters | 0 | 16px horizontal / 12px vertical margins between areas | `.root__scenes`, `.root__sidebar`, `.root__streams` | capture tiles with no gutters; CSS has 16px gutters |

**Corrected shell at 1280x720** (CSS-authoritative):
`0..184` scene rail (168 content + 16 gutter) · `184..888` stage · `888..1280` right panel
(360 content + 2x16) with the 64px vertical tab rail living *inside* the right-panel area,
`row-reverse` (`.verticalTabsContainer { flex-direction: row-reverse; margin: 0 16px 12px }`).
Header band 56px.

### 4.2 Scene rail

| item | capture | production CSS | source |
|---|--:|--:|---|
| rail content width | 182 | **168** | `$scenesSidebarWidth` |
| scene thumbnail | 142 x 62 (2.29:1) | **128 x 72** (16:9) | `SceneItem $previewWidth: 128px`, `.preview { height: 72px }`, `SceneItemPreview .root` |
| thumbnail radius | n/a | **6px** (`SceneItem`) / 8px (`SceneItemPreview`) | internal disagreement in the CSS itself |
| selection ring | 2px `#447CFF`, on the card | **2px** ring 5px *outside* the thumb, radius 11px | `$previewRingOutset: 5px`, `$previewRingWidth: 2px` |
| card padding | card 158 x 94 | `padding: 6px 0 10px 16px`, `border-radius: 0 8px 8px 0`, `margin-bottom: 2px` | `SceneItem .root` |
| list gap | 11 (pitch 105) | **12** (`.scenes { gap: 12px }`), scroll padding `11px 3px 14px 0` | `ScenesSidebar` |
| scene title | 12px bold | **12px / 500 / line-height 18px** | `SceneItem @mixin title-type` |
| add-scene button | 150 x 38 | **128 x 36**, `border-radius: 9999px`, `padding: 8px 14px 8px 10px`; icon-only 36 x 36 | `AddSceneButton` |
| add-scene label | 13px bold, mixed case | **11px, uppercase, letter-spacing 0.5px** (button font-size 14/20) | `.addSceneText` |
| active colour | `#447CFF` / `#2864F0` | `token('color-accent-normal')` = **`#004eeb`** (blue theme `#0040c1`) | `themes-styles` |
| **on-air colour** | not modelled (`#EF4B55` used for LIVE) | **`#fb4408`** (`$onAirAccent`), recording dot `#fb440a` | `SceneItem`, `SessionControls` |
| badges | not modelled | `ACTIVE` / `ON AIR` / `EDITING` pills, 10px/600, uppercase, letter-spacing 0.04em, radius `11px 0 10px`; marching-ants SVG ring while editing | `SceneItem .activeBadge/.onAirBadge/.editingBadge/.editingAnts` |

### 4.3 Right panel and tool rail

| item | capture | production CSS | source |
|---|--:|--:|---|
| panel title | 20px bold | **16px / 500** for the sidebar title and vertical-tab header; **20px / 500** for section headings such as Captions | `HostSidebarV2 .title`, `.verticalTabHeader`, `CaptionsSection_heading` |
| panel container padding | 20 left / 22 right | `padding-left: 16px; padding-right: 16px; padding-top/bottom: 12px` | `.verticalTabContainer` |
| panel radius | n/a | **8px** container, **20px** tab-content wrapper, 12px inner content | `.root__sidebar`, `.verticalTabContentWrapper`, `.verticalTabContent` |
| tool-rail tab label | 11px bold | **11px / 400 / line-height 12px**; inner composition font-size 10px | `.verticalTab` |
| tool-rail icon | glyph letter | **24 x 24** (Lucide variant 20 x 20) | `.iconLabel` |
| active tab | `#2864F0` fill | `background-color: token('color-white-thin-rollover')` = **rgba(255,255,255,0.15)**, text `#fff` — *not* accent-filled | `.verticalTab--active` |
| card / list option | 224 x 62–91, radius n/a | caption option **min-height 48**, `padding: 10px 14px`, radius **6px**, font **13px**; QR/image option radius **8px** | `CaptionOption_button`, `QrCodeOption_button`, `ImageOption_button` |
| chat message | card 224 x 90, avatar 24 | avatar **36 x 36** circle + 13px gutter; bubble radius **12px**, `padding: 6px 10px`, 2px transparent border | `ChatMessage_avatarWrapper`, `ChatMessage_content` |
| section "add" button | 62 x 32 | **height 36**, `padding: 8px 14px`, radius **8px**, 14px/500 | `CaptionsSection_addButton` |
| theme preview tile | 102 x 66 | **76 x 48** (compact), radius 8px, grid gap 8px | `ThemePreviewButton_compactDesign`, `ThemeSelect_root` |
| graphics tile grid | 2 cols, pitch 112 | `display: inline-flex; gap: 8px; flex-wrap: wrap` — flow layout, not a fixed 2-col grid | `ImageSelect_root` |
| source-deck card | n/a (panel cards 224 x 62/66) | **224 x 126** (16:9); fullscreen deck `width: calc(224px + 40px)`, radius 12px | `$conceptStreamSource*`, `SourcesDeck_isFullscreen` |

### 4.4 Stage / canvas

| item | capture | production CSS | source |
|---|--:|--:|---|
| canvas aspect | 742 x 418 = 1.7751 | **exactly 16:9** | `aspect-ratio: 16/9` (11 rules), `$aspectRatio16to9: math.div(16, 9)` |
| canvas radius | n/a | **8px** in scenes mode; `8px 8px 0 0` otherwise | `Player .previewContainer` |
| reserved controls height | 132 below canvas (518→720 minus canvas) | `--controls-height: 128px` default, **160px in scenes mode**, 72px playlist, 0 fullscreen | `Player .previewContainer` |
| stage top margin | 28 | **16** (`.root__player { margin-top: 16px }` in scenes mode) | `HostPage` |
| dual output | landscape 490 x 276 + portrait 180 x 320 (unequal heights) | landscape and portrait are laid out to **equal height**: `--proportional-width: calc((100cqw - 6px) * 256/337)` → 256u landscape + 81u portrait, both 144u tall; gap **6px** | `DualPreview_landscapeTitleCell`, `DualPreview_columnsWrapper` |
| countdown numerals | 78px bold | **72px / 500** (`Countdown_live`), portrait 28px; backdrop `rgba(0,0,0,.5)` radius `8px 8px 0 0` | `Countdown_live`, `Countdown_backdrop` |
| countdown backdrop fill | **absent in the capture** (no fill, no stroke) | `background: rgba(0,0,0,.5)` | `Countdown_backdrop` — use this |

### 4.5 Control bar and layout switch

| item | capture | production CSS | source |
|---|--:|--:|---|
| control-bar button | **50 x 50**, pitch 82 | **40px** default (`--player-button-size`), **48 x 48** at `min-width: 431px`; `border-radius: 50%` | `playerButton.mixin @mixin button` |
| control-bar gap | 32 | **8px** (`gap: 8px`; 6px in the floating pill) | `PlayerControls .root`, `HostPage .controlsNoWrap` |
| control-bar alignment | left of stage centre by 67px | `justify-content: center` — **centred** | `PlayerControls .root` |
| control-bar height | ~112 incl. labels | **64px** (`$controlsHeight`), floating variant `--player-button-size: 44px`, `bottom: 12px` | `HostPage` |
| control-bar container | none | floating pill: `padding: 8px`, `gap: 6px`, `border-radius: 999rem`, `outline: 1px solid token('color-white-thin')` | `HostPage .controlsNoWrap` |
| per-button text labels | yes (10px under each) | **none** — labels are tooltips only | `ButtonWithTooltip` |
| layout-switch button | 38 x 38, pitch 48 | **64 x 36** desktop (`$buttonWidth: 64px`, height = 64 x 0.5625); portrait variant 36 x 64; radius **4px**; gap **8px**; `padding: 4px` on the row | `LayoutSwitch` |
| layout active state | accent fill | `opacity: 1` + `box-shadow: 0 0 0 3px token('color-accent-normal')`; inactive `opacity: .7` | `LayoutSwitch .button.active` |
| add-source button | n/a | **48 x 48** | `AddSourceButton_root`, `InviteGuestsButtonWithPopover_root` |

### 4.6 Controls, fields, modals

| item | capture | production CSS | source |
|---|--:|--:|---|
| **toggle track** | 40 x 22 | **36 x 20**, `border-radius: 36px`, `border: 1px solid` | `Togglik_root`, `Togglik_slider` |
| **toggle knob** | 16 x 16, travel 16 | **12 x 12**, `left: 4px; bottom: 3px`, `transform: translateX(14px)` when checked | `Togglik_slider::before` |
| toggle on / off colour | `#2864F0` / `#2D2D32` | on `var(--theme-dark-color-accent-normal)` = `#004eeb`; off `color-black-thick` + 1px `color-white-normal` border | `Togglik_slider` |
| **button height (default)** | 34–38 | **36px** | `Button-module__sizeDefault` |
| icon button | 34–38 square | **28 x 28** (`sizeIcon`), 36 x 36 (header/session), 48 x 48 (player) | `Button-module__sizeIcon`, `SessionControls_iconButton` |
| header session button | 114 x 38, radius n/a | **min-width 94, height 36, radius 20px**, 12px/500 uppercase, letter-spacing 0.5px | `SessionControls_actionButton` |
| header stat pill | 330 x 22 text run | `height: 24px`, `padding: 0 8px`, `gap: 4px`, `border-radius: 3.679px`, bg `rgba(0,0,0,.2)`, border `.5px rgba(255,255,255,.05)` | `LogoAndStatus_statContainer` |
| header elapsed-time type | 11px | **12px / 500**, uppercase, letter-spacing 0.5px, `font-variant-numeric: tabular-nums` | `LogoAndStatus_elapsedTime` |
| **input height** | 40 / 42 / 44 | **42** computed (`padding: 10px 12px` + 14px/1.4 text + 2px border), radius **4px**, border 1px `#a5adba` | `SettingsInputField_input`, `SettingsSelectField_input` |
| input label | 11px bold `#A3A3AD` | **14px / 400**, `margin-bottom: 8px`, colour `#8993a4` | `SettingsInputField_label` |
| **slider track** | 224 x 5 | **4px** high, radius 99px, `rgba(255,255,255,.24)`; progress `#ebecf0`; 24px hit area | `SimpleSlider_root::-moz-range-track` |
| checkbox | 18 x 18 | **18 x 18**, `accent-color: #3b82f6` | `Schedule_checkbox` — agrees |
| **standard modal width** | 550 / 580 / 620 / 680 / 780 | **500px** is the house width (30 occurrences); 800px for the settings modal; 400 / 328 for small dialogs | bundle-wide `width:500px`; `SettingsModal .root` |
| **settings modal** | 620 x 570 | **800 x 613** (`@media min-width: 576px`), `padding-left: 12px`, `padding-right: 2px` | `SettingsModal .root` |
| settings header | 24px bold | **22px / 600**, line-height 1.3, `margin-bottom: 12px` | `SettingsModal $headerFontSize` |
| settings tab button | 126 x 40 chip, pitch 54 | **min-height 40, min-width 220**, `padding: 8px 12px`, radius **8px**, 14px/400 (active 500) | `SettingsTabButton .root` |
| settings tab icon | none | 18 x 18, `margin-right: 8px`; chevron 16 x 16 | `SettingsTabButton .icon` |
| settings content column | 392 | `flex-basis: 400px`, `padding-left/right: 24px` | `SettingsModal .content/.tabContent` |
| settings field spacing | ~68 pitch | `.field + .field { margin-top: 16px }`, secondary fieldset `margin-top: 24px` | `SettingsModal` |
| modal close button | 34 x 34 top-right | `padding: 4px; margin: 12px`, radius 6px | `BaseDialog .controlButton` |

### 4.7 Typography and colour system

| item | capture | production CSS |
|---|---|---|
| typeface | `Arial` (capture artefact) | **`Graphik, sans-serif`** (fallback `Graphik, Helvetica, Arial, sans-serif`); mono `IBM Plex Mono` / `ui-monospace` |
| dominant body size | **12px** (456 uses) | **14px** (733 uses) — the reconstruction sits one step small throughout |
| real size histogram | see 3.11 | 14 (733) · 12 (283) · 16 (161) · 13 (134) · 20 (70) · 11 (70) · 10 (69) · 24 (38) · 18 (36) · 22 (32) · 9 (32) · 15 (28) · 28 (21) · 8 (16) |
| line heights | not recorded | 20px (335) · 1.4 (122) · 1.5 (120) · 24px (104) · 16px (85) · 18px (42) · 12px (44) |
| weights | bold / regular | 400 / 500 / 600 (500 is the UI default, 600 for headings and badges) |
| page background | `#0F0F10` | **`#1a1a1a`** (`--theme-dark-background`); gradient variant `linear-gradient(180deg, #000 0%, #2b2d31 100%)` |
| accent | `#2864F0` | **`#004eeb`** (`--theme-dark-color-accent-normal`); rollover `#6695f3`, pressed `#002f8d`. Blue theme uses `#286fff` / `#0040c1` |
| on-air / live | `#EF4B55` | **`#fb4408`** (scene on-air), `#fb440a` (recording dot), `#ef4444` (record button), `#ff7d56` (go-live text) |
| surfaces | opaque `#242428` / `#2D2D32` / `#34343A` | **alpha over `#1a1a1a`**: `color-white-thin` = rgba(255,255,255,0.05), `color-white-normal` = rgba(255,255,255,0.15), `color-white-thin-rollover` = rgba(255,255,255,0.15); solid fallbacks `#2b2a2a`, `#414141`, `#1a1919` |
| approximate mapping | `#242428` ≈ white 5% over `#1a1a1a` (`#252525`) — good; `#2D2D32` ≈ white 8%; `#34343A` ≈ white 11%; `#414141` (white 15%) is *lighter* than anything in the capture | — |
| text colours | `#F6F6F7` / `#A3A3AD` / `#73737D` | `color-white-solid` `#fff`, `color-white-thick` rgba(255,255,255,0.8), `color-white-muted` rgba(255,255,255,0.5); legacy blue-theme greys `#edf0f3`, `#bac1cc`, `#97a0af`, `#6b778c` |

### 4.8 Summary of disagreements (CSS is authoritative)

Ordered by how much they affect pixel fidelity:

1. **Right panel is 392px wide (360 content), not 266 (224 content).** The capture reused
   `$conceptStreamSourceWidth: 224px` — the source-deck card width — as the panel content width.
2. **Tool rail is 64px wide with 56x56 rounded-6px tabs**, not 44px with 30px circles, and it lives
   inside the right-panel area (`flex-direction: row-reverse`), not as a separate 5th column.
3. **Scene rail content is 168px** (+16px gutter = 184 column), not 182; scene thumbnails are
   **128 x 72 (16:9)**, not 142 x 62.
4. **Header is 56px**, not 58; the control row inside it is 44px; horizontal padding 16px, not 20.
5. **Control-bar buttons are 48px circles at 8px gap, horizontally centred** — the capture's 50px
   circles at 32px gap, offset 67px left of stage centre, are wrong on all three counts.
6. **Layout-switch buttons are 64 x 36 (16:9) with 4px radius and an accent 3px ring**, not 38x38
   squares with an accent fill.
7. **Toggles are 36 x 20 with a 12px knob and 14px travel**, not 40 x 22 / 16 / 16.
8. **The canvas is exactly 16:9**; the capture's 742 x 418 is 0.6px tall.
9. **Base body type is 14px**, not 12px; the modal/section heading sizes shift accordingly
   (22px/600 settings header vs the capture's 24px bold).
10. **Accent is `#004eeb` and the page background `#1a1a1a`**; surfaces are white-alpha overlays,
    not the opaque `#242428`/`#2D2D32` ramp.
11. **On-air is `#fb4408`, a distinct orange-red** from the generic red used in the capture; the
    scene rail also carries `ACTIVE`/`ON AIR`/`EDITING` badges and a marching-ants editing ring that
    the reconstruction omits entirely.
12. **Standard dialog width is 500px**; the settings modal is **800 x 613**. All six modal widths in
    the capture (550/580/620/680/780) are invented.
13. **Dual-output previews share one height** (landscape 16:9 and portrait 9:16 at equal height,
    6px gap); the capture gives them 276 and 320.
14. **Gutters exist.** The CSS grid separates the areas with 16px horizontal / 12px vertical margins
    and gives the sidebar an 8px radius; the capture tiles the four bands edge-to-edge with none.

Values that **agree** and can be carried over as-is: the 8px default surface radius, the 36px default
button height, the ~42px input height, the 18px checkbox, the 224px source-card width (in its correct
place), the 16:9 source-card ratio, the 12px scene-title size, and the general dark-on-dark layering
order (rail darker than surface, card lighter than page).
