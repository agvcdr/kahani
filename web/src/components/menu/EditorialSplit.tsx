import Image from 'next/image'
import type { ReactNode } from 'react'

export interface EditorialSplitProps {
  image: { url: string; alt: string }
  title: string
  eyebrow?: string | null
  /** Which side the image sits on at desktop width; stacks on mobile. */
  side: 'left' | 'right'
  /** Optional priority for an above-the-fold split (LCP). Default false. */
  priority?: boolean
  children?: ReactNode
}

/**
 * Reusable editorial split: a tall macro image beside a column of eyebrow +
 * Marcellus title + body. Alternates by `side`, stacks on mobile. Presentation
 * only — used by menu dish spotlights and (Phase 4) About chapters.
 */
export function EditorialSplit({ image, title, eyebrow, side, priority = false, children }: EditorialSplitProps) {
  return (
    <section className={`editorial-split editorial-split--${side}`}>
      <div className="editorial-split__media">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 860px) 100vw, 50vw"
          className="editorial-split__img"
          priority={priority}
        />
      </div>
      <div className="editorial-split__content">
        {eyebrow && <p className="editorial-split__eyebrow">{eyebrow}</p>}
        <h2 className="editorial-split__title">{title}</h2>
        {children}
      </div>
    </section>
  )
}
