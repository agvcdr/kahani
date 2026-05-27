import { defineType, defineField } from 'sanity'

export const modifier = defineType({
  name: 'modifier',
  title: 'Modifier',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
      description: 'Stable kebab-case identifier',
      validation: (R) => R.required(),
      readOnly: ({ document }) => !!document?._createdAt,
    }),
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'priceDelta',
      title: 'Price Delta (£)',
      type: 'number',
      description: 'Additional charge. Use 0 if included at no extra cost.',
      validation: (R) => R.required().min(0).precision(2),
    }),
    defineField({ name: 'note', title: 'Note', type: 'string' }),
  ],
  preview: {
    select: { label: 'label', priceDelta: 'priceDelta' },
    prepare({ label, priceDelta }) {
      return { title: label, subtitle: priceDelta === 0 ? 'Included' : `+£${priceDelta?.toFixed(2)}` }
    },
  },
})
