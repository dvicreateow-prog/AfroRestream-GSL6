# TOOLS-09 — Shortcuts, Settings & Persistence

Source of truth: `01-inside-studio-verified/client-static/js/Index.312bd7238c465fa2.js` (hotkey registry,
webpack module `20809`) and `studio/spec/refresh-2026-08-25/chunks/575.971ebd8632e40587.js`
(Settings modal, Shortcuts tab, all settings forms). Everything below is `[observed]` in those bundles
unless marked `[inferred]`.

---

## 1. Hotkey engine

### 1.1 Registry — module `20809` [observed]

| export | meaning |
|---|---|
| `YP` | `HotkeyId` string enum (48 members) |
| `wx` | `HOTKEYS` record — `{ id, key, code, withCtrl?, withMeta?, withShift?, asString?, ignoreOnAnotherHotkey? }` |
| `hz(shortcut, isMacOS)` | display string: `[withCtrl ? (isMacOS ? "COMMAND" : "CTRL") : ø, withMeta ? "COMMAND" : ø, withShift ? "SHIFT" : ø, key].join("+")` |
| `Vk` | `Map<asString, shortcut>` — reverse lookup for the ~20 entries that declare `asString` |

### 1.2 `useHotkey` hook — module `1472`, export `E` [observed]

Signature `useHotkey(shortcut, handler, onAnotherHotkey = noop, isEnabled = true)`.

- Listener attached to `document.body` `keydown` (not `window`), removed on unmount / when `isEnabled` is false.
- **Ignored** when `event.target` is `HTMLInputElement`, `HTMLTextAreaElement`, `HTMLSelectElement`, or any
  `HTMLElement` with `isContentEditable`.
- Event side builds `[ (ctrlKey||metaKey) ? "ctrl" : ø, shiftKey ? "shift" : ø, code.toLowerCase() ].join("+")`.
  Registry side builds `[ withCtrl ? "ctrl" : ø, withMeta ? "command" : ø, withShift ? "shift" : ø, code.toLowerCase() ]`.
  **Consequence: `Ctrl` and `Cmd` are interchangeable at runtime**; a registry entry that sets `withMeta`
  can never match (the event side never emits `"command"`), so the `*MacOs` duplicates are **display-only**.
- On match: `preventDefault()` → `handler()` → analytics `"Hotkey Pressed"` `{ name: id, props: shortcut }`.
- Conflict suppression: every registry entry with `ignoreOnAnotherHotkey` is pre-hashed into a Set; if the
  pressed combo is in that Set but is *not* this hook's shortcut, `onAnotherHotkey(id)` fires instead.
- Separate hold-state hook in `357.fab32c9d675a47b1.js` (Go Live button): `window` `keydown`/`keyup`/`blur`,
  matches `event.code === shortcut.code` plus `ctrlKey||metaKey` / `shiftKey`, ignores `event.repeat`,
  releases on `key === "Meta" | "Control"`. Used with `GO_LIVE_OR_END` / `RECORD_ONLY`.

### 1.3 `ShortcutRow` / `Kbd` rendering [observed]

`ShortcutRow` (`ShortcutRow_root__drPBn` / `_buttons__` / `_shortcutButton__`) sets
`aria-keyshortcuts={hz(shortcut, isMacOS)}` and renders one `<span>` per token in order
`command?, ctrl?, shift?, key`. Token substitution: `Delete`/`Backspace` → `⌫`, `command` → `⌘`,
`ctrl` → `⌘` on macOS else `CTRL`.

---

## 2. Shortcut table — Settings ▸ Shortcuts tab

Rendered by `Shortcuts` (`Shortcuts_section__QCmNI` / `_heading__5LZqd` / `_shortcutRow__Fow1a`).
Every row is additionally gated by `checkShouldEnableHotkey(id)` (module `98920`, export `v`, args:
`isScenesMode, isPlaylistsMode, shouldShowAddSourceShortcuts, shouldShowLocalVideoShortcut, shouldShowImageShortcut`).
`Ctrl` below = `Ctrl` on Windows/Linux, `⌘` on macOS (same handler).

