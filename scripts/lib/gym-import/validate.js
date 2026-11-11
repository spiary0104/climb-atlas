// Deterministic, offline validation of batch records. No index, no network. Returns errors (record is rejected) and
// warnings (record is kept but flagged). Reuses the app's own safeUrl() and STATES_BY_COUNTRY so the pipeline and the
// site can never disagree about what is acceptable.
'use strict';
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const TYPES = ['indoor-bouldering', 'top-rope', 'lead-climbing'];   // tests/import-validate.test.js checks this against TYPE_LABELS
const ID_NEW = /^g-[0-9a-f]{10,40}$/;
const ID_LEGACY = /^(seed-\d+|community-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;   // ids of gyms that already exist in production
const ID_ANY = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/;
const LIMITS = { name: 200, suburb: 200, state: 100, address: 400, notes: 4000 };
// Fields a batch record may carry. Everything else (status, community=true, edited, submitted_by, created_at, ...) is
// decided by the importer, never by research data, so it is rejected instead of silently ignored.
const RECORD_KEYS = new Set(['id', 'intent', 'name', 'suburb', 'state', 'country', 'lat', 'lng', 'types', 'address', 'notes', 'photo', 'community', 'source', 'name_local', 'address_local']);
const UPDATABLE = ['name', 'suburb', 'state', 'lat', 'lng', 'types', 'address', 'notes', 'photo', 'website', 'hours', 'day_pass', 'facilities', 'name_local', 'address_local', 'visitor', 'info_source', 'info_source_kind', 'info_checked_on'];
// Gym-information fields (migration 20261004000100) plus `notes`. An "info update" only FILLS them on a gym that has none (updater.js enforces
// fill-only against production); it never carries any other field, so a record never mixes them with the location fields.
// website/hours/day_pass/facilities are not in the content hash; `notes` IS (normalize.js contentHash), so updater.js reads a notes fill's state from
// the hash of the row with notes removed (see stateOfInfo there). The index carries none of the five.
// Migration 20261101000100 adds name_local, address_local, visitor and the provenance trio info_source / info_source_kind / info_checked_on to the fill-only fields (also outside the
// content hash and the index). hours, day_pass and visitor must come with the full trio (provenanceProblems below); the trio itself is fill-only too (updater.js stateOfInfo).
const INFO_FIELDS = Object.freeze(['website', 'hours', 'day_pass', 'facilities', 'notes', 'name_local', 'address_local', 'visitor', 'info_source', 'info_source_kind', 'info_checked_on']);
const MIGRATION_LOCAL = '20261101000100';
const NEW_COLUMNS = Object.freeze(['name_local', 'address_local', 'visitor', 'info_source', 'info_source_kind', 'info_checked_on']);   // exist only once MIGRATION_LOCAL is applied
const PROVENANCE_FIELDS = Object.freeze(['info_source', 'info_source_kind', 'info_checked_on']);
const NEEDS_PROVENANCE = Object.freeze(['hours', 'day_pass', 'visitor']);
const INFO_SOURCE_KINDS = Object.freeze(['official-site', 'official-social']);
const VISITOR_KEYS = Object.freeze(['booking', 'payment', 'english_help', 'id_required', 'shoe_hire', 'note']);
const MIN_CHECKED_ON = '2020-01-01';   // = spots_info_source_check
const HOUR_DAYS = Object.freeze(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
// name_local / address_local / visitor_value / info_source = spots_name_local_check / spots_address_local_check / spots_visitor_check / spots_info_source_check (migration 20261101000100)
const INFO_LIMITS = Object.freeze({ website: 300, hour: 40, day_pass: 120, notes: 2000, name_local: 120, address_local: 300, visitor_value: 160, info_source: 400 });  // = spots_website_check / spots_hours_check / spots_day_pass_len_check and js/modules/gym-info.js LIMITS; notes 2000 = the text-length cap (migration 20261002000200)
// = spots_facilities_check and the keys of js/modules/gym-info.js FACILITIES, in that file's order: a record must list them in this
// canonical order, so the database value equals the record byte for byte (compared with deep equality, never as a set).
const FACILITY_KEYS = Object.freeze(['cafe', 'training', 'kids', 'shoe-hire', 'shop', 'showers', 'parking', 'yoga']);
const isInfoSet = set => !!set && typeof set === 'object' && !Array.isArray(set) && Object.keys(set).some(k => INFO_FIELDS.includes(k));
// Identity fields (an "identity update"): name, suburb and the type tags of an existing approved gym can be CORRECTED (replaced), never cleared. Unlike
// gym information they ARE part of the content hash and of the match index, so updater.js reads their state from the hash. A record never mixes
// them with location or information fields. `types` must be listed in TYPES order, so the database value equals the record byte for byte.
const IDENTITY_FIELDS = Object.freeze(['name', 'suburb', 'types']);
const isIdentitySet = set => !!set && typeof set === 'object' && !Array.isArray(set) && Object.keys(set).some(k => IDENTITY_FIELDS.includes(k));
const typesOutOfOrder = v => Array.isArray(v) && v.some((t, i) => t !== TYPES.filter(x => v.includes(x))[i]);
// Does `v` equal the gym's current value of `field`? (types: as a set, because the index stores them sorted and the content hash ignores their order)
const sameIdentityValue = (field, v, cur) => (field === 'types' ? JSON.stringify([...(v || [])].sort()) === JSON.stringify([...(cur || [])].sort()) : v === cur);
const UPDATE_KEYS = new Set(['id', 'intent', 'set', 'reason', 'source', 'expect_h']);
// expect_h: the gym's content hash (index-store h) when the update was researched; the plan and the updater refuse the update
// if the gym no longer has exactly that content.
const EXPECT_H = /^[0-9a-f]{16}$/;
// A retire record ({"intent":"retire"}) marks an approved gym closed / a confirmed duplicate / no longer supported by evidence (insufficient-evidence: e.g. a bouldering offer that a re-check could not confirm): updater.js sets status 'rejected' and
// rejection_reason (the moderator UI's own decision format); the row is kept, never deleted.
const RETIRE_KEYS = new Set(['id', 'intent', 'expect_h', 'reason_code', 'reason', 'source', 'duplicate_of']);
const REASON_CODES = ['closed', 'duplicate', 'insufficient-evidence', 'not-public'];   // not-public: kids-only / members-only / appointment-only (owner decision 2026-11-11)
const REASON_MIN = 8, REASON_MAX = 200;   // spots_rejection_reason_check allows 200; moderation.js rejectSpot slices to 200

// ---- sources of information fills --------------------------------------------------------------------------------------------------------------
// An info fill is sourced from the gym's own website or, with info_source_kind 'official-social', from a profile/post the gym itself controls. Maps, directories and review
// sites are never a source. The lists are explicit on purpose: official-social needs a host from SOCIAL_HOSTS; official-site accepts any host that is not denied or social.
const INFO_DENY_HOSTS = Object.freeze(['amap.com', 'gaode.com', 'autonavi.com', 'dianping.com', 'meituan.com', 'baidu.com', 'map.qq.com', 'openstreetmap.org', 'osm.org', 'mapcarta.com', 'wikimapia.org',
  'maps.apple.com', 'maps.google.com', 'maps.app.goo.gl', 'goo.gl', 'g.page', 'bing.com', 'here.com', 'tripadvisor.com', 'yelp.com', 'foursquare.com', 'mafengwo.cn', 'ctrip.com', 'trip.com', 'wikipedia.org']);
const SOCIAL_HOSTS = Object.freeze(['xiaohongshu.com', 'xhslink.com', 'weixin.qq.com', 'weibo.com', 'weibo.cn', 'douyin.com', 'tiktok.com', 'bilibili.com', 'instagram.com', 'facebook.com', 'fb.com', 'x.com',
  'twitter.com', 'youtube.com', 'youtu.be', 'threads.net', 'line.me']);
const hostIn = (host, list) => list.some(d => host === d || host.endsWith('.' + d));
const deniedUrl = u => hostIn(u.hostname, INFO_DENY_HOSTS) || (/(^|\.)google\.[a-z.]+$/.test(u.hostname) && /^\/maps\b/.test(u.pathname));
const urlsIn = text => (String(text).match(/https?:\/\/[^\s)]+/gi) || []).map(u => { try { return new URL(u); } catch (e) { return null; } }).filter(Boolean);
const httpsUrl = v => { if (!/^https:\/\/\S+$/.test(String(v))) return null; try { const u = new URL(v); return !u.username && !u.password ? u : null; } catch (e) { return null; } };
const cpLen = v => [...v].length;   // the database counts characters (code points), not UTF-16 units
const CTRL_DB = /[\u0000-\u001f\u007f-\u009f]/;   // Postgres [[:cntrl:]]: includes tab and line breaks
const isRealDate = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); if (!m) return false; const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]; };

