# Kahani Frontend Redesign — Design Spec

**Date:** 2026-06-11
**Branch / worktree:** `feat/frontend-redesign` (`../kahani-redesign`)
**Status:** Approved design, pending implementation plan

## Background

The owner rejected the previous site design (deep maroon + gold, Playfair/Montserrat,
single looping hero video, text-only menu cards that "look like a bunch of buttons").
This spec captures a fresh visual direction arrived at through a guided visual
brainstorm, drawing inspiration from the restaurant's name — *Kahani* ("story") — and
from a reference the owner likes, https://thamel.co.uk.

The redesign keeps the existing Next.js (App Router) + Sanity architecture and the
content model intact. It changes presentation only.

## Design principles

- **The food leads.** Photography is the primary visual element; geometry is restraint,
  not decoration. Earlier "busy" grid concepts were rejected.
- **Hierarchy over uniformity.** A few signature dishes get dramatic macro-photography
  spotlights to upsell; everything else recedes into a quiet, legible list.
- **Story.** The brand idea is "Every plate has a story" — promoted dishes can carry a
  regional origin (Kashmir, Punjab, Gujarat…) where it's known; it is never invented.
- **Modern, minimal, motion-forward.** Hidden navigation, live imagery, generous space.

## Visual identity (locked)

### Palette — "Saffron Fire"
| Token | Value | Use |
|---|---|---|
| `--color-saffron` | `#FF8C00` | **Fills only** — buttons, frame, diamonds, and saffron text **on dark backgrounds** |
| `--color-saffron-ink` | `#A8500A` | Saffron-toned **text on cream** — prices, links, eyebrows (burnt-orange that passes contrast) |
| `--color-amber` | `#FFB347` | Secondary accent, eyebrows, hovers **on dark backgrounds only** |
| `--color-scrim` | `#1E0800` | Warm-dark hero scrim base |
| `--color-scrim-deep` | `#281000` | Gradient stop / footer |
| `--color-cream` | `#FFF8F0` | Body / section background |
| `--color-ink` | `#1C0800` | Primary text on cream |
| `--color-ink-muted` | `~#8A5C2E` | Secondary text, descriptions |
| `--color-border` | `~#EFE0CC` | Hairline dividers on cream |

**Contrast rule (non-negotiable, fixes an accessibility defect):** pure
`--color-saffron` (`#FF8C00`) is **≈2.1:1 on cream and must never be used for text on
a light background.** It is reserved for fills and for text on dark scrim. For any
saffron-coloured *text on cream* — quiet-list prices, origin tags, inline links — use
`--color-saffron-ink` (`#A8500A`, ≈5.2:1 on cream, passes WCAG AA). `--color-ink-muted`
must also be verified ≥4.5:1 on cream (the `#8A5C2E` above clears it; do not lighten it).
Implementation must run a contrast check on every text/background pairing before sign-off.

The anchor colours are fixed. Note the palette is intentionally two warm oranges plus a
cream; if the About and Gallery pages read as monotone in mockups, the pressure valve is
a **single deep complementary** (forest green or indigo) used *very sparingly* as an
accent — not added now, only if those pages need it. Because saturated orange is the most
common Indian-restaurant accent on the web (and the owner twice rejected "generic"), the
premium feel depends on the frame, type, and restraint holding the line in
implementation — discipline here matters more than usual.

### Typography
- **Display:** Marcellus (headings, nav logo, dish names) — Roman inscriptional serif,
  heritage feel.
- **Body:** Karla (body copy, eyebrows, buttons, prices) — warm humanist grotesque.
- Loaded via `next/font/google`, keeping the existing `--font-display` / `--font-body`
  CSS variables so downstream styles need no change.

**Marcellus is single-weight (Regular 400) with no italic or bold (fixes a defect).**
- **No emphasis is ever rendered as italic in Marcellus** — the browser would synthesize
  a fake oblique that looks cheap at hero sizes. The signature headline emphasis (the
  "story" in **"Every plate has a story"**) is expressed with **colour**, not slant:
  `--color-amber` on the dark hero, `--color-saffron-ink` on cream. No `<em>`/italic
  styling on Marcellus anywhere; if true italic is ever wanted, it requires swapping the
  display face (out of scope now).
- **Heading hierarchy comes from size and colour only**, since weight is fixed at 400.
  Karla supplies the available weights (400/500/700/800) for body, buttons, and labels.

