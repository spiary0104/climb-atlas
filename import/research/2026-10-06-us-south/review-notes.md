# Review notes: USA South (2026-10-06-us-south)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tool check: reconcile ready 54 | review 9 | blocked 6 | existing 0 | invalid 0. Tally: accept 60 | same-as 0 | defer 7 | reject 2.

## Rejects (2)
- nc-ruckus-climbing-gym (Greensboro): the official site now says "PERMANENTLY CLOSED AS OF 9/1/2026" (closed).
- sc-projectrock-easley: official location page says projectROCK Easley has closed (closed).
- The Riveter (Fletcher NC) was found closed too (its domain redirects to a permanent-closure notice) but has no usable pin, so it is only in unlocated.md.

## Defers (7), also in MANUAL-CHECK.md
- fl-rox-orlando: climbing gym inside a performance club; public access not stated.
- fl-cornerstone-rock-gym: bouldering only appears in visitor reviews quoted on its site.
- fl-on-the-edge-melbourne: open, but no bouldering text on its site.
- nc-firsthand-climbing: two sites online (FirstHand and the old Rock Box), 2022 footer, a directory shows Rock Box closed.
- ok-rose-rock-climbing: good evidence, but only a street-level pin (Nominatim has no house number).
- ok-the-silos-climbing: directory-only evidence; operator site pages are 404.
- wv-energy-rock-gym: official site is script-rendered, only its title/description could be read.

## Accepted with caveats
- Triangle Rock Club (5 NC sites, accepted): the per-location pages returned 404, so the evidence is the chain home page (all sites with addresses, "expansive bouldering terrain", October membership sale, per-location account portals). Types are the chain-wide offering (bouldering, top rope, lead); the Salvage Yard site is the most bouldering-heavy one. Fayetteville is the newest site; only the home page and its account portal were available.
- Central Rock Gym Citrus Park and Orlando, Climb Conway: single source plus an official map pin; reasons recorded. Orlando's related-name flag is ROX (a different operator).
- Inner Peaks South End/NoDa, Blocworks Edmond/Midtown: sister sites flagged against each other; separate addresses and pages.
- Sites without a read hours table: Aiguille, Boulder Bloc Gym, Progression Climbing, Coastal Climbing, Boulders and Brews (bouldering shown by the name and crash-pad rentals, not a sentence), Uptown Climbing, Vertical Horizons. "Open" rests on a live operating site (waivers, passes, memberships, events).
- Progression Climbing: plain-HTTP, old-style site; directory hours were not used as evidence.
- Stone Climbing Jacksonville: listed by the operator as the second location; local news in spring 2026 described it as new, so confirm it has opened.
- Cliff Hangers Mooresville: public hours only Thu-Sun (other days members only).
- Climb Bentonville (The Climb Gyms): the chain page shows no bouldering sentence on the location page itself; bouldering comes from the FAQ rules ("Bouldering: climbers must be 13 or older to boulder without direct supervision").
- Outside In (Beckley) and Gripped Fitness are small independents; Outside In shares a building with a mini-golf and ice-cream business and prioritises appointments.

## Coordinates
- 42 pins are the gyms' own OSM elements (reverse geocode of the five least certain ones named the gym); 23 are Nominatim house-number matches; 4 are the official site's own pin (Central Rock Gym Citrus Park and Orlando from the chain's Google Maps link; Climb Conway from its contact-page map; Cornerstone from the coordinates in its page data, which agree with the Nominatim house match).
- OSM pin vs address-geocode cross-check: all but four agree within 125 m (Blocker Boulders 113 m and Boulder Bloc 122 m included). The four others are Aiguille (the geocode is street-level only, 3 km off), Uptown (278 m), Risen Rock (194 m) and BlocHaven (174 m); the OSM pin of each reverse-geocodes to the named gym element (Uptown to its exact house number), so the OSM pin was kept.
- The Las Rocas site's own pin (25.6841, -80.3164) is about 270 m from the Nominatim house match for 9600 S Dixie Hwy; the geocode was used.

## Owner decisions
1. Confirm or drop the 7 deferred gyms (MANUAL-CHECK.md).
2. Pins for the 4 gyms in unlocated.md that are still open (Fort Rock, Stone St. Augustine, Sun Country Rocks, Wilmington Rock Gym).
3. Central Rock Gym Wynwood (Miami) is in OSM and directories but not on the chain's location list; check when it opens.