// Set-level rules of an info "set" that span fields: the provenance trio is all or none, hours / day_pass / visitor need it, a trio alone is meaningless, and its URL must be an
// official source. `source` = the record's own source text; undefined at the write gate (target.js), which only sees the set. Returns [{code, field, message}].
function provenanceProblems(set, source) {
  const out = [], has = k => set[k] !== undefined, err = (code, field, message) => out.push({ code, field, message });
  const trio = PROVENANCE_FIELDS.filter(has), needs = NEEDS_PROVENANCE.filter(has);
  if (trio.length && trio.length < PROVENANCE_FIELDS.length) err('provenance-incomplete', PROVENANCE_FIELDS.find(k => !has(k)), `${PROVENANCE_FIELDS.join(' + ')} are set together or not at all (missing ${PROVENANCE_FIELDS.filter(k => !has(k)).join(', ')})`);
  if (needs.length && !trio.length) err('provenance-required', needs[0], `${needs.join(' / ')} must come with ${PROVENANCE_FIELDS.join(' + ')} (kind official-site or official-social, the source URL and the date it was read)`);
  if (trio.length && !needs.length) err('provenance-orphan', trio[0], `${PROVENANCE_FIELDS.join(' + ')} say where ${NEEDS_PROVENANCE.join(' / ')} came from; they cannot be set without one of those fields`);
  if (trio.length === PROVENANCE_FIELDS.length) {
    const u = httpsUrl(set.info_source);
    if (u && deniedUrl(u)) err('bad-info-source', 'info_source', `info_source ${u.hostname} is a map / directory / review site; information comes from the gym's own site or its official social account only`);
    else if (u && INFO_SOURCE_KINDS.includes(set.info_source_kind)) {
      const social = hostIn(u.hostname, SOCIAL_HOSTS);
      if (set.info_source_kind === 'official-social' && !social) err('bad-info-source', 'info_source', `info_source_kind official-social needs a social profile/post URL (${SOCIAL_HOSTS.join(', ')}); ${u.hostname} is not one (use official-site for the gym's own website)`);
      if (set.info_source_kind === 'official-site' && social) err('bad-info-source', 'info_source_kind', `${u.hostname} is a social platform: use info_source_kind official-social`);
    }
    if (source !== undefined && u && source !== set.info_source) err('source-mismatch', 'source', 'source must be exactly the info_source URL (the official page the facts were read from)');
  }
  return out;
}

