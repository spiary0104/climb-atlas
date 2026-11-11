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

Index: 3614 known gyms (sha256 565a9d639a93…). Plan: 4a9a09d86df8… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Retirements of existing gyms (2)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 1 `seed-713` "Banana Climbing (CapitaLand One)" (CN) — closed: Closed: the Banana Climbing chain's own store list marks the CapitaLand One (Changsha) store as closed; Amap also shows it suspended
- line 2 `seed-499` "Longgang Universiade Center Climbing Gym" (CN) — duplicate of `seed-510`: Duplicate of seed-510 Zhengyan Climbing Gym (Dayun): same address (Universiade Sports Center Gate 26) and one Amap listing

## Warnings

- `duplicate-far-apart` × 1: lines 2

