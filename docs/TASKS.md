# Tasks — open items only

Full history is in `docs/archive/tasks.md` (archived, do not read; git log
is the changelog). The ~60 "In Progress" entries there were stale — their
work is merged and live on climbatlas.org — so none carried over.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
### Gym import pipeline — first batch imported; follow-ups
- Status: pipeline + gated importer built and tested. Batch `import/batches/2026-09-24-reconciled-new-gyms`
  (246 gyms) IMPORTED to production 2026-09-24, verified (approved 1,881 → 2,127; `manifest.json`).
- Match index rebuilt from production (2,127 gyms); `scripts/validate-reconciled.js` handles pre- and post-import states.
- Open: retire data/gyms.json (runtime fallback + "Revert to original" use stale ids; plan in docs/import-workflow.md). seed.html removed.

## Backlog

### Native-language gym pass — follow-ups (Sep 2026)
- Status: backlog. Round 1: 120 gyms (seed-1903..2022). Round 2: 112 (seed-2023..2134; JP 26 Tokyo-area,
  FR 34, DE 32, ES 16, IT 4). Ids were shifted +36 when merged after master's Korea passes took
  seed-1867..1902; 2 gyms skipped as duplicates of those (Nobo Climbing = Norbo Climbing, Parks
  Climbing = Pax Climbing Center), so 230 of the 232 were added. Round 2 used chain store lists + climbing-net/rocodromos/DAV pages.
- Closed but still seeded (delete in gyms.json AND Supabase; upserts won't remove):
  Gravity Research Sapporo (closed 14 Apr 2025), T-WALL Ookayama (not on any current store list).
- Pins to eyeball in supabase/geocode.html: notes with "street-level" or "district-level".
- Next candidates: Climb Up (Brest, Angers, Lesquin, Villeneuve d'Ascq, Mulhouse, Dijon, Orléans, Le Mans,
  Aix x2, Istres, Nîmes…), ~20 more Bloc Session sites, MurMur/Antrebloc/Le Pan; Sputnik Asturias
  (opens 25 Sep 2026); Italian gyms whose sites time out (Torino, Bologna, Palermo, Napoli); DE:
  Thüringen/Sachsen-Anhalt/Saarland, urban apes & Der Kegel (Berlin); KR: Gwangju, Jeollanam.

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
