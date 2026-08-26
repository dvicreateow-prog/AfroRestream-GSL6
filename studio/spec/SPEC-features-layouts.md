# Restream Studio — Feature Model: Layouts, Scenes/Sources, Overlays, Flags

Static extraction from the local capture. Every identifier is an **exact matched token** from a
bundle unless tagged `INFERRED`. Nothing here came from a network request.

## Source files mined

| File | Size | Role |
|---|---|---|
| `01-inside-studio-verified/client-static/js/restream.887ca3d5bcd09a3a.js` | 12.3 MB | main app; io-ts wire codecs (`*IO`) |
| `01-inside-studio-verified/client-static/js/externals.b634d3e8690cf1f3.js` | 5.2 MB | **layout engine** — class names survive minification (`ShowtimeLayoutV2`, `PipLayoutV2`, …) |
| `01-inside-studio-verified/client-static/js/Index.312bd7238c465fa2.js` | 325 KB | `FeatureStore` (URL-param flags), `UserFeaturesIO` (plan gates), hotkey table, streaming profiles |
| `01-inside-studio-verified/client-static/js/131.8f878df5d7c38b5a.js` | 2.2 MB | Host page stores; layout construction call-sites |
| `01-inside-studio-verified/client-static/js/575.434695f973e2e774.js` | 1.2 MB | `HostPageViewStore`, layout-order maps, settings modal |
| `01-inside-studio-verified/client-static/js/593.47f82f224fb8c169.js` | 1.2 MB | sidebar tabs, encoding ladders, brand/scene stores |
| `01-inside-studio-verified/client-static/js/114.15f34f2a5005b32d.js` | 395 KB | Overlay entry (renderer for captions/tickers/chat/QR) |
| `03-deep-static/source-maps/extracted/**` | — | original `.scss` component paths |
| `studio/spec/refresh-2026-08-25/Index.9e0811e35f72c739.js` | 325 KB | re-fetched 2026-08-25 |

### Refresh delta (2026-08-25)

URL feature flags extracted precisely from `searchParams.get/has(...)` and `getUrlOverride(...)`
call sites: **336 flags in both** `Index.312bd7238c465fa2.js` and `Index.9e0811e35f72c739.js`;
`comm -23` and `comm -13` are both **empty**. **No layout, scene, source, overlay or flag changes
in the refresh.**

### Explicit negatives (searched, zero hits)

- `"solo"`, `"split"`, `"grid"`, `"sideBySide"`, `"fullscreen"`, `"lowerThird"`, `"lower-third"`,
  `"pip"` (lowercase quoted), `"ticker"` (lowercase quoted) — Restream does **not** use this
  vocabulary. Its names are `AUTO_COVER`, `AUTO_CONTAIN`, `HALF_SCREEN`, `PICTURE_IN_PICTURE`, etc.
- `maxDestinations` / `MAX_DESTINATIONS` — **absent from every bundle**. Destination count is not
  gated client-side.
- No static tile-rect tables. Tile geometry is computed at runtime by the `Layout*V2` classes.
  What *is* literal: option defaults, slider ranges, paddings/gaps, and the container schema (§1.6).
- `.tmp_restream_studio_build/slide-NN.layout.json` are `"schema": "openai.presentation.layout/v4"`
  slide-deck files, **not** Studio layouts. Ignored.

---

## 1. Layouts

### 1.1 `LayoutType` — the two versions disagree

`restream.887ca3d5bcd09a3a.js` (wire codec `LayoutTypeIO`), **9 members**:

```js
(il=ol||(ol={})).SPOTLIGHT="SPOTLIGHT",il.PADDED_SPOTLIGHT="PADDED_SPOTLIGHT",
il.AUTO_CONTAIN="AUTO_CONTAIN",il.AUTO_COVER="AUTO_COVER",il.HALF_SCREEN="HALF_SCREEN",
il.CINEMA="CINEMA",il.THUMBNAILS="THUMBNAILS",il.PICTURE_IN_PICTURE="PICTURE_IN_PICTURE",
il.Showtime="Showtime";
const sl=Yo("LayoutTypeIO",ol);
```

`externals.b634d3e8690cf1f3.js`, **10 members** — adds `TBPN`:

```js
e.SPOTLIGHT="SPOTLIGHT",e.PADDED_SPOTLIGHT="PADDED_SPOTLIGHT",e.AUTO_CONTAIN="AUTO_CONTAIN",
e.AUTO_COVER="AUTO_COVER",e.HALF_SCREEN="HALF_SCREEN",e.CINEMA="CINEMA",e.THUMBNAILS="THUMBNAILS",
e.PICTURE_IN_PICTURE="PICTURE_IN_PICTURE",e.Showtime="Showtime",e.TBPN="TBPN"
```

| id | UI label / notes |
|---|---|
| `SPOTLIGHT` | one source enlarged, freely positioned |
| `PADDED_SPOTLIGHT` | spotlight with padding; shares the `SpotlightLayoutV2` engine |
| `AUTO_CONTAIN` | UI **Contain** |
| `AUTO_COVER` | UI **Cover** |
| `HALF_SCREEN` | UI **Half Screen** |
| `CINEMA` | legacy engine only (`CinemaLayout`, no `*V2`) |
| `THUMBNAILS` | main + strip of thumbnails |
| `PICTURE_IN_PICTURE` | main + floating aside |
| `Showtime` | note the CamelCase — not SCREAMING_CASE like its siblings |
| `TBPN` | externals only; gated by plan tag `studioSpecialLayoutsTbpn` + URL flag `tbpn-layout` |

### 1.2 Layout engine classes (`externals.*.js`, module 83031 export map)

```
CoverLayoutV2        CoverPortraitLayoutV2
ContainLayoutV2      ContainPortraitLayoutV2
HalfScreenLayoutV2   HalfScreenPortraitLayoutV2
SpotlightLayoutV2    SpotlightPortraitLayoutV2
PipLayoutV2          PipPortraitLayoutV2        PipWithRightZoneLayoutV2
ThumbnailsLayoutV2
CinemaLayoutV2       CinemaLayout
ShowtimeLayoutV2     ShowtimeLayout
TbpnLayoutV2         TbpnLayout
```

`ThumbnailsLayoutV2` has **no** portrait sibling. Portrait variants exist for Cover, Contain,
HalfScreen, Spotlight and Pip only.

Supporting node classes: `LayoutSourceNode_LayoutSourceNode`, `LayoutGroupNode`, `ElementLayoutV2`.

### 1.3 Layout order maps → `Shift+1 … Shift+7`

`575.434695f973e2e774.js`, webpack module **41204** (verbatim):

```js
41204(e,t,o){o.d(t,{DE:()=>s,DM:()=>p,QA:()=>d,R6:()=>m,Tj:()=>g,ZH:()=>a,ZV:()=>r,
              ek:()=>n,gT:()=>h,vb:()=>u,y6:()=>c,zS:()=>l});
```

Capability **sets**:

| export | members |
|---|---|
| `DE` | AUTO_CONTAIN, AUTO_COVER, HALF_SCREEN, SPOTLIGHT, PICTURE_IN_PICTURE, THUMBNAILS, Showtime, TBPN |
| `ZV` | AUTO_CONTAIN, AUTO_COVER, SPOTLIGHT, HALF_SCREEN |
| `ek` | AUTO_CONTAIN, AUTO_COVER, SPOTLIGHT, HALF_SCREEN, THUMBNAILS, Showtime, TBPN |
| `ZH` | `ek` + PICTURE_IN_PICTURE |

Ordered **maps** (key = hotkey position):

