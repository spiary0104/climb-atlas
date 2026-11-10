# Coverage: Korea Incheon (2026-10-12-kr-incheon)

## Result
- 15 candidates (kr-ic-001..015), 16 sources registered (one Naver Place listing per gym, Kakao Map).
- Reconcile: ready 0 | review 9 | blocked 6 | already in Bouldeer 0 | invalid 0. Decisions: accept 6, same-as 4, defer 4, reject 1.
- Staged batch `2026-10-12-kr-incheon`: 6 new gyms; plan exit 0 (new 6, probable-duplicate 0, invalid 0); read-only dry-run: PREFLIGHT PASSED (partial coverage, no service-role read).
- Bouldeer had 4 Incheon gyms (seed-1164, 1215, 1216, 1217); all four are re-identified here (each has a wrong pin: location-update follow-ups). The section adds 6 (to 10).
- The brief's real-world estimate was about 30 gyms. Naver and Kakao searches list only about 17 climbing places in Incheon, of which several are kids schools, public/unclaimed walls or closing: the estimate looks high for walk-in bouldering gyms.

## Per district: accepted (new) / same-as (existing) / deferred / leads
Districts use the 2026 names that Naver and Kakao now show (old names in brackets).
| District | Accepted | Same-as | Deferred / rejected | Leads / left out |
|---|---|---|---|---|
| Bupyeong-gu | 1 (Bupyeong Climbing Center) | 0 | 1 deferred (Incheon Best Climbing Center) | Only hold shops and CrossFit boxes otherwise |
| Namdong-gu | 3 (Hub, Boly, Ganseok) | 0 | 0 | Gipilco Hold (기필코홀드, Hogupo-ro 189): Kakao only (climbing category), no Naver listing; probably a hold shop, not verified |
| Yeonsu-gu (incl. Songdo) | 1 (Climbing Zoom) | 1 (B-bloc Songdo, seed-1164) | 1 rejected (Climb Square Songdo, closing 2026-10-18); 1 deferred (Incheon Indoor Climbing Wall) | Incheon University artificial wall (Kakao only, university wall, no data) |
| Seo-gu, now Seohae-gu (Cheongna, Gajeong) | 1 (Climb Square Cheongna) | 0 | 1 deferred (Seo-Incheon Climbing) | |
| Seo-gu, now Geomdan-gu (Majeon, Wanjeong) | 0 | 1 (Climb Square ICN, seed-1215) | 0 | Mongkids Climbing Ara (kids franchise, deliberately not added) |
| Gyeyang-gu | 0 | 1 (Incheon Gyeyang Climbing Center, seed-1217) | 0 | |
| Michuhol-gu | 0 | 0 | 1 deferred (Munhak Stadium Climbing Wall, public) | Nothing else found |
| Jung-gu, now Yeongjong-gu (Yeongjong) | 0 | 1 (B-bloc Yeongjong, seed-1216) | 0 | |
| Dong-gu (now Jemulpo-gu) | 0 | 0 | 0 | None found |
| Ganghwa-gun | 0 | 0 | 0 | Ganghwa Climbing (강화클라이밍, Bureun-myeon): Kakao only, flagged closed/no data, no Naver listing; Seokmodo cliff (outdoor, not a gym) |

## Chains covered
- Climb Square / Discovery: ICN (existing), Cheongna (new), Songdo (closing: reject). Kakao also shows duplicate listings (Climb Square ICN Bonjeom, Discovery CS Songdo): the same gyms.
- B-bloc: Songdo and Yeongjong (both existing with wrong pins). Searched with no Incheon result: The Climb, Seoul Forest, Climbing Park, Son Sang-won, Peakers, Ale, Seoul Boulders, Boulder Friends, The Plastic, Onfleek, Hang Climb. (Bucheon, Gimpo and Siheung results belong to the Gyeonggi sections.)

## Method and limits
Naver Place list search (page state; about 150 queries incl. dong and station names for all districts) and Kakao Map search (about 100 queries) both reached saturation: later query rounds returned no new Incheon gym. Naver's direct map API is behind a captcha (not bypassed); the list pages and each gym's home, feed and photo pages were read instead. Instagram and Daum cafes were not readable. Not covered: gyms that exist only on Instagram with no Naver or Kakao listing, and anything opened after mid-2026 that search has not indexed.
