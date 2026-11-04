# Review notes: Australia city coverage gap (2026-10-13-australia)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tally: accept 24 | same-as 13 | defer 7 | reject 3 (47 candidates).

## Method
Overpass sweep of OSM `sport=climbing` for all of Australia (295 elements, 202 non-crag) plus a name sweep for sports/fitness centres; chain location pages (9 Degrees, NOMAD, BlocHaus, Pulse, Northside, Boulder Lab, Urban Climb, Portside, Adrenaline Vault, Alpine, Beyond Bouldering, Climb Fit); Sitchu (8 May 2026) and indoorclimbing.com as discovery only. Urban Climb pages are script-rendered, so they were read in a browser (resets listed through November 2026). Pins: OSM element of the building or gym (Overpass/Photon), the gym's own embedded map (Rock It Derwent Park map block, Beyond Bouldering Thebarton embed), or a Photon address point (The Hold, Wall Walkers). Nominatim was used once or twice only.

## same-as with followup `location-update` (13)
Every one is an existing Bouldeer gym whose pin is more than 150 m from the OSM element / gym's own map for the same street address. Candidate coordinates are the proposed new pin (cid -> id, offset):
- au-9d-alexandria -> seed-0 (1.7 km), au-urban-climb-west-end -> seed-48 (1.5 km), au-boulder-lab-ferntree-gully -> seed-39 (1.3 km), au-nomad-gladesville -> seed-5 (1.1 km), au-sicg-st-peters -> seed-6 (580 m), au-edge-castle-hill -> seed-12 (490 m), au-elevate-villawood -> seed-7 (430 m), au-nomad-annandale -> seed-4 (400 m), au-9d-lane-cove -> seed-1 (350 m), au-cliffhanger-altona-north -> seed-43 (340 m), au-9d-enoggera -> seed-45 (300 m), au-climbfit-st-leonards -> seed-8 (250 m), au-blochaus-fyshwick -> seed-29 (230 m).
- Hardrock Melbourne CBD (seed-31) is 157 m from its OSM node but its own site gives 4/8 Franklin St, the same corner: left as is.
- Cliffhanger and Sydney Indoor Climbing Gym St Peters home pages do not restate bouldering (the importer flags "no-bouldering-evidence"); their existing records already list it, and they are never inserted.

## Accepted with caveats (weaker evidence)
- Open status without a 2026 date: The Crux (current prices and the $49 first-timer offer also quoted by Sitchu on 8 May 2026), Cutloose (page modified 2026-03-01, hours and prices live), Laneway Boulders (footer 2025, hours and prices live), Buffalo Boulders (hours labelled "Sept School Holidays"), The Hold Bendigo (new 2025 fit-out, hours and prices live).
- Weaker pins: Beyond Bouldering Thebarton (centre of the gym's own embedded place map; no OSM element), The Hold Bendigo (OSM address point of 80 Hattam St), Wall Walkers Capalaba (OSM address point 6 Jones Rd, a neighbouring unit of the same building).
- Address differences: Buffalo Boulders (site says 190 Myrtle St, OSM says 81 Prince St; pin within 3 m of the gym's own Google place marker), Pulse Gosford (site "Grieve Cl", OSM "Grieve Road").
- Northside Boulders Abbotsford (The Lactic Factory) has restricted weekday hours (4:30-9:30pm).
- Brunswick Boulder Lab and Clayton South Boulder Lab: Barkly Street house and Centre Rd units matched to OSM "Boulder Lab" nodes.

## Rejects (3)
Clip 'n Climb Berwick, Clip 'n Climb Williamstown and Activate by Hardrock (Clip 'n Climb Heatherton): open (2026 sites) but auto-belay attractions with no bouldering text (`no-bouldering`).

## Defers (7) and leads without a pin
See MANUAL-CHECK.md.

## Not candidates (public, school, or non-bouldering)
Burnley Bouldering Walls, Footscray Bouldering Wall, Holmesglen Bouldering Wall (public/TAFE), SUSF The Ledge (university), Ninja Parc / Mr Ninja / Super Park (ninja courses), Treetops and other ropes courses, PCYC Cessnock (public), Urban Xtreme (Bounce Hendra, trampoline park with walls), Climb Oz Blacktown (home page has no bouldering text).
