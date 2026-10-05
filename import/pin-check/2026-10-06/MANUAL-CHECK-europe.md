# Manual check: Europe (12 gyms)

Each gym below could not be settled from a readable primary source. One question each; what was found is under it.
The other 57 gyms of `targets-europe.json` are in `europe-results.md` (49 fixes in the batch `import/batches/2026-10-05-pin-check-europe/`).

## seed-1046 Mandala Boulderhalle (Dresden)
- Open: https://boulderhalle-dresden.de/mandala/standort-zeitenstroemung.html and https://boulderhalle-dresden.de/mandala/standort-postplatz.html
- **Question: which of the two sites is this record (or both, then add the other as a new gym)?**
- Found: Mandala Zeitenströmung, Königsbrücker Str. 96, 01099 Dresden (OSM node 4167137223, 51.0799639, 13.7601293); Mandala Postplatz, Annenstraße 1-3, 01067 Dresden (OSM node 12287417030, 51.0503790, 13.7310513). The current pin (51.06, 13.745) sits between them. Already listed in `import/info-research/batch-4/FOLLOWUPS.md`.

## seed-1060 Stuntwerk Köln
- Open: https://stuntwerk.de/koeln-muelheim/ and https://stuntwerk.de/koeln-zollstock/
- **Question: which hall is this record (and add the other)?**
- Found: Stuntwerk Köln Mülheim, Schanzenstraße 6-20, 51063 Köln (OSM node 3282850572, 50.9657075, 7.0130676; the Impressum of "Stuntwerk Köln GmbH" gives this address); Stuntwerk Köln Zollstock, Weyerstraßerweg 10A, 50969 Köln (OSM node 12802250304, 50.9186197, 6.9393557). The record name has no suburb. Already in FOLLOWUPS.md.

## seed-1369 Klatreverket (Oslo)
- Open: https://klatreverket.no/kontakt-klatreverket/
- **Question: which Oslo hall is this record (and add the others)?**
- Found: four Oslo halls: Torshov (Myrens verksted 3K, 0476; OSM node 1465714083, 59.9348620, 10.7594470), Løkka (Thorvald Meyers gt 9, 0555; OSM node 13307891995, 59.9293595, 10.7579196), Bryn (Brynsveien 3, 0667; OSM node 4499176529, 59.9100690, 10.8112958), Løren (Peter Møllers vei 4, 0585; OSM node 13996442386, 59.9315200, 10.7926714). Only one Klatreverket Oslo record exists (also Klatreverket Kristiansand, fixed in the batch). The current pin is a placeholder in central Oslo.

## seed-1375 Trondheim Klatresenter
- Open: https://trondheim-klatresenter.no/ (redirects to https://gripklatring.no/) and https://gripklatring.no/2023/07/20/leangen-apner-1-august/
- **Question: Is Trondheim Klatresenter now Grip Leangen at Travbanevegen 7, or is the old hall elsewhere still open?**
- Found: the domain redirects to Grip Klatring, which lists Grip Leangen (Travbanevegen 7, 7061; OSM node 2207456459, 63.4326574, 10.4662988; opened 2023-08-01 as the largest centre) and Grip Sluppen (Sluppenvegen 11, 7037). Directories also give Gildheimsvegen 2 and an older Falkenborgvegen 37. A redirect alone does not prove which hall the record is. The current pin (63.4304475, 10.3952118) is a placeholder.

## seed-1376 Gekko Klatring (Trondheim)
- Open: https://breogfjellsport.com/articles37f8.html?articleID=350&s_id=82 (old article: Reina 8, 7042 Trondheim, opened 2004) and https://buld.no/ (Trondheim Buldresenter, the successor at Lademoen).
- **Question: is Gekko Klatring still open? (If not: retire as closed.)**
- Found: no live website; every directory is old. UTE.no took over the hall in 2007 and later moved out (now Trondheim Buldresenter, Ormen langes vei 15). The search results are not a primary source, so no retire record was written.

