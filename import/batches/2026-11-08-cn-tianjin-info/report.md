# Import dry-run: 2026-11-08-cn-tianjin-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 1 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 1 |

Index: 3614 known gyms (sha256 565a9d639a93…). Plan: 757bdcf93b36… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (1)

- line 1 `seed-784` — Chinese name from the gym's own RedNote account (芒果攀岩, bio: 位置在金隅嘉品mall, 天津滨海新区), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local

