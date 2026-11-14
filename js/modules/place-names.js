// Extra names people search places by, whatever the interface language (search-index.js): a country in its own language and
// in Chinese, and every China city region in Chinese. Static, pure (no DOM, no appState). Standard names only; this is not a
// translation layer: the interface labels come from i18n (country.XX) and the map's region names stay as they are.
// A traveller types what they know: "成都" / "Chengdu", "日本" / "Japan", "한국" / "South Korea", "Deutschland" / "Germany".
// Simplified Chinese first, Traditional where it differs; English forms beyond the label only where people use them (UK, USA).
// To add a name, add it to the array; the test (tests/place-search.test.js) checks every code is a known country.

export const COUNTRY_NAMES = Object.freeze({
  AU: ['澳大利亚', '澳洲', '澳大利亞'], US: ['美国', '美國', 'United States of America', 'USA', 'America'], JP: ['日本', 'Nihon'],
  CA: ['加拿大'], NZ: ['新西兰', '紐西蘭', 'Aotearoa'], CN: ['中国', '中國', "People's Republic of China", 'PRC'],
  GB: ['英国', '英國', 'UK', 'Britain', 'Great Britain', 'England'], DE: ['Deutschland', '德国', '德國'], FR: ['法国', '法國'],
  SE: ['Sverige', '瑞典'], NL: ['Nederland', 'Holland', '荷兰', '荷蘭'], IT: ['Italia', '意大利', '義大利'],
  BE: ['België', 'Belgique', '比利时', '比利時'], KR: ['한국', '대한민국', '韩国', '韓國', 'Korea'], ES: ['España', '西班牙'],
  PT: ['葡萄牙'], AT: ['Österreich', '奥地利', '奧地利'], CH: ['Schweiz', 'Suisse', 'Svizzera', '瑞士'], PL: ['Polska', '波兰', '波蘭'],
  DK: ['Danmark', '丹麦', '丹麥'], FI: ['Suomi', '芬兰', '芬蘭'], IE: ['Éire', '爱尔兰', '愛爾蘭'], NO: ['Norge', '挪威'],
  MX: ['México', '墨西哥'], BR: ['Brasil', '巴西'], HU: ['Magyarország', '匈牙利'], GR: ['Ελλάδα', 'Hellas', '希腊', '希臘'],
  CZ: ['Česko', 'Czechia', 'Czech Republic', '捷克'], IS: ['Ísland', '冰岛', '冰島'], RO: ['România', '罗马尼亚', '羅馬尼亞'],
  HR: ['Hrvatska', '克罗地亚', '克羅地亞'], RU: ['Россия', '俄罗斯', '俄羅斯'], BG: ['България', '保加利亚', '保加利亞'],
  AR: ['阿根廷'], PH: ['Pilipinas', '菲律宾', '菲律賓'], CO: ['哥伦比亚', '哥倫比亞'], CL: ['智利'], VE: ['委内瑞拉', '委內瑞拉'],
  IN: ['Bharat', '印度'], IL: ['ישראל', '以色列'], ID: ['印度尼西亚', '印尼', '印度尼西亞'], TW: ['台湾', '臺灣', '台灣'],
  ZA: ['Suid-Afrika', '南非'], EC: ['厄瓜多尔', '厄瓜多爾'], VN: ['Việt Nam', '越南'], LT: ['Lietuva', '立陶宛'],
  RS: ['Srbija', 'Србија', '塞尔维亚', '塞爾維亞'], BO: ['玻利维亚', '玻利維亞'], IR: ['ایران', '伊朗'], EE: ['Eesti', '爱沙尼亚', '愛沙尼亞'],
  MY: ['马来西亚', '馬來西亞'], TH: ['ประเทศไทย', '泰国', '泰國'], UA: ['Україна', '乌克兰', '烏克蘭'], SK: ['Slovensko', '斯洛伐克'],
  CY: ['Κύπρος', 'Kıbrıs', '塞浦路斯'], PA: ['Panamá', '巴拿马', '巴拿馬'], PE: ['Perú', '秘鲁', '祕魯'], TR: ['Türkiye', 'Turkey', '土耳其'],
  LV: ['Latvija', '拉脱维亚', '拉脫維亞'], SG: ['Singapura', '新加坡'], BA: ['Bosna i Hercegovina', '波黑', '波斯尼亚和黑塞哥维那'],
  AD: ['安道尔', '安道爾'], AE: ['الإمارات', 'UAE', '阿联酋', '阿聯酋'], GE: ['საქართველო', '格鲁吉亚', '喬治亞'],
  LU: ['Lëtzebuerg', '卢森堡', '盧森堡'], SI: ['Slovenija', '斯洛文尼亚', '斯洛維尼亞'], KZ: ['Қазақстан', '哈萨克斯坦', '哈薩克'],
  CR: ['哥斯达黎加', '哥斯大黎加'], BY: ['Беларусь', '白俄罗斯', '白俄羅斯'], UY: ['乌拉圭', '烏拉圭'],
  SA: ['المملكة العربية السعودية', 'KSA', '沙特阿拉伯', '沙烏地阿拉伯'], HK: ['香港'], MO: ['澳门', '澳門', 'Macau', 'Macao'],
  EG: ['مصر', '埃及'], KE: ['肯尼亚', '肯亞'], QA: ['قطر', '卡塔尔', '卡達'], AM: ['Հայաստան', '亚美尼亚', '亞美尼亞'],
  LB: ['لبنان', '黎巴嫩'], JO: ['الأردن', '约旦', '約旦'], NP: ['नेपाल', '尼泊尔', '尼泊爾'], GT: ['危地马拉', '瓜地馬拉'],
  ME: ['Crna Gora', '黑山'], MN: ['Монгол', '蒙古'], OM: ['عُمان', '阿曼'], PY: ['巴拉圭'],
});

// China city regions (regions.js STATES_BY_COUNTRY.CN codes) in Simplified Chinese.
export const CN_CITY_NAMES = Object.freeze({
  BEIJING: '北京', CHANGCHUN: '长春', CHANGSHA: '长沙', CHANGZHOU: '常州', CHENGDU: '成都', CHONGQING: '重庆', DALI: '大理',
  DALIAN: '大连', DONGGUAN: '东莞', FOSHAN: '佛山', FUZHOU: '福州', GUANGZHOU: '广州', GUIYANG: '贵阳', HAIKOU: '海口',
  HANGZHOU: '杭州', HARBIN: '哈尔滨', HEFEI: '合肥', HOHHOT: '呼和浩特', JINAN: '济南', KUNMING: '昆明', LANZHOU: '兰州',
  LHASA: '拉萨', LIJIANG: '丽江', NANCHANG: '南昌', NANJING: '南京', NANNING: '南宁', NINGBO: '宁波', QINGDAO: '青岛',
  SANYA: '三亚', SHANGHAI: '上海', SHENYANG: '沈阳', SHENZHEN: '深圳', SHIJIAZHUANG: '石家庄', SUZHOU: '苏州', TAIYUAN: '太原',
  TIANJIN: '天津', URUMQI: '乌鲁木齐', WENZHOU: '温州', WUHAN: '武汉', WUXI: '无锡', XIAMEN: '厦门', XIAN: '西安',
  XINING: '西宁', YINCHUAN: '银川', ZHENGZHOU: '郑州', ZHONGSHAN: '中山', ZHUHAI: '珠海',
});
