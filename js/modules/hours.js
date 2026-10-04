// Opening hours as the gyms publish them (spots.hours: jsonb {mon..sun: free text}) turned into "Open now" facts.
// Pure: no DOM; the only shared state read is appState.userLocation (overridable per call), so it is unit-tested in node.
//
// The rule that shapes everything here: wrong is worse than unknown. A day string that is not one of the plain shapes
// below parses to null and the gym's status is 'unknown' (nothing renders, DESIGN.md DNA #3). A gym is judged in ITS OWN
// time zone (gymTimeZone), never the visitor's; the browser zone stands in only for a gym that has no zone in our table
// and sits within 300 km of the visitor's located position.
import { distanceKm } from './geo.js';
import { cleanHours } from './gym-info.js';
import { appState } from './state.js';

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_NAMES = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const DAY = 1440;

// ===== parsing one day's text =========================================================================================
// One time token -> {min, twelve | bare | strict24, mer}. `twelve`: 12-hour with am/pm. `strict24`: can only be a 24-hour
// clock (hour 13-24, "0600", "06:00"). `bare`: just an hour ("6", "22").
function parseTime(tok){
  let m = /^(\d{1,2})(?:[:.](\d{2}))?\s*([ap])\.?m\.?$/.exec(tok);
  if(m){
    const h = +m[1], min = m[2] === undefined ? 0 : +m[2];
    if(h < 1 || h > 12 || min > 59) return null;
    return { min: (h % 12) * 60 + (m[3] === 'p' ? 720 : 0) + min, twelve: true, mer: m[3] };
  }
  m = /^(\d{2})(\d{2})$/.exec(tok);
  if(m){
    const h = +m[1], min = +m[2];
    if(min > 59 || h > 24 || (h === 24 && min !== 0)) return null;
    return { min: h * 60 + min, strict24: true };
  }
  m = /^(\d{1,2})[:.h](\d{2})$/.exec(tok) || /^(\d{1,2})h$/.exec(tok);
  if(m){
    const h = +m[1], min = m[2] === undefined ? 0 : +m[2];
    if(min > 59 || h > 24 || (h === 24 && min !== 0)) return null;
    return { min: h * 60 + min, strict24: h >= 13 || /^0\d/.test(tok), clock: true };
  }
  m = /^(\d{1,2})$/.exec(tok);
  if(m){
    const h = +m[1];
    if(h > 24) return null;
    return { min: h * 60, bare: true, strict24: h >= 13 };
  }
  return null;
}

