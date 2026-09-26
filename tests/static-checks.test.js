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

test('index.html: every modal has a data-modal-close control, and only non-destructive secondary/tertiary .btn controls carry it', () => {
  const html = read('index.html');
  const modals = [...html.matchAll(/<div class="modal-backdrop[^"]*" id="(\w+)">([\s\S]*?)(?=<div class="modal-backdrop|<script|$)/g)];
  assert.ok(modals.length >= 8, 'expected the 8 dialogs, found ' + modals.length);
  for (const [, id, body] of modals) {
    const closers = [...body.matchAll(/<button[^>]*data-modal-close[^>]*>/g)].map((m) => m[0]);
    assert.ok(closers.length >= 1, id + ' has no data-modal-close control');
    for (const c of closers) assert.ok(/\bbtn\b/.test(c) && /\bbtn-(secondary|tertiary)\b/.test(c) && !/btn-danger|btn-primary|pending-|session-delete/.test(c), 'unexpected closer in ' + id + ': ' + c);
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

test('destructive buttons (Reject / Dismiss / Delete) carry .btn-danger and are never a close/cancel control', () => {
  for (const f of ['js/modules/moderation-html.js', 'js/modules/logbook.js']) {
    const src = stripComments(read(f));
    for (const m of src.matchAll(/<button[^>]*class="([^"]*)"[^>]*>/g)) {
      if (/pending-reject|pending-dismiss|session-delete/.test(m[1])) assert.ok(/btn-danger/.test(m[1]) && !/btn-cancel|btn-primary/.test(m[1]), f + ': ' + m[1]);
    }
  }
  assert.ok(/\.btn-danger\s*\{/.test(read('css/components.css')), '.btn-danger has no CSS rule');
  assert.equal(/btn-cancel|btn-submit|add-btn|mark-btn/.test(read('index.html') + read('css/components.css') + read('css/style.css')), false, 'retired button classes are back');
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
  /^g\.(address|notes)\?`<div class="(popup-address|popup-notes|pending-notes)">\$\{escapeHtml\(g\.(address|notes)\)\}<\/div>`:''$/,
  /^pe\.(address|notes)\?`<div class="pending-notes">\$\{escapeHtml\(pe\.(address|notes)\)\}<\/div>`:''$/,
  /^photo\?`<img class="popup-photo" src="\$\{escapeHtml\(photo\)\}" alt="\$\{escapeHtml\(g\.name\)\}">`:''$/,
  /^photoLine\((g|pe)\.photo\)$/,
  /^url$/ ,                                                                     // (unused placeholder for the safeUrl result: always passed through escapeHtml at the use site)
  /^photo$/,
  /^spotLabel\(/, /^cards\./,
  /^id$/,                                                                       // popup-html.js: const id = escapeHtml(g.id)
  /^CSS\.escape\(/,
  /^icon\('[a-z-]+'(, \{size:'(sm|md|lg)'\})?\)$/,                             // sprite icon with a literal name (icons.js rejects unknown names)
  /^icon\(m\.icon, \{size:'sm'\}\)$/,                                           // logbook moodHtml: m comes from the fixed MOODS table
  /^moodHtml\(s\.mood\)$/,                                                       // builds from MOODS only; unknown moods render nothing
  // list-html.js (Explore builders): helpers that escape internally or emit fixed class names / literal icon names
  /^(provenanceHtml\(g\)|typeDotsHtml\(g\.types\)|typeTagsHtml\(g\.types\)|saveButton\(g, ctx\.saved, '[a-z-]+'\))$/,
  /^TYPE_CLASS\[t\]$/,                                                          // fixed map, filtered to known types first (knownTypes)
  /^(extraClass|which|count|optionsHtml)$/,                                      // literal class from callers / 'place'|'text' / escaped count span / searchGroupHtml(options already built)
  /^Number\(index\)$/,                                                          // search option index: a number, never data
  // pin-html.js: numbers, the fixed path, ring names from RING_ORDER, pinType() output and kind forced to 'dot'|'teardrop'
  /^(w|TEARDROP|shape\((w|outline)\)|r|type|kind|box|parts\.join\(''\))$/,
  /^html$/,                                                                      // search.js listbox(): wraps searchGroupHtml() output
  // page-html.js: numbers coerced with Number(); markup assembled earlier in the same builder from escaped parts;
  // helpers that escape internally (link, thumbHtml, pinSvg, pageCardHtml); cls is a literal class list from callers
  /^Number\([A-Za-z.]+\)$/,
  /^(cls|tiles|pin|history|actions)$/, /^items\.join\(''\)$/,
  /^link\(c\.href, c\.label\)$/, /^pinSvg\(\{ types \}\)$/, /^thumbHtml\(g, '(card|row)'\)$/,
  /^ctx\.nearby\.map\(n => pageCardHtml\(n\.g, n\.ctx\)\)\.join\(''\)$/,
  // page-html.js region builders: the tile template escapes href/label/count; the rest compose reviewed builders
  /^items\.map\(t => `<li><a class="place-tile" href="\$\{escapeHtml\(t\.href\)\}" data-link>` \+ `<span class="place-tile-name">\$\{escapeHtml\(t\.label\)\}<\/span><span class="place-tile-count tnum">\$\{escapeHtml\(countLabel\(t\.count\)\)\}<\/span><\/a><\/li>`\)\.join\(''\)$/,
  /^items\.map\(i => page(Row|Card)Html\(i\.g, i\.ctx\)\)\.join\(''\)$/,
  /^(tileGridHtml\((g\.items|p\.tiles)\)|gymCollectionHtml\(p\.gyms\)|breadcrumbHtml\(p\.crumbs \|\| \[\]\))$/,
  /^(dims|gyms)$/, /^mapThumbHtml\(\{ \.\.\.p\.map, wide: true, points: true \}\)$/,
  // calendar/log/me: assembled in the same builder from numbers, fixed names and escaped labels; p.sessions is
  // logbook.js sessionsHtml() (itself in this review), p.calendar is calendarHtml()
  /^(head|links)$/, /^rows\.join\(''\)$/, /^p\.(sessions|calendar)$/,
  /^key$/, /^tab\('(saved|climbed)', '(Saved|Climbed)', p\.(saved|climbed)\.length\)$/, /^pending$/,   // me page: tab keys are literals
  // Phase 4 provenance: m comes from the fixed MARKS table; the mark builder takes a state name and emits fixed markup
  /^m\[[01]\](\.toLowerCase\(\))?$/, /^provenanceMarkHtml\((ctx\.provenance|prov\.state)\)$/, /^subs$/,
  // moderation-html.js (/mod): label comes from the fixed FIELDS table, k is forced to a KIND_LABEL key by kindOf(),
  // show() is a FIELDS formatter (escapeHtml or photoText); rows/queue/panel are assembled from these same builders
  /^(label|k|KIND_LABEL\[k\]|d\.rows|queue|panel)$/, /^show\((current|proposed)\[key\]\)$/,
  /^items\.map\(\(it, i\) => modRowHtml\(it, ctxs\[i\]\)\)\.join\(''\)$/,
];
// A conditional is safe when every branch that can be rendered is safe: a fixed string literal, a template whose own
// interpolations are all safe, or a nested conditional (checked recursively). The condition itself is never rendered.
function splitTernary(e) {
  let depth = 0, q = null, qPos = -1, nested = 0;
  for (let i = 0; i < e.length; i++) {
    const c = e[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; continue; }
    if ('([{'.includes(c)) depth++; else if (')]}'.includes(c)) depth--;
    else if (depth === 0 && c === '?' && e[i + 1] !== '.' && e[i + 1] !== '?') { if (qPos < 0) qPos = i; else nested++; }
    else if (depth === 0 && c === ':' && qPos >= 0) { if (nested) nested--; else return [e.slice(qPos + 1, i).trim(), e.slice(i + 1).trim()]; }
  }
  return null;
}
function isSafe(e) {
  if (SAFE_EXPR.some((re) => re.test(e))) return true;
  if (/^'[^'\\]*'$/.test(e)) return true;                                          // fixed string literal
  if (/^`[^`]*`$/.test(e)) return interpolations(e.slice(1, -1)).every((x) => isSafe(x.replace(/\s+/g, ' ')));
  const t = splitTernary(e);
  return !!t && t.every(isSafe);
}
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
  const files = ['js/modules/list-html.js', 'js/modules/pin-html.js', 'js/modules/moderation-html.js', 'js/modules/logbook.js', 'js/modules/auth-ui.js',
    'js/modules/search.js', 'js/modules/list.js', 'js/modules/explore.js', 'js/modules/filters.js', 'js/modules/map.js',
    'js/modules/page-html.js', 'js/modules/gym-page.js', 'js/modules/router.js', 'js/modules/slug.js', 'js/modules/region-page.js', 'js/modules/mini-map.js',
    'js/modules/provenance.js', 'js/modules/community.js', 'js/modules/me-page.js', 'js/modules/log-page.js', 'js/modules/mod-page.js'];
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
        if (!isSafe(e)) unsafe.push(f + ': ${' + e.slice(0, 110) + '}');
      }
    }
  }
  assert.deepEqual([...new Set(unsafe)], [], 'unreviewed interpolation(s) in HTML templates:\n  ' + [...new Set(unsafe)].join('\n  '));
});

test('photo URLs are validated at every render site and at both submit handlers', () => {
  assert.ok((read('js/modules/list-html.js').match(/safeUrl\(g\.photo\)/g) || []).length === 2, 'thumbHtml and peekHtml validate the photo');
  assert.ok(/const photo = safeUrl\(g\.photo\)/.test(read('js/modules/page-html.js')), 'the gym page hero validates the photo');
  assert.ok(/safeUrl\(photo\)/.test(read('js/modules/moderation-html.js')));
  const modals = read('js/modules/modals.js');
  assert.ok(/fPhotoRaw && !safeUrl\(fPhotoRaw\)/.test(modals) && /ePhotoRaw && !safeUrl\(ePhotoRaw\)/.test(modals));
  // no other place renders a photo into markup
  for (const f of moduleFiles) {
    // moderation.js only copies pe.photo into the approved-edit UPDATE payload (data, never rendered as markup)
    // filters.js only tests safeUrl(g.photo) for the "Has photos" filter (a boolean, never markup)
    if (/list-html|page-html|moderation-html|modals\.js|html-safe|moderation\.js|filters\.js/.test(f)) continue;
    assert.ok(!/\.photo\b/.test(stripComments(read(f))) || /\.value\s*=/.test(read(f)), 'unreviewed photo use in ' + f);
  }
});
