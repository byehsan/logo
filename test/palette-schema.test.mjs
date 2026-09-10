import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const palette = JSON.parse(readFileSync(join(ROOT, 'palette.json'), 'utf8'))

const HEX_RE = /^#[0-9a-f]{6}$/i
const UI_TOKEN_KEYS = ['background', 'surface', 'primary', 'text', 'textMuted', 'border', 'accent', 'success', 'warning', 'error']

describe('palette.json schema', () => {
  it('has version 2 and a default preset id that resolves', () => {
    expect(palette.version).toBe(2)
    expect(palette.presets[palette.default]).toBeTruthy()
  })

  it('markGeometry has exactly 4 unique p0-p3 entries with a string label', () => {
    expect(palette.markGeometry).toHaveLength(4)
    const ids = palette.markGeometry.map(g => g.id)
    expect(new Set(ids)).toEqual(new Set(['p0', 'p1', 'p2', 'p3']))
    for (const g of palette.markGeometry) {
      expect(typeof g.label).toBe('string')
      expect(g.label.length).toBeGreaterThan(0)
    }
  })

  it.each(Object.entries(palette.presets))('preset "%s" has name/solid + full ui.dark/ui.light token sets', (id, preset) => {
    expect(typeof preset.name).toBe('string')
    expect(preset.solid).toMatch(HEX_RE)

    for (const mode of ['dark', 'light']) {
      expect(Object.keys(preset.ui[mode]).sort()).toEqual([...UI_TOKEN_KEYS].sort())
      for (const key of UI_TOKEN_KEYS) {
        expect(preset.ui[mode][key]).toMatch(HEX_RE)
      }
    }
  })

  // The ES doc's accent-swatch picker only changes primary/accent — every preset shares the
  // same flat neutral background/surface/text/textMuted/border scale per mode (unlike a
  // per-hue-tinted design), except the legacy-brand preset which intentionally preserves the
  // old triskelion identity's own dark/light backgrounds verbatim.
  it('graphite/forest/rust/slate-indigo/steel share identical neutral ui tokens per mode', () => {
    const sharedIds = ['graphite', 'forest', 'rust', 'slate-indigo', 'steel']
    const NEUTRAL_KEYS = ['background', 'surface', 'text', 'textMuted', 'border']
    const reference = palette.presets.graphite
    for (const id of sharedIds) {
      const preset = palette.presets[id]
      for (const mode of ['dark', 'light']) {
        for (const key of NEUTRAL_KEYS) {
          expect(preset.ui[mode][key]).toBe(reference.ui[mode][key])
        }
        // primary/accent both equal the preset's own solid color
        expect(preset.ui[mode].primary).toBe(preset.solid)
        expect(preset.ui[mode].accent).toBe(preset.solid)
      }
    }
  })

  it('preserves the legacy triskelion identity verbatim in the legacy-brand preset', () => {
    const legacy = palette.presets['legacy-brand']
    expect(legacy.solid).toBe('#f07828')
    expect(legacy.ui.dark.background).toBe('#0a0514')
    expect(legacy.ui.dark.primary).toBe('#f07828')
    expect(legacy.ui.dark.accent).toBe('#5901d8')
    expect(legacy.ui.light.background).toBe('#eeeef4')
  })

  it('success/warning/error tokens are identical literals across every preset (documented invariant)', () => {
    const expected = { success: '#2ecc71', warning: '#f5a623', error: '#e74c3c' }
    for (const preset of Object.values(palette.presets)) {
      for (const mode of ['dark', 'light']) {
        expect(preset.ui[mode].success).toBe(expected.success)
        expect(preset.ui[mode].warning).toBe(expected.warning)
        expect(preset.ui[mode].error).toBe(expected.error)
      }
    }
  })

  it('does not use "indigo" as a preset id (collides with the legacy flat token name)', () => {
    expect(palette.presets.indigo).toBeUndefined()
    expect(palette.presets['slate-indigo']).toBeTruthy()
  })
})
