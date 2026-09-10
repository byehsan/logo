// Extracts each edge's path `d` attribute (and its base.svg stroke-width / stroke-dasharray)
// out of the mark's raw SVG markup, keyed by markGeometry's ids. Used to build the
// single-tone pyramid glyph that createTextLockup/createIconLockup embed (see lockup.mjs).
export function extractMarkPaths(baseSvgString, markGeometry) {
  return markGeometry.map(g => {
    const tagMatch = baseSvgString.match(new RegExp(`<path id="${g.id}"[^>]*>`))
    const tag = tagMatch ? tagMatch[0] : ''
    const d = tag.match(/\sd="([^"]+)"/)
    const strokeWidth = tag.match(/\sstroke-width="([^"]+)"/)
    const dasharray = tag.match(/\sstroke-dasharray="([^"]+)"/)
    return {
      d: d ? d[1] : '',
      strokeWidth: strokeWidth ? strokeWidth[1] : '2.6',
      dasharray: dasharray ? dasharray[1] : null,
    }
  })
}

// Extracts the crown circle's radius out of base.svg (id="crown"), so lockups built from
// the real mark geometry also carry the crown/apex-dot concept instead of a bare outline.
export function extractCrownRadius(baseSvgString) {
  const m = baseSvgString.match(/<circle id="crown"[^>]*\sr="([\d.]+)"/)
  return m ? parseFloat(m[1]) : null
}
