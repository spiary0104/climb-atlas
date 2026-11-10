# Import dry-run: 2026-11-09-cn-shanghai-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 19 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 19 |

Index: 3457 known gyms (sha256 39a207384343…). Plan: 5a3ed4d70d22… Also compared against staged batches: 2026-10-06-kr-seoul, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-fuzhou, 2026-11-08-cn-guiyang, 2026-11-08-cn-harbin, 2026-11-08-cn-hefei, 2026-11-08-cn-nanchang, 2026-11-08-cn-nanning, 2026-11-08-cn-shenyang, 2026-11-08-cn-xining, 2026-11-08-cn-yinchuan, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai.

## Updates to existing gyms (19)

- line 1 `seed-535` — Chinese store name and hours from the brand's own RedNote bio (香蕉攀岩上海: 金虹桥店 07:00-23:00), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + source official-social xiaohongshu.com 2026-11-09
- line 2 `seed-541` — Chinese store name from the brand's own RedNote bio (岩时攀岩上海: 西岸梦中心店 营业中（难度）), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 3 `seed-537` — Chinese name from the brand's own RedNote bio (尽峰攀岩Acme Climbing: 在上海设有闵行、嘉定、189三家分馆), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 4 `seed-567` — Chinese name from the brand's own RedNote bio (尽峰攀岩Acme Climbing: 闵行、嘉定、189三家分馆) and its 尽峰攀岩嘉定馆 assistant account, read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 5 `seed-551` — Chinese name from the brand's own RedNote bio (尽峰攀岩Acme Climbing: 闵行、嘉定、189三家分馆; Meilong is the Minhang branch), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 6 `seed-544` — Chinese store name and hours from the brand's own RedNote bio (DOME攀岩营地: 徐汇万科店【全年10:00-23:00】), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + source official-social xiaohongshu.com 2026-11-09
- line 7 `seed-558` — Chinese store name from the brand's own RedNote bio (DOME攀岩营地: 长宁定西路店; hours given as weekdays/holidays, left empty), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 8 `seed-591` — Chinese name from the gym's own RedNote account (岩顶攀岩Rock Summit, Shanghai; posts 2026-10/11), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 9 `seed-593` — Chinese name and hours from the gym's own RedNote bio (Rock攀岩俱乐部, 上海普陀; Mon-Fri 13:00-22:00, weekends 11:00-21:00), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + source official-social xiaohongshu.com 2026-11-09
- line 10 `seed-569` — Chinese name and hours from the gym's own RedNote bio (五加攀岩南翔馆, 南翔太茂广场店; weekdays and holidays 10:00-22:00), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + source official-social xiaohongshu.com 2026-11-09
- line 11 `seed-581` — Chinese name from the gym's own RedNote bio (无界攀岩 Infinite Climbing: 📍长宁KING88 📍徐汇日月光; this record is the KiNG88 gym), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 12 `seed-592` — Chinese name and address from the brand's own RedNote bio (VMore: 浦东店：浦东新区崮山路500号5楼), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 13 `seed-1761` — Chinese name and address from the gym's own RedNote bio (Benchmark攀岩馆: 📍虹口区四川北路滨港商业中心4楼1423单元), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 14 `seed-1763` — Chinese name from the gym's own RedNote bio (Stonehaven Climbing Gym: STONEHAVEN攀岩馆, Shanghai), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 15 `seed-602` — Chinese name from the gym's own RedNote account (DYNO PARK攀岩馆, Shanghai; posts 2026-11), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 16 `seed-603` — Chinese store name from the gym's own RedNote account (J.Climbing攀岩馆(汇金路青立方馆)), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 17 `seed-600` — Chinese name from the gym's own RedNote account (J. Climbing攀岩运动馆, Shanghai), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 18 `seed-583` — Chinese name and address from the gym's own RedNote bio (登拓攀岩: 难度+抱石综合馆; 地址：闵行区春申路1899弄), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 19 `seed-557` — Chinese name from the gym's own RedNote account (共绘攀岩, 上海杨浦, since 2017), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local

