# Content Model

Menu and restaurant data should be modular and easy for a non-developer or future CMS integration to update.

## Restaurant site data

Store site-wide restaurant data under `src/content/site/`.

Suggested content groups:
- Restaurant identity: name, tagline, cuisine, short description
- Location: address, neighborhood, map link, parking/transit notes
- Contact: phone, email, social links
- Hours: regular hours, holiday hours, closure notices
- Actions: reservations, online ordering, catering, gift cards
- SEO: title templates, meta descriptions, structured data fields

## Menu data

Store menu data under `src/content/menu/`.

Suggested content groups:
- `categories/` - breakfast, lunch, dinner, drinks, desserts, kids, specials
- `items/` - one file per menu item for clean updates and version history
- `modifiers/` - add-ons, substitutions, sizes, spice levels
- `allergens/` - allergen definitions and display labels
- `specials/` - seasonal or temporary menu entries
- `schemas/` - future validation schema documentation or code

## Menu item fields

Each menu item should eventually support:
- Stable id or slug
- Display name
- Short description
- Category ids
- Price or price range
- Availability status
- Dietary tags
- Allergen ids
- Spice level
- Image reference
- Sort order
- Featured flag
- Optional notes such as seasonal, limited time, sold out, chef favorite

Do not encode menu content directly in page or component files.
