# Tasks — open items only

Full history: `docs/archive/tasks.md` (archived, do not read); git log is the changelog.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
### Final-stage sprint (2026-10-04, audit 2026-10-03) — local branches, NOT pushed, NOT merged, migration NOT applied
- Branches: `feature/gym-information` -> `feature/ux-final` -> `feature/perf-pass` (stacked), `feature/city-metros`,
  `feature/seo-share`; all five merged and tested together on `integration/final-stage` (+ Enter-on-place, metro titles, sitemap metros).
- Gym information: migration `20261004000100_gym_information.sql` (description, website, hours jsonb, day_pass, facilities on spots +
  pending_edits; RLS suite 106/106 locally). Owner: `supabase db push --linked` BEFORE deploying (the app sends the new columns).
- City discovery: 102 curated metros (centre + radius, `metros.js`), 55% of gyms; search/filters/URLs/region + metro pages/breadcrumb.
- SEO: sitemap.xml (4,418 URLs, re-run `node scripts/build-sitemap.js` after data batches), robots Sitemap line, /about canonical,
  per-page titles in the app. Link previews for crawlers NOT built: Vercel middleware needs a package.json (owner decision).
- Perf (local, throttled phone, cold): spots 354 -> 190 KB, list 10.4 -> 8.7 s. PSI after deploy still to run (before: / 33).
- UX: nearest-first list, first-visit orientation line, "Has photos" hidden < 5%, Nearby rows, START explains sign-in.
- Follow-ups: link previews (api/seo.mjs function or accept); seed website + hours for the top metros (import batch);
  self-serve account deletion; cross-region metros (Tokyo/Seoul) on neighbouring region pages; `pin-drop` placement.
### Public launch (www.bouldeer.com) — LAUNCHED 2026-10-02
- Status: launch-readiness merged (PRs #14-#16: /privacy, /terms, 404, security headers + CSP, climbatlas.org 308 redirect,
  pinned CDN + SRI, sign-in for edits/reports); all 10 migrations applied (security hardening 2026-10-02, docs/migrations.md);
  owner tested sign-in, submissions and moderation on production. Wave 1 IMPORTED (179) + Wave 2 IMPORTED (38) 2026-10-03; 5 + 11 pin fixes, 3 retirements (2 closed, 1 duplicate) and 7 Czech gyms applied; live 2,348.
- Post-launch: gym-cap trigger migration 20261003000100 APPLIED.
- Real-phone retest (check-in, eyes, Date/Mood) passed 2026-10-03; service-role key rotated 2026-10-03.
- Legal pages simplified (PR #36, merged): no minimum age; 30-day deletion promise confirmed.
- Open: Supabase Auth Redirect URLs: add preview domains (else sign-in lands on the Site URL). Phase 4 publish-then-review and
  photo/confirm points not built (gym-information fields still go through moderation).
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
