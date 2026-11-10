# Import dry-run: 2026-11-08-cn-chongqing-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 10 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 10 |

Index: 3457 known gyms (sha256 39a207384343…). Plan: 3d7ef4a0ce35… Also compared against staged batches: 2026-10-06-kr-seoul.

## Updates to existing gyms (10)

- line 1 `seed-820` — Chinese name and hours from the gym's own RedNote bio (重庆雨岩攀岩馆, 渝北区汽博中心; weekdays 11:30-22:00, weekends 10:00-22:00), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + source official-social xiaohongshu.com 2026-11-08
- line 2 `seed-830` — Chinese name and hours from the gym's own RedNote bio (重庆TNT攀岩, Shapingba; 13:00-22:00, weekends 10:30-21:30), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + source official-social xiaohongshu.com 2026-11-08
- line 3 `seed-840` — Chinese name and hours from the gym's own RedNote bio (Hi攀攀岩, Jiulongpo; midweek 13:00-21:00, weekends 10:00-21:30), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + source official-social xiaohongshu.com 2026-11-08
- line 4 `seed-793` — Chinese store name from the brand's own RedNote bio (重庆尖叫攀岩: 尖叫攀岩（光电园店）), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 5 `seed-826` — Chinese store name from the brand's own RedNote bio (重庆尖叫攀岩: 尖叫趣攀攀岩（时代天街店）), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 6 `seed-845` — Chinese name from the gym's own RedNote account name and bio (大石头攀岩（BOULDER）, Chongqing combined gym), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 7 `seed-829` — Chinese name from the gym's own RedNote account (DDK心象攀岩, Dadukou; 15 m walls, kids' intro, speed training), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 8 `seed-825` — Chinese name from the gym's own RedNote account (酷基攀岩, a small training gym in Chongqing), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 9 `seed-822` — Chinese name from the gym's own RedNote account (萌客攀岩, bio: 坐标重庆南川), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 10 `seed-844` — Chinese name from the gym's own RedNote bio (Wood Climbing「我的」攀岩馆, 凯德广场2层56号), read 2026-11-08
  - FILLS gym information (only if empty in production; never overwrites): name_local

