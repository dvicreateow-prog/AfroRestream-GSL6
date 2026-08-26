# Restream Studio Clone — Authoritative Build Spec

**Compiled** 2026-08-25 · **Supersedes** every `SPEC-*.md` and `TOOLS-*.md` in this directory
(they remain as evidence appendices; this document is the one a developer builds from).

**Evidence base**

| corpus | location |
|---|---|
| JS bundles (37, minified) | `01-inside-studio-verified/client-static/js/` |
| CSS bundles (23) | `01-inside-studio-verified/client-static/css/` |
| Extracted SCSS (635 real files) | `03-deep-static/source-maps/extracted/` |
| App shell + env blob | `01-inside-studio-verified/client-static/misc/studio-shell.html` |
| Referenced static assets (fonts, LUTs, wasm, models) | `01-inside-studio-verified/referenced-static/`, `03-deep-static/recursive/` |
| Refreshed chunks (2026-08-25) | `studio/spec/refresh-2026-08-25/` |
| Reconstructed window layouts (22) | `.tmp_restream_studio_build/slide-NN.layout.json` |

**Notation** — `[O]` = observed, a literal read out of a shipped file. `[I]` = inferred, a
conclusion drawn from observed literals. Where the reconstruction (`slide-NN.layout.json`) and the
production CSS disagree, **the CSS wins**.

---

# 1. What we actually have — and what is provably NOT obtainable

## 1.1 The hard limit, stated bluntly

**There is no recoverable application source.** All 34 JS source maps advertised by
`//# sourceMappingURL=` on `studio.restream.io` return the SPA HTML shell (`200 text/html`,
16,736 bytes), not JSON. Every one. Consequently:

- **No React/TSX components.** Not one.
- **No TypeScript types, stores, services, hooks, reducers, or DI wiring.**
- **No business logic.** Every behavioural statement in this document is either a minified
  literal we can read verbatim, or an inference from names.

What *did* survive is the **CSS** source maps: 23 valid maps carried `sourcesContent` for
**756 raw / 636 unique / 635 real** `.scss` + `.css` files, complete with Restream's real
repository paths and their unusually chatty authored comments. That gives us the component
**tree**, every class name, every SCSS variable, and the whole style layer — but no behaviour.

## 1.2 What we hold, by category

| we want | we have | how it was obtained | mark |
|---|---|---|---|
| Component/module names + nesting | **Complete** (635 files, real repo paths) | CSS source maps | [O] |
| Every CSS class, custom property, breakpoint, z-index | **Complete** | CSS source maps + compiled CSS | [O] |
| Design tokens (colour/type/radius/spacing/motion) | **Complete** for what exists; several scales are genuinely missing upstream | compiled CSS `:where(.twp)`, `:root`, `.tw-light`/`.tw-dark` | [O] |
| Every user-facing string | **11,130 unique UI strings** across 37 bundles | mechanical literal extraction | [O] |
| Enums, wire codecs, protocol message names | 669 io-ts `*IO` codecs, 397 `literal()` discriminants | grep of `externals` + `restream` | [O] |
| Feature flags | **336 URL flags**, 33 plan gates, 20 room capabilities, 33 public room features | `searchParams.get/has` + `getUrlOverride` in `Index.*.js` | [O] |
| Keyboard shortcuts | **39 rows**, complete with modifiers | one literal object in `Index.*.js` | [O] |
| Layout option schemas + defaults | 8 persisted default objects + 8 dev "temp" objects with real px | `externals.*.js` | [O] |
| Media pipeline constants (bitrates, ladders, constraints, shaders) | **Complete**, including verbatim GLSL | `593.*.js`, `Index.*.js` | [O] |
| Third-party SDK inventory + versions | **Complete**, with absences proven by zero-hit greps | all bundles + shell | [O] |
| Pixel geometry of the shell | Derivable from CSS. The 22 captured windows are a *reconstruction* and are wrong in 14 named ways (§4.7) | SCSS + compiled CSS | [O] |

## 1.3 Provably NOT obtainable from this capture

| missing | why | consequence for the clone |
|---|---|---|
| **Any application JS/TS source** | source maps serve the SPA shell | write it ourselves; this document is the substitute |
| **Server code** (Room Manager, SFU orchestration, compositor) | never shipped to the browser | design from the protocol surface (§7) |
| **SFU / WebSocket hostnames, region ids** | zero `ws://` / `wss://` literals; ~24 hosts all runtime-injected | our own config plane |
| **STUN / TURN URLs** | fetched at connect time via `GetIceServers` | run our own coturn |
| **Concrete `VideoPreset` table** (name/bitrate/w/h/fps/cost) | server-supplied | define our own ladder (§7.6) |
| **`studioMax*` entitlement numbers** | all arrive from `/v2/api/studio/user`; only `maxScreenShares=3` and the `?participants-20` override ship client-side | pick our own plan matrix |
| **`w.O_`** (max-scenes fallback) | cross-chunk import not present in the capture | unknown; choose our own |
| **`maxDestinations`** | does not exist anywhere in the client | no client cap; enforce server-side |
| **Secrets** — Datadog `clientToken`, Segment write key, Stripe publishable key | injected at runtime; Segment's key is baked into a proxied bundle not on disk | supply our own |
| **`overlay-selection-tokens.scss`** | referenced by `StreamOverlay/Frame` + `Widgets/WidgetOption`, embedded nowhere | re-derive the selection/hover tokens |
| **qualityRTC `main.bundle.js`** | HTTP 403 at capture time | not needed |
| **Compositor internals** | server-side | design from `ElementLayoutV2IO` (§6.1) |
| **A private-audio talkback bus** | no message type or node graph found | design our own if wanted |
| **Chat HTTP paths / chat socket URL** | chat rides the room protocol instead | design our own |

