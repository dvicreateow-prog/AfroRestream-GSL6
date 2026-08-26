# TOOLS-06 — The Right Tool-Rail Suite (Panel Tools)

Complete specification of every panel in the Restream Studio right-hand vertical tool rail.

**Sources** — refreshed chunks `357.fab32c9d675a47b1.js`, `575.971ebd8632e40587.js`,
`577.138b33ffcc7591a0.js`, `593.9f1e08299ec052cd.js` (2026-08-25 capture),
plus `114`, `897`, `699`, `restreamchatembedthemes`, `locale-en-US` from the
2026-08-24 `client-static/js` capture, and the 11,130-string dump
`SPEC-studio-ui-strings.md`.

Every line is tagged **[observed]** (literally present in a bundle / string dump) or
**[inferred]** (deduced from surrounding minified code, not a literal).

---

## 0. The tool rail itself

### 0.1 Tab id enum — `SidebarTabId` [observed]

Webpack module `12192`, export `X`. Verbatim from `593.9f1e08299ec052cd.js`:

```js
e.MOBILE_SOURCES             = "MobileSources"
e.SCENES                     = "Scenes"
e.MOBILE_PRIVATE_CHAT        = "MobilePrivateChat"
e.CHAT                       = "Chat"
e.VIRTUAL_EVENTS_CHAT        = "VirtualEventsChat"
e.CAPTIONS                   = "Captions"
e.GRAPHICS                   = "Graphics"
e.WIDGETS                    = "Widgets"
e.ECOMMERCE                  = "QrCodes"        // <- the QR Codes panel
e.GUESTS                     = "Guests"
e.ATTENDEES                  = "Attendees"
e.MUSIC                      = "Music"
e.COUNTDOWN                  = "Countdown"
e.NOTES                      = "Notes"
e.LAYOUT_CUSTOMIZATION       = "LayoutCustomization"
e.CHAT_OVERLAY_CUSTOMIZATION = "ChatOverlayCustomization"
e.THEME                      = "Theme"
e.HELP                       = "Help"
e.AI                         = "AI"
```

Sibling export `p` of module 12192: `new Set(["Music","Theme"])` — the tabs pinned to the
**bottom** of the rail. [observed]

**This is the complete set — 19 tab ids.** Beyond the 8 tools named in the brief the rail
also carries: **AI Assistant (Beta)**, **Widgets**, **Music**, **People/Guests**,
**Attendees**, **Scenes**, **Private Chat**, **Countdown**, **Customization (Beta)**,
**Chat settings**, and a **Settings** button that is not a tab. [observed]

### 0.2 Rail display order — `W4` / `z4` / `G4` [observed]

```js
const W4 = [GUESTS, AI, GRAPHICS, SCENES, MOBILE_SOURCES, VIRTUAL_EVENTS_CHAT,
            CAPTIONS, COUNTDOWN, LAYOUT_CUSTOMIZATION, CHAT_OVERLAY_CUSTOMIZATION,
            ECOMMERCE, MOBILE_PRIVATE_CHAT, MUSIC, NOTES, WIDGETS, CHAT,
            ATTENDEES, THEME, HELP];
z4 = e => { const t = W4.indexOf(e); return -1 === t ? W4.length : t; }
G4 = e => [...e].sort((a, b) => z4(a.id) - z4(b.id));
```
Unknown ids sort last. [observed]

### 0.3 Rail slots [observed]

| Slot | Prop | Contents |
|---|---|---|
| `topTabs` | `Le` | **People** (`GUESTS`) only |
| `tabs` | `De = G4(Be)` | main body, sorted by `W4` |
| `bottomTabs` | `n` | **Music**, **Theme** |
| `renderExtraBottomButton` | `Ue` | **Settings** (plain `<button>`, opens modal — not a tab) |
| `renderCustomIntercomButton` | inline | **Help**, `id="custom-intercom-launcher"` |
| `topComponent` | `Fe` | Sources component `_H` with `shouldShowRightSidebarMode:true`, `shouldShowSourcesTabMode:true` |
| `renderExtraTopButton` | (older `JQ` variant) | **Brand folder** button — tooltip copy `Brand folder`; shown when `shouldShowBrandsButton && brand && activeTab !== WIDGETS` |

```js
hiddenTabIds: [COUNTDOWN, LAYOUT_CUSTOMIZATION, CHAT_OVERLAY_CUSTOMIZATION,
               ...(shouldShowAiTab ? [] : [AI])]
```
These panels exist and can be activated programmatically but have **no rail button**. [observed]

Container flags: `tabWithHeader:true`, `darkMode:!scenesMode`, `lightDarkMode:scenesMode`,
`collapsable:true`, plus `disabledTabIds` + `disabledTabTooltip` passthrough. [observed]

### 0.4 Rail button labels and badges [observed]

Each rail button is `<button role="tab" aria-selected aria-controls=<tabId>>` wrapping
`<div class=tabComposition>` = optional icon + optional `<p>` label.
Icon/text visibility: `je = isDesktopViewport && tabElement !== "text"` (show text),
`Ie = !je || tabElement !== "icon"` (show icon). [observed]

