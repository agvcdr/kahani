import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { SITE_SETTINGS } from '@/lib/sanity/queries'
import type { SanitySiteSettings } from '@/types/sanity'
import { HoursAndLocation } from '@/components/sections/HoursAndLocation'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Find Us' }

export default async function ContactPage() {
  const settings = await publicClient.fetch<SanitySiteSettings>(SITE_SETTINGS)

  return (
    <div className="contact-page">
      <div className="contact-page__hero">
        <div className="container">
          <h1 className="contact-page__title">Find Us</h1>
        </div>
      </div>
      <div className="container contact-page__body">
        {settings && <HoursAndLocation settings={settings} />}

        <section className="contact-actions" aria-labelledby="contact-ctas">
          <h2 id="contact-ctas" className="section-heading">Get in Touch</h2>
          <div className="contact-actions__grid">
            {settings?.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="contact-card">
                <span className="contact-card__icon" aria-hidden="true">📞</span>
                <span className="contact-card__label">Call Us</span>
                <span className="contact-card__value">{settings.phone}</span>
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="contact-card">
                <span className="contact-card__icon" aria-hidden="true">✉️</span>
                <span className="contact-card__label">Email Us</span>
                <span className="contact-card__value">{settings.email}</span>
              </a>
            )}
            {settings?.bookTableUrl && (
              <a href={settings.bookTableUrl} className="contact-card" target="_blank" rel="noopener noreferrer">
                <span className="contact-card__icon" aria-hidden="true">🗓️</span>
                <span className="contact-card__label">Book a Table</span>
              </a>
            )}
            {settings?.onlineOrderingUrl && (
              <a href={settings.onlineOrderingUrl} className="contact-card" target="_blank" rel="noopener noreferrer">
                <span className="contact-card__icon" aria-hidden="true">🛍️</span>
                <span className="contact-card__label">Order Online</span>
              </a>
            )}
          </div>
        </section>

        {settings?.social?.length ? (
          <section className="contact-social" aria-labelledby="social-heading">
            <h2 id="social-heading" className="section-heading">Follow Us</h2>
            <div className="contact-social__links">
              {settings.social.map(s => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="social-btn">
                  {s.handle ?? s.platform}
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
