# Regional research: Japan: Kansai re-check of deferred gyms (2026-11-06-jp-kansai-recheck)

Scope: JP / OSAKA, HYOGO, SHIGA
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul, 2026-10-13-australia, 2026-10-13-brazil, 2026-10-13-italy-cities, 2026-10-13-jp-remaining, 2026-10-13-uk-cities, 2026-10-13-us-central-metros, 2026-10-13-us-ny-boston-metros, 2026-11-06-jp-chubu-recheck, 2026-11-06-jp-kanto-recheck | other sections compared: 2026-10-06-jp-chubu, 2026-10-06-jp-kansai, 2026-10-06-jp-kanto, 2026-10-06-jp-kyushu-hokkaido, 2026-10-13-jp-remaining, 2026-11-06-jp-chubu-recheck, 2026-11-06-jp-kanto-recheck
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
13 candidate(s): ready 1 | review 12 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (12)
- jp2-boulder-plus "Boulder plus" [g-33998ed831] reviewed_against must include: 2026-10-06-jp-kansai#jpk-034
  - other-section: 2026-10-06-jp-kansai#jpk-034 "Boulder Plus": name-match same-name ("Boulder plus" / "Boulder Plus", 0 m)
- jp2-cronico "Bouldering Gym Cronico" [g-0e72fd3230]
  - weak-coordinates: coordinates are street-level, not the building
- jp2-crux-osaka "CRUX Osaka" [g-dc33278097] reviewed_against must include: 2026-10-06-jp-kansai#jpk-016
  - other-section: 2026-10-06-jp-kansai#jpk-016 "CRUX Osaka": name-match same-name ("CRUX Osaka" / "CRUX Osaka", 0 m)
- jp2-dawn "DAWN Climbing Gym" [g-e06bc8d571] reviewed_against must include: 2026-10-06-jp-kansai#jpk-036
  - other-section: 2026-10-06-jp-kansai#jpk-036 "DAWN Climbing Gym": name-match same-name ("DAWN Climbing Gym" / "DAWN Climbing Gym", 0 m)
- jp2-func2 "Climbing Box FunC2" [g-c1a1dcfcdd] reviewed_against must include: 2026-10-06-jp-kansai#jpk-022
  - other-section: 2026-10-06-jp-kansai#jpk-022 "Climbing Box FunC2": name-match same-name ("Climbing Box FunC2" / "Climbing Box FunC2", 0 m)
- jp2-galera "Climbing Gym Galera" [g-d3969ef4bd] reviewed_against must include: 2026-10-06-jp-kansai#jpk-015
  - other-section: 2026-10-06-jp-kansai#jpk-015 "Climbing Gym Galera": name-match same-name ("Climbing Gym Galera" / "Climbing Gym Galera", 0 m)
- jp2-hinotama "Hinotama Wall Climbing Gym" [g-2153431a15] reviewed_against must include: 2026-10-06-jp-kansai#jpk-037
  - other-section: 2026-10-06-jp-kansai#jpk-037 "Hinotama Wall Climbing Gym": name-match same-name ("Hinotama Wall Climbing Gym" / "Hinotama Wall Climbing Gym", 0 m)
- jp2-mahoroba-forest "MAHOROBA FOREST Bouldering Space" [g-e64151e094] reviewed_against must include: 2026-10-06-jp-kansai#jpk-021
  - other-section: 2026-10-06-jp-kansai#jpk-021 "MAHOROBA FOREST Bouldering Space": name-match same-name ("MAHOROBA FOREST Bouldering Space" / "MAHOROBA FOREST Bouldering Space", 0 m)
- jp2-old-but-gold "OLD BUT GOLD" [g-4c4134cef6] reviewed_against must include: 2026-10-06-jp-kansai#jpk-039
  - other-section: 2026-10-06-jp-kansai#jpk-039 "OLD BUT GOLD": name-match same-name ("OLD BUT GOLD" / "OLD BUT GOLD", 0 m)
- jp2-rock-mate-otsu "Rock Mate Otsu" [g-d8f4c67cfa] reviewed_against must include: 2026-10-06-jp-kansai#jpk-053
  - other-section: 2026-10-06-jp-kansai#jpk-053 "Rock Mate Otsu": name-match same-name ("Rock Mate Otsu" / "Rock Mate Otsu", 0 m)
- jp2-san-climbing "SAN Climbing Gym" [g-784a9c7b7c] reviewed_against must include: 2026-10-06-jp-kansai#jpk-019
  - other-section: 2026-10-06-jp-kansai#jpk-019 "SAN Climbing Gym": name-match same-name ("SAN Climbing Gym" / "SAN Climbing Gym", 0 m)
- jp2-suhara-ikeda "Suhara Climbing Gym Ikeda" [g-f0fab4b902] reviewed_against must include: 2026-10-06-jp-kansai#jpk-024
  - other-section: 2026-10-06-jp-kansai#jpk-024 "Suhara Climbing Gym Ikeda": name-match same-name ("Suhara Climbing Gym Ikeda" / "Suhara Climbing Gym Ikeda", 0 m)

## Ready (no flags; still needs an explicit accept) (1)
- jp2-suhara-takarazuka "Suhara Climbing Gym Takarazuka" [g-a2936cf7f9]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-06-jp-kansai-recheck`.
Nothing here touches production.
