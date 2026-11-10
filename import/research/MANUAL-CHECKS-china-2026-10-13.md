# China 2026-10-13: pin-fix batch and STATUS note (owner)

## Batch `2026-10-13-cn-pin-fixes` (staged, not applied)
35 location updates (Shanghai 17, Beijing 11, Chengdu 7), pin = the ENTRANCE coordinate of the gym's own Amap listing, GCJ-02 -> WGS-84
(iterated forward transform, checked against Tiananmen in the Kunming notes). Each record names the Amap place id, the converted
coordinate and the OSM landmark used as a cross-check where OSM has one (OSM mostly lacks these venues; where it has none, the exact address
match is the evidence). `plan`: update 35, probable-duplicate 0, invalid 0; `import --dry-run`: PREFLIGHT PASSED (partial coverage, no
service-role key); tests 387 pass / 0 fail.

**Provenance caveat.** The Chrome / OpenCLI bridge was not connected in this session (Chrome not running), so no Amap page was read live.
All entrance coordinates come from the previous China worker's saved Amap readings of 2026-10-12 (each page read twice, identical
answers; the entrance coordinate was constant across all that worker's sessions). No listing was re-read today.

Name matches confirmed by address (not only brand) and included: seed-566 Yanjie (Bldg 6 Champion Plaza, 5101 Beizhai Rd), seed-573 Kray
(Bldg 7, 91 Yimei Rd), seed-540 Climbing Factory (855 West Changjiang Rd, Boxiuhui E), seed-599 Shanyi (228 Jiasong South Rd), seed-607
Banana ICD (577 Dongda Rd L201), seed-644 Mellow (Bldg 7, 506 Innovation Park), seed-612 WEClimb (899 Tianjin Rd West Section).
seed-536 Yanwu Kongjian is included because the Amap listing (Roaring Climbing Gym) has the identical address (128 Huayuan Rd, Block 1 A);
the brand name differs, so the gym may have been renamed: look at it when you check.

## Left out (needs a live Amap read or your decision)
- Amap listing has NO entrance coordinate (pin only, about 100 m jitter): Shanghai seed-549 GOAT, seed-544 DOME Xuhui, seed-555 LAPUTA, seed-571 GYM
  Greenland, seed-535 Banana Jinhongqiao, seed-589 1778 Sanlin, seed-543 Yanwu Lingang Wanda (8.7 km), seed-583 Dengtuo Chunshen (4.2 km),
  seed-550 UROCK (2.5 km); Beijing seed-663 CAMP4 Jiuxianqiao, seed-656 Rock Time Huilongguan, seed-673 Wanyan Fangtianxia (3.3 km).
  The old pins are wrong by those distances: drop a pin by hand or look for an entrance coordinate in a live read.
