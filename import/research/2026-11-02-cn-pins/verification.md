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
