import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteNav } from './SiteNav'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

const settings = {
  bookTableUrl: 'https://book.example',
  onlineOrderingUrl: 'https://order.example',
  giftVouchersUrl: null,
  mapUrl: 'https://maps.example',
  phone: '0131 558 1947',
  address: { line1: '10 Antigua Street', city: 'Edinburgh', postcode: 'EH1 3NH' },
} as any

describe('SiteNav', () => {
  it('shows the persistent Menu link and Book a Table without opening the overlay', () => {
    render(<SiteNav settings={settings} />)
    const header = screen.getByRole('banner')
    expect(within(header).getByRole('link', { name: 'Menu' })).toHaveAttribute('href', '/menu')
    expect(within(header).getByRole('link', { name: 'Book a Table' })).toHaveAttribute('href', 'https://book.example')
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the overlay on toggle and exposes the section links', async () => {
    const user = userEvent.setup()
    render(<SiteNav settings={settings} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    const toggle = screen.getByRole('button', { name: /close menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.getByRole('navigation', { name: /site/i })
    expect(within(panel).getByRole('link', { name: 'Gallery' })).toHaveAttribute('href', '/gallery')
    expect(within(panel).getByRole('link', { name: 'Order Online' })).toHaveAttribute('href', 'https://order.example')
    expect(within(panel).queryByRole('link', { name: 'Gift Vouchers' })).toBeNull()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(<SiteNav settings={settings} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('does not move focus on initial mount', () => {
    render(<SiteNav settings={settings} />)
    expect(screen.getByRole('button', { name: /open menu/i })).not.toHaveFocus()
  })

  it('returns focus to the toggle after closing', async () => {
    const user = userEvent.setup()
    render(<SiteNav settings={settings} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveFocus()
  })

  it('renders the header with null settings without crashing', () => {
    render(<SiteNav settings={null} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Book a Table' })).toBeNull()
  })
})
