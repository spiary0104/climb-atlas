# Review notes: USA New York and Boston metros (2026-10-13-us-ny-boston-metros)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tool check: reconcile 0 invalid; tally accept 6 | same-as 0 | defer 2 | reject 0. Scope is a bounding box (-74.9, 40.3, -70.4, 42.7) so the NJ and CT parts of the New York metro can be searched even though the earlier `2026-10-06-us-northeast` section already covers those states; Bouldeer had 64 gyms inside the box before this section (NYC 18, Long Island 3, Westchester/Hudson 7, NJ 15, CT 7, Boston area 18, RI 4), so most chain locations were already in.

## Defers (2)
- la-vida-wenham (La Vida Rock Gym, Gordon College): public Open Gym (Mon-Thu 6-9 pm, day pass, V0-V6) but only a campus-level coordinate and a search snippet saying Open Gym was "temporarily closed".
- everyday-athlete-brooklyn-heights (Everyday Athlete): fitness club with a climbing wall, known only from 2017-2019 news; own site refuses requests, so open status and bouldering for adult day visitors are unverified.

## Accepted with a flag (1)
- goat-hackensack: the other-section candidate of the same gym (deferred in `2026-10-06-us-northeast`, which read only the home page) is listed in `reviewed_against`. This section read the gym's own Bouldering Classes page ("Boulder 201 ... V4 to V6") and pricing page, so the old deferral is resolved here; the old candidate is not staged.

## Judgement calls on accepts
- Weaker accepts: GOAT Hackensack (bouldering proven by classes and day-pass pricing, but no area size stated); MetroRock Tyngsborough (no page carries a 2026 date; open status rests on current hours and prices); Challenge Rocks Hingham (youth-oriented, but a public day pass includes bouldering and adult classes exist).
- Pins: GOAT and MetroRock use the gym's own OSM element; Rocksteady, Challenge Rocks and Boulder Union use the OSM building or address polygon found by Photon/Nominatim for the street address. Gravity Vault Westbury is on the 2nd floor of Samanea New York, so its pin is the mall building (building precision). Rocksteady's Google embed is centred about 800 m from the building, so it was not used.
- Boulder Union (New Bedford) is about 85 km from Boston: outside the "Boston to ~40 km" aim but inside the bounding box and a clean accept.
- Rocksteady Setauket opened in July 2026 (trade press 2026-07-08); its own site has October 2026 uploads and a pricing page.