| action | keys | scope / condition |
|---|---|---|
| **General** — hidden when `isPlaylistsMode`, needs `shouldShowGeneralSectionShortcuts` |||
| Go live or end stream | `Ctrl` + `G` | `goLiveShortcutType === "live"` |
| Join or leave | `Ctrl` + `G` | `goLiveShortcutType === "join"` + `shouldShowJoinOrLeaveShortcut` |
| Start or end recording | `Ctrl` + `G` | `goLiveShortcutType === "recording"` (fallback) |
| Restart recording | `Ctrl` + `Shift` + `G` | recording mode |
| Pause/Resume recording | `Ctrl` + `Shift` + `P` | recording mode |
| **Controls** (always rendered) |||
| Microphone | `M` | `shouldShowMicrophoneShortcut` |
| Camera | `V` | `shouldShowCameraShortcut` |
| Settings | `S` | always |
| Sidebar | `Ctrl` + `.` (`code:"period"`) | `shouldShowSidebarShortcut` |
| Add source | `A` | `shouldShowAddSourceShortcuts` \|\| guest |
| Add local video | `O` | `shouldShowLocalVideoShortcut` |
| Add RTMP source | `R` | `shouldShowRtmpSourceShortcut` |
| Add presentation | `P` | add-source or guest |
| Add screen sharing | `H` | add-source or guest |
| Add extra camera | `E` | add-source or guest |
| Add image | `G` | `shouldShowImageShortcut` |
| Add video from Video Storage | `D` | `shouldShowVideoStorageShortcut` |
| Previous presentation slide | `←` | `shouldShowPresentationControlsShortcuts` |
| Next presentation slide | `→` | `shouldShowPresentationControlsShortcuts` |
| **Scenes** — needs `shouldShowScenesShortcuts` |||
| Add new scene | `N` | |
| Next scene *(“Next video” in playlists mode)* | `↓` | |
| Previous scene *(“Previous video”)* | `↑` | |
| Copy scene | `Ctrl` + `C` | mac row uses `CopyMacOs` (⌘ label) |
| Paste scene | `Ctrl` + `V` | mac row uses `PasteMacOs` |
| Duplicate scene | `Ctrl` + `D` | mac row uses `DuplicateMacOs` |
| Delete scene | `Delete` (⌫) | `Backspace` shares the same `id:"Delete"` |
| Undo copy, paste, duplicate, delete | `Ctrl` + `Z` | mac row uses `UndoMacOs` |
| **Sources** — `shouldShowSourcesShortcuts && !isPlaylistsMode` |||
| Show all sources on the layout | `Shift` + `S` | |
| Hide all sources from the layout | `Shift` + `H` | |
| Mute all sources | `Shift` + `Y` | |
| Unmute all sources | `Shift` + `U` | |
| Toggle participants names | `Shift` + `N` | |
| **Layout** — `shouldShowLayoutsShortcuts && !isPlaylistsMode` |||
| First Layout / *Contain* | `Shift` + `1` | label switches on `shouldShowScenesLayoutsShortcuts` |
| Second Layout / *Cover* | `Shift` + `2` | |
| Third Layout / *Half Screen* | `Shift` + `3` | |
| Fourth Layout / *Picture in Picture* | `Shift` + `4` | |
| Fifth Layout / *Cinema* | `Shift` + `5` | |
| Sixth Layout / *Thumbnails* | `Shift` + `6` | |
| Seventh Layout | `Shift` + `7` | `shouldShowSeventhLayoutShortcut` |
| **Other** (always rendered) |||
| Open invite guests popover | `I` | `shouldShowInviteGuestsShortcut` |
| Open private chat | `Shift` + `C` | `shouldShowPrivateChatShortcut` |
| Fullscreen | `F` | always |

**Registry entries with no row in the Shortcuts tab** [observed]: `EVENT_CAPTURING_SPACE` (`Space`,
`ignoreOnAnotherHotkey`) — used by countdown / event capture; and the `*MacOs` duplicates (display-only,
see §1.2).

**Layout hotkey ↔ layout mapping**: `HostPageViewStore.layoutTypeToHotkeyMap` builds
`layoutPositionMap` (1-based position) → `CHANGE_LAYOUT_TO_*[position-1]`; `getHotkeyByLayoutType(type)`
returns the registry entry, which is passed to the layout buttons as the `hotkey` prop for tooltips.

