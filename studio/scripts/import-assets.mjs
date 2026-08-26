/*
 * Asset pipeline: pull the real captured Studio assets into the app.
 *
 * The capture stores files under origin-hashed names. This script:
 *   1. parses every @font-face block in the production CSS to recover real
 *      font-family / weight / style, then maps each url() hash to its local file
 *   2. copies fonts, images, SVGs, LUTs, MediaPipe models + WASM, audio worklets
 *      and sound effects into web/public and web/src/assets under real names
 *   3. emits fonts.css with @font-face rules pointing at the copied files
 *   4. emits an assets.json index so the app can resolve everything by name
 *
 * Run: node scripts/import-assets.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const PKG = path.resolve('..', 'RESTREAM Clone')
const ROOT = path.resolve(process.cwd(), '..')          // .../RESTREAM Clone
const CAP = ROOT
const WEB = path.resolve(process.cwd(), 'web')

const CSS_DIR = path.join(CAP, '01-inside-studio-verified/client-static/css')
const FRESH_CSS = path.join(process.cwd(), 'spec/refresh-2026-08-25/chunks')
const REF_STATIC = path.join(CAP, '01-inside-studio-verified/referenced-static')
const OBSERVED = path.join(CAP, '01-inside-studio-verified/observed-assets')
const INLINE_SVG = path.join(CAP, '01-inside-studio-verified/inline-svg')
const PREJOIN_SVG = path.join(CAP, '02-prejoin-observed/inline-svg')
const DEEP = path.join(CAP, '03-deep-static/recursive')
const MANIFEST = path.join(CAP, '01-inside-studio-verified/MANIFEST-referenced-static.csv')

const OUT_PUBLIC = path.join(WEB, 'public')
const OUT_FONTS = path.join(OUT_PUBLIC, 'fonts')
const OUT_IMG = path.join(OUT_PUBLIC, 'img')
const OUT_LUT = path.join(OUT_PUBLIC, 'luts')
const OUT_MP = path.join(OUT_PUBLIC, 'mediapipe')
const OUT_AUDIO = path.join(OUT_PUBLIC, 'audio')
const OUT_VIDEO = path.join(OUT_PUBLIC, 'video')
const OUT_ICONS = path.join(WEB, 'src/assets/icons')
const OUT_SRC_ASSETS = path.join(WEB, 'src/assets')

const stats = { fonts: 0, images: 0, icons: 0, luts: 0, models: 0, audio: 0, video: 0, wasm: 0, skipped: 0 }

for (const d of [OUT_FONTS, OUT_IMG, OUT_LUT, OUT_MP, OUT_AUDIO, OUT_VIDEO, OUT_ICONS]) {
  fs.mkdirSync(d, { recursive: true })
}

/* ------------------------------------------------------------------ */
/* 1. manifest: url -> local file                                      */
/* ------------------------------------------------------------------ */

function parseCsv(text) {
  const rows = []
  const lines = text.split(/\r?\n/).filter(Boolean)
  const header = lines[0].split(',').map((h) => h.replace(/^"|"$/g, ''))
  for (const line of lines.slice(1)) {
    const cells = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++ } else inQ = !inQ
      } else if (c === ',' && !inQ) { cells.push(cur); cur = '' } else cur += c
    }
    cells.push(cur)
    const row = {}
    header.forEach((h, i) => (row[h] = cells[i] ?? ''))
    rows.push(row)
  }
  return rows
}

const manifest = parseCsv(fs.readFileSync(MANIFEST, 'utf8'))
/** basename(url) -> absolute local path */
const byBasename = new Map()
/** full url -> absolute local path */
const byUrl = new Map()

