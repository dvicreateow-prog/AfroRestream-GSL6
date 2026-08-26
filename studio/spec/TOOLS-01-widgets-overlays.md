# TOOLS-01 — Widgets & On-Stream Graphics (BUILD SPEC)

Definitive spec for the widget / on-stream-graphics subsystem of Restream Studio,
derived from a local capture. Companion documents:

- `TOOLS-01a-widget-components.md` — the mechanical component inventory (56 widget + 5 AI).
- `SPEC-component-tree.md` — all 594 components with their CSS elements.
- `SPEC-studio-ui-strings.md` — all 11,130 UI strings, bucketed.

Evidence tags used throughout:
`[observed]` = literal string / code fragment found in the capture.
`[inferred]` = deduced from component names, CSS element names, or adjacent code.
`UNRESOLVED` = not determinable from the capture; must be decided at build time.

Code evidence is from `refresh-2026-08-25/chunks/357.fab32c9d675a47b1.js` unless noted.

---

## 0. The single most important architectural fact

**There is no `LowerThird` component and no `overlay-Banner` component.**
Lower thirds, tickers, banners, polls, leaderboards and scoreboards are **not**
built-in widget types. They are produced by two different mechanisms:

| Mechanism | What it produces | Built-in? |
|---|---|---|
| **Brand graphics slots** (caption / ticker / QR / logo / overlay / background) | Fixed, first-class, themed graphics rendered natively by the compositor. One of each per scene. | **Built-in** |
| **Generic widget system** (`WidgetForm` → browser source → `Frame`/`OverlayImage`) | Arbitrary user-created HTML surfaces rendered as overlay iframes. Polls, leaderboards, scoreboards, weather, animated stripes, anything. | **User-created** |

> `[observed]` "Widget" and "browser source" name the same entity — the terms are interchangeable.
> `[observed]` "Get all custom browser sources. Browser sources are web pages rendered as overlay iframes on the stream."
> `[observed]` "Add a dynamic on-stream visual like a poll, leaderboard, ticker, or scoreboard."

### Which "widgets" are USER-CREATED vs BUILT-IN

**USER-CREATED (via the generic widget system — arbitrary URL or AI-generated HTML):**
`WidgetForm` · `WidgetOption` · `WidgetAsset` · `WidgetFavicon` · `WidgetMoreOptionsMenu` ·
`WidgetsContent` · `WidgetsTabTitle` · `WidgetUpgradePopover` · `Frame` · `OverlayImage`
→ polls, leaderboards, scoreboards, tickers-as-HTML, lower thirds, banners, weather, alerts-as-HTML,
  "DO NOT CROSS" stripes, and every other custom graphic.

**BUILT-IN (first-class brand graphics, native compositor rendering, one slot per scene):**
Caption (incl. secondary text) · Ticker (scrolling text) · QR code · Logo · Overlay (image/mp4) ·
Background · Chat overlay · Countdown · Participant name plates.

**BUILT-IN SYSTEM UI (not on-stream graphics at all):**
`Alert` / `AlertContainer` (in-app toasts) · `Timer` / `LogoAndStatus` (host header) ·
`Questionnaire` (onboarding flow).

---

## 1. Widget system (user-created browser sources)

Components: `WidgetsTabTitle` `WidgetsContent` `WidgetForm` `WidgetOption` `WidgetAsset`
`WidgetFavicon` `WidgetMoreOptionsMenu` `WidgetUpgradePopover`

### 1.1 What it is
A per-brand library of **browser sources**. Each is a URL rendered as an iframe layer over the
scene. Widgets are added to a scene as draggable/resizable layers. Two creation paths:
paste a URL, or have AI generate the HTML (`AI widget`).

### 1.2 Entity model `[observed]` (from the scene-serialisation map)

```
browserSources: (scene.browserSources ?? []).map(e => ({
  id:          e.id,
  position:    e.position,      // normalized [x, y] freemove, top-left corner
  widthScale:  e.widthScale,    // 0..1 fraction of canvas width
  heightScale: e.heightScale,   // 0..1 fraction of canvas height
  ...
}))
```
Screen-space resolution `[observed]`:
`{ width: canvasW*e.widthScale, height: canvasH*e.heightScale, x: canvasW*e.freemovePosition[0], y: canvasH*e.freemovePosition[1] }`

| Property | Type | Default | Where configured |
|---|---|---|---|
| `id` | uuid | server-assigned | — |
| `name` | string | `"New widget"` `[observed]` | `WidgetForm` input; `WidgetOption` inline edit |
| `url` | https URL | required | `WidgetForm` input (**not editable for AI widgets**) |
| `position` / `freemovePosition` | `[x,y]` 0–1 | UNRESOLVED (likely `[0,0]` or centered) | drag the `Frame` on the live preview |
| `widthScale` / `heightScale` | 0–1 | UNRESOLVED | `Frame` resize handles |
| `isVisible` / on-air | boolean | UNRESOLVED (likely `false` until enabled) | `WidgetOption` show/hide; "Hide Widget" `[observed]` |
| `zIndex` / layer order | int | append order | `WidgetsContent` drag handle (`layerDragHandle`, `draggableLayerItem`) `[observed]` |
| `favicon` | derived from URL | placeholder / bot icon | `WidgetFavicon` (`favicon`, `placeholder`, `botIcon`) `[observed]` |

`[observed]` "Update a browser source that is already added to a scene. Can change visibility, z-index, position, and size."

### 1.3 Limits & gating `[observed]`
- `"Activate up to 5 widgets on one scene with Restream Standard."` → **5 active widgets per scene (Standard)**.
- `"Create a new browser source from a URL. Only available for users with a paid plan (check browserSourcesAvailable in state)."` → paid gate, surfaced by `WidgetUpgradePopover` (`anchor`, `popper`).
- `"Too many browser source overlays"` — hard cap. UNRESOLVED: numeric value.
- `"Can't select browser source. It's possible to use only StreamElements overlays."` and
  `"It's possible to upload only StreamElements overlays."` → a restricted mode limits sources to StreamElements URLs.

