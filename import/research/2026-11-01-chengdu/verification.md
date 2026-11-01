# Chengdu verification, 2026-10-31/11-01 (read-only; nothing written to production)
Sources: Amap search + listing detail, read in the owner's signed-in tab 2026-11-01 (each read twice, both identical;
GCJ-02 -> WGS-84); RedNote official gym accounts 2026-10-31 (rednote-findings.md). Distances: live pin vs today's listing.

| id | gym | status (evidence) | pin vs Amap today | pilot? |
|---|---|---|---|---|
| seed-606 | Banana COSMO 香蕉攀岩(COSMO店) | OPEN (official acct 2026-10-31, hours 10-22) | 1583 m; PR#84 fix = 0 m | yes |
| seed-607 | Banana ICD 香蕉攀岩(环贸ICD店) | OPEN (official) | 6025 m; PR#84 fix = 0 m | yes |
| seed-608 | Banana CapitaLand Tianfu 香蕉攀岩(凯德天府店) | OPEN (official; auto-belay incident notice 10-28) | 334 m (entrance) - needs fix | yes, note incident |
| seed-609 | ChillMountain 丘山攀岩(殷家林店) | OPEN (official 10-29; hours 12:00-22:00) | 645 m; PR#84 fix = 0 m | yes |
| seed-610 | Quantum 量子攀岩(量子介店) | OPEN? (brand acct active 10-28; branch not named) | 905 m; PR#84 fix = 0 m | yes |
| seed-611 | Climbing Panda Wuhou Joy City | OPEN (official store guide + 2026 user notes) | 579 m; PR#84 fix = 0 m | yes |
| seed-612 | WEClimb 野猴子WEClimb攀岩馆 | OPEN (official 10-31) - kids 3.6-12 focus, adult access unclear | 1779 m; PR#84 fix = 0 m | hold |
| seed-613 | Tandong Gongchang 探洞工场(环球中心旗舰店) | kids cave-play venue, not a climbing gym | 1492 m (listing) | retire candidate |
| seed-614 | Flying Frog 339 飞蛙攀岩(成都339购物中心店) | OPEN (branch acct 10-26, hours 10-22) | 751 m; PR#84 fix = 0 m | yes |
| seed-615 | C7 Climbing | no Amap listing, no RedNote | - | unverifiable |
| seed-616 | Chengshi 成视攀岩 | OPEN (user reports Aug 2026; Amap listed) | 108 m ok | yes |
| seed-617 | Climbing Panda CapitaLand Jinniu | CLOSED 2026-01-14 (official note 2026-01-07) | no listing | retire |
| seed-618 | Climbing Panda Chengzhonghui | not on official store list, no Amap listing | - | likely closed |
| seed-619 | Climbing Panda Tianfu Joy City | OPEN (official guide + user notes) | 505 m (listing) - needs fix | yes |
| seed-620 | Big Pine Cone 大松果马达攀岩馆 | OPEN (official 10-26) | 125 m ok | yes |
| seed-621 | Super Panda Fitness Studio | no gym found (only a car repair shop "SUPER PANDA") | - | retire candidate |
| seed-622 | Climbing Panda R&F 熊猫攀岩生活馆(富力店) | OPEN (official guide) | 284 m (entrance) - fix | yes |
| seed-623 | Flying Frog Emerald Park 乐动飞蛙(万科里店) | LIKELY CLOSED (user farewells Sep 2026; official silent since May); Amap still lists | 1679 m | no |
| seed-624 | Lezhidao | nothing found; pin is a copy of seed-631's | - | unverifiable |
| seed-625 | Pink Rabbit | nothing found | - | unverifiable |
| seed-626 | Qurui 趣锐攀岩馆(人民北路店) | OPEN (user notes to 2026-10-20; no official acct) | 171 m (listing) ok | yes |
| seed-627 | Survivor 生存者攀岩馆(蓝润·摩里中心店) | listed; same spot as live pin (57 m) - mall renamed; activity unknown | 57 m ok | maybe |
| seed-628 | Elephant | no Amap listing; Chengdu acct silent since 2025-04 | - | likely closed |
| seed-629 | Climbing Panda Wenjiang (新光天地) | OPEN (official guide) | 3410 m (listing) - needs fix | yes |
| seed-630 | Weiming 成都为明攀岩墙 | listed | 12771 m - needs fix | no (outlying) |
| seed-631 | Climbing Hero 攀登侠(北城龙湖天街店) | listed; kids chain, adult access unknown | 194 m ok | no |
| seed-632 | Chengdu Sport Univ. East campus | listed (university wall) | 18820 m - needs fix | no |
| seed-633 | Mufeng 沐风山石攀岩基地 | listed; address (Dayi county seat) and pin (mountains) disagree | 13769 m | manual check |
| seed-634 | Climbing Hero Shuangliu 攀登侠儿童攀岩馆 | listed; children's gym | 167 m ok | no |
| seed-635 | Bear Bear 熊熊攀岩 | listed (no RedNote) | 106 m ok | yes |

Not in Bouldeer (import-pipeline candidates): Banana 悠方店 (B0M2JDHFY8, opened 2026-10-04), Climbing Panda 天府艺术公园店 (B0M1PH3MDR),
熊猫攀岩训练基地 Xindu (B0MGJCBXPP), Quantum 天沐锦江店 (B0MURLF01D) and 大魔方店 (B0LKXKHITX), 丘山攀岩CyPARK店 (B0LKHHQSNG).
Visitor info: no gym states day-pass price, shoe hire, booking or ID rules on RedNote or Amap; Panda says one ticket includes shoes+harness.

## Owner decisions 2026-11-01
- Pilot set (14): seed-606, 607, 608, 609, 610, 611, 614, 616, 619, 620, 622, 626, 629, 635. seed-627 Survivor optional (activity unknown).
- Batch `import/batches/2026-11-01-chengdu` (4 pin fixes, 5 retirements) prepared; applying it needs separate owner approval.
  Apply order: PR #84's `2026-10-13-cn-pin-fixes` (7 Chengdu pins re-verified 2026-11-01: 0 m difference) first or in either order (no shared ids).
- Visitor info (prices, shoe hire, booking, ID): not stated by any gym on RedNote or Amap; to be checked in each gym's WeChat
  mini-program / official account by someone with WeChat. Until then the pilot shows "Not confirmed yet".

## Manual checks still open
- seed-628 Elephant: no Amap listing, Chengdu account silent since 2025-04, but a 2026-06-28 parking-guide note exists (unread): not retired.
- seed-615 C7, seed-624 Lezhidao (pin copies seed-631), seed-625 Pink Rabbit: no trace on Amap or RedNote.
- seed-612 WEClimb, seed-631 and seed-634 Climbing Hero: children-focused; confirm adult day-visitor access.
- Pins far off (outlying, not in this batch): seed-630 12.8 km, seed-632 18.8 km, seed-633 13.8 km (address and Amap pin disagree).
- New branches (candidates for a research section, not imported): Banana 悠方店, Climbing Panda 天府艺术公园店 and Xindu base,
  Quantum 天沐锦江店 and 大魔方店, ChillMountain CyPARK店.