| Tab id | Rail label | Panel title | Badge / indicator |
|---|---|---|---|
| `GUESTS` | `People` | (slot content) | source-count pill, `$1 source` / `$1 sources` |
| `ATTENDEES` | `Attendees` | — | sonar dot, title `New attendee` |
| `SCENES` | `Scenes` | — | — |
| `MOBILE_SOURCES` | `Sources` | — | source-count pill `$1 source` / `$1 sources` |
| `VIRTUAL_EVENTS_CHAT` | `Chat` | — | — |
| `CHAT` | `Chat` | — | sonar dot, title `Unread messages` |
| `CAPTIONS` | `Captions` | `Captions` + brand selector | — |
| `AI` | `AI` | `AI Assistant` + gradient `Beta` | — |
| `WIDGETS` | `Widgets` | `widgetsTabTitle` prop | `NEW` badge |
| `GRAPHICS` | `Graphics` | `Graphics` + brand selector | green `NEW` badge; seasonal `👻` (Halloween 2025) / `🎅` (Christmas 2024); infinite sonar `Unread messages` |
| `COUNTDOWN` | `Countdown` | — | hidden from rail |
| `LAYOUT_CUSTOMIZATION` | `Customization` + gradient `Beta` | — | hidden from rail |
| `CHAT_OVERLAY_CUSTOMIZATION` | `Chat settings` | — | hidden from rail |
| `ECOMMERCE` | `QR Codes` | `QR Codes` + brand selector | `NEW` badge |
| `MOBILE_PRIVATE_CHAT` | `Private Chat` | — | sonar dot `Unread messages` |
| `NOTES` | `Notes` | `Notes` + scene name | `NEW` badge, or non-animating sonar `Scene has notes` |
| `MUSIC` | `Music` | `Music` or `Music <highlight>AI<super>+</super></highlight>` | `🎅` Christmas-2025 badge; playing / paused status icon |
| `THEME` | `Theme` | `Theme` | — |
| `HELP` | `Help` | (Intercom) | numeric `notificationCounterBubble` |
| — | `Settings` | (modal) | extra bottom button |

### 0.5 Panel content components (minified refs, chunk 357) [observed]

`GUESTS`→`guestSlot` prop · `ATTENDEES`→`w2` · `SCENES`→`oV` · `MOBILE_SOURCES`→`guestSlot`
· `VIRTUAL_EVENTS_CHAT`→`mF` · `CHAT`→`NW` · `CAPTIONS`→`nG` ·
`AI`→`d7{debug, widgetGenerationMode}` · `WIDGETS`→`hQ` · `GRAPHICS`→`cq` ·
`COUNTDOWN`→`r1` · `LAYOUT_CUSTOMIZATION`→`U4` · `CHAT_OVERLAY_CUSTOMIZATION`→`aW` ·
`ECOMMERCE`→`QQ{ecommerceTabRef, advancedQrCodeItemRef}` ·
`MOBILE_PRIVATE_CHAT`→`pQ.b{isFullList:true}` · `NOTES`→`Nx` · `MUSIC`→`r0` · `THEME`→`g7`.

### 0.6 Deep-link into a panel — `?openSideBar=` [observed]

```js
const Zg = "openSideBar";
const em = new Map([
  ["widgets",   WIDGETS],  ["scenes",    SCENES],
  ["graphics",  GRAPHICS], ["chat",      CHAT],
  ["captions",  CAPTIONS], ["music",     MUSIC],
  ["countdown", COUNTDOWN],
]);
```
On match: `changeSidebarTabId(id)`; report `"Sidebar Deep Link Opened"` with `{target}`;
then `searchParams.delete("openSideBar")` + `history.replaceState`.
**Only these 7 values are accepted** — there is no deep link for QR Codes, Notes, Theme,
AI, Guests or Attendees. [observed]

### 0.7 Default active tab [observed]

```js
this.activeSidebarTabId =
    shouldHideSidebar                            ? null
  : hostExperimentsStore.shouldUseEcommerce      ? ECOMMERCE
  : viewportService.isDesktopViewport            ? GRAPHICS
  :                                                MOBILE_SOURCES;
```
A non-desktop viewport is forced back to `MOBILE_SOURCES`. [observed]

### 0.8 Side effects of `changeSidebarTabId(e)` [observed]

- `e !== AI && isAiChatInWidgetGenerationMode` → clear widget-generation mode
- `e === CHAT` → `hasUnreadChatMessages = false`
- `e === MOBILE_PRIVATE_CHAT` (non-desktop) → `hasUnreadPrivateChatMessages = false`
- `e === NOTES` → `isScenesNotesNewNotificationDismissed = true`
- `e === GRAPHICS` → `isHalloween2025GraphicsNotificationDismissed = true`
- `e === MUSIC` → `isChristmas2025MusicNotificationDismissed = true`
- `e === WIDGETS` → `isWidgetsNewNotificationDismissed = true`
- `e === GUESTS` → closes the audio-only onboarding popover if open

Auto-open observers [observed]: `featureStore.showFeature.meta.qrCodes` →
`changeSidebarTabId(ECOMMERCE, false, true)`; `featureStore.showSceneNotesTab.value`
and `featureStore.shouldOpenSceneNotesFromOnboarding.value` →
`changeSidebarTabId(NOTES, false, true)` (each calls `cleanupUrlParams()` first).

### 0.9 Analytics [observed]

`"Right Sidebar Button Clicked"` with `{element: <tabId>, action: "open" | "close"}`.
When the tab opened or closed is `NOTES`, three extra fields are attached:
`{hasText: noteLength > 0, noteLength, isAiGenerated}`.
Also observed: `"Sidebar Deep Link Opened"`, `"Edit Theme Button Clicked"`.

### 0.10 Cross-host sync [observed]

Every graphics-family panel broadcasts to co-hosts over the room connection:

```js
roomConnectionStore.messageOtherHosts({ type: "HOST_GRAPHICS_UPDATED", value: <kind> })
```
`<kind>` ∈ `overlays | stingers | captions | tickers | qrCodes | backgrounds | brands |
presentations | ecommerce`. Observers are debounced with `{equals: comparer, delay: 500}`.
Receiver dispatch:

| value | handler |
|---|---|
| `overlays` | `shouldEnableGraphicsUploadV2 ? overlaysStore.getAllV2() : overlaysStore.getAll()` |
| `stingers` | `videoClipsStore.getAll()` |
| `captions` | `genericCaptionsStore.getAll()` |
| `tickers` | `tickersStore.getAll()` |
| `qrCodes` | `qrCodesStore.getAll()` |
| `backgrounds` | `backgroundsStore.getAllBackgrounds()` |
| `brands` | `brandsStore.getBrands()` |
| `presentations` | `presentationsService.fetchPresentations()` |
| `ecommerce` | `ecommerce…` (store reset inside `runInAction`) |

---

## 1. QR CODES panel (`SidebarTabId.ECOMMERCE = "QrCodes"`)

