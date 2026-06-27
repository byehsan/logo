# CLAUDE.md — byehsan/logo

Brand asset repository for byEhsan. Triskelion mark with full state animation system, HTTP error states, lockup templates, favicon set, and CI release pipeline.

**Current version:** v2.4.0
**GH Pages:** https://byehsan.github.io/logo/ (interactive palette switcher + sub-logo builder)
**npm:** `@byehsan/logo` on GitHub Packages

## File tree

```
base.svg                    clean mark, currentColor stroke, no animation
plain.svg                   black stroke variant (legacy)
colored.svg                 orange→indigo gradient
gradient.svg                gradient + CSS rotation (legacy animated)
animated.svg                legacy SMIL rotation

states/
  neutral.svg               double heartbeat pulse — alive, 2.5s loop
  loading.svg               smooth continuous rotation — patient, 3s loop
  success.svg               spring joy bounce with settle — happy, 2.5s loop
  warning.svg               asymmetric petal stroke pulse — alert, 0.8s loop
  error.svg                 frustrated shake ×3, pause — angry, 2.2s loop

http/
  404.svg                   confused tilt oscillation ±6° — lost, 2.4s loop
  500.svg                   glitch → dim → death rattle → flicker — dying, 4s loop
  503.svg                   slow breathe + Zzz floats — asleep, 2s loop
  403.svg                   appears → tries → refused → collapses to nothing — 2.8s loop

lockup/
  template.svg              mark (48×48) + 16px gap + dashed text slot guide
  icon-template.svg         mark + 20×20 icon slot (x=64,y=18) + text slot (x=88)
  blog.svg                  worked example: "blog" sub-brand

index.html                  GH Pages site — palette switcher, states, sub-logo builder
preview.html                local preview grid (same as index.html, for offline use)
states.css                  class-driven Option B stylesheet (.state-loading etc.)
palette.json                named palettes + token map
```

## Brand palette

| Token   | Hex       | Use |
|---------|-----------|-----|
| dark    | `#0a0514` | backgrounds, outlines |
| orange  | `#f07828` | primary accent, CTAs |
| indigo  | `#5901d8` | secondary accent, loading |
| light   | `#eeeef4` | text on dark |
| success | `#2ecc71` | success state |
| error   | `#e74c3c` | error state |

Named palettes: `brand-dark` (default), `brand-light`, `mono-dark`, `mono-light`, `indigo`.

## Animation design principle

Every animation uses **physical metaphor** — the motion IS the meaning, no label needed:
- heartbeat = alive, rotating = working, spring = happy, shake = frustrated
- tilt = confused, dim+rattle = dying, breathe+Zzz = asleep, appear+collapse = refused

All animations loop infinitely so they can be observed continuously.

## Theming via currentColor

All SVGs use `stroke="currentColor"`. Set `color` on the SVG or any parent:

```html
<svg src="base.svg" style="color: #f07828">
```

## Using state SVGs

**Option A — drop-in (self-contained per file):**
```html
<img src="states/loading.svg" width="48" height="48" style="color:#f07828">
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
import { base, stateLoading, http404, palettes } from '@byehsan/logo'
import '@byehsan/logo/css'

// Programmatic lockup generation (v2.4.0+)
import { createTextLockup, createIconLockup } from '@byehsan/logo'

const blogSvg = createTextLockup('blog')           // returns SVG string
const gitSvg  = createIconLockup('git', iconSvg)  // iconSvg = <svg x=64 y=18 w=20 h=20 ...>
```

## Lockup system

```
Mark area:   x=0,  y=0,  w=48, h=56   (mark at y+4, 48×48)
Gap:         16px  (x=48 to x=64)
Text slot:   x=64, baseline y=37, Space Grotesk 600 24px, letter-spacing -0.5
Icon slot:   x=64, y=18, w=20, h=20   (vertically centred in 56px container)
Text+icon:   icon at x=64,y=18; text x=88,y=37
```

Text-only lockup:
```xml
<text x="64" y="37"
      font-family="'Space Grotesk', system-ui, sans-serif"
      font-size="24" font-weight="600" letter-spacing="-0.5"
      fill="currentColor">sub-brand</text>
```

Icon + text lockup (icon slot is 20×20 at x=64,y=18, text starts at x=88):
```xml
<svg x="64" y="18" width="20" height="20" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <!-- icon paths -->
</svg>
<text x="88" y="37" font-family="'Space Grotesk',system-ui,sans-serif"
      font-size="24" font-weight="600" letter-spacing="-0.5"
      fill="currentColor">sub-brand</text>
```

## GH Pages — Sub-logo builder

The interactive builder at https://byehsan.github.io/logo/ lets designers:
- Type a sub-brand name → live preview at 440/220/120/80px
- Choose No icon, one of 8 preset icons (git/globe/home/code/star/mail/rss/docs), or paste custom SVG
- Download the generated SVG (uses `currentColor`, consumer sets `color` on the `<img>`)
- Copy SVG code to clipboard
- Adjust all 4 color tokens (Primary/Accent/Background/Text) individually with color pickers

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

## CI / versioning

- **Every push to main:** SVG validation (xmllint) + GH Pages deploy
- **Tag push (`v*.*.*`):** full release bundle + npm publish

```bash
git tag v2.4.0 && git push origin v2.4.0
```

Release artifacts: zip/tarball with all SVGs, PNGs at 7 sizes, favicon.ico, webmanifest, CJS/ESM/CSS bundles, TypeScript defs, palette.json.

## Adding a new state

1. Copy `states/neutral.svg` as template
2. Write the `@keyframes` with a physical metaphor, set `animation: ... infinite`
3. Add `.state-<name>` rule to `states.css`
4. Add the file to `SVG_FILES` in `scripts/bundle.mjs`
5. Add inline version to `index.html` states grid
6. Document here and bump the version
