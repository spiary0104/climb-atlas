# Regional research: UK: single-gym towns (boulderingwall.com follow-up) (2026-10-05-uk-single-gym-towns)

Scope: GB (whole country)
Index: 2272 gyms, sha256 c97e3035f020… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
57 candidate(s): ready 25 | review 12 | blocked 8 | already in Bouldeer 12 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (12)
- avertical-dundee "Avertical World" -> seed-937 "Avertical world" (same-name, 663 m)
- bloc10-dundee "Bloc10 Dundee" -> seed-939 "Bloc10 Dundee" (same-name, 0 m)
- boulder-exe "Boulder Exe" -> seed-931 "Boulder Exe" (same-name, 39 m)
- climbing-hut-ellesmere-port "Climbing Hut Ellesmere Port" -> seed-864 "Climbing Hut Ellesmere Port" (same-name, 3 m)
- climbing-hut-shrewsbury "Climbing Hut Shrewsbury" -> seed-865 "Climbing Hut Shrewsbury" (same-name, 0 m)
- dynamic-rock "Dynamic Rock" -> seed-952 "Dynamic Rock" (same-name, 0 m)
- eden-rock-carlisle "Eden Rock Carlisle" -> seed-869 "Eden Rock Carlisle" (same-name, 0 m)
- freeklime-york "Freeklime York" -> seed-934 "Freeklime" (same-address-related-name, 1 m)
- overhang-carmarthen "Overhang Climbing Centre" -> seed-954 "Overhang Climbing Centre" (same-name, 2 m)
- rockstar-swindon "Rockstar Climbing Centre" -> g-0bf1f11379 "Rockstar Climbing Centre" (same-name, 0 m)
- rokt-brighouse "ROKT Climbing Gym" -> seed-888 "ROKT Climbing Gym" (same-name, 1 m)
- weedon-project "The Weedon Project" -> seed-900 "The Weedon Project" (same-name, 0 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (12)
- boardroom-deeside "The Boardroom Climbing" [g-a0a797894a] reviewed_against must include: seed-956
  - importer-probable-duplicate: seed-956 renamed-or-related-name-nearby 0 m
  - name-match: seed-956 "The Boardroom": renamed-or-related-name-nearby ("The Boardroom Climbing" / "The Boardroom", 0 m)
- boulder-bunker "The Boulder Bunker" [g-8d34346f85] reviewed_against must include: seed-891
  - importer-probable-duplicate: seed-891 renamed-or-related-name-nearby 0 m
  - name-match: seed-891 "The Bunker": renamed-or-related-name-nearby ("The Boulder Bunker" / "The Bunker", 0 m)
- boulder-uk-preston "Boulder UK" [g-c864f05fb2] reviewed_against must include: boulder-uk-blackburn
  - related-name-nearby: candidate boulder-uk-blackburn "Boulder UK Blackburn": related names "Boulder UK" / "Boulder UK Blackburn" 10571 m apart
  - same-website: candidate boulder-uk-blackburn has the same website
- chimera-canterbury "Chimera Climbing Canterbury" [g-ddc23cf03e] reviewed_against must include: chimera-chatham, chimera-tunbridge-wells
  - same-website: candidate chimera-chatham has the same website
  - same-website: candidate chimera-tunbridge-wells has the same website
- chimera-chatham "Chimera Climbing Chatham" [g-10d0030e4b] reviewed_against must include: chimera-canterbury, chimera-tunbridge-wells
  - same-website: candidate chimera-canterbury has the same website
  - same-website: candidate chimera-tunbridge-wells has the same website
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- chimera-tunbridge-wells "Chimera Climbing Tunbridge Wells" [g-c1ed5435a3] reviewed_against must include: chimera-canterbury, chimera-chatham
  - same-website: candidate chimera-canterbury has the same website
  - same-website: candidate chimera-chatham has the same website
- golden-gecko "Golden Gecko Climbing" [g-3cfa795577] reviewed_against must include: seed-872
  - importer-probable-duplicate: seed-872 renamed-or-related-name-nearby 1 m
  - name-match: seed-872 "Golden Gecko": renamed-or-related-name-nearby ("Golden Gecko Climbing" / "Golden Gecko", 1 m)
- highball-norwich "Highball Norwich" [g-0aca65ed83] reviewed_against must include: seed-874
  - importer-probable-duplicate: seed-874 renamed-or-related-name-nearby 0 m
  - name-match: seed-874 "Highball Climbing Centre": renamed-or-related-name-nearby ("Highball Norwich" / "Highball Climbing Centre", 0 m)
- ledge-inverness "The Ledge Climbing Gym" [g-1847b5a682] reviewed_against must include: seed-948
  - importer-probable-duplicate: seed-948 renamed-or-related-name-nearby 69 m
  - name-match: seed-948 "The Ledge": renamed-or-related-name-nearby ("The Ledge Climbing Gym" / "The Ledge", 69 m)
- pinnacle-bouldering-northampton "The Pinnacle Bouldering Centre" [g-1cf22ea51f]
  - single-source: all evidence comes from one source
- project-climbing-poole "The Project Climbing Centre" [g-ae1c3cccf4]
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- red-goat-york "Red Goat Climbing Wall" [g-2ad2779f75] reviewed_against must include: seed-883
  - importer-probable-duplicate: seed-883 renamed-or-related-name-nearby 0 m
  - name-match: seed-883 "Red Goat": renamed-or-related-name-nearby ("Red Goat Climbing Wall" / "Red Goat", 0 m)

## Blocked: cannot be accepted (8)
- avid-ipswich "Avid Climbing": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- boulder-uk-blackburn "Boulder UK Blackburn": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- hang-on-hamilton "Hang On Climbing Centre": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: reject closed
- ingleton-wall "Ingleton Wall": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- keswick-climbing-wall "Keswick Climbing Wall": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- lancaster-wall "Lancaster Wall": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- northern-problems-whitehaven "Northern Problems": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- sunderland-wall "Sunderland Wall": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (25)
- ambleside-wall "Ambleside Climbing Wall" [g-b8390e87bd]
- boatyard-boulders-nottingham "Boatyard Boulders" [g-e4d7627940]
- boulder-central-west-bromwich "Boulder Central" [g-e70e0ce27b]
- boulders-cheltenham "Boulders Cheltenham" [g-9407057021]
- chalkup-nether-stowey "ChalkUp Bouldering" [g-63acfceb55]
- climbing-hub-bradford "The Climbing Hub" [g-c57e7edfac]
- durham-climbing-centre "Durham Climbing Centre" [g-28e7f5f683]
- f51-folkestone "F51 Climbing Centre" [g-a43e94dabf]
- fenrock-wisbech "Fenrock Climbing" [g-7794b00025]
- flashpoint-swansea "Flashpoint Swansea" [g-2ebcda8553]
- freeklime-huddersfield "Freeklime Huddersfield" [g-57ce52c3f2]
- freeklime-lincoln "Freeklime Lincoln" [g-e41f03bb5d]
- frome-boulder-rooms "Frome Boulder Rooms" [g-b9d648164b]
- ibex-darlington "Ibex Bouldering" [g-93f568c4e0]
- northway-newbury "Northway Climbing Centre" [g-9696d8d616]
- oakwood-wokingham "Oakwood Climbing Centre" [g-f64ef6ed0b]
- ordinary-climbers "The Ordinary Climbers" [g-4c7b1d339e]
- rockburn-bridport "Rockburn" [g-8773360f57]
- rockcity-hull "Rockcity Climbing" [g-8e9f3f2af7]
- rof59-newton-aycliffe "The Wall @ ROF59 Climbing Centre" [g-669ac10d78]
- romford-rock-boulder "Romford Rock & Boulder" [g-81bd5e75df]
- tide-climbing-helston "The Tide Climbing Centre Helston" [g-52ec7ba665]
- tide-climbing-padstow "The Tide Climbing Centre Padstow" [g-91a140e194]
- volume-1-east-grinstead "Volume 1 Climbing" [g-b8678a0b64]
- xc-hemel-hempstead "The XC" [g-ad7bbd34af]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-uk-single-gym-towns`.
Nothing here touches production.
