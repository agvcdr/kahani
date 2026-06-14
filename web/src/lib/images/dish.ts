import type { SanityMenuItem } from '@/types/sanity'
import { SPOTLIGHT_FALLBACK_IMAGES } from './fallbacks'

export interface ResolvedImage {
  url: string
  alt: string
}

/** Stable, non-negative hash of a string (for deterministic fallback picking). */
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Resolve a menu spotlight image: the dish's own Sanity image when present,
 * otherwise a deterministic stock fallback keyed off the dish id (so a given
 * dish always shows the same placeholder).
 */
export function resolveSpotlightImage(item: SanityMenuItem): ResolvedImage {
  if (item.image?.url) {
    return { url: item.image.url, alt: item.image.alt ?? item.name }
  }
  const images = SPOTLIGHT_FALLBACK_IMAGES
  if (!images.length) return { url: '', alt: item.name }
  const pick = images[hash(item.id) % images.length]
  return { url: pick.url, alt: pick.alt }
}
