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
- **Story.** The brand idea is "Every plate has a story" — dishes carry a regional
  origin (Kashmir, Punjab, Gujarat…).
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
- See `[[todo-food-photography]]`.

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
  large Marcellus, staggered in: Home · Menu · About · Find Us.
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
   saffron (prices/tags in `--color-saffron-ink` for contrast), adds a regional-origin
   tag per dish (same graceful empty state — no origin, no tag, no gap) and a diamond
   divider heading. Keeps its existing `DietaryBadge`.
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
cart** — ordering is an external link. The button must say `Order Online` and link to the
external ordering platform (deep-linked to the category where the platform supports it),
never imply an on-site basket.

**Origin tags — best-guess now, graceful empty state.** Region tags (e.g. "Punjab",
"Kashmir") and the one-line spotlight origin stories are **populated with a sensible
best-guess for launch** and flagged for the owner to review/correct before production
(`[[project-kahani-restaurant]]`). The empty state is explicit: **if a dish has no
origin, the tag and its surrounding separator simply do not render** — no gap, no
placeholder dash, no "—". The row must look intentional with or without an origin.

**Spotlight selection is data-driven:** a new `signature` boolean on the `menuItem`
Sanity schema (plus its existing image) decides which dishes are promoted and in what
order. The owner controls upselling with no code change. If no item in a category is
flagged, the page degrades gracefully to the quiet list.

**Spotlight photography caveat (issue acknowledged).** Tier-1/Tier-2 spotlights make a
dish-specific upsell promise, so stock macro photos are weakest exactly here. All stock
imagery is temporary and overridden by the owner's real Sanity photos with no code change
(`[[todo-food-photography]]`); until then, choose stock that closely matches actual
plating, and the owner reviews spotlight selections before production.

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
- **New:** `HeroCarousel.tsx`; `SignatureSpotlight.tsx` (full-bleed + split variants).
- `FeaturedCarousel.tsx` — restyle + origin tag (no structural change).
- Menu category page (`web/src/app/menu/[categorySlug]/page.tsx`) — compose spotlights
  above the quiet list using the `signature` flag.
- `SignatureSpotlight.tsx` — renders `Order Online` (external link), not an on-site
  cart action.
- Sanity: add `signature` boolean to `studio/src/schemas/documents/menuItem.ts` (and the
  embedded web studio schema); extend the category query to return signature items +
  images. Origin/region fields populated with best-guess content for launch, flagged for
  owner review.
- Imagery: a `heroImages` array and per-category/per-dish stock fallbacks that yield to
  Sanity images when present.

### Scope this round
Homepage + menu (index + category) + site-wide nav, footer, and design tokens. The
About and Contact pages inherit the new tokens automatically and get a dedicated polish
pass in a follow-up.

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

## Out of scope / follow-ups

- Real food photography (owner upload) — `[[todo-food-photography]]`.
- About / Contact dedicated visual polish.
- Existing menu **content** (names, prices, descriptions) is unchanged — this is
  presentation only. The new `signature` flag and best-guess origin/region metadata are
  the only data additions, and the **owner must review the origin guesses before
  production**.
- Optional deep-complementary accent for About/Gallery — only if those pages read as
  monotone in mockups.
