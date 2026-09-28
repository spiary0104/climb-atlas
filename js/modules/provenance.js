// Provenance and contribution rules (DESIGN.md sec. 10). Pure, unit-tested.
//   community-added     the default for every approved gym, seed-imported ones included ("which is honest", sec. 10.1)
//   community-verified  two or more distinct contributors (the adder and authors of approved edits)
//   verified            a moderator marked it verified (spots.verified_at)
// Marks: grey ring-dot, forest ring-dot, nothing. Levels (sec. 10.6): thresholds are ours, the spec fixes only the points.

export function provenanceState(g, contributors = 0){
  if(g && g.verified_at) return 'verified';
  if(Number(contributors) >= 2) return 'community-verified';
  return 'community-added';
}

export const PROVENANCE_LABELS = Object.freeze({
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
