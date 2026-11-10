# Manual checks follow-up, 2026-11-11 (index)

Input: `manual-checks-2026-11-10.docx` (738 rows from the MANUAL-CHECK files) plus an outside ChatGPT research pass (32 rows,
unverified). Each file below now ends with `## Follow-up 2026-11-11 (public-source verification)`: one bullet per check with STATUS,
confidence, evidence, source URLs and the check date. Checked by Claude (AI) on public sources; every ChatGPT lead was re-fetched, not
copied. Append-only (no existing text changed). Nothing was written to production; no batch, review.json or record was touched.

## Counts (592 bullets in 40 files; a few bullets cover several gyms)
| Status | Bullets | Meaning |
|---|---:|---|
| RESOLVED | 42 | Answer settled by a gym-controlled or official source (eligible to add, keep out, same/different gym) |
| ALREADY RESOLVED | 26 | Settled by a later commit or section (cited in the bullet) |
| NEEDS HUMAN | 115 | Map/entrance inspection, a phone call, a signed-in social read or an owner decision |
| CONFLICTING | 7 | Sources disagree; kept open |
| DATE-GATED | 9 | Not open yet; recheck date in the bullet |
| OPEN | 393 | No sufficient evidence found (often: site undated, blocked, or Instagram/RedNote-only) |

Not covered in this pass (130 rows): all Korea files (9 sections + korea-holds + MANUAL-CHECKS-korea-2026-10-12) and the small
Europe files (Poland, Ukraine, Slovakia, Serbia, Czechia, Belarus, germany/france/italy holds, pin-check README).

## ChatGPT leads, reconciled
Confirmed against a primary source: AU-002 Mandurah (eligible), AU-012 Boulder Lab Heidelberg (date-gated, early 2027), CN-067 seed-713
Banana CapitaLand One (closed: the chain's own store data, `www.bananaclimbing.com/assets/index-B-4QZzpK.js`, sets `isClosed` for
`cs-capitaland`; re-fetched by the brain session), AU-020 Dynomite (active on dynomite.net.au; keep seed-25/26), CN-054 seed-711 (pin
already fixed in cn-pins-3). Not confirmed, kept OPEN: JP-001 Aladdin (directory only), NA-001 Délire Lévis (FQME event has no venue),
EU-001 Wattens (municipal page undated), AU-001 Flow (no dated own page), CN-013/043/049 Banana branches (pins still need a map look).
Kept CONFLICTING: CN-072 Yaoyan Shahe, AU-003 Camp Street, AU-005 Friction. AU-009 On Belay: own site shows no bouldering (keep out).
CN-080 (visitor notes as evidence) is an owner policy decision, not decided here.

## Owner decisions waiting
- Retire seed-713 Banana CapitaLand One (closed per the operator) and seed-499 (duplicate of seed-510): retire records via the pipeline.
- CN-080 visitor-note policy (would unblock Renren Happy Valley, Climb On Shougang and a few others; needs a PRIMARY_KINDS change + tests).
- Category policy: kids-only venues (Shanghai 554/586/588, Chongqing 817/821/828/831/838/839, Shenzhen 507/515/518/519/525/529);
  municipal / members-pledge walls in Japan; appointment-only US gyms (Sheer-Fun).
- Climb On Shougang = seed-658 (record the same-as).

## Needs a human (summary)
Mostly pin/entrance placement on a map (China pins-4 leftovers 775/770/781/790/782/776/799/803/811/814/705/708/709 and 734/640/649/681/
583/601/835/842; ~28 Japan pins; Canada/US/Europe/rest-of-world pins). The rest are phone calls or signed-in RedNote/WeChat/Instagram
reads. Per-gym detail is in each file's follow-up section.
