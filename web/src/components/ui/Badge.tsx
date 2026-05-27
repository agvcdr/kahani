import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'veg' | 'vegan' | 'gf' | 'sold-out' | 'seasonal' | 'featured' | 'neutral'
  title?: string
}

const STYLES: Record<NonNullable<BadgeProps['variant']>, string> = {
  veg:      'badge--veg',
  vegan:    'badge--vegan',
  gf:       'badge--gf',
  'sold-out': 'badge--sold-out',
  seasonal: 'badge--seasonal',
  featured: 'badge--featured',
  neutral:  'badge--neutral',
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={`badge ${STYLES[variant]}`}>{children}</span>
}
