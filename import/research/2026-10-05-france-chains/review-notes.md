# Review notes: France chain gaps (2026-10-05-france-chains)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Reviewed 2026-10-05. Tally: accept 43 | same-as 23 | reject 2 | defer 1 (69 candidates).

## Same-as (23)
- Importer exact matches (same name, 0-146 m): fr-003 La Valentine, fr-004 Lyon Gerland, fr-007 Nancy, fr-009 Mérignac, fr-015 Lyon Confluence, fr-019 Caen, fr-020 Paris Porte d'Italie, fr-023 Lille Centre, fr-024 Aubervilliers, fr-025 Saint-Étienne, fr-031 MRoc Part-Dieu, fr-034 BS Aix-en-Provence, fr-048 BS Lyon Centre, fr-062 BS Toulon centre, fr-066 Arkose Pantin.
- fr-011 Climb Up Chambéry -> g-1b773ea6ba: already in Bouldeer; own page says rope-only ("salle de voies"), so left as it is.
- Probable duplicates resolved as the same gym (the existing records carry the chain's branch number in the name): fr-036 BS.6 Avignon (0 m), fr-038 BS.25 Besançon (90 m), fr-051 BS.10 Marseille centre (83 m), fr-053 BS.17 Montpellier nord (37 m), fr-054 BS.7 Montpellier sud (0 m), fr-055 BS.14 Nancy (63 m), fr-056 BS.3 Nîmes (0 m). None needs a location update (pin gaps under 150 m).
- fr-066: MurMur Pantin is already in Bouldeer as "Arkose - Pantin" (the gym was renamed when Arkose took over MurMur).

## Rejects (2)
- fr-012 Climb Up Epinay and fr-016 Climb Up Lille Lesquin: own pages describe rope-only gyms (voies, fun climbing); the store list tags them VOIE only. Lesquin was on the owner's backlog.

## Defer (1)
- fr-067 Arkose Issy-les-Moulineaux (voie), the former MurMur Issy: bouldering not established on a primary source (see review.json).

## Accepts with a caveat on the pin
- fr-022 Mulhouse-Wittenheim: chain pin lies 542 m east on a house; the OSM node has the gym's phone, website and hours, so it was used. fr-026 Cergy: chain pin lies on a primary school (406 m away); OSM node used.
- fr-063 Bloc Session Toulon ouest: pin is a BAN house-number point (525 chemin des Négadoux, Six-Fours); OSM has no gym element there. Worth a quick look at the satellite view when the owner checks pins.
- fr-039 Béziers, fr-040 Biarritz, fr-041 Chalon-sur-Saône, fr-059 Rouen: BAN house-number points (no gym element in OSM), checked against the Nominatim street/address objects within 5-90 m.
- fr-042 Chinon: pin is the OSM building tagged 44 rue Bernard Palissy.
- fr-046 Loire Estuaire: the only OSM element is an older fitness_centre node named "Bloc Session" on avenue des Frères Lumière, Saint-Brevin; it agrees with the street (the branch page hours are script-loaded, so the OSM hours could not be cross-checked).
- fr-037 Belfort, fr-035 Ajaccio, fr-060 Salon: OSM element chosen over a street-level BAN point (297, 242 and 307 m away); OSM nodes carry the street names/URL.

## Accepts with chain-branch flags
- Every Climb Up, M'ROC and Bloc Session accept that carries a related-name flag is a different branch with its own address and city (the flags list the neighbouring branches and the distances, 3-13 km). reviewed_against lists every id.

## Things the owner may want to know
- BS.33 and Bloc Session Ardennes are not added (unlocated.md).
- MurMur's own site was unreachable; MurMur is Arkose now.
- Le Pan = Le Pan d'Avignon plus Vertical Park (Le Pontet); Vertical Park is about 1.3 km from Bloc Session Avignon, a separate gym.