let _deps = null;
async function deps() {
  if (_deps) return _deps;
  const regions = await import(pathToFileURL(path.join(ROOT, 'js', 'modules', 'regions.js')).href);
  const safe = await import(pathToFileURL(path.join(ROOT, 'js', 'modules', 'html-safe.js')).href);
  _deps = { STATES: regions.STATES_BY_COUNTRY, safeUrl: safe.safeUrl };
  return _deps;
}

const CTRL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;   // tab/newline are tolerated in notes only
const isStr = v => typeof v === 'string';

// Validate one field value; pushes {code, field, message} onto `out`. `full` = the whole record when known (state depends on country).
function checkField(field, v, full, d, out) {
  const err = (code, message) => out.push({ code, field, message });
  switch (field) {
    case 'name': case 'suburb': case 'state': {
      if (!isStr(v) || !v.trim()) return err('required', `${field} is required (non-empty text)`);
      if (v.length > LIMITS[field]) err('too-long', `${field} is ${v.length} chars (max ${LIMITS[field]})`);
      if (CTRL.test(v) || /[\r\n\t]/.test(v)) err('control-chars', `${field} contains control characters or line breaks`);
      if (v !== v.trim()) err('untrimmed', `${field} has leading/trailing whitespace`);
      break;
    }
    case 'country': {
      if (!isStr(v) || !/^[A-Z]{2}$/.test(v)) err('bad-country', `country must be a 2-letter upper-case code (got ${JSON.stringify(v)})`);
      break;
    }
    case 'lat': case 'lng': {
      if (typeof v !== 'number' || !Number.isFinite(v)) return err('bad-coordinate', `${field} must be a JSON number (got ${JSON.stringify(v)}; numeric strings are not accepted)`);
      const max = field === 'lat' ? 90 : 180;
      if (Math.abs(v) > max) err('bad-coordinate', `${field} ${v} is outside -${max}..${max}`);
      break;
    }
    case 'types': {
      if (!Array.isArray(v) || !v.length) return err('bad-types', 'types must be a non-empty array');
      const bad = v.filter(t => !TYPES.includes(t));
      if (bad.length) err('bad-types', `unknown type(s) ${JSON.stringify(bad)}; allowed: ${TYPES.join(', ')}`);
      if (new Set(v).size !== v.length) err('bad-types', 'types contains duplicates');
      break;
    }
    case 'address': case 'notes': {
      if (v === null || v === undefined || v === '') break;
      if (!isStr(v)) return err('bad-text', `${field} must be text or null`);
      if (v.length > LIMITS[field]) err('too-long', `${field} is ${v.length} chars (max ${LIMITS[field]})`);
      if (CTRL.test(v)) err('control-chars', `${field} contains control characters`);
      break;
    }
    case 'photo': {
      if (v === null || v === undefined || v === '') break;
      if (!isStr(v) || !d.safeUrl(v)) err('unsafe-photo', 'photo must be a plain http(s) URL (javascript:, data:, relative and credentialed URLs are rejected)');
      break;
    }
    case 'website': {
      if (!isStr(v)) return err('bad-website', 'website must be text (an http(s) URL)');
      if (v.length > INFO_LIMITS.website) err('too-long', `website is ${v.length} chars (max ${INFO_LIMITS.website})`);
      let ok = /^https?:\/\/\S+$/.test(v);
      if (ok) { try { ok = ['http:', 'https:'].includes(new URL(v).protocol) && !!d.safeUrl(v); } catch (e) { ok = false; } }
      if (!ok) err('bad-website', 'website must be a plain http(s) URL without whitespace (javascript:, data:, relative and credentialed URLs are rejected)');
      break;
    }
    case 'hours': {
      if (!v || typeof v !== 'object' || Array.isArray(v)) return err('bad-hours', 'hours must be an object like {"mon":"6am-10pm"}');
      const keys = Object.keys(v);
      if (!keys.length) return err('bad-hours', 'hours must have at least one day');
      const unknown = keys.filter(k => !HOUR_DAYS.includes(k));
      if (unknown.length) err('bad-hours', `unknown day key(s) ${JSON.stringify(unknown)}; allowed: ${HOUR_DAYS.join(', ')}`);
      for (const k of keys.filter(k => HOUR_DAYS.includes(k))) {
        const t = v[k];
        if (!isStr(t) || !t.length || t.length > INFO_LIMITS.hour) err('bad-hours', `hours.${k} must be text of 1-${INFO_LIMITS.hour} characters`);
        else if (t !== t.trim() || CTRL.test(t) || /[\r\n\t]/.test(t)) err('bad-hours', `hours.${k} must be trimmed single-line text (the database value must equal the record exactly)`);
      }
      break;
    }
    case 'day_pass': {
      if (!isStr(v) || !v.length) return err('bad-day-pass', 'day_pass must be text of 1-' + INFO_LIMITS.day_pass + ' characters (the price as the gym states it)');
      if (v.length > INFO_LIMITS.day_pass) err('too-long', `day_pass is ${v.length} chars (max ${INFO_LIMITS.day_pass})`);
      if (v !== v.trim() || CTRL.test(v) || /[\r\n\t]/.test(v)) err('bad-day-pass', 'day_pass must be trimmed single-line text (the database value must equal the record exactly)');
      break;
    }
    case 'facilities': {
      if (!Array.isArray(v) || !v.length) return err('bad-facilities', `facilities must be a non-empty array of: ${FACILITY_KEYS.join(', ')}`);
      const bad = v.filter(k => !isStr(k) || !FACILITY_KEYS.includes(k));
      if (bad.length) return err('bad-facilities', `unknown facility ${JSON.stringify(bad)}; allowed: ${FACILITY_KEYS.join(', ')}`);
      if (new Set(v).size !== v.length) return err('bad-facilities', 'facilities contains duplicates');
      if (v.some((k, i) => k !== FACILITY_KEYS.filter(x => v.includes(x))[i])) err('bad-facilities', `facilities must be in the canonical order: ${FACILITY_KEYS.join(', ')}`);
      break;
    }
    default: break;
  }
}

