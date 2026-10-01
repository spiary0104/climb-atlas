# Regional research: Turkiye (Tier A, wave 1) (2026-10-01-turkey)

Scope: TR (whole country)
Index: 2127 gyms, sha256 8dbddf7924c2… | staged batches compared: none | other sections compared: 2026-09-30-new-zealand, 2026-10-01-india, 2026-10-01-indonesia, 2026-10-01-israel, 2026-10-01-russia, 2026-10-01-singapore, 2026-10-01-sweden, 2026-10-01-switzerland, 2026-10-01-thailand
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
9 candidate(s): ready 1 | review 3 | blocked 4 | already in Bouldeer 1 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (1)
- tr-002 "Boulderhane" -> seed-1726 "Boulderhane" (same-name, 23 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (3)
- tr-004 "Boulder Jungle" [g-67f956b4f2]
  - single-source: all evidence comes from one source
- tr-005 "Tragos Boulder" [g-bfa3da0734]
  - single-source: all evidence comes from one source
- tr-008 "Mozaik Climbing & Bouldering" [g-09923bedce]
  - limited-access: club wall: check it is open to the public
  - single-source: all evidence comes from one source

## Blocked: cannot be accepted (4)
- tr-003 "DuvarX": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- tr-006 "Climbinn": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- tr-007 "Boulder Eskişehir": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- tr-009 "Kısakaya Ankara Tırmanış Evi": temporary (status_claim is temporary); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: reject temporary

## Ready (no flags; still needs an explicit accept) (1)
- tr-001 "Boulder Istanbul" [g-49a3a48cc8]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-turkey`.
Nothing here touches production.
