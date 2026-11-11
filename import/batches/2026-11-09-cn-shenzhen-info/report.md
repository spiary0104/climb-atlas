# Import dry-run: 2026-11-09-cn-shenzhen-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 11 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 11 |

Index: 3614 known gyms (sha256 565a9d639a93…). Plan: 3489894cff79… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (11)

- line 1 `seed-486` — Chinese store name from the brand's own RedNote bio (香蕉攀岩深圳: 深圳8家门店, store list 华侨城欢乐时光), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 2 `seed-487` — Chinese store name from the brand's own RedNote bio (香蕉攀岩深圳: 深圳8家门店, store list 卓悦汇店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 3 `seed-488` — Chinese store name from the brand's own RedNote bio (香蕉攀岩深圳: 深圳8家门店, store list Banana+嘉乐道店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 4 `seed-489` — Chinese store name from the brand's own RedNote bio (香蕉攀岩深圳: 深圳8家门店, store list 后海汇店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 5 `seed-490` — Chinese store name from the brand's own RedNote bio (香蕉攀岩深圳: 深圳8家门店, store list iN城市广场店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 6 `seed-491` — Chinese store name from the brand's own RedNote bio (香蕉攀岩深圳: 深圳8家门店, store list 福田领展中心城店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 7 `seed-492` — Chinese store name from the brand's own RedNote bio (香蕉攀岩深圳: 深圳8家门店, store list 金蝶店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 8 `seed-493` — Chinese store name from the brand's own RedNote bio (香蕉攀岩深圳: 深圳8家门店, store list 宝安中心店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 9 `seed-532` — Chinese store name from the brand's own RedNote bio (征岩攀岩: 桂湾公园攀石场@征岩攀岩（桂湾店）), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 10 `seed-510` — Chinese name from the brand's own RedNote bio (征岩攀岩: ...& 大运体育馆攀岩体验馆; this record is at the Universiade Center), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 11 `seed-514` — Chinese name and hours from the gym's own RedNote bio (UPlus攀岩馆, 呢度有家攀岩馆, 岗厦北地铁站13号出口; Mon-Fri 16:00-22:00, Sat-Sun 10:00-22:00), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + source official-social xiaohongshu.com 2026-11-09