### 1.4 UI copy — exact `[observed]`
```
Widgets                      Widget (BETA)              All widgets
Widget overlay               New widget                 Custom widget
AI widget                    Widget preview             Widget ready
1 widget                     Select widgets             Open the widgets tab
Add new widget to show it on a scene
Add More Widgets to Your Scene
Hide Widget
Generate widget
Describe a widget and AI will design it for you.
Designing widget…
Widget added
Enable widget thinking mode
Widget V0 model
V0 chain-of-thought mode — slower but often better for complex widgets.
Create a widget that displays the current weather in New York.
Create an animated police "DO NOT CROSS" stripe widget.
New York weather widget
Scopes your message to the selected widget.
Scopes your message to the "$name" widget.
Scopes your message to $count selected widgets.
```
Empty state: `WidgetsContent.emptyState` / `emptyStateIcon` / `emptyStateText` `[observed CSS]`.
UNRESOLVED: the literal empty-state sentence.

Errors `[observed]`:
```
Could not add the widget to the scene.
Could not generate the widget. Please try again.
Could not restore this version of the widget.
Cannot edit widget: source does not exist
Cannot edit widget: source was not generated by the widget tool
Cannot change the URL of an AI-generated widget. Only its name can be edited; use generate_widget to change its content.
New URL for the browser source. Not allowed for AI-generated widgets.
Can't change widget layer. Please try again later.
Failed to update widget browser source
Widget regenerated but updating the browser source failed
Widget generated but no preview URL was returned
Widget SSE aborted: idle timeout
Widget SSE error: ${data.error ?? data.message ?? "unknown"}
Widget SSE request failed: status ${status}
Direct widget generation failed unexpectedly
Unexpected error during widget generation
Failed to add browser source: no active brand
Failed to remove browser source from scene before deleting widget
Failed to read all browser source overlays: retrying
No scenes or widgets available
```
Analytics events `[observed]`: `AI Widget Assistant Opened`, `AI Widget Edit Clicked`,
`AI Widget Generation Started`, `AI Widget Generation Completed`, `AI Widget Quick Template Option Clicked`,
`AI Widget See In Chat Clicked`, `Browser Sources Widgets Button Clicked`, `Browser Source Position Changed`.

Accessibility labels `[observed]`: `Draggable #${n+1} scene widget`, `Dragging #${n+1} scene widget`.

### 1.5 `WidgetForm` — property sheet
Elements: `input` `actionButton` `cancelButton` `button` `footer` `error` `errors` `hasError` `[observed CSS]`.
Two fields only: **name** and **URL**. Inline validation via `error`/`errors`/`hasError`.
UNRESOLVED: placeholder text and character limits for widget name/URL.

### 1.6 `WidgetOption` — list row
Elements include `dragHandle` `dragHandleIcon` `editButton` `deleteButton` `confirmTitle`
`isConfirmingDelete` `isDraggable` `isFocused` `isHoverHighlighted` `isSelected` `actionsButton`
`forceHide` `cancelButton` `[observed CSS]`.
Behaviour: drag to reorder (= z-order), click to select, inline edit, two-step delete confirm.

### 1.7 `WidgetAsset` — generation/preview tile
Elements: `preview` `iframe` `iframeFrame` `iframeFrameHidden` `rootGenerating` `shaderOverlay`
`shaderOverlayChild` `statusIcon` `statusLabel` `applyButton` `applyOverlay` `openRow` `openIcon`
`openLabel` `footer` `[observed CSS]`.
States: generating (shader sweep) → ready (iframe preview) → apply. "Open" link opens the widget URL.

### 1.8 `WidgetMoreOptionsMenu`
Elements: `trigger` `triggerActive` `popover` `content` `item` `icon` `shortcut` `[observed CSS]`.
Per-widget overflow menu with keyboard shortcut hints. UNRESOLVED: exact item list.

### 1.9 `WidgetsTabTitle`
Elements: `title` `icon` `gradientText` `mode` `backButton` `toggleButton` plus
`widgetsModeTitleEnter/Active/Exit/ExitActive` transition classes `[observed CSS]`.
The tab header animates between "widgets list" mode and "inline layers" mode
(`WidgetsContent.inlineLayersButton` / `inlineLayersBackButton` / `inlineLayersIcon`).

---

## 2. Countdown

Components: `Countdown` `CountdownControls` `CountdownToolbar` `CountdownColorPicker`
`CountdownBackgroundColorPicker` `CountdownSceneOverlayContainer` `CountdownSceneOverlayControls`
`CountdownSceneOverlayControlsSelect` `CountdownAutoSwitchToast`

### 2.1 What it is
A **scene type**, not an overlay you attach. `[observed]` "The type of scene to create: 'Default' for
live camera, 'Media' for media/video, 'Countdown' for countdown timer". A countdown scene renders a
large timer over a background, optionally with music, and can auto-switch to the next scene at zero.

Countdown scenes are restricted `[observed]`:
```
Add a camera placeholder to a scene. Does not work on Countdown scenes.
Add a media placeholder to a scene. Does not work on Countdown scenes.
Media source can't be added on countdown scene
Enabled sources don't show on Countdown scenes
Maximize is not available on countdown scene
To add source, go to a different scene than countdown
Unable to execute undo command ${type}: Not allowed for Countdown scene
```

### 2.2 Properties `[observed]` (verbatim from the scene-serialisation map)

```js
countdownBackgroundColor:   e.backgroundColor,
countdownBackgroundOpacity: e.backgroundOpacity,
countdownFreemovePosition:  e.freemovePosition,
countdownScale:             e.scale,
countdownDurationMs:        e.durationMs,
countdownMusicId:           e.music?.id ?? null,
countdownMusicVolume:       e.musicVolume
```

