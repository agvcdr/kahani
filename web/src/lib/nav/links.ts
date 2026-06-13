export interface NavLink {
  href: string
  label: string
}

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Find Us' },
]

interface SecondarySource {
  onlineOrderingUrl?: string | null
  giftVouchersUrl?: string | null
}

export function secondaryActions(s: SecondarySource): NavLink[] {
  return [
    { href: s.onlineOrderingUrl, label: 'Order Online' },
    { href: s.giftVouchersUrl, label: 'Gift Vouchers' },
  ].filter((a): a is NavLink => Boolean(a.href))
}
