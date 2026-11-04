# China pin and status verification, 2026-11-02 (read-only; nothing written to production)
Sources: Amap search + listing detail (`/place/<POI id>`), read in the owner's signed-in tab 2026-10-31/11-01 (detail pages read twice, identical;
GCJ-02 -> WGS-84; entrance coordinate where Amap has one, else the listing coordinate); RedNote read-only 2026-11-01; Bouldeer live data
(fetchLive, 2026-11-01). Matching is by brand/name AND address (street and number or mall), never by distance alone.
Distances: live pin vs the coordinate used. Batches: `import/batches/2026-11-02-cn-pins` (Hangzhou, Guangzhou, Beijing: 57 pin updates + 2 retirements) and `import/batches/2026-11-02-cn-pins-2` (Shanghai, Chongqing, Shenzhen: 72 pin updates); the importer allows 100 records per batch (location updates only where the pin is more than 150 m off and the match is certain).
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

## Shanghai (78 gyms; 17 skipped because PR #84 already fixed them; 61 audited)
Amap here comes from the gathered search results plus 6 extra brand searches; many Shanghai gyms are not in those results and stay manual. "hold" = children-only venue by name, pin untouched.
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-535 | Banana Climbing (Jinhongqiao) | Amap: listed (香蕉攀岩(金虹桥店) B0MASSG447, 长宁区茅台路179号2层L222-L228号) | 1402 m (listing) | pin update |
| seed-537 | Jinfeng Climbing 189 | Amap: listed (尽峰攀岩(189弄购物中心店) B0JKRBS8FJ, 普陀区长寿路街道长寿路189号189弄购物中心1幢L5层L501) | 442 m (listing) | pin update |
| seed-541 | YS Climbing (Gate M West Bund Dream Center) | Amap: listed (岩时攀岩(Gate M西岸梦中心) B0K1GHR662, 徐汇区龙华街道龙腾大道2266号Gate M西岸梦中心12号楼201单元) | 372 m (entrance) | pin update |
| seed-543 | Yanwu Kongjian (Lingang Wanda) | Amap: listed (岩舞空间攀岩(临港万达店) B0KGY7ALDE, 浦东新区临港万达广场1层) | 8789 m (listing) | pin update |
| seed-544 | DOME Climbing Camp (Xuhui Vanke Plaza) | Amap: listed (DOME 攀岩营地(徐汇万科广场) B0KUG9I2C1, 徐汇区沪闵路9191号(上海南站地铁站8号口步行420米)徐汇万科广场L2层(12号门扶梯附近)) | 1966 m (listing) | pin update |
| seed-545 | GOAT Climbing Club (Xujiahui TPY Center) | Amap: listed (GOAT攀岩俱乐部(徐家汇TPY中心店) B0LUL7AXNI, 徐汇区肇嘉浜路1117号TPY中心八楼) | 289 m (entrance) | pin update |
| seed-546 | Ledongli Jinfeng Climbing (West Bund) | Amap: listed (乐动力尽峰攀岩西岸馆 B0LGNURLIS, 徐汇区龙腾大道众腾大厦南侧约50米(自驾请导航到众腾大厦地下车库)) | 289 m (entrance) | pin update |
| seed-547 | Panzhuxia Climbing (Jiangqiao Wanda) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-548 | SHU Climbing Gym (Hongkou Stadium) | Amap: listed (小树攀岩馆SHU Climbing GYM(虹口馆) B0H2FOLEDC, 虹口区东江湾路444号虹口足球场4楼21号看台) | 625 m (listing) | pin update |
| seed-549 | GOAT Climbing Club (Putuo TopOne) | Amap: listed (GOAT攀岩俱乐部(普陀TopOne店) B0KANH30UR, 普陀区真南路1199弄19号桃浦湾TopOne地下一层商业区B1025) | 2356 m (listing) | pin update |
| seed-550 | UROCK Climbing | Amap: listed (优石攀岩UROCK CLIMBING B0IRUM2GRR, 浦东新区金湘路1000号优石攀岩馆) | 2496 m (listing) | pin update |
| seed-551 | Jinfeng Climbing (Meilong) | Amap: listed (尽峰攀岩 B0FFKHAC4R, 闵行区梅陇镇罗锦路218号游悉谷文体产业园5号楼) | 619 m (entrance) | pin update |
| seed-553 | TBW Extreme Sports Center (Parkour & Bouldering) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-554 | Panxing Kids Climbing (Baoshan Riyueguang) | children's gym: Amap 攀猩儿童攀岩馆(宝山日月光店) B0K3U6NTPL, 沪太路1933号日月光中心宝山店L1; adult access unknown | - | on hold (children's venues) |
| seed-555 | LAPUTA Climbing | Amap: listed (LAPUT攀岩(长宁来福士) B0LBNRNTU4, 长宁区长宁路1193号来福士广场西区一楼中庭) | 1742 m (listing) | pin update |
| seed-557 | Ribbon Climbing / Yeyan Climbing (Wujiaochang) | Amap: listed (共绘攀岩馆 B0MR1CDWIU, 杨浦区国顺东路800号西楼212A室); Amap name 共绘攀岩馆, same address as Bouldeer's Ribbon/Yeyan (rename?) | 45 m (listing), ok | none |
| seed-558 | DOME Climber's Camp (Dingxi Rd) | Amap: listed (DOME Climber's Camp(定西路店) B0G064LKMH, 长宁区定西路759号上海映巷创意工场4楼4B) | 78 m (entrance), ok | none |
| seed-559 | Panxing Climbing (Nanqiao Bailian) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-560 | Panzhuxia Climbing (Kangqiao New Field 360) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-562 | Jibi Storm Climbing (Pudong) | Amap: listed (极壁风暴攀岩馆(浦东店) B0KUAZDQ8K, 浦东新区杨高南路729号1幢101室) | 3018 m (entrance) | pin update |
| seed-564 | High Five Climbing Center (Jing'an) | Amap: listed (酸爽攀岩 B0G27BDYVG, 静安区永和东路643号2幢L180室); brand differs: Amap lists 酸爽攀岩 at the identical address (永和东路643号2幢L180) while Bouldeer says High Five; rebrand or wrong brand | 804 m (entrance) | MANUAL |
| seed-565 | STAR Climbing Club | Amap: listed (STAR星岩攀岩俱乐部 B0ID6AXTII, 徐汇区凯滨路38号尚湾里沉式广场地下一层A03-3室) | 414 m (entrance) | pin update |
| seed-567 | Jinfeng Climbing (Jiading) | Amap: listed (尽峰攀岩(嘉定馆) B0HDJUVLEX, 嘉定区白银路288弄莘潮国际家居东门(外街1楼)) | 1826 m (entrance) | pin update |
| seed-568 | Panxing Climbing (Zhonghuan Bailian) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-569 | 5+ Climbing (Nanxiang Black Diamond Hall) | Amap: listed (5+攀岩南翔黑钻馆(上海南翔太茂商业广场店) B0J3LMAI5N, 嘉定区丰翔路3168号1幢三楼307B) | 363 m (listing) | pin update |
| seed-570 | LE MONT Climbing Gym | Amap lists Le Mont Climbing Gym B0LGGU0N6Z at 西营南路555号2层217室 (Sanlin), a different address from Bouldeer (Changqing Rd 1200 Senghong Plaza); same venue not confirmed | about 2.6 km between the two points | MANUAL |
| seed-571 | GYM Climbing (Greenland Bingfen City) | Amap: listed (GYM攀岩馆(绿地缤纷城店) B0J3TXH23Z, 徐汇区东安路562号绿地缤纷城东区绿地中心2期店B1层); Amap name GYM攀岩馆(绿地缤纷城店), 东安路52号绿地缤纷城 B1 = same mall | 1581 m (listing) | pin update |
| seed-572 | Moyan Climbing (Huangpu Civic Fitness Center) | Amap: listed (魔岩攀岩馆(黄浦市民健身中心A楼店) B0FFIJUSKG, 黄浦区汉口路340号黄浦市民健身中心A楼3层(近山东中路)) | 115 m (listing), ok | none |
| seed-575 | Jungle Berry Camp | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-577 | Beta Boulders (Jing'an) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-578 | Glacier Sports Climbing (Wanduhui) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-579 | Xiaoyan Climbing (Jiating Hui) | Amap: listed (啸岩攀岩(嘉亭荟店) B0KDDL9C4O, 嘉定区墨玉南路1055嘉亭荟城市生活广场F1层) | 269 m (listing) | pin update |
| seed-580 | Panqing Sports (Jing'an) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-581 | Pake Climbing (Changning Rd) | Amap: listed (无界攀岩INFINITE CLIMBING B0LU35A3ZU, 长宁区长宁路88号KiNG88商业广场-长宁八八中心F3层); same mall (长宁路88号 KiNG88 F3) but another brand (无界攀岩 INFINITE CLIMBING) than Bouldeer's Pake; rebrand? | 4680 m (entrance) | MANUAL |
| seed-582 | Panxing Climbing (Baole Impression City) | Amap: listed (攀猩攀岩馆(宝乐汇印象城店) B0JU6AQ2TF, 宝山区宝乐汇印象城B1西侧); Amap name 攀猩攀岩馆(宝乐汇印象城店), B1 = same mall | 7694 m (listing) | pin update |
| seed-583 | Dengtuo Climbing (Chunshen) | Amap: listed (登拓攀岩馆 B0MABMS7OL, 闵行区春申路1899号); match by brand and area only (Bouldeer address has no number); 4233 m away | 4233 m (listing) | MANUAL |
| seed-584 | Kaiyuan Mediterranean Panxing Climbing | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-585 | Panxing Climbing Expansion (Qingpu Wuyue Plaza) | Amap: listed (攀猩·攀岩拓展(上海青浦吾悦广场店) B0JK0YJH26, 青浦区淀山湖大道218号吾悦广场上海青浦店BM层) | 1654 m (listing) | pin update |
| seed-586 | Panxing Climbing (Xindahui Sanlin) | Amap: listed (攀猩儿童攀岩馆(新达汇·三林店) B0JDRRTDS8, 浦东新区永泰路1058弄1-26号B1层中庭); children's gym (Amap name 儿童攀岩馆), adult access unknown; pin not changed | 1724 m (listing) | on hold (children's venues) |
| seed-587 | Red Gorilla Climbing | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-588 | Panxing Kids Climbing (Xinye Future Center) | children's gym by name (Panxing Kids); not looked up on Amap | - | on hold (children's venues) |
| seed-589 | 1778 Climbing (Sanlin Impression Hui) | Amap: listed (1778CLIMBING攀岩馆(三林印象汇店) B0KDT9GIQ5, 浦东新区懿行路188号5层503-1) | 932 m (listing) | pin update |
| seed-590 | HIGH5 Extreme Sports Center | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-591 | Rock Summit Climbing Gym (Fengshang International Plaza) | Amap: listed (岩顶攀岩Rock Summit Climbing Gym(丰尚国际广场店) B0JAVDRC65, 闵行区华漕镇运乐路569弄丰尚国际广场3号楼311号) | 446 m (listing) | pin update |
| seed-592 | Vmore Climbing (Gushan Rd) | Amap: listed (Vmore攀岩馆 B0JR1URZ26, 浦东新区洋泾街道崮山路500号明悦大厦508室) | 339 m (entrance) | pin update |
| seed-593 | Rock Climbing Club (Putuo) | Amap: listed (Rock攀岩俱乐部 B0HUAUAQJ5, 普陀区中潭路65号2F-205) | 291 m (listing) | pin update |
| seed-594 | U+ Climbing (Hengsheng Wanli Plaza) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-595 | Little Champion Climbing (Bubugao) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-597 | Zhihui Bay Nanqiao Climbing Space | Amap: listed (智慧湾南桥空间攀岩场 B0J2XSN1HD, 宝山区共和新路5895号(呼兰路地铁站1号口步行210米)) | 668 m (listing) | pin update |
| seed-598 | Jinshan Outdoor Sports Center Climbing Gym | Amap: listed (金山户外体育中心攀岩馆 B0JBBHY7JI, 金山区杭州湾大道4100号4扶梯旁) | 4230 m (entrance) | pin update |
| seed-600 | J Climbing Gym (Dianshan Lake Ave) | Amap: listed (J.Climbing攀岩运动馆 B0IKNR90AI, 青浦区盈浦街道淀山湖大道1079弄53号万达茂A区一楼) | 4493 m (listing) | pin update |
| seed-601 | Fengxian Sports Center Climbing Gym | Amap: listed (奉贤体育中心攀岩馆 B00156ZIJJ, 奉贤区南桥镇古华南路100号上海市奉贤区体育中心); match by name and district only (Bouldeer gives a cross-road description); 2003 m away | 2003 m (entrance) | MANUAL |
| seed-602 | DYNO Park Climbing (Yingfeng Tiandi) | Amap: listed (DYNOPARK攀岩馆 B0I61A7B5W, 浦东新区龙阳路2233号盈丰天地B1层B1010) | 189 m (entrance) | pin update |
| seed-603 | J.Climbing Club (Qinglifang Sports Center) | Amap: listed (J.Climbing攀岩青立方馆 B0K2O6VTPK, 青浦区秀泽路与汇金路交叉口东100米) | 2786 m (listing) | pin update |
| seed-604 | Qipeng Outdoor Climbing Gym | Amap: listed (琪朋户外攀岩馆 B0KGGZ70Y0, 金山区南阳港东路438号) | 3329 m (entrance) | pin update |
| seed-605 | Jibi Storm Climbing (Bailian Xijiao) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-1760 | Academy of Bouldering (AOB) | Amap: listed (AOB攀岩馆 B0K6OBTGVD, 虹口区北外滩街道东长治路399号双狮汇大厦双狮汇大厦B座B1) | 215 m (listing) | pin update |
| seed-1761 | Benchmark 2.0 | Amap: listed (Benchmark攀岩馆(滨港商业中心店) B0L65AB794, 虹口区四川北路939号滨港商业中心4楼1423单元) | 386 m (entrance) | pin update |
| seed-1762 | 1778 Climbing (Haichao Lu) | Amap: listed (1778CLIMBING攀岩馆 B0I6HMNZMM, 黄浦区半淞园路街道海潮路133号潮荟生活广场B1层A801) | 102 m (entrance), ok | none |
| seed-1763 | Stonehaven | Amap: listed (Stonehaven攀岩馆 B0L0A7CJ70, 徐汇区龙华路2778号上海龙华会C5L2层) | 203 m (entrance) | pin update |
| seed-1764 | Howl Shanghai | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |

Summary: 61 audited; 33 pin updates; 21 MANUAL; 3 on hold (children's venues); 4 ok (none).

## Chongqing (36 gyms; none in PR #84)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-791 | Bashan Tiger Climbing Club | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-792 | Jihuayuan Extreme Sports Center | Amap: listed (际华园极限运动中心 B0FFHWFFDG, 两江新区际华园南路188号重庆际华园) | 20716 m (entrance) | pin update |
| seed-793 | Scream Climbing (Guangdian Park) | Amap: listed (尖叫攀岩(光电园店) B0JKX7SQ5Q, 两江新区黄山大道中段6号星汇两江艺术中心停车场出口处) | 9000 m (entrance) | pin update |
| seed-794 | Black Ram Climbing Gym | Amap: listed (重庆黑公羊攀岩馆Black Ram Climbing B0G2UC55FZ, 南岸区烟雨路1号(海棠溪地铁站2A口步行310米)) | 592 m (entrance) | pin update |
| seed-795 | Zhongti · Bihuwang Climbing Gym | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-815 | Jidao Climbing (Jingang International) | Amap: listed (极道攀岩(金港国际购物中心店) B0FFL7BAEJ, 两江新区胜利路194号喜地山·金港国际L1层) | 219 m (listing) | pin update |
| seed-816 | Pandengxia Kids Climbing (Qijiang Wanda) | Amap: listed (攀登侠攀岩馆(綦江万达店) B0JAGSARV2, 綦江区万达广场1号门右手扶梯下行负一楼); Amap name 攀登侠攀岩馆 (not marked children); Bouldeer name says Kids | 107 m (listing), ok | none |
| seed-817 | Pandengxia Kids Climbing (Yongchuan) | children's gym: Amap 攀登侠儿童攀岩馆(永川万达店) B0KRXM3V1M; adult access unknown | - | on hold (children's venues) |
| seed-818 | Yichen Climbing (Beibei Wuyue Plaza) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-819 | STONE Climbing (Shiqiao Plaza) | Amap: listed (山石攀岩馆 B0G1FZLCFU, 九龙坡区石桥广场2层) | 1010 m (entrance) | pin update |
| seed-820 | Yuyan Climbing (Qibo Center) | Amap: listed (雨岩攀岩(汽博中心店) B0LRA714C3, 两江新区金渝大道85号汉国中心B座商业街1楼) | 1551 m (entrance) | pin update |
| seed-821 | Pandengxia Kids Climbing (Yubei Shuita Yunxuan) | children's gym: Amap 攀登侠儿童攀岩馆(渝北区水獭云选店) B0L67ZS3EA; adult access unknown | - | on hold (children's venues) |
| seed-822 | Mengke Climbing | Amap: listed (萌客攀岩运动馆 B0G1GZNVOT, 南川区文化艺术中心4号门) | 9941 m (listing) | pin update |
| seed-823 | Jidao Climbing (Lanting Xinduhui) | Amap: listed (极道攀岩(蘭亭·新都汇店) B0JUABJVHT, 两江新区兴科大道322号蘭亭·新都汇B1层) | 140 m (listing), ok | none |
| seed-824 | Jidao Climbing Sports (Dongyuan 1891) | Amap: listed (极道攀岩运动馆(重庆东原1891时光道) B0FFIGF67W, 南岸区南滨路东原1891一楼C馆D馆中间) | 7604 m (entrance) | pin update |
| seed-825 | Kuji Climbing (Tianjiangli) | Amap: listed (酷基攀岩(天江里店) B0KA6ULX80, 两江新区文慧路88号附33号) | 12921 m (entrance) | pin update |
| seed-826 | Scream Fun Climbing (Times Square) | Amap: listed (尖叫趣攀攀岩馆 B0L66K5FWT, 渝中区长江二路174号龙湖重庆时代天街D馆L4层) | 605 m (entrance) | pin update |
| seed-827 | STONE Climbing (Longhu Jinsha Tianjie) | Amap: listed (山石攀岩(龙湖重庆金沙天街A馆店) B0IA3MRGNT, 沙坪坝区北站东路188号龙湖重庆金沙天街A馆F2层) | 1475 m (listing) | pin update |
| seed-828 | Pandengxia Kids Climbing (Changshou Kaiyi) | children's gym: Amap 攀登侠儿童攀岩馆(长寿凯谊店) B0LD6XBNJ2; adult access unknown | - | on hold (children's venues) |
| seed-829 | Xinxiang Climbing (Wanxianghui A Hall) | Amap: listed (心象攀岩(万象汇A馆店) B0HKKDI4AZ, 大渡口区万象汇A馆LG层(AB连廊处)) | 247 m (entrance) | pin update |
| seed-830 | TNT Climbing (University City) | Amap: listed (TNT攀岩馆(富力坊店) B0KBLZWD33, 沙坪坝区沙坪坝区大学城至德路西城富力坊一层L113L115) | 6937 m (entrance) | pin update |
| seed-831 | Pandengxia Kids Climbing (Shapingba Rongchuangmao) | Amap: listed (攀登侠儿童攀岩馆(沙坪坝融创茂店) B0MGJ7CVQU, 沙坪坝区西林大道84号融创茂F2层); children's gym (Amap name 攀登侠儿童攀岩馆); adult access unknown | 183 m (listing) | on hold (children's venues) |
| seed-832 | Lepan Jungle Climbing (Yinxiangcheng) | Amap: listed (乐攀攀岩户外馆(重庆印象城店) B0J2VHCU1A, 渝中区印象城四楼(九号线一号口接驳)(化龙桥地铁站出入口旁)) | 28 m (listing), ok | none |
| seed-833 | Chongqing University City Xijie Climbing Field | Amap: listed (重庆大学城熙街攀岩场 B0FFGACUU3, 沙坪坝区景苑路与沙坪坝区大学城熙街商业街交叉口北40米) | 796 m (listing) | pin update |
| seed-834 | Songshu Climbing | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-835 | Monkey Hill Bouldering Gym | Amap: listed (猴山攀岩馆(重庆悦荟购物中心店) B0MU57TCNI, 两江新区东原D7区3期ug层35号); match by name only (Bouldeer has no address); 5215 m away | 5215 m (listing) | MANUAL |
| seed-836 | Lichuan Climbing Gym | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-837 | Gulang Climbing (Huanlehui) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-838 | Pandengxia Kids Climbing (Shuangfu Wuyue) | children's gym: Amap 攀登侠儿童攀岩馆(双福吾悦店) B0L2G5TDFD; adult access unknown | - | on hold (children's venues) |
| seed-839 | Pandengxia Kids Climbing (Liangjiang Xingyueli) | children's gym: Amap 攀登侠儿童攀岩馆(两江新区兴悦里店) B0MGALFPS2; adult access unknown | - | on hold (children's venues) |
| seed-840 | Hi Pan Climbing (MSG Huixing) | Amap: listed (Hi攀攀岩(重庆MSG汇星店) B0MAJX4DJ5, 两江新区两江新区MSG汇星商场1号门一楼中庭) | 8085 m (listing) | pin update |
| seed-841 | Xiao Songshu Climbing | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-842 | Lepan Jungle Climbing (Yubei) | Amap: listed (乐攀丛林攀岩体验馆(SKLP新光里+) B0FFIZS4TT, 两江新区红锦大道99号新光城B区5层(嘉州路地铁站1号口步行60米)); match by name and district only (Bouldeer has no address); 17267 m away | 17267 m (entrance) | MANUAL |
| seed-843 | STONE Climbing Gym (C33) | Amap: listed (山石攀岩(C33店) B0MBSUE4GD, 两江新区两江新区重庆市两江新区鸳鸯街道极佳大道102号附5号2-18) | 9492 m (entrance) | pin update |
| seed-844 | WoodClimbing | Amap: listed (WoodClimbing我的攀岩 B0MAD7J1B0, 两江新区凯德广场2层56号) | 7017 m (listing) | pin update |
| seed-845 | Big Rock Climbing (Boulder) | Amap: listed (大石头攀岩(Boulder) B0LKNLR9PF, 两江新区金源路49号) | 2329 m (entrance) | pin update |

