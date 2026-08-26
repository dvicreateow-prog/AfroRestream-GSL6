# TOOLS-04 — Sub-applications shipped alongside Restream Studio

Scope: the seven separately-chunked sub-apps / vendored engines that ship with the Studio web client.
Evidence is drawn only from the local capture. `[observed]` = exact literal or file found on disk;
`[inferred]` = reasoning from observed evidence.

---

## 0. Build system + chunk map (context for everything below)

`[observed]` `01-inside-studio-verified/client-static/js/runtime.b1c203db08a4f823.js`

| Fact | Value |
|---|---|
| Bundler | **rspack 1.7.4** (`c.rv=()=>"1.7.4"`, `c.ruid="bundler=rspack@1.7.4"`) |
| Webpack global | `self.webpackChunkstudio_frontend` |
| App name | `studio-frontend` (script attr `data-rspack="studio-frontend:<chunk>"`) |
| Public path | `/` |
| Entry chunk id | `146` |

Named lazy chunks `[observed]` (from `c.u`):

| Chunk id | Name | File |
|---|---|---|
| 151 | `restreamvideoeditor` | `restreamvideoeditor.d22611927fb1ae5c.js` |
| 202 | `mediapipetasksvision` | `mediapipetasksvision.a54ec1e1b0502c02.js` |
| 372 | `restreamchatembedthemes` | `restreamchatembedthemes.d79062a9951586dd.js` |
| 456 | `onboarding-chat` | `onboarding-chat.2a0e5f8a2643f258.js` |
| 607 | `awssdk` | `awssdk.06c9eae97cc86f8d.js` |
| 782 | `agentation` | `agentation.6e2fe827872bef18.js` |
| 801 | `restream` | `restream.887ca3d5bcd09a3a.js` |
| 356 | *(unnamed — hls.js)* | `hlsjs.3e5d0a83ecd57757.js` — **not** in `c.u`; injected by `<script>` in the shell HTML |
| 288 | *(unnamed — worker entry)* | `288.e5852046176082ad.js` — a **Web Worker** runtime (`importScripts`) |
| 446 | *(unnamed)* | `446.9c38229d9364cb92.js` — `HlsVideoPlayer` |

Shell HTML `[observed]` `01-inside-studio-verified/client-static/misc/studio-shell.html` loads:
`Index.*.js`, `externals.*.js`, `hlsjs.*.js`, `locale/en-US.js`, `restream.*.js`,
`restreamvideoeditor.*.js`, `runtime.*.js` + third-party `apis.google.com/js/api.js`,
`cdn-3.convertexperiments.com/js/10034870-10034041.js` (Convert.com A/B), `code.jquery.com/jquery-3.6.0.min.js`.

> **UNRESOLVED**: chunk `298` is referenced by the S3 upload path (`r.e("607"),r.e("298"),r.e("492")`) but is
> absent from both the capture *and* the runtime `c.u` map. Likely a tiny polyfill/shim chunk.

> Note: `locale-en-US.js` (1,682 keys) is the **marketing / dashboard** locale, not Studio's.
> Its key prefixes are `account:225 plans:165 channel:162 modal:153 error:112 billing:99 monitor:70 …`;
> it contains **no** video-editor, chat-theme, AI-chat or annotation keys. Studio's own strings are
> inlined in the bundles (`(0,P.A)("…")` / `(0,u.A)("…")` call sites), which is where every string
> quoted below comes from.

---

## 1. `restreamvideoeditor.d22611927fb1ae5c.js` (1.1 MB) — **Recording / Upload Trim Editor**

### 1.1 What it actually is `[observed]`

A **multi-segment, non-destructive trim editor** — *not* a general NLE. It never renders video in the
browser; it produces a list of keep-ranges (`inputClippings`) that the backend renders server-side.

Exports (module `60287`): `VideoEditor` (React `forwardRef`) and `Y` (timestamp formatter,
format string `"MMM dd, yyyy • hh:mm:ss a"`).

Loaded from the main bundle as `VideoEditorContainer` `[observed]`:

```js
udt=(0,et.lazy)(()=>Promise.resolve().then(r.bind(r,60287)).then(e=>({default:e.VideoEditor})))
```

CSS-module root: `VideoEditorContainer-module__root___55Jru` (+ `isFullHeightOnMobile`, `modalButtonsWrapper`, `loaderWrapper`).

### 1.2 Component inventory `[observed]` (CSS-module names embedded in the bundle)

| Component | Element classes |
|---|---|
| `VideoEditor` | `videoEditorWrapper` |
| `VideoPreview` | `videoRefContainer`, `videoElementProviderWrapper`, `loaderWrapper`, `error` |
| `VideoControls` | `videoControlsContainer`, `videoControlsContentWrapper`, `timestamp` |
| `EditorToolbar` | `editorToolbar`, `toolbarButtonGroup`, `undoRedoButton`, `zoomButton`, `zoomSlider`, `slider`, `slicesDuration`, `compact`, `disabled`, `error`, `srOnly` |
| `EditorTimeline` | `timelineWrapper`, `timelineContainer`, `timelineView`, `timelineBackground`, `shimmer`, `compact` |
| `TimelineGrid` | `timelineGrid`, `timelineGridItem` |
| `TimelineCursor` | `TimelineCursor` |
| `TimelineSliceCursor` | `timelineCursorTool`, `hiddenCursorTool` |
| `TimelineSlices` | `timelineSlices` |
| `TimelineSliceItem` | `timelineSliceItem`, `selected`, `boundaryContainer`, `resizeHandlerWrapper` |
| `ResizeHandler` | `handler`, `left`, `right`, `selected` |
| Shared UI kit | `Alert`, `Button`, `Collapsible`, `Command` (cmdk), `Form`, `Input`, `InputButtonReset`, `Label`, `ScrollArea`, `Select`, `StripedProgress`, `Switch`, `Tooltip` |

### 1.3 Editor state model `[observed]`

```js
aA = { durationMin:0, durationMax:1, editableRangeStart:0, editableRangeEnd:1,
       viewWidth:0, zoom:1, zoomPoint:0, hotkeysEnabled:false, scrollPoint:0,
       cursorPoint:0, pointerCursorPoint:0, followCursor:true,
       sliceCursorPoint:0, selectedSliceId:…, slices:[] }
```

Slices are normalised `{start,end}` in `0..1` of total duration, each with a `status`
(`"idle"` = settled). State container is **legend-state** observables (`lt(...)`, `.use()`, `.peek()`).

### 1.4 Feature list `[observed]`

| Feature | Evidence |
|---|---|
| Multi-segment (slice) timeline; add / remove / drag-resize segments | `TimelineSlices`, `TimelineSliceItem`, `ResizeHandler` `left`/`right` |
| **Split segment** | button `Split`, tooltip `"Split Segment (S)"` |
| **Delete segment** (only rendered when >1 slice) | tooltip `"Delete Segment (D)"` |
| **Undo / Redo** with history stack | tooltips `` `Undo Action (${cmd\|ctrl}+Z)` ``, `` `Redo Action (${cmd\|ctrl}+shift+Z)` ``; state `{history, position}` |
| Play / Pause | tooltip toggles `"Pause"` / `"Play"`, sr-hint `"(Space)"` |
| Mute toggle | `pA.muted.toggle()` on `KeyM` |
| **Timeline zoom 1×–10×** | `<input type=range id="timeline-zoom" name="zoomer" min=1 max=10 step=.1>`, tooltips `"Zoom In (+)"` / `"Zoom out (-)"`, CSS var `--progress` |
| Playhead / cursor + follow-cursor | `cursorPoint`, `followCursor`, `TimelineCursor` |
| Snap guard on split | split disabled when cursor is <1 s from a slice boundary (computed `qq`) |
| Live "Duration: …" readout of kept material | `slicesDuration` sums `(end-start)*duration` over all slices |
| Min/Max duration guard | props `durationMinSec`, `durationMaxSec`; callback `onTimeLimitExceeded` |
| Restricted editable range | props `initialTimeRange`, `allowedTimeRange`; state `editableRangeStart/End` |
| **Trimmer mode** (single-range; hides split / undo / redo / delete) | prop `trimmerMode` gates the whole left toolbar group |
| Compact mode (mobile / modal) | prop `compact` |
| Loading skeleton | `EditorTimeline-module__shimmer` |
| Processing progress bar | `StripedProgress` (`animated`, `animatedReverse`) |
| Preview error surface | `"Unable to Load Video"`, `"Preview failed for this file, but it may still process successfully."`, `"An error occurred, please try again later."` |
| Save | `"Save"` button, `onSaveCallback`, `canSaveWithoutChanges` |
| Custom bottom-toolbar slots | `renderBottomToolbarLeftGroup`, `renderBottomToolbarRightGroup` |

Full prop signature `[observed]`:
`{trimmerMode, compact, source, sourceType, poster, durationMinSec, durationMaxSec, initialTimeRange,
allowedTimeRange, canSaveWithoutChanges, hotkeysEnabled=true, onSaveCallback, loading,
onTimeLimitExceeded, logger, error, previewErrorMessage, onPreviewError,
renderBottomToolbarLeftGroup, renderBottomToolbarRightGroup}` + `ref`.

### 1.5 Keyboard map `[observed]`

Handler is scoped to `document.getElementById("video-editor-modal")` containing `document.activeElement`.

| Key | Action |
|---|---|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `S` | Split segment at cursor |
| `D` / `Delete` / `Backspace` | Delete selected segment |
| `Space` | Play / Pause |
| `M` | Mute / Unmute |
| `=` `-` `.` `,` `L` | captured (`preventDefault`) but **no-op** in this build — reserved |
| `ArrowLeft` / `ArrowRight` | captured; handled by the timeline widgets |

Captured key list: `["KeyS","KeyM","KeyL","Space","KeyD","Backspace","Delete","Equal","Minus","ArrowLeft","ArrowRight"]`.
Modifier label auto-detected from `navigator.userAgent`: `cmd` on Mac, else `ctrl`.

