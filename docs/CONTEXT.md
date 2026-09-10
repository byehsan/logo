# System context — byehsan/logo

Full technical reference for the ES pyramid mark system: geometry, palette schema, animation
conventions, lockup system, favicon artifacts, and CI. `CLAUDE.md` stays a short pointer to
this file plus the file tree; this is where the actual detail lives so it doesn't keep
growing CLAUDE.md every time the system changes.

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

## The signature

`signature.svg` ("byEhsan", vector calligraphy, viewBox `0 0 900 300`) is one spine path
(`stroke-width="7"`) carrying the whole word, plus 8 short "weight" paths overlaid on the
downstrokes at `stroke-width` 11–13 for thick-thin contrast a single stroke-width can't
give, plus a filled two-curve flourish tail that tapers to a true point. `signature-hand.svg`
is the spine alone — same gesture, no weights, no flourish — for contexts wanting a rawer,
more handwritten read (teasers, social) over full brand polish; it is not a separately traced
signature, just the unweighted construction. Legibility floor is ~120px wide; below that
(e.g. the header lockup in `index.html`, ~112px) some readability is expected to be traded
for compactness — don't try to compensate by inflating stroke-width, that distorts the
letterforms instead. A separate downloadable `signature-draw.svg` (self-contained, CSS
`@keyframes` inline) animates the spine drawing on and holding/fading, 4.5s loop, for use
outside the site — teasers, video overlays, etc. — where a live page context isn't available.

## Site structure

`index.html` is the whole thing: a single-page logo/brand tool (palette switcher, live
states/http/moods grids, lockup generator, a component reference for developers building
the actual apps/landing pages — buttons, cards, capsules, progress bars, diagrams/mockup
grids — and the download panel: source files plus dynamically-fetched latest-release assets
via the GitHub API). There is deliberately no separate personal landing page — this repo is
the brand *asset* system, not the product site. `preview.html` is a static offline snapshot
of `index.html`'s content, kept in sync by hand.

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

**Important:** the mark/wordmark/signature's own `color` must always come from a preset's
`text` token, never `primary`/`accent` — those are tuned for small UI touches, not for
driving the mark's visibility against its own background. Wiring the mark to `primary`
instead of `text` is a real bug that shipped once already (graphite's `#2b2b2d` mark on its
`#1d1f20` background is ~1.1:1 contrast, functionally invisible) — see `preview.html`'s
`c-white`/`c-graphite` classes for the correct pattern (mark = text-colored by default;
solid-colored only when deliberately shown as a palette swatch, not as the live logo).

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
import { base, signature, signatureHand, stateLoading, http404, moodHappy, palette, createTextLockup, createIconLockup } from '@byehsan/logo'
import '@byehsan/logo/css'
```

## Lockup system

```
Mark area:  x=0,  y=0, w=48, h=56  (mark at y+4, 48×48)
Gap:        16px  (x=48 to x=64)
Slot:       x=64, baseline y=37, Space Grotesk 600 24px, letter-spacing -0.5
```

16px is canonical — it's load-bearing throughout `src/lockup.mjs`, `test/lockup.test.mjs`,
`lockup/template.svg`/`icon-template.svg`/`blog.svg`, and `index.html`'s generator. A past
merge from an independently-diverged `main` briefly reintroduced an 8px variant; it was
reverted for consistency. Don't reintroduce 8px without updating all of the above together.

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

CI lives entirely in `.github/workflows/release.yml` — one workflow, not split across
files. Keep it that way: a separate `pages.yml` deploying on the same push-to-main trigger
would race/duplicate the `pages` job already in `release.yml`.

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
7. Document here and bump the version (`CLAUDE.md`'s **Current version** line too)

## Known gotchas for the next agent

- **Node**: CI is pinned to Node 24 (current LTS as of this writing — v20 went EOL in
  March 2026). `package.json` declares `"engines": {"node": ">=24"}`.
- **npm install in a sandboxed/offline dev environment**: a fresh `npm install` on
  `vitest ^4.0.0` can hit a real npm/arborist bug (`Cannot read properties of null (reading
  'edgesOut')`) building the ideal tree from scratch with no existing lockfile. `vitest` is
  pinned to the exact `4.1.10` in `package.json` and a working `package-lock.json` is
  committed — `npm ci` from that lockfile avoids the bug. If it recurs, seed the lockfile from
  a known-good resolution rather than fighting the range resolver.
- **`dist/` `type` field**: `dist/index.js` is genuine CommonJS and `dist/index.mjs` is
  genuine ESM. `dist/package.json` must declare `"type": "commonjs"` (not `"module"`) so
  `require()` on `index.js` works — the `.mjs` extension already makes the ESM build
  unambiguous regardless of that field. Getting this backwards breaks `require()` for every
  consumer silently until someone actually imports the CJS build.
- **`main` can diverge independently.** It has before (an entire v2.4.0/v2.4.1 line — old
  mark, 8px lockup gap, split CI — built without any awareness of this rebrand). Before
  trusting `git log`/`git fetch` output for `origin/main`, confirm the tip SHA against the
  GitHub API (or the PR's `base.sha`) rather than assuming a prior local fetch is current —
  this environment's git proxy has shown real staleness here.
