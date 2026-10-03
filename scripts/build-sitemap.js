#!/usr/bin/env node
// Regenerate sitemap.xml from the approved gyms in production (the same public read the site makes: anon key, GET only).
//   node scripts/build-sitemap.js            writes ./sitemap.xml
//   node scripts/build-sitemap.js --dry      prints the counts, writes nothing
// Re-run after every data batch (docs/import-workflow.md), then commit sitemap.xml.
'use strict';
const fs = require('fs');
const path = require('path');
const { fetchLive, ROOT } = require('./lib/gym-import/index-store');
const { buildSitemap } = require('./lib/sitemap');

(async () => {
  const { rows, host } = await fetchLive();
  if (rows.length < 100) throw new Error(`Only ${rows.length} approved rows from ${host}; refusing to write a sitemap from a suspiciously small read`);
  const { xml, counts, total, skipped } = await buildSitemap(rows);
  console.log(`${rows.length} approved gyms from ${host}`);
  console.log('URLs by type:', JSON.stringify(counts), 'total', total);
  console.log('Skipped:', JSON.stringify(skipped));
  if (process.argv.includes('--dry')) return;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  console.log('Wrote sitemap.xml');
})().catch(e => { console.error(e.message); process.exit(1); });
