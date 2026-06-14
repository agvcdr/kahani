import type { HeroImage } from './hero'
import type { SanityGalleryImage } from '@/types/sanity'

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
  { url: UNSPLASH('photo-1574653853027-5382a3d23a15'), alt: 'A signature Indian dish, freshly plated' },
  { url: UNSPLASH('photo-1565557623262-b51c2513a641'), alt: 'A rich, aromatic curry close-up' },
  { url: UNSPLASH('photo-1606491956689-2ea866880c84'), alt: 'A spiced Indian dish garnished with fresh herbs' },
  { url: UNSPLASH('photo-1599487488170-d11ec9c172f0'), alt: 'A vibrant plate of Indian food' },
]

/** Stock thumbnails for the menu index section rows.
 *  Temporary — owner can override by adding images to each Sanity menu category. */
export const MENU_SECTION_THUMBNAILS: Record<string, { url: string; alt: string }> = {
  starters:    { url: UNSPLASH('photo-1601050690597-df0568f70950'), alt: 'A colourful spread of Indian starters and small plates' },
  mains:       { url: UNSPLASH('photo-1565557623262-b51c2513a641'), alt: 'A rich aromatic curry served in a copper bowl' },
  sides:       { url: UNSPLASH('photo-1596797038530-2c107229654b'), alt: 'Freshly baked naan breads and rice accompaniments' },
  desserts:    { url: UNSPLASH('photo-1758910536889-43ce7b3199fd'), alt: 'A colourful display of Indian sweets — gulab jamun, barfi, laddu and rasgulla' },
  wine:        { url: UNSPLASH('photo-1510812431401-41d2bd2722f3'), alt: 'A selection of wines — champagne, white, rosé and red' },
  'beer-cider':{ url: UNSPLASH('photo-1608270586620-248524c67de9'), alt: 'Ice-cold craft beer and cider on a bar counter' },
  cocktails:   { url: UNSPLASH('photo-1551024709-8f23befc6f87'), alt: 'Vibrant handcrafted cocktails and mocktails' },
  spirits:     { url: UNSPLASH('photo-1569529465841-dfecdab7503b'), alt: 'A curated spirits collection — gin, whisky and rum' },
  'soft-drinks':{ url: UNSPLASH('photo-1563227812-0ea4c22e6cc8'), alt: 'Lassi, Indian teas and refreshing soft drinks' },
}

/** Gallery stock fallbacks — 12 images across food/interior/events categories.
 *  Temporary; overridden by owner's Sanity photos with no code change. */
export const GALLERY_FALLBACK_IMAGES: SanityGalleryImage[] = [
  { id: 'fallback-food-1', category: 'food', caption: 'Butter Chicken', featured: true, image: { url: UNSPLASH('photo-1631452180519-c014fe946bc7'), alt: 'Rich butter chicken in a copper serving dish' } },
  { id: 'fallback-food-2', category: 'food', caption: 'Spiced Lamb', featured: false, image: { url: UNSPLASH('photo-1565557623262-b51c2513a641'), alt: 'Slow-cooked spiced lamb with fragrant rice' } },
  { id: 'fallback-food-3', category: 'food', caption: 'Dal Makhani', featured: false, image: { url: UNSPLASH('photo-1606491956689-2ea866880c84'), alt: 'Creamy dal makhani in a terracotta bowl' } },
  { id: 'fallback-food-4', category: 'food', caption: 'Chaat', featured: false, image: { url: UNSPLASH('photo-1599487488170-d11ec9c172f0'), alt: 'Colourful Indian street-food chaat' } },
  { id: 'fallback-food-5', category: 'food', caption: 'Samosas', featured: false, image: { url: UNSPLASH('photo-1596797038530-2c107229654b'), alt: 'Golden samosas with green chutney' } },
  { id: 'fallback-food-6', category: 'food', caption: 'Thali', featured: false, image: { url: UNSPLASH('photo-1585937421612-70a008356fbe'), alt: 'A full Indian thali spread' } },
  { id: 'fallback-interior-1', category: 'interior', caption: 'The Room', featured: true, image: { url: UNSPLASH('photo-1517248135467-4c7edcad34c4'), alt: 'Warmly lit restaurant interior with copper accents' } },
  { id: 'fallback-interior-2', category: 'interior', caption: 'Table Setting', featured: false, image: { url: UNSPLASH('photo-1414235077428-338989a2e8c0'), alt: 'Elegantly set dinner table in the restaurant' } },
  { id: 'fallback-interior-3', category: 'interior', caption: 'Bar Area', featured: false, image: { url: UNSPLASH('photo-1466978913421-dad2ebd01d17'), alt: 'The restaurant bar with mood lighting' } },
  { id: 'fallback-events-1', category: 'events', caption: 'Private Dining', featured: true, image: { url: UNSPLASH('photo-1530062845289-9109b2c9c868'), alt: 'Private dining setup for a special occasion' } },
  { id: 'fallback-events-2', category: 'events', caption: 'Celebration', featured: false, image: { url: UNSPLASH('photo-1519671482749-fd09be7ccebf'), alt: 'A celebratory dinner party in the restaurant' } },
  { id: 'fallback-events-3', category: 'events', caption: 'Catering', featured: false, image: { url: UNSPLASH('photo-1464366400600-7168b8af9bc3'), alt: 'Kahani catering spread at an event' } },
]
