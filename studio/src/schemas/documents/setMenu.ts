import { defineType, defineField, defineArrayMember } from 'sanity'

export const setMenu = defineType({
  name: 'setMenu',
  title: 'Set Menu',
  type: 'document',
  groups: [
    { name: 'details', title: 'Details', default: true },
    { name: 'courses', title: 'Courses' },
    { name: 'status', title: 'Status' },
  ],
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
      group: 'details',
      description: 'Stable kebab-case identifier',
      validation: (R) => R.required(),
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
    defineField({
      name: 'prices',
      title: 'Prices',
      type: 'array',
      group: 'details',
      of: [{ type: 'priceEntry' }],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      group: 'details',
      description: 'Time window shown to customers, e.g. 12:00–18:30',
    }),
    defineField({ name: 'style', title: 'Service Style', type: 'string', group: 'details', description: 'e.g. Banquet — main dishes presented together and shared.' }),
    defineField({ name: 'note', title: 'Note', type: 'text', group: 'details', rows: 2 }),
    defineField({ name: 'preStarter', title: 'Pre-Starter', type: 'string', group: 'details', description: 'Fixed item served before starters, e.g. Poppadoms & Chutney' }),
    defineField({ name: 'byob', title: 'BYOB', type: 'boolean', group: 'details', initialValue: false, description: 'Bring your own bottle' }),
    defineField({
      name: 'courses',
      title: 'Courses',
      type: 'array',
      group: 'courses',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'course',
          title: 'Course',
          fields: [
            defineField({ name: 'courseTitle', title: 'Course Title', type: 'string', description: 'e.g. Starters, Mains, Sundries', validation: (R) => R.required() }),
            defineField({ name: 'instruction', title: 'Instruction', type: 'string', description: 'e.g. Please choose one.' }),
            defineField({
              name: 'items',
              title: 'Choice Items',
              type: 'array',
              of: [{ type: 'setMenuChoiceItem' }],
              description: 'Items the customer can choose from',
            }),
            defineField({
              name: 'fixedItems',
              title: 'Fixed Items',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Dishes included without choice (plain text list)',
            }),
          ],
          preview: {
            select: { courseTitle: 'courseTitle', instruction: 'instruction' },
            prepare({ courseTitle, instruction }) {
              return { title: courseTitle, subtitle: instruction }
            },
          },
        }),
      ],
    }),
    defineField({ name: 'available', title: 'Available', type: 'boolean', group: 'status', initialValue: true }),
    defineField({ name: 'soldOut', title: 'Sold Out', type: 'boolean', group: 'status', initialValue: false }),
    defineField({ name: 'seasonal', title: 'Seasonal', type: 'boolean', group: 'status', initialValue: false }),
    defineField({ name: 'currency', title: 'Currency', type: 'string', initialValue: 'GBP', hidden: true }),
  ],
  preview: {
    select: { name: 'name', prices: 'prices', available: 'available' },
    prepare({ name, prices, available }) {
      const p = prices as Array<{ context: string; amount: number }> | undefined
      const priceStr = p?.map(e => `£${e.amount.toFixed(2)} ${e.context}`).join(', ') ?? '—'
      return { title: name, subtitle: `${priceStr}${!available ? ' · Hidden' : ''}` }
    },
  },
})