// The notes of an info FILL: a non-empty, already trimmed, single-line sentence of at most 2000 characters (= the database cap), so the value in the database equals
// the record byte for byte. Unlike the notes of a new gym record (checkField: may be null, may hold newlines) it is never cleaned and never empty. It is shown publicly
// on the gym page (js/modules/provenance.js publicNotes hides research-style notes), so it must read as a visitor-facing sentence.
function checkNotesFill(v, out) {
  const err = (code, message) => out.push({ code, field: 'notes', message });
  if (!isStr(v) || !v.length) return err('bad-notes', 'notes must be non-empty text (a visitor-facing sentence); never null or empty');
  if (v.length > INFO_LIMITS.notes) err('too-long', `notes is ${v.length} chars (max ${INFO_LIMITS.notes})`);
  if (v !== v.trim()) err('untrimmed', 'notes has leading/trailing whitespace (the database value must equal the record exactly)');
  if (CTRL.test(v) || /[\r\n\t]/.test(v)) err('control-chars', 'notes must be single-line text without control characters, tabs or line breaks');
}
// name_local / address_local (new records: optional; info fills: required): trimmed text of 1-N characters without control characters (= spots_name_local_check / spots_address_local_check),
// so the database value equals the record byte for byte.
function checkLocalText(field, v, out) {
  const err = (code, message) => out.push({ code, field, message });
  if (!isStr(v) || !v.length) return err('bad-local-text', `${field} must be non-empty text (the gym's own ${field === 'name_local' ? 'name' : 'address'} in the local language); never null or empty`);
  if (cpLen(v) > INFO_LIMITS[field]) err('too-long', `${field} is ${cpLen(v)} chars (max ${INFO_LIMITS[field]})`);
  if (v !== v.trim()) err('untrimmed', `${field} has leading/trailing whitespace (the database value must equal the record exactly)`);
  if (CTRL_DB.test(v)) err('control-chars', `${field} contains control characters, tabs or line breaks`);
}
// visitor: an object whose only keys are VISITOR_KEYS and whose values are non-empty, trimmed, single-line strings of at most 160 characters (= spots_visitor_check).
function checkVisitor(v, out) {
  const err = (code, message) => out.push({ code, field: 'visitor', message });
  if (!v || typeof v !== 'object' || Array.isArray(v)) return err('bad-visitor', `visitor must be an object like {"booking":"..."} with keys from: ${VISITOR_KEYS.join(', ')}`);
  const keys = Object.keys(v);
  if (!keys.length) return err('bad-visitor', 'visitor must have at least one key');
  const unknown = keys.filter(k => !VISITOR_KEYS.includes(k));
  if (unknown.length) err('bad-visitor', `unknown visitor key(s) ${JSON.stringify(unknown)}; allowed: ${VISITOR_KEYS.join(', ')}`);
  for (const k of keys.filter(k => VISITOR_KEYS.includes(k))) {
    const t = v[k];
    if (!isStr(t) || !t.length || cpLen(t) > INFO_LIMITS.visitor_value) err('bad-visitor', `visitor.${k} must be text of 1-${INFO_LIMITS.visitor_value} characters`);
    else if (t !== t.trim() || CTRL_DB.test(t)) err('bad-visitor', `visitor.${k} must be trimmed single-line text without control characters`);
  }
}
// info_source / info_source_kind / info_checked_on values (= spots_info_source_check); that the URL is an official one is provenanceProblems' job.
function checkProvenanceValue(field, v, out) {
  const err = (code, message) => out.push({ code, field, message });
  if (field === 'info_source') {
    if (!isStr(v) || !httpsUrl(v)) err('bad-info-source', 'info_source must be a plain https URL without whitespace or credentials');
    else if (v.length > INFO_LIMITS.info_source) err('too-long', `info_source is ${v.length} chars (max ${INFO_LIMITS.info_source})`);
  } else if (field === 'info_source_kind') {
    if (!INFO_SOURCE_KINDS.includes(v)) err('bad-info-source-kind', `info_source_kind must be one of ${INFO_SOURCE_KINDS.join(', ')} (maps, directories and other kinds are not accepted for gym information)`);
  } else if (!isStr(v) || !isRealDate(v)) err('bad-info-date', 'info_checked_on must be a real date, YYYY-MM-DD');
  else if (v < MIN_CHECKED_ON) err('bad-info-date', `info_checked_on ${v} is before ${MIN_CHECKED_ON}`);
  else if (v > new Date().toISOString().slice(0, 10)) err('bad-info-date', `info_checked_on ${v} is in the future`);
}
// Field check inside an UPDATE record's "set": same as checkField, except `notes` (always an info fill there) is held to checkNotesFill.
const checkUpdateField = (field, v, full, d, out) => {
  if (field === 'notes') return checkNotesFill(v, out);
  if (field === 'name_local' || field === 'address_local') return checkLocalText(field, v, out);
  if (field === 'visitor') return checkVisitor(v, out);
  if (PROVENANCE_FIELDS.includes(field)) return checkProvenanceValue(field, v, out);
  return checkField(field, v, full, d, out);
};

