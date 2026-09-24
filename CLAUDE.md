# Climb Atlas — Project Instructions

@Rules.md

Read by every Claude Code session in this repo (main, worktrees,
subagents). Keep it accurate and short.

## Context hygiene (read first)

- **Never read `data/` or `docs/archive/`.** Query the seed data with
  `jq` or `grep` only (examples in `docs/ARCHITECTURE.md`).
- **Files over 30 KB: use `grep`, `head`, or line ranges only — never read
  them in full.** Currently over 30 KB: `index.html`, `css/style.css`,
  `data/gyms.json`, `js/modules/regions.js`, everything in `docs/archive/`. Check with `wc -c` if unsure.
- Start from `docs/ARCHITECTURE.md` (file map, data flow, key functions
  with file:line) and `docs/TASKS.md` (open work). Both are short; keep
  them that way (≤150 and ≤60 lines).

## Project overview

Community-sourced map of climbing gyms worldwide (~1,900 spots, 80+
countries), modelled on Track Atlas. Live at climbatlas.org.

**Stack: plain static site. No build step, no framework, no package.json.**
Backend is Supabase (Postgres + Auth + RLS). Do not introduce npm/build
tooling, a framework, or a bundler without discussing it first.

## File map

```
index.html              App shell (no inline JS/CSS)
about.html              Standalone About page
css/style.css           All styles; tokens on :root              (>30 KB)
css/chips.css           Per-region chip colours (generated)
js/supabase-init.js     window.sb (classic script)
js/auth.js              window.auth (classic script)
js/main.js              Entry ES module: init*() in order, then boot
js/sw-register.js       Service-worker registration
js/modules/state.js     appState — ALL shared mutable state
js/modules/constants.js Colours, labels, fly targets, zoom thresholds
js/modules/regions.js   STATES_BY_COUNTRY (static)
js/modules/utils.js     escapeHtml, directionsUrl, typeSwatch, showToast
js/modules/map.js       Map, clusters, labels, markers, popups, legend
js/modules/sidebar.js   render(), filters, search, nav, marks
js/modules/modals.js    Focus/Escape, add/edit/report forms, info modals
js/modules/auth-ui.js   Sign-in widget + modal
js/modules/data-load.js Spots/marks/moderator/pending loading + seed fallback
js/modules/logbook.js   Logbook
js/modules/moderation.js Pending-review panel
data/gyms.json          LEGACY seed dataset / offline fallback — NEVER read or edit
import/                 Import pipeline: index/ (match index), batches/ (staging)
scripts/gym-import.js   Import CLI (+ scripts/lib/gym-import/); docs/import-workflow.md
supabase/schema.sql     Tables + RLS; re-runnable in the SQL Editor
supabase/seed.html      Builds upsert SQL from data/gyms.json
supabase/geocode.html   Pin-position checker for seed spots
sw.js                   Service worker — add new JS/CSS to SHELL_FILES, bump CACHE_VERSION
docs/ARCHITECTURE.md    Architecture, short form (data flow, file:line)
docs/TASKS.md           Open tasks only
docs/archive/           Old long-form docs — NEVER read
```

Load order in `index.html`: MapLibre → Supercluster → Supabase CDN →
`supabase-init.js` → `auth.js` → `main.js` (module) → `sw-register.js`.
Keep every module under 800 lines; write shared state only via `appState`.

## Before modifying code
1. Find the relevant code via `docs/ARCHITECTURE.md` + `grep -n`.
2. Read only the line ranges you need.
3. State the approach, make the smallest correct change.

## Commands

No install, no build. Serve over HTTP (required: ES modules, fetch, Auth redirects):
```
python3 -m http.server 8000     # or: npx serve .
```
No test suite or linter yet. Verification is manual — Rules.md §6–7.
Schema changes go through `supabase/migrations/` (docs/migrations.md).
**New gyms go through the import pipeline only** — `docs/import-workflow.md`
(`node scripts/gym-import.js new-batch|validate|plan|freeze-ids`; tests:
`node --test "tests/*.test.js"`). Never add/edit gyms in `data/gyms.json`, never run
`supabase/seed.html` (legacy, ids are stale) or edit `spots` by hand. Never read
`import/index/` or old batches' `records.ndjson`; read a batch's `report.md`.

## Brain vs. worker sessions

See `WORKFLOW_GUIDE.md`. The **brain** (main checkout, Opus) reads
`docs/TASKS.md`, splits work into single tasks, and dispatches each to a
`worker` subagent (`.claude/agents/worker.md`, Sonnet, own worktree) or
hands the user a copy-pasteable brief for `claude --worktree <task>`.
Every brief: objective, files, constraints, verification steps.
**Workers** own one task, follow `Rules.md`, report with the Completion
Report format (Rules.md §15), then stop. One task = one chat.
