# Regional research: China: Harbin (2026-11-08-cn-harbin)

Scope: CN / HARBIN
Index: 3457 gyms, sha256 39a207384343… | staged batches compared: 2026-10-06-kr-seoul, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-fuzhou, 2026-11-08-cn-guiyang, 2026-11-08-cn-hefei, 2026-11-08-cn-nanning, 2026-11-08-cn-shenyang, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai | other sections compared: 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-kunming, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou, 2026-11-06-cn-xiamen, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-dongguan, 2026-11-08-cn-foshan, 2026-11-08-cn-fuzhou, 2026-11-08-cn-guiyang, 2026-11-08-cn-hefei, 2026-11-08-cn-nanchang, 2026-11-08-cn-nanning, 2026-11-08-cn-ningbo, 2026-11-08-cn-shenyang, 2026-11-08-cn-wuxi, 2026-11-08-cn-xining, 2026-11-08-cn-yinchuan, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
6 candidate(s): ready 1 | review 1 | blocked 4 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- cn-hb-001 "Long Climbing (Haxi)" [g-373720056f] reviewed_against must include: cn-hb-101, cn-hb-102
  - importer-probable-duplicate: g-df282a6894 co-located 14 m; g-5d9719b540 same-name-but-pin-differs 6844 m
  - name-match: candidate cn-hb-101 "Bilixiong Climbing": co-located ("Long Climbing (Haxi)" / "Bilixiong Climbing", 14 m)
  - name-match: candidate cn-hb-102 "Long Climbing (Qunli Yintai)": same-name-but-pin-differs ("Long Climbing (Haxi)" / "Long Climbing (Qunli Yintai)", 6844 m)

## Blocked: cannot be accepted (4)
- cn-hb-101 "Bilixiong Climbing": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-hb-102 "Long Climbing (Qunli Yintai)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-hb-103 "Erbin Up Climbing": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-hb-104 "haOne Climbing Club": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (1)
- cn-hb-002 "Tingchao Climbing" [g-2be28f9eda]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-08-cn-harbin`.
Nothing here touches production.