## 1.4 One anomaly worth knowing about

`PresentationsService.OAUTH_TOKEN_TTL_MS = 1e4` (**10 seconds**) in the host build vs
`GuestPresentationsService.OAUTH_TOKEN_TTL_MS = 33e5` (**55 minutes**) in the guest build. Almost
certainly a debug value left in production. Do not copy the 10-second TTL. [O]

---

# 2. Capture freshness after the 2026-08-25 refresh

**Coverage: 100%.** 32/32 hashed JS chunks, 21/21 hashed CSS chunks, plus both named entry points,
are held locally. Before the refresh 7 files were stale (~24% of ~24.6 MB of hashed JS+CSS) because
a stale `runtime.js` chunk table had masked 5 downstream chunks.

| item | captured | live 2026-08-25 |
|---|---|---|
| `BUILD_COMMIT` | `06c4a83bd200952e3c90d43c5a2c451cfc00d787` | `c8e9a412448fbad722e0ca30bc4ffe090167c433` |
| Bundler | rspack 1.7.4 | rspack 1.7.4 (unchanged) |
| `c.p` public path | `/` | `/` |
| Named-chunk maps | 7 JS / 3 CSS names | identical |
| JS chunk table | 32 entries | 32 — 28 same, 3 rehashed, 1 renumbered |
| CSS chunk table | 21 entries | 21 — 20 same, 1 renumbered |
| Shell HTML | 16,736 B | byte-identical, MD5 `6c90a3992309d6c2038c3b813be51896` |
| Env constants | `NAME:"studio-frontend"`, `ENVIRONMENT:"production"`, `VERSION:"1.0.0"`, `DATADOG_APPLICATION_ID:"5b924a92-9c62-4d15-885a-bcd6f0dbd1d5"` | unchanged |

**Bundle graph materially changed: NO.** Net delta ≈ **+2.4 KB across ~24.6 MB**. Chunk `131`
became `357` — a pure renumber (same 45/45 module ids, same first module id 32512, only the entry
module renumbered 76709 → 23096; `Index.js` changed correspondingly at
`r.e("131")/r.bind(r,76709)` → `r.e("357")/r.bind(r,23096)`). Routine incremental deploy.
Chunk id `298` is referenced by `Index` but absent from both hash maps — not a gap:
`externals.js` declares `push([["298"],…])` and is loaded eagerly by the shell.

Newly downloaded: `575.971ebd8632e40587.js` (1,198,640 B, +613), `577.138b33ffcc7591a0.js`
(422,925, +1,863), `593.9f1e08299ec052cd.js` (1,170,883, −32), `357.fab32c9d675a47b1.js`
(2,167,766, −713), `assets/styles/357.2a5ff75d3e613a8f.css` (631,090, +669), plus both entry
points — **5,923,255 bytes total**, all HTTP 200 with real JS/CSS content types.

**Behavioural deltas found** (all [O]):

| chunk | change |
|---|---|
| `Index` | `CutoverTrafficService` settings route `reads:"allowlist"` → `reads:"percentage"` |
| `593` | `get ingestInstance()` GKE ramp removed: `user.id%10<2?"b":"a"` → `"b"` (20% → 100%) |
| `575` + `577` | Google Drive OAuth hardening: `OAUTH_TOKEN_TTL_MS`, `OAUTH_POPUP_WATCH_TIMEOUT_MS=3e5`, `hasValidOAuthToken`, `setOAuthToken`/`clearOAuthToken`, `watchOAuthPopup`, popup-blocked detection `{reason:"popup_blocked"}`, picker guards |
| `575` | `SceneEditorsStore` mock support removed (`hasMocks`, `mockedEditorsByScene`, `setMockEditorScene`) |
| `131`→`357` | `DevSceneEditingPresencePanel` removed (JS+CSS); `SceneEditModePip_{frame,closeButton}` and `SceneItem_{sceneItemContainer,sceneItemContainerMobile,previewContainer,pipPlaceholder}` added — **Scene Edit Mode PiP went from store-only to fully wired** |

Nothing in the refresh touched layouts, scenes, sources, overlays, the 336-flag key set, or the
design tokens. **The spec below is current.**

---

# 3. Complete feature inventory of Studio

## 3.1 Session, program output, go-live

