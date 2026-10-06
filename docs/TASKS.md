# Tasks — open items only

Full history: `docs/archive/tasks.md` (archived, do not read); git log is the changelog.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
- _(none; pin check + owner checks live 2026-10-06: 2,419 gyms)_

## Gym data
### Owner manual checks (2026-10-06)
- Done: 8 gyms added, 1 tag fix, the rest declined (`import/research/MANUAL-CHECKS-2026-10-06.md`). Open: CAT Torino (bouldering for day visitors?);
  re-check later: Kletterhütte Ilmenau (not open yet), Hwang Pyeong-ju (unsure).
- Decisions: the merged Jeonnam-Gwangju region name in Korean addresses.
### Chain expansions
- Camp5 MY (~6), Hive CA (~4), Boulderwelt DE (~4), B-PUMP JP (~3), 9 Degrees AU (~2), Boulder Co NZ (~1). Verify each branch.
### Gym information (website, hours, day pass, facilities)
- 456 gyms in countries not yet researched; CN/KR need a source decision. Seed website + hours for the top metros.
### Locations and addresses
- Owner manual pin checks: 40 (`import/pin-check/2026-10-06/MANUAL-CHECK-{europe,rest-of-world}.md`). China: 138 gyms with unconfirmed pins
  or no address, waiting on the CN source decision. Identity fixes after the pin check: seed-903 name, seed-1028 suburb, seed-1413 address.
### Regional expansion
- Wave 3A (5 sections, PR #13) and 3C paused.

## Product
### Welcome after the first email confirmation
- Owner 2026-10-05: one-time welcome after a new user first confirms their email (log, save, add gyms); never on later sign-ins.
### Self-serve account deletion
- Users delete their own account from the app (the legal pages promise deletion within 30 days).
### Community publishing (Phase 4)
- Publish-then-review for edits, photos and confirm points are not built (gym-information edits still wait for moderation).
### Map performance
- Lazy map done on `perf/lazy-map` (2026-10-06): MapLibre loads after the first list render, modulepreload, parallel gym pages.
  Next if needed: Fraunces (118 KB) still competes with the list on slow phones; on desktop the bare basemap now shows ~1 s
  later (pins sooner); a static snapshot first view (option B) was not taken.

## Blocked
- _(none)_
