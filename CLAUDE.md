# CLAUDE.md — byehsan/logo

Brand asset repository for byEhsan. ES pyramid mark with full state animation system, mood
eyes, HTTP error states, lockup templates, favicon set, and CI release pipeline.

**Current version:** v3.0.0
**GH Pages:** https://byehsan.github.io/logo/ (interactive palette switcher)
**npm:** `@byehsan/logo` on GitHub Packages

## File tree

```
base.svg                    clean pyramid mark, currentColor stroke, no animation
signature.svg                abstract cursive flourish mark, pairs with the pyramid in lockups
plain.svg                   legacy triskelion — black stroke variant (kept for reference, not bundled)
colored.svg                 legacy triskelion — orange→indigo gradient (kept for reference, not bundled)
gradient.svg                legacy triskelion — gradient + CSS rotation (kept for reference, not bundled)
animated.svg                legacy triskelion — SMIL rotation (kept for reference, not bundled)

states/
  neutral.svg                idle presence, breathing — alive, 4s loop
  loading.svg                edge pulse chases the 4 edges + crown — patient, 1.6s loop
  success.svg                spring joy snap with settle — happy, 2.2s loop
  warning.svg                crown facet + crown flicker — alert, 0.34s loop
  error.svg                  frustrated jitter — angry, 0.4s loop

http/
  404.svg                    confused tilt wobble ±8° — lost, 1.6s loop
  500.svg                    malfunctioning jitter ±2px — dying, 0.4s loop
  503.svg                    slow breathe + Zzz floats — asleep, 2.2s loop
  403.svg                    refused, hard flicker — denied, 0.34s loop

moods/
  happy.svg                   whole mark bounces with a joyful rotation — 1.8s loop
  angry.svg                   crown narrows to a tight, shaking glare — 1.1s loop
  sad.svg                     crown shrinks and droops downward — 2.6s loop
  sleepy.svg                  crown pulses smaller, heavy-lidded — 3.2s loop
  surprised.svg                crown snaps wide and holds — 1.8s loop

lockup/
  template.svg                mark (48×48) + 16px gap + dashed slot guide
  blog.svg                    worked example: "blog" sub-brand
  icon-template.svg           icon slot + gap + text slot guide (for icon+text lockups)

src/
  mark-paths.mjs              extractMarkPaths/extractCrownRadius — parses base.svg geometry
  lockup.mjs                  createLockupApi — createTextLockup/createIconLockup (self-contained)

test/                        vitest suite — palette schema, lockup API, dist/pack smoke tests
scripts/
  bundle.mjs                  builds dist/ (CJS/ESM/CSS/TS defs/favicons/webmanifest)
  build-test-report.mjs       renders a per-release test-results/<tag>.html page

index.html                  GH Pages site — interactive palette switcher, all states live
404.html                     GH Pages error page (served automatically for unmatched paths)
403.html                     access-restricted system page
500.html                     server-error system page
503.html                     maintenance system page
thank-you.html                form/contact confirmation system page
preview.html                local preview grid (same as index.html, for offline use)
states.css                  class-driven Option B stylesheet (.state-loading etc.)
palette.json                markGeometry + named presets + token map (schema v2)
```

## The mark

The ES pyramid mark is a `<g id="mark">` of four stroked paths plus one filled circle, all
reused verbatim (only stroke-width/opacity/dasharray/transform vary) across every SVG in the
repo — states/, http/, moods/, lockup/:

| id      | role                                    |
|---------|------------------------------------------|
| `p0`    | crown facet — the top rhombus            |
| `p1`    | right descending edge                    |
| `p2`    | left descending edge                     |
| `p3`    | hidden ridge (dashed)                    |
| `crown` | filled apex dot — the mark's one expressive focal point |

viewBox `0 0 200 220`. The crown sits at `(100, 58)` — every rotate/scale animation that
needs a transform-origin uses that point, not the SVG center.

## Brand palette

`palette.json` is schema **version 2**. `markGeometry` names the four edge ids (`p0`-`p3`)
with a label each — no per-facet gradients (this is a single-tone stroke mark, not a
faceted fill). Each preset carries a `solid` accent color plus a full `ui.dark`/`ui.light`
token set (`background surface primary text textMuted border accent success warning error`).
Matching the ES brand-guidelines doc: the accent-swatch picker only changes
`primary`/`accent` — the neutral background/surface/text scale is one shared flat set across
every new preset (dark: `background #1d1f20`, `surface #262829`, `text #f2f2f3`; light:
`background #f5f5f6`, `surface #e9e9eb`, `text #1d1f20`). `legacy-brand` is the exception: it
preserves the old triskelion identity verbatim, including its own dark bg `#0a0514`.

