#!/usr/bin/env node
/**
 * One-time migration: reads all JSON from src/content/ and creates Sanity documents.
 * Idempotent — safe to re-run (uses createOrReplace).
 *
 * Usage:
 *   SANITY_MIGRATION_TOKEN=<write-token> node scripts/migrate-to-sanity.mjs
 *
 * Get a write token from: https://www.sanity.io/manage → project → API → Tokens
 */

import { createClient } from '@sanity/client'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CONTENT = join(ROOT, 'src/content')

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'
const TOKEN = process.env.SANITY_MIGRATION_TOKEN

if (!PROJECT_ID) {
  console.error('Error: NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_STUDIO_PROJECT_ID must be set')
  process.exit(1)
}
if (!TOKEN) {
  console.error('Error: SANITY_MIGRATION_TOKEN must be set (get a write token from sanity.io/manage)')
  process.exit(1)
}

const client = createClient({ projectId: PROJECT_ID, dataset: DATASET, token: TOKEN, apiVersion: '2024-01-01', useCdn: false })

function jload(relPath) {
  return JSON.parse(readFileSync(join(CONTENT, relPath), 'utf8'))
}

function choiceItem(item) {
  return {
    _type: 'setMenuChoiceItem',
    _key: item.id,
    id: { _type: 'slug', current: item.id },
    name: item.name,
    description: item.description ?? null,
    dietary: item.dietary ?? [],
    allergens: item.allergens ?? [],
  }
}

let total = 0

async function upsert(doc) {
  await client.createOrReplace(doc)
  total++
  process.stdout.write('.')
}

// ── 1. Allergens ──────────────────────────────────────────────────────────────
async function migrateAllergens() {
  console.log('\n[1/6] Allergens')
  const { allergenDefinitions } = jload('menu/allergens/allergens.json')
  for (const a of allergenDefinitions) {
    await upsert({ _id: `allergen-${a.id}`, _type: 'allergenDefinition', id: a.id, label: a.label })
  }
}

// ── 2. Modifiers ──────────────────────────────────────────────────────────────
async function migrateModifiers() {
  console.log('\n[2/6] Modifiers')
  const modifiers = jload('menu/modifiers/modifiers.json')
  for (const m of modifiers) {
    await upsert({ _id: `modifier-${m.id}`, _type: 'modifier', id: m.id, label: m.label, priceDelta: m.priceDelta ?? 0, note: m.note ?? null })
  }
}

// ── 3. Categories ─────────────────────────────────────────────────────────────
async function migrateCategories() {
  console.log('\n[3/6] Categories')
  const categories = jload('menu/categories/categories.json')
  for (const c of categories) {
    await upsert({
      _id: `category-${c.id}`,
      _type: 'menuCategory',
      id: c.id,
      slug: { _type: 'slug', current: c.slug ?? c.id },
      label: c.label,
      parentMenu: c.parentMenu,
      description: c.description ?? null,
      availability: c.availability ?? null,
      sortOrder: c.sortOrder ?? 0,
    })
  }
}

// ── 4. À la carte menu items ──────────────────────────────────────────────────
const SET_MENU_FILES = new Set(['lunch.json', 'pre-theatre.json', 'party.json', 'afternoon-tea.json'])

async function migrateMenuItems() {
  console.log('\n[4/6] Menu items')
  const itemDir = join(CONTENT, 'menu/items')
  const files = readdirSync(itemDir).filter(f => f.endsWith('.json') && !SET_MENU_FILES.has(f))

  for (const file of files) {
    const items = jload(`menu/items/${file}`)
    const list = Array.isArray(items) ? items : [items]
    for (const item of list) {
      if (!item.id) continue
      await upsert({
        _id: `menuItem-${item.id}`,
        _type: 'menuItem',
        id: item.id,
        slug: { _type: 'slug', current: item.slug ?? item.id },
        name: item.name,
        description: item.description ?? null,
        categories: (item.categories ?? []).map(catId => ({ _type: 'reference', _ref: `category-${catId}`, _key: catId })),
        prices: (item.prices ?? []).map((p, i) => ({ _type: 'priceEntry', _key: `price-${i}`, context: p.context, amount: p.amount })),
        priceOnRequest: item.priceOnRequest ?? false,
        spiceLevel: item.spiceLevel ?? 0,
        dietary: item.dietary ?? [],
        allergens: item.allergens ?? [],
        available: item.available ?? true,
        featured: item.featured ?? false,
        seasonal: item.seasonal ?? false,
        soldOut: item.soldOut ?? false,
        sortOrder: item.sortOrder ?? 0,
        modifiers: (item.modifiers ?? []).map(modId => ({ _type: 'reference', _ref: `modifier-${modId}`, _key: modId })),
        size: item.size ?? null,
        serves: item.serves ?? null,
      })
    }
  }
}

