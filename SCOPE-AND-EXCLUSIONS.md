# Scope and Exclusions

## Included

Only deterministic, publicly retrievable client resources were retained. A file qualifies when it was:

1. observed as a public functional static resource in the loaded Studio or prejoin page;
2. mapped by a captured finite runtime table;
3. named by an exact literal URL/path in downloaded HTML, webmanifest, CSS, JavaScript, or a valid source map; or
4. a finite branch of a captured loader, such as a modern/legacy chunk table, MediaPipe WASM variant, or explicit font concatenation.

The package includes compiled/minified production code, public media, vectors, fonts, models, worklets, valid CSS Source Map v3 files, and their embedded SCSS/CSS source contents. Every retained payload is covered by a manifest and/or the root checksum list.

Third-party SDK files are retained only as public functional browser artifacts. Their presence does not mean that private Restream, Stripe, Intercom, or account data was collected.

## Deliberately excluded

- Cookies, local/session storage, cached credentials, authorization headers, tokens, and browser profiles.
- Authenticated or private API responses, user/account records, room state, chat/conversation payloads, destinations, billing data, and session media.
- Dynamic avatar/user images and account- or room-linked media.
- Telemetry events, analytics payloads, experimentation traffic, and browser-injected instrumentation.
- Eight Sentry-only static chunks: four in the Stripe graph and four in the Intercom graph.
- Runtime callback or directory templates that do not resolve to one exact immutable file.
- Live operational probes such as Intercom's Ably connectivity check.
- Blob workers generated from code already contained in a captured bundle.
- Virtual module identifiers and private authoring imports that are not public network targets.
- Restream server code, databases, infrastructure, deployment secrets, and the private repository.

## Source-map and authoring-source boundary

The production JavaScript and CSS expose 57 unique source-map targets. Anonymous retrieval produced 23 valid CSS Source Map v3 documents and 34 Studio HTML-shell responses for JavaScript map URLs. The 23 valid maps are retained and contain 756 source entries; all 756 include `sourcesContent` and were extracted exactly.

The recovered material is style source: 725 SCSS entries, 10 CSS entries, and 21 intentionally empty `<no source>` placeholders. It does not include original application JavaScript/TypeScript.

One embedded dependency stylesheet points to a relative `style.css.map`, but the map contains no package version or fetchable base. Registry and common CDN lookups for the exact package name returned 404. No version was guessed.

Two extracted SCSS files reference the same logical Sass token module, `scripts/entries/Overlay/overlay-selection-tokens`. No matching source exists in any public map, its exact resolver filename is unknown, and production CSS exposes no runtime URL. It is recorded as one private compile-time dependency with two references, not counted as a missed public download.

## Exact unavailable and fallback targets

- One qualityRTC diagnostic script returned HTTP 403.
- Twelve exact legacy Stripe image paths returned HTTP 403.
- Thirteen exact Intercom frame/chunk license sidecars returned HTTP 404.
- One exact Intercom relative mask path returned the Studio HTML shell instead of SVG.
- Thirty-four exact JavaScript source-map paths returned the Studio HTML shell instead of Source Map v3 JSON.
- Sixteen Restream bundle literals returned the Studio HTML shell: one unhashed Graphik alias and 15 GPU-detector JSON names. The exact Graphik payload is present under its emitted hashed URL; HTML fallbacks were never saved as the requested file types.

No alternative versions or guessed filenames were inserted for these targets.

## Meaning of “complete”

“Complete” means that every exact, deterministic public static dependency discoverable from the two observed client states and recursively downloaded finite graphs is either present, explicitly unavailable with its real response, or explicitly excluded by the safety boundary.

It does not mean the private repository, server-side implementation, every runtime response, or every asset that another account, feature flag, locale, experiment, permission, or future release might select.
