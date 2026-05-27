import Link from 'next/link'
import type { SanitySiteSettings } from '@/types/sanity'

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tripadvisor: 'TripAdvisor',
  yelp: 'Yelp',
}

function formatHours(periods: SanitySiteSettings['regularHours']) {
  if (!periods?.length) return null
  return periods.map((p, i) => (
    <li key={i}><span className="footer__days">{p.days.join(', ')}</span> {p.open}–{p.close}</li>
  ))
}

export function SiteFooter({ settings }: { settings: SanitySiteSettings | null }) {
  if (!settings) return null
  const { address, phone, social, regularHours, allergenNotice, onlineOrderingUrl, bookTableUrl } = settings

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__wordmark">KAHANI</p>
          <p className="site-footer__tagline">Indian Street Food</p>
          {social?.length && (
            <nav className="site-footer__social" aria-label="Social media links">
              {social.map(s => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="site-footer__social-link">
                  {SOCIAL_LABELS[s.platform] ?? s.platform}
                </a>
              ))}
            </nav>
          )}
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__heading">Visit Us</h3>
          {address && (
            <address className="site-footer__address">
              {address.line1}<br />
              {address.city}, {address.postcode}
            </address>
          )}
          {phone && <a href={`tel:${phone.replace(/\s/g, '')}`} className="site-footer__phone">{phone}</a>}
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__heading">Opening Hours</h3>
          {regularHours?.length ? (
            <ul className="site-footer__hours">{formatHours(regularHours)}</ul>
          ) : null}
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__heading">Quick Links</h3>
          <nav aria-label="Footer navigation">
            <ul className="site-footer__links">
              <li><Link href="/menu">Menu</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Find Us</Link></li>
              {bookTableUrl && <li><a href={bookTableUrl} target="_blank" rel="noopener noreferrer">Book a Table</a></li>}
              {onlineOrderingUrl && <li><a href={onlineOrderingUrl} target="_blank" rel="noopener noreferrer">Order Online</a></li>}
            </ul>
          </nav>
        </div>
      </div>

      {allergenNotice && (
        <div className="site-footer__allergen">
          <p>{allergenNotice}</p>
        </div>
      )}

      <div className="site-footer__legal">
        <p>© {new Date().getFullYear()} {settings.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
