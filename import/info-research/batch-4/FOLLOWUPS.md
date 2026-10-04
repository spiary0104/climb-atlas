# Batch-4 follow-ups: categories and status (2026-10-04)

The 54 items in `reviews.json` (`review`), checked against the official sites. The import pipeline can change address/pin,
retire, fill gym information and add gyms; **names, suburbs and type tags only change through the app's edit form**
(moderator approval). Nothing below was forced: ambiguous items are listed under "Needs a decision".

| Category | Items | Status |
|---|---:|---|
| Wrong city / pin | 22 | 20 staged in `import/batches/2026-10-04-location-fixes`; Crux South Austin and Adamanta Santa Fé need a decision |
| Easy app/data fixes | 15 | 3 missing addresses staged (same batch); 9 renames/spelling + 3 type tags = app edits (exact values below) |
| Possible duplicates | 2 | Vertigo Lisboa: not a duplicate, it is Vertigo Oriente: location fix staged; Alé/Allez Gangdong: needs a decision |
| New gyms | 2 | folk (Shin-Yokohama), Banana Climbing Xiaoyuehe: no reliable pin (decision) |
| Needs research / decision | 12 | see below |
| Already resolved / recorded | 1 | Korea scope note (future research) |

## Staged: `2026-10-04-location-fixes` (24 gyms, address + pin; validate/plan/dry-run clean)
Boulderwelt Dortmund, Monkeyspot Duisburg, Altissimo Toulouse Saint Martin (missing addresses); Boulders Valby (address);
blocwald, Boulderstube (Laufenburg), HotzenBlock, UPJOY, Blöckle (Ravensburg), Dolomiti-Boulderbox (Albstadt), Griffwerk
(Ludwigsburg), Roccadion (Böblingen), ROKT (Brighouse), Golden Gecko (Romsey), Big Depot Manchester, BlocHaus, Mono (Athens),
alien rock, EICA (Ratho), Dynochrom (Frankfurt), KletterZ (Weyarn), boulderdrome (Radebeul), Vertical Spirit, Vertigo Oriente.
Address from each official site; pin from the OpenStreetMap element for the gym (23 of 24) or a house-level geocode.

## App edits (verified on the official sites; exact values)
Renames (same venue, same address):
- seed-60 City Summit -> **Oasis Climbing Gym Malaga** (2/26 Harris Rd, Malaga WA 6090)
- seed-962 Basement Boulderstudio -> **urban apes Basement Berlin** (Stresemannstraße 72, 10963 Berlin; address too)
- seed-458 T-WALL Kinshicho -> **BASE CAMP TOKYO Kinshicho** (毛利2-10-12, Koto City; the pin is a placeholder shared with Fish and Bird Toyocho: set it on the building)
- seed-1108 Be Boulder Amsterdam -> **Boulderhal Luchthaven** (Anthony Fokkerweg 75)
- seed-1115 Mountain Network Amsterdam -> **Climbing Center Amsterdam** (Climbing Network; Erasmusgracht 297)
- seed-1121 De Klimmuur Den Haag de Uithof -> **BOK Den Haag** (klimmuur; Jaap Edenweg 10)
- seed-1314 Fabryczna Boulder -> **NOISE Bouldering Spot** (Grabiszyńska 241D; site says formerly Fabryczna Boulder)
- seed-1265 Vertigo - Lisboa -> **Vertigo Oriente** (after the location fix)
- optional: seed-266 Salt Lake Bouldering Project -> Bouldering Project The Granary (660 S 400 W; the page body still uses the old name)
Suburbs (after the location fixes, the suburb label is still the old city): blocwald -> Villingen-Schwenningen; Boulderstube ->
Laufenburg (Baden); HotzenBlock -> Waldshut-Tiengen; UPJOY -> Villingen-Schwenningen; Blöckle -> Ravensburg; Dolomiti-Boulderbox ->
Albstadt; Griffwerk -> Ludwigsburg; Roccadion -> Böblingen; ROKT -> Brighouse; Golden Gecko -> Romsey; Dynochrom -> Frankfurt am
Main; KletterZ -> Weyarn; boulderdrome -> Radebeul; Boulderwelt Dortmund -> Dortmund; Monkeyspot Duisburg -> Duisburg.
Type tags: Climbing District Saint-Lazare (auto-belay rope only), Climbing District Sèvres-Lecourbe (auto-belay + wall), Bloc
District Tetuan (rope climbing): add top-rope (and remove indoor-bouldering where the site says rope only).

## Needs a decision / research
- Crux South Austin (seed-141): official page lists 220 Ralph Ablanedo but calls a space there "coming soon"; no OSM gym.
- Adamanta Santa Fé (seed-1389): official page has no street address; our pin is in east Mexico City.
- Alé / Allez Climb Gangdong (g-7e30006a3e, seed-707b731ba7): likely one gym (directories: 천호대로177길 39 B2); no official site.
- folk bouldering gym (new; 横浜市港北区新羽町576-1, folkboulderinggym.com): no house-level coordinate (the site's map embed is a viewport).
- Banana Climbing Xiaoyuehe (new; Beijing, chain API bj-xiaoyuehe): pin approximate (GCJ-02 converted), no street number.
- Uadibloc (seed-1254, spelling "Uuadibloc"): live site down (nginx default page); open? (fix spelling, or retire if closed).
- Stuntwerk Köln (seed-1060): two halls (Mülheim, Zollstock), placeholder pin: which one, and add the other?
- Rock Over Climbing (seed-915): which of three centres?  Mandala Boulderhalle (seed-1046): which of two sites?
- CELL Setagaya (seed-452): site unmaintained since ~2013.  BUMP Pavilion Bukit Jalil (g-2db5533538): chain says "Coming Soon".
- WOW Zerwa (seed-1318): site behind a bot challenge.  MegaSTONE (seed-1608): address disagrees, no official site.
- Rockreation LA (seed-372, live since batch 1): hours may be stale; the updater is fill-only, so a correction is an app edit.
- BoulderBad Muubeeri (seed-1297): closes 31.12.2026 (retire in January).  Climbing Factory Nürnberg (seed-994): site under
  construction.  Ahonikenk (seed-1519): 2013 blog only.  Club Andino Burzaco / K2 Escalada / Limite Sur: Facebook only.
