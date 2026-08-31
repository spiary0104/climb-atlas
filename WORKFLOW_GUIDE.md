# Climb Atlas — Claude Code Workflow Guide

This sets up the workflow you described: Git + GitHub pushed constantly,
worktrees for parallel work, one-task-one-chat kept under a token budget,
a brain session (Opus) directing worker sessions (Sonnet), audits instead
of blind trust, research instead of guessing, and everything durable
written to disk instead of relied on from memory.

Everything below is checked against Anthropic's current official Claude
Code docs (`code.claude.com/docs` — `docs.claude.com` now redirects
there) as of this writing. Where something you asked for doesn't map to a
real Claude Code feature, that's called out explicitly rather than
invented — see **§0**.

---

## §0. Reality check — what's native vs. what's manual

Before the steps, three honest clarifications so the rest of this doesn't
overpromise:

1. **Worktrees are a real, native Claude Code feature.** `claude
   --worktree <name>` creates an isolated git checkout and starts a
   session in it — this is exactly what you asked for, not a workaround.
2. **There is no built-in way for one Claude Code session to type into
   another session's terminal.** Separate `claude` processes (separate
   terminal windows) don't message each other. What you described —
   "create the chats, name them, leave them empty until the brain chat
   writes into them" — is doable two ways, and this guide sets up both:
   - **Subagents** (`.claude/agents/worker.md`, already created for you):
     the brain session dispatches a task to a named, pre-defined worker
     with its own model and its own worktree, in one command. This is the
     closest real match to "pre-created, named, waits for a task."
   - **Manual worker terminals**: you open a second terminal yourself and
     run `claude --worktree <name>`, then paste in the brief the brain
     session wrote for you. This is better when you want to watch the
     worker live, or it needs to run a long dev server. The copy-paste
     step is manual — there's no way around that with separate processes.
3. **"Ultracode" and Cowork-style multi-agent workflows are a feature of
   Claude apps like this one (Cowork), not of the Claude Code CLI.**
   The CLI equivalent — and what's set up in §8 below — is asking a
   Claude Code session to dispatch several parallel research subagents at
   the same question and cross-check their answers. Real feature, just a
   different mechanism than what you may have seen in Cowork.

---

## §1. One-time setup

Run these once. Everything here assumes a terminal open at
`C:\Users\Spiar\Downloads\boulder-atlas-project`.

### 1a. Confirm git state (Rules.md §2 — do this before anything else)

```
git status
git branch --show-current
git log --oneline -10
```

Climb Atlas already has a git history, so this should show your current
branch and recent commits. If `git status` shows uncommitted changes you
don't recognize, stop and inspect before continuing — don't build on top
of an unknown working-tree state.

### 1b. GitHub — connect and enable "push right away"

You said GitHub isn't set up yet. From the same terminal:

```
gh auth login
```

Follow the prompts (browser-based login is easiest). Then, from inside
the project folder:

```
gh repo create boulder-atlas-project --source=. --private --remote=origin
git push -u origin <your-current-branch>
```

Use `--public` instead of `--private` if you want it public. If you'd
rather create the repo on github.com first, use
`git remote add origin <url>` instead of `gh repo create`.

From here on, "push everything right away" is a **discipline**, not a
setting — Claude Code doesn't auto-push on every change. Rules.md §2 now
says to push promptly after every meaningful commit; the brain and every
worker are expected to follow it. The permission allowlist in
`.claude/settings.json` (already created for you — see §1d) pre-approves
common git/gh commands so you're not stuck re-approving `git push` every
single time, while still blocking force-push, `reset --hard`, and
`clean -fd` outright.

### 1c. Place the project docs correctly

Claude Code looks for `CLAUDE.md` and `Rules.md` **at the repository
root** (or `.claude/CLAUDE.md`) — not `CLAUDE.md.md`, not
`imports/Rules.md.md`. The two stray files currently in your project
(`CLAUDE.md.md` and `imports/Rules.md.md`) are earlier drafts that Claude
Code will never actually load, and their npm-based commands don't apply
to this static-site project anyway.

