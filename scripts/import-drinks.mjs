#!/usr/bin/env node
/**
 * Imports the Kahani drinks programme into Sanity.
 * Source of truth: Royal Durbar drinks PDF + Kahani wine list xlsm (sister restaurants share the drinks menu).
 *
 * Creates 13 drink categories + ~80 menuItem documents.
 * Idempotent — safe to re-run (uses createOrReplace).
 *
 * Usage:
 *   SANITY_MIGRATION_TOKEN=<token> node scripts/import-drinks.mjs
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'
const TOKEN = process.env.SANITY_MIGRATION_TOKEN
if (!PROJECT_ID || !TOKEN) {
  console.error('Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_MIGRATION_TOKEN')
  process.exit(1)
}
const client = createClient({ projectId: PROJECT_ID, dataset: DATASET, token: TOKEN, apiVersion: '2024-01-01', useCdn: false })

// ── Categories ────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'champagne-sparkling', label: 'Champagne & Sparkling', sortOrder: 1 },
  { id: 'white-wine',          label: 'White Wine',            sortOrder: 2 },
  { id: 'rose-wine',           label: 'Rosé Wine',             sortOrder: 3 },
  { id: 'red-wine',            label: 'Red Wine',              sortOrder: 4 },
  { id: 'beer-cider',          label: 'Beer & Cider',          sortOrder: 5 },
  { id: 'cocktails',           label: 'Cocktails',             sortOrder: 6 },
  { id: 'mocktails-shakes',    label: 'Mocktails & Shakes',    sortOrder: 7 },
  { id: 'gin-vodka',           label: 'Gin & Vodka',           sortOrder: 8 },
  { id: 'rum',                 label: 'Rum',                   sortOrder: 9 },
  { id: 'malts-cognac',        label: 'Malts & Cognac',        sortOrder: 10 },
  { id: 'blended-whiskey',     label: 'Blended Whiskey',       sortOrder: 11 },
  { id: 'liqueurs',            label: 'Liqueurs',              sortOrder: 12 },
  { id: 'drink-soft',          label: 'Soft Drinks',           sortOrder: 13 },
]

// ── Helpers ───────────────────────────────────────────────────────────
const slugify = s =>
  s.toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and').replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const wines = JSON.parse(readFileSync(join(__dirname, '_wines.json'), 'utf8'))

const wineByPdfMatch = name =>
  wines.find(w => w.name.toLowerCase().includes(name.toLowerCase())) || null

const wineEntry = (pdfName, catId, sortOrder, glassPrices = {}) => {
  const w = wineByPdfMatch(pdfName)
  const prices = []
  if (glassPrices['125ml']) prices.push({ context: '125ml', amount: glassPrices['125ml'] })
  if (glassPrices['175ml']) prices.push({ context: '175ml', amount: glassPrices['175ml'] })
  if (glassPrices['250ml']) prices.push({ context: '250ml', amount: glassPrices['250ml'] })
  if (w?.bottle) prices.push({ context: 'bottle', amount: w.bottle })

  const description = w
    ? [w.grapes, w.notes].filter(Boolean).join(' — ')
    : null

  return {
    id: slugify(pdfName.split(',')[0]).slice(0, 50),
    name: pdfName,
    description,
    catId,
    prices,
    sortOrder,
    dietary: [],
  }
}

// ── Drink items by category ───────────────────────────────────────────
const ITEMS = []

// Champagne & Sparkling
ITEMS.push(
  wineEntry('Grande Réserve Brut, Champagne Jean de Villaré (France)', 'champagne-sparkling', 1),
  wineEntry('Cava Reserva Brut Organic, Bodegas Sumarroca (Spain)',    'champagne-sparkling', 2),
  wineEntry('Prosecco DOC Spumante, La Vita Sociale (Italy)',          'champagne-sparkling', 3, { '125ml': 7.95 }),
)

// White Wine
ITEMS.push(
  wineEntry('Albariño, El Camarón, Galicia (Spain)',                   'white-wine', 1),
  wineEntry('Pinot Grigio, Bella Modella, Abruzzo (Italy)',            'white-wine', 2, { '175ml': 6.60, '250ml': 9.50 }),
  wineEntry('Sauvignon Blanc, Orée Sauvage, Languedoc (France)',       'white-wine', 3, { '175ml': 7.60, '250ml': 10.85 }),
  wineEntry('Chardonnay, Costa Vera, Indómita (Chile)',                'white-wine', 4),
  wineEntry('Chenin Blanc-Viognier, Lo & Behold (South Africa)',       'white-wine', 5),
  wineEntry('Chablis, Domaine Besson, Burgundy (France)',              'white-wine', 6),
)

// Rosé Wine
ITEMS.push(
  wineEntry('Le Pic Rosé, Terres Fidèles, Languedoc (France)',         'rose-wine', 1, { '175ml': 7.20, '250ml': 10.30 }),
  wineEntry("Palm Par L'Escarelle, Château L'Escarelle (France)",      'rose-wine', 2),
)

// Red Wine
ITEMS.push(
  wineEntry('Amarone della Valpolicella Classico, Biscardo (Italy)',   'red-wine', 1),
  wineEntry('Chianti Riserva, Baccio, Le Chiantigiane (Italy)',        'red-wine', 2),
  wineEntry('Magnífico Tempranillo, Luis Marin, Aragón (Spain)',       'red-wine', 3),
  wineEntry("The Wrong 'Un Shiraz/Cabernet, One Chain (Australia)",    'red-wine', 4),
  wineEntry('Merlot, Costa Vera, Indómita (Chile)',                    'red-wine', 5, { '175ml': 7.20, '250ml': 10.30 }),
  wineEntry('Malbec Santuario, Mendoza (Argentina)',                   'red-wine', 6, { '175ml': 8.15, '250ml': 11.55 }),
)

// Beer & Cider — house items renamed Royal Durbar → Kahani
const beerCider = [
  { id: 'kahani-lager',                name: 'Kahani Lager',                        desc: null,                                                                              prices: [{ context: 'half-pint', amount: 3.45 }, { context: 'pint', amount: 6.25 }] },
  { id: 'kahani-ipa',                  name: 'Kahani IPA',                          desc: null,                                                                              prices: [{ context: 'half-pint', amount: 3.45 }, { context: 'pint', amount: 6.25 }] },
  { id: 'cobra-lager',                 name: 'Cobra Lager',                         desc: null,                                                                              prices: [{ context: 'half-pint', amount: 3.75 }, { context: 'pint', amount: 6.45 }] },
  { id: 'magners-cider',               name: 'Magners Cider',                       desc: null,                                                                              prices: [{ context: 'bottle', amount: 6.25 }] },
  { id: 'peacock-mango-lime-cider',    name: 'Peacock Mango & Lime Indian Cider',   desc: null,                                                                              prices: [{ context: 'bottle', amount: 6.75 }] },
  { id: 'kingfisher-zero',             name: 'Kingfisher 0.0% (330ml)',             desc: 'Non-alcoholic Indian lager.',                                                     prices: [{ context: 'bottle', amount: 3.95 }] },
]
beerCider.forEach((b, i) => ITEMS.push({ ...b, description: b.desc, catId: 'beer-cider', sortOrder: i + 1, dietary: [] }))

// Cocktails
const cocktails = [
  { id: 'bellini',          name: 'Bellini',           desc: 'Classic bubbly drink with peach and Prosecco.', price: 9.95 },
  { id: 'french-75',        name: 'French 75',         desc: 'Edinburgh Gin with lime and gum syrup, topped with Prosecco.', price: 9.95 },
  { id: 'pornstar-martini', name: 'Pornstar Martini',  desc: 'Modern classic with Chai-spiced Gin and vibrant passion fruit purée. Served with a shot of sparkling wine.', price: 9.95 },
  { id: 'mango-martini',    name: 'Mango Martini',     desc: 'The Indian way: Mango-flavoured vodka, fresh lime juice, and mango purée.', price: 9.95 },
  { id: 'moscow-mule',      name: 'Moscow Mule',       desc: 'Refreshing and slightly spicy with Vodka, fresh ginger, and lime, topped with ginger beer.', price: 8.95 },
  { id: 'hurricane',        name: 'Hurricane',         desc: 'Bold and tropical with Chai Rum and White Rum, passion fruit purée, and fresh orange juice.', price: 8.95 },
  { id: 'monsoon',          name: 'Monsoon',           desc: 'Indian Chai Gin with fresh mint, lime wedges, and roasted cumin, topped with soda.', price: 8.95 },
  { id: 'sour-malt',        name: 'Sour Malt',         desc: 'Classic Whisky Sour made with premium single malt whisky.', price: 10.95 },
  { id: 'black-fog',        name: 'Black Fog',         desc: 'Johnnie Walker Black Label smoked with cinnamon and cloves.', price: 10.95 },
  { id: 'masala-gt',        name: 'Masala G&T',        desc: 'Indian Chai Gin and tonic spiced up with traditional Indian spices.', price: 9.95 },
]
cocktails.forEach((c, i) => ITEMS.push({ id: c.id, name: c.name, description: c.desc, catId: 'cocktails', sortOrder: i + 1, prices: [{ context: 'standard', amount: c.price }], dietary: [] }))

// Mocktails & Shakes
const mocktails = [
  { id: 'muddy-mary',  name: 'Muddy Mary',  desc: 'Alcohol-free Bloody Mary with Guava juice.', price: 6.95 },
  { id: 'mint-cooler', name: 'Mint Cooler', desc: 'Virgin Mojito with bubblegum syrup.',        price: 6.95 },
  { id: 'masala-soda', name: 'Masala Soda', desc: 'Fresh lime soda with garam masala.',         price: 5.95 },
  { id: 'blue-heaven', name: 'Blue Heaven', desc: 'Non-alcoholic Blue Curaçao and lemonade.',    price: 5.95 },
  { id: 'kahani-shakes', name: 'Shakes',    desc: 'Choice of Oreo cookie, blueberry & banana, or mango & cardamom.', price: 6.95 },
]
mocktails.forEach((c, i) => ITEMS.push({ id: c.id, name: c.name, description: c.desc, catId: 'mocktails-shakes', sortOrder: i + 1, prices: [{ context: 'standard', amount: c.price }], dietary: [] }))

// Gin & Vodka (30ml)
const ginVodka = [
  { id: 'rutland-chai-gin',     name: 'Rutland Chai Gin',           price: 5.95 },
  { id: 'jaisalmer-craft-gin',  name: 'Jaisalmer Indian Craft Gin', price: 5.95 },
  { id: 'bombay-edinburgh-gin', name: 'Bombay Sapphire / Edinburgh Gin', price: 5.95 },
  { id: 'tanqueray-london-dry', name: 'Tanqueray London Dry',       price: 4.95 },
  { id: 'absolut',              name: 'Absolut',                    price: 5.95 },
  { id: 'smirnoff',             name: 'Smirnoff',                   price: 4.95 },
  { id: 'mixers',               name: 'Mixers',                     price: 1.95 },
]
ginVodka.forEach((c, i) => ITEMS.push({ id: c.id, name: c.name, description: null, catId: 'gin-vodka', sortOrder: i + 1, prices: [{ context: '30ml', amount: c.price }], dietary: [] }))

// Rum (30ml)
const rum = [
  { id: 'old-monk',           name: 'Old Monk',           price: 5.95 },
  { id: 'rutland-chai-rum',   name: 'Rutland Chai Rum',   price: 5.95 },
  { id: 'captain-morgan-spice', name: 'Captain Morgan Spice', price: 4.95 },
  { id: 'bacardi',            name: 'Bacardi',            price: 4.95 },
  { id: 'malibu',             name: 'Malibu',             price: 4.95 },
]
rum.forEach((c, i) => ITEMS.push({ id: c.id, name: c.name, description: null, catId: 'rum', sortOrder: i + 1, prices: [{ context: '30ml', amount: c.price }], dietary: [] }))

// Malts & Cognac (30ml) — deduplicated from PDF
const malts = [
  { id: 'amrut-single-malt',     name: 'Amrut (Indian Single Malt)', price: 5.95 },
  { id: 'highland-park-12',      name: 'Highland Park 12 Years',     price: 6.95 },
  { id: 'dalwhinnie',            name: 'Dalwhinnie',                 price: 6.95 },
  { id: 'lagavulin',             name: 'Lagavulin',                  price: 9.95 },
  { id: 'oban-14',               name: 'Oban 14 Years',              price: 14.95 },
  { id: 'macallan-12',           name: 'The Macallan 12 Years',      price: 7.95 },
  { id: 'macallan-18',           name: 'The Macallan 18 Years',      price: 39.95 },
  { id: 'glenfiddich-12',        name: 'Glenfiddich 12 Years',       price: 6.95 },
  { id: 'glenfiddich-18',        name: 'Glenfiddich 18 Years',       price: 9.95 },
  { id: 'jw-green-label',        name: 'Johnnie Walker Green Label', price: 7.95 },
  { id: 'jameson-irish',         name: 'Jameson (Irish)',            price: 6.95 },
  { id: 'hennessy-vsop',         name: 'Hennessy VSOP',              price: 8.95 },
  { id: 'hennessy-xo',           name: 'Hennessy XO',                price: 19.95 },
]
malts.forEach((c, i) => ITEMS.push({ id: c.id, name: c.name, description: null, catId: 'malts-cognac', sortOrder: i + 1, prices: [{ context: '30ml', amount: c.price }], dietary: [] }))

// Blended Whiskey (30ml)
const blended = [
  { id: 'jack-daniels',     name: 'Jack Daniels',         price: 6.95 },
  { id: 'chivas-regal-12',  name: 'Chivas Regal 12 Years', price: 6.95 },
  { id: 'chivas-regal-18',  name: 'Chivas Regal 18 Years', price: 15.95 },
  { id: 'royal-salute-21',  name: 'Royal Salute 21 Years', price: 19.95 },
  { id: 'jw-blue-label',    name: 'Johnnie Walker Blue Label', price: 24.95 },
  { id: 'jw-gold-label',    name: 'Johnnie Walker Gold Label', price: 9.95 },
]
blended.forEach((c, i) => ITEMS.push({ id: c.id, name: c.name, description: null, catId: 'blended-whiskey', sortOrder: i + 1, prices: [{ context: '30ml', amount: c.price }], dietary: [] }))

// Liqueurs (30ml)
const liqueurs = [
  { id: '5walla-chai-liqueur', name: '5Walla Chai Liqueur', price: 5.95 },
  { id: 'baileys',             name: 'Baileys',             price: 4.95 },
  { id: 'amaretto-disaronno',  name: 'Amaretto Disaronno',  price: 4.95 },
  { id: 'tia-maria',           name: 'Tia Maria',           price: 4.95 },
  { id: 'cointreau',           name: 'Cointreau',           price: 4.95 },
  { id: 'drambuie',            name: 'Drambuie',            price: 4.95 },
  { id: 'tequila',             name: 'Tequila',             price: 5.95 },
]
liqueurs.forEach((c, i) => ITEMS.push({ id: c.id, name: c.name, description: null, catId: 'liqueurs', sortOrder: i + 1, prices: [{ context: '30ml', amount: c.price }], dietary: [] }))

// Soft Drinks
const soft = [
  { id: 'indian-classics',   name: 'Indian Classics',     desc: 'Nimbu Pani, Thums Up, or Limca.', prices: [{ context: 'standard', amount: 3.95 }] },
  { id: 'mango-lassi',       name: 'Mango Lassi',          desc: null, prices: [{ context: 'standard', amount: 4.25 }] },
  { id: 'ginger-beer',       name: 'Ginger Beer',          desc: null, prices: [{ context: 'standard', amount: 3.45 }] },
  { id: 'appletiser',        name: 'Appletiser',           desc: null, prices: [{ context: 'standard', amount: 3.45 }] },
  { id: 'soda-mix',          name: 'Soda',                 desc: 'Coke, Diet Coke, Lemonade, or Irn Bru.', prices: [{ context: 'standard', amount: 3.45 }] },
  { id: 'juice-mix',         name: 'Juice',                desc: 'Apple, orange, mango, or guava.', prices: [{ context: 'standard', amount: 3.45 }] },
  { id: 'water-still-sparkling', name: 'Water',            desc: 'Still or sparkling.', prices: [{ context: '500ml', amount: 3.45 }, { context: 'bottle', amount: 4.25 }] },
]
soft.forEach((c, i) => ITEMS.push({ id: c.id, name: c.name, description: c.desc, catId: 'drink-soft', sortOrder: i + 1, prices: c.prices, dietary: ['vegetarian'] }))

// ── Build Sanity docs ─────────────────────────────────────────────────
const catDocs = CATEGORIES.map(c => ({
  _id: `category-${c.id}`,
  _type: 'menuCategory',
  id: c.id,
  slug: { _type: 'slug', current: c.id },
  label: c.label,
  parentMenu: 'drinks-desserts',
  sortOrder: c.sortOrder,
}))

const itemDocs = ITEMS.map(it => ({
  _id: `menuItem-drink-${it.id}`,
  _type: 'menuItem',
  id: it.id,
  slug: { _type: 'slug', current: it.id },
  name: it.name,
  description: it.description,
  categories: [{ _type: 'reference', _ref: `category-${it.catId}`, _key: it.catId }],
  prices: (it.prices ?? []).map((p, i) => ({ _key: `p-${i}`, _type: 'priceEntry', ...p })),
  priceOnRequest: false,
  spiceLevel: 0,
  dietary: it.dietary ?? [],
  allergens: [],
  available: true,
  featured: false,
  seasonal: false,
  soldOut: false,
  sortOrder: it.sortOrder,
}))

// ── Upload ────────────────────────────────────────────────────────────
async function run() {
  console.log(`Importing ${catDocs.length} categories…`)
  for (const c of catDocs) await client.createOrReplace(c)

  console.log(`Importing ${itemDocs.length} drink items…`)
  for (const it of itemDocs) await client.createOrReplace(it)

  console.log('✓ Done')
}

run().catch(e => { console.error(e); process.exit(1) })
