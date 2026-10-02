# Thailand coverage notes (2026-10-01)

## Result
16 candidates (check.js: ready 3, review 8, blocked 4, existing 1, invalid 0), 13 gyms in unlocated.md, 25 sources registered.
Bouldering confirmed on a primary source for 12 candidates; 4 candidates carry bouldering "unknown" or missing "open" evidence (Climb Central Bangkok, Bloc City, Ascentory, No Gravity) and will block until a primary page is read.

## Cities and areas covered
Bangkok (Balance Rama 9, Balance Prime, Eagle Eye, Stonegoat S69 and The PARQ, Urban Playground, Rock Domain, Climb Central, Bloc City), Pathum Thani (Boulder Planet Rangsit), Chiang Mai (Progression Vertical, No Gravity), Phuket (Rebel Rock), Surat Thani islands (The Bunker on Koh Tao, Upside on Koh Phangan), Khon Kaen (Ascentory). Unlocated gyms add Chiang Mai, Phuket (Go Bould), Pattaya/Chonburi, Khon Kaen, Nonthaburi.

## Main sources
Gym sites: balanceclimbing.com, eagleeyeclimb.com, stonegoatclimb.com (per-branch pages with map pins), rqclub.com (Urban Playground), rockdomaingym.com, boulderplanet.co.th, thailandclimbing.com (Progression Vertical), rebelrockclimbing.com, kohtao-rockclimbing.com, upsideboulder.com, gobould.com, Linktree and Facebook/Instagram bios (og descriptions only). OSM extract for coordinates. Directories (theamateurclimber, cnxwebdesign guide, thesmartlocal, Mountain Project, TripAdvisor snippets) were used only to find leads.

Coordinate method: OSM element where the gym is mapped; otherwise the pin of the Google Maps link published on the gym's own site (resolved from the short link): Balance Rama 9, both Stonegoat branches, Boulder Planet; Ascentory uses the marker point embedded in its Linktree. I did not use Google, Mountain Project or any other listing for coordinates.

## Probably missing
- Gyms I could not locate (see unlocated.md); several are real bouldering gyms (Gravity Lab, F5, Main Wall, Alpine Outpost, Go Bould, Sticky, Volume, Magnus) and are the first thing to add once a coordinate source exists, for example from a later OSM extract.
- Thai-language searches returned mostly listicles; the search tool is US-only and gave little on smaller provincial gyms (Hat Yai, Korat, Udon Thani, Hua Hin, Rayong, Samui). Not verified either way. A few hotel/fitness venues with a small wall were ignored (WellFit Bon Marche, Fairtex Pattaya, Decathlon, Beat Active at BITEC Bang Na).
- Excluded on purpose: Red Rock Canyon (Bang Phli; official page shows only 12 m top-rope lanes, no bouldering shown), Big C Ladprao wall (rope-focused), Koh Tao Climbing Project (OSM fixme and reports it closed or moved), Railay and Krabi OSM items (outdoor crags and climbing schools), adventure parks and ziplines.
- The old C3 / CMRCA gym in Chiang Mai old city was treated as the predecessor of Progression Vertical, not a separate gym; if it still operates separately it is missing.

## Access problems
- climbcentral.co.th: TLS handshake failure and connection refused (also Playwright); Climb Central bouldering could not be confirmed from a primary source.
- urbanplaygroundclimbing.com: connection refused (the RQ Club page was used instead).
- f5bkk.com: connection reset. beancowclimbing.com: domain does not resolve. walltopia.com: blocked by a bot check.
- Facebook and Instagram return only the short og description to a plain fetch; hours, addresses and posts are not readable, so "open" is not claimed for FB-only gyms.
- Shared Playwright browser was in use by another agent, so it was not relied on.

## Notes for the reviewer
- Rock Domain: official address says Bangkok; some listings say Samut Prakan.
- Eagle Eye: a directory reports a long closure before a relaunch; the official site shows current operation.
- Balance Prime and Balance Rama 9 share a website and chain; the review flags are expected.
- Urban Playground has two OSM nodes for one gym (node/4506370350 and node/11112955887).
