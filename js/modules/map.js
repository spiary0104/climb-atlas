// MapLibre map: globe setup, clustering, region/country/continent labels, markers, popups, legend, first-visit hint.
import { CONTINENT_LABEL_ZOOM, COUNTRY_LABELS, COUNTRY_LABEL_ZOOM, COUNTRY_TO_REGION, HOLD_ICON_ZOOM, REGION_FLY_TARGETS, REGION_LABELS, TYPE_LABELS, motion } from './constants.js';
import { STATES_BY_COUNTRY } from './regions.js';
import { appState } from './state.js';
import { directionsUrl, escapeHtml, typeSwatch } from './utils.js';

// Fixed starting view, not a fitBounds-to-data fit: AU and US spots sit on
// opposite sides of the Pacific, and LngLatBounds.extend() just tracks
// min/max longitude, so a bounds box built across both countries spans the
// long way round through Africa instead of the short way across the
// Pacific -- fitBounds then centers the camera there, zoomed in past the
// point where either country's spots are still in view (this is what
// silently produced zero markers on load before it was removed). Centered
// mid-Pacific/near-equatorial instead so both AU and US sit reasonably
// in view of the globe at a low zoom.
// Style is CARTO's free, keyless "Dark Matter" vector basemap — the GL
// sibling of the same dark tiles this app already used, so the globe keeps
// the existing look instead of picking up a new visual identity.
//
// The globe's on-screen diameter scales with 2^zoom (~490px at zoom 1.3),
// so a fixed zoom is tiny on a wide desktop and clipped on a phone. Pick
// the zoom that fills ~85% of the map's shorter side instead, clamped so
// it never starts so close the globe reads as a flat map.
function initialZoom(){
  const el = document.getElementById('map');
  const side = Math.min(el.clientWidth, el.clientHeight) || 600;
  return Math.min(2.4, Math.max(0.6, 1.3 + Math.log2(side * 0.85 / 490)));
}
export const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [-162, 10],
  zoom: initialZoom(),
  attributionControl: {compact: true}
});

// MapLibre doesn't cluster arbitrary DOM markers itself, so supercluster
// computes the groups; we repaint plain maplibregl.Marker elements for
// whatever's in the current viewport on every 'moveend'.
//
// DOM markers are inherently a frame or two behind MapLibre's own WebGL
// render loop while the camera is moving (a documented MapLibre/Mapbox GL
// limitation, not something fixable from application code) — an earlier
// version of this hid every marker for the gesture's duration to avoid
// that lag being visible, but on the globe projection that gesture is
// also how you spin the globe, so markers vanishing mid-drag read as
// broken rather than intentional. Per explicit user preference, markers
// now stay visible (and briefly lag the camera) during a drag/rotate
// instead of disappearing. We still skip repainting anything that's
// already correctly on screen so the moveend repaint itself stays cheap.
export function rebuildClusterIndex(visibleSpots){
  appState.visibleIndex = {};
  visibleSpots.forEach(g=>{ appState.visibleIndex[g.id] = g; });
  appState.supercluster = new Supercluster({radius:60, maxZoom:16}).load(visibleSpots.map(g=>({
    type: 'Feature',
    properties: {id: g.id},
    geometry: {type: 'Point', coordinates: [g.lng, g.lat]}
  })));
  appState.regionCentroids = computeRegionCentroids(visibleSpots);
  appState.countryCentroids = computeCountryCentroids(visibleSpots);
  appState.continentCentroids = computeContinentCentroids(visibleSpots);
  // A rebuilt index hands out fresh cluster ids that can coincidentally
  // collide with old ones from the previous index but mean a different
  // group, so anything already painted has to go before we query it.
  clearPaintedMarkers();
  paintMarkers();
}

// One label point per (country,state) that currently has at least one
// visible spot -- the centroid of that region's own spots, not anything
// geographically authoritative. Keeps each region's spot count too, used
// by paintMarkers() to decide which label wins when two overlap on screen.
function computeRegionCentroids(visibleSpots){
  const sums = {};
  visibleSpots.forEach(g=>{
    const key = g.country+':'+g.state;
    if(!sums[key]) sums[key] = {latSum:0, lngSum:0, count:0, country:g.country, state:g.state};
    sums[key].latSum += g.lat;
    sums[key].lngSum += g.lng;
    sums[key].count++;
  });
  const centroids = {};
  Object.entries(sums).forEach(([key, s])=>{
    centroids[key] = {lat: s.latSum/s.count, lng: s.lngSum/s.count, country: s.country, state: s.state, count: s.count};
  });
  return centroids;
}

