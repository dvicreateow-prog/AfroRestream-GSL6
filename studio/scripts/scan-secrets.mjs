/*
 * Secret scanner for tracked files.
 *
 * Written after a live third-party API key reached a public commit. The pre-push
 * check at the time looked for capture directories and file extensions, but never
 * for credentials embedded in our own markdown - and the specs quote real values
 * out of the analysed bundles, so prose is exactly where they hide.
 *
 *   node scripts/scan-secrets.mjs          scan tracked files
 *   node scripts/scan-secrets.mjs --all    include untracked working-tree files
 *
 * Exits non-zero on a finding so CI fails the build.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const PATTERNS = [
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{30,}/g },
  { name: 'GitHub token', re: /\bgh[pousr]_[0-9A-Za-z]{30,}/g },
  { name: 'Slack token', re: /\bxox[baprs]-[0-9A-Za-z-]{10,}/g },
  { name: 'Stripe secret key', re: /\bsk_(live|test)_[0-9A-Za-z]{20,}/g },
  { name: 'Stripe publishable key', re: /\bpk_(live|test)_[0-9A-Za-z]{20,}/g },
  { name: 'OpenAI key', re: /\bsk-[A-Za-z0-9_-]{32,}/g },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'Private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { name: 'JWT', re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g },
]

/* Placeholders and documented examples are not findings. */
const ALLOW = [
  /REDACTED/i,
  /<[^>]*>/,
  /your[-_ ]?(key|token|secret)/i,
  /example|placeholder|dummy|xxxx/i,
]

/* Binary formats that would only produce noise. */
const SKIP_EXT =
  /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|mp4|mov|webm|aac|mp3|wav|wasm|tflite|cube|zip|pdf)$/i

/* Control characters mean binary content. Built with fromCharCode so this source
 * file never contains a raw control byte of its own - an earlier version embedded a
 * literal NUL, which made git treat the scanner as a binary blob. */
const CONTROL = new RegExp(
  '[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) + ']',
)

const includeUntracked = process.argv.includes('--all')

let files
try {
  const args = includeUntracked
    ? ['ls-files', '-co', '--exclude-standard']
    : ['ls-files']
  files = execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
    .split('\n')
    .filter(Boolean)
} catch {
  console.error('scan-secrets: not a git repository')
  process.exit(2)
}

let findings = 0
let scanned = 0

for (const file of files) {
  if (SKIP_EXT.test(file)) continue

  let text
  try {
    const stat = fs.statSync(file)
    if (!stat.isFile() || stat.size > 8 * 1024 * 1024) continue
    text = fs.readFileSync(file, 'utf8')
  } catch {
    continue
  }

  if (CONTROL.test(text.slice(0, 4096))) continue
  scanned++

  const lines = text.split(/\r?\n/)

  for (const { name, re } of PATTERNS) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(text)) !== null) {
      const lineNo = text.slice(0, m.index).split(/\r?\n/).length
      const line = lines[lineNo - 1] ?? ''
      if (ALLOW.some((a) => a.test(line))) continue
      /* Print a masked fragment only - never the value itself. */
      const masked = `${m[0].slice(0, 6)}...${m[0].slice(-2)}`
      console.error(`  ${file}:${lineNo}  ${name}  (${masked})`)
      findings++
    }
  }
}

if (findings > 0) {
  console.error(`\nscan-secrets: ${findings} potential credential(s) found.`)
  console.error('Redact before committing. Third-party keys seen during analysis')
  console.error('belong to the vendor and must never be published.')
  process.exit(1)
}

console.log(`scan-secrets: clean (${scanned} files scanned)`)
