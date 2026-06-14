import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GalleryGrid } from './GalleryGrid'
import type { SanityGalleryImage } from '@/types/sanity'

const makeImage = (id: string, category: SanityGalleryImage['category'], caption?: string): SanityGalleryImage => ({
  id,
  category,
  featured: false,
  image: { url: `https://cdn/${id}.jpg`, alt: `Image ${id}` },
  caption,
})

const images: SanityGalleryImage[] = [
  makeImage('f1', 'food', 'Butter Chicken'),
  makeImage('f2', 'food'),
  makeImage('i1', 'interior', 'The Room'),
  makeImage('e1', 'events', 'Private Dining'),
]

describe('GalleryGrid', () => {
  it('renders all images when the All filter is active (default)', () => {
    render(<GalleryGrid images={images} />)
    expect(screen.getAllByRole('img')).toHaveLength(4)
  })

  it('renders filter chips for all three categories', () => {
    render(<GalleryGrid images={images} />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Food' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Interior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Events' })).toBeInTheDocument()
  })

  it('filters to food images when the Food chip is clicked', async () => {
    const user = userEvent.setup()
    render(<GalleryGrid images={images} />)
    await user.click(screen.getByRole('button', { name: 'Food' }))
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('returns to all images when All chip is clicked after a filter', async () => {
    const user = userEvent.setup()
    render(<GalleryGrid images={images} />)
    await user.click(screen.getByRole('button', { name: 'Food' }))
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getAllByRole('img')).toHaveLength(4)
  })

  it('hides chips for categories with no images', () => {
    const foodOnly = [makeImage('f1', 'food')]
    render(<GalleryGrid images={foodOnly} />)
    expect(screen.queryByRole('button', { name: 'Interior' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Events' })).toBeNull()
  })

  it('renders a live region for screen-reader announcements', () => {
    const { container } = render(<GalleryGrid images={images} />)
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull()
  })

  it('renders an empty state message when no images are provided', () => {
    render(<GalleryGrid images={[]} />)
    expect(screen.getByText(/no photos yet/i)).toBeInTheDocument()
  })
})
