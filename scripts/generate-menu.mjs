#!/usr/bin/env node
// Generates public/menu-final.html from the JSON content files.
// Run: node scripts/generate-menu.mjs  (or: npm run menu)

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
function load(p) { return JSON.parse(readFileSync(join(root, p), 'utf8')); }

// ── Data ──────────────────────────────────────────────────────
const startersAll   = load('src/content/menu/items/starters.json');
const tandooriExtra = load('src/content/menu/items/tandoori-grill.json');
const seafood       = load('src/content/menu/items/seafood-curries.json');
const chickens      = load('src/content/menu/items/chicken-curries.json');
const lambs         = load('src/content/menu/items/lamb-curries.json');
const vegDishes     = load('src/content/menu/items/vegetable-dishes.json');
const biryaniItems  = load('src/content/menu/items/biryani.json');
const breadItems    = load('src/content/menu/items/breads.json');
const riceItems     = load('src/content/menu/items/rice.json');
const accItems      = load('src/content/menu/items/accompaniments.json');
const dessertItems  = load('src/content/menu/items/desserts.json');
const softDrinks    = load('src/content/menu/items/soft-drinks.json');
const mocktailItems = load('src/content/menu/items/mocktails.json');
const hotDrinks     = load('src/content/menu/items/hot-drinks.json');
const lunchData     = load('src/content/menu/items/lunch.json');
const ptData        = load('src/content/menu/items/pre-theatre.json');
const partyData     = load('src/content/menu/items/party.json');
const afTea         = load('src/content/menu/items/afternoon-tea.json');
const kidsMains     = load('src/content/menu/items/kids-mains.json');
const kidsDesserts  = load('src/content/menu/items/kids-desserts.json');
const kidsDrinks    = load('src/content/menu/items/kids-drinks.json');
const identity      = load('src/content/site/identity.json');
const contact       = load('src/content/site/contact.json');
const location      = load('src/content/site/location.json');

// ── HTML helpers ──────────────────────────────────────────────
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
function fmtP(n) { return `£${Number(n).toFixed(2)}`; }

function badges(dietary) {
  const d = dietary || [];
  let b = '';
  if (d.includes('vegan'))        b += `<span class="badge ve" title="Vegan">VE</span>`;
  else if (d.includes('vegetarian')) b += `<span class="badge v"  title="Vegetarian">V</span>`;
  if (d.includes('gluten-free'))  b += `<span class="badge gf" title="Gluten-Free">GF</span>`;
  return b;
}

function spiceDots(level) {
  if (!level || level === 0) return '';
  return `<span class="spice" aria-label="Spice level ${level} of 5">${'&#9679;'.repeat(level)}${'&#9675;'.repeat(5 - level)}</span>`;
}

function bestPrice(item, ...ctxs) {
  const ps = item.prices || [];
  for (const ctx of ctxs) {
    const found = ps.find(p => p.context === ctx);
    if (found) return found.amount;
  }
  return ps.length ? ps[0].amount : null;
}

function renderItem(item, priceCtxs) {
  if (!item.available) return '';
  const b    = badges(item.dietary);
  const s    = spiceDots(item.spiceLevel);
  const star = item.featured ? `<span class="feat-star" title="Chef&#x27;s Recommendation">&#9733;</span>` : '';
  const cls  = item.soldOut ? ' sold-out' : '';
  const desc = item.description ? `\n<p class="desc">${esc(item.description)}</p>` : '';

  let priceHtml;
  if (item.priceOnRequest) {
    priceHtml = `<span class="price-por">Ask server</span>`;
  } else if (priceCtxs === 'multi') {
    const mainAmt = bestPrice(item, 'main');
    const sideAmt = bestPrice(item, 'side');
    priceHtml = `<span class="price price--multi">Main&thinsp;${fmtP(mainAmt)} &thinsp;&middot;&thinsp; Side&thinsp;${fmtP(sideAmt)}</span>`;
  } else {
    const ctxs = Array.isArray(priceCtxs) ? priceCtxs : [priceCtxs];
    const amt = bestPrice(item, ...ctxs);
    priceHtml = amt != null ? `<span class="price">${fmtP(amt)}</span>` : '';
  }

  return `<div class="item${cls}">
  <div class="item-top">
    <div class="item-name-row"><span class="iname">${esc(item.name)}</span>${star}${b}${s}</div>
    <div class="item-price-col">${priceHtml}</div>
  </div>${desc}
</div>`;
}

