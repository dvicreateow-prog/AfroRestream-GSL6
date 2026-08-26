# Master Tool Catalog

Index over every widget, tool, plugin, filter, source, destination and integration found in
the Restream Studio capture, with a build recommendation for each.

Compiled 2026-08-25 from the 20 domain specs in this directory. Each row cites where the
detail lives. Where a figure came from a mining agent rather than my own verification it is
marked *(agent)*; figures I verified directly are marked *(verified)*.

**Capture state:** 100% fresh — 32/32 JS chunks, 21/21 CSS chunks, refreshed 2026-08-25
(`refresh-2026-08-25/REFRESH-REPORT.md`). Build commit `c8e9a412…`.

---

## 1. Master table

Priority: **P0** core streaming path · **P1** studio essentials · **P2** differentiators ·
**P3** optional / can defer.

### 1.1 Stage, scenes, layouts

| # | Item | Detail | Spec | Pri |
|---:|---|---|---|:--:|
| 1 | Canvas compositor | 1920×1080, render loop hard-coded 30 fps, `captureStream(30)`, WebGL2 ping-pong render targets *(agent)* | `TOOLS-02` | P0 |
| 2 | Layouts | solo, split, stacked, grid, pip, spotlight, screen, custom | `SPEC-features-layouts` | P0 |
| 3 | Tile fit | Cover / Contain + 9-way gravity. **No per-tile crop/zoom/pan exists** *(agent)* | `TOOLS-02` | P0 |
| 4 | Resolutions | 854×480@30, 1280×720@30 *(default)*, 1280×720@60, 1920×1080@30, Auto | `TOOLS-02` | P0 |
| 5 | Bitrate ladder | 1.9 / 3.5 / 4.0 / 12.0 Mbps | `TOOLS-02` | P0 |
| 6 | Scenes | add/remove/reorder, per-scene layout + sources + QR assignment | `SPEC-features-layouts` | P1 |
| 7 | Scene Edit Mode PiP | Went store-only → fully wired in the 2026-08-25 deploy | `REFRESH-REPORT` | P2 |
| 8 | Portrait / vertical | TikTok + Instagram default to portrait | `TOOLS-05` | P2 |

### 1.2 Sources

| # | Item | Detail | Spec | Pri |
|---:|---|---|---|:--:|
| 9 | Camera | `getUserMedia`, device select, mirror (default **on**) | `TOOLS-08`, `TOOLS-02` | P0 |
| 10 | Extra camera | Second camera, own settings namespace (`studio.extraCameraSettings.*`) | `TOOLS-09` | P2 |
| 11 | Screen share | `getDisplayMedia`, tab/window/screen, with-audio, `restrictOwnAudio` | `TOOLS-03`, `TOOLS-08` | P0 |
| 12 | Local video | Upload + in-scene playback via hls.js 1.3.5, position-synced room-wide | `TOOLS-04` | P1 |
| 13 | Image | JPG/JPEG/PNG/GIF/WEBP/HEIC/TIFF/AVIF/SVG *(verified)* | `TOOLS-10` | P1 |
| 14 | Presentation | Google Drive OAuth picker; slide control; "guest can control slides" | `TOOLS-08` | P2 |
| 15 | Browser source | **This is the widget system** — user-created, 5/scene on Standard, paid-gated *(agent)* | `TOOLS-01` | P1 |
| 16 | RTMP source | Ingest URL + key handed to a remote encoder | `TOOLS-08` | P2 |
| 17 | Countdown | Presets 0/1/2/3/10/15 min; `durationMs`, `backgroundColor`, `backgroundOpacity`, `freemovePosition`, `scale`, `musicId`, `musicVolume` *(agent)* | `TOOLS-01` | P1 |

### 1.3 Widgets & on-stream graphics — 11 families, 61 components

| # | Item | Detail | Spec | Pri |
|---:|---|---|---|:--:|
| 18 | Widget system | Generic; **lower thirds, tickers, polls, leaderboards, scoreboards are all user-created widgets, not built-ins** *(verified)* | `TOOLS-01`, `TOOLS-01a` | P1 |
| 19 | Ticker | Speed 0.4–2.5, default 1; reserved space `48·(h/720)` *(agent)* | `TOOLS-01` | P1 |
| 20 | Captions | Reserved space `216·c`; `AirCaption` on-stream renderer | `TOOLS-01` | P2 |
| 21 | QR codes | **`overlayMode` is commerce-backed** (`qrcode_image` vs `qrcode_product`) — *not* a size toggle *(agent, corrects earlier reading)* | `TOOLS-01`, `TOOLS-06` | P2 |
| 22 | Chat on stream | Options schema + ReservedSpace/Freemove; reserved space `397·c` | `TOOLS-01` | P2 |
| 23 | Brands / logos | `Brands`, `BrandItem`, `BrandLogo`, `BrandFolderLogo`; QR requires an active brand | `TOOLS-01` | P2 |
| 24 | Backgrounds | Static, **animated**, virtual; max 10 custom, downscaled to 1920×1080, PNG q=0.9 | `TOOLS-01`, `TOOLS-02` | P1 |
| 25 | Themes | Enum `DEFAULT / NEWS / ROUNDED / AIR` *(agent)* | `TOOLS-01` | P2 |
| 26 | Questionnaire | Poll / Q&A component | `TOOLS-01a` | P3 |
| 27 | Timer, Alert | `Timer`, `Alert`, `AlertContainer`, `LogoAndStatus` | `TOOLS-01a` | P3 |

