# Development Rules

## 1. Never Guess

Do not infer technical facts when they can be measured, inspected,
tested or verified.

Before making claims about the project:
- inspect the relevant files
- inspect the actual implementation
- run the relevant command
- measure the result where possible
- verify assumptions against documentation

Never claim something works merely because the implementation appears correct.

---

## 2. Git Is Mandatory

Git must be used for all development work.

Before beginning a task:
- check git status
- identify the current branch
- inspect recent commits
- confirm the working tree state

Every meaningful completed change must be committed, and pushed to GitHub
promptly (see §16a) — don't let commits sit local-only for long.
Never destroy or overwrite existing work without first understanding it.

---

## 3. One Task = One Branch

Every independent task must use its own Git branch.

Use descriptive branch names:
```
feature/contact-form
feature/mobile-navigation
fix/header-overflow
fix/form-validation
```

Do not mix unrelated tasks in one branch.

---

## 4. Use Worktrees

Independent parallel tasks must use separate Git worktrees.
Never have multiple workers modifying the same working directory simultaneously.

In practice: start each task with `claude --worktree <task-name>` (or ask
Claude mid-session to move into a worktree). This creates an isolated
checkout under `.claude/worktrees/<task-name>/` on its own branch and
actively blocks that session from writing outside it — see
`WORKFLOW_GUIDE.md` for the full command reference. A worktree is a fresh
checkout with nothing installed beyond what's tracked in git; since this
project has no install step that's rarely an issue here, but re-check
`js/supabase-init.js` exists with real credentials in any new worktree
before relying on it against a live Supabase project.

---

## 5. Inspect Before Editing

Before modifying code:
1. Find the relevant files.
2. Read the relevant implementation.
3. Understand dependencies.
4. Check existing tests.
5. Determine the smallest safe change.
6. Only then modify the code.

---

## 6. Verify Everything

After implementation:
1. Run relevant unit tests (none exist yet for this project — see
   `CLAUDE.md` "Important Commands"; if you add a test runner, name the
   actual command here).
2. Run linting (same caveat — none configured yet).
3. Run type checking where applicable (not applicable — plain JS).
4. Serve the site (`python3 -m http.server 8000` or `npx serve .`).
5. Run the application in a browser.
6. Test the affected functionality.
7. Perform a smoke test from the user's perspective (§7).

Do not report success until verification has actually been performed.

---

## 7. Full Smoke Test

For application-level changes, perform a complete smoke test from
start to finish.

Example:
```
Open application
→ navigate to relevant page
→ perform primary action
→ submit/input data
→ verify expected result
→ verify error handling
→ verify mobile behaviour
→ verify desktop behaviour
→ verify no console/runtime errors
```

For this project specifically, also check: the map loads and renders
markers, filters (country/state/type/marks) work, sign-in (magic link and
Google) still redirects correctly, and adding/editing a spot still lands
in `pending` / `pending_edits` as expected (see README "Moderation").

This is mandatory before declaring the feature complete.

---

## 8. Audit When Something Fails

If the user reports that something does not work:

Do not simply patch the reported symptom.

Perform an audit from multiple perspectives:
- implementation
- UI
- data flow
- state management
- browser/runtime behaviour
- responsive behaviour
- error handling
- dependencies
- build configuration
- network/API behaviour (Supabase calls, RLS policies, CDN scripts)

Explain what was checked and what was found. This is also the correct
response when the user says "I don't believe you that this works" —
re-audit from these angles rather than repeating the original claim.

---

## 9. Research Instead of Guessing

If uncertain about:
- an API
- framework behaviour
- library behaviour (Supabase, MapLibre GL, Supercluster)
- browser behaviour
- configuration
- security implications (especially Supabase RLS policies — see
  `supabase/schema.sql`)
- current best practice

research the issue before implementing it.

Prefer primary/trusted sources such as:
- official documentation (supabase.com/docs, maplibre.org/maplibre-gl-js/docs,
  docs.claude.com / code.claude.com for anything about Claude Code itself)
- official GitHub repositories
- standards documentation
- vendor documentation

Do not invent APIs or configuration options.

If a single research pass doesn't resolve it, or you (Claude) say you
can't do something, don't know, or propose a path the user doesn't want:
run multiple independent research passes and cross-check them before
answering — e.g. dispatch two or three parallel subagents to research the
same question from different angles or sources and compare their
findings, still restricted to trusted sources above. See
`WORKFLOW_GUIDE.md` §8 for how to do this in Claude Code specifically.

