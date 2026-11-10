# China manual checks, 2026-11-06 (Amap + RedNote, read-only)

Sections created this run (reconciled, reviewed, NOT staged; China new-gym staging waits for PR #91 + the production migration): `2026-11-06-cn-dali` (1), `-cn-wenzhou` (2), `-cn-changsha` (1), `-cn-xiamen` (4), `-cn-kunming` (2), `-cn-qingdao` (1). All 11 candidates were accepted in their draft `review.json` and pass a dry `stage` into a temporary directory (nothing written under `import/batches/`).

## Candidates found but not built (no primary bouldering evidence or no coordinate)
- Dali 向上攀岩馆 (龙泉店, Amap B0H1CA3PGO) and 向上攀岩竞技馆 (B0L3MRN9FS): own account 向上攀岩馆 (251 followers) posted 龙泉店 closure-for-upgrade (2026-10-24) and a farewell note (2026-10-28), then a renovation note (2026-11-06). Treat as closed or relocating; notes not read in full. The Mile (弥勒) branch of 行山攀岩 is outside the Dali section.
- Wenzhou 芭乐攀岩鹿城馆 (Amap B0M3VZ4XQD, 双屿街道营楼路): presale 2026-10-10 to 2026-11-18, not open yet. Re-check after 2026-11-18. Other Wenzhou brands (七喜运动, RockFUN乐岩 x2, 乐清银泰, 大黄蜂): no own account searched.
- Changsha CAMP4岩肆 西湖公园 (Amap B0LKV163SV): brand account (Beijing-based, 350 followers) lists the Changsha store with 攀岩·精酿·装备; bouldering not stated, no coordinate read. 大曦攀岩 (4 listings), 湘攀 (银盆岭万达), 向上攀 (星沙, 宁乡): no own account found by name search. 九二攀岩馆: youth only (earlier pass).
- Xiamen: 龙景攀岩 other stores (阿罗海 B0IKYKBDDY, 世茂 B0FFIP16X2, COCO Park B0JDKZ7I9C, 波特曼 B0K1PHCCHB): brand account 龙景攀岩 (1.3K) says the flagship is mainly difficulty (lead) and gives no per-store bouldering. 视攀 星光荟馆 is "under construction". 山海攀岩 x2, 攀猩 (adult SM and 爱琴海 stores), 星野, 大力水手, 不吃饭: not searched.
- Kunming: 今日攀岩 (3 stores), 小熊攀岩, TNS, 炽野之间, 攀羊: name search returned only influencers; not searched further.
- Qingdao: 火舞 (3 listings), 岩舞者, 菁英, 猫王, 在野, 岩趣, 中庭: not searched. Also Moonwalk抱石馆 and Bhub Bouldering appeared in the user search (city not checked).
- Foshan/Shunde/Zhongshan HELLO MAX攀岩 (Amap B0K26PV0KP etc.): brand account (683 followers) posts route resets for "B/C zones" to 2026-10-15; the pinned guide note explains bouldering vs lead in general but does not say which stores have bouldering. Not built.
- Ningbo ROCK PLUS: user search returned no gym account. Wuxi HiRock嗨岩 (3 stores): owner account "HiRock嗨岩攀岩刚哥" (2.1K) is lead/youth focused (18 m wall, kids classes); bouldering not stated.
- Not researched at all this run: Dongguan, Ningbo (beyond the one search), Changzhou, Sanya, Taiyuan, Hohhot, Lanzhou, Xining, Yinchuan, Urumqi, Lijiang, Lhasa.

## Maintenance (pins-4) still MANUAL
See Part 4 of `2026-11-02-cn-pins/verification.md`: seed-775 (Loong MixC road mismatch), 770, 781/790, 782, 776, 799, 803, 811, 814, 705, 708, 709. After this run's Amap results turned UNSTABLE nothing more was attempted.

## Blockers this run
- Amap: about 80 requests used. Search answers turned UNSTABLE (3 reads disagree) in the Suzhou and Xiamen brand searches; listing-detail reads stayed stable and were used for every coordinate.
- RedNote: about 46 page loads. After the Sanya search the OpenCLI session `xhs` answered `unknown command 'xhs'` twice in a row (once in `rnusers.js`, once in a bare `location.hostname` eval); browser work was stopped per the run rules. No captcha or login wall was seen before that.
