# Review notes: USA Chicago, Denver/Front Range and Texas metros (2026-10-13-us-central-metros)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tally: accept 6 | same-as 2 | defer 3 | reject 0.

## Accepted (6)
- us-il-001 First Ascent West Loop (100 S Morgan St, Chicago): the former Brooklyn Boulders Chicago, run by First Ascent (Devil's Lake guide: "operated by First Ascent as of February 2026"). faclimbing.com blocks the research machine's country (403), so the page was read through its 2026 Wayback captures (28 Sep 2026 location page: address, hours, "roped climbing and bouldering", "100 unique boulders"; 23 Aug 2026 Chicago page: "First Ascent West Loop is now open"). Pin is the OSM building way tagged First Ascent at that address.
- us-tx-001 Momentum Memorial (10516 Katy Fwy, Houston): "NOW OPEN", 2026, 36,000 sq ft bouldering gym, adult day pass $29, dated 2026 holiday hours. Pin from the gym's own embedded Google map (OSM node added 2026-08-02 is 53 m away).
- us-tx-002 The Blok Climbing Co (5252 W Vickery Blvd, Fort Worth): family-owned bouldering gym, walk-ins 10am-8pm, Bouldering 101 first-visit class; a 10 Jul 2026 Wayback capture shows summer camps. Pin is the OSM building way with that address.
- us-tx-003 Crux Climbing Center Houston (3100 Canal St, The Plant): "HOUSTON! WE ARE OPEN!", opened Sept 2026, grand opening 10 Oct 2026 (CultureMap). The 25 Jun 2026 capture of the Crux home page still said "coming soon". Day pass price not read. Pin is the OSM building way carrying the address (Nominatim; Photon did not return it).
- us-tx-004 MoCo Bouldering (2004 N Frazier St, Conroe): site (copyright 2026) with hours, $20 day pass, 80+ boulder problems; CBJ reports the 19 Jul 2025 opening. Conroe is ~40 miles north of Houston; accepted because the section scope is the state of Texas and the gym is part of the Houston market. Pin is the OSM building way with that address.
- us-tx-005 Crux Climbing Center South Austin (220 Ralph Ablanedo Dr): opened 4 May 2026 (CBJ, 17 Jun 2026), replacing the original Pickle Road gym. **Weaker accept:** Crux's own South Austin page gives the address and hours (and an 8 Aug 2026 capture shows "Adjusted hours 8/8"), but its wording on bouldering is chain-level only; the gym-specific boulder facts (22,000 sq ft of walls, boulders, competition bouldering wall) come from the CBJ profile. Flagged review: related name 6.4 km from seed-141 (the closed Pickle Road gym); reviewed_against lists it. Pin: OSM building way at the address (OSM postcode 78715, the site prints 78748).

## Same-as (2, both with follow-up)
- us-co-s01 Movement Centennial = seed-94: Movement's own map data (9657 E County Line Rd) is 156 m from the Bouldeer pin -> location-update follow-up.
- us-tx-s01 Movement Plano = seed-157: Movement's own map data (525 Talbert Dr) is 155 m from the Bouldeer pin -> location-update follow-up.

## Follow-ups outside this batch
- **Retire seed-141 "Crux Climbing Center" (Pickle Road, Austin):** closed about 18 months before 4 May 2026 (CBJ, "Crux Returns to South Austin"); the gym is now us-tx-005. Alternative: update seed-141 in place to the new site if the owner prefers to keep the id.
- Location updates for seed-94 and seed-157 as above.
- No other existing gym looked wrong: 33 existing IL/CO/TX gyms were compared with OSM elements (Overpass sport=climbing) and Movement's own coordinates; the rest are within 110 m, or the OSM element is stale (the "Summit Climbing & Yoga" Grapevine way is 1.8 km from Movement Grapevine, which sits at its own-map address 3105 William D Tate Ave; the old Summit Fort Worth way is 6 m from Movement Fort Worth).

## Defers (3; see MANUAL-CHECK.md)
- us-co-d01 Denver Bouldering Club (Central): last live capture 21 May 2026, the domain now serves "Website Expired".
- us-co-d02 The Campus Climbing and Training (Boulder): open with a $22 day pass, but never says bouldering.
- us-tx-d01 Lake Travis Bouldering (Bee Cave): its own site still says "Coming Soon".

## Excluded without a candidate (no pin, members-only or not a bouldering day gym)
- The Lab Climbing (Boulder): "No day passes ... Members only".
- Dino Moves (Nederland): membership-only bouldering ($55/month, 24/7 key access, no day pass on the site).
- Beast Fingers (Lakewood): hangboard training institute. Mountain Strong (Denver/Thornton): functional fitness, last capture July 2025.
- ABC Climbing Academy (Naperville) and ClimbZone Chicago: kids facilities.
- Hapik (Dallas Firewheel and others): auto-belay fun climbing.
- Sheer-Fun Climbing Gym (Marble Falls): bouldering gym, but non-members are "by appointment only" and no building pin (Nominatim gives the street) -> MANUAL-CHECK.