### 1.6 Playback source `[observed]`

```js
{poster, source, sourceType="hls", contentId, durationMax, cmcdEnabled=false,
 previewErrorMessage, onPreviewError}

new Hls({ enableWorker:true, autoStartLoad:true, startFragPrefetch:true, startPosition:0 })
// + optional  cmcd:{ contentId: contentId ?? new URL(source).pathname, useHeaders:false }
```

* Preview is HLS via **its own private copy of hls.js `1.4.5`** (`class Hls{static get version(){return"1.4.5"}}`)
  — a *different* version from the standalone `hlsjs` chunk (1.3.5). It does **not** import module `39473`.
* Fallback `<source type="application/x-mpegURL">` element for native playback.
* Error taxonomy `[observed]`: `{metadata_timeout:1, video_not_rendering:2, error_event:3}`.
* `sourceType` may also be `"mp4"` (direct `recording.videoUrls[0]`), gated by URL flag `mp4-urls`
  (`{enabled:"false"!==Qb().get("mp4-urls")}`).
* Right-click on the `<video>` is suppressed (`onContextMenu: e=>e.preventDefault()`).

### 1.7 Save / render pipeline `[observed]` (`restream.887…js`, `VideoEditorContainer`)

1. Output name = `<originalName without extension | recordingTitle | formatted timestamp>` + `"-trimmed"`.
2. Slices → seconds, 3-dp, then **merged / overlap-collapsed** into
   `inputClippings = [{startTimecode, endTimecode}]`.
3. Dispatch:
   * upload source → `trimByFileId(fileId, {name, inputClippings, useMp4})`
   * recording source → `trimByRecordingSuid(suid, {…})` → `POST /files/trim-recording/{suid}`
   * integrations source → `trimByRecordingSuidChoppity(suid, {…})` → `POST /integrations/files/trim-recording/{suid}`
   * no changes + recording → `saveRecordingToVideoStorage(suid, fileName)`
4. Server error codes mapped: `files_limit` → `SaveRecordingToVideoStorageFilesLimitError`,
   `files_duration_limit` → `SaveRecordingToVideoStorageDurationLimitError`, else `TrimRecordingError`.
5. Analytics: `Trimmed Video Save Attempt` / `Trimmed Video Save Success` / `Trimmed Video Save Error`
   with `{duration_full, duration_new, video_source: "upload"|"recording", error_type}`.
6. Result `{fileId, fileStatus}` → `onSuccess`; query key `["uploads"]` invalidated.

The editor's HLS playlist is built client-side as a Blob:
`new Blob([playlist], {type:"application/x-mpegURL"})` → `URL.createObjectURL`, sourced from
`getPlaylistByFileId(fileId)` or `getPlaylist(recordingSuid)`.

### 1.8 Adjacent Video-Storage API surface `[observed]`

```
createFile · getDemoFile · getFileById · getFiles · getUploadCredentials · refreshUploadCredentials
removeDemoFile · removeFile · renameFile · saveRecordingToVideoStorage · getPlaylistByFileId
getFileTrims · trimByFileId · trimByRecordingSuid · trimByRecordingSuidChoppity · getFileByIdChoppity
getSignedUrlForDownloadChoppity · getIntegrationsFiles · importYoutubeVideo
```

Recordings API: `getRecordingBySuid · getRecordings · removeRecording · getPlaylist · editRecording · getStudioRecordingMetadata`.

React-Query keys: `["uploads"] ["upload-trims"] ["recordings"] ["recording-playlist"] ["upload-playlist"]
["uploads-integrations"] ["uploads-integrations-download-urls"] ["demo-upload"]`.

**`Choppity` integration** `[observed]` — a parallel endpoint family under `/integrations/files/…`
(`getFileByIdChoppity`, `getSignedUrlForDownloadChoppity`, `trimByRecordingSuidChoppity`), polled every
**3500 ms** until file `status` ∈ `{Ready, AnalyseFail, UploadFail, TranscodingError}`, with 5 retries
(`IntegrationsFilesPollingProvider`). `[inferred]` this is the third-party **AI clip-generation** provider
behind Restream's "AI Clips" (`AnalyseFail` implies a content-analysis stage).

### 1.9 What is **NOT** in this bundle (checked, absent)

`[observed]` no strings or identifiers for: crop, caption/subtitle burn-in (only hls.js's own demuxer
strings `textTrack1..4`, `"Empty subtitle payload"`, `SUBTITLES`, `CLOSED-CAPTIONS`), aspect-ratio
conversion, vertical/square export presets, thumbnail selection, highlight markers, export-format
pickers, or any client-side render/encode path. All rendering is server-side.
**Aspect-ratio / vertical clipping, if it exists, lives elsewhere** — see the `liveClipsEnabled`,
`LiveClipsUpgrade`, `LiveClipsChange`, `liveClipsMinutesPerStreamAvailable`, `live-clipping` symbols in
`restream.887…js` and `shouldEnableLiveClipping` / `shouldShowLiveClippingOnInit` in `Index.*.js`.

### 1.10 Third-party libraries vendored inside this chunk `[observed]`

`radix-ui` primitives (185 refs: Dialog, DropdownMenu, Select, Tooltip, ScrollArea, Avatar, Switch,
Collapsible, DismissableLayer…), `cmdk` (32), `react-draggable` (32), `re-resizable`, `legend-state`,
`date-fns` (`format`, `EEEE, MMMM do, y`, `Before Christ`), an embla-style carousel
(`"Previous slide"` / `"Next slide"`, `trimSnaps`, `snapsAligned`, `snapsContained`),
hls.js 1.4.5, and one stray `recharts` reference (no chart component — dead code).

### 1.11 Rebuild vs. substitute

**Rebuild the UI; substitute the pieces.** It is a thin bespoke React component over a normalised slice model.

| Need | OSS equivalent |
|---|---|
| Timeline / zoom / segment-handle widget | `@xzdarcy/react-timeline-editor`; or `wavesurfer.js` + `regions` plugin for the drag-handle UX |
| Player shell | `vidstack`, `media-chrome` |
| HLS preview | `hls.js` (identical) |
| Undo/redo | `zundo`, or `immer` patches |
| Server-side keep-range render | `ffmpeg` `-ss/-to` + `concat` demuxer — **or AWS Elemental MediaConvert: the field names `inputClippings` / `startTimecode` / `endTimecode` are verbatim MediaConvert API shape, so `[inferred]` the backend is MediaConvert** |

---

## 2. `restreamchatembedthemes.d79062a9951586dd.js` (20 KB) + `restreamchatembedthemes.80c3d45ee11ec039.css` (99 KB) — **Embeddable Chat Theme Kit**

### 2.1 What it is `[observed]`

A **self-contained, reusable React theme library** for rendering a live-chat message list.
It is an *older* build (webpack-4 UMD-style inner runtime, `React.createElement`, `prop-types`,
ES5 class transpilation) wrapped as rspack module `11616` — i.e. an independently-versioned package that
predates the rest of Studio. **This is the most directly reusable asset in the whole capture.**

Public API `[observed]`:

```js
exports.EmbedChatMessagesList   // React class component, render-prop children
exports.themeNames              // the 27-name enum below
```

### 2.2 Props `[observed]`

| Prop | Type | Default | Effect |
|---|---|---|---|
| `children` | `func` **required** | — | render prop; receives `{Message, themeNames}` |
| `themeName` | `string` **required** | — | unknown value → falls back to `default` + `console.warn('Provided theme "X" does not exist! Falling back to "default".')` |
| `messageAlignment` | `"top" \| "bottom"` **required** | — | `"top"` adds class `reversed` |
| `hideMessages` | `bool` **required** | — | adds class `hiding` |
| `scale` | `number` | `100` | → CSS var `--scale` |
| `hideMessagesAfter` | `number` (seconds) | `3` | → CSS var `--hideMessagesAfter` (`"Ns"`) |
| `backgroundOpacity` | `number` | `1` | → CSS var `--backgroundOpacity` |
| `messageBackgroundOpacity` | `number` | `1` | → CSS var `--messageBackgroundOpacity` |
| `themeNames` | `object` | built-in enum | lets the host inject an extended enum |

`Message` component props: `author*`, `timestamp*`, `channelIcon*`, `children`,
`badges: [{type, content}]`, `color`, `hosted`, `showAvatars`, `authorAvatarUrl`.

Behaviours `[observed]`:
* `hosted` → renders `"[hosted] " + author`.
* Badges render only entries with `type === "img"`, as `<img class="message-sender__img">`.
* Author matching `/^Restream(.io)?$/i` uses the **channel icon** as its avatar instead of `authorAvatarUrl`.
* When `showAvatars` is true, `.message-item` also gets class `avatar` and an `img.sender-avatar` is prepended.

### 2.3 DOM contract `[observed]`

```
.restream-embed-themes-chat-container .restream-embed-themes-chat-container_<theme>
      style: --scale --backgroundOpacity --messageBackgroundOpacity --hideMessagesAfter
  └ .chat-messages[.reversed][.hiding]
      └ .message-item[.avatar]
          ├ img.sender-avatar
          ├ .message-info-container > .message-info
          │    ├ .icon-platform-wrapper > img.icon-platform
          │    ├ .message-sender [style.color]   (variants __corner __inner __wrapper __img)
          │    └ .message-time                   (variants __inner __wrapper)
          └ .message-text                        (variants __inner __wrapper __content
                                                   __decoration(s) __rounds)
```

### 2.4 The message-layout components `[observed]`

14 distinct layout components are compiled; each theme maps to exactly one.

