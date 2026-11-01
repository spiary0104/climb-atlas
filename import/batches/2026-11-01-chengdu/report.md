# Import dry-run: 2026-11-01-chengdu

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 4 |
| Retire existing gyms (closed / duplicate: status becomes rejected, record kept) | 5 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 9 |

Index: 3294 known gyms (sha256 2f47cb53e74b…). Plan: 58219cf029c7… Also compared against staged batches: 2026-10-06-kr-seoul.

## Updates to existing gyms (4)

- line 1 `seed-608` — Pin moved to the entrance coordinate of the gym's own Amap listing (香蕉攀岩(凯德天府店)), ~334 m from the old pin
  - lat: 30.6044452 → 30.605158
  - lng: 104.0698452 → 104.066451
- line 2 `seed-622` — Pin moved to the entrance coordinate of the gym's own Amap listing (熊猫攀岩生活馆ClimbingPanda(富力店)), ~284 m from the old pin
  - lat: 30.665222 → 30.667772
  - lng: 104.0683039 → 104.068091
- line 3 `seed-619` — Pin moved to the listing coordinate of the gym's own Amap listing (熊猫攀岩生活馆(天府大悦城店)), ~505 m from the old pin
  - lat: 30.4370442 → 30.436733
  - lng: 104.0820738 → 104.087334
- line 4 `seed-629` — Pin moved to the listing coordinate of the gym's own Amap listing (熊猫攀岩生活馆ClimbingPanda(温江店)), ~3410 m from the old pin
  - lat: 30.7052468 → 30.686576
  - lng: 103.8294689 → 103.857762

## Retirements of existing gyms (5)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 5 `seed-617` "Climbing Panda (CapitaLand Jinniu)" (CN) — closed: Closed on 2026-01-14: the official RedNote account of Climbing Panda announced the closure of its Jinniu CapitaLand branch
- line 6 `seed-623` "Flying Frog Climbing (Emerald Park Vanke Li)" (CN) — closed: Closed in September 2026: climbers posted farewells to the branch (2023.5-2026.9); its official account is silent since May 2026
- line 7 `seed-618` "Climbing Panda (Chengzhonghui South District)" (CN) — insufficient-evidence: Not on the brand official store list and no Amap listing for this branch (checked 2026-10-31 and 2026-11-01)
- line 8 `seed-613` "Tandong Gongchang Climbing (Global Center Flagship)" (CN) — insufficient-evidence: Not confirmed as a climbing gym: the venue at this address is a children's cave-exploration play centre
- line 9 `seed-621` "Super Panda Fitness Studio" (CN) — insufficient-evidence: No climbing gym of this name found; the address is the building and floor of Bear Bear Climbing (seed-635)

## Warnings

- `large-pin-move` × 2: lines 3, 4