Rail label **QR Codes** (+ `NEW` badge). Panel header: **QR Codes** followed by the brand
selector. Root component `QQ` = `CommerceContainer`, gated on
`hostExperimentsStore.shouldUseQrCodes`. [observed]

### 1.1 QR generation library — THERE IS NONE (server-rendered) [observed]

Exhaustive negative grep across all 37 bundles (both captures) for
`getBCHDigit`, `PATTERN_POSITION_TABLE`, `ALIGNMENT_PATTERN`, `errorCorrectionLevel`,
`QRMode`, `qrcodegen`, `qr-code-styling`, `qrcode.react`, `QRCodeStyling`, `typeNumber`
returns **zero hits**. The only `toDataURL` calls in the client are the avatar cropper and
the profile-picture cropper — neither is QR-related.

**QR bitmaps are produced by the Restream commerce backend as SVG** and consumed as image
URLs: [observed]

```js
// restream.887ca3d5bcd09a3a.js — CommerceBackendClient
getQrCodeLink(productId) {
  return productId
    ? `${this.host}/v2/public/assets/products/${productId}/qr.svg`
    : `${this.host}/v2/public/links/sp/qr.svg`;
}
```
```js
// 114.15f34f2a5005b32d.js — stage renderers
qrCodeLink: `${commerceHost}/v2/public/assets/products/${product.id}/qr.svg`
```
For plain (non-product) QR entries the backend returns the URL directly on the entity:
`QrCodeWithUrlIO = QrCodeIO & { qrCodeUrl: string }`, and the client just does
`<img class="QrCodeOption_image" src={qrCodeUrl} alt="">`. [observed]

The store builds that URL through two shared helpers: [observed]
```js
this.renderQrCode  = IqI(Boolean(featureStore.appId.value), <default renderer>);
this.prepareQrCode = qr => AY5(this.renderQrCode(qr), featureStore.ecommerceBackendUrl.value);
```
**UNRESOLVED:** `IqI` / `AY5` live in a shared `@restream` package that is not present in
this capture, so the precise query-string the client appends to `qr.svg`
(size, margin, ECC level, fg/bg colour, embedded logo) **cannot be recovered from disk**.
No such parameters appear anywhere in the client code. [observed absence]

**Consequence for a clone:** error-correction level, module size, quiet-zone and colour of
the QR matrix are **not client-side options at all** — they are backend defaults. The only
visual controls the Studio UI exposes are listed in section 1.5.

### 1.2 Data model — `QrCodeIO` [observed]

From `externals.b634d3e8690cf1f3.js` (module `38662`, io-ts codecs):

```js
QrCodeIdIO                = brand(string, ..., "QrCodeIdIO")
CommerceBackendQrCodeIdIO = brand(string, ..., "CommerceBackendQrCodeIdIO")

QrCodeIO = readonly(type({
  id:               QrCodeIdIO,
  commerceQrCodeId: CommerceBackendQrCodeIdIO,   // id in the commerce backend
  title:            string.pipe(StringMaxLength(l)),
  shouldShowTitle:  boolean,
  link:             string.pipe(StringMaxLength(u)),
  brandId:          BrandIdIO,
}, "QrCodeIO"))

QrCodeWithUrlIO = readonly(intersection([QrCodeIO, type({ qrCodeUrl: string })]))
```
`l` and `u` are both `Infinity` in the shipped bundle — the real caps are enforced in the
store (1.3), not by the codec. [observed]

A QR code **belongs to a brand** (`brandId`) — hence the "No active brand" failure mode.
Scene assignment is a separate field on the scene (`ClientSceneQrCodeIO`); the brand
carries `qrCodeId` for the non-scene (global) selection. [observed]

### 1.3 Limits and defaults — module `92140` [observed]

```js
// 92140 exports
ih = 6      // default max QR codes per brand
jK = 18     // default max TITLE length (characters)
Ro = 1000   // default max LINK length (characters)
class QrCodesStoreError extends StudioError {}
class QrCodeRequestTimeoutError extends QrCodesStoreError {}
```

Server-overridable via user feature flags: [observed]
```js
get maxTitleLength() { return userStore.user?.features.studioMaxQrCodeTitleLength ?? 18;   }
get maxLinkLength()  { return userStore.user?.features.studioMaxQrCodeLinkLength  ?? 1000; }
get canAddQrCode()   {                                   // on Brand
  return this.qrCodes.size < (userStore.user?.features.studioMaxQrCodesPerBrand ?? 6)
      && Boolean(userStore.accountActions?.createQrCodes);
}
```

| Setting | Default | Feature-flag override |
|---|---:|---|
| Max QR codes per brand | **6** | `features.studioMaxQrCodesPerBrand` |
| Max title length | **18** chars | `features.studioMaxQrCodeTitleLength` |
| Max link length | **1000** chars | `features.studioMaxQrCodeLinkLength` |
| Permission to create | — | `accountActions.createQrCodes` (boolean) |

### 1.4 Panel structure [observed]

```
CommerceContainer (QQ)
├── CommerceSidebar  (module 49089, export rI — the e-commerce product list)
│     ├── renderSection(children, title, onAdd)  -> QrCodesSection accordion
│     ├── renderQrCodes()                        -> QrCodesContent  (the QR list)
│     ├── advancedQrCodeItemRef                  -> "QR code + image" entry
│     └── props: onAddProductClick, onEditProductClick, onDeleteProductClick,
│                onOverlayModeChangeClick, onSelectedProductChangeClick,
│                onSettingNotificationOnBuyingChangeClick,
│                onSettingPushDataToChatChangeClick,
│                state, eventId, studioStatus, enableGroupFetch,
│                scenesMode, darkTheme, showOverlayModeToggle:false
└── OverlayModeToggle (module 4585 -> chunk 114) — Compact | Classic
      rendered only when !shouldHideOverlayModeToggle
```
`studioStatus` is `"INIT" | "READY" | "UNKNOWN"` mapped from `hostStore.status`
(`INIT -> "INIT"`, `PREVIEW -> "READY"`, else `"UNKNOWN"`). [observed]

