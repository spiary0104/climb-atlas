# Regional research: Netherlands: coverage gap (2026-10-06-netherlands)

Scope: NL (whole country)
Index: 2438 gyms, sha256 27073d25c2df… | staged batches compared: 2026-10-06-de-south | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
36 candidate(s): ready 33 | review 2 | blocked 1 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- nl-025 "Boulderhal de Fabriek Haarlem" [g-ba778a89fb] reviewed_against must include: nl-026
  - related-name-nearby: candidate nl-026 "Boulderhal de Fabriek Hoofddorp": related names "Boulderhal de Fabriek Haarlem" / "Boulderhal de Fabriek Hoofddorp" 9253 m apart
  - same-website: candidate nl-026 has the same website
- nl-026 "Boulderhal de Fabriek Hoofddorp" [g-996f029d81] reviewed_against must include: nl-025
  - related-name-nearby: candidate nl-025 "Boulderhal de Fabriek Haarlem": related names "Boulderhal de Fabriek Hoofddorp" / "Boulderhal de Fabriek Haarlem" 9253 m apart
  - same-website: candidate nl-025 has the same website

## Blocked: cannot be accepted (1)
- nl-015 "National Climbing Center Nieuwegein": status-not-open (status_claim is opening-soon); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (33)
- nl-001 "Boulderhal Sendmast" [g-e82deff66f]
- nl-002 "IMPACT Boulderhal" [g-7401362b20]
- nl-003 "Kei Boulderhal Wagenwerkplaats" [g-a3dd2c31de]
- nl-004 "Kei Boulderhal De Hoef" [g-20d7a4b9b6]
- nl-005 "Kei Boulderhal Zwitsal" [g-e9b6ef9e98]
- nl-006 "Boulderhal Bruut" [g-d51055862f]
- nl-007 "Beest Boulders Breda" [g-ed331f1849]
- nl-008 "Beest Boulders Delft" [g-7bac17a411]
- nl-009 "Revolt Bouldering Gym" [g-95c6137bce]
- nl-010 "Bouldercentrum Delfts Bleau" [g-e04a57cbac]
- nl-011 "Climbing Center Dordrecht" [g-18edb2b711]
- nl-012 "Climbing Center Heerenveen" [g-e4db5956ce]
- nl-013 "Climbing Center Leeuwarden" [g-ac222cae95]
- nl-014 "Boulder Gym Arnhem Rijnhal" [g-b88e496c76]
- nl-016 "MONO Boulder" [g-233b499de5]
- nl-017 "Monk bouldergym Eindhoven" [g-75dcd02a7c]
- nl-018 "Monk bouldergym Hilversum" [g-059d37135a]
- nl-019 "Boulder Neoliet Eindhoven" [g-641fe95b09]
- nl-020 "Boulder Neoliet Veldhoven" [g-1e4ae46246]
- nl-021 "Boulder Neoliet Tilburg" [g-54558b2b15]
- nl-022 "Boulder Neoliet Apeldoorn" [g-b696dd357f]
- nl-023 "Boulderhal Block013" [g-65452f1874]
- nl-024 "Cube Bouldergym" [g-9f43eb1687]
- nl-027 "Boulderhal Kunststof" [g-cf5892e880]
- nl-028 "Boulderhal Krachtstof" [g-92147da66b]
- nl-029 "Radium Boulders" [g-38eb6656c8]
- nl-030 "GRIP Boulderhal Nijmegen" [g-ab0ecb28fb]
- nl-031 "Boulderhal Bossche Boulders" [g-980c904b70]
- nl-032 "Boulderkerk Venlo" [g-583828e63d]
- nl-033 "BAZ Bouldergym" [g-d22028992c]
- nl-034 "Boulderhal Roest" [g-e4b28507c0]
- nl-035 "Apex Boulders" [g-79c2641f03]
- nl-036 "Boulderhal Vrijhaven" [g-b7ac4de1fd]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-netherlands`.
Nothing here touches production.