| Preset id      | Name         | Solid     |
|----------------|--------------|-----------|
| `graphite` (default) | Graphite | `#2b2b2d` |
| `forest`       | Forest       | `#3f5c45` |
| `rust`         | Rust         | `#7a4a2f` |
| `slate-indigo` | Slate Indigo | `#4a4a7a` |
| `steel`        | Steel        | `#5980a6` |
| `legacy-brand` | Legacy Brand | `#f07828` |

Legacy flat tokens (kept for backwards compatibility, used by `legacy-brand`):

| Token   | Hex       | Use |
|---------|-----------|-----|
| dark    | `#0a0514` | legacy backgrounds/outlines |
| orange  | `#f07828` | legacy primary accent |
| indigo  | `#5901d8` | legacy secondary accent |
| light   | `#eeeef4` | legacy text on dark |
| success | `#2ecc71` | success state (all presets) |
| warning | `#f5a623` | warning state (all presets) |
| error   | `#e74c3c` | error state (all presets) |

## Animation design principle

Every animation uses **physical metaphor** — the motion IS the meaning, no label needed:
- idle breathing = alive, edge pulse = working, snap = happy, jitter = frustrated
- wobble = confused, jitter = malfunctioning, breathe+Zzz = asleep, flicker = refused/denied
- bounce = happy, narrow+shake = angry, shrink+droop = sad, heavy pulse = sleepy, snap-wide = surprised

All animations loop infinitely so they can be observed continuously.

## Theming via currentColor

All SVGs use `stroke="currentColor"` (and `fill="currentColor"` on the crown). Set `color`
on the SVG or any parent:

```html
<svg src="base.svg" style="color: #2b2b2d">
```

## Using state SVGs

**Option A — drop-in (self-contained per file):**
```html
<img src="states/loading.svg" width="48" height="48" style="color:#2b2b2d">
```

**Option B — class-driven (one CSS file):**
```html
<link rel="stylesheet" href="states.css">
<svg class="state-loading" ...> <!-- base mark --> </svg>
```

Available classes: `state-neutral` `state-loading` `state-success` `state-warning`
`state-error` `state-404` `state-500` `state-503` `state-403`

## Install in other projects

```
# .npmrc
@byehsan:registry=https://npm.pkg.github.com

npm install @byehsan/logo
```

```js
import { base, signature, stateLoading, http404, moodHappy, palette, createTextLockup, createIconLockup } from '@byehsan/logo'
import '@byehsan/logo/css'
```

## Lockup system

```
Mark area:  x=0,  y=0, w=48, h=56  (mark at y+4, 48×48)
Gap:        16px  (x=48 to x=64)
Slot:       x=64, baseline y=37, Space Grotesk 600 24px, letter-spacing -0.5
```

Add a sub-brand:
```xml
<text x="64" y="37"
      font-family="'Space Grotesk', system-ui, sans-serif"
      font-size="24" font-weight="600" letter-spacing="-0.5"
      fill="currentColor">sub-brand</text>
```

Or generate it from code with `createTextLockup('sub-brand')` /
`createIconLockup('sub-brand', iconSvg, { placement: 'e' })` (`src/lockup.mjs`,
also exported from the built package). Icon lockups use a separate, larger canvas (mark at
`(36,36)` in a 120px-tall canvas) so an icon can sit on any of 8 sides — n/s/e/w inline, or
ne/se/sw/nw as a small corner badge — without clipping.

## Favicon artifacts (in dist/ after build)

```
dist/favicons/favicon.svg          scalable, for modern browsers
dist/favicons/favicon.ico          multi-size: 16, 32, 48
dist/favicons/favicon-16x16.png
dist/favicons/favicon-32x32.png
dist/favicons/apple-touch-icon.png (180×180)
dist/favicons/favicon-192x192.png
dist/favicons/favicon-512x512.png
dist/site.webmanifest
```

Favicon HTML:
```html
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
```

## CI / versioning / tests

- **Every push to main:** SVG validation (xmllint) + `npm test` (vitest) + GH Pages deploy
- **Tag push (`v*.*.*`):** full release bundle + tests + npm publish + a per-version
  `test-results/<tag>.html` page

```bash
npm test            # vitest run — palette schema, lockup API, dist/pack smoke tests
git tag v3.1.0 && git push origin v3.1.0
```

Release artifacts: zip/tarball with all SVGs, PNGs at 7 sizes, favicon.ico, webmanifest,
CJS/ESM/CSS bundles, TypeScript defs, palette.json.

## Adding a new state

1. Copy `states/neutral.svg` as template
2. Write the `@keyframes py-*` with a physical metaphor, set `animation: ... infinite`
3. Add `.state-<name>` rule(s) to `states.css`
4. Add the file to `SVG_FILES` in `scripts/bundle.mjs`
5. Add inline version to `index.html` states grid
6. Add/adjust vitest coverage under `test/` if the change affects the lockup API or palette
   schema
7. Document here and bump the version
