// German place names for the interface: region labels (regions.js STATES_BY_COUNTRY codes) and metro names
// (metros.js, key COUNTRY:slug). Only names that differ from English; anything missing shows in English. Standard names only.
export default {
  regions: {
    AT: { OBEROSTERREICH: 'Oberösterreich', STEIERMARK: 'Steiermark' },
    CH: {
      BASEL_STADT: 'Basel-Stadt', FRIBOURG: 'Freiburg', GENEVE: 'Genf', NEUCHATEL: 'Neuenburg', TICINO: 'Tessin',
      VALAIS: 'Wallis', VAUD: 'Waadt', ZURICH: 'Zürich',
    },
    BE: { FLANDERS: 'Flandern', WALLONIA: 'Wallonien', BRUSSELS: 'Brüssel-Hauptstadt' },
    FR: { CORSE: 'Korsika', OCCITANIE: 'Okzitanien' },
    IT: {
      ABRUZZO: 'Abruzzen', BASILICATA: 'Basilikata', CALABRIA: 'Kalabrien', CAMPANIA: 'Kampanien',
      FRIULI_VENEZIA_GIULIA: 'Friaul-Julisch Venetien', LAZIO: 'Latium', LIGURIA: 'Ligurien', LOMBARDIA: 'Lombardei',
      MARCHE: 'Marken', PIEMONTE: 'Piemont', PUGLIA: 'Apulien', SARDEGNA: 'Sardinien', SICILIA: 'Sizilien',
      TOSCANA: 'Toskana', TRENTINO_ALTO_ADIGE: 'Trentino-Südtirol', UMBRIA: 'Umbrien', VALLE_DAOSTA: 'Aostatal',
    },
    ES: {
      ANDALUCIA: 'Andalusien', ARAGON: 'Aragonien', ASTURIAS: 'Asturien', BALEARES: 'Balearen', CANARIAS: 'Kanarische Inseln',
      CANTABRIA: 'Kantabrien', CASTILLA_LA_MANCHA: 'Kastilien-La Mancha', CASTILLA_Y_LEON: 'Kastilien und León',
      CATALUNYA: 'Katalonien', COMUNIDAD_VALENCIANA: 'Valencia', GALICIA: 'Galicien', PAIS_VASCO: 'Baskenland',
    },
    PT: { ACORES: 'Azoren', LISBOA: 'Lissabon' },
    NL: {
      FRIESLAND: 'Friesland', NOORD_BRABANT: 'Nordbrabant', NOORD_HOLLAND: 'Nordholland', ZEELAND: 'Seeland', ZUID_HOLLAND: 'Südholland',
    },
    CZ: { PRAHA: 'Prag' },
    GB: { SCOTLAND: 'Schottland', NORTHERN_IRELAND: 'Nordirland' },
    US: { CA: 'Kalifornien' },
    CA: {
      BC: 'Britisch-Kolumbien', NB: 'Neubraunschweig', NL: 'Neufundland und Labrador', NT: 'Nordwest-Territorien',
      NS: 'Neuschottland', PE: 'Prinz-Edward-Insel', QC: 'Québec',
    },
    AU: {
      NSW: 'Neusüdwales', VIC: 'Victoria', QLD: 'Queensland', WA: 'Westaustralien', SA: 'Südaustralien', TAS: 'Tasmanien',
      NT: 'Nordterritorium', ACT: 'Australisches Hauptstadtterritorium',
    },
    CN: { BEIJING: 'Peking' },
    JP: { TOKYO: 'Tokio' },
  },
  metros: {
    'AT:vienna': 'Wien', 'CH:geneva': 'Genf', 'CH:zurich': 'Zürich', 'CN:beijing': 'Peking', 'CZ:prague': 'Prag',
    'DE:cologne': 'Köln', 'DE:munich': 'München', 'DE:nuremberg': 'Nürnberg', 'DE:ruhr-area': 'Ruhrgebiet',
    'DK:copenhagen': 'Kopenhagen', 'GR:athens': 'Athen', 'IT:rome': 'Rom', 'JP:tokyo': 'Tokio', 'MX:mexico-city': 'Mexiko-Stadt',
    'NL:the-hague': 'Den Haag', 'PL:krakow': 'Krakau', 'PL:warsaw': 'Warschau', 'PT:lisbon': 'Lissabon', 'RO:bucharest': 'Bukarest',
    'RU:moscow': 'Moskau', 'RU:saint-petersburg': 'Sankt Petersburg', 'SE:gothenburg': 'Göteborg',
  },
};
