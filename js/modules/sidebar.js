// Sidebar list + filters (state chips, types, marks, search), header nav, Saved button, climbed/bookmark marks.
import { openAuthModal } from './auth-ui.js';
import { COUNTRY_FLY_TARGETS, COUNTRY_LABELS, REGION_FLY_TARGETS, motion } from './constants.js';
import { map, popupHtml, rebuildClusterIndex, spotMarkerClasses, stateLabel } from './map.js';
import { openEditModal, openReportModal } from './modals.js';
import { appState } from './state.js';
import { escapeHtml, showToast, typeSwatch } from './utils.js';

function passesFilters(g){
  if(!appState.activeStates.has('ALL') && !appState.activeStates.has(g.country+':'+g.state)) return false;
  if(!g.types.some(t=>appState.activeTypes.has(t))) return false;
  if(appState.showClimbedOnly && !appState.climbedIds.has(g.id)) return false;
  if(appState.showBookmarkedOnly && !appState.bookmarkedIds.has(g.id)) return false;
  if(appState.searchTerm){
    // Matches name/suburb as before, plus state/country by both their raw
    // code (e.g. "NSW", "JP") and human-readable label (e.g. "New South
    // Wales" -- well, just "NSW" here since AU doesn't expand, but
    // "United States", "Japan", etc. do) so typing a country or state name
    // finds every spot in it, not just ones whose suburb happens to match.
    const hay = [g.name, g.suburb, g.state, stateLabel(g.country, g.state), g.country, COUNTRY_LABELS[g.country]]
      .join(' ').toLowerCase();
    if(!hay.includes(appState.searchTerm)) return false;
  }
  return true;
}

