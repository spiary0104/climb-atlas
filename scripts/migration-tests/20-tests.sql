-- Behaviour tests for the 2026-10-02 hardening migrations, run as superuser against the throwaway database after
-- baseline + later migrations + 10-seed-before-hardening.sql + the six new migrations.
-- Each case runs its SQL under `set role <anon|authenticated>` with the JWT subject set (what PostgREST does), and records
-- PASS/FAIL in t.results. run.js prints the table and exits non-zero if any case failed.

create schema t;
create table t.results (n serial primary key, name text, ok boolean, detail text);

-- Run p_sql as p_role / p_uid. p_expect = 'ok' (must succeed) or a regex the error message must match.
create function t.try(p_name text, p_role text, p_uid uuid, p_sql text, p_expect text) returns void language plpgsql as $$
declare err text; good boolean;
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_uid::text, ''), false);
  execute format('set role %I', p_role);
  begin
    execute p_sql;
    err := null;
  exception when others then
    err := sqlerrm;
  end;
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', '', false);
  good := case when p_expect = 'ok' then err is null else coalesce(err ~* p_expect, false) end;
  insert into t.results (name, ok, detail) values (p_name, good, coalesce(left(err, 160), 'ok'));
end;
$$;

-- Run a boolean query under a role; the case passes if it returns true.
create function t.is_true(p_name text, p_role text, p_uid uuid, p_sql text) returns void language plpgsql as $$
declare v boolean; err text;
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_uid::text, ''), false);
  execute format('set role %I', p_role);
  begin
    execute p_sql into v;
  exception when others then
    err := sqlerrm;
  end;
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', '', false);
  insert into t.results (name, ok, detail) values (p_name, coalesce(v, false), coalesce(left(err, 160), v::text));
end;
$$;

-- Fixed identities (seeded in 10-seed-before-hardening.sql, plus A and B who own nothing yet).
-- A = ...0a, B = ...0b, C = ...cc (deleted at the end), D = ...dd, M = ...ee (moderator)

-- =============== 0. migrations that run twice are harmless is checked by run.js (re-applies 0100..0600) ===============
select t.is_true('seed: orphan pending_edits.submitted_by was nulled by migration 5', 'postgres', null,
  $q$ select submitted_by is null from public.pending_edits where id = 'e0000000-0000-0000-0000-0000000000f0' $q$);
select t.is_true('seed: legacy over-long row (300-char name) survived migration 2 (NOT VALID)', 'postgres', null,
  $q$ select char_length(name) = 300 from public.spots where id = 'seed-2' $q$);

-- =============== finding 1: edits and reports need sign-in ===============
select t.try('anon cannot insert a pending_edit', 'anon', null,
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng) values ('seed-1', 'x', 'x', 'NSW', 'AU', 1, 1) $q$,
  'row-level security|permission denied');
select t.try('anon cannot insert a report', 'anon', null,
  $q$ insert into public.reports (spot_id, message) values ('seed-1', 'hi') $q$,
  'row-level security|permission denied');
select t.try('authenticated can insert a pending_edit', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.pending_edits (id, spot_id, name, suburb, state, country, lat, lng) values ('e0000000-0000-0000-0000-00000000a001', 'seed-1', 'A edit', 'Sydney', 'NSW', 'AU', 1, 1) $q$, 'ok');
select t.try('authenticated can insert a report', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.reports (id, spot_id, message) values ('b0000000-0000-0000-0000-00000000a001', 'seed-1', 'wrong pin') $q$, 'ok');
select t.is_true('pending_edit submitter is pinned to the caller (forged submitted_by ignored)', 'postgres', null,
  $q$ select submitted_by = '00000000-0000-0000-0000-00000000000a' from public.pending_edits where id = 'e0000000-0000-0000-0000-00000000a001' $q$);
select t.try('forging submitted_by = B while signed in as A does not create a row owned by B', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.reports (id, spot_id, message, submitted_by) values ('b0000000-0000-0000-0000-00000000a002', 'seed-1', 'forged owner', '00000000-0000-0000-0000-00000000000b') $q$, 'ok');
select t.is_true('report submitter is pinned to the caller', 'postgres', null,
  $q$ select submitted_by = '00000000-0000-0000-0000-00000000000a' from public.reports where id = 'b0000000-0000-0000-0000-00000000a002' $q$);
