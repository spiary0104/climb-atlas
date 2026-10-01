# Regional research: India (Tier A, wave 1) (2026-10-01-india)

Scope: IN (whole country)
Index: 2127 gyms, sha256 8dbddf7924c2… | staged batches compared: none | other sections compared: 2026-09-30-new-zealand, 2026-10-01-indonesia, 2026-10-01-israel, 2026-10-01-russia, 2026-10-01-singapore, 2026-10-01-sweden, 2026-10-01-switzerland, 2026-10-01-thailand, 2026-10-01-turkey
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
16 candidate(s): ready 5 | review 11 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (11)
- in-002 "Climb Central Gurugram" [g-7e12eb91e7]
  - single-source: all evidence comes from one source
- in-003 "Climb Central Bengaluru" [g-299c332855]
  - single-source: all evidence comes from one source
- in-004 "Equilibrium Climbing Station Hoodi" [g-d827f3e940] reviewed_against must include: in-005
  - related-name-nearby: candidate in-005 "Equilibrium Climbing Station Indiranagar": related names "Equilibrium Climbing Station Hoodi" / "Equilibrium Climbing Station Indiranagar" 7954 m apart
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- in-005 "Equilibrium Climbing Station Indiranagar" [g-d57520749c] reviewed_against must include: in-004
  - related-name-nearby: candidate in-004 "Equilibrium Climbing Station Hoodi": related names "Equilibrium Climbing Station Indiranagar" / "Equilibrium Climbing Station Hoodi" 7954 m apart
- in-009 "The Indian Bouldering Company" [g-5c6fd7a6fe]
  - single-source: all evidence comes from one source
- in-010 "Crag Studio Gachibowli" [g-22d0ebab33] reviewed_against must include: in-011, seed-1583
  - related-name-nearby: seed-1583 "Crag Studio": related names "Crag Studio Gachibowli" / "Crag Studio" 1266 m apart
  - same-website: candidate in-011 has the same website
- in-011 "Crag Studio Mettuguda" [g-cf5ecdc4f5] reviewed_against must include: in-010
  - same-website: candidate in-010 has the same website
  - single-source: all evidence comes from one source
- in-013 "Rock Aliens Climbing Gym" [g-25387cc2b8]
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- in-014 "SMJV Bouldering & Climbing Wall (GGIM)" [g-cbcac1e2ef]
  - single-source: all evidence comes from one source
- in-015 "Climb City" [g-00f5d7e842]
  - single-source: all evidence comes from one source
- in-016 "Boulder 21" [g-a8c3eb6e21]
  - limited-access: club wall: check it is open to the public

## Ready (no flags; still needs an explicit accept) (5)
- in-001 "BoulderBox" [g-9c8462fb55]
- in-006 "Equilibrium Climbing Station Goa" [g-49d85354ad]
- in-007 "Elevate - The Climbing Company" [g-81ca61a539]
- in-008 "Bangalore Boulder" [g-27231b7a9a]
- in-012 "Fit Rock Arena Chetpet" [g-974370b036]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-india`.
Nothing here touches production.
