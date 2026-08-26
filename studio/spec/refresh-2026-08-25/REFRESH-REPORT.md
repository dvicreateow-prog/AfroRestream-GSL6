# Restream Studio capture refresh — 2026-08-25

Refresh of the two stale entry points and a full diff of the rspack runtime chunk table
against the captured package at `01-inside-studio-verified/client-static/`.

All downloads were plain unauthenticated `curl` of public static URLs on
`https://studio.restream.io/`. No login was attempted.

---

## 1. Entry points

| Asset | URL | HTTP | Content-Type | Bytes | Captured bytes | Delta |
|---|---|---|---|---|---|---|
| Index (new) | `/Index.9e0811e35f72c739.js` | 200 | `text/javascript` | 325,403 | 325,346 | +57 |
| runtime (new) | `/runtime.9f1fa8797094a416.js` | 200 | `text/javascript` | 6,548 | 6,548 | 0 |

Both are **real assets** — neither returned the `text/html` SPA shell (16,736 bytes).

MD5:

| File | MD5 |
|---|---|
| `Index.9e0811e35f72c739.js` (new) | `c23352951dd1c64cd5ce4753158a4959` |
| `Index.312bd7238c465fa2.js` (captured) | `128b910e1cb8afbcbc3bad203be0d0bf` |
| `runtime.9f1fa8797094a416.js` (new) | `5b0c748fc66bb8c542ad8761bdcc15a3` |
| `runtime.b1c203db08a4f823.js` (captured) | `b00b604b6f1a599aa0a551557a4eb0f4` |

The new runtime is **identical in length** to the old one. Every hash in the chunk table is
16 hex chars, so hash-only substitution leaves the file size unchanged. That is the first
signal that the runtime change is a re-hash, not a structural change.

Build marker (from `Index.js`, module `2881` env block):

| | BUILD_COMMIT |
|---|---|
| captured | `06c4a83bd200952e3c90d43c5a2c451cfc00d787` |
| live | `c8e9a412448fbad722e0ca30bc4ffe090167c433` |

Unchanged across both: `NAME:"studio-frontend"`, `ENVIRONMENT:"production"`,
`VERSION:"1.0.0"`, `DATADOG_APPLICATION_ID:"5b924a92-9c62-4d15-885a-bcd6f0dbd1d5"`.
Bundler is rspack 1.7.4 in both (`c.rv=()=>"1.7.4"`, `c.ruid="bundler=rspack@1.7.4"`).

---

## 2. Runtime chunk table

The runtime carries two id-to-hash maps plus two id-to-name maps:

- `c.u = e => ((NAMES_JS[e]||e) + "." + HASHES_JS[e] + ".js")` — **32 entries**
- `c.miniCssF = e => "assets/styles/" + (NAMES_CSS[e]||e) + "." + HASHES_CSS[e] + ".css"` — **21 entries**
- `c.p = "/"` (public path, unchanged)

Named-chunk maps are **identical** between old and new:

```
JS  names: {151:"restreamvideoeditor", 202:"mediapipetasksvision", 372:"restreamchatembedthemes",
            456:"onboarding-chat", 607:"awssdk", 782:"agentation", 801:"restream"}
CSS names: {372:"restreamchatembedthemes", 456:"onboarding-chat", 801:"restream"}
```

### 2.1 JS table diff (32 to 32)

| Bucket | Count |
|---|---|
| Same hash | **28** |
| Hash changed | **3** |
| New id | **1** (357) |
| Removed id | **1** (131) |

**Changed:**

| id | old hash | new hash |
|---|---|---|
| 575 | `434695f973e2e774` | `971ebd8632e40587` |
| 577 | `61b0a7bbb0dbc94a` | `138b33ffcc7591a0` |
| 593 | `47f82f224fb8c169` | `9f1e08299ec052cd` |

**New / removed:**

| id | hash | note |
|---|---|---|
| 131 (removed) | `8f878df5d7c38b5a` | |
| 357 (new) | `fab32c9d675a47b1` | same logical chunk, renumbered |

