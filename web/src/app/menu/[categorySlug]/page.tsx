import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { ALL_MENU_CATEGORIES, MENU_ITEMS_BY_CATEGORY, MENU_ITEMS_BY_CATEGORY_IDS, SITE_SETTINGS } from '@/lib/sanity/queries'
import type { SanityMenuCategory, SanityMenuItem, SanitySiteSettings } from '@/types/sanity'
import { selectSpotlights } from '@/lib/menu/spotlights'
import { FullBleedSpotlight, DishEditorialSplit } from '@/components/menu/SignatureSpotlight'
import { QuietList, type QuietListGroup } from '@/components/menu/QuietList'
import { ALL_SECTIONS, SECTION_BY_SLUG } from '@/lib/menu/sections'

export const revalidate = 3600

export async function generateStaticParams() {
  const categories = await publicClient.fetch<SanityMenuCategory[]>(ALL_MENU_CATEGORIES)
  const singleCatSlugs = categories
    .filter(c => !['lunch', 'pre-theatre', 'party', 'afternoon-tea'].includes(c.parentMenu))
    .map(c => ({ categorySlug: c.slug }))
  const combinedSlugs = ALL_SECTIONS.map(s => ({ categorySlug: s.slug }))
  // deduplicate
  const seen = new Set(combinedSlugs.map(p => p.categorySlug))
  return [...combinedSlugs, ...singleCatSlugs.filter(p => !seen.has(p.categorySlug))]
}

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }): Promise<Metadata> {
  const { categorySlug } = await params
  const section = SECTION_BY_SLUG[categorySlug]
  if (section) return { title: section.label }
  const categories = await publicClient.fetch<SanityMenuCategory[]>(ALL_MENU_CATEGORIES)
  const cat = categories.find(c => c.slug === categorySlug)
  return { title: cat?.label ?? 'Menu' }
}

function MenuTiers({
  items,
  groups,
  orderUrl,
}: {
  items: SanityMenuItem[]
  groups: QuietListGroup[]
  orderUrl?: string | null
}) {
  const { fullBleed, splits } = selectSpotlights(items)
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

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  const section = SECTION_BY_SLUG[categorySlug]

  // ── Combined section (Starters, Mains, Wine, etc.) ────────────────────────
  if (section) {
    const [allCategories, items] = await Promise.all([
      publicClient.fetch<SanityMenuCategory[]>(ALL_MENU_CATEGORIES),
      publicClient.fetch<(SanityMenuItem & { categoryIds: string[] })[]>(
        MENU_ITEMS_BY_CATEGORY_IDS,
        { categoryRefs: section.categoryIds.map(id => `category-${id}`) }
      ),
    ])

    const sectionCats = section.categoryIds
      .map(id => allCategories.find(c => c.id === id))
      .filter((c): c is SanityMenuCategory => Boolean(c))

    const itemsByCat = new Map<string, (SanityMenuItem & { categoryIds: string[] })[]>()
    for (const cat of sectionCats) {
      const catItems = items.filter(item => item.categoryIds?.includes(cat.id))
      if (catItems.length) itemsByCat.set(cat.id, catItems)
    }

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
  }

  // ── Single Sanity category (fallback for direct links) ────────────────────
  const categories = await publicClient.fetch<SanityMenuCategory[]>(ALL_MENU_CATEGORIES)
  const cat = categories.find(c => c.slug === categorySlug)
  if (!cat) notFound()

  const items = await publicClient.fetch<SanityMenuItem[]>(
    MENU_ITEMS_BY_CATEGORY,
    { categoryId: `category-${cat.id}` }
  )

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
}
