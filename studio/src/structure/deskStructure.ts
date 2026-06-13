import type { StructureBuilder } from 'sanity/structure'

const MENU_GROUPS: Record<string, string> = {
  'a-la-carte': 'À La Carte',
  'drinks-desserts': 'Drinks & Desserts',
  kids: 'Kids',
  lunch: 'Lunch',
  'pre-theatre': 'Pre-Theatre',
  party: 'Party',
  'afternoon-tea': 'Afternoon Tea',
}

const SET_MENU_IDS: Array<{ id: string; title: string }> = [
  { id: 'pre-theatre', title: 'Pre-Theatre Menu' },
  { id: 'lunch-one-course', title: 'Lunch — One Course' },
  { id: 'lunch-two-course', title: 'Lunch — Two Course' },
  { id: 'party', title: 'Party Menu' },
  { id: 'afternoon-tea', title: 'Afternoon Tea' },
]

export function deskStructure(S: StructureBuilder) {
  return S.list()
    .title('Kahani')
    .items([
      // ── Menu Items ─────────────────────────────────────────────────
      S.listItem()
        .title('Menu Items')
        .child(
          S.list()
            .title('Menu Items')
            .items(
              Object.entries(MENU_GROUPS).map(([groupValue, groupLabel]) =>
                S.listItem()
                  .title(groupLabel)
                  .child(
                    S.documentTypeList('menuCategory')
                      .title(groupLabel)
                      .filter('_type == "menuCategory" && parentMenu == $group')
                      .params({ group: groupValue })
                      .child((categoryId) =>
                        S.documentList()
                          .title('Items')
                          .filter('_type == "menuItem" && $categoryId in categories[]._ref')
                          .params({ categoryId })
                      )
                  )
              )
            )
        ),

      S.divider(),

      // ── Set Menus ──────────────────────────────────────────────────
      S.listItem()
        .title('Set Menus')
        .child(
          S.list()
            .title('Set Menus')
            .items(
              SET_MENU_IDS.map(({ id, title }) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.document()
                      .title(title)
                      .documentId(`setMenu-${id}`)
                      .schemaType('setMenu')
                  )
              )
            )
        ),

      S.divider(),

      // ── Site Settings ──────────────────────────────────────────────
      S.listItem()
        .title('Site Settings')
        .child(
          S.document()
            .title('Site Settings')
            .documentId('siteSettings')
            .schemaType('siteSettings')
        ),

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
    ])
}
