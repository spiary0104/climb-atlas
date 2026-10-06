# Coverage: France, independents and missing chains in the big cities (2026-10-06-france-cities)

## Result
- 66 candidates (frc-001 to frc-066), 44 sources registered. 21 unlocated or excluded leads are listed in `unlocated.md`.
- `research reconcile`: ready 53 | review 8 | blocked 5 | existing 0 | invalid 0 (every candidate is new to Bouldeer; the importer found no duplicate).
- Decisions: accept 60 | same-as 0 | defer 3 | reject 3 (1 temporarily closed, 2 permanently closed).
- Scope: FR, 8 regions (Ile-de-France, Auvergne-Rhone-Alpes, Pays de la Loire, Occitanie, Nouvelle-Aquitaine, Grand Est, Hauts-de-France, Bretagne). Second pass after `2026-10-05-france-chains` and `2026-10-06-france-holds`; no overlap with their gyms (the importer checked the same-country sections).

## Per city: estimated real-world gyms (2026-10-06 gap analysis) vs Bouldeer before vs this section
| City | Real world (est.) | In Bouldeer before | New accepted here | Remaining leads |
|---|---|---|---|---|
| Grenoble and Isere | ~12 | 1 (Vertical'Art) | 7: Espace Vertical 3, Le Labo, ABLOK Grenoble, L'Orangerie Perchee, Au Perchoir (Crolles), ABLOK Voiron, Le Bloc de l'Ours (Villard-de-Lans) | Espace Vertical 4 (rope only on its page), Hapik x2 (fun/auto-belay, not bouldering), Halle Chartreuse (municipal hall) |
| Nantes | ~10 | 2 (Block'Out, Vertical'Art) | 4: Altissimo Nantes (Saint-Sebastien), Pic et Paroi - Le Bloc, ELCAP (Saint-Herblain), UCPA Sport Station | Relief Escalade (wall builder, not a gym) |
| Paris and Ile-de-France | ~40 | 26 | 6: Climbing District Pont-de-Neuilly, Blocbuster Courbevoie, Hardbloc (Alfortville), Climb Arena (Cormeilles), Karma La Villette, Karma Fontainebleau | Granit (Rueil-Malmaison, no site found), Big Wall Franconville and Roc et Resine (Thiais): rope halls or clubs, bouldering not seen; Blocbuster La Defense and Versailles closed for good (rejected) |
| Bordeaux | ~12 | 5 | 1: UCPA Sport Station Bordeaux | Hapik Ginko (fun, not bouldering); OSM and Nominatim show no other private hall |
| Toulouse | ~12 | 7 | 2: Start in Bloc (Quint-Fonsegrives), La O Escalade (Portet) | Bloc'n Roll (L'Union) deferred: possibly the existing "SOLO Escalade - Toulouse" |
| Lille | ~10 | 4 | 0 | Vertical'Art Lille is closed after a fire (rejected as temporary); OSM node "Block'out" in Marcq-en-Baroeul has no page on blockout.fr |
| Strasbourg | ~8 | 2 | 4: Hueco City, Hueco Zenith, Bloc en Stock, Instant Grimpe (Molsheim) | Roc en Stock (rope hall; its cards give access to Bloc en Stock) |
| Montpellier | ~8 | 2 | 4: Altissimo Grabels, Altissimo Odysseum, Boulder Line 1 (Castelnau-le-Lez), Boulder Line 3 City | Boulder Line "BL2" is only an old OSM node; Mad Monkey is a fun park |
| Rennes | ~6 | 1 | 2: The Roof Rennes, Modjo | Hapik Rennes (fun) |
| Lyon | ~16 | 11 | 1 nearby: Espace Escalade (L'Arbresle) | none found: OSM, Nominatim and every chain list agree with Bouldeer's 11 |
| Other in-scope towns | n/a | n/a | 29: Albi x2, Metz x2, Perpignan x2 (Altissimo, La Grappe), Montauban, Brest, Saint-Brieuc, Vannes, Lanester, Quimper, Plescop, Poitiers, Bayonne, Labenne, Pau, Bourg-de-Peage, Saint-Etienne, Chambery area x2, Bourgoin-Jallieu, Le Puy, Vichy, Yzeure, Annecy x2, Saint-Gervais, Les Houches | see `unlocated.md` |

(Counts add up to the 60 accepted: 7 + 4 + 6 + 1 + 2 + 4 + 4 + 2 + 1 + 29.)

## What was checked, chain by chain
- **Altissimo**: chain page lists 13 sites (Albi, Landes, Marseille, Metz x2, Montpellier x2, Nantes, Perpignan, Toulouse x3, Lisbon). Toulouse x3 were already in Bouldeer, Marseille is PACA (out of scope), Lisbon is Portugal. Seven are accepted (each own page states a count of boulder problems, hours and address); Landes is deferred (only the page title says "Salle de Bloc").
- **Hapik**: 19 sites on the chain page; the activity pages describe fun climbing with auto-belays, plus one augmented-reality wall "similar to bloc". Not bouldering gyms, none added (the existing "HAPIK - Lyon" record is untouched).
- **Arkose**: every French site on arkose.com in scope was compared with Bouldeer and already exists (Canal is Brussels, Madrid is Spain).
- **Block'Out**: all 11 French pages in scope already exist. "Block'out" in Marcq-en-Baroeul exists only as an OSM node (page blockout.fr/bo-lille gives 404).
- **Vertical'Art**: 14 sites on the group page; Lille (Lezennes) was the only missing one in scope and it is closed after a fire.
- **Climbing District**: six Paris-area sites listed; Pont-de-Neuilly was the missing one. "Annette K." (Paris 6e) is a rope/auto-belay hall (deferred).
- **The Roof**: network page lists 10 halls; 7 in scope are accepted (Brest, Rennes, Saint-Brieuc, Albi, Poitiers, Bayonne, Vercors), Toulouse was already there, Le Havre and Cherbourg are Normandy.
- **Hueco** (Strasbourg), **Espace Vertical** (Grenoble), **ABLOK** (Grenoble, Voiron; Annecy already existed), **Boulder Line** (Montpellier area), **B'wall** (Vannes, Lanester, Quimper), **Karma** (FFME halls), **Blocbuster**, **UCPA Sport Station** (Nantes and Bordeaux only; no other site found at ucpa.com/sport-station/<city>), **Pic et Paroi**, **ELCAP**: own sites read.
- Climb Up, Bloc Session, M'ROC, Antrebloc, MurMur and Le Pan were done by `2026-10-05-france-chains` and were not repeated. Grimper, Pan Club and Chamboulder: no French site found for them.

## Method
- Discovery without a web search engine (the shared search budget was spent): chain location pages; an Overpass extract of every OSM `leisure=sports_centre` with `sport=climbing` in France (603 elements) and every element with `climbing:boulder=yes` (443), compared with Bouldeer's French gyms (anything within 250 m of an existing gym dropped); Nominatim and Photon name searches inside each priority city box. Each lead was then read on its own site (static fetch; Boulder Line is a JavaScript app and was read in a browser).
- Coordinates: 62 of 66 come from the gym's own OSM element (checked against a BAN house-number point at most a few tens of metres away), 1 from the gym's own JSON-LD pin (B'wall Lanester), 1 from the gym's own embedded map (Annette K.), 2 from BAN house-number points (Altissimo Metz Haut Gazon, B'wall Quimper). Each `research_notes` gives the distance between the OSM element and the BAN point.
- Duplicates: the importer's matching and the stricter review radii found nothing against Bouldeer or the two earlier France sections. One suspected duplicate against an existing gym with an old name is deferred (Bloc'n Roll / SOLO Escalade).

## Not done / uncertain
- No search-engine pass: gyms that are neither on a chain page nor tagged `sport=climbing` in OSM could be missing, especially small independents in Paris, Lyon, Lille and Bordeaux. Leads: `unlocated.md`.
- Some hours were not readable (script-loaded widgets): recorded as "not read" in the notes.
- Municipal and club walls (about 400 OSM elements) were deliberately left out.

## Access problems
- WebSearch budget exhausted before the section started; DuckDuckGo and Bing returned bot challenges (not bypassed) and Brave answered 429, so no search-engine result is used.
- Overpass was slow or 502/504 for city boxes; the national exact-tag queries worked. Overpass queries for `sport=bouldering` and sports halls did not return in time.
- Nominatim `lookup` returned an error during one check; Photon was used for the OSM ids instead.
- auperchoir.fr answers 403 to plain fetches (read with a browser user agent); the domain stclimbing.fr (Saint Climbing, Andernos) now serves an unrelated casino page, so that gym is not used.
