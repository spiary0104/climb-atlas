// Page titles and descriptions for gyms and places (SEO + link previews). Pure, no DOM, no imports: unit-tested in
// tests/seo-meta.test.js. The in-app router uses the titles (document.title); anything that renders them into HTML on
// a server must escapeHtml() them (html-safe.js). Values are plain text, whitespace-normalised and length-capped here
// because gym names, suburbs and addresses are user-submitted.
export const SITE_NAME = 'Bouldeer';
export const SITE_SUFFIX = ' · ' + SITE_NAME;
export const SITE_TITLE = 'Bouldeer — community-sourced climbing map';
export const SITE_DESCRIPTION = 'A community-sourced map of indoor climbing gyms — bouldering, top rope, and lead — in 80+ countries.';

const TYPE_WORDS = { 'indoor-bouldering': 'bouldering', 'top-rope': 'top rope', 'lead-climbing': 'lead climbing' };
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
export const typeWords = types => (Array.isArray(types) ? types : []).map(t => TYPE_WORDS[t]).filter(Boolean);
// "Bouldering gym" when bouldering is all it offers, otherwise "Climbing gym".
export const gymNoun = types => { const w = typeWords(types); return w.length === 1 && w[0] === 'bouldering' ? 'Bouldering gym' : 'Climbing gym'; };
// The page title WITHOUT the site suffix (router.setPageTitle appends it); fullTitle() adds it for server-rendered tags.
export const fullTitle = title => title + SITE_SUFFIX;

// g: {name, suburb, types, address}; ctx: {region, country} already resolved to display names (e.g. "NSW"/"New South Wales", "Australia").
export function gymSeo(g, { region = '', country = '' } = {}){
  const name = clean(g.name, 80) || 'Climbing gym';
  const place = join([g.suburb, region, country]);
  const noun = gymNoun(g.types);
  let title = name + ' · ' + (place ? noun + ' in ' + place : noun);
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
export function placeSeo({ kind, name, within = '', count = 0 }){
  const n = clean(name, 80);
  const where = kind === 'country' || !within ? n : n + ', ' + clean(within, 60);
  const title = 'Climbing gyms in ' + where;
  const gyms = count === 1 ? '1 climbing gym' : count > 1 ? count.toLocaleString('en-US') + ' climbing gyms' : 'Climbing gyms';
  return { title, description: clean(gyms + ' in ' + where + ': bouldering, top rope and lead. Browse them on Bouldeer, the community-sourced climbing map.', DESC_MAX) };
}
