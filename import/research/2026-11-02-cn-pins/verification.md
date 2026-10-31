# China pin and status verification, 2026-11-02 (read-only; nothing written to production)
Sources: Amap search + listing detail (`/place/<POI id>`), read in the owner's signed-in tab 2026-10-31/11-01 (detail pages read twice, identical;
GCJ-02 -> WGS-84; entrance coordinate where Amap has one, else the listing coordinate); RedNote read-only 2026-11-01; Bouldeer live data
(fetchLive, 2026-11-01). Matching is by brand/name AND address (street and number or mall), never by distance alone.
Distances: live pin vs the coordinate used. Batch: `import/batches/2026-11-02-cn-pins` (location updates only where the pin is more than 150 m off and the match is certain).
"Amap: listed" = a current listing not flagged closed (weak evidence of being open; no official RedNote check unless stated).

## Hangzhou (21 gyms; none was in PR #84)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-714 | Banana Raffles City | Amap: listed (香蕉攀岩(来福士店) B0MRJU6QBO, 来福士广场4楼; Bouldeer says T2-11F, same mall) | 2544 m (listing) | pin update |
| seed-715 | Banana Xixi Tianjie | Amap: listed (香蕉攀岩(西溪天街店) B0MG1ARE8L, 余杭塘路1001号龙湖西溪天街 L4) | 6283 m (listing) | pin update |
| seed-716 | Banana Impression City Olympic | Amap: listed (香蕉攀岩(奥体印象城店) B0MD3HFDQ7, 汇德隆印象城 L6) | 6771 m (listing) | pin update |
| seed-717 | Wanpan Binjiang | Amap: listed (顽攀攀岩馆(滨江店) B0JU478ML3, 江晖村路376号美苑创意大厦, same address) | 182 m (entrance) | pin update |
| seed-718 | Wanpan West Lake Culture & Sports Center | Amap: listed (顽攀攀岩馆西湖区文体中心馆 B0H25KLQXU, 晴川街217号, same address) | 8242 m (listing) | pin update |
| seed-719 | Menotou Adult Bouldering (Xixi Intime) | Amap: listed (闷头攀岩训练馆·成人攀岩教室(西溪银泰店) B0JRHKIG7G, 大双龙街588号 西溪银泰城东区 F3 3F037, same) | 891 m (listing) | pin update |
| seed-720 | Huandao Lixing Plaza | Amap: listed (环岛攀岩(利星名品广场店) B0KAUYFSOB, 中山南路77号) | 63 m, ok | none |
| seed-721 | Zheti Hangpan | Amap: listed (浙体·杭攀攀岩馆 B0KGRONO8G, 教工路49号浙江体育职业技术学院内, same) | 595 m (entrance) | pin update |
| seed-722 | Luna Hualian Xingguang Ave Ph.2 | Amap: listed (噜呐攀岩(华联·星光大道2期店) B0LRRHK2XX, 星光大道二期4F, same) | 477 m (entrance) | pin update |
| seed-723 | Go Link Lianheli | Amap: listed (Go Link攀岩馆(莲荷里店) B0K1USDIXI, 飞虹路3号大莲花 LG/B1, same) but entrance and listing coordinate disagree by about 400 m | 561 m (entrance 30.230826,120.226944) / 930 m (listing 30.232196,120.222640) | MANUAL (which one is the door) |
| seed-724 | Swing | Amap: listed (摇摆攀岩 B0KBYUA8IZ, 杭行荟1幢4层, same) | 5080 m (listing) | pin update |
| seed-725 | Li-Ning Sports Park | no climbing listing for the park on Amap (李宁体育园 shows pool, courts, trampoline, no wall); status unknown | - | MANUAL |
| seed-726 | Xiangshan | Amap: listed (向山攀岩馆 B0KRUH2LNB, 南环路1672号网创意园区106, same) | 4352 m (entrance) | pin update |
| seed-727 | CLIFFS Oriental Times | Amap: listed (CLIFFS颗粒攀岩 B0JU3RDY8X, 东方时代中心三楼) | 76 m, ok | none |
| seed-728 | XBOX Family Sports Center | Amap: listed (XBOX家庭运动中心(西溪印象城B座店) B0I6RKRRI1, 五常大道1号 B座 L3, same); a family sports centre, climbing offer not re-confirmed | 1803 m (listing); it shared one pin with seed-730 | pin update (also resolves the shared pin) |
| seed-729 | Climbing Orangutan (Kaiyuan Plaza) | Amap: **暂停营业** (temporarily closed), 攀猩攀岩馆(加州阳光·开元广场店) B0K3PC4ZVW, 金城路333号, same; RedNote 2026-09-21/22: a gym "攀岩梦工厂开元店" opened (not confirmed to be the same unit) | 214 m (entrance) | pin update; status MANUAL (not retired: only a pause) |
| seed-730 | Happy Climbing Yuhang | Amap: listed (开心攀岩(五常店) B0L14C2CWC, 五常大道181号; Bouldeer has only "Wuchang Ave / Guihua Rd"; the brand has one Wuchang branch) | 347 m (entrance) | pin update (match: brand + road, no address number in Bouldeer) |
| seed-731 | Dpump Zhongda Intime City | no Amap listing at Zhongda Intime; the brand's only listing is Gongshu Baolong (B0MGG743ZI, 春蓝东路288号, in test opening 2026-04); no official account found | - | MANUAL |
| seed-732 | Menotou Gemdale Plaza | Amap: listed (闷头攀岩训练馆·攀岩教室(金地店) B0IAF59A2X, 池华街与古墩路交叉口金地广场四层, same) | 1538 m (listing) | pin update |
| seed-733 | Happy Climbing Qixianjun (Liangzhu) | no Amap listing; RedNote user notes 2026-06-13 and 2026-07-12 visit the Qixianjun / Liangzhu branch (user reports) | no coordinate | MANUAL (needs a coordinate) |
| seed-734 | Zhejiang Construction Vocational College Training Field | Amap: 体能训练场 B0J1UR8P86 (弘慧路, Xiaoshan campus); climbing offer not confirmed; entrance and listing differ by 250 m | 3873 m (entrance) / 3627 m (listing) | MANUAL |