### 1.4 Video effects — 4 total, fixed chain: background → beautify → LUT

| # | Item | Detail | Spec | Pri |
|---:|---|---|---|:--:|
| 28 | Green screen | 6 params. similarity **0.4**, smoothness **0.08**, spill **0.1**; keys in UV space, Rec.709 desaturating spill suppression *(agent)* | `TOOLS-02` | P2 |
| 29 | Virtual background | MediaPipe `selfie_segmenter` float16 GPU (default) / landscape variant | `TOOLS-02` | P1 |
| 30 | Blur | **Not adjustable** — fixed 9×9 gaussian σ=2.0, 2 passes at 0.5× *(agent)* | `TOOLS-02` | P1 |
| 31 | LUT colour filters | 5 `.cube` files; **no intensity control exists**; WebGL2 `TEXTURE_3D`; gated off behind `?lut-filters` | `TOOLS-02` | P2 |
| 32 | Beautify | 8 params, intensity default 0.3; skin mask from `selfie_multiclass_256x256` in a worker @15 fps | `TOOLS-02` | P3 |
| 33 | Manual adjustments | **None exist.** No saturation/temperature/sharpness/exposure/vignette anywhere *(agent, exhaustive grep)* | `TOOLS-02` | — |

### 1.5 Audio

| # | Item | Detail | Spec | Pri |
|---:|---|---|---|:--:|
| 34 | Mixer | Gain MIN 0 / DEFAULT 1 / MAX 1.5 → 0–150 sliders; no master node | `TOOLS-03` | P0 |
| 35 | Metering | `volumeMeter` AudioWorklet, RMS→dBFS, 24 Hz, −60..0 dB, smoothing 0.85 | `TOOLS-03` | P1 |
| 36 | NS / AEC / AGC | **100% browser-native constraints** — zero RNNoise/Krisp in the capture *(agent)* | `TOOLS-03` | P0 |
| 37 | Music ducking | Divisor **6** | `TOOLS-03` | P2 |
| 38 | Background music | 22 curated channels; server-side playback; 16 upload MIME types | `TOOLS-03` | P3 |
| 39 | AI music | **Suno** via `generate_music` | `TOOLS-03` | P3 |
| 40 | Soundboard | **Does not exist** — only 2 bundled SFX (guest/host joined) | `TOOLS-03` | — |

### 1.6 Destinations — 58 enum members, 47 named, 37 in the add-grid

| # | Item | Detail | Spec | Pri |
|---:|---|---|---|:--:|
| 41 | Platform integrations | 14 OAuth · 4 flag-hybrid (TikTok/Kick/Instagram/Rumble) · 28 manual-key *(agent)* | `TOOLS-05` | P1 |
| 42 | Ingest URLs | 30 verbatim RTMP/SRT endpoints extracted | `TOOLS-05` | P1 |
| 43 | Custom RTMP | 6 fields incl. `useAuthentication` + user/pass | `TOOLS-05` | P0 |
| 44 | Custom SRT | 5 fields, `streamid`/`passphrase` query merging | `TOOLS-05` | P2 |
| 45 | Custom WHIP | WebRTC-HTTP ingest | `TOOLS-05` | P3 |
| 46 | Custom HLS | — | `TOOLS-05` | P3 |
| 47 | Capabilities | title-editable 16 · description 8 · thumbnail 4 · locked-when-live 4 · viewer-count 11 | `TOOLS-05` | P2 |
| 48 | Scheduling | 1 h–7 d window, 15-min granularity, IANA tz. **No recurrence/RRULE exists** *(agent)* | `TOOLS-05` | P2 |
| 49 | Validation | 13 exact regexes; per-platform title/description limits for 17 platforms | `TOOLS-05` | P2 |
| 50 | Dead platforms | 11 slots: Mixer, Smashcast, UStream, Niconico, LiveHouse, Cavetube, YouNow, Chew, StreamCraft, Loots, CyberGame — **do not build** | `TOOLS-05a` | — |

### 1.7 Guests & rooms

