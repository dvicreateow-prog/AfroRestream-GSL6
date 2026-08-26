# TOOLS-08 — Sources, Guests, Presentations, Media, Recording, Stage

Domain inventory mined from the local Restream Studio capture (`01-inside-studio-verified`,
`03-deep-static`). Every row marked **[observed]** is an exact literal found on disk; rows marked
**[inferred]** are reasoning from surrounding code. No network access was used.

## 0. Evidence map — where the truth lives

| Source file | What it yields |
|---|---|
| `client-static/js/externals.b634d3e8690cf1f3.js` | **Richest structural source.** Contains the shared `@restream` io-ts runtime schemas: 675 distinct `*IO` type names, the entire Room-Manager wire protocol, all source/scene/media enums. Two dense regions: byte ~815 000–925 000 and ~3 490 000–3 810 000. |
| `client-static/js/131.8f878df5d7c38b5a.js` | Host page, sources deck, header/recording popover, **the whole AI tool registry (88 tools with descriptions + Zod schemas)**. |
| `client-static/js/575.434695f973e2e774.js` | `AddSourceModal` + all its steps, `InviteUrlStore`, settings forms, `SourceMenu`. |
| `client-static/js/593.47f82f224fb8c169.js` | `RoomConnectionStore` (89 outbound message types), scene models, `UserScreenShareModel`, HLS video model. |
| `client-static/js/114.15f34f2a5005b32d.js` | Layout/preview components incl. `LayoutPresentationSlideControls`. |
| `client-static/js/577.61b0a7bbb0dbc94a.js` | Guest entry bundle. |
| `client-static/js/Index.312bd7238c465fa2.js` | **Env config with real production endpoints**, `UserFeaturesIO` (entitlement limits), 351 URL feature-flags, hotkey map, presentation MIME enum, local-recording codec ladder. |
| `client-static/js/locale-en-US.js` | 1 682 keys — this is the **marketing site / dashboard** locale, *not* Studio. Studio strings are hard-coded English inside the bundles (wrapped in `(0,x.A)("…")`). 3 065 distinct Studio UI strings were extracted this way. |
| `03-deep-static/source-maps/extracted/**` | 446 deduplicated un-minified SCSS source paths under `scripts/{components,dialogs,entries,modules}/…` — authoritative component names. |
| `03-deep-static/recursive/` | Only 21 files (mediapipe models, qualityrtc SDK, react-scan) — nothing domain-relevant. |

### Production service endpoints [observed — `Index.312bd7238c465fa2.js`]

| Key | Value |
|---|---|
| `PUBLIC_URL` | `https://studio.restream.io` |
| `SFU_HTTP_URL` / `SFU_WS_URL` | `https://live.restream.io` / `wss://live.restream.io` |
| `SFU_HTTP_URL_PATTERN` | `https://{region}.restream.io` |
| `RTMP_SOURCE_PULL_URL` | `rtmp://live.restream.io/studio` |
| `STUDIO_BACKEND_URL` | `https://studio-backend.restream.io` |
| `STUDIO_BACKEND_VIDEO_UPLOADS_URL` | `https://studio-backend-upload.restream.io` |
| `VIDEO_STORAGE_BACKEND_URL` | `https://video-storage.restream.io` |
| `CLIENT_RECORDINGS_BACKEND_URL` | `https://client-recordings-backend.restream.io` |
| `RECORDINGS_URL` | `https://streaming-recordings.restream.io` |
| `EVENTS_BACKEND_URL` | `https://backend.events.restream.io` |
| `CLIPS_BACKEND_HOST` | `https://clips-backend.restream.io` |
| `BUILD_COMMIT` | `06c4a83bd200952e3c90d43c5a2c451cfc00d787` |

---

## 1. SOURCE CATALOG

### 1.1 The "Add to your stream" modal [observed — `575.434695f973e2e774.js`, `AddSourceHomeStep`]

Modal title literal: **`"Add to your stream"`**. Each entry is a `SourceOption` (icon + title +
subtitle + optional `NEW` badge + disabled tooltip).

| Order | Title (exact) | Subtitle (exact) | Gate flag | Hotkey |
|---|---|---|---|---|
| 1 | `Video` | `Play videos from the Video Storage.` | `shouldShowVideoStorageButton` | `D` |
| 2 | `Presentations` | `Show slides, PDFs, or other documents.` | `shouldShowPresentationsButton` | `P` |
| 3 | `Screen Share` | `Show what's on your desktop, window, or tab in real time.` | `shouldShowScreenShareButton` | `H` |
| 4 | `Image` | `Share an image from your computer.` | `shouldShowImageButton` (+ `shouldShowSourceImageIsNewBadge`) | `G` |
| 5 | `Extra camera` | `Add a second camera to your stream.` | `shouldShowExtraCameraButton` | `E` |
| 6 | `RTMP source` | `Bring a stream from tools like Zoom or OBS.` — SOCIO variant: `Bring a stream from tools like Webex into Studio.` | `shouldShowRtmpSourceButton` | `R` |
| 7 | `Local video` | `Play a video directly from your computer.` | `shouldShowLocalVideoButton` | `O` |

Disabled tooltip while scene-editing: `"Not available while editing a scene"` (per-source gates
`shouldEnablePresentationInEditMode`, `shouldEnableRtmpSourceInEditMode`,
`shouldEnableSourceImageInEditMode`, `shouldEnableHlsVideoInEditMode`,
`shouldEnableExtraCameraInEditMode`).
Screen-share disabled reason literal: `"Maximum screen shares reached"`.

Modal step machine `AddSourceModalStep` [observed — module `95708`]:
`HOME`, `LOCAL_VIDEO`, `VIDEO_STORAGE_VIDEO`, `VIDEO_STORAGE_VIDEO_PUBLIC_URL`, `RTMP_SOURCE`,
`PRESENTATIONS`, `UPGRADE_FLOW`, `EXTRA_CAMERA`, `EXTRA_CAMERA_SETTINGS`, `IMPORT_YOUTUBE_VIDEOS`.
Default state `{step:"HOME", direction: STAY, props:{}}`. Analytics modal type is
`add_source_modal` or `replace_source_modal`.

Additional entry points not in the modal (SCSS + protocol evidence): **Countdown scene**
(`AddScenePopover` → `Create countdown`), **Browser source** (`AddSceneBrowserSource`),
**Camera placeholder / Media placeholder** (`AddCameraPlaceholder`, `AddMediaPlaceholder`).

### 1.2 Canonical source-type enums [observed — `externals…js`]

`SceneMediaType` (`fv`) — what can occupy a Media scene's media slot:

| Value | Payload IO type | Fields |
|---|---|---|
| `MediaPlaceholder` | `SceneMediaResourceMediaPlaceholderIO` | `{type}` |
| `InProgressVideoStorage` | `SceneMediaResourceInProgressVideoStorageIO` | `{type,id,isLooped,shouldAutoplay,isMuted}` |
| `VideoStorage` | `SceneMediaResourceVideoStorageIO` | `{type,id,playlistUrl,lqPlaylistUrl,duration,width,height,displayAspectRatio,position,isLooped,shouldAutoplay,isMuted,playbackId?}` |
| `Presentation` | `SceneMediaResourcePresentationIO` | `{type,id,status,filename,urlTemplate,pagesNumber,pagesSizes[],page}` |
| `Image` | `SceneMediaResourceImageIO` | `{type,id,status,media}` (status ∈ Uploading/Processing/Ready/Failed) |
| `ScreenSharing` | `SceneMediaResourceScreenSharingIO` | `{type,stateKey\|null}` |
| `LocalVideo` | `SceneMediaResourceLocalVideoIO` | `{type,stateKey\|null}` |
| `RtmpSourcePull` | `SceneMediaResourceRtmpSourcePullIO` | `{type}` |

`SourceStateType` (`y`, module `30966`) — top-level source kinds in the sources deck:
`MEDIA_STREAM`, `HLS_VIDEO`, `PRESENTATION`, `Image`, `MEDIA_PLACEHOLDER`.

`RoomMediaStreamKind` (`h`): `WEBCAM`, `SCREEN`, `STINGER`, `VIDEO`, `RTMP_SOURCE_PULL`,
`VIDEO_SOURCE_PULL`, `AUDIO_SOURCE_PULL`.

`MediaPlaceholderKind`: `Main` (wire value `"Generic"`), `RtmpSource`, `Camera`.

`SourceStateSceneAssignmentMode`: `AllScenes`, `PerScene`, `Legacy`.

`LayoutV2ElementKind`: `Video`, `Image`, `Ticker`, `DrawingModule`, `HlsVideo`, `Presentation`,
`MediaPlaceholder`, `SourceImage`.

Client-side UI enum `A.Bsl` (used for thumbnails/analytics) additionally distinguishes
`Camera`, `CameraPlaceholder`, `ScreenShare` vs `ScreenSharing`, `RtmpSource` vs `RtmpSourcePull`.
Analytics element ids: `camera`, `camera_placeholder`, `screen_sharing`, `rtmp_source_pull`,
`local_video`, `video`, `in-progress-video`, `presentation`, `image`, `placeholder`, `countdown`.

`MediaStreamStateIO` (per-source runtime state) [observed]:
`userId, type, sourceId, isMuted, isOnAir, isSolo, isSpotlighted, isAudioOnly, audioGainLevel,
kind, clientId, isBackground, isAudio, sessionId, isBlinded, isMirrored, isSelfMuted, audioInput,
videoInput, dimensions{width,height}, sceneAssignmentMode`.

