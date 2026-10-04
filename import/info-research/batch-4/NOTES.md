# Gym information research batch 4 (2026-10-04): every remaining metro

Scope: all 89 metros without gym information (1,080 gyms) after batches 1-3. Same rules as batch 3 (`brief.md` = brief v2:
website, weekly hours only when all 7 days are stated, day pass as the gym states it with currency, facilities from the
fixed list only when stated for THIS location; the gym's own site / location page / own booking or price page only).
Pipeline: PR #44 (fill-only day_pass + facilities). Builder: `build-info-batch-v3.js` with the review ledgers below.

## What was researched
- 35 research chunks (`chunk-NN.json` targets, `research-NN.json` results), ~25 gyms each, plus a China pilot (36) and the
  Banana Climbing chain (37). Mechanical check (`check-info2.js`) clean on every file.
- **China skipped** after the pilot: 3 of 20 Shanghai gyms have an own website (all one chain); independent gyms publish only
  on WeChat/Dianping/Xiaohongshu (excluded sources). Only the Banana Climbing chain (own site + public API) was done.
- **Korea skipped** after Seoul A: 1 of 19 gyms has an own website (the rest Naver/Kakao/Instagram); chunks 22-24 stopped;
  Daegu (in chunk 25) confirmed it (0 of 7).
- Web search hit its shared budget (200) partway; later chunks found sites by trying domains directly (facts still only
  from the gyms' own pages; more not-found).

## Ledgers (all applied by the builder)
- `corrections.json`: per-gym field drops and facility-key removals with reasons (pages that disagree, stale or undated
  price lists, inferred hours, currency not stated, facilities only from menu labels / captions / chain-wide text).
- `exclude.json`: gyms not filled (renames needing an app edit, ambiguous matches, unread sites). `keep.json`: flagged gyms
  that ARE filled (real gym, wrong pin/suburb; listed for a location fix).
- `reviews.json`: `retire` (47, become batch gym-info-12) and `review` (follow-ups: renames, location fixes, type tags,
  possible duplicates, new gyms to add).

## Fact-checks (independent, against the live official sites)
- Sample A (15 gyms, Europe/AU/BR/CA): 60/60 fields OK. Sample B (15, UK/HU/JP, incl. image price lists): 118/120 OK, 2
  non-errors (a correct null; a MoonBoard counted as training per the brief).

## Batches
- Fill: `2026-10-04-gym-info-5` .. `-11` (574 gyms: website 574, hours 491, day pass 479, facilities 550).
- Retire: `2026-10-04-gym-info-12` (47 gyms: closed, not public climbing gyms, or duplicates; evidence per record).
- validate/plan: 0 errors, 0 duplicates, 0 invalid; public-key dry-run: PREFLIGHT PASSED for all eight.
