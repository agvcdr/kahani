import type { Metadata } from 'next'
import Link from 'next/link'
import { publicClient } from '@/lib/sanity/client'
import { PRINT_MENU_DATA } from '@/lib/sanity/queries'
import type { PriceEntry, DietaryTag } from '@/types/sanity'
import PrintButton from './PrintButton'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Print Menu — Kahani' }

// ── Types ─────────────────────────────────────────────────────────────────────

interface PrintItem {
  id: string
  name: string
  description?: string | null
  prices: PriceEntry[]
  priceOnRequest?: boolean
  dietary: DietaryTag[]
  spiceLevel: number
  featured?: boolean
  soldOut?: boolean
  categoryIds: string[]
}

interface PrintCourse {
  courseTitle: string
  instruction?: string | null
  items: Array<{ id: string; name: string; description?: string | null; dietary: DietaryTag[] }>
  fixedItems?: string[]
}

interface PrintSetMenu {
  id: string
  slug: string
  name: string
  prices: PriceEntry[]
  byob?: boolean
  preStarter?: string | null
  availability?: string | null
  note?: string | null
  courses: PrintCourse[]
}

interface PrintData {
  items: PrintItem[]
  setMenus: PrintSetMenu[]
  settings: {
    name: string
    phone?: string | null
    address?: { line1: string; city?: string | null; postcode?: string | null } | null
  } | null
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function esc(s: string | null | undefined): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmtP(n: number): string {
  return `£${Number(n).toFixed(2)}`
}

function badges(dietary: DietaryTag[]): string {
  const d = dietary || []
  let b = ''
  if (d.includes('vegan'))           b += `<span class="badge ve">VE</span>`
  else if (d.includes('vegetarian')) b += `<span class="badge v">V</span>`
  if (d.includes('gluten-free'))     b += `<span class="badge gf">GF</span>`
  return b
}

function spiceDots(level: number): string {
  if (!level) return ''
  return `<span class="spice" aria-label="Spice level ${level} of 5">${'&#9679;'.repeat(level)}${'&#9675;'.repeat(5 - level)}</span>`
}

function bestPrice(item: PrintItem, ...ctxs: string[]): number | null {
  const ps = item.prices || []
  for (const ctx of ctxs) {
    const found = ps.find(p => p.context === ctx)
    if (found) return found.amount
  }
  return ps.length ? ps[0].amount : null
}

type PriceCtx = string | string[] | 'multi'

function renderItem(item: PrintItem, priceCtxs: PriceCtx): string {
  const b    = badges(item.dietary)
  const s    = spiceDots(item.spiceLevel)
  const star = item.featured ? `<span class="feat-star">&#9733;</span>` : ''
  const cls  = item.soldOut ? ' sold-out' : ''
  const desc = item.description ? `\n<p class="desc">${esc(item.description)}</p>` : ''

  let priceHtml: string
  if (item.priceOnRequest) {
    priceHtml = `<span class="price-por">Ask server</span>`
  } else if (priceCtxs === 'multi') {
    const m = bestPrice(item, 'main')
    const si = bestPrice(item, 'side')
    priceHtml = `<span class="price price--multi">Main&thinsp;${fmtP(m ?? 0)} &thinsp;&middot;&thinsp; Side&thinsp;${fmtP(si ?? 0)}</span>`
  } else {
    const ctxs = Array.isArray(priceCtxs) ? priceCtxs : [priceCtxs]
    const amt  = bestPrice(item, ...ctxs)
    priceHtml  = amt != null ? `<span class="price">${fmtP(amt)}</span>` : ''
  }

  return `<div class="item${cls}">
<div class="item-top">
  <div class="item-name-row"><span class="iname">${esc(item.name)}</span>${star}${b}${s}</div>
  <div class="item-price-col">${priceHtml}</div>
</div>${desc}
</div>`
}

function splitCols<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2)
  return [items.slice(0, mid), items.slice(mid)]
}

