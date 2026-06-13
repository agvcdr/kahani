import { describe, it, expect } from 'vitest'
import { NAV_LINKS, secondaryActions } from './links'

describe('NAV_LINKS', () => {
  it('lists the five site sections in order', () => {
    expect(NAV_LINKS.map(l => l.label)).toEqual(['Home', 'Menu', 'About', 'Gallery', 'Find Us'])
  })
})

describe('secondaryActions', () => {
  it('excludes Book a Table (shown as the persistent header button) and lists only present URLs', () => {
    // Pass via a variable to avoid excess-property check (bookTableUrl is
    // ignored by secondaryActions; SiteNav passes the full settings object).
    const src = { bookTableUrl: 'https://book', giftVouchersUrl: null, onlineOrderingUrl: 'https://order' }
    const actions = secondaryActions(src)
    expect(actions.map(a => a.label)).toEqual(['Order Online'])
    expect(actions[0].href).toBe('https://order')
  })

  it('includes Gift Vouchers when its URL is present', () => {
    const actions = secondaryActions({ onlineOrderingUrl: 'https://order', giftVouchersUrl: 'https://gift' })
    expect(actions.map(a => a.label)).toEqual(['Order Online', 'Gift Vouchers'])
  })

  it('returns an empty list when no URLs are set', () => {
    expect(secondaryActions({})).toEqual([])
  })
})
