# Regional research: USA: Chicago, Denver/Front Range and Texas metros (2026-10-13-us-central-metros)

Scope: US / IL, CO, TX
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-10-06-us-midwest, 2026-10-06-us-northeast, 2026-10-06-us-south, 2026-10-06-us-west
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
11 candidate(s): ready 5 | review 1 | blocked 3 | already in Bouldeer 2 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (2)
- us-co-s01 "Movement Centennial" -> seed-94 "Movement Centennial" (same-name, 156 m)
- us-tx-s01 "Movement Plano" -> seed-157 "Movement Plano" (same-name, 155 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- us-tx-005 "Crux Climbing Center South Austin" [g-13c6a3645d] reviewed_against must include: seed-141
  - related-name-nearby: seed-141 "Crux Climbing Center": related names "Crux Climbing Center South Austin" / "Crux Climbing Center" 6387 m apart

## Blocked: cannot be accepted (3)
- us-co-d01 "Denver Bouldering Club": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- us-co-d02 "The Campus Climbing and Training": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- us-tx-d01 "Lake Travis Bouldering": status-not-open (status_claim is opening-soon); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (5)
- us-il-001 "First Ascent West Loop" [g-5649d0bd95]
- us-tx-001 "Momentum Memorial" [g-3552a25b4e]
- us-tx-002 "The Blok Climbing Co" [g-83401ef7c6]
- us-tx-003 "Crux Climbing Center Houston" [g-652c2c75bf]
- us-tx-004 "MoCo Bouldering" [g-412805facb]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-13-us-central-metros`.
Nothing here touches production.
