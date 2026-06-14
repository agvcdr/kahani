import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuietList } from './QuietList'
import type { SanityMenuItem } from '@/types/sanity'

const dish = (over: Partial<SanityMenuItem>): SanityMenuItem =>
  ({ id: 'a', slug: 'a', name: 'Dish A', description: null, prices: [{ context: 'standard', amount: 8 }], dietary: [], allergens: [], spiceLevel: 0, ...over }) as SanityMenuItem

describe('QuietList', () => {
  it('renders grouped sub-headings and dish names with prices', () => {
    render(<QuietList groups={[
      { id: 'g1', label: 'Traditional', items: [dish({ id: 'a', name: 'Onion Bhaji' })] },
      { id: 'g2', label: 'Signature', items: [dish({ id: 'b', name: 'Chaat' })] },
    ]} />)
    expect(screen.getByRole('heading', { name: 'Traditional' })).toBeInTheDocument()
    expect(screen.getByText('Onion Bhaji')).toBeInTheDocument()
    expect(screen.getByText('Chaat')).toBeInTheDocument()
    expect(screen.getAllByText(/£8\.00/)).toHaveLength(2)
  })

  it('renders an origin tag only when present', () => {
    const { container } = render(<QuietList groups={[
      { id: 'g', items: [dish({ id: 'a', origin: 'Punjab' }), dish({ id: 'b', origin: null })] },
    ]} />)
    const origins = container.querySelectorAll('.quiet-row__origin')
    expect(origins).toHaveLength(1)
    expect(origins[0].textContent).toBe('Punjab')
  })

  it('omits the sub-heading for an unlabeled group', () => {
    const { container } = render(<QuietList groups={[{ id: 'g', items: [dish({})] }]} />)
    expect(container.querySelector('.quiet-list__subheading')).toBeNull()
  })

  it('marks a sold-out row', () => {
    render(<QuietList groups={[{ id: 'g', items: [dish({ soldOut: true })] }]} />)
    expect(screen.getByText(/sold out/i)).toBeInTheDocument()
  })
})
