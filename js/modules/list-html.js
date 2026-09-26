// Explore markup builders (DESIGN.md sec. 7.4, 7.10, 13): dense row, photo card, carousel card, peek card, empty states,
// skeletons and the contour placeholder. Pure (no DOM, no appState): list.js / explore.js pass the per-user state in.
// Every database value goes through escapeHtml(); photos go through safeUrl() first. Buttons carry data-* actions that one
// delegated listener reads back, never inline handlers, so an id or name can never become code.
import { TYPE_LABELS } from './constants.js';
import { escapeHtml, safeUrl } from './html-safe.js';
import { directionsUrl } from './utils.js';
import { icon } from './icons.js';

const TYPE_CLASS = { 'indoor-bouldering': 'boulder', 'top-rope': 'toprope', 'lead-climbing': 'lead' };
const knownTypes = types => (Array.isArray(types) ? types : []).filter(t => TYPE_CLASS[t]);

// The contour placeholder: one shared symbol plus the gym's initial as text (sec. 13). Sits under any photo, so a photo
// that fails to load (the capture-phase error handler hides it) falls back to it with no extra DOM work.
export function thumbHtml(g, size){
  const photo = safeUrl(g.photo);          // only absolute http(s) links are ever rendered as an image
  const initial = String(g.name || '?').trim().charAt(0).toUpperCase() || '?';
  return `<span class="thumb thumb--${size === 'card' ? 'card' : size === 'peek' ? 'peek' : 'row'}" aria-hidden="true">`
    + `<svg class="placeholder-contour" aria-hidden="true" focusable="false"><use href="assets/contour.svg#contour"/></svg>`
    + `<span class="placeholder-letter">${escapeHtml(initial)}</span>`
    + `${photo ? `<img class="gym-photo" src="${escapeHtml(photo)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}</span>`;
}

export const typeDotsHtml = types => knownTypes(types).map(t => `<span class="type-dot type-dot--${TYPE_CLASS[t]}" aria-hidden="true"></span>`).join('');
export const typeTagsHtml = types => knownTypes(types).map(t => `<span class="type-tag type-tag--${TYPE_CLASS[t]}">${escapeHtml(TYPE_LABELS[t])}</span>`).join('');
const typeText = types => knownTypes(types).map(t => TYPE_LABELS[t]).join(', ');

// Community-added: a grey ring-dot after the name (verified shows nothing; community-verified arrives with Phase 4).
const provenanceHtml = g => g.community ? '<span class="provenance-mark provenance-mark--community" title="Community-added"></span><span class="visually-hidden">, community-added</span>' : '';

const placeLine = (g, ctx) => [g.suburb, ctx.region].filter(Boolean).join(' · ');

function saveButton(g, saved, extraClass){
  return `<button type="button" class="btn btn-tertiary btn-icon btn-sm save-toggle ${extraClass}" data-gym-action="save" data-spot-id="${escapeHtml(g.id)}"`
    + ` aria-pressed="${saved ? 'true' : 'false'}" aria-label="Save ${escapeHtml(g.name)}">${icon('bookmark-simple', {size:'sm'})}</button>`;
}

// Dense row (56px): thumb · name + provenance · type dots + "Suburb · Region" · distance + save toggle.
export function rowHtml(g, ctx = {}){
  return `<div class="gym-row${ctx.selected ? ' is-selected' : ''}" data-id="${escapeHtml(g.id)}" role="listitem">`
    + `<button type="button" class="gym-row-main" data-gym-action="open" data-spot-id="${escapeHtml(g.id)}" aria-label="${escapeHtml(g.name)}, ${escapeHtml(typeText(g.types))}, ${escapeHtml(placeLine(g, ctx))}">`
    + thumbHtml(g, 'row')
    + `<span class="gym-row-text"><span class="gym-row-name"><span class="gym-row-title">${escapeHtml(g.name)}</span>${provenanceHtml(g)}</span>`
    + `<span class="gym-row-meta">${typeDotsHtml(g.types)}<span class="gym-row-place">${escapeHtml(placeLine(g, ctx))}</span></span></span></button>`
    + `<span class="gym-row-side">${ctx.distance ? `<span class="gym-row-distance tnum">${escapeHtml(ctx.distance)}</span>` : ''}${saveButton(g, ctx.saved, 'gym-row-save')}</span></div>`;
}

