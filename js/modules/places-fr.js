// French place names for the interface: region labels (regions.js STATES_BY_COUNTRY codes) and metro names
// (metros.js, key COUNTRY:slug). Only names that differ from English; anything missing shows in English. Standard names only.
export default {
  regions: {
    DE: {
      BAYERN: 'Bavière', NORDRHEIN_WESTFALEN: 'Rhénanie-du-Nord-Westphalie', HESSEN: 'Hesse', BADEN_WURTTEMBERG: 'Bade-Wurtemberg',
      BREMEN: 'Brême', SACHSEN: 'Saxe', NIEDERSACHSEN: 'Basse-Saxe', SACHSEN_ANHALT: 'Saxe-Anhalt', BRANDENBURG: 'Brandebourg',
      RHEINLAND_PFALZ: 'Rhénanie-Palatinat', HAMBURG: 'Hambourg', SAARLAND: 'Sarre', THURINGEN: 'Thuringe',
      MECKLENBURG_VORPOMMERN: 'Mecklembourg-Poméranie-Occidentale',
    },
    AT: {
      KARNTEN: 'Carinthie', NIEDEROSTERREICH: 'Basse-Autriche', OBEROSTERREICH: 'Haute-Autriche', SALZBURG: 'Salzbourg',
      STEIERMARK: 'Styrie', TIROL: 'Tyrol', WIEN: 'Vienne',
    },
    CH: {
      AARGAU: 'Argovie', APPENZELL_AUSSERRHODEN: 'Appenzell Rhodes-Extérieures', APPENZELL_INNERRHODEN: 'Appenzell Rhodes-Intérieures',
      BASEL_LANDSCHAFT: 'Bâle-Campagne', BASEL_STADT: 'Bâle-Ville', BERN: 'Berne', GLARUS: 'Glaris', GRAUBUNDEN: 'Grisons',
      LUZERN: 'Lucerne', NIDWALDEN: 'Nidwald', OBWALDEN: 'Obwald', SCHAFFHAUSEN: 'Schaffhouse', SCHWYZ: 'Schwytz',
      SOLOTHURN: 'Soleure', ST_GALLEN: 'Saint-Gall', THURGAU: 'Thurgovie', TICINO: 'Tessin', ZUG: 'Zoug', ZURICH: 'Zurich',
    },
    BE: { FLANDERS: 'Flandre', WALLONIA: 'Wallonie', BRUSSELS: 'Bruxelles-Capitale' },
    IT: {
      ABRUZZO: 'Abruzzes', BASILICATA: 'Basilicate', CALABRIA: 'Calabre', CAMPANIA: 'Campanie', EMILIA_ROMAGNA: 'Émilie-Romagne',
      FRIULI_VENEZIA_GIULIA: 'Frioul-Vénétie Julienne', LAZIO: 'Latium', LIGURIA: 'Ligurie', LOMBARDIA: 'Lombardie',
      MARCHE: 'Marches', PIEMONTE: 'Piémont', PUGLIA: 'Pouilles', SARDEGNA: 'Sardaigne', SICILIA: 'Sicile', TOSCANA: 'Toscane',
      TRENTINO_ALTO_ADIGE: 'Trentin-Haut-Adige', UMBRIA: 'Ombrie', VALLE_DAOSTA: "Vallée d'Aoste", VENETO: 'Vénétie',
    },
    ES: {
      ANDALUCIA: 'Andalousie', ASTURIAS: 'Asturies', BALEARES: 'Baléares', CANARIAS: 'Canaries', CANTABRIA: 'Cantabrie',
      CASTILLA_LA_MANCHA: 'Castille-La Manche', CASTILLA_Y_LEON: 'Castille-et-León', CATALUNYA: 'Catalogne',
      EXTREMADURA: 'Estrémadure', GALICIA: 'Galice', MADRID: 'Communauté de Madrid', MURCIA: 'Murcie', NAVARRA: 'Navarre',
      PAIS_VASCO: 'Pays basque',
    },
    PT: { LISBOA: 'Lisbonne', MADEIRA: 'Madère' },
    NL: {
      FRIESLAND: 'Frise', GELDERLAND: 'Gueldre', NOORD_BRABANT: 'Brabant-Septentrional', NOORD_HOLLAND: 'Hollande-Septentrionale',
      ZEELAND: 'Zélande', ZUID_HOLLAND: 'Hollande-Méridionale',
    },
    CZ: { PRAHA: 'Prague' },
    GB: { ENGLAND: 'Angleterre', SCOTLAND: 'Écosse', WALES: 'Pays de Galles', NORTHERN_IRELAND: 'Irlande du Nord' },
    US: {
      CA: 'Californie', FL: 'Floride', LA: 'Louisiane', NC: 'Caroline du Nord', SC: 'Caroline du Sud', ND: 'Dakota du Nord',
      SD: 'Dakota du Sud', GA: 'Géorgie', HI: 'Hawaï', PA: 'Pennsylvanie', VA: 'Virginie', WV: 'Virginie-Occidentale',
      NM: 'Nouveau-Mexique', NH: 'Nouveau-Hampshire', DC: 'District de Columbia',
    },
    CA: {
      BC: 'Colombie-Britannique', NB: 'Nouveau-Brunswick', NL: 'Terre-Neuve-et-Labrador', NT: 'Territoires du Nord-Ouest',
      NS: 'Nouvelle-Écosse', PE: 'Île-du-Prince-Édouard', QC: 'Québec',
    },
    AU: {
      NSW: 'Nouvelle-Galles du Sud', WA: 'Australie-Occidentale', SA: 'Australie-Méridionale', TAS: 'Tasmanie',
      NT: 'Territoire du Nord', ACT: 'Territoire de la capitale australienne',
    },
    CN: { BEIJING: 'Pékin' },
    KR: { SEOUL: 'Séoul' },
  },
  metros: {
    'AT:vienna': 'Vienne', 'CH:bern': 'Berne', 'CH:geneva': 'Genève', 'CN:beijing': 'Pékin', 'DE:dresden': 'Dresde',
    'DE:frankfurt': 'Francfort', 'DE:freiburg': 'Fribourg-en-Brisgau', 'DE:hamburg': 'Hambourg', 'DK:copenhagen': 'Copenhague',
    'GB:edinburgh': 'Édimbourg', 'GB:london': 'Londres', 'GR:athens': 'Athènes', 'KR:seoul': 'Séoul', 'MX:mexico-city': 'Mexico',
    'NL:the-hague': 'La Haye', 'PL:krakow': 'Cracovie', 'PL:warsaw': 'Varsovie', 'PT:lisbon': 'Lisbonne', 'RO:bucharest': 'Bucarest',
    'RU:moscow': 'Moscou', 'RU:saint-petersburg': 'Saint-Pétersbourg', 'SE:gothenburg': 'Göteborg', 'CA:montreal': 'Montréal',
  },
};