for (const r of manifest) {
  if (r.status !== 'downloaded' || !r.file) continue
  const abs = path.join(CAP, '01-inside-studio-verified', r.file.replace(/^referenced-static\//, 'referenced-static/'))
  if (!fs.existsSync(abs)) continue
  byUrl.set(r.url, abs)
  byBasename.set(path.basename(r.url.split('?')[0]), abs)
}

/* ------------------------------------------------------------------ */
/* 2. @font-face extraction                                            */
/* ------------------------------------------------------------------ */

const cssFiles = []
for (const dir of [CSS_DIR, FRESH_CSS]) {
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.css')) cssFiles.push(path.join(dir, f))
}

const FACE = /@font-face\s*\{([^}]*)\}/g
const faces = []

for (const file of cssFiles) {
  const css = fs.readFileSync(file, 'utf8')
  let m
  FACE.lastIndex = 0
  while ((m = FACE.exec(css)) !== null) {
    const body = m[1]
    const family = (body.match(/font-family:\s*([^;]+)/) || [])[1]?.trim().replace(/^["']|["']$/g, '')
    const weight = (body.match(/font-weight:\s*([^;]+)/) || [])[1]?.trim() ?? '400'
    const style = (body.match(/font-style:\s*([^;]+)/) || [])[1]?.trim() ?? 'normal'
    const display = (body.match(/font-display:\s*([^;]+)/) || [])[1]?.trim() ?? 'swap'
    const urls = [...body.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)\s*(?:format\(\s*["']?([^"')]+)["']?\s*\))?/g)]
      .map((u) => ({ url: u[1], format: u[2] }))
      .filter((u) => !u.url.startsWith('data:'))
    if (family && urls.length) faces.push({ family, weight, style, display, urls })
  }
}

/* Deduplicate by family+weight+style. */
const seen = new Set()
const uniqueFaces = []
for (const f of faces) {
  const k = `${f.family}|${f.weight}|${f.style}`
  if (seen.has(k)) continue
  seen.add(k)
  uniqueFaces.push(f)
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const fontCss = []
for (const f of uniqueFaces) {
  const srcParts = []
  for (const u of f.urls) {
    const base = path.basename(u.url.split('?')[0])
    const src = byBasename.get(base)
    if (!src) { stats.skipped++; continue }
    const ext = path.extname(base)
    const name = `${slug(f.family)}-${f.weight}${f.style === 'italic' ? 'i' : ''}${ext}`
    const dest = path.join(OUT_FONTS, name)
    if (!fs.existsSync(dest)) { fs.copyFileSync(src, dest); stats.fonts++ }
    srcParts.push(`url('/fonts/${name}')${u.format ? ` format('${u.format}')` : ''}`)
  }
  if (!srcParts.length) continue
  fontCss.push(
    `@font-face {\n  font-family: '${f.family}';\n  font-style: ${f.style};\n` +
      `  font-weight: ${f.weight};\n  font-display: ${f.display};\n` +
      `  src: ${srcParts.join(',\n       ')};\n}`,
  )
}

fs.writeFileSync(
  path.join(WEB, 'src/styles/fonts.graphik.css'),
  `/*\n * Real captured Studio fonts.\n * Generated by scripts/import-assets.mjs - do not edit by hand.\n * ${uniqueFaces.length} @font-face rules recovered from the production CSS.\n */\n\n` +
    fontCss.join('\n\n') +
    '\n',
  'utf8',
)

/* ------------------------------------------------------------------ */
/* 3. copy binary assets by type                                       */
/* ------------------------------------------------------------------ */

function copyTree(srcDir, filter, destDir, counterKey, rename) {
  if (!fs.existsSync(srcDir)) return
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name)
      if (entry.isDirectory()) { walk(p); continue }
      if (!filter(entry.name)) continue
      const name = rename ? rename(entry.name, p) : entry.name
      const dest = path.join(destDir, name)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      if (!fs.existsSync(dest)) { fs.copyFileSync(p, dest); stats[counterKey]++ }
    }
  }
  walk(srcDir)
}

const isImage = (n) => /\.(png|jpe?g|webp|gif|ico)$/i.test(n)
const isSvg = (n) => /\.svg$/i.test(n)
const isVideo = (n) => /\.(mp4|mov)$/i.test(n)
const isAudio = (n) => /\.(aac|mp3|wav|ogg)$/i.test(n)

