# CLAUDE.md — byehsan/logo

Brand asset repository for byEhsan. ES pyramid mark with full state animation system, mood
eyes, HTTP error states, lockup templates, favicon set, and CI release pipeline.

**Current version:** v3.1.0
**GH Pages:** https://byehsan.github.io/logo/ (interactive palette switcher)
**npm:** `@byehsan/logo` on GitHub Packages

**Full system context — mark geometry, palette schema, animation conventions, lockup
system, favicon artifacts, CI, and known gotchas — lives in
[`docs/CONTEXT.md`](docs/CONTEXT.md), not here. Read it before making non-trivial changes.**
This file stays a short pointer plus the file tree so it doesn't keep growing every time the
system changes; put new reference material in `docs/`, not here.

## File tree

```
base.svg                    clean pyramid mark, currentColor stroke, no animation
signature.svg                "byEhsan" vector calligraphy — spine + 8 weight overlays + flourish
signature-hand.svg            spine alone, unweighted — rawer/handwritten reading, for teasers etc.
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

docs/
  CONTEXT.md                  full system reference — read this before non-trivial changes

index.html                  GH Pages site — logo tool: palette switcher, all states live,
                             lockup generator, component reference, download panel
404.html                     GH Pages error page (served automatically for unmatched paths)
403.html                     access-restricted system page
500.html                     server-error system page
503.html                     maintenance system page
thank-you.html                form/contact confirmation system page
preview.html                local preview grid (same as index.html, for offline use)
states.css                  class-driven Option B stylesheet (.state-loading etc.)
palette.json                markGeometry + named presets + token map (schema v2)
```

## Adding a new state

See `docs/CONTEXT.md`'s "Adding a new state" section — copy `states/neutral.svg`, write the
`@keyframes py-*`, wire it into `states.css`/`scripts/bundle.mjs`/`index.html`, add test
coverage, then document and bump the version (here, and in `docs/CONTEXT.md`).
