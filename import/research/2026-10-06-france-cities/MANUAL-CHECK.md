# Manual check: France cities (2026-10-06-france-cities)

Gyms that could not be settled from a readable primary source (deferred, not in the batch), then accepted gyms where one quick look is worthwhile. Nothing here blocks the batch: all 60 accepted gyms are new to Bouldeer.

## Deferred (kept out of the batch)

| Gym | Town | URL(s) to open | The ONE question | Found so far |
|---|---|---|---|---|
| Altissimo Landes (frc-008) | Saint-Geours-de-Maremne (40) | https://landes.altissimo.fr/ ; or call 05 58 56 11 25 | Does this hall have a bouldering area? | Own page title says "Salle de Bloc" and the network text says all halls offer bloc, but unlike the other Altissimo pages there is no bloc area, problem count or topo here. 1500 m2, 14 m high, open 7/7 (Mon/Tue/Thu/Fri 12-22, Wed 10-22, weekends 10-20). OSM way is at 251 rue du Gave. If yes, add it in a later section. |
| Bloc'n Roll (frc-046) | L'Union, near Toulouse (31) | https://www.blocnroll.fr/ ; https://www.openstreetmap.org/way/67857807 | Is this the same business as the existing "SOLO Escalade - Toulouse" (43.621, 1.4206), i.e. should that record be renamed and moved to 51 route de Bessieres, L'Union (43.6639, 1.4704)? | Own page: cooperative hall "voies, blocs", "anciennement sous l'enseigne Solo Escalade, ce lieu est devenu Bloc'n Roll en 2018". The existing SOLO pin is 5.5 km from this site and 3.7 km from the other L'Union gym (Arkose). If it is a second SOLO site instead, Bloc'n Roll can be added as new. |
| Annette K. (Climbing District, Paris 6e) (frc-062) | Paris 6e | https://climbingdistrict.com/salle-escalade/annette-k/ | Is there a bouldering area at 149 rue de Rennes, or only the 20 auto-belay rope walls? | Own page mentions only "20 enrouleurs"; the price widget lists Voie and Bloc as generic options for the whole chain. Open to Climbing District annual members and day passes. |

## Accepted, optional spot check

| Gym | Town | URL(s) to open | The ONE question | Found so far |
|---|---|---|---|---|
| B'wall Lorient (frc-040) | Lanester (56) | https://www.b-wall.fr/salle-escalade/lorient/ ; satellite view around 47.7780, -3.3529 and 47.7789, -3.3548 | Is the hall at the site's own pin (47.77800, -3.35291) or at the OSM node (47.77887, -3.35484), 175 m west? | Pin is the page's JSON-LD coordinates; BAN only matches the street. Both lie in the same industrial estate (482 route de Kerviec). |
| The Roof Rennes (frc-016) | Rennes (35) | https://rennes.theroof.fr/ | Is the Hotel Dieu hall still planned to stay open long term? | Page is current (events to 21 Oct 2026, live gauge); the network describes the site as a temporary-use project in the former hospital. |
| Space Bloc (frc-061) | Sillingy (74) | https://www.spacebloc.fr/contact | What is the street address and what are the public hours? | Own page confirms a bloc hall (1,500 m2) with current events; neither the address nor the hours are on the home page. Pin is the OSM node. |

## Leads not entered as candidates
See `unlocated.md`. The ones most worth a look: Block'Out Marcq-en-Baroeul (OSM only, blockout.fr/bo-lille 404), Antipode (Brive/Trelissac, no address), Granit (Rueil-Malmaison, no site).

## Closed, for information (rejected, not for adding)
- Vertical'Art Lille (Lezennes): "Temporairement ferme pour cause d'incendie" on its page, no reopening date. Re-research when it reopens.
- Blocbuster La Defense and Blocbuster Versailles: permanently closed (judicial liquidation, 2026). Blocbuster Courbevoie stays open and is accepted.

