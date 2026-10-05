// URL slugs (docs/DESIGN.md sec. 6.2; owner decision 2026-09-26: name-suburb, stored). Pure, unit-tested.
// The database owns gym slugs (supabase/migrations/*_add_spot_slugs.sql: stored, set once, never changed). This module
// mirrors that rule for two cases only: rows that arrive without a slug (the offline data/spots-fallback.json fallback, or a
// database the migration has not reached yet), and region/city path segments, which are derived, not stored.
import { fold } from './geo.js';

// "Île-de-France" -> "ile-de-france", "Akihabara, Tokyo" -> "akihabara-tokyo"; non-Latin text folds to "".
export function slugPart(text){
  return fold(text).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Name words, then the suburb words the name does not already contain; the id when neither has Latin letters/digits.
export function slugBase(name, suburb, id){
  const base = slugPart(name);
  const have = new Set(base.split('-'));
  const extra = slugPart(suburb).split('-').filter(t => t && !have.has(t)).join('-');
  const joined = [base, extra].filter(Boolean).join('-') || slugPart(id);
  return joined.slice(0, 80).replace(/^-+|-+$/g, '');
}

// Give every slug-less row a slug, oldest first, suffixing clashes -2, -3, ... (mutates the rows; returns them).
export function assignMissingSlugs(spots){
  const used = new Set(spots.filter(g => g.slug).map(g => g.slug));
  const todo = spots.filter(g => !g.slug)
    .sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for(const g of todo){
    const base = slugBase(g.name, g.suburb, g.id) || 'gym';
    let candidate = base, i = 1;
    while(used.has(candidate)){ i++; candidate = base + '-' + i; }
    used.add(candidate);
    g.slug = candidate;
  }
  return spots;
}

// Region/city path segments: the region code lower-cased (codes are unique within a country), the city as a slug.
export const regionSegment = state => encodeURIComponent(String(state || '').toLowerCase());
export const citySegment = suburb => slugPart(suburb) || encodeURIComponent(String(suburb || '').trim().toLowerCase());

export const gymPath = g => '/gym/' + encodeURIComponent(g.slug || g.id);
export const countryPath = country => '/in/' + encodeURIComponent(String(country || '').toLowerCase());
export const regionPath = (country, state) => countryPath(country) + '/' + regionSegment(state);
export const cityPath = (country, state, suburb) => regionPath(country, state) + '/' + citySegment(suburb);
// A metro (metros.js) lives at its core region + its slug; the city route tries metros before suburbs.
export const metroPath = m => regionPath(m.country, m.state) + '/' + m.slug;
