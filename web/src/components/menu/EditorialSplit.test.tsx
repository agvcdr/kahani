import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EditorialSplit } from './EditorialSplit'

describe('EditorialSplit', () => {
  it('renders image (with alt), eyebrow, title and children', () => {
    render(
      <EditorialSplit
        image={{ url: 'https://cdn/x.jpg', alt: 'A plated dish' }}
        eyebrow="Kashmir"
        title="Rogan Josh"
        side="left"
      >
        <p>An aromatic slow-cooked lamb curry.</p>
      </EditorialSplit>,
    )
    expect(screen.getByAltText('A plated dish')).toBeInTheDocument()
    expect(screen.getByText('Kashmir')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rogan Josh' })).toBeInTheDocument()
    expect(screen.getByText('An aromatic slow-cooked lamb curry.')).toBeInTheDocument()
  })

  it('applies a side modifier class for alternating layout', () => {
    const { container } = render(
      <EditorialSplit image={{ url: 'https://cdn/x.jpg', alt: 'x' }} title="T" side="right" />,
    )
    expect(container.querySelector('.editorial-split--right')).not.toBeNull()
  })

  it('omits the eyebrow element when no eyebrow is given', () => {
    const { container } = render(
      <EditorialSplit image={{ url: 'https://cdn/x.jpg', alt: 'x' }} title="T" side="left" />,
    )
    expect(container.querySelector('.editorial-split__eyebrow')).toBeNull()
  })
})
