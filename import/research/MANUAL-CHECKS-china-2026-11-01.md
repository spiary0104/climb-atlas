# China city research, 2026-11-01: manual checks and status

Sources: Amap search + listing detail (owner's signed-in tab, read 2026-11-01; Amap answers are often UNSTABLE, i.e. two reads differ,
so names/addresses/pins from search pages are indicative only), RedNote accounts of the gyms (read-only, 2026-11-01), Bouldeer live data
(read-only fetchLive, 2026-11-01). Nothing was staged, imported or written to Supabase.

## What was done and what was not
| City | Amap done | Accepted into a section | Notes |
|---|---|---|---|
| Guangzhou | yes (攀岩, 攀岩馆, 抱石 x3 pages; brands 香蕉攀岩, 岩时, 攀岩工厂, 熊猫攀岩, 攀岩俱乐部, 攀石) | section `2026-11-01-cn-guangzhou`: 3 accept, 2 same-as (location updates for seed-750, seed-741) | see below |
| Hangzhou | yes (攀岩, 攀岩馆, 抱石, 香蕉攀岩, 噜呐攀岩, 攀石) | none (no section created) | stopped before listing-detail coordinates were read |
| Shenzhen | NOT done | - | browser work stopped |
| Chongqing | NOT done | - | browser work stopped |

**Blocker (2nd one):** `rnprofile.js` failed twice in a row on RedNote profile 697ecac2000000002102c0fd (香蕉攀岩杭州):
`TypeError: Cannot read properties of undefined (reading 'slice')` (the page body did not render the expected text, possibly a
login/verification wall after about 30 RedNote reads). Per the brief browser work stopped there. To resume: rerun Hangzhou detail reads
(`detail.js` after an `amapq.js` call so the tab is on amap.com), then Shenzhen 440300 and Chongqing 500000.
(The first blocker, the stale tab id, was fixed by the coordinator and is not an issue any more.)

## Guangzhou: Amap listings vs Bouldeer
43 listings seen (some are fun parks or non-gyms); 12 lie within 400 m of an existing Bouldeer gym (same gym, pin differences
129-374 m for seed-739, 740, 742, 744, 745, 746, 749, 752, 753; see list below), 31 were not near an existing gym.

New in the section (accepted candidates): 火星(悦汇城) is same-as seed-750, 火星(桥南汇) same-as seed-741 (both need pin updates), BoulderDash 健康港, BoulderDash 万博, Unfollow 流花中心.

