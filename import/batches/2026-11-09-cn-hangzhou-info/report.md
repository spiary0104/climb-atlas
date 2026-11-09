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

Index: 3457 known gyms (sha256 39a207384343…). Plan: 6e6730f65f23… Also compared against staged batches: 2026-10-06-kr-seoul, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-fuzhou, 2026-11-08-cn-guiyang, 2026-11-08-cn-harbin, 2026-11-08-cn-hefei, 2026-11-08-cn-nanchang, 2026-11-08-cn-nanning, 2026-11-08-cn-shenyang, 2026-11-08-cn-xining, 2026-11-08-cn-yinchuan, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai.

## Updates to existing gyms (2)

- line 1 `seed-717` — Chinese store name from the store's own RedNote account (杭州顽攀攀岩滨江馆), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 2 `seed-718` — Chinese store name from the store's own RedNote account (杭州顽攀攀岩-西湖文体馆), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local

