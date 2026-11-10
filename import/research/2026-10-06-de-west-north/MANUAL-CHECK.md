# Manual checks: Germany west/north (2026-10-06-de-west-north)

Low-confidence gyms kept out of the batch (decision `defer` in review.json). One question each.

1. **ELEMENT Boulders Köln Deutz**, Köln. https://deutz.element-boulders.de/ and https://element-boulders.de/
   Question: has it opened? The chain site says "new location - coming autumn 2026" at Deutz-Mülheimer Str. 111; no opening date or hours found. (Candidate dewn-element-koeln-deutz, geocoded address pin ready.)
2. **Fingerfood Boulderhalle**, Lingen (Ems). https://fingerfood-bouldern.com/
   Question: is it open today? The site timed out on every request in this session; search snippets and the city of Lingen show a boulder hall at Darmer Esch 60-62 (OSM node exists). (Candidate dewn-fingerfood-lingen.)
3. **DAV Kletterzentrum Pfalz Rock**, Frankenthal. https://www.pfalz-rock.de/
   Question: does it have a boulder area open to day-ticket guests? Official pages show a rope-climbing price list and only 3 mentions of bouldering. (Candidate dewn-pfalz-rock-frankenthal.)
4. **SportPoint Meckenheim**, Meckenheim (near Bonn). https://sportpoint-meckenheim.de/bouldern-in-meckenheim-bei-bonn/
   Question: which is the correct location? The site says Am Tennisplatz 27 (Meckenheim-Merl); the gym's OSM way is Am Alten Stauwehr 2 in Merl, while the geocode of Am Tennisplatz 27 is 3.5 km away. Open and bouldering are confirmed. (Candidate dewn-sportpoint-meckenheim.)
5. **Andres Boulder Club**, Aachen. https://andres-boulder-club.ac/ (also aachener-boulder-club.de)
   Question: is this a public hall? The site is a stub (1 mention of bouldering, no address or hours). Not added as a candidate.
6. **Kletterhalle Bensheim (High-Moves)**, Bensheim. https://www.kletterhalle-bensheim.de/
   Question: is there a boulder area? Rope-focused site, 5 mentions of bouldering, no boulder ticket seen. Not added as a candidate.
7. **Boulderhalle Bochum (Blockwerk)**, Bochum. boulderhalle-bochum.de is an unconfigured domain.
   Question: does Blockwerk Bochum still exist? Not added.

8. **K11 Boulderhalle**, Köln. https://k11-koeln.de/
   Question: is it open now (2026 posts/hours)? Static site, latest dated content 2024; hours and prices shown. (Candidate dewn-k11-koeln.)
9. **Kraftraum Bocholt Boulderhalle**, Bocholt. http://kraftraum-bocholt.de/
   Question: is it open now (2026 posts/hours)? Home page last modified Dec 2024, last feed item Sep 2025. (Candidate dewn-kraftraum-bocholt.)
10. **RockTown**, Kaiserslautern. https://www.rocktown.eu/boulderhalle-infos/offnungszeiten-and-preise/
    Question: is it open now (2026 posts/hours)? Static site, no dated content; hours table shown. (Candidate dewn-rocktown-kaiserslautern.)
11. **BoulderEck Erftstadt**, Erftstadt. https://bouldereck.de/
    Question: is it open now (2026 posts/hours)? Latest dated content 2024; hours shown. (Candidate dewn-bouldereck-erftstadt.)

| 12 | Boulderplanet (dewn-boulderplanet-koeln) | Köln-Ehrenfeld, Oskar-Jäger-Str. 143h | https://boulderplanet.de/standort-oeffnungszeiten/ | Is this the same hall as the existing Bouldeer entry "Einstein Boulderhalle Köln" (pin 186 m away)? If Einstein Köln closed or was renamed, which record should stay? | Open (hours, 15.90 EUR day ticket), operator Sportall GmbH; added by the brain review 2026-10-06. |

## Follow-up 2026-11-11 (public-source verification)
Method: checked by Claude (AI) on public sources; ChatGPT leads re-verified (none of its leads concerned this file); nothing written to production. Searched review.json, TASKS.md and git history: no later commit settled these.

