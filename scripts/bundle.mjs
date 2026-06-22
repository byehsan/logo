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
  { key: 'logoPlain',       path: 'plain.svg' },
  { key: 'logoColored',     path: 'colored.svg' },
  { key: 'logoGradient',    path: 'gradient.svg' },
  { key: 'logoAnimated',    path: 'animated.svg' },
  { key: 'logoLoad',        path: 'load.svg' },
  { key: 'logoSuccess',     path: 'success.svg' },
  { key: 'logoFail',        path: 'fail.svg' },
  { key: 'logoWarn',        path: 'warn.svg' },
  { key: 'portrait',        path: 'portrait.svg' },
  { key: 'portraitLoad',    path: 'portrait-states/load.svg' },
  { key: 'portraitSuccess', path: 'portrait-states/success.svg' },
  { key: 'portraitFail',    path: 'portrait-states/fail.svg' },
  { key: 'portraitWarn',    path: 'portrait-states/warn.svg' },
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
  { key: 'logoPlain',   path: 'plain.svg' },
  { key: 'logoColored', path: 'colored.svg' },
  { key: 'portrait',    path: 'portrait.svg' },
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
