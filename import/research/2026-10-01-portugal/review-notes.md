# Review notes: 2026-10-01-portugal

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Reviewed 2026-10-03. Validated: `OK | {"accept":8,"same-as":6,"defer":17}` (31 candidates, no rejects).

## Accepted (8)
- pt-001 Climb UP: pin is an OSM node tied by name and proximity only (gym publishes no pin).
- pt-003 Vertigo Marvila: accepted as distinct from seed-1265 (see owner decision 1). OSM says Fracao S, own site says Fracao P (same building).
- pt-005 CRUX, pt-010 Ericeira Boulder, pt-012 IN WALL: pins are the gyms' own published pins.
- pt-006 Altissimo Lisboa: own marker used; OSM node is ~100 m away (at the old directory pin).
- pt-015 Proa: Google embed names the place, centre equals pin, OSM node 5 m away.
- pt-027 Madeira Climbing Center: own short-link place pin, OSM way agrees within ~10 m; own structured data and generic embed are 0.5-1 km off and were not used.

## Same-as (6)
- pt-002 -> seed-1263 (+ location-update: existing pin 709 m off; candidate pin is own embed + OSM).
- pt-004 -> seed-1265 (Vertigo Oriente; pin gap 123 m, no follow-up).
- pt-008 -> seed-1264 (same address, 41 m).
- pt-014 -> seed-1267 (8 m).
- pt-016 -> seed-1269 (+ location-update: seed-1269 sits on the same coordinates as seed-1268 Sao Rock, 4,419 m from the real North Wall site).
- pt-017 -> seed-1268 (0 m, same address).

## Deferred (17) and why
- Directory pin (rule G): pt-011 (otherwise acceptable: own site shows exists/open/bouldering), pt-019, pt-021, pt-022, pt-023, pt-031.
- No primary bouldering/status evidence: pt-007 (own site never says boulder), pt-009 (site HTTP 522), pt-013 (hotel, guest rates), pt-018, pt-020 (climbing page 404, may be closed), pt-029, pt-030.
- Club/public access or bouldering unproven: pt-019, pt-021, pt-022 (day passes shown but bouldering not named), pt-023, pt-029.
- Coordinate: pt-024 Bloco (4-decimal street-level own pin, 446 m from directory pin, address and postcode disagree with directory, no OSM element, no hours on site).
- pt-026 Escalava: public access and bouldering are shown (own post, Sept 2025, Monday 18h-21h open to all), but the homepage still says the wall "will become" (conflicting open status). Re-checked both pages by curl on 2026-10-03; same text.
- pt-025 Penha Garcia, pt-028 Agua de Pena: category other, no primary page (see owner decision 2).

## Unresolved evidence / coordinates
- pt-028: OSM node/2905237279 is unnamed, tied only by an info link to opencrags, 315 m from the directory pin.
- pt-024: see above. pt-011 needs an OSM element or published pin to become acceptable.

## Owner decisions
1. seed-1265 "Vertigo - Lisboa" has a street-only address (Avenida Infante Dom Henrique, which both Vertigo centres are on). Its pin is 123 m from Oriente and 2.4 km from Marvila, so I treated it as the Oriente entry (pt-004 same-as, pt-003 accepted). If you think it was meant for Marvila, change pt-003 to same-as and pt-004 to accept.
2. Rule H would let category-other facilities (pt-025 Penha Garcia municipal wall, pt-028 park wall, pt-031) be rejected `not-a-gym`. I deferred instead because their nature (indoor/outdoor, public access) is unverified rather than known to be non-gyms. Say if you want them rejected.
3. Corrections for existing seed records: seed-1263 (Escala 25) and seed-1269 (The North Wall) need pin updates (follow-up location-update).
