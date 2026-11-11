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

## Amap gap estimate (Amap read 2026-11-01, signed-in tab; search 攀岩/攀岩馆/抱石, 3 pages each)
"Unmatched" = an Amap climbing listing with no Bouldeer pin within 400 m: a missing gym OR an existing gym whose pin is wrong (many CN pins are 0.5-3 km off; PR #84 fixes 35). Search is capped at 60 results per keyword, and children's, school, ice and shoe-repair listings are filtered by name only. Upper bounds, not candidates.

| City | Amap climbing listings | within 400 m of Bouldeer | unmatched | Bouldeer today |
|---|---|---|---|---|
| Guangzhou | 39 | 10 | 29 | 20 |
| Hangzhou | 48 | 7 | 41 | 21 |
| Shenzhen | 58 | 12 | 46 | 47 |
| Chongqing | 38 | 5 | 33 | 36 |
| Shanghai | 80 | 15 | 65 | 78 |
| Beijing | 78 | 11 | 67 | 55 |

Priority for the next research sections (missing gyms x traveller relevance): Hangzhou, Guangzhou (continue), Beijing, Shanghai (pins first: PR #84), Chongqing, Shenzhen. RedNote research paused 2026-11-01 at a security check (owner to clear it).

## Existing-gym audit 2026-11-02 (supersedes the older "issues" lists above for Hangzhou, Guangzhou, Beijing, Shanghai, Chongqing, Shenzhen)
Full per-gym tables: `import/research/2026-11-02-cn-pins/verification.md`. Batches (not applied; dry-run PASSED with PARTIAL coverage):
`import/batches/2026-11-02-cn-pins` (57 pin updates + 2 retirements) and `2026-11-02-cn-pins-2` (72 pin updates). PR #84 gyms were skipped.
RedNote loads used this run: about 14 (no security check hit); Amap: no limit hit.

Retired (closed, with evidence): seed-638 Rock Time Dawanglu (official closure notice, closed 2026-08-08), seed-751 Super Extreme SCUT (walls removed; two user notes, not on Amap, not in the brand's branch count).

Manual checks (owner or a later pass):
- Suspended on Amap (暂停营业), pin fixed in the batch but status unresolved: seed-729 Hangzhou (a new gym "攀岩梦工厂开元店" opened nearby 2026-09), seed-684 Beijing Zhongpan Alps. Suspended and not fixed: seed-668 Beijing Yaoyan Shahe (same compound as seed-667).
- Same address, other brand on Amap (rebrand, closure or wrong brand): seed-657 Aopan Xihongmen (魔王攀岩), seed-680 Climbing Orangutan (岚山攀岩), seed-564 Shanghai High Five (酸爽攀岩), seed-581 Pake (无界攀岩).
- Pin cannot be fixed with confidence: seed-723 Hangzhou Go Link (entrance and listing coordinate 400 m apart), seed-734, seed-735 Banana Grantral (transliteration match only), seed-640, 649, 681, 583, 601, 835, 842.
- No Amap listing found (may be closed or just not in the capped searches): Hangzhou 725, 731, 733; Beijing 641, 643 (family play venue found at the address), 660, 662, 670, 675, 688; Shanghai 21 gyms; Chongqing 791, 795, 818, 834, 836, 837, 841; Shenzhen 17 gyms. See the tables.
- Duplicates suspected: seed-499 and seed-510 (same address), seed-662/others sharing pins.
- Children-only by name (adult access unknown; not retired, pins untouched): Shanghai 554, 586, 588; Chongqing 817, 821, 828, 831, 838, 839; Shenzhen 507, 515, 518, 519, 525, 529.
- Not done: RedNote open/closed checks for gyms with a normal Amap listing (Amap "listed, not flagged closed" is weak evidence), and Amap searches per remaining brand for Shanghai/Shenzhen.

New gyms: section `import/research/2026-11-02-cn-hangzhou` (reconciled, not staged): cn-hz-001 Luna Binjiang Yintai (pure bouldering per its own account; review), cn-hz-002 Banana+ Hangzhou Center (opened 2026-10-28; bouldering not stated, blocked). China new-gym batches stay on hold for the local-name schema (PR #88).

## 2026-11-02 second pass: new-gym research with RedNote (about 30 page loads) and saved Amap data
Amap was not used after its anti-abuse dialog appeared. Section created: `2026-11-01-cn-jinan` (2 accept, 1 defer; not staged).
**Region codes missing in the app** (candidates cannot be created until `js/modules/regions.js` CN has them): Dali, Lijiang, Foshan, Dongguan, Zhongshan, Wenzhou, Sanya, Taiyuan, Hohhot, Wuxi, Changzhou, Lanzhou, Xining, Yinchuan, Urumqi, Lhasa. Existing codes include Jinan, Kunming, Qingdao, Xiamen, Ningbo, Changsha, Zhuhai.
Primary evidence found (own RedNote account), but not turned into a candidate:
- Dali 行山攀岩馆 (大理店, 小院子中区; Amap B0I2FZFHQO, stable entrance 25.663220,100.171914): own account (1K followers) says 难度抱石 (bouldering), hours 10:00-20:00, posts to 2026-09-02; also a Mile (弥勒) branch. Blocked only by the missing Dali region code.
- Wenzhou 芭乐攀岩: own account (1.2K) says 室内攀石2800㎡ at the 瓯联馆; branches 龙湾, 瑞安新湖银泰, 鹿城 (opening). The Amap listing B0LU24O9C4 (龙湾区蒲州街道上江路185号) cannot be tied to one branch, and Wenzhou has no region code.
- Zhuhai 香蕉攀岩 旺角荟店 (Amap B0M2ZL3WCE, coordinate pending Amap detail read): brand account 香蕉攀岩珠海 (809 followers) posts to 2026-10-28; bouldering not stated in the notes read.
- Zhuhai 蓝天攀岩 (青少年活动中心店 B0FFGBAJ4K, 城市客厅店 B0I3KS9MBJ): youth-focused education account, bouldering/adult access not stated.
- Jinan 515 世茂芯环店: in the section as deferred (bouldering unknown).
- Foshan/Shunde HELLO MAX攀岩 (Amap B0K26PV0KP, account 95852275487) and 擎天攀岩 (account 63869137369, city not stated): active accounts, bouldering and branch not tied to a listing; no Foshan region code.
- Changsha 九二攀岩馆(贺龙店) (Amap B0FFGZP0SQ, stable entrance): own account, youth training and private coaching only, last post 2026-03-01, bouldering not stated. Changsha 大曦 / 向上攀 / 湘攀 / TBW / CAMP4: no own account found in the one search made; coordinates not read (search reads UNSTABLE). Needs an Amap detail read.
- Xiamen, Kunming, Qingdao, Ningbo: no RedNote reads made this pass (all saved search coordinates were UNSTABLE and no listing-detail coordinate was saved, so no candidate could be built).

## Follow-up 2026-11-11 (public-source verification)
Method: checked by Claude (AI) on public sources; ChatGPT leads re-verified (Amap place pages return an empty map shell without a session, so ChatGPT's Amap URLs could not be re-confirmed; Banana Climbing's own store data was read from its public JS bundle https://www.bananaclimbing.com/assets/index-B-4QZzpK.js); nothing written to production. RedNote, Amap login and OpenCLI were not used. "Not found" below means a web search returned nothing, not that the gym is closed.
- **山宁芙攀岩馆 Oread Boulder Gym (B0L2SR73OI), Guangzhou Panyu**: STATUS: OPEN (confidence Low). Web search found no source at all; no gym-controlled source. Sources: web search (checked 2026-11-11). Next: find its own WeChat/RedNote account (needs a signed-in session).
- **岩图攀岩馆(抱石店) B0KKBADMHY and 岩图攀岩(嘉华广场店) B0M1M6CR8S**: STATUS: OPEN (confidence Low). ChatGPT's only source is the Amap page, which could not be re-fetched; web search finds nothing. Name says bouldering; current operation and the second branch are unconfirmed. Sources: https://www.amap.com/place/B0KKBADMHY (unreadable, checked 2026-11-11). Next: own account for each branch.
- **王者攀岩(白云区鹅掌坦店) B0JGR589KY**: STATUS: OPEN (confidence Low). Nothing found beyond Amap-derived notes. Next: own account.
- **Other Guangzhou Amap leads (攀岩世界, 解法空间, 岩舞空间, 普岚体育番禺, 东山攀岩, 黑喵/BCbloc, 擎天南站, Unfollow金融城, 岩时啤酒厂1985, 岩界, Besloower, 红钻, 大学城, 奥体, Sports Monster, 兜时光)**: STATUS: OPEN (confidence Low). No public gym-controlled source reachable; they stay out until an own account or operator page shows open with bouldering. Next: own accounts (signed-in).
- **香蕉攀岩(君超中心) B0MU35PAYH, Guangzhou (and seed-735 Banana Grantral)**: STATUS: NEEDS HUMAN (confidence Medium for identity, Low for pin). The operator's site lists 香蕉攀岩 君超店 (广州天河区黄埔大道中652号, active, 10:00-22:00, bouldering/lead/autobelay, 1,400 m2, marked new, data updated 2026-09-28): same address as the Amap listing and, by brand and transliteration, very likely the existing seed-735 (Bouldeer has no address for it; the record was not compared). So it is an open bouldering gym but should be handled as the existing seed-735 (address/location update), not a new gym. The operator publishes a coordinate (23.117983, 113.376669; datum unstated), which is not a stated entrance. Sources: https://www.bananaclimbing.com/assets/index-B-4QZzpK.js (checked 2026-11-11). Next: owner confirms seed-735 = 君超店 on a map, then a pipeline address/location update; pin by map or entrance check.
- **噜呐攀岩 城西银泰店 (B0MBN5SUIV) and 金沙店 (B0L3RANK6O), Hangzhou**: STATUS: OPEN (confidence Low). A news report only confirms a 噜呐 at 大悦城 and that 城西银泰 has some climbing gym; nothing says bouldering at either branch. Sources: https://www.ehangzhou.gov.cn/2025-08/25/c_294749.htm (checked 2026-11-11). Next: own-account branch posts; stay deferred.
- **cn-hz-001 Luna Binjiang Yintai**: STATUS: ALREADY RESOLVED (confidence High). Accepted and imported (batch 2026-11-02-cn-hangzhou, manifest status imported; applied 2026-11-08, commit 4275923). Sources: `import/batches/2026-11-02-cn-hangzhou/manifest.json` (checked 2026-11-11). Next: none.
- **cn-hz-002 Banana+ Hangzhou Center, Hangzhou**: STATUS: OPEN (confidence Low). The operator's site lists three Hangzhou stores, all active, bouldering, marked new, updated 2026-09-28: 来福士店 (上城区新业路228号来福士广场4F), 西溪天街店 (西湖区余杭塘路龙湖西溪天街4层), 奥体印象城店 (萧山区盈丰街道汇德隆印象城L6-01a). None is named "Center" and no match to the cn-hz-002 record was established (record not read). The three are separate eligible leads needing a duplicate check against existing Hangzhou gyms. Sources: https://www.bananaclimbing.com/assets/index-B-4QZzpK.js (checked 2026-11-11). Next: duplicate-check the three operator stores through the pipeline; identify what "Banana+ Hangzhou Center" is.
- **Climbing Orangutan (seed-729), Hangzhou**: STATUS: NEEDS HUMAN (confidence Low). Amap 暂停营业 plus a new gym 攀岩梦工厂开元店 nearby (RedNote, 2026-09); pin applied 2026-11-06 (cn-pins) but status unresolved; nothing public found. Next: phone or check the brand's own account; owner decides on retire.
- **Zhongpan Alps (seed-684), Beijing**: STATUS: OPEN (confidence Low). Only the Amap suspension; no closure notice in the 2026-11-02 audit; web search found nothing. Pin applied. Next: own account or phone call.
- **Yaoyan Shahe (seed-668), Beijing**: STATUS: CONFLICTING (confidence Low). Amap shows 暂停营业; the ticketing aggregator https://huodong.com/venue/detail/hpuvko (re-fetched) shows the branch open daily 10:00-22:00 with no date, so its freshness is unknown; the dusts.me page did not render. Neither is gym-controlled evidence. Sources: those two URLs (checked 2026-11-11). Next: the gym's WeChat official account or a phone call; do not retire yet.
- **Aopan Xihongmen (seed-657) and Climbing Orangutan (seed-680), Beijing**: STATUS: OPEN (confidence Low). Rebrand, closure or wrong brand cannot be told apart from public sources; nothing found. Next: own accounts of 魔王攀岩 / 岚山攀岩, or a visit.
- **Pake (seed-581), Shanghai**: STATUS: ALREADY RESOLVED (confidence Medium). The gym's own RedNote bio (read for the 2026-11-09 info fill) names 无界攀岩 Infinite Climbing at 长宁KING88 and that fill treats the record as that gym; the Chinese-name fill is staged in 2026-11-09-cn-shanghai-info (apply queue). Sources: `import/batches/2026-11-09-cn-shanghai-info/report.md` (checked 2026-11-11). Next: owner decides whether to rename the English display name "Pake".
- **High Five (seed-564), Shanghai Jing'an**: STATUS: NEEDS HUMAN (confidence Low). Amap lists 酸爽攀岩 at the record's own address (永和东路643号2幢L180) and the "High Five" listing 攀竞体育 is 5.7 km away; not in any batch; nothing public found. Next: own account of either brand or a visit to decide which address is right.
- **Go Link (seed-723), Hangzhou**: STATUS: NEEDS HUMAN (confidence Low). Entrance (30.230826, 120.226944) and listing coordinate (30.232196, 120.222640) differ by about 400 m; needs someone looking at the map or door. Not in any batch. Next: map or on-site check.
- **Pins that could not be fixed (seed-734, 640, 649, 681, 583, 601, 835, 842)**: STATUS: NEEDS HUMAN (confidence Low). None is in an applied pin batch (649 and 583 only have Chinese-name fills staged). Pins need a map check. Next: per-gym map check.
- **No Amap listing found: Hangzhou 725, 731, 733; Beijing 641, 643, 660, 662, 670, 675, 688; Shanghai 21 gyms; Chongqing 791, 795, 818, 834, 836, 837, 841; Shenzhen 17 gyms**: STATUS: OPEN (confidence Low). Absence from a capped Amap search is not closure, and no public gym-controlled source is reachable without RedNote/WeChat. Left unknown, nothing retired. Next: signed-in own-account checks per brand.
- **seed-499 and seed-510, Shenzhen**: STATUS: OPEN (confidence Medium that they are one venue). Same address (Universiade Center Gate 26) and a single Amap listing, 征岩攀岩馆(大运店); seed-510's pin was fixed (cn-pins-2, applied 2026-11-06), seed-499 has no batch. Retiring or merging is an owner decision. Next: owner approves seed-499 as a duplicate, or someone finds a second gym there.
- **Children-only by name (Shanghai 554, 586, 588; Chongqing 817, 821, 828, 831, 838, 839; Shenzhen 507, 515, 518, 519, 525, 529)**: STATUS: NEEDS HUMAN (confidence Medium that adult access is unstated). Amap names say 儿童攀岩馆 for the Panxing/Pandengxia venues; nothing public states adult access. Owner policy call (keep or retire kids-only venues). Next: owner decision.
- **RedNote open/closed checks for gyms with a normal Amap listing**: STATUS: OPEN (confidence n/a). Not doable without a signed-in session. Next: a later signed-in pass.
- **Region codes missing in js/modules/regions.js (CN)**: STATUS: ALREADY RESOLVED (confidence High). All 16 (Dali, Lijiang, Foshan, Dongguan, Zhongshan, Wenzhou, Sanya, Taiyuan, Hohhot, Wuxi, Changzhou, Lanzhou, Xining, Yinchuan, Urumqi, Lhasa) are in `js/modules/regions.js` (grep, 2026-11-11). Next: none.
- **Zhuhai 香蕉攀岩 旺角荟店 (B0M2ZL3WCE)**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence High); it is already staged in 2026-11-08-cn-zhuhai (not yet applied; in the apply queue). The operator's site lists 香蕉攀岩 香洲旺角荟店, 珠海香洲区敬业路88号旺角荟A202, active, 10:00-23:00, 1,000 m2, bouldering, data updated 2026-09-27, coordinate 22.270791, 113.525553 (datum unstated); the staged record uses the Amap coordinate, not compared here. Sources: https://www.bananaclimbing.com/assets/index-B-4QZzpK.js (checked 2026-11-11). Next: owner runs the apply.
- **Zhuhai 蓝天攀岩 (B0FFGBAJ4K, B0I3KS9MBJ)**: STATUS: OPEN (confidence Low). The section review.json already defers both (youth-training brand, one store under renovation 2026-11-01); nothing public found showing adult bouldering. Next: own account or phone.
- **Jinan 515 世茂芯环店**: STATUS: OPEN (confidence Low). Deferred in section 2026-11-01-cn-jinan (open, bouldering not stated); nothing public found. Next: own-account notes.
- **Changsha 九二攀岩馆(贺龙店) B0FFGZP0SQ**: STATUS: OPEN (confidence Low). ChatGPT's only source (an Amap page with a 2022 review) could not be re-fetched; repo evidence is youth training and private coaching, last post 2026-03-01. Do not add. Next: phone to ask about walk-in bouldering, or decline.
