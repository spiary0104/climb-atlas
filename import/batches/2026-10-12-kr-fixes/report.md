# Import dry-run: 2026-10-12-kr-fixes

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 5 |
| Retire existing gyms (closed / duplicate: status becomes rejected, record kept) | 3 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 8 |

Index: 3294 known gyms (sha256 2f47cb53e74b…). Plan: e02c929e58eb… Also compared against staged batches: 2026-10-06-kr-seoul.

## Updates to existing gyms (5)

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

## Retirements of existing gyms (3)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 5 `g-7e30006a3e` "Alé Climbing Gangdong (알레클라이밍 강동점)" (KR) — duplicate of `g-707b731ba7`: Duplicate of Allez Climb Gangdong (g-707b731ba7): same gym, the Naver/Kakao listing is at Cheonho-daero 177-gil 39 B2F; this record has a vague address and a pin 801 m away
- line 6 `g-97ac649c15` "SEOULBOULDERS Mokdong" (KR) — duplicate of `g-f975eb0b04`: Duplicate of Seoul Boulders Mokdong (g-f975eb0b04): same address (Sinmok-ro 53), the other record's pin matches the gym's own Naver pin within 25 m, this one is about 250 m off
- line 7 `seed-1191` "The Climb Hongdae" (KR) — duplicate of `seed-1759`: Duplicate of THE CLIMB Yeonnam (seed-1759): the chain lists no Hongdae branch and the Hongdae-area branch is Yeonnam; no climbing gym at the old address/pin

## Warnings

- `duplicate-far-apart` × 1: lines 5
- `large-pin-move` × 2: lines 4, 8

