# TOOLS-07 — Third-Party Plugins, SDKs and Services

> **Credentials redacted.** Live third-party keys observed in the captured
> bundles are replaced with placeholders here. They belong to the vendor, not
> to this project, and must never be committed. Read them from the capture
> locally if you need them for analysis.


**Domain:** every third-party dependency Restream Studio initialises at runtime, plus every
third-party declaration in the app shell and PWA manifest.

**Evidence basis:** local capture only. `[observed]` = an exact literal, file or path found on
disk. `[inferred]` = reasoning from observed evidence. Nothing here required logging in.

Primary evidence roots:

| Root | Path |
|---|---|
| App shell | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/misc/studio-shell.html` |
| PWA manifest | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/misc/site.webmanifest` |
| JS bundles | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/js` |
| CSS bundles | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/css` |
| Referenced static | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/referenced-static` |
| Recovered SCSS | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/03-deep-static/source-maps/extracted` |
| Recursive deep assets | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/03-deep-static/recursive` |
| Third-party graphs | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/04-third-party-functional` |

---

## 0. Executive summary

Studio loads **13 distinct third-party runtime services** and bundles roughly **45 identifiable
third-party JS libraries**. Two services declared in the shell (**jQuery** and **Convert
Experiments**) are **commented out and inert**. **Sentry is absent from Restream's own code** —
Datadog RUM + Datadog Logs replaces it; the only Sentry on the wire arrives *inside the Intercom
messenger*, pointed at Intercom's own DSN.

Counts:

| Bucket | Count |
|---|---|
| Third-party services actively initialised at runtime | 13 |
| Third-party services declared but disabled in the shell | 2 (jQuery, Convert Experiments) |
| Third-party services conditional on a URL parameter | 1 (react-scan) |
| Google Fonts families requested | 12 |
| Self-hosted font families (`@font-face`) | 31 |
| Self-hosted font families under a **commercial/restricted** licence | 3 confirmed + 1 unresolved |
| Bundled third-party JS libraries identified | ~45 |
| Third-party public keys/IDs embedded in the client bundle | 10 |
| Restream-owned first-party proxies fronting third parties | 3 (`evs.cdp`, `amp`, `dd`) |
| Preconnect / dns-prefetch / preload hints in the shell | **0** |

---

## 1. The app shell — `studio-shell.html` (full inventory)

The file is 16,736 bytes and is read here in full. Load order in `<head>` is: Google Fonts
stylesheet → Segment snippet → Intercom snippet → Canny snippet → react-scan gate → inline
loading-screen CSS → webpack-injected `<script defer>` + `<link rel=stylesheet>` tags.

### 1.1 `<meta>` tags (10)

| # | Tag | Value | Purpose |
|---|---|---|---|
| 1 | `http-equiv="Content-Type"` | `text/html; charset=utf-8` | Charset |
| 2 | `name="robots"` | `noindex, follow` | Studio is not indexed |
| 3 | `name="description"` | "Follow this link to join my live stream as a participant…" | Guest-join framed |
| 4 | `name="twitter:card"` | `summary_large_image` | Twitter Card |
| 5 | `name="twitter:site"` | `@restreamio` | Twitter Card |
| 6 | `name="twitter:creator"` | `@restreamio` | Twitter Card |
| 7 | `name="twitter:title"` | `Studio – Restream` | Twitter Card |
| 8 | `name="twitter:description"` | same as description | Twitter Card |
| 9 | `name="twitter:image:src"` | `https://studio.restream.io/img/guest-social-image.png?1234` | Twitter Card |
| 10 | `name="theme-color"` | `#1a1a1a` | Browser chrome tint |
| 11 | `name="viewport"` | `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no` | **Zoom disabled** (a11y concern) |

Open Graph `<meta property=…>` (7, not counted above by the `name=` grep): `og:title`,
`og:description`, `og:image`, `og:type=product`, `og:url=https://restream.io`,
`og:site_name=Restream`, `og:email=team@restream.io`. [observed]

### 1.2 `<link>` tags

| rel | href | Third party? |
|---|---|---|
| `stylesheet` | `https://fonts.googleapis.com/css2?family=Unbounded:wght@900&display=swap` | **YES — Google Fonts** |
| `canonical` | `https://restream.io/` | No |
| `manifest` | `/site.webmanifest` | No |
| `icon` (`image/x-icon`) | `/favicon.ico` | No |
| `apple-touch-icon` (180x180) | `/apple-touch-icon.png` | No |
| `stylesheet` | `/assets/styles/restream.85b89da606457891.css` | No (webpack-injected) |
| `stylesheet` | `/assets/styles/externals.3524860ca3dc5abb.css` | No (webpack-injected) |
| `stylesheet` | `/assets/styles/Index.0a0f0df00de93ef5.css` | No (webpack-injected) |

**No `preconnect`, `dns-prefetch`, `preload` or `modulepreload` hints exist anywhere in the
shell** — grep count is 0. [observed] Every third-party origin (fonts.googleapis.com,
fonts.gstatic.com, evs.cdp.restream.io, widget.intercom.io, canny.io, apis.google.com,
js.stripe.com) pays a full cold DNS+TLS handshake. [inferred]

### 1.3 `<script>` tags — every one, in document order

| # | Kind | Source / content | Status |
|---|---|---|---|
| 1 | inline | `window.analyticsAmplitudeSessionId = Date.now()` + **Segment analytics.js snippet v5.2.0** | **ACTIVE** |
| 2 | inline | **Intercom** loader, `APP_ID = 'wvwee5xi'` | **ACTIVE** (gated) |
| 3 | inline | **Canny.io** SDK loader (`https://canny.io/sdk.js`) | **ACTIVE** (gated) |
| 4 | inline | **react-scan** loader (`https://unpkg.com/react-scan/dist/auto.global.js`) | **CONDITIONAL** — only if `?react-scan` present |
| 5 | `defer /runtime.b1c203db08a4f823.js` | webpack runtime | ACTIVE |
| 6 | `defer /restreamvideoeditor.d22611927fb1ae5c.js` | video editor | ACTIVE |
| 7 | `defer /hlsjs.3e5d0a83ecd57757.js` | hls.js | ACTIVE |
| 8 | `defer /restream.887ca3d5bcd09a3a.js` | main app | ACTIVE |
| 9 | `defer /externals.b634d3e8690cf1f3.js` | vendor | ACTIVE |
| 10 | `defer /Index.312bd7238c465fa2.js` | entry | ACTIVE |
| 11 | inline (body) | playlist/webinar loading-text animation | ACTIVE |
| 12 | `https://code.jquery.com/jquery-3.6.0.min.js` | **jQuery 3.6.0** with SRI `sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=` | **COMMENTED OUT** |
| 13 | `https://cdn-3.convertexperiments.com/js/10034870-10034041.js` | **Convert Experiments** A/B, account `10034870-10034041` | **COMMENTED OUT** |
| 14 | `/locale/en-US.js` | UI strings | ACTIVE |
| 15 | `async https://apis.google.com/js/api.js` | **Google API client (gapi)** | **ACTIVE** |

The exact literal wrapping #12 and #13: `<!-- begin Convert Experiences code-->` /
`<!-- Disabled due to issues with XmlHttpRequest -->`. [observed] jQuery existed *only* as a
prerequisite for the Convert Experiments snippet — Restream's own code never uses it (§4.9).

### 1.4 Conditional gates in the shell

| Gate | Condition | Effect |
|---|---|---|
| `isVirtualEventsApp` | `?appId=` present in URL | Suppresses **Intercom** and **Canny** |
| `isWebinarPreview` | path matches `/webinar/preview/<id>` | Suppresses **Intercom** |
| `shouldEnableReactScan` | `?react-scan` present | Injects **react-scan** |
| `isWebinar` | path matches `/webinar/[preview/]<id>` | Hides loader text |
| `isPlaylist` | `?playlist`, `/playlist*`, `/start-playlist*` | Cycles loader text |

---

## 2. PWA manifest — `site.webmanifest` (full inventory)

| Key | Value |
|---|---|
| `name` | `Restream` |
| `short_name` | `Restream` |
| `description` | `Multistream to 30+ Platforms Simultaneously` |
| `start_url` | `./?utm_source=homescreen` |
| `display` | **`browser`** |
| `theme_color` | `#000` |
| `background_color` | `#000` |
| `icons` | 6 PNGs: 36, 48, 72, 96, 144, 192 |

[observed] The manifest declares **no** `scope`, `orientation`, `shortcuts`, `share_target`,
`screenshots`, `categories`, `id`, `display_override`, `related_applications` or `protocol_handlers`.

Notes:
- `display: browser` means this is **not an installable standalone PWA** — it is a bookmark-grade
  manifest. No `manifest.json` service worker is registered from the shell either. [observed]
- `theme_color` (`#000`) **disagrees** with the shell's `<meta name="theme-color">` (`#1a1a1a`)
  and with the loading-screen background (`#1a1a1a`). [observed] A clone should reconcile these.
- No 512×512 icon and no `maskable` purpose icon — both are required for Android install
  prompts. [inferred]
- Every icon is served from the site root (`/android-chrome-*.png`); all six are present in
  `03-deep-static/recursive/studio.restream.io/`. [observed]

---

## 3. Third-party services initialised at runtime

### 3.1 Master table

| # | Vendor | Product | Version [observed] | Loaded from | Required for a clone? |
|---|---|---|---|---|---|
| 1 | Stripe | Stripe.js v3 + `@stripe/stripe-js` + `@stripe/react-stripe-js` | `1.25.0` / `1.9.0` | `https://js.stripe.com/v3` | **Yes**, if you bill |
| 2 | Intercom | Messenger widget | app `wvwee5xi` | `https://widget.intercom.io/widget/wvwee5xi` | No |
| 3 | Canny | Canny SDK (feedback/roadmap) | app `65c64bfbd31cca3d98a3915c` | `https://canny.io/sdk.js` | No |
| 4 | Twilio Segment | analytics.js snippet `5.2.0` | `5.2.0` | `https://evs.cdp.restream.io/…` (self-proxied) | No |
| 5 | Amplitude | Analytics destination via Segment | n/a (Segment integration) | via Segment | No |
| 6 | Amplitude | **Experiment** (`@amplitude/experiment-js-client`) | `1.15.5` | bundled; API `https://amp.restream.io` | No |
| 7 | Datadog | Browser RUM + Browser Logs | bundled `@datadog/browser-*` | bundled; intake proxied to `https://dd.restream.io` | No |
| 8 | Google | Google API client (`gapi`) + Picker | n/a | `https://apis.google.com/js/api.js` | Only for Drive/Slides import |
| 9 | Google | Fonts | see §5 | `fonts.googleapis.com` / `fonts.gstatic.com` | Replaceable |
| 10 | Google | reCAPTCHA | site key `6LcU-z0U…` | via `@restream/auth` | Replaceable |
| 11 | Cloudflare | Turnstile | site key `0x4AAAAAABCvWsq24shR-Oi1` | `challenges.cloudflare.com` | Replaceable |
| 12 | testRTC (Cyara/Spearline) | **watchRTC SDK** + qualityRTC network test | qualityRTC bundle `1.43.2-beta.1` | bundled SDK; test bundle from `qualityrtc-sdk.s3.amazonaws.com` | No |
| 13 | Vercel | **AI Gateway** via `ai-sdk/gateway` | `4.0.11` | `https://ai-gateway.vercel.sh/v4/ai` | Only for AI onboarding chat |
| — | Aha!/unpkg | **react-scan** | `0.5.7` | `https://unpkg.com/react-scan/dist/auto.global.js` | **No — dev tool** |
| — | (none) | jQuery `3.6.0` | — | **commented out** | No |
| — | Convert.com | Convert Experiments `10034870-10034041` | — | **commented out** | No |

### 3.2 Public keys and IDs embedded in the client bundle

