// Region pages that duplicate a city page (js/modules/place-canonical.js, seo-meta.js duplicatePlacePath) and how the
// sitemap and link-preview data follow the same rule (scripts/lib/sitemap.js). Offline.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSitemap, buildPlaces } = require('../scripts/lib/sitemap');

const canon = import('../js/modules/place-canonical.js');
const seo = import('../js/modules/seo-meta.js');

// Shanghai: every gym of the region is inside the Shanghai metro (metros.js), so /in/cn/shanghai duplicates
// /in/cn/shanghai/shanghai. NSW has gyms outside the Sydney metro, so its region page stays its own page.
const SHANGHAI = [
  { id: 'a', slug: 'a', country: 'CN', state: 'SHANGHAI', suburb: 'Hongkou District, Shanghai', lat: 31.25, lng: 121.48 },
  { id: 'b', slug: 'b', country: 'CN', state: 'SHANGHAI', suburb: 'Xuhui District, Shanghai', lat: 31.19, lng: 121.43 },
];
const NSW = [
  { id: 'c', slug: 'c', country: 'AU', state: 'NSW', suburb: 'Marrickville', lat: -33.91, lng: 151.15 },
  { id: 'd', slug: 'd', country: 'AU', state: 'NSW', suburb: 'Newcastle', lat: -32.93, lng: 151.78 },
];
// One region whose gyms are all in one suburb (no metro): the region page duplicates that suburb page.
const ONE_TOWN = [
  { id: 'e', slug: 'e', country: 'NZ', state: 'Tasman', suburb: 'Richmond', lat: -41.33, lng: 173.18 },
  { id: 'f', slug: 'f', country: 'NZ', state: 'Tasman', suburb: 'Richmond', lat: -41.34, lng: 173.19 },
];

test('duplicatePlacePath: exact same gym set only, order and repeats ignored', async () => {
  const { duplicatePlacePath } = await seo;
  assert.equal(duplicatePlacePath(['a', 'b'], [{ path: '/x', ids: ['b', 'a', 'a'] }]), '/x');
  assert.equal(duplicatePlacePath(['a', 'b'], [{ path: '/x', ids: ['a'] }]), null, 'a subset is a different page');
  assert.equal(duplicatePlacePath(['a'], [{ path: '/x', ids: ['a', 'b'] }]), null, 'a superset is a different page');
  assert.equal(duplicatePlacePath([], [{ path: '/x', ids: [] }]), null, 'an empty region duplicates nothing');
  assert.equal(duplicatePlacePath(['a'], [{ path: '/z', ids: ['a'] }, { path: '/y', ids: ['a'] }]), '/y', 'deterministic tie-break');
});

test('regionCanonicalPath: the city page when it holds exactly the region, else null', async () => {
  const { regionCanonicalPath } = await canon;
  const all = [...SHANGHAI, ...NSW, ...ONE_TOWN];
  assert.equal(regionCanonicalPath(all, 'CN', 'SHANGHAI'), '/in/cn/shanghai/shanghai');
  assert.equal(regionCanonicalPath(all, 'AU', 'NSW'), null, 'Newcastle is outside the Sydney metro');
  assert.equal(regionCanonicalPath(all, 'NZ', 'Tasman'), '/in/nz/tasman/richmond');
  assert.equal(regionCanonicalPath(all.slice(0, -1), 'NZ', 'Tasman'), null, 'a single-gym suburb has no page of its own');
  assert.equal(regionCanonicalPath(all, 'CN', 'NOWHERE'), null);
});

test('sitemap leaves duplicate region pages out and keeps their city pages', async () => {
  const { xml, skipped } = await buildSitemap([...SHANGHAI, ...NSW, ...ONE_TOWN]);
  const has = p => xml.includes('<loc>https://www.bouldeer.com' + p + '</loc>');
  assert.ok(!has('/in/cn/shanghai') && has('/in/cn/shanghai/shanghai'));
  assert.ok(!has('/in/nz/tasman') && has('/in/nz/tasman/richmond'));
  assert.ok(has('/in/au/nsw'), 'a region with more than one city stays');
  assert.equal(skipped.duplicateRegion, 2);
});

test('link-preview data: duplicate region pages carry the city canonical, others none', async () => {
  const { places } = await buildPlaces([...SHANGHAI, ...NSW, ...ONE_TOWN]);
  assert.equal(places['/in/cn/shanghai'].canonical, '/in/cn/shanghai/shanghai');
  assert.equal(places['/in/nz/tasman'].canonical, '/in/nz/tasman/richmond');
  assert.equal(places['/in/au/nsw'].canonical, undefined);
  assert.equal(places['/in/cn/shanghai/shanghai'].canonical, undefined, 'the city page stays its own canonical');
});
