# Regional research: Italy: owner manual checks (2026-10-06) (2026-10-05-italy-owner-checks)

Scope: IT / PIEMONTE, SICILIA, CAMPANIA
Index: 2412 gyms, sha256 930823b07e4d… | staged batches compared: 2026-10-05-spain-owner-checks, 2026-10-05-uk-owner-checks | other sections compared: 2026-10-05-italy-city-gaps, 2026-10-06-italy-holds-napoli
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
2 candidate(s): ready 0 | review 2 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- ito-001 "La Mole Sports Academy" [g-a03da7a667] reviewed_against must include: 2026-10-05-italy-city-gaps#it-003, 2026-10-06-italy-holds-napoli#ih-005
  - other-section: 2026-10-05-italy-city-gaps#it-003 "La Mole Sports Academy": name-match same-name ("La Mole Sports Academy" / "La Mole Sports Academy", 33 m)
  - other-section: 2026-10-06-italy-holds-napoli#ih-005 "La Mole Sports Academy": name-match same-name ("La Mole Sports Academy" / "La Mole Sports Academy", 0 m)
- ito-002 "Free Climbing Palermo" [g-569cef7574] reviewed_against must include: 2026-10-05-italy-city-gaps#it-013, 2026-10-06-italy-holds-napoli#ih-003
  - limited-access: club wall: check it is open to the public
  - other-section: 2026-10-05-italy-city-gaps#it-013 "Free Climbing Palermo": name-match same-name ("Free Climbing Palermo" / "Free Climbing Palermo", 0 m)
  - other-section: 2026-10-06-italy-holds-napoli#ih-003 "Free Climbing Palermo": name-match same-name ("Free Climbing Palermo" / "Free Climbing Palermo", 0 m)
  - weak-coordinates: coordinates are street-level, not the building

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-italy-owner-checks`.
Nothing here touches production.