| Component | Themes it serves | Distinctive markup |
|---|---|---|
| `u` (base) | `default`, `default-compact`, `default-rounded`, `fortnite-compact`, `comic`, `8-bit`, `8-bit-compact`, `pubg-compact`, `lol-compact`, `r6-compact`, `overwatch-compact`, `bo4-compact`, `minecraft-compact`, `wow-compact` | avatar support, `.message-info-container` |
| `E` | `bo4-boxed` | `message-text__decorations-{corners,triangles,squares,patterns}` |
| `_` | `lol-boxed` | `.message-info__inner` |
| `N` | `fortnite-blue` | flat `.message-info` + `.message-text__inner` |
| `b` | `ac-odyssey-boxed` | `.message-sender-wrapper__decoration`, `.message-text__decoration` |
| `O` | `ac-odyssey-compact` | `icon-platform-wrapper` + plain text |
| `x` | `r6-boxed` | `.message-text__rounds` (3 spans), `__decoration-burger`, `__decoration-circle` |
| `C` | `pubg-1` | flat info row + `.message-text__inner` |
| `M` | `pubg-boxed` | `.icon-platform-wrapper` + `.message-sender__inner` |
| `B` | `overwatch-boxed` | `__decoration-progress` (8 spans × 2 rows) + `__decoration-lines` |
| `I` | `minecraft-boxed` | plain boxed |
| `S` | `wot-boxed` | `__decoration-line` / `__decoration-top` / `__decoration-bottom` × 2 |
| `X` | `wot-compact` | `icon-platform-wrapper__decoration-line` |
| `U` | `wow-boxed` | `__wrapper` on sender / time / text |

### 2.5 Complete theme catalogue — **28 themes** `[observed]`

`themeNames` (27 entries) + the extra set `m = {DEFAULT_ROUNDED:"default-rounded"}` (1).
All 28 selectors confirmed present in the CSS (`restream-embed-themes-chat-container_<id>`).

| # | Theme id | Enum key | Font(s) | Sender colour | Message background | Signature |
|---|---|---|---|---|---|---|
| 1 | `default` | `DEFAULT` | Roboto-Regular | `rgba(255,255,255,.69)` | `rgba(37,56,88,α)` | boxed, `padding 1em 1em 1em 2.5em`, uppercase time `rgba(255,255,255,.4)`, `text-shadow 0 0 1px #000` |
| 2 | `default-compact` | `DEFAULT_COMPACT` | Roboto-Regular; Roboto-Bold sender | `#536dfe` | none | flat, `padding 0` |
| 3 | `default-rounded` | `DEFAULT_ROUNDED` *(extra set)* | Rubik → Noto Sans (JP/HK/SC/TC/KR), Mali, Hind Madurai/Siliguri | `rgba(40,190,255,.69)` | `rgba(40,40,40,α)` | `border-radius 8px`; **every metric is `calc(px * var(--scale))`**; `text-shadow 0 0 4px rgba(0,0,0,.75)` |
| 4 | `comic` | `COMIC` | **Bangers** | inherit | `rgba(255,255,255,α)` | speech bubble `border-radius .8em` + `box-shadow 0 .2em 1em`, black text |
| 5 | `8-bit` | `BIT8` | **PressStart2P** | — | `#000` | `.5em` solid pixel border drawn with `:before`/`:after`, `font-size .7em` |
| 6 | `8-bit-compact` | `BIT8_COMPACT` | PressStart2P | — | none | `font-size .7em`, `text-shadow 0 0 .1em rgba(0,0,0,.5)` |
| 7 | `fortnite-boxed` | `FORTNITE_BOXED` | **LuckiestGuy** | `#c47cff` | — | SVG plate `/aea402986781a4e5.svg`, `padding 1em 2em` |
| 8 | `fortnite-compact` | `FORTNITE_COMPACT` | LuckiestGuy | `#c47cff` | — | flat |
| 9 | `fortnite-blue` | `FORTNITE_BLUE` | **Bangers**; BurbankBigCondensedBold for time | `#b9d3e3` | `linear-gradient(90deg,#1776e0 0,#1776e0 50%,transparent 50.1%)` info; `linear-gradient(180deg,#0e59b3,#081388)` text | cyan `#2be5fe` accent bar, time chip `3px solid #1f8fed` on `#030826` |
| 10 | `pubg-1` | `PUBG1` | Ubuntu-Regular; Oswald-Medium (info); Roboto-Medium (text) | `#161616` on plate | `rgba(0,0,0,.5α)` | octagon `clip-path`, gold `#f2a900` borders, SVGs `/460fa4f99cb296ef.svg` + `/0066baec2d8c98bd.svg` |
| 11 | `pubg-boxed` | `PUBG_BOXED` | **ShareTech-Regular** | `#292929` on yellow | `rgba(26,26,26,α)` | yellow gradient nameplate `#fff100→#ffcd00` with angled `clip-path`, `#fcf505` bar, PNGs `/341b97e703b620f1.png` `/0c2d2784e5618c28.png` |
| 12 | `pubg-compact` | `PUBG_COMPACT` | ShareTech-Regular | `#fff` | none | uppercase, icon PNG `/341b97e703b620f1.png` |
| 13 | `lol-boxed` | `LOL_BOXED` | Roboto-Bold | `#ffe89f` | `rgba(7,13,14,α)` | ornate bevel `clip-path`, `#6e603b` border, text `#83c3b6`, gold gradient divider, PNG `/c45887e635d4d642.png` |
| 14 | `lol-compact` | `LOL_COMPACT` | Roboto-Bold; **Exo2-Bold** sender | `#c2a55a` | none | gold gradient underline `#7c6b40`, text `#7bb8ab`, PNG `/0d0676eedee7db7a.png` |
| 15 | `r6-boxed` | `R6_BOXED` | **Teko-Regular** | `#fff` on `#110d11` | `rgba(27,24,27,α)` | **alternating rows** blue `#0078ff` / orange `#fc6800`; pill time `border-radius 2em`; burger + circle decorations `#565456`/`#7d7d7d`; PNG `/b062c85bf846415f.png` |
| 16 | `r6-compact` | `R6_COMPACT` | Teko-Regular | `#fff` | none | uppercase sender & text, text `#b6b6b6` |
| 17 | `overwatch-boxed` | `OW_BOXED` | **Staatliches-Regular** | `#e2e2e2` | `rgba(39,53,79,α)` | orange/yellow tick decorations `#f79f11` `#fed724` `#596270`, accent `#f8c927`, time `rgba(42,51,68,α)`, PNG `/b8d91e42f119c2b1.png` |
| 18 | `overwatch-compact` | `OW_COMPACT` | Staatliches-Regular | `#e2e2e2` | none | icon PNG only |
| 19 | `bo4-boxed` | `BO4_BOXED` | **WorkSans-Medium** / **WorkSans-SemiBold** | `#f56b23` | `rgba(5,5,5,α)` | dark metal gradient nameplate, corner/triangle/square/pattern decorations, PNGs `/d83095ab464150cd.png` `/5bf7c7d1120c5b09.png` |
| 20 | `bo4-compact` | `BO4_COMPACT` | WorkSans-Medium / SemiBold | `#f56b23` | none | PNG `/ff8841097f79a542.png` |
| 21 | `ac-odyssey-boxed` | `AC_ODYSSEY_BOXED` | **Philosopher-Regular / Philosopher-Bold** | `#e2e2e2` on bronze | `linear-gradient(90deg,#c3a488,#725026)` | parchment `#d7d4ca` panel, black text `#050000`, bronze gradients, PNGs `/61f29e6fba6ebdee.png` `/827e6fe47092d302.png` |
| 22 | `ac-odyssey-compact` | `AC_ODYSSEY_COMPACT` | Philosopher-Regular / Bold | gradient plate `#c0a58e→#7e664a` | none | text `#dedede`, `#cdb39b` icon disc |
| 23 | `minecraft-boxed` | `MC_BOXED` | **VT323-Regular** | `#fff` | `rgba(198,198,198,α)` | pixel-tile PNG `/d1363f89054739aa.png` on icon + sender + time, text `#191919` |
| 24 | `minecraft-compact` | `MC_COMPACT` | VT323-Regular | `#e2e2e2` | none | text `#efefef`, tile PNG on icon |
| 25 | `wot-boxed` | `WOT_BOXED` | **Exo2-Bold** | `#fff` on `linear-gradient(180deg,#991f1c,#510f0d)` | — | olive `#44443a` rails with **red** end-caps, metal seam `#272721→#5e5e52→#272721` |
| 26 | `wot-compact` | `WOT_COMPACT` | Roboto-Bold; Exo2-Bold sender | `#fff` | none | icon rail decorations, text `#84846d` |
| 27 | `wow-boxed` | `WOW_BOXED` | **Philosopher-Regular** | gold `linear-gradient(180deg,#e2b644,#f7e867)` | `#190402` / `#180c07` | 5-stop gold frame `#ebbb57 #583e0e #f1c462 #554515 #daae4f`; navy `#0a254e` inlay; PNGs `/86f8ea6ae4571c89.png` `/263a40d644e1ee4f.png` `/d30fe8d0681ff273.png` |
| 28 | `wow-compact` | `WOW_COMPACT` | Philosopher-Regular | gold gradient | — | PNG `/86f8ea6ae4571c89.png` |

α = `var(--messageBackgroundOpacity, 1)` — **every** themed background colour is opacity-parameterised,
so the whole pack is transparency-tunable at runtime without recompiling.

### 2.6 Asset manifest `[observed]`

**22 `@font-face` rules / 20 self-hosted families** (woff2 + woff pairs; Bangers is a single OTF):

`LuckiestGuy` `BurbankBigCondensedBold` `Ubuntu-Regular` `Expressway` `PressStart2P` `Roboto-Medium`
`Roboto-Bold` `Roboto-Regular` `Oswald-Medium` `Rainbow` `Teko-Regular` `Exo2-Bold` `ShareTech-Regular`
`Staatliches-Regular` `WorkSans-Medium` `WorkSans-SemiBold` `Philosopher-Bold` `Philosopher-Regular`
`VT323-Regular` `Rubik` (400 + 500) `Bangers` (`/cd47484db99dcbe3.otf`)

