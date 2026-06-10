#!/usr/bin/env node
/**
 * Reorganises the 'drinks' and 'drink-soft' categories into:
 *   hot-drinks      — tea, coffee, espresso, chai
 *   soft-drinks     — canned/bottled soft drinks, waters, juices
 *   lassi-indian    — lassis, Indian Classics
 *   mocktails-shakes — bar mocktails moved from 'drinks'
 *
 * Also deletes 4 duplicate items left over from the import script.
 *
 * Usage:
 *   SANITY_MIGRATION_TOKEN=<token> node scripts/fix-soft-drinks.mjs
 */
import { createClient } from '@sanity/client'

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2ruf2qez'
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production'
const TOKEN      = process.env.SANITY_MIGRATION_TOKEN
if (!TOKEN) { console.error('Set SANITY_MIGRATION_TOKEN'); process.exit(1) }

const client = createClient({ projectId: PROJECT_ID, dataset: DATASET, token: TOKEN, apiVersion: '2024-01-01', useCdn: false })

// ── New sub-categories ────────────────────────────────────────────────
const NEW_CATS = [
  { id: 'hot-drinks',   label: 'Hot Drinks',             sortOrder: 1, parentMenu: 'drinks-desserts' },
  { id: 'soft-drinks',  label: 'Soft Drinks',             sortOrder: 2, parentMenu: 'drinks-desserts' },
  { id: 'lassi-indian', label: 'Lassi & Indian Drinks',   sortOrder: 3, parentMenu: 'drinks-desserts' },
]

// ── Duplicates to delete (import-script versions superseded by originals) ──
const DELETE_IDS = [
  'menuItem-drink-ginger-beer',         // £3.45 duplicate — keep menuItem-ginger-beer (£4)
  'menuItem-drink-mango-lassi',         // £4.25 duplicate — keep menuItem-mango-lassi (£5.45)
  'menuItem-drink-soda-mix',            // generic "Soda" — individual canned drinks now listed
  'menuItem-drink-water-still-sparkling', // generic "Water" — Mineral/Sparkling Water items used instead
]

// ── Classification rules (checked in order, first match wins) ────────
const HOT = ['tea','chai','espresso','cappuccino','coffee','chocolate','latte']
const MOCKTAIL = ['peach cooler','anardrana','mojito','indian sunrise','blue hawaiian','scanjbi']
const LASSI = ['lassi','spiced mango lassi','indian classics']

function classify(name) {
  const n = name.toLowerCase()
  if (HOT.some(k => n.includes(k)))      return 'hot-drinks'
  if (MOCKTAIL.some(k => n.includes(k))) return 'mocktails-shakes'
  if (LASSI.some(k => n.includes(k)))    return 'lassi-indian'
  return 'soft-drinks'
}

async function run() {
  // 1. Create sub-categories
  console.log('Creating sub-categories…')
  for (const cat of NEW_CATS) {
    await client.createOrReplace({
      _id: `category-${cat.id}`, _type: 'menuCategory',
      id: cat.id, slug: { _type: 'slug', current: cat.id },
      label: cat.label, parentMenu: cat.parentMenu, sortOrder: cat.sortOrder,
    })
    console.log(`  ✓ ${cat.id}`)
  }

  // 2. Delete duplicates
  console.log('\nDeleting duplicate import-script items…')
  for (const id of DELETE_IDS) {
    await client.delete(id).catch(() => console.log(`  (${id} not found, skipping)`))
    console.log(`  ✗ deleted ${id}`)
  }

  // 3. Fetch all remaining items in drinks / drink-soft
  const items = await client.fetch(
    `*[_type=="menuItem" && ("category-drinks" in categories[]._ref || "category-drink-soft" in categories[]._ref)]{_id,name,categories}`
  )
  console.log(`\nReclassifying ${items.length} items…`)

  const counts = {}
  for (const item of items) {
    const newCatId = classify(item.name)
    counts[newCatId] = (counts[newCatId] || 0) + 1

    // Remove old drink categories, add new one
    const cleaned = (item.categories || []).filter(
      c => c._ref !== 'category-drinks' && c._ref !== 'category-drink-soft'
    )
    const newRef = { _type: 'reference', _ref: `category-${newCatId}`, _key: newCatId }

    await client.patch(item._id).set({
      categories: [...cleaned, newRef],
      sortOrder: counts[newCatId],
    }).commit()

    console.log(`  ${item.name.padEnd(40)} → ${newCatId} (#${counts[newCatId]})`)
  }

  console.log('\n✓ Done')
}

run().catch(e => { console.error(e); process.exit(1) })
