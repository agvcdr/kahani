import type { SanitySiteSettings, SanityMenuItem } from '@/types/sanity'
import { HERO_FALLBACK_IMAGES } from './fallbacks'

export interface HeroImage {
  url: string
  alt: string
}

/**
 * Resolve the homepage hero images, preferring curated Sanity `heroImages`,
 * then featured-dish images, then a stock fallback. Always returns at least one.
 */
export function resolveHeroImages(
  settings: SanitySiteSettings | null,
  featured: SanityMenuItem[] | undefined,
): HeroImage[] {
  const fromSettings = (settings?.heroImages ?? [])
    .filter(img => Boolean(img?.url))
    .map(img => ({ url: img.url, alt: img.alt ?? settings?.name ?? 'Kahani' }))
  if (fromSettings.length) return fromSettings

  const fromFeatured = (featured ?? [])
    .filter(item => Boolean(item.image?.url))
    .map(item => ({ url: item.image!.url, alt: item.image!.alt ?? item.name }))
  if (fromFeatured.length) return fromFeatured

  return HERO_FALLBACK_IMAGES
}
