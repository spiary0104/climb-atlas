# Chinese names still missing (worklist, 2026-11-22)

130 Chinese gyms have no `name_local` and no Amap match in `2026-11-02-cn-pins/verification.md`.
Owner decision 2026-11-22: the local LABELS (`name_local`, `address_local`) may come from the gym's Amap listing (cite `https://www.amap.com/place/<POI id>`)
or the 攀搭攀岩 WeChat mini program (plain-text source, e.g. "攀搭攀岩 mini program 岩馆探索, checked YYYY-MM-DD"); records that set anything else stay official-only
(`validate.js` LABEL_FIELDS / LABEL_MAP_HOSTS). Batches `2026-11-22-cn-names-amap-1/-2` filled 126 from existing matches.

How: search Amap (signed in, read-only) by the Chinese brand name + district in the gym's city; confirm the listing's address matches ours;
open it for the POI id; write label-only update records (fill-only, `expect_h` from the index). Leave a gym out when no listing clearly matches.
seed-564 (High Five Climbing Center, Jing'an) was matched to 酸爽攀岩 earlier, which does not correspond: re-check.

## SHANGHAI (35)
| id | name | address |
|---|---|---|
| seed-1764 | Howl Shanghai | B1, Changfeng Jiating International, 391 Yunling Dong Lu, by the sunken atrium, near Guangfu Xi Lu, Putuo District, Shanghai |
| seed-533 | Banana Climbing (Kerry Centre) | 218 Tianmuxi Rd, B1 B103-B104, Jiali Heji, Jing'an District, Shanghai |
| seed-534 | Banana Climbing (West Yan'an Road) | 658 Zhaohua Rd, Rooms 104-105, Changning District, Shanghai |
| seed-536 | Yanwu Kongjian (Rock Dance Space) | 128 Huayuan Rd, Block 1 Building A, Hongkou District, Shanghai |
| seed-538 | Benchmark Climbing Gym | 3612 Zhongshan North Rd, 3F Yincheng Building, Putuo District, Shanghai |
| seed-539 | Dayan Yuedong (Changfeng Joy City) | 196 Daduhe Rd, 5F, Changfeng Joy City, Putuo District, Shanghai |
| seed-540 | Climbing Factory | 855 West Changjiang Rd, Boxiuhui Creative Park Zone E, Baoshan District, Shanghai |
| seed-542 | Vmore Climbing (North Bund) | L104/105/106, AIA Financial Center, North Bund, Hongkou District, Shanghai |
| seed-547 | Panzhuxia Climbing (Jiangqiao Wanda) | Small atrium near Gate 6, 1F, Jiangqiao Wanda Plaza, Jiading District, Shanghai |
| seed-552 | 5+ Climbing (Songjiang Yunjian) | Bldg 15 West, Yunjian Grain Warehouse Creative Park, 327 Songhui East Rd, Songjiang District, Shanghai |
| seed-553 | TBW Extreme Sports Center (Parkour & Bouldering) | Unit 169, Bldg 1, 653 Yonghe East Rd, Jing'an District, Shanghai |
| seed-556 | Shanghai Cishan Climbing (North Bund Raffles) | Unit 30, 1F, Raffles North Bund, Hongkou District, Shanghai |
| seed-559 | Panxing Climbing (Nanqiao Bailian) | Bailian Nanqiao Shopping Mall, 588 Baiqi Rd, Fengxian District, Shanghai |
| seed-560 | Panzhuxia Climbing (Kangqiao New Field 360) | LG, New Field 360 Plaza, 668 Xiupu Rd, Kangqiao Town, Pudong New Area, Shanghai |
| seed-561 | HEY BOULDERING (Greenland Bund Center) | Shop LG204, Greenland Bund Center Chaofang, 800 Zhongshan South Rd Lane 21, Huangpu District, Shanghai |
| seed-563 | Upward Climbing (Sanlin Sports Park) | Unit 202, Bldg 15, Sanlin Sports Park, 485 Jiangyang South Rd, Gaojing Area, Baoshan District, Shanghai |
| seed-564 | High Five Climbing Center (Jing'an) | Unit L180, Bldg 2, 643 Yonghe East Rd, Jing'an District, Shanghai |
| seed-566 | Yanjie Climbing Sports Center | Bldg 6, Champion Plaza, 5101 Beizhai Rd, Minhang District, Shanghai |
| seed-568 | Panxing Climbing (Zhonghuan Bailian) | 1F, Bailian Zhonghuan Shopping Plaza, 1258 Zhenguang Rd, Putuo District, Shanghai |
| seed-570 | LE MONT Climbing Gym | 1200 Changqing Rd, Senghong Shopping Plaza, Sanlin Town, Pudong New Area, Shanghai |
| seed-573 | Kray Climbing Park | Bldg 7, 91 Yimei Rd, Meilong Town, Minhang District, Shanghai |
| seed-574 | Atrium Climbing Field (New World City) | 2-88 Nanjing West Rd, New World City, Huangpu District, Shanghai |
| seed-575 | Jungle Berry Camp | 528 Lingnan Rd, Chunxin Village, Chuansha New Town, Pudong New Area, Shanghai |
| seed-576 | Red Climb Experience Center (Pujiang City Life Plaza) | 1F, Pujiang City Life Plaza, 1850 Jiangyue Rd, Pujin Subdistrict, Minhang District, Shanghai |
| seed-577 | Beta Boulders (Jing'an) | Unit S1, 667 Changhua Rd, Jing'an District, Shanghai |
| seed-578 | Glacier Sports Climbing (Wanduhui) | F3, Wanduhui Plaza, 959 Xinnan Rd, Songjiang District, Shanghai |
| seed-580 | Panqing Sports (Jing'an) | 1F, north side of Heyi Bldg, Jing'an District, Shanghai |
| seed-584 | Kaiyuan Mediterranean Panxing Climbing | 1F north gate, Kaiyuan Mediterranean, New Songjiang Rd, Songjiang District, Shanghai |
| seed-587 | Red Gorilla Climbing | Bldg 26, Lane 833, Zhizaoju Rd, Huangpu District, Shanghai |
| seed-590 | HIGH5 Extreme Sports Center | 2F Unit 217, 555 Xiying South Rd, Qiantan area, Pudong New Area, Shanghai |
| seed-594 | U+ Climbing (Hengsheng Wanli Plaza) | 1F east entrance, Bldg 6B, Hengsheng Wanli Plaza, Gaoke East Rd, Pudong New Area, Shanghai |
| seed-595 | Little Champion Climbing (Bubugao) | 160m east of the Nanqiao Canal North Rd / Nanqiao Ring East Rd intersection, Fengxian District, Shanghai |
| seed-596 | Tongji University Climbing Gym (Siping Rd Campus) | 1239 Siping Rd, Tongji University Siping Rd Campus, Yangpu District, Shanghai |
| seed-599 | Shanyi Climbing | 228 Jiasong South Rd, Fangsong area, Songjiang District, Shanghai |
| seed-605 | Jibi Storm Climbing (Bailian Xijiao) | F1 near the BMW store entrance, 88 Xianxia West Rd, Bailian Xijiao Shopping Center, Changning District, Shanghai |

## BEIJING (21)
| id | name | address |
|---|---|---|
| seed-637 | Banana Climbing (Shangdi) | 58 Dongbeiwang West Rd, Shangke Office Community West Gate 1, Haidian District, Beijing |
| seed-640 | Aopan Climbing | Building C, Zhongguancun Science City Sijiqing Innovation Center, Haidian District, Beijing |
| seed-641 | Haoshi Sports Climbing Space | 5 Wanhong Rd, Lantao Center Building 7 Door 2, Chaoyang District, Beijing |
| seed-643 | BE1ST Sports Space (Wukesong Wanda Plaza) | 69 Fuxing Rd, Wukesong Wanda Plaza, Floor 3, Haidian District, Beijing |
| seed-645 | Beiding Aosen Climbing Eco Park | 33 Kehui Rd, Building 11, Chaoyang District, Beijing |
| seed-648 | Climb On Bouldering (COB) | 1 Caobali, Beitou Aoyuan 1314, Chaoyang District, Beijing |
| seed-657 | Aopan Climbing (Xihongmen) | 8 Xihongmen Xinwang North St, Hongkun Plaza Floor 1, Daxing District, Beijing |
| seed-660 | Yueshi Sports Climbing Space (Huamao) | 9 Qingheying South St, Huamao Tiandi Commercial St West District B1, Laiguangying, Chaoyang District, Beijing |
| seed-661 | Big Hand Climbing Gym (HuaLian BHG Mall) | HuaLian BHG Mall Floor 4, west of Tongzhou Beiyuan Metro Station (Line 1), Tongzhou District, Beijing |
| seed-662 | Planet Fitness Climbing | Hangxing Science and Technology Park, Heping Li East St, Dongcheng District, Beijing |
| seed-668 | Yaoyan Climbing (Shahe) | 1983 Creative Industry Park, Shahe, Changping District, Beijing |
| seed-669 | Wenshan Climbing Gym | 2 Yuquan Rd (North District) Building 8, Haidian District, Beijing |
| seed-670 | Sports Club Climbing (Beiqijia) | 103 Dingsi Rd, Guanhua Garden Phase 1 Building 4 Floor 1 Unit 103, Beiqijia Town, Changping District, Beijing |
| seed-675 | Aopan Climbing (Beijing Sport University) | Beijing Sport University Extreme Sports Center, 48 Information Rd, Haidian District, Beijing |
| seed-678 | Star Rock Bouldering | Tianyuan Heping Commercial Building Floor 2 Room 220, Heping Li Middle St, Dongcheng District, Beijing |
| seed-680 | Climbing Orangutan | Guoyuan Building 8, Unit 1-101-K-04, Fengtai District, Beijing |
| seed-681 | Yaoyan Climbing (Jinhui Port) | 3 Zhanqian St, Jinhui Port Floor 6, Shunyi District, Beijing |
| seed-684 | Zhongpan Alps Climbing Center | 1 Yaojiayuan Rd (Jia), Auto Trading Market Building 20 Floor 1 A21, Chaoyang District, Beijing |
| seed-687 | Renren Climbing (Lize) | Lize Gymnasium, intersection of Yupu Rd and Xiju Front St, Fengtai District, Beijing |
| seed-688 | Vitality Zone Sports Center | 188 Baotai Rd, Fengtai District, Beijing |
| seed-689 | Jishi Climbing | Liangxiang Sports Center Building 4, 26 Zhengtong Rd, Liangxiang, Fangshan District, Beijing |

## CHENGDU (17)
| id | name | address |
|---|---|---|
| seed-609 | ChillMountain Climbing | Keyuan South 2nd Rd, Yinjialin Creative Park F6-1, Wuhou District, Chengdu |
| seed-610 | Quantum Climbing | 12 Erxianqiao North 3rd Rd, Chenghua District, Chengdu |
| seed-612 | WEClimb Climbing Gym | 899 Tianjin Rd West Section, Shuangliu District, Chengdu |
| seed-615 | C7 Climbing Comprehensive Sports Hall | Huacai Rd, C7 Urban Sports Space, Jinjiang District, Chengdu |
| seed-616 | Chengshi Climbing | 5 Donghong West 5th Rd, Chenghua District, Chengdu |
| seed-620 | Big Pine Cone Motor Climbing Gym | 239 Jinshi Rd, Wenxuan Sports Building, Jinjiang District, Chengdu |
| seed-624 | Lezhidao City Sports Leisure Camp | 1 Wushunxi Rd, Longhu Chengdu North City Tianjie Floor 5, Jinniu District, Chengdu |
| seed-625 | Pink Rabbit Fitness Sports Hall | 2 Gaopan East Rd, Floor 2, Wuhou District, Chengdu |
| seed-626 | Qurui Climbing | Longhu Shangcheng Tianjie Basement 2, next to KFC, Jinniu District, Chengdu |
| seed-627 | Survivor Climbing Gym (Suning Plaza) | Lanrun Mall Center Floor 5, Qingyang District, Chengdu |
| seed-628 | Elephant Climbing Sports Hall | 28 Yushu Lane, Huaxi LIVE 528, Jinjiang District, Chengdu |
| seed-630 | Chengdu Weiming Climbing Wall | 272 Shijianian East Rd, Qingbaijiang District, Chengdu |
| seed-631 | Climbing Hero (North City Longhu Tianjie) | North City Longhu Tianjie Floor 3, Jinniu District, Chengdu |
| seed-632 | Chengdu Sport University Eastern Campus Climbing Gym | 1942 Sanchahu Ring Rd North, Chengdu Sport University Eastern New District Campus, Tianfu New Area, Chengdu |
| seed-633 | Mufeng Mountain Rock Climbing Base | 136 West St, Jinyuan Subdistrict, Dayi County, Chengdu |
| seed-634 | Climbing Hero (Shuangliu Wanda) | Wanda Plaza Atrium Floor 2, Shuangliu District, Chengdu |
| seed-635 | Bear Bear Climbing | 268 Huiyuan North Rd, Jinjiang District, Chengdu |

## SHENZHEN (13)
| id | name | address |
|---|---|---|
| seed-496 | Blue Sky Climbing (Nanshan) | 16 Langshan Rd, Huahan Innovation Park Building D Unit 1 D616, Xili, Nanshan District, Shenzhen |
| seed-500 | Pulan Sports (Shenzhen) | Yongxinhui Times Plaza, between Buildings 1-2, Basement Level B11, Nanshan District, Shenzhen |
| seed-501 | Bengbei Trendy Play (Longhua) | ICCai Park Building C5, Longhua District, Shenzhen |
| seed-504 | Yijiu Climbing Gym (Longhua Bookstore) | 1389 Longhua Ave, Longhua District, Shenzhen |
| seed-505 | Blue Sky Climbing (Luohu Yitian Holiday Plaza) | 1009 Aiguo Rd, Yitian Yulong Huafu Building 1 L2-04, Cuizhu, Luohu District, Shenzhen |
| seed-506 | Blue Sky Climbing (Shenye Shangcheng) | Lianhua Rd, Shenye Shangcheng, Futian District, Shenzhen |
| seed-508 | Triple Top Climbing Gym | Gaoxin South Ring Rd, Shenzhen Bay Tech Ecopark Building 10 Podium Floor 2 Unit 203, Yuehai, Nanshan District, Shenzhen |
| seed-509 | Blue Sky Climbing (Ledongli Cuiyuan Huafu) | 2068 Buxin Rd, Cuiyuan Huafu Building B 401, Dongxiao, Luohu District, Shenzhen |
| seed-511 | Climbing Orangutan (Longhua) | Yitian Holiday World, Longhua District, Shenzhen (80m walk from Exit D, Qinghu Metro Station) |
| seed-520 | Yanwu Kongjian Climbing (Jiayanghui) | Baijiahua Jiayanghui, Shajing, Bao'an District, Shenzhen |
| seed-524 | Yijiu Climbing Gym (Honghuashan Sports Center) | 35 Anfa Rd, Honghuashan Sports Center, Gongming, Guangming District, Shenzhen |
| seed-530 | Yijiu Climbing (Manfen Tiandi Shanshan Outlets) | 8 Yizhan 3rd Rd, Manfen Tiandi Shanshan Outlets L7, Songgang, Bao'an District, Shenzhen |
| seed-531 | Climbing Orangutan (Shuiwan) | Banxuegang Ave, next to Xiaochuanguo Hospital, near Exit E of Gangtou Metro Station, Nanshan District, Shenzhen |

## XIAN (12)
| id | name | address |
|---|---|---|
| seed-799 | DC Climbing |  |
| seed-800 | Huoshi Climbing (Rainbow Valley) |  |
| seed-801 | Lingzhongli Climbing (Taiyicheng) | Taiyicheng Living Center (south zone), 1F, Taiyi Rd, Beilin District, Xi'an |
| seed-802 | Duote Climbing (Dazhai Rd) | Qinyuan Bldg, ~320m southwest of the Dazhai Rd / Kunmingchi Rd intersection, Yanta District, Xi'an |
| seed-803 | Muyan Climbing |  |
| seed-804 | Jianshan Climbing |  |
| seed-805 | Red Point Climbing (Longhu Changle Tianjie) | Longhu Changle Tianjie, Wanshou Rd / Xinggong East Rd intersection, next to Xingfu Linlü Belt Park, Xincheng District, Xi'an |
| seed-807 | Duote Climbing (Dayuecheng) | Xi'an Dayuecheng, 3F, 66 Ci'en West Rd, Yanta District, Xi'an |
| seed-808 | Duote Climbing (Minleyuan) |  |
| seed-810 | Climbing Dream Factory (Lijiacun) | 3 Jianxi St, next to Pinge Kindergarten, Beilin District, Xi'an |
| seed-811 | Xi'an Seeyou Climbing Gym |  |
| seed-814 | Peter Rabbit Climbing (Damao City) |  |

## HANGZHOU (8)
| id | name | address |
|---|---|---|
| seed-714 | Banana Climbing (Raffles City) | 228 Xinye Rd, Raffles City Hangzhou T2-11F, Shangcheng District, Hangzhou |
| seed-715 | Banana Climbing (Xixi Tianjie) |  |
| seed-716 | Banana Climbing (Impression City Olympic) |  |
| seed-725 | Hangzhou Li-Ning Sports Park Climbing Gym | Li-Ning Sports Park (northwest corner), intersection of Jianhua Rd and Xintang Rd, Pengbu, Shangcheng District, Hangzhou |
| seed-729 | Climbing Orangutan (California Sunshine Kaiyuan Plaza) | 333 Jincheng Rd, California Sunshine Kaiyuan Plaza Floor 1, Xiaoshan District, Hangzhou |
| seed-731 | Dpump Climbing (Zhongda Intime City) | Zhongda Intime City Floor 7, Gongshu District, Hangzhou |
| seed-733 | Happy Climbing Gym (Qixianjun) | 800 Yunxi Rd, Room 101 Unit 2-1, Liangzhu, Yuhang District, Hangzhou |
| seed-734 | Zhejiang Construction Vocational College Training Field | Honghui Rd, Ningwei St, Xiaoshan District, Hangzhou |

## CHONGQING (6)
| id | name | address |
|---|---|---|
| seed-791 | Bashan Tiger Climbing Club | Nanping Yixiangcheng, Nan'an District, Chongqing |
| seed-795 | Zhongti · Bihuwang Climbing Gym | 17 Jianxin West Rd, Miao'ershi Creative Art District, Jiangbei District, Chongqing |
| seed-818 | Yichen Climbing (Beibei Wuyue Plaza) | Wuyue Plaza, 60 Liyuan Village, Tiansheng Subdistrict, Beibei District, Chongqing |
| seed-836 | Lichuan Climbing Gym |  |
| seed-837 | Gulang Climbing (Huanlehui) |  |
| seed-841 | Xiao Songshu Climbing |  |

## NANJING (6)
| id | name | address |
|---|---|---|
| seed-846 | MR.B X PARK Extreme Sports (Boulder) |  |
| seed-847 | SEEK ROCK CLIMBING (Xinyao Gemdale Plaza) | Xinyao Gemdale Plaza, ~130m east of Jinyao Huafu, Yaoshun Rd, Qixia District, Nanjing |
| seed-851 | Kuanrun Climbing Gym | B2, Kuanrun Sports, 12 Hunan Rd, Gulou District, Nanjing |
| seed-852 | MOJO Climbing | Rm 301-2, Bldg 7, Guochuangyuan, Qinhuai District, Nanjing |
| seed-855 | Outdoor Dream Factory Climbing Center |  |
| seed-857 | Koolah Climbing |  |

## TIANJIN (4)
| id | name | address |
|---|---|---|
| seed-776 | Dianfeng Climbing Gym |  |
| seed-781 | Rockway Climbing (Shuicheng) |  |
| seed-782 | Xingkong Climbing Gym (Liuyuan) | 2936 Chenchang Rd, Beichen District, Tianjin (near Liuyuan Metro Station, Line 1) |
| seed-790 | Rockway Climbing (Cuitong Rd) |  |

## WUHAN (3)
| id | name | address |
|---|---|---|
| seed-705 | Rock Climbing (Dongxihu) | Intersection of Bishui Ave and Hongtu 2nd Rd, Dongxihu District, Wuhan |
| seed-708 | Snow Leopard Climbing Gym | 1278 Heping Ave, Wuhan Qingshan Impression City Floor B2, Qingshan District, Wuhan |
| seed-709 | HICOME Climbing (Jiangteng) | Yingwu Rd, Jiangteng Plaza Building B Gate 9 Floor 1, Hanyang District, Wuhan |

## CHANGSHA (2)
| id | name | address |
|---|---|---|
| seed-711 | Banana Climbing (Zhujiang Star Ring) | 109 Fuyuan West Rd, Zhujiang Star Ring Mall L3-25A, Kaifu District, Changsha |
| seed-712 | Banana Climbing (Yuefang ID Mall) | 216 Pozi St, Tianxin District, Changsha |

## GUANGZHOU (2)
| id | name | address |
|---|---|---|
| seed-735 | Banana Climbing (Grantral Centre) |  |
| seed-746 | Qingtian Climbing (Caofangwei) | 4 Caofangwei, Jingcheng Caofangwei Cultural Creative Park Building 11 Floor 1, Haizhu District, Guangzhou |

## ZHUHAI (1)
| id | name | address |
|---|---|---|
| seed-755 | Banana Climbing (Le Shi) | 74 Daishan Rd, Xiangzhou District, Zhuhai |

