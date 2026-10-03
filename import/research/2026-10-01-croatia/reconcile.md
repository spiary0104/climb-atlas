# Regional research: Croatia (Tier B, wave 2) (2026-10-01-croatia)

Scope: HR (whole country)
Index: 2306 gyms, sha256 3b20e7b458c7… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
11 candidate(s): ready 0 | review 5 | blocked 5 | already in Bouldeer 1 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (1)
- hr-005 "SPK Lapis (Dom mladih boulder hall)" -> seed-1483 "Spk Lapis" (same-name, 204 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (5)
- hr-001 "The Hive Zagreb" [g-330564b6a2] reviewed_against must include: seed-1479, seed-1480, seed-1481
  - importer-probable-duplicate: seed-1479 co-located 0 m; seed-1480 co-located 0 m; seed-1481 renamed-or-related-name-nearby 0 m
  - name-match: seed-1479 "Boulder Zona": co-located ("The Hive Zagreb" / "Boulder Zona", 0 m)
  - name-match: seed-1480 "Fothia Velesajam dvorana za penjanje": co-located ("The Hive Zagreb" / "Fothia Velesajam dvorana za penjanje", 0 m)
  - name-match: seed-1481 "The Hive Zagreb - Climbing & Yoga": renamed-or-related-name-nearby ("The Hive Zagreb" / "The Hive Zagreb - Climbing & Yoga", 0 m)
- hr-002 "Boulder Zona" [g-0b3040ef0f] reviewed_against must include: seed-1479
  - importer-probable-duplicate: seed-1479 same-name-but-pin-differs 9560 m
  - name-match: seed-1479 "Boulder Zona": same-name-but-pin-differs ("Boulder Zona" / "Boulder Zona", 9560 m)
- hr-003 "Fothia Zagreb Fair (Velesajam)" [g-99878930b3] reviewed_against must include: seed-1480
  - related-name-nearby: seed-1480 "Fothia Velesajam dvorana za penjanje": related names "Fothia Velesajam" / "Fothia Velesajam dvorana za penjanje" 4617 m apart
- hr-004 "BoldeRi" [g-2efa49968e]
  - single-source: all evidence comes from one source
- hr-008 "SPK Vertikal Varazdin climbing hall" [g-49248af586]
  - limited-access: club wall: check it is open to the public

## Blocked: cannot be accepted (5)
- hr-006 "SPK Marulianus climbing centre": coarse-coordinates (coordinates only locate the area, not the gym) -> suggested: defer
- hr-007 "SPK Tuhobic climbing hall": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- hr-009 "SPK Bastion Osijek hall": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- hr-010 "Momentum Boulder": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- hr-011 "SPK Direkt Lepoglava hall": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-croatia`.
Nothing here touches production.
