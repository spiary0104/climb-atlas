#!/usr/bin/env node
// IndexNow (https://www.indexnow.org): tells Bing and the other IndexNow engines (Yandex, Naver, Seznam, Yep, Amazon; not
// Google) which pages are new, changed or gone, so they are crawled in hours instead of weeks. One POST to
// api.indexnow.org is shared with every participating engine. The key is public by design: /<key>.txt at the site root.
//   node scripts/indexnow.js --changed   URLs added to or removed from sitemap.xml since the last commit (after an apply)
//   node scripts/indexnow.js --all       every URL in sitemap.xml (once, after a redesign; the protocol allows this)
//   node scripts/indexnow.js --url <u>   one or more given URLs
//   add --dry-run to print without sending. Rules (protocol): only changed URLs, max 10,000 per request, same host.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const HOST = 'www.bouldeer.com';
const KEY = 'f9292e50f4f5bf906011ce6089ada374';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX = 10000;

const locs = xml => [...String(xml).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/&amp;/g, '&'));
const onHost = u => { try { return new URL(u).host === HOST; } catch(e){ return false; } };

// Added and removed URLs between two sitemap texts (removed pages are submitted too, so engines drop them).
function diff(before, after){
  const a = new Set(locs(before)), b = new Set(locs(after));
  return { added: [...b].filter(u => !a.has(u)), removed: [...a].filter(u => !b.has(u)) };
}
const chunks = (list, n = MAX) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));
const body = urlList => ({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList });

async function submit(urls, { dryRun = false, fetchImpl = globalThis.fetch } = {}){
  const list = [...new Set(urls)].filter(onHost);
  if(list.length !== new Set(urls).size) throw new Error('refusing: every URL must be on ' + HOST);
  const results = [];
  for(const part of chunks(list)){
    if(dryRun){ results.push({ status: 'dry-run', count: part.length }); continue; }
    const res = await fetchImpl(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body(part)) });
    results.push({ status: res.status, count: part.length });
  }
  return results;
}
const MEANING = { 200: 'accepted', 202: 'accepted (key check pending)', 400: 'bad request', 403: 'key not found at /' + KEY + '.txt (deployed yet?)',
  422: 'URL not on the host or key mismatch', 429: 'too many requests: wait and retry later' };

if(require.main === module){
  const args = process.argv.slice(2), dryRun = args.includes('--dry-run');
  const now = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  let urls = [];
  if(args.includes('--all')) urls = locs(now);
  else if(args.includes('--changed')){
    let before = '';
    try { before = execFileSync('git', ['show', 'HEAD:sitemap.xml'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }); } catch(e){ /* no committed sitemap */ }
    const d = diff(before, now);
    console.log(`IndexNow: ${d.added.length} new and ${d.removed.length} removed page(s) since the last commit`);
    urls = [...d.added, ...d.removed];
  } else {
    for(let i = 0; i < args.length; i++) if(args[i] === '--url' && args[i + 1]) urls.push(args[++i]);
  }
  if(!urls.length){ console.log('IndexNow: nothing to submit'); process.exit(0); }
  submit(urls, { dryRun }).then(results => {
    let ok = true;
    for(const r of results){
      const good = r.status === 'dry-run' || r.status === 200 || r.status === 202;
      ok = ok && good;
      console.log(`IndexNow: ${r.count} URL(s): ${r.status}${MEANING[r.status] ? ' ' + MEANING[r.status] : ''}`);
    }
    process.exit(ok ? 0 : 1);
  }).catch(e => { console.error('IndexNow: ' + e.message); process.exit(1); });
}
module.exports = { HOST, KEY, ENDPOINT, MAX, locs, diff, chunks, body, submit };
