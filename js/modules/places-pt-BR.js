// Brazilian Portuguese place names for the interface: region labels (regions.js STATES_BY_COUNTRY codes) and metro names
// (metros.js, key COUNTRY:slug). Only names that differ from English; anything missing shows in English. Standard names only.
export default {
  regions: {
    DE: {
      BAYERN: 'Baviera', BERLIN: 'Berlim', NORDRHEIN_WESTFALEN: 'Renânia do Norte-Vestfália', HESSEN: 'Hesse',
      SACHSEN: 'Saxônia', NIEDERSACHSEN: 'Baixa Saxônia', SACHSEN_ANHALT: 'Saxônia-Anhalt', BRANDENBURG: 'Brandemburgo',
      RHEINLAND_PFALZ: 'Renânia-Palatinado', HAMBURG: 'Hamburgo', SAARLAND: 'Sarre', THURINGEN: 'Turíngia',
      MECKLENBURG_VORPOMMERN: 'Mecklemburgo-Pomerânia Ocidental',
    },
    AT: {
      KARNTEN: 'Caríntia', NIEDEROSTERREICH: 'Baixa Áustria', OBEROSTERREICH: 'Alta Áustria', SALZBURG: 'Salzburgo',
      STEIERMARK: 'Estíria', WIEN: 'Viena',
    },
    CH: {
      AARGAU: 'Argóvia', BASEL_LANDSCHAFT: 'Basileia-Campo', BASEL_STADT: 'Basileia-Cidade', BERN: 'Berna', FRIBOURG: 'Friburgo',
      GENEVE: 'Genebra', GRAUBUNDEN: 'Grisões', LUZERN: 'Lucerna', SOLOTHURN: 'Soleura', ST_GALLEN: 'São Galo',
      THURGAU: 'Turgóvia', TICINO: 'Tessino', ZURICH: 'Zurique',
    },
    FR: {
      AUVERGNE_RHONE_ALPES: 'Auvérnia-Ródano-Alpes', BOURGOGNE_FRANCHE_COMTE: 'Borgonha-Franco-Condado', BRETAGNE: 'Bretanha',
      CENTRE_VAL_DE_LOIRE: 'Centro-Vale do Loire', CORSE: 'Córsega', GRAND_EST: 'Grande Leste', HAUTS_DE_FRANCE: 'Alta França',
      ILE_DE_FRANCE: 'Ilha de França', NORMANDIE: 'Normandia', NOUVELLE_AQUITAINE: 'Nova Aquitânia', OCCITANIE: 'Occitânia',
      PAYS_DE_LA_LOIRE: 'País do Loire', PACA: 'Provença-Alpes-Costa Azul',
    },
    BE: { FLANDERS: 'Flandres', WALLONIA: 'Valônia', BRUSSELS: 'Bruxelas-Capital' },
    IT: {
      ABRUZZO: 'Abruzos', CALABRIA: 'Calábria', CAMPANIA: 'Campânia', EMILIA_ROMAGNA: 'Emília-Romanha',
      FRIULI_VENEZIA_GIULIA: 'Friuli-Venécia Júlia', LAZIO: 'Lácio', LIGURIA: 'Ligúria', LOMBARDIA: 'Lombardia', MARCHE: 'Marcas',
      PUGLIA: 'Púglia', SARDEGNA: 'Sardenha', SICILIA: 'Sicília', TRENTINO_ALTO_ADIGE: 'Trentino-Alto Ádige', UMBRIA: 'Úmbria',
      VALLE_DAOSTA: 'Vale de Aosta', VENETO: 'Vêneto',
    },
    MX: { CIUDAD_DE_MEXICO: 'Cidade do México' },
    NL: {
      DRENTHE: 'Drente', FRIESLAND: 'Frísia', GELDERLAND: 'Guéldria', GRONINGEN: 'Groninga', LIMBURG: 'Limburgo',
      NOORD_BRABANT: 'Brabante do Norte', NOORD_HOLLAND: 'Holanda do Norte', ZEELAND: 'Zelândia', ZUID_HOLLAND: 'Holanda do Sul',
    },
    CZ: { PRAHA: 'Praga' },
    GB: { ENGLAND: 'Inglaterra', SCOTLAND: 'Escócia', WALES: 'País de Gales', NORTHERN_IRELAND: 'Irlanda do Norte' },
    US: {
      AK: 'Alasca', CA: 'Califórnia', FL: 'Flórida', GA: 'Geórgia', HI: 'Havaí', LA: 'Luisiana', NY: 'Nova York', NJ: 'Nova Jersey',
      NM: 'Novo México', NH: 'Novo Hampshire', NC: 'Carolina do Norte', SC: 'Carolina do Sul', ND: 'Dakota do Norte',
      SD: 'Dakota do Sul', PA: 'Pensilvânia', VA: 'Virgínia', WV: 'Virgínia Ocidental', DC: 'Distrito de Colúmbia',
    },
    CA: {
      BC: 'Colúmbia Britânica', NB: 'Nova Brunswick', NL: 'Terra Nova e Labrador', NT: 'Territórios do Noroeste',
      NS: 'Nova Escócia', PE: 'Ilha do Príncipe Eduardo', ON: 'Ontário',
    },
    AU: {
      NSW: 'Nova Gales do Sul', WA: 'Austrália Ocidental', SA: 'Austrália Meridional', TAS: 'Tasmânia',
      NT: 'Território do Norte', ACT: 'Território da Capital Australiana',
    },
    CN: { BEIJING: 'Pequim', SHANGHAI: 'Xangai' },
    JP: { TOKYO: 'Tóquio', KYOTO: 'Quioto' },
    KR: { SEOUL: 'Seul' },
  },
  metros: {
    'AT:vienna': 'Viena', 'BG:sofia': 'Sófia', 'CH:bern': 'Berna', 'CH:geneva': 'Genebra', 'CH:zurich': 'Zurique',
    'CN:beijing': 'Pequim', 'CN:nanjing': 'Nanquim', 'CN:shanghai': 'Xangai', 'CZ:prague': 'Praga', 'DE:cologne': 'Colônia',
    'DE:hamburg': 'Hamburgo', 'DE:munich': 'Munique', 'DE:nuremberg': 'Nuremberga', 'DK:copenhagen': 'Copenhague',
    'FI:helsinki': 'Helsinque', 'FR:marseille': 'Marselha', 'GB:edinburgh': 'Edimburgo', 'GB:london': 'Londres',
    'GR:athens': 'Atenas', 'HU:budapest': 'Budapeste', 'ID:jakarta': 'Jacarta', 'IT:rome': 'Roma', 'JP:kyoto': 'Quioto',
    'JP:tokyo': 'Tóquio', 'KR:seoul': 'Seul', 'MX:mexico-city': 'Cidade do México', 'NL:the-hague': 'Haia', 'PL:krakow': 'Cracóvia',
    'PL:warsaw': 'Varsóvia', 'PT:lisbon': 'Lisboa', 'RO:bucharest': 'Bucareste', 'RU:moscow': 'Moscou',
    'RU:saint-petersburg': 'São Petersburgo', 'SE:gothenburg': 'Gotemburgo', 'SE:stockholm': 'Estocolmo', 'SI:ljubljana': 'Liubliana',
    'TH:bangkok': 'Bangcoc', 'TW:taipei': 'Taipé', 'US:new-york': 'Nova York',
    'US:san-francisco-bay-area': 'Área da Baía de São Francisco',
  },
};
