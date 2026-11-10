# Regional research: China: Kunming (2026-11-06-cn-kunming)

Scope: CN / KUNMING
Index: 3433 gyms, sha256 ad459783ea35… | staged batches compared: 2026-10-06-kr-seoul, 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali | other sections compared: 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou, 2026-11-06-cn-xiamen
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
2 candidate(s): ready 0 | review 2 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- cn-km-001 "Nayan Climbing (Tuodong)" [g-5cd08d937f] reviewed_against must include: cn-km-002
  - importer-probable-duplicate: g-9c56253b23 same-name-but-pin-differs 11063 m
  - name-match: candidate cn-km-002 "Nayan Climbing (0871)": same-name-but-pin-differs ("Nayan Climbing (Tuodong)" / "Nayan Climbing (0871)", 11063 m)
- cn-km-002 "Nayan Climbing (0871)" [g-9c56253b23] reviewed_against must include: cn-km-001
  - importer-probable-duplicate: g-5cd08d937f same-name-but-pin-differs 11063 m
  - name-match: candidate cn-km-001 "Nayan Climbing (Tuodong)": same-name-but-pin-differs ("Nayan Climbing (0871)" / "Nayan Climbing (Tuodong)", 11063 m)

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-06-cn-kunming`.
Nothing here touches production.