| feature | detail | mark |
|---|---|---|
| Program canvas | **1920x1080** literal used to construct layout items and rasterise gradient backgrounds | [O] |
| Outgoing profile id | `` `${w}x${h}@${fps}fps+${meta}` ``, regex `/^(\d+)x(\d+)@(\d+)fps\+(\w+)$/` | [O] |
| Default profile | `1280x720@30fps+normal`; opt-in `1920x1080@30fps+normal` via `?default-outgoing-stream-profile`; 4K behind `?ultra-hd-4k-outgoing-stream-video-preset` (forwarded as a request header to `/v2/api/studio/user` and `/v2/api/studio/token`) | [O] |
| Resolution enum | `Hd=720`, `FullHd=1080`, `UltraHd=2160` | [O] |
| Orientation | `OutgoingStreamOrientation = LANDSCAPE \| PORTRAIT`; portrait swaps w/h | [O] |
| Dual output | landscape + portrait to different destinations; per-destination `streamingOrientation: horizontal\|vertical\|dual`; gate `studioDualOutputAvailable`; SLACK forced horizontal; TikTok/Instagram default vertical; mixed set without the entitlement forces `DRAFTED` + upgrade popover | [O] |
| Go live / end | `CREATE_LIVE_STREAM`, `START_LIVE_STREAM`, `StartLiveStreams`, `STOP_LIVE_STREAM`, `AbortLiveStreamStart`, `LIVE_STREAM_STATE`, `LiveStreamStopped` | [O] |
| Record-only mode | dedicated header, `RecordModeUpdated`, pause/restart controls | [O] |
| Playlist mode | `START_PLAYLIST_PREVIEW`/`STOP_PLAYLIST_PREVIEW`, `HostPlaylistHeader`, `maxPlaylistHoursPerStream` | [O] |
| Session limits | close codes `RoomSessionDurationExceeded=4014`, `RoomCooldownDurationExceeded=4015` | [O] |
| Compositor is server-side | `COMPOSITOR_CONNECTED/_DISCONNECTED/_UPDATED`, `CompositorProducerTrackReceived`; no `VideoEncoder`/WebCodecs/insertable streams anywhere in 24.6 MB | [O]+[I] |

## 3.2 Scenes

| feature | detail | mark |
|---|---|---|
| Scene kinds | `SceneResourceType = Default \| Media \| Countdown` — **only three** | [O] |
| Media kinds | `SceneMediaType` (8): `InProgressVideoStorage, VideoStorage, Presentation, Image, ScreenSharing, LocalVideo, RtmpSourcePull, MediaPlaceholder` | [O] |
| Scene fields | `{name, shouldShowChatOverlay, shouldAutoswitchToNextScene(=false), layoutType, captionId, tickerId, qrCodeId, browserSourceId, overlayId, logoId(=null), logo(=null), background, commerce}` | [O] |
| CRUD + order | `AddScene`, `AddScenesBatch`, `CREATE_NEW_SCENE(S_BATCH)`, `DELETE_SCENE`, `DUPLICATE_SCENE`, `SCENE_SELECTED`, `UPDATE_SCENES_ORDER`, `ScenesOrderUpdated`, `UPDATE_SCENE_NAME`, `UPDATE_SCENE_ID` | [O] |
| Multi-editor presence | `StartEditingScene`/`StopEditingScene`, `SceneEditorsUpdated`, `SceneEditorsPresenceBadge`, marching-ants `EDITING` ring | [O] |
| Scene Edit Mode | `SceneEditModePill`, `SceneEditModePreview`, `SceneEditModeOnboardingModal`, **`SceneEditModePip`** (newly wired); flag `scene-edit-mode-pip`; analytics `Scene Edit Mode Entered/Exited/Target Switched` | [O] |
| Preload & swap | `PreloadSceneMedia`, `SwapSceneMedia`, `awaitedVideoPlaybackOnSceneApply`, `awaitedAudioOnSceneApply` | [O] |
| Source assignment | `AssignSource`/`UnassignSource`/`UnassignCamera`, `UpdateSceneAssignedCamera/Source`, `UpdateCameraSceneAssignmentMode`, `UpdateSourceSceneAssignmentMode` | [O] |
| Auto-switch | `shouldAutoswitchToNextScene`, auto-switch badge, onboarding + promo popovers, video/countdown auto-switch toasts | [O] |
| Badges | `ACTIVE` / `ON AIR` / `EDITING`, media badge, countdown badge, attached-webcams badge, progress bar | [O] |
| Notes / teleprompter | `ScenesNotes` module, `ToggleScenesNotes` | [O] |
| Scene limit | `studioMaxScenes ?? w.O_` — fallback unresolvable | [O]/gap |

## 3.3 Sources and inputs

