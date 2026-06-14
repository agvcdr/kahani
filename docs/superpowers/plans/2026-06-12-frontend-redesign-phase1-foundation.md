# Kahani Frontend Redesign — Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the "Saffron Fire" design tokens, swap the type system to Marcellus + Karla, replace the horizontal nav with the site-wide translucent dropdown, and recolour the footer — the shared foundation every other phase builds on.

**Architecture:** Presentation-only changes on the existing Next.js (App Router) + Sanity site. Design tokens are redefined in `globals.css` with temporary backward-compatible aliases so not-yet-restyled pages keep rendering coherently between phases. The nav becomes a single client component used site-wide, with a persistent minimal header plus an accessible dropdown overlay. A Vitest + React Testing Library harness is introduced so the nav's interactive behavior is built test-first; CSS/token/font changes are gated by typecheck, production build, and a manual checklist.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `next/font/google`, plain CSS with custom properties, Vitest + @testing-library/react + jsdom + @testing-library/user-event.

**Source spec:** `docs/superpowers/specs/2026-06-11-frontend-redesign-design.md`
**Worktree:** `/Users/ag/Workspace/kahani-redesign` (branch `feat/frontend-redesign`). All paths below are relative to `web/` unless noted.

---

## File Structure

**Created:**
- `web/vitest.config.ts` — Vitest config (jsdom env, setup file, `@vitejs/plugin-react`, `@` alias).
- `web/vitest.setup.ts` — imports `@testing-library/jest-dom` matchers.
- `web/src/components/navigation/SiteNav.test.tsx` — behavior tests for the dropdown nav.
- `web/src/lib/nav/links.ts` — the nav link list + secondary-action assembly (pure, importable by tests and the component).
- `web/src/lib/nav/links.test.ts` — unit tests for the secondary-action assembly + graceful hiding.

**Modified:**
- `web/package.json` — add `test` / `test:run` scripts and dev dependencies.
- `web/src/app/globals.css` — replace `:root` tokens (Saffron Fire + legacy aliases + font stacks); replace the `/* Navigation */` block with header + overlay styles; recolour the `/* Footer */` block.
- `web/src/app/layout.tsx` — swap Playfair/Montserrat for Marcellus/Karla.
- `web/src/components/navigation/SiteNav.tsx` — rebuilt as the translucent dropdown nav.

**Untouched this phase** (restyled in later phases, kept working via legacy aliases): `page.tsx`, all `menu/**`, `about/page.tsx`, `contact/page.tsx`, `SiteFooter.tsx` markup (CSS-only recolour).

---

## Task 1: Add the Vitest + React Testing Library harness

**Files:**
- Create: `web/vitest.config.ts`
- Create: `web/vitest.setup.ts`
- Modify: `web/package.json`
- Create: `web/src/lib/nav/links.ts`
- Test: `web/src/lib/nav/links.test.ts`

- [ ] **Step 1: Install dev dependencies**

Run from `web/`:
```bash
npm install -D vitest@^2 jsdom@^25 @testing-library/react@^16 @testing-library/dom@^10 @testing-library/jest-dom@^6 @testing-library/user-event@^14 @vitejs/plugin-react@^4
```
Expected: packages added under `devDependencies`, no peer-dependency errors (React 19 is supported by `@testing-library/react@16`).

- [ ] **Step 2: Add test scripts to `package.json`**

In `web/package.json`, add to the `"scripts"` block (alongside the existing `dev`/`build`/`lint`/`typecheck`):
```json
    "test": "vitest",
    "test:run": "vitest run"
```

- [ ] **Step 3: Create the Vitest config**

Create `web/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

- [ ] **Step 4: Create the Vitest setup file**

Create `web/vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 5: Write a failing unit test for the nav link assembly**