| export | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| `zS` | AUTO_CONTAIN | AUTO_COVER | HALF_SCREEN | PICTURE_IN_PICTURE | CINEMA | THUMBNAILS | — |
| `QA` | AUTO_CONTAIN | AUTO_COVER | HALF_SCREEN | PICTURE_IN_PICTURE | THUMBNAILS | — | — |
| `y6` | Showtime | AUTO_CONTAIN | AUTO_COVER | HALF_SCREEN | PICTURE_IN_PICTURE | THUMBNAILS | — |
| `gT` | AUTO_CONTAIN | AUTO_COVER | HALF_SCREEN | PICTURE_IN_PICTURE | CINEMA | — | — |
| `vb` | SPOTLIGHT | AUTO_CONTAIN | AUTO_COVER | HALF_SCREEN | PICTURE_IN_PICTURE | THUMBNAILS | — |
| `DM` | SPOTLIGHT | Showtime | AUTO_CONTAIN | AUTO_COVER | HALF_SCREEN | PICTURE_IN_PICTURE | THUMBNAILS |
| `Tj` | SPOTLIGHT | AUTO_CONTAIN | AUTO_COVER | HALF_SCREEN | PICTURE_IN_PICTURE | CINEMA | — |
| `R6` | HALF_SCREEN | — | — | — | — | — | — |

Selector (`HostPageViewStore.layoutPositionMap`, verbatim shape):

```js
shouldShowScenes
  ? (isDefaultScene||isMediaScene
      ? (isMediaScene
          ? (LANDSCAPE ? (shouldShowShowtimeLayout ? DM : vb) : Tj)
          : (LANDSCAPE ? (shouldShowShowtimeLayout ? y6 : QA) : gT))
      : R6)                       // countdown scene → HALF_SCREEN only
  : zS                            // scenes mode off (legacy)
```

`layoutTypeToHotkeyMap` then maps position *n* → hotkey `CHANGE_LAYOUT_TO_*` (`Oe.h5[n-1]`).

### 1.4 Per-layout persisted option defaults (`externals.*.js`)

These are the literal default objects that pair with each `*LayoutV2OptionsIO` codec.

| layout | default object (verbatim) |
|---|---|
| Cover | `{radius:0}` |
| Contain | `{shape:Rectangle, radius:1}` |
| HalfScreen | `{radius:0, ratio:65, alignment:Right}` |
| Spotlight | `{radius:1, scale:100, positionMode:Fixed, fixedPosition:CenterCenter, freemovePosition:[0,0]}` |
| Pip | `{mainRadius:1, mainScale:100, mainPositionMode:Fixed, mainFixedPosition:CenterCenter, mainFreemovePosition:[0,0], asidePosition:BottomRight, asideShape:Rectangle, asideSize:17, asideRadius:3}` |
| Thumbnails | `{mainRadius:1, asidePosition:RightCenter, asideShape:Rectangle, asideSize:17, asideRadius:3}` |
| Showtime | `{alignment:Left, mainRadius:1, secondaryRadius:1, asideRadius:0}` |
| Tbpn | `{mainRadius:1}` |
| Cinema | **no default object emitted** — only the `CinemaLayoutOptionsIO` codec |

`CinemaLayoutOptionsIO` props: `mainRadius` Range(0,50) step 1, `asideRadius` Range(0,50) step 1,
`asideShape` (optional), `asideSize` Range(15,80) step 1 (optional).

### 1.5 Dev/"temp" option defaults — the real geometry numbers

Exposed under `layout-dev` / `layouts-dev`. These carry the actual pixel/percent constants.

**Contain** (`ContainLayoutV2TempOptionsIO`):
```js
{globalHeader:"Global", alignment:CenterCenter, shouldGapControlPadding:!1,
 singleHeader:"Single source", singleMainScale:100, singleMainOffset:[0,0], extendedPadding:130,
 mainHeader:"Multiple sources", gap:24, padding:24, shouldSizeFitNextRow:!0,
 shouldCover:!1, shouldLetterbox:!1, shouldCaptionPush:!0}
```

**Cover** (`CoverLayoutV2TempOptionsIO`):
```js
{globalHeader:"Global", shape:Auto, padding:0, shouldContain:!1, shouldUseMagicRadiusPadding:!0,
 shouldGapControlPadding:!1, singleHeader:"Single source", singleMainScale:100,
 singleMainOffset:[0,0], mainHeader:"Multiple sources", mainGap:0, shouldCaptionPush:!0,
 shouldAllowBackground:!0}
```

**HalfScreen** (`HalfScreenLayoutV2TempOptionsIO`):
```js
{globalHeader:"Global", padding:0, shouldCaptionPush:!0, shouldUseMagicRadiusPadding:!0,
 shouldGapControlPadding:!1, shouldUseUnifiedGap:!1, shouldUseUnifiedRadius:!0,
 singleHeader:"Single source", singleMainScale:100, singleMainOffset:[0,0],
 mainHeader:"Main", mainShape:Auto, mainGap:0, mainPadding:0, mainShouldContain:!1,
 mainShouldAllowBackground:!0, asideHeader:"Aside", asideShape:Auto, asideGap:0,
 asidePadding:0, asideRadius:0}
```

**Pip** (`PipLayoutV2TempOptionsIO`):
```js
{mainHeader:"Main", mainPadding:0, disableMagnetMainRadius:!1, magicMagnetMainRadius:!0,
 padding:0, asideHeader:"Aside", stackAsideVertically:!1, asideGap:24, singleAsideScale:1,
 asideFreemove:!1, asideCoords:[0,0], asideScalePad:!1, asideScaleForm:[0,0],
 shouldCircleMain:!1}
```

**Thumbnails** (`ThumbnailsLayoutV2TempOptionsIO`):
```js
{mainHeader:"Main", shouldCircleMain:!1, hideMainBackground:!1, padding:0,
 asideHeader:"Aside", longSingleCamera:!1, asideGap:24}
```

**Showtime** (`ShowtimeLayoutV2TempOptionsIO`):
```js
{globalHeader:"Global", shouldUsePadding:!1, padding:24, singleHeader:"Single",
 singleMainScale:100, singleMainOffset:[0,0], mainHeader:"Main", mainShape:Auto, overlap:100,
 secondaryHeader:"Secondary", secondaryShape:Auto, shouldPadSecondary:!0, asideHeader:"Aside",
 minAsideSourcesPerColumn:4, maxAsideColumns:1, asideShape:Auto, asideGap:0, asidePadding:0,
 shouldUseAsideMagicRadiusPadding:!0, shouldPadAside:!1}
```

**Tbpn** (`TbpnLayoutV2TempOptionsIO`) — the only layout with absolute pixel offsets:
```js
{mainHeader:"Main", mainGap:34, mainPaddingTop:24, mainPaddingLeft:24, mainPaddingRight:24,
 mainPaddingBottom:32, mainBottomOffset:253, borderSpread:3, borderColor:"rgba(0, 0, 0, 1)"}
```

Slider ranges (`new c.B(min,max)` + `{type:Range, step:N}`), verbatim labels:

| option | range | step | label |
|---|---|---|---|
| `mainRadius` / `secondaryRadius` / `asideRadius` | 0–50 | 1 | "Main radius, %" / "Secondary radius, %" / "Radius, %" |
| `asideSize` (Pip, Thumbnails, Cinema) | 15–80 | 1 | "Size, %" |
| `singleMainScale` (Cover/Contain/HalfScreen/Showtime) | 40–150 | 1 | "Single scale, %" |
| `overlap` (Showtime) | 0–200 | 1 | "Overlap scale, %" |
| `singleAsideScale` (Pip) | 0–2 | 0.01 | "Single preview scale" |
| `singleMainOffset` / `asideCoords` / `*FreemovePosition` | Coords, x∈[-1,1], y∈[-1,1] | — | "Single offset" / "Coords" |

