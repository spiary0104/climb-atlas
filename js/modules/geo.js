// Pure geometry and Explore-state helpers (no DOM, no MapLibre), unit-tested in tests/explore-pure.test.js.
//   distanceKm / formatDistance     the list's distance column (DESIGN.md sec. 7.4)
//   boundsOf / inBounds             viewport scoping, antimeridian-safe (sec. 7.2)
//   viewBox / fitCamera             a camera's box / the camera for a box (Web Mercator; the map before MapLibre loads)
//   stackOffsets                    deterministic spread for gyms that share one coordinate (sec. 7.8)
//   encodeExploreState / decode...  the ?q=&c=lng,lat,z&t=… query state (sec. 6.2)
//   fold / wordStarts               case- and diacritic-insensitive matching (sec. 9.1)

const R_KM = 6371;
const rad = d => d * Math.PI / 180;

export function distanceKm(a, b){
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// 0.35 -> "350 m", 4.26 -> "4.3 km", 12.7 -> "13 km", 1204 -> "1,204 km"
export function formatDistance(km){
  if(!Number.isFinite(km)) return '';
  if(km < 1) return Math.max(10, Math.round(km * 100) * 10) + ' m';
  if(km < 10) return km.toFixed(1) + ' km';
  return Math.round(km).toLocaleString('en-US') + ' km';
}

const wrapLng = lng => lng >= -180 && lng <= 180 ? lng : ((((lng + 180) % 360) + 360) % 360) - 180;

// A plain {west, south, east, north} box. A view wider than the world covers every longitude; a view across the
// antimeridian keeps west > east after wrapping, and inBounds() handles that case.
export function boundsOf(west, south, east, north){
  if(east - west >= 360) return { west: -180, south, east: 180, north };
  return { west: wrapLng(west), south, east: wrapLng(east), north };
}

export function inBounds(p, b){
  if(!b) return true;
  if(p.lat < b.south || p.lat > b.north) return false;
  const lng = wrapLng(p.lng);
  return b.west <= b.east ? (lng >= b.west && lng <= b.east) : (lng >= b.west || lng <= b.east);
}

// Gyms at exactly the same coordinate (41 groups in the data) would sit on top of each other forever. Each member of a
// group gets a fixed pixel offset on a small circle, ordered by id so the layout is the same on every paint and every
// device. Returns Map(id -> [dx, dy]); singletons are absent.
export function stackOffsets(spots, radiusPx = 12){
  const groups = new Map();
  for(const g of spots){
    const key = Number(g.lat).toFixed(6) + ',' + Number(g.lng).toFixed(6);
    if(!groups.has(key)) groups.set(key, []);
    groups.get(key).push(g.id);
  }
  const out = new Map();
  for(const ids of groups.values()){
    if(ids.length < 2) continue;
    ids.sort();
    const r = radiusPx * (ids.length > 6 ? 1.5 : 1);
    ids.forEach((id, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / ids.length;
      out.set(id, [Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r)]);
    });
  }
  return out;
}

// ----- query state ----------------------------------------------------------------------------------------------
export const TYPE_CODES = { 'indoor-bouldering': 'boulder', 'top-rope': 'toprope', 'lead-climbing': 'lead' };
export const ALL_TYPES = Object.keys(TYPE_CODES);
const CODE_TYPES = Object.fromEntries(Object.entries(TYPE_CODES).map(([k, v]) => [v, k]));

// state: {camera:{lng,lat,zoom}|null, types:string[] (full type ids), saved, climbed, photos, open, place:string|null, q:string}
export function encodeExploreState(state){
  const p = new URLSearchParams();
  if(state.q) p.set('q', state.q);
  if(state.place) p.set('place', state.place);
  if(state.camera){
    const { lng, lat, zoom } = state.camera;
    p.set('c', [wrapLng(lng).toFixed(4), lat.toFixed(4), zoom.toFixed(2)].join(','));
  }
  const types = ALL_TYPES.filter(t => (state.types || ALL_TYPES).includes(t));
  if(types.length && types.length < ALL_TYPES.length) p.set('t', types.map(t => TYPE_CODES[t]).join(','));
  if(state.saved) p.set('saved', '1');
  if(state.climbed) p.set('climbed', '1');
  if(state.photos) p.set('photos', '1');
  if(state.open) p.set('open', '1');
  return p.toString().replace(/%2C/g, ',').replace(/%3A/g, ':').replace(/%7E/g, '~');   // "~" marks a metro place ("AU:NSW:~sydney")
}

