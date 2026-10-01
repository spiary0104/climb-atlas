# Regional research: Thailand (Tier A, wave 1) (2026-10-01-thailand)

Scope: TH (whole country)
Index: 2127 gyms, sha256 8dbddf7924c2… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
16 candidate(s): ready 3 | review 8 | blocked 4 | already in Bouldeer 1 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (1)
- th-004 "Stonegoat Climbing Gym (S69)" -> seed-1752 "Stonegoat Climbing Gym" (same-name, 844 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (8)
- th-001 "Balance Climbing Rama 9" [g-5d2b19809d] reviewed_against must include: th-002
  - related-name-nearby: candidate th-002 "Balance Prime": related names "Balance Climbing" / "Balance Prime" 6287 m apart
  - same-website: candidate th-002 has the same website
- th-002 "Balance Prime" [g-ee6ea57df4] reviewed_against must include: th-001
  - related-name-nearby: candidate th-001 "Balance Climbing Rama 9": related names "Balance Prime" / "Balance Climbing" 6287 m apart
  - same-website: candidate th-001 has the same website
- th-005 "Stonegoat Climbing Gym (The PARQ)" [g-97582d8b30] reviewed_against must include: seed-1752, th-004
  - importer-probable-duplicate: seed-1752 same-name-but-pin-differs 4329 m
  - name-match: seed-1752 "Stonegoat Climbing Gym": same-name-but-pin-differs ("Stonegoat Climbing Gym (The PARQ)" / "Stonegoat Climbing Gym", 4329 m)
  - name-match: candidate th-004 "Stonegoat Climbing Gym (S69)": same-name-but-pin-differs ("Stonegoat Climbing Gym (The PARQ)" / "Stonegoat Climbing Gym (S69)", 3755 m)
  - single-source: all evidence comes from one source
- th-006 "Urban Playground Climbing" [g-0d01dd75d8] reviewed_against must include: seed-1754
  - importer-probable-duplicate: seed-1754 same-name-but-pin-differs 1248 m
  - name-match: seed-1754 "Urban Playground Climbing": same-name-but-pin-differs ("Urban Playground Climbing" / "Urban Playground Climbing", 1248 m)
- th-007 "Rock Domain Climbing Gym" [g-60397509dc] reviewed_against must include: seed-1695
  - importer-probable-duplicate: seed-1695 same-name-but-pin-differs 4516 m
  - name-match: seed-1695 "Rock Domain Climbing Gym": same-name-but-pin-differs ("Rock Domain Climbing Gym" / "Rock Domain Climbing Gym", 4516 m)
- th-009 "Boulder Planet Thailand (Rangsit)" [g-c6bdfc5509]
  - single-source: all evidence comes from one source
- th-011 "Progression Vertical Climbing Gym" [g-0bfa4d9c5f] reviewed_against must include: seed-1698
  - related-name-nearby: seed-1698 "Progression Vertical": related names "Progression Vertical Climbing Gym" / "Progression Vertical" 4245 m apart
- th-012 "REBEL Rock Climbing" [g-b62e09ace5] reviewed_against must include: seed-1700
  - importer-probable-duplicate: seed-1700 same-name-but-pin-differs 4509 m
  - name-match: seed-1700 "Rebel Rock Climbing": same-name-but-pin-differs ("REBEL Rock Climbing" / "Rebel Rock Climbing", 4509 m)

## Blocked: cannot be accepted (4)
- th-008 "Climb Central Bangkok": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- th-010 "Bloc City Climbing Gym": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- th-015 "Ascentory": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- th-016 "No Gravity Indoor Climbing": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (3)
- th-003 "Eagle Eye Climbing Gym" [g-580b85b8e7]
- th-013 "The Bunker Koh Tao" [g-aaf76529ff]
- th-014 "UPSIDE Bouldering Gym" [g-3dc8f21b2b]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-thailand`.
Nothing here touches production.