### 1.6 Tile geometry schema — how rects are actually expressed

`restream.887ca3d5bcd09a3a.js`, verbatim:

```js
fl = a.readonly(a.type({left:a.Int, top:a.Int, width:a.Int, height:a.Int}),
                "ElementLayoutV2ContainerIO"),
hl = a.readonly(a.type({
  meta: {shouldShowShadow, shouldRoundCorners, sourceWidth, sourceHeight,
         sourceVideoUrl?, staticImageUrl?},
  background: cl,
  fit: {type: ElementLayoutV2FitType, gravity: ElementLayoutV2Gravity},
  cropContainer: fl,
  videoContainer: fl,
  opacity: a.Int, zOrder: a.Int, borderRadius: a.Int
}), "ElementLayoutV2IO")
```

- `ElementLayoutV2FitType` = `Cover` | `Contain`
- `ElementLayoutV2Gravity` = 9-grid: `TopLeft TopCenter TopRight CenterLeft CenterCenter CenterRight BottomLeft BottomCenter BottomRight`
- Animation: `ElementLayoutV2KeyframeIO` = `ElementLayoutV2IO` + `{progress:number}`;
  `LayoutV2TransitionIO` = `{duration, p1:[x,y], p2:[x,y], keyframes:[]}` (cubic-bezier).
- `AnimatedLayoutV2IO` = `readonlyArray(LayoutV2ElementIO)`.

**Tile rects are `left/top/width/height` integers in canvas pixels, emitted per element per frame —
not a static grid table.** `INFERRED`: values are canvas-pixel because they sit alongside
`sourceWidth`/`sourceHeight` and the layout classes take `widthPx`/`heightPx` constructor args.

Overlay reserved zones passed into every layout constructor (`131.*.js` call sites):
`tickerZoneHeightPx`, `captionZoneHeightPx`, `rightOverlayZoneWidthPx`,
`bottomOverlayZoneHeightPx`. Only literal value found: **`SR=42`** (right overlay zone width px).
Showtime uses `aspectRatio:1.25` (2 occurrences in externals).

### 1.7 Shape / position / alignment enums (all from `externals.*.js`)

| registry name | members |
|---|---|
| `CoverLayoutShape` | `Auto`, `Circle` |
| `ContainLayoutShape` | `Auto`, `Vertical`, `Rectangle`, `Square`, `Circle` |
| `HalfScreenLayoutMainShape` | `Auto`, `Circle` |
| `HalfScreenLayoutAsideShape` | `Auto`, `Circle` |
| `HalfScreenLayoutAlignment` | `Left`, `Right` |
| `SpotlightLayoutShape` | `Auto`, `Circle` |
| `SpotlightLayoutPositionMode` | `Freemove`, `Fixed` |
| `SpotlightLayoutPosition` | 9-grid (`TopLeft TopCenter TopRight LeftCenter CenterCenter RightCenter BottomLeft BottomCenter BottomRight`) |
| `PipLayoutMainPositionMode` | `Freemove`, `Fixed` |
| `PipLayoutMainPosition` | 9-grid (same as above) |
| `PipLayoutAsidePosition` | **8** — 9-grid minus `CenterCenter` |
| `PiPLayoutAsideShape` | `Vertical`, `Rectangle`, `Square`, `Circle` |
| `ThumbnailsAsidePosition` | **12** — `TopCenter TopLeft TopRight LeftCenter LeftTop LeftBottom RightCenter RightTop RightBottom BottomCenter BottomLeft BottomRight` (URL flag `thumbnails-extended-positions`) |
| `ThumbnailsLayoutAsideShape` | `Vertical`, `Rectangle`, `Square`, `Circle` |
| `CinemaLayoutAsideShape` | `Vertical`, `Rectangle`, `Square`, `Circle` |
| `ShowtimeLayoutMainShape` / `SecondaryShape` / `AsideShape` | `Auto`, `Circle` |
| `ShowtimeLayoutAlignment` | `Left`, `Right` |
| `ChatOverlayPositionMode` | `ReservedSpace`, `Freemove` |
| `ChatOverlayAlignment` | `Top`, `Bottom` |
| `LogoPosition` | **only** `TopLeft`, `TopRight` (default `TopRight`) |

### 1.8 Layout mutation commands (`externals.*.js`)

`UpdateContainLayoutOptions`, `UpdateCoverLayoutOptions`, `UpdateHalfScreenLayoutOptions`,
`UpdatePipLayoutOptions`, `UpdateShowtimeLayoutOptions`, `UpdateSpotlightLayoutOptions`,
`UpdateTbpnLayoutOptions`, `UpdateThumbnailsLayoutOptions`, `ResetLayoutOptions` — each with an
`…TempOptions` twin and an `…OptionsWithStatusesIO`
(`{isModified, isMainModified, isAsideModified, isSecondaryModified}`).
Reset targets: `keyof({all, main, aside})`, Showtime adds `secondary`, Tbpn is `{all, main}`.

---

## 2. Scenes and sources

### 2.1 `SceneResourceType` — only three scene kinds

```js
(Dc=Mc||(Mc={})).Default="Default",Dc.Media="Media",Dc.Countdown="Countdown";
const Wc=Yo("SceneResourceType",Mc);
```

Payload codecs: `DefaultScenePayloadIO`, `MediaScenePayloadIO`, `CountdownScenePayloadIO`;
client-create variants `ClientDefaultSceneCreatePayloadIO`, `ClientMediaSceneCreatePayloadIO`,
`ClientCountdownSceneCreatePayloadIO`.

### 2.2 `SceneMediaType` — the 8 media kinds a Media scene can hold

```js
(Vc=kc||(kc={})).InProgressVideoStorage="InProgressVideoStorage",
Vc.VideoStorage="VideoStorage", Vc.Presentation="Presentation", Vc.Image="Image",
Vc.ScreenSharing="ScreenSharing", Vc.LocalVideo="LocalVideo",
Vc.RtmpSourcePull="RtmpSourcePull", Vc.MediaPlaceholder="MediaPlaceholder";
const Tc=Yo("SceneMediaType",kc);
```

| id | resource codec | user-facing |
|---|---|---|
| `ScreenSharing` | `SceneMediaResourceScreenSharingIO` | screen share |
| `VideoStorage` | `SceneMediaResourceVideoStorageIO` (`displayAspectRatio, position, isLooped, shouldAutoplay, isMuted, playbackId?`) | uploaded video clip |
| `InProgressVideoStorage` | `SceneMediaResourceInProgressVideoStorageIO` | video still transcoding |
| `LocalVideo` | `SceneMediaResourceLocalVideoIO` | local file playback |
| `Presentation` | `SceneMediaResourcePresentationIO` (`id, status, filename, urlTemplate, pagesNumber, pagesSizes, page`) | slide deck |
| `Image` | `SceneMediaResourceImageIO` (status Uploading/Processing/Ready/Failed) | still image |
| `RtmpSourcePull` | `SceneMediaResourceRtmpSourcePullIO` | pulled RTMP feed |
| `MediaPlaceholder` | `SceneMediaResourceMediaPlaceholderIO` | empty slot |

### 2.3 `SourceStateType` (live source state on the wire)

```js
(Fs=zs||(zs={})).MEDIA_STREAM="MEDIA_STREAM",Fs.HLS_VIDEO="HLS_VIDEO",
Fs.PRESENTATION="PRESENTATION",Fs.Image="Image",Fs.MEDIA_PLACEHOLDER="MEDIA_PLACEHOLDER";
```

