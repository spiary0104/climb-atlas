// Add a gym (DESIGN.md sec. 10.3): pure markup and rules for the two-step /add flow, unit-tested with hostile data
// (tests/render-html.test.js). Step 1 is the pin (the centre of a map with a crosshair), the name and the climb types;
// step 2 is optional details. Both steps end in the same single insert of a pending spot (the RLS insert policy in
// supabase/schema.sql: signed in, status 'pending', 10 a day). The area (suburb, region, country) is required by the
// table, so it is taken from the nearest gym when there is one and stays editable in step 2. No character here.
import { COUNTRY_LABELS, TYPE_LABELS } from './constants.js';
import { distanceKm, formatDistance, ALL_TYPES } from './geo.js';
import { escapeHtml } from './html-safe.js';
import { icon } from './icons.js';
import { STATES_BY_COUNTRY } from './regions.js';

export const PIN_ZOOM = 14;          // street level: the crosshair is precise enough to count as a placed pin
export const AREA_KM = 25;           // take the area from the nearest gym only when it is this close
export const DUPLICATE_KM = 0.15;    // a gym this close to the crosshair is probably the same gym

const TYPE_DOT = { 'indoor-bouldering': 'boulder', 'top-rope': 'toprope', 'lead-climbing': 'lead' };

// Nearest gym to a point, and the area to copy from it when it is close enough.
export function areaFor(spots, pt){
  let best = null;
  for(const g of spots || []){
    if(!Number.isFinite(g.lat) || !Number.isFinite(g.lng)) continue;
    const km = distanceKm(pt, g);
    if(!best || km < best.km) best = { g, km };
  }
  const area = best && best.km <= AREA_KM ? { suburb: best.g.suburb || '', country: best.g.country || '', state: best.g.state || '' } : null;
  return { near: best, area };
}

// Resolved country/state for the insert: "Other" uses the two free-text fields.
export function countryState(d){
  if(d.country === 'OTHER') return { country: String(d.countryOther || '').trim(), state: String(d.stateOther || '').trim() };
  return { country: String(d.country || ''), state: String(d.state || '') };
}

// "Still needed" for step 1's three fields (sec. 10.3); the area only when the nearest gym could not supply it.
export function stepOneMissing(d, zoom){
  const missing = [];
  if(!Number.isFinite(d.lat) || !(zoom >= PIN_ZOOM)) missing.push('the pin (zoom in to street level)');
  if(!String(d.name || '').trim()) missing.push('a name');
  if(!(d.types || []).length) missing.push('at least one climbing type');
  return missing;
}
export function areaMissing(d){
  const { country, state } = countryState(d);
  const missing = [];
  if(!String(d.suburb || '').trim()) missing.push('a suburb or town');
  if(!country || !state) missing.push('a country and region');
  return missing;
}

export function addPageHtml(){
  return `<article class="page add-page"><header class="page-header-row"><div><h1 class="page-title">Add a gym</h1>`
    + `<p class="place-meta">Submitted gyms appear once a moderator has checked them.</p></div></header>`
    + `<div class="add-layout"><section class="add-map-col" aria-label="Where is it?">`
    + `<div class="add-map-wrap"><div class="add-map" data-add-map aria-label="Map. Move it so the gym is under the crosshair."></div>`
    + `<span class="add-crosshair" aria-hidden="true">${icon('crosshair-simple', {size:'lg'})}</span></div>`
    + `<div class="add-map-bar"><button type="button" class="btn btn-secondary btn-sm" data-add-action="locate">${icon('navigation-arrow', {size:'sm'})}Use my location</button>`
    + `<span class="add-coords tnum" id="addCoords"></span></div>`
    + `<div id="addNear" aria-live="polite"></div></section>`
    + `<form class="add-form" id="addForm" novalidate></form></div></article>`;
}

// Under the map: a likely duplicate, the area the gym will be filed under, or a note that step 2 needs it.
export function nearHtml(d, near, href){
  if(near && near.km < DUPLICATE_KM){
    return `<p class="add-near add-near--warn">${icon('warning-circle', {size:'sm'})}<span><a href="${escapeHtml(href)}" data-link>${escapeHtml(near.g.name)}</a> is already on the map, ${escapeHtml(formatDistance(near.km))} from the crosshair. If that is this gym, suggest an edit on its page instead.</span></p>`;
  }
  const { country, state } = countryState(d);
  if(String(d.suburb || '').trim() && country && state){
    return `<p class="add-near">Filed under ${escapeHtml(d.suburb)}, ${escapeHtml(state)}, ${escapeHtml(COUNTRY_LABELS[country] || country)}. You can change this in step 2.</p>`;
  }
  return `<p class="add-near">No gyms nearby yet, so step 2 will ask for the suburb and region.</p>`;
}