`Expressway` and `Rainbow` are declared but referenced by **no** theme — dead weight.

**1 remote stylesheet import**: Google Fonts —
`Akaya Telivigala`, `Hind Madurai` (400/500/700), `Hind Siliguri` (400/500/700), `Mali` (400/500/700),
`Noto Sans HK/JP/KR/SC/TC` (400/500/700), `Noto Sans` (400/700), `Rubik` (400/500/700).

**3 SVG + 15 PNG** decoration sprites (hashed root-relative paths, mapped per-theme in §2.5).
**Zero data-URIs** — every asset is a separate request.

### 2.7 Where Studio uses it `[observed]`

Chunk `114.15f34f2a5005b32d.js` renders the **"DEMO CHAT"** preview of the on-stream chat overlay:

* `EmbedChatMessagesList` fed by a canned rotation of demo authors
  (`MusicLover`, `FirstTimeViewer`, `RegularViewer`, `QuestionAsker` …) — one message every **2000 ms**, max **6** visible.
* Inline `data:image/svg+xml` platform icons for `twitch` (`#9146FF`), `youtube` (`#FF0000`), `facebook` (`#1877F2`).
* Default avatar `https://chat.restream.io/assets/icons/no-avatar-icon.svg`.
* `showAvatars` enabled only when `themeName.startsWith("default") && !themeName.includes("compact")`.
* Overlay props: `theme, alignment (Top|Bottom), messageOpacity, backgroundOpacity, scale, hideMessages, touchesEdges`
  — the three opacity/scale values are divided by 100 before being passed down.
* The consumer also passes an **undocumented** `maxContainerHeight: 1000` (not in `propTypes`).
* Real (non-demo) chat renders through an `iframe` with `chatUrl` + `chatToken`; there is also a
  `/embed` and `/embed-studio` route reference.

### 2.8 Rebuild vs. substitute

**Reuse / port directly.** Pure markup + CSS, zero Restream service coupling; the JS shell is ~200 lines.
OSS only helps with the plumbing, not the look:

| Need | OSS equivalent |
|---|---|
| Virtualised message list | `virtua`, `react-window`, `@tanstack/react-virtual` |
| Auto-scroll / stick-to-bottom | `use-stick-to-bottom` |
| Multi-platform chat aggregation | `tmi.js` (Twitch), YouTube Live Chat API, `comfy.js` |

There is **no OSS equivalent for the 28 game-branded themes** — they are original CSS/art.
⚠ Several are trade-dress of Fortnite / PUBG / League of Legends / Rainbow Six / Overwatch /
Black Ops 4 / AC Odyssey / Minecraft / World of Tanks / World of Warcraft — **do not ship as-is**;
re-author with neutral names/palettes.

---

## 3. `onboarding-chat.2a0e5f8a2643f258.js` (62 KB) + `onboarding-chat.c26d458b5c638966.css` (31 KB) — **Restream AI Assistant (agentic LLM chat)**

### 3.1 Verdict

**Not** a guided onboarding wizard. It is a **tool-calling LLM agent chat panel that drives Studio itself**.
Export: `OnboardingChat` (module `25616`).
`[observed]` UI strings: **`"AI Assistant"`**, `"Ask AI to create scenes, tune graphics, write captions, and prep your stream."`

### 3.2 Component inventory `[observed]` — JS class names and CSS modules agree exactly

| Component | Purpose (from element names) |
|---|---|
| `OnboardingChat` | root: `emptyState*` (header/title/text/body/actions/suggestions/markIcon/start), `errorBanner`, `configWarning`, `progressIndicator`/`progressLabel`, `reasoningBlock`/`reasoningLabel`/`reasoningText`, `toolResult{Body,Details,Section,SectionLabel}`, `toolSearch{Label,Query,Term,Empty,FoundList,FoundItem,ResultDetails}`, `urlDisplay`/`urlDisplayLoading`/`urlIcon`/`urlInput`, `markdownBody`, `messageUnsupported`, `systemPromptSlot`, `widgetModelBadge`, `userTurnRow`, `chatContent`, `chatScroller` |
| `MessageScroller` | viewport with top/bottom fade masks (`--top-fade`, `--bottom-fade`, `--mask-image-content`, `--mask-image-scrollbar`, `--scrollbar-gutter`), `viewportScrolledFromTop/Bottom`, "Scroll to latest messages" button |
| `Message` / `Bubble` | `align start\|end`; bubble variants `tinted` / `plain` |
| `IntentChips` | starter-prompt chips (`root`, `chip`) |
| `ChatHint` | hint card with slots `icon`, `message`, `body`, `capability`, `configuration`, `suggestion`, `source` |
| `ChatStatus` | spinner + label; `iconFailed`, `labelTerminal` |
| `AiChatMetrics` | per-message-part perf tooltips (see §3.6) |
| `ResourcePicker` | card grid: `thumbnail`/`thumbnailImage`/`thumbnailPlaceholder`, `name`, `origin`, `meta`; `data-resource-type` ∈ `library` \| `scraped` |
| `AudioOptionsPicker` | music chooser: `waveform`/`waveformInput`, `player`, `playPause`, `skipButton`, `time` (`mm:ss`), `tags`, `title`, `cards`/`card`/`cardHeader`/`cardHeaderIcon`, `pickButton`, `barsRow`/`bar`/`barFill` |
| `WidgetAsset` *(in chunk 131)* | live widget preview card: `"Designing widget…"` → `"Widget added"`; actions `"Apply to scene"`, `"Open the widgets tab"`; scales preview against a 1920-px design width via `ResizeObserver` |

### 3.3 Composer syntax `[observed]`

| Regex | Meaning |
|---|---|
| `/(?:^\|\s)\/([a-z0-9_]+)/g` | `/tool_name` — direct tool invocation |
| `/(?:^\|\s)@(all-scenes\|scenes:[\w,-]+)/g` | `@all-scenes`, `@scenes:<id,…>` — scope to scenes |
| `/(?:^\|\s)@(widgets:[\w,-]+)/g` | `@widgets:<uuid,…>` — scope to browser-source widgets |
| `/(?:^\|\s)@image:([\w-]+)/g` | `@image:<id>` — reference a pasted image |

Rendered inline as chips with icons: `scene` / `widget` / `tool` variants, each in a tooltip
describing the resolved scope.

Image-paste limits `[observed]`: **max 5 MB**, **max 6 images**, types **PNG / JPEG / GIF / WebP** —
errors `TooLarge` / `UnsupportedType` / `TooMany` / `ReadFailed` map to
`"That image is too large to attach (max 5 MB)."`, `"That file type can’t be attached. Use PNG, JPEG, GIF, or WebP."`,
`"You can attach up to 6 images at a time."`, `"That image couldn’t be attached."`.
Gated by URL flag `ai-chat-image-paste`.

### 3.4 Empty-state suggestion sets `[observed]`

**Capability chips** (`ln`) — one per generator tool:

| id | Label | Description |
|---|---|---|
| `generate_animated_background` | Animated background | Add a smooth looping video backdrop for your stream. |
| `generate_background` | Solid color background | Add a simple color or gradient fill behind your layout. |
| `generate_photorealistic_background` | Photorealistic background | Add a realistic, photo-style scene for your stream. |
| `generate_widget` | Custom widget | Add a dynamic on-stream visual like a poll, leaderboard, ticker, or scoreboard. |
| `generate_music` | Music | Generate a short music track for your stream — instrumental or with lyrics. |

**Scene starter prompts** (`vn`) — the full prompt text ships in the bundle:

| id | Label | Prompt `[observed verbatim]` |
|---|---|---|
| `polish-studio` | Create countdown | *"Create a new scene, first in the list with title: Countdown; Generate a Realistic infinite animated background(start frame and end frame should be the same) in 16:9 orientation of techno abstraction; it should be very dark as I plan to use white color of the text; animation should be slow; use Geist pixel font and position in the center of the canvas; size of the countdown should be medium; Add caption Starting soon; countdown duration 1 min; select some random music and put 10% volume; autoswitch should be enabled"* |
| `create-scenes` | Scene with Cascais vibes | *"Create a new scene with title: Cascais vibes; Generate a Realistic infinite animated background(start frame and end frame should be the same) in 16:9 orientation of dolphin next to the Cascais panoramic view. Add one participant placeholder and use contain layout. Also, add caption: Cascais vibes✨; ticker: Cascais 2026;"* |
| `write-captions` | Update title | *"Update title to Live with Restream and Description to Office hours livestream"* |

**Widget starter prompts** (`xn`):

| id | Label | Prompt |
|---|---|---|
| `weather-widget` | New York weather widget | `New York current weather widget` |
| `police-stripe-widget` | Police DO NOT CROSS animated stripe | `DO NOT CROSS police animated stripe` |
| `tv-static-widget` | TV static effect | `TV static effect widget` |

Also `"Start with:"`, `"Describe a widget and AI will design it for you."`, `"AI chat suggestions"`,
`"Producthunt link"`, `"Found online"`.

### 3.5 Message-part rendering `[observed]`

Part types handled: `text`, `reasoning` (collapsible **"Reasoning"** block), `tool-*`, `dynamic-tool`, `step-start`.
Tool states: `input-streaming`, `input-available`, `approval-requested`, `approval-responded`,
`output-available`, `output-error`.

Status strings: `"Approved {{toolName}}."`, `"Used {{toolName}}"`, `"Skipped {{toolName}}."`,
`"Setting up {{toolName}}…"`, `"Thinking…"`, `"Setting up your studio…"`, `"Input"`, `"Output"`, `"Reasoning"`.

Web-fetch: `"Preparing to fetch webpage…"`, `"Fetch approved for {{title}}."`, `"Fetched {{title}}"`,
`"Failed to fetch {{title}}"`, `"The webpage could not be fetched."`, `"This URL is not allowed."`,
`"a webpage"`; error code `web_fetch_tool_result_error`.

