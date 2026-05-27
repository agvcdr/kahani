import type { AllergenId } from '@/types/sanity'

const LABELS: Record<AllergenId, string> = {
  celery: 'Celery',
  gluten: 'Gluten',
  crustaceans: 'Crustaceans',
  egg: 'Egg',
  fish: 'Fish',
  lupin: 'Lupin',
  milk: 'Dairy',
  molluscs: 'Molluscs',
  mustard: 'Mustard',
  nuts: 'Tree Nuts',
  peanuts: 'Peanuts',
  sesame: 'Sesame',
  soya: 'Soya',
  'sulphur-dioxide': 'Sulphites',
}

export function AllergenList({ allergens }: { allergens: AllergenId[] }) {
  if (!allergens?.length) return null
  return (
    <p className="allergen-list" aria-label="Contains allergens">
      <span className="allergen-list__label">Contains: </span>
      {allergens.map((a, i) => (
        <span key={a} className="allergen-list__item">
          {LABELS[a]}{i < allergens.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
  )
}
