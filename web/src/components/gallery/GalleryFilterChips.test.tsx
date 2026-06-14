import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GalleryFilterChips } from './GalleryFilterChips'

describe('GalleryFilterChips', () => {
  const available = new Set<'food' | 'interior' | 'events'>(['food', 'interior', 'events'])

  it('renders the All chip and one chip per available category', () => {
    render(<GalleryFilterChips available={available} active="all" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Food' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Interior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Events' })).toBeInTheDocument()
  })

  it('marks the active chip with aria-pressed="true"', () => {
    render(<GalleryFilterChips available={available} active="food" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Food' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange with the correct value when a chip is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<GalleryFilterChips available={available} active="all" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Interior' }))
    expect(onChange).toHaveBeenCalledWith('interior')
  })

  it('hides chips for unavailable categories', () => {
    render(<GalleryFilterChips available={new Set(['food'])} active="all" onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Interior' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Events' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Food' })).toBeInTheDocument()
  })

  it('still renders the All chip even when only one category is available', () => {
    render(<GalleryFilterChips available={new Set(['food'])} active="all" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  })
})
