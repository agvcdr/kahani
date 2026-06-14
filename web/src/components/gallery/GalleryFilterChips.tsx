type Category = 'food' | 'interior' | 'events'
type Filter = 'all' | Category

const CHIPS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'food', label: 'Food' },
  { value: 'interior', label: 'Interior' },
  { value: 'events', label: 'Events' },
]

export function GalleryFilterChips({
  available,
  active,
  onChange,
}: {
  available: Set<Category>
  active: Filter
  onChange: (f: Filter) => void
}) {
  return (
    <div className="gallery-chips" role="group" aria-label="Filter gallery by category">
      {CHIPS.map(chip => {
        if (chip.value !== 'all' && !available.has(chip.value as Category)) return null
        return (
          <button
            key={chip.value}
            className={`gallery-chip${active === chip.value ? ' gallery-chip--active' : ''}`}
            aria-pressed={active === chip.value}
            onClick={() => onChange(chip.value)}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
