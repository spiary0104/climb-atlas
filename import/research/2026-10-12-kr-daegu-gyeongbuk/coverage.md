# Coverage: Korea Daegu and Gyeongsangbuk-do (2026-10-12-kr-daegu-gyeongbuk)

## Result
- 39 candidates (kr-dg-001..039), 40 sources registered (one Naver Place listing per gym, plus Kakao Map).
- Reconcile: ready 1 | review 15 | blocked 18 | already in Bouldeer 5 | invalid 0. Decisions: accept 14, same-as 7, defer 15, reject 3.
- Staged batch `2026-10-12-kr-daegu-gyeongbuk`: 14 new gyms; plan exit 0 (new 14, probable-duplicate 0, invalid 0); read-only dry-run: PREFLIGHT PASSED (partial coverage, no service-role read).
- Daegu had 5 gyms in Bouldeer, Gyeongsangbuk-do 4 (the estimate was about 30 and 15 real-world gyms). The section adds 10 in Daegu (to 15) and 4 in Gyeongsangbuk (to 8), and re-identifies 3 + 4 existing ones.

## Per city/district: accepted / deferred / leads and left out
Counts are gyms accepted in this section / deferred / existing re-identified. Real-world per-district counts are not published; the Daegu pool found online is about 27 commercial gyms, of which about 8 are rope-only or endurance gyms.
| City / district | Accepted | Deferred | Existing (same-as) | Leads / left out |
|---|---|---|---|---|
| Daegu Jung-gu | 0 | 0 | Dongseong-ro Climbing Gym | |
| Daegu Dong-gu | 0 | 0 | Dyno Cat | Fun&Fun Climbing Center (펀앤펀, owner photo is street view only, no price or post), Jungle Gym Kids Climbing (kids), Palgongsan artificial wall (outdoor) |
| Daegu Seo-gu | 2 (Boulder Lounge Flip, Gwangjang) | 0 | 0 | |
| Daegu Nam-gu | 1 (Hands) | 1 (Nam-gu International Sports Climbing Center, public) | 0 | Nam-gu office rock wall (outdoor) |
| Daegu Buk-gu | 2 (Byeok, Chalk Up Gyeongdae) | 2 (Chalk Up Chimsan, Rock Climbing Nowon) | 0 | M Climbing Chilgok (rope-only, rejected); Sonsedong Climbing Chilgok (Kakao only, no Naver listing, 0 reviews); Challenger Chilgok and Chilgok Climbing Center (no data); Everyclimb (에브리클라임, Kakao only, not operating) |
| Daegu Suseong-gu | 1 (Newbie Suseong) | 0 | Daegu Power Climbing Center | Challenger Climbing Center Maeho (챌린져, price list only, 4 reviews, no photos), Daegu Sports Park rock wall (outdoor) |
| Daegu Dalseo-gu | 4 (Chalk Up The Boulder, Sonsedong Duryu, Noru Jincheon, Jump Bondong) | 4 (Chalk Up Wolseong, King Kong, Jump Jangi-ro, Climbing High) | 0 | M Climbing Nam-Daegu (rope-only, rejected), Daegu Climbing Center (closed 2026-05-22, rejected), Rocktopia (락토피아, price only, 5 reviews) |
| Daegu Dalseong-gun | 0 | 1 (Monster Climbing Techno, Yuga-eup; possibly the relocated existing seed-1180) | 0 | |
| Daegu Gunwi-gun | 0 | 0 | 0 | Nothing found |
| Gumi | 1 (4Seasons Sandong) | 2 (CC Climbing Center, 4Seasons Indong) | Norbo | Gumi Climbing Center (구미클라이밍센터, price only, 5 reviews), King's Climb (킹스클라임, Kakao only, 0 reviews) |
| Pohang | 1 (Kim Dae-woo Climbing School) | 2 (Atti Climbing; Pohang International Climbing Center, public) | Pohang Spider | Pohang Climbing Academy (포항클라이밍아카데미, endurance, newest review 2023), Pohang Climbing Centa (no data), Tri-I (experience centre) |
| Gyeongju | 1 (Gyeongju Climbing Center) | 0 | Flow Climb | Seolu Climbing Center (설우, boulders in photos, newest review 2023-12), Gyeongju Rock Climbing Center (no data) |
| Gyeongsan | 0 | 1 (Gyeongsan International Climbing Park, public) | Olla | Challenger Yeongdae (no data), Stone Climbing Center (1 review) |
| Gimcheon | 1 (Woody) | 0 | 0 | Gimcheon Sports Town artificial wall (public/outdoor) |
| Andong | 0 | 1 (Andong Climbing Gym) | 0 | Andong climbing wall (축제장길, public/outdoor) |
| Yeongju | 0 | 0 | 0 | Redpoint Climbing Center (last gym post 2023-05, no price list) |
| Mungyeong | 0 | 1 (Mungyeong International Climbing Center, public) | 0 | Free Climbing Center (last post 2021), Climb Korea (listed as construction materials, not a gym) |
| Sangju | 0 | 0 | 0 | Sangju Climbing Club (listing only, no data), outdoor walls |
| Yeongcheon, Uiseong, Cheongsong, Yeongyang, Yeongdeok, Cheongdo, Goryeong, Seongju, Chilgok, Yecheon, Bonghwa, Uljin, Ulleung, Gunwi | 0 | 0 | 0 | Nothing commercial found by either search (Cheongsong: ice-climbing venue; Uiseong: municipal climbing wall with 5 blog mentions and no listing data) |

## Chains covered
- Chalk Up Climbing (Seongseo "The Boulder", Gyeongdae accepted; Wolseong, Chimsan deferred), 4Seasons (Sandong accepted, Indong deferred), Jump Climbing (Bondong accepted; Jangi-ro and Climbing High deferred), Sonsedong (Duryu accepted; Chilgok lead), M Climbing (both branches rope-only). Newbie, Challenger: one boulder branch each.
- Not present in the region (searched): The Climb, Climbing Park, Seoul Forest, Peakers, Alé, Boulder Friends, Bblock, The Plastic, Onfleek.

## Method and limits
Naver place results (pcmap list endpoint was rate-limited, so the lighter `m.search.naver.com` local block was used for the Gyeongbuk sweep) and Kakao Map search JSON for the same regions; every listed gym was read on its own Naver Place home and feed pages and its owner photos inspected. Instagram and gym websites were not read. Naver Place list results show five places per query on the local block, so a gym that never ranks for city + keyword queries may be missed. Not covered: Instagram-only gyms and gyms opened after mid-2026 that search has not indexed.