All of these are **client-side publishable values** already served to every visitor in
`Index.312bd7238c465fa2.js`. They are listed because a clone must know which slots exist —
**a clone must provision its own; never reuse these.**

| Env var | Value [observed] | Vendor |
|---|---|---|
| `STRIPE_PUBLIC_KEY` | `<REDACTED-stripe-live-publishable-key>` | Stripe |
| `RECAPTCHA_KEY` | `6LcU-z0UAAAAAFcHtmt8k5ctyRQHiI101sZ076wc` | Google reCAPTCHA |
| `DEV_CLUSTER_RECAPTCHA_KEY` | `6Lfr9T0UAAAAAGcNECGJYEavLTh3KzUZ37-RLWsT` | Google reCAPTCHA (dev) |
| `TURNSTILE_SITE_KEY` | `0x4AAAAAABCvWsq24shR-Oi1` | Cloudflare Turnstile |
| `DEV_CLUSTER_TURNSTILE_SITE_KEY` | `0x4AAAAAABCmBFu9bwveS1WW` | Cloudflare Turnstile (dev) |
| `GOOGLE_API_KEY` | `<REDACTED-google-api-key>` | Google Picker developer key |
| `GOOGLE_CLIENT_ID` | `971839849123-s5albk65lkg91u79eftjn7mhbgabn4ud.apps.googleusercontent.com` | Google OAuth (Drive/Picker) |
| `GOOGLE_APP_ID` | `971839849123` | Google Picker app id |
| `GOOGLE_AUTH_CLIENT_ID` | `228927495001-7g55a3234su6fqma8s3e6pk0ggo9invk.apps.googleusercontent.com` | Google Sign-In (separate project!) |
| `DATADOG_APPLICATION_ID` | `5b924a92-9c62-4d15-885a-bcd6f0dbd1d5` | Datadog RUM |
| `DATADOG_CLIENT_TOKEN` | `pub2d5c3a1b40bd921924d2d9a39cba9128` | Datadog |
| `WATCH_RTC_API_KEY` | `5f455ce2-9a49-4ad2-b336-c0c8098ddb95` | testRTC watchRTC |
| `CANNY_APP_ID` | `65c64bfbd31cca3d98a3915c` | Canny |
| `AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY` | `client-dwvJWezkDsZY0vXLIqWh33yIU8zIBzEm` | Amplitude Experiment |
| `AI_GATEWAY_API_KEY` | **stripped in production** (`AI_GATEWAY_API_KEY: void 0` when `isProduction`) | Vercel AI Gateway |
| Segment write key | delivered inside `https://evs.cdp.restream.io/bgR2R8cwnEzn69s63TNTmY/hNoNGLcHeAvVUQH3crgg94.min.js` | Segment |

Note the deliberate production guard in `EnvService`:
`const n = this.isProduction ? {...s, AI_GATEWAY_API_KEY: undefined} : s`. [observed] The AI
gateway key is a *server-side* credential and is never shipped to production browsers — the
onboarding chat must therefore proxy through `AI_CREATOR_BACKEND_URL`. [inferred]

---

## 4. Per-service deep dive

### 4.1 Stripe — billing

| Field | Value |
|---|---|
| Vendor / product | Stripe / Stripe.js v3, Elements |
| Wrappers + versions | `@stripe/stripe-js` **1.25.0**, `@stripe/react-stripe-js` **1.9.0** [observed] |
| Loaded from | `https://js.stripe.com/v3` (regex guard `/^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/`) |
| Publishable key | `<REDACTED-stripe-live-publishable-key>` |
| Local capture | `04-third-party-functional/stripe` — 1,239 files, 22 MB, 5 crawl levels |

**Evidence.** The version registration literal in `restream.887ca3d5bcd09a3a.js`:
`e._registerWrapper({name:"stripe-js",version:"1.25.0",startTime:t})` and
`e._registerWrapper({name:"react-stripe-js",version:"1.9.0"})`. [observed]

**What it is used for.** Card capture and subscription payment inside Studio. The React
surface used is the classic `Elements` provider + `useStripe()` / `useElements()` hooks, and the
methods asserted on the Stripe object are `elements`, `createToken`, `createPaymentMethod`,
`confirmCardPayment`. [observed] That is the **legacy Card Element + Token/PaymentIntent flow**,
not the modern Payment Element. [inferred]

