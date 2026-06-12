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
| `--color-saffron` | `#FF8C00` | Primary accent, buttons, frame, CTAs |
| `--color-amber` | `#FFB347` | Secondary accent, eyebrows, hovers |
| `--color-scrim` | `#1E0800` | Warm-dark hero scrim base |
| `--color-scrim-deep` | `#281000` | Gradient stop / footer |
| `--color-cream` | `#FFF8F0` | Body / section background |
| `--color-ink` | `#1C0800` | Primary text on cream |
| `--color-ink-muted` | `~#9A6838` | Secondary text, descriptions |
| `--color-border` | `~#EFE0CC` | Hairline dividers on cream |

Exact muted/border shades to be finalised during implementation; the five anchor
colours above are fixed.

### Typography
- **Display:** Marcellus (headings, nav logo, dish names) — Roman inscriptional serif,
  heritage feel.
- **Body:** Karla (body copy, eyebrows, buttons, prices) — warm humanist grotesque.
- Loaded via `next/font/google`, keeping the existing `--font-display` / `--font-body`
  CSS variables so downstream styles need no change.

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

- **Persistent minimal header:** `Kahani` wordmark (Marcellus) left; `Book a Table`
  button + hamburger/`Menu` toggle right. Nothing else.
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
   ("Award-winning · Edinburgh"), headline **"Every plate has a *story*"**, and
   `Our Menu` / `Book a Table` actions. `prefers-reduced-motion` freezes on the first
   slide. New `HeroCarousel` client component.
3. **Chef's Selection.** Reuses the existing `FeaturedCarousel`, restyled to cream +
   saffron, adds a regional-origin tag per dish and a diamond divider heading.
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
   diagonal vignette; name, one-line origin story, price, and an `Add to Order` button.
2. **One or two Editorial Split spotlights** — tall macro photo + generous whitespace,
   eyebrow, large Marcellus name, origin story, price, order button; alternating
   left/right for rhythm; stacks on mobile.
3. **Quiet list** — all remaining dishes as clean Marcellus names + saffron prices +
   origin tags, grouped by sub-section with a diamond sub-heading divider. No images.

**Spotlight selection is data-driven:** a new `signature` boolean on the `menuItem`
Sanity schema (plus its existing image) decides which dishes are promoted and in what
order. The owner controls upselling with no code change. If no item in a category is
flagged, the page degrades gracefully to the quiet list.

## Component & code impact

- `web/src/app/layout.tsx` — swap fonts to Marcellus + Karla; keep CSS variables.
- `web/src/components/navigation/SiteNav.tsx` — replace with the translucent dropdown
  nav (client component; focus trap, Esc, aria state).
- `web/src/app/globals.css` — update design tokens; add styles for hero carousel, frame,
  diamonds, nav overlay, signature spotlights, restyled sections. Most existing
  component classes inherit the new palette through tokens.
- **New:** `HeroCarousel.tsx`; `SignatureSpotlight.tsx` (full-bleed + split variants).
- `FeaturedCarousel.tsx` — restyle + origin tag (no structural change).
- Menu category page (`web/src/app/menu/[categorySlug]/page.tsx`) — compose spotlights
  above the quiet list using the `signature` flag.
- Sanity: add `signature` boolean to `studio/src/schemas/documents/menuItem.ts` (and the
  embedded web studio schema); extend the category query to return signature items +
  images.
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
- `prefers-reduced-motion`: hero carousel freezes; nav cascade reduced.
- Spot-check a category with 0, 1, and 3 signature items for graceful degradation.

## Out of scope / follow-ups

- Real food photography (owner upload) — `[[todo-food-photography]]`.
- About / Contact dedicated visual polish.
- Any menu **content** changes (this is presentation only).
