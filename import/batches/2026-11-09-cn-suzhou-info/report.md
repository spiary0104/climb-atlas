# Import dry-run: 2026-11-09-cn-suzhou-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 3 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 3 |

Index: 3614 known gyms (sha256 565a9d639a93…). Plan: 66249e9cb5a3… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (3)

- line 1 `seed-766` — Chinese store name from the gym's own RedNote account (星空攀岩(苏州湾歌林店), posts from the gym 2026-10/11), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 2 `seed-769` — Chinese store name from the gym's own RedNote account (刘常忠攀岩馆（奥体中心店）, route update post 2026-11-05), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 3 `seed-770` — Chinese store name from the gym's own RedNote account (刘常忠攀岩馆（独墅湖店）: difficulty, speed and bouldering areas; latest post 2026-08-13), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local

