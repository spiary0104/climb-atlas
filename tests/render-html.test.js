// Renders the popup and the moderator panel with benign and with hostile database values, and checks that hostile values
// cannot add tags, attributes, event handlers or executable links.   node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

// constants.js reads window.matchMedia at import time; the builders themselves are DOM-free.
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = () => ({ matches: false });

const modules = (async () => ({
  popup: await import('../js/modules/popup-html.js'),
  mod: await import('../js/modules/moderation-html.js'),
}))();

// Minimal HTML tokenizer (enough for our own templates): returns [{tag, attrs:{name:value}}] for every start tag.
function tags(html) {
  const out = [];
  const re = /<([a-zA-Z][\w-]*)((?:\s+[^\s"'<>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = {};
    const are = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let a;
    while ((a = are.exec(m[2]))) attrs[a[1]] = a[2] ?? a[3] ?? a[4] ?? '';
    out.push({ tag: m[1].toLowerCase(), attrs });
  }
  return out;
}
const shape = html => tags(html).map(t => t.tag + '[' + Object.keys(t.attrs).sort().join(',') + ']');
const hasHandlerAttrs = html => tags(html).some(t => Object.keys(t.attrs).some(n => /^on/i.test(n)));
const allText = html => html.replace(/<[^>]*>/g, '');

const HOSTILE = [
  '"><img src=x onerror=window.__pwned=1>',
  "' onmouseover='window.__pwned=2",
  'x" onfocus="window.__pwned=3" autofocus x="',
  '</div><script>window.__pwned=4</script>',
  '<svg/onload=window.__pwned=5>',
  '`onerror=window.__pwned=6`',
  '&quot;&lt;b&gt;',
];

const benignSpot = { id: 'community-0f3a7c2e-1111-4222-8333-444455556666', name: 'Boulder Barn', suburb: 'Surry Hills', state: 'NSW', country: 'AU',
  types: ['indoor-bouldering', 'top-rope'], address: '1 Example St', notes: 'Friendly staff', photo: 'https://example.com/a.jpg', lat: -33.9, lng: 151.2 };

test('popup: hostile values in every field cannot add tags/attributes or handlers (structure is identical to a benign render)', async () => {
  const { popup } = await modules;
  const benign = popup.buildPopupHtml(benignSpot, { region: 'New South Wales' });
  for (const h of HOSTILE) {
    const hostile = popup.buildPopupHtml({ ...benignSpot, id: h, name: h, suburb: h, address: h, notes: h, types: [h, 'top-rope'] }, { region: h });
    assert.deepEqual(shape(hostile), shape(benign), 'tag/attribute structure changed for payload ' + h);
    assert.equal(hasHandlerAttrs(hostile), false, 'event-handler attribute injected: ' + h);
    assert.ok(!/<script|<svg/i.test(hostile), 'raw markup leaked: ' + h);   // (attribute VALUES may legitimately contain the escaped text)
  }
});

test('popup: no inline event handlers at all; buttons use data-popup-action and the id is attribute-escaped', async () => {
  const { popup } = await modules;
  const html = popup.buildPopupHtml({ ...benignSpot, id: 'x"><b>' });
  assert.equal(hasHandlerAttrs(html), false);
  assert.ok(!/window\.__|onclick|onerror/i.test(html));
  const btns = tags(html).filter(t => t.attrs['data-popup-action']);
  assert.deepEqual(btns.map(b => b.attrs['data-popup-action']), ['climbed', 'bookmarked', 'edit', 'report']);
  for (const b of btns) assert.equal(b.attrs['data-spot-id'], 'x&quot;&gt;&lt;b&gt;');   // the browser decodes this into plain text via dataset; it is never code
});

test('popup: javascript:/data: photo is not rendered as an image; a normal https photo is', async () => {
  const { popup } = await modules;
  for (const bad of ['javascript:alert(1)', 'data:image/svg+xml;base64,PHN2Zz4=', 'JAVASCRIPT:alert(1)', 'not a url', '//evil.example/x.png', 'https://x"onerror="alert(1)']) {
    assert.equal(tags(popup.buildPopupHtml({ ...benignSpot, photo: bad })).some(t => t.tag === 'img'), false, bad);
  }
  const imgs = tags(popup.buildPopupHtml(benignSpot)).filter(t => t.tag === 'img');
  assert.equal(imgs.length, 1);
  assert.equal(imgs[0].attrs.src, 'https://example.com/a.jpg');
  assert.equal(Object.keys(imgs[0].attrs).some(n => /^on/i.test(n)), false);     // the old inline onerror is gone
});

test('popup: quotes and HTML-special characters in ordinary text survive as text', async () => {
  const { popup } = await modules;
  const html = popup.buildPopupHtml({ ...benignSpot, name: 'Tom & Jerry\'s "Rock" <Gym>', notes: '5 < 6 & "quoted"' });
  assert.ok(html.includes('Tom &amp; Jerry&#39;s &quot;Rock&quot; &lt;Gym&gt;'));
  assert.ok(html.includes('5 &lt; 6 &amp; &quot;quoted&quot;'));
  assert.equal(shape(html).length, shape(popup.buildPopupHtml(benignSpot)).length);
});

test('popup: normal behaviour preserved (name, place, types, address, marks state, directions link)', async () => {
  const { popup } = await modules;
  const html = popup.buildPopupHtml(benignSpot, { climbed: true, bookmarked: false, region: 'New South Wales' });
  const text = allText(html);
  assert.ok(text.includes('Boulder Barn') && text.includes('Surry Hills, New South Wales'));
  assert.ok(/ouldering/.test(text) && /op rope/i.test(text));
  assert.ok(text.includes('1 Example St') && text.includes('Friendly staff'));
  const climbed = tags(html).find(t => t.attrs['data-popup-action'] === 'climbed');
  const saved = tags(html).find(t => t.attrs['data-popup-action'] === 'bookmarked');
  assert.match(climbed.attrs.class, /\bactive\b/);
  assert.doesNotMatch(saved.attrs.class, /\bactive\b/);
  const dir = tags(html).find(t => t.attrs.class === 'popup-directions-btn');
  assert.match(dir.attrs.href, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&amp;destination=/);
});

const pendingSpot = { id: 'community-aaaa', name: 'N', suburb: 'S', state: 'NSW', country: 'AU', types: ['top-rope'], address: 'A', notes: 'n', photo: 'https://example.com/p.jpg' };
const pendingEdit = { id: '11111111-2222-3333-4444-555555555555', spot_id: 'seed-1', name: 'N', suburb: 'S', state: 'NSW', country: 'AU', types: ['top-rope'], address: 'A', notes: 'n', photo: 'https://example.com/p.jpg' };
const pendingReport = { id: '99999999-2222-3333-4444-555555555555', spot_id: 'seed-1', message: 'wrong pin' };
const findSpot = id => (id === 'seed-1' ? { id, name: 'Known Gym' } : undefined);

test('moderator panel: hostile state/country/types/id/name/etc. cannot alter the markup (all three card types)', async () => {
  const { mod } = await modules;
  const benign = mod.pendingPanelHtml({ spots: [pendingSpot], edits: [pendingEdit], reports: [pendingReport], findSpot });
  for (const h of HOSTILE) {
    const hostile = mod.pendingPanelHtml({
      spots: [{ ...pendingSpot, id: h, name: h, suburb: h, state: h, country: h, types: [h], address: h, notes: h }],
      edits: [{ ...pendingEdit, id: h, spot_id: h, name: h, suburb: h, state: h, country: h, types: [h], address: h, notes: h }],
      reports: [{ ...pendingReport, id: h, spot_id: h, message: h }],
      findSpot,
    });
    assert.deepEqual(shape(hostile), shape(benign), 'markup structure changed for payload ' + h);
    assert.equal(hasHandlerAttrs(hostile), false, 'handler injected: ' + h);
    assert.ok(!/<script|<svg/i.test(hostile), 'raw markup leaked: ' + h);
  }
});

test('moderator panel: a javascript: photo submitted via a pending edit is shown as inert text, never a link (the reported vector)', async () => {
  const { mod } = await modules;
  for (const bad of ['javascript:alert(document.domain)', 'JaVaScRiPt:alert(1)', ' javascript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x']) {
    const edit = mod.pendingPanelHtml({ spots: [], edits: [{ ...pendingEdit, photo: bad }], reports: [], findSpot });
    const spot = mod.pendingPanelHtml({ spots: [{ ...pendingSpot, photo: bad }], edits: [], reports: [], findSpot });
    for (const html of [edit, spot]) {
      assert.equal(tags(html).some(t => t.tag === 'a'), false, 'link rendered for ' + JSON.stringify(bad));
      assert.ok(!/href\s*=/i.test(html), 'href present for ' + JSON.stringify(bad));
      assert.ok(html.includes('not a web link'), 'not marked inert');
    }
  }
  // an ordinary https photo is still a working link, with rel=noopener
  const ok = tags(mod.pendingPanelHtml({ spots: [], edits: [pendingEdit], reports: [], findSpot })).find(t => t.tag === 'a');
  assert.equal(ok.attrs.href, 'https://example.com/p.jpg');
  assert.match(ok.attrs.rel, /noopener/);
  assert.equal(ok.attrs.target, '_blank');
});

test('moderator panel: destructive buttons are .btn-danger (never .btn-cancel)', async () => {
  const { mod } = await modules;
  const html = mod.pendingPanelHtml({ spots: [pendingSpot], edits: [pendingEdit], reports: [pendingReport], findSpot });
  const btns = tags(html).filter(t => t.tag === 'button');
  assert.ok(!btns.some(b => /\bbtn-cancel\b/.test(b.attrs.class)));
  for (const b of btns.filter(b => /pending-(reject|dismiss)/.test(b.attrs.class))) assert.match(b.attrs.class, /\bbtn-danger\b/);
  assert.equal(btns.filter(b => /pending-reject/.test(b.attrs.class)).length, 2);
  assert.equal(btns.filter(b => /pending-dismiss/.test(b.attrs.class)).length, 1);
});

test('moderator panel: normal behaviour preserved (edit shows target spot name, empty state, unknown type text)', async () => {
  const { mod } = await modules;
  const html = mod.pendingPanelHtml({ spots: [pendingSpot], edits: [pendingEdit], reports: [pendingReport], findSpot });
  const text = allText(html);
  assert.ok(text.includes('New spot') && text.includes('Edit to Known Gym') && text.includes('Report on Known Gym') && text.includes('wrong pin'));
  assert.ok(text.includes('S, NSW (AU)'));
  assert.equal(mod.pendingPanelHtml({ spots: [], edits: [], reports: [], findSpot }), '<div class="empty-state">Nothing pending review.</div>');
  // unknown type strings (types is free text in the database) are shown as text, not dropped or executed
  const odd = mod.pendingPanelHtml({ spots: [{ ...pendingSpot, types: ['bouldering-cave'] }], edits: [], reports: [], findSpot });
  assert.ok(allText(odd).includes('bouldering-cave'));
  // missing/odd optional data does not throw
  assert.doesNotThrow(() => mod.pendingPanelHtml({ spots: [{ ...pendingSpot, types: null, address: null, notes: null, photo: null }], edits: [], reports: [], findSpot }));
});
