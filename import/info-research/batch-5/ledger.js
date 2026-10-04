// Ledger helper: node ledger.js <research-NN.json> '<json ops>'  ops: {drop:{id:[f]}, rm:{id:[k]}, why:{id:"..."}, retire:[{id,reason,source,reason_code?,duplicate_of?}], review:[{id,issue}], loc:true (collect wrong_pin/address_missing/mismatch), exclude:[ids], keep:[ids]}
const fs = require('fs'); const [,, rf, opsS] = process.argv; const ops = JSON.parse(opsS || '{}'); const R = JSON.parse(fs.readFileSync(rf, 'utf8'));
const C = JSON.parse(fs.readFileSync('corrections.json', 'utf8')), V = JSON.parse(fs.readFileSync('reviews.json', 'utf8'));
const ex = new Set(JSON.parse(fs.readFileSync('exclude.json', 'utf8'))), kp = new Set(JSON.parse(fs.readFileSync('keep.json', 'utf8')));
const nm = id => (R.find(x => x.id === id) || {}).name || id;
for (const [id, f] of Object.entries(ops.drop || {})) { C.drop[id] = [...new Set([...(C.drop[id] || []), ...f])]; C.reasons[id] = (ops.why || {})[id] || C.reasons[id]; }
for (const [id, k] of Object.entries(ops.rm || {})) { C.removeFacility[id] = [...new Set([...(C.removeFacility[id] || []), ...k])]; C.reasons[id] = (ops.why || {})[id] || C.reasons[id]; }
for (const r of ops.retire || []) { if (!V.retire.find(x => x.id === r.id)) V.retire.push({ name: nm(r.id), ...r }); ex.add(r.id); }
for (const r of ops.review || []) V.review.push({ name: nm(r.id), ...r });
(ops.exclude || []).forEach(i => ex.add(i)); (ops.keep || []).forEach(i => kp.add(i));
let nloc = 0; if (ops.loc) for (const r of R) if (['wrong_pin', 'address_missing', 'mismatch'].includes(r.location) && !V.location.find(x => x.id === r.id)) { V.location.push({ id: r.id, name: r.name, location: r.location, official_address: r.official_address, notes: (r.notes || '').slice(0, 300) }); nloc++; }
fs.writeFileSync('corrections.json', JSON.stringify(C, null, 1)); fs.writeFileSync('reviews.json', JSON.stringify(V, null, 1));
fs.writeFileSync('exclude.json', JSON.stringify([...ex])); fs.writeFileSync('keep.json', JSON.stringify([...kp]));
console.log('retire', V.retire.length, '| review', V.review.length, '| location', V.location.length, '(+' + nloc + ') | drops', Object.keys(C.drop).length, '| exclude', ex.size);
