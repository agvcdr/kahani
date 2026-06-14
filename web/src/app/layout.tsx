import { cache } from 'react'
import type { Metadata } from 'next'
import { Marcellus, Karla } from 'next/font/google'
import { publicClient } from '@/lib/sanity/client'
import { SITE_SETTINGS } from '@/lib/sanity/queries'
import type { SanitySiteSettings } from '@/types/sanity'
import { SiteNav } from '@/components/navigation/SiteNav'
import { SiteFooter } from '@/components/sections/SiteFooter'
import './globals.css'

// Deduplicate the SITE_SETTINGS fetch within a single request cycle.
// Without this, generateMetadata and RootLayout each issue a separate
// network call because @sanity/client uses Node's http adapter, bypassing
// Next.js's native-fetch deduplication.
const getSiteSettings = cache(
  async () => publicClient.fetch<SanitySiteSettings | null>(SITE_SETTINGS)
)

const marcellus = Marcellus({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-body',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const title = settings?.name ?? 'Kahani Indian Street Food Edinburgh'
  const description = settings?.seoDefaultDescription ?? "Edinburgh's award-winning Indian street food restaurant."
  return {
    title: { template: settings?.seoTitleTemplate ?? `%s | ${title}`, default: title },
    description,
    keywords: settings?.seoKeywords,
    openGraph: { title, description, type: 'website' },
    icons: { icon: '/brand/kahani-monogram-dark.svg' },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <html lang="en" className={`${marcellus.variable} ${karla.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <SiteNav settings={settings} />
        <main id="main-content">{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  )
}
