// Gym page: visitor info (migration 20261101000100: spots.visitor, info_source*) and the address actions (copy, Amap).
// Pure (no DOM, no appState). Everything here comes from the database: text is escaped, the source link goes through safeUrl.
// Visitor text is shown exactly as stored, never translated or invented; only the labels are interface text.
import { escapeHtml, safeUrl } from './html-safe.js';
import { formatDate, t, th } from './i18n.js';
import { icon } from './icons.js';
import { localLang } from './list-html.js';

// Display order. The first five are practical facts; `note` is free text that is never "missing".
export const VISITOR_FIELDS = [['booking', 'gym.visitor.booking'], ['payment', 'gym.visitor.payment'], ['english_help', 'gym.visitor.englishHelp'],
  ['id_required', 'gym.visitor.idRequired'], ['shoe_hire', 'gym.visitor.shoeHire'], ['note', 'gym.visitor.note']];
const FACTS = VISITOR_FIELDS.slice(0, 5).map(f => f[0]);

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const str = v => (typeof v === 'string' ? v.trim() : '');

// Present fields only (non-empty strings, known keys); null when none.
export function cleanVisitor(v){
  if(!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const out = {};
  for(const [k] of VISITOR_FIELDS){ const s = str(v[k]); if(s) out[k] = s; }
  return Object.keys(out).length ? out : null;
}

// "Source: official site, checked 1 Nov 2026" with the source name linked. The sentence comes from one translated string so
// each language keeps its own word order; the marker stands where the link goes. '' when the provenance is incomplete.
const MARK = '';
const SOURCE_KINDS = { 'official-site': 'gym.visitor.sourceSite', 'official-social': 'gym.visitor.sourceSocial' };
export function sourceLineHtml(g){
  const kindKey = SOURCE_KINDS[g.info_source_kind];
  const date = g.info_checked_on ? formatDate(g.info_checked_on, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : '';
  if(!kindKey || !date) return '';
  const href = safeUrl(g.info_source), kind = escapeHtml(t(kindKey));
  const link = href ? `<a class="link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${kind}</a>` : kind;
  return `<p class="section-note visitor-source">${escapeHtml(t('gym.visitor.source', { source: MARK, date })).replace(MARK, link)}</p>`;
}

export function visitorHtml(g){
  const v = cleanVisitor(g.visitor), lang = localLang(g);
  const head = `<section class="page-section visitor-info" aria-labelledby="visitorTitle"><h2 class="section-title" id="visitorTitle">${th('gym.visitorInfo')}</h2>`;
  // Nothing recorded (most gyms): one line naming what is unknown, not six "Not confirmed yet" rows.
  if(!v) return head + `<p class="section-note essentials-unknown">${th('gym.visitor.noneConfirmed')}</p></section>`;
  const rows = VISITOR_FIELDS.filter(([k]) => v[k]).map(([k, label]) => {
    // Free text: tag it with the local language only when it visibly is in that script.
    const attr = lang && CJK.test(v[k]) ? ` lang="${lang}"` : '';
    return `<div class="visitor-row"><dt class="visitor-label">${th(label)}</dt><dd${attr}>${escapeHtml(v[k])}</dd></div>`;
  });
  const partial = FACTS.some(k => !v[k]);
  return head + `<dl class="visitor-list">${rows.join('')}</dl>`
    + (partial ? `<p class="section-note essentials-unknown">${th('gym.visitor.otherUnconfirmed')}</p>` : '')
    + sourceLineHtml(g) + `</section>`;
}

// What "Copy address" copies: the local-script address when there is one (for a taxi driver), else the address.
export const copyableAddress = g => str(g && g.address_local) || str(g && g.address);

// Amap marker link. WGS-84 is what we store; Amap's marker URI documents `coordinate=wgs84` (GPS original coordinates, default
// is GCJ-02) so Amap does the datum shift itself and no conversion is needed here.
// Source: https://lbs.amap.com/api/uri-api/guide/mobile-web/point  (service https://uri.amap.com/marker)
// Only for China (Amap has no coverage elsewhere). The label is the local name, else the English one.
export function amapUrl(g){
  if(!g || g.country !== 'CN' || !Number.isFinite(g.lat) || !Number.isFinite(g.lng)) return '';
  const name = str(g.name_local) || str(g.name);
  return `https://uri.amap.com/marker?position=${g.lng.toFixed(6)},${g.lat.toFixed(6)}&name=${encodeURIComponent(name)}&coordinate=wgs84&src=bouldeer&callnative=0`;
}

export function addressActionsHtml(g){
  const copy = copyableAddress(g), amap = amapUrl(g);
  if(!copy && !amap) return '';
  return `<div class="address-actions">`
    + (copy ? `<button type="button" class="btn btn-secondary btn-sm" data-page-action="copy-address" data-spot-id="${escapeHtml(g.id)}">${th('gym.copyAddress')}</button>` : '')
    + (amap ? `<a class="btn btn-secondary btn-sm" href="${escapeHtml(amap)}" target="_blank" rel="noopener noreferrer">${icon('map-pin', {size:'sm'})}${th('gym.openAmap')}</a>` : '') + `</div>`;
}
