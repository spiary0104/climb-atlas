// Region pages (DESIGN.md sec. 6.1, 6.2, 14): /in (countries by continent), /in/{country} (its regions), /in/{country}/
// {region} (its cities and gyms), /in/{country}/{region}/{city} (its gyms). Every place is derived from the gyms
// themselves, so counts match Explore and search. Each page has a mini map of its gyms linking to Explore with the
// place applied: the non-map browse path the accessibility contract asks for (sec. 15).
import { COUNTRY_LABELS, COUNTRY_TO_REGION, REGION_LABELS } from './constants.js';
import { encodeExploreState, fitCamera } from './geo.js';
import { stateLabel } from './map.js';
import { destroyMiniMaps, mountMiniMaps } from './mini-map.js';
import { groupByMetro, metroByPath, metroKey, metroOf } from './metros.js';
import { notFoundHtml, pageSkeletonHtml, placePageHtml, regionMeta, regionSearchResultsHtml, regionsIndexHtml } from './page-html.js';
import { registerView, setPageTitle } from './router.js';
import { buildSearchIndex, placeKey, querySearchIndex } from './search-index.js';
import { placeSeo } from './seo-meta.js';
import { citySegment, cityPath, countryPath, gymPath, metroPath, regionPath, regionSegment } from './slug.js';
import { appState } from './state.js';

const MAP_W = 360, MAP_H = 270;
const byName = (a, b) => a.label.localeCompare(b.label);
const plural = (n, one, many) => n === 1 ? '1 ' + one : n.toLocaleString('en-US') + ' ' + many;

function boundsOf(gyms){
  const b = { west: Infinity, south: Infinity, east: -Infinity, north: -Infinity };
  for(const g of gyms){ b.west = Math.min(b.west, g.lng); b.east = Math.max(b.east, g.lng); b.south = Math.min(b.south, g.lat); b.north = Math.max(b.north, g.lat); }
  return b;
}

// The mini map for a set of gyms, and the Explore link that shows the same place with its pill applied.
function mapFor(gyms, place, label){
  const cam = fitCamera(boundsOf(gyms), MAP_W, MAP_H, { maxZoom: 12 });
  const href = '/?' + encodeExploreState({ place, camera: { lng: cam.lng, lat: cam.lat, zoom: Math.max(cam.zoom, 3) } });
  return { lat: cam.lat, lng: cam.lng, zoom: cam.zoom, href, label: 'Show ' + label + ' on the map' };
}

function groupTiles(gyms, keyOf, labelOf, hrefOf){
  const groups = new Map();
  for(const g of gyms){
    const k = keyOf(g);
    if(!groups.has(k)) groups.set(k, { label: labelOf(g), href: hrefOf(g), count: 0 });
    groups.get(k).count++;
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || byName(a, b));
}

const gymItems = gyms => gyms.slice().sort((a, b) => a.name.localeCompare(b.name))
  .map(g => ({ g, ctx: { region: stateLabel(g.country, g.state), href: gymPath(g) } }));

function render(view, html, gyms, title){
  destroyMiniMaps();
  view.innerHTML = html;
  setPageTitle(title);
  mountMiniMaps(view, { points: gyms.map(g => ({ lat: g.lat, lng: g.lng, types: g.types })) });
}

function notFound(view){ destroyMiniMaps(); view.innerHTML = notFoundHtml('place'); setPageTitle('Place not found'); }
const pending = view => { if(appState.loaded) return false; view.innerHTML = pageSkeletonHtml(); setPageTitle('Loading'); return true; };

function regionsView(params, view){
  if(pending(view)) return;
  const known = appState.spots.filter(g => COUNTRY_LABELS[g.country]);
  const tiles = groupTiles(known, g => g.country, g => COUNTRY_LABELS[g.country], g => countryPath(g.country));
  const byContinent = new Map();
  for(const t of tiles){
    const code = t.href.split('/').pop().toUpperCase();
    const c = COUNTRY_TO_REGION[code] || 'other';
    if(!byContinent.has(c)) byContinent.set(c, []);
    byContinent.get(c).push(t);
  }
  const groups = [...Object.keys(REGION_LABELS), 'other'].filter(c => byContinent.has(c))
    .map(c => ({ title: REGION_LABELS[c] || 'Other', items: byContinent.get(c).sort(byName) }));
  destroyMiniMaps();
  view.innerHTML = regionsIndexHtml(groups, known.length);
  setPageTitle('Regions');
}

