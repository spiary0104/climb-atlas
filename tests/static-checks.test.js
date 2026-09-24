// Static regression checks over the source tree: no inline handlers / window.__ globals, explicit modal-close markers,
// destructive buttons are not close buttons, and every interpolation in HTML-building templates is escaped or allow-listed.
//   node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const modDir = path.join(ROOT, 'js', 'modules');
const moduleFiles = fs.readdirSync(modDir).filter((f) => f.endsWith('.js')).map((f) => 'js/modules/' + f);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

test('no inline event handlers or window.__ globals anywhere in the app', () => {
  for (const f of [...moduleFiles, 'js/main.js', 'js/auth.js', 'index.html', 'about.html']) {
    const src = stripComments(read(f));
    assert.ok(!/\bon(click|error|load|mouseover|focus|change|input|submit|keydown)\s*=\s*["'{]/i.test(src), 'inline handler in ' + f);
    assert.ok(!/window\.__\w+/.test(src), 'window.__ global in ' + f);
    assert.ok(!/javascript:/i.test(src), 'javascript: URL in ' + f);
  }
});

test('index.html: every modal has a data-modal-close control, and only cancel/close buttons carry it', () => {
  const html = read('index.html');
  const modals = [...html.matchAll(/<div class="modal-backdrop[^"]*" id="(\w+)">([\s\S]*?)(?=<div class="modal-backdrop|<script|$)/g)];
  assert.ok(modals.length >= 9, 'expected the 9 modals, found ' + modals.length);
  for (const [, id, body] of modals) {
    const closers = [...body.matchAll(/<button[^>]*data-modal-close[^>]*>/g)].map((m) => m[0]);
    assert.ok(closers.length >= 1, id + ' has no data-modal-close control');
    for (const c of closers) assert.ok(/btn-cancel|info-close/.test(c) && !/btn-danger|pending-|session-delete/.test(c), 'unexpected closer in ' + id + ': ' + c);
  }
  // nothing else in the page is marked as a closer
  assert.equal((html.match(/data-modal-close/g) || []).length, modals.reduce((n, m) => n + (m[2].match(/data-modal-close/g) || []).length, 0));
});

test('Escape handling clicks only [data-modal-close] and refuses destructive controls', () => {
  const src = read('js/modules/modals.js');
  const handler = /if\(e\.key === 'Escape'\)\{([\s\S]*?)\} else if\(e\.key === 'Tab'\)/.exec(src)[1];
  assert.ok(handler.includes("querySelector('[data-modal-close]')"));
  assert.ok(!/btn-cancel|info-close/.test(stripComments(handler)));
  assert.ok(/DESTRUCTIVE/.test(handler));
  const destructive = /const DESTRUCTIVE = '([^']+)'/.exec(src)[1];
  for (const cls of ['.btn-danger', '.pending-reject', '.pending-dismiss', '.pending-approve', '.session-delete']) assert.ok(destructive.includes(cls), cls);
});

test('destructive buttons (Reject / Dismiss / Delete) are never styled or selected as .btn-cancel', () => {
  for (const f of ['js/modules/moderation-html.js', 'js/modules/logbook.js']) {
    const src = stripComments(read(f));
    for (const m of src.matchAll(/<button[^>]*class="([^"]*)"[^>]*>/g)) {
      if (/pending-reject|pending-dismiss|session-delete/.test(m[1])) assert.ok(/btn-danger/.test(m[1]) && !/btn-cancel/.test(m[1]), f + ': ' + m[1]);
    }
  }
  assert.ok(/\.btn-danger\s*\{/.test(read('css/style.css')), '.btn-danger has no CSS rule');
});

