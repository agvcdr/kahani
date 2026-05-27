import type { SanityMenuItem } from '@/types/sanity'
import { DietaryBadge } from './DietaryBadge'
import { SpiceIndicator } from './SpiceIndicator'
import { PriceBadge } from './PriceBadge'
import { AllergenList } from './AllergenList'

export function MenuItemCard({ item }: { item: SanityMenuItem }) {
  return (
    <article className={`menu-item${item.soldOut ? ' menu-item--sold-out' : ''}${item.seasonal ? ' menu-item--seasonal' : ''}`}>
      <div className="menu-item__header">
        <div className="menu-item__title-row">
          <h3 className="menu-item__name">
            {item.featured && <span className="menu-item__star" aria-label="Chef's recommendation">★</span>}
            {item.name}
          </h3>
          <div className="menu-item__meta">
            <DietaryBadge dietary={item.dietary} />
            <SpiceIndicator level={item.spiceLevel} />
          </div>
        </div>
        <div className="menu-item__price-row">
          <PriceBadge prices={item.prices} priceOnRequest={item.priceOnRequest} />
          {item.soldOut && <span className="menu-item__status">Sold Out</span>}
          {item.seasonal && !item.soldOut && <span className="menu-item__status menu-item__status--seasonal">Seasonal</span>}
        </div>
      </div>
      {item.description && <p className="menu-item__desc">{item.description}</p>}
      <AllergenList allergens={item.allergens} />
      {item.serves && item.serves > 1 && (
        <p className="menu-item__serves">Serves {item.serves}</p>
      )}
    </article>
  )
}