- **ELEMENT Boulders Köln Deutz (dewn-element-koeln-deutz)**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence M). The Deutz location page now calls the hall "Die neue Boulderhalle in Köln Deutz", shows it as "Geöffnet", with hours daily 9-23 (bistro 15-23 weekdays, 9-23 weekends) and address Deutz-Mülheimer Straße 111, 51063 Köln. No explicit opening date, page undated. Sources: https://deutz.element-boulders.de/ (checked 2026-11-11). Next: none (hours "9*" asterisk unexplained).
- **Fingerfood Boulderhalle, Lingen (dewn-fingerfood-lingen)**: STATUS: OPEN (confidence L). Official site refuses connections (ECONNREFUSED) today; Hansefit lists it as a bouldering studio with bistro/sauna, no hours. Sources: https://fingerfood-bouldern.com/ ; https://hansefit.de/en/studio-finden/lingen/climbingbouldering/fingerfood-boulderhalle (checked 2026-11-11). Next: NEEDS HUMAN (browser or phone to confirm it is open).
- **DAV Kletterzentrum Pfalz Rock, Frankenthal (dewn-pfalz-rock-frankenthal)**: STATUS: OPEN (confidence L). Official page covers the climbing hall, route setting, auto-belays and courses, hours from 01.08.2026 (Mo-Fr 13-22:30, Sa/So/holidays 10-19), no boulder area mentioned and no prices on the page. Sources: https://www.pfalz-rock.de/ (checked 2026-11-11). Next: keep out unless the Eintrittspreise page shows a boulder area.
- **SportPoint Meckenheim (dewn-sportpoint-meckenheim)**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence M). The bouldering page now gives address Am alten Stauwehr 2, 53340 Meckenheim (matches the OSM way, not Am Tennisplatz 27), hours Mo-Do 9-22, Fr 9-21, Sa/So 9-20, newest content Dec 2025 (Rheinmoves 2025). Use the OSM way pin. Sources: https://sportpoint-meckenheim.de/bouldern-in-meckenheim-bei-bonn/ (checked 2026-11-11). Next: none; check the holiday-hours page before showing hours.
- **Andres Boulder Club, Aachen**: STATUS: OPEN (confidence L). Not re-checked; stub site, no address or hours. Next: keep out.
- **Kletterhalle Bensheim (High-Moves)**: STATUS: OPEN (confidence L). Official page mentions only an outdoor "Boulder-Block" (added 2009) with a climbing wall; hall hours today 9-23; no indoor boulder area or day-ticket price seen. Sources: https://www.kletterhalle-bensheim.de/ (checked 2026-11-11). Next: keep out unless an indoor boulder area is stated.
- **Boulderhalle Bochum (Blockwerk)**: STATUS: OPEN (confidence L). Not re-checked; unconfigured domain. Next: keep out.
- **K11 Boulderhalle, Köln (dewn-k11-koeln)**: STATUS: OPEN (confidence L). Hours Mo-Fr 14-23, Sa/So 10-22 shown; the only dated item is a closure notice "11.11. ... wieder am 12.11." without a year; footer 2024. No 2026 content. Sources: https://k11-koeln.de/ (checked 2026-11-11). Next: NEEDS HUMAN (a dated 2026 post or phone).
- **Kraftraum Bocholt Boulderhalle (dewn-kraftraum-bocholt)**: STATUS: OPEN (confidence L). Hours listed (Mo/Di 14-22, Mi/Do 10-22, Fr-So 12-20); footer 2015, photo files 2018; previous check saw home page modified Dec 2024 and a feed item from Sep 2025. Sources: http://kraftraum-bocholt.de/ (checked 2026-11-11). Next: dated 2026 evidence or phone 02871 189 6967.
- **RockTown, Kaiserslautern (dewn-rocktown-kaiserslautern)**: STATUS: OPEN (confidence M). Official hours table (Mo 10-22, Di 15-23, Mi 10-23, Do 15-23, Fr 10-22, Sa/So 10-21), shoe rental, family rates, mention of 1. FCK home-game traffic; no dated notice, prices not in text. Sources: https://www.rocktown.eu/boulderhalle-infos/offnungszeiten-and-preise/ (checked 2026-11-11). Next: a dated post or booking-system confirmation.
- **BoulderEck Erftstadt (dewn-bouldereck-erftstadt)**: STATUS: OPEN (confidence L). Only dated item is the 2024 footer; BoulderTreff every Wednesday 19-20:30; general hours on a sub-page not loaded. Sources: https://bouldereck.de/ (checked 2026-11-11). Next: read "Besuch & Zeiten" in a browser and look for 2026 content.
- **Boulderplanet Köln-Ehrenfeld vs Einstein Boulderhalle Köln (dewn-boulderplanet-koeln)**: STATUS: OPEN (confidence M). Boulderplanet (Sportall GmbH) is confirmed open daily 9-23:30 (public holidays 9-22) at Oskar-Jäger-Str. 143h, 50825 Köln. The same-hall question is not settled by the operator, but Urban Sports Club lists einstein Boulderhalle Köln at Widdersdorfer Straße 205 / Ernst-Heinrich-Geist-Straße 18 (Frechen area, inconsistent), i.e. not at Oskar-Jäger-Str., which argues for two different halls and a wrong pin on the existing Einstein record. Sources: https://boulderplanet.de/standort-oeffnungszeiten/ ; https://urbansportsclub.com/en/venues/einstein-boulderhalle-kln (checked 2026-11-11). Next: NEEDS HUMAN (check the existing Einstein record's address against einstein-boulderhalle.de, then accept Boulderplanet as new if distinct).
