# Import dry-run: 2026-10-12-kr-fixes

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 23 |
| Retire existing gyms (closed / duplicate: status becomes rejected, record kept) | 4 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 27 |

Index: 3294 known gyms (sha256 2f47cb53e74b…). Plan: 49fd9d6c8125… Also compared against staged batches: 2026-10-06-kr-seoul, 2026-10-12-kr-busan-gyeongnam, 2026-10-12-kr-central-regions, 2026-10-12-kr-daegu-gyeongbuk, 2026-10-12-kr-gyeonggi-north, 2026-10-12-kr-gyeonggi-south, 2026-10-12-kr-gyeonggi-west, 2026-10-12-kr-incheon.

## Updates to existing gyms (23)

- line 1 `seed-1199` — Pin moved to the gym's own Naver Place pin (PEAKERS Jongno, Piccadilly1958 B4F, ~453 m from the old pin)
  - lat: 37.5749615 → 37.570909
  - lng: 126.990828 → 126.991399
- line 2 `seed-1168` — Pin and address moved to the gym's own Naver Place listing (Climb Works, 85 Beodeunaru-ro, B1F; ~326 m from the old pin)
  - lat: 37.5286707 → 37.525842
  - lng: 126.9079258 → 126.908892
  - address: "117 Beodeunaru-ro, Yeongdeungpo-gu, Seoul, South Korea" → "B1F, 85 Beodeunaru-ro, Yeongdeungpo-gu, Seoul, South Korea"
- line 3 `seed-1188` — Pin moved to the gym's own Naver Place pin (Route Climbing, Yangjae-daero 71-gil 5-14 B1F, ~283 m from the old pin)
  - lat: 37.5117457 → 37.509837
  - lng: 127.1234105 → 127.125525
- line 4 `seed-1202` — Same gym as the Naver Place listing at Cheonho-daero 1178 B1F (Aleso Building); pin moved there, ~1.9 km from the old pin
  - lat: 37.5417887 → 37.533699
  - lng: 127.161123 → 127.142278
- line 8 `seed-1200` — Same gym as Seoul Boulders Seonyu (same address, 3F 7 Yangpyeong-ro 28-ma-gil); pin moved to the gym's own Naver Place pin, 1.8 km from the old pin
  - lat: 37.5262 → 37.542178
  - lng: 126.8959 → 126.891024
- line 9 `seed-1215` — Pin moved to the gym's own Naver Place pin (Discovery Climbing Square ICN), 5920 m from the old pin
  - lat: 37.545 → 37.597803
  - lng: 126.676 → 126.667369
- line 10 `seed-1216` — Pin moved to the gym's own Naver Place pin (B.bloc Climbing Yeongjong), 5578 m from the old pin
  - lat: 37.4735389 → 37.488839
  - lng: 126.6214081 → 126.561209
- line 11 `seed-1164` — Pin moved to the gym's own Naver Place pin (B.bloc Climbing Songdo), 1679 m from the old pin
  - lat: 37.3851499 → 37.38022
  - lng: 126.6457433 → 126.663704
  - address: "#101 149 Songdo2-dong, Art center-daero, Yeonsu-gu, Incheon, South Korea" → "107, 13-39 Songdo-gwahak-ro 16beon-gil, Yeonsu-gu, Incheon, South Korea"
- line 12 `seed-1217` — Pin moved to the gym's own Naver Place pin (Incheon Gyeyang Climbing Center), 1985 m from the old pin
  - lat: 37.5450276 → 37.542784
  - lng: 126.7119217 → 126.73426
- line 13 `seed-1165` — Pin moved to the gym's own Naver Place pin (Big Climbing Gym (Jinju)), 1266 m from the old pin
  - lat: 35.12398 → 35.131692
  - lng: 128.11082 → 128.100583
- line 14 `seed-1161` — Pin moved to the gym's own Naver Place pin (9 Climbing Gym (Ulsan)), 864 m from the old pin
  - lat: 35.56212 → 35.555374
  - lng: 129.31018 → 129.314914
- line 15 `seed-1196` — Pin moved to the gym's own Naver Place pin (Waverock Pusan National University), 488 m from the old pin
  - lat: 35.2294147 → 35.229611
  - lng: 129.0835901 → 129.088957
