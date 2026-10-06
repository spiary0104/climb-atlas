# Coverage: Canada coverage gap (2026-10-06)

## Result
- 97 candidates (ca-*): accept 85, same-as 4 (existing gyms; 3 with location-update follow-up), defer 8, reject 0. 3 further real gyms have no pin and are not candidates (MANUAL-CHECK B).
- Reconcile: invalid 0. Plan: 85 new, 0 probable duplicates. Pins: 53 OSM elements (nodes/ways of the gym, building precision), 39 Nominatim house-number matches (building), 2 official-map embeds and 3 street-level geocodes (street precision; the street-level ones are all deferred).
- Tools used: chain location lists, official sites (re-read 2026-10-06), OSM Nominatim for coordinates, Mountain Project and indoorclimbing.com directories for discovery only. Overpass was unreachable for most of the run; no OSM-wide sweep.
- Bouldeer had 23 Canadian gyms; the batch would add up to 85 (to about 108).

## Accepted by city / region (estimate of real-world gyms vs Bouldeer after import)
| Metro | Estimate | Existing | Accepted here | Remaining leads |
|---|---|---|---|---|
| Toronto / GTA | ~20 | 7 | 14 (Toronto 5, Hub Markham+Mississauga, RockHaus, Aspire Milton+Whitby, Toprock, Boulder Parc, Climber's Rock, Pinnacle, Of Rock and Chalk, Core ...) | Kong, Hogtown 2nd site, Rock Oasis Ajax, Gravity (Hamilton) |
| Montreal island + Laval/Longueuil | ~18 | 5 | Shakti, Allez Up Mile End + Verdun, Bloc Shop Hochelaga + Mile-Ex, Zéro Gravité, Le Crux Laval, Rose Bloc x2 (+ same-as Le Mouv', Allez Up PSC) | Monolithe Escalade, Beta Bloc, Vertical (LaSalle) |
| Vancouver region | ~14 | 4 | Hive Surrey/PoCo/North Shore, Coastal, Project Cloverdale/Abbotsford/Chilliwack, Base5 Coquitlam | Hive Winnipeg (MB, deferred) |
| Calgary | ~10 | 3 | Rocky Mountain, Hanger, Stronghold, Bolder Elevated | Lycée wall (rope) |
| Ottawa-Gatineau | ~8 | 1 | Klimat Ottawa, Altitude Orléans + Gatineau, Bloc 9.81 | Coyote (no primary bouldering text) |
| Edmonton | ~7 | 0 | BLOCS, Boulders, Vertically Inclined | Factory, Niche (deferred), Wilson |
| Winnipeg | 2-3 | 0 | Vertical Adventures | Hive (deferred) |
| Quebec City | ~5 | 0 | Délire Pierre-Bertrand + Sainte-Foy, Roc Gyms, L'Accroché | Délire Lévis (deferred) |
| Halifax-Dartmouth | 4 | 0 | Seven Bays x3, East Peak | Ground Zero |
| Victoria | 3 | 0 | BoulderHouse x2, Crag X | Boulders Climbing Gym |
| Kitchener-Waterloo | 2-3 | 1 | none (Grand River Rocks Waterloo site is geo-blocked) | GRR Waterloo |
| Hamilton | 2 | 0 | none | Gravity (script-only site) |
| London ON | 2 | 0 | J2 Bouldering, Junction | |
| Saskatoon / Regina | 3 | 0 | Grip It Caswell + Nelson | Regina Climbing Centre |
| Kelowna | 3 | 0 | Beyond the Crux | Gneiss x2 |
| Squamish | 1 | 0 | Ground Up | |

Other accepted: Barrie, Brantford, Cambridge, Guelph, Kingston, Newmarket, Peterborough, Windsor, Moncton, Saint John NB, Trois-Rivières, Drummondville, Granby, Sherbrooke, La Prairie, Sainte-Julie, Rouyn-Noranda, Wakefield, Boisbriand, Kamloops, Nanaimo, Langford, Sechelt, Whistler, Cranbrook, Kimberley.

## Chains covered
Hub Climbing (2/2), The Hive (BC 5/5 incl. 2 existing; Winnipeg deferred), Allez Up (3/3), Bloc Shop (3/3), Boulderz (3/3, existing), Basecamp (2/2), Calgary Climbing Centre (5/5), Bolder (2/2), Altitude Gym (3/3), Klimat (2/2), Délire (3 of 4 open sites; Lévis deferred, Beauport closed), Rock Jungle (3, 1 accepted), Seven Bays (3/3), Grip It (2/2), Project (3/3), BoulderHouse (2/2), Le Crux (2 of 3), Rose Bloc (2/2), Aspire (2/2), FitRocks (2/2). Not reachable: Grand River Rocks, Gravity.

## Remaining leads
See MANUAL-CHECK.md. Biggest unknowns: Toronto east/north suburbs, Montreal Monolithe/Beta Bloc, Hamilton/Waterloo (blocked sites), Kelowna, and a proper OSM Overpass sweep (sport=climbing) which could not be run.
