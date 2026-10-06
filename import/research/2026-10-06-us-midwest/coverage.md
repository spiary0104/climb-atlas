# Coverage: USA Midwest (2026-10-06-us-midwest)

## Result
- 74 candidates (us-mn/wi/mi/oh/in/mo/ks/ne/ky/ia/sd/nd), 58 sources registered. Reconcile (index of 2,438 gyms, none in these 12 states): ready 42 | review 16 | blocked 16 | already in Bouldeer 0 | invalid 0.
- Decisions (drafted, owner sign-off pending): 58 accept, 0 same-as, 14 defer, 2 reject. Staged batch: 58 records (`import/batches/2026-10-06-us-midwest`); validate and plan exit 0; read-only `import --dry-run` result below in the report.
- Estimates below are the real-world number of public indoor climbing gyms with a bouldering offering, taken from directory leads (99Boulders, Mountain Project, indoorclimbinggym.com; leads only, never primary) plus what the gyms' own sites say; they are rough.

## Per metro (estimated real-world gyms vs found / accepted)
| Metro | Est. gyms | Found | Accepted | Notes and remaining leads |
|---|---|---|---|---|
| Minneapolis-St. Paul, MN | 10-12 | 9 | 5 | Accepted: Bouldering Project Minneapolis and St. Paul, VE Twin Cities Bouldering, Big Island Bouldering (Plymouth), Minnesota Climbing Cooperative. Deferred: VE Minneapolis, Bloomington, St. Paul (ropes only on the chain list; "Bouldering Areas 0" placeholder). Leads: The A (Minneapolis), Midwest Climbing Academy (youth, site fails). |
| Rest of Minnesota | 4-5 | 3 | 0 | VE Duluth and Roca (Rochester) deferred; Duluth Climbing and Fitness Coop has no street address (MANUAL-CHECK). Mankato, St. Cloud, Winona, Bemidji have only university walls. |
| Milwaukee and suburbs, WI | 4-5 | 4 | 4 | Adventure Rock Milwaukee, Brookfield, Walker's Point (bouldering-only), Milwaukee Turners. |
| Madison, WI | 3-4 | 3 | 2 | Boulders (Downtown) and Greater Heights (Fitchburg); Boulders East closed (rejected); Summit Strength and Fitness deferred (fitness gym, no public pass shown). |
| Green Bay / Fox Valley and Burlington, WI | 3 | 3 | 3 | Odyssey Green Bay and Appleton, CLIMB @ The Loop (Burlington). Leads: Wausau, Eau Claire, La Crosse, Oshkosh (only university/YMCA walls found). |
| Detroit / Ann Arbor / Lansing, MI | 6 | 4 | 4 | DYNO Detroit, Planet Rock Ann Arbor and Madison Heights, Terra Firma East Lansing (opened 28 May 2026). Lead: Gripz (Southfield, ninja-style gym with some climbing, not researched further). |
| Grand Rapids / Holland / Kalamazoo, MI | 7 | 5 | 4 | Planet Rock and Terra Firma Grand Rapids, Scrapyard (Holland), Climb Kalamazoo. Higher Ground deferred (no bouldering statement); Gripz is a ninja gym and was not researched. Leads: Bear Creek Climbing (GR), Shift Climbing (Holland), ELEV8 and GT-ROCKS (Traverse City): no official site found. |
| Cleveland / Akron, OH | 6-7 | 5 | 3 | Climb Cleveland, Kendall Cliffs, Rock Mill. Deferred: Shaker Rocks (Nosotros, Lakewood, is listed only in MANUAL-CHECK: no pin could be obtained). Leads: Cleveland Rocks, Climb Youngstown (no address on site). |
| Columbus, OH | 4 | 4 | 2 | Bloc Garten and Chambers Purely Boulders. Kinetic and Vertical Adventures: sites unreadable (MANUAL-CHECK). |
| Cincinnati, OH | 5 | 5 | 5 | Climb Cincy, Climb Time Blue Ash and Oakley, RockQuest, Mosaic (Loveland). |
| Dayton / Toledo / rest of Ohio | 4-5 | 3 | 1 | Urban Krag accepted; Adventus (Toledo) deferred. Leads: Blockhouse Bouldering (Athens), Paradiso Climbing Co-op (Eastlake), Social Climber (Granville). |
| Indianapolis, IN | 5 | 5 | 4 | Hoosier Heights (Carmel), Climb Time Indy, EPIC, North Mass Boulder. Lead: The CRUX at Camptown, Vertical Challenge (not researched). |
| Rest of Indiana | 6 | 6 | 5 | Hoosier Heights Bloomington, Climb Lafayette, VX Evansville, Earth Adventures bouldering gym (Fort Wayne), Warehouse Climbing Co. (Goshen). Summit City Climbing Co. (Fort Wayne) deferred (no hours). Lead: Columbus Rock Gym (domain gone). |
| St. Louis, MO | 5-6 | 5 | 3 | Climb So iLL Power Plant and Steel Shop (St. Charles), Upper Limits Chesterfield. Upper Limits Maryland Heights deferred (ropes). Upper Limits Downtown page is gone (HTTP 410), not listed. |
| Kansas City (MO + KS) | 5 | 4 | 2 | RoKC North KC (MO) and Olathe (KS). RoKC Underground deferred; IBEX (Blue Springs) unreadable; lead: Sequence Climbing; Apex (Overland Park) closed. |
| Rest of Missouri | 4 | 3 | 0 | Zenith (Springfield) and CoMo Rocks (Columbia) deferred (no bouldering statement; Zenith has no candidate because the Census geocoder placed its address in another ZIP and Nominatim was rate-limited); The Bouldering Garden is "coming soon". |
| Wichita, KS | 2 | 2 | 1 | Bliss Climbing and Fitness accepted. |
| Omaha / Lincoln, NE | 3 | 3 | 3 | Approach (Omaha), MW Climbing Omaha and Lincoln. |
| Louisville / Lexington, KY | 4-5 | 2 | 2 | Climb NuLu, LEF Climbing. Rock Gem and Rocksport (Louisville): sites unreadable. |
| Des Moines / Ames, IA | 4 | 3 | 3 | Climb Iowa East Village (bouldering-only), Climb Iowa Grimes, Bluestem Boulders (Ames). Lead: The Workshop (Des Moines). |
| Rapid City / Sioux Falls, SD | 2 | 2 | 1 | Black Hills Basecamp accepted; Frontier Climbing and Fitness (Sioux Falls) needs the gym's address (MANUAL-CHECK). |
| Fargo, ND | 1 | 1 | 1 | Fargo Climbing (bouldering only). Other ND walls are YMCA/university. |

