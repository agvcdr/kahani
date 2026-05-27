import { defineType, defineField } from 'sanity'

export const priceEntry = defineType({
  name: 'priceEntry',
  title: 'Price',
  type: 'object',
  fields: [
    defineField({
      name: 'context',
      title: 'Context',
      type: 'string',
      description: 'e.g. standard, starter, grill-main, main, side, per-person, for-two',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Starter', value: 'starter' },
          { title: 'Grill Main', value: 'grill-main' },
          { title: 'Main', value: 'main' },
          { title: 'Side', value: 'side' },
          { title: 'Per Person', value: 'per-person' },
          { title: 'For Two', value: 'for-two' },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'amount',
      title: 'Amount (£)',
      type: 'number',
      validation: (R) => R.required().min(0).precision(2),
    }),
  ],
  preview: {
    select: { context: 'context', amount: 'amount' },
    prepare({ context, amount }) {
      return {
        title: `£${amount?.toFixed(2) ?? '—'}`,
        subtitle: context ?? 'standard',
      }
    },
  },
})
