# Tasks — open items only

Full history: `docs/archive/tasks.md` (archived, do not read); git log is the changelog.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
### Post-launch polish sprint (2026-10-03) — PRs open, nothing merged or applied
- PRs: #30 mascot (field-notes on first-run /me, fresh-stamp on travel milestones, Explore first run 7.10); #31 page header art
  (Regions, signed-out Log/Me; DESIGN 13A); #32 START "Check in", lake/plum final, boulder-tag + map-attribution contrast; #33 research
  notes hidden (97.5% of notes); #34 the two data batches below. All bump sw.js to v18: resolve by taking the next version on merge.
- Data APPLIED + verified 2026-10-03 (FULL coverage, index rebuilt): `2026-10-03-polish-fixes` (11 pins, 3 addresses) and
  `2026-10-03-czechia-pins` (7 new Czech gyms; live 2,341 -> 2,348).
- Lighthouse a11y (production, PSI, mobile, 2026-10-03): `/` 96 (only the map attribution contrast, fixed in #32), `/in` 100,
  `/log` 100; desktop not captured. Re-run after deploy. Performance 33 on `/` mobile (TBT 6.3 s): the deferred first-load work.
- Follow-ups: `pin-drop` pose (add-gym "in review") needs a DESIGN 12.2 decision before tracing; notes need a data fix to keep the
  real facts #33 hides (separate research field, rewrite user-facing notes in the pipeline); signed-in Log/Me have no header art
  (by design); hr-005 SPK Lapis kept its pin (the candidate was a viewport centre).
### Public launch (www.bouldeer.com) — LAUNCHED 2026-10-02
- Status: launch-readiness merged (PRs #14-#16: /privacy, /terms, 404, security headers + CSP, climbatlas.org 308 redirect,
  pinned CDN + SRI, sign-in for edits/reports); all 10 migrations applied (security hardening 2026-10-02, docs/migrations.md);
  owner tested sign-in, submissions and moderation on production. Wave 1 IMPORTED (179) + Wave 2 IMPORTED (38) 2026-10-03; 5 + 11 pin fixes, 3 retirements (2 closed, 1 duplicate) and 7 Czech gyms applied; live 2,348.
- Post-launch: gym-cap trigger migration 20261003000100 APPLIED; sitemap; link previews.
- Open: real-phone retest (owner) of the 2026-09-29 fixes (eyes, Date/Mood) and check-in on production; Supabase Auth Redirect
  URLs: add preview domains (else sign-in lands on the Site URL); Privacy/Terms live 2026-10-02 (owner to confirm the 30-day
  deletion sentence and the age-13 line). Decisions: DESIGN.md log.
  Phase 4 not built (minimal schema, owner): publish-then-review for hours/price/links, website field, photo/confirm points.
### Gym import pipeline — first batch imported; follow-ups
- Status: gated importer built and tested; first batch (246) IMPORTED 2026-09-24 (1,881 → 2,127). Open: retire data/gyms.json (plan in docs).
- Regional expansion (new locations, one geographic section at a time): `research new|reconcile|stage` built (`research.js`, docs
  "Regional research"). Wave 1 (9 Tier A sections) IMPORTED + verified (manifests; India recovered after #23). Wave 2 (6) IMPORTED + verified; Wave 3A (5, PR #13) and 3C paused.
- Location data: updates APPLIED 2026-09-30 (11) and 2026-10-03 (5 incl. Manga Climbing; then 11: the 4 manual-review gyms + 7
  Wave 2 follow-ups). 489 unresolved.

## Backlog

### Native-language gym pass — follow-ups (Sep 2026)
- Status: backlog. Rounds 1-2 added 230 gyms (seed-1903..2134; chain store lists + climbing-net/rocodromos/DAV pages).
- Next candidates: Climb Up (Brest, Angers, Lesquin, Villeneuve d'Ascq, Mulhouse, Dijon, Orléans, Le Mans,
  Aix x2, Istres, Nîmes…), ~20 more Bloc Session sites, MurMur/Antrebloc/Le Pan; Sputnik Asturias
  (opens 25 Sep 2026); Italian gyms whose sites time out (Torino, Bologna, Palermo, Napoli); DE:
  Thüringen/Sachsen-Anhalt/Saarland, urban apes & Der Kegel (Berlin); KR: Gwangju, Jeollanam.

### UK + chain expansions (boulderingwall.com follow-up)
- Status: backlog. ~30 more UK single-gym towns; chain branches: Camp5 MY (~6), Hive CA (~4), Boulderwelt DE (~4),
  B-PUMP JP (~3), 9 Degrees AU (~2), Boulder Co NZ (~1). Verify each branch. (climbingbusinessjournal.com/map: paywalled.)

### Fill missing addresses (299 spots)
- Status: backlog. `address` empty for DE 112, GB 82, CN 54, NO 20, CO 5, IL 3, US 3, VE 3, others ≤2.

### Monetization: paid "offline mode" (Stripe)
- Status: backlog, needs scoping with the owner: gate the PWA caching behind a subscription (Stripe checkout, a webhook as a
  Supabase Edge Function given the no-build rule, a subscriptions table + RLS). Open: what is gated; free-tier cap; price.

## Blocked
- _(none)_