`shouldHideOverlayModeToggle` = `shouldShowScenes && !showScenesHiddenFeatures && !scenesUnlockCommerceOverlayMode`. [observed]

In `isEditMode` (scene editor) the container renders **only** the QR list — the whole
e-commerce product sidebar and the overlay-mode toggle are omitted. [observed]

### 1.5 Every control in the QR panel [observed]

#### `QrCodesSection` — collapsible group header
| Control | Type | Copy / behaviour |
|---|---|---|
| Accordion toggle | button + triangle-arrow icon | Title text is `QR code` (singular) for the plain QR group; expanded by default (`useState(true)`) |
| Add | button, plus icon | Label `Add`. Rendered only when `canAdd`; clicking also force-expands the accordion |

#### `QrCodeForm` — the add / edit form
| # | Control | Type | Attributes | Default | Copy |
|---|---|---|---|---|---|
| 1 | Title | `<input type="text">` | `name="liveStudioQrCodeTitle"`, `required`, `aria-label="Title"`, autofocused on mount | `initialValue.title ?? ""` | placeholder `Title` |
| 2 | Link | `<input type="url">` | `name="liveStudioQrCodeLink"`, `required`, `aria-label="Link"` | `initialValue.link ?? ""` | placeholder `https://website.com` |
| 3 | Show title | toggle / switch | — | **`true`** on add (`initialValue.shouldShowTitle ?? true`); reset to `false` after submit/cancel | label `Show title` (hard-coded English, **not** wrapped in the i18n helper) |
| 4 | Cancel | button | — | — | `Cancel` |
| 5 | Submit | button, `disabled={!isValid}` | — | — | `Add` on create, `Save` on edit |

Validation, exactly as coded: [observed]
```js
titleTooLong = title.length > maxTitleLength;
linkTooLong  = link.length  > maxLinkLength;
looksOdd     = (() => { try {
     const u = new URL(link);
     return link.replace(`${u.protocol}//`, "")
                .replace(u.search, "").replace(u.hash, "").includes("://");
   } catch { return false; } })();
isValid = link.length > 0 && title.length > 0 && !titleTooLong && !linkTooLong;
```
`looksOdd` is a **warning only** — it does not block submit.

Inline messages: [observed]
- error: `Maximum title length is %s characters` (`%s` -> `maxTitleLength`)
- error: `Maximum link length is %s characters` (`%s` -> `maxLinkLength`)
- warning: `The link looks odd. Please make sure it’s valid.` (curly apostrophe)

CSS-module hooks: `QrCodeForm_hasError__jo4xV`, `QrCodeForm_hasWarning__lkOGb`,
`QrCodeForm_error__nbEYE`, `QrCodeForm_warning__8HdP1`, `QrCodeForm_limit__giZ5Y`,
`QrCodeForm_counterContainer__RLPCs`, `QrCodeForm_togglik__-Lwzb`. [observed]

#### `QrCodeOption` — one row in the list
| Element | Detail |
|---|---|
| Thumbnail | `<img class="QrCodeOption_image" src={qrCodeUrl} alt="">` |
| Primary text | `title` (truncated with `QrCodeOption_truncate`) |
| Secondary text | `link` (truncated) |
| Show / Hide action | whole row is a `<button>`; label flips `Show` / `Hide` by `isSelected`. Handler is **debounced 175 ms** |
| Kebab menu | Edit + Delete with inline delete-confirmation state (`isOpenDeleteConfirmation`) |
| Drag handle | `QrCodeOption_dragHandle`, shown when `isDraggable` |
| a11y | `aria-selected={isSelected}`, `data-testid={id}` |

#### `DraggableQrCodeList`
`react-beautiful-dnd` `Droppable droppableId="qr-codes"`. Per-item aria labels: [observed]
`Draggable #{index+1} qr code` / `Dragging #{index+1} qr code`.
Reorder calls `onReorder(sourceIndex, destinationIndex)` -> analytics `"QR Code Re-ordered"`
-> `Brand.updateQrCodeOrder` (or `QrCodesStore.updateQrCodeOrder`) ->
`qrCodeRepository.updateIdsOrder([...ids])`, logged as `Synced QR codes order`.

#### `OverlayModeToggle` — the Classic / Compact switch
Enum (io-ts name `"EcommerceOverlayMode"`): [observed]
```js
e.DEFAULT = "default"   // UI label: "Classic"   — RIGHT option
e.COMPACT = "compact"   // UI label: "Compact"   — LEFT  option
```
- Default in the codec: `withDefault(EcommerceOverlayMode, DEFAULT)` -> **`"default"` (Classic)**.
- `activeOption = mode === DEFAULT ? Right : Left`.
- In sidebar mode each option is icon **plus** text (`Classic` / `Compact`); on the stage
  overlay it is icon-only. [observed]
- Forced override: in **portrait** preview with
  `shouldEnableForceDefaultEcommerceOverlayToCompactInPortraitOverlay` the mode is coerced
  to `COMPACT` regardless of the stored value. [observed]
- Persisted to the brand: `brandsStore.mainBrand.update({ commerce: { overlayMode } })`,
  and pushes an undo entry (`UndoAction.RestoreOverlayElement`) restoring both the brand
  field and the previous `ecommerceProductState`. [observed]
- Analytics on change: `"QR Overlay Mode Selected"` with
  `{source:"right_sidebar", overlay_mode, element: isAdvancedQrCode ? "qrcode_image" : "qrcode_product"}`. [observed]

#### Placement on stage
The plain ("small") QR overlay has **two positions only** — it is pinned to the top corner
*opposite* the logo: [observed]
```js
LogoPosition = { TopLeft: "TopLeft", TopRight: "TopRight" };   // default TopRight
qrPosition   = logoPosition === TopRight ? TopLeft : TopRight;
onQrAlignClick = pos => {
  report("Small QR Code Align Option Clicked", {currentPosition: qrPosition, newPosition: pos});
  setLogoPosition(pos === TopRight ? TopLeft : TopRight);   // moving the QR moves the logo
};
```
There is **no free-form X/Y placement and no size slider** for the small QR. [observed]

