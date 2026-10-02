# Regional research: Singapore (Tier A, wave 1) (2026-10-01-singapore)

Scope: SG (whole country)
Index: 2181 gyms, sha256 b72fd3058a81… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
27 candidate(s): ready 7 | review 14 | blocked 5 | already in Bouldeer 1 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (1)
- sg-020 "Ground Up Climbing" -> seed-1731 "Ground Up Climbing" (same-name, 0 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (14)
- sg-001 "Boulder Movement Downtown" [g-f96c32d46b] reviewed_against must include: sg-002, sg-003, sg-004
  - same-website: candidate sg-002 has the same website
  - same-website: candidate sg-003 has the same website
  - same-website: candidate sg-004 has the same website
- sg-002 "Boulder Movement Bugis" [g-9e5903dc39] reviewed_against must include: sg-001, sg-003, sg-004
  - same-website: candidate sg-001 has the same website
  - same-website: candidate sg-003 has the same website
  - same-website: candidate sg-004 has the same website
- sg-003 "Boulder Movement Rochor" [g-cab3d4cd7b] reviewed_against must include: sg-001, sg-002, sg-004
  - same-website: candidate sg-001 has the same website
  - same-website: candidate sg-002 has the same website
  - same-website: candidate sg-004 has the same website
- sg-004 "Boulder Movement Tai Seng" [g-6847f87580] reviewed_against must include: sg-001, sg-002, sg-003, sg-008
  - related-name-nearby: candidate sg-008 "Boulder Planet Tai Seng": related names "Boulder Movement Tai Seng" / "Boulder Planet Tai Seng" 289 m apart
  - same-website: candidate sg-001 has the same website
  - same-website: candidate sg-002 has the same website
  - same-website: candidate sg-003 has the same website
- sg-005 "boulder+ Aperia" [g-ddb52e98da] reviewed_against must include: sg-006
  - same-website: candidate sg-006 has the same website
- sg-006 "boulder+ The Chevrons" [g-07178b23cb] reviewed_against must include: sg-005
  - same-website: candidate sg-005 has the same website
- sg-007 "Boulder Planet Sembawang" [g-d152720a9c] reviewed_against must include: sg-008
  - same-website: candidate sg-008 has the same website
- sg-008 "Boulder Planet Tai Seng" [g-caa551790b] reviewed_against must include: sg-004, sg-007
  - related-name-nearby: candidate sg-004 "Boulder Movement Tai Seng": related names "Boulder Planet Tai Seng" / "Boulder Movement Tai Seng" 289 m apart
  - same-website: candidate sg-007 has the same website
- sg-009 "BFF Climb Bendemeer" [g-e3c22a0dbe] reviewed_against must include: sg-010, sg-011
  - same-website: candidate sg-010 has the same website
  - same-website: candidate sg-011 has the same website
- sg-010 "BFF Climb Tampines Hub" [g-d3aa4eb39d] reviewed_against must include: sg-009, sg-011
  - related-name-nearby: candidate sg-011 "BFF Climb Tampines Yoha": related names "BFF Climb Tampines Hub" / "BFF Climb Tampines Yoha" 1144 m apart
  - same-website: candidate sg-009 has the same website
  - same-website: candidate sg-011 has the same website
- sg-011 "BFF Climb Tampines Yoha" [g-3c144dfa48] reviewed_against must include: sg-009, sg-010
  - related-name-nearby: candidate sg-010 "BFF Climb Tampines Hub": related names "BFF Climb Tampines Yoha" / "BFF Climb Tampines Hub" 1144 m apart
  - same-website: candidate sg-009 has the same website
  - same-website: candidate sg-010 has the same website
- sg-012 "fit · bloc Kent Ridge" [g-f38f20d8c0] reviewed_against must include: sg-013, sg-014
  - same-website: candidate sg-013 has the same website
  - same-website: candidate sg-014 has the same website
- sg-013 "fit · bloc Depot Heights" [g-0d06c06c2d] reviewed_against must include: sg-012, sg-014
  - same-website: candidate sg-012 has the same website
  - same-website: candidate sg-014 has the same website
- sg-014 "fit · bloc Telok Ayer" [g-e8f3a38dae] reviewed_against must include: sg-012, sg-013
  - same-website: candidate sg-012 has the same website
  - same-website: candidate sg-013 has the same website
  - single-source: all evidence comes from one source

## Blocked: cannot be accepted (5)
- sg-015 "Climb Central The Kallang": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- sg-016 "Climb Central Funan": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- sg-017 "Climb Central Novena": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- sg-018 "Climb Central SAFRA Choa Chu Kang": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- sg-027 "Ark Bloc": not-a-gym (category other) -> suggested: reject not-a-gym

## Ready (no flags; still needs an explicit accept) (7)
- sg-019 "Kinetics Climbing" [g-063336c756]
- sg-021 "Outpost Climbing" [g-86c0d65638]
- sg-022 "Lighthouse Climbing" [g-f49056682b]
- sg-023 "OYEYO Boulder Home" [g-ba470b7297]
- sg-024 "Z-Vertigo Boulder Gym" [g-935c535d0d]
- sg-025 "Climba" [g-6f2fb86cf4]
- sg-026 "Project Send" [g-f230eccf5d]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-singapore`.
Nothing here touches production.