| # | Item | Detail | Spec | Pri |
|---:|---|---|---|:--:|
| 51 | Invite link | Room capacity 10 | `TOOLS-08` | P0 |
| 52 | Approval / waiting room | "Guests can enter without approval" toggle | `TOOLS-08` | P0 |
| 53 | Backstage ↔ on stage | Per-participant | `TOOLS-08` | P0 |
| 54 | Guest permissions | Screen share, control slides, enter without approval | `TOOLS-08` | P1 |
| 55 | Prejoin | Device test before entry | `TOOLS-08` | P0 |
| 56 | Promotion to host | `PromotionToHostOfferModal`, `PromotionToHostConfirmationModal` | `TOOLS-01a` | P2 |

### 1.8 Recording & clips

| # | Item | Detail | Spec | Pri |
|---:|---|---|---|:--:|
| 57 | Recording | Cloud, via S3 multipart | `TOOLS-08` | P1 |
| 58 | Live clipping | `LiveClippingBadge`, `LiveClippingToggleRow` | `TOOLS-08` | P2 |
| 59 | Highlight markers | "Create highlight marker" | `TOOLS-08` | P2 |
| 60 | Video editor | **Multi-segment trim only** — no crop, caption burn-in, vertical conversion, thumbnails or export presets *(agent)* | `TOOLS-04` | P3 |
| 61 | Choppity | Third-party AI clipping integration, 3.5 s poll | `TOOLS-04` | P3 |

### 1.9 AI

| # | Item | Detail | Spec | Pri |
|---:|---|---|---|:--:|
| 62 | AI Assistant | Agentic chat driving Studio; Vercel AI SDK v5 **client-side** via `ai-gateway.vercel.sh` + OpenRouter; 7 models incl. `anthropic/claude-opus-4.7`; **~72 tools across 13 groups**; ≥18 KB system prompt in chunk 357 *(agent)* | `TOOLS-04` | P2 |
| 63 | AI Scene | `AiSceneActivityShimmer` — new in the 2026-08-25 deploy *(verified)* | `REFRESH-REPORT` | P3 |
| 64 | AI backgrounds | Animated background generation | `TOOLS-01` | P3 |

### 1.10 Panels, settings, shortcuts

| # | Item | Detail | Spec | Pri |
|---:|---|---|---|:--:|
| 65 | Tool rail | Sources, Chat, Graphics, Theme, Captions, QR, Notes, Help (+AI) | `TOOLS-06` | P1 |
| 66 | Notes | Scene-scoped: `SceneNote`, `ScenesNotes`. **No teleprompter exists** *(verified)* | `TOOLS-06` | P2 |
| 67 | Chat | 28 embed themes; platform tabs, pin, show-on-stream, moderation | `TOOLS-06`, `TOOLS-04` | P1 |
| 68 | Shortcuts | **48 `HotkeyId` members**, 44 rows across 6 sections + 6 editor bindings *(agent)* | `TOOLS-09` | P2 |
| 69 | Settings | **7 tabs** — General, Video, Audio, **Recordings**, **Virtual Background**, Shortcuts, Profile; 42 controls *(agent)* | `TOOLS-09` | P1 |
| 70 | Persistence | 27 `studio.settings.*`, 6 `studio.extraCameraSettings.*`, 42 other `studio.*`, 13 non-`studio.`, IndexedDB `RestreamDb` v1 | `TOOLS-09` | P1 |

---

## 2. Build vs borrow

| Need | Recommendation | Why |
|---|---|---|
| Compositing | **Build** (Canvas2D now → WebGL2 later) | Already built: `web/src/engine/compositor.ts`. WebGL only needed once effects land. |
| Encode + RTMP fan-out | **Borrow: ffmpeg** via `child_process` + `tee` muxer | Already built: `server/src/broadcaster.ts`. One encode, N destinations. ffmpeg 9 is installed. |
| Browser → server transport | **Build: `MediaRecorder` → WebSocket** | Far simpler than a Node WebRTC receiver; ~1–2 s latency is fine for RTMP. |
| WebRTC guests | **Build mesh now** (own signaling) → **LiveKit** if >6 guests | Mesh needs no extra binary. Room cap is 10; mesh degrades past ~6. |
| Segmentation | **Borrow: `@mediapipe/tasks-vision`** + the 3 `.tflite` models on disk | Same library Restream uses. Only `ImageSegmenter` is needed. |
| LUTs | **Build** WebGL2 `TEXTURE_3D` sampler | Trivial shader; the 5 `.cube` files are already parsed in `TOOLS-02`. |
| QR generation | **Borrow: `qrcode`** (already a dependency) or `qr-code-styling` for logo-in-centre | No need to hand-roll. |
| Audio mixing/metering | **Build** Web Audio + AudioWorklet | Already built: `web/src/engine/audioMixer.ts`. |
| Media playback in scene | **Borrow: `hls.js`** | Same as Restream; use current v1.6+, not their 1.3.5. |
| Object storage | **Borrow: `@aws-sdk/client-s3` + `@aws-sdk/lib-storage`** | Restream ships aws-sdk **v2**, which is **EOL** — use v3. |
| Video trim/export | **Borrow: ffmpeg** server-side | Restream uses AWS MediaConvert *(inferred)*; ffmpeg is free and already present. |
| AI assistant | **Borrow: Anthropic SDK** direct | No reason to route through OpenRouter. See §3 for the cost caveat. |
| State | **Borrow: `zustand`** | Already in use. |
| Chat embed themes | **Build** the engine, ship **only** neutral themes | See §3. |

