# Restream Studio — Design Token System (extracted)

Source of truth for this document:

| Source | Path |
|---|---|
| Compiled production CSS (23 bundles) | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/css` |
| Recovered SCSS (447 unique files) | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/03-deep-static/source-maps/extracted` |

## 0. Headline numbers

| Metric | Value |
|---|---|
| CSS bundles | 23 |
| Bundles that define **any** custom property | 7 (`restream` = 285, `131` = 43, `114` = 33, `575` = 14, `onboarding-chat` = 6, `externals` = 2, `593` = 2) |
| Distinct `--name:` declarations found | **374** |
| — Tailwind internals (`--tw-*`) | 72 |
| — Parse artefacts (CSS-module hash names containing `--`: `--0C`, `--B`, `--b2`, `--default___pwmuT`, `--info___RZhqx`, `--isSelected__UFwCT`, `--outline___BXvAv`, `--primary___yib2w`) | 8 |
| — **Genuine app tokens** | **294** |
| — of which `--color-*` palette | 87 |
| — of which `--theme-*` (Theme module) | 33 |
| — of which `--rdp-*` (react-day-picker vendor) | 7 |
| Custom properties **referenced via `var()` but never defined in CSS** (set from JS/inline, or dead Figma aliases) | 179 |
| Unique SCSS `$variable` declarations | 337 |
| `@font-face` blocks | 33 (26 distinct families) |

**Theme selectors in production CSS:** `[data-theme="dark"]` (1231 rules), `[data-theme="blue"]` (1169 rules), `.tw-dark` (78), `.tw-light` (2), palette scope `:where(.twp)`.

---

## 1. CSS custom properties in production CSS

### 1.1 Core colour palette — defined on `:where(.twp)`

The whole primitive palette lives in **one** rule in `restream.85b89da606457891.css`, scoped to `:where(.twp)` (the Tailwind-preflight wrapper class). Zero specificity, so it behaves like `:root`.

```css
/* Restream Studio — primitive colour palette
   Production origin: restream.85b89da606457891.css  ->  :where(.twp) { ... } */
:root {
  --body-background: #191919;

  --color-white: #fff;
  --color-black: #000;

  /* ---- Gray (surfaces + text) ---- */
  --color-gray-25:  #fafbfc;
  --color-gray-50:  #f5f6f8;
  --color-gray-100: #edf0f3;
  --color-gray-150: #ebecf1;
  --color-gray-200: #d7dce3;
  --color-gray-300: #aeb5bd;
  --color-gray-400: #aeb5bd;   /* NOTE: identical to 300 — see §7 */
  --color-gray-500: #6b778c;
  --color-gray-600: #42526e;
  --color-gray-700: #2b3d5c;
  --color-gray-800: #172b4d;
  --color-gray-850: #0f2447;
  --color-gray-900: #091e42;

  /* ---- Blue (brand / accent) ---- */
  --color-blue-25:  #f5f8ff;
  --color-blue-50:  #eff4ff;
  --color-blue-100: #d1e0ff;
  --color-blue-200: #b2ccff;
  --color-blue-300: #84adff;
  --color-blue-400: #377aff;
  --color-blue-500: #2970ff;   /* brand primary */
  --color-blue-600: #155eef;
  --color-blue-650: #0a56ed;
  --color-blue-700: #004eeb;
  --color-blue-800: #0040c1;
  --color-blue-900: #00359e;

  /* ---- Red (error / destructive) ---- */
  --color-red-25:  #fffbfa;
  --color-red-50:  #fef3f2;
  --color-red-100: #fee4e2;
  --color-red-200: #fecdca;
  --color-red-300: #fda29b;
  --color-red-400: #f97066;
  --color-red-500: #f04438;
  --color-red-600: #d92d20;
  --color-red-700: #b42318;
  --color-red-800: #912018;
  --color-red-900: #7a271a;

  /* ---- Yellow (warning) ---- */
  --color-yellow-25:  #fffcf5;
  --color-yellow-50:  #fffaeb;
  --color-yellow-100: #fef0c7;
  --color-yellow-200: #fedf89;
  --color-yellow-300: #fec84b;
  --color-yellow-400: #fdb022;
  --color-yellow-500: #f79009;
  --color-yellow-600: #dc6803;
  --color-yellow-700: #b54708;
  --color-yellow-800: #93370d;
  --color-yellow-900: #7a2e0e;

  /* ---- Green (success) ---- */
  --color-green-25:  #f6fef9;
  --color-green-50:  #ecfdf3;
  --color-green-100: #d1fadf;
  --color-green-200: #a6f4c5;
  --color-green-300: #6ce9a6;
  --color-green-400: #32d583;
  --color-green-500: #12b76a;
  --color-green-600: #039855;
  --color-green-700: #027a48;
  --color-green-800: #05603a;
  --color-green-900: #054f31;

  /* ---- Orange-dark (live / on-air / recording) ---- */
  --color-orange-dark-25:  #fff9f5;
  --color-orange-dark-50:  #fff4ed;
  --color-orange-dark-100: #ffe6d5;
  --color-orange-dark-200: #ffd6ae;
  --color-orange-dark-300: #ff9c66;
  --color-orange-dark-400: #ff692e;
  --color-orange-dark-500: #ff4405;
  --color-orange-dark-600: #e62e05;
  --color-orange-dark-700: #bc1b06;
  --color-orange-dark-800: #97180c;
  --color-orange-dark-900: #771a0d;

  /* ---- Decorative single-stop hues (400 only) ---- */
  --color-violet-100:      #ece9fe;
  --color-violet-400:      #a48afb;
  --color-moss-400:        #86cb3c;
  --color-green-light-400: #85e13a;
  --color-green-dark-400:  #3ccb7f;
  --color-teal-400:        #2ed3b7;
  --color-cyan-400:        #22ccee;
  --color-blue-light-400:  #36bffa;
  --color-blue-dark-400:   #53b1fd;
  --color-indigo-400:      #8098f9;
  --color-purple-400:      #9b8afb;
  --color-fuchsia-400:     #e478fa;
  --color-pink-400:        #f670c7;
  --color-rose-400:        #fd6f8e;
  --color-orange-400:      #f38744;
  --color-yellow-dark-400: #fac515;
}
```

The same rule also carries the spacing / typography / radius scales — see §3 and §4.

### 1.2 Theme tokens — `--theme-<name>-<token>` on `:root`

Generated by `scripts/modules/Theme/themes-styles.scss` from the `$themes` Sass map. Two themes: **blue** (legacy, 1 token only) and **dark** (fully tokenised, 32 tokens).

```css
/* Restream Studio — Theme module tokens
   Production origin: restream.85b89da606457891.css  ->  :root { ... }
   Applied via [data-theme="blue"] / [data-theme="dark"] on an ancestor. */
:root {
  /* ===== blue theme (legacy — everything else is hard-coded hex, see §6) ===== */
  --theme-blue-color-primary: #2970ff;

  /* ===== dark theme ===== */
  /* accent */
  --theme-dark-color-accent-normal:   #004eeb;
  --theme-dark-color-accent-rollover: #6695f3;
  --theme-dark-color-accent-pressed:  #002f8d;

  /* white scale (foreground / translucent surfaces) */
  --theme-dark-color-white-thin:                  rgba(255, 255, 255, 0.05);
  --theme-dark-color-white-thin-rollover:         rgba(255, 255, 255, 0.15);
  --theme-dark-color-white-thin-pressed:          rgba(0, 0, 0, 0.2);
  --theme-dark-color-white-thin-solid:            #2b2a2a;
  --theme-dark-color-white-normal:                rgba(255, 255, 255, 0.15);
  --theme-dark-color-white-normal-rollover:       rgba(255, 255, 255, 0.3);
  --theme-dark-color-white-normal-pressed:        rgba(255, 255, 255, 0.05);
  --theme-dark-color-white-normal-solid:          #414141;
  --theme-dark-color-white-normal-rollover-solid: #5f5f5f;
  --theme-dark-color-white-muted:                 rgba(255, 255, 255, 0.5);
  --theme-dark-color-white-thick:                 rgba(255, 255, 255, 0.8);
  --theme-dark-color-white-thick-rollover:        #fff;   /* compiled as `white` */
  --theme-dark-color-white-thick-pressed:         rgba(255, 255, 255, 0.2);
  --theme-dark-color-white-solid:                 #fff;

  /* black scale (scrims / wells) */
  --theme-dark-color-black-thin:            rgba(0, 0, 0, 0.05);
  --theme-dark-color-black-thin-rollover:   rgba(255, 255, 255, 0.15);  /* sic — see §7 */
  --theme-dark-color-black-thin-pressed:    rgba(0, 0, 0, 0.2);
  --theme-dark-color-black-normal:          rgba(0, 0, 0, 0.2);
  --theme-dark-color-black-normal-rollover: rgba(0, 0, 0, 0.05);
  --theme-dark-color-black-normal-pressed:  rgba(0, 0, 0, 0.8);
  --theme-dark-color-black-normal-solid:    #1a1919;
  --theme-dark-color-black-thick:           rgba(0, 0, 0, 0.8);
  --theme-dark-color-black-thick-rollover:  rgba(0, 0, 0, 0.4);
  --theme-dark-color-black-thick-pressed:   #000;   /* compiled as `black` */
  --theme-dark-color-black-solid:           #000;

  /* backgrounds */
  --theme-dark-background: #1a1a1a;   /* also hard-coded on <body> in index.template.html */
  --theme-dark-background-black-half-transparent:          rgba(20, 20, 20, 0.5);
  --theme-dark-background-black-half-transparent-rollover: rgba(20, 20, 20, 0.7);
  --theme-dark-background-gradient-1: linear-gradient(180deg, #000 0%, #2b2d31 100%);
}
```

