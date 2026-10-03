// Page markup builders (DESIGN.md sec. 8 gym page; shared page parts: breadcrumb, static map thumbnail, page cards).
// Pure (no DOM, no appState): the page controllers pass per-user state in. Every database value goes through
// escapeHtml(); photos through safeUrl() first. Actions are data-page-action + data-spot-id; links are
// <a href data-link> that the router turns into History API navigation. A section with no data renders nothing
// (DNA #3); the only substitute is the single contribution prompt.
import { firstRunArt, sealSvg } from './brand.js';
import { essentialsRowsHtml, facilitiesHtml, hasPracticalInfo } from './gym-info.js';
import { escapeHtml, safeUrl } from './html-safe.js';
import { directionsUrl } from './utils.js';
import { icon } from './icons.js';
import { provenanceMarkHtml, thumbHtml, typeTagsHtml } from './list-html.js';
import { pinSvg } from './pin-html.js';
import { publicNotes } from './provenance.js';

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
  // The public description; legacy gyms fall back to the few genuine lines in their research notes (provenance.js).
  const about = (typeof g.description === 'string' && g.description.trim()) || publicNotes(g.notes);
  const id = escapeHtml(g.id);
  const where = [g.suburb, ctx.region].filter(Boolean).join(', ');
  // One quiet line (sec. 10.2) + the editor-only note about their own latest proposal (sec. 10.4).
  const prov = ctx.provenance || { state: 'community-added', text: 'Community-added' };
  const provenance = `<p class="provenance-line">${provenanceMarkHtml(prov.state)}${escapeHtml(prov.text)}</p>`
    + (ctx.myEdit && ctx.myEdit.status === 'pending' ? '<p class="provenance-line provenance-pending">Your edit is awaiting review.</p>' : '')
    + (ctx.myEdit && ctx.myEdit.status === 'rejected' ? `<p class="provenance-line provenance-rejected">Your last edit wasn’t accepted${ctx.myEdit.rejection_reason ? `: ${escapeHtml(ctx.myEdit.rejection_reason)}` : '.'}</p>` : '');
  // Check in is the primary action (sec. 8.2, 11.1); after a check-in it reads "Checked in today" until 12 hours pass.
  const checkin = ctx.checkedIn
    ? `<button type="button" class="btn btn-secondary" disabled>${icon('check-circle', {size:'sm'})}<span class="label-long">Checked in today</span><span class="label-short">Checked in</span></button>`
    : `<button type="button" class="btn btn-primary" data-page-action="checkin" data-spot-id="${id}">${icon('map-pin', {size:'sm'})}Check in</button>`;
  const actions = `<div class="gym-actions" role="group" aria-label="Gym actions">${checkin}`
    + `<button type="button" class="btn btn-secondary" data-page-action="save" data-spot-id="${id}" aria-pressed="${ctx.saved ? 'true' : 'false'}">${icon('bookmark-simple', {size:'sm'})}Save</button>`
    + `<button type="button" class="btn btn-secondary" data-page-action="climbed" data-spot-id="${id}" aria-pressed="${ctx.climbed ? 'true' : 'false'}">${icon('check', {size:'sm'})}Climbed</button>`
    + `<a class="btn btn-secondary" href="${escapeHtml(directionsUrl(g))}" target="_blank" rel="noopener noreferrer">${icon('navigation-arrow', {size:'sm'})}Directions</a></div>`;
  // The one contribution prompt (sec. 8.2): only while the page has no photo and none of hours, website or day pass.
  // It opens the edit dialog at the hours field, so every field it names can be filled in there.
  const prompt = photo || hasPracticalInfo(g) ? '' : `<p class="contribute-prompt">Been here? <button type="button" class="link" data-page-action="edit" data-edit-focus="hours" data-spot-id="${id}">Add the hours, website, day-pass price or a photo.</button></p>`;
  const history = ctx.history && ctx.history.count ? `<section class="panel history-panel" aria-labelledby="historyTitle"><h2 class="panel-title" id="historyTitle">Your history here</h2>`
    + `<p class="panel-row tnum">${escapeHtml(ctx.history.count === 1 ? '1 session' : ctx.history.count + ' sessions')}${ctx.history.last ? ` · last on ${escapeHtml(ctx.history.last)}` : ''}</p></section>` : '';
  const nearby = (ctx.nearby || []).length >= 1 ? `<section class="page-section" aria-labelledby="nearbyTitle"><h2 class="section-title" id="nearbyTitle">Nearby</h2>`
    // Photo cards only when a nearby gym has a photo; four identical placeholders read as "nothing here" (audit).
    + (ctx.nearby.some(n => safeUrl(n.g.photo))
      ? `<div class="card-strip">${ctx.nearby.map(n => pageCardHtml(n.g, n.ctx)).join('')}</div>`
      : `<div class="page-list nearby-list">${ctx.nearby.map(n => pageRowHtml(n.g, n.ctx)).join('')}</div>`)
    + `</section>` : '';
  return `<article class="page gym-page">`
    + breadcrumbHtml(ctx.crumbs || [])
    + `<header class="gym-header"><div class="gym-heading"><h1 class="page-title">${escapeHtml(g.name)}</h1>`
    + `<p class="gym-meta"><span class="gym-meta-tags">${typeTagsHtml(g.types)}</span><span>${escapeHtml(where)}</span>${ctx.distance ? `<span class="tnum">${escapeHtml(ctx.distance)}</span>` : ''}</p>`
    + provenance + prompt + `</div></header>`
    + `${photo ? `<img class="gym-hero gym-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(g.name)}" referrerpolicy="no-referrer">` : ''}`
    + `<div class="gym-layout"><div class="gym-main">`
    + `${about ? `<section class="page-section" aria-labelledby="aboutTitle"><h2 class="section-title" id="aboutTitle">About</h2><p class="prose">${escapeHtml(about)}</p></section>` : ''}`
    + facilitiesHtml(g)
    + nearby
    + `<section class="page-section" aria-labelledby="communityTitle"><h2 class="section-title" id="communityTitle">Community</h2>`
    + `<p class="section-note">${g.community ? 'Added by a Bouldeer climber and checked by a moderator.' : 'From the Bouldeer dataset, kept current by climbers.'} Every edit is checked by a moderator before it goes live. Spotted something out of date?</p>`
    + `<div class="community-actions"><button type="button" class="btn btn-secondary btn-sm" data-page-action="edit" data-spot-id="${id}">${icon('pencil-simple', {size:'sm'})}Suggest an edit</button>`
    + `<button type="button" class="btn btn-tertiary btn-sm" data-page-action="report" data-spot-id="${id}">${icon('flag', {size:'sm'})}Report a problem</button>`
    // Moderators only: "Verified" = confirmed by a moderator (sec. 10.1). RLS enforces it; this only shows the control.
    + `${ctx.isModerator ? `<button type="button" class="btn btn-tertiary btn-sm" data-page-action="${g.verified_at ? 'unverify' : 'verify'}" data-spot-id="${id}">${icon('check-circle', {size:'sm'})}${g.verified_at ? 'Remove verification' : 'Mark verified'}</button>` : ''}</div></section>`
    + `</div><aside class="gym-aside"><section class="panel essentials" aria-labelledby="essentialsTitle"><h2 class="panel-title" id="essentialsTitle">Essentials</h2>`
    + essentialsRowsHtml(g)
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

