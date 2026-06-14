'use client'

import { useState } from 'react'
import type { SanityGalleryImage } from '@/types/sanity'
import { GalleryFilterChips } from './GalleryFilterChips'
import { GalleryTile } from './GalleryTile'

type Category = 'food' | 'interior' | 'events'
type Filter = 'all' | Category

export function GalleryGrid({ images }: { images: SanityGalleryImage[] }) {
  const [active, setActive] = useState<Filter>('all')

  const available = new Set(images.map(i => i.category as Category))
  const visible = active === 'all' ? images : images.filter(i => i.category === active)
  const count = visible.length

  return (
    <div className="gallery-grid">
      <GalleryFilterChips available={available} active={active} onChange={setActive} />
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Showing ${count} ${count === 1 ? 'photo' : 'photos'}${active !== 'all' ? ` in ${active}` : ''}`}
      </div>
      {visible.length === 0 ? (
        <p className="gallery-grid__empty">No photos yet — check back soon.</p>
      ) : (
        <div className="gallery-masonry">
          {visible.map((item) => (
            <GalleryTile key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
