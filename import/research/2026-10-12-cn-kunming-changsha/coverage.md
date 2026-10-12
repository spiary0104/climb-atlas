# Coverage: China Kunming and Changsha (2026-10-12-cn-kunming-changsha)

## Result
- 12 candidates (cn-km-001..006, cn-cs-001..006), 61 sources registered (Amap listing per gym, RedNote own accounts, own notes, visitor notes).
- Reconcile: ready 5 | review 2 | blocked 5 | already in Bouldeer 0 | invalid 0. Decisions: accept 7, same-as 2, defer 3, reject 0.
- Staged batch `2026-10-12-cn-kunming-changsha`: 7 new gyms; plan exit 0 (new 7, probable-duplicate 0, invalid 0); read-only dry-run: PREFLIGHT PASSED (partial coverage, no service-role read); `node --test "tests/*.test.js"` 387 pass, 0 fail, 31 skipped.
- Kunming had 0 gyms in Bouldeer; the section adds 5. Changsha had 3 (Banana x3); the section adds 2 and re-identifies 2 (seed-711, seed-712). seed-713 is a retire follow-up.

## Kunming: what was found and what was left out
Amap lists about 15 climbing venues for the city (queries 攀岩馆, 抱石, 攀岩, 攀登, 岩馆 and the page list).
| Venue | Result |
|---|---|
| Nayan Tuodong, Nayan 0871 | accepted |
| Xiaoxiong Yunling Tianjiao, Hailer World | accepted |
| Panyang Climbing Gym (Chenggong) | accepted |
| Jinri Jianshe Lu | deferred (visitor notes only) |
| Jinri Harmony Plaza, Jinri Wanda | left out: no 2026 notes found |
| ROCK TENET (Dianchi Convention Centre) | left out: own account last posted 2025; two 2026 visitor notes, bouldering not clearly shown (competition lead-training venue) |
| TNS Climbing (Joy City) | left out: the own account posts outdoor courses (Fuxian Lake); no gym bouldering evidence |
| Tineng Hu (Hailer World), Wandonghui tennis and climbing, Shangpan (Anning youth palace), Pandengxia x2 (children), trampoline parks (Sky City, YUMEWORLD) | left out: fitness, kids or non-bouldering venues |
| Shigu and other outdoor crags | outdoor, not gyms |

## Changsha: what was found and what was left out
Amap lists about 20 venues (queries 攀岩馆, 抱石, 攀岩, 岩馆, 香蕉攀岩).
| Venue | Result |
|---|---|
| CAMP4 Xihu Park, TBW Longji Base | accepted |
| Banana Zhujiang Star Ring, Yuefang ID Mall | same-as seed-711, seed-712 |
| Banana CapitaLand One | closed (Amap: business suspended; farewell note 2026-06-16): retire follow-up for seed-713 |
| Zaoan, Xiangpan | deferred |
| V9 Climbing (Xingsha) | left out: one visitor note (2026-08-27) only; small gym (two rooms of walls plus one high wall) |
| Jiu'er Climbing (Helong) | left out: rope-based older gym (opened 2011), account posts instructor courses |
| Daxi x4 (Yanghu, Wuyue, Poly Tianxi, Changsha South), Xiangshang Pan x2 (Xingsha, Ningxiang), Caixing x2 | left out: searched, no usable 2026 evidence found (Daxi: two visitor notes, one about children) |
| Wupeng, Panxing (children) | listed, not examined |
| Jungle activity park, Shiyanhu park wall, Daweishan base | outdoor / activity parks |
