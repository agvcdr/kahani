import Image from 'next/image'
import type { SanityMenuItem } from '@/types/sanity'
import { resolveSpotlightImage } from '@/lib/images/dish'
import { DishStates } from './DishStates'
import { AllergenList } from './AllergenList'
import { PriceBadge } from './PriceBadge'
import { OrderOnlineButton } from './OrderOnlineButton'
import { EditorialSplit } from './EditorialSplit'

/** Shared content block for both spotlight tiers: badge cluster, origin story,
 *  named allergens, price, Order Online. `showOrigin` is false for the split
 *  tier, where EditorialSplit already renders origin as its eyebrow. */
function SpotlightDetails({ item, orderUrl, showOrigin = true }: { item: SanityMenuItem; orderUrl?: string | null; showOrigin?: boolean }) {
  return (
    <>
      <DishStates item={item} variant="cluster" />
      {showOrigin && item.origin && <p className="spotlight__origin">{item.origin}</p>}
      {item.description && <p className="spotlight__desc">{item.description}</p>}
      <AllergenList allergens={item.allergens} />
      <div className="spotlight__footer">
        <PriceBadge prices={item.prices} priceOnRequest={item.priceOnRequest} />
        <OrderOnlineButton url={orderUrl} soldOut={item.soldOut} />
      </div>
    </>
  )
}

/** Tier 1 — one edge-to-edge macro spotlight with a soft diagonal vignette. */
export function FullBleedSpotlight({ item, orderUrl }: { item: SanityMenuItem; orderUrl?: string | null }) {
  const img = resolveSpotlightImage(item)
  return (
    <section className={`spotlight spotlight--full${item.soldOut ? ' spotlight--sold-out' : ''}`} aria-label={item.name}>
      <div className="spotlight__media">
        <Image src={img.url} alt={img.alt} fill priority sizes="100vw" className="spotlight__img" />
        <div className="spotlight__vignette" aria-hidden="true" />
      </div>
      <div className="spotlight__overlay">
        <h2 className="spotlight__name">{item.name}</h2>
        <SpotlightDetails item={item} orderUrl={orderUrl} />
      </div>
    </section>
  )
}

/** Tier 2 — an editorial split rendered from a dish, alternating side. */
export function DishEditorialSplit({ item, orderUrl, side }: { item: SanityMenuItem; orderUrl?: string | null; side: 'left' | 'right' }) {
  const img = resolveSpotlightImage(item)
  return (
    <EditorialSplit image={img} title={item.name} eyebrow={item.origin} side={side}>
      <SpotlightDetails item={item} orderUrl={orderUrl} showOrigin={false} />
    </EditorialSplit>
  )
}