### 2.2 CSS table diff (21 to 21)

| Bucket | Count |
|---|---|
| Same hash | **20** |
| Hash changed | **0** |
| New id | **1** (357) |
| Removed id | **1** (131) |

| id | hash |
|---|---|
| 131 (removed) | `3055c017c9fa437e` |
| 357 (new) | `2a5ff75d3e613a8f` |

### 2.3 The 131-to-357 move is a renumber, not a new chunk

Evidence:

- Chunk header changed only in the id: `push([["131"],{32512(e,t,o){...` becomes
  `push([["357"],{32512(e,t,o){...` — same first module id.
- Module-id sets are the same size (45 to 45) with exactly one swap: `76709` to `23096`
  (the chunk's own entry module, renumbered alongside the chunk).
- `Index.js` changed correspondingly in one place — the lazy **Host route** import:
  `...r.e("575"),r.e("131")]).then(r.bind(r,76709))` becomes
  `...r.e("575"),r.e("357")]).then(r.bind(r,23096))`.

---

## 3. Downloads of changed / new chunks

All returned real JS/CSS. **None** returned `text/html`; nothing was skipped.
Saved to `studio/spec/refresh-2026-08-25/chunks/`.

| Chunk | URL | HTTP | Content-Type | Bytes | Prev bytes | Delta |
|---|---|---|---|---|---|---|
| 575 JS | `https://studio.restream.io/575.971ebd8632e40587.js` | 200 | `text/javascript` | 1,198,640 | 1,198,027 | +613 |
| 577 JS | `https://studio.restream.io/577.138b33ffcc7591a0.js` | 200 | `text/javascript` | 422,925 | 421,062 | +1,863 |
| 593 JS | `https://studio.restream.io/593.9f1e08299ec052cd.js` | 200 | `text/javascript` | 1,170,883 | 1,170,915 | -32 |
| 357 JS | `https://studio.restream.io/357.fab32c9d675a47b1.js` | 200 | `text/javascript` | 2,167,766 | 2,168,479 (as 131) | -713 |
| 357 CSS | `https://studio.restream.io/assets/styles/357.2a5ff75d3e613a8f.css` | 200 | `text/css` | 631,090 | 630,421 (as 131) | +669 |

**Total newly downloaded this refresh: 5,923,255 bytes (about 5.65 MiB)** — the 5 chunks
above (5,591,304 B) plus the two entry points (331,951 B).

---

## 4. What actually changed in the code

Diffs are token-level (split on `;{}`), which separates real edits from minifier
identifier churn.

### `Index.js` — 20 hunks, 3 substantive

1. `CutoverTrafficService` route table: `{name:"settings",reads:"allowlist"}` becomes
   `{name:"settings",reads:"percentage"}`. The settings API cutover moved from an
   allowlist to a percentage rollout.
2. Presentations module (`2881`): a new constant `"Presentation Import Google Failed"`
   analytics event, and the Google OAuth popup helper now **returns the popup handle**
   instead of only focusing it (`return Boolean(window.focus)&&c?.focus&&c.focus(),c`).
3. `BUILD_COMMIT` bump and `sourceMappingURL` rename. Everything else is minifier letter
   reshuffling.

### 577 JS (guest bundle) — 118 hunks, 107 pure renames, **11 substantive**

`GuestPresentationsService`, a Google Drive OAuth hardening pass:

- New statics `OAUTH_TOKEN_TTL_MS = 33e5` (55 min) and `OAUTH_POPUP_WATCH_TIMEOUT_MS = 3e5` (5 min).
- New getter `hasValidOAuthToken` (token present **and** within TTL).
- New `setOAuthToken` / `clearOAuthToken`, plus `oAuthTokenReceivedAt` and `oAuthPopupWatch` state.
- Popup-blocked detection: `if(!t) ... "Failed to import presentation: OAuth popup blocked"`,
  reporting the analytics event with `{reason:"popup_blocked"}`.
- New `watchOAuthPopup(popup)` polling loop.
- `gapi.load("picker", ...)` now runs **before** the auth branch; `openGooglePicker` gained
  guards for "picker API not loaded yet", "awaiting valid OAuth token", and
  "google.picker.View unavailable".

### 575 JS (host bundle) — 15 hunks, all substantive

- The **same** Presentations OAuth rework as 577, on the host-side `PresentationsService`.
  Note the host TTL is `OAUTH_TOKEN_TTL_MS = 1e4` (**10 seconds**) versus the guest's `33e5`
  (55 minutes) — a large asymmetry that looks like a debug value left in the host build.
- `SceneEditorsStore`: mock support **removed** — the `hasMocks` getter,
  `mockedEditorsByScene` map, `setMockEditorScene`, and the associated mobx
  `observable.shallow` decorator are all gone.

### 593 JS — 2 hunks, 1 substantive

`get ingestInstance()` — the GKE ingest rollout went to 100 percent:

```
old: ... isOrganization ? "a" : this.userStore.user.id % 10 < 2 ? "b" : "a"  : "a"
new: ... isOrganization ? "a" : "b"                                          : "a"
```

The `user.id % 10 < 2` (20 percent) ramp was removed; every eligible non-organization,
non-canary-excluded user now gets instance `"b"`.

### 131-to-357 JS + CSS — the Host route chunk

Class-name inventory (CSS-module identifiers) moved 2,366 to 2,362.

**Removed** (dev-only debug panel, JS and CSS):
`DevSceneEditingPresencePanel_{title,empty,status,table,corner,scene,cell,checkbox,clear,user}`

**Added:**
`SceneEditModePip_{frame,closeButton}`,
`SceneItem_{sceneItemContainer,sceneItemContainerMobile,previewContainer,pipPlaceholder}`

`SceneEditModePipStore` already existed in the captured build (store/logic layer only, 12 hits
in the old JS, **zero** CSS). In the live build the UI component and its stylesheet have
shipped (`SceneEditModePip_frame__l-CAD`: `position:fixed; top:12px; left:12px; z-index:104;
240x135; border-radius:14px`, with `[data-theme="blue"]` and `[data-theme="dark"]` variants),
plus a `SceneItem_pipPlaceholder` slot in the scene list. So **Scene Edit Mode
picture-in-picture went from store-only to fully wired**.

The remaining roughly 313 "substantive" hunks in this chunk are JSX element-identifier
reshuffling cascading from those two edits (2,890 additional hunks were detected as pure
minifier renames).

---

## 5. Live shell

`https://studio.restream.io/` returned **200 `text/html`, 16,736 bytes**, MD5
`6c90a3992309d6c2038c3b813be51896` — **byte-identical** to the shell already saved in the
scratchpad. Saved here as `shell.live.html`.

Referenced first-party assets:

| Asset | Status vs capture |
|---|---|
| `/runtime.9f1fa8797094a416.js` | **refreshed** |
| `/Index.9e0811e35f72c739.js` | **refreshed** |
| `/externals.b634d3e8690cf1f3.js` | unchanged |
| `/restream.887ca3d5bcd09a3a.js` | unchanged |
| `/hlsjs.3e5d0a83ecd57757.js` | unchanged |
| `/restreamvideoeditor.d22611927fb1ae5c.js` | unchanged |
| `/locale/en-US.js` | unchanged (unhashed) |
| `/assets/styles/Index.0a0f0df00de93ef5.css` | unchanged |
| `/assets/styles/externals.3524860ca3dc5abb.css` | unchanged |
| `/assets/styles/restream.85b89da606457891.css` | unchanged |

Third-party (not captured, not needed): `apis.google.com/js/api.js`,
`cdn-3.convertexperiments.com`, `code.jquery.com/jquery-3.6.0.min.js`,
`fonts.googleapis.com` (Unbounded 900).

Spot-check that the *unchanged* captured hashes are still served live — all `200`:
`restream.887ca3d5bcd09a3a.js`, `externals.b634d3e8690cf1f3.js`, `hlsjs.3e5d0a83ecd57757.js`,
`restreamvideoeditor.d22611927fb1ae5c.js`, `114.15f34f2a5005b32d.js`,
`897.ae37fa9d0cd73351.js`, `assets/styles/restream.85b89da606457891.css`,
`assets/styles/Index.0a0f0df00de93ef5.css`, `assets/styles/externals.3524860ca3dc5abb.css`.

### Note on chunk id 298

`Index.js` calls `r.e("298")` 14 times but 298 has **no entry** in either runtime hash map.
This is not a gap: `externals.b634d3e8690cf1f3.js` declares `push([["298"], ...])`, and the
shell loads it eagerly via a `script` tag, so the id is already in the loaded-chunk registry
and `c.u(298)` is never called. Identical in the old capture.

---

## 6. How stale is the capture now?

**It is no longer stale — coverage is 100 percent.**

| Set | Total in live runtime | Held locally | Missing |
|---|---|---|---|
| JS chunks (`c.u` table) | 32 | 32 (28 from capture + 4 refreshed) | **0** |
| CSS chunks (`c.miniCssF` table) | 21 | 21 (20 from capture + 1 refreshed) | **0** |
| Entry JS (shell) | Index, runtime, externals, restream, hlsjs, restreamvideoeditor | all | **0** |
| Entry CSS (shell) | 3 | 3 | **0** |

Before this refresh the capture was stale in **7 files**: the 2 entry points named in the
task, plus 5 downstream chunks that the stale runtime hash table had masked (575 JS, 577 JS,
593 JS, 357 JS, 357 CSS — the last two present locally only under the old id 131).
Measured against the live build that is 5,923,255 B out of roughly 24.6 MB of hashed JS+CSS,
so about **24 percent of the bundle bytes were stale**, concentrated in the Host route chunk.

Stale files now superseded — the captured copies below should be treated as **historical**:

| Captured (stale) | Superseded by |
|---|---|
| `client-static/js/Index.312bd7238c465fa2.js` | `refresh-2026-08-25/Index.9e0811e35f72c739.js` |
| `client-static/js/runtime.b1c203db08a4f823.js` | `refresh-2026-08-25/runtime.9f1fa8797094a416.js` |
| `client-static/js/131.8f878df5d7c38b5a.js` | `refresh-2026-08-25/chunks/357.fab32c9d675a47b1.js` |
| `client-static/css/131.3055c017c9fa437e.css` | `refresh-2026-08-25/chunks/357.2a5ff75d3e613a8f.css` |
| `client-static/js/575.434695f973e2e774.js` | `refresh-2026-08-25/chunks/575.971ebd8632e40587.js` |
| `client-static/js/577.61b0a7bbb0dbc94a.js` | `refresh-2026-08-25/chunks/577.138b33ffcc7591a0.js` |
| `client-static/js/593.47f82f224fb8c169.js` | `refresh-2026-08-25/chunks/593.9f1e08299ec052cd.js` |

---

## 7. Did the application bundle graph materially change?

**No.** This is a routine incremental deploy, not a restructure:

- Chunk count identical: 32 JS, 21 CSS. No chunk added or dropped — 131-to-357 is a renumber.
- Named-chunk maps identical; rspack 1.7.4 and `c.p="/"` unchanged.
- Module-id sets per chunk are identical (575: 195/195, 577: 45/45, 593: 277/277,
  131-to-357: 45/45 with only the entry module renumbered).
- Total hashed JS+CSS size moved by roughly +2.4 KB across about 24.6 MB.

The behavioural deltas are three feature-flag/rollout changes (settings-API cutover
allowlist to percentage, GKE ingest 20 to 100 percent), a Google Drive OAuth robustness pass
on both host and guest presentation services, removal of a dev-only presence debug panel and
of `SceneEditorsStore` mock support, and the Scene Edit Mode PiP UI shipping.

Worth flagging for follow-up: the host `PresentationsService.OAUTH_TOKEN_TTL_MS` is `1e4`
(10 s) while the guest equivalent is `33e5` (55 min).
