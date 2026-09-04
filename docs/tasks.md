# Current Development State

This is the living task tracker for Climb Atlas. The brain session reads
this first, every session, before deciding what to work on next or what
to dispatch to a worker. Workers update their own task's entry when they
finish (or get stuck) — this is the persistent-knowledge document
required by `Rules.md` §10 and §19: if it isn't written here, it didn't
happen and won't be remembered next session.

Keep entries short. Long design discussion belongs in
`docs/architecture.md` (if it's a lasting architectural decision) — link
to it rather than duplicating it here.

## How to use this file

- **Backlog** — known work, not yet started, roughly ordered.
- **In Progress** — currently has a worker/worktree/branch open against
  it. Note the branch name so anyone can find the work.
- **Blocked** — can't proceed; say exactly what's blocking it and what
  would unblock it.
- **Done (recent)** — finished and merged. Trim this section
  periodically once entries stop being useful reference — this file
  should stay skimmable, not become a full changelog (git history is the
  changelog).

Each entry:
```
### <short title>
- Branch: <branch name, once one exists>
- Status: backlog | in progress | blocked | done
- What: one or two sentences on the actual objective and scope
- Notes: anything a fresh session would need to not re-discover from scratch
```

---

## Backlog

- **Add Norway** — climbing-gyms.com's own Norway coverage is just 2
  gyms in one metro area (Bergen: Kokstad, Laksevåg), too thin to use for
  a whole-country pass (see the Poland/Denmark/Finland/Ireland task
  below). Needs the same lighter-touch web-search method as Mexico/
  Brazil instead of this source. Not started.
- **Add Mexico and/or Brazil** — third tier of the "add more countries"
  ask. No single reliable directory site confirmed yet for either
  country (unlike climbing-gyms.com's European coverage or Mountain
  Project's Korea coverage) — would need a lighter-touch web-search pass
  like the original Japan/Canada/New Zealand passes. Not started.

## In Progress

### Add Poland, Denmark, Finland, Ireland (68 gyms)
- Branch: `feature/add-poland-denmark-norway-finland-ireland` (new
  branch off `master`)
- Status: implemented + verified live in a served copy; not yet merged.
- What: continuing "add more countries in" — second Europe tier via
  climbing-gyms.com, same method as the Spain/Portugal/Austria/
  Switzerland batch. Norway was dropped from this batch (see Backlog)
  after checking its actual page — only 2 gyms total, not enough to
  represent the country.
  - Poland: Warszawa (11) + Wrocław (8) + Kraków (7) + Poznań (5) = 31.
  - Denmark: København (7) + Odense (4) + Aarhus (2) + Aalborg (1) = 14.
  - Finland: Helsinki (8) + Lahti (2) + Oulu (2) + Tampere (2) = 14.
  - Ireland: every city the source listed (8 pages), not just a top 4 —
    Dublin dominates (5 gyms) with a long tail of 1-gym towns, so "top 4"
    didn't fit; ended up with Dublin, Bray, Cloonlara, Cork City,
    Limerick = 9 gyms after 3 exclusions.
- **3 gyms excluded** on the same criteria as the original AU/US
  Mountain Project pass: Galway Climbing Coop (explicitly members-only),
  Mardyke Arena UCC (Cork — ambiguous public access to the climbing wall
  specifically, unlike UL Sport Climbing Wall which *was* confirmed
  public and kept), and "Unique Ascent" (listed under Dublin by the
  source but actually a Donegal outdoor sea-cliff guiding company, not
  an indoor gym, and not in Dublin at all). Full reasoning in
  `docs/architecture.md` "Seed data sourcing".
- **One pair merged, not double-pinned**: Helsinki's "KiipeilyAreena
  Salmisaari" and "Salmisaari Sports Center" turned out to be the same
  physical venue (the sports center building houses the climbing arena,
  not a second separate gym) — same pattern as the Salzburg merge in the
  prior batch.
- Added `PL`/`DK`/`FI`/`IE` to `STATES_BY_COUNTRY` with each country's
  complete real top-level divisions (Poland 16 voivodeships, Denmark 5
  regions, Finland 19 regions, Ireland 26 counties) — same
  completeness standard as every country since the NL fix — plus
  `COUNTRY_LABELS`, `COUNTRY_FLY_TARGETS`, `COUNTRY_TO_REGION` (europe)
  in `js/app.js`; 17 new CSS colour variables (only for divisions with
  actual spots: 4 PL, 4 DK, 4 FI, 5 IE) + chip rules in `css/style.css`;
  4 new sidebar chip groups in their alphabetical Europe slots (Denmark,
  Finland between Belgium and France; Ireland between Germany and Italy;
  Poland between Netherlands and Portugal) and country `<option>`s in
  both add/edit forms.
- Net result: 868 → **936 total spots**. Structural check (Node-parsed
  `window.SEED_GYMS`): 936/936 unique ids, zero duplicate
  name+suburb+state+country combos.
- **Verified live** (served copy, `npx serve .`): add-spot form's country
  dropdown correctly lists all 16 PL / 5 DK / 19 FI / 26 IE divisions;
  all 4 new sidebar chip groups render in the right alphabetical Europe
  slots with correct colours; `window.SEED_GYMS.length` = 936; no
  console errors.
- **Not yet done**: pushing/merging this branch; the live Supabase table
  (same outstanding step as every country addition this session);
  Norway and Mexico/Brazil (Backlog).

### Add Spain, Portugal, Austria, Switzerland (59 gyms)
- Branch: `feature/add-spain-portugal-switzerland-austria` (new branch
  off `master`)
- Status: implemented + verified live in a served copy; not yet merged.
- What: user asked to "add more countries in." Clarified scope via
  AskUserQuestion first: (1) merge the still-open South Korea branch
  from earlier in this session — done first, see the merge-conflict
  entry below; (2) which new countries — user picked Spain/Portugal/
  Switzerland/Austria via climbing-gyms.com as the first batch (also
  flagged interest in a second Europe batch and Mexico/Brazil, not yet
  started — see Backlog).
- Same method as every climbing-gyms.com pass: scoped to each country's
  largest cities by the site's own gym count, addresses individually
  geocoded via Nominatim, climbing type inferred from chain/name
  recognition. Full detail (including the Madrid/Burgos-404, Salzburg
  same-address-merge, and Switzerland's unusually flat per-city gym
  counts) in `docs/architecture.md` "Seed data sourcing".
  - Spain: Madrid (14) + Barcelona (8) = 22 — scoped down from the usual
    4 cities since climbing-gyms.com's own Burgos/Alcorcón pages 404.
  - Portugal: Lisboa (3) + Coimbra (2) + Porto (2) = 7.
  - Austria: Wien (13) + Graz (4) + Linz (3) + Salzburg (2, merged from
    3 listed) = 22.
  - Switzerland: Zürich (2) + Basel (2) + Bern (2) + Winterthur (2) = 8.
- **Applied the state-list-completeness standard from the start**: all
  4 countries' `STATES_BY_COUNTRY` entries list the complete real set of
  administrative divisions (ES 19 autonomous communities/cities, PT 20
  districts/regions, AT 9 federal states, CH 26 cantons), not just the
  ones these seed spots use — same fix already applied to every
  pre-existing country, done here proactively instead of needing a
  second bug report.
- Added `ES`/`PT`/`AT`/`CH` to `STATES_BY_COUNTRY`, `COUNTRY_LABELS`,
  `COUNTRY_FLY_TARGETS`, `COUNTRY_TO_REGION` (europe) in `js/app.js`; 13
  new CSS colour variables (only for divisions with actual spots: 2 ES,
  3 PT, 4 AT, 3 CH) + chip rules in `css/style.css`; 4 new sidebar chip
  groups in their alphabetical Europe slots (Austria before Belgium;
  Portugal, Spain between Netherlands and Sweden; Switzerland between
  Sweden and United Kingdom) and country `<option>`s in both add/edit
  forms in `index.html`.
- Net result: 809 → **868 total spots**. Structural check (Node-parsed
  `window.SEED_GYMS`, not just regex): 868/868 unique ids, zero
  duplicate name+suburb+state+country combos.
- **Verified live** (served copy, `npx serve .`): add-spot form's country
  dropdown correctly lists all 19 ES / 20 PT / 9 AT / 26 CH divisions in
  alphabetical order; all 4 new sidebar chip groups render in the right
  Europe alphabetical slots with correct colours; clicking Spain's
  sidebar label triggers no console errors; `window.SEED_GYMS.length` =
  868; no console errors at any point.
- **Not yet done**: pushing/merging this branch; the live Supabase
  table (same outstanding step as every prior country addition); the
  second Europe batch (Poland/Denmark/Norway/Finland/Ireland) and
  Mexico/Brazil the user also expressed interest in — added to Backlog
  below rather than started in the same session.

### Merge South Korea branch into master (post-hoc conflict resolution)
- Status: **done — merged to `master`**, pushed.
- What: `feature/add-south-korea` (37 gyms, implemented in an earlier
  session) was still sitting unmerged while `master` moved on through
  Belgium, the state-list-completeness fix, and the FR/SE/IT/BE
  verification pass — all of which touched the same `STATES_BY_COUNTRY`/
  `COUNTRY_LABELS`/`COUNTRY_FLY_TARGETS`/`COUNTRY_TO_REGION` block in
  `js/app.js` that Korea's branch also touched, so the merge conflicted
  in `js/app.js`, `css/style.css`, `docs/architecture.md`, and
  `docs/tasks.md` (not `js/data.js` or `index.html`, which merged
  cleanly). Resolved by keeping both sides' additions side by side
  (Belgium + Korea's states/labels/fly-targets/regions, both docs
  writeups back to back) rather than picking one over the other.
- Net result: 772 → **809 total spots**. Verified live (served copy):
  both Belgium's and Korea's sidebar chip groups render correctly, both
  appear in the country dropdown, `window.SEED_GYMS.length` = 809, no
  console errors. Branch deleted after merge (local + remote).

### Verify France/Sweden/Italy/Belgium gym positions (64 spots, complete)
- Branch: `feature/complete-state-lists` (same branch — this merged in
  `feature/add-belgium` first, since Belgium was one of the four
  countries asked about and wasn't in master yet; `feature/add-belgium`
  and `feature/add-south-korea` were the only other open branches, and
  only Belgium was in scope here)
- Status: **complete**. Direct follow-up to the NL verification pass —
  user asked to run the same check on France, Sweden, Italy, and Belgium
  (the other climbing-gyms.com-sourced countries), then merge everything.
- Method: identical to the NL pass — re-geocoded all 64 addressed spots
  against Nominatim (skipping the one FR spot with no address at all,
  Altissimo Toulouse Saint Martin, already flagged) and independently
  web-searched every gym by name to confirm it's real and current.
- **Found and fixed 3 real errors** (see `docs/architecture.md` "Seed
  data sourcing" for full detail) — these were address-text errors the
  original one-off Nominatim pass couldn't have caught by re-running the
  same broken address:
  - **A.S.D. Stone Monkey** (Firenze) — address had a typo blocking
    geocoding entirely; corrected via the gym's own site, pin moved
    **~4.8km** to its real location.
  - **Boite A Grimpe - Marseille** — wrong postal code (13012 → 13008,
    confirmed via search); address text fixed, but Nominatim still can't
    geocode this street at all (genuine OSM gap), so position stays a
    same-city fallback as before.
  - **"Bouldering" (Stockholm)** — confirmed this actually is the gym's
    real name, not a placeholder; renamed to "Bouldering Stockholm" for
    clarity since the generic name looked like an error at a glance.
- **60 of 64 needed no change** — addresses matched Nominatim within
  0-500m and every gym confirmed real/current, including all 14 Belgium
  spots (geocoded at add-time this session, now also independently
  confirmed to exist).
- Net result: still **772 total spots** — a verification/correction
  pass, not additions. Structural check (`node --check` + brace/bracket
  balance): 773/773 braces, 774/774 brackets, unchanged.
- **Verified live** (served copy): all 3 corrected entries load with
  their new lat/lng/address/notes; no console errors.
- **Not done**: `feature/add-south-korea` is still a separate, unmerged
  branch — out of scope here (Korea wasn't one of the 4 countries asked
  about, and wasn't sourced from climbing-gyms.com).

### Verify Netherlands gym positions (25 spots, complete)
- Branch: `feature/complete-state-lists` (same branch/worktree as the
  task above — continued rather than starting fresh, since it's the same
  session and the user's follow-up was directly prompted by the NL work)
- Status: **complete**. User asked "can you verify that gyms are in the
  right places?" after the state-list fix; scoped down to just the
  Netherlands (25 spots) rather than the full 758-spot dataset, since
  that's what the state-list bug report was about.
- Method: (1) re-geocoded all 25 stored addresses against Nominatim and
  compared to the stored `lat`/`lng` (same tool/method as
  `supabase/geocode.html`), (2) independently web-searched every gym by
  name to confirm it's still real, currently operating, and at that
  address — this second step is what the original FR/SE/NL/IT pass
  explicitly hadn't done (see "Seed data sourcing" in
  `docs/architecture.md` — that pass was "real address, geocoded once,"
  not cross-checked).
- **Result: all 25 confirmed clean.** Every address matched its
  Nominatim position within 50m (largest gap was Beest Boulders -
  Amsterdam at 50m, most were exact); every gym independently confirmed
  real and current via its own site or a listing; no closures, no wrong
  suburbs, no fake/stale entries found.
- **One non-issue caught and documented**: Beest Boulders and De Klimmuur
  both have a "Den Haag Hollands Spoor" location at the same address
  (Waldorpstraat 15/15F) — looked like a possible duplicate at a glance,
  but confirmed via search they're two separate real businesses (a
  bouldering hall and a rope-climbing hall) sharing one building next to
  the train station. Added a clarifying note to both spots' `notes`
  fields in `js/data.js` rather than leaving it looking like an
  unexplained coincidence.
- Net result: still **758 total spots**, no additions/removals — this
  was a verification pass, not a data-adding one. Structural check
  (`node --check` + brace/bracket balance): 759/759 braces, 760/760
  brackets, unchanged.
- **Not done**: the other climbing-gyms.com-sourced countries (FR, SE,
  IT, BE) have not had this same independent cross-check — still
  "geocoded once, not verified" per `docs/architecture.md`. Worth the
  same treatment if reported, or proactively at some point.

### Complete every country's state/province/prefecture list
- Branch: `feature/complete-state-lists` (new branch off `master`)
- Status: implemented + verified live in a served copy; not yet merged.
- What: a user on the live site reported that the Netherlands add-spot
  dropdown only offered 3 provinces (missing Noord-Brabant, which they
  wanted to add a gym in) out of the Netherlands' 12 real provinces.
  Root cause: every country's `STATES_BY_COUNTRY` entry (`js/app.js`) had
  only ever been populated with the states/provinces/prefectures that
  country's original seed-data pass happened to add gyms in — never
  audited against the country's actual full set of administrative
  divisions. User asked to fix this "in general for anything below a
  country," not just NL.
- Audited and expanded all 12 countries in `STATES_BY_COUNTRY`: `US` 12
  → 51 (50 states + DC), `JP` 8 → 47 (all prefectures), `CA` 4 → 13 (10
  provinces + 3 territories), `NZ` 3 → 16 (all regions), `FR` 4 → 13 (all
  metropolitan régions), `SE` 3 → 21 (all counties/län), `NL` 3 → 12 (all
  provinces, including Noord-Brabant), `IT` 4 → 20 (all regions). `AU`,
  `GB`, `DE`, and `BE` were already complete (8/4/16/3) and left
  untouched. `CN` was widened 10 → 31 major/provincial-capital cities
  rather than converted to real provinces — it deliberately keys on city
  names, not provinces, a documented design decision from the original
  China pass (would need re-keying every existing CN spot's `state` to
  change). Full writeup in `docs/architecture.md` "Data model".
- **No existing spot's `state` value or code changed** — every code a
  seed spot already used still resolves exactly as before (verified live
  against the real 758-spot dataset, not just structurally). This only
  adds previously-missing options to the add/edit-spot forms' dropdown.
- **Deliberately did not add sidebar filter chips or CSS colours** for
  the newly-available, currently-empty divisions — chips are hand-
  authored per `(country,state)` pair (`index.html` markup +
  `css/style.css` colour var each), and doing that for every new entry
  (100+ across all countries) would re-open the sidebar-height growth
  problem documented in `docs/architecture.md` "Sidebar chip growth". A
  spot submitted in one of these new divisions still shows on the map/
  search by default (no chip needs to be toggled off), same treatment
  already used for `OTHER`-country submissions. Chip/colour support for
  a given division should be added the same way as always, once real
  spots exist there.
- **Verified live** (served copy, `npx serve .`): add-spot form's country
  dropdown correctly lists all 51 US / 47 JP / 13 CA / 20 IT / 21 SE / 31
  CN options; Netherlands dropdown confirmed to include
  `NOORD_BRABANT:Noord-Brabant` (the reported-missing one) alongside all
  11 other real provinces; `window.SEED_GYMS.length` unchanged at 758;
  every existing NL spot's `state` (`NOORD_HOLLAND`/`ZUID_HOLLAND`/
  `UTRECHT`) still resolves correctly in the data; `node --check
  js/app.js` passes; a structural check confirmed zero duplicate state
  codes within any single country; no console errors.
- **Not yet done**: pushing/merging this branch, and the same
  human-in-a-real-browser look every branch in this project still
  ultimately needs before merge.

### Add Belgium (14 gyms)
- Branch: `feature/add-belgium` (new branch off `master`)
- Status: implemented + verified live in a served copy; not yet merged.
  **Not yet pushed to the live Supabase table** — same outstanding step
  as every prior country addition.
- What: user asked to add Belgium using `climbing-gyms.com/browse/europe`
  again, same source as France/Sweden/Netherlands/Italy. Scoped to its 4
  largest cities by the site's own gym count: Antwerpen (5), Gent (4),
  Liège (3), Bruxelles (2) — 14 gyms total.
- **All 14 addresses geocoded cleanly on the first Nominatim try** — no
  fallback positions needed this time, unlike every prior
  climbing-gyms.com pass (FR/SE/NL/IT and Korea's MP pass all needed at
  least one fallback).
- Type mostly given directly by the source this time (Gent's 4 + 2 of
  Antwerp's 5 explicitly tagged "Bouldering"; Antwerp's other 3 tagged
  "Climbing/Bouldering" → bouldering + top-rope); Bruxelles's Arkose
  Canal reused the bouldering-only classification already confirmed for
  the Arkose chain during the France pass.
- Added `BE` to `STATES_BY_COUNTRY` (Belgium's 3 real top-level regions —
  Flanders, Wallonia, Brussels-Capital, taken directly from the source's
  own address strings), `COUNTRY_LABELS`, `COUNTRY_FLY_TARGETS`, and
  `COUNTRY_TO_REGION` (europe) in `js/app.js`; 3 new `--be-*` CSS colour
  variables + chip rules; a new sidebar chip row (alphabetically first
  under the Europe region-group, before France) and country `<option>`
  in both add/edit-spot forms.
- Net result: 758 → **772 total spots**. Structural check (`node -e`
  eval): 773/773 braces balanced, 774/774 brackets balanced, all 772 ids
  unique, zero duplicate name+suburb+state+country combos.
- **Verified live** (served copy, `npx serve .`): `window.SEED_GYMS.length`
  = 772; Belgium chip group renders under Europe with all 3 regions in
  the right colours and alphabetical slot; clicking the Belgium sidebar
  label correctly flies the camera to `{center:[4.6,50.7], zoom:6.6}`,
  visibly framing Antwerp/Brussels/Charleroi/Namur; no console errors.
  Live Supabase data (still 758, pre-re-seed) showed no Belgium spots
  yet — expected, not a bug.

### Add South Korea (37 gyms)
- Branch: `feature/add-south-korea` (new branch off `master`)
- Status: implemented + verified live in a served copy; not yet merged.
  **Not yet pushed to the live Supabase table** — same outstanding step
  as every prior country addition.
- What: user asked to use Mountain Project's `/gyms/south-korea`
  directory (MP has decent Korea coverage, unlike its gap for Japan) —
  same source/method as the original AU/US/UK/DE passes. 38 listings
  found; 37 added, 1 excluded.
- **Excluded**: Pangyo Park Artificial Wall — its own gym page described
  it as an outdoor public-park climbing structure, not a commercial gym.
- **3 university-named gyms individually checked, not assumed to be
  campus-restricted**: Do Climbing Kyungsung/Pukyong National University,
  Rock Odyssey Dong-eui University, and Waverock Pusan National
  University all confirmed (phone/website/booking presence; Waverock PNU
  specifically via its own public `waverock.co.kr/pnu` class-booking
  page) to be normal commercial franchise locations merely sited near a
  university, not restricted facilities — kept, with a disclosure note
  on each.
- **Positions individually geocoded**: 32/37 addresses matched Nominatim
  directly; 4 more matched after simplifying to a district-level version
  of the same address; the last (Ayers Rock Climbing Gym, Seoul) falls
  back to another matched gym in the same Songpa-gu district — all
  flagged in `notes`.
- **No facility type given by MP for any Korea listing** — every spot
  defaults to indoor-bouldering + top-rope except B.bloc Climbing Songdo
  ("bloc" in the name → bouldering-only), same conservative default used
  for unconfirmed DE/GB/FR-tier entries.
- Added `KR` to `STATES_BY_COUNTRY` (using Korea's real top-level
  divisions that have a seed spot: Seoul, Busan, Incheon, Daegu, Gwangju,
  Ulsan, Gyeonggi-do, Gyeongsangnam-do, Jeollanam-do, Chungcheongnam-do),
  `COUNTRY_LABELS`, `COUNTRY_FLY_TARGETS`, and `COUNTRY_TO_REGION` (asia,
  alongside China/Japan) in `js/app.js`; 10 new `--kr-*` CSS colour
  variables + chip rules in `css/style.css`; a new sidebar chip row
  (nested under the existing Asia region-group, alphabetically after
  Japan) and country `<option>` in both add/edit-spot forms.
- Net result: 758 → **795 total spots**. Structural check (`node -e`
  eval): 796/796 braces balanced, 797/797 brackets balanced, all 795 ids
  unique, zero duplicate name+suburb+state+country combos.
- **Verified live** (served copy, `npx serve .`): `window.SEED_GYMS.length`
  = 795; South Korea chip group renders in the sidebar under Asia with
  all 10 regions in the right colours; clicking the South Korea sidebar
  label correctly flies the camera to `{center:[128,36], zoom:5.4}`; no
  console errors. Live Supabase data (still 758, pre-re-seed) obviously
  showed no Korea spots yet — expected, not a bug.

### Add a continent label tier + click-to-fly, above the existing country tier
- Branch: `feature/continent-labels-and-fly-to` (new branch off `master`)
- Status: **done — merged to `master`** and live on climbatlas.org.
- What: user feedback after the France/Sweden/Netherlands/Italy addition
  — with 6 European countries now on the map, the globe-zoom label tier
  was showing an individual country name (e.g. "Germany") immediately at
  the most-zoomed-out view, before a continent name. Asked for: (1) show
  the continent (e.g. "Europe") first, switching to the country name only
  once zoomed in further; (2) make sure the country name doesn't ever
  show twice once it does appear; (3) clicking a continent flies/rotates
  the globe to it, same as clicking a country already does.
- **(1) New continent tier**: added `CONTINENT_LABEL_ZOOM = 3.5` (coarser
  than the existing `COUNTRY_LABEL_ZOOM = 5`), a `COUNTRY_TO_REGION` map
  (country code → region id, matching the sidebar's own
  `.region-group[data-region]` nesting), `REGION_LABELS`, and
  `computeContinentCentroids()` — same pattern as the existing per-country
  centroid function, one tier coarser. `paintMarkers()`'s two-way
  continent/state branch became a three-way continent/country/state
  branch, still sharing one collision-avoidance pass and one
  `regionLabelMarkers` tracking dict.
- **(2) No duplicate country names**: this falls out of the tier design
  rather than needing separate logic — each tier's candidates come from
  exactly one centroid map keyed uniquely per tier (continent: region id,
  country: bare code, state: `"country:state"`), and only one tier's
  candidates are ever read at a given zoom, so a given label can only
  ever be sourced once. Verified live by zooming in/out across the
  continent↔country boundary and reading `.region-label` elements from
  the DOM directly — exactly one label per key at every zoom tested, and
  the old tier's label(s) were gone by the time the new tier's appeared.
- **(3) Click-to-fly**: added `REGION_FLY_TARGETS` (`COUNTRY_FLY_TARGETS`,
  one tier up — frames every country currently in that continent). Wired
  two ways: the on-map continent label itself is now clickable (the only
  label tier that is — state/country labels keep `pointer-events:none` so
  they can't block map drag; continent labels get a new `.continent-label`
  CSS class that turns pointer-events back on), and the sidebar's
  `.region-header` click (Asia/Europe/North America/Oceania) now also
  flies to `REGION_FLY_TARGETS` alongside its existing collapse-toggle,
  mirroring how `.country-label` already does both for
  `COUNTRY_FLY_TARGETS`. Full writeup in `docs/architecture.md` "Map".
- **Verified live** (served copy, `npx serve .`, against the now-fully-
  seeded live Supabase data — 758 spots): default globe view shows a
  single "Europe" label (confirmed via DOM query, not just visually —
  the basemap's own place-name labels like "GERMANY"/"UNITED KINGDOM" are
  a separate CARTO tile layer, not this app's markers, and were initially
  mistaken for the same thing before checking the DOM directly); zooming
  in twice correctly cleared "Europe" and painted "Germany", "United
  Kingdom", "France", "Netherlands" as four separate, non-duplicated
  labels; zooming back out restored the single "Europe" label; clicking
  the sidebar's Europe region-header flew the camera to `{center:[8,50],
  zoom:3.2}`; clicking the on-map "Europe" label itself flew to the same
  target; no console errors at any point.

### Add France, Sweden, Netherlands, Italy (76 gyms)
- Branch: `feature/add-france-sweden-netherlands-italy` (new branch off
  `master`)
- Status: **done — merged to `master`**, live Supabase table re-seeded
  (confirmed by the user), all 758 spots live on climbatlas.org. Along
  the way, found the live `spots` table had only ever had **504** rows —
  exactly AU+US+JP+CA+NZ+CN — because Germany and the UK (added in an
  earlier session, see "Require sign-in + rate-limit new spot
  submissions; add UK and Germany" in Done below) were never actually
  pushed live either, despite being in `js/data.js` this whole time. So
  "Europe is not showing any markers" (the user's report right after
  this merge) was a bigger, pre-existing gap than this task alone — sent
  a **full 758-row re-seed** (every country, upsert-safe by `id`,
  superseding an earlier narrower 76-row script that would not have
  fixed DE/GB) rather than a partial fix.
- What: user asked to add these 4 countries using
  `https://climbing-gyms.com/browse/europe` as the source — a directory
  site with per-city gym listings, each with a real street address
  (unlike Mountain Project's AU/US/UK/DE listings, which only gave
  name + city). Scoped to each country's 3-4 largest cities by the
  site's own gym count (not exhaustive — France alone lists 150+
  cities): Paris/Lyon/Marseille/Toulouse (FR, 30 gyms),
  Göteborg/Stockholm/Malmö (SE, 7), Amsterdam/Den Haag/Utrecht/Rotterdam
  (NL, 25), Roma/Milano/Modena/Firenze (IT, 14). 76 gyms total.
