# byEhsan logo system

[![Release Bundle](https://img.shields.io/github/actions/workflow/status/byehsan/logo/release.yml?branch=main&label=build)](https://github.com/byehsan/logo/actions/workflows/release.yml)
[![Latest release](https://img.shields.io/github/v/release/byehsan/logo)](https://github.com/byehsan/logo/releases/latest)
[![npm package](https://img.shields.io/badge/npm-%40byehsan%2Flogo-cb3837)](https://github.com/byehsan/logo/pkgs/npm/logo)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/byehsan/logo/blob/main/package.json)
[![GH Pages demo](https://img.shields.io/badge/demo-byehsan.github.io%2Flogo-2b2b2d)](https://byehsan.github.io/logo/)

ES pyramid mark with full state + mood + lockup system. All assets theme via CSS `currentColor`.

**Live demo / sub-brand generator:** https://byehsan.github.io/logo/

**For contributors and agents:** the full system reference — mark geometry, palette schema,
animation conventions, lockup system, CI, and known gotchas — lives in
[`docs/CONTEXT.md`](docs/CONTEXT.md). `CLAUDE.md` stays a short pointer to it plus the file
tree below.

## File tree

```
base.svg                    clean pyramid mark, currentColor stroke, no animation
signature.svg                "byEhsan" vector calligraphy — spine + 8 weight overlays + flourish
signature-hand.svg            spine alone, unweighted — rawer/handwritten reading, for teasers etc.
states/
  neutral.svg                idle presence, breathing, 4s loop
  loading.svg                edge pulse chases the 4 edges + crown, 1.6s loop
  success.svg                 spring joy snap with settle, 2.2s loop
  warning.svg                  crown facet + crown flicker, 0.34s loop
  error.svg                    frustrated jitter, 0.4s loop
http/
  404.svg                    confused tilt wobble ±8°, 1.6s loop
  500.svg                     malfunctioning jitter, 0.4s loop
  503.svg                      slow breathe + Zzz floats, 2.2s loop
  403.svg                       refused, hard flicker, 0.34s loop
moods/
  happy.svg                   whole mark bounces with a joyful rotation, 1.8s loop
  angry.svg                    crown narrows to a tight, shaking glare, 1.1s loop
  sad.svg                       crown shrinks and droops downward, 2.6s loop
  sleepy.svg                     crown pulses smaller, heavy-lidded, 3.2s loop
  surprised.svg                   crown snaps wide and holds, 1.8s loop
lockup/
  template.svg                mark + gap + dashed slot guide
  blog.svg                     worked example: "blog" sub-brand
  icon-template.svg             icon slot + gap + text slot guide
src/
  mark-paths.mjs               extractMarkPaths/extractCrownRadius
  lockup.mjs                    createLockupApi — createTextLockup/createIconLockup
test/                        vitest suite (palette schema, lockup API, dist/pack smoke)
index.html                    GH Pages site — logo tool: palette switcher, all states live,
                              lockup generator, component reference, download panel
404.html                      GH Pages error page — lost, tilt wobble
403.html                      access-restricted page — refused, hard flicker
500.html                      server-error page — malfunctioning jitter
503.html                      maintenance page — asleep, breathe + Zzz
thank-you.html                 form/contact confirmation page — happy bounce
preview.html                 static offline snapshot of all marks + states
states.css                   all @keyframes as class-driven selectors (Option B) + light/dark glow/shadow
palette.json                 markGeometry + named presets (solid + light/dark UI tokens)
```

## Usage

Theming (`currentColor`), the state SVGs (drop-in vs class-driven), and sub-brand lockup
generation are all covered live, interactively, with copy-to-clipboard snippets and a working
generator, at **https://byehsan.github.io/logo/** — that page is the up-to-date reference; it
isn't duplicated here to avoid the two drifting out of sync.

## Adding a new state

1. Copy `states/neutral.svg` as a starting point (`<g id="mark">` with `p0`-`p3` edges + `crown`)
2. Add/replace the `<style>` block with your `@keyframes py-*` and selectors
3. Add the corresponding `@keyframes py-*` and `.state-*` rules to `states.css`
4. Add the state to `preview.html` and `index.html`
5. Add the new file to `scripts/bundle.mjs` SVG_FILES array
6. Add/adjust vitest coverage under `test/` if the change touches the lockup API or palette
7. Bump version and push a tag

## Versioning

```bash
npm test
git tag v3.1.0
git push origin v3.1.0
```

CI validates every SVG, runs the vitest suite, and on a tag publishes a release with PNG
exports (16–512px), JS/ESM/CSS bundles, TypeScript defs, `palette.json`, and a per-version
`test-results/<tag>.html` page.

## Palette

Six named presets in `palette.json` (schema v2) — `graphite` (default), `forest`, `rust`,
`slate-indigo`, `steel`, `legacy-brand` — each with a `solid` accent color plus a complete
`ui.dark`/`ui.light` token set (`background`, `surface`, `primary`, `text`, `textMuted`,
`border`, `accent`, `success`, `warning`, `error`). Matching the brand-guidelines doc, the
five new presets share one flat neutral background/surface/text scale and vary only
`primary`/`accent`; `legacy-brand` is the exception and preserves the old triskelion identity
verbatim.

| Legacy token | Hex       |
|--------------|-----------|
| dark         | `#0a0514` |
| orange       | `#f07828` |
| indigo       | `#5901d8` |
| light        | `#eeeef4` |
| success      | `#2ecc71` |
| warning      | `#f5a623` |
| error        | `#e74c3c` |

The legacy orange/indigo brand palette survives as the `legacy-brand` preset for continuity.