### 1.3 Semantic (shadcn-style, HSL-channel) tokens — `.tw-light, :root` / `.tw-dark`

These are **space-separated HSL channels** meant to be consumed as `hsl(var(--primary))`. Several are stored as **comma-separated HSLA** instead (`0, 0%, 100%, 0.15`) — those must be read as `hsla(var(--x))`. Both forms coexist; see §7.

```css
/* Restream Studio — semantic surface tokens (LIGHT)
   Production origin: restream.85b89da606457891.css  ->  .tw-light,:root { ... } */
.tw-light, :root {
  --white:                  0 0% 100%;
  --background:             0 0% 100%;
  --foreground:             218 76% 15%;
  --card:                   0 0% 100%;
  --card-foreground:        224 71.4% 4.1%;
  --popover:                0 0% 100%;
  --popover-foreground:     224 71.4% 4.1%;
  --primary:                222 100% 46%;
  --primary-rollover:       221 100% 35%;
  --primary-foreground:     0 0% 100%;
  --secondary:              214 24% 35%;
  --secondary-foreground:   0 0% 100%;
  --muted:                  220 18% 97%;
  --muted-foreground:       218 13% 48%;
  --accent:                 220 18% 97%;
  --accent-foreground:      220.9 39.3% 11%;
  --destructive:            4 74% 49%;
  --destructive-foreground: 210 20% 98%;
  --border:                 220 13% 91%;
  --input:                  212 10% 71%;
  --ring:                   220 100% 76%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --radius: 0.5rem;
}

/* Restream Studio — semantic surface tokens (DARK)
   Production origin: restream.85b89da606457891.css  ->  .tw-dark { ... }
   Values containing commas are hsla() channel lists, not hsl(). */
.tw-dark {
  --white:                  0 0% 100%;
  --background:             0, 0%, 100%, 0.15;
  --background-rollover:    0, 0%, 100%, 0.3;
  --foreground:             212 10% 71%;
  --primary:                220 100% 46%;
  --primary-rollover:       221 100% 35%;
  --primary-foreground:     0 0% 100%;
  --secondary:              0, 0%, 100%, 0.15;
  --secondary-rollover:     0, 0%, 100%, 0.3;
  --secondary-foreground:   210 20% 98%;
  --muted:                  0, 0%, 100%, 0.05;
  --muted-rollover:         0, 0%, 100%, 0.15;
  --muted-foreground:       0, 0%, 100%, 0.8;
  --destructive:            4 86% 58%;
  --destructive-rollover:   4 86% 75%;
  --destructive-foreground: 210 20% 98%;
  --accent:                 0, 0%, 100%, 0.15;
  --accent-foreground:      0 0% 100%;
  --card:                   218 54% 20%;
  --card-foreground:        210 20% 98%;
  --popover:                224 71.4% 4.1%;
  --popover-foreground:     210 20% 98%;
  --border:                 0, 0%, 100%, 0.05;
  --input:                  0, 0%, 100%, 0.15;
  --ring:                   216 12.2% 83.9%;
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
  --white-thick:        0, 3%, 30%, 0.8;
  --white-thin-solid:   0 1% 17%;
  --white-normal-solid: 0 0% 25%;
  --black-thin:   0, 0%, 0%, 0.05;
  --black-normal: 0, 0%, 0%, 0.2;
  --black-thick:  0, 0%, 0%, 0.8;
}
```

Component-local override observed (`.Switch-module__root`) uses **hex** for the same names — incompatible with `hsl(var(...))` consumers:

```css
.Switch-module__root { --primary:#0066ff; --background:#ffffff; --input:#e5e7eb; --ring:#0066ff; }
```

### 1.4 Ring / focus tokens

```css
:root {
  --ring-width:        2px;
  --ring-offset-width: 2px;
  --ring-color:        var(--ring);
  --ring-offset-color: var(--background);
  --border-style: solid;
  --border-width: 1px;
}
```

The focus **outline** is not a custom property. It comes from `@restream/styles/scss/outline.scss`:
`$color-outline: #015ecc; $outline: #015ecc auto 1px;` — emitted **375x** as `outline:#015ecc auto 1px`, plus 7x `border:1px solid #015ecc`, 3x `outline:1px solid`, 1x `outline:2px solid`, 2x `color:#015ecc`.

### 1.5 Overlay / banner / status colour tokens

```css
/* preview status scrim (50% alpha hex) */
--overlay-color: #2970ff80;  /* info / live-preview */
--overlay-color: #f0443880;  /* error */
--overlay-color: #f7900980;  /* warning */
--overlay-color: transparent;
--overlay-opacity: 0 | 1;

/* source "on-air" frame ring */
--frameRingColor: #85e138 | rgba(133,225,56,.8) | rgba(133,225,56,.2)
                | rgb(255 255 255 / 40%) | rgb(255 255 255 / 20%) | transparent;
--frameRingBg:    rgba(133,225,56,.3) | rgba(133,225,56,.2) | rgba(133,225,56,.1)
                | rgb(255 255 255 / 10%) | transparent;

/* glow ramp used by the live indicator */
--glow-peak: rgb(255 255 255 / 40%);
--glow-mid:  rgb(255 255 255 / 20%);
--glow-ramp: rgb(255 255 255 / 0%);

/* gradient buttons / toggles */
--topColor:    #0b4fd8 | #155eef | #2970ff | #a5adba;
--bottomColor: #155eef | #2970ff | #a5adba;
--buttonTopColor: #155eef;  --buttonBottomColor: #2970ff;

/* misc surface / label */
--bg-color: #172b4d | #42526e | rgb(0 0 0 / 20%)
          | var(--theme-dark-background)
          | var(--theme-dark-color-white-thin)
          | var(--theme-dark-color-white-normal-rollover-solid);
--background-color: #262626 | #2b2a2a;
--background-color-highlight-1: #091e42
  | color-mix(in srgb, var(--theme-dark-color-white-thin-solid) 100%, #000 3%);
--background-color-highlight-2: #001335
  | color-mix(in srgb, var(--theme-dark-color-white-thin-solid) 100%, #fff 3%);
--label-color: #191919 | #6b778c | #6d7276 | #d92d20;
```

### 1.6 Vendor token set (react-day-picker)

```css
:root {
  --rdp-cell-size: 40px;
  --rdp-accent-color: #0000ff;
  --rdp-background-color: #e7edff;
  --rdp-accent-color-dark: #3003e1;
  --rdp-background-color-dark: #180270;
  --rdp-outline: 2px solid var(--rdp-accent-color);
  --rdp-outline-selected: 3px solid var(--rdp-accent-color);
}
```
These are library defaults and are **not** aligned to the Restream palette (`#0000ff` appears nowhere else).

---

## 2. `@restream/styles` — what is actually in the package

Only **two** files were recovered from `node_modules/@restream/styles/scss/`. There is **no colour-palette map, no spacing scale, no radius scale, no typography scale and no easing set in that package**. Everything else lives in `scripts/styles/*` and `scripts/modules/Theme/*`.

### 2.1 `media.scss` — the only breakpoint scale

```scss
$breakpoint-xs: 576px;
$breakpoint-sm: 768px;
$breakpoint-md: 992px;
$breakpoint-lg: 1200px;
$breakpoint-xl: 1400px;
@mixin xs/sm/md/lg/xl { @media (max-width: #{$breakpoint-*}) { @content; } }  // all max-width
```

Equivalent CSS:
```css
/* Restream breakpoints (all authored as max-width) */
@media (max-width: 576px)  { /* xs */ }
@media (max-width: 768px)  { /* sm */ }
@media (max-width: 992px)  { /* md */ }
@media (max-width: 1200px) { /* lg */ }
@media (max-width: 1400px) { /* xl */ }
```

**Actual breakpoint usage in the compiled CSS** differs — the studio uses its own viewport mixin far more than the package scale:

| Query | Rules | Origin |
|---|---:|---|
| `max-width: 576px` | 264 | `$breakpoint-xs` |
| `min-width: 1080px` | 139 | `scripts/styles/viewport.scss` -> `@mixin desktop` |
| `min-width: 576px` | 135 | inverse of xs |
| `max-width: 1020px` | 58 | ad-hoc |
| `max-width: 768px` | 39 | `$breakpoint-sm` |
| `max-width: 992px` | 22 | `$breakpoint-md` |
| `max-width: 480px` | 19 | ad-hoc |
| `max-width: 1400px` | 3 | `$breakpoint-xl` |

`$breakpoint-lg` (1200px) is never emitted.

```scss
// scripts/styles/viewport.scss — the real "desktop" gate
@mixin desktop          { @media (min-width: 1080px) and (min-height: 660px) { @content; } }
@mixin desktopWidthOnly { @media (min-width: 1080px) { @content; } }
```

### 2.2 `outline.scss`

```scss
$color-outline: #015ecc;
$outline: $color-outline auto 1px;
@mixin focus-visible-outline { outline: none; &:focus-visible { outline: $outline; } }
```