Tool search: providers `tool_search_tool_regex` (`regex`) and `tool_search_tool_bm25` (`bm25`);
strings `"Searched for:"`, `"Found:"`, `"No tools found"`. Batch executor: `execute_tools_batch`.

Sub-result renderers: audio picker (`present_audio_options` → `AudioOptionsPicker`, `"Pick a track"` /
`"Pick this"` / `"Skip"` / `"Play"` / `"Seek"`), questionnaire (`ask_questions`), background/logo/widget
asset cards (`backgroundId`, `logoId`, `"Logo added"`, `"Uploading logo…"`).
Cancellation sentinel: `"__chat_cancelled__"`. Animations use blur+scale variants
(`blur(8px)`→`blur(0px)`, `scale .94 → 1 → 1.06`, `easeOut`, `popLayout`).

### 3.6 Per-part performance HUD `[observed]` (`AiChatMetrics`, label `"AI chat metrics"`)

| Metric | Verbatim tooltip |
|---|---|
| `TTFT` | "Time from the latest user message or tool-result submission until this message part first appeared in the chat." |
| `write` | "Time from the first observed output until this part finished streaming. While streaming, this uses the current time." |
| `est. TPS` | "Estimated tokens per second based on roughly 4 characters per token." (`ceil(chars/4) / seconds`) |
| `chars` | "Number of characters observed in this message part." |
| `start` | "Time spent writing the tool input arguments before execution could start." |
| `run` | "Time from arguments becoming available until the tool reached a final state." |
| `retry`, `total` | additional tool-timing labels |

Durations formatted `<1000 ms → "Nms"`, `<10 s → "N.Ns"`, else `"Ns"`. Timing source: `performance.now()`.

### 3.7 Gating / error surface `[observed]`

`"Sign in to enable onboarding chat."` · `"Enjoy free access to AI tools during beta"` ·
`"Daily limit reached. Try again in {{time}}."` / `"Daily limit reached. Try again later."` ·
`aiCreditsIsOver` / `outOfCredits` · `"AI chat tool failed"` · `"Something went wrong. Please try again."` ·
`"AI sent an invalid audio picker — retrying automatically."` ·
`"AI sent an invalid questionnaire — retrying automatically."` ·
`"Could not generate the widget. Please try again."` · `"Could not add the widget to the scene."` ·
`"Could not restore this version of the widget."` · `"Failed to apply logo from chat"` ·
`"Failed to remove logo from chat"` · `"Failed to select widget from chat"` ·
`"Failed to revert widget URL from chat"`.

Analytics events: `AI Chat Tool Used`, `AI Chat Tool Search Completed`
(fields `provider`, `studio`, `user`, `studio_ai`, `output-available`, `output`).

### 3.8 Runtime / model stack `[observed]`

* **Vercel AI SDK v5** is bundled in `externals.b634d3e8690cf1f3.js`:
  `@ai-sdk/provider-utils 5.0.5`, `@ai-sdk/gateway 4.0.11`, `@ai-sdk/openai-compatible 3.0.5`;
  functions `streamText`, `toUIMessageStream`; agent loop tagged **`ai-sdk-agent/tool-loop`**;
  gateway `https://ai-gateway.vercel.sh/v4/ai` with header `ai-gateway-protocol-version: 0.0.1`;
  error classes `AI_APICallError`, `AI_NoSuchModelError`, `AI_LoadAPIKeyError`, `AI_InvalidPromptError`, …
  ⇒ `[inferred]` **the agent loop runs client-side in the browser**, optionally proxied server-side.
* Model ids present in chunk `131` `[observed]`: `openrouter/auto`, `anthropic/claude-opus-4.7`,
  `anthropic/claude-opus-4.6`, `anthropic/claude-opus-4.5`, `anthropic/claude-sonnet-4.6`,
  `anthropic/claude-sonnet-4.5`, `anthropic/claude-haiku-4.5`. Also a CSS token `openrouter-shadow`.
* Feature flags (URL params, `Index.312bd7238c465fa2.js`) `[observed]`:
  `ai-onboarding-chat`, `ai-widgets`, `ai-widget-direct-generation`, `use-ai-backend`,
  `ai-proxy-via-creator-backend`, `openrouter-model`, `ai-system-prompt-override`, `ai-chat-image-paste`
  (store fields `aiOnboardingChat`, `aiWidgets`, `aiWidgetDirectGeneration`, `aiCreditsIsOver`,
  `useAiBackend`, `aiProxyViaCreatorBackend`, `openrouterModel`, `aiSystemPromptOverride`, `aiChatImagePaste`).

### 3.9 Agent tool registry — lives in chunk `131.8f878df5d7c38b5a.js`, **not** in this bundle `[observed]`

> Flagged for the chunk-131 owner. Reproduced here because it *is* the onboarding-chat feature set.
> A full natural-language **system prompt** (≥18 KB, two variants) is embedded verbatim in chunk 131,
> covering widget/image reference tokens, output discipline ("Run silent", never emit hex/UUIDs in chat),
> and the private-chat vs live-chat distinction (pin / show semantics).

| Group | Tools |
|---|---|
| Scenes | `get_scenes` `create_scene` `create_scenes_batch` `delete_scene` `select_scene` `toggle_auto_switch` `set_scene_layout_type` `update_scene_layout_options` `update_scene_note` |
| Scene content | `add_scene_card` `add_scene_button` `add_source_image` `add_media_placeholder` `add_camera_placeholder` `remove_camera_placeholder` `toggle_participant_names_visibility` |
| Graphics | `set_scene_caption` `create_caption` `select_caption` `get_captions` `delete_caption` `set_scene_ticker` `create_ticker` `set_ticker_speed` `delete_ticker` `set_scene_background` `upload_background` `delete_background` `set_scene_overlay` `upload_overlay` `delete_overlay` `set_scene_logo` `set_scene_logo_position` `upload_logo` `delete_logo` |
| Theming | `get_theming` `set_theme_type` `set_primary_color` `set_font` `get_color_palette_from_image` |
| AI generation | `generate_background` `generate_photorealistic_background` `generate_animated_background` `generate_transparent_overlay` `generate_widget` `generate_music` |
| Browser sources / widgets | `get_browser_sources` `create_browser_source` `add_scene_browser_source` `update_scene_browser_source` `delete_browser_source` |
| QR codes | `get_qr_codes` `create_qr_code` `set_scene_qr_code` `delete_qr_code` |
| Countdown | `set_countdown_duration` `set_countdown_size` `set_countdown_font` `set_countdown_color` `set_countdown_position` `set_countdown_scale` `set_countdown_music` `set_countdown_music_volume` |
| Audio | `get_audio_backgrounds` `get_custom_music` `upload_custom_music` `present_audio_options` |
| Participants | `toggle_participant_source` `set_participant_muted` `set_participant_volume` `set_participant_camera_blinded` `set_participant_name` `set_participant_audio_only` |
| Chat overlay | `set_scene_chat_overlay_enabled` `update_scene_chat_overlay_options` |
| Chat read | `get_private_chat_messages` `get_live_chat_messages` |
| Meta | `ask_questions` `finish_setup` `web_fetch` `execute_tools_batch` `tool_search_tool_regex` `tool_search_tool_bm25` |

Image-reference parameters `[observed in the system prompt]`:
`generate_widget.pastedImageReferences[]` · `generate_photorealistic_background.pastedImageReference` ·
`generate_animated_background.pastedImageReference` · `generate_transparent_overlay.pastedImageReference` ·
plus `generate_widget.existingBrowserSourceId` for in-place widget edits.

### 3.10 Rebuild vs. substitute

**Substitute the plumbing, rebuild the surface.**

| Layer | OSS equivalent |
|---|---|
| Transport + agent loop + tool calling | **Vercel AI SDK v5** — `ai`, `@ai-sdk/react` (`useChat`, `DefaultChatTransport`), `streamText`, `stepCountIs`, `tool()` (already what Restream uses) |
| Model routing | **OpenRouter** and/or **Vercel AI Gateway** (already what Restream uses) |
| Markdown rendering | `react-markdown` + `remark-gfm` |
| Motion | `motion` / `framer-motion` |
| Waveform picker | `wavesurfer.js` |
| Tool search (BM25) | `wink-bm25-text-search`, `minisearch`, `orama` |

Must be written from scratch: the ~70-tool registry bound to your own Studio state, the `@`/`/` mention
composer, `AudioOptionsPicker`, `ResourcePicker`, `WidgetAsset`, and the per-part metrics HUD.

---

## 4. `agentation.6e2fe827872bef18.js` (178 KB) — **"Agentation": in-page visual feedback tool for AI coding agents**

### 4.1 Purpose `[observed]` — resolved

Name = *agent* + *annotation*. It injects a floating toolbar that lets a user **click any DOM element,
drop a numbered marker, type feedback, and export the whole set as Markdown** enriched with React
`debugSource` `file:line:col` data — i.e. feedback pre-formatted for pasting into a coding agent.

It is **not** telemetry and **not** an LLM client: no model ids, no AI-provider fetch, no analytics SDK.

Self-injected `<style>` ids: `feedback-tool-styles-annotation-popup-css-styles`,
`feedback-tool-styles-page-toolbar-css-styles`, `feedback-tool-styles-help-tooltip-styles`,
`feedback-cursor-styles`. Root id `agentation-root`.
Data attributes: `data-annotation-marker`, `data-feedback-toolbar`, `data-active`, `data-clickable`,
`data-status`, `data-resource-picker`.

### 4.2 Public API `[observed]`

```js
export function Agentation({
  demoAnnotations, demoDelay = 1000, enableDemoMode = false,
  onAnnotationAdd, onAnnotationDelete, onAnnotationUpdate, onAnnotationsClear,
  onCopy, onSubmit, copyToClipboard = true,
  endpoint, sessionId, onSessionCreated, webhookUrl, className
} = {})
```

