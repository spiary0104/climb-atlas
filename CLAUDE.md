# Bouldeer — Project Instructions

@Rules.md

Read by every Claude Code session in this repo (main, worktrees,
subagents). Keep it accurate and short.

## Context hygiene (read first)

- **Never read `data/` or `docs/archive/`.** Query the seed data with
  `jq` or `grep` only (examples in `docs/ARCHITECTURE.md`).
- **Files over 30 KB: use `grep`, `head`, or line ranges only — never read
  them in full.** Currently over 30 KB: `index.html`,
  `data/gyms.json`, `js/modules/regions.js`, `docs/DESIGN.md`, `docs/import-workflow.md`, `docs/research/*/*.json`, everything in `docs/archive/`. Check with `wc -c` if unsure.
- Start from `docs/ARCHITECTURE.md` (file map, data flow, key functions
  with file:line) and `docs/TASKS.md` (open work). Both are short; keep
  them that way (≤150 and ≤60 lines).

## Project overview

Bouldeer: a community-sourced map of climbing gyms worldwide (~2,100 spots, 80+
countries). Live at www.bouldeer.com (formerly climbatlas.org; repo name climb-atlas). **UI work follows
`docs/DESIGN.md`** (tokens only, no raw colours; see ARCHITECTURE "Design system").

**Stack: plain static site. No build step, no framework, no package.json.**
Backend is Supabase (Postgres + Auth + RLS). Do not introduce npm/build
tooling, a framework, or a bundler without discussing it first.

## File map

```
index.html              App shell (no inline JS/CSS)                 (>30 KB)
about.html, privacy.html, terms.html, 404.html   Standalone static pages (root-absolute assets)
css/tokens.css          Design tokens (only file with raw values; deer palette: fawn, bark); design/tokens.json generated from it
css/base.css            Reset, type scale, focus
css/components.css      Shared components (.btn tiers, chips, fields, nav, dialogs, ...)
css/explore.css         Explore: list pane/sheet, rows/cards, chips, search, pins, peek card
css/page.css            Pages (gym, region/city, log, me)
css/style.css           App layer (shell, map controls, forms, sessions); css/mod.css = /mod; css/passport.css = stamps, passport, sheets
assets/icons.svg        Phosphor sprite; js/modules/icons.js icon(name)
assets/boulder.svg      Photo placeholder (contour.svg: passport only)
assets/mascot/, assets/brand/, icons/  Deer head, stamp head, first-run poses; antler crest, seals; app icon, favicon
design/mascot/deer/     The owner's deer renders: source of the character (DESIGN.md sec. 1A, 12)
design/tools/           Dev-only Python: mascot tracer + seal generator (not part of the app; README)
js/supabase-init.js     window.sb (classic script)
js/auth.js              window.auth (classic script)
js/main.js              Entry ES module: init*() in order, then boot
js/sw-register.js       Service-worker registration
js/modules/state.js     appState — ALL shared mutable state
js/modules/constants.js Labels, fly targets, zoom thresholds, LIST_CAP
js/modules/regions.js   STATES_BY_COUNTRY (static)
js/modules/utils.js     escapeHtml, directionsUrl, showToast
js/modules/explore.js   Explore controller: render(), selection, peek, URL state, landing
js/modules/map.js       Map, clusters, pins, label tiers (handlers from explore.js)
js/modules/list.js      Viewport-scoped list, sort, cap, empty states, carousel
js/modules/filters.js   Chips, All filters sheet, filter predicate
js/modules/search.js    Search combobox (+ search-index.js, pure)
js/modules/sheet.js     Mobile bottom sheet snaps
js/modules/marks.js     Climbed/saved toggles
js/modules/*-html.js, geo.js  Pure builders/helpers (unit-tested)
js/modules/router.js    History API router; views render into <main id="view">
js/modules/*-page.js    Page views: gym, region, log, me, mod, add, passport (+ page-html.js, moderation-html.js, add-html.js, slug.js, mini-map.js)
js/modules/nav.js       Top bar / tab bar ([data-nav])
js/modules/modals.js    Focus/Escape, edit/report forms, info modals (adding a gym is the /add page)
js/modules/auth-ui.js   Sign-in widget + modal
js/modules/data-load.js Spots/marks/moderator/pending loading + seed fallback
js/modules/logbook.js   Logbook + "Log a session" (+ gym-picker.js, pure: gym search / continent browse)
js/modules/moderation.js Moderator actions for /mod and the gym page verify control
js/modules/community.js Provenance/contribution reads (+ provenance.js, pure: states, levels)
js/modules/checkin.js   Check-in flow + START sheet (+ passport.js/stamp-html.js pure, passport-page.js, milestone-sheet.js, share-card.js)
data/gyms.json          LEGACY seed dataset; app offline fallback + provenance input — NEVER read or edit
data/gyms.reconciled.json FROZEN reconciliation/provenance dataset (= production at first import); not a runtime file
import/                 Import pipeline: index/ (match index), batches/ (staging), research/ (regional sections)
scripts/gym-import.js   Import CLI (+ scripts/lib/gym-import/); docs/import-workflow.md
supabase/schema.sql     Tables + RLS; re-runnable in the SQL Editor
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
Tests: `node --test "tests/*.test.js"` (no linter). Browser verification is still required — Rules.md §6–7.
Schema changes go through `supabase/migrations/` (docs/migrations.md).
**New gyms go through the import pipeline only** — `docs/import-workflow.md`; new locations one geographic section at a time
(`research new|reconcile|stage`, then `validate|plan`; tests:
`node --test "tests/*.test.js"`). Never add/edit gyms in `data/gyms.json` or generate seed SQL
(the old `supabase/seed.html` was removed; ids in gyms.json are stale) or edit `spots` by hand. Never read
`import/index/`, old batches' `records.ndjson` or other sections' `candidates.ndjson`; read `report.md` / `reconcile.md`.

## Brain vs. worker sessions

See `WORKFLOW_GUIDE.md`. The **brain** (main checkout, Opus) reads
`docs/TASKS.md`, splits work into single tasks, and dispatches each to a
`worker` subagent (`.claude/agents/worker.md`, Sonnet, own worktree) or
hands the user a copy-pasteable brief for `claude --worktree <task>`.
Every brief: objective, files, constraints, verification steps.
**Workers** own one task, follow `Rules.md`, report with the Completion
Report format (Rules.md §15), then stop. One task = one chat.
