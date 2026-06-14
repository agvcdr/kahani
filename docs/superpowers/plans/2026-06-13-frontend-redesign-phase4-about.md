# Phase 4 — About Page (Hybrid A/B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the About page as a resilient hybrid — a backbone (hero, pillars, award band, visit CTA) that always renders from existing Sanity data, plus an optional story layer (intro + editorial-split chapters) that deepens as the owner adds narrative content.

**Architecture:** A dedicated `aboutPage` Sanity singleton document (`intro` + `chapters[]`) supplements the existing `siteSettings` backbone fields (awards, bookTableUrl). The story layer renders using the Phase-3 `EditorialSplit` component, reused unchanged. The page degrades gracefully to the backbone alone when `aboutPage` is empty or absent. Both documents are fetched in parallel on every request.

**Tech Stack:** Next.js App Router (RSC) + Sanity (GROQ), TypeScript, Vitest + React Testing Library, plain CSS with existing design tokens.

---

## Local testing constraint (read first)

This worktree has **no Sanity credentials** (`web/.env.example` only). The only runnable gates are:

- `npm run test:run` (Vitest, 49 tests currently) — must stay green.
- `npx tsc --noEmit` — must stay clean.
- `npx next build` — must reach `✓ Compiled successfully` (the subsequent `projectId` error is expected).

Do **not** claim visual or true build-success verification. Defer to a credentialed environment.

All commands run from `web/` unless the path says otherwise. Schema changes touch `studio/`.

---

## File structure

**Schema / data layer**
- Create `studio/src/schemas/documents/aboutPage.ts` — singleton `aboutPage` document: `intro` (text) + `chapters[]` (each: image, title, body, optional eyebrow).
- Modify `studio/src/schemas/index.ts` — export `aboutPage`.
- Modify `studio/src/structure/deskStructure.ts` — add "About Page" singleton after Site Settings.
- Modify `web/src/types/sanity.ts` — add `SanityAboutChapter`, `SanityAboutPage`.
- Modify `web/src/lib/sanity/queries.ts` — add `ABOUT_PAGE` GROQ query.

**Presentation components**
- Create `web/src/components/about/AboutPillars.tsx` (+ test) — four always-rendered "Kahani difference" pillar cards; fully static, no props.
- Create `web/src/components/about/AwardBand.tsx` (+ test) — renders `settings.awards[]` when non-empty, null when empty.
- Create `web/src/components/about/AboutChapters.tsx` (+ test) — renders optional chapters via `EditorialSplit`, alternating sides, with index-based stock fallback when a chapter has no Sanity image.

**Page + styles**
- Modify `web/src/app/about/page.tsx` — rebuild: parallel fetch → hero (reuses `.hero` + `HeroCarousel`) → intro → chapters → pillars → award band → visit CTA.
- Modify `web/src/app/globals.css` — Phase-4 about styles (intro, pillars, award band, visit CTA, chapter body text, about-hero variant).

---

## Task 1: `aboutPage` Sanity schema + export + Studio structure

**Files:**
- Create: `studio/src/schemas/documents/aboutPage.ts`
- Modify: `studio/src/schemas/index.ts`
- Modify: `studio/src/structure/deskStructure.ts`

No unit test (Sanity schema config). Gate: `npx tsc --noEmit` from `web/`.

- [ ] **Step 1: Create the schema**

Create `studio/src/schemas/documents/aboutPage.ts`:

```ts
import { defineType, defineField, defineArrayMember } from 'sanity'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'intro',
      title: 'Intro Statement',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown directly after the hero. Optional.',
    }),
    defineField({
      name: 'chapters',
      title: 'Story Chapters',
      type: 'array',
      description: 'Each chapter is an editorial image + text split. Chapters with no title are skipped.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Chapter Title', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'eyebrow', title: 'Eyebrow (e.g. "Chapter One")', type: 'string' }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 5,
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  validation: (R) => R.custom((alt, ctx) => {
                    if ((ctx.parent as { asset?: unknown })?.asset && !alt) return 'Alt text is required when an image is set'
                    return true
                  }),
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title', eyebrow: 'eyebrow', media: 'image' },
            prepare({ title, eyebrow, media }) {
              return { title: title ?? '(untitled chapter)', subtitle: eyebrow, media }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About Page' }
    },
  },
})
```