Create `web/src/lib/nav/links.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { NAV_LINKS, secondaryActions } from './links'

describe('NAV_LINKS', () => {
  it('lists the five site sections in order', () => {
    expect(NAV_LINKS.map(l => l.label)).toEqual(['Home', 'Menu', 'About', 'Gallery', 'Find Us'])
  })
})

describe('secondaryActions', () => {
  it('includes only actions whose URL is present', () => {
    const actions = secondaryActions({ bookTableUrl: 'https://book', giftVouchersUrl: null, onlineOrderingUrl: 'https://order' })
    expect(actions.map(a => a.label)).toEqual(['Book a Table', 'Order Online'])
    expect(actions[0].href).toBe('https://book')
  })

  it('returns an empty list when no URLs are set', () => {
    expect(secondaryActions({})).toEqual([])
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm run test:run -- src/lib/nav/links.test.ts`
Expected: FAIL — cannot resolve `./links` (module not yet created).

- [ ] **Step 7: Implement the nav links module**

Create `web/src/lib/nav/links.ts`:
```ts
export interface NavLink {
  href: string
  label: string
}

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Find Us' },
]

interface SecondarySource {
  bookTableUrl?: string | null
  onlineOrderingUrl?: string | null
  giftVouchersUrl?: string | null
}

export function secondaryActions(s: SecondarySource): NavLink[] {
  return [
    { href: s.bookTableUrl, label: 'Book a Table' },
    { href: s.onlineOrderingUrl, label: 'Order Online' },
    { href: s.giftVouchersUrl, label: 'Gift Vouchers' },
  ].filter((a): a is NavLink => Boolean(a.href))
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm run test:run -- src/lib/nav/links.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 9: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/package.json web/package-lock.json web/vitest.config.ts web/vitest.setup.ts web/src/lib/nav/links.ts web/src/lib/nav/links.test.ts
git commit -m "test(web): add vitest+RTL harness and nav link assembly"
```

---

## Task 2: Replace design tokens with "Saffron Fire" (+ legacy aliases)

**Files:**
- Modify: `web/src/app/globals.css:1-28` (the `:root` block)

- [ ] **Step 1: Replace the `:root` token block**

In `web/src/app/globals.css`, replace lines 1–28 (the `/* Design tokens */` comment through the closing `}` of `:root`) with:
```css
/* ── Design tokens ─────────────────────────────────────────────────── */
:root {
  /* Saffron Fire palette (see design spec) */
  --color-saffron:     #FF8C00; /* fills only + text on dark */
  --color-saffron-ink: #A8500A; /* saffron-toned TEXT on cream (passes AA) */
  --color-amber:       #FFB347; /* accents on dark only */
  --color-scrim:       #1E0800;
  --color-scrim-deep:  #281000;
  --color-cream:       #FFF8F0;
  --color-cream-bg:    #FBEFE0;
  --color-ink:         #1C0800;
  --color-ink-muted:   #8A5C2E;
  --color-white:       #FFFFFF;
  --color-border:      #EFE0CC;

  /* Temporary legacy aliases — map old token names onto the new palette so
     pages not yet restyled keep rendering coherently. Removed per-page as
     each later phase restyles its surfaces. */
  --color-maroon:      var(--color-scrim);
  --color-maroon-dark: var(--color-scrim-deep);
  --color-maroon-mid:  #3A1607;
  --color-gold:        var(--color-saffron);
  --color-warm-gold:   var(--color-amber);
  --color-gold-subtle: rgba(255,140,0,.12);
  --color-text:        var(--color-ink);
  --color-text-muted:  var(--color-ink-muted);

  --font-display: 'Marcellus', Georgia, 'Times New Roman', serif;
  --font-body:    'Karla', Arial, Helvetica, sans-serif;

  --nav-height:  64px;
  --container:   1200px;
  --radius:      14px;
  --radius-sm:   8px;
  --radius-pill: 99px;

  --shadow-sm:    0 1px 4px rgba(0,0,0,.06);
  --shadow-card:  0 4px 20px rgba(0,0,0,.09);
  --shadow-hover: 0 12px 40px rgba(0,0,0,.18);
}
```

