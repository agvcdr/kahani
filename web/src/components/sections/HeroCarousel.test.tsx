import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { HeroCarousel } from './HeroCarousel'

// next/image → a plain <img> so we can assert src/alt/priority in jsdom.
vi.mock('next/image', () => ({
  default: ({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) =>
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-priority={priority ? 'true' : 'false'} />,
}))

const images = [
  { url: 'https://cdn/1.jpg', alt: 'One' },
  { url: 'https://cdn/2.jpg', alt: 'Two' },
  { url: 'https://cdn/3.jpg', alt: 'Three' },
]

function setReducedMotion(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

describe('HeroCarousel', () => {
  beforeEach(() => { vi.useFakeTimers(); setReducedMotion(false) })
  afterEach(() => { vi.useRealTimers() })

  it('renders one slide per image with only the first marked priority', () => {
    const { container } = render(<HeroCarousel images={images} />)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(3)
    expect(imgs[0].getAttribute('data-priority')).toBe('true')
    expect(imgs[1].getAttribute('data-priority')).toBe('false')
  })

  it('starts on the first slide and advances on a timer', () => {
    const { container } = render(<HeroCarousel images={images} />)
    const slides = () => container.querySelectorAll('.hero-carousel__slide')
    expect(slides()[0].className).toContain('is-active')
    act(() => { vi.advanceTimersByTime(5000) })
    expect(slides()[1].className).toContain('is-active')
    expect(slides()[0].className).not.toContain('is-active')
  })

  it('freezes on the first slide under prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { container } = render(<HeroCarousel images={images} />)
    act(() => { vi.advanceTimersByTime(15000) })
    const slides = container.querySelectorAll('.hero-carousel__slide')
    expect(slides[0].className).toContain('is-active')
    expect(slides[1].className).not.toContain('is-active')
  })

  it('does not rotate when given a single image', () => {
    const { container } = render(<HeroCarousel images={[images[0]]} />)
    act(() => { vi.advanceTimersByTime(15000) })
    expect(container.querySelectorAll('.hero-carousel__slide')).toHaveLength(1)
    expect(container.querySelector('.hero-carousel__slide')!.className).toContain('is-active')
  })
})
