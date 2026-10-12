# Regional research: China: Kunming and Changsha coverage gap (2026-10-12-cn-kunming-changsha)

Scope: CN / KUNMING, CHANGSHA
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
12 candidate(s): ready 5 | review 2 | blocked 5 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- cn-km-003 "Xiaoxiong Climbing (Yunling Tianjiao) [昆明小熊攀岩俱乐部云岭天骄馆]" [g-25e8f068df] reviewed_against must include: cn-km-004
  - related-name-nearby: candidate cn-km-004 "Xiaoxiong Climbing (Hailer World) [昆明小熊攀岩俱乐部海乐世界馆]": related names "Xiaoxiong Climbing (Yunling Tianjiao) [昆明小熊攀岩俱乐部云岭天骄馆]" / "小熊攀岩(海乐世界)" 12769 m apart
- cn-km-004 "Xiaoxiong Climbing (Hailer World) [昆明小熊攀岩俱乐部海乐世界馆]" [g-f1a070e85b] reviewed_against must include: cn-km-003
  - related-name-nearby: candidate cn-km-003 "Xiaoxiong Climbing (Yunling Tianjiao) [昆明小熊攀岩俱乐部云岭天骄馆]": related names "Xiaoxiong Climbing (Hailer World) [昆明小熊攀岩俱乐部海乐世界馆]" / "昆明小熊攀岩俱乐部(云岭天骄馆)" 12769 m apart

## Blocked: cannot be accepted (5)
- cn-cs-003 "Zaoan Climbing [早安攀岩馆]": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer
- cn-cs-004 "Xiangpan Climbing (Yinpenling Wanda) [湘攀攀岩银盆岭万达店]": no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer
- cn-cs-005 "Banana Climbing (Zhujiang Star Ring) [香蕉攀岩珠江星环店]": no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer
- cn-cs-006 "Banana Climbing (Yuefang ID Mall) [香蕉攀岩悦方ID MALL店]": no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer
- cn-km-006 "Jinri Climbing Life Gym (Jianshe Lu) [今日攀岩生活馆(建设路店)]": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (5)
- cn-cs-001 "CAMP4 Climbing (Changsha Xihu Park) [CAMP4岩肆长沙西湖公园店]" [g-2e2bdca33f]
- cn-cs-002 "TBW Climbing (Longji Base) [TBW攀岩龙脊基地店]" [g-bad56b372d]
- cn-km-001 "Nayan Climbing (Tuodong) [那岩拓东攀岩馆]" [g-3c379a71cd]
- cn-km-002 "Nayan Climbing (0871) [那岩0871攀岩俱乐部]" [g-b9cf0baa54]
- cn-km-005 "Panyang Climbing Gym (Chenggong) [攀羊岩馆]" [g-adba51f99f]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-12-cn-kunming-changsha`.
Nothing here touches production.
