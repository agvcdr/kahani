import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { ALL_SET_MENUS, SET_MENU_BY_SLUG } from '@/lib/sanity/queries'
import type { SanitySetMenu } from '@/types/sanity'
import { SetMenuDisplay } from '@/components/menu/SetMenuDisplay'

export const revalidate = 3600

export async function generateStaticParams() {
  const menus = await publicClient.fetch<SanitySetMenu[]>(ALL_SET_MENUS)
  return menus.map(m => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const menu = await publicClient.fetch<SanitySetMenu>(SET_MENU_BY_SLUG, { slug })
  return { title: menu?.name ?? 'Set Menu' }
}

export default async function SetMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const menu = await publicClient.fetch<SanitySetMenu>(SET_MENU_BY_SLUG, { slug })
  if (!menu) notFound()

  return (
    <div className="set-menu-page">
      <div className="set-menu-page__hero">
        <div className="container">
          <Link href="/menu" className="category-page__back">← Menu</Link>
          <h1 className="set-menu-page__title">{menu.name}</h1>
        </div>
      </div>
      <div className="container set-menu-page__body">
        <SetMenuDisplay menu={menu} />
        <p className="allergen-notice">
          Please inform your server of any allergies or dietary requirements before ordering.
        </p>
      </div>
    </div>
  )
}
