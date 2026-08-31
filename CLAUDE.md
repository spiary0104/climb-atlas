# Climb Atlas — Project Instructions

@Rules.md

This file is read by every Claude Code session opened anywhere inside this
repository — the main session, any `git worktree` session, and any
subagent — because it lives at the project root and worktrees are just
separate checkouts of the same repo. Keep it accurate; it's the shared
brief for everyone working on this project, human or not.

## Project Overview

Climb Atlas is a community-sourced map of bouldering/climbing spots
(indoor gyms + outdoor areas) across Australia and the US, modelled on
Track Atlas.

**Stack: plain static site. No build step, no framework, no package.json.**
Backend is [Supabase](https://supabase.com) (Postgres + Auth). Do not
introduce npm/build tooling, a framework, or a bundler without discussing
it first — the whole point of the current architecture is that it's a
handful of files you can open directly in a browser.

Full setup and architecture are documented in `README.md` and
`docs/architecture.md` — read both before touching `js/app.js`.

Before modifying code:
1. Inspect the relevant existing implementation (`js/app.js`, `js/data.js`,
   `js/auth.js`, `js/supabase-init.js`, `css/style.css`, `supabase/schema.sql`).
2. Understand the architecture (`docs/architecture.md`).
3. Identify dependencies — script load order in `index.html` matters:
   Supabase CDN → `supabase-init.js` → `auth.js` → `data.js` → `app.js`.
4. State the intended approach.
5. Implement the smallest correct change.

## Important Commands

There is no install step and no build step. This is a static site.

Run it locally:
```
python3 -m http.server 8000
```
or
```
npx serve .
```
Then open `http://localhost:8000`. (Serving over HTTP, not opening the
file directly, matters once Supabase Auth redirect URLs are involved —
see README "Setup".)

There is currently no automated test suite and no linter configured for
this project. Verification is manual: run the app in a browser, exercise
the feature, and check the browser console for errors (see Rules.md §6
and §7 — Verify Everything / Full Smoke Test — for the exact procedure).
If you add tooling (a linter, a test runner) later, update this section
and `Rules.md` §6 to name the actual commands — do not leave this section
stale.

Database changes go through `supabase/schema.sql` (run once in the
Supabase SQL Editor; safe to re-run — see README). Seed data lives in
`js/data.js` and loads via `supabase/seed.html`.

## Architecture

See:
@docs/architecture.md

## Current Development State

See:
@docs/tasks.md

## Role: Brain vs. Worker Sessions

This repo is worked on using a **brain + worker** pattern (see
`WORKFLOW_GUIDE.md` at the repo root for the full setup). In short:

- **The brain session** is the main Claude Code session in the primary
  checkout (not a worktree). It runs on **Opus**. Its job is to read
  `docs/tasks.md`, break work into single, focused tasks, and either
  (a) dispatch a task to a `worker` subagent defined in
  `.claude/agents/worker.md` (which runs on Sonnet, isolated in its own
  git worktree), or (b) hand the user a copy-pasteable technical brief for
  a manually-opened worker terminal (`claude --worktree <task-name>`).
  Every dispatch — subagent or manual brief — must be a clear, scoped,
  technical brief: objective, relevant files, constraints, and the
  verification steps the worker must run before reporting done.
- **Worker sessions** run on **Sonnet** (set explicitly — see
  `WORKFLOW_GUIDE.md`). Each worker owns exactly one task in its own git
  worktree/branch, follows `Rules.md` in full, and reports back using the
  Completion Report format (Rules.md §15) before its branch is merged.
- **One task = one chat.** Do not accumulate unrelated work in a single
  session. See `Rules.md` §16–17 for the model-assignment and
  context-budget rules this implies.

If you are a worker session reading this file: you are not the brain.
Do the one task you were briefed on, verify it per Rules.md, write your
completion report, and stop — do not pick up additional unrelated work in
the same session.
