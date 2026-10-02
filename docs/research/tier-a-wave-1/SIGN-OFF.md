# Wave 1 — owner sign-off sheet

Generated 2026-10-02 from the committed review files (never hand-edited). Index 2127 gyms (equals production). **Nothing is staged or imported yet.**

**Signed off by the owner on 2026-10-02.** The decisions were drafted by Claude on the owner's instruction; no decision was changed at sign-off.

## 1. Summary

| Country | Section | Candidates | Accept (will be added) | Same as an existing gym | Defer | Reject |
|---|---|---:|---:|---:|---:|---:|
| India | `2026-10-01-india` | 16 | 10 | 1 | 5 | 0 |
| Indonesia | `2026-10-01-indonesia` | 9 | 6 | 0 | 3 | 0 |
| Israel | `2026-10-01-israel` | 12 | 9 | 3 | 0 | 0 |
| Russia | `2026-10-01-russia` | 29 | 20 | 6 | 1 | 2 |
| Singapore | `2026-10-01-singapore` | 27 | 20 | 1 | 5 | 1 |
| Sweden | `2026-10-01-sweden` | 40 | 31 | 7 | 2 | 0 |
| Switzerland | `2026-10-01-switzerland` | 87 | 74 | 8 | 5 | 0 |
| Thailand | `2026-10-01-thailand` | 16 | 6 | 5 | 5 | 0 |
| Türkiye | `2026-10-01-turkey` | 9 | 3 | 2 | 4 | 0 |
| **Total** | | **245** | **179** | **33** | **30** | **3** |

Dry run on master (2026-10-02): all 179 accepted gyms stage and plan as **new**, 0 conflicts, 0 blockers; 1 duplicate decision (Stonegoat The PARQ, Thailand) is written automatically from the review.

## 2. Judgement calls to confirm

- **Wallride Växjö (se-037) — accept**, pin corrected from the map viewport to the place pin of the gym's own Google link (156 m).
- **Karlstad (se-039) — defer**: guest access only with a member.
- **Solna (se-001) — accept** although it announces closing on 19 Dec 2026 (it can be removed then).
- **Defers instead of rejects** for uncertain cases: Bali Boulder (id-007, inferred opening year), Kısakaya (tr-009, temporary), UPSIDE (th-014, undated opening), Bangalore Boulder (in-008, address conflict), Elevate (in-007, storefront page is location evidence only).
- **Koala (Kfar Etzion)** was left out: it is in the West Bank (OSM/ISO code PS), outside the Israel section.

### Accepted although reconcile flagged them (100) — each has a written reason

