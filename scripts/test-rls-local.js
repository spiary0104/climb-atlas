#!/usr/bin/env node
// RLS / trigger behaviour smoke test against the LOCAL Supabase stack (never production).
//
//   supabase start   (from the repo root, migrations applied)
//   node scripts/test-rls-local.js
//
// Talks to PostgREST + GoTrue on http://127.0.0.1:54321 exactly the way the app does (supabase-js -> REST),
// as anon, two ordinary signed-in users and a moderator. Test rows are created and removed by this script.
'use strict';
const { spawnSync } = require('child_process');
const SB = process.env.SUPABASE_BIN || 'C:/Users/Spiar/tools/supabase-cli/supabase.exe';
const st = spawnSync(SB, ['status', '-o', 'env'], { encoding: 'utf8', cwd: require('path').resolve(__dirname, '..') });
const env = {}; (st.stdout || '').split('\n').forEach(l => { const m = /^([A-Z_]+)="?(.*?)"?$/.exec(l.trim()); if (m) env[m[1]] = m[2]; });
const BASE = env.API_URL || 'http://127.0.0.1:54321', ANON = env.ANON_KEY, SERVICE = env.SERVICE_ROLE_KEY;
if (!ANON || !SERVICE || !/127\.0\.0\.1|localhost/.test(BASE)) { console.error('Local stack not running (or not local). Refusing to run.', BASE); process.exit(2); }