function splitCols(items) {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

function twoCols(items, priceCtxs) {
  const [left, right] = splitCols(items);
  const ri = i => renderItem(i, priceCtxs);
  return `<div class="cols2"><div class="col">${left.map(ri).join('')}</div><div class="col">${right.map(ri).join('')}</div></div>`;
}

function secHead(title, note) {
  const n = note ? `<span class="sec-note">${note}</span>` : '';
  return `<div class="sec-head"><h2 class="sec-title">${title}</h2>${n}</div>`;
}

// ── Shared chrome ─────────────────────────────────────────────
const LOGO_HDR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 52" width="150" height="26">
  <defs><style>.lt{font-family:"Playfair Display",Georgia,serif;}</style></defs>
  <line x1="8"  y1="13" x2="126" y2="13" stroke="#C9A028" stroke-width="0.7" opacity="0.5"/>
  <polygon points="150,8 155,13 150,18 145,13" fill="#C9A028"/>
  <line x1="174" y1="13" x2="292" y2="13" stroke="#C9A028" stroke-width="0.7" opacity="0.5"/>
  <text class="lt" x="153.5" y="40" font-size="28" font-weight="700" fill="#C9A028" text-anchor="middle" letter-spacing="7">KAHANI</text>
</svg>`;

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
      <span class="spice">&#9679;&#9679;&#9679;&#9679;&#9675;</span>&thinsp;Very Hot &ensp;
      <span class="spice">&#9679;&#9679;&#9679;&#9679;&#9679;</span>&thinsp;Fiery
    </div>
  </div>
  <p class="legend-note">Please inform your server of any dietary requirements or allergies before ordering. Full allergen information is available on request.</p>
</footer>`;

function page(section, body) {
  return `<div class="page">
  <header class="hdr">
    <div class="hdr-logo">${LOGO_HDR}</div>
    <span class="hdr-section">${section}</span>
  </header>
  <div class="body">
${body}
  </div>
  ${LEGEND}
</div>`;
}

function priceBand(label, price, time) {
  const t = time ? `<span class="set-price-time">${time}</span>` : '';
  return `<div class="set-price-band banner">
  <span class="set-price-label">${label}</span>
  <span class="set-price-val">${fmtP(price)}</span>
  ${t}
</div>`;
}

function setList(items) {
  return `<ul class="set-list">${items.map(i => {
    const b = badges(i.dietary || []);
    return `<li class="set-item">${esc(i.name)}${b}</li>`;
  }).join('')}</ul>`;
}

function setListStr(names) {
  return `<ul class="set-list">${names.map(n => `<li class="set-item">${esc(n)}</li>`).join('')}</ul>`;
}

// ── Page generators ───────────────────────────────────────────

function coverPage() {
  const addr = `${esc(location.address.line1)} &nbsp;&middot;&nbsp; ${esc(location.address.city)} ${esc(location.address.postcode)} &nbsp;&middot;&nbsp; ${esc(contact.phone)}`;
  return `<div class="page cover">
  <div class="cover-inner">
    <div class="cover-orn"><span class="orn-line"></span><span class="orn-dia"></span><span class="orn-line"></span></div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 165" width="420" height="124">
      <defs><style>.ct{font-family:"Playfair Display",Georgia,serif;}.cs{font-family:"Montserrat",Arial,sans-serif;}</style></defs>
      <line x1="60"  y1="34" x2="246" y2="34" stroke="#C9A028" stroke-width="0.9" opacity="0.6"/>
      <polygon points="280,25 287,34 280,43 273,34" fill="#C9A028"/>
      <line x1="314" y1="34" x2="500" y2="34" stroke="#C9A028" stroke-width="0.9" opacity="0.6"/>
      <text x="58"  y="38" text-anchor="middle" fill="#C9A028" font-size="9" opacity="0.5" font-family="serif">&#10022;</text>
      <text x="502" y="38" text-anchor="middle" fill="#C9A028" font-size="9" opacity="0.5" font-family="serif">&#10022;</text>
      <text class="ct" x="288" y="108" font-size="72" font-weight="700" fill="#C9A028" text-anchor="middle" letter-spacing="16">KAHANI</text>
      <line x1="80"  y1="126" x2="244" y2="126" stroke="#C9A028" stroke-width="0.9" opacity="0.45"/>
      <polygon points="280,119 286,126 280,133 274,126" fill="#C9A028" opacity="0.85"/>
      <line x1="316" y1="126" x2="480" y2="126" stroke="#C9A028" stroke-width="0.9" opacity="0.45"/>
      <text class="cs" x="280" y="153" font-size="11.5" font-weight="600" fill="#D4AA50" text-anchor="middle" letter-spacing="7">INDIAN STREET FOOD</text>
    </svg>
    <div class="cover-orn mid"><span class="orn-line"></span><span class="orn-dia"></span><span class="orn-line"></span></div>
    <p class="cover-tagline">a story worth tasting</p>
    <p class="cover-sub">Dine In &nbsp;&middot;&nbsp; Takeaway &nbsp;&middot;&nbsp; Events &amp; Catering</p>
  </div>
  <p class="cover-footer">${addr}</p>
</div>`;
}

function tradStartersPage() {
  const items = startersAll
    .filter(i => i.categories.includes('starters-traditional'))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return page(
    'A La Carte &mdash; Traditional Starters',
    secHead('Traditional Starters') + twoCols(items, ['starter', 'standard'])
  );
}

function sigStartersPage() {
  const items = startersAll
    .filter(i => i.categories.includes('starters-signature'))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return page(
    'A La Carte &mdash; Signature Starters',
    secHead('Signature Starters') + twoCols(items, ['starter', 'standard'])
  );
}

function grillSeafoodPage() {
  // Tandoori grill: cross-listed starters (grill-main price) + dedicated grill items (standard price)
  const grillFromStarters = startersAll
    .filter(i => i.categories.includes('tandoori-grill'))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(i => ({ ...i, _priceCtx: ['grill-main', 'standard'] }));
  const grillDedicated = tandooriExtra
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(i => ({ ...i, _priceCtx: ['standard'] }));
  const allGrill = [...grillFromStarters, ...grillDedicated];
  const [gLeft, gRight] = splitCols(allGrill);
  const ri = i => renderItem(i, i._priceCtx);
  const grillCols = `<div class="cols2"><div class="col">${gLeft.map(ri).join('')}</div><div class="col">${gRight.map(ri).join('')}</div></div>`;

  const sfItems = seafood.sort((a, b) => a.sortOrder - b.sortOrder);
  const body =
    secHead('Tandoori Grill', 'All grills served with mint chutney and salad') +
    grillCols +
    secHead('Seafood Curries') +
    twoCols(sfItems, 'standard');
  return page('A La Carte &mdash; Grill &amp; Seafood', body);
}

function curriesPage() {
  const chItems = chickens.sort((a, b) => a.sortOrder - b.sortOrder);
  const lbItems = lambs.sort((a, b) => a.sortOrder - b.sortOrder);
  const body =
    secHead('Chicken Curries', 'Served with steamed rice or plain naan') +
    twoCols(chItems, 'standard') +
    secHead('Lamb Curries', 'Served with steamed rice or plain naan') +
    twoCols(lbItems, 'standard');
  return page('A La Carte &mdash; Curries', body);
}

function vegBiryaniPage() {
  const vItems = vegDishes.sort((a, b) => a.sortOrder - b.sortOrder);
  const bItems = biryaniItems.sort((a, b) => a.sortOrder - b.sortOrder);
  const body =
    secHead('Vegetable Dishes', 'Main £12.50 &middot; Side dish £6.95') +
    twoCols(vItems, 'multi') +
    secHead('Hyderabadi Biryani', 'Served with raita') +
    twoCols(bItems, 'standard');
  return page('A La Carte &mdash; Vegetable &amp; Biryani', body);
}

function breadsRiceAccPage() {
  const brItems = breadItems.sort((a, b) => a.sortOrder - b.sortOrder);
  const riItems = riceItems.sort((a, b) => a.sortOrder - b.sortOrder);
  const acItems = accItems.sort((a, b) => a.sortOrder - b.sortOrder);

  const [bLeft, bRight] = splitCols(brItems);
  const ri = i => renderItem(i, 'standard');
  const breadCols = `<div class="cols2"><div class="col">${bLeft.map(ri).join('')}</div><div class="col">${bRight.map(ri).join('')}</div></div>`;

  const riceCol  = `<div class="col1">${riItems.map(ri).join('')}</div>`;
  const accCol   = `<div class="col1">${acItems.map(ri).join('')}</div>`;

  const body =
    secHead('Breads') +
    breadCols +
    `<div class="cols2-wrap">
  <div class="mini-col">${secHead('Rice')}${riceCol}</div>
  <div class="mini-col">${secHead('Accompaniments')}${accCol}</div>
</div>`;
  return page('A La Carte &mdash; Breads, Rice &amp; Accompaniments', body);
}

function dessertsSoftDrinksPage() {
  const dItems = dessertItems.sort((a, b) => a.sortOrder - b.sortOrder);
  const sdItems = softDrinks.sort((a, b) => a.sortOrder - b.sortOrder);
  const body =
    secHead('Desserts') +
    twoCols(dItems, 'standard') +
    secHead('Soft Drinks') +
    twoCols(sdItems, 'standard');
  return page('A La Carte &mdash; Desserts &amp; Soft Drinks', body);
}

function mocktailsHotDrinksPage() {
  const mItems = mocktailItems.sort((a, b) => a.sortOrder - b.sortOrder);
  const hItems = hotDrinks.sort((a, b) => a.sortOrder - b.sortOrder);
  const body =
    secHead('Mocktails') +
    twoCols(mItems, 'standard') +
    secHead('Hot Drinks') +
    twoCols(hItems, 'standard');
  return page('A La Carte &mdash; Mocktails &amp; Hot Drinks', body);
}

function lunchPage() {
  const oc = lunchData.oneCourse;
  const tc = lunchData.twoCourse;

  const oneCourseItems = oc.items;
  const tcStarters = tc.starters;
  const tcMains = tc.mains;
  const tcSundries = tc.sundries.options;

  const body = `
<div class="set-pg">
  <div class="set-hd"><h2 class="set-title">Lunch Menu</h2><p class="set-sub">Available Monday to Sunday</p></div>

  <div class="set-block">
    ${priceBand('One Course', oc.prices[0].amount, oc.availability)}
    <p class="set-choice-label">Choose one main course</p>
    ${setList(oneCourseItems)}
  </div>

  <div class="set-divider"></div>

  <div class="set-block">
    ${priceBand('Two Courses', tc.prices[0].amount, tc.availability)}
    <p class="set-note">Includes poppadoms &amp; chutney on arrival</p>

    <div class="set-cols">
      <div class="set-col">
        <p class="set-choice-label">Starter &mdash; choose one</p>
        ${setList(tcStarters)}
      </div>
      <div class="set-col">
        <p class="set-choice-label">Main Course &mdash; choose one</p>
        ${setList(tcMains)}
        <p class="set-choice-label">Sundry &mdash; choose one</p>
        ${setListStr(tcSundries)}
      </div>
    </div>
  </div>
</div>`;
  return page('Lunch Menu', body);
}

function preTheatrePage() {
  const starters = ptData.starters.items;
  const mains    = ptData.mains.items;
  const sundries = ptData.sundries.options;
  const price    = ptData.prices[0].amount;

  const body = `
<div class="set-pg">
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
</div>`;
  return page('Pre-Theatre Menu', body);
}

function kidsPage() {
  const mains    = kidsMains.sort((a, b) => a.sortOrder - b.sortOrder);
  const desserts = kidsDesserts.sort((a, b) => a.sortOrder - b.sortOrder);
  const drinks   = kidsDrinks.sort((a, b) => a.sortOrder - b.sortOrder);
  const mainPrice = mains[0]?.prices[0]?.amount ?? 9.50;

  const body = `
<div class="set-pg">
  <div class="set-hd">
    <h2 class="set-title">Kids Menu</h2>
    <p class="set-sub">For our little guests &mdash; age 12 and under</p>
  </div>

  ${priceBand('Main Course', mainPrice, '')}

  <div class="set-cols">
    <div class="set-col">
      <p class="set-choice-label">Main Courses</p>
      ${setList(mains)}
    </div>
    <div class="set-col">
      <p class="set-choice-label">Desserts</p>
      ${setList(desserts)}
      <p class="set-choice-label">Drinks</p>
      ${setList(drinks)}
    </div>
  </div>
</div>`;
  return page('Kids Menu', body);
}

function partyAfternoonTeaPage() {
  const partyPrice  = partyData.prices[0].amount;
  const atPrice     = afTea.prices[0].amount;
  const partyStarters = partyData.courses.starters; // array of strings
  const partyMains    = partyData.courses.mains;    // array of objects

  const body = `
<div class="set-pg">
  <div class="set-hd">
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

  <div class="set-divider" style="margin-top:18px;"></div>

  <div class="set-hd" style="margin-top:16px;">
    <h2 class="set-title">Afternoon Tea</h2>
    <p class="set-sub">BYOB &nbsp;&middot;&nbsp; Served with bottomless tea or coffee</p>
  </div>

  ${priceBand('For Two', atPrice, '')}

  <div class="set-cols">
    <div class="set-col">
      <p class="set-choice-label">Sandwiches</p>
      ${setListStr(afTea.sandwiches)}
      <p class="set-choice-label">Savouries</p>
      ${setListStr(afTea.savoury)}
    </div>
    <div class="set-col">
      <p class="set-choice-label">Sweets</p>
      ${setListStr(afTea.sweets)}
    </div>
  </div>
</div>`;
  return page('Party Menu &amp; Afternoon Tea', body);
}

// ── CSS ───────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --maroon:  #1E0808;
  --gold:    #C9A028;
  --gold-w:  #D4AA50;
  --gold-dk: #9A7018;
  --cream:   #FFF8EF;
  --cream-bg:#F5EDE0;
  --stone:   #E0D3C0;
  --text:    #1A1209;
  --muted:   #5A4025;
  --light:   #8A7055;
}

