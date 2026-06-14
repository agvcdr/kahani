'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { HeroImage } from '@/lib/images/hero'

const ROTATE_MS = 5000

/** Cross-fading full-bleed background image stack for the homepage hero.
 *  Decorative (aria-hidden): the hero headline carries the accessible content.
 *  First slide is `priority` (LCP); the rest lazy-load. Freezes on slide 0 under
 *  prefers-reduced-motion. */
export function HeroCarousel({ images }: { images: HeroImage[] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (images.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setActive(i => (i + 1) % images.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [images.length])

  if (!images.length) return null

  return (
    <div className="hero-carousel" aria-hidden="true">
      {images.map((img, i) => (
        <div key={img.url} className={`hero-carousel__slide${i === active ? ' is-active' : ''}`}>
          <Image
            src={img.url}
            alt={img.alt}
            fill
            sizes="100vw"
            priority={i === 0}
            className="hero-carousel__img"
          />
        </div>
      ))}
    </div>
  )
}
