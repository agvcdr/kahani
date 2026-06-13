import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DishStates } from './DishStates'
import type { SanityMenuItem } from '@/types/sanity'

const base: SanityMenuItem = {
  id: 'x', slug: 'x', name: 'Dish', description: null, prices: [],
  dietary: [], allergens: [], spiceLevel: 0,
} as SanityMenuItem

describe('DishStates', () => {
  it('renders dietary badges and spice chillies scaled to the level (cluster)', () => {
    const { container } = render(
      <DishStates item={{ ...base, dietary: ['vegan'], spiceLevel: 2 }} variant="cluster" />,
    )
    expect(screen.getByText('Ve')).toBeInTheDocument()
    expect(container.querySelectorAll('.spice-chillies__chilli--on')).toHaveLength(2)
  })

  it('renders a seasonal and a sold-out mark', () => {
    render(<DishStates item={{ ...base, seasonal: true, soldOut: true }} variant="cluster" />)
    expect(screen.getByText(/seasonal/i)).toBeInTheDocument()
    expect(screen.getByText(/sold out/i)).toBeInTheDocument()
  })

  it('shows a single allergen affordance in the inline variant when allergens exist', () => {
    render(<DishStates item={{ ...base, allergens: ['gluten', 'milk'] }} variant="inline" />)
    const affordance = screen.getByLabelText(/contains allergens/i)
    expect(affordance).toBeInTheDocument()
  })

  it('does NOT render the allergen affordance in the cluster variant (spotlights name them in full elsewhere)', () => {
    render(<DishStates item={{ ...base, allergens: ['gluten'] }} variant="cluster" />)
    expect(screen.queryByLabelText(/contains allergens/i)).toBeNull()
  })

  it('renders nothing when there are no states', () => {
    const { container } = render(<DishStates item={base} variant="inline" />)
    expect(container.firstChild).toBeNull()
  })
})