### 1.3 Per-source configuration & constraints

#### Camera (primary)

`VideoResolutionsStore` capture presets [observed — module `74678`, class `ScreenResolution`]:

| id | name | w×h | fps |
|---|---|---|---|
| `Auto` | `Auto` | — | — |
| `854x480@30fps` | `Standard Definition` | 854×480 | 30 |
| `1280x720@30fps` | `High Definition` | 1280×720 | 30 |
| `1280x720@60fps` | `High Definition` | 1280×720 | 60 |
| `1920x1080@30fps` | `Full High Definition` | 1920×1080 | 30 |

`fullName` template = `${name} (${height}p @ ${framerate} fps)`.
Field info string: `"Max available resolution based on Live stream quality settings"`.
Other camera fields: `Video input`, `Mirror camera` (`Flip the video horizontally`),
`VP9 encoding` (`Produce better video quality at the cost of increased CPU usage.`),
`Touch up appearance` (NEW) + `Touch up intensity`, Green Screen (similarity, smoothness, spill,
contrast, brightness, gamma), `Blur background`, LUT filters.

#### Extra camera

- Step chain `EXTRA_CAMERA` → `EXTRA_CAMERA_SETTINGS`; submit button literal `"Add Camera"`.
- Sub-form `Extra camera audio settings` (echo cancellation, noise suppression, stereo input,
  high-resolution audio 256 kbps, auto gain control).
- Limit: `user.features.studioMaxExtraCameras`; over-limit copy
  `"You’ve reached the limit of %cameras extra camera(s)"`.
- Modal analytics steps observed: `Extra Camera Allow Camera Permission Modal Step Opened`,
  `… Denied Camera Permission Modal Step Opened`, `… Connect More Devices Modal Step Opened`,
  `… Max Extra Cameras Limit Exceeded Modal Step Opened`.
- Flag `per-scene-extra-camera` (`perSceneExtraCamera`).

#### Screen share

- Uses `navigator.mediaDevices.getDisplayMedia`. `UserScreenShareModel` exposes
  `displaySurface`; `isTabCapture === (displaySurface === "browser")` — i.e. Chrome's native
  tab / window / screen picker is used; **no custom tab/window/screen chooser exists in the app**
  [inferred from absence of any such UI literals].
- **Captured-surface control** (tab capture only): `canControlCapturedSurface`,
  `getSupportedZoomLevels()` (fallback `[100]`), `canIncreaseZoom`, `canDecreaseZoom`,
  `isCapturedSurfaceControlPermissionGranted/Denied`, feature-detected via
  `window.CaptureController.prototype.forwardWheel`.
- Max concurrent screen shares: URL flag `max-screen-shares`, **default `3`** [observed].
- Own-audio restriction flag: `screen-share-restrict-own-audio` (default on).
- Strings: `Maximum number of screen shares reached`, `Stop an existing screen share to add a new one.`,
  `Sharing multiple screens may affect your machine performance and stream quality.`,
  `Off-stage screen shares continue capturing your screen and using your system resources.`,
  `Automatically add shared screens to stream. Disable this if you want to turn it manually.`
  (room flag `shouldAutoAddScreenShare` / message `UPDATE_SHOULD_AUTO_ADD_SCREEN_SHARE`),
  `Screen sharing is not allowed.`, `Screen sharing is not supported on your device.`,
  `Please update system permissions to allow screen recording for the browser.`,
  `Max scenes reached. Remove a scene to screenshare`.
- Second-share warning modal (`Second Screen Share Warning Modal Shown/Confirmed/Dismissed`).

#### Local video file

- Picker: `await (0,je.e5)("video/*")` → **accept `video/*`**, single file [observed].
- Playback is local only: `URL.createObjectURL(file)` → `diskVideoPlayerStreamStore.open(url, replaceStateKey)`.
  Nothing is uploaded; the `<video>` element is `captureStream()`-ed into a WebRTC producer [inferred].
- Warning step literals: `Local Video`, `Share a video file from your computer.`,
  `Local video requires a capable device to play. <br> See our <link>support article<link> for details.`,
  checkbox `I'm sure my device can handle it`, buttons `Upload Video` / `Choose Video`.
- Safari blocked: `Safari doesn't support this feature` +
  `If you want to play a video on the stream, please try to do so on a %sdesktop Google Chrome%s browser.`
- Support article ids: scenes → `…/9230544-local-videos-in-studio-2-0`,
  classic → `…/5131053-play-local-videos-on-your-stream-in-classic-studio`.
- No file-size or duration limit is enforced client-side for local video [observed absence].

#### Video (Video Storage / HLS)

- Accept string [observed — `restream.887ca3d5bcd09a3a.js`]:
  `video/3gpp2, video/3gpp, video/x-msvideo, video/x-flv, video/x-matroska, video/MP2P,
  video/mp2t, video/mpeg, video/mp4, video/quicktime, video/webm, video/x-ms-asf,
  .mkv, .mov, .mp4, .m4v, .avi, .wmv, .mp3, .m4a`
- Upload validators + error codes: `slots-limit-error`, `size-limit-error`, `duration-limit-error`,
  `multiple-upload-limit`, `non-videos-error`; parameters `slotsAvailable`, `slotsMax`,
  `slotsUsed`, `maxFileSize`, `maxFileDuration`, `maxMultipleUpload`.
- Backing entitlements: `maxVideoUploadsAvailable`, `maxVideoSizeAvailable`,
  `maxVideoDurationAvailable`, `maxConcurrentVideoStorageStreams`.
- `HlsVideoFileStatusIO`: `Uploading`, `UploadFail`, `Importing`, `ImportFail`, `Analyzing`,
  `AnalyzeFail`, `Transcoding`, `TranscodingError`, `Ready` (each with `progress` or `reason`).
- `HlsVideoStatus`: `PLAYING` | `PAUSED`. `JsonHlsVideoPayloadIO` = `{hlsVideoId, playbackId,
  status, position, duration, width, height, displayAspectRatio, isLooped, playlistUrl, lqPlaylistUrl}`.
- Error toasts: `Can't upload video. File is too large!'`,
  `Can't upload video. You’ve already reached the maximum of videos!'`,
  `Can't upload video. Check if the link is public and directs to a shared video file.'`,
  `Can't upload video. The Descript project is not ready yet…`.
- Also: in-progress video selection (flag `in-progress-video-storage`), multi-select mode,
  YouTube playlist import step (`IMPORT_YOUTUBE_VIDEOS`), and a Recordings→Uploads callout:
  `Move your file from Recordings to Uploads to add on a scene / to add to a Playlist /
  to add it as a video clip to your stream`.

#### Video URL (`VIDEO_STORAGE_VIDEO_PUBLIC_URL` step)

- Literals: `Import from Descript, Dropbox or Google Drive`,
  `Paste a public link to Descript, Dropbox or Google Drive`.
- Server pulls the file into Video Storage (`/videos/v2/uploading-status`) [inferred].

#### Image (Source Image)

- File input: `type:"file", accept:"image/*", multiple:true, name:"liveStudioImage"`
  (one variant uses `accept: "image/*, video/*"`).
- `SourceImageKindIO`: only `Generic`. `SourceImageStatus`: `Uploading`, `Processing`, `Failed`, `Ready`.
- `ImageSourceStateIO` = `{type, id, sourceImageId, imageId, compositorVideoId, kind, filename,
  clientId, isOnAir, isSolo, isSpotlighted, status, dimensions{width,height}}`.
- Server-side room image formats (`ImageMimeTypeIO`): `image/png`, `image/webp`, `image/svg+xml`.
- Endpoints: `POST /source-images`, `POST /source-images/{id}/on-uploaded`, `DELETE /source-images/{id}`.
- Room protocol: `AddSourceImage`, `AddSourceImages`, `RemoveSourceImage`,
  `ProcessingSourceImageFailed`.
- Drag-and-drop supported (`DndOverlayZone`, `Drop image here`, `Drop files here to upload`).
- Errors: `Could not add image. Please try again or contact support.`,
  `Could not add images. Please remove some scenes and try again.`
- Overlay-image validator string: `Oops, that seems to be not an image! To make it work for the
  overlay, it should be an image file like PNG, JPG, GIF or SVG.`
- AI-side image fetch cap: `10485760` bytes (10 MB) constant in `ThemingToolsService` [observed].

#### Presentation — see §3.

#### Browser source

`BrowserSourceStateElementIO` [observed]:

| Field | Type / default |
|---|---|
| `id` | `BrowserSourceIdIO` (branded string) |
| `sourceUrl` | string (the embedded page URL) |
| `thumbnailUrl` | string |
| `brandId` | BrandId or null |
| `position` | `[x,y]` tuple, range 0..1, default `[0,0]` (label `"Position"`, type `Coords`) |
| `widthScale` | number, default `1`, slider step `0.01` (label `"Width scale"`) |
| `heightScale` | number, default `1`, slider step `0.01` (label `"Height scale"`) |
| `contentViewport` | `{width,height}` ints ≥ 1 (`BrowserSourceContentViewportDimensionIO`) or null |
| `isVisible` | boolean, default `true` |
| `zIndex` | number, default `0` |
| `name` | optional string, **max 100 chars** (from the AI tool schema) |

