#!/usr/bin/env node
/**
 * Splits the single 'kids' category into three sub-categories:
 *   kids-mains, kids-desserts, kids-drinks
 * and reassigns each item accordingly.
 *
 * Usage:
 *   SANITY_MIGRATION_TOKEN=<token> node scripts/fix-kids-menu.mjs
 */
import { createClient } from '@sanity/client'

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2ruf2qez'
const DATASET   = process.env.NEXT_PUBLIC_SANITY_DATASET   || 'production'
const TOKEN     = process.env.SANITY_MIGRATION_TOKEN
if (!TOKEN) { console.error('Set SANITY_MIGRATION_TOKEN'); process.exit(1) }

const client = createClient({ projectId: PROJECT_ID, dataset: DATASET, token: TOKEN, apiVersion: '2024-01-01', useCdn: false })

const NEW_CATS = [
  { id: 'kids-mains',    label: 'Mains',    sortOrder: 1 },
  { id: 'kids-desserts', label: 'Desserts', sortOrder: 2 },
  { id: 'kids-drinks',   label: 'Drinks',   sortOrder: 3 },
]

const DESSERT_NAMES = ['ice cream']
const DRINK_NAMES   = ['caprisun', 'appletizer', 'apple juice', 'orange juice', 'lassi', 'juice']

function classify(name) {
  const n = name.toLowerCase()
  if (DESSERT_NAMES.some(d => n.includes(d))) return 'kids-desserts'
  if (DRINK_NAMES.some(d => n.includes(d)))   return 'kids-drinks'
  return 'kids-mains'
}

async function run() {
  // 1. Create sub-categories
  console.log('Creating sub-categories…')
  for (const cat of NEW_CATS) {
    await client.createOrReplace({
      _id:        `category-${cat.id}`,
      _type:      'menuCategory',
      id:         cat.id,
      slug:       { _type: 'slug', current: cat.id },
      label:      cat.label,
      parentMenu: 'kids',
      sortOrder:  cat.sortOrder,
    })
    console.log(`  ✓ ${cat.id}`)
  }

  // 2. Fetch all kids items
  const items = await client.fetch(
    `*[_type == "menuItem" && "category-kids" in categories[]._ref]{ _id, name, categories, sortOrder }`
  )
  console.log(`\nReassigning ${items.length} items…`)

  const countByGroup = { 'kids-mains': 0, 'kids-desserts': 0, 'kids-drinks': 0 }

  for (const item of items) {
    const subCatId = classify(item.name)
    countByGroup[subCatId]++
    const newSortOrder = countByGroup[subCatId]

    // Replace categories: remove 'category-kids', add sub-category ref
    const filteredCats = (item.categories ?? []).filter(c => c._ref !== 'category-kids')
    const newCatRef = { _type: 'reference', _ref: `category-${subCatId}`, _key: subCatId }

    await client.patch(item._id).set({
      categories: [...filteredCats, newCatRef],
      sortOrder:  newSortOrder,
    }).commit()

    console.log(`  ${item.name.padEnd(40)} → ${subCatId} (#${newSortOrder})`)
  }

  console.log('\n✓ Done')
}

run().catch(e => { console.error(e); process.exit(1) })
