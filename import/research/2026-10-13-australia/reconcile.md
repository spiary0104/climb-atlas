# Regional research: Australia: city coverage gap (2026-10-13-australia)

Scope: AU (whole country)
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
47 candidate(s): ready 12 | review 19 | blocked 8 | already in Bouldeer 8 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (8)
- au-9d-alexandria "9 Degrees Alexandria" -> seed-0 "9 Degrees Alexandria" (same-address-related-name, 1679 m)
- au-9d-lane-cove "9 Degrees Lane Cove" -> seed-1 "9 Degrees Lane Cove" (same-name, 354 m)
- au-blochaus-fyshwick "BlocHaus Bouldering Canberra" -> seed-29 "BlocHaus Bouldering Canberra" (same-name, 230 m)
- au-cliffhanger-altona-north "Cliffhanger Climbing Gym" -> seed-43 "Cliffhanger Climbing Gym" (same-name, 337 m) | also: no-bouldering-evidence
- au-climbfit-st-leonards "Climb Fit St Leonards" -> seed-8 "Climb Fit St Leonards" (same-name, 253 m)
- au-edge-castle-hill "The Edge Rock Climbing Centre" -> seed-12 "The Edge Rock Climbing Centre" (same-name, 488 m)
- au-elevate-villawood "Elevate Climbing Villawood" -> seed-7 "Elevate Climbing Villawood" (same-name, 428 m)
- au-sicg-st-peters "Sydney Indoor Climbing Gym St Peters" -> seed-6 "Sydney Indoor Climbing Gym – St Peters" (same-name, 578 m) | also: no-bouldering-evidence

## Needs review (accept needs a reason and reviewed_against covering every listed id) (19)
- au-9d-chatswood "9 Degrees Chatswood" [g-f7aa31ce25] reviewed_against must include: au-9d-alexandria, au-9d-enoggera, au-9d-lane-cove, au-9d-morningside, seed-0, seed-3
  - related-name-nearby: candidate au-9d-alexandria "9 Degrees Alexandria": related names "9 Degrees Chatswood" / "9 Degrees Alexandria" 14891 m apart
  - related-name-nearby: seed-0 "9 Degrees Alexandria": related names "9 Degrees Chatswood" / "9 Degrees Alexandria" 13267 m apart
  - related-name-nearby: seed-3 "9 Degrees Waterloo": related names "9 Degrees Chatswood" / "9 Degrees Waterloo" 12639 m apart
  - same-website: candidate au-9d-alexandria has the same website
  - same-website: candidate au-9d-enoggera has the same website
  - same-website: candidate au-9d-lane-cove has the same website
  - same-website: candidate au-9d-morningside has the same website
- au-9d-enoggera "9 Degrees Bouldering Enoggera" [g-a032b4ddfa] reviewed_against must include: au-9d-alexandria, au-9d-chatswood, au-9d-lane-cove, au-9d-morningside, seed-45
  - related-name-nearby: candidate au-9d-morningside "9 Degrees Morningside": related names "9 Degrees Bouldering Enoggera" / "9 Degrees Morningside" 9953 m apart
  - related-name-nearby: seed-45 "9 Degrees Bouldering": related names "9 Degrees Bouldering Enoggera" / "9 Degrees Bouldering" 306 m apart
  - same-website: candidate au-9d-alexandria has the same website
  - same-website: candidate au-9d-chatswood has the same website
  - same-website: candidate au-9d-lane-cove has the same website
  - same-website: candidate au-9d-morningside has the same website
- au-9d-morningside "9 Degrees Morningside" [g-8b059b0d5f] reviewed_against must include: au-9d-alexandria, au-9d-chatswood, au-9d-enoggera, au-9d-lane-cove, seed-45
  - related-name-nearby: candidate au-9d-enoggera "9 Degrees Bouldering Enoggera": related names "9 Degrees Morningside" / "9 Degrees Bouldering Enoggera" 9953 m apart
  - related-name-nearby: seed-45 "9 Degrees Bouldering": related names "9 Degrees Morningside" / "9 Degrees Bouldering" 10256 m apart
  - same-website: candidate au-9d-alexandria has the same website
  - same-website: candidate au-9d-chatswood has the same website
  - same-website: candidate au-9d-enoggera has the same website
  - same-website: candidate au-9d-lane-cove has the same website