function countryView({ country }, view){
  if(pending(view)) return;
  const cc = country.toUpperCase();
  const gyms = appState.spots.filter(g => g.country === cc);
  if(!gyms.length || !COUNTRY_LABELS[cc]) return notFound(view);
  const name = COUNTRY_LABELS[cc];
  const tiles = groupTiles(gyms, g => g.state, g => stateLabel(cc, g.state), g => regionPath(cc, g.state));
  render(view, placePageHtml({
    crumbs: [{ label: 'Regions', href: '/in' }, { label: name, current: true }],
    title: name,
    meta: plural(gyms.length, 'gym', 'gyms') + ' · ' + plural(tiles.length, 'region', 'regions'),
    tilesTitle: 'Regions', tiles,
    // Small countries list their gyms right here; big ones go through their regions.
    gymsTitle: 'Gyms', gyms: gyms.length <= 60 ? gymItems(gyms) : [],
    map: mapFor(gyms, placeKey(cc), name),
  }), gyms, placeSeo({ kind: 'country', name, count: gyms.length }).title);
}

function regionGyms(country, region){
  const cc = country.toUpperCase();
  return appState.spots.filter(g => g.country === cc && regionSegment(g.state) === encodeURIComponent(region));
}

function regionView({ country, region }, view){
  if(pending(view)) return;
  const cc = country.toUpperCase();
  const gyms = regionGyms(country, region);
  if(!gyms.length || !COUNTRY_LABELS[cc]) return notFound(view);
  const state = gyms[0].state, name = stateLabel(cc, state);
  // Cities are the curated metros whose core is this region (metros.js), counted over every gym in them; the suburbs of the
  // gyms that belong to no metro follow as areas. The meta line counts each kind by what it is, never suburbs as cities.
  const metros = [...groupByMetro(appState.spots, cc).entries()].filter(([m]) => regionSegment(m.state) === encodeURIComponent(region))
    .map(([m, list]) => ({ label: m.name, href: metroPath(m), count: list.length })).sort((a, b) => b.count - a.count || byName(a, b));
  const loose = gyms.filter(g => !metroOf(g));
  const areas = groupTiles(loose.filter(g => (g.suburb || '').trim()), g => citySegment(g.suburb), g => g.suburb.trim(), g => cityPath(cc, state, g.suburb));
  render(view, placePageHtml({
    crumbs: [{ label: 'Regions', href: '/in' }, { label: COUNTRY_LABELS[cc], href: countryPath(cc) }, { label: name, current: true }],
    title: name,
    meta: regionMeta({ gyms: gyms.length, cities: metros.length, areas: areas.length }),
    tileSections: [{ title: 'Cities', tiles: metros },
      { title: metros.length ? 'Other areas' : 'Areas', tiles: areas.length > 1 && areas.length < loose.length ? areas : [] }],   // area tiles only when one holds more than one gym
    gymsTitle: 'Gyms', gyms: gymItems(gyms),
    map: mapFor(gyms, placeKey(cc, state), name),
  }), gyms, placeSeo({ kind: 'region', name, within: COUNTRY_LABELS[cc], count: gyms.length }).title);
}

// A metro page (metros.js): every gym within the metro's radius, wherever its region code points.
function metroView(metro, view){
  const cc = metro.country;
  const gyms = appState.spots.filter(g => g.country === cc && metroOf(g) === metro);
  if(!gyms.length) return false;
  const regionName = stateLabel(cc, metro.state), country = COUNTRY_LABELS[cc];
  render(view, placePageHtml({
    crumbs: [{ label: 'Regions', href: '/in' }, { label: country, href: countryPath(cc) }, { label: regionName, href: regionPath(cc, metro.state) }, { label: metro.name, current: true }],
    title: metro.name,
    meta: plural(gyms.length, 'gym', 'gyms') + ' · ' + regionName,
    gymsTitle: 'Gyms', gyms: gymItems(gyms),
    map: mapFor(gyms, metroKey(metro), metro.name),
  }), gyms, placeSeo({ kind: 'city', name: metro.name, within: regionName + ', ' + country, count: gyms.length }).title);
  return true;
}

