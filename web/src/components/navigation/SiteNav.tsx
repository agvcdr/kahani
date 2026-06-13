'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { SanitySiteSettings } from '@/types/sanity'
import { NAV_LINKS, secondaryActions } from '@/lib/nav/links'

export function SiteNav({ settings }: { settings: SanitySiteSettings | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  const secondary = secondaryActions(settings ?? {})
  const phone = settings?.phone
  const address = settings?.address

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    const first = panelRef.current?.querySelector<HTMLElement>('a, button')
    first?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open) {
      wasOpen.current = true
    } else if (wasOpen.current) {
      toggleRef.current?.focus()
      wasOpen.current = false
    }
  }, [open])

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>('a, button')
    if (!focusables?.length) return
    const list = Array.from(focusables)
    const firstEl = list[0]
    const lastEl = list[list.length - 1]
    if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus() }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus() }
  }

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/" className="site-header__logo" aria-label="Kahani — home" onClick={() => setOpen(false)}>
          Kahani
        </Link>

        <div className="site-header__right">
          <Link href="/menu" className="site-header__menu-link">Menu</Link>
          {settings?.bookTableUrl && (
            <a href={settings.bookTableUrl} className="site-header__book" target="_blank" rel="noopener noreferrer">
              Book a Table
            </a>
          )}
          <button
            ref={toggleRef}
            className={`site-header__toggle${open ? ' is-open' : ''}`}
            aria-expanded={open}
            aria-controls="site-overlay"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(v => !v)}
          >
            <span className="site-header__bars"><span /><span /><span /></span>
            <span className="site-header__toggle-label">{open ? 'Close' : 'Open'}</span>
          </button>
        </div>
      </div>

      <div
        className={`site-overlay${open ? ' is-open' : ''}`}
        id="site-overlay"
        hidden={!open}
        onClick={() => setOpen(false)}
      >
        <div
          ref={panelRef}
          className="site-overlay__panel"
          role="navigation"
          aria-label="Site navigation"
          onClick={e => e.stopPropagation()}
          onKeyDown={onPanelKeyDown}
        >
          <ul className="site-overlay__links">
            {NAV_LINKS.map(({ href, label }, i) => (
              <li key={href} style={{ '--i': i } as React.CSSProperties}>
                <Link
                  href={href}
                  className={`site-overlay__link${pathname === href || (href !== '/' && pathname.startsWith(href)) ? ' is-active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {secondary.length > 0 && (
            <>
              <div className="site-overlay__rule" />
              <div className="site-overlay__secondary">
                {secondary.map(({ href, label }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                    {label}
                  </a>
                ))}
              </div>
            </>
          )}

          {(address || phone) && (
            <p className="site-overlay__contact">
              {address && <span>{address.line1}, {address.city}</span>}
              {phone && <> · <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a></>}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