Stage geometry, from `114.04f1c5972789cfd9.css` (px at 1080p, multiplied by
`--streamScaleRatio` and `--previewScaleRatio`): [observed]
```css
.QrCodeOverlay_root    { width: calc(90.6666666667px * ratio * previewRatio); height: fit-content }
.QrCodeOverlay_imageBox{ padding: calc(5.3333333333px * ratio); height: calc(90.6666666667px * ratio);
                         background-color:#fff; display:flex; align-items:center; justify-content:center }
.QrCodeOverlay_image   { width:100%; height:100%; transform: rotate(180deg) }
.QrCodeOverlay_title   { background: var(--primaryColor); color: var(--contrastPrimaryColor);
                         font-weight:600; font-size: calc(12px * ratio); line-height:1.2;
                         text-align:center; text-transform:uppercase;
                         letter-spacing: calc(.0266666667em * ratio);
                         padding: calc(8px*ratio) calc(4px*ratio); overflow-wrap:break-word }
.QrCodeOverlay_title.transparentBackground { background:none; color:#fff;
                         text-shadow: 0 0 2px rgba(0,16,40,.7) }
.QrCodeOverlay_overlay.isFocused { outline: 2px solid rgba(255,255,255,.75) }
```
**Colours are not per-QR-code options.** The QR module is always black-on-white (white
`imageBox`); the *title bar* takes the stream `--primaryColor` from the Theme panel
(section 5) and its text uses the auto-computed contrast colour (`dark: "#181818"`). [observed]
There is **no logo-in-centre control** anywhere in the client. [observed absence]

### 1.6 Per-scene assignment [observed]

The QR selection is written to a **scene** when the sidebar is in scene-edit mode,
otherwise to the brand:
```js
get writeTarget() { return resolveWriteTarget(brandsStore.mainBrand,
                                              sceneEditModeStore.isEditMode,
                                              sceneEditModeStore.editingSceneId); }
// kinds: Scene | Brand | Blocked
onQrCodeShow = id => {
  if (writeTarget.kind === Blocked) return;
  const sceneId = writeTarget.kind === Scene ? writeTarget.scene.id : undefined;
  report("Preview Element Show Clicked", {element:"qrcode_small", source:"right_sidebar"});
  roomGraphicsService.setQrCodeById(id, sceneId);
  undoService.add(RestoreOverlayElement, {restore: () => setQrCodeById(prevId, sceneId)});
};
```
`selectedQrCodeId` resolution order: `editingScene.qrCode?.id`, else
`qrCodesStore.qrCode?.id`. The preview-click path resolves
`editingScene?.qrCode?.id ?? brandsStore.mainBrand?.scene?.qrCode?.id ?? qrCodesStore.qrCode?.id ?? null`. [observed]

Deselect / global path: `RemoteQrCodesRepository.select(id)` ->
`brandStore.mainBrand.update({ qrCodeId: id })`; `deselect()` -> `update({ qrCodeId: null })`. [observed]

Scene-assignment copy (AI-tool descriptions and toasts): `Assign a QR code to a specific
scene. Applies the QR code to the specified scene.` / `QR code ID to assign, or null to
remove QR code from the scene` / `Scene QR code`, `Scene QR code set`,
`Setting scene QR code…`. [observed]

### 1.7 "Show QR code scan alerts on stream" [observed]

**Not in the QR panel** — it is a field in the Studio **Settings** modal
(`575.971ebd8632e40587.js`, stream-settings fieldset), rendered only when
`shouldShowShowQrCodeScanAlerts`:

```jsx
<Field id="shouldShowQrCodeScanAlerts"
       label={t("Show QR code scan alerts on stream")}
       info={t("Studio will show an alert on the live stream whenever someone scans the QR code.")}
       checked={Boolean(shouldShowQrCodeScanAlerts)}
       onChange={onShouldShowQrCodeScanAlerts} />
```
Sibling field in the same fieldset (the `id` is duplicated in the source — a shipped bug):
```jsx
<Field id="shouldShowQrCodeScanAlerts"                 // <-- duplicate id [observed]
       label={t("Push product links to live chat")}
       info={t("A product link will be pushed to the chat on the product select.")}
       checked={Boolean(shouldPushProductLinksToChat)}
       onChange={onShouldPushProductLinksToChat} />
```
Analytics event: `"Show QR Code Scan Alert On Stream Toggle Clicked"`.
Failure log: `Failed to toggle show QR Code scans alert toggle`. [observed]

Persisted as `EcommerceProductSettingsIO.shouldShowAlertOnStream` (io-ts default **`true`**),
mirrored to `notificationOnBuying` (also default `true`) — the view store writes both:
`shouldShowAlertOnStream: Boolean(notificationOnBuying ?? shouldShowAlertOnStream)`. [observed]

#### The on-stream alert itself (`EcommerceViewedAlert`, chunk 114) [observed]
Four message templates:
- `Someone scanned the QR code`
- `$count viewers scanned the QR code`
- `Someone purchased the product`
- `$count product purchases`

Alert auto-dismisses after **8000 ms**. Demo/dev loop injects a fake
`ECOMMERCE_PRODUCT_VIEWED` alert every **2000 ms** with
`viewsCount = Math.floor(3*Math.random())+1`. Icon asset
`5bbd2579cdf53f9c59767ee1b76ecb97.svg`. CSS module `EcommerceViewedAlert_*`
(`root/content/effect/lines/line/message/icon`), scaled by
`--scale = streamScaleRatio * previewScaleRatio`. [observed]

### 1.8 Exact error / status strings [observed]

Toasts raised by `QrCodesViewModel`, with their `toastId`s:

