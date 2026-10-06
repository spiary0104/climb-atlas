# Regional research: USA: West (states with no Bouldeer coverage) (2026-10-06-us-west)

Scope: US / OR, AZ, NM, ID, MT, WY, HI, AK
Index: 2438 gyms, sha256 27073d25c2df… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
60 candidate(s): ready 36 | review 17 | blocked 7 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (17)
- us-ak-alaska-rock-gym "Alaska Rock Gym" [g-82956e5d0b]
  - importer-warning: far-from-country: nearest known US gym is 2202 km away -- check coordinates/country
- us-ak-ascension-rock-club "Ascension Rock Club" [g-cf85fe4990]
  - importer-warning: far-from-country: nearest known US gym is 2324 km away -- check coordinates/country
- us-az-flagstaff-climbing-downtown-crag "Flagstaff Climbing Downtown Crag" [g-d23a840b02] reviewed_against must include: us-az-flagstaff-climbing-main-street-boulders
  - same-website: candidate us-az-flagstaff-climbing-main-street-boulders has the same website
- us-az-flagstaff-climbing-main-street-boulders "Main Street Boulders" [g-d3fa9a169d] reviewed_against must include: us-az-flagstaff-climbing-downtown-crag
  - same-website: candidate us-az-flagstaff-climbing-downtown-crag has the same website
- us-hi-aloha-rock-gym "Aloha Rock Gym" [g-126ac536c6]
  - importer-warning: far-from-country: nearest known US gym is 3762 km away -- check coordinates/country
- us-hi-big-island-climbing "Big Island Climbing" [g-25479c204a]
  - importer-warning: far-from-country: nearest known US gym is 3732 km away -- check coordinates/country
- us-hi-hiclimb "HiClimb" [g-bc8b938464]
  - importer-warning: far-from-country: nearest known US gym is 3845 km away -- check coordinates/country
- us-hi-oahu-bouldering-gym "Oahu Bouldering Gym" [g-62d3069b55]
  - importer-warning: far-from-country: nearest known US gym is 3847 km away -- check coordinates/country
- us-hi-volcanic-rock-gym "Volcanic Rock Gym" [g-f4264291bf]
  - importer-warning: far-from-country: nearest known US gym is 3829 km away -- check coordinates/country
- us-nm-stone-age-midtown "Stone Age Climbing Gym Midtown" [g-9a43178011] reviewed_against must include: us-nm-stone-age-north
  - related-name-nearby: candidate us-nm-stone-age-north "Stone Age Climbing Gym North": related names "Stone Age Climbing Gym Midtown" / "Stone Age Climbing Gym North" 9037 m apart
- us-nm-stone-age-north "Stone Age Climbing Gym North" [g-db115f8a1b] reviewed_against must include: us-nm-stone-age-midtown
  - related-name-nearby: candidate us-nm-stone-age-midtown "Stone Age Climbing Gym Midtown": related names "Stone Age Climbing Gym North" / "Stone Age Climbing Gym Midtown" 9037 m apart
- us-or-bend-rock-gym "Bend Rock Gym" [g-ca3b730168] reviewed_against must include: us-or-circuit-bend
  - related-name-nearby: candidate us-or-circuit-bend "The Circuit Bouldering Gym Bend": related names "Bend Rock Gym" / "The Circuit Bouldering Gym Bend" 5771 m apart
- us-or-circuit-bend "The Circuit Bouldering Gym Bend" [g-53f77820d1] reviewed_against must include: us-or-bend-rock-gym
  - related-name-nearby: candidate us-or-bend-rock-gym "Bend Rock Gym": related names "The Circuit Bouldering Gym Bend" / "Bend Rock Gym" 5771 m apart
- us-or-crux-rock-gym "Crux Rock Gym" [g-b2238a7db5] reviewed_against must include: us-or-elevation-bouldering-gym
  - nearby-gym: candidate us-or-elevation-bouldering-gym "Elevation Bouldering Gym": 82 m apart
- us-or-elevation-bouldering-gym "Elevation Bouldering Gym" [g-72fddebc80] reviewed_against must include: us-or-crux-rock-gym
  - nearby-gym: candidate us-or-crux-rock-gym "Crux Rock Gym": 82 m apart
- us-or-movement-portland "Movement Portland" [g-da27fc19f8] reviewed_against must include: us-or-tomo-bouldering-club
  - nearby-gym: candidate us-or-tomo-bouldering-club "Tomo Bouldering Club": 116 m apart