---

## 3. Licence landmines

| Asset | Status | Substitute |
|---|---|---|
| **Graphik** font (5 self-hosted faces) | Commercially licensed. **Cannot ship.** | **Inter** — already swapped in `tokens.css` |
| 21–24 overlay/display fonts | Mixed; several Google Fonts, some not | Audit per-family; prefer SIL OFL |
| **~20 of 28 chat themes** | **Game trade-dress** — Fortnite, PUBG, LoL, R6, Overwatch, BO4, AC Odyssey, Minecraft, WoT, WoW | Ship the **engine**; keep only `default`, `default-compact`, `default-rounded`, `8-bit`, `comic` |
| Restream name, logo, wordmark | Trademarked | Own branding |
| Compiled JS/CSS bundles | Copyrighted | Reference only — never redistribute |
| 5 `.cube` LUTs | 4 stamped "Generated by Resolve"; provenance unclear | **Generate our own** — trivial to author |
| 3 MediaPipe `.tflite` models | Google-published, Apache-2.0 | Safe to use; keep attribution |
| MediaPipe WASM | Apache-2.0 | Safe |
| Stripe / Intercom / Segment SDKs | Vendor-licensed, need own accounts | Own keys, or omit |
| `agentation.js` | Restream-internal staff tool | Do not reimplement — not a user feature |

---

## 4. UNRESOLVED

Consolidated across all specs. Nothing here is silently dropped.

1. Chunk **298** — referenced by `Index.js`, absent from both hash maps. *Explained*: `externals.js` declares it and the shell loads it eagerly. **Not a gap.**
2. Exact MediaPipe patch version (range 0.10.2–0.10.9).
3. "Choppity" product identity and API contract.
4. `LiveClips` UI location.
5. `OverlayVirtualEventsChat` configuration schema.
6. Numeric character limits for several widget fields; per-brand caps.
7. Several widget defaults (11 items listed in `TOOLS-01`).
8. 8 items in `TOOLS-09`, including **a likely live bug in Restream**: hotkeys use `Key1`–`Key7` where the DOM emits `Digit1`–`Digit7`, so number-row shortcuts likely never fire. Plus one duplicate DOM id.
9. `overlay-selection-tokens.scss` — referenced by two files, never published. Accent `#85e138` reconstructed from compiled CSS.
10. 2 dead fonts, 1 dead `recharts` reference.
11. Host `PresentationsService.OAUTH_TOKEN_TTL_MS = 1e4` (**10 s**) vs guest `33e5` (55 min) — debug value left in production.
12. 179 CSS custom properties referenced via `var()` but never declared.

---

## 5. Build sequence

Each phase is independently demoable.

| Phase | Deliverable | Depends on |
|---|---|---|
| **0 · Shell** ✅ | Tokens, icons, store, header/rail/stage/panel/tool-rail | — |
| **1 · Capture** | `getUserMedia` / `getDisplayMedia`, device pickers, prejoin | 0 |
| **2 · Compositor** ✅ | Canvas 1920×1080 @30, 7 layouts, nameplates, overlays | 1 |
| **3 · Audio** ✅ | Mixer, worklet metering, per-source gain, ducking | 1 |
| **4 · Egress** ✅ | `MediaRecorder` → WS → ffmpeg → multi-RTMP + MP4 | 2, 3 |
| **5 · Destinations** | CRUD, custom RTMP/SRT, health, stream keys | 4 |
| **6 · Guests** | Signaling, mesh WebRTC, approval, backstage/stage | 1 |
| **7 · Scenes & sources** | Full source catalog, per-scene state, media playback | 2 |
| **8 · Widgets** | Widget system, countdown, ticker, QR, captions, chat overlay | 2 |
| **9 · Effects** | WebGL2 pipeline, virtual bg, blur, chroma, LUTs | 2 |
| **10 · Chat** | Aggregation, moderation, on-stream rendering | 6 |
| **11 · Recording** | Cloud recording, clips, highlight markers, trim | 4 |
| **12 · Settings** | 7 tabs, 48 shortcuts, persistence | all |
| **13 · AI** | Assistant + tool registry | 7, 8 |

✅ = already implemented in `studio/`.