- [ ] **Step 2: Export from the schema index**

In `studio/src/schemas/index.ts`, add at the end of the document-type exports:

```ts
export { aboutPage } from './documents/aboutPage'
```

- [ ] **Step 3: Add the singleton to the Studio desk structure**

In `studio/src/structure/deskStructure.ts`, inside the `items([...])` array, add the following item **after** the Site Settings item (before the closing `]`):

```ts
      S.divider(),

      // ── About Page ─────────────────────────────────────────────────
      S.listItem()
        .title('About Page')
        .child(
          S.document()
            .title('About Page')
            .documentId('aboutPage')
            .schemaType('aboutPage')
        ),
```

- [ ] **Step 4: Type-check**

Run from `web/`: `npx tsc --noEmit`
Expected: clean (no errors).

- [ ] **Step 5: Commit**

```bash
git add studio/src/schemas/documents/aboutPage.ts studio/src/schemas/index.ts studio/src/structure/deskStructure.ts
git commit -m "feat(schema): add aboutPage singleton (intro + chapters)"
```

---

## Task 2: TypeScript type + GROQ query for `aboutPage`

**Files:**
- Modify: `web/src/types/sanity.ts`
- Modify: `web/src/lib/sanity/queries.ts`

- [ ] **Step 1: Add the TypeScript types**

In `web/src/types/sanity.ts`, append before the final closing (after `SanitySiteSettings`):

```ts
export interface SanityAboutChapter {
  title: string
  eyebrow?: string | null
  body?: string | null
  image?: SanityImage | null
}

export interface SanityAboutPage {
  intro?: string | null
  chapters?: SanityAboutChapter[] | null
}
```

- [ ] **Step 2: Add the GROQ query**

In `web/src/lib/sanity/queries.ts`, append at the end of the file:

```ts
export const ABOUT_PAGE = `
  *[_type == "aboutPage" && _id == "aboutPage"][0] {
    intro,
    chapters[] {
      title, eyebrow, body,
      "image": image{ alt, "url": asset->url, "lqip": asset->metadata.lqip, hotspot, crop }
    }
  }
`
```

- [ ] **Step 3: Type-check**

Run from `web/`: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add web/src/types/sanity.ts web/src/lib/sanity/queries.ts
git commit -m "feat(about): add SanityAboutPage type and ABOUT_PAGE GROQ query"
```

---

## Task 3: `AboutPillars` — four "The Kahani Difference" pillar cards

**Files:**
- Create: `web/src/components/about/AboutPillars.tsx`
- Test: `web/src/components/about/AboutPillars.test.tsx`

Fully static — no props, no Sanity data. The four pillars are constants.

- [ ] **Step 1: Write the failing test**

Create `web/src/components/about/AboutPillars.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AboutPillars } from './AboutPillars'

