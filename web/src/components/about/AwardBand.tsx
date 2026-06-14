export function AwardBand({ awards }: { awards?: Array<{ title: string; body?: string }> }) {
  if (!awards?.length) return null
  return (
    <section className="award-band" aria-labelledby="awards-heading">
      <div className="container">
        <span className="award-band__diamond" aria-hidden="true">◆</span>
        <ul className="award-band__list" aria-labelledby="awards-heading">
          {awards.map((a, i) => (
            <li key={i} className="award-band__item">
              <span className="award-band__title">{a.title}</span>
              {a.body && <span className="award-band__body">{a.body}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
