# Tier A wave 1: location-update follow-ups (prepared, NOT executed)

Same-as decisions whose existing Bouldeer pin is wrong by more than 150 m. Generated from the review decisions against index 8dbddf7924c2…; draft updater records are in `location-update-followups.json`. Nothing here has been staged or applied; existing gyms are unchanged.

| Existing gym | Current pin off by | Proposed pin (source) | Precision | Also fills address | From |
|---|---:|---|---|---|---|
| `seed-1493` Skalodrom Tramontana | 10546 m | 59.914002, 30.3234707 (osm node/1402188633) | building | no | `2026-10-01-russia` ru-020 |
| `seed-1491` Klub Igels | 9133 m | 59.9062431, 30.2814162 (official-map map marker on https://igelsclub.ru/kak-dobratsa) | building | no | `2026-10-01-russia` ru-018 |
| `seed-1492` Severnaya Stena Petrogradskaya Skalodrom | 7491 m | 59.9682893, 30.2923918 (osm node/9124072117) | building | no | `2026-10-01-russia` ru-022 |
| `seed-1695` Rock Domain Climbing Gym | 4516 m | 13.6639476, 100.6479003 (osm node/5374585867) | building | no | `2026-10-01-thailand` th-007 |
| `seed-1700` Rebel Rock Climbing | 4509 m | 7.9752039, 98.3404014 (osm node/4621645591) | building | no | `2026-10-01-thailand` th-012 |
| `seed-1698` Progression Vertical | 4245 m | 18.7467597, 98.9879227 (osm way/1159988644) | building | no | `2026-10-01-thailand` th-011 |
| `seed-1597` Venga | 2308 m | 32.107394, 34.893973 (official-map https://waze.to/li/hsv8ydhcp0 (site Waze link; resolves to ll 32.107394,34.893973)) | building | yes: Moshe Shwaleb 7, Segula industrial zone, Petah Tikva (floor 2) | `2026-10-01-israel` il-012 |
| `seed-1583` Crag Studio | 1266 m | 17.4349973, 78.3597544 (osm way/559183200) | building | no | `2026-10-01-india` in-010 |
| `seed-1754` Urban Playground Climbing | 1248 m | 13.7362979, 100.5763602 (osm node/11112955887) | building | no | `2026-10-01-thailand` th-006 |
| `seed-1590` Performance Rock | 872 m | 31.2381012, 34.7929965 (official-map https://performancerock.co.il/ Waze link ll=31.23810120,34.79299650) | building | no | `2026-10-01-israel` il-002 |
| `seed-1752` Stonegoat Climbing Gym | 844 m | 13.7167551, 100.5930329 (official-map https://maps.app.goo.gl/4F3dNGJMZv5Bjfqv9) | building | no | `2026-10-01-thailand` th-004 |
| `seed-1596` Monkeys climbing gym | 391 m | 32.2766577, 34.8618323 (official-map https://www.google.com/maps/place/Monkeys+Climbing+Gym/@32.2766622,34.8592574 (data !3d32.2766577!4d34.8618323)) | building | no | `2026-10-01-israel` il-009 |
| `seed-1104` Klätterfabriken High Sports | 223 m | 57.7010961, 11.9938563 (osm node/3715375091) | building | no | `2026-10-01-sweden` se-010 |

Before execution: owner confirms each; then a location-update batch goes through validate -> plan -> import --dry-run (FULL) -> explicit approval -> --apply -> --verify -> build-index --live. The 60 m rule and expect_h protections apply.
