/*
 * studio/shared/src/scene-layout-model.ts
 *
 * The scene + layout data model, spelled the way Restream Studio spells it.
 *
 * Every identifier below is transcribed from the compiled spec (BUILD-SPEC.md,
 * SPEC-features-layouts.md, TOOLS-08-sources-guests-media.md). Nothing here is
 * a name this clone made up: where the spec records no name, there is a comment
 * saying so instead of a guess.
 *
 * ── MARK LEGEND ──────────────────────────────────────────────────────────────
 *   [O]          observed — an exact matched token from a shipped bundle
 *   [I]          inferred — the NAME is [O], this particular value/annotation is not
 *   SPEC SILENT  the spec records the name and nothing else; do not invent the rest
 *   [gap]        the spec explicitly records that the value is unrecoverable
 *
 * ── TYPING RULE ──────────────────────────────────────────────────────────────
 * The spec is a name-level capture. It states scalar types for almost nothing.
 * Rather than silently guess, every annotation this clone chose is wrapped in
 * `SpecSilent<T>` — a compile-time no-op that keeps the field usable while
 * staying greppable as "the spec did not say this". Fields whose shape category
 * is unknown too (`background`, `commerce`, `logo`) are `unknown` outright.
 */

/**
 * The field NAME is [O]; `T` is this clone's choice, not the spec's.
 * Erased at compile time — `SpecSilent<string>` behaves exactly as `string`.
 */
export type SpecSilent<T> = T

/* ═══════════════════════════════════════════════════════════════════════════
 * 1. CANVAS
 * ═════════════════════════════════════════════════════════════════════════ */

/** [O] SPEC-features-layouts §5.3; BUILD-SPEC §3.1 "Program canvas". */
export const CANVAS_WIDTH = 1920
/** [O] SPEC-features-layouts §5.3; BUILD-SPEC §3.1 "Program canvas". */
export const CANVAS_HEIGHT = 1080

/** [O] BUILD-SPEC §3.1. Portrait swaps w/h. */
export enum OutgoingStreamOrientation {
  LANDSCAPE = 'LANDSCAPE',
  PORTRAIT = 'PORTRAIT',
}

/**
 * [O] value, SPEC-features-layouts §1.6: the Showtime layout — and only Showtime —
 * carries `aspectRatio: 1.25` (2 occurrences in externals). The observed token is
 * the property `aspectRatio`; this const identifier is clone-local.
 */
export const SHOWTIME_ASPECT_RATIO = 1.25

/*
 * [O] Preview scaling, SPEC-features-layouts §5.3, verbatim:
 *     const qa = 1080
 *     const i = portrait ? e : t / 1080 * 639
 * Transcribed as a comment because the spec gives an expression, not a type.
 *
 * [O] SPEC-features-layouts §8 Honest negatives: there is NO frame-rate constant
 * anywhere in Studio code — fps is carried inside profile id strings only.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 2. SCENE KINDS
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] SPEC-features-layouts §2.1; BUILD-SPEC §3.2 row "Scene kinds".
 * ONLY THREE scene kinds exist. `Media` and `Default` are scene kinds;
 * everything the clone called a "scene kind" below `Countdown` is really a
 * `SceneMediaType` occupying a Media scene's media slot.
 */
export enum SceneResourceType {
  Default = 'Default',
  Media = 'Media',
  Countdown = 'Countdown',
}

/**
 * [O] SPEC-features-layouts §2.2; BUILD-SPEC §3.2 row "Media kinds".
 * The 8 media kinds a Media scene can hold. NOT a scene kind — TOOLS-08 §1.2
 * calls this "what can occupy a Media scene's media slot".
 */
