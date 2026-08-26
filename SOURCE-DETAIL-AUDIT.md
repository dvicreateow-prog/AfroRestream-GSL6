# Source Detail Audit

Audit date: **2026-08-24**

## Conclusion

The public, deterministic browser-static graph is closed for the two inspected Restream Studio states. No unmanifested exact public static file remains in the downloaded Restream, Google Fonts, Stripe, or Intercom graphs. This conclusion is deliberately narrower than “the private Restream source code”: the browser does not expose the private repository, server code, account data, or unavailable authoring files.

## Fresh live reconciliation

A fresh sanitized inventory of the loaded page observed 161 resources: 42 scripts, 11 stylesheets, 24 images, 8 fonts, 76 other resources, and no video resource. After removing APIs, payloads, dynamic iframes, telemetry, browser instrumentation, private/session media, and other non-static traffic, 39 public functional static URLs remained. All 39 matched exact URL records in the package.

The same page contained 12 inline SVG instances representing 11 unique hashes. All 11 hashes match package files. Those live SVGs contain no text nodes, embedded images, scripts, event handlers, or external references. The sanitized evidence is `AUDIT-LIVE-STATIC-2026-08-24.json`.

## Restream build topology

- Bundler signature: `rspack@1.7.4`.
- Runtime namespace: `studio_frontend`.
- Public path: `/`.
- Finite runtime tables: 32 JavaScript chunk IDs and 21 CSS chunk IDs; all 53 emitted files are present.
- Canonical baseline: 37 JavaScript files and 23 CSS files.
- Direct named client files include `externals`, `hlsjs`, `Index`, and the exact `locale/en-US.js` locale.
- Worker chunk 288 imports chunk 202; both are retained.
- Exactly three Restream JavaScript license sidecars were published and captured: `externals` (4,308 bytes), `hlsjs` (15,716 bytes), and `restream` (3,814 bytes).

The 23 production stylesheets contain 84 unique non-data runtime asset URLs. All 84 are manifested and present. Five LUTs, MediaPipe loaders/WASM, three segmentation models, the audio worklet, React Scan, icons, and other finite recursive dependencies are retained under `03-deep-static/`.

## Corrected source-map audit

There are 57 exact source-map targets, not zero:

- 23 CSS targets are valid Source Map v3 documents, totaling 3,923,297 bytes.
- 34 JavaScript targets return the generic Studio HTML shell and were not saved as maps.
- The valid maps contain 756 source entries and 756 non-null `sourcesContent` values.
- All 756 contents were extracted, totaling 3,240,247 bytes.
- There are 636 unique source identifiers, 610 unique content hashes, and zero same-path/content conflicts.
- Source types: 725 SCSS, 10 CSS, and 21 zero-byte `<no source>` placeholders.
- 199 long physical output paths were shortened deterministically for Windows, while the original webpack identifiers remain unchanged in the manifest. The package maximum path length is 240 characters.

An earlier validator incorrectly rejected the 23 CSS responses because PowerShell selected an unintended overloaded JSON parser path for a byte array. The parser was corrected, all 57 targets were re-requested, and the package-wide verifier independently parses every retained `.map` file.

The extracted styles contain 85 non-data `url()` directives. Reconciliation against emitted production CSS and the public Google stylesheets closes every exact runtime dependency: all 84 unique emitted production URLs are manifested and present.

One logical Sass module is absent from the public maps: `scripts/entries/Overlay/overlay-selection-tokens`. It is referenced by `Frame.module.scss` and `WidgetOption.module.scss`, but its physical resolver filename and content are not exposed. It has no runtime network URL and is therefore an inventoried private compile-time dependency, not a downloadable gap. See `03-deep-static/source-maps/MANIFEST-unavailable-compile-time-dependencies.csv`.

## Third-party deterministic graphs

### Google Fonts

All 620 exact `fonts.gstatic.com` binaries named by the captured stylesheets are present and validated.

### Stripe