Summary: 36 audited; 9 MANUAL; 18 pin updates; 3 ok (none); 6 on hold (children's venues).

## Shenzhen (47 gyms; none in PR #84)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-486 | Banana Climbing (OCT PARK Happy Time) | Amap: listed (香蕉攀岩(华侨城欢乐时光店) B0MUPRFGYM, 南山区沙河街道香山街社区香山东街260号天鹅湖三期欢乐时光商场L1019) | 5506 m (listing) | pin update |
| seed-487 | Banana Climbing (Shangmeilin Zhuoyuehui) | Amap: listed (香蕉攀岩(上梅林卓悦汇店) B0MGAHEDZL, 福田区梅林街道梅都社区中康路126号卓悦汇购物中心L2-26) | 2656 m (listing) | pin update |
| seed-488 | Banana Climbing (Joyful Ave) | no Banana listing found for it; the nearest Amap listing (369 m) is 博昇攀岩俱乐部(粤海文体中心店), a different brand | - | MANUAL |
| seed-489 | Banana Climbing (Nanshan Houhai) | Amap: listed (香蕉攀岩(深圳湾后海汇店) B0I0OZ3Y0B, 南山区后海滨路3288号深圳湾后海汇B2-01商铺及山系广场(后海地铁站A2出口下至B2层直达)) | 1058 m (listing) | pin update |
| seed-490 | Banana Climbing (iN City Plaza) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-491 | Banana Climbing (Link Plaza) | Amap: listed (香蕉攀岩(领展中心城) B0JD97VZ2A, 福田区福华一路3号领展中心城L层(西大门进入直行50m,扶梯附近)) | 754 m (listing) | pin update |
| seed-492 | Banana Climbing (Kingdee) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-493 | Banana Climbing (Bao'an Center) | Amap: listed (香蕉攀岩Banana Climbing Gym(宝安中心店) B0J2V5FA91, 宝安区创业一路1006号丽晶国际B栋3楼304号) | 522 m (listing) | pin update |
| seed-494 | KL Sport Fun Sports Arena (Bantian Vanke Plaza) | Amap: listed (KL Sport潮玩运动超乐场(坂田万科广场店) B0K2VL9L7S, 龙岗区坂田万科广场4楼L4-51(星巴克向上四楼)) | 48 m (listing), ok | none |
| seed-495 | nerdcave Climbing Gym | Amap: listed (nerdcave攀岩馆(向南瑞峰商业广场店) B0FFIWBBN2, 南山区桂庙路22号向南瑞峰商业中心B区4楼4033) | 223 m (entrance) | pin update |
| seed-496 | Blue Sky Climbing (Nanshan) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-497 | Lightning Climbing Gym | Amap: listed (闪电攀岩Lightning Climbing GYM B0KGHDY55T, 福田区岗厦北地铁站B2层商业西区最西端(近3号口)) | 398 m (entrance) | pin update |
| seed-498 | XONE Fitness Center (Futian) | Amap: listed (XONE潮玩运动中心(福田店) B0FFJM6FOX, 福田区市花路9号泰福仓储大厦102座) | 408 m (listing) | pin update |
| seed-499 | Longgang Universiade Center Climbing Gym | same address as seed-510 (Universiade Center Gate 26) and the same pin: duplicate or closed; Amap shows only 征岩攀岩馆(大运店) there | - | MANUAL |
| seed-500 | Pulan Sports (Shenzhen) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-501 | Bengbei Trendy Play (Longhua) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-502 | Guangming District Public Sports Center Climbing Gym | Amap: listed (光明区群众体育中心攀岩馆 B0I2Y7UN2Y, 光明区光明街道光明群众体育中心) | 1680 m (entrance) | pin update |
| seed-503 | Blue Sky Climbing (Futian Sports Park) | Amap: listed (蓝天攀岩(福田体育公园店) B0FFMBF8EJ, 福田区福强路3030号福田体育公园) | 141 m (entrance), ok | none |
| seed-504 | Yijiu Climbing Gym (Longhua Bookstore) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-505 | Blue Sky Climbing (Luohu Yitian Holiday Plaza) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-506 | Blue Sky Climbing (Shenye Shangcheng) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-507 | Climbing Orangutan (Pingshan) | Amap: listed (攀猩儿童攀岩馆(深圳坪山悦阾店) B0LG5SO573, 坪山区马峦山街道悦阾SPACE购物中心三楼攀猩攀岩馆); children's gym (Amap name 攀猩儿童攀岩馆), adult access unknown | 616 m (entrance) | on hold (children's venues) |
| seed-508 | Triple Top Climbing Gym | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-509 | Blue Sky Climbing (Ledongli Cuiyuan Huafu) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-510 | Zhengyan Climbing Gym (Dayun) | Amap: listed (征岩攀岩馆(大运店) B0FFK7MW6R, 龙岗区龙城街道龙翔大道大运中心体育场26号门); entrance 629 m, listing point 894 m away; seed-499 has the same address (duplicate suspected) | 629 m (entrance) | pin update |
| seed-511 | Climbing Orangutan (Longhua) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-512 | Godo Yaugaa Climbing Gym | Amap: listed (有家攀岩馆(卓悦汇购物中心) B0LDL5RGCB, 福田区梅康路与梅林路交叉口西北100米卓悦汇购物中心B2层) | 98 m (entrance), ok | none |
| seed-513 | DynoClimbing Gym | Amap: listed (DynoClimbing攀岩馆 B0LGXLDCGK, 南山区蛇口街道中心路2233号宝能太古城北区负二楼GD203DYNO Climbing攀岩馆) | 443 m (entrance) | pin update |
| seed-514 | Nedo Yaugaa Climbing Gym | Amap: listed (呢度有家攀岩馆 B0KG910RYP, 福田区华富街道岗厦北地铁站13号出口下沉广场负二楼) | 192 m (entrance) | pin update |
| seed-515 | Captain Ryder Kids Sports Center (Poly Yuedu) | children's venue by name; not looked up on Amap | - | on hold (children's venues) |
| seed-516 | Boshen Climbing (Shekou) | Amap: listed (博昇攀岩(蛇口店) B0FFF2OO4D, 南山区深圳蛇口招商花园城南门旁(四海地铁站D口步行110米)) | 1495 m (entrance) | pin update |
| seed-517 | Formpower Climbing & Parkour Gym | Amap: listed (形动力跑酷·攀岩馆(龙岗金基吉祥广场店) B0J1O5EORG, 龙岗区金基吉祥广场5层) | 1076 m (listing) | pin update |
| seed-518 | Little Player Dream Factory (Shiyan Main Store) | children's venue by name; not looked up on Amap | - | on hold (children's venues) |
| seed-519 | Little Player Dream Factory (Honwan) | children's venue by name; not looked up on Amap | - | on hold (children's venues) |
| seed-520 | Yanwu Kongjian Climbing (Jiayanghui) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-521 | rock0755 Climbing Gym | Amap: listed (Rock 0755跃壁攀岩户外拓展馆 B0IAB7K2UE, 龙华区大浪商业中心后浪新天地7栋3楼7307室) | 253 m (entrance) | pin update |
| seed-522 | Yijiu Climbing Gym (Honglifang Youth Center) | Amap: listed (一就攀岩馆(红立方青少年宫店) B0H6JUD47U, 龙岗区龙翔大道8028号青少年宫一楼) | 4840 m (listing) | pin update |
| seed-523 | Starlight Climbing | Amap: listed (星光攀岩(万达广场店) B0KRU733XU, 龙岗区万达广场南3号门旁边B1-次组一) | 1974 m (entrance) | pin update |
| seed-524 | Yijiu Climbing Gym (Honghuashan Sports Center) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-525 | Little Warrior Climbing Challenge | children's venue by name; not looked up on Amap | - | on hold (children's venues) |
| seed-526 | Blue Sky Climbing (Luohu Government Service Center) | Amap: listed (蓝天攀岩(罗湖政务中心店) B0FFKNXZ7V, 罗湖区经二路48号罗湖区政务服务中心2层) | 371 m (entrance) | pin update |
| seed-527 | Yanwu Kongjian Climbing (flagship) | Amap: listed (岩舞空间攀岩 B0LU966XVE, 龙岗区龙城街道尚景社区龙岗大道3999号万科里B1层) | 1236 m (listing) | pin update |
| seed-528 | Allez Climbing Gym (Donghua Building) | Amap: listed (阿叻综合攀岩馆Allez Climbing Gym(动漫大厦店) B0H0USJ906, 罗湖区怡景路2013号动漫大厦4F401) | 305 m (listing) | pin update |
| seed-529 | Little Warrior Climbing Challenge Explorer Camp (Xixiang) | children's venue by name; not looked up on Amap | - | on hold (children's venues) |
| seed-530 | Yijiu Climbing (Manfen Tiandi Shanshan Outlets) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-531 | Climbing Orangutan (Shuiwan) | no matching Amap listing found in the gathered results (searches are capped at 60 per keyword); not confirmed or refuted | - | MANUAL |
| seed-532 | Zhengyan Climbing Gym (Guiwan) | Amap: listed (征岩攀岩馆(桂湾店) B0K63CN1BZ, 南山区听海大道桂湾公园P2停车场左边100米) | 1226 m (listing) | pin update |

