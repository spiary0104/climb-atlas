# Regional research: UK: regional cities coverage gap (2026-10-13-uk-cities)

Scope: GB (whole country)
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-10-05-uk-holds-gaps, 2026-10-05-uk-owner-checks, 2026-10-05-uk-single-gym-towns, 2026-10-06-london
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
30 candidate(s): ready 15 | review 8 | blocked 6 | already in Bouldeer 1 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (1)
- boulder-world-belfast "Boulder World Belfast" -> seed-958 "Boulder World Belfast" (same-name, 436 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (8)
- birmingham-bouldering-centre "Birmingham Bouldering Centre" [g-4f4476f87f] reviewed_against must include: redpoint-birmingham, seed-918
  - related-name-nearby: candidate redpoint-birmingham "Redpoint Climbing Centre Birmingham": related names "Birmingham Bouldering Centre" / "Redpoint Climbing Centre Birmingham" 567 m apart
  - related-name-nearby: seed-918 "Depot Climbing Birmingham": related names "Birmingham Bouldering Centre" / "Depot Climbing Birmingham" 1727 m apart
- boulders-cardiff "Boulders Newport Road (Cardiff)" [g-ace6844f69] reviewed_against must include: flashpoint-cardiff
  - related-name-nearby: candidate flashpoint-cardiff "Flashpoint Cardiff": related names "Boulders Cardiff" / "Flashpoint Cardiff" 5231 m apart
- flashpoint-bristol-easton "Flashpoint Bristol - Easton" [g-5f969ec7fc] reviewed_against must include: seed-870
  - related-name-nearby: seed-870 "Flashpoint Bristol": related names "Flashpoint Bristol - Easton" / "Flashpoint Bristol" 2658 m apart
- flashpoint-cardiff "Flashpoint Cardiff" [g-07d957a8e0] reviewed_against must include: boulders-cardiff
  - related-name-nearby: candidate boulders-cardiff "Boulders Newport Road (Cardiff)": related names "Flashpoint Cardiff" / "Boulders Cardiff" 5231 m apart
- rainbow-rocket-central-cambridge "Rainbow Rocket Central" [g-aa57148142] reviewed_against must include: seed-927
  - related-name-nearby: seed-927 "Rainbow Rocket North": related names "Rainbow Rocket Central" / "Rainbow Rocket North" 2907 m apart
- redpoint-birmingham "Redpoint Climbing Centre Birmingham" [g-e0e63ea28b] reviewed_against must include: birmingham-bouldering-centre
  - related-name-nearby: candidate birmingham-bouldering-centre "Birmingham Bouldering Centre": related names "Redpoint Climbing Centre Birmingham" / "Birmingham Bouldering Centre" 567 m apart
- rock-over-bolton "Rock Over Climbing Bolton" [g-d5fc9f4865] reviewed_against must include: rock-over-sharston
  - same-website: candidate rock-over-sharston has the same website
- rock-over-sharston "Rock Over Climbing Sharston" [g-748fb420d6] reviewed_against must include: rock-over-bolton, seed-915
  - related-name-nearby: seed-915 "Rock Over Climbing": related names "Rock Over Climbing Sharston" / "Rock Over Climbing" 10515 m apart
  - same-website: candidate rock-over-bolton has the same website

## Blocked: cannot be accepted (6)
- barn-climbing-wall-tavistock "The Barn Climbing Wall": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- boatyard-boulders-nottingham "Boatyard Boulders": not-a-gym (category other) -> suggested: reject not-a-gym
- climb-rochdale "Climb Rochdale": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- parthian-manchester "Parthian Climbing Manchester": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: reject closed
- quay-climbing-centre-exeter "Quay Climbing Centre": not-a-gym (category other); status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: reject not-a-gym
- social-climbing-leicester "Social Climbing Leicester": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (15)
- 270-climbing-gloucester "270 Climbing Park" [g-b6878ffb88]
- alter-rock-derby "Alter Rock Climbing Centre" [g-d0f7bc3292]
- awesome-walls-stockport "Awesome Walls Stockport" [g-5bb84dd833]
- awesome-walls-stoke "Awesome Walls Stoke" [g-3b95a00c44]
- boathouse-climbing-llandudno "Boathouse Climbing Centre" [g-cad50368cb]
- boulder-barn-hereford "The Boulder Barn" [g-88189f6154]
- boulder-brighton "Boulder Brighton" [g-61ca434f8b]
- climbing-hangar-bristol "The Climbing Hangar Bristol" [g-cea9c9bac7]
- climbing-unit-derby "The Climbing Unit" [g-92ad6c6ce5]
- friction-bouldering-gateshead "Friction Bouldering" [g-d4eb37b5bb]
- gallery-bouldering-oxford "Gallery Bouldering" [g-e4b7038738]
- kendalwall "KendalWall (Lakeland Climbing Centre Kendal)" [g-5df6ee668e]
- last-sun-dance-leeds "Last Sun Dance" [g-06a93f3fac]
- redpoint-worcester "Redpoint Worcester" [g-d114642968]
- summit-up-oldham "Summit Up Climbing Centre" [g-412a34cb08]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-13-uk-cities`.
Nothing here touches production.
