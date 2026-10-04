# Tasks — open items only

Full history: `docs/archive/tasks.md` (archived, do not read); git log is the changelog.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
### Gym information — batch 5 (+483 enriched, +25 retired) and all follow-ups APPLIED 2026-10-04 (PRs #44-#47 merged; #48-#50 open)
- Applied + verified (704 records): batch 5 fills (468 + 15), 25 retirements, 4 new gyms, 126 location fixes, 52 identity edits
  (#49 + review). `import/info-research/batch-5/{NOTES,REVIEW-RESOLUTIONS}.md`. Merge #48 -> #49 -> #50 to ship the sitemap. Re-check: Arkose Cholet (not open), Klaettra Motala (temp. closed). Next: 456 gyms in unmeasured countries; CN/KR need a source decision.
### Final-stage sprint (gym information, metros, SEO, perf) — DONE: PR #37 merged and live in production 2026-10-03
- Status: PR #37 (`integration/final-stage`) merged to master 2026-10-03 (merge commit `b58a79e`) and deployed by Vercel; production
  smoke test passed (/, gym, metro, region, /in, sitemap.xml 3,299 URLs, robots.txt, bot link previews; no console errors at
  1280/375 px). Migration `20261004000100_gym_information` APPLIED (docs/migrations.md). Vercel preview protection re-enabled.
- Shipped: gym information (website, weekly hours, day pass free text, facilities, description; one photo link); 102 city metros
  (cross-region ones on neighbouring region pages with 2+ gyms); UX follow-ups; perf (spots 359 -> 191 KB; `js/spots-prefetch.js`
  starts the gym-list read before MapLibre: list 8.8 -> 6.1 s locally, Explore LCP +0.6 s accepted); SEO (sitemap, area pages only
  with 2+ gyms, + `api/_places.json`; link previews via `api/seo.mjs`, bot user agents only). Re-run `node scripts/build-sitemap.js` per batch.
- Owner: submit the sitemap in Google Search Console.
- Follow-ups: seed website + hours for the top metros (import batch); self-serve account deletion; map-stack weight (MapLibre still
  blocks the first paint of the app; rendering the list before the map exists would be the next, architectural, step).
- Open now + today's hours in discovery, update toast, global `[hidden]` (branch `feature/open-now-and-update-toast`, awaiting review 2026-10-04; list read adds `hours`, +19.5 KB gzip).
### Public launch (www.bouldeer.com) — LAUNCHED 2026-10-02
- Status: launch-readiness merged (PRs #14-#16: /privacy, /terms, 404, security headers + CSP, climbatlas.org 308 redirect,
  pinned CDN + SRI, sign-in for edits/reports); all 10 migrations applied (security hardening 2026-10-02, docs/migrations.md);
  owner tested sign-in, submissions and moderation on production. Wave 1 IMPORTED (179) + Wave 2 IMPORTED (38) 2026-10-03; 5 + 11 pin fixes, 3 retirements (2 closed, 1 duplicate) and 7 Czech gyms applied; live 2,348.
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
