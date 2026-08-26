/*
 * Pull exact numeric metrics out of the recovered SCSS.
 *
 * The recovered stylesheets are Restream's copyrighted source and are NOT copied into
 * this project. What this script extracts is factual measurements - variable values and
 * the numbers on layout properties - so our own CSS can use exact figures instead of
 * values eyeballed from screenshots.
 *
 * Output: studio/spec/METRICS-from-scss.md
 */
import fs from 'node:fs'
import path from 'node:path'

const EXTRACTED = path.resolve(
  '..',
  '03-deep-static/source-maps/extracted',
)
const OUT = path.resolve('spec/METRICS-from-scss.md')

/* Component areas we have built, mapped to the source paths that style them. */
const AREAS = [
  { key: 'Layout switcher', match: /LayoutSwitch\// },
  { key: 'Header / session controls', match: /HostHeaderV2|SessionControls/ },
  { key: 'Stage preview', match: /MediaStreamPreview|Preview\.constants/ },
  { key: 'Scenes rail', match: /Scenes(Sources|Sidebar|List|Item)|SceneItem/ },
  { key: 'Interaction controls', match: /IteractionControls|InteractionControols/ },
  { key: 'Countdown', match: /Countdown/ },
  { key: 'Chat overlay', match: /ChatOverlay/ },
  { key: 'Overlay controls', match: /OverlayControls|GraphicsElementControls/ },
  { key: 'Slide controls', match: /SlideControls/ },
  { key: 'Sidebar / panels', match: /Sidebar|SidePanel|VerticalTab/ },
  { key: 'Viewport / breakpoints', match: /viewport|media\.scss/ },
  { key: 'z-index ladder', match: /zIndex/ },
]

/* Collect unique logical files (the same file appears under several chunk folders). */
const files = new Map()
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.(scss|css)$/.test(e.name)) {
      const logical = p.split(/[/\\]scripts[/\\]/)[1]
      if (logical && !files.has(logical)) files.set(logical, p)
    }
  }
}
walk(EXTRACTED)

const VAR = /^\s*\$([A-Za-z0-9_-]+)\s*:\s*([^;]+);/gm
/* Numeric declarations worth reconciling against our CSS. */
const DECL =
  /^\s*(width|height|min-width|min-height|max-width|max-height|gap|row-gap|column-gap|padding|margin|border-radius|font-size|line-height|top|right|bottom|left|flex-basis)\s*:\s*([^;]*\d[^;]*);/gm

let md = '# Exact metrics recovered from the published SCSS\n\n'
md += 'These are **measurements only**, extracted so our own stylesheets can use exact\n'
md += 'figures rather than values estimated from screenshots. The source stylesheets are\n'
md += "Restream's copyrighted code and are not copied into this project - see\n"
md += '`TOOLS-CATALOG.md` §3.\n\n'
md += `Unique logical stylesheets scanned: **${files.size}**\n\n`

let totalVars = 0
let totalDecls = 0

for (const area of AREAS) {
  const matched = [...files.entries()].filter(([logical]) => area.match.test(logical))
  if (!matched.length) continue

  md += `\n## ${area.key}\n\n`

  for (const [logical, abs] of matched) {
    const src = fs.readFileSync(abs, 'utf8')

    const vars = []
    VAR.lastIndex = 0
    let m
    while ((m = VAR.exec(src)) !== null) {
      const val = m[2].trim()
      if (/\d/.test(val) && val.length < 90) vars.push([m[1], val])
    }

    const decls = new Map()
    DECL.lastIndex = 0
    while ((m = DECL.exec(src)) !== null) {
      const val = m[2].trim()
      if (val.length < 90) {
        const k = `${m[1]}: ${val}`
        decls.set(k, (decls.get(k) ?? 0) + 1)
      }
    }

    if (!vars.length && !decls.size) continue

    md += `### \`${logical}\`\n\n`

    if (vars.length) {
      totalVars += vars.length
      md += '| variable | value |\n|---|---|\n'
      for (const [k, v] of vars) md += `| \`$${k}\` | \`${v}\` |\n`
      md += '\n'
    }

    if (decls.size) {
      totalDecls += decls.size
      const top = [...decls.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18)
      md += '| declaration | uses |\n|---|---:|\n'
      for (const [k, n] of top) md += `| \`${k}\` | ${n} |\n`
      md += '\n'
    }
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, md, 'utf8')

console.log(`scanned ${files.size} unique stylesheets`)
console.log(`extracted ${totalVars} variable values, ${totalDecls} distinct numeric declarations`)
console.log(`wrote ${OUT}`)
