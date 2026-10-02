# Database migrations (Supabase CLI)

`supabase/migrations/` is the source of truth for the schema. `supabase/schema.sql` is **stale** (it predates the
hardening that is live) and is kept only until it is retired; do not edit it and do not treat it as canonical.
It now begins with a statement that raises an error, so it cannot be run by accident.

## Baseline
`supabase/migrations/20260924000000_baseline_live_schema.sql` reproduces the live production schema of
2026-09-24 exactly (verified: `scripts/compare-schema.js` reports no differences between live and a database built
only from this file; 52/52 RLS checks pass — see `docs/schema-introspection-2026-09-24.md`). Production already
contains it, so it was **recorded as applied, never executed there**. Never edit it.

## Making a schema change
1. `supabase migration new <describes_the_change>` → edit the new file in `supabase/migrations/`.
2. `supabase db reset --local` (Docker; rebuilds the local DB from all migrations) — then
   `node scripts/test-rls-local.js` and any query the app makes.
3. Update the app code if columns/policies it uses changed. Commit migration + app changes together.
4. Only then apply to production: `supabase db push --linked` (review the printed list first).
Never edit the database by hand in the dashboard SQL editor without capturing the change as a migration.

## Local stack
`supabase start -x realtime,storage-api,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor`
(DB + Auth + REST only; CLI 2.117.0 lives at `C:\Users\Spiar\tools\supabase-cli\supabase.exe`, Docker Desktop is
per-user under `%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin`). Config: `supabase/config.toml`
(`project_id = "climb-atlas"`, Postgres 17). Local API: http://127.0.0.1:54321.

## Baseline recorded on production
Done 2026-09-24 (approved): `supabase migration repair 20260924000000 --status applied --linked`.
This created the `supabase_migrations` schema and one row (`20260924000000`, `baseline_live_schema`, 112 statements);
no schema or data change. Verified afterwards: `supabase migration list --linked` shows local and remote both at
`20260924000000`, and a read-only re-capture (`supabase/introspection/live-post-repair-2026-09-24`) is identical to the
pre-repair capture for every public-schema object and every row count (only the new `supabase_migrations` schema differs).
From here on, apply new migrations with `supabase db push --linked`.

## Applied to production
2026-09-29 (owner ran `supabase db push --linked` after a dry run listing exactly these three):
`20260926072124_add_spot_slugs`, `20260926084510_community_provenance`, `20260927090000_checkins`. Before: schema and data
backups with `supabase db dump --linked` (kept outside the repo; the data dump holds auth users, keep it private). Rehearsed
first on a local database built from the baseline plus a copy of the 2,127 production gyms. Verified afterwards (read-only):
`migration list --linked` shows all four on both sides; 2,127 unique well-formed slugs; no gym's `updated_at` changed (compared
with the backup); `checkins` refuses anon reads and writes; `profiles` readable; provenance RPCs answer; the live site loads.

2026-10-02 (owner ran `supabase db push --linked` after a dry run listing exactly these six): the security hardening
`20261002000100` … `20261002000600` (section below). Before: schema and data backups with `supabase db dump --linked`
(outside the repo). Read-only pre-checks returned 0 / 0 / 0 (community gyms with `verified_at`, rows over the new caps,
orphaned edit submitters). Verified afterwards: `migration list --linked` shows all ten on both sides; anon
`rpc/next_spot_slug` is refused (401, permission denied); `verify-index --live` still equals the index (2,127); the owner
tested sign-in, a signed-in gym submission, a suggested edit and a problem report, and moderation, on production.

## Tools
- `scripts/introspect-schema.js <live|local|scratch> <dir>` — read-only catalog capture (live queries run inside `BEGIN READ ONLY`).
- `scripts/compare-schema.js <live-dir> <other-dir>` — diff two captures (public schema).
- `scripts/test-rls-local.js` — RLS/trigger behaviour as anon / user / moderator, against the local stack only.

## Security hardening, 2026-10-02 (APPLIED TO PRODUCTION 2026-10-02)
Six migrations from the security audit, `supabase/migrations/20261002000100` … `20261002000600`. Each is wrapped in a
transaction and safe to run twice. They were tested only on a throwaway Postgres 17 container
(`node scripts/migration-tests/run.js`, 74/74 cases pass, see `scripts/migration-tests/README.md`), never on production
or on the local Supabase stack. **Status of all six: APPLIED TO PRODUCTION 2026-10-02** (see "Applied to production" above).

**Order of deployment:** ship the client change first (it asks signed-out people to sign in before editing or reporting
and shows readable cap/length errors; it works with or without the migrations), then back up and apply with
`supabase db push --linked` (review the printed list first, as on 2026-09-29). An old cached client after the migrations
would only see "Please sign in again" style failures for anonymous edit/report attempts (the service worker is bumped to v15).
Before applying, run the two read-only audit queries below.