Mounted lazily `[observed]` (`575.434695f973e2e774.js`, module `30438`):

```js
const r = lazy(() => o.e("782").then(o.bind(o,6886)).then(e => ({default:e.Agentation})));
function n({env, isEnabled}) {
  return isEnabled && env.AGENTATION_HOST
    ? <Suspense fallback={null}><r endpoint={env.AGENTATION_HOST}/></Suspense>
    : null;
}
```

Gate `[observed]` (`Index.312bd7238c465fa2.js`):
`isAgentationEnabled` = URL param `?agentation=` (`"false"` disables) else env `IS_ENABLED_AGENTATION`.
⇒ `[inferred]` an **internal / staff dogfooding tool**, not user-facing.

### 4.3 Feature list `[observed]`

| Feature | Evidence |
|---|---|
| Enter / exit annotation mode | `"Start feedback mode"`, `"Exit"`, `Esc`/`Escape`, `keyup` handling |
| Element probing & smart target resolution | `probe`, `smart`, `multi-select`; walks up to **10** ancestors looking for a React fibre `debugSource` |
| Numbered markers (`left:%`, `top:px`) | `.marker`, `animationDelay = 20 ms × index` stagger; `enter` / `exit` / `clearing` classes |
| Multi-select annotation | `isMultiSelect` → marker colour `var(--agentation-color-green)` vs `--agentation-color-accent` |
| Fixed-element handling | `isFixed` markers rendered in a separate layer |
| Marker click behaviour setting | `markerClickBehavior` ∈ `edit` \| `delete` (delete shows a hovered state) |
| Show / hide markers | `"Hide markers"` / `"Show markers"` |
| Clear all | `"Clear all"` |
| Inline editor | `"Edit your feedback..."`, `"Save"`, `"Delete"` |
| Text-selection capture | `selectedText`, `nearbyText`, `nearbyElements` |
| **Copy feedback as Markdown** | `"Copy feedback"`, prop `copyToClipboard` (default `true`) |
| Output detail levels | `"Output Detail"` → `compact` \| `standard` \| `detailed` \| `forensic` |
| Marker colour picker | `"Marker Color"`; tokens `--agentation-color-{accent,green,red,blue,yellow}` |
| Light / dark theme | `"Switch to light mode"` / `"Switch to dark mode"`; `localStorage["agentation-theme"]`, `["agentation-color-tokens"]`, `["agentation-accent"]`; `feedback-toolbar-theme` |
| **Webhooks** | `"Webhooks"` + `"Auto-Send"` toggle + `webhookUrl` textarea; tooltip *"Send annotation data to any URL endpoint when annotations change. Useful for custom integrations."*; *"The webhook URL will receive live annotation changes and annotation data."* |
| Session endpoint | props `endpoint`, `sessionId`, `onSessionCreated`; `localStorage["agentation-session-…"]`; HTTP verbs `POST`, `PATCH`, `DELETE` |
| Freeze / hot-reload guard | `sessionStorage["agentation_freeze"]`, `HotReload`, `Hot` |
| Annotation lifecycle | statuses `idle` `submitted` `fulfilled` `resolved` `dismissed` `failed` `picked` `skipped` `filtered` |
| VS Code deep link | `` `vscode://file/${fileName}:${line}:${col}` `` (source formatter modes `"path"` \| `"vscode"`) |
| Event isolation | stops `mousedown` / `click` / `pointerdown` propagation inside its own root so the host app never sees them |

### 4.4 Markdown export format `[observed]` (reconstructed from the template literals)

```
## Page Feedback: {title}

## forensic only
**Environment:**
- Viewport: {w}×{h}
- URL: {location.href}
- User Agent: {navigator.userAgent}
- Timestamp: {ISO8601}
- Device Pixel Ratio: {dpr}
---

## standard / detailed
**Viewport:** {w}×{h}

### {n}. {element}
**Location:** {elementPath}
**Source:** {fileName}:{line}:{col}      # React debugSource
**React:** {reactComponents}
**Classes:** {cssClasses}                # detailed+
**Position:** {x}px, {y}px ({w}×{h}px)   # detailed+
**Selected text:** "{…}"
**Context:** {nearbyText[0..100]}        # detailed+
**Feedback:** {comment}

## forensic additionally emits
**Full DOM Path:** · **CSS Classes:** · **Position:** x,y (w×h px)
**Annotation at:** {x}% from left, {y}px from top
**Selected text:** · **Context:** · **Computed Styles:** · **Accessibility:**
**Nearby Elements:** · **Source:** · **React:** · **Feedback:**
(+ "*Forensic data shown for first element of selection*" when multi-select)

## compact  (one line per item)
{n}. **{element}** ({sourceFile}): {comment} (re: "{selectedText[0..30]}...")
```

Semantic elements it labels `[observed]`: `ABBR ADDRESS ARTICLE ASIDE BLOCKQUOTE BUTTON CAPTION CITE CODE
DFN DIV FIGCAPTION IMG INPUT LABEL LEGEND MARK NAV PRE SECTION SMALL SPAN STRONG SUB SUP TEXTAREA TIME`
plus friendly names `paragraph`, `list item`, `code block`, `image`, `video`, `clickable`.

### 4.5 Rebuild vs. substitute

**Substitute — nothing here is Restream-specific beyond the `AGENTATION_HOST` prop.**

| Need | OSS / product equivalent |
|---|---|
| Browser toolbar → DOM + source context → coding agent | **`stagewise`** (stagewise.io) |
| Click element → open in editor | `click-to-react-component`, `vite-plugin-react-click-to-component`, Next.js dev overlay |
| React component/fibre inspection | `react-scan`, `bippy` |
| Visual feedback / annotation SaaS | Marker.io, BugHerd, Userback (commercial) |

---

## 5. `hlsjs.3e5d0a83ecd57757.js` (400 KB) — **hls.js v1.3.5 (vendored, preloaded)**

### 5.1 Identity `[observed]`

| Fact | Value |
|---|---|
| Version | **`Hls.version === "1.3.5"`** (`{key:"version",get:function(){return"1.3.5"}}`) |
| Packaging | rspack chunk id **`356`**, single module **`39473`**, containing an inner webpack-4 bundle whose module keys are the original source paths (`./src/hls.ts`, `./src/config.ts`, `./src/controller/*.ts`) |
| Guard | `"undefined"!=typeof window` → browser-only; `module.exports = require("./src/hls.ts").default` |
| Loading | plain `<script src="/hlsjs.3e5d0a83ecd57757.js">` in the shell HTML. It is **absent from the runtime `c.u` map**, so it can never be lazy-fetched — it *must* be preloaded |
| Controllers compiled in | `abr`, `audio-stream`, `audio-track`, `subtitle-stream`, `subtitle-track`, `buffer`, `timeline` |
| Source map | `hlsjs.3e5d0a83ecd57757.js.map` referenced (not captured) |

### 5.2 What Studio uses it for `[observed]`

Sole consumer: **`HlsVideoPlayer`** in chunk `446.9c38229d9364cb92.js` (`i(39473)`), a MobX-decorated
service class (`observable.ref` on `state` / `position`, `@action`, `@computed`).

| Aspect | Detail |
|---|---|
| Purpose | **Playing pre-recorded HLS video *into the live scene*** (shared media playback) — not the preview monitor, not destination monitoring |
| Modes | `"HLS"` (MSE, when `Hls.isSupported()`) → `"NATIVE"` (`canPlayType("application/vnd.apple.mpegurl")`, Safari) → `"NOT_SUPPORTED"` |
| States | `OFFLINE` `LOADING` `PLAYING` `ERROR` `NOT_SUPPORTED` (+ derived `isLoading` `hasError` `isSupported` `isOffline` `isSeeking` `isPaused`) |
| API | `open(source, config)` · `play` · `pause` · `stop` · `seek(d)` · `seekAsync(d)` (20 000 ms timeout → `HlsVideoSeekAwaitTimeoutException`) · `loop(bool)` · `mute` / `unmute` · `destroy` · `position` |
| Event wiring | `MEDIA_ATTACHED` → `loadSource`; `MANIFEST_PARSED` → autoplay if `shouldAutoPlayOnOpen`; `FRAG_BUFFERED` → `PLAYING`; `ERROR` → `BUFFER_STALLED_ERROR` ⇒ `LOADING`; fatal `NETWORK_ERROR` ⇒ `startLoad()` (+ report on `manifestLoadError`); fatal `MEDIA_ERROR` ⇒ `recoverMediaError()`; otherwise ⇒ `ERROR` |
| Teardown | `detachMedia()` → `stopLoad()` → `destroy()` → `removeAttribute("src")` → remove `timeupdate`/`seeking`/`seeked` listeners |
| Error classes | `HlsVideoPlayerServiceError` · `HlsVideoNotSupportedError` · `HlsVideoException` · `HlsVideoSeekAwaitTimeoutException` |

Room-side model `[observed]` (io-ts decoders in `restream.887…js`, store in chunk `593`):

```
HlsVideoId · HlsVideoPlaybackId · HlsVideoStatus ∈ {PLAYING, PAUSED}
JsonHlsVideoPayload = { playlistUrl, lqPlaylistUrl, hlsVideoId, playbackId, status,
                        position, duration, width, height, displayAspectRatio, isLooped }
```

Chunk `593` binds it into `roomHlsVideosStore` with `captureMediaStream`, `drawVideoToCanvas`,
`startSyncingPlayback`, `seekByPercent`, `updateParameters`, `remove`, `resume`, `remainedSec`.
`[inferred]` the `<video>` is drawn to a canvas and captured as a `MediaStream` so it can be mixed into
the broadcast, with playback position synchronised across room participants; guests receive the
`lqPlaylistUrl` low-quality rendition.