// Validate a "new gym" record (intent omitted or "new").
async function validateNewRecord(rec) {
  const d = await deps(), errors = [], warnings = [];
  for (const k of Object.keys(rec)) if (!RECORD_KEYS.has(k)) errors.push({ code: 'unknown-field', field: k, message: `unknown field "${k}" (allowed: ${[...RECORD_KEYS].join(', ')})` });
  if (rec.community !== undefined && rec.community !== false) errors.push({ code: 'forbidden-value', field: 'community', message: 'community may only be false/absent in an import batch' });
  if (rec.intent !== undefined && rec.intent !== 'new') errors.push({ code: 'bad-intent', field: 'intent', message: 'intent must be "new" (or omitted) for a full record' });
  if (rec.id !== undefined) {
    if (!isStr(rec.id) || !(ID_NEW.test(rec.id) || ID_LEGACY.test(rec.id))) errors.push({ code: 'bad-id', field: 'id', message: 'id must be g-<10-40 hex> (generated by `freeze-ids`), or the id of a gym that already exists (seed-N / community-<uuid>)' });
  }
  for (const f of ['name', 'suburb', 'state', 'country', 'lat', 'lng', 'types']) checkField(f, rec[f], rec, d, errors);
  for (const f of ['address', 'notes', 'photo']) checkField(f, rec[f], rec, d, errors);
  for (const f of ['name_local', 'address_local']) if (rec[f] !== undefined && rec[f] !== null && rec[f] !== '') checkLocalText(f, rec[f], errors);   // optional on a new gym; written to the inserted row, not part of the content hash
  if (rec.source !== undefined && !isStr(rec.source)) errors.push({ code: 'bad-text', field: 'source', message: 'source must be text' });
  if (!errors.some(e => e.field === 'lat' || e.field === 'lng') && rec.lat === 0 && rec.lng === 0) errors.push({ code: 'bad-coordinate', field: 'lat', message: 'coordinates are 0,0 (null island) -- geocoding placeholder?' });
  if (isStr(rec.country) && /^[A-Z]{2}$/.test(rec.country) && isStr(rec.state)) {
    const list = d.STATES[rec.country];
    if (!list) warnings.push({ code: 'unsupported-country', field: 'country', message: `country ${rec.country} has no entry in js/modules/regions.js STATES_BY_COUNTRY; the app needs country support (constants.js, regions.js, css/chips.css) before these gyms show correctly` });
    else if (!list.some(([code]) => code === rec.state)) errors.push({ code: 'bad-state', field: 'state', message: `state ${JSON.stringify(rec.state)} is not a known ${rec.country} region code (js/modules/regions.js)` });
  }
  if (isStr(rec.address) && rec.address && !rec.address.trim()) warnings.push({ code: 'blank-address', field: 'address', message: 'address is only whitespace' });
  if (Number.isFinite(rec.lat) && Number.isFinite(rec.lng) && (String(rec.lat).split('.')[1] || '').length < 3 && (String(rec.lng).split('.')[1] || '').length < 3) warnings.push({ code: 'coarse-coordinate', field: 'lat', message: 'coordinates have fewer than 3 decimals (>100 m precision loss) -- probably a city centre, not the gym' });
  return { errors, warnings };
}

