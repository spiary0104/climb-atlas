# Import dry-run: 2026-11-09-cn-guangzhou-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 2 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 2 |

Index: 3614 known gyms (sha256 565a9d639a93…). Plan: 1158b14eedc8… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (2)

- line 1 `seed-750` — Chinese store name from the brand's own RedNote bio (火星攀岩馆: 📍广州-荔湾区悦汇城店 📍广州-番禺区桥南汇店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 2 `seed-741` — Chinese store name from the brand's own RedNote bio (火星攀岩馆: 📍广州-番禺区桥南汇店) and its 火星攀岩馆-桥南汇店 account, read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local

