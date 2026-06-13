export const ALL_MENU_CATEGORIES = `
  *[_type == "menuCategory"] | order(sortOrder asc) {
    id, "slug": slug.current, label, parentMenu, description, availability, sortOrder
  }
`

export const MENU_ITEMS_BY_CATEGORY = `
  *[_type == "menuItem" && $categoryId in categories[]._ref && available == true]
  | order(sortOrder asc) {
    id, "slug": slug.current, name, description,
    prices, priceOnRequest, currency,
    dietary, allergens, spiceLevel,
    featured, signature, origin, seasonal, soldOut,
    "modifiers": modifiers[]->{id, label, priceDelta},
    "image": image{ alt, "url": asset->url, "lqip": asset->metadata.lqip, hotspot, crop },
    serves, size
  }
`

export const MENU_ITEMS_BY_CATEGORY_IDS = `
  *[_type == "menuItem" && available == true && count(categories[@._ref in $categoryRefs]) > 0]
  | order(sortOrder asc) {
    id, "slug": slug.current, name, description,
    prices, priceOnRequest, currency,
    dietary, allergens, spiceLevel,
    featured, signature, origin, seasonal, soldOut,
    "modifiers": modifiers[]->{id, label, priceDelta},
    "image": image{ alt, "url": asset->url, "lqip": asset->metadata.lqip, hotspot, crop },
    serves, size,
    "categoryIds": categories[]->id
  }
`

export const ALL_SET_MENUS = `
  *[_type == "setMenu" && available == true] | order(name asc) {
    id, "slug": slug.current, name, prices, availability, byob
  }
`

export const SET_MENU_BY_SLUG = `
  *[_type == "setMenu" && slug.current == $slug][0] {
    id, "slug": slug.current, name, currency,
    prices, available, seasonal, soldOut,
    availability, style, note, preStarter, byob,
    courses[] {
      courseTitle, instruction,
      items[] { "id": id.current, name, description, dietary, allergens },
      fixedItems
    }
  }
`

export const SITE_SETTINGS = `
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    name, shortName, tagline, cuisine, description, awards,
    "heroImages": heroImages[]{ alt, "url": asset->url, "lqip": asset->metadata.lqip, hotspot, crop },
    phone, email, social,
    address, neighbourhood, nearbyLandmarks, mapUrl, coordinates,
    timezone, regularHours, holidayHours, closureNotices, hoursNotes,
    onlineOrderingUrl, bookTableUrl, giftVouchersUrl, allergenNotice,
    seoTitleTemplate, seoDefaultDescription, seoKeywords,
    "seoOgImage": seoOgImage{ "url": asset->url, alt }
  }
`

export const PRINT_MENU_DATA = `{
  "items": *[_type == "menuItem" && available == true] | order(sortOrder asc) {
    id, "slug": slug.current, name, description,
    prices, priceOnRequest,
    dietary, allergens, spiceLevel,
    featured, soldOut,
    "categoryIds": categories[]->id
  },
  "setMenus": *[_type == "setMenu" && available == true] {
    id, "slug": slug.current, name,
    prices, byob, preStarter, availability, note,
    courses[] {
      courseTitle, instruction,
      items[] { "id": id.current, name, description, dietary, allergens },
      fixedItems
    }
  },
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0] {
    name, phone,
    "address": address { line1, city, postcode }
  }
}`

export const FEATURED_MENU_ITEMS = `
  *[_type == "menuItem" && featured == true && available == true][0...6] {
    id, "slug": slug.current, name, description,
    prices, priceOnRequest, dietary, allergens, spiceLevel, origin,
    "image": image{ alt, "url": asset->url, "lqip": asset->metadata.lqip, hotspot, crop }
  }
`