**Anomaly (worth replicating or fixing)** [observed]: `CHANGE_LAYOUT_TO_*` declare `code:"Key1" … "Key7"`,
but the DOM `KeyboardEvent.code` for the number row is `Digit1…Digit7`. Under `useHotkey`'s
`code.toLowerCase()` comparison these can never match, so **Shift+1..7 are advertised in the UI but the
generic hook cannot fire them**; some other path must handle them (UNRESOLVED, §6).

### 2.1 Video editor (separate bundle) [observed — prior pass, `restreamvideoeditor.d22611927fb1ae5c.js`; not re-verified here]

| action | keys |
|---|---|
| Undo | `Ctrl`/`⌘` + `Z` |
| Redo | `Ctrl`/`⌘` + `Shift` + `Z` |
| Split clip | `S` |
| Delete clip | `D`, `Delete`, `Backspace` |
| Play / pause | `Space` |
| Mute | `M` |

---

## 3. Settings modal

Store (`HostPageViewStore`) [observed]: `shouldShowSettingsModal`, `selectedSettingsTabId`
(default `GENERAL`, reset to `GENERAL` on close), `openSettingsModal({ analyticsSource, tabId })`,
`closeSettingsModal()`. Analytics: `"Settings Modal Shown" {isGuest, source}` /
`"Settings Modal Closed" {isGuest}`. Three transient highlight flags reset on close:
`shouldHighlightStreamingResolutionsSelect`, `shouldHighlightNonVideoParticipantToggle`,
`shouldFocusParticipantNameInput`.

**Tabs**, in render order, each `...(0,l.u)(condition && {...})` so all are conditional:

| id | label | content component | condition |
|---|---|---|---|
| `GENERAL` | General | `GeneralSettingsForm` | `shouldShowGeneralSettings` |
| `VIDEO` | Video | `VideoSettingsForm` | `shouldShowVideoSection` |
| `AUDIO` | Audio | `AudioSettingsForm` (module `71709`) | `shouldShowAudioSection` |
| `RECORDINGS` | Recordings | `RecordingsSettingsForm` | `shouldShowRecordingsSection && recordingsSettingsProps` |
| `GREEN_SCREEN` | **Virtual Background** | `GreenScreenForm` | `shouldShowVirtualBackgroundSection` |
| *(appended array)* | Shortcuts | `Shortcuts` | `shouldShowShortcutsSection` |
| *(appended array)* | Profile | `ProfileSettingsForm` | `shouldShowProfileSection` |

All tabs render `withScroll: true`. Modal footer: **Embed Stream** button (`onEmbedClick`).
Narrow/mobile renders the same forms through `SettingsAccordion` (`SettingsAccordionSection`) instead of
tabs, with `shouldInitialExpandGeneralAccordion` / `shouldInitialExpandProfileAccordion`.

Shared field primitives [observed]: `SettingsSelectField` (`<select>` + info tooltip + `renderAfter` slot,
`emptyLabel` defaults to “None”), `SettingsTogglikField` (toggle + info icon + `disabledTip` +
`shouldHighlight` auto-focus), `SettingsSliderField` (label + slider, `thumbSizePx: 16`),
`SettingsInputField`, `SettingsTabButton`, `SettingsButton`, `SettingsDropdown`.

### 3.1 General tab

