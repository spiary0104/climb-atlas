# Regional research: Indonesia (Tier A, wave 1) (2026-10-01-indonesia)

Scope: ID (whole country)
Index: 2130 gyms, sha256 c8521eb1c1ca… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
9 candidate(s): ready 0 | review 7 | blocked 2 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (7)
- id-001 "Boulder Planet Indonesia" [g-f9181ea448]
  - single-source: all evidence comes from one source
- id-002 "Indoclimb FX Sudirman" [g-7c8c2678c1] reviewed_against must include: id-003, id-004
  - same-website: candidate id-003 has the same website
  - same-website: candidate id-004 has the same website
  - single-source: all evidence comes from one source
- id-003 "Indoclimb Kuningan City" [g-c067efb2d5] reviewed_against must include: id-002, id-004
  - same-website: candidate id-002 has the same website
  - same-website: candidate id-004 has the same website
  - single-source: all evidence comes from one source
- id-004 "Indoclimb Lippo Mall Kemang" [g-d8d207d948] reviewed_against must include: id-002, id-003
  - same-website: candidate id-002 has the same website
  - same-website: candidate id-003 has the same website
  - single-source: all evidence comes from one source
- id-005 "Dreamstone Boulders Alam Sutera" [g-62d88a54c8]
  - single-source: all evidence comes from one source
- id-006 "Goodang Bouldering" [g-0097d36f32]
  - single-source: all evidence comes from one source
- id-007 "Bali Boulder" [g-dd2dc74add] reviewed_against must include: id-009
  - related-name-nearby: candidate id-009 "Bali Climbing Bouldering Gym Canggu": related names "Bali Boulder" / "Bali Climbing Bouldering Gym Canggu" 14500 m apart
  - single-source: all evidence comes from one source

## Blocked: cannot be accepted (2)
- id-008 "Boulder Climbing Gym Boxies 123": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- id-009 "Bali Climbing Bouldering Gym Canggu": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-indonesia`.
Nothing here touches production.