| source | detail | mark |
|---|---|---|
| Camera | `getUserMedia` `{width,height,aspectRatio,frameRate}` from `ScreenResolution`; 4K `{ideal:3840x2160}` when local recording is `ULTRA_HD`; device via `{deviceId:{exact}}` | [O] |
| Extra camera | hotkey **E**; flags `extra-camera-audio`, `extra-camera-highlight`, `extra-camera-in-edit-mode`, `per-scene-extra-camera`; gate `studioMaxExtraCameras` | [O] |
| Screen share | `getDisplayMedia`, audio `{EC:false, NS:false, AGC:false, channelCount:2}` + optional `restrictOwnAudio`; `CaptureController` + `setFocusBehavior("no-focus-change")` when `displaySurface==="browser"`; **`maxScreenShares` default 3** (`?max-screen-shares`) | [O] |
| Local video file | `SceneMediaType.LocalVideo`; hotkey **O** | [O] |
| Video storage / clips | HLS-backed; `{displayAspectRatio, position, isLooped, shouldAutoplay, isMuted, playbackId?}`; hotkey **D** | [O] |
| Presentation | `PresentationFormat`: `PDF=0, KEY=1, DOCX=2, PPTX=3`; Google Drive picker via gapi; `{id,status,filename,urlTemplate,pagesNumber,pagesSizes,page}`; hotkey **P** | [O] |
| Image / source image | `SourceImageKind = Generic`; `RoomImageKind = PARTICIPANT_NAME, AVATAR, BACKGROUND, Source`; hotkey **G** | [O] |
| RTMP source pull | `REFRESH_RTMP_SOURCE_PULL_KEY`, connect/disconnect/status messages; hotkey **R**; error `MAX_RTMP_SOURCE_PULLS_EXCEEDED` | [O] |
| Browser source | `BrowserSourceStateElementIO {id, sourceUrl, thumbnailUrl, brandId, name?}`; per-scene cap toast `STUDIO_MAX_VISIBLE_SCENE_BROWSER_SOURCES` | [O] |
| Media placeholder | `MediaPlaceholderKind = Main("Generic") \| RtmpSource \| Camera`; `DrawingModuleKind = CAMERA_PLACEHOLDER`, payload `{drawingModuleId, kind, audioProducerId, avatarImageId}` | [O] |
| Transport kinds | `RoomMediaStreamKind = WEBCAM, SCREEN, STINGER, VIDEO, RTMP_SOURCE_PULL, VIDEO_SOURCE_PULL, AUDIO_SOURCE_PULL` | [O] |
| Live source state | `SourceStateType = MEDIA_STREAM, HLS_VIDEO, PRESENTATION, Image, MEDIA_PLACEHOLDER`; `MediaStreamStateIO {userId,type,sourceId,isMuted,isOnAir,isSolo,isSpotlighted,audioGainLevel,kind,clientId,isBackground,isAudio,sessionId,isBlinded,isMirrored}` | [O] |
| Compositor element kinds | `LayoutV2ElementKind` (8): `Video/MediaStream, Image, Ticker, DrawingModule, HlsVideo, Presentation, MediaPlaceholder, SourceImage` | [O] |

## 3.4 Layouts

| feature | detail | mark |
|---|---|---|
| `LayoutType` | 9 in `restream.js`: `SPOTLIGHT, PADDED_SPOTLIGHT, AUTO_CONTAIN, AUTO_COVER, HALF_SCREEN, CINEMA, THUMBNAILS, PICTURE_IN_PICTURE, Showtime`; `externals.js` adds **`TBPN`** (10) | [O] |
| Engines | `{Cover,Contain,HalfScreen,Spotlight,Pip}{LayoutV2,PortraitLayoutV2}`, `PipWithRightZoneLayoutV2`, `ThumbnailsLayoutV2` (no portrait), `CinemaLayoutV2`/`CinemaLayout`, `ShowtimeLayoutV2`/`ShowtimeLayout`, `TbpnLayoutV2`/`TbpnLayout` | [O] |
| Support nodes | `LayoutSourceNode`, `LayoutGroupNode`, `ElementLayoutV2` | [O] |
| Hotkey ordering | 8 ordered maps + 4 capability sets (§6.4) | [O] |
| Rects | `ElementLayoutV2ContainerIO {left,top,width,height}` Int, canvas pixels; **no static tile table exists** | [O] |
| Transitions | `LayoutV2TransitionIO {duration, p1:[x,y], p2:[x,y], keyframes[]}` cubic-bezier | [O] |
| Overlay reserved zones | `tickerZoneHeightPx`, `captionZoneHeightPx`, `rightOverlayZoneWidthPx`, `bottomOverlayZoneHeightPx`; only literal found **`SR=42`** | [O] |
| Mutations | `Update{Contain,Cover,HalfScreen,Pip,Showtime,Spotlight,Tbpn,Thumbnails}LayoutOptions` + `…TempOptions` twins + `ResetLayoutOptions`; status object `{isModified,isMainModified,isAsideModified,isSecondaryModified}` | [O] |

## 3.5 Guests, roles, capacity

| feature | detail | mark |
|---|---|---|
| Invite link | `https://studio.restream.io/<joinToken>` — token **in the path**, not a query param | [O] |
| Link params | appended only when flagged: `appId, shouldHideVirtualEventsHeaderLogo, hiddenTabElement, regional, useSatelliteSfu, cameraPlaceholders, dev, disableMutedByHostFallback, theme` | [O] |
| Token lifecycle | `GET/POST /events/{id}/invite-access-key(/refresh)`, `POST /events/{id}/studio-join-token/refresh`, `GET /guest/studio-join-token/{token}`; 2 s minimum visible refresh; host broadcasts `EventUrlUpdatedCommand` | [O] |
| **No approval gate** | link guests land in the room **backstage** (off-air). Only rejection path is `Room is full` | [O] |
| Roles | `RoomClientType = HOST, GUEST, COMPOSITOR, RTMP_SOURCE_PULL` (wire typo `"RMTP_SOURCE_PULL"`), `VIDEO_SOURCE_PULL`, `AUDIO_SOURCE_PULL` | [O] |
| Promote to co-host | `PromoteToHost` / `PromotionToHostOffer`; gate `promote-to-host`, capability `promotionToHost`; **limited to 3 hours, cannot be undone** | [O] |
| Per-guest controls | mute, gain, show/hide on air, audio-only, camera blind, solo, spotlight, rename, title, avatar (max **5** uploads), kick, replace, quality details, per-guest local-recording toggle, host-initiated device change (`UpdateMediaDeviceOffer`) | [O] |
| Permissions | `shouldAllowGuestsControlAllPresentations` (default false); Pairs (`hasPairs`, `/pairs/events/{id}/enable-pairs`); `scenes-guests-add-source` | [O] |
| Capacity | `studioMaxParticipants` + server `SfuTokenPayload.participantsLimit`; `?participants-20` experiment; `availableGuestSlots = maxParticipants − activeParticipantsCount` | [O] |
| Pre-join | `JoinScreen` device test, display name, `Join as Guest` / `Join as Viewer`, audio-only fallbacks | [O] |
| Private chat | text only, hotkey **Shift+C**; typing indicators; `PrivateChatMessageIO {clientId,isHost,displayName,…}` | [O] |

