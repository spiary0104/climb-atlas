# Regional research: Italy: city coverage gap (Milano, Veneto, Trentino-Alto Adige, Emilia-Romagna, Genova, Puglia) (2026-10-13-italy-cities)

Scope: IT / LOMBARDIA, VENETO, TRENTINO_ALTO_ADIGE, EMILIA_ROMAGNA, TOSCANA, LIGURIA, LAZIO, CAMPANIA, PUGLIA, PIEMONTE
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: 2026-10-05-italy-city-gaps, 2026-10-05-italy-owner-checks, 2026-10-06-italy-holds-napoli
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
35 candidate(s): ready 24 | review 7 | blocked 4 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (7)
- ic-009 "Vi-Block Climb Park" [g-bd1219f0ad]
  - single-source: all evidence comes from one source
- ic-026 "Rock Time Center" [g-fbfbd893a9]
  - limited-access: club wall: check it is open to the public
  - single-source: all evidence comes from one source
- ic-027 "Mad Climbers" [g-bc7f432563]
  - limited-access: club wall: check it is open to the public
- ic-028 "Deva Wall" [g-187bb38f18]
  - single-source: all evidence comes from one source
- ic-029 "Gioco Verticale" [g-fee44747b4]
  - limited-access: club wall: check it is open to the public
- ic-030 "Orizzonti Verticali" [g-1be54ff4f7]
  - limited-access: club wall: check it is open to the public
- ic-032 "Orizzonte Verticale" [g-3f02b1f8fe]
  - single-source: all evidence comes from one source

## Blocked: cannot be accepted (4)
- ic-024 "Crazy Center Firenze": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ic-025 "Crazy Center Prato": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ic-031 "Kro Climb": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- ic-035 "Sportler Climbing Center": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: reject closed

## Ready (no flags; still needs an explicit accept) (24)
- ic-001 "Boulder&Co" [g-c20daab68b]
- ic-002 "Big Walls Brugherio" [g-1208df3c99]
- ic-003 "Akira Climbing Center" [g-66ef535d16]
- ic-004 "Orobia Climbing" [g-37f5fe89b5]
- ic-005 "InVert Climb" [g-d59d7e11cd]
- ic-006 "Lezard Climbing" [g-d866344724]
- ic-007 "Stone Age Climbing Park" [g-c34951aa53]
- ic-008 "GAM Climbing" [g-adc20c05ff]
- ic-010 "Opera Verticale" [g-8fec7c2d7e]
- ic-011 "Intellighenzia Project" [g-ec88a6f54f]
- ic-012 "Arena Boulder" [g-be02773dfe]
- ic-013 "Block al Cubo" [g-899c91ab2d]
- ic-014 "Plastic Rock" [g-e1ac5f7194]
- ic-015 "Campfour Boulder" [g-5d05f1578b]
- ic-016 "Heliks Kletterzentrum Bruneck" [g-746b12b1fb]
- ic-017 "Vertikale Kletterzentrum Brixen" [g-2ec5d8247d]
- ic-018 "Ravenna Gravity Fighters" [g-bafede8b88]
- ic-019 "Vertical Forlì" [g-3fe2835d69]
- ic-020 "Pareti Sport Center" [g-2006dba61a]
- ic-021 "K2 Indoor" [g-36564e0e13]
- ic-022 "K3 Palestra di Arrampicata" [g-5c98a80031]
- ic-023 "The ForGe Climb" [g-bf5c4d83ac]
- ic-033 "BlockBusters Mondovì" [g-95c1950f90]
- ic-034 "Vertigo Climbing Village" [g-d8f2c90dbb]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-13-italy-cities`.
Nothing here touches production.
