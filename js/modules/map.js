// MapLibre map (DESIGN.md sec. 7.7-7.8): globe setup, supercluster clusters, type-colour pins, region/country/continent
// labels, the locate control. Knows nothing about the list: explore.js registers handlers (setMapHandlers) and drives
// selection through refreshPin().
// MapLibre itself (270 KB) loads after the gym list (startMap, from main.js), so it never delays the list or a page.
// Until it is there, `map` below stands in for it: it holds the camera, answers getZoom/getCenter/viewBounds from it and
// queues event listeners; from then on every call goes to the real map.
import { CONTINENT_LABEL_ZOOM, COUNTRY_FLY_TARGETS, COUNTRY_LABELS, COUNTRY_LABEL_ZOOM, COUNTRY_TO_REGION, HOLD_ICON_ZOOM, PIN_DOT_MAX_ZOOM, REGION_FLY_TARGETS, REGION_LABELS, TYPE_LABELS, motion } from './constants.js';
import { boundsOf, decodeExploreState, fitCamera, stackOffsets, viewBox } from './geo.js';
import { pinSvg } from './pin-html.js';
import { STATES_BY_COUNTRY } from './regions.js';
import { appState } from './state.js';

export const LAST_CAMERA_KEY = 'bouldeer_last_camera';

// Pinned like the stylesheet in index.html (same version; tests/perf-load.test.js checks both).
const MAPLIBRE_SRC = 'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js';
const MAPLIBRE_SRI = 'sha384-5+cfbwT0iiub6VsQAdn6yz16nr6sDiQoHx6tm4O8OVYXHYOxcffFmCJBL0dgdvGp';
let libraryLoad = null;
// The MapLibre library, loaded once on first use (Explore after the list, a page's mini map, /add). Rejects when it cannot
// be downloaded (offline before it was ever cached); a later call tries again.
export function mapLibrary(){
  if(window.maplibregl) return Promise.resolve(window.maplibregl);
  if(!libraryLoad) libraryLoad = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = MAPLIBRE_SRC; s.integrity = MAPLIBRE_SRI; s.crossOrigin = 'anonymous';
    s.onload = () => window.maplibregl ? resolve(window.maplibregl) : reject(new Error('MapLibre did not define maplibregl'));
    s.onerror = () => { libraryLoad = null; s.remove(); reject(new Error('Could not download MapLibre')); };
    document.head.appendChild(s);
  });
  return libraryLoad;
}

// Landing (sec. 19 decision 5): the camera in the URL, else the last camera on this device. The home-country fallback
// needs the gym data, so explore.js applies it after loading; until then the globe is framed as a world view.
function savedCamera(){
  const fromUrl = decodeExploreState(location.search).camera;
  if(fromUrl) return fromUrl;
  try{
    const c = JSON.parse(localStorage.getItem(LAST_CAMERA_KEY) || 'null');
    if(c && [c.lng, c.lat, c.zoom].every(Number.isFinite)) return c;
  }catch(err){ /* private mode or a malformed value: fall through */ }
  return null;
}
export const landingCamera = savedCamera();

// The globe's on-screen diameter scales with 2^zoom (~490px at zoom 1.3), so a fixed zoom is tiny on a wide desktop and
// clipped on a phone. Pick the zoom that fills ~85% of the map's shorter side instead, clamped so it never starts so
// close the globe reads as a flat map.
export function worldZoom(){
  const el = document.getElementById('map');
  const side = Math.min(el.clientWidth, el.clientHeight) || 600;
  return Math.min(2.4, Math.max(0.6, 1.3 + Math.log2(side * 0.85 / 490)));
}
// Style is CARTO's free, keyless "Dark Matter" vector basemap (kept per sec. 16.1; the rock theme sits on it).
export const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
// Document pages (gym, region, city) show small maps on paper: CARTO Positron recoloured to the paper tokens (paperBasemap).
export const PAPER_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

