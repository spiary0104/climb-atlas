# Regional research: USA: Los Angeles and San Francisco Bay Area (2026-10-13-us-california-metros)

Scope: US / CA
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-10-06-us-midwest, 2026-10-06-us-northeast, 2026-10-06-us-south, 2026-10-06-us-west
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
8 candidate(s): ready 1 | review 3 | blocked 3 | already in Bouldeer 1 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (1)
- us-ca-boulderdash-ventura "Boulderdash Climbing Ventura" -> seed-324 "Boulderdash Ventura" (same-address-related-name, 0 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (3)
- us-ca-boulderdash-sfv "Boulderdash Climbing San Fernando Valley" [g-9cf5387283] reviewed_against must include: seed-323
  - importer-probable-duplicate: seed-323 co-located 0 m
  - name-match: seed-323 "Boulderdash SFV": co-located ("Boulderdash Climbing San Fernando Valley" / "Boulderdash SFV", 0 m)
- us-ca-boulderdash-thousand-oaks "Boulderdash Climbing Thousand Oaks" [g-e8457c60ad] reviewed_against must include: seed-322
  - related-name-nearby: seed-322 "Boulderdash Indoor Rock Climbing": related names "Boulderdash Climbing Thousand Oaks" / "Boulderdash Indoor Rock Climbing" 3123 m apart
- us-ca-touchstone-team-training-center "Touchstone Team Training Center" [g-4a1cde74ee] reviewed_against must include: seed-352
  - limited-access: club wall: check it is open to the public
  - nearby-gym: seed-352 "Ironworks": 89 m apart

## Blocked: cannot be accepted (3)
- us-ca-aisle-19 "Aisle 19": status-not-open (status_claim is opening-soon); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- us-ca-bladium-rock-wall "Bladium Sports & Fitness Club (Rock Wall and Bouldering Gym)": not-a-gym (category other); status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: reject not-a-gym
- us-ca-desert-rocks "Desert Rocks Indoor Climbing Gym": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (1)
- us-ca-rock-city-climbing "Rock City Climbing" [g-b19ec7f397]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-13-us-california-metros`.
Nothing here touches production.
