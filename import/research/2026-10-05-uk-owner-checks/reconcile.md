# Regional research: UK: owner manual checks (2026-10-06) (2026-10-05-uk-owner-checks)

Scope: GB (whole country)
Index: 2412 gyms, sha256 930823b07e4d… | staged batches compared: none | other sections compared: 2026-10-05-uk-holds-gaps, 2026-10-05-uk-single-gym-towns
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
3 candidate(s): ready 0 | review 2 | blocked 1 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- uko-001 "Northern Problems" [g-039b6ea9b5] reviewed_against must include: 2026-10-05-uk-holds-gaps#northern-problems-whitehaven, 2026-10-05-uk-single-gym-towns#northern-problems-whitehaven
  - other-section: 2026-10-05-uk-holds-gaps#northern-problems-whitehaven "Northern Problems": name-match same-name ("Northern Problems" / "Northern Problems", 0 m)
  - other-section: 2026-10-05-uk-single-gym-towns#northern-problems-whitehaven "Northern Problems": name-match same-name ("Northern Problems" / "Northern Problems", 0 m)
- uko-002 "The Adventure Hub" [g-ddbd31743b] reviewed_against must include: 2026-10-05-uk-holds-gaps#adventure-hub-bamford
  - other-section: 2026-10-05-uk-holds-gaps#adventure-hub-bamford "The Adventure Hub": name-match same-name ("The Adventure Hub" / "The Adventure Hub", 445 m)

## Blocked: cannot be accepted (1)
- uko-003 "Street Rocks": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering (confirmed rope-only (new additions need a bouldering offering)); coarse-coordinates (coordinates only locate the area, not the gym) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-uk-owner-checks`.
Nothing here touches production.
