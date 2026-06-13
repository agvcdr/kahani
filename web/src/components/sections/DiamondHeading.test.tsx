import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiamondHeading } from './DiamondHeading'

describe('DiamondHeading', () => {
  it('renders the text as a heading and applies the id', () => {
    render(<DiamondHeading id="featured-heading">Chef&apos;s Selection</DiamondHeading>)
    const h = screen.getByRole('heading', { name: "Chef's Selection" })
    expect(h).toHaveAttribute('id', 'featured-heading')
  })

  it('renders a decorative diamond hidden from assistive tech', () => {
    const { container } = render(<DiamondHeading>Hours</DiamondHeading>)
    const diamond = container.querySelector('.diamond-heading__diamond')
    expect(diamond).not.toBeNull()
    expect(diamond).toHaveAttribute('aria-hidden', 'true')
  })
})