let gl = null;                                   // the MapLibre map, once startMap has made it
const listeners = [];                            // [type, fn] registered through map.on, attached to the real map too
const waiting = [];                              // whenMap callbacks
// The camera before the map exists. zoom null = the world view, sized to the map element when it is first read.
const cam = landingCamera ? { lng: landingCamera.lng, lat: landingCamera.lat, zoom: landingCamera.zoom } : { lng: -162, lat: 10, zoom: null };
const camZoom = () => cam.zoom ?? worldZoom();
const mapSize = () => { const el = document.getElementById('map'); return [el.clientWidth, el.clientHeight]; };
// A camera move before the map exists lands at once (no animation to show) and reports 'moveend', as MapLibre's jumpTo does.
function moveCam(o){
  if(o.center){ const [lng, lat] = Array.isArray(o.center) ? o.center : [o.center.lng, o.center.lat]; Object.assign(cam, { lng, lat }); }
  if(Number.isFinite(o.zoom)) cam.zoom = o.zoom;
  listeners.filter(([type]) => type === 'moveend').forEach(([, fn]) => fn({}));
}
export const map = {
  getZoom: () => gl ? gl.getZoom() : camZoom(),
  getCenter: () => gl ? gl.getCenter() : { lng: cam.lng, lat: cam.lat },
  jumpTo: o => gl ? gl.jumpTo(o) : moveCam(o),
  flyTo: o => gl ? gl.flyTo(o) : moveCam(o),
  easeTo: o => gl ? gl.easeTo(o) : moveCam(o),
  fitBounds(b, o = {}){
    if(gl) return gl.fitBounds(b, o);
    const [w, h] = mapSize(), c = fitCamera({ west: b[0][0], south: b[0][1], east: b[1][0], north: b[1][1] }, w, h,
      { minZoom: 0, maxZoom: o.maxZoom ?? 22, padding: Number.isFinite(o.padding) ? o.padding : 0, tileSize: 512 });
    moveCam({ center: [c.lng, c.lat], zoom: c.zoom });
  },
  resize(){ if(gl) gl.resize(); },
  getContainer: () => document.getElementById('map'),
  on(type, fn){ listeners.push([type, fn]); if(gl) gl.on(type, fn); },
};
// fn(realMap) once the MapLibre map exists (at once if it already does).
export function whenMap(fn){ if(gl) fn(gl); else waiting.push(fn); }

// explore.js supplies these; defaults keep the map usable on its own.
const handlers = {
  onPinClick(){}, onPinHover(){}, onMapClick(){}, onLocate(){}, onLocateError(){},
  onClusterClick({lngLat, clusterId}){ map.easeTo({center: lngLat, zoom: clusterExpansionZoom(clusterId), duration: motion(500)}); },
};
export function setMapHandlers(h){ Object.assign(handlers, h); }

export function viewBounds(){
  if(!gl){ const [w, h] = mapSize(); return viewBox({ lng: cam.lng, lat: cam.lat, zoom: camZoom() }, w, h); }
  const b = gl.getBounds();
  return boundsOf(b.getWest(), b.getSouth(), b.getEast(), b.getNorth());
}

export function stateLabel(country, state){
  const entry = (STATES_BY_COUNTRY[country]||[]).find(([code])=>code===state);
  return entry ? entry[1] : state;
}