- **Positions individually geocoded, not city-level estimates**: every
  gym's real address was run through Nominatim (same tool as
  `supabase/geocode.html`, here as a one-off Node script since there was
  no existing pin to compare against) — 71 of 76 matched; the other 5
  fall back to another already-geocoded gym's position in the same city,
  flagged in `notes`. This is a step up from the GB/DE "directory depth"
  tier but **not** cross-checked against a second source per-gym the way
  AU/US were (no individual web search) — real address, geocoded once,
  not independently verified.
- **First real use of the `lead-climbing` type** (added earlier this
  session but never actually applied to a spot until now): Climb Up
  (France's largest chain, confirmed via search to offer bouldering +
  top-rope + lead) and Movimento Verticale Roma (source's own
  description translates to "sport climbing," i.e. lead) are tagged
  `[indoor-bouldering, top-rope, lead-climbing]`. Everything else's type
  is inferred from chain/name recognition (Arkose, Block'Out,
  Bolder/Boulderhal/Boulder-branded gyms → bouldering-only; everything
  else → bouldering + top-rope default), not individually confirmed —
  same tier of confidence as the DE/GB naming-heuristic passes.
- Added `FR`/`SE`/`NL`/`IT` to `STATES_BY_COUNTRY` (using each country's
  real administrative regions — Île-de-France, Auvergne-Rhône-Alpes,
  etc.), `COUNTRY_LABELS`, and `COUNTRY_FLY_TARGETS` in `js/app.js`; 14
  new `--fr-*`/`--se-*`/`--nl-*`/`--it-*` CSS colour variables + chip
  active-state rules in `css/style.css`; new sidebar chip rows (nested
  under the existing Europe region-group, alphabetically among
  France/Germany/Italy/Netherlands/Sweden/United Kingdom) and country
  `<option>`s in both add/edit-spot forms in `index.html`. Full sourcing
  writeup in `docs/architecture.md` "Seed data sourcing".
