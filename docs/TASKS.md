# Tasks — open items only

Full history: `docs/archive/tasks.md` (archived, do not read); git log is the changelog.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
### Bouldeer redesign (docs/DESIGN.md sec. 17)
- Status: Phases 0-5 + Brand Pass complete on `feature/bouldeer-brand-pass` (the earlier phase branches are stacked in it);
  the release is its pull request into `master` (Vercel deploys climbatlas.org from `master`).
- Production migrations applied 2026-09-29 (all four recorded; slugs, provenance RPCs, `profiles`, `checkins` live and
  verified read-only; backups outside the repo). See docs/migrations.md.
- Open: Lighthouse a11y >= 95 not measured; real-phone retest of the 2026-09-29 fixes (eyes, Date/Mood) and check-in on
  production; Supabase Auth Redirect URLs: add preview domains (else sign-in lands on the Site URL); Explore first-run art unbuilt (7.10); Privacy Policy predates display names/check-ins/logbook (owner to update);
  START and the Log tab both read "Log" (sec. 6.5); lake/plum colours provisional (sec. 19.1). Decisions: DESIGN.md log.
  Phase 4 not built (minimal schema, owner): publish-then-review for hours/price/links, website field, photo/confirm points.
### Gym import pipeline — first batch imported; follow-ups
- Status: pipeline + gated importer built and tested. Batch `import/batches/2026-09-24-reconciled-new-gyms`
  (246 gyms) IMPORTED 2026-09-24, verified (1,881 → 2,127; `manifest.json`); index rebuilt and still equal to production (2026-09-29).
- Open: retire data/gyms.json (runtime fallback + "Revert to original" use stale ids; plan in docs/import-workflow.md). seed.html removed.
- Location data (dry run 2026-09-29, nothing applied): 11 OSM-validated updates approved (pins; 6 addresses). Importer location updates
  built on `feature/importer-location-updates` (updater.js); next: stage the 11 as a batch, dry-run, apply. 4 manual review; seed-1139 pin; 489.

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

## Blocked
- _(none)_
