# Import dry-run: 2026-11-09-cn-hangzhou-info

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

Index: 3614 known gyms (sha256 565a9d639a93…). Plan: c9beef66ff8e… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (2)

- line 1 `seed-717` — Chinese store name from the store's own RedNote account (杭州顽攀攀岩滨江馆), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 2 `seed-718` — Chinese store name from the store's own RedNote account (杭州顽攀攀岩-西湖文体馆), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local

