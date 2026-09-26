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
export function mapThumbHtml({ lat, lng, zoom = 14, size = 120, href, label, types = null }){
  if(!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  const pin = types ? `<span class="map-thumb-pin">${pinSvg({ types })}</span>` : '';
  return `<figure class="map-thumb-figure"><a class="map-thumb" data-theme="rock" href="${escapeHtml(href)}" data-link data-mini-map`
    + ` data-lat="${Number(lat)}" data-lng="${Number(lng)}" data-zoom="${Number(zoom)}" style="width:${Number(size)}px;height:${Number(size)}px" aria-label="${escapeHtml(label)}">${pin}</a>`
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

export function notFoundHtml(what = 'page'){
  const w = what === 'gym' ? 'gym' : what === 'place' ? 'place' : 'page';
  return `<article class="page page-empty"><h1 class="page-title">We couldn’t find that ${w}</h1>`
    + `<p class="section-note">It may have moved or been removed.</p><p><a class="btn btn-secondary" href="/" data-link>Back to the map</a></p></article>`;
}

export function pageSkeletonHtml(){
  return '<article class="page" aria-busy="true"><div class="skeleton-title" aria-hidden="true"></div>'
    + Array.from({length: 4}, () => '<div class="skeleton-row" aria-hidden="true"><span></span><span></span></div>').join('') + '</article>';
}
