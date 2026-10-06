# Regional research: Poland: coverage gap (2026-10-06-poland)

Scope: PL (whole country)
Index: 2438 gyms, sha256 27073d25c2df… | staged batches compared: 2026-10-06-de-south, 2026-10-06-london, 2026-10-06-us-midwest | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
17 candidate(s): ready 9 | review 1 | blocked 7 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (1)
- pl-002 "Murall Górczewska" [g-8d95f7b16d] reviewed_against must include: seed-1304
  - related-name-nearby: seed-1304 "Murall Centrum Wspinaczkowe + FunClimb": related names "Centrum Wspinaczkowe Murall Górczewska" / "Murall Centrum Wspinaczkowe + FunClimb" 10436 m apart

## Blocked: cannot be accepted (7)
- pl-011 "OnSight Centrum Wspinaczkowe": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: reject closed
- pl-012 "Grimpado Boulder Studio": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- pl-013 "Centrum Wspinaczkowe Stratosfera": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- pl-014 "Ściana Wspinaczkowa Elewator": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- pl-015 "Ściana Wspinaczkowa Mono": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- pl-016 "Arête Bouldering": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- pl-017 "Spot Boulder Caffe": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (9)
- pl-001 "Murall Gdańsk" [g-330bee3957]
- pl-003 "Problem Bouldering" [g-8deb5db5eb]
- pl-004 "LIMBO Bouldering" [g-594ff774cf]
- pl-005 "BLO Katowice" [g-1716753043]
- pl-006 "Poziom 450" [g-374c9207ae]
- pl-007 "Bald Port" [g-02c591a744]
- pl-008 "VOLT Boulderownia Łódź" [g-4e5d3ef7e5]
- pl-009 "Centrum Wspinaczkowe Spider" [g-de64c0c99d]
- pl-010 "Centrum Wspinaczkowe Flash" [g-bf3e47bb00]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-poland`.
Nothing here touches production.
