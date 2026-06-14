# Phase 3 — Menu (Index + 3-Tier Category Engine) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the menu index as a restrained, cream/diamond category list and the category page as a data-driven three-tier upsell engine (full-bleed macro spotlight → editorial splits → quiet list), with mandatory dietary/allergen/spice/seasonal/sold-out states in every tier and an external `Order Online` action.

**Architecture:** A new `signature` boolean and `origin` string on the `menuItem` Sanity schema drive spotlight selection with no code change. A pure `selectSpotlights()` helper splits a category's items into `{ fullBleed, splits, rest }`; a pure `resolveSpotlightImage()` yields a stock fallback when a dish has no Sanity image. Presentation is composed from small focused components — `DishStates` (all states, cluster + inline variants), `OrderOnlineButton`, the shared `EditorialSplit` (reused by About in Phase 4), `SignatureSpotlight` (full-bleed), and `QuietList`. The page degrades gracefully to a pure quiet list when no item is flagged `signature` (the current reality with no signature data seeded).

**Tech Stack:** Next.js App Router (RSC) + Sanity (GROQ), TypeScript, Vitest + React Testing Library, plain CSS with existing design tokens.

---

## Local testing constraint (read first)

This worktree has **no Sanity credentials** (`web/.env.example` only, placeholder `projectId`). Therefore:

- `npm run dev` page rendering and all visual / responsive / a11y QA are **not possible locally**.
- `next build` fails *after* printing `✓ Compiled successfully` with `Configuration must contain 'projectId'`.

**The only runnable gates are:**
- `npm run test:run` (Vitest) — all green.
- `npx tsc --noEmit` — clean.
- `npx next build` — reaches `✓ Compiled successfully` (the later `projectId` error is expected and is **not** a failure of this work).

Do **not** claim visual or build-success verification. Defer those to a credentialed environment.

**Content note (out of code scope):** seeding `signature` flags and best-guess `origin` values onto specific dishes is owner-reviewed content work done in Sanity Studio (`[[project-kahani-restaurant]]`, `[[todo-food-photography]]`). This plan ships the *engine* and the *Studio fields*; with no flags seeded the category page renders as a quiet list, which is a required graceful-degradation path and is explicitly tested.

All commands below run from `web/` unless a path says otherwise. The schema task touches `studio/`.

---

## File structure

**Schema / data layer**
- Modify `studio/src/schemas/documents/menuItem.ts` — add `signature` (boolean) and `origin` (string) fields.
- Modify `web/src/types/sanity.ts` — add `signature?: boolean` to `SanityMenuItem` (`origin?` already exists).
- Modify `web/src/lib/sanity/queries.ts` — return `origin, signature` from `MENU_ITEMS_BY_CATEGORY` and `MENU_ITEMS_BY_CATEGORY_IDS`.
- Create `web/src/lib/menu/spotlights.ts` (+ `.test.ts`) — pure `selectSpotlights()`.
- Modify `web/src/lib/images/fallbacks.ts` — add `SPOTLIGHT_FALLBACK_IMAGES`.
- Create `web/src/lib/images/dish.ts` (+ `.test.ts`) — pure `resolveSpotlightImage()`.

**Presentation**
- Create `web/src/components/menu/DishStates.tsx` (+ `.test.tsx`) — all states, `cluster` + `inline` variants (dietary, spice chillies, seasonal, sold-out, inline allergen affordance).
- Create `web/src/components/menu/OrderOnlineButton.tsx` (+ `.test.tsx`) — external link, hidden when no URL or sold out.
- Create `web/src/components/menu/EditorialSplit.tsx` (+ `.test.tsx`) — shared presentational split (image + content), `side` prop. Reused by About in Phase 4.
- Create `web/src/components/menu/SignatureSpotlight.tsx` (+ `.test.tsx`) — full-bleed macro spotlight from a `SanityMenuItem`, plus a `DishEditorialSplit` wrapper that maps a dish into `EditorialSplit`.
- Create `web/src/components/menu/QuietList.tsx` (+ `.test.tsx`) — sub-section-grouped name/price/origin/glyph list, no images.

**Pages / styles**
- Modify `web/src/app/menu/[categorySlug]/page.tsx` — compose the three tiers + allergen notice; fetch settings for `onlineOrderingUrl` / `allergenNotice`.
- Modify `web/src/app/menu/page.tsx` — restyle index (diamond dividers).
- Modify `web/src/app/globals.css` — styles for spotlights, editorial split, quiet list, state glyphs, restyled index.

---

## Task 1: Add `signature` + `origin` fields to the menuItem schema

**Files:**
- Modify: `studio/src/schemas/documents/menuItem.ts`

This is the single schema source (imported by `web/sanity.config.ts`); there is no separate embedded schema to sync. No unit test (Sanity schema object); verified by `tsc`.

- [ ] **Step 1: Add the `signature` field in the `status` group, after `featured`**

In `studio/src/schemas/documents/menuItem.ts`, immediately after the `featured` `defineField({...})` block, add:

```ts
    defineField({
      name: 'signature',
      title: 'Signature (Spotlight)',
      type: 'boolean',
      group: 'status',
      initialValue: false,
      description: 'Promotes this dish to a photographic spotlight on its category page. First flagged item becomes the full-bleed hero; the next one or two become editorial splits.',
    }),
```

- [ ] **Step 2: Add the optional `origin` field in the `details` group, after `description`**

Immediately after the `description` `defineField({...})` block, add:

```ts
    defineField({
      name: 'origin',
      title: 'Regional Origin',
      type: 'string',
      group: 'details',
      description: 'Optional region (e.g. Kashmir, Punjab, Gujarat). Owner-reviewed; never guessed. Shown on spotlights and Chef\'s Selection where present.',
    }),
```

- [ ] **Step 3: Type-check the studio package**

Run from repo root: `cd studio && npx tsc --noEmit; cd -`
Expected: no errors. (If the studio has no standalone tsconfig, skip — the field is plain config; the web `tsc` in later tasks covers the consuming types.)

- [ ] **Step 4: Commit**

```bash
git add studio/src/schemas/documents/menuItem.ts
git commit -m "feat(schema): add signature + origin fields to menuItem"
```

---

## Task 2: Add `signature` to the web type and return `origin`/`signature` from category queries

**Files:**
- Modify: `web/src/types/sanity.ts`
- Modify: `web/src/lib/sanity/queries.ts`

- [ ] **Step 1: Add `signature?: boolean` to `SanityMenuItem`**

In `web/src/types/sanity.ts`, inside `interface SanityMenuItem`, directly below the existing `featured?: boolean` line add:

```ts
  signature?: boolean
```

(`origin?: string | null` already exists at the end of the interface — leave it.)

- [ ] **Step 2: Return `origin, signature` from `MENU_ITEMS_BY_CATEGORY`**

