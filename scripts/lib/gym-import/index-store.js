// The lightweight match index: one NDJSON line per gym that exists in production, carrying ONLY what duplicate
// detection needs. It is a derived cache of the production `spots` table (approved rows) and is never used to write anything.
//
//   import/index/gym-index.ndjson   {"id","name","country","state","suburb","lat","lng","address","types","h"}
//   import/index/index-meta.json    {"count","sha256","source","built_from",...}
//
// `h` is a hash of the gym's full comparable content (incl. notes/photo, which are NOT stored here), so the pipeline can tell
// "same content" from "content differs" without ever holding the full record.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { contentHash } = require('./normalize');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const DEFAULT_DIR = path.join(ROOT, 'import', 'index');
const FIELDS = ['id', 'name', 'country', 'state', 'suburb', 'lat', 'lng', 'address', 'types', 'h'];

const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');

function toEntry(row) {
  return {
    id: row.id, name: row.name, country: row.country, state: row.state, suburb: row.suburb,
    lat: row.lat, lng: row.lng, address: row.address == null || row.address === '' ? null : row.address,
    types: Array.isArray(row.types) ? [...row.types].sort() : [], h: contentHash(row),
  };
}

// Deterministic serialisation: rows sorted by id, fixed key order, one per line, trailing newline.
function serialize(rows) {
  const entries = rows.map(toEntry).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const ids = new Set(entries.map(e => e.id));
  if (ids.size !== entries.length) throw new Error('duplicate ids in index source');
  return entries.map(e => JSON.stringify(FIELDS.reduce((o, k) => (o[k] = e[k], o), {}))).join('\n') + '\n';
}

function load(dir = DEFAULT_DIR) {
  const file = path.join(dir, 'gym-index.ndjson');
  if (!fs.existsSync(file)) throw new Error(`No match index at ${path.relative(ROOT, file)}. Build it: node scripts/gym-import.js build-index --from-snapshot <live-snapshot.json>  (or --live)`);
  const buf = fs.readFileSync(file);
  const entries = buf.toString('utf8').split('\n').filter(Boolean).map((l, i) => {
    try { return JSON.parse(l); } catch (e) { throw new Error(`index line ${i + 1} is not JSON`); }
  });
  const meta = fs.existsSync(path.join(dir, 'index-meta.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'index-meta.json'), 'utf8')) : null;
  const byId = new Map(), byCountry = new Map();
  for (const e of entries) {
    if (byId.has(e.id)) throw new Error('duplicate id in index: ' + e.id);
    byId.set(e.id, e);
    if (!byCountry.has(e.country)) byCountry.set(e.country, []);
    byCountry.get(e.country).push(e);
  }
  const actual = sha256(buf);
  return { entries, byId, byCountry, sha256: actual, meta, metaMatches: !!meta && meta.sha256 === actual, dir };
}

function write(rows, dir, info) {
  fs.mkdirSync(dir, { recursive: true });
  const body = serialize(rows);
  fs.writeFileSync(path.join(dir, 'gym-index.ndjson'), body);
  const meta = { count: rows.length, sha256: sha256(Buffer.from(body)), fields: FIELDS, ...info };
  fs.writeFileSync(path.join(dir, 'index-meta.json'), JSON.stringify(meta, null, 2) + '\n');
  return meta;
}

// Read-only fetch of every approved production row, exactly as the public site does (anon key, GET only).
async function fetchLive() {
  const init = fs.readFileSync(path.join(ROOT, 'js', 'supabase-init.js'), 'utf8');
  const base = (init.match(/https:\/\/[a-z0-9]+\.supabase\.co/) || [])[0];
  const key = (init.match(/sb_publishable_[A-Za-z0-9_-]+/) || [])[0];
  if (!base || !key) throw new Error('Could not read the Supabase URL / anon key from js/supabase-init.js');
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${base}/rest/v1/spots?select=*&status=eq.approved&order=id`, { method: 'GET', headers: { apikey: key, Authorization: 'Bearer ' + key, Range: `${from}-${from + 999}` } });
    if (!res.ok) throw new Error('Supabase HTTP ' + res.status);
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return { rows, host: new URL(base).host };
}

module.exports = { ROOT, DEFAULT_DIR, FIELDS, sha256, toEntry, serialize, load, write, fetchLive };
