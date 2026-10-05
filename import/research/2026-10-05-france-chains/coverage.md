# Coverage: France, chain gaps (2026-10-05-france-chains)

## Result
- 69 candidates (fr-001 to fr-069), 2 real gyms in unlocated.md, 11 sources registered.
- check.js (research reconcile): ready 33 | review 17 | blocked 3 | existing 16 | invalid 0.
- Decisions: accept 43 | same-as 23 | reject 2 (no-bouldering) | defer 1.

## What was checked, chain by chain
- **Climb Up**: the chain's official store map (https://www.climb-up.fr/les-salles/, WP Go Maps marker data for map 7, 33 markers = 30 Climb Up + 3 M'ROC) was read in full, and every branch's own subdomain home page (<slug>.climb-up.fr) was fetched for address, hours and a bouldering mention. All 30 Climb Up branches were listed as candidates; 17 are new, 11 already in Bouldeer (one of them, Chambéry, is rope-only), 2 are rope-only and rejected. The Climb Up branches on the owner's backlog (Brest, Angers, Lesquin, Villeneuve d'Ascq, Mulhouse-Wittenheim, Dijon, Orléans, Le Mans, Aix x2, Istres, Nîmes) are all there; Lesquin is rope-only on its own page and is rejected. Also found and added: Aubagne, Bouc-Bel-Air, Limoges, Bordeaux Eysines/Villenave, Wambrechies, Cergy.
- **M'ROC Lyon** (Part-Dieu, Laennec, Villeurbanne): listed on the Climb Up store map, bouldering-only gyms of the same group. Included; Laennec and Villeurbanne are new, Part-Dieu already exists.
- **Bloc Session**: official list https://www.blocsession.com/salles-escalade/ (32 branch pages, BS.1 to BS.32 with BS.33 announced) and each branch's /contact/ and home page. 31 branches have candidates (Ardennes has no usable coordinate, see unlocated.md); 21 are new, 10 already in Bouldeer. The branch hours are loaded by script and were not readable, so no hours are recorded; every branch home page says it is open ("ouverte 7j/7").
- **Antrebloc**: one site only (Villejuif); own site, hours and OSM node agree. No other Antrebloc found on the own site.
- **MurMur**: now Arkose (Pantin and Issy-les-Moulineaux voie are "ex MurMur"). murmur.fr itself was unreachable (connection refused and timeout, from both curl and a browser), so the Arkose pages (arkose.com/pantin, arkose.com/issy-les-moulineaux-voie) are the primary sources. Pantin already exists in Bouldeer as "Arkose - Pantin"; Issy voie is deferred (no bouldering on its own page).
- **Le Pan**: Le Pan d'Avignon and its sister site Vertical Park at Le Pontet (both on lepandavignon.fr / verticalpark.fr). No other "Le Pan" gym found on the own site. Both are new.

## Coordinates
- Method per candidate is in `coord_source`. OSM objects were identified through Nominatim (name search inside a viewbox around the geocoded address, then lookup of the object's tags: gym phone/website/address checked). 63 of 69 pins are OSM objects, 1 is the chain store-list marker (Marseille La Valentine), 5 are BAN house-number points (Béziers, Biarritz, Chalon, Rouen, Toulon ouest).
- Where the chain's own pin disagrees with OSM by more than ~100 m (Mulhouse-Wittenheim 542 m, Cergy 406 m, Saint-Étienne 300 m, Istres 132 m, Caen 105 m, Orléans 101 m, Brest 93 m, Lyon Confluence 97 m) this is stated in research_notes. Mulhouse and Cergy: the chain pin lands on a house and a school respectively, so the OSM node was used.
- Several Bloc Session branch pages link to Google "directions" URLs that are wrong or only a viewport centre (Béziers points at the Aix-en-Provence gym, Strasbourg at another address), so they were not used as pins except as a cross-check for Nancy.
- Overpass API was unavailable for most of the session; OSM data came through Nominatim.

## What is missing / not done
- Bloc Session Ardennes (Donchery) and BS.33 (announced, not open): see unlocated.md.
- Opening hours of Bloc Session branches (script-loaded).
- Duplicate screening is the importer's (names, addresses, 150 m, 15 km related name). An existing Bouldeer gym with a wrong pin far from the real site and a different name could not be detected by the tooling.
- No second pass for Climb Up sites that might exist outside the official store map (none seen on climb-up.fr).
