# Regional research: Czechia (Tier B, wave 2) (2026-10-01-czechia)

Scope: CZ (whole country)
Index: 2306 gyms, sha256 3b20e7b458c7… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
25 candidate(s): ready 9 | review 13 | blocked 1 | already in Bouldeer 2 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (2)
- cz-001 "HUDY Boulder Karlín" -> seed-1450 "HUDY Boulder Karlín" (same-name, 6 m)
- cz-007 "Třináctka" -> seed-1454 "Třináctka" (same-name, 183 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (13)
- cz-002 "SmíchOFF" [g-a01f8209e0] reviewed_against must include: cz-008, seed-1452
  - importer-probable-duplicate: seed-1452 similar-name-nearby 108 m
  - name-match: seed-1452 "Smichoff Climbing Center": similar-name-nearby ("SmíchOFF" / "Smichoff Climbing Center", 108 m)
  - related-name-nearby: candidate cz-008 "Lezecké centrum Ruzyně": related names "Lezecké centrum SmíchOFF" / "Lezecké centrum Ruzyně" 7556 m apart
- cz-003 "BigWall" [g-69110af8e3] reviewed_against must include: seed-1455
  - importer-probable-duplicate: seed-1455 similar-name-nearby 149 m
  - name-match: seed-1455 "BigWall Praha-Vysočany": similar-name-nearby ("BigWall" / "BigWall Praha-Vysočany", 149 m)
- cz-004 "Boulder V síti" [g-dac2e80bc3]
  - weak-coordinates: coordinates are street-level, not the building
- cz-006 "JamJam Boulderovka" [g-f53050836a] reviewed_against must include: seed-1453
  - importer-probable-duplicate: seed-1453 similar-name-nearby 130 m
  - name-match: seed-1453 "JamJam Boulder Gym": similar-name-nearby ("JamJam Boulderovka" / "JamJam Boulder Gym", 130 m)
  - single-source: all evidence comes from one source
- cz-008 "Lezecké centrum Ruzyně" [g-4756a6687f] reviewed_against must include: cz-002
  - related-name-nearby: candidate cz-002 "SmíchOFF": related names "Lezecké centrum Ruzyně" / "Lezecké centrum SmíchOFF" 7556 m apart
  - single-source: all evidence comes from one source
- cz-009 "HANGAR Brno" [g-7cdfe857b7]
  - single-source: all evidence comes from one source
- cz-011 "HANGAR Ostrava" [g-4ec0acdd4f]
  - single-source: all evidence comes from one source
- cz-016 "Gekon Boulder Bar" [g-bdb66a1ace]
  - weak-coordinates: coordinates are street-level, not the building
- cz-020 "Stěna Lanovka" [g-a32198c132] reviewed_against must include: cz-021
  - related-name-nearby: candidate cz-021 "Limit Boulder": related names "Lanovka České Budějovice" / "Limit Boulder České Budějovice" 1937 m apart
- cz-021 "Limit Boulder" [g-13b8778bdb] reviewed_against must include: cz-020
  - related-name-nearby: candidate cz-020 "Stěna Lanovka": related names "Limit Boulder České Budějovice" / "Lanovka České Budějovice" 1937 m apart
  - single-source: all evidence comes from one source
- cz-022 "V16" [g-2e20de5103]
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- cz-024 "Boulder Bar Točna" [g-23477926a6]
  - single-source: all evidence comes from one source
- cz-025 "Komec" [g-6fb2ca2bcd]
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building

## Blocked: cannot be accepted (1)
- cz-013 "Stěna Eliass": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: reject closed

## Ready (no flags; still needs an explicit accept) (9)
- cz-005 "UltraAnt" [g-96713e45e8]
- cz-010 "HUDY lezecká stěna Brno" [g-9ddf6a0d6e]
- cz-012 "Tendon Blok" [g-9d32a01682]
- cz-014 "Replay boulder" [g-491eb60dc0]
- cz-015 "Jungle Pardubice" [g-6176855dfb]
- cz-017 "MakakAréna" [g-b3634f358d]
- cz-018 "Pajkland" [g-4aaf1c3c1c]
- cz-019 "Flash Wall Olomouc" [g-6c864ad8fa]
- cz-023 "HUDY lezecká stěna Ústí nad Labem" [g-8cbc1eab88]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-czechia`.
Nothing here touches production.