// Validate an "update existing gym" record: { intent:"update", id, set:{...changed fields...}, reason }.
async function validateUpdateRecord(rec) {
  const d = await deps(), errors = [], warnings = [];
  for (const k of Object.keys(rec)) if (!UPDATE_KEYS.has(k)) errors.push({ code: 'unknown-field', field: k, message: `unknown field "${k}" in an update record (allowed: ${[...UPDATE_KEYS].join(', ')}); put changed fields under "set"` });
  if (!isStr(rec.id) || !ID_ANY.test(rec.id)) errors.push({ code: 'bad-id', field: 'id', message: 'an update must name the existing gym id' });
  if (rec.expect_h !== undefined && (!isStr(rec.expect_h) || !EXPECT_H.test(rec.expect_h))) errors.push({ code: 'bad-expect-h', field: 'expect_h', message: 'expect_h must be the 16-hex content hash of the gym when the update was researched' });
  if (!isStr(rec.reason) || rec.reason.trim().length < 8) errors.push({ code: 'reason-required', field: 'reason', message: 'an update needs a reason (>= 8 chars) explaining why the existing data is being changed' });
  if (!rec.set || typeof rec.set !== 'object' || Array.isArray(rec.set) || !Object.keys(rec.set).length) errors.push({ code: 'empty-update', field: 'set', message: '"set" must be an object with at least one changed field' });
  else {
    const nonInfo = Object.keys(rec.set).filter(k => !INFO_FIELDS.includes(k));
    if (isInfoSet(rec.set) && nonInfo.length) errors.push({ code: 'mixed-families', field: 'set', message: `an info update (${INFO_FIELDS.join('/')}) cannot also change ${nonInfo.join(', ')}; one record per gym, so put the other change in a separate batch` });
    else if (isIdentitySet(rec.set) && Object.keys(rec.set).some(k => !IDENTITY_FIELDS.includes(k))) errors.push({ code: 'mixed-families', field: 'set', message: `an identity update (${IDENTITY_FIELDS.join('/')}) cannot also change ${Object.keys(rec.set).filter(k => !IDENTITY_FIELDS.includes(k)).join(', ')}; one record per gym, so put the other change in a separate batch` });
    if (isInfoSet(rec.set) && !nonInfo.length) {
      errors.push(...provenanceProblems(rec.set, isStr(rec.source) ? rec.source.trim() : ''));
      // any URL in an information fill's source must not be a map / directory / review site (older records give a URL plus a note; the text is not parsed further)
      const bad = isStr(rec.source) ? [...new Set(rec.source.match(/https?:\/\/[^\s)]+/gi) || [])].filter(x => { try { return deniedUrl(new URL(x)); } catch (e) { return false; } }) : [];
      if (bad.length) errors.push({ code: 'bad-source', field: 'source', message: `source ${bad[0]} is a map / directory / review site; gym information comes from the gym's own site or its official social account` });
    }
    if (typesOutOfOrder(rec.set.types)) errors.push({ code: 'bad-types', field: 'types', message: `types must be listed in the canonical order: ${TYPES.join(', ')}` });
    for (const k of Object.keys(rec.set)) {
      if (!UPDATABLE.includes(k)) errors.push({ code: 'field-not-updatable', field: k, message: `"${k}" cannot be changed by an import (updatable: ${UPDATABLE.join(', ')}); country/id/status/community are not import-editable` });
      else checkUpdateField(k, rec.set[k], rec.set, d, errors);
    }
  }
  return { errors, warnings };
}

