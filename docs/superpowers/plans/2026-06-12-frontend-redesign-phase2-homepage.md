# Kahani Frontend Redesign — Phase 2: Homepage — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage on the Saffron Fire foundation — a Framed Full-Bleed hero carousel ("Every plate has a story"), and the Chef's Selection / Hours & Location / Ready-to-Visit sections restyled to cream + saffron with the diamond-divider motif — plus the carried-forward nav follow-ups that this surface finalises.

**Architecture:** Presentation-only changes on the existing Next.js (App Router) + Sanity site. Hero imagery is resolved by a **pure, unit-tested** function (`resolveHeroImages`) that prefers a curated Sanity `heroImages` array, falls back to the featured-dish images, then to a single stock-fallback module — so the owner's real photos override stock with no code change. The cross-fading `HeroCarousel` is a small client component built test-first; everything else is server-rendered. All saffron-coloured text on cream uses `--color-saffron-ink` (the AA-passing token), never `--color-saffron`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `next/image` (`next/font/google` already wired), plain CSS with custom properties, Vitest + @testing-library/react + jsdom + user-event (harness from Phase 1).

**Source spec:** `docs/superpowers/specs/2026-06-11-frontend-redesign-design.md`
**Worktree:** `/Users/ag/Workspace/kahani-redesign` (branch `feat/frontend-redesign`). All paths below are relative to `web/` unless noted.

**Local environment constraint (from Phase 1):** this worktree has **no Sanity credentials**. `next build` fails *after* `✓ Compiled successfully` with `Configuration must contain 'projectId'`, and live page rendering / visual / a11y QA are **not possible here**. The runnable gates for every task are `tsc --noEmit` (`npm run typecheck`), Vitest (`npm run test:run`), and reaching `✓ Compiled successfully` in `npm run build`. Visual/responsive/contrast QA is **deferred to a credentialed environment** and listed explicitly in the final phase gate. `npm run lint` is not configured (interactive setup) — do not rely on it.

---

## File Structure

**Created:**
- `web/src/lib/images/fallbacks.ts` — the single module holding **all** stock fallback image URLs (`HERO_FALLBACK_IMAGES` now; category fallbacks land in later phases). Nothing else may hard-code a stock URL.
- `web/src/lib/images/hero.ts` — `HeroImage` type + `resolveHeroImages(settings, featured)` pure resolver (Sanity → featured → stock).
- `web/src/lib/images/hero.test.ts` — unit tests for the resolver precedence + graceful fallback.
- `web/src/components/sections/HeroCarousel.tsx` — client component: cross-fading background image stack, `priority` first slide, reduced-motion freeze.
- `web/src/components/sections/HeroCarousel.test.tsx` — behavior tests (slides render, first slide is `priority`, reduced-motion freezes, single image = no rotation).
- `web/src/components/sections/DiamondHeading.tsx` — presentational `◆` + hairline-rule section heading used by the cream sections.

**Modified:**
- `web/next.config.ts` — add the stock image host to `images.remotePatterns`.
- `web/src/types/sanity.ts` — add `heroImages?: SanityImage[]` to `SanitySiteSettings`; add `origin?: string | null` to `SanityMenuItem`.
- `web/src/lib/sanity/queries.ts` — project `heroImages` in `SITE_SETTINGS`; project `origin` in `FEATURED_MENU_ITEMS`.
- `web/studio/src/schemas/documents/siteSettings.ts` — add the `heroImages` image-array field (this phase owns the hero imagery source).
- `web/src/app/page.tsx` — rebuild the hero (carousel + frame + headline) and wire the restyled sections + diamond headings.
- `web/src/components/menu/FeaturedCarousel.tsx` — render an optional `origin` tag and swap the `★` glyph for the `◆` motif (no structural change).
- `web/src/lib/nav/links.ts` + `web/src/lib/nav/links.test.ts` — drop `Book a Table` from `secondaryActions` (deduped against the persistent header button).
- `web/src/components/navigation/SiteNav.tsx` + `web/src/components/navigation/SiteNav.test.tsx` — scroll-aware header background (`is-scrolled`).
- `web/vitest.setup.ts` — add a `window.matchMedia` stub (jsdom lacks it; the carousel needs it).
- `web/src/app/globals.css` — rewrite the Hero block; restyle Featured/Chef's Selection, Hours & Location, and Ready-to-Visit to cream + saffron; add diamond-heading + scroll-header styles; switch `.price` to `--color-saffron-ink`.

**Untouched this phase** (restyled in later phases, kept working via the Phase 1 legacy aliases): all `menu/**`, `about/page.tsx`, `contact/page.tsx`. The `origin` **schema field** on `menuItem` and its seeding are Phase 3 — this phase only adds the type + query projection so the tag renders gracefully (as nothing) until then.

---

## Decisions locked for this phase

- **Hero imagery source precedence:** `settings.heroImages` (curated Sanity, separate from the menu `signature` flag) → featured-dish images → `HERO_FALLBACK_IMAGES` stock. Resolved in one pure function so the swap-to-real is a data-only change.
- **Headline emphasis is colour, never italic** (Marcellus is single-weight): "Every plate has a **story**" — "story" is `--color-amber` on the dark hero.
- **`Book a Table` is deduped** out of the overlay's secondary actions because it is always present as the persistent header button (resolves Phase 1 follow-up #3). Order Online + Gift Vouchers remain in the overlay.
- **`Ready to Visit?` becomes a cream section** (not the old warm-dark band) so it doesn't merge into the dark footer; cards are light with saffron hover + a diamond accent.
- **Carried Phase 1 follow-ups resolved here:** #1 scroll-aware header background, #3 Book-a-Table dedup, #4 `--nav-height` alignment, #5 `--color-saffron-ink` for all saffron text on cream. **Deferred:** #2 (animated overlay close via `inert`) stays a noted follow-up — it needs live visual QA this worktree can't do; do not change `hidden={!open}` here.

