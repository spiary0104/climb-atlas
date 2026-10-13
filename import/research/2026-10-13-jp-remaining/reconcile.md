# Regional research: Japan: Tohoku, Chugoku, Shikoku, Okinawa (2026-10-13-jp-remaining)

Scope: JP / AOMORI, IWATE, MIYAGI, AKITA, YAMAGATA, FUKUSHIMA, TOTTORI, SHIMANE, OKAYAMA, HIROSHIMA, YAMAGUCHI, TOKUSHIMA, KAGAWA, EHIME, KOCHI, OKINAWA
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-10-06-jp-chubu, 2026-10-06-jp-kansai, 2026-10-06-jp-kanto, 2026-10-06-jp-kyushu-hokkaido
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
24 candidate(s): ready 22 | review 2 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- jp-bouldering-gym-trans "Bouldering Gym Trans" [g-592605c84d]
  - weak-coordinates: coordinates are street-level, not the building
- jp-rocks-climbing-gym-kurashiki "rocks Climbing Gym Kurashiki" [g-de63934d95] reviewed_against must include: 2026-10-06-jp-kyushu-hokkaido#jp-oy-004, g-6065117d7a
  - other-section: 2026-10-06-jp-kyushu-hokkaido#jp-oy-004 "rocks Bouldering Gym": related-name-nearby related names "rocks Climbing Gym Kurashiki" / "rocks Bouldering Gym" 11321 m apart
  - related-name-nearby: g-6065117d7a "rocks Bouldering Gym": related names "rocks Climbing Gym Kurashiki" / "rocks Bouldering Gym" 11321 m apart
  - weak-coordinates: coordinates are street-level, not the building

## Ready (no flags; still needs an explicit accept) (22)
- jp-2nd-wally-bouldering "2ND WALLY Bouldering" [g-4983e7ce49]
- jp-boulderbase "BoulderBase" [g-8f44d0e169]
- jp-bouldering-gym-babaanz "Bouldering Gym Babaanz" [g-733c3b1404]
- jp-bouldering-gym-labo-yamaguchi "Bouldering Gym Labo Yamaguchi" [g-bc6f5b9fad]
- jp-bouldering-gym-unity "Bouldering Gym Unity" [g-6e8f55f551]
- jp-bouldering-gym-varappe "Bouldering Gym Varappe" [g-0dfb9c8371]
- jp-bouldering-house-358 "Bouldering House 358" [g-044729335a]
- jp-bouldering-spot-9a "Bouldering Spot 9A" [g-9fbac95b15]
- jp-camp-climbing-freaky "Camp & Climbing Freaky" [g-6c90e3469c]
- jp-clambon-climbing "Clambon Climbing" [g-c8c4f84fad]
- jp-climbing-gym-allez "Climbing Gym Allez!" [g-cd0e5c899d]
- jp-climbing-gym-nanashino "Climbing Gym Nanashino" [g-84340b2366]
- jp-climbing-park-drop-in "Climbing Park Drop in" [g-bc9fc739df]
- jp-ehime-climbing-gym-itte "Ehime Climbing Gym iTTE" [g-684391a35d]
- jp-glide-climbing "glide climbing" [g-3dc466613b]
- jp-join-climbing-gym "Join Climbing Gym" [g-a0ad7bf613]
- jp-k-climb-matsue "K Climb Matsue" [g-59b4395df0]
- jp-m-wall-matsue "M Wall Matsue" [g-177c5a2f85]
- jp-movement-climbing-space "Movement Climbing Space" [g-93ff261ed2]
- jp-north-rock "Climbing Gym North Rock" [g-61ea19e555]
- jp-to-do-climbing "TO-DO Climbing" [g-5735bc19a1]
- jp-un-rocher "Climbing & Cafe Warehouse Un Rocher" [g-2855a184b5]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-13-jp-remaining`.
Nothing here touches production.
