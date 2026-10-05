# Regional research: Germany: owner manual checks (2026-10-06) (2026-10-05-germany-owner-checks)

Scope: DE / THURINGEN, SACHSEN_ANHALT
Index: 2412 gyms, sha256 930823b07e4d… | staged batches compared: 2026-10-05-italy-owner-checks, 2026-10-05-spain-owner-checks, 2026-10-05-uk-owner-checks | other sections compared: 2026-10-05-germany-east-saar-berlin, 2026-10-06-germany-holds
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
2 candidate(s): ready 0 | review 2 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- deo-001 "Kletter- & Freizeithalle Schmölln" [g-6a37cf87df] reviewed_against must include: 2026-10-05-germany-east-saar-berlin#dee-009, 2026-10-06-germany-holds#dh-002
  - limited-access: club wall: check it is open to the public
  - other-section: 2026-10-05-germany-east-saar-berlin#dee-009 "Freizeit- und Kletterhalle Schmölln": name-match co-located ("Kletter- & Freizeithalle Schmölln" / "Freizeit- und Kletterhalle Schmölln", 27 m)
  - other-section: 2026-10-06-germany-holds#dh-002 "Kletter- & Freizeithalle Schmölln": name-match same-name ("Kletter- & Freizeithalle Schmölln" / "Kletter- & Freizeithalle Schmölln", 0 m)
- deo-002 "Kletterzentrum Zuckerturm" [g-c3eb253cd7] reviewed_against must include: 2026-10-05-germany-east-saar-berlin#dee-018, 2026-10-06-germany-holds#dh-005
  - limited-access: club wall: check it is open to the public
  - other-section: 2026-10-05-germany-east-saar-berlin#dee-018 "Kletterzentrum Zuckerturm": name-match same-name ("Kletterzentrum Zuckerturm" / "Kletterzentrum Zuckerturm", 0 m)
  - other-section: 2026-10-06-germany-holds#dh-005 "Kletterzentrum Zuckerturm": name-match same-name ("Kletterzentrum Zuckerturm" / "Kletterzentrum Zuckerturm", 0 m)

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-germany-owner-checks`.
Nothing here touches production.