---

## Task 1: Add `heroImages` / `origin` to the type + query (and the Sanity field)

**Files:**
- Modify: `web/src/types/sanity.ts`
- Modify: `web/src/lib/sanity/queries.ts`
- Modify: `web/studio/src/schemas/documents/siteSettings.ts`

- [ ] **Step 1: Extend the TypeScript types**

In `web/src/types/sanity.ts`, in the `SanityMenuItem` interface add the optional `origin` field directly after `size?: string | null` (line ~42):
```ts
  origin?: string | null
```

In the `SanitySiteSettings` interface add, directly after `awards?: Array<{ title: string; body?: string }>` (line ~114):
```ts
  heroImages?: SanityImage[]
```

- [ ] **Step 2: Project the new fields in the GROQ queries**

In `web/src/lib/sanity/queries.ts`, in `SITE_SETTINGS`, add a `heroImages` projection. Change the line `name, shortName, tagline, cuisine, description, awards,` to add the projection right after `awards,`:
```groq
    name, shortName, tagline, cuisine, description, awards,
    "heroImages": heroImages[]{ alt, "url": asset->url, "lqip": asset->metadata.lqip, hotspot, crop },
```

In `FEATURED_MENU_ITEMS`, add `origin` to the projected fields. Change:
```groq
    prices, priceOnRequest, dietary, allergens, spiceLevel,
```
to:
```groq
    prices, priceOnRequest, dietary, allergens, spiceLevel, origin,
```

- [ ] **Step 3: Add the `heroImages` field to the Sanity schema**

In `web/studio/src/schemas/documents/siteSettings.ts`, add a `heroImages` field to the `restaurant` group, immediately **after** the `awards` field's `defineField({...})` (the field ending around line 37, before `allergenNotice` on line 38):
```ts
    defineField({
      name: 'heroImages',
      title: 'Hero Images',
      description: 'Curated full-bleed homepage hero photos. Falls back to featured dishes, then stock, when empty.',
      type: 'array',
      group: 'restaurant',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })] })],
    }),
```
(`defineArrayMember` and `defineField` are already imported on line 1.)

- [ ] **Step 4: Typecheck**

Run from `web/`: `npm run typecheck`
Expected: passes (the query change is a string; the type additions are optional).

- [ ] **Step 5: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/types/sanity.ts web/src/lib/sanity/queries.ts web/studio/src/schemas/documents/siteSettings.ts
git commit -m "feat(web): add heroImages + origin to schema, query, and types"
```

---

## Task 2: Stock fallbacks module + hero image resolver (test-first)

**Files:**
- Create: `web/src/lib/images/fallbacks.ts`
- Create: `web/src/lib/images/hero.ts`
- Test: `web/src/lib/images/hero.test.ts`

- [ ] **Step 1: Write the failing resolver tests**

Create `web/src/lib/images/hero.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { resolveHeroImages } from './hero'
import { HERO_FALLBACK_IMAGES } from './fallbacks'

const featured = [
  { id: 'a', name: 'Butter Chicken', image: { url: 'https://cdn/a.jpg', alt: 'BC' } },
  { id: 'b', name: 'Lamb Rogan', image: null },
] as any

