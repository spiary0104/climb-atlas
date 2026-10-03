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
const RECORD_KEYS = new Set(['id', 'intent', 'name', 'suburb', 'state', 'country', 'lat', 'lng', 'types', 'address', 'notes', 'photo', 'community', 'source']);
const UPDATABLE = ['name', 'suburb', 'state', 'lat', 'lng', 'types', 'address', 'notes', 'photo', 'website', 'hours'];
// Gym-information fields (migration 20261004000100). An "info update" only FILLS them on a gym that has none (updater.js enforces
// fill-only against production); it never carries any other field, so a record never mixes them with the location fields.
const INFO_FIELDS = Object.freeze(['website', 'hours']);
const HOUR_DAYS = Object.freeze(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
const INFO_LIMITS = Object.freeze({ website: 300, hour: 40 });   // = spots_website_check / spots_hours_check and js/modules/gym-info.js LIMITS
const isInfoSet = set => !!set && typeof set === 'object' && !Array.isArray(set) && Object.keys(set).some(k => INFO_FIELDS.includes(k));
const UPDATE_KEYS = new Set(['id', 'intent', 'set', 'reason', 'source', 'expect_h']);
// expect_h: the gym's content hash (index-store h) when the update was researched; the plan and the updater refuse the update
// if the gym no longer has exactly that content.
const EXPECT_H = /^[0-9a-f]{16}$/;
// A retire record ({"intent":"retire"}) marks an approved gym closed / a confirmed duplicate: updater.js sets status 'rejected' and
// rejection_reason (the moderator UI's own decision format); the row is kept, never deleted.
const RETIRE_KEYS = new Set(['id', 'intent', 'expect_h', 'reason_code', 'reason', 'source', 'duplicate_of']);
const REASON_CODES = ['closed', 'duplicate'];
const REASON_MIN = 8, REASON_MAX = 200;   // spots_rejection_reason_check allows 200; moderation.js rejectSpot slices to 200

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
    default: break;
  }
}

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
    for (const k of Object.keys(rec.set)) {
      if (!UPDATABLE.includes(k)) errors.push({ code: 'field-not-updatable', field: k, message: `"${k}" cannot be changed by an import (updatable: ${UPDATABLE.join(', ')}); country/id/status/community are not import-editable` });
      else checkField(k, rec.set[k], rec.set, d, errors);
    }
  }
  return { errors, warnings };
}

// "website example.com + hours mon,tue,sat" -- what an info update fills, for reports (a review needs the host and the days, not the data).
function describeInfoSet(set) {
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return '?'; } };
  return [set.website !== undefined && `website ${host(set.website)}`, set.hours && typeof set.hours === 'object' && `hours ${HOUR_DAYS.filter(k => k in set.hours).join(',')}`].filter(Boolean).join(' + ');
}

// Problems (plain strings) of an info "set" ({website?, hours?}): the same field rules as the record validator, reused by the write
// gate in target.js so a hand-built payload can never carry a value the validator would have refused.
async function infoSetProblems(set) {
  if (!set || typeof set !== 'object' || Array.isArray(set) || !Object.keys(set).length) return ['"set" must list website and/or hours'];
  const d = await deps(), errs = [];
  for (const k of Object.keys(set)) { if (INFO_FIELDS.includes(k)) checkField(k, set[k], set, d, errs); else errs.push({ message: `${k} is not a gym-information field` }); }
  return errs.map(e => e.message);
}

// Validate a "retire existing gym" record:
// { intent:"retire", id, expect_h, reason_code:"closed"|"duplicate", reason, source, duplicate_of? (required iff duplicate) }.
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

module.exports = { TYPES, UPDATABLE, INFO_FIELDS, HOUR_DAYS, INFO_LIMITS, isInfoSet, infoSetProblems, describeInfoSet, RECORD_KEYS, EXPECT_H, REASON_CODES, validateNewRecord, validateUpdateRecord, validateRetireRecord, deps };