---

## 10. Persistent Knowledge

Do not rely on conversation memory for important project information.

Important decisions, architecture changes, requirements and discoveries
must be written into the appropriate project document (`docs/architecture.md`
for how the system works, `docs/tasks.md` for what's being worked on and
what was decided about it).

After writing persistent information, report the exact file path.

If you are asked to "remember" something, this is the only acceptable way
to comply — write it to the relevant doc and report the path. Do not
just say "I'll remember that."

---

## 11. Keep Tasks Focused

A task should have:
- one objective
- clear acceptance criteria
- a defined scope
- a verification procedure

If a task becomes too large, stop and propose splitting it.

---

## 12. Do Not Pretend

Never say:
```
"Everything works."
```
unless you actually tested it.

Instead report:
- what was tested
- how it was tested
- what passed
- what failed
- what remains uncertain

---

## 13. Preserve Existing Functionality

Before changing existing functionality:
- identify current behaviour
- identify dependencies
- avoid unnecessary refactoring
- verify that unrelated functionality still works

---

## 14. User-Facing Quality

For UI work, verify:
- desktop layout
- mobile layout
- tablet/intermediate widths where relevant
- keyboard interaction
- accessibility
- loading states
- empty states
- error states
- visual consistency
- browser console errors

---

## 15. Completion Report

When completing a task, report:
1. What changed
2. Files changed
3. Tests performed
4. Smoke test performed
5. Git commit (and whether it was pushed)
6. Remaining issues
7. Any assumptions made

---

## 16. Model Assignment — Brain and Workers

This project uses a brain/worker session pattern (`WORKFLOW_GUIDE.md`).

- The brain session (main planning session, not in a worktree) runs on
  **Opus**.
- Every worker session (a task in its own worktree, whether a manual
  `claude --worktree` terminal or a dispatched `.claude/agents/worker.md`
  subagent) runs on **Sonnet**, set explicitly — never assume it inherited
  the right model, check it (`/model` with no argument shows the picker
  with the current selection highlighted; a dispatched subagent shows its
  model in its own header).
- The brain must give every worker a clear, self-contained technical
  brief before dispatch: objective, relevant files, constraints, and the
  exact verification steps from Rules.md §6–7 the worker must run before
  reporting done. A worker should never have to guess what "done" means.
- The brain is responsible for confirming a worker actually ran on Sonnet,
  not Opus — if cost/model discipline matters to you, check this, don't
  assume it.

---

## 17. Context Budget and Session Boundaries

Keep each session focused and under roughly **500,000 tokens** of context.
Past that point, quality degrades — do not rely on `/compact` or
auto-compact to paper over an overlong session; compaction summarizes and
loses fidelity (exact tool outputs and intermediate reasoning are
discarded, only a summary survives). Treat compaction as a safety net for
an accident, not a normal part of the workflow.

- Check usage periodically with `/context`.
- One task = one chat. When a task is done, its session ends — start the
  next task in a new session (new worktree or a fresh `claude` invocation),
  not by continuing to pile work into the same context.
- If you genuinely need a hard stop instead of a graceful summary, auto-compact
  can be disabled per-session or project-wide (`autoCompactEnabled: false`
  in `.claude/settings.json`, or `DISABLE_AUTO_COMPACT=1`) — with it off,
  hitting the true context limit forces `/clear` (full reset) rather than
  a silent summarize-and-continue. Make sure anything that matters is
  already written to `docs/tasks.md` (§10) before that point, since a
  `/clear` does not carry it forward automatically.

---

## 18. Escalating When Something Feels Off

If you (the user) get the sense Claude is doing something wrong but can't
articulate exactly what — don't try to force it out in the same session,
where the existing context may bias the answer.

Open a separate, unrelated Claude Code session (run `claude` from a
different directory, outside this repo, so this project's `CLAUDE.md`
isn't even loaded) and describe, in plain terms, what the worker session
is doing and what feels wrong about it. Bring the answer back rather than
letting this session's context get polluted with the back-and-forth.

---

## 19. Do Not Fabricate Progress or Memory

Claude does not reliably retain instructions across sessions purely "in
memory." Any request to remember, track, or not-forget something is only
satisfied by writing it to `docs/tasks.md` or `docs/architecture.md` and
reporting the exact path (§10) — never by a bare acknowledgement.
Likewise, never report a task, test, or smoke test as done without having
actually run it in this session (§12).
