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

Index: 3457 known gyms (sha256 39a207384343…). Plan: 22304c4ecc1e… Also compared against staged batches: 2026-10-06-kr-seoul, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-fuzhou, 2026-11-08-cn-guiyang, 2026-11-08-cn-harbin, 2026-11-08-cn-hefei, 2026-11-08-cn-nanchang, 2026-11-08-cn-nanning, 2026-11-08-cn-shenyang, 2026-11-08-cn-xining, 2026-11-08-cn-yinchuan, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai.

## Updates to existing gyms (3)

- line 1 `seed-766` — Chinese store name from the gym's own RedNote account (星空攀岩(苏州湾歌林店), posts from the gym 2026-10/11), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 2 `seed-769` — Chinese store name from the gym's own RedNote account (刘常忠攀岩馆（奥体中心店）, route update post 2026-11-05), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 3 `seed-770` — Chinese store name from the gym's own RedNote account (刘常忠攀岩馆（独墅湖店）: difficulty, speed and bouldering areas; latest post 2026-08-13), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local

