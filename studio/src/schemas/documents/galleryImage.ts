import { defineType, defineField } from 'sanity'

export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (R) => R.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (R) => R.required().error('Alt text is required for accessibility'),
        }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Food', value: 'food' },
          { title: 'Interior', value: 'interior' },
          { title: 'Events', value: 'events' },
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Short label shown on the tile (e.g. a dish name). Optional.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured (hero tile)',
      type: 'boolean',
      description: 'Promotes this tile to a larger display size in the gallery grid.',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first. Leave blank to use upload order.',
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }, { field: '_createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'caption', subtitle: 'category', media: 'image' },
    prepare({ title, subtitle, media }) {
      return {
        title: title ?? '(no caption)',
        subtitle: subtitle ?? 'uncategorised',
        media,
      }
    },
  },
})