- [ ] **Step 2: Verify the build still compiles**

Run from `web/`: `npm run build`
Expected: build succeeds. (Visuals shift warmer/orange via aliases; that is expected and temporary.)

- [ ] **Step 3: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/app/globals.css
git commit -m "feat(web): introduce Saffron Fire tokens with legacy aliases"
```

---

## Task 3: Swap fonts to Marcellus + Karla

**Files:**
- Modify: `web/src/app/layout.tsx:2`, `:10-22`, `:40`

- [ ] **Step 1: Replace the font import**

In `web/src/app/layout.tsx`, change line 2 from:
```ts
import { Playfair_Display, Montserrat } from 'next/font/google'
```
to:
```ts
import { Marcellus, Karla } from 'next/font/google'
```

- [ ] **Step 2: Replace the two font loader constants**

Replace lines 10–22 (the `playfair` and `montserrat` constants) with:
```ts
const marcellus = Marcellus({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-body',
  display: 'swap',
})
```

- [ ] **Step 3: Update the `<html>` className**

On the `<html>` tag (line 40), replace `className={`${playfair.variable} ${montserrat.variable}`}` with:
```tsx
    <html lang="en" className={`${marcellus.variable} ${karla.variable}`}>
```

- [ ] **Step 4: Verify typecheck and build**

Run from `web/`:
```bash
npm run typecheck && npm run build
```
Expected: both succeed; fonts download at build time.

- [ ] **Step 5: Manual check**

Run `npm run dev`, open `http://localhost:3000`. Confirm headings render in Marcellus (a calm inscriptional serif) and body text in Karla. No fake-bold/italic on headings.

- [ ] **Step 6: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/app/layout.tsx
git commit -m "feat(web): swap type system to Marcellus + Karla"
```

---

## Task 4: Build the translucent dropdown nav (test-first)

**Files:**
- Test: `web/src/components/navigation/SiteNav.test.tsx`
- Modify: `web/src/components/navigation/SiteNav.tsx` (full rewrite)

- [ ] **Step 1: Write the failing behavior tests**

Create `web/src/components/navigation/SiteNav.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteNav } from './SiteNav'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

const settings = {
  bookTableUrl: 'https://book.example',
  onlineOrderingUrl: 'https://order.example',
  giftVouchersUrl: null,
  mapUrl: 'https://maps.example',
  phone: '0131 558 1947',
  address: { line1: '10 Antigua Street', city: 'Edinburgh', postcode: 'EH1 3NH' },
} as any

