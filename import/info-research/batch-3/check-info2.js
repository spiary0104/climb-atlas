// Mechanical check of a v2 research file against its targets: order/ids/hashes, field formats, evidence per field.
const fs = require('fs'); const [,, tf, rf] = process.argv;
const T = JSON.parse(fs.readFileSync(tf, 'utf8')), R = JSON.parse(fs.readFileSync(rf, 'utf8'));
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], FAC = ['cafe', 'training', 'kids', 'shoe-hire', 'shop', 'showers', 'parking', 'yoga'];
const t1 = '[0-9]{1,2}(:[0-9]{2})?(am|pm)', range = `${t1}–${t1}`;
const re = new RegExp(`^(Closed|24 hours|${range}(, ${range})*)$`);
const errs = [], st = {}, fields = { website: 0, hours: 0, hours7: 0, day_pass: 0, facilities: 0 };
if (R.length !== T.length) errs.push('count ' + R.length + ' vs ' + T.length);
T.forEach((t, i) => {
  const r = R[i] || {}; if (r.id !== t.id || r.expect_h !== t.expect_h) errs.push('order/id/hash ' + i + ' ' + t.id);
  st[r.status] = (st[r.status] || 0) + 1;
  const sup = new Set((r.sources || []).flatMap(s => s.supports || []));
  if (r.website != null) { fields.website++; if (!/^https?:\/\/\S+$/.test(r.website) || r.website.length > 300) errs.push('website ' + t.id); try { new URL(r.website); } catch { errs.push('url ' + t.id); } if (!sup.has('website')) errs.push('no source website ' + t.id); }
  if (r.hours != null) { fields.hours++; const ks = Object.keys(r.hours); if (ks.length === 7) fields.hours7++;
    if (!ks.length || ks.some(k => !DAYS.includes(k))) errs.push('hours keys ' + t.id);
    for (const [k, v] of Object.entries(r.hours)) if (typeof v !== 'string' || v !== v.trim() || !v || v.length > 40) errs.push('hours val ' + t.id + ' ' + k); else if (!re.test(v)) errs.push('format ' + t.id + ' ' + k + '=' + v);
    if (!sup.has('hours')) errs.push('no source hours ' + t.id); }
  if (r.day_pass != null) { fields.day_pass++; const v = r.day_pass;
    if (typeof v !== 'string' || !v || v !== v.trim() || v.length > 120 || /[\r\n\t]/.test(v)) errs.push('day_pass ' + t.id);
    else if (!/(CHF|€|EUR|£|GBP|C\$|CAD|\$)/.test(v)) errs.push('day_pass currency ' + t.id + ' ' + v);
    if (!sup.has('day_pass')) errs.push('no source day_pass ' + t.id); }
  if (r.facilities != null) { fields.facilities++; const v = r.facilities;
    if (!Array.isArray(v) || !v.length || v.some(k => !FAC.includes(k)) || new Set(v).size !== v.length) errs.push('facilities ' + t.id + ' ' + JSON.stringify(v));
    if (!sup.has('facilities')) errs.push('no source facilities ' + t.id); }
});
console.log(JSON.stringify({ status: st, fields, errors: errs }));
