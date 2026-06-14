import Image from 'next/image'
import type { SanityGalleryImage } from '@/types/sanity'

export function GalleryTile({ item }: { item: SanityGalleryImage }) {
  return (
    <div className={`gallery-tile${item.featured ? ' gallery-tile--featured' : ''}`}>
      <div className="gallery-tile__media">
        <Image
          src={item.image.url}
          alt={item.image.alt}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
          className="gallery-tile__img"
        />
      </div>
      <span className="gallery-tile__badge">{item.category}</span>
      {item.caption && (
        <div className="gallery-tile__caption">
          <span>{item.caption}</span>
        </div>
      )}
    </div>
  )
}
