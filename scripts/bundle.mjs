#!/usr/bin/env node
/**
 * Build script — bundles all logo assets into dist/
 * Outputs: CJS, ESM, TypeScript defs, CSS vars, favicon set, SVG copies, palette
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')

mkdirSync(join(DIST, 'favicons'), { recursive: true })
mkdirSync(join(DIST, 'svgs', 'states'), { recursive: true })
mkdirSync(join(DIST, 'svgs', 'http'), { recursive: true })
mkdirSync(join(DIST, 'svgs', 'lockup'), { recursive: true })

// ── Palette ───────────────────────────────────────────────────────────────
const paletteData = JSON.parse(readFileSync(join(ROOT, 'palette.json'), 'utf8'))
writeFileSync(join(DIST, 'palette.json'), JSON.stringify(paletteData, null, 2))
console.log('✓ palette.json')

const DEFAULT_PALETTE = paletteData.palettes[paletteData.default]
const TOKENS = paletteData.tokens

// ── SVG sources ───────────────────────────────────────────────────────────
const SVG_FILES = [
  { key: 'base',           path: 'base.svg' },
  { key: 'logoPlain',      path: 'plain.svg' },
  { key: 'logoColored',    path: 'colored.svg' },
  { key: 'logoGradient',   path: 'gradient.svg' },
  { key: 'logoAnimated',   path: 'animated.svg' },
  { key: 'stateNeutral',   path: 'states/neutral.svg' },
  { key: 'stateLoading',   path: 'states/loading.svg' },
  { key: 'stateSuccess',   path: 'states/success.svg' },
  { key: 'stateWarning',   path: 'states/warning.svg' },
  { key: 'stateError',     path: 'states/error.svg' },
  { key: 'http404',        path: 'http/404.svg' },
  { key: 'http500',        path: 'http/500.svg' },
  { key: 'http503',        path: 'http/503.svg' },
  { key: 'http403',        path: 'http/403.svg' },
  { key: 'lockupTemplate', path: 'lockup/template.svg' },
  { key: 'lockupBlog',     path: 'lockup/blog.svg' },
]

const svgMap = {}
for (const { key, path } of SVG_FILES) {
  const full = join(ROOT, path)
  const content = readFileSync(full, 'utf8').trim()
  svgMap[key] = content
  // copy to dist/svgs/
  const dest = join(DIST, 'svgs', path)
  mkdirSync(dirname(dest), { recursive: true })
  copyFileSync(full, dest)
  console.log(`✓ loaded ${path}`)
}

// ── CJS bundle ────────────────────────────────────────────────────────────
const cjsLines = [
  `'use strict';`,
  `const palette = ${JSON.stringify(paletteData, null, 2)};`,
  ...Object.entries(svgMap).map(([k, v]) => `const ${k} = ${JSON.stringify(v)};`),
  `module.exports = { palette, ${Object.keys(svgMap).join(', ')} };`,
]
writeFileSync(join(DIST, 'index.js'), cjsLines.join('\n'))
console.log('✓ index.js (CJS)')

// ── ESM bundle ────────────────────────────────────────────────────────────
const esmLines = [
  `export const palette = ${JSON.stringify(paletteData, null, 2)};`,
  ...Object.entries(svgMap).map(([k, v]) => `export const ${k} = ${JSON.stringify(v)};`),
]
writeFileSync(join(DIST, 'index.esm.js'), esmLines.join('\n'))
console.log('✓ index.esm.js (ESM)')

// ── TypeScript definitions ────────────────────────────────────────────────
const tokenTypes = Object.keys(TOKENS).map(k => `  ${k}: string;`).join('\n')
const paletteEntryType = `{
  name: string;
  background: string;
  mark: string;
  text: string;
  accent: string;
  muted: string;
}`
const dtsLines = [
  `// @byehsan/logo — TypeScript definitions`,
  ``,
  `export interface PaletteTokens { ${Object.keys(TOKENS).map(k => `${k}: string`).join('; ')}; }`,
  `export interface PaletteEntry { name: string; background: string; mark: string; text: string; accent: string; muted: string; }`,
  `export interface Palette { default: string; palettes: Record<string, PaletteEntry>; tokens: PaletteTokens; }`,
  ``,
  `/** Full palette data including named palettes and token map */`,
  `export declare const palette: Palette;`,
  ``,
  ...Object.entries(svgMap).map(([k]) => `/** SVG markup string: ${k} */\nexport declare const ${k}: string;`),
]
writeFileSync(join(DIST, 'index.d.ts'), dtsLines.join('\n'))
console.log('✓ index.d.ts (TypeScript)')

// ── CSS bundle ────────────────────────────────────────────────────────────
const toDataUri = svg => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

const cssLines = [
  `/* @byehsan/logo — CSS custom properties */`,
  `:root {`,
  `  /* Brand palette tokens */`,
  ...Object.entries(TOKENS).map(([k, v]) => `  --color-${k}: ${v};`),
  ``,
  `  /* Default palette (${paletteData.default}) */`,
  ...Object.entries(DEFAULT_PALETTE).map(([k, v]) => `  --be-${k}: ${v};`),
  ``,
  `  /* SVG data URIs */`,
  ...Object.entries(svgMap).map(([k, v]) => `  --logo-${k}: ${toDataUri(v)};`),
  `}`,
  ``,
  `/* Named palette classes */`,
  ...Object.entries(paletteData.palettes).map(([id, p]) =>
    `.be-palette-${id} {\n${Object.entries(p).map(([k, v]) => `  --be-${k}: ${v};`).join('\n')}\n}`
  ).join('\n'),
]
writeFileSync(join(DIST, 'index.css'), cssLines.join('\n'))
console.log('✓ index.css')

// ── states.css (copy) ─────────────────────────────────────────────────────
copyFileSync(join(ROOT, 'states.css'), join(DIST, 'states.css'))
console.log('✓ states.css')

// ── Favicon generation ────────────────────────────────────────────────────
// Colour the currentColor SVG with the default mark colour before rasterising
const faviconSrc = svgMap.base.replace(/currentColor/g, DEFAULT_PALETTE.mark)
const tmpSvg = join(DIST, '_favicon-src.svg')
writeFileSync(tmpSvg, faviconSrc)

const FAVICON_SIZES = [16, 32, 48, 96, 180, 192, 512]
const rsvgOk = (() => { try { execSync('which rsvg-convert', { stdio: 'ignore' }); return true } catch { return false } })()
const convertOk = (() => { try { execSync('which convert', { stdio: 'ignore' }); return true } catch { return false } })()

if (rsvgOk) {
  for (const size of FAVICON_SIZES) {
    const label = size === 180 ? 'apple-touch-icon' : `favicon-${size}x${size}`
    const out = join(DIST, 'favicons', `${label}.png`)
    execSync(`rsvg-convert -w ${size} -h ${size} "${tmpSvg}" -o "${out}"`)
    console.log(`✓ favicons/${label}.png`)
  }

  // Copy apple-touch-icon to dist root
  copyFileSync(join(DIST, 'favicons', 'apple-touch-icon.png'), join(DIST, 'apple-touch-icon.png'))

  // favicon.svg (coloured, for modern browsers)
  writeFileSync(join(DIST, 'favicons', 'favicon.svg'), faviconSrc)
  copyFileSync(join(DIST, 'favicons', 'favicon.svg'), join(DIST, 'favicon.svg'))
  console.log('✓ favicons/favicon.svg')

  if (convertOk) {
    // Multi-size ICO: 16, 32, 48
    const pngs = [16, 32, 48].map(s => join(DIST, 'favicons', `favicon-${s}x${s}.png`)).join(' ')
    execSync(`convert ${pngs} "${join(DIST, 'favicons', 'favicon.ico')}"`)
    copyFileSync(join(DIST, 'favicons', 'favicon.ico'), join(DIST, 'favicon.ico'))
    console.log('✓ favicons/favicon.ico')
  } else {
    console.warn('⚠ imagemagick not available — skipping favicon.ico')
  }
} else {
  console.warn('⚠ rsvg-convert not available — skipping favicon rasterisation')
}

// Clean up temp file
try { execSync(`rm "${tmpSvg}"`) } catch {}

// ── PWA webmanifest ───────────────────────────────────────────────────────
const manifest = {
  name: 'byEhsan',
  short_name: 'byEhsan',
  icons: [
    { src: 'favicons/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'favicons/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
  theme_color: DEFAULT_PALETTE.background,
  background_color: DEFAULT_PALETTE.background,
  display: 'standalone',
}
writeFileSync(join(DIST, 'site.webmanifest'), JSON.stringify(manifest, null, 2))
console.log('✓ site.webmanifest')

// ── dist/package.json (for npm consumers) ────────────────────────────────
const rootPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const distPkg = {
  name: rootPkg.name,
  version: rootPkg.version,
  description: rootPkg.description,
  type: 'module',
  main: './index.js',
  module: './index.esm.js',
  types: './index.d.ts',
  exports: {
    '.':       { import: './index.esm.js', require: './index.js', types: './index.d.ts' },
    './css':   './index.css',
    './states-css': './states.css',
    './palette': './palette.json',
  },
  keywords: rootPkg.keywords,
  license: rootPkg.license,
  repository: { type: 'git', url: 'https://github.com/byehsan/logo.git' },
}
writeFileSync(join(DIST, 'package.json'), JSON.stringify(distPkg, null, 2))
console.log('✓ dist/package.json')

console.log('\n✅ Bundle complete → dist/')