describe('SiteNav', () => {
  beforeEach(() => { document.body.innerHTML = '' })

  it('shows the persistent Menu link and Book a Table without opening the overlay', () => {
    render(<SiteNav settings={settings} />)
    const header = screen.getByRole('banner')
    expect(within(header).getByRole('link', { name: 'Menu' })).toHaveAttribute('href', '/menu')
    expect(within(header).getByRole('link', { name: 'Book a Table' })).toHaveAttribute('href', 'https://book.example')
    // overlay starts closed
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the overlay on toggle and exposes the section links', async () => {
    const user = userEvent.setup()
    render(<SiteNav settings={settings} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    const toggle = screen.getByRole('button', { name: /close menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.getByRole('navigation', { name: /site/i })
    expect(within(panel).getByRole('link', { name: 'Gallery' })).toHaveAttribute('href', '/gallery')
    expect(within(panel).getByRole('link', { name: 'Order Online' })).toHaveAttribute('href', 'https://order.example')
    // Gift Vouchers has no URL, so it must not render
    expect(within(panel).queryByRole('link', { name: 'Gift Vouchers' })).toBeNull()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(<SiteNav settings={settings} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run from `web/`: `npm run test:run -- src/components/navigation/SiteNav.test.tsx`
Expected: FAIL — current `SiteNav` has no persistent Menu link / overlay roles.

- [ ] **Step 3: Rewrite `SiteNav.tsx` as the dropdown nav**

Replace the entire contents of `web/src/components/navigation/SiteNav.tsx` with:
```tsx
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

  const secondary = secondaryActions(settings ?? {})
  const phone = settings?.phone
  const address = settings?.address

  // Esc to close; focus first link on open; restore focus to toggle on close.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    const first = panelRef.current?.querySelector<HTMLElement>('a, button')
    first?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) toggleRef.current?.focus()
  }, [open])

  // Simple focus trap while the overlay is open.
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

      {/* Translucent dim — click to close. No blur, so an animating hero shows through. */}
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
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run from `web/`: `npm run test:run -- src/components/navigation/SiteNav.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Typecheck**

Run from `web/`: `npm run typecheck`
Expected: passes. (If `SanitySiteSettings` lacks `giftVouchersUrl`/`mapUrl` in the type, add them as `?: string | null` in `web/src/types/sanity.ts` — they already exist in the query result.)

- [ ] **Step 6: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/components/navigation/SiteNav.tsx web/src/components/navigation/SiteNav.test.tsx
git commit -m "feat(web): site-wide translucent dropdown nav (test-first)"
```

---

## Task 5: Style the header + overlay

**Files:**
- Modify: `web/src/app/globals.css` (replace the `/* Navigation */` block, lines ~86–138)

- [ ] **Step 1: Replace the navigation CSS block**

In `web/src/app/globals.css`, replace the entire `/* ── Navigation ── */` block (from `.site-nav {` through the closing of its `@media` query, the old lines ~86–138) with:
```css
/* ── Header (persistent minimal bar) ───────────────────────────────── */
.site-header { position: sticky; top: 0; z-index: 100; }
.site-header__bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; max-width: var(--container); margin: 0 auto;
}
.site-header__logo {
  font-family: var(--font-display); font-size: 1.4rem; letter-spacing: .3em;
  text-transform: uppercase; color: var(--color-cream); text-decoration: none;
}
.site-header__right { display: flex; align-items: center; gap: 1rem; }
.site-header__menu-link {
  font-size: .7rem; letter-spacing: .16em; text-transform: uppercase;
  color: var(--color-cream); text-decoration: none;
}
.site-header__menu-link:hover { color: var(--color-amber); }
.site-header__book {
  font-size: .62rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
  background: var(--color-saffron); color: var(--color-scrim);
  padding: .55rem 1.1rem; border-radius: var(--radius-pill); text-decoration: none;
}
.site-header__toggle {
  display: flex; align-items: center; gap: .6rem; background: none; border: none;
  cursor: pointer; padding: .25rem; color: var(--color-cream);
}
.site-header__bars { display: flex; flex-direction: column; gap: 5px; }
.site-header__bars span {
  display: block; width: 26px; height: 2px; background: currentColor; border-radius: 2px;
  transition: transform .3s, opacity .3s;
}
.site-header__toggle.is-open .site-header__bars span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.site-header__toggle.is-open .site-header__bars span:nth-child(2) { opacity: 0; }
.site-header__toggle.is-open .site-header__bars span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.site-header__toggle-label { font-size: .62rem; letter-spacing: .14em; text-transform: uppercase; }

/* ── Overlay (translucent dim + top-right dropdown) ────────────────── */
.site-overlay {
  position: fixed; inset: 0; z-index: 90;
  background: rgba(16,7,0,0.55); /* dim only — NO backdrop-filter, hero keeps showing */
  opacity: 0; pointer-events: none; transition: opacity .45s ease;
}
.site-overlay.is-open { opacity: 1; pointer-events: auto; }
.site-overlay__panel {
  position: absolute; top: 4.5rem; right: 1.5rem; max-width: min(90vw, 28rem);
  text-align: right;
}
.site-overlay__links { list-style: none; }
.site-overlay__link {
  display: inline-block; font-family: var(--font-display);
  font-size: clamp(2rem, 6vw, 3rem); line-height: 1.4; color: var(--color-cream);
  text-decoration: none; transform: translateY(12px); opacity: 0;
  transition: transform .5s cubic-bezier(.2,.7,.2,1), opacity .5s, color .2s;
}
.site-overlay.is-open .site-overlay__link {
  transform: translateY(0); opacity: 1;
  transition-delay: calc(var(--i) * .06s);
}
.site-overlay__link:hover, .site-overlay__link.is-active { color: var(--color-saffron); }
.site-overlay__rule { width: 2.4rem; height: 1px; background: rgba(255,140,0,.6); margin: 1.25rem 0 1rem auto; }
.site-overlay__secondary { display: flex; flex-wrap: wrap; gap: 1.1rem; justify-content: flex-end; }
.site-overlay__secondary a {
  font-size: .62rem; letter-spacing: .14em; text-transform: uppercase;
  color: var(--color-amber); text-decoration: none;
}
.site-overlay__secondary a:hover { color: var(--color-cream); }
.site-overlay__contact { margin-top: 1rem; font-size: .68rem; letter-spacing: .04em; color: rgba(255,248,240,.55); }
.site-overlay__contact a { color: var(--color-amber); text-decoration: none; }

@media (prefers-reduced-motion: reduce) {
  .site-overlay__link { transition-delay: 0s !important; transform: none; }
}
```

- [ ] **Step 2: Verify build and visual**

Run from `web/`: `npm run build` then `npm run dev`.
Open `http://localhost:3000`. Confirm:
- Header shows `Kahani` left; `Menu` link + `Book a Table` + `Open` toggle right.
- Clicking the toggle dims the page (no blur), reveals right-aligned links that cascade in; label switches to `Close` and the bars morph to an ✕.
- Clicking the dim, an `Esc` press, or a link closes it.

- [ ] **Step 3: Run the full test suite**

Run from `web/`: `npm run test:run`
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/app/globals.css
git commit -m "style(web): header + translucent overlay nav styles"
```

---

## Task 6: Recolour the footer

**Files:**
- Modify: `web/src/app/globals.css` (the `/* Footer */` block, from `.site-footer {` at line ~601 onward)

- [ ] **Step 1: Confirm the footer markup uses tokens**

`web/src/components/sections/SiteFooter.tsx` already uses class names only (no inline colours) and reads `address`, `phone`, `social`, `regularHours`, `allergenNotice`, `onlineOrderingUrl`, `bookTableUrl`. No markup change is needed — only its CSS.

- [ ] **Step 2: Update the footer colours to use the new palette directly**

In `web/src/app/globals.css`, in the `.site-footer` rule (line ~601) replace its declaration with:
```css
.site-footer { background: var(--color-scrim-deep); color: var(--color-cream); border-top: 1px solid rgba(255,140,0,.2); }
```
Then, within the footer block, change the gold-toned accents to saffron/amber: set `.site-footer__wordmark` colour to `var(--color-saffron)`, `.site-footer__tagline` to `var(--color-amber)`, `.site-footer__heading` to `var(--color-saffron)`, and the `.site-footer__social-link` border/hover from `rgba(201,160,40,...)` to `rgba(255,140,0,...)`. (These rules currently reference `--color-gold`/`--color-warm-gold`, which the legacy aliases already map to saffron/amber — this step makes the references direct so the aliases can later be removed cleanly.)

- [ ] **Step 3: Verify build and visual**

Run from `web/`: `npm run build` then `npm run dev`. Scroll to the footer on `http://localhost:3000`; confirm a warm near-black background with saffron headings and amber accents, no leftover maroon/gold.

- [ ] **Step 4: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/app/globals.css
git commit -m "style(web): recolour footer to warm-dark + saffron"
```

---

## Task 7: Phase gate — typecheck, build, lint, manual checklist

**Files:** none (verification only)

- [ ] **Step 1: Run the full quality gate**

Run from `web/`:
```bash
npm run typecheck && npm run lint && npm run test:run && npm run build
```
Expected: all four succeed.

- [ ] **Step 2: Manual responsive + accessibility checklist**

Run `npm run dev`. At widths 360px, 768px, and 1280px confirm:
- Header is legible and the toggle is reachable at every width (single pattern, no separate mobile menu).
- `Tab` from the toggle, with the overlay open, cycles only within the panel (focus trap); `Esc` closes and returns focus to the toggle.
- The `Menu` header link navigates to `/menu` without opening the overlay.
- With `prefers-reduced-motion` enabled (DevTools → Rendering → Emulate CSS prefers-reduced-motion), the links appear without the staggered cascade.
- Not-yet-restyled pages (`/menu`, `/about`, `/contact`) still render coherently (warm palette via aliases), not broken.

- [ ] **Step 3: Final phase commit (if any checklist tweaks were needed)**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add -A
git commit -m "chore(web): phase 1 foundation gate fixes" --allow-empty
```

---

## Notes for later phases (not part of this plan)

- The legacy token aliases in Task 2 are intentionally temporary. As Phases 2–5 restyle each surface, replace alias references (`--color-maroon`, `--color-gold`, etc.) with direct Saffron Fire tokens, then delete the aliases once nothing references them. (`--color-maroon-dark` is already unreferenced after the footer recolour — safe to drop in the next cleanup.)
- The `EditorialSplit` shared component, `HeroCarousel`, `SignatureSpotlight`, the menu dietary/spice/allergen rendering, the `aboutPage` document, and the `galleryImage` schema are all introduced in their own phase plans, each written when that phase begins so it reflects the real state after Foundation lands.
- The nav already links to `/gallery`, which 404s until Phase 5 ships — acceptable between phases; Phase 5 adds the route. **Hard gate: do not merge the branch to main until `/gallery` exists (Phase 5) or a stub is added.**

## Phase 1 completion status & review follow-ups (resolved 2026-06-12)

Phase 1 is **complete**: 6 commits (`137b8a1`..`2ece0b3` on `feat/frontend-redesign`). Runnable gates green — `tsc --noEmit` clean, 9/9 Vitest tests pass, `next build` reaches "✓ Compiled successfully".

**Environment constraints (this worktree has no Sanity credentials):**
- `next build` cannot finish SSG — it fails *after* compile with `Configuration must contain 'projectId'`. Treat "✓ Compiled successfully" as the build signal until run in a credentialed env.
- `npm run lint` is not configured (interactive ESLint setup) — set up ESLint non-interactively before relying on it in CI.
- Live visual / responsive / a11y QA needs a running site (Sanity creds) and is **deferred** to a credentialed environment.

**Carried-forward follow-ups for Phase 2 (homepage/hero, where visual QA is possible):**
1. **Header legibility on scroll:** `.site-header` is transparent with cream text — correct over the dark hero, but the sticky header can become illegible over light sections on scroll and on not-yet-restyled inner pages. Decide a scroll-aware or scrim background when the header/hero relationship is finalised.
2. **Animated close:** the overlay uses `hidden={!open}` (a11y-correct, but no fade-out on close). When visual QA is available, evaluate switching to `inert={!open}` + `aria-hidden` so the `.45s` close transition can run while keeping the closed overlay out of the tab order and a11y tree. Do NOT switch to `aria-hidden`-only (leaves links tabbable).
3. **`Book a Table` duplication:** appears in both the persistent header bar and the overlay secondary actions (per spec). When the overlay is open both are visible. Decide whether to dedupe (e.g. drop `bookTableUrl` from `secondaryActions`).
4. **`--nav-height` (64px)** is a fixed token while `.site-header__bar` height is content-driven (~60–68px); align them (explicit header height or token update) so `.hero`'s `calc(100svh - var(--nav-height))` is exact.
5. **`--color-saffron-ink` (#A8500A)** is defined but unused — it is the AA-passing token for saffron text on cream. Phases that put saffron-coloured text on cream MUST use it, never `--color-saffron` (which fails contrast on cream).
```
