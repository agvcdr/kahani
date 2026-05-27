'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { SanitySiteSettings } from '@/types/sanity'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Find Us' },
]

export function SiteNav({ settings }: { settings: SanitySiteSettings | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <Link href="/" className="site-nav__logo" aria-label="Kahani — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/kahani-logo-horizontal.svg" alt="Kahani Indian Street Food" className="site-nav__logo-img" height={44} width={264} />
        </Link>

        <button
          className={`site-nav__burger${open ? ' site-nav__burger--open' : ''}`}
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(v => !v)}
        >
          <span /><span /><span />
        </button>

        <nav id="main-nav" className={`site-nav__links${open ? ' site-nav__links--open' : ''}`} aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`site-nav__link${pathname === href || (href !== '/' && pathname.startsWith(href)) ? ' site-nav__link--active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          {settings?.bookTableUrl && (
            <a href={settings.bookTableUrl} className="site-nav__cta" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              Book a Table
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
