import type { SanitySetMenu } from '@/types/sanity'
import { DietaryBadge } from './DietaryBadge'

export function SetMenuDisplay({ menu }: { menu: SanitySetMenu }) {
  return (
    <div className="set-menu">
      <div className="set-menu__header">
        <div className="set-menu__price-block">
          {menu.prices.map((p, i) => (
            <div key={i} className="set-menu__price">
              <span className="set-menu__amount">£{p.amount.toFixed(2)}</span>
              {p.context !== 'standard' && (
                <span className="set-menu__context">
                  {p.context === 'per-person' ? 'per person' : p.context === 'for-two' ? 'for two' : p.context}
                </span>
              )}
            </div>
          ))}
        </div>
        {menu.availability && <p className="set-menu__availability">Available {menu.availability}</p>}
        {menu.byob && <p className="set-menu__byob">🍷 BYOB welcome</p>}
        {menu.style && <p className="set-menu__style">{menu.style}</p>}
        {menu.note && <p className="set-menu__note">{menu.note}</p>}
      </div>

      {menu.preStarter && (
        <div className="set-menu__prestarter">
          <p><strong>To start:</strong> {menu.preStarter}</p>
        </div>
      )}

      {menu.courses?.map((course) => (
        <div key={course.courseTitle} className="set-menu__course">
          <h3 className="set-menu__course-title">{course.courseTitle}</h3>
          {course.instruction && <p className="set-menu__instruction">{course.instruction}</p>}

          {course.items?.length > 0 && (
            <ul className="set-menu__items" role="list">
              {course.items.map(item => (
                <li key={item.id} className="set-menu__item">
                  <div className="set-menu__item-header">
                    <span className="set-menu__item-name">{item.name}</span>
                    <DietaryBadge dietary={item.dietary} />
                  </div>
                  {item.description && <p className="set-menu__item-desc">{item.description}</p>}
                </li>
              ))}
            </ul>
          )}

          {(course.fixedItems?.length ?? 0) > 0 && (
            <ul className="set-menu__fixed-items" role="list">
              {(course.fixedItems ?? []).map((item, i) => (
                <li key={i} className="set-menu__fixed-item">{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
