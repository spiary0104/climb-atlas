'use strict';
// Link previews (api/seo.mjs + vercel.json): crawler/unfurler user agents get per-page tags; people keep the static shell.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const fn = import('../api/seo.mjs');

const realFetch = globalThis.fetch;
function stubSpots(rows, { status = 200, throws = false } = {}){
  globalThis.fetch = async (url) => {
    if (throws) throw new Error('network down');
    assert.match(String(url), /\/rest\/v1\/spots\?slug=eq\./, 'only the one public spots read');
    return new Response(JSON.stringify(rows), { status, headers: { 'Content-Type': 'application/json' } });
  };
}
const get = async (q) => { const { GET } = await fn; const r = await GET(new Request('https://preview.example/api/seo?' + q)); return { status: r.status, html: await r.text(), cache: r.headers.get('cache-control') }; };
const tag = (html, re) => (re.exec(html) || [])[1];

test('gym: own title, description, canonical, og:url and (https photo) og:image, all escaped', async () => {
  stubSpots([{ name: 'Boulder <Barn> & Co', suburb: 'Newtown', state: 'NSW', country: 'AU', address: '1 Chalk St', types: ['indoor-bouldering'], slug: 'boulder-barn', photo: 'https://img.example/p.jpg' }]);
  try {
    const { status, html, cache } = await get('slug=boulder-barn');
    assert.equal(status, 200); assert.match(cache, /s-maxage=3600/);
    assert.equal(tag(html, /<title>([^<]*)<\/title>/), 'Boulder &lt;Barn&gt; &amp; Co · Bouldering gym in Newtown, NSW, Australia · Bouldeer');
    assert.equal(tag(html, /<link rel="canonical" href="([^"]*)">/), 'https://www.bouldeer.com/gym/boulder-barn');
    assert.equal(tag(html, /<meta property="og:url" content="([^"]*)">/), 'https://www.bouldeer.com/gym/boulder-barn');
    assert.equal(tag(html, /<meta property="og:image" content="([^"]*)">/), 'https://img.example/p.jpg');
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
    assert.match(tag(html, /<meta name="description" content="([^"]*)">/), /is a bouldering gym in Newtown, NSW, Australia\. Address: 1 Chalk St\./);
    assert.ok(!/<Barn>/.test(html), 'the name never reaches the markup unescaped');
    assert.equal((html.match(/<title>/g) || []).length, 1, 'tags are replaced, not duplicated');
  } finally { globalThis.fetch = realFetch; }
});

test('gym: no photo keeps the site image; unknown slug is a 404 with the shell; an upstream failure serves the shell', async () => {
  try {
    stubSpots([{ name: 'Plain', suburb: 'S', state: 'NSW', country: 'AU', types: [], slug: 'plain', photo: 'http://insecure.example/p.jpg' }]);
    let r = await get('slug=plain');
    assert.equal(tag(r.html, /<meta property="og:image" content="([^"]*)">/), 'https://www.bouldeer.com/icons/icon-512.png', 'http photos are never used');
    stubSpots([]); r = await get('slug=nope');
    assert.equal(r.status, 404); assert.match(r.html, /<title>Bouldeer — community-sourced climbing map<\/title>/);
    stubSpots([], { throws: true }); r = await get('slug=plain');
    assert.equal(r.status, 200); assert.match(r.html, /<title>Bouldeer — community-sourced climbing map<\/title>/);
    stubSpots([], { status: 500 }); r = await get('slug=plain');
    assert.equal(r.status, 200);
    r = await get('slug=' + encodeURIComponent('"><script>'));
    assert.equal(r.status, 200); assert.ok(!/"><script>/.test(r.html), 'odd slugs are not even looked up');
  } finally { globalThis.fetch = realFetch; }
});

test('places: country, region (any case), metro and multi-gym suburb pages get their titles; /in gets Regions', async () => {
  const pick = async q => { const { html } = await get(q); return [tag(html, /<title>([^<]*)/), tag(html, /og:url" content="([^"]*)/)]; };
  assert.deepEqual(await pick('path=au'), ['Climbing gyms in Australia · Bouldeer', 'https://www.bouldeer.com/in/au']);
  assert.deepEqual(await pick('path=au/NSW'), ['Climbing gyms in NSW, Australia · Bouldeer', 'https://www.bouldeer.com/in/au/nsw']);
  assert.deepEqual(await pick('path=au/nsw/sydney'), ['Climbing gyms in Sydney, NSW, Australia · Bouldeer', 'https://www.bouldeer.com/in/au/nsw/sydney']);
  assert.deepEqual(await pick('path='), ['Regions · Bouldeer', 'https://www.bouldeer.com/in']);
  assert.deepEqual(await pick('path=zz/nowhere'), ['Bouldeer — community-sourced climbing map', 'https://www.bouldeer.com/']);
});

test('vercel.json: only crawler and unfurler user agents reach the function, before the shell rewrites; its files are bundled', () => {
  const v = JSON.parse(read('vercel.json'));
  const fnRewrites = v.rewrites.filter(r => /^\/api\/seo/.test(r.destination));
  assert.deepEqual(fnRewrites.map(r => r.source), ['/gym/:slug', '/in', '/in/:path*']);
  for (const r of fnRewrites) {
    assert.equal(r.has[0].type, 'header'); assert.equal(r.has[0].key, 'user-agent');
    const re = new RegExp(r.has[0].value.re);
    for (const ua of ['facebookexternalhit/1.1', 'Twitterbot/1.0', 'Slackbot-LinkExpanding 1.0', 'WhatsApp/2.23', 'Discordbot/2.0', 'Mozilla/5.0 (compatible; Googlebot/2.1)', 'LinkedInBot/1.0', 'TelegramBot (like TwitterBot)'])
      assert.ok(re.test(ua), 'routes ' + ua);
    for (const ua of ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1', 'Mozilla/5.0 (Windows NT 10.0) Chrome/140.0 Safari/537.36'])
      assert.ok(!re.test(ua), 'people keep the static shell: ' + ua.slice(0, 30));
  }
  const firstShell = v.rewrites.findIndex(r => r.source === '/gym/:slug' && r.destination === '/index.html');
  assert.ok(v.rewrites.indexOf(fnRewrites[0]) < firstShell, 'bot rules come first (first match wins)');
  assert.equal(v.functions['api/seo.mjs'].includeFiles, '{index.html,js/supabase-init.js,js/modules/seo-meta.js,api/_places.json}');
  const places = JSON.parse(read('api/_places.json'));
  assert.equal(places.countries.AU, 'Australia'); assert.equal(places.places['/in/au/nsw/sydney'].title, 'Climbing gyms in Sydney, NSW, Australia');
  assert.ok(!/<script/i.test(read('api/seo.mjs').match(/injectMeta[\s\S]*?\n}/)[0]), 'no script is injected (CSP)');
});
