import { defineType, defineField } from 'sanity'

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social Link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Facebook', value: 'facebook' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'TripAdvisor', value: 'tripadvisor' },
          { title: 'Yelp', value: 'yelp' },
          { title: 'X / Twitter', value: 'twitter' },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'handle', title: 'Handle', type: 'string', description: 'e.g. @kahanistreetfood' }),
    defineField({ name: 'url', title: 'URL', type: 'url', validation: (R) => R.required() }),
  ],
  preview: {
    select: { platform: 'platform', handle: 'handle' },
    prepare({ platform, handle }) {
      return { title: platform, subtitle: handle }
    },
  },
})