html { font-size: 14px; }
body {
  font-family: 'Montserrat', Arial, sans-serif;
  background: #A89880;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
@media screen { body { padding: 32px 16px 64px; } }

.page {
  width: 210mm;
  min-height: 297mm;
  background: var(--cream-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.page + .page {
  page-break-before: always;
  break-before: page;
}
@media screen {
  .page { margin: 0 auto 20px; box-shadow: 0 6px 40px rgba(0,0,0,0.25); }
}
@page { size: A4; margin: 0; }

.cover {
  background: var(--maroon);
  align-items: center;
  justify-content: center;
}
.cover-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cover-orn {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 36px 0;
}
.cover-orn.mid { margin: 28px 0 16px; }
.orn-line { width: 72px; height: 1px; background: var(--gold); opacity: 0.35; }
.orn-dia  { width: 7px; height: 7px; background: var(--gold); transform: rotate(45deg); opacity: 0.65; flex-shrink: 0; }
.cover-tagline {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 15px;
  color: var(--gold-w);
  letter-spacing: 0.5px;
}
.cover-sub {
  font-size: 8.5px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(201,160,40,0.35);
  margin-top: 10px;
}
.cover-footer {
  position: absolute;
  bottom: 28px; left: 0; right: 0;
  text-align: center;
  font-size: 8.5px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(201,160,40,0.2);
}

.hdr {
  background: var(--maroon);
  padding: 10px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: 50px;
}
.hdr-section {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: var(--gold-w);
  opacity: 0.85;
}

.body {
  flex: 1;
  padding: 16px 26px 10px;
  overflow: hidden;
}

.sec-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 12px 0 6px;
  padding-bottom: 5px;
  border-bottom: 1.5px solid var(--gold);
}
.sec-head:first-child { margin-top: 0; }
.sec-title {
  font-family: 'Playfair Display', serif;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--maroon);
  flex-shrink: 0;
}
.sec-note {
  font-size: 9px;
  color: var(--light);
  font-style: italic;
  letter-spacing: 0.3px;
}

.cols2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 22px;
  margin-bottom: 8px;
}
.col { display: flex; flex-direction: column; }