// MapLibre doesn't cluster arbitrary DOM markers itself, so supercluster computes the groups (radius 48, maxZoom 15 so
// individual pins are guaranteed above it, sec. 7.8); plain maplibregl.Marker elements are repainted for whatever is in
// the viewport on every 'moveend'. DOM markers lag the WebGL camera by a frame or two mid-gesture (a MapLibre limitation);
// they stay visible while dragging, by the owner's earlier preference. Anything already correctly on screen is kept.
export function rebuildClusterIndex(spots){
  appState.visibleIndex = {};
  spots.forEach(g=>{ appState.visibleIndex[g.id] = g; });
  appState.supercluster = new Supercluster({radius:48, maxZoom:15}).load(spots.map(g=>({
    type: 'Feature',
    properties: {id: g.id},
    geometry: {type: 'Point', coordinates: [g.lng, g.lat]}
  })));
  appState.stackOffsets = stackOffsets(spots);
  appState.regionCentroids = centroids(spots, g=>g.country+':'+g.state, g=>({country:g.country, state:g.state}));
  appState.countryCentroids = centroids(spots, g=>g.country, g=>({country:g.country}));
  // A spot whose country isn't in COUNTRY_TO_REGION (an "Other (not listed)" submission) is skipped, not guessed.
  appState.continentCentroids = centroids(spots.filter(g=>COUNTRY_TO_REGION[g.country]), g=>COUNTRY_TO_REGION[g.country], g=>({region:COUNTRY_TO_REGION[g.country]}));
  // A rebuilt index hands out fresh cluster ids that can collide with old ones but mean a different group.
  clearPaintedMarkers();
  paintMarkers();
}

// One label point per group (region / country / continent) with at least one visible spot: the centroid of that group's
// own spots, not anything geographically authoritative. The count decides which label wins a collision.
function centroids(spots, keyOf, extra){
  const sums = {};
  spots.forEach(g=>{
    const key = keyOf(g);
    if(!sums[key]) sums[key] = {latSum:0, lngSum:0, count:0, ...extra(g)};
    sums[key].latSum += g.lat; sums[key].lngSum += g.lng; sums[key].count++;
  });
  const out = {};
  Object.entries(sums).forEach(([key, s])=>{
    const {latSum, lngSum, ...rest} = s;
    out[key] = {...rest, lat: latSum/s.count, lng: lngSum/s.count};
  });
  return out;
}

export const clusterExpansionZoom = id => Math.min(appState.supercluster.getClusterExpansionZoom(id), 20);
export const clusterLeafIds = (id, limit = 20) => appState.supercluster.getLeaves(id, limit).map(f=>f.properties.id);

function clearPaintedMarkers(){
  Object.values(appState.markerEls).forEach(e=>e.marker.remove());
  Object.values(appState.clusterMarkers).forEach(m=>m.remove());
  Object.values(appState.regionLabelMarkers).forEach(m=>m.remove());
  appState.markerEls = {};
  appState.clusterMarkers = {};
  appState.regionLabelMarkers = {};
}

const pinKindAt = zoom => Math.floor(zoom) <= PIN_DOT_MAX_ZOOM ? 'dot' : 'teardrop';

export function paintMarkers(){
  if(!appState.supercluster || !gl) return;     // startMap paints once the map exists
  const b = gl.getBounds();
  const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
  const zoom = Math.floor(gl.getZoom());
  const kind = pinKindAt(gl.getZoom());
  if(kind !== appState.lastPinKind){
    // Crossed the dot/teardrop threshold: every painted pin has the wrong shape and anchor now.
    Object.values(appState.markerEls).forEach(e=>e.marker.remove());
    appState.markerEls = {};
    appState.lastPinKind = kind;
  }
  const seenClusters = new Set();
  const seenSpots = new Set();

  appState.supercluster.getClusters(bbox, zoom).forEach(feature=>{
    const [lng, lat] = feature.geometry.coordinates;
    if(feature.properties.cluster){
      const clusterId = feature.properties.cluster_id;
      seenClusters.add(clusterId);
      if(appState.clusterMarkers[clusterId]) return; // same index, same id => already correctly painted
      appState.clusterMarkers[clusterId] = buildClusterMarker(clusterId, feature.properties.point_count, [lng, lat]);
    } else {
      const id = feature.properties.id;
      seenSpots.add(id);
      if(appState.markerEls[id]) return; // already painted; state changes go through refreshPin()
      const g = appState.visibleIndex[id];
      if(g) appState.markerEls[id] = buildPin(g, kind);
    }
  });
  // The selected gym keeps its pin even while its neighbours are still clustered (a row click flies to zoom 13, which can
  // still be inside a cluster in dense cities).
  const sel = appState.selectedId;
  if(sel && appState.visibleIndex[sel] && !seenSpots.has(sel)){
    seenSpots.add(sel);
    if(!appState.markerEls[sel]) appState.markerEls[sel] = buildPin(appState.visibleIndex[sel], kind);
  }

  Object.keys(appState.clusterMarkers).forEach(idStr=>{
    if(!seenClusters.has(Number(idStr))){ appState.clusterMarkers[idStr].remove(); delete appState.clusterMarkers[idStr]; }
  });
  Object.keys(appState.markerEls).forEach(id=>{
    if(!seenSpots.has(id)){ appState.markerEls[id].marker.remove(); delete appState.markerEls[id]; }
  });
  paintRegionLabels(bbox, zoom);
}

