export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free'

export type AllergenId =
  | 'celery' | 'gluten' | 'crustaceans' | 'egg' | 'fish' | 'lupin'
  | 'milk' | 'molluscs' | 'mustard' | 'nuts' | 'peanuts' | 'sesame'
  | 'soya' | 'sulphur-dioxide'

export type PriceContext =
  | 'standard' | 'starter' | 'grill-main' | 'main' | 'side' | 'per-person' | 'for-two'
  | 'bottle' | '125ml' | '175ml' | '250ml' | '500ml' | 'half-pint' | 'pint' | '30ml'

export interface PriceEntry {
  context: PriceContext
  amount: number
}

export interface SanityImage {
  url: string
  alt: string | null
  lqip?: string
  hotspot?: { x: number; y: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

export interface SanityMenuItem {
  id: string
  slug: string
  name: string
  description: string | null
  prices: PriceEntry[]
  priceOnRequest?: boolean
  currency?: string
  dietary: DietaryTag[]
  allergens: AllergenId[]
  spiceLevel: number
  featured?: boolean
  seasonal?: boolean
  soldOut?: boolean
  modifiers?: Array<{ id: string; label: string; priceDelta: number }>
  image?: SanityImage | null
  serves?: number | null
  size?: string | null
  origin?: string | null
}

export interface SanityMenuCategory {
  id: string
  slug: string
  label: string
  parentMenu: string
  description?: string | null
  availability?: string | null
  sortOrder: number
}

export interface SanitySetMenuChoiceItem {
  id: string
  name: string
  description?: string | null
  dietary: DietaryTag[]
  allergens: AllergenId[]
}

export interface SanityCourse {
  courseTitle: string
  instruction?: string | null
  items: SanitySetMenuChoiceItem[]
  fixedItems?: string[]
}

export interface SanitySetMenu {
  id: string
  slug: string
  name: string
  currency?: string
  prices: PriceEntry[]
  available: boolean
  seasonal?: boolean
  soldOut?: boolean
  availability?: string | null
  style?: string | null
  note?: string | null
  preStarter?: string | null
  byob?: boolean
  courses: SanityCourse[]
}

export interface SanityAddress {
  line1: string
  line2?: string | null
  city: string
  postcode: string
  country?: string
  countryCode?: string
}

export interface SanityOpeningPeriod {
  days: string[]
  open: string
  close: string
}

export interface SanitySocialLink {
  platform: string
  handle?: string | null
  url: string
}

export interface SanitySiteSettings {
  name: string
  shortName?: string
  tagline?: string
  cuisine?: string
  description?: string
  awards?: Array<{ title: string; body?: string }>
  heroImages?: SanityImage[]
  phone?: string
  email?: string
  social?: SanitySocialLink[]
  address?: SanityAddress
  neighbourhood?: string | null
  nearbyLandmarks?: string[]
  mapUrl?: string | null
  coordinates?: { lat: number; lng: number } | null
  timezone?: string
  regularHours?: SanityOpeningPeriod[]
  holidayHours?: Array<{ date: string; label: string; open?: string; close?: string; closed?: boolean }>
  closureNotices?: Array<{ from: string; to: string; message: string }>
  hoursNotes?: string[]
  onlineOrderingUrl?: string | null
  bookTableUrl?: string | null
  giftVouchersUrl?: string | null
  allergenNotice?: string | null
  seoTitleTemplate?: string
  seoDefaultDescription?: string
  seoKeywords?: string[]
  seoOgImage?: { url: string; alt?: string } | null
}