`MediaStreamStateIO` fields: `userId, type, sourceId, isMuted, isOnAir, isSolo, isSpotlighted,
audioGainLevel, kind, clientId, isBackground, isAudio, sessionId, isBlinded, isMirrored`.

### 2.4 `RoomMediaStreamKind` (transport-level producer kinds)

```js
qs.WEBCAM="WEBCAM", qs.SCREEN="SCREEN", qs.STINGER="STINGER", qs.VIDEO="VIDEO",
qs.RTMP_SOURCE_PULL="RTMP_SOURCE_PULL", qs.VIDEO_SOURCE_PULL="VIDEO_SOURCE_PULL",
qs.AUDIO_SOURCE_PULL="AUDIO_SOURCE_PULL";
```

### 2.5 `LayoutV2ElementKind` / `LayoutItemType` (what the compositor draws)

`restream.*.js` (`LayoutV2ElementKind`) and `externals.*.js` (layout-engine `LayoutItemType`) agree
apart from the first member's name:

| `LayoutV2ElementKind` (wire) | engine `LayoutItemType` | element codec |
|---|---|---|
| `Video` | `MediaStream` | `LayoutV2VideoElementIO` (`producerId`) |
| `Image` | `Image` | `LayoutV2ImageElementIO` (`imageId`) |
| `Ticker` | `Ticker` | `LayoutV2TickerElementIO` (`tickerId`) |
| `DrawingModule` | `DrawingModule` | (codec mislabelled `"LayoutV2ImageElementIO"` in the minified source — see §7) |
| `HlsVideo` | `HlsVideo` | `LayoutV2HlsVideoElementIO` (`hlsVideoId, playbackId`) |
| `Presentation` | `Presentation` | `LayoutV2PresentationElementIO` (`presentationId, isPresentation?`) |
| `MediaPlaceholder` | `MediaPlaceholder` | `LayoutV2MediaPlaceholderElementIO` (`id`) |
| `SourceImage` | `SourceImage` | `LayoutV2SourceImageElementIO` (`id, sourceImageId, imageId, compositorVideoId`) |

### 2.6 Placeholders, browser sources, extra cameras

- `MediaPlaceholderKind` — **version skew**: `restream.*.js` has only `Main="Generic"`;
  `externals.*.js` has `Main="Generic"`, `RtmpSource="RtmpSource"`, `Camera="Camera"`.
- `DrawingModuleKind` = `CAMERA_PLACEHOLDER` (single member); payload
  `CameraPlaceholderModulePayloadIO {drawingModuleId, kind, audioProducerId, avatarImageId}`.
- `BrowserSourceStateElementIO {id, sourceUrl, thumbnailUrl, brandId, name?}`; scene field
  `browserSourceId`; commands `AddSceneBrowserSource`, `UpdateSceneBrowserSource`,
  `RemoveSceneBrowserSource`; per-scene cap toast id `STUDIO_MAX_VISIBLE_SCENE_BROWSER_SOURCES`
  ("You have reached maximum amount of browser sources per scene").
- Extra camera: hotkey `EXTRA_CAMERA` (E), flags `extra-camera-audio`, `extra-camera-highlight`,
  `extra-camera-in-edit-mode`, `per-scene-extra-camera`; plan gate `studioMaxExtraCameras`.
- `SourceImageKind` = `Generic` (single member). `RoomImageKind` = `PARTICIPANT_NAME`, `AVATAR`,
  `BACKGROUND`, `Source`.
- `PresentationFormat` numeric enum: `PDF=0`, `KEY=1`, `DOCX=2`, `PPTX=3`.
- Countdown: `CountdownSceneStatus` = `Paused|Playing`; `CountdownSceneStatusV2` =
  `Playing|Ended|ReplayReady`; `CountdownSceneSize` = `Small|Medium|Large` (**default `Large`**);
  colour default the literal string `"Auto"`. Countdown scene payload adds
  `durationMs, musicId, fontId, color, size`.
- `ResourceKind` = `Image`, `Video`, `Audio`, `Font`.
- `LocalRecordingKind` = `AudioOnly`, `VideoOnly`, `AudioVideo`.

### 2.7 Common scene fields (`ClientSceneCreatePayload*`, verbatim)

```js
{name, shouldShowChatOverlay, shouldAutoswitchToNextScene(=false), layoutType,
 captionId, tickerId, qrCodeId, browserSourceId, overlayId, logoId(=null), logo(=null),
 background, commerce}
```

---

## 3. Overlays and graphics

### 3.1 Overlay object model

| codec | shape |
|---|---|
| `OverlayIO` | `{id, kind, url, isDefault?, isNew?, filename?, thumbnailUrl?, sourceUrl?, brandId?}` |
| `OverlayKind` | **`IMAGE` only** — full-frame image overlays (frames/borders are images) |
| `LogoIO` | `{id, url, thumbnailUrl?, sourceUrl?, filename?, isDefault?, isNew?, isWatermark?, brandId?}` |
| `BackgroundIO` | `{id, url, isDefault?, isNew?, filename?, thumbnailUrl?, sourceUrl?, brandId?}` |
| `BackgroundStateIO` | `{background, width, height}` |
| `VideoBackgroundIO` | `{…, screenshotUrl, isDefault, isTranscoded, meta}` |
| `TickerIO` / `TickerBodyIO` | `{id, text, brandId?}` (+ `TickerV2PayloadIO` with `brandId`) |
| `CaptionType` | `GENERIC`, `CHAT` |
| `GenericCaptionBodyIO` | `{id, text, secondaryText?, brandId?}` |
| `ChatCaptionIO` / `ChatCaptionBodyIO` | chat-sourced lower third |
| `QrCodeIO` | `{sourceQrCodeId, title, shouldShowTitle, link, brandId}`; `QrCodeWithUrlIO` adds `qrCodeUrl` |
| `OverlayChatLayoutIO` | `{width, height, x, y}` — chat-on-stream rect |
| `PinnedMessageIO` | pinned chat message |

**There is no distinct "banner" or "lower-third" type.** Restream's lower third *is*
`CaptionIO`; its ticker is `TickerIO`; its "frame" is an `OverlayIO` of kind `IMAGE`.

### 3.2 Chat-on-stream (`ChatOverlayOptionsIO`, `externals.*.js`)

| prop | range | step | label |
|---|---|---|---|
| `widthScale` | 0.3–1 | 0.01 | "Width scale" |
| `heightScale` | 0.15–1 | 0.01 | "Height scale" |
| `paddingPx` | 0–100 | 1 | "Padding" |
| `messageOpacity` | 0–100 | 1 | "Message opacity" |
| `messageScale` | 0.5–1.5 | 0.01 | "Message scale" |
| `hideMessagesSec` | 0–120 | 1 | "Hide messages" |
| `backgroundOpacity` | 0–100 | 1 | "Background opacity" |
| `theme`, `alignment` | enums | — | (see `ChatOverlayAlignment`, §1.7) |

### 3.3 `ThemeType` (drives caption/overlay skins)

`restream.*.js`: `DEFAULT`, `NEWS`, `ROUNDED`, `Halloween2023`, `Xmas2023`.
`externals.*.js` adds `Air`. Paired with `{themeType, primaryColor: HexColor}`.

Caption renderers confirmed as directories in `03-deep-static/source-maps/extracted/114.*/scripts/entries/Overlay/CaptionContainer/`:
`AirCaption`, `DefaultCaption`, `EcommerceCaption`, `NewsCaption`, `RoundedCaption`,
`SpookyCaption` (= Halloween2023), `XmasCaption`, plus `CaptionAvatar`.

