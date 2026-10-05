#!/usr/bin/env node
// Regenerate sitemap.xml from the approved gyms in production (the same public read the site makes: anon key, GET only).
//   node scripts/build-sitemap.js            writes ./sitemap.xml
//   node scripts/build-sitemap.js --dry      prints the counts, writes nothing
// Also writes api/_places.json (link-preview titles) and data/spots-fallback.json (the app's offline list).
// Re-run after every data batch (docs/import-workflow.md), then commit sitemap.xml, api/_places.json and data/spots-fallback.json.
'use strict';
const fs = require('fs');
const path = require('path');
const { fetchLive, ROOT } = require('./lib/gym-import/index-store');
const { buildSitemap, buildPlaces } = require('./lib/sitemap');
const { buildFallback } = require('./lib/fallback');

(async () => {
  const { rows, host } = await fetchLive();
  if (rows.length < 100) throw new Error(`Only ${rows.length} approved rows from ${host}; refusing to write a sitemap from a suspiciously small read`);
  const { xml, counts, total, skipped } = await buildSitemap(rows);
  console.log(`${rows.length} approved gyms from ${host}`);
  console.log('URLs by type:', JSON.stringify(counts), 'total', total);
  console.log('Skipped:', JSON.stringify(skipped));
  // The offline list (data/spots-fallback.json): the Explore list columns of the same rows.
  const fallback = buildFallback(rows);
  console.log(`Offline fallback: ${fallback.count} gyms, ${fallback.columns.length} columns, ${Buffer.byteLength(fallback.text)} bytes`);
  if (process.argv.includes('--dry')) return;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  console.log('Wrote sitemap.xml');
  // The link-preview function's place titles (api/seo.mjs), from the same read.
  const places = await buildPlaces(rows);
  fs.writeFileSync(path.join(ROOT, 'api', '_places.json'), JSON.stringify(places) + '\n');
  console.log('Wrote api/_places.json:', Object.keys(places.places).length, 'place pages');
  fs.writeFileSync(path.join(ROOT, 'data', 'spots-fallback.json'), fallback.text);
  console.log('Wrote data/spots-fallback.json');
})().catch(e => { console.error(e.message); process.exit(1); });