### 2.3 `scripts/styles/colors.scss` — the **legacy** Sass palette

A *second, conflicting* palette (see §7). Still `@use`d by older modules.

```scss
$previewBackgroundColor: #0c0c0c;
$white: #ebecf0;
$gray-25:#fafbfc;  $gray-50:#f5f6f8;  $gray-100:#edf0f3; $gray-200:#d7dce3;
$gray-300:#bac1cc; $gray-400:#97a0af; $gray-500:#6b778c; $gray-550:#56647d;
$gray-600:#42526e; $gray-700:#2b3d5c; $gray-800:#17284d; $gray-850:#0f2447;
$gray-900:#091e42; $gray-950:#021331;
$blue-25:#f5faff;  $blue-50:#e6f4ff;  $blue-100:#cce9ff; $blue-200:#99d1ff;
$blue-300:#66b8ff; $blue-400:#339fff; $blue-500:#0086ff; $blue-550:#0074e0;
$blue-600:#0062c0; $blue-700:#0050a0; $blue-800:#003d80; $blue-850:#003670;
$blue-900:#002e60; $blue-950:#001f40;
```

### 2.4 `scripts/styles/scrollbar.scss` — scrollbar mixin (defaults act as tokens)

```scss
@mixin scrollbar($color:#253858, $hover-color:#253858, $active-color:#253858,
                 $track-color:transparent, $size:0.35rem, $min-size:1.5rem, $ff-width:thin)
// thumb border-radius: 3px
```
Compiled equivalents: `--scrollbar-size: 4px;` `--scrollbar-gutter: max(0.35rem, 8px);`
Related SCSS: `$scrollbarGutter: max(0.35rem, 8px)`, `$scrollbarWidth: 5px`, `$scrollbarThumb: #808080`.

### 2.5 `scripts/styles/aspectRatio.scss`

`@mixin aspectRatio($width,$height)` (padding-top hack) + `@mixin aspectRationContent` (sic — typo in source). `$aspectRatio16to9: math.div(16, 9)`, `$aspectRation16n9: 1.77777`.

---

## 3. Typography

### 3.1 Families actually shipped

**UI font: `Graphik`** — 5 faces self-hosted from `/assets/`, `font-display: swap`, `local('Graphik LC Web')` first, woff2 + woff:

| weight | style | file |
|---|---|---|
| 400 | normal | `Graphik-Regular-Cy-Web.d7f438acf9cad997.woff2` |
| 400 | italic | `Graphik-RegularItalic-Cy-Web.26901847b4abb89e.woff2` |
| 500 | normal | `Graphik-Medium-Cy-Web.265489e221c946cd.woff2` |
| 600 | normal | `Graphik-Semibold-Cy-Web.6f4e5b8d01cdd6b7.woff2` |
| 700 | normal | `Graphik-Bold-Cy-Web.b11e71232e4e7f45.woff2` |

`font-family` declaration counts in the compiled CSS: `inherit` x145, `Graphik,sans-serif` x38, `"Graphik",sans-serif` x6, `Graphik` x6, `Graphik,Helvetica,Arial,sans-serif` x4, `Graphik,ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"` x3.

**Emoji:** `Noto Color emoji` -> `/assets/NotoColorEmoji.209e7f2523c07381.ttf`.

**Monospace — no token, three different stacks:**
```css
font-family: "IBM Plex Mono", monospace;                                          /* x4 */
font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; /* x3 */
font-family: ui-monospace, SF Mono, Menlo, Consolas, monospace;                   /* x3 */
```

**Overlay / caption display faces** (user-selectable, self-hosted, `font-weight:400` unless noted):
`Bangers` (.otf), `BurbankBigCondensedBold`, `Creepster`, `Exo2-Bold`, `Expressway`, `Josefin Sans` (variable, `font-variation-settings:'wght' 500`, `clig`/`liga` off), `LuckiestGuy`, `Oswald-Medium`, `Pacifico`, `Philosopher-Regular`, `Philosopher-Bold`, `PressStart2P`, `Rainbow`, `Roboto-Regular`, `Roboto-Medium`, `Roboto-Bold`, `Rubik` (400 + 500), `ShareTech-Regular`, `Staatliches-Regular`, `Teko-Regular`, `Ubuntu-Regular`, `VT323-Regular`, `WorkSans-Medium`, `WorkSans-SemiBold`.

**Remote font imports (Google Fonts):**
```css
@import url(https://fonts.googleapis.com/css2?family=Unbounded:wght@200..900&display=swap);
@import url(https://fonts.googleapis.com/css2?family=Akaya+Telivigala&display=swap
  &family=Hind+Madurai:wght@400;500;700&family=Hind+Siliguri:wght@400;500;700
  &family=Mali:wght@400;500;700&family=Noto+Sans+HK|JP|KR|SC|TC:wght@400;500;700
  &family=Noto+Sans:wght@400;700&family=Rubik:wght@400;500;700);
```

Overlay caption CJK / Indic fallback chain (repeated verbatim in caption rules):
`graphik, noto color emoji, noto sans, noto sans jp, noto sans hk, noto sans sc, noto sans tc, noto sans kr, hind guntur, mali, hind madurai, hind siliguri, noto sans gurmukhi, noto serif...`

Caption font is runtime-swapped: `font-family: var(--fontFamily), var(--previousFontFamily), Graphik, sans-serif;` and `font-family: var(--countdownFontFamily), var(--previousCountdownFontFamily), sans-serif;`

### 3.2 Type scale tokens

```css
/* Restream Studio — typography scale (on :where(.twp)) */
:root {
  --font-size-heading-md: 2.25rem;   /* 36px */
  --font-size-heading-sm: 1.875rem;  /* 30px */
  --font-size-heading-xs: 1.5rem;    /* 24px */
  --font-size-body-xl:    1.25rem;   /* 20px */
  --font-size-body-lg:    1.125rem;  /* 18px */
  --font-size-body-md:    1rem;      /* 16px */
  --font-size-body-sm:    0.875rem;  /* 14px */
  --font-size-body-xs:    0.75rem;   /* 12px */

  --font-line-height-heading-md: 1.22;
  --font-line-height-heading-sm: 1.27;
  --font-line-height-heading-xs: 1.33;
  --font-line-height-body-xl: 1.5;
  --font-line-height-body-lg: 1.56;
  --font-line-height-body-md: 1.5;
  --font-line-height-body-sm: 1.429;
  --font-line-height-body-xs: 1.5;

  --font-letter-spacing-xl: 0.02em;   /* the ONLY letter-spacing token */
}
```

**Absent:** `--font-size-heading-lg` / `-xl`, any `--font-weight-*` **definition**, any letter-spacing beyond `xl`.

### 3.3 Weight / size / line-height as actually used

| `font-weight` | count |
|---|---:|
| 500 | 583 |
| 400 | 468 |
| 600 | 260 |
| 700 | 159 |
| `var(--font-weight-regular,400)` | 28 |
| `var(--font-weight-semibold,600)` | 15 |
| `var(--font-weight-medium,500)` | 9 |
| 300 / 540 / 900 | 2 / 2 / 1 |

| `font-size` | count | | `line-height` | count |
|---|---:|---|---|---:|
| 14px | 733 | | 20px | 335 |
| 12px | 283 | | 1.4 | 118 |
| 16px | 161 | | 1.5 | 110 |
| 13px | 134 | | 24px | 104 |
| 20px | 70 | | 16px | 85 |
| 11px | 70 | | 1 | 57 |
| 10px | 69 | | 12px | 44 |
| .875rem | 60 | | 1.42 | 43 |
| 24px | 38 | | 18px | 42 |
| 18px | 36 | | 1.429 | 41 |
| .75rem | 35 | | 28px | 38 |
| 9px | 32 | | 1.3 | 32 |
| 22px | 32 | | 32px | 17 |
| 15px | 28 | | 14px | 17 |

The de-facto UI scale is **14 / 12 / 16 / 13 / 20 / 11 / 10 px** paired with `line-height: 20px`. The px ladder dominates; the rem tokens are used almost exclusively by the newer Tailwind-scoped components.

---

## 4. Radii, spacing, shadow, z-index

### 4.1 Radius scale (tokenised)

```css
:root {
  --border-radius-50:  2px;
  --border-radius-100: 4px;
  --border-radius-150: 6px;
  --border-radius-200: 8px;
  --border-radius-300: 12px;
  --border-radius-400: 16px;
  --border-radius-500: 20px;
  --radius: 0.5rem;           /* Tailwind/shadcn radius base = 8px */
}
```

Radius **as actually written** (raw `border-radius:` counts): `8px` x560, `6px` x228, `4px` x181, `50%` x168, `12px` x87, `3px` x58, `2px` x42, `999px` x36, `10px` x35, `99rem` x28, `16px` x21, `100px` x18, `100%` x18, `20px` x15, `9999px` x11, `14px` x8, `99px` x6, `44px` x5, `13px` x5, `1px` x5.

Only **8** rules use `var(--border-radius)` and **26** use `var(--itemBorderRadius)` (runtime). **The radius tokens are almost never referenced — the scale is hard-coded.** The pill radius has four spellings: `999px`, `99px`, `99rem`, `9999px`.