- seed-564 High Five (Jing'an): the record's own address (L180, 643 Yonghe East Rd) is the Amap listing of a DIFFERENT gym (酸爽攀岩, 804 m from
  the pin); the "High Five" listing 攀竞体育 (Jing'an) is 5.7 km away and has no entrance. Not changed.
- seed-649 Rock Time Guanzhuang: brand+branch match 岩时攀岩(管庄店) (管庄南街3号, entrance 1.7 km away) but the street/number differ from the record
  ("1 Guanzhuang Rd, Xinguanzhuang Science Park 6-1-112"). Not confirmed.
- seed-711 Banana Zhujiang Star Ring (Changsha, 3.3 km): its Amap listing is not in the saved readings; needs a live read.
- seed-712, seed-605: see below.

## STATUS: closures (Amap "暂停营业" = business suspended; nothing retired by this batch)
Retire candidates for the owner: seed-605 Jibi Storm (Bailian Xijiao; Amap 极壁风暴攀岩馆(长宁店)(暂停营业), 仙霞西路88号), seed-638 Rock Time
Dawanglu (岩时攀岩馆(暂停营业), 西大望路27号), seed-684 Zhongpan Alps (中攀Alps(活力东方店)(暂停营业)), seed-668 Yaoyan Shahe (耀岩攀岩(沙河店)(暂停营业)),
seed-713 Banana CapitaLand One, Changsha (suspended; visitor note 2026-06-16), seed-628 Elephant and seed-617 Panda CapitaLand (Chengdu,
a 2026-09 gym map says closed / moved). Not verified again today (no browser).

## Part 2 (Guangzhou/Shenzhen, Hangzhou/Nanjing, Wuhan/Xi'an): NOT started
Blocker: the OpenCLI bridge reports "Browser Bridge extension not connected" and no Chrome process is running, so the shared tab
602DAC5C... is gone. Per the brief, no tab was opened and nothing was bound.

## Follow-up 2026-11-11 (public-source verification)
Method: checked by Claude (AI) on public sources; ChatGPT leads re-verified (Banana Climbing's own site data was read directly from its public JS bundle, https://www.bananaclimbing.com/assets/index-B-4QZzpK.js, since the page is client-rendered); nothing written to production. Amap and RedNote were not used (login/captcha; Amap place pages return an empty map shell without a browser session).
- **Banana CapitaLand One, Changsha (seed-713)**: STATUS: RESOLVED: keep out / retire through the pipeline (owner approval) (confidence High). The operator's own site data lists store `cs-capitaland` (香蕉攀岩（凯德壹中心店）) with `isClosed: true`, while its other Changsha stores (珠江星环, 悦方ID MALL) are listed as active; this agrees with the Amap 暂停营业 mark and the 2026-06-16 visitor note above. The flag carries no closure date. The pin fix for seed-713 was already applied 2026-11-06 (2026-11-02-cn-pins-3); the retirement itself is not in any batch. Sources: https://www.bananaclimbing.com/assets/index-B-4QZzpK.js (checked 2026-11-11). Next: owner approves retirement, then stage it as a pipeline retire record.
- **Climbing Panda CapitaLand (seed-617), Chengdu**: STATUS: ALREADY RESOLVED (confidence High). Official closure note (closed 2026-01-14) in `import/research/2026-11-01-chengdu/verification.md`; the retirement is in batch 2026-11-01-chengdu, applied 2026-11-06 (commit 7dc2bc5, manifest present). Sources: repo files above (checked 2026-11-11). Next: none.
- **Elephant (seed-628), Chengdu**: STATUS: OPEN (confidence Low). Nothing new found; the 2026-11-01 Chengdu notes say no Amap listing, brand account silent since 2025-04 and an unread 2026-06-28 note; not in any batch. No public gym-controlled source reachable without RedNote/WeChat. Sources: `import/research/2026-11-01-chengdu/verification.md` (checked 2026-11-11). Next: owner (or someone with WeChat) reads the brand's own account or phones the gym.
- **Jibi Storm Bailian Xijiao (seed-605), Shanghai**: STATUS: NEEDS HUMAN (confidence Low). Only evidence is the Amap 暂停营业 listing (仙霞西路88号) from 2026-10-12; the 2026-11-02 audit found no Amap listing, it is in no batch, and a web search found nothing. Directory/Amap suspension alone is not closure. Sources: `import/research/2026-11-02-cn-pins/verification.md` (checked 2026-11-11). Next: check the brand's own account or phone the mall; retire only on an official closure.
- **Banana Zhujiang Star Ring, Changsha (seed-711)**: STATUS: ALREADY RESOLVED (confidence High for the 3.3 km error; Medium for the exact entrance). The pin was moved to the Amap listing 香蕉攀岩(珠江星环店) B0J01U438Y (3,454 m shift) in 2026-11-02-cn-pins-3, applied 2026-11-06. The operator's own site confirms the store is active (福元西路109号珠江星环购物中心L3层25A, 10:00-22:00, bouldering, lead, autobelay), and publishes a coordinate (28.252427, 112.995485; datum not stated). The residual listing-vs-entrance jitter (about 100 m) was not hand-checked. Sources: https://www.bananaclimbing.com/assets/index-B-4QZzpK.js (checked 2026-11-11). Next: none, unless the owner wants a visual entrance check.
- **Shanghai pins left out (seed-549, 544, 555, 571, 535, 589, 543, 550, 583)**: STATUS: ALREADY RESOLVED for 549, 544, 555, 571, 535, 589, 543, 550 (confidence Medium); NEEDS HUMAN for 583. The eight were moved to their Amap listing coordinates in 2026-11-02-cn-pins-2 (applied 2026-11-06, commit 7dc2bc5; shifts 932 to 8,789 m). Residual: the listing point, not a verified entrance. seed-583 Dengtuo (登拓攀岩馆 B0MABMS7OL, 春申路1899号) stayed MANUAL: matched by brand and area only, 4,233 m away; a 2026-11-09 Chinese-name fill is staged but no pin fix. Sources: `import/research/2026-11-02-cn-pins/verification.md` (checked 2026-11-11). Next: map check for seed-583's real address; optional entrance check for the rest.
- **Beijing pins left out (seed-663, 656, 673)**: STATUS: ALREADY RESOLVED (confidence Medium). Moved to their Amap listing coordinates in 2026-11-02-cn-pins (applied 2026-11-06; shifts 1,425, 856, 3,391 m), addresses matched in the verification table. Residual: listing point rather than verified entrance. Sources: `import/research/2026-11-02-cn-pins/verification.md` (checked 2026-11-11). Next: none.
- **Yanwu Kongjian (seed-536), Shanghai**: STATUS: OPEN (confidence Low). The pin fix (2026-10-13-cn-pin-fixes) was applied 2026-11-06, but whether the gym was renamed "Roaring Climbing Gym" is unanswered: no public source reachable here mentions either name at 128 Huayuan Rd. Sources: none found (checked 2026-11-11). Next: owner checks the gym's own account or Amap listing for a rename; do not rename on an address match alone.
- **High Five (seed-564), Shanghai Jing'an vs 酸爽攀岩**: STATUS: NEEDS HUMAN (confidence Low). Same item as in the 2026-11-01 file; not in any batch; evidence is Amap-only. Sources: none (checked 2026-11-11). Next: see MANUAL-CHECKS-china-2026-11-01.md follow-up.
