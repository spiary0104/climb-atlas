// Passport rules (DESIGN.md sec. 11, 12.3): pure, no DOM, no appState; unit-tested in tests/passport.test.js.
//   stamps          one stamp per city ("city" = suburb until a city field exists, sec. 9.1), most recent first
//   passportStats   "11 gyms · 4 cities · 2 countries"
//   passportLine    the one sentence under a new stamp: "Your 11th visit here" / "Your first gym in Tokyo"
//   milestonesFor   first check-in, every 5th distinct gym, first gym in a new country (sec. 12.3)
//   newTopGrade     a new highest sent grade in the log, within one grade system
// A check-in row: {id, spot_id, checked_at, note}. spotById: Map id -> gym {id, name, suburb, state, country}.

export const cityKey = g => [g.country || '', g.state || '', (g.suburb || '').trim().toLowerCase()].join(':');

export function ordinal(n){
  const k = n % 100, e = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10];
  return n + ((k >= 11 && k <= 13) || !e ? 'th' : e);
}

// Check-ins joined to their gyms, oldest first; rows whose gym is unknown (deleted) are dropped.
function joined(checkins, spotById){
  return (checkins || [])
    .map(c => ({ c, g: spotById.get(c.spot_id) }))
    .filter(x => x.g)
    .sort((a, b) => String(a.c.checked_at).localeCompare(String(b.c.checked_at)));
}

// One stamp per city: {key, city, state, country, gyms (distinct), visits, first, last, seed}; most recent first.
export function stamps(checkins, spotById){
  const by = new Map();
  for(const { c, g } of joined(checkins, spotById)){
    const key = cityKey(g);
    let s = by.get(key);
    if(!s){ s = { key, city: g.suburb || g.name, state: g.state, country: g.country, gymIds: new Set(), visits: 0, first: c.checked_at, last: c.checked_at, seed: key }; by.set(key, s); }
    s.gymIds.add(g.id); s.visits++; s.last = c.checked_at;
  }
  return [...by.values()]
    .map(({ gymIds, ...s }) => ({ ...s, gyms: gymIds.size }))
    .sort((a, b) => String(b.last).localeCompare(String(a.last)));
}

export function passportStats(checkins, spotById){
  const rows = joined(checkins, spotById);
  return {
    gyms: new Set(rows.map(x => x.g.id)).size,
    cities: new Set(rows.map(x => cityKey(x.g))).size,
    countries: new Set(rows.map(x => x.g.country)).size,
  };
}

const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
export const statsLine = s => [plural(s.gyms, 'gym', 'gyms'), plural(s.cities, 'city', 'cities'), plural(s.countries, 'country', 'countries')].join(' · ');

// The sentence for the newest check-in (the last element once `all` includes it). countryName: code -> label.
export function passportLine(all, newest, spotById, countryName = c => c){
  const rows = joined(all, spotById);
  const g = spotById.get(newest.spot_id);
  if(!g) return '';
  const before = rows.filter(x => x.c.id !== newest.id && String(x.c.checked_at) <= String(newest.checked_at));
  if(!before.length) return 'Your first stamp.';
  if(!before.some(x => x.g.country === g.country)) return 'Your first gym in ' + countryName(g.country) + '.';
  if(!before.some(x => cityKey(x.g) === cityKey(g))){
    const year = String(newest.checked_at).slice(0, 4);
    const cities = new Set([...before.filter(x => String(x.c.checked_at).slice(0, 4) === year).map(x => cityKey(x.g)), cityKey(g)]).size;
    return 'Your first gym in ' + (g.suburb || g.name) + (cities > 1 ? ', your ' + ordinal(cities) + ' city this year.' : '.');
  }
  const visits = before.filter(x => x.g.id === g.id).length + 1;
  if(visits > 1) return 'Your ' + ordinal(visits) + ' visit here.';
  return 'Your ' + ordinal(new Set([...before.map(x => x.g.id), g.id]).size) + ' gym.';
}

