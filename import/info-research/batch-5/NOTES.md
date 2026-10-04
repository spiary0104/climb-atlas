# Gym information research batch 5 (2026-10-04): non-metro gyms in measured countries

Scope: the 520 non-metro gyms (no metro, not yet researched) in countries whose gyms publish on their own sites (measured in
batches 1-4: US, GB, FR, CH, DE, CA, CZ, SE, JP, AU, ES, AT, PL, NL, IL, FI, RU, HU). China and Korea excluded (batch 4: almost
no own sites). `brief.md` = brief v3: the v2 field rules (website, weekly hours only when all 7 days are stated, day pass as
the gym states it with currency, facilities from the fixed list only when stated for THIS location; the gym's own site /
location page / own booking or price page only) plus `operating`, `official_address`, `location` (ok / wrong_pin /
address_missing / mismatch / unknown), `renamed_to`, `duplicate_of_hint` for every gym.

## What was researched
- 27 research chunks (`chunk-NN.json` targets, `research-NN.json` results), ~20 gyms each, plus chunk 28: a re-search of
  15 gyms first done while web search was unavailable (later file wins). Mechanical check (`check-info3.js`) clean on all.
- Status: found 463, website-only 6, not-found 18, flag 33. Operating: yes 484, closed 9, not a gym 2, unknown 25.
- Location (our pin vs the official address): ok 362, wrong pin 107, address missing 14, mismatch 6, unknown 31.

## Ledgers (all applied by the builder, `ledger.js` records decisions)
- `corrections.json`: per-gym field drops / facility removals with reasons (pages disagree, stale or undated prices,
  price-to-label mapping unclear, facilities only implied).
- `exclude.json`: gyms not filled (retired, renamed, not yet open, temporarily closed, compromised site). `keep.json`:
  flagged gyms that ARE filled.
- `reviews.json`: `retire` (21: the retirement batch), `review` (32 owner decisions: renames, moves, possible duplicates,
  type tags, geo-blocked sites), `location` (121 wrong / missing pins for location-fix batches).

## Fact-checks (independent, against the live official sites)
- Sample A (15 gyms, US/FR/GB/SE/ES/JP/RU/CA): 60/60 fields OK; one weak facility removed (training from fitness classes only).
- Sample B (15 gyms, US/SE/ES/CZ/GB, incl. image price lists): 60/60 OK; two day passes dropped as uncertain ("Pricing
  (Old)" page title; price-to-label order only from text order).

## Batches
- Fill: `2026-10-04-gym-info-13` .. `-17` (468 gyms: website 468, hours 384, day pass 402, facilities 454; 329 with all four).
- Retire: `2026-10-04-nonmetro-retire` (21: closed, not climbing gyms, or no gym at the listed place and no current
  official presence; owner rule "if unsure, retire").
- Location fixes: `2026-10-04-nonmetro-locations-1` (64 of the first 69 candidates; `locations.json`: official address + OSM element,
  house-number geocode or the official site's own place pin, per record). 3 unresolved (no building-level point), 2 held
  (Treadstone: moved to another state; Flashpoint Swindon: possibly replaced by Rockstar). Part 2: `locations-2.json`.
- validate/plan: 0 errors, 0 duplicates, 0 invalid; public-key dry-run: PREFLIGHT PASSED for each.
- Apply order: fills and retirements FIRST, then the location batches (a location change alters the content hash, and
  62 of the 64 location gyms are also in a fill batch, which checks expect_h). Identity edits for the same gyms come last.