function twoCols(items: PrintItem[], priceCtxs: PriceCtx): string {
  const [left, right] = splitCols(items)
  const ri = (i: PrintItem) => renderItem(i, priceCtxs)
  return `<div class="cols2"><div class="col">${left.map(ri).join('')}</div><div class="col">${right.map(ri).join('')}</div></div>`
}

function secHead(title: string, note?: string): string {
  const n = note ? `<span class="sec-note">${note}</span>` : ''
  return `<div class="sec-head"><h2 class="sec-title">${title}</h2>${n}</div>`
}

function setList(items: Array<{ name: string; dietary?: DietaryTag[] }>): string {
  return `<ul class="set-list">${items.map(i => {
    const b = badges(i.dietary || [])
    return `<li class="set-item">${esc(i.name)}${b}</li>`
  }).join('')}</ul>`
}

function setListStr(names: string[]): string {
  return `<ul class="set-list">${names.map(n => `<li class="set-item">${esc(n)}</li>`).join('')}</ul>`
}

function priceBand(label: string, price: number, time?: string): string {
  const t = time ? `<span class="set-price-time">${time}</span>` : ''
  return `<div class="set-price-band banner">
<span class="set-price-label">${label}</span>
<span class="set-price-val">${fmtP(price)}</span>
${t}
</div>`
}

// ── Shared chrome ─────────────────────────────────────────────────────────────

const LOGO_HDR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 52" width="150" height="26">
  <defs><style>.lt{font-family:"Playfair Display",Georgia,serif;}</style></defs>
  <line x1="8" y1="13" x2="126" y2="13" stroke="#C9A028" stroke-width="0.7" opacity="0.5"/>
  <polygon points="150,8 155,13 150,18 145,13" fill="#C9A028"/>
  <line x1="174" y1="13" x2="292" y2="13" stroke="#C9A028" stroke-width="0.7" opacity="0.5"/>
  <text class="lt" x="153.5" y="40" font-size="28" font-weight="700" fill="#C9A028" text-anchor="middle" letter-spacing="7">KAHANI</text>
</svg>`

const LEGEND = `<footer class="legend">
  <div class="legend-row">
    <div class="legend-badges">
      <span class="badge v">V</span><span>Vegetarian</span>
      <span class="badge ve">VE</span><span>Vegan</span>
      <span class="badge gf">GF</span><span>Gluten-Free</span>
    </div>
    <div class="legend-spice">
      <span class="spice">&#9679;&#9675;&#9675;&#9675;&#9675;</span>&thinsp;Mild &ensp;
      <span class="spice">&#9679;&#9679;&#9675;&#9675;&#9675;</span>&thinsp;Medium &ensp;
      <span class="spice">&#9679;&#9679;&#9679;&#9675;&#9675;</span>&thinsp;Hot &ensp;
      <span class="spice">&#9679;&#9679;&#9679;&#9679;&#9675;</span>&thinsp;Very Hot
    </div>
  </div>
  <p class="legend-note">Please inform your server of any dietary requirements or allergies before ordering. Full allergen information is available on request.</p>
</footer>`

function menuPage(section: string, body: string): string {
  return `<div class="page">
<header class="hdr">
  <div class="hdr-logo">${LOGO_HDR}</div>
  <span class="hdr-section">${section}</span>
</header>
<div class="body">
${body}
</div>
${LEGEND}
</div>`
}

// ── Page generators ───────────────────────────────────────────────────────────

function coverPage(settings: PrintData['settings']): string {
  const phone = settings?.phone ?? ''
  const addr  = settings?.address
  const addrStr = addr
    ? `${esc(addr.line1)} &nbsp;&middot;&nbsp; ${esc(addr.city ?? '')} ${esc(addr.postcode ?? '')} &nbsp;&middot;&nbsp; ${esc(phone)}`
    : esc(phone)

  return `<div class="page cover">