function cityView({ country, region, city }, view){
  if(pending(view)) return;
  const cc = country.toUpperCase();
  const metro = metroByPath(country, encodeURIComponent(region), city);      // a metro slug wins; anything else is a suburb
  if(metro && COUNTRY_LABELS[cc] && metroView(metro, view)) return;
  const gyms = regionGyms(country, region).filter(g => citySegment(g.suburb) === encodeURIComponent(city) || citySegment(g.suburb) === city);
  if(!gyms.length || !COUNTRY_LABELS[cc]) return notFound(view);
  const state = gyms[0].state, name = gyms[0].suburb.trim(), regionName = stateLabel(cc, state);
  render(view, placePageHtml({
    crumbs: [{ label: 'Regions', href: '/in' }, { label: COUNTRY_LABELS[cc], href: countryPath(cc) }, { label: regionName, href: regionPath(cc, state) }, { label: name, current: true }],
    title: name,
    meta: plural(gyms.length, 'gym', 'gyms') + ' · ' + regionName,
    gymsTitle: 'Gyms', gyms: gymItems(gyms),
    map: mapFor(gyms, placeKey(cc, state, name), name),
  }), gyms, placeSeo({ kind: 'city', name, within: regionName + ', ' + COUNTRY_LABELS[cc], count: gyms.length }).title);
}

// /in search: the app's search index (search-index.js, the one Explore uses): countries, regions, cities, then gyms, each
// a link to its page. Only countries with a page are offered.
function regionSearchItems(text){
  const idx = appState.searchIndex || (appState.searchIndex = buildSearchIndex(appState.spots, { countryLabels: COUNTRY_LABELS, stateLabel }));
  const r = querySearchIndex(idx, text);
  const byId = new Map(appState.spots.map(g => [g.id, g]));
  const known = e => !!COUNTRY_LABELS[e.country];
  return [
    ...r.country.filter(known).map(e => ({ kind: 'country', label: e.label, secondary: '', href: countryPath(e.country), count: e.count })),
    ...r.region.filter(known).map(e => ({ kind: 'region', label: e.label, secondary: e.secondary, href: regionPath(e.country, e.state), count: e.count })),
    ...r.city.filter(known).map(e => ({ kind: 'city', label: e.label, secondary: e.secondary, href: e.metro ? metroPath(e) : cityPath(e.country, e.state, e.label), count: e.count })),
    ...r.gym.map(e => byId.get(e.id)).filter(Boolean).map(g => ({ kind: 'gym', label: g.name, secondary: [g.suburb, stateLabel(g.country, g.state)].filter(Boolean).join(' · '), href: gymPath(g), count: 0 })),
  ];
}

export function initRegionPages(){
  const view = document.getElementById('view');
  view.addEventListener('input', (e)=>{
    if(e.target.id !== 'regionSearch') return;
    const q = e.target.value;
    document.getElementById('regionResults').innerHTML = regionSearchResultsHtml(q, q.trim() ? regionSearchItems(q) : []);
    document.getElementById('regionBrowse').hidden = !!q.trim();     // results replace browsing while there is a query
  });
  view.addEventListener('submit', (e)=>{
    if(!e.target.closest('[data-page-form="region-search"]')) return;
    e.preventDefault();
    const first = view.querySelector('.regions-hit');                // Enter opens the top result
    if(first) first.click();
  });
  registerView('regions', { enter: regionsView, leave: destroyMiniMaps });
  registerView('country', { enter: countryView, leave: destroyMiniMaps });
  registerView('region', { enter: regionView, leave: destroyMiniMaps });
  registerView('city', { enter: cityView, leave: destroyMiniMaps });
}