| control | id | type | options / default | persistence |
|---|---|---|---|---|
| Live stream quality | `liveStudioQuality` | select | `streamingProfiles`; disabled via `shouldDisableStreamingResolutionsSelect`; tooltip `streamingResolutionSelectTooltip` | server-side stream profile [inferred] |
| ↳ tip “Want Full HD quality? **Upgrade Now**” | — | link | shown when `shouldShowFullHDQualityUpgrade` | — |
| ↳ tip ⚠️ “Some platforms might not support streaming at 60 fps” | — | static | when value contains `60fps` | — |
| ↳ tip ⚠️ “Some platforms might downgrade stream quality to HD” | — | static | when value contains `x1080` and not `shouldHideFullHdQualityWarning` | — |
| Name | `hostName` | text | placeholder “e.g. Isaac Newton” | `restream.liveStudio.participantName` |
| Title (optional) | `hostTitle` | text | placeholder “e.g. Head of Sales” | `restream.liveStudio.participantTitle` |
| Participants names | `liveStudioParticipantsNamesInfo` | toggle | info “Show participants names on the overlay.” | event/server state [inferred] |
| Automatically share screen | `liveStudioAutoShareScreenInfo` | toggle | hidden in scenes mode | [inferred] |
| Show graphics and captions on top of video clips | `liveStudioOverlayOverVideoClip` | toggle | disabled while value is `null` | [inferred] |
| Guest can control all presentations | `shouldAllowGuestsControlAllPresentations` | toggle | disabled while `null` | [inferred] |
| Show non-video participants | `liveStudioNonVideoParticipantsInfo` | toggle | supports `shouldHighlight` | [inferred] |
| Show QR code scan alerts on stream | `shouldShowQrCodeScanAlerts` | toggle | feature-flagged | [inferred] |
| Push product links to live chat | *(also emits id `shouldShowQrCodeScanAlerts` — duplicate-id bug)* | toggle | feature-flagged | [inferred] |
| “Try Studio 2.0” / “Back to old experience” buttons | — | button | `shouldShowScenesNewExperienceButton` / `shouldShowScenesBackToOldExperienceButton` | `studio.onboarding.switchedToNewExperienceAt`, `studio.popover.shouldShowBackToOldExperiencePopover` |

### 3.2 Video tab

| control | id | type | persistence key |
|---|---|---|---|
| Camera preview (sticky) | — | — | — |
| Video input | `liveStudioVideoInputSelect` | select of `videoDevices` | `studio.settings.videoInputDeviceId` |
| Video resolution | `liveStudioVideoResolutionSelect` | select of `screenResolutions`, info “Max available resolution based on Live stream quality settings” | `studio.settings.profileVideoResolution` |
| Mirror camera | `liveStudioMirrorInputInfo` | toggle, info “Flip the video horizontally” | `studio.settings.webcam.isMirrored` (extra camera: `studio.extraCameraSettings.webcam.isMirrored`) |
| Beautify (toggle) | `liveStudioBeautifyToggle` | toggle, `shouldShowBeautifyFilterSettings` | `studio.settings.isBeautifyFilterEnabled` |
| Beautify intensity | `liveStudioBeautifyIntensity` | slider, `shouldShowBeautifyFilterTuning`, has reset button | `studio.settings.beautifyFilterIntensity` |
| VP9 encoding | `liveStudioVp9InputInfo` | toggle, `shouldShowVp9` | `studio.settings.shouldUseVp9` |

### 3.3 Audio tab (cross-ref TOOLS audio spec)

`liveStudioAudioInputSelect` → `studio.settings.audioInputDeviceId`;
`liveStudioAudioOutputSelect` → `studio.settings.audioOutputDeviceId`;
`liveStudioEchoCancellationInfo` → `studio.settings.shouldUseEchoCancellation`;
`liveStudioNoiseSuppressionInfo` → `studio.settings.shouldUseNoiseSuppression`;
`liveStudioAutoGainControlInputInfo` → `studio.settings.shouldUseAutoGainControl`;
`liveStudioStereoInputInfo` → `studio.settings.shouldUseStereoAudioInput`;
`liveStudioHighResolutionAudioInput` → `studio.settings.shouldUseHighResolutionAudio`.
Extra-camera mirror set: `studio.extraCameraSettings.shouldUse{EchoCancellation,NoiseSuppression,AutoGainControl,StereoAudioInput,HighResolutionAudio}`.

### 3.4 Recordings tab [observed]

Three mutually exclusive renderings driven by `hasCloudRecordingsAccess` / `hasLocalRecordingsAccess`:

1. **Cloud recordings** section (`hasCloudRecordingsAccess`): heading “Cloud recordings”, copy
   “All your streams are auto-recorded to the cloud.”, then “You'll get full video and audio, separate feeds
   of all sources and participants, up to `${recordingHoursPerStream}` hr/stream. Need more? **Upgrade**”
   → `show({ fromParam: T6 })`.
