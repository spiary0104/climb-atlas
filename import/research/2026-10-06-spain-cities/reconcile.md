# Regional research: Spain: Barcelona, Madrid, Valencia, Andalucía, País Vasco coverage gap (2026-10-06-spain-cities)

Scope: ES / CATALUNYA, MADRID, COMUNIDAD_VALENCIANA, ANDALUCIA, PAIS_VASCO
Index: 2438 gyms, sha256 27073d25c2df… | staged batches compared: none | other sections compared: 2026-10-05-spain-asturias, 2026-10-05-spain-owner-checks, 2026-10-06-spain-holds
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
43 candidate(s): ready 33 | review 7 | blocked 3 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (7)
- es-005 "BDN Climb" [g-dfe1048b5c]
  - weak-coordinates: coordinates are street-level, not the building
- es-011 "La Panxa del Bou" [g-554d9d9f07]
  - weak-coordinates: coordinates are street-level, not the building
- es-019 "Fanàtic Lleida" [g-a6c9db394f] reviewed_against must include: es-020
  - related-name-nearby: candidate es-020 "Boulder Indoor": related names "Fanàtic Lleida" / "Boulder Indoor Lleida" 1978 m apart
- es-020 "Boulder Indoor" [g-91d3229d69] reviewed_against must include: es-019
  - related-name-nearby: candidate es-019 "Fanàtic Lleida": related names "Boulder Indoor Lleida" / "Fanàtic Lleida" 1978 m apart
- es-021 "Rocòdrom Les Agulles" [g-d3910c2fc0]
  - weak-coordinates: coordinates are street-level, not the building
- es-026 "Arkose Madrid Carabanchel" [g-29bd2c8625] reviewed_against must include: seed-1241, seed-1242
  - related-name-nearby: seed-1241 "Arkose - Madrid": related names "Arkose Madrid Carabanchel" / "Arkose - Madrid" 7098 m apart
  - related-name-nearby: seed-1242 "Boulder Madrid": related names "Arkose Madrid Carabanchel" / "Boulder Madrid" 5572 m apart
- es-038 "Bayyana Climbing" [g-42f8062a7f]
  - weak-coordinates: coordinates are street-level, not the building

## Blocked: cannot be accepted (3)
- es-003 "Indoorwall Vic": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- es-004 "Indoorwall Vilanova i la Geltrú": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- es-025 "Indoorwall Getafe": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (33)
- es-001 "Indoorwall Hospitalet de Llobregat" [g-44e5cc575e]
- es-002 "Indoorwall Manresa" [g-8537623c7f]
- es-006 "Kraken Bloc Granollers" [g-f791b814cd]
- es-007 "Freebloc" [g-23e95b8848]
- es-008 "Golem Arenys" [g-cfe126372f]
- es-009 "Ingravita" [g-28f158d2f9]
- es-010 "La Bauma" [g-9b0e7cca6f]
- es-012 "FLASHH Barcelona" [g-895a437e1b]
- es-013 "Búlder Planet Mataró" [g-9ea0a82eb4]
- es-014 "Búlder Planet Vallès" [g-f5adc554a0]
- es-015 "La Bloquera" [g-0ba439ce08]
- es-016 "Rockart Climbing & Coworking" [g-ea022bf312]
- es-017 "Monobloc Reus" [g-c2853cbb56]
- es-018 "SLAB Sala d'Escalada" [g-51c4fb316f]
- es-022 "Climbbox" [g-467aeb2a5b]
- es-023 "Rockandbloc" [g-eaf38da56c]
- es-024 "Indoorwall Torrejón" [g-33b8c34baf]
- es-027 "Awesome Boulder Center" [g-ab41a4bb5c]
- es-028 "La Reunión Escalada" [g-51de64e903]
- es-029 "Planet Vertical" [g-e79b16a506]
- es-030 "The Climb" [g-fdcaf7d815]
- es-031 "Indoorwall Alicante" [g-76764ca659]
- es-032 "Laif Climbing Gym" [g-947f369511]
- es-033 "Vents Búlder" [g-58c3ca0ce2]
- es-034 "ClimbPro Center" [g-8cd75fe6cc]
- es-035 "Piugaz" [g-a21e09684e]
- es-036 "Urban Boulder" [g-9b06dd1215]
- es-037 "AtariA Boulder" [g-9aafcd8425]
- es-039 "Rocòdrom 9C" [g-de4c11e36c]
- es-040 "Can Bombo" [g-a0092b5d0a]
- es-041 "Cal Mico" [g-5e5bc8e1ac]
- es-042 "Klimb Zarautz" [g-b5f67ffe7a]
- es-043 "Boulder Vallecas" [g-0a1cc86f10]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-spain-cities`.
Nothing here touches production.