// Three label tiers while zoomed out (continent < CONTINENT_LABEL_ZOOM <= country < COUNTRY_LABEL_ZOOM <= state/city <
// HOLD_ICON_ZOOM). Each tier has its own key space and only one tier is fed in at a time, so a label is never painted
// twice. Nearby labels can project onto almost the same point: candidates are projected to screen space, the one with more
// visible gyms wins, and any candidate within MIN_LABEL_SPACING px of an accepted label is skipped.
function paintRegionLabels(bbox, zoom){
  const MIN_LABEL_SPACING = 55;
  const showLabels = zoom < HOLD_ICON_ZOOM;
  const showContinentTier = zoom < CONTINENT_LABEL_ZOOM;
  const showCountryTier = !showContinentTier && zoom < COUNTRY_LABEL_ZOOM;
  const seenLabels = new Set();
  if(showLabels){
    const source = showContinentTier ? appState.continentCentroids : showCountryTier ? appState.countryCentroids : appState.regionCentroids;
    const candidates = Object.entries(source)
      .filter(([,c])=> !(c.lng < bbox[0] || c.lng > bbox[2] || c.lat < bbox[1] || c.lat > bbox[3]))
      .map(([key,c])=>({key, c, pt: gl.project([c.lng, c.lat])}))
      .sort((a,b)=> b.c.count - a.c.count);
    const accepted = [];
    candidates.forEach(cand=>{
      if(accepted.some(a=>Math.hypot(a.pt.x - cand.pt.x, a.pt.y - cand.pt.y) < MIN_LABEL_SPACING)) return;
      accepted.push(cand);
      seenLabels.add(cand.key);
      if(appState.regionLabelMarkers[cand.key]) return;
      const el = document.createElement('div');
      el.className = 'region-label';
      if(showContinentTier){
        el.textContent = REGION_LABELS[cand.c.region] || cand.c.region;
        el.classList.add('continent-label');
        // The one clickable tier: flies the globe to that continent.
        el.addEventListener('click', ()=>{
          const target = REGION_FLY_TARGETS[cand.c.region];
          if(target) map.flyTo({center: target.center, zoom: target.zoom, duration: motion(1500)});
        });
      } else if(showCountryTier){
        el.textContent = COUNTRY_LABELS[cand.c.country] || cand.c.country;
        el.classList.add('country-tier-label');
      } else {
        el.textContent = stateLabel(cand.c.country, cand.c.state);
        el.classList.add('state-tier-label');
      }
      // Offset below the cluster disc that usually sits at this same point.
      appState.regionLabelMarkers[cand.key] = new maplibregl.Marker({element: el, offset: [0, 24]}).setLngLat([cand.c.lng, cand.c.lat]).addTo(gl);
    });
  }
  Object.keys(appState.regionLabelMarkers).forEach(key=>{
    if(!showLabels || !seenLabels.has(key)){ appState.regionLabelMarkers[key].remove(); delete appState.regionLabelMarkers[key]; }
  });
}

