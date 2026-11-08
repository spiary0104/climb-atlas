# Import dry-run: 2026-11-08-cn-xian-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 6 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 6 |

Index: 3457 known gyms (sha256 39a207384343…). Plan: cb716a113334… Also compared against staged batches: 2026-10-06-kr-seoul.

## Updates to existing gyms (6)

- line 1 `seed-809` — Chinese name and address from the gym's own RedNote bio (红点攀岩; 地址:西安莲湖区西市南路西虹天上市1号楼5层; 700 m2, 15.6 m walls, speed lane), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 2 `seed-797` — Chinese name and address from the club's own RedNote bio (老陕攀登Qin Climbing club, since 2006; 📍碑林区含光路96号家属院内), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 3 `seed-798` — Chinese name from the gym's own RedNote account (岩十三攀岩, 「西安进阶抱石馆」), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 4 `seed-806` — Chinese name from the gym's own RedNote account (大仁攀岩 DAREN CLIMBING, an indoor/outdoor gym in Xi'an High-tech Zone), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 5 `seed-812` — Chinese name from the gym's own RedNote account (斑马攀岩, a small gym in Xi'an), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 6 `seed-813` — Chinese name from the gym's own RedNote account (我攀西安), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local

