# Manual check: Belgium (2026-10-06-belgium)

Owner rule: low-confidence gyms stay out. Part A are deferred candidates (pin + `defer` decision); part B are leads without a candidate. One question each.

## A. Deferred candidates (4)
| Gym | Town | URL | Question | Findings |
|---|---|---|---|---|
| Klimkaffee Mechelen | Mechelen (Douaneplein 8) | https://klimkaffee.be/ | Is it open now? | Site and OSM show address and bouldering; no hours or dated news found |
| Klimkaffee Herentals | Herentals (Lierseweg 317/E) | https://klimkaffee.be/ | Is it open now? | Same as Mechelen |
| Klimax (BVKB club) | Puurs-Sint-Amands (Vrijhalsweg 17) | https://www.bvkb.be/ | Can non-members buy a day entry to the boulder room (Klimax 3)? | Club site; boulder room named; events dated 2025-2026; no public hours |
| Le Camp de Base | Ixelles (Chaussee de Boondael 210C) | https://www.lecampdebase.be/ | Has it opened (site says "Ouverture septembre 2026")? | Three new Brussels sites announced (Rue du Vivier 53, Chaussee de Boondael 210C, Rue de Theux); no hours |

## B. Leads without a candidate (7)
| Gym | Town | URL | Question | Findings |
|---|---|---|---|---|
| Maniak Padoue, Braine-l'Alleud, Charleroi, Nivelles | Forest, Braine-l'Alleud, Charleroi (Jumet), Nivelles | https://www.maniak.club/ | Hours and day entry for each of the 4 halls? | Main site says 4 halls with bloc and voies; per-hall subdomains did not load, so addresses/hours are only from the directory and OSM |
| Klimcentrum Alpamayo | Beringen (be-MINE) | https://www.alpamayo.be/ | What is the street address (pin)? | Site is live (2026 events, boulder room) but no street address found in the pages read |
| Entre Ciel et Terre | Louvain-la-Neuve (Place des Sports 1) | https://www.entrecieletterre.be/ | Is there an indoor bouldering room with public entry? | Club with hours page and a boulder-themed news post; address only from the directory/OSM |
| Peace & Bloc | Marche-en-Famenne (Rue du Parc Industriel 22) | https://www.peace-and-bloc.be/ | Is it open? | Site is script-only (no readable text); OSM node exists |
| Le Cabri | Rhisnes (Chaussee de la Gare 1A) | http://www.le-cabri.be/ | Is it open and does it have bouldering? | Site did not load |
| The Wall Verviers | Verviers | https://www.thewall-escalade.be/ | Address and hours of the bloc hall? | Chain site lists Verviers "Salle de bloc" and a Liege site "coming soon"; no address read |
| Seafront Boulder (new hall) | Zeebrugge area | https://seafrontboulder.be/ | Where is the new hall and has it opened? | Old hall (Vismijnstraat 7) is permanently closed; "moving soon to a new hall" |

## Follow-up 2026-11-11 (public-source verification)
Method: checked by Claude (AI) on public sources; ChatGPT leads re-verified (none of its leads concerned this file); nothing written to production. Searched review.json, TASKS.md and git history: no later commit settled these.