Summary: 21 audited; 14 pin updates; 2 ok (720, 727); 5 manual (723, 725, 731, 733, 734; status caveats on 729 and 730); 0 retirements.

## Guangzhou (20 gyms; none was in PR #84)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-735 | Banana Grantral Centre | Bouldeer has no address and a 3-decimal pin; Amap 香蕉攀岩(君超中心) B0MU35PAYH (黄埔大道中652号君超中心8楼) is probably it, but the match is by transliterated name only | 1946 m (listing) | MANUAL |
| seed-736 | BoulderDash Sijitiandi | Amap: listed (BoulderDash抱石突袭攀岩馆(四季天地店) B0LRYMUTWI, 赤岗北路118号四季天地南座F4, same) | 79 m, ok | none |
| seed-737 | Super Extreme Liuyuansu | Amap: listed (超极限攀岩馆(六元素·体验天地) B0H3K5YV4W, 新港东路1088号, same) | 2357 m (listing) | pin update |
| seed-738 | Pulan Sports Panyu | Amap: listed (普岚体育(番禺店) B0L6YRO1EG, 和平路1号7号, same) | 610 m (listing) | pin update |
| seed-739 | Super Extreme Aoti | Amap: listed (超极限攀岩馆(优托邦奥体店) B0FFG4GQ8Y, 奥体南路12号, same) | 194 m (entrance) | pin update |
| seed-740 | Super Extreme Yonglong | Amap: listed (超极限攀岩馆(永隆花园东) B0FFH5G1NW, 长兴路13号, same) | 142 m, ok (within 150 m) | none |
| seed-741 | Mars Qiaonanhui | Amap: listed (火星攀岩馆桥南汇店 B0LR7RJDH9, 南城路181号桥南汇5栋215, same) | 1895 m (entrance) | pin update |
| seed-742 | Fun Wild | Amap: listed (趣野攀岩 B0FFG1MLXP, 沙太南路181号, same) | 323 m (entrance) | pin update |
| seed-743 | RockinClimbing Nansha | Amap: listed (RockinClimbing石间攀岩 B0K2NHUNCO, 板头九街) | 2934 m (entrance) | pin update |
| seed-744 | Feather Stone | Amap: listed (羽石攀岩馆 B0KAJR8SVG, 基盛万科里B区1014, same; a second "B区" listing on 5F exists) | 121 m, ok | none |
| seed-745 | Unfollow Haizhu Shixi | Amap: listed (Unfollow攀岩馆(海珠石溪店) B0FFLEJT7E, 新业路68号百汇天地C座, same) | 373 m (entrance) | pin update |
| seed-746 | Qingtian Caofangwei | Amap: listed (擎天攀岩(草芳围店) B0LR2954K6) | 13 m, ok | none |
| seed-747 | King Climbing Baiyun Ezhangtan | Amap: listed (王者攀岩(白云区鹅掌坦店) B0JGR589KY, 西槎路31号西城智汇park, same) | 1505 m (entrance) | pin update |
| seed-748 | Yantu | Amap: listed (岩图攀岩馆(抱石店) B0KKBADMHY, 迎宾大道173号中恒商业广场四期1栋A4一楼, same) | 1802 m (listing) | pin update |
| seed-749 | Flash | Amap: listed (闪攀岩馆 B0H2MU3CJT, 青竹街29号玫瑰园会所二楼204, same) | 392 m (listing) | pin update |
| seed-750 | Mars Liwan | Amap: listed (火星攀岩馆 B0JRYD5BC9, 西湾路150号悦汇城东门 1D08, same) | 675 m (entrance) | pin update (also the follow-up of section `2026-11-01-cn-guangzhou`) |
| seed-751 | Super Extreme SCUT East Campus | CLOSED: user notes 2026-04-19 (farewell) and 2026-07-02 ("contract ended, walls removed, not found on maps"); no SCUT listing on Amap (the 超极限 search shows 3 other Guangzhou branches); the brand's bio says 4 branches | - | retire (closed) |
| seed-752 | Shilin Feisheng Hui | Amap: listed (广州市狮霖攀岩俱乐部(飞晟汇店) B0G1C7RMUV, 石荔红二路10号124, same) | 254 m (listing) | pin update |
| seed-753 | King Climbing Club Liwan | Amap: listed (王者攀岩俱乐部 B0FFIBMOB4, 荔湾路97号 文楼4层B2, same) | 317 m (listing) | pin update |
| seed-754 | University Town Sports Center | Amap: listed (广州大学城体育中心攀岩场 B0FFF4UPNV, 大学城内环路218号, same); university wall, public access not confirmed | 1216 m (entrance) | pin update |

