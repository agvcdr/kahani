import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { ALL_SET_MENUS } from '@/lib/sanity/queries'
import type { SanitySetMenu } from '@/types/sanity'
import { FOOD_SECTIONS, DRINK_SECTIONS, type MenuSection } from '@/lib/menu/sections'
import { MENU_SECTION_THUMBNAILS } from '@/lib/images/fallbacks'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Menu' }

const SET_MENU_CARDS = [
  { slug: 'lunch-one-course',  label: 'Lunch — One Course',  availability: 'Mon–Fri' },
  { slug: 'lunch-two-course',  label: 'Lunch — Two Courses', availability: 'Mon–Fri' },
  { slug: 'pre-theatre',       label: 'Pre-Theatre',         availability: 'Daily until 6:30pm' },
  { slug: 'afternoon-tea',     label: 'Afternoon Tea',       availability: null },
  { slug: 'party',             label: 'Party Menu',          availability: null },
]

function SplitRows({ sections }: { sections: MenuSection[] }) {
  return (
    <div className="menu-split-list">
      {sections.map((s, i) => {
        const thumb = MENU_SECTION_THUMBNAILS[s.slug]
        return (
          <Link
            key={s.slug}
            href={`/menu/${s.slug}`}
            className={`menu-split-row${i % 2 === 1 ? ' menu-split-row--reverse' : ''}`}
          >
            <div className="menu-split-row__photo">
              {thumb && (
                <Image
                  src={thumb.url}
                  alt={thumb.alt}
                  fill
                  className="menu-split-row__img"
                  sizes="(max-width:680px) 100vw, 38vw"
                />
              )}
            </div>
            <div className="menu-split-row__content">
              <p className="menu-split-row__diamonds" aria-hidden="true">◆ ◆ ◆</p>
              <p className="menu-split-row__name">{s.label}</p>
              {s.description && (
                <p className="menu-split-row__desc">{s.description}</p>
              )}
              <p className="menu-split-row__cta">View dishes →</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default async function MenuPage() {
  const setMenus = await publicClient.fetch<SanitySetMenu[]>(ALL_SET_MENUS)
  const setBySlug = Object.fromEntries(setMenus.map(s => [s.slug, s]))

  return (
    <div className="menu-index">
      <div className="menu-index__hero">
        <div className="container">
          <h1 className="menu-index__title">Our Menu</h1>
          <p className="menu-index__subtitle">Freshly prepared Indian street food</p>
        </div>
      </div>

      <div className="menu-index__body">
        <div className="container" style={{ textAlign: 'right', paddingTop: '2rem' }}>
          <Link href="/menu/print" style={{ fontSize: '13px', color: 'var(--color-text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--color-border)', paddingBottom: '1px' }}>
            Print full menu
          </Link>
        </div>

        {/* À La Carte */}
        <section className="menu-group" aria-labelledby="group-a-la-carte">
          <div className="container">
            <h2 id="group-a-la-carte" className="menu-group__heading">
              <span className="menu-group__diamond" aria-hidden="true">◆</span>À La Carte
            </h2>
          </div>
          <SplitRows sections={FOOD_SECTIONS} />
        </section>

        {/* Drinks */}
        <section className="menu-group" aria-labelledby="group-drinks">
          <div className="container">
            <h2 id="group-drinks" className="menu-group__heading">
              <span className="menu-group__diamond" aria-hidden="true">◆</span>Drinks
            </h2>
          </div>
          <SplitRows sections={DRINK_SECTIONS} />
        </section>

        {/* Set Menus */}
        <section className="menu-group" aria-labelledby="group-set-menus">
          <div className="container">
            <h2 id="group-set-menus" className="menu-group__heading">
              <span className="menu-group__diamond" aria-hidden="true">◆</span>Set Menus
            </h2>
            <div className="menu-group__cards">
              {SET_MENU_CARDS.map(card => {
                const sm = setBySlug[card.slug]
                if (!sm) return null
                return (
                  <Link key={card.slug} href={`/menu/set-menus/${card.slug}`} className="menu-card">
                    <span className="menu-card__left">
                      <span className="menu-card__name">{card.label}</span>
                      {card.availability && (
                        <span className="menu-card__avail">{card.availability}</span>
                      )}
                    </span>
                    {sm.prices[0] && (
                      <span className="menu-card__price">
                        from £{sm.prices[0].amount.toFixed(2)}
                        {sm.prices[0].context !== 'standard' && ` ${sm.prices[0].context}`}
                      </span>
                    )}
                  </Link>
                )
              })}
              <Link href="/menu/kids" className="menu-card">
                <span className="menu-card__left">
                  <span className="menu-card__name">Kids Menu</span>
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
