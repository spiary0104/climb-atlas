// Page titles and descriptions for gyms and places (SEO + link previews). Pure, no DOM, no imports: unit-tested in
// tests/seo-meta.test.js. The in-app router uses the titles (document.title); anything that renders them into HTML on
// a server must escapeHtml() them (html-safe.js). Values are plain text, whitespace-normalised and length-capped here
// because gym names, suburbs and addresses are user-submitted.
// No imports (api/seo.mjs loads this file from a data: URL), so the language is injected: every builder takes an optional
// `tr(key, params)` (the app passes i18n.js t for in-app page titles and share text). Without it the output is English,
// which is what the server-side link previews and sitemap get.
export const SITE_NAME = 'Bouldeer';
export const SITE_SUFFIX = ' · ' + SITE_NAME;
export const SITE_TITLE = 'Bouldeer — community-sourced climbing map';
export const SITE_DESCRIPTION = 'A community-sourced map of indoor climbing gyms — bouldering, top rope, and lead — in 80+ countries.';

const TYPE_WORDS = { 'indoor-bouldering': 'bouldering', 'top-rope': 'top rope', 'lead-climbing': 'lead climbing' };
const TYPE_WORD_KEYS = { 'indoor-bouldering': 'bouldering', 'top-rope': 'topRope', 'lead-climbing': 'lead' };
const TITLE_MAX = 90, DESC_MAX = 200;

// Strip control characters, collapse whitespace (\s also covers the Unicode line separators), cap the length (on a word
// boundary where possible).
export function clean(value, max = 120){
  const s = String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  if(s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.·-]+$/, '') + '…';
}

const join = parts => parts.map(p => clean(p)).filter(Boolean).join(', ');
const list = words => words.length < 2 ? words.join('') : words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1];
export const typeWords = (types, tr) => (Array.isArray(types) ? types : []).filter(k => TYPE_WORDS[k]).map(k => tr ? tr('seo.word.' + TYPE_WORD_KEYS[k]) : TYPE_WORDS[k]);
// "Bouldering gym" when bouldering is all it offers, otherwise "Climbing gym".
export const gymNoun = (types, tr) => {
  const w = typeWords(types);
  const boulderOnly = w.length === 1 && w[0] === 'bouldering';
  return tr ? tr(boulderOnly ? 'seo.boulderingGym' : 'seo.climbingGym') : boulderOnly ? 'Bouldering gym' : 'Climbing gym';
};
// The page title WITHOUT the site suffix (router.setPageTitle appends it); fullTitle() adds it for server-rendered tags.
export const fullTitle = title => title + SITE_SUFFIX;

// g: {name, suburb, types, address}; ctx: {region, country} already resolved to display names (e.g. "NSW"/"New South Wales", "Australia").
export function gymSeo(g, { region = '', country = '', tr = null } = {}){
  const name = clean(g.name, 80) || (tr ? tr('seo.climbingGym') : 'Climbing gym');
  const place = join([g.suburb, region, country]);
  const noun = gymNoun(g.types, tr);
  const nounIn = p => tr ? tr('seo.nounIn', { noun, place: p }) : noun + ' in ' + p;
  let title = name + ' · ' + (place ? nounIn(place) : noun);
  if(title.length + SITE_SUFFIX.length > TITLE_MAX) title = name + ' · ' + (join([g.suburb, country]) || noun);   // too long: drop the region
  const words = typeWords(g.types);
  const address = clean(g.address, 90);
  const parts = [
    name + ' is a ' + noun.toLowerCase() + (place ? ' in ' + place : '') + '.',
    words.length && noun !== 'Bouldering gym' ? 'Climbing here: ' + list(words) + '.' : '',
    'See it on Bouldeer, the community-sourced climbing map.',
  ].filter(Boolean);
  // The address goes before the closing sentence, but only when everything still fits (never cut the tail off).
  const withAddress = address ? [...parts.slice(0, -1), 'Address: ' + address + '.', parts[parts.length - 1]] : parts;
  const description = clean((withAddress.join(' ').length <= DESC_MAX ? withAddress : parts).join(' '), DESC_MAX);
  return { title, description };
}

// kind: 'country' | 'region' | 'city'; name: the place's own name; within: its parent(s) as one string ("Australia",
// "NSW, Australia"); count: gyms in the place.
export function placeSeo({ kind, name, within = '', count = 0, tr = null }){
  const n = clean(name, 80);
  const where = kind === 'country' || !within ? n : n + ', ' + clean(within, 60);
  const title = tr ? tr('seo.placeTitle', { where }) : 'Climbing gyms in ' + where;
  const gyms = count === 1 ? '1 climbing gym' : count > 1 ? count.toLocaleString('en-US') + ' climbing gyms' : 'Climbing gyms';
  return { title, description: clean(gyms + ' in ' + where + ': bouldering, top rope and lead. Browse them on Bouldeer, the community-sourced climbing map.', DESC_MAX) };
}

// A region page that lists exactly the same gyms as one of its city pages (a region and its only city sharing a name,
// e.g. /in/cn/shanghai and /in/cn/shanghai/shanghai) duplicates that page, so its canonical points at the city page and
// the sitemap lists only the city (Search Console 2026-10-15: "Duplicate, Google chose different canonical than user").
// ids: the region's gym ids; candidates: [{path, ids}] for the city pages that could duplicate it. Returns the city
// path, or null when no city page holds exactly the region's gyms. Ties resolve to the first path in sort order.
export function duplicatePlacePath(ids, candidates){
  const key = list => [...new Set((list || []).map(String))].sort().join('\n');
  const want = key(ids);
  if(!want) return null;
  const hit = [...(candidates || [])].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)).find(c => key(c.ids) === want);
  return hit ? hit.path : null;
}
