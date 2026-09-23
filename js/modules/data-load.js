// Loading spots (Supabase, or the data/gyms.json fallback), marks, moderator status, pending items.
import { appState } from './state.js';
// data/gyms.json (the ~900KB bundled seed dataset) is only needed when Supabase
// is unreachable, or to offer "Revert to original" on an edited seed spot
// -- so it's fetched on demand rather than on every page load.
export function ensureSeedData(){
  if(window.SEED_GYMS) return Promise.resolve(window.SEED_GYMS);
  if(!appState.seedDataPromise){
    appState.seedDataPromise = fetch('data/gyms.json')
      .then(r=>{ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(d=>{ window.SEED_GYMS = Array.isArray(d) ? d : []; return window.SEED_GYMS; })
      .catch(err=>{ appState.seedDataPromise = null; throw new Error('Could not load data/gyms.json: '+err.message); });
  }
  return appState.seedDataPromise;
}

export async function loadSpots(){
  if(window.sb){
    try{
      // PostgREST caps a single response at 1000 rows by default, so a
      // bare select silently dropped everything past the first 1000 once
      // the dataset outgrew that. Page through in 1000-row chunks until a
      // short page comes back.
      const PAGE = 1000;
      const all = [];
      for(let from = 0;; from += PAGE){
        const {data, error} = await window.sb.from('spots').select('*').eq('status','approved')
          .order('id').range(from, from + PAGE - 1);
        if(error) throw error;
        all.push(...(data || []));
        if(!data || data.length < PAGE) break;
      }
      appState.spots = all;
      appState.usingFallback = false;
      return;
    }catch(err){
      console.error('Failed to load spots from Supabase', err);
    }
  }
  appState.usingFallback = true;
  appState.spots = (await ensureSeedData().catch(err=>{ console.error(err); return []; })).slice();
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
      window.sb.from('pending_edits').select('*'),
      window.sb.from('reports').select('*')
    ]);
    if(e1) throw e1;
    if(e2) throw e2;
    if(e3) throw e3;
    appState.pendingSpots = pSpots || [];
    appState.pendingEdits = pEdits || [];
    appState.pendingReports = pReports || [];
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
