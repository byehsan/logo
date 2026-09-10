// Lockup generation — the real, testable source for createTextLockup/createIconLockup.
// scripts/bundle.mjs reads this file's text verbatim and string-injects it into the built
// CJS/ESM bundles (stripping the `export` keyword and instantiating with the real mark path
// data), so this file must stay self-contained: no imports, and createLockupApi must be the
// only top-level declaration.
//
// The pyramid mark is single-tone (four edges at fixed stroke-width/dasharray, plus the
// filled crown dot, matching base.svg) since a lockup needs one flat color — themed via
// currentColor, same contract as createTextLockup/createIconLockup always had.
//
// createTextLockup: mark at x=0,y=4 (48×48), text starts at x=64 — byehsan's 16px
// mark→content gap (CLAUDE.md's "Lockup system").
//
// createIconLockup: a separate, larger canvas is needed so icons can sit outside the mark
// on any of 8 sides without clipping. Deriving the margin the same way ortiq did (margin =
// gap + icon size) but with byehsan's own 16px gap instead of ortiq's implicit 4px gives
// margin = 16 + 20 = 36px on every side, so the mark sits at (36,36) in a 120×120+ canvas
// (36 top/bottom margin exactly fits an inline icon + gap with nothing left over).
// placement chooses where the icon sits: 'e'|'n'|'s'|'w' render inline just outside that
// edge of the mark with a small gap; 'ne'|'se'|'sw'|'nw' render the icon alone, overlapping
// that corner of the mark (no ring/backdrop). The mark itself never moves — only the icon
// moves around it.
export function createLockupApi(markPaths, crownR) {
  const markInner = markPaths.map(p => {
    const da = p.dasharray ? ` stroke-dasharray="${p.dasharray}"` : ''
    return `<path d="${p.d}" stroke-width="${p.strokeWidth}"${da}/>`
  }).join('') + (crownR ? `<circle cx="100" cy="58" r="${crownR}" fill="currentColor" stroke="none"/>` : '')

  function mark(x, y) {
    return `<svg x="${x}" y="${y}" width="48" height="48" viewBox="0 0 200 220" fill="none" stroke="currentColor" stroke-linejoin="miter" stroke-miterlimit="10">${markInner}</svg>`
  }

  const fonts = {
    'space-grotesk': "'Space Grotesk',system-ui,sans-serif",
    'inter': "'Inter',system-ui,sans-serif",
    'system': 'system-ui,sans-serif',
    'serif': "Georgia,'Times New Roman',serif",
    'mono': "'Fira Code','SF Mono',monospace",
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  // With no sub-brand text there's nothing to reserve the 220px floor / text gap for — fit
  // tightly to whatever the mark/icon actually occupies instead (see createTextLockup's and
  // createIconLockup's own no-text branches for the mark-only case this enables).
  function calcW(textX, text, fontSize) {
    if (!text) return Math.ceil(textX)
    return Math.ceil(Math.max(220, textX + Math.max(60, String(text).length * fontSize * 0.60 + 8) + 12))
  }

  function extractIcon(iconSvg) {
    const s = String(iconSvg).trim()
    if (s.slice(0, 4) !== '<svg') return { inner: s, vb: '0 0 24 24' }
    const gt = s.indexOf('>')
    const openTag = s.slice(0, gt + 1)
    const closeIdx = s.lastIndexOf('</svg>')
    const inner = closeIdx > -1 ? s.slice(gt + 1, closeIdx) : s.slice(gt + 1)
    let vb = '0 0 24 24'
    const vbIdx = openTag.indexOf('viewBox="')
    if (vbIdx > -1) {
      const start = vbIdx + 9
      const end = openTag.indexOf('"', start)
      vb = openTag.slice(start, end)
    }
    return { inner, vb }
  }

  function createTextLockup(subBrand, options) {
    options = options || {}
    const fontSize = options.fontSize || 24
    const ff = fonts[options.fontFamily] || fonts['space-grotesk']
    const textX = 64, naturalH = 56

    if (!subBrand) {
      // No sub-brand name: nothing to lay out beside the mark, so it fills a square canvas
      // edge to edge instead of sitting at its fixed (0,4) 48x48 offset in a 220px+-wide,
      // mostly-empty canvas sized for text that isn't there.
      const size = options.width || options.height || naturalH
      const W = options.width || size, H = options.height || size
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-linejoin="miter" stroke-miterlimit="10">${markInner}</svg>`
    }

    const naturalW = calcW(textX, subBrand, fontSize)
    const W = options.width || naturalW, H = options.height || naturalH
    const bl = (28 + fontSize * 0.35).toFixed(1)
    const text = `<text x="${textX}" y="${bl}" font-family="${ff}" font-size="${fontSize}" font-weight="600" letter-spacing="-0.5" fill="currentColor">${esc(subBrand)}</text>`
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${naturalW} ${naturalH}" width="${W}" height="${H}">${mark(0, 4)}${text}</svg>`
  }

  // margin = GAP (16, byehsan's brand mark→content gap) + ICON (20) so an inline icon
  // (n/s) plus its gap exactly fits the margin with nothing left over — same derivation
  // ortiq used for its own (unrelated) margin value, just with byehsan's gap swapped in.
  const GAP = 16, ICON = 20, R = 12, BICON = 16
  const ilMargin = GAP + ICON
  const ilMarkX = ilMargin, ilMarkY = ilMargin
  const ilMarkRight = ilMarkX + 48, ilMarkBottom = ilMarkY + 48
  const ilMarkCx = ilMarkX + 24, ilMarkCy = ilMarkY + 24
  const ilCanvasH = ilMarkBottom + ilMargin

  function ilLayout(placement) {
    const corners = {
      ne: { cx: ilMarkRight - 4, cy: ilMarkY + 4 },
      se: { cx: ilMarkRight - 4, cy: ilMarkBottom - 4 },
      sw: { cx: ilMarkX + 4, cy: ilMarkBottom - 4 },
      nw: { cx: ilMarkX + 4, cy: ilMarkY + 4 },
    }
    if (corners[placement]) {
      const c = corners[placement]
      const east = placement === 'ne' || placement === 'se'
      return { kind: 'badge', cx: c.cx, cy: c.cy, r: R, iconX: c.cx - BICON / 2, iconY: c.cy - BICON / 2, iconSize: BICON, textX: east ? c.cx + R + 8 : ilMarkRight + 8 }
    }
    const inline = {
      n: { x: ilMarkCx - ICON / 2, y: ilMarkY - GAP - ICON },
      s: { x: ilMarkCx - ICON / 2, y: ilMarkBottom + GAP },
      e: { x: ilMarkRight + GAP, y: ilMarkCy - ICON / 2 },
      w: { x: ilMarkX - GAP - ICON, y: ilMarkCy - ICON / 2 },
    }
    const pos = inline[placement] || inline.e
    return { kind: 'inline', x: pos.x, y: pos.y, size: ICON, textX: placement === 'e' ? pos.x + ICON + GAP : ilMarkRight + 8 }
  }

  function createIconLockup(subBrand, iconSvg, options) {
    options = options || {}
    const placement = options.placement || 'e'
    const fontSize = options.fontSize || 24
    const ff = fonts[options.fontFamily] || fonts['space-grotesk']
    const icon = extractIcon(iconSvg)
    const layout = ilLayout(placement)
    const naturalW = calcW(layout.textX, subBrand, fontSize), naturalH = ilCanvasH
    const W = options.width || naturalW, H = options.height || naturalH
    const bl = (ilMarkCy + fontSize * 0.35).toFixed(1)
    let iconEl
    if (layout.kind === 'badge') {
      iconEl = `<svg x="${layout.iconX}" y="${layout.iconY}" width="${layout.iconSize}" height="${layout.iconSize}" viewBox="${icon.vb}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" overflow="visible">${icon.inner}</svg>`
    } else {
      iconEl = `<svg x="${layout.x}" y="${layout.y}" width="${layout.size}" height="${layout.size}" viewBox="${icon.vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" overflow="visible">${icon.inner}</svg>`
    }
    const text = subBrand
      ? `<text x="${layout.textX}" y="${bl}" font-family="${ff}" font-size="${fontSize}" font-weight="600" letter-spacing="-0.5" fill="currentColor">${esc(subBrand)}</text>`
      : ''
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${naturalW} ${naturalH}" width="${W}" height="${H}">${mark(ilMarkX, ilMarkY)}${iconEl}${text}</svg>`
  }

  return { createTextLockup, createIconLockup }
}
