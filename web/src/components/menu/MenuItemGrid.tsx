import type { SanityMenuItem } from '@/types/sanity'
import { MenuItemCard } from './MenuItemCard'

export function MenuItemGrid({ items }: { items: SanityMenuItem[] }) {
  if (!items?.length) return <p className="menu-empty">No items available at the moment.</p>
  return (
    <ul className="menu-grid" role="list">
      {items.map(item => (
        <li key={item.id}>
          <MenuItemCard item={item} />
        </li>
      ))}
    </ul>
  )
}
