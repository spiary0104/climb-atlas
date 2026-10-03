# Review notes: 2026-10-01-malaysia (reviewed 2026-10-03)

Tally (tool): accept 9, same-as 3, defer 2, reject 0. Decisions are Claude's, on the owner's instruction, pending sign-off.
I re-checked read-only: OSM API tags for every candidate element, the Klimbzone embedded My Map KML, the BUMP Pavilion Google short link, Bhub, Bolder Ventures and Klimbzone pages, and OSM surroundings for Jumpa, IKEA Batu Kawan and Putrajaya.

## Accepted (9)
- my-001, my-002, my-003 Camp5 (distinct branches, S1 chain list shows exists/open/bouldering; OSM pins). my-003: researcher's "pin east of mall" doubt checked; OSM node is at the edge of/inside Sungei Wang Plaza (about 90 m south of the building centroid). Accepted on that OSM element.
- my-005 BUMP Pavilion Bukit Jalil: different gym from seed-1693 (8.4 km). Caveat: pin is the gym's own Google short link, which resolves to the mall place pin (mall-level, equals recorded coordinate).
- my-006 Bhub: single source, primary; own Waze pin equals recorded. No hours seen on the home page; open rests on live pricing/booking.
- my-007 Project Rock Gurney, my-009 Project Rock Bayana Hub: S4 official; OSM nodes. my-009: hours only from OSM/locations page.
- my-010 Klimbzone: single source, primary; embedded My Map placemark is named for the gym with the same address and its coordinate equals the recorded pin. Caveat: stale 2022 soft-opening banner on the home page; open rests on 2026 footer and hours.
- my-011 Bolder Ventures: S6 shows address, booking, and top-rope/boulder passes. Caveats: OSM node is tagged tourism=attraction (2018, v1), no hours on site.

## Same-as (3)
- my-004 -> seed-1693 (Bump Bouldering, Jaya One, 48 m); no location update.
- my-008 -> seed-1689 (Project Rock IKEA Batu Kawan, 268 m); followup location-update (existing pin sits west of the building; candidate OSM node is inside the IKEA complex).
- my-014 -> seed-1692 (Putrajaya Challenge Park); followup location-update. Basis: OSM names Taman Cabaran "Challenge Park" and the climbing complex lies inside it; existing pin (863 m away) is among residential blocks. This is an inference from the name translation plus OSM geometry; bouldering/open are still not primary-confirmed. The importer's suggestion was reject not-a-gym (category "other"); I did not use it because it is a public municipal climbing wall.

## Deferred (2)
- my-012 PAMPA Melaka: no readable primary source (Facebook unreadable); directory + OSM only; bouldering unknown; KSB 1 vs KSB 2 address conflict.
- my-013 Sabah Indoor Climbing Centre: no primary source loaded; status and bouldering unknown; semi-outdoor.

## Owner decisions / open items
- Confirm my-014 same-as seed-1692 (and the location updates for seed-1689 and seed-1692).
- Unlocated gyms listed in unlocated.md (Camp5 Utropolis, Paradigm, KL East; MadMonkeyz; Batuu; Rocky Basecamps) still need coordinates; not part of this review.
