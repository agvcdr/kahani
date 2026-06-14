/** Centered section heading: a small ◆ diamond above a hairline rule, then the
 *  heading text. The diamond motif, pulled right back from the hero. */
export function DiamondHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div className="diamond-heading">
      <span className="diamond-heading__diamond" aria-hidden="true">◆</span>
      <h2 id={id} className="diamond-heading__title">{children}</h2>
    </div>
  )
}
