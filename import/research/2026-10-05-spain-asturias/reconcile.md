# Regional research: Spain: Asturias gap (Sputnik Asturias) (2026-10-05-spain-asturias)

Scope: ES / ASTURIAS
Index: 2272 gyms, sha256 c97e3035f020… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
8 candidate(s): ready 3 | review 3 | blocked 2 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (3)
- as-003 "One Move" [g-3ddf4ebd10] reviewed_against must include: g-898c692e96
  - importer-probable-duplicate: g-898c692e96 similar-name-nearby 186 m
  - name-match: g-898c692e96 "One Move - Gijón": similar-name-nearby ("One Move" / "One Move - Gijón", 186 m)
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- as-004 "Boulder Moss Club de Escalada" [g-98833b356d]
  - limited-access: club wall: check it is open to the public
- as-006 "Climbat Avilés" [g-d0763aa449] reviewed_against must include: g-dc0eedb36f
  - importer-probable-duplicate: g-dc0eedb36f same-name-but-pin-differs 1074 m
  - name-match: g-dc0eedb36f "Climbat - Avilés": same-name-but-pin-differs ("Climbat Avilés" / "Climbat - Avilés", 1074 m)
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building

## Blocked: cannot be accepted (2)
- as-007 "El Roko": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- as-008 "Rocódromo La Calzada (Mata Jove)": not-a-gym (category other) -> suggested: reject not-a-gym

## Ready (no flags; still needs an explicit accept) (3)
- as-001 "Sputnik Climbing Asturias" [g-e058446ef8]
- as-002 "Boulder Up Climbing Café" [g-8ac1bedb31]
- as-005 "Torresamper Climbing Center" [g-042e011bc3]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-spain-asturias`.
Nothing here touches production.