// Paper disc with an ink count; no colour by content (sec. 7.8). Click: explore.js decides (zoom in; carousel on mobile).
function buildClusterMarker(clusterId, count, lngLat){
  const el = document.createElement('div');
  el.className = count > 99 ? 'cluster-marker is-large' : 'cluster-marker';
  el.textContent = count;
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', count + ' gyms');
  el.addEventListener('click', ()=> handlers.onClusterClick({clusterId, lngLat, count}));
  return new maplibregl.Marker({element: el}).setLngLat(lngLat).addTo(gl);
}

function pinState(id){
  return {
    selected: id === appState.selectedId || id === appState.hoverId,
    saved: appState.bookmarkedIds.has(id),
    climbed: appState.climbedIds.has(id),
  };
}

function paintPin(entry, g){
  const st = pinState(g.id);
  entry.el.innerHTML = pinSvg({kind: entry.kind, types: g.types, ...st});
  entry.el.classList.toggle('is-selected', g.id === appState.selectedId);
  entry.el.classList.toggle('is-hover', g.id === appState.hoverId && g.id !== appState.selectedId);
  // Selected teardrops carry the name label (sec. 7.7: labels only on selected until pins move to a symbol layer).
  if(entry.kind === 'teardrop' && g.id === appState.selectedId){
    const label = document.createElement('span');
    label.className = 'pin-label';
    label.dataset.theme = 'paper';          // a paper object over the rock map
    label.textContent = g.name;
    entry.el.appendChild(label);
  }
}

function buildPin(g, kind){
  const el = document.createElement('div');
  el.className = 'pin pin--' + kind;
  el.dataset.id = g.id;
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', [g.name, (g.types||[]).map(t=>TYPE_LABELS[t]||t).join(', '), g.suburb].filter(Boolean).join(', '));
  el.addEventListener('click', ()=> handlers.onPinClick(g.id));
  el.addEventListener('mouseenter', ()=> handlers.onPinHover(g.id));
  el.addEventListener('mouseleave', ()=> handlers.onPinHover(null));
  const offset = appState.stackOffsets.get(g.id) || [0, 0];
  const marker = new maplibregl.Marker({element: el, anchor: kind === 'dot' ? 'center' : 'bottom', offset}).setLngLat([g.lng, g.lat]).addTo(gl);
  const entry = {marker, el, kind};
  paintPin(entry, g);
  return entry;
}

// Repaint one pin after its selection/hover/mark state changed (cheap: one SVG string).
export function refreshPin(id){
  const entry = id && appState.markerEls[id];
  const g = id && appState.visibleIndex[id];
  if(entry && g) paintPin(entry, g);
}

// Search result: countries use their curated fly target; regions and cities fit their gyms' bounds (sec. 9.3).
export function flyToPlace(place){
  const target = place.kind === 'country' && COUNTRY_FLY_TARGETS[place.country];
  if(target){ map.flyTo({center: target.center, zoom: target.zoom, duration: motion(1500)}); return; }
  const b = place.bounds;
  if(!b) return;
  if(b.east - b.west < 0.02 && b.north - b.south < 0.02){
    map.flyTo({center:[(b.west+b.east)/2, (b.south+b.north)/2], zoom: 13, duration: motion(1200)});
  } else {
    map.fitBounds([[b.west, b.south], [b.east, b.north]], {padding: 48, maxZoom: 13, duration: motion(1200)});
  }
}

// Read a design token (css/tokens.css) as a literal colour for MapLibre paint properties, which cannot take CSS variables.
function cssToken(name){
  return getComputedStyle(document.getElementById('main')).getPropertyValue(name).trim();
}