// Photo card (opt-in): 4:3 photo or placeholder · name (Fraunces) · "Suburb, Region · distance" · type tags.
export function cardHtml(g, ctx = {}){
  const meta = [[g.suburb, ctx.region].filter(Boolean).join(', '), ctx.distance].filter(Boolean).join(' · ');
  return `<div class="gym-card${ctx.selected ? ' is-selected' : ''}" data-id="${escapeHtml(g.id)}" role="listitem">`
    + `<button type="button" class="gym-card-main" data-gym-action="open" data-spot-id="${escapeHtml(g.id)}">`
    + thumbHtml(g, 'card')
    + `<span class="gym-card-body"><span class="gym-card-name">${escapeHtml(g.name)}${provenanceHtml(g)}</span>`
    + `<span class="gym-card-meta tnum">${escapeHtml(meta)}</span><span class="gym-card-tags">${typeTagsHtml(g.types)}</span></span></button>`
    + saveButton(g, ctx.saved, 'gym-card-save') + `</div>`;
}

// Mobile pin-tap carousel card: compact photo card, one per gym in the tapped cluster (sec. 7.9).
export function carouselCardHtml(g, ctx = {}){
  return `<button type="button" class="carousel-card${ctx.selected ? ' is-selected' : ''}" data-gym-action="details" data-spot-id="${escapeHtml(g.id)}">`
    + thumbHtml(g, 'row')
    + `<span class="carousel-card-body"><span class="carousel-card-name">${escapeHtml(g.name)}</span>`
    + `<span class="carousel-card-meta">${typeDotsHtml(g.types)}${escapeHtml(placeLine(g, ctx))}</span>`
    + `${ctx.distance ? `<span class="carousel-card-distance tnum">${escapeHtml(ctx.distance)}</span>` : ''}</span></button>`;
}

// Peek card (replaces the MapLibre popup): everything the popup offered, same data-* action contract.
export function peekHtml(g, ctx = {}){
  const photo = safeUrl(g.photo);
  const id = escapeHtml(g.id);
  const where = [g.suburb, ctx.region, ctx.country && ctx.country !== ctx.region ? ctx.country : ''].filter(Boolean).join(', ');
  return `<div class="peek-head"><h2 class="peek-name" id="peekTitle">${escapeHtml(g.name)}</h2>`
    + `<button type="button" class="btn btn-tertiary btn-icon btn-sm peek-close" data-gym-action="close" aria-label="Close">${icon('x', {size:'sm'})}</button></div>`
    + `${photo ? `<img class="gym-photo peek-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(g.name)}" loading="lazy" referrerpolicy="no-referrer">` : ''}`
    + `<div class="peek-tags">${typeTagsHtml(g.types)}</div>`
    + `<p class="peek-meta">${escapeHtml(where)}${ctx.distance ? ` · <span class="tnum">${escapeHtml(ctx.distance)}</span>` : ''}</p>`
    + `${g.community ? `<p class="provenance-line"><span class="provenance-mark provenance-mark--community"></span> Community-added${g.edited ? ' · edited' : ''}</p>` : g.edited ? '<p class="provenance-line">Edited by the community</p>' : ''}`
    + `${g.address ? `<p class="peek-address">${escapeHtml(g.address)}</p>` : ''}`
    + `${g.notes ? `<p class="peek-notes">${escapeHtml(g.notes)}</p>` : ''}`
    + `<div class="peek-actions">`
    + `<button type="button" class="btn btn-secondary btn-sm" data-gym-action="save" data-spot-id="${id}" aria-pressed="${ctx.saved ? 'true' : 'false'}">${icon('bookmark-simple', {size:'sm'})}Save</button>`
    + `<button type="button" class="btn btn-secondary btn-sm" data-gym-action="climbed" data-spot-id="${id}" aria-pressed="${ctx.climbed ? 'true' : 'false'}">${icon('check', {size:'sm'})}Climbed</button>`
    + `<a class="btn btn-secondary btn-sm peek-directions" href="${escapeHtml(directionsUrl(g))}" target="_blank" rel="noopener noreferrer">${icon('navigation-arrow', {size:'sm'})}Directions</a></div>`
    + `<div class="peek-more">`
    + `<button type="button" class="btn btn-tertiary btn-sm" data-gym-action="edit" data-spot-id="${id}">${icon('pencil-simple', {size:'sm'})}Suggest an edit</button>`
    + `<button type="button" class="btn btn-tertiary btn-sm" data-gym-action="report" data-spot-id="${id}">${icon('flag', {size:'sm'})}Report a problem</button></div>`;
}