Summary: 20 audited; 14 pin updates; 4 ok (736, 740, 744, 746); 1 manual (735); 1 retired (751).
Amap listings not matching an existing gym (new-gym candidates): see section `import/research/2026-11-01-cn-guangzhou` and MANUAL-CHECKS-china-2026-11-01.md.

## Beijing (55 gyms; 11 skipped because PR #84 already fixed them: seed-637, 644, 645, 648, 650, 653, 661, 669, 678, 687, 689; 44 audited)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-638 | Rock Time Dawanglu | CLOSED 2026-08-08: official account 岩时攀岩 closure notice (note 6a6d33310000000005028c5f, 2026-07-31), farewell notes 2026-08/10; Amap 岩时攀岩馆(暂停营业) B0FFI0SZE7, 西大望路27号院74栋 = same address | 1894 m | retire (closed) |
| seed-639 | Climbing Favorite Changying | Amap: listed (攀岩最爱常营馆 B0FFLFPXRW, 首开畅心园东南门旁 = same) | 1209 m (entrance) | pin update |
| seed-640 | Aopan Sijiqing | Amap 奥攀攀岩(四季青校区) B0LB2CRGXQ (中关村军民融合产业园商业街C座); Bouldeer says "Sijiqing Innovation Center Building C", name of the complex differs | 6055 m | MANUAL |
| seed-641 | Haoshi Lantao Center | no Amap listing found (浩石 search shows Jiuxianqiao and Shunyi only) | - | MANUAL |
| seed-642 | Feline Galaxy SOHO | Amap: listed (飞猫攀岩 B0LBO76J7I, 银河SOHO C座F3 = same) | 232 m (entrance) | pin update |
| seed-643 | BE1ST Wukesong Wanda | the only listing at that address (复兴路69号五棵松万达广场3F) is 一工元运动空间·五棵松店 B0J3K7SQFK, a Nickelodeon-style family play venue; BE1ST = that brand is not confirmed | 1875 m (listing) | MANUAL (maybe a children's venue) |
| seed-646 | Red Pine Nut Sports Center | Amap: listed (红松果运动中心 B0FFHSRLWS, 永大路32号 = same; two more listings at the same address) | 1004 m (entrance) | pin update |
| seed-647 | Climb On Laiguangying | Amap: listed (Climb On Gym(来广营店COL) B0LAJRUGBR, 香宾路66号保利广场东区L6 = same) | 505 m (entrance) | pin update |
| seed-649 | Rock Time Guanzhuang | Amap 岩时攀岩(管庄店) B0H647JDIC, 管庄南街3号; Bouldeer address is "1 Guanzhuang Rd, Xinguanzhuang Science Park", different street name | 1692 m (entrance) | MANUAL |
| seed-651 | Pioneer Dongba Wanda | Amap: listed (北京先锋攀岩馆(朝阳东坝店) B0J2S6L107, 东坝万达广场6F = same) | 398 m (listing) | pin update |
| seed-652 | Fun Wild Longhu Beiyuan | Amap: listed (趣野攀岩(龙湖北苑天街店) B0J1XUPZWM, 北苑东路19号 5F = same) | 2732 m (listing) | pin update |
| seed-654 | Geometry | Amap: listed (几何攀岩俱乐部 B0FFIDCS6L, 新奥购物中心西B门 = same) | 182 m (entrance) | pin update |
| seed-655 | Aopan Wangfujing Outlets | Amap: listed (奥攀攀岩(王府井奥莱店) B0JKT5D2S2, 久敬庄路丙57号 = same) | 456 m (listing) | pin update |
| seed-656 | Rock Time Huilongguan | Amap: listed (岩时攀岩(回龙观店) B0M23ZD4MH, 文华东路57号乐动力体育中心B1 = same; few reviews) | 856 m (listing) | pin update |
| seed-657 | Aopan Xihongmen | Amap lists 魔王攀岩(西红门店) B0FFI90L0E at the same address (鸿坤广场 F1), another brand; no Aopan listing there | 485 m (listing) | MANUAL (rebrand or closed) |
| seed-658 | Climb On COG Shougang | Amap: listed (Climb On Gym(COG首钢店) B0KRNUFURH, 首钢园六工购物广场1层 = same) | 3649 m (listing) | pin update |
| seed-659 | Extreme Experience | Amap: listed (极度体验攀岩馆 B0FFJRIHNF, 远大路1号世纪金源购物中心西区L1 = same) | 278 m (listing) | pin update |
| seed-660 | Yueshi Huamao Tiandi | no Amap listing found | - | MANUAL |
| seed-662 | Planet Fitness Climbing | no Amap listing found | - | MANUAL |
| seed-663 | CAMP4 Jiuxianqiao Xinchenli | Amap: listed (CAMP4攀岩馆(酒仙桥新辰里店) B0J15PV7ZM, 酒仙桥路12号新辰里 F2-005 = same); it shared one pin with seed-666 | 1425 m (listing) | pin update |
| seed-664 | Jindianshi Ritan | Amap: listed (北京金点石日坛攀岩场 B0FFJ9XO8Q, 日坛公园内 = same) | 259 m (entrance) | pin update |
| seed-665 | Aopan World Park | Amap: listed (奥攀攀岩(世界公园店) B0IRD5OPF0, 葆台路188号7号馆 = same); seed-688 has the same pin | 1041 m (entrance) | pin update |
| seed-666 | Haoshi Jiulong Life Plaza | Amap: listed (浩石运动攀岩空间(久隆生活广场店) B0IUC76G3Q, 酒仙桥路39号 = same) | 202 m (listing) | pin update |
| seed-667 | Super Rabbit Sports Hub | Amap: listed (Super Rabbit运动汇 B0FFM8WIWZ, 沙河镇于辛庄村西 E区103 = same) | 2184 m (entrance) | pin update |
| seed-668 | Yaoyan Shahe | Amap: 耀岩攀岩(沙河店)(暂停营业) B0G32UH666, 1983创意产业园内 (suspended); its entrance is within 60 m of seed-667's new pin (same compound) | 644 m (entrance) | MANUAL (suspended; possibly the same compound as 667) |
| seed-670 | Sports Club Beiqijia | no Amap listing found | - | MANUAL |
| seed-671 | Haoshi Shunyi | Amap: listed (浩石运动攀岩空间(顺义店) B0J1VN7YEC, 安平北街3号; Bouldeer says 5 Anping St; the brand has one Shunyi branch) | 561 m (entrance) | pin update |
| seed-672 | Fun Wild Fangshan | Amap: listed (趣野攀岩馆(北京房山印象城) B0H0KUMJII, 广阳新路9号院1号楼 F2 = same) | 1108 m (listing) | pin update |
| seed-673 | Wanyan Fangtianxia | Amap: listed (顽岩攀岩馆(房天下大厦A座店) B0J0XAB119, 郭公庄中街20号房天下大厦A座 = same) | 3391 m (listing) | pin update |
| seed-674 | Aopan Jiaomen | Amap: listed (奥攀攀岩(角门店) B0I2CCF2PE, 大红门西路19号物美2层 = same) | 1033 m (listing) | pin update |
| seed-675 | Aopan Beijing Sport University | no Amap listing found (search shows the university only) | - | MANUAL |
| seed-676 | Aopan Wukesong | Amap: listed (奥攀攀岩(五棵松店) B0K2FUNSV4, 华熙LIVE五棵松B1 = same) | 290 m (entrance) | pin update |
| seed-677 | Aopan Yuquanying | Amap: listed (奥攀攀岩(玉泉营校区) B0FFLHVZW6, 玉泉营博瑞体育园 = same) | 1360 m (entrance) | pin update |
| seed-679 | I Climb | Amap: listed (我攀攀岩 B0KUZ5HV3S, 广渠东路北京商业储运公司35幢双跨库 = same address); the live pin is in north Chaoyang | 20740 m (entrance) | pin update |
| seed-680 | Climbing Orangutan | Amap lists 岚山攀岩 B0LRUGCKDD at the identical unit (果园8号楼1-101-K-04), other brand name, no reviews | 1708 m (entrance) | MANUAL (rebrand?) |
| seed-681 | Yaoyan Jinhui Port | Amap 耀岩攀岩馆 B0MB2U153K is at 裕满路 (Shunyi), a different address | 9430 m | MANUAL |
| seed-682 | Qingshan Qinghe | Amap: listed (青山攀石(清河店) B0LAACO45O, same) | 5 m, ok | none |
| seed-683 | Climb Together | Amap: listed (17ALKAKO一起攀岩(崇文门店) B0L14R21GY, 正仁大厦B1 = same) | 600 m (entrance) | pin update |
| seed-684 | Zhongpan Alps | Amap: 中攀Alps攀岩中心 B0I1JUBCF8 (暂停营业), 姚家园路甲1号汽车交易市场20幢1层A21 = same address; no RedNote closure notice found (notes to 2026-06) | 755 m (entrance) | pin update; status MANUAL (suspended on Amap) |
| seed-685 | Manhe Aopan | Amap: listed (缦合·奥攀攀岩 B0KA11P8DT, 东四环北路辅路与芳园南街交叉口西南220米; Bouldeer says 320 m) | 492 m (entrance) | pin update |
| seed-686 | Fun Wild Tencent | Amap: listed (趣野攀岩(回龙观店) B0FFJNPYLC, 腾讯众创空间338号 = same) | 1377 m (entrance) | pin update |
| seed-688 | Vitality Zone Sports Center | shares the pin of seed-665 (188 Baotai Rd); no Amap listing found under this name | - | MANUAL |
| seed-690 | Dingshi | Amap: listed (鼎石攀岩 B0JA753FSM, 成寿寺路甲12号9幢1层18B = same) | 430 m (entrance) | pin update |
| seed-691 | Demon King Zhonghe Rd | Amap: listed (魔王攀岩(富丰桥) B0LB5H2AGX, 中核路11号(栋能魔王运动空间内) = same) | 363 m (entrance) | pin update |

Summary: 44 audited; 29 pin updates (incl. seed-684, whose status stays a manual check); 1 ok (682); 1 retired (638, closed); 13 manual (640, 641, 643, 649, 657, 660, 662, 668, 670, 675, 680, 681, 688).
