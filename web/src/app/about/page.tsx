import Link from 'next/link'
import type { Metadata } from 'next'
import { publicClient } from '@/lib/sanity/client'
import { SITE_SETTINGS, ABOUT_PAGE } from '@/lib/sanity/queries'
import type { SanitySiteSettings, SanityAboutPage } from '@/types/sanity'
import { HeroCarousel } from '@/components/sections/HeroCarousel'
import { DiamondHeading } from '@/components/sections/DiamondHeading'
import { AboutPillars } from '@/components/about/AboutPillars'
import { AwardBand } from '@/components/about/AwardBand'
import { AboutChapters } from '@/components/about/AboutChapters'
import { resolveHeroImages } from '@/lib/images/hero'

export const revalidate = 3600
export const metadata: Metadata = { title: 'About' }

export default async function AboutPage() {
  const [settings, aboutPage] = await Promise.all([
    publicClient.fetch<SanitySiteSettings | null>(SITE_SETTINGS),
    publicClient.fetch<SanityAboutPage | null>(ABOUT_PAGE),
  ])

  const heroImages = resolveHeroImages(settings, undefined)

  return (
    <>
      {/* ── Hero (backbone) ──────────────────────────────────────── */}
      <section className="hero about-hero" aria-labelledby="about-hero-heading">
        <HeroCarousel images={heroImages} />
        <div className="hero__scrim" aria-hidden="true" />
        <div className="hero__frame" aria-hidden="true">
          <span className="hero__corner hero__corner--tl" />
          <span className="hero__corner hero__corner--tr" />
          <span className="hero__corner hero__corner--bl" />
          <span className="hero__corner hero__corner--br" />
          <span className="hero__diamond hero__diamond--top" />
          <span className="hero__diamond hero__diamond--bottom" />
        </div>
        <div className="hero__inner">
          <p className="hero__eyebrow">Edinburgh · Indian Street Food</p>
          <h1 id="about-hero-heading" className="hero__title">
            Our <span className="hero__title-accent">Kahani</span>
          </h1>
        </div>
      </section>

      {/* ── Intro (story layer, optional) ────────────────────────── */}
      {aboutPage?.intro && (
        <div className="about-intro">
          <div className="container">
            <p className="about-intro__text">{aboutPage.intro}</p>
          </div>
        </div>
      )}

      {/* ── Chapters (story layer, optional) ─────────────────────── */}
      <AboutChapters chapters={aboutPage?.chapters} />

      {/* ── Pillars (backbone) ───────────────────────────────────── */}
      <AboutPillars />

      {/* ── Award band (backbone, conditional on data) ───────────── */}
      <AwardBand awards={settings?.awards} />

      {/* ── Visit CTA (backbone) ─────────────────────────────────── */}
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
