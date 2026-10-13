# Coverage: UK regional cities (2026-10-13-uk-cities)

## Result
- Scope: GB (whole country, no bbox; London excluded by choice and covered by 2026-10-06-london). 30 candidates, 27 sources. 21 accepted (staged), 1 same-as (location-update follow-up), 2 rejected, 6 deferred (MANUAL-CHECK.md).
- Reconcile: ready 15 | review 8 | blocked 6 | existing 1 | invalid 0. Plan: new 21, nothing existing/duplicate. Production dry-run: PREFLIGHT PASSED (partial, no credentials). The offline list showed 159 GB gyms before this section.
- The earlier estimate (UK ~170 missing; Manchester/Bristol/Birmingham ~25) is not borne out for these cities after the five earlier UK sections: this pass found 21 new gyms. What is left is mostly council leisure-centre walls, school/university walls and kids' centres.

## Method
- Discovery: chain location pages (Awesome Walls, The Climbing Hangar, Rock Over, Flashpoint group, Boulders, Depot, Eden Rock, Climb Newcastle, Parthian/The Font, TCA), OSM `sport=climbing|bouldering` extracts by bounding box (Overpass: England north, Midlands, south, south-west, Bristol, Thames valley; the Scotland/Wales/Northern Ireland/south-east queries timed out because the public servers were overloaded), Nominatim and Photon name searches for about 55 city boxes (Glasgow, Edinburgh, Aberdeen, Dundee, Belfast, Stirling, Perth, Inverness, Cardiff, Swansea, Newport, North Wales, all English regional cities), Mountaineering Scotland's wall list, boulderingwall.com/uk and boulderinglist.com as signposts only. Everything was compared with the 159 GB gyms already in Bouldeer.
- Every accepted gym was confirmed on its own official site (JavaScript sites and 403 sites read in a headless browser or page reader). Pins are the gym's own OSM node/way, cross-checked against postcodes.io centroids (cross-check only) and, for Boulder Brighton, the gym's embedded map.
- Not done: Overpass for Scotland/Wales/NI/South-East was unavailable, so small-town gyms there with names that do not contain "climb"/"boulder" could be missed (name searches found nothing new in Scotland or Belfast).

## Per city: accepted / deferred / leads versus the estimate
| City / area | Accepted here | Deferred | Leads / notes | Estimate in the gap report |
|---|---|---|---|---|
| Manchester + Greater Manchester | 4: Awesome Walls Stockport, Rock Over Bolton, Rock Over Sharston, Summit Up (Oldham) | Climb Rochdale | Parthian Manchester closed (rejected) | ~14 (4 already in Bouldeer) |
| Liverpool / Merseyside | 0 | 0 | Nothing found | - |
| Leeds / Bradford / Sheffield | 0 | Last Sun Dance (Leeds) | Broomhill Climbing Works (OSM stub) | - |
| Birmingham + West Midlands | 2: Birmingham Bouldering Centre, Redpoint Birmingham | 0 | Social Climbing Coventry/Solihull unlocated | ~10 (3 already in Bouldeer) |
| Bristol and Bath | 2: Climbing Hangar Bristol, Flashpoint Easton | 0 | Hengrove Park (council); Bath: nothing found | ~12 (4 already in Bouldeer) |
| Newcastle / Gateshead / Sunderland | 1: Friction Bouldering (Gateshead) | 0 | - | - |
| Nottingham / Leicester / Derby | 2: The Climbing Unit, Alter Rock (Derby) | Boatyard Boulders (Nottingham), Social Climbing Leicester | - | - |
| Cardiff / Swansea / Wales | 3: Boulders Cardiff, Flashpoint Cardiff, Boathouse (Llandudno) | 0 | Rock UK Summit Centre (Treharris) not checked | - |
| Glasgow / Edinburgh / Aberdeen / Dundee | 0 | 0 | The Peak (Stirling), Ice Factor, Rock Face (Dunfermline) not researched; name searches found nothing else | - |
| Belfast | 0 (Boulder World is already in Bouldeer, same-as) | 0 | Boulder World pin off by about 440 m (location-update follow-up); Awesome Walls Belfast is gone | - |
| Oxford / Cambridge / Brighton / Southampton / Reading | 2: Gallery Bouldering (Oxford), Boulder Brighton | 0 | Rainbow Rocket Central (Cambridge) closing 15 Nov 2026 (rejected); Southampton and Reading: nothing missing | - |
| Elsewhere (found while sweeping) | 5: Awesome Walls Stoke, KendalWall (Kendal), 270 Climbing (Gloucester), Redpoint Worcester, Boulder Barn (Hereford) | Barn Tavistock, Quay Exeter | The Wall Ulverston | - |

## Accepted (21)
Awesome Walls Stockport; Awesome Walls Stoke; KendalWall; Rock Over Bolton; Rock Over Sharston; Summit Up Oldham; Boulder Brighton; Gallery Bouldering Oxford; 270 Climbing Park Gloucester; Boulders Cardiff; Flashpoint Cardiff; Flashpoint Bristol - Easton; Birmingham Bouldering Centre; Redpoint Birmingham; The Climbing Unit Derby; Alter Rock Derby; Redpoint Worcester; The Boulder Barn Hereford; The Climbing Hangar Bristol; Friction Bouldering Gateshead; Boathouse Climbing Llandudno.

## Chains checked and complete
The Climbing Hangar (9 locations; only Bristol was missing), Awesome Walls (6 centres; Stockport and Stoke were missing), Rock Over (3; Bolton and Sharston were missing), Flashpoint group (Easton and Cardiff were missing), Boulders (Cheltenham, Cardiff), TCA (5, all in Bouldeer), Eden Rock (Carlisle, Edinburgh, Newcastle: all in Bouldeer), Parthian/The Font (Southampton, Reading in Bouldeer; Manchester closed).

## Access problems
- Overpass (all public mirrors) returned 504/timeouts for most queries; the south, south-west, Bristol, Thames valley, Midlands and north extracts completed, the others did not.
- 403 / blocked: lakelandclimbingcentres.co.uk (read via a page reader), redpointbirmingham.co.uk, rainbowrocket.cc (browser), ice-factor.co.uk (Cloudflare, even in a browser), exeter.gov.uk, rockreef.co.uk (page reader).
- Domains that no longer resolve: climbrochdale.com, socialclimbing.co.uk (parked page).
