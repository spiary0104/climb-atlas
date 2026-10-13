# Regional research: Brazil: city coverage gap (2026-10-13-brazil)

Scope: BR (whole country)
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
21 candidate(s): ready 0 | review 11 | blocked 6 | already in Bouldeer 4 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (4)
- br-013 "Casa de Pedra Moema" -> seed-1405 "Casa de Pedra - Moema" (same-name, 0 m) | also: no-bouldering-evidence
- br-014 "Casa de Pedra Perdizes" -> seed-1404 "Casa de Pedra - Perdizes" (same-name, 1 m) | also: no-bouldering-evidence
- br-015 "Fabrica Escalada Chácara Santo Antônio" -> seed-1407 "FABRICA Escalada - Chácara Santo Antônio" (same-name, 21 m)
- br-016 "Fabrica Escalada Vila Madalena" -> seed-1408 "FABRICA Escalada - Vila Madalena" (same-name, 7 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (11)
- br-001 "PowerBloc" [g-36fb40b6c2]
  - single-source: all evidence comes from one source
- br-002 "Geometrik Escalada" [g-a17ba67941]
  - single-source: all evidence comes from one source
- br-003 "UBT Escalada Brasília" [g-0555cd2aa8]
  - single-source: all evidence comes from one source
- br-004 "Toca Escalada Indoor" [g-4f246e9a6e]
  - single-source: all evidence comes from one source
- br-005 "Café com Magnésio" [g-b6eb3eec53]
  - importer-warning: far-from-country: nearest known BR gym is 1884 km away -- check coordinates/country
  - single-source: all evidence comes from one source
- br-006 "Campo Base Ginásio de Escalada" [g-6922e37b19]
  - single-source: all evidence comes from one source
- br-007 "Eleva Escalada" [g-b2917fcfdc]
  - single-source: all evidence comes from one source
- br-009 "República dos Macacos" [g-f12099e732]
  - single-source: all evidence comes from one source
- br-010 "Meru C3" [g-ce9315de2b]
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- br-017 "Evolução Escalada Indoor" [g-8be6250f39] reviewed_against must include: seed-1410
  - importer-probable-duplicate: seed-1410 renamed-or-related-name-nearby 13 m
  - name-match: seed-1410 "Evolução Escalada Indoor - Botafogo": renamed-or-related-name-nearby ("Evolução Escalada Indoor" / "Evolução Escalada Indoor - Botafogo", 13 m)
  - single-source: all evidence comes from one source
- br-021 "ROKAZ Escalada Savassi" [g-d596bcced0] reviewed_against must include: seed-1414, seed-1415
  - importer-probable-duplicate: seed-1414 co-located 0 m; seed-1415 co-located 0 m
  - name-match: seed-1414 "ROKAZ Academy Climbing and Fitness": co-located ("ROKAZ Escalada Savassi" / "ROKAZ Academy Climbing and Fitness", 0 m)
  - name-match: seed-1415 "ROKAZ Unidade Buritis": co-located ("ROKAZ Escalada Savassi" / "ROKAZ Unidade Buritis", 0 m)
  - single-source: all evidence comes from one source

## Blocked: cannot be accepted (6)
- br-008 "TreeLab": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- br-011 "IpeRocks": outdoor-area (outdoor climbing areas are not gyms); status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)); coarse-coordinates (coordinates only locate the area, not the gym) -> suggested: reject outdoor-area
- br-012 "90 Graus Escalada Esportiva": no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer
- br-018 "UBT Escalada Curitiba": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- br-019 "Caverna Escalada": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer
- br-020 "Via AltaMontanha": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-13-brazil`.
Nothing here touches production.
