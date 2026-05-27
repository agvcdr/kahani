import { defineType, defineField } from 'sanity'

export const allergenDefinition = defineType({
  name: 'allergenDefinition',
  title: 'Allergen',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
      description: 'UK allergen id (e.g. gluten, milk, peanuts)',
      validation: (R) => R.required(),
      readOnly: ({ document }) => !!document?._createdAt,
    }),
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'warning', title: 'Warning Note', type: 'text', rows: 2 }),
  ],
  preview: {
    select: { label: 'label', id: 'id' },
    prepare({ label, id }) {
      return { title: label, subtitle: id }
    },
  },
})
