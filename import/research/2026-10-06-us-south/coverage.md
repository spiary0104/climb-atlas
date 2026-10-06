# Coverage: USA South (2026-10-06)

Scope: FL, NC, SC, AR, LA, MS, OK, WV. None of these states had a gym in Bouldeer before this section.

## Result
- 69 candidates (accept 60, defer 7, reject 2, same-as 0), 5 more real venues without a usable coordinate in unlocated.md.
- reconcile: ready 54 | review 9 | blocked 6 | existing 0 | invalid 0. Staged batch 2026-10-06-us-south: 60 records, plan 60 new, read-only production dry-run PREFLIGHT PASSED (partial coverage, no service-role key).
- Accepted by state: FL 23, NC 17, AR 6, OK 5, LA 4, SC 3, WV 2, MS 0.
- Coordinates: gym's own OSM element 42 candidates, Nominatim house-number geocode of the official address 23, official site map pin 4. One candidate (Rose Rock Climbing, deferred) has only a street-level pin.

## Main sources
- Chain location lists and pages: Central Rock Gym (4 Florida sites, all swept), Triangle Rock Club (5 NC sites listed on the home page), Inner Peaks (3 Charlotte-area sites), High Point Climbing & Fitness (Orlando), The Climb Gyms (Bentonville), Stone Climbing, Blocworks, Cultivate Climbing.
- Each independent gym's own site, fetched directly (hours, address, bouldering text read from the page; the evidence list names the page).
- OpenStreetMap: an Overpass extract of every sport=climbing feature in the eight states (2026-10-06) for pins, and Nominatim for address geocoding (1 request per 1.6 s, descriptive User-Agent). Overpass and Nominatim were rate-limited or unreachable for stretches of the session.
- Leads only (never evidence): 99Boulders state lists, Mountain Project gym directory, indoorclimbinggym.com city pages, a Mountain Project forum thread. The session web search quota (shared with other workers) ran out part-way, so no further discovery searches were possible after the first batch.

## Per metro: estimated real gyms vs found
Estimates are mine (from directory counts and chain pages), not measured.

| Metro | Est. real | Accepted | Notes / remaining leads |
|---|---|---|---|
| Miami / Fort Lauderdale / Palm Beach | 7 | 5 (Velocity, The Edge Miami, Las Rocas, projectROCK Oakland Park, Boulder Bloc Pompano Beach) | Central Rock Gym Wynwood (OSM node and directories list it; the chain's location list omits it and its page redirects), Coral Cliffs Fort Lauderdale (domain unreachable), FAU Climbing Center (university) |
| Orlando / Central FL | 7 | 4 (Central Rock Orlando, Blue Swan, High Point Orlando, Aiguille Longwood) | ROX at Lake Nona deferred (club access); BE Climbing Winter Park says "Opening Soon"; Rec Rock Oviedo is a city wall |
| Tampa Bay / Sarasota | 5 | 4 (Central Rock Tampa and Citrus Park, Vertical Ventures St. Pete, HEXROCK Sarasota) | none known |
| Jacksonville / NE Florida | 6 | 4 (The Edge, Blocker Boulders, Beaches Rock Gym, Stone Jacksonville) | Stone St. Augustine and Cornerstone Glen St. Mary (deferred) |
| Rest of Florida | 9 | 6 (Central Rock Fort Myers, The Knot Gainesville, Alchemy Tallahassee, Daytona Climbing Co., DynoClimb DeLand, Rock Out Destin) | Fort Rock Fort Myers (no pin), On The Edge Melbourne (no bouldering text), Sun Country Rocks (no pin, access unclear), Weatherford's Outback and Vertical Connections Pensacola (site down / coming soon) |
| Charlotte | 5 | 4 (Inner Peaks South End, NoDa, Matthews; Cliff Hangers Mooresville) | Inner Peaks Crown Point (older directory entry) is not listed on the chain site |
| Raleigh / Durham / Chapel Hill | 6 | 6 (Triangle Rock Club Morrisville, Raleigh, Durham, Salvage Yard; The Boulder Garden; Progression) | OC Aerial Durham (ninja/aerial, not checked) |
| Fayetteville NC | 2 | 2 (Triangle Rock Club, The Climbing Place) | none |
| Asheville | 3 | 2 (Cultivate Foundy Street, The Bunker) | The Riveter Fletcher closed (reject-style note in unlocated.md); old ClimbMax River Arts site not on the Cultivate site |
| Rest of NC | 7 | 3 (Center 45 Boone, Bigfoot Morganton, Brevard Rock Gym) | Wilmington Rock Gym (no pin), FirstHand Winston-Salem (deferred), Ruckus Greensboro (closed 2026-09-01, rejected), Gnarwall Pfafftown (site down; directory says closed 2024), Deadpoint Outer Banks (site down) |
| Greenville SC | 3 | 2 (BlocHaven, Climb @ Blue Ridge) | Climb Upstate Spartanburg (domain now unrelated); projectROCK Easley closed (rejected) |
| Charleston / Columbia SC | 2 | 1 (Coastal Climbing) | no bouldering gym found in Columbia (Capital Climbing in Cayce is a hold manufacturer) |
| New Orleans | 1 | 1 (New Orleans Boulder Lounge) | none |
| Baton Rouge / Lafayette / Shreveport | 3 | 3 (Uptown, Southern Stone, Risen Rock) | Climbossier Bossier City, G-Rock Shreveport, Slidell Rocks (no working site found) |
| Little Rock / Conway | 2 | 2 (Little Rock Climbing Center, Climb Conway) | none |
| NW Arkansas / Fort Smith | 5 | 4 (Climb Bentonville, Boulders and Brews, Ozark Climbing Gym, Vertical Horizons) | Upward Ninja and Bouldering Siloam Springs (not checked in depth), The Wall Russellville (OSM only), Zion Climbing Center Searcy (site unreadable) |
| Oklahoma City | 5 | 3 (Blocworks Edmond and Midtown, Threshold) | Rose Rock Norman (deferred, pin), The Silos OKC (deferred, status) |
| Tulsa | 2 | 2 (Climb Tulsa, Gravity Bear) | none |
| West Virginia | 5 | 2 (Outside In Beckley, Gripped Fitness Fayetteville) | eNeRGy Charleston (deferred, site unreadable), Climbing New Heights Martinsburg (domain taken over by spam), Gritstone Morgantown ("Coming Soon" page) |
| Mississippi | 0-1 | 0 | The Hangout (Ridgeland) is listed by Mountain Project only; Core Cycle Tupelo is a bike shop with a wall; university walls excluded |

## Not examined
- University and campus recreation walls, YMCAs, parks departments, trampoline/ninja parks (not commercial bouldering gyms or limited access).
- Facebook/Instagram pages (not readable without a login), so a few small gyms with no website cannot be confirmed.
- Hours were read where the page exposes them as text; for gyms whose site gives only pricing, waivers and bouldering text (Aiguille, Boulder Bloc, Progression, Coastal, Boulders and Brews, Uptown, Vertical Horizons) the "open" evidence is a live operating site, not a dated notice.

## Access problems
- The shared web search quota was exhausted partway; later discovery used directory pages, Mountain Project and OSM.
- Overpass (all public endpoints) stopped responding after the first extract; Nominatim answered 429 for several minutes and returned no match for some real addresses (Strongway Ct, Alico Rd, Market St 8118, SW 140th Terrace), which is why five venues have no pin.
- Triangle Rock Club location pages return 404 (only the home page lists the sites), so chain-wide bouldering text is the evidence.
