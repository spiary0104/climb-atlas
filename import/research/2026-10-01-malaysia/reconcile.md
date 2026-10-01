# Regional research: Malaysia (Tier B, wave 2) (2026-10-01-malaysia)

Scope: MY (whole country)
Index: 2127 gyms, sha256 8dbddf7924c2… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
14 candidate(s): ready 3 | review 8 | blocked 3 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (8)
- my-001 "Camp5 1Utama" [g-f1f37e170b] reviewed_against must include: my-002, my-003
  - related-name-nearby: candidate my-002 "Camp5 KL Eco City": related names "Camp5 Climbing Gym" / "Camp5 KL Eco City" 7253 m apart
  - related-name-nearby: candidate my-003 "Camp5 Jumpa": related names "Camp5 Climbing Gym" / "Camp5 Jumpa" 10509 m apart
- my-002 "Camp5 KL Eco City" [g-848aaca6f8] reviewed_against must include: my-001
  - related-name-nearby: candidate my-001 "Camp5 1Utama": related names "Camp5 KL Eco City" / "Camp5 Climbing Gym" 7253 m apart
- my-003 "Camp5 Jumpa" [g-955c407d0e] reviewed_against must include: my-001
  - related-name-nearby: candidate my-001 "Camp5 1Utama": related names "Camp5 Jumpa" / "Camp5 Climbing Gym" 10509 m apart
- my-004 "BUMP Bouldering Jaya One" [g-0bd5ff032d] reviewed_against must include: seed-1693
  - importer-probable-duplicate: seed-1693 renamed-or-related-name-nearby 48 m
  - name-match: seed-1693 "Bump Bouldering": renamed-or-related-name-nearby ("BUMP Bouldering Jaya One" / "Bump Bouldering", 48 m)
- my-005 "BUMP Bouldering Pavilion Bukit Jalil" [g-2db5533538] reviewed_against must include: seed-1693
  - related-name-nearby: seed-1693 "Bump Bouldering": related names "BUMP Bouldering Pavilion Bukit Jalil" / "Bump Bouldering" 8451 m apart
  - single-source: all evidence comes from one source
- my-006 "Bhub Bouldering" [g-346ab53621]
  - single-source: all evidence comes from one source
- my-008 "Project Rock IKEA Batu Kawan" [g-83fd4cfc09] reviewed_against must include: seed-1689
  - related-name-nearby: seed-1689 "Project Rock": related names "Project Rock IKEA Batu Kawan" / "Project Rock" 268 m apart
- my-010 "Klimbzone" [g-786d562102]
  - single-source: all evidence comes from one source

## Blocked: cannot be accepted (3)
- my-012 "PAMPA Rock Climbing": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- my-013 "Sabah Indoor Climbing Centre": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- my-014 "Kompleks Sukan Mendaki Putrajaya": not-a-gym (category other); status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: reject not-a-gym

## Ready (no flags; still needs an explicit accept) (3)
- my-007 "Project Rock Gurney Plaza" [g-549e82de6d]
- my-009 "Project Rock Bayana Hub" [g-1e337682cf]
- my-011 "Bolder Ventures Climbing Gym" [g-4bc446acee]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-malaysia`.
Nothing here touches production.
