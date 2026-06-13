import type { SanityMenuItem } from '@/types/sanity'

export interface Spotlights {
  /** First signature item — rendered as the full-bleed macro hero. */
  fullBleed: SanityMenuItem | null
  /** Up to two further signature items — rendered as editorial splits. */
  splits: SanityMenuItem[]
  /** Everything else, in original order, for the quiet list. */
  rest: SanityMenuItem[]
}

/**
 * Split a category's items into the three menu tiers. Selection is driven only
 * by the `signature` flag; order follows the items' incoming sort order. At
 * most three dishes are promoted (1 full-bleed + 2 splits); any further
 * signature items fall back into the quiet list. Degrades to a pure quiet list
 * when nothing is flagged.
 */
export function selectSpotlights(items: SanityMenuItem[]): Spotlights {
  const chosen = new Set<SanityMenuItem>()
  const signatures = items.filter(i => i.signature)
  const promoted = signatures.slice(0, 3)
  promoted.forEach(i => chosen.add(i))

  const fullBleed = promoted[0] ?? null
  const splits = promoted.slice(1)
  const rest = items.filter(i => !chosen.has(i))

  return { fullBleed, splits, rest }
}
