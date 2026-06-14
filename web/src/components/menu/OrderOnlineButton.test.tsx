import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderOnlineButton } from './OrderOnlineButton'

describe('OrderOnlineButton', () => {
  it('renders an external link to the ordering URL', () => {
    render(<OrderOnlineButton url="https://order.example.com" />)
    const link = screen.getByRole('link', { name: /order online/i })
    expect(link).toHaveAttribute('href', 'https://order.example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders nothing when the URL is absent', () => {
    const { container } = render(<OrderOnlineButton url={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when the dish is sold out', () => {
    const { container } = render(<OrderOnlineButton url="https://order.example.com" soldOut />)
    expect(container.firstChild).toBeNull()
  })
})
