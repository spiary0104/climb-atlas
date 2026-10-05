# Regional research: France: chain gaps (Climb Up, Bloc Session, MurMur, Antrebloc, Le Pan) (2026-10-05-france-chains)

Scope: FR (whole country)
Index: 2272 gyms, sha256 c97e3035f020… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
69 candidate(s): ready 33 | review 17 | blocked 3 | already in Bouldeer 16 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (16)
- fr-003 "Climb Up Marseille - La Valentine" -> seed-1093 "Climb Up - Marseille La Valentine" (same-name, 45 m)
- fr-004 "Climb Up Lyon Gerland" -> seed-1085 "Climb Up - Lyon Gerland" (same-name, 29 m)
- fr-007 "Climb Up Nancy" -> g-47d662e918 "Climb Up - Nancy" (same-name, 12 m)
- fr-009 "Climb Up Bordeaux - Mérignac" -> g-e0d5a84e0e "Climb Up - Bordeaux Mérignac" (same-name, 0 m)
- fr-011 "Climb Up Chambéry" -> g-1b773ea6ba "Climb Up - Chambéry" (same-name, 0 m) | also: no-bouldering
- fr-015 "Climb Up Lyon - Confluence" -> seed-1084 "Climb Up - Lyon Confluence" (same-name, 146 m)
- fr-019 "Climb Up Caen" -> g-db854888ca "Climb Up - Caen" (same-name, 0 m)
- fr-020 "Climb Up Paris - Porte d'Italie" -> seed-1081 "Climb Up - Paris Porte d'Italie" (same-name, 27 m)
- fr-023 "Climb Up Lille Centre" -> g-2309c9eeb7 "Climb Up - Lille Centre" (same-name, 0 m)
- fr-024 "Climb Up Aubervilliers" -> g-4c46ac5a73 "Climb Up - Aubervilliers" (same-name, 0 m)
- fr-025 "Climb Up Saint-Étienne" -> g-0e3863a1a0 "Climb Up - Saint-Étienne" (same-name, 0 m)
- fr-031 "MRoc Part-Dieu" -> seed-1088 "MROC - Part-Dieu" (same-name, 0 m)
- fr-034 "Bloc Session Aix-en-Provence" -> g-2f12232d66 "Bloc Session - Aix-en-Provence" (same-name, 0 m)
- fr-048 "Bloc Session Lyon Centre" -> g-eef9a68caf "Bloc Session - Lyon Centre" (same-name, 51 m)
- fr-062 "Bloc Session Toulon centre" -> g-bba5dfa0ec "Bloc Session - Toulon Centre" (same-name, 0 m)
- fr-066 "Arkose Pantin" -> g-b7c516ac9f "Arkose - Pantin" (same-name, 86 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (17)
- fr-010 "Climb Up Bordeaux - Eysines" [g-1691bbd032] reviewed_against must include: fr-009, fr-021, g-e0d5a84e0e
  - related-name-nearby: candidate fr-009 "Climb Up Bordeaux - Mérignac": related names "Climb Up Bordeaux - Eysines" / "Climb Up Bordeaux - Mérignac" 3424 m apart
  - related-name-nearby: candidate fr-021 "Climb Up Bordeaux Villenave": related names "Climb Up Bordeaux - Eysines" / "Climb Up Bordeaux Villenave" 11953 m apart
  - related-name-nearby: g-e0d5a84e0e "Climb Up - Bordeaux Mérignac": related names "Climb Up Bordeaux - Eysines" / "Climb Up - Bordeaux Mérignac" 3424 m apart
- fr-017 "Climb Up Lille - Wambrechies" [g-8067294135] reviewed_against must include: fr-016, fr-023, g-2309c9eeb7
  - related-name-nearby: candidate fr-016 "Climb Up Lille Lesquin": related names "Climb Up Lille - Wambrechies" / "Climb Up Lille Lesquin" 11375 m apart
  - related-name-nearby: candidate fr-023 "Climb Up Lille Centre": related names "Climb Up Lille - Wambrechies" / "Climb Up Lille Centre" 5275 m apart
  - related-name-nearby: g-2309c9eeb7 "Climb Up - Lille Centre": related names "Climb Up Lille - Wambrechies" / "Climb Up - Lille Centre" 5275 m apart
- fr-018 "Climb Up Lille Villeneuve d'Ascq" [g-9c59152858] reviewed_against must include: fr-023, g-2309c9eeb7
  - related-name-nearby: candidate fr-023 "Climb Up Lille Centre": related names "Climb Up Lille Villeneuve d'Ascq" / "Climb Up Lille Centre" 5162 m apart
  - related-name-nearby: g-2309c9eeb7 "Climb Up - Lille Centre": related names "Climb Up Lille Villeneuve d'Ascq" / "Climb Up - Lille Centre" 5162 m apart
- fr-021 "Climb Up Bordeaux Villenave" [g-a1fabd0c05] reviewed_against must include: fr-009, fr-010, g-e0d5a84e0e
  - related-name-nearby: candidate fr-009 "Climb Up Bordeaux - Mérignac": related names "Climb Up Bordeaux Villenave" / "Climb Up Bordeaux - Mérignac" 10945 m apart
  - related-name-nearby: candidate fr-010 "Climb Up Bordeaux - Eysines": related names "Climb Up Bordeaux Villenave" / "Climb Up Bordeaux - Eysines" 11953 m apart
  - related-name-nearby: g-e0d5a84e0e "Climb Up - Bordeaux Mérignac": related names "Climb Up Bordeaux Villenave" / "Climb Up - Bordeaux Mérignac" 10945 m apart
- fr-032 "MRoc Laennec" [g-28f182daaf] reviewed_against must include: fr-033
  - related-name-nearby: candidate fr-033 "MRoc Villeurbanne": related names "M'ROC Laennec" / "M'ROC Villeurbanne" 4207 m apart
- fr-033 "MRoc Villeurbanne" [g-4c156c806c] reviewed_against must include: fr-032
  - related-name-nearby: candidate fr-032 "MRoc Laennec": related names "M'ROC Villeurbanne" / "M'ROC Laennec" 4207 m apart
- fr-036 "Bloc Session Avignon" [g-26d534bd15] reviewed_against must include: g-9ad5571912
  - importer-probable-duplicate: g-9ad5571912 renamed-or-related-name-nearby 0 m
  - name-match: g-9ad5571912 "Bloc Session - BS.6 Avignon": renamed-or-related-name-nearby ("Bloc Session Avignon" / "Bloc Session - BS.6 Avignon", 0 m)
- fr-038 "Bloc Session Besançon" [g-95c6963d8d] reviewed_against must include: g-86f95e1310
  - importer-probable-duplicate: g-86f95e1310 renamed-or-related-name-nearby 90 m
  - name-match: g-86f95e1310 "Bloc Session - BS.25 Besançon": renamed-or-related-name-nearby ("Bloc Session Besançon" / "Bloc Session - BS.25 Besançon", 90 m)
- fr-047 "Bloc Session Lyon Beynost" [g-f99ac1d300] reviewed_against must include: fr-048, g-eef9a68caf
  - related-name-nearby: candidate fr-048 "Bloc Session Lyon Centre": related names "Bloc Session Lyon Beynost" / "Bloc Session Lyon Centre" 12982 m apart
  - related-name-nearby: g-eef9a68caf "Bloc Session - Lyon Centre": related names "Bloc Session Lyon Beynost" / "Bloc Session - Lyon Centre" 13026 m apart
- fr-049 "Bloc Session Lyon Craponne" [g-00ef0fe045] reviewed_against must include: fr-048, g-eef9a68caf
  - related-name-nearby: candidate fr-048 "Bloc Session Lyon Centre": related names "Bloc Session Lyon Craponne" / "Bloc Session Lyon Centre" 10061 m apart
  - related-name-nearby: g-eef9a68caf "Bloc Session - Lyon Centre": related names "Bloc Session Lyon Craponne" / "Bloc Session - Lyon Centre" 10043 m apart
- fr-051 "Bloc Session Marseille centre" [g-e669da8e12] reviewed_against must include: fr-052, seed-1091
  - importer-probable-duplicate: seed-1091 renamed-or-related-name-nearby 83 m
  - name-match: seed-1091 "Bloc Session - BS.10 Marseille centre": renamed-or-related-name-nearby ("Bloc Session Marseille centre" / "Bloc Session - BS.10 Marseille centre", 83 m)
  - related-name-nearby: candidate fr-052 "Bloc Session Marseille sud": related names "Bloc Session Marseille centre" / "Bloc Session Marseille sud" 5799 m apart
- fr-052 "Bloc Session Marseille sud" [g-c325ca9c55] reviewed_against must include: fr-051, seed-1091
  - related-name-nearby: candidate fr-051 "Bloc Session Marseille centre": related names "Bloc Session Marseille sud" / "Bloc Session Marseille centre" 5799 m apart
  - related-name-nearby: seed-1091 "Bloc Session - BS.10 Marseille centre": related names "Bloc Session Marseille sud" / "Bloc Session - BS.10 Marseille centre" 5880 m apart
- fr-053 "Bloc Session Montpellier nord" [g-8cd1e04821] reviewed_against must include: fr-054, g-ac8596310d, g-d423156d92
  - importer-probable-duplicate: g-ac8596310d renamed-or-related-name-nearby 37 m
  - name-match: g-ac8596310d "Bloc Session - BS.17 Montpellier Nord": renamed-or-related-name-nearby ("Bloc Session Montpellier nord" / "Bloc Session - BS.17 Montpellier Nord", 37 m)
  - related-name-nearby: candidate fr-054 "Bloc Session Montpellier sud": related names "Bloc Session Montpellier nord" / "Bloc Session Montpellier sud" 11214 m apart
  - related-name-nearby: g-d423156d92 "Bloc Session - BS Montpellier Sud": related names "Bloc Session Montpellier nord" / "Bloc Session - BS Montpellier Sud" 11214 m apart
- fr-054 "Bloc Session Montpellier sud" [g-197e38d8bb] reviewed_against must include: fr-053, g-d423156d92
  - importer-probable-duplicate: g-d423156d92 renamed-or-related-name-nearby 0 m
  - name-match: g-d423156d92 "Bloc Session - BS Montpellier Sud": renamed-or-related-name-nearby ("Bloc Session Montpellier sud" / "Bloc Session - BS Montpellier Sud", 0 m)
  - related-name-nearby: candidate fr-053 "Bloc Session Montpellier nord": related names "Bloc Session Montpellier sud" / "Bloc Session Montpellier nord" 11214 m apart
- fr-055 "Bloc Session Nancy" [g-7a2048ac4a] reviewed_against must include: g-7a108cee9b
  - importer-probable-duplicate: g-7a108cee9b renamed-or-related-name-nearby 63 m
  - name-match: g-7a108cee9b "Bloc Session - BS.14 Nancy": renamed-or-related-name-nearby ("Bloc Session Nancy" / "Bloc Session - BS.14 Nancy", 63 m)
- fr-056 "Bloc Session Nîmes" [g-22fb01e0ac] reviewed_against must include: g-79b2e38409
  - importer-probable-duplicate: g-79b2e38409 renamed-or-related-name-nearby 0 m
  - name-match: g-79b2e38409 "Bloc Session - BS.3 Nîmes": renamed-or-related-name-nearby ("Bloc Session Nîmes" / "Bloc Session - BS.3 Nîmes", 0 m)
- fr-063 "Bloc Session Toulon ouest" [g-b54d1864e5] reviewed_against must include: fr-062, g-bba5dfa0ec
  - related-name-nearby: candidate fr-062 "Bloc Session Toulon centre": related names "Bloc Session Toulon ouest" / "Bloc Session Toulon centre" 7741 m apart
  - related-name-nearby: g-bba5dfa0ec "Bloc Session - Toulon Centre": related names "Bloc Session Toulon ouest" / "Bloc Session - Toulon Centre" 7741 m apart

## Blocked: cannot be accepted (3)
- fr-012 "Climb Up Epinay": no-bouldering (confirmed rope-only (new additions need a bouldering offering)) -> suggested: reject no-bouldering
- fr-016 "Climb Up Lille Lesquin": no-bouldering (confirmed rope-only (new additions need a bouldering offering)) -> suggested: reject no-bouldering
- fr-067 "Arkose Issy-les-Moulineaux (voie)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (33)
- fr-001 "Climb Up Aix - Bouc Bel Air" [g-da2ba86580]
- fr-002 "Climb Up Aubagne" [g-cc0571d0a8]
- fr-005 "Climb Up Brest" [g-e7fb9ec054]
- fr-006 "Climb Up Angers - Les Ponts de Cé" [g-375b427b55]
- fr-008 "Climb Up Limoges" [g-fa22decd6e]
- fr-013 "Climb Up Aix - Les Milles" [g-c2b82e827f]
- fr-014 "Climb Up Dijon" [g-7172d8c9eb]
- fr-022 "Climb Up Mulhouse Wittenheim" [g-d190d816e7]
- fr-026 "Climb Up Cergy" [g-2d669a7807]
- fr-027 "Climb Up Orléans" [g-4fb4fbed4d]
- fr-028 "Climb Up Le Mans" [g-d2164daa6d]
- fr-029 "Climb Up Nîmes" [g-8543d8c840]
- fr-030 "Climb Up Istres" [g-c9b603935b]
- fr-035 "Bloc Session Ajaccio" [g-59d3478619]
- fr-037 "Bloc Session Belfort" [g-7007ead23e]
- fr-039 "Bloc Session Béziers" [g-15ffed3aa2]
- fr-040 "Bloc Session Biarritz" [g-86f45a6c06]
- fr-041 "Bloc Session Chalon-sur-Saône" [g-d92771320e]
- fr-042 "Bloc Session Chinon" [g-4724015231]
- fr-043 "Bloc Session Gap" [g-ef5b48f0bb]
- fr-044 "Bloc Session Haguenau" [g-63613953bc]
- fr-045 "Bloc Session La Ciotat" [g-95a27d6ef5]
- fr-046 "Bloc Session Loire Estuaire" [g-16ce0a549b]
- fr-050 "Bloc Session Marne-la-Vallée" [g-96d0b309b5]
- fr-057 "Bloc Session Pertuis" [g-5671a2c0e4]
- fr-058 "Bloc Session Pontarlier" [g-3515cabc4e]
- fr-059 "Bloc Session Rouen" [g-a51b939708]
- fr-060 "Bloc Session Salon" [g-66ac06b0d9]
- fr-061 "Bloc Session Strasbourg" [g-685df4d86d]
- fr-064 "Bloc Session Vienne" [g-ee78f54336]
- fr-065 "Antrebloc" [g-deb0b9f45f]
- fr-068 "Le Pan d'Avignon" [g-f53224b303]
- fr-069 "Vertical Park Le Pontet" [g-5ac47ca5ea]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-france-chains`.
Nothing here touches production.
