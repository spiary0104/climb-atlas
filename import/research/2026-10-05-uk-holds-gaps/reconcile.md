# Regional research: UK: gyms on hold + gaps (second pass) (2026-10-05-uk-holds-gaps)

Scope: GB (whole country)
Index: 2385 gyms, sha256 e1d9ef5216f8… | staged batches compared: none | other sections compared: 2026-10-05-uk-single-gym-towns
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
29 candidate(s): ready 5 | review 15 | blocked 4 | already in Bouldeer 5 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (5)
- beacon-caernarfon "Beacon Climbing Centre" -> seed-951 "Beacon Climbing Centre" (same-name, 0 m)
- climb-kent-maidstone "Climb Kent" -> seed-933 "Climb Kent" (same-name, 187 m)
- climbing-experience-maidstone "The Climbing Experience" -> seed-893 "The Climbing Experience" (same-name, 853 m)
- indy-climbing-wall "Indy Climbing Wall" -> seed-953 "INDY Climbing Wall" (same-name, 149 m)
- rhino-boulder-bromley "Rhino Boulder" -> seed-885 "Rhino Boulder" (same-name, 87 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (15)
- arc-chippenham "The Arc" [g-1d224ac512]
  - single-source: all evidence comes from one source
- avid-ipswich "AVID Climbing" [g-4ab9b915c3] reviewed_against must include: 2026-10-05-uk-single-gym-towns#avid-ipswich
  - other-section: 2026-10-05-uk-single-gym-towns#avid-ipswich "Avid Climbing": name-match same-name ("AVID Climbing" / "Avid Climbing", 0 m)
- blue-spider-guildford "Blue Spider" [g-d651f290ca] reviewed_against must include: seed-866
  - importer-probable-duplicate: seed-866 renamed-or-related-name-nearby 0 m
  - name-match: seed-866 "Blue Spider Climbing": renamed-or-related-name-nearby ("Blue Spider" / "Blue Spider Climbing", 0 m)
- boulderryn-penryn "BoulderRyn" [g-0e0952ce1c]
  - single-source: all evidence comes from one source
- climbing-station-loughborough "The Climbing Station" [g-f964aba515]
  - single-source: all evidence comes from one source
- dyno-buckfastleigh "Dyno Climbing Centre" [g-202afa086a]
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- keswick-climbing-wall "Keswick Climbing Wall" [g-3dd3441c21] reviewed_against must include: 2026-10-05-uk-single-gym-towns#keswick-climbing-wall, kong-keswick
  - other-section: 2026-10-05-uk-single-gym-towns#keswick-climbing-wall "Keswick Climbing Wall": name-match same-name ("Keswick Climbing Wall" / "Keswick Climbing Wall", 3 m)
  - related-name-nearby: candidate kong-keswick "Kong Adventure Centre": related names "Keswick Climbing Wall" / "Kong Keswick" 2920 m apart
- kong-keswick "Kong Adventure Centre" [g-08845e976a] reviewed_against must include: 2026-10-05-uk-single-gym-towns#keswick-climbing-wall, keswick-climbing-wall
  - other-section: 2026-10-05-uk-single-gym-towns#keswick-climbing-wall "Keswick Climbing Wall": related-name-nearby related names "Kong Keswick" / "Keswick Climbing Wall" 2919 m apart
  - related-name-nearby: candidate keswick-climbing-wall "Keswick Climbing Wall": related names "Kong Keswick" / "Keswick Climbing Wall" 2920 m apart
- lancaster-wall "LancasterWall" [g-b8639826ea] reviewed_against must include: 2026-10-05-uk-single-gym-towns#lancaster-wall
  - other-section: 2026-10-05-uk-single-gym-towns#lancaster-wall "Lancaster Wall": name-match renamed-or-related-name-nearby ("LancasterWall" / "Lancaster Wall", 0 m)
- live-for-today-harrogate "Live For Today Climbing Centre" [g-b629c9fba5] reviewed_against must include: seed-878
  - importer-probable-duplicate: seed-878 same-name-but-pin-differs 1937 m
  - name-match: seed-878 "Live For Today Climbing Centre (Formerly Parthian Harrogate)": same-name-but-pin-differs ("Live For Today Climbing Centre" / "Live For Today Climbing Centre (Formerly Parthian Harrogate)", 1937 m)
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- mad-volume-hull "Mad Volume" [g-19829aff2a]
  - single-source: all evidence comes from one source
- northwest-face-warrington "The Northwest Face" [g-a8ed00161d]
  - single-source: all evidence comes from one source
- peak-climbing-wall-leek "The Peak Climbing Wall" [g-e44595a7e9]
  - single-source: all evidence comes from one source
- sunderland-wall "Sunderland Wall" [g-1e3663e189] reviewed_against must include: 2026-10-05-uk-single-gym-towns#sunderland-wall
  - other-section: 2026-10-05-uk-single-gym-towns#sunderland-wall "Sunderland Wall": name-match same-name ("Sunderland Wall" / "Sunderland Wall", 35 m)
- yellow-spider-carshalton "Yellow Spider" [g-d8019fc80a]
  - single-source: all evidence comes from one source

## Blocked: cannot be accepted (4)
- adventure-hub-bamford "The Adventure Hub": coarse-coordinates (coordinates only locate the area, not the gym) -> suggested: defer
- northern-problems-whitehaven "Northern Problems": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ridge-marple "The Ridge Climbing Centre": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); coarse-coordinates (coordinates only locate the area, not the gym) -> suggested: reject closed
- street-rocks-scarborough "Street Rocks": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); coarse-coordinates (coordinates only locate the area, not the gym) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (5)
- cragg-stowmarket "The Cragg Climbing Wall" [g-ac94fa456f]
- green-spider-hereford "Green Spider" [g-66083cf9e6]
- indirock-southend "IndiRock" [g-25ed1dbdbf]
- red-spider-fareham "Red Spider" [g-fc40b51763]
- white-spider-surbiton "White Spider" [g-7061a1fbb1]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-uk-holds-gaps`.
Nothing here touches production.
