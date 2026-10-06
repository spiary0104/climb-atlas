# Regional research: Ukraine (Tier C, wave 3A) (2026-10-01-ukraine)

Scope: UA (whole country)
Index: 2419 gyms, sha256 e50072d61b4c… | staged batches compared: 2026-10-01-peru, 2026-10-01-serbia | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
16 candidate(s): ready 2 | review 5 | blocked 7 | already in Bouldeer 2 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (2)
- ua-001 "Hyperion" -> seed-1705 "Hyperion" (same-name, 16 m)
- ua-002 "UP!" -> seed-1701 "UP!" (same-name, 29 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (5)
- ua-003 "Funattic" [g-2356a5d9e9] reviewed_against must include: seed-1702
  - related-name-nearby: seed-1702 "Tsekh Climbing Gym": related names "Tsekh" / "Tsekh Climbing Gym" 5719 m apart
- ua-004 "KPI Climbing Club" [g-26b7401a1f]
  - limited-access: club wall: check it is open to the public
- ua-006 "The Wall Lviv" [g-5830ef64bf] reviewed_against must include: ua-007
  - related-name-nearby: candidate ua-007 "Bukhta": related names "Скеледром The Wall" / "Скеледром Бухта" 1428 m apart
- ua-009 "FormAT" [g-8ef7fc893a]
  - limited-access: club wall: check it is open to the public
- ua-014 "Climbing Room (Girska Maisternia)" [g-e2d66e5d52]
  - limited-access: club wall: check it is open to the public

## Blocked: cannot be accepted (7)
- ua-005 "The Wall Kyiv": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ua-007 "Bukhta": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- ua-011 "La Scala": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ua-012 "Skala": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ua-013 "Energy Wall": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ua-015 "SK Dynamica": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- ua-016 "Ostriv": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (2)
- ua-008 "MurawayNick" [g-39090687fe]
- ua-010 "Montana" [g-d0a5fe3997]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-ukraine`.
Nothing here touches production.
