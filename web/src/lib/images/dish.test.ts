import { describe, it, expect } from 'vitest'
import { resolveSpotlightImage } from './dish'
import { SPOTLIGHT_FALLBACK_IMAGES } from './fallbacks'
import type { SanityMenuItem } from '@/types/sanity'

const dish = (over: Partial<SanityMenuItem>): SanityMenuItem =>
  ({ id: 'x', slug: 'x', name: 'Dish', description: null, prices: [], dietary: [], allergens: [], spiceLevel: 0, ...over }) as SanityMenuItem

describe('resolveSpotlightImage', () => {
  it('uses the dish image when present', () => {
    const out = resolveSpotlightImage(dish({ image: { url: 'https://cdn/d.jpg', alt: 'Plated dish' } }))
    expect(out).toEqual({ url: 'https://cdn/d.jpg', alt: 'Plated dish' })
  })

  it('falls back to the dish name as alt when the Sanity image has no alt', () => {
    const out = resolveSpotlightImage(dish({ name: 'Lamb Rogan', image: { url: 'https://cdn/d.jpg', alt: null } }))
    expect(out).toEqual({ url: 'https://cdn/d.jpg', alt: 'Lamb Rogan' })
  })

  it('returns a stock fallback when the dish has no image', () => {
    const out = resolveSpotlightImage(dish({ id: 'butter-chicken', image: null }))
    expect(SPOTLIGHT_FALLBACK_IMAGES.map(i => i.url)).toContain(out.url)
  })

  it('is deterministic — the same id always maps to the same fallback', () => {
    const a = resolveSpotlightImage(dish({ id: 'same-id', image: null }))
    const b = resolveSpotlightImage(dish({ id: 'same-id', image: null }))
    expect(a.url).toBe(b.url)
  })
})
