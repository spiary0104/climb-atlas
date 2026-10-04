// Builds records.ndjson for a gym-information fill batch from v2 research files (website, hours, day_pass, facilities).
// Rules: flag / not-found gyms are excluded unless listed in KEEP; hours only when all 7 days are stated; facilities in the
// canonical order (js/modules/gym-info.js FACILITIES); per-gym field drops from DROP ({"id":["hours",...]}); EXCLUDE ids skipped.
// source = the page that supports the most fields set. Usage:
//   RESEARCH_FILES=a.json,b.json EXCLUDE=id1,id2 DROP='{"id":["day_pass"]}' node build-info-batch-v2.js <researchDir> <out.ndjson> <dateText>
const fs = require('fs');
const [,, dir, out, date = '2026-10-04'] = process.argv;
const files = (process.env.RESEARCH_FILES || '').split(',').filter(Boolean);
const IDS = process.env.IDS ? new Set(process.env.IDS.split(',')) : null;   // optional: only these gyms (to split into batches of <= 100)
const exclude = new Set((process.env.EXCLUDE || '').split(',').filter(Boolean));
const keep = new Set((process.env.KEEP || '').split(',').filter(Boolean));
// CORRECTIONS: a JSON file {drop:{id:[fields]}, removeFacility:{id:[keys]}} (the review ledger); DROP/EXCLUDE env still work.
const corr = process.env.CORRECTIONS ? JSON.parse(fs.readFileSync(process.env.CORRECTIONS, 'utf8')) : {};
const drop = { ...(corr.drop || {}), ...JSON.parse(process.env.DROP || '{}') };
const removeFac = corr.removeFacility || {};
const FAC = ['cafe', 'training', 'kids', 'shoe-hire', 'shop', 'showers', 'parking', 'yoga'], DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const all = files.flatMap(f => JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8')));
const lines = [], skipped = [], count = { website: 0, hours: 0, day_pass: 0, facilities: 0 }, partial = [];
for (const r of all.filter(r => !IDS || IDS.has(r.id))) {
  if (exclude.has(r.id) || ((r.status === 'flag' || r.status === 'not-found') && !keep.has(r.id)) || !r.website) { skipped.push(`${r.id} ${r.name} (${exclude.has(r.id) ? 'excluded' : r.status})`); continue; }
  const d = new Set(drop[r.id] || []), set = {};
  if (!d.has('website')) set.website = r.website;
  if (r.hours && Object.keys(r.hours).length === 7 && !d.has('hours')) set.hours = Object.fromEntries(DAYS.map(k => [k, r.hours[k]]));
  if (r.day_pass && !d.has('day_pass')) set.day_pass = r.day_pass;
  if (Array.isArray(r.facilities) && r.facilities.length && !d.has('facilities')) { const fac = FAC.filter(k => r.facilities.includes(k) && !(removeFac[r.id] || []).includes(k)); if (fac.length) set.facilities = fac; }
  const fields = Object.keys(set); if (!fields.length) { skipped.push(`${r.id} ${r.name} (nothing left)`); continue; }
  fields.forEach(f => count[f]++); if (fields.length < 4) partial.push(`${r.id} ${r.name}: ${fields.join('+')}`);
  const src = [...(r.sources || [])].sort((a, b) => fields.filter(f => (b.supports || []).includes(f)).length - fields.filter(f => (a.supports || []).includes(f)).length)[0];
  const names = { website: 'website', hours: 'weekly opening hours', day_pass: 'day-pass price', facilities: 'facilities' };
  lines.push(JSON.stringify({ intent: 'update', id: r.id, expect_h: r.expect_h,
    reason: `Official ${fields.map(f => names[f]).join(', ')} from the gym's own site (researched ${date})`.slice(0, 300), source: src.url, set }));
}
fs.writeFileSync(out, lines.join('\n') + '\n');
console.log(JSON.stringify({ records: lines.length, fields: count, partial, skipped }, null, 1));
