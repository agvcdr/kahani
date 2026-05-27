import type { SanitySiteSettings } from '@/types/sanity'

const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}

export function HoursAndLocation({ settings }: { settings: SanitySiteSettings }) {
  const { address, phone, regularHours, mapUrl, hoursNotes } = settings
  return (
    <section className="hours-location" aria-labelledby="hours-heading">
      <div className="hours-location__inner">
        <div className="hours-location__hours">
          <h2 id="hours-heading" className="section-heading">Opening Hours</h2>
          {regularHours?.length ? (
            <table className="hours-table">
              <tbody>
                {regularHours.map((p, i) => (
                  <tr key={i}>
                    <td className="hours-table__days">{p.days.map(d => DAY_SHORT[d] ?? d).join(', ')}</td>
                    <td className="hours-table__time">{p.open} – {p.close}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {hoursNotes?.map((note, i) => <p key={i} className="hours-note">{note}</p>)}
        </div>

        <div className="hours-location__address">
          <h2 className="section-heading">Find Us</h2>
          {address && (
            <address className="location-address">
              {address.line1}<br />
              {address.city}<br />
              {address.postcode}
            </address>
          )}
          {phone && (
            <p className="location-phone">
              <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
            </p>
          )}
          {mapUrl && (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
              Get Directions
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
