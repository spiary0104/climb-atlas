// Pure pieces of the one-time welcome (owner 2026-10-05; docs/DESIGN.md sec. 12.2 tier 4): who counts as a new account,
// and the sheet's markup. No DOM, no appState (unit-tested). The controller is welcome.js.
import { firstRunArt } from './brand.js';
import { th } from './i18n.js';

const DAY = 864e5;

// A new account: created in the last 7 days, and this session's sign-in is its first (Supabase sets last_sign_in_at on
// every sign-in; a magic link is used within the hour, a new Google account signs in at creation). People who signed up
// before the welcome shipped, or who come back on a second device days later, never see it.
export function isNewAccount(user, now = Date.now()){
  if(!user || !user.id) return false;
  const created = Date.parse(user.created_at);
  const last = Date.parse(user.last_sign_in_at || user.created_at);
  if(!Number.isFinite(created) || !Number.isFinite(last)) return false;
  return now - created >= 0 && now - created < 7 * DAY && last - created < DAY;
}

const ITEMS = [['bookmark-simple', 'welcome.save'], ['map-pin', 'welcome.stamp'], ['book-open', 'welcome.log']];
const icon = (name) => `<svg class="icon icon-sm" aria-hidden="true" focusable="false"><use href="assets/icons.svg#i-${name}"/></svg>`;

// The waving deer (the sheet's only character), the title, what the account keeps for a travelling climber, and two
// actions: Open my passport · Start exploring (closes).
export function welcomeHtml(){
  const items = ITEMS.map(([i, k]) => `<li>${icon(i)}<span>${th(k)}</span></li>`);
  return firstRunArt('welcome') + `<h2 id="dlg-welcome" class="welcome-title">${th('welcome.title')}</h2>`
    + `<p class="welcome-intro">${th('welcome.intro')}</p><ul class="welcome-list">${items.join('')}</ul>`
    + `<div class="modal-actions"><button type="button" class="btn btn-secondary" data-welcome-action="passport">${th('welcome.passport')}</button>`
    + `<button type="button" class="btn btn-primary" data-welcome-action="done">${th('welcome.go')}</button></div>`;
}
