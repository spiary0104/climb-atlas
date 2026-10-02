# Russia (2026-10-01-russia) review notes

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending.

Tally: accept 20, same-as 6, defer 1, reject closed 2 (29 total). Validated OK with tools.js.

## same-as (6)
- ru-001 -> seed-1489 BigWall Dinamo (same address, 47 m).
- ru-004 -> seed-1487 Limestone (same address, 15 m).
- ru-013 -> seed-1488 Rock Zona (same address, 91 m).
- ru-018 -> seed-1491 Igels, ru-020 -> seed-1493 Tramontana, ru-022 -> seed-1492 Severnaya Stena Petrogradskaya.
  All three carry followup location-update: these three seed gyms share one placeholder pin (59.9607, 30.1587), 7.5 to 10.5 km from the real halls. Candidate pins: Igels = own site map marker; Tramontana = OSM node/1402188633; Severnaya Stena = OSM node/9124072117.

## Defer (1)
- ru-015 Sportstation: station.club now serves a Timeweb parked-domain page to me (https cert mismatch; http redirects to bitrix396.timeweb.ru/parking), so the primary page could not be re-verified. Public drop-in access for this multisport club is also not in the evidence, and a second club (Gravitatsiya) is at the same address. Needs a working official page or owner confirmation. (It may be a network or geo effect on my side; worth a manual look.)

## Rejected
- ru-023 Severnaya Stena Bukharestskaya: closed from 20 May 2026 (own site, N1, N2).
- ru-024 El Capitan SPb: closed 30 April 2026; no gym-owned page, bouldering unknown.

## Accepted with caveats
- ru-010/011/012 Tengu's (rule G): I fetched the three Yandex constructor embeds on tengus.ru. Each sits in the same page column as its address block and its pin equals the candidate coordinates exactly, so these are the gym's own published pins (not only street-position matches).
- ru-028/029 Iskra (rule G): the contacts page's own marker data titles the markers "Tsentr" and "Severok" (matching the hall names Iskra.Centr / Iskra.Severok) at exactly the candidate coordinates.
- ru-016 Ekstrim: bouldering is a secondary offer; address match confirmed by reverse-geocoding OSM node/9874108551 (63B Smolnaya ulitsa, node carries the gym's website). No single hours line on the site, but group schedule and 2026 copyright are present.
- ru-021 Energiya Vysoty: site footer says 2022-2025 and an old New Year banner remains; hours and ticket sale are listed.
- ru-014 CSKA: a second CSKA entry on Leningradsky pr. 39 in the federation list is unverified and not recorded.
- ru-003 BigWall Gavan: nav labels it "new", but hours and booking are live.
- ru-002/003/006/009/025: single source, but each is the gym's own primary page showing exists, open, bouldering.

## Coordinates and evidence issues
- Limestone (ru-004) own Google embed is about 2 km off; moot because it is same-as and the existing seed pin agrees with OSM within 15 m.
- Tramontana's site is thin on bouldering (only Boulder Battle 2026 news, copyright 2022, spam text injected), irrelevant for same-as but the existing seed already lists it.
- bigwallsport.ru returned 403 to the default curl user agent once (rate limiting); re-fetched fine with a browser UA.

## Owner decisions
- Confirm the three location-update followups for the SPb seed gyms.
- ru-015: provide or approve a source for Sportstation, or leave deferred.
