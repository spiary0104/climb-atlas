# Regional research: China: Guangzhou (2026-11-01-cn-guangzhou)

Scope: CN / GUANGZHOU
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
5 candidate(s): ready 0 | review 4 | blocked 0 | already in Bouldeer 1 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (1)
- cn-gz-001 "Mars Climbing Gym (Yuehuicheng)" -> seed-750 "Mars Climbing Gym (Liwan)" (same-name, 691 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (4)
- cn-gz-002 "Mars Climbing Gym (Qiaonanhui)" [g-989e80b049] reviewed_against must include: seed-741
  - importer-probable-duplicate: seed-741 same-name-but-pin-differs 1805 m
  - name-match: seed-741 "Mars Climbing Gym (Qiaonanhui)": same-name-but-pin-differs ("Mars Climbing Gym (Qiaonanhui)" / "Mars Climbing Gym (Qiaonanhui)", 1805 m)
- cn-gz-003 "BoulderDash Climbing Gym (Jiankanggang)" [g-1ce87d50a4] reviewed_against must include: cn-gz-004, seed-736
  - importer-probable-duplicate: seed-736 same-name-but-pin-differs 8149 m
  - name-match: candidate cn-gz-004 "BoulderDash Climbing Gym (Wanbo)": same-name-but-pin-differs ("BoulderDash Climbing Gym (Jiankanggang)" / "BoulderDash Climbing Gym (Wanbo)", 10764 m)
  - name-match: seed-736 "BoulderDash Climbing Gym (Sijitiandi)": same-name-but-pin-differs ("BoulderDash Climbing Gym (Jiankanggang)" / "BoulderDash Climbing Gym (Sijitiandi)", 8149 m)
- cn-gz-004 "BoulderDash Climbing Gym (Wanbo)" [g-a9f7f45c84] reviewed_against must include: cn-gz-003, seed-736
  - importer-probable-duplicate: seed-736 same-name-but-pin-differs 10594 m
  - name-match: candidate cn-gz-003 "BoulderDash Climbing Gym (Jiankanggang)": same-name-but-pin-differs ("BoulderDash Climbing Gym (Wanbo)" / "BoulderDash Climbing Gym (Jiankanggang)", 10764 m)
  - name-match: seed-736 "BoulderDash Climbing Gym (Sijitiandi)": same-name-but-pin-differs ("BoulderDash Climbing Gym (Wanbo)" / "BoulderDash Climbing Gym (Sijitiandi)", 10594 m)
- cn-gz-005 "Unfollow Climbing Gym (Liuhua Center)" [g-47165537dd] reviewed_against must include: seed-745
  - importer-probable-duplicate: seed-745 same-name-but-pin-differs 9101 m
  - name-match: seed-745 "Unfollow Climbing Gym (Haizhu Shixi)": same-name-but-pin-differs ("Unfollow Climbing Gym (Liuhua Center)" / "Unfollow Climbing Gym (Haizhu Shixi)", 9101 m)

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-01-cn-guangzhou`.
Nothing here touches production.