// "website example.com + hours mon,tue,sat + day pass + facilities (3)" -- what an info update fills, for reports (a review needs the host and the days, not the data).
function describeInfoSet(set) {
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return '?'; } };
  return [set.website !== undefined && `website ${host(set.website)}`, set.hours && typeof set.hours === 'object' && `hours ${HOUR_DAYS.filter(k => k in set.hours).join(',')}`,
    set.day_pass !== undefined && 'day pass', Array.isArray(set.facilities) && `facilities (${set.facilities.length})`,
    typeof set.name_local === 'string' && 'name_local', typeof set.address_local === 'string' && 'address_local', set.visitor && typeof set.visitor === 'object' && `visitor ${VISITOR_KEYS.filter(k => k in set.visitor).join(',')}`,
    typeof set.info_source_kind === 'string' && `source ${set.info_source_kind} ${host(set.info_source)} ${set.info_checked_on}`,
    typeof set.notes === 'string' && `notes "${set.notes.length > 140 ? set.notes.slice(0, 137) + '...' : set.notes}"`].filter(Boolean).join(' + ');
}

// Problems (plain strings) of an info "set" ({website?, hours?, day_pass?, facilities?}): the same field rules as the record validator, reused by the write
// gate in target.js so a hand-built payload can never carry a value the validator would have refused.
async function infoSetProblems(set) {
  if (!set || typeof set !== 'object' || Array.isArray(set) || !Object.keys(set).length) return [`"set" must list gym-information fields (${INFO_FIELDS.join(', ')})`];
  const d = await deps(), errs = [];
  for (const k of Object.keys(set)) { if (INFO_FIELDS.includes(k)) checkUpdateField(k, set[k], set, d, errs); else errs.push({ message: `${k} is not a gym-information field` }); }
  errs.push(...provenanceProblems(set));
  return errs.map(e => e.message);
}

