// The milestone sheet (DESIGN.md sec. 12.3, the Companion contribution): the topped-out (or, for a new highest grade,
// the dyno) character breaking the top edge at 160px, a Fraunces title, one sentence, up to three other milestone
// marks, Share card · Done. Never more than one per session (sessionStorage; an in-memory flag when storage is
// blocked): if several trigger at once the highest shows and the others are listed in one line.
import { shareCard } from './share-card.js';
import { milestoneHtml } from './stamp-html.js';

const KEY = 'bouldeer_milestone_shown';
const backdrop = document.getElementById('milestoneModalBackdrop');
const body = document.getElementById('milestoneBody');
let shownInMemory = false;
let card = null;

function alreadyShown(){
  if(shownInMemory) return true;
  try{ return sessionStorage.getItem(KEY) === '1'; }catch(err){ return false; }
}
function markShown(){
  shownInMemory = true;
  try{ sessionStorage.setItem(KEY, '1'); }catch(err){ /* private mode: the in-memory flag still holds for this page */ }
}

// list: milestones, highest first ({title, sentence, pose}); shareWith: the share-card data for "Share card".
export function showMilestones(list, shareWith){
  if(!list || !list.length || alreadyShown()) return false;
  markShown();
  const [top, ...rest] = list;
  card = shareWith || { title: top.title, date: new Date().toISOString(), seed: top.title };
  body.innerHTML = milestoneHtml({ ...top, others: rest.map(m => m.title) });
  backdrop.classList.remove('hidden');
  return true;
}

function close(){ backdrop.classList.add('hidden'); }

export function initMilestoneSheet(){
  backdrop.addEventListener('click', (e) => {
    if(e.target === backdrop) return close();
    const btn = e.target.closest('[data-ms-action]');
    if(!btn) return;
    if(btn.dataset.msAction === 'done') close();
    else if(btn.dataset.msAction === 'share' && card) shareCard(card);
  });
  document.getElementById('milestoneClose').addEventListener('click', close);
}
