# Coverage: UK single-gym towns (2026-10-05)

## Result
- 57 candidates (whole country, GB), 61 sources registered. Reconcile (index of 2,272 gyms): ready 25 | review 12 | blocked 8 | already in Bouldeer 12 | invalid 0.
- Decisions: 30 accept, 18 same-as, 6 defer, 3 reject.

## Method
- Discovery aids (never primary): boulderingwall.com/uk (the list the earlier pass used), an OpenStreetMap Overpass extract of climbing venues in GB (2026-10-05, about 390 elements), boulderinglist.com, and web searches by region. Directories were only used to find names and towns.
- Every accepted gym was confirmed on its own official site (fetched directly; JavaScript-only sites were read in a headless browser). Evidence per candidate: the site page that shows the name, the address/hours and the bouldering offering. Opening hours/booking pages plus dated 2026 content were the "open" evidence; where a site had no dated content (Ibex, Ordinary Climbers, Romford, Volume 1, Boulder Central, Weedon) this is stated in the candidate's research_notes.
- Coordinates: OSM object for the gym (method osm) for 27 accepted gyms; geocoded address (Nominatim, 1 request/s, User-Agent set) for Chatham and Poole (street-level, flagged); Apple Maps place pin for The Pinnacle Bouldering Centre. All pins were cross-checked against the Nominatim position of the gym's own postcode: every pin is within 160 m (most under 100 m).
- `types` lists top-rope / lead-climbing only where the gym's own page names roped climbing.

## Towns covered by an accepted new gym (30)
Preston, Ambleside, Hull, Nether Stowey, Canterbury, Chatham, Tunbridge Wells, Durham, Folkestone, Wisbech, Huddersfield, Lincoln, Swansea, Frome, Darlington, Newbury, Wokingham, Polegate, Bridport, Newton Aycliffe, Romford, East Grinstead, West Bromwich, Poole, Northampton (Weston Favell), St Issey (Tide Padstow), Helston, Bradford, Hemel Hempstead, Cheltenham.

## Already in Bouldeer (same-as, 18)
Dundee (2), Exeter, Ellesmere Port, Shrewsbury, Clydach, York (Freeklime and Red Goat), Carmarthen, Swindon, Brighouse, Weedon, Carlisle, Deeside, Torquay, Romsey, Norwich, Inverness.

## Not accepted
- Defer (6): Northern Problems (Whitehaven), Avid Climbing (Ipswich), Keswick Climbing Wall, Sunderland Wall, Lancaster Wall, Boatyard Boulders (Nottingham). See review-notes.md.
- Reject (3): Ingleton Wall (domain parked), Hang On (Hamilton, permanently closed), Boulder UK Blackburn (no current centre).

## Probably still missing / not checked
- Candidates whose sites did not give a usable address or pin are in unlocated.md (Dyno Buckfastleigh, The Climbing Station Loughborough, The Climbing Experience / G13 Maidstone, Climb Kent Maidstone).
- Town gyms listed on boulderingwall.com that were not probed here because they were not in the OSM extract or were not individually checked: Stowmarket (The Cragg), Scarborough (Street Rocks), Marple (The Ridge), Bamford (Adventure Hub), Hull (Mad Volume), Bromley (Rhino Boulder), Banstead (Yellow Spider), Penryn (Granite Planet, Boulder Ryn), Deiniolen (Beacon), Leek (The Peak), Harrogate, Warrington (Awesome Walls), Chippenham (TCA The Arc), Lincoln (The Showroom), Loughborough, Guildford (Craggy Island, Blue Spider), Surbiton (White Spider), Newcastle/Nottingham/Southampton additional walls. Some are probably already in the index; none was confirmed missing.
- Sites that blocked automated reads (HTTP 403: Kong Adventure Keswick, Indy Climbing Wall Llanberis, Indirock, Spider Climbing) were not researched.
- Crazyclimb Swansea (same retail park as Flashpoint Swansea) and the Pinnacle Climbing Centre at Far Cotton (Northampton) show no bouldering on their sites and were not made candidates.
- Climbing walls inside leisure centres and schools were out of scope for this pass.