Summary: 47 audited; 21 pin updates; 17 MANUAL; 3 ok (none); 6 on hold (children's venues).

# Part 3 (2026-11-02): Wuhan, Changsha, Zhuhai, Suzhou, Tianjin, Xi'an, Nanjing
Batch `import/batches/2026-11-02-cn-pins-3` (44 pin updates; validate + plan + `import --dry-run` pass, PARTIAL coverage = no service-role key). Same method as above (brand/name AND address; entrance coordinate, else listing-detail coordinate; GCJ-02 -> WGS-84; update only when more than 150 m off). The Amap browser tab stopped answering (CDP timeouts) during the listing-detail reads, so **Xi'an (12 gyms) and Nanjing (11 gyms) are matched but held**: their pin updates need the detail read (resume: `node detail.js <ids>`, ids in the rows below). Garbled characters in Amap detail text were ignored; names/addresses below come from the search results.

## Wuhan (18 gyms)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-692 | Banana Climbing (Huafa Midtown) | Amap: listed (BANANA+ 香蕉攀岩 (华发中城商都店) B0L3MLOP8Z, 青年路299号华发中城商都B1栋1F层1号); the listing is BANANA+ in the same mall (Huafa Midtown / 华发中城商都); Bouldeer address Huaihai Rd 6 vs Amap Qingnian Rd, same mall | 1907 m (entrance) | pin update |
| seed-693 | Banana Climbing (Qincheng MixC World) | Amap: listed (香蕉攀岩(亲橙万象汇店) B0K05SUPE9, 徐家棚街道亲橙万象汇L501号) | 6237 m (listing) | pin update |
| seed-694 | Banana Climbing (Hang Lung Plaza) | Amap: listed (香蕉攀岩馆(恒隆广场店) B0LDUDA9RB, 恒隆广场座501B) | 148 m (entrance), ok | none |
| seed-695 | Banana Climbing (Optics Valley K11) | Amap: listed (香蕉攀岩(光谷K11店) B0MDCD3NA0, 关山大道35号) | 1384 m (entrance) | pin update |
| seed-696 | Yousheng Meiyan Climbing Gym (Jinhe Center) | Amap: listed (优胜美岩运动攀岩馆(金禾中心店) B0FFIDTTNL, 徐东大街181号岳家嘴金禾中心124号) | 576 m (entrance) | pin update |
| seed-697 | CUG Outdoor Climbing Gym | Amap: listed (地大户外攀岩馆 B0LG4YCFKM, 和平大道1278号武汉青山印象城F层); shares one pin with seed-708 (Snow Leopard, same mall) | 2286 m (listing) | pin update |
| seed-699 | Wuyan Liuse Climbing Gym | Amap: listed (五岩六色攀岩馆 B0KDC7O6EO, 欧亚达汉口生活MALL负二层B2-13) | 4331 m (entrance) | pin update |
| seed-700 | New Starting Point Climbing (Gaoxin) | Amap: listed (新起点攀岩(高新馆) B0M3K9OGGZ, 壹为邻商五楼); Amap address has no road number (壹为邻商场五楼); match by brand + branch name 高新馆 | 2107 m (listing) | pin update |
| seed-701 | New Starting Point Climbing (Hankou) | Amap: listed (新起点攀岩(汉口馆) B0KR9CILFF, 新华街道解放道1381号大洋中心A座1楼) | 43 m (listing), ok | none |
| seed-702 | SU328 Climbing & Combat Sports Center | Amap: listed (SUB328攀岩拳击运动中心(漫时区店) B0KBOL8JRQ, 3号楼3楼) | 2438 m (listing) | pin update |
| seed-703 | Yanwu Kongjian Climbing (Wuhan Livat) | Amap: listed (岩舞空间(武汉荟聚店) B0JBU7JZMB, 园博大道1号武汉荟聚L1层(12号门进入向右走10m,扶梯附近)) | 1896 m (listing) | pin update |
| seed-704 | K-PRO Climbing Center | Amap: listed (K-PRO快意攀岩中心 B0M6MCUQCM, 解放大道武汉K11购物艺术中心II馆1层S101、S104-1) | 489 m (entrance) | pin update |
| seed-705 | Rock Climbing (Dongxihu) | no Amap climbing listing at Bishui Ave / Hongtu 2nd Rd (nearest listing is 岩舞·空间金银潭店, 2.9 km away, a different mall); status unknown | - | MANUAL |
| seed-706 | Yanwu Kongjian Climbing (CapitaMall 1818) | Amap: listed (岩舞空间(凯德1818店) B0J1PD42T8, 中北路109号凯德1818 F1层) | 1643 m (listing) | pin update |
| seed-707 | MTC Summit Climbing | Amap: listed (MTC顶峰攀岩 B0LGZCVW1D, B座) | 6214 m (entrance) | pin update |
| seed-708 | Snow Leopard Climbing Gym | Amap lists two 雪豹 gyms (大夹街203号 B0FFF67QV6; 汉商银座 B0FFI30L6Z), neither at Qingshan Impression City; the only Amap climbing listing there is seed-697 地大户外 (F-level); shares one pin with seed-697 | - | MANUAL |
| seed-709 | HICOME Climbing (Jiangteng) | no Amap listing for HICOME / 江腾广场 (a search found only Hicome in Hong Kong); status unknown | - | MANUAL |
| seed-710 | Fire Dance Climbing Leisure Fitness Hall | Amap: listed (火舞攀岩休闲健身馆 B0K1CUM3JW, 吴家街阡那广场1中庭) | 323 m (entrance) | pin update |

Summary: 18 audited; 13 pin updates; 2 none; 3 MANUAL.

## Changsha (3 gyms)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-711 | Banana Climbing (Zhujiang Star Ring) | Amap: listed (香蕉攀岩(珠江星环店) B0J01U438Y, 福元西路109号珠江星环购物中心L3层) | 3454 m (listing) | pin update |
| seed-712 | Banana Climbing (Yuefang ID Mall) | Amap: listed (香蕉攀岩(悦方ID MALL店) B0L0ZAE3OC, 坡子街216号悦方IDMALL L4层香蕉攀岩L455) | 104 m (entrance), ok | none |
| seed-713 | Banana Climbing (CapitaLand One) | Amap: **暂停营业** (香蕉攀岩馆(凯德·壹中心店)(暂停营业) B0IULAR3ZB, 茶子山东路112号凯德·壹中心B2层); Amap marks this listing **暂停营业** (temporarily closed): pin fixed from the listing, status MANUAL (not retired) | 8642 m (listing) | pin update |

Summary: 3 audited; 2 pin updates; 1 none.

## Zhuhai (1 gyms)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-755 | Banana Climbing (Le Shi) | Amap: listed (香蕉攀岩(珠海乐士店) B0G0YSLO8W, 1栋第一层南侧TE1三5) | 6984 m (entrance) | pin update |

Summary: 1 audited; 1 pin.

## Suzhou (20 gyms)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-756 | HOLDZ Climbing Monkey Climbing (Kunshan) | Amap: listed (HOLDZClimbing猴子攀岩昆山店 B0M16AMZYM, 玉山镇长江中路); Bouldeer has no address; match by brand + city (the only HOLDZ in Kunshan) | 974 m (listing) | pin update |
| seed-757 | HOLDZ Climbing Monkey Climbing (Wuzhong) | Amap: listed (HOLDZ Climbing猴子攀岩吴中店 B0MUFHGRTO, 南溪江路88号801号); the only HOLDZ in Wuzhong; Bouldeer has no address | 5879 m (listing) | pin update |
| seed-758 | Koala Climbing (Wangfujing) | Amap: listed (考拉攀岩(王府井购物中心) B0MDSOJLER, 嘉元路188号王府井生活广场2层东侧); the only 考拉 in Suzhou city; Bouldeer has no address | 7155 m (listing) | pin update |
| seed-759 | Koala Climbing (New District) | Koala (考拉) New District: the only Amap 考拉 in the Hi-Tech/New District is B0LBZRMJ5V (狮山下沉广场B1), but Bouldeer has no address to confirm the branch | - | MANUAL |
| seed-760 | TBW Extreme Sports Center (Kunshan) | Amap: listed (TBW极限运动中心(昆山城西店) B0M6A5ZERH, 前进西路1850号(保利影城1层)) | 7080 m (entrance) | pin update |
| seed-761 | Climbing Orangutan (Xinglanhui) | Amap: listed (攀猩攀岩馆(星斓荟店) B0M6TR6NTP, 南榭雨街55号星斓荟·路劲广场) | 251 m (entrance) | pin update |
| seed-762 | Star Rock Climbing (Gaoxin Culture & Sports Center) | Amap: listed (星空攀岩文体中心店 B0HUJC0J9T, 太湖大道999文体中心健身中心楼综合馆vip网球室) | 7561 m (entrance) | pin update |
| seed-763 | Star Rock Climbing (Meiluo) | Amap: listed (星空攀岩(超级星空美罗店) B0MRFRTZ3S, 长江路211号天都广场1幢102室二楼2006(玉山路地铁1号口旁)); branch name Meiluo = 美罗; Bouldeer has no address; shares one placeholder pin with seed-758 and seed-774 | 7862 m (listing) | pin update |
| seed-764 | Star Rock Climbing (Mudu Youfang) | Amap: listed (星空攀岩(悠方店) B0FFJ1NBEV, 木渎悠方六楼星空攀岩(金枫路地铁站出入口步行50米)); Bouldeer has no address; Mudu Youfang = 木渎悠方 | 2338 m (listing) | pin update |
| seed-765 | Star Rock Climbing (HSR Wuyue Plaza) | Amap: listed (星空攀岩(吾悦广场苏州高铁店) B0LD5L6RHU, 相城大道3188号吾悦广场苏州高铁店F4层); Bouldeer has no address; HSR Wuyue Plaza = 吾悦广场苏州高铁店 | 3132 m (entrance) | pin update |
| seed-766 | Star Rock Climbing (Suzhou Bay Gulin Park) | Amap: listed (运动社&星空攀岩(苏州湾歌林公园店) B0GUU6Y0AA, 天鹅荡路1-1号F4); Bouldeer has no address; Suzhou Bay Gulin Park = 苏州湾歌林公园; shares a placeholder pin with seed-768 | 11340 m (entrance) | pin update |
| seed-767 | Sports Club & Star Rock Climbing (Yinshan Lake Gulin Park) | Amap: listed (运动社&星空攀岩(尹山湖歌林公园店) B0KDXHD13B, 8号楼负一楼)) | 617 m (entrance) | pin update |
| seed-768 | Liu Changzhong Climbing (Sasseur) | Amap: listed (刘常忠攀岩馆(砂之船店) B0H3SCMBBA, 开平路3688号); Bouldeer has no address; Sasseur = 砂之船 | 5144 m (listing) | pin update |
| seed-769 | Liu Changzhong Climbing (Olympic Sports Center) | Amap: listed (刘常忠攀岩馆(奥体中心店) B0FFKE2AT8, 中新大道东999号苏州奥林匹克体育中心游泳馆一楼) | 8996 m (entrance) | pin update |
| seed-770 | Liu Changzhong Climbing (Dushu Lake) | no Amap listing for a Liu Changzhong (刘常忠) gym at Dushu Lake (Amap lists only the Olympic Center and Sasseur branches); status unknown | - | MANUAL |
| seed-771 | Panyue Climbing (Caohu Culture & Sports Center) | Amap: listed (攀月攀岩漕湖文体中心店 B0MB271IJ5, 永昌泾路19号文体中心二楼) | 1072 m (entrance) | pin update |
| seed-772 | Panyue Climbing (Xiangcheng Tianjie) | Amap: listed (攀月攀岩 (相城天街店) B0LAJ7P0ZQ, 天街B馆(OPARK活力汇)5F-3) | 497 m (entrance) | pin update |
| seed-773 | Panyue Climbing (SIP Xinghu) | Amap: listed (攀月攀岩(园区星湖店) B0LDTX8GWA, 工业园区星湖龙湖天街A馆5F-03); Bouldeer has no address; Xinghu = 星湖 | 5594 m (entrance) | pin update |
| seed-774 | Loong Climbing (Jiuguang) | Amap: listed (九星龙国际攀岩LOONG CLIMBING B0J13DN5PD, 工业园区久光百货三层黄区3B-01(a+c)九星龙国际攀岩); Bouldeer has no address; Jiuguang = 久光百货, listing address 久光百货三层 | 8493 m (listing) | pin update |
| seed-775 | Loong Climbing (Suzhou MixC World) | Amap 九星龙国际攀岩(万象天地店) B0LKSMHMXR is at 金阊 枫桥路36号 (MixC World / 万象天地) but Bouldeer says 338 Liuyuan Rd (outside Changmen); address does not match | 708 m (listing, unverified match) | MANUAL |