Other Overlay-entry components: `StreamOverlay/Frame`, `StreamOverlay/ChatOverlay`,
`StreamOverlay/BrowserSourceContainer`, `StreamOverlay/BrowserSourceThumbnail`, `OverlayImage`,
`TickerCaption` (+ `ReactFastMarque` marquee), `CountdownSceneOverlayContainer` (with
`CountdownControls`, `CountdownToolbar`, `TimeDisplay`), `AlertsContainer` (+
`EcommerceViewedAlert`), `OverlayControls/GraphicsElementControls`, `Commerce/QrCodes/QrCodeOverlay`.

### 3.4 Graphics library sections

Section ids (`131.*.js`, `593.*.js`): `"overlays"`, `"logos"`, `"backgrounds"`, `"images"`,
`"videoClips"`. Components: `GraphicsSection(s)`, `GraphicsContent`, `GraphicsUploadAction`,
`GraphicsDndZone`, `DndOverlayZone`, `VideoClips`, `VideoUploader`.

Per-brand add-gates observed as computed getters: `canAddOverlay`, `canAddLogo`,
`canAddBackground`, `canAddCaption`, `canAddGenericCaption`, `canAddTicker`, `canAddQrCode`,
`canAddBrowserSource`, `canAddVideoClip`, `canAddCameraPlaceholder`, `canAddMediaPlaceholder`,
`canAddBrands`.

### 3.5 Commerce overlay

`EcommerceOverlayMode` = `"default"` | `"compact"`.
`EcommerceProductLayoutIO {x, y, width, height}`.
Default settings object (verbatim): `{…currentlyWatchingProductPage:!1, countOfBookmarks:!1,
automaticallyAddToTheCart:!1, enableQRCode:!0, showPrice:!0, showDiscount:!0,
disableBackground:!1, scale:.5}`.
Alerts: `EcommerceProductViewedAlertIO`, `EcommerceProductConvertedAlertIO`.
Scene commerce status: `Idle` | `Playing` | `Ended`.

### 3.6 Video filters (LUTs)

```js
c = {ClassicFilm:"classic-film", TealOrange:"teal-orange", WarmCinema:"warm-cinema",
     IcyDrama:"icy-drama", FadedMemories:"faded-memories"};
const d = OhH("LutFilter", c);
```
Assets are `.cube` files (`assets/warm-cinema.e90e3a4ec0590e32.cube`, etc.). URL flag `lut-filters`.
Virtual background sentinel values: `"DISABLED"`, `"BLUR"` (plus image/video backgrounds).

---

## 4. Feature flags and plan gates

### 4.1 Plan gates — `UserFeaturesIO` (`Index.*.js`, verbatim field list)

```
recordingHoursPerStream, recordingStoringDays, hasPerTrackAudioRecording, hasPairs,
hasLocalRecordings, maxVideoUploadsAvailable, maxVideoSizeAvailable, maxVideoDurationAvailable,
maxConcurrentVideoStorageStreams, maxConcurrentEventsStreams, maxPlaylistHoursPerStream,
aIShortsAvailable(=false), studioHasForcedRestreamWatermark, studioMaxCaptions, studioMaxLogos,
studioMaxOverlays, studioMaxBrowserSources, studioMaxVideoClipSizeBytes,
studioHasBackgroundMusic, studioMaxParticipants, studioMaxStaticBackgrounds, studioMaxVideoClips,
studioMaxVideoBackgrounds, studioMaxScenes, studioRtmpSourceConfigurations[],
studioOutgoingStreamVideoPresets[], studioMaxExtraCameras, studioMaxQrCodesPerBrand,
studioMaxQrCodeTitleLength, studioMaxQrCodeLinkLength, studioDualOutputAvailable,
studioMaxWebinarViewers, studioWebinarsAvailable
```

Nested: `VideoPresetIO {name, bitrate, width, height, framerate, cost}`;
`SourcePullConfigurationsAvailableIO {width, height, framerate, transcoding, cost}`.

**All numeric values arrive from the backend — the client ships no defaults for them**, with the
two exceptions in §5.

### 4.2 Plan/tier enum (`restream.887ca3d5bcd09a3a.js`)

```js
(e[e.BASIC=0]="BASIC", e[e.STANDARD=1]="STANDARD", e[e.PROFESSIONAL=2]="PROFESSIONAL",
 e[e.PREMIUM=3]="PREMIUM", e[e.BUSINESS=4]="BUSINESS", e[e.AGENCY=5]="AGENCY",
 e[e.GAMING_CREATOR=6]="GAMING_CREATOR")
```
Label map: `{0:"Free plan", 1:"Standard", 2:"Professional", 3:"Premium", 4:"Busi…}`.
A parallel enum uses `PERSONAL=0` instead of `BASIC=0`. `Enterprise` appears only as a label
string. Studio-specific plan tag observed: **`studioSpecialLayoutsTbpn`**.

### 4.3 Server-pushed room capability flags — `RoomManagerCapabilitiesIO` (all default `false`)

```
scenes, playlistMode, scenesOriginalLayouts, chatHistory, overlayConnectionV2,
shouldConvertSceneToDefaultOnAnyMediaRemoval, shouldPreferCurrentSceneLayoutOnMediaRemoval,
showtimeLayout, scenesLocalVideo, scenesVideoClips, showMode, sourceImages, addSceneMessagesV2,
scenesCommerceOverlayMode, customTrackMusic, countdownCustomTrackMusic,
audioSourcePullSeekAndLoop, scenesLogoPosition, overlayFontSelect, countdownSceneFontColorSize
```

### 4.4 `PublicRoomFeaturesIO` (all default `false`)

Superset of the above plus:
```
mediaPlaceholderHide, scenesSpotlightingLayoutsMediaSwap,
forceSpotlightingSceneMediaOnLayoutTypeChange, scenesOldStudioMigration,
betterVideoBackgroundTransitions, draftEventsMode, disablePassingShowIdInChatToken,
awaitImagesCreateCompletion, awaitBackgroundUpdateCompletion, compositorBorderRadius,
shouldPlayCountdownMusicOnSourcePuller, awaitedVideoPlaybackOnSceneApply, awaitedAudioOnSceneApply
```

### 4.5 URL-parameter feature flags — 336, complete list

Extracted from `searchParams.get/has(…)` and `getUrlOverride(…)` in `Index.312bd7238c465fa2.js`.
Identical in the 2026-08-25 refresh.

