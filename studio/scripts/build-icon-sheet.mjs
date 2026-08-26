/*
 * Build a contact sheet of every captured SVG icon so they can be identified
 * visually and given real names. Writes web/public/icon-sheet.html.
 */
import fs from 'node:fs'
import path from 'node:path'

const ICONS = path.resolve('web/src/assets/icons')
const OUT = path.resolve('web/public/icon-sheet.html')

const files = fs.readdirSync(ICONS).filter((f) => f.endsWith('.svg')).sort()

const PAGE_SIZE = 48
const pages = []
for (let i = 0; i < files.length; i += PAGE_SIZE) pages.push(files.slice(i, i + PAGE_SIZE))

function cell(file, idx) {
  let svg = fs.readFileSync(path.join(ICONS, file), 'utf8')
  // strip XML prolog / doctype so it inlines cleanly
  svg = svg.replace(/<\?xml[^>]*\?>/g, '').replace(/<!DOCTYPE[^>]*>/gi, '')
  // force a consistent render box and let currentColor drive the fill
  svg = svg.replace(/<svg([^>]*)>/i, (m, attrs) => {
    const cleaned = attrs
      .replace(/\swidth="[^"]*"/gi, '')
      .replace(/\sheight="[^"]*"/gi, '')
    return `<svg${cleaned} width="34" height="34">`
  })
  const short = file.replace(/\.svg$/, '').replace(/^studio-inline-svg-/, 's').replace(/^prejoin-prejoin-inline-/, 'p')
  return `<figure><div class="ico">${svg}</div><figcaption>${idx}<br>${short}</figcaption></figure>`
}

let n = 0
const sections = pages
  .map((page, pi) => {
    const cells = page.map((f) => cell(f, ++n)).join('\n')
    return `<section><h2>Page ${pi + 1} — icons ${pi * PAGE_SIZE + 1}–${pi * PAGE_SIZE + page.length}</h2><div class="grid">${cells}</div></section>`
  })
  .join('\n')

const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Icon sheet</title>
<style>
  body { margin:0; padding:20px; background:#141416; color:#f6f6f7;
         font:12px Inter,Arial,sans-serif; }
  h2 { font-size:14px; color:#a3a3ad; margin:26px 0 10px; font-weight:600; }
  .grid { display:grid; grid-template-columns:repeat(12,1fr); gap:10px; }
  figure { margin:0; background:#242428; border-radius:8px; padding:10px 4px 6px;
           display:flex; flex-direction:column; align-items:center; gap:6px; }
  .ico { width:34px; height:34px; display:grid; place-items:center; color:#f6f6f7; }
  .ico svg { max-width:34px; max-height:34px; }
  figcaption { font-size:8px; color:#73737d; text-align:center; line-height:1.25;
               word-break:break-all; }
</style></head>
<body><h1 style="font-size:16px">Captured Studio icons — ${files.length} total</h1>
${sections}
</body></html>`

fs.writeFileSync(OUT, html, 'utf8')
console.log(`wrote ${OUT}`)
console.log(`${files.length} icons across ${pages.length} pages`)
