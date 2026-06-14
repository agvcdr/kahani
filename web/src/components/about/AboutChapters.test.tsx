import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AboutChapters } from './AboutChapters'
import type { SanityAboutChapter } from '@/types/sanity'

const chapter = (over: Partial<SanityAboutChapter>): SanityAboutChapter =>
  ({ title: 'From the street stalls', eyebrow: 'Chapter One', body: 'A long story.', image: null, ...over })

describe('AboutChapters', () => {
  it('renders chapter titles and body text', () => {
    render(<AboutChapters chapters={[chapter({})]} />)
    expect(screen.getByRole('heading', { name: 'From the street stalls' })).toBeInTheDocument()
    expect(screen.getByText('A long story.')).toBeInTheDocument()
  })

  it('renders the eyebrow when present', () => {
    render(<AboutChapters chapters={[chapter({ eyebrow: 'Chapter One' })]} />)
    expect(screen.getByText('Chapter One')).toBeInTheDocument()
  })

  it('uses the chapter Sanity image alt when an image is provided', () => {
    render(<AboutChapters chapters={[chapter({ image: { url: 'https://cdn/c.jpg', alt: 'A kitchen scene' } })]} />)
    expect(screen.getByAltText('A kitchen scene')).toBeInTheDocument()
  })

  it('falls back to a stock image when the chapter has no image', () => {
    render(<AboutChapters chapters={[chapter({ image: null })]} />)
    // A fallback image should render (alt from SPOTLIGHT_FALLBACK_IMAGES — non-empty string)
    const imgs = screen.getAllByRole('img')
    expect(imgs.length).toBeGreaterThan(0)
    expect(imgs[0]).toHaveAttribute('alt')
  })

  it('skips chapters without a title', () => {
    render(<AboutChapters chapters={[
      chapter({ title: '' }),
      chapter({ title: 'Recipes, handed down' }),
    ]} />)
    expect(screen.queryByRole('heading', { name: 'From the street stalls' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Recipes, handed down' })).toBeInTheDocument()
  })

  it('returns null when chapters is empty or absent', () => {
    const { container } = render(<AboutChapters chapters={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