// "6am-10pm", "06:00-22:00", "9-5pm", "11-2pm", "6-22" -> {open, close} in minutes since midnight (close past midnight adds 1440).
function parseRange(text){
  const parts = text.split('-').map(s => s.trim());
  if(parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const a = parseTime(parts[0]), b = parseTime(parts[1]);
  if(!a || !b) return null;
  let open = a.min, close = b.min;
  if(a.twelve && b.twelve){
    // both ends state am/pm: as written
  } else if(!a.twelve && !b.twelve){
    // 24-hour clock. A bare hour ("6-10") could equally be 12-hour, so it needs a 13+ hour on one side ("6-22").
    if((a.bare || b.bare) && !(a.strict24 || b.strict24)) return null;
  } else if(!a.twelve){
    // "9-5pm": the unmarked start takes the end's am/pm when that keeps start < end ("6-10pm" is 6pm to 10pm), else the other.
    const hour = Math.floor(a.min / 60), minutes = a.min % 60;
    if(a.strict24 || hour < 1 || hour > 12) return null;
    const pm = b.mer === 'p';
    const same = ((hour % 12) + (pm ? 12 : 0)) * 60 + minutes, other = ((hour % 12) + (pm ? 0 : 12)) * 60 + minutes;
    if(same < close) open = same;
    else if(other < close) open = other;
    else return null;
  } else if(!b.strict24){
    return null;                                      // "6am-10": the end could be am or pm; only "6am-22:00" is unambiguous
  }
  if(close === open) return null;
  if(close < open) close += DAY;
  if(open >= DAY) return null;
  return { open, close };
}

// A day's text -> [{open, close}, ...] (an empty list = closed all day), or null when it is not understood.
export function parseDay(str){
  if(typeof str !== 'string') return null;
  let s = str.toLowerCase().replace(/[‐-―−]/g, '-').replace(/ /g, ' ').trim();
  if(!s || s.length > 60) return null;
  if(/^(closed|close|closed all day|-+)$/.test(s)) return [];
  if(/^(open\s+)?(24\s*(hours?|hrs?|h)(\s+(a day|daily))?|24\s*\/\s*7)$/.test(s)) return [{ open: 0, close: DAY }];
  s = s.replace(/\s+(to|until|till)\s+/g, '-').replace(/\s*-\s*/g, '-')
    .replace(/([\dm])\s+(?=\d)/g, '$1,');                 // "7am-12pm 4pm-10pm" and "9:00-12:00 14:00-18:00"
  const ranges = [];
  for(const part of s.split(/\s*(?:,|\/|&|;|\band\b)\s*/)){
    const r = parseRange(part.trim());
    if(!r) return null;
    ranges.push(r);
  }
  if(!ranges.length) return null;
  return ranges.sort((x, y) => x.open - y.open);
}

// The parsed week (a list of ranges, or null, per day), memoized on the hours object; null when no day is given at all.
const weekMemo = new WeakMap();
function parsedWeek(hours){
  if(!hours || typeof hours !== 'object') return null;
  if(!weekMemo.has(hours)){
    const clean = cleanHours(hours);
    weekMemo.set(hours, clean ? Object.fromEntries(DAY_KEYS.map(k => [k, clean[k] === undefined ? null : parseDay(clean[k])])) : null);
  }
  return weekMemo.get(hours);
}
// True when at least one day of the gym's hours is understood (the "Open now" chip counts these).
export function hasParseableHours(g){
  const w = g && parsedWeek(g.hours);
  return !!w && DAY_KEYS.some(k => w[k] !== null);
}

// ===== time zones =====================================================================================================
const ZONES = {
  GB: 'Europe/London', IE: 'Europe/Dublin', FR: 'Europe/Paris', DE: 'Europe/Berlin', NL: 'Europe/Amsterdam', BE: 'Europe/Brussels',
  LU: 'Europe/Luxembourg', CH: 'Europe/Zurich', AT: 'Europe/Vienna', IT: 'Europe/Rome', MT: 'Europe/Malta', AD: 'Europe/Andorra',
  SI: 'Europe/Ljubljana', HR: 'Europe/Zagreb', BA: 'Europe/Sarajevo', RS: 'Europe/Belgrade', ME: 'Europe/Podgorica', MK: 'Europe/Skopje',
  AL: 'Europe/Tirane', GR: 'Europe/Athens', BG: 'Europe/Sofia', RO: 'Europe/Bucharest', HU: 'Europe/Budapest', SK: 'Europe/Bratislava',
  CZ: 'Europe/Prague', PL: 'Europe/Warsaw', DK: 'Europe/Copenhagen', NO: 'Europe/Oslo', SE: 'Europe/Stockholm', FI: 'Europe/Helsinki',
  EE: 'Europe/Tallinn', LV: 'Europe/Riga', LT: 'Europe/Vilnius', UA: 'Europe/Kyiv', BY: 'Europe/Minsk', MD: 'Europe/Chisinau',
  IS: 'Atlantic/Reykjavik', CY: 'Asia/Nicosia', TR: 'Europe/Istanbul', GE: 'Asia/Tbilisi', AM: 'Asia/Yerevan', AZ: 'Asia/Baku',
  IL: 'Asia/Jerusalem', JO: 'Asia/Amman', LB: 'Asia/Beirut', IR: 'Asia/Tehran', SA: 'Asia/Riyadh', AE: 'Asia/Dubai', QA: 'Asia/Qatar',
  OM: 'Asia/Muscat', KW: 'Asia/Kuwait', BH: 'Asia/Bahrain', EG: 'Africa/Cairo', MA: 'Africa/Casablanca', ZA: 'Africa/Johannesburg',
  KE: 'Africa/Nairobi', JP: 'Asia/Tokyo', KR: 'Asia/Seoul', TW: 'Asia/Taipei', HK: 'Asia/Hong_Kong', MO: 'Asia/Macau', SG: 'Asia/Singapore',
  MY: 'Asia/Kuala_Lumpur', TH: 'Asia/Bangkok', VN: 'Asia/Ho_Chi_Minh', PH: 'Asia/Manila', IN: 'Asia/Kolkata', LK: 'Asia/Colombo',
  NP: 'Asia/Kathmandu', PK: 'Asia/Karachi', BD: 'Asia/Dhaka', UZ: 'Asia/Tashkent', KZ: 'Asia/Almaty', MN: 'Asia/Ulaanbaatar',
  CN: 'Asia/Shanghai',                                   // the whole of China keeps Beijing time
  NZ: 'Pacific/Auckland', AR: 'America/Argentina/Buenos_Aires', UY: 'America/Montevideo', PY: 'America/Asuncion', BO: 'America/La_Paz',
  PE: 'America/Lima', CO: 'America/Bogota', VE: 'America/Caracas', CR: 'America/Costa_Rica', PA: 'America/Panama',
  GT: 'America/Guatemala', SV: 'America/El_Salvador', HN: 'America/Tegucigalpa', NI: 'America/Managua', CU: 'America/Havana',
  DO: 'America/Santo_Domingo', PR: 'America/Puerto_Rico', JM: 'America/Jamaica', TT: 'America/Port_of_Spain',
};
// Countries that span zones among the gyms we list get a state table (keys as stored: two-letter for US/CA/AU, upper-case
// names for RU/BR/MX/ID). A state that is not listed has no zone (unknown) rather than a guess.
const NY = 'America/New_York', CHI = 'America/Chicago', DEN = 'America/Denver', LA = 'America/Los_Angeles';
const US = { AL: CHI, AK: 'America/Anchorage', AZ: 'America/Phoenix', AR: CHI, CA: LA, CO: DEN, CT: NY, DE: NY, DC: NY, GA: NY, HI: 'Pacific/Honolulu',
  IL: CHI, IA: CHI, LA: CHI, ME: NY, MD: NY, MA: NY, MN: CHI, MS: CHI, MO: CHI, MT: DEN, NV: LA, NH: NY, NJ: NY, NM: DEN, NY, NC: NY, OH: NY, OK: CHI,
  PA: NY, RI: NY, SC: NY, UT: DEN, VT: NY, VA: NY, WA: LA, WV: NY, WI: CHI, WY: DEN };
const CAN = { BC: 'America/Vancouver', AB: 'America/Edmonton', SK: 'America/Regina', MB: 'America/Winnipeg', ON: 'America/Toronto', QC: 'America/Toronto',
  NB: 'America/Halifax', NS: 'America/Halifax', PE: 'America/Halifax', NL: 'America/St_Johns', YT: 'America/Whitehorse', NT: 'America/Yellowknife' };
const AUS = { NSW: 'Australia/Sydney', ACT: 'Australia/Sydney', VIC: 'Australia/Melbourne', QLD: 'Australia/Brisbane', SA: 'Australia/Adelaide',
  TAS: 'Australia/Hobart', WA: 'Australia/Perth', NT: 'Australia/Darwin' };
const MSK = 'Europe/Moscow', YEK = 'Asia/Yekaterinburg';
const RUS = { MOSKVA: MSK, SANKT_PETERBURG: MSK, CHELYABINSK: YEK, YEKATERINBURG: YEK, NOVOSIBIRSK: 'Asia/Novosibirsk', KRASNOYARSK: 'Asia/Krasnoyarsk' };
const SAO = 'America/Sao_Paulo';
const BRA = { SAO_PAULO: SAO, RIO_DE_JANEIRO: SAO, MINAS_GERAIS: SAO, PARANA: SAO, SANTA_CATARINA: SAO, RIO_GRANDE_DO_SUL: SAO, DISTRITO_FEDERAL: SAO,
  ESPIRITO_SANTO: SAO, GOIAS: SAO, BAHIA: 'America/Bahia' };
const MXC = 'America/Mexico_City';
const MEX = { CIUDAD_DE_MEXICO: MXC, MEXICO: MXC, JALISCO: MXC, NUEVO_LEON: MXC, PUEBLA: MXC, QUERETARO: MXC, GUANAJUATO: MXC, YUCATAN: MXC, MORELOS: MXC,
  VERACRUZ: MXC, BAJA_CALIFORNIA: 'America/Tijuana' };
const WIB = 'Asia/Jakarta', WITA = 'Asia/Makassar';
const IDN = { DKI_JAKARTA: WIB, JAWA_BARAT: WIB, JAWA_TENGAH: WIB, JAWA_TIMUR: WIB, BANTEN: WIB, DI_YOGYAKARTA: WIB, YOGYAKARTA: WIB, RIAU: WIB, JAMBI: WIB,
  SUMATERA_UTARA: WIB, SUMATERA_BARAT: WIB, SUMATERA_SELATAN: WIB, LAMPUNG: WIB, ACEH: WIB, BALI: WITA, SULAWESI_SELATAN: WITA, SULAWESI_TENGAH: WITA,
  NUSA_TENGGARA_BARAT: WITA, KALIMANTAN_SELATAN: WITA, KALIMANTAN_TIMUR: WITA };
const BY_STATE = { US, CA: CAN, AU: AUS, RU: RUS, BR: BRA, MX: MEX, ID: IDN };

// States that straddle a zone boundary are decided by position (coarse: a few rural counties at a boundary may be off).
function splitZone(country, state, lat, lng){
  if(!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if(country === 'CA'){
    if(state === 'ON') return lng < -89.5 ? 'America/Winnipeg' : 'America/Toronto';
    return lng > -117.0 ? 'America/Edmonton' : 'America/Vancouver';                 // BC: the Kootenays and Rockies keep Mountain time
  }
  switch(state){
    case 'TN': return lng > -85.45 ? NY : CHI;
    case 'FL': return lng < -85.4 && lat > 29.5 ? CHI : NY;
    case 'KY': return lng < -86.0 ? CHI : NY;
    case 'IN': return lng < -86.95 && (lat > 41.0 || lat < 38.5) ? CHI : NY;
    case 'TX': return lng < -104.0 ? DEN : CHI;
    case 'KS': return lng < -101.8 ? DEN : CHI;
    case 'NE': return lng < -101.05 ? DEN : CHI;
    case 'SD': return lng < -100.4 ? DEN : CHI;
    case 'ND': return lng < -102.0 && lat < 47.6 ? DEN : CHI;
    case 'MI': return lat > 45.5 && lng < -87.55 ? CHI : 'America/Detroit';
    case 'OR': return lng > -117.5 && lat < 44.5 ? 'America/Boise' : LA;
    default: return lat > 45.5 ? LA : 'America/Boise';                                // ID
  }
}
const SPLIT = { US: new Set(['TN', 'FL', 'KY', 'IN', 'TX', 'KS', 'NE', 'SD', 'ND', 'MI', 'OR', 'ID']), CA: new Set(['ON', 'BC']) };

// The IANA zone a gym keeps time in, or null when we do not know (its open state is then unknown too).
export function gymTimeZone(g){
  if(!g || typeof g.country !== 'string') return null;
  const c = g.country.toUpperCase(), s = typeof g.state === 'string' ? g.state.toUpperCase() : '';
  if(SPLIT[c] && SPLIT[c].has(s)) return splitZone(c, s, Number(g.lat), Number(g.lng));
  if(BY_STATE[c]) return BY_STATE[c][s] || null;
  if(c === 'ES') return s === 'CANARIAS' ? 'Atlantic/Canary' : 'Europe/Madrid';
  if(c === 'PT') return s === 'MADEIRA' ? 'Atlantic/Madeira' : s === 'AZORES' || s === 'ACORES' ? 'Atlantic/Azores' : 'Europe/Lisbon';
  if(c === 'CL') return s === 'MAGALLANES' ? 'America/Punta_Arenas' : 'America/Santiago';
  if(c === 'EC') return s === 'GALAPAGOS' ? 'Pacific/Galapagos' : 'America/Guayaquil';
  return ZONES[c] || null;
}

// ===== the clock in a zone ============================================================================================
const formatters = new Map();
function formatter(zone){
  const key = zone || '';
  if(!formatters.has(key)){
    formatters.set(key, new Intl.DateTimeFormat('en-US', { ...(zone ? { timeZone: zone } : {}), weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }));
  }
  return formatters.get(key);
}
// zone|minute -> {day, minutes}; emptied whenever the minute changes, so filtering thousands of gyms formats once per zone.
const clockMemo = new Map();
let clockMinute = -1;
function localClock(zone, now){
  const minute = Math.floor(now.getTime() / 60000);
  if(minute !== clockMinute){ clockMemo.clear(); clockMinute = minute; }
  const key = zone || '';
  if(!clockMemo.has(key)){
    let clock = null;
    try{
      const parts = Object.fromEntries(formatter(zone).formatToParts(now).map(p => [p.type, p.value]));
      const day = String(parts.weekday).slice(0, 3).toLowerCase();
      if(DAY_KEYS.includes(day)) clock = { day, minutes: (+parts.hour % 24) * 60 + +parts.minute };
    }catch(err){ clock = null; }
    clockMemo.set(key, clock);
  }
  return clockMemo.get(key);
}

// The clock to judge a gym by: its own zone; else the browser's, only for a gym within 300 km of the located visitor.
function clockFor(g, now, userLocation){
  const zone = gymTimeZone(g);
  if(zone) return localClock(zone, now);
  if(userLocation && Number.isFinite(g.lat) && Number.isFinite(g.lng) && distanceKm(userLocation, g) <= 300) return localClock(null, now);
  return null;
}

// ===== status =========================================================================================================
const SMALL_HOURS = 6 * 60;   // before 06:00 yesterday's late hours may still be running, so yesterday must be known

// {state: 'open' | 'closed' | 'unknown', ...}
//   open:   until = minutes since local midnight when it closes (0-1439); a gym open around the clock has h24: true instead
//   closed: next = {day, open, inDays}: the next opening (weekday key, minutes since midnight, 0 = later today); absent when
//           none is known within the week
export function status(g, now = new Date(), { userLocation = appState.userLocation } = {}){
  const unknown = { state: 'unknown' };
  const week = g && parsedWeek(g.hours);
  if(!week) return unknown;
  const clock = clockFor(g, now, userLocation);
  if(!clock) return unknown;
  const di = DAY_KEYS.indexOf(clock.day), t = clock.minutes;
  const today = week[clock.day], prev = week[DAY_KEYS[(di + 6) % 7]];
  if(today === null) return unknown;                      // nothing usable for today: no guess
  // Open: inside one of today's ranges, or in the past-midnight tail of yesterday's. `end` counts from today's midnight.
  let end = null;
  for(const r of today) if(t >= r.open && t < r.close) end = r.close;
  if(prev) for(const r of prev) if(r.close > DAY && t < r.close - DAY) end = Math.max(end === null ? 0 : end, r.close - DAY);
  if(end !== null){
    // A range that runs to midnight and continues with the next day's range from 00:00 is one long opening.
    let steps = 0;
    while(end === (steps + 1) * DAY && steps < 7){
      const list = week[DAY_KEYS[(di + 1 + steps) % 7]];
      const first = list && list.find(r => r.open === 0);
      if(!first) break;
      end = (steps + 1) * DAY + first.close;
      steps++;
    }
    return steps >= 7 ? { state: 'open', h24: true } : { state: 'open', until: end % DAY };
  }
  if(prev === null && t < SMALL_HOURS) return unknown;
  for(const r of today) if(r.open > t) return { state: 'closed', next: { day: clock.day, open: r.open, inDays: 0 } };
  for(let i = 1; i <= 7; i++){
    const key = DAY_KEYS[(di + i) % 7], list = week[key];
    if(list === null) return { state: 'closed' };         // an unknown day ahead: no next opening named past it
    if(list.length) return { state: 'closed', next: { day: key, open: list[0].open, inDays: i } };
  }
  return { state: 'closed' };
}

// "Today 6am-10pm", "Closed today", or '' when the gym has no entry for its today. The text is the gym's own string (callers
// escape it). The day is the gym's own; a gym with no known zone falls back to the browser's day.
export function todayLabel(g, now = new Date(), { userLocation = appState.userLocation } = {}){
  const hours = g && cleanHours(g.hours);
  if(!hours) return '';
  const clock = clockFor(g, now, userLocation) || localClock(null, now);
  const raw = clock && hours[clock.day];
  if(!raw) return '';
  const parsed = parseDay(raw);
  return parsed && parsed.length === 0 ? 'Closed today' : 'Today ' + raw;
}

// The gym's own weekday key (mon..sun) when its clock is known; null otherwise (the gym page then uses the visitor's day).
export function gymDayKey(g, now = new Date(), { userLocation = appState.userLocation } = {}){
  const clock = clockFor(g, now, userLocation);
  return clock ? clock.day : null;
}

// ===== text ===========================================================================================================
// 390 -> "6:30am", 600 -> "10am", 0 -> "12am", 720 -> "12pm".
export function formatMinutes(m){
  const x = ((m % DAY) + DAY) % DAY, h = Math.floor(x / 60), min = x % 60;
  return `${h % 12 === 0 ? 12 : h % 12}${min ? ':' + String(min).padStart(2, '0') : ''}${h < 12 ? 'am' : 'pm'}`;
}

// {state, text} for rows, cards, the peek card and the gym page; null when the status is unknown (nothing renders).
export function statusLine(st){
  if(!st || st.state === 'unknown') return null;
  if(st.state === 'open') return { state: 'open', text: st.h24 ? 'Open 24 hours' : 'Open · until ' + (st.until === 0 ? 'midnight' : formatMinutes(st.until)) };
  if(!st.next) return { state: 'closed', text: 'Closed' };
  const when = st.next.inDays === 0 ? '' : st.next.inDays === 1 ? 'tomorrow ' : DAY_NAMES[st.next.day] + ' ';
  return { state: 'closed', text: 'Closed · opens ' + when + formatMinutes(st.next.open) };
}
export const hoursLine = (g, now) => statusLine(status(g, now));
