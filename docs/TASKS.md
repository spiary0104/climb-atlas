# Tasks — open items only

Full history: `docs/archive/tasks.md` (archived, do not read); git log is the changelog.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
### Research wave 2026-10-13 — STAGED, not applied (branch `research/2026-10-13-wave`): +108 gyms, 49 pin fixes
- Batches: 2026-10-13-fixes (13 AU pins + Boulderdash), 2026-10-13-cn-pin-fixes (35 CN pins, Amap entrance coordinates), then new gyms:
  us-ny-boston-metros 6, us-central-metros 6, italy-cities 23, uk-cities 21, australia 24, jp-remaining 22, brazil 6. California and the
  big US metros turned out almost fully covered already. Independent of the Korea/China PR. Owner checks: `import/research/MANUAL-CHECKS-wave-2026-10-13.md`.
- China new cities (Guangzhou/Shenzhen, Hangzhou/Nanjing, Wuhan/Xi'an) wait for the owner's rednote.com + Amap tab (Chrome was closed).
### Coverage-gap sprint 2026-10-06 — 19/20 APPLIED + verified (+856 gyms, live 3,294); kr-seoul (40) NOT applied
- The 2026-10-06 apply run stopped at kr-seoul with nothing written for it; it plans and dry-runs clean (2026-10-07). Owner re-runs:
  `powershell -ExecutionPolicy Bypass -File scriptspply-batch.ps1 2026-10-06-kr-seoul`
- `docs/research/coverage-gap-2026-10/REPORT.md` (country/city gap rankings, next wave, tooling notes). 187 owner checks: `MANUAL-CHECKS.md`.
  Follow-ups (pin fixes, Seoul duplicates): `STATUS.md`. Next wave: Korea outside Seoul, US covered-state metros, FR/DE long tail, Italy, UK cities.

### China (Chengdu) pilot — Gate 0 done 2026-10-31; Gate 1 approved 2026-11-01
- Network (Gate 0): no mainland hosting now (Supabase ~28% reachable on mainland networks; ICP needs a Chinese entity); roaming/eSIM
  guidance + a minimal offline "download a city" mode later. Plan: https://claude.ai/artifact/GVHNLJWVT6gdQyQCVSM4Lm
- Data: 14 verified pilot gyms + batch `2026-11-01-chengdu` (needs apply approval): `import/research/2026-11-01-chengdu/verification.md`.
  Visitor info: WeChat checks by someone with WeChat (owner note 2026-11-01). Hold PR #83's CN batches until the name_local schema.
- Next: Gate 1 PR 1 (name_local + visitor fields, local branch only), then the importer.
- Map tiles: CARTO used keyless under its non-commercial terms (owner 2026-11-01); if use turns commercial or CARTO limits it,
  fall back to OpenFreeMap (measured reachable in mainland China too).

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
