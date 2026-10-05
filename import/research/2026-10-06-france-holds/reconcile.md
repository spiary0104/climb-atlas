# Regional research: France: gyms on hold (second pass) (2026-10-06-france-holds)

Scope: FR (whole country)
Index: 2385 gyms, sha256 e1d9ef5216f8… | staged batches compared: none | other sections compared: 2026-10-05-france-chains
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
2 candidate(s): ready 0 | review 1 | blocked 0 | already in Bouldeer 1 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (1)
- frh-001 "Arkose Issy-les-Moulineaux voie" -> g-67ecd19a4e "Arkose - Issy-les-Moulineaux Voie" (same-name, 0 m) | also: bouldering-unknown

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- frh-002 "Bloc Session Ardennes" [g-d014ec9e78]
  - weak-coordinates: coordinates are street-level, not the building

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-france-holds`.
Nothing here touches production.