- au-alpine-currumbin "Alpine Indoor Climbing Currumbin" [g-aed46bfd1f] reviewed_against must include: seed-53
  - related-name-nearby: seed-53 "Alpine Indoor Climbing": related names "Alpine Indoor Climbing Currumbin" / "Alpine Indoor Climbing" 11375 m apart
- au-beyond-bouldering-thebarton "Beyond Bouldering Thebarton" [g-9ed1081190] reviewed_against must include: seed-67, seed-68
  - related-name-nearby: seed-67 "Beyond Bouldering": related names "Beyond Bouldering Thebarton" / "Beyond Bouldering" 4287 m apart
  - related-name-nearby: seed-68 "Beyond Bouldering": related names "Beyond Bouldering Thebarton" / "Beyond Bouldering" 3285 m apart
  - single-source: all evidence comes from one source
- au-boulder-lab-brunswick "Boulder Lab Brunswick" [g-68345668f5] reviewed_against must include: au-boulder-lab-clayton-south, au-boulder-lab-ferntree-gully
  - same-website: candidate au-boulder-lab-clayton-south has the same website
  - same-website: candidate au-boulder-lab-ferntree-gully has the same website
- au-boulder-lab-clayton-south "Boulder Lab Clayton South" [g-6bcdf294bb] reviewed_against must include: au-boulder-lab-brunswick, au-boulder-lab-ferntree-gully
  - same-website: candidate au-boulder-lab-brunswick has the same website
  - same-website: candidate au-boulder-lab-ferntree-gully has the same website
- au-boulder-lab-ferntree-gully "Boulder Lab Ferntree Gully" [g-69f61e2832] reviewed_against must include: au-boulder-lab-brunswick, au-boulder-lab-clayton-south
  - same-website: candidate au-boulder-lab-brunswick has the same website
  - same-website: candidate au-boulder-lab-clayton-south has the same website
- au-gecko-climb-darwin "Gecko Climb" [g-2b85808c1a]
  - importer-warning: far-from-country: nearest known AU gym is 1660 km away -- check coordinates/country
- au-nomad-annandale "NOMAD Bouldering Annandale" [g-cb0d9cf9c5] reviewed_against must include: au-nomad-gladesville, seed-4
  - related-name-nearby: seed-4 "NOMAD Bouldering": related names "NOMAD Bouldering Annandale" / "NOMAD Bouldering" 396 m apart
  - same-website: candidate au-nomad-gladesville has the same website
- au-nomad-gladesville "NOMAD Bouldering Gladesville" [g-24d9659607] reviewed_against must include: au-nomad-annandale, seed-4, seed-5
  - importer-probable-duplicate: seed-5 same-name-but-pin-differs 1143 m
  - name-match: seed-5 "NOMAD Bouldering Gladesville": same-name-but-pin-differs ("NOMAD Bouldering Gladesville" / "NOMAD Bouldering Gladesville", 1143 m)
  - related-name-nearby: seed-4 "NOMAD Bouldering": related names "NOMAD Bouldering Gladesville" / "NOMAD Bouldering" 8150 m apart
  - same-website: candidate au-nomad-annandale has the same website
- au-northside-abbotsford "Northside Boulders Abbotsford" [g-d0b029f9cb] reviewed_against must include: seed-35, seed-36
  - related-name-nearby: seed-35 "Northside Boulders": related names "Northside Boulders Abbotsford" / "Northside Boulders" 4865 m apart
  - related-name-nearby: seed-36 "Northside Boulders": related names "Northside Boulders Abbotsford" / "Northside Boulders" 3560 m apart
