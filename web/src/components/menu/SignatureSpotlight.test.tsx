import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FullBleedSpotlight, DishEditorialSplit } from './SignatureSpotlight'
import type { SanityMenuItem } from '@/types/sanity'

const dish = (over: Partial<SanityMenuItem>): SanityMenuItem =>
  ({ id: 'rj', slug: 'rj', name: 'Rogan Josh', description: 'Slow-cooked lamb.', prices: [{ context: 'main', amount: 14.5 }], dietary: [], allergens: ['milk'], spiceLevel: 3, ...over }) as SanityMenuItem

describe('FullBleedSpotlight', () => {
  it('renders name, price, named allergens and an Order Online link', () => {
    render(<FullBleedSpotlight item={dish({ origin: 'Kashmir' })} orderUrl="https://order.example.com" />)
    expect(screen.getByRole('heading', { name: 'Rogan Josh' })).toBeInTheDocument()
    expect(screen.getByText('Kashmir')).toBeInTheDocument()
    expect(screen.getByText(/£14\.50/)).toBeInTheDocument()
    expect(screen.getByText(/Dairy/)).toBeInTheDocument() // named allergen in full
    expect(screen.getByRole('link', { name: /order online/i })).toBeInTheDocument()
  })

  it('renders no origin element when origin is absent', () => {
    const { container } = render(<FullBleedSpotlight item={dish({ origin: null })} orderUrl="https://o" />)
    expect(container.querySelector('.spotlight__origin')).toBeNull()
  })

  it('suppresses Order Online when sold out', () => {
    render(<FullBleedSpotlight item={dish({ soldOut: true })} orderUrl="https://o" />)
    expect(screen.queryByRole('link', { name: /order online/i })).toBeNull()
  })
})

describe('DishEditorialSplit', () => {
  it('renders the dish as an editorial split with name and price', () => {
    render(<DishEditorialSplit item={dish({})} orderUrl="https://o" side="right" />)
    expect(screen.getByRole('heading', { name: 'Rogan Josh' })).toBeInTheDocument()
    expect(screen.getByText(/£14\.50/)).toBeInTheDocument()
  })
})