> **Two different hls.js versions ship simultaneously** `[observed]`:
> the `hlsjs` chunk is **1.3.5** (in-scene media playback), while `restreamvideoeditor` carries its **own
> private 1.4.5** copy (trim-editor preview, CMCD-capable). The trim editor never imports module `39473`.
> No other `attachMedia` / `loadSource` / `.m3u8` call site exists anywhere in the capture, so
> **destination monitoring and recording playback do *not* use hls.js** in this build.

### 5.3 Rebuild vs. substitute

**Substitute — it already *is* the OSS library.** Use `hls.js` (Apache-2.0) directly, at **one** version
(current `1.6.x`), and delete the duplicate. The only Restream-specific code is the ~120-line
`HlsVideoPlayer` wrapper, trivially re-implementable — or replace the whole wrapper with
**`vidstack`**, **`media-chrome`**, or **`shaka-player`** (which also gives you DASH).

---

## 6. `awssdk.06c9eae97cc86f8d.js` (3.3 MB) — **AWS SDK for JavaScript v2 (browser bundle)**

### 6.1 Identity `[observed]`

| Fact | Value |
|---|---|
| SDK | **aws-sdk-js v2**, `VERSION: "2.1337.0"` |
| Style | monolithic `Service.defineService(name, [apiVersions])`; **zero** `@aws-sdk/`, `@smithy/`, `@aws-crypto/` strings ⇒ definitively **not** the modular v3 |
| Chunk id | `607` (lazy) |
| Services compiled in | **91** — the stock browser service set, untouched |
| Core location | the SDK *core* (`lib/core.js` + the full service-metadata table) is inlined into the **main** bundle, module `40406`; chunk `607` supplies the API models |

Full service list `[observed]`:

```
acm apigateway applicationautoscaling athena autoscaling cloudformation cloudfront cloudhsm cloudhsmv2
cloudtrail cloudwatch cloudwatchevents cloudwatchlogs codebuild codecommit codedeploy codepipeline
cognitoidentity cognitoidentityserviceprovider cognitosync comprehend comprehendmedical configservice
connect costexplorer cur devicefarm directconnect dynamodb dynamodbstreams ec2 ecr ecs efs elasticache
elasticbeanstalk elastictranscoder elb elbv2 emr firehose forecastqueryservice forecastservice gamelift
iam inspector iot iotanalytics iotdata kinesis kinesisvideo kinesisvideoarchivedmedia kinesisvideomedia
kinesisvideosignalingchannels kms lambda lexmodelbuildingservice lexruntime lexruntimev2 location
machinelearning marketplacecatalog marketplacecommerceanalytics mediastoredata mobileanalytics mturk
opsworks personalize personalizeevents personalizeruntime polly pricing rds redshift rekognition
resourcegroups route53 route53domains s3 secretsmanager servicecatalog ses sns sqs ssm storagegateway
sts translate waf workdocs xray
```

**No MediaConvert. No Elemental. No Transcribe.** `elastictranscoder` and `mediastoredata` appear only
because they are part of the stock browser build; nothing in the app references them.
`[inferred]` Restream did **not** tree-shake — they shipped the default browser build and use exactly one client.

### 6.2 The only client actually used: **S3** `[observed]`

Verbatim upload implementation from `restream.887…js`:

```js
const { S3, config } = await Promise.all([r.e("607"), r.e("298"), r.e("492")])
                             .then(r.t.bind(r, 18423, 19));
const { AwsCredentials } = await r.e("801").then(r.bind(r, 40406));

const creds = new AwsCredentials({ accessKeyId, secretAccessKey, sessionToken, onRefreshCredentials });
config.update({ region: destination.region, credentials: creds, correctClockSkew: true });

const s3 = new S3({ useAccelerateEndpoint: true });              // S3 Transfer Acceleration

const upload = new S3.ManagedUpload({
  params:   { Bucket: destination.bucket, Key: destination.filename, Body: file },
  partSize: Math.max(5242880, file.size / 1e4),                  // ≥5 MiB, ≤10 000 parts
  service:  s3
});
onCreateUpload?.(upload);
upload.on("httpUploadProgress", handleProgress);
await upload.promise();
```

`AwsCredentials` `[observed]`:

```js
class AwsCredentials extends AWS.Credentials {
  refresh(cb) {
    this.onRefreshCredentials()
      .then(c => { this.accessKeyId = c.accessKeyId;
                   this.sessionToken = c.sessionToken;
                   this.secretAccessKey = c.secretAccessKey; cb(); })
      .catch(cb);
  }
}
```

| Mechanism | Detail |
|---|---|
| Upload type | **Multipart** via `S3.ManagedUpload` (`createMultipartUpload` / `uploadPart` / `completeMultipartUpload` all present in the chunk) |
| Part size | `max(5 MiB, fileSize / 10 000)` — adapts to S3's 10 000-part ceiling |
| Endpoint | **S3 Transfer Acceleration** (`useAccelerateEndpoint:true`; `s3-accelerate` host present; `dualstack` support compiled in) |
| Auth | **STS temporary credentials, not presigned URLs.** Refresh callback re-fetches on expiry |
| Credential fetch | `GET /files/upload-credentials?s={timestamp}` → io-ts `uploadCredentialsDecoder`: `{credentials:{accessKeyId, secretAccessKey, sessionToken}, destination:{bucket, filename, region}, uploadId}` |
| Credential refresh | `POST /files/upload-credentials/{uploadId}/refresh` |
| Clock-skew recovery | on `RequestTimeTooSkewed` → `s3.config.systemClockOffset = Date.parse(err.ServerTime) - Date.now()`, then **one** retry; `correctClockSkew:true` also set globally |
| Progress | `httpUploadProgress` → `handleProgress` |
| Cancellation | `onCreateUpload(upload)` handed back so the caller can `.abort()` |
| Errors | `uploadFile: AWSFileUploadError`, `uploadFile: AWSFileUploadError after RequestTimeTooSkewed`; quota `files_limit` → `VideoLimitError(Uploads)` |
| Presigned URLs | `getSignedUrl` / `createPresignedPost` exist in the SDK but are **never called for upload**; downloads use server-issued signed URLs (`getSignedUrlForDownloadChoppity`, `/download`) |
| YouTube import | separate server-side path: `POST /files/import` with `sourcePlatformId: YOUTUBE` |

### 6.3 Rebuild vs. substitute

**Substitute urgently — aws-sdk-js v2 reached end of support in 2025 and this bundle is 3.3 MB for one client.**

| Need | Replacement |
|---|---|
| S3 multipart with progress + abort | `@aws-sdk/client-s3` + **`@aws-sdk/lib-storage`** `Upload` (`partSize`, `queueSize`, `httpUploadProgress` event, `.abort()`) — ~3.3 MB → ~200 KB |
| Transfer Acceleration | `new S3Client({ useAccelerateEndpoint: true })` |
| Refreshable STS creds | v3 credential provider function (`credentials: async () => …`) — auto-refreshes on expiry, no subclassing |
| Clock skew | handled automatically by v3 |
| Turn-key uploader UI | **Uppy** `@uppy/aws-s3` (multipart + presigned), or **tus-js-client** for resumable-by-default |

---

## 7. `mediapipetasksvision.a54ec1e1b0502c02.js` (881 KB) — **MediaPipe Tasks Vision (WASM)**

### 7.1 Identity `[observed]`

Chunk id `202`, module `23260`. Named exports:

```
DrawingUtils · FaceDetector · FaceLandmarker · FaceStylizer · FilesetResolver · GestureRecognizer
HandLandmarker · ImageClassifier · ImageEmbedder · ImageSegmenter · InteractiveSegmenter
MPImage · MPMask · ObjectDetector · PoseLandmarker · default: vision
```

**Version**: no version literal is embedded anywhere in the JS or the WASM. Fingerprints `[observed]`:

| Fingerprint | Implication |
|---|---|
| `FaceStylizer` present | ≥ 0.10.0 |
| `MPMask` / `MPImage` split present | ≥ 0.10.2 |
| `HolisticLandmarker` **absent** | < 0.10.10 |
| `ImageGenerator` / `LlmInference` absent | tasks-vision only, not tasks-genai |
| `GraphRunner` / `graph_runner` core, `wasmLoaderPath` / `wasmBinaryPath` | standard 0.10.x fileset resolver |
| WASM build stamp string `2023.05.24` | mid-2023 build |

⇒ `[inferred]` **`@mediapipe/tasks-vision` ≈ 0.10.2 – 0.10.9**. `[UNRESOLVED]` exact patch not determinable offline.

WASM assets are **self-hosted**, not CDN `[observed]`
(`03-deep-static/recursive/studio.restream.io/mediapipe/`), resolved by `FilesetResolver.forVisionTasks("/mediapipe")`:

| File | Bytes |
|---|---|
| `vision_wasm_internal.js` | 125,742 |
| `vision_wasm_internal.wasm` | 8,527,863 |
| `vision_wasm_nosimd_internal.js` | 125,657 |
| `vision_wasm_nosimd_internal.wasm` | 8,208,014 |

### 7.2 Task APIs actually invoked — exactly **one**: `ImageSegmenter` `[observed]`

Of the 15 exported task classes, **only `ImageSegmenter` + `FilesetResolver`** are ever constructed
anywhere in the capture. `FaceDetector`, `FaceLandmarker`, `FaceStylizer`, `GestureRecognizer`,
`HandLandmarker`, `ImageClassifier`, `ImageEmbedder`, `InteractiveSegmenter`, `ObjectDetector`,
`PoseLandmarker` and `DrawingUtils` are dead weight (roughly 600 KB of the 881 KB chunk).

There are **two distinct consumers**:

#### (a) `VideoSegmenter` — virtual background, **GPU**, main thread
`[observed]` `Index.312bd7238c465fa2.js`, module `65177`

