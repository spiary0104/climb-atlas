# Russia coverage (wave 1, 2026-10-01)

## Result
29 candidates: 27 open bouldering gyms and 2 closed records (Severnaya Stena Bukharestskaya; El Capitan St Petersburg, bouldering unknown). check.js: ready 10 | review 17 | blocked 2 | existing 0 | invalid 0. Several review flags are real matches to seed records (BigWall Dinamo, Limestone, Rock Zona, Igels, Tramontana, Severnaya Stena); left for the human reviewer.

## Cities covered
- Moscow: 15 candidates (BigWall x3, Limestone, Climb Lab x2, Atmosfera, Tokyo ClimbIN, Staraya Shkola, Tengu's x3, Rock Zona, CSKA, Sportstation, Ekstrim).
- Saint Petersburg: 10 candidates (Luch, Igels, Neolit, Tramontana, Energiya Vysoty, ClimbArt, Severnaya Stena Petrogradskaya, plus two closed records).
- Yekaterinburg: 2 (Rock and Wall bouldering hall, Kray Sveta). Chelyabinsk: 2 (Iskra Center, Iskra Severok).
- All other coded cities (Novosibirsk, Kazan, Nizhny Novgorod, Krasnodar, Krasnoyarsk, Samara, Ufa, Rostov, Omsk, Perm, Voronezh, Volgograd, Saratov, Tyumen, Tolyatti, Izhevsk) have zero candidates: see unlocated.md.

## Main sources
Gyms' own sites (primary; chain site for BigWall, Tengu's, Climb Lab, Iskra, Severnaya Stena), OSM extract (coordinates for 16 candidates), official map pins (Tilda MapMarkers, Yandex map-constructor embeds, Bitrix placemark) for 13. Leads from mosclimbing.ru (Moscow federation), climbcomps.ru, maps.climbingpro.ru, piter.now. Two news items (peterburg2.ru, paperpaper.io) confirm the 2026 Petersburg closures.

## Findings worth a reviewer's eye
- Severnaya Stena Bukharestskaya closed 20 May 2026 (official site and news); El Capitan St Petersburg closed 30 April 2026. Both recorded as closed. Severnaya Stena Petrogradskaya remains open (bouldering only).
- BigWall's Luzhniki site is outdoor and seasonal: not recorded. The OSM node pointing at bigwallsport.ru/vdnh is stale (page does not exist).
- Limestone: the site's own Google embed is about 2 km from its street address; OSM point used.
- Tengu's pins and Iskra pins were matched to halls by street position or marker label, not by an explicit address-to-pin link: flagged in research_notes.
- Ekstrim: OSM node is named Vertikalny Mir and tied to the site by website only; bouldering is a side offer.

## Probably missing
- Most small regional gyms exist only on VK or have dead domains; none could be verified. Expect dozens more bouldering gyms in Novosibirsk, Kazan, Nizhny Novgorod, Krasnodar, Krasnoyarsk, Samara, Ufa, Perm, Voronezh, Rostov (climbcomps.ru lists 165 gyms nationwide, about 30 of them in coded cities beyond Moscow/St Petersburg).
- Moscow: Red Point, Gravitatsiya, HighWall, GoClimb, Boulder Park Orekhovo (see unlocated.md); likely more mall-based boulder halls not on the federation list.
- OSM coverage of Russian gyms is thin (121 elements in coded cities, mostly parks and outdoor crags).

## Unlocated count
43 bullet entries in unlocated.md (many bundle several gyms), about 15 of them under 'no region code'. Red Point has OSM coordinates but no reachable primary source; Krasnodar El Capitan has a live site with a bouldering hall but no coordinate source.

## Access problems
- WebSearch budget ran out partway; later leads came from directories and direct page fetches.
- Blocked or unreachable from the research machine: redpoint.msk.ru (connection refused), gravitacia-club.ru (bot challenge, not bypassed), centrlad.ru (403), vk.com (login wall), and several domains that did not resolve (panorama-sport.ru, kask.ru, skalodrom63.ru, skalodrom-visota.ru, highwall.ru, boulderpark.ru, championskala.ru).
- The first OSM fetch for RU returned an Overpass error; the extract was replaced later in the session and used afterwards.
