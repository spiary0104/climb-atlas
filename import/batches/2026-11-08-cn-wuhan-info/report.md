# Import dry-run: 2026-11-08-cn-wuhan-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 7 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 7 |

Index: 3614 known gyms (sha256 565a9d639a93…). Plan: 8d741cdba1f2… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (7)

- line 1 `seed-693` — Chinese name and address from the brand's own RedNote account 武汉香蕉攀岩 (store list in its bio: 热干蕉—武汉市徐家棚街道亲橙万象汇L501号), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 2 `seed-694` — Chinese name and address from the brand's own RedNote account 武汉香蕉攀岩 (store list in its bio: 糯米蕉—武汉市恒隆广场西座501B), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 3 `seed-692` — Chinese name and address from the brand's own RedNote account 武汉香蕉攀岩 (store list in its bio: 斑马蕉—武汉市华发中城商都B1栋B1-L1-1号), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 4 `seed-695` — Chinese name and address from the brand's own RedNote account 武汉香蕉攀岩 (store list in its bio: 极光蕉—武汉市光谷K11购物艺术中心外街), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 5 `seed-699` — Chinese name from the gym's own RedNote account (五岩六色攀岩馆: difficulty, speed and bouldering walls, 850 m2 of climbing), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 6 `seed-704` — Chinese name from the gym's own RedNote account (K-PRO快意攀岩: difficulty, speed and bouldering), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 7 `seed-696` — Chinese name from the gym's own RedNote account (优胜美岩, Wuhan), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local

