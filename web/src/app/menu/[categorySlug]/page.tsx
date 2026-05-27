import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { ALL_MENU_CATEGORIES, MENU_ITEMS_BY_CATEGORY } from '@/lib/sanity/queries'
import type { SanityMenuCategory, SanityMenuItem } from '@/types/sanity'
import { MenuItemGrid } from '@/components/menu/MenuItemGrid'

export const revalidate = 3600

export async function generateStaticParams() {
  const categories = await publicClient.fetch<SanityMenuCategory[]>(ALL_MENU_CATEGORIES)
  return categories
    .filter(c => !['lunch', 'pre-theatre', 'party', 'afternoon-tea'].includes(c.parentMenu))
    .map(c => ({ categorySlug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }): Promise<Metadata> {
  const { categorySlug } = await params
  const categories = await publicClient.fetch<SanityMenuCategory[]>(ALL_MENU_CATEGORIES)
  const cat = categories.find(c => c.slug === categorySlug)
  return { title: cat?.label ?? 'Menu' }
}

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  const categories = await publicClient.fetch<SanityMenuCategory[]>(ALL_MENU_CATEGORIES)
  const cat = categories.find(c => c.slug === categorySlug)
  if (!cat) notFound()

  const items = await publicClient.fetch<SanityMenuItem[]>(
    MENU_ITEMS_BY_CATEGORY,
    { categoryId: `category-${cat.id}` }
  )

  return (
    <div className="category-page">
      <div className="category-page__hero">
        <Link href="/menu" className="category-page__back">← Menu</Link>
        <h1 className="category-page__title">{cat.label}</h1>
        {cat.description && <p className="category-page__desc">{cat.description}</p>}
        {cat.availability && <p className="category-page__avail">Available {cat.availability}</p>}
      </div>
      <div className="container category-page__body">
        <div className="menu-legend" role="note">
          <span className="badge badge--veg">V</span> Vegetarian &nbsp;
          <span className="badge badge--vegan">Ve</span> Vegan &nbsp;
          <span className="badge badge--gf">GF</span> Gluten-Free &nbsp;
          <span className="menu-item__star">★</span> Chef's Pick
        </div>
        <MenuItemGrid items={items} />
        <p className="allergen-notice">
          Please inform your server of any allergies or dietary requirements. Full allergen information is available on request.
        </p>
      </div>
    </div>
  )
}
