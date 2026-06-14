import Link from 'next/link'
import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { SITE_SETTINGS, ABOUT_PAGE } from '@/lib/sanity/queries'
import type { SanitySiteSettings, SanityAboutPage, SanityAboutChapter } from '@/types/sanity'
import { DiamondHeading } from '@/components/sections/DiamondHeading'
import { AboutPillars } from '@/components/about/AboutPillars'
import { AwardBand } from '@/components/about/AwardBand'
import { AboutChapters } from '@/components/about/AboutChapters'

export const revalidate = 3600
export const metadata: Metadata = { title: 'About' }

const PLACEHOLDER_INTRO = `"Kahani" means story. Ours began on the busy food streets of India and found a home on Edinburgh's Antigua Street.`

const PLACEHOLDER_CHAPTERS: SanityAboutChapter[] = [
  {
    eyebrow: 'Chapter One',
    title: 'From the street stalls',
    body: `Kahani began with a memory: the clamour of an Indian roadside at dusk — tawas hissing, charcoal smoke curling over the crowd, the snap of fresh spice in the air. That is the energy we set out to capture — honest street food, cooked fast and full of flavour, the kind you eat on your feet and remember for years. We carried it north to a corner of Antigua Street and built our kitchen around it.`,
    image: null,
  },
  {
    eyebrow: 'Chapter Two',
    title: 'Recipes, handed down',
    body: `Behind every dish is a recipe that was never written down — spice blends measured by eye and memory, passed from one generation's hands to the next. We cook them the slow way they were meant to be cooked, then plate them for a new city and a new table. Nothing here comes from a jar; everything here has a story.`,
    image: null,
  },
]

export default async function AboutPage() {
  const [settings, aboutPage] = await Promise.all([
    publicClient.fetch<SanitySiteSettings | null>(SITE_SETTINGS),
    publicClient.fetch<SanityAboutPage | null>(ABOUT_PAGE),
  ])

  const intro = aboutPage?.intro ?? PLACEHOLDER_INTRO
  const chapters = (aboutPage?.chapters?.length ? aboutPage.chapters : PLACEHOLDER_CHAPTERS)

  return (
    <>
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="about-page__hero">
        <div className="container">
          <h1 className="about-page__title">Our Kahani</h1>
        </div>
      </div>

      {/* ── Intro ────────────────────────────────────────────────── */}
      <div className="about-intro">
        <div className="container">
          <p className="about-intro__text">{intro}</p>
        </div>
      </div>

      {/* ── Chapters ─────────────────────────────────────────────── */}
      <AboutChapters chapters={chapters} />

      {/* ── Pillars ──────────────────────────────────────────────── */}
      <AboutPillars />

      {/* ── Award band ───────────────────────────────────────────── */}
      <AwardBand awards={settings?.awards} />

      {/* ── Visit CTA ────────────────────────────────────────────── */}
      <section className="about-visit" aria-labelledby="about-visit-heading">
        <div className="container">
          <DiamondHeading id="about-visit-heading">Plan Your Visit</DiamondHeading>
          <div className="about-visit__actions">
            {settings?.bookTableUrl && (
              <a
                href={settings.bookTableUrl}
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a Table
              </a>
            )}
            <Link href="/menu" className="btn btn--outline about-visit__menu-btn">
              View the Menu
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