- **There is no custom CSS / custom JS field.** Only URL, name, viewport size, position, scale,
  z-index, visibility [observed — the io-ts schema is exhaustive].
- **Max 5 visible browser sources per scene** [observed — literal in the `add_scene_browser_source`
  tool description]. Account cap: `user.features.studioMaxBrowserSources`.
- Errors: `Browser source limit reached`, `Browser source with this URL already exists`,
  `You have reached maximum amount of browser sources per scene`,
  `You've exceeded the maximum number of browser sources`, `Browser source not found on this scene`.
- Flags: `scene-browser-sources`, `browser-source-portrait-overlay`, `browser-source-security`,
  `browser-source-favicon`. Server capabilities `browserSourcesSupport`,
  `browserSourceContentViewport`, `browserSourcesDataEdit`.
- Protocol: `AddSceneBrowserSource`, `UpdateSceneBrowserSource`, `RemoveSceneBrowserSource`,
  `UPDATE_BROWSER_SOURCE`, `UpdateBrowserSourceData`.
- AI-generated **widgets** are browser sources (`isAiGenerated: true`; only the name is editable).

#### RTMP source (pull)

- Ingest URL handed to the remote encoder: **`rtmp://live.restream.io/studio`** [observed —
  `RTMP_SOURCE_PULL_URL`]; dev cluster uses `DEV_CLUSTER_RTMP_INGEST_URL=dev-london.restream.io`.
- Stream key = `RtmpSourcePullKeyIO`, held on `RoomState.rtmpSourcePullKey`, refreshable via
  `REFRESH_RTMP_SOURCE_PULL_KEY` → `RTMP_SOURCE_PULL_KEY_REFRESHED`.
- UI literals: `RTMP URL`, `Stream key`, `Need a new stream key?`, `Refresh RTMP key`,
  `Stream key is %sunique for each event%s. Copy it before going live.`,
  `This will immediately invalidate your current stream key. Are you sure you want to generate a new one?`,
  `RTMP Source RTMP URL Copied`, `RTMP Source Stream Key Copied`,
  `RTMP source is restarting because of the new incoming stream`, `Incorrect RTMP settings.`
- Availability: `user.features.studioRtmpSourceConfigurations[]` where each entry is
  `SourcePullConfigurationsAvailableIO = {width, height, framerate, transcoding, cost}`.
  Over-limit copy: `You’ve reached the maximum of %s RTMP source`; gated copy `Upgrade to unlock RTMP source`.
- Status enums: `RtmpSourcePullStatusIO`, failure reasons keyof
  `{UnsupportedCodec, PullError, UnknownSfuError, …}`; SFU events
  `RTMP_SOURCE_PULL_CONNECTED / _DISCONNECTED / _STATUS_UPDATED`.
- Scene attach/detach: `ADD_SCENE_RTMP_SOURCE_PULL` / `REMOVE_SCENE_RTMP_SOURCE_PULL`.
- Audio volume: `SetRtmpSourcePullerAudioVolumeMessageIO`.
- Flags: `enhanced-rtmp-source-bitrate`, `use-srt-for-rtmp-source` (an SRT variant exists) [observed].

#### Countdown scene (a scene type, not a media source)

`CountdownScenePayloadIO` [observed]:
`{id, type=Countdown, name (default "Default scene name"), brandId, orderId, shouldShowChatOverlay,
shouldAutoswitchToNextScene (default false), caption, qrCode, ticker, browserSource, background,
logo, logoV2, overlay, commerce, music{…, shouldPlayOnSourcePuller:false}, status, statusV2,
durationMs, positionMs, font, color (default "Auto"), size (default Large)}`

- `CountdownSceneStatus`: `Paused` | `Playing`; `CountdownSceneStatusV2`: `Playing` | `Ended` | `ReplayReady`.
- `CountdownSceneSize`: `Small` | `Medium` | `Large` (default `Large`).
- Color: the literal `"Auto"` or a hex/gradient value (default `Auto`).
- Messages: `PLAY_COUNTDOWN_SCENE`, `PAUSE_COUNTDOWN_SCENE`, `UPDATE_COUNTDOWN_SCENE_DURATION`,
  `UpdateCountdownSceneColor / Font / Size / Scale / FreemovePosition / BackgroundColor /
  BackgroundOpacity / Music / MusicVolume`.
- UI literals: `Create countdown`, `Add countdown scene`, `Run Countdown`, `Countdown duration`,
  `Countdown font`, `Countdown color`, `Countdown position`, `Countdown scale`, `Countdown music`,
  `Countdown volume`, `Switch scene after countdown`,
  `Plays countdown only and automatically switches to the next scene when it ends`,
  `Starting in {{countdown}}`, `Switching to the next scene in {{countdown}} sec. <action1>Cancel<action1>`,
  `Your mic is muted during the countdown`, `Enabled sources don't show on Countdown scenes`,
  `Media source can't be added on countdown scene`, `Maximize is not available on countdown scene`.

#### Media playlist

There is **no "media playlist" add-source type**. What exists is a separate **Playlists mode**
(URL flag `playlists`, server capability `playlistMode`) for scheduling pre-recorded video events:
`Build your playlist and schedule it to go live`, `Create playlist event`,
`You can add a maximum of %videos video to the playlist`,
`Keep your playlist under %time hour`, `Playlists exceeds your $duration length limit…`,
entitlement `maxPlaylistHoursPerStream`. Host controls: `START_PLAYLIST_PREVIEW`,
`STOP_PLAYLIST_PREVIEW`, `/playlist/{studioJoinToken}`.
Within a scene, multiple media are represented as `mediaList` (server capability `multipleMediaV2`,
messages `UpdateShouldAllowMultipleMedia`, `SwapSceneMedia`) [observed] — that is the closest thing
to a per-scene media playlist.

### 1.4 Account-level source limits [observed — `UserFeaturesIO`, `Index.312bd7238c465fa2.js`]

```
recordingHoursPerStream, recordingStoringDays, hasPerTrackAudioRecording, hasPairs,
hasLocalRecordings, maxVideoUploadsAvailable, maxVideoSizeAvailable, maxVideoDurationAvailable,
maxConcurrentVideoStorageStreams, maxConcurrentEventsStreams, maxPlaylistHoursPerStream,
aIShortsAvailable, studioHasForcedRestreamWatermark, studioMaxCaptions, studioMaxLogos,
studioMaxOverlays, studioMaxBrowserSources, studioMaxVideoClipSizeBytes, studioHasBackgroundMusic,
studioMaxParticipants, studioMaxStaticBackgrounds, studioMaxVideoClips, studioMaxVideoBackgrounds,
studioMaxScenes, studioRtmpSourceConfigurations[], studioOutgoingStreamVideoPresets[],
studioMaxExtraCameras, studioMaxQrCodesPerBrand, studioMaxQrCodeTitleLength,
studioMaxQrCodeLinkLength, studioDualOutputAvailable, studioMaxWebinarViewers,
studioWebinarsAvailable
```

Additional caps from the SFU token (`SfuTokenPayloadIO`): `participantsLimit`, `videoPresets[]`,
`recordingRecordHours`, `recordingStoreDays`, `maxPlaylistHoursPerStream`,
`maxConcurrentVideoStorageStreams`, `maxLogos`, `maxQrCodeTitleLength` (default **18**),
`maxQrCodeLinkLength` (default **1000**), `hasStudioPromoteToHostFeature`, `dualOutputAvailable`,
`hasLocalRecordings`, `enforceRestreamWatermark`, `sourcePullConfigurationsAvailable[]`.
Observed hard literal: `You’ve reached the maximum of 20 scenes.`

---

## 2. GUEST MANAGEMENT

### 2.1 Invite link generation & format [observed — `InviteUrlStore`, `575…js`]

```js
new URL(`${window.location.origin}/${encodeURIComponent(joinToken)}`)
```

i.e. **`https://studio.restream.io/<joinToken>`**. Query params are appended only when the
corresponding feature flag is set: `appId`, `shouldHideVirtualEventsHeaderLogo`,
`hiddenTabElement`, `regional`, `useSatelliteSfu`, `cameraPlaceholders`, `dev`,
`disableMutedByHostFallback`, `theme` (when ≠ default theme name).

| Store state | Values |
|---|---|
| `InviteUrlStore.state.status` | `Loading`, `LoadingFailed`, `Ready`, `Refreshing`, `RefreshingFailed` |
| Refresh debounce | `2 s` minimum visible refresh time (`u.dw.fromSeconds(2)`) |

Backend (events service):
`GET /events/{eventId}/invite-access-key`, `POST /events/{eventId}/invite-access-key/refresh`,
`POST /events/{eventId}/studio-join-token/refresh`, `GET /guest/studio-join-token/{token}`,
`GET /events/{eventId}/studio-access-key`, `POST /events/{eventId}/webinar-viewer-join-token/refresh`.
IO types `GetEventInviteTokenIO`, `RefreshEventInviteTokenIO`; errors `EventInviteGetError`,
`EventInviteTokenPairsDisabledError`.
On refresh the host broadcasts `{type:"EventUrlUpdatedCommand"}` to other hosts.

