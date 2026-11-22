// IndexNow submission (scripts/indexnow.js): the key file, what is sent and to where. No network: fetch is a fake.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const N = require('../scripts/indexnow.js');
const ROOT = path.join(__dirname, '..');

test('IndexNow key: 8-128 [a-zA-Z0-9-] characters, served at the site root as <key>.txt containing only the key', () => {
  assert.match(N.KEY, /^[a-zA-Z0-9-]{8,128}$/);
  assert.equal(fs.readFileSync(path.join(ROOT, N.KEY + '.txt'), 'utf8'), N.KEY);
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  assert.ok(!v.redirects.some(r => new RegExp('^' + r.source.replace(/:path\*/g, '.*').replace(/\./g, '\.') + '$').test('/' + N.KEY + '.txt')), 'the key file is not redirected away');
});

test('IndexNow: added and removed sitemap URLs are submitted; unchanged ones are not', () => {
  const sm = urls => urls.map(u => `<url><loc>https://www.bouldeer.com${u}</loc></url>`).join('');
  const d = N.diff(sm(['/', '/gym/a', '/gym/b']), sm(['/', '/gym/b', '/gym/c']));
  assert.deepEqual(d, { added: ['https://www.bouldeer.com/gym/c'], removed: ['https://www.bouldeer.com/gym/a'] });
  assert.deepEqual(N.diff('', sm(['/x'])).added, ['https://www.bouldeer.com/x'], 'no committed sitemap: everything is new');
});

test('IndexNow: one POST per 10,000 URLs to api.indexnow.org with host, key, keyLocation; other hosts refused', async () => {
  const sent = [];
  const fetchImpl = async (url, opts) => { sent.push({ url, opts, body: JSON.parse(opts.body) }); return { status: 200 }; };
  const urls = Array.from({ length: 10001 }, (_, i) => 'https://www.bouldeer.com/gym/g' + i);
  const r = await N.submit(urls, { fetchImpl });
  assert.deepEqual(r.map(x => x.count), [10000, 1]);
  assert.equal(sent[0].url, 'https://api.indexnow.org/indexnow');
  assert.equal(sent[0].opts.method, 'POST');
  assert.equal(sent[0].opts.headers['Content-Type'], 'application/json; charset=utf-8');
  assert.deepEqual(Object.keys(sent[0].body), ['host', 'key', 'keyLocation', 'urlList']);
  assert.equal(sent[0].body.host, 'www.bouldeer.com');
  assert.equal(sent[0].body.keyLocation, 'https://www.bouldeer.com/' + N.KEY + '.txt');
  await assert.rejects(() => N.submit(['https://evil.example/x'], { fetchImpl }), /every URL must be on/);
  assert.deepEqual(await N.submit(['https://www.bouldeer.com/a'], { dryRun: true, fetchImpl: () => { throw new Error('sent'); } }), [{ status: 'dry-run', count: 1 }]);
});

test('apply-batch.ps1 submits changed pages after rebuilding the sitemap, and a failure never fails the apply', () => {
  const ps = fs.readFileSync(path.join(ROOT, 'scripts/apply-batch.ps1'), 'utf8');
  assert.ok(ps.indexOf('build-sitemap.js') < ps.indexOf('indexnow.js --changed'));
  assert.ok(!/indexnow[^\n]*\n[^\n]*exit 1/.test(ps), 'IndexNow failure must only warn');
});
