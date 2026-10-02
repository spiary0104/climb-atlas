# Wave 2 — owner sign-off sheet

Generated 2026-10-02 from the committed review files (never hand-edited). Index 2306 gyms (equals production). **Nothing is staged or imported yet.**

All six sections were reviewed by Claude on your instruction (`reviewer` = "Claude (AI) on the owner's instruction; owner sign-off pending"). Staging checks the rules again, but the judgement calls are yours: read sections 2 and 3, skim 4–6, then sign off (section 7).

## 1. Summary

| Country | Section | Candidates | Accept (will be added) | Same as an existing gym | Defer | Reject |
|---|---|---:|---:|---:|---:|---:|
| New Zealand | `2026-09-30-new-zealand` | 18 | 8 | 7 | 2 | 1 |
| Croatia | `2026-10-01-croatia` | 11 | 1 | 5 | 5 | 0 |
| Czechia | `2026-10-01-czechia` | 25 | 10 | 5 | 9 | 1 |
| Iran | `2026-10-01-iran` | 5 | 2 | 0 | 3 | 0 |
| Malaysia | `2026-10-01-malaysia` | 14 | 9 | 3 | 2 | 0 |
| Portugal | `2026-10-01-portugal` | 31 | 8 | 6 | 17 | 0 |
| **Total** | | **104** | **38** | **26** | **38** | **2** |

Dry run (2026-10-03, index 2,306 = production): all 38 accepted gyms stage and plan as **new**, 0 conflicts, 0 blockers.

## 2. Judgement calls to confirm

