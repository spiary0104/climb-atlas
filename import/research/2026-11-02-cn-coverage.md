# China coverage map, 2026-11-02 (Amap only, read-only)

Method: for each mainland province-level region, Amap keyword search (`攀岩`, `抱石`, 2-3 pages) in the capital and the cities most likely to have climbing gyms, in the owner's signed-in tab (strictly sequential reads, each page read twice; pages that disagree three times are flagged UNSTABLE: names stay usable, coordinates are re-read from listing detail before any use). Counts are Amap listings whose name looks like a climbing venue (name filter excludes shoe shops, kids' play, ice climbing; **raw counts are upper bounds**: some hits are via ferrata, outdoor crags, kids' gyms or the same gym listed twice). "Bouldeer" = approved CN gyms in production on 2026-11-02 (377). "Near a pin" = within 400 m of an existing Bouldeer pin (understated where existing pins are known to be wrong; see the pin batches). No listing was treated as a gym without a primary source (see "Not yet" below).
Climbing-venue closure flags on Amap: 0 of the hits were flagged closed except a few 暂停营业/装修中 names noted in the manual checks.

| Region | City searched | Amap listings | Near a Bouldeer pin | Bouldeer gyms | Status / priority |
|---|---|---|---|---|---|
| Beijing | Beijing | 86 | 12 | 55 | pins done (PR #89); gap large -> continue after pins |
| Tianjin | Tianjin | 19 | 2 | 15 | pins audit (pins-3); gap small (about 4) |
| Hebei | Shijiazhuang (+1 in Baoding) | 7 + 1 | 0 | 0 | medium; mostly mall gyms (运动茂, 丘山, 溜溜猴, 厘米) |
| Shanxi | Taiyuan | 5 | 0 | 0 | low-medium (新途运动, 昱攀, 山攀) |
| Inner Mongolia | Hohhot | 3 | 0 | 0 | low (蒙攀, 海日 paused) |
| Liaoning | Shenyang 15, Dalian 6 | 21 | 0 | 0 | medium-high (Dalian is a traveller city) |
| Jilin | Changchun | 5 | 0 | 0 | low |
| Heilongjiang | Harbin | 6 | 0 | 0 | low-medium (Harbin travellers) |
| Shanghai | Shanghai | 91 | 23 | 78 | pins done; gap about 13 |
| Jiangsu | Nanjing 30 (3 are museum hits), Suzhou area 38, Wuxi 8, Changzhou 11 | 87 | 4 | 34 (Nanjing 14, Suzhou 20) | pins audit for Nanjing + Suzhou, then Wuxi/Changzhou (0 in Bouldeer) |
| Zhejiang | Hangzhou 48, Ningbo 14, Wenzhou 7 | 69 | 8 | 21 | Hangzhou pins done; Ningbo and Wenzhou: 0 in Bouldeer, high |
| Anhui | Hefei | 10 | 0 | 0 | medium |
| Fujian | Xiamen 15, Fuzhou 7 (Longyan: 2 non-gym hits) | 22 | 0 | 0 | **high** (Xiamen traveller city, brand chains 龙景/视攀/山海) |
| Jiangxi | Nanchang | 5 | 0 | 0 | low-medium |
| Shandong | Jinan 13, Qingdao 14 (Yantai: none found) | 27 | 0 | 0 | high (Qingdao, Jinan) |
| Henan | Zhengzhou | 12 | 0 | 0 | medium-high |
| Hubei | Wuhan 23 (+1 Enshi) | 24 | 3 | 18 | pins audit; gap about 8 |
| Hunan | Changsha | 22 | 1 | 3 | **high** (22 vs 3) |
| Guangdong | Guangzhou 38, Shenzhen 58, Foshan 13, Dongguan 7, Zhongshan 10, Zhuhai 6, Huizhou 2 | 134 | 21 | 68 (GZ 20, SZ 47, Zhuhai 1) | GZ/SZ pins done; Foshan, Dongguan, Zhongshan, Zhuhai, Huizhou: high (GBA) |
| Guangxi | Nanning 16, Guilin/Yangshuo 29 (most are outdoor crags, via ferrata and outfitters) | 45 | 0 | 0 | Nanning medium; Yangshuo = outdoor, out of scope for gym section |
| Hainan | Haikou 3, Sanya 3 | 6 | 0 | 0 | medium (Sanya is a traveller city, 1-2 gyms only) |
| Chongqing | Chongqing | 42 | 5 | 36 | pins done; gap about 6 |
| Sichuan | Chengdu | 42 | 9 | 30 | done earlier (PR #84) |
| Guizhou | Guiyang | 12 | 0 | 0 | medium |
| Yunnan | Kunming 12, Dali 5, Lijiang 2 | 19 | 0 | 0 | **high** (Kunming/Dali/Lijiang are traveller cities) |
| Tibet | Lhasa | 0 | 0 | 0 | no climbing listings found |
| Shaanxi | Xi'an | 25 | 5 | 19 | pins audit; gap about 8 |
| Gansu | Lanzhou | 6 | 0 | 0 | low-medium |
| Qinghai | Xining | 4 | 0 | 0 | low |
| Ningxia | Yinchuan | 5 | 0 | 0 | low |
| Xinjiang | Urumqi | 6 | 0 | 0 | low-medium |

Not searched (outside the brief): Hong Kong, Macau, Taiwan (not mainland); second-tier cities such as Nantong, Xuzhou, Yantai (zero hits), Luoyang, Dongying, Weihai, Taizhou, Jiaxing, Shaoxing, Jinhua, Quanzhou, Zhuhai-adjacent Zhongshan was searched. These need a later pass.

## Ranked order for new-gym sections (missing gyms x traveller relevance x source availability)
Source availability = whether the chain/gym has its own RedNote account listing branches (primary) and Amap gives an entrance or listing coordinate.
1. Changsha (22 vs 3; Banana HQ city, brands 大曦, 向上攀, 湘攀, 香蕉)
2. Xiamen (15 vs 0; chains 龙景, 视攀, 山海, 攀猩)
3. Kunming + Dali + Lijiang (19 vs 0; traveller route)
4. Qingdao + Jinan (27 vs 0)
5. Foshan / Dongguan / Zhuhai / Zhongshan (GBA, 38 vs 1)
6. Ningbo + Wenzhou (21 vs 0)
7. Nanjing and Suzhou gap (after pin audit), Wuxi, Changzhou
8. Wuhan, Xi'an, Tianjin gap (small after pin audit)
9. Shenyang + Dalian, Zhengzhou, Hefei, Fuzhou, Nanning, Guiyang, Sanya + Haikou
10. Harbin, Changchun, Shijiazhuang, Taiyuan, Hohhot, Nanchang, Lanzhou, Xining, Yinchuan, Urumqi
11. Beijing, Shanghai, Hangzhou, Guangzhou, Shenzhen, Chongqing, Chengdu: remaining gap in later passes (already have sections or large coverage)

## Not yet: why most regions are not "covered"
A listing is only a candidate. The importer needs a primary source (official site, official social account or a chain store list) that the gym exists, is open and offers bouldering. In China that source is almost always the gym's own RedNote account, read one account per gym (about 20 s apart, about 60 page loads per run). Official sites with store lists were checked and do not exist for the main chain (bananaclimbing.com shows only a title). Map-only venues therefore go to `import/research/MANUAL-CHECKS-china-2026-11-01.md` with their Amap id.

Listings that are not near an existing pin, per city, with Amap ids: `import/research/2026-11-02-cn-coverage-listings.md`.

## Where this run stopped and how to resume
- Browser: the Amap tab stopped answering during listing-detail reads (CDP `Runtime.evaluate` timed out after 115 s, "page may be blocked by a native dialog", twice in a row). Per the run rules, all browser work stopped. Owner: check the tab for a dialog or verification prompt.
- Resume 1 (Amap detail, no RedNote): `node detail.js <ids>` for the 12 Xi'an and 11 Nanjing gyms listed as `hold (detail read pending)` in `2026-11-02-cn-pins/verification.md`; then regenerate pins-3 (add them) and re-run validate/plan/dry-run.
- Resume 2 (new gyms, RedNote): sections Changsha, Xiamen, Kunming/Dali/Lijiang, Qingdao/Jinan, GBA cities, Ningbo/Wenzhou in the order above. No RedNote page was loaded in this run; no new-gym section was created beyond the existing Guangzhou and Hangzhou.

## Update after the Amap throttle (second run)
- Amap showed its anti-abuse dialog ("哎呀，有异常情况，请稍后再试"); no Amap request was made afterwards. Next Amap session: wait/clear the dialog, then read details for Xi'an (12) and Nanjing (11) gyms (pins-3 holds), and details for the new-gym listings below.
- RedNote this pass: about 30 page loads, no verification wall. New section `2026-11-01-cn-jinan` (2 accept, 1 defer). Everything else with primary evidence is in `MANUAL-CHECKS-china-2026-11-01.md` (second-pass section), including the **CN region codes missing in the app** (Dali, Lijiang, Foshan, Dongguan, Zhongshan, Wenzhou, Sanya, Taiyuan, ...): adding those codes to `js/modules/regions.js` unblocks Dali (行山 has primary bouldering evidence) and Wenzhou.
- Still to do in order: Changsha (needs Amap detail coordinates; own accounts for 大曦/向上攀/湘攀/TBW not yet found), Xiamen, Kunming, Qingdao, Foshan/Dongguan/Zhongshan, Ningbo, Wenzhou.
