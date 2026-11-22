# Tasks — open items only

Full history: `docs/archive/tasks.md` (archived, do not read); git log is the changelog.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
### Apply queue — owner runs scriptsapply-batch.ps1
- Applied 2026-11-11 (36 batches, verified): Korea 8 sections, cn-shanghai, 14 cn 2026-11-08 cities, 12 China info fills, retire seed-713/499;
  production 3,612 gyms. Still held: 2026-10-12-cn-kunming-changsha and cn-beijing-chengdu (re-review: 3 gyms already exist).
- apply-batch.ps1 rebuilds the index and re-plans each batch itself, so committed plan.json files going stale is expected.
### China data
- ~270 gyms still lack a Chinese name: mostly kids' or sports-centre walls with no account, or brands whose accounts list no stores
  (RedNote read-only, 30 s between reads avoids captchas). Owner checks: `import/research/MANUAL-CHECKS-china-2026-10-12.md`.
- Sources: RedNote/Amap/WeChat read-only (WeChat: a gym's own 公众号 article = official-social; mini programs have no citable URL).
### China (Chengdu) pilot — Gate 0 done 2026-10-31; Gate 1 approved 2026-11-01; pilot data and name_local schema live
- Network: no mainland hosting now (Supabase ~28% reachable on mainland networks; ICP needs a Chinese entity); roaming/eSIM
  guidance + a minimal offline "download a city" mode later. Plan: https://claude.ai/artifact/GVHNLJWVT6gdQyQCVSM4Lm
- name_local (lists, leads in a matching UI language), address_local + Amap (gym page) shown; visitor info: shown when filled.
  Visitor info: WeChat checks by someone with WeChat (owner note 2026-11-01).
- Map tiles: CARTO keyless under its non-commercial terms (owner 2026-11-01); if use turns commercial, fall back to OpenFreeMap.

## Gym data
### Owner manual checks
- Wave 3A: 17 gyms (`import/research/MANUAL-CHECKS-wave-3a.md`).
- Follow-up 2026-11-11: 592 checks verified on public sources (42 resolved, 26 already resolved, 115 need a human, 393 open), index
  `import/research/MANUAL-CHECKS-followup-2026-11-11.md`. Later: the ~70 pin/entrance checks (owner, map inspection); Korea + small EU files not covered.
- Owner policy 2026-11-11: RedNote visitor notes count (2+ authors, 12 months, + map listing; flagged); kids-only, members-only municipal and
  appointment-only venues are not listed. Next: retire existing ones (reason `not-public`), starting with the China kids-only list in the follow-up.
- Done: 8 gyms added, 1 tag fix, the rest declined (`import/research/MANUAL-CHECKS-2026-10-06.md`). Open: CAT Torino (bouldering for day visitors?);
  re-check later: Kletterhütte Ilmenau (not open yet), Hwang Pyeong-ju (unsure).
- Decisions: the merged Jeonnam-Gwangju region name in Korean addresses.
### Chain expansions
- Camp5 MY (~6), Hive CA (~4), Boulderwelt DE (~4), B-PUMP JP (~3), 9 Degrees AU (~2), Boulder Co NZ (~1). Verify each branch.
### Gym information (website, hours, day pass, facilities)
- 456 gyms in countries not yet researched; KR: Naver Place; CN: RedNote/Amap/WeChat (decided). Seed website + hours for the top metros.
### Locations and addresses
- Owner manual pin checks: 39 (`import/pin-check/2026-10-06/MANUAL-CHECK-{europe,rest-of-world}.md`). China: 138 gyms with unconfirmed pins
  or no address (Amap pins, GCJ-02 -> WGS-84; several pin batches already applied).
### Regional expansion
- Wave 3C paused. Global gap ranking (58 countries, 2026-10-06): `docs/research/coverage-gap-2026-10/ranking-countries.md`.

## Product
### Gym aliases (i18n PR 3 follow-up; owner approval needed)
- Apply `supabase/migrations/20261114000100_gym_aliases.sql` (untested locally: Docker was off), then add `aliases` to LIST_COLUMNS in
  data-load.js AND spots-prefetch.js (a test keeps them identical) and regenerate the fallback; search-index.js already reads it.
- Import pipeline: write only verified aliases (own signage/site/social). Visitor i18n model: `visitor` stays the original; optional `visitor_lang`, `visitor_i18n` jsonb {en:{...}}.
### i18n (docs/i18n.md): 9 languages + place names live; open: native review, legal pages English only, unify 岩馆/攀岩馆; SEO per-language URLs and Play/TWA are owner decisions.
### Welcome / account deletion / community publishing
- One-time welcome after first email confirmation (owner 2026-10-05). Account deletion built (Me page + Edge Function);
  owner deploys it: `supabase functions deploy delete-account` (docs/migrations.md).
- Phase 4: publish-then-review for edits, photos and confirm points are not built.
### Map performance
- Lazy map live (PR #77). Next if needed: Fraunces (118 KB) competes with the list on slow phones.

## Blocked
- _(none)_