## 3.6 Overlays, graphics, branding

| feature | detail | mark |
|---|---|---|
| Overlay kinds | `OverlayKind = IMAGE` **only**. There is **no "banner" or "lowerThird" type** — the lower third *is* `CaptionIO`, the ticker is `TickerIO`, the frame is an IMAGE overlay | [O] |
| Captions | `CaptionType = GENERIC \| CHAT`; `GenericCaptionBodyIO {id,text,secondaryText?,brandId?}` | [O] |
| Ticker | `TickerIO {id,text,brandId?}`; `SHOW_TICKER_V2`/`HIDE_TICKERS_V2`/`UpdateTickerSpeed` | [O] |
| Themes | `ThemeType = DEFAULT, NEWS, ROUNDED, Halloween2023, Xmas2023` (+`Air`) → renderers `Default/News/Rounded/Spooky/Xmas/Air/Ecommerce`; paired `{themeType, primaryColor: HexColor}` | [O] |
| Logo | `LogoIO {…, isWatermark?}`; `LogoPosition` = **only** `TopLeft`, `TopRight` (default `TopRight`) | [O] |
| Background | `BackgroundIO`, `BackgroundStateIO {background,width,height}`, `VideoBackgroundIO {…, screenshotUrl, isDefault, isTranscoded, meta}` | [O] |
| Chat on stream | `ChatOverlayOptionsIO` — `widthScale .3–1`, `heightScale .15–1`, `paddingPx 0–100`, `messageOpacity 0–100`, `messageScale .5–1.5`, `hideMessagesSec 0–120`, `backgroundOpacity 0–100`, `theme`, `alignment`; `ChatOverlayPositionMode = ReservedSpace \| Freemove`; `OverlayChatLayoutIO {width,height,x,y}` | [O] |
| Graphics sections | `overlays`, `logos`, `backgrounds`, `images`, `videoClips` | [O] |
| Per-brand gates | `canAddOverlay/Logo/Background/Caption/GenericCaption/Ticker/QrCode/BrowserSource/VideoClip/CameraPlaceholder/MediaPlaceholder/Brands` | [O] |
| Brand accent ring | 17-hex palette selected by `hash(brandId) % 17` | [O] |
| Runtime identity | CSS custom props `--primaryColor` / `--contrastPrimaryColor`; caption font swapped via `--fontFamily` / `--previousFontFamily` | [O] |

## 3.7 Chat

| feature | detail | mark |
|---|---|---|
| Transport | **chat rides the room protocol**, not HTTP: `REQUEST_CHAT_HISTORY`, `CHAT_TOKEN_UPDATED`, `ADD_PINNED_MESSAGE`/`REMOVE_PINNED_MESSAGE`/`UpdatePinnedMessageOrder`, `ADD_SHOWN_MESSAGE`/`SHOWN_MESSAGES_UPDATED`, `UPDATE_VIRTUAL_EVENTS_CHAT_CREDENTIALS` | [O] |
| Hosts wired but literal-free | `chatClientBackendHost`, `chatHistoryBackendHost` | [O]/gap |
| UI | `ChatTabs` (All / Pinned N), `HostChat`, pinned/shown message lists, `Bubble`, `Message`, `MessageScroller` | [O] |
| Embeddable themes | `@restream/chat-embed-themes` — **28 themes**, 22 self-hosted display fonts | [O] |
| Aggregation | per-platform chat ingested and normalised into one message shape | [O] |

## 3.8 Audio

| feature | value | mark |
|---|---|---|
| Gain constants | `{MIN:0, DEFAULT_BACKGROUND_MUSIC:0.5, DEFAULT:1, MAX:1.5}` → slider 0–150 | [O] |
| Gain graph | `MediaStreamSource → GainNode → MediaStreamDestination`; direct `.value` write, **no ramp**; bypassed under `suspend-audio-context` / `suspend-audio-gain-node` | [O] |
| Mute model | `isMuted` (user), `isSilenced` (auto), `isMutedByHost`, `isSelfMuted`; reason enum `{User, System}` | [O] |
| Who is audible | `isHeardOnLayout` from `remoteAudioLayoutStore` — **the compositor decides**, the client follows by pausing/resuming producers | [O] |
| Level meter | AudioWorklet processor name **`volumeMeter`**, floor **−60 dB**; widgets: 10-segment `SlidingLimiter`, 19-dot settings meter | [O] |
| Legacy meter | **hark** (AnalyserNode, `fftSize:512`, `threshold:-50`, `interval:50`) still bundled | [O] |
| Mic constraints | `echoCancellation`/`noiseSuppression`/`autoGainControl` are **100% browser-native**; AGC deliberately `undefined` in stereo mode | [O] |
| Producer opus | `{dtx:true, priority:"high", networkPriority:"high", adaptivePtime:true}`, `opusNack:true`, `opusStereo` iff stereo input, `opusMaxAverageBitrate:256000` on high-res audio | [O] |
| Broadcast audio | `AudioBitrate = 128000/160000/192000/256000`; `SamplingRate = 44100/48000`; server-selected | [O] |
| Music | curated catalogue + custom upload + countdown music; volume normalised `/6`; `PLAY_AUDIO/PAUSE/RESUME/STOP/RestartAudio/ReplaceAudio/SeekAudio/SetAudioVolume/SetAudioLoop` | [O] |

