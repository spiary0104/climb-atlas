# Portugal location pass (2026-10-01)

Scope: the 23 candidates whose pin was a directory (RCP) map-service pin, plus a re-check of the 8 official-map candidates. OSM extract W2\osm\PT.json was used (it arrived during the pass). No geocoders, no Overpass.

Summary: 16 replaced (4 official-map embeds/markers/links, 1 official-map structured data, 11 OSM), 7 unresolved, 8 official-map candidates unchanged. Directory evidence entries were kept everywhere.

## Table

| cid | name | before | after | moved (m) | status | note |
|---|---|---|---|---|---|---|
| pt-001 | Climb UP | map-service-pin, RCP | osm, OSM, building | 17 | replaced | OSM name tie only (Climb Up, sports centre, 17 m from old pin); own site gives only a name search |
| pt-002 | Escala25 | map-service-pin, RCP | official-map, S2, building | 3 | replaced | embed q=lat,lng on own contact page; OSM node agrees |
| pt-003 | Vertigo Climbing Center Marvila | map-service-pin, RCP | osm, OSM, building | 11 | replaced | OSM name+website+Beira Rio address; OSM fraction S vs site fraction P |
| pt-004 | Vertigo Oriente Climbing Center | map-service-pin, RCP | osm, OSM, building | 2 | replaced | OSM name+website |
| pt-005 | CRUX Climbing Center | official-map, S4 | official-map, S4 (building) | 0 | unchanged-acceptable | own published pin, not changed |
| pt-006 | Altissimo Lisboa | map-service-pin, RCP | official-map, S5, building | 111 | replaced | own map marker (Altissimo - Lisboa) on Morada page; OSM node is ~100 m away at the old directory pin |
| pt-007 | 9.8 Gravity Climbing Lisbon | map-service-pin, RCP | osm, OSM, building | 12 | replaced | OSM name+website |
| pt-008 | Rocódromo do Areeiro - Casal Vistoso | map-service-pin, RCP | unchanged | 0 | unresolved | see below |
| pt-009 | Vertical Wall Climbing Lisbon | map-service-pin, RCP | osm, OSM, building | 17 | replaced | OSM node name+address+website (building way at same spot); own site was down (HTTP 522) |
| pt-010 | Ericeira Boulder | official-map, S7 | official-map, S7 (building) | 0 | unchanged-acceptable | own published pin, not changed |
| pt-011 | The West Climbing Center | map-service-pin, RCP | unchanged | 0 | unresolved | see below |
| pt-012 | IN WALL Climbing Center | official-map, S9 | official-map, S9 (building) | 0 | unchanged-acceptable | own published pin, not changed |
| pt-013 | Dolinas Climbing Center | official-map, S10 | official-map, S10 (building) | 0 | unchanged-acceptable | own published pin, not changed |
| pt-014 | upa! Climbing Center | official-map, S11 | official-map, S11 (building) | 0 | unchanged-acceptable | own published pin, not changed |
| pt-015 | Proa Climbing Center | official-map, S12 | official-map, S12 (building) | 0 | unchanged-acceptable | embed centre names the place and equals the pin; OSM node ~5 m away; note added |
| pt-016 | The North Wall | map-service-pin, RCP | osm, OSM, building | 6 | replaced | OSM name, unique in extract |
| pt-017 | São Rock Climbing | map-service-pin, RCP | osm, OSM, building | 4 | replaced | OSM name+address+website |
| pt-018 | Zone Climb | map-service-pin, RCP | osm, OSM, building | 30 | replaced | OSM name+address+website |
| pt-019 | Clube de Escalada da Maia | map-service-pin, RCP | unchanged | 0 | unresolved | see below |
| pt-020 | OneSoul Climbing | map-service-pin, RCP | official-map, S24, building | 0 | replaced | Squarespace map-block marker on own contactos page; site now a fitness club, status doubtful; OSM node ~80 m west |
| pt-021 | Núcleo de Montanha de Espinho | map-service-pin, RCP | unchanged | 0 | unresolved | see below |
| pt-022 | Clube de Escalada de Braga | map-service-pin, RCP | unchanged | 0 | unresolved | see below |
| pt-023 | ADEB Braga | map-service-pin, RCP | unchanged | 0 | unresolved | see below |
| pt-024 | Bloco Bouldering | map-service-pin, RCP | official-map, S14, street | 446 | replaced | own site JSON-LD geo (4 decimals, precision street); address corrected to the site's (4810-441; directory said 4835-523); old pin 446 m away, possibly a different Rua da Liberdade |
| pt-025 | Boulder Penha Garcia | map-service-pin, RCP | osm, OSM, building | 4 | replaced | OSM indoor building named Boulder de Penha Garcia; a boulder structure, not a staffed gym |
| pt-026 | Escalava | official-map, S18 | official-map, S18 (building) | 0 | unchanged-acceptable | own published pin, not changed |
| pt-027 | Madeira Climbing Center | map-service-pin, RCP | official-map, S19, building | 0 | replaced | place pin of own short link (!3d/!4d); site JSON-LD and generic embed differ (coarse, not used); OSM way agrees |
| pt-028 | Parque Desportivo de Água de Pena | map-service-pin, RCP | osm, OSM, building | 315 | replaced | OSM unnamed climbing wall tied by information link to the opencrags page for the park; 315 m from old pin; weakest tie, reviewer should check |
| pt-029 | Rocódromo de Vila Real | official-map, S17 | official-map, S17 (building) | 0 | unchanged-acceptable | own published pin, not changed |
| pt-030 | Vertical Escalada | map-service-pin, RCP | osm, OSM, building | 27 | replaced | OSM name+street+website |
| pt-031 | Rocódromo 100 Vertigens | map-service-pin, RCP | unchanged | 0 | unresolved | see below |

