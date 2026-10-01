// Regional research (scripts/lib/gym-import/research.js): section scaffold, candidate checks, reconcile (the importer's own matching
// plus stricter review flags), human decisions, staging into an ordinary insert batch, and the importer's provenance check of such a
// batch. Offline: synthetic repo roots only, no network, no credentials.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const S = require('../scripts/lib/gym-import/index-store');
const M = require('../scripts/lib/gym-import/match');
const P = require('../scripts/lib/gym-import/plan');
const RS = require('../scripts/lib/gym-import/research');
const { runImport, MAX_ROWS } = require('../scripts/lib/gym-import/importer');
const { ROOT, tmp, PROD } = require('./helpers/import-helpers');

const SOURCES = { schema_version: 1, sources: {
  S1: { kind: 'official-site', title: 'Gym websites', url: 'https://example.org/gyms', language: 'en', accessed: '2026-10-01' },
  S2: { kind: 'directory', title: 'A climbing directory', url: 'https://directory.example/', language: 'en', accessed: '2026-10-01' },
  S3: { kind: 'map-data', title: 'OpenStreetMap', url: 'https://www.openstreetmap.org/', language: 'en', accessed: '2026-10-01' },
} };
const ev = (supports, source = 'S1') => ({ source, url: 'https://example.org/gym', accessed: '2026-10-01', supports });
const cand = (cid, over = {}) => ({
  cid, name: 'Summit Lab', country: 'AU', state: 'NSW', suburb: 'Newtown', address: '1 King St, Newtown NSW 2042', lat: -33.897, lng: 151.179,
  coord_source: { source: 'S3', method: 'osm', ref: 'node/1' }, coord_precision: 'building', types: ['indoor-bouldering'], website: `https://${cid}.example/`,
  category: 'commercial-gym', status_claim: 'open', bouldering: 'yes', evidence: [ev(['exists', 'open', 'bouldering', 'address']), ev(['location'], 'S3')], ...over,
});
const CANDIDATES = [
  cand('au-001'),                                                                                                             // ready
  cand('au-002', { name: 'Boulder Barn', suburb: 'Surry Hills', lat: -33.8801, lng: 151.2101, address: '12 Example St, Surry Hills NSW 2010' }),   // existing seed-100
  cand('au-003', { name: 'Rope Hall', suburb: 'Parramatta', lat: -33.815, lng: 151.0, types: ['top-rope'], bouldering: 'no', evidence: [ev(['exists', 'open', 'ropes']), ev(['location'], 'S3')] }),
  cand('au-004', { name: 'Mystery Walls', suburb: 'Kogarah', lat: -33.95, lng: 151.1, types: ['top-rope'], bouldering: 'unknown' }),
  cand('au-005', { name: 'ボルダーバーン', aliases: ['Boulder Barn'], suburb: 'Surry Hills', lat: -33.8836, lng: 151.21, address: 'Other St 5' }),  // translated name, 400 m
  cand('au-006', { name: 'Vertical Works Richmond', state: 'VIC', suburb: 'Richmond', lat: -37.8183, lng: 144.9981, address: '9 Swan St, Richmond VIC 3121' }), // chain branch ~2.7 km
  cand('au-007', { name: 'Dir Only', suburb: 'Hornsby', lat: -33.7, lng: 151.1, evidence: [ev(['exists', 'open', 'bouldering'], 'S2'), ev(['location'], 'S3')] }),
  cand('au-008', { name: 'Blue Mountains Crag', suburb: 'Katoomba', lat: -33.7, lng: 150.3, category: 'outdoor-area' }),
  cand('au-009', { name: 'Old Gym', suburb: 'Botany', lat: -33.99, lng: 151.2, status_claim: 'closed' }),
  cand('au-010', { name: 'Crux Cave', suburb: 'Ultimo', lat: -33.8799, lng: 151.195, address: '3 Harris St, Ultimo' }),     // 100 m from seed-102, unrelated name
  cand('au-011', { name: 'No Pin Source', suburb: 'Manly', lat: -33.8, lng: 151.28, coord_source: undefined }),              // invalid
  cand('au-012', { name: 'Crimp Club', state: 'VIC', suburb: 'Carlton', lat: -37.8, lng: 144.967, address: '1 Lygon St, Carlton VIC 3053' }),
  cand('au-013', { name: 'Pinch Palace', state: 'VIC', suburb: 'Carlton', lat: -37.8003, lng: 144.967, address: '2 Lygon St, Carlton VIC 3053' }), // 33 m from au-012
];
const GOOD_REVIEW = {
  'au-001': { decision: 'accept' },
  'au-002': { decision: 'same-as', same_as: 'seed-100', reason: 'already in Bouldeer' },
  'au-003': { decision: 'reject', reason_code: 'no-bouldering' },
  'au-004': { decision: 'defer', reason: 'site does not say whether it has a bouldering area' },
  'au-005': { decision: 'same-as', same_as: 'seed-100', reason: 'Japanese name of Boulder Barn' },
  'au-006': { decision: 'accept', reason: 'separate branch, own address and opening hours', reviewed_against: ['seed-101'] },
  'au-007': { decision: 'reject', reason_code: 'insufficient-evidence' },
  'au-008': { decision: 'reject', reason_code: 'outdoor-area' },
  'au-009': { decision: 'reject', reason_code: 'closed' },
  'au-010': { decision: 'accept', reason: 'different business, next street over', reviewed_against: ['seed-102'] },
  'au-011': { decision: 'reject', reason_code: 'insufficient-evidence' },
  'au-012': { decision: 'accept', reason: 'two gyms in one building, both sites checked', reviewed_against: ['au-013'] },
  'au-013': { decision: 'accept', reason: 'two gyms in one building, both sites checked', reviewed_against: ['au-012'] },
};

