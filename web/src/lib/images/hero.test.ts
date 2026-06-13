import { describe, it, expect } from 'vitest'
import { resolveHeroImages } from './hero'
import { HERO_FALLBACK_IMAGES } from './fallbacks'

const featured = [
  { id: 'a', name: 'Butter Chicken', image: { url: 'https://cdn/a.jpg', alt: 'BC' } },
  { id: 'b', name: 'Lamb Rogan', image: null },
] as any

describe('resolveHeroImages', () => {
  it('prefers curated Sanity heroImages when present', () => {
    const out = resolveHeroImages(
      { name: 'Kahani', heroImages: [{ url: 'https://cdn/h1.jpg', alt: 'Hero one' }] } as any,
      featured,
    )
    expect(out).toEqual([{ url: 'https://cdn/h1.jpg', alt: 'Hero one' }])
  })

  it('falls back to featured-dish images (skipping ones without a url) when heroImages is empty', () => {
    const out = resolveHeroImages({ name: 'Kahani', heroImages: [] } as any, featured)
    expect(out).toEqual([{ url: 'https://cdn/a.jpg', alt: 'BC' }])
  })

  it('uses the dish name as alt when a featured image has none', () => {
    const out = resolveHeroImages({ name: 'Kahani' } as any, [
      { id: 'a', name: 'Butter Chicken', image: { url: 'https://cdn/a.jpg', alt: null } },
    ] as any)
    expect(out[0].alt).toBe('Butter Chicken')
  })

  it('falls back to stock when there are no Sanity or featured images', () => {
    expect(resolveHeroImages(null, [])).toEqual(HERO_FALLBACK_IMAGES)
    expect(resolveHeroImages({ name: 'Kahani' } as any, undefined as any)).toEqual(HERO_FALLBACK_IMAGES)
  })

  it('never returns an empty array', () => {
    expect(resolveHeroImages(null, []).length).toBeGreaterThan(0)
  })
})
