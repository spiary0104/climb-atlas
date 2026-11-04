# Coverage: Australia city coverage gap (2026-10-13)

## Result
- 47 candidates (au-*): accept 24, same-as 13 (existing gyms; all with a location-update follow-up), defer 7, reject 3 (rope-only Clip 'n Climb venues). Further real-looking gyms without a pin or readable site are in MANUAL-CHECK B.
- Reconcile: invalid 0. Plan: 24 new, 0 probable duplicates. Read-only `import --dry-run`: preflight passed (partial coverage: the service-role read is not available here).
- Pins: 20 OSM elements of the gym or its building (building precision, including Morningside and Gosford found through Photon), 2 official-map pins (Rock It Derwent Park map block, Beyond Bouldering Thebarton embed), 2 OSM address points (The Hold, Wall Walkers). The street-level pins (Adamstown, Joondalup) are deferred.
- Tools: Overpass (`sport=climbing` over AU; later queries failed with timeouts), Photon, official sites (re-read 2026-10-13, Urban Climb pages in a browser), Sitchu and indoorclimbing.com for discovery only. Web search used lightly (about 9 queries).
- Bouldeer had 66 Australian gyms; the batch would add 24 (to 90). Estimate in the coverage report: 115 (90-150).

## Accepted by city (estimate of real-world gyms vs Bouldeer after import)
| Metro | Estimate | Existing | Accepted here | Remaining leads |
|---|---|---|---|---|
| Sydney | ~40 | 22 | 9 Degrees Chatswood | Climb Oz Blacktown (rope), Umbrella Nine Co Brookvale, The Cave Marsfield; OSM sweep found few unlisted gyms, so the estimate may be high |
| Newcastle / Hunter / Central Coast | ~8 | 1 | Pulse Gosford, Pulse Maitland | Pulse Adamstown (deferred: pin), Camp Street (Katoomba, deferred) |
| Wollongong / Illawarra | ~4 | 3 | none | Dynomite (410 on its domain: verify), possible Fairy Meadow site |
| Melbourne | ~30 | 13 | Flow Climbing, Northside Abbotsford, Boulder Lab Brunswick + Clayton South, Climb West Altona, The Crux | Boulder Lab Heidelberg (coming 2026) |
| Geelong / regional VIC | ~6 | 0 | Industry Boulders, The Hold Bendigo, Buffalo Boulders (Myrtleford) | Friction Bouldering Ballarat (domain parked) |
| Brisbane / Ipswich / Redlands | ~14 | 6 | 9 Degrees Morningside, Wall Walkers (Capalaba) | ICP Boulder Hall, Exodus Narangba |
| Gold Coast | ~6 | 2 | Alpine Currumbin, Cutloose (Upper Coomera) | On Belay (ropes?) |
| Sunshine Coast | ~4 | 2 | none | Flow Bouldering (deferred), Boulder Heads Baringa |
| North and central Queensland | ~3 | 2 (Atherton, Rockhampton) | Urban Climb Townsville | Cairns: nothing found |
| Perth | ~12 | 6 | Portside Willetton, Adrenaline Vault Cockburn | Portside Joondalup (deferred: pin), Mandurah (deferred), Rockface Balcatta, Iris Boulders |
| Adelaide | ~6 | 3 | Urban Climb Adelaide, Beyond Bouldering Thebarton, Laneway Boulders | none known |
| Canberra | 3-4 | 3 | none | all known gyms already present |
| Hobart / Launceston | ~4 | 2 | Rock It Derwent Park | none known |
| Darwin | 1-2 | 0 | Gecko Climb | Freedom Tower (OSM "climbing" element, not checked) |

## Chains covered
9 Degrees (Alexandria/Waterloo/Lane Cove/Parramatta/Enoggera existing, Chatswood and Morningside new), NOMAD (2/2 existing), BlocHaus (Marrickville, Leichhardt, Port Melbourne, Canberra x2 existing), Northside (3/3), Boulder Lab (3 open, Heidelberg coming), Urban Climb (all 7 venues; Adelaide and Townsville new), Pulse (Warners Bay existing; Gosford, Maitland new; Adamstown deferred), Portside (3 of 4), Adrenaline Vault (2/2), Alpine (2/2), Beyond Bouldering (3/3), Climb Fit (3/3 existing), Rock It (Hobart existing, Derwent Park new), Clip 'n Climb (rope-only, rejected), Hardrock (CBD existing; the Heatherton site is Clip 'n Climb).

## Remaining leads
See MANUAL-CHECK.md. Biggest unknowns: regional NSW/QLD towns (no OSM or directory entries beyond those listed; no systematic sweep), a name-based Overpass sweep for gyms not tagged `sport=climbing` (Overpass failed after the first query), and closure checks of the older existing records.
