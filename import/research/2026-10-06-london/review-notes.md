# Review notes: UK Greater London coverage gap (2026-10-06-london)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tally: accept 18 | same-as 0 | defer 3 | reject 0. No candidate was flagged by reconcile (ready 18, blocked 3), so no accept needed `reviewed_against`.

## Accepted (18)
- Chains with their own location pages (primary source = chain/operator site): Climbing District (3), London Climbing Centres (3 new of 8), City Bouldering group (4), The Font (3), Substation Brixton, Westway (operator Everyone Active page).
- Independents with their own sites: Rise Climbing, The Reach, BlocFit Brixton.
- Every pin is the gym's own OSM element (name and address agree with the official site), found through the Photon geocoder over OSM data and checked against the OSM API where tags were needed (website, address, hours). Precision is `building` throughout.

## Things the owner may want to know
- **Climbing District = the former Arch and Stronghold.** archclimbingwall.com and thestrongholduk.com now redirect to climbingdistrict.uk. Aliases "Arch Building One" and "Stronghold Tottenham Hale" are recorded. The chain's FAQ still says "all four London sites" and the menu still lists Surrey Quays (its page is a 404), so Surrey Quays is treated as gone and Arch North / Arch Acton are deferred (MANUAL-CHECK).
- **City Bouldering Stratford (cb-stratford):** the page still carries an old "pre-launch event" blurb. Accepted because hours, bouldering drop-in booking and an "Autumn League social on Wednesday 14th" (14 Oct 2026) are live. Owner may veto if they know it is not open.
- **Climbing Co Fulham** is run by the City Bouldering group and listed on its site under "Our Central London Bouldering Locations"; chain recorded as "City Bouldering". Its own page shows problems of all styles and weekly resets rather than the word "bouldering", so the bouldering evidence is the chain list plus that text.
- **City Bouldering White City:** the chain site prints W12 7GF in one place and W12 7HB in the footer; OSM has W12 7RY. Pin = OSM node beside Westfield. No coordinate concern.
- **The Font Wandsworth** moved: OSM still has an old element on Lydden Road (SW18 4LR, way 757708322). The official site lists the new 25,000 sq ft site at 52-58 Garratt Lane; that is the one accepted. The Lydden Road site was not added.
- **The Font Borough:** official address Triptych Place (SE1 9BL), OSM node says 185 Park Street (same postcode, about 15 m from the official map pin); the official address is stored.
- **Westway Climbing Centre:** operator page (Everyone Active) is the primary source; the gym is a wing of Westway Sports & Fitness Centre and the pin is the whole building. It is a large rope-and-boulder centre (150 boulder problems), so it counts as a bouldering gym, not a leisure-centre wall.
- **The Reach:** types include lead-climbing because the page names a "Lead Roof".
- Types `top-rope` were added only where the official page shows it (White City auto-belays, Wandsworth, Westway, The Reach).
- Tottenham Hale: the street (Fountayne Road) is from OSM only; the official page gives "The Old Archives, N15 4BE".

## Defers (3, all in MANUAL-CHECK.md)
- hackney-wick-boulder-project: directory only; gym site unreachable.
- arch-north-burnt-oak, arch-acton: OSM only; not on the current Climbing District list.

## Not candidates (no readable evidence of a bouldering offer)
Hendon Leisure Centre (page says climbing, no bouldering), Westminster Lodge St Albans (rope only), Rock Up (harness walls and soft play), Clip 'n Climb, Third Space rope walls, school/university/youth-club walls. See coverage.md.
