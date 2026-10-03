// Metros (docs/DESIGN.md sec. 9.1, 6.2): a curated table of major climbing metro areas. The data has no city field (a gym has
// country, state and suburb), so a metro is a centre + radius: a gym belongs to the metro of its own country whose centre is
// nearest, if within that metro's radius, and to no metro otherwise. Membership is computed, never stored, so no database
// change and no gym is classified by hand. Pure (no DOM, no appState), unit-tested in tests/metros.test.js.
//   slug       unique within its country; the last segment of /in/{cc}/{region}/{slug}
//   state      the region code (STATES_BY_COUNTRY) of the metro's core: the region page and the URL use it
//   radiusKm   chosen so the metro covers its real urban area and the suburbs the data lists for it
//   aliases    other names people search by (local spelling, old names); matched like the name
// Chosen from the approved gyms (2026-10): every area with 5+ gyms in AU, GB, US, JP, KR, DE, FR, CA, CN, 6+ elsewhere.
// City-states (HK, SG, LU, AD) are left out: their country result already is the city. To add a metro, add a row
// (the test checks the state code, slug uniqueness and that no two centres in a country share a position).
import { distanceKm, fold } from './geo.js';

export const METROS = Object.freeze([
  // AR
  { slug: 'buenos-aires', name: 'Buenos Aires', country: 'AR', state: 'CABA', lat: -34.6037, lng: -58.3816, radiusKm: 40 },
  // AT
  { slug: 'vienna', name: 'Vienna', country: 'AT', state: 'WIEN', lat: 48.2082, lng: 16.3738, radiusKm: 25, aliases: ['Wien'] },
  // AU
  { slug: 'adelaide', name: 'Adelaide', country: 'AU', state: 'SA', lat: -34.9285, lng: 138.6007, radiusKm: 30 },
  { slug: 'brisbane', name: 'Brisbane', country: 'AU', state: 'QLD', lat: -27.4698, lng: 153.0251, radiusKm: 35 },
  { slug: 'melbourne', name: 'Melbourne', country: 'AU', state: 'VIC', lat: -37.8136, lng: 144.9631, radiusKm: 40 },
  { slug: 'perth', name: 'Perth', country: 'AU', state: 'WA', lat: -31.9505, lng: 115.8605, radiusKm: 35 },
  { slug: 'sydney', name: 'Sydney', country: 'AU', state: 'NSW', lat: -33.8688, lng: 151.2093, radiusKm: 50 },
  // BG
  { slug: 'sofia', name: 'Sofia', country: 'BG', state: 'SOFIA_CITY', lat: 42.6977, lng: 23.3219, radiusKm: 15 },
  // BR
  { slug: 'sao-paulo', name: 'São Paulo', country: 'BR', state: 'SAO_PAULO', lat: -23.5505, lng: -46.6333, radiusKm: 30, aliases: ['Sao Paulo'] },
  // CA
  { slug: 'montreal', name: 'Montreal', country: 'CA', state: 'QC', lat: 45.5017, lng: -73.5673, radiusKm: 25, aliases: ['Montréal'] },
  { slug: 'toronto', name: 'Toronto', country: 'CA', state: 'ON', lat: 43.6532, lng: -79.3832, radiusKm: 40 },
  // CH
  { slug: 'bern', name: 'Bern', country: 'CH', state: 'BERN', lat: 46.948, lng: 7.4474, radiusKm: 25, aliases: ['Berne'] },
  { slug: 'geneva', name: 'Geneva', country: 'CH', state: 'GENEVE', lat: 46.2044, lng: 6.1432, radiusKm: 25, aliases: ['Genève', 'Genf'] },
  { slug: 'lausanne', name: 'Lausanne', country: 'CH', state: 'VAUD', lat: 46.5197, lng: 6.6323, radiusKm: 20 },
  { slug: 'zurich', name: 'Zurich', country: 'CH', state: 'ZURICH', lat: 47.3769, lng: 8.5417, radiusKm: 30, aliases: ['Zürich'] },
  // CN
  { slug: 'beijing', name: 'Beijing', country: 'CN', state: 'BEIJING', lat: 39.9042, lng: 116.4074, radiusKm: 45, aliases: ['北京'] },
  { slug: 'chengdu', name: 'Chengdu', country: 'CN', state: 'CHENGDU', lat: 30.5728, lng: 104.0668, radiusKm: 35, aliases: ['成都'] },
  { slug: 'chongqing', name: 'Chongqing', country: 'CN', state: 'CHONGQING', lat: 29.563, lng: 106.5516, radiusKm: 40, aliases: ['重庆'] },
  { slug: 'guangzhou', name: 'Guangzhou', country: 'CN', state: 'GUANGZHOU', lat: 23.1291, lng: 113.2644, radiusKm: 35, aliases: ['Canton', '广州'] },
  { slug: 'hangzhou', name: 'Hangzhou', country: 'CN', state: 'HANGZHOU', lat: 30.2741, lng: 120.1551, radiusKm: 30, aliases: ['杭州'] },
  { slug: 'nanjing', name: 'Nanjing', country: 'CN', state: 'NANJING', lat: 32.0603, lng: 118.7969, radiusKm: 30, aliases: ['南京'] },
  { slug: 'shanghai', name: 'Shanghai', country: 'CN', state: 'SHANGHAI', lat: 31.2304, lng: 121.4737, radiusKm: 50, aliases: ['上海'] },
  { slug: 'shenzhen', name: 'Shenzhen', country: 'CN', state: 'SHENZHEN', lat: 22.5431, lng: 114.0579, radiusKm: 30, aliases: ['深圳'] },
  { slug: 'suzhou', name: 'Suzhou', country: 'CN', state: 'SUZHOU', lat: 31.2989, lng: 120.5853, radiusKm: 25, aliases: ['苏州'] },
  { slug: 'tianjin', name: 'Tianjin', country: 'CN', state: 'TIANJIN', lat: 39.1256, lng: 117.1904, radiusKm: 40, aliases: ['天津'] },
  { slug: 'wuhan', name: 'Wuhan', country: 'CN', state: 'WUHAN', lat: 30.5928, lng: 114.3055, radiusKm: 30, aliases: ['武汉'] },
  { slug: 'xi-an', name: 'Xi\'an', country: 'CN', state: 'XIAN', lat: 34.3416, lng: 108.9398, radiusKm: 25, aliases: ['Xian', '西安'] },
  // CZ
  { slug: 'prague', name: 'Prague', country: 'CZ', state: 'PRAHA', lat: 50.0755, lng: 14.4378, radiusKm: 25, aliases: ['Praha'] },
  // DE
  { slug: 'berlin', name: 'Berlin', country: 'DE', state: 'BERLIN', lat: 52.52, lng: 13.405, radiusKm: 35 },
  { slug: 'cologne', name: 'Cologne', country: 'DE', state: 'NORDRHEIN_WESTFALEN', lat: 50.9375, lng: 6.9603, radiusKm: 25, aliases: ['Köln'] },
  { slug: 'dresden', name: 'Dresden', country: 'DE', state: 'SACHSEN', lat: 51.0504, lng: 13.7373, radiusKm: 20 },
  { slug: 'frankfurt', name: 'Frankfurt', country: 'DE', state: 'HESSEN', lat: 50.1109, lng: 8.6821, radiusKm: 40 },
  { slug: 'freiburg', name: 'Freiburg', country: 'DE', state: 'BADEN_WURTTEMBERG', lat: 47.999, lng: 7.8421, radiusKm: 15 },
  { slug: 'hamburg', name: 'Hamburg', country: 'DE', state: 'HAMBURG', lat: 53.5511, lng: 9.9937, radiusKm: 30 },
  { slug: 'munich', name: 'Munich', country: 'DE', state: 'BAYERN', lat: 48.1351, lng: 11.582, radiusKm: 30, aliases: ['München'] },
  { slug: 'nuremberg', name: 'Nuremberg', country: 'DE', state: 'BAYERN', lat: 49.4521, lng: 11.0767, radiusKm: 30, aliases: ['Nürnberg'] },
  { slug: 'ruhr-area', name: 'Ruhr Area', country: 'DE', state: 'NORDRHEIN_WESTFALEN', lat: 51.47, lng: 7.15, radiusKm: 28, aliases: ['Ruhrgebiet', 'Essen', 'Bochum', 'Dortmund', 'Oberhausen'] },
  { slug: 'stuttgart', name: 'Stuttgart', country: 'DE', state: 'BADEN_WURTTEMBERG', lat: 48.7758, lng: 9.1829, radiusKm: 30 },
  // DK
  { slug: 'copenhagen', name: 'Copenhagen', country: 'DK', state: 'HOVEDSTADEN', lat: 55.6761, lng: 12.5683, radiusKm: 25, aliases: ['København'] },
  // ES
  { slug: 'barcelona', name: 'Barcelona', country: 'ES', state: 'CATALUNYA', lat: 41.3874, lng: 2.1686, radiusKm: 35 },
  { slug: 'madrid', name: 'Madrid', country: 'ES', state: 'MADRID', lat: 40.4168, lng: -3.7038, radiusKm: 35 },
  // FI
  { slug: 'helsinki', name: 'Helsinki', country: 'FI', state: 'UUSIMAA', lat: 60.1699, lng: 24.9384, radiusKm: 25 },
  // FR
  { slug: 'lyon', name: 'Lyon', country: 'FR', state: 'AUVERGNE_RHONE_ALPES', lat: 45.764, lng: 4.8357, radiusKm: 25 },
  { slug: 'marseille', name: 'Marseille', country: 'FR', state: 'PACA', lat: 43.2965, lng: 5.3698, radiusKm: 30 },
  { slug: 'paris', name: 'Paris', country: 'FR', state: 'ILE_DE_FRANCE', lat: 48.8566, lng: 2.3522, radiusKm: 35 },
  { slug: 'toulouse', name: 'Toulouse', country: 'FR', state: 'OCCITANIE', lat: 43.6047, lng: 1.4442, radiusKm: 20 },
  // GB
  { slug: 'bristol', name: 'Bristol', country: 'GB', state: 'ENGLAND', lat: 51.4545, lng: -2.5879, radiusKm: 20 },
  { slug: 'edinburgh', name: 'Edinburgh', country: 'GB', state: 'SCOTLAND', lat: 55.9533, lng: -3.1883, radiusKm: 25 },
  { slug: 'glasgow', name: 'Glasgow', country: 'GB', state: 'SCOTLAND', lat: 55.8642, lng: -4.2518, radiusKm: 25 },
  { slug: 'leeds', name: 'Leeds', country: 'GB', state: 'ENGLAND', lat: 53.8008, lng: -1.5491, radiusKm: 25 },
  { slug: 'london', name: 'London', country: 'GB', state: 'ENGLAND', lat: 51.5074, lng: -0.1278, radiusKm: 40 },
  { slug: 'manchester', name: 'Manchester', country: 'GB', state: 'ENGLAND', lat: 53.4808, lng: -2.2426, radiusKm: 25 },
  { slug: 'sheffield', name: 'Sheffield', country: 'GB', state: 'ENGLAND', lat: 53.3811, lng: -1.4701, radiusKm: 20 },
  { slug: 'southampton', name: 'Southampton', country: 'GB', state: 'ENGLAND', lat: 50.9097, lng: -1.4044, radiusKm: 20 },
  // GR
  { slug: 'athens', name: 'Athens', country: 'GR', state: 'ATTICA', lat: 37.9838, lng: 23.7275, radiusKm: 25, aliases: ['Athina'] },
  // HU
  { slug: 'budapest', name: 'Budapest', country: 'HU', state: 'BUDAPEST', lat: 47.4979, lng: 19.0402, radiusKm: 30 },
  // ID
  { slug: 'jakarta', name: 'Jakarta', country: 'ID', state: 'DKI_JAKARTA', lat: -6.2088, lng: 106.8456, radiusKm: 30 },
  // IE
  { slug: 'dublin', name: 'Dublin', country: 'IE', state: 'DUBLIN', lat: 53.3498, lng: -6.2603, radiusKm: 25 },
  // IL
  { slug: 'tel-aviv', name: 'Tel Aviv', country: 'IL', state: 'TEL_AVIV', lat: 32.0853, lng: 34.7818, radiusKm: 30 },
  // IT
  { slug: 'rome', name: 'Rome', country: 'IT', state: 'LAZIO', lat: 41.9028, lng: 12.4964, radiusKm: 25, aliases: ['Roma'] },
  // JP
  { slug: 'kyoto', name: 'Kyoto', country: 'JP', state: 'KYOTO', lat: 35.0116, lng: 135.7681, radiusKm: 25, aliases: ['京都'] },
  { slug: 'osaka', name: 'Osaka', country: 'JP', state: 'OSAKA', lat: 34.6937, lng: 135.5023, radiusKm: 30, aliases: ['大阪'] },
  { slug: 'sendai', name: 'Sendai', country: 'JP', state: 'MIYAGI', lat: 38.2682, lng: 140.8694, radiusKm: 20 },
  { slug: 'tokyo', name: 'Tokyo', country: 'JP', state: 'TOKYO', lat: 35.6762, lng: 139.6503, radiusKm: 50, aliases: ['Tōkyō', '東京'] },
  // KR
  { slug: 'busan', name: 'Busan', country: 'KR', state: 'BUSAN', lat: 35.1796, lng: 129.0756, radiusKm: 35, aliases: ['Pusan', '부산'] },
  { slug: 'daegu', name: 'Daegu', country: 'KR', state: 'DAEGU', lat: 35.8714, lng: 128.6014, radiusKm: 25 },
  { slug: 'daejeon', name: 'Daejeon', country: 'KR', state: 'DAEJEON', lat: 36.3504, lng: 127.3845, radiusKm: 35 },
  { slug: 'seoul', name: 'Seoul', country: 'KR', state: 'SEOUL', lat: 37.5665, lng: 126.978, radiusKm: 40, aliases: ['서울'] },
  // MX
  { slug: 'mexico-city', name: 'Mexico City', country: 'MX', state: 'CIUDAD_DE_MEXICO', lat: 19.4326, lng: -99.1332, radiusKm: 30, aliases: ['Ciudad de México'] },
  // MY
  { slug: 'kuala-lumpur', name: 'Kuala Lumpur', country: 'MY', state: 'KUALA_LUMPUR', lat: 3.139, lng: 101.6869, radiusKm: 25 },
  // NL
  { slug: 'amsterdam', name: 'Amsterdam', country: 'NL', state: 'NOORD_HOLLAND', lat: 52.3676, lng: 4.9041, radiusKm: 30 },
  { slug: 'the-hague', name: 'The Hague', country: 'NL', state: 'ZUID_HOLLAND', lat: 52.0705, lng: 4.3007, radiusKm: 12, aliases: ['Den Haag'] },
  { slug: 'utrecht', name: 'Utrecht', country: 'NL', state: 'UTRECHT', lat: 52.0907, lng: 5.1214, radiusKm: 15 },
  // PH
  { slug: 'manila', name: 'Manila', country: 'PH', state: 'NCR', lat: 14.5995, lng: 120.9842, radiusKm: 30 },
  // PL
  { slug: 'krakow', name: 'Kraków', country: 'PL', state: 'MALOPOLSKIE', lat: 50.0647, lng: 19.945, radiusKm: 20, aliases: ['Krakow'] },
  { slug: 'warsaw', name: 'Warsaw', country: 'PL', state: 'MAZOWIECKIE', lat: 52.2297, lng: 21.0122, radiusKm: 25, aliases: ['Warszawa'] },
  { slug: 'wroc-aw', name: 'Wrocław', country: 'PL', state: 'DOLNOSLASKIE', lat: 51.1079, lng: 17.0385, radiusKm: 20, aliases: ['Wroclaw'] },
  // PT
  { slug: 'lisbon', name: 'Lisbon', country: 'PT', state: 'LISBOA', lat: 38.7223, lng: -9.1393, radiusKm: 30, aliases: ['Lisboa'] },
  // RO
  { slug: 'bucharest', name: 'Bucharest', country: 'RO', state: 'BUCURESTI', lat: 44.4268, lng: 26.1025, radiusKm: 25, aliases: ['București'] },
  // RU
  { slug: 'moscow', name: 'Moscow', country: 'RU', state: 'MOSKVA', lat: 55.7558, lng: 37.6173, radiusKm: 40, aliases: ['Moskva'] },
  { slug: 'saint-petersburg', name: 'Saint Petersburg', country: 'RU', state: 'SANKT_PETERBURG', lat: 59.9311, lng: 30.3609, radiusKm: 25, aliases: ['St Petersburg', 'Sankt-Peterburg'] },
  // SE
  { slug: 'gothenburg', name: 'Gothenburg', country: 'SE', state: 'VASTRA_GOTALAND', lat: 57.7089, lng: 11.9746, radiusKm: 25, aliases: ['Göteborg'] },
  { slug: 'stockholm', name: 'Stockholm', country: 'SE', state: 'STOCKHOLM', lat: 59.3293, lng: 18.0686, radiusKm: 30 },
  // SI
  { slug: 'ljubljana', name: 'Ljubljana', country: 'SI', state: 'OSREDNJESLOVENSKA', lat: 46.0569, lng: 14.5058, radiusKm: 25 },
  // TH
  { slug: 'bangkok', name: 'Bangkok', country: 'TH', state: 'BANGKOK', lat: 13.7563, lng: 100.5018, radiusKm: 30 },
  // TW
  { slug: 'taipei', name: 'Taipei', country: 'TW', state: 'TAIPEI', lat: 25.033, lng: 121.5654, radiusKm: 25, aliases: ['台北'] },
  // US
  { slug: 'atlanta', name: 'Atlanta', country: 'US', state: 'GA', lat: 33.749, lng: -84.388, radiusKm: 40 },
  { slug: 'austin', name: 'Austin', country: 'US', state: 'TX', lat: 30.2672, lng: -97.7431, radiusKm: 30 },
  { slug: 'boston', name: 'Boston', country: 'US', state: 'MA', lat: 42.3601, lng: -71.0589, radiusKm: 40 },
  { slug: 'chicago', name: 'Chicago', country: 'US', state: 'IL', lat: 41.8781, lng: -87.6298, radiusKm: 50 },
  { slug: 'dallas', name: 'Dallas', country: 'US', state: 'TX', lat: 32.7767, lng: -96.797, radiusKm: 45 },
  { slug: 'denver', name: 'Denver', country: 'US', state: 'CO', lat: 39.7392, lng: -104.9903, radiusKm: 40 },
  { slug: 'houston', name: 'Houston', country: 'US', state: 'TX', lat: 29.7604, lng: -95.3698, radiusKm: 45 },
  { slug: 'los-angeles', name: 'Los Angeles', country: 'US', state: 'CA', lat: 34.0522, lng: -118.2437, radiusKm: 55 },
  { slug: 'nashville', name: 'Nashville', country: 'US', state: 'TN', lat: 36.1627, lng: -86.7816, radiusKm: 35 },
  { slug: 'new-york', name: 'New York', country: 'US', state: 'NY', lat: 40.7128, lng: -74.006, radiusKm: 50 },
  { slug: 'orange-county', name: 'Orange County', country: 'US', state: 'CA', lat: 33.7175, lng: -117.8311, radiusKm: 30 },
  { slug: 'salt-lake-city', name: 'Salt Lake City', country: 'US', state: 'UT', lat: 40.7608, lng: -111.891, radiusKm: 45 },
  { slug: 'san-diego', name: 'San Diego', country: 'US', state: 'CA', lat: 32.7157, lng: -117.1611, radiusKm: 60 },
  { slug: 'san-francisco-bay-area', name: 'San Francisco Bay Area', country: 'US', state: 'CA', lat: 37.7749, lng: -122.4194, radiusKm: 40, aliases: ['San Francisco', 'Bay Area'] },
  { slug: 'san-jose', name: 'San Jose', country: 'US', state: 'CA', lat: 37.3382, lng: -121.8863, radiusKm: 25 },
  { slug: 'seattle', name: 'Seattle', country: 'US', state: 'WA', lat: 47.6062, lng: -122.3321, radiusKm: 45 },
].map(m => Object.freeze(m)));

