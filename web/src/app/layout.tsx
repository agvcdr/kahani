import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { SITE_SETTINGS } from '@/lib/sanity/queries'
import type { SanitySiteSettings } from '@/types/sanity'
import { SiteNav } from '@/components/navigation/SiteNav'
import { SiteFooter } from '@/components/sections/SiteFooter'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const settings: SanitySiteSettings | null = await publicClient.fetch(SITE_SETTINGS)
  const title = settings?.name ?? 'Kahani Indian Street Food Edinburgh'
  const description = settings?.seoDefaultDescription ?? "Edinburgh's award-winning Indian street food restaurant."
  return {
    title: { template: settings?.seoTitleTemplate ?? `%s | ${title}`, default: title },
    description,
    keywords: settings?.seoKeywords,
    openGraph: { title, description, type: 'website' },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings: SanitySiteSettings | null = await publicClient.fetch(SITE_SETTINGS)
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <SiteNav settings={settings} />
        <main id="main-content">{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  )
}