<div class="cover-inner">
  <div class="cover-orn"><span class="orn-line"></span><span class="orn-dia"></span><span class="orn-line"></span></div>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 165" width="420" height="124">
    <defs><style>.ct{font-family:"Playfair Display",Georgia,serif;}.cs{font-family:"Montserrat",Arial,sans-serif;}</style></defs>
    <line x1="60" y1="34" x2="246" y2="34" stroke="#C9A028" stroke-width="0.9" opacity="0.6"/>
    <polygon points="280,25 287,34 280,43 273,34" fill="#C9A028"/>
    <line x1="314" y1="34" x2="500" y2="34" stroke="#C9A028" stroke-width="0.9" opacity="0.6"/>
    <text x="58" y="38" text-anchor="middle" fill="#C9A028" font-size="9" opacity="0.5" font-family="serif">&#10022;</text>
    <text x="502" y="38" text-anchor="middle" fill="#C9A028" font-size="9" opacity="0.5" font-family="serif">&#10022;</text>
    <text class="ct" x="288" y="108" font-size="72" font-weight="700" fill="#C9A028" text-anchor="middle" letter-spacing="16">KAHANI</text>
    <line x1="80" y1="126" x2="244" y2="126" stroke="#C9A028" stroke-width="0.9" opacity="0.45"/>
    <polygon points="280,119 286,126 280,133 274,126" fill="#C9A028" opacity="0.85"/>
    <line x1="316" y1="126" x2="480" y2="126" stroke="#C9A028" stroke-width="0.9" opacity="0.45"/>
    <text class="cs" x="280" y="153" font-size="11.5" font-weight="600" fill="#D4AA50" text-anchor="middle" letter-spacing="7">INDIAN STREET FOOD</text>
  </svg>
  <div class="cover-orn mid"><span class="orn-line"></span><span class="orn-dia"></span><span class="orn-line"></span></div>
  <p class="cover-tagline">a story worth tasting</p>
  <p class="cover-sub">Dine In &nbsp;&middot;&nbsp; Takeaway &nbsp;&middot;&nbsp; Events &amp; Catering</p>
</div>
<p class="cover-footer">${addrStr}</p>
</div>`
}

function tradStartersPage(items: PrintItem[]): string {
  return menuPage(
    'A La Carte &mdash; Traditional Starters',
    secHead('Traditional Starters') + twoCols(items, ['starter', 'standard'])
  )
}

function sigStartersPage(items: PrintItem[]): string {
  return menuPage(
    'A La Carte &mdash; Signature Starters',
    secHead('Signature Starters') + twoCols(items, ['starter', 'standard'])
  )
}

function grillSeafoodPage(
  grillItems: PrintItem[],
  seafoodItems: PrintItem[],
  starterIds: Set<string>
): string {
  const grillForSection = grillItems.map(item => ({
    ...item,
    _priceCtx: starterIds.has(item.id) ? ['grill-main', 'standard'] : ['standard'],
  }))
  const [gLeft, gRight] = splitCols(grillForSection)
  const ri = (i: typeof grillForSection[0]) => renderItem(i, i._priceCtx)
  const grillCols = `<div class="cols2"><div class="col">${gLeft.map(ri).join('')}</div><div class="col">${gRight.map(ri).join('')}</div></div>`

  const body =
    secHead('Tandoori Grill', 'All grills served with mint chutney and salad') +
    grillCols +
    secHead('Seafood Curries') +
    twoCols(seafoodItems, 'standard')
  return menuPage('A La Carte &mdash; Grill &amp; Seafood', body)
}

function curriesPage(chicken: PrintItem[], lamb: PrintItem[]): string {
  const body =
    secHead('Chicken Curries', 'Served with steamed rice or plain naan') +
    twoCols(chicken, 'standard') +
    secHead('Lamb Curries', 'Served with steamed rice or plain naan') +
    twoCols(lamb, 'standard')
  return menuPage('A La Carte &mdash; Curries', body)
}

function vegBiryaniPage(veg: PrintItem[], biryani: PrintItem[]): string {
  const body =
    secHead('Vegetable Dishes', 'Main £12.50 &middot; Side dish £6.95') +
    twoCols(veg, 'multi') +
    secHead('Hyderabadi Biryani', 'Served with raita') +
    twoCols(biryani, 'standard')
  return menuPage('A La Carte &mdash; Vegetable &amp; Biryani', body)
}

function breadsRiceAccPage(breads: PrintItem[], rice: PrintItem[], acc: PrintItem[]): string {
  const [bLeft, bRight] = splitCols(breads)
  const ri = (i: PrintItem) => renderItem(i, 'standard')
  const breadCols = `<div class="cols2"><div class="col">${bLeft.map(ri).join('')}</div><div class="col">${bRight.map(ri).join('')}</div></div>`
  const riceCol = `<div class="col1">${rice.map(ri).join('')}</div>`
  const accCol  = `<div class="col1">${acc.map(ri).join('')}</div>`

  const body =
    secHead('Breads') +
    breadCols +
    `<div class="cols2-wrap">