**Server-side surface** (Restream's own billing backend, reached over `BILLING_BACKEND_URL`):
`v2/api/user/billing/card-info`, `v2/api/billing/getCardInfo`, `v2/api/billing/getCustomerAccountBalance`,
`v2/api/billing/get_stripe_line_items`, `v2/api/user/customers/remove-card`,
`…/subscriptions/line-items?quantity&interval&promoCode`, `/user/organizations/{id}/billing/subscriptions`,
`…/clips-manual-subscription/renew`. [observed]

**Error taxonomy** carried in the client (a clone must reproduce these to match the UX):
`unable_to_get_stripe_customer`, `unable_to_create_stripe_customer`, `user_is_not_a_customer`,
`user_is_already_subscribed`, `customer_has_active_subscriptions`, `stripe_subscription_not_found`,
`invoice_not_found`, `invoice_already_paid`, `failed_to_retry_subscription_payment`,
`card_limit_daily` / `card_limit_weekly` / `card_limit_monthly`, `wrong_account_balance`,
`invalid_price`, `invalid_interval_or_quantity`, `no_subscription`, `stripe_card_error`,
`invalid_token`, `token_expired`. [observed]

Plus a 3-D Secure / tokenisation error allowlist:
`stripe_3d_secure_error:card_error:{card_declined, expired_card, incorrect_number, incorrect_cvc}`,
`stripe_3d_secure_error:invalid_request_error:payment_intent_authentication_failure`,
`stripe_token_error:validation_error:{incomplete_number, invalid_number, incomplete_cvc, incomplete_expiry, invalid_expiry_year_past}`,
`stripe_token_error:card_error:invalid_cvc`. [observed]

**What data Stripe receives.** Card PAN, CVC and expiry are entered **inside Stripe's own
cross-origin iframes** and never touch Restream's JS — that is the point of Elements. Restream's
page passes only the publishable key, the Elements appearance/`fonts` options, and a
`clientSecret` when confirming. Stripe's own iframe additionally fingerprints the browser
(`advancedFraudSignals` is a supported load parameter). [observed for the mechanism, inferred for
the data flow]

**Local graph contents.** The captured Stripe tree includes 234 JS chunks, 871 SVGs (payment-method
brand marks: Affirm, Afterpay, ABN AMRO, Klarna and hundreds more), 76 PNGs, 22 CSS files, 17 JSON
data files (`banks`, `banksManifest`, `bsbs`, `countryRanges`, `likelySubtags`, locale tables),
7 woff2 fonts and 2 PDFs (`PayTo_Customer_Terms.pdf`, `GSSL - Buyer T&Cs (Final).pdf`). The CSS
names reveal the Elements surfaces Stripe ships: `elements-inner-address`,
`elements-inner-payment`, `elements-inner-express-checkout`, `express-checkout-preview`,
`la-link-fonts`, `ulm-balance-flow`, `ulm-email-suggestion`, `ulm-financial-connections-flow`,
`ulm-klarna-flow`, `ulm-sepa-bank-account-flow`. [observed] Restream uses only a small slice of
this (card + 3DS); the rest is Stripe's universal bundle. [inferred]

**Required for a clone?** **Yes if the clone monetises.** Nothing in Studio's *streaming*
functionality depends on Stripe — it is confined to billing screens. A free/self-hosted clone can
delete it entirely.

**Alternative.** For self-hosting, there is no drop-in open-source replacement for a card
processor (you still need an acquirer). Practical options: **Lago** (open-source metering &
billing, MIT/AGPL) or **Kill Bill** (open-source subscription billing, Apache-2.0) in front of a
processor of your choice; **Medusa** if you want commerce primitives too. For the *widget* layer,
**Stripe Elements has no OSS equivalent** — PCI SAQ-A depends on the iframe isolation, so
hand-rolling card fields moves you to SAQ-D. Recommendation: keep a hosted processor
(Stripe/Paddle/Lemon Squeezy) and self-host only the subscription/entitlement logic.

---

### 4.2 Intercom — support messenger

| Field | Value |
|---|---|
| Vendor / product | Intercom / Messenger |
| App ID | `wvwee5xi` [observed] |
| Loaded from | `https://widget.intercom.io/widget/wvwee5xi` |
| Local capture | `04-third-party-functional/intercom` — 345 files, 40.8 MB |

**Bootstrapping.** The shell defines `window.intercomSettings = { app_id: 'wvwee5xi',
custom_launcher_selector: '#custom-intercom-launcher' }` then injects the widget on `load`.
Suppressed entirely when `?appId=` is present (virtual-events app) or the path is
`/webinar/preview/<id>`. [observed]

**Custom launcher.** Studio renders its own button with `id="custom-intercom-launcher"` in both
the host sidebar (`HostSidebarV2_customIntercomButton`) and the guest page, labelled **"Help"**
with an unread-count badge. Intercom's default bubble is therefore suppressed and driven from
Restream's own tab rail. [observed]

**Runtime API used** (`953.29f1e57f8e568b77.js`, logger namespace `"intercom"`):
`window.Intercom('showNewMessage', payload)`, `window.Intercom('update', settings)`,
`Intercom('reattach_activator')`, plus a `boot` path. A CSS override is injected at runtime
forcing `margin-right: 0` on `.intercom-lightweight-app-launcher`, `.intercom-launcher-frame`,
`.intercom-messenger-frame`, `.intercom-messenger`, `.intercom-borderless-frame`. [observed]
A `hide-intercom` body class is reference-counted by a hook used in at least 4 chunks
(`593`, `699`, `917`, and the guest page) to hide the messenger during modals/fullscreen. [observed]

**Exact data Intercom receives.** From `UserModel.toIntercomData(studioMode)` in
`Index.312bd7238c465fa2.js` [observed]:

```
// organisation member branch
{ user_id: originalUser.memberId, user_hash: intercomUserHash }

// standard branch
{ user_id: String(user.id),
  user_hash: intercomUserHash,
  created_at: user.createdAt,
  email: user.email,
  email_confirmed: user.hasConfirmedEmail,
  studio_mode: "playlists" | "scenes" | "default" }
```

Returns `null` unless `intercomUserHash` is present — i.e. **Intercom Identity Verification (HMAC)
is enforced**, and the HMAC is minted server-side and fetched via `userStore.getIntercomUserHash()`
during host-page init. [observed] `studio_mode` leaks which Studio experiment cohort the user is in.

**Gating.** Only sent when `envService.isProduction && !featureStore.appId.value`. [observed]
`GuestPageViewStore.shouldHideIntercom` additionally hides it for non-desktop viewports, the join
screen, virtual-events apps, fullscreen mode, Shopify guests, and while the guest store is loading. [observed]

**Nested third parties inside Intercom.** The decoded loader
(`04-third-party-functional/intercom/decoded/widget-loader.js`) carries Intercom's own config
block [observed]:

| Key | Value |
|---|---|
| `api_base` / `telemetry_base` | `https://api-iam.intercom.io` |
| `public_path` | `https://js.intercomcdn.com/` |
| `yt_iframe_proxy_path` | `https://intercom-sheets.com/youtube_iframe_proxy` |
| `sheets_proxy_path` | `https://intercom-sheets.com/sheets_proxy` |
| `sentry_proxy_path` | `https://www.intercom-reporting.com/sentry/index.html` |
| `sentry_dsn` | `https://f305de69cac64a84a494556d5303dc2d@app.getsentry.com/24287` |
| `intersection_js` | `https://js.intercomcdn.com/intersection/assets/app.js` (7.17 MB) |
| `intersection_styles` | `https://js.intercomcdn.com/intersection/assets/styles.js` (2.44 MB) |
| `install_mode_base` | `https://app.intercom.com` |
| `article_search_messenger_app_id` | `27` |
| `mode` | `production` |

Also excluded by the capture as a live probe:
`https://internet-up.ably-realtime.com/is-the-internet-up.txt` — Intercom uses **Ably** for
realtime and probes reachability. [observed, from
`MANIFEST-runtime-service-endpoints.csv`]

**Cost note.** Adding Intercom to Studio pulls **~9.6 MB of JS** (`app.js` + `styles.js`) plus
146 enumerated frame chunks and 35 Google font files onto the page. [observed] That is roughly
80 % the size of Restream's own main bundle, for a Help button.

**Required for a clone?** **No.** Purely support tooling.

**Alternatives.** **Chatwoot** (MIT, self-hosted, closest feature-for-feature Intercom clone with
identity verification + HMAC), **Papercups** (MIT, dormant), **Zammad** (AGPL, ticket-first),
**Tawk.to** (free, hosted, not OSS), or simply a `mailto:`/Discord link.

---

### 4.3 Canny — feature requests / roadmap

| Field | Value |
|---|---|
| Vendor / product | Canny.io |
| App ID | `65c64bfbd31cca3d98a3915c` (`CANNY_APP_ID`) [observed] |
| Loaded from | `https://canny.io/sdk.js` (id `canny-jssdk`) |

**Bootstrapping.** Shell snippet, gated on `!isVirtualEventsApp`. [observed]

**Identify call**, from `131.8f878df5d7c38b5a.js` and `577.61b0a7bbb0dbc94a.js`:
`Canny('identify', { appID: CANNY_APP_ID, user: user.toCannyData() })`, wrapped in
`envService.isProduction && !featureStore.appId.value && window.Canny && CANNY_APP_ID`. [observed]

**Exact data Canny receives**, from `UserModel.toCannyData()` [observed]:

```
// organisation branch
{ id: String(originalUser.id), email: originalUser.email,
  name: "Restream user", avatarURL: originalUser.thumbnail }

// standard branch
{ id: String(user.id), email: user.email, name: "Restream user" }
```

Note the name is the **literal constant `"Restream user"`** — Restream deliberately does not send
real names to Canny. [observed] Email and avatar URL *are* sent.

**Required for a clone?** **No.**

**Alternatives.** **Fider** (MIT, self-hosted feedback boards, the direct analogue),
**Astuto** (AGPL), or GitHub Discussions / Discourse.

---

### 4.4 Segment + Amplitude — product analytics

| Field | Value |
|---|---|
| Vendor / product | Twilio Segment `analytics.js` snippet **5.2.0** [observed] |
| CDN | `https://evs.cdp.restream.io` — Segment's **custom-CDN/proxy** feature pointed at a Restream domain |
| Bundle URL | `https://evs.cdp.restream.io/bgR2R8cwnEzn69s63TNTmY/hNoNGLcHeAvVUQH3crgg94.min.js` |
| Downstream destination | **Amplitude** (session-scoped) |

**Bootstrapping.** The standard Segment snippet, but with `analytics._cdn = 'https://evs.cdp.restream.io'`
and a hard-coded `t.src` pointing at the same host. The obfuscated path segments are Segment's
CDN-proxy scheme designed to survive ad blockers. [observed / inferred]

The snippet stubs 21 methods: `trackSubmit, trackClick, trackLink, trackForm, pageview, identify,
reset, group, track, ready, alias, debug, page, screen, once, off, on, addSourceMiddleware,
addIntegrationMiddleware, setAnonymousId, addDestinationMiddleware, register`. [observed]

**Amplitude session pinning.** `window.analyticsAmplitudeSessionId = Date.now()` is set *before*
the snippet, and every `page`/`track`/`identify` passes
`{ integrations: { All: true, Amplitude: { session_id: <that value> } } }`. [observed] This
stitches every Studio event into one Amplitude session.

**Restream's wrapper** — `EventsReporter` in `Index.312bd7238c465fa2.js` [observed]:

| Method | Behaviour |
|---|---|
| `setGlobalProperty(k, v)` | Accumulates into a global props dict merged into every event |
| `report(type, props)` | `window.analytics.track(...)`; property keys are **decamelised** and prefixed `studio_` |
| `identify(traits, userId)` | `window.analytics.identify(userId, traits)`, same decamelise + `studio_` prefix |

Every call warns `"No Amplitude instance"` if `window.analytics` is missing — Restream treats
Segment purely as an Amplitude pipe. [observed]

**Global properties attached to every event** (collected across `131`, `575`, `577`, `593`):
`userId`, `suid` (stream UID), `eventId`, `isLive`, `serverWebSocketUrl`, `orgOrganizationId`,
`orgMemberUserId`, `orgMemberId`, `orgMemberRoleInWorkspace`, `orgWorkspaceId`. [observed]

**Identify traits observed being set:** `videoInputDeviceLabel`, `audioInputDeviceLabel`,
`settingsVideoResolution`, `suid`, `eventId`, plus webinar flags. [observed] **Device labels are
raw hardware strings** (e.g. "Logitech BRIO"), which is meaningful fingerprinting surface. [inferred]

**Sample event names observed:** `"Produced Track Muted"`, `"Layout Type Changed"`,
`"Inactivity Modal Shown"`, `"Participant Gone Live"`, `"Guest Connection Attempt Error"`,
`"Amplitude Experiment Assigned"`, `"Video Resolution Setting Changed"`. [observed]

**Required for a clone?** **No.**

**Alternatives.** **PostHog** (MIT/self-hostable; product analytics + session replay + feature
flags + A/B in one, so it can replace Segment *and* Amplitude Analytics *and* Amplitude
Experiment), **Matomo** (GPL), **Plausible** (AGPL, privacy-first but no user-level funnels),
**Countly** (AGPL), **Jitsu** (MIT) or **RudderStack** (Elastic v2) as a Segment-shaped router.
For a clone, PostHog collapses three vendors into one.

---

### 4.5 Amplitude Experiment — feature flags / A-B testing

| Field | Value |
|---|---|
| Vendor / product | Amplitude / **Experiment**, `@amplitude/experiment-js-client` |
| Version | **`1.15.5`** [observed — `tj="1.15.5"`, sent as `library: "experiment-js-client/1.15.5"`] |
| Deployment key | `client-dwvJWezkDsZY0vXLIqWh33yIU8zIBzEm` |
| Server URL (configured) | `https://amp.restream.io` (`AMPLITUDE_EXPERIMENT_SERVER_URL`) — **first-party proxy** |
| SDK defaults (unused) | `serverUrl: https://api.lab.amplitude.com`, `flagsServerUrl: https://flag.lab.amplitude.com` (EU variants also bundled) |

**SDK default config observed verbatim:** `fetchTimeoutMillis: 10000`, `retryFetchOnFailure: true`,
`automaticExposureTracking: true`, `pollOnStart: true`, `flagConfigPollingIntervalMillis: 300000`,
`fetchOnStart: true`, `source: LocalStorage`, `serverZone: "US"`. [observed]

**Restream's `AmplitudeFlagsStore`** (`Index.312bd7238c465fa2.js`) defines flags declaratively via
`defineFlag({ key, variants, fallback })`, each exposing `.variant()`, `.is(v)` and `.expose()`. [observed]

| Flag key [observed] | Variants | Consumed by |
|---|---|---|
| `studio_ai_widgets` | `control`, `treatment` | `HostExperimentsStore.shouldEnableAiWidgets`; exposed when the widget panel opens |
| `studio_scene_edit_mode` | `on` | `HostExperimentsStore.shouldEnableSceneEditMode`; exposed when scene edit mode activates |
| `studio_example_one` / `two` / `three` | (placeholders) | none — scaffolding left in the bundle **[UNRESOLVED]** |

**Exposure discipline.** Rather than firing on read, `HostPageViewStore` uses MobX `reaction`s so
`.expose()` only fires when the feature is *actually reached* (widget panel opened, edit mode
entered) **and** the flag is not force-overridden by a URL parameter
(`isAiWidgetsForcedByUrl`, `isSceneEditModeForcedByUrl`). [observed] Every assignment is
double-reported to Segment as
`report("Amplitude Experiment Assigned", { experimentId, assignment, source: "amplitude_experiment" })`. [observed]

**URL-parameter override system.** `FeatureStore` lets any flag be forced from the query string
(`?ai-widgets=`, `?studio-scene-edit-mode=`, `?turnstile-site-key=`, `?recaptcha-key=`,
`?agentation=`, `?ai-onboarding-chat=`, `?screen-share-restrict-own-audio=`, `?react-scan`,
`?watchrtc=debug`). It is fenced by `ALLOWED_FEATURE_FLAG_URL_PATTERNS =
"*://*.restream.io:*,*://*.nodes.restream.studio:*"`. [observed]

**Required for a clone?** **No.**

**Alternatives.** **PostHog feature flags** (MIT), **Unleash** (Apache-2.0, the strongest
self-hosted flag server), **Flagsmith** (BSD-3), **GrowthBook** (MIT — the closest match because
it does flags *and* statistical experiment analysis), or **OpenFeature** as a vendor-neutral
client abstraction.

---

### 4.6 Datadog — RUM, logs and telemetry (Sentry's replacement)

| Field | Value |
|---|---|
| Vendor / product | Datadog **Browser RUM** + **Browser Logs** (`@datadog/browser-rum`, `@datadog/browser-logs`) |
| Site | `datadoghq.com` (US1) |
| Application ID | `5b924a92-9c62-4d15-885a-bcd6f0dbd1d5` |
| Client token | `pub2d5c3a1b40bd921924d2d9a39cba9128` |
| Log level | `info` |
| **Intake proxy** | **`https://dd.restream.io`** |

**Evidence.** `externals.b634d3e8690cf1f3.js` and `restream.887ca3d5bcd09a3a.js` both carry the
Datadog browser SDK, including the site constants (`datadoghq.com`, `datadoghq.eu`,
`datad0g.com`, `ddog-gov.com`, `dd0g-gov.com`, `pci.browser-intake-datadoghq.com`), the
`ddsource`/`ddtags` query keys, the `DD_RUM` / `DD_LOGS` / `DD_RUM_SYNTHETICS` globals, the
troubleshooting URL `https://docs.datadoghq.com/real_user_monitoring/browser/troubleshooting`,
and the agent CDN allowlist (`www.datadoghq-browser-agent.com`, `www.datad0g-browser-agent.com`,
`d3uc069fcn7uxw.cloudfront.net`, `d20xtzwzcl0ceb.cloudfront.net`). [observed]

**Proxy mechanism.** The SDK's `proxy` option is honoured: intake URLs are rewritten to
`<proxy>?ddforward=<urlencoded /api/v2/<track>?…>`. With `DATADOG_PROXY_URL = https://dd.restream.io`,
**no browser ever contacts a datadoghq.com hostname directly** — same ad-blocker-resistance
strategy as the Segment CDN proxy. [observed for the mechanism, inferred for the motive]

**Advanced features present in the bundle:** session sampling, `trackFeatureFlagsForEvents`,
`compressIntakeRequests` with a deflate worker, `usePciIntake` (warns unless site is US1),
`trackingConsent` gating, and the **RUM Profiler** — which logs
`"[DD_RUM] Profiler startup failed. Ensure your server includes the 'Document-Policy:
js-profiling' response header"`. [observed]

**Global context attached** (mirrors the analytics props): `userId`, `suid`, `eventId`,
`orgOrganizationId`, `orgMemberUserId`, `orgMemberId`, `orgMemberRoleInWorkspace`,
`orgWorkspaceId`, `serverWebSocketUrl`. Set via `setGlobalContextProperty` on **both** the RUM
handle and the Logs handle. [observed]

**What Datadog receives.** Page views, resource/XHR timings, JS errors with stack traces, long
tasks, user actions, console/`logger` output at `info` and above, plus every global context
property above. RUM by default also records URLs, referrers, viewport, and IP-derived geo. [inferred]

#### Sentry — explicitly ABSENT

A case-insensitive scan for `sentry` across **all 37 JS bundles returns zero matches.** [observed]
There is no `@sentry/*` package, no DSN, no `captureException`, no `sentry-trace` header.

The capture's own metadata (`CAPTURE-SUMMARY.json`) records
`"explicitly_excluded_sentry_telemetry_chunks": 8` — but those 8 belong to the **Stripe (4)** and
**Intercom (4)** subtrees, not to Restream. [observed] The only live Sentry in the page is
Intercom's, at `https://f305de69cac64a84a494556d5303dc2d@app.getsentry.com/24287`, proxied through
`https://www.intercom-reporting.com/sentry/index.html`. [observed]

**Conclusion:** Restream Studio uses **Datadog, not Sentry**, for error and performance telemetry.
Any brief that assumes Sentry should be corrected.

**Required for a clone?** **No.**

**Alternatives.** **GlitchTip** (MIT, Sentry-SDK wire-compatible — drop-in), **self-hosted Sentry**
(BSL/FSL, free for self-host), **Highlight.io** (Apache-2.0, session replay + errors + logs, the
closest RUM analogue), **OpenTelemetry Browser + Grafana Faro/Tempo/Loki** (Apache-2.0, the
vendor-neutral route), or **Uptrace**/**SigNoz** (Apache-2.0) as the OTLP backend.

---

### 4.7 testRTC watchRTC + qualityRTC — WebRTC quality telemetry & network test

| Field | Value |
|---|---|
| Vendor | **testRTC**, now part of **Cyara / Spearline** [inferred from endpoint hostnames] |
| Products | **watchRTC** (passive session monitoring) + **qualityRTC** (active pre-call network test) |
| API key | `WATCH_RTC_API_KEY = 5f455ce2-9a49-4ad2-b336-c0c8098ddb95` [observed] |
| watchRTC SDK | **bundled inside `externals.b634d3e8690cf1f3.js`** [observed] |
| qualityRTC bundle | `https://qualityrtc-sdk.s3.amazonaws.com/<version>/main.bundle.js` [observed] |
| qualityRTC version | **`1.43.2-beta.1`** — recorded as a directory in `03-deep-static/recursive/qualityrtc-sdk.s3.amazonaws.com/1.43.2-beta.1/` [observed] |
| Backend hosts in SDK | `watchrtc.spearline.dev`, `watchrtc-server.cyara.com`, `watchrtc-serverdev.spearline.dev` [observed] |

> **Capture gap.** The `1.43.2-beta.1` directory exists but is **empty** — `main.bundle.js` was
> not retrieved (the capture's `unavailable_http_403: 1` under `deep_static` is consistent with a
> 403 on this object). The version is proven; the payload is not on disk. **[UNRESOLVED]**

**watchRTC — what it does.** It is a WebRTC **session monitor**. It monkey-patches
`RTCPeerConnection`, samples `getStats()` on an interval, and streams the timeseries over a
WebSocket to the watchRTC server, keyed by `rtcRoomId` / `rtcPeerId`, so testRTC's dashboard can
replay call quality after the fact. [observed / inferred from the exposed API]

**Public API surface exposed by the bundled SDK** [observed]:

| Method | Purpose |
|---|---|
| `initSDK(config, …)` | Boot with `{ rtcApiKey, rtcRoomId, rtcPeerId, keys, logLevel, proxyUrl }` |
| `setConfig(config)` | Update config mid-session |
| `addKeys({…})` | Attach searchable dimensions to the session |
| `addEvent({ name, parameters })` / `addGlobalEvent` / `addLocalEvent` | Timeline annotations |
| `setUserRating(rating, comment)` | Post-call MOS/CSAT |
| `enableDataCollection()` / `disableDataCollection()` | Master switch |
| `mapStream(id, name)` / `mapTrack(id, name)` | Human-readable stream/track labels |
| `addStatsListener` / `addStateListener` | Consumer hooks |
| `connect()` / `disconnect()` | Socket lifecycle |
| `persistentStart()` / `persistentEnd()` | Cross-page sessions |
| `qualityrtc: { run, stop }` | Launch/stop the **network test** |
| `subscribe` / `unsubscribe` | Event bus |

Also present: `getHardware()` collecting `hardwareInfo`, and a **TestRTC Companion** integration
(`getTestRTCCompanionInfo()`, `getTestRTCCompanionStats()`, `TESTRTC_SYSTEM_INFO`,
`TESTRTC_COMPANION_STATS_TIMEOUT`) — an optional desktop/extension agent that reports host CPU and
network stats. [observed] Debug mode via `?watchrtc=debug`. [observed]

**qualityRTC — what it tests.** The `run` path [observed]:

1. Calls `disableDataCollection()` so the test does not pollute the monitored session.
2. Resolves the code URL: `options.codeUrl` **or**
   `https://qualityrtc-sdk.s3.amazonaws.com/${version}/main.bundle.js`.
3. Resolves the config URL: either `${configUrl}/.netlify/functions/get-config` (note: qualityRTC's
   config service runs on **Netlify Functions**) or
   `${connection.url}/get-qualityrtc-config?apiKey=${key}&${params}`.
4. `Promise.all([...])` fetches the config JSON and loads the test bundle.

qualityRTC is testRTC's **pre-call network qualification suite**: it measures bandwidth
(up/down), packet loss, jitter, round-trip time, connectivity through UDP/TCP/TLS, TURN
reachability per region, firewall/proxy interference, device enumeration and browser capability.
[inferred from the product's purpose and the SDK's `getHardware`/`getConnectionData` surface —
the test bundle itself is not on disk]

**How Studio drives it.** `RoomConnectionStore` / `RoomGuestConnectionStore` call
`watchRtcService.enableDataCollection()` on connect and `disableDataCollection()` on disconnect or
connection failure. [observed] `setConfig` is populated with:

```
{ userId, userRegion, ownerUserId, regionalTurn, serverRegion, serverName, serverInstanceName, … }
```
[observed]

`addKeys({ suid })` and `addKeys({ eventId })` tag the session. `addLocalEvent` records
`"Video Input Device Changed: <label>"`, `"Audio Input Device Changed: <label>"`,
`"Video Resolution Setting Changed"`; `addGlobalEvent` records `"Layout Type Changed"` and
`"Live stream <status>"`. [observed]

**It is NOT enabled for everyone.** `HostExperimentsStore.shouldEnableWatchRtc` [observed]:

```
if (featureStore.detailedWebRtcMetrics.meta.isUserDefined)
    return featureStore.detailedWebRtcMetrics.value
return !user
    || user.isRestreamStaff
    || user.isRestreamEmail
    || user.data.hasActiveSubscription
    || user.isOrganization
    || Boolean(featureStore…)
```

So watchRTC runs for **anonymous/guest users, Restream staff, paying subscribers and organisation
members** — free logged-in users are excluded. [observed] Presumably a per-session licence-cost
control. [inferred]

**What testRTC receives.** Full WebRTC `getStats()` timeseries (bitrate, packet loss, jitter, RTT,
codec, resolution, framerate per track), ICE candidate types, SDP-derived session metadata, room
and peer IDs, `userId`, `ownerUserId`, `userRegion`, `serverRegion`/`serverName`/`serverInstanceName`,
`suid`, `eventId`, **raw camera and microphone device labels**, hardware info, and the event
timeline above. [observed]

**Required for a clone?** **No** — Studio's media path works without it.

**Alternatives.** **`getStats()` yourself** into your own store is the honest baseline. Beyond
that: **Jitsi's `rtcstats`** (Apache-2.0 — a browser hook + server that dumps `getStats` to
ClickHouse/S3, the closest OSS analogue to watchRTC), **callstats.io** (commercial, discontinued),
**LiveKit Cloud analytics** (if you adopt LiveKit), or **Prometheus + Grafana** fed from your SFU's
own per-track metrics — which is what most self-hosters do, because SFU-side stats are cheaper and
harder to spoof than client-side ones. For the **qualityRTC pre-call test**, roll your own from
`RTCPeerConnection` against your TURN servers plus a bandwidth probe; **`webrtc-troubleshooter`**
(Genesys, MIT) and Google's **`test.webrtc.org`** (BSD) are both open-source starting points.

---

### 4.8 react-scan — development tool (CONFIRMED dev-only)

| Field | Value |
|---|---|
| Product | **react-scan** — React render-performance visualiser |
| Version | **`0.5.7`** [observed — `version:"0.5.7"` in the bundle] |
| Also present | `react-scan-devtools-0.1.0` CSS namespace; a reference to a companion `react-grab` |
| File on disk | `03-deep-static/recursive/unpkg.com/react-scan/dist/auto.global.js` — 388,072 bytes |
| Loaded from | `https://unpkg.com/react-scan/dist/auto.global.js` |

**CONFIRMED: not a production dependency.** The shell IIFE is unambiguous [observed]:

```js
var shouldEnableReactScan = new URL(location.href).searchParams.has('react-scan')
if (!shouldEnableReactScan) return
```

No query parameter → the `<script>` is never created. Ordinary users never fetch it.

**What it does.** Highlights re-rendering components with an overlay, exposes a component tree
inspector, flash overlays for wasted renders, and a resizable devtools panel — evidenced by the
class names `react-scan-flash-overlay`, `react-scan-components-tree`, `react-scan-header`,
`react-scan-expandable`, `react-scan-close-button`, `react-scan-arrow`. [observed]

**Risk note for a clone.** The tag pulls an **unpinned, unversioned, no-SRI script from a public
CDN into a production origin** on demand. Anyone who can get a Studio user to open
`…?react-scan` causes unpkg to execute arbitrary code in the Studio origin. A clone should either
drop this entirely, pin a version + `integrity` hash, or self-host the file. [inferred]

**Required for a clone?** **No.**

**Alternative.** **React DevTools Profiler** (built in, MIT), **why-did-you-render** (MIT),
or self-host `react-scan` itself (it is MIT).

---

### 4.9 jQuery — declared but INERT

| Field | Value |
|---|---|
| Declared | `https://code.jquery.com/jquery-3.6.0.min.js` |
| SRI | `sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=` |
| CORS | `crossorigin="anonymous"` |
| Status | **Inside an HTML comment. Never executed.** |

**Why it is there.** It sits inside the block delimited by `<!-- begin Convert Experiences code-->`
and `<!-- end Convert Experiences code -->`, immediately above the Convert Experiments tag. jQuery
was a **prerequisite of Convert Experiments' visual-editor snippet**, not of Studio. [observed
placement, inferred purpose] The developer note explaining the disablement is verbatim:
`<!-- Disabled due to issues with XmlHttpRequest -->`. [observed] Convert's snippet wraps `XHR`
to detect SPA navigations, which broke Studio's request pipeline. [inferred]

**Confirmation that Restream's own code never uses jQuery.** A case-insensitive scan of the
bundles finds exactly **3** occurrences, all of them third-party *compatibility probes* on
objects that might be jQuery collections [observed]:

| Bundle | Owner library | Literal |
|---|---|---|
| `externals` | **hark** / audio-level analyser | `e.jquery && (e = e[0])` |
| `externals` | **Popper.js v1** | `this.reference = t && t.jquery ? t[0] : t` |
| `restream` | **UAParser.js 0.7.33** | `var Q = typeof r !== o && (r.jQuery \|\| r.Zepto); if (Q && !Q.ua) {…}` |

None of these *require* jQuery; all three degrade cleanly to plain DOM. **jQuery is not loaded and
not needed.**

**Required for a clone?** **No. Do not port it.**

---

### 4.10 Convert Experiments — declared but INERT

| Field | Value |
|---|---|
| Vendor | Convert.com |
| Declared | `https://cdn-3.convertexperiments.com/js/10034870-10034041.js` |
| Account / project | `10034870` / `10034041` |
| Status | **Commented out** |
| Runtime references in bundles | **0** [observed] |

A scan for `convertexperiments` across all 37 JS bundles returns **zero** matches. [observed]
Convert Experiments is completely absent from Studio at runtime; A/B testing is done through
**Amplitude Experiment** (§4.5) instead.

**Required for a clone?** **No.**

**Alternative.** Already covered — **GrowthBook** or **PostHog experiments**.

---

### 4.11 Google APIs — `apis.google.com/js/api.js` (gapi) + Google Picker

| Field | Value |
|---|---|
| Loaded from | `<script async src="https://apis.google.com/js/api.js">` at the end of `<body>` [observed] |
| Module loaded | `gapi.load("picker", { callback })` [observed] |
| Developer key | `GOOGLE_API_KEY = <REDACTED-google-api-key>` |
| OAuth client | `GOOGLE_CLIENT_ID = 971839849123-…apps.googleusercontent.com` |
| App id | `GOOGLE_APP_ID = 971839849123` |

**Purpose: the Presentations / Google Slides import feature.** Found in
`575.434695f973e2e774.js` and `577.61b0a7bbb0dbc94a.js` as `PresentationsStore`. [observed]

Flow [observed]:
1. If no OAuth token, open OAuth against `GOOGLE_CLIENT_ID` with
   `redirectUri = ${PUBLIC_URL}${OAUTH_PATH}`.
2. `gapi.load("picker", …)` → `pickerApiLoaded = true` → `openGooglePicker()`.
3. Build the picker:
   `new google.picker.PickerBuilder().setAppId(GOOGLE_APP_ID).setOAuthToken(token)
    .addView(new google.picker.View(google.picker.ViewId.DOCS).setMimeTypes(<allowlist>))
    .addView(new google.picker.DocsUploadView())
    .setDeveloperKey(GOOGLE_API_KEY).setCallback(cb).setTitle("Presentations").build().setVisible(true)`
4. On `google.picker.Action.PICKED`, call `importPresentationFromGoogleDrive({ accessToken,
   sourceId: Document.ID, filename: Document.NAME, mimeType: Document.MIME_TYPE,
   url: Document.URL.replace("edit", "export/pdf") })`.

**The `.replace("edit","export/pdf")` is the whole trick** — Studio does not parse Slides; it asks
Drive to export the deck as a PDF and renders that. [observed]

**What Google receives.** The OAuth grant (Drive read scope), the developer key, the app id, and
— because the **access token is passed to Restream's backend** — Restream's servers also gain
direct Drive access for the duration of the token. [observed] That is a meaningful trust
boundary a clone must document.

**Note: two separate Google projects.** `GOOGLE_CLIENT_ID` (`971839849123-…`) is used for
Drive/Picker, while `GOOGLE_AUTH_CLIENT_ID` (`228927495001-…`) is used for Google Sign-In in the
auth forms. [observed] Different project numbers — deliberate scope separation. [inferred]

**Required for a clone?** **Only if you want Slides/Drive import.**

**Alternative.** For file picking generally: a plain `<input type=file>` plus **Uppy** (MIT, has
its own Google Drive/Dropbox/OneDrive companion plugins and a self-hostable **Companion** server —
this is the closest OSS replacement for the whole picker + import pipeline). For the
Slides→PDF step: **LibreOffice headless** (`soffice --convert-to pdf`, MPL-2.0) or **Gotenberg**
(MIT, Docker-friendly conversion API) on your own backend.

---

### 4.12 Google reCAPTCHA + Cloudflare Turnstile — bot protection

Both are present, and **Turnstile takes precedence when configured**. [observed]

| Field | reCAPTCHA | Turnstile |
|---|---|---|
| Vendor | Google | Cloudflare |
| Site key (prod) | `6LcU-z0UAAAAAFcHtmt8k5ctyRQHiI101sZ076wc` | `0x4AAAAAABCvWsq24shR-Oi1` |
| Site key (dev) | `6Lfr9T0UAAAAAGcNECGJYEavLTh3KzUZ37-RLWsT` | `0x4AAAAAABCmBFu9bwveS1WW` |
| Host contacted | `www.google.com/recaptcha/…` | `challenges.cloudflare.com` |
| URL override | `?recaptcha-key=` | `?turnstile-site-key=` |
| Kill switch | `RECAPTCHA_DISABLED` (prod: `"false"`) | — |

**Selection logic**, from the `@restream/auth` component in `externals.b634d3e8690cf1f3.js` [observed]:

```
shouldUseRecaptcha:  l.shouldUseRecaptcha && !l.turnstileSiteKey
shouldUseTurnstile:  !!l.turnstileSiteKey
```

Since `TURNSTILE_SITE_KEY` is set in production, **Turnstile is the active challenge and reCAPTCHA
is the fallback**. [inferred from the observed logic + observed env values]

**Where.** Inside the shared `@restream/auth` login/signup forms (`798.5aeee236e1d9228a.js`,
`917.6c1516d88fcb69f8.js`) — reached from Studio when an anonymous viewer is asked to create an
account to re-broadcast a stream. Props observed: `apiHost: WEBSITE_BACKEND_URL`,
`googleClientId: GOOGLE_AUTH_CLIENT_ID`, `recaptchaSiteKey`, `turnstileSiteKey`,
`publicApiHost: RESTREAM_WEB_API_HOST`, `callerApp: NAME`, `shouldShowFacebookButton: false`,
`shouldUseRedirectUxModeOnGoogleButton: true`, `onVerifiedDeviceRequired`. [observed]

**What they receive.** Browser fingerprint, IP, interaction telemetry, and the page origin.
reCAPTCHA v3 in particular scores across a user's whole browsing session on reCAPTCHA-enabled
sites. Turnstile is materially more privacy-preserving. [inferred]

**Required for a clone?** **No** for Studio proper; **yes in spirit** for any public signup form.

**Alternatives.** **Cloudflare Turnstile** is already the privacy-friendlier of the two and is free
— keep it. Fully self-hosted: **Altcha** (MIT, proof-of-work, no third-party call),
**mCaptcha** (AGPL, PoW), **Friendly Captcha** (partially OSS), or **hCaptcha** (hosted,
privacy-marketed). For low-traffic clones a **honeypot field + rate limit + email verification**
outperforms a captcha at zero third-party cost.

---

### 4.13 Vercel AI Gateway / AI SDK — the AI onboarding chat

| Field | Value |
|---|---|
| Vendor / product | Vercel **AI Gateway**, via the **AI SDK** (`ai-sdk/gateway`) |
| Version | **`4.0.11`** [observed — user-agent literal `"ai-sdk/gateway/4.0.11"`] |
| Endpoint | `https://ai-gateway.vercel.sh/v4/ai` [observed] |
| Protocol header | `ai-gateway-protocol-version: 0.0.1` [observed] |
| Auth | `AI_GATEWAY_API_KEY` **or** a Vercel OIDC token (`getVercelOidcToken()`) [observed] |
| Also bundled | `@vercel/request-context` [observed] |

**Provider choice is a runtime setting.** From `131.8f878df5d7c38b5a.js` [observed verbatim]:

```js
const n = i.union([i.literal("vercel"), i.literal("openrouter")])
r = "onboardingChat.aiGateway"
a = "onboardingChat.aiGatewayShadow"
l = "onboardingChat.aiGatewayCostQualityTradeoff"
d = 0, c = 10                       // cost/quality slider bounds
u = "anthropic/claude-opus-4.7"     // default model
h = "openrouter/auto"               // OpenRouter fallback
p = ["anthropic/claude-opus-4.7", "anthropic/claude-opus-4.6", "anthropic/claude-opus-4.5",
     "anthropic/claude-sonnet-4.6", "anthropic/claude-sonnet-4.5", "anthropic/claude-haiku-4.5"]
```

So Studio's AI onboarding chat routes to **Anthropic Claude models** through either **Vercel AI
Gateway** or **OpenRouter**, with a 0–10 cost/quality tradeoff slider and a "shadow" mode for
side-by-side model comparison. [observed]

**Client/server split.** `AI_GATEWAY_API_KEY` is **blanked in production** (§3.2), and
`AI_CREATOR_BACKEND_URL = https://ai-creator-backend.restream.io` exists as a first-party service.
The browser therefore talks to Restream's backend, which holds the gateway credential. [inferred
from the observed guard + observed env var]

**Related feature flags:** `IS_ENABLED_AGENTATION` (prod `"false"`, host `http://localhost:4747`),
`?agentation=`, `?ai-onboarding-chat=`. The `agentation.6e2fe827872bef18.js` chunk (178 KB) is a
self-contained in-app annotation/feedback overlay (`--agentation-color-blue/green/red`, popup,
textarea, delete button) referencing `agentation.dev`. It is **off in production**. [observed]

**Also found:** `131.8f878df5d7c38b5a.js` contains a long English **system prompt** governing AI
layout generation, instructing the model not to add "placeholder graphics, diagonal stripes,
gradients, 'video renders here' text, loading states, mock video overlays, watermarks, or
decorative patterns inside the video areas." [observed] This confirms an LLM-driven scene/layout
generator. Full treatment belongs to the AI/widgets miner.

**Required for a clone?** **No** unless you want the AI onboarding chat.

**Alternatives.** **LiteLLM** (MIT — the direct OSS equivalent of an AI gateway: one OpenAI-shaped
API in front of 100+ providers, with budgets, keys, fallbacks and caching), **OpenRouter**
(hosted, already a supported provider here), **Portkey Gateway** (Apache-2.0),
**Helicone** (Apache-2.0, observability-first), or calling **Ollama**/**vLLM** directly for a
fully local clone. The **Vercel AI SDK itself is Apache-2.0** and can be pointed at any of these —
only the *Gateway* is proprietary.

---

## 5. Fonts — exact families, weights and licensing

### 5.1 Google Fonts requested at runtime

Two `@import`/`<link>` requests exist, both captured verbatim.

**(a) Shell `<link>` and main app CSS — Unbounded**

| Source | Request |
|---|---|
| `studio-shell.html` `<link rel=stylesheet>` | `https://fonts.googleapis.com/css2?family=Unbounded:wght@900&display=swap` |
| `css/restream.85b89da606457891.css` `@import` | `https://fonts.googleapis.com/css2?family=Unbounded:wght@200..900&display=swap` |

[observed] The shell asks for the single weight 900; the app CSS asks for the **variable range
200–900**. Both fire, so the browser fetches two stylesheets for one family. [inferred]

Used as `font-family: "Unbounded", Graphik, sans-serif` — a display face layered over the brand
sans. [observed]

**(b) Chat embed themes CSS — 10 families** (`css/restreamchatembedthemes.80c3d45ee11ec039.css`)

Full `@import` URL [observed]:

```
https://fonts.googleapis.com/css2?family=Akaya+Telivigala&display=swap
  &family=Hind+Madurai:wght@400;500;700
  &family=Hind+Siliguri:wght@400;500;700
  &family=Mali:wght@400;500;700
  &family=Noto+Sans+HK:wght@400;500;700
  &family=Noto+Sans+JP:wght@400;500;700
  &family=Noto+Sans+KR:wght@400;500;700
  &family=Noto+Sans+SC:wght@400;500;700
  &family=Noto+Sans+TC:wght@400;500;700
  &family=Noto+Sans:wght@400;700
  &family=Rubik:wght@400;500;700
```

### 5.2 Google Fonts — family / version / weight table

Versions come from the `v<N>` path segment of the 620 captured `.woff2` files in
`04-third-party-functional/google-fonts/files/fonts.gstatic.com/s/<family>/v<N>/…`. [observed]

| # | Family | gstatic version | Weights requested | Files captured | Script coverage / purpose | Licence |
|---|---|---|---|---|---|---|
| 1 | **Unbounded** | `v12` | `900` (shell) and `200..900` variable (app CSS) | — | Latin/Cyrillic display face | SIL OFL 1.1 [inferred] |
| 2 | **Akaya Telivigala** | `v28` | 400 (single weight) | 3 | Telugu + Latin | SIL OFL 1.1 [inferred] |
| 3 | **Hind Madurai** | `v13` | 400, 500, 700 | 12 | Tamil + Latin | SIL OFL 1.1 [inferred] |
| 4 | **Hind Siliguri** | `v14` | 400, 500, 700 | 9 | Bengali + Latin | SIL OFL 1.1 [inferred] |
| 5 | **Mali** | `v13` | 400, 500, 700 (+ italics captured) | 12 | Thai + Latin | SIL OFL 1.1 [inferred] |
| 6 | **Noto Sans** | `v42` | 400, 700 | 8 | Latin/Greek/Cyrillic base | SIL OFL 1.1 [inferred] |
| 7 | **Noto Sans HK** | `v35` | 400, 500, 700 | many (CJK subset shards `.0`–`.119`) | Traditional Chinese (Hong Kong) | SIL OFL 1.1 [inferred] |
| 8 | **Noto Sans JP** | `v56` | 400, 500, 700 | CJK subset shards | Japanese | SIL OFL 1.1 [inferred] |
| 9 | **Noto Sans KR** | `v39` | 400, 500, 700 | CJK subset shards | Korean | SIL OFL 1.1 [inferred] |
| 10 | **Noto Sans SC** | `v40` | 400, 500, 700 | CJK subset shards | Simplified Chinese | SIL OFL 1.1 [inferred] |
| 11 | **Noto Sans TC** | `v39` | 400, 500, 700 | CJK subset shards | Traditional Chinese | SIL OFL 1.1 [inferred] |
| 12 | **Rubik** | `v31` | 400, 500, 700 | — | Latin/Cyrillic/Hebrew | SIL OFL 1.1 [inferred] |

Capture totals: **622 files / 24.79 MB**, of which **620 are font binaries / 24.49 MB**, all
marked `valid_font` in `MANIFEST-google-fonts.csv`. [observed] The bulk is the five Noto CJK
families, which Google shards into 100+ unicode-range slices each.

**Every one of these 12 is a free/libre Google Font.** No licence restriction blocks a clone from
using or self-hosting them. [inferred — the OFL designation is from knowledge of these families,
not from a licence file in the capture]

### 5.3 Self-hosted `@font-face` families — **including the restricted ones**

Two CSS files declare `@font-face`. All 31 declarations are reproduced below.

#### (a) `css/Index.0a0f0df00de93ef5.css` — 9 declarations, app chrome + text tool

| Family | Weight / style | Files (`/assets/…`) | Licence status |
|---|---|---|---|
| **Graphik** | 700 normal | `Graphik-Bold-Cy-Web.{b11e7123…woff2, d17f9b5f…woff}` | ⚠️ **COMMERCIAL — RESTRICTED** |
| **Graphik** | 600 normal | `Graphik-Semibold-Cy-Web.{6f4e5b8d…woff2, d48d173a…woff}` | ⚠️ **COMMERCIAL — RESTRICTED** |
| **Graphik** | 500 normal | `Graphik-Medium-Cy-Web.{265489e2…woff2, effdfab3…woff}` | ⚠️ **COMMERCIAL — RESTRICTED** |
| **Graphik** | 400 **italic** | `Graphik-RegularItalic-Cy-Web.{26901847…woff2, d1f18a33…woff}` | ⚠️ **COMMERCIAL — RESTRICTED** |
| **Graphik** | 400 normal | `Graphik-Regular-Cy-Web.{d7f438ac…woff2, 162e6311…woff}` | ⚠️ **COMMERCIAL — RESTRICTED** |
| **Noto Color emoji** | normal | `NotoColorEmoji.209e7f25….ttf` | SIL OFL 1.1 [inferred] |
| **Creepster** | 400 normal | `Creepster-Regular.940f0e8c….ttf` | SIL OFL 1.1 [inferred] |
| **Pacifico** | 400 normal | `Pacifico-Regular.f8467571….ttf` | SIL OFL 1.1 [inferred] |
| **Josefin Sans** | variable, `wght 500`, `clig`/`liga` off | `JosefinSans-VariableFont_wght.94ef13d1….ttf` | SIL OFL 1.1 [inferred] |

#### ⚠️ GRAPHIK — the licensed font. Flagged as instructed.

**Confirmed: Graphik is NOT a Google Font and IS self-hosted.** [observed]

- Every `@font-face` `src` points to a **first-party** path `/assets/Graphik-*-Cy-Web.woff|woff2`.
- All **10 binaries are physically present** at
  `01-inside-studio-verified/referenced-static/studio.restream.io/assets/Graphik-*`. [observed]
- A `local("Graphik LC Web")` hint precedes each `url()` — the "LC Web" naming is the
  licensor's web-font distribution name. [observed]
- A preview asset also exists at
  `studio-assets-dev.restream.io/defaults/fonts/graphik/preview.svg`, referenced from the bundles
  — Graphik is offered in Studio's **text/font picker**, not merely in the UI chrome. [observed]

**Publisher:** Graphik is designed by Christian Schwartz and published by **Commercial Type**. It
is a **paid, licensed typeface**. There is no free tier and no OFL. Web use requires a Commercial
Type webfont licence, typically priced by monthly pageview band, and the licence explicitly
forbids redistributing the font files. [inferred — no licence file is present in the capture]

**"Cy" in the filenames** indicates the **Cyrillic-extended** cut, which is a separately licensed
character-set extension. [inferred]

**Consequences for a clone — read this before shipping:**

1. **Do not copy the `Graphik-*.woff2` files out of this capture into a clone.** Redistributing
   them is a licence breach independent of any Restream consideration.
2. Graphik is the **primary UI face** — `font-family: Graphik, sans-serif` appears **29 times** in
   `restream.85b89da606457891.css` alone, plus `Graphik, ui-sans-serif, system-ui, …` (3×),
   `"Graphik", serif` (1×), `Graphik-Bold-Web, Helvetica, Arial, sans-serif` (1×), and
   `"Unbounded", Graphik, sans-serif` (1×). [observed] Replacing it touches the whole design
   system.
3. **Free substitutes with the closest metrics/feel** (grotesque, slightly humanist, tall
   x-height): **Inter** (OFL — the safest general swap), **Public Sans** (OFL, USWDS),
   **Manrope** (OFL), **Be Vietnam Pro** (OFL), **Familjen Grotesk** (OFL), or
   **Geist Sans** (OFL, Vercel — visually very near Graphik's proportions). For a Cyrillic-capable
   swap that preserves the "Cy" coverage: **Inter** and **Manrope** both ship Cyrillic. [inferred]
4. If matching Graphik exactly matters, buy a licence from Commercial Type. There is no legal
   shortcut.

Also note `font-family: "IBM Plex Mono", monospace` (4×) and
`ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` (3×) in the main CSS with
**no matching `@font-face`** — IBM Plex Mono is referenced but never loaded, so it silently falls
back to the system monospace unless the user has it installed. [observed] IBM Plex Mono is OFL, so
a clone may simply self-host it and fix the bug. Two further stray declarations exist:
`"Roboto","Open Sans","Segoe UI",sans-serif!important` and `"Google Sans",arial,sans-serif!important`
— both `!important`, both almost certainly overrides targeting embedded Google widgets. **[UNRESOLVED
which widget]**

#### (b) `css/restreamchatembedthemes.80c3d45ee11ec039.css` — 22 declarations, chat overlay themes

All are served from **hash-named first-party paths** (`/<16-hex>.woff2` + `/<16-hex>.woff`),
all `font-weight: 400; font-style: normal` regardless of the real weight. All 26 woff2 + 26 woff
binaries are present in `referenced-static`. [observed]

| # | `font-family` | woff2 | woff | Likely licence [inferred] |
|---|---|---|---|---|
| 1 | `LuckiestGuy` | `77f87b02c92bc429` | `fc66567dc58a1470` | SIL OFL 1.1 (Google Fonts) |
| 2 | **`BurbankBigCondensedBold`** | `8f649b6d8e721ec8` | `b6f42d4aaa609618` | ⚠️ **COMMERCIAL — Burbank, Font Bureau / Type Network** |
| 3 | `Ubuntu-Regular` | `262ea7e961e1932e` | `4071ca55013f225f` | Ubuntu Font Licence 1.0 (free, but *not* OFL — has its own terms) |
| 4 | **`Expressway`** | `b66be6aaea684ab5` | `c0a26c26bf317184` | ⚠️ **COMMERCIAL — Expressway, Typodermic Fonts** |
| 5 | `PressStart2P` | `10a295ed0f73b1c3` | `56feb6836775d873` | SIL OFL 1.1 |
| 6 | `Roboto-Medium` | `f8693cca22ae31bc` | `4fa4b1c02a877115` | Apache-2.0 |
| 7 | `Roboto-Bold` | `2a63183e6dff7d00` | `29ac6158e35aee95` | Apache-2.0 |
| 8 | `Roboto-Regular` | `4e7449338f3a9fee` | `4557104648f65fcc` | Apache-2.0 |
| 9 | `Oswald-Medium` | `5e6165d08f826c2b` | `89cadce5f95a22ce` | SIL OFL 1.1 |
| 10 | **`Rainbow`** | `0dfada03db8e5a01` | `d96303d2e1339268` | ⚠️ **UNRESOLVED** — several unrelated faces are named "Rainbow"; provenance not determinable from the capture |
| 11 | `Teko-Regular` | `1083c8e9fff4191c` | `4a82f39fd7a1142f` | SIL OFL 1.1 |
| 12 | `Exo2-Bold` | `881d1d536b301a88` | `3504ce51476aba6a` | SIL OFL 1.1 |
| 13 | `ShareTech-Regular` | `b5feb09ef7867ae6` | `6151fa3b7bc45137` | SIL OFL 1.1 |
| 14 | `Staatliches-Regular` | `0f8f3ede8bd1ce24` | `082dec0e64ffe64a` | SIL OFL 1.1 |
| 15 | `WorkSans-Medium` | `87077f7708127fb3` | `c67280dd7893bfee` | SIL OFL 1.1 |
| 16 | `WorkSans-SemiBold` | `b10a6239535cd12a` | `20af8042ec451087` | SIL OFL 1.1 |
| 17 | `Philosopher-Bold` | `ab308a653df035d2` | `b994f352c1ea8090` | SIL OFL 1.1 |
| 18 | `Philosopher-Regular` | `2576cd886168696a` | `03a9e7dba59d1460` | SIL OFL 1.1 |
| 19 | `VT323-Regular` | `dc79712ce01f6547` | `82effe76ef7c03ae` | SIL OFL 1.1 |
| 20 | `Rubik` (400) | `77839c550d20ff77` | `fd9481a86ab772c9` | SIL OFL 1.1 |
| 21 | `Rubik` (500) | `61422b2b23680db4` | `484cf41e319c9196` | SIL OFL 1.1 |
| 22 | `Bangers` | — | `cd47484db99dcbe3.otf` (opentype) | SIL OFL 1.1 |

**Licensing verdict for a clone.** Of the 31 self-hosted families:
**Graphik (5 cuts), Burbank Big Condensed Bold, and Expressway are commercially licensed and must
not be copied.** `Rainbow` is unresolved and should be treated as restricted until proven
otherwise. Ubuntu is free but under the UFL, which imposes a renaming requirement on modified
copies. Everything else is OFL or Apache-2.0 and is safe to self-host.

Free substitutes: **Burbank Big Condensed** → **Bowlby One SC** / **Anton** / **Archivo Narrow
ExtraBold** (all OFL); **Expressway** → **Saira Semi Condensed** / **Barlow Semi Condensed**
(OFL, both are DIN-adjacent like Expressway). [inferred]

### 5.4 Fonts pulled in transitively by Intercom

The Intercom messenger loads its own faces, which a clone inherits for free if it keeps Intercom
and avoids entirely if it does not. [observed from `04-third-party-functional/intercom/assets`]

| Source host | Families | Files | Licence |
|---|---|---|---|
| `fonts.gstatic.com` | **Inter** `v20`, **Roboto** `v51`, **JetBrains Mono** `v24` | 35 | OFL / Apache-2.0 [inferred] |
| `fonts.googleapis.com` | 2 CSS query responses | 2 | — |
| `fonts.intercomcdn.com/ll-ivory` | **Ivory LL** Light + Medium (woff + woff2) | 4 | ⚠️ **COMMERCIAL — Lineto** [inferred] |
| `fonts.intercomcdn.com/messenger-m4` | **Proxima Nova** Regular, Regular-Italic, Semibold, Semibold-Italic (woff) | 4 | ⚠️ **COMMERCIAL — Mark Simonson Studio** [inferred] |

Stripe similarly ships **7 unnamed `.woff2`** files from `js.stripe.com/v3/` into its own iframes;
they are Stripe's licensed assets and are not exposed to the host page. [observed]

---

## 6. Bundled third-party JS libraries

Not "services" — code compiled into the bundles. Every row was confirmed by a literal signature.

### 6.1 Media / WebRTC / streaming

| Library | Version [observed] | Where | Purpose | Clone-critical? |
|---|---|---|---|---|
| **mediasoup-client** | 3.x [inferred from `mediasoup-client-v${version}` SDP username + 3.x module layout] | `externals`, `Index` | **The SFU client.** Builds the SDP (`iceOptions: "ice2"`, optional `ice-lite`) and drives send/recv transports | **YES — core** |
| **hls.js** | **`1.3.5`** [observed — `{key:"version",get:(){return "1.3.5"}}`] | `hlsjs.3e5d0a83ecd57757.js` (400 KB), used by video editor | HLS playback of RTMP-pulled sources, recordings, playlists | **YES** |
| **MediaPipe Tasks Vision** | — [**UNRESOLVED**: no version literal; 3,886 `mediapipe.*` proto symbols] | `mediapipetasksvision…js` (881 KB) + `/mediapipe/vision_wasm_internal.{js,wasm}` + `vision_wasm_nosimd_internal.{js,wasm}` | **Virtual background / segmentation.** Bundle contains the full Tasks-Vision graph: image_segmenter, face_landmarker, face_detector, face_geometry, face_stylizer, hand_landmarker, hand_detector, gesture_recognizer, pose_landmarker, pose_detector, object_detector, embedder/classifier containers, GPU inference delegate | **YES** for background removal |
| MediaPipe **models** (3, captured) | `latest` | `storage.googleapis.com/mediapipe-models/…` | `selfie_multiclass_256x256/float32` (16.4 MB), `selfie_segmenter/float16` (250 KB), `selfie_segmenter_landscape/float16` (250 KB) | **YES** — models are Apache-2.0, self-host them |
| **AWS SDK for JavaScript v2** | **`2.1337.0`** in `awssdk…js`; **`2.1148.0`** embedded in `restream…js` | 3.3 MB chunk + main | Direct-to-S3 multipart upload of recordings/media | Replaceable |
| **hark** (audio level detection) | — [inferred from the `fftSize:512`, `smoothingTimeConstant`, `threshold:-50`, `interval:50` signature] | `externals` | Speaking/VU detection | Replaceable |
| **detect-gpu** | **`4.0.8`** [observed] | `externals` | GPU capability tiering (`mobileTiers`/`desktopTiers` `[0,15,30,60]`) to gate effects | Replaceable |
| **three.js** | **`r184`** [observed — `t.setAttribute("data-engine","three.js r184")`] | `externals` | WebGL compositing; includes the **TSL / WebGPU node** system | Likely core to the renderer |

**Note on `three.js r184`**: the presence of TSL (`THREE.Node.captureStackTrace`, `TSL:` log
prefix) means the WebGPU-capable node material system is bundled, which is a very recent three.js
line. [observed]

### 6.2 State, DI and data

| Library | Version | Where | Notes |
|---|---|---|---|
| **React** | **`18.3.1`** [observed] | `externals` | Not 19 |
| **MobX** | — [**UNRESOLVED**] | `externals` (31 sigs), `Index` | **Primary state layer** — `makeObservable`, `observable.ref`, `computed`, `reaction`, `autorun`, `runInAction` are everywhere in the store classes |
| **InversifyJS** | — [**UNRESOLVED**] | 10 bundles; 234 sigs in `131`, 111 in `577` | **Dependency injection container.** `toDynamicValue(({container}) => container.get(t)).inSingletonScope()`, `@injectable`, `Reflect.decorate` (52×), `reflect-metadata` |
| **Redux / Redux Toolkit** | — | `externals`, `restream`, video editor | Secondary; video editor state |
| **Immer** | — | `131`, `575`, `restream` (49), video editor (27) | Immutable updates |
| **Zod** | — [**UNRESOLVED**; 402 sigs] | `externals`, `restream` | Runtime schema validation |
| **io-ts + fp-ts** | — | `Index`, `externals` | The **older** validation stack — `PathReporter`, `t.readonly(t.type({…}), "NameIO")`. Used for `ProcessEnv` and all `*IO` API decoders. Coexists with Zod |
| **TanStack Query (react-query)** | — | `575`, `externals`, `restream` (51) | Server-state cache; observed config `retry: 0, refetchOnWindowFocus: false, staleTime: Infinity` |
| **React Router** | — | `restream` | Routing |
| **Ramda** | — [inferred from 46 `@transducer/step` + `@functional/placeholder`] | `externals`, `restream` | Functional utilities |
| **Lodash** | — | `externals`, `restream` | Utilities |
| **date-fns** | — | `externals`, `restream` | Date handling (no moment.js) |
| **nanoid** | — | `externals` | ID generation |
| **uuid** | — | 6 bundles | ID generation |
| **Axios** | — | `externals` | HTTP client |
| **debug** | — | `externals` (70), `Index` | mediasoup-client's logger; Studio force-enables `mediasoup-client:ERROR*` |

### 6.3 UI

| Library | Version | Where | Notes |
|---|---|---|---|
| **Radix UI** | — | `externals` (16), `restream` (39), video editor (19) | Headless primitives |
| **Base UI** | — | `externals` | MUI's newer headless lib — `https://base-ui.com/production-error`. Coexists with Radix ⇒ a migration in progress [inferred] |
| **Floating UI + Popper.js v1** | — | 6 bundles; 199 sigs in `restream`, 172 in `externals` | **Both** generations present — Popper 1.x (`Popper.Defaults`, `.jquery` probe) and the modern Floating UI. Another in-flight migration [inferred] |
| **Tailwind CSS** | — | `restream` | `tw-` prefixed utilities (`tw-pt-2`, `tw-underline`, `tw-whitespace-nowrap`) alongside CSS Modules |
| **Emotion** | — | `externals`, `restream`, video editor | `@emotion/is-prop-valid` |
| **Lucide** (icons) | — | 6 bundles | `lucideVariant` class names |
| **Recharts** | — | `restream` (40) | Analytics charts |
| **react-joyride** | — | `externals` (19) | Product tours / onboarding coachmarks |
| **Formik** | — | `externals` | Forms |
| **Downshift** | — | `restream` | Autocomplete/combobox |
| **cropperjs** | — | `externals` (34); SCSS `node_modules/cropperjs/dist/cropper.css` | Image cropping (avatars/overlays) |
| **rc-dialog** | — | `externals`; SCSS `node_modules/rc-dialog/assets/bootstrap.css` | Legacy modal |
| **classnames / clsx** | — | `externals`, `restream` | Class composition |
| **Lexical** | **`0.44.0+prod.esm`** [observed] | `externals` | **Meta's rich-text editor.** Extensions bundled: `@lexical/extension/{AutoFocus, ClearEditor, DecoratorText, EditorState, InitialState, NodeSelection, LexicalBuilder}`, plus `@lexical/{rich-text, plain-text, html, history, utils, react, dragon, clipboard}`. Includes `INSERT_HORIZONTAL_RULE_COMMAND` |
| **QRCode** | — | 6 bundles | Pairing / mobile-camera QR |
| **chroma-js / color-convert** | — | `externals` (27) | Colour maths for themes |
| **UAParser.js** | **`0.7.33`** [observed — `G.VERSION="0.7.33"`] | `restream` | Browser/OS/device detection |
| **core-js** | — | `externals`, `restream` | Polyfills |

### 6.4 Restream's own internal packages (visible via SCSS source maps)

Recovered from `node_modules/` paths inside the 23 CSS source maps in
`03-deep-static/source-maps/extracted`. [observed] These are **first-party monorepo packages**,
not third parties, but a clone must reproduce their responsibilities:

| Package | CSS artefacts |
|---|---|
| `@restream/ui-kit` | `dist/style.css` |
| `@restream/styles` | `scss/media.scss`, `scss/outline.scss` |
| `@restream/auth` | `dist/style.css`, `dist/components.css` — the login/signup + captcha + Google button surface (§4.12) |
| `@restream/chat-embed-themes` | `dist/chat-embed-themes.css` — the 22 chat fonts (§5.3b) |
| `@restream/e-commerce` | `dist/style.css` |
| `@restream/video-editor` | `dist/style.css` |
| `@restream/website-dashboard-sdk` | `dist/style.css` |

Only **2 genuine third-party CSS packages** reach the stylesheet: `cropperjs` and `rc-dialog`. [observed]

### 6.5 Not present — explicitly ruled out

Each of these was scanned for and returned **zero genuine hits**. Listed because their absence is
itself a design decision a clone should know about. [observed]

`@sentry/*` · Agora SDK¹ · Twilio Video · Daily.co · LiveKit · Janus · PeerJS · simple-peer ·
OpenTok/Vonage · socket.io / engine.io² · Firebase · Pusher · Ably³ · GTM / dataLayer ·
Facebook Pixel · Mixpanel · PostHog · Hotjar · FullStory · LogRocket · Heap · Plausible ·
LaunchDarkly · Optimizely · Statsig · Split.io · Unleash · GrowthBook · Pendo · Appcues ·
Userflow · Chameleon · Shepherd.js · OneTrust / Cookiebot / Usercentrics (**no consent-management
platform at all**) · PayPal · Paddle · Chargebee · Recurly · Zendesk · Wistia · Mux Data /
mux-embed⁴ · ffmpeg.wasm · TensorFlow.js · ONNX Runtime · OpenCV.js · Giphy · Unsplash ·
Algolia · Cloudinary · imgix · moment.js · styled-components · MUI (classic) · Chart.js · D3 ·
Quill · Slate · Draft.js · TipTap/ProseMirror · DOMPurify · jszip · PapaParse · emoji-mart ·
Comlink · RxJS · XState · Zustand⁵ · Konva · PixiJS · GSAP · Lottie · Framer Motion.

¹ The token `agora` appears only in the onboarding customer-logo list as `"Agora 1 by Odyssey"`
(an asset filename and display name) — **not** the Agora RTC SDK. [observed]
² `socket.io` absent; watchRTC uses a raw `WebSocket`. [observed]
³ Ably appears only *inside Intercom's* bundle as a connectivity probe. [observed]
⁴ `Mux` appears only as **streaming destination `serviceId: 80, serviceName: "Mux"`** — a
platform users stream *to*, not analytics. [observed]
⁵ One incidental `zustand` string in `restream.js` with no accompanying API surface. **[UNRESOLVED]**

**Notable absence: no consent-management platform.** Studio loads Segment→Amplitude, Datadog RUM,
Intercom, Canny and watchRTC with **no cookie banner and no consent gate in the shell**. Datadog's
`trackingConsent` option is present in the SDK but no call site sets it. [observed] A clone
operating in the EU/UK would need to add one. [inferred]

---

## 7. Third-party hosts contacted at runtime — consolidated

Derived from a full `https?://host` sweep of all 37 JS + 23 CSS bundles plus the shell.
"Runtime" excludes documentation links, error-message URLs and support-article links.

| Host | Service | Trigger | Data sent |
|---|---|---|---|
| `fonts.googleapis.com` | Google Fonts CSS | Page load (2 requests) | Referer, UA |
| `fonts.gstatic.com` | Google Fonts binaries | After CSS | Referer, UA |
| `evs.cdp.restream.io` | **Segment** (first-party proxy) | Page load | All analytics events |
| `widget.intercom.io` → `js.intercomcdn.com` | **Intercom** | Page load (unless gated) | §4.2 payload |
| `api-iam.intercom.io` | Intercom API/telemetry | After widget boot | Conversation + identity |
| `intercom-sheets.com` | Intercom YouTube/Sheets proxy | Inside messenger | — |
| `www.intercom-reporting.com` | Intercom Sentry proxy | Intercom errors | Intercom stack traces |
| `internet-up.ably-realtime.com` | Intercom connectivity probe | Intercom realtime | — |
| `canny.io` | **Canny** SDK | Page load (unless gated) | id, email, avatarURL |
| `dd.restream.io` | **Datadog** (first-party proxy) | Continuous | RUM + logs + global context |
| `amp.restream.io` | **Amplitude Experiment** (first-party proxy) | On boot + 5-min poll | user/device id, flag keys |
| `apis.google.com` | **gapi** | Page load (`async`) | — |
| `www.googleapis.com` | Google Drive API | Slides import | OAuth token, file id |
| `accounts.google.com` | Google OAuth / Sign-In | Auth + Drive | — |
| `js.stripe.com` | **Stripe.js v3** | Billing screens | Publishable key + card data (in-iframe) |
| `challenges.cloudflare.com` | **Turnstile** | Signup/login forms | Fingerprint, IP |
| `www.google.com/recaptcha` | **reCAPTCHA** | Signup/login fallback | Fingerprint, IP |
| `qualityrtc-sdk.s3.amazonaws.com` | **qualityRTC** test bundle | Network test run | — |
| `watchrtc.spearline.dev` / `watchrtc-server.cyara.com` | **watchRTC** WS | Eligible sessions | Full WebRTC stats |
| `storage.googleapis.com/mediapipe-models` | MediaPipe **models** | Virtual background enable | — (large download: 16.4 MB / 250 KB) |
| `unpkg.com/react-scan` | **react-scan** | `?react-scan` only | — |
| `unpkg.com/detect-gpu@4.0.8/dist/benchmarks` | detect-gpu benchmark data | GPU tiering, unless `benchmarksURL` overridden | — **[UNRESOLVED whether Restream overrides it]** |
| `ai-gateway.vercel.sh` | **Vercel AI Gateway** | AI chat (server-side) | Prompts |
| `code.jquery.com` | jQuery | **never — commented out** | — |
| `cdn-3.convertexperiments.com` | Convert Experiments | **never — commented out** | — |

### 7.1 Hosts that look third-party but are not integrations

Listed to prevent a clone from wiring up phantom dependencies. [observed]

| Host | What it actually is |
|---|---|
| `customer-gllhkkbamkskdl1p.cloudflarestream.com` | **Placeholder text** in the "Custom WHIP" destination URL field (`serviceId: 81`) |
| `ticker.polymarket.com` | **Placeholder text** in the Live Studio Widget "Source URL" field (a browser-source example) |
| `restreamdemostore.myshopify.com` | Demo store for the Shopify e-commerce integration |
| `vertical-plugin.restream.io` | Download links for Restream's own OBS vertical plugin (`obs-vertical-plugin-macos.pkg`, `obs-vertical-plugin-windows.exe`) |
| `player.vimeo.com`, `www.youtube.com`, `www.dailymotion.com`, `kick.com`, `rumble.com`, `live.bilibili.com`, `live.fc2.com`, `pro.x.com`, `livecenter.tiktok.com`, `www.picarto.tv`, `goodgame.ru`, `vaughnlive.tv`, `breakers.tv`, `instagib.tv`, `chew.tv`, `vapers.tv`, `www.mobcrush.com`, `www.younow.com`, `streamcraft.com`, `livehouse.in`, `tv.majorleaguegaming.com`, `www.cavelis.net` | **Streaming destination platforms** — dashboard/help deep-links. Belongs to the destinations miner |
| `support.restream.io` (83 refs), `github.com`, `www.w3.org` (1,028), `www.ietf.org`, `developer.mozilla.org`, `radix-ui.com`, `redux.js.org`, `lexical.dev`, `base-ui.com`, `json-schema.org`, `aomedia.org`, `jcgt.org`, `npms.io`, `git.io`, `bit.ly`, `reactjs.org`, `example.com` | Documentation, error-message and SVG-namespace URLs. Not network calls |
| `*.amazonaws.com` (≈200 refs in `awssdk…js`) | AWS SDK v2's **built-in service endpoint table** (ec2, rds, route53, s3, sns, sqs, ses, iam, sts, cloudformation, elasticache, elasticbeanstalk, elasticloadbalancing, monitoring, redshift, autoscaling). Only S3 is actually used |
| `agentation.dev` | The disabled in-app annotation overlay (`IS_ENABLED_AGENTATION: "false"`) |

---

## 8. Clone decision matrix

| Service | Required? | Effort to remove | Recommended replacement |
|---|---|---|---|
| **mediasoup-client** | **CORE** | — | Keep, or **LiveKit** (Apache-2.0) / **Janus** (GPL) / **Pion** (MIT) |
| **hls.js** | **CORE** | — | Keep (Apache-2.0) or **Shaka Player** (Apache-2.0) / **video.js** (Apache-2.0) |
| **MediaPipe Tasks Vision** | **CORE** for virtual background | — | Keep (Apache-2.0) and self-host the `.tflite` models + wasm |
| **three.js** | **CORE** for compositing | — | Keep (MIT) |
| Stripe | Only if billing | Low (isolated) | **Lago** / **Kill Bill** + any processor |
| Intercom | No | Trivial (delete 1 snippet) | **Chatwoot** (MIT) |
| Canny | No | Trivial | **Fider** (MIT) |
| Segment + Amplitude Analytics | No | Low | **PostHog** (MIT) |
| Amplitude Experiment | No | Medium (flag call sites) | **Unleash** / **GrowthBook** / **PostHog flags** |
| Datadog RUM + Logs | No | Low | **GlitchTip** / **Highlight.io** / **OTel + Grafana Faro** |
| watchRTC / qualityRTC | No | Low (a service wrapper) | Own `getStats()` collector; **rtcstats** (Apache-2.0); **webrtc-troubleshooter** for the pre-call test |
| Google gapi + Picker | Only for Drive/Slides | Medium | **Uppy + Companion** (MIT) + **Gotenberg**/LibreOffice for PDF export |
| reCAPTCHA | No (Turnstile already wins) | Trivial | Keep **Turnstile**, or **Altcha** / **mCaptcha** |
| Turnstile | Recommended for public signup | Low | **Altcha** (MIT) if fully self-hosted |
| Vercel AI Gateway | Only for AI chat | Low | **LiteLLM** (MIT) / **Portkey** (Apache-2.0) / Ollama |
| Google Fonts | No | Low | Self-host the same 12 OFL families |
| **Graphik** | ⚠️ **licence blocker** | Medium (design-system-wide) | **Inter** / **Geist Sans** / **Manrope** (all OFL) |
| Burbank / Expressway / "Rainbow" | ⚠️ **licence blocker** | Low (chat themes only) | **Anton**/**Bowlby One SC**; **Saira**/**Barlow Semi Condensed** |
| AWS SDK v2 | Replaceable | Medium | **AWS SDK v3** (smaller) or **MinIO** client for S3-compatible self-hosting |
| react-scan | **No — dev only** | Trivial | React DevTools Profiler |
| jQuery | **No — already inert** | None | — |
| Convert Experiments | **No — already inert** | None | — |

---

## 9. Open items — UNRESOLVED

Listed with everything known, per the exhaustiveness requirement.

| # | Item | What is known | What is missing |
|---|---|---|---|
| 1 | **qualityRTC `main.bundle.js`** | Version `1.43.2-beta.1` proven by directory name; URL template proven; config fetched from `/get-qualityrtc-config?apiKey=` or `{configUrl}/.netlify/functions/get-config` | The bundle itself is absent (empty directory; capture logs `unavailable_http_403: 1`). Exact test battery is inferred, not observed |
| 2 | **`Rainbow` font provenance** | `@font-face{font-family:Rainbow; src:url(/0dfada03db8e5a01.woff2), url(/d96303d2e1339268.woff)}`; both binaries present in `referenced-static` | Which "Rainbow" typeface this is, and therefore its licence. Treat as restricted |
| 3 | **MediaPipe Tasks Vision version** | 3,886 `mediapipe.*` proto symbols; full task set enumerated; wasm files present | No `version`/semver literal anywhere in the 881 KB chunk |
| 4 | **mediasoup-client version** | `mediasoup-client-v${u.version}` template observed in SDP `origin.username`; 3.x module layout | The `u.version` constant is not resolvable from the minified graph |
| 5 | **MobX / InversifyJS / Zod versions** | All three confirmed present with heavy usage (Inversify: 234 sigs in one chunk; Zod: 402) | No version literals survive minification |
| 6 | **`"Google Sans", arial, sans-serif !important`** and **`"Roboto","Open Sans","Segoe UI",sans-serif !important`** in `restream.85b89da606457891.css` | Both are `!important` overrides with no matching `@font-face` | Which embedded third-party widget they target |
| 7 | **`"IBM Plex Mono", monospace`** (4 occurrences) | Referenced in the main CSS | **No `@font-face` and no binary** — the family is never loaded. Silent fallback bug, or an intentional system-font-only reference |
| 8 | **detect-gpu benchmark fetch** | Default `benchmarksURL = https://unpkg.com/detect-gpu@4.0.8/dist/benchmarks`; the option is overridable | Whether Restream passes an override. If not, GPU tiering makes a **live unpkg request** in production |
| 9 | **`studio_example_one/two/three`** Amplitude flags | Defined in `AmplitudeFlagsStore` with placeholder variants | No consumers found — scaffolding, or consumed in a chunk not present |
| 10 | **`zustand`** string in `restream.887ca3d5bcd09a3a.js` | Exactly 1 occurrence | No `create()`/store API surface accompanies it. Probably a stale comment or a bundled dep's peer reference |
| 11 | **Segment write key** | Delivered inside `https://evs.cdp.restream.io/bgR2R8cwnEzn69s63TNTmY/hNoNGLcHeAvVUQH3crgg94.min.js` | The key is not in the shell (`analytics._writeKey = key` where `key` is `undefined` at snippet scope) — it must be baked into the proxied bundle, which is not on disk |
| 12 | **`AGENTATION_HOST: "http://localhost:4747"`** | Shipped in the production env blob with `IS_ENABLED_AGENTATION: "false"` | A localhost URL in a production config. Harmless while disabled, but it means the feature is developer-local only. Whether a hosted counterpart exists is unknown |

---

## 10. Cross-references

| Topic | Owning document |
|---|---|
| MediaPipe segmentation models, `.cube` LUTs, background effects | `TOOLS-02-video-filters-backgrounds.md` |
| hls.js playback, AWS SDK uploads, video editor chunk | `TOOLS-10-media.md` / sub-apps miner |
| Streaming destinations (Mux, Kick, Vimeo, Custom WHIP, …) | `TOOLS-05a-destinations-list.md` |
| Graphik / Unbounded as design tokens | `SPEC-design-tokens.md` |
| Chat embed themes and their 22 fonts | chat/overlay miner |
| AI onboarding chat, layout-generation system prompt, agentation | AI/widgets miner |