// One label point per country, same idea as computeRegionCentroids but
// one tier coarser -- shown at a wider zoom, before individual states/
// prefectures/cities are worth distinguishing (see COUNTRY_LABEL_ZOOM).
function computeCountryCentroids(visibleSpots){
  const sums = {};
  visibleSpots.forEach(g=>{
    if(!sums[g.country]) sums[g.country] = {latSum:0, lngSum:0, count:0, country:g.country};
    sums[g.country].latSum += g.lat;
    sums[g.country].lngSum += g.lng;
    sums[g.country].count++;
  });
  const centroids = {};
  Object.entries(sums).forEach(([country, s])=>{
    centroids[country] = {lat: s.latSum/s.count, lng: s.lngSum/s.count, country, count: s.count};
  });
  return centroids;
}

// One label point per continent/region, one tier coarser again -- shown
// at true globe zoom, before individual countries are worth telling
// apart (see CONTINENT_LABEL_ZOOM). A spot whose country isn't in
// COUNTRY_TO_REGION (e.g. one submitted via the "Other (not listed)"
// country option, ahead of that country formally getting continent
// support) is skipped here rather than guessed into a region.
function computeContinentCentroids(visibleSpots){
  const sums = {};
  visibleSpots.forEach(g=>{
    const region = COUNTRY_TO_REGION[g.country];
    if(!region) return;
    if(!sums[region]) sums[region] = {latSum:0, lngSum:0, count:0, region};
    sums[region].latSum += g.lat;
    sums[region].lngSum += g.lng;
    sums[region].count++;
  });
  const centroids = {};
  Object.entries(sums).forEach(([region, s])=>{
    centroids[region] = {lat: s.latSum/s.count, lng: s.lngSum/s.count, region, count: s.count};
  });
  return centroids;
}

export function stateLabel(country, state){
  const entry = (STATES_BY_COUNTRY[country]||[]).find(([code])=>code===state);
  return entry ? entry[1] : state;
}

function clearPaintedMarkers(){
  Object.values(appState.markerEls).forEach(e=>e.marker.remove());
  Object.values(appState.clusterMarkers).forEach(m=>m.remove());
  Object.values(appState.regionLabelMarkers).forEach(m=>m.remove());
  appState.markerEls = {};
  appState.clusterMarkers = {};
  appState.regionLabelMarkers = {};
}

