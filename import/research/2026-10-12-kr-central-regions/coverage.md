# Coverage: Korea central regions (2026-10-12-kr-central-regions)

## Result
- 54 candidates (kr-cr-001..054), 55 sources registered (one Naver Place listing per gym, plus Kakao Map).
- Reconcile: ready 2 | review 26 | blocked 19 | already in Bouldeer 7 | invalid 0. Decisions: accept 15, same-as 25, defer 14, reject 0.
- Staged batch `2026-10-12-kr-central-regions`: 15 new gyms; plan exit 0 (new 15, probable-duplicate 0, invalid 0); read-only dry-run: PREFLIGHT PASSED (partial coverage, no service-role read).
- The seven states held 30 records in Bouldeer; the section adds 15 (to 45) and re-identifies 25 existing ones.

## Per state and city: accepted (new) / same-as (already in Bouldeer) / deferred / leads and left out
The real-world per-city counts are not published anywhere reliable. The Naver list search returns only gyms whose listing names match a climbing keyword (9 hits for all of Daejeon), and Kakao agrees with it, so the totals below are what both maps show; the task estimate (Daejeon about 18, others 8-15) counts kids' schools, rope-only walls and outdoor walls that are left out here.
| State / city | Accepted | Same-as | Deferred | Leads / left out |
|---|---|---|---|---|
| Daejeon (Bouldeer had 4) | 1 (Hana Climbing Gym) | 3 (Awake Timeworld, Daejeon Climbing Center, Lead Yuseong) | 1 (Lead Chungdae) | Base Camp Boulder Spot Dunsan (existing seed-1210; named by one blog, no map listing: retire check); Smob Daejeon (indoor sports park, no climbing wall shown); X-Mountain, Moon River Mountain (shops); Daejeon artificial wall at the World Cup stadium and Oknyeobong park wall (municipal outdoor) |
| Sejong (1) | 0 | 1 (Star Climbing = Byeol Climbing, auto-belay rope walls) | 0 | nothing else on either map |
| Chungbuk: Cheongju (5 in the state) | 1 (Sports Island Ochang) | 3 (Rock, Tagi, International) | 2 (Daoreum, Maru) | Ilbonga (last post 2023), Cheongju Climbing Academy (same building as Tagi, no data), Chungbuk climbing federation |
| Chungbuk: Chungju, Jecheon | 0 | 2 (Neongkul, Orarak) | 1 (Tokha, Jecheon) | Chungju Rock (24 h member room, price list only), Suanbo and Saeteo outdoor walls; Eumseong, Jincheon, Jeungpyeong, Okcheon, Yeongdong: nothing |
| Chungnam: Cheonan, Asan | 0 | 3 (ClimbMax, Rocktree, Wa Cheonan) | 2 (Wa Asan, Kiclimb) | Hong Jong-yeol Climbing (last post 2020), BJ1 Climbing Center (Kakao entry in ClimbMax's complex, probably its former name), Baekseok University centre, Dosol Plaza and Sinjeongho outdoor walls, Yeongin crag |
| Chungnam: Seosan, Dangjin, Hongseong, Gongju, Nonsan, Boryeong | 3 (Seosan Climbing, Edgewalk, Hongseong) | 1 (Gongju Forest) | 2 (Nonsan, Dangjin wall) | Seosan municipal hall (planned 2026), Boryeong sport climbing (public, no data) |
| Gangwon: Chuncheon, Hongcheon | 0 | 2 (Climb House, Chuncheon Climbing Center) | 2 (Nam-Chuncheon, Hongcheon) | Chuncheon Climbers "Second Secret Base" (Kakao only), Songam Sports Town and Uiam outdoor walls |
| Gangwon: Wonju | 3 (Amigo, Gogo Musildangu, Cha Dangye) | 1 (Climb Together) | 2 (Gogo Ilsan, The Sen) | Bolt Rock, Gogo Climbing HQ listing, Jo Young-soon academy (Kakao only, no data), Joy Club multi-gym (fitness), Panda Ice Park (ice) |
| Gangwon: Sokcho, Gangneung, east coast | 1 (A-Gym) | 2 (Imnotboulder, Gangneung) | 1 (Sokcho Climbing Gym) | Fun Climbing Sokcho (two listings, no data), Taebaek indoor climbing centre (nothing since 2022), Donghae outdoor wall; Samcheok, Yangyang, Pyeongchang, Yeongwol: nothing |
| Jeonbuk: Jeonju | 4 (Ascent JBNU, Hard Rock, Bawi Oreum, BK) | 3 (Ascent Manseong, Boulder Den, Hans) | 0 | Wansan sports park outdoor wall; blog names of Jeonju "lead climbing" and "140-pyeong" gyms have no map listing |
| Jeonbuk: Iksan, Gunsan, other | 1 (Hold On, Gunsan) | 2 (ClimbFarm, Gunsan SCC) | 1 (Iksan municipal hall) | Jirakfunrak (Iksan, no data), Gunsan Climbing Center (existing seed-1237, no data), On the Rock (Gunsan, no data), Namwon, Buan municipal walls (lead/outdoor); Jeongeup, Gimje, Wanju: nothing |
| Jeju | 1 (Fix Boulder Ara) | 2 (Fix Boulder Yeondong, Jeju Climbing School) | 0 | Orumeong (Pyoseon, Kakao only), Seogwipo climbing centre (municipal, Kakao only), Hallim sport climbing arena (municipal), Ace Climbing Center (members-run, no day passes), Active Park (adventure park); retire checks: seed-1211, seed-1213 |

Column totals: accepted 15, same-as 25, deferred 14.

## Chains covered
Ascent Climbing (Manseong existing, JBNU new), Fix Boulder (Yeondong existing, Ara new), Gogo Climbing (Musildangu new, Ilsan deferred), Wa Climbing (Cheonan existing, Asan deferred, lead-only), Climbing Zim Lead (Yuseong existing, Chungdae deferred), Sports Island (Ochang new). Searched with no result in these states: The Climb, Peakers, Seoul Forest Climbing, Climbing Park, Alé, Boulder Friends, The Plastic, Son Sang-won, Bblock, Picus.

## Method and limits
Naver Place list search (api.place.naver.com list query, read-only) and Kakao Map search (read-only) were run for about 60 cities, districts and dong, five or more keywords each; later sweeps found almost nothing new (saturation), and Naver started returning HTTP 405 under load, so some chain-name queries (about 20 of 144) did not complete. Each listed gym's own Naver Place home, intro (정보) and feed (소식) tabs were read and owner photos inspected as montages. Instagram and the chains' own sites were not read. Naver blog titles were used only to look for names without a map listing (none produced a usable listing).
Not covered: gyms that exist only on Instagram/Kakao without a Naver listing (listed above as leads) and anything opened after mid-2026 that neither map has indexed.
