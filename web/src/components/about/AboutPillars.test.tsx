import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AboutPillars } from './AboutPillars'

describe('AboutPillars', () => {
  it('renders all four pillar names', () => {
    render(<AboutPillars />)
    expect(screen.getByText('Street-Food Roots')).toBeInTheDocument()
    expect(screen.getByText('Family Recipes')).toBeInTheDocument()
    expect(screen.getByText('Edinburgh Home')).toBeInTheDocument()
    expect(screen.getByText('Catering & Events')).toBeInTheDocument()
  })

  it('renders a section with an accessible heading', () => {
    render(<AboutPillars />)
    expect(screen.getByRole('heading', { name: /the kahani difference/i })).toBeInTheDocument()
  })

  it('renders four pillar cards', () => {
    const { container } = render(<AboutPillars />)
    expect(container.querySelectorAll('.pillar-card')).toHaveLength(4)
  })
})
