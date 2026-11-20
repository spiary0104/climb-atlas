// Spanish place names for the interface: region labels (regions.js STATES_BY_COUNTRY codes) and metro names
// (metros.js, key COUNTRY:slug). Only names that differ from English; anything missing shows in English. Standard names only.
export default {
  regions: {
    DE: {
      BAYERN: 'Baviera', BERLIN: 'Berlín', NORDRHEIN_WESTFALEN: 'Renania del Norte-Westfalia', HESSEN: 'Hesse',
      BADEN_WURTTEMBERG: 'Baden-Wurtemberg', SACHSEN: 'Sajonia', NIEDERSACHSEN: 'Baja Sajonia', SACHSEN_ANHALT: 'Sajonia-Anhalt',
      BRANDENBURG: 'Brandeburgo', RHEINLAND_PFALZ: 'Renania-Palatinado', HAMBURG: 'Hamburgo', SAARLAND: 'Sarre',
      THURINGEN: 'Turingia', MECKLENBURG_VORPOMMERN: 'Mecklemburgo-Pomerania Occidental',
    },
    AT: {
      KARNTEN: 'Carintia', NIEDEROSTERREICH: 'Baja Austria', OBEROSTERREICH: 'Alta Austria', SALZBURG: 'Salzburgo',
      STEIERMARK: 'Estiria', WIEN: 'Viena',
    },
    CH: {
      AARGAU: 'Argovia', APPENZELL_AUSSERRHODEN: 'Appenzell Rodas Exteriores', APPENZELL_INNERRHODEN: 'Appenzell Rodas Interiores',
      BASEL_LANDSCHAFT: 'Basilea-Campiña', BASEL_STADT: 'Basilea-Ciudad', BERN: 'Berna', FRIBOURG: 'Friburgo', GENEVE: 'Ginebra',
      GLARUS: 'Glaris', GRAUBUNDEN: 'Grisones', LUZERN: 'Lucerna', SOLOTHURN: 'Soleura', ST_GALLEN: 'San Galo',
      THURGAU: 'Turgovia', TICINO: 'Tesino', ZURICH: 'Zúrich',
    },
    FR: {
      AUVERGNE_RHONE_ALPES: 'Auvernia-Ródano-Alpes', BOURGOGNE_FRANCHE_COMTE: 'Borgoña-Franco Condado', BRETAGNE: 'Bretaña',
      CENTRE_VAL_DE_LOIRE: 'Centro-Valle del Loira', CORSE: 'Córcega', GRAND_EST: 'Gran Este', HAUTS_DE_FRANCE: 'Alta Francia',
      ILE_DE_FRANCE: 'Isla de Francia', NORMANDIE: 'Normandía', NOUVELLE_AQUITAINE: 'Nueva Aquitania', OCCITANIE: 'Occitania',
      PAYS_DE_LA_LOIRE: 'Países del Loira', PACA: 'Provenza-Alpes-Costa Azul',
    },
    BE: { FLANDERS: 'Flandes', WALLONIA: 'Valonia', BRUSSELS: 'Bruselas-Capital' },
    IT: {
      ABRUZZO: 'Abruzos', EMILIA_ROMAGNA: 'Emilia-Romaña', FRIULI_VENEZIA_GIULIA: 'Friuli-Venecia Julia', LAZIO: 'Lacio',
      LOMBARDIA: 'Lombardía', MARCHE: 'Marcas', PIEMONTE: 'Piamonte', PUGLIA: 'Apulia', SARDEGNA: 'Cerdeña',
      TRENTINO_ALTO_ADIGE: 'Trentino-Alto Adigio', UMBRIA: 'Umbría', VALLE_DAOSTA: 'Valle de Aosta', VENETO: 'Véneto',
    },
    PT: { ACORES: 'Azores', PORTO: 'Oporto' },
    BR: { RIO_DE_JANEIRO: 'Río de Janeiro', RIO_GRANDE_DO_NORTE: 'Río Grande del Norte', RIO_GRANDE_DO_SUL: 'Río Grande del Sur' },
    NL: {
      DRENTHE: 'Drente', FRIESLAND: 'Frisia', GELDERLAND: 'Güeldres', GRONINGEN: 'Groninga', LIMBURG: 'Limburgo',
      NOORD_BRABANT: 'Brabante Septentrional', NOORD_HOLLAND: 'Holanda Septentrional', ZEELAND: 'Zelanda',
      ZUID_HOLLAND: 'Holanda Meridional',
    },
    CZ: { PRAHA: 'Praga' },
    GB: { ENGLAND: 'Inglaterra', SCOTLAND: 'Escocia', WALES: 'Gales', NORTHERN_IRELAND: 'Irlanda del Norte' },
    US: {
      NY: 'Nueva York', NC: 'Carolina del Norte', SC: 'Carolina del Sur', ND: 'Dakota del Norte', SD: 'Dakota del Sur',
      NJ: 'Nueva Jersey', NM: 'Nuevo México', NH: 'Nuevo Hampshire', WV: 'Virginia Occidental', LA: 'Luisiana', MS: 'Misisipi',
      PA: 'Pensilvania', MO: 'Misuri', HI: 'Hawái', DC: 'Distrito de Columbia',
    },
    CA: {
      BC: 'Columbia Británica', NB: 'Nuevo Brunswick', NL: 'Terranova y Labrador', NT: 'Territorios del Noroeste',
      NS: 'Nueva Escocia', PE: 'Isla del Príncipe Eduardo',
    },
    AU: {
      NSW: 'Nueva Gales del Sur', WA: 'Australia Occidental', SA: 'Australia Meridional', TAS: 'Tasmania',
      NT: 'Territorio del Norte', ACT: 'Territorio de la Capital Australiana',
    },
    CN: { BEIJING: 'Pekín' },
    JP: { TOKYO: 'Tokio', KYOTO: 'Kioto' },
    KR: { SEOUL: 'Seúl' },
  },
  metros: {
    'AT:vienna': 'Viena', 'CH:bern': 'Berna', 'CH:geneva': 'Ginebra', 'CH:zurich': 'Zúrich', 'CN:beijing': 'Pekín',
    'CN:nanjing': 'Nankín', 'CN:shanghai': 'Shanghái', 'CZ:prague': 'Praga', 'DE:cologne': 'Colonia', 'DE:dresden': 'Dresde',
    'DE:frankfurt': 'Fráncfort', 'DE:freiburg': 'Friburgo de Brisgovia', 'DE:hamburg': 'Hamburgo', 'DE:munich': 'Múnich',
    'DE:nuremberg': 'Núremberg', 'DK:copenhagen': 'Copenhague', 'FR:marseille': 'Marsella', 'GB:edinburgh': 'Edimburgo',
    'GB:london': 'Londres', 'GR:athens': 'Atenas', 'ID:jakarta': 'Yakarta', 'IE:dublin': 'Dublín', 'IT:rome': 'Roma',
    'JP:kyoto': 'Kioto', 'JP:tokyo': 'Tokio', 'KR:seoul': 'Seúl', 'MX:mexico-city': 'Ciudad de México', 'NL:the-hague': 'La Haya',
    'PL:krakow': 'Cracovia', 'PL:warsaw': 'Varsovia', 'PT:lisbon': 'Lisboa', 'RO:bucharest': 'Bucarest', 'RU:moscow': 'Moscú',
    'RU:saint-petersburg': 'San Petersburgo', 'SE:gothenburg': 'Gotemburgo', 'SE:stockholm': 'Estocolmo', 'TW:taipei': 'Taipéi',
    'US:new-york': 'Nueva York', 'US:san-francisco-bay-area': 'Área de la Bahía de San Francisco', 'US:san-jose': 'San José',
  },
};
