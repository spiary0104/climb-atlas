# Tasks — open items only

Full history: `docs/archive/tasks.md` (archived, do not read); git log is the changelog.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
### Coverage-gap sprint 2026-10-06 — STAGED (20 sections, +896 gyms), awaiting owner sign-off + apply
- `docs/research/coverage-gap-2026-10/REPORT.md` (country/city gap rankings, next wave, tooling notes). 187 owner checks: `MANUAL-CHECKS.md`.
  Follow-ups (pin fixes, Seoul duplicates): `STATUS.md`. Next wave: Korea outside Seoul, US covered-state metros, FR/DE long tail, Italy, UK cities.

## Gym data
### Owner manual checks
- Wave 3A: 17 gyms (`import/research/MANUAL-CHECKS-wave-3a.md`).
- Done: 8 gyms added, 1 tag fix, the rest declined (`import/research/MANUAL-CHECKS-2026-10-06.md`). Open: CAT Torino (bouldering for day visitors?);
  re-check later: Kletterhütte Ilmenau (not open yet), Hwang Pyeong-ju (unsure).
- Decisions: the merged Jeonnam-Gwangju region name in Korean addresses.
### Chain expansions
- Camp5 MY (~6), Hive CA (~4), Boulderwelt DE (~4), B-PUMP JP (~3), 9 Degrees AU (~2), Boulder Co NZ (~1). Verify each branch.
### Gym information (website, hours, day pass, facilities)
- 456 gyms in countries not yet researched; CN/KR need a source decision. Seed website + hours for the top metros.
### Locations and addresses
- Owner manual pin checks: 39 (`import/pin-check/2026-10-06/MANUAL-CHECK-{europe,rest-of-world}.md`). China: 138 gyms with unconfirmed pins
  or no address, waiting on the CN source decision.
### Regional expansion
- Wave 3C paused. Global gap ranking (58 countries, 2026-10-06): `docs/research/coverage-gap-2026-10/ranking-countries.md`.

## Product
### Welcome after the first email confirmation
- Owner 2026-10-05: one-time welcome after a new user first confirms their email (log, save, add gyms); never on later sign-ins.
### Self-serve account deletion
- Users delete their own account from the app (the legal pages promise deletion within 30 days).
### Community publishing (Phase 4)
- Publish-then-review for edits, photos and confirm points are not built (gym-information edits still wait for moderation).
### Map performance
- Lazy map live 2026-10-06 (PR #77): MapLibre loads after the first list render. Next if needed: Fraunces (118 KB) still competes
  with the list on slow phones; a static snapshot first view (option B) was not taken.

## Blocked
- _(none)_
