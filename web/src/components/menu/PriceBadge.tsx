import type { PriceEntry, PriceContext } from '@/types/sanity'

const LABELS: Partial<Record<PriceContext, string>> = {
  starter: 'Starter',
  'grill-main': 'Grill',
  main: 'Main',
  side: 'Side',
  'per-person': 'per person',
  'for-two': 'for two',
  bottle: 'Bottle',
  '125ml': '125ml',
  '175ml': '175ml',
  '250ml': '250ml',
  '500ml': '500ml',
  'half-pint': '½ pt',
  pint: 'Pint',
  '30ml': '30ml',
}

interface PriceBadgeProps {
  prices: PriceEntry[]
  priceOnRequest?: boolean
  context?: PriceContext
}

export function PriceBadge({ prices, priceOnRequest, context }: PriceBadgeProps) {
  if (priceOnRequest) return <span className="price price--por">Ask server</span>
  if (!prices?.length) return null

  const relevant = context ? prices.filter(p => p.context === context) : prices
  const display = relevant.length ? relevant : prices

  if (display.length === 1) {
    const p = display[0]
    const label = p.context !== 'standard' ? LABELS[p.context] : null
    return (
      <span className="price">
        {label && <span className="price__label">{label} </span>}
        £{p.amount.toFixed(2)}
      </span>
    )
  }

  return (
    <span className="price price--multi">
      {display.map((p, i) => (
        <span key={i} className="price__entry">
          {LABELS[p.context] && <span className="price__label">{LABELS[p.context]} </span>}
          £{p.amount.toFixed(2)}
        </span>
      ))}
    </span>
  )
}