UI literals: `Invite guests` / `Invite Guests`, `Invite link`, `Copy invite link` /
`Copy Invite Link` / `Copy Invite` / `Copy link` / `Copy link for mobile`,
`Get a new invite link`, `Current invite link will stop working. Are you sure?`,
`This will immediately invalidate your current invite link. Are you sure you want to generate a new one?`,
`Open invite guests popover` (hotkey **I**), `Invite up to %quantity guests to join`,
`Invite 10 people to join your stream with a link.` / `Invite 6 people to join your stream with a link.`
Analytics: `Invite Guest Popover Shown`, `Invite Guest Popover URL Copied`,
`Invite Guest Link Refresh Clicked`, `Invite Guest Link Refresh Confirmation Modal Shown / Confirm Clicked / Dismissed`.

**Invite-by-email**: not present for Studio guests. The only e-mail-ish invite literals
(`Failed to send invite. Please try again.`, `Cancel Invite`, `Invited`) belong to the
**webinar viewer → studio** flow and to organization seat invites [observed]. Guest invitation is
link-only. `InviteMessageTemplate` exists as a copy-to-clipboard message template
[observed name only — contents UNRESOLVED].

### 2.2 Room capacity

| Item | Evidence |
|---|---|
| Cap value | `user.features.studioMaxParticipants` (client) and `SfuTokenPayload.participantsLimit` (server) |
| Staff override | `staffParticipantsLimit` feature |
| "20 participants" experiment | URL flag `participants-20` (`participants20limit`), also propagated to the guest URL as `participants20` |
| Header/deck copy | `%participantsCount/%maxParticipantsCount people on the stream` (component `GuestsCountUpgradeTrigger`) |
| Over-limit copy | `You've reached the max of %max guests.`, `Add up to %count guest. (Max limit: %max)`, `Want more people on your stream? Unlock %upgradeParticipantsCount screen participants with one of our paid plans. %sUpgrade now%s`, `Upgrade to invite more people` |
| Full room | server rejects with `onClientFailedToEnterFullRoom(clientType)` → toast `Room is full` + `Guest is trying to join.` / `Co-host is trying to join.` |
| Upgrade targets | `AUSTIN_STANDARD_STUDIO_PARTICIPANTS`, `ORGANIZATIONS_PROFESSIONAL_INCLUDED_SEATS`, `AUSTIN_PROFESSIONAL_PRODUCERS` |

Marketing literal from the dashboard locale: `10 on-screen participants in Studio` [observed —
`locale-en-US.js`], matching the "of 10 participants" seen in the screenshots.

### 2.3 Approval / waiting room / backstage

**There is no approval gate for link guests.** A guest with a valid join token connects straight
into the room *backstage* (off-air). Evidence: `GUEST_CONNECTED` carries no approval field; the
only rejection path is `Room is full`.

| Concept | Exact literals |
|---|---|
| Backstage badge | `Backstage`, `You're backstage`, `You're backstage. The host may add you to the broadcast at any time. Be ready!`, `Only the host can see you. The host may add you to the broadcast at any time. Be ready!` |
| Backstage mic | `Your mic is muted while you are backstage.` |
| Join prompt to host | `<guestName>guestName</guestName> has joined. <actionButton>Add to the stream</actionButton>`, `{names} has joined.<br></br>Do you want to add them to the stream?` (component `ParticipantJoinedPopover`, flag `participantJoinedPopover`) |
| Guest shares something | `<guestName/> shared the screen / the local video / the presentation / the extra camera. <actionButton>Add to the scene / Show on stream</actionButton>` (`GuestAddedSourceToast`) |
| On-air toggle | source `isOnAir` (`UPDATE_MEDIA_STREAMS_ON_AIR_STATE`), badges `ON AIR`, `Screen share (on air)` / `Screen share (off air)` |

**A real waiting/approval room exists only for webinar viewers** (`webinarPromoteViewerToGuest`):
`Let viewers request to join the stream`, `%count attendee requesting to join...`,
`$count request to join`, `requests to join as a guest`, `Request to join on air`,
`Asked {name} to join as a guest`, `You were allowed to join the live stream`,
`Your request to join the live stream was declined`, `Viewer limit reached`.
Protocol: `RequestWebinarLiveCallIn`, `AcceptWebinarLiveCallInRequest`,
`RejectWebinarLiveCallInRequest`, `CancelWebinarLiveCallInRequest`, `LeaveWebinarLiveCallIn`,
`InviteWebinarViewerToStudio`, `AcceptWebinarViewerInviteToStudio`,
`DeclineWebinarViewerInviteToStudio`, `CancelWebinarViewerInviteToStudio`,
`WebinarViewerInviteToStudioAdded / Offered / Removed / Withdrawn`, `SetWebinarModeEnabled`,
`UpdateGuestIsViewer`. State: `WebinarStateIO {isEnabled, shouldEnableLiveCallIns (default true),
pendingLiveCallInRequests[], pendingViewerInvitesToStudio[], viewersCount}`; request payload
`WebinarLiveCallInRequestIO {clientId, displayName, question}`.

### 2.4 Roles

`RoomClientType` [observed]: `HOST`, `GUEST`, `COMPOSITOR`, `RTMP_SOURCE_PULL` (wire value is the
typo `"RMTP_SOURCE_PULL"`), `VIDEO_SOURCE_PULL`, `AUDIO_SOURCE_PULL`.

**Producer / co-host** — the "promote to host" feature:

- Feature gate `promote-to-host` (`shouldEnablePromotionToHost`), server capability
  `promotionToHost`, entitlement `hasStudioPromoteToHostFeature`.
- Messages: `PromoteToHost`, `PromotionToHostOffer`.
- Literals: `Promote to co-host`, `Promote guest to co-host`, `Become a co-host`,
  `Are you sure you want to promote <b>$name</b> to co-host of this Studio stream, limited to 3 hours? This cannot be undone.`,
  `You invited <b>$name</b> to be the co-host 🎉`,
  `You’ve been offered to become a co-host. Do you want to experience what it feels like to edit and co-produce this stream?`,
  `Can't promote <b>$name</b> to co-host. Please try again later.`
- URL role override flag: `role` (`accountRole`).

### 2.5 Per-guest controls (`SourceMenu` / `SourceControls`)