Summary: 20 audited; 17 pin updates; 3 MANUAL.

## Tianjin (15 gyms)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-776 | Dianfeng Climbing Gym | Dianfeng (Wuqing/Binhai area pin 39.303,117.416 shared with seed-781 and seed-790): no matching Amap listing; status unknown | - | MANUAL |
| seed-777 | Mango Climbing (Binhai Wuyue Plaza) | Amap: listed (芒果攀岩(滨海吾悦广场店) B0L16GRVCE, 滨海吾悦广场2号门二楼001) | 1973 m (entrance) | pin update |
| seed-778 | Bolonghu Sports Fitness Center Climbing Gym | Amap: listed (渤龙湖体育健身中心攀岩馆 B0K2L7PPZG, 高新六路与惠仁道交叉口东北160米) | 1295 m (entrance) | pin update |
| seed-779 | Mango Climbing (Ninghe Wuyue Plaza) | Amap: listed (芒果攀岩(宁河吾悦广场店) B0K0HSB27G, 桥北街道光明路58号吾悦广场2楼多经204号) | 1486 m (entrance) | pin update |
| seed-780 | Fengmang Climbing (Gulou New World) | Amap: listed (锋芒攀岩(新世界百货店) B0FFM19YI3, 鼓楼街道东马路新世界百货负一层) | 26 m (listing), ok | none |
| seed-781 | Rockway Climbing (Shuicheng) | Rockway (岩途): two Amap listings, B0J2955XZE (武清体育中心A馆) and B0M11A13LR (卉康道, Xiqing); Bouldeer branch names Shuicheng/Cuitong Rd and no address do not decide which is which; shares one pin with seed-776 and seed-790 | - | MANUAL |
| seed-782 | Xingkong Climbing Gym (Liuyuan) | Xingkong (行空) Liuyuan, Chenchang Rd: Amap lists only 行空攀岩运动馆(陆家嘴店) in Hongqiao district, a different branch; status unknown | - | MANUAL |
| seed-783 | Fun Wild Climbing (Meijiang Convention Center) | Amap: listed (趣野攀岩(梅江会展中心店) B0KDGGBQVF, 梅江会展中心二期S3馆3楼) | 933 m (entrance) | pin update |
| seed-784 | Mango Climbing (Binhai Jinyu Jiapin) | Amap: listed (芒果攀岩(金隅嘉品Mall店) B0J0BLVYVJ, 金隅嘉品mall四楼) | 1183 m (listing) | pin update |
| seed-785 | Benpan Climbing Gym | Amap: listed (本攀攀岩馆(天津店) B0LK2URD9O, 南泥湾路6-10底商熙悦汇悦动广场B1); Bouldeer has no address; the only 本攀 in Tianjin | 2488 m (entrance) | pin update |
| seed-786 | Tianjin Top Climbing (Hexi) | Amap: listed (天津TOP climbing攀岩俱乐部(河西店) B0FFGHAWE7, 太湖路17号通达尚城体育馆2楼); address number differs (33 vs 17/12) but same venue, 通达尚城体育馆 | 68 m (entrance), ok | none |
| seed-787 | Tianjin Top Climbing (Huanghe Rd) | Amap: listed (天津Top climbing 攀岩馆(黄河道店) B0L1OUOIIY, 黄河道519号,幢号24-102-1号); Bouldeer has no address; branch name Huanghe Rd = 黄河道店 | 2535 m (entrance) | pin update |
| seed-788 | Tianjin Over Rock Climbing Gym | Amap: listed (天津OverRock攀岩馆 B0FFJ01V67, 兴华四支路11号) | 1222 m (entrance) | pin update |
| seed-789 | Tianjin Top Climbing (Ling'ao) | Amap: listed (天津TOP攀岩俱乐部(凌奥馆) B0FFMG06AT, 凌奥创意产业园2期2号); branch name Ling'ao = 凌奥 | 8146 m (entrance) | pin update |
| seed-790 | Rockway Climbing (Cuitong Rd) | Rockway (岩途) Cuitong Rd: see seed-781 | - | MANUAL |

Summary: 15 audited; 4 MANUAL; 9 pin updates; 2 none.

## Xi'an (19 gyms)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-796 | Huoshi Climbing (Provincial Stadium) | Amap: listed (西安火石攀岩运动馆(省体店) B0FFG7Z5RP, 绿锐商城内负一层) | 206 m (listing) | pin update |
| seed-797 | Laoshan Climbing Co-creation Club | Amap: listed (老陕攀登共创俱乐部 B0I395YOFL, 含光北路96号公路设计院家属院13号楼) | 1022 m (entrance) | pin update |
| seed-798 | Yan13 Climbing Gym | Amap: listed (岩十三攀岩(高新店) B0KBK4BFT5, 高新技术产业开发区高新路76号天地源丹轩坊13栋负一楼) | 147 m (entrance), ok | none |
| seed-799 | DC Climbing | DC (攀岩): Amap has 2 DC listings (B0L2OCWLQG 立工丰城, B0MD1CTBBD 西体店); Bouldeer has no branch or address | - | MANUAL |
| seed-800 | Huoshi Climbing (Rainbow Valley) | matched to Amap B0K35D36FY by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-801 | Lingzhongli Climbing (Taiyicheng) | matched to Amap B0KBLZYFR9 by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-802 | Duote Climbing (Dazhai Rd) | matched to Amap B0HRPA4TUA by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-803 | Muyan Climbing | Muyan: no matching Amap listing (a 牧岩 search found none) | - | MANUAL |
| seed-804 | Jianshan Climbing | matched to Amap B0MBORXMS1 by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-805 | Red Point Climbing (Longhu Changle Tianjie) | matched to Amap B0LDU6ABXT by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-806 | Daren Climbing | matched to Amap B0JAOCUYWE by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-807 | Duote Climbing (Dayuecheng) | matched to Amap B0J3D7LS0C by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-808 | Duote Climbing (Minleyuan) | matched to Amap B0KRTHXPL0 by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-809 | Red Point Climbing (Datang West Market) | matched to Amap B0IULUT6MP by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-810 | Climbing Dream Factory (Lijiacun) | matched to Amap B0FFJI10HW by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-811 | Xi'an Seeyou Climbing Gym | Seeyou: no certain Amap match (西柚攀岩 B0LAARDDIK exists but the names are not the same word) | - | MANUAL |
| seed-812 | Xi'an Zebra Climbing | matched to Amap B0K3HL0B2F by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-813 | Wopan Xi'an Climbing Gym | matched to Amap B0LURN1BJB by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-814 | Peter Rabbit Climbing (Damao City) | Peter Rabbit (彼德兔) Damao City: Amap lists 彼德兔 at Zhaoyangmen, Huaqing, Taibai, Xixian and Chang'an malls; none at Damao City (大茂城) | - | MANUAL |

Summary: 19 audited; 2 pin updates; 1 none; 4 MANUAL; 12 hold.

## Nanjing (14 gyms)
| id | gym | status (evidence) | pin vs Amap | action |
|---|---|---|---|---|
| seed-846 | MR.B X PARK Extreme Sports (Boulder) | MR.B X PARK Extreme Sports: no Amap climbing listing found; status unknown | - | MANUAL |
| seed-847 | SEEK ROCK CLIMBING (Xinyao Gemdale Plaza) | matched to Amap B0LDX59QE2 by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-848 | Blue Whale Climbing (Sun City) | matched to Amap B0K357KDES by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-849 | Blue Whale Climbing (Jiqingmen) | matched to Amap B0FFKO03Y0 by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-850 | Blue Whale Climbing (Hexi Zhongsheng) | matched to Amap B0IR05RTIK by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-851 | Kuanrun Climbing Gym | Kuanrun (宽润): no Amap listing found (the only Gulou hits are 傅抱石 museums); status unknown | - | MANUAL |
| seed-852 | MOJO Climbing | matched to Amap B0K25KHYAH by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-853 | Blue Whale Climbing (Yuejie Fantasy City) | matched to Amap B0MDCL3UC1 by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-854 | SEEK ROCK CLIMBING (Jiangbei Yinxianghui) | matched to Amap B0MBZXDE46 by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-855 | Outdoor Dream Factory Climbing Center | Outdoor Dream Factory (户外梦工厂): no Amap listing found; status unknown | - | MANUAL |
| seed-856 | Elephant Climbing | matched to Amap B0MUT7LCP7 by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-857 | Koolah Climbing | matched to Amap B0L6HHPPM5 by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-858 | Pulse Climbing | matched to Amap B0L0NUSJHY by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |
| seed-859 | SEEK ROCK CLIMBING (Nanyou Plaza/Xianlin) | matched to Amap B0LAARPS0G by brand/name and address; listing-detail read not done (browser stopped) | - | hold (detail read pending) |

Summary: 14 audited; 3 MANUAL; 11 hold.
