// Page markup builders (DESIGN.md sec. 8 gym page; shared page parts: breadcrumb, static map thumbnail, page cards).
// Pure (no DOM, no appState): the page controllers pass per-user state in. Every database value goes through
// escapeHtml(); photos through safeUrl() first. Actions are data-page-action + data-spot-id; links are
// <a href data-link> that the router turns into History API navigation. A section with no data renders nothing
// (DNA #3); the only substitute is the single contribution prompt.
import { escapeHtml, safeUrl } from './html-safe.js';
import { directionsUrl } from './utils.js';
import { icon } from './icons.js';
import { thumbHtml, typeTagsHtml } from './list-html.js';
import { pinSvg } from './pin-html.js';

const link = (href, text, cls = 'link link-quiet') => `<a class="${cls}" href="${escapeHtml(href)}" data-link>${escapeHtml(text)}</a>`;

// crumbs: [{href?, label, current?}] -- an item with current: true (or no href) is the page itself and is not a link.
export function breadcrumbHtml(crumbs){
  const items = crumbs.filter(c => c && c.label).map(c => c.href && !c.current
    ? `<li>${link(c.href, c.label)}</li>` : `<li aria-current="page">${escapeHtml(c.label)}</li>`);
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${items.join('')}</ol></nav>`;
}

// A static map: a slot the page fills with a small non-interactive map (mini-map.js; the same warm dark basemap as
// Explore, which is keyless as vector tiles -- CARTO's raster tiles need an API key), the pin, a link to Explore and the
// basemap credit. Coordinates travel as numbers in data-* attributes, never as markup.
// wide: fills its column (region pages) instead of a fixed square; points: the page passes its gyms as dots.
export function mapThumbHtml({ lat, lng, zoom = 14, size = 120, href, label, types = null, wide = false, points = false }){
  if(!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  const pin = types ? `<span class="map-thumb-pin">${pinSvg({ types })}</span>` : '';
  const box = wide ? ' map-thumb--wide' : '';
  const dims = wide ? '' : ` style="width:${Number(size)}px;height:${Number(size)}px"`;
  return `<figure class="map-thumb-figure${box}"><a class="map-thumb${box}" data-theme="rock" href="${escapeHtml(href)}" data-link data-mini-map${points ? ' data-points' : ''}`
    + ` data-lat="${Number(lat)}" data-lng="${Number(lng)}" data-zoom="${Number(zoom)}"${dims} aria-label="${escapeHtml(label)}">${pin}</a>`
    + `<figcaption class="map-thumb-credit">© OpenStreetMap · CARTO</figcaption></figure>`;
}

// Page card: the Explore photo card as a link (Nearby strip, region and city grids).
export function pageCardHtml(g, ctx = {}){
  const meta = [[g.suburb, ctx.region].filter(Boolean).join(', '), ctx.distance].filter(Boolean).join(' · ');
  return `<a class="gym-card page-card" href="${escapeHtml(ctx.href)}" data-link>${thumbHtml(g, 'card')}`
    + `<span class="gym-card-body"><span class="gym-card-name">${escapeHtml(g.name)}</span>`
    + `<span class="gym-card-meta tnum">${escapeHtml(meta)}</span><span class="gym-card-tags">${typeTagsHtml(g.types)}</span></span></a>`;
}

// Page row: the dense row as a link (long lists on region/city pages, Me > Saved/Climbed).
export function pageRowHtml(g, ctx = {}){
  const place = [g.suburb, ctx.region].filter(Boolean).join(' · ');
  return `<a class="page-row" href="${escapeHtml(ctx.href)}" data-link>${thumbHtml(g, 'row')}`
    + `<span class="gym-row-text"><span class="gym-row-title">${escapeHtml(g.name)}</span><span class="gym-row-meta">${escapeHtml(place)}</span></span>`
    + `${ctx.distance ? `<span class="gym-row-distance tnum">${escapeHtml(ctx.distance)}</span>` : ''}</a>`;
}

// The gym page (sec. 8.2). ctx: {crumbs, region, country, distance, saved, climbed, history, nearby: [{g, ctx}], exploreHref}
export function gymPageHtml(g, ctx = {}){
  const photo = safeUrl(g.photo);
  const id = escapeHtml(g.id);
  const where = [g.suburb, ctx.region].filter(Boolean).join(', ');
  const provenance = g.community ? `<p class="provenance-line"><span class="provenance-mark provenance-mark--community"></span> Community-added${g.edited ? ' · edited' : ''}</p>`
    : g.edited ? '<p class="provenance-line">Edited by the community</p>' : '';
  const actions = `<div class="gym-actions" role="group" aria-label="Gym actions">`
    + `<button type="button" class="btn btn-secondary" data-page-action="save" data-spot-id="${id}" aria-pressed="${ctx.saved ? 'true' : 'false'}">${icon('bookmark-simple', {size:'sm'})}Save</button>`
    + `<button type="button" class="btn btn-secondary" data-page-action="climbed" data-spot-id="${id}" aria-pressed="${ctx.climbed ? 'true' : 'false'}">${icon('check', {size:'sm'})}Climbed</button>`
    + `<a class="btn btn-secondary" href="${escapeHtml(directionsUrl(g))}" target="_blank" rel="noopener noreferrer">${icon('navigation-arrow', {size:'sm'})}Directions</a></div>`;
  // The one contribution prompt: this page has no photo, and hours/price fields do not exist yet (sec. 8.2).
  const prompt = photo ? '' : `<p class="contribute-prompt">Been here? <button type="button" class="link" data-page-action="edit" data-spot-id="${id}">Add the hours, a photo or the day-pass price.</button></p>`;
  const history = ctx.history && ctx.history.count ? `<section class="panel history-panel" aria-labelledby="historyTitle"><h2 class="panel-title" id="historyTitle">Your history here</h2>`
    + `<p class="panel-row tnum">${escapeHtml(ctx.history.count === 1 ? '1 session' : ctx.history.count + ' sessions')}${ctx.history.last ? ` · last on ${escapeHtml(ctx.history.last)}` : ''}</p></section>` : '';
  const nearby = (ctx.nearby || []).length >= 1 ? `<section class="page-section" aria-labelledby="nearbyTitle"><h2 class="section-title" id="nearbyTitle">Nearby</h2>`
    + `<div class="card-strip">${ctx.nearby.map(n => pageCardHtml(n.g, n.ctx)).join('')}</div></section>` : '';
  return `<article class="page gym-page">`
    + breadcrumbHtml(ctx.crumbs || [])
    + `<header class="gym-header"><div class="gym-heading"><h1 class="page-title">${escapeHtml(g.name)}</h1>`
    + `<p class="gym-meta"><span class="gym-meta-tags">${typeTagsHtml(g.types)}</span><span>${escapeHtml(where)}</span>${ctx.distance ? `<span class="tnum">${escapeHtml(ctx.distance)}</span>` : ''}</p>`
    + provenance + prompt + `</div></header>`
    + `${photo ? `<img class="gym-hero gym-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(g.name)}" referrerpolicy="no-referrer">` : ''}`
    + `<div class="gym-layout"><div class="gym-main">`
    + `${g.notes ? `<section class="page-section" aria-labelledby="aboutTitle"><h2 class="section-title" id="aboutTitle">About</h2><p class="prose">${escapeHtml(g.notes)}</p></section>` : ''}`
    + nearby
    + `<section class="page-section" aria-labelledby="communityTitle"><h2 class="section-title" id="communityTitle">Community</h2>`
    + `<p class="section-note">${g.community ? 'Added by a Bouldeer climber and checked by a moderator.' : 'From the Bouldeer dataset, kept current by climbers.'} Spotted something out of date?</p>`
    + `<div class="community-actions"><button type="button" class="btn btn-secondary btn-sm" data-page-action="edit" data-spot-id="${id}">${icon('pencil-simple', {size:'sm'})}Suggest an edit</button>`
    + `<button type="button" class="btn btn-tertiary btn-sm" data-page-action="report" data-spot-id="${id}">${icon('flag', {size:'sm'})}Report a problem</button></div></section>`
    + `</div><aside class="gym-aside"><section class="panel essentials" aria-labelledby="essentialsTitle"><h2 class="panel-title" id="essentialsTitle">Essentials</h2>`
    + `<div class="essentials-address"><p class="panel-row">${escapeHtml(g.address || where)}</p>`
    + mapThumbHtml({ lat: g.lat, lng: g.lng, zoom: 14, size: 120, href: ctx.exploreHref || '/', label: 'Show ' + (g.name || 'this gym') + ' on the map', types: g.types })
    + `</div></section>${history}</aside></div>${actions}</article>`;   // actions last: beside the title on desktop, sticky at the bottom on phones
}

// ===== Regions (sec. 6.1: countries -> regions -> cities, each a page) =================================================
const countLabel = n => n === 1 ? '1 gym' : Number(n).toLocaleString('en-US') + ' gyms';

// Tiles: a place name with its gym count (countries on /in, regions on a country page, cities on a region page).
export function tileGridHtml(items){
  return `<ul class="place-tiles">${items.map(t => `<li><a class="place-tile" href="${escapeHtml(t.href)}" data-link>`
    + `<span class="place-tile-name">${escapeHtml(t.label)}</span><span class="place-tile-count tnum">${escapeHtml(countLabel(t.count))}</span></a></li>`).join('')}</ul>`;
}

// Gyms of a place: photo cards for a first look, dense rows once there are more than 20 (DNA #2).
export const CARD_LIMIT = 20;
export function gymCollectionHtml(items){
  if(!items.length) return '';
  return items.length > CARD_LIMIT
    ? `<div class="page-list">${items.map(i => pageRowHtml(i.g, i.ctx)).join('')}</div>`
    : `<div class="card-grid">${items.map(i => pageCardHtml(i.g, i.ctx)).join('')}</div>`;
}

// /in: every country with gyms, grouped by continent. groups: [{title, items: tiles}]
export function regionsIndexHtml(groups, total){
  return `<article class="page place-page"><header class="place-header"><h1 class="page-title">Regions</h1>`
    + `<p class="place-meta tnum">${escapeHtml(countLabel(total))} in ${escapeHtml(groups.reduce((n, g) => n + g.items.length, 0))} countries</p></header>`
    + groups.map((g, i) => `<section class="page-section" aria-labelledby="continent-${Number(i)}"><h2 class="section-title" id="continent-${Number(i)}">${escapeHtml(g.title)}</h2>${tileGridHtml(g.items)}</section>`).join('')
    + `</article>`;
}

// Country / region / city page. p: {crumbs, title, meta, tilesTitle, tiles, gymsTitle, gyms: [{g, ctx}], map: mapThumbHtml args}
export function placePageHtml(p){
  const tiles = p.tiles && p.tiles.length ? `<section class="page-section" aria-labelledby="tilesTitle"><h2 class="section-title" id="tilesTitle">${escapeHtml(p.tilesTitle)}</h2>${tileGridHtml(p.tiles)}</section>` : '';
  const gyms = p.gyms && p.gyms.length ? `<section class="page-section" aria-labelledby="gymsTitle"><h2 class="section-title" id="gymsTitle">${escapeHtml(p.gymsTitle || 'Gyms')}</h2>${gymCollectionHtml(p.gyms)}</section>` : '';
  return `<article class="page place-page">${breadcrumbHtml(p.crumbs || [])}`
    + `<header class="place-header"><h1 class="page-title">${escapeHtml(p.title)}</h1><p class="place-meta tnum">${escapeHtml(p.meta)}</p></header>`
    + `<div class="place-layout"><div class="place-main">${tiles}${gyms}</div>`
    + `<aside class="place-aside">${p.map ? mapThumbHtml({ ...p.map, wide: true, points: true }) : ''}`
    + `${p.map ? `<p class="place-map-link"><a class="btn btn-secondary btn-sm" href="${escapeHtml(p.map.href)}" data-link>${icon('map-trifold', {size:'sm'})}Browse on the map</a></p>` : ''}</aside></div></article>`;
}

// ===== Log (/log) and Me (/me) =========================================================================================
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const pad = n => String(n).padStart(2, '0');

// Month calendar (weeks start on Monday); days with sessions are marked. counts: Map('YYYY-MM-DD' -> sessions).
export function calendarHtml(year, month, counts = new Map(), today = ''){
  const y = Number(year), m = Number(month);
  const first = new Date(Date.UTC(y, m, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells = Array.from({ length: lead }, () => '<td></td>');
  // Plain concatenation: every part is a number, a fixed class or day name, or the escaped label.
  for(let d = 1; d <= days; d++){
    const key = y + '-' + pad(m + 1) + '-' + pad(d);
    const n = Number(counts.get(key)) || 0;
    const cls = ['cal-day', n ? 'has-session' : '', key === today ? 'is-today' : ''].filter(Boolean).join(' ');
    const label = d + ' ' + MONTHS[m] + (n ? ', ' + (n === 1 ? '1 session' : n + ' sessions') : '');
    cells.push('<td><span class="' + cls + '" aria-label="' + escapeHtml(label) + '">' + d + '</span></td>');
  }
  while(cells.length % 7) cells.push('<td></td>');
  const rows = [];
  for(let i = 0; i < cells.length; i += 7) rows.push('<tr>' + cells.slice(i, i + 7).join('') + '</tr>');
  const head = DAYS.map(n => '<th scope="col" abbr="' + n + '">' + n.charAt(0) + '</th>').join('');
  return `<section class="panel calendar" aria-labelledby="calTitle"><div class="calendar-head"><h2 class="panel-title" id="calTitle">${escapeHtml(MONTHS[m] + ' ' + y)}</h2>`
    + `<div class="calendar-nav"><button type="button" class="btn btn-tertiary btn-icon btn-sm" data-page-action="cal-prev" aria-label="Previous month">${icon('arrow-left', {size:'sm'})}</button>`
    + `<button type="button" class="btn btn-tertiary btn-icon btn-sm" data-page-action="cal-next" aria-label="Next month">${icon('caret-right', {size:'sm'})}</button></div></div>`
    + `<table class="calendar-grid"><thead><tr>${head}</tr></thead><tbody>${rows.join('')}</tbody></table></section>`;
}

// /log. p: {signedIn, count, calendar (calendarHtml), sessions (logbook.js sessionsHtml)}
export function logPageHtml(p){
  if(!p.signedIn) return `<article class="page log-page"><header class="place-header"><h1 class="page-title">Log</h1>`
    + `<p class="place-meta">Keep a diary of your sessions: where you climbed, what you sent and how it felt.</p></header>`
    + `<p class="page-cta"><button type="button" class="btn btn-primary" data-page-action="sign-in">Sign in to start your log</button></p></article>`;
  return `<article class="page log-page"><header class="page-header-row"><div><h1 class="page-title">Log</h1>`
    + `<p class="place-meta tnum">${escapeHtml(p.count === 1 ? '1 session' : Number(p.count).toLocaleString('en-US') + ' sessions')}</p></div>`
    + `<button type="button" class="btn btn-primary" data-page-action="log-session">${icon('plus', {size:'sm'})}Log a session</button></header>`
    + `<div class="log-layout"><section class="log-sessions" aria-label="Sessions"><div class="session-list">${p.sessions}</div></section>${p.calendar}</div></article>`;
}

// /me and /me/saved, /me/climbed. p: {signedIn, section, saved: [{g, ctx}], climbed: [...], isModerator, pendingCount}
export function mePageHtml(p){
  const links = `<section class="page-section" aria-labelledby="aboutMeTitle"><h2 class="section-title" id="aboutMeTitle">Bouldeer</h2><p class="me-links">`
    + `<a class="link link-quiet" href="about.html">About</a><button type="button" class="link link-quiet" data-page-action="privacy">Privacy</button>`
    + `<button type="button" class="link link-quiet" data-page-action="terms">Terms</button></p></section>`;
  if(!p.signedIn) return `<article class="page me-page"><header class="place-header"><h1 class="page-title">Me</h1>`
    + `<p class="place-meta">Save gyms, mark the ones you have climbed and keep a log of your sessions.</p></header>`
    + `<p class="page-cta"><button type="button" class="btn btn-primary" data-page-action="sign-in">Sign in</button></p>${links}</article>`;
  const section = p.section === 'climbed' ? 'climbed' : 'saved';
  const items = section === 'climbed' ? p.climbed : p.saved;
  const tab = (key, label, n) => `<a class="tab" href="/me/${key}" data-link${key === section ? ' aria-current="page"' : ''}>${escapeHtml(label)} <span class="tnum">${Number(n)}</span></a>`;
  const empty = section === 'climbed' ? 'Mark a gym as climbed from its page or the map, and it will show up here.' : 'Save a gym from its page or the map, and it will show up here.';
  const pending = p.isModerator ? `<button type="button" class="btn btn-secondary" data-page-action="pending">Pending review${p.pendingCount ? ` <span class="tnum">(${Number(p.pendingCount)})</span>` : ''}</button>` : '';
  return `<article class="page me-page"><header class="place-header"><h1 class="page-title">Me</h1></header>`
    + `<nav class="tabs me-tabs" aria-label="Your gyms">${tab('saved', 'Saved', p.saved.length)}${tab('climbed', 'Climbed', p.climbed.length)}</nav>`
    + (items.length ? `<div class="page-list">${items.map(i => pageRowHtml(i.g, i.ctx)).join('')}</div>` : `<div class="empty-state me-empty"><p>${escapeHtml(empty)}</p></div>`)
    + `<section class="page-section" aria-labelledby="accountTitle"><h2 class="section-title" id="accountTitle">Account</h2><div class="me-actions">`
    + `<button type="button" class="btn btn-secondary" data-page-action="add-gym">${icon('plus', {size:'sm'})}Add a gym</button>${pending}`
    + `<button type="button" class="btn btn-tertiary" data-page-action="sign-out">Sign out</button></div></section>${links}</article>`;
}

export function notFoundHtml(what = 'page'){
  const w = what === 'gym' ? 'gym' : what === 'place' ? 'place' : 'page';
  return `<article class="page page-empty"><h1 class="page-title">We couldn’t find that ${w}</h1>`
    + `<p class="section-note">It may have moved or been removed.</p><p><a class="btn btn-secondary" href="/" data-link>Back to the map</a></p></article>`;
}

export function pageSkeletonHtml(){
  return '<article class="page" aria-busy="true"><div class="skeleton-title" aria-hidden="true"></div>'
    + Array.from({length: 4}, () => '<div class="skeleton-row" aria-hidden="true"><span></span><span></span></div>').join('') + '</article>';
}
