# Coverage-gap sprint 2026-10-06: status (interrupted by usage limit)

Branch `research/2026-10-06-coverage-gap` (no PR, nothing applied). Rankings: `ranking-countries.md`, `ranking-cities.md`; estimates: the four JSON files.

Merged here (staged, validated, planned, read-only dry-run passed): de-south 67, us-midwest 58, us-west 53, london 18 = 196 new gyms.

Still to merge (worker branches, pushed when each worker finishes): research/cg-us-northeast, cg-us-south, cg-canada,
cg-de-west-north, cg-spain-cities, cg-france-cities, cg-jp-kansai, cg-jp-chubu, cg-jp-kanto, cg-jp-kyushu-hokkaido, cg-kr-seoul,
cg-benelux, cg-at-cz, cg-poland. For each: merge, then re-plan ALL batches together (cross-batch duplicates), nearest-live-gym check.

Next wave (not started): Italy, Brazil, Korea outside Seoul (Gyeonggi, Busan, Incheon, Daegu), Australia (Sydney, Melbourne),
NY/LA metros, Russia. China blocked on the CN source decision.
Tooling: WebSearch quota (200/session) ran out; Nominatim rate-limits the shared IP (use Photon/GSI/BAN/PDOK).