In `web/src/lib/sanity/queries.ts`, in `MENU_ITEMS_BY_CATEGORY`, change the line:

```
    featured, seasonal, soldOut,
```

to:

```
    featured, signature, origin, seasonal, soldOut,
```

- [ ] **Step 3: Return `origin, signature` from `MENU_ITEMS_BY_CATEGORY_IDS`**

In the same file, in `MENU_ITEMS_BY_CATEGORY_IDS`, apply the identical change to its `featured, seasonal, soldOut,` line:

```
    featured, signature, origin, seasonal, soldOut,
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean (GROQ strings are untyped, so this only confirms the type edit compiles).

- [ ] **Step 5: Commit**

```bash
git add web/src/types/sanity.ts web/src/lib/sanity/queries.ts
git commit -m "feat(menu): surface signature + origin in category queries and type"
```

---

## Task 3: Pure `selectSpotlights()` helper

**Files:**
- Create: `web/src/lib/menu/spotlights.ts`
- Test: `web/src/lib/menu/spotlights.test.ts`

Splits a category's items into the three tiers. Signature items (in their incoming sort order) fill the spotlights: the **first** becomes the full-bleed, the **next up to two** become editorial splits. Everything else — including any signature items beyond the first three — falls into `rest`, preserving the original order.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { selectSpotlights } from './spotlights'
import type { SanityMenuItem } from '@/types/sanity'

const item = (id: string, signature = false): SanityMenuItem =>
  ({ id, slug: id, name: id, description: null, prices: [], dietary: [], allergens: [], spiceLevel: 0, signature }) as SanityMenuItem

describe('selectSpotlights', () => {
  it('returns empty tiers for no items', () => {
    expect(selectSpotlights([])).toEqual({ fullBleed: null, splits: [], rest: [] })
  })

  it('with no signature items, puts everything in rest in order', () => {
    const items = [item('a'), item('b'), item('c')]
    const out = selectSpotlights(items)
    expect(out.fullBleed).toBeNull()
    expect(out.splits).toEqual([])
    expect(out.rest.map(i => i.id)).toEqual(['a', 'b', 'c'])
  })

  it('promotes the first signature item to full-bleed and the next two to splits', () => {
    const items = [item('a'), item('s1', true), item('b'), item('s2', true), item('s3', true)]
    const out = selectSpotlights(items)
    expect(out.fullBleed?.id).toBe('s1')
    expect(out.splits.map(i => i.id)).toEqual(['s2', 's3'])
    expect(out.rest.map(i => i.id)).toEqual(['a', 'b'])
  })

  it('caps spotlights at three and pushes extra signature items into rest in original order', () => {
    const items = [item('s1', true), item('s2', true), item('s3', true), item('s4', true), item('x')]
    const out = selectSpotlights(items)
    expect(out.fullBleed?.id).toBe('s1')
    expect(out.splits.map(i => i.id)).toEqual(['s2', 's3'])
    expect(out.rest.map(i => i.id)).toEqual(['s4', 'x'])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/menu/spotlights.test.ts`
Expected: FAIL — cannot find module `./spotlights`.

- [ ] **Step 3: Implement**

Create `web/src/lib/menu/spotlights.ts`:

```ts
import type { SanityMenuItem } from '@/types/sanity'

export interface Spotlights {
  /** First signature item — rendered as the full-bleed macro hero. */
  fullBleed: SanityMenuItem | null
  /** Up to two further signature items — rendered as editorial splits. */
  splits: SanityMenuItem[]
  /** Everything else, in original order, for the quiet list. */
  rest: SanityMenuItem[]
}

/**
 * Split a category's items into the three menu tiers. Selection is driven only
 * by the `signature` flag; order follows the items' incoming sort order. At
 * most three dishes are promoted (1 full-bleed + 2 splits); any further
 * signature items fall back into the quiet list. Degrades to a pure quiet list
 * when nothing is flagged.
 */
export function selectSpotlights(items: SanityMenuItem[]): Spotlights {
  const chosen = new Set<SanityMenuItem>()
  const signatures = items.filter(i => i.signature)
  const promoted = signatures.slice(0, 3)
  promoted.forEach(i => chosen.add(i))

  const fullBleed = promoted[0] ?? null
  const splits = promoted.slice(1)
  const rest = items.filter(i => !chosen.has(i))

  return { fullBleed, splits, rest }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/menu/spotlights.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/menu/spotlights.ts web/src/lib/menu/spotlights.test.ts
git commit -m "feat(menu): add selectSpotlights tier-selection helper"
```

---

## Task 4: Spotlight image fallback (`resolveSpotlightImage`)

**Files:**
- Modify: `web/src/lib/images/fallbacks.ts`
- Create: `web/src/lib/images/dish.ts`
- Test: `web/src/lib/images/dish.test.ts`

A spotlight always needs an image. Prefer the dish's Sanity image; otherwise pick a deterministic stock fallback so the same dish always shows the same image.

- [ ] **Step 1: Add stock spotlight fallbacks**

In `web/src/lib/images/fallbacks.ts`, append (after `HERO_FALLBACK_IMAGES`):

```ts
/** Macro dish fallbacks for menu spotlights. Temporary — overridden by the
 *  owner's Sanity photos with no code change. See [[todo-food-photography]]. */
export const SPOTLIGHT_FALLBACK_IMAGES: { url: string; alt: string }[] = [
  { url: UNSPLASH('photo-1631452180519-c014fe946bc7'), alt: 'A signature Indian dish, freshly plated' },
  { url: UNSPLASH('photo-1565557623262-b51c2513a641'), alt: 'A rich, aromatic curry close-up' },
  { url: UNSPLASH('photo-1606491956689-2ea866880c84'), alt: 'A spiced Indian dish garnished with fresh herbs' },
  { url: UNSPLASH('photo-1599487488170-d11ec9c172f0'), alt: 'A vibrant plate of Indian food' },
]
```

- [ ] **Step 2: Write the failing test**

Create `web/src/lib/images/dish.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { resolveSpotlightImage } from './dish'
import { SPOTLIGHT_FALLBACK_IMAGES } from './fallbacks'
import type { SanityMenuItem } from '@/types/sanity'

const dish = (over: Partial<SanityMenuItem>): SanityMenuItem =>
  ({ id: 'x', slug: 'x', name: 'Dish', description: null, prices: [], dietary: [], allergens: [], spiceLevel: 0, ...over }) as SanityMenuItem

describe('resolveSpotlightImage', () => {
  it('uses the dish image when present', () => {
    const out = resolveSpotlightImage(dish({ image: { url: 'https://cdn/d.jpg', alt: 'Plated dish' } }))
    expect(out).toEqual({ url: 'https://cdn/d.jpg', alt: 'Plated dish' })
  })

  it('falls back to the dish name as alt when the Sanity image has no alt', () => {
    const out = resolveSpotlightImage(dish({ name: 'Lamb Rogan', image: { url: 'https://cdn/d.jpg', alt: null } }))
    expect(out).toEqual({ url: 'https://cdn/d.jpg', alt: 'Lamb Rogan' })
  })

  it('returns a stock fallback when the dish has no image', () => {
    const out = resolveSpotlightImage(dish({ id: 'butter-chicken', image: null }))
    expect(SPOTLIGHT_FALLBACK_IMAGES.map(i => i.url)).toContain(out.url)
  })

  it('is deterministic — the same id always maps to the same fallback', () => {
    const a = resolveSpotlightImage(dish({ id: 'same-id', image: null }))
    const b = resolveSpotlightImage(dish({ id: 'same-id', image: null }))
    expect(a.url).toBe(b.url)
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run src/lib/images/dish.test.ts`
Expected: FAIL — cannot find module `./dish`.

