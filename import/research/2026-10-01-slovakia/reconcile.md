# Regional research: Slovakia (Tier C, wave 3A) (2026-10-01-slovakia)

Scope: SK (whole country)
Index: 2127 gyms, sha256 8dbddf7924c2… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
22 candidate(s): ready 8 | review 9 | blocked 4 | already in Bouldeer 1 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (1)
- sk-016 "Ovčín – Boulder & Bistro" -> seed-1712 "Ovčín Boulder & Bistro" (same-name, 479 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (9)
- sk-001 "Block Dock Rača" [g-3af412946f] reviewed_against must include: seed-1708, sk-002
  - importer-probable-duplicate: seed-1708 renamed-or-related-name-nearby 40 m
  - name-match: seed-1708 "Block Dock": renamed-or-related-name-nearby ("Block Dock Rača" / "Block Dock", 40 m)
  - related-name-nearby: candidate sk-002 "Block Dock Petržalka": related names "Block Dock Rača" / "Block Dock Petržalka" 10370 m apart
- sk-002 "Block Dock Petržalka" [g-ab860f9c18] reviewed_against must include: seed-1708, sk-001
  - related-name-nearby: seed-1708 "Block Dock": related names "Block Dock Petržalka" / "Block Dock" 10344 m apart
  - related-name-nearby: candidate sk-001 "Block Dock Rača": related names "Block Dock Petržalka" / "Block Dock Rača" 10370 m apart
- sk-003 "Spot Climbing Gym" [g-8db1852f11] reviewed_against must include: sk-004, sk-006
  - related-name-nearby: candidate sk-004 "Fanatix": related names "Spot lezecká stena" / "Fanatix lezecká stena" 11613 m apart
  - related-name-nearby: candidate sk-006 "Lezecká stena K2 Bratislava": related names "Spot lezecká stena" / "Lezecká stena K2" 14139 m apart
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- sk-004 "Fanatix" [g-daec33ffb4] reviewed_against must include: sk-003, sk-006
  - related-name-nearby: candidate sk-003 "Spot Climbing Gym": related names "Fanatix lezecká stena" / "Spot lezecká stena" 11613 m apart
  - related-name-nearby: candidate sk-006 "Lezecká stena K2 Bratislava": related names "Fanatix lezecká stena" / "Lezecká stena K2" 5204 m apart
  - single-source: all evidence comes from one source
- sk-005 "Vertigo Lezecké centrum" [g-b75ce99214] reviewed_against must include: seed-1709
  - importer-probable-duplicate: seed-1709 renamed-or-related-name-nearby 20 m
  - name-match: seed-1709 "Vertigo": renamed-or-related-name-nearby ("Vertigo Lezecké centrum" / "Vertigo", 20 m)
- sk-006 "Lezecká stena K2 Bratislava" [g-b3dbddb113] reviewed_against must include: sk-003, sk-004
  - related-name-nearby: candidate sk-003 "Spot Climbing Gym": related names "Lezecká stena K2" / "Spot lezecká stena" 14139 m apart
  - related-name-nearby: candidate sk-004 "Fanatix": related names "Lezecká stena K2" / "Fanatix lezecká stena" 5204 m apart
- sk-007 "Lezecká stena K2 Žilina" [g-0fe68a0fd3] reviewed_against must include: seed-1711
  - importer-probable-duplicate: seed-1711 renamed-or-related-name-nearby 6 m
  - name-match: seed-1711 "K2-Zilina Bouldering Climbing Gym": renamed-or-related-name-nearby ("Lezecká stena K2 Žilina" / "K2-Zilina Bouldering Climbing Gym", 6 m)
- sk-011 "Lezecká stena Rozlomity" [g-c878c90a17] reviewed_against must include: sk-013
  - related-name-nearby: candidate sk-013 "Steam Factory Košice – lezecká stena": related names "Lezecká stena Košice" / "Steam Factory Košice – lezecká stena" 5030 m apart
- sk-013 "Steam Factory Košice – lezecká stena" [g-51644a3953] reviewed_against must include: sk-011
  - related-name-nearby: candidate sk-011 "Lezecká stena Rozlomity": related names "Steam Factory Košice – lezecká stena" / "Lezecká stena Košice" 5030 m apart
  - single-source: all evidence comes from one source

## Blocked: cannot be accepted (4)
- sk-014 "WoodRock": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- sk-015 "Stienka": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- sk-020 "Lezecké centrum Trenčín": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- sk-022 "Športová hala Malina – lezecká stena": not-a-gym (category other); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: reject not-a-gym

## Ready (no flags; still needs an explicit accept) (8)
- sk-008 "LA SKALA Lezecké centrum Žilina" [g-7fcf690088]
- sk-009 "LOZILLA" [g-025610eaf1]
- sk-010 "Brutalka Zvolen" [g-327876a322]
- sk-012 "T2 Boulder Arena" [g-c67af9fe1f]
- sk-017 "WallHalla" [g-8377fc0297]
- sk-018 "BouldroFka Trnava" [g-7dbc7ac92b]
- sk-019 "PRALEZ" [g-3673d98980]
- sk-021 "Bouldrovka Prešov (BOULDERFIT)" [g-560fdbdd8f]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-slovakia`.
Nothing here touches production.
