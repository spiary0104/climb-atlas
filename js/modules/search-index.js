// Search index (DESIGN.md sec. 9): one index over gyms, cities, regions and countries. Pure (no DOM), built once after the
// spots load and rebuilt when they change; queried on every keystroke (debounced in search.js).
//   Cities: the curated metros (metros.js: "Sydney" = every gym within its radius, key "AU:NSW:~sydney") first, then suburbs
//   grouped by country + region (the data has no city field, so the remaining suburbs stand in for cities, sec. 9.1). A suburb
//   that is only the metro's own name ("Sydney" in NSW) stays resolvable by its old key but is hidden from results.
//   Matching: case- and diacritic-insensitive, prefix on word starts, every query word must match; codes ("NSW", "JP") and
//   a metro's aliases ("Wien") too.
import { fold, wordStarts } from './geo.js';
import { isMetroName, metroKey, metroOf } from './metros.js';

export const GROUP_LIMITS = Object.freeze({ city: 5, region: 3, country: 2, gym: 8 });

function extend(b, g){
  if(!b) return { west: g.lng, south: g.lat, east: g.lng, north: g.lat };
  b.west = Math.min(b.west, g.lng); b.east = Math.max(b.east, g.lng);
  b.south = Math.min(b.south, g.lat); b.north = Math.max(b.north, g.lat);
  return b;
}

// Place keys double as the ?place= URL value and the filter key: "AU", "AU:NSW", "AU:NSW:Marrickville".
export const placeKey = (country, state, suburb) => [country, state, suburb].filter(v => v != null && v !== '').join(':');

export function buildSearchIndex(spots, { countryLabels = {}, stateLabel = (c, s) => s } = {}){
  const countries = new Map(), regions = new Map(), cities = new Map(), metros = new Map(), gyms = [];
  const secondaryOf = (region, country) => region === country ? country : region + ' · ' + country;
  for(const g of spots){
    if(!g || !Number.isFinite(g.lat) || !Number.isFinite(g.lng)) continue;
    const ck = placeKey(g.country), rk = placeKey(g.country, g.state), sk = placeKey(g.country, g.state, (g.suburb || '').trim());
    const country = countryLabels[g.country] || g.country, region = stateLabel(g.country, g.state) || g.state;
    if(!countries.has(ck)) countries.set(ck, { kind: 'country', key: ck, label: country, secondary: '', codes: [fold(g.country)], count: 0, bounds: null, country: g.country });
    if(!regions.has(rk)) regions.set(rk, { kind: 'region', key: rk, label: region, secondary: country, codes: [fold(g.state)], count: 0, bounds: null, country: g.country, state: g.state });
    const metro = metroOf(g);
    if(metro && !metros.has(metro)){
      const mRegion = stateLabel(metro.country, metro.state) || metro.state;
      metros.set(metro, { kind: 'city', key: metroKey(metro), label: metro.name, secondary: secondaryOf(mRegion, country), codes: (metro.aliases || []).map(fold),
        count: 0, bounds: null, country: metro.country, state: metro.state, metro: metro.slug });
    }
    if(g.suburb && !cities.has(sk)) cities.set(sk, { kind: 'city', key: sk, label: g.suburb.trim(), secondary: secondaryOf(region, country), codes: [], count: 0, bounds: null, country: g.country, state: g.state,
      hidden: !!metro && isMetroName(metro, g.suburb) });
    for(const e of [countries.get(ck), regions.get(rk), cities.get(sk), metro && metros.get(metro)]){
      if(!e) continue;
      e.count++; e.bounds = extend(e.bounds, g);
    }
    gyms.push({ kind: 'gym', key: g.id, id: g.id, label: g.name || '', secondary: [g.suburb, region].filter(Boolean).join(' · '),
      words: [...wordStarts(g.name), ...wordStarts(g.suburb), ...wordStarts(g.address)], codes: [], count: 0, lat: g.lat, lng: g.lng });
  }
  const places = [...metros.values(), ...cities.values(), ...regions.values(), ...countries.values()];
  for(const e of places) e.words = wordStarts([e.label, ...(e.metro ? e.codes : [])].join(' '));   // a metro's aliases match like its name
  for(const e of gyms) e.nameWords = wordStarts(e.label);
  return { places, gyms };
}

// Score an entry for the query words; 0 = no match. Exact label > label prefix > every word matches a word start.
function score(e, qWords, qFolded, words){
  if(e.codes.includes(qFolded)) return 5;
  const label = fold(e.label);
  if(label === qFolded) return 4;
  if(!qWords.every(q => words.some(w => w.startsWith(q)))) return 0;
  if(label.startsWith(qFolded)) return 3;
  return e.nameWords && qWords.every(q => e.nameWords.some(w => w.startsWith(q))) ? 2 : 1;
}

// -> { city: [...], region: [...], country: [...], gym: [...], total }
export function querySearchIndex(index, text){
  const qFolded = fold(text).trim();
  const qWords = wordStarts(text);
  const out = { city: [], region: [], country: [], gym: [], total: 0 };
  if(!qWords.length) return out;
  const ranked = { city: [], region: [], country: [], gym: [] };
  for(const e of index.places){
    if(e.hidden) continue;                          // a suburb that is only its metro's name: the metro is the result
    const s = score(e, qWords, qFolded, e.words);
    if(s) ranked[e.kind].push([e.metro ? s + 0.5 : s, e]);   // a metro outranks a suburb that matches equally well
  }
  for(const e of index.gyms){ const s = score(e, qWords, qFolded, e.words); if(s) ranked.gym.push([s, e]); }
  for(const kind of Object.keys(ranked)){
    ranked[kind].sort((a, b) => b[0] - a[0] || b[1].count - a[1].count || a[1].label.localeCompare(b[1].label));
    out[kind] = ranked[kind].slice(0, GROUP_LIMITS[kind]).map(r => r[1]);
    out.total += out[kind].length;
  }
  return out;
}

// Does a gym belong to a place entry (the place filter)? Countries and regions by code, a suburb by its exact name, a metro
// by distance from its centre (metros.js), so "Sydney" includes every gym in the Sydney area whatever its suburb.
export function inPlace(g, place){
  if(!place) return true;
  if(g.country !== place.country) return false;
  if(place.kind === 'country') return true;
  if(place.metro){ const m = metroOf(g); return !!m && m.slug === place.metro; }
  if(g.state !== place.state) return false;
  return place.kind === 'region' || (g.suburb || '').trim() === place.label;
}

// Resolve a ?place= key back to its index entry (for back/forward and shared links).
export function findPlace(index, key){
  return index.places.find(e => e.key === key) || null;
}
