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
  t('anon: can propose an edit (public insert)', r.status === 201, 'HTTP ' + r.status);
  r = await api('POST', '/rest/v1/reports', { body: { spot_id: spot, message: 'wrong pin' } });
  t('anon: can submit a report (public insert)', r.status === 201, 'HTTP ' + r.status);
  for (const tb of ['pending_edits', 'reports', 'moderators', 'marks', 'sessions', 'session_climbs']) {
    r = await api('GET', `/rest/v1/${tb}?select=*`); t(`anon: reads nothing from ${tb}`, r.status === 200 && r.json.length === 0, r.status === 200 ? '0 rows' : 'HTTP ' + r.status);
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
  r = await api('POST', '/rest/v1/pending_edits', { token: A.token, body: { spot_id: spot, name: 'x', suburb: 'X', state: 'NSW', country: 'AU', lat: 1, lng: 1, types: [] }, prefer: rep });
  t('user: return=representation on pending_edits is refused (SELECT is moderator-only)', r.status === 403, 'HTTP ' + r.status);
  r = await api('GET', '/rest/v1/pending_edits?select=id', { token: A.token }); t('user: cannot read the moderation queue (edits)', r.json.length === 0);
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
  r = await api('POST', '/rest/v1/routes', { token: A.token, body: { spot_id: spot, climb_type: 'indoor-bouldering', grade: 'V2', submitted_by: A.id }, prefer: rep }); const rid = r.json && r.json[0] && r.json[0].id; t('user: can add a route', r.status === 201, 'HTTP ' + r.status);
  r = await api('PATCH', `/rest/v1/routes?id=eq.${rid}`, { token: B.token, body: { grade: 'V9' }, prefer: rep }); t("other user: cannot edit A's route", denied(r));
  r = await api('GET', '/rest/v1/moderators?select=user_id', { token: A.token }); t('user: is not a moderator (sees no moderator row)', r.json.length === 0);
  r = await api('DELETE', `/rest/v1/sessions?id=eq.${sid}`, { token: A.token, prefer: rep });
  const left = await svc('GET', `/rest/v1/session_climbs?select=id&session_id=eq.${sid}`); t('user: deleting a session cascades to its climbs', r.status === 200 && left.json.length === 0);

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
  const rep1 = await svc('GET', '/rest/v1/reports?select=id&limit=1'); r = await api('DELETE', `/rest/v1/reports?id=eq.${rep1.json[0].id}`, { token: M.token, prefer: rep }); t('moderator: dismisses a report', r.status === 200 && r.json.length === 1);
  r = await api('DELETE', `/rest/v1/spots?id=eq.${tag}-pending`, { token: M.token, prefer: rep }); t('moderator: rejects (deletes) a pending spot', r.status === 200 && r.json.length === 1);
  r = await api('PATCH', `/rest/v1/routes?id=eq.${rid}`, { token: M.token, body: { grade: 'V4' }, prefer: rep }); t("moderator: can edit any user's route", r.status === 200 && r.json.length === 1);

  // ---------------- cleanup (local only) ----------------
  await svc('DELETE', `/rest/v1/spots?submitted_by=in.(${A.id},${B.id},${M.id})`); await svc('DELETE', `/rest/v1/spots?id=in.(${seedIds.join(',')})`);
  await svc('DELETE', `/rest/v1/pending_edits?spot_id=in.(${seedIds.join(',')})`); await svc('DELETE', `/rest/v1/reports?spot_id=in.(${seedIds.join(',')})`);
  await svc('DELETE', `/rest/v1/moderators?user_id=eq.${M.id}`);

  const w = Math.max(...results.map(x => x.name.length));
  results.forEach(x => console.log((x.ok ? 'PASS ' : 'FAIL ') + x.name.padEnd(w) + '  ' + x.detail));
  const bad = results.filter(x => !x.ok).length;
  console.log(`\n${results.length - bad}/${results.length} passed` + (bad ? `, ${bad} FAILED` : ''));
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
