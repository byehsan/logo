# CLAUDE.md — byehsan/logo

Brand asset repository for byEhsan. All logo SVGs, animated state variants, and the portrait illustration live here. The CI pipeline bundles everything into versioned releases.

## Asset map

```
plain.svg                   base mark — triangle + triskelion, no color
colored.svg                 orange→indigo gradient fill
gradient.svg                gradient + CSS rotation animation
animated.svg                continuously rotating triskelion
load.svg                    spinning petals (indigo) — use on loading states
success.svg                 petals fade in sequentially (green) — use on success
fail.svg                    petals shake (red #e74c3c) — use on errors / 404
warn.svg                    petals pulse stroke-width (orange) — use on warnings

portrait.svg                tattoo-flash face illustration, brand palette
portrait-states/load.svg    portrait + spinning badge (indigo)
portrait-states/success.svg portrait + fade-in badge (green)
portrait-states/fail.svg    portrait + shaking badge (red) — 404 page
portrait-states/warn.svg    portrait + pulsing badge (orange) — 500 page
```

## Brand palette

| Token   | Hex       | Use |
|---------|-----------|-----|
| dark    | `#0a0514` | backgrounds, outlines |
| orange  | `#f07828` | primary accent, CTAs |
| indigo  | `#5901d8` | secondary accent, loading |
| light   | `#eeeef4` | text on dark, cap brim |
| success | `#2ecc71` | success states |
| error   | `#e74c3c` | error / fail states |
| skin    | `#c8956a` | portrait skin tone |

## Versioning & CI

- Every push to `main` runs SVG validation (xmllint)
- Push a semver tag (`git tag v1.2.0 && git push --tags`) to trigger a full release build
- Release artifacts: zip + tarball containing all SVGs, PNGs at 6 sizes, JS/ESM/CSS bundle, palette.json

## Building locally

```bash
npm install        # no deps, just sets up package.json
npm run build      # outputs to dist/
npm run validate   # xmllint all SVGs
```

## Error / special page usage

| Page | Asset |
|------|-------|
| 404  | `portrait-states/fail.svg` |
| 500  | `portrait-states/warn.svg` |
| Loading / splash | `portrait-states/load.svg` or `load.svg` |
| Success (form, portal) | `portrait-states/success.svg` or `success.svg` |
| Kernel boot splash | `splash/logo_kernel_cm3588+.bmp` |

## Adding a new state

1. Add a new SVG under `portrait-states/` or root
2. Add the entry to `scripts/bundle.mjs` SVG_FILES array
3. Document it in this file and the asset map above
4. Bump the version and push a tag
