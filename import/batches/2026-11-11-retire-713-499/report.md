# Import dry-run: 2026-11-11-retire-713-499

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 0 |
| Retire existing gyms (closed / duplicate: status becomes rejected, record kept) | 2 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 2 |

Index: 3453 known gyms (sha256 4eeacfad3c59…). Plan: d62570f8af5f… Also compared against staged batches: 2026-10-06-kr-seoul, 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha, 2026-10-12-cn-shanghai, 2026-10-12-kr-busan-gyeongnam, 2026-10-12-kr-central-regions, 2026-10-12-kr-daegu-gyeongbuk, 2026-10-12-kr-gyeonggi-north, 2026-10-12-kr-gyeonggi-south, 2026-10-12-kr-gyeonggi-west, 2026-10-12-kr-incheon, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-fuzhou, 2026-11-08-cn-guiyang, 2026-11-08-cn-harbin, 2026-11-08-cn-hefei, 2026-11-08-cn-nanchang, 2026-11-08-cn-nanning, 2026-11-08-cn-shenyang, 2026-11-08-cn-xining, 2026-11-08-cn-yinchuan, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai.

## Retirements of existing gyms (2)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 1 `seed-713` "Banana Climbing (CapitaLand One)" (CN) — closed: Closed: the Banana Climbing chain's own store list marks the CapitaLand One (Changsha) store as closed; Amap also shows it suspended
- line 2 `seed-499` "Longgang Universiade Center Climbing Gym" (CN) — duplicate of `seed-510`: Duplicate of seed-510 Zhengyan Climbing Gym (Dayun): same address (Universiade Sports Center Gate 26) and one Amap listing

## Warnings

- `duplicate-far-apart` × 1: lines 2

