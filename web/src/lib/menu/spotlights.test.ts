import { describe, it, expect } from 'vitest'
import { selectSpotlights } from './spotlights'
import type { SanityMenuItem } from '@/types/sanity'

const item = (id: string, signature = false): SanityMenuItem =>
  ({ id, slug: id, name: id, description: null, prices: [], dietary: [], allergens: [], spiceLevel: 0, signature }) as SanityMenuItem

describe('selectSpotlights', () => {
  it('returns empty tiers for no items', () => {
    expect(selectSpotlights([])).toEqual({ fullBleed: null, splits: [], rest: [] })
  })

  it('with no signature items, puts everything in rest in order', () => {
    const items = [item('a'), item('b'), item('c')]
    const out = selectSpotlights(items)
    expect(out.fullBleed).toBeNull()
    expect(out.splits).toEqual([])
    expect(out.rest.map(i => i.id)).toEqual(['a', 'b', 'c'])
  })

  it('promotes the first signature item to full-bleed and the next two to splits', () => {
    const items = [item('a'), item('s1', true), item('b'), item('s2', true), item('s3', true)]
    const out = selectSpotlights(items)
    expect(out.fullBleed?.id).toBe('s1')
    expect(out.splits.map(i => i.id)).toEqual(['s2', 's3'])
    expect(out.rest.map(i => i.id)).toEqual(['a', 'b'])
  })

  it('caps spotlights at three and pushes extra signature items into rest in original order', () => {
    const items = [item('s1', true), item('s2', true), item('s3', true), item('s4', true), item('x')]
    const out = selectSpotlights(items)
    expect(out.fullBleed?.id).toBe('s1')
    expect(out.splits.map(i => i.id)).toEqual(['s2', 's3'])
    expect(out.rest.map(i => i.id)).toEqual(['s4', 'x'])
  })
})