**Delete both** (I can't delete files on your machine directly, so this
one's on you):
- `CLAUDE.md.md`
- `imports/Rules.md.md` (and the `imports/` folder if it's now empty)

The corrected replacements — `CLAUDE.md`, `Rules.md`, `docs/architecture.md`,
`docs/tasks.md`, `.claude/agents/worker.md`, `.claude/settings.json`,
`.gitignore`, and this file — are being delivered to your project root
and `docs/`/`.claude/` subfolders alongside this guide.

### 1d. Review what was set up for you

- **`.claude/settings.json`** — sets the project default model to
  `opus` (so the main/brain session defaults to Opus), turns
  **off auto-compact** (matching what you said about compact/auto-compact
  — see §7 for the tradeoff this implies), and pre-approves common
  git/gh commands while explicitly denying force-push, `reset --hard`,
  and `clean -fd`.
- **`.claude/agents/worker.md`** — the reusable worker subagent
  definition: runs on `sonnet`, isolated in its own worktree,
  `acceptEdits` permission mode (auto-accepts file edits, still governed
  by the settings.json allow/deny list for shell commands).
- **`.gitignore`** — added `.claude/worktrees/` (Anthropic's own
  recommendation, so worktree contents don't show up as untracked files
  in your main checkout) and `.claude/settings.local.json` (for any
  personal overrides you don't want committed), plus basic OS/editor
  cruft.

Commit all of this once you've deleted the two stray files:

```
git add CLAUDE.md Rules.md docs/ .claude/ .gitignore WORKFLOW_GUIDE.md
git commit -m "Set up Claude Code workflow: worktrees, brain/worker model routing, project docs"
git push
```

---

## §2. Daily workflow — starting the brain session

Open a terminal at the project root (**not** inside a worktree) and
start Claude Code:

```
claude
```

Because `.claude/settings.json` sets `"model": "opus"`, this session
starts on Opus already — the brain. Confirm with `/model` (no argument)
if you want to double check; it shows the current selection.

The brain's job each session:
1. Read `docs/tasks.md` for current state.
2. Break the next piece of work into one focused task with clear
   acceptance criteria (Rules.md §11).
3. Dispatch it — pick one of the two methods below.
4. Update `docs/tasks.md` (move the task to "In Progress" with its branch
   name) before moving on.

Do not have the brain session also do the implementation work itself in
the main checkout — that defeats the worktree isolation. The brain plans
and dispatches; workers implement.

### Dispatch method A — subagent (automatic worktree + model)

Just ask the brain session, in plain language, to hand the task to the
worker subagent — e.g.:

> "Dispatch this to the worker subagent: fix the mobile layout overflow
> on the filter sidebar (see the bug in `css/style.css` around the
> `.sidebar` rules). Acceptance: no horizontal scroll on a 375px-wide
> viewport, existing desktop layout unchanged."

Claude Code matches this to `.claude/agents/worker.md` (by its
`description`) and runs it as Sonnet, in its own worktree, with your
brief as its task message. You'll see it work; when it finishes it
reports back into the brain session with its Completion Report
(Rules.md §15).

### Dispatch method B — manual worker terminal (for things you want to watch live)

1. In the brain session, ask for a **written technical brief** for the
   task (objective, relevant files, constraints, exact verification
   steps) rather than dispatching it — the brain should hand you text you
   can paste elsewhere.
2. Open a **second terminal**, at the project root, and run:
   ```
   claude --worktree fix-mobile-sidebar --model sonnet
   ```
   (Pick a short, descriptive name instead of `fix-mobile-sidebar`.)
   The `--model sonnet` is not optional to type — a manually-started
   `claude` process reads the same project settings.json as the brain, so
   without this flag it would also default to Opus. This is the one spot
   where "control that workers use Sonnet" (Rules.md §16) requires you to
   actually check, not assume.
3. Paste in the brief from step 1.
4. When it's done and has given you its Completion Report, review it (see
   §6 for merging).

---

## §3. Working inside a worktree

Whichever dispatch method you used, the worker is now isolated at
`.claude/worktrees/<name>/` on its own new branch. While isolated, Claude
Code itself blocks that session from writing to, or running git commands
against, your main checkout — so a worker genuinely cannot clobber the
brain's checkout or another worker's worktree, even by mistake.

This project has no install step, so there's nothing to reinstall per
worktree — the one thing to double-check is that `js/supabase-init.js`
in the new worktree has real Supabase credentials in it (it's a normal
tracked file, so a fresh worktree checkout should already have whatever
is committed — just confirm it's not a placeholder).

List and clean up worktrees at any time:
```
git worktree list
git worktree remove .claude/worktrees/<name>
```
Unnamed, clean interactive worktree sessions actually clean themselves up
automatically on exit; named or dirty ones (uncommitted changes, unpushed
commits) will ask you first.

---

## §4. Verification, audits, and completion reports

This part is already fully specified in `Rules.md` (§5–7, §12, §14–15) —
inspect before editing, verify everything, full smoke test, no
"everything works" without proof, completion report format. Every
worker — subagent or manual — was briefed (via `worker.md` and
`CLAUDE.md`) to follow these exactly. Nothing new to set up here; this
section is just a pointer so you know where it lives.

If something doesn't work after a worker reports success: don't just
re-ask the same worker to patch the symptom. Tell the brain session (or a
fresh session) to run the **multi-perspective audit** in Rules.md §8
(implementation, UI, data flow, state, browser/runtime, responsive,
error handling, dependencies, config, network/Supabase) — that's the
"look at it from different points of view" instruction you wanted turned
into a standing rule, and it now is one.

---

## §5. Merging a finished worker's branch

Once a worker's Completion Report checks out and you've reviewed the
diff:

```
git checkout main
git merge <worker-branch>
git push
```

(Substitute your actual default branch name if it isn't `main` — check
with `git branch --show-current` from step 1a, or `git remote show
origin`.) Then remove the worktree (§3) if it wasn't already
auto-removed, and update `docs/tasks.md` — move the entry from "In
Progress" to "Done (recent)".

---

## §6. One task = one chat, and the ~500K context budget

- Start a new session per task. Don't let the brain session also grind
  through implementation, and don't let a worker pick up a second
  unrelated task after finishing the first — start fresh instead
  (`Rules.md` §17).
- Check usage periodically with `/context` in any session.
- `.claude/settings.json` already sets `"autoCompactEnabled": false`, per
  what you said about not wanting the model to silently summarize and
  keep going. **The real tradeoff, so it's not a surprise later**: with
  auto-compact off, if a session does hit its true context limit, the
  only documented way forward is `/clear` — a full reset, not a
  graceful summary. That's consistent with "one task, one chat, under
  ~500K" as a discipline: you're meant to end the session well before
  that point, not lean on compaction to extend it. Make sure anything
  that matters is already in `docs/tasks.md` before you're anywhere near
  the limit.
- If you ever want the safety net back: set `"autoCompactEnabled": true`
  in `.claude/settings.json`, or override per-session with
  `/autocompact <size>` (e.g. `/autocompact 500k` sets the threshold
  Claude aims to compact around, if you'd rather have a graceful summary
  at your 500K mark than a hard stop).

---

## §7. Research instead of guessing (and the "Ultracode" equivalent)

`Rules.md` §9 already covers this: trusted sources only, research before
implementing. When a single research pass isn't enough — Claude says it
can't do something, doesn't know, or proposes something you don't want —
ask the session to run **parallel research subagents** on the same
question and compare results, e.g.:

> "I don't want to just take your word for it — spin up 2-3 subagents to
> independently research [X] from official docs only, then compare what
> they find before you answer."

This is a real Claude Code capability (subagents run independently and in
parallel); it's the CLI's equivalent of the multi-agent research you may
be thinking of from other Claude products.

---

## §8. When something feels off and you can't articulate why

`Rules.md` §18: open an unrelated session in a different folder (so this
project's `CLAUDE.md` isn't even loaded) and describe what the worker is
doing and what feels wrong. That keeps this project's sessions from
getting polluted with the back-and-forth, and gives you a genuinely fresh
read on the situation.

---

## §9. Cheat sheet

| Want to... | Command |
|---|---|
| Check git state before starting | `git status && git branch --show-current` |
| Start the brain session | `claude` (from project root; defaults to Opus via settings.json) |
| Start a worktree worker manually | `claude --worktree <name> --model sonnet` |
| Dispatch the worker subagent from the brain | ask in plain language: "dispatch this to the worker subagent: ..." |
| Serve the site locally | `python3 -m http.server 8000` or `npx serve .` |
| Check context usage | `/context` |
| Check/change model | `/model` |
| See token usage & cost | `/usage` (alias `/cost`) |
| Start fresh in the same terminal | `/clear` |
| List worktrees | `git worktree list` |
| Remove a worktree | `git worktree remove .claude/worktrees/<name>` |
| Push everything | `git add -A && git commit -m "..." && git push` |

---

## Sources

Everything about Claude Code's actual capabilities in this guide (git
worktree flag/behavior, CLAUDE.md hierarchy and `@import` syntax,
subagent frontmatter fields, `/model` aliases, `/context`/`/usage`,
compaction behavior and `autoCompactEnabled`/`DISABLE_AUTO_COMPACT`, and
git/GitHub permission handling) was verified against Anthropic's official
docs at `code.claude.com/docs` (the current canonical location —
`docs.claude.com` now redirects there) during setup. If a future Claude
Code version changes any of this, treat the live docs as authoritative
over this file, and update this file to match (`Rules.md` §10).
