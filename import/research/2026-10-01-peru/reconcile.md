# Regional research: Peru (Tier C, wave 3A) (2026-10-01-peru)

Scope: PE (whole country)
Index: 2127 gyms, sha256 8dbddf7924c2… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
6 candidate(s): ready 0 | review 1 | blocked 3 | already in Bouldeer 2 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (2)
- pe-001 "VERTICAL Gimnasio de Escalada" -> seed-1723 "VERTICAL Gimnasio de Escalada" (same-name, 213 m)
- pe-002 "Pirqa" -> seed-1724 "Pirqa" (same-name, 2 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- pe-003 "Vertigo Valle Sagrado" [g-020b112ed4]
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building

## Blocked: cannot be accepted (3)
- pe-004 "Mono Blanco Climbing Gym": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- pe-005 "Templo de los Monos": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- pe-006 "Climbing Rooftop": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-peru`.
Nothing here touches production.