`adaptable-simulcasting` `ai-chat-image-paste` `ai-creator-backend-url` `ai-credits-is-over`
`ai-onboarding-chat` `ai-proxy-via-creator-backend` `ai-system-prompt-override`
`ai-widget-direct-generation` `ai-widgets` `air-theme` `allow-direct-connection`
`allow-ecommerce-overlay-with-freemove-chat-overlay` `allow-forcing-producer-max-quality`
`allow-layout-options-in-all-portrait-layouts` `allow-layout-options-in-all-portrait-layouts-v2`
`allow-layout-options-in-cover-contain-portrait-layouts` `allow-show-exp-switch` `audio-only-mode`
`auto-join` `auto-restart-live-stream` `auto-video-resolution` `b` `balanced-ingest`
`balanced-rtmp-ingest` `beautify` `billing-backend-url` `black-friday` `browser-source-favicon`
`browser-source-portrait-overlay` `browser-source-security` `call-in`
`canvas-camera-placeholder-workaround` `chat-client-api-url` `chat-filters`
`chat-overlay-customization` `chat-overlay-dev` `chat-url` `client-recordings-backend-url`
`clips-backend-url` `commerce-settings` `compositor-await-images-create`
`compositor-border-radius` `compositor-disable-cef-gpu` `compositor-origin`
`compositor-overlay-sync-with-immediate-answer` `compositor-pipelines-behavior`
`compositor-streaming` `compositor-web-enable-sandbox`
`compositor-web-max-jsheap-old-space-in-mib` `compositor-web-max-jsheap-semi-space-in-mib`
`compositor-web-throttling-max-cpu-in-millicpu` `compositor-web-throttling-max-memory-in-mib`
`compositor-webrtc-buffer-stats-tracker-mode` `convert-media-scene-on-source-removal`
`countdown-custom-background` `countdown-custom-music` `countdown-music-on-source-puller`
`custom-fonts` `custom-music` `custom-music-loop` `custom-music-reordering` `custom-music-seek`
`cyber-monday` `dark-theme-background-color` `dark-theme-background-gradient`
`debug-client-datachannels` `default-outgoing-stream-profile` `default-overlays-v2`
`detailed-webrtc-metrics` `dev` `dev-close-room` `device-request-popup`
`disable-dual-output-portrait-overlay-controls` `disable-studio-dual-output-trial-modal`
`draggable-graphics` `dual-output-always-landcape-layout-and-overlay` `dual-output-flow-v2`
`dual-output-live-stream` `dual-output-preview-derived-default`
`dual-output-with-any-primary-live-stream-orientation` `dual-output-youtube-promo` `e-commerce`
`e-commerce-demo` `e-commerce-settings` `ecommerce-backend-url` `ecommerce-settings`
`embed-player-api-host` `embed-player-host` `enable-inactivity` `enable-inactivity-test-timers`
`enforce-connection-token-role` `enhanced-rtmp-source-bitrate` `event-id` `events-backend-url`
`export-recordings` `extra-camera-in-edit-mode` `featured-list` `force-24h-limit`
`force-compact-ecommerce-overlay-in-portrait-overlay` `force-relay-connection`
`force-reveal-controls-on-focus` `force-spotlighting-scene-media-on-layout-type-change`
`forward-auth-user-id` `fullscreen-double-click` `geo-api-host` `graphics-dnd`
`graphics-drag-and-drop` `gst-advanced-logger-mode` `guests` `h264` `halloween-2023-theme`
`header-v2` `header-v2-mobile` `hls-video-in-edit-mode` `host-sidebar-v2` `host-user-id`
`ignore-sources-latency-on-compositor` `in-progress-video-storage` `init-with-countdown`
`interaction-controls-delay-ms` `interactive-overlay` `join-accessing-screen` `join-screen-v2`
`landscape-warning-modal` `layout-customization-tabs` `layout-dev` `layouts-dev`
`limit-relay-connection-type` `limit-room-session-duration` `live-clipping`
`live-stream-recording-controls` `live-stream-recording-controls-dev` `live-stream-start-abort`
`live-studio-sfu-url` `local-recording` `local-recordings` `local-video-auto-spotlight`
`logout-on-refresh-token-remained-days` `lut-filters` `main-source-position-control`
`max-screen-shares` `media-devices-controls` `media-placeholder-hide`
`mediapipe-segmentation-type` `merchant` `mp4-urls-download` `new-stream-statuses`
`no-producer-removal-events-on-closed-client` `no-scenes-thumbnail-sources-border`
`no-video-avatar-v2` `only-permissions-screen` `open-add-source-modal-on-replace`
`openrouter-model` `organizations-backend-url` `outgoing-stream-audio-bitrate` `overlay-audio`
`overlay-connection-v2` `overlay-mode` `overlay-url` `override-live-stream-limit-min`
`override-room-cooldown-limit-min` `override-room-session-limit-min`
`override-shutdown-warning-offset-min` `pairs-stream` `participant-name` `participant-title`
`participant-title-on-join-screen` `participants-20` `pass-show-id-to-chat-url` `pcap-player`
`people-assignment-mode` `per-scene-extra-camera` `per-scene-people-assignment-mode`
`per-track-video-recordings` `persisted-local-recording-settings` `playlist`
`playlist-limits-experiment` `playlists` `portrait-orientation` `portrait-overlay-hide-ability`
`prefer-current-scene-layout-on-media-removal` `prefer-gc` `prefer-gke`
`prefer-mp4-avc3-local-recording` `prefer-mp4-local-recording` `prefer-same-sample-rate`
`prefer-source-puller-gke-internal-routing` `prefer-vah264enc-webrtc-ingest-encoder`
`prefer-webrtc-ingest-gke-internal-routing` `preferred-music-volume` `presentation-in-edit-mode`
`preview-element-click` `private-chat-v2` `profile-settings` `promote-to-host` `recaptcha-key`
`recapture-local-video-on-end` `record-drop-down` `record-only-trial-minutes` `record-pcap`
`recordings-backend-url` `region` `remove-videos-on-scene-switch` `restream-web-api-host`
`reveal-controls-on-preview-hover` `reveal-media-scene-menu` `role` `room-id`
`rtmp-source-in-edit-mode` `scene-browser-sources` `scene-copy-paste` `scene-delete-shortcut`
`scene-edit-mode` `scene-edit-mode-pip` `scene-editing-presence`
`scene-thumbnails-camera-previews` `scene-thumbnails-camera-previews-variant-2`
`scene-thumbnails-chat-overlay-support` `scenes` `scenes-add-to-end` `scenes-auto-switch-v2`
`scenes-auto-switch-v2-noise-toast` `scenes-auto-switch-v2-onboarding-popover`
`scenes-auto-switch-v2-promo-popover` `scenes-background` `scenes-commerce-overlay-mode`
`scenes-countdown-auto-switch` `scenes-dynamic-thumbnails` `scenes-guests`
`scenes-guests-add-source` `scenes-guests-internal` `scenes-images` `scenes-internals`
`scenes-local-video` `scenes-logo-position-change` `scenes-migration-product-id` `scenes-notes`
`scenes-notes-preview` `scenes-old-studio-migration` `scenes-overlays`
`scenes-screen-sharing-button` `scenes-shortcuts` `scenes-sidebar` `scenes-sources`
`scenes-sources-fullscreen-mode` `scenes-toggle` `scenes-video-auto-switch` `scenes-video-clips`
`schedule-recording` `screen-share-restrict-own-audio` `self-muted-indication` `sfu-http-url`
`sfu-instance-number` `sfu-url` `sfu-webrtc-server` `sfu-ws-url` `should-monitor-ingest`
`show-add-source` `show-add-source-popover` `show-dual-output-separate-destinations` `show-id`
`show-invite-guests` `show-portrait-orientation` `show-presentations` `show-qr-codes`
`show-setting-guest-control-all-presentations` `show-virtual-background` `shown-messages`
`showtime-layout` `showtime-layout-dev` `simulcasting-producer-adapter`
`skip-playlist-video-on-ingest-error` `slack-streaming-banner` `solo` `source-image-in-edit-mode`
`source-puller-nats` `spoof-chat-backend-forward-auth-user-id`
`spoof-events-backend-forward-auth-user-id` `spoof-organizations-backend-forward-auth-user-id`
`spoof-recordings-backend-forward-auth-user-id` `spoof-studio-backend-forward-auth-user-id`
`spoof-video-storage-forward-auth-user-id` `spoof-website-sdk-forward-auth-user-id`
`standalone-browser-process` `status-server-url` `store-discovery` `store-explore`
`streaming-balancer-url` `streaming-disabled-banner` `streaming-statuses`
`studio-api-backend-cutover` `studio-api-backend-url` `studio-api-cutover` `studio-api-shadow`
`studio-backend-url` `studio-backend-video-uploads-url` `studio-onboarding` `stun`
`suspend-audio-context` `suspend-audio-gain-node` `suspend-volume-meters` `svc` `tbpn-layout`
`thumbnails-extended-positions` `ticker-always-full-overlay-width` `ticker-speed`
`ticker-speed-control` `ticker-speed-dev` `title-record-only` `treat-ws-1006-as-normal-closure`
`turn-region` `turnstile-site-key` `ultra-hd-4k-outgoing-stream-video-preset`
`unlock-webinar-channels` `unsecure-overlay` `upgrade` `upload-backgrounds-v2`
`upload-graphics-v2` `use-ai-backend` `use-datachannels` `use-srt-for-rtmp-source`
`use-static-images` `user-geo-requests` `vertical-previews-shape` `video-compact-controls`
`video-resolution` `video-storage-backend-url` `vp8` `vp9` `vp9-option` `watch-rtc` `wdyr`
`webrtc-metrics` `website-backend-url` `widget-copy-paste` `xmas-2023-theme`

