# Tasks — open items only

Full history: `docs/archive/tasks.md` (archived, do not read); git log is the changelog.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
### Korea 2026-10-12 — STAGED, not applied (PR on `research/2026-10-12-korea`): +120 gyms, 28 pin fixes, 4 duplicate retirements
- Batches: kr-fixes (updates + retirements) and kr-seoul (39 new; Seonyu is same-as seed-1200), then kr-incheon 6, kr-busan-gyeongnam 10,
  kr-daegu-gyeongbuk 12, kr-gyeonggi-west 8, kr-gyeonggi-south 17, kr-gyeonggi-north 13, kr-central-regions 15. All plan clean together.
- Apply in that order (kr-fixes first). Afterwards stage the identity batch (seed-1200, seed-1177, seed-1235 names).
- 73 owner checks + existing records to look at: `import/research/MANUAL-CHECKS-korea-2026-10-12.md`.
### Coverage-gap sprint 2026-10-06 — 19/20 APPLIED (+856 gyms, live 3,294); kr-seoul moved into the Korea PR above
- `docs/research/coverage-gap-2026-10/REPORT.md` (rankings, next wave, tooling). 187 owner checks: `MANUAL-CHECKS.md`; follow-ups `STATUS.md`.
### China via RedNote — waiting for the owner to log in to xiaohongshu.com in Chrome (OpenCLI)
- Owner decisions 2026-10-12: RedNote (read-only search) is a source for China (exists / open / bouldering); pins come from the gym's own
  Amap or Dianping listing, converted from GCJ-02 to WGS-84 and cross-checked with OSM; no listing pin = defer. Never log in for the owner.

## Gym data
### Owner manual checks
- Wave 3A: 17 gyms (`import/research/MANUAL-CHECKS-wave-3a.md`).
- Done: 8 gyms added, 1 tag fix, the rest declined (`import/research/MANUAL-CHECKS-2026-10-06.md`). Open: CAT Torino (bouldering for day visitors?);
  re-check later: Kletterhütte Ilmenau (not open yet), Hwang Pyeong-ju (unsure).
- Decisions: the merged Jeonnam-Gwangju region name in Korean addresses.
### Chain expansions
- Camp5 MY (~6), Hive CA (~4), Boulderwelt DE (~4), B-PUMP JP (~3), 9 Degrees AU (~2), Boulder Co NZ (~1). Verify each branch.
### Gym information (website, hours, day pass, facilities)
- 456 gyms in countries not yet researched; KR: Naver Place listings; CN: RedNote + Amap/Dianping (decided 2026-10-12). Seed website + hours for the top metros.
### Locations and addresses
- Owner manual pin checks: 39 (`import/pin-check/2026-10-06/MANUAL-CHECK-{europe,rest-of-world}.md`). China: 138 gyms with unconfirmed pins
  or no address: fix with Amap/Dianping pins (GCJ-02 -> WGS-84) in the China pass.
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
