# Import dry-run: 2026-11-08-cn-nanjing-info

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

Index: 3614 known gyms (sha256 565a9d639a93…). Plan: d81fb7228d62… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (8)

- line 1 `seed-859` — Chinese store name from the brand's own RedNote bio (石刻攀岩: 南京3家综合馆, 位于仙林的【南邮广场馆】...), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 2 `seed-854` — Chinese store name from the brand's own RedNote bio (石刻攀岩: ...江北的【印象汇馆】...), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 3 `seed-849` — Chinese store name from the brand's own RedNote bio (蓝鲸攀岩, 南京: 集庆门综合馆, 中胜综合馆, 太阳城旗舰综合馆, 梦幻城综合馆), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 4 `seed-850` — Chinese store name from the brand's own RedNote bio (蓝鲸攀岩, 南京: 集庆门综合馆, 中胜综合馆, 太阳城旗舰综合馆, 梦幻城综合馆), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 5 `seed-848` — Chinese store name from the brand's own RedNote bio (蓝鲸攀岩, 南京: 集庆门综合馆, 中胜综合馆, 太阳城旗舰综合馆, 梦幻城综合馆), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 6 `seed-853` — Chinese store name from the brand's own RedNote bio (蓝鲸攀岩, 南京: 集庆门综合馆, 中胜综合馆, 太阳城旗舰综合馆, 梦幻城综合馆), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 7 `seed-856` — Chinese name from the gym's own RedNote account (大象攀岩DàXiàng无形, 南京 430 m2 bouldering gym), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 8 `seed-858` — Chinese name and address from the gym's own RedNote bio (心跳攀岩 Pulse Climbing, 南京文化艺术中心--2F), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local