- us-or-tomo-bouldering-club "Tomo Bouldering Club" [g-8e12846817] reviewed_against must include: us-or-movement-portland
  - nearby-gym: candidate us-or-movement-portland "Movement Portland": 116 m apart

## Blocked: cannot be accepted (7)
- us-az-alta-climbing-scottsdale "ALTA Climbing + Fitness Scottsdale": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- us-az-focus-climbing-center "Focus Climbing Center": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- us-az-rocks-and-ropes-downtown "Rocks and Ropes Downtown": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- us-id-gemstone-climbing "Gemstone Climbing": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- us-id-teton-rock-gym "Teton Rock Gym": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: reject closed
- us-or-klimb-rock-gym "Klimb Rock Gym": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- us-wy-source-bouldering-gym "Source Bouldering Gym": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (36)
- us-ak-the-rock-dump "The Rock Dump Indoor Climbing Gym" [g-6173fc3cf3]
- us-az-alta-boulders-chandler "ALTA Boulders Chandler" [g-f17c4ea21a]
- us-az-alta-climbing-gilbert "ALTA Climbing Gilbert" [g-c4a9274f2f]
- us-az-ape-index-climbing-gym "Ape Index Climbing Gym" [g-01be56bf22]
- us-az-beta-bouldering-gym "Beta Bouldering Gym" [g-4b5ca17980]
- us-az-black-rock-bouldering-gym "Black Rock Bouldering Gym" [g-c1352dffba]
- us-az-bouldering-project-tempe "Bouldering Project Tempe" [g-c03e4eb3ec]
- us-az-phoenix-rock-gym "Phoenix Rock Gym" [g-e62a1b3b70]
- us-az-rock-solid-climbing "Rock Solid Climbing + Fitness" [g-f4a9cc62d2]
- us-az-the-bloc-tucson "The BLOC Climbing + Fitness" [g-1ddda54c84]
- us-id-asana-climbing-gym "Asana Climbing Gym" [g-e10b8d6c40]
- us-id-the-commons-climbing-gym "The Commons Climbing Gym" [g-cdeed26ba3]
- us-id-the-edge-climbing-gym "The Edge Climbing Gym" [g-68a450dc43]
- us-id-vertical-view-climbing-gym "Vertical View Climbing Gym" [g-4767cd2d57]
- us-mt-freestone-climbing "Freestone Climbing" [g-2e32c07be1]
- us-mt-hi-line-climbing-center "The Hi-Line Climbing Center" [g-07a8080825]
- us-mt-rockfish-climbing-fitness "Rockfish Climbing & Fitness" [g-d0741c8ec6]
- us-mt-spire-climbing-fitness "Spire Climbing + Fitness" [g-93c3d14e32]
- us-mt-steepworld "Steepworld Climbing & Fitness" [g-78cab2edf0]
- us-mt-stonetree-climbing-center "Stonetree Climbing Center" [g-147274de77]
- us-mt-the-mountain-project-bozeman "The Mountain Project" [g-df869f83d4]
- us-nm-santa-fe-climbing-center "Santa Fe Climbing Center" [g-53fa3f4256]
- us-or-brimstone-boulders "Brimstone Boulders" [g-968f96eda2]
- us-or-circuit-eugene "The Circuit Bouldering Gym Eugene" [g-7df9f96c58]
- us-or-circuit-northeast "The Circuit Bouldering Gym Northeast" [g-c86c541110]
- us-or-circuit-southwest "The Circuit Bouldering Gym Southwest" [g-42b9c2971e]
- us-or-circuit-tigard "The Circuit Bouldering Gym Tigard" [g-2c947c33c0]
- us-or-portland-rock-gym-beaverton "Portland Rock Gym Beaverton" [g-11445ad709]
- us-or-portland-rock-gym-northeast "Portland Rock Gym Northeast" [g-973f0a7dff]
- us-or-rock-haven-climbing "Rock Haven Climbing Gym" [g-bff358e1d0]
- us-or-rogue-rock-gym "Rogue Rock Gym" [g-9b10b4bc62]
- us-or-skyhook-bouldering "Skyhook Bouldering" [g-8c015938de]
- us-or-stoneworks-climbing-gym "Stoneworks Climbing Gym" [g-d995198afe]
- us-or-the-jug-rock-gym "The Jug Rock Gym" [g-f055b65c2e]
- us-or-the-rock-boxx "The Rock Boxx" [g-e0f3a1ce1f]
- us-or-valley-rock-gym "Valley Rock Gym" [g-0692d41106]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-us-west`.
Nothing here touches production.
