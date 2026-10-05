# Coverage: France, gyms on hold (2026-10-06-france-holds)

## Result
- 2 candidates (frh-001, frh-002), 1 announced gym in unlocated.md, 8 sources registered.
- Reconcile: ready 0 | review 1 | blocked 0 | existing 1 | invalid 0.
- Decisions: accept 1 | same-as 1 | reject 0 | defer 0.

## What was checked (second pass over 2026-10-05-france-chains)
- **Arkose Issy-les-Moulineaux (ex-MurMur Issy, "voie")**: own page https://arkose.com/issy-les-moulineaux-voie describes a rope-only hall (no bouldering area in the body text). The "Issy-les-Moulineaux bloc" hall (Rue du Bateau-Lavoir, Halle Guillaume, 200+ blocks) is a separate Arkose gym with its own page. The voie hall is already in Bouldeer (g-67ecd19a4e, 0 m), so it is `same-as`; nothing is inserted. OSM tags the voie node climbing:boulder=yes, which the own page does not support (see MANUAL-CHECK.md).
- **Bloc Session Ardennes (BS.19, Donchery)**: open, own pages and the chain list. Coordinate found: the viewport centre of the gym's own Google directions link (49.7062712, 4.8735219) on the D24, street-level. BAN, Nominatim and OSM have no rue de l'Industrie in Donchery (the OSM street of that name is in Vrigne-aux-Bois) and no element for the gym. The tourist-board (ADT) coordinates are the village centre, not the gym, and were not used.
- **Bloc Session BS.33**: https://www.blocsession.com/salle-escalade/bs33/ still says "BS 33 est dans les cartons... encore quelques semaines de patience" and the chain list (https://www.blocsession.com/salles-escalade/) still shows 32 gyms plus the BS.33 placeholder. Not open, no address: no candidate (unlocated.md).

## Method and tools
- Pages read directly (own sites, ADT listing, PlanetGrimpe press release); BAN API (api-adresse.data.gouv.fr) and Nominatim queried for Donchery; OSM objects read through the OSM API; Overpass was slow/timeouts.
- Duplicate screening is the importer's plus the stricter review radii (reconcile.md).

## Not done
- No new sweep of other chains; this section only covers the three held items.