const num = (v, lo, hi) => { const n = Number(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };

// Anything malformed is dropped, never thrown: the query string is user-controlled.
export function decodeExploreState(search){
  const p = new URLSearchParams(search || '');
  const out = { camera: null, types: ALL_TYPES.slice(), saved: p.get('saved') === '1', climbed: p.get('climbed') === '1',
    photos: p.get('photos') === '1', open: p.get('open') === '1', place: null, q: (p.get('q') || '').slice(0, 100) };
  const c = (p.get('c') || '').split(',');
  if(c.length === 3){
    const lng = num(c[0], -540, 540), lat = num(c[1], -85, 85), zoom = num(c[2], 0, 22);
    if(lng !== null && lat !== null && zoom !== null) out.camera = { lng: wrapLng(lng), lat, zoom };
  }
  if(p.has('t')){
    const types = [...new Set(p.get('t').split(',').map(s => CODE_TYPES[s]).filter(Boolean))];
    if(types.length) out.types = types;
  }
  const place = p.get('place');
  if(place && place.length <= 200 && /^[A-Z]{2,5}(:[^:]+(:.+)?)?$/.test(place)) out.place = place;
  return out;
}

// ----- text matching --------------------------------------------------------------------------------------------
// "München" -> "munchen", "Île-de-France" -> "ile-de-france". Also folds full-width forms (NFKD).
export function fold(s){
  return String(s == null ? '' : s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
// Word starts for prefix matching: "Blochaus Marrickville" -> ["blochaus", "marrickville"]. Marks stay inside a word (NFKD
// splits a kana like ボ into ホ + a voicing mark; both the index and the query fold the same way).
export function wordStarts(s){
  return fold(s).split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
}


const mercY = lat => Math.log(Math.tan(Math.PI / 4 + Math.max(-85, Math.min(85, lat)) * Math.PI / 360));
const latOfY = y => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI;

// Centre and zoom that fit a {west,south,east,north} box into a width x height px map (Web Mercator), clamped.
// tileSize 512 is MapLibre's own zoom scale (map.js); region pages keep the 256 they were tuned with.
export function fitCamera(b, width, height, { minZoom = 2, maxZoom = 13, padding = 24, tileSize = 256 } = {}){
  const lngSpan = Math.max(1e-6, b.east - b.west);
  const ySpan = Math.max(1e-9, mercY(b.north) - mercY(b.south));
  const w = Math.max(1, width - padding * 2), h = Math.max(1, height - padding * 2);
  const zx = Math.log2(w * 360 / (tileSize * lngSpan));
  const zy = Math.log2(h * 2 * Math.PI / (tileSize * ySpan));
  const zoom = Math.max(minZoom, Math.min(maxZoom, Math.min(zx, zy)));
  const lat = latOfY((mercY(b.north) + mercY(b.south)) / 2);
  return { lng: (b.west + b.east) / 2, lat, zoom: Math.round(zoom * 100) / 100 };
}

// The box a width x height px view shows around {lng, lat, zoom} on a flat Web Mercator map (MapLibre's 512 px world at
// zoom 0). map.js scopes the list with it until MapLibre has loaded. It is what a new MapLibre map reports too (the globe
// is switched on at style load); from zoom 7 up the globe agrees within ~3%, further out it shows more.
export function viewBox({ lng, lat, zoom }, width, height){
  const world = 512 * 2 ** zoom;
  const halfLng = width / 2 / world * 360, halfY = height / 2 / world * 2 * Math.PI, y = mercY(lat);
  return boundsOf(lng - halfLng, latOfY(y - halfY), lng + halfLng, latOfY(y + halfY));
}