<div class="mini-col">${secHead('Rice')}${riceCol}</div>
<div class="mini-col">${secHead('Accompaniments')}${accCol}</div>
</div>`
  return menuPage('A La Carte &mdash; Breads, Rice &amp; Accompaniments', body)
}

function dessertsDrinksPage(desserts: PrintItem[], drinks: PrintItem[]): string {
  const body =
    secHead('Desserts') +
    twoCols(desserts, 'standard') +
    secHead('Drinks') +
    twoCols(drinks, 'standard')
  return menuPage('A La Carte &mdash; Desserts &amp; Drinks', body)
}

function lunchPage(lunchOne: PrintSetMenu | undefined, lunchTwo: PrintSetMenu | undefined): string {
  if (!lunchOne && !lunchTwo) return ''

  const oneCoursePrice = lunchOne?.prices[0]?.amount ?? 0
  const oneCourseItems = lunchOne?.courses[0]?.items ?? []

  const twoCoursePrice = lunchTwo?.prices[0]?.amount ?? 0
  const twoCourseStarters = lunchTwo?.courses.find(c => c.courseTitle === 'Starters')?.items ?? []
  const twoCourseMains    = lunchTwo?.courses.find(c => c.courseTitle === 'Mains')?.items ?? []
  const twoCourseSundries = lunchTwo?.courses.find(c => c.courseTitle === 'Sundries')?.fixedItems ?? []

  const body = `<div class="set-pg">
<div class="set-hd"><h2 class="set-title">Lunch Menu</h2><p class="set-sub">Available Monday to Sunday</p></div>

${lunchOne ? `<div class="set-block">
  ${priceBand('One Course', oneCoursePrice, lunchOne.availability ?? '')}
  <p class="set-choice-label">Choose one main course</p>
  ${setList(oneCourseItems)}
</div>
<div class="set-divider"></div>` : ''}

${lunchTwo ? `<div class="set-block">
  ${priceBand('Two Courses', twoCoursePrice, lunchTwo.availability ?? '')}
  <p class="set-note">Includes poppadoms &amp; chutney on arrival</p>
  <div class="set-cols">
    <div class="set-col">
      <p class="set-choice-label">Starter &mdash; choose one</p>
      ${setList(twoCourseStarters)}
    </div>
    <div class="set-col">
      <p class="set-choice-label">Main Course &mdash; choose one</p>
      ${setList(twoCourseMains)}
      <p class="set-choice-label">Sundry &mdash; choose one</p>
      ${setListStr(twoCourseSundries)}
    </div>
  </div>
</div>` : ''}
</div>`

  return menuPage('Lunch Menu', body)
}

function preTheatrePage(pt: PrintSetMenu | undefined): string {
  if (!pt) return ''
  const price    = pt.prices[0]?.amount ?? 0
  const starters = pt.courses.find(c => c.courseTitle === 'Starters')?.items ?? []
  const mains    = pt.courses.find(c => c.courseTitle === 'Mains')?.items ?? []
  const sundries = pt.courses.find(c => c.courseTitle === 'Sundries')?.fixedItems ?? []

  const body = `<div class="set-pg">
