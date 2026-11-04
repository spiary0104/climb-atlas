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
