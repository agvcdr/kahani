import { defineType, defineField } from 'sanity'

export const menuCategory = defineType({
  name: 'menuCategory',
  title: 'Menu Category',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
      description: 'Stable kebab-case identifier — never change once published (e.g. starters-traditional)',
      validation: (R) => R.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { name: 'kebab-case' }),
      readOnly: ({ document }) => !!document?._createdAt,
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'label' },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'parentMenu',
      title: 'Menu Group',
      type: 'string',
      options: {
        list: [
          { title: 'À La Carte', value: 'a-la-carte' },
          { title: 'Drinks & Desserts', value: 'drinks-desserts' },
          { title: 'Kids', value: 'kids' },
          { title: 'Lunch', value: 'lunch' },
          { title: 'Pre-Theatre', value: 'pre-theatre' },
          { title: 'Party', value: 'party' },
          { title: 'Afternoon Tea', value: 'afternoon-tea' },
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
    defineField({ name: 'availability', title: 'Availability', type: 'string', description: 'e.g. 12:00–18:30' }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0 }),
  ],
  preview: {
    select: { label: 'label', parentMenu: 'parentMenu' },
    prepare({ label, parentMenu }) {
      return { title: label, subtitle: parentMenu }
    },
  },
  orderings: [{ title: 'Sort Order', name: 'sortOrderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] }],
})