describe('AboutPillars', () => {
  it('renders all four pillar names', () => {
    render(<AboutPillars />)
    expect(screen.getByText('Street-Food Roots')).toBeInTheDocument()
    expect(screen.getByText('Family Recipes')).toBeInTheDocument()
    expect(screen.getByText('Edinburgh Home')).toBeInTheDocument()
    expect(screen.getByText('Catering & Events')).toBeInTheDocument()
  })

  it('renders a section with an accessible heading', () => {
    render(<AboutPillars />)
    expect(screen.getByRole('heading', { name: /the kahani difference/i })).toBeInTheDocument()
  })

  it('renders four pillar cards', () => {
    const { container } = render(<AboutPillars />)
    expect(container.querySelectorAll('.pillar-card')).toHaveLength(4)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run from `web/`: `npx vitest run src/components/about/AboutPillars.test.tsx`
Expected: FAIL — cannot find module `./AboutPillars`.

- [ ] **Step 3: Implement**

Create `web/src/components/about/AboutPillars.tsx`:

```tsx
const PILLARS = [
  {
    name: 'Street-Food Roots',
    desc: 'Every dish traces back to the clamour of an Indian roadside — honest food cooked fast and full of flavour.',
    icon: '🌶',
  },
  {
    name: 'Family Recipes',
    desc: 'Spice blends measured by eye and memory, passed down through generations and cooked the slow way they were meant to be.',
    icon: '🫕',
  },
  {
    name: 'Edinburgh Home',
    desc: 'Found on Antigua Street — minutes from St James Quarter and the Playhouse — Kahani belongs to this city.',
    icon: '🏙️',
  },
  {
    name: 'Catering & Events',
    desc: 'We bring the same energy and spice to your occasion. Ask us about private dining, catering, and events.',
    icon: '🎉',
  },
]

export function AboutPillars() {
  return (
    <section className="about-pillars" aria-labelledby="pillars-heading">
      <div className="container">
        <h2 id="pillars-heading" className="about-pillars__heading">
          <span className="about-pillars__diamond" aria-hidden="true">◆</span>The Kahani Difference
        </h2>
        <div className="about-pillars__grid">
          {PILLARS.map(p => (
            <div key={p.name} className="pillar-card">
              <span className="pillar-card__icon" aria-hidden="true">{p.icon}</span>
              <h3 className="pillar-card__name">{p.name}</h3>
              <p className="pillar-card__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/about/AboutPillars.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/components/about/AboutPillars.tsx web/src/components/about/AboutPillars.test.tsx
git commit -m "feat(about): add AboutPillars component (four Kahani difference cards)"
```

---

## Task 4: `AwardBand` — conditional award display

**Files:**
- Create: `web/src/components/about/AwardBand.tsx`
- Test: `web/src/components/about/AwardBand.test.tsx`

Renders `settings.awards` when non-empty; returns null when empty or absent.

- [ ] **Step 1: Write the failing test**

Create `web/src/components/about/AwardBand.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AwardBand } from './AwardBand'

describe('AwardBand', () => {
  it('renders award titles', () => {
    render(<AwardBand awards={[
      { title: 'Best Restaurant in Edinburgh — Scottish Curry Awards', body: '2023' },
      { title: 'Excellence in Indian Cuisine' },
    ]} />)
    expect(screen.getByText('Best Restaurant in Edinburgh — Scottish Curry Awards')).toBeInTheDocument()
    expect(screen.getByText('Excellence in Indian Cuisine')).toBeInTheDocument()
  })

  it('renders the award body when present', () => {
    render(<AwardBand awards={[{ title: 'Best Restaurant', body: '2023 · Scottish Curry Awards' }]} />)
    expect(screen.getByText('2023 · Scottish Curry Awards')).toBeInTheDocument()
  })

  it('returns null when awards array is empty', () => {
    const { container } = render(<AwardBand awards={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when awards is undefined', () => {
    const { container } = render(<AwardBand awards={undefined} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/about/AwardBand.test.tsx`
Expected: FAIL — cannot find module `./AwardBand`.

- [ ] **Step 3: Implement**

Create `web/src/components/about/AwardBand.tsx`:

```tsx
export function AwardBand({ awards }: { awards?: Array<{ title: string; body?: string }> }) {
  if (!awards?.length) return null
  return (
    <section className="award-band" aria-labelledby="awards-heading">
      <div className="container">
        <span className="award-band__diamond" aria-hidden="true">◆</span>
        <ul className="award-band__list" aria-labelledby="awards-heading">
          {awards.map((a, i) => (
            <li key={i} className="award-band__item">
              <span className="award-band__title">{a.title}</span>
              {a.body && <span className="award-band__body">{a.body}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/about/AwardBand.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/components/about/AwardBand.tsx web/src/components/about/AwardBand.test.tsx
git commit -m "feat(about): add AwardBand component (conditional, null when empty)"
```

---

## Task 5: `AboutChapters` — optional story chapters via `EditorialSplit`

**Files:**
- Create: `web/src/components/about/AboutChapters.tsx`
- Test: `web/src/components/about/AboutChapters.test.tsx`

Renders chapters from the `aboutPage` document. Each chapter uses the Phase-3 `EditorialSplit` component (unchanged). Chapters without a `title` are skipped. If a chapter has no Sanity image, a stock fallback from `SPOTLIGHT_FALLBACK_IMAGES` is used (index-based, same deterministic pattern as spotlights). Sides alternate among rendered chapters only.

- [ ] **Step 1: Write the failing test**

Create `web/src/components/about/AboutChapters.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AboutChapters } from './AboutChapters'
import type { SanityAboutChapter } from '@/types/sanity'

const chapter = (over: Partial<SanityAboutChapter>): SanityAboutChapter =>
  ({ title: 'From the street stalls', eyebrow: 'Chapter One', body: 'A long story.', image: null, ...over })

describe('AboutChapters', () => {
  it('renders chapter titles and body text', () => {
    render(<AboutChapters chapters={[chapter({})]} />)
    expect(screen.getByRole('heading', { name: 'From the street stalls' })).toBeInTheDocument()
    expect(screen.getByText('A long story.')).toBeInTheDocument()
  })

  it('renders the eyebrow when present', () => {
    render(<AboutChapters chapters={[chapter({ eyebrow: 'Chapter One' })]} />)
    expect(screen.getByText('Chapter One')).toBeInTheDocument()
  })

  it('uses the chapter Sanity image alt when an image is provided', () => {
    render(<AboutChapters chapters={[chapter({ image: { url: 'https://cdn/c.jpg', alt: 'A kitchen scene' } })]} />)
    expect(screen.getByAltText('A kitchen scene')).toBeInTheDocument()
  })

  it('falls back to a stock image when the chapter has no image', () => {
    render(<AboutChapters chapters={[chapter({ image: null })]} />)
    // A fallback image should render (alt from SPOTLIGHT_FALLBACK_IMAGES — non-empty string)
    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBeGreaterThan(0)
    expect(imgs[0]).toHaveAttribute('alt')
  })

  it('skips chapters without a title', () => {
    render(<AboutChapters chapters={[
      chapter({ title: '' }),
      chapter({ title: 'Recipes, handed down' }),
    ]} />)
    expect(screen.queryByRole('heading', { name: 'From the street stalls' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Recipes, handed down' })).toBeInTheDocument()
  })

  it('returns null when chapters is empty or absent', () => {
    const { container } = render(<AboutChapters chapters={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/about/AboutChapters.test.tsx`
Expected: FAIL — cannot find module `./AboutChapters`.

- [ ] **Step 3: Implement**

Create `web/src/components/about/AboutChapters.tsx`:

```tsx
import type { SanityAboutChapter } from '@/types/sanity'
import { EditorialSplit } from '@/components/menu/EditorialSplit'
import { SPOTLIGHT_FALLBACK_IMAGES } from '@/lib/images/fallbacks'

function resolveChapterImage(chapter: SanityAboutChapter, idx: number): { url: string; alt: string } {
  if (chapter.image?.url) {
    return { url: chapter.image.url, alt: chapter.image.alt ?? chapter.title }
  }
  const pick = SPOTLIGHT_FALLBACK_IMAGES[idx % SPOTLIGHT_FALLBACK_IMAGES.length]
  return { url: pick.url, alt: pick.alt }
}

export function AboutChapters({ chapters }: { chapters?: SanityAboutChapter[] | null }) {
  const rendered = (chapters ?? []).filter(c => Boolean(c.title))
  if (!rendered.length) return null
  return (
    <div className="about-chapters">
      {rendered.map((chapter, i) => (
        <EditorialSplit
          key={chapter.title + i}
          image={resolveChapterImage(chapter, i)}
          title={chapter.title}
          eyebrow={chapter.eyebrow}
          side={i % 2 === 0 ? 'left' : 'right'}
          priority={i === 0}
        >
          {chapter.body && <p className="editorial-split__body">{chapter.body}</p>}
        </EditorialSplit>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/about/AboutChapters.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/components/about/AboutChapters.tsx web/src/components/about/AboutChapters.test.tsx
git commit -m "feat(about): add AboutChapters component (EditorialSplit reuse, image fallback)"
```

---

## Task 6: Rebuild `about/page.tsx` — backbone + optional story layer

**Files:**
- Modify: `web/src/app/about/page.tsx`

The page is an RSC. Fetch `SITE_SETTINGS` + `ABOUT_PAGE` in parallel. The hero reuses all existing `.hero` classes and `HeroCarousel` (the client component already imported on the homepage). Title is "Our **Kahani**" with amber accent. No CTA buttons in the hero itself — those come in the Visit CTA section at the bottom.

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `web/src/app/about/page.tsx` with:

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { SITE_SETTINGS, ABOUT_PAGE } from '@/lib/sanity/queries'
import type { SanitySiteSettings, SanityAboutPage } from '@/types/sanity'
import { HeroCarousel } from '@/components/sections/HeroCarousel'
import { DiamondHeading } from '@/components/sections/DiamondHeading'
import { AboutPillars } from '@/components/about/AboutPillars'
import { AwardBand } from '@/components/about/AwardBand'
import { AboutChapters } from '@/components/about/AboutChapters'
import { resolveHeroImages } from '@/lib/images/hero'

export const revalidate = 3600
export const metadata: Metadata = { title: 'About' }

export default async function AboutPage() {
  const [settings, aboutPage] = await Promise.all([
    publicClient.fetch<SanitySiteSettings | null>(SITE_SETTINGS),
    publicClient.fetch<SanityAboutPage | null>(ABOUT_PAGE),
  ])

  const heroImages = resolveHeroImages(settings, undefined)

  return (
    <>
      {/* ── Hero (backbone) ──────────────────────────────────────── */}
      <section className="hero about-hero" aria-labelledby="about-hero-heading">
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
          <p className="hero__eyebrow">Edinburgh · Indian Street Food</p>
          <h1 id="about-hero-heading" className="hero__title">
            Our <span className="hero__title-accent">Kahani</span>
          </h1>
        </div>
      </section>

      {/* ── Intro (story layer, optional) ────────────────────────── */}
      {aboutPage?.intro && (
        <div className="about-intro">
          <div className="container">
            <p className="about-intro__text">{aboutPage.intro}</p>
          </div>
        </div>
      )}

      {/* ── Chapters (story layer, optional) ─────────────────────── */}
      <AboutChapters chapters={aboutPage?.chapters} />

      {/* ── Pillars (backbone) ───────────────────────────────────── */}
      <AboutPillars />

      {/* ── Award band (backbone, conditional on data) ───────────── */}
      <AwardBand awards={settings?.awards} />

      {/* ── Visit CTA (backbone) ─────────────────────────────────── */}
      <section className="about-visit" aria-labelledby="about-visit-heading">
        <div className="container">
          <DiamondHeading id="about-visit-heading">Plan Your Visit</DiamondHeading>
          <div className="about-visit__actions">
            {settings?.bookTableUrl && (
              <a
                href={settings.bookTableUrl}
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a Table
              </a>
            )}
            <Link href="/menu" className="btn btn--outline about-visit__menu-btn">
              View the Menu
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Type-check**

Run from `web/`: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Run the full test suite**

Run: `npm run test:run`
Expected: all green (no change to test count — page is an RSC, not unit-tested).

- [ ] **Step 4: Commit**

```bash
git add web/src/app/about/page.tsx
git commit -m "feat(about): rebuild About page with backbone + optional story layer"
```

---

## Task 7: Phase-4 CSS

**Files:**
- Modify: `web/src/app/globals.css`

Append styles for the about page at the end of `globals.css`. Contrast rule: saffron text on cream uses `--color-saffron-ink`; amber/cream is only on dark overlays. The hero overlay rules already exist (`.hero__eyebrow`, `.hero__title`, `.hero__title-accent`) — the about hero reuses them entirely. We only need a `min-height` override for the about hero since it has no action buttons.

- [ ] **Step 1: Append Phase-4 styles**

Append at the very end of `web/src/app/globals.css`:

```css
/* ── About page ─────────────────────────────────────────────────────── */

/* Hero variant — shorter than homepage (no action buttons) */
.about-hero .hero__inner { padding-bottom: 3.5rem; }

/* Intro statement */
.about-intro { background: var(--color-cream); padding: 3.5rem 0 2rem; }
.about-intro__text {
  font-size: clamp(1.1rem, 2.5vw, 1.35rem);
  line-height: 1.8;
  color: var(--color-ink);
  max-width: 68ch;
  margin: 0 auto;
  text-align: center;
}

/* Chapters (editorial-split body text) */
.about-chapters { background: var(--color-cream); }
.editorial-split__body {
  color: var(--color-ink-muted);
  line-height: 1.8;
  margin: .875rem 0 0;
  max-width: 52ch;
}

/* Pillars */
.about-pillars { background: var(--color-cream); padding: 4rem 0; }
.about-pillars__heading {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  color: var(--color-ink);
  text-align: center;
  margin: 0 0 2.5rem;
}
.about-pillars__diamond { color: var(--color-saffron-ink); font-size: .55em; margin-right: .6rem; vertical-align: middle; }
.about-pillars__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}
.pillar-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 2rem 1.5rem;
  text-align: center;
}
.pillar-card__icon { font-size: 2rem; display: block; margin-bottom: 1rem; }
.pillar-card__name {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1.15rem;
  color: var(--color-ink);
  margin: 0 0 .75rem;
}
.pillar-card__desc { font-size: .875rem; color: var(--color-ink-muted); line-height: 1.6; margin: 0; }

/* Award band */
.award-band {
  background: var(--color-scrim-deep);
  color: var(--color-cream);
  padding: 2.5rem 0;
  text-align: center;
}
.award-band__diamond { color: var(--color-saffron); font-size: .6rem; display: block; margin-bottom: 1rem; }
.award-band__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .75rem; }
.award-band__item { display: flex; flex-direction: column; align-items: center; gap: .2rem; }
.award-band__title { font-family: var(--font-display); font-weight: 400; font-size: clamp(1.05rem, 2.5vw, 1.3rem); color: var(--color-cream); }
.award-band__body { font-size: .8rem; color: var(--color-amber); letter-spacing: .08em; text-transform: uppercase; }

/* Visit CTA */
.about-visit { background: var(--color-cream); padding: 4rem 0 5rem; text-align: center; }
.about-visit__actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1.75rem; }
.about-visit__menu-btn { border-color: var(--color-saffron-ink); color: var(--color-saffron-ink); }
.about-visit__menu-btn:hover { background: var(--color-saffron-ink); color: var(--color-cream); border-color: var(--color-saffron-ink); }
```

- [ ] **Step 2: Type-check + full test suite**

Run from `web/`: `npx tsc --noEmit && npm run test:run`
Expected: tsc clean; all tests green (count unchanged — CSS has no tests).

- [ ] **Step 3: Build smoke test**

Run from `web/`: `npx next build`
Expected: prints `✓ Compiled successfully`. The subsequent `projectId` error is the known no-credentials limit; it is NOT a failure.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/globals.css
git commit -m "style(about): Phase 4 about page — intro, pillars, award band, visit CTA, chapter body"
```

---

## Task 8: Final gates + memory update

**Files:**
- Update: `/Users/ag/.claude/projects/-Users-ag-Workspace-kahani/memory/project_kahani_redesign_phases.md`

- [ ] **Step 1: Full unit suite**

Run: `npm run test:run`
Expected: all green. Record the final pass count (was 49 before Phase 4; `AboutPillars` adds 3, `AwardBand` adds 4, `AboutChapters` adds 6 = 62 expected).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Build smoke test**

Run: `npx next build`
Expected: `✓ Compiled successfully`. The `projectId` error after is expected.

- [ ] **Step 4: Commit plan doc**

```bash
git add docs/superpowers/plans/2026-06-13-frontend-redesign-phase4-about.md
git commit -m "docs(redesign): add Phase 4 (About) implementation plan"
```

- [ ] **Step 5: Update the phases memory**

In `project_kahani_redesign_phases.md`, mark Phase 4 **DONE (2026-06-13)** and update the Phase 5 entry to note `EditorialSplit` is available. Include: plan path, new files (`aboutPage` schema, `AboutPillars`, `AwardBand`, `AboutChapters`), gate results, and carried-forward items: (a) owner must author intro + chapters + images in Sanity Studio (page degrades to backbone until then); (b) award data comes from `siteSettings.awards` (already seeded); (c) visual/responsive/a11y QA deferred to credentialed environment.

---

## Spec coverage check

- Framed hero with "Our Kahani" headline, "Kahani" amber, eyebrow "Edinburgh · Indian Street Food" → Task 6 (reuses `.hero` classes + `HeroCarousel`).
- Four "Kahani difference" pillar cards (always rendered) → Task 3 (`AboutPillars`).
- Award band renders when `settings.awards` has entries, hidden if empty → Task 4 (`AwardBand`).
- Visit CTA (Book a Table · View the Menu) → Task 6 (`.about-visit` section).
- Intro statement from `aboutPage.intro` (optional, renders when present) → Task 6.
- Chapters from `aboutPage.chapters[]`, each using `EditorialSplit`, alternating sides, stacking on mobile → Task 5 (`AboutChapters`); CSS inherited from Phase-3 `.editorial-split`.
- Chapter with no title is skipped (no empty block, no gap) → Task 5 (tested).
- Chapter body text (`editorial-split__body`) → Tasks 5 + 7.
- Chapter image: Sanity image preferred, stock fallback when absent → Task 5 (tested).
- `aboutPage` Sanity singleton document with `intro` + `chapters[]` → Task 1.
- Dedicated `aboutPage` document (NOT overloaded onto `siteSettings`) → Task 1.
- Parallel fetch of `SITE_SETTINGS` + `ABOUT_PAGE` → Task 6.
- No italic on Marcellus — amber accent via `hero__title-accent`, not `<em>` → Task 6.
- `EditorialSplit` reused unchanged from Phase 3 — no modification → Task 5 imports it as-is.
- Seed copy (intro text + chapter titles/body) is owner-authored in Sanity, not hardcoded into the page — correct; `AboutPillars` is the only hardcoded section (brand identity constants, not narrative).
- Backbone always renders even when `aboutPage` is null/empty → Task 6 (all backbone sections guard only on their own data: pillars always, award band guards on `awards?.length`, hero always, visit CTA guards on `bookTableUrl` for the conditional button).

**Deferred to a credentialed environment:** visual/responsive/a11y QA, reduced-motion hero freeze, contrast audit on rendered pages. **Deferred to owner (Sanity content):** intro text, chapter content + images, award data review.
