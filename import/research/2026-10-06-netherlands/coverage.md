# Coverage: Netherlands gap (2026-10-06-netherlands)

## Result
- 36 candidates (nl-001 to nl-036): 35 accept, 1 defer (nl-015), 0 same-as, 0 reject. Not one matched an existing Bouldeer gym.
- check: ready 33 | review 2 (Haarlem/Hoofddorp, same chain) | blocked 1 (nl-015 opening-soon) | existing 0 | invalid 0. plan: new 35, 0 probable duplicates. Dry-run: PREFLIGHT PASSED (partial coverage, no credentials).
- Gap analysis input: about 85 real halls (NKBV: 38 climbing + 53 boulder halls) vs 25 in Bouldeer, all in Amsterdam, Den Haag, Utrecht and Rotterdam. After this section 60 listed.

## Method
- Discovery from climbing-gyms.com city lists (leads only), the chain sites (Monk, Beest Boulders, Neoliet/Boulder Neoliet, Climbing Network, Kei Boulderhal, Boulderhal de Fabriek, the Krachtstof group footer) and Photon (OpenStreetMap) name searches in 67 towns. The NKBV site has no usable hall list (404 / JS); nothing was taken from a directory without checking the gym's own page.
- Every accepted candidate: the gym's own page (or chain location page) fetched on 2026-10-06 showing the street address, opening hours or dated content, and bouldering. Closure wording was scanned for.
- Pins: 24 are OSM elements named after the gym (found with Photon, 1 request per second); the other 12 are PDOK (Dutch government geocoder) house-number matches. No pin is street-level.

## Accepted by city (35)
Alkmaar 1, Almere 1, Amersfoort 2 (Kei Wagenwerkplaats, De Hoef), Apeldoorn 2 (Kei Zwitsal, Boulder Neoliet), Arnhem 1 (Rijnhal), Breda 2, Delft 3, Deventer 1, Dordrecht 1, Ede 1, Eindhoven 2 (Monk, Boulder Neoliet), Enschede 1, Groningen 1 (Apex), Haarlem 1, Heerenveen 1, Hilversum 1 (Monk), Hoofddorp 1, Leeuwarden 1, Leiden 2 (Kunststof, Krachtstof), Maastricht 1, Nijmegen 1 (GRIP), 's-Hertogenbosch 1, Tilburg 2 (Block013, Boulder Neoliet), Veldhoven 1, Venlo 1, Zaandam 1, Zwolle 1.

## Chains covered
Monk (Eindhoven, Hilversum new; Amsterdam, Rotterdam already in), Beest Boulders (Breda, Delft new; the other five already in), Boulder Neoliet (Eindhoven, Veldhoven, Tilburg, Apeldoorn new; Amsterdam, Rotterdam in), Climbing Network (formerly Mountain Network: Dordrecht, Heerenveen, Leeuwarden, Arnhem Rijnhal new; Amsterdam in; Arnhem Olympus is rope only; Nieuwegein deferred), Kei Boulderhal (3 new), Boulderhal de Fabriek (2 new), the Krachtstof group of Boulderhal sites (Kunststof, Krachtstof, Radium, Roest, Apex, Vrijhaven new; Luchthaven, Energiehaven, Zuidhaven already in).

## Checked and not added
- Neoliet rope halls (Utrecht in; Tilburg, Eindhoven Noord/Zuid, Heerlen): their pages show no bouldering offer of their own (the boulder halls are separate sites). De Klimmuur Haarlem: its page says bouldering is not possible there. Klimcentrum Bjoeks Groningen: boulders only outdoors on concrete. Arnhem Olympus: disciplines list has no bouldering.
- Leads with a question are in MANUAL-CHECK.md.

## Remaining leads (per city, estimated vs found)
- Groningen: 1 added (Apex); Gropo Bouldergym site is password-gated. Leiden 2 added; Wildflower site down. Eindhoven 2 added of an estimated 4 (Boulderburcht only an OSM name). Enschede: Cube added; Boulderstation (OSM) unverified. Rural and smaller towns (Emmen, Assen, Hengelo, Zeeland, Limburg south, Zwolle area clubs) were only reached through Photon name searches and the directory, so club halls and small commercial walls are likely still missing (about 20 of the estimated 85).
- Not reached: NKBV member club walls (most are rope halls), student sport centres with boulder walls.
