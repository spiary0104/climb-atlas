# Regional research: Germany: Thüringen, Sachsen-Anhalt, Saarland + Berlin gaps (2026-10-05-germany-east-saar-berlin)

Scope: DE / THURINGEN, SACHSEN_ANHALT, SAARLAND, BERLIN
Index: 2272 gyms, sha256 c97e3035f020… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
32 candidate(s): ready 8 | review 12 | blocked 8 | already in Bouldeer 4 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (4)
- dee-001 "Blockpark Erfurt" -> seed-968 "Blockpark Erfurt" (same-name, 0 m)
- dee-003 "Plan B Boulderhalle Jena" -> seed-1053 "Plan B Boulderhalle Jena" (same-name, 2 m)
- dee-015 "BlocSchmiede" -> seed-969 "BlocSchmiede" (same-name, 0 m)
- dee-019 "Kletterzentrum Saarbrücken" -> seed-1038 "Kletterzentrum Saarbrücken" (same-name, 0 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (12)
- dee-005 "DAV Kletterhalle Jena (Umspannwerk Jena-Nord)" [g-e540824c2e]
  - limited-access: club wall: check it is open to the public
- dee-006 "Block'n'Roll Boulderhalle Weimar" [g-d80b02d45c]
  - limited-access: club wall: check it is open to the public
- dee-007 "EnergieWände Kletterhalle Weimar" [g-e762a4af0a]
  - limited-access: club wall: check it is open to the public
- dee-014 "Kletterthalia" [g-53a5fda96e]
  - limited-access: club wall: check it is open to the public
- dee-016 "Schmiedebloc" [g-bf83e0c087]
  - limited-access: club wall: check it is open to the public
  - single-source: all evidence comes from one source
  - weak-coordinates: coordinates are street-level, not the building
- dee-017 "Kletteratelier Sangerhausen" [g-0f06d341c1]
  - limited-access: club wall: check it is open to the public
- dee-021 "KBA Kletter- und BoulderArena" [g-7872dfbf9e] reviewed_against must include: seed-1021
  - importer-probable-duplicate: seed-1021 same-address-different-name 5 m
  - name-match: seed-1021 "KBA-Saar": same-address-different-name ("KBA Kletter- und BoulderArena" / "KBA-Saar", 5 m)
- dee-027 "DAV-Kletterzentrum Hochwald" [g-817e68bf0f]
  - limited-access: club wall: check it is open to the public
- dee-028 "urban apes Basement Berlin" [g-e51bda7dbc] reviewed_against must include: dee-029, dee-030, dee-031, seed-962
  - importer-probable-duplicate: seed-962 same-name-but-pin-differs 2279 m
  - name-match: seed-962 "urban apes Basement Berlin": same-name-but-pin-differs ("urban apes Basement Berlin" / "urban apes Basement Berlin", 2279 m)
  - related-name-nearby: candidate dee-029 "urban apes bright site Berlin": related names "urban apes Basement Berlin" / "urban apes bright site Berlin" 2749 m apart
  - related-name-nearby: candidate dee-030 "urban apes Fhain Berlin": related names "urban apes Basement Berlin" / "urban apes Fhain Berlin" 4100 m apart
  - related-name-nearby: candidate dee-031 "urban apes Berlin Wedding": related names "urban apes Basement Berlin" / "urban apes Berlin Wedding" 5824 m apart
- dee-029 "urban apes bright site Berlin" [g-7ed544c7da] reviewed_against must include: dee-028, dee-030, dee-031, seed-962
  - related-name-nearby: candidate dee-028 "urban apes Basement Berlin": related names "urban apes bright site Berlin" / "urban apes Basement Berlin" 2749 m apart
  - related-name-nearby: candidate dee-030 "urban apes Fhain Berlin": related names "urban apes bright site Berlin" / "urban apes Fhain Berlin" 6588 m apart
  - related-name-nearby: candidate dee-031 "urban apes Berlin Wedding": related names "urban apes bright site Berlin" / "urban apes Berlin Wedding" 7879 m apart
  - related-name-nearby: seed-962 "urban apes Basement Berlin": related names "urban apes bright site Berlin" / "urban apes Basement Berlin" 5007 m apart
- dee-030 "urban apes Fhain Berlin" [g-21875c23f6] reviewed_against must include: dee-028, dee-029, dee-031, seed-962
  - related-name-nearby: candidate dee-028 "urban apes Basement Berlin": related names "urban apes Fhain Berlin" / "urban apes Basement Berlin" 4100 m apart
  - related-name-nearby: candidate dee-029 "urban apes bright site Berlin": related names "urban apes Fhain Berlin" / "urban apes bright site Berlin" 6588 m apart
  - related-name-nearby: candidate dee-031 "urban apes Berlin Wedding": related names "urban apes Fhain Berlin" / "urban apes Berlin Wedding" 6664 m apart
  - related-name-nearby: seed-962 "urban apes Basement Berlin": related names "urban apes Fhain Berlin" / "urban apes Basement Berlin" 2155 m apart
- dee-031 "urban apes Berlin Wedding" [g-eee0002c52] reviewed_against must include: dee-028, dee-029, dee-030, seed-962
  - related-name-nearby: candidate dee-028 "urban apes Basement Berlin": related names "urban apes Berlin Wedding" / "urban apes Basement Berlin" 5824 m apart
  - related-name-nearby: candidate dee-029 "urban apes bright site Berlin": related names "urban apes Berlin Wedding" / "urban apes bright site Berlin" 7879 m apart
  - related-name-nearby: candidate dee-030 "urban apes Fhain Berlin": related names "urban apes Berlin Wedding" / "urban apes Fhain Berlin" 6664 m apart
  - related-name-nearby: seed-962 "urban apes Basement Berlin": related names "urban apes Berlin Wedding" / "urban apes Basement Berlin" 5110 m apart

## Blocked: cannot be accepted (8)
- dee-008 "Kletterhütte Ilmenau": status-not-open (status_claim is opening-soon); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer
- dee-009 "Freizeit- und Kletterhalle Schmölln": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer
- dee-010 "Life Kletterhalle Saalfeld": not-a-gym (category other); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: reject not-a-gym
- dee-011 "Indoor-Kletterpark Alte Brauerei Eisenach": not-a-gym (category other); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: reject not-a-gym
- dee-012 "St. Veit Kletterturm (DAV Meiningen)": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- dee-018 "Kletterzentrum Zuckerturm": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- dee-024 "Dada Boulders": closed (status_claim is closed); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: reject closed
- dee-026 "DAV Kletterhalle Ensdorf": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (8)
- dee-002 "Nordwand Erfurt" [g-7e3233afc7]
- dee-004 "rocks. Kletterzentrum Jena" [g-9384ac6b84]
- dee-013 "Boulderkombinat" [g-c5c549c75f]
- dee-020 "Boulderwerk Saarbrücken" [g-5531877271]
- dee-022 "Rocklands Saarlouis" [g-f4a13de335]
- dee-023 "Rocklands Kletterzentrum St. Wendel" [g-ea430df221]
- dee-025 "Boulder Olymp" [g-6614cca3aa]
- dee-032 "Der Kegel" [g-da30bc5be4]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-05-germany-east-saar-berlin`.
Nothing here touches production.