| Trigger | `toastId` | Copy |
|---|---|---|
| add — duplicate | `QR_CODE_ADD_ALREADY_EXISTS_ERROR` | `QR code with given title and link already exists` |
| add — over limit | `QR_CODE_ADD_TOO_MANY_ERROR` | `You've exceeded the maximum number of QR codes` |
| add — other | `QR_CODE_ADD_UNEXPECTED_ERROR` | `Failed to add QR code. Please try again or contact support` |
| edit — duplicate | `QR_CODE_EDIT_ALREADY_EXISTS_ERROR` | `QR code with given title and link already exists` |
| edit — vanished | `QR_CODE_EDIT_NOT_FOUND_ERROR` | `Edited QR code no longer exists` |
| edit — other | `QR_CODE_EDIT_UNEXPECTED_ERROR` | `Failed to add QR code. Please try again or contact support` — **re-uses the "add" copy; shipped bug** |
| delete | (title+message toast) | title `Failed to delete QR code.` / message `Something went wrong. Please try again or contact support.` |
| overlay-mode save | `STUDIO_ECOMMERCE_UPDATE_STATE_UNEXPECTED_ERROR` | `Oops, unable to update settings. Please try again, or contact support for help.` |

Thrown, not toasted: `Error("Failed to add QR code: No active brand")` — raised by
`onQrCodeAdd` when `brandsStore.brand` is null. [observed]

Log lines emitted by `QrCodesStore` (exact, with field payloads): [observed]
```
Failed to add Qr code: Title is too long      { qrCode, maxLength }
Failed to add Qr code: Link is too long       { qrCode, maxLength }
Failed to edit QR code: Title is too long     { qrCode, maxLength }
Failed to edit QR code: Link is too long      { qrCode, maxLength }
Added QR code                                 { addedQrCode }
Optimistic QR Code edit                       { edited }
Successful QR Code edit                       { qrCode }
Failed to edit QR code. Reset previous QR code data { qrCodeBeforeEdit, edited }
Didn't update QR Code: content didn't change  { qrCodeBeforeEdit }
Unable to edit QR Code: Not found             { qrCodeBeforeEdit }
Got QR codes                                  { qrCodes }
Optimistic QR code delete                     { id }
Successful QR code delete                     { id }
Refetching QR codes: Failed to delete QR code { id }
Failed to refetch QR codes after delete failure { id }
Failed to sync QR code order after delete     { id }
Unable to remove QR code: does not exist      { id }
Set QR Code / Set QR code                     { id, qrCode }
Failed to select QR Code. Id does not exist   { id }
Unable to change order: no item with specific index { entries, oldIndex, newIndex }
Synced QR codes order                         { idsOrder }
```
Two casings ship side by side: `Failed to add Qr code:` (lowercase r) for the length
guards vs `Failed to add QR code:` for the brand guard. Both are literal. [observed]

Additional QR strings present in the dump whose render site is outside the studio chunks
(they live in `restream.887ca3d5bcd09a3a.js` / `Index.*.js`): [observed]
`QR code + image`, `Create QR code + image`, `Create QR code`, `Creating QR code…`,
`Editing QR code…`, `Removing QR code…`, `Loading QR codes…`, `QR codes loaded`,
`Engage with QR codes`, `Nice! To create a product QR code manually: `,
`Too many QR codes`, `QR code hidden`, `QR code removed`, `QR code created`,
`QR code edited`, `Added QR code`, `Failed to undo QR code hide`,
`Unable to change QR code order: No item with specific indexes`,
`Unable to change QR codes order: failed to find index in complete list`,
`Failed to set Qr Code: Not found`, `Sorry, we can not scan this store.`,
`Sorry, we can’t scan this website.`, `We can’t scan this store as it’s not public.`,
`Wait until an image scan is complete and findings can be accessed`.

### 1.9 Backend calls — `RemoteQrCodesRepository` [observed]

```js
create(qr, t, false) -> backendClient.addQrCode(qr, t, false)
update(qr)           -> backendClient.editQrCode(qr)
delete(id)           -> backendClient.deleteQrCode(id)
readAll()            -> backendClient.getQrCodes()
updateIdsOrder(ids)  -> backendClient.updateQrCodesOrder(ids)
select(id)           -> brandStore.mainBrand.update({ qrCodeId: id })
deselect()           -> brandStore.mainBrand.update({ qrCodeId: null })
```
Every mutating call uses the same retry policy: [observed]
```js
{ maxAttempts: 1, delay: 200, throttleFactor: 1.5, maxDelay: 20000,
  createTimeoutError: QrCodeRequestTimeoutError.fromData("Failed to retry task: Timed out") }
```

### 1.10 The "advanced" / product QR (`isAdvancedQrCode`) [observed]

A second QR flavour flows through the e-commerce product model, not `QrCodeIO`:

```js
EcommerceProductIO = intersection([
  type({ id: EcommerceProductIdIO, title: string,
         isAdvancedQrCode: withDefault(boolean, false) }),
  partial({ image, description, price, oldPrice,
            inStock: withDefault(boolean, true), discount, currency })
], "EcommerceProductIO")

EcommerceProductSettingsIO = intersection([
  type({ shouldShowAlertOnStream: withDefault(boolean, true),
         pushDataToChat: boolean,
         currentlyWatchingProductPage: boolean,
         countOfBookmarks: boolean,
         automaticallyAddToTheCart: boolean,
         enableQRCode: boolean,
         showPrice: boolean,
         showDiscount: boolean,
         disableBackground: boolean,
         scale: number }),
  partial({ notificationOnBuying: withDefault(boolean, true) })
], "EcommerceProductSettingsIO")

EcommerceProductStateIO = EcommerceProductSettingsIO
                        & { product: withDefault(union([EcommerceProductIO, null]), null) }
                        & partial({ productId: union([EcommerceProductIdIO, null]) })

ClientSceneEcommerceIO  = type({ overlayMode: EcommerceOverlayMode,
                                 isAdvancedQrCode: boolean, ... })
```
`isAdvancedQrCode: true` is the "QR code + image" entry: the product card renders as a QR
panel with the product image behind it. The stage element id switches from
`qrcode_product` to `qrcode_image` for analytics, and the stage container adds the
`isAdvancedQrCode` CSS modifier. [observed]

