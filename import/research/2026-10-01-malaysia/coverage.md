# Coverage: Malaysia (2026-10-01-malaysia)

## Result
- 14 candidates written (11 with bouldering "yes" or a confirmed own-site listing, 3 with bouldering "unknown"), 14 gyms in unlocated.md (7 with primary bouldering evidence, 7 directory-level).
- Candidates by area: Petaling Jaya / Subang Jaya (Camp5 1Utama, BUMP Jaya One, Bhub, Bolder Ventures), Kuala Lumpur (Camp5 Eco City, Camp5 Jumpa, BUMP Pavilion Bukit Jalil), Penang (Project Rock Gurney, IKEA Batu Kawan, Bayana Hub), Kuching (Klimbzone), Melaka (PAMPA), Kota Kinabalu (Sabah Indoor Climbing Centre), Putrajaya (municipal climbing complex).
- The three "unknown" candidates (PAMPA, Sabah Indoor Climbing Centre, Putrajaya complex) have an empty types list as the brief says. The check.js repo (bouldeer-wave2) is older than the research branch and reports them INVALID (types must be non-empty); the current repo's research.js tolerates this for unknown/no.

## Main sources
Camp5 official site (chain list, 6 location pages, all six confirmed open and with bouldering), BUMP, Bhub, Project Rock (location pages plus locations page), Klimbzone, Bolder Ventures, MadMonkeyz, Batuu and Rocky Basecamp own sites; the OSM Overpass extract (MY.json); directories (Lydia Scapes, The Amateur Climber, Brocnbells) for leads only.

## Coordinates
- OSM extract: Camp5 1Utama, Eco City and Jumpa, BUMP Jaya One, the three Project Rock branches, PAMPA, Sabah Indoor Climbing Centre, Putrajaya complex.
- One OSM node (Bolder Ventures, node/5568194821) was found through a single OSM API call after a directory pointed to it; it is not in the extract. A few small OSM API bounding-box checks around known malls found no other gym nodes. No Overpass or Nominatim queries were made.
- Official maps: Bhub (Waze link on its site), BUMP Pavilion Bukit Jalil (Google short link on its page, resolves to the mall pin), Klimbzone (placemark in its embedded Google My Map).
- Precision is mall or building level for all of them. Camp5 Jumpa's OSM pin looks slightly off the mall; flagged in notes.

## Probably missing
- Seven unlocated gyms with primary evidence (Camp5 Utropolis, Paradigm, KL East; MadMonkeyz; Batuu; both Rocky Basecamps) just need coordinates.
- Directory-only gyms (Boulder Story, HangOut x2, Rockworld, Petit, Altidude, Top Climb Miri) need a primary page or social post confirmed; most only have Facebook or Instagram.
- Rockworld may have a second outlet in Kulai; Rocky Basecamp's bouldering share is unclear.
- East Peninsula and north (Kuantan, Terengganu, Kedah, Perak/Ipoh, Negeri Sembilan, Kelantan) and Labuan: searches found no indoor bouldering gym. Ipoh's Gunung Lang park reportedly has a public wall with a bouldering section (unverified, not listed). OSM also shows a multi-sport youth complex in Seremban (way/303051166) and an LFKL school hall with climbing; neither was verified and both were left out.
- Malay-language searches returned mostly generic or Indonesian results; no extra gyms came from them.

## Access problems
- Facebook and Instagram pages could not be read, so several gyms have no primary bouldering evidence.
- Boulder Story's site renders by script and showed no content; Sabah Indoor Climbing Centre's website (ropeskills domain) reset the connection; the Putrajaya corporation page returned 404; Hangout and Altidude have no own site that loaded. The rockybasecamp.com domain is an unrelated squatted blog (the real site is rockybasecamp.com.my).
- Web search quota worked in this session, but results are US-biased.
