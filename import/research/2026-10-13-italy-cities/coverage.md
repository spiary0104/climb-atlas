# Coverage: Italy cities (2026-10-13)

## Result
- 35 candidates (ic-001 to ic-035), 38 sources registered. Importer check: ready 24 | review 7 | blocked 4 | already in Bouldeer 0. Decisions: accept 23, defer 11, reject 1 (closed), same-as 0. None of the 35 matched an existing Bouldeer gym or an earlier Italian section.
- Bouldeer held 40 Italian gyms before this pass (production 3,294 total); the gap report estimated about 130 missing and called Italy "not researched". This batch adds 23 (63 if imported), so roughly 110 estimated gaps remain, but the estimate itself is the weakest figure in the report (170, range 120-260).
- Real-world numbers below are estimates from the gap report, not verified.

## Per area (accepted now vs estimate)
| Area | Already in Bouldeer | Accepted now | Deferred / leads | Notes |
|---|---|---|---|---|
| Milano city | 4 (Rockspot, Manga, Climbing District, Solid; Salewa Cube Varese nearby) | 0 | Passaggio Obbligato, Way Out, Tonic (sites dead) | City proper is covered for the chains; the independents' domains are dead. |
| Lombardia outside Milano (Monza-Brianza, Bergamo, Como, Varese, Brescia) | 1 (New Rock Brescia) | 7: Boulder&Co (Agrate), Big Walls (Brugherio), Akira (Carate, opened Aug 2026), Orobia (Curno), InVert (Gessate), Lezard (Mozzate), Stone Age (Uboldo) | Mad Climbers (Brescia), Orizzonte Verticale (Ronco B.) deferred; Toptribe, Koren leads | Bergamo and Monza-Brianza now have their commercial gyms. |
| Roma | 5 | 0 | Rock & Walls Lanciani lead | The Roman independents' sites are dead or hijacked; only a 2017-era listing for Rock & Walls. Searches for Rome returned nothing current. |
| Torino | 5 (+K3 Ivrea) | 1: K3 Ivrea | BlockBusters Mondovì and Vertigo (Cuneo province) deferred for lack of 2026 content | The 2026-10-05 sections already took the Torino gyms. |
| Bologna and Emilia-Romagna | 8 | 3: Ravenna Gravity Fighters, Vertical Forlì, Pareti Sport Center (Parma) | Deva Wall (Ferrara), Kro Climb (Sala Bolognese) deferred; Bologna has no further open candidate | Bologna metro is complete from the earlier sections. |
| Firenze / Toscana | 4 | 0 | Crazy Center Firenze and Prato (boulder not stated), Rock Time Pistoia (card + medical certificate) | |
| Veneto (Padova, Verona, Venezia-Mestre, Vicenza, Treviso) | 1 (King Rock Verona) | 4: GAM (Mirano), Vi-Block (Vicenza), Opera Verticale (Scorzè), Intellighenzia (Padova) | Gioco Verticale (Treviso), Orizzonti Verticali (Montebelluna) deferred; Sportler Silea closed | Verona and Venezia-Mestre city have no further public boulder gym found. |
| Genova / Liguria | 1 (Sisport) | 1: The ForGe Climb | Club walls only otherwise | |
| Napoli / Campania | 1 (Palaroccia) | 0 | none | Nothing found beyond the 2026-10-06 section. |
| Bari / Puglia | 0 | 1: K2 Indoor (Putignano, Bari province) | Bari city: nothing with a primary source | Kanku Dai (Bari) and Athena (Taranto) appear only in the directory. |
| Trentino-Alto Adige (Trento, Bolzano) | 5 | 6: Arena Boulder (Arco), Block al Cubo and Plastic Rock (Rovereto), Campfour Boulder (Dro), Heliks (Brunico), Vertikale (Bressanone) | Ortisei boulder hall, Arco Climbing | Trento city itself has no further public gym; Bolzano is covered by the two Salewa Cube entries. |

## What was checked
- Leads: infoboulder.com regional lists (20 regions, 126 detail pages read for address and site; entries dated, many from 2006-2019), an Overpass query for sport=climbing facilities across Italy (810 elements, 563 after dropping crags and adventure parks), indoorclimbing.com Italy list, and a few web searches (the shared search quota was spent sparingly; searches for Roma, Bari and Firenze returned only old articles).
- Every candidate's own site was fetched (script fetch of home plus up to five linked pages, or a summarising fetch where the host blocks scripts) and read for bouldering, hours, a day price and 2026 content. Pages whose domain no longer resolves (about 25 from the directory) or was taken over (getupasd.it, fuoritraccia.org show casino content) were dropped.
- Coordinates: the gym's own OSM element when present (19 accepted), the gym's own embedded Google map (Vi-Block; Rock Time, Deva Wall, Orizzonte Verticale for the deferred), or a Photon house-number node of the printed address (InVert, Plastic Rock, ForGe). OSM elements were cross-checked against the gym's embed where one exists (Boulder&Co 25 m, Stone Age 1 m; Vertikale 170 m apart, node kept).

## Open points
- Day access: many Italian gyms need a FASI or ASD card. All accepted gyms either publish a single-entry price or sell the card on the spot (Big Walls: membership 15 EUR + entry; GAM: insurance included in the first entry; K2: yearly quota with the FASI card). Ravenna Gravity Fighters and Lezard are flagged in MANUAL-CHECK.md.
- Eleven deferred and the long found-but-not-candidates list are in MANUAL-CHECK.md.
- OSM climbing data in Italy is thin around Roma, Napoli and Bari, which is why those areas stayed empty: a future pass needs working Roman gym sites (or social posts) rather than directories.
