# Regional research: New Zealand (pilot) (2026-09-30-new-zealand)

Scope: NZ (whole country)
Index: 2317 gyms, sha256 25eb60f4ba70… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
18 candidate(s): ready 5 | review 7 | blocked 1 | already in Bouldeer 5 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (5)
- nz-001 "Boulder Co. Auckland" -> seed-477 "Boulder Co Auckland" (same-name, 290 m)
- nz-003 "Auckland Climbing Gym" -> seed-479 "Auckland Climbing Gym" (same-name, 21 m)
- nz-004 "Extreme Edge Panmure" -> seed-480 "Extreme Edge Panmure" (same-name, 275 m)
- nz-012 "Fergs Wellington" -> seed-481 "Fergs Wellington" (same-name, 49 m)
- nz-013 "Boulder Co. Christchurch" -> seed-485 "Boulder Co Christchurch" (same-name, 55 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (7)
- nz-002 "Northern Rocks" [g-786e3a0553] reviewed_against must include: seed-478
  - importer-probable-duplicate: seed-478 same-name-but-pin-differs 1548 m
  - name-match: seed-478 "Northern Rocks": same-name-but-pin-differs ("Northern Rocks" / "Northern Rocks", 1548 m)
  - weak-coordinates: coordinates are street-level, not the building
- nz-005 "Boulder Co. Hamilton" [g-4777e1dfc8]
  - single-source: all evidence comes from one source
- nz-011 "Massey University Climbing Wall" [g-0c56ed9ae8]
  - limited-access: university wall: check it is open to the public
  - single-source: all evidence comes from one source
- nz-014 "Uprising Bouldering" [g-d8a4c66a45] reviewed_against must include: seed-484
  - importer-probable-duplicate: seed-484 renamed-or-related-name-nearby 0 m
  - name-match: seed-484 "Uprising Boulder Gym": renamed-or-related-name-nearby ("Uprising Bouldering" / "Uprising Boulder Gym", 0 m)
- nz-015 "The Adventure Centre Climbing Wall (The Kind Foundation, formerly YMCA Roxx)" [g-3d6c85ae88]
  - single-source: all evidence comes from one source
- nz-016 "Resistance Climbing" [g-c83c08e524]
  - weak-coordinates: coordinates are street-level, not the building
- nz-017 "The Gravity Well" [g-51ca2c73d6]
  - single-source: all evidence comes from one source

## Blocked: cannot be accepted (1)
- nz-018 "Vertical Limits": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: reject closed

## Ready (no flags; still needs an explicit accept) (5)
- nz-006 "Extreme Edge Hamilton" [g-d6c9fc20c6]
- nz-007 "Turangi Climbing Gym" [g-a3b46353a6]
- nz-008 "The Edge Indoor Rockwall (Taupo)" [g-7d5b01519a]
- nz-009 "Rocktopia" [g-fd4da13330]
- nz-010 "The Crux Climbing Space (YMCA Taranaki)" [g-5d090f1fec]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-09-30-new-zealand`.
Nothing here touches production.
