# China city research, 2026-11-01: status and manual checks

## Status: BLOCKED before any Amap/RedNote read
No research section was created and no candidate was gathered (none invented). The browser helper scripts all
failed twice (`amapq.js`, then `detail.js`) with: `Target tab 4E259711862074A0531E29921EEBFC2C is not part of the current browser session.
The Browser Bridge session may have restarted`. Per the brief (a command failing twice means stop browser work, never rebind or open tabs),
browser work stopped. To resume: the owner re-binds OpenCLI session "xhs" to the signed-in Chrome tab, then rerun
Guangzhou 440100, Hangzhou 330100, Shenzhen 440300, Chongqing 500000 (keywords 攀岩, 攀岩馆, 抱石, 3 pages each, plus brands
香蕉攀岩, 岩时, 奥攀, 攀岩工厂, 熊猫攀岩), then Shanghai/Beijing counts.

## Existing Bouldeer gyms: issues visible from live data alone (read-only fetchLive, 2026-11-01; NOT externally verified)
Live counts: Guangzhou 20, Hangzhou 21, Shenzhen 47, Chongqing 36 (matches the brief for the four cities' state codes).

Several gyms share an identical pin (a fallback or copied coordinate, so at least one is wrong):
- 22.5427932,114.0628443: seed-497 Lightning Climbing Gym + seed-514 Nedo Yaugaa Climbing Gym
- 22.6900903,114.2094974: seed-499 Longgang Universiade Center + seed-510 Zhengyan (Dayun) + seed-522 Yijiu (Honglifang Youth Center)
- 22.5360142,113.9256222: seed-500 Pulan Sports (Shenzhen) + seed-531 Climbing Orangutan (Shuiwan)
- 30.2457731,120.0229703: seed-728 XBOX Family Sports Center + seed-730 Happy Climbing (Yuhang)
- 29.6949,106.6182: seed-821 Pandengxia Kids Climbing (Yubei) + seed-825 Kuji Climbing (Tianjiangli)

Pins with only 3 decimals (about 100 m, i.e. approximate, same pattern as the Chengdu pins fixed in PR #84):
- Shenzhen: seed-486 to seed-493 (all Banana branches)
- Hangzhou: seed-714, 715, 716 (Banana branches)
- Guangzhou: seed-735 (Banana Grantral)
- Chongqing: seed-791 to 795, 816, 833, 834, 835, 837, 838, 840 to 844

Names that suggest children-only venues (Bouldeer targets adult day visitors; verify adult access or retire):
seed-515, 518, 519, 525, 529 (Shenzhen); seed-816, 817, 821, 828, 831, 838, 839 (Pandengxia Kids Climbing, Chongqing).

None of this was checked against Amap or an official account (blocked). Open/closed status of every existing gym is unknown to this pass.

## Low-confidence candidates
None (no candidates gathered).

## Shanghai / Beijing gap assessment
Not done: needs the Amap listing counts (blocked). Bouldeer now: Shanghai 78, Beijing 55. PR #83 research and PR #84 pin fixes not re-proposed.
