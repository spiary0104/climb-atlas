# Review notes: UK regional cities (2026-10-13-uk-cities)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tally: accept 21 | same-as 1 | reject 2 | defer 6. Reconcile (index of 3,294 gyms): ready 15 | review 8 | blocked 6 | already in Bouldeer 1 | invalid 0. The 8 flagged accepts each carry `reviewed_against`; none is a duplicate.

## Accepted (21)
- Chains / groups with their own location pages: Awesome Walls Stockport and Stoke, The Climbing Hangar Bristol, Flashpoint Cardiff and Flashpoint Bristol - Easton (ex-Bloc Climbing), Rock Over Bolton and Sharston, Redpoint Birmingham and Redpoint Worcester, Boulders Cardiff, KendalWall (Lakeland Climbing Centres).
- Independents with their own sites: Boulder Brighton, Gallery Bouldering (Oxford), 270 Climbing Park (Gloucester), Birmingham Bouldering Centre, The Climbing Unit and Alter Rock (Derby), Summit Up (Oldham), Friction Bouldering (Gateshead), Boathouse Climbing Centre (Llandudno), The Boulder Barn (Hereford).
- Every pin is the gym's own OSM element (name/address/website agree with the official site); all 30 candidates’ pins are within 185 m of the postcode centroid (postcodes.io, cross-check only; largest: Redpoint Worcester 182 m, Awesome Walls Stoke 171 m). Precision `building` throughout. Boulder Brighton's own embedded map point (50.835381, -0.211403) is 25 m from the OSM node.
- `types` adds top-rope / lead-climbing only where the gym's own page names them.

## Things the owner may want to know
- **Weaker open-evidence (live hours/booking/prices but no dated 2026 item on the pages read):** Redpoint Birmingham, Alter Rock, Friction Bouldering. Boulder Barn and Birmingham Bouldering Centre have a dated feed post / OSM survey; the rest have 2026 events or prices. Owner may veto these three.
- **Awesome Walls Stockport/Stoke** are 2026-updated chain pages; the chain's homepage no longer lists Belfast (Awesome Walls Belfast is gone; Boulder World Belfast is the Belfast bouldering gym).
- **Flashpoint Bristol - Easton** is the old Bloc Climbing (OSM still names it so). The existing Flashpoint Bristol (seed-870) is the Temple Meads centre.
- **Rock Over Sharston:** the OSM way "Rock Over Climbing" carries no address; accepted because it is 94 m from the M22 4RW centroid in the Sharston industrial estate, where the chain's page puts the centre. The existing "Rock Over Climbing" (seed-915) is the Cheviot Street (Central) centre.
- **The Climbing Hangar** now has nine locations on its site; Bristol (BS1) was the only one missing.
- **Gallery Bouldering:** homepage `<title>` still says "coming to Oxford"; the page body shows it open daily with 2026 calendar entries.
- **Summit Up (Oldham):** charity-funded (Stoller Charitable Trust, per press) stand-alone centre, so kept as commercial-gym; the owner may prefer a different category.
- **KendalWall** and **Redpoint Birmingham** pages return 403 to scripts; read through a page reader / headless browser.

## same-as with follow-up (1)
- boulder-world-belfast -> seed-958 (`followup: location-update`): existing pin is about 440 m from the building (gym's own Google place link and OSM both at 54.5794, -5.9629).

## Rejects (2)
- parthian-manchester: closed (OSM disused=yes, no longer on the Parthian/Font group list). Not in Bouldeer, no retire needed.
- rainbow-rocket-central-cambridge: closing 15 Nov 2026 (operator notice dated 9 Sep 2026). Not added; Rainbow Rocket North (seed-927) stays.

## Defers (6, all in MANUAL-CHECK.md)
last-sun-dance-leeds, boatyard-boulders-nottingham, social-climbing-leicester, quay-climbing-centre-exeter, barn-climbing-wall-tavistock, climb-rochdale.

## Follow-ups for other batches
- Location update: seed-958 Boulder World Belfast (to about 54.57939, -5.96303).
- No existing Bouldeer gym was found closed, so no retire follow-up.