select t.is_true('a signed-in user cannot read reports (moderators only)', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ select count(*) = 0 from public.reports $q$);
select t.is_true('a moderator still reads reports', 'authenticated', '00000000-0000-0000-0000-0000000000ee',
  $q$ select count(*) >= 3 from public.reports $q$);
select t.is_true('a signed-in user reads only their own pending_edits', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ select count(*) = 1 and bool_and(submitted_by = '00000000-0000-0000-0000-00000000000a') from public.pending_edits $q$);

-- Daily cap: 20 allowed, the 21st refused. User B fills the cap; user A stays unaffected.
select t.try('B can submit 20 edits in one multi-row insert', 'authenticated', '00000000-0000-0000-0000-00000000000b',
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng)
      select 'seed-1', 'B edit ' || g, 'Sydney', 'NSW', 'AU', 1, 1 from generate_series(1, 20) g $q$, 'ok');
select t.try('the 21st edit in a day is refused', 'authenticated', '00000000-0000-0000-0000-00000000000b',
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng) values ('seed-1', 'B edit 21', 'Sydney', 'NSW', 'AU', 1, 1) $q$,
  'daily edit limit reached');
select t.try('a bulk insert of 30 edits in ONE statement cannot slip past the cap', 'authenticated', '00000000-0000-0000-0000-00000000000b',
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng)
      select 'seed-1', 'B bulk ' || g, 'Sydney', 'NSW', 'AU', 1, 1 from generate_series(1, 30) g $q$, 'daily edit limit reached');
select t.is_true('B has exactly 20 edits', 'postgres', null,
  $q$ select count(*) = 20 from public.pending_edits where submitted_by = '00000000-0000-0000-0000-00000000000b' $q$);
select t.try('a bulk insert of 25 edits in one statement is refused as a whole when it would pass 20 (A, fresh user)', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng)
      select 'seed-1', 'A bulk ' || g, 'Sydney', 'NSW', 'AU', 1, 1 from generate_series(1, 25) g $q$, 'daily edit limit reached');
select t.is_true('A is not blocked by B hitting the cap (cap is per user)', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ select public.recent_edit_count() < 20 $q$);
select t.try('B can submit 20 reports', 'authenticated', '00000000-0000-0000-0000-00000000000b',
  $q$ insert into public.reports (spot_id, message) select 'seed-1', 'r' || g from generate_series(1, 20) g $q$, 'ok');
select t.try('the 21st report in a day is refused', 'authenticated', '00000000-0000-0000-0000-00000000000b',
  $q$ insert into public.reports (spot_id, message) values ('seed-1', 'r21') $q$, 'daily report limit reached');
select t.try('an edit older than 24 h stops counting (cap is a rolling window)', 'postgres', null,
  $q$ update public.pending_edits set submitted_at = now() - interval '25 hours' where id = (select id from public.pending_edits where submitted_by = '00000000-0000-0000-0000-00000000000b' limit 1) $q$, 'ok');
select t.try('...so B can submit one more edit', 'authenticated', '00000000-0000-0000-0000-00000000000b',
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng) values ('seed-1', 'B edit again', 'Sydney', 'NSW', 'AU', 1, 1) $q$, 'ok');
select t.try('anon cannot execute recent_edit_count()', 'anon', null, $q$ select public.recent_edit_count() $q$, 'permission denied');
select t.try('anon cannot execute recent_report_count()', 'anon', null, $q$ select public.recent_report_count() $q$, 'permission denied');

-- Length limits (new rows)
select t.try('edit name of 201 characters is refused', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng) values ('seed-1', repeat('n', 201), 's', 'NSW', 'AU', 1, 1) $q$,
  'pending_edits_name_len_check');
select t.try('edit notes of 2001 characters are refused', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng, notes) values ('seed-1', 'n', 's', 'NSW', 'AU', 1, 1, repeat('x', 2001)) $q$,
  'pending_edits_notes_len_check');
select t.try('edit address of 301 characters is refused', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng, address) values ('seed-1', 'n', 's', 'NSW', 'AU', 1, 1, repeat('x', 301)) $q$,
  'pending_edits_address_len_check');
select t.try('edit photo of 1001 characters is refused', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng, photo) values ('seed-1', 'n', 's', 'NSW', 'AU', 1, 1, 'https://e.test/' || repeat('x', 1000)) $q$,
  'pending_edits_photo_len_check');
