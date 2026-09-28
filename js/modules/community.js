// Community data (DESIGN.md sec. 10): contributor counts for list marks, a gym's provenance line, the signed-in user's own
// proposals for a gym, and their profile / points / submissions for /me. Everything here is a read, except saving the
// display name. The database functions arrive with migration 20260926084510; until it is applied, every call fails
// soft (a warning, empty data) and the UI falls back to "Community-added" with no counts.
import { isMissingTable } from './provenance.js';
import { appState } from './state.js';

const warn = (what, err) => console.warn('Community data unavailable (' + what + ')', err && err.message ? err.message : err);

export async function loadContributorCounts(){
  appState.contributorCounts = new Map();
  if(!window.sb) return;
  try{
    const {data, error} = await window.sb.rpc('spot_contributor_counts');
    if(error) throw error;
    (data || []).forEach(r => appState.contributorCounts.set(r.spot_id, Number(r.contributors) || 0));
  }catch(err){ warn('contributor counts', err); }
}

// One gym's provenance line data, cached per id; resolves to null when unavailable.
const inflight = new Map();
export function loadGymProvenance(id){
  if(appState.provenanceCache.has(id)) return Promise.resolve(appState.provenanceCache.get(id));
  if(inflight.has(id)) return inflight.get(id);
  const p = (async () => {
    let row = null;
    if(window.sb){
      try{
        const {data, error} = await window.sb.rpc('spot_provenance', { p_spot_id: id });
        if(error) throw error;
        row = (data && data[0]) || null;
      }catch(err){ warn('provenance', err); }
    }
    appState.provenanceCache.set(id, row);
    inflight.delete(id);
    return row;
  })();
  inflight.set(id, p);
  return p;
}

// The signed-in user's latest proposal for a gym ("Your edit is awaiting review" / the rejection reason). RLS returns only
// their own rows. Cached per gym until they submit again.
export async function loadMyEditFor(id){
  const user = window.auth.user;
  if(!user || !window.sb){ appState.myEditCache.set(id, null); return null; }
  let row = null;
  try{
    const {data, error} = await window.sb.from('pending_edits').select('status, rejection_reason, submitted_at')
      .eq('spot_id', id).eq('submitted_by', user.id).order('submitted_at', { ascending: false }).limit(1);
    if(error) throw error;
    row = (data && data[0]) || null;
  }catch(err){ warn('own edits', err); }
  appState.myEditCache.set(id, row);
  return row;
}

// /me: display name, points, and the user's own gym submissions and edits that are pending or were rejected.
export async function loadMyCommunity(){
  const user = window.auth.user;
  // profilesAvailable: false while the profiles table does not exist (before migration 20260926084510), so /me can say so.
  const out = { displayName: '', profilesAvailable: true, points: null, gyms: 0, edits: 0, submissions: [] };
  if(!user || !window.sb) return out;
  const [profile, points, spots, edits] = await Promise.all([
    window.sb.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle(),
    window.sb.rpc('contribution_points', { p_users: [user.id] }),
    window.sb.from('spots').select('id, name, status, rejection_reason, created_at').eq('submitted_by', user.id).in('status', ['pending', 'rejected']).order('created_at', { ascending: false }).limit(20),
    window.sb.from('pending_edits').select('id, spot_id, name, status, rejection_reason, submitted_at').eq('submitted_by', user.id).in('status', ['pending', 'rejected']).order('submitted_at', { ascending: false }).limit(20),
  ].map(q => q.then(r => r, err => ({ error: err }))));
  if(profile.error){ warn('profile', profile.error); out.profilesAvailable = !isMissingTable(profile.error); }
  else out.displayName = (profile.data && profile.data.display_name) || '';
  if(points.error) warn('points', points.error);
  else if(points.data && points.data[0]){ out.points = Number(points.data[0].points) || 0; out.gyms = points.data[0].gyms; out.edits = points.data[0].edits; }
  const subs = [];
  if(!spots.error) (spots.data || []).forEach(s => subs.push({ kind: 'gym', name: s.name, status: s.status, reason: s.rejection_reason, at: s.created_at }));
  if(!edits.error) (edits.data || []).forEach(e => subs.push({ kind: 'edit', name: e.name, status: e.status, reason: e.rejection_reason, at: e.submitted_at, spotId: e.spot_id }));
  out.submissions = subs.sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 20);
  return out;
}

export async function saveDisplayName(name){
  const user = window.auth.user;
  if(!user || !window.sb) throw new Error('Not signed in');
  const {error} = await window.sb.from('profiles').upsert({ user_id: user.id, display_name: name.trim() }, { onConflict: 'user_id' });
  if(error) throw error;
}
