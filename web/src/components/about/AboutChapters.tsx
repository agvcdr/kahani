import type { SanityAboutChapter } from '@/types/sanity'
import { EditorialSplit } from '@/components/menu/EditorialSplit'
import { SPOTLIGHT_FALLBACK_IMAGES } from '@/lib/images/fallbacks'

function resolveChapterImage(chapter: SanityAboutChapter, idx: number): { url: string; alt: string } {
  if (chapter.image?.url) {
    return { url: chapter.image.url, alt: chapter.image.alt ?? chapter.title }
  }
  const pick = SPOTLIGHT_FALLBACK_IMAGES[idx % SPOTLIGHT_FALLBACK_IMAGES.length]
  return { url: pick.url, alt: pick.alt }
}

export function AboutChapters({ chapters }: { chapters?: SanityAboutChapter[] | null }) {
  const rendered = (chapters ?? []).filter(c => Boolean(c.title))
  if (!rendered.length) return null
  return (
    <div className="about-chapters">
      {rendered.map((chapter, i) => (
        <EditorialSplit
          key={chapter.title + i}
          image={resolveChapterImage(chapter, i)}
          title={chapter.title}
          eyebrow={chapter.eyebrow}
          side={i % 2 === 0 ? 'left' : 'right'}
          priority={i === 0}
        >
          {chapter.body && <p className="editorial-split__body">{chapter.body}</p>}
        </EditorialSplit>
      ))}
    </div>
  )
}