2. **Local recordings** section (`hasLocalRecordingsAccess`):
   | control | id | type | options / default |
   |---|---|---|---|
   | Record each participant locally | `localRecordingEnabled` | toggle | info “Local recordings are isolated individual tracks of each participant, ideal for post-production.” |
   | Record 4K sources in full resolution | `localRecording4kEnabled` | toggle | only when `supports4kLocalRecording`; maps `localRecordingResolution` `ULTRA_HD` ↔ `AUTO` |
   | Recording mode | radio group, horizontal | `AUDIO_VIDEO` (“Video & Audio”, default) / `AUDIO_ONLY` (“Audio only”) | shown only while local recording is on |
   Static copy links to Google Chrome and `support.restream.io/en/articles/12459078-local-recordings`;
   caveat “Local recording may slightly lower your stream quality.”
   Analytics: `"Enable Local Recording Clicked"` / `"Disable Local Recording Clicked"` /
   `"Update Local Recording Mode Clicked"`, all with `source: "studio_settings_recordings"`.
3. **Local upsell** (cloud yes, local no): copy + **Upgrade Now** →
   `show({ targetFeatures: [AUSTIN_PROFESSIONAL_LOCAL_RECORDINGS], fromParam: T6 })`.
4. Neither → full paywall form (`ao`).

### 3.5 Virtual Background tab

`GreenScreenForm` + `VirtualBackgrounds`. Controls / keys (cross-ref video-fx spec):
`liveStudioGreenScreenKeyColorTypeInput` → `studio.settings.greenScreenKeyColorTypeV2`
(options `AUTO` `#000000`, `GREEN` `#00FF00`, `BLUE` `#0099FF`, `MAGENTA` `#FF00FF`, `CUSTOM` → `studio.settings.greenScreenCustomKeyColor`);
sliders `liveStudioGreenScreenSimilarity|Smoothness|Spill|Brightness|Contrast|Gamma` →
`studio.settings.greenScreen{Similarity,Smoothness,Spill,Brightness,Contrast,Gamma}`;
`liveStudioLutFilterSelect` → `studio.settings.lutFilter`, options
`none` (“None”), `ClassicFilm` (“Classic film”), `TealOrange` (“Teal & orange”), `WarmCinema` (“Warm cinema”),
`IcyDrama` (“Icy drama”), `FadedMemories` (“Faded memories”);
background selection → `studio.settings.virtualBackgroundIdV2` (legacy `…virtualBackgroundId`);
first-use confirm → `studio.settings.shouldShowGreenScreenConfirm`.

### 3.6 Profile tab

`ProfileSettingsForm`: “Profile picture” avatar list (upload cap: non-`SocialAccount` avatars + in-flight
uploads must be `< 5`; errors `UPLOAD_LIMIT`, `INVALID_FORMAT` → analytics `"Unsupported Avatar Upload" {fileFormat}`),
plus `liveStudioParticipantName` and `liveStudioParticipantTitle` inputs.
Keys: `studio.user.avatars`, `studio.user.selectedAvatar`.

---

## 4. Persistence

### 4.1 Mechanism [observed + inferred]

All Studio state uses a typed repository wrapper — `new Repository("<key>", ioTsCodec, defaultValue?)`
(e.g. `new A.C("studio.onboarding.eventJoinToken", u.string)`,
`new te.O("studio.onboarding.shouldShowFirstRecordingPopover", i.boolean, !0)`), with `.get()`, `.set()`,
`.delete()`. **Backing store is localStorage** [inferred — no literal `localStorage.setItem("studio.…")`
call exists; the only literal calls in the bundles are third-party: `_dd_s` (Datadog RUM),
`feedback-toolbar-position|settings|theme`, `testGroup`, and `sessionStorage.removeItem("EXP_sent_…")`].

### 4.2 Full `studio.*` key set (27 settings keys + 42 others) [observed]