### 4.6 Layout-relevant flags, called out

`showtime-layout`, `showtime-layout-dev`, `tbpn-layout`, `layout-dev`, `layouts-dev`,
`layout-customization-tabs`, `thumbnails-extended-positions`, `main-source-position-control`,
`allow-layout-options-in-all-portrait-layouts(-v2)`,
`allow-layout-options-in-cover-contain-portrait-layouts`,
`dual-output-always-landcape-layout-and-overlay` (typo is in the source),
`force-spotlighting-scene-media-on-layout-type-change`,
`prefer-current-scene-layout-on-media-removal`, `scene-edit-mode-pip`.

### 4.7 Settings tabs and sidebar tabs

`StudioSettingsTab` (`593.*.js`, module 98433):
```js
GENERAL="studioGeneralSettingsTab", PROFILE="studioProfileSettingsTab",
AUDIO="studioAudioSettingsTab", RECORDINGS="studioRecordingsSettingsTab",
VIDEO="studioVideoSettingsTab", GREEN_SCREEN="studioGreenScreenSettingsTab",
SHORTCUTS="studioShortcutsSettingsTab"
```

`SidebarTabId` (`593.*.js`, module 12192):
```js
MOBILE_SOURCES="MobileSources", SCENES="Scenes", MOBILE_PRIVATE_CHAT="MobilePrivateChat",
CHAT="Chat", VIRTUAL_EVENTS_CHAT="VirtualEventsChat", CAPTIONS="Captions", GRAPHICS="Graphics",
WIDGETS="Widgets", ECOMMERCE="QrCodes", GUESTS="Guests", ATTENDEES="Attendees", MUSIC="Music",
COUNTDOWN="Countdown", NOTES="Notes", LAYOUT_CUSTOMIZATION="LayoutCustomization",
CHAT_OVERLAY_CUSTOMIZATION="ChatOverlayCustomization", THEME="Theme", HELP="Help", AI="AI"
```
Default tab: `verticalSidebar ? null : (useEcommerce ? QrCodes : (isDesktop ? Graphics : MobileSources))`.

---

## 5. Resolution, frame rate, bitrate, limits

### 5.1 Base geometry and profile-id formats

`593.47f82f224fb8c169.js`, module 57631 (verbatim):
```js
const s=1280, r=720, n=s*r;                 // base HD, area 921600
var a = {hd30Fps:19e5, hd60Fps:35e5, fullHd30Fps:4e6, ultraHd30Fps:12e6};
const d = 19e5/n/30;                        // ≈0.06871 bits per pixel per frame
const c = (w,h,fps,meta) => `${w}x${h}@${fps}fps+${meta}`;
const h = c(s,r,30,"normal"), p = h;        // S3 = "1280x720@30fps+normal"
```

| ladder constant | bps |
|---|---|
| `hd30Fps` | 1,900,000 |
| `hd60Fps` | 3,500,000 |
| `fullHd30Fps` | 4,000,000 |
| `ultraHd30Fps` | 12,000,000 |

Wire brands:
- `OutgoingStreamProfileIdIO` regex `/^(\d+)x(\d+)@(\d+)fps\+(\w+)$/`
- `OutgoingStreamProfileIO {id, width, height, framerate, meta}`
- `VideoPresetNameIO` regex `/^(\d+)p@(\d+)$/` **or** `/^(\d+)x(\d+)p@(\d+)$/`
- `OutgoingStreamOrientation` = `LANDSCAPE` | `PORTRAIT`
- Resolution enum: `Hd=720`, `FullHd=1080`, `UltraHd=2160`

Default outgoing profiles (`Index.*.js`):
```js
const d=(0,s.$iN)(1280,720,30,"normal"),   // default
      u=(0,s.$iN)(1920,1080,30,"normal");  // opt-in via ?default-outgoing-stream-profile
```
4K is gated by `?ultra-hd-4k-outgoing-stream-video-preset`, forwarded as a request header to
`/v2/api/studio/user` and `/v2/api/studio/token`.

`StreamingProfile` getters: `isFullHdAndAbove = initialHeight>=1080`;
`isDefault = !isFullHdAndAbove && framerate!==60`; portrait swaps width/height.

### 5.2 Simulcast encoding ladders (`593.*.js`, `EncodingsParametersService.encodingsMap`)

Keyed by `${w}x${h}@${fps}fps+${meta}`. WEBCAM, 3-layer form when `simulcastingMidLayer` is on:

| source profile | L0 | L1 | L2 (top) |
|---|---|---|---|
| `854x480@30fps+normal` | ÷3 @ 100 kbps | ÷1 @ 300 kbps | ÷1 @ `maxBitrate ?? 400 kbps` (inactive) |
| `1280x720@30fps+normal` | ÷4 @ 100 kbps | ÷2 @ 250 kbps | ÷1 @ `maxBitrate ?? hd30Fps` |
| `1280x720@60fps+normal` | ÷4 @ 100 kbps | ÷2 @ 500 kbps | ÷1 @ `maxBitrate ?? hd60Fps` |
| `1920x1080@30fps+normal` | ÷4 @ 100 kbps | ÷2 @ 600 kbps | ÷1 @ `maxBitrate ?? fullHd30Fps` |
| `3840x2160@30fps+normal` | ÷4 @ 100 kbps | ÷2 @ 600 kbps | ÷1 @ `maxBitrate ?? ultraHd30Fps` |

2-layer form (mid-layer off) drops L1 and uses `maxBitrate ?? 300 kbps` on the base rung for 480p.
Capability probe in `externals.*.js` uses
`sendEncodings:[{rid:"r0",maxBitrate:1e5},{rid:"r1",maxBitrate:5e5}]`.
`ProducerEncodingIO = partial({active, maxBitrate, scaleResolutionDownBy})`;
`ProducerIdToMaxLayerIO = record(string, number)`.

**No frame-rate constant beyond the profile ids** — `frameRate:30` appears only in
`restreamvideoeditor.*.js` and `hlsjs.*.js`, not in Studio code.

### 5.3 Composition canvas size

`1920×1080` is the compositor canvas literal used when constructing layout items
(`593.*.js`: `{type:MediaPlaceholder, kind:Main, width:1920, height:1080}`,
`{type:MediaPlaceholder, kind:Camera, …}`, `{type:HlsVideo, width:1920, height:1080}`) and when
rasterising gradient backgrounds (`131.*.js`: `{colors, rgbaColors, angleDegrees, width:1920,
height:1080}`). Preview scaling constant: `qa=1080` with `i = portrait ? e : t/1080*639`.

### 5.4 Limits with client-side values