// Milestones earned by the newest check-in, highest first (sec. 12.3). home: the person's home country code or ''.
// {kind, title, sentence, pose}; the sheet shows the first and lists the others in one line.
export function milestonesFor(all, newest, spotById, { home = '', countryName = c => c } = {}){
  const rows = joined(all, spotById);
  const g = spotById.get(newest.spot_id);
  if(!g) return [];
  const before = rows.filter(x => x.c.id !== newest.id && String(x.c.checked_at) <= String(newest.checked_at));
  const out = [];
  if(!before.some(x => x.g.country === g.country) && before.length && (!home || g.country !== home)){
    const abroadBefore = home ? before.some(x => x.g.country !== home) : true;
    out.push(abroadBefore || !home
      ? { kind: 'country', title: 'First gym in ' + countryName(g.country), sentence: plural(new Set([...before.map(x => x.g.country), g.country]).size, 'country', 'countries') + ' in your passport.', pose: 'fresh-stamp' }
      : { kind: 'abroad', title: 'First stamp abroad', sentence: g.name + ', ' + countryName(g.country) + '.', pose: 'fresh-stamp' });
  }
  const gymsBefore = new Set(before.map(x => x.g.id)), gymsNow = new Set([...gymsBefore, g.id]).size;
  if(gymsNow > gymsBefore.size && gymsNow % 5 === 0){
    out.push({ kind: 'gyms', title: gymsNow + ' gyms', sentence: 'Your ' + ordinal(gymsNow) + ' different gym: ' + g.name + '.', pose: 'fresh-stamp' });
  }
  if(!before.length) out.push({ kind: 'first', title: 'First stamp', sentence: g.name + ' is the first stamp in your passport.', pose: 'topped-out' });
  return out;
}

// ----- grades -----
// Comparable rank within one system, or null. V-scale: VB, V0..V17 (a trailing +/- nudges). YDS: 5.5..5.15d.
export function gradeRank(grade, system){
  const s = String(grade || '').trim().toUpperCase().replace(/\s+/g, '');
  if(system === 'v-scale'){
    if(/^VB[+-]?$/.test(s)) return -1;
    const m = /^V(\d{1,2})([+-])?$/.exec(s);
    if(!m || Number(m[1]) > 17) return null;
    return Number(m[1]) + (m[2] === '+' ? 0.3 : m[2] === '-' ? -0.3 : 0);
  }
  if(system === 'yds'){
    const m = /^5\.(\d{1,2})([ABCD])?([+-])?$/.exec(s);
    if(!m || Number(m[1]) > 15) return null;
    const letter = m[2] ? 'ABCD'.indexOf(m[2]) * 0.25 : 0.375;
    return Number(m[1]) + letter + (m[3] === '+' ? 0.1 : m[3] === '-' ? -0.1 : 0);
  }
  return null;
}

// A new highest SENT grade in a system the person has logged before. prev/next: [{grade, grade_system, sent}].
export function newTopGrade(prev, next){
  let best = null;
  for(const system of ['v-scale', 'yds']){
    const top = list => Math.max(-Infinity, ...list.filter(c => c.sent !== false && c.grade_system === system).map(c => gradeRank(c.grade, system)).filter(r => r !== null));
    const before = top(prev || []), now = top(next || []);
    if(before === -Infinity || now <= before) continue;
    const climb = (next || []).find(c => c.sent !== false && c.grade_system === system && gradeRank(c.grade, system) === now);
    if(!best || now - before > best.gain) best = { gain: now - before, system, grade: String(climb.grade).trim() };
  }
  return best && { kind: 'grade', title: 'First ' + best.grade, sentence: 'A new highest grade in your log.', pose: 'dyno' };
}

// The person's home country for "abroad": the region of the browser locale (en-AU -> AU), else ''.
export function homeFromLocale(lang){
  const m = /[-_]([A-Za-z]{2})(?:$|[-_])/.exec(String(lang || ''));
  return m ? m[1].toUpperCase() : '';
}
