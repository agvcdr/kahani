import Link from 'next/link'
import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { ALL_MENU_CATEGORIES, ALL_SET_MENUS } from '@/lib/sanity/queries'
import type { SanityMenuCategory, SanitySetMenu } from '@/types/sanity'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Menu' }

const GROUP_LABELS: Record<string, string> = {
  'a-la-carte': 'À La Carte',
  'drinks-desserts': 'Drinks & Desserts',
  kids: 'Kids Menu',
  lunch: 'Lunch',
  'pre-theatre': 'Pre-Theatre',
  party: 'Party',
  'afternoon-tea': 'Afternoon Tea',
}

const GROUP_ORDER = ['a-la-carte', 'drinks-desserts', 'kids', 'lunch', 'pre-theatre', 'party', 'afternoon-tea']

export default async function MenuPage() {
  const [categories, setMenus] = await Promise.all([
    publicClient.fetch<SanityMenuCategory[]>(ALL_MENU_CATEGORIES),
    publicClient.fetch<SanitySetMenu[]>(ALL_SET_MENUS),
  ])

  const grouped = GROUP_ORDER.reduce<Record<string, SanityMenuCategory[]>>((acc, g) => {
    const cats = categories.filter(c => c.parentMenu === g)
    if (cats.length) acc[g] = cats
    return acc
  }, {})

  const setMenuGroups = new Set(['lunch', 'pre-theatre', 'party', 'afternoon-tea'])

  return (
    <div className="menu-index">
      <div className="menu-index__hero">
        <h1 className="menu-index__title">Our Menu</h1>
        <p className="menu-index__subtitle">Freshly prepared Indian street food</p>
      </div>

      <div className="container menu-index__body">
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <Link href="/menu/print" style={{ fontSize: '13px', color: 'var(--color-text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--color-border)', paddingBottom: '1px' }}>
            Print full menu
          </Link>
        </div>

        {Object.entries(grouped).map(([group, cats]) => (
          <section key={group} className="menu-group" aria-labelledby={`group-${group}`}>
            <h2 id={`group-${group}`} className="menu-group__heading">{GROUP_LABELS[group] ?? group}</h2>
            <div className="menu-group__cards">
              {setMenuGroups.has(group) ? (
                setMenus
                  .filter(sm => cats.some(c => sm.slug.includes(c.id.replace(group + '-', ''))))
                  .map(sm => (
                    <Link key={sm.id} href={`/menu/set-menus/${sm.slug}`} className="menu-card">
                      <span className="menu-card__name">{sm.name}</span>
                      {sm.prices[0] && (
                        <span className="menu-card__price">
                          from £{sm.prices[0].amount.toFixed(2)}
                          {sm.prices[0].context !== 'standard' && ` ${sm.prices[0].context}`}
                        </span>
                      )}
                      {sm.availability && <span className="menu-card__avail">{sm.availability}</span>}
                    </Link>
                  ))
              ) : (
                cats.map(cat => (
                  <Link key={cat.id} href={`/menu/${cat.slug}`} className="menu-card">
                    <span className="menu-card__name">{cat.label}</span>
                    {cat.description && <span className="menu-card__desc">{cat.description}</span>}
                  </Link>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