// Page header art (sec. 13A): decorative flat-vector scenes (assets/art/, from design/tools/page_art.py), no character.
// Only these names exist; the page title below carries the meaning, so the image is hidden from assistive tech.
const PAGE_ART = new Set(['regions-wall', 'log-still-life', 'me-shelf']);
export function pageArtHtml(name){
  return PAGE_ART.has(name) ? `<div class="page-art" aria-hidden="true"><img src="assets/art/${name}.svg" alt="" width="1260" height="540" decoding="async"></div>` : '';
}

// /in: a search field over countries, regions, cities and gyms, then every country with gyms grouped by continent. The
// continents start collapsed (real-phone test 2026-09-28: the fully expanded list was far too long on a phone); each
// summary says how many countries and gyms it holds. groups: [{title, items: tiles}]
export function regionsIndexHtml(groups, total){
  const countries = groups.reduce((n, g) => n + g.items.length, 0);
  return `<article class="page place-page regions-page">${pageArtHtml('regions-wall')}<header class="place-header"><h1 class="page-title">Regions</h1>`
    + `<p class="place-meta tnum">${escapeHtml(countLabel(total))} in ${escapeHtml(countries)} countries</p></header>`
    + `<form class="regions-search" role="search" data-page-form="region-search"><label class="visually-hidden" for="regionSearch">Search countries, regions, cities and gyms</label>`
    + `${icon('magnifying-glass', {size:'sm'})}<input class="input" type="search" id="regionSearch" autocomplete="off" enterkeyhint="search" placeholder="Search a country, region, city or gym"></form>`
    + `<div class="regions-results" id="regionResults" aria-live="polite"></div>`
    + `<div class="regions-browse" id="regionBrowse">`
    + groups.map(g => `<details class="page-section region-continent"><summary class="region-continent-summary">${icon('caret-right', {size:'sm'})}`
      + `<h2 class="section-title">${escapeHtml(g.title)}</h2><span class="region-continent-count tnum">${escapeHtml(g.items.length === 1 ? '1 country' : g.items.length + ' countries')} · ${escapeHtml(countLabel(g.items.reduce((n, t) => n + t.count, 0)))}</span></summary>`
      + `${tileGridHtml(g.items)}</details>`).join('')
    + `</div></article>`;
}