- Net result: 682 → **758 total spots**. Structural check (`node -e`
  eval): 759/759 braces balanced, 760/760 brackets balanced, all 758 ids
  unique, zero duplicate name+suburb+state+country combos.
- **Verified live** (served copy, `npx serve .`): `window.SEED_GYMS.length`
  = 758; all 4 new country chip groups render in the sidebar with correct
  colours in the right alphabetical slot; clicking the France sidebar
  chip/label correctly filters and flies the camera to France (confirmed
  by screenshot — basemap showed "France"/"Lyon"/"Auvergne-Rhône-Alpes"
  labels after the fly-to); add-spot form's Italy state dropdown
  populates with the correct 4 regions; no console errors at any point.
  This test environment's Supabase project only has the old 504 spots
  live (not yet re-seeded), so the new countries weren't visually
  confirmed rendering as map markers in this session — only structurally,
  via the same code path every other approved spot already renders
  through.

### Let community submissions propose a country not on the map yet
- Branch: `feature/propose-new-country` (new branch off `master`)
- Status: **done — merged to `master`** and live on climbatlas.org.
- What: user feedback — people want to add gyms in countries the map
  doesn't support yet (only AU/US/JP/CA/NZ/CN/GB/DE have a chip, colours,
  and a `STATES_BY_COUNTRY` entry). Added an "Other (not listed)" option
  to the country `<select>` in both the add-spot and edit-spot forms —
  picking it swaps the State `<select>` for two free-text inputs (country
  name + state/region) instead of trying to guess a short code or region
  list for a country this app doesn't know about yet.
- No schema change needed — `spots.country` is a plain `text` column with
  no check constraint. The submission still goes through the existing
  sign-in + rate-limit + moderator-review pipeline unchanged; a moderator
  just sees the raw typed country name in the pending panel (e.g.
  "(France)"), which is self-explanatory.