async function world({ candidates = CANDIDATES, slug = 'au-test', date = '2026-10-01' } = {}) {
  const root = tmp();
  fs.mkdirSync(path.join(root, 'js'));
  fs.copyFileSync(path.join(ROOT, 'js', 'supabase-init.js'), path.join(root, 'js', 'supabase-init.js'));   // public URL/key only
  S.write(PROD, path.join(root, 'import', 'index'), { source: 'test' });
  fs.mkdirSync(path.join(root, 'import', 'batches'), { recursive: true });
  const { id, dir } = await RS.newSection({ root, slug, date, country: 'AU', states: null, bbox: null, title: 'Synthetic AU', description: 'synthetic research section for tests' });
  fs.writeFileSync(path.join(dir, 'sources.json'), JSON.stringify(SOURCES, null, 2));
  fs.writeFileSync(path.join(dir, 'candidates.ndjson'), candidates.map(c => JSON.stringify(c)).join('\n') + '\n');
  return { root, dir, id, index: S.load(path.join(root, 'import', 'index')), indexDir: path.join(root, 'import', 'index') };
}
const reconcile = async w => { const rc = await RS.reconcile(w.dir, w); fs.writeFileSync(path.join(w.dir, 'reconcile.json'), JSON.stringify(rc, null, 1) + '\n'); return rc; };
const review = (w, decisions = GOOD_REVIEW) => fs.writeFileSync(path.join(w.dir, 'review.json'), JSON.stringify({ schema_version: 1, section_id: w.id, reviewer: 'owner', reviewed: '2026-10-02', decisions }, null, 2));
const byCid = (rc, cid) => rc.candidates.find(o => o.cid === cid);
const codes = o => (o.flags || []).map(f => f.code).concat((o.blockers || []).map(b => b.code));
async function staged() { const w = await world(); await reconcile(w); review(w); const r = await RS.stage(w.dir, w); assert.equal(r.action, 'created', JSON.stringify(r.problems)); return { ...w, batchDir: r.dir }; }
const localEnv = { SUPABASE_URL: 'http://127.0.0.1:1', SUPABASE_ANON_KEY: 'a'.repeat(20) };
const provenance = r => r.checks.filter(c => c.name.startsWith('provenance'));

