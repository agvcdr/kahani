import type { HeroImage } from './hero'

/**
 * ALL stock fallback image URLs live in this module (never scattered through
 * components). Temporary — overridden by the owner's Sanity photos with no code
 * change. See [[todo-food-photography]].
 */
const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=70`

export const HERO_FALLBACK_IMAGES: HeroImage[] = [
  { url: UNSPLASH('photo-1585937421612-70a008356fbe'), alt: 'A vibrant Indian thali of curries, rice and breads' },
  { url: UNSPLASH('photo-1631452180519-c014fe946bc7'), alt: 'Rich, creamy butter chicken garnished with coriander' },
  { url: UNSPLASH('photo-1567188040759-fb8a883dc6d8'), alt: 'Spiced Indian street-food snacks on a dark table' },
  { url: UNSPLASH('photo-1596797038530-2c107229654b'), alt: 'Golden samosas with fresh chutney' },
  { url: UNSPLASH('photo-1601050690597-df0568f70950'), alt: 'A spread of aromatic Indian spices' },
]

/** Macro dish fallbacks for menu spotlights. Temporary — overridden by the
 *  owner's Sanity photos with no code change. See [[todo-food-photography]]. */
export const SPOTLIGHT_FALLBACK_IMAGES: { url: string; alt: string }[] = [
  { url: UNSPLASH('photo-1631452180519-c014fe946bc7'), alt: 'A signature Indian dish, freshly plated' },
  { url: UNSPLASH('photo-1565557623262-b51c2513a641'), alt: 'A rich, aromatic curry close-up' },
  { url: UNSPLASH('photo-1606491956689-2ea866880c84'), alt: 'A spiced Indian dish garnished with fresh herbs' },
  { url: UNSPLASH('photo-1599487488170-d11ec9c172f0'), alt: 'A vibrant plate of Indian food' },
]
