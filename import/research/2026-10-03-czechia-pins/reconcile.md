# Regional research: Czechia pin re-record (7 deferred candidates) (2026-10-03-czechia-pins)

Scope: CZ (whole country)
Index: 2341 gyms, sha256 3a79f5cf6f8d… | staged batches compared: none | other sections compared: 2026-10-01-czechia
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
7 candidate(s): ready 0 | review 7 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (7)
- cz-004 "Boulder V síti" [g-0afab3b30c] reviewed_against must include: 2026-10-01-czechia#cz-004
  - other-section: 2026-10-01-czechia#cz-004 "Boulder V síti": name-match same-name ("Boulder V síti" / "Boulder V síti", 156 m)
  - weak-coordinates: coordinates are street-level, not the building
- cz-015 "Jungle Pardubice" [g-17381ec784] reviewed_against must include: 2026-10-01-czechia#cz-015
  - other-section: 2026-10-01-czechia#cz-015 "Jungle Pardubice": name-match same-name ("Jungle Pardubice" / "Jungle Pardubice", 184 m)
- cz-016 "Gekon Boulder Bar" [g-5d6a16c6f8] reviewed_against must include: 2026-10-01-czechia#cz-016
  - other-section: 2026-10-01-czechia#cz-016 "Gekon Boulder Bar": name-match same-name ("Gekon Boulder Bar" / "Gekon Boulder Bar", 184 m)
  - weak-coordinates: coordinates are street-level, not the building
- cz-017 "MakakAréna" [g-b083192899] reviewed_against must include: 2026-10-01-czechia#cz-017
  - other-section: 2026-10-01-czechia#cz-017 "MakakAréna": name-match same-name ("MakakAréna" / "MakakAréna", 154 m)
- cz-021 "Limit Boulder" [g-e43165892c] reviewed_against must include: 2026-10-01-czechia#cz-020, 2026-10-01-czechia#cz-021
  - other-section: 2026-10-01-czechia#cz-020 "Stěna Lanovka": related-name-nearby related names "Limit Boulder České Budějovice" / "Lanovka České Budějovice" 2125 m apart
  - other-section: 2026-10-01-czechia#cz-021 "Limit Boulder": name-match same-name ("Limit Boulder" / "Limit Boulder", 188 m)
  - single-source: all evidence comes from one source
- cz-022 "V16" [g-648f4f1542] reviewed_against must include: 2026-10-01-czechia#cz-022
  - other-section: 2026-10-01-czechia#cz-022 "V16": name-match same-name ("V16" / "V16", 155 m)
- cz-025 "Komec" [g-4b13af1f36] reviewed_against must include: 2026-10-01-czechia#cz-025
  - other-section: 2026-10-01-czechia#cz-025 "Komec": name-match same-name ("Komec" / "Komec", 139 m)

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-03-czechia-pins`.
Nothing here touches production.