test('research: importer thresholds and classification limits are unchanged; review radii are only stricter; the cap equals the importer', () => {
  assert.deepEqual({ ...M.T }, { EXISTING_SAME_NAME_M: 1000, EXISTING_ADDRESS_M: 10000, PROBABLE_SAME_NAME_M: 15000, PROBABLE_RENAMED_M: 100, PROBABLE_SAME_ADDRESS_M: 500,
    PROBABLE_COLOCATED_M: 60, PROBABLE_SIMILAR_M: 250, SIMILAR_JACCARD: 0.25, AMBIGUOUS_RATIO: 3, AMBIGUOUS_SLACK_M: 200, ID_CONFIRM_M: 150, FAR_FROM_COUNTRY_M: 1500000 });
  assert.ok(RS.R.NEARBY_ANY_M >= M.T.PROBABLE_COLOCATED_M && RS.R.RELATED_NAME_M >= M.T.PROBABLE_RENAMED_M);
  assert.equal(RS.MAX_STAGED, MAX_ROWS);
});

test('research new: scaffolds a section for a supported country and refuses bad scopes', async () => {
  const root = tmp();
  const r = await RS.newSection({ root, slug: 'new-zealand', date: '2026-10-01', country: 'NZ', states: null, bbox: null, title: 'New Zealand', description: 'all of New Zealand' });
  assert.deepEqual(fs.readdirSync(r.dir).sort(), ['candidates.ndjson', 'section.json', 'sources.json']);
  assert.equal(JSON.parse(fs.readFileSync(path.join(r.dir, 'section.json'), 'utf8')).section_id, '2026-10-01-new-zealand');
  await assert.rejects(() => RS.newSection({ root, slug: 'new-zealand', date: '2026-10-01', country: 'NZ', title: 'x', description: 'again, same id' }), /already exists/);
  await assert.rejects(() => RS.newSection({ root, slug: 'nowhere', date: '2026-10-01', country: 'ZZ', title: 'x', description: 'unsupported country' }), /country the app supports/);
  await assert.rejects(() => RS.newSection({ root, slug: 'bad-state', date: '2026-10-01', country: 'NZ', states: ['ATLANTIS'], title: 'x', description: 'unknown region code' }), /not a NZ region code/);
  await assert.rejects(() => RS.newSection({ root, slug: 'bad-box', date: '2026-10-01', country: 'NZ', bbox: [180, 0, 170, 10], title: 'x', description: 'west > east bbox' }), /bbox/);
});

test('research reconcile: every candidate is classified; duplicates, aliases, chains, rope-only, weak evidence and closures are distinguished', async () => {
  const w = await world();
  const rc = await RS.reconcile(w.dir, w);
  const cls = Object.fromEntries(rc.candidates.map(o => [o.cid, o.class]));
  assert.deepEqual(cls, { 'au-001': 'ready', 'au-002': 'existing', 'au-003': 'blocked', 'au-004': 'blocked', 'au-005': 'review', 'au-006': 'review', 'au-007': 'blocked',
    'au-008': 'blocked', 'au-009': 'blocked', 'au-010': 'review', 'au-011': 'invalid', 'au-012': 'review', 'au-013': 'review' });
  assert.equal(byCid(rc, 'au-002').importer.match.id, 'seed-100');
  assert.equal(byCid(rc, 'au-002').suggested, 'same-as seed-100');
  assert.ok(codes(byCid(rc, 'au-003')).includes('no-bouldering')); assert.equal(byCid(rc, 'au-003').suggested, 'reject no-bouldering');
  assert.ok(codes(byCid(rc, 'au-004')).includes('bouldering-unknown')); assert.equal(byCid(rc, 'au-004').suggested, 'defer', 'an unknown offering is never assumed');
  // translated name 400 m away: the importer alone says "new"; the alias flag sends it to review
  assert.equal(byCid(rc, 'au-005').importer.class, 'new');
  assert.ok(codes(byCid(rc, 'au-005')).includes('alias-match')); assert.ok(byCid(rc, 'au-005').review_ids.includes('seed-100'));
  // chain branch 2.7 km away: importer "new", review flag related-name-nearby
  assert.equal(byCid(rc, 'au-006').importer.class, 'new'); assert.deepEqual(byCid(rc, 'au-006').review_ids, ['seed-101']);
  assert.ok(codes(byCid(rc, 'au-007')).includes('insufficient-evidence'), 'a directory alone is not evidence');
  assert.ok(codes(byCid(rc, 'au-008')).includes('outdoor-area'));
  assert.ok(codes(byCid(rc, 'au-009')).includes('closed'));
  assert.deepEqual(byCid(rc, 'au-010').review_ids, ['seed-102']); assert.ok(codes(byCid(rc, 'au-010')).includes('nearby-gym'));
  assert.ok(byCid(rc, 'au-011').errors.some(e => e.code === 'required' && /coord_source/.test(e.detail)));
  // the importer's own 60 m rule still fires inside the section, and its candidate ids are shown as cids
  assert.ok(codes(byCid(rc, 'au-012')).includes('importer-probable-duplicate')); assert.deepEqual(byCid(rc, 'au-012').review_ids, ['au-013']);
  assert.deepEqual(rc.counts, { candidates: 13, ready: 1, review: 5, blocked: 5, existing: 1, invalid: 1 });
  assert.match(RS.renderReconcile(rc, JSON.parse(fs.readFileSync(path.join(w.dir, 'section.json'), 'utf8'))), /ready 1 \| review 5 \| blocked 5 \| already in Bouldeer 1 \| invalid 1/);
});

