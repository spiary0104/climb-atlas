// Sharing a gym (from the overnight-sprint review, 2026-10-05): a compact Share control beside the gym name on the gym page.
// The text is built here (pure, unit-tested); the share itself goes through the Web Share API when the browser has it,
// otherwise the link is copied with a toast. Nothing here needs sign-in or extra reads. Share text is plain text (never
// HTML): escaping is the receiving app's job, but gym fields are still whitespace-normalised and capped.
import { SITE_NAME, clean, gymNoun, typeWords } from './seo-meta.js';
import { gymPath } from './slug.js';
import { showToast } from './utils.js';

export const SHARE_ORIGIN = 'https://www.bouldeer.com';

const words = types => typeWords(types).map(w => w[0].toUpperCase() + w.slice(1)).join(' + ');

// {title, text, url} for a gym. ctx: {region (display name), origin}.
// Line 1: name · types · place. Line 2 (only when known): the address. Nothing time-bound (no "today" hours, no prices),
// so the message is still true whenever the friend opens it.
export function gymShareText(g, ctx = {}){
  const name = clean(g.name, 80) || 'Climbing gym';
  const place = [clean(g.suburb, 40), clean(ctx.region, 40)].filter(Boolean).join(', ');
  const line1 = [name, words(g.types) || gymNoun(g.types), place].filter(Boolean).join(' · ');
  const address = clean(g.address, 90);
  return {
    title: name + ' — ' + SITE_NAME,
    text: address ? line1 + '\n' + address : line1,
    url: (ctx.origin || SHARE_ORIGIN) + gymPath(g),
  };
}

// Web Share when available (phones, Safari, Chromium); else copy the link. Returns 'shared' | 'copied' | 'cancelled' | 'failed'.
// A dismissed share sheet (AbortError) is silent, like share-card.js; a copy shows "Link copied"; a browser that can do
// neither shows the link in the toast so it can still be typed or selected.
export async function sharePlace(payload, { nav = navigator } = {}){
  if(nav.share && (!nav.canShare || nav.canShare({ url: payload.url }))){
    try{ await nav.share({ title: payload.title, text: payload.text, url: payload.url }); return 'shared'; }
    catch(err){ if(err && err.name === 'AbortError') return 'cancelled'; }
  }
  try{
    if(nav.clipboard && nav.clipboard.writeText){ await nav.clipboard.writeText(payload.url); showToast('Link copied'); return 'copied'; }
  }catch(err){ /* clipboard refused: fall through */ }
  showToast('Copy this link: ' + payload.url);
  return 'failed';
}
