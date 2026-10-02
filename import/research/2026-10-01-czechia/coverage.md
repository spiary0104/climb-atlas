# Coverage: Czechia (wave 2)

## Result
- 25 candidates with a coordinate source (all from the gyms' own sites: published GPS text, mapy.cz or Google map links, or map embeds); 20 further gyms/sites are listed in `unlocated.md` because no allowed coordinate source was reachable.
- 24 sources registered (gym sites, one directory). OpenStreetMap is NOT used: the CZ Overpass extract (`osm/CZ.json`) never appeared during this pass (about 50 minutes of waiting; the shared download kept retrying). No candidate cites OSM.

## Cities covered
Praha (13 gyms: Karlín, Holešovice, Letňany, Lokal Blok, SmíchOFF, BigWall, MyWay, V síti, UltraAnt, FreeSolo, JamJam, Třináctka, Ruzyně), Brno (HANGAR, HUDY, Duro, Komec, plus Basecamp/Flash/VUT unlocated), Ostrava and region (HANGAR, Tendon Blok, Eliass [closed], Replay Frenštát, Družba/Nový Jičín unlocated), Pardubice (Jungle, Gekon), Liberec/Jablonec (Boulder Point, MakakAréna), Hradec Králové, Nové Město nad Metují (Plechovka), Olomouc (Pajkland, Flash Wall), České Budějovice (Lanovka, Limit), Plzeň (V16, Koloseum), Kolín, Kladno, Mladá Boleslav, Ústí nad Labem, Jihlava, Karlovy Vary.

## Main sources
Gym own sites (primary), Lamaholds national wall list (directory; used only to confirm existence/name), web searches for Czech-language leads. Facebook-only gyms (Družba, Crux, Boulder Bar Nový Jičín, Boulder Centrum VUT) could only be confirmed by page title, so their status is "unknown".

## Findings worth a reviewer's attention
- Eliass (Ostrava) closed on 31 Mar 2026 per its official hours page: recorded as closed.
- Jungle Holešovice (ex Boulder Bar) was shut July to mid Sept 2026 for a rebuild and reopened 14 Sep 2026 per its site.
- Boulder Point (Liberec) opened an extra 1000 m2 hall in Sept 2026.
- MakakAréna is in Jablonec nad Nisou (new boulder hall Jan 2026). Boulder Plechovka is in Nové Město nad Metují (Lamaholds wrongly says Plzeň); it is a club hall with informal hours.
- Boulder Cafe Plzeň shows "operation suspended" on its own site: not included. Kotelna Brno: only a stale 2017 site: not included.
- Flash Boulder Bar Brno address (Foglara 13) comes from the operator's address on a sister site plus a directory snippet; the Flash contact page returned HTTP 500.
- Street-level only coordinates (Google embed centre): V síti, Gekon, Komec, V16.
- Already on Bouldeer per check.js: Karlín, SmíchOFF, BigWall, JamJam, Třináctka (and likely others at review).

## Probably missing
Rope walls with small boulder rooms that were not checked individually (HUDY Dejvická/other shops, Prostor Letňany, SC Palmovka, Squashpark Cibulka, Vertikon Zlín indoor spray wall, LezeTop Písek, Wallclub Tábor, Sport Hodonín bouldrovka, Alcedo Vsetín, Wolker Prostějov, Boulder Bar Znojmo, Jirkov, Bělá/Děčín, Beroun, Cheb); university/club walls (Juliska ČVUT, VŠE); Jungle Ostrava (announced for autumn 2026); several small-town school walls. Many Czech rope walls have a boulder area that the site only mentions in passing.

## Access problems
- OSM extract missing (see above); no Overpass/Nominatim queries were made by this pass (one early accidental run of the shared osm/fetch.js with default countries was started by mistake and could not be stopped; it only queried other countries).
- Web search is US-only and the quota worked; WebFetch got ECONNREFUSED on some Czech sites so pages were read via direct HTTP requests.
- Facebook pages are not readable beyond title.