Component-level SCSS radii: `$conceptRadius: 8px`, `$canvasRadius: 8px`, `$buttonRadius: 8px`, `$modalBorderRadius: 8px`, `$borderRadius: 8px`/`6px`, `$avatarRadius: 10px`, `$previewRadius: 6px`, `$headerBorderRadius: 6px`, `$composerRadius: 20px`, `$sliderTrackBorderRadius: 4px`, `$border-radius: 16px`, `$radius: max(1.25cqw, 12px)` (fluid, scenes preview).

### 4.2 Spacing scale (tokenised — incomplete)

```css
:root {
  --spacing-xxs: 0.125rem;  /*  2px */
  --spacing-xs:  0.5rem;    /*  8px */
  --spacing-md:  1rem;      /* 16px */
  --spacing-lg:  2rem;      /* 32px */
}
```
**`--spacing-sm` and `--spacing-xl` do not exist.** The scale jumps 8px -> 16px with no 12px step, yet 12px is one of the most-used gaps in the SCSS (`$conceptVerticalSpace: 12px`, `$gap: 12px`, `$rightGap: 12px`).

Layout constants (`scripts/styles/common.scss`) — the real spacing/layout tokens:

```scss
$space: 20px;  $blockPadding: 20px;
$sidebarWidth: 400px;              $verticalTabsScrollbarWidth: 5px;
$conceptVerticalSpace: 12px;       $conceptHorizontalSpace: 16px;
$conceptBlockPadding: 16px;        $conceptTopOffset: 12px + 48px;   // 60px
$conceptSidebarWidth: 360px;       $conceptRadius: 8px;
$conceptStreamSourceWidth: 224px;  $conceptStreamSourceHeight: 126px;
$conceptVirtualEventTitleHeight: 20px;
$scenesSourcesV2Width: 64px;       $scenesSourcesV3Width: 61px;
$scenesSourcesSidebarWidth: 161px; $scenesLargeSourcesSidebarWidth: 212px;
$scenesSidebarWidth: 168px;        $verticalSidebarTabHeaderHeight: 48px;
$privateChatDesktopWidth: 328px;   $playerControlsDesktopWidth: 432px;
$aspectRatio16to9: math.div(16, 9);
```

Layout custom properties in production CSS:
```css
--controls-height: 0px | 16px | 64px | 72px | 128px | 160px;
--controls-offset: 0px | 64px;
--preview-chrome-height: 42px | 45px | 87px;
--player-button-size: 44px;
--timeline-slice-height: 40px;
--sidepanel-bottom-margin: 72px;
--status-screen-top-offset: 0px | 44px;
--bleed: 3rem;
--scrollbar-size: 4px;
--scrollbar-gutter: max(0.35rem, 8px);
--mention-picker-header-fade: 4px;
--mention-picker-sticky-offset: 24px;
--top-fade: 0px | 24px;   --bottom-fade: 0px | 24px;
--available-height: calc(100cqh - var(--preview-chrome-height)
                    - var(--controls-height, 160px) - var(--controls-offset, 0px));
--height-from-width: calc(100cqw * 16 / 9) | calc(100cqw * 9 / 16);
--width-from-height: calc(var(--available-height) * 16 / 9) | * 9 / 16;
--proportional-width: 100cqw | calc((100cqw - 6px) * 256 / 337) | calc((100cqw - 6px) * 81 / 337);
--proportional-height: calc(var(--proportional-width) * 16 / 9) | * 9 / 16;
```

### 4.3 Shadows — **no shadow tokens exist**

There is **no `--shadow-*` custom property anywhere** in the 23 bundles. Every elevation is a literal `box-shadow`. The recurring set (proposed tokenisation on the right):

| Value | Count | Suggested token |
|---|---:|---|
| `0 1px 2px rgba(16,24,40,.05)` / `0 1px 2px 0 rgba(16,24,40,.05)` | 24 + 17 | `--shadow-xs` |
| `0 1px 3px rgba(16,24,40,.1), 0 1px 2px rgba(16,24,40,.06)` | 5 | `--shadow-sm` |
| `0 12px 16px -4px rgba(16,24,40,.08), 0 4px 6px -2px rgba(16,24,40,.03)` | 20 | `--shadow-lg` |
| `0 20px 24px -4px rgba(16,24,40,.08), 0 8px 8px -4px rgba(16,24,40,.03)` | 5 + 5 | `--shadow-xl` |
| `inset 0 0 0 .5px rgba(255,255,255,.08), 0 0 0 1px rgba(0,0,0,.35), 0 16px 48px 8px rgba(0,0,0,.5)` | 3 | `--shadow-panel-dark` |
| `0 0 0 1px rgba(255,255,255,.8), 0 0 0 6px rgba(255,255,255,.2)` | 19 | `--shadow-focus-white` |
| `0 0 0 1px rgba(9,30,66,.08)` | 6 | `--shadow-hairline` |
| `inset 0 0 0 .5px rgba(107,119,140,.12)` | 10 | `--shadow-inset-hairline` |
| `0 1px 4px 0 rgba(242,60,0,.25)` | 16 | `--shadow-live` (on-air orange) |
| `inset 0 0 6px 0 rgba(133,225,57,.5)` | 8 | `--shadow-active-source` |
| `inset 0 0 0 1px #ff004a` | 7 | `--shadow-error-ring` |
| `inset 0 0 0 1px #aeb5bd` / `#286fff` / `#fc8471` / `#253858` / `#fff` | 7 / 6 / 5 / 3 / 3 | field rings |
| `0 0 0 3px #2970ff`, `0 0 0 1px #4c9aff` | 4, 4 | focus rings |
| `inset -1px -1px 0 rgba(255,255,255,.2), inset 1px 1px 0 rgba(255,255,255,.5)` | 3 | bevel |
| `box-shadow:none` | 92 | — |

The elevation family is the **Untitled-UI base-shadow** system (`rgba(16,24,40,a)` = `#101828`), consistent with the `--color-*` ramps which are Untitled-UI palettes.

Ready-to-paste tokenisation:
```css
:root {
  --shadow-xs:  0 1px 2px 0 rgba(16, 24, 40, .05);
  --shadow-sm:  0 1px 3px rgba(16, 24, 40, .1), 0 1px 2px rgba(16, 24, 40, .06);
  --shadow-lg:  0 12px 16px -4px rgba(16, 24, 40, .08), 0 4px 6px -2px rgba(16, 24, 40, .03);
  --shadow-xl:  0 20px 24px -4px rgba(16, 24, 40, .08), 0 8px 8px -4px rgba(16, 24, 40, .03);
  --shadow-panel-dark: inset 0 0 0 .5px rgba(255,255,255,.08),
                       0 0 0 1px rgba(0,0,0,.35),
                       0 16px 48px 8px rgba(0,0,0,.5);
  --shadow-hairline:       0 0 0 1px rgba(9, 30, 66, .08);
  --shadow-inset-hairline: inset 0 0 0 .5px rgba(107, 119, 140, .12);
  --shadow-focus-white:    0 0 0 1px rgba(255,255,255,.8), 0 0 0 6px rgba(255,255,255,.2);
  --shadow-live:           0 1px 4px 0 rgba(242, 60, 0, .25);
  --shadow-active-source:  inset 0 0 6px 0 rgba(133, 225, 57, .5);
  --shadow-error-ring:     inset 0 0 0 1px #ff004a;
}
```

### 4.4 z-index scale — SCSS only, **not** exposed as custom properties

`scripts/styles/zIndex.scss` (authoritative):

```scss
$loadingScreen: 20000;          // reference only, unused
$rcDialogToast: 11004;
$dndUploadOverlay: 11003;  $googlePickerDialog: 11003;
$rcDialogPopover: 11002;   $videoStorageToast: 11002;   // $rcDialogWrap + 1
$rcDialogWrap: 11001;
$rcDialogMask: 11000;
$onboarding: 10200;
$dashboardSdkModal: 1050;       // reference only, unused
$hostSidebarIntercom: 1031;     // $popover + 1
$popover: 1030;   $hostHeaderRecordingPopover: 1030;
$popper: 1020;
$selectDropdown: 1010;          // must be above toasts
$toast: 1000;  $statusToast: 1000;  $sceneMobilePlaceholder: 1000;
$mobileMenu: 103;
$expandedPrivateChat: 102;
$playerButton: 101;
$collapsedPrivateChat: 100;
$sceneDragHandle: 11;
$settingsDropdown: 10;  $sceneDragWrapper: 10;  $sceneControls: 10;  $videoTutorialButton: 10;
$fullscreenButton: 1;   $intercom: 1;
```

`scripts/modules/Preview/components/Preview/Preview.constants.scss` — the preview stacking context (videos occupy 0...100000, 100 per source):

```scss
$previewOverlayZIndex:          100000;
$previewOverlayCountdownZIndex: 100001;
$previewOverlayTickerZIndex:    100002;
$previewDraggableBorderZIndex:  109000;   // overlay + 9000
$previewVideoControlsZIndex:    110000;   // overlay + 10000
$previewOverlayControlsZIndex:  120000;   // video controls + 10000
$scenesSourcesPopover:          120001;
$scenesSourcesPopoverMenu:      120011;
```

Only two z-index custom properties exist:
```css
--overlayElementZIndex:        100000;
--overlayEditingElementZIndex: 110001;
```

