// Interface language (i18n). One dictionary per language (js/modules/i18n-<code>.js: a flat object of stable keys ->
// strings), English built in as the default and the fallback for any missing key. No library and no CDN: lookups,
// {name} interpolation, plurals via Intl.PluralRules and number/date/list formatting via Intl, all in the browser.
//   Choice: a language the person picked (stored on this device, never overwritten) > the browser's languages on first
//   visit > English. Switching swaps the dictionary, updates <html lang> and static [data-i18n] text, then fires
//   'bouldeer:locale' so the app re-renders in place (no reload: search, map, filters and selection stay as they are).
//   Only languages with a complete, reviewed dictionary are `enabled`; the rest are listed for later phases.
// Gym data (names, addresses, visitor info) is never translated here: it is shown as stored, with its own language.
import EN from './i18n-en.js';
import { escapeHtml } from './html-safe.js';

export const LOCALES = Object.freeze([
  { code: 'en', name: 'English', html: 'en', enabled: true },
  { code: 'zh-CN', name: '简体中文', html: 'zh-Hans-CN', enabled: true },
  { code: 'zh-TW', name: '繁體中文', html: 'zh-Hant-TW', enabled: false },
  { code: 'ja', name: '日本語', html: 'ja', enabled: false },
  { code: 'ko', name: '한국어', html: 'ko', enabled: false },
  { code: 'de', name: 'Deutsch', html: 'de', enabled: false },
  { code: 'fr', name: 'Français', html: 'fr', enabled: false },
  { code: 'es', name: 'Español', html: 'es', enabled: false },
  { code: 'pt-BR', name: 'Português (Brasil)', html: 'pt-BR', enabled: false },
]);
const LOADERS = { 'zh-CN': () => import('./i18n-zh-CN.js') };   // English is static; add one line per enabled language
export const STORAGE_KEY = 'bouldeer_lang';
export const DEFAULT_LOCALE = 'en';

export const enabledLocales = () => LOCALES.filter(l => l.enabled);
const isEnabled = code => LOCALES.some(l => l.code === code && l.enabled);
const htmlLang = code => (LOCALES.find(l => l.code === code) || LOCALES[0]).html;

let locale = DEFAULT_LOCALE, dict = EN;
const warned = new Set();
const pluralCache = new Map();

export const currentLocale = () => locale;
export const currentHtmlLang = () => htmlLang(locale);

// Browser languages -> an enabled locale. Simplified Chinese for zh, zh-CN, zh-Hans, zh-SG; Traditional (zh-TW/HK/MO,
// zh-Hant) is NOT mapped to Simplified: until zh-TW is enabled those readers get English (a choice, not a guess).
export function matchLocale(langs){
  for(const raw of langs || []){
    const l = String(raw || '').toLowerCase();
    if(!l) continue;
    if(l.startsWith('zh')){
      if(/hant|-tw|-hk|-mo/.test(l)){ if(isEnabled('zh-TW')) return 'zh-TW'; continue; }
      if(isEnabled('zh-CN')) return 'zh-CN';
      continue;
    }
    const exact = LOCALES.find(x => x.enabled && x.code.toLowerCase() === l);
    if(exact) return exact.code;
    const base = l.split('-')[0];
    const loose = LOCALES.find(x => x.enabled && x.code.toLowerCase().split('-')[0] === base);
    if(loose) return loose.code;
  }
  return DEFAULT_LOCALE;
}

function readStored(){ try { const v = localStorage.getItem(STORAGE_KEY); return isEnabled(v) ? v : null; } catch(e){ return null; } }
function writeStored(code){ try { localStorage.setItem(STORAGE_KEY, code); } catch(e){ /* private mode: the choice lasts this visit */ } }

// The language to start in: a stored manual choice wins, then the browser's languages, then English.
export function initialLocale(){
  const stored = readStored();
  if(stored) return stored;
  const nav = typeof navigator !== 'undefined' ? (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]) : [];
  return matchLocale(nav);
}

async function loadDict(code){
  if(code === 'en') return EN;
  const load = LOADERS[code];
  if(!load) return null;
  try { return (await load()).default; } catch(e){ console.warn('[i18n] could not load', code, e); return null; }
}

