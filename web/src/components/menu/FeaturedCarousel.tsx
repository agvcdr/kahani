'use client'
import { useRef } from 'react'
import type { SanityMenuItem } from '@/types/sanity'
import { DietaryBadge } from './DietaryBadge'
import { PriceBadge } from './PriceBadge'

export function FeaturedCarousel({ items }: { items: SanityMenuItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'prev' | 'next') {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('.featured-card')
    const gap = 16
    const step = (card?.offsetWidth ?? 280) + gap
    track.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' })
  }

  return (
    <div className="featured-carousel-wrap">
      <button
        className="featured-carousel__btn featured-carousel__btn--prev"
        onClick={() => scroll('prev')}
        aria-label="Previous"
      >
        &#8249;
      </button>

      <div className="featured-carousel" ref={trackRef} role="list">
        {items.map(item => (
          <article key={item.id} className="featured-card" role="listitem">
            <div className="featured-card__img" aria-hidden="true">
              {item.image?.url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.image.url} alt={item.image.alt ?? item.name} loading="lazy" />
                : <div className="featured-card__img-placeholder" />
              }
            </div>
            <div className="featured-card__body">
              <h3 className="featured-card__name">
                <span className="featured-card__diamond" aria-hidden="true">◆</span>
                {item.name}
              </h3>
              <div className="featured-card__meta">
                <DietaryBadge dietary={item.dietary} />
              </div>
              {item.description && (
                <p className="featured-card__desc">{item.description}</p>
              )}
              <div className="featured-card__price">
                <PriceBadge prices={item.prices} priceOnRequest={item.priceOnRequest} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <button
        className="featured-carousel__btn featured-carousel__btn--next"
        onClick={() => scroll('next')}
        aria-label="Next"
      >
        &#8250;
      </button>
    </div>
  )
}
