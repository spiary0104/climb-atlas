# Review notes: 2026-09-30-new-zealand

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Reviewed 2026-10-03. Pages re-read read-only from each candidate's own cited URLs.

## Tally (18)
accept 8 | same-as 7 | defer 2 | reject (closed) 1

- accept: nz-005, 006, 007, 008, 009, 010, 015, 017
- same-as: nz-001 (seed-477), 002 (seed-478, location-update), 003 (seed-479), 004 (seed-480), 012 (seed-481), 013 (seed-485), 014 (seed-484)
- defer: nz-011, nz-016
- reject closed: nz-018

## Accepted with caveats
- nz-005 Boulder Co. Hamilton: single source, but the chain's own location page shows address, hours and bouldering; pin = page structured data (re-checked).
- nz-006 Extreme Edge Hamilton: pin is a Google embed centre; embed names "90 Greenwood St, Frankton, Hamilton 3204" and centre equals the recorded pin.
- nz-007 Turangi: pin is the map-plugin marker on the contact page; limited weekday hours (closed Tue/Thu/Fri in term time).
- nz-008 Taupo: council-run, public facility, typed commercial-gym; bouldering is only a low section at the base of a 12 m rope wall (weak offer, owner may judge).
- nz-009 Rocktopia: pin is a Google embed centre that names "Rocktopia"; I could not independently geocode 9 Triton Avenue against it. Site writes postcode 3116, candidate 3118. Former name The Rock House.
- nz-010 YMCA Taranaki: public sessions Thu-Sun only, day passes shown; typed commercial-gym.
- nz-015 Kind Foundation / former Roxx: casual entry and a separate bouldering price shown; typed commercial-gym. Place link pin.
- nz-017 Gravity Well: single source (own site); pin is the business-location coordinates in the site's Wix data. Separate from closed Vertical Limits.

## Defers
- nz-011 Massey University wall: only the club page; wall is for Massey University Alpine Club members ($40/year); no guest, day pass or public hours shown. Pin is the recreation centre, not the wall. Needs public-access evidence.
- nz-016 Resistance Climbing (Dunedin): coordinate unresolved. Own site map has a marker at the old Moray Place site (-45.875429,170.5019283) and a map centre at the new 56 Parry Street West address (-45.8704261,170.5228189); the recorded pin is the map centre (street precision), not the marker and not an OSM element. Gym, bouldering, open and the move are otherwise shown on its own site. Needs an OSM element or a pin confirmed at the new address.

## Same-as / location notes
- nz-002 Northern Rocks: seed-478 is the same gym; seed pin is 1548 m off; the gym's own site map centre (-36.7758619,174.7329933) is ~45 m from the candidate pin, so followup location-update is recorded.
- nz-001 (290 m) and nz-004 (275 m): same gyms; candidate pins are the chain's structured-data coordinates and a Google embed centre; not clearly better than the seed pins, so no location-update recorded (owner may choose to). nz-004 address on the gym site is 32 Morrin Road, seed has 40 Morrin Road. The Extreme Edge site returned HTTP 500 on every fetch although its content rendered.
- nz-014 Uprising: seed-484 is the same address (199 Ferry Rd) and pin, same gym.

## Reject
- nz-018 Vertical Limits: its home page says it is closed for good.

## Owner decisions
- Whether the council/YMCA/Kind walls (nz-008, 010, 015) stay typed commercial-gym.
- Whether to accept nz-008's minor bouldering section.
- Whether to run location updates for nz-001 and nz-004.
- nz-011 and nz-016: obtain the missing evidence or leave deferred.
- Not in this batch: nine unlocated NZ gyms listed in unlocated.md.