// Switch language. manual: the person picked it (stored; later browser-language changes never override it).
export async function setLocale(code, { manual = false } = {}){
  if(!isEnabled(code)) code = DEFAULT_LOCALE;
  const d = await loadDict(code);
  if(!d){ code = DEFAULT_LOCALE; }
  locale = code; dict = d || EN;
  if(manual) writeStored(code);
  if(typeof document !== 'undefined'){
    document.documentElement.lang = htmlLang(code);
    applyI18n(document);
  }
  if(typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('bouldeer:locale', { detail: { locale: code } }));
  return code;
}

// Before the first render: load the starting language (English needs no fetch).
export async function initI18n(){
  const code = initialLocale();
  if(code === DEFAULT_LOCALE){ if(typeof document !== 'undefined') document.documentElement.lang = 'en'; return code; }
  return setLocale(code);
}

function pluralRule(n, lang){
  let pr = pluralCache.get(lang);
  if(!pr){ try { pr = new Intl.PluralRules(lang); } catch(e){ pr = new Intl.PluralRules('en'); } pluralCache.set(lang, pr); }
  return pr.select(n);
}

// t('key', {name, count}) -> text. A message is a string or a plural object {one, other, ...} chosen by params.count.
// Missing in the current language -> English; missing in English -> the key itself (and one console warning).
export function t(key, params){
  let msg = dict[key], lang = locale;
  if(msg === undefined){ msg = EN[key]; lang = 'en'; }
  if(msg === undefined){
    if(!warned.has(key)){ warned.add(key); console.warn('[i18n] missing key', key); }
    return key;
  }
  if(typeof msg === 'object'){
    const n = params && Number.isFinite(Number(params.count)) ? Number(params.count) : 0;
    msg = msg[pluralRule(n, lang)] ?? msg.other ?? '';
  }
  if(!params) return msg;
  return msg.replace(/\{(\w+)\}/g, (m, k) => {
    if(!(k in params)) return m;
    const v = params[k];
    return typeof v === 'number' ? formatNumber(v) : String(v);
  });
}

// The same, HTML-escaped, for markup templates (translations and parameters are never trusted as HTML).
export const th = (key, params) => escapeHtml(t(key, params));

export function formatNumber(n, opts){
  try { return new Intl.NumberFormat(htmlLang(locale), opts).format(n); } catch(e){ return String(n); }
}
export function formatDate(d, opts = { year: 'numeric', month: 'short', day: 'numeric' }){
  const date = d instanceof Date ? d : new Date(d);
  if(Number.isNaN(date.getTime())) return '';
  try { return new Intl.DateTimeFormat(htmlLang(locale), opts).format(date); } catch(e){ return date.toISOString().slice(0, 10); }
}
export function formatRelative(value, unit){
  try { return new Intl.RelativeTimeFormat(htmlLang(locale), { numeric: 'auto' }).format(value, unit); } catch(e){ return `${value} ${unit}`; }
}
export function formatList(items, type = 'conjunction'){
  try { return new Intl.ListFormat(htmlLang(locale), { style: 'long', type }).format(items); } catch(e){ return items.join(', '); }
}

// Static markup: <x data-i18n="key"> sets textContent; data-i18n-attr="aria-label:key;placeholder:key2" sets attributes.
// The English text stays in index.html as written, so English needs no work and nothing flashes.
export function applyI18n(root){
  if(!root || !root.querySelectorAll) return;
  for(const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.getAttribute('data-i18n'));
  for(const el of root.querySelectorAll('[data-i18n-attr]')){
    for(const pair of el.getAttribute('data-i18n-attr').split(';')){
      const [attr, key] = pair.split(':').map(s => s && s.trim());
      if(attr && key) el.setAttribute(attr, t(key));
    }
  }
}

// <select> options for a language picker: enabled languages by their own name (endonym), current one selected.
export function languageOptionsHtml(){
  return enabledLocales().map(l => `<option value="${escapeHtml(l.code)}" lang="${escapeHtml(l.html)}"${l.code === locale ? ' selected' : ''}>${escapeHtml(l.name)}</option>`).join('');
}
