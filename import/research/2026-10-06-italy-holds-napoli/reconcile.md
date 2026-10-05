# Regional research: Italy: gyms on hold + Napoli (second pass) (2026-10-06-italy-holds-napoli)

Scope: IT / PIEMONTE, EMILIA_ROMAGNA, SICILIA, CAMPANIA
Index: 2385 gyms, sha256 e1d9ef5216f8… | staged batches compared: none | other sections compared: 2026-10-05-italy-city-gaps
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
9 candidate(s): ready 0 | review 4 | blocked 5 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (4)
- ih-001 "Palaroccia Napoli" [g-0dad847caf] reviewed_against must include: 2026-10-05-italy-city-gaps#it-014, ih-009
  - alias-match: candidate ih-009 "DEMON Rock Wall (Palasport Trincone)": same-name-but-pin-differs ("DEMON Rock Wall" / "DEMON Rock Wall (Palasport Trincone)", 2358 m)
  - other-section: 2026-10-05-italy-city-gaps#it-014 "Palaroccia Napoli (DEMON Rock Wall)": name-match same-name ("Palaroccia Napoli" / "Palaroccia Napoli (DEMON Rock Wall)", 136 m)
- ih-002 "Eden Climbing (Eden Park)" [g-600115a43b] reviewed_against must include: 2026-10-05-italy-city-gaps#it-011
  - limited-access: club wall: check it is open to the public
  - other-section: 2026-10-05-italy-city-gaps#it-011 "Eden Park San Lazzaro (climbing)": name-match renamed-or-related-name-nearby ("Eden Climbing (Eden Park)" / "Eden Park San Lazzaro (climbing)", 22 m)
- ih-003 "Free Climbing Palermo" [g-569cef7574] reviewed_against must include: 2026-10-05-italy-city-gaps#it-013
  - limited-access: club wall: check it is open to the public
  - other-section: 2026-10-05-italy-city-gaps#it-013 "Free Climbing Palermo": name-match same-name ("Free Climbing Palermo" / "Free Climbing Palermo", 0 m)
  - weak-coordinates: coordinates are street-level, not the building
- ih-005 "La Mole Sports Academy" [g-a03da7a667] reviewed_against must include: 2026-10-05-italy-city-gaps#it-003
  - other-section: 2026-10-05-italy-city-gaps#it-003 "La Mole Sports Academy": name-match same-name ("La Mole Sports Academy" / "La Mole Sports Academy", 33 m)

## Blocked: cannot be accepted (5)
- ih-004 "Centro Arrampicata Torino (Palabraccini)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ih-006 "BlueRock Climbing Gym": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ih-007 "Pozzuoli Boulder": outdoor-area (outdoor climbing areas are not gyms); status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)); coarse-coordinates (coordinates only locate the area, not the gym) -> suggested: reject outdoor-area
- ih-008 "MAD Climbing Wall (Ex OPG Je so pazzo)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ih-009 "DEMON Rock Wall (Palasport Trincone)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-italy-holds-napoli`.
Nothing here touches production.
