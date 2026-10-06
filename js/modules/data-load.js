// Loading spots (Supabase, or the data/spots-fallback.json offline list), marks, moderator status, pending items.
import { appState } from './state.js';
// data/spots-fallback.json is an id-correct export of the approved gyms from production (the LIST_COLUMNS below; written
// by scripts/build-sitemap.js, regenerated after each data batch). It is only needed when Supabase is unreachable, so
// it's fetched on demand rather than on every page load, and the service worker does not precache it.
let fallbackRows = null;
export function ensureFallbackData(){
  if(fallbackRows) return Promise.resolve(fallbackRows);
  if(!appState.fallbackDataPromise){
    appState.fallbackDataPromise = fetch('data/spots-fallback.json')
      .then(r=>{ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(d=>{ fallbackRows = Array.isArray(d) ? d : []; return fallbackRows; })
      .catch(err=>{ appState.fallbackDataPromise = null; throw new Error('Could not load data/spots-fallback.json: '+err.message); });
  }
  return appState.fallbackDataPromise;
}

// The columns Explore needs (map, list, search, filters, peek card, provenance marks, recent sort). The research notes
// (most of the old payload) and the other gym-information fields load per gym with loadFullSpot (gym page, edit dialog, /mod).
// `hours` rides along: rows, cards, the peek card and the Open now filter all need it to say open or closed.
export const LIST_COLUMNS = 'id,name,suburb,state,country,lat,lng,types,address,photo,slug,community,edited,verified_at,created_at,submitted_by,description,hours';

// The first load takes the read js/spots-prefetch.js started before MapLibre (once, and only for these exact columns); a
// later reload (moderation) reads afresh.
let prefetched = window.spotsPrefetch && window.spotsPrefetch.columns === LIST_COLUMNS ? window.spotsPrefetch.rows : null;
export async function loadSpots(){
  if(window.sb){
    try{
      if(prefetched){
        const early = prefetched; prefetched = null;
        appState.spots = await early;
        appState.usingFallback = false;
        return;
      }
      // PostgREST caps a response at 1000 rows by default. Pages load BATCH at a time in parallel, without asking for the
      // total first (that cost a whole round trip before the rest could start); a full last page means read on.
      const PAGE = 1000, BATCH = 3;
      const page = from => window.sb.from('spots').select(LIST_COLUMNS).eq('status','approved')
        .order('id').range(from, from + PAGE - 1);
      const all = [];
      for(let from = 0, more = true; more; from += PAGE * BATCH){
        const res = await Promise.all(Array.from({ length: BATCH }, (_, k) => page(from + k * PAGE)));
        for(const { data, error } of res){
          if(error) throw error;
          all.push(...(data || []));
        }
        more = (res[BATCH - 1].data || []).length === PAGE;
      }
      appState.spots = all;
      appState.usingFallback = false;
      return;
    }catch(err){
      console.error('Failed to load spots from Supabase', err);
    }
  }
  appState.usingFallback = true;
  appState.spots = (await ensureFallbackData().catch(err=>{ console.error(err); return []; })).map(g => ({ ...g, _full: true }));
}

// The whole row of one approved gym (research notes, gym information), merged into the shared spot object so every view
// sees it. Fetched once per gym per session; the read carries status=eq.approved, so the service worker may cache it
// (public data, like the list) and a gym page opened offline keeps its details.
const fullLoads = new Map();
export function loadFullSpot(g){
  if(!g || g._full || !window.sb) return Promise.resolve(g);
  if(!fullLoads.has(g.id)){
    fullLoads.set(g.id, window.sb.from('spots').select('*').eq('id', g.id).eq('status', 'approved').maybeSingle()
      .then(({ data, error }) => { if(error) throw error; if(data) Object.assign(g, data); g._full = true; return g; })
      .catch(err => { fullLoads.delete(g.id); console.error('Failed to load gym details', err); return g; }));
  }
  return fullLoads.get(g.id);
}
// Several at once (moderation: the live rows behind pending edits, so the diff compares whole rows).
export async function loadFullSpots(ids){
  const want = [...new Set(ids)].map(id => appState.spots.find(s => s.id === id)).filter(g => g && !g._full);
  if(!want.length || !window.sb) return;
  try{
    const { data, error } = await window.sb.from('spots').select('*').in('id', want.map(g => g.id)).eq('status', 'approved');
    if(error) throw error;
    const byId = new Map((data || []).map(r => [r.id, r]));
    for(const g of want){ const r = byId.get(g.id); if(r){ Object.assign(g, r); g._full = true; } }
  }catch(err){ console.error('Failed to load gym details', err); }
}

export async function checkModerator(){
  appState.isModerator = false;
  const user = window.auth.user;
  if(!user || !window.sb) return;
  try{
    const {data, error} = await window.sb.from('moderators').select('user_id').eq('user_id', user.id).maybeSingle();
    if(error) throw error;
    appState.isModerator = !!data;
  }catch(err){
    console.error('Failed to check moderator status', err);
  }
}

export async function loadPending(){
  appState.pendingSpots = [];
  appState.pendingEdits = [];
  appState.pendingReports = [];
  if(!appState.isModerator || !window.sb) return;
  try{
    const [{data: pSpots, error: e1}, {data: pEdits, error: e2}, {data: pReports, error: e3}] = await Promise.all([
      window.sb.from('spots').select('*').eq('status','pending'),
      window.sb.from('pending_edits').select('*').eq('status','pending'),
      window.sb.from('reports').select('*')
    ]);
    if(e1) throw e1;
    if(e2) throw e2;
    if(e3) throw e3;
    appState.pendingSpots = pSpots || [];
    appState.pendingEdits = pEdits || [];
    appState.pendingReports = pReports || [];
    await loadFullSpots(appState.pendingEdits.map(e => e.spot_id));   // the diff's "Now" column needs whole rows
  }catch(err){
    console.error('Failed to load pending items', err);
  }
}

export async function loadMarks(){
  appState.climbedIds = new Set();
  appState.bookmarkedIds = new Set();
  const user = window.auth.user;
  if(!user || !window.sb) return;
  try{
    const {data, error} = await window.sb.from('marks').select('spot_id, mark_type').eq('user_id', user.id);
    if(error) throw error;
    (data||[]).forEach(m=>{
      if(m.mark_type === 'climbed') appState.climbedIds.add(m.spot_id);
      else if(m.mark_type === 'bookmarked') appState.bookmarkedIds.add(m.spot_id);
    });
  }catch(err){
    console.error('Failed to load marks', err);
  }
}
