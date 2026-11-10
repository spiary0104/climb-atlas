# Regional research: China: Hefei (2026-11-08-cn-hefei)

Scope: CN / HEFEI
Index: 3457 gyms, sha256 39a207384343… | staged batches compared: 2026-10-06-kr-seoul, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-shenyang, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai | other sections compared: 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-kunming, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou, 2026-11-06-cn-xiamen, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-dongguan, 2026-11-08-cn-foshan, 2026-11-08-cn-fuzhou, 2026-11-08-cn-guiyang, 2026-11-08-cn-nanning, 2026-11-08-cn-ningbo, 2026-11-08-cn-shenyang, 2026-11-08-cn-wuxi, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
5 candidate(s): ready 1 | review 1 | blocked 3 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- cn-hf-001 "Yinggu Climbing (Changjiang 180)" [g-71708f1178] reviewed_against must include: cn-hf-101
  - importer-probable-duplicate: g-e3373ef0f8 same-name-but-pin-differs 9956 m
  - name-match: candidate cn-hf-101 "Yinggu Climbing (Jinyu Nanqi)": same-name-but-pin-differs ("Yinggu Climbing (Changjiang 180)" / "Yinggu Climbing (Jinyu Nanqi)", 9956 m)

## Blocked: cannot be accepted (3)
- cn-hf-101 "Yinggu Climbing (Jinyu Nanqi)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-hf-102 "Yanlifang Climbing (Zhengwu Yintai)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-hf-103 "Yandao Climbing (Sports School)": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (1)
- cn-hf-002 "Rock Bottom Climbing (Fangyuan LIVE)" [g-bc2bf5e073]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-08-cn-hefei`.
Nothing here touches production.
