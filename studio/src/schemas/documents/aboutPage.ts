import { defineType, defineField, defineArrayMember } from 'sanity'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'intro',
      title: 'Intro Statement',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown directly after the hero. Optional.',
    }),
    defineField({
      name: 'chapters',
      title: 'Story Chapters',
      type: 'array',
      description: 'Each chapter is an editorial image + text split. Chapters with no title are skipped.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Chapter Title', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'eyebrow', title: 'Eyebrow (e.g. "Chapter One")', type: 'string' }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 5,
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  validation: (R) => R.custom((alt, ctx) => {
                    if ((ctx.parent as { asset?: unknown })?.asset && !alt) return 'Alt text is required when an image is set'
                    return true
                  }),
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title', eyebrow: 'eyebrow', media: 'image' },
            prepare({ title, eyebrow, media }) {
              return { title: title ?? '(untitled chapter)', subtitle: eyebrow, media }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About Page' }
    },
  },
})
