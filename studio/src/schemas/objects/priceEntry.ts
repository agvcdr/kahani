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
      description: 'Food: standard/starter/grill-main/main/side/per-person/for-two. Drinks: bottle/125ml/175ml/250ml/500ml/half-pint/pint/30ml',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Starter', value: 'starter' },
          { title: 'Grill Main', value: 'grill-main' },
          { title: 'Main', value: 'main' },
          { title: 'Side', value: 'side' },
          { title: 'Per Person', value: 'per-person' },
          { title: 'For Two', value: 'for-two' },
          { title: 'Bottle', value: 'bottle' },
          { title: '125ml', value: '125ml' },
          { title: '175ml', value: '175ml' },
          { title: '250ml', value: '250ml' },
          { title: '500ml (Carafe)', value: '500ml' },
          { title: 'Half Pint', value: 'half-pint' },
          { title: 'Pint', value: 'pint' },
          { title: '30ml', value: '30ml' },
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