// Warm dark basemap (owner decision 2026-09-26, sec. 0.4 optional enhancement): CARTO Dark Matter is neutral grey with
// blue water and roads. Every fill/line/background colour keeps its lightness and alpha but takes the hue and saturation
// of --map-tint; nothing gets darker than --map-canvas. The map stays rock-dark (DNA #1); labels are untouched.
const colourCtx = document.createElement('canvas').getContext('2d');
function toHsla(colour){
  colourCtx.fillStyle = 'transparent'; colourCtx.fillStyle = colour;   // the canvas normalises any CSS colour (an invalid one leaves the reset)
  const n = colourCtx.fillStyle.match(/[\d.]+/g) || [];
  let r, g, b, a = 1;
  if(colourCtx.fillStyle[0] === '#'){ const h = colourCtx.fillStyle; r = parseInt(h.slice(1, 3), 16); g = parseInt(h.slice(3, 5), 16); b = parseInt(h.slice(5, 7), 16); }
  else [r, g, b, a = 1] = n.map(Number);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const h = d === 0 ? 0 : max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  return {h: (h + 360) % 360, s, l, a};
}
export function warmBasemap(target = gl){
  const tint = toHsla(cssToken('--map-tint')), floor = toHsla(cssToken('--map-canvas')).l;
  const warm = c => {
    if(typeof c !== 'string' || c === 'transparent') return c;
    const {l, a} = toHsla(c);
    if(a === 0) return c;
    return `hsla(${tint.h.toFixed(1)}, ${(tint.s * 100).toFixed(1)}%, ${(Math.max(l, floor) * 100).toFixed(1)}%, ${a})`;
  };
  for(const layer of target.getStyle().layers){
    if(!['background', 'fill', 'line'].includes(layer.type)) continue;
    const prop = layer.type + '-color';
    const v = target.getPaintProperty(layer.id, prop);
    if(typeof v === 'string') target.setPaintProperty(layer.id, prop, warm(v));
    else if(v && Array.isArray(v.stops)) target.setPaintProperty(layer.id, prop, {...v, stops: v.stops.map(([z, c]) => [z, warm(c)])});
  }
}

// Paper-toned basemap for the mini maps on document pages (Brand Pass, sec. 8): Positron's light greys take the warm hue
// of --map-paper-tint and sit just under --map-paper-land; white roads become --map-paper-road, water --map-paper-water,
// labels --map-paper-label on a land-coloured halo. Explore keeps the dark map (warmBasemap).
export function paperBasemap(target){
  const tint = toHsla(cssToken('--map-paper-tint')), land = toHsla(cssToken('--map-paper-land')).l;
  const road = cssToken('--map-paper-road'), water = cssToken('--map-paper-water');
  const label = cssToken('--map-paper-label'), halo = cssToken('--map-paper-land');
  const paper = c => {
    if(typeof c !== 'string' || c === 'transparent') return c;
    const {l, a} = toHsla(c);
    if(a === 0) return c;
    if(l > 0.995) return road;
    return `hsla(${tint.h.toFixed(1)}, ${Math.min(tint.s * 100, 35).toFixed(1)}%, ${(Math.max(0, land - (1 - l) * 0.9) * 100).toFixed(1)}%, ${a})`;
  };
  const each = (v, f) => typeof v === 'string' ? f(v) : (v && Array.isArray(v.stops) ? {...v, stops: v.stops.map(([z, c]) => [z, f(c)])} : v);
  for(const layer of target.getStyle().layers){
    if(layer.type === 'symbol'){
      if(target.getPaintProperty(layer.id, 'text-color') !== undefined) target.setPaintProperty(layer.id, 'text-color', label);
      if(target.getPaintProperty(layer.id, 'text-halo-color') !== undefined) target.setPaintProperty(layer.id, 'text-halo-color', halo);
      continue;
    }
    if(!['background', 'fill', 'line'].includes(layer.type)) continue;
    const prop = layer.type + '-color';
    const v = target.getPaintProperty(layer.id, prop);
    const isWater = /water/.test(layer.id) && layer.type !== 'line';
    const next = each(v, c => isWater ? water : paper(c));
    if(next !== v) target.setPaintProperty(layer.id, prop, next);
  }
}

