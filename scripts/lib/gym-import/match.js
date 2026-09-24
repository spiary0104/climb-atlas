// Deterministic duplicate detection. Compares one candidate gym with a set of known gyms and says, for each pair, whether
// it is "the same gym" (existing) or "might be the same gym" (probable -> a human decides). It NEVER uses array position or
// the id's numbering; ids are only used as a hint that must be confirmed by content (see planRecord).
//
// Thresholds live here, in one table, so they are reviewable and unit-tested (tests/import-match.test.js).
'use strict';
const { n1, jaccard, namesRelated, addrKey, addrUsable, meters } = require('./normalize');

const T = {
  EXISTING_SAME_NAME_M: 1000,      // identical normalised name, same country, within 1 km  -> same gym (pin may have moved)
  EXISTING_ADDRESS_M: 10000,       // identical address + related name (pin quality differs a lot between geocoders)
  PROBABLE_SAME_NAME_M: 15000,     // identical name up to 15 km (or same suburb+state at any distance) -> review
  PROBABLE_RENAMED_M: 100,         // related name (rebrand / translation / suffix) within 100 m -> review
  PROBABLE_SAME_ADDRESS_M: 500,    // same address, unrelated names (shared building) -> review
  PROBABLE_COLOCATED_M: 60,        // any name, within 60 m -> review
  PROBABLE_SIMILAR_M: 250,         // partly similar name (jaccard >= 0.25) within 250 m -> review
  SIMILAR_JACCARD: 0.25,
  AMBIGUOUS_RATIO: 3, AMBIGUOUS_SLACK_M: 200,   // nearest same-name gym wins only if the runner-up is > 3x + 200 m further
  ID_CONFIRM_M: 150,               // an id match is only trusted if the name is equal or the pin is within 150 m
  FAR_FROM_COUNTRY_M: 1500000,     // warn if no known gym of the same country is within 1500 km
};

// Compare candidate `r` with known gym `e` (both need country,name,lat,lng; address/suburb/state optional).
// Returns null (unrelated) or { tier: 'existing'|'probable', reason, dist_m }.
function evaluatePair(r, e) {
  if (r.country !== e.country) return null;
  const d = meters(r, e);
  const nameEq = !!n1(r.name) && n1(r.name) === n1(e.name);
  const related = namesRelated(r.name, e.name);
  const ra = addrKey(r.address), ea = addrKey(e.address);
  const addrEq = addrUsable(ra) && ra === ea;
  const dist_m = Math.round(d);
  if (nameEq && d <= T.EXISTING_SAME_NAME_M) return { tier: 'existing', reason: 'same-name', dist_m };
  if (addrEq && related && d <= T.EXISTING_ADDRESS_M) return { tier: 'existing', reason: 'same-address-related-name', dist_m };
  if (nameEq && d <= T.PROBABLE_SAME_NAME_M) return { tier: 'probable', reason: 'same-name-but-pin-differs', dist_m };
  if (nameEq && n1(r.suburb) && n1(r.suburb) === n1(e.suburb) && r.state === e.state) return { tier: 'probable', reason: 'same-name-same-suburb-far-pin', dist_m };
  if (related && d <= T.PROBABLE_RENAMED_M) return { tier: 'probable', reason: 'renamed-or-related-name-nearby', dist_m };
  if (addrEq && d <= T.PROBABLE_SAME_ADDRESS_M) return { tier: 'probable', reason: 'same-address-different-name', dist_m };
  if (d <= T.PROBABLE_COLOCATED_M) return { tier: 'probable', reason: 'co-located', dist_m };
  if (d <= T.PROBABLE_SIMILAR_M && jaccard(r.name, e.name) >= T.SIMILAR_JACCARD) return { tier: 'probable', reason: 'similar-name-nearby', dist_m };
  return null;
}

// Scan `pool` (array of known gyms, ideally already restricted to r.country) for r.
// Returns { existing: [...], probable: [...], nearestSameCountryM } with candidate = { id, name, tier, reason, dist_m }.
function scan(r, pool, opts = {}) {
  const existing = [], probable = [];
  let nearest = Infinity;
  for (const e of pool) {
    if (opts.skipId && e.id === opts.skipId) continue;
    if (e.country === r.country) { const dm = meters(r, e); if (dm < nearest) nearest = dm; }
    const p = evaluatePair(r, e);
    if (!p) continue;
    const cand = { id: e.id, name: e.name, tier: p.tier, reason: p.reason, dist_m: p.dist_m };
    if (e.batch) cand.batch = e.batch;
    (p.tier === 'existing' && !e.batch && !opts.forceProbable ? existing : probable).push(cand);
    // staged / within-batch matches are never "existing": nothing in production to point at
  }
  const byDist = (a, b) => a.dist_m - b.dist_m || (a.id < b.id ? -1 : 1);
  existing.sort(byDist); probable.sort(byDist);
  return { existing, probable, nearestSameCountryM: nearest };
}

// Several "existing" candidates: the nearest wins only if it is clearly closer than the runner-up.
function pickExisting(existing) {
  if (existing.length === 1) return { match: existing[0], ambiguous: null };
  const [a, b] = existing;
  if (b.dist_m > a.dist_m * T.AMBIGUOUS_RATIO + T.AMBIGUOUS_SLACK_M) return { match: a, ambiguous: null };
  return { match: null, ambiguous: existing };
}

module.exports = { T, evaluatePair, scan, pickExisting };