<div class="set-hd">
  <h2 class="set-title">Pre-Theatre Menu</h2>
  <p class="set-sub">Three courses &mdash; great value before an evening show</p>
</div>
${priceBand('Per Person', price, 'Available 12:00&ndash;18:30')}
<p class="set-note" style="margin-bottom:12px;">Includes poppadoms &amp; chutney on arrival</p>
<div class="set-cols">
  <div class="set-col">
    <p class="set-choice-label">Starter &mdash; choose one</p>
    ${setList(starters)}
  </div>
  <div class="set-col">
    <p class="set-choice-label">Main Course &mdash; choose one</p>
    ${setList(mains)}
    <p class="set-choice-label">Sundry &mdash; choose one</p>
    ${setListStr(sundries)}
  </div>
</div>
</div>`

  return menuPage('Pre-Theatre Menu', body)
}

function kidsPage(items: PrintItem[]): string {
  const mainPrice = items.find(i => !i.id.includes('ice-cream') && !['kids-caprisun','kids-appletizer','kids-apple-juice','kids-orange-juice','kids-lassi'].includes(i.id))?.prices[0]?.amount ?? 9.50
  const [left, right] = splitCols(items)
  const ri = (i: PrintItem) => `<li class="set-item">${esc(i.name)}${badges(i.dietary)}</li>`

  const body = `<div class="set-pg">
<div class="set-hd">
  <h2 class="set-title">Kids Menu</h2>
  <p class="set-sub">For our little guests &mdash; age 12 and under</p>
</div>
${priceBand('Main Course', mainPrice, '')}
<div class="set-cols">
  <div class="set-col">
    <ul class="set-list">${left.map(ri).join('')}</ul>
  </div>
  <div class="set-col">
    <ul class="set-list">${right.map(ri).join('')}</ul>
  </div>
</div>
</div>`

  return menuPage('Kids Menu', body)
}

function partyAfternoonTeaPage(
  party: PrintSetMenu | undefined,
  at: PrintSetMenu | undefined
): string {
  const partyPrice    = party?.prices[0]?.amount ?? 0
  const partyStarters = party?.courses.find(c => c.courseTitle === 'Starters')?.fixedItems ?? []
  const partyMains    = party?.courses.find(c => c.courseTitle === 'Mains')?.items ?? []

  const atPrice = at?.prices[0]?.amount ?? 0
  const sandwiches = at?.courses.find(c => c.courseTitle === 'Sandwiches')?.fixedItems ?? []
  const savoury    = at?.courses.find(c => c.courseTitle === 'Savoury')?.fixedItems ?? []
  const sweets     = at?.courses.find(c => c.courseTitle === 'Sweets')?.fixedItems ?? []

  const body = `<div class="set-pg">
${party ? `<div class="set-hd">
  <h2 class="set-title">Party Menu</h2>
  <p class="set-sub">Banquet-style sharing &mdash; ideal for groups &amp; celebrations</p>
</div>
${priceBand('Per Person', partyPrice, '')}
<p class="set-note" style="margin-bottom:10px;">Arrives with Poppadoms &amp; Pickle Tray. Served with rice and a selection of naan breads.</p>
<div class="set-cols" style="margin-bottom:0;">
  <div class="set-col">
    <p class="set-choice-label">Starters &mdash; choose two</p>
    ${setListStr(partyStarters)}
  </div>
  <div class="set-col">
    <p class="set-choice-label">Main Courses &mdash; choose three</p>
    ${setList(partyMains)}
  </div>
</div>
<div class="set-divider" style="margin-top:18px;"></div>` : ''}

