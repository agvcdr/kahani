export interface MenuSection {
  slug: string
  label: string
  description?: string
  /** Sanity category `id` values that belong to this section */
  categoryIds: string[]
  /** Show per-category sub-headings within the combined page */
  showSubHeadings: boolean
}

export const FOOD_SECTIONS: MenuSection[] = [
  {
    slug: 'starters',
    label: 'Starters',
    description: 'Traditional & signature starters',
    categoryIds: ['starters-traditional', 'starters-signature'],
    showSubHeadings: true,
  },
  {
    slug: 'mains',
    label: 'Mains',
    description: 'Curries, grills & vegetarian dishes',
    categoryIds: [
      'tandoori-grill',
      'seafood-curries',
      'chicken-curries',
      'lamb-curries',
      'vegetable-dishes',
      'biryani',
    ],
    showSubHeadings: true,
  },
  {
    slug: 'sides',
    label: 'Sides',
    description: 'Breads, rice & accompaniments',
    categoryIds: ['breads', 'rice', 'accompaniments'],
    showSubHeadings: true,
  },
  {
    slug: 'desserts',
    label: 'Desserts',
    description: 'Cardamom, saffron & sweet endings',
    categoryIds: ['desserts'],
    showSubHeadings: false,
  },
]

export const DRINK_SECTIONS: MenuSection[] = [
  {
    slug: 'wine',
    label: 'Wine',
    description: 'Champagne, sparkling, white, rosé & red',
    categoryIds: ['champagne-sparkling', 'white-wine', 'rose-wine', 'red-wine'],
    showSubHeadings: true,
  },
  {
    slug: 'beer-cider',
    label: 'Beer & Cider',
    categoryIds: ['beer-cider'],
    showSubHeadings: false,
  },
  {
    slug: 'cocktails',
    label: 'Cocktails & Mocktails',
    categoryIds: ['cocktails', 'mocktails-shakes'],
    showSubHeadings: true,
  },
  {
    slug: 'spirits',
    label: 'Spirits & Liqueurs',
    description: 'Gin, vodka, rum, malts, whisky & liqueurs',
    categoryIds: ['gin-vodka', 'rum', 'malts-cognac', 'blended-whiskey', 'liqueurs'],
    showSubHeadings: true,
  },
  {
    slug: 'soft-drinks',
    label: 'Soft & Hot Drinks',
    categoryIds: ['hot-drinks', 'soft-drinks', 'lassi-indian'],
    showSubHeadings: true,
  },
]

export const KIDS_SECTION: MenuSection = {
  slug: 'kids',
  label: 'Kids Menu',
  categoryIds: ['kids-mains', 'kids-desserts', 'kids-drinks'],
  showSubHeadings: true,
}

export const ALL_SECTIONS: MenuSection[] = [...FOOD_SECTIONS, ...DRINK_SECTIONS, KIDS_SECTION]
export const SECTION_BY_SLUG: Record<string, MenuSection> = Object.fromEntries(
  ALL_SECTIONS.map(s => [s.slug, s])
)
