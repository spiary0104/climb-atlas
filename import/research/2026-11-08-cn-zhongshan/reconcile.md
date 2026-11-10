# Regional research: China: Zhongshan (2026-11-08-cn-zhongshan)

Scope: CN / ZHONGSHAN
Index: 3457 gyms, sha256 39a207384343… | staged batches compared: 2026-10-06-kr-seoul, 2026-11-08-cn-zhuhai | other sections compared: 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-kunming, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou, 2026-11-06-cn-xiamen, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-dongguan, 2026-11-08-cn-foshan, 2026-11-08-cn-ningbo, 2026-11-08-cn-shenyang, 2026-11-08-cn-wuxi, 2026-11-08-cn-zhuhai
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
8 candidate(s): ready 1 | review 1 | blocked 6 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- cn-zs-001 "Hello Max Climbing (Tianyue City)" [g-a5c8d2ff93] reviewed_against must include: cn-zs-101, cn-zs-102
  - importer-probable-duplicate: g-eabab807f8 same-name-but-pin-differs 3361 m; g-7933c2616e same-name-but-pin-differs 7294 m
  - name-match: candidate cn-zs-101 "Hello Max Climbing (Shiqi Dacin)": same-name-but-pin-differs ("Hello Max Climbing (Tianyue City)" / "Hello Max Climbing (Shiqi Dacin)", 3361 m)
  - name-match: candidate cn-zs-102 "Hello Max Climbing (Tianyi Plaza)": same-name-but-pin-differs ("Hello Max Climbing (Tianyue City)" / "Hello Max Climbing (Tianyi Plaza)", 7294 m)

## Blocked: cannot be accepted (6)
- cn-zs-101 "Hello Max Climbing (Shiqi Dacin)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-zs-102 "Hello Max Climbing (Tianyi Plaza)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-zs-103 "760 Climbing (Dacin Xinghui)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-zs-104 "760 Climbing (Shiqi Dacin)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-zs-105 "NICE Climbing": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-zs-106 "Panxing Climbing (Kailong City)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (1)
- cn-zs-002 "Catree Climbing Gym" [g-a730cc985f]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-08-cn-zhongshan`.
Nothing here touches production.
