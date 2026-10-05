# Coverage: UK holds and gaps, second pass (2026-10-06)

## Result
- 29 candidates, 27 sources. Reconcile (index of 2,385 gyms): ready 5 | review 15 | blocked 4 | already in Bouldeer 5 | invalid 0.
- Decisions (drafted, owner sign-off pending): 18 accept, 7 same-as, 3 defer, 1 reject. Staged batch: 18 records (`import/batches/2026-10-05-uk-holds-gaps`); validate and plan exit 0; read-only `import --dry-run` passed (partial coverage, no credentials).
- The section id carries 2026-10-05 because the CLI stamped the section on creation; the research itself was done on 2026-10-06.

## Method
- Starting list: the owner's brief (five holds, four unplaced, four blocked sites, thirteen unprobed towns). Each gym's own site was re-read on other pages (/prices, /facilities, /about, contact, opening-times) or through its operator's page; a static fetch with a descriptive User-Agent worked on nearly all sites that returned 403 to the first pass.
- Discovery only (never primary): web searches by gym and town, to find the official site, the operator (Lakeland Climbing Centres, Everyone Active, The Climbing Academy, CaVCA, Live For Today) and the right town (Beacon is at Caernarfon not Deiniolen; Indy at Llanfairpwll not Llanberis; Yellow Spider at Carshalton not Banstead; Warrington's gym is The Northwest Face).
- Coordinates: an OSM object for 14 candidates (13 of them real venues placed on the building, plus Northern Problems), the official site's own map marker or place pin (`official-map`) for 11 (Indy, Yellow Spider, Climbing Station, Climb Kent, Dyno, Mad Volume, Rhino, BoulderRyn, Peak, Northwest Face, Arc), and Nominatim postcode centroids for 4 (Live For Today Harrogate at street level; Street Rocks, Adventure Hub and The Ridge at area level, which are blocked). Every pin was compared with the Nominatim postcode centroid; the largest differences are noted in each candidate.
- Overpass was rate-limited partway through, so Street Rocks, Adventure Hub and Live For Today were not searched further for an OSM object.

## Settled
- Accepted (18): AVID Climbing (Ipswich), Keswick Climbing Wall, Sunderland Wall, LancasterWall, Kong Adventure (Keswick), IndiRock (Southend-on-Sea), White Spider (Surbiton), Yellow Spider (Carshalton), Red Spider (Fareham), Green Spider (Hereford), The Climbing Station (Loughborough), Dyno (Buckfastleigh), The Cragg (Stowmarket), Mad Volume (Hull), BoulderRyn (Penryn), The Peak Climbing Wall (Leek), The Northwest Face (Warrington), The Arc (Chippenham).
- Already in Bouldeer, same-as (7): Beacon (seed-951), Blue Spider (seed-866), Climb Kent (seed-933), The Climbing Experience (seed-893, pin correction suggested), Indy (seed-953), Live For Today Harrogate (seed-878, pin correction suggested), Rhino Boulder (seed-885).
- Rejected (1): The Ridge, Marple (closed 25 July 2026).

## Still open (see MANUAL-CHECK.md)
- Northern Problems (Whitehaven): bouldering never stated by the venue's own pages.
- Street Rocks (Scarborough) and The Adventure Hub (Bamford): bouldering stated, building not placed.
- Granite Planet (Penryn): official domain gone; probably closed.

## Notes
- Red and Green Spider were not on the owner's list; they came with the group site. Their rope walls were not checked, so their types are bouldering only.
- Leisure-centre and charity-run walls (The Cragg, Climb Kent) are included because the sites state a bouldering area and public sessions. Climb Kent matched an existing gym, so only The Cragg is new.
- Lancaster Wall, Sunderland Wall, Keswick Climbing Wall and AVID were deferred in the first pass (2026-10-05-uk-single-gym-towns, never staged); they are accepted here only, so nothing is staged twice.
