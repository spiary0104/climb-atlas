# Tasks — open items only

Full history is in `docs/archive/tasks.md` (archived, do not read; git log
is the changelog). The ~60 "In Progress" entries there were stale — their
work is merged and live on climbatlas.org — so none carried over.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
- _(none)_

## Backlog

### UK + chain expansions (boulderingwall.com follow-up)
- Status: backlog
- What: ~30 more UK single-gym towns; chain branches: Camp5 MY (~6),
  Hive CA (~4), Boulderwelt DE (~4), B-PUMP JP (~3), 9 Degrees AU (~2),
  Boulder Co NZ (~1). Verify each branch individually.
- Notes: climbingbusinessjournal.com/map is not usable (paywalled).

### Fill missing addresses (299 spots)
- Status: backlog (found in the data during the refactor, not in old tasks.md)
- What: `address` empty for DE 112, GB 82, CN 54, NO 20, CO 5, IL 3,
  US 3, VE 3, others ≤2. Query: `jq '[.[]|select((.address//"")=="")]' data/gyms.json`.

### Monetization: paid "offline mode" (Stripe)
- Status: backlog — needs scoping with the user first
- What: gate the existing PWA caching behind a subscription. Needs Stripe
  checkout, a webhook (Supabase Edge Function — confirm that's OK given
  the no-build-tooling rule), a subscriptions table + RLS.
- Open questions: what exactly is gated; free-tier cap; price.

### Redesign follow-ups (optional)
- Human check on a real phone + wide monitor (globe framing, drawer
  transitions were only verified numerically).
- If touch users miss row actions: faint background on `.row-action`
  under `@media (hover:none)`.
- List virtualisation only if the dataset roughly doubles.
- Legal copy review: Privacy/Terms are still plain-language drafts.

## Blocked
- _(none)_