| # | File | What it changes | Finding | Risk |
|---|------|-----------------|---------|------|
| 1 | `20261002000100_require_signin_for_edits_and_reports` | `pending_edits` and `reports`: INSERT only for signed-in users with `submitted_by = auth.uid()` (policies `... to authenticated`); `reports.submitted_by` column (FK, `ON DELETE SET NULL`) pinned by trigger; 20 edits + 20 reports per user per 24 h via `recent_edit_count()` / `recent_report_count()` (SECURITY DEFINER, no args, not executable by anon), enforced in the BEFORE INSERT triggers under a per-user advisory lock so one bulk insert or parallel requests cannot pass the cap; errors `daily edit limit reached` / `daily report limit reached` | anyone with the anon key could flood moderation queues | Anonymous edits/reports stop working by design (owner decision). Adds a nullable column and two indexes (instant at this size). Moderators are subject to the 20/day edit cap too |
| 2 | `20261002000200_text_length_limits` | `char_length` CHECKs, all `NOT VALID`: name 200, suburb 200, state 100, country 100, address 300, notes 2000, photo 1000 on `spots` and `pending_edits`; message 2000 on `reports` | unbounded free text | `NOT VALID` means existing rows are never scanned or rejected, but the check still applies to every future INSERT **and UPDATE** of a row, so a legacy row already over a cap cannot be updated (e.g. approved-edit target) until shortened. Longest seed data: name 67, notes 1,055, so none expected; run the audit query |
| 3 | `20261002000300_pin_verified_and_rejection` | `pin_community_submission()` additionally nulls `verified_at` and `rejection_reason` on insert when `auth.uid()` is not null | a submitter could pre-set "Verified" | Existing rows untouched (audit query below). Client: `approveSpot` also sends `verified_at: null`; moderators verify only with the separate "Mark verified" control |
| 4 | `20261002000400_lock_down_routes_writes` | drops "signed-in users can add routes"; revokes all on `routes` from anon/authenticated, grants SELECT back | unused table writable by any user | None for the app (no `from('routes')` in `js/`). SELECT kept public on purpose (empty/unused, future feature, harmless); revoke it too if you prefer. The submitter/moderator UPDATE/DELETE policies remain but are inert |
| 5 | `20261002000500_account_deletion_fks` | `spots.submitted_by`, `routes.submitted_by` -> `ON DELETE SET NULL`; new FK `pending_edits.submitted_by` -> `ON DELETE SET NULL` after nulling orphaned ids | deleting an account failed (FK violation) | Rebuilds three constraints (brief lock). Orphaned `pending_edits.submitted_by` values are set to NULL (production data change, only for users that no longer exist) |
| 6 | `20261002000600_lock_down_helper_functions` | `next_spot_slug` revoked from public/anon/authenticated; `set_spot_slug()` becomes SECURITY DEFINER (`search_path = public`) so the slug trigger keeps working; `recent_submission_count()` revoked from anon | anyone could probe slugs of pending/rejected gyms | Low. Verified: new gyms still get slugs (`-2` suffix on clashes) with API roles holding no EXECUTE |

**What happens when an account is deleted** (feeds the privacy policy; verified in the container test). Deleting the user in Supabase Auth now succeeds. Deleted with the account: display name (`profiles`), climbed/saved marks, check-ins and passport stamps, logbook sessions and their climbs, moderator status. **Kept, no longer linked to anyone** (`submitted_by` becomes NULL): gyms the person added (an approved gym shows as added by "a climber" and the person is no longer counted as a contributor; a pending or rejected gym stays but is visible to moderators only), edit proposals they made (applied edits stay in the gym), reports they filed, and routes (none exist). Kept content may still contain whatever free text the person typed into names, notes, edit notes and report messages; that text is not scrubbed. The gym's `updated_at` moves to the deletion time. Contribution points disappear. The login itself (the `auth.users` row and email) is removed by Supabase Auth.

