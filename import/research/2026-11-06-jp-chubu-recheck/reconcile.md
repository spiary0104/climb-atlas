# Regional research: Japan: Chubu/Tokai re-check of deferred gyms (2026-11-06-jp-chubu-recheck)

Scope: JP / NIIGATA, NAGANO, SHIZUOKA, MIE
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul, 2026-10-13-australia, 2026-10-13-brazil, 2026-10-13-italy-cities, 2026-10-13-jp-remaining, 2026-10-13-uk-cities, 2026-10-13-us-central-metros, 2026-10-13-us-ny-boston-metros, 2026-11-06-jp-kanto-recheck | other sections compared: 2026-10-06-jp-chubu, 2026-10-06-jp-kansai, 2026-10-06-jp-kanto, 2026-10-06-jp-kyushu-hokkaido, 2026-10-13-jp-remaining, 2026-11-06-jp-kanto-recheck
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
6 candidate(s): ready 1 | review 2 | blocked 0 | already in Bouldeer 3 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (3)
- jp2-cloud-nine "Bouldering Gym Cloud Nine" -> g-6200b381f1 "Cloud Nine" (same-address-related-name, 0 m)
- jp2-friction-freaks "FRICTION FREAKS" -> g-b547e83ccc "Friction Freaks" (same-name, 0 m)
- jp2-omoshirock "Omoshirock" -> g-4da23ca2de "Omoshirock" (same-name, 985 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- jp2-sorani "Climbing Gym SORANI" [g-6258aed086] reviewed_against must include: g-5e6f270e19
  - importer-probable-duplicate: g-5e6f270e19 same-name-but-pin-differs 1242 m
  - name-match: g-5e6f270e19 "Climbing Gym SORANI": same-name-but-pin-differs ("Climbing Gym SORANI" / "Climbing Gym SORANI", 1242 m)
- jp2-takibi "Bouldering Takibi" [g-071f89d860]
  - weak-coordinates: coordinates are street-level, not the building

## Ready (no flags; still needs an explicit accept) (1)
- jp2-jplus "Climbing Gym J Plus" [g-8c85fcfd69]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-06-jp-chubu-recheck`.
Nothing here touches production.
