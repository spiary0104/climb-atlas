# Thailand review notes (2026-10-01-thailand)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending.

## Tally
16 candidates: accept 7 (th-001, th-002, th-003, th-005, th-009, th-013, th-014), same-as 5 (th-004, th-006, th-007, th-011, th-012), defer 4 (th-008, th-010, th-015, th-016), reject 0.

## Same-as (all five with followup location-update)
Each candidate has the same address as the existing gym and a sourced pin that is 0.8 to 4.5 km from the existing pin.
- th-004 -> seed-1752 (Stonegoat S69): pin is the Google place pin from the gym's branch page; existing pin 844 m off.
- th-006 -> seed-1754 (Urban Playground): OSM node/way agree; existing pin 1248 m off.
- th-007 -> seed-1695 (Rock Domain): OSM node has house number 1780 Debaratna Road; existing pin 4516 m off.
- th-011 -> seed-1698 (Progression Vertical): official map pin agrees with OSM way; existing pin 4245 m off.
- th-012 -> seed-1700 (Rebel Rock Climbing): pin is OSM node with the same house number; existing pin 4509 m off. Only OSM supports this pin (the official site has no map link).

## Accepted with caveat
- th-005 Stonegoat The PARQ: accepted as a distinct branch (88 Ratchadaphisek Rd) from seed-1752 / th-004 (S69 branch). Single-source, primary, shows bouldering and hours.
- th-009 Boulder Planet Rangsit: single-source, primary, shows bouldering gym and hours; ropes not claimed.
- th-013 The Bunker: official site shows open daily 9-8 and bouldering; no address and no second pin (OSM node only).
- th-014 UPSIDE: the official site is a client-rendered page (empty static HTML). Content (bouldering, Sat-Thu 09:30-21:00, map link) was read from the site's JS bundle and agrees with OSM way 1472527020 (Sa-Th hours, added 2026-01-30). The site badge says "Grand Opening - September 1st" (no year) and its meta description says daily 09:00-21:00; owner may prefer to defer on the strict rule D reading for JS-only pages.

## Rule D decision: Urban Playground (th-006)
The RQ Club page is the host club's own page for the gym (it names Urban Playground, lists 100+ bouldering problems, hours, address). I treated it as primary and showing bouldering. The old standalone domain is dead. It did not matter for the verdict because the candidate is the same gym as seed-1754.

## Rock Domain province
The official address says Bang Na Tai, Bangkok; OSM (and Nominatim) place the pin in Bang Na Tai district, Bangkok. State BANGKOK stands; the Samut Prakan listings are not borne out by the pin.

## Defers (what is missing)
- th-008 Climb Central Bangkok: official site unreachable (TLS handshake failure, re-tried); Facebook bio shows only an air-conditioned sport climbing facility. No bouldering and no hours from a primary source.
- th-010 Bloc City: Instagram exists but bio not readable; no open status or bouldering from a primary source; no website.
- th-015 Ascentory: Linktree says Khon Kaen bouldering gym with address and map but nothing shows it is open (no hours, no dated activity).
- th-016 No Gravity Indoor Climbing: OSM only (Bing building, 2014), no address, status or bouldering. Existing seed-1697 "No Gravity" (94 Atsadathon Rd, Chang Moi) is 1454 m away; same gym, relocation or separate gym cannot be told.

## Unresolved coordinate issues
None blocking. Pins accepted from official map pins or OSM elements with agreement noted. Weakest: th-012 (OSM only) and th-013 (OSM node only, no address).

## Owner decisions
1. Confirm the five location-update follow-ups (the existing seed pins are 0.8 to 4.5 km off).
2. Confirm th-014 (UPSIDE) given the JS-only site.
3. Decide whether to look for primary evidence for the four deferred gyms (th-008, th-010, th-015, th-016); the unlocated.md list also holds further Thailand leads (for example Gravity Lab, Go Bould, Magnus' Climbing Gym) that have primary bouldering evidence but no usable coordinate source.


## Coordinator adjustments (Claude, orchestrating the review)
- th-014: accept -> defer. Same standard as Bali Boulder (id-007): an undated opening badge is not shown evidence that the gym is open now.
