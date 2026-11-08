# Regional research: China: Ningbo (2026-11-08-cn-ningbo)

Scope: CN / NINGBO
Index: 3433 gyms, sha256 ad459783ea35… | staged batches compared: 2026-10-06-kr-seoul, 2026-11-08-cn-dongguan, 2026-11-08-cn-foshan | other sections compared: 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-kunming, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou, 2026-11-06-cn-xiamen, 2026-11-08-cn-dongguan, 2026-11-08-cn-foshan, 2026-11-08-cn-wuxi
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
8 candidate(s): ready 0 | review 1 | blocked 7 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- cn-nb-001 "ROCKPLUS Climbing (Hongtai)" [g-c5eb3a2fd2] reviewed_against must include: cn-nb-101, cn-nb-102
  - importer-probable-duplicate: g-df01641c02 same-name-but-pin-differs 1329 m; g-5f4517f01e same-name-but-pin-differs 6120 m
  - name-match: candidate cn-nb-101 "ROCKPLUS Climbing (Global Harbor)": same-name-but-pin-differs ("ROCKPLUS Climbing (Hongtai)" / "ROCKPLUS Climbing (Global Harbor)", 6120 m)
  - name-match: candidate cn-nb-102 "ROCKPLUS Climbing (Wuyi Plaza)": same-name-but-pin-differs ("ROCKPLUS Climbing (Hongtai)" / "ROCKPLUS Climbing (Wuyi Plaza)", 1329 m)

## Blocked: cannot be accepted (7)
- cn-nb-101 "ROCKPLUS Climbing (Global Harbor)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-nb-102 "ROCKPLUS Climbing (Wuyi Plaza)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-nb-103 "Ningbo Baoyi Climbing Club (Eastern New City)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-nb-104 "V8 Fitness Climbing Club": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-nb-105 "Lai Climbing (Ly climb)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-nb-106 "XTALE Climbing": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-nb-107 "Yiyi Gaosheng Climbing": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-08-cn-ningbo`.
Nothing here touches production.