Compiled `z-index` frequencies confirm the ladder: `1` x164, `2` x56, `-1` x48, `10` x38, `var(--overlayElementZIndex)` x28, `0` x23, `3` x20, `109000` x16, `100` x14, `101` x12, `110000` x10, `1000` x9, `1050`/`1031`/`1030`/`103`/`10000` x5, `11001`/`11000` x4, `11004`/`2147483003` (Intercom) x3, `120011`/`120000` x2.

Copy-paste tokenisation:
```css
:root {
  --z-fullscreen-button: 1;        --z-intercom: 1;
  --z-settings-dropdown: 10;       --z-scene-drag-handle: 11;
  --z-private-chat: 100;           --z-player-button: 101;
  --z-private-chat-expanded: 102;  --z-mobile-menu: 103;
  --z-toast: 1000;                 --z-select-dropdown: 1010;
  --z-popper: 1020;                --z-popover: 1030;
  --z-host-sidebar-intercom: 1031;
  --z-onboarding: 10200;
  --z-dialog-mask: 11000;          --z-dialog-wrap: 11001;
  --z-dialog-popover: 11002;       --z-dnd-upload-overlay: 11003;
  --z-dialog-toast: 11004;
  --z-loading-screen: 20000;
  --z-preview-overlay: 100000;
  --z-preview-overlay-countdown: 100001;
  --z-preview-overlay-ticker: 100002;
  --z-preview-draggable-border: 109000;
  --z-preview-video-controls: 110000;
  --z-preview-overlay-controls: 120000;
  --z-scenes-sources-popover: 120001;
  --z-scenes-sources-popover-menu: 120011;
}
```

### 4.5 Motion — easings & durations (SCSS only, no CSS tokens)

```scss
$ease-in:       cubic-bezier(0.375, 0.015, 0.545, 0.455);
$ease-out-fast: cubic-bezier(0.45, 1.005, 0, 1.005);
$ease-stack:    cubic-bezier(0.32, 0.72, 0, 1);
$animation-default-time: 150ms;   $animationDuration: 150ms;
$duration: 250ms;                 $transitionMs: 180ms;
$widgetsModeTransitionMs: 180ms;  $accordionAnimationMs: 400ms;
$enterTransitionDuration: 300ms;  $entranceDelay: 300ms;
$moveDuration: 500ms; $moveType: ease;
$logoTransition: 500ms ease;      $editAvatarTransition: 0.2s ease;
$position-transition: all 200ms ease-in-out;
$orientationChangeTransitionDurationMs: 300ms;
$orientationChangeTransitionDelayMs: 150ms / 300ms;
$orientationPortraitHeightChangeTransitionDurationMs: 1200ms;
$orientationChangeTransitionEasing: ease;
```

Compiled `cubic-bezier` frequency: `.4,0,.2,1` x20 (Tailwind default), `.65,0,.45,1` x9, `.32,.72,0,1` x7, `.45,1.005,0,1.005` x6, `.87,0,.13,1` x5, `.16,1,.3,1` x5, `0,.39,1,.68` x4, `.4,0,.6,1` x3, `.5,0,1,1` x2, `.375,.015,.545,.455` x2, `.215,.61,.355,1` x2.

Duration frequency (transition contexts): `200ms` x341, `150ms` x168, `300ms` x105, `250ms` x69, `100ms` x65, `400ms` x29, `500ms` x16, `450ms` x15.
Only motion custom property: `--spinner-speed: 1.2s`.

```css
:root {
  --ease-standard:  cubic-bezier(.4, 0, .2, 1);
  --ease-in:        cubic-bezier(.375, .015, .545, .455);
  --ease-out-fast:  cubic-bezier(.45, 1.005, 0, 1.005);
  --ease-stack:     cubic-bezier(.32, .72, 0, 1);
  --duration-fast:   150ms;
  --duration-normal: 200ms;
  --duration-slow:   300ms;
  --spinner-speed:   1.2s;
}
```

---

## 5. Theme system (`scripts/modules/Theme/`)

**Two themes: `blue` (default) and `dark`.** Selector is `[data-theme="blue"]` / `[data-theme="dark"]` on an ancestor; the SCSS mixin emits `:global([data-theme='<name>']) &`.

### 5.1 `themes-utils.scss` API

| Symbol | Signature | Behaviour |
|---|---|---|
| `$default-theme` | `'blue'` | used when no `theme-variant()` context is active |
| `$themes` | Sass map `theme -> (token -> value)` | tokens are **per-theme**, not shared |
| `$current-theme-context` | `null` (global) | set/reset by `theme-variant()` |
| `@mixin theme-variant($theme-name, $class: null)` | wraps `@content` in `:global([data-theme='<t>']) &`, or `:global([data-theme='<t>']):global(.<class>) &` | `@error` on unknown theme |
| `@mixin blue-theme($class: null)` | shortcut for `theme-variant('blue', ...)` | |
| `@mixin dark-theme($class: null)` | shortcut for `theme-variant('dark', ...)` | |
| `@function token($name, $theme: null)` | -> `var(--theme-<theme>-<name>)` | `@error` on unknown token/theme |
| `@function raw-token($name, $theme: null)` | -> the literal Sass value (e.g. `#2970ff`) | `@error` on unknown token/theme |

### 5.2 `themes-styles.scss` — the generator

```scss
:root {
  @each $theme-name, $tokens in $themes {
    @each $token-name, $value in $tokens {
      --theme-#{$theme-name}-#{$token-name}: #{$value};
    }
  }
}
```
-> produces exactly the 33 `--theme-*` properties listed in §1.2.

### 5.3 `scripts/styles/themes.module.scss` — the only shared surface alias

```scss
.surfaceDark {
  @include blue-theme { --bg-color: #172b4d; }
  @include dark-theme { --bg-color: #{token('color-white-thin')}; }
}
```

### 5.4 Consumption pattern (from `ColorPicker.module.scss`)

```scss
@include blue-theme { background: #091e42; border: 1px solid #2b3d5c; }
@include dark-theme { background: token('color-white-normal'); border: 1px solid token('color-white-normal'); }
```

**Key structural fact:** the **blue theme has exactly one token** (`color-primary`). Every other blue-theme value is a hard-coded hex inline in each component's SCSS. Only the **dark** theme is genuinely tokenised. Any port must reconstruct the blue theme from the hex census in §6.

`raw-token()` is also used to build Sass-level aliases in newer modules:
```scss
$colorText:             raw-token('color-white-solid', 'dark');            // #fff
$colorTextSubtle:       raw-token('color-white-thick', 'dark');            // rgba(255,255,255,.8)
$colorSurface:          raw-token('color-white-normal-rollover', 'dark');  // rgba(255,255,255,.3)
$colorHairline:         raw-token('color-white-thin', 'dark');             // rgba(255,255,255,.05)
$colorCoverPlaceholder: raw-token('color-black-normal-solid', 'dark');     // #1a1919
```

### 5.5 Other "theme" systems present but out of scope

* `restreamchatembedthemes.80c3d45ee11ec039.css` (99 KB) — **0 custom properties**. 30 hard-coded chat skins, each `.restream-embed-themes-chat-container_<name>`: `default`, `default-compact`, `default-rounded`, `8-bit`, `8-bit-compact`, `comic`, `ac-odyssey-boxed`, `ac-odyssey-compact`, `bo4-boxed`, `bo4-compact`, `fortnite-blue`, `fortnite-boxed`, `fortnite-compact`, `lol-boxed`, `lol-compact`, `minecraft-boxed`, `minecraft-compact`, `overwatch-boxed`, `overwatch-compact`, `pubg-1`, `pubg-boxed`, `pubg-compact`, `r6-boxed`, `r6-compact`, `wot-boxed`, `wot-compact`, `wow-boxed`, `wow-compact`.
* A decorative WebGL/canvas background preset in JS keyed `pixels-organic` with `modes: {dark, light}` and 7-colour arrays — dark `["#0f0f0f","#4a4949","#b9b9b9","#0f0f0f","#d8d8d8","#0f0f0f","#2f2f2f"]`, light `["#e3e3e3","#ffffff","#f5f5f5","#f5f5f5","#080808","#f5f5f5","#f5f5f5"]` (plus `["#949494","#2d2d2d",...]` and `["#e0e0e0","#fdfdfd",...]` variants). Not a UI token set.

---

## 6. Hard-coded hex census (the un-tokenised "blue theme")

Counts across `restream`, `131`, `575`, `114`, `Index` bundles, with the property they most often appear on.

