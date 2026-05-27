import { defineType, defineField } from 'sanity'

const DAY_OPTIONS = [
  { title: 'Monday', value: 'Monday' },
  { title: 'Tuesday', value: 'Tuesday' },
  { title: 'Wednesday', value: 'Wednesday' },
  { title: 'Thursday', value: 'Thursday' },
  { title: 'Friday', value: 'Friday' },
  { title: 'Saturday', value: 'Saturday' },
  { title: 'Sunday', value: 'Sunday' },
]

export const openingPeriod = defineType({
  name: 'openingPeriod',
  title: 'Opening Period',
  type: 'object',
  fields: [
    defineField({
      name: 'days',
      title: 'Days',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: DAY_OPTIONS, layout: 'grid' },
      validation: (R) => R.required().min(1),
    }),
    defineField({ name: 'open', title: 'Opens', type: 'string', description: 'e.g. 12:00', validation: (R) => R.required() }),
    defineField({ name: 'close', title: 'Closes', type: 'string', description: 'e.g. 22:00', validation: (R) => R.required() }),
  ],
  preview: {
    select: { days: 'days', open: 'open', close: 'close' },
    prepare({ days, open, close }) {
      const d = (days as string[] | undefined)?.join(', ') ?? ''
      return { title: `${open} – ${close}`, subtitle: d }
    },
  },
})