test('research reconcile: deterministic, bound to its inputs, and flags overlap with another research section', async () => {
  const w = await world();
  const a = await RS.reconcile(w.dir, w), b = await RS.reconcile(w.dir, w);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(a.inputs.index.sha256, w.index.sha256);
  const other = await RS.newSection({ root: w.root, slug: 'au-other', date: '2026-10-05', country: 'AU', title: 'Overlap', description: 'overlapping research section' });
  fs.writeFileSync(path.join(other.dir, 'candidates.ndjson'), JSON.stringify(cand('x-001', { name: 'Summit Lab Newtown' })) + '\n');
  const c = await RS.reconcile(w.dir, w);
  assert.ok(codes(byCid(c, 'au-001')).includes('other-section')); assert.deepEqual(byCid(c, 'au-001').review_ids, ['2026-10-05-au-other#x-001']);
  assert.notEqual(c.reconcile_sha256, a.reconcile_sha256);
});

test('research stage: refuses without a current reconcile, without a decision for every candidate, and on decisions the rules forbid', async () => {
  const w = await world();
  review(w);
  assert.match((await RS.stage(w.dir, w)).problems.join(), /reconcile\.json is missing/);
  await reconcile(w);
  fs.appendFileSync(path.join(w.dir, 'candidates.ndjson'), JSON.stringify(cand('au-099', { name: 'Late Add', lat: -34.2, lng: 150.9 })) + '\n');
  assert.match((await RS.stage(w.dir, w)).problems.join(), /stale/);
  const fresh = await world(); await reconcile(fresh);
  const bad = async (patch, re) => { review(fresh, { ...GOOD_REVIEW, ...patch }); const r = await RS.stage(fresh.dir, fresh); assert.equal(r.action, 'refused'); assert.match(r.problems.join('\n'), re); };
  await bad({ 'au-001': undefined }, /au-001: no decision/);
  await bad({ 'zz-404': { decision: 'accept' } }, /"zz-404", which is not a candidate/);
  await bad({ 'au-003': { decision: 'accept' } }, /au-003: cannot be accepted/);
  await bad({ 'au-003': { decision: 'reject', reason_code: 'insufficient-evidence' } }, /rope-only candidate is rejected with reason_code "no-bouldering"/);
  await bad({ 'au-004': { decision: 'reject', reason_code: 'no-bouldering' } }, /"no-bouldering" needs bouldering "no"/);
  await bad({ 'au-004': { decision: 'accept' } }, /au-004: cannot be accepted/);
  await bad({ 'au-006': { decision: 'accept', reviewed_against: ['seed-101'] } }, /au-006: accepting a flagged candidate needs a reason/);
  await bad({ 'au-006': { decision: 'accept', reason: 'separate branch, checked' } }, /au-006: reviewed_against must include seed-101/);
  await bad({ 'au-002': { decision: 'accept' } }, /au-002: cannot be accepted \(class existing/);
  await bad({ 'au-002': { decision: 'same-as', same_as: 'seed-999' } }, /same_as must be the id of a gym in Bouldeer/);
  await bad({ 'au-004': { decision: 'defer' } }, /defer needs a reason/);
  assert.equal(fs.existsSync(path.join(fresh.root, 'import', 'batches', fresh.id)), false, 'nothing staged by a refused run');
});

test('research stage: only the accepted candidates become an importable insert batch with provenance; rerun is unchanged', async () => {
  const w = await staged();
  const recs = fs.readFileSync(path.join(w.batchDir, 'records.ndjson'), 'utf8').trim().split('\n').map(l => JSON.parse(l));
  assert.deepEqual(recs.map(r => r.source.split('#')[1]), ['au-001', 'au-006', 'au-010', 'au-012', 'au-013']);
  assert.ok(recs.every(r => /^g-[0-9a-f]{10}$/.test(r.id) && r.source.startsWith(`research:${w.id}#`)));
  assert.ok(recs.every(r => !('evidence' in r) && !('website' in r) && !('cid' in r)), 'research-only fields never reach the batch');
  const meta = JSON.parse(fs.readFileSync(path.join(w.batchDir, 'batch.json'), 'utf8'));
  assert.equal(meta.source.kind, 'regional-research'); assert.equal(meta.source.staged, 5); assert.equal(meta.source.candidates, 13);
  assert.deepEqual(meta.source.decisions, { accept: 5, defer: 1, reject: 5, 'same-as': 2 });
  const dec = JSON.parse(fs.readFileSync(path.join(w.batchDir, 'decisions.json'), 'utf8')).decisions;
  assert.deepEqual(Object.values(dec).map(d => d.decision), ['distinct', 'distinct'], 'only the importer\'s own probable duplicates need an importer decision');
  // the ordinary planner accepts it as-is: all new, importable, and the distinct decisions are used
  const plan = await P.planBatch({ dir: w.batchDir, index: w.index });
  assert.equal(plan.importable, true, plan.blockers.join('; ')); assert.equal(plan.counts.new, 5); assert.deepEqual(plan.unused_decisions, []);
  assert.equal((await RS.stage(w.dir, w)).action, 'unchanged');
  fs.appendFileSync(path.join(w.batchDir, 'records.ndjson'), '');
  review(w, { ...GOOD_REVIEW, 'au-010': { decision: 'defer', reason: 'second look at the pin later' } });
  assert.match((await RS.stage(w.dir, w)).problems.join(), /already exists and differs/, 'a staged batch is never overwritten');
});

test('importer: a regional-research batch passes provenance only while it is exactly the accepted, unchanged research', async () => {
  const run = w => runImport({ batchDir: w.batchDir, indexDir: w.indexDir, env: localEnv, root: w.root });
  const ok = await staged();
  const pass = provenance(await run(ok));
  assert.deepEqual(pass.map(c => c.status), ['PASS'], JSON.stringify(pass));
  assert.match(pass[0].detail, /5 record\(s\) = the 5 accepted candidate\(s\)/);

  const failOn = async (mutate, re) => { const w = await staged(); mutate(w); const r = await run(w); const f = provenance(r).filter(c => c.status === 'FAIL'); assert.ok(f.length, 'expected a provenance failure'); assert.match(f.map(c => c.detail).join('\n'), re); assert.equal(r.exit, 2); assert.equal(r.wrote, false); };
  const edit = (file, fn) => fs.writeFileSync(file, fn(fs.readFileSync(file, 'utf8')));
  await failOn(w => edit(path.join(w.batchDir, 'records.ndjson'), t => t.replace('Crux Cave', 'Crux Cave Renamed')), /au-010 differs from the reviewed candidate/);
  await failOn(w => edit(path.join(w.dir, 'candidates.ndjson'), t => t.replace('Crux Cave', 'Crux Cavern')), /candidates\.ndjson changed/);
  await failOn(w => edit(path.join(w.dir, 'review.json'), t => t.replace('"reviewer": "owner"', '"reviewer": "someone else"')), /review\.json changed/);
  await failOn(w => fs.rmSync(w.dir, { recursive: true }), /is missing; the batch cannot be traced/);
  await failOn(w => edit(path.join(w.batchDir, 'batch.json'), t => t.replace(`"section": "import/research/${w.id}"`, '"section": "import/research/elsewhere"')), /source\.section must be/);
  await failOn(w => { const f = path.join(w.batchDir, 'records.ndjson'); const lines = fs.readFileSync(f, 'utf8').trim().split('\n'); fs.writeFileSync(f, lines.slice(1).join('\n') + '\n'); edit(path.join(w.batchDir, 'batch.json'), t => t.replace('"staged": 5', '"staged": 4')); }, /au-001 was accepted but is not in the batch/);
});

// ---- staleness scope: a reconcile depends only on research sections of the SAME country --------------------------------------
const otherSection = async (w, slug, date, country, cands) => {
  const s = await RS.newSection({ root: w.root, slug, date, country, title: slug, description: 'another research section for tests' });
  fs.writeFileSync(path.join(s.dir, 'candidates.ndjson'), cands.map(c => JSON.stringify(c)).join('\n') + '\n');
  return s;
};
const NZ_CAND = cid => cand(cid, { name: 'Auckland Boulders ' + cid, country: 'NZ', state: 'AUCKLAND', suburb: 'Auckland', address: '1 Queen St, Auckland', lat: -36.85, lng: 174.76 });

test('research staleness: a change in an unrelated country never makes a section stale; a same-country change does', async () => {
  const w = await world();
  const rc0 = await reconcile(w);
  // (b) unrelated country: create a section, then change it again; the AU reconcile is identical and staging is not blocked
  const nz = await otherSection(w, 'nz-other', '2026-10-03', 'NZ', [NZ_CAND('nz-001')]);
  const rc1 = await RS.reconcile(w.dir, w);
  assert.equal(rc1.reconcile_sha256, rc0.reconcile_sha256, 'an unrelated country does not change the reconcile');
  assert.deepEqual(rc1.inputs.other_sections_compared, [], 'only same-country sections are bound into the inputs');
  fs.appendFileSync(path.join(nz.dir, 'candidates.ndjson'), JSON.stringify(NZ_CAND('nz-002')) + '\n');
  assert.equal((await RS.reconcile(w.dir, w)).reconcile_sha256, rc0.reconcile_sha256);
  review(w);
  assert.equal((await RS.stage(w.dir, w)).action, 'created', 'staging is not blocked by an unrelated country');
  // (a) same country: another AU section appears -> the AU reconcile changes and staging the stored one is refused as stale
  const w2 = await world(); const r20 = await reconcile(w2); review(w2);
  await otherSection(w2, 'au-two', '2026-10-04', 'AU', [cand('x-100', { name: 'Far Away Gym', state: 'WA', suburb: 'Perth', address: '9 Hay St, Perth', lat: -31.95, lng: 115.86 })]);
  const r21 = await RS.reconcile(w2.dir, w2);
  assert.notEqual(r21.reconcile_sha256, r20.reconcile_sha256);
  assert.deepEqual(r21.inputs.other_sections_compared.map(o => o.id), ['2026-10-04-au-two']);
  assert.match((await RS.stage(w2.dir, w2)).problems.join(), /stale/);
  // same-country duplicate protection is intact: a near-identical candidate in the other AU section is flagged for review
  const w3 = await world(); await otherSection(w3, 'au-dup', '2026-10-05', 'AU', [cand('x-200', { name: 'Summit Lab Newtown' })]);
  assert.ok(codes(byCid(await RS.reconcile(w3.dir, w3), 'au-001')).includes('other-section'));
});

test('research staleness: staging still revalidates against the full current index (an import elsewhere makes it stale and not importable)', async () => {
  const w = await world(); await reconcile(w); review(w);
  await otherSection(w, 'nz-other', '2026-10-03', 'NZ', [NZ_CAND('nz-001')]);   // unrelated: no effect
  const staged = await RS.stage(w.dir, w);
  assert.equal(staged.action, 'created');
  assert.equal((await P.planBatch({ dir: staged.dir, index: w.index })).importable, true);
  // (c) another import lands a gym at au-001's pin and the index is rebuilt: the review can no longer be staged (stale: index hash)...
  const landed = [...PROD, { id: 'g-eeeeeeeeee', name: 'Summit Lab', suburb: 'Newtown', state: 'NSW', country: 'AU', lat: -33.897, lng: 151.179, address: '1 King St, Newtown NSW 2042', types: ['indoor-bouldering'], notes: null, photo: null }];
  const w2 = await world(); await reconcile(w2); review(w2);
  S.write(landed, w2.indexDir, { source: 'test' });
  const r2 = await RS.stage(w2.dir, { ...w2, index: S.load(w2.indexDir) });
  assert.equal(r2.action, 'refused'); assert.match(r2.problems.join(), /stale/);
  // ...and the importer's own plan of the batch staged before that import sees the new gym: the record is no longer "new". The
  // importer's insert-only gate (every record must be new) then refuses the whole batch: covered in import-importer.test.js.
  const d = tmp(); S.write(landed, d, { source: 'test' });
  const after = await P.planBatch({ dir: staged.dir, index: S.load(d) });
  assert.equal(after.records.find(r => r.name === 'Summit Lab').class, 'existing');
  assert.equal(after.counts.new, 4, 'only the other accepted gyms are still new');
});

// ---- types: bouldering unknown/no may carry an empty list instead of an unconfirmed placeholder --------------------------------
test('research types: bouldering unknown or no may have an empty type list; such candidates stay blocked and can never be accepted', async () => {
  const w = await world({ candidates: [
    cand('au-001'),
    cand('au-020', { name: 'Unknown Walls', suburb: 'Kogarah', lat: -33.95, lng: 151.1, types: [], bouldering: 'unknown' }),
    cand('au-021', { name: 'Rope Only', suburb: 'Parramatta', lat: -33.815, lng: 151.0, types: [], bouldering: 'no', evidence: [ev(['exists', 'open', 'ropes']), ev(['location'], 'S3')] }),
    cand('au-022', { name: 'Claims Yes', suburb: 'Manly', lat: -33.8, lng: 151.28, types: [] }),
    cand('au-023', { name: 'Ropes Known', suburb: 'Hornsby', lat: -33.7, lng: 151.1, types: ['top-rope'], bouldering: 'unknown' }),
  ] });
  const rc = await reconcile(w);
  assert.equal(byCid(rc, 'au-020').class, 'blocked'); assert.ok(codes(byCid(rc, 'au-020')).includes('bouldering-unknown'));
  assert.equal(byCid(rc, 'au-021').class, 'blocked'); assert.ok(codes(byCid(rc, 'au-021')).includes('no-bouldering'));
  assert.equal(byCid(rc, 'au-022').class, 'invalid', 'bouldering "yes" still requires indoor-bouldering in types');
  assert.ok(byCid(rc, 'au-022').errors.some(e => e.code === 'types-vs-bouldering'));
  assert.ok(byCid(rc, 'au-022').errors.some(e => e.code === 'record-bad-types'), 'the importer\'s own empty-types error is only waived for unknown/no');
  assert.equal(byCid(rc, 'au-023').class, 'blocked', 'legitimate non-empty types are unchanged');
  const base = { 'au-001': { decision: 'accept' }, 'au-021': { decision: 'reject', reason_code: 'no-bouldering' }, 'au-022': { decision: 'reject', reason_code: 'insufficient-evidence' }, 'au-023': { decision: 'defer', reason: 'bouldering offer not shown anywhere' } };
  review(w, { ...base, 'au-020': { decision: 'accept' } });
  assert.match((await RS.stage(w.dir, w)).problems.join('\n'), /au-020: cannot be accepted/);
  review(w, { ...base, 'au-020': { decision: 'reject', reason_code: 'no-bouldering' } });
  assert.match((await RS.stage(w.dir, w)).problems.join('\n'), /"no-bouldering" needs bouldering "no"/);
  review(w, { ...base, 'au-020': { decision: 'defer', reason: 'bouldering offer not established' } });
  const r = await RS.stage(w.dir, w);
  assert.equal(r.action, 'created');
  const recs = fs.readFileSync(path.join(r.dir, 'records.ndjson'), 'utf8').trim().split('\n').map(l => JSON.parse(l));
  assert.deepEqual(recs.map(x => x.source.split('#')[1]), ['au-001']);
  assert.ok(recs.every(x => x.types.includes('indoor-bouldering')), 'nothing with an empty or unconfirmed type list is ever staged');
});