```js
const MODELS = [
  { url: ".../image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
    maskTexelSize: [1/256, 1/256] },                        // enum General   = 0
  { url: ".../image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite",
    maskTexelSize: [1/144, 1/256] }                         // enum Landscape = 1
];

const vision   = (await r.e("202","low").then(r.bind(r,23260))).default;   // low-priority prefetch
const fileset  = await vision.FilesetResolver.forVisionTasks("/mediapipe");
const segmenter= await vision.ImageSegmenter.createFromOptions(fileset, {
  baseOptions: { modelAssetPath: MODELS[variant].url, delegate: "GPU" },
  canvas, runningMode: "VIDEO"
});

segmenter.segmentForVideo(video, performance.now(), r => {
  const m = r.confidenceMasks?.[0];
  if (m?.hasWebGLTexture()) return cb(m.getAsWebGLTexture());   // stays on the GPU
  cb(null);
});
```

`[inferred]` The returned WebGL texture is composited by the same WebGL render engine that applies the
LUT colour filters found in the neighbouring module `2699` — `.cube` assets
`classic-film`, `teal-orange`, `warm-cinema`, `icy-drama`, `faded-memories` (enum `LutFilter`).

#### (b) `SkinMaskSegmenterWorker` — skin mask, **CPU**, dedicated Web Worker
`[observed]` `288.e5852046176082ad.js` (a complete standalone worker runtime that `importScripts`
the `202` chunk)

```js
const { FilesetResolver, ImageSegmenter } = vision.default;
const fileset = await FilesetResolver.forVisionTasks("/mediapipe");
const seg = await ImageSegmenter.createFromOptions(fileset, {
  baseOptions: {
    modelAssetPath: ".../image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite",
    delegate: "CPU" },
  canvas: new OffscreenCanvas(1,1),
  runningMode: "VIDEO",
  outputConfidenceMasks: true
});
faceSkinIndex = seg.getLabels().indexOf("face-skin");
bodySkinIndex = seg.getLabels().indexOf("body-skin");
// throws "Failed to resolve skin categories: model labels are [...]" if either is missing

// per frame: segmentForVideo(bitmap, ts, res => {
//   combine(faceSkin, bodySkin) → Uint8Array(round(255 * min(a+b, 1)))
//   postMessage({type:"Result", data, width, height}, [data.buffer])   // transferred
// }); finally bitmap.close()
```

Worker protocol `[observed]`: request `{type: "Create" | "Segment", bitmap, timestamp}` →
response `{type: "Created"}` / `{type:"Result", data, width, height}` / `{type:"Error", message}`.
Errors: `"Segmenter is not created"`, `"Segmentation produced no skin masks"`.

`[inferred]` This drives a **skin-smoothing / touch-up ("beauty") filter** — it isolates the
`face-skin` + `body-skin` classes rather than foreground/background, which is a retouching mask, not a
background mask.

### 7.3 Model manifest present on disk `[observed]`
(`03-deep-static/recursive/storage.googleapis.com/mediapipe-models/`)

| Model | Precision | Delegate | Used by | Mask texel size |
|---|---|---|---|---|
| `image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite` | float16 | **GPU** | virtual background — `General` (square / portrait) | 1/256 × 1/256 |
| `image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite` | float16 | **GPU** | virtual background — `Landscape` | 1/144 × 1/256 |
| `image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite` | float32 | **CPU** | skin mask (worker); labels include `face-skin`, `body-skin` | n/a (Uint8 mask) |

### 7.4 Rebuild vs. substitute

**Substitute — it is already OSS.** Use `@mediapipe/tasks-vision` (Apache-2.0) at a current `0.10.2x`,
self-host `vision_wasm_internal(.nosimd).wasm` plus the three `.tflite` models (all four WASM files and
all three models are already in the capture), and keep the two consumers. Only the ~40-line
`VideoSegmenter` wrapper and the ~60-line `SkinMaskSegmenterWorker` need writing.

Bundle-size win: import only `FilesetResolver` + `ImageSegmenter` from the `vision_bundle_mjs` build and
drop ~600 KB of unused task classes.

Smaller/alternative options: `@mediapipe/selfie_segmentation` (legacy solutions API),
`@tensorflow-models/body-segmentation`, `@vladmandic/human`, or `@ffmpeg/ffmpeg`-free WebGL
chroma/blur if you can accept lower quality.

---

## 8. Cross-cutting summary

| # | Bundle | Chunk | What it is | Verdict |
|---|---|---|---|---|
| 1 | `restreamvideoeditor` 1.1 MB | 151 | Multi-segment **trim** editor for recordings/uploads; server-side render via `inputClippings`. No crop / captions / aspect conversion / thumbnails | **Rebuild UI** (small). Reuse `hls.js` + a timeline OSS lib. Backend `[inferred]` = MediaConvert `InputClippings` |
| 2 | `restreamchatembedthemes` 20 KB + 99 KB CSS | 372 | **28-theme** embeddable chat message list, zero service coupling, opacity/scale parameterised | **Reuse / port directly.** No OSS substitute for the themes; re-author art (trade-dress risk) |
| 3 | `onboarding-chat` 62 KB + 31 KB CSS | 456 | **AI Assistant** — agentic LLM chat driving ~70 Studio tools; Vercel AI SDK v5 + OpenRouter / Vercel AI Gateway; runs client-side | **Substitute plumbing** (`ai`, `@ai-sdk/react`); rebuild tool registry + composer + pickers |
| 4 | `agentation` 178 KB | 782 | In-page DOM annotation → Markdown-for-coding-agents; webhooks, VS Code deep links; staff-gated (`?agentation=`, `IS_ENABLED_AGENTATION`, `AGENTATION_HOST`) | **Substitute** (`stagewise`, `click-to-react-component`, Marker.io) |
| 5 | `hlsjs` 400 KB | 356 (script tag) | **hls.js 1.3.5**; drives `HlsVideoPlayer` for in-scene shared media playback, canvas-captured into the broadcast, position-synced across the room | **Substitute** — it *is* hls.js; upgrade to 1.6.x and unify with the editor's private 1.4.5 copy |
| 6 | `awssdk` 3.3 MB | 607 | **aws-sdk-js v2.1337.0**, 91 services compiled but only **S3** used: `ManagedUpload` multipart + Transfer Acceleration + refreshable STS creds + clock-skew retry | **Substitute urgently** (v2 EOL, 3.3 MB for one client) → `@aws-sdk/client-s3` + `@aws-sdk/lib-storage`, or Uppy |
| 7 | `mediapipetasksvision` 881 KB | 202 | **@mediapipe/tasks-vision ≈0.10.2–0.10.9**; only `ImageSegmenter` used — GPU selfie segmenter (virtual background, 2 model variants) + CPU multiclass skin mask in a worker (skin smoothing) | **Substitute** — same OSS package, current version, tree-shaken to 2 exports |

### Counts

| Metric | Value |
|---|---|
| Sub-apps catalogued | 7 (+ 3 supporting chunks: `288` worker, `446` `HlsVideoPlayer`, `Index` render engine) |
| Chat embed themes enumerated | **28** (27 in `themeNames` + 1 in the extra set), each with font / colour / background / decoration assets |
| Chat embed message layouts | 14 distinct React components |
| Chat embed fonts | 20 self-hosted families (22 `@font-face`) + 12 Google Fonts families |
| Chat embed sprite assets | 3 SVG + 15 PNG |
| Video-editor components | 12 bespoke + 14 shared UI primitives |
| Video-editor hotkeys | 6 active, 5 reserved |
| Video Storage API methods | 19 (+ 6 recordings API) |
| AI agent tools (registry in chunk 131) | **~72** across 13 groups |
| AI models routed | 7 ids (`openrouter/auto` + 6 Anthropic) |
| Agentation output formats | 4 (`compact`, `standard`, `detailed`, `forensic`) |
| AWS services compiled | 91; **1** actually used (S3) |
| MediaPipe task classes exported | 15; **1** actually used (`ImageSegmenter`) |
| MediaPipe models on disk | 3 `.tflite` + 4 WASM/loader files |
| hls.js copies shipped | 2 (1.3.5 global, 1.4.5 private to the editor) |

### Unresolved / flagged

| Item | Status |
|---|---|
| Chunk `298` (part of the S3 dynamic-import triple) | **UNRESOLVED** — not in the capture and not in the runtime `c.u` map |
| Exact `@mediapipe/tasks-vision` patch version | **UNRESOLVED** — no version literal in JS or WASM; bracketed to 0.10.2–0.10.9 by feature fingerprints |
| `Choppity` integration (`/integrations/files/…`, 3.5 s polling, `AnalyseFail` status, signed download URLs) | Endpoints and polling loop observed; identified as a third-party **AI clip-generation** provider `[inferred]` — the product name never appears in a user-facing string |
| `liveClipsEnabled` / `LiveClipsUpgrade` / `LiveClipsChange` / `liveClipsMinutesPerStreamAvailable` / `shouldEnableLiveClipping` / `shouldShowLiveClippingOnInit` | Live-clipping feature flags observed in `restream.887…js` + `Index.*.js`; **the clip UI itself is in none of the seven bundles in this domain** |
| `Expressway`, `Rainbow` `@font-face` in the chat-theme CSS | Declared but referenced by no theme — dead assets |
| `recharts` reference inside `restreamvideoeditor` | Single symbol, no chart component — dead code |
| Full AI system prompt (≥18 KB, 2 variants) + the ~72-tool JSON-schema registry + `WidgetAsset` | Located in `131.8f878df5d7c38b5a.js`, **outside this domain** — flagged for the chunk-131 owner |
| LUT colour-grade filters (`classic-film`, `teal-orange`, `warm-cinema`, `icy-drama`, `faded-memories` `.cube` files) and the WebGL render engine | Located in `Index.312bd7238c465fa2.js` module `2699` — **outside this domain**, flagged for the filters owner |
| `maxContainerHeight` prop passed to `EmbedChatMessagesList` by chunk 114 | Not declared in the component's `propTypes` — the shipped theme-kit build is older than its consumer |
