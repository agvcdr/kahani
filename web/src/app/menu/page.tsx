import Link from 'next/link'
import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { ALL_SET_MENUS } from '@/lib/sanity/queries'
import type { SanitySetMenu } from '@/types/sanity'
import { FOOD_SECTIONS, DRINK_SECTIONS } from '@/lib/menu/sections'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Menu' }

const SET_MENU_CARDS = [
  { slug: 'lunch-one-course',  label: 'Lunch — One Course',  availability: 'Mon–Fri' },
  { slug: 'lunch-two-course',  label: 'Lunch — Two Courses', availability: 'Mon–Fri' },
  { slug: 'pre-theatre',       label: 'Pre-Theatre',         availability: 'Daily until 6:30pm' },
  { slug: 'afternoon-tea',     label: 'Afternoon Tea',       availability: null },
  { slug: 'party',             label: 'Party Menu',          availability: null },
]

export default async function MenuPage() {
  const setMenus = await publicClient.fetch<SanitySetMenu[]>(ALL_SET_MENUS)
  const setBySlug = Object.fromEntries(setMenus.map(s => [s.slug, s]))

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

        {/* À La Carte */}
        <section className="menu-group" aria-labelledby="group-a-la-carte">
          <h2 id="group-a-la-carte" className="menu-group__heading">À La Carte</h2>
          <div className="menu-group__cards">
            {FOOD_SECTIONS.map(s => (
              <Link key={s.slug} href={`/menu/${s.slug}`} className="menu-card">
                <span className="menu-card__name">{s.label}</span>
                {s.description && <span className="menu-card__desc">{s.description}</span>}
              </Link>
            ))}
          </div>
        </section>

        {/* Drinks */}
        <section className="menu-group" aria-labelledby="group-drinks">
          <h2 id="group-drinks" className="menu-group__heading">Drinks</h2>
          <div className="menu-group__cards">
            {DRINK_SECTIONS.map(s => (
              <Link key={s.slug} href={`/menu/${s.slug}`} className="menu-card">
                <span className="menu-card__name">{s.label}</span>
                {s.description && <span className="menu-card__desc">{s.description}</span>}
              </Link>
            ))}
          </div>
        </section>

        {/* Set Menus */}
        <section className="menu-group" aria-labelledby="group-set-menus">
          <h2 id="group-set-menus" className="menu-group__heading">Set Menus</h2>
          <div className="menu-group__cards">
            {SET_MENU_CARDS.map(card => {
              const sm = setBySlug[card.slug]
              if (!sm) return null
              return (
                <Link key={card.slug} href={`/menu/set-menus/${card.slug}`} className="menu-card">
                  <span className="menu-card__name">{card.label}</span>
                  {sm.prices[0] && (
                    <span className="menu-card__price">
                      from £{sm.prices[0].amount.toFixed(2)}
                      {sm.prices[0].context !== 'standard' && ` ${sm.prices[0].context}`}
                    </span>
                  )}
                  {card.availability && <span className="menu-card__avail">{card.availability}</span>}
                </Link>
              )
            })}
            <Link href="/menu/kids" className="menu-card">
              <span className="menu-card__name">Kids Menu</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