| Hex | Count | Dominant use | Role |
|---|---:|---|---|
| `#fff` | 1128 | color / background | white |
| `#015ecc` | 328 | **outline** | focus outline (`$color-outline`) |
| `#2b3d5c` | 284 | color (205), background (29) | gray-700 — body text on light, panel on dark |
| `#091e42` | 241 | color (190), background (46) | gray-900 — darkest surface / heading text |
| `#286fff` | 173 | color (66), background-color (61), border-color (30) | **legacy brand blue** (`$primaryColor`, `$editAvatarBackgroundColor`) |
| `#172b4d` | 166 | color (98), background (55) | gray-800 — main blue-theme surface |
| `#edf0f3` | 149 | — | gray-100 |
| `#6b778c` | 149 | color (116), border (14), fill (12) | gray-500 — muted text / icon |
| `#000` | 133 | — | black |
| `#ebecf0` | 123 | color (95), background (53) | **`$white`** in legacy `colors.scss` (not `#fff`) |
| `#42526e` | 100 | color (36), background (53) | gray-600 |
| `#155eef` | 100 | — | blue-600 (hover / pressed) |
| `#aeb5bd` | 98 | color (60), border (20) | gray-300/400 — disabled text |
| `#253858` | 98 | background (70), color (18) | scrollbar thumb + wells (`scrollbar.scss` default) |
| `#bac1cc` | 91 | — | legacy `$gray-300` |
| `#2970ff` | 90 | — | `--color-blue-500` brand primary |
| `#004eeb` | 84 | — | blue-700 / dark `accent-normal` |
| `#f5f6f8` | 81 | — | gray-50 |
| `#fafbfc` | 68 | — | gray-25 |
| `#97a0af` | 54 | — | legacy `$gray-400` |
| `#8993a4` | 54 | — | legacy tertiary text (no token) |
| `#d7dce3` | 50 | — | gray-200 |
| `#eff4ff` | 38 | — | blue-50 |
| `#c1c7d0` | 38 | — | light-surface border (no token) |
| `#505f79` | 37 | — | light-surface text (no token) |
| `#344563` | 37 | — | input chrome (no token) |
| `#d92d20` | 30 | — | red-600 (error) |
| `#0040c1` | 29 | — | blue-800 (`$blue-theme-accent`) |
| `#ff004a` | 28 | box-shadow / border / background | **legacy form-error red** (see below) |
| `#b2ccff` | 28 | — | blue-200 |
| `#f63` (`#ff6633`) | 22 | — | legacy orange |
| `#f59e0b` | 22 | — | `$pickAccent` / `$selectedAccent` / `$finishAccent` (amber) |
| `#ff4405` | 19 | — | orange-dark-500 (live) |
| `#aeb4bf` | 19 | — | near-duplicate of `#aeb5bd` |
| `#a5adba` | 18 | — | gradient toggle disabled |
| `#1a1a1a` / `#191919` | 18 / 16 | background | dark theme background / `--body-background` |
| `#6927da` | 17 | — | purple promo / upgrade (no token) |
| `#276cf8` | 17 | — | near-duplicate of `#286fff` |
| `#989899` | 16 | — | (no token) |
| `#84adff` | 16 | — | blue-300 |
| `#fc8471` | 15 | box-shadow ring | soft error ring |
| `#b42318` | 15 | — | red-700 |
| `#85e139` | 15 | frame ring | **active-source green** |
| `#ff5630` | 14 | — | `$red` / `$errorColor` (legacy) |

`#ff004a` usages: `.Form-module__formError` (color), `.input-module__error` (`box-shadow: inset 0 0 0 1px`, `border-color`), `.input-module__counter` (background), `.textarea-module__error` (border-color), `.textarea-module__counter` (background), `.select-module__error` (box-shadow inset ring), `.CheckoutForm-module__cardInputError` (box-shadow inset ring). **No token.**

Named SCSS one-offs with no CSS token:
`$onAirAccent: #fb4408`, `$errorColor: #bf2600` **and** `#ff5630`, `$warningColor: #ffab00`, `$cameraPlaceholderBackgroundColor: #181818`, `$previewBackgroundColor: #0c0c0c`, `$scrollbarThumb: #808080`, `$semiTransparentBackground: rgb(8 31 66 / 55%)`, `$semiTransparentBackgroundHalloween: rgb(8 31 66 / 45%)`, `$titleTooltipBackground: rgb(0 0 0 / 90%)`, `$titleTooltipBackdrop: 5px`, `$slackPlum: #401640` / `$slackPlumHover: #4a154b`, `$dragColor: rgba(#fff, .75)`, `$textColor: rgb(66 61 72 / 80%)`, `$blueHover: #004eeb`, `$blue-theme-accent: #0040c1`, `$pickAccentHover: #d97706`, `$pickAccentSoft: rgb(245 158 11 / 14%)`, `$selectedAccentSoft: rgb(245 158 11 / 14%)`, `$shimmerAccent: oklch(56% .21 277deg)`, `$shimmerAccentBright: oklch(76% .14 281deg)`, `$shimmerAccentDeep: oklch(46% .24 276deg)`, `$foreground-color: #091e42`, `$background-color: #fff`, `$hoverPreviewOpacity: 0.35`.

### 6.1 State (success / warning / error / info) — from `Alert.module.scss`

There are no state tokens; the Alert component encodes the state palette directly:

```css
/* error (default) — dark surface */
.alert              { border: 1px solid #f97066; background: rgb(217 45 32 / 20%); color: rgb(254 228 226 / 100%); }
.alert .title       { color: #fffbfa; }
/* error — light surface */
.alert.light        { border: #fda29b; background: #fffbfa; color: rgb(217 45 32 / 100%); }
.alert.light .title { color: #b42318; }
/* warning — dark surface */
.alert.warning      { border: 1px solid #fdb022; background: rgb(247 144 9 / 20%); color: rgb(254 240 199 / 100%); }
/* warning — light surface */
.alert.light.warning { border: 1px solid #fec84b; background: #fffcf5; color: #dc6803; }
/* info */
.alert.info         { border: 1px solid #5bfdff; background: rgb(91 253 255 / 10%); }
.alert.info .icon   { color: #fff; }
/* banner */
.alert.banner       { border: 1px solid #bac1cc; background: #fafbfc; }
.alert.banner .icon { color: #42526e; }
```
`#5bfdff` (info cyan) exists **nowhere** in the `--color-*` palette.

### 6.2 Brand / scene-folder accent palette (JS, `593.47f82f224fb8c169.js`)

A 17-colour ring, selected by hashing `brandId` (`I[hash % I.length] ?? I[0]`), used as the `Brand.primaryColor` fallback when the `scenesFolders` feature flag is on:

```js
["#06AED4","#16B364","#2E90FA","#2ED3B7","#36BFFA","#669F2A","#8098F9","#85E13A",
 "#875BF7","#9B8AFB","#A3A3A3","#DDD000","#EAAA08","#EE46BC","#F38744","#FD6F8E","#FF4405"]
```
Overlaps the `-400` decorative ramp (`#2ED3B7`, `#36BFFA`, `#8098F9`, `#85E13A`, `#9B8AFB`, `#F38744`, `#FD6F8E`, `#FF4405`) but adds 9 values that exist in no token: `#06AED4`, `#16B364`, `#2E90FA`, `#669F2A`, `#875BF7`, `#A3A3A3`, `#DDD000`, `#EAAA08`, `#EE46BC`.

**There is no per-participant colour palette.** Participant/brand identity in the overlay is driven by runtime custom properties `--primaryColor` / `--contrastPrimaryColor` / `--brandColor`, set from JS on the caption element (`DefaultCaption`, `NewsCaption`, `RoundedCaption`, `SpookyCaption`, `XmasCaption`, `AirCaption`, `EcommerceCaption`). The caption chrome itself is only `#fff`, `#181818`, `#000`, `rgba(#fff, .75)`; `SpookyCaption` adds `#080808` / `#282828`; `EcommerceCaption` adds `#c9e9ff` / `#f8fcff`.

---

## 7. Conflicts, duplicates and gaps

1. **Two incompatible palettes ship simultaneously.** `scripts/styles/colors.scss` (legacy Sass) vs `--color-*` (CSS, Untitled-UI). Same names, different values:

| Name | SCSS `colors.scss` | CSS `--color-*` |
|---|---|---|
| `white` | `#ebecf0` | `#fff` |
| `gray-300` | `#bac1cc` | `#aeb5bd` |
| `gray-400` | `#97a0af` | `#aeb5bd` |
| `gray-800` | `#17284d` | `#172b4d` |
| `blue-50` | `#e6f4ff` | `#eff4ff` |
| `blue-100` | `#cce9ff` | `#d1e0ff` |
| `blue-200` | `#99d1ff` | `#b2ccff` |
| `blue-300` | `#66b8ff` | `#84adff` |
| `blue-400` | `#339fff` | `#377aff` |
| `blue-500` | `#0086ff` | `#2970ff` |
| `blue-600` | `#0062c0` | `#155eef` |
| `blue-700` | `#0050a0` | `#004eeb` |
| `blue-800` | `#003d80` | `#0040c1` |
| `blue-900` | `#002e60` | `#00359e` |
| only in SCSS | `$gray-550 #56647d`, `$gray-950 #021331`, `$blue-25 #f5faff`, `$blue-550 #0074e0`, `$blue-850 #003670`, `$blue-950 #001f40` | — |
| only in CSS | — | `--color-gray-150 #ebecf1`, `--color-blue-650 #0a56ed`, `--color-blue-25 #f5f8ff` |

2. **`--color-gray-300` and `--color-gray-400` are both `#aeb5bd`.** One step of the gray ramp is lost. Legacy `$gray-300 #bac1cc` / `$gray-400 #97a0af` still appear 91x and 54x in the compiled CSS, so the ramp effectively has 4 grays in that band (`#bac1cc`, `#aeb5bd`, `#aeb4bf`, `#97a0af`).

3. **Five "brand blue" values in production:** `#2970ff` (`--color-blue-500`, `--theme-blue-color-primary`), `#286fff` (`$primaryColor`, 173 uses — the *most* used), `#276cf8` (17 uses), `#0066ff` (Switch override), and `#0086ff` (legacy `$blue-500`). Additionally `--primary` is `hsl(222 100% 46%)` in light and `hsl(220 100% 46%)` in dark — **the same semantic token differs by 2 degrees of hue between themes for no stated reason.**

