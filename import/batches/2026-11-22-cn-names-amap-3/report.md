# Import dry-run: 2026-11-22-cn-names-amap-3

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 54 |
| Retire existing gyms (closed / duplicate: status becomes rejected, record kept) | 7 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 61 |

Index: 3658 known gyms (sha256 e44702806afb…). Plan: bb2879606b37… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (54)

- line 1 `seed-539` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 2 `seed-540` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 3 `seed-542` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 4 `seed-552` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 5 `seed-561` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 6 `seed-556` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 7 `seed-563` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 8 `seed-566` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 9 `seed-573` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 10 `seed-580` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 11 `seed-594` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 12 `seed-599` — Chinese name as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 13 `seed-576` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 14 `seed-640` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 15 `seed-657` — Chinese name as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 16 `seed-678` — Chinese name as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 17 `seed-645` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 18 `seed-648` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 19 `seed-661` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 20 `seed-662` — Chinese name as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 21 `seed-669` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 22 `seed-687` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 23 `seed-689` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 24 `seed-610` — Chinese name as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 25 `seed-612` — Chinese name and address as written on the gym's Amap listing (owner decision 2026-11-22: local labels may come from Amap)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- … and 29 more (see plan.json)

## Retirements of existing gyms (7)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 55 `seed-559` "Panxing Climbing (Nanqiao Bailian)" (CN) — not-public: Kids-only climbing venue: its Amap listing is 攀猩儿童攀岩馆(南桥百联店), a children's climbing gym (checked 2026-11-22); not listed per owner policy 2026-11-11.
- line 56 `seed-568` "Panxing Climbing (Zhonghuan Bailian)" (CN) — not-public: Kids-only climbing venue: its Amap listing is 攀猩儿童攀岩馆(中环百联店), a children's climbing gym (checked 2026-11-22); not listed per owner policy 2026-11-11.
- line 57 `seed-634` "Climbing Hero (Shuangliu Wanda)" (CN) — not-public: Kids-only climbing venue: its Amap listing is 攀登侠儿童攀岩馆(万达广场双流店), a children's climbing gym (checked 2026-11-22); not listed per owner policy 2026-11-11.
- line 58 `seed-605` "Jibi Storm Climbing (Bailian Xijiao)" (CN) — closed: Closed: its Amap listing 极壁风暴攀岩馆(长宁店) is marked 暂停营业 (temporarily closed), checked 2026-11-22.
- line 59 `seed-668` "Yaoyan Climbing (Shahe)" (CN) — closed: Closed: its Amap listing 耀岩攀岩(沙河店) is marked 暂停营业 (temporarily closed), checked 2026-11-22.
- line 60 `seed-729` "Climbing Orangutan (California Sunshine Kaiyuan Plaza)" (CN) — closed: Closed: its Amap listing 攀猩攀岩馆(加州阳光·开元广场店) is marked 暂停营业 (temporarily closed), checked 2026-11-22.
- line 61 `seed-851` "Kuanrun Climbing Gym" (CN) — closed: Closed: its Amap listing 宽润 is marked 暂停营业 (temporarily closed), checked 2026-11-22.