- **Portugal — Vertigo:** the existing `seed-1265` "Vertigo - Lisboa" (street-only address) was read as the **Oriente** centre (its pin is 123 m from Oriente, 2.4 km from Marvila): pt-004 Oriente = same-as, pt-003 Marvila = accept as a new gym. If you know seed-1265 is Marvila, swap the two.
- **Portugal — directory pins:** pt-011 The West Climbing Center would be acceptable (own site shows exists/open/bouldering) but is **deferred only because its pin is still the directory's**; same for pt-019, 021, 022, 023, 031.
- **Portugal — category 'other':** pt-025 Penha Garcia, pt-028 Água de Pena, pt-031 were **deferred, not rejected** as not-a-gym (nature and public access unverified). Say if you prefer reject.
- **Portugal — Escalava (pt-026):** deferred; public access and bouldering are shown but its homepage still says the wall "will become" a gym.
- **Czechia — 7 pins off by 120–190 m:** cz-004, 015, 016, 017, 021, 022, 025 are deferred only because the recorded pin is a Google viewport/embed centre, not the place marker. The correct place-marker coordinates are written in each defer reason, so a quick re-record would turn them into accepts (a later small pass, not done here).
- **Czechia — Eliass (cz-013):** rejected as closed (its own hours page: operation ended 31 Mar 2026).
- **New Zealand — Taupo (nz-008):** accepted although its bouldering is only a low section at the base of a council-run 12 m rope wall. Say if you'd rather defer it.
- **New Zealand — Vertical Limits (nz-018):** rejected as closed (home page says it closed for good). Resistance Dunedin (nz-016) deferred: moved, and its own marker still shows the old site.
- **Malaysia — Putrajaya (my-014):** same-as `seed-1692` Putrajaya Challenge Park **by inference** (the climbing complex is inside Taman Cabaran / Challenge Park; existing pin 863 m away among flats), with a pin fix. The importer suggested reject not-a-gym. Confirm, or make it defer.
- **Croatia — shared pins:** `seed-1479`, `seed-1480` and `seed-1481` sit on the same coordinate, so two are wrong; hr-002 Boulder Zona and hr-003 Fothia carry pin fixes (hr-002's new pin needs a re-check before it is applied).
- **Iran — MZ Sport Club (ir-004):** deferred; its own site describes bouldering classes but no wall or drop-in. Your call.

### Accepted although reconcile flagged them (16) — each has a written reason

Most flags are routine: **same-website** and **related-name-nearby** mean chain branches sharing one website or brand (each branch was checked as a separate site); **single-source** means one primary source (the gym's own site) confirmed it; **limited-access** marks club or members-first walls that still offer public entry. The few real duplicate questions (name-match, alias-match, importer-probable-duplicate) were each compared with the named Bouldeer gym and judged distinct; the importer's probable duplicate becomes the one automatic "distinct" decision.

| Country | Candidate | Flags | Reason |
|---|---|---|---|
| New Zealand | nz-005 Boulder Co. Hamilton (Te Rapa, Hamilton) | single-source | Single source but primary: BC chain location page for Hamilton shows the gym, address 15 Maxwell Place, weekday opening hours (06:00-22:00) and bouldering. Pin is the GeoCoordinates in the page structured data (re-check… |
| New Zealand | nz-015 The Adventure Centre Climbing Wall (The Kind Foundation, formerly YMCA Roxx) (Sydenham, Christchurch) | single-source | KIND own site (single source, primary): casual entry prices with a separate bouldering price, open 7 days, dedicated bouldering area, address 239 Waltham Road. Public access shown (casual entry); former YMCA Roxx, now r… |
| New Zealand | nz-017 The Gravity Well (Nelson) | single-source | GW own site (single source, primary) says "a bouldering gym" in Nelson, lists opening hours and gives 37 Wakatu Lane; routesetting three times a week. Pin is the business location coordinates in the site data (-41.27203… |
| Croatia | hr-004 BoldeRi (Matulji) | single-source | Single source but primary and sufficient (rule E): S BOLDERI own site (bolderi.hr, re-read 2026-10-03) shows a boulder hall with bouldering courses, a pricing page with day passes and memberships for the general public,… |
| Czechia | cz-009 HANGAR Brno (Brno) | single-source | S HNGB own site shows a boulder-only centre (1400 m2), address, weekly hours and live occupancy. Single source, but it is the primary own site and shows exists, open and bouldering. Pin is the gym own GPS (49°10'01.1"N … |
| Czechia | cz-011 HANGAR Ostrava (Ostrava - Poruba) | single-source | S HNGO own site shows the boulder-focused centre, address and opening hours. Single source, but primary and shows exists, open and bouldering. Pin is the gym own GPS (49.8199833N, 18.1790658E) printed next to the Nad Po… |
| Czechia | cz-020 Stěna Lanovka (České Budějovice) | related-name-nearby | S LANO own site shows a rope wall with a first-floor boulder section, address Lannova 2 and hours; the Google place link on its contact page gives 48.974243, 14.4796435, identical to the recorded pin. Distinct from Limi… |
| Iran | ir-001 Boulderland Climbing Gym (Tehran (Saadatabad)) | related-name-nearby, related-name-nearby, related-name-nearby | S1 own site (re-read 2026-10-03) shows bouldering programme and boulder walls (Moon Board, spray wall), an 18 m lead wall, daily hours 9:00-23:00, a paid day-entry ticket (public access) and the Saadatabad, Daoud Rashid… |
| Iran | ir-003 Moj Climbing Gym (Tehran (Farmaniyeh)) | related-name-nearby, related-name-nearby, related-name-nearby, single-source | Single source, but S3 is the gym's own page (re-read 2026-10-03): it names a boulder wall with standard mats, campus board and hang board, gives the address (No. 18, Azimi Alley, W Farmaniyeh), a phone and structured op… |
| Malaysia | my-001 Camp5 1Utama (Petaling Jaya) | related-name-nearby, related-name-nearby | Distinct Camp5 branch (EZ501, 5th Floor, 1 Utama) with its own address; sibling Camp5 Eco City (my-002, 7.3 km) and Camp5 Jumpa (my-003, 10.5 km) are separate branches. S1 (Camp5 official location page, chain list) show… |
| Malaysia | my-002 Camp5 KL Eco City (Kuala Lumpur) | related-name-nearby | Distinct Camp5 branch (4th Floor, KL Eco City Mall) with its own address, 7.3 km from my-001. S1 (Camp5 official location page) shows exists, open (hours listed) and a large bouldering area. Pin is OSM node/10701993373 … |
| Malaysia | my-003 Camp5 Jumpa (Kuala Lumpur) | related-name-nearby | Distinct Camp5 branch (3rd Floor, Jumpa Mall, Sungei Wang Plaza) with its own address, 10.5 km from my-001. S1 (Camp5 official location page) shows exists, open and bouldering. Pin is OSM node/11694943470 (Camp5 Climbin… |
| Malaysia | my-005 BUMP Bouldering Pavilion Bukit Jalil (Bukit Jalil) | related-name-nearby, single-source | Different gym from seed-1693 (Bump Bouldering, Jaya One): this is BUMP's second gym, Lot 5.84-01 Level 5 Pavilion Bukit Jalil, KL, 8.4 km away with its own address. Single source but primary: S2 BUMP official page for t… |
| Malaysia | my-006 Bhub Bouldering (Petaling Jaya) | single-source | Single source but primary: S3 Bhub official site shows exists, bouldering (about 80 problems rotated every ~5 weeks, bouldering passes and pricing) and an operating gym (live pricing, booking). Address 4 Lorong 51A/227C… |
| Malaysia | my-010 Klimbzone (Kuching) | single-source | Single source but primary: S5 Klimbzone official site shows exists, bouldering (grading/boulder page), top rope, address (2nd Floor Lot 1275 Block 17 KCLD, Jalan Lapangan Terbang, Kuching) and hours (Mon-Fri 12-22, Sat-… |
| Portugal | pt-003 Vertigo Climbing Center Marvila (Lisboa (Marvila)) | related-name-nearby, related-name-nearby, same-website | Distinct branch: Vertigo Marvila (Edificio Beira Rio) is 2.3-2.4 km from both the Oriente centre (pt-004) and the existing seed-1265 pin, which sits 123 m from Oriente. S3 own site shows exists, open and bouldering plus… |

## 3. Rejected (2)

| Country | Candidate | Code | Reason |
|---|---|---|---|
| New Zealand | nz-018 Vertical Limits (Nelson) | closed | VL own site now shows "WE ARE NOW CLOSED" and says it is closed for good and will not reopen (re-checked on its home page). |
| Czechia | cz-013 Stěna Eliass (Ostrava - Přívoz) | closed | S ELIA own opening-hours page states the wall operation ended on 31 Mar 2026 (rent dispute with the Sareza hall owner); re-read on 2026-10-03. |

## 4. Deferred — not added now (38)

| Country | Candidate | Reason |
|---|---|---|
| New Zealand | nz-011 Massey University Climbing Wall (Palmerston North) | Limited access not resolved: MUAC page (only source) says the wall is open to members of the Massey University Alpine Club ($40/year, students and non-students); no drop-in, guest or day pass or publ… |
| New Zealand | nz-016 Resistance Climbing (Dunedin) | Coordinate unresolved: RES site map block carries a marker at the old Moray Place site (-45.875429,170.5019283) but a map centre at the new address (-45.8704261,170.5228189). The recorded pin is that… |
| Croatia | hr-007 SPK Tuhobic climbing hall (Rijeka) | Not enough to accept: (1) current opening unconfirmed, S TUHOBIC own site was re-read 2026-10-03 and its latest news is from 2021 (hall opened March 2021), status_claim is unknown; (2) public access … |
| Croatia | hr-008 SPK Vertikal Varazdin climbing hall (Varazdin) | Limited access: S VERTIKAL own site (pk-vertikal.hr/treninzi, re-read 2026-10-03) states the climbing halls are intended exclusively for club members and that joining requires several visits to group… |
| Croatia | hr-009 SPK Bastion Osijek hall (Osijek) | Primary bouldering evidence too thin: bouldering and status unknown. The only evidence is a City of Osijek news item (a boulder wall up to about 4 m and a lead wall installed at NSD Gradski vrt for c… |
| Croatia | hr-010 Momentum Boulder (Osijek) | Primary bouldering evidence too thin: existence rests on the MultiSport card directory (S BENEFIT), the Facebook/Instagram pages are unreadable without login and no website was found; bouldering offe… |
| Croatia | hr-011 SPK Direkt Lepoglava hall (Lepoglava) | Bouldering not established: S DIREKT own site (spk-direkt.hr/stranica/dvorana, re-read 2026-10-03) shows an 80 m2 club hall, weekday hours 18:00-21:30, a 2 EUR day ticket and invitation to visit (pub… |
| Czechia | cz-004 Boulder V síti (Praha 3 - Žižkov) | coordinate unresolved: pin is the Google embed viewport centre on the contact page (S VSIT, embed names "Boulder V Síti"), but the embed own place marker (50.0826228, 14.4464384, Bořivojova 816/104) … |
| Czechia | cz-008 Lezecké centrum Ruzyně (Praha 6 - Ruzyně) | coordinate unresolved: recorded pin 50.0815736, 14.3092083 is the "GPS parkoviště" (parking lot) coordinate published on the home page (S RUZY), not the wall; the Mapy firm point embedded on the same… |
| Czechia | cz-015 Jungle Pardubice (Pardubice) | coordinate unresolved: recorded pin 50.0494197, 15.7586538 is the viewport centre (@ value) of the gym maps.app.goo.gl link (S JPAR), whose place marker is 50.0494163, 15.7612287, 184 m east. Needs t… |
| Czechia | cz-016 Gekon Boulder Bar (Pardubice) | coordinate unresolved: pin is the Google embed viewport centre on the contact page (S GEKO, embed names "Gekon boulder bar"); the embed own place marker (50.0331018, 15.7749599, Sladkovského 505) is … |
| Czechia | cz-017 MakakAréna (Jablonec nad Nisou) | coordinate unresolved: recorded pin 50.7265758, 15.1463401 is the viewport centre (@ value) of the gym goo.gl link (S MAKA); the place marker (MAKAK climbing s.r.o.) is 50.7265758, 15.1485288, 154 m … |
| Czechia | cz-021 Limit Boulder (České Budějovice) | coordinate unresolved: recorded pin 48.9743103, 14.5061776 is the viewport centre (@ value) of the gym goo.gl link (S LIMI), whose place marker is 48.9743068, 14.5087525, 188 m east. Needs the place-… |
| Czechia | cz-022 V16 (Plzeň) | coordinate unresolved: pin is the Google embed viewport centre on the contact page (S V16, embed names Kollárova 1239/19); the embed own place marker (49.7475265, 13.3683037) is 122 m from the record… |
| Czechia | cz-024 Boulder Bar Točna (Jihlava) | coordinate unresolved: recorded pin 49.4051742, 15.5864831 is the schema.org Place geo of the operator company MARIAN VLK s.r.o. (registered at Pražská 2229/6), not the boulder bar; the same page giv… |
| Czechia | cz-025 Komec (Brno - Královo Pole) | coordinate unresolved: pin is the Google embed viewport centre on the page (S KOME, embed names "Sportovní areál Komec", Hněvkovského 630/62c); the embed own place marker (49.169882, 16.6234766) is 1… |
| Iran | ir-002 Tochal Club (Tehran (Qaem)) | coordinate unresolved: the only pin is the Google embed on the S2 contact page (area precision, may mark the club office in the Qaem complex rather than the wall); no OSM element or own precise pin, … |
| Iran | ir-004 MZ Sport Club (Tehran (Sarafraz)) | limited-access club with thin bouldering evidence: S4 sessions page lists bouldering only as an instruction topic (a class list) and the homepage says courses 'can cover' bouldering; no boulder wall … |
| Iran | ir-005 Payam Climbing Academy (Tehran (Shariati)) | primary bouldering evidence too thin: status and bouldering are unknown; the S6 Instagram was only read through a summary (shows exists, Moon Board), the bouldering claim rests on the S5 directory an… |
| Malaysia | my-012 PAMPA Rock Climbing (Melaka) | Primary evidence too thin: only directory S8 plus an OSM node (hours, 2023 edit) support it; the gym's Facebook page (pamparockclimbing) could not be read, so exists/open/bouldering are not confirmed… |
| Malaysia | my-013 Sabah Indoor Climbing Centre (Kota Kinabalu) | Primary evidence too thin: only directories S7/S8 and an OSM building (way/240481106, alt_name Sabah Indoor Games) support it; its own site did not load, so existence, open status and bouldering are … |
| Portugal | pt-007 9.8 Gravity Climbing Lisbon (Prior Velho) | Primary bouldering evidence too thin: S6 own site shows exists and open (hours, prices, classes) but never says boulder or rope in the readable text; only directories (RCP, Atlas Lisboa) say boulderi… |
| Portugal | pt-009 Vertical Wall Climbing Lisbon (Olival Basto) | Primary evidence missing: own site verticalwall.pt returned HTTP 522, so exists/open/bouldering are supported only by directories (RCP, Atlas Lisboa) and the OSM tag. Needs a readable own site or soc… |
| Portugal | pt-011 The West Climbing Center (Peniche) | Coordinate unresolved: directory pin (RCP structured-data pin, method map-service-pin), not an accepted pin source; the gym site (S8) map is only an address search and the evidence has no OSM element… |
| Portugal | pt-013 Dolinas Climbing Center (Porto de Mós) | Primary bouldering and opening evidence too thin: S10 hotel site shows the place exists and gives coordinates, but not that bouldering is offered or that it is open to the public (special rates for h… |
| Portugal | pt-018 Zone Climb (Vila Nova de Gaia) | Primary evidence missing: the Zone group site has no page found for the Gaia climbing space; exists/open/bouldering rest on RCP and the OSM tag only (OSM node/12211876533 links zone.com.pt/climb/). N… |
| Portugal | pt-019 Clube de Escalada da Maia (Maia) | Club wall: public access not shown, bouldering unknown, status unknown, and only the council page (S21) says it exists. Coordinate unresolved: directory pin (RCP map-service-pin), not an accepted sou… |
| Portugal | pt-020 OneSoul Climbing (Vila do Conde) | Status and bouldering unconfirmed: the own-site climbing page now returns 404 and the home page lists only training, Hyrox and pilates (possibly closed or folded into the fitness club); exists/open/b… |
| Portugal | pt-021 Núcleo de Montanha de Espinho (Espinho) | Club wall: S16 club site shows the club exists but no indoor wall, hours, bouldering or public access; bouldering only from RCP tags. Coordinate unresolved: directory pin (RCP map-service-pin), not a… |
| Portugal | pt-022 Clube de Escalada de Braga (Braga) | Primary bouldering evidence too thin: S15 club site shows exists, open and drop-in day passes (public access, reservation required) but the site text never names bouldering (only RCP tags bloco). Coo… |
| Portugal | pt-023 ADEB Braga (Braga (Gualtar)) | Club wall: no readable primary source (only a Facebook page and a news article, S23), so exists/open/bouldering and public access are unsupported. Coordinate unresolved: directory pin (RCP map-servic… |
| Portugal | pt-024 Bloco Bouldering (Guimarães) | Coordinate unresolved: pin is the gym own site structured data at only 4 decimals (street precision, weak-coordinates), 446 m from the earlier RCP directory pin; the site address (Rua da Liberdade 41… |
| Portugal | pt-025 Boulder Penha Garcia (Penha Garcia) | Not enough evidence: S22 is a news article only; no primary page, opening hours or public-access rules, bouldering unknown, status unknown. It is a municipal indoor boulder structure (category other)… |
| Portugal | pt-026 Escalava (Ponta Delgada) | Open status conflicting: S18 own post (Sept 2025) says the bouldering room runs, is open to everyone on Monday social hours 18h-21h and has 24/7 membership at 20 EUR (public access and bouldering sho… |
| Portugal | pt-028 Parque Desportivo de Água de Pena (Machico) | Not enough evidence: no primary page; bouldering, rope offer, status and public access unknown (category other, a public sports park wall). Coordinate caveat: OSM node/2905237279 is an unnamed climbi… |
| Portugal | pt-029 Rocódromo de Vila Real (Vila Real) | Club wall: S17 club site shows the club and a rocodromo section exist but no bouldering, hours or public access (bloco only inferred from the map place name). Needs a primary page showing bouldering,… |
| Portugal | pt-030 Vertical Escalada (Estômbar) | Primary evidence too thin: own site is a minimal page (logo, social links, contact form) with no text on bouldering or hours; bloco only from RCP tags; status unknown. Needs a primary bouldering and … |
| Portugal | pt-031 Rocódromo 100 Vertigens (Castelo Branco) | Single directory source only (RCP): no website, exists/open/bouldering all unverified, category other; and the pin is a directory pin (RCP map-service-pin), not an accepted source. Needs a primary so… |

## 5. Same as a gym already on Bouldeer (26) — not added

Those marked "pin fix" carry a correction for the existing gym's pin: a separate, later location-update batch, not part of this import.

| Country | Candidate | Existing Bouldeer gym | Note |
|---|---|---|---|
| New Zealand | nz-001 Boulder Co. Auckland (Westgate) | seed-477 Boulder Co Auckland |  |
| New Zealand | nz-002 Northern Rocks (Glenfield) | seed-478 Northern Rocks | pin fix (separate batch) |
| New Zealand | nz-003 Auckland Climbing Gym (Eden Terrace) | seed-479 Auckland Climbing Gym |  |
| New Zealand | nz-004 Extreme Edge Panmure (Panmure) | seed-480 Extreme Edge Panmure |  |
| New Zealand | nz-012 Fergs Wellington (Wellington) | seed-481 Fergs Wellington |  |
| New Zealand | nz-013 Boulder Co. Christchurch (Riccarton, Christchurch) | seed-485 Boulder Co Christchurch |  |
| New Zealand | nz-014 Uprising Bouldering (Waltham, Christchurch) | seed-484 Uprising Boulder Gym |  |
| Croatia | hr-001 The Hive Zagreb (Zagreb) | seed-1481 The Hive Zagreb - Climbing & Yoga |  |
| Croatia | hr-002 Boulder Zona (Zagreb) | seed-1479 Boulder Zona | pin fix (separate batch) |
| Croatia | hr-003 Fothia Zagreb Fair (Velesajam) (Zagreb) | seed-1480 Fothia Velesajam dvorana za penjanje | pin fix (separate batch) |
| Croatia | hr-005 SPK Lapis (Dom mladih boulder hall) (Split) | seed-1483 Spk Lapis | pin fix (separate batch) |
| Croatia | hr-006 SPK Marulianus climbing centre (Split) | seed-1482 Climbing Center Marulianus |  |
| Czechia | cz-001 HUDY Boulder Karlín (Praha 8 - Karlín) | seed-1450 HUDY Boulder Karlín |  |
| Czechia | cz-002 SmíchOFF (Praha 5 - Smíchov) | seed-1452 Smichoff Climbing Center |  |
| Czechia | cz-003 BigWall (Praha 9) | seed-1455 BigWall Praha-Vysočany |  |
| Czechia | cz-006 JamJam Boulderovka (Praha 6) | seed-1453 JamJam Boulder Gym |  |
| Czechia | cz-007 Třináctka (Praha 13 - Stodůlky) | seed-1454 Třináctka |  |
| Malaysia | my-004 BUMP Bouldering Jaya One (Petaling Jaya) | seed-1693 Bump Bouldering |  |
| Malaysia | my-008 Project Rock IKEA Batu Kawan (Batu Kawan) | seed-1689 Project Rock | pin fix (separate batch) |
| Malaysia | my-014 Kompleks Sukan Mendaki Putrajaya (Putrajaya) | seed-1692 Putrajaya Challenge Park | pin fix (separate batch) |
| Portugal | pt-002 Escala25 (Lisboa) | seed-1263 Escala 25 - Lisboa | pin fix (separate batch) |
| Portugal | pt-004 Vertigo Oriente Climbing Center (Lisboa (Oriente)) | seed-1265 Vertigo - Lisboa |  |
| Portugal | pt-008 Rocódromo do Areeiro - Casal Vistoso (Lisboa (Areeiro)) | seed-1264 Rocódromo FCMP Casal Vistoso - Lisboa |  |
| Portugal | pt-014 upa! Climbing Center (Coimbra) | seed-1267 upa! Climbing Center - Coimbra |  |
| Portugal | pt-016 The North Wall (São Mamede de Infesta) | seed-1269 The North Wall - Porto | pin fix (separate batch) |
| Portugal | pt-017 São Rock Climbing (Porto (Campanhã)) | seed-1268 São Rock - Porto |  |

## 6. The 38 gyms that will be added

### New Zealand (8)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| nz-005 | Boulder Co. Hamilton | Te Rapa, Hamilton | review | official-map |
| nz-006 | Extreme Edge Hamilton | Frankton, Hamilton | ready | official-map |
| nz-007 | Turangi Climbing Gym | Turangi | ready | official-map |
| nz-008 | The Edge Indoor Rockwall (Taupo) | Taupo | ready | official-map |
| nz-009 | Rocktopia | Mount Maunganui | ready | official-map |
| nz-010 | The Crux Climbing Space (YMCA Taranaki) | New Plymouth | ready | official-map |
| nz-015 | The Adventure Centre Climbing Wall (The Kind Foundation, formerly YMCA Roxx) | Sydenham, Christchurch | review | official-map |
| nz-017 | The Gravity Well | Nelson | review | official-map |

### Croatia (1)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| hr-004 | BoldeRi | Matulji | review | official-map |

### Czechia (10)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| cz-005 | UltraAnt | Praha 1 - Staré Město | ready | official-map |
| cz-009 | HANGAR Brno | Brno | review | official-map |
| cz-010 | HUDY lezecká stěna Brno | Brno - Štýřice | ready | official-map |
| cz-011 | HANGAR Ostrava | Ostrava - Poruba | review | official-map |
| cz-012 | Tendon Blok | Ostrava - Vítkovice | ready | official-map |
| cz-014 | Replay boulder | Frenštát pod Radhoštěm | ready | official-map |
| cz-018 | Pajkland | Olomouc | ready | official-map |
| cz-019 | Flash Wall Olomouc | Olomouc - Chválkovice | ready | official-map |
| cz-020 | Stěna Lanovka | České Budějovice | review | official-map |
| cz-023 | HUDY lezecká stěna Ústí nad Labem | Ústí nad Labem | ready | official-map |

### Iran (2)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| ir-001 | Boulderland Climbing Gym | Tehran (Saadatabad) | review | official-map |
| ir-003 | Moj Climbing Gym | Tehran (Farmaniyeh) | review | official-map |

### Malaysia (9)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| my-001 | Camp5 1Utama | Petaling Jaya | review | osm |
| my-002 | Camp5 KL Eco City | Kuala Lumpur | review | osm |
| my-003 | Camp5 Jumpa | Kuala Lumpur | review | osm |
| my-005 | BUMP Bouldering Pavilion Bukit Jalil | Bukit Jalil | review | official-map |
| my-006 | Bhub Bouldering | Petaling Jaya | review | official-map |
| my-007 | Project Rock Gurney Plaza | George Town | ready | osm |
| my-009 | Project Rock Bayana Hub | Bayan Lepas | ready | osm |
| my-010 | Klimbzone | Kuching | review | official-map |
| my-011 | Bolder Ventures Climbing Gym | Subang Jaya | ready | osm |

### Portugal (8)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| pt-001 | Climb UP | Carnaxide | ready | osm |
| pt-003 | Vertigo Climbing Center Marvila | Lisboa (Marvila) | review | osm |
| pt-005 | CRUX Climbing Center | São Domingos de Rana | ready | official-map |
| pt-006 | Altissimo Lisboa | Agualva-Cacém | ready | official-map |
| pt-010 | Ericeira Boulder | Santo Isidoro (Ericeira) | ready | official-map |
| pt-012 | IN WALL Climbing Center | Setúbal | ready | official-map |
| pt-015 | Proa Climbing Center | Matosinhos | ready | official-map |
| pt-027 | Madeira Climbing Center | Funchal | ready | official-map |

## 7. How to sign off

1. Tell Claude "Wave 2 signed off" (optionally list any decision to change first — e.g. "defer th-014 instead").
2. Claude sets `reviewer` to you in the six `review.json` files (no decision changes unless you asked), re-runs reconcile + the dry run, commits, and opens a PR.
3. Then the import, one country at a time (6 batches, smallest first): `research stage` → validate → plan (commit) → `import --dry-run` with the service-role key in your terminal (prints a confirmation token) → your go-ahead → `import --apply --confirm <token> --i-understand-this-writes-to-production` → automatic read-back verification → `build-index --live` → commit. Claude gives you the exact copy-paste commands for each batch.
