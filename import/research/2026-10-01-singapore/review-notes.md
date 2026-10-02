# Review notes: 2026-10-01-singapore

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tool check: OK.

Tally (27): accept 20, defer 5, same-as 1, reject:outdoor-area 1.

## Accepted with a caveat (owner may want to downgrade to defer)
- sg-003 Boulder Movement Rochor, sg-004 Boulder Movement Tai Seng: the S1 chain list is readable (it is server-rendered; the research note that it could not be read was about the old blog post). Downtown (sg-001) and Bugis (sg-002) descriptions explicitly show bouldering (Downtown: "get into bouldering"; Bugis: boulder island, moon board). Rochor (kilter board) and Tai Seng (slab/flat/overhang/cave) do not use the word. Their bouldering rests on the official boulderm.com pricing/membership page ("bouldering gift card ... book a session", pass for all locations). That page is not in the candidates' evidence list. If you want strict per-outlet proof, defer these two.
- sg-009/010/011 BFF Climb: the S4 contact page lists each outlet's Climb Zone and hours but does not say "bouldering". The same site's Boulder Zone page (Climb Zone, Moon Board, spray wall, hours for all three outlets) and adult class page (bouldering class/taster) show it. Those pages are also not in the evidence list. Hours listed for each outlet show them operating.
- sg-005/006 boulder+: the location page shows both gyms, addresses and hours; the word bouldering appears on the site's first-visit page, not the location page.
- sg-014 fit . bloc Telok Ayer (single-source, S5 primary): pin is the Google Maps place link published on the chain site; I resolved it and it matches the recorded coordinates exactly (1.279116, 103.8465144). No OSM element yet.

## Defers
- sg-015, 016, 017, 018 Climb Central (The Kallang, Funan, Novena, SAFRA Choa Chu Kang): bouldering unknown. S6 only says chain-wide "top rope, boulder, lead climb, auto-belays" with no per-outlet detail; the outlet claims come from directories (S16/S18), which cannot be used, and they conflict (Novena). Needs an official per-outlet statement (or a call/visit). Pages /facilityrules and /ccperks on the chain site have no boulder mention.
- sg-021 Outpost Climbing: primary evidence too thin. The home page is client-rendered (no readable text). The only readable page, /bouldering-mechanics-and-rules, is a 2024 competition rules page (bouldering and lead scoring, check-in window 5-18 Aug). It shows bouldering was offered then, but not the current address, open status or boulder walls. Needs a readable official page.

## Other decisions
- sg-020 Ground Up: same-as seed-1731 (same name/address, identical coordinates, 0 m). No location-update.
- sg-027 Ark Bloc: rejected as outdoor-area. S15 calls itself "Singapore's largest outdoor gym" (calisthenics, strongman, a bouldering section); importer blocker was category other (not-a-gym). Either code leads to reject; outdoor-area fits the site's own wording.
- Chain siblings (Boulder Movement x4, boulder+ x2, Boulder Planet x2, BFF x3, fit . bloc x3) all have distinct addresses. Boulder Movement Tai Seng and Boulder Planet Tai Seng are different brands 289 m apart (different addresses). BFF Tampines Hub and Yoha are 1144 m apart in different buildings.

## Coordinates
- No weak/coarse-coordinate flags and no pin disagreements in notes. All pins are OSM nodes (building precision) except sg-014 (see above). I did not independently check OSM node positions.

## Region codes (not edited; judgement, unverified against an official CDC map)
- The five codes used (CENTRAL, NORTH_EAST, NORTH_WEST, SOUTH_EAST, SOUTH_WEST) look like the community development councils. Plausible: sg-005, 006, 007, 012, 022, 027. Less certain: sg-008 (MacPherson Rd, NORTH_EAST), sg-013 (Depot Rd, Bukit Merah, SOUTH_WEST; it may belong to CENTRAL), sg-024 (Bukit Timah, CENTRAL), sg-004 (Tai Seng, NORTH_EAST). Not verified; owner may want a quick check.

## Owner decisions / follow-ups
- Confirm the accept-with-caveat items above (Boulder Movement Rochor/Tai Seng, BFF x3).
- sg-011: research says the same unit was the former b8a gym (company struck off). The importer flagged no existing b8a entry; if one exists on Bouldeer it is a stale duplicate to retire.
- Climb Central and Outpost need new primary evidence before they can be accepted.
