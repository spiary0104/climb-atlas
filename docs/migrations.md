# Database migrations (Supabase CLI)

`supabase/migrations/` is the source of truth for the schema. `supabase/schema.sql` is **stale** (it predates the
hardening that is live) and is kept only until it is retired; do not edit it and do not treat it as canonical.

## Baseline
`supabase/migrations/20260924000000_baseline_live_schema.sql` reproduces the live production schema of
2026-09-24 exactly (verified: `scripts/compare-schema.js` reports no differences between live and a database built
only from this file; 52/52 RLS checks pass — see `docs/schema-introspection-2026-09-24.md`). Production already
contains it, so it is **recorded as applied, never executed there**. Never edit it.

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

## Recording the baseline on production (NOT yet run — needs explicit approval)
This is the first intentional production write: it creates the `supabase_migrations` schema and one history row,
and nothing else (no schema or data change).
```
supabase migration repair 20260924000000 --status applied --linked
```
Afterwards `supabase migration list --linked` should show local and remote both at `20260924000000`, and
`supabase db push --linked --dry-run` should report nothing to apply.

## Tools
- `scripts/introspect-schema.js <live|local|scratch> <dir>` — read-only catalog capture (live queries run inside `BEGIN READ ONLY`).
- `scripts/compare-schema.js <live-dir> <other-dir>` — diff two captures (public schema).
- `scripts/test-rls-local.js` — RLS/trigger behaviour as anon / user / moderator, against the local stack only.