function typeChecks(types){
  return ALL_TYPES.map(t => `<label class="check-row"><input type="checkbox" data-add-type="${escapeHtml(t)}"${(types || []).includes(t) ? ' checked' : ''}>`
    + `<span class="type-dot type-dot--${escapeHtml(TYPE_DOT[t])}" aria-hidden="true"></span>${escapeHtml(TYPE_LABELS[t])}</label>`).join('');
}

function textField(key, label, value, extra = ''){
  return `<div class="field"><label for="add-${escapeHtml(key)}">${escapeHtml(label)}</label>`
    + `<input id="add-${escapeHtml(key)}" data-add-field="${escapeHtml(key)}" type="text" value="${escapeHtml(value || '')}"${extra}></div>`;
}

function countrySelect(d){
  const codes = Object.keys(COUNTRY_LABELS).sort((a, b) => COUNTRY_LABELS[a].localeCompare(COUNTRY_LABELS[b]));
  const known = d.country === 'OTHER' || !d.country || COUNTRY_LABELS[d.country];
  const opts = (d.country ? '' : '<option value="" selected>Choose a country</option>')
    + (known ? '' : `<option value="${escapeHtml(d.country)}" selected>${escapeHtml(d.country)}</option>`)
    + codes.map(c => `<option value="${escapeHtml(c)}"${c === d.country ? ' selected' : ''}>${escapeHtml(COUNTRY_LABELS[c])}</option>`).join('')
    + `<option value="OTHER"${d.country === 'OTHER' ? ' selected' : ''}>Other (not listed)</option>`;
  return `<div><label for="add-country">Country</label><select id="add-country" data-add-field="country">${opts}</select></div>`;
}

function regionSelect(d){
  const list = STATES_BY_COUNTRY[d.country] || [];
  if(!list.length) return textField('state', 'Region', d.state);
  const opts = (list.some(([code]) => code === d.state) ? '' : '<option value="" selected>Choose a region</option>')
    + list.map(([code, label]) => `<option value="${escapeHtml(code)}"${code === d.state ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
  return `<div><label for="add-state">Region</label><select id="add-state" data-add-field="state">${opts}</select></div>`;
}

// The form for the current step. ctx: {signedIn, busy}
export function addStepHtml(d, ctx = {}){
  const submit = `<button type="submit" class="btn btn-primary"${ctx.busy ? ' disabled' : ''}>${ctx.busy ? 'Submitting…' : 'Submit for review'}</button>`;
  const signIn = ctx.signedIn ? '' : '<p class="add-signin">You will be asked to sign in when you submit.</p>';
  if(d.step === 2){
    const other = d.country === 'OTHER'
      ? `<div class="field field-row">${textField('countryOther', 'Country name', d.countryOther)}${textField('stateOther', 'State or region', d.stateOther)}</div>`
      : '';
    return `<p class="add-step">Step 2 of 2 · Details (optional)</p>`
      + textField('suburb', 'Suburb or nearest town', d.suburb, ' autocomplete="off"')
      + `<div class="field field-row">${countrySelect(d)}${d.country === 'OTHER' ? '' : regionSelect(d)}</div>${other}`
      + textField('address', 'Street address', d.address, ' autocomplete="off"')
      + textField('photo', 'Photo link', d.photo, ' inputmode="url" placeholder="https://"')
      + `<div class="field"><label for="add-notes">Notes</label><textarea id="add-notes" data-add-field="notes" placeholder="Day pass price, opening hours, anything useful">${escapeHtml(d.notes || '')}</textarea></div>`
      + `<p class="form-hint" id="addHint" aria-live="polite"></p>`
      + `<div class="add-actions"><button type="button" class="btn btn-tertiary" data-add-action="back">${icon('arrow-left', {size:'sm'})}Back</button>${submit}</div>${signIn}`;
  }
  return `<p class="add-step">Step 1 of 2 · The essentials</p>`
    + textField('name', 'Name', d.name, ' autocomplete="off" maxlength="120" placeholder="e.g. Boulder Collective"')
    + `<fieldset class="field add-types"><legend class="field-label">Climbing</legend>${typeChecks(d.types)}</fieldset>`
    + `<p class="form-hint" id="addHint" aria-live="polite"></p>`
    + `<div class="add-actions"><button type="button" class="btn btn-secondary" data-add-action="details">Add details</button>${submit}</div>${signIn}`;
}

export function addDoneHtml(){
  return `<div class="add-done"><h2 class="section-title">Thanks — it's in review.</h2>`
    + `<p class="section-note">We'll show it once a moderator has checked it. You can follow it under Contributions on your profile.</p>`
    + `<div class="add-actions"><a class="btn btn-secondary" href="/me" data-link>Your contributions</a>`
    + `<button type="button" class="btn btn-primary" data-add-action="another">Add another gym</button></div></div>`;
}
