# byEhsan logo system

Triskelion mark with full state + lockup system. All assets theme via CSS `currentColor`.

## File tree

```
base.svg                   clean mark, currentColor stroke, no animation
states/
  neutral.svg              calm blink every 6s
  loading.svg              3-step discrete rotation, 1.2s cycle
  success.svg              spring bloom with overshoot, one-shot
  warning.svg              one petal pulses asymmetrically, 800ms loop
  error.svg                horizontal shake 300ms, then still
http/
  404.svg                  tilt oscillation ±6°, drifting petals
  500.svg                  glitch twitch → flatlines at 30% opacity
  503.svg                  slow breathe + Zzz floats up-right, 2s loop
  403.svg                  bar wipes across once, curt no bounce
lockup/
  template.svg             mark + gap + dashed slot guide
  blog.svg                 worked example: "blog" sub-brand
preview.html               live grid of all marks + states animating
states.css                 all @keyframes as class-driven selectors (Option B)
```

## Theming via currentColor

Set `color` on the SVG element (or any parent) to change the mark color:

```html
<!-- orange on dark bg -->
<img src="base.svg" style="color: #f07828">

<!-- or inline -->
<svg ... style="color: #f07828"> ... </svg>
```

For React/Vue components, pass a `color` prop and bind it to the SVG's `style.color`.

## Using state SVGs

Drop-in (Option A — self-contained, each file has its own `<style>`):

```html
<img src="states/loading.svg" width="48" height="48">
```

Class-driven (Option B — one base SVG + `states.css`):

```html
<link rel="stylesheet" href="states.css">
<svg class="state-loading" ...> <!-- base mark paths --> </svg>
```

Available classes: `state-neutral` `state-loading` `state-success` `state-warning`
`state-error` `state-404` `state-500` `state-503` `state-403`

## Adding a sub-brand lockup

1. Open `lockup/template.svg`
2. Replace the dashed slot guide with a `<text>` element at `x="64" y="37"`
3. Font: Space Grotesk 600, font-size 24, letter-spacing -0.5
4. The mark never moves — only the text slot changes

```xml
<text x="64" y="37"
      font-family="'Space Grotesk', system-ui, sans-serif"
      font-size="24" font-weight="600" letter-spacing="-0.5"
      fill="currentColor">your-sub-brand</text>
```

## Adding a new state

1. Copy `states/neutral.svg` as a starting point
2. Add/replace the `<style>` block with your `@keyframes` and selectors
3. Add the corresponding `@keyframes be-*` and `.state-*` rules to `states.css`
4. Add the state to `preview.html`
5. Add the new file to `scripts/bundle.mjs` SVG_FILES array
6. Bump version and push a tag

## Versioning

```bash
git tag v2.0.0
git push origin v2.0.0
```

CI builds and publishes a release with PNG exports (16–512px), JS/ESM/CSS bundles, and `palette.json`.

## Palette

| Token   | Hex       |
|---------|-----------|
| dark    | `#0a0514` |
| orange  | `#f07828` |
| indigo  | `#5901d8` |
| light   | `#eeeef4` |
| success | `#2ecc71` |
| error   | `#e74c3c` |
