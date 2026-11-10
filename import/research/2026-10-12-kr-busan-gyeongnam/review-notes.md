# Review notes: Korea Busan, Ulsan, Gyeongsangnam-do (2026-10-12-kr-busan-gyeongnam)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tally: accept 10 | same-as 12 | defer 12 | reject 0 (34 candidates).

## Method
Candidates were found with Kakao Map search (about 650 queries: 3 provinces, every gu/gun/si, about 150 dong/eup/myeon names, chain and keyword queries; the last 140 dong-level queries found nothing new, so Kakao is saturated) and Naver Place list search (about 40 queries across cities, districts and chains before the list endpoint began returning HTTP 429 rate limits; those results repeated what Kakao found). Each gym's own Naver Place listing was then read directly (home and feed tabs: description, price list and booking items, gym-authored posts with dates, owner photos with upload dates) and the owner photos were inspected as montages. Bouldering is accepted only where the owner photos show mat-floored boulder walls or the gym's own text/post says bouldering. Open status rests on gym-authored 2026 posts, 2026 uploads (price list, owner photos) or a live Naver booking item; visitor reviews are corroboration only. Pins are the gym's own Naver pin (building), cross-checked with the Kakao place pin: all 31 gyms with both pins agree within 27 m (largest: Waverock Namcheon 27 m, Dolmenge 18 m, Do Climbing Gimhae 17 m).

## accept (10)
- Busan (3): Dolmenge Climbing Jeonpo, Pogo Climb Sasang, Rock Climbing Gym Deokcheon.
- Ulsan (2): Raon Climbing Gym (Samsan), Mong Climbing Center (Hogye).
- Gyeongnam (5): B-star Climbing Changwon (opened 2026-07), The Coa Climbing Jangyu (Gimhae), Climb Zone (Changwon), Boulder Surfer Climbing (Yangsan), Crux Climbing (Masan).

## same-as (12, all already in Bouldeer)
Waverock Seomyeon (seed-1197), Namcheon (seed-1195), Pusan National Univ. (seed-1196); Rock Odyssey Dongnae (seed-1185); Club Spider Sasang (seed-1170); Reverse Rock (seed-1183); Walldam Samsan (g-63200c2995); 9 Climbing Gym (seed-1161); Do Climbing Gimhae (seed-1171); Awesome Climbing (seed-1162); Big Climbing Gym (seed-1165); Otter Climbing = probably the existing "Rock Odyssey Hadan" (seed-1186), see below.

## Location-update follow-ups (separate update batch, not part of this section)
The gym's own Naver pin (cross-checked with Kakao) differs from the existing pin:
- seed-1186 "Rock Odyssey Hadan": 3.8 km (existing pin 35.1071736,129.0086568; gym 35.1088289,128.9670605). Also a likely **rename/rebrand to Otter Climbing (오터클라이밍)**, see MANUAL-CHECK.md; if it is not the same gym, seed-1186 has no map presence at all and Otter becomes a new gym.
- seed-1165 "Big Climbing Gym" (Jinju): 1.27 km (gym 35.1316922,128.100583).
- seed-1161 "9 Climbing Gym" (Ulsan Jung-gu): 864 m (gym 35.5553742,129.3149137).
- seed-1196 "Waverock Pusan National University": 488 m (gym 35.2296107,129.0889571).
Smaller differences (36-105 m) are fine.

## Existing Busan-region records with no presence on Naver or Kakao (possibly closed; not touched)
seed-1166 Bros Climbing (Busanjin-gu), seed-1178 Jaws Climbing (Dongnae-gu), seed-1173 Do Climbing: Sasang, seed-1172 Do Climbing Kyungsung/Pukyong National Univ. (Nam-gu), seed-1184 Rock Odyssey Dong-eui University (Busanjin-gu), seed-1194 Waverock Gwangan (Suyeong-gu; the Waverock Seomyeon listing says the chain has three branches: Pusan National Univ., Seomyeon, Namcheon). Name searches in Kakao returned zero places for Bros, Jaws, Do Climbing Sasang/Kyungsung and Rock Odyssey Dongui. A later check by phone or Instagram could confirm closure.
Probable duplicate pairs among existing records in these three states: none found (the nearest pairs are 596 m and 642 m apart and are different gyms) apart from the Hadan/Otter question above.

## defer (12): see MANUAL-CHECK.md

## Weaker accepts (owner may veto)
- kr-bg-010 Crux Climbing: bouldering clear from photos, but open rests on a live Naver booking item, a 2025-06 post and reviews to 2026-07; no gym-authored 2026 post.
- kr-bg-003 Rock Climbing Gym Deokcheon: the 2026 evidence is owner photo/price-sheet uploads and live booking; no text posts and only 7 visitor reviews.
- kr-bg-007 The Coa and kr-bg-008 Climb Zone: no Naver booking item (phone booking), but gym posts dated 2026-10-04 / 2026-10-02 and mat-floored boulder walls in owner photos.
- kr-bg-005 Mong Climbing: bouldering from its own 2026-09-30 post and signage; the owner photos are exteriors.

## Related-name flags
All are the shared word "Climbing" or the chain name between gyms or branches at different addresses (kilometres apart). B-star Changwon (kr-bg-006) vs B-star Masan (kr-bg-029, deferred): 8.6 km apart, separate listings and Instagram accounts.

## Not added (see coverage.md)
Public/municipal walls, outdoor walls, kids sports centres and tree-adventure operators; an auto-belay family park (Climb Park Yangsan, no bouldering).