export enum SceneMediaType {
  InProgressVideoStorage = 'InProgressVideoStorage',
  VideoStorage = 'VideoStorage',
  Presentation = 'Presentation',
  Image = 'Image',
  ScreenSharing = 'ScreenSharing',
  LocalVideo = 'LocalVideo',
  RtmpSourcePull = 'RtmpSourcePull',
  MediaPlaceholder = 'MediaPlaceholder',
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3. PER-SceneMediaType MEDIA RESOURCE CODECS  [O] TOOLS-08 §1.2
 * Field names verbatim. Scalar types SPEC SILENT except `Image.status` and the
 * `| null` on the two `stateKey` fields.
 * ═════════════════════════════════════════════════════════════════════════ */

/** [O] `SceneMediaResourceMediaPlaceholderIO` — `{type}` and nothing else. */
export interface SceneMediaResourceMediaPlaceholderIO {
  type: SceneMediaType.MediaPlaceholder
}

/** [O] `SceneMediaResourceInProgressVideoStorageIO`. */
export interface SceneMediaResourceInProgressVideoStorageIO {
  type: SceneMediaType.InProgressVideoStorage
  id: SpecSilent<string>
  isLooped: SpecSilent<boolean>
  shouldAutoplay: SpecSilent<boolean>
  isMuted: SpecSilent<boolean>
}

/** [O] `SceneMediaResourceVideoStorageIO` (TOOLS-08 §1.2 gives the long field list). */
export interface SceneMediaResourceVideoStorageIO {
  type: SceneMediaType.VideoStorage
  id: SpecSilent<string>
  playlistUrl: SpecSilent<string>
  lqPlaylistUrl: SpecSilent<string>
  duration: SpecSilent<number>
  width: SpecSilent<number>
  height: SpecSilent<number>
  displayAspectRatio: SpecSilent<number>
  position: SpecSilent<number>
  isLooped: SpecSilent<boolean>
  shouldAutoplay: SpecSilent<boolean>
  isMuted: SpecSilent<boolean>
  /** [O] optional marker. */
  playbackId?: SpecSilent<string>
}

/** [O] `SceneMediaResourcePresentationIO`. */
export interface SceneMediaResourcePresentationIO {
  type: SceneMediaType.Presentation
  id: SpecSilent<string>
  status: SpecSilent<string>
  filename: SpecSilent<string>
  urlTemplate: SpecSilent<string>
  pagesNumber: SpecSilent<number>
  /** [O] name; SPEC SILENT on the element shape — do not invent one. */
  pagesSizes: unknown[]
  page: SpecSilent<number>
}

/** [O] the only status set the spec spells out. */
export type SceneMediaResourceImageStatus =
  | 'Uploading'
  | 'Processing'
  | 'Ready'
  | 'Failed'

/** [O] `SceneMediaResourceImageIO`. */
export interface SceneMediaResourceImageIO {
  type: SceneMediaType.Image
  id: SpecSilent<string>
  /** [O] status ∈ Uploading | Processing | Ready | Failed. */
  status: SceneMediaResourceImageStatus
  media: unknown
}

/** [O] `SceneMediaResourceScreenSharingIO`. `| null` is [O]; `string` is [I]. */
export interface SceneMediaResourceScreenSharingIO {
  type: SceneMediaType.ScreenSharing
  stateKey: SpecSilent<string> | null
}

/** [O] `SceneMediaResourceLocalVideoIO`. `| null` is [O]; `string` is [I]. */
export interface SceneMediaResourceLocalVideoIO {
  type: SceneMediaType.LocalVideo
  stateKey: SpecSilent<string> | null
}

/** [O] `SceneMediaResourceRtmpSourcePullIO` — `{type}` and nothing else. */
export interface SceneMediaResourceRtmpSourcePullIO {
  type: SceneMediaType.RtmpSourcePull
}

/**
 * [I] union NAME. The spec names the eight codecs individually and the
 * discriminant enum `SceneMediaType`; it never names a union over them.
 * The members and the discriminant are [O].
 */
export type SceneMediaResource =
  | SceneMediaResourceMediaPlaceholderIO
  | SceneMediaResourceInProgressVideoStorageIO
  | SceneMediaResourceVideoStorageIO
  | SceneMediaResourcePresentationIO
  | SceneMediaResourceImageIO
  | SceneMediaResourceScreenSharingIO
  | SceneMediaResourceLocalVideoIO
  | SceneMediaResourceRtmpSourcePullIO

/* ═══════════════════════════════════════════════════════════════════════════
 * 4. SCENE PAYLOADS
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] SPEC-features-layouts §2.7 "Common scene fields", labelled *verbatim*;
 * BUILD-SPEC §3.2 row "Scene fields".
 *
 * This is the CLIENT-CREATE spelling: the id-bearing short names
 * (`captionId`, `tickerId`, `qrCodeId`, `browserSourceId`). The SERVER payload
 * resolves them to objects (`caption`, `qrCode`, `ticker`, `browserSource`) —
 * see `CountdownScenePayloadIO`. Both spellings are real; they are different
 * sides of the wire, not a contradiction.
 */
export interface ClientSceneCreatePayload {
  name: SpecSilent<string>
  shouldShowChatOverlay: SpecSilent<boolean>
  /** [O] default `false`. */
  shouldAutoswitchToNextScene: SpecSilent<boolean>
  layoutType: LayoutType
  captionId: SpecSilent<string | null>
  tickerId: SpecSilent<string | null>
  qrCodeId: SpecSilent<string | null>
  browserSourceId: SpecSilent<string | null>
  overlayId: SpecSilent<string | null>
  /** [O] default `null`. */
  logoId: SpecSilent<string | null>
  /** [O] default `null`. SPEC SILENT on the object shape. */
  logo: unknown
  /** SPEC SILENT on the shape (`BackgroundIO` is named but not spelled out). */
  background: unknown
  /** SPEC SILENT on the shape. */
  commerce: unknown
}

/*
 * [O] codec NAMES only — SPEC-features-layouts §2.1:
 *   ClientDefaultSceneCreatePayloadIO
 *   ClientMediaSceneCreatePayloadIO
 *   ClientCountdownSceneCreatePayloadIO
 * SPEC SILENT on what each adds over the common fields, so they are aliases
 * rather than invented extensions.
 */
export type ClientDefaultSceneCreatePayloadIO = ClientSceneCreatePayload
export type ClientMediaSceneCreatePayloadIO = ClientSceneCreatePayload
export type ClientCountdownSceneCreatePayloadIO = ClientSceneCreatePayload

/**
 * [O] TOOLS-08 §8 AI tool registry, `create_scene` args. These two create-time
 * field names appear ONLY there — not in the §2.7 verbatim list — so they are
 * kept separate rather than folded into `ClientSceneCreatePayload`.
 */
export interface CreateSceneToolArgs extends ClientSceneCreatePayload {
  shouldShowParticipantNames: SpecSilent<boolean>
  logoPosition: LogoPosition
}

/**
 * [O] TOOLS-08 §1.3 "Countdown scene (a scene type, not a media source)",
 * marked `[observed]`. The only place the spec spells out a SERVER-side scene
 * shape in full.
 */
export interface CountdownScenePayloadIO {
  id: SpecSilent<string>
  type: SceneResourceType.Countdown
  /** [O] default `"Default scene name"`. */
  name: SpecSilent<string>
  brandId: SpecSilent<string | null>
  orderId: SpecSilent<string>
  shouldShowChatOverlay: SpecSilent<boolean>
  /** [O] default `false`. */
  shouldAutoswitchToNextScene: SpecSilent<boolean>
  caption: unknown
  qrCode: unknown
  ticker: unknown
  browserSource: unknown
  background: unknown
  logo: unknown
  logoV2: unknown
  overlay: unknown
  commerce: unknown
  /** [O] `{ …, shouldPlayOnSourcePuller: false }`. */
  music: { shouldPlayOnSourcePuller: SpecSilent<boolean> }
  status: CountdownSceneStatus
  statusV2: CountdownSceneStatusV2
  durationMs: SpecSilent<number>
  positionMs: SpecSilent<number>
  font: unknown
  /** [O] default the literal string `"Auto"`. */
  color: CountdownSceneColor
  /** [O] default `Large`. */
  size: CountdownSceneSize
}

/** [O] default `"Default scene name"` — TOOLS-08 §1.3. */
export const DEFAULT_SCENE_NAME = 'Default scene name'

/*
 * OMITTED ON PURPOSE: `DefaultScenePayloadIO` and `MediaScenePayloadIO`.
 * SPEC-features-layouts §2.1 records the codec NAMES and nothing else — no
 * field list exists in the capture. Writing bodies for them would be invention.
 * Multiple media per Media scene is `mediaList`, gated by server capability
 * `multipleMediaV2`, mutated by `SwapSceneMedia` — name [O], shape SPEC SILENT.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 5. COUNTDOWN
 * ═════════════════════════════════════════════════════════════════════════ */

/** [O] SPEC-features-layouts §2.6; TOOLS-08 §1.3. */
export enum CountdownSceneStatus {
  Paused = 'Paused',
  Playing = 'Playing',
}

/** [O] SPEC-features-layouts §2.6; TOOLS-08 §1.3. */
export enum CountdownSceneStatusV2 {
  Playing = 'Playing',
  Ended = 'Ended',
  ReplayReady = 'ReplayReady',
}

/** [O] BUILD-SPEC §3.10. Default `Large`. */
export enum CountdownSceneSize {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
}

/** [O] default `Large` — BUILD-SPEC §3.10. */
export const COUNTDOWN_SCENE_SIZE_DEFAULT = CountdownSceneSize.Large

/** [O] the literal string `"Auto"`, or a hex/gradient value. Default `"Auto"`. */
export type CountdownSceneColor = 'Auto' | SpecSilent<string>

/** [O] default colour is the literal string `"Auto"`. */
export const COUNTDOWN_SCENE_COLOR_DEFAULT: CountdownSceneColor = 'Auto'

/*
 * [O] BUILD-SPEC §3.10 / TOOLS-08 §1.3, behaviour recorded alongside the type:
 *   - Guest mics auto-mute during countdown.
 *   - "Enabled sources don't show on Countdown scenes"
 *   - "Media source can't be added on countdown scene"
 *   - Countdown scenes are locked to HALF_SCREEN only — see `R6` in §12.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 6. SOURCE STATE + SCENE ASSIGNMENT
 * ═════════════════════════════════════════════════════════════════════════ */

/** [O] TOOLS-08 §1.2 `[observed — externals…js]`. SPEC SILENT on what `Legacy` does. */
export enum SourceStateSceneAssignmentMode {
  AllScenes = 'AllScenes',
  PerScene = 'PerScene',
  Legacy = 'Legacy',
}

/** [O] SPEC-features-layouts §2.3. Note `Image` is CamelCase among its siblings. */
export enum SourceStateType {
  MEDIA_STREAM = 'MEDIA_STREAM',
  HLS_VIDEO = 'HLS_VIDEO',
  PRESENTATION = 'PRESENTATION',
  Image = 'Image',
  MEDIA_PLACEHOLDER = 'MEDIA_PLACEHOLDER',
}

/** [O] SPEC-features-layouts §2.4 — the transport enum. */
export enum RoomMediaStreamKind {
  WEBCAM = 'WEBCAM',
  SCREEN = 'SCREEN',
  STINGER = 'STINGER',
  VIDEO = 'VIDEO',
  RTMP_SOURCE_PULL = 'RTMP_SOURCE_PULL',
  VIDEO_SOURCE_PULL = 'VIDEO_SOURCE_PULL',
  AUDIO_SOURCE_PULL = 'AUDIO_SOURCE_PULL',
}

/**
 * [O] TOOLS-08 §1.2 `[observed]` — the live per-source state a scene assignment
 * points at. BUILD-SPEC §3.3 / SPEC-features-layouts §2.3 carry a shorter
 * 15-field version of the same record; TOOLS-08 is the superset and is used here.
 * SPEC SILENT on every scalar type.
 */
export interface MediaStreamStateIO {
  userId: SpecSilent<string>
  type: SourceStateType
  sourceId: SpecSilent<string>
  isMuted: SpecSilent<boolean>
  isOnAir: SpecSilent<boolean>
  isSolo: SpecSilent<boolean>
  isSpotlighted: SpecSilent<boolean>
  isAudioOnly: SpecSilent<boolean>
  audioGainLevel: SpecSilent<number>
  kind: RoomMediaStreamKind
  clientId: SpecSilent<string>
  isBackground: SpecSilent<boolean>
  isAudio: SpecSilent<boolean>
  sessionId: SpecSilent<string>
  isBlinded: SpecSilent<boolean>
  isMirrored: SpecSilent<boolean>
  isSelfMuted: SpecSilent<boolean>
  audioInput: SpecSilent<string | null>
  videoInput: SpecSilent<string | null>
  dimensions: { width: SpecSilent<number>; height: SpecSilent<number> }
  sceneAssignmentMode: SourceStateSceneAssignmentMode
}

/** [O] BUILD-SPEC §3.8 — `audioGainLevel` range; the UI slider is 0–150. */
export const AUDIO_GAIN_LEVEL = { MIN: 0, DEFAULT: 1, MAX: 1.5 } as const

/* ═══════════════════════════════════════════════════════════════════════════
 * 7. PLACEHOLDERS
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] SPEC-features-layouts §2.6 and §7 "Version skew between bundles";
 * BUILD-SPEC §3.3. NOTE the member/value mismatch: `Main` serialises as
 * `"Generic"`, not `"Main"`.
 *
 * Version skew, recorded verbatim: `restream.*.js` has only `Main="Generic"`;
 * `externals.*.js` has all three. Externals is ahead.
 */
export enum MediaPlaceholderKind {
  Main = 'Generic',
  RtmpSource = 'RtmpSource',
  Camera = 'Camera',
}

/** [O] SPEC-features-layouts §2.6 — a single-member enum. */
export enum DrawingModuleKind {
  CAMERA_PLACEHOLDER = 'CAMERA_PLACEHOLDER',
}

/** [O] SPEC-features-layouts §2.6. */
export interface CameraPlaceholderModulePayloadIO {
  drawingModuleId: SpecSilent<string>
  kind: DrawingModuleKind
  audioProducerId: SpecSilent<string | null>
  avatarImageId: SpecSilent<string | null>
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 8. OVERLAYS, GRAPHICS, BRANDING (what a scene's *Id fields point at)
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] BUILD-SPEC §3.6, verbatim: "`OverlayKind = IMAGE` **only**. There is
 * **no "banner" or "lowerThird" type** — the lower third *is* `CaptionIO`, the
 * ticker is `TickerIO`, the frame is an IMAGE overlay".
 * TOOLS-01 §0 restates it at component level: there is no `LowerThird`
 * component and no `overlay-Banner` component. ONE member. Nothing else.
 */
export enum OverlayKind {
  IMAGE = 'IMAGE',
}

/** [O] BUILD-SPEC §3.6 — the lower third is a caption, and captions have two kinds. */
export enum CaptionType {
  GENERIC = 'GENERIC',
  CHAT = 'CHAT',
}

/** [O] BUILD-SPEC §3.6. */
export interface TickerIO {
  id: SpecSilent<string>
  text: SpecSilent<string>
  brandId?: SpecSilent<string>
}

/** [O] BUILD-SPEC §3.6 — **only** two positions. Default `TopRight`. */
export enum LogoPosition {
  TopLeft = 'TopLeft',
  TopRight = 'TopRight',
}

/** [O] default `TopRight`. */
export const LOGO_POSITION_DEFAULT = LogoPosition.TopRight

/**
 * [O] BUILD-SPEC §3.6 records this codec as `LogoIO {…, isWatermark?}` —
 * only the optional `isWatermark` field is spelled out. The rest is SPEC SILENT
 * and is deliberately left undeclared.
 */
export interface LogoIO {
  isWatermark?: SpecSilent<boolean>
}

/** [O] BUILD-SPEC §3.6. */
export interface QrCodeIO {
  sourceQrCodeId: SpecSilent<string>
  title: SpecSilent<string>
  shouldShowTitle: SpecSilent<boolean>
  link: SpecSilent<string>
  brandId: SpecSilent<string | null>
}

/*
 * OMITTED: `BackgroundIO` — BUILD-SPEC §3.6 names the codec; SPEC SILENT on
 * every field. Scene fields that hold one are typed `unknown` above.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 9. COMPOSITOR ELEMENT KINDS
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] SPEC-features-layouts §2.5; BUILD-SPEC §3.3 row "Compositor element kinds".
 * The wire enum and the engine enum (`LayoutItemType`) agree apart from the
 * first member's name: wire `Video`, engine `MediaStream`.
 */
export enum LayoutV2ElementKind {
  Video = 'Video',
  Image = 'Image',
  Ticker = 'Ticker',
  DrawingModule = 'DrawingModule',
  HlsVideo = 'HlsVideo',
  Presentation = 'Presentation',
  MediaPlaceholder = 'MediaPlaceholder',
  SourceImage = 'SourceImage',
}

/** [O] SPEC-features-layouts §2.5 — engine-side spelling of `LayoutV2ElementKind.Video`. */
export const LAYOUT_ITEM_TYPE_MEDIA_STREAM = 'MediaStream'

/** [O] SPEC-features-layouts §2.5 element codecs. */
export interface LayoutV2VideoElementIO {
  producerId: SpecSilent<string>
}
/** [O] */
export interface LayoutV2ImageElementIO {
  imageId: SpecSilent<string>
}
/** [O] */
export interface LayoutV2TickerElementIO {
  tickerId: SpecSilent<string>
}
/** [O] */
export interface LayoutV2HlsVideoElementIO {
  hlsVideoId: SpecSilent<string>
  playbackId: SpecSilent<string>
}
/** [O] */
export interface LayoutV2PresentationElementIO {
  presentationId: SpecSilent<string>
  isPresentation?: SpecSilent<boolean>
}
/** [O] */
export interface LayoutV2MediaPlaceholderElementIO {
  id: SpecSilent<string>
}
/** [O] */
export interface LayoutV2SourceImageElementIO {
  id: SpecSilent<string>
  sourceImageId: SpecSilent<string>
  imageId: SpecSilent<string>
  compositorVideoId: SpecSilent<string>
}

/*
 * [O] SPEC-features-layouts §7: the `DrawingModule` element codec is
 * MISLABELLED `"LayoutV2ImageElementIO"` in the minified source. That is
 * upstream duplication, not a transcription error — do not "fix" it by
 * inventing a `LayoutV2DrawingModuleElementIO` body. SPEC SILENT on its fields.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 10. LayoutType  — the type of the scene's `layoutType` field
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] BUILD-SPEC §3.4; SPEC-features-layouts §1.1.
 *
 * VERSION SKEW, both halves [O]:
 *   `restream.887ca3d5bcd09a3a.js` — 9 members, and it is this copy that is
 *      wrapped as the WIRE CODEC `LayoutTypeIO`. It ends at `Showtime`.
 *   `externals.b634d3e8690cf1f3.js` — 10 members, adding `TBPN`.
 * Anything serialised over the wire must tolerate the 9-member codec.
 *
 * Spelling notes from §1.1's own table:
 *   `Showtime`         — CamelCase, NOT SCREAMING_CASE like its siblings.
 *   `TBPN`             — externals only; gated by plan tag
 *                        `studioSpecialLayoutsTbpn` + URL flag `tbpn-layout`.
 *   `CINEMA`           — legacy engine only (`CinemaLayout`).
 *   `PADDED_SPOTLIGHT` — spotlight with padding; shares the `SpotlightLayoutV2`
 *                        engine, and appears in NO order map or capability set.
 * UI labels: AUTO_CONTAIN = "Contain", AUTO_COVER = "Cover",
 *            HALF_SCREEN = "Half Screen".
 */
export enum LayoutType {
  SPOTLIGHT = 'SPOTLIGHT',
  PADDED_SPOTLIGHT = 'PADDED_SPOTLIGHT',
  AUTO_CONTAIN = 'AUTO_CONTAIN',
  AUTO_COVER = 'AUTO_COVER',
  HALF_SCREEN = 'HALF_SCREEN',
  CINEMA = 'CINEMA',
  THUMBNAILS = 'THUMBNAILS',
  PICTURE_IN_PICTURE = 'PICTURE_IN_PICTURE',
  Showtime = 'Showtime',
  TBPN = 'TBPN',
}

/**
 * The 9 members of the wire codec `LayoutTypeIO` (`restream.*.js`). Membership
 * is [O]; the const identifier is clone-local. Validate inbound scene payloads
 * against this, not against the 10-member runtime enum.
 */
export const LAYOUT_TYPE_IO_MEMBERS = [
  LayoutType.SPOTLIGHT,
  LayoutType.PADDED_SPOTLIGHT,
  LayoutType.AUTO_CONTAIN,
  LayoutType.AUTO_COVER,
  LayoutType.HALF_SCREEN,
  LayoutType.CINEMA,
  LayoutType.THUMBNAILS,
  LayoutType.PICTURE_IN_PICTURE,
  LayoutType.Showtime,
] as const

/**
 * [O] BUILD-SPEC §3.18 "Explicitly absent — do not go looking for these";
 * SPEC-features-layouts "Explicit negatives (searched, zero hits)". Restream
 * does not use this vocabulary. Kept as a live list so a lint/test can fail
 * the moment one of them reappears in the clone.
 *
 * CAVEAT worth carrying: `solo` DOES exist in the capture — as a URL feature
 * flag and as the source-state boolean `isSolo`. Never as a layout id.
 */
export const ABSENT_SCENE_AND_LAYOUT_VOCABULARY = [
  'solo',
  'split',
  'grid',
  'sideBySide',
  'fullscreen',
  'lowerThird',
  'lower-third',
  'pip',
  'ticker',
] as const

/* ═══════════════════════════════════════════════════════════════════════════
 * 11. LAYOUT ENGINES
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] SPEC-features-layouts §1.2 (externals.*.js, module 83031 export map);
 * BUILD-SPEC §3.4 row "Engines". 18 class names.
 *
 * `ThumbnailsLayoutV2` has NO portrait sibling. Portrait variants exist for
 * Cover, Contain, HalfScreen, Spotlight and Pip only.
 *
 * The const identifier is clone-local; every string in it is [O].
 */
export const LAYOUT_ENGINE_CLASSES = [
  'CoverLayoutV2', 'CoverPortraitLayoutV2',
  'ContainLayoutV2', 'ContainPortraitLayoutV2',
  'HalfScreenLayoutV2', 'HalfScreenPortraitLayoutV2',
  'SpotlightLayoutV2', 'SpotlightPortraitLayoutV2',
  'PipLayoutV2', 'PipPortraitLayoutV2', 'PipWithRightZoneLayoutV2',
  'ThumbnailsLayoutV2',
  'CinemaLayoutV2', 'CinemaLayout',
  'ShowtimeLayoutV2', 'ShowtimeLayout',
  'TbpnLayoutV2', 'TbpnLayout',
] as const

/*
 * [O] SPEC-features-layouts §8 Honest negatives: "No static tile-geometry table
 * for any layout. Rects are produced at runtime by `Layout*V2` classes into
 * `ElementLayoutV2ContainerIO`." Do not reintroduce a hard-coded rect table.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 12. LAYOUT ORDER MAPS AND CAPABILITY SETS  [O] SPEC-features-layouts §1.3
 * Minified identifiers preserved — they are the only names the capture has.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Ordered map: index 0 → hotkey position 1 (Shift+1) … up to Shift+7. */
export type LayoutOrderMap = readonly LayoutType[]

/* Capability SETS — 575.434695f973e2e774.js, webpack module 41204. */

/** [O] `DE` */
export const DE: LayoutOrderMap = [
  LayoutType.AUTO_CONTAIN, LayoutType.AUTO_COVER, LayoutType.HALF_SCREEN,
  LayoutType.SPOTLIGHT, LayoutType.PICTURE_IN_PICTURE, LayoutType.THUMBNAILS,
  LayoutType.Showtime, LayoutType.TBPN,
]
/** [O] `ZV` */
export const ZV: LayoutOrderMap = [
  LayoutType.AUTO_CONTAIN, LayoutType.AUTO_COVER, LayoutType.SPOTLIGHT,
  LayoutType.HALF_SCREEN,
]
/** [O] `ek` */
export const ek: LayoutOrderMap = [
  LayoutType.AUTO_CONTAIN, LayoutType.AUTO_COVER, LayoutType.SPOTLIGHT,
  LayoutType.HALF_SCREEN, LayoutType.THUMBNAILS, LayoutType.Showtime,
  LayoutType.TBPN,
]
/** [O] `ZH` = `ek` + PICTURE_IN_PICTURE */
export const ZH: LayoutOrderMap = [...ek, LayoutType.PICTURE_IN_PICTURE]

/* Ordered MAPS — key = hotkey position 1..7 (Shift+1 … Shift+7). */

/** [O] `zS` — scenes mode off (legacy). */
export const zS: LayoutOrderMap = [
  LayoutType.AUTO_CONTAIN, LayoutType.AUTO_COVER, LayoutType.HALF_SCREEN,
  LayoutType.PICTURE_IN_PICTURE, LayoutType.CINEMA, LayoutType.THUMBNAILS,
]
/** [O] `QA` — default scene, landscape, no Showtime. */
export const QA: LayoutOrderMap = [
  LayoutType.AUTO_CONTAIN, LayoutType.AUTO_COVER, LayoutType.HALF_SCREEN,
  LayoutType.PICTURE_IN_PICTURE, LayoutType.THUMBNAILS,
]
/** [O] `y6` — default scene, landscape, Showtime on. */
export const y6: LayoutOrderMap = [
  LayoutType.Showtime, LayoutType.AUTO_CONTAIN, LayoutType.AUTO_COVER,
  LayoutType.HALF_SCREEN, LayoutType.PICTURE_IN_PICTURE, LayoutType.THUMBNAILS,
]
/** [O] `gT` — default scene, portrait. */
export const gT: LayoutOrderMap = [
  LayoutType.AUTO_CONTAIN, LayoutType.AUTO_COVER, LayoutType.HALF_SCREEN,
  LayoutType.PICTURE_IN_PICTURE, LayoutType.CINEMA,
]
/** [O] `vb` — media scene, landscape, no Showtime. */
export const vb: LayoutOrderMap = [
  LayoutType.SPOTLIGHT, LayoutType.AUTO_CONTAIN, LayoutType.AUTO_COVER,
  LayoutType.HALF_SCREEN, LayoutType.PICTURE_IN_PICTURE, LayoutType.THUMBNAILS,
]
/** [O] `DM` — media scene, landscape, Showtime on. */
export const DM: LayoutOrderMap = [
  LayoutType.SPOTLIGHT, LayoutType.Showtime, LayoutType.AUTO_CONTAIN,
  LayoutType.AUTO_COVER, LayoutType.HALF_SCREEN, LayoutType.PICTURE_IN_PICTURE,
  LayoutType.THUMBNAILS,
]
/** [O] `Tj` — media scene, portrait. */
export const Tj: LayoutOrderMap = [
  LayoutType.SPOTLIGHT, LayoutType.AUTO_CONTAIN, LayoutType.AUTO_COVER,
  LayoutType.HALF_SCREEN, LayoutType.PICTURE_IN_PICTURE, LayoutType.CINEMA,
]
/**
 * [O] `R6` — countdown scene. Position 1 → HALF_SCREEN, positions 2–7 empty.
 * BUILD-SPEC §3.10: "Countdown scenes are locked to **HALF_SCREEN only**".
 */
export const R6: LayoutOrderMap = [LayoutType.HALF_SCREEN]

/**
 * [O] `HostPageViewStore.layoutPositionMap`, SPEC-features-layouts §1.3.
 * Branch structure transcribed verbatim from the selector; the parameter names
 * are clone-local. `layoutTypeToHotkeyMap` then maps position n → hotkey
 * `CHANGE_LAYOUT_TO_*` (`Oe.h5[n-1]`).
 */
export function layoutPositionMap(input: {
  shouldShowScenes: boolean
  isDefaultScene: boolean
  isMediaScene: boolean
  orientation: OutgoingStreamOrientation
  shouldShowShowtimeLayout: boolean
}): LayoutOrderMap {
  const { shouldShowScenes, isDefaultScene, isMediaScene, orientation, shouldShowShowtimeLayout } = input
  const isLandscape = orientation === OutgoingStreamOrientation.LANDSCAPE
  if (!shouldShowScenes) return zS
  if (!(isDefaultScene || isMediaScene)) return R6 // countdown scene → HALF_SCREEN only
  if (isMediaScene) return isLandscape ? (shouldShowShowtimeLayout ? DM : vb) : Tj
  return isLandscape ? (shouldShowShowtimeLayout ? y6 : QA) : gT
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 13. TILE GEOMETRY  [O] SPEC-features-layouts §1.6
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] field names and `Int` types; [I] the unit.
 * io-ts source, verbatim:
 *   fl = a.readonly(a.type({left:a.Int, top:a.Int, width:a.Int, height:a.Int}),
 *                   "ElementLayoutV2ContainerIO")
 * §1.6 marks the unit INFERRED: canvas pixels, because these sit alongside
 * `sourceWidth`/`sourceHeight` and the layout classes take `widthPx`/`heightPx`.
 * Emitted per element per frame — NOT a static grid table.
 */
export interface ElementLayoutV2ContainerIO {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** [O] SPEC-features-layouts §1.6. Capitalised. Exactly two members. */
export type ElementLayoutV2FitType = 'Cover' | 'Contain'

/**
 * [O] SPEC-features-layouts §1.6 — the 9-grid.
 *
 * SPELLING TRAP: this grid uses `CenterLeft` / `CenterRight`, but the
 * layout-OPTION 9-grids (`SpotlightLayoutPosition`, `PipLayoutMainPosition`,
 * §14) use `LeftCenter` / `RightCenter`. Two spellings for the same two cells.
 * The spec records both; do not normalise them.
 */
export type ElementLayoutV2Gravity =
  | 'TopLeft' | 'TopCenter' | 'TopRight'
  | 'CenterLeft' | 'CenterCenter' | 'CenterRight'
  | 'BottomLeft' | 'BottomCenter' | 'BottomRight'

/**
 * [O] SPEC-features-layouts §1.6, verbatim
 * `hl = a.readonly(a.type({...}), "ElementLayoutV2IO")`.
 * SPEC SILENT on the codec types of the six `meta` fields, and on what
 * `background: cl` resolves to — the spec prints the minified ref `cl`
 * without expanding it. TWO container rects per element.
 */
export interface ElementLayoutV2IO {
  readonly meta: {
    shouldShowShadow: SpecSilent<boolean>
    shouldRoundCorners: SpecSilent<boolean>
    sourceWidth: SpecSilent<number>
    sourceHeight: SpecSilent<number>
    sourceVideoUrl?: SpecSilent<string>
    staticImageUrl?: SpecSilent<string>
  }
  /** minified codec ref `cl`, unresolved in the capture. */
  readonly background: unknown
  readonly fit: { type: ElementLayoutV2FitType; gravity: ElementLayoutV2Gravity }
  readonly cropContainer: ElementLayoutV2ContainerIO
  readonly videoContainer: ElementLayoutV2ContainerIO
  readonly opacity: number
  readonly zOrder: number
  readonly borderRadius: number
}

/** [O] SPEC-features-layouts §1.6 — `progress` is the only added field. */
export type ElementLayoutV2KeyframeIO = ElementLayoutV2IO & { progress: number }

/**
 * [O] field names and the `[x,y]` tuple shape; [I] the element type of
 * `keyframes` (both sources write a bare `[]`). SPEC SILENT on the unit of
 * `duration` (ms vs s) and on any default duration or easing preset.
 */
export interface LayoutV2TransitionIO {
  duration: number
  /** cubic-bezier control point [x, y]. */
  p1: [number, number]
  /** cubic-bezier control point [x, y]. */
  p2: [number, number]
  keyframes: ElementLayoutV2KeyframeIO[]
}

/**
 * [O] SPEC-features-layouts §1.6: `readonlyArray(LayoutV2ElementIO)`.
 * SPEC SILENT on the full body of `LayoutV2ElementIO`, so it is left opaque
 * rather than assembled from the per-kind element codecs in §9.
 */
export type AnimatedLayoutV2IO = readonly unknown[]

/**
 * [O] the four field names — passed into EVERY layout constructor
 * (`131.*.js` call sites), SPEC-features-layouts §1.6; BUILD-SPEC §3.4.
 * SPEC-dual-output-and-overlay-slots §4: "overlays declare how much of the
 * frame they consume, and the layout solver reflows sources around them."
 */
export interface OverlayReservedZones {
  tickerZoneHeightPx: number
  captionZoneHeightPx: number
  rightOverlayZoneWidthPx: number
  bottomOverlayZoneHeightPx: number
}

/**
 * [O] the ONLY literal value in the capture: `SR = 42`, the right overlay zone
 * width in px. SPEC SILENT on defaults for `tickerZoneHeightPx`,
 * `captionZoneHeightPx` and `bottomOverlayZoneHeightPx` — this clone must pick
 * its own and must not present them as observed.
 */
export const SR = 42

/* ═══════════════════════════════════════════════════════════════════════════
 * 14. LAYOUT SHAPE / POSITION / ALIGNMENT ENUMS  [O] SPEC-features-layouts §1.7
 * There is NO `Rounded` shape anywhere. The vocabulary is
 * Auto / Vertical / Rectangle / Square / Circle.
 * ═════════════════════════════════════════════════════════════════════════ */

/** [O] */
export enum CoverLayoutShape { Auto = 'Auto', Circle = 'Circle' }

/** [O] */
export enum ContainLayoutShape {
  Auto = 'Auto', Vertical = 'Vertical', Rectangle = 'Rectangle',
  Square = 'Square', Circle = 'Circle',
}

/** [O] */
export enum HalfScreenLayoutMainShape { Auto = 'Auto', Circle = 'Circle' }
/** [O] */
export enum HalfScreenLayoutAsideShape { Auto = 'Auto', Circle = 'Circle' }
/** [O] */
export enum HalfScreenLayoutAlignment { Left = 'Left', Right = 'Right' }

/** [O] */
export enum SpotlightLayoutShape { Auto = 'Auto', Circle = 'Circle' }
/** [O] */
export enum SpotlightLayoutPositionMode { Freemove = 'Freemove', Fixed = 'Fixed' }

/** [O] 9-grid. Note `LeftCenter`/`RightCenter` — NOT the `CenterLeft`/`CenterRight` of §13. */
export enum SpotlightLayoutPosition {
  TopLeft = 'TopLeft', TopCenter = 'TopCenter', TopRight = 'TopRight',
  LeftCenter = 'LeftCenter', CenterCenter = 'CenterCenter', RightCenter = 'RightCenter',
  BottomLeft = 'BottomLeft', BottomCenter = 'BottomCenter', BottomRight = 'BottomRight',
}

/** [O] */
export enum PipLayoutMainPositionMode { Freemove = 'Freemove', Fixed = 'Fixed' }

/** [O] the same 9-grid as `SpotlightLayoutPosition`. */
export enum PipLayoutMainPosition {
  TopLeft = 'TopLeft', TopCenter = 'TopCenter', TopRight = 'TopRight',
  LeftCenter = 'LeftCenter', CenterCenter = 'CenterCenter', RightCenter = 'RightCenter',
  BottomLeft = 'BottomLeft', BottomCenter = 'BottomCenter', BottomRight = 'BottomRight',
}

/** [O] 8 members — the 9-grid MINUS `CenterCenter`. */
export enum PipLayoutAsidePosition {
  TopLeft = 'TopLeft', TopCenter = 'TopCenter', TopRight = 'TopRight',
  LeftCenter = 'LeftCenter', RightCenter = 'RightCenter',
  BottomLeft = 'BottomLeft', BottomCenter = 'BottomCenter', BottomRight = 'BottomRight',
}

/** [O] NOTE the upstream casing: `PiP`, lowercase i — preserved deliberately. */
export enum PiPLayoutAsideShape {
  Vertical = 'Vertical', Rectangle = 'Rectangle', Square = 'Square', Circle = 'Circle',
}

/** [O] 12 members; gated by URL flag `thumbnails-extended-positions`. */
export enum ThumbnailsAsidePosition {
  TopCenter = 'TopCenter', TopLeft = 'TopLeft', TopRight = 'TopRight',
  LeftCenter = 'LeftCenter', LeftTop = 'LeftTop', LeftBottom = 'LeftBottom',
  RightCenter = 'RightCenter', RightTop = 'RightTop', RightBottom = 'RightBottom',
  BottomCenter = 'BottomCenter', BottomLeft = 'BottomLeft', BottomRight = 'BottomRight',
}

/** [O] */
export enum ThumbnailsLayoutAsideShape {
  Vertical = 'Vertical', Rectangle = 'Rectangle', Square = 'Square', Circle = 'Circle',
}

/** [O] */
export enum CinemaLayoutAsideShape {
  Vertical = 'Vertical', Rectangle = 'Rectangle', Square = 'Square', Circle = 'Circle',
}

/** [O] */
export enum ShowtimeLayoutMainShape { Auto = 'Auto', Circle = 'Circle' }
/** [O] */
export enum ShowtimeLayoutSecondaryShape { Auto = 'Auto', Circle = 'Circle' }
/** [O] */
export enum ShowtimeLayoutAsideShape { Auto = 'Auto', Circle = 'Circle' }
/** [O] */
export enum ShowtimeLayoutAlignment { Left = 'Left', Right = 'Right' }

/* ═══════════════════════════════════════════════════════════════════════════
 * 15. LAYOUT OPTIONS — persisted defaults, dev defaults, sliders
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] SPEC-features-layouts §1.4 "Per-layout persisted option defaults"
 * (externals.*.js), verbatim column. Eight objects, one per `*LayoutV2OptionsIO`.
 *
 * Radius defaults are 0 / 1 / 3 in PERCENT (see the slider table below) — NOT px.
 *
 * CINEMA has NO default object — BUILD-SPEC §3.18: "No default object for
 * `CinemaLayoutOptionsIO`." SPEC-features-layouts §8: no `DEFAULT_*_LAYOUT_OPTIONS`
 * server-shape fallbacks beyond these eight.
 */
export const LAYOUT_OPTION_DEFAULTS = {
  Cover: { radius: 0 },
  Contain: { shape: ContainLayoutShape.Rectangle, radius: 1 },
  HalfScreen: { radius: 0, ratio: 65, alignment: HalfScreenLayoutAlignment.Right },
  Spotlight: {
    radius: 1,
    scale: 100,
    positionMode: SpotlightLayoutPositionMode.Fixed,
    fixedPosition: SpotlightLayoutPosition.CenterCenter,
    freemovePosition: [0, 0],
  },
  Pip: {
    mainRadius: 1,
    mainScale: 100,
    mainPositionMode: PipLayoutMainPositionMode.Fixed,
    mainFixedPosition: PipLayoutMainPosition.CenterCenter,
    mainFreemovePosition: [0, 0],
    asidePosition: PipLayoutAsidePosition.BottomRight,
    asideShape: PiPLayoutAsideShape.Rectangle,
    asideSize: 17,
    asideRadius: 3,
  },
  Thumbnails: {
    mainRadius: 1,
    asidePosition: ThumbnailsAsidePosition.RightCenter,
    asideShape: ThumbnailsLayoutAsideShape.Rectangle,
    asideSize: 17,
    asideRadius: 3,
  },
  Showtime: {
    alignment: ShowtimeLayoutAlignment.Left,
    mainRadius: 1,
    secondaryRadius: 1,
    asideRadius: 0,
  },
  Tbpn: { mainRadius: 1 },
} as const

/**
 * [O] SPEC-features-layouts §1.4 closing paragraph — the ONLY layout options
 * codec spelled out prop-by-prop, and the only one with no default object.
 */
export interface CinemaLayoutOptionsIO {
  /** Range(0,50) step 1 */
  mainRadius: number
  /** Range(0,50) step 1 */
  asideRadius: number
  asideShape?: CinemaLayoutAsideShape
  /** Range(15,80) step 1 */
  asideSize?: number
}

/**
 * [O] SPEC-features-layouts §1.5 "Dev/'temp' option defaults — the real
 * geometry numbers", all verbatim. Exposed under URL flags `layout-dev` /
 * `layouts-dev`. `!0`/`!1` in the capture are `true`/`false` here.
 *
 * Gap constants that actually exist: 24, 0, 34. Padding: 24, 32, 130, 0.
 * NO layout has a gap of 16. Tbpn is the only layout with absolute pixel offsets.
 * Keys are the observed codec names.
 */
export const LAYOUT_V2_TEMP_OPTION_DEFAULTS = {
  ContainLayoutV2TempOptionsIO: {
    globalHeader: 'Global',
    /** SPEC SILENT on which enum this belongs to — kept as the literal. */
    alignment: 'CenterCenter',
    shouldGapControlPadding: false,
    singleHeader: 'Single source',
    singleMainScale: 100,
    singleMainOffset: [0, 0],
    extendedPadding: 130,
    mainHeader: 'Multiple sources',
    gap: 24,
    padding: 24,
    shouldSizeFitNextRow: true,
    shouldCover: false,
    shouldLetterbox: false,
    shouldCaptionPush: true,
  },
  CoverLayoutV2TempOptionsIO: {
    globalHeader: 'Global',
    shape: CoverLayoutShape.Auto,
    padding: 0,
    shouldContain: false,
    shouldUseMagicRadiusPadding: true,
    shouldGapControlPadding: false,
    singleHeader: 'Single source',
    singleMainScale: 100,
    singleMainOffset: [0, 0],
    mainHeader: 'Multiple sources',
    mainGap: 0,
    shouldCaptionPush: true,
    shouldAllowBackground: true,
  },
  HalfScreenLayoutV2TempOptionsIO: {
    globalHeader: 'Global',
    padding: 0,
    shouldCaptionPush: true,
    shouldUseMagicRadiusPadding: true,
    shouldGapControlPadding: false,
    shouldUseUnifiedGap: false,
    shouldUseUnifiedRadius: true,
    singleHeader: 'Single source',
    singleMainScale: 100,
    singleMainOffset: [0, 0],
    mainHeader: 'Main',
    mainShape: HalfScreenLayoutMainShape.Auto,
    mainGap: 0,
    mainPadding: 0,
    mainShouldContain: false,
    mainShouldAllowBackground: true,
    asideHeader: 'Aside',
    asideShape: HalfScreenLayoutAsideShape.Auto,
    asideGap: 0,
    asidePadding: 0,
    asideRadius: 0,
  },
  PipLayoutV2TempOptionsIO: {
    mainHeader: 'Main',
    mainPadding: 0,
    disableMagnetMainRadius: false,
    magicMagnetMainRadius: true,
    padding: 0,
    asideHeader: 'Aside',
    stackAsideVertically: false,
    asideGap: 24,
    singleAsideScale: 1,
    asideFreemove: false,
    asideCoords: [0, 0],
    asideScalePad: false,
    asideScaleForm: [0, 0],
    shouldCircleMain: false,
  },
  ThumbnailsLayoutV2TempOptionsIO: {
    mainHeader: 'Main',
    shouldCircleMain: false,
    hideMainBackground: false,
    padding: 0,
    asideHeader: 'Aside',
    longSingleCamera: false,
    asideGap: 24,
  },
  ShowtimeLayoutV2TempOptionsIO: {
    globalHeader: 'Global',
    shouldUsePadding: false,
    padding: 24,
    singleHeader: 'Single',
    singleMainScale: 100,
    singleMainOffset: [0, 0],
    mainHeader: 'Main',
    mainShape: ShowtimeLayoutMainShape.Auto,
    overlap: 100,
    secondaryHeader: 'Secondary',
    secondaryShape: ShowtimeLayoutSecondaryShape.Auto,
    shouldPadSecondary: true,
    asideHeader: 'Aside',
    minAsideSourcesPerColumn: 4,
    maxAsideColumns: 1,
    asideShape: ShowtimeLayoutAsideShape.Auto,
    asideGap: 0,
    asidePadding: 0,
    shouldUseAsideMagicRadiusPadding: true,
    shouldPadAside: false,
  },
  TbpnLayoutV2TempOptionsIO: {
    mainHeader: 'Main',
    mainGap: 34,
    mainPaddingTop: 24,
    mainPaddingLeft: 24,
    mainPaddingRight: 24,
    mainPaddingBottom: 32,
    mainBottomOffset: 253,
    borderSpread: 3,
    /** verbatim, spaces included. */
    borderColor: 'rgba(0, 0, 0, 1)',
  },
} as const

/**
 * [O] SPEC-features-layouts §1.5 closing table — slider ranges
 * (`new c.B(min,max)` + `{type:Range, step:N}`) with verbatim UI labels.
 *
 * All radii are PERCENT sliders 0–50, not pixels. Freemove/offset coordinates
 * are normalised to [-1,1] on both axes — not percentages, not pixels.
 */
export const LAYOUT_OPTION_SLIDER_RANGES = {
  mainRadius: { min: 0, max: 50, step: 1, label: 'Main radius, %' },
  secondaryRadius: { min: 0, max: 50, step: 1, label: 'Secondary radius, %' },
  asideRadius: { min: 0, max: 50, step: 1, label: 'Radius, %' },
  /** Pip, Thumbnails, Cinema. */
  asideSize: { min: 15, max: 80, step: 1, label: 'Size, %' },
  /** Cover / Contain / HalfScreen / Showtime. */
  singleMainScale: { min: 40, max: 150, step: 1, label: 'Single scale, %' },
  /** Showtime. */
  overlap: { min: 0, max: 200, step: 1, label: 'Overlap scale, %' },
  /** Pip. */
  singleAsideScale: { min: 0, max: 2, step: 0.01, label: 'Single preview scale' },
} as const

/** [O] `singleMainOffset`, `asideCoords`, `*FreemovePosition` — Coords, x,y ∈ [-1,1]. */
export const LAYOUT_OPTION_COORD_RANGE = {
  x: { min: -1, max: 1 },
  y: { min: -1, max: 1 },
  labels: ['Single offset', 'Coords'],
} as const

/** [O] SPEC-features-layouts §1.8; BUILD-SPEC §3.4 row "Mutations". Booleans are [I]. */
export interface LayoutOptionsWithStatusesIO {
  isModified: SpecSilent<boolean>
  isMainModified: SpecSilent<boolean>
  isAsideModified: SpecSilent<boolean>
  isSecondaryModified: SpecSilent<boolean>
}

/**
 * [O] SPEC-features-layouts §1.8 "Layout mutation commands (externals.*.js)".
 * EIGHT `Update*` messages for TEN `LayoutType` members: `CINEMA` and
 * `PADDED_SPOTLIGHT` have none (PADDED_SPOTLIGHT shares the `SpotlightLayoutV2`
 * engine). SPEC SILENT on every payload field list.
 */
export type LayoutOptionMutation =
  | 'UpdateContainLayoutOptions'
  | 'UpdateCoverLayoutOptions'
  | 'UpdateHalfScreenLayoutOptions'
  | 'UpdatePipLayoutOptions'
  | 'UpdateShowtimeLayoutOptions'
  | 'UpdateSpotlightLayoutOptions'
  | 'UpdateTbpnLayoutOptions'
  | 'UpdateThumbnailsLayoutOptions'
  | 'UpdateContainLayoutTempOptions'
  | 'UpdateCoverLayoutTempOptions'
  | 'UpdateHalfScreenLayoutTempOptions'
  | 'UpdatePipLayoutTempOptions'
  | 'UpdateShowtimeLayoutTempOptions'
  | 'UpdateSpotlightLayoutTempOptions'
  | 'UpdateTbpnLayoutTempOptions'
  | 'UpdateThumbnailsLayoutTempOptions'
  | 'ResetLayoutOptions'

/**
 * [O] SPEC-features-layouts §1.8 final line. Lowercase is the spec's own
 * spelling — these are object keys, not layout ids.
 */
export type ResetTarget = 'all' | 'main' | 'aside'
/** [O] Showtime adds `secondary`. */
export type ShowtimeResetTarget = 'all' | 'main' | 'aside' | 'secondary'
/** [O] Tbpn is `{all, main}`. */
export type TbpnResetTarget = 'all' | 'main'

/* ═══════════════════════════════════════════════════════════════════════════
 * 16. SCENE WIRE MESSAGES
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] SPEC-apis-and-events §2 "Scenes:"; BUILD-SPEC §3.2 rows "CRUD + order",
 * "Multi-editor presence", "Preload & swap".
 * Server capability `addSceneMessagesV2` gates the newer message set.
 */
export type SceneMessage =
  | 'AddScene' | 'AddScenesBatch'
  | 'CREATE_NEW_SCENE' | 'CREATE_NEW_SCENES_BATCH'
  | 'DELETE_SCENE' | 'DUPLICATE_SCENE' | 'DuplicateScene'
  | 'SCENE_SELECTED'
  | 'SceneAdded' | 'SceneRemoved' | 'SceneUpdated' | 'SCENES_UPDATED'
  | 'ScenesOrderUpdated' | 'UPDATE_SCENES_ORDER'
  | 'UPDATE_SCENE_NAME' | 'UPDATE_SCENE_ID'
  | 'StartEditingScene' | 'StopEditingScene' | 'SceneEditorsUpdated'
  | 'PreloadSceneMedia' | 'SwapSceneMedia'

/**
 * [O] BUILD-SPEC §3.2 row "Source assignment"; SPEC-apis-and-events §2;
 * TOOLS-08 §7.
 */
export type SceneSourceAssignmentMessage =
  | 'AssignSource'
  | 'UnassignSource'
  | 'UnassignCamera'
  | 'UpdateSceneAssignedCamera'
  | 'UpdateSceneAssignedSource'
  | 'UpdateCameraSceneAssignmentMode'
  | 'UpdateSourceSceneAssignmentMode'

/** [O] adjacent (NOT assignment) source messages on the same wire — TOOLS-08 §7. */
export type SourceMessage =
  | 'REMOVE_SOURCE'
  | 'UPDATE_SOURCE_STATE'
  | 'SOURCES_STATE_UPDATED'
  | 'SWAP_SOURCES'
  | 'UPDATE_MEDIA_STREAMS_ON_AIR_STATE'
  | 'UPDATE_MEDIA_STREAMS_IS_MUTED_STATE'

/* ═══════════════════════════════════════════════════════════════════════════
 * 17. AUTO-SWITCH
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] TOOLS-08 §4.2; BUILD-SPEC §3.2 row "Auto-switch";
 * SPEC-features-layouts §2.7 (field + default) and §4.5 (flags).
 *
 * The field is `shouldAutoswitchToNextScene`, default `false`, on ALL THREE
 * scene payloads. It is a SCENE field, never a source field.
 */
export const UPDATE_SHOULD_AUTOSWITCH_TO_NEXT_SCENE =
  'UPDATE_SHOULD_AUTOSWITCH_TO_NEXT_SCENE'

/** [O] server capability gating the newer auto-switch behaviour. */
export const SCENES_AUTO_SWITCH_V2_CAPABILITY = 'scenesAutoSwitchV2'

/** [O] SPEC-features-layouts §4.5 URL flag list. */
export type AutoSwitchUrlFlag =
  | 'scenes-countdown-auto-switch'
  | 'scenes-video-auto-switch'
  | 'scenes-auto-switch-v2'
  | 'scenes-auto-switch-v2-onboarding-popover'
  | 'scenes-auto-switch-v2-promo-popover'
  | 'scenes-auto-switch-v2-noise-toast'

/**
 * [O] `[observed]` mutual exclusion, from the shipped toast copy:
 *   "Auto-switch scene was enabled, so video loop is off"
 *   "Video looping was enabled, so auto-switch scene is off"
 * Eligibility (AI tool `toggle_auto_switch`): "Works on any Countdown scene, or
 * on Media scenes that have video attached."
 */
export const AUTO_SWITCH_AND_VIDEO_LOOP_ARE_MUTUALLY_EXCLUSIVE = true

/** [O] related server flag in `PublicRoomFeaturesIO`. */
export const SHOULD_REWIND_HLS_VIDEO_TO_START_ON_END = 'shouldRewindHlsVideoToStartOnEnd'

/** [O] `PublicRoomFeaturesIO` flags paired with `PreloadSceneMedia`/`SwapSceneMedia`. */
export type ScenePreloadRoomFeature =
  | 'awaitedVideoPlaybackOnSceneApply'
  | 'awaitedAudioOnSceneApply'

/* ═══════════════════════════════════════════════════════════════════════════
 * 18. SCENE BADGES + EDIT MODE
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [O] BUILD-SPEC §3.2 row "Badges"; SPEC-stage-geometry §4.2.
 * Pill style: 10px / 600, uppercase, letter-spacing 0.04em,
 * border-radius `11px 0 10px`. `EDITING` carries a marching-ants SVG ring.
 * Class names: `SceneItem .activeBadge/.onAirBadge/.editingBadge/.editingAnts`.
 */
export type SceneBadge = 'ACTIVE' | 'ON AIR' | 'EDITING'

/**
 * [O] on-air accent `$onAirAccent`. The reconstruction's stage table gives
 * `#EF4B55`, but the spec's own rule is "where the reconstruction and the
 * production CSS disagree, the CSS wins" — and the CSS gives `#fb4408`.
 */
export const ON_AIR_ACCENT = '#fb4408'
/** [O] `token('color-accent-normal')`. */
export const ACTIVE_ACCENT = '#004eeb'

/** [O] SPEC-component-tree — ScenesSidebar/components/*. Non-text badge components. */
export const SCENE_BADGE_COMPONENTS = [
  'SceneItemPreviewMediaBadge',
  'SceneItemPreviewCountdownBadge',
  'SceneItemPreviewCenteredCountdownBadge',
  'SceneItemPreviewAutoSwitchBadge',
  'SceneItemAttachedWebcamsBadge',
  'SceneEditorsPresenceBadge',
  'SceneProgressBar',
  'SceneStatusOverlay',
] as const

/** [O] BUILD-SPEC §3.2 rows "Scene Edit Mode" / "Multi-editor presence". */
export type SceneEditModeAnalyticsEvent =
  | 'Scene Edit Mode Entered'
  | 'Scene Edit Mode Exited'
  | 'Scene Edit Mode Target Switched'

/** [O] SPEC-features-layouts §4.5 flag list. */
export type SceneEditModeUrlFlag =
  | 'scene-edit-mode'
  | 'scene-edit-mode-pip'
  | 'scene-editing-presence'

/** [O] BUILD-SPEC §3.2 — Scene Edit Mode component names. */
export const SCENE_EDIT_MODE_COMPONENTS = [
  'SceneEditModePill',
  'SceneEditModePreview',
  'SceneEditModePreviewContainer',
  'SceneEditModeOnboardingModal',
  'SceneEditModePip',
] as const

/* ═══════════════════════════════════════════════════════════════════════════
 * 19. LIMITS
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * [gap] BUILD-SPEC §3.2 marks the scene-limit row `[O]/gap`. The shipped
 * expression is `studioMaxScenes ?? w.O_`, where `studioMaxScenes` comes from
 * `UserFeaturesIO` (`/v2/api/studio/user`) and `w.O_` "resolves to a cross-chunk
 * import not present in the captured bundles; value unknown".
 *
 * So: the FIELD NAME is [O], the fallback NUMBER is unrecoverable. This clone
 * must choose its own fallback and must not present it as observed.
 *
 * The shipped copy "You've reached the maximum of 20 scenes." is an [O] string
 * literal, NOT proof of the enforced value — the enforced value is whatever the
 * user-features endpoint returns.
 */
export const STUDIO_MAX_SCENES_FIELD = 'studioMaxScenes'

/** [O] TOOLS-08 §8 — AI tool `create_scenes_batch` is documented "(max 20)". */
export const CREATE_SCENES_BATCH_MAX = 20

/**
 * [O] TOOLS-08 §8 — "max 5 visible per scene"; toast id
 * `STUDIO_MAX_VISIBLE_SCENE_BROWSER_SOURCES` = "You have reached maximum amount
 * of browser sources per scene".
 */
export const MAX_VISIBLE_SCENE_BROWSER_SOURCES = 5

/** [O] SPEC-studio-ui-strings §Scenes — the floor. */
export const SCENE_FLOOR_MESSAGE =
  'Scene cannot be removed: at least one scene must remain'

/* ═══════════════════════════════════════════════════════════════════════════
 * 20. SIDEBAR TABS
 * ═════════════════════════════════════════════════════════════════════════ */

/** [O] BUILD-SPEC §3.15 — `SidebarTabId`, 19 members, PascalCase. */
export enum SidebarTabId {
  MobileSources = 'MobileSources',
  Scenes = 'Scenes',
  MobilePrivateChat = 'MobilePrivateChat',
  Chat = 'Chat',
  VirtualEventsChat = 'VirtualEventsChat',
  Captions = 'Captions',
  Graphics = 'Graphics',
  Widgets = 'Widgets',
  QrCodes = 'QrCodes',
  Guests = 'Guests',
  Attendees = 'Attendees',
  Music = 'Music',
  Countdown = 'Countdown',
  Notes = 'Notes',
  LayoutCustomization = 'LayoutCustomization',
  ChatOverlayCustomization = 'ChatOverlayCustomization',
  Theme = 'Theme',
  Help = 'Help',
  AI = 'AI',
}
