# Regional research: Iran (Tier B, wave 2) (2026-10-01-iran)

Scope: IR (whole country)
Index: 2127 gyms, sha256 8dbddf7924c2… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
4 candidate(s): ready 0 | review 3 | blocked 1 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (3)
- ir-001 "Boulderland Climbing Gym" [g-a50d448379] reviewed_against must include: ir-002, ir-003
  - related-name-nearby: candidate ir-002 "Tochal Club": related names "باشگاه سنگ‌نوردی بلدرلند" / "باشگاه کوهنوردی توچال" 9156 m apart
  - related-name-nearby: candidate ir-003 "Moj Climbing Gym": related names "باشگاه سنگ‌نوردی بلدرلند" / "باشگاه سنگنوردی موج" 6177 m apart
- ir-003 "Moj Climbing Gym" [g-6a1b8f68b9] reviewed_against must include: ir-001, ir-002
  - related-name-nearby: candidate ir-001 "Boulderland Climbing Gym": related names "باشگاه سنگنوردی موج" / "باشگاه سنگ‌نوردی بلدرلند" 6177 m apart
  - related-name-nearby: candidate ir-002 "Tochal Club": related names "باشگاه سنگنوردی موج" / "باشگاه کوهنوردی توچال" 13992 m apart
  - single-source: all evidence comes from one source
- ir-004 "MZ Sport Club" [g-d99841f032]
  - limited-access: club wall: check it is open to the public

## Blocked: cannot be accepted (1)
- ir-002 "Tochal Club": coarse-coordinates (coordinates only locate the area, not the gym) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-iran`.
Nothing here touches production.
