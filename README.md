# AfroRestream — GSL6

A browser-based live production studio: compose camera, screen share and media onto a
1920×1080 canvas, mix audio, bring in remote guests over WebRTC, and fan the programme
feed out to multiple RTMP destinations at once.

---

## What's here

```
studio/
  web/        React 19 + TypeScript + Vite front end
  server/     Express + ws + ffmpeg backend
  shared/     types shared by both
  spec/       written specifications (design tokens, geometry, APIs, tool catalogue)
  scripts/    asset + metrics pipelines
```

## Running locally

Requires **Node 22+** and **ffmpeg** on your `PATH`.

```bash
cd studio
npm install
```

Two processes:

```bash
npm --workspace server run start
```

```bash
npm --workspace web run dev
```

Then open <http://localhost:5173/studio>. Guests join at `/join/<roomId>`.

## What works

| Area | State |
|---|---|
| Canvas compositor, 1920×1080 @ 30 fps, 8 layouts | working |
| Camera / screen / local video + image on stage | working |
| Per-scene sources — switching scenes changes the output | working |
| Audio mixer, AudioWorklet metering, ducking | working |
| Go Live → `MediaRecorder` → ffmpeg → multi-RTMP + MP4 | working |
| Creator tools (convert / extract / remove audio) via ffmpeg | working |
| Camera & mic tests | working |
| Guest WebRTC (mesh, perfect negotiation) | implemented, needs multi-machine testing |
| Overlays, countdown, chat-on-stream, transitions | renderers built and wired |
| Keyboard shortcuts, persisted settings | working |
| Chat aggregation from real platforms | not started |
| AI assistant | UI only — no model provider connected |

Anything not yet backed by a real service says so in the UI rather than faking output.

## Deployment

`main` publishes the front end to GitHub Pages automatically.

**Pages hosts the UI only.** It is a static host, so the Express server — ffmpeg
fan-out, WebSocket signalling, the tools API and the speed test — does not run there.
On Pages you get the interface; anything needing the backend will report that it can't
reach it.

### Deploying the backend

The server ships a Dockerfile (Node 22 + ffmpeg) and a Render blueprint.

**Render** — the blueprint is committed, so:

1. <https://dashboard.render.com> -> **New** -> **Blueprint**
2. Pick this repository. Render reads `studio/render.yaml` and provisions the service.
3. Set `CORS_ORIGIN` to your Pages URL when prompted.

**Anywhere else that runs Docker:**

```bash
cd studio
docker build -f server/Dockerfile -t studio-api .
docker run -p 4000:4000 -e CORS_ORIGIN=https://your-pages-url studio-api
```

Then point the front end at it and redeploy Pages:

```bash
gh variable set VITE_API_BASE --repo <owner>/<repo> --body "https://your-api.onrender.com"
gh workflow run pages.yml --repo <owner>/<repo>
```

Locally the front end talks to `http://localhost:4000` by default.

> Free tiers usually sleep when idle. ffmpeg needs a warm instance, so the first
> broadcast after a sleep will fail until the service wakes.

> The dev server's proxy stalls on POST bodies, so the front end calls the API
> directly via `src/lib/api.ts` rather than through it.

## Fonts

The interface ships **Inter**, which is openly licensed.

The reference design uses Graphik, which is licensed commercially by Commercial Type
and is deliberately not committed. If you hold a licence, `node scripts/import-assets.mjs`
generates `fonts.graphik.css` locally (gitignored); the token stack in `tokens.css`
already prefers Graphik when it is present.

## A note on the reference capture

This project was built against a captured copy of a commercial studio product, used as
a **specification** — exact measurements, string inventories, component names and API
shapes. That capture contains third-party compiled code, branding and licensed fonts.
It is excluded from this repository by `.gitignore` and is not ours to redistribute.

What is committed is our own implementation and our own written analysis under
`studio/spec/`.