### Amap-listed, not near an existing Bouldeer gym, NOT accepted (low confidence or evidence missing)
Candidate = enough to look at later; "bouldering?" means no primary statement of bouldering was found.
- B0L2SR73OI 山宁芙攀岩馆 Oread Boulder Gym (Panyu, Nancun Wanbo Wangdi mall 4F 405): name says boulder gym; no official RedNote account found (users search returned none). Likely valid, needs an official source.
- B0KKBADMHY 岩图攀岩馆(抱石店) BOULDERING GYM (Huadu) and B0M1M6CR8S 岩图攀岩(嘉华广场店): Amap names say bouldering; no official account searched.
- B0JGR589KY 王者攀岩(白云区鹅掌坦店) (Baiyun) : not searched; Amap lists a second 王者 (B0FFIBMOB4, near seed-753).
- B0KRV7H9S7 攀岩世界(凯德缤纷天地店), B0MDLUJON3 解法空间攀岩, B0L0T49RHJ 岩舞空间攀岩馆, B0L6YRO1EG 普岚体育(番禺店; same chain as seed-738), B0M2P5N797 东山攀岩 (opened 2026-09-30 per its own account, "综合攀岩馆", bouldering not stated), B0M1DCUCP5 黑喵攀岩馆 (own account, opened Oct 2026, 400 m2, name BCbloc; bouldering not stated), B0L0Z5F3MP 擎天攀岩(南站店) (own account active to 2026-09-23; bouldering not stated; sister 草芳围店 is seed-746), B0MU35PAYH 香蕉攀岩(君超中心) (brand account 香蕉攀岩广州 active 2026-10-24; branch not confirmed), B0MR3BZNG3 Unfollow(金融城广场店) (Amap: 装修中 = under renovation; own bio calls it a 综合馆), B0M2FRA4QY 岩时攀岩(啤酒厂1985店) (装修中), B0M6KUCE6B 岩界攀岩, B0M2ZX3U9I Besloower攀岩(从化店) , B0M1FRB4JK 红钻攀岩馆, B0FFF4UPNV 广州大学城体育中心攀岩场 (university sports centre, probably seed-754 area), B0MGXCY2N8 奥体攀岩馆 (near seed-739), B0FFLKVBM7 Sports Monster, B0LU5XPZL5 兜时光拓展攀岩乐园 (花都, fun park).
- Not gyms / out: B0KUFCX5M7 拱形攀爬, B0G2T18TDV 攀岩挑战区 (children's park), B0FFG24K25 攀岩墙 (scenic area), B0FFJQ3S5K 飞越丛林探险乐园.

### Existing Guangzhou gyms: issues
- seed-751 Super Extreme Climbing (SCUT East Campus): a RedNote user note of 2026-07-02 titled "别跑空！华工攀岩馆关门了" (SCUT climbing gym has closed) turned up in the 超极限 search; third-party report, not verified. Suspected closure. (The brand's own account lists 4 branches and posted a 华工 note on 2026-01-31.)
- seed-750 and seed-741 pins are 691 m and 1,805 m off the Amap listings (see section review.json).
- seed-735 Banana Grantral has a 3-decimal pin (approximate).
- Amap pins within 400 m of existing gyms (probably same gyms; pin offsets): 王者 B0FFIBMOB4 / seed-753 374 m, 趣野 B0FFG1MLXP / seed-742 323 m, Unfollow 石溪 / seed-745 373 m, 闪攀岩馆 / seed-749 368 m, 超极限 奥体 / seed-739 194 m, 超极限 永隆 / seed-740 142 m, 狮霖 / seed-752 129 m, 羽石 / seed-744 125 m, 擎天草芳围 / seed-746 13 m, BoulderDash 四季天地 / seed-736 79 m.

## Hangzhou (Amap read only, no section)
55 listings seen, 8 within 400 m of an existing gym, 47 not near one (many chains: 噜呐, 香蕉, 闷头, 顽攀, 岩时, 环岛, 滴搭, CLIFFS, 岩究生/Rocktopia, Go Link, ...).
- Evidence found but no accepted candidate (needs Amap listing-detail coordinates, which were not read): **噜呐攀岩(滨江银泰店)** B0MURUDN2C: own RedNote account 693a75520000000037031c60, bio "纯抱石馆" (pure bouldering), posts to 2026-10-30. Best next candidate.
- 噜呐攀岩(大悦城店) B0M6JUEVM4: own account bio "纯难度攀岩馆（无攀石）" = rope only, no bouldering: reject as no-bouldering. 噜呐 城西银泰店 (B0MBN5SUIV) and 金沙店 (B0L3RANK6O): own accounts active to 2026-10-27, bouldering not stated.
- Existing: Amap shows 攀猩攀岩馆(加州阳光·开元广场店) B0K3PC4ZVW as (暂停营业) = temporarily closed; near seed-729 Climbing Orangutan (214 m). Suspected temporary closure of seed-729.
- Other Hangzhou Amap pins vs existing: 开心攀岩(五常店) B0L14C2CWC / seed-728 347 m and 岩力实验室 / seed-728 316 m (seed-728 and seed-730 share one pin: one of them is wrong).

## Existing gyms in the four cities: issues visible from Bouldeer data alone (not verified against Amap)
Identical pins (at least one wrong): seed-497 + 514 (22.5427932,114.0628443); seed-499 + 510 + 522 (22.6900903,114.2094974); seed-500 + 531 (22.5360142,113.9256222); seed-728 + 730 (30.2457731,120.0229703); seed-821 + 825 (29.6949,106.6182).
3-decimal (approximate) pins: Shenzhen seed-486 to 493; Hangzhou seed-714 to 716; Guangzhou seed-735; Chongqing seed-791 to 795, 816, 833, 834, 835, 837, 838, 840 to 844.
Kids-named venues (adult access unknown): seed-515, 518, 519, 525, 529 (Shenzhen); seed-816, 817, 821, 828, 831, 838, 839 (Pandengxia Kids, Chongqing).

## Shanghai / Beijing gap assessment
Not done: needed Amap counts for Shanghai (310000) and Beijing (110000) and browser work had stopped. Bouldeer has 78 (Shanghai) and 55 (Beijing).
For scale only: Guangzhou has 43 Amap climbing listings vs 20 Bouldeer gyms (31 not near an existing gym); Hangzhou 55 vs 21 (47 not near one).
