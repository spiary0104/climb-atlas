# Import dry-run: 2026-11-07-cn-chengdu-info

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

Index: 3433 known gyms (sha256 ad459783ea35…). Plan: 8c4b4e442665… Also compared against staged batches: 2026-10-06-kr-seoul, 2026-11-08-cn-dongguan, 2026-11-08-cn-foshan, 2026-11-08-cn-ningbo, 2026-11-08-cn-wuxi.

## Updates to existing gyms (8)

- line 1 `seed-606` — Chinese name and address from the gym's own WeChat store guide (2025-12-27); hours left empty (WeChat and RedNote state different weekend hours)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 2 `seed-607` — Chinese name, address and hours from the gym's own WeChat store guide (2025-09-26); the brand's RedNote bio gives the same 10:00-22:00
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + address_local + source official-social mp.weixin.qq.com 2026-11-07
- line 3 `seed-608` — Chinese name, address and hours from the gym's own WeChat store guide (2025-09-28); the brand's RedNote bio gives the same 10:00-22:00
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + address_local + source official-social mp.weixin.qq.com 2026-11-07
- line 4 `seed-614` — Chinese name, address and hours from the store's own WeChat account (乐动飞蛙339店, post 2026-10-27)
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + address_local + source official-social mp.weixin.qq.com 2026-11-07
- line 5 `seed-611` — Chinese name, address and shoe/harness policy from the brand's own pinned RedNote store guide; hours left empty (guide and 2026-02 WeChat notice differ)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local + visitor shoe_hire + source official-social xiaohongshu.com 2026-11-07
- line 6 `seed-619` — Chinese name, address and shoe/harness policy from the brand's own pinned RedNote store guide; hours left empty (guide and 2026-02 WeChat notice differ)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local + visitor shoe_hire + source official-social xiaohongshu.com 2026-11-07
- line 7 `seed-622` — Name, address, hours and shoe/harness policy from the brand's own RedNote store guide; hours match its WeChat notice of 2026-02-06
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + address_local + visitor shoe_hire + source official-social xiaohongshu.com 2026-11-07
- line 8 `seed-629` — Name, address, hours and shoe/harness policy from the brand's own RedNote store guide; hours match its WeChat notice of 2026-02-06
  - FILLS gym information (only if empty in production; never overwrites): hours mon,tue,wed,thu,fri,sat,sun + name_local + address_local + visitor shoe_hire + source official-social xiaohongshu.com 2026-11-07

