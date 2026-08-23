
(function(){

  const TYPE_COLORS = {'indoor-bouldering':'#3fb8a6','top-rope':'#8a6bb0'};
  // `state` codes collide across countries (AU's WA = Western Australia, US's WA = Washington),
  // so country+state together identify a region — never key off `state` alone.
  const STATES_BY_COUNTRY = {
    AU: [['NSW','NSW'],['VIC','VIC'],['QLD','QLD'],['WA','WA'],['SA','SA'],['ACT','ACT'],['TAS','TAS'],['NT','NT']],
    US: [['CA','California'],['CO','Colorado'],['TX','Texas'],['WA','Washington'],['NY','New York'],['NV','Nevada'],
         ['GA','Georgia'],['UT','Utah'],['AL','Alabama'],['TN','Tennessee'],['MA','Massachusetts'],['IL','Illinois']],
    JP: [['TOKYO','Tokyo'],['OSAKA','Osaka'],['KYOTO','Kyoto'],['FUKUOKA','Fukuoka'],['AICHI','Aichi (Nagoya)'],
         ['KANAGAWA','Kanagawa (Yokohama)'],['HOKKAIDO','Hokkaido (Sapporo)'],['HYOGO','Hyogo (Kobe)']]
  };
  const TYPE_LABELS = {'indoor-bouldering':'Indoor bouldering','top-rope':'Top rope'};
  // Below this zoom, a spot with no nearby neighbours (so supercluster hands
  // it back as a lone, unclustered point rather than grouping it) still paints
  // as a small numbered badge instead of the hold-shaped icon -- at globe/
  // country zoom a 20px icon for a single far-off spot (e.g. Japan, viewed
  // from the default mid-Pacific camera) reads as a stray dot; a numbered
  // badge matches the visual language clusters already use and stays legible.
  const HOLD_ICON_ZOOM = 9;

  function typeSwatch(types){
    const colors = (types&&types.length?types:['indoor-bouldering']).map(t=>TYPE_COLORS[t]||'#999');
    if(colors.length === 1) return colors[0];
    const step = 100/colors.length;
    return `conic-gradient(${colors.map((c,i)=>`${c} ${i*step}% ${(i+1)*step}%`).join(', ')})`;
  }

  let spots = [];            // approved spot rows only — what the public map shows
  let usingFallback = false; // true if Supabase is unreachable/unconfigured and we fell back to the bundled seed data
  let climbedIds = new Set();
  let bookmarkedIds = new Set();
  let isModerator = false;
  let pendingSpots = [];  // new-spot submissions awaiting approval (moderator-only)
  let pendingEdits = [];  // proposed edits to live spots awaiting approval (moderator-only)

  let activeStates = new Set(['ALL']);
  let activeTypes = new Set(['indoor-bouldering','top-rope']);
  let showClimbedOnly = false;
  let showBookmarkedOnly = false;
  let searchTerm = '';
  let visibleIndex = {};    // id -> spot, for whatever currently passes filters (feeds the cluster index)
  let markerEls = {};       // id -> {marker, el} for individual spot markers currently painted on screen
  let clusterMarkers = {};  // cluster_id -> maplibregl.Marker for cluster badges currently painted
  let supercluster = null;
  let lastIconBucket = null; // 'icon' | 'number' | null -- which style ungrouped spot markers were last painted in
  let placingPin = null; // {lat,lng} while add-modal open
  let currentEditId = null;
  let currentEditPin = null; // {lat,lng} while edit-modal open
  let isPlacing = false;
  let placingMode = null; // 'add' | 'edit'

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
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-162, 10],
    zoom: 1.3,
    attributionControl: {compact: true}
  });
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
  });

  // MapLibre doesn't cluster arbitrary DOM markers itself, so supercluster
  // computes the groups; we repaint plain maplibregl.Marker elements for
  // whatever's in the current viewport on every 'moveend'.
  //
  // DOM markers are inherently a frame or two behind MapLibre's own WebGL
  // render loop while the camera is moving (a documented MapLibre/Mapbox GL
  // limitation, not something fixable from application code) — with ~100
  // markers that shows up as visible lag/jitter during a drag. We hide them
  // for the duration of the gesture (movestart→moveend) rather than let them
  // visibly trail the map, and skip repainting anything that's already
  // correctly on screen so the moveend repaint itself stays cheap.
  function rebuildClusterIndex(visibleSpots){
    visibleIndex = {};
    visibleSpots.forEach(g=>{ visibleIndex[g.id] = g; });
    supercluster = new Supercluster({radius:60, maxZoom:16}).load(visibleSpots.map(g=>({
      type: 'Feature',
      properties: {id: g.id},
      geometry: {type: 'Point', coordinates: [g.lng, g.lat]}
    })));
    // A rebuilt index hands out fresh cluster ids that can coincidentally
    // collide with old ones from the previous index but mean a different
    // group, so anything already painted has to go before we query it.
    clearPaintedMarkers();
    paintMarkers();
  }

  function clearPaintedMarkers(){
    Object.values(markerEls).forEach(e=>e.marker.remove());
    Object.values(clusterMarkers).forEach(m=>m.remove());
    markerEls = {};
    clusterMarkers = {};
  }

  function paintMarkers(){
    if(!supercluster) return;
    const b = map.getBounds();
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
    const zoom = Math.floor(map.getZoom());
    const iconBucket = zoom >= HOLD_ICON_ZOOM ? 'icon' : 'number';
    if(iconBucket !== lastIconBucket){
      // Crossed the icon/number threshold since the last paint -- every
      // already-painted spot marker (not cluster badge) is the wrong style
      // now, so drop them and let the loop below repaint fresh.
      Object.values(markerEls).forEach(e=>e.marker.remove());
      markerEls = {};
      lastIconBucket = iconBucket;
    }
    const seenClusters = new Set();
    const seenSpots = new Set();

    supercluster.getClusters(bbox, zoom).forEach(feature=>{
      const [lng, lat] = feature.geometry.coordinates;
      if(feature.properties.cluster){
        const clusterId = feature.properties.cluster_id;
        seenClusters.add(clusterId);
        if(clusterMarkers[clusterId]) return; // same index, same id => already correctly painted
        const count = feature.properties.point_count;
        const size = count < 10 ? 34 : count < 50 ? 42 : 50;
        const el = document.createElement('div');
        el.className = 'cluster-marker';
        el.style.width = size+'px';
        el.style.height = size+'px';
        el.textContent = count;
        el.addEventListener('click', ()=>{
          const targetZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 20);
          map.easeTo({center:[lng,lat], zoom: targetZoom});
        });
        clusterMarkers[clusterId] = new maplibregl.Marker({element: el}).setLngLat([lng,lat]).addTo(map);
      } else {
        const id = feature.properties.id;
        seenSpots.add(id);
        if(markerEls[id]) return; // already painted, leave it (mark state stays in sync via updateMarkUI)
        const g = visibleIndex[id];
        if(g) markerEls[id] = iconBucket === 'icon' ? buildSpotMarker(g) : buildSpotNumberMarker(g);
      }
    });

    Object.keys(clusterMarkers).forEach(idStr=>{
      if(!seenClusters.has(Number(idStr))){ clusterMarkers[idStr].remove(); delete clusterMarkers[idStr]; }
    });
    Object.keys(markerEls).forEach(id=>{
      if(!seenSpots.has(id)){ markerEls[id].marker.remove(); delete markerEls[id]; }
    });
  }
  map.on('moveend', paintMarkers);
  map.on('movestart', ()=> map.getContainer().classList.add('is-moving'));
  map.on('moveend', ()=> map.getContainer().classList.remove('is-moving'));

  function spotMarkerClasses(g){
    const cls = ['hold-marker'];
    if(g.community) cls.push('community');
    if(climbedIds.has(g.id)) cls.push('climbed');
    if(bookmarkedIds.has(g.id)) cls.push('bookmarked');
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
  function buildSpotNumberMarker(g){
    const el = document.createElement('div');
    el.className = 'cluster-marker spot-number-marker';
    el.style.width = '26px';
    el.style.height = '26px';
    el.style.background = typeSwatch(g.types);
    el.textContent = '1';
    el.addEventListener('click', ()=>{
      map.easeTo({center:[g.lng, g.lat], zoom: Math.max(map.getZoom()+3, HOLD_ICON_ZOOM)});
    });
    const marker = new maplibregl.Marker({element: el}).setLngLat([g.lng, g.lat]).addTo(map);
    return {marker, el, kind:'number'};
  }

  function passesFilters(g){
    if(!activeStates.has('ALL') && !activeStates.has(g.country+':'+g.state)) return false;
    if(!g.types.some(t=>activeTypes.has(t))) return false;
    if(showClimbedOnly && !climbedIds.has(g.id)) return false;
    if(showBookmarkedOnly && !bookmarkedIds.has(g.id)) return false;
    if(searchTerm){
      const hay = (g.name+' '+g.suburb).toLowerCase();
      if(!hay.includes(searchTerm)) return false;
    }
    return true;
  }

  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function popupHtml(g){
    const typeLabel = g.types.map(t=>TYPE_LABELS[t]).join(' · ');
    const climbed = climbedIds.has(g.id);
    const bookmarked = bookmarkedIds.has(g.id);
    return `${g.photo?`<img class="popup-photo" src="${escapeHtml(g.photo)}" alt="${escapeHtml(g.name)}" onerror="this.style.display='none'">`:''}
       <div class="popup-name">${escapeHtml(g.name)}</div>
       <div class="popup-meta">${escapeHtml(g.suburb)}, ${g.state} · ${typeLabel}${g.community?' · community-added':''}${g.edited?' · edited':''}</div>
       ${g.notes?`<div style="font-size:12px;color:var(--text-dim)">${escapeHtml(g.notes)}</div>`:''}
       <div class="popup-actions">
         <button class="mark-btn climbed-btn ${climbed?'active':''}" onclick="window.__toggleMark('${g.id}','climbed')">✓ Climbed</button>
         <button class="mark-btn bookmark-btn ${bookmarked?'active':''}" onclick="window.__toggleMark('${g.id}','bookmarked')">★ Save</button>
       </div>
       <button class="popup-edit-btn" onclick="window.__editSpot('${g.id}')">Edit this spot</button>`;
  }

  function render(){
    const list = document.getElementById('gymList');
    list.innerHTML='';
    const visible = spots.filter(passesFilters);
    document.getElementById('countNum').textContent = visible.length;

    if(visible.length === 0){
      list.innerHTML = '<div class="empty-state">No spots match. Try clearing filters or search.</div>';
    }

    visible.sort((a,b)=>a.name.localeCompare(b.name));
    visible.forEach(g=>{
      const climbed = climbedIds.has(g.id);
      const bookmarked = bookmarkedIds.has(g.id);

      const item = document.createElement('div');
      item.className = 'gym-item';
      item.dataset.id = g.id;
      item.innerHTML = `
        <div class="swatch" style="background:${typeSwatch(g.types)}"></div>
        <div class="info">
          <div class="name">${escapeHtml(g.name)}</div>
          <div class="meta">
            <span>${escapeHtml(g.suburb)}, ${g.state}</span>
            ${g.community?'<span class="tag-pill community">Community</span>':''}
            ${g.edited?'<span class="tag-pill edited">Edited</span>':''}
          </div>
        </div>
        <button class="mark-btn climbed-btn ${climbed?'active':''}" title="Mark as climbed" aria-label="Mark as climbed">✓</button>
        <button class="mark-btn bookmark-btn ${bookmarked?'active':''}" title="Bookmark" aria-label="Bookmark">★</button>
        <button class="edit-icon-btn" title="Edit this spot" aria-label="Edit this spot">✎</button>`;
      item.addEventListener('click', ()=>{
        const targetZoom = Math.max(map.getZoom(), 13);
        map.flyTo({center:[g.lng, g.lat], zoom: targetZoom, duration: 800});
        // paintMarkers() (bound to 'moveend' at setup, before this one-off
        // listener exists) runs first and repopulates markerEls for the new
        // viewport, so the lookup below sees the freshly painted marker.
        map.once('moveend', ()=>{
          const entry = markerEls[g.id];
          if(entry) entry.marker.togglePopup();
        });
        if(window.innerWidth <= 760) document.getElementById('sidebar').classList.remove('open');
      });
      item.querySelector('.edit-icon-btn').addEventListener('click', (ev)=>{
        ev.stopPropagation();
        openEditModal(g.id);
      });
      item.querySelector('.climbed-btn').addEventListener('click', (ev)=>{
        ev.stopPropagation();
        toggleMark(g.id, 'climbed');
      });
      item.querySelector('.bookmark-btn').addEventListener('click', (ev)=>{
        ev.stopPropagation();
        toggleMark(g.id, 'bookmarked');
      });
      list.appendChild(item);
    });

    rebuildClusterIndex(visible);
  }

  // Lightweight update for a single spot's mark state — avoids repainting every
  // marker (which would close any open popup) just because one star got clicked.
  function updateMarkUI(spotId){
    const g = spots.find(s=>s.id===spotId);
    if(!g) return;
    const entry = markerEls[spotId];
    if(entry && entry.kind === 'icon'){
      entry.el.className = spotMarkerClasses(g);
      const popup = entry.marker.getPopup();
      if(popup) popup.setHTML(popupHtml(g));
    }
    const item = document.querySelector(`.gym-item[data-id="${CSS.escape(spotId)}"]`);
    if(item){
      const cb = item.querySelector('.climbed-btn');
      const bb = item.querySelector('.bookmark-btn');
      if(cb) cb.classList.toggle('active', climbedIds.has(spotId));
      if(bb) bb.classList.toggle('active', bookmarkedIds.has(spotId));
    }
  }

  // --- filter controls ---
  document.getElementById('stateChips').addEventListener('click', (e)=>{
    const chip = e.target.closest('.chip');
    if(!chip) return;
    const state = chip.dataset.state;
    if(state === 'ALL'){
      activeStates = new Set(['ALL']);
    } else {
      const key = chip.dataset.country + ':' + state;
      activeStates.delete('ALL');
      if(activeStates.has(key)) activeStates.delete(key); else activeStates.add(key);
      if(activeStates.size === 0) activeStates = new Set(['ALL']);
    }
    document.querySelectorAll('.chip').forEach(c=>{
      const key = c.dataset.state === 'ALL' ? 'ALL' : c.dataset.country + ':' + c.dataset.state;
      c.classList.toggle('active', activeStates.has(key));
    });
    render();
  });

  document.getElementById('typeFilters').addEventListener('change', (e)=>{
    const input = e.target.closest('input[data-type]');
    if(!input) return;
    if(input.checked) activeTypes.add(input.dataset.type);
    else activeTypes.delete(input.dataset.type);
    render();
  });

  document.getElementById('marksFilters').addEventListener('change', (e)=>{
    if(e.target.id === 'filterClimbed') showClimbedOnly = e.target.checked;
    else if(e.target.id === 'filterBookmarked') showBookmarkedOnly = e.target.checked;
    else return;
    render();
  });

  document.getElementById('searchInput').addEventListener('input', (e)=>{
    searchTerm = e.target.value.trim().toLowerCase();
    render();
  });

  document.getElementById('mobileToggle').addEventListener('click', ()=>{
    document.getElementById('sidebar').classList.toggle('open');
  });

  // --- toast ---
  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 2400);
  }

  // --- auth UI ---
  const authWidget = document.getElementById('authWidget');
  const authModalBackdrop = document.getElementById('authModalBackdrop');
  const authStatus = document.getElementById('authStatus');
  const authEmailInput = document.getElementById('authEmail');

  function renderAuthUI(user){
    authWidget.innerHTML = user
      ? `<span class="auth-email" title="${escapeHtml(user.email||'')}">${escapeHtml(user.email||'Signed in')}</span><button class="auth-btn ghost" id="signOutBtn">Sign out</button>`
      : `<button class="auth-btn" id="signInBtn">Sign in</button>`;
    updateMarksFilterAvailability();
  }

  authWidget.addEventListener('click', (e)=>{
    if(e.target.id === 'signInBtn') openAuthModal();
    else if(e.target.id === 'signOutBtn'){
      window.auth.signOut();
      showToast('Signed out');
    }
  });

  function updateMarksFilterAvailability(){
    const signedIn = !!window.auth.user;
    const climbedFilter = document.getElementById('filterClimbed');
    const bookmarkedFilter = document.getElementById('filterBookmarked');
    [climbedFilter, bookmarkedFilter].forEach(el=>{
      if(!el) return;
      el.disabled = !signedIn;
      if(!signedIn && el.checked) el.checked = false;
    });
    if(!signedIn){ showClimbedOnly = false; showBookmarkedOnly = false; }
  }

  function openAuthModal(){
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    authStatus.textContent = '';
    authStatus.className = 'auth-status';
    authEmailInput.value = '';
    authModalBackdrop.classList.remove('hidden');
  }
  function closeAuthModal(){
    authModalBackdrop.classList.add('hidden');
  }
  document.getElementById('authCancelBtn').addEventListener('click', closeAuthModal);
  authModalBackdrop.addEventListener('click', (e)=>{
    if(e.target === authModalBackdrop) closeAuthModal();
  });

  document.getElementById('googleSignInBtn').addEventListener('click', async ()=>{
    try{
      await window.auth.signInWithGoogle();
    }catch(err){
      authStatus.textContent = 'Could not start Google sign-in.';
      authStatus.className = 'auth-status err';
      console.error(err);
    }
  });

  document.getElementById('sendMagicLinkBtn').addEventListener('click', async ()=>{
    const email = authEmailInput.value.trim();
    if(!email){
      authStatus.textContent = 'Enter your email first.';
      authStatus.className = 'auth-status err';
      return;
    }
    const btn = document.getElementById('sendMagicLinkBtn');
    btn.disabled = true;
    try{
      await window.auth.signInWithEmail(email);
      authStatus.textContent = 'Check your email for a sign-in link.';
      authStatus.className = 'auth-status ok';
    }catch(err){
      authStatus.textContent = 'Could not send the link — try again.';
      authStatus.className = 'auth-status err';
      console.error(err);
    }
    btn.disabled = false;
  });

  // --- climbed / bookmark marks ---
  async function toggleMark(spotId, markType){
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const user = window.auth.user;
    if(!user){ openAuthModal(); return; }
    const set = markType === 'climbed' ? climbedIds : bookmarkedIds;
    const wasActive = set.has(spotId);
    if(wasActive) set.delete(spotId); else set.add(spotId);
    if(showClimbedOnly || showBookmarkedOnly) render(); else updateMarkUI(spotId);
    try{
      if(wasActive){
        const {error} = await window.sb.from('marks').delete()
          .eq('user_id', user.id).eq('spot_id', spotId).eq('mark_type', markType);
        if(error) throw error;
      } else {
        const {error} = await window.sb.from('marks').insert({user_id:user.id, spot_id:spotId, mark_type:markType});
        if(error) throw error;
      }
    }catch(err){
      if(wasActive) set.add(spotId); else set.delete(spotId);
      if(showClimbedOnly || showBookmarkedOnly) render(); else updateMarkUI(spotId);
      showToast('Could not save — try again');
      console.error(err);
    }
  }
  window.__toggleMark = toggleMark;

  // --- country/state dropdowns (shared by add + edit forms) ---
  function populateStateSelect(stateSelectId, country){
    const sel = document.getElementById(stateSelectId);
    const prevValue = sel.value;
    sel.innerHTML = STATES_BY_COUNTRY[country].map(([code,label])=>`<option value="${code}">${label}</option>`).join('');
    if(STATES_BY_COUNTRY[country].some(([code])=>code===prevValue)) sel.value = prevValue;
  }
  document.getElementById('fCountry').addEventListener('change', (e)=>populateStateSelect('fState', e.target.value));
  document.getElementById('eCountry').addEventListener('change', (e)=>populateStateSelect('eState', e.target.value));

  // --- add gym flow ---
  const modalBackdrop = document.getElementById('modalBackdrop');
  const pinStatus = document.getElementById('pinStatus');
  const submitBtn = document.getElementById('submitBtn');
  const placingBanner = document.getElementById('placingBanner');
  const editModalBackdrop = document.getElementById('editModalBackdrop');
  const editPinStatus = document.getElementById('editPinStatus');

  document.getElementById('addBtn').addEventListener('click', ()=>{
    placingPin = null;
    submitBtn.disabled = true;
    pinStatus.textContent = 'No pin dropped yet — click "Drop pin" then tap the map.';
    pinStatus.classList.remove('set');
    ['fName','fSuburb','fNotes','fPhoto'].forEach(id=>document.getElementById(id).value='');
    ['fTypeIndoor','fTypeTopRope'].forEach(id=>document.getElementById(id).checked=false);
    document.getElementById('fCountry').value = 'AU';
    populateStateSelect('fState', 'AU');
    modalBackdrop.classList.remove('hidden');
  });

  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  function closeModal(){
    modalBackdrop.classList.add('hidden');
    stopPlacing();
  }

  document.getElementById('dropPinBtn').addEventListener('click', ()=>{
    modalBackdrop.classList.add('hidden');
    startPlacing('add');
  });

  function startPlacing(mode){
    placingMode = mode;
    isPlacing = true;
    placingBanner.classList.add('show');
    map.getContainer().style.cursor = 'crosshair';
  }
  function stopPlacing(){
    isPlacing = false;
    placingBanner.classList.remove('show');
    map.getContainer().style.cursor = '';
  }

  map.on('click', (e)=>{
    if(!isPlacing) return;
    const pt = {lat: e.lngLat.lat, lng: e.lngLat.lng};
    const mode = placingMode;
    stopPlacing();
    placingMode = null;
    if(mode === 'edit'){
      currentEditPin = pt;
      editPinStatus.textContent = `Pin set at ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}`;
      editPinStatus.classList.add('set');
      editModalBackdrop.classList.remove('hidden');
      checkEditFormReady();
    } else {
      placingPin = pt;
      pinStatus.textContent = `Pin set at ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}`;
      pinStatus.classList.add('set');
      modalBackdrop.classList.remove('hidden');
      checkFormReady();
    }
  });

  ['fName','fSuburb'].forEach(id=>{
    document.getElementById(id).addEventListener('input', checkFormReady);
  });
  ['fTypeIndoor','fTypeTopRope'].forEach(id=>{
    document.getElementById(id).addEventListener('change', checkFormReady);
  });
  function selectedTypes(){
    const map = {fTypeIndoor:'indoor-bouldering', fTypeTopRope:'top-rope'};
    return Object.keys(map).filter(id=>document.getElementById(id).checked).map(id=>map[id]);
  }
  function checkFormReady(){
    const name = document.getElementById('fName').value.trim();
    const suburb = document.getElementById('fSuburb').value.trim();
    submitBtn.disabled = !(name && suburb && placingPin && selectedTypes().length > 0);
  }

  document.getElementById('submitBtn').addEventListener('click', async ()=>{
    if(!placingPin) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const gym = {
      id: 'community-' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now()),
      name: document.getElementById('fName').value.trim(),
      suburb: document.getElementById('fSuburb').value.trim(),
      state: document.getElementById('fState').value,
      country: document.getElementById('fCountry').value,
      types: selectedTypes(),
      notes: document.getElementById('fNotes').value.trim() || null,
      photo: document.getElementById('fPhoto').value.trim() || null,
      lat: placingPin.lat,
      lng: placingPin.lng,
      community: true,
      edited: false,
      status: 'pending'
    };
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';
    try{
      const {error} = await window.sb.from('spots').insert(gym);
      if(error) throw error;
      showToast('Submitted — a moderator will review it before it appears on the map.');
      submitBtn.textContent = 'Add to map';
      closeModal();
    }catch(err){
      showToast('Could not save — try again');
      console.error(err);
      submitBtn.textContent = 'Add to map';
      submitBtn.disabled = false;
    }
  });

  // --- edit spot flow ---
  function openEditModal(id){
    const g = spots.find(x=>x.id===id);
    if(!g) return;
    currentEditId = id;
    currentEditPin = {lat: g.lat, lng: g.lng};
    document.getElementById('eName').value = g.name;
    document.getElementById('eSuburb').value = g.suburb;
    document.getElementById('eCountry').value = g.country;
    populateStateSelect('eState', g.country);
    document.getElementById('eState').value = g.state;
    document.getElementById('eNotes').value = g.notes || '';
    document.getElementById('ePhoto').value = g.photo || '';
    document.getElementById('eTypeIndoor').checked = g.types.includes('indoor-bouldering');
    document.getElementById('eTypeTopRope').checked = g.types.includes('top-rope');
    editPinStatus.textContent = `Current pin: ${g.lat.toFixed(4)}, ${g.lng.toFixed(4)}`;
    editPinStatus.classList.remove('set');
    // Revert only makes sense for un-edited-back-to seed spots — community
    // submissions have no "original" snapshot stored anywhere to revert to.
    const canRevert = g.edited && !g.community && (window.SEED_GYMS||[]).some(s=>s.id===id);
    document.getElementById('eRevertBtn').style.display = canRevert ? 'block' : 'none';
    checkEditFormReady();
    editModalBackdrop.classList.remove('hidden');
  }
  window.__editSpot = openEditModal;

  function closeEditModal(){
    editModalBackdrop.classList.add('hidden');
    stopPlacing();
    currentEditId = null;
  }
  document.getElementById('eCancelBtn').addEventListener('click', closeEditModal);

  document.getElementById('eDropPinBtn').addEventListener('click', ()=>{
    editModalBackdrop.classList.add('hidden');
    startPlacing('edit');
  });

  ['eName','eSuburb'].forEach(id=>{
    document.getElementById(id).addEventListener('input', checkEditFormReady);
  });
  ['eTypeIndoor','eTypeTopRope'].forEach(id=>{
    document.getElementById(id).addEventListener('change', checkEditFormReady);
  });
  function selectedEditTypes(){
    const map = {eTypeIndoor:'indoor-bouldering', eTypeTopRope:'top-rope'};
    return Object.keys(map).filter(id=>document.getElementById(id).checked).map(id=>map[id]);
  }
  function checkEditFormReady(){
    const name = document.getElementById('eName').value.trim();
    const suburb = document.getElementById('eSuburb').value.trim();
    document.getElementById('eSaveBtn').disabled = !(name && suburb && currentEditPin && selectedEditTypes().length > 0);
  }

  document.getElementById('eSaveBtn').addEventListener('click', async ()=>{
    if(!currentEditId || !currentEditPin) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const proposal = {
      spot_id: currentEditId,
      name: document.getElementById('eName').value.trim(),
      suburb: document.getElementById('eSuburb').value.trim(),
      state: document.getElementById('eState').value,
      country: document.getElementById('eCountry').value,
      types: selectedEditTypes(),
      notes: document.getElementById('eNotes').value.trim() || null,
      photo: document.getElementById('ePhoto').value.trim() || null,
      lat: currentEditPin.lat,
      lng: currentEditPin.lng
    };
    const saveBtn = document.getElementById('eSaveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    try{
      const {error} = await window.sb.from('pending_edits').insert(proposal);
      if(error) throw error;
      showToast('Edit submitted — a moderator will review it before it goes live.');
      saveBtn.textContent = 'Save changes';
      closeEditModal();
    }catch(err){
      showToast('Could not save — try again');
      console.error(err);
      saveBtn.textContent = 'Save changes';
      saveBtn.disabled = false;
    }
  });

  document.getElementById('eRevertBtn').addEventListener('click', async ()=>{
    if(!currentEditId) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const id = currentEditId;
    const original = (window.SEED_GYMS||[]).find(s=>s.id===id);
    if(!original){ showToast('No original data to revert to'); return; }
    const proposal = {
      spot_id: id,
      name: original.name, suburb: original.suburb, state: original.state, country: original.country,
      types: original.types, notes: original.notes || null, photo: original.photo || null,
      lat: original.lat, lng: original.lng
    };
    try{
      const {error} = await window.sb.from('pending_edits').insert(proposal);
      if(error) throw error;
      showToast('Revert submitted — a moderator will review it before it goes live.');
      closeEditModal();
    }catch(err){
      showToast('Could not submit revert — try again');
      console.error(err);
    }
  });

  // --- load spots + marks on start ---
  async function loadSpots(){
    if(window.sb){
      try{
        const {data, error} = await window.sb.from('spots').select('*').eq('status','approved');
        if(error) throw error;
        spots = data || [];
        usingFallback = false;
        return;
      }catch(err){
        console.error('Failed to load spots from Supabase', err);
      }
    }
    usingFallback = true;
    spots = (window.SEED_GYMS || []).slice();
  }

  async function checkModerator(){
    isModerator = false;
    const user = window.auth.user;
    if(!user || !window.sb) return;
    try{
      const {data, error} = await window.sb.from('moderators').select('user_id').eq('user_id', user.id).maybeSingle();
      if(error) throw error;
      isModerator = !!data;
    }catch(err){
      console.error('Failed to check moderator status', err);
    }
  }

  async function loadPending(){
    pendingSpots = [];
    pendingEdits = [];
    if(!isModerator || !window.sb) return;
    try{
      const [{data: pSpots, error: e1}, {data: pEdits, error: e2}] = await Promise.all([
        window.sb.from('spots').select('*').eq('status','pending'),
        window.sb.from('pending_edits').select('*')
      ]);
      if(e1) throw e1;
      if(e2) throw e2;
      pendingSpots = pSpots || [];
      pendingEdits = pEdits || [];
    }catch(err){
      console.error('Failed to load pending items', err);
    }
  }

  async function loadMarks(){
    climbedIds = new Set();
    bookmarkedIds = new Set();
    const user = window.auth.user;
    if(!user || !window.sb) return;
    try{
      const {data, error} = await window.sb.from('marks').select('spot_id, mark_type').eq('user_id', user.id);
      if(error) throw error;
      (data||[]).forEach(m=>{
        if(m.mark_type === 'climbed') climbedIds.add(m.spot_id);
        else if(m.mark_type === 'bookmarked') bookmarkedIds.add(m.spot_id);
      });
    }catch(err){
      console.error('Failed to load marks', err);
    }
  }

  // --- moderation: pending review panel ---
  const pendingModalBackdrop = document.getElementById('pendingModalBackdrop');
  const pendingReviewBtn = document.getElementById('pendingReviewBtn');

  function renderPendingBadge(){
    if(!isModerator){
      pendingReviewBtn.style.display = 'none';
      return;
    }
    const count = pendingSpots.length + pendingEdits.length;
    pendingReviewBtn.style.display = '';
    pendingReviewBtn.textContent = count ? `Pending review (${count})` : 'Pending review';
  }

  function renderPendingPanel(){
    const list = document.getElementById('pendingList');
    const cards = [];
    pendingSpots.forEach(g=>{
      cards.push(`<div class="pending-item">
        <div class="pending-kind">New spot</div>
        <div class="popup-name">${escapeHtml(g.name)}</div>
        <div class="popup-meta">${escapeHtml(g.suburb)}, ${g.state} (${g.country}) · ${g.types.map(t=>TYPE_LABELS[t]||t).join(' · ')}</div>
        ${g.notes?`<div class="pending-notes">${escapeHtml(g.notes)}</div>`:''}
        ${g.photo?`<div class="pending-notes">Photo: <a href="${escapeHtml(g.photo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(g.photo)}</a></div>`:''}
        <div class="pending-actions">
          <button class="btn-cancel pending-reject" data-kind="spot" data-id="${g.id}">Reject</button>
          <button class="btn-submit pending-approve" data-kind="spot" data-id="${g.id}">Approve</button>
        </div>
      </div>`);
    });
    pendingEdits.forEach(pe=>{
      const target = spots.find(s=>s.id===pe.spot_id) || (window.SEED_GYMS||[]).find(s=>s.id===pe.spot_id);
      cards.push(`<div class="pending-item">
        <div class="pending-kind">Edit to ${escapeHtml(target?target.name:pe.spot_id)}</div>
        <div class="popup-name">${escapeHtml(pe.name)}</div>
        <div class="popup-meta">${escapeHtml(pe.suburb)}, ${pe.state} (${pe.country}) · ${pe.types.map(t=>TYPE_LABELS[t]||t).join(' · ')}</div>
        ${pe.notes?`<div class="pending-notes">${escapeHtml(pe.notes)}</div>`:''}
        ${pe.photo?`<div class="pending-notes">Photo: <a href="${escapeHtml(pe.photo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(pe.photo)}</a></div>`:''}
        <div class="pending-actions">
          <button class="btn-cancel pending-reject" data-kind="edit" data-id="${pe.id}">Reject</button>
          <button class="btn-submit pending-approve" data-kind="edit" data-id="${pe.id}">Approve</button>
        </div>
      </div>`);
    });
    list.innerHTML = cards.length ? cards.join('') : '<div class="empty-state">Nothing pending review.</div>';
  }

  function openPendingModal(){
    renderPendingPanel();
    pendingModalBackdrop.classList.remove('hidden');
  }
  pendingReviewBtn.addEventListener('click', openPendingModal);

  async function refreshAfterModeration(){
    await loadSpots();
    await loadPending();
    renderPendingPanel();
    renderPendingBadge();
    render();
  }

  async function approveSpot(id){
    try{
      const {error} = await window.sb.from('spots').update({status:'approved'}).eq('id', id);
      if(error) throw error;
      showToast('Spot approved ✓');
    }catch(err){
      showToast('Could not approve — try again');
      console.error(err);
    }
    await refreshAfterModeration();
  }

  async function rejectSpot(id){
    try{
      const {error} = await window.sb.from('spots').delete().eq('id', id);
      if(error) throw error;
      showToast('Spot rejected');
    }catch(err){
      showToast('Could not reject — try again');
      console.error(err);
    }
    await refreshAfterModeration();
  }

  async function approveEdit(pendingEditId){
    const pe = pendingEdits.find(p=>p.id===pendingEditId);
    if(!pe) return;
    try{
      const {error: e1} = await window.sb.from('spots').update({
        name: pe.name, suburb: pe.suburb, state: pe.state, country: pe.country,
        types: pe.types, notes: pe.notes, photo: pe.photo, lat: pe.lat, lng: pe.lng,
        edited: true, updated_at: new Date().toISOString()
      }).eq('id', pe.spot_id);
      if(e1) throw e1;
      const {error: e2} = await window.sb.from('pending_edits').delete().eq('id', pe.id);
      if(e2) throw e2;
      showToast('Edit approved ✓');
    }catch(err){
      showToast('Could not approve edit — try again');
      console.error(err);
    }
    await refreshAfterModeration();
  }

  async function rejectEdit(pendingEditId){
    try{
      const {error} = await window.sb.from('pending_edits').delete().eq('id', pendingEditId);
      if(error) throw error;
      showToast('Edit rejected');
    }catch(err){
      showToast('Could not reject — try again');
      console.error(err);
    }
    await refreshAfterModeration();
  }

  document.getElementById('pendingList').addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const kind = btn.dataset.kind;
    const id = btn.dataset.id;
    if(btn.classList.contains('pending-approve')){
      btn.closest('.pending-actions').querySelectorAll('button').forEach(b=>b.disabled=true);
      if(kind === 'spot') approveSpot(id); else approveEdit(id);
    } else if(btn.classList.contains('pending-reject')){
      btn.closest('.pending-actions').querySelectorAll('button').forEach(b=>b.disabled=true);
      if(kind === 'spot') rejectSpot(id); else rejectEdit(id);
    }
  });

  async function init(){
    await window.auth.init();
    window.auth.onChange(async (user)=>{
      renderAuthUI(user);
      await loadMarks();
      await checkModerator();
      await loadPending();
      renderPendingBadge();
      render();
      if(user) closeAuthModal();
    });
    await loadSpots();
    await loadMarks();
    await checkModerator();
    await loadPending();
    renderAuthUI(window.auth.user);
    renderPendingBadge();
    render();
    if(usingFallback){
      document.getElementById('offlineBanner').classList.remove('hidden');
    }
  }

  // --- info modals: about / privacy / terms ---
  const infoModals = {
    openAbout: 'aboutModalBackdrop',
    openPrivacy: 'privacyModalBackdrop',
    openTerms: 'termsModalBackdrop'
  };
  Object.keys(infoModals).forEach(btnId=>{
    document.getElementById(btnId).addEventListener('click', ()=>{
      document.getElementById(infoModals[btnId]).classList.remove('hidden');
    });
  });
  document.querySelectorAll('.info-close').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.target.closest('.modal-backdrop').classList.add('hidden');
    });
  });
  ['aboutModalBackdrop','privacyModalBackdrop','termsModalBackdrop','pendingModalBackdrop'].forEach(id=>{
    document.getElementById(id).addEventListener('click', (e)=>{
      if(e.target.id === id) e.target.classList.add('hidden');
    });
  });

  init();
})();
