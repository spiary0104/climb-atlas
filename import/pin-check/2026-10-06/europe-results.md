# Pin check 2026-10-06: Europe (DE, NO, CH, RO, FR, IT, GR, BG, BY)

69 gyms (`targets-europe.json`). Verdicts: **fix 50**, **confirmed 8** (4 address-only updates for CH gyms with no address; 4 with no record needed), **retire 0**, **manual 11**.
Records: `import/batches/2026-10-05-pin-check-europe/records.ndjson` (54 update records; the batch folder is stamped 2026-10-05 by the CLI). Manual gyms: `MANUAL-CHECK-europe.md`.
Format: id | name | verdict | distance moved / pin check | source. OSM = OpenStreetMap element (Nominatim lookup); house node = Nominatim house-number geocode of the official address.

## Fix and confirmed
- g-04a7320e40 | O'Bloc | confirmed (pin 8 m from gym element; address-only update) | obloc.ch/impressum (o'bloc AG, Forelstrasse 11); pin 8 m from OSM way 443636191 (O'Bloc, same street)
- g-104902e680 | Le Cube | confirmed (pin 0 m from gym element; address-only update) | lecube.ch (Accès: Rionzi 52A, 1052 le Mont-sur-Lausanne); pin identical to OSM node 6528468877 (Le Cube, Chemin du Rionzi 52)
- g-663777c19b | GRIFFIG Kletterhalle Uster | confirmed (pin 0 m from gym element; address-only update) | griffig.com/impressum and /anfahrt (Hallenbadweg 2, 8610 Uster); pin identical to OSM way 436155626
- g-8df63dd5be | Boulder Arena Sursee | confirmed (pin 0 m from gym element; address-only update) | arenasursee.ch/kontakt (Arena Sursee Padel, Boulder, Badminton: Wassergrabe 5, 6210 Sursee); pin identical to OSM node 11583934950
- seed-1003 | Der Steinbock Zirndorf | fix | moved 438 m + address | dersteinbock-zirndorf.de/impressum (Steinweg 9, 90513 Zirndorf); OSM node 9396883198 (Der Steinbock Zirndorf, Steinweg 9)
- seed-1004 | Die Gämse | fix | moved 1107 m + address | diegaemse.de (Die Gämse, Schwartzkopffstr. 6, 15745 Wildau); OSM node 4403903511 (Die Gämse, same address)
- seed-1008 | Einstein Boulderhalle München | fix | moved 4987 m + address | muenchen.einstein-boulder.com/impressum (Landsberger Straße 185, 80687 München); OSM node 342211042 (Einstein Boulderhalle, same address)
- seed-1014 | FLASHH Hamburg | fix | moved 5493 m + address | flashh.de/impressum (FLASHH GmbH, Gasstraße 18, 22761 Hamburg); OSM node 2989461018 (FLASHH, same address)
- seed-1016 | Greifsbloc | fix | moved 2266 m + address | greifsbloc.jimdofree.com (Greifsbloc e.V., Am neuen Friedhof 11c, 17489 Greifswald); OSM node 4365045491 (Greifsbloc, same address)
- seed-1023 | Kletterarena Dresden | fix | moved 1102 m + address | kletterarena-dresden.de/impressum (Zwickauer Str. 42, 01069 Dresden); OSM way 112607861 (Kletterarena Dresden, same address)
- seed-1025 | KletterBar Offenbach | fix | moved 2495 m + address | kletterbar-offenbach.de/kontakt (Sprendlinger Landstr. 177 B, 63069 Offenbach); OSM node 13070986388 (KletterBar, 177b)
- seed-1028 | Kletterhalle High-east | fix | moved 12255 m + address | high-east.de/impressum and /anfahrt (Sonnenallee 2, 85551 Kirchheim bei München); OSM way 192454716 (High East, Sonnenallee 2, Heimstetten)
- seed-1043 | Linie7 | fix | moved 323 m + address | linie7.com/kontakt (Beim Handelsmuseum 9, Tor 43, 28195 Bremen); OSM way 236315461 (Linie 7 - Bouldern in Bremen, website linie7.com)
- seed-1045 | Magic Mountain | fix | moved 4186 m + address | magicmountain.de/kontakt (Magic Mountain Kletterhalle, Böttgerstraße 20, 13357 Berlin); OSM way 288222186 (Magic Mountain, 20-26 Böttgerstraße)
- seed-1052 | Ostbloc Boulderhalle | fix | moved 7019 m + address | ostbloc.de (Ostbloc GmbH, Hauptstraße 13, 10317 Berlin); OSM node 13381855493 (Ostbloc Boulderhalle, same address)
- seed-1055 | rockerei | fix | moved 6372 m + address | rockerei-stuttgart.de/impressum-agb (Stammheimerstr. 41, 70435 Stuttgart); OSM node 2012774424 (DAV Kletter- und Boulderzentrum Schwaben - Rockerei, website rockerei-stuttgart.de)
- seed-1058 | Salon du Bloc | fix | moved 2598 m + address | salondubloc.de/impressum (Eppendorfer Weg 4, 20259 Hamburg); OSM node 1423904063 (Salon du Bloc, same address)
- seed-1061 | Südbloc | fix | moved 6823 m + address | xn--sdbloc-3ya.de (Großbeerenstraße 2-10 / Haus 4, 12107 Berlin-Mariendorf); OSM way 531542904 (Südbloc Boulderhalle, 2-10 Großbeerenstraße)
- seed-1068 | Wiesbadener Nordwand | fix | moved 3649 m + address | wiesbadener-nordwand.de/impressum (Climb Loft GmbH, Hagenauer Straße 49, 65203 Wiesbaden); OSM node 2213492565 (Wiesbadener Nordwand, same address)
- seed-1069 | YOYO | fix | moved 1146 m + address | yoyo-kletterhalle.de (Weststraße 32, 01809 Heidenau); OSM way 294688688 (YOYO Kletterhalle, same address)
- seed-1070 | [cityrock] | fix | moved 1320 m + address | cityrock.de/kontakt (Fritz-Elsas-Strasse 44, 70174 Stuttgart); OSM node 412871459 (Cityrock, website cityrock.de)
- seed-961 | Bambule Kletterhalle | fix | moved 2609 m + address | bambule-kletterhalle.de/impressum (Industriestraße 21a, 90441 Nürnberg); OSM way 1246153412 (Bambule Kletterhalle, same address)
- seed-965 | BLOCKHAUS FREIBURG | fix | moved 3826 m + address | blockhaus-freiburg.de/impressum (Merdinger Weg 6, 79111 Freiburg); OSM node 3171491477 (Blockhaus, Merdinger Weg 6)
- seed-967 | Blockhelden Boulderhalle Erlangen | fix | moved 4572 m + address | blockhelden.de/boulderhalle-erlangen (BLOCKHELDEN Erlangen GmbH, Kurt-Albert-Straße 1, 91088 Bubenreuth); OSM way 946030057 (BLOCKHELDEN Boulderhalle Frankenjura, same address)
- seed-982 | BOULDERkitchen | fix | moved 3222 m + address | freiburg-boulderkitchen.de/impressum (boulderkitchen GmbH, Munzinger Straße 4, 79111 Freiburg); OSM node 2781007582 (boulderkitchen GmbH, same address)
- seed-984 | Boulders Habitat Beuel | fix | moved 2318 m + address | bouldershabitat.de/info-2 (Standort Beuel, Paulusstr. 22a, 53227 Bonn); OSM node 2298450278 (Boulders Habitat Beuel, Paulusstraße 22a)
- seed-985 | Boulders Habitat Bonn | fix | moved 2413 m + address | bouldershabitat.de/impressum (Boulders Habitat GmbH, Siemensstraße 20, 53121 Bonn); OSM node 4718814211 (Boulders Habitat, Siemensstraße 20)
- seed-989 | Boulderwelt Frankfurt | fix | moved 5925 m + address | boulderwelt-frankfurt.de/kontakt (August-Schanz-Straße 50, 60433 Frankfurt); OSM way 28299711 (Boulderwelt Frankfurt, same address)
- seed-990 | Boulderwelt München Ost | fix | moved 2373 m + address | boulderwelt-muenchen-ost.de/kontakt_anfahrt (Hanne-Hiob-Str.4, 81671 München); OSM way 1303745583 (Boulderwelt München Ost, same address)
- seed-993 | Café Kraft | fix | moved 4687 m + address | cafekraft.de/kontakt (Gebertstr. 9, 90411 Nürnberg); OSM node 1215867914 (Café Kraft, Gebertstraße 9)
- seed-995 | DAV Boulderzentrum Erlangen | fix | moved 1510 m + address | alpenverein-erlangen.de/kletteranlagen/dav-boulderzentrum-erlangen (Helene-Richter-Straße 5, 91052 Erlangen); OSM node 1602104556 at that address (Hanne-Jung-Kletterhalle, DAV Kletterturm/Boulderanlage adjoin)
- seed-997 | DAV Kletter- und Vereinszentrum Erlangen | fix | moved 2178 m + address | kletter-und-vereinszentrum.de (Hartmannstraße 116, 91052 Erlangen); OSM node 9424634217 (DAV Sparkassen Bergwelt, Hartmannstraße 116)
- seed-998 | DAV Kletterzentrum Hersbruck | fix | moved 552 m + address | raiffeisenbank-kletterwelt.de/kontakt (Raiffeisenbank Kletterwelt Hersbruck, Happurger Str. 17, 91217 Hersbruck); OSM way 674935190 (Raiffeisenbank Kletterwelt, same address)
- seed-1089 | Altissimo - Marseille | fix | moved 115 m | marseille.altissimo.fr (Altissimo Marseille, 27 Bd Gay Lussac, 13014 Marseille); OSM node 3814559036 (Altissimo, Boulevard Gay Lussac, sport=climbing)
- seed-1092 | Boite A Grimpe - Marseille | fix | moved 8085 m | boiteagrimpe.wixstudio.com/labag (31 Traverse des Mameluks, 13008 Marseille); OSM node 4585538161 (Boite à Grimpe, Traverse des Mamelucks)
- seed-1142 | Equilibrium Arrampicata Modena | confirmed (pin 0 m from gym element; no record) | equilibriumarrampicata.it (Via del Tirassegno, 31/E, 41122 Modena); pin identical to OSM house node 4712429909 (31 Via del Tirassegno)
- seed-1144 | Rock'n Fire climbing gym | fix | moved 2169 m | rockandfire.it/contatti (Via Monsignor Luigi della Valle, 41126 Modena); OSM node 4769411884 (Rock 'N Fire, Via Monsignore Luigi Della Valle)
- seed-1368 | Vulkan Klatresenter | fix | moved 1296 m + address | kolsaas.no/kontakt-vulkan-klatresenter (Vulkan 13, 0178 Oslo); OSM node 4069242216 (Vulkan klatresenter, website vulkanklatresenter.no)
- seed-1370 | Oslo Klatresenter | fix | moved 6738 m + address | osloklatresenter.no (Olaf Helsets vei 5, 0694 Oslo); OSM node 4798923966 (Oslo Klatresenter, website osloklatresenter.no)
- seed-1371 | Bergenshallen | fix | moved 4844 m + address | bergenklatreklubb.no/klatrehall/bergenshallen (Vilhelm Bjerknes' vei 24, 5081 Bergen); OSM way 124697034 (Bergenshallen building, same street)
- seed-1372 | Lehmkuhlhallen | fix | moved 2780 m + address | sammen.no Lehmkuhl treningssenter (Helleveien 30; klatrevegg); OSM way 359319461 (Lehmkuhlhallen building)
- seed-1373 | Bergen Klatresenter - Laksevåg | fix | moved 2884 m + address | bergenklatresenter.no (Bergen Klatresenter Laksevåg, Johan Berentsens vei 63, 5160 Laksevåg); OSM node 7265666685 (Bergen klatresenter Laksevåg, website bergenklatresenter.no)
- seed-1374 | Bergen Klatresenter - Kokstad | fix | moved 12355 m + address | bergenklatresenter.no (Bergen Klatresenter Fana, Kokstadveien 23A, 5257 Kokstad); OSM Nominatim house node 3125996006 (23 Kokstadvegen, Ytrebygda)
- seed-1375 | Trondheim Klatresenter | fix | moved 3544 m + address | trondheim-klatresenter.no redirects to gripklatring.no (Grip Leangen, Travbanevegen 7, 7061 Trondheim; Leangen = the large centre opened 2023-08-01); OSM node 2207456459 (Grip Leangen, website gripklatring.no)
- seed-1377 | Trondheim Buldresenter | fix | moved 2716 m + address | buld.no (Trondheim Buldresenter, Ormen langes vei 15, 7041 Trondheim; operator Ute på tur AS); OSM Nominatim house node 2958668700 (15 Ormen Langes vei)
- seed-1379 | SiS Sports Center | fix | moved 5288 m + address | sissportssenter.no (Rennebergstien 24, 4021 Stavanger); OSM Nominatim house node 2836120171 (24 Rennebergstien)
- seed-1380 | Mørkvedhallen klatresenter | fix | moved 8055 m | OSM node 6548832330 (Mørkvedhallen klatresenter, Steggveien, Bodø; sport=climbing); official site morkvedhallen.no does not render an address (JS-only), so address left for the owner
- seed-1382 | Hemsedal klatresenter | fix | moved 10361 m + address | hemsedalfjellsport.no/hemsedalklatresenter (Besøksadresse: Holleskardvegen 35); OSM node 13716230001 (Hemsedal Klatresenter, Holdeskarsvegen 35)
- seed-1383 | Klatreverket Kristiansand | fix | moved 7377 m + address | klatreverket.no/kontakt-klatreverket (Klatreverket Kristiansand, Jørgen Moes gate 10, 4616 Kristiansand); OSM Nominatim house node 3097700381 (10 Jørgen Moes gate)
- seed-1384 | Kristiansund Klatresenter | fix | moved 17072 m + address | kristiansundklatresenter.no (Adresse: Bytesteinen 1, 6517 Kristiansund); OSM node 12595193609 (Kristiansund klatresenter, Nordmørsveien; house node 1 Bytesteinen 30 m away)
- seed-1385 | Tyrili Klatring | fix | moved 2326 m + address | tyriliklatring.no/kontakt (Tyrili Klatresystemer AS, Anders Johansens veg 10, 2615 Lillehammer); OSM Nominatim house node 4868225670 (10 Anders Johansens veg; OSM Tyrili Klatring node 25 m away)
- seed-1386 | Sparebanken Møre Arena | fix | moved 19115 m + address | klatreklubben.no/inneklatring and sbmarena.no/om-oss/teknisk-info (Sjømannsvegen 16, 6008 Ålesund; Klatreklubben Ålesund runs the walls in Sparebanken Møre Arena); OSM Nominatim house node 3118774528 (16 Sjømannsvegen)
- seed-1387 | Skien Fritidspark | fix | moved 9691 m + address | skienfritidspark.no/aktiviteter/klatring-innendors (Skien fritidspark, Moflatvegen 38, 3733 Skien; wall in Flerbrukshallen); OSM Nominatim house node 3128641782 (38 Moflatvegen)
- seed-1440 | PXP Climbing | confirmed (pin 0 m from gym element; no record) | pxp.gr/indoor.html (climbing gym at K. Karamanli 124); pin identical to OSM building 962558287 (124 Konstantinou Karamanli)
- seed-1474 | Central Climbing | fix | moved 3574 m + address | centraladeescalada.ro/contact (Piața 1 Mai, Cluj Napoca; no house number on the site); OSM node 8797481811 (Centrala de escaladă, Strada Răsăritului, sport=climbing)
- seed-1475 | Free Wall | confirmed (pin 0 m from gym element; no record) | freewall.ro/contact.html (Strada Berariei, nr.6, behind the Ursus brewery); pin identical to OSM node 2639624468 (Sala de Escaladă Freewall, Strada Berăriei 6)
- seed-1497 | Climbing and mountaineering NSA | fix | moved 3137 m + address | climbnsa.com/цени-и-адрес (Спортен комплекс на Национална Спортна Академия „Васил Левски“, Студентски град); OSM way 59466624 (Спортен комплекс на НСА)
- seed-1810 | Trapezia | confirmed (pin 0 m from gym element; no record) | trapezia.by (Минск, Партизанский проспект 2/1, 2 этаж); OSM building 25326169 at Партызанскі праспект 2 is 10 m from the pin

## Manual (no record written)
- seed-1046 | Mandala Boulderhalle | manual | n/a | two sites (Zeitenströmung, Königsbrücker Str. 96 and Postplatz, Annenstraße 1-3): which one is this record?
- seed-1060 | Stuntwerk Köln | manual | n/a | two halls (Mülheim, Zollstock): which one is this record?
- seed-1369 | Klatreverket | manual | n/a | four Oslo halls (Torshov, Løkka, Bryn, Løren): which one is this record?
- seed-1376 | Gekko Klatring | manual | n/a | no live site; looks defunct (old Reina 8 hall, taken over by UTE.no / Trondheim Buldresenter): still open?
- seed-1378 | Klatrefabrikken Stavanger | manual | n/a | site domain gone; directories say closed and replaced by AIR by Bolder (Lagerveien 2): no readable primary source
- seed-1381 | Slaktehallen Buldrorado | manual | n/a | no website found; directories give only "Bodøsjøen": no street address, cannot place
- seed-1439 | Crux - Climbing gym | manual | n/a | only source is the unreadable Facebook page (crux.gr is a hosting default page); address Napoleontos Zerva 20 from directories
- seed-1468 | Climb House Brasov | manual | n/a | inside the Metrom industrial compound with Natural High; no OSM element for the hall; a compound-level pin would fall within 60 m of Natural High
- seed-1469 | Natural High Brașov | manual | n/a | inside the Metrom industrial compound with Climb House; no OSM element for the hall; official address is only the compound gate
- seed-1495 | Bons - Europe climbing center | manual | n/a | street (ul. Osmi dekemvri, Studentski grad) found but no house-number geocode and no OSM element
- seed-994 | Climbing Factory | manual | n/a | site down (502) / under construction; no official address readable (directories: Fahrradstraße 58, 90429 Nürnberg)
