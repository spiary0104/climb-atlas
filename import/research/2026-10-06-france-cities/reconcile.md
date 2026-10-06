# Regional research: France: independents and missing chains in the big cities (2026-10-06-france-cities)

Scope: FR / ILE_DE_FRANCE, AUVERGNE_RHONE_ALPES, PAYS_DE_LA_LOIRE, OCCITANIE, NOUVELLE_AQUITAINE, GRAND_EST, HAUTS_DE_FRANCE, BRETAGNE
Index: 2438 gyms, sha256 27073d25c2df… | staged batches compared: none | other sections compared: 2026-10-05-france-chains, 2026-10-06-france-holds
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
66 candidate(s): ready 53 | review 8 | blocked 5 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (8)
- frc-004 "Altissimo Montpellier Grabels" [g-dc36370043] reviewed_against must include: frc-005
  - related-name-nearby: candidate frc-005 "Altissimo Montpellier Odysseum": related names "Altissimo Montpellier Grabels" / "Altissimo Montpellier Odysseum" 10593 m apart
- frc-005 "Altissimo Montpellier Odysseum" [g-5d084ba73c] reviewed_against must include: frc-004
  - related-name-nearby: candidate frc-004 "Altissimo Montpellier Grabels": related names "Altissimo Montpellier Odysseum" / "Altissimo Montpellier Grabels" 10593 m apart
- frc-022 "Hueco City" [g-9c96d10277] reviewed_against must include: frc-023
  - same-website: candidate frc-023 has the same website
- frc-023 "Hueco Zenith" [g-c29b2de354] reviewed_against must include: frc-022
  - same-website: candidate frc-022 has the same website
- frc-040 "B'wall Lorient (Lanester)" [g-d5d10db939]
  - weak-coordinates: coordinates are street-level, not the building
- frc-041 "B'wall Quimper" [g-66d3a3d442]
  - single-source: all evidence comes from one source
- frc-042 "Boulder Line 1 (Castelnau-le-Lez)" [g-b45e6000fb] reviewed_against must include: frc-043
  - same-website: candidate frc-043 has the same website
- frc-043 "Boulder Line 3 City (Montpellier)" [g-1b48f454c4] reviewed_against must include: frc-042
  - same-website: candidate frc-042 has the same website

## Blocked: cannot be accepted (5)
- frc-008 "Altissimo Landes": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- frc-025 "Vertical'Art - Lille": temporary (status_claim is temporary); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: reject temporary
- frc-031 "Blocbuster La Défense": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: reject closed
- frc-032 "Blocbuster Versailles": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: reject closed
- frc-062 "Annette K. (Climbing District, Paris 6e)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (53)
- frc-001 "Altissimo Albi" [g-42161cb45e]
- frc-002 "Altissimo Metz Haut Gazon" [g-787c4d3a6a]
- frc-003 "Altissimo Metz Loisirama" [g-51adae9d61]
- frc-006 "Altissimo Nantes" [g-c5bc9cbcbf]
- frc-007 "Altissimo Perpignan" [g-7fa2bfce6a]
- frc-009 "Espace Vertical 3" [g-7c3105fa67]
- frc-010 "Le Labo (Espace Vertical)" [g-5dd31eb55c]
- frc-011 "ABLOK Grenoble" [g-f08fa97671]
- frc-012 "ABLOK Voiron" [g-d9a8224398]
- frc-013 "L'Orangerie Perchée" [g-28a763e4c3]
- frc-014 "Au Perchoir" [g-f70a8a56dd]
- frc-015 "The Roof Brest" [g-855ccfbf00]
- frc-016 "The Roof Rennes" [g-1e11a562a5]
- frc-017 "The Roof Poitiers" [g-8363ecdc78]
- frc-018 "The Roof Albi" [g-f2d04e371e]
- frc-019 "The Roof Pays Basque (Bayonne)" [g-c092799ed8]
- frc-020 "The Roof Vercors" [g-d366767cf8]
- frc-021 "The Roof Saint-Brieuc" [g-a39fe4d585]
- frc-024 "Climbing District - Pont-de-Neuilly" [g-f04cb9c92a]
- frc-026 "Pic et Paroi - Le Bloc" [g-95d87582e6]
- frc-027 "ELCAP" [g-59c668af00]
- frc-028 "UCPA Sport Station Nantes" [g-ac83b743a2]
- frc-029 "UCPA Sport Station Bordeaux" [g-a758a05a2d]
- frc-030 "Blocbuster Courbevoie" [g-9a323d05e0]
- frc-033 "Hardbloc" [g-f860d7675f]
- frc-034 "Climb Arena" [g-e89f6dff5d]
- frc-035 "Karma La Villette" [g-5e8807310d]
- frc-036 "Karma Fontainebleau" [g-7c79384ac7]
- frc-037 "Bloc en Stock" [g-02f57d3060]
- frc-038 "Modjo" [g-cc2534030c]
- frc-039 "B'wall Vannes" [g-22ab3b0cc3]
- frc-044 "Start in Bloc" [g-4cea3626ba]
- frc-045 "Là Ô Escalade" [g-5e2011916f]
- frc-046 "Bloc'n Roll" [g-b4563f186e]
- frc-047 "BlocaBrac" [g-7d4776dabd]
- frc-048 "La Zipette" [g-a691df794f]
- frc-049 "AlpAbloc" [g-cbbbe4c2c5]
- frc-050 "Wattabloc" [g-bd2116952e]
- frc-051 "Techno Bloc" [g-e89c51ffc1]
- frc-052 "Arcabloc" [g-26f7e3f0f4]
- frc-053 "Le Topo Mont Blanc" [g-a2ee1d22e1]
- frc-054 "Mont Blanc Escalade" [g-0f4ddd5fa0]
- frc-055 "Espace Escalade L'Arbresle" [g-cd04629c5d]
- frc-056 "Gravity Bouldering" [g-ba194580b7]
- frc-057 "Bêta-Bloc" [g-a84ea13ce7]
- frc-058 "La Grappe Escalade" [g-796dbcb8b1]
- frc-059 "Climb'Zone" [g-45f2fdf677]
- frc-060 "Instant Grimpe" [g-2f3d152c17]
- frc-061 "Space Bloc" [g-12ae91dc0f]
- frc-063 "Bloc Zone" [g-948232783a]
- frc-064 "Atome Climbing" [g-8d782dbac1]
- frc-065 "Capt'N Hablock" [g-b52bf427e7]
- frc-066 "Le Bloc de l'Ours" [g-7d0df92ee4]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-france-cities`.
Nothing here touches production.
