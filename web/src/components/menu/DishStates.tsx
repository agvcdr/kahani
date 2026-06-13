import type { SanityMenuItem } from '@/types/sanity'
import { DietaryBadge } from './DietaryBadge'
import { Badge } from '@/components/ui/Badge'

type StateItem = Pick<SanityMenuItem, 'dietary' | 'spiceLevel' | 'seasonal' | 'soldOut' | 'allergens'>

function SpiceChillies({ level }: { level: number }) {
  if (!level) return null
  const clamped = Math.min(5, Math.max(0, level))
  return (
    <span className="spice-chillies" title={`Spice level ${clamped}/5`} aria-label={`Spice level ${clamped} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < clamped ? 'spice-chillies__chilli spice-chillies__chilli--on' : 'spice-chillies__chilli'} aria-hidden="true">
          🌶
        </span>
      ))}
    </span>
  )
}

export function DishStates({ item, variant }: { item: StateItem; variant: 'cluster' | 'inline' }) {
  const hasDietary = Boolean(item.dietary?.length)
  const hasSpice = Boolean(item.spiceLevel)
  const hasAllergens = variant === 'inline' && Boolean(item.allergens?.length)
  const nothing = !hasDietary && !hasSpice && !item.seasonal && !item.soldOut && !hasAllergens
  if (nothing) return null

  return (
    <span className={`dish-states dish-states--${variant}`}>
      <DietaryBadge dietary={item.dietary} />
      <SpiceChillies level={item.spiceLevel} />
      {item.seasonal && <Badge variant="seasonal" title="Seasonal">Seasonal</Badge>}
      {item.soldOut && <Badge variant="sold-out" title="Sold out">Sold out</Badge>}
      {hasAllergens && (
        <span
          className="dish-states__allergen"
          aria-label="Contains allergens — ask your server"
          title="Contains allergens — ask your server"
        >
          ⚠
        </span>
      )}
    </span>
  )
}