select t.try('report message of 2001 characters is refused', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.reports (spot_id, message) values ('seed-1', repeat('m', 2001)) $q$, 'reports_message_len_check');
select t.try('edit at exactly the caps (200/2000/300/1000) is accepted', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.pending_edits (spot_id, name, suburb, state, country, lat, lng, notes, address, photo)
      values ('seed-1', repeat('n', 200), 's', 'NSW', 'AU', 1, 1, repeat('x', 2000), repeat('a', 300), repeat('p', 1000)) $q$, 'ok');
select t.try('new gym with a 201-character name is refused', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.spots (id, name, suburb, state, country, lat, lng, types, status, submitted_by)
      values ('community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', repeat('n', 201), 's', 'NSW', 'AU', 1, 1, '{top-rope}', 'pending', '00000000-0000-0000-0000-00000000000a') $q$,
  'spots_name_len_check');
select t.try('new gym with 2001-character notes is refused', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.spots (id, name, suburb, state, country, lat, lng, types, status, submitted_by, notes)
      values ('community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'n', 's', 'NSW', 'AU', 1, 1, '{top-rope}', 'pending', '00000000-0000-0000-0000-00000000000a', repeat('x', 2001)) $q$,
  'spots_notes_len_check');
select t.try('KNOWN: NOT VALID still checks UPDATEs, so a moderator cannot touch a legacy 300-char-name row until it is shortened', 'authenticated', '00000000-0000-0000-0000-0000000000ee',
  $q$ update public.spots set notes = 'x' where id = 'seed-2' $q$, 'spots_name_len_check');
select t.try('...and after shortening the name, the moderator update works', 'postgres', null,
  $q$ update public.spots set name = repeat('L', 100) where id = 'seed-2' $q$, 'ok');

-- =============== finding 2: forged "Verified" ===============
select t.try('gym inserted with forged verified_at / rejection_reason is accepted but sanitised', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.spots (id, name, suburb, state, country, lat, lng, types, status, submitted_by, verified_at, rejection_reason)
      values ('community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Forger Gym', 'Sydney', 'NSW', 'AU', 1, 1, '{top-rope}', 'pending',
              '00000000-0000-0000-0000-00000000000a', now(), 'pre-rejected') $q$, 'ok');
select t.is_true('verified_at and rejection_reason were nulled by the insert trigger', 'postgres', null,
  $q$ select verified_at is null and rejection_reason is null and status = 'pending' and community from public.spots where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2' $q$);
select t.try('a user inserting a gym with status approved is accepted but forced to pending', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.spots (id, name, suburb, state, country, lat, lng, types, status, submitted_by)
      values ('community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Sneaky', 'Sydney', 'NSW', 'AU', 1, 1, '{top-rope}', 'approved', '00000000-0000-0000-0000-00000000000a') $q$, 'ok');
select t.is_true('...and it is pending, so not publicly visible', 'anon', null,
  $q$ select count(*) = 0 from public.spots where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3' $q$);
select t.try('a user cannot set verified_at on an existing gym (update)', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ update public.spots set verified_at = now() where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2' $q$, 'ok');
select t.is_true('...it silently changed nothing (RLS: only moderators update)', 'postgres', null,
  $q$ select verified_at is null from public.spots where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2' $q$);
select t.try('moderator approves the gym (client sends verified_at: null) and it stays unverified', 'authenticated', '00000000-0000-0000-0000-0000000000ee',
  $q$ update public.spots set status = 'approved', verified_at = null where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2' $q$, 'ok');
select t.is_true('approved gym has no verified_at', 'postgres', null,
  $q$ select status = 'approved' and verified_at is null from public.spots where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2' $q$);
select t.try('moderator can still mark a gym verified (separate control)', 'authenticated', '00000000-0000-0000-0000-0000000000ee',
  $q$ update public.spots set verified_at = now() where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2' $q$, 'ok');
select t.is_true('...and it sticks', 'postgres', null,
  $q$ select verified_at is not null from public.spots where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2' $q$);

-- =============== finding 3: routes ===============
select t.try('anon cannot insert a route', 'anon', null,
  $q$ insert into public.routes (spot_id, climb_type, grade) values ('seed-1', 'top-rope', 'V1') $q$, 'permission denied|row-level security');
select t.try('authenticated cannot insert a route', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.routes (spot_id, climb_type, grade, submitted_by) values ('seed-1', 'top-rope', 'V1', '00000000-0000-0000-0000-00000000000a') $q$, 'permission denied|row-level security');
select t.try('authenticated cannot update a route', 'authenticated', '00000000-0000-0000-0000-0000000000ee',
  $q$ update public.routes set grade = 'V9' $q$, 'permission denied');
select t.try('authenticated (even a moderator) cannot delete a route', 'authenticated', '00000000-0000-0000-0000-0000000000ee',
  $q$ delete from public.routes $q$, 'permission denied');
select t.try('anon can still read routes', 'anon', null, $q$ select count(*) from public.routes $q$, 'ok');
select t.is_true('the insert policy on routes is gone', 'postgres', null,
  $q$ select not exists (select 1 from pg_policies where tablename = 'routes' and cmd = 'INSERT') $q$);

-- =============== finding 5: slug helpers ===============
select t.try('anon cannot call next_spot_slug', 'anon', null, $q$ select public.next_spot_slug('forger-gym-sydney', 'x') $q$, 'permission denied');
select t.try('authenticated cannot call next_spot_slug', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ select public.next_spot_slug('forger-gym-sydney', 'x') $q$, 'permission denied');
select t.try('authenticated cannot call set_spot_slug directly', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ select public.set_spot_slug() $q$, 'permission denied');
select t.is_true('a new gym still gets its slug (trigger works without API EXECUTE)', 'postgres', null,
  $q$ select slug = 'forger-gym-sydney' from public.spots where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2' $q$);
select t.try('a second gym with the same name and suburb is accepted', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ insert into public.spots (id, name, suburb, state, country, lat, lng, types, status, submitted_by)
      values ('community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Forger Gym', 'Sydney', 'NSW', 'AU', 1, 1, '{top-rope}', 'pending', '00000000-0000-0000-0000-00000000000a') $q$, 'ok');
select t.is_true('...and gets the -2 slug (the uniqueness check sees other users'' pending gyms)', 'postgres', null,
  $q$ select slug = 'forger-gym-sydney-2' from public.spots where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4' $q$);
select t.is_true('slug of an existing gym is immutable on update', 'postgres', null,
  $q$ with u as (update public.spots set slug = 'hijacked', name = 'Forger Gym Renamed' where id = 'community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4' returning slug) select slug = 'forger-gym-sydney-2' from u $q$);

-- =============== finding 6: recent_submission_count ===============
select t.try('anon cannot execute recent_submission_count()', 'anon', null, $q$ select public.recent_submission_count() $q$, 'permission denied');
select t.is_true('authenticated still can (spots insert policy uses it)', 'authenticated', '00000000-0000-0000-0000-00000000000a',
  $q$ select public.recent_submission_count() >= 1 $q$);
select t.try('anon cannot insert a spot (still)', 'anon', null,
  $q$ insert into public.spots (id, name, suburb, state, country, lat, lng, types, status) values ('community-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'x', 'x', 'NSW', 'AU', 1, 1, '{top-rope}', 'pending') $q$,
  'row-level security|permission denied');
select t.is_true('anon can still read approved spots', 'anon', null, $q$ select count(*) >= 2 from public.spots where status = 'approved' $q$);
select t.is_true('anon cannot see pending spots', 'anon', null, $q$ select count(*) = 0 from public.spots where status = 'pending' $q$);

-- Evidence for the report (not fixed here): the existing 10-a-day spots limit lives in a policy, so one bulk INSERT passes it.
select t.try('INFO (existing, not changed): 15 gyms in one bulk insert pass the 10/day spots policy', 'authenticated', '00000000-0000-0000-0000-00000000000b',
  $q$ insert into public.spots (id, name, suburb, state, country, lat, lng, types, status, submitted_by)
      select 'community-bbbbbbbb-bbbb-bbbb-bbbb-' || lpad(g::text, 12, '0'), 'Bulk ' || g, 'Sydney', 'NSW', 'AU', 1, 1, '{top-rope}', 'pending', '00000000-0000-0000-0000-00000000000b'
      from generate_series(1, 15) g $q$, 'ok');

-- =============== finding 4: account deletion ===============
select t.is_true('every FK that references auth.users has ON DELETE CASCADE or SET NULL', 'postgres', null,
  $q$ select bool_and(confdeltype in ('c', 'n')) and count(*) >= 9 from pg_constraint where contype = 'f' and confrelid = 'auth.users'::regclass $q$);
select t.is_true('before deletion: C owns a profile, mark, check-in, session, 2 gyms, 1 route, 1 edit, 1 report', 'postgres', null,
  $q$ select (select count(*) from public.profiles where user_id = '00000000-0000-0000-0000-0000000000cc') = 1
        and (select count(*) from public.marks where user_id = '00000000-0000-0000-0000-0000000000cc') = 1
        and (select count(*) from public.checkins where user_id = '00000000-0000-0000-0000-0000000000cc') = 1
        and (select count(*) from public.sessions where user_id = '00000000-0000-0000-0000-0000000000cc') = 1
        and (select count(*) from public.spots where submitted_by = '00000000-0000-0000-0000-0000000000cc') = 2
        and (select count(*) from public.routes where submitted_by = '00000000-0000-0000-0000-0000000000cc') = 1
        and (select count(*) from public.pending_edits where submitted_by = '00000000-0000-0000-0000-0000000000cc') = 1 $q$);
-- C also files a report and an edit through the API so the report FK is exercised, then C is deleted.
select t.try('C submits a report before leaving', 'authenticated', '00000000-0000-0000-0000-0000000000cc',
  $q$ insert into public.reports (id, spot_id, message) values ('b0000000-0000-0000-0000-0000000000cc', 'seed-1', 'from C') $q$, 'ok');
select t.try('DELETE FROM auth.users for C (who has gyms, a route, check-ins, marks, a profile, sessions) succeeds', 'postgres', null,
  $q$ delete from auth.users where id = '00000000-0000-0000-0000-0000000000cc' $q$, 'ok');
select t.is_true('C personal rows are gone: profile, marks, check-ins, sessions, session_climbs', 'postgres', null,
  $q$ select (select count(*) from public.profiles where user_id = '00000000-0000-0000-0000-0000000000cc') = 0
        and (select count(*) from public.marks where user_id = '00000000-0000-0000-0000-0000000000cc') = 0
        and (select count(*) from public.checkins where user_id = '00000000-0000-0000-0000-0000000000cc') = 0
        and (select count(*) from public.sessions where user_id = '00000000-0000-0000-0000-0000000000cc') = 0
        and (select count(*) from public.session_climbs where session_id = '5e5e5e5e-0000-0000-0000-000000000001') = 0 $q$);
select t.is_true('C gyms are kept with submitted_by = null (content intact)', 'postgres', null,
  $q$ select count(*) = 2 and bool_and(submitted_by is null) and bool_or(name = 'C Pending Gym') and bool_or(name = 'C Approved Gym')
       from public.spots where id in ('community-cccccccc-cccc-cccc-cccc-cccccccccccc', 'community-c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0') $q$);
select t.is_true('C route, edit and reports are kept with submitted_by = null', 'postgres', null,
  $q$ select (select submitted_by is null from public.routes where id = '0a0a0a0a-0000-0000-0000-000000000001')
        and (select submitted_by is null from public.pending_edits where id = 'e0000000-0000-0000-0000-00000000000c')
        and (select submitted_by is null from public.reports where id = 'b0000000-0000-0000-0000-0000000000cc') $q$);
select t.is_true('other users are untouched (D edit keeps its submitter)', 'postgres', null,
  $q$ select submitted_by = '00000000-0000-0000-0000-0000000000dd' from public.pending_edits where id = 'e0000000-0000-0000-0000-00000000000d' $q$);
select t.is_true('the approved gym now reads as added by nobody (spot_provenance: no name, 0 contributors)', 'anon', null,
  $q$ select added_by is null and contributors = 0 from public.spot_provenance('community-c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0') $q$);
select t.try('deleting a user with nothing but a pending edit (D) succeeds', 'postgres', null,
  $q$ delete from auth.users where id = '00000000-0000-0000-0000-0000000000dd' $q$, 'ok');
select t.is_true('...and the edit stays', 'postgres', null,
  $q$ select submitted_by is null from public.pending_edits where id = 'e0000000-0000-0000-0000-00000000000d' $q$);