- au-portside-joondalup "Portside Boulders Joondalup" [g-ed75d33d82] reviewed_against must include: au-portside-willetton
  - same-website: candidate au-portside-willetton has the same website
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- au-portside-willetton "Portside Boulders Willetton" [g-ab649f812b] reviewed_against must include: au-portside-joondalup, seed-61
  - related-name-nearby: seed-61 "Portside Boulders": related names "Portside Boulders Willetton" / "Portside Boulders" 9725 m apart
  - same-website: candidate au-portside-joondalup has the same website
- au-pulse-adamstown "Pulse Climbing Adamstown" [g-2ede6ba2bf] reviewed_against must include: seed-23
  - related-name-nearby: seed-23 "Pulse Climbing": related names "Pulse Climbing Adamstown" / "Pulse Climbing" 6233 m apart
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- au-rockit-derwent-park "Rock It Derwent Park" [g-19a0e2d570] reviewed_against must include: seed-73
  - related-name-nearby: seed-73 "Rock It Climbing Centre": related names "Rock It Derwent Park" / "Rock It Climbing Centre" 5820 m apart
  - single-source: all evidence comes from one source
- au-the-hold-bendigo "The Hold Bendigo" [g-2695ea3daa]
  - single-source: all evidence comes from one source
- au-urban-climb-west-end "Urban Climb West End" [g-cc50127703] reviewed_against must include: seed-48
  - importer-probable-duplicate: seed-48 same-name-but-pin-differs 1525 m
  - name-match: seed-48 "Urban Climb West End": same-name-but-pin-differs ("Urban Climb West End" / "Urban Climb West End", 1525 m)
- au-wall-walkers-capalaba "Wall Walkers Bouldering" [g-f881cbcfbb]
  - single-source: all evidence comes from one source

## Blocked: cannot be accepted (8)
- au-activate-hardrock-heatherton "Activate by Hardrock (Clip n Climb Heatherton)": no-bouldering (confirmed rope-only (new additions need a bouldering offering)) -> suggested: reject no-bouldering
- au-albury-indoor-rock-climbing "Albury Indoor Rock Climbing": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- au-camp-street-katoomba "Camp Street Climbing": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- au-clipnclimb-berwick "Clip 'n Climb Berwick": no-bouldering (confirmed rope-only (new additions need a bouldering offering)) -> suggested: reject no-bouldering
- au-clipnclimb-williamstown "Clip 'n Climb Williamstown": no-bouldering (confirmed rope-only (new additions need a bouldering offering)) -> suggested: reject no-bouldering
- au-flow-bouldering-forest-glen "Flow Bouldering": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- au-friction-bouldering-delacombe "Friction Bouldering": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer
- au-mandurah-indoor-rock-climbing "Mandurah Indoor Rock Climbing": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (12)
- au-adrenaline-vault-cockburn "Adrenaline Vault Cockburn" [g-03802d1aff]
- au-buffalo-boulders-myrtleford "Buffalo Boulders" [g-c7b3a9fb57]
- au-climb-west-altona "Climb West Melbourne" [g-bda97e516f]
- au-crux-coburg-north "The Crux" [g-daa4827f2e]
- au-cutloose-upper-coomera "Cutloose Indoor Climbing" [g-1e29dae7a9]
- au-flow-climbing-cheltenham "Flow Climbing" [g-67b4a1edee]
- au-industry-boulders-grovedale "Industry Boulders" [g-9ef74d79e9]
- au-laneway-boulders-stepney "Laneway Boulders" [g-856872334e]
- au-pulse-gosford "Pulse Climbing Gosford" [g-1f3e61433b]
- au-pulse-maitland "Pulse Climbing Maitland" [g-93f1c3eee7]
- au-urban-climb-adelaide "Urban Climb Adelaide" [g-828aff2eeb]
- au-urban-climb-townsville "Urban Climb Townsville" [g-82a080d0e6]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-13-australia`.
Nothing here touches production.
