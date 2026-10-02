// Coordinates read back from production (double precision through the REST API) carry 15 significant digits, so a staged pin with
// 16-17 digits must still verify (2026-10-02: the India batch wrote correctly but failed an exact read-back comparison).
//   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const N = require('../scripts/lib/gym-import/normalize');
const { diffRow } = require('../scripts/lib/gym-import/importer');

const staged = { name: 'The Indian Bouldering Company', suburb: 'Fort, Mumbai', state: 'MAHARASHTRA', country: 'IN', lat: 18.93643655633653, lng: 72.82892217643466, types: ['indoor-bouldering'], notes: null, photo: null, address: null };
const live = { ...staged, lat: 18.9364365563365, lng: 72.8289221764347, status: 'approved', community: false, edited: false, submitted_by: null };

test('sameCoord: 15-digit read-back of a 17-digit pin is the same pin; a real move is not', () => {
  assert.equal(N.sameCoord(72.82892217643466, 72.8289221764347), true);
  assert.equal(N.sameCoord('13.0762851125728', 13.0762851125728), true);
  assert.equal(N.sameCoord(72.8289221, 72.8289231), false);          // ~0.1 m apart: a different pin
  assert.equal(N.sameCoord(1, 1 + 2 * N.COORD_EPS), false);
  assert.equal(N.sameCoord(undefined, undefined), false);             // non-numbers never match
  assert.equal(N.sameCoord('x', 'x'), false);
});

test('diffRow ignores float read-back rounding but still catches every real difference', () => {
  assert.deepEqual(diffRow(staged, live), []);
  assert.deepEqual(diffRow(staged, { ...live, lat: live.lat + 0.00001 }), ['lat']);
  assert.deepEqual(diffRow(staged, { ...live, lng: 72.83 }), ['lng']);
  assert.deepEqual(diffRow(staged, { ...live, name: 'Other' }), ['name']);
  assert.deepEqual(diffRow(staged, { ...live, status: 'pending' }), ['status']);
});
