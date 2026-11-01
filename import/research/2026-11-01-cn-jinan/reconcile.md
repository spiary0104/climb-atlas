# Regional research: China: Jinan (2026-11-01-cn-jinan)

Scope: CN / JINAN
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-11-01-cn-guangzhou, 2026-11-02-cn-hangzhou
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
3 candidate(s): ready 1 | review 1 | blocked 1 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- cn-jn-002 "515 Climbing (Eurasia Plaza)" [g-581042d942] reviewed_against must include: cn-jn-003
  - importer-probable-duplicate: g-dfe643fd9a same-name-but-pin-differs 14002 m
  - name-match: candidate cn-jn-003 "515 Climbing (Shimao Xinhuan)": same-name-but-pin-differs ("515 Climbing (Eurasia Plaza)" / "515 Climbing (Shimao Xinhuan)", 14002 m)

## Blocked: cannot be accepted (1)
- cn-jn-003 "515 Climbing (Shimao Xinhuan)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (1)
- cn-jn-001 "Flow Climbing" [g-70c16a57b3]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-01-cn-jinan`.
Nothing here touches production.
