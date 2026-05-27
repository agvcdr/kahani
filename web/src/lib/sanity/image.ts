import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { publicClient } from './client'

const builder = imageUrlBuilder(publicClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
