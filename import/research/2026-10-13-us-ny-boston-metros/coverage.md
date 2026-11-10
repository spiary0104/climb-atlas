# Coverage: USA New York and Boston metros (2026-10-13-us-ny-boston-metros)

## Result
- 8 candidates (audit trail incl. deferred), 19 sources registered; review decisions: accept 6 | same-as 0 | defer 2 | reject 0.
- reconcile: ready 5 | review 1 | blocked 2 | existing 0 | invalid 0. Staged batch: 6 new gyms (plan clean, read-only dry-run passes).
- Scope is the bounding box -74.9,40.3,-70.4,42.7 (lng/lat), covering the whole New York metro (NYC, Long Island, Westchester, lower Hudson Valley, NJ and CT parts), Greater Boston and Providence. Bouldeer already had 64 gyms inside the box before this section.
- Finding: the estimate that sized this section (about 35 gyms in the New York metro, 15 in Bouldeer) pre-dates the `2026-10-06-us-northeast` import, which added the NJ and CT parts. Counted from the live index the New York metro already had 36 gyms, so the "about 20 missing" was mostly closed by that section. The estimate also counted Life Time clubs, Chelsea Piers, ninja and auto-belay fun centres, which are not accepted here.

## Per metro: estimated real-world gyms vs Bouldeer vs this section
| Metro | Gap-analysis estimate | In Bouldeer before | Accepted here | Deferred / leads |
|---|---|---|---|---|
| New York City (5 boroughs) | part of about 35 | 14 | 0 | Everyday Athlete (Brooklyn Heights, deferred) |
| Long Island | part of about 35 | 2 (Island Rock, Gravity Vault Melville) | 2: Gravity Vault Westbury; Rocksteady Climbing (Setauket, opened July 2026) | none |
| Westchester + lower Hudson Valley | part of about 35 | 5 (Valhalla, New Rochelle, Poughkeepsie, Kingston, New Paltz) | 0 | Hapik Yonkers (auto-belay fun centre, lead only) |
| North and central NJ | part of about 35 | 11 | 1: GOAT Climbing Gym (Hackensack; earlier deferral resolved) | none |
| Connecticut (Fairfield, New Haven) | part of about 35 | 4 (Fairfield, New Haven x2, Wallingford) | 0 | Beta Climbing & Fitness (Stamford, directory only) |
| Greater Boston (to about 40 km) | not estimated in the gap analysis | 16 (Central Rock x10, Bouldering Project Somerville, MetroRock Everett, Rock Spot x4) | 1: Challenge Rocks (Hingham) | La Vida Rock Gym (Wenham, deferred); MIT and BU walls are campus-only (not researched) |
| Boston outer ring (45-85 km) | - | 1 (MetroRock Littleton) | 2: MetroRock Tyngsborough; Boulder Union (New Bedford) | none |
| Providence / Rhode Island | - | 4 (Providence, Lincoln, Warwick, Peace Dale) | 0 | none |
| Total New York metro (NYC + LI + Westchester/Hudson + NJ + CT) | about 35 | 36 | 3 | 3 leads/deferrals |

## Chains and lists swept (official pages, read 2026-10-13)
- Movement locations page: New York shows only Gowanus, Harlem, LIC and Valhalla (all already in Bouldeer). The Cliffs at DUMBO URL now redirects to the Movement home page and DUMBO is not on the list; the DUMBO Boulders site at 99 Plymouth St was an outdoor wall, so it is not a candidate.
- Central Rock Gym list: 12 MA, 2 CT, 1 RI, 6 NY (Manhattan, Chelsea; others upstate): every New York-metro and Boston-area site is already in Bouldeer.
- Gravity Vault finder: Brick, Chatham, Flemington, Hoboken, Middletown, Montclair, Princeton, Upper Saddle River, Voorhees, Melville, Poughkeepsie, Westbury open; Edison "coming soon". Only Westbury was missing.
- MetroRock list: Everett, Tyngsborough, Littleton (MA), Essex (VT), Bushwick (NY). Only Tyngsborough was missing.
- VITAL (Brooklyn, West Harlem, Upper East Side, Lower East Side), Bouldering Project (Gowanus, Somerville) and Brooklyn Boulders (Queensbridge only): all in Bouldeer. Brooklyn Uprising (bkup.nyc) is open (BK CUP league starts October 21, 2026) and in Bouldeer. "Steep Rock" (OSM node at 3225 Broadway) is the former name of VITAL West Harlem (the steeprock.com domain is for sale).
- Rock Spot: all MA/RI/CT sites already in.
- indoorclimbinggym.com state pages (NY 45, MA 21 cities, NJ 22, CT 7, RI 4): used for leads only; every bouldering gym on them is in Bouldeer except those handled above. Fitness-club walls (Life Time Syosset and West Harrison, Chelsea Piers Field House, Manhattan Plaza Health Club), kids gymnastics/ninja centres (Mindnasium, Exxcel, Park City) and trampoline parks were not treated as bouldering gyms.

## Remaining leads not researched or not resolved
- Overpass (OSM) timed out for the Boston, Westchester and Long Island tiles on all three public endpoints (only the NYC, Long Island, north-central NJ and CT tiles returned; they showed no gym that was not already known), so a full `sport=climbing` sweep of the Boston and Westchester tiles was not completed; a repeat pass with a working Overpass would catch any unlisted independents there.
- Web search was used sparingly (shared quota): independents were found through directories and chain lists, so gyms without a web presence beyond social media could be missed.
- Gyms seen but not accepted: see MANUAL-CHECK.md (La Vida Wenham, Everyday Athlete, Beta Stamford, Hapik Yonkers). Boston Rock Gym (Woburn, in an old Boston Magazine list): its domain now serves an unrelated Serbian page, so no evidence it is open. Challenge Rocks "Framingham" appeared once in a directory snippet and was not confirmed.
- Existing Bouldeer gyms were not re-audited here, apart from pin checks against the OSM gym elements returned by Overpass for the NYC/NJ/CT tiles: Movement Gowanus/Harlem, Brooklyn Boulders Queensbridge, VITAL (4), MetroRock Bushwick, Method, CRG Manhattan, Bouldering Project Brooklyn, Gravity Vault Hoboken/Montclair/Chatham/Plainsboro and Randolph all agree within about 30 m, so no location-update follow-ups. No closed existing gym was found.

## Main sources
- Each gym's or chain's own site (fetched directly; GOAT read through the fetch tool). Coordinates: OSM gym elements (GOAT, MetroRock Tyngsborough), Photon address geocodes landing on the building polygon (Westbury mall, Setauket, Hingham), Nominatim address polygon (New Bedford).
- Lead discovery: indoorclimbinggym.com state/city pages, Climbing Business Journal, Chronogram (Hudson Valley, 2025-03-22).
