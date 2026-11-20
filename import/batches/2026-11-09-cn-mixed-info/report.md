# Import dry-run: 2026-11-09-cn-mixed-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 14 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 14 |

Index: 3614 known gyms (sha256 565a9d639a93…). Plan: 4bab9e3441f5… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (14)

- line 1 `seed-775` — Chinese name and address from the gym's own RedNote account 九星龙国际攀岩(苏州万象天地店) (bio: 苏州万象天地L1层L139-L141; 11.8 m walls, lead, top rope, bouldering), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 2 `seed-758` — Chinese store name from the brand's own RedNote account 考拉攀岩 (bio: 苏州2家店在新区和相城; posts name the 王府井店), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 3 `seed-759` — Chinese store name from the brand's own RedNote account 考拉攀岩 (bio: 苏州2家店在新区和相城; pinned post 新区店考拉攀岩路线指南), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 4 `seed-779` — Chinese store name from the gym's own RedNote account 芒果攀岩 (bio: 宁河吾悦广场攀岩; posts titled 芒果攀岩（宁河吾悦广场店）), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 5 `seed-497` — Chinese name from the gym's own RedNote account 闪电攀岩 (Guangdong, Shenzhen events), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 6 `seed-549` — Chinese address from the gym's own RedNote bio (GOAT Climbing 一馆：上海市真南路1199弄19号B1025), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): address_local
- line 7 `seed-545` — Chinese address from the gym's own RedNote bio (GOAT Climbing 二馆：上海市肇嘉浜路1117号TPY中心8F), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): address_local
- line 8 `seed-644` — Chinese name and address from the gym's own RedNote account mellow 攀岩馆 (bio: 北京市朝阳区506创新园7号楼西侧), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 9 `seed-727` — Chinese store name from the brand's RedNote accounts (CLIFFS颗粒攀岩馆: 杭州两家分店 上城、萧山; store account named CLIFFS颗粒攀岩 东方时代店, profile 64b014e50000000025034619), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 10 `seed-745` — Chinese store name from the brand's RedNote accounts (Unfollow攀岩 bio: 海珠｜石溪店：综合馆; store account named Unfollow攀岩馆(海珠石溪店), profile 662bd24e000000000303171d), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 11 `seed-495` — Chinese name from the gym's own RedNote account NerdCave攀岩馆 (bio: 深圳南山 est.2017), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 12 `seed-857` — Chinese address from the gym's own RedNote bio (Koolah Climbing: 南京玄武湖畔, 太阳宫2楼, 岗子村地铁站3号口直达), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): address_local
- line 13 `seed-682` — Chinese store name from the gym's own RedNote bio (北京青山攀石攀岩馆: 清河店（综合馆）, 魏公村店（抱石馆）), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 14 `seed-834` — Chinese name from the gym's own RedNote account 松鼠攀岩SquRock (IP location 重庆; pinned venue guide), read 2026-11-09
  - FILLS gym information (only if empty in production; never overwrites): name_local

