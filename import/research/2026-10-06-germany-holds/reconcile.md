# Regional research: Germany: Thüringen, Sachsen-Anhalt, Saarland gyms on hold (second pass) (2026-10-06-germany-holds)

Scope: DE / THURINGEN, SACHSEN_ANHALT, SAARLAND
Index: 2385 gyms, sha256 e1d9ef5216f8… | staged batches compared: 2026-10-06-france-holds | other sections compared: 2026-10-05-germany-east-saar-berlin
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
6 candidate(s): ready 0 | review 3 | blocked 3 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (3)
- dh-003 "Life Kletterhalle Saalfeld" [g-0336b04f7e] reviewed_against must include: 2026-10-05-germany-east-saar-berlin#dee-010
  - other-section: 2026-10-05-germany-east-saar-berlin#dee-010 "Life Kletterhalle Saalfeld": name-match same-name ("Life Kletterhalle Saalfeld" / "Life Kletterhalle Saalfeld", 677 m)
- dh-004 "St. Veit Climbing Tower (DAV Meiningen)" [g-2a33a4832d] reviewed_against must include: 2026-10-05-germany-east-saar-berlin#dee-012
  - limited-access: club wall: check it is open to the public
  - other-section: 2026-10-05-germany-east-saar-berlin#dee-012 "St. Veit Kletterturm (DAV Meiningen)": name-match renamed-or-related-name-nearby ("St. Veit Climbing Tower (DAV Meiningen)" / "St. Veit Kletterturm (DAV Meiningen)", 9 m)
- dh-006 "DAV Kletterhalle Ensdorf" [g-e5002a3142] reviewed_against must include: 2026-10-05-germany-east-saar-berlin#dee-026
  - limited-access: club wall: check it is open to the public
  - other-section: 2026-10-05-germany-east-saar-berlin#dee-026 "DAV Kletterhalle Ensdorf": name-match same-name ("DAV Kletterhalle Ensdorf" / "DAV Kletterhalle Ensdorf", 0 m)

## Blocked: cannot be accepted (3)
- dh-001 "Kletterhütte Ilmenau": status-not-open (status_claim is opening-soon); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- dh-002 "Kletter- & Freizeithalle Schmölln": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- dh-005 "Kletterzentrum Zuckerturm": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-germany-holds`.
Nothing here touches production.