| limit | value | source |
|---|---|---|
| `maxScreenShares` | **3** (URL-overridable via `?max-screen-shares`) | `Index.*.js`: `(0,v.Uw)(l.j,3)(searchParams.get("max-screen-shares"))` |
| participants | `?participants-20` boolean override; UI branch `6===this.maxParticipants` | `Index.*.js`, `575.*.js` |
| scenes | `studioMaxScenes ?? w.O_` — the `w.O_` fallback resolves to a cross-chunk import **not present in the captured bundles**; value unknown | `593.*.js` |
| destinations | **no client-side limit exists** | — |

`availableGuestSlots = maxParticipants - activeParticipantsCount`.
Toast/error ids: `MAX_SEATS_REACHED`, `MAX_RECORD_DURATION_EXCEEDED`,
`MAX_RTMP_SOURCE_PULLS_EXCEEDED`, `STUDIO_MAX_VISIBLE_SCENE_BROWSER_SOURCES`,
`TooManyBackgroundsError`, `FileSizeLimitExceededBackgroundStoreError`.

---

## 6. Keyboard shortcuts — complete table

`Index.312bd7238c465fa2.js`, single literal object. Reproduced verbatim as `id → key/code/modifiers`.

| id | key | code | modifiers | `asString` |
|---|---|---|---|---|
| `MICROPHONE` | M | KeyM | — | |
| `CAMERA` | V | KeyV | — | |
| `SETTINGS` | S | KeyS | — | `s` |
| `SIDEBAR` | . | period | Ctrl | |
| `INVITE_GUESTS` | I | KeyI | — | |
| `ADD_SOURCE` | A | KeyA | — | |
| `LOCAL_VIDEO` | O | KeyO | — | |
| `RTMP_SOURCE` | R | KeyR | — | |
| `PRESENTATIONS` | P | KeyP | — | |
| `VIDEO_STORAGE` | D | KeyD | — | |
| `IMAGE` | G | KeyG | — | |
| `NEW_SCENE` | N | KeyN | — | |
| `EXTRA_CAMERA` | E | KeyE | — | |
| `SCREEN_SHARE` | H | KeyH | — | |
| `GO_LIVE_OR_END` | G | KeyG | Ctrl | |
| `GUEST_JOIN_OR_LEAVE` | G | KeyG | Ctrl | |
| `RECORD_ONLY` | G | KeyG | Ctrl | |
| `RESTART_RECORDING` | G | KeyG | Ctrl+Shift | |
| `PAUSE_RESUME_RECORDING` | P | KeyP | Ctrl+Shift | |
| `PRIVATE_CHAT` | C | KeyC | Shift | |
| `FULLSCREEN` | F | KeyF | — | |
| `SHOW_ALL_SOURCES` | S | KeyS | Shift | |
| `HIDE_ALL_SOURCES` | H | KeyH | Shift | |
| `UNMUTE_ALL_SOURCES` | U | KeyU | Shift | |
| `MUTE_ALL_SOURCES` | Y | KeyY | Shift | |
| `TOGGLE_PARTICIPANTS_NAMES` | N | KeyN | Shift | |
| `CHANGE_LAYOUT_TO_FIRST` … `SEVENTH` | 1–7 | Key1–Key7 | Shift | `shift+1` … `shift+7` |
| `NEXT_SLIDE_RIGHT_ARROW` | → | ArrowRight | — | `right` |
| `PREVIOUS_SLIDE_LEFT_ARROW` | ← | ArrowLeft | — | `left` |
| `PREVIOUS_SCENE_TOP_ARROW` | ↑ | ArrowUp | — | `up` |
| `NEXT_SCENE_BOTTOM_ARROW` | ↓ | ArrowDown | — | `down` |
| `EVENT_CAPTURING_SPACE` | Space | Space | — | `space` |
| `Duplicate` / `DuplicateMacOs` | D | KeyD | Ctrl / Meta | `ctrl+d` / `cmd+d` |
| `Delete` | Delete | Delete | — | `Delete` |
| `Delete` (via `Backspace` key) | Backspace | Backspace | — | `Backspace` |
| `Copy` / `CopyMacOs` | C | keyC | Ctrl / Meta | `ctrl+c` / `cmd+c` |
| `Paste` / `PasteMacOs` | V | keyV | Ctrl / Meta | `ctrl+v` / `cmd+v` |
| `Undo` / `UndoMacOs` | Z | keyZ | Ctrl / Meta | `ctrl+z` / `cmd+z` |

Notes: the clipboard/undo entries use lowercase `keyC`/`keyV`/`keyZ` (inconsistent with the
`KeyM`-style codes elsewhere) — reproduced as found. `ignoreOnAnotherHotkey:!0` is set on the
arrows, Space, and all clipboard/undo entries. Display strings are built by
`[withCtrl ? (isMac?"COMMAND":"CTRL") : undefined, withMeta?"COMMAND":undefined,
withShift?"SHIFT":undefined, key]`.

Shortcut visibility getters (`131.*.js`): `shouldShowLayoutsShortcuts`,
`shouldShowScenesLayoutsShortcuts`, `shouldShowSeventhLayoutShortcut`, `shouldShowScenesShortcuts`,
`shouldShowSourcesShortcuts`, `shouldShowAddSourceShortcuts`, `shouldShowGuestAddSourceShortcuts`,
`shouldShowCameraShortcut`, `shouldShowMicrophoneShortcut`, `shouldShowImageShortcut`,
`shouldShowLocalVideoShortcut`, `shouldShowRtmpSourceShortcut`, `shouldShowVideoStorageShortcut`,
`shouldShowPresentationControlsShortcuts`, `shouldShowPrivateChatShortcut`,
`shouldShowInviteGuestsShortcut`, `shouldShowJoinOrLeaveShortcut`, `shouldShowSidebarShortcut`,
`shouldShowGeneralSectionShortcuts`, `shouldDisableNotPlaylistHotkeys`.
Warning ids: `HOTKEY_DISABLED_WARNING`, `HOTKEY_EDIT_MODE_WARNING`, `HOTKEY_COUNTDOWN_WARNING`.
Related flags: `scenes-shortcuts`, `scene-delete-shortcut`, `scene-copy-paste`,
`widget-copy-paste`, `fullscreen-double-click`.

---

## 7. Version skew between bundles (three confirmed cases)

`externals.b634d3e8690cf1f3.js` is **ahead of** `restream.887ca3d5bcd09a3a.js`:

1. `LayoutType`: externals has `TBPN`, restream does not.
2. `ThemeType`: externals has `Air`, restream does not.
3. `MediaPlaceholderKind`: externals has `Main|RtmpSource|Camera`, restream has only `Main`.

Also noted: the `DrawingModule` element codec is labelled `"LayoutV2ImageElementIO"` in
`restream.*.js` — a duplicated codec name in Restream's source, not a transcription error here.

---

## 8. Honest negatives

- **No static tile-geometry table** for any layout. Rects are produced at runtime by
  `Layout*V2` classes into `ElementLayoutV2ContainerIO {left,top,width,height}`.
- **No `maxDestinations`** anywhere.
- **No `DEFAULT_*_LAYOUT_OPTIONS` server-shape fallbacks** beyond the eight objects in §1.4.
- **`CinemaLayoutOptionsIO` ships no default object.**
- **No numeric defaults for the `studioMax*` entitlements** except `maxScreenShares` (3) and the
  `?participants-20` override; everything else comes from `/v2/api/studio/user`.
- **`w.O_`** (fallback max-scenes) is not resolvable from the captured chunks.
- **No frame-rate constant** in Studio code — fps is carried inside profile id strings only.
- The **2026-08-25 refresh introduced nothing new** to layouts, scenes, sources, overlays, or the
  336-flag key set.
