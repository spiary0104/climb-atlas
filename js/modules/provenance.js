// Provenance and contribution rules (DESIGN.md sec. 10). Pure, unit-tested.
//   listed              added by Bouldeer itself (seed data and researched imports: spots.community === false), not by a user
//   community-added     submitted by a user and approved by a moderator (spots.community === true, or unknown)
//   community-verified  two or more distinct contributors (the adder and authors of approved edits)
//   verified            a moderator marked it verified (spots.verified_at)
// Marks: grey ring-dot, forest ring-dot, nothing. Levels (sec. 10.6): thresholds are ours, the spec fixes only the points.

export function provenanceState(g, contributors = 0){
  if(g && g.verified_at) return 'verified';
  if(Number(contributors) >= 2) return 'community-verified';
  if(g && g.community === false) return 'listed';      // owner decision 2026-10-03: imported gyms are not community-added
  return 'community-added';
}

export const PROVENANCE_LABELS = Object.freeze({
  'listed': 'Listed by Bouldeer',
  'community-added': 'Community-added',
  'community-verified': 'Community-verified',
  'verified': 'Verified',
});

// Points: 15 per approved gym, 5 per approved edit (computed server-side); levels 1-5; "Contributor" from level 3.
export const LEVELS = Object.freeze([0, 15, 50, 150, 400]);
export function levelFor(points){
  const p = Number(points) || 0;
  let level = 1;
  LEVELS.forEach((min, i) => { if(p >= min) level = i + 1; });
  return level;
}
export const isContributor = points => levelFor(points) >= 3;

// "today", "yesterday", "3 days ago", "2 weeks ago", "5 months ago", "2 years ago"; '' for missing/invalid dates.
export function formatRelative(date, now = new Date()){
  if(date == null || date === '') return '';           // new Date(null) is 1970, not "unknown"
  const t = new Date(date).getTime();
  if(!Number.isFinite(t)) return '';
  const days = Math.floor((new Date(now).getTime() - t) / 86400000);
  if(days <= 0) return 'today';
  if(days === 1) return 'yesterday';
  if(days < 14) return days + ' days ago';
  if(days < 60) return Math.floor(days / 7) + ' weeks ago';
  if(days < 730) return Math.floor(days / 30) + ' months ago';
  return Math.floor(days / 365) + ' years ago';
}

// The page line (sec. 10.2): "{state} · added by {name or "a climber"} · last edited {relative} · {n} contributors".
// Seed-imported gyms have no adder: the "added by" part is left out rather than invented.
export function provenanceLine(g, p = {}, now = new Date()){
  p = p || {};                                        // a failed lookup is cached as null
  const state = provenanceState(g, p.contributors);
  const parts = [PROVENANCE_LABELS[state]];
  if(g && g.submitted_by) parts.push('added by ' + (p.added_by || 'a climber'));
  const edited = formatRelative(p.last_edited, now);
  if(edited) parts.push('last edited ' + edited);
  const n = Number(p.contributors) || 0;
  if(n >= 1) parts.push(n === 1 ? '1 contributor' : n + ' contributors');
  return { state, text: parts.join(' · ') };
}

// Display names: 2-40 visible characters, no '@' (never an email) and no angle brackets -- the database check, mirrored.
export function validDisplayName(name){
  const n = String(name == null ? '' : name).trim();
  return n.length >= 2 && n.length <= 40 && !/[@<>]/.test(n);
}

// A table the running database does not have yet (its migration is not applied): PostgREST PGRST205, Postgres 42P01.
export const isMissingTable = err => !!err && (err.code === 'PGRST205' || err.code === '42P01' || /could not find the table|does not exist|schema cache/i.test(err.message || ''));