| Property | Type | Default | Range | Configured in |
|---|---|---|---|---|
| `durationMs` | int ms | UNRESOLVED (one of the presets) | presets `[observed]`: `0 min` `1 min` `2 min` `3 min` `10 min` `15 min` (plus `10 sec` / `30 sec`) | `CountdownToolbar` / `CountdownSceneOverlayControlsSelect` — copy: "Countdown duration", "Countdown duration in milliseconds" |
| `color` (text) | hex or `"Auto"` | **`Auto`** `[observed]` | — | `CountdownColorPicker` |
| `backgroundColor` | hex | brand/default | — | `CountdownBackgroundColorPicker` |
| `backgroundOpacity` | 0–1 | UNRESOLVED | 0–1 | `CountdownBackgroundColorPicker.opacityInput` |
| `freemovePosition` | `{x,y}` | **`{x:0, y:0}` = centered** `[observed]` | — | drag on live preview |
| `scale` (size) | number | UNRESOLVED | — | `countdownSizeControl` |
| `font` | font family | brand font | — | `countdownFontControl`; "Apply fonts to the countdown timer." |
| `music` | trackId \| null | `null` | — | `CountdownSceneOverlayControls.musicIcon` / `uploadMusicButton` |
| `musicVolume` | float | UNRESOLVED | **0–1**, 0 = muted, 1 = full `[observed]` | volume control |
| `autoSwitch` | boolean | UNRESOLVED | — | `autoswitchIcon`; "Switch scene after countdown" |

`[observed]` "Position of the countdown on screen, where {x: 0, y: 0} is centered"
`[observed]` "Set countdown text color. Use \"Auto\" to auto-detect based on background."
`[observed]` "Set the volume of countdown scene music. Volume is 0 to 1, where 0 is muted and 1 is full volume."

### 2.3 Color pickers
`CountdownColorPicker` elements `[observed CSS]`: `currentColor` `currentColorButton` `autoColorButton`
`eyeDropperButton` `input` `inputWrapper` `fullInput` `fullInputMode` `picker` `popover` `label`
`extraControls` `active` `isOpen`.
`CountdownBackgroundColorPicker` adds `[observed CSS]`: `defaultColorButton` `opacityInput`
`isDefaultBackground` `fullWidth` `hidden`.
→ Both are: swatch button → popover with a picker, hex text input, an eyedropper, and
(color picker) an **Auto** button / (background picker) a **Default** button + separate opacity input.

`[observed]` "Reset background to transparent" · "Background opacity" · "Background Color"

### 2.4 Auto-switch
`CountdownAutoSwitchToast` (`actionButton`, `progress`) `[observed CSS]` — a toast with a progress bar
and a cancel action.
`[observed]` copy:
```
Auto-switch to next scene
Switch scene after countdown
Switching to the next scene in {{countdown}} sec.
Switching to the next scene in {{countdown}} sec. <action1>Cancel<action1>
Plays countdown only and automatically switches to the next scene when it ends
When a <bold>video</bold> or <bold>countdown</bold> ends, the scene switches to the next one.
To use auto-switch, add a video from storage or set up a countdown scene
Auto switch is not available for this scene. Media scenes require an attached video.
Auto-switch scene was enabled, so video loop is off
Perfect for stream sections that play on their own — no clicks needed.
```

### 2.5 Countdown UI copy `[observed]`
```
Countdown                    Add countdown scene          Create a countdown scene.
Countdown color              Countdown duration           Countdown font
Countdown music              Countdown position           Countdown scale
Countdown volume             Countdown color changed      Countdown font changed
Countdown moved              Countdown scaled             Countdown set
Countdown music set          Countdown music loaded
Changing countdown color…    Changing countdown font…     Adjusting countdown volume…
Setting countdown…           Setting countdown music…     Loading countdown music…
While the countdown music plays, this music is paused
Your mic is muted during the countdown
```
Analytics `[observed]`: `Countdown Color Selected`, `Countdown Background Color Selected`,
`Countdown Background Opacity Selected`, `Countdown Font Selected`, `Countdown Timer Selected`,
`Countdown Timer Position Changed`, `Countdown Timer Size Changed`,
`Countdown Custom Music Selected` / `Unselected`.

Errors `[observed]`: `Failed to update countdown duration|scale|size|freemove position|background color|
background opacity|music|music volume|volume|auto switch property`, `Failed to restart countdown`,
`Scene is not a countdown scene`, `Countdown music track not found`, `You can't change timer during a live stream`.

### 2.6 On-canvas control chrome
`CountdownSceneOverlayContainer` elements `[observed CSS]`: `countdownControls` `countdownControlsButtons`
`countdownControlsContent` `countdownControlsIcon` `countdownControlsOverlay` `countdownCustomControls`
`countdownFontControl` `countdownSizeControl` `bottomPosition` `forceRevealControls`
`hasSmallControlsSpace` `isMedium` `isPortraitOrientation` `isNotSelectedOverlay` `transparentOverlay`.
→ A hover-revealed control bar over the countdown with font and size controls; it collapses
(`hasSmallControlsSpace`) and repositions (`bottomPosition`) in tight/portrait layouts.
`Countdown` itself: `root` `count` `backdrop` `live` `invisible` `portraitOrientation`.

---

## 3. QR codes

Components: `QrCodeForm` `QrCodeOption` `QrCodeSelect` `QrCodeOverlay` `QrCodesContent` `QrCodesSection`

### 3.1 What it is
A per-brand library of QR codes. One QR code may be assigned per scene. Rendered natively as an
on-stream overlay with an optional title; supports a small/large "overlay mode" and can raise an
on-stream alert when someone scans it.

### 3.2 Properties

| Property | Type | Default | Configured in |
|---|---|---|---|
| `id` | uuid | server | — |
| `title` | string | empty | `QrCodeForm.input` (has `counterContainer` + `limit` → character counter) |
| `link` | URL | required | `QrCodeForm.field` |
| `overlayMode` | **commerce-scoped**: renders either `qrcode_image` or `qrcode_product` `[observed]` | UNRESOLVED | `QrCodeOverlay`; analytics `QR Overlay Mode Selected`, `Small QR Code Align Option Clicked` |
| `showScanAlert` | boolean | UNRESOLVED (likely `false`) | toggle — `QrCodeForm.togglik` `[observed CSS]`; persisted as `commerce.shouldShowAlertOnStream` `[observed]` |
| `pushDataToChat` | boolean | UNRESOLVED | `commerce.shouldPushDataToChat` `[observed]` |
| scene assignment | qrCodeId \| null | `null` | `QrCodeSelect` / scene panel |

