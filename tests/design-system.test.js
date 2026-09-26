// Bouldeer design-system regression checks (docs/DESIGN.md sec. 2-5, 12, 17 Phase 1 acceptance, 18 visual QA).
// Static: reads the served files; no browser.   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const T = require('../scripts/build-tokens-json.js');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const stripCssComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
const stripJsComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
const COMPONENT_CSS = ['css/base.css', 'css/components.css', 'css/explore.css', 'css/style.css'];
const PAGES = ['index.html', 'about.html'];
const modDir = path.join(ROOT, 'js', 'modules');
const JS = ['js/main.js', 'js/auth.js', 'js/supabase-init.js', 'js/sw-register.js', ...fs.readdirSync(modDir).filter(f => f.endsWith('.js')).map(f => 'js/modules/' + f)];
const tokens = T.parseTokensCss(read('css/tokens.css'));
const DEFINED = new Set([...Object.keys(tokens.base), ...Object.keys(tokens.paper), ...Object.keys(tokens.rock)]);

// Innermost `selector { declarations }` blocks (rules inside @media included), comments removed.
function rules(css) {
  return [...stripCssComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ selector: m[1].trim().replace(/\s+/g, ' '), body: m[2] }));
}
const classesOf = tag => ((/class="([^"]*)"/.exec(tag.replace(/\$\{[^}]*\}/g, ' ')) || [])[1] || '').split(/\s+/).filter(Boolean);
const decl = (body, prop) => { const m = new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*([^;]+)').exec(body); return m ? m[1].trim() : null; };

// ===== tokens: architecture, parity with design/tokens.json ======================================================
test('tokens: design/tokens.json is generated from css/tokens.css and round-trips exactly (native-app source cannot drift)', () => {
  assert.equal(read('design/tokens.json').split('\r\n').join('\n'), T.render(), 'design/tokens.json is stale: run node scripts/build-tokens-json.js');
  const back = T.flattenJson(JSON.parse(read('design/tokens.json')));
  for (const set of ['base', 'paper', 'rock']) {
    assert.deepEqual(Object.keys(back[set]).sort(), Object.keys(tokens[set]).sort(), set + ' token names differ');
    for (const k of Object.keys(tokens[set])) assert.equal(T.normaliseCss(k, back[set][k]), T.normaliseCss(k, tokens[set][k]), set + ' ' + k);
  }
  const json = JSON.parse(read('design/tokens.json'));
  assert.deepEqual(json.shadow.raised.$value.map(s => Object.keys(s)), [['offsetX', 'offsetY', 'blur', 'spread', 'color'], ['offsetX', 'offsetY', 'blur', 'spread', 'color']], 'shadows are {offsetX, offsetY, blur, spread, color} objects');
});

test('tokens: three layers -- primitives only in tokens.css, every role themed consistently, rock overrides only existing roles', () => {
  for (const f of [...COMPONENT_CSS, ...PAGES, ...JS]) assert.ok(!/var\(--palette-/.test(read(f)), f + ' references a primitive (--palette-*): use a semantic role');
  for (const [name, value] of [...Object.entries(tokens.paper), ...Object.entries(tokens.rock)]) {
    assert.match(name, /^--color-/, 'themed tokens are colour roles: ' + name);
    assert.ok(/^var\(--palette-[a-z0-9-]+\)$/.test(value), 'a role resolves to a primitive: ' + name + ' = ' + value);
  }
  for (const name of Object.keys(tokens.rock)) assert.ok(name in tokens.paper, 'rock overrides an unknown role: ' + name);
  for (const req of ['--color-surface-canvas', '--color-surface-default', '--color-text-primary', '--color-border-subtle', '--color-border-strong',
    '--color-accent-solid', '--color-highlight-solid', '--color-focus-ring']) assert.ok(req in tokens.paper, 'missing paper role ' + req);
  for (const req of ['--color-type-boulder', '--color-type-toprope', '--color-type-lead', '--color-provenance-community', '--color-provenance-verified',
    '--color-provenance-pending', '--font-display', '--font-text', '--shadow-raised', '--shadow-overlay', '--radius-sm', '--radius-md', '--radius-lg',
    '--radius-xl', '--radius-pill', '--motion-fast', '--motion-reveal', '--ease-stamp', '--size-touch-min', '--size-row-dense', '--map-canvas', '--pin-size-city']) {
    assert.ok(DEFINED.has(req), 'missing token ' + req);
  }
  assert.deepEqual(['sm', 'md', 'lg', 'xl'].map(k => tokens.base['--radius-' + k]), ['6px', '10px', '14px', '20px'], 'one radius factor: 6/10/14/20');
  for (const [name, v] of Object.entries(tokens.base).filter(([n]) => /^--space-/.test(n))) assert.equal(parseInt(v, 10) % 4, 0, 'spacing is a multiple of 4: ' + name);
});

test('every var(--x) used in CSS, HTML and JS resolves to a defined token (catches retired names like --text-dim, --accent, --chip)', () => {
  const unknown = [];
  // Layout values measured at runtime (sheet.js) are set with style.setProperty and always read with a CSS fallback.
  const RUNTIME = new Set(JS.flatMap(f => [...read(f).matchAll(/setProperty\('(--[a-z0-9-]+)'/g)].map(m => m[1])));
  for (const f of [...COMPONENT_CSS, ...PAGES, ...JS, 'css/tokens.css']) {
    for (const m of read(f).matchAll(/var\((--[a-z0-9-]+)(,?)/g)) {
      if (DEFINED.has(m[1])) continue;
      if (RUNTIME.has(m[1]) && m[2] === ',') continue;
      unknown.push(f + ': ' + m[1]);
    }
  }
  assert.deepEqual([...new Set(unknown)], []);
});

// ===== colour ======================================================================================================
test('zero raw colour values outside css/tokens.css (CSS, page markup, inline styles, JS)', () => {
  const COLOUR = /#[0-9a-fA-F]{3,8}(?![\w-])|\brgba?\(|\bhsla?\(|\b(white|black)\b(?=\s*[;!)}])/;
  for (const f of COMPONENT_CSS) assert.ok(!COLOUR.test(stripCssComments(read(f))), f + ' contains a raw colour');
  for (const f of JS) assert.ok(!/#[0-9a-fA-F]{6}(?![\w-])|#[0-9a-fA-F]{3}(?![\w-])|\brgba?\(/.test(stripJsComments(read(f))), f + ' contains a raw colour');
  for (const f of PAGES) {
    const html = read(f).replace(/<meta name="theme-color"[^>]*>/g, '').replace(/<link rel="icon"[^>]*>/g, '');   // platform metadata, not UI styling
    assert.ok(!/<style[\s>]/.test(html), f + ' has an inline <style> block');
    for (const m of html.matchAll(/style="([^"]*)"/g)) assert.ok(!COLOUR.test(m[1]), f + ' inline style colour: ' + m[1]);
    assert.ok(!COLOUR.test(html.replace(/<svg[\s\S]*?<\/svg>/g, '')), f + ' contains a raw colour');
  }
});

test('the region colour system is gone (no per-region variables, no chips.css, no --chip, no coloured region dots)', () => {
  assert.equal(fs.existsSync(path.join(ROOT, 'css', 'chips.css')), false);
  const all = [...COMPONENT_CSS, 'css/tokens.css'].map(f => stripCssComments(read(f))).concat(PAGES.map(read), [...JS, 'sw.js'].map(f => stripJsComments(read(f)))).join('\n');
  assert.ok(!/chips\.css/.test(all), 'chips.css still referenced');
  assert.ok(!/--chip\b/.test(all), '--chip still used');
  assert.ok(!/--(au|us|jp|de|fr|kr|cn|gb|ca|nz|es|it|se|nl)-[a-z]/.test(all), 'region colour variables still present');
  assert.ok(!/<span class="dot"><\/span>/.test(read('index.html')), 'region chips still carry colour dots');
});

test('climb-type colours appear only through the type roles (pins, type dots/tags)', () => {
  const css = read('css/explore.css');
  for (const [cls, role] of [['boulder', 'boulder'], ['toprope', 'toprope'], ['lead', 'lead']]) assert.match(css, new RegExp('\\.pin-body--' + cls + '\\{fill:var\\(--color-type-' + role + '\\);\\}'), 'pin colour for ' + cls);
  const uses = COMPONENT_CSS.flatMap(f => rules(read(f)).filter(r => /--color-type-/.test(r.body)).map(r => r.selector));
  for (const s of uses) assert.match(s, /type-tag|type-dot|pin-body/, 'type colour used outside pins and type tags/dots: ' + s);
});

// ===== typography ==================================================================================================
test('typography: Fraunces + Inter only; no Space Grotesk / Space Mono / Fredoka; exact Google Fonts request with crossorigin', () => {
  const served = [...COMPONENT_CSS, 'css/tokens.css', ...PAGES, ...JS, 'manifest.json'].map(read).join('\n');
  assert.ok(!/Space Grotesk|Space\+Grotesk|Space Mono|Space\+Mono|Fredoka|--font-mono|--font-body/.test(served), 'retired font or token present');
  for (const f of PAGES) {
    const links = [...read(f).matchAll(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"([^>]*)>/g)];
    assert.equal(links.length, 1, f + ': one Google Fonts stylesheet');
    assert.equal(links[0][1], 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap', f);
    assert.match(links[0][2], /crossorigin="anonymous"/, f);
  }
  assert.match(tokens.base['--font-display'], /^"Fraunces", Georgia/); assert.match(tokens.base['--font-text'], /^"Inter", system-ui/);
});

test('typography: no 700 weight; weights come from tokens; body text is 400', () => {
  for (const f of COMPONENT_CSS) {
    for (const r of rules(read(f))) {
      const w = decl(r.body, 'font-weight');
      if (w) assert.ok(/^var\(--(font-weight-(regular|medium|semibold)|type-[a-z-]+-weight)\)$/.test(w), `${f} ${r.selector}: font-weight ${w}`);
    }
    assert.ok(!/font-weight\s*:\s*(700|800|900|bold)/.test(read(f)), f + ' uses 700+');
  }
  for (const [n, v] of Object.entries(tokens.base).filter(([n]) => /weight/.test(n))) assert.ok(['400', '500', '600'].includes(v), n + ' = ' + v);
  assert.match(decl(rules(read('css/base.css')).find(r => r.selector === 'body').body, 'font-weight'), /regular/);
});

test('typography: Fraunces (--font-display) only at 18px and above, and never on controls', () => {
  const px = v => { const m = /^var\((--[a-z0-9-]+)\)$/.exec(v || ''); const raw = m ? tokens.base[m[1]] : v; return parseFloat(raw); };
  for (const f of COMPONENT_CSS) {
    for (const r of rules(read(f))) {
      if (decl(r.body, 'font-family') !== 'var(--font-display)') continue;
      const size = decl(r.body, 'font-size');
      const inherited = /^\.t-display-(xl|lg|md|sm)(,|$)/.test(r.selector);          // the scale classes set size per class
      if (!inherited) assert.ok(size && px(size) >= 18, `${f} ${r.selector}: serif at ${size}`);
      assert.ok(!/\b(btn|chip|input|select|textarea|label|tab)\b/.test(r.selector), `${f} ${r.selector}: serif on a control`);
    }
  }
  for (const n of ['xl', 'lg', 'md', 'sm']) assert.ok(parseFloat(tokens.base[`--type-display-${n}-size`]) >= 18, 'display-' + n);
});

// ===== surfaces: radius and shadows ===============================================================================
test('radius: only the scale (6/10/14/20) plus pill/circle/checkbox; pill only on chips, the primary button, search, START, grabber', () => {
  const PILL_OK = /\.btn-primary|\.chip\b|\.search-field input|\.start-disc|\.sheet-grabber|\.pin-label|\.map-toggle\b/;   // + the pin label pill and the map chip (sec. 7.2, 7.7)
  for (const f of COMPONENT_CSS) {
    for (const r of rules(read(f))) {
      const v = decl(r.body, 'border-radius');
      if (!v) continue;
      assert.ok(v.replace(/\s*!important$/, '').split(/\s+/).every(p => /^var\(--radius-(none|check|sm|md|lg|xl|pill|circle)\)$|^0$/.test(p)), `${f} ${r.selector}: border-radius ${v}`);
      if (/--radius-pill/.test(v)) assert.match(r.selector, PILL_OK, `${f} ${r.selector}: pill not permitted here`);
    }
  }
});

test('shadows: exactly two; raised only on objects floating over the map, overlay only on dialogs/sheets/menus/drawer; nothing else', () => {
  const RAISED_OK = /\.map-float|\.toast|\.maplibregl-ctrl-group|\.pin-label|\.map-search-slot/;
  const OVERLAY_OK = /\.modal\b|\.menu\b|\.sheet\b|\.list-pane\b|\.peek\b|\.search-panel\b/;   // list pane + peek become sheets below 1024px
  for (const f of COMPONENT_CSS) {
    for (const r of rules(read(f))) {
      const v = decl(r.body, 'box-shadow');
      if (!v) continue;
      const clean = v.replace(/\s*!important$/, '');
      assert.ok(['var(--shadow-raised)', 'var(--shadow-overlay)', 'none', 'var(--shadow-none)'].includes(clean), `${f} ${r.selector}: box-shadow ${v}`);
      if (clean === 'var(--shadow-raised)') assert.match(r.selector, RAISED_OK, `${f} ${r.selector}: shadow.raised is for objects over the map only`);
      if (clean === 'var(--shadow-overlay)') assert.match(r.selector, OVERLAY_OK, `${f} ${r.selector}: shadow.overlay is for sheets/dialogs/menus only`);
    }
  }
  assert.ok(!/gradient\(/.test(COMPONENT_CSS.map(read).join('')), 'no gradients on surfaces (sec. 4.4)');
});

test('themes: the map region is rock, and every floating object inside it is paper', () => {
  const html = read('index.html');
  assert.match(html, /<main class="map-wrap"[^>]*data-theme="rock"/);
  const main = html.slice(html.indexOf('<main class="map-wrap"'), html.indexOf('</main>'));
  const floats = [...main.matchAll(/<(div|button)\b[^>]*>/g)].map(m => m[0]).filter(t => ['map-toggle', 'placing-banner'].some(c => classesOf(t).includes(c)) || /id="searchThisArea"/.test(t));
  assert.equal(floats.length, 3, '"Search as I move", "Search this area" and the placing banner found');
  for (const t of floats) { assert.ok(classesOf(t).includes('map-float'), t + ' is not a map-float'); assert.match(t, /data-theme="paper"/, t + ' is not paper'); }
  assert.match(main, /<div class="map-top" data-theme="paper">/, 'search + chips over the map are paper');
  assert.match(html, /<section class="peek map-float"[^>]*data-theme="paper"/, 'the peek card is a paper map-float');
  assert.match(read('js/modules/map.js'), /label\.dataset\.theme = 'paper'/, 'pin labels are paper objects');
  assert.ok(!/\.legend\b|id="legend|hint-banner|maplibregl-popup/.test(main + read('css/explore.css') + read('css/style.css')), 'legend, hint banner and popups are gone (sec. 6.6, 16.3)');
  for (const f of PAGES) assert.match(read(f), /data-theme="paper"/, f);
});

// ===== components ==================================================================================================
function buttonsIn(src) { return [...src.matchAll(/<button\b[^>]*>/g)].map(m => m[0]); }
test('buttons: every button is a .btn tier or a documented component control; retired classes are gone', () => {
  const CONTROLS = ['chip', 'tab', 'tabbar-item', 'start-btn', 'gym-row-main', 'gym-card-main', 'carousel-card', 'seg-btn', 'map-toggle', 'sheet-grabber-btn', 'avatar-btn', 'link'];
  const sources = [...PAGES.map(f => [f, read(f)]), ...JS.map(f => [f, stripJsComments(read(f))])];
  for (const [f, src] of sources) {
    for (const b of buttonsIn(src)) {
      const cls = classesOf(b);
      if (cls.includes('btn')) assert.ok(['btn-primary', 'btn-secondary', 'btn-tertiary'].filter(t => cls.includes(t)).length === 1, `${f}: .btn needs exactly one tier: ${b}`);
      else assert.ok(cls.some(c => CONTROLS.includes(c)), `${f}: button outside the system: ${b}`);
    }
    const RETIRED = ['add-btn', 'btn-submit', 'btn-cancel', 'mark-btn', 'btn-outline', 'btn-text', 'icon-btn'];
    for (const m of src.matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) assert.ok(!RETIRED.includes(c), `${f} uses retired class .${c}`);
  }
});

test('buttons: one filled primary action per dialog', () => {
  const html = read('index.html');
  const dialogs = [...html.matchAll(/<div class="modal[^"]*" role="dialog"[\s\S]*?(?=<div class="modal-backdrop|<script)/g)].map(m => m[0]);
  assert.ok(dialogs.length >= 9);
  for (const d of dialogs) assert.ok((d.match(/\bbtn-primary\b/g) || []).length <= 1, 'more than one primary in ' + /id="(dlg-[a-z-]+)"/.exec(d)[1]);
});

// ===== iconography =================================================================================================
const PICTOGRAPH = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}\u{FE0F}\u{2713}\u{2715}\u{2716}\u{2605}\u{2606}\u{270E}\u{2691}]/u;
test('no emoji or pictographic glyphs in the DOM, JS templates, toasts or CSS generated content', () => {
  for (const f of [...PAGES, ...JS]) {
    const src = f.endsWith('.js') ? stripJsComments(read(f)) : read(f);
    const hit = PICTOGRAPH.exec(src);
    assert.equal(hit, null, `${f}: pictographic character ${hit && JSON.stringify(hit[0])}`);
    assert.ok(!/&(larr|rarr|times|#9[0-9]{3});/.test(src), f + ': glyph entity used as an icon');
  }
  for (const f of COMPONENT_CSS) for (const m of stripCssComments(read(f)).matchAll(/content\s*:\s*"([^"]*)"/g)) assert.ok(/^( · |)$/.test(m[1]), `${f}: generated content "${m[1]}"`);
});

test('one icon system: every icon reference exists in assets/icons.svg; the sprite is plain Phosphor shapes with its licence', async () => {
  const sprite = read('assets/icons.svg');
  const ids = new Set([...sprite.matchAll(/<symbol id="i-([a-z-]+)"/g)].map(m => m[1]));
  const { ICON_NAMES, icon } = await import('../js/modules/icons.js');
  assert.deepEqual([...ICON_NAMES].sort(), [...ids].sort(), 'icons.js ICON_NAMES must match the sprite');
  for (const f of [...PAGES, ...JS]) for (const m of read(f).matchAll(/assets\/icons\.svg#i-([a-z-]+)/g)) assert.ok(ids.has(m[1]), `${f}: unknown icon ${m[1]}`);
  for (const f of JS) for (const m of stripJsComments(read(f)).matchAll(/\bicon\('([a-z-]+)'/g)) assert.ok(ids.has(m[1]), `${f}: unknown icon ${m[1]}`);
  assert.ok(!/<script|\son[a-z]+=|javascript:|href=/i.test(sprite.replace(/<!--[\s\S]*?-->/, '')), 'sprite contains only shapes');
  assert.match(sprite, /MIT License[\s\S]*Phosphor Icons/, 'licence notice kept');
  assert.throws(() => icon('not-an-icon'), /Unknown icon/);
  assert.equal(icon('x', { className: '"><script>' }).includes('<script'), false, 'className is sanitised');
  assert.match(icon('check', { size: 'sm' }), /^<svg class="icon icon-sm" aria-hidden="true" focusable="false"><use href="assets\/icons\.svg#i-check"\/><\/svg>$/);
});

test('provenance is quiet: text-only roles (no fills) and a ring-dot component', () => {
  const css = read('css/components.css');
  for (const r of rules(css).filter(r => /provenance|tag-pill/.test(r.selector))) assert.equal(decl(r.body, 'background'), null, r.selector + ' has a fill');
  assert.match(css, /\.provenance-mark\{[^}]*border:var\(--border-width\) solid currentColor/);
});

// ===== mascot, brand, navigation ===================================================================================
test('mascot: hooks only (no artwork placed yet), never in forms/dialogs/moderation/map, sizes from tokens', () => {
  const html = read('index.html');
  const slots = [...html.matchAll(/<span class="mascot[^"]*"[^>]*>([\s\S]*?)<\/span>/g)];
  assert.ok(slots.length >= 1, 'START has a mascot slot');
  for (const s of slots) assert.equal(s[1], '', 'mascot slot must stay empty until the asset is approved');
  assert.ok(!/<img[^>]*(mascot|deer)/i.test(html + read('about.html')), 'no mascot image in the DOM yet');
  const dialogs = html.slice(html.indexOf('<div class="modal-backdrop'));
  assert.ok(!/mascot/.test(dialogs), 'no mascot in dialogs');
  const main = html.slice(html.indexOf('<main class="map-wrap"'), html.indexOf('</main>'));
  assert.ok(!/mascot/.test(main), 'no mascot on the map');
  for (const f of ['js/modules/moderation-html.js', 'js/modules/moderation.js', 'js/modules/modals.js', 'js/modules/map.js', 'js/modules/pin-html.js', 'js/modules/list-html.js', 'js/modules/filters.js']) assert.ok(!/mascot/.test(read(f)), f);
  assert.match(read('css/components.css'), /\.mascot--spot\{width:var\(--size-mascot-spot\)/);
});

test('brand: Bouldeer everywhere a visitor reads it; "Climb Atlas" not reintroduced (the contact address and storage keys are identifiers)', () => {
  const withoutLegal = s => s.replace(/<div class="modal-backdrop hidden" id="(privacy|terms)ModalBackdrop">[\s\S]*?(?=<div class="modal-backdrop|<script)/g, '');
  const visible = [...PAGES, 'manifest.json', ...JS].map(f => [f, withoutLegal(read(f)).replace(/climbatlas0104@gmail\.com/g, '').replace(/climbatlas[_-][a-z_-]+/g, '')]);
  for (const [f, s] of visible) assert.ok(!/Climb ?<span>?Atlas|Climb Atlas|ClimbAtlas/i.test(s), f + ' shows the old brand');
  assert.match(read('index.html'), /<title>Bouldeer — /); assert.match(read('about.html'), /<title>About — Bouldeer<\/title>/);
  assert.match(read('index.html'), /<a class="wordmark"[^>]*>Bouldeer<\/a>/);
  assert.equal(JSON.parse(read('manifest.json')).name, 'Bouldeer');
});

test('navigation: top bar and tab bar expose the five areas; every [data-nav] target has a handler', () => {
  const html = read('index.html');
  const top = html.slice(html.indexOf('<header class="topbar"'), html.indexOf('</header>'));
  const tab = html.slice(html.indexOf('<nav class="tabbar"'), html.indexOf('</nav>', html.indexOf('<nav class="tabbar"')));
  assert.deepEqual([...top.matchAll(/data-nav="([a-z-]+)"/g)].map(m => m[1]), ['explore', 'regions', 'log', 'me']);
  assert.deepEqual([...tab.matchAll(/data-nav="([a-z-]+)"/g)].map(m => m[1]), ['explore', 'regions', 'start', 'log', 'me']);
  const handled = /const ACTIONS = \{([\s\S]*?)\n\};/.exec(read('js/modules/nav.js'))[1];
  for (const m of new Set([...html.matchAll(/data-nav="([a-z-]+)"/g)].map(m => m[1]), ['me'])) assert.match(handled, new RegExp(`(^|\\s|')${m}'?\\(\\)`), 'no handler for data-nav=' + m);
  assert.ok(!/count-badge|nav-toggle|mobile-toggle|tagline/.test(html), 'removed chrome (count badge, kebab, hamburger, tagline) is back');
});

// ===== Phase 0: CDN assets load in CORS mode so the service worker can cache them for offline boot =================
test('every external script and stylesheet is requested with crossorigin (opaque responses are never cached -> no offline boot)', () => {
  for (const f of PAGES) {
    const html = read(f);
    for (const m of html.matchAll(/<script\b[^>]*\bsrc="https:[^"]*"[^>]*>/g)) assert.match(m[0], /crossorigin="anonymous"/, f + ': ' + m[0]);
    for (const m of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="https:[^"]*"[^>]*>/g)) assert.match(m[0], /crossorigin="anonymous"/, f + ': ' + m[0]);
  }
});