// The three list empty states (sec. 7.10). No character in any of them (it is reserved for the first-run empties).
export function emptyHtml(kind, term = ''){
  if(kind === 'search') return `<div class="empty-state"><p class="empty-title">Nothing for “${escapeHtml(term)}”</p>`
    + `<button type="button" class="btn btn-secondary" data-list-action="search-city">Search a city instead</button></div>`;
  if(kind === 'filters') return '<div class="empty-state"><p class="empty-title">No gyms match</p>'
    + '<button type="button" class="btn btn-secondary" data-list-action="clear-filters">Clear filters</button></div>';
  return '<div class="empty-state"><p class="empty-title">No gyms in this area yet</p><div class="empty-actions">'
    + '<button type="button" class="btn btn-secondary" data-list-action="zoom-out">Zoom out</button>'
    + '<button type="button" class="btn btn-secondary" data-list-action="add-gym">Add a gym</button></div></div>';
}

// "Zoom in to see all 1,204": the list never dumps more than the cap (sec. 7.2).
export function capRowHtml(total){
  return `<div class="list-cap" role="listitem"><button type="button" class="btn btn-tertiary btn-sm" data-list-action="zoom-in">`
    + `Zoom in to see all <span class="tnum">${escapeHtml(Number(total).toLocaleString('en-US'))}</span></button></div>`;
}

// Removable pill for an applied place or text filter, shown after the fixed chips (sec. 7.5, 7.6).
export function appliedPillHtml(kind, label){
  const which = kind === 'place' ? 'place' : 'text';
  const shown = which === 'text' ? '“' + label + '”' : label;
  return `<button type="button" class="chip chip-applied" data-remove-filter="${which}" aria-label="Remove filter ${escapeHtml(shown)}">`
    + `<span class="chip-label">${escapeHtml(shown)}</span>${icon('x', {size:'sm'})}</button>`;
}

// Search results (sec. 9.2): grouped listbox options. `index` is the position in search.js's own result array; the
// option carries only that number, so nothing from the database is ever read back out of the DOM.
const KIND_ICON = { city: 'buildings', region: 'map-trifold', country: 'globe-hemisphere-west', gym: 'map-pin', recent: 'clock-counter-clockwise' };
export function searchOptionHtml(entry, index, { recent = false } = {}){
  const kind = recent ? 'recent' : KIND_ICON[entry.kind] ? entry.kind : 'gym';
  const count = !recent && entry.kind !== 'gym' && entry.count ? `<span class="search-option-count tnum">${escapeHtml(entry.count === 1 ? '1 gym' : entry.count.toLocaleString('en-US') + ' gyms')}</span>` : '';
  return `<div class="search-option" role="option" id="search-opt-${Number(index)}" data-index="${Number(index)}" aria-selected="false">`
    + icon(KIND_ICON[kind], {size:'sm'})
    + `<span class="search-option-text"><span class="search-option-label">${escapeHtml(entry.label)}</span>`
    + `${entry.secondary ? `<span class="search-option-secondary">${escapeHtml(entry.secondary)}</span>` : ''}</span>${count}</div>`;
}
export function searchGroupHtml(title, optionsHtml){
  return `<div class="search-group" role="group" aria-label="${escapeHtml(title)}"><div class="search-group-title" aria-hidden="true">${escapeHtml(title)}</div>${optionsHtml}</div>`;
}

export function skeletonHtml(view){
  return view === 'cards'
    ? Array.from({length: 3}, () => '<div class="skeleton-card" aria-hidden="true"><span></span><span></span><span></span></div>').join('')
    : Array.from({length: 6}, () => '<div class="skeleton-row" aria-hidden="true"><span></span><span></span></div>').join('');
}