## seed-1378 Klatrefabrikken Stavanger
- Open: https://www.facebook.com/Klatrefabrikken/ and https://airbybolder.no/en/
- **Question: has Klatrefabrikken (Breiflåtveien 15, 4017 Stavanger) closed and been replaced by AIR by Bolder (Lagerveien 2, 4033 Stavanger)?**
- Found: klatrefabrikken.no no longer resolves (DNS); web-search listings (not primary) say permanently closed and replaced by AIR by Bolder, which has bouldering and climbing. airbybolder.no could not be fetched from here. If confirmed: retire (closed), and consider adding AIR by Bolder as a new gym.

## seed-1381 Slaktehallen Buldrorado (Bodø)
- Open: https://bodoklatreklubb.no/ and search "Slaktehallen Buldrorado" on Facebook/Instagram.
- **Question: is it open, and where is the entrance (drop a pin on the building)?**
- Found: no website (buldrorado.no does not resolve). Directories give only "Bodøsjøen 8070, Bodø" (a district, not an address) and describe a 250 m2 bouldering room in an old slaughterhouse run with Bodø Klatreklubb. The current pin (67.2924, 14.3898) is a placeholder.

## seed-1439 Crux - Climbing gym (Thessaloniki)
- Open: https://www.facebook.com/CruxThessaloniki/ (crux.gr shows only a hosting default page).
- **Question: does the About section give Stratigou Napoleontos Zerva 20, 546 40 Thessaloniki?**
- Found: address from directories (Mountain Project, ESN Thessaloniki). If confirmed, set the pin to the building at that address: OSM building 425584414, 40.6213611, 22.9563080 (2.0 km from the current pin, which sits on the PXP Climbing building). The record's stored address is already "Stratigou Napoleontos Zerva 20".

## seed-1468 Climb House Brasov
- Open: https://climbhouse.ro/ and https://www.google.com/maps/search/?api=1&query=Climb+House+Brasov
- **Question: drop a pin on the Climb House entrance (it is inside the Metrom compound, gates on Strada Panselelor and Strada Carpaților).**
- Found: Climb House: "Incinta Metrom, acces zilnic pe Poarta 1 de pe strada Carpaților, acces L-S pe Poarta 2 de pe strada Panselelor". No OSM climbing element for either hall in the compound. Natural High (seed-1469) is in the same compound, so a gate-level pin would breach the 60 m rule. The current pin (45.6277853, 25.6176733) is shared by both and is about 530 m from the Panselelor gate.

## seed-1469 Natural High Brașov
- Open: https://www.naturalhigh.ro/brasov/ and https://www.google.com/maps/search/?api=1&query=Natural+High+Brasov
- **Question: drop a pin on the Natural High entrance inside the Metrom compound.**
- Found: official address "Str. Panselelor, nr. 2 (poarta incintei Metrom), Brașov" (OSM house node 6491208312, 45.6303406, 25.6234782, is the gate). An unrelated OSM node "Natural High" (shop/outdoor, 45.6313835, 25.6226351) is about 100 m from the gate, not confirmed as the hall.

## seed-1495 Bons - Europe climbing center (Sofia)
- Open: https://bons.sportcentereurope.bg/contact-us/ (embedded map titled "София, Студентски град; ул. Осми декември №2")
- **Question: drop a pin on the entrance of the centre at ul. Osmi dekemvri 2, Studentski grad.**
- Found: Nominatim finds the street (8-ми декември, Studentski grad, 2.2 to 2.7 km from the current pin) but no house number 2 and no OSM element for the centre. The current pin (42.6682265, 23.3710644) is shared with seed-1497 NSA, which is fixed in the batch (the NSA sports complex).

## seed-994 Climbing Factory (Nürnberg)
- Open: https://www.climbing-factory.de/ (returned 502 Bad Gateway on 2026-10-06; FOLLOWUPS.md notes "site under construction") and https://tourismus.nuernberg.de/geniessen/kulinarik-erleben/kulinarik-auf-festen/location/climbing-factory/
- **Question: is it open, and is the address Fahrradstraße 58, 90429 Nürnberg?**
- Found: directories and the city tourism page list Fahrradstraße 58, 90429 Nürnberg (Nominatim: building 1064432151, 49.4595122, 11.0352861, 3.8 km from the current coarse pin 49.448, 11.085); some list Fürther Straße 212 as an alternative. Not settled from the gym's own site, so no record.