// /in search results. items: [{kind: country|region|city|gym, label, secondary, href, count}] (region-page.js ranks them).
const PLACE_KIND = { country: 'Country', region: 'Region', city: 'City', gym: 'Gym' };
export function regionSearchResultsHtml(query, items){
  if(!String(query || '').trim()) return '';
  if(!items.length) return `<p class="empty-state regions-empty">No places or gyms match “${escapeHtml(String(query).trim())}”. Check the spelling, or browse by continent below.</p>`;
  return `<ul class="page-list regions-hits">` + items.map(i => `<li><a class="page-row regions-hit" href="${escapeHtml(i.href)}" data-link>`
    + `<span class="gym-row-text"><span class="gym-row-title">${escapeHtml(i.label)}</span><span class="gym-row-meta">${escapeHtml([PLACE_KIND[i.kind] || '', i.secondary].filter(Boolean).join(' · '))}</span></span>`
    + (i.kind === 'gym' ? '' : `<span class="gym-row-distance tnum">${escapeHtml(countLabel(i.count))}</span>`) + `</a></li>`).join('') + `</ul>`;
}

// A region page's meta line: each kind counted as what it is. Metros are cities; the suburbs of gyms outside every metro are
// "areas" ("other areas" once there are cities), never cities: "28 gyms · 1 city · 6 other areas".
export function regionMeta({ gyms, cities = 0, areas = 0 }){
  const n = (c, one, many) => c === 1 ? '1 ' + one : Number(c).toLocaleString('en-US') + ' ' + many;
  return [n(gyms, 'gym', 'gyms'), cities ? n(cities, 'city', 'cities') : '',
    areas ? (cities ? n(areas, 'other area', 'other areas') : n(areas, 'area', 'areas')) : ''].filter(Boolean).join(' · ');
}

// Country / region / city page. p: {crumbs, title, meta, tilesTitle, tiles | tileSections: [{title, tiles}], gymsTitle,
// gyms: [{g, ctx}], map: mapThumbHtml args}. A region page has two tile sections: its metros ("Cities"), then "Other areas".
export function placePageHtml(p){
  const sections = p.tileSections || [{ title: p.tilesTitle, tiles: p.tiles }];
  const tiles = sections.filter(s => s.tiles && s.tiles.length).map((s, i) => {
    const id = escapeHtml('tilesTitle' + (i || ''));
    return `<section class="page-section" aria-labelledby="${id}"><h2 class="section-title" id="${id}">${escapeHtml(s.title)}</h2>${tileGridHtml(s.tiles)}</section>`;
  }).join('');
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
  if(!p.signedIn) return `<article class="page log-page">${pageArtHtml('log-still-life')}<header class="place-header"><h1 class="page-title">Log</h1>`
    + `<p class="place-meta">Keep a diary of your sessions: where you climbed, what you sent and how it felt.</p></header>`
    + `<p class="page-cta"><button type="button" class="btn btn-primary" data-page-action="sign-in">Sign in to start your log</button></p></article>`;
  return `<article class="page log-page"><header class="page-header-row"><div><h1 class="page-title">Log</h1>`
    + `<p class="place-meta tnum">${escapeHtml(p.count === 1 ? '1 session' : Number(p.count).toLocaleString('en-US') + ' sessions')}</p></div>`
    + `<button type="button" class="btn btn-primary" data-page-action="log-session">${icon('plus', {size:'sm'})}Log a session</button></header>`
    + `<div class="log-layout"><section class="log-sessions" aria-label="Sessions"><div class="session-list">${p.sessions}</div></section>${p.calendar}</div></article>`;
}

