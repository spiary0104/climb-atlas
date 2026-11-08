# Regional research: China: Foshan (2026-11-08-cn-foshan)

Scope: CN / FOSHAN
Index: 3433 gyms, sha256 ad459783ea35… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-kunming, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou, 2026-11-06-cn-xiamen, 2026-11-08-cn-dongguan, 2026-11-08-cn-ningbo, 2026-11-08-cn-wuxi
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
12 candidate(s): ready 0 | review 2 | blocked 10 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- cn-fs-001 "Qingtian Climbing (Huangqi)" [g-af2155fa8a] reviewed_against must include: seed-746
  - importer-probable-duplicate: seed-746 same-name-but-pin-differs 10327 m
  - name-match: seed-746 "Qingtian Climbing (Caofangwei)": same-name-but-pin-differs ("Qingtian Climbing (Huangqi)" / "Qingtian Climbing (Caofangwei)", 10327 m)
- cn-fs-002 "King Climbing (Nanhai Yinxianghui)" [g-7a53b80a91] reviewed_against must include: cn-fs-102
  - importer-probable-duplicate: g-390b434274 same-name 205 m
  - name-match: candidate cn-fs-102 "King Climbing (Yuehui Plaza)": same-name ("King Climbing (Nanhai Yinxianghui)" / "King Climbing (Yuehui Plaza)", 205 m)

## Blocked: cannot be accepted (10)
- cn-fs-101 "K2 Climbing (Foshan Poly Mall)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-fs-102 "King Climbing (Yuehui Plaza)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-fs-103 "Tuobili Climbing Club (Dongfang Xintiandi)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-fs-104 "Hello Max Climbing (Shunde Daxin)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-fs-105 "Super Extreme Climbing (Beijiao)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-fs-106 "Zhanxiang Climbing Club (Aoyuan Plaza)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-fs-107 "Zhanxiang Climbing Club (Foshan New City)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-fs-108 "Moment Climbing (Daliang Qinghuiyuan)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-fs-109 "Mars Climbing (Shunlian Park)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-fs-110 "Crag4yard Climbing x Fitness": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-08-cn-foshan`.
Nothing here touches production.