export function render(){
  const list = document.getElementById('gymList');
  list.innerHTML='';
  const visible = appState.spots.filter(passesFilters);
  document.getElementById('countNum').textContent = visible.length;

  if(visible.length === 0){
    list.innerHTML = `<div class="empty-state">
        <p>No spots match these filters.</p>
        <button type="button" class="btn btn-outline clear-filters">Clear filters</button>
      </div>`;
  } else {
    visible.sort((a,b)=>a.name.localeCompare(b.name));
    visible.forEach(g=>{
      const climbed = appState.climbedIds.has(g.id);
      const bookmarked = appState.bookmarkedIds.has(g.id);
      const region = stateLabel(g.country, g.state);
      const country = COUNTRY_LABELS[g.country] || g.country;

      const item = document.createElement('div');
      item.className = 'gym-item';
      item.dataset.id = g.id;
      item.innerHTML = `
          <button type="button" class="gym-main" title="${escapeHtml(g.suburb)}, ${escapeHtml(region)}, ${escapeHtml(country)}">
            <span class="swatch" style="background:${typeSwatch(g.types)}" aria-hidden="true"></span>
            <span class="info">
              <span class="name">${escapeHtml(g.name)}</span>
              <span class="meta">
                <span class="place">${escapeHtml(g.suburb)}</span>
                <span class="region">${escapeHtml(region)}${region !== country ? ' · ' + escapeHtml(country) : ''}</span>
                ${g.community?'<span class="tag-pill community">Community</span>':''}
                ${g.edited?'<span class="tag-pill edited">Edited</span>':''}
              </span>
            </span>
          </button>
          <span class="row-actions">
            <button type="button" class="row-action climbed-btn ${climbed?'active':''}" title="Mark as climbed" aria-label="Mark as climbed" aria-pressed="${climbed}">✓</button>
            <button type="button" class="row-action bookmark-btn ${bookmarked?'active':''}" title="Bookmark" aria-label="Bookmark" aria-pressed="${bookmarked}">★</button>
            <button type="button" class="row-action edit-icon-btn" title="Edit this spot" aria-label="Edit this spot">✎</button>
          </span>`;
      item.querySelector('.gym-main').addEventListener('click', ()=>{
        const targetZoom = Math.max(map.getZoom(), 13);
        map.flyTo({center:[g.lng, g.lat], zoom: targetZoom, duration: motion(800)});
        // paintMarkers() (bound to 'moveend' at setup, before this one-off
        // listener exists) runs first and repopulates markerEls for the new
        // viewport, so the lookup below sees the freshly painted marker.
        map.once('moveend', ()=>{
          const entry = appState.markerEls[g.id];
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
  }

  rebuildClusterIndex(visible);
}

// Lightweight update for a single spot's mark state — avoids repainting every
// marker (which would close any open popup) just because one star got clicked.
function updateMarkUI(spotId){
  const g = appState.spots.find(s=>s.id===spotId);
  if(!g) return;
  const entry = appState.markerEls[spotId];
  if(entry && entry.kind === 'icon'){
    entry.el.className = spotMarkerClasses(g);
    const popup = entry.marker.getPopup();
    if(popup) popup.setHTML(popupHtml(g));
  }
  const item = document.querySelector(`.gym-item[data-id="${CSS.escape(spotId)}"]`);
  if(item){
    const cb = item.querySelector('.climbed-btn');
    const bb = item.querySelector('.bookmark-btn');
    if(cb){ const on = appState.climbedIds.has(spotId); cb.classList.toggle('active', on); cb.setAttribute('aria-pressed', String(on)); }
    if(bb){ const on = appState.bookmarkedIds.has(spotId); bb.classList.toggle('active', on); bb.setAttribute('aria-pressed', String(on)); }
  }
}

function resetFilters(){
  appState.searchTerm = '';
  document.getElementById('searchInput').value = '';
  appState.activeStates = new Set(['ALL']);
  appState.activeTypes = new Set(['indoor-bouldering','top-rope','lead-climbing']);
  appState.showClimbedOnly = false;
  appState.showBookmarkedOnly = false;
  document.querySelectorAll('.chip').forEach(c=>{
    const on = c.dataset.state === 'ALL';
    c.classList.toggle('active', on);
    c.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('.country-group, .region-group').forEach(g=>g.classList.remove('has-active'));
  document.querySelectorAll('#typeFilters input[data-type]').forEach(i=>{ i.checked = true; });
  document.getElementById('filterClimbed').checked = false;
  document.getElementById('filterBookmarked').checked = false;
  render();
}

// Narrow viewports fold the secondary header actions (About / Saved /
// Logbook / sign-in) into a dropdown behind this toggle. Any click on an
// item inside, or anywhere outside, closes it again.
const headerNav = document.getElementById('headerNav');
const navToggle = document.getElementById('navToggle');
function setNavOpen(open){
  headerNav.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
}

// --- climbed / bookmark marks ---
async function toggleMark(spotId, markType){
  if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
  const user = window.auth.user;
  if(!user){ openAuthModal(); return; }
  const set = markType === 'climbed' ? appState.climbedIds : appState.bookmarkedIds;
  const wasActive = set.has(spotId);
  if(wasActive) set.delete(spotId); else set.add(spotId);
  if(appState.showClimbedOnly || appState.showBookmarkedOnly) render(); else updateMarkUI(spotId);
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
    if(appState.showClimbedOnly || appState.showBookmarkedOnly) render(); else updateMarkUI(spotId);
    showToast('Could not save — try again');
    console.error(err);
  }
}

export function initSidebar(){
  document.getElementById('gymList').addEventListener('click', (e)=>{
    if(e.target.closest('.clear-filters')) resetFilters();
  });

  // --- filter controls ---
  document.getElementById('stateChips').addEventListener('click', (e)=>{
    // Expanding a region/country also flies the map there; collapsing it
    // is just tidying the panel and shouldn't move the camera.
    const regionHeader = e.target.closest('.region-header');
    if(regionHeader){
      const group = regionHeader.closest('.region-group');
      const expanded = !group.classList.toggle('collapsed');
      regionHeader.setAttribute('aria-expanded', String(expanded));
      const target = REGION_FLY_TARGETS[group.dataset.region];
      if(expanded && target) map.flyTo({center: target.center, zoom: target.zoom, duration: motion(1500)});
      return;
    }
    const label = e.target.closest('.country-label');
    if(label){
      const group = label.closest('.country-group');
      const expanded = !group.classList.toggle('collapsed');
      label.setAttribute('aria-expanded', String(expanded));
      const target = COUNTRY_FLY_TARGETS[group.dataset.country];
      if(expanded && target) map.flyTo({center: target.center, zoom: target.zoom, duration: motion(1500)});
      return;
    }
    const chip = e.target.closest('.chip');
    if(!chip) return;
    const state = chip.dataset.state;
    if(state === 'ALL'){
      appState.activeStates = new Set(['ALL']);
    } else {
      const key = chip.dataset.country + ':' + state;
      appState.activeStates.delete('ALL');
      if(appState.activeStates.has(key)) appState.activeStates.delete(key); else appState.activeStates.add(key);
      if(appState.activeStates.size === 0) appState.activeStates = new Set(['ALL']);
    }
    document.querySelectorAll('.chip').forEach(c=>{
      const key = c.dataset.state === 'ALL' ? 'ALL' : c.dataset.country + ':' + c.dataset.state;
      const on = appState.activeStates.has(key);
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    // A chip can be active while its own country group (and that
    // country's region group, one level up) is collapsed -- flag both so
    // an applied filter never silently disappears from view just because
    // its group or region happens to be collapsed.
    document.querySelectorAll('.country-group').forEach(group=>{
      group.classList.toggle('has-active', !!group.querySelector('.chip.active'));
    });
    document.querySelectorAll('.region-group').forEach(region=>{
      region.classList.toggle('has-active', !!region.querySelector('.country-group.has-active'));
    });
    render();
  });

  // Featured "worth traveling for" destinations: pure navigation, not a
  // filter -- unlike a chip click this never touches activeStates. Mirrors
  // the .country-label branch above (fly to COUNTRY_FLY_TARGETS and expand
  // that country's group and its parent region), but lives in its own
  // listener since .featured-destinations sits outside #stateChips.
  document.getElementById('featuredDestinations').addEventListener('click', (e)=>{
    const btn = e.target.closest('.featured-chip');
    if(!btn) return;
    const code = btn.dataset.country;
    const target = COUNTRY_FLY_TARGETS[code];
    if(target) map.flyTo({center: target.center, zoom: target.zoom, duration: motion(1500)});
    const group = document.querySelector('.country-group[data-country="'+code+'"]');
    if(group){
      group.classList.remove('collapsed');
      const label = group.querySelector('.country-label');
      if(label) label.setAttribute('aria-expanded', 'true');
      const region = group.closest('.region-group');
      if(region){
        region.classList.remove('collapsed');
        const header = region.querySelector('.region-header');
        if(header) header.setAttribute('aria-expanded', 'true');
      }
    }
  });

  document.getElementById('typeFilters').addEventListener('change', (e)=>{
    const input = e.target.closest('input[data-type]');
    if(!input) return;
    if(input.checked) appState.activeTypes.add(input.dataset.type);
    else appState.activeTypes.delete(input.dataset.type);
    render();
  });

  document.getElementById('marksFilters').addEventListener('change', (e)=>{
    if(e.target.id === 'filterClimbed') appState.showClimbedOnly = e.target.checked;
    else if(e.target.id === 'filterBookmarked') appState.showBookmarkedOnly = e.target.checked;
    else return;
    render();
  });

  document.getElementById('searchInput').addEventListener('input', (e)=>{
    appState.searchTerm = e.target.value.trim().toLowerCase();
    render();
  });

  document.getElementById('mobileToggle').addEventListener('click', (e)=>{
    const open = document.getElementById('sidebar').classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', String(open));
  });
  navToggle.addEventListener('click', ()=> setNavOpen(!headerNav.classList.contains('open')));
  headerNav.addEventListener('click', (e)=>{ if(e.target.closest('button, a')) setNavOpen(false); });
  document.addEventListener('click', (e)=>{
    if(headerNav.classList.contains('open') && !e.target.closest('#headerNav, #navToggle')) setNavOpen(false);
  });

  // "Saved" header button -- jumps straight to the existing Bookmarked
  // filter rather than being a separate page, so it reuses the same
  // marks/list/map rendering everything else already goes through.
  document.getElementById('savedBtn').addEventListener('click', ()=>{
    if(!window.auth.user){ showToast('Sign in to view your saved spots'); return; }
    const bookmarkedFilter = document.getElementById('filterBookmarked');
    bookmarkedFilter.checked = true;
    appState.showBookmarkedOnly = true;
    render();
    if(window.innerWidth <= 760) document.getElementById('sidebar').classList.add('open');
  });

  // Popup buttons carry data-popup-action / data-spot-id (see popup-html.js) instead of inline onclick handlers, so a
  // spot id can never be interpreted as code. Popups are re-rendered with setHTML, hence one delegated listener.
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-popup-action]');
    if(!btn) return;
    const id = btn.dataset.spotId;
    switch(btn.dataset.popupAction){
      case 'climbed':
      case 'bookmarked': toggleMark(id, btn.dataset.popupAction); break;
      case 'edit': openEditModal(id); break;
      case 'report': openReportModal(id); break;
    }
  });
  // <img> error events don't bubble, so a capture-phase listener replaces the old inline onerror="..." handler.
  document.addEventListener('error', (e)=>{
    if(e.target && e.target.matches && e.target.matches('img.popup-photo')) e.target.style.display = 'none';
  }, true);
}
