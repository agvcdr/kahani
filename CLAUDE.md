@AGENTS.md

# Claude Code Project Instructions

This is a no-source-code skeleton for a small restaurant website. Build future implementation around a modular content model and local testability.

## Working mode

Before writing source code in this repository, create a short implementation plan covering:
1. Framework and package manager choice
2. Content model for restaurant details and menu items
3. Component boundaries
4. Responsive strategy
5. Accessibility, SEO, and cross-browser test plan
6. Local commands that will exist after implementation

## Architecture requirements

- Keep content under `src/content/` and implementation under `src/components/`, `src/pages/`, `src/layouts/`, `src/lib/`, and `src/styles/`.
- Keep menu item data independent from presentation components.
- Add or update menu items by changing content files only, not page layout files.
- Build components that accept structured menu data rather than importing individual items manually.
- Keep page-level files thin and compose reusable sections.
- Prefer design tokens for spacing, type scale, breakpoints, colors, radius, shadows, and motion.

## Restaurant-specific requirements

- Assume customers will use mobile first to check menu, hours, address, and contact details.
- Make primary actions easy to reach: view menu, call restaurant, get directions, reserve/order if supported.
- Avoid hidden critical information on mobile.
- Include clear states for sold out, seasonal, spicy, vegetarian, vegan, gluten-free, and contains allergens.
- Represent prices and availability as data so they can change independently.

## Local testing expectations

When code is added later, define commands for:
- Local dev server
- Production build preview
- Unit or content validation tests
- Browser-based end-to-end tests
- Accessibility tests
- Visual responsive snapshots
- Performance checks

Do not claim local testing passes unless tests have actually been run.
