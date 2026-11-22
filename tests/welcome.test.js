// The one-time welcome after a new account's first sign-in (js/modules/welcome-html.js, welcome.js).   node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = globalThis.window.matchMedia || (() => ({ matches: false }));
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const NOW = Date.parse('2026-11-23T10:00:00Z');
const H = 36e5;
const at = h => new Date(NOW - h * H).toISOString();

test('welcome: only a new account on its first sign-in', async () => {
  const { isNewAccount } = await import('../js/modules/welcome-html.js');
  assert.equal(isNewAccount({ id: 'u', created_at: at(0.2), last_sign_in_at: at(0.1) }, NOW), true, 'magic link used minutes after the request');
  assert.equal(isNewAccount({ id: 'u', created_at: at(30), last_sign_in_at: at(29) }, NOW), true, 'same session, next day (the device flag stops a repeat)');
  assert.equal(isNewAccount({ id: 'u', created_at: at(24 * 40), last_sign_in_at: at(1) }, NOW), false, 'an older account signing in again');
  assert.equal(isNewAccount({ id: 'u', created_at: at(72), last_sign_in_at: at(1) }, NOW), false, 'a second device days later');
  assert.equal(isNewAccount({ id: 'u', created_at: at(24 * 8), last_sign_in_at: at(24 * 8) }, NOW), false, 'older than 7 days');
  for (const u of [null, {}, { id: 'u' }, { id: 'u', created_at: 'nope' }, { id: 'u', created_at: new Date(NOW + H).toISOString() }]) assert.equal(isNewAccount(u, NOW), false);
});

test('welcome: markup, keys and wiring', async () => {
  const { welcomeHtml } = await import('../js/modules/welcome-html.js');
  const html = welcomeHtml();
  assert.match(html, /^<img class="mascot mascot--spot" src="assets\/mascot\/wave-badge\.svg" alt=""/, 'the waving deer leads, decorative');
  assert.match(html, /<h2 id="dlg-welcome"/, 'labels the dialog');
  assert.equal((html.match(/<li>/g) || []).length, 3);
  assert.match(html, /data-welcome-action="passport"[\s\S]*class="btn btn-primary" data-welcome-action="done"/, 'secondary then primary');
  assert.ok(!/welcome\.[a-z]+/.test(html), 'every key resolves');
  const shell = read('index.html');
  assert.match(shell, /<div class="modal-backdrop hidden" id="welcomeModalBackdrop">[\s\S]*?aria-labelledby="dlg-welcome"[\s\S]*?id="welcomeClose" data-modal-close[\s\S]*?<div id="welcomeBody"><\/div>/);
  const main = read('js/main.js');
  assert.match(main, /maybeShowWelcome\(user\)/, 'after a sign-in event');
  assert.match(main, /if\(window\.auth\.user\) maybeShowWelcome\(window\.auth\.user\)/, 'and when a magic link lands already signed in');
  const ctl = read('js/modules/welcome.js');
  assert.match(ctl, /catch\(err\)\{ return true; \}/, 'unreadable storage: treated as seen (never nags)');
  assert.match(ctl, /modal-backdrop:not\(\.hidden\)/, 'never stacks on another dialog');
  for (const f of ['js/modules/welcome.js', 'js/modules/welcome-html.js']) assert.ok(read('sw.js').includes("'" + f + "'"), f + ' precached');
});
