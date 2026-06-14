import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { SITE_SETTINGS, GALLERY_IMAGES } from '@/lib/sanity/queries'
import type { SanitySiteSettings, SanityGalleryImage } from '@/types/sanity'
import { GALLERY_FALLBACK_IMAGES } from '@/lib/images/fallbacks'
import { HeroCarousel } from '@/components/sections/HeroCarousel'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { resolveHeroImages } from '@/lib/images/hero'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Gallery' }

export default async function GalleryPage() {
  const [settings, raw] = await Promise.all([
    publicClient.fetch<SanitySiteSettings | null>(SITE_SETTINGS),
    publicClient.fetch<SanityGalleryImage[]>(GALLERY_IMAGES),
  ])

  const images = raw?.length ? raw : GALLERY_FALLBACK_IMAGES
  const heroImages = resolveHeroImages(settings, undefined)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="hero gallery-hero" aria-labelledby="gallery-hero-heading">
        <HeroCarousel images={heroImages} />
        <div className="hero__scrim" aria-hidden="true" />
        <div className="hero__frame" aria-hidden="true">
          <span className="hero__corner hero__corner--tl" />
          <span className="hero__corner hero__corner--tr" />
          <span className="hero__corner hero__corner--bl" />
          <span className="hero__corner hero__corner--br" />
          <span className="hero__diamond hero__diamond--top" />
          <span className="hero__diamond hero__diamond--bottom" />
        </div>
        <div className="hero__inner">
          <p className="hero__eyebrow">Edinburgh · Indian Street Food</p>
          <h1 id="gallery-hero-heading" className="hero__title">
            The Kahani <span className="hero__title-accent">Story</span>
          </h1>
        </div>
      </section>

      {/* ── Gallery grid ─────────────────────────────────────────── */}
      <section className="gallery-page" aria-labelledby="gallery-section-heading">
        <div className="container">
          <h2 id="gallery-section-heading" className="sr-only">Gallery</h2>
          <GalleryGrid images={images} />
        </div>
      </section>
    </>
  )
}
