import { defineType, defineField } from 'sanity'

export const address = defineType({
  name: 'address',
  title: 'Address',
  type: 'object',
  fields: [
    defineField({ name: 'line1', title: 'Street', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'line2', title: 'Line 2', type: 'string' }),
    defineField({ name: 'city', title: 'City', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'postcode', title: 'Postcode', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'country', title: 'Country', type: 'string', initialValue: 'Scotland, United Kingdom' }),
    defineField({ name: 'countryCode', title: 'Country Code', type: 'string', initialValue: 'GB' }),
  ],
})
