// Pure helpers shared by the gym-import pipeline: text normalisation, distance, content hash, id derivation.
// No I/O, no dependencies beyond Node's crypto. `n1` and the id seed are byte-for-byte the ones used by the Stage 0
// reconciliation (scripts/reconcile-ids.js) -- changing them would change every frozen `g-` id, so DO NOT edit them.
'use strict';
const crypto = require('crypto');

// Combining marks U+0300-036F; keep latin, cyrillic U+0400-04FF, kana U+3040-30FF, CJK U+3400-9FFF, hangul U+AC00-D7AF.
const STRIP_MARKS = /[̀-ͯ]/g;
const NON_WORD = /[^a-z0-9Ѐ-ӿ぀-ヿ㐀-鿿가-힯]+/g;

const n1 = s => String(s == null ? '' : s).normalize('NFKD').replace(STRIP_MARKS, '').toLowerCase()
  .replace(/\([^)]*\)/g, ' ').replace(NON_WORD, ' ').replace(/\s+/g, ' ').trim();

const STOP = new Set(['climbing', 'climb', 'gym', 'center', 'centre', 'bouldering', 'boulder', 'boulders', 'wall', 'walls', 'club', 'the', 'and', 'indoor', 'sport', 'sports', 'rock', 'park']);
const n2 = s => n1(s).split(' ').filter(t => t && !STOP.has(t)).join(' ');
const tokens = s => new Set(n2(s).split(' ').filter(Boolean));

function jaccard(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let i = 0; A.forEach(t => { if (B.has(t)) i++; });
  return i / (A.size + B.size - i);
}
// One name contains the other (after dropping generic words). Ignored for very short / empty cores.
function contains(a, b) {
  const x = n2(a), y = n2(b);
  if (x.length <= 3 || y.length <= 3) return false;
  return x.includes(y) || y.includes(x);
}
const namesRelated = (a, b) => n1(a) === n1(b) || jaccard(a, b) >= 0.5 || contains(a, b);

// Address key: lower-case letters/digits only, so punctuation/spacing/case differences don't matter. Addresses in a different
// language or script will not match -- that is a known limit, covered by the name/distance rules.
const addrKey = s => n1(s).replace(/ /g, '');
const addrUsable = k => k.length >= 8;

function meters(a, b) {
  const R = 6371000, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

const emptyToNull = v => (v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim());

// Hash of the comparable content of a gym (what a moderator/importer could change). Used to detect "same gym, different content"
// and, at import time, as an optimistic-concurrency check (never overwrite a row that changed since the index was built).
function contentHash(g) {
  const types = Array.isArray(g.types) ? [...g.types].sort() : [];
  const payload = [emptyToNull(g.name), emptyToNull(g.suburb), emptyToNull(g.state), emptyToNull(g.country), +g.lat, +g.lng,
    emptyToNull(g.address), types, emptyToNull(g.notes), emptyToNull(g.photo)];
  return crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

// Full 40-hex identity hash of a *new* gym at the moment its id is assigned: country|name|suburb|lat|lng.
function idHash(g) {
  const seed = [g.country, n1(g.name), n1(g.suburb), (+g.lat).toFixed(4), (+g.lng).toFixed(4)].join('|');
  return crypto.createHash('sha1').update(seed).digest('hex');
}
// g-<first 10 hex>; on collision with `used` extend by 2 hex chars at a time. Deterministic for a given (record, used-set).
function deriveId(g, used) {
  const h = idHash(g);
  for (let len = 10; len <= 40; len += 2) {
    const id = 'g-' + h.slice(0, len);
    if (!used.has(id)) return id;
  }
  throw new Error('id space exhausted for ' + g.name);
}

module.exports = { n1, n2, jaccard, contains, namesRelated, addrKey, addrUsable, meters, emptyToNull, contentHash, idHash, deriveId };