- An approved spot from an unlisted country still shows up on the map and
  in search (confirmed `passesFilters()` already defaults to "show
  everything" when no sidebar chip is toggled) — it just has no dedicated
  filter chip/colour until someone does the same one-country-at-a-time
  formal-support work every existing country went through. Full writeup in
  `docs/architecture.md` "Data model".
- Also fixed a real pre-existing bug found while touching this code: the
  add-spot modal's reset-on-open handler cleared
  `fTypeIndoor`/`fTypeTopRope`/`fTypeOutdoor` but not `fTypeLead` (missed
  when lead climbing was added in the prior task) — the Lead Climbing
  checkbox could stay checked across separate "Add a location" opens.
  Fixed alongside this change since it's the same array.
- **Verified live** (served copy, `npx serve .`, DOM-level sign-in bypass
  for testing since add-spot now requires auth): selecting "Other" in
  either form swaps in the free-text fields and hides the State dropdown
  without touching the Country dropdown itself; switching back to a real
  country re-shows and correctly repopulates the State dropdown; no
  console errors at any step. `openEditModal()`'s fallback path (for
  editing a spot whose `country` isn't a recognized key) was checked by
  reading the code, not exercised live — no such spot exists in the
  dataset yet to open.
- **Not yet done**: an actual end-to-end submission through Supabase
  (sign in for real, submit an "Other" country, see it land in
  `pending`) — this environment can't complete a real auth flow. Worth
  the user trying once live.

### Add a lead climbing type/checkbox
- Branch: `feature/geocode-address-tool` (same branch/worktree as the
  geocoding-tool task above — continued rather than starting fresh, per
  this project's established practice of stacking small tasks from one
  session onto the active unmerged branch)
- Status: **done — merged to `master`** (PR #2) and live on climbatlas.org.
- What: user asked to add "lead climbing" as a fourth climbing type,
  alongside the existing indoor bouldering / top rope / outdoor bouldering.
  Followed the exact same pattern used when outdoor bouldering was added
  (see `docs/architecture.md` "Known gaps"): new `lead-climbing` value in
  `TYPE_COLORS`/`TYPE_LABELS`/`activeTypes` (`js/app.js`), a new `--t-lead`
  CSS variable (`#4a90c9`, blue — distinct from the other three), and a
  matching checkbox added in all four places a type checkbox needs to
  exist: sidebar type filter, map legend, add-spot form (`fTypeLead`), and
  edit-spot form (`eTypeLead`) — each wired through the same generic
  `data-type`/id-to-type-map plumbing the other three types already use,
  no per-type special-casing needed. No schema change — `spots.types` is
  a plain `text[]` with no check constraint.
- **Verified live** (served copy, `npx serve .`): legend shows all 4 types;
  sidebar filter has a working 4th checkbox (toggling it produces no
  console errors, correctly flips `activeTypes`); add-spot form's 4th
  checkbox renders with the right label and blue accent-color when
  checked, confirmed via a temporary DOM-level bypass of the sign-in gate
  (not a code change, just to inspect the modal markup — this project's
  add-spot flow now requires sign-in, so a real end-to-end submission with
  lead climbing checked wasn't tested this session); edit-spot form's
  `eTypeLead` element confirmed present via direct DOM query. No console
  errors observed at any point.
- No existing seed spot has been retroactively tagged `lead-climbing` —
  same as outdoor bouldering, it only applies going forward to new/edited
  submissions, per the same reasoning documented in `docs/architecture.md`.

### Add a geocoding tool to fix inaccurate pin positions
- Branch: `feature/geocode-address-tool` (new branch off `master`)
- Status: **done — merged to `master`** (PR #2) and live on climbatlas.org.
  Used to apply 40 real corrections so far (see the two follow-up batches
  further down this section); the full ~450-spot remainder is still
  ungeocoded.
- What: user reported feedback that several map pins are "a few km" off from
  their real location. Root cause was already known and documented (see
  `docs/architecture.md` "Seed data sourcing"): most spots have a verified
  street `address`, but the `lat`/`lng` pin was generally never recomputed
  from it — it's still the original city/suburb-level estimate from whichever
  data-adding pass created that entry. Fixing this for real needs a geocoding
  step, not another guess.
- **New `supabase/geocode.html`** (same "one-off browser tool, not part of the
  live app" pattern as `supabase/seed.html`): loads `js/data.js`, geocodes
  every spot with a non-empty `address` against OpenStreetMap's **Nominatim**
  (free, keyless — no account/API key, same no-API-key philosophy as the map's
  CARTO basemap), sequentially with a 1.1s delay per request (Nominatim's
  usage policy caps at ~1 req/sec). For each match it computes the haversine
  distance between the current pin and the geocoded position, and renders a
  sortable/filterable review table (worst offenders first) — nothing is
  applied automatically. Each row shows both positions with OpenStreetMap map
  links and the raw Nominatim match text, so a human can sanity-check before
  accepting (per `Rules.md` §1 — never guess/apply blind). Spots Nominatim
  can't match (e.g. unit-number-style addresses like "Building 3/85 O'Riordan
  St" trip up its parser) are listed separately as needing manual lookup,
  not silently skipped.
- Accepted corrections (checkboxes, with select-all/deselect-all helpers)
  generate two outputs: ready-to-paste **SQL** (`update public.spots set
  lat=…, lng=… where id=…`) to fix the live map immediately via the Supabase
  SQL Editor, and a **JSON** list of the same `{id, old/new lat/lng}` changes
  to apply to `js/data.js` too — so the offline fallback and any future
  re-seed stay in sync with the live corrections rather than reverting them.
  `id` values match the `seed-<index>` scheme `js/data.js` assigns at load
  (see the `.map((g,i)=>({...g, id:'seed-'+i, ...}))` at the bottom of that
  file), the same id the live `spots` table already uses.
- **Verified live** (served copy, `npx serve .`): page loads with no console
  errors; ran a real (not mocked) partial pass against Nominatim — 8 of the
  first 16 addressed AU spots matched, correctly sorted by distance moved
  (2.03 km down to 1.04 km shown, more below the table's threshold), each
  with a sane-looking Nominatim match string confirming the right building
  (e.g. "Climb Fit Macquarie, 3, Waterloo Road, Macquarie Park" matching the
  spot's own known address); the 8 that didn't match were listed by name
  under "needs manual lookup," not dropped silently; selecting rows and
  clicking "Generate SQL + JSON" produced correct, syntactically valid SQL
  and JSON keyed by the right `seed-N` ids.
- **First real batch applied (2026-09-03)**: user ran a partial pass in their
  own browser filtered to "moved more than ~5km", producing 30 candidate
  corrections, and asked to cross-check before applying rather than trusting
  Nominatim alone. Cross-checked all 30 against genuinely independent
  sources rather than just Nominatim's own resolution:
  - The 24 US addresses in the batch were checked against the **US Census
    Bureau's free Geocoder API** (`geocoding.geo.census.gov`, government
    data, independent of OpenStreetMap/Nominatim) — 16 landed within ~0.5km
    of Nominatim's pin (as good as this gets), 2 more (High Point Climbing
    Birmingham, The Gravity Vault Marin) had a larger but explainable gap
    (long highway/business-park addresses, where interpolation is fuzzier)
    and were independently confirmed via web search, 5 had no Census match
    at all (gaps in Census's road-range data, addresses otherwise look
    standard) so were left unapplied, and 1 (Vertical World North,
    Lynnwood WA) had a genuine, unresolved 2.46km disagreement between the
    two geocoders with no third source available (Yelp/WanderBoat both
    blocked automated fetches) — left unapplied pending manual review.
  - The 6 non-US addresses in the batch (NZ, Canada×2, Japan, Australia×2)
    have no equivalent free government geocoder, so each address was
    independently confirmed via web search against the gym's own listing —
    all 6 checked out (one minor, inconsequential discrepancy: City Rock
    Osaka's stored address is "2-3-36 Tagawakita" vs. "2-3-35" from one
    source — adjacent building, not a positioning concern, noted in that
    spot's own `notes`).
  - **24 of the 30 were applied** to `js/data.js` (lat/lng updated, plus a
    "Address and position independently verified" note appended/added to
    each spot's `notes` field so this is visible in-app, not just in git
    history) — see the corresponding commit for the exact list. The other
    6 (5 no-Census-match + Vertical World North) were deliberately left
    untouched per `Rules.md` §1 rather than guessed. Structural check
    (`node -e` eval): still 682 total spots, 683/683 braces balanced,
    exactly 24 spots now carry the verified-note.
  - **User still needs to run the corresponding SQL** (generated by
    `supabase/geocode.html` for the same 24 accepted rows) in their
    Supabase SQL Editor — this update only touched the offline
    `js/data.js` fallback; the live table isn't fixed until that SQL runs.
- **Second batch applied (2026-09-04)**: user asked to geocode "everything
  that is 4km+" — run this time as a standalone Node script (mirroring
  `geocode.html`'s own logic: same Nominatim endpoint, same 1.1s rate limit,
  same haversine distance calc) directly against the **remaining 468
  addressed spots** that don't already carry the verified-note (i.e. the
  full remaining dataset minus the 24 already fixed), rather than another
  manual browser pass — the script ran in the background (~9 minutes) while
  other work continued. Result: 298 matched, 170 no-match (spread across
  the whole run, not one contiguous block — consistent with genuinely
  hard-to-parse addresses, e.g. AU unit-number formats and several Chinese
  mall/complex addresses, not a rate-limit block), 24 moved ≥4km.
  - Same independent cross-check discipline as the first batch: the 23 US
    candidates checked against the Census Bureau geocoder (14 tight matches,
    1 more — Solid Rock Gym/Vertical Hold San Marcos — a 0.571km gap
    confirmed via web search as a real, currently-branded gym at that exact
    address, so treated as certain), the 1 AU candidate (Core Climbing,
    Carrara) confirmed via web search. **16 of 24 applied** to `js/data.js`
    with the same verified-note treatment.
  - **8 left unapplied**: the same 5 addresses that had no Census match in
    the first batch reappeared here with fresh Nominatim results (InSPIRE
    Rock Lubbock, Movement Dallas–The Hill, Movement Plano, Gripstone,
    Sessions Climbing & Fitness) plus one more this batch (Übergrippen
    Indoor Climbing Crag, Castle Rock CO) — still no independent
    confirmation available, so still not applied. Vertical World North
    reappeared unchanged (still the same unresolved 2.46km gap from before).
    New this batch: **Central Rock Gym – Kennesaw** had a 2.598km
    disagreement between Nominatim and Census with the address itself
    confirmed correct by search — same "genuinely uncertain" treatment as
    Vertical World North, left unapplied pending manual review.
  - Running total: **40 of 682 spots** now carry the independently-verified
    note (24 + 16). Structural check (`node -e` eval): still 682 total
    spots, 683/683 braces balanced.
  - **User still needs to run the SQL** for these 16 (or the combined
    40-row script covering both batches) against the live Supabase table —
    `js/data.js` is fixed, the live table isn't yet.
- **Not yet done**: most of the ~468 remaining addressed spots weren't big
  movers (<4km) and so weren't touched this pass — the dataset still isn't
  fully geocoded, just the two batches of outliers found so far (30 then
  24, filtered at ~5km then 4km). A lower-threshold or genuinely full pass
  would surface smaller, still-real corrections. GB/DE still have no
  `address` field at all (see `docs/architecture.md`), so this tool can't
  help their pin accuracy until that's added first.

### Fix globe rendering, marker drag lag, remove outdoor-bouldering type
- Branch: `fix/globe-render-perf-remove-outdoor-type`
- Status: in progress (implemented + verified against a live served copy in a
  headless browser tab; user still needs to confirm in their own browser,
  not yet merged)
- What: three issues reported together after the MapLibre globe migration:
  (1) globe wasn't rendering at all, (2) visible marker lag while dragging
  the map, (3) remove "outdoor bouldering" as a type/filter option per user
  decision to delete rather than recategorize. A fourth, unrelated bug was
  found and fixed while verifying (1)-(3): see below.
- **(4) Zero markers ever rendered on load** — found while verifying the
  globe fix by actually serving the worktree (via an ad hoc PowerShell
  `HttpListener` static server, since neither `python`/`python3` nor
  `node`/`npx` were on PATH in the sandbox) and inspecting the live DOM/
  instrumenting `Supercluster.prototype.getClusters` from the browser
  console. Root cause: `init()`'s `map.fitBounds()` built a
  `maplibregl.LngLatBounds` by calling `.extend()` over every spot's
  `[lng,lat]` — since `LngLatBounds` just tracks running min/max longitude,
  and AU spots (~lng 113 to 153) and US spots (~lng -125 to -70) sit on
  opposite sides of the Pacific, the resulting box spanned the *long* way
  round through Africa (west -118.5°, east 151.2°, a ~270° span) instead of
  the short ~90° span across the Pacific. `fitBounds` then centered the
  camera near the Gulf of Guinea at a zoom tight enough to exclude every
  real spot — confirmed directly: `supercluster.getClusters()` was being
  called with a bbox that didn't overlap AU or US at all. Fixed by removing
  the fitBounds-to-data-on-load behavior entirely (a tight fit doesn't
  suit a globe view of two far-apart countries anyway) and picking a fixed,
  deliberate starting camera (`center:[-162,10], zoom:1.3`, roughly
  mid-Pacific) instead — see the comment above the `maplibregl.Map`
  constructor in `js/app.js`. This bug predates this session's globe work
  (the same naive `bounds.extend()` loop existed before), it just never
  produced a *visibly broken* result until the globe projection actually
  started working.
- Notes:
  - (1) root cause confirmed by diffing actual unpkg bundles: `maplibre-gl@4`
    resolves to 4.7.1, whose code only has `globe` in the style-spec schema
    (for validation), no real rendering engine — `setProjection` silently
    no-ops. `@5` (5.24.0) has the real engine (234 `globe`-related
    identifiers vs. 1). Bumped the CDN pin in `index.html` for both the JS
    and CSS `<link>`. See `docs/architecture.md` "Map" section for the full
    writeup — don't downgrade this pin without re-checking that.
  - (2) DOM markers inherently lag MapLibre's WebGL render loop while the
    camera moves (documented upstream limitation, confirmed via search, not
    fixable in application code). Mitigated two ways: markers are hidden for
    the duration of a drag/zoom via `#map.is-moving .maplibregl-marker`
    (toggled on `movestart`/`moveend`) so the lag isn't visible; and
    `paintMarkers()` was rewritten to diff against what's already painted
    instead of clearing and rebuilding every marker/popup on every
    `moveend`, removing real unnecessary work from the hot path.
  - (3) User explicitly chose "delete the 23 outdoor-only seed spots
    entirely" over recategorizing or just hiding the UI option (asked via
    AskUserQuestion since it was destructive/ambiguous). Removed from
    `js/data.js` (93 → 70 spots), `TYPE_COLORS`/`TYPE_LABELS`/`activeTypes`
    in `js/app.js`, the three `chk-outdoor` checkboxes + legend swatch in
    `index.html`, and the dead `.chk-outdoor` CSS rule. Some seed states
    (AU TAS, US AL/GA/TN/UT) now have zero spots as a result — expected,
    documented in `docs/architecture.md`, not a bug.
  - Verified so far (all static, in the worktree): brace/paren balance on
    `app.js`, every `getElementById` id resolves in `index.html`, every CSS
    `var(--x)` resolves, no leftover `outdoor`/`Leaflet` references in code,
    all MapLibre APIs the app calls (`setProjection`, `setSky`,
    `LngLatBounds`, `flyTo`, `easeTo`, `fitBounds`, `getBounds`, `getZoom`,
    `getContainer`, `togglePopup`, `getPopup`, `setLngLat`) confirmed
    present in the 5.24.0 bundle, all MapLibre CSS class names our
    stylesheet targets confirmed present in 5.24.0's CSS.
  - **Not yet done**: real browser smoke test (globe actually renders/spins,
    clustering, drag feel, add/edit flow, sign-in) — this environment can't
    execute JS against `localhost` or a real `file://` load. Needs a human
    to open `index.html` via `python3 -m http.server 8000` and check per
    `Rules.md` §7 before merging this branch.

### Add indoor gyms from Mountain Project's gym directory
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch as the
  bug-fix task above — continued in the same worktree rather than a
  fresh one, since it builds directly on that branch's state; not yet
  merged, so master still has neither)
- Status: in progress (data added + structurally verified; not yet
  smoke-tested live)
- What: user asked to use mountainproject.com/gyms/<state> to add indoor
  bouldering gyms to AU and US. Mountain Project's general site search is
  not useful for gyms (confirmed — it's an outdoor-crag/route database),
  but it has a dedicated `/gyms/<state-or-country>` directory that's
  actually a real, if noisy, gym listing.
- Scope decided with the user: exhaustive pass across all 8 AU
  states/territories and all 12 US states already in the app (not all 50
  US states) — cross-reference each state's MP gym list against
  `js/data.js`, add genuinely new gyms, filter out non-gyms.
- **Filter applied** (confirmed with the user after the first state
  showed the scale of noise): exclude university/college recreation
  center walls, municipal/county park-district recreation and community
  centers, YMCAs, generic multi-location fitness chains (Life Time /
  Lifetime Fitness, Crunch, XSport, athletic clubs) with no specific
  climbing focus, gymnastics/kids-party facilities, dry-tooling-only gyms
  (kept the few that also do rock climbing), multi-sport complexes/retail
  demo walls (Bass Pro, REI, Sun & Ski), and team-only/members-only
  training facilities. Every state's MP list needed this filter; noise
  ratio varied a lot (Nevada was nearly all real gyms; Illinois and
  California were the noisiest).
- **Positioning**: city/suburb-level coordinates with a small per-gym
  offset where multiple gyms share a city, not exact street addresses —
  MP's gym pages only expose a street address, not lat/lng, and getting
  exact coordinates for ~330 gyms would mean geocoding every single
  address individually. Every added entry is flagged in its `notes`
  field as "Sourced from Mountain Project's gym directory — city-level
  position, not an exact address" so this is visible in-app, not just in
  git history.
- **Dedup discipline**: every same-named or same-city pair was checked by
  opening both gym pages and comparing street addresses, not assumed from
  the name alone. Real MP-side duplicates were found and skipped in AU,
  TX, WA, NY, AL, MA, and CA (same gym listed twice under slightly
  different names/IDs). Several apparent duplicates turned out to be
  genuinely different locations on inspection (e.g. three separate
  "Vertical Hold"-named gyms in the San Diego area, two "Rockreation"s,
  two "Stronghold" gyms in LA) and were kept as separate entries.
- Net result: 93 → 70 spots after the earlier outdoor-bouldering removal,
  then +328 new gyms across this pass → **429 total spots** (77 AU + 352
  US). Per-state breakdown of *new* gyms added: AU 17, CO 34, TX 39, WA
  26, NY 41, NV 6, GA 17, UT 17, AL 7, TN 18, MA 22, IL 19, CA 95.
- **Not yet done**: live smoke test of the new data (map still renders
  correctly with ~5x the spots, clustering behaves reasonably at this
  density, sidebar list still performs fine) — needs the same
  `python -m http.server` + browser check as the bug-fix task above,
  ideally in the same session since it's the same branch.

### Numbered markers at low zoom + add Japan
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as the two tasks above — continued rather than starting fresh, same
  reasoning as before: builds on this branch's state, not yet merged)
- Status: in progress (implemented + structurally verified; not yet
  smoke-tested live)
- What: two requests from the user in one message: (1) ungrouped single
  spot markers should show as a number until zoomed in, matching cluster
  badges, instead of a small hold-shaped icon that's easy to miss when
  zoomed out; (2) add Japan to the map.
- **(1) Numbered markers**: added `HOLD_ICON_ZOOM = 9` in `js/app.js`.
  Below that zoom, `paintMarkers()` builds ungrouped spots with
  `buildSpotNumberMarker()` (a `.cluster-marker`-styled badge reading "1",
  background = the spot's own type colour) instead of
  `buildSpotMarker()`'s hold-shaped icon; at/above it, the normal icon.
  `paintMarkers()` tracks the last-painted "bucket" (`icon`/`number`) and
  clears all spot markers (cluster badges untouched) when the zoom crosses
  the threshold, since a marker painted in the wrong style needs to be
  rebuilt, not left alone. `updateMarkUI()` was guarded to only restyle
  `kind:'icon'` entries — a numbered badge has no climbed/bookmarked state
  to show. See `docs/architecture.md` "Map" section for the full writeup.
- **(2) Add Japan**: added `JP` as a third country, following the existing
  `country`+`state` pairing pattern (`docs/architecture.md` "Data model").
  8 cities/prefectures seeded — Tokyo, Osaka, Kyoto, Fukuoka, Aichi
  (Nagoya), Kanagawa (Yokohama), Hokkaido (Sapporo), Hyogo (Kobe) — with
  32 real, named gyms total, sourced from climbingjapan.com's gym
  directory (Tokyo/Osaka/Kyoto) and per-city web search (the other five).
  This pass is **not exhaustive and lighter-touch than the Mountain
  Project pass**: gym names are real and sourced, but unlike MP, no
  individual gym page was opened to confirm a street address for each
  one — positions are ward/city-level from general geography, flagged
  per-entry in `notes`. Japan doesn't have a widely-known 2-letter state
  code convention like AU/US, so `state` values are the prefecture/city
  name itself (`TOKYO`, `OSAKA`, etc. — see `STATES_BY_COUNTRY.JP` in
  `js/app.js`). Updated: `js/data.js` (+32 spots), `js/app.js`
  (`STATES_BY_COUNTRY.JP`), `index.html` (Japan chip row + `<option>` in
  both country `<select>`s + country-count copy), `css/style.css` (8 new
  `--jp-*` colour vars + chip active-state rules), `README.md` and
  `docs/architecture.md` (country-count copy, sourcing writeup).
- Net result: 429 → **461 total spots** (77 AU + 352 US + 32 JP). Balance-
  checked (`grep -c "{name:"` = 461; brace/bracket counts both 462/462)
  and zero duplicate name+suburb+state combos found across the whole file.
- **Not yet done**: live smoke test of both changes — need to actually
  drag/zoom the globe and watch a lone marker (e.g. a Japan gym, viewed
  from the default camera) switch from numbered badge to hold icon
  around zoom 9, confirm clicking a numbered badge zooms in correctly,
  and confirm the new Japan chips/filter/add-edit country dropdown all
  work. Needs the same `python -m http.server` + browser check as the
  two tasks above.

### Add Canada and New Zealand, update About/Privacy/Terms copy
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as the tasks above — continued rather than starting fresh, same
  reasoning as before)
- Status: in progress (implemented + structurally verified; not yet
  smoke-tested live)
- What: user asked to add Canada and New Zealand to the map, then update
  the About/Privacy/Terms copy to reflect the new country coverage.
- **Countries added**, following the exact pattern used for Japan
  (`STATES_BY_COUNTRY` in `js/app.js`, chip rows + country `<option>`s in
  `index.html`, `--ca-*`/`--nz-*` colour vars + chip active-state rules in
  `css/style.css`, new spots in `js/data.js`):
  - **Canada**: 15 gyms across 4 provinces (Ontario/Toronto, British
    Columbia/Vancouver, Quebec/Montreal, Alberta/Calgary). Uses standard
    2-letter province codes (`ON`, `BC`, `QC`, `AB`) since — unlike
    Japan — Canada has a widely-known short-code convention, same as
    AU/US.
  - **New Zealand**: 9 gyms across 3 regions (Auckland, Wellington,
    Canterbury/Christchurch). Uses region/city names as `state` codes
    (`AUCKLAND`, `WELLINGTON`, `CANTERBURY`), same treatment as Japan,
    since NZ doesn't have an equivalent short-code convention.
  - Same lighter-touch sourcing as Japan: every gym name is real,
    confirmed by web search, but no individual gym page was opened to
    verify a street address — positions are neighbourhood/city-level from
    general geography, flagged per-entry in `notes`. Not exhaustive by
    design (e.g. Toronto/Vancouver/Montreal/Auckland all have more gyms
    than the 3-4 picked per city here).
- **Copy updated** for the now-5-country scope: `index.html`'s tagline,
  meta description, `og:description`, and the About-section and
  Terms-of-Service paragraphs that name the countries covered. The
  Privacy Policy modal was checked and doesn't name any countries — data
  collection, third parties, and removal-request text there is
  country-agnostic, so nothing needed changing there.
- Net result: 461 → **485 total spots** (77 AU + 352 US + 32 JP + 15 CA +
  9 NZ). Balance-checked (`grep -c "{name:"` = 485; brace/bracket counts
  both 486/486) and zero duplicate name+suburb+state combos found.
- **Not yet done**: live smoke test — need to confirm the new CA/NZ
  chips, filters, and add-spot country/state dropdown all work visually,
  and that the updated About/Terms copy reads correctly in the modals.
  Needs the same `python -m http.server` + browser check as the tasks
  above.

### Add China (Banana Climbing chain)
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as the tasks above — continued rather than starting fresh)
- Status: in progress (implemented + structurally verified; not yet
  smoke-tested live)
- What: user asked to use bananaclimbing.com and put it on the map. That
  site is the marketing site for Banana Climbing (香蕉攀岩), a real
  Chinese indoor bouldering chain — its "Our Locations" section lists
  every current gym directly (name, mall/district, city, climbing types
  offered, size), with a "28 GYMS NATIONWIDE" headline stat.
- **Security note**: the site also has a "Store Finder Tool" section
  explicitly marketed at AI agents — an `npm install -g climbing-go` CLI,
  an MCP server (`climbing-go mcp-serve`), a "Skill" install command
  (`npx skills add betly-ai/climbing-go`), and a public REST API pitched
  "for AI Agents & third-party integrations." None of this was installed,
  run, or called. It's unverified third-party code/API from a site this
  project doesn't control — a supply-chain risk regardless of how
  convenient it looks. Data was pulled the same way as every other
  source this session: reading the rendered page directly.
- **Data added**: all 28 currently-open locations (one listing was tagged
  `CLOSED` and several "coming soon" ones aren't open yet — both
  excluded; the remaining count matches the site's own "28 GYMS
  NATIONWIDE" stat exactly, which is a good sign the parse was accurate).
  Added `CN` to `STATES_BY_COUNTRY` in `js/app.js` using the 9 city names
  the site itself groups locations by (Shenzhen, Guangzhou, Shanghai,
  Hangzhou, Chengdu, Beijing, Wuhan, Changsha, Zhuhai) rather than
  provinces — more useful filter granularity, and it's the source's own
  categorization. Same file/pattern updates as every prior country
  addition: `index.html` (chip row + country `<option>` + About/Terms/
  tagline/meta copy), `css/style.css` (9 new `--cn-*` colour vars + chip
  rules), `js/data.js` (+28 spots).
- Unlike every prior pass, **this one is a complete single-brand
  snapshot, not a partial multi-source sample** — worth knowing since it
  reads differently from the "not exhaustive" framing used for every
  other country. Positions are still district/city-level (the site gives
  district and mall names, not lat/lng), flagged in each entry's `notes`.
  The site's "Lead Climbing"/"Top Rope"/"Auto-Belay" tags were mapped to
  this app's `top-rope` type; every location also has bouldering.
- Net result: 485 → **513 total spots** (77 AU + 352 US + 32 JP + 15 CA +
  9 NZ + 28 CN). Balance-checked (`grep -c "{name:"` = 513; brace/bracket
  counts both 514/514) and zero duplicate name+suburb+state combos.
- **Found and fixed a real layout bug while smoke testing**: with 6
  countries' worth of chips (45 total), `.sidebar-controls` grew to 847px
  tall — taller than a typical viewport's 818px sidebar — and had no
  `overflow`, so per flexbox's automatic-minimum-size rule it refused to
  shrink and forced its flex sibling `.gym-list` (`flex:1;
  overflow-y:auto`) down to **12px of visible height**, making the gym
  list effectively unusable below the fold. Not just cosmetic cramping —
  confirmed via `getBoundingClientRect()` measurements in a served copy
  before assuming it was fine. Fixed in `css/style.css`: gave
  `.sidebar-controls` its own `max-height:50vh; overflow-y:auto;
  flex-shrink:0`, so filters scroll independently and the gym list keeps
  a guaranteed real chunk of the sidebar (measured 251px on a 958px-tall
  desktop viewport, 318px on mobile 375×812 — both re-verified after the
  fix, both real, usable areas).
- Live-verified: China filter chip (Wuhan → 4 spots, matches), add-spot
  country/state dropdown lists all 9 CN cities, all 6 country section
  labels present in the sidebar, About/Terms modal text reads correctly
  with all 6 countries named, the layout fix confirmed on both desktop
  and mobile viewport sizes, no new console errors.

### Collapsible sidebar accordion, hide gym list, region labels, uniform numbered badges
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as every task above — continued rather than starting fresh)
- Status: in progress (implemented + verified live in a served copy; not
  yet smoke-tested by a human)
- What: four related UI requests in one message, direct fallout of the
  sidebar-overflow bug found and band-aid-fixed (50vh scroll cap) in the
  previous task:
  1. Make the country sections in the sidebar collapsible, and hide the
     gym list unless there's an active search.
  2. Add basic city/state labels to the map when zoomed out.
  3. Make the numbered singleton badges (from the "numbered markers at
     low zoom" task) look like real cluster badges when zoomed out,
     instead of being colour-coded by climbing type.
- **(1) Accordion + hidden list**: every country's `.chip-row` in
  `index.html` is now wrapped in `.country-group`, collapsed by default,
  toggled by clicking its `.country-label` (now a `<button>` for
  keyboard/screenreader access) — handled in the existing `#stateChips`
  click listener in `js/app.js` (checked first, before the chip-filter
  logic, so toggling a group never also changes the filter). A chip can
  be `.active` while its group is `.collapsed` (the row is just
  `display:none`), so the same click handler also toggles `.has-active`
  on the group when it contains an active chip, with a small colour/dot
  on the label so an applied filter doesn't silently vanish from view.
  The 50vh scroll cap from the last task stays on as a backstop for when
  several groups are expanded at once. `render()` in `js/app.js` now only
  builds the actual `#gymList` DOM when `searchTerm` is set; otherwise it
  shows a one-line "`N` spots shown on the map — search to list them
  here" placeholder.
- **(2) Region labels**: new `computeRegionCentroids()` in `js/app.js`
  averages the lat/lng of every currently-visible `(country,state)`
  group, recomputed in `rebuildClusterIndex()` whenever the filtered set
  changes. `paintMarkers()` paints a plain-text `.region-label` (no
  background, `pointer-events:none`) at each centroid that falls in the
  current viewport, using the human-readable name from
  `STATES_BY_COUNTRY` — same zoom window as the numbered badges
  (`< HOLD_ICON_ZOOM`), gone once real markers take over. Deliberately
  basic: no collision avoidance, so labels for nearby regions can
  overlap.
- **(3) Uniform numbered badges**: `buildSpotNumberMarker()` no longer
  sets `background: typeSwatch(...)` — it's now plain `.cluster-marker`
  styling (34px, matching a real cluster's smallest size tier), on
  request, so it's indistinguishable from an actual cluster while zoomed
  out except for reading "1".
- **Verified live** (served copy, `python -m http.server` + browser JS
  instrumentation — screenshots still don't composite in this sandbox):
  all 6 country groups collapsed by default; clicking a label expands
  without changing the filter count; clicking a chip inside filters
  correctly (NSW → 28) and sets `.has-active`; re-collapsing keeps
  `.has-active` and hides the row (`display:none` confirmed); searching
  "boulder" renders 85 real list items, clearing the search reverts to
  the placeholder; a monkeypatched single-feature test at zoom 5 near
  Hokkaido showed a 34px neutral-background numbered badge plus three
  region labels ("Tokyo", "Kanagawa (Yokohama)", "Hokkaido (Sapporo)")
  simultaneously in view; jumping to zoom 12 made all three region labels
  and the numbered badge disappear and the real hold-icon marker appear.
  Sidebar height re-measured on both desktop (958px viewport: controls
  463px / list 267px, all collapsed) and mobile (375×812: controls 406px
  / list 318px). No new console errors beyond the pre-existing,
  unrelated Supabase schema mismatch.
- **Not yet done**: an actual human look in a real, visually-rendered
  browser — same outstanding item as every task on this branch. Worth
  doing now: six tasks deep on one branch (globe/marker fixes → Mountain
  Project data → numbered markers + Japan → Canada/NZ → China → this),
  and this task specifically touches visual polish that JS instrumentation
  can measure but not really judge (does the collapsed accordion look
  right, do the region labels read cleanly against the globe, does the
  chevron rotate correctly).

### Add address field, Google Maps directions button, report-incorrect-info flow
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as every task above — continued rather than starting fresh)
- Status: in progress (schema + app feature implemented and verified live
  in a served copy; **address data itself is NOT populated yet** — see
  "Deliberately not done" below, this needs a scoping decision)
- What: user asked for three things under each location: (1) an address,
  double-checked for correctness, (2) a "get directions" button to
  Google Maps, (3) a "report incorrect information" button.
- **(2) Directions button** — shipped, needs no data backfill. Verified
  the URL format against Google's own Maps URLs docs
  (developers.google.com/maps/documentation/urls/get-started) rather than
  guessing: `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`
  with no `origin` (Maps fills the visitor's current location in
  automatically). Built from each spot's existing `lat`/`lng` — works for
  all 513 spots today regardless of whether they have an address on file.
  `directionsUrl()` in `js/app.js`, rendered as a link in `popupHtml()`.
- **(3) Report incorrect info** — shipped as a new, lightweight,
  moderator-reviewed flow, deliberately separate from the existing
  structured "Edit this spot" flow (a report is just free text about a
  problem, not a corrected-fields proposal):
  - New `reports` table in `supabase/schema.sql` (id, spot_id, message,
    created_at) — public insert (no auth required, same as adding/editing
    a spot), moderator-only select/delete. **The user needs to re-run the
    updated schema.sql in their Supabase SQL Editor** for this table (and
    the new `address` column, below) to exist on the live project — it's
    idempotent/safe to re-run per the file's own header, but this session
    can't run it against their live Supabase project itself.
  - New "Report incorrect info" link in the popup (`popupHtml()`) opens a
    small modal (`#reportModalBackdrop`, `index.html`) with a required
    textarea; submits to `reports`.
  - Extended the moderator "Pending review" panel (`renderPendingPanel()`,
    `js/app.js`) to also list open reports, each with "Dismiss" (deletes
    the report) and "Edit this spot" (closes the pending panel, opens the
    real edit-spot modal for that spot pre-filled, so a moderator can
    actually fix what was reported). `pendingReportsBadge` count and
    `loadPending()`/`refreshAfterModeration()` all extended to include
    reports alongside the existing pending-spots/pending-edits counts.
- **(1) Address field** — the *display and editing* half is shipped: new
  optional `address` column on `spots` and `pending_edits`
  (`supabase/schema.sql`), a "Street address" field in both the add-spot
  and edit-spot forms (`index.html`, `js/app.js`), and the popup shows it
  (`.popup-address`) when present. Flows all the way through
  submit/edit/revert/approve — verified with a served copy (address field
  present in both forms, empty for a spot with no address on file,
  correct placeholder text).
  - **Deliberately NOT done: populating an address for any of the
    existing 513 spots.** The user's ask was explicit that every address
    needs to be "double-checked to make sure it's correct" — that's a
    genuine per-spot verification effort, not something to guess at. Most
    of the existing seed data is already disclosed as city/suburb/
    district-level positioning, *not* an exact address (see "Seed data
    sourcing" in `docs/architecture.md` — this was an explicit, disclosed
    trade-off in every prior data-adding task this session, not an
    oversight). Backfilling and verifying 513 real addresses is
    comparable in scope to everything else done this session combined —
    this needs the user to say how they want it scoped (all at once /
    piloted on one country first / left to the community edit flow now
    that the field exists) before starting, the same way "Go exhaustive,
    accept the size" was confirmed before the original Mountain Project
    pass.
- **Also updated**: the Privacy Policy modal ("What we collect" / "How
  submitted information is used") to describe the new report-submission
  data path and that it's moderator-only, never public — and README's
  "Moderation" section and file-map line for the same reason.
- **Verified live** (served copy, browser JS instrumentation): directions
  link href matches the exact expected Google Maps URL for a real spot;
  report button opens the modal with the correct spot name, submit stays
  disabled until text is entered, cancel closes it; address field present
  and correctly empty/placeholder'd in both add and edit forms; no new
  console errors. **Not verified**: the actual Supabase round-trip for
  submitting a report or an address edit (this environment's Supabase
  project has a pre-existing, unrelated schema mismatch — its live
  `spots` table is missing `status`, so it was already falling back to
  offline seed data before this task) — Rules.md §7's "adding/editing a
  spot lands in pending" check needs a real Supabase project with the
  schema actually applied, which only the user can do.

### AU address-verification pilot (74 spots)
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as every task above — continued rather than starting fresh)
- Status: in progress (AU done and verified live; US/JP/CA/NZ/CN still
  have no `address` data — awaiting the user's decision on whether/how to
  continue, per the pilot they explicitly chose)
- What: after shipping the `address` field/directions-button/report-info
  feature (previous entry), the user was asked how to scope actually
  populating real addresses for the 500+ existing spots, given "double-
  checked to make sure it's correct" is a genuine per-spot verification
  effort. They chose: pilot one country (AU) first, review the result,
  then decide on the rest.
- **Method**: for every one of the 77 AU spots, searched for that specific
  gym by name + suburb, cross-checked the address against the gym's own
  website where possible (Yelp/Whereis/Localsearch/Google Maps snippets
  used to corroborate when no official site turned up first). No address
  was guessed — one spot (Southern Boulder, Hope Forest, SA) has no
  street number in any source and was deliberately left without an
  `address` rather than invented.
- **4 real data-quality problems found and fixed along the way** (not
  just missing addresses — genuinely wrong/stale data, exactly the kind
  of thing "double-check to make sure it's correct" was asking for):
  1. **Boulder Project** (Prahran, VIC) — multiple sources confirm it
     permanently closed 30 March 2024. Removed from `js/data.js` rather
     than given a fake current address.
  2. **BOUNCE Hendra** / **Urban Xtreme** (both listed at Hendra, QLD) —
     confirmed via bounceinc.com and urban-xtreme.com.au that BOUNCE
     Hendra *is* Urban Xtreme's current rebrand, same physical venue, not
     two gyms (our own data already had a "Formerly Urban Xtreme" note on
     the BOUNCE entry that contradicted the separate Urban Xtreme entry's
     "a different gym" note — an internal inconsistency this pass caught).
     Removed the stale "Urban Xtreme" duplicate, kept BOUNCE Hendra.
  3. **Rockface Northbridge** / **Rockface Balcatta** (WA) — confirmed via
     rockface.com.au that Rockface relocated from Northbridge to Balcatta
     ("took a break to relocate... now back in Balcatta"), not two
     current locations. Removed the stale Northbridge entry, kept Balcatta
     with its real address (7B Ledgar Rd).
  4. **Urban Jungle** (WA) — data said suburb `Spearwood`; the gym's own
     site and every current listing puts it in `Jandakot` (83 Solomon Rd)
     instead. Corrected the suburb and approximate lat/lng (exact
     geocoding of the new address wasn't done — see below).
  - Net effect: AU went from 77 → **74 spots**. Total dataset 513 → 510.
- **Also fixed in passing**: a pre-existing spelling inconsistency —
  "Dymonite North Wollongong" corrected to "Dynomite North Wollongong"
  to match the brand's own spelling (dynomite.net.au), consistent with
  the already-correctly-spelled "Dynomite Albion Park Rail" entry right
  next to it.
- **What "verified" means here, precisely**: every address was found via
  general web search/business listings, not by opening a mapping API to
  geocode it — so while the *address text* is real and cross-checked,
  the existing `lat`/`lng` pin positions were generally left as-is
  (already reasonably suburb-accurate from earlier passes) rather than
  recomputed from the new address, except for Urban Jungle where the
  suburb itself was wrong. If pixel-accurate pin placement ever matters,
  that would need an actual geocoding step, not just an address string.
- **Verified live** (served copy): 510 total spots, 74 AU, 73 with an
  `address` (Southern Boulder is the one exception), zero duplicate
  name+suburb+state combos, balanced braces/brackets, popup correctly
  displays a real address (checked against 9 Degrees Alexandria). No new
  console errors.
- **Not yet done**: US (352), JP (32), CA (15), NZ (9), CN (28) — 436
  spots — still have no `address` field populated. Waiting on the user
  to say how to continue (exhaustive / another pilot / leave to the
  community edit flow) before starting any of that.

### US address-verification pass (352 → 332 spots, complete)
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as every task above — continued rather than starting fresh)
- Status: **complete** for all 12 US states (AL, CA, CO, GA, IL, MA, NV,
  NY, TN, TX, UT, WA). JP/CA/NZ/CN still have no `address` data — not in
  scope for this task, awaiting a future decision.
- What: after the AU pilot above, the user said "Apply locations for the
  US." Same method as AU: every gym searched by name + suburb, address
  cross-checked against the gym's own site or multiple agreeing
  business-directory listings, nothing guessed. One commit per state on
  this branch, each documenting exactly what was found.
- **Efficiency note for future passes**: chain operators with a real
  "locations" page (Central Rock Gym, Movement, Touchstone Climbing,
  Hangar 18, Sender One, Mesa Rim, VITAL, The Gravity Vault) were pulled
  via `WebFetch` against that page — often several addresses in one
  call — rather than searching each location individually. Worked well
  for MA/NY (Central Rock Gym) and all of CA's chain gyms; some chain
  sites 403/404'd WebFetch (Touchstone, Hangar 18, VITAL's own domain)
  and fell back to per-location `WebSearch`.
- **This pass caught real data-quality problems in every state it
  touched, not just missing addresses** — full detail is in each state's
  commit message on this branch; the recurring pattern worth knowing
  about before trusting any Mountain-Project-sourced entry at face
  value: a chain acquires a local/independent gym, keeps operating the
  same physical address under the chain's brand, and the old
  independent-gym listing lingers in MP's directory as a phantom
  duplicate. Confirmed instances this pass, all merged into one entry
  under the current name (old entry removed, not left as a duplicate):
  - **NY**: The Cliffs at LIC → Movement LIC (Movement acquired The
    Cliffs chain); Steep Rock West → VITAL Climbing Gym – West Harlem.
  - **CA**: Planet Granite San Francisco → Movement – San Francisco
    (Movement/El Cap absorbed Planet Granite's whole chain in 2021); The
    Rock Gym (Signal Hill) and TruHold Climbing (Mission Viejo) both
    confirmed permanently closed, with Hangar 18 now operating at their
    *exact* street addresses; Vertical Hold Sport Climbing turned out to
    be a same-address duplicate of the already-listed "Vertical Hold"
    San Diego entry (Vertical Hold's own site lists only 3 real
    locations: San Diego, Poway, San Marcos/Solid Rock Gym).
  - **GA/TN**: Central Rock Gym absorbed Stone Summit and Summit
    Climbing/Yoga/Fitness locations — stale entries removed.
  - Plain confirmed closures (no successor gym) were removed outright:
    City Climbers Club (NY, 59th Street), 6 in TX, 1 each in CO/MA, 2
    each in AL/GA/TN.
  - A handful of Mountain-Project-sourced entries could not be confirmed
    to still exist under their listed name and were **flagged with an
    uncertainty note instead of being deleted or given a guessed
    address** (per `Rules.md` §1 — never guess either way on weak
    evidence): **Old Town Indoor Rock Climbing** (IL), **The Wall at
    Palisades** (NY — searches only surface ClimbZone Palisades at the
    same mall, no confirmed link), **The Climb'n Shop** (GA). These 3
    are the only US spots still without an `address`.
  - One gap from an earlier state commit in this same pass was caught
    and fixed while auditing the finished dataset: **Bouldering Project
    Somerville** (MA) had been renamed from Brooklyn Boulders Somerville
    but never got a street address at the time — filled in
    (`js/data.js:139`).
- **Environment note**: WebSearch has a session-level budget
  (`CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`, 200 by default) — hit
  mid-way through NY in the session that started this pass. The partial
  NY progress (18 of 42 gyms) was committed immediately rather than
  lost, and NY was finished in a later session once the budget had
  reset. Worth knowing if a future exhaustive pass this size needs more
  than one sitting.
- Net result: US went from 352 → **332 spots** (12 removed as confirmed
  closures/duplicates across the states above, 8 renamed/merged in
  place). Whole-file structural check after every commit (`node -e`
  eval + `grep -c "{name:"` + brace/bracket balance + duplicate
  name+suburb+state scan): final state is **490 total spots** (74 AU +
  332 US + 32 JP + 15 CA + 9 NZ + 28 CN), 491/491 braces and brackets
  balanced, zero duplicate name+suburb+state combos, only the 3
  intentionally-flagged US spots above missing an `address`.
- **Not yet done**: JP (32), CA-Canada (15), NZ (9), CN (28) — 84
  spots — still have no `address` field populated; out of scope for
  this task. Also still outstanding from every earlier task on this
  branch: an actual human smoke test in a real browser (`Rules.md` §7) —
  this environment can serve the site and instrument it via headless
  browser JS, but a human needs to open it and look before this whole
  branch is merged.

### Canada + Japan address-verification pass (47 spots, complete)
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as every task above — continued rather than starting fresh)
- Status: **complete**. NZ (9) and CN (28) still have no `address` data —
  not asked for in this task.
- What: user asked to verify Canada and Japan locations next. Same
  method as AU/US: every gym searched by name + city, address
  cross-checked against the gym's own site or multiple agreeing
  business-directory listings, nothing guessed.
- **Canada** (15 gyms — Toronto, Vancouver, Montreal, Calgary):
  - **Cliffhanger Climbing Gym** (Vancouver) was acquired by The Hive in
    2021 and now operates as "The Hive Heights" at the same address
    (670 Industrial Ave) — renamed in place, kept as a distinct entry
    from the already-listed "The Hive Bouldering Gym" (a different Hive
    location, 520 Industrial Ave — same operator, two real gyms).
  - **Bloc Shop** (Montreal) turned out to be a 3-location chain
    (Chabanel/Hochelaga/Mile-Ex) represented by one generic seed entry
    whose rough city-level coordinates didn't clearly match any single
    location. Rather than guess which one the original seed data meant,
    it was pinned to the flagship Chabanel address with a `notes` field
    disclosing the other two locations exist but aren't separately
    listed — same "flag the ambiguity" approach used throughout this
    whole address-verification effort.
- **Japan** (32 gyms — Tokyo, Osaka, Kyoto, Fukuoka, Aichi, Kanagawa,
  Hokkaido, Hyogo): the original Japan pass (see the "Numbered markers +
  add Japan" entry above) was explicitly lighter-touch than the AU/US/CA
  passes — gym names were confirmed but no individual gym page was
  opened to verify an address. Actually opening every gym's page this
  time surfaced **3 real suburb errors**, not just missing addresses:
  - **BETA Climbing Gym** — seed data said `Shibuya`; verified address
    is Shinjuku City (near Akebonobashi Station). Corrected suburb and
    `lat`/`lng`.
  - **HEADROCK CLIMBING GYM** — seed data said `Shinjuku`; verified
    address is Sumida City (near Kikukawa Station) — nowhere near
    Shinjuku. Corrected suburb and `lat`/`lng`.
  - **ROCKLANDS** — seed data said `Nakano`; verified address is
    Edogawa City / Kasai — the opposite side of Tokyo from Nakano.
    Corrected suburb and `lat`/`lng`.
  - **ZEN** (Yokohama) is also a multi-branch operator (4 locations
    across Kanagawa: Shin-Yokohama, Yurigaoka, Center-Minami, Kawasaki).
    Pinned to the Shin-Yokohama branch as the closest match to the
    existing "between Shin-Yokohama and Kawasaki" note, with the other 3
    disclosed in `notes` rather than guessed.
  - Two gyms (Rocky Bouldering Gym Shinagawa, B-PUMP TOKYO Akihabara)
    keep a station-name in their own branding even though they
    technically sit in a neighbouring ward (Minato, Bunkyo) — kept the
    gym's own branding as `suburb` with a clarifying note instead of
    "correcting" it away from how the gym markets itself, since that's
    what a visitor would actually search for.
- Net result: **490 total spots, unchanged** — this pass only added
  addresses and corrected suburb/lat/lng on already-existing entries, no
  additions or removals (unlike the AU/US passes, which found real
  closures/duplicates). Structural check (`node -e` eval): 491/491
  braces and brackets balanced, zero duplicate name+suburb+state combos,
  every CA and JP spot now has a verified `address`.
- **Not yet done**: NZ (9), CN (28) — 37 spots — still have no `address`
  field populated; not part of what was asked for this task.

### New Zealand + China address-verification pass (37 spots, complete)
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as every task above — continued rather than starting fresh)
- Status: **complete**. This finishes the `address` field for all 6
  countries in the dataset — nothing left unaddressed by scope, though
  9 China entries are deliberately flagged rather than given an address
  (see below).
- What: user asked to finish NZ and China. Same method as every prior
  pass: every gym searched by name + city, cross-checked against
  multiple sources, nothing guessed.
- **New Zealand** (9 gyms — Auckland, Wellington, Christchurch): all
  addresses verified cleanly.
  - "Willis Street Climbing Centre" renamed to **Faultline Climbing** —
    the gym actually operating at 235 Willis St (opened Feb 2024). The
    seed data's name looks to have been a generic placeholder from the
    original lighter-touch NZ pass, not a real prior gym name.
  - "HangDog"'s suburb corrected from generic "Wellington" to Alicetown,
    Lower Hutt — a separate city within the greater Wellington region.
- **China** (28 Banana Climbing locations, 9 cities): 19 verified, 9
  flagged instead of guessed — this pass hit real limits verifying a
  Chinese mall-chain through English-language search tooling that the
  AU/US/CA/JP passes didn't run into as often:
  - 2 Shenzhen entries (OCT PARK Happy Time, Joyful Ave) kept resolving
    to the same address as the already-listed Nanshan Houhai flagship
    or Kingdee location — likely duplicates from the original
    bananaclimbing.com parse (same "chain listing has phantom
    duplicates" pattern seen in the US pass), not independently
    confirmed as separate locations.
  - 1 Shanghai entry (Kerry Centre) has **three conflicting addresses**
    across sources with no way to tell which is current — flagged
    rather than picking one.
  - 1 Wuhan entry (Hang Lung Plaza) kept resolving to the Qincheng MixC
    World flagship's address instead of its own.
  - **2 suburb corrections** (with `lat`/`lng` updated to match):
    Chengdu ICD is confirmed Jinjiang District, not Wuhou; Wuhan's
    Qincheng MixC World flagship (~2,300sqm, Wuhan's largest indoor
    climbing space) is confirmed Wuchang District, not Dongxihu.
  - **3 entries show real closure/never-opened signals**: Changsha
    CapitaLand One shows as suspended (暂停营业) on a Chinese map
    listing; both remaining Hangzhou locations (Xixi Tianjie,
    Impression City Olympic) and the sole Guangzhou entry (Grantral
    Centre) don't appear in any recent city-by-city rundown of Banana
    Climbing's footprint, which consistently lists every other city in
    this dataset. None were deleted — the signal wasn't strong enough
    to call it a confirmed closure the way the US pass's closures were
    (Yelp's explicit "CLOSED" tag, or a same-address successor gym) —
    but all 3 are flagged with the specific reason rather than given a
    guessed current address.
- Net result: **490 total spots, unchanged** (corrections and address
  additions only, no removals this time — the China signals above were
  judged not strong enough to justify deletion, unlike the confirmed
  closures found during the US pass). Structural check (`node -e`
  eval): 491/491 braces and brackets balanced, zero duplicate
  name+suburb+state combos, all 9 NZ spots and 19 of 28 CN spots have a
  verified `address`.
- With this, the `address` field is now populated (or deliberately
  flagged) across every spot in every one of the 6 countries in the
  dataset — see `docs/architecture.md` "Seed data sourcing" for the
  consolidated picture.

### Legal doc fill-in, marker-hide-on-drag removal, About page + header Add-location button
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as every task above — continued rather than starting fresh)
- Status: in progress (implemented + verified live in a served copy; user
  had already run the app on localhost:8000 themselves before this — see
  "smoke test" note below)
- What: three small requests in one message, ahead of a possible domain
  purchase/launch:
  1. Fill in the Privacy/Terms placeholders — date and jurisdiction.
  2. Stop markers from disappearing while rotating the globe.
  3. Move About to a real page reachable from a header button, and add a
     prominent "+ Add a location" button to the header.
- **(1) Legal placeholders**: filled in "Last updated: 24 August 2026"
  (both Privacy and Terms) and "governed by the laws of New South Wales,
  Australia" in `index.html`. **The contact-email placeholder
  (`[your contact email]`, both modals) is still unfilled** — the user
  asked whether a placeholder is OK until the domain launches; agreed
  that's reasonable, but a real, actually-monitored email address is
  needed there (not a fabricated one) — waiting on the user to supply
  it before this is fully done.
- **(2) Markers no longer disappear on drag/rotate**: reverses part of
  the earlier "globe render perf" fix from earlier in this branch. That
  fix hid every DOM marker for the duration of any camera movement
  (`movestart`→`moveend`) to avoid visible lag with ~490 markers — but
  on the globe projection, dragging *is* how you spin it, so markers
  vanishing mid-drag read as broken. Removed the `is-moving` class
  toggling in `js/app.js` and the now-dead CSS rule in `css/style.css`.
  Markers now stay visible (briefly lagging the camera) during a
  drag/rotate instead of vanishing. See `docs/architecture.md` "Map"
  section for the full writeup.
- **(3) About page + header Add-location button**: new `about.html` —
  a real standalone page (not a modal), reusing `css/style.css` and the
  existing `.modal.info-modal` content styling with a small page-level
  CSS override block (the main stylesheet assumes the single-screen app
  shell — fixed height, `overflow:hidden` — which a normal scrolling
  page needs to override). Header (`.header-right` in `index.html`)
  gets two new buttons: "About" (links to `about.html`) and
  "+ Add a location" — the *same* `id="addBtn"` element moved up from
  the sidebar footer, so its existing click handler and pin-drop flow
  in `js/app.js` needed zero changes. Removed the now-dead
  `aboutModalBackdrop` markup and its `openAbout` wiring. Sidebar
  footer now holds only Privacy/Terms.
- **Note on "Add a location"**: this didn't need new pin-dropping
  logic — the existing add-spot flow already supported name + drop-pin
  (`dropPinBtn` → `startPlacing('add')` → click-the-map in
  `js/app.js`), so the ask was really about *making it prominent in
  the header*, not building new functionality.
- **Verified live** (served copy, `localhost:8000`, browser + JS
  instrumentation): About link navigates to `about.html`, full content
  renders, no console errors; "+ Add a location" in the header opens
  the same add-spot modal with all fields (name/suburb/country/state/
  address/type/notes/photo) and a working "Drop pin" button; simulated
  a map drag via dispatched mouse events and confirmed markers stay
  `visibility:visible` mid-drag with the map container never getting
  `is-moving`; both pages checked at 375px mobile width with no
  horizontal overflow; no new console errors on either page beyond the
  pre-existing, unrelated Supabase schema mismatch (see the "Add
  address field..." task entry above).
- **On the "does localhost:8000 count as the smoke test" question**:
  the user had already run the app on localhost:8000 themselves before
  asking for these three changes, but it wasn't confirmed which parts
  of `Rules.md` §7's checklist were actually exercised (globe
  rendering, drag/rotate feel, clustering, sign-in redirect,
  add/edit-lands-in-pending). Told them directly rather than assuming
  either way — running it is necessary but the specific checklist items
  are what make it count as the full smoke test.
- **Not yet done**: the contact email (see above); this branch (still
  40+ commits ahead of `master`, unmerged) still needs the same
  human-in-a-real-browser look that's been outstanding since the first
  task on this branch, before it's ready to merge/deploy.

### Add Shanghai/Beijing/Chongqing gyms from Dianping
- Branch: `fix/globe-render-perf-remove-outdoor-type` (same branch/worktree
  as every task above — continued rather than starting fresh)
- Status: **complete** for the 3 cities asked for; not extended to other
  Chinese cities already in the dataset.
- What: user asked to check Dianping (大众点评) for gyms to add in
  Shanghai, Beijing, and Chongqing (Chongqing had zero spots before this
  task). Dianping itself blocks automated fetches (redirects to a
  Meituan anti-bot verification page — confirmed directly, not assumed),
  so gyms were found via web search referencing Dianping listings and
  independently cross-checked against a second source each (a different
  article, map listing, or the gym's own coverage), same standard as
  every other address-verification pass on this branch.
- **14 new gyms added**, all with a verified address and types:
  - **Shanghai** (+5): Yanwu Kongjian (Rock Dance Space, Hongkou),
    Jinfeng Climbing 189 (Putuo, bouldering-only), Benchmark Climbing Gym
    (Putuo), Dayan Yuedong at Changfeng Joy City (Putuo — a combined
    indoor bouldering room + 17m outdoor lead wall on a mall's 5th
    floor), Climbing Factory (Baoshan — a converted former steel-factory
    warehouse).
  - **Beijing** (+4): Rock Time Climbing at Dawanglu (Chaoyang), Climbing
    Favorite Changying (Chaoyang, bouldering-only — could only confirm
    via one secondary source, flagged in its `notes`), Aopan Climbing
    (Haidian — the district's only international-standard speed wall),
    Haoshi Sports Climbing Space (Chaoyang, near 798 Art District,
    bouldering-only).
  - **Chongqing** (+5, new state added — city had zero spots before):
    Bashan Tiger Climbing Club (Nan'an), Jihuayuan Extreme Sports Center
    (Yubei/Longxing — a 2,110sqm indoor climbing hall inside a larger
    indoor ski/surf complex, described as China's largest), Scream
    Climbing at Guangdian Park (Yubei, bouldering-only), Black Ram
    Climbing Gym (Nan'an), Zhongti · Bihuwang Climbing Gym (Jiangbei).
  - Added `CHONGQING` to `STATES_BY_COUNTRY.CN` in `js/app.js`, a new
    `--cn-chongqing` colour var + chip active-state rule in
    `css/style.css`, and a new Chongqing chip in `index.html`'s China
    filter group — same pattern as every prior country/city addition.
- **One candidate deliberately skipped**: "768攀岩馆" / "All In Space"
  (Beijing, Haidian) — its address (768 Creative Park, Building D, Unit
  1, South Gate) is identical to the already-listed "Banana Climbing
  (Dongsheng Xiaoyuehe)" entry. Rather than guess whether it's a genuinely
  separate gym in the same complex or the same physical space under an
  older/alternate name, it was left out to avoid a likely duplicate.
- **One candidate deliberately excluded on scope grounds, not evidence
  grounds**: Huayan Climbing Park (Jiulongpo District, Chongqing) — a
  large (80,000sqm) outdoor artificial-wall park used for World Cup and
  national-team training. `docs/architecture.md` "Known gaps" already
  documents that outdoor bouldering/climbing was removed as a
  type/category entirely earlier on this branch (indoor gyms only now,
  23 outdoor-only seed spots deleted) — this park doesn't fit that
  scope, so it wasn't added even though it's real and well-documented.
- Net result: 490 → **504 total spots** (74 AU + 332 US + 32 JP + 15 CA +
  9 NZ + 42 CN). Structural check (`node -e` eval + `grep -c "{name:"` +
  brace/bracket balance + duplicate name+suburb+state scan): 504/504
  matched, 505/505 braces and brackets balanced, zero duplicates.
- **Verified live** (served via `npx serve .` on port 8000 — `python3`/
  `python` aren't on PATH in this environment, `npx serve` was used
  instead; browser + JS instrumentation, screenshots still don't
  composite in this sandbox): `window.SEED_GYMS.length` = 504 in the
  browser; all 5 Chongqing gyms present by name; the new Chongqing chip
  renders in the correct colour, expands/collapses with its country
  group, and correctly toggles `.active` + the map filter when clicked;
  no horizontal overflow in the China chip row at 375px mobile width; no
  new console errors beyond the pre-existing, unrelated Supabase schema
  mismatch.
- **Not yet done**: not extended to Guangzhou/Shenzhen/Hangzhou/Chengdu/
  Wuhan/Changsha/Zhuhai (already have Banana Climbing entries, but a
  Dianping pass the way Shanghai/Beijing/Chongqing just got could
  surface more independent gyms there too) — out of scope for what was
  asked. Same outstanding item as every task on this branch: a real
  human-in-a-browser smoke test before merge.

### Fix marker-lag-on-drag root cause + region-label overlap, fill contact email
- Branch: `fix/marker-lag-region-label-collisions` (new branch off `master`
  — the previous branch was merged and cleaned up before this task started,
  so this is the first task since the merge; per `Rules.md` §3-4 it gets
  its own branch rather than being committed straight to `master`)
- Status: in progress (implemented + verified live in a served copy; needs
  the same human-in-a-real-browser look as everything before it)
- What: three requests in one message: (1) markers visibly lag while
  rotating the globe, (2) state/prefecture/city labels look duplicated
  when zoomed in, (3) fill the Privacy/Terms contact-email placeholder
  with a real placeholder address.
- **(1) Marker drag lag — found a real, fixable CSS bug, not just the
  known unfixable one**: `.cluster-marker` (used for both real cluster
  badges and the numbered singleton badges shown below `HOLD_ICON_ZOOM`)
  had `transition:transform .15s ease` for its hover-scale effect — but
  this is the *exact same element* MapLibre repositions via inline
  `style.transform` on every render frame (it's the element passed
  straight into `new maplibregl.Marker({element: el})`). A CSS
  `transition` on a property applies to *any* change to that property,
  not just ones from `:hover` — so every single MapLibre reposition
  during a drag/rotate was being eased over 150ms instead of applied
  instantly, on top of the pre-existing (genuinely unfixable) WebGL/DOM
  sync gap. Since most markers visible while zoomed out to rotate the
  globe are exactly this `.cluster-marker` style, this was likely the
  dominant, visible chunk of the reported lag. Fixed in `css/style.css`
  by switching the hover feedback from `transform:scale()` to
  `filter:brightness()` — same visual hover cue, but on a CSS property
  MapLibre never touches, so it can't conflict with positioning.
- **(2) Region-label overlap — confirmed empirically before touching
  code, not assumed**: at the default world-zoom camera, measured actual
  DOM positions of Australia's 7 state labels (NSW/ACT/VIC/QLD/WA/SA/TAS)
  via `getBoundingClientRect()` — all 7 sat inside roughly a 40×40px box,
  fully overlapping/illegible, exactly what "duplicated" describes. Root
  cause: `computeRegionCentroids()` (added in an earlier task, see
  "Collapsible sidebar accordion..." entry above) always placed one label
  per `(country,state)` with its own comment already disclosing "no
  collision avoidance, dense regions can overlap" — this task closes that
  gap. Added basic label collision avoidance in `js/app.js`'s
  `paintMarkers()`: every in-view region's centroid is projected to
  screen space (`map.project`), candidates are sorted by their region's
  spot count (denser region wins a contested spot), and any candidate
  landing within 55px of an already-accepted label is skipped rather than
  painted. `computeRegionCentroids()` now also returns each region's spot
  `count` so the priority sort has something to sort by.
  - **Verified live** (served copy, JS instrumentation — a temporary
    `window.__debugMap = map` line was added to get a handle on the
    MapLibre instance for testing, then removed before committing, `git
    diff --stat` checked afterward to confirm nothing debug-only was
    left in): world-zoom label count for AU/US/JP/CN went from 44
    overlapping labels (7 of them crammed into one 40×40px box) down to
    4 legible, well-separated ones (California/NSW/Tokyo/Auckland — the
    biggest region in each cluster of contenders). Stepped through zoom
    3→8 centered on Sydney: NSW alone shows at low zoom, ACT correctly
    splits off into its own separate label once zoom 5 gives it enough
    screen space to stop colliding with NSW — confirms the collision
    logic reacts correctly to actual on-screen distance, not just
    geographic distance.
- **(3) Contact email**: filled in `3uphonium0104@gmail.com` as a real,
  clickable `mailto:` link in both the Privacy Policy ("Requesting
  removal") and Terms of Service ("Contact & jurisdiction") sections of
  `index.html`, replacing the `[your contact email]` placeholder in both
  — user confirmed this is fine as a placeholder until the real domain
  launches, but must be an actual address they monitor, not invented.
- **Verified live** (served copy, `python3`/`python` still not on PATH in
  this environment — served via `npx serve .`): both Privacy and Terms
  modals render the mailto link with the correct address and text; no
  new console errors beyond the pre-existing, unrelated Supabase schema
  mismatch; no horizontal overflow at 375px mobile width; `.cluster-marker`
  computed `transition-property` confirmed as `filter`, not `transform`.
- **Not yet done**: the residual, genuinely-unfixable WebGL/DOM
  positioning gap (documented in `docs/architecture.md` "Map" section)
  is still there — this task removed the *avoidable* CSS-introduced part
  of the lag, not the inherent one. Same outstanding item as every prior
  task: a real human-in-a-browser look before merging this branch.

### Re-run schema.sql live, discover stale Supabase seed data, fix seed.html
- Branch: `fix/marker-lag-region-label-collisions` (same branch/worktree as
  the task above — continued rather than starting fresh)
- Status: **seed.html itself is fixed and verified**; the user still needs
  to actually paste the generated SQL into their Supabase SQL Editor and
  run it — not done as of this entry, since only the user has access to
  their live Supabase project.
- What: this was a live troubleshooting thread with the user (not a
  pre-planned task), working through getting their actual Supabase project
  in sync with the app, one real error at a time:
  1. User re-ran `supabase/schema.sql` in their SQL Editor (per the
     project's own address-field/reports-table setup that had never been
     applied to their live project) and got Supabase's generic "destructive
     operation" warning. Read the full file to confirm nothing in it
     actually deletes data (no `DROP TABLE`/`TRUNCATE`/`DELETE`, just
     `create table if not exists`, `add column if not exists`, and
     paired `drop policy`/`drop constraint` + immediate re-create, which
     only touch access-control rules, not rows) — told the user it was
     safe to proceed, grounded in having actually read the file rather
     than asserting from the file's own "safe to re-run" header text alone.
  2. After the schema fix, user reported only AU markers showing on the
     map. Root cause: `supabase/seed.html` (the one-time script that
     pushes `js/data.js` into the live `spots` table) still had a comment
     saying "~70 starting spots" and had evidently only ever been run once,
     back when the dataset really was AU-only — every country added since
     (US/JP/CA/NZ/CN/Chongqing, now 504 spots total) was never pushed to
     the live database. Before the schema fix this was invisible, because
     Supabase was erroring out entirely and the app was silently using the
     *offline bundled* `js/data.js` fallback (which does have all 504) —
     so the user had been looking at fallback data without realizing it
     wasn't live. Also found and fixed in the same pass: `seed.html`'s
     upsert payload never included the `address` field at all, so even a
     re-run would never have pushed verified addresses into Supabase.
  3. User tried the fixed `seed.html` and got `new row violates row-level
     security policy for table "spots"`. This is `schema.sql`'s own
     moderation design working as intended, not a bug: the public anon key
     is only allowed to insert a spot as `status = 'pending'` (so a random
     site visitor can never insert a pre-approved row directly), but
     `seed.html` was trying to write already-approved rows using that same
     anon-key client. Confirmed via research (not assumed) that Supabase's
     SQL Editor runs as the `postgres` superuser and bypasses RLS entirely.
     First fix attempt: changed `seed.html` to build a one-off admin
     client using the project's `service_role` key, entered at runtime
     (never hardcoded/committed) — verified the request path worked end to
     end against the real project (a deliberately-wrong test key correctly
     came back with Supabase's own "Invalid API key," proving the
     URL/client wiring was right).
  4. That still failed: `Forbidden use of secret API key in browser`.
     Researched and confirmed this is a hard, deliberate security check on
     Supabase's side (not a bug or something a client-side workaround can
     get around) — Supabase's newer API key system flatly rejects any
     secret/`service_role`-class key when the request looks like it came
     from a browser (matched on `User-Agent`, returns 401), specifically
     to prevent the exact "paste the privileged key into a page" pattern
     just attempted. Confirmed this project is already on the new key
     format (`supabase-init.js`'s anon key is `sb_publishable_...`), so
     this restriction unconditionally applies — no way to make the
     browser-based approach work, full stop.
  5. **Real fix**: reworked `seed.html` entirely — it no longer calls the
     Supabase API at all. It now generates a plain SQL `insert ... on
     conflict (id) do update set ...` statement client-side from every
     `js/data.js` spot (proper single-quote escaping via doubling,
     `ARRAY[...]::text[]` literals for the `types` column) and displays it
     for the user to copy and run in the SQL Editor themselves — which
     bypasses RLS via the superuser-connection mechanism confirmed in step
     3, without ever putting a privileged key in a browser. `status` is
     set to `'approved'` on insert but deliberately left out of the
     `on conflict do update set` list, so a spot a moderator has since
     changed isn't silently reset back by a future re-run.
- **Verified live** (served copy): generated SQL contains exactly 504
  value rows (`grep -c "^\s*('"` equivalent via JS); last row has no
  trailing comma before `on conflict`; spot-checked an entry with a real
  apostrophe ("Sydney Uni's climbing club gym...") escapes to `Uni''s`
  correctly; spot-checked an entry with embedded double quotes (the
  Chengdu ICD `notes` field) passes through unescaped, which is correct
  inside a single-quoted SQL string; "Copy to clipboard" wrapped in
  try/catch with a manual-copy fallback message after it threw an
  uncaught `NotAllowedError` in this sandboxed test browser (a
  non-focused-document artifact of the test environment, not expected to
  happen in the user's own real, focused browser tab, but worth
  degrading gracefully regardless).
- **Done**: user ran the generated SQL in their SQL Editor. Confirmed live
  — the app now loads from Supabase with zero errors (previously always
  fell back to offline seed data), all 6 countries render on the map.

### Add outdoor bouldering type, fix mobile sidebar/legend, country-first labels
- Branch: `feature/outdoor-type-mobile-fixes-country-labels` (new branch
  off `master` — the previous branch is merged; not yet merged itself)
- Status: implemented + verified live in a served copy; not yet merged.
- What: six requests in one message — see the commit on this branch for
  full detail. Summary: removed the Privacy Policy's placeholder legal
  note (kept on Terms, not asked to remove there); updated both docs'
  date to 1 September 2026 and contact email to
  `climbatlas0104@gmail.com`; reverted the gym list to always render
  (previously hidden unless searching); added "outdoor bouldering" back
  as a third climbing type (removed earlier in the project, see
  `docs/architecture.md` "Known gaps") — filter checkbox, legend entry,
  add/edit-form checkboxes, reusing the leftover unused `--t-outdoor` CSS
  var; fixed a real mobile bug where the hamburger toggle became
  unclickable (covered by the open sidebar) by giving `.layout`
  `position:relative` so the sidebar's mobile `position:absolute`
  resolves against the right box instead of the viewport; made the map
  legend collapsible and collapsed by default on mobile; added a
  country-level label tier below a new `COUNTRY_LABEL_ZOOM` (5), so
  zoomed-out labels show country names before switching to state/city
  names at closer zoom — see `docs/architecture.md` "Map" section for
  the full mechanism.
- **Verified live**: gym list renders all 504 items; outdoor-bouldering
  checkbox present and wired through sidebar/add-form/edit-form; mobile
  toggle stays on top and clickable after opening the sidebar (confirmed
  via `elementFromPoint`) and closes correctly; legend starts collapsed
  at 375px width and toggles correctly; country labels
  ("United States"/"Australia"/"China"/"Japan") show at world zoom and
  correctly switch to city-level labels at zoom 5+; no mobile overflow;
  no new console errors.
- **Done**: also added a "fly to country" behavior on the same branch —
  clicking a country's sidebar label now calls `map.flyTo()` with a
  fixed, hand-picked `{center,zoom}` per country (`COUNTRY_FLY_TARGETS`
  in `js/app.js`), framing that country's actual spread of seed spots
  rather than its true geographic center (Canada's real center is in the
  Arctic, nowhere near its seed spots). Verified by intercepting
  `map.flyTo` directly, since this sandboxed browser throttles the
  animation's `requestAnimationFrame` loop in a background/automated
  tab — the call itself (center/zoom/duration) was confirmed correct for
  every country, which is what actually drives the camera.
- Merged into `master` and pushed to `github.com/spiary0104/climb-atlas`
  — live on `climbatlas.org` via Vercel's auto-deploy.

### Mobile modal fix, alphabetical countries, Saved tab, broader search
- Branch: `feature/mobile-modal-saved-tab-alpha-search` (new branch off
  `master` — previous branch merged; not yet merged itself)
- Status: implemented + verified live in a served copy; not yet merged.
- What: five requests in one message — see the commit on this branch for
  full detail. Summary:
  1. **Real mobile bug, not a design nitpick**: the add/edit-spot
     `.modal` had no `max-height`/`overflow-y` at all, unlike
     `.modal.info-modal` which already had both. On a short viewport its
     form content (872px measured) could exceed the visible area (713px)
     with literally no way to scroll down to Cancel/Submit — confirmed
     by measuring both before and after the fix, not assumed. Fixed by
     adding the same `max-height:88vh; overflow-y:auto;` pattern.
  2. Sorted the sidebar country groups and both country `<select>`s
     alphabetically (was addition order: AU, US, JP, CA, NZ, CN).
  3. Added a "Saved" header button next to About — reuses the existing
     Bookmarked filter/checkbox rather than a new page (checks the box,
     sets `showBookmarkedOnly`, opens the sidebar on mobile), prompting
     sign-in via toast if clicked while signed out.
  4. Removed the hardcoded "AU, US, JP, CA, NZ & CN" list from the
     header tagline, since the country list is expected to keep growing.
  5. Search now matches state/country too (code and human-readable
     label), not just name/suburb — verified "Japan" returns exactly 32
     and "chongqing" exactly 5, matching known per-region counts.
- **Done**: merged into `master` and pushed — live on `climbatlas.org`.

### Require sign-in + rate-limit new spot submissions; add UK and Germany
- Branch: `feature/signin-required-rate-limit-add-spot` (new branch off
  `master` — previous branch merged; not yet merged itself)
- Status: both parts implemented + verified in a served copy; not yet
  merged. The UK/Germany data isn't live yet even after merging — see
  below, it needs a re-seed step same as every prior country addition.
- **(1) Sign-in required + 10/day rate limit**, motivated by trolling
  risk on the now-public site. Real enforcement is server-side, in
  `supabase/schema.sql` — client-side checks alone can be bypassed by
  anyone calling the API directly:
  - Added `submitted_by` (uuid, references `auth.users`) to `spots`.
  - Broadened the SELECT policy so a signed-in user can see their own
    submitted rows regardless of status (needed for the rate-limit
    subquery and the client-side pre-check), without exposing other
    users' pending submissions to each other.
  - Replaced the anyone-can-insert-as-pending INSERT policy with one
    requiring `auth.uid() is not null`, `submitted_by = auth.uid()`
    (stops attributing a submission to someone else's account), and a
    `with check` subquery capping it at <10 rows from that same user in
    the last rolling 24h.
  - `js/app.js`: "+ Add a location" now checks `window.auth.user` first
    (toast + opens sign-in modal if signed out) and does a pre-check
    count query before opening the form, so someone who's already hit
    the cap is told immediately rather than after filling out the whole
    form — fails open (opens the form) if that query itself errors,
    since server-side RLS is the real backstop either way.
  - **Verified live**: clicking "+ Add a location" while signed out
    shows the toast and opens sign-in instead of the add-spot modal; no
    console errors. **Not verified**: the actual sign-in + submission-
    limit round trip, since this environment can't complete a real
    Supabase auth session — worth the user testing signed in once this
    ships.
- **(2) Added United Kingdom (66 gyms) and Germany (112 gyms)**, sourced
  from `mountainproject.com/gyms/united-kingdom` and `/gyms/germany` —
  directory-listing depth (name + county/city), not per-gym address
  verification, closer to the Japan/Canada/New Zealand "lighter touch"
  tier than the original AU/US pass. One UK listing excluded as a
  university rec-center wall (same criteria as AU/US); one ambiguous
  entry (The Ledge, Inverness) confirmed via search to be real. `state`
  uses the UK's 4 constituent nations and Germany's 16 federal states —
  full detail in `docs/architecture.md` "Seed data sourcing".
  - Net result: 504 → **682 total spots**. Structural checks all
    passed: `grep -c "{name:"` = 682, braces/brackets balanced
    (683/683, 684/684), zero duplicate name+suburb+state combos, every
    state code used has a matching `STATES_BY_COUNTRY` entry (checked
    programmatically), no console errors, Germany's 16-chip row doesn't
    overflow mobile width.
  - **Not yet live**: this is `js/data.js` (bundled seed data) only —
    confirmed directly that the live app is still pulling 504 spots
    from Supabase (`countNum` showed 504 on load; searching "Griffwerk",
    a real German gym in the new data, returned 0 against the live
    `spots` array). Needs the same re-seed step as every prior country
    addition: generate SQL via `supabase/seed.html`, run it in the SQL
    Editor. Also re-measured the sidebar height concern from the China
    task at 8 countries — see `docs/architecture.md` "Map" section,
    mobile now genuinely relies on the scroll backstop rather than
    comfortably fitting under it.
- **(3) Fixed the sidebar height growth for good** (asked for explicitly
  as a follow-up: "put something in place to resolve that as we add
  more"), rather than leaving it as a documented-but-unsolved concern.
  Added a region tier above the existing country accordion —
  `.region-group` for Asia/Europe/North America/Oceania in
  `index.html`, same collapse/`.has-active` mechanics one level up, in
  `js/app.js`. This changes the growth shape: adding a country to an
  *existing* region (the common case) now costs zero extra
  always-visible sidebar height; only a genuinely new region (bounded to
  a handful, ever) adds a row. Re-measured live: desktop ~463px → ~222px,
  mobile ~820px → ~428px (now fits the 50vh/406px cap in practice
  instead of relying on the scroll backstop to do real work). Verified
  region toggle, country toggle+fly-to-country still correct (intercepted
  `map.flyTo`, confirmed Germany's exact `{center,zoom}`), chip
  filtering, and `.has-active` now correctly propagating through *both*
  collapsed levels (country and region) — all still work after the
  restructuring, no console errors. Full detail in
  `docs/architecture.md` "Sidebar chip growth".

## Blocked

_(none)_

## Done (recent)

### Domain launch: climbatlas.org live via Vercel, Supabase fully wired
- Branch: `fix/marker-lag-region-label-collisions`, merged to `master`
  and pushed to `github.com/spiary0104/climb-atlas`.
- Summary: merged the marker-lag/region-label-collision/seed.html/
  Climb-Atlas-rename branch into `master`, pushed to a newly-created
  GitHub repo, deployed via Vercel (Framework Preset "Other", no build
  step), and attached `climbatlas.org` (canonical `www.climbatlas.org`,
  apex redirects to it) — DNS at Porkbun needed a plain A record
  (`216.198.79.1`) and a project-specific CNAME for `www`, not the
  generic legacy values first tried. Supabase's Site URL/Redirect URLs
  updated to the real domain. Ran the seed.html-generated SQL in the
  live project's SQL Editor — confirmed the app now loads live data with
  zero errors instead of falling back to offline seed data. Verified the
  moderator/pending-review pipeline end-to-end by finding and rejecting
  a real test submission via a direct Supabase query.
