# Regional research: Spain: owner manual checks (2026-10-06) (2026-10-05-spain-owner-checks)

Scope: ES / ASTURIAS
Index: 2412 gyms, sha256 930823b07e4d… | staged batches compared: 2026-10-05-uk-owner-checks | other sections compared: 2026-10-05-spain-asturias, 2026-10-06-spain-holds
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
1 candidate(s): ready 0 | review 1 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- eso-001 "El Roko" [g-9be2fb9806] reviewed_against must include: 2026-10-05-spain-asturias#as-007, 2026-10-06-spain-holds#esh-001
  - other-section: 2026-10-05-spain-asturias#as-007 "El Roko": name-match same-name ("El Roko" / "El Roko", 0 m)
  - other-section: 2026-10-06-spain-holds#esh-001 "El Roko": name-match same-name ("El Roko" / "El Roko", 0 m)

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-spain-owner-checks`.
Nothing here touches production.
