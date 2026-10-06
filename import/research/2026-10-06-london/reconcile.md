# Regional research: UK: Greater London coverage gap (2026-10-06-london)

Scope: GB (whole country) / bbox -0.7,51.25,0.4,51.75
Index: 2438 gyms, sha256 27073d25c2df… | staged batches compared: none | other sections compared: 2026-10-05-uk-holds-gaps, 2026-10-05-uk-owner-checks, 2026-10-05-uk-single-gym-towns
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
21 candidate(s): ready 18 | review 0 | blocked 3 | already in Bouldeer 0 | invalid 0

## Blocked: cannot be accepted (3)
- arch-acton "The Arch Climbing Wall: Arch Acton": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- arch-north-burnt-oak "The Arch Climbing Wall: Arch North": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- hackney-wick-boulder-project "Hackney Wick Boulder Project": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (18)
- blocfit-brixton "BlocFit Brixton" [g-3fc0852b2f]
- cb-aldgate "City Bouldering Aldgate" [g-5c1f23c597]
- cb-stratford "City Bouldering Stratford" [g-60cb81ef3f]
- cb-white-city "City Bouldering White City" [g-fe74b7ba49]
- cd-building-one "Climbing District Building One" [g-f6e53041ba]
- cd-london-fields "Climbing District London Fields" [g-c802fb9f8d]
- cd-tottenham-hale "Climbing District Tottenham Hale" [g-fc6a351a39]
- climbing-co-fulham "Climbing Co Fulham" [g-025875152e]
- font-borough "The Font Borough" [g-26671a9b9b]
- font-hounslow "The Font Hounslow" [g-39e9863b9b]
- font-wandsworth "The Font Wandsworth" [g-0aa33c91da]
- lcc-bethwall "BethWall Climbing Centre" [g-d1f4618d13]
- lcc-canarywall "CanaryWall Climbing Centre" [g-d41cc4f3e9]
- lcc-eustonwall "EustonWall Climbing Centre" [g-6ede02abab]
- rise-canning-town "Rise Climbing" [g-5de3d2392c]
- substation-brixton "Substation Brixton" [g-4c4f1d6c3d]
- the-reach-charlton "The Reach Climbing Wall" [g-d56fba722d]
- westway-climbing-centre "Westway Climbing Centre" [g-6b47dd6df9]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-london`.
Nothing here touches production.
