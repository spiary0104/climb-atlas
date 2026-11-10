# Regional research: Japan: Kanto re-check of deferred gyms (2026-11-06-jp-kanto-recheck)

Scope: JP / SAITAMA, KANAGAWA, CHIBA, TOKYO
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul, 2026-10-13-australia, 2026-10-13-brazil, 2026-10-13-italy-cities, 2026-10-13-jp-remaining, 2026-10-13-uk-cities, 2026-10-13-us-central-metros, 2026-10-13-us-ny-boston-metros | other sections compared: 2026-10-06-jp-chubu, 2026-10-06-jp-kansai, 2026-10-06-jp-kanto, 2026-10-06-jp-kyushu-hokkaido, 2026-10-13-jp-remaining
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
14 candidate(s): ready 6 | review 8 | blocked 0 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (8)
- jp2-bonobo "BONOBO bouldering space" [g-1000c0efa0] reviewed_against must include: 2026-10-06-jp-kanto#jp-bonobo-ageo
  - other-section: 2026-10-06-jp-kanto#jp-bonobo-ageo "BONOBO bouldering space": name-match same-name ("BONOBO bouldering space" / "BONOBO bouldering space", 0 m)
- jp2-grimrock "GRIMROCK Climbing Gym" [g-67bc972191] reviewed_against must include: 2026-10-06-jp-kanto#jp-grimrock-yokohama
  - other-section: 2026-10-06-jp-kanto#jp-grimrock-yokohama "GRIMROCK Climbing Gym": name-match same-name ("GRIMROCK Climbing Gym" / "GRIMROCK Climbing Gym", 0 m)
- jp2-jet-set "JET SET Climbing Gym" [g-8205ae1532]
  - weak-coordinates: coordinates are street-level, not the building
- jp2-monolithe "Monolithe Bouldering Gym Kawagoe" [g-e68ff30606] reviewed_against must include: 2026-10-06-jp-kanto#jp-monolithe-kawagoe
  - other-section: 2026-10-06-jp-kanto#jp-monolithe-kawagoe "Monolithe Bouldering Gym Kawagoe": name-match same-name ("Monolithe Bouldering Gym Kawagoe" / "Monolithe Bouldering Gym Kawagoe", 0 m)
- jp2-next-gen "Next Gen Bouldering" [g-4e763802f9] reviewed_against must include: 2026-10-06-jp-kanto#jp-next-gen-bouldering-niiza
  - other-section: 2026-10-06-jp-kanto#jp-next-gen-bouldering-niiza "Next Gen Bouldering": name-match same-name ("Next Gen Bouldering" / "Next Gen Bouldering", 0 m)
- jp2-stone-magic "Climbing Park STONE MAGIC" [g-992b71e463] reviewed_against must include: 2026-10-06-jp-kanto#jp-stone-magic-sagamihara
  - other-section: 2026-10-06-jp-kanto#jp-stone-magic-sagamihara "STONE MAGIC Climbing Park": name-match same-address-related-name ("Climbing Park STONE MAGIC" / "STONE MAGIC Climbing Park", 0 m)
- jp2-tohan-dojo "Tohan Dojo Bouldering Gym" [g-d0c21b435e] reviewed_against must include: 2026-10-06-jp-kanto#jp-tohan-dojo-chiba
  - other-section: 2026-10-06-jp-kanto#jp-tohan-dojo-chiba "Tohan Dojo Bouldering Gym": name-match same-name ("Tohan Dojo Bouldering Gym" / "Tohan Dojo Bouldering Gym", 0 m)
- jp2-tss-tokyo "THE STONE SESSION TOKYO" [g-338a4fe373] reviewed_against must include: 2026-10-06-jp-kanto#jp-the-stone-session-tokyo
  - other-section: 2026-10-06-jp-kanto#jp-the-stone-session-tokyo "THE STONE SESSION TOKYO": name-match same-name ("THE STONE SESSION TOKYO" / "THE STONE SESSION TOKYO", 0 m)

## Ready (no flags; still needs an explicit accept) (6)
- jp2-beaks "BEAKS Climbing Studio" [g-21d55d1630]
- jp2-hann2 "HANN2 Bouldering Gym Atsugi" [g-dffcff5a6c]
- jp2-hutte "Climbing Gym Hutte" [g-a5d53d65ff]
- jp2-okku-rock "OKKU ROCK" [g-6d0f4a0dc5]
- jp2-q-roche "Climbing Park Q-Roche" [g-d155b43ca0]
- jp2-wisteria "Climbing Wisteria" [g-a9fdc19416]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-11-06-jp-kanto-recheck`.
Nothing here touches production.
