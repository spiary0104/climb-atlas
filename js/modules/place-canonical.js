// The canonical page for a region (pure, unit-tested in tests/place-canonical.test.js). Shared by the region page
// (region-page.js sets the canonical tag), the sitemap and the link-preview data (scripts/lib/sitemap.js), so the
// app, the sitemap and crawlers always agree. A region page duplicates a city page when that city page lists exactly
// the region's gyms (Shanghai the region and Shanghai the city); the city page is then the canonical one.
import { groupByMetro, metroByPath, metrosForRegion } from './metros.js';
import { duplicatePlacePath } from './seo-meta.js';
import { citySegment, cityPath, metroPath, regionPath, regionSegment } from './slug.js';

// spots: gyms with {id, country, state, suburb, lat, lng}. Returns the city path the region page should name as its
// canonical, or null when the region page is its own page.
export function regionCanonicalPath(spots, country, state){
  const cc = String(country || '').toUpperCase(), seg = regionSegment(state);
  if(!seg) return null;
  const gyms = spots.filter(g => g.country === cc && regionSegment(g.state) === seg);
  if(!gyms.length) return null;
  const candidates = [];
  // Metro pages list every gym in the metro, wherever its region code points.
  const byMetro = groupByMetro(spots, cc);
  for(const { metro } of metrosForRegion(spots, cc, state)) candidates.push({ path: metroPath(metro), ids: (byMetro.get(metro) || []).map(g => g.id) });
  // Suburb pages: only those that exist as their own page (2+ gyms, the sitemap rule; a metro slug wins over a suburb).
  const suburbs = new Map();
  for(const g of gyms){
    const s = citySegment(g.suburb);
    if(!s || metroByPath(cc, seg, s)) continue;
    if(!suburbs.has(s)) suburbs.set(s, { path: cityPath(cc, state, g.suburb), ids: [] });
    suburbs.get(s).ids.push(g.id);
  }
  for(const c of suburbs.values()) if(c.ids.length >= 2) candidates.push(c);
  const hit = duplicatePlacePath(gyms.map(g => g.id), candidates);
  return hit && hit !== regionPath(cc, state) ? hit : null;
}
