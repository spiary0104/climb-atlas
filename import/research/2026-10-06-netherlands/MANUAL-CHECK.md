# Manual check: Netherlands (2026-10-06-netherlands)

Owner rule: low-confidence gyms stay out. Part A is a deferred candidate (has a pin and a `defer` decision); part B are leads without a candidate. One question each.

## A. Deferred candidates (1)
| Gym | Town | URL | Question | Findings |
|---|---|---|---|---|
| National Climbing Center Nieuwegein (Climbing Network) | Nieuwegein | https://www.climbingnetwork.nl/en/indoor/locatie/national-climbingcenter-nieuwegein | Can people already climb/boulder here on normal days (not only at the Grand Opening on 14 Nov 2026)? | Location page lists weekday 8:30-23:00 / weekend 8:30-22:00 and "Climbing, Bouldering"; the chain's news post sells day tickets for the Grand Opening 14 Nov 2026 |

## B. Leads without a candidate (9)
| Gym | Town | URL | Question | Findings |
|---|---|---|---|---|
| Gropo Bouldergym | Groningen (Ulgersmaweg 8) | https://www.gropo.nl/ , https://www.instagram.com/gropobouldergym | Is it open? | Website returns a password page (HTTP 401), so exists/open could not be confirmed on a primary page |
| Wildflower Climbing Gym | Leiden (Dorus Rijkersweg 15) | https://www.instagram.com/wildflowerclimbinggym/ | Is it open? | Listed in a directory; wildflowerclimbinggym.org returns 404 |
| Klimhal Stadsmuur | Nijmegen (Van Rosenburgweg 52) | https://stadsmuur.com/ | Is there a boulder area? | Live site with dated hours (Aug 2026) but no bouldering wording on any page read |
| Klim en Outdoorcentrum Yosemite | Zwolle (Van der Heydenstraat 8) | https://yosemite.nl/ | Is there a boulder area? | Very small site; no bouldering wording |
| Rock Steady | Bussum (Zanderijweg 12-14) | https://www.rocksteady.nl/ | Is the "bouldertuin" indoor? | Site has hours and boulder rules pages; text says "unieke bouldertuin" (garden), looks outdoor |
| Monte Cervino | Bergschenhoek (Hoeksekade 141) | https://www.montecervino.nl/ | Is there an indoor boulder area? | Hours live; indoor pages mention rope climbing only |
| Boulderstation | Enschede (Goolkatenweg 65) | none found | Does it exist/is it a bouldering hall? | Only an OSM element named Boulderstation |
| De KlimVallei | Den Helder (De Helderse Vallei 7A) | none found | Is there bouldering? | Only an OSM sports centre |
| Boulderburcht | Eindhoven (Dutmalapad) | none found | Does it exist? | Only an OSM building named Boulderburcht |

## Follow-up 2026-11-11 (public-source verification)
Method: checked by Claude (AI) on public sources; ChatGPT leads re-verified (none of its leads concerned this file); nothing written to production. Searched review.json, TASKS.md and git history: no later commit settled these.

### A. Deferred candidate
- **National Climbing Center Nieuwegein (Climbing Network)**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence H). The operator's location page says all climbing and bouldering facilities are open now (renovation finishing Oct/Nov), hours weekdays 8:30-23:00 and weekends 8:30-22:00, with a bouldering hall, lead hall and introduction boulder and day tickets; the 14 Nov 2026 Grand Opening (free to visit, EUR 10 to try climbing) is an event on top of regular access. Sources: https://www.climbingnetwork.nl/en/indoor/locatie/national-climbingcenter-nieuwegein (checked 2026-11-11). Next: none.

### B. Leads without a candidate
- **Gropo Bouldergym, Groningen**: STATUS: OPEN (confidence M). The site no longer returns a password page: it shows hours (weekdays 10-23, weekends 9-23) and address Ulgersmaweg 8, 9731 BS Groningen, phone +31 50 280 8444. No dated content, so "open now" is not shown by a dated source. Sources: https://www.gropo.nl/ (checked 2026-11-11). Next: a dated post or Instagram activity; likely eligible.
- **Wildflower Climbing Gym, Leiden**: STATUS: OPEN (confidence L). Instagram shows "The Wildflower Climbing Gym account has moved to @atmaclimbing" (last visible post 17 March 2026), suggesting a rename to ATMA Climbing; no primary site. Sources: https://www.instagram.com/wildflowerclimbinggym/ (checked 2026-11-11). Next: NEEDS HUMAN (find the ATMA Climbing site; confirm location, bouldering and open status).
- **Klimhal Stadsmuur, Nijmegen**: STATUS: OPEN (confidence M). Site current (7 Nov "Climb in the Dark", Christmas hours) but describes top-rope, auto-belay and lead (about 145 routes, 3 to 8a) and no boulder area. Sources: https://stadsmuur.com/ (checked 2026-11-11). Next: keep out unless a boulder area is shown.
- **Klim en Outdoorcentrum Yosemite, Zwolle**: STATUS: OPEN (confidence L). Home page links "Klimcentrum" and "Zelfstandig Klimmen", no boulder wording, hours not on the page. Sources: https://yosemite.nl/ (checked 2026-11-11). Next: keep out unless bouldering is shown.
- **Rock Steady, Bussum**: STATUS: OPEN (confidence M). Official page calls it a "unieke bouldertuin" next to archery and slacklining (looks outdoor), indoor climbing walls and an indoor ski slope; hours Mo-Fr 10-22, Sa 9-18, Su 10-18; separate boulder and climbing price pages. Indoor boulder area not stated. Sources: https://www.rocksteady.nl/ (checked 2026-11-11). Next: read the boulder price page; keep out if outdoor only.
- **Monte Cervino, Bergschenhoek**: STATUS: OPEN (confidence L). Official page: "Binnen én buiten klimmen", hours listed, no bouldering wording on the page read. Sources: https://www.montecervino.nl/ (checked 2026-11-11). Next: read the "Binnen klimmen" page; keep out unless bouldering is shown.
- **Boulderstation, Enschede**: STATUS: OPEN (confidence L). Not re-checked; OSM element only. Next: keep out.
- **De KlimVallei, Den Helder**: STATUS: OPEN (confidence L). Not re-checked; OSM sports centre only. Next: keep out.
- **Boulderburcht, Eindhoven**: STATUS: OPEN (confidence L). Not re-checked; OSM building only. Next: keep out.
