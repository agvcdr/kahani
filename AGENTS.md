# Shared Agent Instructions

Use this repository as a content-driven restaurant website project.

Core principles:
- Keep menu content separate from layout and component code.
- Treat restaurant hours, contact details, location, menu categories, menu items, prices, allergens, and specials as content data.
- Prefer semantic HTML and progressive enhancement.
- Design mobile-first, then enhance for tablet and desktop.
- Make every user-facing flow keyboard accessible.
- Avoid browser-specific APIs unless a fallback or progressive enhancement path is documented.
- Do not hardcode menu items into pages or components.
- Do not assume restaurant details that have not been provided. Use explicit placeholders until real content exists.
- Optimize for easy local testing before deployment.

Expected site sections:
- Home
- Menu
- Specials
- About
- Hours and location
- Contact or reservations link
- Catering or events, if requested later

Quality bars:
- Responsive layouts at small mobile, large mobile, tablet, laptop, and wide desktop widths
- Cross-browser checks in Chromium, Firefox, and WebKit/Safari
- Accessibility checks for headings, landmarks, focus states, color contrast, labels, alt text, and reduced-motion preferences
- Performance-conscious images, fonts, JavaScript, and CSS
- Local SEO support for restaurant name, address, hours, phone, cuisine, and social links