.col1 { margin-bottom: 8px; }

.cols2-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 22px;
  margin-bottom: 8px;
}
.mini-col {}

.item {
  padding: 6px 0;
  border-bottom: 1px solid rgba(220,210,195,0.5);
}
.item:last-child { border-bottom: none; }
.item-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.item-name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.iname {
  font-family: 'Playfair Display', serif;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--maroon);
  line-height: 1.2;
}
.feat-star {
  color: var(--gold);
  font-size: 11px;
  vertical-align: middle;
  flex-shrink: 0;
  line-height: 1;
}
.item-price-col { flex-shrink: 0; text-align: right; padding-left: 6px; }
.price {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--maroon);
  white-space: nowrap;
}
.price--multi {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--gold-dk);
  white-space: nowrap;
}
.price-por {
  font-size: 9.5px;
  color: var(--light);
  font-style: italic;
}
.desc {
  font-size: 10.5px;
  color: var(--muted);
  line-height: 1.5;
  margin-top: 2px;
}
.allergens {
  font-size: 9px;
  color: var(--gold-dk);
  margin-top: 2px;
  font-style: italic;
  letter-spacing: 0.2px;
}
.item.sold-out { opacity: 0.45; }

.badge {
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
.badge.v   { background: #E8F5E9; color: #1B5E20; border: 1px solid #A5D6A7; }
.badge.ve  { background: #E0F7FA; color: #004D40; border: 1px solid #80DEEA; }
.badge.gf  { background: #FFF8E1; color: #E65100; border: 1px solid #FFCC80; }
.badge.out { background: #FDECEA; color: #B71C1C; border: 1px solid #EF9A9A; }
.badge.sea { background: #FFF3E0; color: #BF360C; border: 1px solid #FFAB91; }

.spice {
  font-size: 8.5px;
  color: #B03020;
  letter-spacing: 1px;
  vertical-align: middle;
  flex-shrink: 0;
}

.legend {
  background: var(--maroon);
  padding: 8px 26px 10px;
  flex-shrink: 0;
  border-top: 1px solid rgba(201,160,40,0.15);
}
.legend-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-bottom: 5px;
}
.legend-badges {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  color: var(--gold-w);
  flex-shrink: 0;
}
.legend-badges span:not(.badge) { margin-right: 6px; }
.legend-spice {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 8.5px;
  color: rgba(212,170,80,0.5);
  flex-wrap: wrap;
}
.legend-spice .spice { color: rgba(200,70,50,0.65); font-size: 8px; }
.legend-note {
  font-size: 8px;
  color: rgba(201,160,40,0.28);
  letter-spacing: 0.3px;
  line-height: 1.4;
}

.set-pg { height: 100%; }
.set-hd { margin-bottom: 10px; }
.set-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--maroon);
}
.set-sub {
  font-size: 10px;
  color: var(--light);
  margin-top: 2px;
  font-style: italic;
}
.set-price-band {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 14px;
  background: var(--cream);
  border-left: 3px solid var(--gold);
  border-radius: 0 5px 5px 0;
}
.set-price-band.banner {
  background: var(--maroon);
  border-left: none;
  border-radius: 5px;
}
.set-price-band.banner .set-price-label { color: var(--gold-w); opacity: 0.7; }
.set-price-band.banner .set-price-val   { color: var(--gold); }
.set-price-band.banner .set-price-time  { color: rgba(201,160,40,0.45); }
.set-price-label {
  font-size: 9px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 700;
}
.set-price-val {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--maroon);
}
.set-price-time {
  font-size: 9.5px;
  color: var(--light);
  font-style: italic;
}
.set-note {
  font-size: 10.5px;
  color: var(--muted);
  font-style: italic;
  margin-bottom: 8px;
}
.set-choice-label {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--gold-dk);
  margin: 8px 0 5px;
}
.set-list {
  list-style: none;
  columns: 2;
  column-gap: 18px;
}
.set-item {
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
.set-item::before {
  content: "\\2013";
  position: absolute;
  left: 0;
  color: var(--gold);
  opacity: 0.7;
}
.set-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 22px;
}
.set-col {}
.set-block { margin-bottom: 12px; }
.set-divider { border-top: 1px solid var(--stone); margin: 14px 0; }
`;

// ── Assemble ──────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kahani &mdash; Menu</title>
  <style>${CSS}</style>
</head>
<body>
${coverPage()}${tradStartersPage()}${sigStartersPage()}${grillSeafoodPage()}${curriesPage()}${vegBiryaniPage()}${breadsRiceAccPage()}${dessertsSoftDrinksPage()}${mocktailsHotDrinksPage()}${lunchPage()}${preTheatrePage()}${kidsPage()}${partyAfternoonTeaPage()}
</body>
</html>`;

const out = join(root, 'public', 'menu-final.html');
writeFileSync(out, html, 'utf8');
console.log(`✓ Written ${out}`);