## 3.9 Video effects

Exactly **four** effects exist: `EffectId = {GreenScreen, MediapipeBackground, Lut, Beautify}`,
`AnalysisKind = {SkinMask:"skinMask"}`. **No hue/saturation/temperature/vignette/sharpness/exposure
effect exists anywhere** (verified by exhaustive grep). Fixed chain order, not user-orderable:
**background → beautify → LUT**, ping-pong FBO rendering. [O]

| effect | key facts | mark |
|---|---|---|
| Green screen | WebGL1-style shader; key colours `AUTO(#000000 sentinel → MediaPipe), GREEN(#00FF00), BLUE(#0099FF), MAGENTA(#FF00FF), CUSTOM`; keying in **UV/chroma space** (luma-independent); mask and spill share `baseMask` shaped with exponent **1.5**; spill suppression desaturates toward Rec.709 luma; default background is a 1x1 opaque black pixel | [O] |
| Green screen params | `similarity 0–1 step .001 default 0.4`; `smoothness default 0.08`; `spill default 0.1`; `contrast/brightness/gamma −1..1 step .01 default 0` (advanced, `?advanced-green-screen`) | [O] |
| MediaPipe background | `selfie_segmenter` float16 **GPU**, texel `[1/256,1/256]`; landscape variant `[1/144,1/256]`; `FilesetResolver.forVisionTasks("/mediapipe")` (self-hosted wasm, weights from Google CDN); sentinels `"DISABLED"`, `"BLUR"` | [O] |
| Beautify | 3-pass GPU (downsample+mask-premultiply → 9-tap box blur → combine); skin mask from `selfie_multiclass_256x256` float32 **CPU in a Web Worker** (`face-skin`/`body-skin`); `intensity 0.2–0.6 step .1 default 0.3`, `radius 0.2–2 step .05 default 0.6` | [O] |
| LUT | 5 `.cube` files — `classic-film, teal-orange, warm-cinema, icy-drama, faded-memories`; WebGL2 **3-D texture, hardware trilinear**; **no strength control exists**; flag `lut-filters` | [O] |
| Pipeline constants | render loop fixed **30 fps** (`setTimeout(0.9 * 1000/fps)`), output `canvas.captureStream(30)`, initial canvas 1280x720, ctx attrs `{premultipliedAlpha:true, powerPreference:"high-performance", depth:false, stencil:false, desynchronized:true, antialias:false, preserveDrawingBuffer:false}` | [O] |
| Consequence | picking 720p60 while any effect is active still emits **30 fps** | [I] |
| Internal scales | MediaPipe blur + mask filter **0.5x**; beautify stats/blur **0.25x**; skin inference at 256 px wide; placeholder blur canvas **1/12x** with `u_blur_radius = 13 * (h/720)` | [O] |

Selectable capture resolutions: `Auto`, `854x480@30fps`, `1280x720@30fps` (default), `1280x720@60fps`,
`1920x1080@30fps`; filtered to `height <= profile.height && framerate <= profile.framerate`. [O]

## 3.10 Countdown and timers

`CountdownSceneStatus = Paused|Playing`; `CountdownSceneStatusV2 = Playing|Ended|ReplayReady`;
`CountdownSceneSize = Small|Medium|Large` (**default Large**); colour default is the literal string
`"Auto"`. Payload adds `{durationMs, musicId, fontId, color, size}`. Messages
`PLAY_COUNTDOWN_SCENE` / `PAUSE_COUNTDOWN_SCENE {sceneId, positionMs?}`. Countdown scenes are locked
to **HALF_SCREEN only** (layout map `R6`). Numerals render **72px/500** (portrait 28px) over
`rgba(0,0,0,.5)`, radius `8px 8px 0 0`. Guest mics auto-mute during countdown. [O]

## 3.11 Recording and clips

