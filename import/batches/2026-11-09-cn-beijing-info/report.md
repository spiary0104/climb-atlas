# Import dry-run: 2026-11-09-cn-beijing-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 8 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 8 |

Index: 3614 known gyms (sha256 565a9d639a93…). Plan: 614b85eaf5d2… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (8)

- line 1 `seed-649` — Chinese store name from the brand's own RedNote bio (岩时攀岩 ROCKHOUR, 北京：攀登中心、管庄店、回龙观店、大屯店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 2 `seed-656` — Chinese store name from the brand's own RedNote bio (岩时攀岩 ROCKHOUR, 北京：攀登中心、管庄店、回龙观店、大屯店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 3 `seed-676` — Chinese store name from the store's own RedNote account (奥攀攀岩（五棵松）), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 4 `seed-665` — Chinese store name from the store's own RedNote account (奥攀攀岩世界公园店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 5 `seed-652` — Chinese store name from the store's own RedNote account (趣野攀岩-北苑店; this record is at Longhu Beiyuan Tianjie), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 6 `seed-658` — Chinese store name from the brand's own RedNote bio (Climb On Gym: @COG攀岩馆首钢店; this record is in Shougang Park), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 7 `seed-650` — Chinese store name from the brand's own RedNote bio (岩时攀岩 ROCKHOUR, 北京：攀登中心、管庄店、回龙观店、大屯店; this record is the Climbing Center), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 8 `seed-653` — Chinese store name from the brand's own RedNote bio (CAMP4 攀岩: 北京 三里屯店/将台店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local

