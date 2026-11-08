# Regional research: China: Wuxi (2026-11-08-cn-wuxi)

Scope: CN / WUXI
Index: 3433 gyms, sha256 ad459783ea35… | staged batches compared: 2026-10-06-kr-seoul, 2026-11-08-cn-dongguan, 2026-11-08-cn-foshan, 2026-11-08-cn-ningbo | other sections compared: 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-kunming, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou, 2026-11-06-cn-xiamen, 2026-11-08-cn-dongguan, 2026-11-08-cn-foshan, 2026-11-08-cn-ningbo
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
6 candidate(s): ready 0 | review 3 | blocked 3 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (3)
- cn-wx-001 "HiRock Climbing (Easyhome)" [g-23edc251e8] reviewed_against must include: cn-wx-002, cn-wx-003
  - importer-probable-duplicate: g-ce3fd5a6da same-name-but-pin-differs 5002 m; g-4c551585a4 same-name-but-pin-differs 9835 m
  - name-match: candidate cn-wx-002 "HiRock Climbing (Bodu River Sports Center)": same-name-but-pin-differs ("HiRock Climbing (Easyhome)" / "HiRock Climbing (Bodu River Sports Center)", 5002 m)
  - name-match: candidate cn-wx-003 "HiRock Climbing (Red Star Macalline)": same-name-but-pin-differs ("HiRock Climbing (Easyhome)" / "HiRock Climbing (Red Star Macalline)", 9835 m)
- cn-wx-002 "HiRock Climbing (Bodu River Sports Center)" [g-ce3fd5a6da] reviewed_against must include: cn-wx-001, cn-wx-003
  - importer-probable-duplicate: g-23edc251e8 same-name-but-pin-differs 5002 m; g-4c551585a4 same-name-but-pin-differs 12813 m
  - name-match: candidate cn-wx-001 "HiRock Climbing (Easyhome)": same-name-but-pin-differs ("HiRock Climbing (Bodu River Sports Center)" / "HiRock Climbing (Easyhome)", 5002 m)
  - name-match: candidate cn-wx-003 "HiRock Climbing (Red Star Macalline)": same-name-but-pin-differs ("HiRock Climbing (Bodu River Sports Center)" / "HiRock Climbing (Red Star Macalline)", 12813 m)
- cn-wx-003 "HiRock Climbing (Red Star Macalline)" [g-4c551585a4] reviewed_against must include: cn-wx-001, cn-wx-002
  - importer-probable-duplicate: g-23edc251e8 same-name-but-pin-differs 9835 m; g-ce3fd5a6da same-name-but-pin-differs 12813 m
  - name-match: candidate cn-wx-001 "HiRock Climbing (Easyhome)": same-name-but-pin-differs ("HiRock Climbing (Red Star Macalline)" / "HiRock Climbing (Easyhome)", 9835 m)
  - name-match: candidate cn-wx-002 "HiRock Climbing (Bodu River Sports Center)": same-name-but-pin-differs ("HiRock Climbing (Red Star Macalline)" / "HiRock Climbing (Bodu River Sports Center)", 12813 m)

## Blocked: cannot be accepted (3)
- cn-wx-101 "Forest Climbing (Wuxi Symphony Hall)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-wx-102 "Shanzhao Climbing": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-wx-103 "Tianyu Climbing (Fangyuanhui)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-08-cn-wuxi`.
Nothing here touches production.