// /me and /me/saved, /me/climbed. p: {signedIn, section, saved: [{g, ctx}], climbed: [...], isModerator, pendingCount}
export function mePageHtml(p){
  // One character appearance per screen (sec. 12.2): the seal steps aside while the first-run backpacker is shown.
  const firstRun = !!p.signedIn && p.section !== 'climbed' && !(p.saved || []).length && !(p.climbed || []).length;
  const links = `<section class="page-section me-brand" aria-labelledby="aboutMeTitle">${firstRun ? '' : sealSvg()}<div><h2 class="section-title" id="aboutMeTitle">Bouldeer</h2><p class="me-links">`
    + `<a class="link link-quiet" href="/about.html">About</a><a class="link link-quiet" href="/privacy">Privacy</a>`
    + `<a class="link link-quiet" href="/terms">Terms</a></p></div></section>`;
  if(!p.signedIn) return `<article class="page me-page">${pageArtHtml('me-shelf')}<header class="place-header"><h1 class="page-title">Me</h1>`
    + `<p class="place-meta">Save gyms, mark the ones you have climbed and keep a log of your sessions.</p></header>`
    + `<p class="page-cta"><button type="button" class="btn btn-primary" data-page-action="sign-in">Sign in</button></p>${links}</article>`;
  const section = p.section === 'climbed' ? 'climbed' : 'saved';
  const items = section === 'climbed' ? p.climbed : p.saved;
  const tab = (key, label, n) => `<a class="tab" href="/me/${key}" data-link${key === section ? ' aria-current="page"' : ''}>${escapeHtml(label)} <span class="tnum">${Number(n)}</span></a>`;
  const empty = section === 'climbed' ? 'Mark a gym as climbed from its page or the map, and it will show up here.' : 'Save a gym from its page or the map, and it will show up here.';
  // The backpacker only on a true first run: nothing saved and nothing climbed yet (sec. 12.2; never on repeat empties).
  const art = firstRun ? firstRunArt('saved') : '';
  const pending = p.isModerator ? `<a class="btn btn-secondary" href="/mod" data-link>Pending review${p.pendingCount ? ` <span class="tnum">(${Number(p.pendingCount)})</span>` : ''}</a>` : '';
  const contributions = meContributionsHtml(p.community);
  return `<article class="page me-page"><header class="place-header"><h1 class="page-title">Me</h1></header>`
    + `<nav class="tabs me-tabs" aria-label="Your gyms">${tab('saved', 'Saved', p.saved.length)}${tab('climbed', 'Climbed', p.climbed.length)}<a class="tab" href="/me/passport" data-link>Passport</a></nav>`
    + (items.length ? `<div class="page-list">${items.map(i => pageRowHtml(i.g, i.ctx)).join('')}</div>` : `<div class="empty-state me-empty">${art}<p>${escapeHtml(empty)}</p></div>`)
    + contributions
    + `<section class="page-section" aria-labelledby="accountTitle"><h2 class="section-title" id="accountTitle">Account</h2><div class="me-actions">`
    + `<button type="button" class="btn btn-secondary" data-page-action="add-gym">${icon('plus', {size:'sm'})}Add a gym</button>${pending}`
    + `<button type="button" class="btn btn-tertiary" data-page-action="sign-out">Sign out</button></div></section>${links}</article>`;
}

// /me "Your contributions" (sec. 10.2, 10.5, 10.6): display name, points and level, own submissions in review or not
// accepted (with the moderator's reason). c: {displayName, points|null, level, contributor, submissions: [{kind, name, status, reason}]}
export function meContributionsHtml(c){
  if(!c) return '';
  const points = c.points === null ? '' : `<p class="me-points tnum"><strong>${Number(c.points)}</strong> points · level ${Number(c.level)}${c.contributor ? ' · Contributor' : ''}</p>`;
  // Before the profiles table exists (migration 20260926084510 not applied) the name cannot be saved: say so, disabled.
  const unavailable = c.profilesAvailable === false;
  const form = `<form class="me-name" data-page-form="display-name" novalidate><label class="field-label" for="displayName">Display name</label>`
    + `<div class="me-name-row"><input class="input" id="displayName" name="displayName" maxlength="40" autocomplete="nickname" value="${escapeHtml(c.displayName)}"${unavailable ? ' disabled' : ''}>`
    + `<button type="submit" class="btn btn-secondary"${unavailable ? ' disabled' : ''}>Save</button></div>`
    + `<p class="form-hint" id="displayNameHint" aria-live="polite">${unavailable ? 'Display names aren’t switched on yet. You can set yours once they are.' : 'Shown as “added by …” on gyms you add or edit. Never your email.'}</p></form>`;
  const subs = (c.submissions || []).map(s => `<li class="me-submission"><span class="me-submission-name">${escapeHtml((s.kind === 'edit' ? 'Edit to ' : 'New gym: ') + s.name)}</span>`
    + ` <span class="${s.status === 'pending' ? 'provenance-pending' : 'provenance-rejected'}">${s.status === 'pending' ? 'In review' : 'Not accepted'}</span>`
    + `${s.status === 'rejected' && s.reason ? `<span class="me-submission-reason">${escapeHtml(s.reason)}</span>` : ''}</li>`).join('');
  return `<section class="page-section" aria-labelledby="contribTitle"><h2 class="section-title" id="contribTitle">Your contributions</h2>`
    + points + form + (subs ? `<ul class="me-submissions">${subs}</ul>` : '') + `</section>`;
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
