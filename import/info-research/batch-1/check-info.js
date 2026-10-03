const fs=require('fs');const [,,tf,rf]=process.argv;const T=JSON.parse(fs.readFileSync(tf,'utf8'));const R=JSON.parse(fs.readFileSync(rf,'utf8'));
const DAYS=['mon','tue','wed','thu','fri','sat','sun'];const re=/^(Closed|24 hours|(\d{1,2}(:\d{2})?(am|pm)–\d{1,2}(:\d{2})?(am|pm))(, \d{1,2}(:\d{2})?(am|pm)–\d{1,2}(:\d{2})?(am|pm))*)$/;
const errs=[];const st={};
if(R.length!==T.length) errs.push('count '+R.length+' vs '+T.length);
T.forEach((t,i)=>{const r=R[i]||{};if(r.id!==t.id||r.expect_h!==t.expect_h) errs.push('order/id/hash '+i+' '+t.id);
 st[r.status]=(st[r.status]||0)+1;
 if(r.website!=null){ if(!/^https?:\/\/\S+$/.test(r.website)||r.website.length>300) errs.push('website '+t.id+' '+r.website); try{new URL(r.website)}catch{errs.push('url '+t.id)} }
 if(r.hours!=null){const ks=Object.keys(r.hours); if(!ks.length||ks.some(k=>!DAYS.includes(k))) errs.push('hours keys '+t.id); for(const [k,v] of Object.entries(r.hours)){ if(typeof v!=='string'||v!==v.trim()||!v||v.length>40) errs.push('hours val '+t.id+' '+k); else if(!re.test(v)) errs.push('format '+t.id+' '+k+'='+v);} }
 const sup=new Set((r.sources||[]).flatMap(s=>s.supports||[])); if(r.website&&!sup.has('website')) errs.push('no source website '+t.id); if(r.hours&&!sup.has('hours')) errs.push('no source hours '+t.id);
});
const hosts={};R.forEach(r=>{if(r.website){const h=new URL(r.website).href;(hosts[h]=hosts[h]||[]).push(r.id)}});
const dup=Object.entries(hosts).filter(([,v])=>v.length>1);
console.log(JSON.stringify({status:st,errors:errs,sharedWebsites:dup},null,0));
