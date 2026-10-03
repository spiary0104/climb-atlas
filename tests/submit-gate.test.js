// Sign-in gate for edits and reports, server error messages, and consistency between the client limits and the
// 2026-10-02 hardening migrations (supabase/migrations/20261002*.sql). Pure/static: nothing here talks to a database.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const mig = (prefix) => {
  const f = fs.readdirSync(path.join(ROOT, 'supabase', 'migrations')).find((n) => n.startsWith(prefix));
  assert.ok(f, 'migration ' + prefix + ' exists');
  return read('supabase/migrations/' + f);
};
const load = () => import(pathToFileURL(path.join(ROOT, 'js/modules/submit-errors.js')).href);

test('submitErrorMessage turns server errors into readable text', async () => {
  const { submitErrorMessage } = await load();
  assert.match(submitErrorMessage({ message: 'daily edit limit reached' }, 'x'), /limit of 20 edits.*tomorrow/);
  assert.match(submitErrorMessage({ message: 'daily report limit reached' }, 'x'), /limit of 20 reports.*tomorrow/);
  assert.match(submitErrorMessage({ message: 'daily gym limit reached' }, 'x'), /limit of 10 new gyms.*tomorrow/);
  assert.match(submitErrorMessage({ message: 'new row for relation "pending_edits" violates check constraint "pending_edits_notes_len_check"' }, 'x'), /notes is too long \(at most 2000 characters\)/);
  assert.match(submitErrorMessage({ message: 'new row for relation "reports" violates check constraint "reports_message_len_check"' }, 'x'), /message is too long \(at most 2000/);
  assert.match(submitErrorMessage({ message: 'new row for relation "spots" violates check constraint "spots_name_len_check"' }, 'x'), /name is too long \(at most 200/);
  assert.match(submitErrorMessage({ message: 'violates check constraint "something_else"' }, 'x'), /too long/);
  assert.match(submitErrorMessage({ message: 'new row violates row-level security policy for table "reports"' }, 'x'), /sign in again/i);
  assert.equal(submitErrorMessage({ message: 'network down' }, 'fallback text'), 'fallback text');
  assert.equal(submitErrorMessage(null, 'fallback text'), 'fallback text');
});

test('client text limits match the database caps (migration 20261002000200) and the form maxlength attributes', async () => {
  const { TEXT_LIMITS } = await load();
  const sql = mig('20261002000200');
  const caps = {};
  for (const m of sql.matchAll(/\('(?:spots|pending_edits|reports)',\s*'(\w+)',\s*(\d+)\)/g)) {
    if (caps[m[1]] !== undefined) assert.equal(caps[m[1]], Number(m[2]), m[1] + ' has the same cap on every table');
    caps[m[1]] = Number(m[2]);
  }
  assert.deepEqual(caps, TEXT_LIMITS);
  const html = read('index.html');
  const max = (id) => Number((new RegExp('id="' + id + '"[^>]*maxlength="(\\d+)"').exec(html) || [])[1]);
  assert.equal(max('eName'), TEXT_LIMITS.name);
  assert.equal(max('eSuburb'), TEXT_LIMITS.suburb);
  assert.equal(max('eAddress'), TEXT_LIMITS.address);
  assert.equal(max('ePhoto'), TEXT_LIMITS.photo);
  assert.equal(max('rMessage'), TEXT_LIMITS.message);
  const add = read('js/modules/add-html.js');
  for (const [k, v] of Object.entries({ address: 300, photo: 1000, notes: 2000, suburb: 200 })) assert.equal(v, TEXT_LIMITS[k], k);
  assert.match(add, /maxlength="300"/); assert.match(add, /maxlength="1000"/);
  // Gym information (migration 20261004000100): the form caps are the database caps.
  const { LIMITS, infoFieldsHtml } = await import('../js/modules/gym-info.js');
  const gi = mig('20261004000100');
  for (const s of ['char_length(description) <= ' + LIMITS.description, 'char_length(website) <= ' + LIMITS.website, 'char_length(day_pass) <= ' + LIMITS.day_pass, '^.{' + (LIMITS.hour + 1) + '}']) assert.ok(gi.includes(s), 'migration caps: ' + s);
  const form = infoFieldsHtml('e', {});
  for (const [id, cap] of [['e-website', LIMITS.website], ['e-day-pass', LIMITS.day_pass], ['e-description', LIMITS.description], ['e-hours-mon', LIMITS.hour]]) assert.match(form, new RegExp('id="' + id + '"[^>]*maxlength="' + cap + '"'), id);
});

test('edit, revert and report all require sign-in before opening AND before submitting', () => {
  const src = read('js/modules/modals.js');
  assert.match(src, /import \{ openAuthModal \} from '\.\/auth-ui\.js'/);
  assert.match(src, /function requireSignIn\(reason\)\{\s*if\(window\.auth && window\.auth\.user\) return true;\s*showToast\(reason\);\s*openAuthModal\(\);\s*return false;/);
  const openEdit = /export async function openEditModal\(id(?:, \{[^)]*\})?\)\{[\s\S]*?\n\}/.exec(src)[0];
  const openReport = /export function openReportModal\(id\)\{[\s\S]*?\n\}/.exec(src)[0];
  assert.ok(/requireSignIn\(/.test(openEdit) && /requireSignIn\(/.test(openReport), 'both dialogs are gated on open');
  for (const start of ["getElementById('eSaveBtn').addEventListener", "getElementById('eRevertBtn').addEventListener", 'rSubmitBtn.addEventListener']) {
    const at = src.indexOf(start);
    assert.ok(at > 0, start + ' found');
    const body = src.slice(at);
    const upToInsert = body.slice(0, body.search(/\.insert\(/));
    assert.ok(/requireSignIn\(/.test(upToInsert), start + ' re-checks sign-in before inserting');
  }
  assert.equal((src.match(/submitErrorMessage\(err,/g) || []).length, 3, 'all three submit handlers use the readable messages');
});

test('approving a gym never keeps a submitter-supplied verified_at; moderators verify separately', () => {
  const src = read('js/modules/moderation.js');
  const approve = /export function approveSpot[\s\S]*?\n\}/.exec(src)[0];
  assert.match(approve, /status: 'approved', verified_at: null/);
  assert.match(src, /update\(\{ verified_at: on \? new Date\(\)\.toISOString\(\) : null \}\)/, 'the separate verify control still sets it');
});

test('hardening migrations: sign-in required, no WITH CHECK (true), triggers pin the unsafe columns', () => {
  const one = mig('20261002000100');
  assert.match(one, /create policy "signed-in users can propose an edit" on public\.pending_edits for insert to authenticated\s+with check \(auth\.uid\(\) is not null and submitted_by = auth\.uid\(\)\)/);
  assert.match(one, /create policy "signed-in users can submit a report" on public\.reports for insert to authenticated\s+with check \(auth\.uid\(\) is not null and submitted_by = auth\.uid\(\)\)/);
  assert.ok(!/with check \(true\)/i.test(one.replace(/^--.*$/gm, '')), 'the new migration code never re-opens a WITH CHECK (true) policy');
  assert.match(one, /daily edit limit reached/); assert.match(one, /daily report limit reached/);
  assert.match(one, /revoke all on function public\.recent_edit_count\(\) from public, anon/);
  assert.match(mig('20261002000300'), /new\.verified_at\s+:= null;\s+new\.rejection_reason := null;/);
  const routes = mig('20261002000400');
  assert.match(routes, /drop policy if exists "signed-in users can add routes"/);
  assert.match(routes, /revoke all on table public\.routes from anon, authenticated/);
  const fks = mig('20261002000500');
  for (const t of ['spots', 'routes', 'pending_edits']) assert.match(fks, new RegExp('alter table public\\.' + t + ' add constraint ' + t + '_submitted_by_fkey\\s+foreign key \\(submitted_by\\) references auth\\.users\\(id\\) on delete set null'));
  const fn = mig('20261002000600');
  assert.match(fn, /revoke all on function public\.next_spot_slug\(text, text\) from public, anon, authenticated/);
  assert.match(fn, /language plpgsql security definer\s+set search_path = public/);
  assert.match(fn, /revoke execute on function public\.recent_submission_count\(\) from anon/);
  for (const f of fs.readdirSync(path.join(ROOT, 'supabase', 'migrations')).filter((n) => n >= '20261002')) {
    const sql = read('supabase/migrations/' + f);
    assert.match(sql, /^begin;$/m, f + ' is wrapped in a transaction'); assert.match(sql, /^commit;$/m, f);
  }
});

test('the client no longer relies on anonymous reports or edits', () => {
  assert.ok(!/anyone can/i.test(read('index.html')), 'no copy promises anonymous editing');
  const guard = read('supabase/schema.sql').split('\n').slice(0, 40).join('\n');
  assert.match(guard, /STALE/); assert.match(guard, /raise exception/i, 'schema.sql refuses to run');
  assert.ok(!/Run once in the Supabase SQL Editor/i.test(read('README.md')), 'README no longer tells people to run schema.sql');
});