const BY_COUNTRY = new Map();
for(const m of METROS){ if(!BY_COUNTRY.has(m.country)) BY_COUNTRY.set(m.country, []); BY_COUNTRY.get(m.country).push(m); }

// The ?place= value and the filter key of a metro. The "~" marks it as a metro, so it can never equal a suburb's key
// ("AU:NSW:Sydney" is the suburb; "AU:NSW:~sydney" is the metro).
export const metroKey = m => m.country + ':' + m.state + ':~' + m.slug;

// The metro a gym (anything with country, lat, lng) belongs to, or null. Nearest centre wins when radii overlap.
export function metroOf(g){
  const list = g && BY_COUNTRY.get(g.country);
  if(!list || !Number.isFinite(g.lat) || !Number.isFinite(g.lng)) return null;
  let best = null, bestKm = Infinity;
  for(const m of list){
    // Cheap reject before the haversine: one degree of latitude is 111 km.
    if(Math.abs(m.lat - g.lat) * 111 > m.radiusKm) continue;
    const km = distanceKm(m, g);
    if(km <= m.radiusKm && km < bestKm){ best = m; bestKm = km; }
  }
  return best;
}

export const metrosOfCountry = country => BY_COUNTRY.get(country) || [];

// A metro from a place key ("AU:NSW:~sydney"), or null.
export function metroByKey(key){
  const m = /^([A-Z]{2,5}):([^:]+):~(.+)$/.exec(String(key || ''));
  return m ? (BY_COUNTRY.get(m[1]) || []).find(x => x.state === m[2] && x.slug === m[3]) || null : null;
}

// A metro from the page path parts: the country code (any case), the region segment (the state, lower-cased and
// URL-encoded, as slug.js's regionSegment) and the city segment (the slug). A metro with no gyms is still found;
// the page decides what to show.
export function metroByPath(country, regionSeg, citySeg){
  const cc = String(country || '').toUpperCase();
  return (BY_COUNTRY.get(cc) || []).find(m => m.slug === citySeg && encodeURIComponent(m.state.toLowerCase()) === regionSeg) || null;
}

// The gyms of every metro of a country in one pass: Map(metro -> gyms[]).
export function groupByMetro(spots, country){
  const out = new Map();
  for(const g of spots){
    if(g.country !== country) continue;
    const m = metroOf(g);
    if(m){ if(!out.has(m)) out.set(m, []); out.get(m).push(g); }
  }
  return out;
}

// True when a suburb text is just the metro's own name ("Sydney" in NSW, "Wien"): the metro subsumes that suburb in search.
export function isMetroName(m, text){
  const t = fold(text).trim();
  return !!t && [m.name, ...(m.aliases || [])].some(n => fold(n) === t);
}
