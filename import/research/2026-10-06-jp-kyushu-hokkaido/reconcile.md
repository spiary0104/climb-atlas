# Regional research: Japan: Kyushu, Okinawa, Hokkaido, Sendai, Hiroshima/Okayama coverage gap (2026-10-06-jp-kyushu-hokkaido)

Scope: JP / FUKUOKA, SAGA, NAGASAKI, KUMAMOTO, OITA, MIYAZAKI, KAGOSHIMA, OKINAWA, HOKKAIDO, MIYAGI, HIROSHIMA, OKAYAMA
Index: 2438 gyms, sha256 27073d25c2df… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
48 candidate(s): ready 38 | review 10 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (10)
- jp-fk-002 "OD Kokura" [g-d7400bf7af] reviewed_against must include: jp-fk-003
  - related-name-nearby: candidate jp-fk-003 "OD Yahata": related names "クライミングジム＆ショップ OD 小倉店" / "クライミングジム＆ショップ OD 八幡店" 13454 m apart
  - weak-coordinates: coordinates are street-level, not the building
- jp-fk-003 "OD Yahata" [g-89109c9954] reviewed_against must include: jp-fk-002
  - related-name-nearby: candidate jp-fk-002 "OD Kokura": related names "クライミングジム＆ショップ OD 八幡店" / "クライミングジム＆ショップ OD 小倉店" 13454 m apart
- jp-fk-010 "Panda Wall" [g-1713ea105c]
  - single-source: all evidence comes from one source
- jp-hk-006 "Bouldering Gym Xtreme" [g-1f30d1fc23]
  - weak-coordinates: coordinates are street-level, not the building
- jp-ks-003 "Kironico Boulder Park" [g-fe555a5e2d]
  - weak-coordinates: coordinates are street-level, not the building
- jp-mz-001 "Wow'd+ Bouldering & Gym Kiyotake" [g-f2487797f6]
  - weak-coordinates: coordinates are street-level, not the building
- jp-ng-002 "Mono Climbing Studio Omura" [g-51bd31bc6f] reviewed_against must include: jp-ng-003
  - same-website: candidate jp-ng-003 has the same website
- jp-ng-003 "Mono Climbing Studio Sasebo" [g-2f81b0e968] reviewed_against must include: jp-ng-002
  - same-website: candidate jp-ng-002 has the same website
- jp-ok-001 "Boulbaka" [g-5066b9c2e3] reviewed_against must include: g-1c0ffa88fd
  - related-name-nearby: g-1c0ffa88fd "BOULBAKA2": related names "Boulbaka" / "BOULBAKA2" 5323 m apart
- jp-oy-003 "Bouldering Room Nekonote" [g-288fa03f8b]
  - weak-coordinates: coordinates are street-level, not the building

## Ready (no flags; still needs an explicit accept) (38)
- jp-fk-001 "Hoa-Hoa Bouldering Gym" [g-747c204aeb]
- jp-fk-004 "OD1 Munakata" [g-77f3668e62]
- jp-fk-005 "JOYWALL Kurume" [g-ae03c45606]
- jp-fk-006 "MyWay Climbing Gym" [g-9961a6ae9d]
- jp-fk-007 "Jungle Gym Miyama" [g-1ba9281e27]
- jp-fk-008 "Favour Climbing" [g-7742b9664d]
- jp-fk-009 "Climbing Garden Ecole" [g-97e70cb5b0]
- jp-fk-011 "Climbing AT WALL" [g-0b9f51404f]
- jp-fk-012 "Climbing Sun Wall" [g-ffb2b1a10d]
- jp-fk-013 "ESCAPE Coffee & Climbing" [g-7bfaef9476]
- jp-fk-014 "Stump Climbing" [g-63d4aca9ed]
- jp-fk-015 "ATTIC Climbing" [g-662e363fb7]
- jp-fk-016 "Zip Rock Climbing Gym" [g-b1c085146a]
- jp-hk-001 "Akala Climb" [g-5cafa49f4b]
- jp-hk-002 "Whipper Snapper Gym" [g-1385ed51d8]
- jp-hk-003 "Signal Climbing Gym" [g-247b828a07]
- jp-hk-004 "Rainbow Cliff" [g-fefc7f35b5]
- jp-hk-005 "HOMIE" [g-c03f1007a0]
- jp-hs-001 "Spooky Climbing" [g-7ffa816287]
- jp-hs-002 "Bouldering Space Kokopelli" [g-ab225e84f4]
- jp-hs-003 "Climb Center CERO" [g-54ec81f096]
- jp-hs-004 "Climbing Park Higashihiroshima" [g-8c64074d62]
- jp-km-001 "Climbing Park Kikunan" [g-396849a66f]
- jp-km-002 "ROCKBAKKA" [g-8c9f5fd47b]
- jp-km-003 "The Ranch Climbing Gym" [g-eb03d7e03e]
- jp-ks-002 "Awesome Climbing Wall" [g-4ad5b87911]
- jp-my-001 "B'nuts Osaki Furukawa" [g-0e97233a22]
- jp-mz-002 "Press Factory" [g-3b684f3688]
- jp-mz-003 "Q-block Climbing Space" [g-821bcf1f2e]
- jp-ng-001 "Bravo Climbing Nagasaki" [g-f6d3bee65b]
- jp-ok-002 "BANJAT Bouldering" [g-2dba59b028]
- jp-ok-003 "Coral Rock Climbing Gym" [g-b6ddf01640]
- jp-ok-004 "Look Rock Bouldering Park" [g-bc748309c8]
- jp-oy-001 "Bouldergarden SaBo" [g-0e72a3430e]
- jp-oy-002 "Bon Climbing Gym" [g-77b39d209b]
- jp-oy-004 "rocks Bouldering Gym" [g-6065117d7a]
- jp-oy-006 "Climbing Space Lism" [g-daea7cebe9]
- jp-oy-007 "Belle Climbing Gym Kurashiki Hirae" [g-07ba8f751e]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-jp-kyushu-hokkaido`.
Nothing here touches production.
