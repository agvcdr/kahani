import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { SITE_SETTINGS } from '@/lib/sanity/queries'
import type { SanitySiteSettings } from '@/types/sanity'

export const revalidate = 3600
export const metadata: Metadata = { title: 'About' }

export default async function AboutPage() {
  const settings = await publicClient.fetch<SanitySiteSettings>(SITE_SETTINGS)

  return (
    <div className="about-page">
      <div className="about-page__hero">
        <h1 className="about-page__title">About Kahani</h1>
      </div>
      <div className="container about-page__body">
        {settings?.description && (
          <p className="about-page__description">{settings.description}</p>
        )}
        {settings?.awards?.length ? (
          <section className="about-awards" aria-labelledby="awards-heading">
            <h2 id="awards-heading" className="section-heading">Awards & Recognition</h2>
            <ul className="awards-list">
              {settings.awards.map((a, i) => (
                <li key={i} className="awards-list__item">
                  <strong>{a.title}</strong>{a.body ? ` — ${a.body}` : ''}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {settings?.cuisine && (
          <section className="about-cuisine">
            <h2 className="section-heading">Our Cuisine</h2>
            <p>{settings.cuisine}</p>
          </section>
        )}
      </div>
    </div>
  )
}