`[observed]` "Assign a QR code to a specific scene. Applies the QR code to the specified scene."
`[observed]` "QR code ID to assign, or null to remove QR code from the scene"

**Correction — QR is commerce-backed** `[observed]`. The brand-settings serialisation reads:
```js
settingsBrandOverlayMode:      e.commerce?.overlayMode,
settingsBrandPushDataToChat:   e.commerce?.shouldPushDataToChat,
settingsBrandShowAlertOnStream: e.commerce?.shouldShowAlertOnStream
```
and the preview controls report `element: "qrcode_image" | "qrcode_product"`. So `overlayMode`
selects whether the QR overlay shows a **plain QR image** or a **product card** (title, price,
image) sourced from an e-commerce scrape. Related copy `[observed]`: "Someone scanned the QR code",
"Sorry, we can not scan this store.", "Sorry, we can't scan this website.", "We can't scan this
store as it's not public.", `Failed to update commerce state on brand change`,
`shouldShowEcommerceClassicOverlay` (a third, legacy overlay variant that also consumes reserved width).
Analytics `[observed]`: `Preview Element Hide Clicked` / `Preview Element Show Clicked` with
`{element, overlayMode, source}`.

### 3.3 Validation & limits `[observed]`
```
Failed to add QR code: No active brand
Failed to add Qr code: Link is too long
Failed to add Qr code: Title is too long
Failed to edit QR code: Link is too long
Failed to edit QR code: Title is too long
QR code limit reached
You've exceeded the maximum number of QR codes
```
UNRESOLVED: the numeric title/link character limits and the per-brand QR count cap.

