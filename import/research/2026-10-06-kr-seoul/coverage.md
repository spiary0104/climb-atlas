# Coverage: Korea Seoul coverage gap (2026-10-06-kr-seoul)

## Result
- 66 candidates (kr-se-001..066), 68 sources registered (one Naver Place listing per gym, the chain blog, Kakao Map).
- Reconcile: ready 1 | review 40 | blocked 14 | already in Bouldeer 11 | invalid 0. Decisions: accept 41, same-as 16, defer 9, reject 0.
- Staged batch `2026-10-06-kr-seoul`: 41 new gyms; plan exit 0 (new 41, probable-duplicate 0, invalid 0); read-only dry-run: PREFLIGHT PASSED (partial coverage, no service-role read).
- Seoul had 32 gyms in Bouldeer; the section adds 41 (to 73) and re-identifies 16 existing ones.

## Per district: accepted (found) vs the real-world estimate
The real-world per-district counts are not published anywhere reliable; the city-wide estimate is about 150 listed gyms (Kakao 140+ in Jan 2024, many of them kids schools, associations and rope-only walls). Counts below are gyms accepted in this section / candidates found there (deferred) / left out.
| District | Accepted | Deferred | Leads / left out |
|---|---|---|---|
| Gangnam-gu | 3 (The Climb Gangnam, Yangjae; Climbing Park Gangnam) | 0 | Yeoksam Climbing Lab (역삼클라이밍랩, Kakao + modoo site only) |
| Seocho-gu | 3 (The Climb Nonhyeon; Son Sang-won Gangnam Station; One Bailey Invite) | 1 (The Climbing Gym) | |
| Songpa-gu | 1 (Bricks) | 4 (Seoul Forest Jamsil, Climb to the Moon, Dot, The Top) | Route Climbing re-identified (existing) |
| Gangdong-gu | 2 (Onfleek Cheonho, Onsedae) | 1 (Gangdong Climbing Gym) | Cookids Climbing (kids school) not added |
| Gangseo-gu | 3 (Climbing 88, Gangseo Climbing Center, August) | 1 (2 Years Climb House) | Magok Leports Center (public sports hall) not added |
| Yangcheon-gu | 1 (Mokdong Climbing Center) | 0 | |
| Yeongdeungpo-gu | 5 (The Climb Mullae, Seoul Forest, Alé, Seoul Boulders Seonyu, YDP Oreum) | 0 | Seo Jong-guk Climbing (stale, 2025), Climblover (shop), Yeongdeungpo Climbing Arena (public rope arena) not added |
| Guro-gu | 2 (Seoul Forest Guro, Peakers Guro) | 0 | Sun Climbing Gym (썬클라이밍짐, Kakao only), Weekly Climbing (closed) |
| Gwanak-gu | 3 (The Climb Sadang, In Climbing, Stonz) | 0 | Boram-ae Sports Climbing (no data) |
| Dongjak-gu | 2 (The Climb Isu, Boulder Life) | 0 | Noryangjin Climbing Center (existing, no 2026 data) |
| Mapo-gu | 0 | 1 (Summit) | Hongdae Climbing Center (last gym post 2019, reviews only) |
| Seodaemun-gu | 2 (Peakers Sinchon, Sinchon Damjang) | 0 | |
| Jongno-gu | 3 (Seoul Forest Jongno, Climbing Park Jongno, Alé Hyehwa) | 0 | |
| Jung-gu | 3 (Son Sang-won Euljiro, Euljiro Damjang, Flash Boulders) | 0 | |
| Seongdong-gu | 2 (The Climb Seongsu, Groot) | 0 | Son Jung-jun Sports Climbing Lab (training, last post 2024), Climbing Park Seongsu (named in the chain's 2026-01-12 post; not on Naver/Kakao search) |
| Gwangjin-gu | 2 (Jo Gyu-bok Gangbyeon, Vertigo) | 0 | Redpoint Climbing (last post 2024-07) |
| Nowon-gu | 2 (Dream Catcher, Bishop) | 1 (Boulder Climbing Gym) | Orum Climbing (2025 data only), Spiders Climbing Center (last review 2023), Monkeys Joonggye (kids) |
| Eunpyeong-gu | 1 (Hang Climb Gupabal) | 0 | Seesaw (시소, two Eunpyeong listings: Kakao + Instagram only), Eunpyeong public artificial wall (public/outdoor) |
| Yongsan-gu | 1 (Off the Wall) | 0 | |
| Dongdaemun-gu | 0 | 0 | Santa, Warehouse re-identified (existing); Seoul Sports Climbing Center (public membership hall, no data) |
| Jungnang-gu | 0 | 0 | Cracker re-identified (existing); Cracker Board Room (training boards), Master Climbing (마스터클라이밍, Kakao + blog only) |
| Gangbuk-gu, Dobong-gu, Geumcheon-gu | 0 | 0 | Bukhansan International Climbing Center (public rope/boulder centre, no bouldering shown), BAC Center (Black Yak academy), Dobong Power Climbing (stale), Mac Climbing (alpine school); Geumcheon: nothing found |
| Seongbuk-gu | 0 | 0 | No climbing gym found in either search; worth a targeted look |

## Chains covered
- The Climb: 7 new + Magok, Sillim, Yeonnam existing (10 Seoul branches on the chain blog; Hongdae in Bouldeer looks like a duplicate of Yeonnam).
- Seoul Forest Climbing: Seongsu (existing) + Guro, Yeongdeungpo, Jongno accepted, Jamsil deferred (5 branches: complete).
- Climbing Park: Gangnam, Jongno new; Sinnonhyeon, Hanti existing; Seongsu named by the chain but not found online.
- Son Sang-won: Gangnam Station, Euljiro (both). Peakers: Guro, Sinchon new, Jongno existing (3 branches: complete). Alé: Yeongdeungpo, Hyehwa new, Gangdong existing. Seoul Boulders: Seonyu new, Mokdong existing. Hook Climbing: Wangsimni existing only.
- Searched with no Seoul result: Boulder Friends (the existing Hongdae record only), Bblock (Incheon branches only), The Plastic (listing without gym data), Monkeys Climbing (kids franchise, deliberately not added).

## Method and limits
Naver Place list search and Kakao Map search were run for all 25 districts with several keywords, about 150 subway stations, and about 40 chain names; Kakao reached saturation (a deeper per-district crawl found nothing new). Each listed gym was read on its own Naver Place home and feed pages; owner photos were inspected as montages. The chain's own sites were not usable (theclimb.co.kr and sswclimbing.co.kr: cookie challenge / certificate error; not bypassed). Instagram was not readable. Web-search quota ran out near the end, so Spirit's Seoul gym list was not cross-checked.
Not covered: gyms that exist only on Instagram/Kakao without a Naver listing (Yeoksam Climbing Lab, Sun Climbing, Master Climbing, Seesaw) and anything opened after mid-2026 that search has not indexed.