Most flags are routine: **same-website** and **related-name-nearby** mean chain branches sharing one website or brand (each branch was checked as a separate site); **single-source** means one primary source (the gym's own site) confirmed it; **limited-access** marks club or members-first walls that still offer public entry. The few real duplicate questions (name-match, alias-match, importer-probable-duplicate) were each compared with the named Bouldeer gym and judged distinct; the importer's probable duplicate becomes the one automatic "distinct" decision.

| Country | Candidate | Flags | Reason |
|---|---|---|---|
| India | in-002 Climb Central Gurugram (Gurugram) | single-source | Single source but primary: S2 chain page for Gurugram shows it as a bouldering gym in M3M 65th Avenue mall with booking and hours links (exists, open, bouldering). Pin is the chain's own place-labelled map embed (M3M 65… |
| India | in-003 Climb Central Bengaluru (Whitefield, Bengaluru) | single-source | Single source but primary: S2 chain page for Bengaluru shows exists, open, bouldering (VR Bengaluru, Whitefield) with booking. Pin disagreement named: the location page embed (place label 'Climb Central Bengaluru', 12.9… |
| India | in-005 Equilibrium Climbing Station Indiranagar (Indiranagar, Bengaluru) | related-name-nearby | S3 location page shows exists, open, bouldering (bouldering and ClimbFit only) at 3rd Floor, 546 Chinmaya Mission Hospital Rd. Distinct branch from in-004 (Hoodi, 8 km away, own address). Pin disagreement named: recorde… |
| India | in-009 The Indian Bouldering Company (Fort, Mumbai) | single-source | Single source but primary: S4 own site shows exists, open, bouldering (four wall sections, indoor bouldering space) with address and opening hours (Mon-Fri 7am-10:30pm, Sat-Sun 10am-9pm). Pin is the place-labelled map e… |
| India | in-011 Crag Studio Mettuguda (Mettuguda, Secunderabad) | same-website, single-source | Distinct second Crag Studio site (Mettuguda metro station concourse, Secunderabad, about 17 km from Gachibowli) with its own address, hours and booking; not the same gym as in-010 or seed-1583. S5 site (a JS app, but it… |
| India | in-015 Climb City (Sector 132, Noida) | single-source | Single source but primary: S9 own site shows exists, open (hours Tue-Fri 1-10pm, Sat-Sun 11am-9pm, online booking, day pass price), bouldering (about 150 bouldering problems) plus top rope and lead lanes, with address. … |
| India | in-016 Boulder 21 (Nerul, Navi Mumbai) | limited-access | S10 Girivihar page (own site) shows a free public bouldering facility set up with Navi Mumbai Municipal Corporation, in operation since 1 June 2023, with public hours 5-9pm daily except Mondays and public holidays, no p… |
| Indonesia | id-001 Boulder Planet Indonesia (Jakarta Barat) | single-source | Single source, but BP is the gym's own official site and shows it exists, is open (daily hours, current pass prices) and offers bouldering; pin is the business location from the site's own page data (building precision)… |
| Indonesia | id-002 Indoclimb FX Sudirman (Jakarta Pusat) | same-website, same-website, single-source | Single source, but IC is the chain's official site; the FX Sudirman branch page shows bouldering and rope walls and weekly opening hours. Distinct branch from id-003 and id-004: different mall and address in Jakarta Pus… |
| Indonesia | id-003 Indoclimb Kuningan City (Jakarta Selatan) | same-website, same-website, single-source | Single source, but IC is the chain's official site; the Kuningan City branch page lists a bouldering area, an interval bouldering area and weekly hours. Distinct branch from id-002 and id-004 (own mall, own address and … |
| Indonesia | id-004 Indoclimb Lippo Mall Kemang (Jakarta Selatan) | same-website, same-website, single-source | Single source, but IC is the chain's official site. Re-read the rendered branch page on 2026-10-01: it says the 780 sqm bouldering-only gym is 'now open for soft opening', lists hours for this week and has a booking wid… |
| Indonesia | id-005 Dreamstone Boulders Alam Sutera (Tangerang) | single-source | Single source, but DS is the gym's own official site; the Alam Sutera branch page shows an indoor bouldering gym with day passes and memberships and a live booking site (2026 footer). Pin is the branch lat/long publishe… |
| Indonesia | id-006 Goodang Bouldering (Katapang, Kabupaten Bandung) | single-source | Single source, but GD is the gym's own official site. I rendered the site in a browser on 2026-10-01: it describes a premium bouldering gym with address, Mon-Sun 10:00-22:00 hours, cafe and a 2026-dated event, so it exi… |
| Israel | il-001 Performance Rock Tel Aviv (Tel Aviv) | related-name-nearby, related-name-nearby, related-name-nearby, related-name-nearby, same-website, same-website | S1 (Performance Rock chain site, branch page) shows Begin 144 Tel Aviv, weekly hours and a bouldering-only gym, so exists/open/bouldering are primary-sourced. Address is the current one: the chain site lists only Begin … |
| Israel | il-003 Performance Rock Haifa (Haifa) | same-website, same-website, single-source | S1 chain site (branch card and branch page) shows HaNamal 32 Haifa, daily hours and bouldering; single source is primary and shows exists, open and bouldering. Pin is the branch's own Waze pin on the chain site (5 decim… |
| Israel | il-004 VKING Tel Aviv (Tel Aviv) | related-name-nearby, related-name-nearby, related-name-nearby, related-name-nearby, single-source, weak-coordinates | S2 own site shows a large bouldering gym with weekly resets, HaShlosha 3 Tel Aviv and opening hours; single source is primary and shows exists, open and bouldering. Coordinates: the site publishes two pins ~549 m apart.… |
| Israel | il-005 The Bloc Tel Aviv (Tel Aviv) | related-name-nearby, related-name-nearby, related-name-nearby, related-name-nearby, same-website | S3 chain site: Hebrew page states the chain is a network of boulder walls in Jerusalem and Tel Aviv, and the Tel Aviv page lists HaMeretz 4 and weekly opening hours (English page cited as evidence lists the address and … |
| Israel | il-006 The Bloc Jerusalem (Jerusalem) | related-name-nearby, same-website | S3 chain site (Hebrew Jerusalem page) shows a Jerusalem price list, opening hours and address Eliashar 7 (Hebrew spelled Elishar 7), and the chain describes itself as a network of boulder walls in Jerusalem and Tel Aviv… |
| Israel | il-007 Urban Climbing Rehovot (Rehovot) | related-name-nearby, same-website | S4 chain site (Rehovot branch page) shows 200 bouldering routes, Antin Street Rehovot, opening hours, opened 2011; primary source shows exists, open and bouldering. Pin is the branch's own Waze pin 31.90946,34.80696, 16… |
| Israel | il-008 Urban Climbing Jerusalem (Jerusalem) | related-name-nearby, same-website, single-source | S4 chain site (Jerusalem branch page) shows 200 bouldering routes, Givat Shaul address (Beit HaDfus 11 / Yosef Weitz Drive 1) and school-year opening hours; single source is primary and shows exists, open and bouldering… |
| Israel | il-010 iClimb Rishon LeZion (Rishon LeZion) | related-name-nearby, related-name-nearby, related-name-nearby, related-name-nearby | S6 own site describes a 1,200 m2 complex with a boulder area with hundreds of routes plus lead, auto-belay and kids zones; its price/hours page shows Nadav Baskind 12 and hours, and the site's own map link gives the pin… |
| Israel | il-011 Roca Climbing Club (Kibbutz Afikim) | limited-access, single-source | S7 own site shows dozens of bouldering routes plus an 8 m auto-belay wall, public opening hours (closed Monday), a shop, classes for kids/youth/adults and an open invitation to families, with registration for 2025/2026 … |
| Russia | ru-002 BigWall Riviera (Moscow (Avtozavodskaya)) | single-source | Single source but primary: S BW own page bigwallsport.ru/rivera (re-opened) describes a boulder hall in Riviera mall, Avtozavodskaya ul. 18, hours daily 10:00-23:00 (exists, open, bouldering, address). Pin is the chain … |
| Russia | ru-003 BigWall Gavan (Moscow (Vodny Stadion)) | single-source | Single source but primary: S BW own page bigwallsport.ru/vodnyi_stadion (re-opened) calls it a boulder hall (about 850 m2) at Kronshtadtsky bul. 3a, Gavan mall, 3rd floor, hours daily 10:00-23:00 with booking open; the … |
| Russia | ru-005 Climb Lab Butyrskaya (Moscow (Butyrskaya)) | same-website | Distinct branch from ru-006: Climb Lab Butyrskaya is at Ogorodny pr-d 10 str. 6 while ru-006 is in OMA mall on Ochakovskoye sh. 3a (many km apart); S CL contacts page (re-opened) lists both halls separately with hours 0… |
| Russia | ru-006 Climb Lab Aminyevskaya (Moscow (Aminyevskaya)) | same-website, single-source | Distinct branch from ru-005 (OMA mall, Ochakovskoye sh. 3a vs Ogorodny pr-d 10). Single source but primary: S CL contacts page (re-opened) shows the Aminyevskaya branch, address, hours 07:00-00:00 daily, and the chain p… |
| Russia | ru-009 Staraya Shkola (Moscow (Shosse Entuziastov)) | single-source | Single source but primary: S SS own site (re-opened) shows bouldering and rope climbing, address shosse Entuziastov 31 str. 50, hours daily (Mon-Fri 11:00-23:00, Sat-Sun 10:00-22:00). Pin is the marker on the site map; … |
| Russia | ru-010 Tengu's Michurinsky Prospekt (Moscow (Michurinsky prospekt)) | related-name-nearby, related-name-nearby, same-website, same-website, single-source | Distinct branch of the Tengu's chain: Lobachevskogo 114 (m. Michurinsky prospekt) has its own address and is 10-19 km from the other two (siblings ru-010/011/012). S TG own site (re-opened, tengus.ru) shows a bouldering… |
| Russia | ru-011 Tengu's Yuzhnaya (Moscow (Yuzhnaya)) | alias-match, related-name-nearby, same-website, same-website, single-source | Distinct branch of the Tengu's chain: Dnepropetrovskaya 2 (m. Yuzhnaya) has its own address and is 10-19 km from the other two (siblings ru-010/011/012). S TG own site (re-opened, tengus.ru) shows a bouldering chain (4.… |
| Russia | ru-012 Tengu's Maryina Roshcha (Moscow (Maryina Roshcha)) | alias-match, related-name-nearby, same-website, same-website, single-source | Distinct branch of the Tengu's chain: Sushchevsky Val 49, Jazz business centre (m. Maryina Roshcha) has its own address and is 10-19 km from the other two (siblings ru-010/011/012). S TG own site (re-opened, tengus.ru) … |
| Russia | ru-025 ClimbArt (Saint Petersburg (Nauki prospekt)) | single-source | Single source but primary: S CA own site (re-opened) is a bouldering-only gym at pr. Nauki 71 k. 1 lit A, hours Mon-Sun 09:00-23:00, 2026 events listed. Pin is the gym own Yandex map-constructor pin on the site. |
| Russia | ru-028 Iskra Center (Chelyabinsk (Kaliber)) | related-name-nearby, same-website, single-source | Distinct branch from the other Iskra bouldering hall (Khudyakova 12 k1, Kaliber complex; 6.3 km apart; the third hall Iskra.Vysota is a rope wall and is not recorded). Single source but primary: S IS own site (re-opened… |
| Russia | ru-029 Iskra Severok (Chelyabinsk (Focus mall)) | related-name-nearby, same-website, single-source | Distinct branch from the other Iskra bouldering hall (Moldavskaya 16, Focus mall; 6.3 km apart; the third hall Iskra.Vysota is a rope wall and is not recorded). Single source but primary: S IS own site (re-opened) About… |
| Singapore | sg-001 Boulder Movement Downtown (Downtown Core) | same-website, same-website, same-website | Re-checked S1 on the official site: Downtown entry (6A Shenton Way #B1-03) is listed open and its description says it is perfect for new climbers 'looking to get into bouldering' (explicit bouldering on a primary source… |
| Singapore | sg-002 Boulder Movement Bugis (Bugis) | same-website, same-website, same-website | Re-checked S1 on the official site: Bugis entry (201 Victoria St #05-07) is listed open; its description cites a boulder island, traverse wall, moon board and a mystery-grade wall, i.e. bouldering features on a primary … |
| Singapore | sg-003 Boulder Movement Rochor (Rochor) | same-website, same-website, same-website | Re-checked S1: Rochor (2 Serangoon Rd #02-12 Tekka Place) is listed open; its description names an adjustable kilter board but not the word bouldering, so bouldering rests on S1 plus the official boulderm.com pricing/me… |
| Singapore | sg-004 Boulder Movement Tai Seng (Tai Seng) | related-name-nearby, same-website, same-website, same-website | Re-checked S1: Tai Seng (18 Tai Seng St #01-09) is listed open; its description (slab, flat wall, overhang, cave, endurance wall) does not use the word bouldering, so bouldering rests on S1 plus the official boulderm.co… |
| Singapore | sg-005 boulder+ Aperia (Kallang) | same-website | S2 official boulder+ site lists The Aperia (12 Kallang Ave) with opening hours, and its first-visit page says 'new to the world of bouldering'; chain-store-list is primary and shows exists/open/address. Distinct address… |
| Singapore | sg-006 boulder+ The Chevrons (Boon Lay) | same-website | S2 official boulder+ site lists The Chevrons (48 Boon Lay Way, opened Dec 2021) with shared opening hours; bouldering shown on the same site's first-visit page. Distinct address from sg-005. Pin OSM node/11645974498. Re… |
| Singapore | sg-007 Boulder Planet Sembawang (Sembawang) | same-website | S3 official Boulder Planet site: about-us says 'Boulder Planet is a bouldering gym', home page lists Sembawang Shopping Centre #B1-22/23 with weekday/weekend hours, first-time page names the Sembawang branch; a 2026 wor… |
| Singapore | sg-008 Boulder Planet Tai Seng (MacPherson) | related-name-nearby, same-website | S3 official Boulder Planet site lists Grantral Mall, 601 MacPherson Rd #02-07 (the chain calls it Tai Seng) with hours; the site says it is a bouldering gym. Different brand and address from Boulder Movement Tai Seng (s… |
| Singapore | sg-009 BFF Climb Bendemeer (Kallang) | same-website, same-website | S4 official BFF Climb site lists Bendemeer (CT Hub, 2 Kallang Ave #01-20) with Climb Zone hours. The contact page itself does not use the word bouldering; the same site's Boulder Zone page (Climb Zone: Moon Board, spray… |
| Singapore | sg-010 BFF Climb Tampines Hub (Tampines) | related-name-nearby, same-website, same-website | S4 official BFF Climb site lists Our Tampines Hub (1 Tampines Walk #02-81) with Climb Zone hours; bouldering shown by the site's Boulder Zone and adult bouldering class pages (contact page lacks the word). Distinct from… |
| Singapore | sg-011 BFF Climb Tampines Yoha (Tampines) | related-name-nearby, same-website, same-website | S4 official BFF Climb site lists yo:HA Commercial @ Tampines (6 Tampines St 92 #03-06) with Climb Zone hours; bouldering shown by the site's Boulder Zone and adult class pages. Distinct from sg-010 (1144 m apart) and sg… |
| Singapore | sg-012 fit · bloc Kent Ridge (Kent Ridge) | same-website, same-website | S5 official fit . bloc site shows Kent Ridge flagship (87 Science Park Drive #03-02) as an outlet with 'extensive bouldering areas', and pass wording lists bouldering across all 3 outlets. Distinct address from sg-013/0… |
| Singapore | sg-013 fit · bloc Depot Heights (Bukit Merah) | same-website, same-website | S5 official fit . bloc site: Depot Heights (108 Depot Rd #02-01) is 'built for focused bouldering sessions' with a MoonBoard, hours listed. Distinct address from sg-012/014. Pin OSM node/11646014037. Region code is a ro… |
| Singapore | sg-014 fit · bloc Telok Ayer (Telok Ayer) | same-website, same-website, single-source | single-source: S5 is the chain's own site (primary) and shows exists, open (hours listed), address 7 Maxwell Rd #06-01 and bouldering (Telok Ayer entry mentions Tension Board 2 and competition-style climbs; the chain he… |
| Sweden | se-002 Klättercentret Telefonplan (Hägersten) | related-name-nearby, related-name-nearby | S KC own page for Telefonplan shows exists, open, address, bouldering and ropes; pin is OSM node 804687577. Related-name flag is a different gym: Klättercentret Telefonplan (Tellusgången 22-24, Hägersten) is a separate … |
| Sweden | se-009 BLX Bouldering Club (Solna) | single-source | Single source, accepted under rule E: S BLX own site (primary) shows exists, open, address (Mall of Scandinavia, 4th floor) and bouldering. No OSM node exists; pin is the map location the gym's own site embeds (gym's ow… |
| Sweden | se-015 Kungsbacka Klättercenter (Kungsbacka) | single-source | Single source, accepted under rule E: S KBA own site /omoss (re-read in a rendered browser; the page is a JS app) shows Mariosgata 13 Kungsbacka, drop-in bouldering and public opening hours. Pin is the site's own named … |
| Sweden | se-017 Klättercentret Helsingborg (Helsingborg) | single-source | Single source (KC is a primary chain-store-list), accepted under rule E: S KC Helsingborg page shows exists, open, address and the first-visit page shows bouldering. Pin is the Google Maps place pin the chain itself lin… |
| Sweden | se-020 Skånes Klätterklubb (Lund) | limited-access | Limited-access cleared: S SKK homepage (re-read) says non-members can buy a day pass to a regular session (booking in advance required) and try-climbing sessions are open to anyone without booking. Own site shows exists… |
| Sweden | se-021 C4 Climbing (Kristianstad) | limited-access | Limited-access cleared: S C4 own /climb page (re-read in a browser) says everyone is welcome, no booking, public opening hours (Tue-Thu and Sun evenings, Sat morning) and non-member entry 120 kr. Own site shows address … |
| Sweden | se-023 Hangaren Klätterhall (Linköping) | limited-access | Limited-access cleared: S LKK own page (expired TLS certificate; read with checks off) shows a volunteer-run club hall whose reception handles entry, with a prices page and a weekly public 'Prova på - Drop in' session, … |
| Sweden | se-024 Klätterhallen i Norrköping (Norrköping) | single-source | Single source, accepted under rule E: S KHN own site (primary) shows exists, open, address (Kronomagasinsgatan 5), boulder hall open without booking and a rope hall needing a belay card. Pin is the place link the gym it… |
| Sweden | se-025 Klättra Motala Klätterhall (Motala) | single-source | Single source, accepted under rule E: S MOTALA own page (Billobulls) shows exists, open (live page), address Mineralvägen 16, bouldering, top rope and lead. Pin is the map link on that page; not in OSM. |
| Sweden | se-031 Fyshuset Klätterhall (Gävle) | single-source | Single source, accepted under rule E: S FYSHUSET own site shows exists, open (05-23 hours), address Södra skeppsbron 28 and bouldering. Pin is the Google Maps embed on that site; not in OSM. Operated by a company (Gävle… |
| Sweden | se-035 Klättervigören (Jönköping) | single-source | Single source, accepted under rule E: S VIGOREN own site shows exists, open, bouldering and ropes; the hitta-hit page gives address Centralvägen 31 and the gym's own map pin. Not in OSM. Sister gym of Klätterfabriken (s… |
| Sweden | se-037 Wallride (Växjö) | single-source | Owner decision 2026-10-01: accept. Single primary source (S WALLRIDE own climbing page, re-read 2026-10-01): rope-free bouldering on crash pads, opening hours every day, Arabygatan 13, Växjö. Pin corrected to the place … |
| Sweden | se-038 Halmstad Klätterklubb (Halmstad) | limited-access | Limited-access cleared: S HKK own site (priser-och-oppettider page, re-read) says non-members pay a day entry without booking in regular hours (Tue, Thu 18-21, Fri 17-20, Sat-Sun 14-18). Own site shows exists, boulderin… |
| Sweden | se-040 Höglandsklättrarna Tranås (Klättersilon) (Tranås) | limited-access | Limited-access cleared: S HKT own site (re-read) shows drop-in for everyone on Wednesdays 17:30-19:30 at 60 kr, two boulder caves plus top-rope and lead walls, address Ringvägen 10 with a map embed. Pin is the club's ow… |
| Switzerland | ch-005 Boulderlounge Schlieren (Schlieren) | same-website | Distinct Boulderlounge branch from ch-006 (Schlieren, Zürcherstrasse 39j vs St. Gallen, Zürcherstrasse 160, different cities); S4 chain list shows exists, open and bouldering with its own address; OSM node pin at buildi… |
| Switzerland | ch-006 Boulderlounge St. Gallen (St. Gallen) | related-name-nearby, same-website | Distinct Boulderlounge branch (own address Zürcherstrasse 160, 9014 St. Gallen). Also a different gym from ch-017 Kletterzentrum St. Gallen: different name and address, 2.4 km apart. S4 chain list shows exists, open and… |
| Switzerland | ch-017 Kletterzentrum St. Gallen (St. Gallen) | related-name-nearby | Kletterzentrum St. Gallen (Edisonstrasse 9) is a different gym from Boulderlounge St. Gallen (ch-006): different name, address and operator site, 2.4 km apart. S13 official site shows exists, open and bouldering. |
| Switzerland | ch-007 Kletterzentrum Gaswerk Schlieren (Schlieren) | same-website, same-website | Distinct Kletterzentrum Gaswerk branch (Kohlestrasse 12b, Schlieren) from Greifensee and Wädenswil, each with its own address; S5 chain list shows exists, open, bouldering and address. |
| Switzerland | ch-008 Kletterzentrum Gaswerk Greifensee (Greifensee) | same-website, same-website | Distinct Gaswerk branch (Im Grossriet 1, Greifensee). The research note doubted indoor bouldering, so I re-opened S5 /standorte/greifensee: it states "Bouldern indoor: 865m2" and lists opening hours, so indoor boulderin… |
| Switzerland | ch-009 Kletterzentrum Gaswerk Wädenswil (Wädenswil) | same-website, same-website | Distinct Gaswerk branch (Rütihof 2, Wädenswil) with its own address and OSM node; S5 chain list shows exists, open, bouldering and address. |
| Switzerland | ch-041 Kraftreaktor Lenzburg (Lenzburg) | related-name-nearby | Distinct Kraftreaktor branch (Hammermattenstrasse 18, Lenzburg), 8.4 km from the Aarau branch (ch-042) with its own address; S37 official site shows exists, open, bouldering and address. |
| Switzerland | ch-042 Kraftreaktor Aarau (Aarau) | related-name-nearby | Distinct Kraftreaktor branch (Neumattstrasse 13, Aarau), 8.4 km from Lenzburg (ch-041) with its own address; S38 official site shows exists, open, bouldering and address. |
| Switzerland | ch-062 Grimper.ch Lausanne-Beaulieu (Lausanne) | related-name-nearby, same-website, same-website, same-website, same-website, same-website | Distinct Grimper.ch branch (Avenue des Bergières 10, Lausanne) with its own address, separate from Echandens, Villeneuve, Givisiez, Fribourg and Satigny; S58 chain list shows exists, open, bouldering and address. |
| Switzerland | ch-063 Grimper.ch Echandens (Rocspot) (Echandens) | related-name-nearby, same-website, same-website, same-website, same-website, same-website | Distinct Grimper.ch branch (Route de la Venoge 3G, Echandens, Rocspot), 5.9 km from Lausanne-Beaulieu with its own address; S58 chain list shows exists, open, bouldering and address. |
| Switzerland | ch-064 Grimper.ch Villeneuve (Villeneuve) | same-website, same-website, same-website, same-website, same-website | Distinct Grimper.ch branch (Zone Industrielle D 107, Villeneuve) with its own address; S58 chain list shows exists, open, bouldering and address. |
| Switzerland | ch-065 Grimper.ch Givisiez (Bloczone) (Givisiez) | related-name-nearby, same-website, same-website, same-website, same-website, same-website | Distinct Grimper.ch branch (Route Henri-Stephan 12, Givisiez, Bloczone), 2.6 km from Le Hangar in Fribourg (ch-066) with a different address; S58 shows exists, open, bouldering and address. |
| Switzerland | ch-066 Le Hangar (Grimper.ch Fribourg) (Fribourg) | related-name-nearby, same-website, same-website, same-website, same-website, same-website | Distinct Grimper.ch branch (Le Hangar, Avenue du Midi 4, Fribourg), 2.6 km from Givisiez (ch-065) with a different address; S58 chain list shows exists, open, bouldering and address. |
| Switzerland | ch-067 Grimper.ch Meyrin-Satigny (Satigny) | same-website, same-website, same-website, same-website, same-website, single-source | Distinct Grimper.ch branch (Rue du Pré-de-la-Fontaine 8A, Satigny). Single-source: S58 /salles-descalade/satigny is the chain official page; I re-read it: hours, address, "voies et blocs" renewed weekly and a bloc pass.… |
| Switzerland | ch-068 TOTEM Ecublens (Ecublens) | same-website, same-website, same-website, same-website, same-website | Distinct TOTEM branch in Ecublens (Chemin de Verney 5B) with its own address, different from the other five TOTEM sites; S59 chain list shows exists, open, bouldering and address; OSM node pin at building precision. |
| Switzerland | ch-069 TOTEM Gland (Gland) | same-website, same-website, same-website, same-website, same-website | Distinct TOTEM branch in Gland (Avenue du Mont-Blanc 38) with its own address, different from the other five TOTEM sites; S59 chain list shows exists, open, bouldering and address; OSM node pin at building precision. |
| Switzerland | ch-070 TOTEM Vevey (Vevey) | same-website, same-website, same-website, same-website, same-website | Distinct TOTEM branch in Vevey (Avenue Général-Guisan 60) with its own address, different from the other five TOTEM sites; S59 chain list shows exists, open, bouldering and address; OSM node pin at building precision. |
| Switzerland | ch-071 TOTEM Meyrin (Meyrin) | same-website, same-website, same-website, same-website, same-website | Distinct TOTEM branch in Meyrin (Rue Emma-Kammacher 5B) with its own address, different from the other five TOTEM sites; S59 chain list shows exists, open, bouldering and address; OSM node pin at building precision. |
| Switzerland | ch-072 TOTEM Vernier (Le Môll) (Vernier) | same-website, same-website, same-website, same-website, same-website | Distinct TOTEM branch in Vernier (Le Môll) (Avenue de l'Étang 67) with its own address, different from the other five TOTEM sites; S59 chain list shows exists, open, bouldering and address; OSM node pin at building prec… |
| Switzerland | ch-073 TOTEM Versoix (Versoix) | same-website, same-website, same-website, same-website, same-website | Distinct TOTEM branch in Versoix (Chemin de la Scie 2) with its own address, different from the other five TOTEM sites; S59 chain list shows exists, open, bouldering and address; OSM node pin at building precision. |
| Switzerland | ch-083 Planet Climbing Lancy (Petit-Lancy) | related-name-nearby, same-website | Distinct Planet Climbing branch (Avenue des Morgines 10, Petit-Lancy), 2.8 km from Plan-les-Ouates (ch-060) with its own address; S56 chain list shows exists, open, bouldering and address. The Planet Climbing site descr… |
| Switzerland | ch-060 Planet Climbing Plan-les-Ouates (Plan-les-Ouates) | related-name-nearby, same-website, single-source | Distinct Planet Climbing branch (Route de la Galaise 13B, Plan-les-Ouates), 2.8 km from Lancy (ch-083). Single-source: S56 is the chain official site, shows hours, address and prices, and describes the venue as a "salle… |
| Switzerland | ch-079 Vertic-Halle Saxon (Saxon) | same-website, same-website | Distinct Vertic-Halle branch in Saxon (Ch. de la Plâtrière 25D per the site; the candidate address is empty) from Monthey and Baltschieder. S65 chain site shows hours, and the Saxon page says it has 3 bloc zones alongsi… |
| Switzerland | ch-080 Vertic-Halle Monthey (Monthey) | same-website, same-website | Distinct Vertic-Halle branch (Route du Triboulet 10, Monthey) with its own address; the S65 Monthey page describes a 500 m2 bloc area with walls up to 4.5 m and gives hours. |
| Switzerland | ch-081 Vertic-Halle Baltschieder (Baltschieder) | same-website, same-website | Distinct Vertic-Halle branch (Eschigrund 4, Baltschieder) with its own address; the S65 Baltschieder page describes a 500 m2 bloc area and gives hours. |
| Switzerland | ch-015 thurclimb (Weinfelden) | limited-access | Club wall (Kletterclub Weinfelden) but public: S11 own site lists day tickets (single entry, bouldering CHF 10) and public evening hours, and offers bouldering. Pin is the OSM node. |
| Switzerland | ch-016 Kletterhalle SAC Bodan (Kreuzlingen) | limited-access | Club hall (SAC Bodan, Kreuzlingen) that is public: S12 shows CHF 5 day tickets for non-members, public hours (Tue, Thu, Fri evenings; Wed seasonal) and the boulder room added in 2020. Limited hours only. |
| Switzerland | ch-024 Kletterhalle Rätikon (Küblis) | limited-access | Club hall (SAC Prättigau) open to all: S20 states it is open to everyone seven days a week since January 2026 with day tickets in the online shop, and lists a bouldering area. Exact hours and prices are on a subpage I d… |
| Switzerland | ch-043 Blockchäfer (Windisch) | limited-access | Volunteer-run SAC Brugg-linked hall but public: S39 states individual day passes and subscriptions, open every day, with over 100 boulder problems. |
| Switzerland | ch-053 Bouldergate Ettiswil (Ettiswil) | limited-access, single-source | Member-run Verein hall that sells day tickets: S49 states non-members can use day tickets (register before each visit), members 24/7. Single-source: S49 official site shows exists, open and bouldering. Pin is the map on… |
| Switzerland | ch-054 Kletterhalle Wolhusen (Wolhusen) | limited-access | SAC Entlebuch hall inside the Connection Wolhusen fitness centre: S50 states day visitors and non-members are welcome, lists weekly hours, and a boulder room reached from the climbing hall. Prices are not on that page; … |
| Switzerland | ch-058 Orbit Interlaken (Wilderswil) | single-source | Single-source: S54 official site (re-read) shows exists and open (daily hours, day pass from CHF 24) and bouldering (650 m2 bouldering area plus 300 m2 rope wall). Pin is the Google Maps pin linked from the site; the st… |
| Switzerland | ch-087 Alpha Boulder (Giubiasco) | single-source | Single-source: S70 official site (re-read) shows exists, winter/summer schedules and prices, and bouldering (500 m2 of walls, boulder routes at five levels, Moonboard). Pin is the gym-site map embed (46.17278, 8.99829) … |
| Thailand | th-001 Balance Climbing Rama 9 (Huai Khwang) | related-name-nearby, same-website | Distinct Balance Climbing branch from th-002: BAL official site lists Rama 9 (1st Floor, The Shoppes at Belle, 131 Rama 9 Rd) as its own branch with its own address, daily 10:00-22:00 hours and a Bouldering only label. … |
| Thailand | th-002 Balance Prime (Yannawa) | related-name-nearby, same-website | Distinct Balance Climbing branch from th-001: BAL official site lists Sathorn (9th Floor, Sathorn Prime Building, Yannawa) as its own branch with hours and a Bouldering only label. Pin is OSM node 13718179679; the offic… |
| Thailand | th-005 Stonegoat Climbing Gym (The PARQ) (Khlong Toei) | importer-probable-duplicate, name-match, name-match, single-source | Distinct branch: Stonegoat The PARQ, Room 201, 2nd Floor, The PARQ, 88 Ratchadaphisek Rd (Khlong Toei), versus seed-1752 and th-004 which are the S69 branch at 36/3 Sukhumvit 69 Alley, about 3.8-4.3 km away. Single-sour… |
| Thailand | th-009 Boulder Planet Thailand (Rangsit) (Thanyaburi) | single-source | Single-source, and that source is primary: BP official site (re-read) is titled a boulder climbing gym, the first-timers page sells entry passes to Boulder Planet Rangsit, and it lists the Future Park Rangsit address an… |
| Türkiye | tr-004 Boulder Jungle (Kepez) | single-source | Single source, but BJ is the gym's own official site: re-read the home, price and contact pages on 2026-10-01; it calls itself Antalya's first bouldering gym (opened 17 Dec 2022), lists current day pass, membership and … |
| Türkiye | tr-005 Tragos Boulder (Çankaya) | single-source | Single source, but TG is the gym's own official site: its FAQ says the gym is mainly boulder (rope area planned later), day entries need no booking, and the contact page lists weekday 13:00-21:00 and weekend 12:00-20:00… |

## 3. Rejected (3)

| Country | Candidate | Code | Reason |
|---|---|---|---|
| Russia | ru-023 Severnaya Stena Bukharestskaya (Saint Petersburg (Bukharestskaya)) | closed | Closed: S SV own site marks the Bukharestskaya hall (Fuchika 10) as closed from 20 May 2026 (re-opened), confirmed by news N1 and N2 (lease ended). Rule: reject closed. |
| Russia | ru-024 El Capitan (Saint Petersburg (Ploshchad Lenina)) | closed | Closed on 30 April 2026 per news N2 and N1; no gym-owned page is reachable (domain parked) and bouldering is unknown, so it could not be accepted anyway. Rule: reject closed. |
| Singapore | sg-027 Ark Bloc (Punggol) | outdoor-area | S15 own site calls Ark Bloc 'Singapore's largest outdoor gym' (calisthenics, strongman and a bouldering section); category other and outdoor/open-air, not an indoor bouldering gym. Rule H: not eligible. |

## 4. Deferred — not added now (30)

| Country | Candidate | Reason |
|---|---|---|
| India | in-004 Equilibrium Climbing Station Hoodi (Hoodi, Whitefield) | coordinate unresolved: the only pin is the 4-decimal geo in the gym's own structured data (12.9916, 77.71), weak-coordinates flag, no OSM element for this gym and no building-level cross-check (rever… |
| India | in-007 Elevate - The Climbing Company (Begur, Bengaluru) | Owner rule on storefront pages: the gym-run MyTribe storefront (S11) is accepted as official evidence of the LOCATION (it agrees within ~10 m with OSM way 1065763489 "Elevate", sport=climbing), but n… |
| India | in-008 Bangalore Boulder (Malleshwaram, Bengaluru) | Two open issues. (1) Address: the recorded street address (15th Cross, 8th Main Rd) comes from an unsourced directory and conflicts with OSM (10th Main Rd) and the founder storefront geo (~240 m sout… |
| India | in-013 Rock Aliens Climbing Gym (Shivajinagar, Pune) | coordinate unresolved and bouldering evidence too thin: the pin (18.5327, 73.8332) is the site platform's business location labelled 'Laxmi Society, Model Colony', while the visible address is 'Arun … |
| India | in-014 SMJV Bouldering & Climbing Wall (GGIM) (Agharkar Road, Pune) | limited-access not resolved: S8 says only that the SMJV wall inside Shri Mahaveer Jain Vidyalaya is 'open for all who wish to learn', with no public hours, drop-in or day pass, price or booking route… |
| Indonesia | id-007 Bali Boulder (Sanur, Denpasar) | Open status rests on an inferred year: the own site says soft opening August 5th but never prints the year; the 2026 reading comes from site edit dates and lapsed pricing. Re-check for a dated openin… |
| Indonesia | id-008 Boulder Climbing Gym Boxies 123 (Bogor) | Primary bouldering evidence missing: the mall page (BX) shows an indoor climbing area open daily but never lists disciplines; bouldering is only mentioned by non-primary local news. Also the pin is t… |
| Indonesia | id-009 Bali Climbing Bouldering Gym Canggu (Canggu) | Open status not confirmed: no primary source shows it is open now (old website now redirects to an unrelated gambling site and must not be used; the Instagram @baliclimbing evidence only supports exi… |
| Russia | ru-015 Sportstation Climbing (Moscow (Dubrovka)) | Primary bouldering evidence could not be re-verified: station.club currently serves a Timeweb parked-domain page with no climbing content for me (https fails certificate, http redirects to the parkin… |
| Singapore | sg-015 Climb Central The Kallang (Kallang) | Bouldering unknown for Climb Central The Kallang: S6 official site lists the outlet (address, hours) but only says chain-wide 'top rope, boulder, lead climb, auto-belays' without naming outlets; the … |
| Singapore | sg-016 Climb Central Funan (City Hall) | Bouldering unknown for Climb Central Funan: S6 official site lists the outlet (address, hours) but only says chain-wide 'top rope, boulder, lead climb, auto-belays' without naming outlets; the per-ou… |
| Singapore | sg-017 Climb Central Novena (Novena) | Bouldering unknown for Climb Central Novena: S6 official site lists the outlet (address, hours) but only says chain-wide 'top rope, boulder, lead climb, auto-belays' without naming outlets; the per-o… |
| Singapore | sg-018 Climb Central SAFRA Choa Chu Kang (Choa Chu Kang) | Bouldering unknown for Climb Central SAFRA Choa Chu Kang: S6 official site lists the outlet (address, hours) but only says chain-wide 'top rope, boulder, lead climb, auto-belays' without naming outle… |
| Singapore | sg-021 Outpost Climbing (Bugis) | Primary bouldering evidence too thin: S9 outpostclimbing.sg home page is client-rendered with no readable content (no address, hours or offering); the only readable page is /bouldering-mechanics-and-… |
| Sweden | se-029 F11 Klätterverkstad (Nyköping) | Limited access not cleared: S F11 own site (re-read) shows only two advertised 'prova på' try-out dates (11 and 25 Oct) and a member wall-card for unlocking the hall; no regular drop-in, day pass or … |
| Sweden | se-039 Karlstad Klätterklubb (K3) (Karlstad) | Owner decision 2026-10-01: defer, not reject. Its own hall page (S KARLSTAD, re-read 2026-10-01) says a guest card can only be bought together with a K3 member, and entry is by key (cafeteria or Rack… |
| Switzerland | ch-078 Pan de Vevey (Vevey) | Public access not shown: S64 (lepandevevey.org) only tells visitors to register ("s'inscrire") for the association/membership model and gives hours; no day pass, drop-in or guest access is shown. Nee… |
| Switzerland | ch-059 Momentum Olten (Olten) | Status unclear: S55 official site (re-read 2026-10-01) still shows a "vorübergehend geschlossen" notice with "Wiedereröffnung am 27. September 2026", a date already past. The hall exists and has 300 … |
| Switzerland | ch-061 GLKB Boulderhalle (lintharena) (Näfels) | Coordinate unresolved: the pin is the OSM node for lintharena Kletterhalle 1 at street precision. S57 (re-read) lists only one site address (Oberurnerstrasse 14) and does not say which building holds… |
| Switzerland | ch-003 Mitō Bouldering Zürich (Zürich) | Opening status unclear: S2 (re-read) says the hall "entsteht" (is being created) and calls it "the new boulder hall", yet lists daily hours and sells day passes and memberships; no opening date or da… |
| Switzerland | ch-035 BoulderBurg (Burgdorf) | Not yet open: S31 states BoulderBurg opens at Dunantstrasse 4 on the weekend of 17/18 October 2026, after the review date of 2026-10-01. Re-review after the opening. |
| Thailand | th-008 Climb Central Bangkok (Bang Khae) | Primary bouldering evidence too thin: CCFB Facebook page only shows a newly opened air-conditioned sport climbing facility (no bouldering, no hours); the official site climbcentral.co.th fails with a… |
| Thailand | th-010 Bloc City Climbing Gym (Pathum Wan) | Primary bouldering evidence too thin: BLOCIG Instagram page exists (2,298 followers, 37 posts) but its bio is not readable, so neither open status nor any bouldering or rope offer is shown by a prima… |
| Thailand | th-014 UPSIDE Bouldering Gym (Koh Phangan) | Open status rests on an inferred year: the own client-rendered site shows a Grand Opening September 1st badge with no year (content read from the JS bundle). Re-check for a dated opening or a readabl… |
| Thailand | th-015 Ascentory (Mueang Khon Kaen) | No open evidence: ASC Linktree (re-read) calls it a Khon Kaen bouldering gym and gives the address and a Google map, but shows no hours, post dates or other sign it is operating; only a directory (DI… |
| Thailand | th-016 No Gravity Indoor Climbing (Chang Moi, Mueang Chiang Mai) | Cannot establish identity, status or bouldering: the only source is OSM way 313552110 (Bing-sourced building, no address or website, last edited 2014); the Facebook page is unreadable and one directo… |
| Türkiye | tr-003 DuvarX (Maltepe) | Primary bouldering evidence too thin: DX (official one-page site) shows prices and hours but never says bouldering or any rope offer; the only support is non-primary (blog, event listing) and the Mul… |
| Türkiye | tr-006 Climbinn (Bornova) | Primary bouldering evidence too thin: CB (official site) shows prices and shoe/chalk-bag rental but never states bouldering or rope climbing; MSB is only a directory listing. Needs primary proof of a… |
| Türkiye | tr-008 Mozaik Climbing & Bouldering (Konyaaltı) | Limited access unresolved: MZ (official site) shows posted hours (Mon-Fri 14:00-21:30, Sat 11:00-19:00), an indoor bouldering area, classes and birthday parties, but no drop-in, day-pass, guest or pr… |
| Türkiye | tr-009 Kısakaya Ankara Tırmanış Evi (Yaşamkent, Çankaya) | Own site says the gym is moving and temporarily closed; the new venue and its pin are not confirmed. Re-research once it reopens (a temporarily closed gym is not a temporary venue). |

## 5. Same as a gym already on Bouldeer (33) — not added

13 of these carry a pin correction for the existing gym; those are a separate, later location-update batch (`location-update-followups.md`), not part of this import.

| Country | Candidate | Existing Bouldeer gym | Note |
|---|---|---|---|
| India | in-010 Crag Studio Gachibowli (Gachibowli, Hyderabad) | seed-1583 Crag Studio | pin fix (separate batch) |
| Israel | il-002 Performance Rock Beer Sheva (Beer Sheva) | seed-1590 Performance Rock | pin fix (separate batch) |
| Israel | il-009 Monkeys Netanya (Netanya) | seed-1596 Monkeys climbing gym | pin fix (separate batch) |
| Israel | il-012 Venga (Petah Tikva) | seed-1597 Venga | pin fix (separate batch) |
| Russia | ru-001 BigWall Dinamo (Moscow (Dinamo)) | seed-1489 Skalodrom Bigwallsport na Dinamo |  |
| Russia | ru-004 Limestone (Moscow (Baumanskaya)) | seed-1487 Climbing wall Limestone |  |
| Russia | ru-013 Rock Zona Boulder House (Moscow (Kolomenskaya)) | seed-1488 RockZona boulderhouse |  |
| Russia | ru-018 Igels (Saint Petersburg (Baltiyskaya)) | seed-1491 Klub Igels | pin fix (separate batch) |
| Russia | ru-020 Tramontana (Saint Petersburg (Tekhnologichesky Institut)) | seed-1493 Skalodrom Tramontana | pin fix (separate batch) |
| Russia | ru-022 Severnaya Stena Petrogradskaya (Saint Petersburg (Petrogradskaya)) | seed-1492 Severnaya Stena Petrogradskaya Skalodrom | pin fix (separate batch) |
| Singapore | sg-020 Ground Up Climbing (Farrer Park) | seed-1731 Ground Up Climbing |  |
| Sweden | se-004 Klätterverket Gasverket (Stockholm) | seed-1106 Klätterverket Gasverket |  |
| Sweden | se-006 Bouldering Sthlm (Johanneshov) | seed-1105 Bouldering Stockholm |  |
| Sweden | se-010 Klätterfabriken (Göteborg) | seed-1104 Klätterfabriken High Sports | pin fix (separate batch) |
| Sweden | se-011 Klätterdomen (Göteborg) | seed-1103 Klätterdomen AB |  |
| Sweden | se-012 Fysiken Klätterlabbet (Göteborg) | seed-1102 Fysiken Klätterlabbet Centrum |  |
| Sweden | se-013 Backa Boulder (Göteborg) | seed-1101 Backa Boulder |  |
| Sweden | se-019 Malmö Klätterklubb (Malmö) | seed-1107 Malmö Klätterklubb |  |
| Switzerland | ch-001 Minimum Flüela (Zürich) | seed-1292 Minimum - Flüela Zürich |  |
| Switzerland | ch-002 Minimum Leutsch (Zürich) | seed-1293 Minimum - Zürich Leutsch |  |
| Switzerland | ch-012 Kletterhalle 6a plus (Winterthur) | seed-1298 6a plus - Winterthur |  |
| Switzerland | ch-013 BLOCKFELD Boulderpark (Winterthur) | seed-1299 Blockfeld Boulderpark & Bistro |  |
| Switzerland | ch-025 bimano boulder (Bern) | seed-1296 Bimano - Zentweg |  |
| Switzerland | ch-026 BoulderBad Muubeeri (Bern) | seed-1297 BoulderBad Muubeeri - Bern |  |
| Switzerland | ch-046 Kletterhalle 7 (Basel) | seed-1295 Kletterhalle 7 - Basel |  |
| Switzerland | ch-047 ELYS Boulderloft (Basel) | seed-1294 ELYS Boulderloft - Basel |  |
| Thailand | th-004 Stonegoat Climbing Gym (S69) (Phra Khanong) | seed-1752 Stonegoat Climbing Gym | pin fix (separate batch) |
| Thailand | th-006 Urban Playground Climbing (Watthana) | seed-1754 Urban Playground Climbing | pin fix (separate batch) |
| Thailand | th-007 Rock Domain Climbing Gym (Bang Na) | seed-1695 Rock Domain Climbing Gym | pin fix (separate batch) |
| Thailand | th-011 Progression Vertical Climbing Gym (Pa Daet, Mueang Chiang Mai) | seed-1698 Progression Vertical | pin fix (separate batch) |
| Thailand | th-012 REBEL Rock Climbing (Thalang) | seed-1700 Rebel Rock Climbing | pin fix (separate batch) |
| Türkiye | tr-002 Boulderhane (Levent, Şişli) | seed-1726 Boulderhane |  |
| Türkiye | tr-007 Boulder Eskişehir (Odunpazarı) | seed-1728 BoulderEs |  |

## 6. The 179 gyms that will be added

### India (10)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| in-001 | BoulderBox | Vasant Kunj, New Delhi | ready | osm |
| in-002 | Climb Central Gurugram | Gurugram | review | official-map |
| in-003 | Climb Central Bengaluru | Whitefield, Bengaluru | review | official-map |
| in-005 | Equilibrium Climbing Station Indiranagar | Indiranagar, Bengaluru | review | osm |
| in-006 | Equilibrium Climbing Station Goa | Anjuna | ready | osm |
| in-009 | The Indian Bouldering Company | Fort, Mumbai | review | official-map |
| in-011 | Crag Studio Mettuguda | Mettuguda, Secunderabad | review | official-map |
| in-012 | Fit Rock Arena Chetpet | Chetpet, Chennai | ready | official-map |
| in-015 | Climb City | Sector 132, Noida | review | official-map |
| in-016 | Boulder 21 | Nerul, Navi Mumbai | review | official-map |

### Indonesia (6)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| id-001 | Boulder Planet Indonesia | Jakarta Barat | review | official-map |
| id-002 | Indoclimb FX Sudirman | Jakarta Pusat | review | official-map |
| id-003 | Indoclimb Kuningan City | Jakarta Selatan | review | official-map |
| id-004 | Indoclimb Lippo Mall Kemang | Jakarta Selatan | review | official-map |
| id-005 | Dreamstone Boulders Alam Sutera | Tangerang | review | official-map |
| id-006 | Goodang Bouldering | Katapang, Kabupaten Bandung | review | official-map |

### Israel (9)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| il-001 | Performance Rock Tel Aviv | Tel Aviv | review | osm |
| il-003 | Performance Rock Haifa | Haifa | review | official-map |
| il-004 | VKING Tel Aviv | Tel Aviv | review | official-map |
| il-005 | The Bloc Tel Aviv | Tel Aviv | review | osm |
| il-006 | The Bloc Jerusalem | Jerusalem | review | osm |
| il-007 | Urban Climbing Rehovot | Rehovot | review | official-map |
| il-008 | Urban Climbing Jerusalem | Jerusalem | review | official-map |
| il-010 | iClimb Rishon LeZion | Rishon LeZion | review | official-map |
| il-011 | Roca Climbing Club | Kibbutz Afikim | review | official-map |

### Russia (20)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| ru-002 | BigWall Riviera | Moscow (Avtozavodskaya) | review | official-map |
| ru-003 | BigWall Gavan | Moscow (Vodny Stadion) | review | official-map |
| ru-005 | Climb Lab Butyrskaya | Moscow (Butyrskaya) | review | osm |
| ru-006 | Climb Lab Aminyevskaya | Moscow (Aminyevskaya) | review | official-map |
| ru-007 | Atmosfera | Moscow (Nagornaya) | ready | osm |
| ru-008 | Tokyo ClimbIN | Moscow (Dmitrovskaya) | ready | osm |
| ru-009 | Staraya Shkola | Moscow (Shosse Entuziastov) | review | official-map |
| ru-010 | Tengu's Michurinsky Prospekt | Moscow (Michurinsky prospekt) | review | official-map |
| ru-011 | Tengu's Yuzhnaya | Moscow (Yuzhnaya) | review | official-map |
| ru-012 | Tengu's Maryina Roshcha | Moscow (Maryina Roshcha) | review | official-map |
| ru-014 | CSKA Climbing Centre | Moscow (CSKA / Sokol) | ready | osm |
| ru-016 | Ekstrim Climbing Gym | Moscow (Smolnaya) | ready | osm |
| ru-017 | Luch | Saint Petersburg (Krestovsky Island) | ready | osm |
| ru-019 | Neolit | Saint Petersburg (Pionerskaya) | ready | osm |
| ru-021 | Energiya Vysoty | Saint Petersburg (Mezhdunarodnaya) | ready | osm |
| ru-025 | ClimbArt | Saint Petersburg (Nauki prospekt) | review | official-map |
| ru-026 | Rock and Wall (bouldering hall) | Yekaterinburg (Geologicheskaya) | ready | osm |
| ru-027 | Kray Sveta | Yekaterinburg (Tveritina) | ready | osm |
| ru-028 | Iskra Center | Chelyabinsk (Kaliber) | review | official-map |
| ru-029 | Iskra Severok | Chelyabinsk (Focus mall) | review | official-map |

### Singapore (20)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| sg-001 | Boulder Movement Downtown | Downtown Core | review | osm |
| sg-002 | Boulder Movement Bugis | Bugis | review | osm |
| sg-003 | Boulder Movement Rochor | Rochor | review | osm |
| sg-004 | Boulder Movement Tai Seng | Tai Seng | review | osm |
| sg-005 | boulder+ Aperia | Kallang | review | osm |
| sg-006 | boulder+ The Chevrons | Boon Lay | review | osm |
| sg-007 | Boulder Planet Sembawang | Sembawang | review | osm |
| sg-008 | Boulder Planet Tai Seng | MacPherson | review | osm |
| sg-009 | BFF Climb Bendemeer | Kallang | review | osm |
| sg-010 | BFF Climb Tampines Hub | Tampines | review | osm |
| sg-011 | BFF Climb Tampines Yoha | Tampines | review | osm |
| sg-012 | fit · bloc Kent Ridge | Kent Ridge | review | osm |
| sg-013 | fit · bloc Depot Heights | Bukit Merah | review | osm |
| sg-014 | fit · bloc Telok Ayer | Telok Ayer | review | official-map |
| sg-019 | Kinetics Climbing | Serangoon Road | ready | osm |
| sg-022 | Lighthouse Climbing | Pasir Panjang | ready | osm |
| sg-023 | OYEYO Boulder Home | Mackenzie Road | ready | osm |
| sg-024 | Z-Vertigo Boulder Gym | Bukit Timah | ready | osm |
| sg-025 | Climba | Raffles Place | ready | osm |
| sg-026 | Project Send | Esplanade | ready | osm |

### Sweden (31)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| se-001 | Klättercentret Solna | Solna | ready | osm |
| se-002 | Klättercentret Telefonplan | Hägersten | review | osm |
| se-003 | Klättercentret Akalla | Kista | ready | osm |
| se-005 | Klätterverket Sickla | Nacka | ready | osm |
| se-007 | Moumo | Stockholm | ready | osm |
| se-008 | Karbin Klätterhall | Stockholm | ready | osm |
| se-009 | BLX Bouldering Club | Solna | review | official-map |
| se-014 | Klättercentret Partille | Partille | ready | osm |
| se-015 | Kungsbacka Klättercenter | Kungsbacka | review | official-map |
| se-016 | Klättercentret Malmö | Malmö | ready | osm |
| se-017 | Klättercentret Helsingborg | Helsingborg | review | chain-store-list |
| se-018 | Beta Boulders Malmö | Malmö | ready | osm |
| se-020 | Skånes Klätterklubb | Lund | review | osm |
| se-021 | C4 Climbing | Kristianstad | review | osm |
| se-022 | Urban Boulders | Linköping | ready | osm |
| se-023 | Hangaren Klätterhall | Linköping | review | osm |
| se-024 | Klätterhallen i Norrköping | Norrköping | review | official-map |
| se-025 | Klättra Motala Klätterhall | Motala | review | official-map |
| se-026 | Örebro Klättergym | Örebro | ready | osm |
| se-027 | Klättercentret Västerås | Västerås | ready | osm |
| se-028 | Klättercentret Uppsala | Uppsala | ready | osm |
| se-030 | Mono Loco | Falun | ready | osm |
| se-031 | Fyshuset Klätterhall | Gävle | review | official-map |
| se-032 | Östersunds Klättercenter | Östersund | ready | osm |
| se-033 | Åre Klätterhall | Duved | ready | osm |
| se-034 | Klätterhuset | Luleå | ready | osm |
| se-035 | Klättervigören | Jönköping | review | official-map |
| se-036 | Racketcentrum (RC Sport klättring) | Jönköping | ready | osm |
| se-037 | Wallride | Växjö | review | official-map |
| se-038 | Halmstad Klätterklubb | Halmstad | review | osm |
| se-040 | Höglandsklättrarna Tranås (Klättersilon) | Tranås | review | official-map |

### Switzerland (74)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| ch-005 | Boulderlounge Schlieren | Schlieren | review | osm |
| ch-006 | Boulderlounge St. Gallen | St. Gallen | review | osm |
| ch-017 | Kletterzentrum St. Gallen | St. Gallen | review | osm |
| ch-007 | Kletterzentrum Gaswerk Schlieren | Schlieren | review | osm |
| ch-008 | Kletterzentrum Gaswerk Greifensee | Greifensee | review | osm |
| ch-009 | Kletterzentrum Gaswerk Wädenswil | Wädenswil | review | osm |
| ch-041 | Kraftreaktor Lenzburg | Lenzburg | review | osm |
| ch-042 | Kraftreaktor Aarau | Aarau | review | osm |
| ch-062 | Grimper.ch Lausanne-Beaulieu | Lausanne | review | osm |
| ch-063 | Grimper.ch Echandens (Rocspot) | Echandens | review | osm |
| ch-064 | Grimper.ch Villeneuve | Villeneuve | review | osm |
| ch-065 | Grimper.ch Givisiez (Bloczone) | Givisiez | review | osm |
| ch-066 | Le Hangar (Grimper.ch Fribourg) | Fribourg | review | osm |
| ch-067 | Grimper.ch Meyrin-Satigny | Satigny | review | official-map |
| ch-068 | TOTEM Ecublens | Ecublens | review | osm |
| ch-069 | TOTEM Gland | Gland | review | osm |
| ch-070 | TOTEM Vevey | Vevey | review | osm |
| ch-071 | TOTEM Meyrin | Meyrin | review | osm |
| ch-072 | TOTEM Vernier (Le Môll) | Vernier | review | osm |
| ch-073 | TOTEM Versoix | Versoix | review | osm |
| ch-083 | Planet Climbing Lancy | Petit-Lancy | review | osm |
| ch-060 | Planet Climbing Plan-les-Ouates | Plan-les-Ouates | review | official-map |
| ch-079 | Vertic-Halle Saxon | Saxon | review | osm |
| ch-080 | Vertic-Halle Monthey | Monthey | review | osm |
| ch-081 | Vertic-Halle Baltschieder | Baltschieder | review | osm |
| ch-015 | thurclimb | Weinfelden | review | osm |
| ch-016 | Kletterhalle SAC Bodan | Kreuzlingen | review | osm |
| ch-024 | Kletterhalle Rätikon | Küblis | review | osm |
| ch-043 | Blockchäfer | Windisch | review | osm |
| ch-053 | Bouldergate Ettiswil | Ettiswil | review | official-map |
| ch-054 | Kletterhalle Wolhusen | Wolhusen | review | osm |
| ch-058 | Orbit Interlaken | Wilderswil | review | official-map |
| ch-087 | Alpha Boulder | Giubiasco | review | official-map |
| ch-030 | Climbox Langnau | Langnau im Emmental | ready | osm |
| ch-038 | Magnet Trainingszentrum für Sportkletterer | Niederwangen | ready | osm |
| ch-077 | Escalade Chavornay | Chavornay | ready | osm |
| ch-085 | L'Entrepôt | Bulle | ready | osm |
| ch-004 | GrindelBoulder | Bassersdorf | ready | osm |
| ch-010 | Boulderhalle Adliswil | Adliswil | ready | osm |
| ch-011 | GRIFFIG Kletterhalle Uster | Uster | ready | osm |
| ch-014 | ARANEA+ Kletterzentrum | Schaffhausen | ready | osm |
| ch-018 | Quergang | Jona | ready | osm |
| ch-019 | Sparta Bouldering | Buchs | ready | osm |
| ch-020 | Boulder Box | Unterwasser | ready | osm |
| ch-021 | Kletterhalle Appenzeller Park | Herisau | ready | osm |
| ch-022 | Kletterzentrum Ap'n Daun | Chur | ready | osm |
| ch-023 | Quadrel | Domat/Ems | ready | osm |
| ch-027 | O'Bloc | Ostermundigen | ready | osm |
| ch-028 | boulderkino | Thun | ready | osm |
| ch-029 | griffbar Boulderwand Thun | Steffisburg | ready | osm |
| ch-031 | BoulderWorb | Worb | ready | osm |
| ch-032 | Boulderpark Schwarzenburg | Schwarzenburg | ready | osm |
| ch-033 | BoulderSchüür Lenk | Lenk im Simmental | ready | osm |
| ch-034 | Manola Boulder | Langenthal | ready | osm |
| ch-036 | Kletterhalle Haslital | Meiringen | ready | osm |
| ch-037 | GRIP Climbing | Biel/Bienne | ready | osm |
| ch-039 | Forum Sumiswald | Sumiswald | ready | osm |
| ch-040 | BOUBA Boulder Baden | Baden | ready | osm |
| ch-044 | ISATIS Kletterhalle | Aarburg | ready | osm |
| ch-045 | bimano solothurn | Biberist | ready | osm |
| ch-048 | B2 Boulders & Bar | Pratteln | ready | osm |
| ch-049 | Hebdi | Liestal | ready | osm |
| ch-050 | CITY BOULDER | Kriens | ready | osm |
| ch-051 | Pilatus Indoor | Root | ready | osm |
| ch-052 | Boulder Arena Sursee | Sursee | ready | osm |
| ch-055 | BoulderBaar | Baar | ready | osm |
| ch-056 | Spinnerei Indoor | Ibach | ready | osm |
| ch-057 | Granit Indoor | Schattdorf | ready | osm |
| ch-074 | Le Cube | Le Mont-sur-Lausanne | ready | osm |
| ch-075 | La Pile | Yverdon-les-Bains | ready | osm |
| ch-076 | Gecko Escalade | Sottens | ready | osm |
| ch-082 | Structure Pan d'Escalade | Vernier | ready | osm |
| ch-084 | C+ Urban Climbing | Colombier | ready | osm |
| ch-086 | BlocUp | Delémont | ready | osm |

### Thailand (6)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| th-001 | Balance Climbing Rama 9 | Huai Khwang | review | official-map |
| th-002 | Balance Prime | Yannawa | review | osm |
| th-003 | Eagle Eye Climbing Gym | Bangkok Yai | ready | osm |
| th-005 | Stonegoat Climbing Gym (The PARQ) | Khlong Toei | review | official-map |
| th-009 | Boulder Planet Thailand (Rangsit) | Thanyaburi | review | official-map |
| th-013 | The Bunker Koh Tao | Koh Tao | ready | osm |

### Türkiye (3)

| cid | Name | City | Reconcile class | Pin source |
|---|---|---|---|---|
| tr-001 | Boulder Istanbul | Kadıköy | ready | osm |
| tr-004 | Boulder Jungle | Kepez | review | official-map |
| tr-005 | Tragos Boulder | Çankaya | review | official-map |

## 7. How to sign off

1. Tell Claude "Wave 1 signed off" (optionally list any decision to change first — e.g. "defer th-014 instead").
2. Claude sets `reviewer` to you in the nine `review.json` files (no decision changes unless you asked), re-runs reconcile + the dry run, commits, and opens a PR.
3. Then the import, one country at a time (9 batches, smallest first): `research stage` → validate → plan (commit) → `import --dry-run` with the service-role key in your terminal (prints a confirmation token) → your go-ahead → `import --apply --confirm <token> --i-understand-this-writes-to-production` → automatic read-back verification → `build-index --live` → commit. Claude gives you the exact copy-paste commands for each batch.