**Settings (`studio.settings.*`)** — 27:
`audioInputDeviceId`, `audioOutputDeviceId`, `beautifyFilterIntensity`, `greenScreenBrightness`,
`greenScreenContrast`, `greenScreenCustomKeyColor`, `greenScreenGamma`, `greenScreenKeyColorTypeV2`,
`greenScreenSimilarity`, `greenScreenSmoothness`, `greenScreenSpill`, `isBeautifyFilterEnabled`,
`lutFilter`, `profileVideoResolution`, `shouldShowGreenScreenConfirm`, `shouldUseAutoGainControl`,
`shouldUseEchoCancellation`, `shouldUseHighResolutionAudio`, `shouldUseNoiseSuppression`,
`shouldUseStereoAudioInput`, `shouldUseVp9`, `videoInputDeviceId`, `virtualBackgroundId`,
`virtualBackgroundIdV2`, `webcam.isBlinded`, `webcam.isMirrored`, `webcam.isMuted`.

**Extra camera (`studio.extraCameraSettings.*`)** — 6: `shouldUseAutoGainControl`,
`shouldUseEchoCancellation`, `shouldUseHighResolutionAudio`, `shouldUseNoiseSuppression`,
`shouldUseStereoAudioInput`, `webcam.isMirrored`.

**Identity / auth**: `studio.guestId`, `studio.hostAccessToken`, `studio.user.clientId`,
`studio.user.clientIdLock`, `studio.user.clientSecret`, `studio.user.avatars`, `studio.user.selectedAvatar`,
`studio.attribution.utm`, `studio.ai.sessionId`.

**Onboarding / popovers** (16): `studio.onboarding.advancedQrOnboardingFinished`,
`.eventJoinToken`, `.isAutoSwitchOnboardingPopoverShown`, `.isAutoSwitchPromoPopoverShown`,
`.isEditModeOnboardingModalShown`, `.isGuestPairsOnboardingPopoverShown`,
`.isParticipantsNamesInfoPopoverShown`, `.isStreamModeSwitchNotificationDismissed`,
`.shouldHighlightLayoutCustomizationFeature`, `.shouldShowAudioOnlyOnboardingPopover`,
`.shouldShowFirstRecordingPopover` (default `true`), `.shouldShowLandscapeModeWarningModal`,
`.switchedToNewExperienceAt`, `studio.popover.shouldShowBackToOldExperiencePopover`,
`studio.logoTrigger.hasShownPopoverOnce`, `studio.chatOverlay.demoManuallyDismissed`.

**“New” badges / dismissals**: `studio.sidebar.isWidgetsNewNotificationDismissed`,
`studio.sidebar.isScenesNotesNewNotificationDismissed`,
`studio.sidebar.isScenesCustomMusicNewNotificationDismissed`,
`studio.scenes.isCountdownNewNotificationDismissed`,
`studio.layouts.isShowtimeLayoutNewNotificationDismissed`,
`studio.sources.isSourceImageNewNotificationDismissed`,
`studio.slackStreamingBanner.isDismissed`,
`studio.halloween.isHalloween2025GraphicsNotificationDismissed`,
`studio.christmas.isChristmas2025MusicNotificationDismissed`,
`studio.customMusic.isShownCustomMusicCopyrightWarning`,
`studio.screenShare.secondScreenShareWarningAcknowledged`.

**Modal throttles**: `studio.clips-conversion-modal.{automatic|manual|trial}.last-shown-ms`,
`studio.experiment-2021-07-29.trialRecordingsDurationMs`.

**Misc**: `studio.dualOutput.previewPreferences`, `studio.localVideo.shouldShowLocalVideoRepository`,
`studio.shouldCameraBeOnAirOnConnect`, `studio.isMediaDeviceChangePermissionGranted`.

**Dev-only panels** (should not ship): `studio.devAiSpendPanel.{isOpen,position,clearedBeforeTs}`,
`studio.devPcapPlayerPanel.{offsetSecs,suid,userId}`,
`studio.devWidgetModel.{modelId,thinking,imageGenerations}`.

### 4.3 Non-`studio.` keys [observed literal strings; storage role [inferred] for some]

`restream.liveStudio.participantName`, `restream.liveStudio.participantTitle`, `restream-scenes-list`,
`restream-security-code`, `restream_oauth_channel_connect_result`, `restream:ai-stream-meta:usage`,
`restream_thumbnail`, `testGroup`, `_dd_s`, `feedback-toolbar-position`, `feedback-toolbar-settings`,
`feedback-toolbar-theme`, `sessionStorage` prefix `EXP_sent_`.

### 4.4 IndexedDB [observed]