// Every ${...} inside these HTML-building templates must be escapeHtml(...) or one of the reviewed-safe expressions below.
const SAFE_EXPR = [
  /^escapeHtml\(/,
  /^(climbed|bookmarked|c\.sent|active)\s*\?\s*'[^']*'\s*:\s*''$/,            // boolean -> fixed class / attribute strings
  /^c\.climb_type===['"][\w-]+['"]\?'selected':''$/,                          // <option selected> for a fixed value
  /^(g|s)\.(community|edited)\s*\?\s*'[^']*'\s*:\s*''$/,
  /^region !== country \? ' · ' \+ escapeHtml\(country\) : ''$/,
  /^typeSwatch\(g\.types\)$/,                                                   // colours come from a fixed map; unknown types become #999
  /^(climbed|bookmarked)$/,                                                     // booleans
  /^Number\(c\.attempts\)\|\|1$/,
  /^i$/,                                                                        // loop index
  /^c\.attempts>1\?` ×\$\{escapeHtml\(c\.attempts\)\}`:''$/,
  /^chips \? .*$/, /^s\.notes \? .*$/,                                          // conditional blocks whose contents are checked below
  /^g\.(address|notes)\?`<div class="(popup-address|pending-notes)">\$\{escapeHtml\(g\.(address|notes)\)\}<\/div>`:''$/,
  /^g\.notes\?`<div style="font-size:12px;color:var\(--text-dim\)">\$\{escapeHtml\(g\.notes\)\}<\/div>`:''$/,
  /^pe\.(address|notes)\?`<div class="pending-notes">\$\{escapeHtml\(pe\.(address|notes)\)\}<\/div>`:''$/,
  /^photo\?`<img class="popup-photo" src="\$\{escapeHtml\(photo\)\}" alt="\$\{escapeHtml\(g\.name\)\}">`:''$/,
  /^photoLine\((g|pe)\.photo\)$/,
  /^url$/ ,                                                                     // (unused placeholder for the safeUrl result: always passed through escapeHtml at the use site)
  /^photo$/,
  /^spotLabel\(/, /^cards\./,
  /^id$/,                                                                       // popup-html.js: const id = escapeHtml(g.id)
  /^CSS\.escape\(/,                                                             // used in a CSS selector string, not in markup
];
function interpolations(src) {
  const out = [];
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '$' && src[i + 1] === '{') {
      let depth = 1, j = i + 2;
      while (j < src.length && depth) { if (src[j] === '{') depth++; else if (src[j] === '}') depth--; j++; }
      out.push(src.slice(i + 2, j - 1).trim());
      i = j - 1;
    }
  }
  return out;
}
test('HTML-building templates only interpolate escaped or reviewed-safe expressions', () => {
  const files = ['js/modules/popup-html.js', 'js/modules/moderation-html.js', 'js/modules/logbook.js', 'js/modules/sidebar.js', 'js/modules/auth-ui.js'];
  const unsafe = [];
  for (const f of files) {
    // lines that assign to .textContent are not markup (the browser treats the value as text)
    const src = stripComments(read(f)).split('\n').filter((l) => !/\.textContent\s*=/.test(l)).join('\n');
    // only look at template literals that contain markup
    for (const tpl of src.matchAll(/`([^`\\]|\\.|`[^`]*`)*`/g)) {
      const t = tpl[0];
      if (!/<[a-z]/i.test(t) && !/class=/.test(t)) continue;
      for (const expr of interpolations(t)) {
        const e = expr.replace(/\s+/g, ' ');
        if (!SAFE_EXPR.some((re) => re.test(e))) unsafe.push(f + ': ${' + e.slice(0, 110) + '}');
      }
    }
  }
  assert.deepEqual([...new Set(unsafe)], [], 'unreviewed interpolation(s) in HTML templates:\n  ' + [...new Set(unsafe)].join('\n  '));
});

test('photo URLs are validated at every render site and at both submit handlers', () => {
  assert.ok(/safeUrl\(g\.photo\)/.test(read('js/modules/popup-html.js')));
  assert.ok(/safeUrl\(photo\)/.test(read('js/modules/moderation-html.js')));
  const modals = read('js/modules/modals.js');
  assert.ok(/fPhotoRaw && !safeUrl\(fPhotoRaw\)/.test(modals) && /ePhotoRaw && !safeUrl\(ePhotoRaw\)/.test(modals));
  // no other place renders a photo into markup
  for (const f of moduleFiles) {
    // moderation.js only copies pe.photo into the approved-edit UPDATE payload (data, never rendered as markup)
    if (/popup-html|moderation-html|modals\.js|html-safe|moderation\.js/.test(f)) continue;
    assert.ok(!/\.photo\b/.test(stripComments(read(f))) || /\.value\s*=/.test(read(f)), 'unreviewed photo use in ' + f);
  }
});
