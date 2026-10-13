# Review notes: Brazil (2026-10-13-brazil)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tally: accept 7 | same-as 10 | defer 3 | reject 1 (21 candidates, 15 sources).

Scope is the whole country (`scope.states` null). Bouldeer held 14 Brazilian gyms before this pass (SP 5, MG 5, PR 3, RJ 1: Rio city only Evolução). The 2024 CBEscalada mapping (68 gyms) was the discovery list, read through the Go Outside article and the TopClimbing directory; both are leads only. Every accepted gym has its own site read on 2026-10-13.

## Method limits (be aware when reading the numbers)
- Most Brazilian gyms have Instagram as their only presence. Instagram is not readable without login, so those gyms are not candidates (listed in MANUAL-CHECK.md, second table). This is the main reason only 7 of the roughly 50 non-Bouldeer gyms on the CBEscalada list are accepted.
- OSM has few Brazilian gym elements (about 12 gym nodes in the whole country); most pins are the gym's own map or OSM, and street-only geocodes were not accepted.
- Overpass was overloaded by parallel sections; only the country-wide `sport=climbing` query and by-id reads worked. City bbox name searches for Brasília, Florianópolis, Goiânia and Niterói did not complete.

## Accepted (7)
- br-001 PowerBloc (Campinas), br-002 Geometrik Escalada (Votorantim, Sorocaba region), br-003 UBT Escalada Brasília, br-004 Toca Escalada Indoor (Vitória, ES), br-005 Café com Magnésio (Fortaleza), br-006 Campo Base (Curitiba), br-007 Eleva Escalada (Brasília).
- Pins: PowerBloc, UBT, Toca, Café com Magnésio, Eleva are the gym's own OSM elements and agree (5 to 45 m) with the gym's own Google map. Geometrik's pin is the marker of its own embedded map. Campo Base's pin is the OSM address node for Av. Presidente Kennedy 35 (geocode, building level).
- Single-source and far-from-country flags (Café com Magnésio is 1,884 km from the nearest Bouldeer gym in Brazil) are accepted with reasons.

## Weaker accepts
- br-006 Campo Base: no 2026 date on the site (footer 2024); open evidence is live online sale of single sessions (R$ 65) and weekly hours. Gym operating since 1998.
- br-007 Eleva: no stand-alone day pass printed; visitor entry is a R$ 30 trial class (monthly plan R$ 297). Bouldering is stated on the about page ("boulders that work creativity"), the rest of the site speaks of "muro". Site pages edited Jan-Mar 2026.
- br-004 Toca: bouldering shown through its boulder ranking and the Copa Brasil boulder final (31 Oct 2026); no day-pass price printed.
- br-003 UBT also lists guided climbing ("escalada guiada"), recorded as `top-rope`; br-006 Campo Base lists guided/vias, also `top-rope`.

## Defers (3, see MANUAL-CHECK.md)
- br-008 TreeLab (own site unreadable), br-009 República dos Macacos (site last edited Jan 2025), br-010 Meru C3 (mixed circus studio; street-level pin).

## Reject (1)
- br-011 IpeRocks: outdoor boulder area; the domain no longer hosts the climbing site.

## Existing gyms matched (10, same-as; nothing is inserted)
seed-1404, 1405, 1407, 1408, 1409, 1410, 1414, 1416, 1417, 1418. All pins verified against OSM or a geocode except as listed below.

## Follow-ups for separate batches (not done here)
1. **90 Graus (seed-1409), location update:** Bouldeer pin -23.6358224,-46.6579132 is 211 m from the OSM node for the same address (Av. João Pedro Cardoso 107): -23.63466,-46.65955 (node/4546690430). Decision br-012 carries `followup: location-update`. Note: the OSM node's website (90graus.com.br) is now a tech blog; the gym's current site is 90grausescalada.com.br (hours Mon-Fri 16-23, weekends 14-21).
2. **ROKAZ Unidade Buritis (seed-1415), location update needed:** it sits at exactly the Savassi coordinate of seed-1414 (-19.9391976,-43.9324472, 0 m). The real unit is at Rua Olympio Teixeira Guimarães 47, Buritis (about 2.7 km away; only the street geocodes: -19.96755,-43.95947). No house-level pin source was found, so no candidate was made; needs a pin from the gym's own Buritis map.
3. **Via Aventura (seed-1418) is now Via AltaMontanha** (same address Av. Cândido Hartmann 1377; "largest climbing gym in Latin America", 100+ routes, no boulder wording). Identity fix (name) optional; no change to types.
4. Casa de Pedra Moema (seed-1405) is correct at Av. Iraí 634; the CBEscalada list still shows the former address Alameda dos Guaramomis 256 (OSM node 5908369510 is a stale location). No action.
5. Fabrica Escalada Itaim appears on older lists (Rua Dr. Renato Paes de Barros 484) but not on the gym's own units page (two units: Chácara, Vila Madalena); not in Bouldeer, nothing to retire.
6. Caverna Escalada (seed-1416): own site prints Rua Tibagi 674 and the Bouldeer pin matches; older lists give Rua Treze de Maio 102. No action.
7. Rio de Janeiro city has only one gym in Bouldeer (Evolução). No other Rio gym had a readable site.

## Brain review (2026-10-13)
Eleva Escalada moved from accept to defer: no day pass (trial class only).
