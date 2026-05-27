import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import * as schemas from '../studio/src/schemas'
import { deskStructure } from '../studio/src/structure/deskStructure'

export default defineConfig({
  name: 'kahani',
  title: 'Kahani',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [
    structureTool({ structure: deskStructure }),
  ],
  schema: { types: Object.values(schemas) },
  basePath: '/studio',
})