async function api(method, path, { token, body, prefer, key } = {}) {
  const headers = { apikey: key || ANON, Authorization: 'Bearer ' + (token || key || ANON), 'Content-Type': 'application/json' };
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text(); let json = null; try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }
  return { status: r.status, json };
}
const svc = (m, p, b, pref) => api(m, p, { key: SERVICE, body: b, prefer: pref });
const rep = 'return=representation';
async function signup(label) {
  const email = `rls-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
  const r = await fetch(BASE + '/auth/v1/signup', { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'test-password-123' }) });
  const j = await r.json(); if (!j.access_token) throw new Error('signup failed: ' + JSON.stringify(j).slice(0, 200));
  return { id: j.user.id, token: j.access_token, email };
}
const uuid = () => require('crypto').randomUUID();
const results = [];
const t = (name, ok, detail) => { results.push({ name, ok: !!ok, detail: detail || '' }); };
const denied = r => r.status >= 400 || (Array.isArray(r.json) && r.json.length === 0);

(async () => {
  // the local database is shared with the importer tests (which reset spots): take turns with any running test run
  const releaseStack = await require('../tests/helpers/local-stack').acquireStackLock({ url: BASE });
  process.once('exit', releaseStack);
  const A = await signup('a'), B = await signup('b'), M = await signup('mod');
  await svc('POST', '/rest/v1/moderators', { user_id: M.id });
  const tag = 'rlstest-' + Date.now();
  const seedIds = [tag + '-1', tag + '-2'];
  await svc('POST', '/rest/v1/spots', seedIds.map((id, i) => ({ id, name: 'RLS test gym ' + i, suburb: 'X', state: 'NSW', country: 'AU', lat: -33.8, lng: 151.2, types: ['indoor-bouldering'], status: 'approved' })));
  const spot = seedIds[0];

  // ---------------- anon ----------------
  let r = await api('GET', `/rest/v1/spots?select=id&status=eq.approved&id=in.(${seedIds.join(',')})`);
  t('anon: reads approved spots', r.status === 200 && r.json.length === 2, `${r.json.length} rows`);
  const pend = await svc('POST', '/rest/v1/spots', { id: tag + '-pending', name: 'pending one', suburb: 'X', state: 'NSW', country: 'AU', lat: 0, lng: 0, types: ['top-rope'], status: 'pending', community: true, submitted_by: M.id }, rep);   // owned by the moderator so it does not count against A's rate limit
  r = await api('GET', `/rest/v1/spots?select=id&id=eq.${tag}-pending`);
  t('anon: cannot see pending spots', r.status === 200 && r.json.length === 0);
  r = await api('POST', '/rest/v1/spots', { body: { id: 'community-' + uuid(), name: 'anon try', suburb: 'x', state: 'NSW', country: 'AU', lat: 0, lng: 0, types: [], status: 'pending', submitted_by: uuid() } });
  t('anon: cannot insert a spot', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/pending_edits', { body: { spot_id: spot, name: 'edit', suburb: 'X', state: 'NSW', country: 'AU', lat: 1, lng: 1, types: ['top-rope'] } });
  t('anon: cannot propose an edit (sign-in required, migration 20261002000100)', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/reports', { body: { spot_id: spot, message: 'wrong pin' } });
  t('anon: cannot submit a report (sign-in required, migration 20261002000100)', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/rpc/next_spot_slug', { body: { p_base: 'x', p_id: 'y' } }); t('anon: cannot probe slugs (next_spot_slug is not callable, 20261002000600)', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/routes', { body: { spot_id: spot, climb_type: 'top-rope', grade: 'V1' } }); t('anon: cannot insert a route (20261002000400)', r.status >= 400, 'HTTP ' + r.status);
  for (const tb of ['pending_edits', 'reports', 'moderators', 'marks', 'sessions', 'session_climbs', 'checkins']) {
    r = await api('GET', `/rest/v1/${tb}?select=*`); t(`anon: reads nothing from ${tb}`, (r.status === 200 && r.json.length === 0) || r.status === 401 || r.status === 403, r.status === 200 ? '0 rows' : 'HTTP ' + r.status + ' (no privilege)');
  }
  r = await api('GET', '/rest/v1/routes?select=id'); t('anon: routes are publicly readable', r.status === 200);
  r = await api('POST', '/rest/v1/marks', { body: { user_id: A.id, spot_id: spot, mark_type: 'climbed' } }); t('anon: cannot add a mark', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/sessions', { body: { user_id: A.id, session_date: '2026-09-01' } }); t('anon: cannot add a session', r.status >= 400, 'HTTP ' + r.status);
  r = await api('PATCH', `/rest/v1/spots?id=eq.${spot}`, { body: { name: 'HACKED' }, prefer: rep }); t('anon: cannot update a spot', denied(r), 'HTTP ' + r.status);
  r = await api('DELETE', `/rest/v1/spots?id=eq.${spot}`, { prefer: rep }); t('anon: cannot delete a spot', denied(r), 'HTTP ' + r.status);
  r = await svc('GET', `/rest/v1/spots?select=name&id=eq.${spot}`); t('anon attacks left the spot untouched', r.json[0] && r.json[0].name === 'RLS test gym 0');

  // ---------------- signed-in user A (app patterns) ----------------
  const appSpot = (over) => ({ id: 'community-' + uuid(), name: 'A submission', suburb: 'Surry Hills', state: 'NSW', country: 'AU', types: ['indoor-bouldering'], address: null, notes: null, photo: null, lat: -33.88, lng: 151.21, submitted_by: A.id, community: true, edited: false, status: 'pending', ...over });
  const mine = appSpot();
  r = await api('POST', '/rest/v1/spots', { token: A.token, body: mine, prefer: rep });
  t('user: can submit a spot as pending (add-spot flow)', r.status === 201 && r.json[0].status === 'pending' && r.json[0].submitted_by === A.id, 'HTTP ' + r.status);
  r = await api('GET', `/rest/v1/spots?select=id,status&id=eq.${mine.id}`, { token: A.token }); t('user: sees their own pending spot', r.json.length === 1);
  r = await api('GET', `/rest/v1/spots?select=id&id=eq.${mine.id}`, { token: B.token }); t('other user: cannot see it', r.json.length === 0);
  r = await api('POST', '/rest/v1/spots', { token: A.token, body: appSpot({ status: 'approved' }), prefer: rep });
  t('user: inserting status=approved is forced to pending by trigger', r.status === 201 && r.json[0].status === 'pending', `stored status=${r.json && r.json[0] && r.json[0].status}`);
  r = await api('POST', '/rest/v1/spots', { token: A.token, body: appSpot({ id: 'seed-1', submitted_by: B.id, community: false, edited: true }), prefer: rep });
  t('user: spoofed id/submitted_by/community are rewritten by trigger', r.status === 201 && /^community-[0-9a-f-]{36}$/.test(r.json[0].id) && r.json[0].submitted_by === A.id && r.json[0].community === true && r.json[0].edited === false, r.status === 201 ? `id=${r.json[0].id.slice(0, 14)}… submitted_by=A` : 'HTTP ' + r.status);
  let ok = 0; for (let i = 0; i < 7; i++) { r = await api('POST', '/rest/v1/spots', { token: A.token, body: appSpot(), prefer: rep }); if (r.status === 201) ok++; }
  r = await api('POST', '/rest/v1/spots', { token: A.token, body: appSpot() });
  const cnt = await api('POST', '/rest/v1/rpc/recent_submission_count', { token: A.token, body: {} });
  t('user: rate limit stops the 11th submission in 24h', ok === 7 && r.status >= 400, `3 + ${ok} accepted (=10 in 24h), next => HTTP ${r.status}; recent_submission_count()=${cnt.json}`);
  r = await api('PATCH', `/rest/v1/spots?id=eq.${spot}`, { token: A.token, body: { name: 'HACKED' }, prefer: rep }); t('user: cannot update an approved spot directly', denied(r));
  r = await api('DELETE', `/rest/v1/spots?id=eq.${spot}`, { token: A.token, prefer: rep }); t('user: cannot delete a spot', denied(r));
  r = await api('POST', '/rest/v1/pending_edits', { token: A.token, body: { spot_id: spot, name: 'Better name', suburb: 'X', state: 'NSW', country: 'AU', lat: 1, lng: 1, types: ['top-rope'], address: null, notes: null, photo: null } });   // supabase-js .insert() without .select() => Prefer: return=minimal
  t('user: can propose an edit (edit flow)', r.status === 201, 'HTTP ' + r.status);
  const editId = ((await svc('GET', '/rest/v1/pending_edits?select=id&name=eq.Better%20name&spot_id=eq.' + spot)).json[0] || {}).id;
  // Phase 4: a submitter reads back their OWN proposal (to see "awaiting review" / a rejection reason); forged fields are
  // overwritten by the trigger; nobody reads anyone else's proposals.
  r = await api('POST', '/rest/v1/pending_edits', { token: A.token, body: { spot_id: spot, name: 'x', suburb: 'X', state: 'NSW', country: 'AU', lat: 1, lng: 1, types: [],
    edit_note: 'Checked on their site', review_requested: true, submitted_by: B.id, status: 'approved', decided_at: '2020-01-01T00:00:00Z', rejection_reason: 'forged' }, prefer: rep });
  const own = r.json && r.json[0];
  t('user: reads back their own proposal; submitter/status/decision cannot be forged', r.status === 201 && own && own.submitted_by === A.id && own.status === 'pending' && own.decided_at === null && own.rejection_reason === null && own.edit_note === 'Checked on their site' && own.review_requested === true,
    own ? `${own.submitted_by === A.id ? 'own' : 'FORGED'} ${own.status}` : 'HTTP ' + r.status);
  r = await api('GET', '/rest/v1/pending_edits?select=id,submitted_by', { token: A.token }); t('user: sees only their own proposals', r.json.length >= 1 && r.json.every(x => x.submitted_by === A.id), `${r.json.length} rows`);
  r = await api('GET', '/rest/v1/pending_edits?select=id', { token: B.token }); t("other user: cannot read A's proposals (moderation queue)", r.json.length === 0);
  r = await api('PATCH', `/rest/v1/pending_edits?id=eq.${own && own.id}`, { token: A.token, body: { status: 'approved' }, prefer: rep }); t('user: cannot approve their own proposal', denied(r), 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/pending_edits', { token: A.token, body: { spot_id: spot, name: 'x', suburb: 'X', state: 'NSW', country: 'AU', lat: 1, lng: 1, types: [], edit_note: 'y'.repeat(201) } }); t('user: edit note over 200 characters is refused', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/pending_edits', { token: A.token, body: { spot_id: spot, name: 'n'.repeat(201), suburb: 'X', state: 'NSW', country: 'AU', lat: 1, lng: 1, types: [] } }); t('user: edit name over 200 characters is refused (20261002000200)', r.status >= 400, 'HTTP ' + r.status);
  // Reports are readable by moderators only, so the insert cannot return its row (the app inserts without reading back);
  // check the attribution with the service role instead.
  r = await api('POST', '/rest/v1/reports', { token: A.token, body: { spot_id: spot, message: 'wrong pin (attribution check)' } });
  { const back = await svc('GET', `/rest/v1/reports?select=submitted_by&spot_id=eq.${spot}&message=eq.${encodeURIComponent('wrong pin (attribution check)')}`);
    t('user: can submit a report, attributed to them', r.status === 201 && back.json.length === 1 && back.json[0].submitted_by === A.id, 'HTTP ' + r.status); }
  // Gym information (migration 20261004000100): edit proposals carry the public fields; the checks refuse bad values.
  const info = { spot_id: spot, name: 'Info', suburb: 'X', state: 'NSW', country: 'AU', lat: 1, lng: 1, types: [] };
  r = await api('POST', '/rest/v1/pending_edits', { token: A.token, body: { ...info, description: 'Big bouldering hall with a cafe.', website: 'https://example.com/gym',
    hours: { mon: '6am-10pm', sun: 'Closed' }, day_pass: 'A$28 adult', facilities: ['cafe', 'shoe-hire'] } });
  t('user: an edit proposal can carry website, hours, day pass, facilities and description', r.status === 201, 'HTTP ' + r.status);
  for (const [label, extra] of [['website must be http(s)', { website: 'javascript:alert(1)' }], ['hours keys must be weekdays', { hours: { monday: '9-5' } }],
    ['hours values must be short strings', { hours: { mon: 'x'.repeat(41) } }], ['hours values must be strings', { hours: { mon: 9 } }],
    ['facilities must come from the fixed list', { facilities: ['casino'] }], ['description is capped at 600', { description: 'd'.repeat(601) }],
    ['day pass is capped at 120', { day_pass: 'p'.repeat(121) }]]) {
    r = await api('POST', '/rest/v1/pending_edits', { token: A.token, body: { ...info, ...extra } }); t('user: ' + label, r.status >= 400, 'HTTP ' + r.status);
  }
  r = await api('GET', `/rest/v1/spots?select=id,description,website,hours,day_pass,facilities&id=eq.${spot}`); t('anon: the gym-information columns are publicly readable on approved gyms', r.status === 200 && r.json.length === 1 && Array.isArray(r.json[0].facilities));
  r = await api('POST', '/rest/v1/reports', { token: A.token, body: { spot_id: spot, message: 'm'.repeat(2001) } }); t('user: report over 2000 characters is refused', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/spots', { token: M.token, body: { id: 'community-' + uuid(), name: 'forged', suburb: 'x', state: 'NSW', country: 'AU', lat: 0, lng: 0, types: [], status: 'pending', submitted_by: M.id, verified_at: new Date().toISOString(), rejection_reason: 'forged' }, prefer: rep });
  t('user: a forged verified_at / rejection_reason on a new gym is nulled (20261002000300)', r.status === 201 && r.json[0].verified_at === null && r.json[0].rejection_reason === null, r.status === 201 ? 'verified_at=' + r.json[0].verified_at : 'HTTP ' + r.status);
  // profiles: public display names, own row only, never an email
  r = await api('POST', '/rest/v1/profiles', { token: A.token, body: { user_id: A.id, display_name: 'mika.sends' } }); t('user: creates their own profile', r.status === 201, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/profiles', { token: A.token, body: { user_id: B.id, display_name: 'impostor' } }); t("user: cannot create someone else's profile", r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/profiles', { token: B.token, body: { user_id: B.id, display_name: 'b@example.com' } }); t('user: an email-like display name is refused', r.status >= 400, 'HTTP ' + r.status);
  r = await api('PATCH', `/rest/v1/profiles?user_id=eq.${A.id}`, { token: B.token, body: { display_name: 'hijacked' }, prefer: rep }); t("other user: cannot rename A", denied(r), 'HTTP ' + r.status);
  r = await api('GET', `/rest/v1/profiles?select=display_name&user_id=eq.${A.id}`); t('anon: display names are public', r.status === 200 && r.json.length === 1 && r.json[0].display_name === 'mika.sends');
  r = await api('POST', '/rest/v1/marks', { token: A.token, body: { user_id: A.id, spot_id: spot, mark_type: 'climbed' } }); t('user: can mark a spot climbed', r.status === 201, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/marks', { token: A.token, body: { user_id: B.id, spot_id: spot, mark_type: 'bookmarked' } }); t("user: cannot add a mark for someone else", r.status >= 400, 'HTTP ' + r.status);
  r = await api('GET', '/rest/v1/marks?select=spot_id,mark_type', { token: A.token }); t('user: reads only their own marks', r.json.length === 1);
  r = await api('GET', '/rest/v1/marks?select=spot_id', { token: B.token }); t("other user: cannot read A's marks", r.json.length === 0);
  r = await api('DELETE', `/rest/v1/marks?user_id=eq.${A.id}&spot_id=eq.${spot}&mark_type=eq.climbed`, { token: A.token, prefer: rep }); t('user: can remove their own mark', r.status === 200 && r.json.length === 1);
  // logbook
  r = await api('POST', '/rest/v1/sessions', { token: A.token, body: { user_id: A.id, spot_id: spot, session_date: '2026-09-20', mood: 'good', notes: null }, prefer: rep });
  const sid = r.json && r.json[0] && r.json[0].id; t('user: can log a session', r.status === 201, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/session_climbs', { token: A.token, body: [{ session_id: sid, climb_type: 'indoor-bouldering', grade: 'V3', grade_system: 'v-scale', attempts: 2, sent: true, notes: null }] }); t('user: can add climbs to their session', r.status === 201, 'HTTP ' + r.status);
  r = await api('GET', '/rest/v1/sessions?select=*,session_climbs(*)&order=session_date.desc', { token: A.token }); t('user: logbook query with embedded climbs works (FK embedding)', r.status === 200 && r.json.length === 1 && r.json[0].session_climbs.length === 1, r.status === 200 ? `${r.json.length} session, ${r.json[0] && r.json[0].session_climbs.length} climb` : 'HTTP ' + r.status);
  r = await api('GET', '/rest/v1/sessions?select=id', { token: B.token }); t("other user: cannot read A's sessions", r.json.length === 0);
  r = await api('POST', '/rest/v1/session_climbs', { token: B.token, body: [{ session_id: sid, climb_type: 'top-rope', grade: '5.10', grade_system: 'yds' }] }); t("other user: cannot add climbs to A's session", r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/routes', { token: A.token, body: { spot_id: spot, climb_type: 'indoor-bouldering', grade: 'V2', submitted_by: A.id }, prefer: rep }); const rid = ((await svc('POST', '/rest/v1/routes', { spot_id: spot, climb_type: 'indoor-bouldering', grade: 'V2', submitted_by: A.id }, rep)).json[0] || {}).id;   // created with the service key: the app cannot write routes t('user: cannot add a route (routes are read-only through the API, 20261002000400)', r.status >= 400, 'HTTP ' + r.status);
  r = await api('PATCH', `/rest/v1/routes?id=eq.${rid}`, { token: B.token, body: { grade: 'V9' }, prefer: rep }); t("other user: cannot edit A's route", denied(r));
  r = await api('GET', '/rest/v1/moderators?select=user_id', { token: A.token }); t('user: is not a moderator (sees no moderator row)', r.json.length === 0);
  r = await api('DELETE', `/rest/v1/sessions?id=eq.${sid}`, { token: A.token, prefer: rep });
  const left = await svc('GET', `/rest/v1/session_climbs?select=id&session_id=eq.${sid}`); t('user: deleting a session cascades to its climbs', r.status === 200 && left.json.length === 0);

  // ---------------- check-ins (Phase 5, migration 20260927090000) ----------------
  r = await api('POST', '/rest/v1/checkins', { body: { spot_id: spot, note: 'anon' } }); t('anon: cannot check in', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/checkins', { token: A.token, body: { spot_id: spot, note: 'First visit', user_id: B.id, checked_at: '2020-01-01T00:00:00Z' }, prefer: rep });
  const ci = r.json && r.json[0];
  t('user: checks in; user_id and checked_at are pinned server-side (no forging, no backdating)', r.status === 201 && ci && ci.user_id === A.id && new Date(ci.checked_at).getFullYear() >= 2026 && ci.note === 'First visit',
    ci ? `user=${ci.user_id === A.id ? 'A' : 'FORGED'} checked_at=${ci.checked_at.slice(0, 10)}` : 'HTTP ' + r.status);
  r = await api('GET', `/rest/v1/marks?select=mark_type&spot_id=eq.${spot}`, { token: A.token }); t('user: a check-in adds the climbed mark (trigger)', r.json.length === 1 && r.json[0].mark_type === 'climbed', `${r.json.length} mark`);
  r = await api('POST', '/rest/v1/checkins', { token: A.token, body: { spot_id: spot } }); t('user: a second check-in at the same gym within 12 hours is refused', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/checkins', { token: A.token, body: { spot_id: seedIds[1] }, prefer: rep }); t('user: can check in at another gym the same day', r.status === 201, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/checkins', { token: B.token, body: { spot_id: tag + '-pending' } }); t('user: cannot check in at a pending gym', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/checkins', { token: B.token, body: { spot_id: spot, note: 'n'.repeat(141) } }); t('user: a note over 140 characters is refused', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/checkins', { token: B.token, body: { spot_id: spot, photo: 'javascript:alert(1)' } }); t('user: a non-https photo link is refused', r.status >= 400, 'HTTP ' + r.status);
  r = await api('GET', '/rest/v1/checkins?select=id,user_id', { token: A.token }); t('user: reads only their own check-ins', r.json.length === 2 && r.json.every(x => x.user_id === A.id), `${r.json.length} rows`);
  r = await api('GET', '/rest/v1/checkins?select=id', { token: B.token }); t("other user: cannot read A's check-ins", r.json.length === 0);
  r = await api('DELETE', `/rest/v1/checkins?id=eq.${ci && ci.id}`, { token: B.token, prefer: rep }); t("other user: cannot delete A's check-in", denied(r), 'HTTP ' + r.status);
  r = await api('PATCH', `/rest/v1/checkins?id=eq.${ci && ci.id}`, { token: A.token, body: { checked_at: '2020-01-01T00:00:00Z' }, prefer: rep }); t('user: cannot edit a check-in (no update policy)', denied(r), 'HTTP ' + r.status);
  r = await api('DELETE', `/rest/v1/checkins?id=eq.${ci && ci.id}`, { token: A.token, prefer: rep }); t('user: can delete their own check-in', r.status === 200 && r.json.length === 1);

  // Limits under simultaneous requests (pre-merge audit: a plain check-then-insert let 4 of 8 through). Temporary gyms.
  const cTag = tag + '-c', cIds = Array.from({ length: 36 }, (_, i) => `${cTag}-${i}`);
  await svc('POST', '/rest/v1/spots', [...cIds.map((id, i) => ({ id, name: 'RLS limit gym ' + i, suburb: 'L' + i, state: 'NSW', country: 'AU', lat: -33.8, lng: 151.2, types: ['indoor-bouldering'], status: 'approved' })),
    { id: cTag + '-rejected', name: 'RLS rejected gym', suburb: 'X', state: 'NSW', country: 'AU', lat: 0, lng: 0, types: ['top-rope'], status: 'rejected' }]);
  const C = await signup('c'), D = await signup('d');
  const msg = x => (x.json && x.json.message) || '';
  const burst = (who, ids) => Promise.all(ids.map(id => api('POST', '/rest/v1/checkins', { token: who.token, body: { spot_id: id } })));
  for (const [label, id] of [['pending', tag + '-pending'], ['rejected', cTag + '-rejected'], ['missing', 'no-such-gym']]) {
    r = await api('POST', '/rest/v1/checkins', { token: C.token, body: { spot_id: id } });
    t(`user: a ${label} gym is refused as "not open for check-ins" (not a limit message)`, r.status >= 400 && /not open for check-ins/.test(msg(r)), `HTTP ${r.status} ${msg(r)}`);
  }
  let rs = await burst(C, Array(10).fill(cIds[0]));
  t('simultaneous: 10 check-ins at one gym at once -> exactly 1 lands (12-hour rule)', rs.filter(x => x.status === 201).length === 1 && rs.filter(x => x.status !== 201).every(x => /already checked in here today/.test(msg(x))), rs.filter(x => x.status === 201).length + ' landed');
  rs = await burst(D, [cIds[0]]);
  t('simultaneous: another person checking in at the same gym is not blocked', rs[0].status === 201, 'HTTP ' + rs[0].status);
  for (let i = 1; i < 25; i++) await api('POST', '/rest/v1/checkins', { token: D.token, body: { spot_id: cIds[i] } });
  rs = await burst(D, cIds.slice(25, 35));
  r = await api('GET', '/rest/v1/checkins?select=id', { token: D.token });
  t('simultaneous: 10 at once with 25 already -> exactly 5 land, the day stops at 30', rs.filter(x => x.status === 201).length === 5 && r.json.length === 30 && rs.filter(x => x.status !== 201).every(x => /daily check-in limit reached/.test(msg(x))), `${rs.filter(x => x.status === 201).length} landed, ${r.json.length} total`);
  r = await api('POST', '/rest/v1/checkins', { token: D.token, body: { spot_id: cIds[35] } });
  t('user: the 31st check-in in a day is refused with the daily-limit message', r.status >= 400 && /daily check-in limit reached/.test(msg(r)), `HTTP ${r.status} ${msg(r)}`);
  await svc('DELETE', `/rest/v1/checkins?user_id=in.(${C.id},${D.id})`); await svc('DELETE', `/rest/v1/marks?user_id=in.(${C.id},${D.id})`);
  await svc('DELETE', `/rest/v1/spots?id=like.${cTag}*`);

  // ---------------- moderator ----------------
  r = await api('GET', '/rest/v1/moderators?select=user_id', { token: M.token }); t('moderator: sees own moderator row', r.json.length === 1 && r.json[0].user_id === M.id);
  r = await api('GET', '/rest/v1/spots?select=id&status=eq.pending', { token: M.token }); t("moderator: sees everyone's pending spots", r.status === 200 && r.json.length >= 10, `${r.json.length} pending`);
  r = await api('GET', '/rest/v1/pending_edits?select=id', { token: M.token }); t('moderator: sees proposed edits', r.status === 200 && r.json.length >= 2, `${r.json.length} rows`);
  r = await api('GET', '/rest/v1/reports?select=id', { token: M.token }); t('moderator: sees reports', r.status === 200 && r.json.length >= 1, `${r.json.length} rows`);
  const before = (await svc('GET', `/rest/v1/spots?select=updated_at&id=eq.${mine.id}`)).json[0].updated_at;
  r = await api('PATCH', `/rest/v1/spots?id=eq.${mine.id}`, { token: M.token, body: { status: 'approved' }, prefer: rep });
  t('moderator: approves a pending spot (touch trigger bumps updated_at)', r.status === 200 && r.json.length === 1 && r.json[0].status === 'approved' && r.json[0].updated_at > before, r.status === 200 && r.json[0] ? 'approved, updated_at advanced' : 'HTTP ' + r.status);
  r = await api('PATCH', `/rest/v1/spots?id=eq.${spot}`, { token: M.token, body: { name: 'Better name', edited: true, updated_at: new Date().toISOString() }, prefer: rep }); t('moderator: applies an edit to a live spot (approve-edit flow)', r.status === 200 && r.json.length === 1 && r.json[0].edited === true);
  r = await api('DELETE', `/rest/v1/pending_edits?id=eq.${editId}`, { token: M.token, prefer: rep }); t('moderator: removes the proposal after applying it', r.status === 200 && r.json.length === 1);
  // Phase 4: decisions are recorded on the proposal instead of deleting it
  r = await api('PATCH', `/rest/v1/pending_edits?id=eq.${own && own.id}`, { token: M.token, body: { status: 'approved', decided_at: new Date().toISOString() }, prefer: rep });
  t('moderator: marks a proposal approved (kept for history)', r.status === 200 && r.json.length === 1 && r.json[0].status === 'approved');
  r = await api('POST', '/rest/v1/rpc/spot_provenance', { body: { p_spot_id: spot } });
  t('anon: spot_provenance counts contributors from approved edits', r.status === 200 && r.json.length === 1 && r.json[0].contributors === 1 && r.json[0].last_edited, r.status === 200 ? JSON.stringify(r.json[0]) : 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/rpc/spot_provenance', { body: { p_spot_id: tag + '-pending' } }); t('anon: spot_provenance says nothing about a non-approved gym', r.status === 200 && r.json.length === 0);
  r = await api('POST', '/rest/v1/rpc/contribution_points', { token: A.token, body: { p_users: [A.id, B.id] } });
  const pts = r.json && r.json[0];
  t('user: contribution_points returns only their own row (15 per approved gym + 5 per approved edit)', r.status === 200 && r.json.length === 1 && pts.user_id === A.id && pts.edits === 1 && pts.points === 15 * pts.gyms + 5 * pts.edits, r.status === 200 ? JSON.stringify(r.json) : 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/rpc/contribution_points', { body: { p_users: [A.id] } }); t('anon: cannot call contribution_points', r.status >= 400, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/rpc/contribution_points', { token: M.token, body: { p_users: [A.id, B.id] } }); t('moderator: contribution_points for any contributors', r.status === 200 && r.json.length === 2);
  const rep1 = await svc('GET', '/rest/v1/reports?select=id&limit=1'); r = await api('DELETE', `/rest/v1/reports?id=eq.${rep1.json[0].id}`, { token: M.token, prefer: rep }); t('moderator: dismisses a report', r.status === 200 && r.json.length === 1);
  // Phase 4: a rejected gym is kept with its reason: hidden from the public, visible to its submitter
  r = await api('POST', '/rest/v1/spots', { token: B.token, body: { id: 'community-' + uuid(), name: 'B rejected', suburb: 'X', state: 'NSW', country: 'AU', lat: 0, lng: 0, types: ['top-rope'], status: 'pending', submitted_by: B.id }, prefer: rep });
  const bSpot = r.json && r.json[0];
  r = await api('PATCH', `/rest/v1/spots?id=eq.${bSpot && bSpot.id}`, { token: M.token, body: { status: 'rejected', rejection_reason: 'Duplicate of an existing gym' }, prefer: rep }); t('moderator: rejects a gym with a reason', r.status === 200 && r.json.length === 1 && r.json[0].status === 'rejected');
  r = await api('GET', `/rest/v1/spots?select=id&id=eq.${bSpot && bSpot.id}`); t('anon: cannot see a rejected gym', r.status === 200 && r.json.length === 0);
  r = await api('GET', `/rest/v1/spots?select=status,rejection_reason&id=eq.${bSpot && bSpot.id}`, { token: B.token }); t('submitter: sees their rejected gym and the reason', r.json.length === 1 && r.json[0].rejection_reason === 'Duplicate of an existing gym');
  r = await api('GET', `/rest/v1/spots?select=id&id=eq.${bSpot && bSpot.id}`, { token: A.token }); t("other user: cannot see B's rejected gym", r.json.length === 0);
  r = await api('PATCH', `/rest/v1/spots?id=eq.${spot}`, { token: A.token, body: { verified_at: new Date().toISOString() }, prefer: rep }); t('user: cannot mark a gym verified', denied(r), 'HTTP ' + r.status);
  r = await api('DELETE', `/rest/v1/spots?id=eq.${tag}-pending`, { token: M.token, prefer: rep }); t('moderator: can still hard-delete a pending spot (spam)', r.status === 200 && r.json.length === 1);
  r = await api('PATCH', `/rest/v1/routes?id=eq.${rid}`, { token: M.token, body: { grade: 'V4' }, prefer: rep }); t('moderator: cannot edit routes through the API either (read-only)', denied(r), 'HTTP ' + r.status);

  // ---------------- cleanup (local only) ----------------
  await svc('DELETE', `/rest/v1/spots?submitted_by=in.(${A.id},${B.id},${M.id})`); await svc('DELETE', `/rest/v1/spots?id=in.(${seedIds.join(',')})`);
  await svc('DELETE', `/rest/v1/routes?spot_id=in.(${seedIds.join(',')})`); await svc('DELETE', `/rest/v1/pending_edits?spot_id=in.(${seedIds.join(',')})`); await svc('DELETE', `/rest/v1/reports?spot_id=in.(${seedIds.join(',')})`);
  await svc('DELETE', `/rest/v1/moderators?user_id=eq.${M.id}`);
  await svc('DELETE', `/rest/v1/profiles?user_id=in.(${A.id},${B.id},${M.id})`);
  await svc('DELETE', `/rest/v1/checkins?user_id=in.(${A.id},${B.id},${M.id})`); await svc('DELETE', `/rest/v1/marks?user_id=in.(${A.id},${B.id},${M.id})`);

  const w = Math.max(...results.map(x => x.name.length));
  results.forEach(x => console.log((x.ok ? 'PASS ' : 'FAIL ') + x.name.padEnd(w) + '  ' + x.detail));
  const bad = results.filter(x => !x.ok).length;
  console.log(`\n${results.length - bad}/${results.length} passed` + (bad ? `, ${bad} FAILED` : ''));
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
