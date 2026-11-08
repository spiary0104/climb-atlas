# Regional research: China: Zhuhai (2026-11-08-cn-zhuhai)

Scope: CN / ZHUHAI
Index: 3457 gyms, sha256 39a207384343… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-kunming, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou, 2026-11-06-cn-xiamen, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-dongguan, 2026-11-08-cn-foshan, 2026-11-08-cn-ningbo, 2026-11-08-cn-shenyang, 2026-11-08-cn-wuxi, 2026-11-08-cn-zhongshan
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
6 candidate(s): ready 3 | review 1 | blocked 2 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- cn-zh-001 "Banana Climbing (Wangjiaohui)" [g-16b049d31f] reviewed_against must include: seed-755
  - importer-probable-duplicate: seed-755 same-name-but-pin-differs 3437 m
  - name-match: seed-755 "Banana Climbing (Le Shi)": same-name-but-pin-differs ("Banana Climbing (Wangjiaohui)" / "Banana Climbing (Le Shi)", 3437 m)

## Blocked: cannot be accepted (2)
- cn-zh-101 "Lantian Climbing (City Living Room)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-zh-102 "Lantian Climbing (Youth Activity Centre)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (3)
- cn-zh-002 "Matter Climbing Gym (Hengqin)" [g-75b3b0ef60]
- cn-zh-003 "Lishi Climbing" [g-8053f03c7e]
- cn-zh-004 "Equation Climbing" [g-20cb064993]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-08-cn-zhuhai`.
Nothing here touches production.