## Follow-up 2026-11-11 (public-source verification)
Method: checked by Claude (AI) on public sources; ChatGPT leads re-verified (none of its leads concerned this file); nothing written to production. Searched review.json, TASKS.md and git history: no later commit settled these.

- **Altissimo Landes (frc-008)**: STATUS: OPEN (confidence M). Official page is titled "Salle de Bloc" and has a section "La pratique du bloc en salle" and a "Topo de la salle", open 7/7 (Mo/Tu/Th/Fr 12-22, We 10-22, weekends/holidays 10-20); still no bloc area size or problem count. Strong hint of bouldering, not a confirmed separate area. Sources: https://landes.altissimo.fr/ (checked 2026-11-11). Next: open the "Topo de la salle" in a browser or phone 05 58 56 11 25.
- **Bloc'n Roll (frc-046) vs SOLO Escalade Toulouse**: STATUS: OPEN (confidence M). The official page confirms the identity half: Bloc'n Roll is "anciennement sous l'enseigne Solo Escalade" and became a worker cooperative in 2018, in L'Union near Toulouse; it does not print an address or hours (Horaires page not loaded) and the existing SOLO record's pin is 5.5 km away. Whether the existing SOLO Toulouse record is this same business (rename and move) or a second SOLO site is not stated. Sources: https://www.blocnroll.fr/ (checked 2026-11-11). Next: NEEDS HUMAN (compare the existing SOLO record's address with 51 route de Bessières, L'Union; if the same, rename and move; else add Bloc'n Roll as new).
- **Annette K. (Climbing District, Paris 6e) (frc-062)**: STATUS: OPEN (confidence M). Official page describes only "20 enrouleurs" (auto-belay rope lines), hours Mo-Fr 7:30-22, weekends 9-19:30, and says access is limited to adults with an annual subscription. No bouldering mentioned, no day pass shown. Leans keep out. Sources: https://climbingdistrict.com/salle-escalade/annette-k/ (checked 2026-11-11). Next: keep out unless a bloc area or public day pass is shown.
- **B'wall Lorient (frc-040) pin**: STATUS: NEEDS HUMAN (confidence L). Pin choice between the site's own JSON-LD coordinates and the OSM node 175 m west needs satellite inspection; the operator does not publish an entrance coordinate in the text read. Next: map inspection at 47.7780, -3.3529 vs 47.7789, -3.3548.
- **The Roof Rennes (frc-016)**: STATUS: OPEN (confidence M). Page is current with events through 14 Jan 2027 (open day 8 Oct 2026, "Faites de l'escalade" 6-8 Nov 2026, contest 28 Nov 2026) and a live gauge; it does not say whether the Hôtel-Dieu use is temporary or give an end date. Sources: https://rennes.theroof.fr/ (checked 2026-11-11). Next: none needed for the listing; ask the operator (06 69 23 18 26) about long-term status if wanted.
- **Space Bloc (frc-061)**: STATUS: OPEN (confidence M). Contact page is current (exceptional hours Wed 11 Nov 9-19, Thu 19 Nov 17-22, market on 29 Nov 2026) but still shows no street address or regular hours; those are on an "Informations" page. Sources: https://www.spacebloc.fr/contact (checked 2026-11-11). Next: read the Informations page in a browser.
- **Block'Out Marcq-en-Baroeul, Antipode (Brive/Trélissac), Granit (Rueil-Malmaison)**: STATUS: OPEN (confidence L). Not re-checked; no new evidence (see unlocated.md). Next: search for operator pages.
- **Vertical'Art Lille (Lezennes)**: STATUS: OPEN (confidence L). Not re-checked; temporary closure after fire, no reopening date. Next: recheck when it reopens.
- **Blocbuster La Défense / Versailles**: STATUS: ALREADY RESOLVED (confidence M): keep out, permanently closed (liquidation 2026) per this file's own notes; not re-verified today. Next: none.
