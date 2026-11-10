# Coverage: Korea Gyeonggi south (2026-10-12-kr-gyeonggi-south)

## Result
- 55 candidates (kr-gs-001..055), 56 sources registered (one Naver Place listing per Naver-listed gym, one Kakao place per Kakao-only gym, Kakao Map search).
- Reconcile: ready 0 | review 19 | blocked 32 | already in Bouldeer 4 | invalid 0. Decisions: accept 18, same-as 11, defer 11, reject 15.
- Staged batch `2026-10-12-kr-gyeonggi-south`: 18 new gyms; plan exit 0 (new 18, probable-duplicate 0, invalid 0, also against the staged Seoul batch); read-only dry-run: PREFLIGHT PASSED (partial coverage, no service-role read).
- This slice had 12 in-scope gyms in Bouldeer (24 in all of Gyeonggi); the section adds 18 (to 30 in the slice) and re-identifies 11 of the existing ones. Together with the Seoul batch it does not reach the ~130 Gyeonggi estimate: that figure is not published anywhere reliable, and here Naver and Kakao search both saturated (the later query rounds returned nothing new), so the remaining gap is mostly gyms outside this slice (north and west Gyeonggi), kids franchises and closed or stale listings.

## Per city: accepted / existing / deferred / left out
Counts are candidates in this section. "Leads / left out" are not candidates unless listed in review.json.
| City | Accepted (new) | Existing re-identified | Deferred | Rejected | Leads / left out |
|---|---|---|---|---|---|
| Suwon | 5 (Kindy, Picnic, Epic Climb, Gravity Climb, Climb Together) | 2 (SuperB, King Kong) | 3 (Cruxzone, Raon, Gwanggyo public) | 3 (Climb Up closed, Seosuwon, Triplaying) | Monkeys Homaesil (kids franchise); Suwon Climbing Center 우만동 (Kakao only, newest review 2020) |
| Seongnam (Bundang, Pangyo, Wirye, Moran) | 2 (Grippick, Climb Us Moran) | 3 (Rocktree, Son Pangyo, Rock Face) | 1 (The Boulder, Kakao only) | 3 (Spider, Seongnam Sports Climbing, B Climbing) | Monkeys Wirye (kids); Pangyo Park artificial wall (outdoor); Son Sang-won hold shop (shop) |
| Yongin (Suji, Giheung, Dongbaek, Cheoin) | 3 (Boulder Mate Giheung, The Grit, Mountain Ground Heungdeok) | 2 (Boulder Mate Suji, Suji Climbing) | 1 (Yongin sports climbing, public) | 2 (Ironpalms Namsa, Orja) | KCLIMB / 경기레포츠클라이밍 (Kakao: same unit P183 as Mountain Ground Heungdeok, treated as the same site); Monkeys Seongbok, Yeokbuk (kids); Haewadal (PT gym) |
| Hwaseong (Dongtan, Byeongjeom, Hyohaeng, Mansei) | 5 (CL, Mountain Ground Dongtan, Moon Climb, Boulderbox, Hwaseong Climbing Club) | 1 (Climb O'Clock) | 0 | 2 (Hold & Rock, Magma Hold) | Monkeys Dongtan Banseong (kids); Ironpalms Banseong (Kakao only, no reviews); Dongtan Central Park wall (outdoor); Climblight and Ambyuk.com (shops in Granvia Star) |
| Osan | 0 | 0 | 1 (Osan Climbing) | 0 | |
| Pyeongtaek | 1 (Heel & Toe) | 2 (Freewall = seed-1177, Twin) | 1 (Hong Jong-yeol Bijeon) | 0 | |
| Anseong | 1 (Wonderwall) | 1 (Climbing The Hagi) | 0 | 1 (Anseong Climbing Center) | |
| Icheon | 1 (Climb Bounce Changjeon) | 0 | 1 (Climb One) | 3 (Good Climbing, Tarzan Majang, Climb Bounce Bubal moved) | Seolbong Park artificial wall (outdoor) |
| Yeoju | 0 | 0 | 1 (Yeoju Climbing Center, Kakao only) | 0 | Runkids Activity School (kids) |
| Gwangju-si | 0 | 0 | 1 (Gwangju-si stadium, public, Kakao only) | 1 (T Climbing) | Monkeys Taejeon (kids) |
| Uiwang | 0 | 0 | 1 (Eight Peaks) | 0 | Black Diamond Lotte (shop) |

## Chains covered
- Mountain Ground: Heungdeok and Dongtan accepted (two branches found). Boulder Mate: Giheung new, Suji existing. Climb Bounce: Changjeon accepted, Bubal branch moved. Climb Together: Suwon accepted (Gwangmyeong has a "Climb Together Academy", outside the section). Son Sang-won: Pangyo existing. Monkeys Climbing: kids franchise, not added.
- Searched with no result in this slice: The Climb, Seoul Forest Climbing, Climbing Park, Peakers, Alé, Boulder Friends, Bblock, The Plastic, Onfleek, Hang Climb, Climb Us (Moran only; the Misa branch is Hanam).

## Incidental, outside this slice (not processed; for the north/west Gyeonggi sections)
Naver search also returned climbing gyms in Anyang (6 names, e.g. Aram, Climbholic, Fun Climb, Airs Rock Beomgye, The Ledge), Goyang (9), Ansan (4), Gunpo (3), Bucheon (5), Siheung (6), Gimpo (4), Hanam (2, incl. Climb Us Misa), Namyangju (2), Gwangmyeong (2, incl. Climb Together Academy), Guri, Uijeongbu, Paju, Yangpyeong, Yangju. These lists are partial (only what the in-slice queries returned).

## Method and limits
Naver Place list search and Kakao Map search were run with city, district, station, chain and category keywords (about 300 queries); each gym's Naver Place home, feed and visitor-review pages were parsed and owner photos inspected as montages. The chains' own sites and Instagram were not read (login or bot walls; not bypassed). Naver blog searches were tried for missing names and gave nothing usable. A gym that exists only on Kakao or Instagram with no Naver listing cannot satisfy the own-Naver-pin rule: three such gyms are deferred (The Boulder Bundang, Yeoju Climbing Center, Gwangju-si stadium) and two Kakao-only places were left out (Suwon Climbing Center 우만동, Ironpalms Banseong). Anything opened after mid-2026 that search has not indexed is not covered. Naver "open" badges are computed from the listed hours and were not used as evidence. Visitor-review lists were read from the first page (20 newest), and a few review fetches failed once and were repeated.