### 3.4 UI copy `[observed]`
```
Scene QR code                Scene QR code set            Setting scene QR code…
Show QR code scan alerts on stream
Studio will show an alert on the live stream whenever someone scans the QR code.
Show alerts on stream
Set the stream`s primary color for captions, qr codes, participant names, tickers
Apply custom fonts to your overlay elements, including lower thirds, tickers, QR codes, and names.
```
Analytics `[observed]`: `QR Overlay Mode Selected`, `Small QR Code Align Option Clicked`,
`Show QR Code Scan Alert On Stream Toggle Clicked`.
Errors `[observed]`: `Failed to delete QR code.`, `Failed to select QR Code. Id does not exist`,
`Failed to set Qr Code: Not found`, `Unable to edit QR Code: Not found`, `Unable to remove QR code: does not exist`,
`Unable to change QR code order: No item with specific indexes`, `Failed to sync QR code order after delete`,
`Refetching QR codes: Failed to delete QR code`, `Failed to toggle show QR Code scans alert toggle`.

### 3.5 Component roles
- `QrCodesSection` — collapsible accordion in the sidebar. Elements `[observed CSS]`: `accordion`
  `heading` `title` `plainTitle`-less, `addButton` `plusIcon` `triangleArrowIcon` `isExpanded`
  `content` `contentWrapper` `info` `left` `right` `scenesMode`.
- `QrCodesContent` — the list body (`root`, `info`, `loader`).
- `QrCodeOption` — a list row: `dragHandle` (reorder), `image` (QR thumbnail), `actionsButton`,
  `isOpenDeleteConfirmation`, `isSelected`, `hide`, `forceHide`.
- `QrCodeSelect` — `root`, `addForm`, `scenesMode` — the picker + inline add form.
- `QrCodeOverlay` — the on-stream render: `container` `image` `imageBox` `main` `overlay` `title`
  `interactiveQrCodeControls` `isFocused` `isDisabled`.

---

## 4. Captions

Components: `CaptionForm` `CaptionOption` `CaptionSelect` `CaptionAvatar` `CaptionContainer`
`CaptionsContent` `CaptionsSection` + `AirCaption`

### 4.1 What it is
"Caption" here is a **name plate / lower third**, not subtitles. It is a two-line text graphic
(primary + secondary) with an optional avatar and platform badge, themed by the brand theme.
Separately, `Enable auto captions (English)` exists for real subtitles.

### 4.2 Properties

| Property | Type | Default | Configured in |
|---|---|---|---|
| `id` | uuid | server | — |
| `text` (primary) | string | required | `CaptionForm.input` |
| `secondaryText` | string | optional | `CaptionForm.textarea` — copy: "Secondary caption text" |
| `avatar` | image \| null | `null` | `CaptionAvatar` (`avatar`, `platformIcon`) |
| theme | brand `themeType` | see §9 | Brand settings, not per-caption |
| color | brand `primaryColor` | brand | Brand settings |
| scene assignment | captionId \| null | `null` | `CaptionSelect` |

`CaptionForm` has `counterContainer` + `limit` + `hasError` + `invalid` `[observed CSS]` →
live character counter with a hard cap.

### 4.3 Layout impact `[observed]` (from the reserved-space math)
```js
h = (scene.caption === null) ? 0 : 216 * c   // caption reserves 216px of vertical space (scaled)
p = (scene.ticker  === null) ? 0 :  48 * u   // ticker reserves 48px  (u = height/720)
g = (chatOverlay on)          ? 397 * c : 0  // chat overlay reserves 397px of width
```
`[observed]` "Caption pushes up 4+ sources" — showing a caption reflows the source layout upward.

### 4.4 UI copy `[observed]`
```
Captions                     Caption ID                  Create caption
Create a new caption         Edit caption                Edit an existing caption
Delete caption               Delete a caption            Creating caption…  Editing caption…
Caption created              Caption edited              Caption removed
Caption hidden               Caption selected            Captions loaded
Scene caption                Scene caption set           Setting scene caption…
Secondary caption text
Display name of the message author, shown on the caption
Show a caption on the stream, or hide the current caption by passing null
Caption ID to show, or null to hide
Assign a caption to a specific scene. Can be used with all scene types.
Engage your followers with captions and subtitles
Enable auto captions (English)
Brand your captions and participants names by selecting theme.
Set the base style for your on-screen captions, chat messages, and name-plates.
```
Errors / limits `[observed]`:
```
Caption already exists                   Caption not found
Caption limit reached                    You've exceeded the maximum number of captions
Caption with given title and description already exists
Failed to add caption. Text is too long
Failed to add caption. Secondary text is too long
Failed to edit caption. Text is too long
Failed to edit caption. Secondary text is too long
Failed to edit caption. Reset previous caption data.
Didn't update caption: content didn't change
Failed to read caption. It seems to be non-text one
Failed to select. Caption with such id does not exist
Failed to set caption: no caption found
Exceeded upload count limit, captions upload limited
Failed to undo caption hide
```
UNRESOLVED: the numeric primary/secondary text character limits and the per-brand caption cap.
Analytics `[observed]`: `Add Generic Caption Clicked`, `Edit Generic Caption Clicked`.

### 4.5 `AirCaption` (the "Air" minimal theme render)
Elements `[observed CSS]`: `root` `overlay` `preview` `primary` `secondary` `textWrapper`
`withSecondaryText` `avatar` `centeredAuthor` `controls` `compactControls` `isFocused`
`isPortrait` `isPreview` `isEnterDone` `animatedContainer`.
→ Chrome-less caption variant with an enter animation, centered-author mode, and a compact
control set when space is tight. `CaptionContainer.airBackground` is the matching backdrop.

---

## 5. Ticker (scrolling text)

Components: `TickerCaption` `TickerCaptionControls` `TickerCaptionToolbar` `TickerSpeedControl`

### 5.1 What it is
A single-line horizontally scrolling text strip, GPU-accelerated. One ticker per scene.
Height reserved: **48px at a 720p reference** `[observed]` (`p = 48 * (height/720)`).

### 5.2 Properties

| Property | Type | Default | Range | Configured in |
|---|---|---|---|---|
| `id` | uuid | server | — | — |
| `text` | string | required | char cap UNRESOLVED | ticker add/edit form |
| `speed` | float multiplier | **`1`** `[observed]` | **0.4 – 2.5** `[observed]` | `TickerSpeedControl` |
| scene assignment | tickerId \| null | `null` | — | scene panel / `Assign a ticker…` |
| background | shown/hidden | shown | — | `TickerCaption.hideBackground` `[observed CSS]` |

`[observed]` "Ticker scroll speed multiplier (0.4-2.5, default 1). Lower is slower, higher is faster."
`[observed]` code: `get tickerSpeed(){ return this.shouldEnableTickerSpeedControl ? this.overlayStore.state.tickerV2?.speed ?? 1 : this.featureStore.tickerSpeed.value }`
→ The speed control is **experiment-gated** (`hostExperimentsStore.shouldEnableTickerSpeedControl`);
when off, speed comes from a feature-flag value instead of per-ticker state. `[observed]`
Speed edits are debounced into one undo entry: a 600 ms `setTimeout` commits
`tickerSpeedUndoBaseline` → `latestTickerSpeed` as a single `RestoreOverlayElement` undo command. `[observed]`

### 5.3 Component roles `[observed CSS]`
- `TickerCaption`: `root` `ticker` `tickerWrap` `tickerItem` `gpuTicker` `layout` `hideBackground`
  `controls` `compactControls`.
- `TickerCaptionControls`: `button` `buttonLabel` `icon`.
- `TickerCaptionToolbar`: `root` `container`.
- `TickerSpeedControl`: `root` `control` `controlIcon` `controlIconWrapper` `isExpanded`
  `isSidebarMode` `hidden` → an expanding speed slider that renders both on-canvas and in the sidebar.

### 5.4 UI copy `[observed]`
```
Ticker                    Ticker ID                 Ticker speed
Create ticker             Create a new ticker (scrolling text)
Edit ticker               Edit an existing ticker
Delete ticker             Delete a ticker
Change ticker speed       Close ticker speed control
Creating ticker…          Editing ticker…           Setting ticker speed…
Ticker created            Ticker edited             Ticker removed
Ticker hidden             Ticker Re-ordered         Added ticker
Scene ticker              Scene ticker set          Setting scene ticker…
Assign a ticker to a specific scene. Pass null to remove ticker from the scene. Optionally set scroll speed.
Ticker ID to assign, or null to remove ticker from the scene
```
Errors / limits `[observed]`:
```
Ticker already exists            Ticker not found            Ticker limit reached
You've exceeded the maximum number of tickers
Failed to add ticker. Text is too long        Failed to edit ticker. Text is too long
Can't update ticker speed. Please try again later.
Can't update ticker: content is not changed
Failed to set ticker speed        Failed to set ticker: no ticker found
Failed to select. Ticker with such id does not exist
Failed to read ticker. It seems to be non-text one
Unable to edit ticker: does not exist
Unable to change ticker order: no item with specific indexes
Exceeded upload bytes limit, tickers upload limited
Exceeded upload count limit, tickers upload limited
Failed to undo ticker hide      Failed to upload ticker
```
Analytics `[observed]`: `Add Ticker Clicked`, `Edit Ticker Clicked`.

---

## 6. Brand / Logo

Components: `Brands` `BrandItem` `BrandLogo` `BrandFolderLogo` `BrandsContent` `BrandsHead`

### 6.1 What it is
A **brand** is the container that owns every graphics asset: captions, tickers, QR codes, logos,
overlays, backgrounds, browser sources, music, theme, primary colour, font, layout type.
Brands can be grouped into **brand folders**. Exactly one brand is active at a time; switching
brands swaps the entire graphics set.

### 6.2 Brand properties `[observed]` (from the settings-serialisation map)
```js
settingsBrandShouldShowParticipantsNames: e.shouldShowParticipantsNames,
settingsBrandShouldShowDefaultGraphics:   e.shouldShowDefaultGraphics,
settingsBrandPrimaryColor:                e.primaryColor,
settingsBrandThemeType:                   e.themeType,
settingsBrandLayoutType:                  e.layoutType,
settingsBrandCaptionId:                   e.captionId,
settingsBrandQrCodeId:                    e.qrCodeId,
settingsBrandTickerId:                    e.tickerId,
settingsBrandLogoId:                      e.logoId,
settingsBrandOverlay…                     (overlayId)
```

| Property | Type | Default | Notes |
|---|---|---|---|
| `name` | string | — | 1 char min; max is `%s`-interpolated `[observed]` — UNRESOLVED numeric |
| `primaryColor` | hex | brand default | "Set the stream`s primary color for captions, qr codes, participant names, tickers" |
| `themeType` | enum: `DEFAULT` `NEWS` `ROUNDED` `AIR` `[observed]` | `DEFAULT` `[inferred]` | see §9 |
| `layoutType` | enum | per scene type | see layout spec |
| `shouldShowDefaultGraphics` | boolean | `true` `[inferred]` | "Show default Restream graphics like overlays, videos, and backgrounds." |
| `shouldShowParticipantsNames` | boolean | UNRESOLVED | "Show participants names on the overlay." |
| `captionId`/`tickerId`/`qrCodeId`/`logoId`/`overlayId` | uuid \| null | `null` | active graphic per slot |
| font | font family | default | "Apply custom fonts to your overlay elements, including lower thirds, tickers, QR codes, and names." |