## Method
- Chains first via their official location lists: Vertical Endeavors, Bouldering Project, Planet Rock, Adventure Rock, Odyssey, Terra Firma, Hoosier Heights family (Indianapolis, Bloomington, Louisville NuLu, Cincinnati Climb Cincy), Climb Time, Climb So iLL, Upper Limits, RoKC, MW Climbing, Climb Iowa. Each independent gym's own site was then read (home page, hours/pricing, first-visit or FAQ page).
- Leads came from directories (99Boulders, Mountain Project, indoorclimbinggym.com); their content is never used as evidence. Several directory addresses were wrong or stale (Hoosier Heights Bloomington; Boulders East is closed; Apex is closed).
- Coordinates: the gym's own OSM element where it exists (named element, 40 candidates, queried through the Nominatim geocoder), otherwise an OSM Nominatim house-number geocode of the address printed on the gym's site (`geocoded-address`; two street-level pins flagged). The Overpass API was unreachable from the research machine, so OSM elements were found by name through Nominatim only; some gyms may exist in OSM under other names.
- Search budget was exhausted mid-run, so discovery after the Columbus pass was by directories and direct site fetches only.

## Probably missing / uncertain
- Small club and university walls in all 12 states (many YMCA, college and Life Time walls exist; not gyms for this section).
- Gyms with unreadable or absent sites (see MANUAL-CHECK.md): Kinetic and Vertical Adventures (Columbus), Rock Gem and Rocksport (Louisville), The Bouldering Garden (Columbia), IBEX (Blue Springs), Paradiso (Eastlake).
- Possible new openings not in any directory: a quick search per metro with a current-year filter would help.