| path | detail | mark |
|---|---|---|
| Cloud recording | server-side, of the composited program; `LiveStreamRecordingStatusUpdated`, `Pause/Resume/RestartLiveStreamRecording`; entitlements `recordingHoursPerStream`, `recordingStoringDays` | [O] |
| Local recording | per-participant `MediaRecorder`, deliberately independent of the live stream | [O] |
| Mime preference | MKV first: `video/x-matroska;codecs=avc1.4D402A,opus` → mp4 avc1 → mp4 avc3 → webm vp8/vp9; flags `shouldPreferMp4LocalRecording`, `shouldPreferMp4Avc3LocalRecording` | [O] |
| Why MKV first | MKV survives a truncated write; fragmented MP4 does not | [I] |
| Local bitrates | `>=2160: 21e6/14e6`, `>=1080: 9e6/6e6`, `>=720: 8e6/5e6` (split at `fps>=50`), below: `round(5e6 * w*h/921600)`; audio flat **256000** | [O] |
| Chunking | **5 MiB** parts named `` `${recordingId}_chunk_${n}` ``; **no `timeslice`** — chunking is by byte count | [O] |
| Upload | `GET /files/upload-credentials` → temporary S3 creds → aws-sdk-js **v2** multipart → `/files/upload/${uploadId}`; refresh `/files/upload-credentials/{id}/refresh` | [O]+[I] |
| Kinds | `LocalRecordingKind = AudioOnly \| VideoOnly \| AudioVideo`; resolution `auto` \| `4k` | [O] |
| Stop reasons | `ADD_SHOT_ERROR, ADD_SHOT_PART_ERROR, AUDIO_OR_VIDEO_CHANGE, RECORDER_STOP_EVENT, STARTING_NEW_MEDIA_STREAM, RECORDING_DESTROYED, REMOVED, MAX_RECORD_DURATION_EXCEEDED, PAUSED, SOURCE_OFF_AIR` | [O] |
| Deliverables | Full video (MP4), Full audio (M4A), Split audio tracks (ZIP, Professional plan) | [O] |
| Live clipping / AI clips | `LiveClippingBadge`, `LiveClippingToggleRow`, `aIShortsAvailable` (default false) | [O] |
| Trim editor | `restreamvideoeditor.*.js` (1.1 MB) sub-app | [O] |
| PCAP | `PlayPcapRecording`/`StopPcapRecording` — the SFU can replay captured pcap streams into a room for testing | [O]+[I] |

## 3.12 Destinations, scheduling, analytics

| feature | detail | mark |
|---|---|---|
| Platform enum | numeric **1–84**: `TWITCH=1, YOUTUBE=5, CUSTOM_RTMP=29, FACEBOOK=37, LINKEDIN=59, TIKTOK=67, TWITTER=71 (displayed "X"), TELEGRAM=72, INSTAGRAM=73, AMAZON_LIVE=74, KICK=75, SLACK=76, RUMBLE=77, CUSTOM_SRT=78, SUBSTACK=79, MUX=80, CUSTOM_WHIP=81, CUSTOM_HLS=82, EMBED_PLAYER=83, PATREON=84` (+ ~45 legacy/regional ids) | [O] |
| Restream ingest | `rtmp://live.restream.io/{live,fallback,studio}`; server lists from `v2/public/ingests`, `v2/public/platforms/{id}/stream-servers` | [O] |
| Custom types | RTMP, SRT, WHIP (BETA; URL must match `/^https?:\/\//`), HLS, Embed Player | [O] |
| Per-destination metadata | `{urlInputShow, urlInputPlaceholder, keyInputPlaceholder, title, description, videoURL, supportArticleUrl, isOAuthSupported, isManualAddingSupported, serviceId, serviceName}` | [O] |
| Overrides | title/description/privacy/category per platform; decoders for youtube/tiktok/facebook/instagram/linkedin/twitter/rumble | [O] |
| Scheduling | `eventDecoder`, overlap/concurrency detection, timezone handling, pre-created platform events | [O] |
| **No client destination cap** | `maxDestinations` does not exist in any bundle | [O] |
| Analytics | in-studio live viewer counts + post-stream analytics API + per-destination stream history | [O] |
| Note | WHIP appears **only** as an outbound destination type. Studio's own ingest is mediasoup-over-WebSocket, not WHIP | [O] |

## 3.13 Webinar mode

`SetWebinarModeEnabled`, `WebinarModeEnabledChanged`; `WebinarStateIO {isEnabled,
shouldEnableLiveCallIns(default true), pendingLiveCallInRequests[], pendingViewerInvitesToStudio[],
viewersCount}`; request/accept/reject/cancel/leave live call-in; invite viewer to studio
(added/offered/removed/withdrawn); `WebinarViewersUpdated`, `WebinarViewersCountUpdated`;
`AddWebinarViewerChatMessage`; entitlements `studioWebinarsAvailable`, `studioMaxWebinarViewers`.
**This is the only place a real waiting/approval room exists.** [O]

## 3.14 Commerce / live shopping

`EcommerceOverlayMode = "default" | "compact"`; `EcommerceProductLayoutIO {x,y,width,height}`;
defaults `{currentlyWatchingProductPage:false, countOfBookmarks:false, automaticallyAddToTheCart:false,
enableQRCode:true, showPrice:true, showDiscount:true, disableBackground:false, scale:0.5}`;
alerts `EcommerceProductViewedAlertIO` / `EcommerceProductConvertedAlertIO`; scene commerce status
`Idle|Playing|Ended`; QR codes `QrCodeIO {sourceQrCodeId,title,shouldShowTitle,link,brandId}` gated by
`studioMaxQrCodesPerBrand`, `studioMaxQrCodeTitleLength`, `studioMaxQrCodeLinkLength`. [O]

## 3.15 Settings, shortcuts, sidebar

`StudioSettingsTab` (7): `GENERAL, PROFILE, AUDIO, RECORDINGS, VIDEO, GREEN_SCREEN, SHORTCUTS`.
`SidebarTabId` (19): `MobileSources, Scenes, MobilePrivateChat, Chat, VirtualEventsChat, Captions,
Graphics, Widgets, QrCodes, Guests, Attendees, Music, Countdown, Notes, LayoutCustomization,
ChatOverlayCustomization, Theme, Help, AI`. Default tab =
`verticalSidebar ? null : (useEcommerce ? QrCodes : (isDesktop ? Graphics : MobileSources))`.
39 hotkeys (§6.5). [O]

## 3.16 AI onboarding assistant