Advanced-QR onboarding: `hostPageViewStore.isAdvancedQrOnboarding` drives a coach-mark
anchored on `advancedQrCodeItemRef`; showing any QR while it runs calls
`finishAdvancedQrCodeOnboarding()` -> `onAdvancedQrCodeOnboardingFinish()`. CSS module
`QrCodeOnboarding_*` exists. Analytics: `AdvancedQrCodeOnboardingFinish`,
`AdvancedQrCodeOnboardingClose`. [observed]
**UNRESOLVED:** the coach-mark body copy is not present in any bundle in this capture —
module `49089` (`CommerceSidebar`) resolves to an external `@restream` commerce-sidebar
package that was not downloaded.

### 1.11 QR analytics events (complete) [observed]

`QR Code Add Clicked {qrCode}` · `QR Code Edit Clicked {qrCode}` ·
`QR Code Remove Clicked {qrCode}` · `QR Code Re-ordered` ·
`QR Overlay Mode Selected {source, overlay_mode, element}` ·
`Small QR Code Align Option Clicked {currentPosition, newPosition}` ·
`Show QR Code Scan Alert On Stream Toggle Clicked` ·
`Preview Element Show Clicked {element:"qrcode_small", source:"right_sidebar"}` ·
`Preview Element Hide Clicked {element:"qrcode_small", source:"preview_controls"|"right_sidebar"}` ·
`Preview Element Replace Clicked {element:"qrcode_small"|"qrcode_product"|"qrcode_image", source}`.

### 1.12 AI-Assistant tools for QR codes (`QrCodeToolsService`) [observed]

Four tools exposed to the in-studio LLM, verbatim descriptions and schemas:

| Tool | Description | Input schema |
|---|---|---|
| `get_qr_codes` | `Get all QR codes` | `{}` |
| `create_qr_code` | `Create a new QR code` | `title: string.max(maxTitleLength)` = "QR code title"; `link: string.max(maxLinkLength)` = "URL the QR code points to"; `shouldShowTitle: boolean` = "Whether to display the title on stream" |
| `edit_qr_code` | `Edit an existing QR code` | `id: string` = "QR code ID", plus the three create fields |
| `delete_qr_code` | `Delete a QR code` | `id: string` = "QR code ID" |

`stateSnapshot` handed to the model: `{ qrCodes: [{id, title, link}], selectedQrCodeId }`.
`get_qr_codes` additionally returns `shouldShowTitle` per entry. [observed]

Error constants returned to the model: `No active brand`, `QR code limit reached`,
`QR code with given title and link already exists`, `QR code not found`. On a duplicate
during `create_qr_code` the tool degrades to
`{success:true, warning:"QR code with given title and link already exists", id:<existingId>}`
rather than failing. [observed]

---

## 2. CAPTIONS panel (`SidebarTabId.CAPTIONS = "Captions"`)

Rail label **Captions**. Panel title **Captions** + brand selector.
Component `nG` -> `CaptionsContent` (`sG`), fed by `AbstractCaptionsViewStore`. [observed]

### 2.0 IMPORTANT — this is NOT speech-to-text [observed]

The brief anticipated an ASR provider, a language list and a profanity filter. **None of
those exist in this capture.** Exhaustive grep across all 37 bundles for
`Speechmatics`, `AssemblyAI`, `Deepgram`, `Whisper`, `Symbl`, `rev.ai`, `Google Speech`,
`liveCaption*`, `autoCaption*`, `captionsLanguage`, `transcriptionLanguage`,
`Closed Caption` returns **zero hits**. The only `Transcription` strings in the whole dump
belong to the *recordings* product (`Cloud recordings + Transcription`,
`Invalid file for transcription`, `Transcription failed`), not to the Studio panel.
`Profanity` appears exactly once in the dump and is a plain dictionary word inside a word
list, not a control. [observed absence]

The Studio "Captions" tool is a **lower-third / ticker text-overlay manager**: manually
authored text banners. It has exactly two sections.

### 2.1 Section 1 — "Lower Third" [observed]

- Header title: `Lower Third`
- Info tooltip (`id="lowerThirdInfo"`): `Static text on preview`
- `Add` button when `canAddCaption` (= `brand.canAddGenericCaption`)
- Body: `CaptionSelect` -> `DraggableCaptionList` (`droppableId="captions"`)

### 2.2 Section 2 — "Ticker" [observed]

- Header title: `Ticker`
- Info tooltip (`id="tickerInfo"`): `Scroll text across bottom`
- `Add` button when `canAddCaption` (**note: the code passes `canAdd:s` — the *caption*
  flag — to the Ticker section too, even though `canAddTicker` exists on the view store
  and is passed down; the ticker section's add button is therefore gated on the caption
  permission. Shipped bug.**) [observed]
- `extraControl`: the **ticker speed control**, rendered when `shouldEnableTickerSpeedControl`
- Body: `CaptionSelect` with `isTicker: true`

### 2.3 `CaptionForm` — add / edit [observed]

Two shapes, switched by `isTicker`:

**Lower-third mode (`isTicker = false`)**
| # | Control | Type | Attributes | Copy |
|---|---|---|---|---|
| 1 | Primary text | `<input type="text">` | `name="liveStudioCaptionText"`, `required`, autofocused, `aria-label="Primary text"` | placeholder `Primary text` |
| 2 | Secondary text | `<input type="text">` | `name="liveStudioCaptionSecondaryText"`, optional, `aria-label="Secondary text"` | placeholder `Secondary text (optional)` |
| 3 | Cancel | button | — | `Cancel` |
| 4 | Submit | button, `disabled={!valid}` | — | `Add` / `Save` |

**Ticker mode (`isTicker = true`)**
| # | Control | Type | Attributes | Copy |
|---|---|---|---|---|
| 1 | Text | `<textarea>` | `name="liveStudioCaptionText"`, `required`, autofocused, `aria-label="Type your text here"` | placeholder `Type your text here` |
| 2 | Character counter | `<aside class=CaptionForm_limit>` | shows `{length} / {maxChars}`; the number turns `CaptionForm_invalid` when over | — |
| 3 | Cancel / Submit | as above | — | — |

