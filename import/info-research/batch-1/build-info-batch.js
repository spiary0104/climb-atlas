// Builds records.ndjson for an info batch from the research files. Rules: flagged/not-found excluded (except listed website-only
// flags); hours only when all 7 days are stated; listed hour drops; source = the page that supports hours, else website.
const fs = require('fs');
const [,, researchDir, outFile, dropHoursCsv = '', excludeCsv = '', websiteOnlyFlagsCsv = ''] = process.argv;
const csv = s => new Set(s.split(',').filter(Boolean));
const dropHours = csv(dropHoursCsv), exclude = csv(excludeCsv), websiteOnlyFlags = csv(websiteOnlyFlagsCsv);
const files = (process.env.RESEARCH_FILES || 'research-au.json,research-nysf.json,research-la.json').split(',');
const all = files.flatMap(f => JSON.parse(fs.readFileSync(researchDir + '/' + f, 'utf8')));
const lines = [], skipped = [], websiteOnly = [];
for (const r of all) {
  if (exclude.has(r.id) || !r.website || (r.status === 'flag' && !websiteOnlyFlags.has(r.id)) || r.status === 'not-found') { skipped.push(r.id + ' ' + r.name + ' (' + r.status + ')'); continue; }
  const set = { website: r.website };
  const full = r.hours && Object.keys(r.hours).length === 7 && !dropHours.has(r.id) && r.status !== 'flag';
  if (full) set.hours = Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(d => [d, r.hours[d]]));
  else websiteOnly.push(r.id + ' ' + r.name);
  const src = (r.sources || []).find(s => (s.supports || []).includes(full ? 'hours' : 'website')) || r.sources[0];
  lines.push(JSON.stringify({ intent: 'update', id: r.id, expect_h: r.expect_h,
    reason: full ? 'Official website and weekly opening hours from the gym\'s own site (researched 2026-10-04)' : 'Official website from the gym\'s own site (researched 2026-10-04)',
    source: src.url, set }));
}
fs.writeFileSync(outFile, lines.join('\n') + '\n');
console.log(JSON.stringify({ records: lines.length, withHours: lines.length - websiteOnly.length, websiteOnly, skipped }, null, 1));
