# Coverage-gap sprint 2026-10-06: status (interrupted by usage limit)

Branch `research/2026-10-06-coverage-gap` (no PR, nothing applied). Rankings: `ranking-countries.md`, `ranking-cities.md`; estimates: the four JSON files.

Merged here (staged, validated, planned, read-only dry-run passed): de-south 67, us-south 60, us-midwest 58, us-west 53, jp-kansai 32, france-cities 60, us-northeast 76, jp-chubu 54, canada 85, spain-cities 38, jp-kyushu-hokkaido 47, jp-kanto 51, de-west-north 66, kr-seoul 40, poland 10, netherlands 35, belgium 17, london 18 = 867 new gyms.

Still to merge (worker branches, pushed when each worker finishes): research/

cg-at-cz. For each: merge, then re-plan ALL batches together (cross-batch duplicates), nearest-live-gym check.

Next wave (not started): Italy, Brazil, Korea outside Seoul (Gyeonggi, Busan, Incheon, Daegu), Australia (Sydney, Melbourne),
NY/LA metros, Russia. China blocked on the CN source decision.
Tooling: WebSearch quota (200/session) ran out; Nominatim rate-limits the shared IP (use Photon/GSI/BAN/PDOK).

Pin-fix follow-ups collected so far (for one final location batch): JP seed-414 Roca (1,757 m), seed-415 Gravity Research Umeda (408 m), WAGOMU (unverified ~4 km); DE Blockhelden Bubenreuth vs Erlangen (check).
Existing-record oddities to review: FR "HAPIK - Lyon" (fun-climbing, not bouldering?), "SOLO Escalade - Toulouse" = Bloc'n Roll (L'Union)?
Pin-fix follow-ups (CA): seed-462 Boulderz Toronto (4.3 km), seed-463 Rock Oasis (6.5 km), seed-1749 Le Mouv (625 m). Check: Allez Up Mile End vs Shakti 50 m apart (two venues?).
Pin-fix follow-ups (DE): seed-1060 "Stuntwerk Köln" (central-Köln placeholder) -> Mülheim hall, Schanzenstraße 6-20 (OSM node 3282850572, 50.9657075, 7.0130676); Zollstock is added as a new gym. (JP Kantō worker lists 9 existing Tokyo-area gyms that may have wrong pins: Katsushika Sports Climbing Center ~5.5 km, D.Bouldering Tsunashima, Climbing Bum Yokohama, Exciting Sancha, the FACTORY, Quail, ROCKLANDS, HEADROCK, Rocky Shinagawa.)
KR follow-ups: pin fixes seed-1199 Peakers Jongno (453 m), seed-1168 Climb Works (326 m), seed-1188 Route Climbing (283 m); probable existing duplicates to check/retire: Alé Gangdong g-707b731ba7 vs g-7e30006a3e (801 m), The Climb Hongdae vs Yeonnam (~290 m), SEOULBOULDERS Mokdong g-97ac649c15 vs Seoul Boulders Mokdong g-f975eb0b04; Gangdong Climbing Gym (Cheonho) vs seed-1202.
Combined check (15 batches, 805 new): all plan clean together; close pairs checked: Montreal Allez Up Mile End/Shakti, Eugene Crux/Elevation, Portland Movement/Tomo = separate addresses; Seoul Groot/Euljiro Damjang = distinct gyms; Boulderplanet Köln deferred (186 m from Einstein Köln).