`indexedDB.open("RestreamDb", 1)` — single named database, version 1. Generic helpers
`indexedDB.open(name, version)` and `indexedDB.deleteDatabase(name)` also present. Object-store names were
not resolved in this pass (UNRESOLVED, §6).

---

## 5. Plan gating

Upsell is driven by one hook — `useUpgradeModal({ onUpgradeSuccess })` → `show({ targetFeatures, stepProps: { pricing: { title } }, fromParam })`.
`fromParam` constants seen in the Settings modal: `s3` (Full HD from General tab), `T6` (Recordings tab).

**Feature flags referenced from Studio** [observed]:

| flag | gates |
|---|---|
| `AUSTIN_PROFESSIONAL_STUDIO_RESOLUTION` | Full HD / 1080p streaming quality |
| `AUSTIN_PROFESSIONAL_STREAM_ORIENTATION` | dual / portrait stream orientation |
| `AUSTIN_PROFESSIONAL_LOCAL_RECORDINGS` | per-participant local recording |
| `AUSTIN_BUSINESS_STUDIO_RTMP_SOURCE` | RTMP source |
| `S69.PAIRS` | guest pairs |

**Gated surfaces, by upsell string** [observed in `SPEC-studio-ui-strings.md`]:

- Quality: “Upgrade to stream in Full HD”, “Want Full HD quality?”, “Upgrade your plan to support this option
  or choose a different stream quality in your settings.”
- Orientation: “Upgrade to stream Dual orientations”.
- Recording: “Recording is a paid feature”, “Upgrade to record all streams”, “Upgrade to unlock Record Only mode”,
  “Upgrade to save recordings locally”, “Upgrade to stream the recording”,
  “Want to keep recording? Recording is a paid feature. Upgrade to remove limits…”,
  tiering copy “Record streams up to 6 / 10 / 20 hrs”, “Recording - 20hrs/stream, stored for 30 days”.
- Sources: “Upgrade to unlock RTMP source”.
- Guests: “Upgrade to invite more people”, “Upgrade to invite webinar attendees”.
- Graphics / branding: “Upgrade to customize graphics”, “Upgrade your plan to replace watermark.”,
  “Upgrade your plan to upload overlay.”, “Upgrade your plan to upload image or video backgrounds.”,
  “Upgrade your plan to upload video clips.”
- Media / playlists: “Upgrade to stream this video”, “Upgrade to stream longer playlist”,
  “Upgrade to schedule this video”, “Upgrade to upload larger/longer/more videos”.
- Clips & music: “Upgrade to access clips.”, “Upgrade to unlock exclusive tracks”.
- Destinations: “Streaming to public pages and groups is a paid feature. %sUpgrade now%s”,
  “Unlock FB pages, groups, and custom RTMP streaming”.

---

## 6. UNRESOLVED

1. **`CHANGE_LAYOUT_TO_*` use `code:"Key1"…"Key7"` but DOM emits `Digit1`…`Digit7`.** Either a live bug, or a
   second handler outside `useHotkey` services Shift+1..7. Not located.
2. `MICROPHONE`/`CAMERA` registry entries carry **no** `asString`, so they are absent from the
   `Vk` reverse map — where that map is consumed (and whether it is the guest-side dispatcher) is unverified.
3. Which store owns each non-`studio.settings.*` General-tab toggle (participant names, auto-share screen,
   overlay-over-clip, guest presentation control, QR alerts, product links) — server event state vs. local
   repository — not traced.
4. `RestreamDb` object-store names, versions, and upgrade path.
5. Whether `studio.*` repositories are localStorage or sessionStorage is inferred from the wrapper's usage,
   not from a literal call site.
6. The two appended Settings tab arrays (`...H` Shortcuts, `...D` Profile) — their exact enum ids
   (`jo.A.SHORTCUTS` / `jo.A.PROFILE` presumed) were not read directly.
7. Duplicate DOM id `shouldShowQrCodeScanAlerts` on the “Push product links to live chat” toggle — likely a
   copy/paste defect in the source; confirm before cloning.
8. Video-editor shortcut list (§2.1) is carried over from a prior pass and was not re-verified against
   `restreamvideoeditor.d22611927fb1ae5c.js` in this pass.