| Control | Literal / message |
|---|---|
| Mute / unmute | `Mute source`, `Muted by host`, `The host muted $audioInputName`, `mute participant source` → `UPDATE_MEDIA_STREAMS_IS_MUTED_STATE` |
| Volume (audio gain) | `Source volume`, `Audio Gain`, `audioGainLevel` on `MediaStreamStateIO` |
| Show / hide on air | `Show`, `Hide`, `Show everywhere`, `toggle participant source` |
| Audio-only | `Hide camera, keep audio`, `Audio-only is ON for {participantName} - everyone can hear them`, flag `audio-only-mode` |
| Camera blind | `Camera blind`, `isBlinded` (host's own webcam only, per the AI tool) |
| Solo / spotlight | `isSolo`, `isSpotlighted`, `Solo puts a participant as the sole active speaker` |
| Rename | `rename participant`, `Add name`, `EDIT_PARTICIPANT_NAME`, `EDIT_PARTICIPANT_TITLE` (title feature flag `participant-title`) |
| Avatar | `Edit avatar`, `Upload a profile picture`, `Crop your profile picture`, `Remove avatar`; **max 5 uploaded avatars** (`UPLOAD_LIMIT` when non-social avatars + uploading ≥ 5) |
| Remove / kick | `Remove source`, `Remove guest`, `canBeKicked`, message `KICK_CLIENT` |
| Promote | `Promote to co-host` |
| Replace | `Replace` (opens `replace_source_modal`) |
| Details | `Details`, `QualityIndicator` |
| Local recording per guest | `Stop local recording for $name`, `Resume local recording for $name`, `UpdateClientLocalRecordingDisabled` |
| Device control by host | `Host wants to change your camera to <bold>{deviceLabel}</bold>`, `UpdateMediaDeviceOffer` / `UpdateMediaDevice` (server capability `mediaDevicesControls`) |
| Ordering | `clientsOrder` on `RoomState`, `UPDATE_CLIENTS_ORDER`, `UpdateSourcesIdsOrderHostMessage` |

### 2.6 Guest permissions

| Permission | Wire / flag | Literal |
|---|---|---|
| Control all presentation slides | `shouldAllowGuestsControlAllPresentations` (default `false`), message `UpdateShouldAllowGuestsControlAllPresentations`, event `ShouldAllowGuestsControlAllPresentationsUpdated`, URL flag `show-setting-guest-control-all-presentations` | `Guest can control all presentations` / `Guests (even when backstage) can navigate all presentation slides.` |
| Add own channels (Pairs / re-broadcast) | `hasPairs` on `RoomState`, `UPDATE_HAS_PAIRS`, endpoints `/pairs/events/{id}/enable-pairs`, `/disable-pairs` | `Guest can add channels`, `Guests can add channels to this stream`, `Allow guests to re-broadcast`, `Guests can re-broadcast on their channels`, `Pairs are OFF. Your host disabled pairing channels for this stream.` |
| Add sources while guest | URL flag `scenes-guests-add-source` (`showScenesGuestsAddSourceButton`); guest-side `ScenesGuestSources` component | `The presentation source has been added and is waiting for the host to enable it.` |
| Screen share | implicit; gated only by `maxScreenShares` and host `shouldAutoAddScreenShare` | — |
| Enter without approval | always true for link guests [observed — no approval message type exists] | — |

### 2.7 Guest pre-join device test (`JoinScreen`)

Component tree `scripts/modules/JoinScreen/components/JoinScreen/…` with `ParticipantsList`,
`WebinarEventInfo`, `JumpingDots`. Flags `joinScreen`, `join-screen-v2`, `joinAccessingScreen`,
`participant-title-on-join-screen`. Literals:
`Check your camera and mic`, `Enter your display name`, `Display name`,
`Get started by allowing Studio to use your camera and mic.`, `Allow Mic/Webcam`,
`Allow camera access to join`, `Allow mic/cam access`,
`For the host to see and hear you, allow mic and cam permissions.`,
`Enter Studio Without Camera`, `Enter Studio Without Mic`,
`Studio needs a microphone to join on air. Connect one, then retry.`,
`Audio only — no camera found.`, `Audio only — camera is blocked. %sHow to fix%s`,
`Join`, `Join as Guest`, `Join as Viewer`, `Joining`, `waiting for the host to join`,
`the host is joining the room`, `Once more participants join, <br></br> they will appear here.`,
`Use the device and browser you used to join this stream.`,
`For best results, use an external camera and mic with the latest version of `,
`Can not join the room` / `Cannot join` / `Cannot join the room`, `Lost connection to the host`.

### 2.8 Guest branding

- `theme` URL param is propagated onto the invite link; themes include `air-theme`,
  `halloween-2023-theme`, `xmas-2023-theme`, `dark-theme-background-color`.
- `shouldHideVirtualEventsHeaderLogo` and `hiddenTabElement` params hide Restream chrome on the
  guest page; `appId` marks a white-labelled Virtual-Events embed.
- Guest headers: `GuestHeader`, `GuestVirtualEventHeader`, `HeaderScheduledTime`.
- `studioHasForcedRestreamWatermark` entitlement forces the Restream watermark on output.
- Brand-scoped assets everywhere via `brandId` (logo, overlay, background, fonts, browser sources).

### 2.9 Private talkback / backstage audio

- `Private Chat` (text) — hotkey **Shift+C**; `Open private chat`, `Read private chat`,
  `Privately talk with the host and other guests`; protocol `ADD_PRIVATE_CHAT_MESSAGE`,
  `PRIVATE_CHAT_MESSAGE_ADDED`, `StartPrivateChatTyping`, `PrivateChatTypingUpdated`;
  state `privateChatMessage[]` (`PrivateChatMessageIO {clientId, isHost, displayName, …}`);
  flag `private-chat-v2`; server capability `privateChatTyping`.
- **A dedicated private *audio* talkback channel was not found.** Backstage audio isolation is
  achieved by keeping the guest's producer off-air/muted (`Your mic is muted while you are
  backstage.`) rather than by a separate audio bus. **UNRESOLVED** whether a talkback bus exists
  server-side.

---

## 3. PRESENTATIONS

### 3.1 Supported formats [observed — `Index.312bd7238c465fa2.js`, module `2881`]

```js
PDF           = "application/pdf"
KEY           = "application/x-iwork-keynote-sffkey"
DOCX          = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
PPTX          = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
GOOGLE_DOCS   = "application/vnd.google-apps.document"
GOOGLE_SLIDES = "application/vnd.google-apps.presentation"
```

The file-input `accept` is `Object.values(PresentationMimeType).join(",")`.
Server-side `PresentationFormat` enum is numeric: `0=PDF, 1=KEY, 2=DOCX, 3=PPTX`.
UI copy: `Upload files (pdf, key, pptx, docx) or import slides from Google Drive.`,
`Bring presentations into Studio.`, `Show slides, PDFs, or other documents.`
No presentation file-size limit is enforced client-side [observed absence]; the only quota is
count (`You've exceeded the maximum number of presentations.` / `TooManyPresentationsError`).

### 3.2 Upload / import flow

1. Host: `hostBackendClient.initiatePresentationFileUpload(name, hash, size)` →
   `POST /presentations/upload`; guest variant
   `guestBackendPublicClient.initiatePresentationFileUpload(name, hash, size, guestToken)` →
   `POST /guests/presentations/upload`.
2. The file is hashed client-side with `window.crypto.subtle.digest` (hex-encoded) for
   duplicate detection → `PresentationAlreadyExistsError` / `This file is already uploaded.`
3. `updatePresentationFileProcessingStatus(id)` → `PUT /presentations/processing`
   (guest: `/guests/presentations/processing`).
4. Polling: `fetchPresentations()` on a `setTimeout` loop until status becomes `READY`.
5. Google Drive import: OAuth to `https://accounts.google.com/o/oauth2/auth` with scope
   `https://www.googleapis.com/auth/drive.file`, `response_type=code`, `access_type=offline`,
   `approval_prompt=force`, popup sized ≤ 800×800, redirect `/redirect/google.html`,
   action key `OAUTH_TOKEN_ACTION` → `POST /presentations/import/google`.
6. Delete: `DELETE /presentations/{id}`.

Error classes [observed]: `PresentationsServiceError`, `PresentationAddError`,
`PresentationAddWaitingForHostError`, `PresentationUploadError`, `PresentationDeleteError`,
`PresentationsFetchError`, `PresentationAlreadyExistsError`,
`InvalidPresentationFileMimeTypeError`, `TooManyPresentationsError`,
`TooManyPresentationsServerError`, `InvalidGoogleConfiguration`,
`FailedToFetchGoogleDriveMetadata`, `PresentationImportGoogleDriveError`.
Toast copy: `Uh oh, unable to upload presentation` / `File format is not supported.` /
`This file is already uploaded.` / `You've exceeded the maximum number of presentations.` /
`Please wait for the host to join the room, and you'll be able to add your slides shortly.`

### 3.3 Data model

`PresentationPayloadIO` = `{id, status, filename, urlTemplate, pagesNumber|null,
errorMessage|null, pagesSizes: {width,height}[], activePage?}`
`PresentationStatus` (numeric): `0 UPLOADING`, `1 PROCESSING`, `2 FAILED`, `3 READY`.
`PresentationKind`: `IMAGES` only — slides are rasterised to images server-side.
**Slide URL builder** [observed]: `urlTemplate.replace("%d", String(pageIndex + 1))`.
`PresentationStateIO` (sources deck) = `{type, presentationId, presentationKind,
presentationStatus, presentationFilename, activePage, pages, urlTemplate, clientId,
isOnAir, isSolo, isSpotlighted, width?, height?}`.

### 3.4 Picker UI (`PresentationCard` / `PresentationsContent`)

Thumbnail = slide 0 (`urlTemplate` with page 0), overlay CTA `Present`; the card menu has
`Present` and `Remove`; the counter uses plural forms `$slidesCount slide` / `$slidesCount slides`;
status labels `Uploading`, `Processing`, `Failed to upload`.
List header: `Presentations`, `Add presentation`, `No uploaded presentations yet`,
`Drop presentation here to upload` (drag-and-drop over `document.body`; analytics event
`Graphics Files Uploaded With Drag And Drop` with `{type:"Presentations", filesCount, fileTypes}`).

### 3.5 Slide navigation

`LayoutPresentationSlideControls` [observed — `114.15f34f2a5005b32d.js`]:

- Prev button `aria-label="Select previous slide"`, next button, and a native `<select>`
  (`aria-label="Select slide"`, disabled when `pages <= 1`) listing `1..pages`.
- Display is `activePage + 1` over `pages` — exactly the `3 / 12` form in the screenshots
  (CSS classes `slidesActivePage` / `slidesTotalPages`, `activePage` / `totalPages`).
- Analytics: `Presentation Previous Slide Clicked`, `Presentation Next Slide Clicked`,
  `Presentation Dropdown Clicked`, each with `{source:"preview", pages, kind:"IMAGES", uiSource}`.
- Keyboard: `NEXT_SLIDE_RIGHT_ARROW`, `PREVIOUS_SLIDE_LEFT_ARROW`.
- Other labels: `Next presentation slide`, `Previous presentation slide`.
- Wire: `UPDATE_PRESENTATION_PAGE` (`UpdatePresentationPageMessageIO`),
  `UPDATE_PRESENTATION_STATUS`, `ADD_PRESENTATION`, `REMOVE_PRESENTATION`;
  scene-scoped update `ClientSceneMediaPresentationUpdateIO {id, type, state:{type, page}}`
  (server capability `scenePresentationPage`).
- Guest control gate: `shouldAllowGuestsControlAllPresentations` (§2.6).

---

## 4. MEDIA PLAYBACK

### 4.1 Video clip / video-from-storage controls

| Control | Field / message | Literal |
|---|---|---|
| Play | `PLAY_HLS_VIDEO`, `PLAY_IN_PROGRESS_HLS_VIDEO`, `PLAY_VIDEO` | `Play` |
| Pause | `PauseHlsVideoV2MessageIO` | `Pause` |
| Resume | `ResumeHlsVideoV2MessageIO` | — |
| Stop | `StopHlsVideoV2MessageIO`, `STOP_VIDEO` | `Stop` |
| Seek | `SeekHlsVideoV2MessageIO`; model methods `seek`, `seekByPercent` | `Seek`, `Can't seek video from storage…` |
| Loop | `UpdateHlsVideoLoopMessageIO`, `isLooped` | `Loop`, `Loop video`, `Loop track`, `Enable/Disable track loop` |
| Autoplay | `shouldAutoplay` on the scene-media resource | — |
| Mute | `isMuted` on the scene-media resource | `Your mic is muted during video clip` |
| Volume | `SET_AUDIO_VOLUME`, `SetAudioVolume`, `audioGainLevel` | `Source volume`, `Music volume` |
| Position | `position` (seconds) persisted on `SceneMediaResourceVideoStorageIO` | — |
| Preload | `PreloadSceneMedia` (capability `sceneMediaPreload`), flag `scenes-videos-to-preload` | — |

Playback status enums: `VideoPlayerStatusIO`, `VideoPlayerKindIO`, `VideoPlayerStoppedStatusIO`,
`SceneAutoplayStatusIO` (`Idle`, `Playing`, `Ended`).
The player is `hls.js` (`hlsjs.3e5d0a83ecd57757.js`, 400 KB) fed from `playlistUrl` /
`lqPlaylistUrl`; the `<video>` element is `captureStream()` / `mozCaptureStream()`-ed into a
producer, with a canvas fallback (`drawVideoToCanvas`) [observed].

### 4.2 "Switch to next scene when finished"

- Scene field `shouldAutoswitchToNextScene` (default `false`) on all three scene payloads.
- Message `UPDATE_SHOULD_AUTOSWITCH_TO_NEXT_SCENE`; AI tool `toggle_auto_switch`
  ("Works on any Countdown scene, or on Media scenes that have video attached").
- Flags: `scenes-countdown-auto-switch`, `scenes-video-auto-switch`, `scenes-auto-switch-v2`
  (+ onboarding / promo / noise-toast variants); server capability `scenesAutoSwitchV2`.
- Literals: `Auto-switch to next scene`, `Set scenes to auto-switch`,
  `When a <bold>video</bold> or <bold>countdown</bold> ends, the scene switches to the next one.`,
  `Perfect for stream sections that play on their own — no clicks needed.`,
  `Switching to the next scene in {{countdown}} sec. <action1>Cancel<action1>`,
  `To use auto-switch, add a video from storage or set up a countdown scene`,
  `Auto-switch scene was enabled, so video loop is off`,
  `Video looping was enabled, so auto-switch scene is off` (loop and auto-switch are mutually
  exclusive [observed]),
  `Source hidden. <disableSceneAutoSwitchButton>Disable auto-switch</disableSceneAutoSwitchButton> to show it.`
- Toast components: `CountdownAutoSwitchToast`, `VideoAutoSwitchToast`, `VideoSceneAutoSwitchToast`,
  `VideoClipPlayingToast`.
- Server flag `shouldRewindHlsVideoToStartOnEnd` in `PublicRoomFeaturesIO`.

### 4.3 Video clips (stingers / graphics tab)

- Info line [observed]: `Upload and play videos: MP4, MOV, GIF, TS, or WebM` +
  `Max file size: {{fileSize}}.` where fileSize = `user.features.studioMaxVideoClipSizeBytes`
  formatted from bytes.
- Count cap: `brand.remainedVideoClipLimit` / `user.features.studioMaxVideoClips`;
  errors `You've exceeded the maximum number of video clips`,
  `That file is too large. The size limit for video clips is {{fileSize}}.`,
  `You cannot upload stingers longer than 60 minutes` (**60 min duration cap** [observed]).
- Overlay-over-clip toggle: `shouldShowOverlayOverVideoClip` /
  `Display captions, messages, logos, and overlays while video clip is playing`.

### 4.4 Image display duration

No per-image display duration exists — an image source stays on air until toggled off
[observed absence of any duration field on `SceneMediaResourceImageIO` / `ImageSourceStateIO`].

### 4.5 Storage location

Uploads go to `https://studio-backend-upload.restream.io` and
`https://video-storage.restream.io`; the app bundles the **AWS SDK**
(`awssdk.06c9eae97cc86f8d.js`, 3.3 MB) for direct multipart S3 uploads with pre-signed URLs
[inferred from bundle presence + the `get-next-part-upload-url` endpoints].
UI: `You'll find all recordings in your <linkButton>Video Storage</linkButton>.`

---

## 5. RECORDING

### 5.1 Cloud recording (server-side, of the composited program)

| Item | Evidence |
|---|---|
| State | `RoomState.liveStreamRecording = {status, recorderStatus}` |
| `LiveStreamRecordingStatus` | `Starting`, `Restarting`, `Resuming`, `Recording`, `Pausing`, `Paused`, `Stopped` |
| `LiveStreamRecorderStatus` | `Recording`, `Paused`, `Stopped` |
| Commands | `PauseLiveStreamRecording`, `ResumeLiveStreamRecording`, `RestartLiveStreamRecording`, `UpdateRecordingName`, `UpdateRecordMode` |
| Record-only mode | `RoomState.recordMode = {name, isEnabled}`; `OutgoingStreamMode.RecordOnly`; literals `Record Only`, `Record only mode`, `Turn recording into a live stream`, `Upgrade to unlock Record Only mode` |
| Quotas | `recordingHoursPerStream`, `recordingStoringDays`; copy `Max $cloudRecordingTimeHrs hours will be recorded.`, `All your streams are auto-recorded to the cloud. Up to $hours hr/stream.`, `Free plan has a 15-minute total recording limit.`, `Record up to 15 min for free`, `You’ve reached the 15-min limit`, flag `record-only-trial-minutes` |
| Naming | `Name this recording take`, `Edit recording name`, `Enter a recording name to continue.` (capability `recordingName`) |
| Restart | `Are you sure you want to start a new recording? The video you just created won’t be saved.` |
| Server caps | `liveStreamRecordingPauseResume`, `liveStreamRecordingPauseResumeV2`, `liveStreamRecordingRestart` |
| Download | `Download Recordings`, `Download recording options`, `Recordings`, `Cloud Recordings`, `Save stream recording`; `RECORDINGS_URL=https://streaming-recordings.restream.io`, token `POST /v2/api/recordings/token`, flag `mp4-urls-download` (`recordingsMp4UrlsDownload`) |

### 5.2 Local recording (per-participant isolated tracks)

| Item | Evidence |
|---|---|
| State | `RoomState.localRecording = {isEnabled, maxRecordHours, mode, resolution, disabledClientIds[]}`; the client view adds `isDisabled` |
| `LocalRecordingKindIO` | `AudioOnly`, `VideoOnly`, `AudioVideo` (default `AudioVideo`) — UI labels `Video & Audio`, `Audio only` |
| `LocalRecordingResolutionIO` | `auto` (UI label `1080p`), `4k` (UI label `4K`); default `auto` |
| Messages | `REGISTER_LOCAL_RECORDING`, `UPDATE_SHOULD_ENABLE_LOCAL_RECORDING`, `UpdateLocalRecordingMode`, `UpdateLocalRecordingResolution`, `UpdateClientLocalRecordingDisabled`, `LocalRecordingMaxRecordHoursUpdated`, `LocalRecordingDisabledClientsUpdated` |
| Container ladder | default `video/x-matroska;codecs=avc1.4D402A,opus` → `…avc1,opus` → mp4 avc1 → `video/webm;codecs=vp8,opus` → `vp9,opus` → `video/webm` → `video/mp4`. Flag `prefer-mp4-local-recording` promotes mp4-avc1; `prefer-mp4-avc3-local-recording` promotes mp4-avc3. Container label derived as `"mp4-avc3"` / `"mp4"` / `"webm"` |
| Chunking | part size `5242880` bytes (5 MB); endpoints `/guests/local-recordings/get-next-part-upload-url`, `/guests/local-recordings/complete`, `/guests/local-recordings/abort`, `/local-recordings/{id}`, `/local-recordings/by-suid/{suid}` |
| Stop reasons | `ADD_SHOT_ERROR`, `ADD_SHOT_PART_ERROR`, `AUDIO_OR_VIDEO_CHANGE`, `RECORDER_STOP_EVENT`, `STARTING_NEW_MEDIA_STREAM`, `RECORDING_DESTROYED`, `REMOVED`, `MAX_RECORD_DURATION_EXCEEDED`, `PAUSED`, `SOURCE_OFF_AIR` |
| Resume reasons | `INITIAL`, `RECORDING_RESUMED`, `SOURCE_ON_AIR` |
| Ids | `LocalRecordingIdIO`, `LocalRecordingShotIdIO`, `LocalRecordingUploadIdIO` |
| Upload page | `scripts/entries/UploadLocalRecordings/UploadPage`; `Upload your recordings`, `Uploading your recordings... Please don't close this tab.`, `Your recordings have been uploaded.`, `No recording files found on this device.`, `All recorded tracks will be uploaded and accessible only to the Host. Works on desktop, Google Chrome.` |
| Copy | `Local recordings are isolated individual tracks of each participant, ideal for post-production.`, `Record each participant locally`, `Record participants in up to 4K`, `Record 4K sources in full resolution`, `Participants need powerful devices to avoid performance issues. Only UHD cameras or screens will be recorded in 4K.`, `Local recording may slightly lower your stream quality. `, `Your camera and audio are recorded locally. Please stay after the stream until uploads finish.` |
| Gates | entitlement `hasLocalRecordings`; capabilities `localRecordingsV2`, `localRecordingDisablePerClient`, `localRecording4k`, `hasPerTrackAudioRecording`; flags `per-track-video-recordings`, `persisted-local-recording-settings` |

### 5.3 Live clipping / AI Clips

| Item | Evidence |
|---|---|
| State | `RoomState.liveClipping = {projectId, isEnabled, status, clipsCount}` |
| `LiveClippingStatus` | `Idle` (default), `Generating`, `Failed` observed — **UNRESOLVED** whether a `Ready` member exists |
| Messages | `UpdateLiveClippingEnabled`, `LiveClippingEnabledUpdated`, `LiveClippingStatusUpdated` |
| Components | `LiveClippingBadge`, `LiveClippingToggleRow` |
| Literals | `Live Clipping`, `Toggle live clipping`, `Get clips while you're still live to share in the moment.`, `Generate clips`, `Generating clips`, `Get Clips`, `$count new clips ready`, `1 new clip ready`, `No clips`, `Clips add-on subscription updated`, `Your Clips free trial has started` |
| Backend | `CLIPS_BACKEND_HOST=https://clips-backend.restream.io`; `PUT /events/{id}/live-clips`; `clipsService.getClipsProjectUrl(projectId, …)`; help article `…/11794605-customize-the-settings-for-your-clips` |
| Gates | flag `live-clipping`, capability `liveClipping`, entitlement `aIShortsAvailable` |

> **UNRESOLVED — "Create highlight marker".** The exact string `highlight marker` does not appear
> anywhere in the capture (all JS bundles, CSS, recovered SCSS, inline SVG and referenced-static
> were searched). The only `marker*` identifiers belong to the **video editor** timeline
> (`restreamvideoeditor.d22611927fb1ae5c.js`: `marker`, `markerIn`, `markerOut`, `markerNote`,
> `markerQuote`, `markerTooltip`, `markersLayer`, `fixedMarkersLayer`, `markerHint`,
> `markerClickBehavior`). The feature seen in screenshot 22 is therefore either (a) newer than this
> capture, or (b) rendered by the Clips / video-editor surface rather than the Studio bundle.

### 5.4 PCAP capture (internal / staff)

`PlayPcapRecordingMessageIO`, `StopPcapRecordingMessageIO`, flags `record-pcap`, `pcap-player`
[observed] — raw RTP capture for debugging, not a user feature.

---

## 6. STAGE / CANVAS

### 6.1 Outgoing stream profile (the program canvas)

- `OutgoingStreamProfileIdIO` is a branded string matching
  **`/^(\d+)x(\d+)@(\d+)fps\+(\w+)$/`** → parsed to `{id, width, height, framerate, meta}`
  (builder `${w}x${h}@${fps}fps+${meta}`) [observed].
- The available list comes from `user.features.studioOutgoingStreamVideoPresets[]` /
  `SfuTokenPayload.videoPresets[]`, each `VideoPresetIO = {name, bitrate, width, height,
  framerate, cost}` where `name` matches `/^(\d+)p@(\d+)$/` **or** `/^(\d+)x(\d+)p@(\d+)$/`.
- `resolutionOptions` getter [observed]: maps profiles to `{id, name: shortName, initialHeight}`,
  **appends a synthetic `1080p @ 30fps` entry when no profile ≥ FullHd exists** (to drive the
  upgrade prompt), then sorts descending by height.
- Display formatter regex: `/^(\d+)(p)(?:\s*(@)\s*(\d+)(fps))?$/i` → renders e.g. `1080p`,
  `720p @ 60fps` — matching the 1080p / 720p60 chips in the screenshots.
- Messages: `UPDATE_OUTGOING_STREAM_PROFILE` → `OUTGOING_STREAM_PROFILE_UPDATED`.
  URL default: `default-outgoing-stream-profile`; staff flag `ultraHd4kOutgoingStreamVideoPreset`.
- Literals: `Live stream quality`, `Change quality`, `Change quality to {resolution}p`,
  `Switch to 720p`, `Upgrade to unlock 1080p`, `Upgrade to unlock this resolution`,
  `Quality selection disabled while live`, `You can’t go live with the selected stream quality`,
  `Some platforms might downgrade stream quality to HD`,
  `Some platforms might not support streaming at 60 fps`,
  `Exceeded the maximum %maxFPS FPS for %resolution.`, `Exceeded the maximum %maxRes resolution.`,
  `Stream and record in Full HD`, `Want Full HD quality?`.
  Analytics `Live Stream Quality Selected {oldQuality, newQuality, source: Header|Settings|PreviewStatusScreen}`.

### 6.2 Orientation / aspect ratio

| Enum | Values |
|---|---|
| `OutgoingStreamOrientation` | `LANDSCAPE`, `PORTRAIT` |
| `DestinationsOutgoingStreamOrientation` | `Landscape`, `Portrait`, `Dual`, `Undetermined` (default `Undetermined`) |
| `NoDestinationsPreferredOutgoingStreamOrientation` | `Landscape`, `Portrait`, `Dual` |
| `OutgoingStreamMode` | `StandaloneLiveStream` (default), `DualLiveStream`, `RecordOnly` |
| `UpdateOutgoingStreamModeMessageOption` | `StandaloneLiveStream`, `LandscapeStandaloneLiveStream`, `PortraitStandaloneLiveStream`, `DualLiveStream`, `RecordOnly` |
| `ImageVariantOrientation` | `Landscape`, `Portrait` |

`RoomState` carries **two independent layouts**: `videoLayout` and `portraitVideoLayout`, plus
`overlay` and `portraitOverlay` (with `shouldHidePortraitOverlay`). Messages
`UPDATE_OUTGOING_STREAM_ORIENTATION`, `PortraitVideoLayoutUpdated`, `PortraitOverlayStateUpdated`,
`DestinationsOutgoingStreamOrientationUpdated`, `ShouldHidePortraitOverlayUpdated`.
Literals: `Landscape`, `Portrait`, `Landscape + Portrait`, `Landscape only`,
`Go live in portrait and landscape format at once`, `Switch to Portrait`,
`Choose Portrait Mode<br> for the best viewer's experience`,
`Show/Hide portrait preview`, `Show/Hide landscape preview`, `Hide portrait overlay`,
`Layout customization available only in <button>Landscape</button>`,
`Portrait Customization Coming Soon`, `Recommended size: 1920x1080px.`
Dual-output gate: `studioDualOutputAvailable` + flag `dual-output-live-stream`.

### 6.3 Compositor / canvas plumbing

- `ServerCreateLiveStreamOptionsIO` carries `videoPreset`, `audioSettings {bitrate, samplingRate}`,
  `videoResizingFilter` (`Nearest`, `Linear`, `Cubic`, `Sinc`, `Lanczos`),
  `shouldUseConstantBitrate`, `shouldPreferVah264encCodec`, `pipelinesBehavior`
  (`Legacy` | `TransferLiveSourcesLatency`), plus CEF/web-overlay resource caps
  (`compositorWebThrottlingMaxCpuInMillicpu`, `…MaxMemoryInMib`,
  `compositorWebMaxJsheapSemiSpaceInMib`, `compositorWebMaxJsheapOldSpaceInMib`,
  `compositorWebEnableSandbox`).
- `AudioBitrate`: `128kbps` (128000), `160kbps` (160000), `192kbps` (192000), `256kbps` (256000).
  `SamplingRate`: `44100hz`, `48000hz`. UI: `High-resolution audio` —
  `Increases capture and output audio bitrate to 256kbps…`.
- Layout element geometry (`ElementLayoutV2IO`, `LayoutV2TransitionIO`) uses normalised
  `p1` / `p2` corner tuples plus keyframes → the canvas coordinate space is **0..1 normalised**,
  not pixels [observed].
- Layout families with per-scene options: `Contain`, `Cover`, `HalfScreen`, `Pip`, `Spotlight`,
  `Thumbnails`, `Showtime`, `Tbpn`, `Cinema` — each with `Global` / `Main` / `Aside` / `Single` /
  `Secondary` option groups and `Temp` (uncommitted) variants.
- `shouldShowOuterLayoutShadow`, flag `compositor-border-radius`.
- **No explicit "safe area" concept exists** — no `safeArea` / `titleSafe` literal anywhere
  [observed absence]. The closest are the layout `Contain` / `Cover` fit modes
  (`ElementLayoutV2FitIO`) and edge-position controls (`EdgePositionControl`).

### 6.4 Room / stream duration limits

`RoomShutdownWarningType`: `None`, `RoomShutdown`, `RoomCooldownShutdown`, `LiveStreamShutdown`,
each carrying `{timeLeftMs, maxDurationMs}`. Overrides via
`override-room-session-limit-min`, `override-live-stream-limit-min`,
`override-room-cooldown-limit-min`, `override-shutdown-warning-offset-min`.
Literals: `Your room session reached the maximum duration and ended. Start a new session to continue.`,
`Your stream reached the maximum duration and ended. You can start a new stream right away.`,
`Stream time limit reached`. Inactivity suspend timer: 30 min (`18e5` ms);
background-music suspend timer: 10 min (`6e5` ms) [observed].

---

## 7. Cross-cutting: the Room-Manager protocol surface

89 distinct outbound message types are sent by `RoomConnectionStore` alone; 340+ literal message
types exist in the io-ts protocol union. The source / guest / media-relevant subset:

**Sources & media** — `AssignSource`, `UnassignSource`, `UnassignCamera`, `REMOVE_SOURCE`,
`SWAP_SOURCES`, `UPDATE_SOURCE_STATE`, `SOURCES_STATE_UPDATED`, `AddMediaPlaceholder`,
`RemoveMediaPlaceholder`, `AddCameraPlaceholder`, `RemoveCameraPlaceholder`, `SwapSceneMedia`,
`PreloadSceneMedia`, `UpdateSceneAssignedCamera`, `UpdateSceneAssignedSource`,
`UpdateCameraSceneAssignmentMode`, `UpdateSourceSceneAssignmentMode`,
`UPDATE_MEDIA_STREAMS_ON_AIR_STATE`, `UPDATE_MEDIA_STREAMS_IS_MUTED_STATE`,
`UPDATE_SHOULD_USE_CAMERA_PLACEHOLDERS`, `UpdateShouldEnableScenesLocalCameras`,
`UpdateShouldAllowMultipleMedia`, `UpdateShouldUseLocalVideoAutoSpotlighting`,
`ADD_IMAGE` / `REMOVE_IMAGE`, `AddSourceImage(s)` / `RemoveSourceImage`,
`HLS_VIDEO_ADDED / _UPDATED / _REMOVED`, `VIDEO_STORAGE_FILE_DELETED`.

**Guests** — `GUEST_CONNECTED` / `GUEST_UPDATED` / `GUEST_DISCONNECTED`, `KICK_CLIENT`,
`PromoteToHost`, `PromotionToHostOffer`, `UPDATE_CLIENTS_ORDER`, `CLIENTS_ORDER_UPDATED`,
`ClientMediaDevicesUpdated`, `UpdateMediaDevice(s)`, `UpdateMediaDeviceOffer`,
`DELETE_CLIENT_MEDIA_STREAMS_STATE`, `UPDATE_SHOULD_SHOW_PARTICIPANTS_NAMES`,
`UpdateSceneShouldShowParticipantNames`, `UpdateSceneShouldShowParticipantScreenShareNames`,
`UpdateGuestIsViewer`.

**Recording** — `REGISTER_LOCAL_RECORDING`, `UPDATE_SHOULD_ENABLE_LOCAL_RECORDING`,
`UpdateLocalRecordingMode`, `UpdateLocalRecordingResolution`, `UpdateClientLocalRecordingDisabled`,
`PauseLiveStreamRecording`, `ResumeLiveStreamRecording`, `RestartLiveStreamRecording`,
`UpdateRecordMode`, `UpdateRecordingName`, `LiveStreamRecordingStatusUpdated`,
`UpdateLiveClippingEnabled`.

**Presentations** — `ADD_PRESENTATION`, `REMOVE_PRESENTATION`, `UPDATE_PRESENTATION_PAGE`,
`UPDATE_PRESENTATION_STATUS`, `UpdateShouldAllowGuestsControlAllPresentations`.

**Scene edit mode** (multi-producer collaboration) — `StartEditingScene`, `StopEditingScene`,
`SceneEditorsUpdated`, `RoomState.sceneEditors: Record<SceneId, {clientId}[]>`
(capability `sceneEditingPresence`, flag `scene-editing-presence`).

---

## 8. AI tool registry — the machine-readable feature contract

`131.8f878df5d7c38b5a.js` ships **88 named AI tools** with human-readable descriptions and Zod
schemas. Those touching this domain (all names + descriptions are exact literals):

| Tool | Notes |
|---|---|
| `create_scene`, `create_scenes_batch` (max 20), `delete_scene`, `rename_scene`, `reorder_scenes`, `select_scene`, `get_scenes` | scene lifecycle; `create_scene` accepts `type`, `name`, `layoutType`, `orderId`, `captionId`, `tickerId`, `qrCodeId`, `overlayId`, `backgroundId`, `logoId`, `logoPosition`, `shouldShowParticipantNames`, `shouldAutoswitchToNextScene` |
| `add_camera_placeholder`, `remove_camera_placeholder`, `add_media_placeholder`, `remove_media_placeholder` | "Does not work on Countdown scenes." |
| `add_source_image` | fetch image from URL, upload, assign to scene |
| `create_browser_source`, `edit_browser_source`, `delete_browser_source`, `get_browser_sources`, `add_scene_browser_source`, `update_scene_browser_source`, `remove_scene_browser_source`, `generate_widget` | browser-source CRUD; **max 5 visible per scene** |
| `toggle_participant_source`, `set_participant_muted`, `set_participant_volume`, `set_participant_audio_only`, `set_participant_camera_blinded`, `set_participant_name` | per-guest control; keyed by `stateKey` |
| `toggle_participant_names_visibility`, `toggle_screen_share_participant_names_visibility` | per-scene name tags |
| `toggle_auto_switch` | see §4.2 |
| `toggle_cloud_recording`, `toggle_local_recording`, `update_local_recording_settings`, `toggle_live_clipping` | recording control; `update_local_recording_settings` documents `mode ∈ {AudioVideo, AudioOnly, VideoOnly}` and `resolution ∈ {auto, 4k}` |
| `get_streaming_profiles`, `set_streaming_profile` | resolution/framerate options |
| `set_scene_background`, `set_scene_logo`, `set_scene_logo_position`, `set_scene_overlay`, `set_scene_caption`, `set_scene_ticker`, `set_scene_qr_code`, `set_scene_layout_type`, `reset_scene_layout_options`, `get_scene_chat_overlay` | scene decoration |
| `set_countdown_duration/font/color/position/scale/music/music_volume`, `get_countdown_music` | countdown |
| `play_audio_background`, `stop_audio_background`, `set_music_volume`, `get_custom_music`, `upload_custom_music`, `delete_custom_music` | music bed |
| `upload_background`, `upload_logo`, `upload_overlay`, `delete_background`, `delete_logo`, `delete_overlay`, `get_backgrounds` | asset upload from URL (10 MB fetch cap) |
| `get_scene_note(s)`, `update_scene_note`, `get_event_details`, `update_event_details` | metadata |

The AI participant state snapshot exposes exactly:
`{you:{name,title,sources[]}, others:[{id,name,title,isGuest,sources[]}],
participantsCount, maxParticipants}` where each source is
`{stateKey, type, kind, isOnAir, isMuted, isAudioOnly, isBlinded, isSelfMuted}`.

## 9. Hotkeys relevant to this domain [observed — `Index.312bd7238c465fa2.js`]

| Action | Key |
|---|---|
| `ADD_SOURCE` | `A` |
| `LOCAL_VIDEO` | `O` |
| `RTMP_SOURCE` | `R` |
| `PRESENTATIONS` | `P` |
| `VIDEO_STORAGE` | `D` |
| `IMAGE` | `G` |
| `EXTRA_CAMERA` | `E` |
| `SCREEN_SHARE` | `H` |
| `INVITE_GUESTS` | `I` |
| `MICROPHONE` / `CAMERA` | `M` / `V` |
| `SETTINGS` | `S` |
| `NEW_SCENE` | `N` |
| `FULLSCREEN` | `F` |
| `SHOW_ALL_SOURCES` / `HIDE_ALL_SOURCES` | `Shift+S` / `Shift+H` |
| `UNMUTE_ALL_SOURCES` / `MUTE_ALL_SOURCES` | `Shift+U` / `Shift+Y` |
| `TOGGLE_PARTICIPANTS_NAMES` | `Shift+N` |
| `PRIVATE_CHAT` | `Shift+C` |
| `GO_LIVE_OR_END` / `GUEST_JOIN_OR_LEAVE` / `RECORD_ONLY` | `Ctrl+G` |
| `RESTART_RECORDING` | `Ctrl+Shift+G` |
| `PAUSE_RESUME_RECORDING` | `Ctrl+Shift+P` |
| `SIDEBAR` | `Ctrl+.` |
| Layouts 1–7 | `Shift+1` … `Shift+7` |
| Slides / scenes | `→` / `←` next/prev slide; `↓` / `↑` next/prev scene; `Space` capture |

## 10. UNRESOLVED / gaps

| Item | What is known | Why unresolved |
|---|---|---|
| "Create highlight marker" (screenshot 22) | Not present as a literal anywhere on disk; the video-editor bundle has timeline `marker*` CSS classes | Feature likely newer than the capture, or lives in the Clips / editor surface |
| `LiveClippingStatus` full member list | `Idle` (default), `Generating`, `Failed` seen; the enum head was truncated in the sampled byte window | Needs a wider dump around `externals…js` offset ≈ 3 738 500 (`extB.js` ≈ 248 700) |
| Private *audio* talkback bus | Only text `Private Chat` found; backstage mic is simply muted | No audio-bus message type observed |
| `InviteMessageTemplate` contents | Symbol name only | Body not located in sampled ranges |
| Presentation file-size limit | Only a count quota observed | No client-side byte check exists; the server may impose one |
| Video Storage numeric caps | Field names known (`maxVideoSizeAvailable`, `maxVideoDurationAvailable`, `maxVideoUploadsAvailable`) | Values are per-plan and arrive from the API, not baked into the bundle |
| Browser-source custom CSS/JS | Definitively **absent** from `BrowserSourceStateElementIO` | (Answered — listed for completeness) |
| Guest "invite by email" | Absent for Studio guests; exists only for webinar viewers / org seats | (Answered) |
| Canvas "safe areas" | No literal anywhere | Feature appears not to exist |
