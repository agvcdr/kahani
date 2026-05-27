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

export const setMenuChoiceItem = defineType({
  name: 'setMenuChoiceItem',
  title: 'Choice Item',
  type: 'object',
  fields: [
    defineField({ name: 'id', title: 'ID', type: 'slug', description: 'Stable kebab-case identifier', validation: (R) => R.required() }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
    defineField({
      name: 'dietary',
      title: 'Dietary',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: DIETARY_OPTIONS },
    }),
    defineField({
      name: 'allergens',
      title: 'Allergens',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: ALLERGEN_OPTIONS, layout: 'grid' },
    }),
  ],
  preview: {
    select: { name: 'name', dietary: 'dietary' },
    prepare({ name, dietary }) {
      return { title: name, subtitle: (dietary as string[] | undefined)?.join(', ') }
    },
  },
})
