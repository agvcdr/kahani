import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GalleryTile } from './GalleryTile'
import type { SanityGalleryImage } from '@/types/sanity'

const base: SanityGalleryImage = {
  id: 'img-1',
  category: 'food',
  featured: false,
  image: { url: 'https://cdn/img.jpg', alt: 'A dish of butter chicken' },
}

describe('GalleryTile', () => {
  it('renders the image with its alt text', () => {
    render(<GalleryTile item={base} />)
    expect(screen.getByAltText('A dish of butter chicken')).toBeInTheDocument()
  })

  it('renders the category badge', () => {
    render(<GalleryTile item={base} />)
    expect(screen.getByText('food')).toBeInTheDocument()
  })

  it('renders the caption when provided', () => {
    render(<GalleryTile item={{ ...base, caption: 'Butter Chicken' }} />)
    expect(screen.getByText('Butter Chicken')).toBeInTheDocument()
  })

  it('does not render a caption element when absent', () => {
    const { container } = render(<GalleryTile item={{ ...base, caption: null }} />)
    expect(container.querySelector('.gallery-tile__caption')).toBeNull()
  })

  it('applies the featured class when featured is true', () => {
    const { container } = render(<GalleryTile item={{ ...base, featured: true }} />)
    expect(container.querySelector('.gallery-tile--featured')).not.toBeNull()
  })

  it('does not apply the featured class when featured is false', () => {
    const { container } = render(<GalleryTile item={base} />)
    expect(container.querySelector('.gallery-tile--featured')).toBeNull()
  })
})
