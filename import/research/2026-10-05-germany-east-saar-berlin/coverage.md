# Coverage: Germany east/Saarland/Berlin gaps (2026-10-05)

## Result
- 32 candidates (dee-001 to dee-032), 40 sources registered. Reconcile: ready 8 | review 12 | blocked 8 | already in Bouldeer 4 | invalid 0.
- Existing matches (importer): Blockpark Erfurt (seed-968), Plan B Jena (seed-1053), BlocSchmiede (seed-969), Kletterzentrum Saarbrücken (seed-1038); KBA (seed-1021) and urban apes Basement (seed-962) were found by the review flags.
- Scope: Thüringen, Sachsen-Anhalt, Saarland (all open bouldering gyms incl. DAV/club halls) and Berlin limited to urban apes branches and Der Kegel (no full Berlin sweep).

## Method
- Discovery (support only): OSM Overpass extract (sport=climbing, climbing:boulder, leisure=climbing_hall) for DE-TH, DE-ST, DE-SL; directories (boulderland, boulderhallenfinder, kvfl.com, visitwiki, klettern-und-bouldern.info, DAV section pages).
- Every candidate was confirmed on the gym's own site (read 2026-10-05; news and event dates from Sep-Nov 2026 were used as evidence that sites are current). Chain list for urban apes.
- Coordinates: OSM element of the gym itself (method osm) for 28 candidates; Nominatim house point for Kletterhütte Ilmenau; Nominatim street way for Schmiedebloc, Schmölln and Life Saalfeld (precision street).
- Kletterzentrum Saarbrücken: the www host serves an expired TLS certificate / HTTP 503 on 2026-10-05; content was read from the official de. host, which is live.

## Per state
- Thüringen: Erfurt (2), Jena (3), Weimar (2) accepted/existing; Ilmenau, Schmölln, Saalfeld, Eisenach, Sülzfeld candidates deferred or rejected.
- Sachsen-Anhalt: Halle (2), Magdeburg (1, existing), Bad Schmiedeberg, Sangerhausen accepted; Dessau Zuckerturm deferred.
- Saarland: Saarbrücken (3), Saarlouis, St. Wendel, Bexbach, Wadern accepted/existing; Ensdorf deferred; Wadgassen rejected (closed).
- Berlin: urban apes Basement (existing), bright site, Fhain, Wedding; Der Kegel.

## Known gaps / not candidates
- Thüringen: no further public bouldering gym found in Gera, Gotha, Suhl, Nordhausen, Mühlhausen, Altenburg, Greiz, Arnstadt. Small club walls exist (DAV Gera at Zabelgymnasium, DAV Suhl at Sporthalle Friedberg, Gotha Gustav-Freytag-Gymnasium, Ilmenau Bergclub wall) but they are school-hall walls with access by contact or a few hours a week and no coordinate source (see unlocated.md). Fritzpark Zella-Mehlis (opened 25 Apr 2026) is an indoor play park with climbing towers, not a boulder gym. Hexenfels Ilfeld (planned for 2018) was never found open.
- Sachsen-Anhalt: the DAV hall for Wernigerode is a project, not open. IG Klettern Halle's Fetter Kletter / IG Kletterturm (OSM, Halle) and the Riveufer outdoor sectors are outdoor or club structures, not checked as halls. ALM AbenteuerLand Magdeburg is a children's adventure venue with a small climbing hall (booking only, DAV cooperation), not a bouldering gym. Freizeitcenter Stendal (T & B) lists climbing in OSM only; not confirmed.
- Saarland: unidentified OSM climbing sports-centre nodes near Dillingen (49.358, 6.716) and Lebach (49.405, 6.895) could not be matched to an operator or a site; directories list a Dillingen "Kletteranlage" and a Lebach wall. School walls (e.g. Bellevue) are private.
- Berlin: only urban apes (4 branches on the chain list) and Der Kegel checked, as instructed.
- No rope-only gyms were recorded (none found in scope).
