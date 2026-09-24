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
const UPDATABLE = ['name', 'suburb', 'state', 'lat', 'lng', 'types', 'address', 'notes', 'photo'];
const UPDATE_KEYS = new Set(['id', 'intent', 'set', 'reason', 'source']);

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
  if (!isStr(rec.reason) || rec.reason.trim().length < 8) errors.push({ code: 'reason-required', field: 'reason', message: 'an update needs a reason (>= 8 chars) explaining why the existing data is being changed' });
  if (!rec.set || typeof rec.set !== 'object' || Array.isArray(rec.set) || !Object.keys(rec.set).length) errors.push({ code: 'empty-update', field: 'set', message: '"set" must be an object with at least one changed field' });
  else {
    for (const k of Object.keys(rec.set)) {
      if (!UPDATABLE.includes(k)) errors.push({ code: 'field-not-updatable', field: k, message: `"${k}" cannot be changed by an import (updatable: ${UPDATABLE.join(', ')}); country/id/status/community are not import-editable` });
      else checkField(k, rec.set[k], rec.set, d, errors);
    }
  }
  return { errors, warnings };
}

module.exports = { TYPES, UPDATABLE, RECORD_KEYS, validateNewRecord, validateUpdateRecord, deps };
