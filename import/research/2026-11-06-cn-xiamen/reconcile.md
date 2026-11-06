# Regional research: China: Xiamen (2026-11-06-cn-xiamen)

Scope: CN / XIAMEN
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul, 2026-10-13-australia, 2026-10-13-brazil, 2026-10-13-italy-cities, 2026-10-13-jp-remaining, 2026-10-13-uk-cities, 2026-10-13-us-central-metros, 2026-10-13-us-ny-boston-metros | other sections compared: 2026-11-01-cn-guangzhou, 2026-11-01-cn-jinan, 2026-11-02-cn-hangzhou, 2026-11-06-cn-changsha, 2026-11-06-cn-dali, 2026-11-06-cn-kunming, 2026-11-06-cn-qingdao, 2026-11-06-cn-wenzhou
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
4 candidate(s): ready 2 | review 2 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- cn-xm-003 "On Sight Climbing (Caitang, Nixi Strength)" [g-f5417945bd] reviewed_against must include: cn-xm-004
  - importer-probable-duplicate: g-3ab3d2e57a same-name-but-pin-differs 3560 m
  - name-match: candidate cn-xm-004 "On Sight Climbing (Tapu)": same-name-but-pin-differs ("On Sight Climbing (Caitang, Nixi Strength)" / "On Sight Climbing (Tapu)", 3560 m)
- cn-xm-004 "On Sight Climbing (Tapu)" [g-3ab3d2e57a] reviewed_against must include: cn-xm-003
  - importer-probable-duplicate: g-f5417945bd same-name-but-pin-differs 3560 m
  - name-match: candidate cn-xm-003 "On Sight Climbing (Caitang, Nixi Strength)": same-name-but-pin-differs ("On Sight Climbing (Tapu)" / "On Sight Climbing (Caitang, Nixi Strength)", 3560 m)

## Ready (no flags; still needs an explicit accept) (2)
- cn-xm-001 "Longjing Climbing (Baolong One City)" [g-a78a45edef]
- cn-xm-002 "On Sight Climbing (Jimei)" [g-1f5684e06f]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-06-cn-xiamen`.
Nothing here touches production.