- line 16 `seed-1218` — Pin moved to the gym's own Naver Place pin (Dino Cat Climbing Gym), 3195 m from the old pin
  - lat: 35.8703453 → 35.870447
  - lng: 128.7268532 → 128.69139
- line 17 `seed-1220` — Pin moved to the gym's own Naver Place pin (Daegu Power Climbing Center), 3813 m from the old pin
  - lat: 35.8259379 → 35.860223
  - lng: 128.6189734 → 128.618079
- line 18 `seed-1221` — Pin moved to the gym's own Naver Place pin (Dongseong-ro Climbing Gym), 303 m from the old pin
  - lat: 35.8702998 → 35.867766
  - lng: 128.5959336 → 128.594693
- line 19 `seed-1179` — Pin moved to the gym's own Naver Place pin (King Kong Climbing (Suwon)), 1160 m from the old pin
  - lat: 37.2825292 → 37.27672
  - lng: 127.0199808 → 127.030868
- line 20 `g-69b158b889` — Pin moved to the gym's own Naver Place pin (Rocktree Climbing Bundang), 1799 m from the old pin
  - lat: 37.3627699 → 37.37874
  - lng: 127.1098529 → 127.11311
- line 21 `g-79e1f1b07b` — Pin moved to the gym's own Naver Place pin (Rock Face Climbing), 1384 m from the old pin
  - lat: 37.433434 → 37.443434
  - lng: 127.163912 → 127.154572
- line 22 `seed-1189` — Pin moved to the gym's own Naver Place pin (Son Sang Won Climbing Gym Pangyo), 413 m from the old pin
  - lat: 37.4017255 → 37.402069
  - lng: 127.1019907 → 127.106651
- line 23 `seed-1193` — Pin moved to the gym's own Naver Place pin (Twin Climbing Center), 787 m from the old pin
  - lat: 36.9885512 → 36.991594
  - lng: 127.101767 → 127.093769
- line 24 `g-e52dfc621f` — Pin moved to the gym's own Naver Place pin (Suji Climbing), 367 m from the old pin
  - lat: 37.328983 → 37.325738
  - lng: 127.104802 → 127.105538
- line 25 `g-53afac8faa` — Pin moved to the gym's own Naver Place pin (AstroMan Climbing Center Paju), 16954 m from the old pin
  - lat: 37.855592 → 37.712007
  - lng: 126.809411 → 126.744499
- line 26 `seed-1182` — Pin moved to the gym's own Naver Place pin (Mountain Star (Guri)), 525 m from the old pin
  - lat: 37.5965336 → 37.591908
  - lng: 127.1369672 → 127.138149

## Retirements of existing gyms (4)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 5 `g-7e30006a3e` "Alé Climbing Gangdong (알레클라이밍 강동점)" (KR) — duplicate of `g-707b731ba7`: Duplicate of Allez Climb Gangdong (g-707b731ba7): same gym, the Naver/Kakao listing is at Cheonho-daero 177-gil 39 B2F; this record has a vague address and a pin 801 m away
- line 6 `g-97ac649c15` "SEOULBOULDERS Mokdong" (KR) — duplicate of `g-f975eb0b04`: Duplicate of Seoul Boulders Mokdong (g-f975eb0b04): same address (Sinmok-ro 53), the other record's pin matches the gym's own Naver pin within 25 m, this one is about 250 m off
- line 7 `seed-1191` "The Climb Hongdae" (KR) — duplicate of `seed-1759`: Duplicate of THE CLIMB Yeonnam (seed-1759): the chain lists no Hongdae branch and the Hongdae-area branch is Yeonnam; no climbing gym at the old address/pin
- line 27 `g-5eec475af0` "Climb A Clock (클라임어클락)" (KR) — duplicate of `g-e227233b91`: Duplicate of Climb O'Clock (g-e227233b91): same address (Dongtangiheung-ro 257beonga-gil 33); that record's pin matches the gym's own Naver pin within 10 m, this one is 905 m off

## Warnings

- `duplicate-far-apart` × 2: lines 5, 27
- `large-pin-move` × 16: lines 4, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 20, …

