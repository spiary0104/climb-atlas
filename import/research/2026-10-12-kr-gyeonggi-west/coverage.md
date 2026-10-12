# Coverage: Korea Gyeonggi west (2026-10-12-kr-gyeonggi-west)

## Result
- 21 candidates (kr-gw-001..021), 23 sources registered (one Naver Place listing per gym, the Catchstone blog, Kakao Map).
- Reconcile: ready 0 | review 9 | blocked 10 | already in Bouldeer 2 | invalid 0. Decisions: accept 9, same-as 4, defer 7, reject 1.
- Staged batch `2026-10-12-kr-gyeonggi-west`: 9 new gyms; plan exit 0 (new 9, probable-duplicate 0, invalid 0); read-only dry-run: PREFLIGHT PASSED (partial coverage, no service-role read).
- The seven cities had 7 gyms in Bouldeer (Bucheon Climbing Center, Pax, Just Climbing, ClimbIt Mokgam, Mad Gym, Ansan Climbing, Climb Days); the section adds 9 and re-identifies 4 of them.

## Per city: accepted vs candidates found
The real-world estimate (about 130 gyms for all of Gyeonggi) is not broken down by city anywhere reliable; Naver and Kakao list about 25 climbing places across these seven cities, of which several are kids franchises or public walls.
| City | Accepted | Deferred / rejected | Re-identified (existing) | Leads / left out |
|---|---|---|---|---|
| Bucheon | 1 (Catchstone Bucheon Station) | 1 deferred (World Climbing) | 2 (Pax, Bucheon Climbing Center) | Monkeys Climbing Jungdong (kids franchise) |
| Gwangmyeong | 0 | 0 | 0 | Climb Together Academy (kids academy at the existing Mad Gym address, see review-notes), Monkeys Cheolsan (kids), Gwangmyeong Civic Gymnasium artificial wall (public wall, Kakao only) |
| Siheung (Baegot, Jeongwang) | 0 | 2 deferred (Siheung Catch, Siheung Sports Climbing Center), 1 rejected (Bouldergarden, closed 2026-09-30) | 2 (ClimbIt Mokgam, Just Climbing) | Monkeys Baegot (kids franchise); nothing else found for Jeongwang or Baegot |
| Ansan | 2 (Climbing Treackle, Club Climbing Ansan) | 2 deferred (Ansan Basecamp, Ansan Seonbu) | 0 (existing Ansan Climbing not found online) | Hwarang artificial wall (outdoor, Kakao says closed), Sangnok Climbing (a company listing, not a gym) |
| Anyang (Pyeongchon) | 3 (Ayers Rock Beomgye, The Ledge, Fun Climb Gym) | 2 deferred (Climbholic, Kim Jong-heon) | 0 (existing Climb Days not found online) | Monkeys Pyeongchon (kids franchise), Aram Climbing (newest review 2022, no data), Saemul Park artificial wall (outdoor public wall) |
| Gunpo (Sanbon) | 3 (Sanbon Climbing Center, Rock Climbing Sanbon, Spicy Climbing) | 0 | 0 | Gyeonggi Climbing Center (경기클라이밍센터, Kakao only, no reviews, no Naver listing) |
| Gwacheon | 0 | 0 | 0 | Nothing found on Naver or Kakao for Gwacheon (the Seoul-side Gwanak gyms show up in its searches) |

## Chains covered
- Catchstone Climbing: Bucheon Station accepted; its blog mentions a "2호점" (second branch), location not stated, probably outside these cities.
- Monkeys Climbing: four kids-franchise branches in these cities (Jungdong, Cheolsan, Baegot, Pyeongchon), deliberately not added.
- Searched with no result in these cities: The Climb, Seoul Forest Climbing, Climbing Park, Son Sang-won, Peakers, Alé, Seoul Boulders, Boulder Friends, Bblock, The Plastic, Onfleek, Hook, Ayers Rock (only Beomgye; the Ayers Rock site was not read).

## Method and limits
Naver Place list search (pcmap) and Kakao Map search were run for each city, about 60 neighbourhoods and stations, several keywords and about 15 chain names; both lists were saturated (new queries returned only the same gyms). Each listed gym was read on its own Naver Place home, feed and review pages; owner photos ("업체" tab) were inspected as screenshots. The gyms' own websites, cafes and Instagram pages were not read (Instagram needs a login). Naver's map search API is behind a captcha and was not used. No web-search quota was used.
Not covered: gyms that exist only on Instagram or Kakao without a Naver listing, and anything opened after mid-2026 that search has not indexed.