`onboarding-chat.*.js` + `Host/OnboardingPage/**` — an agentic LLM chat that configures the studio.
Composer with tool chips, intent chips, resource picker, questionnaire, per-part performance HUD
(`AI chat metrics`), attachments, background/widget assets. Runtime is the **Vercel AI SDK / AI
Gateway** (WS subprotocols `["ai-gateway-realtime.v1","ai-gateway-auth.<key>","ai-gateway-team.<b64url>"]`).
The **agent tool registry lives in chunk `131`/`357`, not in the chat bundle** — effectively a
machine-readable feature contract for the whole product. [O]

## 3.17 Plan gates and flags (the entitlement surface)

`UserFeaturesIO`, verbatim field list [O]:

```
recordingHoursPerStream, recordingStoringDays, hasPerTrackAudioRecording, hasPairs,
hasLocalRecordings, maxVideoUploadsAvailable, maxVideoSizeAvailable, maxVideoDurationAvailable,
maxConcurrentVideoStorageStreams, maxConcurrentEventsStreams, maxPlaylistHoursPerStream,
aIShortsAvailable(=false), studioHasForcedRestreamWatermark, studioMaxCaptions, studioMaxLogos,
studioMaxOverlays, studioMaxBrowserSources, studioMaxVideoClipSizeBytes, studioHasBackgroundMusic,
studioMaxParticipants, studioMaxStaticBackgrounds, studioMaxVideoClips, studioMaxVideoBackgrounds,
studioMaxScenes, studioRtmpSourceConfigurations[], studioOutgoingStreamVideoPresets[],
studioMaxExtraCameras, studioMaxQrCodesPerBrand, studioMaxQrCodeTitleLength,
studioMaxQrCodeLinkLength, studioDualOutputAvailable, studioMaxWebinarViewers,
studioWebinarsAvailable
```

Nested: `VideoPresetIO {name, bitrate, width, height, framerate, cost}` —
the `cost` field implies server-side transcoding is metered per preset [I].
`SourcePullConfigurationsAvailableIO {width, height, framerate, transcoding, cost}`.

Plan enum: `BASIC/PERSONAL=0, STANDARD=1, PROFESSIONAL=2, PREMIUM=3, BUSINESS=4, AGENCY=5,
GAMING_CREATOR=6` (label map `{0:"Free plan", 1:"Standard", …}`). Studio-specific plan tag:
`studioSpecialLayoutsTbpn`. [O]

`RoomManagerCapabilitiesIO` (20, all default `false`) [O]:
```
scenes, playlistMode, scenesOriginalLayouts, chatHistory, overlayConnectionV2,
shouldConvertSceneToDefaultOnAnyMediaRemoval, shouldPreferCurrentSceneLayoutOnMediaRemoval,
showtimeLayout, scenesLocalVideo, scenesVideoClips, showMode, sourceImages, addSceneMessagesV2,
scenesCommerceOverlayMode, customTrackMusic, countdownCustomTrackMusic, audioSourcePullSeekAndLoop,
scenesLogoPosition, overlayFontSelect, countdownSceneFontColorSize
```

`PublicRoomFeaturesIO` adds [O]:
```
mediaPlaceholderHide, scenesSpotlightingLayoutsMediaSwap,
forceSpotlightingSceneMediaOnLayoutTypeChange, scenesOldStudioMigration,
betterVideoBackgroundTransitions, draftEventsMode, disablePassingShowIdInChatToken,
awaitImagesCreateCompletion, awaitBackgroundUpdateCompletion, compositorBorderRadius,
shouldPlayCountdownMusicOnSourcePuller, awaitedVideoPlaybackOnSceneApply, awaitedAudioOnSceneApply
```

**336 URL-parameter flags** exist (full list in `SPEC-features-layouts.md` §4.5); layout-relevant
ones: `showtime-layout`, `showtime-layout-dev`, `tbpn-layout`, `layout-dev`, `layouts-dev`,
`layout-customization-tabs`, `thumbnails-extended-positions`, `main-source-position-control`,
`allow-layout-options-in-all-portrait-layouts(-v2)`,
`allow-layout-options-in-cover-contain-portrait-layouts`,
`dual-output-always-landcape-layout-and-overlay` (typo is upstream),
`force-spotlighting-scene-media-on-layout-type-change`,
`prefer-current-scene-layout-on-media-removal`, `scene-edit-mode-pip`. [O]

## 3.18 Explicitly absent — do not go looking for these

- No client-side program encoder: **no WebCodecs, no `VideoEncoder`, no `MediaStreamTrackProcessor`/`Generator`, no insertable streams, no `transferControlToOffscreen`, no ffmpeg.wasm.**
- No lowercase layout ids `"solo"/"split"/"grid"/"sideBySide"/"fullscreen"/"lowerThird"/"pip"/"ticker"`.
- No Sentry, LaunchDarkly, socket.io, LiveKit, Janus, Agora, Twilio, Vonage/OpenTok, Daily, Millicast, Amazon IVS, Mixpanel, PostHog, GTM, Firebase, Pusher, Ably, TensorFlow.js, ONNX Runtime, OpenCV.js.
- **No consent-management platform at all** (no cookie banner in the shell) — an EU/UK clone must add one.
- No participant colour palette. No `maxDestinations`. No default object for `CinemaLayoutOptionsIO`.
- `slide-NN.layout.json` are `openai.presentation.layout/v4` decks — a *reconstruction*, not Studio data.