4. **`--theme-dark-color-black-thin-rollover` is `rgba(255,255,255,0.15)`** — a *white* value inside the black ramp. Almost certainly a copy-paste bug in `themes-utils.scss` (`'color-black-thin-rollover': rgba(#fff, 0.15)`), faithfully compiled into production CSS. Likewise `'color-black-normal-rollover': rgba(#000, 0.05)` is *lighter* than `'color-black-thin': rgba(#000, 0.05)` — identical values at different ramp steps, so the black ramp is non-monotonic.

5. **Mixed HSL notations under the same token names.** Light theme uses space-separated `H S% L%` (consume as `hsl(var(--x))`); dark theme uses comma-separated `H, S%, L%, A` (consume as `hsla(var(--x))`). A single `hsl(var(--background))` will break in one of the two themes. Affected in dark: `--background`, `--background-rollover`, `--secondary`, `--secondary-rollover`, `--muted`, `--muted-rollover`, `--muted-foreground`, `--accent`, `--border`, `--input`, `--white-thick`, `--black-thin`, `--black-normal`, `--black-thick`.

6. **Active-source green has three values:** `#85e138` (`--frameRingColor`), `#85e139` (box-shadow, 15 uses), `#85e13a` (`--color-green-light-400`).

7. **The tokens are barely used.** Radius: 8 rules use `var(--border-radius)` vs 560 literal `border-radius:8px`. No rule was found consuming `--spacing-*` for layout. The `--color-*` palette is scoped to `:where(.twp)` and is therefore invisible to every non-Tailwind CSS-module component — which is why §6 exists at all.

