import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import * as schemas from './src/schemas'
import { deskStructure } from './src/structure/deskStructure'

export default defineConfig({
  name: 'kahani',
  title: 'Kahani',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',

  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(),
  ],

  schema: {
    types: Object.values(schemas),
  },
})
