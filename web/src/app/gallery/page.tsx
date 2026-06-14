import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { GALLERY_IMAGES } from '@/lib/sanity/queries'
import type { SanityGalleryImage } from '@/types/sanity'
import { GALLERY_FALLBACK_IMAGES } from '@/lib/images/fallbacks'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Gallery' }

export default async function GalleryPage() {
  const raw = await publicClient.fetch<SanityGalleryImage[]>(GALLERY_IMAGES)
  const images = raw?.length ? raw : GALLERY_FALLBACK_IMAGES

  return (
    <>
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="gallery-page__hero">
        <div className="container">
          <h1 className="gallery-page__title">Gallery</h1>
        </div>
      </div>

      {/* ── Gallery grid ─────────────────────────────────────────── */}
      <section className="gallery-page" aria-label="Photo gallery">
        <div className="container">
          <GalleryGrid images={images} />
        </div>
      </section>
    </>
  )
}