8. **179 custom properties are referenced but never defined in CSS.** Two classes:

   **(a) Runtime / JS-set** (legitimate): `--primaryColor`, `--contrastPrimaryColor`, `--brandColor`, `--countdownColor`, `--fontFamily`, `--previousFontFamily`, `--countdownFontFamily`, `--previousCountdownFontFamily`, `--fontSize`, `--textScale`, `--textHeightMultiplier`, `--scale`, `--mediaContainerWidth`, `--mediaContainerHeight`, `--captionContainerWidth`, `--tickerContainerWidth`, `--itemLeft/Top/Width/Height/Crop*/Opacity/ZIndex/BorderRadius/BackgroundColor/Transition`, `--overlayChatWidth/Height/LeftOffset/TopOffset`, `--overlayChatPadding`, `--previewScale`, `--previewScaleRatio`, `--streamScaleRatio`, `--browserSourceScale`, `--productOverlayScale`, `--ecommerceProductLeftOffset`, `--containerItemBoxShadowV2` (computed per-source from the user's shadow settings: offsetX/offsetY/blur/spread), `--messageBackgroundOpacity`, `--chat-background-opacity`, `--hideMessagesAfter`, `--backgroundColor`, `--backgroundOpacity`, `--scrollBarColor`, `--drawer-height`, `--drawer-frontmost-height`, `--drawer-swipe-progress/movement-x/movement-y/strength`, `--nested-drawers`, `--peek`, `--radix-*` (Radix UI), `--animationDuration(Ms)`, `--transitionDurationMs`, `--contentTransitionDurationMs`, `--joinScreenTransitionDurationMs`, `--layoutPreviewTransitionDurationMs`, `--statusTransitionDurationMs`, `--counterCssTransitionDuration`, `--accordion-panel-height`, `--activeOptionPosition`, `--optionsNumber`, `--anchor-width`, `--right-overlay-zone-width`, `--sliderWidth`, `--sliderControlWidth`, `--thumbSizePx`, `--hoverTooltipPositionPx`, `--badgeIndex`, `--order`, `--index`.

   **(b) Dead Figma-export aliases with hex fallbacks** (never defined anywhere — the fallback always renders). A *third* naming system leaking in from marketing / webinar components:

```css
/* Figma-exported alias names seen only as var(--X, fallback).
   The fallback is what actually renders — none of these are ever defined. */
--Base-White: #fff;              --colors-base-white: #fff;
--Gray-25:  #fafbfc;             --colors-gray-squid-25:  #fafbfc;
--Gray-50:  #f5f6f8;             --colors-gray-squid-300: #bac1cc;
--Gray-100: #edf0f3;             --colors-dark-demon-50:  #f3f5f7;
--Gray-200: #d7dce3;             --colors-dark-demon-300: #aeb5bd;
--Gray-300: #bac1cc;             --colors-dark-demon-500: #6d7276;
--Gray-500: #6b778c;             --colors-dark-demon-900: #191919;
--Gray-550: #56647d;             --base-primary-cta-500-blue-demon: #2970ff;
--Gray-600: #42526e;             --blue-400: #528bff;
--Gray-700: #2b3d5c;             --gray-500: #6b778c;
--Gray-900: #091e42;             --color-azure-58:  #2b7fff;
--Blue-50:  #eff4ff;             --color-rose-58:   #f6339a;
--Blue-300: #84adff;             --color-violet-64: #ad46ff;
--Blue-600: #155eef;             --mauve-12: /* NO fallback — renders nothing */
--Error-600:   #d92d20;
--Warning-200: #fedf89;
--Yellow-100:  #fef7c3;   /* != --color-yellow-100 #fef0c7 */
--Yellow-500:  #eaaa08;   /* != --color-yellow-500 #f79009 */
--UI-N400: #2b3d5c;       /* AND #505f79 elsewhere — same name, two fallbacks */
/* type aliases */
--font-size-6:  20px;  --font-size-8: 16px;  --font-size-9: 14px;
--font-size-10: 12px  /* AND 13px — two fallbacks for one name */;
--font-weight-regular: 400; --font-weight-medium: 500; --font-weight-semibold: 600;
--line-height-7: 1.4;  --line-height-8: 1.5;
--line-height-9: 1.4  /* AND 1.42 AND 20px — three fallbacks for one name */;
--radius-md: /* undefined */;   /* used as min(var(--radius-md), 10px) */
```

9. **Parse artefacts:** 8 of the 374 "properties" are not tokens — they are CSS-module hashed class names containing `--` (`...___t2--B`, `...___4--b2`, `...-module__...--0C`) and Button-variant class fragments (`--default___pwmuT`, `--info___RZhqx`, `--outline___BXvAv`, `--primary___yib2w`, `--isSelected__UFwCT`). Ignore them.

10. **Missing scale steps:** no `--spacing-sm` / `--spacing-xl`; no `--font-size-heading-lg` / `-xl`; no `--font-weight-*` definitions; no `--shadow-*`; no `--ease-*` / `--duration-*`; no `--z-*` (except the two overlay ones); no letter-spacing beyond `xl`; and `@restream/styles` ships no palette at all.

---

## 8. Single drop-in stylesheet

Everything above, deduped, resolved and ordered. Paste as-is.

```css
/* ============================================================
   Restream Studio — design tokens (reconstructed)
   ============================================================ */
:root {
  /* ---------- primitives: gray ---------- */
  --color-white: #fff;     --color-black: #000;
  --color-gray-25:#fafbfc; --color-gray-50:#f5f6f8;  --color-gray-100:#edf0f3;
  --color-gray-150:#ebecf1;--color-gray-200:#d7dce3; --color-gray-300:#aeb5bd;
  --color-gray-400:#97a0af;   /* de-duped from legacy $gray-400 */
  --color-gray-500:#6b778c;--color-gray-550:#56647d; --color-gray-600:#42526e;
  --color-gray-700:#2b3d5c;--color-gray-800:#172b4d; --color-gray-850:#0f2447;
  --color-gray-900:#091e42;--color-gray-950:#021331;

  /* ---------- primitives: blue ---------- */
  --color-blue-25:#f5f8ff; --color-blue-50:#eff4ff;  --color-blue-100:#d1e0ff;
  --color-blue-200:#b2ccff;--color-blue-300:#84adff; --color-blue-400:#377aff;
  --color-blue-500:#2970ff;--color-blue-600:#155eef; --color-blue-650:#0a56ed;
  --color-blue-700:#004eeb;--color-blue-800:#0040c1; --color-blue-900:#00359e;

  /* ---------- primitives: state ramps ---------- */
  --color-red-25:#fffbfa;     --color-red-50:#fef3f2;     --color-red-100:#fee4e2;
  --color-red-200:#fecdca;    --color-red-300:#fda29b;    --color-red-400:#f97066;
  --color-red-500:#f04438;    --color-red-600:#d92d20;    --color-red-700:#b42318;
  --color-red-800:#912018;    --color-red-900:#7a271a;
  --color-yellow-25:#fffcf5;  --color-yellow-50:#fffaeb;  --color-yellow-100:#fef0c7;
  --color-yellow-200:#fedf89; --color-yellow-300:#fec84b; --color-yellow-400:#fdb022;
  --color-yellow-500:#f79009; --color-yellow-600:#dc6803; --color-yellow-700:#b54708;
  --color-yellow-800:#93370d; --color-yellow-900:#7a2e0e;
  --color-green-25:#f6fef9;   --color-green-50:#ecfdf3;   --color-green-100:#d1fadf;
  --color-green-200:#a6f4c5;  --color-green-300:#6ce9a6;  --color-green-400:#32d583;
  --color-green-500:#12b76a;  --color-green-600:#039855;  --color-green-700:#027a48;
  --color-green-800:#05603a;  --color-green-900:#054f31;
  --color-orange-dark-25:#fff9f5;  --color-orange-dark-50:#fff4ed;
  --color-orange-dark-100:#ffe6d5; --color-orange-dark-200:#ffd6ae;
  --color-orange-dark-300:#ff9c66; --color-orange-dark-400:#ff692e;
  --color-orange-dark-500:#ff4405; --color-orange-dark-600:#e62e05;
  --color-orange-dark-700:#bc1b06; --color-orange-dark-800:#97180c;
  --color-orange-dark-900:#771a0d;

  /* ---------- primitives: decorative 400s ---------- */
  --color-violet-100:#ece9fe;     --color-violet-400:#a48afb;
  --color-moss-400:#86cb3c;       --color-green-light-400:#85e13a;
  --color-green-dark-400:#3ccb7f; --color-teal-400:#2ed3b7;
  --color-cyan-400:#22ccee;       --color-blue-light-400:#36bffa;
  --color-blue-dark-400:#53b1fd;  --color-indigo-400:#8098f9;
  --color-purple-400:#9b8afb;     --color-fuchsia-400:#e478fa;
  --color-pink-400:#f670c7;       --color-rose-400:#fd6f8e;
  --color-orange-400:#f38744;     --color-yellow-dark-400:#fac515;

  /* ---------- semantic: brand & focus ---------- */
  --brand-primary:         var(--color-blue-500);   /* #2970ff */
  --brand-primary-legacy:  #286fff;                 /* 173 uses in production */
  --brand-primary-hover:   var(--color-blue-600);
  --brand-primary-pressed: var(--color-blue-800);
  --focus-outline-color: #015ecc;
  --focus-outline: #015ecc auto 1px;
  --ring-width: 2px;   --ring-offset-width: 2px;
  --border-style: solid; --border-width: 1px;

  /* ---------- semantic: state ---------- */
  --state-success:       var(--color-green-500);
  --state-warning:       var(--color-yellow-500);
  --state-error:         var(--color-red-600);
  --state-error-legacy:  #ff004a;   /* form validation, 28 uses */
  --state-info:          #5bfdff;   /* Alert info — no palette entry */
  --state-live:          var(--color-orange-dark-500);   /* #ff4405 */
  --state-on-air:        #fb4408;
  --state-active-source: #85e13a;

  /* ---------- typography ---------- */
  --font-family-ui:    Graphik, Helvetica, Arial, sans-serif;
  --font-family-mono:  "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --font-family-emoji: "Noto Color emoji";
  --font-weight-regular: 400;  --font-weight-medium: 500;
  --font-weight-semibold: 600; --font-weight-bold: 700;
  --font-size-heading-md: 2.25rem;  --font-size-heading-sm: 1.875rem;
  --font-size-heading-xs: 1.5rem;
  --font-size-body-xl: 1.25rem;     --font-size-body-lg: 1.125rem;
  --font-size-body-md: 1rem;        --font-size-body-sm: 0.875rem;
  --font-size-body-xs: 0.75rem;
  --font-line-height-heading-md: 1.22; --font-line-height-heading-sm: 1.27;
  --font-line-height-heading-xs: 1.33;
  --font-line-height-body-xl: 1.5;  --font-line-height-body-lg: 1.56;
  --font-line-height-body-md: 1.5;  --font-line-height-body-sm: 1.429;
  --font-line-height-body-xs: 1.5;
  --font-letter-spacing-xl: 0.02em;

  /* ---------- spacing (tokenised + observed gaps filled) ---------- */
  --spacing-xxs: 0.125rem;  /*  2px */
  --spacing-xs:  0.5rem;    /*  8px */
  --spacing-sm:  0.75rem;   /* 12px — MISSING upstream, added */
  --spacing-md:  1rem;      /* 16px */
  --spacing-lg:  2rem;      /* 32px */
  --spacing-xl:  3rem;      /* 48px — MISSING upstream, added */

  /* ---------- radius ---------- */
  --border-radius-50: 2px;   --border-radius-100: 4px;  --border-radius-150: 6px;
  --border-radius-200: 8px;  --border-radius-300: 12px; --border-radius-400: 16px;
  --border-radius-500: 20px; --border-radius-pill: 999px;
  --radius: 0.5rem;

  /* ---------- elevation (see §4.3) ---------- */
  --shadow-xs: 0 1px 2px 0 rgba(16,24,40,.05);
  --shadow-sm: 0 1px 3px rgba(16,24,40,.1), 0 1px 2px rgba(16,24,40,.06);
  --shadow-lg: 0 12px 16px -4px rgba(16,24,40,.08), 0 4px 6px -2px rgba(16,24,40,.03);
  --shadow-xl: 0 20px 24px -4px rgba(16,24,40,.08), 0 8px 8px -4px rgba(16,24,40,.03);
  --shadow-panel-dark: inset 0 0 0 .5px rgba(255,255,255,.08),
                       0 0 0 1px rgba(0,0,0,.35), 0 16px 48px 8px rgba(0,0,0,.5);
  --shadow-hairline: 0 0 0 1px rgba(9,30,66,.08);
  --shadow-inset-hairline: inset 0 0 0 .5px rgba(107,119,140,.12);
  --shadow-focus-white: 0 0 0 1px rgba(255,255,255,.8), 0 0 0 6px rgba(255,255,255,.2);
  --shadow-live: 0 1px 4px 0 rgba(242,60,0,.25);
  --shadow-active-source: inset 0 0 6px 0 rgba(133,225,57,.5);
  --shadow-error-ring: inset 0 0 0 1px var(--state-error-legacy);

  /* ---------- motion ---------- */
  --ease-standard: cubic-bezier(.4,0,.2,1);
  --ease-in:       cubic-bezier(.375,.015,.545,.455);
  --ease-out-fast: cubic-bezier(.45,1.005,0,1.005);
  --ease-stack:    cubic-bezier(.32,.72,0,1);
  --duration-fast: 150ms; --duration-normal: 200ms; --duration-slow: 300ms;
  --spinner-speed: 1.2s;

  /* ---------- layout ---------- */
  --sidebar-width: 400px;              --concept-sidebar-width: 360px;
  --scenes-sidebar-width: 168px;       --scenes-sources-sidebar-width: 161px;
  --scenes-large-sources-sidebar-width: 212px;
  --private-chat-width: 328px;         --player-controls-width: 432px;
  --player-button-size: 44px;          --timeline-slice-height: 40px;
  --sidepanel-bottom-margin: 72px;     --vertical-tab-header-height: 48px;
  --scrollbar-size: 4px;               --scrollbar-gutter: max(0.35rem, 8px);
  --scrollbar-thumb: #253858;
  --preview-background: #0c0c0c;       --body-background: #191919;

  /* ---------- z-index (full ladder in §4.4) ---------- */
  --z-popover: 1030; --z-popper: 1020; --z-select-dropdown: 1010; --z-toast: 1000;
  --z-onboarding: 10200;
  --z-dialog-mask: 11000; --z-dialog-wrap: 11001; --z-dialog-popover: 11002;
  --z-dialog-toast: 11004;
  --z-preview-overlay: 100000;         --z-preview-draggable-border: 109000;
  --z-preview-video-controls: 110000;  --z-preview-overlay-controls: 120000;
}

/* ---------- breakpoints (reference — @restream/styles/scss/media.scss) ----------
   xs 576px | sm 768px | md 992px | lg 1200px | xl 1400px   (all max-width)
   real desktop gate: (min-width: 1080px) and (min-height: 660px)
------------------------------------------------------------------------------- */
```

Pair this with §1.2 (`--theme-*`) and §1.3 (`.tw-light` / `.tw-dark`) verbatim to reproduce the shipped theming behaviour.

---

## 9. File map

| What | Where |
|---|---|
| Theme map + `token()` / `raw-token()` / `theme-variant()` | `03-deep-static/source-maps/extracted/*/scripts/modules/Theme/themes-utils.scss` |
| `:root` generator for `--theme-*` | `.../scripts/modules/Theme/themes-styles.scss` |
| `.surfaceDark` alias | `.../scripts/styles/themes.module.scss` |
| Legacy Sass palette | `.../scripts/styles/colors.scss` |
| z-index ladder | `.../scripts/styles/zIndex.scss` |
| Preview stacking context | `.../scripts/modules/Preview/components/Preview/Preview.constants.scss` |
| Layout constants | `.../scripts/styles/common.scss` |
| Scrollbar mixin | `.../scripts/styles/scrollbar.scss` |
| Desktop media gate | `.../scripts/styles/viewport.scss` |
| Aspect-ratio mixins | `.../scripts/styles/aspectRatio.scss` |
| `@font-face` set | `.../scripts/assets/fonts/fonts.scss` |
| Breakpoints | `.../node_modules/@restream/styles/scss/media.scss` |
| Focus outline | `.../node_modules/@restream/styles/scss/outline.scss` |
| Alert state palette | `.../scripts/components/Alert/Alert.module.scss` |
| Caption layout constants | `.../scripts/entries/Overlay/CaptionContainer/common/common.scss` |
| All CSS custom properties | `01-inside-studio-verified/client-static/css/restream.85b89da606457891.css` (285 of 294) |
| Chat embed skins (0 tokens, 30 skins) | `.../css/restreamchatembedthemes.80c3d45ee11ec039.css` |
| Brand accent ring (17 hexes) | `.../js/593.47f82f224fb8c169.js` |
