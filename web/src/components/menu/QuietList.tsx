import type { SanityMenuItem } from '@/types/sanity'
import { DishStates } from './DishStates'
import { PriceBadge } from './PriceBadge'

export interface QuietListGroup {
  id: string
  /** Sub-section heading; omit for a single flat group. */
  label?: string
  items: SanityMenuItem[]
}

function QuietRow({ item }: { item: SanityMenuItem }) {
  return (
    <li className={`quiet-row${item.soldOut ? ' quiet-row--sold-out' : ''}`}>
      <div className="quiet-row__head">
        <span className="quiet-row__name">{item.name}</span>
        {item.origin && <span className="quiet-row__origin">{item.origin}</span>}
        <DishStates item={item} variant="inline" />
        <span className="quiet-row__dots" aria-hidden="true" />
        <span className="quiet-row__price"><PriceBadge prices={item.prices} priceOnRequest={item.priceOnRequest} /></span>
      </div>
      {item.description && <p className="quiet-row__desc">{item.description}</p>}
    </li>
  )
}

/** The quiet third tier: a legible, image-free list grouped by sub-section. */
export function QuietList({ groups }: { groups: QuietListGroup[] }) {
  const populated = groups.filter(g => g.items.length)
  if (!populated.length) return null
  return (
    <div className="quiet-list">
      {populated.map(group => {
        const rows = (
          <ul className="quiet-list__rows" role="list">
            {group.items.map(item => <QuietRow key={item.id} item={item} />)}
          </ul>
        )
        if (!group.label) {
          return <div key={group.id} className="quiet-list__group">{rows}</div>
        }
        const headingId = `quiet-${group.id}`
        return (
          <section key={group.id} className="quiet-list__group" aria-labelledby={headingId}>
            <div className="quiet-list__subheading">
              <span className="quiet-list__diamond" aria-hidden="true">◆</span>
              <h3 id={headingId} className="quiet-list__subheading-text">{group.label}</h3>
            </div>
            {rows}
          </section>
        )
      })}
    </div>
  )
}
