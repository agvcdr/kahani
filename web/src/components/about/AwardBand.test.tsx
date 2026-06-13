import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AwardBand } from './AwardBand'

describe('AwardBand', () => {
  it('renders award titles', () => {
    render(<AwardBand awards={[
      { title: 'Best Restaurant in Edinburgh — Scottish Curry Awards', body: '2023' },
      { title: 'Excellence in Indian Cuisine' },
    ]} />)
    expect(screen.getByText('Best Restaurant in Edinburgh — Scottish Curry Awards')).toBeInTheDocument()
    expect(screen.getByText('Excellence in Indian Cuisine')).toBeInTheDocument()
  })

  it('renders the award body when present', () => {
    render(<AwardBand awards={[{ title: 'Best Restaurant', body: '2023 · Scottish Curry Awards' }]} />)
    expect(screen.getByText('2023 · Scottish Curry Awards')).toBeInTheDocument()
  })

  it('returns null when awards array is empty', () => {
    const { container } = render(<AwardBand awards={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when awards is undefined', () => {
    const { container } = render(<AwardBand awards={undefined} />)
    expect(container.firstChild).toBeNull()
  })
})
