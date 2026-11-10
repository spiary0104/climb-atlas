# Regional research: USA: New York and Boston metros (2026-10-13-us-ny-boston-metros)

Scope: US (whole country) / bbox -74.9,40.3,-70.4,42.7
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-10-06-us-midwest, 2026-10-06-us-northeast, 2026-10-06-us-south, 2026-10-06-us-west
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
8 candidate(s): ready 5 | review 1 | blocked 2 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- goat-hackensack "GOAT Climbing Gym" [g-05364e73e0] reviewed_against must include: 2026-10-06-us-northeast#goat-hackensack
  - other-section: 2026-10-06-us-northeast#goat-hackensack "GOAT Climbing Gym": name-match same-name ("GOAT Climbing Gym" / "GOAT Climbing Gym", 0 m)

## Blocked: cannot be accepted (2)
- everyday-athlete-brooklyn-heights "Everyday Athlete": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- la-vida-wenham "La Vida Rock Gym (Gordon College)": coarse-coordinates (coordinates only locate the area, not the gym) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (5)
- boulder-union-new-bedford "Boulder Union Climbing and Fitness" [g-4215c8d0a9]
- challenge-rocks-hingham "Challenge Rocks" [g-a8270660d0]
- gv-westbury "The Gravity Vault Westbury" [g-9a06308527]
- metrorock-tyngsborough "MetroRock Tyngsborough" [g-9a7e582e35]
- rocksteady-setauket "Rocksteady Climbing" [g-3ba2c7540c]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-13-us-ny-boston-metros`.
Nothing here touches production.
