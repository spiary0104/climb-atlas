# Coverage: Turkiye (section 2026-10-01-turkey)

## What was done
- 9 candidates written (cities: Istanbul x3, Antalya x2, Ankara x2, Izmir x1, Eskisehir x1). 4 unlocated leads in `unlocated.md`.
- Result of `check.js`: 9 candidates -> ready 1 | review 3 | blocked 4 | existing 1 | invalid 0.
  - ready: Boulder Istanbul. existing: Boulderhane (matches Bouldeer seed entry, 23 m).
  - review: Boulder Jungle, Tragos Boulder (single source only), Mozaik (club category, single source).
  - blocked: DuvarX, Climbinn (bouldering not stated on their own sites), Boulder Eskisehir (own site is a bare page; open status and bouldering unconfirmed), Kisakaya (own site says it is relocating and temporarily closed).
- Sources registered: 12 (OSM; 9 gym official sites; MultiSport directory; a 2019 club blog).

## Main sources
Gym official sites and their embedded map pins (Wix map widget data for Boulder Istanbul, Google Maps embeds/links for the rest), the Benefit Systems (MultiSport) facility directory, and the OSM extract. Searches were in Turkish and English (boulder salonu, tirmanis salonu, tirmanis duvari, spor tirmanis, bouldering + city names).

## Access problems
- The OSM extract `TR.json` was initially an Overpass error page (invalid regex); it was replaced with a real extract partway through. Everything in it that is a gym (as opposed to crag nodes) was checked. Only Boulder Istanbul and the two Kisakaya nodes were usable; the Boulderhane node is the pre-2025 venue and stale.
- Instagram and Facebook pages (Boulderhane, DuvarX, Boulder Eskisehir, Kisakaya, Boulder Jungle, Duvar Bursa) could not be read, so several gyms lack a primary "bouldering" statement or fresh open-status evidence.
- The web search budget ran out before the last round (Samsun/Konya/Adana/Mersin/Gaziantep gym queries were not run).
- Short Google Maps links (Tragos, Boulder Jungle, Mozaik) were resolved by following the gym's own link to read the pin.

## Probably missing / uncertain
- Little evidence of dedicated bouldering gyms outside Istanbul, Ankara, Izmir, Antalya, Eskisehir and Bursa. Searches for Adana, Konya, Kayseri, Gaziantep, Mersin, Trabzon, Samsun, Kocaeli and the Muğla coast found nothing; these are search gaps, not confirmed absences (several of these cities have municipal or university sport-hall climbing walls that are rope or competition walls and were left out).
- OSM has unnamed climbing-tagged sports centres (e.g. way/1292677882 "Tirmanma Duvari" in Istanbul, way/665506969 and way/1234274337 in Bursa, way/660991428 in Izmir, node/5377289029, node/11518331271) and club entries (Adana Tennis, Dag ve Su Sporlari Kulubu; Tenis Eskrim Dagcilik Spor Kulubu, Istanbul). These look like municipal, university or club walls and were not verified or included.
- Boulderhane's older venues are closed or moved (company is on its third-plus location); a stale OSM node/9701367817 remains at the 4. Levent site.
- Kisakaya: the old Kucukesat address (OSM node/3571968693) is stale; the new venue (Yasamkent per its Instagram; a Sincan branch is also listed by directories) is unconfirmed, so tr-009 should be rechecked before any import.
- Mozaik (Antalya) is a church-run community center, so public access terms should be checked.
- Climbinn and DuvarX very likely offer bouldering (a MoonBoard and boulder sessions are mentioned by third parties) but need a primary statement. Candidates with bouldering "unknown" carry a placeholder types value ("top-rope") only because the format requires a non-empty list; no rope offering was confirmed for them.
- Pin notes: embed centres for DuvarX and Climbinn sit about 200 m from the MultiSport directory pins; the site embeds were used.

## Counts
Candidates 9, unlocated 4, sources 12.