// ── 5. Set menus ──────────────────────────────────────────────────────────────
async function migrateSetMenus() {
  console.log('\n[5/6] Set menus')

  // Pre-theatre
  const pt = jload('menu/items/pre-theatre.json')
  await upsert({
    _id: 'setMenu-pre-theatre',
    _type: 'setMenu',
    id: pt.id,
    slug: { _type: 'slug', current: pt.slug },
    name: pt.name,
    currency: pt.currency ?? 'GBP',
    prices: (pt.prices ?? []).map((p, i) => ({ _type: 'priceEntry', _key: `price-${i}`, context: p.context, amount: p.amount })),
    available: pt.available ?? true,
    seasonal: pt.seasonal ?? false,
    soldOut: pt.soldOut ?? false,
    preStarter: pt.preStarter ?? null,
    courses: [
      {
        _type: 'object',
        _key: 'starters',
        courseTitle: 'Starters',
        instruction: pt.starters.instruction,
        items: pt.starters.items.map(choiceItem),
        fixedItems: [],
      },
      {
        _type: 'object',
        _key: 'mains',
        courseTitle: 'Mains',
        instruction: pt.mains.instruction,
        items: pt.mains.items.map(choiceItem),
        fixedItems: [],
      },
      {
        _type: 'object',
        _key: 'sundries',
        courseTitle: 'Sundries',
        instruction: pt.sundries.instruction,
        items: [],
        fixedItems: pt.sundries.options,
      },
    ],
  })

  // Lunch — two documents from one file
  const ln = jload('menu/items/lunch.json')

  await upsert({
    _id: 'setMenu-lunch-one-course',
    _type: 'setMenu',
    id: ln.oneCourse.id,
    slug: { _type: 'slug', current: ln.oneCourse.slug },
    name: 'Lunch — One Course',
    currency: ln.oneCourse.currency ?? 'GBP',
    prices: (ln.oneCourse.prices ?? []).map((p, i) => ({ _type: 'priceEntry', _key: `price-${i}`, context: p.context, amount: p.amount })),
    available: ln.oneCourse.available ?? true,
    seasonal: ln.oneCourse.seasonal ?? false,
    soldOut: ln.oneCourse.soldOut ?? false,
    availability: ln.oneCourse.availability ?? null,
    courses: [
      {
        _type: 'object',
        _key: 'mains',
        courseTitle: 'Choose Your Dish',
        instruction: ln.oneCourse.description,
        items: ln.oneCourse.items.map(choiceItem),
        fixedItems: [],
      },
    ],
  })

  await upsert({
    _id: 'setMenu-lunch-two-course',
    _type: 'setMenu',
    id: ln.twoCourse.id,
    slug: { _type: 'slug', current: ln.twoCourse.slug },
    name: 'Lunch — Two Course',
    currency: ln.twoCourse.currency ?? 'GBP',
    prices: (ln.twoCourse.prices ?? []).map((p, i) => ({ _type: 'priceEntry', _key: `price-${i}`, context: p.context, amount: p.amount })),
    available: ln.twoCourse.available ?? true,
    seasonal: ln.twoCourse.seasonal ?? false,
    soldOut: ln.twoCourse.soldOut ?? false,
    availability: ln.twoCourse.availability ?? null,
    preStarter: ln.twoCourse.preStarter ?? null,
    courses: [
      {
        _type: 'object',
        _key: 'starters',
        courseTitle: 'Starters',
        instruction: 'Please choose one.',
        items: ln.twoCourse.starters.map(choiceItem),
        fixedItems: [],
      },
      {
        _type: 'object',
        _key: 'mains',
        courseTitle: 'Mains',
        instruction: 'Please choose one.',
        items: ln.twoCourse.mains.map(choiceItem),
        fixedItems: [],
      },
      {
        _type: 'object',
        _key: 'sundries',
        courseTitle: 'Sundries',
        instruction: ln.twoCourse.sundries.note,
        items: [],
        fixedItems: ln.twoCourse.sundries.options,
      },
    ],
  })

  // Party
  const party = jload('menu/items/party.json')
  await upsert({
    _id: 'setMenu-party',
    _type: 'setMenu',
    id: party.id,
    slug: { _type: 'slug', current: party.slug },
    name: party.name,
    currency: party.currency ?? 'GBP',
    prices: (party.prices ?? []).map((p, i) => ({ _type: 'priceEntry', _key: `price-${i}`, context: p.context, amount: p.amount })),
    available: party.available ?? true,
    seasonal: party.seasonal ?? false,
    soldOut: party.soldOut ?? false,
    style: party.style ?? null,
    preStarter: party.courses.preStarter ?? null,
    courses: [
      {
        _type: 'object',
        _key: 'starters',
        courseTitle: 'Starters',
        items: [],
        fixedItems: party.courses.starters,
      },
      {
        _type: 'object',
        _key: 'mains',
        courseTitle: 'Mains',
        items: party.courses.mains.map(choiceItem),
        fixedItems: [],
      },
      {
        _type: 'object',
        _key: 'sides',
        courseTitle: 'Sides',
        items: [],
        fixedItems: [party.courses.sides],
      },
    ],
  })

  // Afternoon Tea
  const at = jload('menu/items/afternoon-tea.json')
  await upsert({
    _id: 'setMenu-afternoon-tea',
    _type: 'setMenu',
    id: at.id,
    slug: { _type: 'slug', current: at.slug },
    name: at.name,
    currency: at.currency ?? 'GBP',
    prices: (at.prices ?? []).map((p, i) => ({ _type: 'priceEntry', _key: `price-${i}`, context: p.context, amount: p.amount })),
    available: at.available ?? true,
    seasonal: at.seasonal ?? false,
    soldOut: at.soldOut ?? false,
    byob: at.byob ?? false,
    note: at.note ?? null,
    courses: [
      { _type: 'object', _key: 'sandwiches', courseTitle: 'Sandwiches', items: [], fixedItems: at.sandwiches },
      { _type: 'object', _key: 'savoury', courseTitle: 'Savoury', items: [], fixedItems: at.savoury },
      { _type: 'object', _key: 'sweets', courseTitle: 'Sweets', items: [], fixedItems: at.sweets },
      { _type: 'object', _key: 'accompaniments', courseTitle: 'Accompaniments', items: [], fixedItems: at.accompaniments },
      { _type: 'object', _key: 'drinks', courseTitle: 'Drinks', items: [], fixedItems: [at.drinks] },
    ],
  })
}

