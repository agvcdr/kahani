# Menu Content

Menu content should be data-driven.

Recommended rule:
- Adding or updating a menu item should require editing only a menu content file and, when needed, a category/modifier/allergen content file.
- Page and component files should render menu data generically.

Subfolders:
- `categories/` - category definitions and ordering
- `items/` - one menu item per file
- `modifiers/` - sizes, add-ons, substitutions, spice choices
- `allergens/` - shared allergen definitions
- `specials/` - seasonal or temporary entries
- `schemas/` - future validation schema files or documentation
