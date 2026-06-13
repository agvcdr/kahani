import { defineType, defineField, defineArrayMember } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'restaurant', title: 'Restaurant', default: true },
    { name: 'hours', title: 'Opening Hours' },
    { name: 'location', title: 'Location' },
    { name: 'contact', title: 'Contact & Social' },
    { name: 'services', title: 'Services & Links' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Restaurant
    defineField({ name: 'name', title: 'Restaurant Name', type: 'string', group: 'restaurant', validation: (R) => R.required() }),
    defineField({ name: 'shortName', title: 'Short Name', type: 'string', group: 'restaurant' }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', group: 'restaurant' }),
    defineField({ name: 'cuisine', title: 'Cuisine', type: 'string', group: 'restaurant' }),
    defineField({ name: 'description', title: 'About', type: 'text', group: 'restaurant', rows: 5 }),
    defineField({
      name: 'awards',
      title: 'Awards',
      type: 'array',
      group: 'restaurant',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Award Title' }),
            defineField({ name: 'body', type: 'string', title: 'Details' }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),
    defineField({
      name: 'heroImages',
      title: 'Hero Images',
      description: 'Curated full-bleed homepage hero photos. Falls back to featured dishes, then stock, when empty.',
      type: 'array',
      group: 'restaurant',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })] })],
    }),
    defineField({ name: 'allergenNotice', title: 'Allergen Notice', type: 'text', group: 'restaurant', rows: 3 }),

    // Hours
    defineField({ name: 'timezone', title: 'Timezone', type: 'string', group: 'hours', initialValue: 'Europe/London' }),
    defineField({
      name: 'regularHours',
      title: 'Regular Hours',
      type: 'array',
      group: 'hours',
      of: [{ type: 'openingPeriod' }],
    }),
    defineField({
      name: 'holidayHours',
      title: 'Holiday Hours',
      type: 'array',
      group: 'hours',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'date', type: 'date', title: 'Date' }),
            defineField({ name: 'label', type: 'string', title: 'Label', description: 'e.g. Christmas Day' }),
            defineField({ name: 'open', type: 'string', title: 'Opens' }),
            defineField({ name: 'close', type: 'string', title: 'Closes' }),
            defineField({ name: 'closed', type: 'boolean', title: 'Closed All Day', initialValue: false }),
          ],
          preview: { select: { title: 'label', subtitle: 'date' } },
        }),
      ],
    }),
    defineField({
      name: 'closureNotices',
      title: 'Closure Notices',
      type: 'array',
      group: 'hours',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'from', type: 'date', title: 'From' }),
            defineField({ name: 'to', type: 'date', title: 'To' }),
            defineField({ name: 'message', type: 'string', title: 'Message' }),
          ],
          preview: { select: { title: 'message' } },
        }),
      ],
    }),
    defineField({
      name: 'hoursNotes',
      title: 'Hours Notes',
      type: 'array',
      group: 'hours',
      of: [{ type: 'string' }],
      description: 'Additional notes shown alongside hours (e.g. "Last orders 30 mins before closing")',
    }),

    // Location
    defineField({ name: 'address', title: 'Address', type: 'address', group: 'location' }),
    defineField({ name: 'neighbourhood', title: 'Neighbourhood', type: 'string', group: 'location' }),
    defineField({
      name: 'nearbyLandmarks',
      title: 'Nearby Landmarks',
      type: 'array',
      group: 'location',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'mapUrl', title: 'Google Maps URL', type: 'url', group: 'location' }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'object',
      group: 'location',
      fields: [
        defineField({ name: 'lat', title: 'Latitude', type: 'number' }),
        defineField({ name: 'lng', title: 'Longitude', type: 'number' }),
      ],
    }),

    // Contact
    defineField({ name: 'phone', title: 'Phone', type: 'string', group: 'contact' }),
    defineField({ name: 'email', title: 'Email', type: 'string', group: 'contact' }),
    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'array',
      group: 'contact',
      of: [{ type: 'socialLink' }],
    }),

    // Services
    defineField({ name: 'onlineOrderingUrl', title: 'Online Ordering URL', type: 'url', group: 'services' }),
    defineField({ name: 'bookTableUrl', title: 'Book a Table URL', type: 'url', group: 'services' }),
    defineField({ name: 'giftVouchersUrl', title: 'Gift Vouchers URL', type: 'url', group: 'services' }),

    // SEO
    defineField({ name: 'seoTitleTemplate', title: 'Title Template', type: 'string', group: 'seo', description: 'Use %s for page title, e.g. %s | Kahani Indian Street Food Edinburgh' }),
    defineField({ name: 'seoDefaultDescription', title: 'Default Meta Description', type: 'text', group: 'seo', rows: 3 }),
    defineField({
      name: 'seoKeywords',
      title: 'Keywords',
      type: 'array',
      group: 'seo',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'seoOgImage', title: 'Default Social Image', type: 'image', group: 'seo', options: { hotspot: true } }),
  ],
  preview: {
    select: { name: 'name' },
    prepare({ name }) {
      return { title: name ?? 'Site Settings' }
    },
  },
})
