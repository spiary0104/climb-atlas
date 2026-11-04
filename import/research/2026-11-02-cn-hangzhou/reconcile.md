# Regional research: China: Hangzhou (2026-11-02-cn-hangzhou)

Scope: CN / HANGZHOU
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-11-01-cn-guangzhou
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
2 candidate(s): ready 0 | review 1 | blocked 1 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- cn-hz-001 "Luna Climbing (Binjiang Yintai)" [g-63296cf543] reviewed_against must include: seed-722
  - importer-probable-duplicate: seed-722 same-name-but-pin-differs 1556 m
  - name-match: seed-722 "Luna Climbing (Hualian Xingguang Ave Phase 2)": same-name-but-pin-differs ("Luna Climbing (Binjiang Yintai)" / "Luna Climbing (Hualian Xingguang Ave Phase 2)", 1556 m)

## Blocked: cannot be accepted (1)
- cn-hz-002 "Banana+ Climbing (Hangzhou Center)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-02-cn-hangzhou`.
Nothing here touches production.
