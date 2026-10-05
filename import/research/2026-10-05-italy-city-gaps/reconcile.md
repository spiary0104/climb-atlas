# Regional research: Italy: Torino, Bologna, Palermo, Napoli gaps (2026-10-05-italy-city-gaps)

Scope: IT / PIEMONTE, EMILIA_ROMAGNA, SICILIA, CAMPANIA
Index: 2272 gyms, sha256 c97e3035f020… | staged batches compared: 2026-10-05-spain-asturias | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
15 candidate(s): ready 5 | review 6 | blocked 4 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (6)
- it-002 "BoulderBar" [g-7da020b015]
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- it-005 "Bside Climbing Village" [g-c4b997cec9]
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- it-007 "Presa B+" [g-ea5b1d6ce2] reviewed_against must include: g-6c9121ff1a
  - importer-probable-duplicate: g-6c9121ff1a renamed-or-related-name-nearby 18 m
  - limited-access: club wall: check it is open to the public
  - name-match: g-6c9121ff1a "Presa B+ - Bologna": renamed-or-related-name-nearby ("Presa B+" / "Presa B+ - Bologna", 18 m)
  - single-source: all evidence comes from one source
- it-008 "UP Urban Climbing" [g-ee2642434a]
  - single-source: all evidence comes from one source
- it-009 "Level24" [g-94c5fd66d3]
  - single-source: all evidence comes from one source
- it-013 "Free Climbing Palermo" [g-569cef7574]
  - limited-access: club wall: check it is open to the public
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building

## Blocked: cannot be accepted (4)
- it-006 "Centro Arrampicata Torino (Palabraccini)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- it-011 "Eden Park San Lazzaro (climbing)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- it-014 "Palaroccia Napoli (DEMON Rock Wall)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- it-015 "BlueRock Climbing Gym": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (5)
- it-001 "SASP Arrampicata" [g-31c1a16852]
- it-003 "La Mole Sports Academy" [g-971a59d3c7]
- it-004 "Escape Climbing Garden" [g-b9cb399ce3]
- it-010 "Monkeys' Planet" [g-fa313f080a]
- it-012 "SCALART Climbing Palermo" [g-213fd25aed]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-italy-city-gaps`.
Nothing here touches production.
