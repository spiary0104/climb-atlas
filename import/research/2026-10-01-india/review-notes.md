# Review notes: 2026-10-01-india (draft by Claude, owner sign-off pending)

Tally: accept 12, same-as 1, defer 3, reject 0 (16 candidates). Validated with tools.js check: OK.

## Same-as
- in-010 Crag Studio Gachibowli = seed-1583 (same name, same Survey No 91 address). Follow-up location-update: seed pin is 1.27 km away on ISB Road; OSM way/559183200 and the site's own map centre agree with each other.

## Defers
- in-004 EQ Hoodi: coordinate unresolved. Only pin is the gym's 4-decimal structured-data geo, no OSM element, and the same site's pins for Indiranagar (about 300 m) and Goa (about 750 m) were wrong. Needs a verified building pin for 415, 10th Cross Rd, Hoodi.
- in-013 Rock Aliens: pin is the site platform's location labelled Laxmi Society (address says Arun Soc 413), street-level only; and the visible page never says bouldering or top rope (only the hidden platform description does). Needs a building pin and a page showing bouldering.
- in-014 GGIM/SMJV school wall: "open for all who wish to learn" only; no public hours, drop-in or day pass; general page with dated content. Needs access terms and current hours.

## Accepted with caveats
- in-003 Climb Central Bengaluru: used the place-labelled embed (12.99614, 77.69535), which is about 20 m from VR Mall POIs in OSM; the older embed (3.4 km east) lands in a Hoodi residential complex. Resolved, not a guess.
- in-005 EQ Indiranagar: OSM node (house no. 546, reverse-geocodes to the gym) kept over the gym's own pin 300 m east.
- in-006 EQ Goa: OSM node kept; it sits next to Splashdown Waterpark, matching the address "behind Splashdown"; the gym's own pin (750 m west) is in Mazal Vaddo.
- in-007 Elevate and in-008 Bangalore Boulder: MyTribe storefronts are gym-run and show exists, bouldering and current offerings (Bangalore Boulder also publishes hours; Elevate gives no hours or address). Accepted as primary social evidence under rule D. Bangalore Boulder pin: OSM building named for the gym; storefront geo is 240 m south on another street; the directory address (15th Cross, 8th Main Rd) does not match OSM's 10th Main Rd and is unsourced.
- in-011 Crag Studio Mettuguda: site is a JS app (I read its bundle data, hours and Boulder Basics plan are there). Bouldering only; rope offer not stated.
- in-012 Fit Rock Arena Chetpet: no street address or hours on the site (JS app); open status rests on the booking page and a Feb 2026 event; Pallikaranai address in directories may be a second or former venue.
- in-016 Boulder 21: accepted under the limited-access rule (free public facility, public hours, on-the-spot registration with ID, first preference to NMMC residents). Treated as indoor (page: bouldering gym, no outside shoes, OSM building).

## Owner decisions / follow-ups
- Confirm acceptance of MyTribe storefronts as primary evidence (in-007, in-008).
- Confirm Boulder 21 category club and that ID-registration access counts as public.
- Bangalore Boulder and Fit Rock addresses are weak (directory-sourced or missing); consider leaving address blank or fixing after import.
- Climb Central Gurugram (in-002) and Bengaluru (in-003) pins are mall-level.


## Coordinator adjustments (Claude, orchestrating the review)
- in-008: accept -> defer. The pin is defensible but the address that would be imported is contradicted by OSM and the gym own storefront; importing a known-conflicting address would resolve it by assumption.
