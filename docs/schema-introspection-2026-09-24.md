# Live schema introspection — 2026-09-24 (Stage 2)

Read-only capture of the production Supabase project `thayxaampaelvntoaido` ("Climb Atlas", ap-southeast-1,
Postgres 17.6) and comparison with `supabase/schema.sql`. Nothing was written to the project's schema or data.

## Method and safety
- Tools: Supabase CLI 2.117.0 (`supabase db query --linked`, Management API), Docker 29.8.0 for scratch builds.
- Every live query is a `SELECT` on `pg_catalog`, wrapped in `BEGIN READ ONLY … ROLLBACK` so the database itself
  rejects writes; the runner also refuses non-SELECT-looking SQL (`scripts/introspect-schema.js`).
- **Side effect to know about:** each CLI call creates/refreshes a short-lived temporary role `cli_login_postgres`
  (the CLI's normal auth mechanism; it expires by itself). It was the only production change made.
- Captures: `supabase/introspection/live-2026-09-24/*.json` (queries in `supabase/introspection/queries*/`).
  Comparison builds: `schema-sql-scratch-…` (current `supabase/schema.sql` on a throwaway PG17 container) and
  `audit-critical-scratch-…` (`origin/fix/audit-critical:supabase/schema.sql`). Diff tool: `scripts/compare-schema.js`.

## Headline
1. **The live schema is NOT what `supabase/schema.sql` (this branch / master) describes.** It matches
   `origin/fix/audit-critical:supabase/schema.sql` exactly for relations, column definitions, constraints, indexes,
   RLS policies, function bodies and triggers. That branch (3 commits, 15 behind master) was applied to
   production but never merged, so master's `schema.sql` is stale. The baseline must come from live.
2. Current `schema.sql` applies cleanly to a fresh PG17 and is idempotent (2nd run silent) — it is just out of date.
3. No migration history exists on live (no `supabase_migrations` schema), so nothing will conflict when one is added.

## Differences: live vs current `schema.sql`
| # | Object | Live | `schema.sql` |
|---|---|---|---|
| 1 | Function `public.pin_community_submission()` (trigger fn, `search_path=public`) | present | absent |
| 2 | Function `public.recent_submission_count()` (SQL, STABLE, **SECURITY DEFINER**) | present | absent |
| 3 | Function `public.touch_updated_at()` (trigger fn) | present | absent |
| 4 | Trigger `spots_pin_community_submission` BEFORE INSERT on `spots` | present | absent |
| 5 | Trigger `spots_touch_updated_at` BEFORE UPDATE on `spots` | present | absent |
| 6 | Indexes `spots_status_idx`, `spots_submitted_by_created_at_idx`, `pending_edits_spot_id_idx`, `reports_spot_id_idx` | present | absent |
| 7 | Policy "signed-in users can propose a new spot as pending, rate-limited" | `WITH CHECK … recent_submission_count() < 10` | inline `count(*)` subquery |
| 8 | `spots` physical column order | `…lng, types, notes, photo, community, edited, created_at, updated_at, country, status, address, submitted_by` | `…state, country, lat, lng, …` (only differs; cosmetic, all clients use names) |
| 9 | `pgcrypto` | schema `extensions` (Supabase default) | `public` (scratch artifact) |
| 10 | Grants | Supabase defaults: `anon`, `authenticated`, `service_role`, `postgres` hold all 8 privileges on all 8 tables, USAGE on schema `public` | none written (defaults supply them) |

Identical: all 8 tables (`spots, pending_edits, reports, moderators, marks, routes, sessions, session_climbs`),
RLS enabled on all 8 (none forced), 27 constraints (PK/FK/check, incl. `spots_status_check`, FKs to `auth.users`),
72 column definitions (type, nullability, default), 25 other policies, no views/enums/sequences/event triggers/publications.

What the live-only pieces do: #1 (trigger) forces every authenticated insert into `spots` to `status='pending'`,
`community=true`, `submitted_by=auth.uid()`, and rewrites any id not matching `community-<uuid>` — so **ids for
imported gyms must be inserted as `service_role`/postgres (no `auth.uid()`), never through a signed-in client**.
#2 avoids RLS recursion in the rate-limit policy; #3/#5 keep `updated_at` current (a re-seed therefore bumps
`updated_at` on every upserted row — all 1,881 rows currently share 2026-09-23 10:07:38 for that reason).

## Other live facts
- Extensions: `plpgsql`, `pgcrypto`, `uuid-ossp`, `pg_stat_statements`, `supabase_vault` (platform defaults; the app needs none of them).
- Storage: 0 buckets, 0 objects. `photo` is a URL text column.
- Roles present: `anon`, `authenticated`, `service_role` (bypass RLS), `authenticator`, `postgres`, `supabase_admin`, …
- Row counts: `spots` 1,881 (all approved, all `seed-*` ids, 0 community, 0 edited), 14 auth users, 1 moderator,
  3 marks (`seed-1`, `seed-16`, `seed-18`, all "climbed" — none touched by the id drift), 0 sessions / climbs /
  routes / pending edits / reports.
- Supabase advisors (`30-advisors.json`, 32 items, none applied): 23× `auth_rls_initplan` (wrap `auth.uid()` in
  `(select …)`), `recent_submission_count` SECURITY DEFINER executable by anon/authenticated via RPC,
  `touch_updated_at` has a mutable search_path, leaked-password protection off, 2 unindexed FKs
  (`marks.spot_id`, `routes.submitted_by`), 3 unused indexes. These are **not** baseline changes — candidates for
  later, separate migrations.

## Risks and ambiguities
- `origin/fix/audit-critical` also contains **app fixes not on master** (XSS, Escape-deletes, offline shell, PWA
  icons; `js/app.js`, `index.html`, `sw.js`, `manifest.json`) whose RLS half is already live. `app.js` no longer
  exists on `refactor/context-hygiene`, so those fixes can't be merged mechanically. Needs its own decision/task.
- Live is the only environment (no staging). All checks so far compare live to scratch builds, not to another remote.
- Policy/grant capture is from the catalog as `postgres`; behaviour under real anon/user/moderator JWTs is verified in Stage 4.

## Proposed next steps
1. **Stage 3 baseline** from live, not from `schema.sql`: `supabase db dump --linked --schema public` (read-only
   pg_dump in Docker), hand-clean to public-schema objects only (tables, constraints, indexes, policies,
   functions, triggers), keep live's column order, `pgcrypto` left to the platform. `supabase init` for `config.toml`.
   Name it `<timestamp>_baseline.sql`; do not merge the advisor fixes into it.
2. **Stage 4**: `supabase start`, build from the migration, run `compare-schema.js` against `live-2026-09-24`
   (expect zero differences) and test RLS as anon / user / moderator.
3. **Only after your explicit go-ahead**: `supabase migration repair --status applied <baseline>` to record the
   baseline in live's history (creates the `supabase_migrations` schema/rows — the first intentional production write).
4. Decide the fate of `origin/fix/audit-critical` (merge its app fixes separately) and update `schema.sql` handling
   (Stage 7: retire or relabel it).