### 6.3 Logo properties
| Property | Type | Default | Configured in |
|---|---|---|---|
| `id` | uuid | server | — |
| image | png/jpg/**mp4** | — | upload |
| `position` | fixed grid corner | UNRESOLVED | "Set the logo position for a specific scene. Works for Default, Media and Countdown scenes." |
| scene assignment | logoId \| null | `null` | "Logo ID to assign, or null to remove logo from the scene" |

`[observed]` mp4 logos are animated but cannot be *played* on demand:
`Failed to show logo: mp4 video logos cannot be played`, `Disabled mp4 logo on scene`.
`[observed]` `Custom logos require a paid subscription`, `Logo limit reached`,
`Failed to add logo. Wrong file type`, `Failed to add logo. No permission to use paid features`,
`Failed to preprocess logo: image has no dimensions`, `Failed to preprocess logo: no canvas context`,
`Default logos cannot be deleted.`

### 6.4 UI copy `[observed]`
```
Brand           Brands            Branding          Brand folder / Brand Folder / Brand Folders
Name your brand
Brand name should be at least 1 character long.
Brand name must not exceed %s characters long.
Brand with such name already exists
Can’t add brand. Make sure to add a brand name that’s less than %s characters.
Can’t add brand. This brand name already exists.
Can’t add brand. You’ve already reached the maximum of %s brands!
Can't delete brand. You need to have at least one brand.
Can’t edit brand. Make sure to add a brand name that’s less than %s characters.
Can't edit brand. This brand name already exists.
Brands limit exceeded          Brand delete operations locked
Brand your captions and participants names by selecting theme.
Brand your chat messages and captions by selecting a custom color.
Customize logo        Delete logo        Added logo
Ability to remove Restream's branding
Personalize your live streams by removing the Restream branding starting from Standard plan.
Show Restream watermark.
Studio streams with your own logo and overlays
```
Analytics `[observed]`: `Brand Folder Edited|Removed|Selected|Submitted`, `Theme Type Selected`.

### 6.5 Component roles `[observed CSS]`
- `Brands` — `popover` only; the brand switcher popover.
- `BrandsHead` — the active-brand header: `logo` `folderLogo` `icon` `iconContainer` `name` `label`
  `entity` `textContainer` `leftStick` `inline` `compactMode` `canControl` `isHidden`.
- `BrandsContent` — the list: `root` `title` `divider` `addNewLogo` `isActive` `isAnotherActive`.
- `BrandItem` — one row with full inline CRUD: `input` `name` `icon` `info` `action` `cancel`
  `dirty` `negative` `isAdding` `isEditing` `isRemoving` `isSelectable` `isSelected` `isActionable` `isBlurred`.
- `BrandLogo` — `image` `imageWrapper` `isActive` `root`.
- `BrandFolderLogo` — `back` `front` `frontMaskOpen` `frontMaskClosed` `icon` `isActive`
  → an animated folder that opens to reveal the contained brand logo.

---

## 7. Background (`BackgroundAsset` + virtual backgrounds)

### 7.1 Scene background
`BackgroundAsset` elements `[observed CSS]`: `preview` `previewMedia` `previewGenerating`
`previewLogoBackdrop` `previewLogoForeground` `previewReveal` `previewRevealChild`
`previewRevealFading` `applyButton` `applyOverlay` `openRow` `openIcon` `openLabel`
`logoLayout` `footer` `root`.
→ Same tile pattern as `WidgetAsset`: generating → reveal animation → apply. It additionally
previews the brand **logo composited over** the generated background (`previewLogoBackdrop` /
`previewLogoForeground` / `logoLayout`).

| Property | Type | Default | Notes |
|---|---|---|---|
| `backgroundId` | uuid \| null | `null` | "Background ID to assign, or null to remove background from the scene" |
| aspect ratio | `16:9` \| `9:16` | **`16:9`** `[observed]` | "Output aspect ratio. Defaults to 16:9 for stream backgrounds; pick 9:16 for portrait scenes." |
| colors (generated) | hex[] | — | "Valid hex colors for the background. Solid uses the first color. Linear uses all colors as evenly distributed stops. GradientCloud uses the first four colors as two blended color pairs" `[observed]` |
| background type | `Solid` \| `Linear` \| `GradientCloud` `[observed]` | UNRESOLVED | — |

`[observed]` copy: `Background`, `Background added`, `Background removed`, `Background generated`,
`Background uploaded`, `Background not found`, `Background limit reached for this brand`,
`Hide main background`, `Reset background to transparent`.
Analytics `[observed]`: `Background Selected`, `Background Uploaded`.

### 7.2 Virtual backgrounds (per-participant camera effect)
`VirtualBackgrounds` (`root` `button` `buttonContainer` `isBlur`) + `GreenScreenForm`
(`button` `label` `link` `tip` `confirmationBox` `confirmationBoxIcon` `confirmationBoxSection`).
Per the established facts, **LUT and beautify controls live inside `GreenScreenForm` / `VirtualBackgrounds`** —
this is a camera-side effect, not an on-stream graphic, and is specified in the video-effects doc.

---

## 8. Overlay layer

Components: `Frame` `OverlayImage` `OverlayMode` `OverlayModePage` `OverlayVirtualEventsChat`

### 8.1 `Frame` — the universal manipulator
The single interaction primitive for **every** movable/resizable on-canvas element (widgets, logos,
QR codes, countdown, chat overlay). Elements `[observed CSS]`:
`content` `contentClip` `dragOverlay` `guideHorizontal` `guideVertical`
`resizeHandle` `resizeHandleTop/Bottom/Left/Right/TopLeft/TopRight/BottomLeft/BottomRight`
`resizeHandleKnob` `resizeHandleHidden` `resizeHandleDebug`
`isSelected` `isHighlighted` `isInteractive` `noChrome`.
→ 8 resize handles, drag-move, snap **alignment guides** (horizontal + vertical), a selected state,
a highlighted (hover) state, a non-interactive display mode, and a `noChrome` mode for rendering
without the manipulator (i.e. the live output).

### 8.2 `OverlayImage` — the on-stream image/video overlay
Elements `[observed CSS]`: `root` `in` `out` `visible` `shouldCover`.
→ Full-frame image or mp4 overlay with explicit enter (`in`) / exit (`out`) transition classes and a
cover-vs-contain fit toggle (`shouldCover`).

| Property | Type | Default | Notes |
|---|---|---|---|
| `overlayId` | uuid \| null | `null` | "Overlay ID to assign, or null to remove overlay from the scene" |
| fit | cover \| contain | UNRESOLVED | `shouldCover` |
| file type | image or **mp4** | — | mp4 overlays cannot be play-triggered: "Failed to show overlay: mp4 video overlays cannot be played", "Disabled mp4 overlay on scene" |
| show over video clips | boolean | UNRESOLVED | "Show graphics and captions on top of video clips" / "Display captions, messages, logos, and overlays while video clip is playing" |

`[observed]`: `Custom overlays require a paid subscription`, `Failed to add overlay: no permission to use paid features`,
`Failed to add overlay: wrong file type`, `Failed to select overlay: no permission to use paid features and selected id is not default`,
`Default overlays cannot be deleted.`, `Use overlays to add images and videos on top of your streams.`,
`Customize overlay`, `Delete overlay`, `Added overlay`, `Show portrait overlay`, `Hide portrait overlay`,
`Failed to generate transparent overlay`, `Failed to generate transparent overlay: empty response body`.
Analytics `[observed]`: `Show Overlay Over Video Clip Toggle Clicked`, `Change Product Overlay Type Clicked`.

### 8.3 `OverlayMode` / `OverlayModePage`
Both are `root`-only wrappers. A dedicated **overlay-only render route** — the studio composited
output rendered without editor chrome, for embedding as a browser source in OBS/vMix.
`[observed]` `Failed to init OverlayMode store`, `Bad overlay message received`,
`Received overlay message before connection initialized ${type}` → it is driven over a message channel.

### 8.4 `OverlayVirtualEventsChat`
`root`-only. The virtual-events chat variant rendered inside overlay mode.
UNRESOLVED: its configuration surface (no CSS elements and no distinct strings in the capture).

---

## 9. Themes (applies to captions, chat messages, name plates, ticker, QR)

`themeType` enum `[observed]`: **`DEFAULT` · `NEWS` · `ROUNDED` · `AIR`**

| Theme | Behaviour `[observed]` |
|---|---|
| `DEFAULT` | solid filled background; primary color visible on captions, QR codes, ticker, and participant names |
| `NEWS` | "news-strip layout with a primary-color stripe. Good for professional or news-style content." |
| `ROUNDED` | rounded solid fill; primary color visible |
| `AIR` | minimal / no chrome / clean — rendered by `AirCaption`; **primary color is NOT prominent** |

`[observed]` guidance string: "When the user wants their brand color to be visible on screen, prefer
DEFAULT, NEWS, or ROUNDED. Use Air only for explicit 'minimal' / 'no chrome' / 'clean' requests."
`[observed]` "Set the stream's theme type. Each theme has different visual behavior:"
`[observed]` "Set the base style for your on-screen captions, chat messages, and name-plates."
Set via `GraphicsViewStore.onThemeTypeChange` → `roomGraphicsService.setThemeType(e)`, pushing a
`RestoreOverlayElement` undo entry. `[observed]`

---

## 10. Chat on stream

Components: `ChatOverlayControls` `ChatOverlayCustomization*` `ChatOverlaySliderControl`

### 10.1 What it is
The Restream chat embed rendered as an on-stream layer, per scene, with its own position mode.

### 10.2 Properties

`[observed]` embed config schema (runtime-validated):
```js
{ alignmentTop:     boolean,
  backgroundOpacity: number,
  hideMessages:      number,
  messageOpacity:    number,
  scale:             number,
  theme:             string,
  token:             string,
  userId:            number }
```
Plus the studio-side scene options `[observed]`:

| Property | Type | Default | Notes |
|---|---|---|---|
| `shouldShowChatOverlay` | boolean | `false` `[inferred]` | "Whether to show the chat overlay on stream" / "Enable or disable the chat overlay (\"Show on stream\") for a specific scene." |
| `positionMode` | `ReservedSpace` \| `Freemove` `[observed]` | `ReservedSpace` `[inferred]` | "Position mode: \"ReservedSpace\" (chat stays in a fixed area that shifts the video layout) or \"Freemove\" (chat can be placed anywhere over the video)" |
| `position` | `[x,y]` 0–1 | — | "Normalized [x, y] position (0 to 1). Sets where the top-left corner of the chat overlay is placed. **Setting this automatically switches position mode to Freemove.**" |
| `padding` | px | UNRESOLVED (example `24`) | "Padding in pixels around the chat overlay (e.g. 24)" |
| `theme` | string | UNRESOLVED | "Visual theme for the chat overlay" |
| `scale` | number | UNRESOLVED | `ChatOverlaySliderControl` |
| `backgroundOpacity` / `messageOpacity` | number | UNRESOLVED | `ChatOverlaySliderControl` |
| `alignmentTop` | boolean | UNRESOLVED | — |
| `hideMessages` | number | UNRESOLVED | seconds-to-hide or max-count; "Hide message" / "Hide messages" |

Reserved-space width `[observed]`: `397 * c` (c = canvasWidth / reference) when
`positionMode === ReservedSpace`, which shifts the source layout.

### 10.3 Gating `[observed]`
- Customization is flag-gated: `shouldEnableChatOverlayCustomization` — when off, `chatOverlayOptions` is `null`.
- **Portrait**: "in portrait orientation, chat overlay uses default settings and customization options have no effect."

### 10.4 UI copy `[observed]`
```
Chat overlay              Chat Overlay              Chat overlay options
Toggle chat overlay       Hide chat overlay         Toggling chat overlay…
Loading chat overlay…     Updating chat overlay…
Chat overlay loaded       Chat overlay hidden       Chat overlay toggled      Chat overlay updated
Reset chat                Hide message              Hide messages
Show on stream
Easily embed our chat into your stream, then make it yours by choosing and customizing one of our overlays.
Get the chat overlay state for a specific scene, including whether it is enabled and its options.
```
Analytics `[observed]`: `Overlay Chat All Settings Clicked`, `Overlay Chat Demo Toggled`,
`Overlay Chat Toggle Clicked`, `Chat Overlay Options Changed`.
Errors `[observed]`: `Failed to update chat overlay options`, `Failed to update chat overlay options: No active scene`.
Demo/preview state is persisted `[observed]`: repository key `studio.chatOverlay.demoManuallyDismissed` (boolean, default `false`).

---

## 11. Other components in the widget bucket

### 11.1 `Alert` / `AlertContainer` — **in-app notification, NOT an on-stream graphic**
`Alert` elements `[observed CSS]`: `root` `title` `withTitle` `description` `icon` `column`
`actionButton` `lightSurface` and four variants: `isBanner` `isInfo` `isInfoWarning` `isWarning`.
`AlertContainer` is a `root`-only stack.
| Property | Values |
|---|---|
| `variant` | `info` \| `infoWarning` \| `warning` \| `banner` `[observed]` |
| `surface` | default \| `lightSurface` `[observed]` |
| `title` | optional (`withTitle` modifier) |
| `action` | optional button |
The one *on-stream* alert is the QR scan alert (§3): "Show alerts on stream",
"Studio will show an alert on the live stream whenever someone scans the QR code."

### 11.2 `Timer` / `LogoAndStatus` — host header status, NOT a stream graphic
`Timer`: `elapsedTime` `statContainer`.
`LogoAndStatus`: `logoAndStatus` `logoContainer` `studioLogo` `studioLogoActive` `studioLogoCompact`
`elapsedTime` `statContainer` `resolutionIndicator` `scheduledCountdown` `scheduledCountdownContainer`
`scheduledCountdownValue`.
→ Elapsed stream time, resolution badge, ON AIR state, and a countdown-to-scheduled-start readout.
`[observed]` `Stream duration`, `ON AIR`, `Show ON AIR`, `You can't change timer during a live stream`.
`[observed]` code: `countdownDurationMs` is exposed on `HostHeaderV2ViewModel` from `countdownService`;
`isCountdownActive = currentCount !== null && currentCount > 0`.

### 11.3 `Questionnaire` — onboarding, NOT a stream graphic
Elements `[observed CSS]`: `header` `headerIcon` `headerLabel` `headerCounter` `headerLeft`
`headerRight` `headerNavButton` `body` `footer` `continueButton` `badge` `badgeDraft`
`badgeSelected` `generatingBody` `generatingDots` `generatingLabel`.
→ A multi-step wizard with a step counter, prev/next nav, selectable/draft badge options, and a
"generating" state — the AI onboarding intake that produces scenes/graphics.

---

## 12. Cross-cutting rules for the build

1. **Every graphic slot is per-brand, assigned per-scene, nullable.** The universal contract is
   `assign(sceneId, assetId | null)`. `[observed]` for caption, ticker, QR, logo, overlay, background.
2. **Countdown scenes reject sources.** Camera/media placeholders, maximize, and undo are all
   blocked on Countdown scenes. `[observed]`
3. **mp4 assets (logo, overlay) render but cannot be play-triggered.** `[observed]`
4. **Reserved-space math must run before layout:** caption `216*c` vertical, ticker `48*(h/720)`,
   chat `397*c` horizontal. `[observed]`
5. **Undo is graphics-aware.** Ticker speed, theme type, and hide actions all push
   `RestoreOverlayElement` undo commands; ticker speed is debounced 600 ms into one entry. `[observed]`
6. **Paid gates:** custom logos, custom overlays, browser sources/widgets, >N widgets per scene,
   Restream-branding removal. Surfaced by `WidgetUpgradePopover`. `[observed]`
7. **Portrait mode degrades gracefully:** chat overlay ignores customization; countdown controls use
   `isPortraitOrientation`; `AirCaption` has `isPortrait`. `[observed]`

---

## 13. UNRESOLVED (must be decided or dug further)

- Numeric character limits: widget name/URL, caption primary/secondary text, ticker text, QR title/link, brand name.
- Numeric per-brand caps: captions, tickers, QR codes, logos, overlays, backgrounds, brands, browser sources.
- Countdown: default `durationMs`, default `scale`, default `backgroundOpacity`, default `musicVolume`.
  (Preset durations ARE resolved: 0/1/2/3/10/15 min, 10/30 sec.)
- QR: the literal `overlayMode` enum member names (behaviour resolved: qrcode_image vs qrcode_product)
  and the small-QR alignment option values.
- Chat overlay: default `theme` string, default `scale`/opacities, `hideMessages` semantics, default `padding`.
- Widget default `position` / `widthScale` / `heightScale` on insert; the hard "Too many browser source overlays" cap.
- `OverlayVirtualEventsChat` configuration surface — no CSS elements, no strings.
- `WidgetMoreOptionsMenu` item list and keyboard shortcuts.
- `WidgetsContent` empty-state copy.
- Logo `position` enum (presumed the same 9-cell grid as layouts: TopLeft…BottomRight).
- Background type enum membership beyond `Solid` / `Linear` / `GradientCloud`.
