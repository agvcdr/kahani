import type { DietaryTag } from '@/types/sanity'
import { Badge } from '@/components/ui/Badge'

const LABELS: Record<DietaryTag, string> = {
  vegetarian: 'V',
  vegan: 'Ve',
  'gluten-free': 'GF',
}
const VARIANTS: Record<DietaryTag, 'veg' | 'vegan' | 'gf'> = {
  vegetarian: 'veg',
  vegan: 'vegan',
  'gluten-free': 'gf',
}
const TITLES: Record<DietaryTag, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'gluten-free': 'Gluten-Free',
}

export function DietaryBadge({ dietary }: { dietary: DietaryTag[] }) {
  if (!dietary?.length) return null
  return (
    <span className="dietary-badges" aria-label={dietary.map(d => TITLES[d]).join(', ')}>
      {dietary.map(d => (
        <Badge key={d} variant={VARIANTS[d]} title={TITLES[d]}>{LABELS[d]}</Badge>
      ))}
    </span>
  )
}
