import Link from 'next/link'
import { publicClient } from '@/lib/sanity/client'
import { SITE_SETTINGS, FEATURED_MENU_ITEMS } from '@/lib/sanity/queries'
import type { SanitySiteSettings, SanityMenuItem } from '@/types/sanity'
import { FeaturedCarousel } from '@/components/menu/FeaturedCarousel'
import { HoursAndLocation } from '@/components/sections/HoursAndLocation'
import { HeroCarousel } from '@/components/sections/HeroCarousel'
import { DiamondHeading } from '@/components/sections/DiamondHeading'
import { resolveHeroImages } from '@/lib/images/hero'

export const revalidate = 3600

export default async function HomePage() {
  const [settings, featured] = await Promise.all([
    publicClient.fetch<SanitySiteSettings>(SITE_SETTINGS),
    publicClient.fetch<SanityMenuItem[]>(FEATURED_MENU_ITEMS),
  ])

  const heroImages = resolveHeroImages(settings, featured)

  return (
    <>
      <section className="hero" aria-labelledby="hero-heading">
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
          <p className="hero__eyebrow">Award-winning · Edinburgh</p>
          <h1 id="hero-heading" className="hero__title">
            Every plate has a <span className="hero__title-accent">story</span>
          </h1>
          <div className="hero__actions">
            <Link href="/menu" className="btn btn--primary">Our Menu</Link>
            {settings?.bookTableUrl && (
              <a href={settings.bookTableUrl} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                Book a Table
              </a>
            )}
          </div>
        </div>
      </section>

      {featured?.length > 0 && (
        <section className="featured-section" aria-labelledby="featured-heading">
          <div className="container">
            <DiamondHeading id="featured-heading">Chef&apos;s Selection</DiamondHeading>
          </div>
          <FeaturedCarousel items={featured} />
          <div className="container">
            <div className="featured-section__cta">
              <Link href="/menu" className="btn btn--outline">Full Menu</Link>
            </div>
          </div>
        </section>
      )}

      {settings && <HoursAndLocation settings={settings} />}

      {(settings?.bookTableUrl || settings?.onlineOrderingUrl || settings?.phone) && (
        <section className="contact-actions" aria-labelledby="contact-actions-heading">
          <div className="container">
            <DiamondHeading id="contact-actions-heading">Ready to Visit?</DiamondHeading>
            <div className="contact-actions__grid">
              {settings.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="contact-card">
                  <span className="contact-card__icon" aria-hidden="true">📞</span>
                  <span className="contact-card__label">Call Us</span>
                  <span className="contact-card__value">{settings.phone}</span>
                </a>
              )}
              {settings.bookTableUrl && (
                <a href={settings.bookTableUrl} className="contact-card" target="_blank" rel="noopener noreferrer">
                  <span className="contact-card__icon" aria-hidden="true">🗓️</span>
                  <span className="contact-card__label">Book a Table</span>
                </a>
              )}
              {settings.onlineOrderingUrl && (
                <a href={settings.onlineOrderingUrl} className="contact-card" target="_blank" rel="noopener noreferrer">
                  <span className="contact-card__icon" aria-hidden="true">🛍️</span>
                  <span className="contact-card__label">Order Online</span>
                </a>
              )}
              {settings.mapUrl ? (
                <a href={settings.mapUrl} className="contact-card" target="_blank" rel="noopener noreferrer">
                  <span className="contact-card__icon" aria-hidden="true">📍</span>
                  <span className="contact-card__label">Get Directions</span>
                  {settings.address && <span className="contact-card__value">{settings.address.line1}, {settings.address.postcode}</span>}
                </a>
              ) : null}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