// What to tell someone whose display name did not save. The profiles table arrives with migration 20260926084510; until
// then every save 404s, and "try again" would never work.
export function displayNameSaveMessage(err){
  if(isMissingTable(err)) return 'Display names aren’t switched on yet. Your name will be saved once they are.';
  const why = String((err && err.message) || '');
  if((err && err.code === '23514') || /check constraint/i.test(why)) return 'Use 2 to 40 characters, without @ or < >.';
  if(/JWT|row-level security|permission denied|Not signed in/i.test(why)) return 'Your sign-in has expired. Sign in again to save.';
  return 'Could not save — try again.';
}

// Internal research notes. Imported gyms carry the remarks written while the data was researched: where the entry was
// sourced, how the pin was placed ("Pin is the gym's own mapped OpenStreetMap feature (Nominatim), so building-level."),
// what evidence a discipline tag rests on ("Own site confirms ..."). They are for maintainers, not visitors, so the gym
// page and the peek card show publicNotes(notes) instead of the stored text. The stored text is never changed (the edit
// form and /mod still show all of it). Per note, in order:
//  1. RESEARCH: if any sentence is the source line, a pin remark or evidence wording, the whole note is hidden.
//     Evidence summaries mix real facts with dates and sources and cannot be separated reliably.
//  2. STRIP: a sentence that is verification boilerplate or names a geocoder or a source site is dropped on its own, so
//     a real description ("Nonprofit, pay-what-you-can gym.") survives a trailing "Address and position verified".
//  3. After a strip only, BROAD: the leftovers must not read like research either (confirmed, corrected, "above", ...)
//     and must not be fragments of a bad split; otherwise the whole note is hidden.
// Hiding a real note costs a line of text; showing research costs trust, so every doubt resolves to hiding.
const STRIP = [
  /\b(?:nominatim|photon|openstreetmap|osm|geocod\w*|arcgis|webfetch|census bureau|findaddresscandidates|plus code)\b/i,
  /\b(?:address and position|position (?:corrected|verified|from|falls?|is))\b|\b(?:street|district|building|city|house|neighbourhood|area|dong)[- ]level\b/i,
  /\b(?:independently )?(?:confirmed|verified|corroborated)\s+(?:real|against|via|by)\b|\bweb ?search\b/i,
  /\b[a-z0-9-]+\.(?:com|org|net|cn|jp|io|it|es|fr|de|info|co\.za|ge|qa)\b/i,
  /\b(?:climbing-gyms|boulderinglist|climbing-net|rocodromos|huodong|smartshanghai|mountain project|spiri\d*|daangn|daum|besttimes|instagram|facebook|yelp|2gis|yandex|tripadvisor|trip\.com|time out|esquire|sassy hk|ukc|climbscotland|google place)\b/i,
];
const RESEARCH = [
  /\b(?:sourced from|found via|seen in the app|native-language|directory pass|listing added)\b/i,
  /^from [^.]{0,80}\b(?:lists?|pages?|site|directory)\b|^added\b[^.]{0,30}\bvia\b/i,
  /\bpin (?:is|was|sits|placed)\b|\bpinned to\b|\b(?:couldn.t|could not|did not|didn.t) resolve\b/i,
  /^(?:medium|low|lower|high) confidence\b|^sources?:|\btags? (?:are|is)\b/i,
  /\bown[- ](?:site|website|centre|center|description|page|copy|[\w']+ page)\b|\b(?:official) (?:site|website|news|notices?)\b/i,
  /\b(?:multiple|several|independent) sources?\b|\bsources? (?:confirm|describe|state|disagree|agree|place)\b|\bsite\/(?:reviews?|press)\b/i,
  /\b(?:this|the) (?:app|project|dataset|seed data)\b|\bseed data\b|\bevidence\b|\bflagg?ing\b|\bdefaults? to\b|\bdefaulted\b|\b(?:not|nor|never) tagged\b|\btagged (?:bouldering|top-rope|as)\b/i,
  /\bfacility (?:page|description|described)\b|\b(?:not|nothing|no \w+(?:-\w+)?) (?:mentioned|stated|specified|found)\b|\bno verifiable\b|\bthis pass\b/i,
  /\b(?:reviews?|directory|listings?|coverage|description|prices page)\b[^.]{0,40}\b(?:confirms?|states?|describes?|lists?|explicitly)\b|\b(?:confirms?|describes?|explicitly)\b[^.]{0,30}\b(?:reviews?|directory|listings?)\b/i,
  /\bdescribed (?:purely|as|at any)\b|\bper (?:local )?coverage\b|\bper the [\w' ]{1,30} site\b|\bmall-level address\b|\bunit number\b|\bnot separately listed\b/i,
  // data-correction and de-duplication remarks ("Corrected suburb from ...", "A different gym from X, above.")
  /\bcorrected\b|\bupdated accordingly\b|\blat\/lng\b|\bkept (?:the|for|since|as)\b|\bverified address\b|\bconfirmed to\b|\bstale duplicate\b|\bremoved as\b|\bexplicitly\b/i,
  /\b(?:different|separate|distinct)\b[^.]{0,30}\b(?:gym|location|branch|entry)\b[^.]{0,60}\b(?:from|than)\b|\b(?:the one|gym|location|branch|entry) (?:above|below)\b|\b(?:above|below)\s*(?:[.,;—-]|$)|\bunrelated to\b|\bsame chain\b|\btechnically (?:in|near)\b|\bpress coverage\b/i,
  /\bis mapped to\b|\btreated as\b|\bno mention(?:s|ed)?\b|\bnot (?:namba|[a-z]+) proper\b|\bdespite the\b[^.]{0,30}\blabel\b/i,
];
const BROAD = /\b(?:confirm\w*|sources?|evidence|dataset|batch|duplicates?|tagged|flag\w*|listings?|directory|stale|corrected|above|below|kept|mentioned|stated|described|placeholder|centroid|approximate\w*|position|multiple|precedent|different (?:gym|location)|news|updated|promo|dated)\b/i;

// What is left of a research note when only its discipline label survives ("Bouldering. Bouldering only."): nothing worth showing.
const TRIVIAL = /^(?:(?:indoor )?bouldering|boulder(?:ing)? (?:gym|hall)|bouldering only)[.\s]*(?:(?:indoor )?bouldering|bouldering only)?[.\s]*$/i;

// A sentence ends at . ! ? followed by a capital or digit, except after a street abbreviation ("111 av. Victor Hugo").
const SENTENCE_BREAK = /(?<=[.!?])(?<!\b(?:[Aa]v|[Aa]ve|[Ss]t|[Rr]d|[Dd]r|[Mm]t|[Nn]o|[Nn]r|[Bb]lvd)\.)\s+(?=[A-Z0-9"'(“])/;

export function splitSentences(text){
  return String(text == null ? '' : text).replace(/\s+/g, ' ').trim().split(SENTENCE_BREAK).filter(Boolean);
}

const balanced = s => (s.match(/\(/g) || []).length === (s.match(/\)/g) || []).length && (s.match(/"/g) || []).length % 2 === 0;
const isFragment = s => !/^[A-Z0-9"'(“]/.test(s) || !balanced(s);

// The notes a visitor should see: the stored notes with research sentences removed; '' when the note is research.
// A note with nothing recognisable as research comes back exactly as stored (line breaks included).
export function publicNotes(notes){
  if(typeof notes !== 'string') return '';
  const raw = notes.trim();
  if(!raw) return '';
  const sentences = splitSentences(raw);
  if(sentences.some(s => RESEARCH.some(re => re.test(s)))) return '';
  const kept = sentences.filter(s => !STRIP.some(re => re.test(s)));
  if(kept.length === sentences.length) return raw;
  if(!kept.length || kept.some(s => BROAD.test(s) || isFragment(s))) return '';
  const text = kept.join(' ');
  return TRIVIAL.test(text) ? '' : text;
}
