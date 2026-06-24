#!/usr/bin/env node
/**
 * Build script — bundles all SVG assets into dist/
 * Outputs: CJS module, ES module, CSS vars, PNG exports, palette.json
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import { join, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')

mkdirSync(DIST, { recursive: true })
mkdirSync(join(DIST, 'png'), { recursive: true })

// ── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = {
  dark:      '#0a0514',
  orange:    '#f07828',
  indigo:    '#5901d8',
  light:     '#eeeef4',
  success:   '#2ecc71',
  error:     '#e74c3c',
  skin:      '#c8956a',
}

writeFileSync(join(DIST, 'palette.json'), JSON.stringify(PALETTE, null, 2))
console.log('✓ palette.json')

// ── Collect SVG sources ───────────────────────────────────────────────────────
const SVG_FILES = [
  { key: 'base',            path: 'base.svg' },
  { key: 'logoPlain',       path: 'plain.svg' },
  { key: 'logoColored',     path: 'colored.svg' },
  { key: 'logoGradient',    path: 'gradient.svg' },
  { key: 'logoAnimated',    path: 'animated.svg' },
  { key: 'stateNeutral',    path: 'states/neutral.svg' },
  { key: 'stateLoading',    path: 'states/loading.svg' },
  { key: 'stateSuccess',    path: 'states/success.svg' },
  { key: 'stateWarning',    path: 'states/warning.svg' },
  { key: 'stateError',      path: 'states/error.svg' },
  { key: 'http404',         path: 'http/404.svg' },
  { key: 'http500',         path: 'http/500.svg' },
  { key: 'http503',         path: 'http/503.svg' },
  { key: 'http403',         path: 'http/403.svg' },
  { key: 'lockupTemplate',  path: 'lockup/template.svg' },
  { key: 'lockupBlog',      path: 'lockup/blog.svg' },
]

const svgMap = {}
for (const { key, path } of SVG_FILES) {
  const full = join(ROOT, path)
  const content = readFileSync(full, 'utf8').trim()
  svgMap[key] = content
  console.log(`✓ loaded ${path}`)
}

// ── CJS bundle ───────────────────────────────────────────────────────────────
const cjsLines = [
  `'use strict';`,
  `const palette = ${JSON.stringify(PALETTE, null, 2)};`,
  ...Object.entries(svgMap).map(([k, v]) =>
    `const ${k} = ${JSON.stringify(v)};`
  ),
  `module.exports = { palette, ${Object.keys(svgMap).join(', ')} };`,
]
writeFileSync(join(DIST, 'bundle.js'), cjsLines.join('\n'))
console.log('✓ bundle.js (CJS)')

// ── ESM bundle ───────────────────────────────────────────────────────────────
const esmLines = [
  `export const palette = ${JSON.stringify(PALETTE, null, 2)};`,
  ...Object.entries(svgMap).map(([k, v]) =>
    `export const ${k} = ${JSON.stringify(v)};`
  ),
]
writeFileSync(join(DIST, 'bundle.esm.js'), esmLines.join('\n'))
console.log('✓ bundle.esm.js (ESM)')

// ── CSS bundle ───────────────────────────────────────────────────────────────
const toDataUri = (svg) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

const cssLines = [
  `:root {`,
  ...Object.entries(PALETTE).map(([k, v]) =>
    `  --color-${k}: ${v};`
  ),
  ``,
  ...Object.entries(svgMap).map(([k, v]) =>
    `  --logo-${k}: ${toDataUri(v)};`
  ),
  `}`,
]
writeFileSync(join(DIST, 'bundle.css'), cssLines.join('\n'))
console.log('✓ bundle.css')

// ── PNG exports ───────────────────────────────────────────────────────────────
const PNG_SIZES = [16, 32, 64, 128, 256, 512]
const PNG_TARGETS = [
  { key: 'base',        path: 'base.svg' },
  { key: 'logoPlain',   path: 'plain.svg' },
  { key: 'logoColored', path: 'colored.svg' },
]

for (const { key, path } of PNG_TARGETS) {
  for (const size of PNG_SIZES) {
    const src = join(ROOT, path)
    const out = join(DIST, 'png', `${key}-${size}.png`)
    try {
      execSync(`rsvg-convert -w ${size} -h ${size} "${src}" -o "${out}"`)
      console.log(`✓ png/${key}-${size}.png`)
    } catch {
      console.warn(`⚠ rsvg-convert not available, skipping PNG export for ${key}-${size}`)
    }
  }
}

console.log('\n✅ Bundle complete → dist/')
