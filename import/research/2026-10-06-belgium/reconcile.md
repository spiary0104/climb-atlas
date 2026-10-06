# Regional research: Belgium: coverage gap (2026-10-06-belgium)

Scope: BE (whole country)
Index: 2438 gyms, sha256 27073d25c2df… | staged batches compared: 2026-10-06-de-south, 2026-10-06-netherlands | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
21 candidate(s): ready 13 | review 4 | blocked 4 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (4)
- be-004 "Klimzaal Boulder" [g-d91bb7acc2] reviewed_against must include: be-008
  - related-name-nearby: candidate be-008 "Klimzaal De Stordeur": related names "Klimzaal Boulder" / "Klimzaal De Stordeur" 2835 m apart
- be-008 "Klimzaal De Stordeur" [g-4afaea7526] reviewed_against must include: be-004
  - related-name-nearby: candidate be-004 "Klimzaal Boulder": related names "Klimzaal De Stordeur" / "Klimzaal Boulder" 2835 m apart
- be-017 "À BLOC" [g-600590e6a2]
  - weak-coordinates: coordinates are street-level, not the building
- be-019 "Stone Age" [g-aff3f21803]
  - limited-access: club wall: check it is open to the public

## Blocked: cannot be accepted (4)
- be-005 "Klimkaffee Mechelen": status-not-open (status_claim is unknown) -> suggested: defer
- be-006 "Klimkaffee Herentals": status-not-open (status_claim is unknown) -> suggested: defer
- be-014 "Klimax (BVKB)": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- be-028 "Le Camp de Base Ixelles": status-not-open (status_claim is opening-soon); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (13)
- be-001 "Klimzaal Banzai" [g-be576e1384]
- be-003 "Blackbox Boulder" [g-8d5c68d329]
- be-007 "Crux Bouldergym" [g-85c936f30a]
- be-009 "Monk bouldergym Hasselt" [g-c0ab118fcd]
- be-010 "Pink Peaks" [g-bcc441587f]
- be-011 "Hall9" [g-23cbf3407a]
- be-012 "Bouldergym City Lizard" [g-20f3d88ecf]
- be-013 "Gustaaf Klimt" [g-7934dbc05b]
- be-015 "Petite Île" [g-0045261756]
- be-016 "New Rock" [g-b49956dc3b]
- be-023 "L'Escale Arlon" [g-b384fc40d1]
- be-024 "Face Nord" [g-8e4e30c6ec]
- be-025 "BeBloc" [g-9425ab2e37]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-belgium`.
Nothing here touches production.
