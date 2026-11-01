# Coverage: Los Angeles and San Francisco Bay Area (2026-10-13-us-california-metros)

## Result
- 8 candidates: 1 accept, 3 same-as, 4 defer, 0 reject. Staged: 1 new gym (Rock City Climbing, Huntington Beach).
- check: ready 1 | review 3 | blocked 3 | existing 1 | invalid 0. Plan clean (new 1, probable-duplicate 0, invalid 0); dry run PREFLIGHT PASSED (partial coverage); `node --test "tests/*.test.js"`: 0 failures.
- Main finding: this section is mostly a verification pass, not a bulk add. The coverage-gap report counted LA (~40 vs 18) and the Bay Area (~30 vs 17) against 40 km circles and an older Bouldeer snapshot. After the 2026-10-06 coverage-gap sprint, Bouldeer already lists about 37 gyms in the LA/OC/Inland Empire/Ventura scope and about 20 in the Bay Area, which is every gym that every source below names. Chain by chain: all 11 Hangar 18, all 6 open Sender One (Thousand Oaks is "2027"), all 6 Movement in California, 17 of 19 Touchstone (the other two: Aisle 19, coming soon, and Team Training Center, members-only), all Benchmark (2), Gravity Vault Marin.
- The existing Bouldeer gyms found while checking were all open on their own sites (no retire follow-up). One existing gym has a wrong pin (see review-notes.md: Boulderdash Thousand Oaks, 3.1 km).

## Per metro: estimate of real day-visit bouldering gyms vs Bouldeer
| Metro | Estimated real gyms | Already in Bouldeer | Accepted here | Deferred | Remaining leads / not counted |
|---|---|---|---|---|---|
| Los Angeles County (LA, Westside, Valley, South Bay, Long Beach, Pasadena/Burbank, Santa Clarita) | about 19-21 | 19 (Sender One x4, Touchstone x6, Rockreation, Stronghold x2, Boulderdash SFV, Top Out, Long Beach Rising, Hangar 18 South Bay/Long Beach/Arcadia) | 0 | 0 | school and rec walls (CSULB, Caltech, Agoura Hills Community Center, Torrance YMCA) are out by rule; Gymnastics World (kids); The Factory Bouldering (Orange) and ClimbX (Huntington Beach) domains now redirect to spam, so treated as closed; "Arcadia Rock Climbing" (arcadiarockclimbing.com) no longer resolves; Hangar 18 Arcadia, already in Bouldeer, is the only Arcadia gym on the chain and directory lists |
| Orange County | about 8-9 | 8 (Sender One Santa Ana and Aliso Viejo, Hangar 18 x3, Movement Fountain Valley, Rockreation Costa Mesa, Aesthetic) | 1 (Rock City Climbing, weaker) | 0 | Sender One Huntington Beach was announced in an old trade article but is not on Sender One's current location list; UCI/CSUF walls (school) |
| Inland Empire (Riverside, San Bernardino, Coachella Valley) | about 8-9 | 8 (Hangar 18 x5 incl. High Desert, Flowstone, Rock Fitness, Vital Murrieta) | 0 | 1 (Desert Rocks, North Palm Springs) | CSUSB wall (school); The Bullet Hole (Victorville) is a kickboxing gym; Just Play Adventure Park (Rancho Cucamonga, trampoline/ninja) |
| Ventura County | 2-3 | 2 (Boulderdash Ventura; Boulderdash Thousand Oaks listed as "Westlake Village", wrong pin) | 0 | 0 | Sender One Thousand Oaks is "2027" |
| San Francisco | 4-5 | 4 (Movement, Benchmark, Dogpatch, Mission Cliffs) | 0 | 1 (Aisle 19, coming soon) | Glen Park Rec Center (municipal); UCSF wall (university) |
| East Bay (Oakland, Berkeley, Emeryville, El Cerrito, Concord, Fremont) | 9-10 | 9 (Ironworks, Oaks, Mosaic, Benchmark, Bridges, Great Western Power, Pacific Pipe, Diablo, Peak of Fremont) | 0 | 2 (Team Training Center, Berkeley: members-only; Bladium, Alameda: site unreachable) | Oaktown Boulders (kids only); Rocktopia (kids, inside a gymnastics club, moved to Walnut Creek); ClubSport Pleasanton (fitness-club wall) |
| Peninsula | 2 | 2 (Hyperion, Movement Belmont) | 0 | 0 | none found |
| South Bay (San Jose, Santa Clara, Sunnyvale, Mountain View) | 4 | 4 (The Studio, Movement x3) | 0 | 0 | Spartan Recreation (SJSU, university) |
| Marin | 1 | 1 (Gravity Vault Marin) | 0 | 0 | none found |

## Main sources
- Chain location lists read 2026-10-13: Touchstone (19 locations), Movement California (6), Sender One home (7 incl. Thousand Oaks 2027), Hangar 18 home (11), Benchmark (SF, Berkeley), Mesa Rim (San Diego area and Austin only).
- OSM via Overpass: `sport~climbing`, `climbing:boulder`, and name/leisure searches over two boxes (LA/OC/IE/Ventura 33.3-34.8 N, -119.4 to -116.8 E; Bay Area 36.9-38.2 N, -122.7 to -121.5 E). Every OSM-mapped indoor climbing centre in both boxes is already in Bouldeer except Team Training Center (Berkeley), the Mount Hermon/Santa Cruz-mountains camp walls, and a few unnamed or school/ropes-course elements.
- Photon name searches (about 30 name stems per box) and four directories (99boulders 2022 list, Climb Local, indoorclimbinggym.com, Boulder Nomads) as leads only: they name no gym that Bouldeer lacks except those in the table above.
- Official sites read for the candidates: Boulderdash (chain plus three gym pages), Rock City, Touchstone Aisle 19 and Team Training Center, Hangar 18, Sender One, Benchmark.

## Notes and uncertainties
- Overpass was overloaded for most of the session (timeouts, 504s); the final extracts ran once the public instance had free slots. A few web searches returned only thin, old results, and DuckDuckGo's HTML endpoint was rate-limited, so discovery of very new independents that are neither in OSM nor in any directory is the main residual risk.
- Rockreation Los Angeles / Costa Mesa: the old domains (rockreation-la.com, rockreation-cm.com) now serve unrelated spam pages, so the gyms' own sites could not be read; a ClassPass listing shows bookable July 2026 classes at Costa Mesa. Left untouched (existing gyms); worth a one-line check by whoever owns the existing-gym audit.
- Coordinates: every candidate pin is an OSM element or a Nominatim house-number match; no Google-derived coordinates were used. The Google embedded maps on the Boulderdash and Rock City sites were used only as cross-checks (Rock City's map link is stale: it still points at the old Anaheim address).