function paintMarkers(){
  if(!appState.supercluster) return;
  const b = map.getBounds();
  const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
  const zoom = Math.floor(map.getZoom());
  const iconBucket = zoom >= HOLD_ICON_ZOOM ? 'icon' : 'number';
  if(iconBucket !== appState.lastIconBucket){
    // Crossed the icon/number threshold since the last paint -- every
    // already-painted spot marker (not cluster badge) is the wrong style
    // now, so drop them and let the loop below repaint fresh.
    Object.values(appState.markerEls).forEach(e=>e.marker.remove());
    appState.markerEls = {};
    appState.lastIconBucket = iconBucket;
  }
  const seenClusters = new Set();
  const seenSpots = new Set();

  appState.supercluster.getClusters(bbox, zoom).forEach(feature=>{
    const [lng, lat] = feature.geometry.coordinates;
    if(feature.properties.cluster){
      const clusterId = feature.properties.cluster_id;
      seenClusters.add(clusterId);
      if(appState.clusterMarkers[clusterId]) return; // same index, same id => already correctly painted
      const count = feature.properties.point_count;
      const size = count < 10 ? 34 : count < 50 ? 42 : 50;
      const el = document.createElement('div');
      el.className = 'cluster-marker';
      el.style.width = size+'px';
      el.style.height = size+'px';
      el.textContent = count;
      el.addEventListener('click', ()=>{
        const targetZoom = Math.min(appState.supercluster.getClusterExpansionZoom(clusterId), 20);
        map.easeTo({center:[lng,lat], zoom: targetZoom, duration: motion(500)});
      });
      appState.clusterMarkers[clusterId] = new maplibregl.Marker({element: el}).setLngLat([lng,lat]).addTo(map);
    } else {
      const id = feature.properties.id;
      seenSpots.add(id);
      if(appState.markerEls[id]) return; // already painted, leave it (mark state stays in sync via updateMarkUI)
      const g = appState.visibleIndex[id];
      if(g) appState.markerEls[id] = iconBucket === 'icon' ? buildSpotMarker(g) : buildSpotNumberMarker(g);
    }
  });

  Object.keys(appState.clusterMarkers).forEach(idStr=>{
    if(!seenClusters.has(Number(idStr))){ appState.clusterMarkers[idStr].remove(); delete appState.clusterMarkers[idStr]; }
  });
  Object.keys(appState.markerEls).forEach(id=>{
    if(!seenSpots.has(id)){ appState.markerEls[id].marker.remove(); delete appState.markerEls[id]; }
  });

  // Three-tier basic labels, same "zoomed out" window as the numbered
  // badges -- once real markers take over (zoom >= HOLD_ICON_ZOOM) labels
  // aren't needed, you can already see individual gyms. Below
  // CONTINENT_LABEL_ZOOM (true globe view) labels show the continent name
  // (e.g. "Europe") -- at that zoom several countries on the same
  // continent are usually still too close together on screen to be worth
  // distinguishing, and a continent name orients a viewer fastest. From
  // CONTINENT_LABEL_ZOOM up to COUNTRY_LABEL_ZOOM, labels switch to the
  // country tier (e.g. "Germany"); from COUNTRY_LABEL_ZOOM up to
  // HOLD_ICON_ZOOM, the finer state/prefecture/city tier, same as before.
  // Each tier is keyed off a disjoint id space (region id / bare country
  // code / "country:state") and only one tier's candidates are ever fed
  // into `source` below, so a given label (e.g. "Germany") is sourced
  // from exactly one centroid and can never be painted twice at once --
  // the collision-avoidance pass below only ever discards a *contested*
  // candidate in favour of another, never paints the same key twice.
  //
  // Nearby regions (e.g. AU's NSW/ACT/VIC, or several European countries
  // at globe zoom) can project to almost the same screen point while
  // still zoomed out, which would read as garbled/overlapping text.
  // Collision avoidance: project every in-view candidate to screen space,
  // let the region with more visible spots win a contested spot, and skip
  // (not paint) any candidate that lands within MIN_LABEL_SPACING px of an
  // already-accepted label -- same idea as label collision detection in
  // any map renderer, just done by hand since these are plain DOM markers.
  const MIN_LABEL_SPACING = 55;
  const showLabels = zoom < HOLD_ICON_ZOOM;
  const showContinentTier = zoom < CONTINENT_LABEL_ZOOM;
  const showCountryTier = !showContinentTier && zoom < COUNTRY_LABEL_ZOOM;
  const seenLabels = new Set();
  if(showLabels){
    const source = showContinentTier ? appState.continentCentroids : showCountryTier ? appState.countryCentroids : appState.regionCentroids;
    const candidates = Object.entries(source)
      .filter(([,c])=> !(c.lng < bbox[0] || c.lng > bbox[2] || c.lat < bbox[1] || c.lat > bbox[3]))
      .map(([key,c])=>({key, c, pt: map.project([c.lng, c.lat])}))
      .sort((a,b)=> b.c.count - a.c.count);
    const accepted = [];
    candidates.forEach(cand=>{
      const collides = accepted.some(a=>{
        const dx = a.pt.x - cand.pt.x, dy = a.pt.y - cand.pt.y;
        return Math.sqrt(dx*dx + dy*dy) < MIN_LABEL_SPACING;
      });
      if(collides) return;
      accepted.push(cand);
      seenLabels.add(cand.key);
      if(appState.regionLabelMarkers[cand.key]) return;
      const el = document.createElement('div');
      el.className = 'region-label';
      if(showContinentTier){
        el.textContent = REGION_LABELS[cand.c.region] || cand.c.region;
        el.classList.add('continent-label');
        // Continent labels are the only tier with pointer-events enabled
        // (see the .continent-label CSS rule) -- clicking one flies the
        // globe to that continent, same idea as clicking a country's
        // sidebar label already does for COUNTRY_FLY_TARGETS.
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
      // Offset below the badge that would otherwise sit at this same
      // point, so the label doesn't sit directly on top of it.
      appState.regionLabelMarkers[cand.key] = new maplibregl.Marker({element: el, offset: [0, 24]}).setLngLat([cand.c.lng, cand.c.lat]).addTo(map);
    });
  }
  Object.keys(appState.regionLabelMarkers).forEach(key=>{
    if(!showLabels || !seenLabels.has(key)){ appState.regionLabelMarkers[key].remove(); delete appState.regionLabelMarkers[key]; }
  });
}

export function spotMarkerClasses(g){
  const cls = ['hold-marker'];
  if(g.community) cls.push('community');
  if(appState.climbedIds.has(g.id)) cls.push('climbed');
  if(appState.bookmarkedIds.has(g.id)) cls.push('bookmarked');
  return cls.join(' ');
}

function buildSpotMarker(g){
  const el = document.createElement('div');
  el.className = spotMarkerClasses(g);
  el.style.width = '20px';
  el.style.height = '20px';
  el.style.background = typeSwatch(g.types);
  // Popup HTML is built lazily on first open, not here — this runs once per
  // marker on every viewport repaint, and most painted markers never get
  // clicked.
  const popup = new maplibregl.Popup({offset: 14, maxWidth: '240px'});
  popup.on('open', ()=> popup.setHTML(popupHtml(g)));
  const marker = new maplibregl.Marker({element: el}).setLngLat([g.lng, g.lat]).setPopup(popup).addTo(map);
  return {marker, el, kind:'icon'};
}

// Zoomed-out stand-in for a lone spot marker -- see HOLD_ICON_ZOOM. No
// popup (nothing to show beyond what the badge already implies); clicking
// zooms in far enough to flip it over to the real hold-shaped marker.
// Deliberately styled identically to a real cluster badge (same size,
// same neutral colour) rather than colour-coded by type -- while zoomed
// out it should read as "one more badge on the globe", indistinguishable
// from an actual cluster except for the "1", not a visually distinct
// third marker style.
function buildSpotNumberMarker(g){
  const el = document.createElement('div');
  el.className = 'cluster-marker spot-number-marker';
  el.style.width = '34px';
  el.style.height = '34px';
  el.textContent = '1';
  el.addEventListener('click', ()=>{
    map.easeTo({center:[g.lng, g.lat], zoom: Math.max(map.getZoom()+3, HOLD_ICON_ZOOM), duration: motion(500)});
  });
  const marker = new maplibregl.Marker({element: el}).setLngLat([g.lng, g.lat]).addTo(map);
  return {marker, el, kind:'number'};
}

export function popupHtml(g){
  const typeLabel = g.types.map(t=>TYPE_LABELS[t]).join(' · ');
  const climbed = appState.climbedIds.has(g.id);
  const bookmarked = appState.bookmarkedIds.has(g.id);
  return `${g.photo?`<img class="popup-photo" src="${escapeHtml(g.photo)}" alt="${escapeHtml(g.name)}" onerror="this.style.display='none'">`:''}
       <div class="popup-name">${escapeHtml(g.name)}</div>
       <div class="popup-meta">${escapeHtml(g.suburb)}, ${escapeHtml(stateLabel(g.country, g.state))} · ${typeLabel}${g.community?' · community-added':''}${g.edited?' · edited':''}</div>
       ${g.address?`<div class="popup-address">${escapeHtml(g.address)}</div>`:''}
       ${g.notes?`<div style="font-size:12px;color:var(--text-dim)">${escapeHtml(g.notes)}</div>`:''}
       <div class="popup-actions">
         <button class="mark-btn climbed-btn ${climbed?'active':''}" onclick="window.__toggleMark('${g.id}','climbed')">✓ Climbed</button>
         <button class="mark-btn bookmark-btn ${bookmarked?'active':''}" onclick="window.__toggleMark('${g.id}','bookmarked')">★ Save</button>
       </div>
       <div class="popup-links">
         <a class="popup-directions-btn" href="${directionsUrl(g)}" target="_blank" rel="noopener noreferrer">📍 Directions</a>
         <button class="popup-edit-btn" onclick="window.__editSpot('${g.id}')">Edit this spot</button>
       </div>
       <button class="popup-report-btn" onclick="window.__reportSpot('${g.id}')">⚑ Report incorrect info</button>`;
}

// Collapsed by default on narrow viewports, since the full legend text
// otherwise eats a meaningful chunk of a small map -- still expandable
// on tap, and left expanded by default on desktop where there's room.
const legendEl = document.getElementById('legend');

export function initMap(){
  map.addControl(new maplibregl.NavigationControl({showCompass:false}), 'top-right');

  map.once('style.load', ()=>{
    map.setProjection({type:'globe'});
    try{
      // Tinted to the app's own warm dark palette rather than the default sky
      // blue, so the atmosphere glow reads as "this app" and not a generic
      // Mapbox/MapLibre demo.
      map.setSky({
        'sky-color': '#0d0b09',
        'sky-horizon-blend': 0.5,
        'horizon-color': '#3a2a1a',
        'horizon-fog-blend': 0.6,
        'fog-color': '#211f1b',
        'fog-ground-blend': 0.7,
        'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0]
      });
    }catch(err){
      console.warn('Sky/atmosphere not supported in this MapLibre build', err);
    }
    try{
      // CARTO's Dark Matter style ships "roadname_major" (its own major/
      // arterial road name labels) at text-color #383838 -- a near-black
      // dark grey, on a #111 halo, over an already-dark basemap. Every
      // other road tier in the same style (roadname_pri/sec/minor) uses a
      // light grey (rgb ~146-189) that reads fine; roadname_major is the
      // one tier that's essentially invisible, which is backwards since
      // it's the most prominent road class. This looks like an upstream
      // styling gap in CARTO's own style rather than anything intentional
      // -- confirmed by reading the loaded style's actual paint properties
      // (`map.getStyle().layers`), not guessed. Brightened to match the
      // other tiers instead of leaving major roads unreadable.
      map.setPaintProperty('roadname_major', 'text-color', '#c8c8c8');
    }catch(err){
      console.warn('roadname_major layer not found in this basemap style', err);
    }
    try{
      // The basemap's own continent / country / state labels duplicate the
      // three label tiers this app paints (see paintMarkers) -- at globe
      // zoom that put "NORTH AMERICA" next to "North America". Hide the
      // continent layer outright and push the country/state layers up past
      // the zooms where the app's own equivalents are showing.
      map.setLayoutProperty('place_continent', 'visibility', 'none');
      map.setLayerZoomRange('place_country_1', COUNTRY_LABEL_ZOOM, 7);
      map.setLayerZoomRange('place_country_2', COUNTRY_LABEL_ZOOM, 10);
      map.setLayerZoomRange('place_state', HOLD_ICON_ZOOM, 10);
    }catch(err){
      console.warn('Basemap place-label layers not found in this style', err);
    }
  });
  map.on('moveend', paintMarkers);
  if(window.innerWidth <= 760) legendEl.classList.add('collapsed');
  document.getElementById('legendToggle').addEventListener('click', ()=>{
    const collapsed = legendEl.classList.toggle('collapsed');
    document.getElementById('legendToggle').setAttribute('aria-expanded', String(!collapsed));
  });

  // First-visit hint: shown once per browser (a plain boolean flag, nothing
  // personal), dismissed by its own close button, any real interaction with
  // the map, or a timeout -- never blocks anything else. localStorage reads/
  // writes are wrapped since private-browsing modes can throw on access.
  (function initFirstVisitHint(){
    const hintBanner = document.getElementById('hintBanner');
    let hintSeen = true;
    try{ hintSeen = localStorage.getItem('climbatlas_hint_seen') === '1'; }catch(err){ /* ignore */ }
    if(hintSeen) return;
    function dismissHint(){
      hintBanner.classList.remove('show');
      try{ localStorage.setItem('climbatlas_hint_seen', '1'); }catch(err){ /* ignore */ }
    }
    hintBanner.classList.add('show');
    document.getElementById('hintDismiss').addEventListener('click', dismissHint);
    map.once('click', dismissHint);
    map.once('dragstart', dismissHint);
    map.once('zoomstart', dismissHint);
    setTimeout(dismissHint, 10000);
  })();
}