**Rollback SQL** (each re-opens the finding it fixed; run in the SQL Editor or as a new migration):
```sql
-- 6 (functions)
create or replace function public.set_spot_slug() returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' or old.slug is null then
    new.slug := public.next_spot_slug(public.spot_slug_base(new.name, new.suburb, new.id), new.id);
  else new.slug := old.slug; end if;
  return new;
end; $$;
grant execute on function public.next_spot_slug(text, text) to public, anon, authenticated;
grant execute on function public.set_spot_slug() to public, anon, authenticated;
grant execute on function public.recent_submission_count() to anon;
-- 5 (FKs)
alter table public.spots drop constraint if exists spots_submitted_by_fkey;
alter table public.spots add constraint spots_submitted_by_fkey foreign key (submitted_by) references auth.users(id);
alter table public.routes drop constraint if exists routes_submitted_by_fkey;
alter table public.routes add constraint routes_submitted_by_fkey foreign key (submitted_by) references auth.users(id);
alter table public.pending_edits drop constraint if exists pending_edits_submitted_by_fkey;
-- 4 (routes)
grant all on table public.routes to anon, authenticated;
create policy "signed-in users can add routes" on public.routes for insert with check (auth.uid() is not null and submitted_by = auth.uid());
-- 3 (pin verified): same function without the two assignments
create or replace function public.pin_community_submission() returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null then
    new.created_at := now(); new.updated_at := now(); new.community := true; new.edited := false;
    new.status := 'pending'; new.submitted_by := auth.uid();
    if new.id is null or new.id !~ '^community-[0-9a-f-]{36}$' then new.id := 'community-' || gen_random_uuid()::text; end if;
  end if;
  return new;
end; $$;
-- 2 (length limits)
do $$ declare r record; begin
  for r in select conrelid::regclass as t, conname from pg_constraint where conname like '%\_len\_check' and connamespace = 'public'::regnamespace
  loop execute format('alter table %s drop constraint %I', r.t, r.conname); end loop;
end $$;
-- 1 (sign-in + caps)
drop policy if exists "signed-in users can propose an edit" on public.pending_edits;
create policy "anyone can propose an edit" on public.pending_edits for insert with check (true);
drop policy if exists "signed-in users can submit a report" on public.reports;
create policy "anyone can submit a report" on public.reports for insert with check (true);
drop trigger if exists reports_pin_submission on public.reports;
drop function if exists public.pin_report_submission();
create or replace function public.pin_edit_proposal() returns trigger language plpgsql set search_path = public as $$
begin
  new.submitted_by := auth.uid(); new.status := 'pending'; new.decided_at := null; new.rejection_reason := null; new.submitted_at := now();
  return new;
end; $$;
drop function if exists public.recent_edit_count();
drop function if exists public.recent_report_count();
-- (reports.submitted_by and the indexes are harmless and are kept; `alter table public.reports drop column submitted_by` removes them)
```

**Read-only checks to run on production before applying** (nothing here writes):
```sql
-- gyms that carry a verification date although a community member added them: review each (moderators may have verified some on purpose)
select id, name, status, verified_at from public.spots where community and verified_at is not null order by verified_at;
-- rows already over a new cap (expected: none); each would block UPDATEs of that row until shortened
select 'spots' as t, id::text from public.spots where char_length(name) > 200 or char_length(suburb) > 200 or char_length(state) > 100 or char_length(country) > 100 or char_length(address) > 300 or char_length(notes) > 2000 or char_length(photo) > 1000
union all select 'pending_edits', id::text from public.pending_edits where char_length(name) > 200 or char_length(suburb) > 200 or char_length(state) > 100 or char_length(country) > 100 or char_length(address) > 300 or char_length(notes) > 2000 or char_length(photo) > 1000
union all select 'reports', id::text from public.reports where char_length(message) > 2000;
-- orphaned edit submitters migration 5 will null (users that no longer exist)
select count(*) from public.pending_edits e where e.submitted_by is not null and not exists (select 1 from auth.users u where u.id = e.submitted_by);
```
**After applying**, verify read-only: `select policyname, cmd, roles from pg_policies where tablename in ('pending_edits','reports','routes')`; an anonymous REST `POST /rest/v1/reports` returns 401/403; `POST /rest/v1/rpc/next_spot_slug` as anon returns 401/403/404; `migration list --linked` shows all ten migrations on both sides.

**Not covered by these migrations (found while testing, tell the owner):** the existing 10-gyms-a-day limit on `spots` lives in an RLS policy, which sees one statement snapshot, so one bulk insert (a JSON array in a single REST call) of 15+ gyms passes it (shown by the INFO case in `scripts/migration-tests/20-tests.sql`); the fix is to move that cap into the pin trigger like migration 1 does for edits and reports. Table-level TRUNCATE/REFERENCES/TRIGGER privileges are still granted to anon and authenticated on all tables (PostgREST does not expose them, but revoking them is cheap hardening). `supabase/schema.sql` is now guarded: it raises an error as its first statement, so `scripts/introspect-schema.js scratch` (which used to apply it for the historical comparison) stops there by design.

## Gym submission cap in the trigger, 2026-10-03 (PREPARED — NOT APPLIED; owner applies with supabase db push --linked)
`20261003000100_spots_daily_cap_in_trigger`: pin_community_submission() also enforces the 10-gyms-a-day cap per row under a per-user
advisory lock (like the edit/report caps), so one bulk insert can no longer pass the policy-only check. Error: 'daily gym limit reached'
(the client shows a readable message). Service-role writes (importer) untouched; no data change. Tested in the throwaway container
(`node scripts/migration-tests/run.js`: 74/74, the former INFO case now a passing refusal). Rollback: re-run the function body of
`20261002000300_pin_verified_and_rejection.sql`.