${at ? `<div class="set-hd" style="margin-top:16px;">
  <h2 class="set-title">Afternoon Tea</h2>
  <p class="set-sub">BYOB &nbsp;&middot;&nbsp; Served with bottomless tea or coffee</p>
</div>
${priceBand('For Two', atPrice, '')}
<div class="set-cols">
  <div class="set-col">
    <p class="set-choice-label">Sandwiches</p>
    ${setListStr(sandwiches)}
    <p class="set-choice-label">Savouries</p>
    ${setListStr(savoury)}
  </div>
  <div class="set-col">
    <p class="set-choice-label">Sweets</p>
    ${setListStr(sweets)}
  </div>
</div>` : ''}
</div>`

  return menuPage('Party Menu &amp; Afternoon Tea', body)
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const PRINT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');

.print-menu-root *, .print-menu-root *::before, .print-menu-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

.print-menu-root {
  --maroon:   #1E0808;
  --gold:     #C9A028;
  --gold-w:   #D4AA50;
  --gold-dk:  #9A7018;
  --cream:    #FFF8EF;
  --cream-bg: #F5EDE0;
  --stone:    #E0D3C0;
  --text:     #1A1209;
  --muted:    #5A4025;
  --light:    #8A7055;
  font-size: 14px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.print-bar {
  background: var(--maroon, #1E0808);
  border-bottom: 1px solid rgba(201,160,40,0.3);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.print-menu-root .page {
  width: 210mm;
  min-height: 297mm;
  background: var(--cream-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  font-family: 'Montserrat', Arial, sans-serif;
}
.print-menu-root .page + .page {
  page-break-before: always;
  break-before: page;
}
@media screen {
  .print-menu-root { background: #A89880; padding: 0 16px 64px; }
  .print-menu-root .page { margin: 0 auto 20px; box-shadow: 0 6px 40px rgba(0,0,0,0.25); }
}
@page { size: A4; margin: 0; }

.print-menu-root .cover {
  background: var(--maroon);
  align-items: center;
  justify-content: center;
}
.print-menu-root .cover-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.print-menu-root .cover-orn {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 36px 0;
}
.print-menu-root .cover-orn.mid { margin: 28px 0 16px; }
.print-menu-root .orn-line { width: 72px; height: 1px; background: var(--gold); opacity: 0.35; }
.print-menu-root .orn-dia  { width: 7px; height: 7px; background: var(--gold); transform: rotate(45deg); opacity: 0.65; flex-shrink: 0; }
.print-menu-root .cover-tagline {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 15px;
  color: var(--gold-w);
  letter-spacing: 0.5px;
}
.print-menu-root .cover-sub {
  font-size: 8.5px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(201,160,40,0.35);
  margin-top: 10px;
}
.print-menu-root .cover-footer {
  position: absolute;
  bottom: 28px; left: 0; right: 0;
  text-align: center;
  font-size: 8.5px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(201,160,40,0.2);
}

.print-menu-root .hdr {
  background: var(--maroon);
  padding: 10px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: 50px;
}
.print-menu-root .hdr-section {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: var(--gold-w);
  opacity: 0.85;
}
.print-menu-root .body {
  flex: 1;
  padding: 16px 26px 10px;
  overflow: hidden;
}

.print-menu-root .sec-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 12px 0 6px;
  padding-bottom: 5px;
  border-bottom: 1.5px solid var(--gold);
}
.print-menu-root .sec-head:first-child { margin-top: 0; }
.print-menu-root .sec-title {
  font-family: 'Playfair Display', serif;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--maroon);
  flex-shrink: 0;
}
.print-menu-root .sec-note {
  font-size: 9px;
  color: var(--light);
  font-style: italic;
  letter-spacing: 0.3px;
}

.print-menu-root .cols2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 22px;
  margin-bottom: 8px;
}
.print-menu-root .col { display: flex; flex-direction: column; }
.print-menu-root .col1 { margin-bottom: 8px; }
.print-menu-root .cols2-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 22px;
  margin-bottom: 8px;
}

.print-menu-root .item {
  padding: 6px 0;
  border-bottom: 1px solid rgba(220,210,195,0.5);
}
.print-menu-root .item:last-child { border-bottom: none; }
.print-menu-root .item-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.print-menu-root .item-name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.print-menu-root .iname {
  font-family: 'Playfair Display', serif;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--maroon);
  line-height: 1.2;
}
.print-menu-root .feat-star {
  color: var(--gold);
  font-size: 11px;
  vertical-align: middle;
  flex-shrink: 0;
}
.print-menu-root .item-price-col { flex-shrink: 0; text-align: right; padding-left: 6px; }
.print-menu-root .price {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--maroon);
  white-space: nowrap;
}
.print-menu-root .price--multi {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--gold-dk);
  white-space: nowrap;
}
.print-menu-root .price-por {
  font-size: 9.5px;
  color: var(--light);
  font-style: italic;
}
.print-menu-root .desc {
  font-size: 10.5px;
  color: var(--muted);
  line-height: 1.5;
  margin-top: 2px;
}
.print-menu-root .item.sold-out { opacity: 0.45; }

.print-menu-root .badge {
  display: inline-block;
  font-size: 7.5px;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  padding: 1px 4px;
  border-radius: 2px;
  vertical-align: middle;
  line-height: 1.7;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}
.print-menu-root .badge.v  { background: #E8F5E9; color: #1B5E20; border: 1px solid #A5D6A7; }
.print-menu-root .badge.ve { background: #E0F7FA; color: #004D40; border: 1px solid #80DEEA; }
.print-menu-root .badge.gf { background: #FFF8E1; color: #E65100; border: 1px solid #FFCC80; }

.print-menu-root .spice {
  font-size: 8.5px;
  color: #B03020;
  letter-spacing: 1px;
  vertical-align: middle;
  flex-shrink: 0;
}

.print-menu-root .legend {
  background: var(--maroon);
  padding: 8px 26px 10px;
  flex-shrink: 0;
  border-top: 1px solid rgba(201,160,40,0.15);
}
.print-menu-root .legend-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-bottom: 5px;
}
.print-menu-root .legend-badges {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  color: var(--gold-w);
  flex-shrink: 0;
}
.print-menu-root .legend-badges span:not(.badge) { margin-right: 6px; }
.print-menu-root .legend-spice {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 8.5px;
  color: rgba(212,170,80,0.5);
  flex-wrap: wrap;
}
.print-menu-root .legend-spice .spice { color: rgba(200,70,50,0.65); font-size: 8px; }
.print-menu-root .legend-note {
  font-size: 8px;
  color: rgba(201,160,40,0.28);
  letter-spacing: 0.3px;
  line-height: 1.4;
}

.print-menu-root .set-pg { height: 100%; }
.print-menu-root .set-hd { margin-bottom: 10px; }
.print-menu-root .set-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--maroon);
}
.print-menu-root .set-sub {
  font-size: 10px;
  color: var(--light);
  margin-top: 2px;
  font-style: italic;
}
.print-menu-root .set-price-band {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 14px;
  background: var(--cream);
  border-left: 3px solid var(--gold);
  border-radius: 0 5px 5px 0;
}
.print-menu-root .set-price-band.banner {
  background: var(--maroon);
  border-left: none;
  border-radius: 5px;
}
.print-menu-root .set-price-band.banner .set-price-label { color: var(--gold-w); opacity: 0.7; }
.print-menu-root .set-price-band.banner .set-price-val   { color: var(--gold); }
.print-menu-root .set-price-band.banner .set-price-time  { color: rgba(201,160,40,0.45); }
.print-menu-root .set-price-label {
  font-size: 9px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 700;
}
.print-menu-root .set-price-val {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--maroon);
}
.print-menu-root .set-price-time {
  font-size: 9.5px;
  color: var(--light);
  font-style: italic;
}
.print-menu-root .set-note {
  font-size: 10.5px;
  color: var(--muted);
  font-style: italic;
  margin-bottom: 8px;
}
.print-menu-root .set-choice-label {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--gold-dk);
  margin: 8px 0 5px;
}
.print-menu-root .set-list {
  list-style: none;
  columns: 2;
  column-gap: 18px;
}
.print-menu-root .set-item {
  font-size: 11px;
  color: var(--text);
  padding: 3px 0 3px 11px;
  position: relative;
  line-height: 1.4;
  break-inside: avoid;
  display: flex;
  align-items: center;
  gap: 4px;
}
.print-menu-root .set-item::before {
  content: "\\2013";
  position: absolute;
  left: 0;
  color: var(--gold);
  opacity: 0.7;
}
.print-menu-root .set-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 22px;
}
.print-menu-root .set-block { margin-bottom: 12px; }
.print-menu-root .set-divider { border-top: 1px solid var(--stone); margin: 14px 0; }

@media print {
  .print-bar { display: none !important; }
  .print-menu-root { background: transparent !important; padding: 0 !important; }
  .print-menu-root .page {
    width: 100% !important;
    height: 100vh !important;
    min-height: 0 !important;
    overflow: hidden !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
  .print-menu-root .page + .page {
    break-before: page !important;
    page-break-before: always !important;
  }
}
`

