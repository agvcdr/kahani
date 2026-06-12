import { describe, it, expect } from 'vitest'
import { NAV_LINKS, secondaryActions } from './links'

describe('NAV_LINKS', () => {
  it('lists the five site sections in order', () => {
    expect(NAV_LINKS.map(l => l.label)).toEqual(['Home', 'Menu', 'About', 'Gallery', 'Find Us'])
  })
})

describe('secondaryActions', () => {
  it('includes only actions whose URL is present', () => {
    const actions = secondaryActions({ bookTableUrl: 'https://book', giftVouchersUrl: null, onlineOrderingUrl: 'https://order' })
    expect(actions.map(a => a.label)).toEqual(['Book a Table', 'Order Online'])
    expect(actions[0].href).toBe('https://book')
  })

  it('returns an empty list when no URLs are set', () => {
    expect(secondaryActions({})).toEqual([])
  })
})
