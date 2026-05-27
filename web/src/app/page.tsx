import Link from 'next/link'
import { publicClient } from '@/lib/sanity/client'
import { SITE_SETTINGS, FEATURED_MENU_ITEMS } from '@/lib/sanity/queries'
import type { SanitySiteSettings, SanityMenuItem } from '@/types/sanity'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { HoursAndLocation } from '@/components/sections/HoursAndLocation'

export const revalidate = 3600

export default async function HomePage() {
  const [settings, featured] = await Promise.all([
    publicClient.fetch<SanitySiteSettings>(SITE_SETTINGS),
    publicClient.fetch<SanityMenuItem[]>(FEATURED_MENU_ITEMS),
  ])

  return (
    <>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__inner">
          <p className="hero__eyebrow">{settings?.tagline ?? 'Indian Street Food'}</p>
          <h1 id="hero-heading" className="hero__title">{settings?.shortName ?? 'Kahani'}</h1>
          {settings?.awards?.[0] && (
            <p className="hero__award">🏆 {settings.awards[0].title} — {settings.awards[0].body}</p>
          )}
          <div className="hero__actions">
            <Link href="/menu" className="btn btn--primary">View Menu</Link>
            {settings?.bookTableUrl && (
              <a href={settings.bookTableUrl} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">Book a Table</a>
            )}
            {settings?.onlineOrderingUrl && (
              <a href={settings.onlineOrderingUrl} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">Order Online</a>
            )}
          </div>
        </div>
      </section>

      {featured?.length > 0 && (
        <section className="featured-section" aria-labelledby="featured-heading">
          <div className="container">
            <h2 id="featured-heading" className="section-heading section-heading--center">Chef's Recommendations</h2>
            <ul className="menu-grid" role="list">
              {featured.map(item => (
                <li key={item.id}><MenuItemCard item={item} /></li>
              ))}
            </ul>
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
            <h2 id="contact-actions-heading" className="section-heading section-heading--center">Ready to Visit?</h2>
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