No replacement moved a pin more than 500 m. Largest moves: pt-024 446 m, pt-028 315 m, pt-006 111 m.

## Unresolved (directory pin left in place)

- pt-008 Rocódromo do Areeiro - Casal Vistoso: No own website (website null); the FCMP closure notice and directory only; no OSM element within 1.5 km. Directory pin kept.
- pt-011 The West Climbing Center: Gym site embed is an address-text search (q=Rua da Alfandega Peniche), no pin; no OSM element in Peniche. Directory pin kept.
- pt-019 Clube de Escalada da Maia: No own website; the council page (S21) is not an accepted pin source; no OSM element within 1.5 km. Directory pin kept.
- pt-021 Núcleo de Montanha de Espinho: Club site links a Google Maps short link, but it resolves to a place-id URL with no coordinates (no !3d/!4d, no @); no OSM element in Espinho. Directory pin kept.
- pt-022 Clube de Escalada de Braga: Club site embed is an address-text query (q=Estadio 1o de Maio ...), no pin; the only OSM element within 500 m is Picoto Adventure Park, not the club. Directory pin kept.
- pt-023 ADEB Braga: Facebook-only presence (not fetchable); no OSM element within 1.5 km. Directory pin kept.
- pt-031 Rocódromo 100 Vertigens: No own website; the only OSM element nearby is an unnamed climbing sports-centre building (way/1186165318) about 890 m from the directory pin with nothing tying it to the club, so not used. Directory pin kept.

saorockclimbing.com (HTTP 403 to every fetch) and verticalwall.pt (HTTP 522) could not be read; both were resolved through OSM. Facebook and Instagram pages are not fetchable here.

## New candidates

None (the Portugal part of the brief only replaces pins).

## Unlocated gyms that remain unlocated

All three stay in unlocated.md. New lead: MURUS now has an OSM element (node/12211876534 "Zone Murus", Avenida Vasco da Gama 774, website murus.pt); a later pass can turn it into a candidate once primary evidence is read. The Escola Marista and Fermentelos walls have no matching OSM element.