// Listeners that do not need the real map yet: pins repaint on every move, an empty-map click clears the selection.
export function initMap(){
  map.on('moveend', paintMarkers);
  // A click on empty map clears the selection (sec. 7.3). Clicks on pins/clusters/labels bubble here too: ignore them.
  map.on('click', (e)=>{
    if(appState.isPlacing) return;
    const t = e.originalEvent && e.originalEvent.target;
    if(t && t.closest && t.closest('.pin, .cluster-marker, .region-label')) return;
    handlers.onMapClick();
  });
}

// Loads MapLibre and makes the Explore map at the camera held so far (main.js calls it once the gym list is in).
export function startMap(){
  return mapLibrary().then(lib => {
    if(gl) return;
    gl = new lib.Map({
      container: 'map',
      style: BASEMAP_STYLE,
      center: [cam.lng, cam.lat],
      zoom: camZoom(),
      attributionControl: {compact: true}
    });
    setUpMap(lib);
    listeners.forEach(([type, fn]) => gl.on(type, fn));
    clearPaintedMarkers();
    paintMarkers();
    waiting.splice(0).forEach(fn => fn(gl));
  }).catch(err => console.warn('The map could not load; the list still works', err));
}

function setUpMap(lib){
  gl.addControl(new lib.NavigationControl({showCompass:false}), 'bottom-right');
  // Location is never requested on load (sec. 19 decision 5); this control asks when the visitor taps it.
  const locate = new lib.GeolocateControl({positionOptions:{enableHighAccuracy:false, timeout:10000}, trackUserLocation:false, showAccuracyCircle:false});
  gl.addControl(locate, 'bottom-right');
  locate.on('geolocate', (e)=> handlers.onLocate({lat: e.coords.latitude, lng: e.coords.longitude}));
  locate.on('error', ()=> handlers.onLocateError());

  gl.once('style.load', ()=>{
    gl.setProjection({type:'globe'});
    try{ warmBasemap(); }catch(err){ console.warn('Could not warm the basemap colours', err); }
    try{
      // Atmosphere tinted to the rock palette rather than the default sky blue.
      gl.setSky({
        'sky-color': cssToken('--map-sky'),
        'sky-horizon-blend': 0.5,
        'horizon-color': cssToken('--map-horizon'),
        'horizon-fog-blend': 0.6,
        'fog-color': cssToken('--map-fog'),
        'fog-ground-blend': 0.7,
        'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0]
      });
    }catch(err){
      console.warn('Sky/atmosphere not supported in this MapLibre build', err);
    }
    try{
      // CARTO's Dark Matter ships "roadname_major" at a near-black #383838 on a #111 halo -- the one road-label tier that
      // is unreadable (checked against map.getStyle().layers). Brightened to match the other tiers.
      gl.setPaintProperty('roadname_major', 'text-color', cssToken('--map-road-label'));
    }catch(err){
      console.warn('roadname_major layer not found in this basemap style', err);
    }
    try{
      // The basemap's continent/country/state labels duplicate the app's own label tiers (paintRegionLabels): hide the
      // continent layer and push the country/state layers past the zooms where the app's equivalents show.
      gl.setLayoutProperty('place_continent', 'visibility', 'none');
      gl.setLayerZoomRange('place_country_1', COUNTRY_LABEL_ZOOM, 7);
      gl.setLayerZoomRange('place_country_2', COUNTRY_LABEL_ZOOM, 10);
      gl.setLayerZoomRange('place_state', HOLD_ICON_ZOOM, 10);
    }catch(err){
      console.warn('Basemap place-label layers not found in this style', err);
    }
  });
}
