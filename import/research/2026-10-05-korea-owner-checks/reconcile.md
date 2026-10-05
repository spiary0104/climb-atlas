# Regional research: Korea: owner manual checks (2026-10-06) (2026-10-05-korea-owner-checks)

Scope: KR / JEOLLANAM
Index: 2412 gyms, sha256 930823b07e4d… | staged batches compared: 2026-10-05-germany-owner-checks, 2026-10-05-italy-owner-checks, 2026-10-05-spain-owner-checks, 2026-10-05-uk-owner-checks | other sections compared: 2026-10-05-korea-gwangju-jeollanam, 2026-10-05-korea-holds
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
1 candidate(s): ready 0 | review 1 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- kro-001 "Mokpo International Sport Climbing Center" [g-f412ee9caf] reviewed_against must include: 2026-10-05-korea-gwangju-jeollanam#kr-jn-002, 2026-10-05-korea-gwangju-jeollanam#kr-jn-003, 2026-10-05-korea-gwangju-jeollanam#kr-jn-006, 2026-10-05-korea-holds#kr-h-006
  - other-section: 2026-10-05-korea-gwangju-jeollanam#kr-jn-002 "Carpe Climb": related-name-nearby related names "목포국제스포츠클라이밍센터" / "카르페클라임 클라이밍센터" 2019 m apart
  - other-section: 2026-10-05-korea-gwangju-jeollanam#kr-jn-003 "Mokpo Lead Climbing Center": related-name-nearby related names "목포국제스포츠클라이밍센터" / "리드클라이밍센터" 2157 m apart
  - other-section: 2026-10-05-korea-gwangju-jeollanam#kr-jn-006 "Mokpo International Sport Climbing Center": name-match same-name ("Mokpo International Sport Climbing Center" / "Mokpo International Sport Climbing Center", 0 m)
  - other-section: 2026-10-05-korea-holds#kr-h-006 "Mokpo International Sport Climbing Center": name-match same-name ("Mokpo International Sport Climbing Center" / "Mokpo International Sport Climbing Center", 0 m)

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-korea-owner-checks`.
Nothing here touches production.
