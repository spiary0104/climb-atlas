# Review notes: 2026-10-01-czechia (drafted by Claude, owner sign-off pending)

Tally: 25 candidates = 10 accept, 5 same-as, 1 reject (closed), 9 defer. Validated OK with tools.js.

## Method note (important)
Pins were re-checked against the gyms' own pages (read-only curl, no search engines). Two systematic problems in the recorded coordinates:
- **Google embed / link viewport centres are not the place pin.** A Google embed's `!2d/!3d` and the `@lat,lng` of a maps.app.goo.gl link are the map viewport centre, which sits about 120-190 m east of the place marker. The place marker is `!3d..!4d..` in the resolved link, or the place coordinates inside the embed page. This hits cz-004, 015, 016, 017, 021, 022, 025 (and cz-007, cz-002 which are same-as anyway).
- cz-008 and cz-024 pins came from the wrong object on the page (parking lot GPS; operator company geo).
Corrected place-marker pins are given in the defer reasons so the researcher can re-record them; I did not edit candidates.

## Accepted (10)
cz-005 UltraAnt, cz-009 HANGAR Brno, cz-010 HUDY Brno, cz-011 HANGAR Ostrava, cz-012 Tendon Blok, cz-014 Replay boulder, cz-018 Pajkland, cz-019 Flash Wall Olomouc, cz-020 Stěna Lanovka, cz-023 HUDY Ústí.
Caveats:
- cz-009, cz-011: single source, but primary own site; pin is the gym's own printed GPS.
- cz-012: club-run, smart-lock 5-23 h entry, but "Blok pro všechny" page shows public use; name differs (site: Blok Centrum).
- cz-014: pin is the viewport value of its Google link, 20 m from the place marker (fine).
- cz-018: seasonal hours (Jun-Sep Mon-Thu only).
- cz-020: sister gym of cz-021 (1.9 km, own address): kept distinct.

## Same-as (5)
cz-001 -> seed-1450, cz-002 -> seed-1452 (SmíchOFF, 108 m), cz-003 -> seed-1455 (BigWall Praha-Vysočany, 149 m), cz-006 -> seed-1453 (JamJam, 130 m), cz-007 -> seed-1454 (Třináctka).
No location-update follow-ups: cz-007's candidate pin (183 m off) is the Google viewport centre; the link's place marker is 1 m from the existing pin, so the existing pin is right. cz-002/003/006 are within 150 m.

## Rejected (1)
cz-013 Stěna Eliass: closed, its own hours page says operation ended 31 Mar 2026 (re-read today).

## Deferred (9) and what is missing
- cz-004 Boulder V síti, cz-016 Gekon, cz-022 V16, cz-025 Komec: pin is the embed viewport centre; place markers 156, 184, 122, 139 m away (50.0826228,14.4464384; 50.0331018,15.7749599; 49.7475265,13.3683037; 49.169882,16.6234766). Evidence is otherwise good; accept after pins are re-recorded. cz-025 suburb should be Brno-jih/Komárov, not Královo Pole.
- cz-015 Jungle Pardubice, cz-017 MakakAréna, cz-021 Limit Boulder: viewport centre of the goo.gl link; place markers (50.0494163,15.7612287; 50.7265758,15.1485288; 48.9743068,14.5087525) are 184, 154, 188 m away. cz-021 also single-source with no hours visible on its home page.
- cz-008 Lezecké centrum Ruzyně: recorded pin is the "GPS parkoviště" published on the home page; the embedded Mapy firm point (50.0827257, 14.3044473) is 363 m away. Needs a visual check of which is the wall.
- cz-024 Boulder Bar Točna: recorded pin is the operator company's schema.org geo (Pražská 2229/6), about 1.9 km from the bar; the page's own GPS text for Sokolovská 128 reads about 49.4207, 15.5964 (garbled format, needs confirming).

## Owner decisions / open items
- Whether to send the 9 defers back for a pin re-record (7 are quick fixes using the place markers above); most would then be accepts.
- Pins for cz-001/cz-002/cz-003/cz-006: existing seed pins left as is.
- 20 gyms in unlocated.md remain out of scope here (no allowed coordinate source).
