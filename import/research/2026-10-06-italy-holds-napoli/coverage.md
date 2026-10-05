# Coverage: Italy, gyms on hold + Napoli gap (second pass, 2026-10-06)

## Result
- 9 candidates (ih-001 to ih-009), 22 sources registered. Decisions: accept 2 | reject 1 | defer 6 | same-as 0.
- Resolves the six on-hold gyms of 2026-10-05-italy-city-gaps (it-003, it-006, it-011, it-013, it-014, it-015): two can now be accepted (Palaroccia, Eden Park), four stay deferred (CAT, La Mole, BlueRock, Free Climbing Palermo).
- Napoli gap: only one open bouldering gym with a primary source (Palaroccia, Quarto). "Pozzuoli Boulder" turned out to be an outdoor boulder area, not a gym.

## What was checked
- Own sites fetched with curl and read as text: freeclimbingnapoli.it, centroarrampicatatorino.org (+ tariffs), edenparkzone.it (climbing, free-training and courses pages), lamolesportsacademy.com (home, climbing, contact), freeclimbingpalermo.wordpress.com (home, activities, where, contacts), jesopazzo.org (weekly schedule).
- Instagram and Facebook: read through the public og:title/og:description/meta description (fetched as a link-preview crawler). That gives bios and page descriptions, not posts. Pages: palaroccia (IG, FB), edenclimbing (FB), freeclimbingpalermo (IG, FB), centroarrampicata (IG), lamolesportsacademy (IG, FB), bluerockclimb (IG), lithium_beer_e_climb (IG), freeclimbingna / DEMON Rock Wall (FB), Palatrincone (FB), exopgjesopazzo (FB), napoliclimbing and direzioneverticale (IG).
- Coordinates: Nominatim (descriptive User-Agent, 1 request per 1.3 s) for OSM objects: Palaroccia node, Eden Park node, CAT building way, Je so pazzo node; official map links for Free Climbing Palermo and La Mole. Overpass was overloaded (timeouts), so no bbox sweep was possible; Nominatim name searches for "climbing/boulder/arrampicata Napoli" returned nothing.
- Napoli enumeration: web searches (Napoli, Pozzuoli, Quarto, Casoria, Portici, Torre del Greco, Caserta, Giugliano, Afragola, Nola, Castellammare, Ercolano), infoboulder.com (Campania lists only Demon Rock Wall), boulderinglist.com (one Naples gym), falesia.it, palestralecolonne.it, R-ange.it, direzioneverticale.it.

## Not candidates / left out
- Climbing Napoli (@napoliclimbing) / Direzione Verticale: outdoor association (Agerola, Amalfi coast, Vesuvio crags), no gym of its own found in Napoli.
- Agerola Palazzetto climbing structure (Direzione Verticale, Conca dei Marini): municipal sports-hall wall, only source is a 2016 inauguration article, rope structure, about 35 km from Napoli and not clearly Napoli metro.
- Casoria, Portici, Torre del Greco, Caserta area: no climbing or bouldering gym found by any search; Polisportiva Asics Casoria appeared in a directory without any climbing evidence.
- Boulder Garage, Boulder City, Infinity Boulder, Quincinetto and other northern gyms in the search results: out of this section (other regions).
- Mad Climbers (madclimbers.com) is a Brescia gym, unrelated to MAD Climbing Wall in Napoli.

## Open points
- Six deferred gyms are in MANUAL-CHECK.md. Instagram posts and Facebook posts could not be read (no login); the questions there are mostly answerable in a minute by a person looking at the pages.
- Pins: Palaroccia, Eden Park and CAT are OSM objects at building level; La Mole is the gym's own Google place; Free Climbing Palermo, BlueRock and DEMON Trincone are street-level.
- The first-pass candidates it-003, it-006, it-011, it-013, it-014, it-015 stay deferred in their own section; this section supersedes them (the importer will still treat a later same-place record as a duplicate, so none should be staged twice).