Validation: [observed]
```js
tooLong          = text.length > maxChars;
secondaryTooLong = secondaryText.length > maxChars;
valid            = text.length > 0 && !tooLong && !secondaryTooLong;
```
Over-length error (lower-third mode only — the ticker uses the counter instead):
`Maximum text length is %s characters` (`%s` -> `maxChars`). [observed]
On submit the form calls `onSubmit(text, secondaryText.length > 0 ? secondaryText : undefined)`
and clears both fields. [observed]

### 2.4 Limits [observed]

| Store | `limit` (max items) | `maxChars` | `limitBytes` |
|---|---:|---:|---:|
| `GenericCaptionsStore` | **300** | **240** | — |
| `TickersStore` | **300** | **1000** | **500 000** |

Per-brand add permission: [observed]
```js
Brand.canAddGenericCaption = captions.size < (features.studioMaxCaptions ?? 0)
                          && Boolean(accountActions.createCaptions);
Brand.canAddTicker         = tickers.size  < (features.studioMaxCaptions ?? 0);
```
Both use the **same** `studioMaxCaptions` feature flag; default `0` means the buttons are
hidden unless the plan grants a quota. [observed]

### 2.5 Ticker speed control (module `55964`, chunk 114) [observed]

A collapsible pill that expands into a `SimpleSlider`:

| Property | Value |
|---|---|
| min | **0.4** |
| max | **2.5** |
| step | **0.1** |
| thumb size | 12 px |
| value format | `` `${Number.isInteger(v) ? v : v.toFixed(1)}x` `` -> e.g. `1x`, `1.4x` |
| collapsed label | `Speed` (hard-coded, **not** i18n-wrapped) |
| expand button aria | `Change ticker speed` |
| collapse button aria | `Close ticker speed control` |
| slider aria | `Ticker speed` |
| tooltip when disabled | `Not available while editing a scene` (reason enum `TickerSpeedDisabledReason.SceneEditMode`) |
| behaviour | `shouldShowValueOnHover`, auto-focus on expand, click-outside collapses |

Change path: `onTickerSpeedChange(value, TickerSpeedSource.Sidebar)`. The view store keeps an
undo session: `startTickerSpeedUndoSession` / `scheduleTickerSpeedUndoCommit` /
`commitTickerSpeedUndo` with `tickerSpeedUndoBaseline` and `latestTickerSpeed`. [observed]

### 2.6 Data model [observed]

```js
CaptionType = { GENERIC: "GENERIC", CHAT: "CHAT" }

GenericCaptionBodyIO = readonly(intersection([
  type({ id: string, text: string }),
  partial({ secondaryText: string, brandId: union([BrandIdIO, null]) })
], "GenericCaptionBodyIO"))

GenericCaptionIO = readonly(intersection([
  type({ type: enumCodec("CaptionType", CaptionType, GENERIC) }),
  partial({ isDefault: boolean }),
  GenericCaptionBodyIO ], "GenericCaptionIO"))

ChatCaptionBodyIO = readonly(intersection([
  type({ avatarUrl: string|null|undefined, author: string,
         content: string, platformIcon: string|undefined }),
  partial({ id: string, isSystemMessage: boolean, isHostMessage: boolean })
], "ChatCaptionBodyIO"))

ChatCaptionIO = readonly(intersection([
  type({ type: enumCodec("CaptionType", CaptionType, CHAT) }), ChatCaptionBodyIO ]))

CaptionIO = union([GenericCaptionIO, ChatCaptionIO], "CaptionIO")
```
The `CHAT` caption type is how a **chat message gets pinned onto the stage as a lower
third** — that is the bridge between the Chat panel and the Captions renderer. [observed]

Tickers: [observed]
```js
TickerBodyIO = readonly(intersection([ type({ id: string, text: string }),
                                       partial({ brandId: BrandId|null|undefined }) ]))
TickerIO     = readonly(intersection([ TickerBodyIO, partial({ isDefault: boolean }) ]))
TickerV2PayloadIO = readonly(type({ tickerId, text, scrollSpeed: number,
                                    brandId: union([BrandId, null]) }))
```

### 2.7 List item + reorder [observed]

`DraggableCaptionList`, `droppableId="captions"`, per-item aria
`Draggable #{n} caption` / `Dragging #{n} caption`. Items expose `{id, text, secondaryText}`.
Reorder -> analytics `"Generic Caption Re-ordered"` (captions) and the ticker equivalent,
then `Brand.updateGenericCaptionOrder` / `Brand.updateTickerOrder`
(falling back to the store's own `updateCaptionOrder` / `updateTickerOrder`). [observed]

### 2.8 Error / log strings [observed]

```
Failed to add caption. Text is too long            { text, length, maxCharsPerCaption }
Failed to add caption. Secondary text is too long  { secondaryText, length, maxCharsPerCaption }
Failed to edit caption. Text is too long           { text, length, maxCharsPerCaption }
Failed to edit caption. Secondary text is too long { secondaryText, length, maxCharsPerCaption }
Added caption                                      { text, addedCaption }
Unable to edit caption: does not exist             { captionBeforeEdit }
```

### 2.9 `CaptionsSection` shell (shared with QR Codes) [observed]

`zz` is the generic accordion used by both the Captions and QR panels:
props `{title, info, children, canAdd, onAddClick, scenesMode, extraControl,
addButtonComponent, withAccordion=true}`; `useState(true)` = expanded by default;
`onAddClick` also force-expands. Add button = plus icon + label `Add`.
CSS modules `CaptionsSection_*` / `QrCodesSection_*`. [observed]

### 2.10 Related panel — "Chat settings" (`CHAT_OVERLAY_CUSTOMIZATION`) [observed]

Hidden from the rail, opened from the stage chat-overlay controls
(`onChatOverlaySettingsClick`). Component `aW`. Its select controls live in chunk 114 as
`ChatOverlaySelect_*` and `SceneCountdownSelect_*` CSS modules. See section 3.6.

---
