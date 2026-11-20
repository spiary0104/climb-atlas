# Regional research: China: Urumqi (2026-11-11-cn-urumqi)

Scope: CN / URUMQI
Index: 3612 gyms, sha256 fb2af3b217bd… | staged batches compared: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha, 2026-11-11-cn-changchun, 2026-11-11-cn-hohhot, 2026-11-11-cn-shijiazhuang, 2026-11-11-cn-taiyuan | other sections compared: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha, 2026-10-12-cn-shanghai, 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-kunming, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou, 2026-11-06-cn-xiamen, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-dongguan, 2026-11-08-cn-foshan, 2026-11-08-cn-fuzhou, 2026-11-08-cn-guiyang, 2026-11-08-cn-harbin, 2026-11-08-cn-hefei, 2026-11-08-cn-nanchang, 2026-11-08-cn-nanning, 2026-11-08-cn-ningbo, 2026-11-08-cn-shenyang, 2026-11-08-cn-wuxi, 2026-11-08-cn-xining, 2026-11-08-cn-yinchuan, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai, 2026-11-11-cn-changchun, 2026-11-11-cn-haikou, 2026-11-11-cn-hohhot, 2026-11-11-cn-lanzhou, 2026-11-11-cn-lhasa, 2026-11-11-cn-sanya, 2026-11-11-cn-shijiazhuang, 2026-11-11-cn-taiyuan
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
4 candidate(s): ready 1 | review 1 | blocked 2 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- cn-urumqi-002 "Yanka Climbing (Xiaoximen Jingu Building)" [g-8c4c8bfcaa] reviewed_against must include: cn-urumqi-003
  - importer-probable-duplicate: g-1063d4787e same-name-but-pin-differs 7423 m
  - name-match: candidate cn-urumqi-003 "Yanka Climbing (Easyhome store)": same-name-but-pin-differs ("Yanka Climbing (Xiaoximen Jingu Building)" / "Yanka Climbing (Easyhome store)", 7423 m)

## Blocked: cannot be accepted (2)
- cn-urumqi-003 "Yanka Climbing (Easyhome store)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cn-urumqi-004 "Juzhan Climbing (Urumqi Olympic Sports Centre)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (1)
- cn-urumqi-001 "Chameleon Climbing Gym (Urumqi)" [g-95bdfbf850]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-11-cn-urumqi`.
Nothing here touches production.
