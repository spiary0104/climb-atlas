# Regional research: China: Guangzhou (2026-11-01-cn-guangzhou)

Scope: CN / GUANGZHOU
Index: 3433 gyms, sha256 ad459783ea35… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-kunming, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou, 2026-11-06-cn-xiamen
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
5 candidate(s): ready 0 | review 3 | blocked 0 | already in Bouldeer 2 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (2)
- cn-gz-001 "Mars Climbing Gym (Yuehuicheng)" -> seed-750 "Mars Climbing Gym (Liwan)" (same-name, 43 m)
- cn-gz-002 "Mars Climbing Gym (Qiaonanhui)" -> seed-741 "Mars Climbing Gym (Qiaonanhui)" (same-name, 139 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (3)
- cn-gz-003 "BoulderDash Climbing Gym (Jiankanggang)" [g-1ce87d50a4] reviewed_against must include: cn-gz-004, seed-736
  - importer-probable-duplicate: seed-736 same-name-but-pin-differs 8149 m
  - name-match: candidate cn-gz-004 "BoulderDash Climbing Gym (Wanbo)": same-name-but-pin-differs ("BoulderDash Climbing Gym (Jiankanggang)" / "BoulderDash Climbing Gym (Wanbo)", 10764 m)
  - name-match: seed-736 "BoulderDash Climbing Gym (Sijitiandi)": same-name-but-pin-differs ("BoulderDash Climbing Gym (Jiankanggang)" / "BoulderDash Climbing Gym (Sijitiandi)", 8149 m)
- cn-gz-004 "BoulderDash Climbing Gym (Wanbo)" [g-a9f7f45c84] reviewed_against must include: cn-gz-003, seed-736
  - importer-probable-duplicate: seed-736 same-name-but-pin-differs 10594 m
  - name-match: candidate cn-gz-003 "BoulderDash Climbing Gym (Jiankanggang)": same-name-but-pin-differs ("BoulderDash Climbing Gym (Wanbo)" / "BoulderDash Climbing Gym (Jiankanggang)", 10764 m)
  - name-match: seed-736 "BoulderDash Climbing Gym (Sijitiandi)": same-name-but-pin-differs ("BoulderDash Climbing Gym (Wanbo)" / "BoulderDash Climbing Gym (Sijitiandi)", 10594 m)
- cn-gz-005 "Unfollow Climbing Gym (Liuhua Center)" [g-47165537dd] reviewed_against must include: seed-745
  - importer-probable-duplicate: seed-745 same-name-but-pin-differs 8893 m
  - name-match: seed-745 "Unfollow Climbing Gym (Haizhu Shixi)": same-name-but-pin-differs ("Unfollow Climbing Gym (Liuhua Center)" / "Unfollow Climbing Gym (Haizhu Shixi)", 8893 m)

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-01-cn-guangzhou`.
Nothing here touches production.