// Problems (plain strings) of an identity "set" ({name?, suburb?, types?}): the record validator's field rules plus the canonical types order, reused by the
// write gate in target.js so a hand-built payload can never carry a value the validator would have refused.
async function identitySetProblems(set) {
  if (!set || typeof set !== 'object' || Array.isArray(set) || !Object.keys(set).length) return ['"set" must list name, suburb and/or types'];
  const d = await deps(), errs = [];
  for (const k of Object.keys(set)) { if (IDENTITY_FIELDS.includes(k)) checkField(k, set[k], set, d, errs); else errs.push({ message: `${k} is not an identity field` }); }
  if (typesOutOfOrder(set.types)) errs.push({ message: `types must be listed in the canonical order: ${TYPES.join(', ')}` });
  return errs.map(e => e.message);
}

// Validate a "retire existing gym" record:
// { intent:"retire", id, expect_h, reason_code:"closed"|"duplicate"|"insufficient-evidence", reason, source, duplicate_of? (required iff duplicate) }.
async function validateRetireRecord(rec) {
  const errors = [], warnings = [];
  const err = (code, field, message) => errors.push({ code, field, message });
  for (const k of Object.keys(rec)) if (!RETIRE_KEYS.has(k)) err('unknown-field', k, `unknown field "${k}" in a retire record (allowed: ${[...RETIRE_KEYS].join(', ')})`);
  if (rec.intent !== 'retire') err('bad-intent', 'intent', 'intent must be "retire"');
  if (!isStr(rec.id) || !ID_ANY.test(rec.id)) err('bad-id', 'id', 'a retire record must name the existing gym id');
  if (!isStr(rec.expect_h) || !EXPECT_H.test(rec.expect_h)) err('bad-expect-h', 'expect_h', 'expect_h is required: the 16-hex content hash of the gym when it was researched');
  if (!REASON_CODES.includes(rec.reason_code)) err('bad-reason-code', 'reason_code', `reason_code must be one of ${REASON_CODES.join(', ')}`);
  if (!isStr(rec.reason) || rec.reason.length < REASON_MIN || rec.reason.length > REASON_MAX || rec.reason !== rec.reason.trim() || CTRL.test(rec.reason) || /[\r\n\t]/.test(rec.reason)) err('bad-reason', 'reason', `reason is required: ${REASON_MIN}-${REASON_MAX} characters of plain trimmed text on one line (it becomes the rejection_reason shown to moderators)`);
  if (!isStr(rec.source) || !rec.source.trim() || rec.source.length > 400) err('bad-source', 'source', 'source (where the evidence is) is required, max 400 chars');
  if (rec.reason_code === 'duplicate') {
    if (!isStr(rec.duplicate_of) || !ID_ANY.test(rec.duplicate_of)) err('duplicate-of-required', 'duplicate_of', 'a duplicate needs duplicate_of: the id of the gym that stays');
    else if (rec.duplicate_of === rec.id) err('bad-duplicate-of', 'duplicate_of', 'duplicate_of cannot be the retired gym itself');
  } else if (rec.duplicate_of !== undefined) err('duplicate-of-forbidden', 'duplicate_of', 'duplicate_of is only allowed with reason_code "duplicate"');
  return { errors, warnings };
}

module.exports = { MIGRATION_LOCAL, NEW_COLUMNS, PROVENANCE_FIELDS, NEEDS_PROVENANCE, INFO_SOURCE_KINDS, VISITOR_KEYS, MIN_CHECKED_ON, provenanceProblems, TYPES, UPDATABLE, INFO_FIELDS, IDENTITY_FIELDS, isIdentitySet, typesOutOfOrder, sameIdentityValue, identitySetProblems, HOUR_DAYS, INFO_LIMITS, FACILITY_KEYS, isInfoSet, infoSetProblems, describeInfoSet, RECORD_KEYS, EXPECT_H, REASON_CODES, validateNewRecord, validateUpdateRecord, validateRetireRecord, deps };