- [ ] **Step 4: Implement**

Create `web/src/lib/images/dish.ts`:

```ts
import type { SanityMenuItem } from '@/types/sanity'
import { SPOTLIGHT_FALLBACK_IMAGES } from './fallbacks'

export interface ResolvedImage {
  url: string
  alt: string
}

/** Stable, non-negative hash of a string (for deterministic fallback picking). */
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Resolve a menu spotlight image: the dish's own Sanity image when present,
 * otherwise a deterministic stock fallback keyed off the dish id (so a given
 * dish always shows the same placeholder).
 */
export function resolveSpotlightImage(item: SanityMenuItem): ResolvedImage {
  if (item.image?.url) {
    return { url: item.image.url, alt: item.image.alt ?? item.name }
  }
  const pick = SPOTLIGHT_FALLBACK_IMAGES[hash(item.id) % SPOTLIGHT_FALLBACK_IMAGES.length]
  return { url: pick.url, alt: pick.alt }
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run src/lib/images/dish.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/images/fallbacks.ts web/src/lib/images/dish.ts web/src/lib/images/dish.test.ts
git commit -m "feat(menu): add resolveSpotlightImage with deterministic stock fallback"
```

---

## Task 5: `DishStates` — all dietary/allergen/spice/seasonal/sold-out states

**Files:**
- Create: `web/src/components/menu/DishStates.tsx`
- Test: `web/src/components/menu/DishStates.test.tsx`

One component, two variants. `cluster` (spotlights): dietary badges + spice chillies + seasonal/sold-out `Badge`s. `inline` (quiet list): compact dietary letters + chillies + seasonal/sold-out marks + a **single** "contains allergens" affordance. Reuses the existing `DietaryBadge` and `Badge`; renders chillies (spec requires chillies scaled to `spiceLevel`, not dots) and the allergen affordance net-new. The existing `SpiceIndicator` (dots) is left untouched for the legacy `MenuItemCard`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DishStates } from './DishStates'
import type { SanityMenuItem } from '@/types/sanity'

const base: SanityMenuItem = {
  id: 'x', slug: 'x', name: 'Dish', description: null, prices: [],
  dietary: [], allergens: [], spiceLevel: 0,
} as SanityMenuItem