// ── 6. Site settings ──────────────────────────────────────────────────────────
async function migrateSiteSettings() {
  console.log('\n[6/6] Site settings')
  const identity = jload('site/identity.json')
  const contact = jload('site/contact.json')
  const hours = jload('site/hours.json')
  const location = jload('site/location.json')
  const seo = jload('site/seo.json')

  await upsert({
    _id: 'siteSettings',
    _type: 'siteSettings',
    name: identity.name,
    shortName: identity.shortName,
    tagline: identity.tagline,
    cuisine: identity.cuisine,
    description: identity.description,
    awards: (identity.awards ?? []).map((a, i) => ({ _key: `award-${i}`, title: a.title, body: a.body })),
    allergenNotice: identity.allergenNotice ?? null,
    onlineOrderingUrl: identity.onlineOrdering?.url ?? null,
    bookTableUrl: identity.bookTable?.url ?? null,
    giftVouchersUrl: identity.giftVouchers?.url ?? null,
    phone: contact.phone ?? null,
    email: contact.email ?? null,
    social: Object.entries(contact.social ?? {}).map(([platform, data], i) => ({
      _type: 'socialLink', _key: `social-${i}`,
      platform,
      handle: data.handle ?? null,
      url: data.url,
    })),
    timezone: hours.timezone ?? 'Europe/London',
    regularHours: (hours.regular ?? hours.regularHours ?? []).map((h, i) => ({
      _type: 'openingPeriod',
      _key: `hours-${i}`,
      days: h.days,
      open: h.open,
      close: h.close,
    })),
    hoursNotes: hours.notes ?? hours.hoursNotes ?? [],
    address: {
      _type: 'address',
      line1: location.address?.line1 ?? location.street ?? null,
      city: location.address?.city ?? location.city ?? null,
      postcode: location.address?.postcode ?? location.postcode ?? null,
      country: location.address?.country ?? 'Scotland, United Kingdom',
      countryCode: 'GB',
    },
    neighbourhood: location.neighbourhood ?? null,
    nearbyLandmarks: location.nearbyLandmarks ?? [],
    mapUrl: location.mapUrl ?? null,
    coordinates: location.coordinates
      ? { lat: location.coordinates.lat, lng: location.coordinates.lng }
      : null,
    seoTitleTemplate: seo.titleTemplate ?? null,
    seoDefaultDescription: seo.defaultDescription ?? null,
    seoKeywords: seo.keywords ?? [],
  })
}

// ── Run ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Migrating to Sanity project: ${PROJECT_ID} / ${DATASET}`)
  await migrateAllergens()
  await migrateModifiers()
  await migrateCategories()
  await migrateMenuItems()
  await migrateSetMenus()
  await migrateSiteSettings()
  console.log(`\n\nDone — ${total} documents created/updated.`)
}

main().catch(err => { console.error('\nMigration failed:', err.message); process.exit(1) })