// ── Page component ────────────────────────────────────────────────────────────

export default async function PrintMenuPage() {
  const data: PrintData = await publicClient.fetch(PRINT_MENU_DATA)

  // Build category → items map
  const byCat = new Map<string, PrintItem[]>()
  for (const item of data.items ?? []) {
    for (const catId of item.categoryIds ?? []) {
      if (!byCat.has(catId)) byCat.set(catId, [])
      byCat.get(catId)!.push(item)
    }
  }
  const gc = (id: string) => byCat.get(id) ?? []

  // Starter IDs (for grill section price context logic)
  const starterIds = new Set([
    ...gc('starters-traditional').map(i => i.id),
    ...gc('starters-signature').map(i => i.id),
  ])

  // Set menus by slug
  const sm = (slug: string) => data.setMenus?.find(m => m.slug === slug)

  const pages = [
    coverPage(data.settings),
    tradStartersPage(gc('starters-traditional')),
    sigStartersPage(gc('starters-signature')),
    grillSeafoodPage(gc('tandoori-grill'), gc('seafood-curries'), starterIds),
    curriesPage(gc('chicken-curries'), gc('lamb-curries')),
    vegBiryaniPage(gc('vegetable-dishes'), gc('biryani')),
    breadsRiceAccPage(gc('breads'), gc('rice'), gc('accompaniments')),
    dessertsDrinksPage(gc('desserts'), gc('drinks')),
    lunchPage(sm('lunch-one-course'), sm('lunch-two-course')),
    preTheatrePage(sm('pre-theatre')),
    kidsPage(gc('kids')),
    partyAfternoonTeaPage(sm('party'), sm('afternoon-tea')),
  ].join('')

  return (
    <>
      {/* Print control bar — hidden in print */}
      <div className="print-bar" aria-hidden="true" style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E0808', borderBottom: '1px solid rgba(201,160,40,0.3)', padding: '12px 24px' }}>
        <Link href="/menu" style={{ color: '#C9A028', textDecoration: 'none', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px' }}>
          ← Back to Menu
        </Link>
        <span style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#D4AA50', fontSize: '15px', fontWeight: 700, letterSpacing: '4px' }}>PRINT MENU</span>
        <PrintButton />
      </div>

      {/* CSS scoped to print root */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* All menu pages */}
      <div className="print-menu-root" dangerouslySetInnerHTML={{ __html: pages }} />
    </>
  )
}
