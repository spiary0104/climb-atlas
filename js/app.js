
(function(){

  const TYPE_COLORS = {'indoor-bouldering':'#3fb8a6','top-rope':'#8a6bb0','lead-climbing':'#4a90c9'};
  // `state` codes collide across countries (AU's WA = Western Australia, US's WA = Washington),
  // so country+state together identify a region — never key off `state` alone.
  // Every country here lists its REAL, COMPLETE set of top-level administrative
  // divisions (all 50 US states + DC, all 47 JP prefectures, etc.) — not just
  // the subset a prior seed-data pass happened to add spots in. This matters
  // for the add/edit-spot forms (`populateStateSelect()` below): a community
  // member proposing a gym in a state/province/prefecture with zero existing
  // spots still needs to be able to select it. Fixed 2026-09 after a report
  // that the Netherlands' dropdown only offered 3 of its 12 real provinces
  // (missing Noord-Brabant, the one actually asked about) — audited and fixed
  // for every country, not just NL. China (CN) is the one deliberate exception
  // to "real administrative divisions": it intentionally lists major cities,
  // not China's 34 provincial-level divisions (see `docs/architecture.md`
  // "Data model" for why) — expanded here from 10 to 31 major/provincial-
  // capital cities, still not exhaustive (China has 300+ prefecture-level
  // cities), just a much wider practical set than before.
  const STATES_BY_COUNTRY = {
    AU: [['NSW','NSW'],['VIC','VIC'],['QLD','QLD'],['WA','WA'],['SA','SA'],['ACT','ACT'],['TAS','TAS'],['NT','NT']],
    US: [['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],
         ['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],
         ['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],
         ['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],
         ['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],
         ['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],
         ['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],
         ['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],
         ['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],
         ['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming']],
    JP: [['AICHI','Aichi (Nagoya)'],['AKITA','Akita'],['AOMORI','Aomori'],['CHIBA','Chiba'],['EHIME','Ehime'],
         ['FUKUI','Fukui'],['FUKUOKA','Fukuoka'],['FUKUSHIMA','Fukushima'],['GIFU','Gifu'],['GUNMA','Gunma'],
         ['HIROSHIMA','Hiroshima'],['HOKKAIDO','Hokkaido (Sapporo)'],['HYOGO','Hyogo (Kobe)'],['IBARAKI','Ibaraki'],
         ['ISHIKAWA','Ishikawa'],['IWATE','Iwate'],['KAGAWA','Kagawa'],['KAGOSHIMA','Kagoshima'],
         ['KANAGAWA','Kanagawa (Yokohama)'],['KOCHI','Kochi'],['KUMAMOTO','Kumamoto'],['KYOTO','Kyoto'],
         ['MIE','Mie'],['MIYAGI','Miyagi'],['MIYAZAKI','Miyazaki'],['NAGANO','Nagano'],['NAGASAKI','Nagasaki'],
         ['NARA','Nara'],['NIIGATA','Niigata'],['OITA','Oita'],['OKAYAMA','Okayama'],['OKINAWA','Okinawa'],
         ['OSAKA','Osaka'],['SAGA','Saga'],['SAITAMA','Saitama'],['SHIGA','Shiga'],['SHIMANE','Shimane'],
         ['SHIZUOKA','Shizuoka'],['TOCHIGI','Tochigi'],['TOKUSHIMA','Tokushima'],['TOKYO','Tokyo'],
         ['TOTTORI','Tottori'],['TOYAMA','Toyama'],['WAKAYAMA','Wakayama'],['YAMAGATA','Yamagata'],
         ['YAMAGUCHI','Yamaguchi'],['YAMANASHI','Yamanashi']],
    CA: [['AB','Alberta'],['BC','British Columbia'],['MB','Manitoba'],['NB','New Brunswick'],
         ['NL','Newfoundland and Labrador'],['NT','Northwest Territories'],['NS','Nova Scotia'],['NU','Nunavut'],
         ['ON','Ontario'],['PE','Prince Edward Island'],['QC','Quebec'],['SK','Saskatchewan'],['YT','Yukon']],
    NZ: [['AUCKLAND','Auckland'],['BAY_OF_PLENTY','Bay of Plenty'],['CANTERBURY','Canterbury (Christchurch)'],
         ['GISBORNE','Gisborne'],['HAWKES_BAY',"Hawke's Bay"],['MANAWATU_WHANGANUI','Manawatu-Whanganui'],
         ['MARLBOROUGH','Marlborough'],['NELSON','Nelson'],['NORTHLAND','Northland'],['OTAGO','Otago'],
         ['SOUTHLAND','Southland'],['TARANAKI','Taranaki'],['TASMAN','Tasman'],['WAIKATO','Waikato'],
         ['WELLINGTON','Wellington'],['WEST_COAST','West Coast']],
    CN: [['BEIJING','Beijing'],['CHANGCHUN','Changchun'],['CHANGSHA','Changsha'],['CHENGDU','Chengdu'],
         ['CHONGQING','Chongqing'],['DALIAN','Dalian'],['FUZHOU','Fuzhou'],['GUANGZHOU','Guangzhou'],
         ['GUIYANG','Guiyang'],['HAIKOU','Haikou'],['HANGZHOU','Hangzhou'],['HARBIN','Harbin'],['HEFEI','Hefei'],
         ['JINAN','Jinan'],['KUNMING','Kunming'],['NANCHANG','Nanchang'],['NANJING','Nanjing'],
         ['NANNING','Nanning'],['NINGBO','Ningbo'],['QINGDAO','Qingdao'],['SHANGHAI','Shanghai'],
         ['SHENYANG','Shenyang'],['SHENZHEN','Shenzhen'],['SHIJIAZHUANG','Shijiazhuang'],['SUZHOU','Suzhou'],
         ['TIANJIN','Tianjin'],['WUHAN','Wuhan'],['XIAMEN','Xiamen'],['XIAN',"Xi'an"],['ZHENGZHOU','Zhengzhou'],
         ['ZHUHAI','Zhuhai']],
    GB: [['ENGLAND','England'],['SCOTLAND','Scotland'],['WALES','Wales'],['NORTHERN_IRELAND','Northern Ireland']],
    DE: [['BAYERN','Bayern'],['BERLIN','Berlin'],['NORDRHEIN_WESTFALEN','Nordrhein-Westfalen'],['HESSEN','Hessen'],
         ['BADEN_WURTTEMBERG','Baden-Württemberg'],['BREMEN','Bremen'],['SCHLESWIG_HOLSTEIN','Schleswig-Holstein'],
         ['SACHSEN','Sachsen'],['NIEDERSACHSEN','Niedersachsen'],['SACHSEN_ANHALT','Sachsen-Anhalt'],
         ['BRANDENBURG','Brandenburg'],['RHEINLAND_PFALZ','Rheinland-Pfalz'],['HAMBURG','Hamburg'],
         ['SAARLAND','Saarland'],['THURINGEN','Thüringen'],['MECKLENBURG_VORPOMMERN','Mecklenburg-Vorpommern']],
    FR: [['AUVERGNE_RHONE_ALPES','Auvergne-Rhône-Alpes (Lyon)'],['BOURGOGNE_FRANCHE_COMTE','Bourgogne-Franche-Comté'],
         ['BRETAGNE','Bretagne'],['CENTRE_VAL_DE_LOIRE','Centre-Val de Loire'],['CORSE','Corse'],
         ['GRAND_EST','Grand Est'],['HAUTS_DE_FRANCE','Hauts-de-France'],['ILE_DE_FRANCE','Île-de-France (Paris)'],
         ['NORMANDIE','Normandie'],['NOUVELLE_AQUITAINE','Nouvelle-Aquitaine'],['OCCITANIE','Occitanie (Toulouse)'],
         ['PAYS_DE_LA_LOIRE','Pays de la Loire'],['PACA',"Provence-Alpes-Côte d'Azur (Marseille)"]],
    SE: [['BLEKINGE','Blekinge'],['DALARNA','Dalarna'],['GAVLEBORG','Gävleborg'],['GOTLAND','Gotland'],
         ['HALLAND','Halland'],['JAMTLAND','Jämtland'],['JONKOPING','Jönköping'],['KALMAR','Kalmar'],
         ['KRONOBERG','Kronoberg'],['NORRBOTTEN','Norrbotten'],['OREBRO','Örebro'],['OSTERGOTLAND','Östergötland'],
         ['SKANE','Skåne (Malmö)'],['SODERMANLAND','Södermanland'],['STOCKHOLM','Stockholm'],['UPPSALA','Uppsala'],
         ['VARMLAND','Värmland'],['VASTERBOTTEN','Västerbotten'],['VASTERNORRLAND','Västernorrland'],
         ['VASTMANLAND','Västmanland'],['VASTRA_GOTALAND','Västra Götaland (Göteborg)']],
    NL: [['DRENTHE','Drenthe'],['FLEVOLAND','Flevoland'],['FRIESLAND','Friesland (Fryslân)'],
         ['GELDERLAND','Gelderland'],['GRONINGEN','Groningen'],['LIMBURG','Limburg'],
         ['NOORD_BRABANT','Noord-Brabant'],['NOORD_HOLLAND','Noord-Holland (Amsterdam)'],['OVERIJSSEL','Overijssel'],
         ['UTRECHT','Utrecht'],['ZEELAND','Zeeland'],['ZUID_HOLLAND','Zuid-Holland (Den Haag, Rotterdam)']],
    IT: [['ABRUZZO','Abruzzo'],['BASILICATA','Basilicata'],['CALABRIA','Calabria'],['CAMPANIA','Campania'],
         ['EMILIA_ROMAGNA','Emilia-Romagna (Modena)'],['FRIULI_VENEZIA_GIULIA','Friuli-Venezia Giulia'],
         ['LAZIO','Lazio (Roma)'],['LIGURIA','Liguria'],['LOMBARDIA','Lombardia (Milano)'],['MARCHE','Marche'],
         ['MOLISE','Molise'],['PIEMONTE','Piemonte'],['PUGLIA','Puglia'],['SARDEGNA','Sardegna'],
         ['SICILIA','Sicilia'],['TOSCANA','Toscana (Firenze)'],['TRENTINO_ALTO_ADIGE','Trentino-Alto Adige'],
         ['UMBRIA','Umbria'],['VALLE_DAOSTA',"Valle d'Aosta"],['VENETO','Veneto']],
    BE: [['FLANDERS','Flanders'],['WALLONIA','Wallonia'],['BRUSSELS','Brussels-Capital']],
    KR: [['SEOUL','Seoul'],['BUSAN','Busan'],['GYEONGGI','Gyeonggi-do'],['GWANGJU','Gwangju'],
         ['GYEONGSANGNAM','Gyeongsangnam-do'],['ULSAN','Ulsan'],['INCHEON','Incheon'],['DAEGU','Daegu'],
         ['JEOLLANAM','Jeollanam-do'],['CHUNGCHEONGNAM','Chungcheongnam-do']],
    ES: [['ANDALUCIA','Andalucía'],['ARAGON','Aragón'],['ASTURIAS','Asturias'],['BALEARES','Baleares'],
         ['CANARIAS','Canarias'],['CANTABRIA','Cantabria'],['CASTILLA_LA_MANCHA','Castilla-La Mancha'],
         ['CASTILLA_Y_LEON','Castilla y León'],['CATALUNYA','Cataluña (Barcelona)'],['CEUTA','Ceuta'],
         ['MADRID','Comunidad de Madrid'],['COMUNIDAD_VALENCIANA','Comunidad Valenciana'],
         ['EXTREMADURA','Extremadura'],['GALICIA','Galicia'],['LA_RIOJA','La Rioja'],['MELILLA','Melilla'],
         ['MURCIA','Murcia'],['NAVARRA','Navarra'],['PAIS_VASCO','País Vasco']],
    PT: [['ACORES','Açores'],['AVEIRO','Aveiro'],['BEJA','Beja'],['BRAGA','Braga'],['BRAGANCA','Bragança'],
         ['CASTELO_BRANCO','Castelo Branco'],['COIMBRA','Coimbra'],['EVORA','Évora'],['FARO','Faro'],
         ['GUARDA','Guarda'],['LEIRIA','Leiria'],['LISBOA','Lisboa'],['MADEIRA','Madeira'],
         ['PORTALEGRE','Portalegre'],['PORTO','Porto'],['SANTAREM','Santarém'],['SETUBAL','Setúbal'],
         ['VIANA_DO_CASTELO','Viana do Castelo'],['VILA_REAL','Vila Real'],['VISEU','Viseu']],
    AT: [['BURGENLAND','Burgenland'],['KARNTEN','Kärnten'],['NIEDEROSTERREICH','Niederösterreich'],
         ['OBEROSTERREICH','Oberösterreich (Linz)'],['SALZBURG','Salzburg'],['STEIERMARK','Steiermark (Graz)'],
         ['TIROL','Tirol'],['VORARLBERG','Vorarlberg'],['WIEN','Wien']],
    CH: [['AARGAU','Aargau'],['APPENZELL_AUSSERRHODEN','Appenzell Ausserrhoden'],
         ['APPENZELL_INNERRHODEN','Appenzell Innerrhoden'],['BASEL_LANDSCHAFT','Basel-Landschaft'],
         ['BASEL_STADT','Basel-Stadt (Basel)'],['BERN','Bern'],['FRIBOURG','Fribourg'],['GENEVE','Genève'],
         ['GLARUS','Glarus'],['GRAUBUNDEN','Graubünden'],['JURA','Jura'],['LUZERN','Luzern'],
         ['NEUCHATEL','Neuchâtel'],['NIDWALDEN','Nidwalden'],['OBWALDEN','Obwalden'],
         ['SCHAFFHAUSEN','Schaffhausen'],['SCHWYZ','Schwyz'],['SOLOTHURN','Solothurn'],['ST_GALLEN','St. Gallen'],
         ['THURGAU','Thurgau'],['TICINO','Ticino'],['URI','Uri'],['VALAIS','Valais'],['VAUD','Vaud'],
         ['ZUG','Zug'],['ZURICH','Zürich (Winterthur)']],
    PL: [['DOLNOSLASKIE','Dolnośląskie (Wrocław)'],['KUJAWSKO_POMORSKIE','Kujawsko-Pomorskie'],
         ['LUBELSKIE','Lubelskie'],['LUBUSKIE','Lubuskie'],['LODZKIE','Łódzkie'],
         ['MALOPOLSKIE','Małopolskie (Kraków)'],['MAZOWIECKIE','Mazowieckie (Warszawa)'],['OPOLSKIE','Opolskie'],
         ['PODKARPACKIE','Podkarpackie'],['PODLASKIE','Podlaskie'],['POMORSKIE','Pomorskie'],
         ['SLASKIE','Śląskie'],['SWIETOKRZYSKIE','Świętokrzyskie'],
         ['WARMINSKO_MAZURSKIE','Warmińsko-Mazurskie'],['WIELKOPOLSKIE','Wielkopolskie (Poznań)'],
         ['ZACHODNIOPOMORSKIE','Zachodniopomorskie']],
    DK: [['HOVEDSTADEN','Hovedstaden (København)'],['MIDTJYLLAND','Midtjylland (Aarhus)'],
         ['NORDJYLLAND','Nordjylland (Aalborg)'],['SJAELLAND','Sjælland'],['SYDDANMARK','Syddanmark (Odense)']],
    FI: [['AHVENANMAA','Ahvenanmaa'],['ETELA_KARJALA','Etelä-Karjala'],['ETELA_POHJANMAA','Etelä-Pohjanmaa'],
         ['ETELA_SAVO','Etelä-Savo'],['KAINUU','Kainuu'],['KANTA_HAME','Kanta-Häme'],
         ['KESKI_POHJANMAA','Keski-Pohjanmaa'],['KESKI_SUOMI','Keski-Suomi'],['KYMENLAAKSO','Kymenlaakso'],
         ['LAPPI','Lappi'],['PIRKANMAA','Pirkanmaa (Tampere)'],['POHJANMAA','Pohjanmaa'],
         ['POHJOIS_KARJALA','Pohjois-Karjala'],['POHJOIS_POHJANMAA','Pohjois-Pohjanmaa (Oulu)'],
         ['POHJOIS_SAVO','Pohjois-Savo'],['PAIJAT_HAME','Päijät-Häme (Lahti)'],['SATAKUNTA','Satakunta'],
         ['UUSIMAA','Uusimaa (Helsinki)'],['VARSINAIS_SUOMI','Varsinais-Suomi']],
    IE: [['CARLOW','Carlow'],['CAVAN','Cavan'],['CLARE','Clare'],['CORK','Cork'],['DONEGAL','Donegal'],
         ['DUBLIN','Dublin'],['GALWAY','Galway'],['KERRY','Kerry'],['KILDARE','Kildare'],['KILKENNY','Kilkenny'],
         ['LAOIS','Laois'],['LEITRIM','Leitrim'],['LIMERICK','Limerick'],['LONGFORD','Longford'],
         ['LOUTH','Louth'],['MAYO','Mayo'],['MEATH','Meath'],['MONAGHAN','Monaghan'],['OFFALY','Offaly'],
         ['ROSCOMMON','Roscommon'],['SLIGO','Sligo'],['TIPPERARY','Tipperary'],['WATERFORD','Waterford'],
         ['WESTMEATH','Westmeath'],['WEXFORD','Wexford'],['WICKLOW','Wicklow']],
    NO: [['AGDER','Agder (Kristiansand)'],['AKERSHUS','Akershus'],['BUSKERUD','Buskerud (Hemsedal)'],
         ['FINNMARK','Finnmark'],['INNLANDET','Innlandet (Lillehammer)'],
         ['MORE_OG_ROMSDAL','Møre og Romsdal (Ålesund, Kristiansund)'],['NORDLAND','Nordland (Bodø)'],
         ['OSLO','Oslo'],['ROGALAND','Rogaland (Stavanger)'],['TELEMARK','Telemark (Skien)'],
         ['TROMS','Troms'],['TRONDELAG','Trøndelag (Trondheim)'],['VESTFOLD','Vestfold'],
         ['VESTLAND','Vestland (Bergen)'],['OSTFOLD','Østfold']],
    MX: [['AGUASCALIENTES','Aguascalientes'],['BAJA_CALIFORNIA','Baja California'],
         ['BAJA_CALIFORNIA_SUR','Baja California Sur'],['CAMPECHE','Campeche'],['CHIAPAS','Chiapas'],
         ['CHIHUAHUA','Chihuahua'],['CIUDAD_DE_MEXICO','Ciudad de México'],['COAHUILA','Coahuila'],
         ['COLIMA','Colima'],['DURANGO','Durango'],['GUANAJUATO','Guanajuato'],['GUERRERO','Guerrero'],
         ['HIDALGO','Hidalgo'],['JALISCO','Jalisco (Zapopan)'],['MEXICO','México (Toluca)'],
         ['MICHOACAN','Michoacán'],['MORELOS','Morelos'],['NAYARIT','Nayarit'],
         ['NUEVO_LEON','Nuevo León (Monterrey)'],['OAXACA','Oaxaca'],['PUEBLA','Puebla'],
         ['QUERETARO','Querétaro'],['QUINTANA_ROO','Quintana Roo'],['SAN_LUIS_POTOSI','San Luis Potosí'],
         ['SINALOA','Sinaloa'],['SONORA','Sonora'],['TABASCO','Tabasco'],['TAMAULIPAS','Tamaulipas'],
         ['TLAXCALA','Tlaxcala'],['VERACRUZ','Veracruz'],['YUCATAN','Yucatán'],['ZACATECAS','Zacatecas']],
    BR: [['ACRE','Acre'],['ALAGOAS','Alagoas'],['AMAPA','Amapá'],['AMAZONAS','Amazonas'],['BAHIA','Bahia'],
         ['CEARA','Ceará'],['DISTRITO_FEDERAL','Distrito Federal'],['ESPIRITO_SANTO','Espírito Santo'],
         ['GOIAS','Goiás'],['MARANHAO','Maranhão'],['MATO_GROSSO','Mato Grosso'],
         ['MATO_GROSSO_DO_SUL','Mato Grosso do Sul'],['MINAS_GERAIS','Minas Gerais (Belo Horizonte)'],
         ['PARA','Pará'],['PARAIBA','Paraíba'],['PARANA','Paraná (Curitiba)'],['PERNAMBUCO','Pernambuco'],
         ['PIAUI','Piauí'],['RIO_DE_JANEIRO','Rio de Janeiro'],['RIO_GRANDE_DO_NORTE','Rio Grande do Norte'],
         ['RIO_GRANDE_DO_SUL','Rio Grande do Sul'],['RONDONIA','Rondônia'],['RORAIMA','Roraima'],
         ['SANTA_CATARINA','Santa Catarina'],['SAO_PAULO','São Paulo'],['SERGIPE','Sergipe'],
         ['TOCANTINS','Tocantins']],
    HU: [['BACS_KISKUN','Bács-Kiskun'],['BARANYA','Baranya'],['BEKES','Békés'],
         ['BORSOD_ABAUJ_ZEMPLEN','Borsod-Abaúj-Zemplén'],['BUDAPEST','Budapest'],
         ['CSONGRAD_CSANAD','Csongrád-Csanád'],['FEJER','Fejér'],['GYOR_MOSON_SOPRON','Győr-Moson-Sopron'],
         ['HAJDU_BIHAR','Hajdú-Bihar'],['HEVES','Heves'],['JASZ_NAGYKUN_SZOLNOK','Jász-Nagykun-Szolnok'],
         ['KOMAROM_ESZTERGOM','Komárom-Esztergom'],['NOGRAD','Nógrád'],['PEST','Pest'],['SOMOGY','Somogy'],
         ['SZABOLCS_SZATMAR_BEREG','Szabolcs-Szatmár-Bereg'],['TOLNA','Tolna'],['VAS','Vas'],
         ['VESZPREM','Veszprém'],['ZALA','Zala']],
    GR: [['ATTICA','Attica'],['CENTRAL_GREECE','Central Greece'],['CENTRAL_MACEDONIA','Central Macedonia'],
         ['CRETE','Crete'],['EASTERN_MACEDONIA_THRACE','Eastern Macedonia and Thrace'],['EPIRUS','Epirus'],
         ['IONIAN_ISLANDS','Ionian Islands'],['NORTH_AEGEAN','North Aegean'],['PELOPONNESE','Peloponnese'],
         ['SOUTH_AEGEAN','South Aegean'],['THESSALY','Thessaly'],['WESTERN_GREECE','Western Greece'],
         ['WESTERN_MACEDONIA','Western Macedonia']],
    CZ: [['JIHOCESKY','Jihočeský (South Bohemia)'],['JIHOMORAVSKY','Jihomoravský (South Moravia)'],
         ['KARLOVARSKY','Karlovarský'],['KRALOVEHRADECKY','Královéhradecký'],['LIBERECKY','Liberecký'],
         ['MORAVSKOSLEZSKY','Moravskoslezský'],['OLOMOUCKY','Olomoucký'],['PARDUBICKY','Pardubický'],
         ['PLZENSKY','Plzeňský'],['PRAHA','Praha (Prague)'],['STREDOCESKY','Středočeský'],
         ['USTECKY','Ústecký'],['VYSOCINA','Vysočina'],['ZLINSKY','Zlínský']],
    IS: [['AUSTURLAND','Austurland (East)'],['HOFUDBORGARSVAEDID','Höfuðborgarsvæðið (Capital Region)'],
         ['NORDURLAND_EYSTRA','Norðurland eystra (Northeast)'],['NORDURLAND_VESTRA','Norðurland vestra (Northwest)'],
         ['SUDURLAND','Suðurland (South)'],['SUDURNES','Suðurnes'],['VESTFIRDIR','Vestfirðir (Westfjords)'],
         ['VESTURLAND','Vesturland (West)']],
    RO: [['ALBA','Alba'],['ARAD','Arad'],['ARGES','Argeș'],['BACAU','Bacău'],['BIHOR','Bihor'],
         ['BISTRITA_NASAUD','Bistrița-Năsăud'],['BOTOSANI','Botoșani'],['BRAILA','Brăila'],['BRASOV','Brașov'],
         ['BUCURESTI','București'],['BUZAU','Buzău'],['CALARASI','Călărași'],['CARAS_SEVERIN','Caraș-Severin'],
         ['CLUJ','Cluj'],['CONSTANTA','Constanța'],['COVASNA','Covasna'],['DAMBOVITA','Dâmbovița'],
         ['DOLJ','Dolj'],['GALATI','Galați'],['GIURGIU','Giurgiu'],['GORJ','Gorj'],['HARGHITA','Harghita'],
         ['HUNEDOARA','Hunedoara'],['IALOMITA','Ialomița'],['IASI','Iași'],['ILFOV','Ilfov'],
         ['MARAMURES','Maramureș'],['MEHEDINTI','Mehedinți'],['MURES','Mureș'],['NEAMT','Neamț'],
         ['OLT','Olt'],['PRAHOVA','Prahova'],['SALAJ','Sălaj'],['SATU_MARE','Satu Mare'],['SIBIU','Sibiu'],
         ['SUCEAVA','Suceava'],['TELEORMAN','Teleorman'],['TIMIS','Timiș'],['TULCEA','Tulcea'],
         ['VALCEA','Vâlcea'],['VASLUI','Vaslui'],['VRANCEA','Vrancea']],
    HR: [['BJELOVAR_BILOGORA','Bjelovar-Bilogora'],['BROD_POSAVINA','Brod-Posavina'],
         ['DUBROVNIK_NERETVA','Dubrovnik-Neretva'],['ISTARSKA','Istarska'],['KARLOVAC','Karlovac'],
         ['KOPRIVNICKO_KRIZEVACKA','Koprivničko-križevačka'],['KRAPINA_ZAGORJE','Krapina-Zagorje'],
         ['LIKA_SENJ','Lika-Senj'],['MEDIMURJE','Međimurje'],['OSIJEK_BARANJA','Osijek-Baranja'],
         ['POZEGA_SLAVONIJA','Požega-Slavonija'],['PRIMORJE_GORSKI_KOTAR','Primorje-Gorski Kotar'],
         ['SIBENIK_KNIN','Šibenik-Knin'],['SISAK_MOSLAVINA','Sisak-Moslavina'],
         ['SPLITSKO_DALMATINSKA','Splitsko-dalmatinska'],['VARAZDIN','Varaždin'],
         ['VIROVITICA_PODRAVINA','Virovitica-Podravina'],['VUKOVAR_SRIJEM','Vukovar-Srijem'],['ZADAR','Zadar'],
         ['ZAGREBACKA','Zagrebačka'],['ZAGREB','Zagreb']],
    RU: [['MOSKVA','Moskva'],['SANKT_PETERBURG','Sankt-Peterburg'],['NOVOSIBIRSK','Novosibirsk'],
         ['YEKATERINBURG','Yekaterinburg'],['KAZAN','Kazan'],['NIZHNY_NOVGOROD','Nizhny Novgorod'],
         ['CHELYABINSK','Chelyabinsk'],['KRASNOYARSK','Krasnoyarsk'],['SAMARA','Samara'],['UFA','Ufa'],
         ['ROSTOV_ON_DON','Rostov-on-Don'],['OMSK','Omsk'],['KRASNODAR','Krasnodar'],['VORONEZH','Voronezh'],
         ['PERM','Perm'],['VOLGOGRAD','Volgograd'],['SARATOV','Saratov'],['TYUMEN','Tyumen'],
         ['TOLYATTI','Tolyatti'],['IZHEVSK','Izhevsk']],
    BG: [['BLAGOEVGRAD','Blagoevgrad'],['BURGAS','Burgas'],['DOBRICH','Dobrich'],['GABROVO','Gabrovo'],
         ['HASKOVO','Haskovo'],['KARDZHALI','Kardzhali'],['KYUSTENDIL','Kyustendil'],['LOVECH','Lovech'],
         ['MONTANA','Montana'],['PAZARDZHIK','Pazardzhik'],['PERNIK','Pernik'],['PLEVEN','Pleven'],
         ['PLOVDIV','Plovdiv'],['RAZGRAD','Razgrad'],['RUSE','Ruse'],['SHUMEN','Shumen'],
         ['SILISTRA','Silistra'],['SLIVEN','Sliven'],['SMOLYAN','Smolyan'],['SOFIA_CITY','Sofia City'],
         ['SOFIA','Sofia (province)'],['STARA_ZAGORA','Stara Zagora'],['TARGOVISHTE','Targovishte'],
         ['VARNA','Varna'],['VELIKO_TARNOVO','Veliko Tarnovo'],['VIDIN','Vidin'],['VRATSA','Vratsa'],
         ['YAMBOL','Yambol']],
    AR: [['BUENOS_AIRES','Buenos Aires'],['CABA','Ciudad Autónoma de Buenos Aires'],['CATAMARCA','Catamarca'],
         ['CHACO','Chaco'],['CHUBUT','Chubut'],['CORDOBA','Córdoba'],['CORRIENTES','Corrientes'],
         ['ENTRE_RIOS','Entre Ríos'],['FORMOSA','Formosa'],['JUJUY','Jujuy'],['LA_PAMPA','La Pampa'],
         ['LA_RIOJA','La Rioja'],['MENDOZA','Mendoza'],['MISIONES','Misiones'],['NEUQUEN','Neuquén'],
         ['RIO_NEGRO','Río Negro'],['SALTA','Salta'],['SAN_JUAN','San Juan'],['SAN_LUIS','San Luis'],
         ['SANTA_CRUZ','Santa Cruz'],['SANTA_FE','Santa Fe'],['SANTIAGO_DEL_ESTERO','Santiago del Estero'],
         ['TIERRA_DEL_FUEGO','Tierra del Fuego'],['TUCUMAN','Tucumán']],
    PH: [['NCR','National Capital Region (Metro Manila)'],['ABRA','Abra'],['AGUSAN_DEL_NORTE','Agusan del Norte'],
         ['AGUSAN_DEL_SUR','Agusan del Sur'],['AKLAN','Aklan'],['ALBAY','Albay'],['ANTIQUE','Antique'],
         ['APAYAO','Apayao'],['AURORA','Aurora'],['BASILAN','Basilan'],['BATAAN','Bataan'],['BATANES','Batanes'],
         ['BATANGAS','Batangas'],['BENGUET','Benguet'],['BILIRAN','Biliran'],['BOHOL','Bohol'],
         ['BUKIDNON','Bukidnon'],['BULACAN','Bulacan'],['CAGAYAN','Cagayan'],['CAMARINES_NORTE','Camarines Norte'],
         ['CAMARINES_SUR','Camarines Sur'],['CAMIGUIN','Camiguin'],['CAPIZ','Capiz'],['CATANDUANES','Catanduanes'],
         ['CAVITE','Cavite'],['CEBU','Cebu'],['COTABATO','Cotabato'],['DAVAO_DE_ORO','Davao de Oro'],
         ['DAVAO_DEL_NORTE','Davao del Norte'],['DAVAO_DEL_SUR','Davao del Sur'],['DAVAO_OCCIDENTAL','Davao Occidental'],
         ['DAVAO_ORIENTAL','Davao Oriental'],['DINAGAT_ISLANDS','Dinagat Islands'],['EASTERN_SAMAR','Eastern Samar'],
         ['GUIMARAS','Guimaras'],['IFUGAO','Ifugao'],['ILOCOS_NORTE','Ilocos Norte'],['ILOCOS_SUR','Ilocos Sur'],
         ['ILOILO','Iloilo'],['ISABELA','Isabela'],['KALINGA','Kalinga'],['LA_UNION','La Union'],['LAGUNA','Laguna'],
         ['LANAO_DEL_NORTE','Lanao del Norte'],['LANAO_DEL_SUR','Lanao del Sur'],['LEYTE','Leyte'],
         ['MAGUINDANAO_DEL_NORTE','Maguindanao del Norte'],['MAGUINDANAO_DEL_SUR','Maguindanao del Sur'],
         ['MARINDUQUE','Marinduque'],['MASBATE','Masbate'],['MISAMIS_OCCIDENTAL','Misamis Occidental'],
         ['MISAMIS_ORIENTAL','Misamis Oriental'],['MOUNTAIN_PROVINCE','Mountain Province'],
         ['NEGROS_OCCIDENTAL','Negros Occidental'],['NEGROS_ORIENTAL','Negros Oriental'],
         ['NORTHERN_SAMAR','Northern Samar'],['NUEVA_ECIJA','Nueva Ecija'],['NUEVA_VIZCAYA','Nueva Vizcaya'],
         ['OCCIDENTAL_MINDORO','Occidental Mindoro'],['ORIENTAL_MINDORO','Oriental Mindoro'],['PALAWAN','Palawan'],
         ['PAMPANGA','Pampanga'],['PANGASINAN','Pangasinan'],['QUEZON','Quezon'],['QUIRINO','Quirino'],
         ['RIZAL','Rizal'],['ROMBLON','Romblon'],['SAMAR','Samar'],['SARANGANI','Sarangani'],['SIQUIJOR','Siquijor'],
         ['SORSOGON','Sorsogon'],['SOUTH_COTABATO','South Cotabato'],['SOUTHERN_LEYTE','Southern Leyte'],
         ['SULTAN_KUDARAT','Sultan Kudarat'],['SULU','Sulu'],['SURIGAO_DEL_NORTE','Surigao del Norte'],
         ['SURIGAO_DEL_SUR','Surigao del Sur'],['TARLAC','Tarlac'],['TAWI_TAWI','Tawi-Tawi'],['ZAMBALES','Zambales'],
         ['ZAMBOANGA_DEL_NORTE','Zamboanga del Norte'],['ZAMBOANGA_DEL_SUR','Zamboanga del Sur'],
         ['ZAMBOANGA_SIBUGAY','Zamboanga Sibugay']],
    CO: [['AMAZONAS','Amazonas'],['ANTIOQUIA','Antioquia'],['ARAUCA','Arauca'],['ATLANTICO','Atlántico'],
         ['BOGOTA_DC','Bogotá D.C.'],['BOLIVAR','Bolívar'],['BOYACA','Boyacá'],['CALDAS','Caldas'],
         ['CAQUETA','Caquetá'],['CASANARE','Casanare'],['CAUCA','Cauca'],['CESAR','Cesar'],['CHOCO','Chocó'],
         ['CORDOBA','Córdoba'],['CUNDINAMARCA','Cundinamarca'],['GUAINIA','Guainía'],['GUAVIARE','Guaviare'],
         ['HUILA','Huila'],['LA_GUAJIRA','La Guajira'],['MAGDALENA','Magdalena'],['META','Meta'],
         ['NARINO','Nariño'],['NORTE_DE_SANTANDER','Norte de Santander'],['PUTUMAYO','Putumayo'],
         ['QUINDIO','Quindío'],['RISARALDA','Risaralda'],['SAN_ANDRES_Y_PROVIDENCIA','San Andrés y Providencia'],
         ['SANTANDER','Santander'],['SUCRE','Sucre'],['TOLIMA','Tolima'],['VALLE_DEL_CAUCA','Valle del Cauca'],
         ['VAUPES','Vaupés'],['VICHADA','Vichada']],
    CL: [['ARICA_Y_PARINACOTA','Arica y Parinacota'],['TARAPACA','Tarapacá'],['ANTOFAGASTA','Antofagasta'],
         ['ATACAMA','Atacama'],['COQUIMBO','Coquimbo'],['VALPARAISO','Valparaíso'],
         ['METROPOLITANA','Metropolitana de Santiago'],['LIBERTADOR_OHIGGINS',"Libertador General Bernardo O'Higgins"],
         ['MAULE','Maule'],['NUBLE','Ñuble'],['BIOBIO','Biobío'],['ARAUCANIA','La Araucanía'],
         ['LOS_RIOS','Los Ríos'],['LOS_LAGOS','Los Lagos'],['AYSEN','Aysén'],
         ['MAGALLANES','Magallanes y de la Antártica Chilena']],
    VE: [['AMAZONAS','Amazonas'],['ANZOATEGUI','Anzoátegui'],['APURE','Apure'],['ARAGUA','Aragua'],
         ['BARINAS','Barinas'],['BOLIVAR','Bolívar'],['CARABOBO','Carabobo'],['COJEDES','Cojedes'],
         ['DELTA_AMACURO','Delta Amacuro'],['DISTRITO_CAPITAL','Distrito Capital'],['FALCON','Falcón'],
         ['GUARICO','Guárico'],['LARA','Lara'],['LA_GUAIRA','La Guaira'],['MERIDA','Mérida'],
         ['MIRANDA','Miranda'],['MONAGAS','Monagas'],['NUEVA_ESPARTA','Nueva Esparta'],
         ['PORTUGUESA','Portuguesa'],['SUCRE','Sucre'],['TACHIRA','Táchira'],['TRUJILLO','Trujillo'],
         ['YARACUY','Yaracuy'],['ZULIA','Zulia']],
    IN: [['ANDAMAN_AND_NICOBAR','Andaman and Nicobar Islands'],['ANDHRA_PRADESH','Andhra Pradesh'],
         ['ARUNACHAL_PRADESH','Arunachal Pradesh'],['ASSAM','Assam'],['BIHAR','Bihar'],
         ['CHANDIGARH','Chandigarh'],['CHHATTISGARH','Chhattisgarh'],
         ['DADRA_NAGAR_HAVELI_DAMAN_DIU','Dadra and Nagar Haveli and Daman and Diu'],['DELHI','Delhi (NCT)'],
         ['GOA','Goa'],['GUJARAT','Gujarat'],['HARYANA','Haryana'],['HIMACHAL_PRADESH','Himachal Pradesh'],
         ['JAMMU_AND_KASHMIR','Jammu and Kashmir'],['JHARKHAND','Jharkhand'],['KARNATAKA','Karnataka'],
         ['KERALA','Kerala'],['LADAKH','Ladakh'],['LAKSHADWEEP','Lakshadweep'],
         ['MADHYA_PRADESH','Madhya Pradesh'],['MAHARASHTRA','Maharashtra'],['MANIPUR','Manipur'],
         ['MEGHALAYA','Meghalaya'],['MIZORAM','Mizoram'],['NAGALAND','Nagaland'],['ODISHA','Odisha'],
         ['PUDUCHERRY','Puducherry'],['PUNJAB','Punjab'],['RAJASTHAN','Rajasthan'],['SIKKIM','Sikkim'],
         ['TAMIL_NADU','Tamil Nadu'],['TELANGANA','Telangana'],['TRIPURA','Tripura'],
         ['UTTAR_PRADESH','Uttar Pradesh'],['UTTARAKHAND','Uttarakhand'],['WEST_BENGAL','West Bengal']],
    // Israel's 6 internationally-recognized districts only -- deliberately excludes the
    // Judea and Samaria Area (West Bank), a genuinely internationally-contested territory,
    // the same political-neutrality reasoning already applied to Russia's city-keyed
    // `state` scheme (see docs/architecture.md "Seed data sourcing").
    IL: [['CENTRAL','Central District'],['HAIFA','Haifa District'],['JERUSALEM','Jerusalem District'],
         ['NORTHERN','Northern District'],['SOUTHERN','Southern District'],['TEL_AVIV','Tel Aviv District']],
    ID: [['ACEH','Aceh'],['BALI','Bali'],['BANTEN','Banten'],['BENGKULU','Bengkulu'],
         ['DI_YOGYAKARTA','DI Yogyakarta'],['DKI_JAKARTA','DKI Jakarta'],['GORONTALO','Gorontalo'],
         ['JAMBI','Jambi'],['JAWA_BARAT','Jawa Barat'],['JAWA_TENGAH','Jawa Tengah'],
         ['JAWA_TIMUR','Jawa Timur'],['KALIMANTAN_BARAT','Kalimantan Barat'],
         ['KALIMANTAN_SELATAN','Kalimantan Selatan'],['KALIMANTAN_TENGAH','Kalimantan Tengah'],
         ['KALIMANTAN_TIMUR','Kalimantan Timur'],['KALIMANTAN_UTARA','Kalimantan Utara'],
         ['KEP_BANGKA_BELITUNG','Kepulauan Bangka Belitung'],['KEP_RIAU','Kepulauan Riau'],
         ['LAMPUNG','Lampung'],['MALUKU','Maluku'],['MALUKU_UTARA','Maluku Utara'],
         ['NUSA_TENGGARA_BARAT','Nusa Tenggara Barat'],['NUSA_TENGGARA_TIMUR','Nusa Tenggara Timur'],
         ['PAPUA','Papua'],['PAPUA_BARAT','Papua Barat'],['PAPUA_BARAT_DAYA','Papua Barat Daya'],
         ['PAPUA_PEGUNUNGAN','Papua Pegunungan'],['PAPUA_SELATAN','Papua Selatan'],
         ['PAPUA_TENGAH','Papua Tengah'],['RIAU','Riau'],['SULAWESI_BARAT','Sulawesi Barat'],
         ['SULAWESI_SELATAN','Sulawesi Selatan'],['SULAWESI_TENGAH','Sulawesi Tengah'],
         ['SULAWESI_TENGGARA','Sulawesi Tenggara'],['SULAWESI_UTARA','Sulawesi Utara'],
         ['SUMATERA_BARAT','Sumatera Barat'],['SUMATERA_SELATAN','Sumatera Selatan'],
         ['SUMATERA_UTARA','Sumatera Utara']],
    TW: [['TAIPEI','Taipei City'],['NEW_TAIPEI','New Taipei City'],['TAOYUAN','Taoyuan City'],
         ['TAICHUNG','Taichung City'],['TAINAN','Tainan City'],['KAOHSIUNG','Kaohsiung City'],
         ['KEELUNG','Keelung City'],['HSINCHU_CITY','Hsinchu City'],['CHIAYI_CITY','Chiayi City'],
         ['HSINCHU_COUNTY','Hsinchu County'],['MIAOLI','Miaoli County'],['CHANGHUA','Changhua County'],
         ['NANTOU','Nantou County'],['YUNLIN','Yunlin County'],['CHIAYI_COUNTY','Chiayi County'],
         ['PINGTUNG','Pingtung County'],['YILAN','Yilan County'],['HUALIEN','Hualien County'],
         ['TAITUNG','Taitung County'],['PENGHU','Penghu County'],['KINMEN','Kinmen County'],
         ['LIENCHIANG','Lienchiang County']]
  };
  const TYPE_LABELS = {'indoor-bouldering':'Indoor bouldering','top-rope':'Top rope','lead-climbing':'Lead climbing'};
  const COUNTRY_LABELS = {AU:'Australia', US:'United States', JP:'Japan', CA:'Canada', NZ:'New Zealand', CN:'China', GB:'United Kingdom', DE:'Germany', FR:'France', SE:'Sweden', NL:'Netherlands', IT:'Italy', BE:'Belgium', KR:'South Korea', ES:'Spain', PT:'Portugal', AT:'Austria', CH:'Switzerland', PL:'Poland', DK:'Denmark', FI:'Finland', IE:'Ireland', NO:'Norway', MX:'Mexico', BR:'Brazil', HU:'Hungary', GR:'Greece', CZ:'Czech Republic', IS:'Iceland', RO:'Romania', HR:'Croatia', RU:'Russia', BG:'Bulgaria', AR:'Argentina', PH:'Philippines', CO:'Colombia', CL:'Chile', VE:'Venezuela', IN:'India', IL:'Israel', ID:'Indonesia', TW:'Taiwan'};
  // Fixed camera target per country for the "fly to this country" click on
  // its sidebar label -- picked to frame that country's actual spread of
  // seed spots (e.g. US needs a wide zoom to fit both NY and CA), not a
  // geographic center of the whole country (Canada's real geographic
  // center is in the Arctic, nowhere near where any of its seed spots are).
  const COUNTRY_FLY_TARGETS = {
    AU: {center:[134,-25], zoom:3.6},
    US: {center:[-98,39], zoom:3.2},
    JP: {center:[138,38], zoom:4.6},
    CA: {center:[-97,50], zoom:3.2},
    NZ: {center:[172,-41], zoom:4.6},
    CN: {center:[110,32], zoom:3.6},
    GB: {center:[-2.5,54.5], zoom:4.8},
    DE: {center:[10.5,51], zoom:4.6},
    FR: {center:[2.5,46.3], zoom:5.2},
    SE: {center:[15,58.5], zoom:4.4},
    NL: {center:[5.2,52.1], zoom:7},
    IT: {center:[11,43.3], zoom:5.2},
    BE: {center:[4.6,50.7], zoom:6.6},
    KR: {center:[128,36], zoom:5.4},
    ES: {center:[-1,40.5], zoom:5.5},
    PT: {center:[-8.5,39.5], zoom:6.2},
    AT: {center:[14,47.7], zoom:6.2},
    CH: {center:[8,47.3], zoom:7.2},
    PL: {center:[18,52], zoom:5.8},
    DK: {center:[10,56], zoom:6},
    FI: {center:[26,63], zoom:4.8},
    IE: {center:[-7.5,53.2], zoom:6.5},
    NO: {center:[10,63], zoom:3.8},
    MX: {center:[-101,22], zoom:4.2},
    BR: {center:[-46,-22], zoom:5},
    HU: {center:[19,47.3], zoom:6.5},
    GR: {center:[24,38], zoom:5.5},
    CZ: {center:[15,49.9], zoom:6.5},
    IS: {center:[-19,65], zoom:5.2},
    RO: {center:[24.5,46], zoom:5.8},
    HR: {center:[16,44.5], zoom:5.6},
    RU: {center:[35,58], zoom:3.6},
    BG: {center:[24.5,42.7], zoom:6.5},
    AR: {center:[-63,-35], zoom:4.2},
    PH: {center:[121.8,12.5], zoom:5.2},
    CO: {center:[-74.3,5.5], zoom:5},
    CL: {center:[-72,-37], zoom:4.4},
    VE: {center:[-68,9], zoom:5.2},
    IN: {center:[77,22], zoom:4},
    IL: {center:[35,32], zoom:7},
    ID: {center:[110,-3], zoom:4},
    TW: {center:[121,24.3], zoom:7}
  };
  // Which sidebar region-group each country belongs to -- same grouping as
  // the `.region-group[data-region]` wrappers in index.html, kept here too
  // so the map's own continent-tier labels/fly-targets don't need to read
  // the DOM to know a country's continent.
  const COUNTRY_TO_REGION = {
    CN:'asia', JP:'asia', KR:'asia', PH:'asia', IN:'asia', IL:'asia', ID:'asia', TW:'asia',
    DE:'europe', GB:'europe', FR:'europe', SE:'europe', NL:'europe', IT:'europe', BE:'europe',
    ES:'europe', PT:'europe', AT:'europe', CH:'europe', PL:'europe', DK:'europe', FI:'europe', IE:'europe',
    NO:'europe', HU:'europe', GR:'europe', CZ:'europe', IS:'europe',
    RO:'europe', HR:'europe', RU:'europe', BG:'europe',
    CA:'north-america', US:'north-america', MX:'north-america',
    AU:'oceania', NZ:'oceania',
    BR:'south-america', AR:'south-america', CO:'south-america', CL:'south-america', VE:'south-america'
  };
  const REGION_LABELS = {asia:'Asia', europe:'Europe', 'north-america':'North America', oceania:'Oceania', 'south-america':'South America'};
  // Same idea as COUNTRY_FLY_TARGETS, one tier coarser -- framing every
  // country currently in that region, not just one.
  const REGION_FLY_TARGETS = {
    asia: {center:[125,32], zoom:2.6},
    europe: {center:[8,50], zoom:3.2},
    'north-america': {center:[-100,45], zoom:2.4},
    oceania: {center:[155,-30], zoom:3},
    'south-america': {center:[-58,-15], zoom:3}
  };
  // Below this zoom, a spot with no nearby neighbours (so supercluster hands
  // it back as a lone, unclustered point rather than grouping it) still paints
  // as a small numbered badge instead of the hold-shaped icon -- at globe/
  // country zoom a 20px icon for a single far-off spot (e.g. Japan, viewed
  // from the default mid-Pacific camera) reads as a stray dot; a numbered
  // badge matches the visual language clusters already use and stays legible.
  const HOLD_ICON_ZOOM = 9;
  // Below this zoom, region labels show the country name (e.g. "Japan")
  // rather than individual states/prefectures/cities (e.g. "Tokyo") --
  // at globe/continent zoom, a country name orients a viewer faster than a
  // handful of same-country city names clustered together would.
  const COUNTRY_LABEL_ZOOM = 5;
  // Below this (coarser than COUNTRY_LABEL_ZOOM), labels show the continent
  // name (e.g. "Europe") instead of individual countries -- at true globe
  // zoom, several nearby countries (Germany/France/Italy/... all in Europe)
  // are usually too close together on screen to be worth telling apart yet,
  // and a continent name orients a viewer faster.
  const CONTINENT_LABEL_ZOOM = 3.5;
  // Camera animations respect the OS reduced-motion preference: every
  // flyTo/easeTo duration goes through this so they collapse to a cut.
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = ms => REDUCED_MOTION ? 0 : ms;

  function typeSwatch(types){
    const colors = (types&&types.length?types:['indoor-bouldering']).map(t=>TYPE_COLORS[t]||'#999');
    if(colors.length === 1) return colors[0];
    const step = 100/colors.length;
    return `conic-gradient(${colors.map((c,i)=>`${c} ${i*step}% ${(i+1)*step}%`).join(', ')})`;
  }

  let spots = [];            // approved spot rows only — what the public map shows
  let usingFallback = false; // true if Supabase is unreachable/unconfigured and we fell back to the bundled seed data
  let climbedIds = new Set();
  let bookmarkedIds = new Set();
  let isModerator = false;
  let pendingSpots = [];  // new-spot submissions awaiting approval (moderator-only)
  let pendingEdits = [];  // proposed edits to live spots awaiting approval (moderator-only)
  let pendingReports = []; // "report incorrect info" messages awaiting review (moderator-only)

  let sessions = [];      // the signed-in user's own logbook entries, each with an embedded session_climbs array
  let draftClimbs = [];   // climb rows being built in the currently-open "Log a session" modal, before save
  const MOOD_EMOJI = {great:'🤩', good:'🙂', ok:'😐', tired:'😮‍💨', rough:'😫'};

  let activeStates = new Set(['ALL']);
  let activeTypes = new Set(['indoor-bouldering','top-rope','lead-climbing']);
  let showClimbedOnly = false;
  let showBookmarkedOnly = false;
  let searchTerm = '';
  let visibleIndex = {};    // id -> spot, for whatever currently passes filters (feeds the cluster index)
  let markerEls = {};       // id -> {marker, el} for individual spot markers currently painted on screen
  let clusterMarkers = {};  // cluster_id -> maplibregl.Marker for cluster badges currently painted
  let supercluster = null;
  let lastIconBucket = null; // 'icon' | 'number' | null -- which style ungrouped spot markers were last painted in
  let regionCentroids = {}; // "country:state" -> {lat,lng,country,state}, recomputed whenever the filtered spot set changes
  let countryCentroids = {}; // country code -> {lat,lng,country,count}, same idea one tier up
  let continentCentroids = {}; // region id -> {lat,lng,region,count}, same idea one tier up again
  let regionLabelMarkers = {}; // "country:state" -> maplibregl.Marker, for the basic city/state labels shown below HOLD_ICON_ZOOM
  let placingPin = null; // {lat,lng} while add-modal open
  let currentEditId = null;
  let currentEditPin = null; // {lat,lng} while edit-modal open
  let currentReportId = null; // spot id being reported while report-modal open
  let isPlacing = false;
  let placingMode = null; // 'add' | 'edit'

  // Fixed starting view, not a fitBounds-to-data fit: AU and US spots sit on
  // opposite sides of the Pacific, and LngLatBounds.extend() just tracks
  // min/max longitude, so a bounds box built across both countries spans the
  // long way round through Africa instead of the short way across the
  // Pacific -- fitBounds then centers the camera there, zoomed in past the
  // point where either country's spots are still in view (this is what
  // silently produced zero markers on load before it was removed). Centered
  // mid-Pacific/near-equatorial instead so both AU and US sit reasonably
  // in view of the globe at a low zoom.
  // Style is CARTO's free, keyless "Dark Matter" vector basemap — the GL
  // sibling of the same dark tiles this app already used, so the globe keeps
  // the existing look instead of picking up a new visual identity.
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-162, 10],
    zoom: 1.3,
    attributionControl: {compact: true}
  });
  map.addControl(new maplibregl.NavigationControl({showCompass:false}), 'top-right');

  map.once('style.load', ()=>{
    map.setProjection({type:'globe'});
    try{
      // Tinted to the app's own warm dark palette rather than the default sky
      // blue, so the atmosphere glow reads as "this app" and not a generic
      // Mapbox/MapLibre demo.
      map.setSky({
        'sky-color': '#0d0b09',
        'sky-horizon-blend': 0.5,
        'horizon-color': '#3a2a1a',
        'horizon-fog-blend': 0.6,
        'fog-color': '#211f1b',
        'fog-ground-blend': 0.7,
        'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0]
      });
    }catch(err){
      console.warn('Sky/atmosphere not supported in this MapLibre build', err);
    }
    try{
      // CARTO's Dark Matter style ships "roadname_major" (its own major/
      // arterial road name labels) at text-color #383838 -- a near-black
      // dark grey, on a #111 halo, over an already-dark basemap. Every
      // other road tier in the same style (roadname_pri/sec/minor) uses a
      // light grey (rgb ~146-189) that reads fine; roadname_major is the
      // one tier that's essentially invisible, which is backwards since
      // it's the most prominent road class. This looks like an upstream
      // styling gap in CARTO's own style rather than anything intentional
      // -- confirmed by reading the loaded style's actual paint properties
      // (`map.getStyle().layers`), not guessed. Brightened to match the
      // other tiers instead of leaving major roads unreadable.
      map.setPaintProperty('roadname_major', 'text-color', '#c8c8c8');
    }catch(err){
      console.warn('roadname_major layer not found in this basemap style', err);
    }
  });

  // MapLibre doesn't cluster arbitrary DOM markers itself, so supercluster
  // computes the groups; we repaint plain maplibregl.Marker elements for
  // whatever's in the current viewport on every 'moveend'.
  //
  // DOM markers are inherently a frame or two behind MapLibre's own WebGL
  // render loop while the camera is moving (a documented MapLibre/Mapbox GL
  // limitation, not something fixable from application code) — an earlier
  // version of this hid every marker for the gesture's duration to avoid
  // that lag being visible, but on the globe projection that gesture is
  // also how you spin the globe, so markers vanishing mid-drag read as
  // broken rather than intentional. Per explicit user preference, markers
  // now stay visible (and briefly lag the camera) during a drag/rotate
  // instead of disappearing. We still skip repainting anything that's
  // already correctly on screen so the moveend repaint itself stays cheap.
  function rebuildClusterIndex(visibleSpots){
    visibleIndex = {};
    visibleSpots.forEach(g=>{ visibleIndex[g.id] = g; });
    supercluster = new Supercluster({radius:60, maxZoom:16}).load(visibleSpots.map(g=>({
      type: 'Feature',
      properties: {id: g.id},
      geometry: {type: 'Point', coordinates: [g.lng, g.lat]}
    })));
    regionCentroids = computeRegionCentroids(visibleSpots);
    countryCentroids = computeCountryCentroids(visibleSpots);
    continentCentroids = computeContinentCentroids(visibleSpots);
    // A rebuilt index hands out fresh cluster ids that can coincidentally
    // collide with old ones from the previous index but mean a different
    // group, so anything already painted has to go before we query it.
    clearPaintedMarkers();
    paintMarkers();
  }

  // One label point per (country,state) that currently has at least one
  // visible spot -- the centroid of that region's own spots, not anything
  // geographically authoritative. Keeps each region's spot count too, used
  // by paintMarkers() to decide which label wins when two overlap on screen.
  function computeRegionCentroids(visibleSpots){
    const sums = {};
    visibleSpots.forEach(g=>{
      const key = g.country+':'+g.state;
      if(!sums[key]) sums[key] = {latSum:0, lngSum:0, count:0, country:g.country, state:g.state};
      sums[key].latSum += g.lat;
      sums[key].lngSum += g.lng;
      sums[key].count++;
    });
    const centroids = {};
    Object.entries(sums).forEach(([key, s])=>{
      centroids[key] = {lat: s.latSum/s.count, lng: s.lngSum/s.count, country: s.country, state: s.state, count: s.count};
    });
    return centroids;
  }

  // One label point per country, same idea as computeRegionCentroids but
  // one tier coarser -- shown at a wider zoom, before individual states/
  // prefectures/cities are worth distinguishing (see COUNTRY_LABEL_ZOOM).
  function computeCountryCentroids(visibleSpots){
    const sums = {};
    visibleSpots.forEach(g=>{
      if(!sums[g.country]) sums[g.country] = {latSum:0, lngSum:0, count:0, country:g.country};
      sums[g.country].latSum += g.lat;
      sums[g.country].lngSum += g.lng;
      sums[g.country].count++;
    });
    const centroids = {};
    Object.entries(sums).forEach(([country, s])=>{
      centroids[country] = {lat: s.latSum/s.count, lng: s.lngSum/s.count, country, count: s.count};
    });
    return centroids;
  }

  // One label point per continent/region, one tier coarser again -- shown
  // at true globe zoom, before individual countries are worth telling
  // apart (see CONTINENT_LABEL_ZOOM). A spot whose country isn't in
  // COUNTRY_TO_REGION (e.g. one submitted via the "Other (not listed)"
  // country option, ahead of that country formally getting continent
  // support) is skipped here rather than guessed into a region.
  function computeContinentCentroids(visibleSpots){
    const sums = {};
    visibleSpots.forEach(g=>{
      const region = COUNTRY_TO_REGION[g.country];
      if(!region) return;
      if(!sums[region]) sums[region] = {latSum:0, lngSum:0, count:0, region};
      sums[region].latSum += g.lat;
      sums[region].lngSum += g.lng;
      sums[region].count++;
    });
    const centroids = {};
    Object.entries(sums).forEach(([region, s])=>{
      centroids[region] = {lat: s.latSum/s.count, lng: s.lngSum/s.count, region, count: s.count};
    });
    return centroids;
  }

  function stateLabel(country, state){
    const entry = (STATES_BY_COUNTRY[country]||[]).find(([code])=>code===state);
    return entry ? entry[1] : state;
  }

  function clearPaintedMarkers(){
    Object.values(markerEls).forEach(e=>e.marker.remove());
    Object.values(clusterMarkers).forEach(m=>m.remove());
    Object.values(regionLabelMarkers).forEach(m=>m.remove());
    markerEls = {};
    clusterMarkers = {};
    regionLabelMarkers = {};
  }

  function paintMarkers(){
    if(!supercluster) return;
    const b = map.getBounds();
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
    const zoom = Math.floor(map.getZoom());
    const iconBucket = zoom >= HOLD_ICON_ZOOM ? 'icon' : 'number';
    if(iconBucket !== lastIconBucket){
      // Crossed the icon/number threshold since the last paint -- every
      // already-painted spot marker (not cluster badge) is the wrong style
      // now, so drop them and let the loop below repaint fresh.
      Object.values(markerEls).forEach(e=>e.marker.remove());
      markerEls = {};
      lastIconBucket = iconBucket;
    }
    const seenClusters = new Set();
    const seenSpots = new Set();

    supercluster.getClusters(bbox, zoom).forEach(feature=>{
      const [lng, lat] = feature.geometry.coordinates;
      if(feature.properties.cluster){
        const clusterId = feature.properties.cluster_id;
        seenClusters.add(clusterId);
        if(clusterMarkers[clusterId]) return; // same index, same id => already correctly painted
        const count = feature.properties.point_count;
        const size = count < 10 ? 34 : count < 50 ? 42 : 50;
        const el = document.createElement('div');
        el.className = 'cluster-marker';
        el.style.width = size+'px';
        el.style.height = size+'px';
        el.textContent = count;
        el.addEventListener('click', ()=>{
          const targetZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 20);
          map.easeTo({center:[lng,lat], zoom: targetZoom, duration: motion(500)});
        });
        clusterMarkers[clusterId] = new maplibregl.Marker({element: el}).setLngLat([lng,lat]).addTo(map);
      } else {
        const id = feature.properties.id;
        seenSpots.add(id);
        if(markerEls[id]) return; // already painted, leave it (mark state stays in sync via updateMarkUI)
        const g = visibleIndex[id];
        if(g) markerEls[id] = iconBucket === 'icon' ? buildSpotMarker(g) : buildSpotNumberMarker(g);
      }
    });

    Object.keys(clusterMarkers).forEach(idStr=>{
      if(!seenClusters.has(Number(idStr))){ clusterMarkers[idStr].remove(); delete clusterMarkers[idStr]; }
    });
    Object.keys(markerEls).forEach(id=>{
      if(!seenSpots.has(id)){ markerEls[id].marker.remove(); delete markerEls[id]; }
    });

    // Three-tier basic labels, same "zoomed out" window as the numbered
    // badges -- once real markers take over (zoom >= HOLD_ICON_ZOOM) labels
    // aren't needed, you can already see individual gyms. Below
    // CONTINENT_LABEL_ZOOM (true globe view) labels show the continent name
    // (e.g. "Europe") -- at that zoom several countries on the same
    // continent are usually still too close together on screen to be worth
    // distinguishing, and a continent name orients a viewer fastest. From
    // CONTINENT_LABEL_ZOOM up to COUNTRY_LABEL_ZOOM, labels switch to the
    // country tier (e.g. "Germany"); from COUNTRY_LABEL_ZOOM up to
    // HOLD_ICON_ZOOM, the finer state/prefecture/city tier, same as before.
    // Each tier is keyed off a disjoint id space (region id / bare country
    // code / "country:state") and only one tier's candidates are ever fed
    // into `source` below, so a given label (e.g. "Germany") is sourced
    // from exactly one centroid and can never be painted twice at once --
    // the collision-avoidance pass below only ever discards a *contested*
    // candidate in favour of another, never paints the same key twice.
    //
    // Nearby regions (e.g. AU's NSW/ACT/VIC, or several European countries
    // at globe zoom) can project to almost the same screen point while
    // still zoomed out, which would read as garbled/overlapping text.
    // Collision avoidance: project every in-view candidate to screen space,
    // let the region with more visible spots win a contested spot, and skip
    // (not paint) any candidate that lands within MIN_LABEL_SPACING px of an
    // already-accepted label -- same idea as label collision detection in
    // any map renderer, just done by hand since these are plain DOM markers.
    const MIN_LABEL_SPACING = 55;
    const showLabels = zoom < HOLD_ICON_ZOOM;
    const showContinentTier = zoom < CONTINENT_LABEL_ZOOM;
    const showCountryTier = !showContinentTier && zoom < COUNTRY_LABEL_ZOOM;
    const seenLabels = new Set();
    if(showLabels){
      const source = showContinentTier ? continentCentroids : showCountryTier ? countryCentroids : regionCentroids;
      const candidates = Object.entries(source)
        .filter(([,c])=> !(c.lng < bbox[0] || c.lng > bbox[2] || c.lat < bbox[1] || c.lat > bbox[3]))
        .map(([key,c])=>({key, c, pt: map.project([c.lng, c.lat])}))
        .sort((a,b)=> b.c.count - a.c.count);
      const accepted = [];
      candidates.forEach(cand=>{
        const collides = accepted.some(a=>{
          const dx = a.pt.x - cand.pt.x, dy = a.pt.y - cand.pt.y;
          return Math.sqrt(dx*dx + dy*dy) < MIN_LABEL_SPACING;
        });
        if(collides) return;
        accepted.push(cand);
        seenLabels.add(cand.key);
        if(regionLabelMarkers[cand.key]) return;
        const el = document.createElement('div');
        el.className = 'region-label';
        if(showContinentTier){
          el.textContent = REGION_LABELS[cand.c.region] || cand.c.region;
          el.classList.add('continent-label');
          // Continent labels are the only tier with pointer-events enabled
          // (see the .continent-label CSS rule) -- clicking one flies the
          // globe to that continent, same idea as clicking a country's
          // sidebar label already does for COUNTRY_FLY_TARGETS.
          el.addEventListener('click', ()=>{
            const target = REGION_FLY_TARGETS[cand.c.region];
            if(target) map.flyTo({center: target.center, zoom: target.zoom, duration: motion(1500)});
          });
        } else if(showCountryTier){
          el.textContent = COUNTRY_LABELS[cand.c.country] || cand.c.country;
          el.classList.add('country-tier-label');
        } else {
          el.textContent = stateLabel(cand.c.country, cand.c.state);
          el.classList.add('state-tier-label');
        }
        // Offset below the badge that would otherwise sit at this same
        // point, so the label doesn't sit directly on top of it.
        regionLabelMarkers[cand.key] = new maplibregl.Marker({element: el, offset: [0, 24]}).setLngLat([cand.c.lng, cand.c.lat]).addTo(map);
      });
    }
    Object.keys(regionLabelMarkers).forEach(key=>{
      if(!showLabels || !seenLabels.has(key)){ regionLabelMarkers[key].remove(); delete regionLabelMarkers[key]; }
    });
  }
  map.on('moveend', paintMarkers);

  function spotMarkerClasses(g){
    const cls = ['hold-marker'];
    if(g.community) cls.push('community');
    if(climbedIds.has(g.id)) cls.push('climbed');
    if(bookmarkedIds.has(g.id)) cls.push('bookmarked');
    return cls.join(' ');
  }

  function buildSpotMarker(g){
    const el = document.createElement('div');
    el.className = spotMarkerClasses(g);
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.background = typeSwatch(g.types);
    // Popup HTML is built lazily on first open, not here — this runs once per
    // marker on every viewport repaint, and most painted markers never get
    // clicked.
    const popup = new maplibregl.Popup({offset: 14, maxWidth: '240px'});
    popup.on('open', ()=> popup.setHTML(popupHtml(g)));
    const marker = new maplibregl.Marker({element: el}).setLngLat([g.lng, g.lat]).setPopup(popup).addTo(map);
    return {marker, el, kind:'icon'};
  }

  // Zoomed-out stand-in for a lone spot marker -- see HOLD_ICON_ZOOM. No
  // popup (nothing to show beyond what the badge already implies); clicking
  // zooms in far enough to flip it over to the real hold-shaped marker.
  // Deliberately styled identically to a real cluster badge (same size,
  // same neutral colour) rather than colour-coded by type -- while zoomed
  // out it should read as "one more badge on the globe", indistinguishable
  // from an actual cluster except for the "1", not a visually distinct
  // third marker style.
  function buildSpotNumberMarker(g){
    const el = document.createElement('div');
    el.className = 'cluster-marker spot-number-marker';
    el.style.width = '34px';
    el.style.height = '34px';
    el.textContent = '1';
    el.addEventListener('click', ()=>{
      map.easeTo({center:[g.lng, g.lat], zoom: Math.max(map.getZoom()+3, HOLD_ICON_ZOOM), duration: motion(500)});
    });
    const marker = new maplibregl.Marker({element: el}).setLngLat([g.lng, g.lat]).addTo(map);
    return {marker, el, kind:'number'};
  }

  function passesFilters(g){
    if(!activeStates.has('ALL') && !activeStates.has(g.country+':'+g.state)) return false;
    if(!g.types.some(t=>activeTypes.has(t))) return false;
    if(showClimbedOnly && !climbedIds.has(g.id)) return false;
    if(showBookmarkedOnly && !bookmarkedIds.has(g.id)) return false;
    if(searchTerm){
      // Matches name/suburb as before, plus state/country by both their raw
      // code (e.g. "NSW", "JP") and human-readable label (e.g. "New South
      // Wales" -- well, just "NSW" here since AU doesn't expand, but
      // "United States", "Japan", etc. do) so typing a country or state name
      // finds every spot in it, not just ones whose suburb happens to match.
      const hay = [g.name, g.suburb, g.state, stateLabel(g.country, g.state), g.country, COUNTRY_LABELS[g.country]]
        .join(' ').toLowerCase();
      if(!hay.includes(searchTerm)) return false;
    }
    return true;
  }

  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // Deliberately just destination + lat/lng, no origin -- Google Maps fills
  // the origin in as the visitor's current location. Works off coordinates
  // alone so it doesn't depend on a spot having a verified street address.
  function directionsUrl(g){
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(g.lat+','+g.lng)}`;
  }

  function popupHtml(g){
    const typeLabel = g.types.map(t=>TYPE_LABELS[t]).join(' · ');
    const climbed = climbedIds.has(g.id);
    const bookmarked = bookmarkedIds.has(g.id);
    return `${g.photo?`<img class="popup-photo" src="${escapeHtml(g.photo)}" alt="${escapeHtml(g.name)}" onerror="this.style.display='none'">`:''}
       <div class="popup-name">${escapeHtml(g.name)}</div>
       <div class="popup-meta">${escapeHtml(g.suburb)}, ${g.state} · ${typeLabel}${g.community?' · community-added':''}${g.edited?' · edited':''}</div>
       ${g.address?`<div class="popup-address">${escapeHtml(g.address)}</div>`:''}
       ${g.notes?`<div style="font-size:12px;color:var(--text-dim)">${escapeHtml(g.notes)}</div>`:''}
       <div class="popup-actions">
         <button class="mark-btn climbed-btn ${climbed?'active':''}" onclick="window.__toggleMark('${g.id}','climbed')">✓ Climbed</button>
         <button class="mark-btn bookmark-btn ${bookmarked?'active':''}" onclick="window.__toggleMark('${g.id}','bookmarked')">★ Save</button>
       </div>
       <div class="popup-links">
         <a class="popup-directions-btn" href="${directionsUrl(g)}" target="_blank" rel="noopener noreferrer">📍 Directions</a>
         <button class="popup-edit-btn" onclick="window.__editSpot('${g.id}')">Edit this spot</button>
       </div>
       <button class="popup-report-btn" onclick="window.__reportSpot('${g.id}')">⚑ Report incorrect info</button>`;
  }

  function render(){
    const list = document.getElementById('gymList');
    list.innerHTML='';
    const visible = spots.filter(passesFilters);
    document.getElementById('countNum').textContent = visible.length;

    if(visible.length === 0){
      list.innerHTML = '<div class="empty-state">No spots match. Try clearing filters or search.</div>';
    } else {
      visible.sort((a,b)=>a.name.localeCompare(b.name));
      visible.forEach(g=>{
        const climbed = climbedIds.has(g.id);
        const bookmarked = bookmarkedIds.has(g.id);

        const item = document.createElement('div');
        item.className = 'gym-item';
        item.dataset.id = g.id;
        item.innerHTML = `
          <div class="swatch" style="background:${typeSwatch(g.types)}"></div>
          <div class="info">
            <div class="name">${escapeHtml(g.name)}</div>
            <div class="meta">
              <span>${escapeHtml(g.suburb)}, ${g.state}</span>
              ${g.community?'<span class="tag-pill community">Community</span>':''}
              ${g.edited?'<span class="tag-pill edited">Edited</span>':''}
            </div>
          </div>
          <button class="mark-btn climbed-btn ${climbed?'active':''}" title="Mark as climbed" aria-label="Mark as climbed">✓</button>
          <button class="mark-btn bookmark-btn ${bookmarked?'active':''}" title="Bookmark" aria-label="Bookmark">★</button>
          <button class="edit-icon-btn" title="Edit this spot" aria-label="Edit this spot">✎</button>`;
        item.addEventListener('click', ()=>{
          const targetZoom = Math.max(map.getZoom(), 13);
          map.flyTo({center:[g.lng, g.lat], zoom: targetZoom, duration: motion(800)});
          // paintMarkers() (bound to 'moveend' at setup, before this one-off
          // listener exists) runs first and repopulates markerEls for the new
          // viewport, so the lookup below sees the freshly painted marker.
          map.once('moveend', ()=>{
            const entry = markerEls[g.id];
            if(entry) entry.marker.togglePopup();
          });
          if(window.innerWidth <= 760) document.getElementById('sidebar').classList.remove('open');
        });
        item.querySelector('.edit-icon-btn').addEventListener('click', (ev)=>{
          ev.stopPropagation();
          openEditModal(g.id);
        });
        item.querySelector('.climbed-btn').addEventListener('click', (ev)=>{
          ev.stopPropagation();
          toggleMark(g.id, 'climbed');
        });
        item.querySelector('.bookmark-btn').addEventListener('click', (ev)=>{
          ev.stopPropagation();
          toggleMark(g.id, 'bookmarked');
        });
        list.appendChild(item);
      });
    }

    rebuildClusterIndex(visible);
  }

  // Lightweight update for a single spot's mark state — avoids repainting every
  // marker (which would close any open popup) just because one star got clicked.
  function updateMarkUI(spotId){
    const g = spots.find(s=>s.id===spotId);
    if(!g) return;
    const entry = markerEls[spotId];
    if(entry && entry.kind === 'icon'){
      entry.el.className = spotMarkerClasses(g);
      const popup = entry.marker.getPopup();
      if(popup) popup.setHTML(popupHtml(g));
    }
    const item = document.querySelector(`.gym-item[data-id="${CSS.escape(spotId)}"]`);
    if(item){
      const cb = item.querySelector('.climbed-btn');
      const bb = item.querySelector('.bookmark-btn');
      if(cb) cb.classList.toggle('active', climbedIds.has(spotId));
      if(bb) bb.classList.toggle('active', bookmarkedIds.has(spotId));
    }
  }

  // --- filter controls ---
  document.getElementById('stateChips').addEventListener('click', (e)=>{
    const regionHeader = e.target.closest('.region-header');
    if(regionHeader){
      const group = regionHeader.closest('.region-group');
      group.classList.toggle('collapsed');
      const target = REGION_FLY_TARGETS[group.dataset.region];
      if(target) map.flyTo({center: target.center, zoom: target.zoom, duration: motion(1500)});
      return;
    }
    const label = e.target.closest('.country-label');
    if(label){
      const group = label.closest('.country-group');
      group.classList.toggle('collapsed');
      const target = COUNTRY_FLY_TARGETS[group.dataset.country];
      if(target) map.flyTo({center: target.center, zoom: target.zoom, duration: motion(1500)});
      return;
    }
    const chip = e.target.closest('.chip');
    if(!chip) return;
    const state = chip.dataset.state;
    if(state === 'ALL'){
      activeStates = new Set(['ALL']);
    } else {
      const key = chip.dataset.country + ':' + state;
      activeStates.delete('ALL');
      if(activeStates.has(key)) activeStates.delete(key); else activeStates.add(key);
      if(activeStates.size === 0) activeStates = new Set(['ALL']);
    }
    document.querySelectorAll('.chip').forEach(c=>{
      const key = c.dataset.state === 'ALL' ? 'ALL' : c.dataset.country + ':' + c.dataset.state;
      const on = activeStates.has(key);
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    // A chip can be active while its own country group (and that
    // country's region group, one level up) is collapsed -- flag both so
    // an applied filter never silently disappears from view just because
    // its group or region happens to be collapsed.
    document.querySelectorAll('.country-group').forEach(group=>{
      group.classList.toggle('has-active', !!group.querySelector('.chip.active'));
    });
    document.querySelectorAll('.region-group').forEach(region=>{
      region.classList.toggle('has-active', !!region.querySelector('.country-group.has-active'));
    });
    render();
  });

  document.getElementById('typeFilters').addEventListener('change', (e)=>{
    const input = e.target.closest('input[data-type]');
    if(!input) return;
    if(input.checked) activeTypes.add(input.dataset.type);
    else activeTypes.delete(input.dataset.type);
    render();
  });

  document.getElementById('marksFilters').addEventListener('change', (e)=>{
    if(e.target.id === 'filterClimbed') showClimbedOnly = e.target.checked;
    else if(e.target.id === 'filterBookmarked') showBookmarkedOnly = e.target.checked;
    else return;
    render();
  });

  document.getElementById('searchInput').addEventListener('input', (e)=>{
    searchTerm = e.target.value.trim().toLowerCase();
    render();
  });

  document.getElementById('mobileToggle').addEventListener('click', (e)=>{
    const open = document.getElementById('sidebar').classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', String(open));
  });

  // --- modal keyboard/focus handling ---
  // Every modal is a .modal-backdrop toggled via the `hidden` class by its own
  // open/close function. Rather than threading focus management through each
  // of those, watch the class flips: on open, remember what had focus and move
  // it into the dialog; on close, put it back. Escape triggers the dialog's own
  // cancel/close button so each modal's existing close logic still runs.
  const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;
  document.querySelectorAll('.modal-backdrop').forEach(backdrop=>{
    new MutationObserver(()=>{
      const open = !backdrop.classList.contains('hidden');
      if(open){
        lastFocused = document.activeElement;
        const first = backdrop.querySelector('.modal ' + FOCUSABLE);
        if(first) first.focus();
      } else if(lastFocused && document.body.contains(lastFocused)){
        lastFocused.focus();
        lastFocused = null;
      }
    }).observe(backdrop, {attributes:true, attributeFilter:['class']});
  });
  document.addEventListener('keydown', (e)=>{
    const open = [...document.querySelectorAll('.modal-backdrop')].filter(b=>!b.classList.contains('hidden')).pop();
    if(!open) return;
    if(e.key === 'Escape'){
      const closeBtn = open.querySelector('.btn-cancel, .info-close');
      if(closeBtn){ e.preventDefault(); closeBtn.click(); }
    } else if(e.key === 'Tab'){
      const items = [...open.querySelectorAll('.modal ' + FOCUSABLE)].filter(el=>el.offsetParent !== null);
      if(!items.length) return;
      const first = items[0], last = items[items.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  // "Saved" header button -- jumps straight to the existing Bookmarked
  // filter rather than being a separate page, so it reuses the same
  // marks/list/map rendering everything else already goes through.
  document.getElementById('savedBtn').addEventListener('click', ()=>{
    if(!window.auth.user){ showToast('Sign in to view your saved spots'); return; }
    const bookmarkedFilter = document.getElementById('filterBookmarked');
    bookmarkedFilter.checked = true;
    showBookmarkedOnly = true;
    render();
    if(window.innerWidth <= 760) document.getElementById('sidebar').classList.add('open');
  });

  // Collapsed by default on narrow viewports, since the full legend text
  // otherwise eats a meaningful chunk of a small map -- still expandable
  // on tap, and left expanded by default on desktop where there's room.
  const legendEl = document.getElementById('legend');
  if(window.innerWidth <= 760) legendEl.classList.add('collapsed');
  document.getElementById('legendToggle').addEventListener('click', ()=>{
    const collapsed = legendEl.classList.toggle('collapsed');
    document.getElementById('legendToggle').setAttribute('aria-expanded', String(!collapsed));
  });

  // --- toast ---
  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 2400);
  }

  // --- auth UI ---
  const authWidget = document.getElementById('authWidget');
  const authModalBackdrop = document.getElementById('authModalBackdrop');
  const authStatus = document.getElementById('authStatus');
  const authEmailInput = document.getElementById('authEmail');

  function renderAuthUI(user){
    authWidget.innerHTML = user
      ? `<span class="auth-email" title="${escapeHtml(user.email||'')}">${escapeHtml(user.email||'Signed in')}</span><button class="auth-btn ghost" id="signOutBtn">Sign out</button>`
      : `<button class="auth-btn" id="signInBtn">Sign in</button>`;
    updateMarksFilterAvailability();
  }

  authWidget.addEventListener('click', (e)=>{
    if(e.target.id === 'signInBtn') openAuthModal();
    else if(e.target.id === 'signOutBtn'){
      window.auth.signOut();
      showToast('Signed out');
    }
  });

  function updateMarksFilterAvailability(){
    const signedIn = !!window.auth.user;
    const climbedFilter = document.getElementById('filterClimbed');
    const bookmarkedFilter = document.getElementById('filterBookmarked');
    [climbedFilter, bookmarkedFilter].forEach(el=>{
      if(!el) return;
      el.disabled = !signedIn;
      if(!signedIn && el.checked) el.checked = false;
    });
    if(!signedIn){ showClimbedOnly = false; showBookmarkedOnly = false; }
  }

  function openAuthModal(){
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    authStatus.textContent = '';
    authStatus.className = 'auth-status';
    authEmailInput.value = '';
    authModalBackdrop.classList.remove('hidden');
  }
  function closeAuthModal(){
    authModalBackdrop.classList.add('hidden');
  }
  document.getElementById('authCancelBtn').addEventListener('click', closeAuthModal);
  authModalBackdrop.addEventListener('click', (e)=>{
    if(e.target === authModalBackdrop) closeAuthModal();
  });

  document.getElementById('googleSignInBtn').addEventListener('click', async ()=>{
    try{
      await window.auth.signInWithGoogle();
    }catch(err){
      authStatus.textContent = 'Could not start Google sign-in.';
      authStatus.className = 'auth-status err';
      console.error(err);
    }
  });

  document.getElementById('sendMagicLinkBtn').addEventListener('click', async ()=>{
    const email = authEmailInput.value.trim();
    if(!email){
      authStatus.textContent = 'Enter your email first.';
      authStatus.className = 'auth-status err';
      return;
    }
    const btn = document.getElementById('sendMagicLinkBtn');
    btn.disabled = true;
    try{
      await window.auth.signInWithEmail(email);
      authStatus.textContent = 'Check your email for a sign-in link.';
      authStatus.className = 'auth-status ok';
    }catch(err){
      authStatus.textContent = 'Could not send the link — try again.';
      authStatus.className = 'auth-status err';
      console.error(err);
    }
    btn.disabled = false;
  });

  // --- climbed / bookmark marks ---
  async function toggleMark(spotId, markType){
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const user = window.auth.user;
    if(!user){ openAuthModal(); return; }
    const set = markType === 'climbed' ? climbedIds : bookmarkedIds;
    const wasActive = set.has(spotId);
    if(wasActive) set.delete(spotId); else set.add(spotId);
    if(showClimbedOnly || showBookmarkedOnly) render(); else updateMarkUI(spotId);
    try{
      if(wasActive){
        const {error} = await window.sb.from('marks').delete()
          .eq('user_id', user.id).eq('spot_id', spotId).eq('mark_type', markType);
        if(error) throw error;
      } else {
        const {error} = await window.sb.from('marks').insert({user_id:user.id, spot_id:spotId, mark_type:markType});
        if(error) throw error;
      }
    }catch(err){
      if(wasActive) set.add(spotId); else set.delete(spotId);
      if(showClimbedOnly || showBookmarkedOnly) render(); else updateMarkUI(spotId);
      showToast('Could not save — try again');
      console.error(err);
    }
  }
  window.__toggleMark = toggleMark;

  // --- country/state dropdowns (shared by add + edit forms) ---
  function populateStateSelect(stateSelectId, country){
    const sel = document.getElementById(stateSelectId);
    const prevValue = sel.value;
    sel.innerHTML = STATES_BY_COUNTRY[country].map(([code,label])=>`<option value="${code}">${label}</option>`).join('');
    if(STATES_BY_COUNTRY[country].some(([code])=>code===prevValue)) sel.value = prevValue;
  }
  // "Other (not listed)" lets someone propose a country this map doesn't support
  // yet -- there's no STATES_BY_COUNTRY entry or short code for it, so the normal
  // state <select> is swapped for two free-text inputs instead. Submitted as
  // whatever the person types (moderator-reviewed either way); a country only
  // gets proper chip/colour/filter support once someone formally adds it, the
  // same one-at-a-time process every existing country went through.
  function toggleOtherCountryFields(prefix, country){
    const isOther = country === 'OTHER';
    document.getElementById(prefix + 'OtherCountryFields').style.display = isOther ? 'flex' : 'none';
    document.getElementById(prefix + 'State').parentElement.style.display = isOther ? 'none' : '';
    if(!isOther) populateStateSelect(prefix + 'State', country);
  }
  function getCountryState(prefix){
    const countrySel = document.getElementById(prefix + 'Country');
    if(countrySel.value === 'OTHER'){
      return {
        country: document.getElementById(prefix + 'CountryOther').value.trim(),
        state: document.getElementById(prefix + 'StateOther').value.trim()
      };
    }
    return {country: countrySel.value, state: document.getElementById(prefix + 'State').value};
  }
  document.getElementById('fCountry').addEventListener('change', (e)=>{ toggleOtherCountryFields('f', e.target.value); checkFormReady(); });
  document.getElementById('eCountry').addEventListener('change', (e)=>{ toggleOtherCountryFields('e', e.target.value); checkEditFormReady(); });

  // --- add gym flow ---
  const modalBackdrop = document.getElementById('modalBackdrop');
  const pinStatus = document.getElementById('pinStatus');
  const submitBtn = document.getElementById('submitBtn');
  const placingBanner = document.getElementById('placingBanner');
  const editModalBackdrop = document.getElementById('editModalBackdrop');
  const editPinStatus = document.getElementById('editPinStatus');

  // Signed-in only (per the RLS policy in schema.sql), and a client-side
  // pre-check against the same rolling-24h/10-submission cap so someone
  // who's already hit it gets told before filling out the whole form,
  // not after. The actual limit is enforced server-side either way --
  // this is just a nicer UX in front of it, and fails open (opens the
  // form) if the count query itself errors.
  document.getElementById('addBtn').addEventListener('click', async ()=>{
    const user = window.auth.user;
    if(!user){ showToast('Sign in to add a location'); openAuthModal(); return; }
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const dayAgo = new Date(Date.now() - 24*60*60*1000).toISOString();
    const {count, error} = await window.sb.from('spots')
      .select('id', {count:'exact', head:true})
      .eq('submitted_by', user.id)
      .gte('created_at', dayAgo);
    if(!error && count >= 10){
      showToast("You've reached today's limit of 10 submissions — try again tomorrow.");
      return;
    }
    placingPin = null;
    submitBtn.disabled = true;
    pinStatus.textContent = 'No pin dropped yet — click "Drop pin" then tap the map.';
    pinStatus.classList.remove('set');
    ['fName','fSuburb','fAddress','fNotes','fPhoto','fCountryOther','fStateOther'].forEach(id=>document.getElementById(id).value='');
    ['fTypeIndoor','fTypeTopRope','fTypeLead'].forEach(id=>document.getElementById(id).checked=false);
    document.getElementById('fCountry').value = 'AU';
    toggleOtherCountryFields('f', 'AU');
    modalBackdrop.classList.remove('hidden');
  });

  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  function closeModal(){
    modalBackdrop.classList.add('hidden');
    stopPlacing();
  }

  document.getElementById('dropPinBtn').addEventListener('click', ()=>{
    modalBackdrop.classList.add('hidden');
    startPlacing('add');
  });

  function startPlacing(mode){
    placingMode = mode;
    isPlacing = true;
    placingBanner.classList.add('show');
    map.getContainer().style.cursor = 'crosshair';
  }
  function stopPlacing(){
    isPlacing = false;
    placingBanner.classList.remove('show');
    map.getContainer().style.cursor = '';
  }

  map.on('click', (e)=>{
    if(!isPlacing) return;
    const pt = {lat: e.lngLat.lat, lng: e.lngLat.lng};
    const mode = placingMode;
    stopPlacing();
    placingMode = null;
    if(mode === 'edit'){
      currentEditPin = pt;
      editPinStatus.textContent = `Pin set at ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}`;
      editPinStatus.classList.add('set');
      editModalBackdrop.classList.remove('hidden');
      checkEditFormReady();
    } else {
      placingPin = pt;
      pinStatus.textContent = `Pin set at ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}`;
      pinStatus.classList.add('set');
      modalBackdrop.classList.remove('hidden');
      checkFormReady();
    }
  });

  ['fName','fSuburb'].forEach(id=>{
    document.getElementById(id).addEventListener('input', checkFormReady);
  });
  ['fTypeIndoor','fTypeTopRope','fTypeLead'].forEach(id=>{
    document.getElementById(id).addEventListener('change', checkFormReady);
  });
  function selectedTypes(){
    const map = {fTypeIndoor:'indoor-bouldering', fTypeTopRope:'top-rope', fTypeLead:'lead-climbing'};
    return Object.keys(map).filter(id=>document.getElementById(id).checked).map(id=>map[id]);
  }
  function checkFormReady(){
    const name = document.getElementById('fName').value.trim();
    const suburb = document.getElementById('fSuburb').value.trim();
    const {country, state} = getCountryState('f');
    submitBtn.disabled = !(name && suburb && country && state && placingPin && selectedTypes().length > 0);
  }
  ['fCountryOther','fStateOther'].forEach(id=>{
    document.getElementById(id).addEventListener('input', checkFormReady);
  });

  document.getElementById('submitBtn').addEventListener('click', async ()=>{
    if(!placingPin) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const user = window.auth.user;
    if(!user){ showToast('Sign in to add a location'); closeModal(); openAuthModal(); return; }
    const {country, state} = getCountryState('f');
    const gym = {
      id: 'community-' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now()),
      name: document.getElementById('fName').value.trim(),
      suburb: document.getElementById('fSuburb').value.trim(),
      state,
      country,
      types: selectedTypes(),
      address: document.getElementById('fAddress').value.trim() || null,
      notes: document.getElementById('fNotes').value.trim() || null,
      photo: document.getElementById('fPhoto').value.trim() || null,
      lat: placingPin.lat,
      lng: placingPin.lng,
      submitted_by: user.id,
      community: true,
      edited: false,
      status: 'pending'
    };
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';
    try{
      const {error} = await window.sb.from('spots').insert(gym);
      if(error) throw error;
      showToast('Submitted — a moderator will review it before it appears on the map.');
      submitBtn.textContent = 'Add to map';
      closeModal();
    }catch(err){
      // The RLS policy (schema.sql) is the real enforcement of the sign-in +
      // 10/day rules -- this is just a clearer message for the rare case the
      // client-side pre-check missed (a race, or its own query erroring).
      const rlsRejected = /row-level security|permission denied/i.test(err.message||'');
      showToast(rlsRejected ? "Couldn't save — you may have reached today's submission limit." : 'Could not save — try again');
      console.error(err);
      submitBtn.textContent = 'Add to map';
      submitBtn.disabled = false;
    }
  });

  // --- edit spot flow ---
  function openEditModal(id){
    const g = spots.find(x=>x.id===id);
    if(!g) return;
    currentEditId = id;
    currentEditPin = {lat: g.lat, lng: g.lng};
    document.getElementById('eName').value = g.name;
    document.getElementById('eSuburb').value = g.suburb;
    if(STATES_BY_COUNTRY[g.country]){
      document.getElementById('eCountry').value = g.country;
      toggleOtherCountryFields('e', g.country);
      document.getElementById('eState').value = g.state;
    } else {
      // g.country isn't one of the supported dropdown countries -- this spot
      // was itself submitted through the "Other (not listed)" path (or has a
      // country this map hasn't formally added chip/colour support for yet).
      document.getElementById('eCountry').value = 'OTHER';
      toggleOtherCountryFields('e', 'OTHER');
      document.getElementById('eCountryOther').value = g.country;
      document.getElementById('eStateOther').value = g.state;
    }
    document.getElementById('eAddress').value = g.address || '';
    document.getElementById('eNotes').value = g.notes || '';
    document.getElementById('ePhoto').value = g.photo || '';
    document.getElementById('eTypeIndoor').checked = g.types.includes('indoor-bouldering');
    document.getElementById('eTypeTopRope').checked = g.types.includes('top-rope');
    document.getElementById('eTypeLead').checked = g.types.includes('lead-climbing');
    editPinStatus.textContent = `Current pin: ${g.lat.toFixed(4)}, ${g.lng.toFixed(4)}`;
    editPinStatus.classList.remove('set');
    // Revert only makes sense for un-edited-back-to seed spots — community
    // submissions have no "original" snapshot stored anywhere to revert to.
    const canRevert = g.edited && !g.community && (window.SEED_GYMS||[]).some(s=>s.id===id);
    document.getElementById('eRevertBtn').style.display = canRevert ? 'block' : 'none';
    checkEditFormReady();
    editModalBackdrop.classList.remove('hidden');
  }
  window.__editSpot = openEditModal;

  function closeEditModal(){
    editModalBackdrop.classList.add('hidden');
    stopPlacing();
    currentEditId = null;
  }
  document.getElementById('eCancelBtn').addEventListener('click', closeEditModal);

  document.getElementById('eDropPinBtn').addEventListener('click', ()=>{
    editModalBackdrop.classList.add('hidden');
    startPlacing('edit');
  });

  ['eName','eSuburb'].forEach(id=>{
    document.getElementById(id).addEventListener('input', checkEditFormReady);
  });
  ['eTypeIndoor','eTypeTopRope','eTypeLead'].forEach(id=>{
    document.getElementById(id).addEventListener('change', checkEditFormReady);
  });
  function selectedEditTypes(){
    const map = {eTypeIndoor:'indoor-bouldering', eTypeTopRope:'top-rope', eTypeLead:'lead-climbing'};
    return Object.keys(map).filter(id=>document.getElementById(id).checked).map(id=>map[id]);
  }
  function checkEditFormReady(){
    const name = document.getElementById('eName').value.trim();
    const suburb = document.getElementById('eSuburb').value.trim();
    const {country, state} = getCountryState('e');
    document.getElementById('eSaveBtn').disabled = !(name && suburb && country && state && currentEditPin && selectedEditTypes().length > 0);
  }
  ['eCountryOther','eStateOther'].forEach(id=>{
    document.getElementById(id).addEventListener('input', checkEditFormReady);
  });

  document.getElementById('eSaveBtn').addEventListener('click', async ()=>{
    if(!currentEditId || !currentEditPin) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const {country, state} = getCountryState('e');
    const proposal = {
      spot_id: currentEditId,
      name: document.getElementById('eName').value.trim(),
      suburb: document.getElementById('eSuburb').value.trim(),
      state,
      country,
      types: selectedEditTypes(),
      address: document.getElementById('eAddress').value.trim() || null,
      notes: document.getElementById('eNotes').value.trim() || null,
      photo: document.getElementById('ePhoto').value.trim() || null,
      lat: currentEditPin.lat,
      lng: currentEditPin.lng
    };
    const saveBtn = document.getElementById('eSaveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    try{
      const {error} = await window.sb.from('pending_edits').insert(proposal);
      if(error) throw error;
      showToast('Edit submitted — a moderator will review it before it goes live.');
      saveBtn.textContent = 'Save changes';
      closeEditModal();
    }catch(err){
      showToast('Could not save — try again');
      console.error(err);
      saveBtn.textContent = 'Save changes';
      saveBtn.disabled = false;
    }
  });

  document.getElementById('eRevertBtn').addEventListener('click', async ()=>{
    if(!currentEditId) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const id = currentEditId;
    const original = (window.SEED_GYMS||[]).find(s=>s.id===id);
    if(!original){ showToast('No original data to revert to'); return; }
    const proposal = {
      spot_id: id,
      name: original.name, suburb: original.suburb, state: original.state, country: original.country,
      types: original.types, address: original.address || null, notes: original.notes || null, photo: original.photo || null,
      lat: original.lat, lng: original.lng
    };
    try{
      const {error} = await window.sb.from('pending_edits').insert(proposal);
      if(error) throw error;
      showToast('Revert submitted — a moderator will review it before it goes live.');
      closeEditModal();
    }catch(err){
      showToast('Could not submit revert — try again');
      console.error(err);
    }
  });

  // --- report incorrect info flow ---
  const reportModalBackdrop = document.getElementById('reportModalBackdrop');
  const rMessage = document.getElementById('rMessage');
  const rSubmitBtn = document.getElementById('rSubmitBtn');

  function openReportModal(id){
    const g = spots.find(x=>x.id===id);
    if(!g) return;
    currentReportId = id;
    document.getElementById('reportSpotName').textContent = g.name;
    rMessage.value = '';
    rSubmitBtn.disabled = true;
    reportModalBackdrop.classList.remove('hidden');
  }
  window.__reportSpot = openReportModal;

  function closeReportModal(){
    reportModalBackdrop.classList.add('hidden');
    currentReportId = null;
  }
  document.getElementById('rCancelBtn').addEventListener('click', closeReportModal);

  rMessage.addEventListener('input', ()=>{
    rSubmitBtn.disabled = !rMessage.value.trim();
  });

  rSubmitBtn.addEventListener('click', async ()=>{
    if(!currentReportId || !rMessage.value.trim()) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    rSubmitBtn.disabled = true;
    rSubmitBtn.textContent = 'Sending…';
    try{
      const {error} = await window.sb.from('reports').insert({
        spot_id: currentReportId,
        message: rMessage.value.trim()
      });
      if(error) throw error;
      showToast('Report sent — thanks for the heads up.');
      rSubmitBtn.textContent = 'Send report';
      closeReportModal();
    }catch(err){
      showToast('Could not send report — try again');
      console.error(err);
      rSubmitBtn.textContent = 'Send report';
      rSubmitBtn.disabled = false;
    }
  });

  // --- load spots + marks on start ---
  async function loadSpots(){
    if(window.sb){
      try{
        // PostgREST caps a single response at 1000 rows by default, so a
        // bare select silently dropped everything past the first 1000 once
        // the dataset outgrew that. Page through in 1000-row chunks until a
        // short page comes back.
        const PAGE = 1000;
        const all = [];
        for(let from = 0;; from += PAGE){
          const {data, error} = await window.sb.from('spots').select('*').eq('status','approved')
            .order('id').range(from, from + PAGE - 1);
          if(error) throw error;
          all.push(...(data || []));
          if(!data || data.length < PAGE) break;
        }
        spots = all;
        usingFallback = false;
        return;
      }catch(err){
        console.error('Failed to load spots from Supabase', err);
      }
    }
    usingFallback = true;
    spots = (window.SEED_GYMS || []).slice();
  }

  async function checkModerator(){
    isModerator = false;
    const user = window.auth.user;
    if(!user || !window.sb) return;
    try{
      const {data, error} = await window.sb.from('moderators').select('user_id').eq('user_id', user.id).maybeSingle();
      if(error) throw error;
      isModerator = !!data;
    }catch(err){
      console.error('Failed to check moderator status', err);
    }
  }

  async function loadPending(){
    pendingSpots = [];
    pendingEdits = [];
    pendingReports = [];
    if(!isModerator || !window.sb) return;
    try{
      const [{data: pSpots, error: e1}, {data: pEdits, error: e2}, {data: pReports, error: e3}] = await Promise.all([
        window.sb.from('spots').select('*').eq('status','pending'),
        window.sb.from('pending_edits').select('*'),
        window.sb.from('reports').select('*')
      ]);
      if(e1) throw e1;
      if(e2) throw e2;
      if(e3) throw e3;
      pendingSpots = pSpots || [];
      pendingEdits = pEdits || [];
      pendingReports = pReports || [];
    }catch(err){
      console.error('Failed to load pending items', err);
    }
  }

  async function loadMarks(){
    climbedIds = new Set();
    bookmarkedIds = new Set();
    const user = window.auth.user;
    if(!user || !window.sb) return;
    try{
      const {data, error} = await window.sb.from('marks').select('spot_id, mark_type').eq('user_id', user.id);
      if(error) throw error;
      (data||[]).forEach(m=>{
        if(m.mark_type === 'climbed') climbedIds.add(m.spot_id);
        else if(m.mark_type === 'bookmarked') bookmarkedIds.add(m.spot_id);
      });
    }catch(err){
      console.error('Failed to load marks', err);
    }
  }

  // --- logbook: private per-user climbing diary (sessions + the climbs logged within each) ---
  async function loadSessions(){
    sessions = [];
    const user = window.auth.user;
    if(!user || !window.sb) return;
    try{
      const {data, error} = await window.sb.from('sessions')
        .select('*, session_climbs(*)')
        .eq('user_id', user.id)
        .order('session_date', {ascending:false});
      if(error) throw error;
      sessions = data || [];
    }catch(err){
      console.error('Failed to load sessions', err);
    }
  }

  function spotLabel(spotId){
    if(!spotId) return 'No specific gym';
    const g = spots.find(s=>s.id===spotId) || (window.SEED_GYMS||[]).find(s=>s.id===spotId);
    return g ? g.name : 'Unknown gym';
  }

  function renderLogbookList(){
    const list = document.getElementById('logbookList');
    if(!sessions.length){
      list.innerHTML = '<div class="empty-state">No sessions logged yet — click "Log a session" to start your diary.</div>';
      return;
    }
    list.innerHTML = sessions.map(s=>{
      const climbs = s.session_climbs || [];
      const chips = climbs.map(c=>`<span class="climb-chip ${c.sent?'sent':''}">${TYPE_LABELS[c.climb_type]||c.climb_type} ${escapeHtml(c.grade)}${c.attempts>1?` ×${c.attempts}`:''}</span>`).join('');
      return `<div class="session-item" data-id="${s.id}">
        <div class="pending-kind">${escapeHtml(s.session_date)} · ${MOOD_EMOJI[s.mood]||''} ${escapeHtml(spotLabel(s.spot_id))}</div>
        ${chips ? `<div class="climb-chips">${chips}</div>` : '<div class="pending-notes">No climbs logged this session.</div>'}
        ${s.notes ? `<div class="pending-notes">${escapeHtml(s.notes)}</div>` : ''}
        <div class="pending-actions">
          <button class="btn-cancel session-delete" data-id="${s.id}">Delete</button>
        </div>
      </div>`;
    }).join('');
  }

  const logbookModalBackdrop = document.getElementById('logbookModalBackdrop');
  logbookModalBackdrop.addEventListener('click', (e)=>{
    if(e.target === logbookModalBackdrop) logbookModalBackdrop.classList.add('hidden');
  });
  async function openLogbookModal(){
    if(!window.auth.user){ showToast('Sign in to use your logbook'); return; }
    await loadSessions();
    renderLogbookList();
    logbookModalBackdrop.classList.remove('hidden');
  }
  document.getElementById('logbookBtn').addEventListener('click', openLogbookModal);

  document.getElementById('logbookList').addEventListener('click', async (e)=>{
    const btn = e.target.closest('.session-delete');
    if(!btn) return;
    btn.disabled = true;
    try{
      const {error} = await window.sb.from('sessions').delete().eq('id', btn.dataset.id);
      if(error) throw error;
      showToast('Session deleted');
    }catch(err){
      showToast('Could not delete — try again');
      console.error(err);
    }
    await loadSessions();
    renderLogbookList();
  });

  // --- logbook: "Log a session" form ---
  const addSessionModalBackdrop = document.getElementById('addSessionModalBackdrop');
  addSessionModalBackdrop.addEventListener('click', (e)=>{
    if(e.target === addSessionModalBackdrop) closeAddSessionModal();
  });
  const sClimbsList = document.getElementById('sClimbsList');
  let gymSelectPopulated = false;

  function populateGymSelect(){
    if(gymSelectPopulated) return;
    const sel = document.getElementById('sGym');
    const sorted = spots.slice().sort((a,b)=>a.name.localeCompare(b.name));
    sorted.forEach(g=>{
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = `${g.name} — ${g.suburb}`;
      sel.appendChild(opt);
    });
    gymSelectPopulated = true;
  }

  function renderClimbRows(){
    sClimbsList.innerHTML = draftClimbs.map((c, i)=>`
      <div class="climb-row" data-index="${i}">
        <select class="climb-type" data-field="climb_type">
          <option value="indoor-bouldering" ${c.climb_type==='indoor-bouldering'?'selected':''}>Boulder</option>
          <option value="top-rope" ${c.climb_type==='top-rope'?'selected':''}>Top rope</option>
          <option value="lead-climbing" ${c.climb_type==='lead-climbing'?'selected':''}>Lead</option>
        </select>
        <input type="text" class="climb-grade" data-field="grade" placeholder="Grade, e.g. V2" value="${escapeHtml(c.grade||'')}">
        <input type="number" class="climb-attempts" data-field="attempts" min="1" value="${c.attempts||1}" title="Attempts">
        <label class="climb-sent"><input type="checkbox" data-field="sent" ${c.sent?'checked':''}> Sent</label>
        <button type="button" class="remove-climb-btn" title="Remove">✕</button>
      </div>`).join('');
  }

  function addClimbRow(){
    draftClimbs.push({climb_type:'indoor-bouldering', grade:'', attempts:1, sent:true});
    renderClimbRows();
  }

  sClimbsList.addEventListener('input', (e)=>{
    const row = e.target.closest('.climb-row');
    if(!row) return;
    const i = Number(row.dataset.index);
    const field = e.target.dataset.field;
    if(!field) return;
    if(field === 'attempts') draftClimbs[i][field] = Math.max(1, Number(e.target.value)||1);
    else if(field === 'sent') draftClimbs[i][field] = e.target.checked;
    else draftClimbs[i][field] = e.target.value;
  });
  sClimbsList.addEventListener('click', (e)=>{
    if(!e.target.closest('.remove-climb-btn')) return;
    const row = e.target.closest('.climb-row');
    draftClimbs.splice(Number(row.dataset.index), 1);
    renderClimbRows();
  });
  document.getElementById('sAddClimbBtn').addEventListener('click', addClimbRow);

  function openAddSessionModal(){
    populateGymSelect();
    document.getElementById('sDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('sMood').value = 'good';
    document.getElementById('sGym').value = '';
    document.getElementById('sNotes').value = '';
    draftClimbs = [];
    addClimbRow();
    logbookModalBackdrop.classList.add('hidden');
    addSessionModalBackdrop.classList.remove('hidden');
  }
  document.getElementById('addSessionBtn').addEventListener('click', openAddSessionModal);

  function closeAddSessionModal(){
    addSessionModalBackdrop.classList.add('hidden');
    logbookModalBackdrop.classList.remove('hidden');
  }
  document.getElementById('sCancelBtn').addEventListener('click', closeAddSessionModal);

  document.getElementById('sSaveBtn').addEventListener('click', async ()=>{
    const date = document.getElementById('sDate').value;
    if(!date){ showToast('Pick a date first'); return; }
    const saveBtn = document.getElementById('sSaveBtn');
    saveBtn.disabled = true;
    try{
      const {data: session, error: e1} = await window.sb.from('sessions').insert({
        user_id: window.auth.user.id,
        spot_id: document.getElementById('sGym').value || null,
        session_date: date,
        mood: document.getElementById('sMood').value,
        notes: document.getElementById('sNotes').value.trim() || null
      }).select().single();
      if(e1) throw e1;
      const climbRows = draftClimbs.filter(c=>c.grade.trim());
      if(climbRows.length){
        const {error: e2} = await window.sb.from('session_climbs').insert(climbRows.map(c=>({
          session_id: session.id,
          climb_type: c.climb_type,
          grade: c.grade.trim(),
          grade_system: c.climb_type === 'indoor-bouldering' ? 'v-scale' : 'yds',
          attempts: c.attempts,
          sent: c.sent
        })));
        if(e2) throw e2;
      }
      showToast('Session saved ✓');
      closeAddSessionModal();
      await loadSessions();
      renderLogbookList();
    }catch(err){
      showToast('Could not save session — try again');
      console.error(err);
    }
    saveBtn.disabled = false;
  });

  // --- moderation: pending review panel ---
  const pendingModalBackdrop = document.getElementById('pendingModalBackdrop');
  const pendingReviewBtn = document.getElementById('pendingReviewBtn');

  function renderPendingBadge(){
    if(!isModerator){
      pendingReviewBtn.style.display = 'none';
      return;
    }
    const count = pendingSpots.length + pendingEdits.length + pendingReports.length;
    pendingReviewBtn.style.display = '';
    pendingReviewBtn.textContent = count ? `Pending review (${count})` : 'Pending review';
  }

  function renderPendingPanel(){
    const list = document.getElementById('pendingList');
    const cards = [];
    pendingSpots.forEach(g=>{
      cards.push(`<div class="pending-item">
        <div class="pending-kind">New spot</div>
        <div class="popup-name">${escapeHtml(g.name)}</div>
        <div class="popup-meta">${escapeHtml(g.suburb)}, ${g.state} (${g.country}) · ${g.types.map(t=>TYPE_LABELS[t]||t).join(' · ')}</div>
        ${g.address?`<div class="pending-notes">${escapeHtml(g.address)}</div>`:''}
        ${g.notes?`<div class="pending-notes">${escapeHtml(g.notes)}</div>`:''}
        ${g.photo?`<div class="pending-notes">Photo: <a href="${escapeHtml(g.photo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(g.photo)}</a></div>`:''}
        <div class="pending-actions">
          <button class="btn-cancel pending-reject" data-kind="spot" data-id="${g.id}">Reject</button>
          <button class="btn-submit pending-approve" data-kind="spot" data-id="${g.id}">Approve</button>
        </div>
      </div>`);
    });
    pendingEdits.forEach(pe=>{
      const target = spots.find(s=>s.id===pe.spot_id) || (window.SEED_GYMS||[]).find(s=>s.id===pe.spot_id);
      cards.push(`<div class="pending-item">
        <div class="pending-kind">Edit to ${escapeHtml(target?target.name:pe.spot_id)}</div>
        <div class="popup-name">${escapeHtml(pe.name)}</div>
        <div class="popup-meta">${escapeHtml(pe.suburb)}, ${pe.state} (${pe.country}) · ${pe.types.map(t=>TYPE_LABELS[t]||t).join(' · ')}</div>
        ${pe.address?`<div class="pending-notes">${escapeHtml(pe.address)}</div>`:''}
        ${pe.notes?`<div class="pending-notes">${escapeHtml(pe.notes)}</div>`:''}
        ${pe.photo?`<div class="pending-notes">Photo: <a href="${escapeHtml(pe.photo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(pe.photo)}</a></div>`:''}
        <div class="pending-actions">
          <button class="btn-cancel pending-reject" data-kind="edit" data-id="${pe.id}">Reject</button>
          <button class="btn-submit pending-approve" data-kind="edit" data-id="${pe.id}">Approve</button>
        </div>
      </div>`);
    });
    pendingReports.forEach(r=>{
      const target = spots.find(s=>s.id===r.spot_id) || (window.SEED_GYMS||[]).find(s=>s.id===r.spot_id);
      cards.push(`<div class="pending-item">
        <div class="pending-kind">Report on ${escapeHtml(target?target.name:r.spot_id)}</div>
        <div class="pending-notes">${escapeHtml(r.message)}</div>
        <div class="pending-actions">
          <button class="btn-cancel pending-dismiss" data-kind="report" data-id="${r.id}">Dismiss</button>
          <button class="btn-submit pending-edit-spot" data-kind="report" data-spot-id="${r.spot_id}">Edit this spot</button>
        </div>
      </div>`);
    });
    list.innerHTML = cards.length ? cards.join('') : '<div class="empty-state">Nothing pending review.</div>';
  }

  function openPendingModal(){
    renderPendingPanel();
    pendingModalBackdrop.classList.remove('hidden');
  }
  pendingReviewBtn.addEventListener('click', openPendingModal);

  async function refreshAfterModeration(){
    await loadSpots();
    await loadPending();
    renderPendingPanel();
    renderPendingBadge();
    render();
  }

  async function approveSpot(id){
    try{
      const {error} = await window.sb.from('spots').update({status:'approved'}).eq('id', id);
      if(error) throw error;
      showToast('Spot approved ✓');
    }catch(err){
      showToast('Could not approve — try again');
      console.error(err);
    }
    await refreshAfterModeration();
  }

  async function rejectSpot(id){
    try{
      const {error} = await window.sb.from('spots').delete().eq('id', id);
      if(error) throw error;
      showToast('Spot rejected');
    }catch(err){
      showToast('Could not reject — try again');
      console.error(err);
    }
    await refreshAfterModeration();
  }

  async function approveEdit(pendingEditId){
    const pe = pendingEdits.find(p=>p.id===pendingEditId);
    if(!pe) return;
    try{
      const {error: e1} = await window.sb.from('spots').update({
        name: pe.name, suburb: pe.suburb, state: pe.state, country: pe.country,
        types: pe.types, address: pe.address, notes: pe.notes, photo: pe.photo, lat: pe.lat, lng: pe.lng,
        edited: true, updated_at: new Date().toISOString()
      }).eq('id', pe.spot_id);
      if(e1) throw e1;
      const {error: e2} = await window.sb.from('pending_edits').delete().eq('id', pe.id);
      if(e2) throw e2;
      showToast('Edit approved ✓');
    }catch(err){
      showToast('Could not approve edit — try again');
      console.error(err);
    }
    await refreshAfterModeration();
  }

  async function rejectEdit(pendingEditId){
    try{
      const {error} = await window.sb.from('pending_edits').delete().eq('id', pendingEditId);
      if(error) throw error;
      showToast('Edit rejected');
    }catch(err){
      showToast('Could not reject — try again');
      console.error(err);
    }
    await refreshAfterModeration();
  }

  async function dismissReport(id){
    try{
      const {error} = await window.sb.from('reports').delete().eq('id', id);
      if(error) throw error;
      showToast('Report dismissed');
    }catch(err){
      showToast('Could not dismiss — try again');
      console.error(err);
    }
    await refreshAfterModeration();
  }

  document.getElementById('pendingList').addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const kind = btn.dataset.kind;
    const id = btn.dataset.id;
    if(btn.classList.contains('pending-approve')){
      btn.closest('.pending-actions').querySelectorAll('button').forEach(b=>b.disabled=true);
      if(kind === 'spot') approveSpot(id); else approveEdit(id);
    } else if(btn.classList.contains('pending-reject')){
      btn.closest('.pending-actions').querySelectorAll('button').forEach(b=>b.disabled=true);
      if(kind === 'spot') rejectSpot(id); else rejectEdit(id);
    } else if(btn.classList.contains('pending-dismiss')){
      btn.closest('.pending-actions').querySelectorAll('button').forEach(b=>b.disabled=true);
      dismissReport(id);
    } else if(btn.classList.contains('pending-edit-spot')){
      pendingModalBackdrop.classList.add('hidden');
      openEditModal(btn.dataset.spotId);
    }
  });

  async function init(){
    await window.auth.init();
    window.auth.onChange(async (user)=>{
      renderAuthUI(user);
      await loadMarks();
      await checkModerator();
      await loadPending();
      renderPendingBadge();
      render();
      if(user) closeAuthModal();
    });
    await loadSpots();
    await loadMarks();
    await checkModerator();
    await loadPending();
    renderAuthUI(window.auth.user);
    renderPendingBadge();
    render();
    if(usingFallback){
      document.getElementById('offlineBanner').classList.remove('hidden');
    }
  }

  // --- info modals: privacy / terms (About is now a standalone page, about.html) ---
  const infoModals = {
    openPrivacy: 'privacyModalBackdrop',
    openTerms: 'termsModalBackdrop'
  };
  Object.keys(infoModals).forEach(btnId=>{
    document.getElementById(btnId).addEventListener('click', ()=>{
      document.getElementById(infoModals[btnId]).classList.remove('hidden');
    });
  });
  document.querySelectorAll('.info-close').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.target.closest('.modal-backdrop').classList.add('hidden');
    });
  });
  ['privacyModalBackdrop','termsModalBackdrop','pendingModalBackdrop'].forEach(id=>{
    document.getElementById(id).addEventListener('click', (e)=>{
      if(e.target.id === id) e.target.classList.add('hidden');
    });
  });

  init();
})();