### A. Deferred candidates
- **Klimkaffee Mechelen**: STATUS: OPEN (confidence L). Official home page confirms address Douaneplein 8, 2800 Mechelen and indoor walls; no hours on the page (linked per location) and the only date is the 2019 copyright. Sources: https://klimkaffee.be/ (checked 2026-11-11). Next: read the per-location hours page in a browser; accept only with a 2025/2026 dated item.
- **Klimkaffee Herentals**: STATUS: OPEN (confidence L). Same site: Lierseweg 317/E, 2200 Herentals; no hours or dated news. Sources: https://klimkaffee.be/ (checked 2026-11-11). Next: same as Mechelen.
- **Klimax (BVKB club), Puurs-Sint-Amands**: STATUS: OPEN (confidence M). Club page says visitors need only register their climbing skills once and accept the house rules (suggests public access) and links to "Openingsuren en tarieven" (not loaded); a Friday-19:00 competition notice is current; footer address Vrijhalsweg 17, 2870 Breendonk (club), event listing says "Klimax, Puurs-Sint-Amands". Day price not read. Sources: https://www.bvkb.be/ (checked 2026-11-11). Next: read the hours and tariffs page for a non-member day entry.
- **Le Camp de Base, Ixelles**: STATUS: DATE-GATED (confidence M). Official page lists three Ixelles sites (Chaussée de Boondael 210C large bouldering hall; Rue du Vivier 53; Rue de Theux 107) with conflicting opening texts ("septembre 2026" and "printemps 2026"), no hours, and pricing dates from July 2025. No evidence that it has opened. Sources: https://www.lecampdebase.be/ (checked 2026-11-11). Next: recheck in December 2026 or ask the operator.

### B. Leads without a candidate
- **Maniak (Padoue/Forest, Braine-l'Alleud, Charleroi, Nivelles)**: STATUS: OPEN (confidence M). Official site lists the four halls with bloc (Nivelles lead+bloc, Charleroi bloc with Kilter board, Padoue lead+bloc with Kilter, Braine-l'Alleud lead+bloc), says no certification is needed and you can start at your first visit; addresses, hours and day prices are on per-hall pages not read (maniak.club/nivelles, /padoue, /premiere-fois). Sources: https://www.maniak.club/ (checked 2026-11-11). Next: read the four hall pages (addresses, hours, day entry); accept per hall once shown.
- **Klimcentrum Alpamayo, Beringen**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence M). Official page gives the address be-MINE 21, 3582 Beringen, a "speelse boulderzaal", regular hours Mo-Fr 13-23:30, Sa/Su/holidays 10-18:30 (school holidays Mo-Fr from 10); day price on a separate Tarieven page. Page undated but earlier read showed 2026 events. Sources: https://www.alpamayo.be/ (checked 2026-11-11). Next: none (pin needs a coordinate for be-MINE 21).
- **Entre Ciel et Terre, Louvain-la-Neuve**: STATUS: OPEN (confidence M). Official page: bouldering room open at usual hours on 11 Nov (Accueil 13-22:30), access tied to a "Badge Safe Control" subscriber system with "séance découverte" booking for beginners; no clear walk-in public entry; no street address on the page. A new boulder room in Genval is planned, not open. Sources: https://www.entrecieletterre.be/ (checked 2026-11-11). Next: read "Horaires & Accès" for public entry; keep out unless day entry is shown.
- **Peace & Bloc, Marche-en-Famenne**: STATUS: OPEN (confidence L). Site returned HTTP 520 (server error) today; no new evidence. Sources: https://www.peace-and-bloc.be/ (checked 2026-11-11). Next: NEEDS HUMAN (browser).
- **Le Cabri, Rhisnes**: STATUS: OPEN (confidence L). Site has a TLS certificate mismatch (served from OVH cluster); not readable. Sources: http://www.le-cabri.be/ (checked 2026-11-11). Next: NEEDS HUMAN (browser).
- **The Wall Verviers**: STATUS: OPEN (confidence M). Chain site lists Verviers as "Salle de bloc" and Liège as "coming soon"; no address or hours on the page read (see /fr/contact.htm). Sources: https://www.thewall-escalade.be/ (checked 2026-11-11). Next: read the Verviers page and contact page.
- **Seafront Boulder (Zeebrugge area)**: STATUS: DATE-GATED (confidence H). Official site says "Seafront is permanent gesloten", moving soon to a new hall in Roeselare; no street address or opening date. Old hall is closed: keep it out (RESOLVED for the old hall, no retire needed if it was never in Bouldeer). Sources: https://seafrontboulder.be/ (checked 2026-11-11). Next: recheck for the Roeselare hall's address and opening.
