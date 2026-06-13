const PILLARS = [
  {
    name: 'Street-Food Roots',
    desc: 'Every dish traces back to the clamour of an Indian roadside — honest food cooked fast and full of flavour.',
    icon: '🌶',
  },
  {
    name: 'Family Recipes',
    desc: 'Spice blends measured by eye and memory, passed down through generations and cooked the slow way they were meant to be.',
    icon: '🫕',
  },
  {
    name: 'Edinburgh Home',
    desc: 'Found on Antigua Street — minutes from St James Quarter and the Playhouse — Kahani belongs to this city.',
    icon: '🏙️',
  },
  {
    name: 'Catering & Events',
    desc: 'We bring the same energy and spice to your occasion. Ask us about private dining, catering, and events.',
    icon: '🎉',
  },
]

export function AboutPillars() {
  return (
    <section className="about-pillars" aria-labelledby="pillars-heading">
      <div className="container">
        <h2 id="pillars-heading" className="about-pillars__heading">
          <span className="about-pillars__diamond" aria-hidden="true">◆</span>The Kahani Difference
        </h2>
        <div className="about-pillars__grid">
          {PILLARS.map(p => (
            <div key={p.name} className="pillar-card">
              <span className="pillar-card__icon" aria-hidden="true">{p.icon}</span>
              <h3 className="pillar-card__name">{p.name}</h3>
              <p className="pillar-card__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
