# Gym information research batch 3 (2026-10-04): Zurich, Vienna, London, Toronto

Fields: website, weekly hours (only when all 7 days are stated), day pass (as the gym states it, with currency), facilities
(fixed list, only when stated). Sources: the gym's own site / location page / own price page only (`brief.md`). Pipeline:
PR #44 (fill-only day_pass + facilities through the gated updater). Batch: `import/batches/2026-10-04-gym-info-4`,
built with `build-info-batch-v2.js` (see `../../../import/batches/2026-10-04-gym-info-4/report.md`).

## Numbers
- Researched 49 gyms (Zurich 16, Vienna 13, London 12, Toronto 8). Enriched 46: 176 field values (website 46, hours 39,
  day pass 45, facilities 46). Retired 2 (owner rule "if unsure, retire"). Needs review 1 (not filled).
- Independent fact-checks against the live official sites: Zurich/Vienna 12 gyms x 4 fields = 47/48 OK (Blockfabrik's
  reduced price corrected to EUR 12.40; 3 weakly supported facility keys removed); London/Toronto 9 gyms = 36/36 OK,
  incl. the London Climbing Centres' hours read from grid images and Yonder's price image.

## Judgement calls applied
- Dropped: OeTK hours (Sunday "Closed" was an inference), Edelweiss Walfischgasse day pass (only the alpine-club column is
  stated), Up the Bloc hours (two conflicting sets on the site). Hours null where only partial/seasonal: Adliswil, Quergang,
  Flakturm (seasonal), Mile End (none published), Joe Rockhead's (no am/pm).
- Removed facilities: Boulderbar Hannovergasse parking (evenings/weekends only), Kletterhalle Wien shop (empty menu item),
  GrindelBoulder kids (family prices only). Boulderz day passes say "+ tax" without "adult" (the site says "Admission").

## Retired (in this batch)
- seed-887 Rockcity Climbing (Kingston upon Thames): no such gym; the only Rockcity is in Kingston upon Hull.
- seed-894 The Climbing Hangar London: the operator lists no London centre (London pages 404).

## Needs review / follow-ups (not in this batch)
- seed-1278 Edelweiss Hegelgasse (Vienna): course-only hall, no public opening or day pass; retire or keep?
- seed-903 White Spider: no address and a placeholder pin in north London; the centre is 225 Hook Rise South, Surbiton
  (location fix batch). seed-904 Yonder: no address, approximate pin (location fix).
- seed-885 Rhino Boulder: site postcode BR1 1TR vs ours BR1 1TS (address check).
- London metro holds only 12 listed gyms within 40 km: likely a coverage gap (new-gym research, out of scope here).
