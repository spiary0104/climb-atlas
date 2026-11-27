# Import dry-run: 2026-11-27-jp-west-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 32 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 32 |

Index: 3648 known gyms (sha256 266964b6c967…). Plan: 6ddb70abebce… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (32)

- line 1 `g-f6d3bee65b` — Official site: hours and prices from the gym's English visit page (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website bravoclimbing.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (1) + source official-site bravoclimbing.com 2026-11-27
- line 2 `g-bd57e68e26` — Official site: hours on home page, 1-day price from /price page of the same site (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website addict-climbing.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (3) + source official-site addict-climbing.com 2026-11-27
- line 3 `g-4da23ca2de` — Official site: hours and facilities on /gym, price from /money page of the same site (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website omoshirock.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (3) + source official-site omoshirock.com 2026-11-27
- line 4 `g-839ccd7028` — Official site: official site (page is http only, so website and facilities stated on it) (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website pentagon-climbing.com
- line 5 `g-49a2459647` — Official site: branch page states hours, visitor prices and facilities (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website ko-wall.jp + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (3) + source official-site ko-wall.jp 2026-11-27
- line 6 `g-29ca640867` — Official site: branch page states hours, visitor prices and facilities (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website ko-wall.jp + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (3) + source official-site ko-wall.jp 2026-11-27
- line 7 `g-74c1963d86` — Official site: hours and prices page of the gym (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website colors-climbing-gym.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (2) + source official-site colors-climbing-gym.com 2026-11-27
- line 8 `g-d8f4c67cfa` — Official site: Otsu store hours on the home page; kids park and rental on the site (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website rockmate.jp + hours mon,tue,wed,thu,fri,sat,sun + facilities (2) + source official-site rockmate.jp 2026-11-27
- line 9 `g-64ee1e4fa0` — Official site: gym page lists hours, 1-day price, cafe, shop and rentals (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website gym.goodbouldering.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (3) + source official-site gym.goodbouldering.com 2026-11-27
- line 10 `g-8f859d4315` — Official site: access page states hours, closing day and parking (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website noboriko.jp + hours mon,tue,wed,thu,fri,sat,sun + facilities (1) + source official-site noboriko.jp 2026-11-27
- line 11 `g-3c89f40f22` — Official site: official site (page is http only, so website and facilities stated on it) (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website titan-wall.com + facilities (2)
- line 12 `g-72a2396ac2` — Official site: usage guide page lists hours and visitor prices (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website waboclimbing.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + source official-site waboclimbing.com 2026-11-27
- line 13 `g-396849a66f` — Official site: official site (page is http only, so website and facilities stated on it) (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website ubl-climbingpark.com + facilities (2)
- line 14 `g-eb03d7e03e` — Official site: official site (page is http only, so website and facilities stated on it) (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website theranchgym.com + facilities (1)
- line 15 `g-8c9f5fd47b` — Official site: official site (opening hours mix staffed and unstaffed times) (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website rockbakka.jp
- line 16 `g-821bcf1f2e` — Official site: store profile states hours and parking; rental on the price page (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website q-block.jp + hours mon,tue,wed,thu,fri,sat,sun + facilities (2) + source official-site q-block.jp 2026-11-27
- line 17 `g-0e72a3430e` — Official site: home page lists hours, day pass, rental and parking (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website bouldergardensabo.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (2) + source official-site bouldergardensabo.com 2026-11-27
- line 18 `g-6065117d7a` — Official site: rocks BOULDERING GYM block on the access page (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website rocksclimbinggym.com + hours mon,tue,wed,thu,fri,sat,sun + source official-site rocksclimbinggym.com 2026-11-27
- line 19 `g-daea7cebe9` — Official site: hours in the site footer (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website lism-climb.lovepop.jp + hours mon,tue,wed,thu,fri,sat,sun + source official-site lism-climb.lovepop.jp 2026-11-27
- line 20 `g-77b39d209b` — Official site: home page lists hours, rentals and parking (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website bonclimbinggym.com + hours mon,tue,wed,thu,fri,sat,sun + facilities (2) + source official-site bonclimbinggym.com 2026-11-27
- line 21 `g-59b4395df0` — Official site: usage guide page lists hours, prices and rentals (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website k-climb.matsue-freeclimbing.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (1) + source official-site k-climb.matsue-freeclimbing.com 2026-11-27
- line 22 `g-177c5a2f85` — Official site: usage guide page lists hours and prices (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website matsue-freeclimbing.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (1) + source official-site matsue-freeclimbing.com 2026-11-27
- line 23 `g-684391a35d` — Official site: prices and hours page of the gym (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website itte-climbing.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + source official-site itte-climbing.com 2026-11-27
- line 24 `g-5066b9c2e3` — Official site: official site (page is http only, so website and facilities stated on it) (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website boulbaka.com + facilities (2)
- line 25 `g-13d8142df5` — Official site: branch page hours; visitor price from the branch /soleil/price page (researched 2026-11-27)
  - FILLS gym information (only if empty in production; never overwrites): website nakagaiclimbing.jp + hours mon,tue,wed,thu,fri,sat,sun + day pass + source official-site nakagaiclimbing.jp 2026-11-27
- … and 7 more (see plan.json)

