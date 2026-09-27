// Climbed / saved marks (Supabase `marks` table, RLS: own rows only). Optimistic toggle with rollback on error.
// Who shows the change (row, card, pin, peek) is explore.js's business: it registers a listener.
import { openAuthModal } from './auth-ui.js';
import { appState } from './state.js';
import { showToast } from './utils.js';

let listener = () => {};
export function setMarksListener(fn){ listener = fn; }

// A mark the server already recorded (a check-in adds `climbed`): update the state and tell the listener.
export function markAdded(spotId, markType){
  const set = markType === 'climbed' ? appState.climbedIds : appState.bookmarkedIds;
  if(set.has(spotId)) return;
  set.add(spotId);
  listener(spotId);
}

export async function toggleMark(spotId, markType){
  if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
  const user = window.auth.user;
  if(!user){ openAuthModal(); return; }
  const set = markType === 'climbed' ? appState.climbedIds : appState.bookmarkedIds;
  const wasActive = set.has(spotId);
  if(wasActive) set.delete(spotId); else set.add(spotId);
  listener(spotId);
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
    listener(spotId);
    showToast('Could not save — try again');
    console.error(err);
  }
}