/* Images + SVGs keep their captured names; hashes are stripped where obvious. */
const stripHash = (n) => n.replace(/[.-][a-f0-9]{12,}(?=\.[a-z0-9]+$)/i, '')

copyTree(REF_STATIC, isImage, OUT_IMG, 'images', stripHash)
copyTree(OBSERVED, isImage, OUT_IMG, 'images', stripHash)
copyTree(REF_STATIC, isVideo, OUT_VIDEO, 'video', stripHash)
copyTree(REF_STATIC, isAudio, OUT_AUDIO, 'audio', stripHash)
copyTree(path.join(CAP, '01-inside-studio-verified/client-static/media'), () => true, OUT_VIDEO, 'video', stripHash)

/* SVGs: referenced + observed keep names; inline SVGs are content-hashed icons. */
copyTree(REF_STATIC, isSvg, OUT_ICONS, 'icons', stripHash)
copyTree(OBSERVED, isSvg, OUT_ICONS, 'icons', stripHash)
copyTree(INLINE_SVG, isSvg, OUT_ICONS, 'icons', (n) => `studio-${n}`)
copyTree(PREJOIN_SVG, isSvg, OUT_ICONS, 'icons', (n) => `prejoin-${n}`)

/* LUTs, models, WASM, worklet */
copyTree(DEEP, (n) => /\.cube$/i.test(n), OUT_LUT, 'luts', stripHash)
copyTree(DEEP, (n) => /\.tflite$/i.test(n), OUT_MP, 'models', (n) => n)
copyTree(DEEP, (n) => /\.wasm$/i.test(n), OUT_MP, 'wasm', (n) => n)
copyTree(DEEP, (n) => /vision_wasm.*\.js$/i.test(n), OUT_MP, 'wasm', (n) => n)
copyTree(DEEP, (n) => /\.worklet\.js$/i.test(n), OUT_AUDIO, 'audio', () => 'volume-meter.worklet.js')
copyTree(DEEP, isImage, OUT_IMG, 'images', stripHash)

/* ------------------------------------------------------------------ */
/* 4. index                                                            */
/* ------------------------------------------------------------------ */

const listDir = (d, prefix) =>
  fs.existsSync(d) ? fs.readdirSync(d).sort().map((f) => `${prefix}/${f}`) : []

const index = {
  generated: 'scripts/import-assets.mjs',
  fonts: {
    families: [...new Set(uniqueFaces.map((f) => f.family))].sort(),
    faces: uniqueFaces.length,
    files: listDir(OUT_FONTS, '/fonts'),
  },
  images: listDir(OUT_IMG, '/img'),
  video: listDir(OUT_VIDEO, '/video'),
  audio: listDir(OUT_AUDIO, '/audio'),
  luts: listDir(OUT_LUT, '/luts'),
  mediapipe: listDir(OUT_MP, '/mediapipe'),
  icons: fs.existsSync(OUT_ICONS) ? fs.readdirSync(OUT_ICONS).sort() : [],
}

fs.mkdirSync(OUT_SRC_ASSETS, { recursive: true })
fs.writeFileSync(path.join(OUT_SRC_ASSETS, 'assets.json'), JSON.stringify(index, null, 2), 'utf8')

/* ------------------------------------------------------------------ */

console.log('=== asset import complete ===')
console.log(`  fonts   ${String(stats.fonts).padStart(4)}  (${index.fonts.families.length} families, ${uniqueFaces.length} faces)`)
console.log(`  icons   ${String(stats.icons).padStart(4)}`)
console.log(`  images  ${String(stats.images).padStart(4)}`)
console.log(`  video   ${String(stats.video).padStart(4)}`)
console.log(`  audio   ${String(stats.audio).padStart(4)}`)
console.log(`  luts    ${String(stats.luts).padStart(4)}`)
console.log(`  models  ${String(stats.models).padStart(4)}`)
console.log(`  wasm    ${String(stats.wasm).padStart(4)}`)
console.log(`  skipped ${String(stats.skipped).padStart(4)}  (font url with no local file)`)
console.log('\nfont families:')
for (const f of index.fonts.families) console.log('  -', f)