The Stripe public-static runtime was followed through five deterministic levels: 1,263 manifest rows, 1,241 unique URLs, and 1,229 unique local payloads after overlaps and unavailable legacy paths. Recursive scanning found 989 nested asset references and zero unmanifested exact gaps. Twelve legacy image paths return HTTP 403. Four Sentry-only chunks are inventoried and excluded.

### Intercom

The observed Intercom loader was a gzip wire body. Decoding it exposed two large roots that a plain envelope scan could not see. The closed graph contains:

- 85/85 exact level-1 public static literals.
- 35/35 exact CSS font dependencies.
- Four modern/legacy frame/vendor loader branches plus one available root license sidecar.
- 146 finite frame chunk mappings: 142 functional chunks downloaded and verified against both SHA-256 manifests and runtime SHA-384 SRI; four Sentry-only chunks excluded.
- 41/41 exact direct or recursive public-path assets, including 33 nested images and two audio worklets.
- Four/four finite concatenated messenger fonts.
- Two worklets with no deeper URL, map, import, WASM, nested JavaScript, or CSS dependency.

Thirteen exact Intercom license sidecars return HTTP 404. One exact relative mask URL returns the Studio HTML shell instead of SVG. A sticker directory template has no filename and was not guessed. An Ably connectivity endpoint is recorded as live operational state, not downloaded as static source. No Intercom JavaScript file exposes a `sourceMappingURL` or `sourceURL`.

## File-format and SVG audit

- SVG files: 1,080 before final root-report generation.
- SVG script nodes: 0.
- SVG event-handler attributes: 0.
- SVG external `href`/`src` references: 0.
- One SVG contains a harmless Adobe metadata `foreignObject`; two contain SVG DOCTYPE declarations.
- Three URLs ending in `.png` contain valid JPEG payloads as served by the origin.
- One `.otf` URL contains a valid SFNT/TrueType-outline OpenType payload.
- The original gzip Intercom loader and its decoded inspection copy are both retained.
- No case-insensitive or Unicode-normalized path collisions were found.
- Maximum complete package path: 240 characters.

## Unavailable, fallback, and excluded inventory

- 27 exact public targets are recorded with `unavailable_*` status: one qualityRTC HTTP 403, 12 Stripe HTTP 403, 13 Intercom license HTTP 404, and one Intercom SVG HTML fallback.
- 34 JavaScript map targets return HTML and are separately classified as invalid map responses.
- 16 Restream literal paths return HTML: one Graphik alias and 15 GPU-detector JSON filenames.
- One nested dependency map cannot be resolved without guessing a package version/base.
- One unique private Sass compile-time target is absent from the published maps and recorded through both references.
- Eight Sentry-only public chunks are explicitly excluded: four Stripe and four Intercom.

## Privacy audit

The package-wide targeted scan checks the known room identifier, connected-account email, local machine identity/path patterns, the excluded dynamic media identifier, and JWT-shaped values. It also scans every extracted style source. Final results are written to `VERIFICATION-REPORT.json`; all targeted counts must be zero for a pass.

No cookies, browser storage, authorization data, authenticated API payloads, user/account records, conversation data, or dynamic session media were collected. The public Intercom widget application identifier is retained only because it is part of the public loader URL and is not an individual credential.

## Primary evidence

- `AUDIT-LIVE-STATIC-2026-08-24.json`
- `VERIFICATION-REPORT.json`
- `CHECKSUMS-SHA256.txt`
- `01-inside-studio-verified/MANIFEST-referenced-static.csv`
- `03-deep-static/MANIFEST-downloaded-static.csv`
- `03-deep-static/source-maps/README.md` and its `MANIFEST-*.csv` files
- `04-third-party-functional/google-fonts/MANIFEST-google-fonts.csv`
- `04-third-party-functional/stripe/` download and final-scan manifests
- `04-third-party-functional/intercom/README.md`, its manifests, and `FRAME-RUNTIME-VERIFICATION.json`