describe('resolveHeroImages', () => {
  it('prefers curated Sanity heroImages when present', () => {
    const out = resolveHeroImages(
      { name: 'Kahani', heroImages: [{ url: 'https://cdn/h1.jpg', alt: 'Hero one' }] } as any,
      featured,
    )
    expect(out).toEqual([{ url: 'https://cdn/h1.jpg', alt: 'Hero one' }])
  })

  it('falls back to featured-dish images (skipping ones without a url) when heroImages is empty', () => {
    const out = resolveHeroImages({ name: 'Kahani', heroImages: [] } as any, featured)
    expect(out).toEqual([{ url: 'https://cdn/a.jpg', alt: 'BC' }])
  })

  it('uses the dish name as alt when a featured image has none', () => {
    const out = resolveHeroImages({ name: 'Kahani' } as any, [
      { id: 'a', name: 'Butter Chicken', image: { url: 'https://cdn/a.jpg', alt: null } },
    ] as any)
    expect(out[0].alt).toBe('Butter Chicken')
  })

  it('falls back to stock when there are no Sanity or featured images', () => {
    expect(resolveHeroImages(null, [])).toEqual(HERO_FALLBACK_IMAGES)
    expect(resolveHeroImages({ name: 'Kahani' } as any, undefined as any)).toEqual(HERO_FALLBACK_IMAGES)
  })

  it('never returns an empty array', () => {
    expect(resolveHeroImages(null, []).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run from `web/`: `npm run test:run -- src/lib/images/hero.test.ts`
Expected: FAIL — cannot resolve `./hero` / `./fallbacks` (modules not yet created).

- [ ] **Step 3: Create the stock fallbacks module**

Create `web/src/lib/images/fallbacks.ts`. This is the **single** home for stock URLs. The URLs below are licensed-stock Indian-food placeholders served from `images.unsplash.com`; **verify each resolves to a suitable close-up Indian dish** when running in a credentialed/visual environment and swap any that don't (they are temporary — the owner's Sanity uploads override them with no code change):
```ts
import type { HeroImage } from './hero'

/**
 * ALL stock fallback image URLs live in this module (never scattered through
 * components). Temporary — overridden by the owner's Sanity photos with no code
 * change. See [[todo-food-photography]].
 */
const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=70`

export const HERO_FALLBACK_IMAGES: HeroImage[] = [
  { url: UNSPLASH('photo-1585937421612-70a008356fbe'), alt: 'A vibrant Indian thali of curries, rice and breads' },
  { url: UNSPLASH('photo-1631452180519-c014fe946bc7'), alt: 'Rich, creamy butter chicken garnished with coriander' },
  { url: UNSPLASH('photo-1567188040759-fb8a883dc6d8'), alt: 'Spiced Indian street-food snacks on a dark table' },
  { url: UNSPLASH('photo-1596797038530-2c107229654b'), alt: 'Golden samosas with fresh chutney' },
  { url: UNSPLASH('photo-1601050690597-df0568f70950'), alt: 'A spread of aromatic Indian spices' },
]
```

- [ ] **Step 4: Implement the resolver**

Create `web/src/lib/images/hero.ts`:
```ts
import type { SanitySiteSettings, SanityMenuItem } from '@/types/sanity'
import { HERO_FALLBACK_IMAGES } from './fallbacks'

export interface HeroImage {
  url: string
  alt: string
}

/**
 * Resolve the homepage hero images, preferring curated Sanity `heroImages`,
 * then featured-dish images, then a stock fallback. Always returns at least one.
 */
export function resolveHeroImages(
  settings: SanitySiteSettings | null,
  featured: SanityMenuItem[] | undefined,
): HeroImage[] {
  const fromSettings = (settings?.heroImages ?? [])
    .filter(img => Boolean(img?.url))
    .map(img => ({ url: img.url, alt: img.alt ?? settings?.name ?? 'Kahani' }))
  if (fromSettings.length) return fromSettings

  const fromFeatured = (featured ?? [])
    .filter(item => Boolean(item.image?.url))
    .map(item => ({ url: item.image!.url, alt: item.image!.alt ?? item.name }))
  if (fromFeatured.length) return fromFeatured

  return HERO_FALLBACK_IMAGES
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run from `web/`: `npm run test:run -- src/lib/images/hero.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/lib/images/fallbacks.ts web/src/lib/images/hero.ts web/src/lib/images/hero.test.ts
git commit -m "feat(web): hero image resolver + single stock-fallback module (test-first)"
```

---

## Task 3: Build the `HeroCarousel` client component (test-first)

**Files:**
- Modify: `web/vitest.setup.ts`
- Test: `web/src/components/sections/HeroCarousel.test.tsx`
- Create: `web/src/components/sections/HeroCarousel.tsx`

- [ ] **Step 1: Add a `matchMedia` stub to the Vitest setup**

jsdom has no `matchMedia`; the carousel reads `prefers-reduced-motion`. In `web/vitest.setup.ts`, append below the existing jest-dom import:
```ts
// jsdom lacks matchMedia; default to "no reduced motion". Tests override per-case.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList
}
```

- [ ] **Step 2: Write the failing carousel tests**

Create `web/src/components/sections/HeroCarousel.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { HeroCarousel } from './HeroCarousel'

// next/image → a plain <img> so we can assert src/alt/priority in jsdom.
vi.mock('next/image', () => ({
  default: ({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) =>
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-priority={priority ? 'true' : 'false'} />,
}))

const images = [
  { url: 'https://cdn/1.jpg', alt: 'One' },
  { url: 'https://cdn/2.jpg', alt: 'Two' },
  { url: 'https://cdn/3.jpg', alt: 'Three' },
]

function setReducedMotion(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

describe('HeroCarousel', () => {
  beforeEach(() => { vi.useFakeTimers(); setReducedMotion(false) })
  afterEach(() => { vi.useRealTimers() })

  it('renders one slide per image with only the first marked priority', () => {
    const { container } = render(<HeroCarousel images={images} />)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(3)
    expect(imgs[0].getAttribute('data-priority')).toBe('true')
    expect(imgs[1].getAttribute('data-priority')).toBe('false')
  })

  it('starts on the first slide and advances on a timer', () => {
    const { container } = render(<HeroCarousel images={images} />)
    const slides = () => container.querySelectorAll('.hero-carousel__slide')
    expect(slides()[0].className).toContain('is-active')
    act(() => { vi.advanceTimersByTime(5000) })
    expect(slides()[1].className).toContain('is-active')
    expect(slides()[0].className).not.toContain('is-active')
  })

  it('freezes on the first slide under prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { container } = render(<HeroCarousel images={images} />)
    act(() => { vi.advanceTimersByTime(15000) })
    const slides = container.querySelectorAll('.hero-carousel__slide')
    expect(slides[0].className).toContain('is-active')
    expect(slides[1].className).not.toContain('is-active')
  })

  it('does not rotate when given a single image', () => {
    const { container } = render(<HeroCarousel images={[images[0]]} />)
    act(() => { vi.advanceTimersByTime(15000) })
    expect(container.querySelectorAll('.hero-carousel__slide')).toHaveLength(1)
    expect(container.querySelector('.hero-carousel__slide')!.className).toContain('is-active')
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run from `web/`: `npm run test:run -- src/components/sections/HeroCarousel.test.tsx`
Expected: FAIL — cannot resolve `./HeroCarousel`.

- [ ] **Step 4: Implement `HeroCarousel.tsx`**

Create `web/src/components/sections/HeroCarousel.tsx`:
```tsx
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run from `web/`: `npm run test:run -- src/components/sections/HeroCarousel.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/vitest.setup.ts web/src/components/sections/HeroCarousel.tsx web/src/components/sections/HeroCarousel.test.tsx
git commit -m "feat(web): cross-fading HeroCarousel client component (test-first)"
```

---

## Task 4: The `DiamondHeading` section heading

**Files:**
- Create: `web/src/components/sections/DiamondHeading.tsx`
- Test: `web/src/components/sections/DiamondHeading.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `web/src/components/sections/DiamondHeading.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiamondHeading } from './DiamondHeading'

describe('DiamondHeading', () => {
  it('renders the text as a heading and applies the id', () => {
    render(<DiamondHeading id="featured-heading">Chef&apos;s Selection</DiamondHeading>)
    const h = screen.getByRole('heading', { name: "Chef's Selection" })
    expect(h).toHaveAttribute('id', 'featured-heading')
  })

  it('renders a decorative diamond hidden from assistive tech', () => {
    const { container } = render(<DiamondHeading>Hours</DiamondHeading>)
    const diamond = container.querySelector('.diamond-heading__diamond')
    expect(diamond).not.toBeNull()
    expect(diamond).toHaveAttribute('aria-hidden', 'true')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run from `web/`: `npm run test:run -- src/components/sections/DiamondHeading.test.tsx`
Expected: FAIL — cannot resolve `./DiamondHeading`.

- [ ] **Step 3: Implement `DiamondHeading.tsx`**

Create `web/src/components/sections/DiamondHeading.tsx`:
```tsx
/** Centered section heading: a small ◆ diamond above a hairline rule, then the
 *  heading text. The diamond motif, pulled right back from the hero. */
export function DiamondHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div className="diamond-heading">
      <span className="diamond-heading__diamond" aria-hidden="true">◆</span>
      <h2 id={id} className="diamond-heading__title">{children}</h2>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run from `web/`: `npm run test:run -- src/components/sections/DiamondHeading.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/components/sections/DiamondHeading.tsx web/src/components/sections/DiamondHeading.test.tsx
git commit -m "feat(web): DiamondHeading section heading component"
```

---

## Task 5: Rebuild the homepage `page.tsx`

**Files:**
- Modify: `web/src/app/page.tsx` (full rewrite)

- [ ] **Step 1: Replace the homepage**

Replace the entire contents of `web/src/app/page.tsx` with:
```tsx
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
```

- [ ] **Step 2: Typecheck**

Run from `web/`: `npm run typecheck`
Expected: passes. (The old `<video>`/`hero__logo` markup and the unused `hero-video.mp4`/`section-heading` usages are gone; `public/hero-video.mp4` is now unreferenced — leave the file, a cleanup pass can remove it.)

- [ ] **Step 3: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/app/page.tsx
git commit -m "feat(web): rebuild homepage hero (carousel + framed headline) and section headings"
```

---

## Task 6: Hero CSS — frame, brackets, diamonds, carousel, restyle

**Files:**
- Modify: `web/src/app/globals.css` (the `/* ── Hero ── */` block, lines ~170–219, and the `--nav-height` token line ~208)

- [ ] **Step 1: Align `--nav-height` with the real header height**

In `web/src/app/globals.css`, in `:root`, change `--nav-height:  64px;` to:
```css
  --nav-height:  68px;
```
Then, in the `/* ── Header ── */` block, add a `min-height` to `.site-header__bar` so the header matches the token. Change:
```css
.site-header__bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; max-width: var(--container); margin: 0 auto;
}
```
to:
```css
.site-header__bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: .85rem 1.25rem; min-height: var(--nav-height); box-sizing: border-box;
  max-width: var(--container); margin: 0 auto;
}
```

- [ ] **Step 2: Replace the entire `/* ── Hero ── */` block**

In `web/src/app/globals.css`, replace the whole Hero block (from `/* ── Hero ──...` at line ~170 through `.hero__actions { ... }` at line ~219 — i.e. every `.hero*` rule including the `@media (prefers-reduced-motion)` `.hero__video` rule and the old `.hero__video`/`.hero__overlay`/`.hero::before`/`.hero__logo*`/`.hero__award` rules) with:
```css
/* ── Hero — Framed Full-Bleed carousel ─────────────────────────────── */
.hero {
  position: relative; overflow: hidden;
  min-height: calc(100svh - var(--nav-height));
  display: flex; align-items: center; justify-content: center;
  padding: 4rem 1.5rem; text-align: center;
  background: var(--color-scrim); color: var(--color-cream);
}

/* Cross-fading background image stack (decorative). */
.hero-carousel, .hero-carousel__slide { position: absolute; inset: 0; }
.hero-carousel__slide { opacity: 0; transition: opacity 1.2s ease; }
.hero-carousel__slide.is-active { opacity: 1; }
.hero-carousel__img { object-fit: cover; }

/* Warm scrim so cream type stays legible over any photo. */
.hero__scrim {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(30,8,0,.35) 0%, rgba(30,8,0,.78) 80%),
    linear-gradient(180deg, rgba(30,8,0,.45) 0%, rgba(30,8,0,.6) 55%, rgba(40,16,0,.9) 100%);
}

/* Saffron inset frame + corner brackets + top/bottom diamonds. */
.hero__frame {
  position: absolute; inset: 18px; z-index: 2; pointer-events: none;
  border: 1px solid rgba(255,140,0,.55);
}
.hero__corner { position: absolute; width: 34px; height: 34px; }
.hero__corner--tl { top: -1px; left: -1px; border-top: 2px solid var(--color-saffron); border-left: 2px solid var(--color-saffron); }
.hero__corner--tr { top: -1px; right: -1px; border-top: 2px solid var(--color-saffron); border-right: 2px solid var(--color-saffron); }
.hero__corner--bl { bottom: -1px; left: -1px; border-bottom: 2px solid var(--color-saffron); border-left: 2px solid var(--color-saffron); }
.hero__corner--br { bottom: -1px; right: -1px; border-bottom: 2px solid var(--color-saffron); border-right: 2px solid var(--color-saffron); }
.hero__diamond {
  position: absolute; left: 50%; width: 10px; height: 10px;
  background: var(--color-saffron); transform: translateX(-50%) rotate(45deg);
}
.hero__diamond--top { top: -6px; }
.hero__diamond--bottom { bottom: -6px; }

.hero__inner { position: relative; z-index: 3; max-width: 720px; width: 100%; }
.hero__eyebrow {
  font-size: .75rem; letter-spacing: .25em; text-transform: uppercase;
  color: var(--color-amber); margin-bottom: 1.25rem;
}
.hero__title {
  font-family: var(--font-display); font-size: clamp(2.6rem, 9vw, 5.5rem);
  font-weight: 400; color: var(--color-cream); letter-spacing: .02em;
  line-height: 1.05; margin-bottom: 2rem;
}
.hero__title-accent { color: var(--color-amber); } /* emphasis via colour, never italic */
.hero__actions { display: flex; gap: .875rem; justify-content: center; flex-wrap: wrap; }

/* Reduced motion: the carousel component already freezes on slide 1; nothing extra needed here. */

/* Small phones: thin the frame and drop the corner brackets so the headline breathes. */
@media (max-width: 380px) {
  .hero__frame { inset: 10px; }
  .hero__corner { display: none; }
}
```

- [ ] **Step 3: Verify typecheck + build compiles**

Run from `web/`:
```bash
npm run typecheck && npm run build
```
Expected: typecheck passes; `npm run build` reaches `✓ Compiled successfully` (it then fails on missing Sanity `projectId` — expected in this worktree).

- [ ] **Step 4: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/app/globals.css
git commit -m "style(web): framed full-bleed hero (carousel, frame, brackets, diamonds)"
```

---

## Task 7: Restyle Chef's Selection (Featured) to cream + saffron + origin tag

**Files:**
- Modify: `web/src/components/menu/FeaturedCarousel.tsx`
- Modify: `web/src/app/globals.css` (the `.price` rule line ~423; the Featured section + carousel blocks lines ~221–332; add `.diamond-heading` styles)

- [ ] **Step 1: Add the origin tag and swap the glyph in `FeaturedCarousel`**

In `web/src/components/menu/FeaturedCarousel.tsx`, change the `<h3>`/star block:
```tsx
              <h3 className="featured-card__name">
                <span className="featured-card__star" aria-hidden="true">★</span>
                {item.name}
              </h3>
```
to (diamond glyph + optional origin tag, graceful empty state — no origin, no tag, no gap):
```tsx
              <h3 className="featured-card__name">
                <span className="featured-card__diamond" aria-hidden="true">◆</span>
                {item.name}
              </h3>
              {item.origin && <p className="featured-card__origin">{item.origin}</p>}
```

- [ ] **Step 2: Switch the global price colour to the AA-passing token**

In `web/src/app/globals.css`, change line ~423:
```css
.price { font-weight: 700; color: var(--color-gold); font-size: 1rem; white-space: nowrap; }
```
to (pure `--color-gold`/`#FF8C00` fails contrast on cream; `--color-saffron-ink` passes AA and is correct on every light surface where prices appear):
```css
.price { font-weight: 700; color: var(--color-saffron-ink); font-size: 1rem; white-space: nowrap; }
```

- [ ] **Step 3: Replace the Featured section + carousel CSS (cream + saffron)**

In `web/src/app/globals.css`, replace the whole `/* ── Featured section ── */` block **and** the `/* ── Featured carousel ── */` block (lines ~221–332, from `.featured-section {` through the `@media (min-width: 768px) { .featured-card { ... } }`) with:
```css
/* ── Chef's Selection (cream) ──────────────────────────────────────── */
.featured-section { padding: 5rem 0; background: var(--color-cream); }
.featured-section__cta { text-align: center; margin-top: 2.5rem; }
.featured-section .btn--outline { border-color: var(--color-saffron-ink); color: var(--color-saffron-ink); }
.featured-section .btn--outline:hover { background: var(--color-saffron-ink); color: var(--color-cream); border-color: var(--color-saffron-ink); }

/* ── Featured carousel ──────────────────────────────────────────────── */
.featured-carousel-wrap { position: relative; padding: 0 2.5rem; margin-top: 2.5rem; }
.featured-carousel {
  display: flex; gap: 1rem; overflow-x: auto;
  scroll-snap-type: x mandatory; scroll-padding-left: 1rem;
  padding: 0.5rem 1rem 1.25rem; scrollbar-width: none; -ms-overflow-style: none;
}
.featured-carousel::-webkit-scrollbar { display: none; }

.featured-card {
  scroll-snap-align: start; flex: 0 0 260px;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: var(--shadow-card);
  transition: border-color .2s, transform .2s, box-shadow .25s;
}
.featured-card:hover { border-color: var(--color-saffron); transform: translateY(-3px); box-shadow: var(--shadow-hover); }

.featured-card__img { height: 170px; flex-shrink: 0; overflow: hidden; }
.featured-card__img img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
.featured-card:hover .featured-card__img img { transform: scale(1.04); }
.featured-card__img-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, var(--color-cream-bg) 0%, #F3E2CD 50%, var(--color-cream-bg) 100%);
}

.featured-card__body { padding: 1rem; display: flex; flex-direction: column; gap: .4rem; flex: 1; }
.featured-card__name {
  font-family: var(--font-display); font-size: 1.05rem; font-weight: 400;
  color: var(--color-ink); line-height: 1.3; margin: 0;
}
.featured-card__diamond { color: var(--color-saffron-ink); margin-right: .35rem; font-size: .7em; }
.featured-card__origin {
  font-size: .68rem; letter-spacing: .12em; text-transform: uppercase;
  color: var(--color-saffron-ink); margin: 0;
}
.featured-card__meta { display: flex; gap: .35rem; flex-wrap: wrap; }
.featured-card__desc {
  font-size: .8rem; color: var(--color-ink-muted); line-height: 1.5; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.featured-card__price { margin-top: auto; padding-top: .5rem; }

.featured-carousel__btn {
  position: absolute; top: 50%; transform: translateY(-60%);
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid var(--color-border); background: var(--color-white);
  color: var(--color-saffron-ink); font-size: 1.6rem; line-height: 1; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-sm); transition: background .2s, border-color .2s, color .2s; z-index: 2;
}
.featured-carousel__btn:hover { background: var(--color-saffron); border-color: var(--color-saffron); color: var(--color-scrim); }
.featured-carousel__btn--prev { left: 0; }
.featured-carousel__btn--next { right: 0; }
@media (max-width: 640px) {
  .featured-carousel-wrap { padding: 0; }
  .featured-carousel__btn { display: none; }
  .featured-carousel { padding: 0.5rem 1.25rem 1.25rem; }
}
@media (min-width: 768px) { .featured-card { flex: 0 0 290px; } }
```

- [ ] **Step 4: Add the `.diamond-heading` styles**

In `web/src/app/globals.css`, immediately **after** the `.section-heading--light` rule (line ~79), add:
```css
.diamond-heading { text-align: center; margin-bottom: 2.5rem; }
.diamond-heading__diamond { display: block; color: var(--color-saffron-ink); font-size: .7rem; margin-bottom: .5rem; }
.diamond-heading__title {
  font-family: var(--font-display); font-weight: 400;
  font-size: clamp(1.75rem, 4vw, 2.5rem); color: var(--color-ink);
  line-height: 1.15; position: relative; display: inline-block; padding-bottom: .85rem;
}
.diamond-heading__title::after {
  content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%);
  width: 3rem; height: 1px; background: var(--color-border);
}
```

- [ ] **Step 5: Run tests + verify build compiles**

Run from `web/`:
```bash
npm run test:run && npm run typecheck && npm run build
```
Expected: all tests pass; typecheck clean; build reaches `✓ Compiled successfully`.

- [ ] **Step 6: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/components/menu/FeaturedCarousel.tsx web/src/app/globals.css
git commit -m "style(web): restyle Chef's Selection to cream + saffron with origin tag"
```

---

## Task 8: Restyle Hours & Location and Ready-to-Visit (cream + saffron + diamonds)

**Files:**
- Modify: `web/src/app/globals.css` (the `/* ── Hours & location ── */` block lines ~549–566 and the `/* ── Contact actions ── */` block lines ~568–592)

- [ ] **Step 1: Restyle Hours & Location accents + diamond sub-headings**

In `web/src/app/globals.css`, replace the Hours & Location block (lines ~549–566, from `.hours-location {` through `.location-phone a:hover { ... }`) with:
```css
/* ── Hours & location (cream) ──────────────────────────────────────── */
.hours-location { padding: 5rem 1.25rem; background: var(--color-cream); }
.hours-location__inner {
  max-width: var(--container); margin: 0 auto;
  display: grid; gap: 3.5rem; grid-template-columns: 1fr;
}
@media (min-width: 768px) { .hours-location__inner { grid-template-columns: 1fr 1fr; } }

/* Diamond motif on each sub-heading (CSS-only; component markup unchanged). */
.hours-location .section-heading { color: var(--color-ink); display: flex; align-items: center; gap: .6rem; }
.hours-location .section-heading::before { content: '◆'; color: var(--color-saffron-ink); font-size: .6em; }

.hours-table { width: 100%; border-collapse: collapse; }
.hours-table td { padding: .625rem 0; font-size: .95rem; border-bottom: 1px solid var(--color-border); }
.hours-table tr:last-child td { border-bottom: none; }
.hours-table__days { color: var(--color-ink-muted); padding-right: 1.5rem; font-size: .875rem; }
.hours-table__time { font-weight: 700; color: var(--color-ink); }
.hours-note { font-size: .85rem; color: var(--color-ink-muted); margin-top: .75rem; font-style: italic; }
.location-address { font-style: normal; line-height: 2; color: var(--color-ink); margin-bottom: 1rem; font-size: .95rem; }
.location-phone { margin-bottom: 1.5rem; }
.location-phone a { color: var(--color-ink); font-weight: 700; text-decoration: none; font-size: 1.1rem; }
.location-phone a:hover { color: var(--color-saffron-ink); }
```

- [ ] **Step 2: Restyle Ready-to-Visit to a cream section with light saffron cards**

In `web/src/app/globals.css`, replace the Contact actions block (lines ~568–592, from `/* ── Contact actions ── */` through `.contact-card__value { ... }`) with:
```css
/* ── Ready to Visit? (cream) ───────────────────────────────────────── */
.contact-actions { padding: 5rem 0; background: var(--color-cream-bg); }
.contact-actions__grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
@media (min-width: 480px) { .contact-actions__grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 900px) { .contact-actions__grid { grid-template-columns: repeat(4, 1fr); } }

.contact-card {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: .5rem; padding: 2.5rem 1.5rem;
  background: var(--color-white); border: 1px solid var(--color-border);
  border-radius: var(--radius); text-decoration: none; color: var(--color-ink);
  box-shadow: var(--shadow-card);
  transition: border-color .25s, transform .2s, box-shadow .25s;
  position: relative;
}
.contact-card::before {
  content: '◆'; position: absolute; top: .9rem; left: 50%; transform: translateX(-50%);
  color: var(--color-border); font-size: .55rem; transition: color .25s;
}
.contact-card:hover { border-color: var(--color-saffron); transform: translateY(-3px); box-shadow: var(--shadow-hover); }
.contact-card:hover::before { color: var(--color-saffron-ink); }
.contact-card__icon  { font-size: 2.25rem; }
.contact-card__label { font-weight: 800; font-size: .875rem; color: var(--color-saffron-ink); letter-spacing: .06em; text-transform: uppercase; }
.contact-card__value { font-size: .875rem; color: var(--color-ink-muted); }
```

- [ ] **Step 3: Verify tests + build compiles**

Run from `web/`:
```bash
npm run test:run && npm run typecheck && npm run build
```
Expected: tests pass; typecheck clean; build reaches `✓ Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/app/globals.css
git commit -m "style(web): restyle Hours & Location and Ready-to-Visit to cream + saffron"
```

---

## Task 9: Carried-forward nav follow-ups — scroll-aware header + Book-a-Table dedup

**Files:**
- Modify: `web/src/lib/nav/links.ts`
- Modify: `web/src/lib/nav/links.test.ts`
- Modify: `web/src/components/navigation/SiteNav.tsx`
- Modify: `web/src/components/navigation/SiteNav.test.tsx`
- Modify: `web/src/app/globals.css` (the `.site-header` rule line ~99)

- [ ] **Step 1: Update the links test for the dedup (red)**

In `web/src/lib/nav/links.test.ts`, replace the `secondaryActions` describe block with:
```ts
describe('secondaryActions', () => {
  it('excludes Book a Table (shown as the persistent header button) and lists only present URLs', () => {
    const actions = secondaryActions({ bookTableUrl: 'https://book', giftVouchersUrl: null, onlineOrderingUrl: 'https://order' })
    expect(actions.map(a => a.label)).toEqual(['Order Online'])
    expect(actions[0].href).toBe('https://order')
  })

  it('includes Gift Vouchers when its URL is present', () => {
    const actions = secondaryActions({ onlineOrderingUrl: 'https://order', giftVouchersUrl: 'https://gift' })
    expect(actions.map(a => a.label)).toEqual(['Order Online', 'Gift Vouchers'])
  })

  it('returns an empty list when no URLs are set', () => {
    expect(secondaryActions({})).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run from `web/`: `npm run test:run -- src/lib/nav/links.test.ts`
Expected: FAIL — current `secondaryActions` still includes `Book a Table`.

- [ ] **Step 3: Drop Book a Table from `secondaryActions`**

In `web/src/lib/nav/links.ts`, remove the `bookTableUrl` entry and its type. Change the `SecondarySource` interface and the function to:
```ts
interface SecondarySource {
  onlineOrderingUrl?: string | null
  giftVouchersUrl?: string | null
}

export function secondaryActions(s: SecondarySource): NavLink[] {
  return [
    { href: s.onlineOrderingUrl, label: 'Order Online' },
    { href: s.giftVouchersUrl, label: 'Gift Vouchers' },
  ].filter((a): a is NavLink => Boolean(a.href))
}
```

- [ ] **Step 4: Run to verify links tests pass**

Run from `web/`: `npm run test:run -- src/lib/nav/links.test.ts`
Expected: PASS (3 tests). (`secondaryActions` still accepts a `bookTableUrl` property at call sites — extra properties are allowed by TS structural typing — so `SiteNav` passing the full settings object is fine.)

- [ ] **Step 5: Add a scroll-aware-header test (red)**

In `web/src/components/navigation/SiteNav.test.tsx`, add this test inside the `describe('SiteNav', ...)` block:
```tsx
  it('marks the header scrolled once the page is scrolled past the hero threshold', async () => {
    render(<SiteNav settings={settings} />)
    const header = screen.getByRole('banner')
    expect(header.className).not.toContain('is-scrolled')
    Object.defineProperty(window, 'scrollY', { value: 80, writable: true, configurable: true })
    await act(async () => { window.dispatchEvent(new Event('scroll')) })
    expect(header.className).toContain('is-scrolled')
  })
```
Add `act` to the testing-library import at the top of the file:
```tsx
import { render, screen, within, act } from '@testing-library/react'
```

- [ ] **Step 6: Run to verify it fails**

Run from `web/`: `npm run test:run -- src/components/navigation/SiteNav.test.tsx`
Expected: FAIL — `SiteNav` has no scroll listener / `is-scrolled` class yet.

- [ ] **Step 7: Add the scroll listener to `SiteNav`**

In `web/src/components/navigation/SiteNav.tsx`, add a `scrolled` state and a scroll effect. After the existing `const [open, setOpen] = useState(false)` line, add:
```tsx
  const [scrolled, setScrolled] = useState(false)
```
After the existing focus-restore `useEffect` (the one ending `}, [open])`), add:
```tsx
  // Scroll-aware header: give the transparent header a scrim once the user
  // scrolls off the dark hero, so cream text stays legible over light sections.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
```
Then change the opening `<header>` tag from:
```tsx
    <header className="site-header">
```
to:
```tsx
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
```

- [ ] **Step 8: Add the scrolled-header CSS**

In `web/src/app/globals.css`, replace the `.site-header` rule (line ~99):
```css
.site-header { position: sticky; top: 0; z-index: 100; }
```
with:
```css
.site-header { position: sticky; top: 0; z-index: 100; transition: background .3s ease, box-shadow .3s ease; }
.site-header.is-scrolled { background: rgba(30,8,0,.92); box-shadow: 0 2px 16px rgba(0,0,0,.25); }
```

- [ ] **Step 9: Run the full nav test suite**

Run from `web/`: `npm run test:run -- src/components/navigation/SiteNav.test.tsx src/lib/nav/links.test.ts`
Expected: PASS (all nav + links tests green).

- [ ] **Step 10: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/src/lib/nav/links.ts web/src/lib/nav/links.test.ts web/src/components/navigation/SiteNav.tsx web/src/components/navigation/SiteNav.test.tsx web/src/app/globals.css
git commit -m "feat(web): scroll-aware header + dedupe Book a Table from overlay"
```

---

## Task 10: Configure the stock image host + phase gate

**Files:**
- Modify: `web/next.config.ts`
- Verification only otherwise.

- [ ] **Step 1: Allow the stock image host for `next/image`**

In `web/next.config.ts`, add the stock host to `images.remotePatterns` so `HERO_FALLBACK_IMAGES` (and future stock) load through `next/image`. Change the `remotePatterns` array to:
```ts
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
```

- [ ] **Step 2: Run the full runnable quality gate**

Run from `web/`:
```bash
npm run typecheck && npm run test:run && npm run build
```
Expected: typecheck clean; **all** Vitest tests pass (Phase 1 nav/links + new hero resolver + HeroCarousel + DiamondHeading + updated nav); `npm run build` reaches `✓ Compiled successfully` (then fails on missing Sanity `projectId` — expected here, **not** a regression).

- [ ] **Step 3: Commit**

```bash
cd /Users/ag/Workspace/kahani-redesign
git add web/next.config.ts
git commit -m "chore(web): allow images.unsplash.com host for hero stock fallbacks"
```

- [ ] **Step 4: Deferred visual / responsive / a11y QA checklist (credentialed env)**

These require a running site with Sanity credentials and are **out of scope for this worktree** — record them as the Phase 2 acceptance checklist to run before merge:
- Hero carousel cross-fades 4–5 images edge-to-edge behind the saffron frame; corner brackets + top/bottom diamonds render; on a ≤380px viewport the frame thins and brackets drop, headline keeps breathing room.
- Headline reads "Every plate has a story" with "story" in amber (**not** italic); `Our Menu` + `Book a Table` actions present.
- **LCP:** first hero slide is `priority`/preloaded; subsequent slides lazy-load; confirm no LCP regression (Lighthouse).
- `prefers-reduced-motion`: hero freezes on slide 1.
- **Contrast audit:** every text/background pairing ≥4.5:1 (normal) / ≥3:1 (large). Specifically confirm no pure `--color-saffron` text on cream (prices, origin tags, labels all use `--color-saffron-ink`).
- Chef's Selection cards render on cream with saffron-ink prices; a featured dish **with** an `origin` shows the tag, one **without** renders cleanly (no empty tag, no gap).
- Hours & Location + Ready-to-Visit read as cream/saffron with diamond accents; contact cards hover to saffron; CTAs hide when their URL is absent.
- Scroll-aware header: transparent over the hero, gains the dark scrim once scrolled onto cream sections; remains legible on inner pages.
- `Book a Table` appears once in the header bar and is **not** duplicated in the open overlay; Order Online (+ Gift Vouchers when set) still appear there.
- Responsive checks at 360 / 768 / 1280px; cross-browser Chromium / Firefox / WebKit.

---

## Notes for later phases (not part of this plan)

- **Deferred Phase 1 follow-up #2** (animated overlay close via `inert` instead of `hidden={!open}`) is unaddressed here — it needs live visual QA. Revisit in a credentialed environment or the Contact-page polish pass.
- The `origin` **schema field** on `menuItem` and its best-guess seeding for promoted dishes are **Phase 3 (Menu)**. This phase only added the type + query projection, so the Chef's Selection origin tag renders nothing until then (the intended graceful empty state).
- `public/hero-video.mp4` is now unreferenced (the hero no longer uses `<video>`). Safe to delete in a cleanup pass.
- **Hard gate (still in force):** do not merge `feat/frontend-redesign` to `main` until `/gallery` exists (Phase 5) or a stub is added — the nav links to `/gallery`, which 404s until then.
- Phase 1's legacy token aliases (`--color-maroon`, `--color-gold`, …) remain in use by the not-yet-restyled `menu/**`, `about`, and `contact` surfaces. Remove them only once Phases 3–4 restyle those surfaces.
</content>
</invoke>
