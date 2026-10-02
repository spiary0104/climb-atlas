# Offline migration tests

Tests for the 2026-10-02 security-hardening migrations (`supabase/migrations/20261002*.sql`) on a **throwaway plain
Postgres container**. They never touch production, `supabase link`, or the local Supabase stack
(`supabase_*_climb-atlas` containers).

## Run

Needs Docker (daemon running) and Node. From the repo root:

```
node scripts/migration-tests/run.js            # create bouldeer-migtest, test, remove it (exit 0 = all pass)
node scripts/migration-tests/run.js --control  # negative control: skip the new migrations; ~half the cases must FAIL
node scripts/migration-tests/run.js --keep     # keep the container (port 55432, user postgres, password x) to inspect it
docker rm -f bouldeer-migtest                  # only needed after --keep or an interrupted run
```

The image defaults to `postgres:17` (production is 17.6); override with `MIGTEST_IMAGE`.

## What it does

1. `00-supabase-shim.sql` — stands in for the Supabase pieces the migrations need: roles `anon`, `authenticated`,
   `service_role` (bypasses RLS), schemas `auth` (just `auth.users(id, email)` and `auth.uid()` reading
   `request.jwt.claim.sub`) and `extensions` (unaccent, pgcrypto), and the same default privileges as production (new
   tables and functions fully granted to anon/authenticated/service_role). Not shimmed because nothing uses it: storage,
   realtime, graphql, vault, `auth.jwt()`, `auth.role()`.
2. Applies the baseline and the three earlier migrations, then `10-seed-before-hardening.sql` (legacy rows the new
   migrations must tolerate: a 300-character name, an orphaned `pending_edits.submitted_by`, a user with gyms, a route,
   a check-in, marks, a profile and a session).
3. Applies the six hardening migrations, then applies each a second time (idempotency).
4. `20-tests.sql` — each case runs under `set role anon|authenticated` with `request.jwt.claim.sub` set, as PostgREST
   does, and is recorded in `t.results`; the runner prints PASS/FAIL per case. Covers: anonymous insert refused and
   signed-in insert accepted for `pending_edits`/`reports`; submitter pinned; the 21st edit/report in 24 h refused
   (also for one bulk multi-row insert, and per user); length caps; forged `verified_at`/`rejection_reason` nulled;
   `routes` writes denied; `next_spot_slug` and `recent_*_count` not executable by anon; new gyms still get slugs;
   deleting an `auth.users` row with gyms, route, check-in, marks, profile and sessions succeeds and keeps shared
   content with `submitted_by` null. Moderator behaviour (approve, verify, read reports) is checked too.

The `INFO` case documents an existing gap that these migrations do not fix (the 10-a-day gym cap passes for one bulk
insert); it asserts the current behaviour, so it will start failing when that gap is closed. Update it then.
