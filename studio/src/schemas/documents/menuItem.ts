import { defineType, defineField } from 'sanity'

const DIETARY_OPTIONS = [
  { title: 'Vegetarian', value: 'vegetarian' },
  { title: 'Vegan', value: 'vegan' },
  { title: 'Gluten-Free', value: 'gluten-free' },
]

const ALLERGEN_OPTIONS = [
  { title: 'Celery', value: 'celery' },
  { title: 'Gluten', value: 'gluten' },
  { title: 'Crustaceans', value: 'crustaceans' },
  { title: 'Egg', value: 'egg' },
  { title: 'Fish', value: 'fish' },
  { title: 'Lupin', value: 'lupin' },
  { title: 'Milk / Dairy', value: 'milk' },
  { title: 'Molluscs', value: 'molluscs' },
  { title: 'Mustard', value: 'mustard' },
  { title: 'Tree Nuts', value: 'nuts' },
  { title: 'Peanuts', value: 'peanuts' },
  { title: 'Sesame', value: 'sesame' },
  { title: 'Soya', value: 'soya' },
  { title: 'Sulphur Dioxide / Sulphites', value: 'sulphur-dioxide' },
]

export const menuItem = defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  groups: [
    { name: 'details', title: 'Details', default: true },
    { name: 'pricing', title: 'Pricing' },
    { name: 'dietary', title: 'Dietary & Allergens' },
    { name: 'status', title: 'Status' },
    { name: 'media', title: 'Image' },
  ],
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
      group: 'details',
      description: 'Stable kebab-case identifier — never change once published',
      validation: (R) => R.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { name: 'kebab-case' }),
      readOnly: ({ document }) => !!document?._createdAt,
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'details',
      options: { source: 'name' },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'name', title: 'Name', type: 'string', group: 'details', validation: (R) => R.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', group: 'details', rows: 3 }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'details',
      of: [{ type: 'reference', to: [{ type: 'menuCategory' }] }],
      validation: (R) => R.required().min(1),
    }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', group: 'details', initialValue: 0 }),
    defineField({
      name: 'prices',
      title: 'Prices',
      type: 'array',
      group: 'pricing',
      of: [{ type: 'priceEntry' }],
    }),
    defineField({
      name: 'priceOnRequest',
      title: 'Price on Request',
      type: 'boolean',
      group: 'pricing',
      description: 'Show "Ask server" instead of a price',
      initialValue: false,
    }),
    defineField({
      name: 'spiceLevel',
      title: 'Spice Level',
      type: 'number',
      group: 'dietary',
      description: '0 = not spicy, 5 = very hot',
      options: {
        list: [
          { title: '0 – Mild', value: 0 },
          { title: '1', value: 1 },
          { title: '2', value: 2 },
          { title: '3 – Medium', value: 3 },
          { title: '4', value: 4 },
          { title: '5 – Very Hot', value: 5 },
        ],
        layout: 'radio',
      },
      initialValue: 0,
    }),
    defineField({
      name: 'dietary',
      title: 'Dietary Claims',
      type: 'array',
      group: 'dietary',
      of: [{ type: 'string' }],
      options: { list: DIETARY_OPTIONS, layout: 'grid' },
    }),
    defineField({
      name: 'allergens',
      title: 'Contains Allergens',
      type: 'array',
      group: 'dietary',
      of: [{ type: 'string' }],
      options: { list: ALLERGEN_OPTIONS, layout: 'grid' },
    }),
    defineField({
      name: 'available',
      title: 'Available',
      type: 'boolean',
      group: 'status',
      initialValue: true,
      description: 'Uncheck to hide from the menu entirely',
    }),
    defineField({
      name: 'soldOut',
      title: 'Sold Out',
      type: 'boolean',
      group: 'status',
      initialValue: false,
      description: 'Shows "Sold Out" on the item but keeps it visible',
    }),
    defineField({
      name: 'featured',
      title: "Chef's Recommendation",
      type: 'boolean',
      group: 'status',
      initialValue: false,
    }),
    defineField({
      name: 'seasonal',
      title: 'Seasonal Item',
      type: 'boolean',
      group: 'status',
      initialValue: false,
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (R) => R.custom((alt, ctx) => {
            if ((ctx.parent as { asset?: unknown })?.asset && !alt) return 'Alt text is required when an image is set'
            return true
          }),
        }),
      ],
    }),
    defineField({
      name: 'modifiers',
      title: 'Modifiers',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'modifier' }] }],
    }),
    defineField({ name: 'size', title: 'Size / Volume', type: 'string', description: 'e.g. 330ml, Small, Large' }),
    defineField({ name: 'serves', title: 'Serves', type: 'number', description: 'Portion size for sharing dishes', validation: (R) => R.integer().min(1) }),
  ],
  preview: {
    select: {
      name: 'name',
      dietary: 'dietary',
      prices: 'prices',
      priceOnRequest: 'priceOnRequest',
      soldOut: 'soldOut',
      available: 'available',
      media: 'image',
    },
    prepare({ name, dietary, prices, priceOnRequest, soldOut, available, media }) {
      const p = prices as Array<{ context: string; amount: number }> | undefined
      const priceStr = priceOnRequest
        ? 'Ask server'
        : p?.length
          ? `£${p[0].amount.toFixed(2)}${p.length > 1 ? ' +' : ''}`
          : '—'
      const tags = [
        ...(dietary as string[] | undefined ?? []),
        soldOut ? '⚠ Sold Out' : '',
        !available ? '✗ Hidden' : '',
      ].filter(Boolean).join(' · ')
      return { title: name, subtitle: [priceStr, tags].filter(Boolean).join(' — '), media }
    },
  },
})
