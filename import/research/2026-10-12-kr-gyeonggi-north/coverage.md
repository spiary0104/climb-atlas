# Coverage: Korea Gyeonggi north and east (2026-10-12-kr-gyeonggi-north)

## Result
- 23 candidates (kr-gn-001..023), 24 sources registered (one Naver Place listing per gym, plus Kakao Map).
- Reconcile: ready 0 | review 13 | blocked 8 | already in Bouldeer 2 | invalid 0. Decisions: accept 13, same-as 4, defer 6, reject 0.
- Staged batch `2026-10-12-kr-gyeonggi-north`: 13 new gyms; plan exit 0 (new 13, probable-duplicate 0, invalid 0); read-only dry-run: PREFLIGHT PASSED (partial coverage, no service-role read).
- Gyeonggi had 24 gyms in Bouldeer before this pass (about 130 estimated real-world for the whole province; the other two Gyeonggi sections cover the south and the west). Inside this section's cities Bouldeer had 5 records (The Climb Ilsan, AstroMan Paju, Chamonix Uijeongbu, Mountain Star Guri, Jo Gyu-bok Byeollae): the section adds 13 and re-identifies 4. No real-world per-city count is published reliably; Naver and Kakao show about 20 indoor gyms with bouldering in these cities plus kids schools and public walls.

## Per city: accepted / deferred / leads
| City | Accepted | Deferred | Existing (same-as) | Leads / left out |
|---|---|---|---|---|
| Goyang (Ilsan, Deogyang) | 5 (Koala Kintex, Up the Wall, Highflex, Pepper Wonheung, Hi-Point Samsong) | 2 (Ilsan Climbing Center, Goyang Artificial Climbing Wall) | The Climb Ilsan | Han's Climbing, Haengsin (한스클라이밍, Kakao only, no Naver listing, Kakao open-status N); Ilsan SK Climbing (일산SK클라이밍, class school, last post 2023-11, no bouldering shown); Monkeys Climbing kids franchise (Madu, Hwajeong) not added; the Goyang biomass-plant climbing wall (public outdoor) |
| Paju | 1 (Paju Climbing Center) | 0 | AstroMan (location-update) | Jungle Gym Climbing (정글짐 클라이밍센터, Mokdong; kids-and-class school, owner photos are class posters and a logo, adult trial only); Unjeong Jumping Climbing (운정점핑클라이밍; the owner photos are unrelated fitness-product images, not a climbing gym); Monkeys Unjeong (kids); Paju Stadium wall (international sports-climbing venue, public, no bouldering data); Unjeong Health Park wall (public outdoor) |
| Gimpo | 1 (Pick Climbing) | 2 (Jam, Kikl Pungmu) | none | Tree Climbing Lab (트리클라이밍연구소, education listing), Techy Climbing (테키클라이밍, listed as a construction business), Monkeys Unyang (kids) not added |
| Uijeongbu | 1 (King Climbing) | 0 | Chamonix | CAC Climbing Gym (CAC클라이밍짐, Hoewon; last review 2023); Forespo (포레스포, multi-fitness gym with a climbing mention, no evidence); Sankeul crag (산클암장, Jangam-dong; outdoor crag) |
| Yangju | 1 (The Vibe Okjeong) | 0 | none | Monkeys Okjeong (kids); Yangju outdoor artificial wall (public) |
| Dongducheon | 0 | 0 | none | DoDream Climbing Center (두드림클라이밍센터, Saengyeon-dong; price list only, visitor reviews 2017-2018, Kakao shows a Band page): likely stale |
| Pocheon | 0 | 1 (Soheul Indoor Climbing Wall, public) | none | Soheul park outdoor wall (public) |
| Yeoncheon | 0 | 0 | none | Nothing found on Naver or Kakao |
| Namyangju (Dasan, Byeollae, Jinjeop) | 3 (Puzzle, Dino, Move On) | 1 (M2 Dasan) | none matched | Existing Jo Gyu-bok Byeollae (g-08e2ec56d7): no Naver or Kakao listing found (see review-notes); Byeollae sports-park wall and Namyangju outdoor wall (public); no gym found in Hwado, Pyeongnae-Hopyeong or Deokso |
| Guri | 0 | 0 | Mountain Star (location-update) | Interactive Climbing at Lotte Outlet Guri (kids attraction, not added) |
| Hanam (Misa, Wirye) | 1 (Climb Us Misa) | 0 | none | Asportz (아스포즈, Misa Gangbyeon; Naver listing with a booking item, only a street-view photo, last review 2025-02; likely a kids sports school); Monkeys Misa (kids); Wirye listings (Grippick, Monkeys Wirye) are in Changgok-dong, Songpa-gu, Seoul: not in this section |
| Gapyeong | 0 | 0 | none | Nothing found |
| Yangpyeong | 0 | 0 | none | "Climbing Park" at Yongmun (클라이밍파크, a mountain-side address, 3 visitor reviews to 2023, outdoor); Shuja Park artificial wall (public outdoor) |

## Chains covered
- Koala Climbing: Kintex new (Sangam exists in Seoul). Climb Us: Misa new (Moran is in Seongnam, Janghanpyeong is in Seoul). The Climb: Ilsan existing (Magok, Sillim and Yeonnam are Seoul). The Vibe Climbing: Yangju Okjeong new.
- Searched with no result in these cities: Seoul Forest Climbing, Climbing Park, Son Sang-won, Peakers, Alé, Seoul Boulders, Boulder Friends, Bblock, The Plastic, Onfleek (only fitness-gym branches), Hang Climb, Hook Climbing. Monkeys Climbing is a kids franchise with many branches here, deliberately not added.

## Method and limits
Naver Place list search (m.place.naver.com/place/list) and Kakao Map search (search.map.kakao.com) were run for about 110 city, neighbourhood and district names with 5 keywords each, about 210 station and dong names for the 13 cities, and about 50 chain and brand names; the later rounds found nothing new (saturation). Each listed gym was read on its own Naver Place home and feed tabs; owner photos and feed images were inspected as montages. Naver Place pages and the Kakao search endpoint were fetched directly (no search-engine quota used). Instagram and the chains' own sites were not read.
Not covered: gyms that exist only on Instagram or Kakao without a Naver listing, and anything opened after mid-2026 that search has not indexed. Naver "clip" items on a listing are user videos and were not used as gym evidence.