describe('DishStates', () => {
  it('renders dietary badges and spice chillies scaled to the level (cluster)', () => {
    const { container } = render(
      <DishStates item={{ ...base, dietary: ['vegan'], spiceLevel: 2 }} variant="cluster" />,
    )
    expect(screen.getByText('Ve')).toBeInTheDocument()
    expect(container.querySelectorAll('.spice-chillies__chilli--on')).toHaveLength(2)
  })

  it('renders a seasonal and a sold-out mark', () => {
    render(<DishStates item={{ ...base, seasonal: true, soldOut: true }} variant="cluster" />)
    expect(screen.getByText(/seasonal/i)).toBeInTheDocument()
    expect(screen.getByText(/sold out/i)).toBeInTheDocument()
  })

  it('shows a single allergen affordance in the inline variant when allergens exist', () => {
    render(<DishStates item={{ ...base, allergens: ['gluten', 'milk'] }} variant="inline" />)
    const affordance = screen.getByLabelText(/contains allergens/i)
    expect(affordance).toBeInTheDocument()
  })

  it('does NOT render the allergen affordance in the cluster variant (spotlights name them in full elsewhere)', () => {
    render(<DishStates item={{ ...base, allergens: ['gluten'] }} variant="cluster" />)
    expect(screen.queryByLabelText(/contains allergens/i)).toBeNull()
  })

  it('renders nothing when there are no states', () => {
    const { container } = render(<DishStates item={base} variant="inline" />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/menu/DishStates.test.tsx`
Expected: FAIL — cannot find module `./DishStates`.

- [ ] **Step 3: Implement**

Create `web/src/components/menu/DishStates.tsx`:

```tsx
import type { SanityMenuItem } from '@/types/sanity'
import { DietaryBadge } from './DietaryBadge'
import { Badge } from '@/components/ui/Badge'

type StateItem = Pick<SanityMenuItem, 'dietary' | 'spiceLevel' | 'seasonal' | 'soldOut' | 'allergens'>

function SpiceChillies({ level }: { level: number }) {
  if (!level) return null
  const clamped = Math.min(5, Math.max(0, level))
  return (
    <span className="spice-chillies" title={`Spice level ${clamped}/5`} aria-label={`Spice level ${clamped} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < clamped ? 'spice-chillies__chilli spice-chillies__chilli--on' : 'spice-chillies__chilli'} aria-hidden="true">
          🌶
        </span>
      ))}
    </span>
  )
}

export function DishStates({ item, variant }: { item: StateItem; variant: 'cluster' | 'inline' }) {
  const hasDietary = Boolean(item.dietary?.length)
  const hasSpice = Boolean(item.spiceLevel)
  const hasAllergens = variant === 'inline' && Boolean(item.allergens?.length)
  const nothing = !hasDietary && !hasSpice && !item.seasonal && !item.soldOut && !hasAllergens
  if (nothing) return null

  return (
    <span className={`dish-states dish-states--${variant}`}>
      <DietaryBadge dietary={item.dietary} />
      <SpiceChillies level={item.spiceLevel} />
      {item.seasonal && <Badge variant="seasonal" title="Seasonal">Seasonal</Badge>}
      {item.soldOut && <Badge variant="sold-out" title="Sold out">Sold out</Badge>}
      {hasAllergens && (
        <span
          className="dish-states__allergen"
          aria-label="Contains allergens — ask your server"
          title="Contains allergens — ask your server"
        >
          ⚠
        </span>
      )}
    </span>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/menu/DishStates.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/components/menu/DishStates.tsx web/src/components/menu/DishStates.test.tsx
git commit -m "feat(menu): add DishStates renderer (dietary, spice chillies, seasonal, sold-out, allergen affordance)"
```

---

## Task 6: `OrderOnlineButton` — external link, hidden when absent or sold out

**Files:**
- Create: `web/src/components/menu/OrderOnlineButton.tsx`
- Test: `web/src/components/menu/OrderOnlineButton.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderOnlineButton } from './OrderOnlineButton'

describe('OrderOnlineButton', () => {
  it('renders an external link to the ordering URL', () => {
    render(<OrderOnlineButton url="https://order.example.com" />)
    const link = screen.getByRole('link', { name: /order online/i })
    expect(link).toHaveAttribute('href', 'https://order.example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders nothing when the URL is absent', () => {
    const { container } = render(<OrderOnlineButton url={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when the dish is sold out', () => {
    const { container } = render(<OrderOnlineButton url="https://order.example.com" soldOut />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/menu/OrderOnlineButton.test.tsx`
Expected: FAIL — cannot find module `./OrderOnlineButton`.

- [ ] **Step 3: Implement**

Create `web/src/components/menu/OrderOnlineButton.tsx`:

```tsx
/**
 * Links to the single global `settings.onlineOrderingUrl` (the site has no
 * in-house cart). Hidden when no URL is configured or the dish is sold out.
 */
export function OrderOnlineButton({ url, soldOut }: { url?: string | null; soldOut?: boolean }) {
  if (!url || soldOut) return null
  return (
    <a className="btn btn--solid order-online-btn" href={url} target="_blank" rel="noopener noreferrer">
      Order Online
    </a>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/menu/OrderOnlineButton.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/components/menu/OrderOnlineButton.tsx web/src/components/menu/OrderOnlineButton.test.tsx
git commit -m "feat(menu): add OrderOnlineButton (external link, hidden when absent/sold-out)"
```

---

## Task 7: `EditorialSplit` — shared presentational split component

**Files:**
- Create: `web/src/components/menu/EditorialSplit.tsx`
- Test: `web/src/components/menu/EditorialSplit.test.tsx`

A reusable image + content split (tall macro photo + generous whitespace), alternating `side`. **Purely presentational** — it knows nothing about dishes, so Phase 4's About chapters reuse it directly. Uses `next/image` with fixed aspect ratio (no CLS).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EditorialSplit } from './EditorialSplit'

describe('EditorialSplit', () => {
  it('renders image (with alt), eyebrow, title and children', () => {
    render(
      <EditorialSplit
        image={{ url: 'https://cdn/x.jpg', alt: 'A plated dish' }}
        eyebrow="Kashmir"
        title="Rogan Josh"
        side="left"
      >
        <p>An aromatic slow-cooked lamb curry.</p>
      </EditorialSplit>,
    )
    expect(screen.getByAltText('A plated dish')).toBeInTheDocument()
    expect(screen.getByText('Kashmir')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rogan Josh' })).toBeInTheDocument()
    expect(screen.getByText('An aromatic slow-cooked lamb curry.')).toBeInTheDocument()
  })

  it('applies a side modifier class for alternating layout', () => {
    const { container } = render(
      <EditorialSplit image={{ url: 'https://cdn/x.jpg', alt: 'x' }} title="T" side="right" />,
    )
    expect(container.querySelector('.editorial-split--right')).not.toBeNull()
  })

  it('omits the eyebrow element when no eyebrow is given', () => {
    const { container } = render(
      <EditorialSplit image={{ url: 'https://cdn/x.jpg', alt: 'x' }} title="T" side="left" />,
    )
    expect(container.querySelector('.editorial-split__eyebrow')).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/menu/EditorialSplit.test.tsx`
Expected: FAIL — cannot find module `./EditorialSplit`.

- [ ] **Step 3: Implement**

Create `web/src/components/menu/EditorialSplit.tsx`:

```tsx
import Image from 'next/image'
import type { ReactNode } from 'react'

export interface EditorialSplitProps {
  image: { url: string; alt: string }
  title: string
  eyebrow?: string | null
  /** Which side the image sits on at desktop width; stacks on mobile. */
  side: 'left' | 'right'
  /** Optional priority for an above-the-fold split (LCP). Default false. */
  priority?: boolean
  children?: ReactNode
}

/**
 * Reusable editorial split: a tall macro image beside a column of eyebrow +
 * Marcellus title + body. Alternates by `side`, stacks on mobile. Presentation
 * only — used by menu dish spotlights and (Phase 4) About chapters.
 */
export function EditorialSplit({ image, title, eyebrow, side, priority = false, children }: EditorialSplitProps) {
  return (
    <section className={`editorial-split editorial-split--${side}`}>
      <div className="editorial-split__media">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 860px) 100vw, 50vw"
          className="editorial-split__img"
          priority={priority}
        />
      </div>
      <div className="editorial-split__content">
        {eyebrow && <p className="editorial-split__eyebrow">{eyebrow}</p>}
        <h2 className="editorial-split__title">{title}</h2>
        {children}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/menu/EditorialSplit.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/components/menu/EditorialSplit.tsx web/src/components/menu/EditorialSplit.test.tsx
git commit -m "feat(menu): add shared EditorialSplit component"
```

---

## Task 8: `SignatureSpotlight` — full-bleed macro + dish→split wrapper

**Files:**
- Create: `web/src/components/menu/SignatureSpotlight.tsx`
- Test: `web/src/components/menu/SignatureSpotlight.test.tsx`

Two exports: `FullBleedSpotlight` (Tier 1 — edge-to-edge macro with vignette, name, origin story, badge cluster, **named allergens in full**, price, Order Online) and `DishEditorialSplit` (Tier 2 — maps a `SanityMenuItem` into the shared `EditorialSplit`, with the same dish content). Both resolve their image via `resolveSpotlightImage`, suppress `Order Online` when sold out, and render no origin element when `origin` is absent.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FullBleedSpotlight, DishEditorialSplit } from './SignatureSpotlight'
import type { SanityMenuItem } from '@/types/sanity'

const dish = (over: Partial<SanityMenuItem>): SanityMenuItem =>
  ({ id: 'rj', slug: 'rj', name: 'Rogan Josh', description: 'Slow-cooked lamb.', prices: [{ context: 'main', amount: 14.5 }], dietary: [], allergens: ['milk'], spiceLevel: 3, ...over }) as SanityMenuItem

describe('FullBleedSpotlight', () => {
  it('renders name, price, named allergens and an Order Online link', () => {
    render(<FullBleedSpotlight item={dish({ origin: 'Kashmir' })} orderUrl="https://order.example.com" />)
    expect(screen.getByRole('heading', { name: 'Rogan Josh' })).toBeInTheDocument()
    expect(screen.getByText('Kashmir')).toBeInTheDocument()
    expect(screen.getByText(/£14\.50/)).toBeInTheDocument()
    expect(screen.getByText(/Dairy/)).toBeInTheDocument() // named allergen in full
    expect(screen.getByRole('link', { name: /order online/i })).toBeInTheDocument()
  })

  it('renders no origin element when origin is absent', () => {
    const { container } = render(<FullBleedSpotlight item={dish({ origin: null })} orderUrl="https://o" />)
    expect(container.querySelector('.spotlight__origin')).toBeNull()
  })

  it('suppresses Order Online when sold out', () => {
    render(<FullBleedSpotlight item={dish({ soldOut: true })} orderUrl="https://o" />)
    expect(screen.queryByRole('link', { name: /order online/i })).toBeNull()
  })
})

describe('DishEditorialSplit', () => {
  it('renders the dish as an editorial split with name and price', () => {
    render(<DishEditorialSplit item={dish({})} orderUrl="https://o" side="right" />)
    expect(screen.getByRole('heading', { name: 'Rogan Josh' })).toBeInTheDocument()
    expect(screen.getByText(/£14\.50/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/menu/SignatureSpotlight.test.tsx`
Expected: FAIL — cannot find module `./SignatureSpotlight`.

- [ ] **Step 3: Implement**

Create `web/src/components/menu/SignatureSpotlight.tsx`:

```tsx
import Image from 'next/image'
import type { SanityMenuItem } from '@/types/sanity'
import { resolveSpotlightImage } from '@/lib/images/dish'
import { DishStates } from './DishStates'
import { AllergenList } from './AllergenList'
import { PriceBadge } from './PriceBadge'
import { OrderOnlineButton } from './OrderOnlineButton'
import { EditorialSplit } from './EditorialSplit'

/** Shared content block for both spotlight tiers: badge cluster, origin story,
 *  named allergens, price, Order Online. */
function SpotlightDetails({ item, orderUrl }: { item: SanityMenuItem; orderUrl?: string | null }) {
  return (
    <>
      <DishStates item={item} variant="cluster" />
      {item.origin && <p className="spotlight__origin">{item.origin}</p>}
      {item.description && <p className="spotlight__desc">{item.description}</p>}
      <AllergenList allergens={item.allergens} />
      <div className="spotlight__footer">
        <PriceBadge prices={item.prices} priceOnRequest={item.priceOnRequest} />
        <OrderOnlineButton url={orderUrl} soldOut={item.soldOut} />
      </div>
    </>
  )
}

/** Tier 1 — one edge-to-edge macro spotlight with a soft diagonal vignette. */
export function FullBleedSpotlight({ item, orderUrl }: { item: SanityMenuItem; orderUrl?: string | null }) {
  const img = resolveSpotlightImage(item)
  return (
    <section className={`spotlight spotlight--full${item.soldOut ? ' spotlight--sold-out' : ''}`} aria-label={item.name}>
      <div className="spotlight__media">
        <Image src={img.url} alt={img.alt} fill priority sizes="100vw" className="spotlight__img" />
        <div className="spotlight__vignette" aria-hidden="true" />
      </div>
      <div className="spotlight__overlay">
        <h2 className="spotlight__name">{item.name}</h2>
        <SpotlightDetails item={item} orderUrl={orderUrl} />
      </div>
    </section>
  )
}

/** Tier 2 — an editorial split rendered from a dish, alternating side. */
export function DishEditorialSplit({ item, orderUrl, side }: { item: SanityMenuItem; orderUrl?: string | null; side: 'left' | 'right' }) {
  const img = resolveSpotlightImage(item)
  return (
    <EditorialSplit image={img} title={item.name} eyebrow={item.origin} side={side}>
      <SpotlightDetails item={item} orderUrl={orderUrl} />
    </EditorialSplit>
  )
}
```

Note: `EditorialSplit` already renders `item.origin` as its eyebrow, so the split's `SpotlightDetails` will also show an origin line — that is intentional duplication-free only if we drop the origin from details here. To avoid showing origin twice in the split, the eyebrow carries it; remove the `spotlight__origin` line for splits by passing a flag. Update `SpotlightDetails` to accept `showOrigin` and have `DishEditorialSplit` pass `showOrigin={false}`:

```tsx
function SpotlightDetails({ item, orderUrl, showOrigin = true }: { item: SanityMenuItem; orderUrl?: string | null; showOrigin?: boolean }) {
  return (
    <>
      <DishStates item={item} variant="cluster" />
      {showOrigin && item.origin && <p className="spotlight__origin">{item.origin}</p>}
      {item.description && <p className="spotlight__desc">{item.description}</p>}
      <AllergenList allergens={item.allergens} />
      <div className="spotlight__footer">
        <PriceBadge prices={item.prices} priceOnRequest={item.priceOnRequest} />
        <OrderOnlineButton url={orderUrl} soldOut={item.soldOut} />
      </div>
    </>
  )
}
```

And in `DishEditorialSplit`, render `<SpotlightDetails item={item} orderUrl={orderUrl} showOrigin={false} />`.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/menu/SignatureSpotlight.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/components/menu/SignatureSpotlight.tsx web/src/components/menu/SignatureSpotlight.test.tsx
git commit -m "feat(menu): add SignatureSpotlight (full-bleed + dish editorial split)"
```

---

## Task 9: `QuietList` — name/price/origin/glyph list grouped by sub-section

**Files:**
- Create: `web/src/components/menu/QuietList.tsx`
- Test: `web/src/components/menu/QuietList.test.tsx`

Renders the remaining dishes as clean Marcellus names + `--color-saffron-ink` prices + origin tags (where present) + inline state glyphs, grouped by sub-section with a diamond sub-heading. No images. A group with a `label` gets a diamond sub-heading; a single unlabeled group renders flat. Sold-out rows are marked.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuietList } from './QuietList'
import type { SanityMenuItem } from '@/types/sanity'

const dish = (over: Partial<SanityMenuItem>): SanityMenuItem =>
  ({ id: 'a', slug: 'a', name: 'Dish A', description: null, prices: [{ context: 'standard', amount: 8 }], dietary: [], allergens: [], spiceLevel: 0, ...over }) as SanityMenuItem

describe('QuietList', () => {
  it('renders grouped sub-headings and dish names with prices', () => {
    render(<QuietList groups={[
      { id: 'g1', label: 'Traditional', items: [dish({ id: 'a', name: 'Onion Bhaji' })] },
      { id: 'g2', label: 'Signature', items: [dish({ id: 'b', name: 'Chaat' })] },
    ]} />)
    expect(screen.getByRole('heading', { name: 'Traditional' })).toBeInTheDocument()
    expect(screen.getByText('Onion Bhaji')).toBeInTheDocument()
    expect(screen.getByText('Chaat')).toBeInTheDocument()
    expect(screen.getAllByText(/£8\.00/)).toHaveLength(2)
  })

  it('renders an origin tag only when present', () => {
    const { container } = render(<QuietList groups={[
      { id: 'g', items: [dish({ id: 'a', origin: 'Punjab' }), dish({ id: 'b', origin: null })] },
    ]} />)
    const origins = container.querySelectorAll('.quiet-row__origin')
    expect(origins).toHaveLength(1)
    expect(origins[0].textContent).toBe('Punjab')
  })

  it('omits the sub-heading for an unlabeled group', () => {
    const { container } = render(<QuietList groups={[{ id: 'g', items: [dish({})] }]} />)
    expect(container.querySelector('.quiet-list__subheading')).toBeNull()
  })

  it('marks a sold-out row', () => {
    render(<QuietList groups={[{ id: 'g', items: [dish({ soldOut: true })] }]} />)
    expect(screen.getByText(/sold out/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/menu/QuietList.test.tsx`
Expected: FAIL — cannot find module `./QuietList`.

- [ ] **Step 3: Implement**

Create `web/src/components/menu/QuietList.tsx`:

```tsx
import type { SanityMenuItem } from '@/types/sanity'
import { DishStates } from './DishStates'
import { PriceBadge } from './PriceBadge'

export interface QuietListGroup {
  id: string
  /** Sub-section heading; omit for a single flat group. */
  label?: string
  items: SanityMenuItem[]
}

function QuietRow({ item }: { item: SanityMenuItem }) {
  return (
    <li className={`quiet-row${item.soldOut ? ' quiet-row--sold-out' : ''}`}>
      <div className="quiet-row__head">
        <span className="quiet-row__name">{item.name}</span>
        {item.origin && <span className="quiet-row__origin">{item.origin}</span>}
        <DishStates item={item} variant="inline" />
        <span className="quiet-row__dots" aria-hidden="true" />
        <span className="quiet-row__price"><PriceBadge prices={item.prices} priceOnRequest={item.priceOnRequest} /></span>
      </div>
      {item.description && <p className="quiet-row__desc">{item.description}</p>}
    </li>
  )
}

/** The quiet third tier: a legible, image-free list grouped by sub-section. */
export function QuietList({ groups }: { groups: QuietListGroup[] }) {
  const populated = groups.filter(g => g.items.length)
  if (!populated.length) return null
  return (
    <div className="quiet-list">
      {populated.map(group => (
        <section key={group.id} className="quiet-list__group">
          {group.label && (
            <div className="quiet-list__subheading">
              <span className="quiet-list__diamond" aria-hidden="true">◆</span>
              <h3 className="quiet-list__subheading-text">{group.label}</h3>
            </div>
          )}
          <ul className="quiet-list__rows" role="list">
            {group.items.map(item => <QuietRow key={item.id} item={item} />)}
          </ul>
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/menu/QuietList.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add web/src/components/menu/QuietList.tsx web/src/components/menu/QuietList.test.tsx
git commit -m "feat(menu): add QuietList tier (grouped name/price/origin/glyph list)"
```

---

## Task 10: Compose the three tiers on the category page

**Files:**
- Modify: `web/src/app/menu/[categorySlug]/page.tsx`

Compose `FullBleedSpotlight` → `DishEditorialSplit`(s, alternating) → `QuietList` (grouped by sub-section) → `settings.allergenNotice`. Fetch settings for `onlineOrderingUrl` and `allergenNotice`. Both the combined-section branch and the single-category branch use the engine. Degrades to a pure quiet list when no item is `signature`.

- [ ] **Step 1: Update imports and add a settings fetch**

In `web/src/app/menu/[categorySlug]/page.tsx`, replace the import block

```ts
import { ALL_MENU_CATEGORIES, MENU_ITEMS_BY_CATEGORY, MENU_ITEMS_BY_CATEGORY_IDS } from '@/lib/sanity/queries'
import type { SanityMenuCategory, SanityMenuItem } from '@/types/sanity'
import { MenuItemGrid } from '@/components/menu/MenuItemGrid'
import { ALL_SECTIONS, SECTION_BY_SLUG } from '@/lib/menu/sections'
```

with

```ts
import { ALL_MENU_CATEGORIES, MENU_ITEMS_BY_CATEGORY, MENU_ITEMS_BY_CATEGORY_IDS, SITE_SETTINGS } from '@/lib/sanity/queries'
import type { SanityMenuCategory, SanityMenuItem, SanitySiteSettings } from '@/types/sanity'
import { selectSpotlights } from '@/lib/menu/spotlights'
import { FullBleedSpotlight, DishEditorialSplit } from '@/components/menu/SignatureSpotlight'
import { QuietList, type QuietListGroup } from '@/components/menu/QuietList'
import { ALL_SECTIONS, SECTION_BY_SLUG } from '@/lib/menu/sections'
```

- [ ] **Step 2: Add a shared render helper above the component**

Directly above `export default async function CategoryPage(...)`, add a helper that renders the three tiers from a list of items + pre-built quiet-list groups:

```tsx
function MenuTiers({
  items,
  groups,
  orderUrl,
}: {
  items: SanityMenuItem[]
  groups: QuietListGroup[]
  orderUrl?: string | null
}) {
  const { fullBleed, splits, rest } = selectSpotlights(items)
  const chosen = new Set([fullBleed?.id, ...splits.map(s => s.id)].filter(Boolean))
  // Drop promoted dishes from the quiet-list groups so nothing renders twice.
  const quietGroups: QuietListGroup[] = groups
    .map(g => ({ ...g, items: g.items.filter(i => !chosen.has(i.id)) }))
    .filter(g => g.items.length)

  return (
    <>
      {fullBleed && <FullBleedSpotlight item={fullBleed} orderUrl={orderUrl} />}
      {splits.map((item, i) => (
        <DishEditorialSplit key={item.id} item={item} orderUrl={orderUrl} side={i % 2 === 0 ? 'left' : 'right'} />
      ))}
      <QuietList groups={quietGroups} />
    </>
  )
}
```

Note: `selectSpotlights` already computes `rest`, but the page groups items by sub-section for the quiet list, so we filter the promoted ids out of the page's own groups instead of using `rest` directly. `rest` is intentionally unused here.

- [ ] **Step 3: Rewrite the combined-section branch body**

Within `if (section) { ... }`, replace the returned JSX (from `return (` down to its closing `)`), keeping the data-fetching above it, with:

```tsx
    const settings = await publicClient.fetch<SanitySiteSettings | null>(SITE_SETTINGS)

    const groups: QuietListGroup[] = section.showSubHeadings
      ? sectionCats
          .filter(cat => itemsByCat.has(cat.id))
          .map(cat => ({ id: cat.id, label: cat.label, items: itemsByCat.get(cat.id)! }))
      : [{ id: section.slug, items }]

    return (
      <div className="category-page">
        <div className="category-page__hero">
          <Link href="/menu" className="category-page__back">← Menu</Link>
          <h1 className="category-page__title">{section.label}</h1>
          {section.description && <p className="category-page__desc">{section.description}</p>}
        </div>
        <div className="category-page__body">
          <MenuTiers items={items} groups={groups} orderUrl={settings?.onlineOrderingUrl} />
          <div className="container">
            <p className="allergen-notice">
              {settings?.allergenNotice ??
                'Please inform your server of any allergies or dietary requirements. Full allergen information is available on request.'}
            </p>
          </div>
        </div>
      </div>
    )
```

The legend is dropped — states are self-describing via title/aria and the spotlights/allergen notice carry the detail. (If a visible legend is wanted later it can return as its own component.)

- [ ] **Step 4: Rewrite the single-category fallback branch**

Replace the final `return (` block (the single Sanity category branch) with:

```tsx
  const settings = await publicClient.fetch<SanitySiteSettings | null>(SITE_SETTINGS)
  const groups: QuietListGroup[] = [{ id: cat.id, items }]

  return (
    <div className="category-page">
      <div className="category-page__hero">
        <Link href="/menu" className="category-page__back">← Menu</Link>
        <h1 className="category-page__title">{cat.label}</h1>
        {cat.description && <p className="category-page__desc">{cat.description}</p>}
        {cat.availability && <p className="category-page__avail">Available {cat.availability}</p>}
      </div>
      <div className="category-page__body">
        <MenuTiers items={items} groups={groups} orderUrl={settings?.onlineOrderingUrl} />
        <div className="container">
          <p className="allergen-notice">
            {settings?.allergenNotice ??
              'Please inform your server of any allergies or dietary requirements. Full allergen information is available on request.'}
          </p>
        </div>
      </div>
    </div>
  )
```

- [ ] **Step 5: Remove the now-unused `MenuItemGrid` usage**

Confirm `MenuItemGrid` is no longer referenced in this file (both branches now use `MenuTiers`). The import was already removed in Step 1. Leave `MenuItemGrid`/`MenuItemCard` files in place — the print page and legacy paths may still use them.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: clean. (If `rest` triggers an unused-var lint later, it is destructured for clarity; eslint is unconfigured here so tsc is the gate.)

- [ ] **Step 7: Run the full unit suite**

Run: `npm run test:run`
Expected: all green (existing + new Phase-3 tests).

- [ ] **Step 8: Commit**

```bash
git add web/src/app/menu/\[categorySlug\]/page.tsx
git commit -m "feat(menu): compose 3-tier category page (spotlights + quiet list + allergen notice)"
```

---

## Task 11: Restyle the menu index (cream + diamond dividers)

**Files:**
- Modify: `web/src/app/menu/page.tsx`

Keep `FOOD_SECTIONS` / `DRINK_SECTIONS` / routing untouched; restyle the group headings to the diamond motif so the index reads as a clean, elegant list (not a busy photo grid). Markup change is minimal — a diamond glyph on each group heading; the cream/saffron look lands in CSS (Task 12).

- [ ] **Step 1: Add a diamond glyph to each group heading**

In `web/src/app/menu/page.tsx`, for each of the three `<h2 ... className="menu-group__heading">` elements, prefix the label text with a decorative diamond span. For example change:

```tsx
          <h2 id="group-a-la-carte" className="menu-group__heading">À La Carte</h2>
```

to:

```tsx
          <h2 id="group-a-la-carte" className="menu-group__heading">
            <span className="menu-group__diamond" aria-hidden="true">◆</span>À La Carte
          </h2>
```

Apply the same pattern to the `group-drinks` heading (`Drinks`) and the `group-set-menus` heading (`Set Menus`), each with its own `<span className="menu-group__diamond" aria-hidden="true">◆</span>` prefix.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/menu/page.tsx
git commit -m "feat(menu): diamond dividers on the restrained menu index"
```

---

## Task 12: Styles for spotlights, editorial split, quiet list, states, and index

**Files:**
- Modify: `web/src/app/globals.css`

Add the Phase-3 styles. All saffron-on-cream **text** uses `--color-saffron-ink`, never `--color-saffron` (contrast rule). Spotlight overlays sit on dark imagery, so saffron/amber/cream text is allowed there. Media use fixed aspect ratios (no CLS).

- [ ] **Step 1: Append the Phase-3 block to `globals.css`**

Append at the end of `web/src/app/globals.css`:

```css
/* ── Menu index: diamond on group headings ─────────────────────────── */
.menu-group__diamond { color: var(--color-saffron-ink); font-size: .6em; margin-right: .6rem; vertical-align: middle; }

/* ── Category page body holds full-bleed spotlights, so no container ── */
.category-page__body { padding: 0 0 3rem; }
.category-page__body > .container { padding-top: 2rem; }

/* ── Tier 1: full-bleed macro spotlight ────────────────────────────── */
.spotlight--full { position: relative; min-height: clamp(360px, 60vh, 560px); display: flex; align-items: flex-end; overflow: hidden; }
.spotlight__media { position: absolute; inset: 0; }
.spotlight__img { object-fit: cover; }
.spotlight__vignette { position: absolute; inset: 0; background: linear-gradient(115deg, rgba(20,7,0,.82) 0%, rgba(20,7,0,.45) 45%, rgba(20,7,0,.05) 80%); }
.spotlight__overlay { position: relative; padding: 2rem 1.5rem 2.5rem; max-width: 40rem; color: var(--color-cream); }
.spotlight__name { font-family: var(--font-display); font-weight: 400; font-size: clamp(2rem, 6vw, 3.25rem); line-height: 1.1; color: var(--color-cream); }
.spotlight__origin { color: var(--color-amber); letter-spacing: .12em; text-transform: uppercase; font-size: .75rem; margin: .5rem 0 0; }
.spotlight__desc { color: rgba(255,248,239,.85); line-height: 1.6; margin: .75rem 0 0; max-width: 48ch; }
.spotlight--full .allergen-list { color: rgba(255,248,239,.7); }
.spotlight__footer { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; margin-top: 1.25rem; }
.spotlight--full .price { color: var(--color-amber); font-size: 1.25rem; font-weight: 700; }
.spotlight--sold-out .spotlight__name { opacity: .85; }

/* ── Tier 2: editorial split (shared with About) ───────────────────── */
.editorial-split { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(1.5rem, 4vw, 3.5rem); align-items: center; max-width: 1100px; margin: 3.5rem auto; padding: 0 1.5rem; }
.editorial-split--right { direction: rtl; }
.editorial-split--right > * { direction: ltr; }
.editorial-split__media { position: relative; aspect-ratio: 4 / 5; border-radius: var(--radius); overflow: hidden; }
.editorial-split__img { object-fit: cover; }
.editorial-split__eyebrow { color: var(--color-saffron-ink); letter-spacing: .12em; text-transform: uppercase; font-size: .75rem; margin: 0 0 .5rem; }
.editorial-split__title { font-family: var(--font-display); font-weight: 400; font-size: clamp(1.75rem, 4vw, 2.75rem); color: var(--color-ink); line-height: 1.1; margin: 0; }
.editorial-split .spotlight__origin { color: var(--color-saffron-ink); }
.editorial-split .spotlight__desc { color: var(--color-ink-muted); }
.editorial-split .price { color: var(--color-saffron-ink); font-size: 1.15rem; font-weight: 700; }
@media (max-width: 860px) {
  .editorial-split { grid-template-columns: 1fr; margin: 2.5rem auto; }
  .editorial-split--right { direction: ltr; }
}

/* ── Spotlight state cluster ───────────────────────────────────────── */
.dish-states { display: inline-flex; align-items: center; gap: .4rem; flex-wrap: wrap; }
.dish-states--cluster { margin: .75rem 0 0; }
.spice-chillies { display: inline-flex; gap: 1px; font-size: .8rem; line-height: 1; }
.spice-chillies__chilli { filter: grayscale(1) opacity(.35); }
.spice-chillies__chilli--on { filter: none; }
.dish-states__allergen { color: var(--color-saffron-ink); font-size: .85rem; cursor: help; }

/* ── Tier 3: quiet list ────────────────────────────────────────────── */
.quiet-list { max-width: 760px; margin: 3rem auto 0; padding: 0 1.5rem; }
.quiet-list__group { margin-bottom: 2.5rem; }
.quiet-list__subheading { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.25rem; }
.quiet-list__diamond { color: var(--color-saffron-ink); font-size: .55rem; }
.quiet-list__subheading-text { font-family: var(--font-display); font-weight: 400; font-size: 1.4rem; color: var(--color-ink); margin: 0; }
.quiet-list__subheading::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }
.quiet-list__rows { list-style: none; margin: 0; padding: 0; }
.quiet-row { padding: .75rem 0; border-bottom: 1px solid var(--color-border); }
.quiet-row__head { display: flex; align-items: baseline; gap: .5rem; }
.quiet-row__name { font-family: var(--font-display); font-size: 1.05rem; color: var(--color-ink); }
.quiet-row__origin { color: var(--color-saffron-ink); font-size: .7rem; letter-spacing: .08em; text-transform: uppercase; }
.quiet-row .dish-states { font-size: .9rem; }
.quiet-row__dots { flex: 1; border-bottom: 1px dotted var(--color-border); transform: translateY(-3px); min-width: 1.5rem; }
.quiet-row__price { color: var(--color-saffron-ink); font-weight: 700; white-space: nowrap; }
.quiet-row__price .price { color: var(--color-saffron-ink); }
.quiet-row__desc { color: var(--color-ink-muted); font-size: .85rem; line-height: 1.5; margin: .25rem 0 0; max-width: 60ch; }
.quiet-row--sold-out .quiet-row__name { opacity: .55; text-decoration: line-through; }

/* ── Order Online button spacing in spotlights ─────────────────────── */
.order-online-btn { font-size: .8rem; }
```

- [ ] **Step 2: Add the sold-out marker text for quiet rows**

The `QuietList` test asserts a visible "sold out" text in a sold-out row, but the row markup above relies on `DishStates` for the sold-out `Badge`. `DishStates` inline variant **does** render the sold-out `Badge` ("Sold out"), satisfying the test. No extra CSS needed beyond `.quiet-row--sold-out` above. Confirm by re-reading Task 9's component: the `<DishStates variant="inline">` renders `<Badge variant="sold-out">Sold out</Badge>`. ✓ No action — this step is a verification checkpoint.

- [ ] **Step 3: Type-check + full test run**

Run: `npx tsc --noEmit && npm run test:run`
Expected: tsc clean; all Vitest green.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/globals.css
git commit -m "style(menu): spotlights, editorial split, quiet list, state glyphs, index diamonds"
```

---

## Task 13: Final gates + memory update

**Files:**
- (verification only) + update `/Users/ag/.claude/projects/-Users-ag-Workspace-kahani/memory/project_kahani_redesign_phases.md`

- [ ] **Step 1: Full unit suite**

Run: `npm run test:run`
Expected: all green. Record the pass count.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Build to "compiled successfully"**

Run: `npx next build`
Expected: prints `✓ Compiled successfully`. The subsequent `Configuration must contain 'projectId'` error is the **known no-credentials limit** and is not a failure of this work. Do not claim a successful production build or any visual/responsive/a11y verification.

- [ ] **Step 4: Update the phases memory**

In `project_kahani_redesign_phases.md`, mark Phase 3 **DONE (2026-06-13)** with: plan path, the components/lib added (`selectSpotlights`, `resolveSpotlightImage`, `DishStates`, `OrderOnlineButton`, `EditorialSplit`, `SignatureSpotlight`, `QuietList`), schema fields added (`signature`, `origin`), the runnable-gate results, and the carried-forward items: (a) **owner content task** — seed `signature` flags + best-guess `origin` on promoted dishes in Sanity (engine degrades to quiet list until then); (b) spotlight stock photos are temporary (`[[todo-food-photography]]`); (c) visual/responsive/a11y + true `next build` success still deferred to a credentialed environment; (d) `EditorialSplit` is ready for Phase 4 About reuse.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-06-13-frontend-redesign-phase3-menu.md
git commit -m "docs(redesign): add Phase 3 (Menu) implementation plan"
```

(The memory file lives outside the repo and is saved separately via the memory tooling, not committed.)

---

## Spec coverage check

- Restrained index with diamond dividers, existing FOOD/DRINK sections + routing untouched → Tasks 11–12.
- Tier 1 full-bleed macro w/ vignette, name, origin story, badges, named allergens, price, Order Online → Task 8 (`FullBleedSpotlight`) + Task 12 CSS.
- Tier 2 editorial split, alternating, stacks on mobile, **shared** component → Tasks 7–8, CSS Task 12.
- Tier 3 quiet list grouped by sub-section, saffron-ink prices, origin where present, inline glyphs, no images, sold-out marked → Task 9.
- Mandatory states in all three tiers; spice as scaled chillies; seasonal/sold-out reuse `Badge`; single allergen affordance in list, named-in-full in spotlights; sold-out suppresses Order Online → Tasks 5, 6, 8, 9.
- `Order Online` external single global URL, hidden when absent → Task 6.
- Origin optional, no gap when absent → Tasks 8, 9 (tested).
- Spotlight selection data-driven via `signature`; graceful degradation when none flagged → Tasks 1–3, 10 (tested via `selectSpotlights` no-signature case + page falls through to quiet list).
- `settings.allergenNotice` once per category page → Task 10.
- Image strategy: `next/image`, fixed aspect ratios, single `priority` LCP (full-bleed spotlight), fallback module → Tasks 4, 7, 8, 12.
- Contrast rule (`--color-saffron-ink` for text on cream) → Task 12.
- Stock fallback in one module, owner photos override with no code change → Task 4.

**Deferred to a credentialed environment (cannot run locally):** visual/responsive/a11y QA, contrast audit on rendered pages, hero LCP measurement, true `next build` success. **Deferred to owner (Sanity content):** seeding `signature` + `origin`; reviewing spotlight selections; real photography.