### Geometry motif
A diamond / jali language used consistently:
- Hero: thin **saffron inset frame** with **corner brackets** + top/bottom **diamond** accents.
- Section headings: a small `◆` diamond + hairline rule divider.
- Used boldly only on the hero; pulled right back everywhere else.

### Photography
- Licensed macro/close-up Indian-food stock now.
- Wired so the owner's real photos (uploaded in Sanity) override stock with **no code
  change** — image fields already exist on `menuItem`; a `heroImages` source and
  per-category images fall back to stock when Sanity has none.
- **All stock fallback URLs live in one module** (e.g. `src/lib/images/fallbacks.ts`),
  never scattered through components — this keeps the same content/presentation separation
  the project requires and makes the eventual swap-to-real trivial.
- See `[[todo-food-photography]]`.

### Performance & imagery (cross-cutting)
Image weight is the dominant Core Web Vitals risk: the hero carousel, the menu macro
spotlights, and the gallery masonry are all image-heavy. One shared strategy, applied
everywhere rather than per-page:
- Every image is `next/image` with correct responsive `sizes`; serve modern formats.
- **`priority` is used only for the single above-the-fold LCP image per page** (hero slide
  1, or the page's first full-bleed spotlight); everything else lazy-loads.
- Fixed aspect ratios / explicit dimensions on all media to hold layout (no CLS).
- Carousels preload only the first slide; subsequent slides load after first paint.
- Measure with a Lighthouse/perf check (see Local testing) before sign-off.

## Navigation — hidden dropdown (site-wide)

Replaces the current horizontal `SiteNav`. Applies on **every page**.

- **Persistent minimal header:** `Kahani` wordmark (Marcellus) left; on the right a plain
  **`Menu`** text link (→ the menu page), the `Book a Table` button, and the hamburger
  toggle. **This fixes a conflict with the project rule "make primary actions easy to
  reach / avoid hidden critical information on mobile":** viewing the menu is the #1 task
  on a restaurant site and must never be buried behind the hamburger. The toggle is
  labelled `≡` / "Open" (not "Menu", to avoid colliding with the menu link). Two words in
  the header does not break the minimalism.
- **On open:** a translucent dim (`rgba(16,7,0,0.55)`, **no blur**) covers the page;
  any animating hero **keeps animating** underneath, just dimmed.
- **Links cascade from the top-right, directly under the toggle**, right-aligned, in
  large Marcellus, staggered in: Home · Menu · About · Gallery · Find Us.
- Hairline saffron rule, then secondary actions (Book a Table · Order Online · Gift
  Vouchers) and a contact line (address · phone).
- Hamburger morphs to ✕ and label to "Close"; the page brightens back on close.
- One pattern on mobile and desktop.
- **Accessibility:** keyboard operable, `aria-expanded`/`aria-controls`, focus moves
  into the panel and is trapped while open, `Esc` closes, dim is click-to-close,
  respects `prefers-reduced-motion` (cascade/animations reduced).

## Homepage

1. **Header** — hidden dropdown nav (above).
2. **Hero — Framed Full-Bleed carousel.** 4–5 signature dishes cross-fading edge to
   edge behind the saffron frame + corner brackets + diamonds. Centred eyebrow
   ("Award-winning · Edinburgh"), headline **"Every plate has a story"** (the word
   "story" coloured amber, **not italic** — see Typography), and `Our Menu` /
   `Book a Table` actions. `prefers-reduced-motion` freezes on the first slide. New
   `HeroCarousel` client component.
   - **Performance (LCP):** the first slide is a preloaded, optimised `next/image`
     (`priority`); the remaining slides lazy-load after first paint. The carousel must
     not regress Largest Contentful Paint.
   - **Small phones:** the 18px inset frame + corner brackets crowd the headline below
     ~380px. The frame thins and the corner brackets drop at the smallest breakpoint so
     the headline keeps its breathing room.
3. **Chef's Selection.** Reuses the existing `FeaturedCarousel`, restyled to cream +
   saffron (prices/tags in `--color-saffron-ink` for contrast), shows a regional-origin
   tag **where one exists** (same graceful empty state — no origin, no tag, no gap) and a
   diamond divider heading. Keeps its existing `DietaryBadge`.
4. **Hours & Location.** Existing `HoursAndLocation`, restyled cream/saffron with a
   diamond divider.
5. **Ready to Visit?** Existing contact-actions grid (Call / Book / Order / Directions),
   restyled cards with saffron hover and diamond accents.
6. **Footer.** Existing `SiteFooter`, recoloured warm-dark + saffron.

## Menu — index page

Deliberately **restrained**: the drama lives inside categories, so the index is a clean,
elegant list of categories (Starters, Mains, Sides, Desserts, Drinks, Set Menus, Kids)
with diamond dividers and optional small thumbnails — **not** a busy photo grid. Keeps
the existing `FOOD_SECTIONS` / `DRINK_SECTIONS` data and routing untouched.

## Menu — category page (the upsell engine)

A three-tier hierarchy per category:

1. **One Full-Bleed Macro spotlight** at the top — edge-to-edge close-up with a soft
   diagonal vignette; name, one-line origin story, **dietary/allergen badges**, price,
   and an `Order Online` button.
2. **One or two Editorial Split spotlights** — tall macro photo + generous whitespace,
   eyebrow, large Marcellus name, origin story, **dietary/allergen badges**, price,
   `Order Online` button; alternating left/right for rhythm; stacks on mobile.
3. **Quiet list** — all remaining dishes as clean Marcellus names + `--color-saffron-ink`
   prices + origin tags + **small dietary/allergen glyphs after the name**, grouped by
   sub-section with a diamond sub-heading divider. No images.

**Dietary & allergen states are mandatory, not optional (fixes a defect).** The project
rules require clear states for sold out, seasonal, spicy, vegetarian, vegan,
gluten-free, and contains-allergens, and the existing `DietaryBadge` already carries
them. They must appear in **all three tiers**: as a small badge cluster in the two
spotlight tiers, and as quiet inline glyphs (e.g. a leaf for veg, a chilli for spicy)
immediately after the dish name in the list. A "sold out" item is visibly marked and its
`Order Online` action is suppressed. This is a safety/legal requirement, so it is never
dropped for aesthetics.

**`Order Online`, not `Add to Order` (fixes a defect).** The site has **no in-house
cart** — ordering is an external link. The data model exposes a **single global
`settings.onlineOrderingUrl`** (already used by the homepage, contact page, and footer),
so spotlight buttons link to that same URL in a new tab (`target="_blank"
rel="noopener noreferrer"`), consistent with the rest of the site. Per-category or
per-dish deep-linking is **not possible without new data** the owner would have to supply;
it is out of scope. The button never implies an on-site basket, and it is hidden when
`onlineOrderingUrl` is absent.

**Origin tags — optional, seeded only for promoted dishes.** `origin` is an **optional**
field. We do **not** best-guess a region for the whole menu (100+ items) — inventing a
wrong region ("Punjab" on a Gujarati dish) in front of customers is worse than showing
none, and it conflicts with the project rule against assuming restaurant details. Instead,
seed a best-guess origin **only for the handful of signature/spotlight dishes** we are
actively promoting, flagged for owner review (`[[project-kahani-restaurant]]`). Everything
else simply omits it. The empty state is explicit and is the common case: **if a dish has
no origin, the tag and its surrounding separator do not render** — no gap, no placeholder
dash, no "—". The row must look intentional with or without an origin.

**Spotlight selection is data-driven:** a new `signature` boolean on the `menuItem`
Sanity schema (plus its existing image) decides which dishes are promoted and in what
order. The owner controls upselling with no code change. If no item in a category is
flagged, the page degrades gracefully to the quiet list.

**Spotlight photography caveat (issue acknowledged).** Tier-1/Tier-2 spotlights make a
dish-specific upsell promise, so stock macro photos are weakest exactly here. All stock
imagery is temporary and overridden by the owner's real Sanity photos with no code change
(`[[todo-food-photography]]`); until then, choose stock that closely matches actual
plating, and the owner reviews spotlight selections before production.

## About page — "Our Kahani" (hybrid A/B)

A single vertical narrative with a **resilient backbone** plus an **optional story layer**,
so the page looks complete today (when narrative is placeholder) and deepens as the owner
writes real story — same layout, no rebuild.

**Backbone — renders from data we already have (no narrative authoring needed):**
1. Framed hero (same motif as homepage, but its **own** headline so the two pages don't
   read identically): eyebrow "Edinburgh · Indian Street Food", headline **"Our Kahani"**
   ("Kahani" amber, not italic).
2. Four "The Kahani difference" pillar cards: Street-Food Roots · Family Recipes ·
   Edinburgh Home (by St James Quarter & the Playhouse) · Catering & Events.
3. Award band ("Best Restaurant in Edinburgh — Scottish Curry Awards") — renders
   **whenever `settings.awards` has entries** (it currently does); hidden if empty.
4. Visit CTA (Book a Table · View the Menu) + footer.

The hero, pillars, and CTA always render; the award band is data-contingent as noted.

**Story layer — optional, owner-authored in Sanity, renders only when present:**
- A short **intro statement** (one or two sentences).
- An ordered list of **chapters**, each an editorial split (image + eyebrow "Chapter N" +
  Marcellus title + body), alternating left/right, **reusing the menu editorial-split
  component**. A chapter with no content **does not render** — no empty block, no gap.
  Any number of chapters is supported.

**Content model:** an `aboutStory` structure (on `siteSettings` or a dedicated
`aboutPage` document) with `intro` (text) and `chapters[]` (each: image, title, body,
optional eyebrow). The existing `description` / `awards` / `cuisine` fields still feed the
backbone. Seeds below are **best-guess for layout, flagged for owner review**
(`[[project-kahani-restaurant]]`).

**Seed copy (placeholder):**
- *Intro:* "Kahani" means story. Ours began on the busy food streets of India and found a
  home on Edinburgh's Antigua Street.
- *Chapter One — From the street stalls:* Kahani began with a memory: the clamour of an
  Indian roadside at dusk — tawas hissing, charcoal smoke curling over the crowd, the
  snap of fresh spice in the air. That is the energy we set out to capture — honest street
  food, cooked fast and full of flavour, the kind you eat on your feet and remember for
  years. We carried it north to a corner of Antigua Street and built our kitchen around it.
- *Chapter Two — Recipes, handed down:* Behind every dish is a recipe that was never
  written down — spice blends measured by eye and memory, passed from one generation's
  hands to the next. We cook them the slow way they were meant to be cooked, then plate
  them for a new city and a new table. Nothing here comes from a jar; everything here has
  a story.
- *Later (not seeded):* "A city's welcome" (award/recognition), "Beyond the table"
  (catering, events, afternoon tea).

## Gallery page — "Editorial Masonry" (mixed, filtered)

A browsable photo gallery mixing **Food / Interior / Events**, on the locked identity.

- **Layout:** editorial masonry — varied tile heights with a few larger "hero" tiles
  breaking the grid (hierarchy over uniformity, consistent with the rest of the site).
- **Filters:** chip bar (All · Food · Interior · Events) above the grid. Client-side
  filter; chips are real buttons, keyboard operable, with `aria-pressed`. **A category
  with no images hides its chip** (no empty filter).
- **Display-only — no lightbox.** Tiles do not enlarge. Each tile carries a small
  category badge and an optional short caption (e.g. a dish name) that rides on the image
  with a gradient scrim for legibility. (A tap-to-enlarge lightbox is a deliberate
  non-goal for launch — easy to add later if user feedback wants it.)
- **Resilience:** masonry needs a sensible minimum; with few photos it degrades toward a
  tidy uniform grid rather than looking sparse. Page still renders cleanly at a small
  photo count.
- **Performance:** images are `next/image`, lazy-loaded below the fold; tiles use fixed
  aspect ratios to avoid layout shift as the masonry fills.
- **Accessibility:** every image has meaningful `alt`; filter state announced; respects
  reduced-motion (no tile entrance animation if set).

**Content model:** a `galleryImage` source in Sanity — each image with a `category`
(`food` | `interior` | `events`), optional `caption`, optional `featured` (promotes it to
a large hero tile), and ordering. Falls back to curated stock until the owner uploads real
photos (`[[todo-food-photography]]`). Food tiles may reuse existing `menuItem` images.

## Component & code impact

- `web/src/app/layout.tsx` — swap fonts to Marcellus + Karla; keep CSS variables.
- `web/src/components/navigation/SiteNav.tsx` — replace with the translucent dropdown
  nav (client component; focus trap, Esc, aria state). Header keeps a persistent `Menu`
  text link + `Book a Table` button alongside the toggle.
- `web/src/app/globals.css` — update design tokens (including the new
  `--color-saffron-ink` text token and the contrast rule); add styles for hero carousel,
  frame, diamonds, nav overlay, signature spotlights, dietary/allergen badge clusters and
  inline glyphs, restyled sections. Most existing component classes inherit the new
  palette through tokens. Audit every saffron-on-cream text rule to use
  `--color-saffron-ink`, never `--color-saffron`.
- `DietaryBadge` — reused in spotlights (badge cluster) and the quiet list (small inline
  glyphs); add a compact/glyph variant if the current one is too heavy for the list.
- **New:** `HeroCarousel.tsx`; `SignatureSpotlight.tsx` (full-bleed + split variants). The
  **split variant is a shared `EditorialSplit`** — one reusable component used by both menu
  spotlights and About chapters, not two implementations.
- `FeaturedCarousel.tsx` — restyle + origin tag (no structural change).
- Menu category page (`web/src/app/menu/[categorySlug]/page.tsx`) — compose spotlights
  above the quiet list using the `signature` flag.
- `web/src/app/about/page.tsx` — rebuild as the hybrid A/B page: backbone (hero, pillars,
  award band, CTA) + optional intro/chapters from `aboutStory`, reusing the editorial-split
  component. Add `aboutStory` (`intro`, `chapters[]`) to the Sanity schema + query.
- **New:** `web/src/app/gallery/page.tsx` + a `GalleryGrid.tsx` client component (masonry
  + filter chips, display-only). Add a `galleryImage` schema (`category`, `caption`,
  `featured`, order) and query; stock fallback. Add `Gallery` to the nav links.
- `SignatureSpotlight.tsx` — renders `Order Online` (external link), not an on-site
  cart action.
- Sanity: add `signature` boolean to the **single** schema source at
  `studio/src/schemas/` (imported by `web/sanity.config.ts` as `../studio/src/schemas` and
  mounted by the web studio at `src/app/studio` — there is **no** separate embedded schema
  to keep in sync). Extend the category query to return signature items + images. Add an
  optional `origin` field, seeded only for promoted dishes (see Origin tags below).
- Imagery: a `heroImages` array and per-category/per-dish stock fallbacks that yield to
  Sanity images when present.

### Scope this round
Homepage + menu (index + category) + **About page (hybrid A/B)** + **Gallery page
(editorial masonry)** + site-wide nav, footer, and design tokens. The Contact /
reservations page inherits the new tokens automatically and gets a dedicated polish pass
in a follow-up.

This is a large surface for one undifferentiated build, so the **implementation plan must
be phased into independently shippable, separately testable stages**, each of which builds
green before the next starts. Suggested ordering:
1. **Foundation** — design tokens, font swap (Marcellus + Karla), site-wide dropdown nav,
   footer recolour.
2. **Homepage** — hero carousel, restyled Chef's Selection / Hours / contact sections.
3. **Menu** — restrained index + the 3-tier category engine (`signature` + `origin`,
   dietary states, `Order Online`).
4. **About** — hybrid backbone + optional story chapters (shared `EditorialSplit`).
5. **Gallery** — new route, `galleryImage` schema, masonry + filters.
Stages 2–5 each depend only on stage 1, so they can be reviewed and merged independently.

## Local testing

- `npm run dev` — local preview.
- `npm run build` — verify the production build compiles.
- Manual responsive checks at mobile / large-mobile / tablet / laptop / desktop widths.
- Navigation: keyboard open/close, focus trap, `Esc`, `aria-expanded`, click-to-dim-close.
  Confirm the persistent `Menu` link reaches the menu page without opening the overlay.
- `prefers-reduced-motion`: hero carousel freezes; nav cascade reduced.
- Spot-check a category with 0, 1, and 3 signature items for graceful degradation.
- **Contrast audit:** every text/background pairing ≥4.5:1 (normal) / ≥3:1 (large);
  specifically verify no pure `--color-saffron` text sits on cream.
- **Dietary/allergen states** render in all three menu tiers; a "sold out" item is marked
  and its `Order Online` action is suppressed.
- A dish with **no origin** renders cleanly (no empty tag, no stray separator).
- Hero LCP: first slide is `priority`/preloaded; confirm no LCP regression.
- Gallery: filter chips keyboard-operable with `aria-pressed`; a category with no images
  hides its chip; masonry degrades cleanly at a low photo count; below-fold images
  lazy-load without layout shift.
- **Performance check** (Lighthouse or equivalent) on the homepage, a menu category, and
  the gallery: confirm a single `priority` LCP image per page, no layout shift from
  imagery, and modern image formats served.

## Out of scope / follow-ups

- Real food photography (owner upload) — `[[todo-food-photography]]`.
- Real About narrative (owner replaces seed chapters; adds later chapters).
- Real gallery photos (owner upload replaces curated stock).
- Contact / reservations page dedicated visual polish.
- Existing menu **content** (names, prices, descriptions) is unchanged — this is
  presentation only. The new `signature` flag and best-guess origin/region metadata are
  the only data additions, and the **owner must review the origin guesses before
  production**.
- Optional deep-complementary accent for About/Gallery — only if those pages read as
  monotone in mockups.
