'use strict';
// The offline list: data/spots-fallback.json, an id-correct export of the approved gyms from production, written by
// scripts/build-sitemap.js from the same read-only read (anon key, GET only). The app fetches it only when Supabase is
// unreachable (js/modules/data-load.js ensureFallbackData). It carries exactly the columns the Explore list reads
// (LIST_COLUMNS in data-load.js; tests/fallback.test.js keeps the two in step), in id order, one gym per line.
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./gym-import/index-store');

function listColumns() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'modules', 'data-load.js'), 'utf8');
  const m = /export const LIST_COLUMNS = '([^']+)'/.exec(src);
  if (!m) throw new Error('Could not read LIST_COLUMNS from js/modules/data-load.js');
  return m[1].split(',');
}

function buildFallback(rows, columns = listColumns()) {
  const lines = rows.map(r => JSON.stringify(Object.fromEntries(columns.map(c => [c, r[c] === undefined ? null : r[c]]))));
  return { text: '[\n' + lines.join(',\n') + '\n]\n', count: lines.length, columns };
}

module.exports = { listColumns, buildFallback };
