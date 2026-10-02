# Review notes: 2026-10-01-israel (Claude, on the owner's instruction; owner sign-off pending)

Tally: 12 candidates | accept 9 | same-as 3 (all with location-update) | defer 0 | reject 0.

## Same-as (existing seed gyms)
- il-002 Performance Rock Beer Sheva = seed-1590 (same address HaAtzmaut 4). Seed pin is 872 m off and equals the centre of the HaAtzmaut street way (OSM way/785859037), so it is a street-level geocode; branch's own Waze pin is better.
- il-009 Monkeys Netanya = seed-1596 (Nitsba Poleg complex). Seed pin 391 m off; Google place pin and OSM node/6745840987 agree within 32 m.
- il-012 Venga = seed-1597 (importer probable duplicate). Same name, same city, seed has no address and a pin 2.3 km off; site's Google pin and Waze link agree within 14 m. Decided same gym, not distinct.

## Accepted with caveat
- il-001 Performance Rock Tel Aviv: current address Begin 144 (Midtown) from the chain's own branch page; the federation's Rival 3 is the old address and was not used. Pin is OSM node/12079572871 (no address tag), 84 m from the site's Waze pin; accepted (under 150 m).
- il-004 VKING: two published pins 549 m apart. Waze pin (recorded) is 8 m from the OSM address node for HaShlosha 3; the Google link pin does not match the address. Waze pin kept.
- il-005 The Bloc Tel Aviv: OSM node/11035324444 carries addr HaMeretz 4, climbing:boulder=yes (better match than the research note said). The cited English page lacks the word boulder; the Hebrew page of the same site says it is a network of boulder walls. Site says 3 gyms but lists 2 addresses; third room unconfirmed (not part of this record).
- il-006 The Bloc Jerusalem: OSM node/8614506641 has no address; checked via Nominatim that the Eliashar/Elishar street ways are about 50-60 m away and reverse geocoding the node returns The Block on that street. Owner may glance at the map.
- il-008 Urban Climbing Jerusalem: branch page gives Beit HaDfus 11; home page also lists Yosef Weitz Drive 1. Single source but primary and complete.
- il-010 iClimb Rishon: hours section on the site is headed August, so current-season hours are unconfirmed; site is live and OSM node created July 2026 (newly opened).
- il-011 Roca: club on a kibbutz but public hours, shop, family/kids classes and open invitation on its own site; treated as public access. Pin is the published business coordinates.

## Defers
None.

## Owner decisions / loose ends
- Not reviewed here (in unlocated.md): 17 Israeli gyms without coordinates; Koala (Kfar Etzion, West Bank) needs an owner call on scope.
- The Bloc's possible third gym and Monkeys Ashdod remain unconfirmed.
- Venga same-as is a judgement from name and city (no address on the seed record); if the owner knows of a second Venga, reverse it.

## Owner-directed follow-up (2026-10-01)
- Koala (Kfar Etzion; unlocated.md entry, not a candidate, so no decision exists): project scope rule = each gym carries the ISO 3166-1 alpha-2 country code of where it is, validated against js/modules/regions.js (the same coding as the World Bank data in the gap analysis). OSM boundaries (Nominatim, 2026-10-01) code Kfar Etzion as "ps"; all 8 existing Bouldeer IL gyms code as "il". ISO 3166-1 also places this location under PS. So Koala is out of scope for the IL section; PS is not an app-supported country. It can only be added via a future PS section after app support for PS. No political judgement involved: the same code mapping is applied to every location.
