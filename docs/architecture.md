# Architecture

This is a summary for quick orientation. `README.md` is the fuller,
canonical source (setup steps, moderation flow, deployment) — if this file
and `README.md` ever disagree, trust `README.md` and fix this file.

## Stack

Plain static site: HTML/CSS/JS, no build step, no framework, no
`package.json`. Backend is [Supabase](https://supabase.com) (Postgres +
Auth). Map rendering is MapLibre GL (not Leaflet) with hand-rolled
clustering via `supercluster`.

## File map

```
index.html             Page shell — header, sidebar, map container, the add/edit/report/privacy/terms modals
about.html              Standalone About page (real navigation, not a modal) — reuses css/style.css
css/style.css           All styling (dark "chalk & rock" theme, MapLibre GL overrides)
js/supabase-init.js     Creates the shared Supabase client — project URL/key live here
js/auth.js              Thin wrapper around Supabase Auth (magic link + Google)
js/data.js              The seed dataset — every gym/crag pin, as window.SEED_GYMS
js/app.js               Everything else: map rendering, filters, add/edit, marks
supabase/schema.sql      Run once in the Supabase SQL Editor — creates spots, pending_edits, reports, moderators, marks
supabase/seed.html       Run once in a browser — loads the spots table from js/data.js
manifest.json            Web app manifest (installability — name, icons, standalone display)
sw.js                    Service worker — offline caching for the app shell, map tiles, and Supabase reads
icons/icon.svg           The app icon used by manifest.json (same design as the browser-tab favicon, scaled up)
```

**Script load order in `index.html` matters**: Supabase JS CDN script →
`supabase-init.js` (defines `window.sb`) → `auth.js` (defines
`window.auth`) → `app.js`, which depends on both. Breaking this order
breaks the app silently (check the browser console). **`js/data.js` is
deliberately not in that chain any more** (redesign Stage G): it's
~600KB and only matters when Supabase is unreachable or when "Revert to
original" needs an edited seed spot's original values, so `app.js` loads
it on demand via `ensureSeedData()` (a one-shot script injection that
resolves to `window.SEED_GYMS`). `loadSpots()`'s fallback branch,
`openEditModal()` (for edited, non-community spots only) and the revert
handler await it; the other `window.SEED_GYMS || []` lookups are
best-effort fallbacks that already tolerate it being absent. The
one-off tools `supabase/seed.html` and `supabase/geocode.html` include
`data.js` directly and are unaffected. MapLibre is pinned to an exact
version (`5.24.0`, the build whose globe support was verified — see
"Map") rather than the floating `@5` tag, so a CDN-side minor bump can't
change rendering underneath the app.

## Data model

- **`spots`** — public read of `status = 'approved'` rows only (plus a
  signed-in user can also read their own `submitted_by` rows, whatever
  their status — needed for the rate-limit check below). Inserts are
  restricted to signed-in users (`auth.uid() is not null`), forced to
  `status = 'pending'` and `submitted_by = auth.uid()` by RLS — a
  tampered client can't insert a pre-approved row or attribute one to
  someone else — and capped at 10 per rolling 24h per account via a
  `with check` subquery counting that user's own recent submissions.
  `js/app.js` also does a client-side pre-check (same 10/24h count)
  before opening the add-spot form, purely for a clearer UX — the actual
  enforcement is the RLS policy, not the client check. Has an optional
  `address` text column (street address) alongside the always-present
  `suburb`/`state`/`country` — most seed spots don't have one yet (see
  "Seed data sourcing" below), but the add/edit forms and popup both
  support it. **Reads must page**: PostgREST caps a single response at
  1000 rows (Supabase's `max-rows` default), and it doesn't error — it
  just truncates. `loadSpots()` in `js/app.js` therefore pulls approved
  rows with `.order('id').range(from, to)` in 1000-row chunks until a
  short page comes back. Before this, the live map silently showed 1000
  of 1513 spots. Any future query that can return more than 1000 rows
  (a moderator's pending list won't, but a full-table read will) needs
  the same treatment.
- **`pending_edits`** — proposed edits to existing spots. The live `spots`
  row is untouched until a moderator approves; approving copies the
  proposed fields onto the live row and deletes the proposal.
- **`reports`** — free-text "something's wrong with this spot" messages,
  submitted via the popup's "Report incorrect info" link, insert-only for
  the public (RLS `with check (true)`, no auth required — same as adding/
  editing a spot). Not a structured edit proposal like `pending_edits`;
  moderator-only to read or delete, never shown on the public map. A
  moderator typically acts on one by using the existing "Edit this spot"
  flow themselves, then dismissing the report (deletes the row).
- **`moderators`** — accounts allowed to approve/reject. No public INSERT
  policy; adding a moderator is SQL-Editor-only by design (see README
  Setup step 7).
- **`marks`** — per-user "climbed" / "bookmarked" state. RLS restricts
  each user to their own rows regardless of what the client sends. Not
  moderated — private data, nothing to review.
- **`routes`**, **`sessions`**, **`session_climbs`** — the personal climbing
  logbook (header's "Logbook" button, gated behind sign-in same as marks).
  `sessions` is one diary entry per gym visit (date, mood, notes); each has
  zero or more `session_climbs` rows (type, grade, attempts, sent) via
  `session_id`, optionally pointing at a `routes` row (a gym's catalogued
  route/problem) via `route_id` — nullable, since most climbs are logged
  freeform (grade typed by hand) rather than linked to a catalogued route.
  Ownership for `session_climbs` is via its parent `sessions` row (no direct
  `user_id` column) since a climb only ever belongs to one session. `routes`
  is public-read with no moderation queue (unlike `spots`) — any signed-in
  user can add or edit one, since gym routes reset on a schedule the
  `spots` moderation model would be too slow for; `is_active` marks a route
  stripped from the wall without deleting history that points at it. Only
  `sessions`/`session_climbs` have UI so far (`js/app.js`'s
  `openLogbookModal`/`openAddSessionModal`) — `routes` has no add/browse UI
  yet, so every climb currently logged is freeform.

Every spot has both a `country` and a `state` field, and **`state` codes
are only unique within a country** (e.g. AU's `WA` vs US's `WA` are
different regions). Anything that filters, colors, or edits by state —
the chips in `index.html`, `STATES_BY_COUNTRY` in `app.js`, the RLS-safe
columns in `schema.sql` — keys off the `(country, state)` pair together,
never `state` alone. Now 84 countries deep (AU, US, JP, CA, NZ, CN, GB, DE,
FR, SE, NL, IT, BE, KR, ES, PT, AT, CH, PL, DK, FI, IE, NO, MX, BR, HU, GR,
CZ, IS, RO, HR, RU, BG, AR, PH, CO, CL, VE, IN, IL, ID, TW, ZA, EC, VN, LT,
RS, BO, IR, EE, MY, TH, UA, SK, CY, PA, PE, TR, LV, SG, BA, AD, AE, GE,
LU, SI, CR, KZ, BY, UY, SA, HK, EG, QA, KE, GT, AM, LB, JO, NP, ME, MN, OM, PY), same pattern each time — keep this in mind before adding an 85th. One collision
worth flagging: `US`'s state code for California is `CA`, and `CA` is
also the top-level country code for Canada — not a real ambiguity since
they're different object keys/fields (`STATES_BY_COUNTRY.US` contains
`['CA','California']` as a *state*, while `STATES_BY_COUNTRY.CA` is a
top-level *country*), but worth knowing before assuming a bare `"CA"`
string always means the same thing while reading this codebase.

**`STATES_BY_COUNTRY` now lists each country's real, complete set of
top-level divisions, not just the subset a seed-data pass happened to
touch.** Every earlier country addition populated `STATES_BY_COUNTRY`
with only the states/provinces/prefectures that pass's seed gyms actually
used (e.g. NL originally had 3 of its 12 real provinces) — fine for
*displaying* existing spots, but it silently capped what a community
member could pick in the add/edit-spot forms' state `<select>`
(`populateStateSelect()` builds its options straight from this list, see
"Where to look first" below). Fixed after a report that the Netherlands
dropdown had no way to select Noord-Brabant — audited and expanded every
country, not just the one reported: `US` now lists all 50 states + DC
(51, was 12), `JP` all 47 prefectures (was 8), `CA` all 10 provinces + 3
territories (13, was 4), `NZ` all 16 regions (was 3), `FR` all 13
metropolitan régions (was 4), `SE` all 21 counties/län (was 3), `NL` all
12 provinces (was 3, now includes Noord-Brabant), `IT` all 20 regions
(was 4). `AU` (8 states/territories), `GB` (4 constituent nations), `DE`
(16 Länder), and `BE` (3 regions) were already complete and left
untouched. `CN` is the deliberate exception — it intentionally keys on
city names rather than China's 34 provincial-level divisions (see
"Seed data sourcing" below for why), so it was widened from 10 to 31
major/provincial-capital cities instead of converted to provinces, which
would have required re-keying every existing CN spot's `state` value.
None of this touched any *existing* spot's `state` value or code — every
code a seed spot already used (e.g. `NL:UTRECHT`) is unchanged, this only
adds previously-missing options alongside them. It also deliberately did
**not** add sidebar filter chips or `--xx-yyy` CSS colour variables for
the newly-added, currently-empty divisions — chips are hand-authored per
`(country,state)` pair in `index.html` plus a colour var in
`css/style.css`, and building one for every new entry (dozens per
country) would re-open the sidebar-height problem "Sidebar chip growth"
below was written to solve, for divisions with zero spots to filter by.
A spot submitted in one of these newly-available-but-chipless divisions
still shows on the map and in search by default (`passesFilters()`
already shows everything when no chip is toggled) — same "no dedicated
filter UI yet" treatment already documented above for an `OTHER`-country
submission, just one tier down. Chip/colour support for a given
`(country,state)` pair should be added the same way it always has been —
once real spots exist there.

**The country `<select>` is grouped by continent with `<optgroup>`**,
not a flat alphabetical list — with 25 countries a single flat list had
gotten long enough to be worth splitting up. Groups (Asia, Europe, North
America, Oceania, South America) and their contents are hand-written in
`index.html` for both `#fCountry` and `#eCountry`, in the same order and
grouping as `COUNTRY_TO_REGION` in `js/app.js` and the sidebar's own
region-groups — there's no code that keeps these three in sync
automatically, so adding a country needs its `<option>` placed in the
matching `<optgroup>` by hand, same as every other per-country list in
this file. `<optgroup>` is purely a native HTML/CSS grouping — reading or
setting `select.value` behaves identically to a flat list, so none of
`js/app.js`'s country-handling code (`toggleOtherCountryFields()`,
`openEditModal()`'s fallback, the reset handlers) needed to change.

**Proposing a country not in the list**: the add-spot and edit-spot forms'
country `<select>` has an `OTHER` option ("Other (not listed)") for exactly
this — picking it swaps the `<select id="fState">`/`<select id="eState">`
for two free-text inputs (`fCountryOther`/`fStateOther`,
`eCountryOther`/`eStateOther` in `index.html`), and the submission stores
whatever the person typed directly as `country`/`state` (see
`getCountryState()` in `js/app.js`) rather than a short code. Nothing in
`schema.sql` restricts `country` to the known list — it's a plain `text`
column — so this needs no database change. The submission is still
signed-in + rate-limited + moderator-reviewed like any other spot; a
moderator sees the raw country name directly in the pending-review panel
(`(France)` etc.), which is self-explanatory without any extra flagging.
A country submitted this way has **no sidebar filter chip, colour, or
`STATES_BY_COUNTRY` entry** once approved — `passesFilters()` defaults to
showing every country when no chip is toggled, so the spot still appears
on the map and in search, just without dedicated filter UI, until someone
does the same one-country-at-a-time work (chip, colours, state list,
`COUNTRY_LABELS`) every other country in this file went through.
`openEditModal()` also handles the reverse case — editing an existing spot
whose `country` isn't a recognized key falls back to the `OTHER` fields
pre-filled with its current value, rather than throwing on
`STATES_BY_COUNTRY[country]` being undefined.

## Seed data sourcing

`js/data.js` currently has 1513 spots (74 AU, 332 US, 32 JP, 15 CA, 9 NZ,
374 CN, 66 GB, 112 DE, 30 FR, 7 SE, 25 NL, 14 IT, 14 BE, 37 KR, 22 ES,
7 PT, 22 AT, 8 CH, 31 PL, 14 DK, 14 FI, 9 IE, 20 NO, 16 MX, 15 BR, 18 HU,
13 GR, 8 CZ, 3 IS, 18 RO, 8 HR, 7 RU, 7 BG, 17 AR, 17 PH, 18 CO, 15 CL,
14 VE, 8 IN, 8 IL, 9 ID, 6 TW), all indoor gyms
(bouldering and/or top rope, with a growing number now also tagged
lead-climbing — see "Known gaps" below on why outdoor areas were
removed). It was built up in layers, not
from one source:

- The original AU set and the first US pass were researched and
  cross-checked gym-by-gym (see the in-app About section).
- A large batch (328 new gyms) came from an exhaustive pass over
  Mountain Project's `mountainproject.com/gyms/<state>` directory —
  covering all 8 AU states/territories and all 12 US states already in
  the app, not all 50 US states. MP's directory is noisy (university rec
  centers, YMCAs, generic fitness chains, gymnastics/kids facilities all
  get listed alongside real dedicated gyms), so every entry was filtered
  to genuine public climbing gyms, and every same-named or same-city pair
  was checked by address before being treated as a duplicate or a
  distinct location — see `docs/tasks.md` "Done"/history for the exact
  filter criteria and the duplicates that were actually caught.
- Positions from the MP pass are **city/suburb-level, not exact street
  addresses** (MP's gym pages expose an address but not lat/lng, and
  geocoding ~330 addresses individually wasn't done) — every such entry
  says so in its own `notes` field, so this is visible in the app, not
  just in git history. If a gym's exact address is ever looked up later,
  update its `lat`/`lng` and drop the caveat from `notes`.
- Mountain Project itself has essentially no coverage of Australia's
  indoor-gym scene beyond a plain directory page (unlike outdoor
  crag/route data, which is its actual specialty) and had no usable
  Japan data at all — its general site search wasn't useful for Japan
  gyms, and it has no `/gyms/japan` directory the way it does for
  AU/US.
- **Japan (32 gyms, 8 cities/prefectures: Tokyo, Osaka, Kyoto, Fukuoka,
  Aichi/Nagoya, Kanagawa/Yokohama, Hokkaido/Sapporo, Hyogo/Kobe)** came
  from general web search plus climbingjapan.com's gym directory (which
  itself only covers Tokyo/Osaka/Kyoto — the other five cities came from
  individual per-city searches). Every gym name is real and confirmed by
  at least one source, but this pass is **lighter-touch than the MP
  pass**: no individual gym page was opened to verify a street address
  the way every MP entry was, so positions are ward/neighbourhood-level
  from general geography rather than geocoded addresses — again flagged
  per-entry in `notes`. Japan uses prefecture/city names as its `state`
  codes (`TOKYO`, `OSAKA`, `KYOTO`, `FUKUOKA`, `AICHI`, `KANAGAWA`,
  `HOKKAIDO`, `HYOGO` — see `STATES_BY_COUNTRY.JP` in `js/app.js`), not
  abbreviations, since Japan doesn't have a widely-known equivalent to
  AU/US two-letter state codes. This pass is intentionally not
  exhaustive (Japan has 47 prefectures and Tokyo alone has 50+ gyms per
  the directory above) — treat it the same as the original, "not
  exhaustive" AU/US seed data, not as an MP-style complete sweep.
- **Canada (15 gyms, 4 provinces: Ontario/Toronto, British Columbia/
  Vancouver, Quebec/Montreal, Alberta/Calgary)** and **New Zealand (9
  gyms, 3 regions: Auckland, Wellington, Canterbury/Christchurch)** came
  from the same lighter-touch web-search approach as Japan — real, named
  gyms confirmed by search results, but no individual gym page opened to
  verify a street address, so positions are neighbourhood/city-level from
  general geography (flagged per-entry in `notes`). Canada uses standard
  2-letter province codes (`ON`, `BC`, `QC`, `AB`) since those are a
  widely-known convention, the same as AU/US; New Zealand uses region/city
  names (`AUCKLAND`, `WELLINGTON`, `CANTERBURY`) the same way Japan does,
  since NZ doesn't have an equivalent short-code convention either. Both
  are intentionally partial coverage, not exhaustive.
- **China (42 gyms, 10 cities: Shenzhen, Guangzhou, Shanghai, Hangzhou,
  Chengdu, Beijing, Wuhan, Changsha, Zhuhai, Chongqing)** was built in two
  layers:
  - The original 28 gyms are every currently-open location of one single
    chain, Banana Climbing (bananaclimbing.com), read straight from that
    site's own "Our Locations" list — not a multi-source sweep, so unlike
    every other pass this genuinely is complete for that one brand (the
    site's own "28 GYMS NATIONWIDE" stat matches exactly once its one
    `CLOSED`-tagged location and its not-yet-open "coming soon" ones are
    excluded). The site's "Lead Climbing"/"Top Rope"/"Auto-Belay" tags map
    to this app's `top-rope` type; every location also has bouldering.
    **Note**: bananaclimbing.com has a "Store Finder Tool" section that
    markets an npm CLI, an MCP server, and a "Skill" install command
    explicitly at AI agents, plus a public API "for AI Agents & third-party
    integrations." None of that was installed or invoked — it's unverified
    third-party code from a site this project doesn't control, so treat it
    as a supply-chain risk and keep pulling data by reading the page
    directly (as done here), not by running anything it offers to install.
  - A later pass added 14 more gyms across Shanghai, Beijing, and (newly)
    Chongqing, sourced by searching for gyms referenced on Dianping
    (大众点评) — Dianping itself blocks automated fetches (redirects to a
    Meituan anti-bot verification page), so each candidate was found via
    web search and independently cross-checked against a second source.
    One candidate ("768攀岩馆"/"All In Space", Beijing) was skipped as a
    likely duplicate of the already-listed Banana Climbing (Dongsheng
    Xiaoyuehe) entry — same building/unit address, no way to confirm it's
    a genuinely separate gym rather than the same space under an older
    name. One real venue (Huayan Climbing Park, Chongqing) was excluded on
    scope grounds, not evidence grounds — it's a large outdoor artificial-
    wall park, and outdoor venues were removed from this app's scope
    entirely (see "Known gaps" below).
  - `state` uses city names rather than a province grouping for the whole
    country (`SHENZHEN`, `GUANGZHOU`, `CHONGQING`, etc. — see
    `STATES_BY_COUNTRY.CN` in `js/app.js`), consistent across both layers.
  - Positions are still district/city-level, not geocoded exact
    coordinates, flagged per-entry in `notes` where the sourcing pass
    itself flagged something (an ambiguous address, an unconfirmed
    single-source find, etc.) — see `docs/tasks.md` for the full per-gym
    list from the Dianping pass.
- **United Kingdom (66 gyms) and Germany (112 gyms)** came from Mountain
  Project's own `/gyms/united-kingdom` and `/gyms/germany` directories —
  same source and method as the original AU/US pass, but at directory-
  listing depth only (name + county/city), not per-gym address
  verification, so this is closer to the Japan/Canada/New Zealand
  "lighter touch" tier: real gym names confirmed via the directory
  itself, positions are city/area-level from general geography, and
  climbing type is inferred from each gym's name (explicit "Boulder"/
  "Bloc" — a very common German bouldering-gym naming convention — means
  bouldering-only; otherwise assumed to also offer top-rope/lead) rather
  than individually confirmed. One UK listing (UoE Climbing Wall, a
  University of Edinburgh rec-center wall) was excluded on the same
  criteria as the original AU/US noise filter; one ambiguous-looking
  entry (The Ledge, labelled "Highland Council" in the directory) was
  confirmed via a targeted search to be a real, well-regarded dedicated
  gym, not a council leisure center. `state` uses the UK's four
  constituent nations (England/Scotland/Wales/Northern Ireland) and
  Germany's 16 federal states — Mountain Project's own German location
  labels are a mix of city names and Bavarian sub-region names (e.g.
  "Mittelfranken", "Oberbayern") that were individually mapped to their
  actual Land. **Unlike the other 6 countries, GB/DE don't have the
  `address` field populated** — that pass (below) predates this one.
- **The `address` field (added alongside the directions-button/report-
  spot features) is now populated (or deliberately flagged as
  unverifiable, see below) across all 6 countries in the dataset.**
  Given the scale of verifying 500+ real street addresses, the
  user chose to pilot one country (AU, 77 spots at the time) first, then
  after reviewing that result explicitly said "Apply locations for the
  US" (352 spots at the time, across the same 12 states as the Mountain
  Project pass). Both passes used the same method: every address checked
  individually against that gym's own website or multiple agreeing
  business-listing sources, never guessed — and both surfaced real
  data-quality problems the address-only framing wouldn't have caught on
  its own, not just missing addresses.
  - **AU** (77 → 74 spots): **Boulder Project** (Prahran, VIC) had
    permanently closed (removed); **BOUNCE Hendra** and **Urban Xtreme**
    (also listed at Hendra) turned out to be the same physical venue
    under its old and new branding, not two gyms (removed the stale
    "Urban Xtreme" duplicate); **Rockface Northbridge** and **Rockface
    Balcatta** were likewise the same gym after a relocation, not two
    locations (removed the stale Northbridge one); and **Urban
    Jungle**'s suburb was wrong (`Spearwood` → corrected to `Jandakot`,
    its actual current location). One AU spot (Southern Boulder, Hope
    Forest) has no `address` at all: no source gave a street number,
    only "at a winery near Hope Forest/McLaren Vale," so it was left
    blank rather than invented.
  - **US** (352 → 332 spots): the same "chain acquires local gym,
    Mountain Project keeps the old listing" pattern showed up repeatedly
    — confirmed permanent closures were removed outright (e.g. Central
    Rock Gym absorbing Stone Summit and Summit Climbing/Yoga/Fitness
    locations in GA/TN; City Climbers Club in NY; The Rock Gym and
    TruHold Climbing in CA, both now literally the same address as an
    existing Hangar 18 entry); confirmed rebrands/relocations were
    corrected in place rather than left as duplicates (The Cliffs at
    LIC → Movement LIC; Steep Rock West → VITAL Climbing Gym – West
    Harlem; Planet Granite San Francisco → Movement – San Francisco;
    Rockface-style relocations elsewhere); and a few Mountain-Project-
    sourced entries that couldn't be confirmed to still exist under
    their listed name were flagged with an uncertainty note instead of
    guessed or deleted (Old Town Indoor Rock Climbing, IL; The Wall at
    Palisades, NY; The Climb'n Shop, GA — 3 of the 332 US spots
    currently have no `address` for exactly this reason). Full per-state
    detail and sourcing is in the git log on this branch (one commit per
    state) and `docs/tasks.md`.
  - **Canada** (15 spots) and **Japan** (32 spots): same method again.
    Canada surfaced one acquisition (Cliffhanger Climbing Gym →
    "The Hive Heights", same address, kept distinct from The Hive's
    other Vancouver location) and one multi-location chain represented
    by a single ambiguous seed entry (Bloc Shop — pinned to its
    flagship Chabanel address with the other two Montreal locations
    disclosed in `notes` rather than guessed). Japan's original pass had
    been explicitly lighter-touch (gym names confirmed, addresses not
    individually verified) — actually opening each gym's page this time
    caught **3 real suburb errors**, not just gaps: BETA Climbing Gym
    (seed said Shibuya, actually Shinjuku), HEADROCK CLIMBING GYM (seed
    said Shinjuku, actually Sumida), and ROCKLANDS (seed said Nakano,
    actually Edogawa/Kasai — the opposite side of Tokyo). All three had
    both `suburb` and `lat`/`lng` corrected. ZEN (Yokohama) turned out
    to be a 4-branch chain, same treatment as Bloc Shop — pinned to the
    Shin-Yokohama branch, the others disclosed in `notes`.
  - **New Zealand** (9 spots) and **China** (28 spots) finished the
    set. NZ verified cleanly, with one rename ("Willis Street Climbing
    Centre" → **Faultline Climbing**, the gym actually operating at
    that Wellington address) and one suburb correction (HangDog is in
    Lower Hutt, not Wellington proper). China — 28 Banana Climbing
    locations across 9 cities — is where this whole address-
    verification effort hit its real limits: English-language search
    tooling against a Chinese mall-chain surfaced good results for 19
    of the 28, but **9 are flagged instead of given an address**,
    for three distinct reasons, each noted per-entry rather than
    guessed past: (1) likely phantom duplicates of an
    already-listed location (2 Shenzhen entries kept resolving to the
    Nanshan Houhai flagship or Kingdee's address; 1 Wuhan entry kept
    resolving to the Qincheng MixC World flagship's address); (2) a
    genuinely unresolvable conflict (1 Shanghai entry has three
    different addresses across sources with no way to tell which is
    current); (3) real but not fully confirmed closure/never-opened
    signals (1 Changsha entry shows as suspended on a Chinese map
    listing; 2 Hangzhou entries and the sole Guangzhou entry don't
    appear in any recent rundown of the chain's footprint, unlike every
    other city in the dataset). None of the 9 were deleted — the
    evidence wasn't as clear-cut as the confirmed closures found during
    the US pass (an explicit "CLOSED" tag, or a same-address successor
    gym) — but leaving a wrong address on a real, currently-open gym
    would be worse than a visible gap, so they were flagged instead.
    Two real suburb corrections came out of this pass too: Chengdu ICD
    is Jinjiang District, not Wuhou; Wuhan's Qincheng MixC World
    flagship (its largest indoor climbing space, ~2,300sqm) is Wuchang
    District, not Dongxihu — both with `lat`/`lng` updated to match.
  - **Positioning note carried over from the AU pilot still applies**:
    verifying an address didn't mean re-geocoding it — `lat`/`lng` were
    only touched where a spot's location was itself wrong (e.g. Urban
    Jungle's suburb, the 3 Japan suburb corrections, or the 2 China
    suburb corrections above), not routinely recomputed from the new
    address string.
  - **This is exactly the gap `supabase/geocode.html` exists to close**:
    a one-off browser tool (same pattern as `supabase/seed.html`) that
    re-geocodes every spot's already-verified `address` against
    OpenStreetMap's Nominatim, shows how far the result sits from the
    current pin, and lets a human accept/reject each correction before it
    generates SQL (for the live table) and a JSON diff (for `js/data.js`)
    — see `docs/tasks.md` "Add a geocoding tool..." and the README
    "Fixing pin positions" section. Not yet run to completion as of this
    writing — most positions in this dataset are still the original
    city/suburb-level estimate, not a geocoded street-level one, until
    that tool is actually run and its corrections applied.
- **Every selected sidebar chip was completely illegible until this was
  found and fixed.** Each per-`(country,state)` chip carries an inline
  `style="color:var(--xx-yyy)"` in `index.html`, so its dot and text
  preview that state's colour while inactive. `.chip.active` in
  `css/style.css` set `background` to that same colour but only set
  `color:var(--bg)` via a normal stylesheet rule — and an inline style
  always wins over an external stylesheet rule on the same property,
  regardless of selector specificity. So activating any chip changed its
  background to the state's colour but left the inline `color` — the
  *same* colour — untouched, making the text and dot exactly match the
  new background and disappear. The one chip that ever rendered
  correctly was `data-state="ALL"`, the single case with no inline
  colour (nothing to conflict with `.chip.active{color:var(--bg)}`) —
  which is almost certainly why this went unnoticed through every prior
  session: any smoke test that checked "does the active state look
  right" checked the All chip, never a real per-state one. Fixed with a
  scoped `color:var(--bg) !important` on `.chip.active` — the one
  legitimate use for `!important` in this file, since nothing short of
  it can out-rank a same-element inline style. Found by clicking a real
  state chip in a served copy and reading its actual computed
  `background-color`/`color` (both resolved to the identical value),
  not by inspecting the CSS source alone. Also added a plain
  `.chip:not(.active):hover{border-color:var(--text-dim)}` while in
  here — chips had no hover feedback at all before, unlike every other
  clickable control in the sidebar.
  **Superseded (redesign Stage B)**: the inline `color` is gone. Each
  chip now carries its region colour as a custom property instead —
  `style="--chip:var(--de-bayern)"` — and a single pair of rules reads
  it: `.chip{color:var(--chip, var(--text-dim))}` for the idle text/dot
  and `.chip.active{background:var(--chip, var(--text)); color:var(--bg)}`
  for the selected state. Because nothing inline sets `color` any more,
  the `!important` isn't needed, and the 232 per-`(country,state)`
  `.chip[data-country][data-state].active{background:…}` rules that used
  to mirror `index.html` are deleted. Adding a region's chip is now just
  the `index.html` line plus its `--xx-yyy` colour variable — no
  matching CSS rule. The chips themselves are `<button aria-pressed>`
  (Stage A), so they're keyboard-operable.
- **Sidebar chip growth has a real height ceiling — mitigated, not solved,
  by an accordion.** `.sidebar-controls` (`css/style.css`) — the search
  box plus every country's chip row plus type/marks filters — sits above
  `.gym-list` (`flex:1; overflow-y:auto`) in a flex column. At 6 countries
  (45 chips) fully expanded, `.sidebar-controls` is ~847px tall, taller
  than a typical sidebar; without its own `max-height`/`overflow-y`,
  flexbox's automatic-minimum-size rule keeps a visible-overflow block
  from shrinking below its content height, so it was forcing `.gym-list`
  down to a few px of visible height (found by actually measuring
  `getBoundingClientRect()` in a served copy, not by assuming the layout
  was fine). Two fixes now stacked on top of each other:
  1. `.sidebar-controls` still has `max-height:50vh; overflow-y:auto` as a
     hard backstop, in case a user expands most/all groups at once.
  2. Each country's chip row is now wrapped in `.country-group` and
     collapsed by default (`js/app.js`'s `stateChips` click handler
     toggles `.collapsed` on `.country-label` click) — see index.html's
     `#stateChips` markup. A chip can be `.active` while its group is
     `.collapsed` (the row is just `display:none`, the chip's own
     `.active` class is untouched), so the click handler also toggles
     `.has-active` on the group whenever any of its chips are active, and
     `.country-group.has-active .country-label` gets a colour + dot so an
     applied filter never silently disappears from view just because its
     group is collapsed.
  With everything collapsed by default, `.sidebar-controls` measured
  ~463px on desktop / ~406px on mobile at 6 countries (vs. 847px fully
  expanded) — **adding a country still adds one more collapsed label row
  (~30px), not another full expanded chip row**, so this scales far
  better than the flat chip-row layout did. That held up to 6 countries,
  but re-measured at 8 (adding GB/DE) mobile hit ~820px of content
  against the 406px (50vh) cap — still technically fine (the cap's
  `overflow-y:auto` backstop is genuinely scrollable, confirmed, not a
  hard cutoff), but the per-country cost was still `O(countries)`, just
  with a smaller constant than the original flat layout, so it would
  keep growing indefinitely as more countries got added.
  3. **Regional grouping**, added when this became a real problem instead
     of a hypothetical one: one more accordion tier above `.country-group`
     — `.region-group` (Asia, Europe, North America, Oceania in
     `index.html`'s `#stateChips`, same collapsed-by-default/`.has-active`
     mechanics as `.country-group`, handled by the same `stateChips` click
     listener in `js/app.js` checking `.region-header` before
     `.country-label`). This changes the growth shape entirely: adding a
     country to an *existing* region (the common case — most future
     additions are more cities in a country map already covers, or a new
     country on a continent already represented) costs **zero** extra
     always-visible height, since it nests inside that region's own
     already-collapsed body. Only a genuinely new region — rare, bounded
     to a handful total (this app will realistically never need more than
     6-7: the inhabited continents) — adds a row. Re-measured after this
     change, still at 8 countries: desktop ~222px (down from ~463px),
     mobile ~428px (down from ~820px, and now fits the 406px cap on its
     own in practice, just barely over in the worst case rather than
     needing the scroll backstop to do real work). `has-active` now
     propagates two levels — a filter applied inside a collapsed country
     inside a collapsed region still shows the colour+dot at *both*
     levels, not just the inner one, checked live after the change.
- **The gym list always renders the full filtered set.** An earlier
  version hid it unless there was an active search term (to save render
  cost at 500+ spots), showing a one-line placeholder instead — reverted
  per explicit request to always show the list. `render()` (`js/app.js`)
  builds every filtered spot as a `.gym-item` regardless of `searchTerm`
  now; the placeholder only appears when the filtered set is genuinely
  empty ("No spots match").
- **France (30 gyms), Sweden (7), Netherlands (25), and Italy (14)** —
  the 9th through 12th countries — came from a different kind of source
  than any prior pass: **climbing-gyms.com**, a directory site with its
  own per-city listing pages (`/browse/europe/<country>/<city>`) that
  expose a real street address per gym, not just a name. Given the scale
  (France alone lists 150+ cities), this pass is deliberately **not
  exhaustive** — same trade-off as every "lighter touch" country before
  it — scoped to each country's 3-4 largest cities by the site's own gym
  count: Paris/Lyon/Marseille/Toulouse (FR), Göteborg/Stockholm/Malmö
  (SE), Amsterdam/Den Haag/Utrecht/Rotterdam (NL), Roma/Milano/Modena/
  Firenze (IT).
  - **Positioning is a step up from the directory-only tier (GB/DE)**:
    every gym's real street address (as given by the source) was
    individually geocoded against OpenStreetMap's Nominatim — the exact
    same tool/method as `supabase/geocode.html`, run here as a one-off
    Node script instead of the browser tool since there was no existing
    pin to compare against. 71 of 76 addresses matched; the other 5
    (4 genuinely unmatched addresses, plus one gym — Altissimo Toulouse
    Saint Martin — for which the source gave no street address at all)
    fall back to another already-geocoded gym's position in the same
    city, flagged in that spot's own `notes`. This was **not**
    independently cross-checked against a second source the way the
    AU/US address-verification passes were (no per-gym web search) —
    treat it as "real address, geocoded once," not "verified."
    **Update**: the Netherlands' 25 spots have since had that follow-up
    cross-check done (2026-09) — every NL gym's address was independently
    confirmed via web search (its own site, a listing, or both) as a
    real, currently-operating gym, not just a Nominatim match. Re-geocoding
    all 25 against Nominatim again also confirmed every stored pin sits
    within 50m of the address's true position, so the original one-off
    geocoding pass held up. No closures or wrong addresses found. One
    non-issue surfaced and documented in both spots' own `notes`: **Beest
    Boulders - Den Haag Hollands Spoor** and **De Klimmuur - Den Haag
    Hollands Spoor** share one building at Waldorpstraat 15 next to the
    station — confirmed via search to be two genuinely separate
    businesses (a bouldering hall and a rope-climbing hall) under one
    roof, not a duplicate listing.
    **Update**: FR (29 addressed spots, excluding the one with no address
    at all), SE (7), IT (14), and BE (14) — 64 spots — have since had the
    same follow-up pass (2026-09): re-geocoded against Nominatim and each
    gym independently confirmed real/current via web search. This caught
    three genuine errors the original one-off geocoding pass missed,
    because the errors were in the address text itself, not something
    re-running the same broken address through Nominatim again could
    surface:
    - **A.S.D. Stone Monkey** (Firenze, IT) — stored address had a typo
      ("Alesso" for "Alessio", missing the "a" suffix on the house
      number) that kept it from geocoding at all. Corrected against the
      gym's own site (stonemonkey.it) and re-geocoded — moved the pin
      **~4.8km** to the correct Isolotto/Monticelli area of Florence.
    - **Boite A Grimpe - Marseille** (FR) — stored postal code was wrong
      (13012, corrected to the real 13008, confirmed via search) — still
      doesn't geocode even fixed (Nominatim has no coverage of this
      street at all, confirmed by testing several query variants), so
      the position stays a same-city fallback as before, just with the
      corrected address text now on record for whenever this street
      does get mapped.
    - **"Bouldering" (Stockholm, SE)** — the source directory gave a
      generic name; confirmed via search this is the gym's actual name
      ("Bouldering Stockholm"/"Bouldering STHLM"), not a data error, and
      renamed for clarity.
    60 of the 64 needed no changes at all — addresses matched Nominatim
    within 0-500m and every gym confirmed real and current, Belgium
    included (added this same session, previously geocoded-at-add-time
    but not yet independently web-searched for real-world existence
    until now).
  - **Climbing type inferred from chain/name recognition, not
    individually confirmed** — the source lists a name and address only,
    no facility type. Chains researched and applied consistently: Arkose,
    Block'Out, and Bolder/Boulderhal/Boulder-branded gyms (bouldering-
    focused naming convention, same heuristic used for DE) → indoor
    bouldering only; Climb Up (confirmed via search as France's largest
    chain, offering bouldering + top-rope + lead climbing on real bolted
    routes) → tagged with the **new `lead-climbing` type** (added earlier
    this session) for the first time on any spot in this dataset,
    alongside indoor bouldering and top-rope; Movimento Verticale Roma
    similarly tagged with lead climbing since the source's own Italian
    description ("arrampicata sportiva") is literally "sport climbing,"
    i.e. lead. Everything else defaults to indoor-bouldering + top-rope,
    the same conservative default used for unconfirmed DE/GB gyms.
  - `state` uses each country's real administrative regions (Île-de-
    France, Auvergne-Rhône-Alpes, etc. for FR; Swedish "län"; Dutch
    provinces; Italian regions) rather than a made-up grouping — the
    source's own address strings named the region directly for most
    entries, the rest (Lyon, Marseille, Malmö, Utrecht) filled in from
    well-established general knowledge (e.g. Lyon is the seat of
    Auvergne-Rhône-Alpes), not individually looked up.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition; needs `supabase/seed.html`'s generated
    SQL run in the SQL Editor before these 76 spots are visible on the
    live map rather than just the offline `js/data.js` fallback.
- **Belgium (14 gyms, 4 cities)** — same climbing-gyms.com source and
  method as FR/SE/NL/IT, scoped to its 4 largest cities by the site's own
  gym count: Antwerpen (5), Gent (4), Liège (3), Bruxelles (2). All 14
  addresses geocoded cleanly against Nominatim on the first try — no
  fallback positions needed, unlike every prior climbing-gyms.com pass.
  Type inferred the same way: the source explicitly tagged Gent's 4 gyms
  and Antwerp's "Beest Boulders"/"Boulderzaal" pair as bouldering-only
  (kept as given), Antwerp's 3 "Klimzaal" gyms as "Climbing/Bouldering"
  (kept as bouldering + top-rope), and Bruxelles's Arkose Canal is the
  same bouldering-only Arkose chain already confirmed during the France
  pass. `state` uses Belgium's 3 real top-level regions (Flanders,
  Wallonia, Brussels-Capital) — Antwerpen/Gent are in Flanders, Liège in
  Wallonia, Bruxelles is its own region, all given directly in the
  source's own address strings. Not yet pushed to the live Supabase
  table.
- **South Korea (37 gyms, 10 regions)** returned to a Mountain Project
  directory pass (`/gyms/south-korea`), the same source/method as the
  original AU/US/UK/DE work, since MP happens to have decent Korea
  coverage unlike its gap for Japan. One listing (Pangyo Park Artificial
  Wall) was excluded after its own gym page described it as an outdoor
  public-park climbing structure, not a commercial gym — same "not a real
  gym" exclusion criteria as the original AU/US noise filter. Three
  listings whose names reference a specific university (Do Climbing
  Kyungsung/Pukyong National University, Rock Odyssey Dong-eui
  University, Waverock Pusan National University) were kept rather than
  excluded as campus rec-center walls — each was individually checked
  (a commercial phone/website/booking presence, and for Waverock PNU, its
  own `waverock.co.kr/pnu` public class-booking subpage found via search)
  and confirmed to be a normal public-facing franchise location merely
  named after or sited near the university, not a restricted student-only
  facility, with a note on each spot disclosing this reasoning.
  - **Positions individually geocoded** the same way as the FR/SE/NL/IT
    pass — 32 of 37 addresses matched Nominatim directly; the other 5
    (Ayers Rock Climbing Gym, B.bloc Climbing Songdo, Cl!mben Climbing
    Company, King Kong Climbing, Monta Rex) didn't resolve at street level
    — for 4 of those a simplified district-level version of the same
    address did resolve, and the last (Ayers Rock, Seoul) falls back to
    another matched gym in the same Songpa-gu district — all flagged in
    that spot's own `notes`.
  - **Climbing type not given by Mountain Project for any Korea listing**
    (unlike its AU/US listings, which at least implied type via gym
    category) — every spot defaults to indoor-bouldering + top-rope, the
    same conservative default used for unconfirmed DE/GB/FR-tier entries,
    except B.bloc Climbing Songdo (bouldering-only, "bloc" in the name).
  - `state` uses South Korea's real top-level administrative divisions —
    the six special/metropolitan cities that have a seed spot (Seoul,
    Busan, Incheon, Daegu, Gwangju, Ulsan) plus the provinces that do
    (Gyeonggi-do, Gyeongsangnam-do, Jeollanam-do, Chungcheongnam-do) —
    rather than a made-up grouping, consistent with how FR/SE/NL/IT used
    each country's real regions. Busan alone accounts for 13 of the 37
    gyms (a genuine concentration in MP's own Korea listings, not a
    sourcing artifact).
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Spain (22 gyms, 2 cities), Portugal (7, 3 cities), Austria (22, 4
  cities), and Switzerland (8, 4 cities)** — the 15th-18th countries —
  returned to climbing-gyms.com, same source/method as the France/Sweden/
  Netherlands/Italy/Belgium passes. Spain was scoped to Madrid (14) and
  Barcelona (8) only — the site's own Burgos and Alcorcón city pages
  both 404, so the "top 4 cities" pattern used for every prior
  climbing-gyms.com country wasn't achievable here; 2 real, working
  cities was judged a solid-enough batch on its own rather than forcing
  a workaround. Portugal's "top 4" is genuinely a top 3 (Lisboa, Coimbra,
  Porto) — the 4th-place tier is a long tie at 1 gym each with no clear
  next city. Switzerland's per-city gym counts are unusually fragmented
  (mostly 1 gym per small town, no city standing out) — many cities tied
  at 2 gyms each; picked the four largest by population among that tied
  group (Zürich, Basel, Bern, Winterthur) rather than an arbitrary
  4-of-many-ties selection.
  - **Positions individually geocoded** the same way as every
    climbing-gyms.com pass — 57 of 59 addressed spots matched Nominatim
    directly. **Arkose - Madrid** and **Boulder Madrid** didn't resolve
    even after retrying several query variants (Nominatim has no
    coverage of either street) — both independently confirmed real via
    web search (Arkose's own Cuatro Caminos location, Boulder Madrid's
    own site) and fall back to the nearest confirmed metro station's
    position instead of a guessed address-level point. **The North Wall
    - Porto** has no street address at all in the source directory (like
    Altissimo Toulouse Saint Martin in the France pass) — falls back to
    São Rock - Porto's position, flagged in `notes`.
  - **One pair merged rather than kept as two spots**: the source listed
    both "Boulderhalle Salzburg" and "Kletterhalle Salzburg" at the
    identical address (Wasserfeldstraße 23) — unlike the Den Haag
    Hollands Spoor case in the Netherlands (confirmed there as two
    genuinely separate businesses sharing a building), a web search here
    confirmed the "Boulderhalle" is the bouldering room *inside* the
    Kletterhalle, accessed through its entrance, not an independent
    business. Kept as a single `Kletterhalle Salzburg` spot with
    `types:[indoor-bouldering, top-rope]` rather than double-pinning the
    same physical entrance.
  - **Climbing type inferred from name/chain recognition**, same
    conservative heuristic as DE/GB/FR: names containing "Bloc"/
    "Boulder"/"Bulder" in any of Spanish, German, or their English
    cognates (Bloc District, Monobloc, Uuadibloc, Boulderbar, BLOC house,
    Blockfabrik, Minimum, ELYS Boulderloft, BoulderBad Muubeeri,
    Blockfeld, etc.) → indoor-bouldering only; names suggesting a rope-
    climbing hall ("Kletterhalle", "Kletteranlage", "Kletterzentrum",
    "Rocódromo", "Rocòdrom") or with no clear bouldering-only signal →
    bouldering + top-rope default. Arkose reused its already-confirmed
    bouldering-only classification from the France pass.
  - `state` uses each country's real top-level divisions (Spain's
    autonomous communities, Portugal's districts, Austria's federal
    states, Switzerland's cantons) — same as every other country's
    entry in `STATES_BY_COUNTRY`, and, per the state-list-completeness
    fix above, populated with the *complete* real set for all four from
    the start (19/20/9/26 respectively) rather than only the divisions
    these seed spots happen to use, so this doesn't reintroduce the same
    gap the NL report caught.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Poland (31 gyms, 4 cities), Denmark (14, 4 cities), Finland (14, 4
  cities), and Ireland (9, 5 cities)** — the 19th-22nd countries — same
  climbing-gyms.com source/method as the prior European batches, third
  tier of the "add more countries" ask. Norway was deliberately **not**
  added in this pass — climbing-gyms.com's own Norway page lists only 2
  gyms total, both in the same Bergen metro area (Kokstad, Laksevåg), too
  thin to represent a whole country; flagged in `docs/tasks.md` Backlog
  for a proper web-search-based pass instead, the same tier as Mexico/
  Brazil.
  - Poland: Warszawa (11) + Wrocław (8) + Kraków (7) + Poznań (5) = 31.
  - Denmark: København (7) + Odense (4) + Aarhus (2) + Aalborg (1) = 14.
  - Finland: Helsinki (8, after one merge below) + Lahti (2) + Oulu (2) +
    Tampere (2) = 14.
  - Ireland: scoped differently from every prior climbing-gyms.com
    country — rather than "top 4 cities," this pass took *every* city
    the source listed for Ireland (8 city pages), since the country's
    real distribution is one dominant city (Dublin, 5 gyms including a
    Finglas outpost) plus a long tail of 1-gym towns, not a clean top-4.
  - **Three exclusions applied, same filter criteria as the original
    AU/US Mountain Project pass**: **Galway Climbing Coop** is explicitly
    members-only, not a normal public-facing gym — excluded. **Mardyke
    Arena UCC** (Cork, University College Cork's rec center) has
    ambiguous public-access terms for its climbing wall specifically
    (confirmed free for UCC students, but general-public PAYG access to
    the wall itself isn't clearly confirmed) — excluded on the same
    "can't confirm it's public" caution as the original filter, unlike
    the Korea university-named gyms (which *were* individually confirmed
    public and kept). **"Unique Ascent"** was listed under Dublin by the
    source but turned out via search to be a real outdoor sea-cliff
    climbing guide company based in Donegal, not an indoor gym at all,
    and not actually in Dublin — excluded rather than guessed into a
    location. One kept despite looking similar: **UL Sport Climbing
    Wall** (University of Limerick) was individually confirmed via search
    to be genuinely open to the public (with student/staff discounts),
    so it was kept, disclosed in its own `notes` — same treatment as the
    Korea university gyms.
  - **One pair merged rather than kept as two spots**, same pattern as
    the Salzburg case above: Helsinki's **"KiipeilyAreena Salmisaari"**
    and **"Salmisaari Sports Center"** shared an address — confirmed via
    search that Salmisaari Sports Center is the multi-sport building
    that houses the climbing arena as one venue inside it, not a second
    independent gym, so only the actual climbing venue was kept.
  - **Positions individually geocoded** — 65 of 68 addressed spots
    matched Nominatim directly (2 short retries fixed Polish street-name
    abbreviation issues and a UK-style city suffix on the Cork query).
    Two spots had no address in the source at all (Kiipeilyareena -
    Kalasatama, Helsinki; Gravity Climbing Centre, Dublin) — both fall
    back to another gym's position in the same city, flagged in `notes`.
  - **Climbing type inferred from name/chain recognition**, same
    heuristic as every prior pass — "Boulder"/"Bulderownia"/"Bloc" in
    Polish, Danish, or English → indoor-bouldering only (all of Denmark's
    "Beta Boulders" and "Boulders" chain locations were also explicitly
    tagged "Bouldering gym" by the source, confirming the heuristic);
    "Kiipeilyareena"/"Klatreklub"/generic "Climbing Center" names with no
    bouldering-only signal → bouldering + top-rope default.
  - `state` uses each country's real top-level divisions — Poland's 16
    voivodeships, Denmark's 5 regions, Finland's 19 regions, and the
    Republic of Ireland's 26 counties — populated with the complete real
    set from the start (same standard as every country since the
    state-list-completeness fix), not just the ones these seed spots use.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Norway (20 gyms, 11 cities), Mexico (16 gyms, 4 cities), and Brazil
  (15 gyms, 4 cities)** — the 23rd-25th countries — finish the "add more
  countries" backlog. **Brazil is the first South America country**,
  which needed a new continent-tier region (see "Map" below).
  - **Norway**: climbing-gyms.com's own Norway page has only 2 gyms
    (both in Bergen), so this pass used general web search instead — the
    same lighter-touch tier as the original Japan/Canada/New Zealand
    passes, not the geocoded-address tier every European country since
    has used. 20 real, named gyms confirmed via search across 11 cities
    (Oslo 3, Bergen 4, Trondheim 3, Stavanger 2, Bodø 2, Hemsedal 1,
    Kristiansand 1, Kristiansund 1, Lillehammer 1, Ålesund 1, Skien 1) —
    positions are **city-level with a small per-gym offset** (same
    convention as the original AU/US Mountain Project pass for multiple
    gyms in one city), not individually geocoded addresses. `state` uses
    Norway's current 15 fylker (counties, as of the 2024 reform), listed
    complete in `STATES_BY_COUNTRY.NO` from the start per the usual
    standard — 10 of the 15 have a seed spot, more than any other
    country's "cities actually used" count, so Norway also needed CSS
    colours/chips for all 10, not just a top-4.
  - **Mexico**: climbing-gyms.com *does* cover Mexico (confirmed by
    checking directly, contrary to the initial assumption when this was
    added to Backlog) — same geocoded-address method as the European
    passes. Ciudad de México (8) + Monterrey (4) + Toluca de Lerdo (2) +
    Zapopan (2) = 16. All 16 addresses matched Nominatim, though one
    (**TOKA climbing**, address "Tlatilco 5") needed a manual fix — the
    top match was a same-named but wrong street ~28km away in Tláhuac;
    checking Nominatim's alternate matches found the real Tlatilco
    neighbourhood (Azcapotzalco) instead. Worth remembering for any
    future geocoding pass: a top Nominatim result isn't automatically
    the right one for a common street name, especially in a large city.
    `state` uses Mexico's 32 federal entities, listed complete from the
    start. One address (**Amanecer Climbing**) is technically in
    Interlomas/Huixquilucan, Estado de México — a different federal
    entity from Ciudad de México proper, despite climbing-gyms.com
    listing it under the CDMX city page (a common real-world ambiguity
    in the CDMX metro area, not a data error).
  - **Brazil**: no directory site found (climbing-gyms.com's own Brazil
    page explicitly says "No cities with climbing gyms in Brazil yet"),
    so this used the same web-search method as Norway, but with real
    street addresses where search turned them up (a mixed precision tier
    — most of São Paulo/Belo Horizonte/Curitiba matched Nominatim
    directly; a few fall back to a same-city gym's position where the
    address didn't resolve or wasn't given at all). São Paulo (6) + Belo
    Horizonte (5) + Curitiba (3) + Rio de Janeiro (1) = 15. **Rio ended
    up thin (1 gym) for a real reason, not an oversight**: the other
    strong candidate, Centro de Escalada JPA, showed a "now closed"
    (Agora fechado) signal on a business listing and was excluded, same
    "confirmed closure" treatment as the US pass's closures — only
    Evolução Escalada Indoor (Botafogo) remained confirmed-open. `state`
    uses Brazil's 26 states + Distrito Federal (27 total), listed
    complete from the start.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Hungary (18 gyms, 4 cities), Greece (13 gyms, 10 cities), Czech
  Republic (8 gyms, 2 cities), and Iceland (3 gyms, 2 cities)** — the
  26th-29th countries — user asked for "more of Europe" via `AskUserQuestion`,
  which surfaced this specific batch. climbing-gyms.com was checked
  directly for all four before starting, per the lesson from Norway's
  original 2-gym showing: Hungary (18 gyms, all 4 of its listed cities)
  and Greece (13 gyms, all 10 of its listed cities, since — like
  Ireland — most Greek cities on the site have just 1 gym each, so a
  top-4 cut would have discarded most of the country) both had solid
  coverage and used the same geocoded-address method as every other
  climbing-gyms.com pass. Czech Republic showed **0 cities** on the site
  and Iceland showed only **1** — both too thin to use, so both were
  built the same lighter-touch way as Norway: real, named gyms confirmed
  via general web search, addresses still individually geocoded against
  Nominatim (this is a step up from Norway's own city-level-only
  positioning, since real street addresses were findable this time).
  - Hungary: Budapest (14) + Budaörs (2) + Vác (1) + Veszprém (1) = 18.
  - Greece: Athina (2) + Thessaloniki (3) + 8 more cities at 1 gym each
    (Ano Liosia, Chalandri, Chorio/Kalymnos, Iraklio, Marousi, Pallini,
    Patras, Rodos) = 13.
  - Czech Republic: Prague (7) + Brno (1) = 8.
  - Iceland: Reykjavík (1) + Akureyri (2) = 3.
  - **Two borderline "is this a real climbing gym" cases, both kept with
    a disclosure note rather than excluded** — same judgment call as the
    Korea/Ireland university-gym cases earlier in this file: **City
    Fitness Next Gen** (Rhodes, Greece) is a 4-floor multi-sport fitness
    centre with a squash court, confirmed via search to also have a
    small dedicated indoor climbing wall as one of its class offerings —
    kept since climbing is a genuine, named activity there, not
    inferred. **Kraftlyftingafélag Akureyrar** (Iceland) is primarily
    Iceland's oldest powerlifting club, confirmed via search to also
    have its own 7m indoor bouldering wall — kept for the same reason.
  - **Positions individually geocoded** — 35 of 42 addresses matched
    Nominatim directly. 7 didn't resolve on the first try; 2 (PXP
    Climbing, Thessaloniki; City Fitness Next Gen, Rhodes) matched on a
    reformatted retry of the same address. The remaining 5 fall back to
    another already-geocoded gym or a city-centre point, flagged in each
    spot's own `notes`: **Redpoint Athens Climbing Center** falls back to
    Mamouna Climbing Spot's position (same city, Athina); **Crux -
    Climbing gym** falls back to PXP Climbing's position (same city,
    Thessaloniki); **Apollon Kalymnos Climbing Academy**, **RockWay**
    (Iraklio), and **OAKA Indoor Climbing** (Marousi) each fall back to
    their own city centre, since no other already-geocoded gym exists in
    the same city to borrow a position from.
  - **Climbing type mostly inferred from name/chain recognition**, same
    heuristic as every prior climbing-gyms.com pass — "Boulder"/"Bloc"-
    style names → indoor-bouldering only; generic "Climbing
    Center"/"Climbing Gym" names → bouldering + top-rope default. Three
    exceptions confirmed via each gym's own description rather than
    guessed: **Smichoff Climbing Center** and **Třináctka** (both Prague)
    and **BigWall Praha-Vysočany** and **DURO Climbing Gym** (Brno) are
    all explicitly described (own sites/press coverage) as having tall
    (17.5m-23.5m) sport-climbing walls, not just bouldering — tagged with
    `lead-climbing` alongside the other two types. **Apollon Kalymnos
    Climbing Academy** is also tagged `lead-climbing` since Kalymnos is
    Greece's premier outdoor sport-climbing destination and the gym's own
    description frames it as training for exactly that.
  - `state` uses each country's real top-level divisions — Hungary's 19
    counties + Budapest (20 total), Greece's 13 regions, Czech Republic's
    13 regions + Prague (14 total), and Iceland's 8 regions — populated
    with the complete real set for all four from the start, same standard
    as every country since the NL fix.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Romania (18 gyms, 7 cities), Croatia (8 gyms, 5 cities), Russia (7
  gyms, 2 cities), and Bulgaria (7 gyms, 2 cities)** — the 30th-33rd
  countries — user asked to keep adding countries, "starting from the
  ones with more gyms." Rather than guess which remaining countries had
  the most, every not-yet-added country on climbing-gyms.com's own
  country list (all of Europe, 43 entries) was checked directly for its
  raw gym count first, then the four biggest were taken as this batch:
  Romania (18, clearly the largest), Croatia and Russia (8 each), Bulgaria
  (7). Countries checked but left for a future batch, roughly in size
  order: Latvia/Luxembourg/Lithuania/Estonia/Belarus/Bosnia and
  Herzegovina (6 each), Serbia (4), Slovakia (3), Moldova/North Macedonia
  (2), Montenegro/Albania (1) — Slovenia currently has **zero** gyms
  listed on the site, the same "too thin to use" signal Czech
  Republic/Iceland gave in the prior batch.
  - Romania: București (7) + Cluj-Napoca (4) + Brașov (2) + Târgu Mureș
    (2) + Timișoara (1) + Miercurea Ciuc (1) + Iași (1) = 18. The site's
    own city-slug URLs for diacritic-heavy Romanian city names (Brașov,
    București, Iași, Târgu Mureș, Timișoara) don't match their display
    names directly (e.g. București's page is at `/bucure-ti`, not
    `/bucuresti`) — worth remembering if this source is used again for a
    Romanian city, fetch the country page's own links rather than
    guessing the slug.
  - Croatia: Zagreb (3) + Split (2) + Pula (1) + Koprivnica (1) + Kaštel
    Sućurac (1) = 8.
  - Russia: climbing-gyms.com only lists Moskva (4) and Sankt-Peterburg
    (3), plus one "Unknown City" 1-gym entry that was skipped rather than
    guessed at (no way to geocode a spot without knowing which city it's
    in) — 7 gyms kept.
  - Bulgaria: Sofia (6) + Varna (1) = 7.
  - **`state` for Russia deliberately keys on city names, not the full
    federal-subject list** — the same design already used for China
    (`STATES_BY_COUNTRY.CN`), extended here for an additional reason
    beyond scale: Russia's federal-subject boundaries include several
    genuinely, internationally contested territories (Crimea and the
    four partially-occupied Ukrainian oblasts), and this project has no
    reason to take a position on that by drawing them into a public
    filter list. Keying on city names sidesteps the question entirely
    while still giving useful filter granularity. Populated with 20
    major Russian cities (Moskva/Sankt-Peterburg plus 18 more, matching
    the scale of CN's own city list), not just the 2 that currently have
    a seed spot — same "complete-enough-to-be-useful" standard as every
    other country's state list, adapted to a city-keyed scheme.
  - **This batch hit real, repeated geocoding trouble for two of the four
    countries** — worth flagging as a pattern, not just this batch's
    problem: Nominatim (and Photon as a second opinion) resolved Romanian
    and Bulgarian street addresses reliably, but **7 of 8 Croatian
    addresses and 6 of 7 Russian addresses failed to resolve at all**,
    with Photon's best guesses landing in entirely different cities (e.g.
    Pula's address matched streets in Tenja, Vinkovci, and Đakovo — three
    different towns, none of them Pula). This looks like a genuine gap in
    both services' OSM-derived road coverage for Croatian and Russian
    street-level addresses specifically, not a one-off — 13 of this
    batch's 40 spots (32.5%, the highest fallback rate of any batch in
    this dataset) ended up on a same-city-gym or city-centre fallback
    position rather than their own geocoded address, flagged in each
    spot's own `notes`. One Bulgarian address (**Balkan Climbing**,
    Sofia) got a *confident-looking* Nominatim match that was actually
    wrong — it resolved to an unrelated street on the opposite side of
    the city — caught by noticing the returned street name didn't
    resemble the query at all, not by any distance threshold; fell back
    to Climb Academy's position in the same city instead of trusting it.
  - **One same-address pair left unmerged, unlike the Salzburg/Helsinki
    precedent**: **Climb House Brasov** and **Natural High Brașov** are
    both listed by the source at the identical street (no house number
    given for either), but unlike Salzburg's Boulderhalle/Kletterhalle
    pair or Helsinki's KiipeilyAreena/Salmisaari pair — both confirmed via
    search to be one venue under two names — no source could confirm or
    deny that here, so both were kept as separate entries with a note
    cross-referencing the coincidence rather than guessing either way.
  - **Climbing type mostly inferred from name/chain recognition**, same
    heuristic as every prior pass — "Blokx"/"Boulder" → indoor-bouldering
    only; generic "Climbing Center"/"Climbing Gym"/"Skalodrom" (Russian
    for "climbing wall") names → bouldering + top-rope default. One
    exception tagged `lead-climbing`: **SKAI Urban Crag** (Cluj-Napoca) —
    "Urban Crag" names a simulated-outdoor-route product line, not a
    plain bouldering wall — and **Skalodrom Bigwallsport na Dinamo**
    (Moscow) — "Bigwall" in the name signals a tall lead wall, the same
    naming convention already confirmed for BigWall Praha-Vysočany in the
    Czech Republic batch.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Argentina (17 gyms, 14 cities) and Philippines (17 gyms, 15 cities)** —
  the 34th-35th countries. User asked to cross-check
  [boulderinglist.com](https://boulderinglist.com/countries) and
  [startbouldering.com](https://startbouldering.com/) against each other and
  add more countries. startbouldering.com returned an HTTP 403 to this
  session's fetch tool the whole time — never usable as a second source for
  this batch, so every claim below was cross-checked against general web
  search instead (same fallback this project has always used when a source
  can't be reached, e.g. Dianping blocking automated fetches during the
  Shanghai/Beijing/Chongqing pass).
  - **A real, non-obvious data-quality trap found in boulderinglist.com
    itself, worth flagging for any future use of this source**: its
    per-country gym list for "Georgia" returned Atlanta-area gyms (Georgia
    State University, Stone Summit Atlanta, Wall Crawler Rock Club, etc.) —
    the *US state* of Georgia — with only one single entry (s.k.lucky,
    Tbilisi) actually belonging to the *country* Georgia. The site
    apparently buckets both under one "Georgia" label with no
    country/state distinction. Caught by actually reading the returned
    city list rather than trusting the label, and by there being only 14
    total listed (matching a mid-size US-state count, not a real national
    count) — country Georgia was left out of this batch entirely as a
    result (1 real gym isn't enough to seed a country).
  - **Method for picking this batch**: fetched boulderinglist.com's full
    84-country list with real gym counts, cross off every country already
    in this dataset, then took the largest genuinely-new ones. Argentina
    (29 listed, 20 actually enumerated on its own page — a real discrepancy
    between the site's summary count and its own detail page, not
    resolved, just noted) and Philippines (14 listed, 19 actually
    enumerated) were both picked this way. Chile (18), Colombia (23), and
    Venezuela (15) were larger or comparable in size but deliberately
    **not** added this round — their listings were dominated by
    mountaineering/alpine-club entries ("Club Andino X", "Asociación de
    Montañismo y Escalada del Estado Zulia") with no confirmed indoor wall,
    which would need the same gym-by-gym verification this batch already
    took a long time on; left in Backlog for a future pass rather than
    force-added or arbitrarily filtered on a tight budget.
  - **Argentina exclusions/corrections, applied the same "never guess"
    discipline as the original AU/US noise filter**:
    - **Centro Andino Buenos Aires** (its climbing wall, "Palestra Nacional
      de Andinismo" at CeNARD) was excluded on two independent grounds:
      confirmed via search to be a large, open-air concrete structure (not
      an indoor gym, out of this app's scope), *and* confirmed demolished
      on 15 December 2025 — a real, current closure, same treatment as
      Boulder Project Prahran or the US pass's confirmed closures.
    - **Palestra del Club Mitre de Pesca** (Rosario) was excluded as an
      outdoor natural-riverbank wall, same "indoor gyms only" scope
      exclusion as Huayan Climbing Park (China batch) and Hanging Bridge
      Mountain Park (Philippines, below).
    - **AREA Multiaventura** and **Cima Escuela de Escalada** (both listed
      separately by boulderinglist.com, one under "Buenos Aires" and one
      under "Monte Grande") resolved to the identical street address
      (Dardo Rocha 371) once individually searched — merged into a single
      `Cima Escuela de Escalada` entry rather than kept as two, same
      precedent as the Salzburg Boulderhalle/Kletterhalle and Helsinki
      KiipeilyAreena/Salmisaari merges.
    - **Club Andino Córdoba** was kept, unlike several other "Club Andino"
      entries on the same source — its own site confirms a genuine indoor
      climbing wall at a municipal sports complex (Polideportivo General
      Paz), not just an alpine-club office with no wall. This is the same
      judgment call already applied to Korea's/Ireland's university-named
      gyms: verify per-entry rather than assuming either way from the name.
    - **5 suburb corrections**: boulderinglist.com listed AADED Escalando,
      Golem Escalada, K2 Escalada Deportiva, LA CIMA - Gimnasio Stadium,
      and Club Andino Sosneado all under a generic province-level label
      ("Buenos Aires" or "Mendoza") rather than their real city — corrected
      to Acassuso, Avellaneda, Bella Vista, Tres Arroyos (~500km from the
      capital — the biggest miss), and San Rafael respectively, each found
      via the gym's own individually-confirmed address.
    - Two gyms — **Club Andino Burzaco (CABur)** and **K2 Escalada
      Deportiva** — have both an outdoor wall and a confirmed genuine
      indoor component (an indoor fissure wall/boulder room/training wall
      for CABur; a covered bouldering area for K2) — kept for the indoor
      component, same "mixed venue, kept for its confirmed indoor part"
      treatment as Caliraya Recreation Center in the Philippines batch.
  - **`state` uses Argentina's real top-level divisions**: the 23 provinces
    plus the Ciudad Autónoma de Buenos Aires (CABA), populated complete
    (24 total) from the start per the standard set since the NL
    completeness fix, not just the 7 divisions this batch's spots use.
  - **Philippines exclusions**: **"B Fitness Station"** (a third
    boulderinglist.com Quezon City listing) could not be confirmed as a
    real climbing facility by any source found during this pass — excluded
    as unconfirmed rather than guessed in. **Hanging Bridge Mountain
    Park** (Villaros) was excluded as an outdoor mountain-slope wall, the
    same indoor-only scope exclusion as Centro Andino Buenos Aires above.
    **Bloc Boulder** (Bocaue) was kept but flagged in its own `notes` as a
    private, invitation/text-booking-only facility, not a walk-in public
    gym — a softer version of the Galway Climbing Coop exclusion
    criteria (members-only cooperative), judged not restrictive enough to
    exclude outright since anyone can text to request access.
  - **`state` uses the Philippines' real top-level divisions**: the 81
    provinces plus the National Capital Region (NCR/Metro Manila),
    populated complete (82 total) from general knowledge of the current
    PSGC division list, same standard as every other country — not
    independently verified against an official government source
    beyond that, consistent with how every other country's "complete
    division list" in this file was built.
  - **Positions individually geocoded** against Nominatim, with Photon and
    simplified/retried queries as a second pass for anything that didn't
    resolve on the first try, same method as every geocoded-address
    country before this one. 20 of 34 addresses matched cleanly on the
    first Nominatim pass; the rest needed a retry, Photon, or a
    city-centre/area-level fallback — full per-spot disclosure is in each
    spot's own `notes` field in `js/data.js`, not just here. One Photon
    false-positive was caught and rejected during the Philippines retries:
    Kapit Tuko Indoor Climbing Gym's address matched a same-named
    subdivision in San Pablo, a different city entirely from Biñan (the
    same "Photon lands in the wrong town" failure mode already documented
    for Croatia/Russia) — rejected in favor of a Biñan city-centre
    fallback instead of trusting it.
  - **Climbing type inferred from each gym's own description**, same
    conservative heuristic as every prior pass — a name or description
    naming "bouldering" specifically and nothing else (Boulder Space,
    Good Climbs, Flow State Bouldering, both Bouldering Hive branches,
    Bloc Boulder, Pared Parque España, Heidrun) → indoor-bouldering only;
    a description confirming rope routes too → bouldering + top-rope.
    Climb Central Manila (explicitly "the biggest indoor sport-climbing
    venue in the Philippines"), AADED Escalando (Argentina's first sport-
    climbing school with routes up to the tallest wall in the country),
    Chao - Punto Gym (explicitly has bolted lead routes), and Rocódromo La
    Plata (explicitly offers "equipando" / lead-bolted routes) are tagged
    `lead-climbing` alongside the other two types.
  - Net result: 1069 → **1103 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1103/1103 unique ids, zero duplicate
    name+suburb+state+country combos.
  - **Verified live**: since the live Supabase table isn't re-seeded with
    this batch yet, the app's normal on-load path still pulls the older
    1069-row table — same "not visible as a live map marker yet" gap as
    every prior country addition. To actually verify the new data's
    render/search/filter path (not just its structure), the app's
    Supabase client was temporarily pointed at an invalid URL (a one-line,
    reverted-before-commit edit to `js/supabase-init.js`, confirmed via
    `git diff` showing no changes afterward) to force its own documented
    offline-fallback path, which uses `js/data.js` directly — with that
    forced, all 34 new spots were confirmed searchable by name, the new
    Argentina/Buenos-Aires chip filter correctly returned exactly its 9
    real spots, both new sidebar chip groups (Argentina under South
    America, Philippines under Asia) render with correct per-state colours
    and counts, both country `<option>`s appear in the add/edit-spot
    forms, and there was no console error or mobile horizontal overflow
    at 375px width at any point.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Colombia (18 gyms, 10 cities), Chile (15 gyms, 11 cities), and
  Venezuela (14 gyms, 9 cities)** — the 36th-38th countries, and the same
  three deferred in the Argentina/Philippines Backlog entry (this session
  followed through on them rather than leaving them backlogged). User
  asked to keep adding countries and cross-check locations for
  correctness — every gym in this batch got the same per-entry
  verification treatment as Argentina: confirm it's a real, currently-
  operating indoor facility (not just trust boulderinglist.com's own
  label), then individually geocode its address.
  - **Colombia turned out to be the cleanest of the three** — of 19
    candidates, only **"Game Over"** (Ibagué) was excluded, and only
    because no independent source could confirm it's a real climbing
    facility at all (unlike everything else in this batch, which
    resolved to real, named businesses or public facilities). One
    duplicate found and merged: boulderinglist.com listed the same
    Ecoextremo facility twice under two different city labels
    ("Ecoextremo - Omar Moreno" under Bucaramanga, "Muro Aguilas -
    Ecoextremo - Alquiler" under Floridablanca) — confirmed via a
    matching phone number and location (Mesa de Ruitoque) to be one
    venue, merged into a single `Ecoextremo` entry. One near-miss caught
    mid-verification: an AI-summarized web search claimed Dulfer Escuela
    y Gimnasio de Escalada and Gravedad Cero (both Cali) shared an
    address — rejected after checking climbing-map.org's own per-gym
    listings directly, which give each a distinct real address (Av
    Pasoancho vs. Carrera 62C) — a reminder that an AI search summary
    can itself misattribute a detail, not just the underlying sources.
  - **Chile needed the most exclusions of the three (3 of 18
    candidates)**, all judgment calls on public-access grounds rather
    than "is this a real wall" — the same standard already applied to
    Korea's/Ireland's university-gym cases: **Muro de Escalada MontUBB**
    (Chillán, a university wall with no public-access policy confirmed
    either way) and **Rama de Andinismo y Escalada UFRO** (Temuco,
    confirmed via its own site to be an alumni/student climbing space,
    not clearly open to the general public — the same caution that
    excluded Mardyke Arena UCC in the Ireland batch) were both excluded
    on access grounds; **Ranquimilo** (Talca) was excluded on scope
    grounds instead — confirmed to be a genuinely outdoor-only wall, out
    of this app's indoor-gyms-only scope, the same treatment as Huayan
    Climbing Park (China) and Palestra del Club Mitre de Pesca
    (Argentina). Two kept despite looking similarly ambiguous at first:
    **Escalando en Penumbras** (a free, 20+ year running public climbing
    workshop inside Santiago's Estadio Nacional, not a private club) and
    **Club Gimnástico Alemán Temuco** (otherwise a private century-old
    multisport club, but its specific climbing wall is independently
    confirmed open to the public) — both individually confirmed rather
    than excluded by association with a similar-sounding name.
  - **Venezuela had the most "sounds sketchy, turned out real" cases** —
    of the 15 original candidates, every "Club"/"Asociación"-style entry
    except one (**Elos**, San Antonio de los Altos — completely
    unconfirmed by any source, excluded) turned out to be a real,
    verifiable facility once individually checked: **Skate Park Chacao**
    is a genuine public extreme-sports park with a real 12m climbing
    wall and free entry; **Asociación de Montañismo y Escalada del
    Estado Zulia**, despite the "association" name, has its own real
    physical monolith-type wall (the same "has a wall vs. doesn't"
    distinction already used to keep Club Andino Córdoba but exclude
    other Club Andino entries in the Argentina batch); **Jose Daniel
    Arciniegas Contreras** is confirmed to be a real independently-run
    gym named after its owner, not a placeholder or data error; **Villa
    Olímpica** (San Juan de los Morros) is confirmed as the site of
    Venezuela's National Center for Sports Climbing, with a wall
    described as the tallest in Latin America.
  - **`state` uses each country's real top-level divisions, populated
    complete from the start** (same standard as every country since the
    NL fix): Colombia's 32 departments + Bogotá D.C. (33 total), Chile's
    16 regions, Venezuela's 23 states + Distrito Capital (24 total).
  - **Positions individually geocoded** against Nominatim, Photon as a
    second pass for no-matches. One Photon false positive was caught and
    rejected during the Colombia retries: Extrema Aventura's (Cúcuta)
    address matched a Photon result in El Bordo, Cauca — a different
    department roughly 600km away — rejected in favor of a Cúcuta
    city-centre fallback instead, the same "Photon lands in the wrong
    place entirely" failure mode already documented for Croatia/Russia/
    the Philippines. Full per-spot fallback disclosure is in each spot's
    own `notes` field in `js/data.js`.
  - **Climbing type inferred from each gym's own description**, same
    conservative heuristic as every prior pass. Three gyms tagged
    `lead-climbing` based on explicit confirmation of real rope/lead
    routes, not just bouldering: GRAN PARED SAS (Bogotá, Colombia's
    largest wall, 15 lead + 18 top-rope lanes), Destino Escalada (Cali,
    5 climbing zones including rope routes), GimnasioElMuro (Santiago,
    billed as Santiago's largest gym with 22 rope lines), Naciones
    Unidas (Caracas, 9+ lanes, home of the Distrito Capital's climbing
    team), and Villa Olímpica (San Juan de los Morros, Venezuela's
    National Center for Sports Climbing).
  - Net result: 1103 → **1150 total spots**. Structural check
    (Node-parsed `window.SEED_GYMS`): 1150/1150 unique ids, zero
    duplicate name+suburb+state+country combos, every state code used
    confirmed to resolve against its country's `STATES_BY_COUNTRY` entry.
  - **Verified**: same offline-fallback-forcing method as the Argentina/
    Philippines batch (`js/supabase-init.js` temporarily pointed at an
    invalid URL, reverted before committing, confirmed clean via `git
    diff`) — with that forced, all 47 new spots confirmed searchable by
    name, all three new sidebar chip groups (Chile, Colombia, Venezuela,
    all under South America alongside Argentina/Brazil) render with
    correct colours/counts, both country `<option>`s present in both
    forms, chip active-state text stayed legible, no console errors, no
    mobile horizontal overflow at 375px.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **India (8 gyms, 7 cities), Israel (8 gyms, 6 cities), Indonesia (9
  gyms, 8 cities), and Taiwan (6 gyms, 5 cities)** — the 39th-42nd
  countries. User asked to keep adding countries. Checked
  boulderinglist.com's remaining not-yet-added country list again and
  took the four largest with clean enough data: India (14 candidates),
  Indonesia (11), Israel (9), Taiwan (8) — same "starting from the ones
  with more gyms" method as prior batches.
  - **India needed the most exclusions of this batch (6 of 14
    candidates)**, split across two different reasons:
    - **4 university/school-tied walls excluded on ambiguous-access
      grounds** (Eshwaran Bharatan Memorial Wall/St. Stephen's College,
      IIT Kanpur, Girivihar Podar College Bouldering Wall, Youth
      Adventure Club/Ramjas School) — none had a confirmed
      general-public walk-in policy, the same caution already applied
      to Mardyke Arena UCC (Ireland) and, in this same batch, to
      Indonesia's Untar/Tarumanagara University wall. The Indian
      Mountaineering Foundation's own wall was excluded on a different,
      scope-based ground instead — confirmed via web search to be an
      "outdoor set-up," out of this app's indoor-only scope, even though
      boulderinglist.com's summary description made it sound indoor.
    - **1 likely-closed listing excluded**: Arun Samant Climbing Gym
      (Goregaon, Mumbai) is tagged "Closed Down" on a business directory
      with no independent source confirming it's still operating — the
      same "confirmed closure → exclude" treatment as Boulder Project
      Prahran (Australia batch) and the US pass's closures.
    - **Nainital Mountaineering Club was kept despite the "club" name** —
      confirmed via web search to be a genuine, 1968-founded public
      climbing club offering courses (including to underprivileged
      children) at a real 12m wall, the same "has a real public program"
      standard that kept Escalando en Penumbras (Chile batch) and
      Nainital's own Escalando-en-Penumbras-style precedent.
  - **Israel's one exclusion**: Sportek Climbing Gym (Tel Aviv) is
    explicitly described by its own source as an outdoor climbing gym in
    Hayarkon Park — excluded on scope grounds, same "indoor gyms only"
    treatment as every prior outdoor exclusion this session.
  - **Indonesia had two real, distinct catches**: **Untar** (Tarumanagara
    University, Jakarta) was excluded on the same ambiguous-access
    grounds as India's university walls above. **Tokei Ubud Climbing
    Gym** (Bali) was excluded as a confirmed closure — its own Instagram
    account says the gym burned down. One suburb/state correction:
    **Bungo Boulder** was listed by boulderinglist.com under a generic
    "West Java" label, but its real location (Bungo, on Sumatra) is
    actually in Jambi province, nowhere near Java — corrected after
    Nominatim's own geocode made the mismatch obvious. **Bremgra Indoor
    Climbing Gym** had the same kind of correction — listed under "Jawa
    Barat" but its real address (Serpong/BSD) is in Banten, a separate
    province carved out of West Java in 2000.
  - **Taiwan's two exclusions were both explicitly outdoor**: Park
    Outdoor Tower and Outdoor-Taiwan, boulderinglist.com's own
    descriptions for both said so directly — no ambiguity to resolve,
    unlike most of this session's outdoor exclusions.
  - **One gym renamed after cross-checking against independent
    sources**: boulderinglist.com's "STONE bouldering gym" (New Taipei
    City) is confirmed via Mountain Project and Chalk Rebels to actually
    be branded **MegaSTONE Climbing Gym** — kept under its real current
    name rather than the source's shorter label.
  - **`state` uses each country's real top-level divisions, populated
    complete from the start** (same standard as every country since the
    NL fix): India's 28 states + 8 union territories (36 total),
    Indonesia's 38 provinces, and Taiwan's 22 special
    municipalities/cities/counties. **Israel is the deliberate
    exception**: `STATES_BY_COUNTRY.IL` lists only the 6
    internationally-recognized Israeli districts, intentionally excluding
    the Judea and Samaria Area (West Bank) — the same political-
    neutrality reasoning already applied to Russia's city-keyed `state`
    scheme (avoiding embedding a position on genuinely contested
    territory into a public filter list), extended here to a real
    country rather than a design workaround.
  - **Positions individually geocoded** against Nominatim, with Photon
    and simplified/retried queries for anything that didn't resolve on
    the first try. One geocoder error was caught and rejected during the
    Taiwan retries: Y17 Climbing Gym's confirmed address (Renai Road
    *Section 1*) matched a Nominatim result on Renai Road *Section 3* —
    a different segment of the same road, several km away — rejected in
    favor of a district-centre fallback instead, the same "wrong segment
    of a long road" failure mode already documented for Adamanta Sierra
    (US geocode-accuracy series).
  - **Climbing type inferred from each gym's own description**, same
    conservative heuristic as every prior pass. Three gyms tagged
    `lead-climbing`: Fit Rock Arena (Chennai, explicit top-rope/lead
    wall), Nainital Mountaineering Club (lead and speed climbing
    confirmed), and Badung Climbing Gym (Bali, has a dedicated lead
    climbing wall alongside its boulder/speed walls).
  - Net result: 1150 → **1181 total spots**. Structural check
    (Node-parsed `window.SEED_GYMS`): 1181/1181 unique ids, zero
    duplicate name+suburb+state+country combos, every state code used
    confirmed to resolve against its country's `STATES_BY_COUNTRY` entry.
  - **Verified**: same offline-fallback-forcing method as every prior
    batch this session (`js/supabase-init.js` temporarily pointed at an
    invalid URL, reverted before committing, confirmed clean via `git
    diff`) — with that forced, all 31 new spots confirmed searchable by
    name (including the renamed MegaSTONE Climbing Gym), all four new
    sidebar chip groups (India, Indonesia, Israel between China and
    Japan; Taiwan after South Korea, all under Asia) render with correct
    colours/counts, both country `<option>`s present in both forms, chip
    active-state text stayed legible, no console errors, no mobile
    horizontal overflow at 375px.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Xi'an (19 gyms) — the first of 12 Chinese cities sourced from a new kind
  of source: screen-recorded video footage of a real Chinese gym-directory
  app ("岩馆探索"/PANDA), not a text directory site.** The user provided 11
  MP4 screen recordings + 2 PNG screenshots covering that app's own
  directory for 12 Chinese cities (Beijing, Shanghai [100 gyms per the
  app's own city banner], Guangzhou, Shenzhen, Chengdu [38], Hangzhou [53],
  Nanjing [22], Wuhan [21], Chongqing [35, on top of the 5 already in this
  dataset from an earlier Dianping pass], Suzhou [22], Tianjin [21], Xi'an
  [~25]) — an estimated 400-500+ gym candidates in total, none with
  addresses in the app itself (name + thumbnail only). Given this was
  10-20x larger than any prior single-task scope in this project, the user
  was asked to scope it (`AskUserQuestion`, per `Rules.md` §11) and chose
  "all 12 cities, split across several follow-up tasks" — do Xi'an now,
  backlog the other 11 (see `docs/tasks.md` Backlog).
  - **No ffmpeg/vlc available in this environment** — confirmed via `which
    ffmpeg` / `Get-Command`. Installed `opencv-python-headless` via pip and
    wrote a one-off Python script sampling 8 evenly-spaced frames per video
    via `cv2.VideoCapture` + `cap.set(cv2.CAP_PROP_POS_FRAMES, ...)`, saved
    as JPEGs to a scratchpad directory — 88 frames total across the 11
    videos, used to visually read every gym card's name and status badge.
  - **The app's own UI conventions had to be learned before candidates could
    be filtered correctly**: a "建设中" (under construction) black badge
    means not-yet-open — excluded. A card with a blank/faded photo, a
    "订阅提醒" (subscribe for updates) button, and 0/0 like/star counts is a
    second, visually distinct "not yet open" pattern (also seen for gyms in
    the Shanghai/Wuhan footage) — treated identically to 建设中. A "换线"
    (route-change notice) badge means an active, currently-operating gym —
    not an exclusion signal. Each city tab's own "城市攀岩地图 N家岩馆"
    banner card gives that city's authoritative gym count, used to
    sanity-check whether a scroll/video had captured the full list.
  - **21 Xi'an candidates were identified from the footage; 2 pairs turned
    out to be the same gym shown as two separate cards** (an unlabeled
    "main" card and a same-named branch card, for both 岩十三攀岩馆 and DC
    攀岩) — every independent web search for either card's name in each
    pair returned the identical single address, with no second address
    ever surfacing, so each pair was merged into one spot rather than kept
    as two — same "likely duplicate, don't double-count" treatment already
    used for a Beijing candidate (768攀岩馆) earlier in this dataset. Net:
    19 distinct gyms.
  - **This batch had an unusually high rate of unconfirmable addresses**:
    10 of 19 gyms (Laoshan Climbing Co-creation Club, Yan13 Climbing Gym,
    Lingzhongli Climbing, Duote Climbing ×2 of 3 branches, Daren Climbing,
    Red Point Climbing ×2, Climbing Dream Factory, Xi'an Seeyou Climbing
    Gym) got a real, web-search-confirmed address (individually geocoded
    against Nominatim, several as exact named-building/landmark matches,
    a few as street- or district-level fallbacks where Nominatim couldn't
    resolve the exact building); the other **9 (47%) had no address
    findable via web search at all** — DC Climbing (merged card), Huoshi
    Climbing (Rainbow Valley), Muyan Climbing, Jianshan Climbing, Duote
    Climbing (Minleyuan — also couldn't be independently confirmed as a
    genuine third branch distinct from the other two Duote locations,
    flagged as a possible duplicate/mislabel rather than guessed), Xi'an
    Zebra Climbing, Wopan Xi'an Climbing Gym, and Peter Rabbit Climbing
    (Damao City — a different, confirmed branch of the same chain exists
    at a Chang'an District mall, but not this one). This is a markedly
    worse hit rate than any prior country/city batch (the previous worst,
    Croatia/Russia's geocoding-failure rate, was 32.5%) — smaller,
    independent Chinese gyms are evidently much less indexed by
    English-language web search than the boulderinglist.com/
    climbing-gyms.com-sourced European/South American gyms, or than a
    named-chain's own marketing site (Banana Climbing). Per `Rules.md` §1,
    none of these 9 addresses were guessed — each carries a `notes` field
    disclosing the search was run and came up empty, with its position set
    to Xi'an's city centre (with a small per-gym offset, same convention as
    the original Mountain Project multi-gym-per-city passes) as a visible
    placeholder rather than a real location. The gym names themselves are
    still treated as confirmed real, since the primary source (the app's
    own directory, read directly from screen-recorded footage) is at least
    as reliable as boulderinglist.com's own text listings this project has
    otherwise trusted at face value.
  - `state` uses `"XIAN"` — already present in `STATES_BY_COUNTRY.CN`
    from the earlier state-list-completeness pass (China's `state` field
    keys on city names, not provinces, per the existing design) — so no
    `js/app.js` change was needed for this addition, only a new
    `--cn-xian` CSS colour variable + chip rule and a new sidebar chip in
    `index.html`'s existing China chip-row.
  - **A real bug was caught and fixed during verification, not just
    disclosed**: the first draft of this batch omitted the `types` array
    on all 9 city-centre-placeholder spots above, which crashed `render()`
    (`g.types.some(...)` on `undefined`) the moment the offline-fallback
    path tried to filter them — caught by the browser console during the
    standard offline-fallback-forcing verification pass, not by inspection
    alone. Fixed by adding the same conservative `[indoor-bouldering,
    top-rope]` default used for every other unconfirmed-type entry in this
    dataset.
  - Net result: 1181 → **1200 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1200/1200 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch — `js/supabase-init.js` temporarily
    pointed at an invalid URL, reverted before committing, confirmed clean
    via `git diff`): all 19 new spots searchable by name; the new Xi'an
    chip renders in China's existing chip-row with the correct colour and
    a legible active state (confirmed via computed style, not just
    visually); clicking it correctly filters to exactly 19 spots; no
    console errors after the `types` fix above; no horizontal overflow in
    the China chip row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
  - **The other 11 cities from this same footage are backlogged**, not
    attempted this session — see `docs/tasks.md` Backlog for per-city
    source video filenames, confirmed/approximate gym counts, and the
    exact frame-extraction method to re-run (the extracted JPEGs
    themselves are session-scratchpad files that don't persist; the
    source MP4s in `C:\Users\Spiar\Videos\bouldering locations` do).
- **Chongqing (31 more gyms, on top of the 5 already in this dataset from an
  earlier, separate Dianping pass) — second of the 12 "岩馆探索" (PANDA) app
  cities**, direct follow-up to Xi'an above (same video footage, same "keep
  going" ask). Re-extracted frames from `IMG_6372.MP4` — the file this
  session's own earlier backlog note had guessed was Nanjing "possibly" —
  and found from the frames themselves (the app's own "35家岩馆" city-map
  banner, and gym names referencing 渝北/南岸/沙坪坝, all Chongqing districts)
  that it's actually Chongqing, not Nanjing. Worth flagging as a real
  correction to the earlier backlog guess, not a new discovery: this
  session's video-to-city mapping in `docs/tasks.md` was inferred from
  filenames and partial context before any frame had actually been
  reviewed, and turned out wrong for at least this one file — a fresh
  session picking up any of the remaining 10 backlogged cities should
  verify the city from the frames' own content (a banner, a district name
  in a gym's branch label) before trusting the filename-based guess.
  - 35 gyms confirmed via the app's own banner; 2 matched already-listed
    Chongqing spots exactly by name+address (Scream Climbing (Guangdian
    Park), Black Ram Climbing Gym) and were left as-is; 1 was tagged 建设中
    and excluded; 1 (重庆华岩攀岩公园) is the same large outdoor artificial-
    wall park already excluded on scope grounds during the original
    Dianping pass — leaving 31 new gyms.
  - **A new address source for this batch**: huodong.com turned out to have
    its own dedicated Chongqing climbing-venue category
    (`/venue/chongqing/rock_climbing`, found via its fitness-category page's
    own nav link, not guessed at) with real per-venue detail pages —
    fetched directly (`curl` for the listing pages' venue names + detail-
    page URLs, `WebFetch` for each detail page's address) rather than
    through general web search, which had been mostly unproductive for
    this batch (mirroring Xi'an's own experience). This got a real address
    for 16 of 31 gyms and confirmed the 2 already-listed duplicates.
  - **3 more resolved to a confirmed mall/area but not an exact unit**:
    Pandengxia Kids Climbing (Shapingba Rongchuangmao) and Lepan Jungle
    Climbing (Yinxiangcheng) both matched their mall building directly via
    Nominatim, and Chongqing University City Xijie Climbing Field matched
    its general University City area — none of the three had a specific
    unit number confirmable via any source.
  - **The remaining 12 of 31 (39%) had no address findable at all** and are
    flagged with a Chongqing-city-centre placeholder rather than guessed,
    per `Rules.md` §1 — a similarly high rate to Xi'an's 47%, confirming
    this is a real pattern for this footage source (smaller, independently-
    run Chinese gyms genuinely under-indexed by web search), not a Xi'an-
    specific fluke.
  - **Several genuine multi-branch chains surfaced across this batch**,
    same "verify each branch, don't assume from the name" discipline as
    every prior pass: Pandengxia Kids Climbing has branches at Qijiang
    Wanda, Yongchuan, Yubei Shuita Yunxuan, Changshou Kaiyi, Shapingba
    Rongchuangmao, Shuangfu Wuyue, and Liangjiang Xingyueli — 7 distinct
    locations, not one gym; Jidao Climbing has 3 (Jingang International,
    Lanting Xinduhui, Dongyuan 1891); STONE Climbing has 3 (Shiqiao Plaza,
    Longhu Jinsha Tianjie, and a third, C33, with no address found); Lepan
    Jungle Climbing has 2 (Yinxiangcheng, Yubei).
  - **One pair of huodong.com listings merged, not double-counted**: "山石
    攀岩(石桥广场店)" and the generically-named "Rock Climbing Gym(石桥广场
    店)" both resolved to the identical Shiqiao Plaza address — treated as
    one gym, the same "same address, don't double-pin" precedent used
    throughout this dataset (Salzburg, Helsinki, Yan13 Climbing Gym above).
  - `state` uses the existing `"CHONGQING"` key, already present in
    `STATES_BY_COUNTRY.CN` — no `js/app.js` change needed, only appending
    to the existing Chongqing sidebar chip's underlying data (the chip
    itself, added during the original Dianping pass, needed no changes).
  - Net result: 1200 → **1231 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1231/1231 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array (caught and fixed the same missing-`types` mistake as Xi'an on
    one entry — Chongqing University City Xijie Climbing Field — during
    this pass's own verification, before it ever reached a live browser).
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the Chongqing chip filter
    returns exactly 36 spots (5 existing + 31 new); all new spots load
    without error; no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow in the China chip
    row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
- **Nanjing (14 gyms) — third of the 12 "岩馆探索" (PANDA) app cities.** After
  the Chongqing correction, every remaining video was re-checked by content
  (its own banner, or a district/branch name) before starting on any city —
  see the "important correction" note in `docs/tasks.md` Backlog. This
  confirmed `IMG_6368.MP4` as Nanjing (22家岩馆 banner; a branch explicitly
  labelled "南京华贸中心店") and, along the way, resolved every other
  remaining video's city too: `IMG_6364.MP4`=Guangzhou, `IMG_6365.MP4`
  =Shenzhen, `IMG_6366.MP4`=Chengdu (38家岩馆), `IMG_6367.MP4`=Hangzhou
  (53家岩馆), `IMG_6369.MP4`=Wuhan (21家岩馆), `IMG_6373.MP4`=Suzhou (22家岩馆,
  confirming the original guess), `IMG_6374.MP4`=Tianjin (21家岩馆,
  confirming the original guess) — the full corrected mapping is now in
  `docs/tasks.md` Backlog, so no future session needs to re-derive it.
  - 22 gyms confirmed via the app's own banner; 7 excluded (建设中 tag, or a
    blank-photo+订阅提醒 card) — leaving 15 candidates. One further pair
    (Blue Whale Climbing's "Sun City Bouldering branch" and "Sun City
    flagship branch" cards) merged into one entry — every source for either
    name returns the identical address, same reasoning as Yan13 Climbing
    Gym in the Xi'an batch — leaving 14 distinct gyms.
  - **Markedly better address hit rate than Xi'an/Chongqing**: 7 of 14 got
    a precise address, 3 more resolved to a confirmed mall/area without an
    exact unit, and only 4 had no address findable at all (29%, vs. Xi'an's
    47% and Chongqing's 39%) — plausibly because several of these are
    branches of chains with their own real web presence (Blue Whale
    Climbing/蓝鲸攀岩, SEEK ROCK CLIMBING/石刻攀岩), unlike many of Xi'an/
    Chongqing's smaller independent gyms.
  - **Two genuine multi-branch chains verified**: Blue Whale Climbing has 4
    Nanjing branches (Sun City, Jiqingmen, Hexi Zhongsheng, Yuejie Fantasy
    City — the last with the mall confirmed but the specific branch inside
    it not independently confirmed); SEEK ROCK CLIMBING has 3 open branches
    (Xinyao Gemdale Plaza, Jiangbei Yinxianghui, Nanyou Plaza/Xianlin —
    the latter two only resolved to a mall/area, not an exact unit) plus 2
    excluded as 建设中 (城南茂店, 旗舰馆).
  - `state` needed a brand-new `"NANJING"` key — already present in
    `STATES_BY_COUNTRY.CN` from the earlier state-list-completeness pass,
    so no `js/app.js` change was needed, but this is the first-ever Nanjing
    spot in the dataset, so (unlike Xi'an/Chongqing) a new `--cn-nanjing`
    CSS colour variable + chip rule and a new sidebar chip in `index.html`'s
    existing China chip-row were required.
  - Net result: 1231 → **1245 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1245/1245 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array (caught and fixed the same missing-`types` mistake as Xi'an/
    Chongqing on two entries during this pass's own verification, before it
    ever reached a live browser — this is now the third batch in a row this
    exact mistake had to be caught, worth a future session double-checking
    every new spot object includes `types` at write time, not just at
    verification time).
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the Nanjing chip filter returns
    exactly 14 spots; no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow in the China chip row
    at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
- **Fixed an unfounded top-rope default across the Xi'an/Chongqing/Nanjing
  "岩馆探索" batches (49 spots corrected)**: reported that some gyms were
  marked top-rope when they're actually bouldering-only. Auditing confirmed
  this — of the 64 gyms added across those three cities, only 3 (Climbing
  Dream Factory's confirmed sport+crack+bouldering facility, and 2 Red
  Point Climbing branches with rope lines visible in their own app photos)
  ever had actual positive evidence of top-rope. The other **49 had been
  defaulted to `[indoor-bouldering, top-rope]` purely because their type
  wasn't independently confirmed** — the wrong direction for this source:
  most of these are small mall-storefront or children's-gym units (7 of
  them literally named "Kids Climbing"), which in China overwhelmingly
  lack the ceiling height and belay staffing/insurance that real rope
  climbing needs. This differs from the "default to bouldering + top-rope
  when unconfirmed" heuristic used for European/South American gyms
  earlier in this file, where climbing-gyms.com/boulderinglist.com-sourced
  entries are typically larger dedicated gyms — the same blanket default
  doesn't transfer to this footage's much smaller, budget-format venues.
  Also excluded from the correction, on the same "already has real
  evidence" grounds: **Bashan Tiger Climbing Club**, **Black Ram Climbing
  Gym**, and **Jihuayuan Extreme Sports Center** — all 3 predate this
  batch (from the earlier, separate Dianping pass) and already carry
  actual sourced facility descriptions ("speed, bouldering, and difficulty
  (lead) routes"; "bouldering plus top-rope routes"; a large dedicated
  extreme-sports complex), not a blind default.
  - All 49 corrected entries were re-tagged `types:[indoor-bouldering]`
    only, with a `notes` clause disclosing the correction (why it was
    wrong, not just that it changed) — visible in-app per this project's
    usual disclosure standard, not just in git history.
  - **A real script bug caught mid-fix**: the first correction pass used
    `line.replace(/"\},$/, ...)` to insert the disclosure clause before
    each entry's closing `"},` — this worked for the `types` replacement
    (a plain substring match) but silently failed for the `notes`-clause
    insertion, because `js/data.js` is CRLF-line-ended and the `$` anchor
    matched right before the trailing `\r`, not at the very end of the
    line, so `"\},$` never matched. Confirmed via `grep -c` that only 1 of
    49 entries got the disclosure clause after the first pass; fixed by
    re-running with a `/"\},\r?$/` pattern that tolerates the optional
    `\r`, verified `grep -c` then showed all 49. Also caught by this same
    bug-hunt: the correction script name-matched **"Pulse Climbing"**
    against the wrong entry on its first pass — an unrelated Australian
    gym (Warners Bay, NSW) happens to share the exact same name as the
    new Nanjing entry, and the script's plain string search found the AU
    one first (already correctly `[indoor-bouldering]`, so it silently
    no-op'd) rather than the Nanjing one — caught by the script's own
    "Changed: 48 of 49" count not matching the expected 49, not assumed
    away. Fixed with a direct, disambiguated edit to the Nanjing entry
    specifically.
  - Net result: still **1245 total spots** (a type-correction pass, not
    an addition/removal). Structural check (Node-parsed `window.SEED_GYMS`):
    1245/1245 unique ids, zero duplicate name+suburb+state+country combos,
    every spot has a non-empty `types` array, exactly 5 of the 69 Xi'an/
    Chongqing/Nanjing spots still carry `top-rope` (the 2 Red Point
    branches + Climbing Dream Factory + the 2 pre-existing Dianping-pass
    entries), the other 64 are bouldering-only.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): spot-checked Yan13 Climbing Gym
    directly in the loaded data — `types` is now `["indoor-bouldering"]`
    and its `notes` field carries the disclosure clause; `git diff --stat`
    on `js/data.js` confirmed exactly 49 lines changed (no line-ending
    churn across the rest of the file from the CRLF/LF script mishap
    above); no console errors beyond the deliberately-forced
    Supabase-unreachable ones.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
- **Shanghai (29 more gyms, plus one long-standing address flag resolved) —
  fourth of the 12 "岩馆探索" (PANDA) app cities, first half of two.**
  Shanghai's own banner confirmed 100 gyms — far larger than any prior city
  in this footage — so per the user's explicit choice this batch is
  deliberately a first half only; the remaining confirmed candidates are
  backlogged in `docs/tasks.md`.
  - **A serious data-integrity problem was found and had to be solved before
    any of this could be trusted**: partway through the Shanghai tab's own
    continuous scroll (no tab-switch banner in between the two), cards named
    after unambiguous Beijing places (中关村/Zhongguancun, 五棵松/Wukesong,
    首钢/Shougang, 成寿寺) appeared mixed in among genuinely Shanghai-named
    cards. Cross-checking confirmed these are real Beijing branches of real
    chains (e.g. 岩时攀岩's confirmed Beijing branch at Dawanglu, Chaoyang) —
    not a coincidence, and not a tab-switch-animation artifact that would
    resolve itself by scrolling further (as it had for Guangzhou's own video
    earlier). Worse: one card that looked "safe" purely by its position
    (人人攀岩(欢乐谷店), appearing before the obvious Beijing block even
    started) turned out on individual web search to *also* be a
    confirmed Beijing gym (垡头东路化工路5号, Chaoyang). This falsified the
    working assumption that city-attribution could be inferred from scroll
    position at all — every single candidate for this batch was
    individually web-verified by city, not positionally inferred, and the
    same discipline is noted as required for the second half too.
  - **huodong.com turned out to have its own genuine, 5-page Shanghai
    climbing-venue directory** (`/venue/shanghai/rock_climbing`) that both
    confirms a candidate really is Shanghai and gives a real address in one
    step — used as the primary source for this batch instead of the
    per-card photo/position guessing Xi'an/Chongqing/Nanjing needed, and a
    much higher-quality source as a result.
  - **This cross-reference surfaced 4 exact duplicates of gyms already in
    this dataset** from an earlier, separate Dianping pass — Jinfeng
    Climbing 189, Dayan Yuedong (Changfeng Joy City), Banana Climbing (West
    Yan'an Road), and Benchmark Climbing Gym all matched on the identical
    address — none re-added. It also **resolved a long-standing flag**:
    **Banana Climbing (Kerry Centre)** had been flagged since the original
    Dianping pass as "could not confirm a single address — 3 sources
    disagree" (218 Tianmuxi Rd / Shanghai Kerry Everbright City / 286
    Meiyuan Rd); this pass's independent huodong.com source confirms 218
    Tianmuxi Rd, now recorded on the existing spot instead of left flagged.
  - **One pair merged, not double-pinned**: RIBBONCLIMBING攀岩馆 and 上海叶岩
    攀岩馆 resolved to the identical address (Room 212A, West Bldg, 800
    Guoshun East Rd, Yangpu District) on huodong.com's own listing — same
    "same address, don't double-pin" precedent used throughout this
    dataset (Salzburg, Helsinki, Yan13 Climbing Gym).
  - **One candidate excluded**: MELAND CLUB — huodong.com's own description
    frames it as a parent-child entertainment venue, not a dedicated
    climbing gym, the same "not a real gym" criteria used since the
    original AU/US Mountain Project pass.
  - **Positions individually geocoded against Nominatim, with a lower hit
    rate than Xi'an/Chongqing/Nanjing** — most of these addresses name a
    specific mall/building Nominatim can't resolve to the exact unit, so
    many fall back to the street or district level. Two needed a coarser
    landmark fallback after a bad match: Vmore Climbing (North Bund)'s
    address query resolved to an unrelated hospital several km away
    (rejected); Yanwu Kongjian (Lingang Wanda)'s address had no match at
    all (fell back to the Lingang new-town area).
  - `state` uses the existing `"SHANGHAI"` key already in
    `STATES_BY_COUNTRY.CN` — no `js/app.js`, `css/style.css`, or
    `index.html` changes needed, this only appends to (and corrects one
    entry in) `js/data.js`.
  - Net result: 1245 → **1274 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1274/1274 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the Shanghai chip filter returns
    exactly 37 spots (8 existing + 29 new); no console errors beyond the
    deliberately-forced Supabase-unreachable ones; no horizontal overflow
    in the China chip row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
- **Shanghai, second half (36 more gyms) — completes Shanghai**, direct
  follow-up to the first half above using the same huodong.com Shanghai
  climbing directory (pages 3-5 this time). Same city-attribution
  discipline as the first half — every candidate individually confirmed
  Shanghai via huodong.com's own listing, not inferred from app-scroll
  position.
  - **3 candidates excluded**: Partpark局部公园 (huodong.com's own
    description frames it as primarily a tennis facility with climbing
    only a minor secondary activity, no confirmed dedicated wall); 射击攀岩
    (explicitly an outdoor venue in Gongqing Forest Park, out of this
    app's indoor-only scope); 攀岩工厂 (an exact-address duplicate of the
    existing "Climbing Factory" spot from the original Dianping pass —
    same 855 West Changjiang Rd / Boxiuhui Creative Park building).
  - **One access judgment call kept rather than excluded**: Tongji
    University Climbing Gym (Siping Rd Campus) — huodong.com's own
    description explicitly confirms it opens to external climbers via
    reservation and visitor registration, the same "verify, don't assume"
    standard already applied to Korea's/Ireland's university-gym cases,
    not the more cautious exclusion used for ambiguous-access university
    walls elsewhere in this dataset.
  - **Two pairs merged as same-address/same-listing duplicates**: 爬客
    攀岩馆 and 派客攀岩 both list 88 Changning Rd; 上海市奉贤区体育中心(奉贤体育
    中心攀岩馆) and 奉贤体育中心攀岩馆 are the identical listing appearing twice
    in huodong.com's own directory (once on page 1, once on page 5).
  - Positions individually geocoded against Nominatim — most needed a
    street-only retry (dropping the house number/mall name) to resolve at
    all, a notably lower first-try hit rate than the first half.
  - **A gap was caught before committing, not after**: the initial write
    of this batch omitted one already-fetched candidate (Jibi Storm
    Climbing's Bailian Xijiao branch, `极壁风暴攀岩馆(百联西郊店)`) — its
    address had been fetched via WebFetch but the entry never made it
    into the actual `data.js` write. Caught by re-checking the file for
    every name on the working candidate list before finalizing, not by
    trusting the write was complete; added afterward with its own
    Nominatim geocode.
  - Net result: 1274 → **1310 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1310/1310 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the Shanghai chip filter returns
    exactly 73 spots (37 from the first half + 36 new); no console errors
    beyond the deliberately-forced Supabase-unreachable ones; no
    horizontal overflow in the China chip row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
  - **This finishes Shanghai** — the remaining 8 cities in this footage
    (Beijing, Guangzhou, Shenzhen, Chengdu, Hangzhou, Wuhan, Suzhou,
    Tianjin) are the only ones left in `docs/tasks.md`'s PANDA-app
    backlog.
- **Beijing (50 more gyms, plus one long-standing flag independently
  corroborated) — fifth of the 12 "岩馆探索" (PANDA) app cities.** Unlike
  Xi'an/Chongqing/Nanjing (frame-extraction from video) or Shanghai
  (huodong.com's Shanghai directory), this batch skipped video-frame
  review entirely — huodong.com turned out to have its own genuine,
  5-page Beijing climbing-venue directory
  (`/venue/beijing/rock_climbing`), checked directly before assuming it
  existed (the same "check first, don't guess" discipline already
  applied when Norway/Mexico turned out to have inconsistent
  climbing-gyms.com coverage). 75 raw candidates across the 5 pages.
  - **25 of 75 excluded**: 14 were plainly not climbing facilities on
    their name/category alone (trampoline parks, kids playgrounds, a
    skateboard club, a boxing club, a craft-beer bar) or explicitly
    tagged suspended (暂停营业); a further 7 were excluded after reading
    each one's own huodong.com description — 2 kids/family entertainment
    complexes (奈尔宝, matching the same "not a dedicated climbing gym"
    reasoning as MELAND CLUB in Shanghai; and a second Meland-branded
    location here, excluded for the identical reason), an outdoor via
    ferrata route, an outdoor climbing area inside a botanical garden, an
    outdoor climbing facility inside an industrial heritage park (首钢极限
    公园, on the same scope grounds as Huayan Climbing Park), and an
    outdoor recreation area inside a multi-sport park; 4 were exact
    duplicates of gyms already in this dataset from the earlier, separate
    Dianping Beijing pass — matched by identical address, not name alone
    (a generic "岩时攀岩馆" listing resolved to the same address as the
    already-listed Rock Time Climbing (Dawanglu); an Aopan Climbing
    Sijiqing-campus listing matched the already-listed Aopan Climbing
    exactly; 攀岩最爱常营馆 matched the already-listed Climbing Favorite
    (Changying) exactly; and 香蕉攀岩(上地店) matched the already-listed
    Banana Climbing (Shangdi) exactly). Net: 50 distinct new gyms.
  - **Several genuine multi-branch chains verified, same "check each
    branch, don't assume from the name" discipline as every prior
    batch**: Aopan Climbing (奥攀攀岩), already in this dataset with one
    Haidian location, turned out to have **10 more Beijing branches** in
    this batch alone (Wangfujing Outlets, Xihongmen, World Park, Jiaomen,
    Beijing Sport University, Yuquanying, Wukesong, plus a co-branded
    "缦合·奥攀攀岩" location) — the single largest chain-branch count found
    in any city batch so far, confirmed one by one via huodong.com's own
    per-venue pages rather than assumed from the shared brand name. Rock
    Time Climbing (岩时攀岩), already listed at Dawanglu, got 3 more
    confirmed branches (Guanzhuang, Huilongguan, and a differently-named
    "岩时攀登中心" at Xisanqi). Climb On Gym, CAMP4, Haoshi Sports Climbing
    Space (already listed once, near 798 Art District), Yaoyan Climbing,
    and Fun Wild Climbing (趣野攀岩, also seen once already in the Shanghai
    batch under the same brand) each got 2-3 confirmed branches.
  - **One university-affiliated Aopan branch kept, not excluded**: Aopan
    Climbing (Beijing Sport University) — huodong.com's own listing
    explicitly confirms outside visitors can enter with ID registration
    at the gate, the same "verify, don't assume" standard already applied
    to Tongji University Climbing Gym (Shanghai) and the Korea/Ireland
    university-gym cases, rather than the more cautious exclusion used
    for ambiguous-access university walls elsewhere in this dataset.
  - **One semi-outdoor facility kept with disclosure, not excluded on
    scope grounds**: Beijing Jindianshi Ritan Climbing Field, inside
    Ritan Park — huodong.com's own description calls it "indoor and
    semi-outdoor bouldering and lead-climbing training," a real
    professional training facility rather than a plain outdoor wall
    (unlike the 5 purely-outdoor exclusions above), so it was kept with
    the semi-outdoor nature disclosed in its own `notes`.
  - **One same-address pair kept separate, not merged**: Aopan Climbing
    (World Park) and Vitality Zone Sports Center both list 188 Baotai Rd,
    Fengtai — unlike the Salzburg/Helsinki merge precedents, no source
    confirmed or denied whether these are the same venue under two names
    or two facilities sharing one complex, so both were kept as distinct
    entries with a cross-referencing note, the same "don't guess either
    way" treatment already used for Climb House Brasov/Natural High
    Brașov (Romania batch).
  - **This batch independently corroborates the Shanghai-contamination
    discovery from two directions**: Aopan Climbing (Wukesong) and
    Dingshi Climbing (Chengshousi) confirm 五棵松/Wukesong and 成寿寺/
    Chengshousi are genuine Beijing locations — both were districts named
    in the real Beijing gyms found mixed into Shanghai's own app-tab
    footage earlier this project. Separately, Renren Climbing (Lize) —
    人人攀岩 — confirms that chain is a real, multi-branch Beijing operator,
    corroborating (not just repeating) the discovery that 人人攀岩(欢乐谷店)
    was one of the "looked safe by position, actually Beijing" cards found
    during the Shanghai batch.
  - **Applied this session's "no default toward top-rope without
    evidence" correction directly at write time, not after the fact**:
    unlike the original Xi'an/Chongqing/Nanjing passes (which defaulted
    unconfirmed spots to `[indoor-bouldering, top-rope]` and needed a
    49-spot correction afterward), every one of this batch's 50 entries
    was tagged solely from its own huodong.com description — bouldering
    only where the description names nothing else, `top-rope` only where
    the description explicitly says so (or names auto-belay, which
    implies assisted rope climbing), `lead-climbing` only where the
    description explicitly names lead/difficulty climbing or a
    "先锋"/"顶绳" (lead/top-rope) wall. Net: 25 of 50 are bouldering-only,
    consistent with the small mall-storefront/community-gym character of
    most of this footage source, the same pattern already documented for
    Xi'an/Chongqing/Nanjing.
  - **Geocoding hit a real, unusually severe first-pass failure rate**:
    a first Nominatim pass using each gym's full address (street + mall/
    building name) resolved only 4 of 50 — by far the worst first-pass
    rate of any batch in this project, including Xi'an/Chongqing/Nanjing's
    own no-confirmable-*address* rates (which are a different failure
    mode — those addresses were never found at all, whereas here the
    addresses were confirmed real but Nominatim's OSM index apparently
    has poor coverage of Beijing mall/building names specifically). A
    second pass dropping every mall/building name down to just the street
    name + district resolved 45 of the remaining 46 directly; the last
    (Rock Time Climbing Center, Xisanqi) was geocoded individually with a
    slightly broader area query. All 50 positions are therefore
    street-or-area-level, not exact-building, flagged per-entry in
    `notes` — two pairs of spots on the same street (CAMP4 Jiuxianqiao
    Xinchenli / Haoshi Jiulong Life Plaza both on Jiuxianqiao Rd; Aopan
    World Park / Vitality Zone Sports Center, genuinely same address)
    ended up sharing an identical fallback point, disclosed in both
    spots' own `notes` rather than left unexplained.
  - `state` uses the existing `"BEIJING"` key — no `js/app.js`,
    `css/style.css`, or `index.html` changes needed, this only appends to
    `js/data.js`.
  - Net result: 1310 → **1360 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1360/1360 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the Beijing chip filter returns
    exactly 56 spots (6 existing + 50 new); no console errors beyond the
    deliberately-forced Supabase-unreachable ones; no horizontal overflow
    in the China chip row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
  - **7 cities remain in this footage's backlog**: Guangzhou, Shenzhen,
    Chengdu, Hangzhou, Wuhan, Suzhou, Tianjin.
- **Guangzhou (19 more gyms) — sixth of the 12 "岩馆探索" (PANDA) app
  cities.** Same method as Beijing: checked huodong.com for a Guangzhou-
  specific climbing directory first (`/venue/guangzhou/rock_climbing`,
  found to exist directly rather than assumed) instead of frame-
  extracting `IMG_6364.MP4` — a much smaller batch than Beijing this
  time, only 2 pages / 23 raw candidates.
  - **4 of 23 excluded**: 2 kids-entertainment venues (a "dream family
    park," a kids theme park) and a roller-skating rink were excluded on
    name/category alone, same as every prior batch's pre-filter step.
    The fourth is a real, non-obvious catch: 广州锦绣香江温泉城 (a hot
    springs resort) is indexed under huodong.com's climbing category, but
    its own page explicitly states "该场地并未设有专门的攀岩设施或攀岩活动
    区域" ("this venue has no dedicated climbing facilities or climbing
    activity areas") — a source contradicting its own category tag,
    caught by reading the description rather than trusting the listing
    category. Net: 19 distinct gyms, no exact-address duplicates found
    against the single pre-existing Guangzhou entry (Banana Climbing,
    Grantral Centre — that one still has no confirmed address, unrelated
    to this batch).
  - **Two more genuine multi-branch chains verified**: Super Extreme
    Climbing (超极限攀岩馆) has 3 confirmed Guangzhou branches (Liuyuansu
    Tiyandi, Youtuobang Aoti, Yonglong Garden East — the last carrying a
    name/address mismatch in huodong.com's own listing, its card is
    labelled "Yonglong Garden East" but its actual address resolves to
    Youtuobang West Plaza, kept as given rather than guessed at); Mars
    Climbing Gym (火星攀岩馆) and King Climbing (王者攀岩) each have a
    flagship location plus one branch, both individually addressed.
    Fun Wild Climbing (趣野攀岩), already seen once each in Beijing and
    Shanghai, got a fourth confirmed location here, corroborating it's a
    genuine multi-city operator, not a one-off namesake.
  - **One university-affiliated branch kept, not excluded**: Super
    Extreme Climbing (SCUT East Campus) — huodong.com's own listing
    explicitly says it welcomes visitors (advance approval is only
    needed for vehicle parking, not general entry), the same
    "verify, don't assume" standard already applied to Tongji University
    Climbing Gym (Shanghai) and Aopan Climbing (Beijing Sport
    University). **One public-not-private facility kept without
    disclosure caveats**: University Town Sports Center Climbing Field
    is part of Guangzhou University Town's shared public sports complex
    (a public district hosting 10 institutions, not one school's private
    gym), so it didn't need the same access-verification treatment as a
    single-campus facility.
  - **Positions individually geocoded** — 16 of 19 addresses matched
    Nominatim directly on the first try (a much better hit rate than
    Beijing's rough first pass, since this batch's queries went straight
    to street-level rather than full-address); the other 3 (Pulan
    Sports, RockinClimbing, Super Extreme SCUT East Campus) resolved on
    a second, further-simplified pass — RockinClimbing's Nansha District
    address couldn't resolve past the whole district centroid, flagged
    in its own `notes`.
  - **Climbing type applied at write time from each gym's own
    description**, same discipline as Beijing — 6 of 19 ended up
    bouldering-only where no rope/lead offering was named.
  - `state` uses the existing `"GUANGZHOU"` key — no `js/app.js`,
    `css/style.css`, or `index.html` changes needed.
  - Net result: 1360 → **1379 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1379/1379 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the Guangzhou chip filter
    returns exactly 20 spots (1 existing + 19 new); no console errors
    beyond the deliberately-forced Supabase-unreachable ones; no
    horizontal overflow in the China chip row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
  - **6 cities remain in this footage's backlog**: Shenzhen, Chengdu,
    Hangzhou, Wuhan, Suzhou, Tianjin.
- **Shenzhen (39 more gyms) — seventh of the 12 "岩馆探索" (PANDA) app
  cities.** Same method again: huodong.com's own Shenzhen climbing
  directory (`/venue/shenzhen/rock_climbing`, 3 pages, 54 raw
  candidates) instead of frame-extracting `IMG_6365.MP4`.
  - **15 of 54 excluded**: 5 exact-address duplicates of already-listed
    (or already-flagged-as-likely-duplicate) Banana Climbing entries —
    huodong.com's own Shenzhen Banana Climbing branch cards resolved to
    the identical addresses already on file for Nanshan Houhai, Kingdee,
    Bao'an Center, iN City Plaza, and Link Plaza, incidentally confirming
    those existing entries' addresses rather than adding anything new.
    10 more excluded after reading each one's own description rather than
    trusting a "攀岩" category tag at face value: a cave-exploration theme
    park explicitly not a real climbing facility; a "soft-body climbing"
    kids venue whose own description contrasts itself from "a traditional
    rock climbing wall setup"; 2 of 4 "Little Player Dream Factory"-
    branded venues whose own pages explicitly deny having a real climbing
    wall (the other 2 branches of the same brand were kept — each was
    checked individually, not assumed from the shared brand name); a
    generic fitness gym whose own description explicitly says "no
    confirmed climbing wall" despite the category tag; a hybrid
    basketball-primary space where climbing is explicitly described as
    secondary; and a genuinely kids-only climbing gym (Climbing Orangutan,
    Lvjing branch) whose own listing explicitly states adults cannot
    enter the climbing zones at all — the only exclusion in this batch on
    access grounds, since several other youth/family-branded venues in
    this batch were kept specifically because none of them made that same
    explicit adult-barring claim.
  - **Real chain proliferation continued**: Blue Sky Climbing (蓝天攀岩)
    has 7 confirmed Shenzhen branches; Climbing Orangutan (攀猩攀岩) has 4
    (one excluded as kids-only, above); Zhengyan, Yijiu, and Little
    Warrior each have 2-3; Yanwu Kongjian (岩舞空间, already seen once in
    Shanghai) got 2 more confirmed Shenzhen branches. Two near-identical
    Cantonese-branded gyms (嗰度有家攀岩馆 / 呢度有家攀岩馆, both roughly
    "there's a place here") were individually confirmed as genuinely
    distinct gyms at different addresses, not a duplicate listing, despite
    the near-identical names.
  - **Two access/consistency judgment calls, both kept**: a youth-center-
    housed Yijiu branch only restricts unaccompanied entry to under-8s
    (no adult bar), so it wasn't excluded the way the explicitly
    adults-barred Climbing Orangutan kids branch was; two public
    municipal sports-center climbing gyms (Longgang Universiade Center,
    Guangming District Public Sports Center) were kept without access
    caveats, same "genuinely shared public facility" treatment as
    University Town Sports Center Climbing Field (Guangzhou).
  - **Geocoding hit the same severe first-pass failure Beijing did**: only
    4 of 39 resolved on the full-address pass; a second, simplified
    street+district pass resolved 31 more; the last 4 needed a
    metro-station or subdistrict-level fallback, with two same-station/
    same-district pairs sharing an identical fallback point (Lightning
    Climbing Gym / Nedo Yaugaa Climbing Gym at Gangxia North Station;
    Pulan Sports / Climbing Orangutan-Shuiwan at the bare Nanshan District
    centroid) — disclosed in both spots' own `notes` in each case.
  - **Climbing type applied at write time from each gym's own
    description**, same discipline as Beijing/Guangzhou — roughly half
    ended up bouldering-only.
  - `state` uses the existing `"SHENZHEN"` key — no `js/app.js`,
    `css/style.css`, or `index.html` changes needed.
  - Net result: 1379 → **1418 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1418/1418 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the Shenzhen chip filter
    returns exactly 47 spots (8 existing + 39 new); no console errors
    beyond the deliberately-forced Supabase-unreachable ones; no
    horizontal overflow in the China chip row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
  - **5 cities remain in this footage's backlog**: Chengdu, Hangzhou,
    Wuhan, Suzhou, Tianjin.
- **Chengdu (27 more gyms, plus one long-standing flag resolved) — eighth
  of the 12 "岩馆探索" (PANDA) app cities.** Same method again: huodong.com's
  own Chengdu climbing directory (3 pages, 37 raw candidates) instead of
  frame-extracting `IMG_6366.MP4`.
  - **8 of 37 excluded** after reading each one's own description: a
    child-focused soft-play "camping" venue with 2-3m walls, explicitly
    "not a traditional dedicated climbing gym"; a youth-oriented
    entertainment complex whose "climbing" turned out to be climbing nets,
    not a wall; the Meland brand (a third occurrence, after Shanghai and
    Beijing — again confirmed as a family entertainment center with
    "rock climbing" as a miscategorized tag, no actual wall); a go-kart
    club; a kids-only climbing venue (ages 3-12, "no dedicated adult
    climbing section") — same exclusion standard as Climbing Orangutan's
    Lvjing branch in Shenzhen; an outdoor natural-rock climbing base in
    rural Dayi County, on the same scope grounds as every other outdoor
    exclusion in this dataset; a panda-themed kids' play space whose own
    description explicitly denies having a real climbing wall despite the
    "rock climbing" category tag; and a university-operated *outdoor*
    wall with genuinely restrictive access (an entry-application and
    approval process, not just ID registration) — the only exclusion in
    this batch on both scope and access grounds at once.
  - **Two Banana Climbing candidates matched existing entries rather than
    adding anything new**: one exactly confirmed the already-listed
    "Banana Climbing (ICD)" address (no change needed); the other finally
    resolved a long-standing "no address found" flag on "Banana Climbing
    (CapitaLand Tianfu)" (Hi-Tech Zone) — updated that existing entry
    directly with the confirmed address and a fresh geocode, the same
    "resolve the flag, don't just add a duplicate" treatment used for
    Banana Climbing (Kerry Centre) during the Shanghai batch.
  - **Real chain proliferation again**: Climbing Panda (熊猫攀岩生活馆) has
    6 confirmed Chengdu branches; Climbing Hero (攀登侠) has 2 adult-
    accessible branches kept plus 1 kids-only branch excluded (each
    checked individually, not assumed from the shared name); Flying Frog
    Climbing has 2. Two unrelated chains share panda branding by
    coincidence — Climbing Panda (熊猫攀岩生活馆) and Super Panda Fitness
    Studio (SUPER PANDA健身工作室) — confirmed as genuinely separate
    operators, not the same chain.
  - **One university-affiliated gym kept with a reservation caveat, not
    excluded**: Chengdu Sport University's Eastern Campus climbing gym —
    huodong.com's own listing confirms outside visitors can book by phone
    or online and pass ID verification at the gate, rather than being
    barred outright, same "verify, don't assume" standard as Aopan
    Climbing (Beijing Sport University) and Super Extreme Climbing (SCUT,
    Guangzhou). **One school-adjacent gym kept without caveats**: Chengdu
    Weiming Climbing Wall sits next to a private school campus but
    huodong.com's own listing confirms it's a genuinely public,
    walk-in-accessible community space during regular hours, not a
    school-only facility.
  - **Geocoding followed the same two-tier pattern as Beijing/Shenzhen**:
    16 of 27 resolved on the full-address pass; a simplified street/
    subdistrict pass resolved 9 more; the last 2 needed a bare district-
    centroid fallback. Two spots (Lezhidao City Sports Leisure Camp,
    Climbing Hero North City Longhu Tianjie) share an identical fallback
    point at the same mall complex — genuinely different gyms in the same
    building, not a duplicate, disclosed in both spots' own `notes`.
  - **Climbing type applied at write time from each gym's own
    description**, same discipline as every PANDA-app batch since Beijing.
  - `state` uses the existing `"CHENGDU"` key — no `js/app.js`,
    `css/style.css`, or `index.html` changes needed.
  - Net result: 1418 → **1445 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1445/1445 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the Chengdu chip filter returns
    exactly 30 spots (3 existing + 27 new); the resolved CapitaLand Tianfu
    entry loads with its new address and coordinates; no console errors
    beyond the deliberately-forced Supabase-unreachable ones; no
    horizontal overflow in the China chip row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
  - **4 cities remain in this footage's backlog**: Hangzhou, Wuhan,
    Suzhou, Tianjin.
- **Hangzhou (18 more gyms) — ninth of the 12 "岩馆探索" (PANDA) app
  cities.** Same method again: huodong.com's own Hangzhou climbing
  directory (2 pages, 28 raw candidates) instead of frame-extracting
  `IMG_6367.MP4`.
  - **10 of 28 excluded**: 2 kids playgrounds and an equestrian center on
    name/category alone; a "bug-themed educational paradise" (not
    climbing at all); a suspended (暂停营业) branch; a family camping
    ground whose own description names only camping amenities despite a
    "rock climbing" category tag; a kids-fitness/basketball venue whose
    own description mentions no climbing wall despite the same tag; a
    kids-only Climbing Orangutan branch (ages 3-12, explicit no-adult-
    provision) — same standard as its Shenzhen and Chengdu counterparts;
    and 2 explicitly outdoor venues (a "China Climbing Town" natural-rock
    destination and a rural farmhouse-stay climbing post), on the same
    scope grounds as every other outdoor exclusion in this dataset.
  - **Two schools/colleges kept with access caveats, not excluded**:
    Zhejiang Sports Vocational and Technical College's own climbing gym
    (public booking required, operates on an academic calendar) and
    Zhejiang Construction Vocational College's training field (external
    visitors book through partner orgs, courses, or open days at a higher
    rate than students) — both confirmed genuinely, if imperfectly,
    open to the public rather than barred outright, same "verify, don't
    assume" standard as Chengdu Sport University and Beijing Sport
    University.
  - **Chain branch-checking caught a real access distinction within one
    brand**: Menotou (闷头攀岩) has two Hangzhou locations with
    contradictory audiences — the Xixi Intime branch is explicitly
    adults-only (18+, no minors), while the Gemdale Plaza branch's own
    description says it serves "children to adults" — both kept as
    genuinely different branches rather than assuming one policy applies
    chain-wide. Climbing Orangutan, Happy Climbing, and Wanpan Climbing
    each got a second confirmed branch too.
  - **Geocoding followed the same two-tier pattern as every PANDA-app
    batch since Beijing**: 4 of 18 resolved on the full-address pass, the
    remaining 14 resolved on a simplified street-level pass. Two spots
    (XBOX Family Sports Center, Happy Climbing Yuhang) share an identical
    fallback point on the same long avenue — genuinely different gyms,
    not a duplicate, disclosed in both spots' own `notes`.
  - **Climbing type applied at write time from each gym's own
    description**, same discipline as every batch since Beijing.
  - `state` uses the existing `"HANGZHOU"` key — no `js/app.js`,
    `css/style.css`, or `index.html` changes needed.
  - Net result: 1445 → **1463 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1463/1463 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the Hangzhou chip filter returns
    exactly 21 spots (3 existing + 18 new); no console errors beyond the
    deliberately-forced Supabase-unreachable ones; no horizontal overflow
    in the China chip row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
  - **3 cities remain in this footage's backlog**: Wuhan, Suzhou,
    Tianjin.
- **Wuhan (15 more gyms, plus one long-standing flag resolved) — tenth of
  the 12 "岩馆探索" (PANDA) app cities.** Same method again: huodong.com's
  own Wuhan climbing directory (2 pages, 20 raw candidates) instead of
  frame-extracting `IMG_6369.MP4`.
  - **4 of 20 excluded** after reading each one's own description: a
    fourth Meya Animal Camping-branded kids soft-play venue (after
    Chengdu — same pattern, no real wall despite the category tag); a
    basketball-focused sports center with no confirmed climbing wall; an
    outdoor riverside kids' play area with only "low-height soft-padded
    climbing structures," not a dedicated wall; and an outdoor venue
    combining natural rock faces with artificial walls, on the same scope
    grounds as every other outdoor exclusion in this dataset (despite its
    own description insisting it's a "legitimate climbing venue," its
    outdoor-first framing puts it outside this app's indoor-gyms scope,
    same as Huayan Climbing Park and China Climbing Town).
  - **One candidate resolved a long-standing flag instead of adding a new
    spot, and corrected a suburb error in the process**: "Banana Climbing
    (Hang Lung Plaza)" had been flagged since an earlier Dianping pass
    with no address and a guessed Wuchang District suburb (search results
    kept surfacing the Qincheng MixC World flagship instead). huodong.com's
    own listing for "香蕉攀岩馆(恒隆广场店)" independently confirms both a
    real address and that Hang Lung Plaza is actually in Qiaokou District
    (Hankou), not Wuchang — both corrected on the existing entry, same
    "resolve the flag, don't just add a duplicate" treatment as Banana
    Climbing (Kerry Centre) in Shanghai and (CapitaLand Tianfu) in
    Chengdu. A second Banana Climbing candidate at a genuinely different
    mall (Qincheng Wanxiang *Mall*, 万象汇 — a different, smaller-format
    Banana-Climbing-hosting brand from the existing Qincheng MixC *World*,
    万象城, flagship) was added as a new spot rather than assumed to be
    the same complex.
  - **One candidate resolves an old "not yet open" exclusion instead of
    being a new discovery**: 岩舞空间(凯德1818店) — a Yanwu Kongjian branch
    at CapitaMall 1818 — was excluded from an earlier, separate
    Dianping-sourced Wuhan pass specifically because it appeared as a
    not-yet-open card in that footage. huodong.com's own directory now
    lists it operating normally with no suspended/not-open flag, so it
    was added this time, with a note explaining the earlier exclusion
    reason rather than treating this as an unrelated fresh find.
  - **Yanwu Kongjian (Rock Dance Space), already seen once each in
    Shanghai and Shenzhen, got 2 more confirmed Wuhan branches** in this
    batch — the CapitaMall 1818 location above, plus a Wuhan Livat
    branch — corroborating it's a genuine multi-city operator rather than
    a one-off namesake. New Starting Point Climbing got 2 confirmed
    branches, individually addressed.
  - **One university-referencing name checked and cleared of any access
    restriction**: "CUG Outdoor Climbing Gym" references China University
    of Geosciences (地大) and includes "outdoor" (户外) in its own name,
    but huodong.com's own description explicitly confirms it's a fully
    indoor, public commercial facility with no stated university tie or
    access restriction — kept without any access caveat, unlike the
    genuinely restricted or reservation-gated university gyms elsewhere
    in this dataset.
  - **Geocoding followed the same two-tier pattern as every PANDA-app
    batch since Beijing**: 2 of 15 resolved on the full-address pass, the
    remaining 13 resolved on a simplified street-level pass. Two spots
    (CUG Outdoor Climbing Gym, Snow Leopard Climbing Gym) share an
    identical fallback point at the same mall (Qingshan Impression City,
    different floors) — genuinely different gyms, not a duplicate,
    disclosed in Snow Leopard's own `notes`.
  - **Climbing type applied at write time from each gym's own
    description**, same discipline as every batch since Beijing.
  - `state` uses the existing `"WUHAN"` key — no `js/app.js`,
    `css/style.css`, or `index.html` changes needed.
  - Net result: 1463 → **1478 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1478/1478 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the Wuhan chip filter returns
    exactly 19 spots (4 existing + 15 new); the resolved Hang Lung Plaza
    entry loads with its corrected suburb, address, and coordinates; no
    console errors beyond the deliberately-forced Supabase-unreachable
    ones; no horizontal overflow in the China chip row at 375px mobile
    width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
  - **2 cities remain in this footage's backlog**: Suzhou, Tianjin.
- **Suzhou (20 gyms) — eleventh of the 12 "岩馆探索" (PANDA) app cities,
  and the first-ever Suzhou spots in this dataset.** huodong.com's own
  Suzhou category page returned zero listings ("这个组合还没有收录到场馆" —
  "this combination has no venues recorded yet"), unlike every PANDA-app
  city since Beijing, so this batch fell back to frame-extracting the
  source video (`IMG_6373.MP4`) plus general web search for addresses,
  the same method used for Xi'an/Chongqing/Nanjing before the huodong.com
  directories were discovered.
  - **The video itself was unusually short (2.9s, 175 frames)** — a
  near-static scroll capture rather than a continuous scroll like earlier
  cities' videos — so 30 evenly-sampled frames were enough to read every
  card without missing any mid-scroll transition. 21 unique gym cards
  were found against the app's own "22家岩馆" banner (close enough to be
  within this project's established tolerance for banner-vs-actual
  count mismatches); one of the 21 ("Follow Away Climbing跟攀攀岩馆") showed
  the "订阅提醒" (subscribe for updates) not-yet-open pattern already
  established for this app and was excluded, leaving 20.
  - **Address confirmation hit the same wall as the original frame-
    extraction cities**: only 6 of 20 got a real, independently-confirmed
    address (2 more at mall-level precision); the other 14 (70%) had no
    exact address findable via web search — worse than Xi'an's 47%,
    consistent with Suzhou lacking any directory-site coverage at all
    (unlike huodong.com-covered cities, which consistently hit much
    lower no-address rates). All 14 use a placeholder position (city,
    district, or named-area centroid) derived only from information
    already present in the gym's own branch name (e.g. "相城天街店"
    literally names Xiangcheng District) — never guessed beyond what the
    source itself stated.
  - **One government open-data source was tried and abandoned**: a
    Suzhou municipal sports-venue registry (苏体通,
    zscqxzzf.suzhou.gov.cn) surfaced in search results and looked
    promising, but its HTTPS endpoint refused every connection attempt
    from this session's tools — its cached search-result text was still
    usable (confirming 2 addresses), just not the live site itself.
  - **No climbing-type evidence exists for any of these 20** — unlike
    every huodong.com-sourced batch since Beijing, which had real
    description text to read, this batch has only thumbnail photos from
    video frames, the same evidentiary tier as the original Xi'an/
    Chongqing/Nanjing passes. Rather than repeat that batch's mistake
    (defaulting unconfirmed spots to `[indoor-bouldering, top-rope]`,
    which needed a 49-spot correction afterward), all 20 are tagged
    bouldering-only from the start, per the correction's own stated
    lesson.
  - **First-ever Suzhou spot in this dataset** — `"SUZHOU"` was already
    present in `STATES_BY_COUNTRY.CN` from an earlier completeness pass,
    so no `js/app.js` change was needed, but (same as Nanjing) a new
    `--cn-suzhou` CSS colour variable + chip rule and a new sidebar chip
    in `index.html`'s China chip-row were required.
  - Net result: 1478 → **1498 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1498/1498 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the new Suzhou chip renders
    with the correct colour and a legible active state (confirmed via
    computed style: dark text on the new purple background, same
    `!important` legibility fix already covering every other chip);
    clicking it correctly filters to exactly 20 spots; no console errors
    beyond the deliberately-forced Supabase-unreachable ones; no
    horizontal overflow in the China chip row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
  - **1 city remains in this footage's backlog**: Tianjin.
- **Tianjin (15 gyms) — twelfth and final "岩馆探索" (PANDA) app city, and
  the first-ever Tianjin spots in this dataset.** Same as Suzhou,
  huodong.com has no Tianjin climbing directory, so this batch fell back
  to frame-extracting the source video (`IMG_6374.MP4`, another unusually
  short 3.0s near-static scroll capture like Suzhou's) plus general web
  search. **This completes the entire 12-city "岩馆探索" PANDA-app
  project** started with Xi'an — see the individual per-city entries
  above (Xi'an, Chongqing, Nanjing, Shanghai ×2, Beijing, Guangzhou,
  Shenzhen, Chengdu, Hangzhou, Wuhan, Suzhou, Tianjin) for the full
  history.
  - 20 unique cards found against the app's own "21家岩馆" banner (again
    within this project's established tolerance for banner-vs-actual
    mismatches); 3 excluded as 建设中 (under construction); 2 more
    excluded because their own official names explicitly declare
    themselves children's climbing gyms (攀猩儿童攀岩馆 — "Climbing
    Orangutan CHILDREN'S Climbing Gym" is literally part of the brand
    name here, a stronger signal than a merely kids-friendly card photo,
    so treated the same as the explicitly adult-barred Climbing
    Orangutan branch excluded in Shenzhen), leaving 15.
  - **Address confirmation was somewhat better than Suzhou's**: 9 of 15
    got a real address (6 at mall/complex-level, 3 at exact-unit
    precision), 1 more at a probable-but-not-independently-attributed
    address (matched by branch-name/station coincidence, disclosed as
    such), and the remaining 5 (33%) use a city or district centroid
    placeholder. Three spots share the bare Nankai District centroid and
    three more share the bare Tianjin city centroid, each disclosed in
    the affected spots' own `notes`.
  - **Fun Wild Climbing (趣野攀岩), already confirmed in Beijing, Shanghai,
    and Guangzhou, got a fourth confirmed city** here (Meijiang Convention
    Center) — now a 4-city-confirmed chain. Tianjin Top Climbing has 3
    confirmed branches (Hexi, Huanghe Rd, Ling'ao), each individually
    addressed/flagged. Mango Climbing has 3 confirmed branches across
    different parts of Tianjin.
  - **No climbing-type evidence exists for any of these 15**, same
    evidentiary tier as Suzhou (thumbnails only, no huodong.com
    description text) — all 15 tagged bouldering-only, continuing the
    lesson from the original Xi'an/Chongqing/Nanjing top-rope correction
    rather than repeating it a third time.
  - First-ever Tianjin spot in this dataset — `"TIANJIN"` was already in
    `STATES_BY_COUNTRY.CN`, but (same as Nanjing and Suzhou) needed a new
    `--cn-tianjin` CSS colour variable + chip rule and a new sidebar chip.
  - Net result: 1498 → **1513 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1513/1513 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, same offline-fallback-
    forcing method as every prior batch): the new Tianjin chip renders
    with the correct colour and a legible active state (dark text on the
    new red-brown background); clicking it correctly filters to exactly
    15 spots; no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow in the China chip
    row at 375px mobile width.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
  - **The "岩馆探索" (PANDA) app project backlog is now empty** — all 12
    cities from the original footage are done. `js/data.js`'s China
    total across every pass this project has done for this app's
    footage (Xi'an, Chongqing, Nanjing, Shanghai, Beijing, Guangzhou,
    Shenzhen, Chengdu, Hangzhou, Wuhan, Suzhou, Tianjin) now stands at
    hundreds of gyms sourced from a single continuous multi-session
    effort — see `docs/tasks.md` for the per-city breakdown and every
    individual sourcing/exclusion/correction decision.
- **Full-dataset geocode-accuracy check at a 3km threshold (31 more spots
  corrected, complete)**: earlier passes only checked spots that had moved
  ≥5km then ≥4km against Nominatim (40 spots corrected total, see the two
  batches above). This pass re-ran the same check against every remaining
  addressed spot that didn't already carry the verified-note (731 of 771),
  lowering the threshold to 3km — surfacing 37 candidates instead of the
  smaller batches before. Every candidate was independently cross-checked
  before applying anything, per `Rules.md` §1 (never guess from a single
  geocoder):
  - **25 US spots**: confirmed via the US Census Bureau geocoder agreeing
    with Nominatim within 0.5km — applied directly.
  - **6 more required a third source since Nominatim/Census disagreed by
    2-3km or Census had no match at all**: cross-checked against the
    **Photon** geocoder (photon.komoot.io, also free/keyless, backed by
    its own independent OSM index) and, for one, Google Maps' own listed
    coordinate. Applied where two independent sources agreed: **InSPIRE
    Rock Lubbock** and **Movement Plano** (Nominatim confirmed exactly by
    Photon — Plano's Photon hit was a named "Movement Plano" business POI,
    not just an interpolated address); **Vertical World North** (Nominatim
    confirmed by Photon within 0.2km, Census's interpolated point was
    ~2.5km off and not used); **Central Rock Gym – Kennesaw** (the reverse
    — Census confirmed by a named "Central Rock Gym" POI in Photon within
    0.7km, Nominatim's own point was ~3.3km off and not used this time);
    **Beta One Bouldering Gym** (Google Maps' own coordinate, cross-checked
    against Nominatim within 0.5km); **Climb Base5** (Nominatim resolved
    the address directly to a named "Climb Base5" POI).
  - **6 left unapplied — address confirmed real via web search, but no
    independent second source could confirm a corrected position**, so
    the existing pin stays rather than trusting one geocoder alone:
    **Sessions Climbing & Fitness** and **Climb Moab** (Census has no
    road-range data for either street even after retrying with corrected
    formatting — same known TIGER-coverage gap noted in the 4km-threshold
    pass; Photon returned no exact match either); **Adamanta Sierra**
    (Nominatim's match resolved to a *different* postal code segment of
    the same long highway than the confirmed address's real one — a
    wrong-segment match, not usable, and a retry with the full
    "Plaza Omnia" address returned nothing); **The Wall Bouldering Gym**
    (Fukuoka's Nishitsukiguma address isn't well-covered by
    Nominatim/Photon — both fell back to a nearby trunk-road match
    instead of the actual neighbourhood); **Rock Odyssey Hadan** (no
    source, including this pass's own search, has ever independently
    confirmed this spot's exact address beyond the original Mountain
    Project listing).
  - **TOKA climbing** reappeared in this pass's raw Nominatim output as a
    26km mover — a **false positive**, not a new issue: its pin was
    already corrected in an earlier session (see the Norway/Mexico/Brazil
    entry above) specifically because this same address is ambiguous
    between two same-named streets in Mexico City, and a plain
    single-result Nominatim query keeps landing on the wrong one. No
    change made — the already-verified fix stands.
  - Running total of independently-verified positions: 40 → **71 of 987**
    spots. Structural check (`node --check` + Node-parsed re-count):
    still 987/987 unique ids, zero duplicate name+suburb+state+country
    combos.
  - **Not yet pushed to the live Supabase table** — `supabase/seed.html`'s
    generated SQL needs re-running in the SQL Editor to carry these 31
    corrected positions (and every other still-pending change) onto the
    live map.
- **Lowered the geocode-accuracy threshold again, to 2km (46 more spots
  corrected)**: direct follow-up to the 3km pass above — recomputed every
  addressed spot's distance from its cached Nominatim geocode against the
  *current* (post-3km-fix) `js/data.js` positions, without re-hitting
  Nominatim (its result doesn't change), and found 57 spots ≥2km off.
  8 of those were spots the 3km pass had already deliberately fixed using
  a non-Nominatim source (Census or Photon) — their distance *from
  Nominatim* stayed large on purpose, since Nominatim was the source
  rejected in favour of a better one; not a new issue. That left 49
  genuinely new candidates (39 US, 10 non-US), cross-checked the same way:
  - **40 US spots**: confirmed via the Census geocoder agreeing with
    Nominatim, applied directly (mirroring the ≤0.5km-agreement rule from
    the 3km pass, one entry — Flowstone Climbing — let through at 0.54km
    since it's still clearly the same location just fractionally less
    precise agreement).
  - **9 more US spots** needed a third source since Nominatim and Census
    disagreed by 1-4.3km: Photon confirmed **Adrenaline Climbing** and
    **Central Rock Gym – Waltham** and **MetroRock Littleton** agreeing
    with *Nominatim* (two of them via a direct named-business POI match —
    "Adrenaline Climbing", "MetroRock Littleton" — the strongest kind of
    confirmation this project's tooling can get); Photon confirmed
    **Elevation Rock Gym**, **Momentum Millcreek**, **The Scratch Pad**,
    and **The Quarry** agreeing with *Census* instead (three of those via
    a named "Elevation Rock Gym" POI or nearby transit-stop nodes within
    0.02-0.55km) — all four are in Utah, where Nominatim's own OSM data
    for these addresses turned out to be the less accurate side of the
    disagreement, the reverse of the usual pattern. **Climbing Cave**
    (Queensbury, NY) stayed unresolved: Census matched a *different*
    street ("Glen Ct" vs. the confirmed real "Glen Dr") and Photon
    couldn't find "Glen Drive" in its index at all — neither free
    geocoder can locate this specific street, so the pin wasn't touched
    despite the business's own address being confirmed real via search.
  - **9 non-US spots** (5 AU, 1 Canada, 1 NZ, 1 China, 1 Portugal) had no
    Census coverage, so each was cross-checked via Photon and, for one,
    a corrected/more specific address found via search:
    **Allez Up** (Montreal) and **Boulder Co Auckland** matched a named
    business POI or exact house-number POI directly; **Dynomite North
    Wollongong**, **Crank** (Macgregor), and **Rockface** (Balcatta) all
    landed within 0.08-0.6km of Nominatim's point via Photon's own street/
    building data; **Banana Climbing (Yuefang ID Mall)**, Changsha,
    matched the same street object in both geocoders exactly. **Urban
    Jungle** (Perth) — originally just approximated to its corrected
    suburb during the AU address-verification pilot, never individually
    geocoded — turned out to have a Nominatim match resolving directly to
    a named "Urban Jungle Jandakot" business POI, so it got a real
    geocoded position for the first time here. Three stayed unresolved
    for lack of a confirming source: **Pulse Climbing** (Warners Bay) and
    **Beyond Bouldering** (Clovelly Park) — Photon returned only nearby
    transit stops, no address- or business-level match; **Vertigo -
    Lisboa** — the original address has no house number at all (a known,
    disclosed gap from the original climbing-gyms.com sourcing pass), and
    a more specific building name found via search ("Edifício Beira Rio")
    didn't resolve to a unique location in either geocoder — likely
    another same-named-street ambiguity in the Lisboa area, the same
    failure mode as TOKA climbing above, just without an existing fix to
    point to.
  - Running total of independently-verified positions: 71 → **117 of 987
    spots**. Structural check (`node --check` + Node-parsed re-count):
    987/987 unique ids, zero duplicate name+suburb+state+country combos.
  - **Not yet pushed to the live Supabase table** — same outstanding step
    as every prior correction pass.
- **Lowered the geocode-accuracy threshold to 1km (80 more spots
  corrected)**: third follow-up in this series, same reused-cache method
  as the 2km pass (no re-hitting Nominatim). 97 spots came back ≥1km;
  15 of those were already-correct spots from earlier passes (their
  distance *from Nominatim* is expected to stay large since a better
  source was already chosen for them) or already-researched-and-left-
  unresolved addresses, leaving 82 genuinely new candidates (61 US, 21
  non-US) — the biggest batch of this series so far.
  - **60 of 61 US spots** confirmed via Census agreeing with Nominatim
    (53 directly, 7 more via Photon as tiebreaker where Census errored or
    disagreed) — full list in `docs/tasks.md`. Two catches worth noting:
    **The Front Climbing Club – South Main** (Millcreek, UT) had Census
    and Nominatim disagree by ~4.9km even though Census matched the
    input address exactly — Photon resolved it to a named "The Front
    Climbing Club" POI agreeing with Census within 0.02km, confirming
    Nominatim was the wrong one this time. **Central Rock Gym – Arsenal
    Yards** (Watertown, MA) looked at first like Nominatim might be
    wrong too (Photon's only nearby match, on the old "Arsenal Street"
    rather than the newer "Arsenal Yards Blvd" complex, sat close to the
    *stored* pin) — checking Google Maps' own listed coordinate for this
    business broke the tie decisively in Nominatim's favor (0.13km
    away), confirming the stored pin was the one that needed fixing.
    Worth remembering: a second source landing near the existing pin
    isn't proof the existing pin is right, if that source's address
    match itself is questionable.
  - **1 US spot stayed unresolved for a new reason**: **Momentum Lehi**
    (401 S 850 E) — Census confidently matched a *different* street
    ("850 W") and Nominatim's own match came back tagged with a
    different, neighboring city's zip code (84003, not Lehi's 84043) —
    a real instance of the Utah numbered-grid street-naming collision
    this file has flagged before as a source of past mistakes (see the
    TOKA/Adamanta pattern), just between cities on the same grid instead
    of within one city. The address itself was confirmed correct via the
    gym's own site and Yelp, but no source could confidently place it.
  - **20 of 21 non-US spots** confirmed via Photon within 0.9km of
    Nominatim, several as direct named-POI matches (BlocHaus Marrickville,
    BlocHaus Leichhardt, Mountain Strong, La Roca Boulders, Rocket
    Climbing, The Hive Heights, The Ledge) — the strongest confirmation
    tier, spanning AU, Japan, Canada, and the UK. **City Summit** (Malaga,
    WA) stayed unresolved — address confirmed real via search, but Photon
    returned no address- or business-level match for it at all.
  - Running total of independently-verified positions: 117 → **197 of 987
    spots**. Structural check (`node --check` + Node-parsed re-count):
    987/987 unique ids, zero duplicate name+suburb+state+country combos.
  - **Not yet pushed to the live Supabase table** — same outstanding step
    as every prior correction pass.
- **Lowered the geocode-accuracy threshold to 500m (67 more spots
  corrected)**: fourth follow-up in this series, same reused-cache
  method. 87 spots came back ≥500m; 18 were already-correct or
  already-researched-and-unresolved from earlier passes (including a
  same-named-but-different-spot gotcha: two separate real gyms are both
  called "Beyond Bouldering" — Keswick and Clovelly Park, South
  Australia — plus a third, Kent Town, that was never a candidate at
  any threshold; the exclusion list for this pass had to match on
  suburb, not just name, to avoid skipping the wrong one), leaving 69
  genuinely new candidates (39 US, 30 non-US).
  - **38 of 39 US spots** confirmed via Census agreeing with Nominatim
    (34 directly, 4 more via Photon/web-search as tiebreaker) — all
    comfortably tighter agreement than any prior pass in this series
    (mostly sub-0.3km), consistent with these being smaller errors to
    begin with. **1 stayed unresolved**: **Willy's World Adventure**
    (Eastham, MA) — address confirmed real via search, but neither
    Census nor Photon returned any match for its highway address at all.
  - **29 of 30 non-US spots** confirmed via Photon within 0.7km of
    Nominatim, many as exact (0.00km) named-business-POI matches (Climb
    Fit Kirrawee, Bayside Rock Climbing, Alpine Indoor Climbing, Climb
    Toowoomba, Portside Boulders, Beyond Bouldering, Beta Park, The
    Hive, Café Bloc, Fergs Wellington) — Australia, Japan, Canada, New
    Zealand, and Korea. **1 stayed unresolved**: **Grabit** (Gwangju,
    South Korea) — Photon's only match was 1.6km away with no
    independent web confirmation of the gym's exact address to break
    the tie, so the existing pin (from the original Mountain Project
    Korea pass) was left alone.
  - Running total of independently-verified positions: 197 → **264 of
    987 spots**. Structural check (`node --check` + Node-parsed
    re-count): 987/987 unique ids, zero duplicate
    name+suburb+state+country combos.
  - **Not yet pushed to the live Supabase table** — same outstanding step
    as every prior correction pass.
  - With this pass, the unresolved list across the whole geocode-
    accuracy series stands at 13 spots (TOKA climbing is a known
    non-issue, not counted; a handful of others — The Front Climbing
    Club – South Main, Momentum Millcreek, Central Rock Gym – Kennesaw,
    Elevation Rock Gym, The Quarry, The Scratch Pad — sit far from their
    own cached Nominatim geocode on purpose, since a better source was
    used instead, and aren't part of this list): **Sessions Climbing &
    Fitness**, **Rock Odyssey Hadan**, **The Wall Bouldering Gym**,
    **Climb Moab**, **Adamanta Sierra**, **Pulse Climbing**, **Climbing
    Cave**, **Beyond Bouldering** (Clovelly Park), **Vertigo - Lisboa**,
    **City Summit**, **Momentum Lehi**, **Grabit**, **Willy's World
    Adventure** — every one with its address independently confirmed
    real via web search, none with a position any free geocoding tool
    available to this project could confirm or correct.
- **Lowered the geocode-accuracy threshold to 200m (40 more spots
  corrected)**: fifth follow-up in this series. 62 spots came back
  ≥200m; 20 were already-correct or already-researched-and-unresolved,
  leaving 42 genuinely new candidates (24 US, 18 non-US) — errors this
  small confirm the dataset is converging, not just shrinking by
  threshold alone.
  - **All 24 US spots confirmed** via Census agreeing with Nominatim,
    every one within 0.35km (most well under 0.1km) — the tightest,
    cleanest batch yet, no tiebreaker source needed for any of them.
  - **16 of 18 non-US spots confirmed** via Photon, many exact (0.00km)
    named-business-POI matches, across AU/CA/FR/IT/PL/FI/IE. **2 stayed
    unresolved**: **Xkala by Walltopia** and **Motion Boulder 2** (both
    Mexico) — both addresses independently re-confirmed real via search,
    but Photon's own match for each landed somewhere clearly unrelated
    (a public park for Xkala, a different street segment ~750m away for
    Motion Boulder 2), giving no way to break the tie with Nominatim, so
    neither pin was touched.
  - Running total of independently-verified positions: 264 → **303 of
    987 spots**. Structural check (`node --check` + Node-parsed
    re-count): 987/987 unique ids, zero duplicate
    name+suburb+state+country combos.
  - **Not yet pushed to the live Supabase table** — same outstanding step
    as every prior correction pass.
  - Unresolved-list total across the whole series is now **15** (TOKA
    climbing still excluded as a known non-issue): the 13 from the 500m
    pass above, plus **Xkala by Walltopia** and **Motion Boulder 2**.
- **Lowered the geocode-accuracy threshold to 100m (11 more spots
  corrected)**: sixth follow-up. Only 34 spots came back ≥100m — real
  convergence, not just a smaller slice of a still-large pool — 22
  already-handled, leaving 12 new candidates (5 US, 7 non-US).
  - **All 5 US spots confirmed** via Census agreeing with Nominatim,
    every one within 0.09km.
  - **6 of 7 non-US spots confirmed** via Photon, most exact/near-exact
    matches, across AU/CA/NZ/KR/CH/FI. **1 stayed unresolved**:
    **Awesome Walls - Dublin** — both Nominatim's own match ("North
    Road", no house number) and Photon's (an electoral-ward boundary,
    not a business or address) are street/area-level rather than
    address-specific, so neither was precise enough to justify moving a
    pin that's already only 188m off.
  - Running total of independently-verified positions: 303 → **314 of
    987 spots**. Structural check (`node --check` + Node-parsed
    re-count): 987/987 unique ids, zero duplicate
    name+suburb+state+country combos.
  - **Not yet pushed to the live Supabase table** — same outstanding step
    as every prior correction pass.
  - Unresolved-list total is now **16** — full list in `docs/tasks.md`.
    At this point remaining candidates are converging on genuine
    geocoder-precision noise rather than real data errors — this is
    close to the practical floor of what free geocoding tools can
    resolve for this dataset.
- **Fixed a second unfounded top-rope default, this time in the Shanghai
  batch (36 of 63 tagged spots corrected)**: after the earlier 49-spot
  Xi'an/Chongqing/Nanjing correction, user asked to check every remaining
  China spot tagged top-rope for the same mistake. Auditing every CN
  spot's own `notes` field for actual type evidence (not just re-trusting
  the tag) found that Shanghai's two "岩馆探索" (PANDA) batches — sourced
  before the "type from description at write time" discipline started
  with the Beijing batch — had the identical problem: 60 of Shanghai's 63
  top-rope/lead-tagged spots had notes describing only address/geocoding
  sourcing, with **no statement anywhere that huodong.com's own
  description had actually confirmed rope or lead facilities**. (The
  other 3 — Climbing Factory, Jungle Berry Camp, Jinshan Outdoor Sports
  Center Climbing Gym — already carried real evidence in their notes from
  the original pass and were left untouched.)
  - Re-verified all 60 directly against huodong.com's own venue
    description for each (re-fetched the same 5-page Shanghai directory,
    matched each spot to its detail-page URL, read the actual Chinese
    description text) rather than assuming either direction — per
    `Rules.md` §1, this correction was itself researched, not applied on
    a hunch that "probably" the same mistake repeated.
  - **A real reliability wrinkle surfaced during this re-verification**:
    many venues' descriptions share near-identical template phrasing
    (e.g. "场馆主打抱石（Bouldering）项目，适合初学者至进阶爱好者" appears
    verbatim across several unrelated bouldering-only gyms, and a
    similar template exists for bouldering+top-rope venues). Cross-checked
    by fetching a handful of these pages directly a second time and
    confirming the quoted text is genuinely present on the page verbatim,
    with the venue's own name/address correctly woven into the same
    template — this is huodong.com reusing its own category-level listing
    copy (still reflecting the venue's actual registered facility type),
    not a fabricated/hallucinated description. Treated as real evidence,
    but of a plainer, more templated tier than the individually-detailed
    write-ups seen for Beijing/Guangzhou/Shenzhen/Chengdu/Hangzhou/Wuhan.
  - Of the 60: **24 confirmed bouldering-only** (re-tagged
    `types:[indoor-bouldering]`, top-rope/lead removed), **24 confirmed
    top-rope** (kept, with the evidence now stated in `notes`), **9
    confirmed both top-rope and lead climbing** (kept both, `LEAD` type
    added), and **3 confirmed lead climbing but not specifically top-rope**
    (top-rope removed, `LEAD` type added instead). One venue (5+ Climbing,
    Songjiang Yunjian) explicitly states its own listing **prohibits**
    top-rope/lead climbing at that branch — a stronger-than-usual signal,
    re-tagged bouldering-only.
  - Net result: still **1513 total spots** (a type-correction pass, not
    an addition/removal, same as the earlier 49-spot fix). Structural
    check (Node-parsed `window.SEED_GYMS`): 1513/1513 unique ids, zero
    duplicate name+suburb+state+country combos, every spot has a
    non-empty `types` array. Shanghai's own type breakdown after the fix:
    36 top-rope (24 corrected + 3 already-evidenced, plus 9 shared with
    lead), 12 lead-climbing, 34 bouldering-only (was 10 bouldering-only +
    63 top-rope/lead before this pass).
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): Shanghai chip filter still returns exactly 73 spots
    (unchanged — no additions/removals); spot-checked Vmore Climbing
    (North Bund) directly in the loaded data — `types` is now
    `["indoor-bouldering"]` with the disclosure note present; no console
    errors beyond the deliberately-forced Supabase-unreachable ones; `git
    diff` on `js/supabase-init.js` confirmed clean after reverting the
    test edit.
  - **Not yet pushed to the live Supabase table** — same outstanding step
    as every prior correction pass. Every other PANDA-app city (Beijing,
    Guangzhou, Shenzhen, Chengdu, Hangzhou, Wuhan) was individually
    checked against this same standard during this audit and found
    clean — each of their top-rope/lead tags already cites an explicit
    huodong.com description confirmation in its own `notes`, since those
    batches were sourced after the write-time-evidence discipline began.
- **Extended the top-rope-tag audit worldwide, starting with the biggest
  "blind default" countries: United Kingdom (38 of 66 corrected) and
  Germany (43 of 112 corrected)**: after the two China fixes above, user
  asked whether the same audit had been run outside China. It hadn't — a
  full-dataset scan found **663 non-China spots** whose top-rope/lead tag
  had no explicit per-gym evidence in `notes`, but most of that (the US,
  199 spots) turned out to be a false alarm on inspection: those gyms
  (Movement, CityRock, Eagle Climbing, etc.) are well-known chains
  individually researched via Mountain Project's own gym pages, just
  under-documented in `notes` relative to type-sourcing specifically —
  not a blind default the way China's mall-storefront gyms were. The
  genuine "same shape as China" risk pool — a type assumed from a naming
  heuristic or a blanket default, never read from an actual facility
  description — narrows to roughly **640 spots across 24 countries**:
  South Korea (35, Mountain Project gave literally no facility type),
  UK + Germany (114, MP directory-listing depth only, type inferred from
  whether the name said "Boulder"/"Bloc"), and the ~490 spots sourced
  from climbing-gyms.com (France, Sweden, Netherlands, Italy, Belgium,
  Poland, Denmark, Finland, Ireland, Spain, Portugal, Austria,
  Switzerland, Hungary, Greece, Czech Republic, Iceland, Romania,
  Croatia, Russia, Bulgaria — same "chain/name recognition, default to
  bouldering+top-rope otherwise" pattern documented earlier in this
  section for each of those countries). User chose to work through this
  full list country by country, biggest first, the same way the AU/US
  address-verification pass was done one state at a time — this is a
  multi-session effort, not a single pass.
  - **Method**: for each country, every flagged gym was individually
    web-searched (parallel research agents, ~15-20 gyms per agent) for
    its own site or a reliable directory/review confirming its real
    facility type — bouldering-only, top-rope, and/or lead climbing —
    the same standard as the huodong.com re-verification, just without a
    single directory site to lean on for these countries.
  - **UK (66 gyms, 58 audited)**: 21 confirmed bouldering-only (top-rope
    removed), 3 confirmed top-rope-only, 34 confirmed to have **both**
    top-rope and lead climbing (lead was never even considered in the
    original default, which only ever assumed top-rope) — e.g. Parthian
    Climbing's 4 branches, The Depot Climbing Centre's 2 branches, and
    both TCA "roped" locations (The Church, The Prop Store — TCA's two
    bouldering-only locations, The Mothership and The Newsroom, were
    correctly separated from their roped sister sites). Miss rate: 21 of
    58 (36%) were wrongly defaulted toward rope climbing — lower than
    China's ~75%/~50% rates but still a real, substantial error.
  - **Germany (112 gyms, 56 audited)**: only 1 confirmed bouldering-only
    despite the "assume top-rope" default (Kosmos, Leipzig — a real
    Boulderhalle despite its generic name) — a low miss rate in the
    "wrongly assumed rope climbing" direction, but the audit surfaced a
    much bigger, different problem: **the overwhelming majority of
    Kletterhalle/Kletterzentrum/Kletterarena-named gyms actually offer
    lead climbing (Vorstieg)**, a discipline the original default never
    tagged at all (it only ever considered bouldering vs. top-rope). 43
    of the 56 audited gyms got `lead-climbing` added for the first time.
    German gym naming conventions turned out far more reliable than the
    original heuristic assumed — "Kletterhalle"/"-zentrum"/"-arena" names
    reliably signal real rope infrastructure, usually including lead,
    while "Boulderhalle"/generic single-word brand names (Monkeyspot,
    Level 8, Stuntwerk, UPJOY, Der Steinbock's chain) reliably signal
    bouldering-only — the opposite failure mode from the UK/China batches
    (undercounting a real discipline, not falsely assuming one).
  - **One real name-collision bug caught and fixed during this pass**:
    both a Shanghai gym (from the original Dianping pass) and one of
    these new Germany corrections are named exactly "Climbing Factory" —
    the correction script's plain-string name match found the Shanghai
    entry first and applied the German Nürnberg evidence/type to it by
    mistake (the same "same name, wrong entry" failure mode already
    documented for "Pulse Climbing" in the original Xi'an/Chongqing/
    Nanjing fix). Caught by the script's own multi-match warning, not
    assumed away — both entries were manually corrected back to their
    real, distinct facility types and evidence (Shanghai: bouldering +
    top-rope, unchanged from before this pass; Nürnberg: bouldering +
    top-rope + lead, the correction that was actually meant for it).
  - Net result: still **1513 total spots** (type-correction only, no
    additions/removals). Structural check (Node-parsed `window.SEED_GYMS`
    ): 1513/1513 unique ids, zero duplicate name+suburb+state+country
    combos, every spot has a non-empty `types` array. UK breakdown after
    the fix: 38 top-rope, 34 lead-climbing, 28 bouldering-only (of 66
    total). Germany breakdown: 43 top-rope, 37 lead-climbing, 69
    bouldering-only (of 112 total).
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): `window.SEED_GYMS.length` = 1513 unchanged; the two
    "Climbing Factory" entries confirmed distinct and correct (Shanghai:
    `[indoor-bouldering, top-rope]`; Nürnberg: `[indoor-bouldering,
    top-rope, lead-climbing]`); no console errors beyond the
    deliberately-forced Supabase-unreachable ones; `git diff` on
    `js/supabase-init.js` confirmed clean after reverting the test edit.
  - **Not yet done**: South Korea (35 spots) and the ~490 climbing-
    gyms.com-sourced spots across 22 more countries are still queued in
    this same worldwide audit, to be worked through country by country
    per the user's explicit choice. Not yet pushed to the live Supabase
    table — same outstanding step as every prior correction pass.
- **South Korea (35 of 37 spots audited)**: continuing the worldwide
  audit — Korea was the cleanest analog to the original China mistake
  (Mountain Project gave zero facility-type signal at all for any Korea
  listing, so every spot but one had simply been defaulted to
  bouldering+top-rope with no name-heuristic override even attempted).
  Verified each via web search — mostly Korean-language sources plus
  spiri7.com, a Korean gym-tracking/leaderboard site whose gym pages show
  a discipline section (볼더링/bouldering, 리드/lead) only for disciplines
  that gym actually tracks, used as a secondary confirmation source
  alongside each gym's own site/blog/Instagram where one existed.
  - Of 35 audited: **29 confirmed bouldering-only** (top-rope wrongly
    assumed), **5 confirmed to have lead climbing** (Ayers Rock Climbing
    Gym, Cl!mben Climbing Company, Club Spider Sasang, Do Climbing
    Gimhae, Rock Tree), and **1 confirmed top-rope** (Big Climbing Gym,
    on blog-title-level evidence only, the weakest tier accepted this
    session). This mirrors the original China finding almost exactly in
    direction and magnitude (29/35 = 83% wrongly assumed rope climbing,
    even higher than the original 49/64 Xi'an/Chongqing/Nanjing rate).
  - **12 of the 35 came back genuinely UNCLEAR** — a real, dead official
    site, no web presence at all, or reviews too thin to confirm facility
    type either way (9 Climbing Gym, Awesome Climbing, Bros Climbing,
    Climb Works, Do Climbing Kyungsung/Pukyong National University, Do
    Climbing: Sasang, Gate 1 Climbing, Grabit, Hong Jong-Yeol Climbing,
    Jaws Climbing, Rock Odyssey Dongnae, Twin Climbing Center). Rather
    than leave these on the unverified top-rope default, they were
    **defaulted to bouldering-only with a disclosed "no evidence found"
    note** — the same choice already made for Suzhou/Tianjin's thumbnail-
    only batches, justified here by the same-country evidence: of the 23
    Korea spots that *were* confirmed either way, 29/30 (including the
    already-correct B.bloc Climbing Songdo) turned out bouldering-only,
    so bouldering-only is the statistically far safer unverified default
    for this specific gym population, not a coin-flip guess.
  - Net result: still **1513 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1513/1513 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array. Korea breakdown after the fix: 2 top-rope, 5 lead-climbing, 30
    bouldering-only (of 37 total) — down from the original near-blanket
    top-rope default.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): `window.SEED_GYMS.length` = 1513 unchanged, Korea
    count unchanged at 37; no console errors beyond the deliberately-
    forced Supabase-unreachable ones; `git diff` on `js/supabase-init.js`
    confirmed clean.
  - **Not yet done**: the ~490 climbing-gyms.com-sourced spots across 22
    more countries are still queued in this worldwide audit. Not yet
    pushed to the live Supabase table.
- **Poland, Norway, France, Argentina, Colombia, Italy, Spain, Mexico,
  and Romania (134 of 205 spots audited)**: continuing the worldwide
  audit, biggest-country-first, per the user's explicit choice — this
  batch covers 9 more countries in one pass.
  - **Poland (31 gyms, 22 audited)**: 4 confirmed bouldering-only, 9
    confirmed top-rope, 8 confirmed both top-rope and lead, 1 confirmed
    lead-only (Murall Annopol — a "sport wall" graded 4a-8a, a
    lead-climbing grade range, with no explicit top-rope mention).
    Breakdown after the fix: 17 top-rope, 9 lead-climbing, 13
    bouldering-only.
  - **Norway (20 gyms, 16 audited) — the first country in this whole
    series where the original default held up completely**: every one
    of the 16 audited gyms confirmed to genuinely have top-rope climbing
    alongside bouldering — 0 miscorrections. Only the confirming
    evidence was added to `notes`; no `types` changed. One incidental
    finding, flagged but not acted on (out of this task's scope):
    Klatrefabrikken Stavanger appears to have permanently closed per
    multiple sources found during the pass, with routesetting possibly
    continuing under "AIR by Bolder" — not independently confirmed.
  - **France (30 gyms, 16 audited)**: 6 confirmed bouldering-only,
    including one "Climb Up" branch (Marseille La Valentine) that's
    bouldering-only despite the chain being previously confirmed as
    offering top-rope/lead elsewhere — exactly the kind of chain-name
    false-positive this audit series exists to catch. One venue (HAPIK,
    Lyon) turned out to be a family auto-belay attraction with themed
    obstacle walls, not a traditional climbing gym — kept as
    bouldering-only given the ambiguity of its unusual format, flagged
    rather than excluded outright since scope review wasn't asked for.
    Breakdown after the fix: 9 top-rope, 2 lead-climbing, 20
    bouldering-only.
  - **Argentina (17 gyms, 14 audited)**: only 1 confirmed bouldering-only
    (K2 Escalada Deportiva — its confirmed indoor component is
    bouldering-only; a separate outdoor wall doesn't count per this
    app's indoor-only scope). The other 13 all confirmed to have real
    roped climbing, 4 of them lead-capable. Breakdown after the fix: 14
    top-rope, 4 lead-climbing, 3 bouldering-only.
  - **Colombia (18 gyms, 14 audited) — a genuinely different statistical
    shape than Korea's**: only 2 of 14 confirmed bouldering-only, with 5
    of the remaining 12 coming back UNCLEAR (no reliable source either
    way). Since Colombia's own confirmed-either-way ratio leans heavily
    toward *having* rope climbing (unlike Korea, where 29/30 confirmed
    spots were bouldering-only), defaulting the 5 unclear entries to
    bouldering-only the way Korea's unclear cases were handled would not
    have been statistically justified here — they were left on their
    existing top-rope tag instead, with a disclosure note stating the
    type couldn't be independently confirmed this pass, rather than
    guessed either direction. Breakdown after the fix: 13 top-rope, 2
    lead-climbing, 4 bouldering-only.
  - **Italy (14 gyms, 13 audited)**: only 2 confirmed bouldering-only (a
    15% miss rate, one of the lowest in this whole series) — ASD Rambla
    Vertical (a 4m wall, too short for roped climbing) and Monkey Island
    (explicitly lacks an external rope wall despite hosting the Italian
    Boulder Championships). 6 of the remaining 11 confirmed lead-capable.
    Breakdown after the fix: 5 top-rope, 6 lead-climbing, 3
    bouldering-only.
  - **Spain (22 gyms, 13 audited)**: 1 confirmed bouldering-only
    (RockTown Climbing - Madrid). 5 confirmed lead-capable via Spanish
    terms for sport/lead climbing (escalada de primero/de dificultad),
    distinguished from generic roped climbing. Breakdown after the fix:
    7 top-rope, 5 lead-climbing, 10 bouldering-only.
  - **Romania (18 gyms, 13 audited)**: 2 confirmed bouldering-only
    (Fabrica de Cățărat, HangOut Climbing Gym — both explicitly market
    themselves as bouldering-only with no ropes needed). One entry
    (Gravity, Cluj) came back genuinely unclear — no reliable,
    independently-quotable source could confirm facility type beyond an
    AI-search-summary-level mention — defaulted to bouldering-only per
    this project's established pattern for genuinely unconfirmable
    entries, disclosed as such. Romanian terminology distinguishes
    "manșă" (top-rope) from "cap de coardă" (lead) explicitly in several
    gyms' own descriptions — the clearest terminology split found in any
    country audited so far. Breakdown after the fix: 8 top-rope, 4
    lead-climbing, 8 bouldering-only.
  - **Mexico (16 gyms, 13 audited)**: 7 of 13 confirmed bouldering-only
    (a 54% miss rate, among the highest in this series) — several with
    explicit Spanish-language confirmation ("sin cuerda"/"sin arnés ni
    cuerdas") despite one being branded "V+ Bouldering & Sport Center,"
    a name that itself implied rope climbing. Breakdown after the fix: 6
    top-rope, 1 lead-climbing, 9 bouldering-only.
  - Net result across all 9 countries: still **1513 total spots**
    (type-correction only, no additions/removals — every country's total
    confirmed unchanged: PL 31, NO 20, FR 30, AR 17, IT 14, ES 22, RO 18,
    CO 18, MX 16). Structural check (Node-parsed `window.SEED_GYMS`):
    1513/1513 unique ids, zero duplicate name+suburb+state+country
    combos, every spot has a non-empty `types` array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): `window.SEED_GYMS.length` = 1513 unchanged; spot-
    checked per-country counts (PL 31, NO 20, FR 30, MX 16) directly in
    the loaded data; no console errors beyond the deliberately-forced
    Supabase-unreachable ones; `git diff` on `js/supabase-init.js`
    confirmed clean after reverting the test edit.
- **Austria, Brazil, Greece, Philippines, Finland, Canada, Chile, Hungary,
  Indonesia, Croatia, Bulgaria, Ireland, Sweden, Netherlands, Czech
  Republic, India, Denmark, Switzerland, Portugal, Taiwan, Israel,
  Venezuela, New Zealand, Iceland, Japan, Russia, and Belgium (160 of
  ~332 spots across these 27 countries audited) — this finishes the
  worldwide top-rope-tag audit.** Every remaining country from the
  original ~640-spot risk pool is now done (12 countries in the prior
  batch + China's own two batches + these 27 = the whole list). Same
  method as every prior batch: parallel research agents individually
  web-searched each flagged gym's own site/reviews/directory listing for
  real facility-type evidence, one agent pair per ~2-3 countries (13
  agent dispatches, 2 of them retried once after a transient rate-limit
  error).
  - Of 160 audited: **40 confirmed bouldering-only** (wrongly assumed to
    have top-rope), **66 gained `lead-climbing` for the first time**
    (a discipline the original blanket default never considered at all,
    the same pattern already seen for Germany/Czech Republic/Croatia —
    countries whose native rope-climbing-hall terminology, once actually
    read, reliably implies lead infrastructure), and the rest confirmed
    their existing tag correct or came back genuinely unclear.
  - **A recurring judgment call, applied more carefully this batch than
    the first attempt**: whether to default a genuinely-UNCLEAR gym to
    bouldering-only depends on that specific country's own confirmed-
    evidence ratio, not a blanket rule (the Korea-vs-Colombia precedent
    from the earlier batch). A first pass through this batch's UNCLEAR
    cases defaulted all of them to bouldering-only uniformly — caught
    before committing by checking each affected country's actual
    confirmed ratio, which showed several (Philippines 4/4 confirmed
    positive, Brazil 9/11, Greece 7/9, Bulgaria 5/5, India 3/3, Israel
    2/2) leaned heavily toward gyms *having* real rope climbing. Removing
    top-rope from an unconfirmed gym in one of those countries would have
    repeated the original bug in the opposite direction — a real facility
    quietly untagged on a weak country-level prior, not on any actual
    evidence about that specific gym. 13 entries (7 Philippines, 1
    Brazil, 1 Greece, 2 Bulgaria, 1 India, 1 Israel) were reverted from
    the bouldering-only default back to their original top-rope tag, with
    a disclosure note stating the type couldn't be independently
    confirmed and explaining why the existing tag was kept rather than
    removed. The remaining UNCLEAR cases (Indonesia's four, Croatia's PK
    Elvis, Chile's BALANCE, Venezuela's Aranitas Club) stayed on the
    bouldering-only default, since those countries' own confirmed samples
    were roughly even or had no meaningful lean either way.
  - **One real data error caught and fixed beyond type**: **RockWay**
    had been listed under `Iraklio`/`CRETE` (i.e. Heraklion), but every
    source the research agent found places it in Neo Irakleio, a real
    municipality in Athens/Attica (confirmed independently via Nominatim,
    which resolves "Neo Irakleio, Athens" to a real place in the
    Attica region, ~38.05°N 23.77°E — nowhere near Crete). Corrected
    `suburb`, `state`, and `lat`/`lng` to the Attica location; the
    address text itself (a street name) was left unchanged since it's
    plausibly the same either way and wasn't independently re-verified.
  - **A second real correction, this time to an already-lead-tagged
    entry**: **Skalodrom Bigwallsport na Dinamo** (Moscow) had been
    tagged `lead-climbing` in the original Russia batch based on the
    Bigwallsport chain's general reputation, but this pass found the
    operator's own site and an independent gym directory both categorize
    this *specific* Dinamo location as bouldering-only (950m², 4.5m wall)
    — the lead-climbing tag actually belongs to the same chain's separate
    Luzhniki location, not this one. Corrected to bouldering-only, same
    "verify the specific branch, don't assume from the chain name"
    discipline established for every multi-branch chain in this dataset.
  - **Badung Climbing Gym** (Bali, Indonesia) had its top-rope tag
    removed — theCrag's own description lists boulder blocks, a speed
    wall, and a lead-climbing wall, but no top-rope wall at all — kept
    bouldering + lead, the same "don't guess a discipline into existence"
    standard applied throughout this project.
  - **Crag Studio** (Gachibowli, India) had `indoor-bouldering` *added* —
    it was tagged top-rope + lead only, but LBB's own coverage and the
    gym's materials describe genuine bouldering there too, alongside the
    lead/top wall.
  - Net result: still **1513 total spots** (type-correction only, no
    additions/removals). Structural check (Node-parsed `window.SEED_GYMS`
    ): 1513/1513 unique ids, zero duplicate name+suburb+state+country
    combos, every spot has a non-empty `types` array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): `window.SEED_GYMS.length` = 1513 unchanged; spot-
    checked the RockWay/Bigwallsport-Dinamo/Badung/Campus-Climbing
    (Chile vs. Israel disambiguation) corrections directly in the loaded
    data, and re-checked the 13 reverted-to-top-rope entries after the
    consistency fix; no console errors beyond the deliberately-forced
    Supabase-unreachable ones; `git diff` on `js/supabase-init.js`
    confirmed clean after reverting the test edit.
  - **This closes out the worldwide top-rope-tag audit** — every country
    identified in the original ~640-spot risk pool (South Korea, UK,
    Germany, and these 36 more) has now been individually audited.
    Not yet pushed to the live Supabase table — same outstanding step as
    every prior correction pass in this series.
- **South Africa (12 gyms, 5 provinces) — the first African country in this
  dataset**, added on request ("populate South Africa, ensuring the
  correct gym type and location is selected"). Sourced from
  climbing-gyms.com's South Africa directory (13 raw candidates across 9
  cities), the same source/method as most of the European/South American
  passes — every candidate individually cross-checked via web search or
  its own site for (a) it's a real, currently-operating indoor facility
  and (b) its actual climbing type, no default applied without direct
  textual evidence, per the lesson from the worldwide top-rope-tag audit
  above.
  - **One candidate excluded**: Vertigo Adventures (Longmarket Street,
    Cape Town) — every source describes it as an outdoor guided-climbing
    company (Table Mountain, Silvermine trips), not an indoor gym, out of
    this app's indoor-only scope.
  - **CityROCK's 3 South African branches** (Cape Town, "Pretoria" —
    actually Centurion, "Johannesburg" — actually Randburg) each
    individually confirmed via that branch's own cityrock.co.za page to
    offer bouldering + top-rope + lead climbing — the chain names
    branches after the metro area rather than the exact suburb, the same
    naming convention already seen for several chains elsewhere in this
    dataset, not a data error.
  - **One university-affiliated gym kept, not excluded**: Maties Rock
    Climbing Wall (Stellenbosch University's climbing club at its
    Coetzenburg sports complex) — individually confirmed via web search
    that it welcomes both students and non-students as members, the same
    verify-don't-assume standard already applied to Korea's/Ireland's/
    Chile's university-gym cases. Bouldering-only; the "rock climbing
    outings" its own description also mentions are outdoor excursions for
    members, not an indoor rope wall.
  - **One mixed indoor/outdoor venue kept for its indoor component**: The
    Climbing Barn Adventure Centre (Mooiplaats, Pretoria) — confirmed
    450sqm of top-rope/lead walls plus 150sqm of bouldering indoors,
    alongside an outdoor team-building component — same "kept for the
    confirmed indoor facility" precedent as K2 Escalada Deportiva
    (Argentina) and Club Andino Burzaco.
  - **Two addresses corrected from climbing-gyms.com's own listing**:
    Rock Valley Climbing (the source gave a slightly different street;
    the address used here matches the gym's own site and independent
    directories) and Friends and Allies (source said "Tungsten Road,
    Johannesburg"; multiple independent sources agree on "Naaf Street,
    Strydompark, Randburg" instead).
  - **Positions individually geocoded** against Nominatim, with Photon as
    a second pass for no-matches — 5 of 12 resolved on the first
    Nominatim try; the rest resolved via Photon, mostly exact street
    matches. **2 Photon results were caught and rejected as wrong-street
    matches** before being used, the same "same street name exists
    elsewhere" failure mode already documented for Croatia/Russia/the
    Philippines earlier in this file: Rock Valley Climbing's query
    matched a different street (Von Willigh Avenue) in the same suburb
    instead of the confirmed Theuns Avenue, and Southern Rock Climbing
    Centre's query matched "Valley View Road" in Stamford Hill/Morningside
    — a different, distant Durban suburb — instead of the confirmed New
    Germany. Both fall back to their correct suburb's centroid instead of
    the wrong-street point.
  - **Climbing type applied only from direct evidence, same discipline as
    every batch since Beijing** — 4 of 12 are bouldering-only (2 Bloc 11
    branches, Friends and Allies, Maties), 1 is bouldering + lead only
    with no top-rope evidence (HangTime, whose own site categorises its
    offering as "Sport Climbing - Bouldering"), 1 is bouldering + top-rope
    with no lead evidence (Rock Valley Climbing), and the remaining 6 are
    confirmed bouldering + top-rope + lead.
  - `state` uses South Africa's real top-level provinces, populated
    complete from the start (9, same standard as every country since the
    NL fix) — Eastern Cape, Free State, Gauteng, KwaZulu-Natal, Limpopo,
    Mpumalanga, North West, Northern Cape, Western Cape — though only 5
    (Western Cape, Gauteng, KwaZulu-Natal, Eastern Cape, Mpumalanga) have
    a seed spot and therefore a sidebar chip/colour.
  - **A new continent-tier region, `africa`, was added** — the same
    structural change Brazil's addition needed when it became the first
    South America country: a new `REGION_LABELS`/`REGION_FLY_TARGETS`
    entry in `js/app.js` and a new `.region-group[data-region="africa"]`
    sidebar wrapper in `index.html`, same mechanics as the existing five
    regions, not a special case. Its fly-target currently matches South
    Africa's own `COUNTRY_FLY_TARGETS` entry (there's only one country in
    the region so far) — widen it once a second African country is added,
    the same way every other region's target was picked to frame all its
    countries together.
  - Net result: 1513 → **1525 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1525/1525 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1525; searching "south africa" returns all 12
    spots with correct human-readable province/country labels; the new
    Africa region and South Africa country chip groups render correctly
    (collapsed by default, `.has-active` propagates to both levels when a
    chip is active); the Western Cape chip correctly filters to exactly 5
    spots; both country `<option>`s (new "Africa" `<optgroup>`, first
    alphabetically) present in both add/edit forms; chip active-state text
    confirmed legible via computed style (background and text resolve to
    different values); no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow in the sidebar at
    375px mobile with the new chip row expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Ecuador (11 gyms, 8 provinces)** — added on request to "add the next
  country that we're missing with the most gyms." Cross-referenced
  boulderinglist.com's full 84-country gym-count list against every
  country already in this dataset. The nominal largest missing country,
  "Georgia" at 14 gyms, was skipped — a known trap already documented in
  this file: boulderinglist.com's own "Georgia" listing conflates the
  country with the US state of Georgia, with only ~1 real gym actually
  belonging to the country. Ecuador (8 gyms on boulderinglist, cross-
  checked against climbing-gyms.com's own smaller, partially-overlapping
  Ecuador listing) is the next genuinely-largest missing country.
  - **Two directories gave substantially different, only lightly-
    overlapping gym lists for the same country** — boulderinglist.com's 8
    (Quito ×3, Ambato, Azogues, Ibarra, Portoviejo, Puyo) and climbing-
    gyms.com's 4 (Quito ×2, Guayaquil, Puyo) shared no gym names in
    common except Puyo. Every candidate from both lists was individually
    web-searched rather than trusting either directory's count at face
    value.
  - **One candidate excluded on scope grounds**: El Muro (Cumbayá/
    Lumbisí, one of climbing-gyms.com's two Quito listings) — its own
    coverage describes both the boulder area and the climbing routes as
    outdoor, "only covered with a roof" — not a fully enclosed indoor
    facility, the same "roof alone isn't indoor" scope exclusion already
    applied to Huayan Climbing Park (China) and other outdoor venues in
    this dataset.
  - **One boulderinglist.com listing ("LA ROCA") couldn't be found under
    that name anywhere** — independently identified instead as El
    Rocodromo ("Ciudad de Quito"), a well-documented major climbing
    complex in La Vicentina that's otherwise absent from this dataset's
    candidate list, and boulderinglist's own count of "3 gyms in Quito"
    only reconciles if this is the third. Kept under its real, verifiable
    name rather than the directory's unconfirmed label, the same
    treatment as MegaSTONE Climbing Gym (Taiwan). It's a mixed indoor/
    outdoor complex (an explicit indoor gym plus boulder caves, alongside
    a separate large exterior bouldering area) — kept for its confirmed
    indoor bouldering + top-rope component.
  - **Monodedo turned out to be a 2-branch chain**: its own Quito
    location (climbing-gyms.com's listing) plus an independently
    confirmed second location in Cuenca — Azuay's first-ever gym in this
    dataset — added as a distinct spot rather than assumed to be the same
    single location either list implied.
  - **One access check, resolved without exclusion**: Max Climbing Club
    (Guayaquil) operates out of a stadium climbing wall, which could have
    read as a restricted team facility — its own site confirms public
    programs from age 5, not a closed club, so it was kept without
    caveats.
  - **Positions individually geocoded** against Nominatim, Photon as a
    second pass for no-matches — 9 of 11 resolved on the first Nominatim
    try. One Photon result was caught and rejected as a wrong-city match
    before being used: Iguana's (Ambato, Tungurahua) address query
    matched a same-named street, "Consejo Provincial," that also exists
    in Esmeraldas province, hundreds of km away — rejected in favour of
    an Ambato city-centre fallback instead, the same "same street name
    exists elsewhere" failure mode already documented for Croatia/
    Russia/the Philippines/South Africa.
  - **Climbing type applied only from direct evidence, same discipline as
    every batch since Beijing** — 7 of 11 are bouldering-only (both
    Monodedo locations, Iguana, CECAMP, Complejo La California, Muro de
    Puyo), 1 is bouldering + lead only with no top-rope evidence (Max
    Climbing Club), and 3 are bouldering + top-rope (El Rocodromo,
    Vertigo Escalada, Complejo de Yacucalle).
  - `state` uses Ecuador's real 24 provinces, populated complete from the
    start (same standard as every country since the NL fix) — 8 have a
    seed spot and a sidebar chip/colour: Pichincha, Azuay, Tungurahua,
    Cañar, Imbabura, Manabí, Guayas, Pastaza.
  - Net result: 1525 → **1536 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1536/1536 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1536; searching "ecuador" returns all 11 spots;
    the Pichincha chip correctly filters to exactly 4 spots; the new
    Ecuador country `<option>` present in both add/edit forms (South
    America optgroup, between Colombia and Venezuela); chip active-state
    text confirmed legible via computed style; no console errors beyond
    the deliberately-forced Supabase-unreachable ones; no horizontal
    overflow at 375px mobile with the region/country expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Japan expansion (24 more gyms, 32 → 56, 4 new prefectures: Miyagi/
  Sendai, Hiroshima, Okinawa/Naha, Saitama)** — added on request to
  "utilise Google Places to add more gyms to Japan." **No Google Places
  API key is configured anywhere in this project** (confirmed by
  grepping the whole repo before starting — this project's established
  design philosophy is keyless APIs only, e.g. Nominatim/CARTO, and no
  Places-specific tool was available in this session's toolset either),
  so this batch used general web search against each gym's own site or a
  consistent secondary directory/listing as the practical substitute —
  the same method already used for every "lighter-touch" country in this
  file (Norway, Brazil, the original Japan/Canada/New Zealand passes).
  Three parallel research passes covered Sendai/Hiroshima, Naha/Saitama,
  and 10 more Tokyo wards not already in the dataset.
  - **One candidate deliberately excluded on evidence-quality grounds,
    not just absence of evidence**: "Gravity Research Omiya" (Saitama) —
    a single low-confidence source (direct page fetch 404'd, only a
    search-snippet survived) claimed a lead-climbing wall, but this
    directly conflicts with the same "Gravity Research" chain's three
    other already-listed locations in this dataset (Umeda, Sapporo,
    Kobe — all bouldering-only) and with the chain's general real-world
    reputation as a bouldering-only operator. Rather than guess which
    source to trust, per `Rules.md` §1, it was left out entirely instead
    of being added under either type.
  - **Onoyama Park Budokan Climbing & Sumo Hall** (Naha) is a public
    prefectural sports facility, not a private gym — its bouldering wall
    (4m) is normal general admission, but its 12m lead wall requires an
    Okinawa Mountain Climbing Association license card plus a climbing
    partner. Kept with both types tagged, since the lead wall is real and
    the bouldering wall genuinely is walk-in, but the access caveat for
    the lead wall specifically is disclosed in its own `notes` — the same
    "verify and disclose access precisely, don't just include or
    exclude" standard already used for the Korea/Ireland/Chile/South
    Africa university- and club-adjacent gyms.
  - **Katsushika Sports Climbing Center** is a ward-run Tokyo public
    facility explicitly billed as the first in the city's 23 wards with
    bouldering, lead, AND speed-climbing walls — general-public admission
    confirmed via posted hourly rates for all ages, not
    membership-restricted, so kept without an access caveat (unlike
    Onoyama above). This app has no speed-climbing type, so only
    bouldering and lead are tagged; the facility's speed wall is
    disclosed in `notes` but doesn't map to anything in `TYPE_LABELS`.
  - **CELL and Exciting Sancha** (both Setagaya, Tokyo) had their type
    evidence (bouldering + lead climbing for both) come from secondary
    blog/aggregator sources rather than either gym's own site directly —
    a lower-confidence tier than most entries in this dataset, disclosed
    per-entry rather than presented as equally solid.
  - **Naha Gym** had no climbing-type evidence findable at all (only an
    Instagram listing with hours/pricing) — defaulted to bouldering-only
    per the discipline established by the South Korea top-rope-tag audit
    (unconfirmed small gyms default to bouldering, not top-rope, since
    that's the statistically safer unverified default for this kind of
    gym), disclosed as such rather than left on an assumed type.
  - **Geocoding hit the same mall/building-address resolution gap
    Japan has shown before**: of 24 addresses, only 8 resolved directly
    against Nominatim at street level (B'nuts, pb climbing Yokogawa,
    Naha Gym, Onoyama Park Budokan, Energy Climbing Gym Urawa, Climbing
    Gym Penguin, plus 2 more); the rest fell back to their ward/city
    centroid. **Boulbaka** (Naha) couldn't resolve even on a simplified
    retry — falls back to Naha's whole-city centroid, the coarsest
    fallback tier used in this pass. Two same-ward pairs ended up
    sharing an identical fallback point (CELL/Exciting Sancha in
    Setagaya; T-WALL Kinshicho/Fish and Bird Toyocho in Koto) — both
    pairs are confirmed distinct, real gyms at different addresses,
    disclosed in each spot's own `notes`.
  - `state` uses the existing `MIYAGI`/`HIROSHIMA`/`OKINAWA`/`SAITAMA`
    keys — all four were already present in `STATES_BY_COUNTRY.JP` from
    the earlier state-list-completeness pass (which populated Japan's
    full 47 prefectures even though only 8 had spots at the time), so no
    `js/app.js` change was needed. Four new `--jp-miyagi`/`--jp-
    hiroshima`/`--jp-okinawa`/`--jp-saitama` CSS colour variables and
    four new sidebar chips were added to Japan's existing chip row in
    `index.html`, since these are each prefecture's first-ever seed spot.
  - Net result: 1536 → **1560 total spots**; Japan alone 32 → **56**.
    Structural check (Node-parsed `window.SEED_GYMS`): 1560/1560 unique
    ids, zero duplicate name+suburb+state+country combos, every spot has
    a non-empty `types` array, every JP state code used confirmed to
    resolve against `STATES_BY_COUNTRY.JP`.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1560; searching "STONER" returns the
    new Sendai gym with the correct "Miyagi · Japan" label; all four new
    chips (Miyagi/Hiroshima/Okinawa/Saitama) render in distinct colours
    and, when active, resolve to legible dark-text-on-colour (matching
    every other chip); the Miyagi chip correctly filters to exactly 5
    spots; no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow at 375px mobile
    with the Japan chip row expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
- **South Korea expansion (24 more gyms, 37 → 61, 2 new top-level
  divisions: Daejeon, Jeju)** — direct follow-up to the Japan expansion
  above, same "no Google Places API key configured" situation (checked
  again, still none) and same web-search-substitute method. Three
  parallel research passes covered more Seoul gyms, new cities (Daejeon,
  Jeju), and more Incheon/Daegu gyms (previously only 1 each).
  - **A real, non-obvious finding from this pass**: Naver's free
    "modoo!" homepage-building platform (`*.modoo.at`) shut down
    entirely on 26 June 2025 — every `modoo.at` URL surfaced during
    research now shows only a platform-wide closure notice, not
    gym-specific information. This isn't evidence any individual gym
    closed, but it does mean a `modoo.at` page can no longer serve as
    live confirmation of anything. **Three candidates were excluded
    outright** because a now-dead `modoo.at` page was their *only*
    source with no independent corroboration: Cube Climbing/Bupyeong
    (Incheon), Vertigo Climbing Gym (Seoul), SECTOR.B Bouldering Gym
    (Seoul). Two candidates were **kept** despite also citing a dead
    `modoo.at` page, because each had a genuinely independent second
    source: Dino Cat Climbing Gym (Daegu, corroborated by a climbing.kr
    directory board post) and Jeju Climbing School (corroborated by
    climbingtv.co.kr). Worth remembering for any future Korea-focused
    pass in this project: don't treat a `modoo.at` URL as live
    confirmation of anything going forward.
  - **Also caught a genuinely stale, but still worth completing, gap in
    `STATES_BY_COUNTRY.KR`**: unlike every country fixed since the
    Netherlands state-list-completeness pass, Korea's list had never
    been expanded to the country's real complete set of 17 top-level
    divisions — it only ever had the 10 divisions earlier passes'
    seed spots happened to use. Completed it to all 17 (added
    Chungcheongbuk-do, Gangwon-do, Gyeongsangbuk-do, Jeollabuk-do,
    Sejong, plus Daejeon and Jeju, which now also have real spots) in
    the same pass that needed Daejeon/Jeju anyway, rather than leaving
    a second, smaller version of the original NL gap in place.
  - **PEAKERS Jongno** is a converted movie theater (former CGV
    Piccadilly1958) — its tall former screen space now holds lead walls
    alongside bouldering, confirmed via a CJ corporate source rather
    than the gym's own site.
  - **B.bloc Climbing Yeongjong** (Incheon) is a confirmed distinct
    branch of the same B.bloc chain as the already-listed B.bloc
    Climbing Songdo — its own type wasn't independently confirmed, so
    it was tagged bouldering-only by inference from the chain's
    "bloc"-branded sister location, disclosed as an inference rather
    than direct evidence for this specific branch.
  - **"Sport climbing academy" interpreted as lead climbing, not
    bouldering**: Jeju Move Zone's Korean billing (스포츠클라이밍아카데미)
    was tagged `lead-climbing` rather than left ambiguous, applying the
    same "sport climbing = lead" precedent already used for Movimento
    Verticale Roma (Italy) and Chao - Punto Gym (Colombia) earlier in
    this file.
  - **Climbing Gym Lead Yuseong** (Daejeon) is tagged `lead-climbing`
    only, no bouldering — its own name specifies "Lead" and its own
    description names 30+ endurance/lead routes with no bouldering
    offering stated, the same precedent as Murall Annopol (Poland)
    being tagged lead-only elsewhere in this file.
  - **Geocoding**: of 24 addresses, about half resolved directly against
    Nominatim; the rest fell back to their ward/city centroid, flagged
    per-entry in `notes`, consistent with the Korea/Japan mall-and-
    building-style address pattern already documented elsewhere in this
    file.
  - `state` uses the existing `SEOUL`/`DAEJEON`/`JEJU`/`INCHEON`/`DAEGU`
    keys (all now present in the completed `STATES_BY_COUNTRY.KR` list
    above). Two new `--kr-daejeon`/`--kr-jeju` CSS colour variables and
    two new sidebar chips were added, since these are each division's
    first-ever seed spot.
  - Net result: 1560 → **1584 total spots**; South Korea alone 37 →
    **61**. Structural check (Node-parsed `window.SEED_GYMS`): 1584/1584
    unique ids, zero duplicate name+suburb+state+country combos, every
    spot has a non-empty `types` array, every KR state code used
    confirmed to resolve against the completed `STATES_BY_COUNTRY.KR`.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1584; searching "Dino Cat" returns the
    new Daegu gym; both new chips (Daejeon/Jeju) render and, when
    active, resolve to legible dark-text-on-colour; the Jeju chip
    correctly filters to exactly 4 spots; no console errors beyond the
    deliberately-forced Supabase-unreachable ones; no horizontal
    overflow at 375px mobile with South Korea's now-12-chip row
    expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
- **Taiwan expansion (17 more gyms, 6 → 23, 2 new cities: Kaohsiung,
  Tainan)** — direct follow-up to the Japan/Korea expansions, same
  situation (no Google Places API key configured, general web search
  used as the substitute) and same rationale for picking the country:
  Taiwan was the thinnest already-listed Asian country (6 gyms across 5
  cities, with the country's two largest cities, Kaohsiung and Tainan,
  completely uncovered). Three parallel research passes covered
  Kaohsiung, Tainan, and more Taipei/New Taipei gyms not already in the
  dataset.
  - **Geocoding hit the worst first-try Nominatim failure rate of any
    batch in this dataset so far**: only 1 of 17 addresses (T-UP
    Climbing Gym - Wanhua) resolved at street level on the first try;
    the other 16 fell back to their district centroid. Several
    districts ended up with 2-3 gyms sharing an identical fallback
    point (Zuoying/Kaohsiung ×3, Nangang/Taipei ×3, Zhongshan/Taipei
    ×2) — a small deterministic offset (~400-500m) was applied to each
    so overlapping gyms don't stack on exactly one pixel, the same
    convention as the original Mountain Project multi-gym-per-city
    passes, with every pair/trio's genuinely-distinct-address status
    disclosed in `notes`.
  - **Yes Power Gym** (Tainan) and **Boulder Space - Sanmin** (Kaohsiung)
    are both borderline/lower-confidence cases kept with an explicit
    disclosure rather than excluded: Yes Power Gym is primarily a
    general fitness center whose bouldering area is described as a
    substantial, purpose-built investment (not an incidental wall) —
    the same "genuine dedicated feature, not incidental" standard
    already used for City Fitness Next Gen (Greece); Boulder Space -
    Sanmin's own facility type wasn't confirmed for that specific
    branch, only inferred from the chain's confirmed primary offering.
  - **CLK Climbing Facility** (Tainan) is a mixed indoor/outdoor venue —
    kept only for its confirmed indoor bouldering component in an
    adjacent warehouse, the same "kept for the confirmed indoor part"
    precedent as K2 Escalada Deportiva (Argentina). It also has no
    street address in any source at all — the coarsest fallback tier in
    this batch, a highway-marker-level approximation.
  - **T-WALL Kinshicho and T-WALL Ookayama** precedent extends to this
    batch too: T-UP Climbing Gym's Nangang and Wanhua branches are both
    explicitly bouldering-only per the chain's own site, while its
    Zhonghe branch is the chain's flagship rope-climbing location
    (top-rope + lead + auto-belay) — confirming, once again, that a
    shared chain brand doesn't imply a shared facility type across
    branches.
  - `state` uses the existing `KAOHSIUNG`/`TAINAN` keys — already
    present in `STATES_BY_COUNTRY.TW` from the earlier state-list-
    completeness pass (which populated Taiwan's full 22 municipalities/
    cities/counties even though only 5 had spots at the time), so no
    `js/app.js` change was needed. Two new `--tw-kaohsiung`/`--tw-tainan`
    CSS colour variables and two new sidebar chips were added, since
    these are each city's first-ever seed spot.
  - Net result: 1584 → **1601 total spots**; Taiwan alone 6 → **23**.
    Structural check (Node-parsed `window.SEED_GYMS`): 1601/1601 unique
    ids, zero duplicate name+suburb+state+country combos, every spot has
    a non-empty `types` array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1601; searching "Boulder Space" returns
    the new Kaohsiung gyms; both new chips (Kaohsiung/Tainan) render in
    distinct colours and, when active, resolve to legible dark-text-on-
    colour; the Kaohsiung chip correctly filters to exactly 5 spots; no
    console errors beyond the deliberately-forced Supabase-unreachable
    ones; no horizontal overflow at 375px mobile with Taiwan's now-6-chip
    row expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
- **Vietnam (7 gyms, 2 cities) — the 45th country**, added on request to
  "add the next country with the most gyms that we don't already have."
  Cross-referenced boulderinglist.com's full 84-country gym-count list
  against every country already in this dataset, same method as the
  Ecuador addition. The nominal largest missing country, "Georgia" at 14
  gyms, was skipped for the same already-documented reason (boulderinglist
  conflates the country with the US state of Georgia). The next-largest
  missing countries were a genuine 4-way tie at 7 gyms each: Bolivia,
  Iran, Lithuania, Serbia, and Vietnam — Vietnam was picked after
  checking its own boulderinglist.com page directly and finding 7 solid,
  real, named gyms with an available second directory
  (indoorclimbing.com's own Vietnam page) to cross-check against, rather
  than an arbitrary pick among the tied countries.
  - **Two real corrections surfaced from cross-referencing the two
    directories against each other and each gym's own site**, not just
    address lookups:
    - **Beefy Boulders** — boulderinglist.com's listing gives a single
      Cầu Giấy address, but the chain's own site confirms its 2
      *current* branches are Tây Hồ and Mỹ Đình instead — added both as
      distinct spots rather than the one stale address, the same
      "resolve to the real current branches" treatment already used
      throughout this dataset for chains whose seed-source address had
      gone stale (e.g. Banana Climbing's Kerry Centre/CapitaLand Tianfu/
      Hang Lung Plaza flags in the China batches).
    - **"Crescent Wall" and "Push Climbing"** were listed by
      boulderinglist.com as two separate Ho Chi Minh City gyms, but
      Push Climbing's own site (pushclimbing.vn) confirms "Crescent
      Wall" is simply the branded name for its own location inside
      Crescent Mall — the same venue, not two — merged into one spot
      rather than double-counted, the same "same venue, don't
      double-pin" precedent used throughout this dataset (Salzburg,
      Helsinki, Yan13 Climbing Gym).
  - **Climbing type applied only from direct evidence** — ARCH Rock
    Climbing Hanoi and Push Climbing/Crescent Wall are both confirmed
    bouldering + top-rope + lead (auto-belay too, for Push); the other
    5 are bouldering-only. ARCH's own claim to be "the only climbing
    gym that has rope climbing in Hanoi" was also used as corroborating
    evidence that Hanoi Climbing Hub (routes graded up to V7-8, no rope
    mention anywhere) is bouldering-only, not left as an unconfirmed
    default.
  - **Positions individually geocoded** against Nominatim — 4 of 7
    resolved at street level (ARCH, Beefy Boulders - Mỹ Đình, VietClimb,
    Push Climbing/Crescent Wall); the other 3 (Hanoi Climbing Hub, Beefy
    Boulders - Tây Hồ, Vertical Academy) fall back to their ward's
    centroid, disclosed per-entry.
  - **`state` uses Vietnam's real, current top-level divisions as of the
    July 2025 provincial merger** (63 → 34 provinces/centrally-governed
    cities, a real, very recent administrative change verified directly
    rather than assumed from older general knowledge) — populated
    complete from the start (34 total, same standard as every country
    since the NL fix), of which only Hà Nội (unchanged by the merger)
    and the newly-expanded Hồ Chí Minh City have a seed spot and a
    sidebar chip/colour. District-level names below the province tier
    (Tây Hồ, Long Biên, Quận 7, etc.) were technically abolished by the
    same merger and reorganized into wards, but are kept as `suburb`
    values since they're still how every source (and a real visitor)
    identifies these locations.
  - Net result: 1601 → **1608 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1608/1608 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1608; searching "vietnam" returns all 7 spots;
    the Hanoi chip correctly filters to exactly 5 spots; the new Vietnam
    country `<option>` present in both forms, and selecting it populates
    the state dropdown with all 34 divisions; chip active-state text
    confirmed legible via computed style; no console errors beyond the
    deliberately-forced Supabase-unreachable ones; no horizontal overflow
    at 375px mobile with the region/country expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Lithuania (8 gyms, 3 cities) — the 46th country**, added on request to
  keep applying the "next largest missing country" method — the same
  4-way tie at 7 gyms (Bolivia, Iran, Lithuania, Serbia) Vietnam was
  picked from. Lithuania was the next pick after checking
  indoorclimbing.com's own Lithuania page, which independently listed
  real addresses for all 7 boulderinglist.com candidates — the same
  clean two-directory cross-check Vietnam's pick had.
  - **An 8th gym surfaced from a chain-branch split, the same pattern as
    Beefy Boulders (Vietnam)**: boulderinglist.com's single "Montis
    Magia" listing turned out to be a 2-branch Vilnius chain once its
    own site (montismagia.lt/contactus) was checked directly — LOFTAS
    (Vytenio g. 50) and PIKAS (Ukmergės g. 221) are two distinct climbing
    centers, added as two spots rather than one ambiguous entry.
  - **One stale address corrected**: Scala Dream's boulderinglist.com/
    indoorclimbing.com address (Statybininkų pr. 88, Klaipėda) is stale —
    multiple independent current sources (klaipedatravel.lt, info.lt,
    klaipedaassutavim.lt, trip.lt, the gym's own site) agree on Mainų g.
    6 instead, the same "resolve to the real current address, disclose
    the correction" treatment as Vietnam's Beefy Boulders fix.
  - **One address typo corrected**: indoorclimbing.com's VERTICAL
    Climbing Center address ("Kavalriju 143") was corrected to "Kalvarijų
    g. 143" via independent search and a Mountain Project listing.
  - **Climbing type applied only from direct evidence, same discipline as
    every batch since the worldwide top-rope-tag audit** — Boulder House,
    BONOBO Climbing, and both Montis Magia branches have real evidence of
    top-rope and/or lead alongside bouldering; Climbing Club Kaunas and
    Fabrique are bouldering-only with no rope evidence found (defaulted
    conservatively per the project's established discipline, not
    guessed); Scala Dream's own site explicitly confirms bouldering plus
    "the highest climbing wall in Klaipėda" (top-rope, no lead evidence);
    VERTICAL Climbing Center's 15m lead wall is explicitly confirmed
    separately from its bouldering wall.
  - **Positions individually geocoded** against Nominatim — all 8
    addresses resolved at street level on the first try, the best
    geocoding hit rate of any recent batch in this project.
  - **`state` uses Lithuania's real 10 counties**, populated complete
    from the start (same standard as every country since the NL fix), of
    which 3 (Kaunas, Klaipėda, Vilnius) have a seed spot and a sidebar
    chip/colour.
  - Net result: 1608 → **1616 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1616/1616 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1616; searching "lithuania" returns all 8 spots;
    the Vilnius chip correctly filters to exactly 4 spots; chip
    active-state text confirmed legible via computed style (dark text on
    purple background); no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow at 375px mobile
    with the region/country expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Serbia (5 gyms, 2 divisions) — the 47th country**, added on request to
  keep applying the "next largest missing country" method — a 3-way tie
  at 7 gyms (Bolivia, Iran, Serbia) once Vietnam and Lithuania had been
  picked off the earlier 4-way/5-way ties. Serbia was picked after
  confirming indoorclimbing.com's own Serbia-Montenegro page independently
  gave real street addresses for 5 of boulderinglist.com's 7 candidates —
  the same two-directory cross-check standard as Vietnam/Lithuania.
  - **2 of the 7 original candidates excluded as confirmed outdoor
    artificial walls**, not indoor gyms — same scope exclusion as every
    other outdoor venue in this dataset (Huayan Climbing Park, El Muro,
    etc.): **Ada Ciganlija SPK Vertikal** (a 15m open-air wall "on the
    left bank of the Lake Sava," per the operator's own site) and
    **Kladovo Black Rock** (a 40m/13.5m outdoor wall at Karataš, per
    multiple sources describing it as an outdoor climbing area). Left 5
    real, confirmed indoor gyms — a smaller batch than Vietnam/Lithuania,
    but consistent with this project's standing precedent of excluding
    outdoor venues rather than force-including them to hit a target count.
  - **One candidate resolved a mistranslated-name puzzle rather than being
    a plain lookup**: boulderinglist.com's "I Belgrade Gimnasium" turned
    out to be a location description, not a real venue name — the gym is
    actually **Gekon** (Bouldering sala Gekon / Penjački klub Gekon /
    Climbing Gym Gekon), housed at or adjacent to the First Belgrade
    Gymnasium school building on Cara Dušana street, confirmed via
    multiple independent Serbian-language sources — kept under its real
    current name, the same "resolve the real name, don't trust the
    directory's shorthand label" treatment as MegaSTONE Climbing Gym
    (Taiwan) and El Rocodromo (Ecuador).
  - **One gym kept despite a single, unconfirmed closure signal**: Hala
    Sportova (Ranko Žeravica Sports Hall, Novi Beograd) — a dated,
    secondhand Tripadvisor-forum comment claimed its climbing wall had
    been removed, but every other, more current source (indoorclimbing.com,
    the facility's own activity listings) still describes an active 18m
    rope-climbing wall — kept on the stronger, more recent evidence, with
    the single conflicting claim disclosed in its own `notes` rather than
    silently ignored or acted on alone, the same "don't guess from one
    weak signal" discipline as every other borderline case in this file.
  - **Climbing type applied only from direct evidence** — Sektor44,
    Belgrade Climbing Club, and Gekon are all confirmed bouldering-only
    (each independently described as a dedicated bouldering space with no
    rope-climbing mention); Adrenalin Climbing Club is confirmed
    bouldering + top-rope (both a rope section and a bouldering section,
    per multiple sources); Hala Sportova is confirmed top-rope only (an
    18m rope-climbing wall, no bouldering-specific evidence found).
  - **Positions individually geocoded** against Nominatim — all 5
    addresses resolved at street level on the first try, matching
    Lithuania's own perfect hit rate.
  - **`state` uses Serbia's real top-level districts, deliberately
    excluding Kosovo and Metohija** — 25 districts (Belgrade + Vojvodina's
    7 + Central Serbia's 17), populated complete from the start (same
    standard as every country since the NL fix), of which 2 (Belgrade,
    South Bačka/Novi Sad) have a seed spot and a sidebar chip/colour.
    Kosovo's 5 districts are left out entirely — the same political-
    neutrality reasoning already applied to Russia's city-keyed `state`
    scheme and Israel's exclusion of the West Bank: Kosovo's status is a
    genuine, internationally contested question this app has no reason to
    take a position on by drawing it into a public filter list.
  - Net result: 1616 → **1621 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1621/1621 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1621; searching "serbia" returns all 5 spots;
    the Belgrade chip correctly filters to exactly 4 spots; chip
    active-state text confirmed legible via computed style (dark text on
    red background); no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow at 375px mobile
    with the region/country expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Bolivia (6 gyms, 2 departments) — the 48th country**, added on request
  to keep applying the "next largest missing country" method — a 2-way
  tie at 7 gyms (Bolivia, Iran) once Vietnam/Lithuania/Serbia had been
  picked off the earlier ties. Bolivia was picked after directly comparing
  both countries' second-source cross-check quality: indoorclimbing.com's
  own Bolivia page independently gave real, usable street addresses for
  all 7 of boulderinglist.com's 7 candidates (the best cross-check hit
  rate of any recent batch), whereas Iran's second source
  (iranrocktrip.com) listed a completely different, non-overlapping set
  of gyms, and boulderinglist's own Iran addresses were wall-spec text
  rather than real addresses.
  - **One candidate excluded on scope grounds**: Camp Kewiña (Cochabamba)
    turned out, on closer inspection, to be a 34-hectare outdoor camping
    property with pine/cypress forests, natural rock formations, cabins,
    and a lake — an outdoor recreational retreat with a small climbing
    feature, not a dedicated indoor gym. Same "roof/wall alone isn't
    indoor" scope exclusion already applied to El Muro Cumbayá (Ecuador)
    and Huayan Climbing Park (China).
  - **One gym's real name resolved from a directory mislabel**:
    boulderinglist.com listed "El Miuro" (a likely transcription slip);
    it's actually **El Muro Escalada Deportiva**, Bolivia's first
    professional sport-climbing gym (opened 23 August 2014 at Club
    Olympic, Cochabamba) — its own promotional material explicitly
    advertises top-rope, lead, and (more recently) bouldering courses,
    confirmed via multiple independent sources, so it's the only Bolivia
    spot in this batch tagged with all three climbing types.
  - **Climbing type applied only from direct evidence** — Ahimsa Boulder,
    Gecko Boulders, LA Cueva Boulder Gym, and Llama Climber are all
    confirmed bouldering-only (each independently described as a
    dedicated boulder gym/room with no rope-climbing mention); CRUXTREME
    is confirmed lead-climbing only (a 15m sport-climbing wall, "sport
    climbing" mapped to lead per the same convention already used for
    Movimento Verticale Roma).
  - **Positions individually geocoded** against Nominatim — only the 3 La
    Paz addresses resolved directly on the first try; all 3 Cochabamba
    addresses needed a second, simplified pass: "Club Olympic,
    Cochabamba" resolved to a named Club Olympic point of interest
    (used for El Muro, which is housed there), "Avenida América,
    Cochabamba" resolved to the named avenue itself (used for Gecko
    Boulders), and Ahimsa Boulder's own address is a Google Plus Code
    Nominatim can't parse at all, so it falls back to the Tiquipaya area
    the source itself names.
  - **`state` uses Bolivia's 9 real departments**, populated complete from
    the start (same standard as every country since the NL fix), of
    which 2 (Cochabamba, La Paz) have a seed spot and a sidebar
    chip/colour.
  - Net result: 1621 → **1627 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1627/1627 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1627; searching "bolivia" returns all 6 spots;
    the La Paz chip correctly filters to exactly 3 spots; chip
    active-state text confirmed legible via computed style (dark text on
    orange background); no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow at 375px mobile
    with the region/country expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Iran (4 gyms, 4 provinces) — the 49th country**, the last remaining
  member of the original boulderinglist.com tie at 7 gyms (Bolivia, Iran)
  once Vietnam/Lithuania/Serbia/Bolivia had been picked off the earlier
  ties. Checked directly against a second source (iranrocktrip.com)
  before committing, same discipline as every prior tied-country pick —
  that source turned out to list a completely different, non-overlapping
  set of Tehran gyms rather than confirming boulderinglist's own 7, and
  boulderinglist's own listed "addresses" were wall-specification text
  (e.g. wall height/roof angle), not real street addresses. Individually
  web-searched each of the 7 original candidates anyway rather than
  skipping the country outright.
  - **3 of the 7 original candidates excluded**: 2 could not be confirmed
    real by any source at all (Climbing wall of turbin, Tabriz;
    Boluk-e-Bala/MAXBlocs, Tehran) — no independent mention found
    anywhere, so left out entirely per `Rules.md` §1 rather than guessed
    in. 1 (Tarbiat Modares University, Tehran) was excluded on the same
    ambiguous-public-access grounds as every other unconfirmed
    university wall in this dataset — its real climbing wall (625m²,
    11m overhanging, 14m roof) is confirmed to exist, but no source
    describes its policy toward outside visitors, unlike the university
    gyms elsewhere in this file that were individually confirmed open
    and kept (Beijing Sport University, Chengdu Sport University,
    Tongji University, etc.). Left 4 real, confirmed gyms across 4
    different cities — the smallest country batch in this dataset, but
    consistent with the standing precedent of excluding unconfirmable
    candidates rather than force-including them to hit a target count
    (same as Serbia's 5-of-7 and Bolivia's 6-of-7).
  - **Climbing type applied only from direct evidence** — Shahid Rajaee
    Complex Gym (Qazvin) is confirmed to have both a lead wall (two
    distinct wall structures, one a 155m+6m-roof pyramid) and a separate
    bouldering section; ASOO Yadegar Imam Climbing Gym (Qom) and Davoudi
    Climbing Gym (Tehran) both have no facility-type evidence beyond
    being real, current climbing gyms, so both default to bouldering-only
    per this project's established discipline for unconfirmed-type
    entries (the same standard as Korea's/China's audited batches) rather
    than being guessed as rope climbing. Taka Gayasi (Zanjan) is
    confirmed as a real 12m wall with no discipline named by any
    source — tagged top-rope (not bouldering) since a wall that tall is
    physically incompatible with bouldering-only use (every bouldering
    wall elsewhere in this dataset is under ~5m); this is a physical
    inference from the wall's own confirmed dimensions, not a guess about
    the facility's marketing, the same kind of dimension-based reasoning
    already used for Murall Annopol's (Poland) lead-only tag.
  - **Positions individually geocoded** against Nominatim — 2 of 4
    (Shahid Rajaee, Davoudi) resolved at street/named-location level; the
    other 2 (ASOO, Taka Gayasi) fall back to their city centroid — a
    retry with a more specific sub-address for ASOO (Asayeshgah Square)
    still returned no match.
  - **`state` uses Iran's 31 real provinces**, populated complete from
    the start (same standard as every country since the NL fix), of
    which 4 (Qazvin, Qom, Tehran, Zanjan) have a seed spot and a sidebar
    chip/colour.
  - Net result: 1627 → **1631 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1631/1631 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1631; searching "iran" returns all 4 spots (plus
    2 incidental substring matches on Venezuela's Miranda state — expected
    search behaviour, not a bug); the Tehran chip correctly filters to
    exactly 1 spot; chip active-state text confirmed legible via computed
    style (dark text on green background); no console errors beyond the
    deliberately-forced Supabase-unreachable ones; no horizontal overflow
    at 375px mobile with the region/country expanded.
  - **This completes the original boulderinglist.com "next-largest missing
    country" tie sequence** — every country from the 4-way tie at 7 gyms
    (Bolivia, Iran, Lithuania, Serbia) plus Vietnam has now been added.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Estonia (6 gyms, 3 counties) — the 50th country**, picked from a new
  4-way tie at 6 gyms (Estonia, Malaysia, Thailand, Ukraine) once the
  original ~7-gym tie sequence had been exhausted with Iran. Picked over
  the other three after checking cross-check quality directly:
  indoorclimbing.com's own Estonia page independently confirmed real
  street addresses for most of boulderinglist.com's 6 candidates —
  including recognizing "Tuuletorn" as the Estonian name for the
  already-documented Windtower Experience Centre — a cleaner
  single-source cross-check than Malaysia's or Thailand's scattered
  blog/listicle sourcing. Ukraine was deprioritized: one of its 6
  candidates (Manege, Donetsk) sits in a city under Russian occupation
  where current operating status can't be confirmed, and the listing
  itself mixed "Kiev"/"Kyiv" spellings suggesting stale data.
  - **One pair of adjacent halls kept as one combined spot, not split**:
    Ronimistehas turned out to be two halls under one operator — a
    bouldering hall at Tehase 21 (350m², billed as Southern Estonia's
    only proper bouldering gym) and a separate rope-climbing hall next
    door at Tehase 23 (confirmed top-rope + lead via its own competition
    age-group categories) — pinned as a single spot with all three types,
    since the two halls are consecutive units on the same street rather
    than separate branches across the city, unlike the genuinely
    separate Montis Magia (Lithuania) or ZEN (Japan) multi-branch cases.
  - **One boulderinglist.com generic label resolved to its real name**:
    a second, unnamed "Climbing Gym" (Tartu) entry was independently
    identified as NET Spordihall (Ujula 4), housed at the University of
    Tartu's sports complex, confirmed via multiple sources to have both
    a 4m bouldering wall and 10m/15m rope walls with self-belay devices —
    the same "resolve the directory's shorthand label to a real name"
    treatment as Gekon (Serbia) and El Muro Escalada Deportiva (Bolivia).
  - **Climbing type applied only from direct evidence** — Kivi Climbing
    and Ronimisministeerium (both Tallinn) and Climbing Gym Ringtee
    (Tartu) are all confirmed bouldering-only (each independently
    described with no rope-climbing mention, and Ronimisministeerium's
    own site explicitly frames itself as ropeless); Tuuletorn (Käina) is
    confirmed top-rope via its "four automatic safety lines" (auto-belay,
    the same auto-belay-implies-top-rope mapping used for Banana
    Climbing's tags), no bouldering evidence found.
  - **Positions individually geocoded** against Nominatim — 5 of 6
    resolved at street level on the first try; only Tuuletorn fell back
    to the Käina area centroid (a retry with the diacritic-free street
    name still returned no match).
  - **`state` uses Estonia's 15 real counties (maakonnad)**, populated
    complete from the start (same standard as every country since the
    NL fix), of which 3 (Harju/Tallinn, Tartu, Hiiu/Käina) have a seed
    spot and a sidebar chip/colour.
  - Net result: 1631 → **1637 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1637/1637 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1637; searching "estonia" returns all 6 spots;
    the Tartu chip correctly filters to exactly 3 spots; chip
    active-state text confirmed legible via computed style (dark text on
    orange background); no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow at 375px mobile
    with the region/country expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Malaysia (6 gyms, 4 divisions) — the 51st country**, the first of the
  three remaining members of the tied-at-6 batch (Estonia, Malaysia,
  Thailand, Ukraine) — user asked to "do the rest in the tier" after
  Estonia. All 6 of boulderinglist.com's candidates confirmed real and
  current via independent web search, each with its own genuine street
  address — no exclusions needed, the cleanest hit rate of any recent
  batch.
  - **One directory label resolved to its real name**: boulderinglist.com
    listed "Putrajaya Climb Park," but multiple independent sources
    confirm its real name is Putrajaya Challenge Park (Taman Cabaran), a
    public multi-zone complex — the same "resolve the shorthand label"
    treatment as NET Spordihall (Estonia) and Gekon (Serbia).
  - **Climbing type applied only from direct evidence** — Project Rock
    (Penang) and Rockworld (Johor Bahru) are both confirmed to offer all
    three disciplines (bouldering, top-rope, lead) via their own sites;
    Putrajaya Challenge Park is confirmed bouldering + top-rope + lead
    across its 6 named zones (its speed-climbing zone isn't tagged, since
    this app has no speed-climbing type); Petit Climbing Center (Johor)
    and Bump Bouldering (Selangor) are both confirmed bouldering-only,
    each independently described with no rope-climbing mention; Shah Alam
    Extreme Park (Selangor) is confirmed bouldering + a separate
    belayer-staffed climbing wall, no lead-specific evidence found.
  - **Positions individually geocoded** against Nominatim — 5 of 6
    resolved at street level on the first try; only Petit Climbing Center
    fell back to the Johor Bahru city centroid (a retry with a
    simplified address still returned no match).
  - **`state` uses Malaysia's 13 states + 3 federal territories**,
    populated complete from the start (same standard as every country
    since the NL fix), of which 4 (Penang, Johor, Putrajaya, Selangor)
    have a seed spot and a sidebar chip/colour.
  - Net result: 1637 → **1643 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1643/1643 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1643; searching "malaysia" returns all 6 spots;
    the Selangor chip correctly filters to exactly 2 spots; chip
    active-state text confirmed legible via computed style (dark text on
    purple background); no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow at 375px mobile
    with the region/country expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Thailand (6 gyms, 4 divisions) — the 52nd country**, the second of the
  three remaining members of the tied-at-6 batch (Estonia, Malaysia,
  Thailand, Ukraine) — direct continuation of "do the rest in the tier"
  after Malaysia. Of boulderinglist.com's 7 candidates, 6 confirmed real
  and current via independent web search; 1 (Chill Out, Si Racha) could
  not be confirmed real by any English- or Thai-language source found and
  was excluded, the same "never guess a candidate into existence"
  treatment as Iran's Boluk-e-Bala/MAXBlocs exclusions.
  - **One directory label resolved to its real current identity**:
    boulderinglist.com listed "C3" (Chiang Mai Climbing Club), which
    looked like it might be defunct or renamed on first search — resolved
    via independent search to its real, current name, Progression
    Vertical, confirmed to offer lead climbing, top-rope, an updated
    bouldering area, and a free-standing boulder. Kept under this real
    name rather than excluded, the same "resolve the directory's
    shorthand/outdated label to the real current name" treatment as NET
    Spordihall (Estonia) and Putrajaya Challenge Park (Malaysia).
  - **Climbing type applied only from direct evidence** — 5 of 6 are
    confirmed bouldering + top-rope with no lead-specific evidence found;
    Progression Vertical is the only one confirmed lead-capable too.
  - **Geocoding hit an unusually low first-pass hit rate for this
    batch** — only 1 of 6 addresses (Sports World at LadProa) resolved at
    street level on the first Nominatim pass; a second, simplified-query
    retry pass recovered 2 more (Rock Domain via "Bangna-Trad Road,
    Bangna, Bangkok"; No Gravity via "Chang Moi, Mueang Chiang Mai" — the
    actual named neighbourhood the gym's address sits in, a genuine
    improvement over a bare centroid) and Progression Vertical via
    "Tambon Pa Daet, Chiang Mai." The remaining 2 never resolved past a
    fallback: Sports World Suratthani has no street name in any source at
    all (only "Sports World Department Store, Suratthani"), so it falls
    back to the bare Surat Thani city centroid; Rebel Rock Climbing's
    retry ("Si Sunthon, Thalang, Phuket") returned a confident-looking
    match, but it resolved to a specific, unrelated building (UWC
    Thailand Lower Primary, a school) in the right district rather than
    the gym itself — rejected as a wrong-POI mismatch, per this dataset's
    own established discipline of never trusting a geocoder's
    landed-on-a-different-real-place result (Croatia/Russia/Philippines/
    South Africa/Ecuador), falling back to the plain Phuket city centroid
    instead.
  - **`state` uses Thailand's 76 provinces + Bangkok (77 total)**,
    populated complete from the start (same standard as every country
    since the NL fix), of which 4 (Bangkok, Chiang Mai, Surat Thani,
    Phuket) have a seed spot and a sidebar chip/colour.
  - Net result: 1643 → **1649 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1649/1649 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1649; searching "thailand" returns all 6 spots;
    the Bangkok chip correctly filters to exactly 2 spots; chip
    active-state text confirmed legible via computed style (dark text on
    a red background); no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow at 375px mobile
    with the region/country expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Ukraine (6 gyms, 2 divisions) — the 53rd country**, the third and
  final member of the tied-at-6 batch (Estonia, Malaysia, Thailand,
  Ukraine) — direct continuation of "do the rest in the tier," completing
  the tier. boulderinglist.com's own 6-row Ukraine listing turned out to
  be only 5 distinct gyms once a duplicate scraped row was found (both
  "PRANA – prospect Pobedi-20" and "PRANA – Kiev" resolve to the same
  gym) — and of those 5, 3 had to be excluded rather than trusted at face
  value:
  - **Manege (Donetsk) excluded on political-neutrality/scope grounds,
    not evidence grounds** — Donetsk has been under continuous Russian-
    backed occupation since 2014, with no way to confirm current civilian
    operating status there. Consistent with this dataset's standing
    precedent of not asserting normal operation in occupied/contested
    territory (already applied to Russia's city-keyed `state` scheme and
    Serbia's exclusion of Kosovo), this candidate was excluded outright
    rather than included with a caveat.
  - **PRANA (Kyiv) and KHAI (Kharkiv) excluded as unconfirmable-current**
    — every source found for PRANA was an old, undated listing with no
    2023-2025 mention despite a targeted search; KHAI's only dated source
    (an alpine-club page) couldn't be independently corroborated as
    currently operating, and Kharkiv is a frontline city under regular
    attack (not occupied, but current-status evidence needs to be
    genuinely current) — same "never guess a candidate into existence"
    treatment as Iran's Boluk-e-Bala/MAXBlocs exclusions.
  - **4 better-evidenced, currently-operating gyms found via independent
    web research filled out the batch instead of forcing the weak
    originals in**: Boulder Space and Climbing SPACE (both part of one
    operator, SpaceGroup) and TheWall (Lviv) are all confirmed currently
    operating and expanding via a dated Climbing Business Journal
    article — the strongest current-status evidence found for any gym in
    this whole batch. Hyperion (Kyiv) is confirmed via multiple
    independent sources, though one gives a conflicting address
    (Kyrylivska St 46 vs. the Kostiantynivska St address used, which is
    the one Nominatim could resolve).
  - **Climbing type applied only from direct evidence** — UP!, Tsekh
    Climbing Gym, Hyperion, and TheWall are all confirmed bouldering +
    top-rope (no lead-specific evidence found for any); Boulder Space and
    Climbing SPACE are both confirmed bouldering-only, each independently
    described with no rope-climbing mention.
  - **Geocoding**: 4 of 6 addresses resolved at street level (2 directly,
    2 more via a simplified street-name-only retry); Tsekh Climbing
    Gym's street name never resolved even simplified, falling back to
    the bare Kyiv city centroid.
  - **`state` uses Ukraine's full 27 top-level divisions** (24 oblasts +
    the Autonomous Republic of Crimea + Kyiv and Sevastopol as
    special-status cities), populated complete from the start (same
    standard as every country since the NL fix) — of which 2 (Kyiv,
    Lviv) have a seed spot and a sidebar chip/colour. Unlike Russia's
    city-keyed `state` scheme or Serbia's exclusion of Kosovo, Crimea is
    deliberately **included** here: it's Ukraine's own internationally-
    recognized constitutional territory, not a case of drawing a
    different country's contested territory into a public filter list,
    so including it doesn't take a side the way excluding it (or
    including it under a different country's list) would.
  - Net result: 1649 → **1655 total spots**. Structural check
    (Node-parsed `window.SEED_GYMS`): 1655/1655 unique ids, zero
    duplicate name+suburb+state+country combos, every spot has a
    non-empty `types` array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1655; searching "ukraine" returns all 6
    spots; the Kyiv chip correctly filters to exactly 5 spots; chip
    active-state text confirmed legible via computed style (dark text on
    a blue background); no console errors beyond the deliberately-forced
    Supabase-unreachable ones; no horizontal overflow at 375px mobile
    with the region/country expanded.
  - **This completes the "do the rest in the tier" batch** — all three
    remaining tied-at-6 countries (Malaysia, Thailand, Ukraine) have now
    been added, following Estonia's own pick from the same tie.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Slovakia (6 gyms, 4 divisions) — the 54th country**, the next-largest
  missing country per boulderinglist.com's full country list (5 gyms)
  once the earlier ~6/~7-gym ties had all been exhausted. Cross-checked
  boulderinglist's own Slovakia page directly against indoorclimbing.com's
  Slovakia page, the same two-directory discipline used for every recent
  pick — 4 of the 5 gyms matched exactly across both sources (Brutál
  Povala, Block Dock, Vertigo, HK Manin, with real addresses from
  indoorclimbing.com), but the two disagreed on the 5th: boulderinglist
  listed K2-Zilina Bouldering Climbing Gym, indoorclimbing.com listed
  Ovčín Boulder & Bistro instead. Rather than pick one over the other,
  both were individually web-searched — both turned out to be real,
  independently confirmed, currently-operating gyms — so both were kept,
  giving 6 gyms total instead of 5.
  - **Climbing type applied only from direct evidence, same discipline as
    every batch since the worldwide top-rope-tag audit** — Brutál Povala
    and Ovčín Boulder & Bistro are both confirmed bouldering-only (each
    explicitly described as ropeless); Block Dock is confirmed
    bouldering-only despite its 650m2 size (explicitly billed as a
    bouldering gym across both its Rača and Petržalka locations, no rope
    mention in any source); Vertigo, HK Manin, and K2-Zilina are all
    confirmed to offer bouldering + top-rope + lead climbing (Vertigo:
    84 lead lines with auto-belay/top-rope up to 12m plus two bouldering
    halls; HK Manin: the operating club's own site explicitly confirms
    both top-rope and lead belaying courses, alongside a separate 4m
    bouldering wall; K2-Zilina: its own site has an explicit "Lead
    Climbing" page, 80 rope lines up to 15m with auto-belayers, plus two
    bouldering profiles).
  - **Positions individually geocoded** against Nominatim — all 6
    addresses resolved at street level on the first try, matching the
    perfect hit rate already seen for Lithuania and Serbia.
  - **`state` uses Slovakia's 8 real kraje (regions)**, populated
    complete from the start (same standard as every country since the
    NL fix), of which 4 have a seed spot and a sidebar chip/colour:
    Bratislavský, Žilinský, Trenčiansky, Banskobystrický.
  - Net result: 1655 → **1661 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1661/1661 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1661; searching "slovakia" returns all 6 spots;
    the Bratislavský chip correctly filters to exactly 2 spots (Block
    Dock, Vertigo); chip active-state text confirmed legible via computed
    style (dark text on teal background); no console errors beyond the
    deliberately-forced Supabase-unreachable ones; no horizontal overflow
    at 375px mobile with the region/country expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **United Kingdom expansion (33 more gyms, 66 → 99) using
  boulderingwall.com, plus 3 corrections to existing GB entries.** User
  asked to cross-reference `boulderingwall.com/countries/` and
  `climbingbusinessjournal.com/map/` against existing countries.
  - **climbingbusinessjournal.com/map/ was investigated and found not
    usable as a data source**: the page's own text states "This map
    includes commercial climbing gyms in the USA and Canada" (free tier),
    with Pro/Plus/Premium paid tiers for anything beyond that. The map
    itself is embedded via a third-party service, Maptive, which loads
    data from its own backend with no accessible free JSON API (checked
    via `curl` HTML inspection and Browser-tool network-request
    monitoring). Since this dataset already has thorough US/Canada
    coverage, effort was redirected entirely to boulderingwall.com.
  - **boulderingwall.com turned out to be a substantially better UK
    source than the original Mountain Project directory-listing-depth
    sourcing GB's existing 66 gyms came from**: every listing on it
    explicitly states its own discipline ("Bouldering" vs. "Bouldering +
    ropes"), a strictly better evidence tier than inferring type from a
    gym's name alone.
  - **Scope discipline applied** (per `Rules.md` §11): the full UK
    opportunity on this site works out to roughly 72 potential new
    entries once every one of its ~63 UK city pages is worked through,
    plus a further ~20 other-country chain-expansion candidates spotted
    along the way (Malaysia/Camp5, Canada/Hive, Germany/Boulderwelt,
    Japan/B-PUMP network, Australia/9 Degrees, New Zealand/Boulder Co)
    and 3 Turkey candidates — far larger than any single-batch addition
    in this project's history. This pass deliberately did a smaller,
    representative slice instead (30 England + 2 Scotland + 1 Wales = 33
    new spots, plus 3 corrections to existing entries) and defers the
    rest — see the Backlog entry.
  - **Three existing GB entries corrected, not just left alone**:
    **Rhino Boulder** (`suburb:"Greater London"`, no address, a rough
    city-level position) is the same gym as boulderingwall.com's "Rhino
    Boulder, The Mall, Bromley, BR1 1TS" listing (a distinctive,
    uncommon name) — updated in place with the real address/suburb/
    geocoded position rather than added as a duplicate.
    **Parthian Climbing Harrogate** was acquired by Live For Today in
    March 2024 and is now publicly branded "Live For Today Climbing
    Centre (Formerly Parthian Harrogate)" — a rename, not a new gym.
    **Climbing The Walls** (Shrewsbury) turned out to be the name of a
    specific activity/session at the real venue, Climbing Hut Shrewsbury
    — renamed to the venue's actual name.
  - **Several duplicate-vs-new-gym ambiguities resolved via targeted
    follow-up research rather than guessed either way**: **Harrogate**
    and **Shrewsbury** above (both renames); **Llanberis** —
    boulderingwall.com attributed "Indy Climbing Wall" there, but
    independent search confirms the real INDY Climbing Wall is in
    Llanfairpwll, Anglesey (postcode LL61 6NT), matching this dataset's
    existing, correctly-placed entry exactly — a boulderingwall.com
    data-quality error, not a new gym, so no action was needed.
    **Belfast** — the site's Belfast page contributed 0 confirmed new
    gyms after a candidate found there (Boulder Istanbul-adjacent search
    noise) turned out irrelevant.
  - **Excluded on scope grounds**: France's boulderingwall.com listing is
    outdoor-only, skipped entirely (consistent with this dataset's
    indoor-only scope).
  - **Excluded on unconfirmed-status grounds, per `Rules.md` §1**: 911
    Search & Rescue Association (Turkey) — the specific web address found
    for it belonged to a different regional branch entirely (Bandırma/
    Balıkesir, not the Bursa-based entity originally found via search),
    and the Bursa entity's public-access policy for its climbing wall
    couldn't be confirmed from any source. Boulder Istanbul (Wall of
    Istanbul) — a real, historically-established gym, but showed a
    "temporarily closed" signal in search results and isn't listed on
    either boulderinglist.com or indoorclimbing.com, so its current
    operating status couldn't be confirmed. **Both Turkey exclusions,
    plus the general unconfirmed-status caution, meant Turkey was not
    added as this dataset's 55th country this pass** — only one Turkey
    gym (Boulderhane, Istanbul) actually cleared verification, and this
    project's own standard (see the "Georgia" country/US-state mixup
    earlier in this file) is that one confirmed gym isn't enough to seed
    a whole country. Left for a dedicated future research pass instead
    of force-added.
  - **Chain-precedent typing applied where a specific branch's own
    discipline wasn't independently confirmed**, consistent with this
    dataset's established practice of checking each branch individually
    but falling back on a chain's already-confirmed pattern when a
    branch-specific source is silent: **The Climbing Hangar** (already
    confirmed bouldering-only chain-wide via its existing London entry)
    applied to its new Sheffield/Liverpool ×2/Reading/Southampton/Exeter/
    Plymouth branches; **Eden Rock** (already confirmed bouldering-only
    via its existing Carlisle and Edinburgh entries) applied to its new
    Newcastle branch; **Big Depot**-branded flagship locations (Leeds,
    Manchester, Birmingham, Sheffield) tagged bouldering + top-rope +
    lead on the same pattern as this dataset's existing Depot Manchester/
    Nottingham entries, while boulderingwall.com's own "Bouldering"-only
    tag was kept as-is for the smaller Armley/Pudsey Depot branches
    rather than overridden by the chain pattern.
  - **Positions**: 18 of the 33 new spots were individually geocoded
    against Nominatim (mostly via bare-postcode-only queries, which
    resolved cleanly for Leeds/Sheffield/Liverpool/Newcastle/Cambridge/
    Reading/Southampton/Exeter postcodes); the rest use a disclosed
    city-centre approximation. **Depot Climbing Birmingham's postcode
    (B5 6LU) never resolved correctly** despite three attempts (first to
    Blackwall Tunnel, London; then to an unrelated Birmingham postcode,
    B2 4DH) — falls back to the Birmingham city centroid with the
    geocoding difficulty disclosed, consistent with this dataset's
    established precedent for addresses that can't be pinned exactly.
    **The Hive Swansea's address ("Rear of 75...") never resolved even
    after retrying with a simplified street+postcode query** — falls
    back to a Swansea city-centre position, also disclosed.
  - Net result: 1661 → **1694 total spots** (GB 66 → 99). Structural
    check (Node-parsed `window.SEED_GYMS`): 1694/1694 unique ids, zero
    duplicate name+suburb+state+country combos, every spot has a
    non-empty `types` array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1694; all 33 new spots and all 3
    corrected entries confirmed searchable by name with the expected
    corrected suburb/name text (Rhino Boulder → Bromley, Climbing Hut
    Shrewsbury, Live For Today Climbing Centre); no console errors beyond
    the deliberately-forced Supabase-unreachable ones; no horizontal
    overflow at 375px mobile with the GB chip row expanded; `git diff` on
    `js/supabase-init.js` confirmed clean after reverting the test edit.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country/city addition.
- **Cyprus (5 gyms, 55th country)** — the next-largest missing country per
  boulderinglist.com's full list once Slovakia had been added, with one
  real trap caught along the way: **Costa Rica's own summary count on
  boulderinglist.com's country-index page said 4 gyms, but its actual
  detail page shows 0** — the same kind of stale/mismatched-count issue
  already documented for "Georgia," caught this time by checking the
  detail page directly rather than trusting the index page's number, per
  the lesson from that earlier trap. Cyprus (3 gyms per its own detail
  page) was checked next and turned out to be a real, if incomplete,
  starting point.
  - **boulderinglist.com's own 3-gym Cyprus list was independently
    confirmed by indoorclimbing.com** (real street addresses for all 3:
    LCC Limassol Climbing Club, Ungravity Climbing, C.F.C.C. Cyprus
    Federation Climbing Centre) — the strongest cross-check quality of
    the four countries tied at 3 gyms that round (Cyprus, Panama, Peru,
    Singapore all considered; Singapore's own listings were notably
    messier, mixing indoor and outdoor facilities within single entries).
  - **General web search surfaced 2 more real, currently-operating
    gyms neither directory had listed**: Redpoint (Kaimakli, Nicosia — a
    parkour + bouldering academy, "the best and biggest in Nicosia" per a
    Reddit thread) and Rockstar Climbing (Nicosia — a boutique 142sqm
    bouldering gym, confirmed via Walltopia's own project page, which
    built the wall). Both individually confirmed via their own sites/
    business listings before being added — this dataset ended up with 5
    real Cyprus gyms, more than either source's own count.
  - **Confirmed no real indoor gym exists in Paphos**, Cyprus's other
    major city — multiple Reddit/Facebook threads from residents asking
    "are there none?" found no counter-evidence, so nothing was added
    there rather than guessed in.
  - **Climbing type applied only from direct evidence**: Ungravity
    Climbing confirmed bouldering + lead wall (allaboutkids.com.cy) plus
    a separate roped-climbing confirmation from a third-party directory;
    C.F.C.C. confirmed bouldering + 4 sport-climbing walls (mapped to
    lead climbing, the same "sport climbing = lead" convention used
    throughout this dataset); LCC Limassol, Redpoint, and Rockstar
    Climbing are all confirmed bouldering-only via their own
    sites/directories, with no rope-climbing evidence found for any of
    the three.
  - **Positions**: 3 of 5 addresses resolved directly against Nominatim
    (Ungravity, Redpoint, Rockstar Climbing); LCC Limassol and C.F.C.C.
    fell back to a city/area centroid after their specific streets
    didn't resolve even on a simplified retry.
  - **`state` uses Cyprus's 6 official Republic of Cyprus districts**
    (Nicosia, Limassol, Larnaca, Famagusta, Paphos, Kyrenia) — the
    standard, internationally-recognized administrative division
    (Northern Cyprus/the TRNC is recognized only by Turkey), not a
    contested-territory judgment call the way Kosovo/West Bank/Crimea
    were handled elsewhere in this file. Only Nicosia and Limassol have
    a seed spot and a sidebar chip/colour so far.
  - Net result: 1694 → **1699 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1699/1699 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1699; all 5 Cyprus spots searchable by
    name; the Nicosia chip correctly filters to exactly 4 spots with
    legible active-state text (dark text on blue background); the new
    Cyprus country `<option>` present in both add/edit forms; no console
    errors beyond the deliberately-forced Supabase-unreachable ones; no
    horizontal overflow at 375px mobile; `git diff` on
    `js/supabase-init.js` confirmed clean after reverting the test edit.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Panama (3 gyms, 56th country)** — the next candidate from the same
  tied-at-3 group Cyprus was picked from (Panama, Peru, Singapore).
  boulderinglist.com's own 3-gym Panama listing was independently
  confirmed by indoorclimbing.com with matching real addresses for all
  3 — the stronger cross-check of the two remaining candidates: Peru's
  own indoorclimbing.com page only confirmed 1 of its 3 candidates
  (Singapore was already deprioritized during the Cyprus pick for
  mixing indoor/outdoor facilities within single listings).
  - **All 3 candidates individually confirmed real and currently
    operating** via web search, not just trusted from the two
    directories: El Espacio La Cueva (Alto Boquete) has an active
    Instagram/Facebook presence with posts as recent as a few months
    old; Sportlink Climb (Costa del Este) has a well-established
    5,500+-follower Instagram and hosts the Panama Climbing Games
    competition; Baboons Boulder Wall is confirmed via its own hostel's
    site (posada1914.com) as "the only [indoor climbing wall] in Panama
    City," bookable as a public activity rather than restricted to
    hostel guests.
  - **Climbing type applied only from direct evidence** — all 3 are
    bouldering-only (El Espacio La Cueva's own description names a
    "Boulder House"; Sportlink Climb is explicitly "Boulder wall
    climbing"; Baboons Boulder Wall's own name and every source describe
    only a boulder wall), no rope-climbing evidence found for any.
  - **Positions**: El Espacio La Cueva resolved directly against
    Nominatim to the named Alto Boquete corregimiento; Sportlink Climb
    and Baboons Boulder Wall's specific street addresses didn't resolve
    (one Nominatim result for Baboons' address landed on an unrelated
    street/suburb entirely — Calidonia instead of the confirmed Bella
    Vista — rejected as a wrong-street match, the same failure mode
    already documented for Croatia/Russia/the Philippines/South Africa/
    Ecuador elsewhere in this file) — both fall back to their confirmed
    neighbourhood's area centroid instead.
  - **`state` uses Panama's 10 real provinces plus its 5 indigenous
    comarcas**, populated complete from the start (same standard as
    every country since the NL fix) — only Chiriquí and Panamá have a
    seed spot and a sidebar chip/colour so far.
  - Net result: 1699 → **1702 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1702/1702 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1702; all 3 Panama spots searchable by
    name; the Panamá chip correctly filters to exactly 2 spots with
    legible active-state text (dark text on gold background); the new
    Panama country `<option>` present in both add/edit forms; no console
    errors beyond the deliberately-forced Supabase-unreachable ones; no
    horizontal overflow at 375px mobile; `git diff` on
    `js/supabase-init.js` confirmed clean after reverting the test edit.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Peru (5 gyms, 57th country)** — the last of the tied-at-3 group
  (Cyprus, Panama, Peru, Singapore) picked. Peru's own indoorclimbing.com
  cross-check was the weakest of the three (it only independently
  confirmed 1 of boulderinglist.com's 3 candidates — CCM Arequipa — not
  all 3 the way Cyprus's and Panama's second sources had), so every
  candidate was individually web-searched rather than trusted from the
  directory alone. This surfaced **2 more real, currently-operating gyms
  neither directory listed**: Pirqa (Miraflores, home to Peru's national
  climbing team per Climbing Magazine) and Bloque (an active, 5,000+-
  follower bouldering gym) — both independently confirmed via a
  dedicated gym-review site, rockclimbperu.com, and (for Pirqa) Wanderlog
  reviews.
  - **Climbing type applied only from direct evidence, cross-checked
    against multiple independent sources for the Lima gyms specifically**
    since the initial evidence was sometimes contradictory: Base Camp
    Peru's own site names both bouldering and "deportiva" (sport
    climbing), and rockclimbperu.com independently confirms a "gateway
    lead wall" — tagged bouldering + lead. VERTICAL Gimnasio de Escalada's
    own site brands itself "Palestra o bloque" (implying a rope wall),
    but its wall-angle description (30°/15°/plates) reads as bouldering-
    specific terminology, and an independent gym-review site explicitly
    calls it an "open air bouldering facility" with no rope-climbing
    evidence found elsewhere — tagged bouldering-only on the
    stronger, more specific evidence. Pirqa is confirmed by two
    independent sources (rockclimbperu.com and Wanderlog) to have both
    rope walls and bouldering — tagged bouldering + top-rope (no
    lead-specific terminology found). CCM Arequipa and Bloque are both
    confirmed bouldering-only from their own descriptions, with no
    rope-climbing evidence found for either.
  - **Positions**: 4 of 5 addresses resolved directly against Nominatim
    (Pirqa matched a named "PIRQA Climbing Gym" point of interest, the
    strongest confirmation tier); Bloque has no specific street address
    findable via any source despite being confirmed real and active —
    falls back to a general Lima position, disclosed.
  - **`state` uses Peru's 25 real regions** (24 departments + the
    Constitutional Province of Callao), populated complete from the
    start (same standard as every country since the NL fix) — only Lima
    and Arequipa have a seed spot and a sidebar chip/colour so far.
  - Net result: 1702 → **1707 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1707/1707 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1707; all 5 Peru spots searchable by
    name; the Lima chip correctly filters to exactly 4 spots with legible
    active-state text (dark text on red background); the new Peru country
    `<option>` present in both add/edit forms; no console errors beyond
    the deliberately-forced Supabase-unreachable ones; no horizontal
    overflow at 375px mobile; `git diff` on `js/supabase-init.js`
    confirmed clean after reverting the test edit.
  - **This finishes the tied-at-3 group** — Cyprus, Panama, and Peru have
    all been added; only Singapore remains from that group, still
    deprioritized for mixing indoor/outdoor facilities within single
    listings.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Turkey (3 gyms, 58th country)** — after finishing the tied-at-3 group,
  boulderinglist.com's own full 84-country gym-count list showed Turkey
  as the next-largest missing country (5 raw listings), higher than every
  member of the 2-gym tier this file had previously flagged as the next
  candidates. This revisits a country an earlier session (the
  boulderingwall.com UK pass) had explicitly deferred, after concluding
  only one confirmed gym (Boulderhane) existed there — not enough to seed
  a country by this dataset's own standard.
  - **boulderinglist.com's 5 raw listings were only 4 distinct entries**:
    "Bursa Tirmanis Evi" appears twice under two different city labels (a
    specific street-address label and a plain "Bursa" label) — the same
    gym, not two. Of the remaining 4, **911 Search & Rescue Association**
    (Bursa) was excluded again — this is the same candidate already
    investigated and rejected during the boulderingwall.com pass (wrong
    branch address found, public-access policy for its climbing wall
    never confirmed) — leaving 3.
  - **All 3 remaining candidates individually confirmed real and current
    via web search, not just trusted from the directory**: **Boulderhane**
    (Istanbul) — already confirmed in the earlier pass, re-verified here
    via its own site (boulderhane.com), Mountain Project, and Wanderlog
    reviews; a ~700sqm bouldering-only gym on the -1 floor of Metrocity
    AVM. **Bursa Tırmanış Evi** — confirmed via indoor-climbing-map.com, a
    60m² bouldering wall run by Bursa Dağcılık ve Doğa Sporları İhtisas
    Kulübü (Bursa Mountaineering and Nature Sports Club) with real public
    opening hours (Mon/Thu 18:00-21:00) — genuinely publicly accessible
    during those windows, not a members-only club facility. **BoulderEs**
    (Boulder Eskişehir) — confirmed via its own site (bouldereskisehir.com),
    climbing-gyms.com, and an active Instagram, offering workshops and
    personal training.
  - **3 gyms matches this dataset's own established precedent for seeding
    a country** — Panama and Peru both started at exactly 3 gyms too, so
    this isn't treated as a thinner bar than usual.
  - **All 3 confirmed bouldering-only** — none of the three sources found
    for any of the three gyms mentions a rope wall, top-rope, or lead
    climbing, so no type was assumed without evidence, per the lesson
    from the worldwide top-rope-tag audit.
  - **Positions individually geocoded** against Nominatim — Boulderhane
    resolved to a named point of interest inside Metrocity AVM sharing its
    exact street number (No:171); Bursa Tırmanış Evi's street resolved
    directly. **BoulderEs hit the "same street name exists elsewhere"
    failure mode** already documented for Croatia/Russia/the Philippines/
    South Africa/Ecuador/Panama — "Basın Şehitleri Caddesi" exists in two
    different Eskişehir neighbourhoods (Kırmızıtoprak and Osmangazi); the
    correct one (Kırmızıtoprak) was confirmed via an independent source
    explicitly naming "BoulderEs Kırmızıtoprak," not picked arbitrarily
    from Nominatim's ranked results.
  - **`state` uses Turkey's 81 real provinces (il)**, populated complete
    from the start (same standard as every country since the NL fix) —
    only İstanbul, Bursa, and Eskişehir have a seed spot and a sidebar
    chip/colour so far.
  - Net result: 1707 → **1710 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1710/1710 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1710; all 3 Turkey spots searchable by
    name; the İstanbul chip correctly filters to exactly 1 spot with
    legible active-state text (dark text on red background); the new
    Turkey country `<option>` present in both add/edit forms; no console
    errors beyond the deliberately-forced Supabase-unreachable ones; no
    horizontal overflow at 375px mobile; `git diff` on
    `js/supabase-init.js` confirmed clean after reverting the test edit.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Latvia (2 gyms, 59th country)** — after Turkey, boulderinglist.com's
  full 84-country list showed Latvia (4 raw listings) as the next-largest
  missing country, ahead of Malta (3) and the 2-gym tier this file had
  previously flagged.
  - **boulderinglist.com's 4 raw listings were only 2 real indoor
    candidates**: "Falkors Bouldering Center" appears twice under two
    differently-spelled city labels (Riga vs Rīga — the same gym), and
    "Gandra Tower" is explicitly an outdoor 12m artificial-rock tower
    with top-rope/lead belaying and winter drytooling — excluded on the
    same "indoor gyms only" scope grounds as every other outdoor
    exclusion in this dataset (Huayan Climbing Park, El Muro, Ada
    Ciganlija SPK Vertikal, etc.). That leaves Falkors and Virsotne.
  - **Cross-checked against a dedicated local source (skydive.lv, a
    Latvian tour operator's blog, explicitly dated "Updated: July 2026")
    rather than just the two directories**, which independently confirms
    Riga has exactly 2 indoor bouldering gyms (Falkors, Virsotne) plus
    the one outdoor tower already excluded — a clean, unambiguous
    confirmation that 2 is the real count, not an artifact of this
    dataset's own filtering.
  - **indoorclimbing.com's own listing for Falkors gave a second, older
    address** (Ropau 140-303) alongside the current one — Falkors' own
    site (boulderings.lv/contact) lists only the one current physical
    location (Ūnijas iela 14), so the older address was treated as a
    stale/former listing, not a second gym, the same "resolve to the
    real current location" discipline used throughout this dataset
    (Beefy Boulders, Scala Dream, Banana Climbing's various flagged
    addresses).
  - **Climbing type applied only from direct evidence**: Falkors is
    confirmed bouldering-only (its own site and every source describe it
    purely as a "bouldering center," no rope mention anywhere); Virsotne
    is confirmed bouldering + top-rope — skydive.lv's own description
    explicitly calls it "one of the few indoor gyms that also offers
    rope climbing."
  - **Positions individually geocoded** against Nominatim — both
    resolved on the first try, Falkors to a named "Falkors Boulderinga
    Centrs" point of interest and Virsotne directly to the named "Sky
    and more" shopping centre matching the source's own description —
    the strongest confirmation tier this dataset uses.
  - **`state` uses Latvia's current 43 top-level divisions** (7
    valstspilsētas/republican cities + 36 novadi/municipalities, per the
    2021 administrative-territorial reform, verified directly rather
    than assumed from older general knowledge), populated complete from
    the start (same standard as every country since the NL fix) — only
    Rīga has a seed spot and a sidebar chip/colour so far.
  - Net result: 1710 → **1712 total spots**. Structural check
    (Node-parsed `window.SEED_GYMS`): 1712/1712 unique ids, zero
    duplicate name+suburb+state+country combos, every spot has a
    non-empty `types` array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1712; both Latvia spots searchable by
    name; the Rīga chip correctly filters to exactly 2 spots with
    legible active-state text (dark text on purple background); the new
    Latvia country `<option>` present in both add/edit forms; no console
    errors beyond the deliberately-forced Supabase-unreachable ones; no
    horizontal overflow at 375px mobile; `git diff` on
    `js/supabase-init.js` confirmed clean after reverting the test edit.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Malta was investigated but not added, and Singapore (2 gyms, 60th
  country) was picked instead.** After Latvia, boulderinglist.com's
  full list showed Malta (3 raw listings) as the next-largest missing
  country. Individually checking each candidate found: "Gebla Climbing"
  (L-Imsida) announced via Euro Climbing News that it would close its
  indoor gym by the end of 2025, pivoting to an outdoor-only guiding
  business — a confirmed closure by the time of this pass (September
  2026), same "confirmed closure → exclude" treatment as Boulder Project
  Prahran; "Sliema Scouts Climbing Gym" and "Bouldering Wall - Sliema"
  are the same venue (Sliema Scouts HQ, run by the Malta Climbing Club)
  listed twice under two names. That left only 1 real, current gym — not
  enough to seed a country by this dataset's own standard (the same
  "Georgia"/Turkey-deferral precedent), so Malta was left out and the
  next candidate, Singapore, was tried instead.
- **Singapore (2 gyms, 60th country)** — every one of boulderinglist.com's
  3 Singapore listings mixes indoor and outdoor facilities within a
  single entry, the reason this country was repeatedly deprioritized in
  every earlier tied-country pick in this file. Scoped more carefully
  this time, applying the same "kept for the confirmed indoor component
  only" precedent already used for K2 Escalada Deportiva (Argentina) and
  the Climbing Barn Adventure Centre (South Africa):
  - **"Climb Asia Climbing Centre"** is a stale directory name —
    independently confirmed via its own site (groundupsg.com), Chalk
    Rebels, and Little Steps to have rebranded to **Ground Up Climbing**,
    kept under its real current name (the same "resolve the directory's
    outdated label" treatment as El Rocodromo/Gekon/MegaSTONE elsewhere
    in this file). Its own site confirms 34 lanes for bouldering, top
    rope, and lead climbing — all three types confirmed by direct
    evidence, not the outdoor high wall boulderinglist.com's own listing
    also mentioned (excluded, out of this app's indoor-only scope).
  - **"Yishun Safra Climbing Centre"** is described by boulderinglist.com
    primarily as an outdoor facility ("Singapore's largest outdoor
    climbing facility"), but SAFRA's own site (safra.sg) independently
    confirms a genuine separate "two floors of indoor bouldering"
    component — kept for that confirmed indoor part only. Confirmed
    genuinely publicly accessible via a non-member walk-in fee (~S$18),
    not restricted to SAFRA members only, the same "verify, don't assume
    a club/members' facility is closed to the public" standard already
    applied to HK Manin (Slovakia) and the Korea/Ireland/Chile/South
    Africa university-gym cases.
  - **"Ubin Lagoon Resort" was excluded on unconfirmed-status grounds**
    — its address couldn't be confirmed to actually be on Pulau Ubin
    island itself (one source gave a mainland Punggol address instead, a
    real, unresolved discrepancy) and no independent source confirmed
    it's still operating or genuinely open beyond resort guests — left
    out per `Rules.md` §1 rather than guessed either way, the same
    treatment as PRANA/KHAI (Ukraine) and Elos (Venezuela).
  - **Positions individually geocoded** against Nominatim — Ground Up
    Climbing resolved directly to a named "Ground Up" sports-centre point
    of interest; Yishun Safra Climbing Centre resolved to the named
    "Safra Yishun Country Club" grounds — both the strongest confirmation
    tier this dataset uses.
  - **`state` uses Singapore's 5 real Community Development Council (CDC)
    districts**, populated complete from the start (same standard as
    every country since the NL fix) — only Central Singapore (Ground Up,
    Kallang) and North West (SAFRA Yishun) have a seed spot and a
    sidebar chip/colour so far.
  - Net result: 1712 → **1714 total spots**. Structural check
    (Node-parsed `window.SEED_GYMS`): 1714/1714 unique ids, zero
    duplicate name+suburb+state+country combos, every spot has a
    non-empty `types` array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-
    forcing method): count reads 1714; both Singapore spots searchable
    by name; the Central Singapore chip correctly filters to exactly 1
    spot with legible active-state text (dark text on red background);
    the new Singapore country `<option>` present in both add/edit forms;
    no console errors beyond the deliberately-forced Supabase-
    unreachable ones; no horizontal overflow at 375px mobile; `git diff`
    on `js/supabase-init.js` confirmed clean after reverting the test
    edit.
  - **This finishes the original tied-at-3 group entirely** (Cyprus,
    Panama, Peru, Singapore) — every member has now been added.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Bosnia and Herzegovina (4 gyms, 61st country)** — the next-largest
  missing country per boulderinglist.com's full 84-country list once
  Singapore finished the tied-at-3 group. boulderinglist.com's own
  detail page listed only 2 gyms, but climbing-gyms.com's own BiH page
  lists 6 cities with a gym each — the same "a directory's listing count
  isn't the ceiling" pattern already documented for Cyprus/Peru/Bosnia's
  own predecessors in this file. Every one of the 6 climbing-gyms.com
  candidates was individually checked: "Climbing Area Pecka" (Gornja
  Pecka) is confirmed as a famous 140+-route OUTDOOR sport-climbing crag
  with a visitor centre, not an indoor gym — excluded on scope grounds.
  "Penjalište/vježbalište Miroslav Đokić-Đole" (Trebinje) had no
  independent source confirming it's specifically an indoor facility —
  left out per `Rules.md` §1 rather than guessed either way, the same
  discipline already used for Iran's Boluk-e-Bala/MAXBlocs and Ukraine's
  PRANA/KHAI. "Alpinist sport climbing club Neretva" (Mostar) resolved
  to the already-known ASPK Neretva, confirmed via matching address —
  not a new find. The remaining 4 are all confirmed real, current,
  genuinely indoor gyms: Indoor Wall Foča, ASPK Neretva (Mostar), Flamingo
  Loophole (Bihać — the climbing-gyms.com source that surfaced this and
  Climbing Club Extreme beyond boulderinglist.com's own 2-gym count), and
  Climbing Club Extreme (Banja Luka, "the best climbing hall in Bosnia
  and Herzegovina").
  - **All 4 confirmed bouldering-only** — none of the sources found for
    any of the four gyms mentions a rope wall, top-rope, or lead
    climbing, so no type was assumed without evidence, per the lesson
    from the worldwide top-rope-tag audit.
  - **Positions**: 2 of 4 addresses (Indoor Wall Foča, ASPK Neretva)
    resolved directly against Nominatim. Flamingo Loophole's exact
    address returned an empty result on the first Nominatim query;
    resolved on a simplified retry ("502. viteske brdske brigade,
    Bihac, Bosnia"). Climbing Club Extreme's address also returned empty
    on the first query; resolved on a corrected/expanded-spelling retry
    ("Bulevar vojvode Petra Bojovica, Banja Luka, Bosnia"). Both retries
    followed this project's established "simplify the query, don't
    guess a location" discipline.
  - **`state` uses Bosnia and Herzegovina's real administrative
    structure**: the 10 Federation of BiH cantons + Republika Srpska (as
    one undivided unit, since it isn't further subdivided into cantons)
    + Brčko District = 12 total divisions, populated complete from the
    start (same standard as every country since the NL fix). Only 3 have
    a seed spot and a sidebar chip/colour: Republika Srpska (Foča +
    Banja Luka), Herzegovina-Neretva Canton (Mostar), Una-Sana Canton
    (Bihać).
  - Net result: 1714 → **1718 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1718/1718 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1718; all 4 spots searchable by "bosnia"; the
    Republika Srpska chip correctly filters to exactly 2 spots with
    legible active-state text (dark text on purple background); the new
    Bosnia and Herzegovina country `<option>` present in both forms; no
    console errors beyond the deliberately-forced Supabase-unreachable
    ones; no horizontal overflow at 375px mobile; `git diff` on
    `js/supabase-init.js` confirmed clean after reverting the test edit.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **Andorra (6 gyms, 62nd country)** — the next-largest missing country
  once the tied-at-2 tier (Andorra, Luxembourg, Honduras, Moldova, Nepal)
  was reached after North Macedonia and UAE both turned out to be the
  same stale-summary-count trap already documented for "Georgia"/Costa
  Rica (their detail pages show 0 gyms, not the 2 their index-page count
  claimed). boulderinglist.com's own detail page listed only 2 gyms
  (both in Andorra la Vella), but the Federació Andorrana de Muntanyisme
  (fam.ad/rocodroms) — the country's own mountaineering federation —
  lists 10 real climbing facilities across 5 parishes, the same "a
  directory's listing count isn't the ceiling" pattern documented
  repeatedly elsewhere in this file. Every one of the 10 was individually
  checked: 3 (Rocòdrom de Canillo, Rocòdrom Cortals d'Aventura, Boulder
  Parc de la Ossa) are confirmed outdoor — excluded on scope grounds. 2
  more (Centre de Tecnificació Esportiva Ordino, Rocòdrom d'Ordino) both
  turned out, on closer inspection, to describe the same outdoor concrete
  wall next to Ordino's sports centre (multiple independent sources
  describe it as "an artificial outdoor concrete carved climbing wall"
  with outdoor lighting) — left out rather than guessed indoor purely on
  the strength of the federation page's own terse one-line label. The
  remaining 6 are all confirmed real, current, genuinely indoor
  facilities — 4 more than either directory showed: BlocCafè Gym Boulder
  and BlocCafè Climbing (two genuinely separate physical BlocCafè
  locations, confirmed via the operator's own site, not the same building
  under two names), Centre Esportiu Serradells, Palau de Gel (Canillo),
  Centre Esportiu Pas de la Casa (Encamp), and Rocòdrom Fiter i Rossell
  (Escaldes-Engordany).
  - **One facility's own site directly contradicted the federation's own
    type label, caught before trusting either blindly**: Palau de Gel's
    own website page (fetched directly) didn't mention a climbing wall
    at all among its listed activities, even though the federation page
    listed it as a real facility — resolved by finding independent
    Andorran press coverage (diariandorra.ad, altaveu.com) confirming a
    real, newly-opened ("the first of its kind in Andorra") indoor wall
    inside the complex, not by trusting either single source alone.
  - **Climbing type applied only from direct evidence, same discipline as
    every batch since Beijing**: BlocCafè Gym Boulder and BlocCafè
    Climbing are both bouldering-only per the operator's own detailed
    page (despite the federation's terser one-line label mentioning
    "sport routes" for the Climbing location — the venue's own more
    detailed description was trusted over the shorthand directory
    label, same precedent as MegaSTONE/El Rocodromo/Gekon elsewhere in
    this file); Palau de Gel is bouldering + top-rope (a 59m² boulder
    cave plus a 9m/110m² wall with 4 magnetic auto-belays, auto-belay
    mapped to top-rope per the convention already used for Banana
    Climbing's tags); Centre Esportiu Pas de la Casa is top-rope only
    ("an indoor climbing wall with no inclination," i.e. vertical, no
    bouldering evidence found); Rocòdrom Fiter i Rossell is bouldering +
    lead-climbing (a bouldering zone plus 10 permanent bolted routes up
    to French 7c, "permanent graded routes" mapped to lead per the same
    convention as Movimento Verticale Roma); Centre Esportiu Serradells
    has no explicit type evidence in any source beyond "6m high, 35m²" —
    tagged top-rope on the same physical-dimension inference already used
    for Taka Gayasi (Iran), since 6m exceeds every bouldering-only wall's
    height elsewhere in this dataset (which tops out around 5m), not
    guessed from marketing copy.
  - **Positions individually geocoded** against Nominatim — 5 of 6
    addresses resolved directly on the first try; Palau de Gel needed a
    simplified retry (dropping the street address down to just the venue
    name + parish), which resolved directly to a named "Palau de Gel"
    point of interest — the strongest confirmation tier used in this
    dataset.
  - **`state` uses Andorra's 7 real parishes**, populated complete from
    the start (same standard as every country since the NL fix), of
    which 4 have a seed spot and a sidebar chip/colour: Andorra la Vella
    (3 spots), Canillo, Encamp, Escaldes-Engordany.
  - Net result: 1718 → **1724 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1724/1724 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, `npx serve .`, offline-fallback-forcing
    method): count reads 1724; all 6 spots searchable by "andorra"; the
    Andorra la Vella chip correctly filters to exactly 3 spots with
    legible active-state text (dark text on red background); the new
    Andorra country `<option>` present in both add/edit forms; no console
    errors beyond the deliberately-forced Supabase-unreachable ones; no
    horizontal overflow at 375px mobile; `git diff` on
    `js/supabase-init.js` confirmed clean after reverting the test edit.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior country addition.
- **17 gyms found via Reddit — the first Reddit-sourced batch in this
  dataset's history, for countries already in the 62-country set** (not a
  new country). User asked to "use reddit to scrape some locations for
  existing countries that we're missing but double check that they're
  real gyms" — every prior batch in this file sourced from a directory
  site (boulderinglist.com, climbing-gyms.com, huodong.com, Mountain
  Project) or the "岩馆探索" app footage; this is the first time Reddit
  itself was the discovery source. Scoped via `AskUserQuestion` to a
  "broad sweep across many countries" (checking r/bouldering-style
  subreddits across a wide range of already-added countries in one pass)
  rather than one country in depth.
  - **Tooling**: this repo has no Reddit-specific CLI installed
    (`rdt-cli` isn't present), so the `agent-reach` skill's OpenCLI
    backend (`opencli reddit search`/`opencli reddit read`) was used
    instead. **An unscoped, plain-text `opencli reddit search` is very
    noisy** — Reddit's own search matches loosely on isolated common
    words like "climbing" or "gym," so a first batch of city-name-only
    queries returned almost entirely unrelated results (relationship-
    advice threads, birthday posts, retirement-planning posts). Scoping
    every search to `--subreddit bouldering` fixed this — worth
    remembering for any future Reddit-sourcing pass on this project:
    plain global search is not usable, subreddit-scoped search is.
  - **Every candidate named in a thread or comment was independently
    web-searched before being trusted** — Reddit itself was only ever
    the discovery mechanism, never the source of truth for an address or
    a climbing type, per this project's standing "never guess" rule.
    This caught two real "already covered, don't duplicate" cases before
    they were added: **HUDY Boulder Karlín** (Prague, Czech Republic) and
    **WEST Bouldering** (Warsaw, Poland) were both mentioned on Reddit but
    are already in this dataset under the identical name and address —
    neither was re-added.
  - **A genuine name-collision case, not a duplicate**: Bangkok's
    **Gravity Lab** shares its exact name with an already-listed,
    completely unrelated gym in Durango, Colorado, USA — the same
    "different real gym, same name, different country" pattern already
    documented for "Pulse Climbing" and "Climbing Factory" elsewhere in
    this file. Confirmed as a genuinely distinct Bangkok venue via
    multiple independent sources (own site, Mountain Project, BK
    Magazine) before adding it.
  - **A genuine "different address, same club, don't confuse with an
    excluded entry" case**: Buenos Aires's **Centro Andino Buenos Aires
    (CABA Sede Rivadavia)**, at the club's own headquarters building
    (Av. Rivadavia 1253), is a real, currently-operating indoor
    bouldering wall — distinct from the same club's outdoor Palestra
    Nacional de Andinismo structure at CeNARD, which this dataset had
    already excluded elsewhere as a confirmed December 2025 demolition.
    Confirmed via Waze, Corner, and the club's own Instagram
    (@cabarivadavia) before treating it as a separate, addable spot
    rather than assuming it was the same (excluded) facility.
  - **One naming conflict left unresolved and excluded rather than
    guessed**: Seoul's climbing-gyms.com listings for "Seoul Forest
    Climbing Jongno Branch" and the differently-branded "Climbing Park
    Jongno" both resolve to the identical address (96 Supyo-ro, Jongno
    District) — no source could confirm which name is current or whether
    they're the same venue under two labels, so this Jongno location was
    left out entirely; only Seoul Forest Climbing's separate, unambiguous
    Seongsu-dong branch (a different address) was added.
  - **10 Canada gyms in Ontario/Quebec/British Columbia**: Altitude Gym
    Kanata (North America's largest bouldering gym by floor area, per
    multiple sources), Grand River Rocks (Kitchener — moved to a new
    Victoria St address in June 2024, the old Borden Ave address
    superseded), Up the Bloc (Mississauga, bouldering-only per its own
    site), True North Climbing (Toronto/Downsview), two genuinely
    separate additional Boulderz Climbing Centre branches (Etobicoke and
    Mississauga, alongside the chain's already-listed Toronto/Dupont St
    location — each branch individually confirmed rather than assumed
    from the chain name, per this dataset's established multi-branch
    discipline), Le Mouv' espace bloc (Montreal — despite its "espace
    bloc"/bouldering-space branding, confirmed via Chalk Rebels and
    Mountain Project to also offer top-rope), and Bomber Boulders (Port
    Alberni, BC — explicitly "exclusively a bouldering facility," opened
    April 2024).
  - **4 Bangkok, Thailand gyms**: Gravity Lab (see name-collision note
    above; top-rope, lead, and bouldering, per multiple sources),
    Stonegoat Climbing Gym (Southeast Asia's largest bouldering gym per
    its own site, bouldering-only), Proclimber Gym (Mountain Project's
    own listing title explicitly says "bouldering only"), and Urban
    Playground Climbing (inside The Racquet Club, confirmed bouldering +
    auto-belay + top-rope + lead via its own site and TheSmartLocal).
  - **3 Buenos Aires, Argentina gyms**: V Once Escalada (a boulder gym
    near Once station, name a pun on the V11 grade, bouldering-only),
    Estación Vertical (Florida, Vicente López — a 650m² gym for sport
    climbing and bouldering; no source specifically confirmed bolted
    lead routes, so tagged top-rope rather than lead per this dataset's
    conservative-evidence standard), and Centro Andino Buenos Aires
    (CABA Sede Rivadavia, see above).
  - **2 Seoul, South Korea gyms**: Seoul Forest Climbing (Seongsu-dong
    branch only, see the Jongno naming-conflict note above; no
    facility-type evidence found, defaulted to bouldering-only per this
    dataset's established Seoul-gym pattern) and THE CLIMB Yeonnam
    (theCrag's own listing explicitly tags it "Bouldering"; a genuinely
    separate branch from the chain's already-listed The Climb Hongdae,
    both in Mapo-gu but at different addresses). Two more candidate
    branches (Mullae, Seongsu) of the same "The Climb" chain mentioned in
    the same Reddit thread could not be independently confirmed with a
    real address by any source and were left out.
  - **Positions individually geocoded** against Nominatim — 13 of 17
    resolved at street level (several as named-point-of-interest matches,
    the strongest confirmation tier used in this dataset, e.g. V Once
    Escalada, Palau de Gel-style matches); the other 4 (Gravity Lab,
    Proclimber Gym in Bangkok; Estación Vertical, Centro Andino Buenos
    Aires/CABA Sede Rivadavia in Buenos Aires) fell back to a district or
    general-area position after their exact street address didn't
    resolve even simplified, disclosed per-entry in `notes`.
  - No `js/app.js`, `css/style.css`, or `index.html` changes were needed
    — every country/state used (CA's ON/QC/BC, TH's BANGKOK, AR's
    CABA/BUENOS_AIRES, KR's SEOUL) already existed in
    `STATES_BY_COUNTRY` and already has a sidebar chip.
  - Net result: 1724 → **1741 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1741/1741 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified live** (served copy, offline-fallback-forcing method):
    count reads 1741; all 17 new spots searchable by name, including
    confirming "Gravity Lab" returns exactly 2 results (the new Bangkok
    entry plus the pre-existing, unrelated US one); all 3 Boulderz
    branches (Toronto, Etobicoke, Mississauga) appear distinctly; no
    console errors beyond the deliberately-forced Supabase-unreachable
    ones; no horizontal overflow at 375px mobile; `git diff` on
    `js/supabase-init.js` confirmed clean after reverting the test edit.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior batch.
- **Whole-dataset location audit (reverse geocode + Overpass + web
  search) — the first check that tests pins from the pin side, not the
  address side.** Every earlier accuracy pass (the geocode-threshold
  series) forward-geocoded the stored address and compared it to the
  pin, so it could only catch a pin that disagreed with what a geocoder
  thought the address was. This pass added checks that don't share that
  blind spot: (1) **reverse geocode every pin** (Nominatim `/reverse`,
  `accept-language=en`) and compare returned road / postcode / city /
  country to the stored address; (2) **Overpass** — is there an OSM
  feature named like the gym, or tagged `sport=climbing`, within 200m;
  (3) **web search** to confirm each suspect's real address, then
  forward-geocode that confirmed address with two or three geocoders.
  - **Results across 1741 spots**: 0 country mismatches; 773 confirmed at
    street or postcode level; 612 right city/area but street unconfirmed
    (114 disclose a fallback; 281 are Chinese mall addresses OSM covers
    poorly); 299 have no address; 57 flagged, most of which were
    transliteration false alarms (Greek/Russian/Thai names) or agreed on
    the street.
  - **What it found that the address-side passes missed**: pins that
    matched a *same-named street in a different district* (X CLIMB —
    Thessaloniki centre vs Thermi), a *rounded placeholder* (Pacific Edge
    at exactly 37.00,-122.02), a *fallback centroid that landed in the
    wrong place* (Sports World Suratthani's "Surat Thani centroid" is on
    Ko Samui, ~70km away), and *three Moscow gyms sharing one placeholder
    pin* 9-16km from their real addresses.
  - **Known limits, so nobody over-trusts it**: reverse geocoding returns
    the nearest feature, so a pin inside a building or car park can
    legitimately return a neighbouring street — the "right city, street
    unconfirmed" bucket is not an error list. Overpass misses are weak
    evidence (patchy OSM coverage in China, Croatia, etc.). None of these
    checks proves a pin is on the right building; only the gym's own
    published coordinates or a visual check does.
  - **Script pitfall**: looking a spot up by `name` breaks on duplicate
    names (two "Portside Boulders", two "Pulse Climbing", two "Climbing
    Factory") — match on id, or name plus suburb, when comparing.
  - Corrected 9 pins where two independent geocoders agreed with a
    web-confirmed address; left 5 uncertain ones alone (see
    `docs/tasks.md`). Each corrected spot's `notes` field says it was
    corrected and by what.

- **Shanghai cross-check against SmartShanghai (5 gyms added).**
  smartshanghai.com/listings/climbing/ lists 24 gyms with English and
  Chinese addresses. It sits behind an Aliyun WAF: `curl` gets a JS
  challenge; a real browser gets the listing page, but individual venue
  pages then present a slide-to-verify CAPTCHA, which must not be
  automated or bypassed — the listing cards alone carry name, address and a
  description, which is enough for matching and for adding gyms. 13 of the
  24 matched existing Shanghai spots by address, often under different
  names (recorded in each entry's `notes`), 3 were out of scope (outdoor
  adventure parks or a zero-location page), and 5 were new: Academy of
  Bouldering, Benchmark 2.0, 1778 Climbing (Haichao Lu), Stonehaven and Howl
  Shanghai — all bouldering, each disclosing that SmartShanghai is its only
  source. Net 1741 -> 1746 spots. Address-matching by street + number
  (not name) is what made this reliable: Shanghai gyms rebrand and list
  under several names. Not yet pushed to the live Supabase table.
- **United Arab Emirates (7 gyms), Luxembourg (5), and Georgia (4) — the
  63rd-65th countries**, added on request ("utilising the previous sites
  used, add the next 3 countries"). Candidates were ranked by *verified* gym
  count, not by boulderinglist.com's headline number: Georgia's 14 there
  conflates the country with the US state (the trap already documented for
  it earlier in this file); Costa Rica (stale summary, 0 on its detail page)
  and Malta (only 1 real gym left after checking) were skipped; Nepal was
  thinner. The UAE and Luxembourg have more real gyms once
  indoorclimbing.com, climbing-gyms.com and web search are combined, and
  Georgia has 4 confirmed genuine Tbilisi gyms.
  - **Excluded, and why**: The Wall Dubai (an outdoor tower), Vertical Club
    Dubai, Hall Omnisport Steinsel and Spolo Ovenacher (none could be
    confirmed as a real climbing facility), Bloc Brill Mamer (outdoor
    free-to-use boulders), Batumi Olympia (a fitness club with no
    climbing detail). Costa Rica, Malta and Nepal are left for a later pass.
  - **Type applied only from direct evidence**: Mountain Extreme (Dubai),
    RedRock (Luxembourg), D-Summit and S.K. Lucky are the bouldering +
    top-rope + lead gyms; CLYMB Abu Dhabi and Coque are bouldering +
    top-rope (auto-belay mapped to top-rope, no lead evidence); Club 71
    (Tbilisi) is top-rope only, inferred from its 8m wall height, the same
    dimension precedent as Taka Gayasi (Iran); everything else is
    bouldering-only. M. Khergiani Climbing Gym has no source describing its
    facilities, so it defaults to bouldering-only with that disclosed.
  - **Three fitness-club or attraction cases kept with a disclosed access
    caveat** (same standard as City Fitness Next Gen in Greece): Train
    Galleria (Abu Dhabi), Club 71 (Tbilisi) and CLYMB.
  - **Positions**: every address was run through Nominatim, then Photon as
    a second opinion, then each gym's own site or map embed where the
    geocoders disagreed. Several are street-level only, disclosed per entry
    (Boulder Zone, Rock Republic ×2, D-Summit, BlocX). GoClimb comes from its
    own site's location data because OSM does not contain Junction Mall.
    **Two geocoder errors were caught and rejected**: Pro Climbers'
    "Merab Kostava Street 37" matched a different street of the same name in
    Saburtalo ~9km away (the Vera Park gym is at the Chess Palace point
    instead, and OSM numbers that building 29 while the gym's sources say
    37-A), and S.K. Lucky's first hit was a university building rather than
    its University Street address.
  - **`state` lists are complete from the start**: the UAE's 7 emirates,
    Georgia's 12 regions (including Abkhazia, listed as one of Georgia's own
    internationally recognised regions, the same neutrality reasoning as
    Crimea under Ukraine) and Luxembourg's 12 cantons. Chips exist only for
    divisions with a spot: Dubai and Abu Dhabi, Tbilisi, and Luxembourg and
    Esch-sur-Alzette. Asia gained the UAE and Georgia, Europe gained
    Luxembourg (`COUNTRY_TO_REGION`, `COUNTRY_LABELS`,
    `COUNTRY_FLY_TARGETS`, five new `--ae-*`/`--ge-*`/`--lu-*` colours).
  - Net result: 1746 → **1762 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1762/1762 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array.
  - **Verified** (offline-fallback-forcing method, `js/supabase-init.js`
    reverted and confirmed clean): count reads 1762; searching the UAE and
    Luxembourg returns exactly 7 and 5; all five chips filter to 5/2/4/2/3
    with dark text on the region colour; both country `<option>` sets
    present and the state dropdowns populate 7/12/12; no console errors
    beyond the forced Supabase ones; no horizontal overflow at 375px.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior batch.
- **Slovenia (14 gyms), Costa Rica (7), and Kazakhstan (7) — the 66th-68th
  countries**, added on request ("next 3"). Six candidates were researched in
  parallel by separate agents, each verifying every gym individually, and the
  three with the most confirmed gyms were taken: Slovenia 14, Costa Rica 8
  (7 kept), Kazakhstan 7. Left for later: **Belarus** (5 solid gyms in Minsk,
  Brest and Grodno plus one medium-confidence municipal wall, Frunzensky FOC),
  **Nepal** (only 3 clearly indoor; 4 more are roofed but open-sided, which is
  outside this app's indoor-only scope) and **Moldova** (2).
  - **Directories were almost useless for all three**: boulderinglist.com has
    no Slovenia page, climbing-gyms.com says "No cities with climbing gyms in
    Slovenia yet", and indoorclimbing.com's Slovenia page is empty; only
    Mountain Project lists 7 Slovenian gyms. Slovenia's list came mainly from
    the Slovenian Alpine Association's wall list (ksp.pzs.si) plus each gym's
    own site. Kazakhstan came from 2GIS, Yandex, Zoon and the gyms' own sites
    and Instagram. Costa Rica's boulderinglist page shows 0 gyms despite its
    index claiming 4 (the same stale-count trap as before).
  - **Excluded, and why**: Costa Rica's **Pura Roca** (last Instagram post April
    2025, site fails to load, a listing shows a closure notice — current
    operation unconfirmed) and four other Costa Rica candidates with only stale
    or single-snippet evidence; in Slovenia, club and school walls without
    confirmed public access (Kamnik, Skofja Loka's BricAlp, Komenda, AO
    Zeleznicar, PZS-list school and municipal halls), outdoor structures, and an
    unconfirmed company (Bolder Baza); in Kazakhstan, trampoline-park climbing
    attractions (Kango, Gravity), the outdoor 17 m wall, university and school
    walls in other cities, and two Skala branches at MEGA malls that have no
    current confirmation.
  - **Type applied only from direct evidence**: gyms whose own site names
    lead or lists a tall graded route wall are tagged bouldering + top-rope +
    lead (Plezalni center Ljubljana, Celje, Slovenska Bistrica; SKALA Almaty;
    Eskalar; Ascend San Pablo; Rock Climbing Costa Rica). Celje and Slovenska
    Bistrica's lead tags are inferred from 14-17 m graded route walls, and
    say so. NU Climbing (Astana) and Climbers Garden default to
    bouldering-only. Skala KeruenCity is top-rope only, from a 12 m wall.
  - **Positions are weaker than usual for Costa Rica and Kazakhstan**:
    Nominatim resolved almost no Costa Rican addresses, so positions there come
    from Photon named points, a Plus Code, or a neighbouring landmark the gym
    is described as facing, each with an honest 0.1-1 km precision in the
    entry's own notes. Kazakhstan positions are mostly named OSM points, but
    Climbers Garden has three conflicting published addresses (street level
    only) and NU Climbing is pinned at campus level. Zoon's coordinate for
    SKALA Almaty is wrong and was not used.
  - **Caveats kept in the entries**: NU Climbing is open to the public only
    Mon/Wed/Fri 19:00-21:00; Rock Climbing Costa Rica (Jaco) has an unread
    Facebook post asking if it is closed and a site that would not load;
    Eskalar's phone numbers differ across sources. Two "San Pablo" places exist
    in Costa Rica and Nominatim picked the wrong one.
  - `state` lists are complete from the start: Slovenia's 12 statistical
    regions (English names such as Central Slovenia, Upper Carniola), Kazakhstan's
    3 cities of republican significance plus 17 regions (Almaty city and Almaty
    Region are separate divisions), and Costa Rica's 7 provinces. Chips exist
    only for divisions with a spot: 7 Slovenian, 2 Kazakh, 5 Costa Rican.
    Kazakhstan and Costa Rica sit in Asia and North America respectively
    (`COUNTRY_TO_REGION`); the Asia region fly-target was not widened, so the
    Asia header does not frame Kazakhstan.
  - Net result: 1762 -> **1790 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1790/1790 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array, every state code resolves.
  - **Verified** (offline-fallback-forcing method, `js/supabase-init.js`
    reverted and confirmed clean): count reads 1790; searching each country
    returns 14/7/7; all 14 new chips filter to the right counts with legible
    active text; both country `<option>` sets present and the state dropdowns
    populate 12/20/7; no console errors beyond the forced Supabase ones; no
    horizontal overflow at 375px.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior batch.
- **Belarus (5 gyms), Uruguay (5), and Saudi Arabia (5) — the 69th-71st
  countries**, added on request ("next 3"). Belarus had already been researched
  in the previous round; six more countries were researched in parallel (Saudi
  Arabia, Lebanon, Armenia, Uruguay, Morocco, Jordan). Results, by verified gyms:
  Belarus 5 (+1 medium, left out), Uruguay 5, Saudi Arabia 5, Armenia 3, Nepal 3
  clearly indoor, Lebanon 2, Jordan 2, Moldova 2, Morocco 1. The three tied at 5
  were taken. **Left for later**: Armenia (Ver Var, Boulderland and a fitness-club
  wall; Boulder Town excluded as probably inactive), Nepal (the other 4 are roofed
  but open-sided), Lebanon (Bold Adventure Park and Go Up, both medium confidence;
  U ROCK real but no 2025-26 activity of its own), Jordan (Climbat Amman and
  Badiya), Moldova (Chisinau Bouldering Project, Fitness Doza), and Morocco (only
  Atlas Elevation in Marrakech, too thin to seed).
  - **Directories were nearly empty again**: boulderinglist.com has no Belarus
    or Saudi Arabia page and lists one Uruguayan gym; indoorclimbing.com lists one
    for Belarus and Uruguay. Belarus came from each gym's own site, Yandex and
    Mountain Project; Uruguay from the Uruguayan climbing association's gym list
    plus Tripadvisor and Instagram; Saudi Arabia from the Saudi Climbing and Hiking
    Federation's licensed-gym list, press coverage and each gym's own site.
  - **Excluded, and why**: Belarus's Frunzensky FOC (a real municipal wall but
    its height and type conflict between sources), Gomel's Omega Climb (a youth
    sports school with unconfirmed public access), the many small kids' attraction
    walls, and outdoor quarries; Uruguay's outdoor boulder sectors; Saudi Arabia's
    Jump Up (trampoline attraction), AlUla/NEOM outdoor walls and The Edge (a wall
    builder, whose only gym is The Cave).
  - **Type applied only from direct evidence**: Dyno (Dammam) is tagged bouldering
    + top-rope + lead from Tripadvisor and Walltopia's "rope walls" description
    because its own site does not itemise disciplines; The Cave Alhamra is
    top-rope + lead from reviewer quotes about an 8 m wall; Belarus's Plato and
    Trapezia are top-rope from their own sites' "rope wall" wording, with no
    evidence separating top-rope from auto-belay. Everything described as
    bouldering-only stays bouldering-only.
  - **Two lower-confidence entries kept with their weakness stated**: The Cave
    Alhamra (Riyadh) has no published street address or pin, so its position is
    the Al Hamra district centre (approximate) and rests on reviewer quotes; El
    Muro Paysandu (Uruguay) has a single-source address and a Photon-only
    position. Gender-segmented hours (women-only sessions) are noted where the
    sources give them for the Saudi gyms.
  - **Geocoding traps**: Nominatim knew none of the Belarusian gyms by name and
    Photon returned nothing usable for Belarus, so positions there are Nominatim
    street matches or Yandex pins that agreed with a reverse check; several Saudi
    positions are Google/Yango map-embed pins because the geocoders only resolve
    the district (The Cave Alnakheel is about 3 km from the district point).
    Uruguay has one street spelled two ways ("Rossell" vs OSM's "Rosell"), and
    "Baltazar Brum 828" exists in three departments.
  - `state` lists are complete from the start: Belarus's 6 regions plus Minsk
    city (a separate division from Minsk Region), Uruguay's 19 departments and
    Saudi Arabia's 13 administrative regions. Chips exist only where there is a
    spot: 3 Belarusian, 4 Uruguayan, 3 Saudi. Belarus goes under Europe, Saudi
    Arabia under Asia and Uruguay under South America; the region fly-targets were
    not widened, so those region headers do not frame the new countries.
  - Net result: 1790 -> **1805 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1805/1805 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array, every state code resolves.
  - **Verified** (offline-fallback-forcing method, `js/supabase-init.js`
    reverted and confirmed clean): count reads 1805; searching each country
    returns 5/5/5; all 10 new chips filter to the right counts with legible active
    text; both country `<option>` sets present and the state dropdowns populate
    7/19/13; no console errors beyond the forced Supabase ones; no horizontal
    overflow at 375px.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior batch.
- **Hong Kong (29 gyms), Egypt (2), Qatar (2), and Kenya (2) — the 72nd-75th
  countries**, added on request ("keep adding countries"). Six candidates were
  researched in parallel (Hong Kong, Qatar, Egypt, Sri Lanka, Azerbaijan, Kenya),
  each gym verified individually. Sri Lanka had 0 verified gyms and Azerbaijan 1
  (ClimBaku, Baku), so both were left out; the other four were taken. Two-gym
  countries follow the Latvia and Singapore precedent. Still left for later:
  Armenia (3), Nepal (3 clearly indoor), Lebanon, Jordan and Moldova (2 each), and
  Azerbaijan and Sri Lanka if more gyms turn up.
  - **Directories were empty or stale for all four again**: boulderinglist.com
    lists 0 gyms for Qatar, Kenya, Sri Lanka and Azerbaijan, and indoorclimbing.com
    lists only one Kenyan gym. Hong Kong came from hongkongclimbing.com,
    boulderinghk.com, Sassy HK, Esquire HK, Time Out HK, each gym's own pages and
    Instagram; Egypt, Qatar and Kenya from each gym's own site, press and Instagram.
    Most Hong Kong gyms' own sites did not load from the research environment, so
    "verified" there means at least two independent listings, one of them dated
    2025-2026, plus a geocode.
  - **Excluded, and why**: Egypt's Fingerlock (closed Nov 2023; Mountain Project's
    listing is stale) and Ascent's temporary outdoor North Coast wall; Qatar's
    trampoline-park and attraction walls and EsQalar's Aspire Zone site (sources
    conflict on whether it is indoor); Kenya's outdoor towers (Purdy Arms, Valley
    Arcade), a 2020-only trampoline-park wall and outdoor adventure venues; in Hong
    Kong, Kizuna (closed; JUST CLIMB took the unit), Boulderland (closed), the
    children-only JUST CLIMB schools, a pop-up, an outdoor JUST CLIMB Sai Sha wall,
    Triangle Plus (unconfirmed operating; same unit as JUST CLIMB Tsuen Wan), MightyB
    (no address), an unconfirmed Yuen Long branch and the government (LCSD) sports
    centre walls, which need a climbing certificate and are not walk-in.
  - **Type applied only from direct evidence**: Ascent Sheikh Zayed and JUST CLIMB Kai
    Tak (lead) are tagged from their own descriptions. Auto-belay counts as top-rope
    (Verm City's Clip 'n Climb area). Weakest evidence, and tagged medium
    confidence: JUST CLIMB Tsuen Wan (top-rope from a search summary), GoNature
    (older Time Out description), Urban Stone (lead from Yahoo, top-rope
    unconfirmed). Everything with no rope mention defaults to bouldering only.
  - **Position precision**: Hong Kong is mostly a named-building match from Photon
    or Nominatim (building level). Approximate: JUST CLIMB Kai Tak (the whole
    Sports Park centroid, 200-500 m), Butterfly and Urban Stone (street midpoint,
    about 200 m, and they share a pin), Ascent Maadi (the Maadi district centre,
    1-2 km, no street address published) and Mt Kenya Climbing Gym (1-2 km, no
    geocoder or OSM entry). Qatar's Boulder uses the gym's own Google pin; the
    published address says Doha but OSM reverse geocoding puts the pin in Baaya, Al
    Rayyan, and the published address is followed.
  - **Traps caught**: many Hong Kong suburb labels do not match the district (Mei
    Foo and Lai Chi Kok gyms are in Kwai Tsing; Tseung Kwan O is Sai Kung; San Po
    Kong is Wong Tai Sin; Prince Edward gyms can be Yau Tsim Mong or Sham Shui Po);
    rebrands share units (Kizuna to JUST CLIMB Tseung Kwan O; Raccoon to Tanuki and
    Vita Beta Quarry Bay to Proxy are likely but not confirmed); some sources
    garble JUST CLIMB branch names (Tuen Mun versus Tsuen Wan). Eden Mall's address
    says Cairo but it is in Sheikh Zayed City, Giza Governorate. 8 Noyabr prospekti
    (Azerbaijan) and Qatar's Al Buwairda Street each have misleading geocoder hits.
  - `state` lists are complete from the start: Hong Kong's 18 districts, Egypt's 27
    governorates, Kenya's 47 counties and Qatar's 8 municipalities. Chips exist
    only where there is a spot: 14 for Hong Kong, 2 each for Egypt, Kenya and
    Qatar. Hong Kong is its own country entry (`HK`), separate from China, and goes
    under Asia with Qatar; Egypt and Kenya go under Africa, and the Africa
    region fly-target was widened to frame all three African countries.
  - Net result: 1805 -> **1840 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1840/1840 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array, every state code resolves.
  - **Verified** (offline-fallback-forcing method, `js/supabase-init.js`
    reverted and confirmed clean): count reads 1840; searching each country
    returns 29/2/2/2; all 20 new chips filter to the right counts with legible
    active text (Hong Kong's 14 chips sum to 29); both country `<option>` sets
    present and the state dropdowns populate 18/27/47/8; no console errors beyond
    the forced Supabase ones; no horizontal overflow at 375px with the Hong Kong
    chip row expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior batch.
- **Guatemala (4 gyms), Armenia (3), Lebanon (3), Jordan (2), and Nepal (2) — the
  76th-80th countries**, added on request ("keep going"). Six candidates were
  researched in parallel (Armenia, Nepal, Jordan, Lebanon, Uzbekistan, Guatemala),
  each gym verified individually; Uzbekistan had only 1 (BeFit Pro, a Tashkent fitness
  club) and was left out. Armenia, Nepal, Lebanon and Jordan were the leftovers from
  the previous round, re-verified from scratch. Still left for later: Moldova (2),
  Morocco (1), Uzbekistan (1), Azerbaijan (1, ClimBaku) and Sri Lanka (0).
  - **Directories were empty or stale again**: boulderinglist.com lists 0 gyms for
    Armenia and only La Fabrica for Guatemala, and its Nepal page is stale and lists
    semi-indoor walls; indoorclimbing.com lists only U ROCK for Lebanon. Sources are each
    gym's own site, Yandex/2GIS, Instagram, press (Climbing Business Journal, Lebanon
    Traveler, Sports Nep, Jordan News) and map listings.
  - **Excluded, and why**: Armenia's Boulder Town (only a crowdfunding appeal and an
    "off for a while" listing) and a Yerevan State University lead wall (public access
    unconfirmed); Lebanon's FLYP (destroyed in the 2020 port blast, no reopening seen),
    Stamina Gym (no address or detail) and ClimbAID (an NGO tent wall); Nepal's Psycho
    Block (Google shows permanently closed), and Astrek, Kathmandu Sport Climbing Center
    and Pasang Lhamu (roofed but open or semi-indoor, so not fully indoor); Guatemala's
    Qubo Antigua (sources conflict on whether it closed), La Fabrica (a fitness club, wall
    unconfirmed), La Rocalla (closed) and adventure or entertainment parks; Jordan's
    outdoor crags and sports halls.
  - **Type applied only from direct evidence**: Big Mountain (Guatemala), U ROCK,
    Climbat Amman, Ascend and WISH are tagged bouldering + top-rope + lead from their
    own descriptions or listings; WISH's lead comes from a Tripadvisor category list and
    Mountain Project's "sport routes". Bold Adventure Park is top-rope from a rope wall
    with no lead statement. Grand Sport Complex (Armenia) has no discipline stated, so
    bouldering is a default that could be wrong.
  - **Position precision**: Big Mountain, Ver Var, Boulderland, Climbat and WISH are
    named-POI or Yandex-pin matches (building level). Approximate: Casa Boulder (about
    300 m, house number not resolved), Venga Atitlan (town centre, a few hundred metres),
    Ascend (the coordinate in the gym's own site markup, 200-500 m), and Bold, U ROCK
    and Go Up (Google-derived pins, about 50-100 m).
  - **Traps caught**: "Ascent Climbing Gym" in the earlier lead is really Ascend
    Climbing (The South Wall), and a geocoder match for "Ascent" lands in the US or
    Egypt. "Casa Boulder" is also a Mexico City and a Santiago gym, and Photon's top hit
    is the Mexico City one. Yandex and 2GIS print longitude first. Bold and U ROCK are
    marketed as Beirut but sit in Mount Lebanon. Boulderland shares its address with a
    separate university wall. Guatemala's Big Mountain wall is 13 m, not 13.8 feet.
  - `state` lists are complete from the start: Armenia's 10 provinces plus Yerevan,
    Lebanon's 8 governorates, Jordan's 12, Nepal's 7 provinces and Guatemala's 22
    departments. Chips exist only where there is a spot: 1 Armenian, 2 Lebanese, 1 Jordanian,
    2 Nepali, 3 Guatemalan. Armenia, Lebanon, Jordan and Nepal go under Asia and Guatemala
    under North America; the region fly-targets were not widened.
  - Net result: 1840 -> **1854 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1854/1854 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array, every state code resolves.
  - **Verified** (offline-fallback-forcing method, `js/supabase-init.js`
    reverted and confirmed clean): count reads 1854; searching each country returns
    the right spots; all 9 new chips filter to the right counts with legible active
    text; the country `<option>`s are present in both forms and the state dropdowns
    populate 22/11/8/12/7; no console errors beyond the forced Supabase ones; no
    horizontal overflow at 375px with everything expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior batch.
- **Montenegro (2 gyms), Mongolia (2), Oman (2), and Paraguay (2) — the 81st-84th
  countries**, added on request ("keep going"). Ten countries were researched in
  parallel (Kuwait, Bahrain, Oman, the Dominican Republic, Honduras, Paraguay, Pakistan,
  Mongolia, Moldova, Montenegro, North Macedonia, Albania) and the four with 2 verified
  gyms each were taken, following the Latvia and Singapore precedent. Left out, by the
  project's standard that one confirmed gym is not enough to seed a country: Kuwait (1,
  Ascend Rock Climbing Center, high confidence), Bahrain (1, The Crag, whose indoor status
  is unresolved), Moldova (1, Chisinau Bouldering Project), North Macedonia (1, Boulder
  Bar Skopje) and Albania (1, Rock Tirana), plus Pakistan, the Dominican Republic and
  Honduras with none. Any of those five singles can be added as soon as a second gym is
  found there. Still open from earlier rounds: Uzbekistan (1), Azerbaijan (1), Morocco (1)
  and Sri Lanka (0).
  - **Directories were empty or stale again**: boulderinglist.com has no page for Oman,
    Kuwait, Bahrain, Mongolia or Honduras, and lists 0 gyms for the Dominican Republic;
    indoorclimbing.com's Oman page 404s; climbing-gyms.com says no Dominican or
    Honduran gyms exist. Sources are each gym's own site, Instagram, press (Oman Observer,
    Rafiki, Walltopia project pages) and map listings.
  - **Excluded, and why**: Oman's Muscat Climbing Centre (no 2025-26 activity, partly a wall
    builder) and "The Wall" at Muscat Diving and Adventure Centre (undated, no address);
    Paraguay had no other candidates; Mongolia's Wall Climbing Mongolia (no indoor venue
    found); Montenegro's Nikšić club room (no current evidence); Pakistan's ClimbX and
    Climbing Arena (likely outdoor towers, "indoor" only from templated directory copy);
    the Dominican Republic's "El 10" (a numbered outdoor sector) and a 2008-only
    Gold's Gym wall; Honduras's UNAH wall (2015 database entry only).
  - **Type applied only from direct evidence**: Adventure World (Oman) is bouldering +
    top-rope, with the lead and auto-belay claim on Platinumlist left off as a single
    aggregator; Outward Bound Oman is top-rope only from its climb/belay sessions. MAK
    Podgorica's lead tag is inferred from "sport climbing" courses on an 8 m wall, and
    Club de Escalada's from "escalada deportiva", both per the project's sport-climbing =
    lead convention and both flagged in the entry.
  - **Access and precision caveats kept in the entries**: Outward Bound Oman is group
    bookings only (up to 9, ages 10+); Adventure World has mandatory first-timer instruction
    and women-only sessions; Encanto and CLIMB Partner (Mongolia) rest on undated or
    2024 evidence. Approximate positions: Club de Escalada (about 1 km, house number
    unresolved), CLIMB Partner (street level, district conflicting), Outward Bound
    (about 1 km), Adventure World (mall centroid, about 150 m).
  - **Traps caught**: Nominatim's "Al Khoud" result is in Al Hail, about 6 km from the
    real Al Khoud 6; Walltopia calls La Roca "La Roca Asuncion" but it is in Luque;
    "Encanto Sport Complex" also matches a Phoenix sports centre; Oman's mall is named both
    Muscat Mall and Mall of Muscat. Searching "Oman" matches "Romania" as a substring, so
    the search count for it is inflated (the chip filter is exact).
  - `state` lists are complete from the start: Montenegro's 25 municipalities, Mongolia's
    Ulaanbaatar plus 21 aimags, Oman's 11 governorates and Paraguay's Asuncion plus 17
    departments. Chips exist only where there is a spot: 2 Montenegrin, 1 Mongolian, 1
    Omani, 2 Paraguayan. Mongolia and Oman go under Asia, Montenegro under Europe and
    Paraguay under South America; the region fly-targets were not widened.
  - Net result: 1854 -> **1862 total spots**. Structural check (Node-parsed
    `window.SEED_GYMS`): 1862/1862 unique ids, zero duplicate
    name+suburb+state+country combos, every spot has a non-empty `types`
    array, every state code resolves.
  - **Verified** (offline-fallback-forcing method, `js/supabase-init.js`
    reverted and confirmed clean): count reads 1862; all 6 new chips filter to the right
    counts with legible active text; the country `<option>`s are present in both forms and
    the state dropdowns populate 25/22/11/18; no console errors beyond the forced
    Supabase ones; no horizontal overflow at 375px with everything expanded.
  - **Not yet pushed to the live Supabase table** — same next-step gap as
    every prior batch.

## Scraping and bulk access

A public map has to send its data to every visitor's browser, so scraping
can be made more expensive but never impossible. What is exposed, and what
limits it:

- **`js/data.js` (~750KB, every spot) is publicly downloadable in one
  request** at `/js/data.js`. It is only the offline fallback (see "File
  map"), but it is the cheapest possible scrape.
- **Supabase REST is open to anyone holding the anon key** (which is public
  by design and sits in `js/supabase-init.js`). RLS lets anyone read
  approved `spots`; PostgREST returns at most 1000 rows per request, so a
  scraper just pages with `range`. Supabase has no built-in per-IP rate
  limiter, and the anon key can't be hidden. Vercel's firewall does **not**
  cover it — it is a different domain.
- **The whole repo used to be served as static files** (`docs/`,
  `supabase/schema.sql`, `supabase/seed.html`, `Rules.md`, `CLAUDE.md`,
  found by `curl`-ing them on the live site). None held secrets, but
  `docs/` documents the whole sourcing method and contains contact emails.

What is in place: `robots.txt` (welcomes search engines; disallows known AI
and scraper user-agents and `/js/data.js`, `/docs/`, `/supabase/` — this
only stops crawlers that choose to obey it); `vercel.json` `redirects`
sending `/docs/*`, `/supabase/*` and the root `.md` files to `/`
(redirects run *before* the filesystem on Vercel, so they override real
files; `rewrites` in `vercel.json` run *after* it and would NOT have
blocked them); and a "Using the site" clause in the Terms of Service.

What needs the site owner (dashboard, not code): Vercel dashboard →
Firewall → turn on the **Bot Protection** managed ruleset (available on all
plans, off by default; challenges non-browser traffic) and add the one
rate-limiting custom rule Hobby allows (fixed 60-second windows). That covers
`climbatlas.org` only.

Not done, and the real fix if abuse appears: stop serving the full table.
Options in increasing effort — (1) delete the `js/data.js` fallback and rely
on the service worker's cached Supabase reads for offline use (removes the
one-request scrape; Supabase still pages); (2) replace the bulk read with a
Supabase RPC that returns only spots inside the map's bounding box, so a
scraper has to walk the world in many small requests; (3) put reads behind a
Vercel Function that rate-limits per IP. (2)/(3) change how `loadSpots()`
works and how the PWA caches, so they need their own task.

## Design system

Everything visual is built from the tokens at the top of `css/style.css`
— add to them rather than around them.

- **Two layers of colour.** The long per-region list (`--nsw`, `--de-
  bayern`, `--cn-shanghai`, …) is the *map palette* and only ever
  colours a region's chip/label. The UI itself uses the *semantic*
  tokens below it: `--accent`/`--accent-ink` (the one ember-orange
  call-to-action colour and the dark text that sits on it), `--success`,
  `--danger`, `--focus`, `--climbed`, `--bookmark`, `--community`,
  `--edited`, and three surface tones `--bg` < `--surface` <
  `--surface-2` that do the separating — borders (`--border`) are for
  structure (dividers, inputs), not for outlining every element. Don't
  reuse a state colour for a UI meaning again (`--vic` used to be the
  accent, `--qld` "climbed", `--nsw` the focus ring).
- **Type.** `--font-display` (Space Grotesk) for the wordmark, headings,
  and controls; `--font-body` (Inter) for content and forms;
  `--font-mono` (Space Mono) only for numeric data — the count badge,
  pin coordinates, climb grades — always with `tabular-nums`. Sizes come
  from `--fs-xs`…`--fs-xl` (11/12/13/14/16/20) plus a 28px display step
  on the About page; line-heights `--lh-tight` (1.25) and `--lh-body`
  (1.5). Section labels are small display-font caps; form labels
  sentence case.
- **Space and shape.** `--sp-1`…`--sp-6` (4/8/12/16/24/32),
  `--r-sm/md/lg` (6/8/12: chips and tags / controls and inputs / panels
  and modals), one floating-layer shadow `--shadow-float`.
- **Buttons** (`.btn` + `.btn-primary` / `.btn-outline` / `.btn-text`,
  `.icon-btn` for square toggles). One accent-filled action per
  surface; outline for secondary; text for navigation. Modal forms keep
  their own full-width `.add-btn` / `.btn-submit` / `.btn-cancel`.
- **Chips** carry their region colour as `style="--chip:var(--xx-yyy)"`
  (see "Map" below for why that replaced an inline `color`), and are
  `<button aria-pressed>`.
- **Motion.** 150–200ms ease on state changes; camera moves go through
  `motion()` in `js/app.js` and every CSS transition is collapsed under
  `prefers-reduced-motion: reduce`.
- **Accessibility floor**, kept since redesign Stage A: every interactive
  element is a real `<button>`/`<a>`/input with a `:focus-visible` ring
  in `--focus`; every input has an associated label; modals carry
  `role="dialog"` + `aria-labelledby`, move focus in on open, trap Tab,
  restore focus and close on Escape (one generic block in `js/app.js`
  watching `.modal-backdrop` class flips); accordions and toggles expose
  `aria-expanded`; there's a skip link to `#main`; icon targets are
  ≥28px.

## Form field CSS specificity

The add/edit-spot forms' `.type-check` checkbox rows (`css/style.css`)
sit inside a `<div class="field">` wrapper, used everywhere else in the
same forms purely for spacing. `.field label` and `.field input` (styled
for the forms' real text/select fields — uppercase mini-labels, full-
width text inputs) are both *more specific* than a bare `.type-check` or
`.type-check input`, so they silently won on every property they both
touched: the label fell back to `display:block` (collapsing the whole
flex row a checkbox/dot/text needs), picked up `text-transform:uppercase`
it never asked for, and the `<input>` itself got stretched to
`.field input`'s `width:100%` instead of its native checkbox size —
together rendering as a checkbox visibly detached from its own label,
with the next control's colour dot poking in from the edge. Fixed by
re-scoping the rules as `.type-filter .type-check` / `.type-filter
.type-check input[type="checkbox"]` — two classes outrank `.field`'s
class+element selector, so no `!important` was needed here (unlike the
sidebar chip-legibility fix in "Map" below, which genuinely needed it to
beat an inline style). The sidebar's own copies of these same checkboxes
were never
inside a `.field` wrapper, so they'd always rendered correctly — worth
remembering before assuming "it works in the sidebar" means a shared
class is fine everywhere it's reused.

## Map

- MapLibre GL, not Leaflet — chosen for the 3D globe projection
  (`map.setProjection({type:'globe'})`, set once in a `style.load`
  listener) and atmosphere glow (`map.setSky({...})`), without needing a
  Mapbox account/API key. Basemap is CARTO's free, keyless "Dark Matter"
  vector style. **CDN pin must be `maplibre-gl@5` or later** — `@4`'s
  bundle only lists `globe` in the style-spec schema (validation only, no
  rendering engine behind it), so `map.setProjection` isn't even exposed as
  a real method on that version's `Map` class — confirmed in the browser
  console via `TypeError: map.setProjection is not a function`, not a
  silent no-op as first assumed. Verified the actual fix by diffing
  occurrence counts of `globe`-related identifiers in the real unpkg
  bundles for 4.7.1 (1 occurrence) vs 5.24.0 (234, including real
  `globe_extrude` shader code), not by version-number guessing.
- **CARTO's Dark Matter style has a real bug in its own major-road label
  colour**, fixed at runtime rather than left alone: `roadname_major`
  (the `transportation_name` symbol layer for arterial/major roads,
  `minzoom:13`) ships with `text-color:#383838` — a near-black dark grey
  on a `#111` halo, over an already-dark basemap. Every other road tier
  in the same style (`roadname_pri`/`roadname_sec`/`roadname_minor`) uses
  a light grey (`rgb` values roughly 146–189) that reads fine; major
  roads are the one tier that's essentially invisible, backwards for the
  most prominent road class. Confirmed by reading the actual loaded
  style's paint properties (`map.getStyle().layers`) rather than
  assuming, and by toggling the colour back and forth on a real street
  ("Cahill Expressway", Sydney) to see it vanish/reappear. Fixed with one
  `map.setPaintProperty('roadname_major', 'text-color', '#c8c8c8')` call
  in the same `style.load` handler that already sets the globe projection
  and sky tint — brightened to match the other road tiers, not an
  arbitrary colour choice.
- **Don't `fitBounds` across the whole `spots` array** — AU (~lng 113 to
  153) and US (~lng -125 to -70) sit on opposite sides of the Pacific.
  `maplibregl.LngLatBounds.extend()` only tracks running min/max longitude,
  so a bounds box built across both countries spans the *long* way round
  through Africa (~270°) instead of the short ~90° span across the
  Pacific, and `fitBounds` then centers the camera near the Gulf of Guinea
  at a zoom tight enough to exclude every real spot — this silently
  produced a map with zero markers for a while (see `docs/tasks.md`). The
  starting camera is a fixed `center`/`zoom` picked once
  (`js/app.js`, above the `maplibregl.Map` constructor), not computed from
  the data.
- Clustering is hand-rolled with `supercluster` because MapLibre only
  clusters GL-rendered symbol layers natively, not the custom
  hold-shaped DOM markers this app uses. `rebuildClusterIndex()` reloads
  the currently-visible spots into a `Supercluster` instance whenever
  filters change (and always fully clears old markers first, since a
  rebuilt index's cluster ids aren't safe to compare against the old
  one's); `paintMarkers()` repaints whatever's in the viewport on every
  `moveend`, diffing against what's already painted so panning/zooming
  without a filter change doesn't tear down and recreate markers that
  are already correct.
- Below `HOLD_ICON_ZOOM` (`js/app.js`, currently 9), an ungrouped single
  spot (one supercluster hands back as a lone point rather than a cluster,
  e.g. an isolated Japan gym viewed from the default mid-Pacific camera)
  paints as a numbered badge (`buildSpotNumberMarker`) instead of the
  small hold-shaped icon, which is easy to miss at a wide zoom. The badge
  is now **plain `.cluster-marker` styling with no overrides** — same
  size (34px, matching a real cluster's smallest tier) and same neutral
  colour as an actual cluster, deliberately not colour-coded by climbing
  type (an earlier version was type-coloured; changed on request so a
  numbered badge reads as "just another badge on the globe" while zoomed
  out, indistinguishable from a real cluster except for the "1", rather
  than visually flagged as a third marker style). `paintMarkers()` tracks
  which "bucket" (icon vs. number) it last painted in and clears every
  spot marker (not cluster badges) when the zoom crosses that threshold,
  so painted markers don't get stuck in the wrong style. `updateMarkUI()`
  only restyles `kind:'icon'` marker entries for the same reason — a
  numbered badge has no climbed/bookmarked state to reflect.
- **Basic region labels**, same zoom window as the numbered badges: below
  `HOLD_ICON_ZOOM`, `paintMarkers()` also paints a plain text `.region-
  label` (no background box, `pointer-events:none` so it can't block map
  drag) at the centroid of every `(country,state)` group that currently
  has visible spots *and* falls within the current viewport bbox —
  `computeRegionCentroids()`, recomputed in `rebuildClusterIndex()`
  whenever the filtered spot set changes, not on every pan/zoom. The
  label text is the human-readable name from `STATES_BY_COUNTRY` (e.g.
  `TOKYO` → "Tokyo"), offset 24px below the point so it doesn't sit
  directly on top of a badge at the same coordinate. This is deliberately
  "basic": the centroid is just an average of that region's own spots'
  lat/lng, not anything geographically authoritative, and there's no
  collision avoidance — labels for geographically close regions (e.g.
  several small AU states, or Tokyo/Kanagawa/Hokkaido all inside one wide
  Japan viewport) can overlap. Labels and numbered badges disappear
  together once you cross `HOLD_ICON_ZOOM` — real markers are visible by
  then, so the orientation labels aren't needed.
  **Update**: basic collision avoidance was added — `paintMarkers()`
  projects every in-view region's centroid to screen space, sorts
  candidates by that region's spot count, and skips (doesn't paint) any
  candidate within 55px of an already-accepted label, so a denser region
  wins a contested spot instead of every nearby region's text piling up
  illegibly. `computeRegionCentroids()` now carries each region's spot
  `count` for that sort. Still "basic" in the same sense as before: no
  attempt at optimal placement, just first-come (by count) collision
  rejection.
- DOM markers lag MapLibre's own WebGL render loop while the camera is
  moving (a documented MapLibre/Mapbox limitation, not fixable from
  application code). An earlier version hid every marker for the
  duration of a drag/zoom (`#map.is-moving .maplibregl-marker`) to
  avoid that lag being visible — removed per explicit user preference,
  since on the globe projection dragging is also how you spin it, and
  markers vanishing mid-drag read as broken rather than as an
  intentional hide. Markers now stay visible and briefly lag the
  camera during a drag/rotate instead; repainted correctly in place on
  `moveend` as before.
  **Update**: a second, avoidable source of drag lag was found and fixed
  — `.cluster-marker` (`css/style.css`) had `transition:transform .15s
  ease` for its hover-scale effect, but that's the same element MapLibre
  repositions via inline `style.transform` every render frame, so every
  reposition during a drag was being CSS-eased over 150ms on top of the
  inherent WebGL/DOM gap above. Switched the hover effect to
  `filter:brightness()` instead, which MapLibre never touches. The
  inherent WebGL/DOM gap described above is unchanged and not fixable
  from application code — this only removed the self-inflicted part.
- Marker/checkbox colour = climbing type (indoor bouldering, top rope,
  outdoor bouldering — the latter was removed as a category early in
  this project, then reintroduced by explicit request; see "Known gaps");
  a pin split into colour wedges means more than one type applies. A
  green ring = signed-in user has marked it climbed; a gold star badge =
  bookmarked.
- Country/state filter, type filter, and marks filter are independent
  (AND'd together); search matches name or suburb.
- **Region labels are three-tiered**, controlled by `CONTINENT_LABEL_ZOOM`
  (currently 3.5), `COUNTRY_LABEL_ZOOM` (5), and `HOLD_ICON_ZOOM` (9):
  below `CONTINENT_LABEL_ZOOM` (true globe view), `paintMarkers()` shows
  one label per *continent* (`computeContinentCentroids()` +
  `REGION_LABELS`, e.g. "Europe") — added after the user pointed out that
  showing a country name (e.g. "Germany") immediately at the most-zoomed-
  out view, ahead of a continent name, was backwards once the map had
  several same-continent countries (Germany/France/Italy/Netherlands/
  Sweden/UK all in Europe). From `CONTINENT_LABEL_ZOOM` up to
  `COUNTRY_LABEL_ZOOM`, labels switch to one per *country*
  (`computeCountryCentroids()` + `COUNTRY_LABELS`, e.g. "Japan"). From
  `COUNTRY_LABEL_ZOOM` up to `HOLD_ICON_ZOOM`, labels switch to the finer
  state/city tier (`computeRegionCentroids()`) as before. All three tiers
  share the same collision-avoidance logic and the same
  `regionLabelMarkers` tracking dict — continent-tier keys are region ids
  (`"europe"`), country-tier keys are bare country codes (`"JP"`),
  state-tier keys are `"country:state"` (`"JP:TOKYO"`), so there's no key
  collision between tiers, and — since only one tier's candidates are
  ever read into `source` at a given zoom — a given label can only ever
  be sourced from exactly one centroid, so e.g. "Germany" can never be
  painted twice at once.
  **Each tier also gets its own CSS class** (`continent-label`/
  `country-tier-label`/`state-tier-label`, all still sharing the base
  `.region-label` rule) — before this, all three tiers rendered with
  identical size/weight/colour, so the transition from continent → country
  → state carried no visual cue beyond the text itself changing (fixed
  after a request to make the three tiers "noticeably different"). Now
  continent labels are the biggest (16px) and in the warm `--vic` accent
  colour, reading as the primary orientation label at globe zoom; country
  labels are a step down (12px, standard text colour); state/city labels
  are the smallest and dimmest (9.5px, `--text-dim`, lighter weight),
  since they're the finest-grained tier shown right before real markers
  take over. Verified by temporarily exposing the map instance
  (`window.__debugMap = map`, removed before committing — same one-off
  technique used for the earlier region-label-collision fix) and reading
  each tier's computed style directly, not just visually. A tier's stale
  markers get cleaned up
  automatically by the existing per-frame diff once the zoom crosses a
  threshold and that tier's keys stop appearing in `seenLabels`. Which
  continent a country belongs to is a static `COUNTRY_TO_REGION` map in
  `js/app.js`, matching the `.region-group[data-region]` nesting already
  used in `index.html`'s sidebar — a spot whose country isn't in that map
  (e.g. one submitted via the "Other (not listed)" country option) is
  skipped from the continent tier rather than guessed into one.
  **`south-america` was added as a fifth region** when Brazil became the
  first South America country in the dataset — a new `REGION_LABELS`/
  `REGION_FLY_TARGETS` entry and a new `.region-group[data-region="south-
  america"]` sidebar wrapper, same mechanics as the existing four
  (asia/europe/north-america/oceania), not a special case.
  - **Continent labels are clickable** — the only label tier that is
    (state/country labels keep `pointer-events:none`, same as always, so
    they can't block map drag). Clicking one calls `map.flyTo()` against
    a new `REGION_FLY_TARGETS` entry, the same "fly to this region" idea
    `COUNTRY_FLY_TARGETS` already provided per-country, framing every
    country currently in that continent rather than the whole globe. The
    sidebar's `.region-header` click (Asia/Europe/North America/Oceania)
    now does the same fly-to alongside its existing collapse-toggle,
    mirroring how a `.country-label` click already both toggles and flies
    to `COUNTRY_FLY_TARGETS`.

## PWA / offline support

Added as the technical groundwork for a possible future paid tier (an
"offline mode" feature — see `docs/tasks.md` for the monetization
discussion this came out of), but useful on its own regardless of
whether/how that's ever gated: installability (Add to Home Screen /
desktop install) plus real offline caching of the app shell, map tiles,
and the last-seen Supabase data.

- **`manifest.json`** (root) — name, icons, `display:"standalone"`,
  `theme_color`/`background_color` matching `--bg` (`#211f1b`). Linked
  from both `index.html` and `about.html` via `<link rel="manifest">`.
  **Icons are SVG, not PNG** (`icons/icon.svg`, the existing favicon
  design scaled from its original 32×32 viewBox to 512×512, same paths
  ×16) — this project has no image-generation tooling and no build step
  to run one, so a real PNG raster wasn't practical to produce. SVG
  icons with `sizes:"192x192"`/`"512x512"` and `purpose:"any"` satisfy
  Chrome's installability check (it rasterizes the SVG itself), and the
  same file is reused for `purpose:"maskable"` since the design already
  fills the full square edge-to-edge with no transparent margin and the
  hold shape sits well inside the maskable safe zone. **No
  `apple-touch-icon`** was added for the same reason — iOS Safari doesn't
  reliably rasterize SVG for that tag the way Chrome does for manifest
  icons, and a broken/blank home-screen icon on iOS would be worse than
  no icon at all. If real PNG icons are ever generated (any image tool,
  even a phone screenshot of `icons/icon.svg` cropped square would do),
  add them alongside the SVG entries rather than replacing them, plus an
  `apple-touch-icon` link.
- **`sw.js`** (root, not `js/sw.js` — a service worker's default scope is
  the directory it's served from, and this needs to control the whole
  site) registered from a small inline script at the bottom of
  `index.html`, guarded by `'serviceWorker' in navigator` and deferred to
  the `load` event. Three cache buckets, all versioned by one
  `CACHE_VERSION` constant (bump it when a precached file's content
  changes, so returning visitors don't get stuck on stale cached copies):
  - **Shell cache** — `index.html`, `about.html`, `manifest.json`,
    `css/style.css`, and `js/supabase-init.js`/`auth.js`/`app.js`
    precached on `install`, served **stale-while-revalidate** afterward
    (serve the cached copy instantly, refetch in the background to keep
    it current next time). `js/data.js` is deliberately **not**
    precached — it's ~600KB and only ever loaded on demand
    (`ensureSeedData()`, see "File map" above); if a visitor's session
    happens to trigger that on-demand load while online, the same
    stale-while-revalidate rule (same-origin) still catches and caches
    it opportunistically, but nothing forces it to download upfront.
  - **Tile cache** — `basemaps.cartocdn.com` (the CARTO Dark Matter
    basemap) served **cache-first**, since a tile for a given
    coordinate/zoom never changes — this is what actually makes "look at
    a previously-viewed part of the map while offline" work. No size cap
    or eviction policy implemented yet — relies on the browser's own
    storage-quota eviction if it ever grows large enough to matter.
  - **Runtime cache** — third-party library CDNs (`unpkg.com`,
    `cdn.jsdelivr.net`, `fonts.googleapis.com`, `fonts.gstatic.com` — the
    MapLibre GL/Supercluster/Supabase-JS scripts and Google Fonts CSS/
    files) served stale-while-revalidate, same reasoning as the shell
    cache.
  - **Data cache** — any Supabase REST read (`*.supabase.co/rest/...` —
    matched by hostname suffix, not the specific project id, so this
    doesn't need updating if the project ever changes) served
    **network-first**: try the network for freshness, fall back to the
    last successful response when offline. This is the "last-seen spot
    data still shows offline" piece — it caches whatever the current
    session actually queried (approved spots in view, a signed-in user's
    own marks), not a full offline copy of the database.
  - Every strategy is a plain `GET`-only fetch-event filter (`if
    (request.method !== 'GET') return`) — a spot submission, an edit, a
    mark toggle, or any other write is never intercepted or cached,
    always goes straight to the network. Non-matching requests (mainly
    Supabase Auth calls) fall through uncached too.
  - `activate` deletes any `climbatlas-*`-prefixed cache whose name isn't
    one of the current version's four, so an old `CACHE_VERSION`'s caches
    get cleaned up automatically on the next visit after a deploy.
- **Verification caveat, real and worth knowing about**: the in-app
  Browser preview tool used throughout this project's history **cannot
  register any service worker at all** — confirmed by registering a
  trivial, syntactically-valid no-op worker (`self.addEventListener(
  "install", e=>self.skipWaiting())`) served from the same origin and
  getting the identical `TypeError: ... An unknown error occurred when
  fetching the script.` that `sw.js` itself produced, with
  `isSecureContext:true` and not running inside an iframe — so it's a
  restriction of that specific sandboxed preview harness (most likely
  service workers disabled at the browser-instance level), not a bug in
  `sw.js` or its registration code. What *was* verified in that
  environment: `manifest.json` parses as valid JSON and every field
  resolves (fetched and inspected directly); `node --check sw.js` passes
  (valid JS syntax); the icon renders correctly at 512×512; the rest of
  the app (live Supabase load, spot count, no new console errors besides
  the expected registration failure) is unaffected by these additions.
  **The actual install prompt, offline reload, and cache-hit behaviour
  still need a real, non-sandboxed browser** (Chrome's Application panel
  → Service Workers/Manifest, or just going offline in DevTools and
  reloading) before this is considered fully proven — same category of
  outstanding verification as the sign-in flow and other things this
  environment can't fully exercise.
- **Deliberately not done yet**: no payment/subscription gating of
  anything — this task was scoped as "PWA foundation only" (installability
  + offline caching), not the paid tier itself. See `docs/tasks.md` for
  the broader monetization discussion this came out of; wiring an actual
  paywall (Stripe or otherwise) around, say, a curated "download this
  region for offline use" feature would be a separate, larger task
  needing its own scoping (a payment backend piece this static site
  doesn't have yet — see the "Full Stripe-gated feature" option that was
  explicitly deferred when this task was scoped).

## Known gaps (from README "Before it's actually public")

- Privacy Policy / Terms of Service are drafts with placeholders — not
  reviewed, not final.
- Photos are links (a URL to an existing image), not real uploads — a
  real upload flow would need object storage (Supabase Storage,
  Cloudflare R2, or S3).
- "Revert to original data" only works for un-edited seed spots — there's
  no stored "original" for community-submitted spots.
- Outdoor bouldering was removed as a type/category early in this
  project (the 23 outdoor-only seed spots at the time were deleted
  rather than recategorized — that old data only exists in git history,
  not restored), then reintroduced as a type option by explicit request,
  then **removed again "for now"** (2026-09) — `outdoor-bouldering` is
  gone from `TYPE_COLORS`/`TYPE_LABELS`/`activeTypes` (`js/app.js`) and
  its sidebar filter checkbox, map legend entry, and both add/edit-spot
  form checkboxes were deleted from `index.html`. This second removal is
  a clean no-op on the data side — confirmed zero spots in `js/data.js`
  carry `outdoor-bouldering` at removal time (it had never been
  retroactively applied to any seed spot since reintroduction), so
  nothing needed migrating. The `--t-outdoor` CSS variable itself was
  deliberately left defined in `css/style.css` — it's also used by
  `.modal.info-modal .placeholder`'s text colour, unrelated to the
  climbing type — so removing the type didn't touch that rule. If this
  type comes back a third time, it's the same four-file pattern as
  lead-climbing below: `TYPE_COLORS`/`TYPE_LABELS`/`activeTypes` in
  `js/app.js`, the sidebar checkbox + legend entry + two form checkboxes
  in `index.html`, reusing the already-defined `--t-outdoor` variable.
- **Lead climbing** was added as a fourth type the same way: a new
  `lead-climbing` value in `TYPE_COLORS`/`TYPE_LABELS`/`activeTypes`
  (`js/app.js`), a new `--t-lead` CSS variable (blue, `#4a90c9` — chosen to
  stay visually distinct from indoor's teal, top rope's purple, and
  outdoor's amber), and matching checkboxes in the sidebar type filter, the
  map legend, and both the add-spot and edit-spot forms (`fTypeLead` /
  `eTypeLead` in `index.html`, wired the same way as the other three type
  checkboxes in `js/app.js`). No schema change needed — `spots.types` is a
  plain `text[]` with no check constraint (`supabase/schema.sql`). Same as
  outdoor bouldering, no existing seed spot has been retroactively tagged
  with this type — it only applies going forward.

## Where to look first for a given change

| Change | Start in |
|---|---|
| Map rendering, clustering, filters, add/edit UI logic | `js/app.js` |
| Auth flow (magic link, Google) | `js/auth.js` |
| Seed data / initial spots | `js/data.js` |
| Supabase client config | `js/supabase-init.js` |
| Visual/theme changes | `css/style.css` |
| Page structure, modals | `index.html` |
| DB schema, RLS policies, moderation logic | `supabase/schema.sql` |
| PWA installability, offline caching | `manifest.json`, `sw.js` |

## Keeping this file honest

This file is a snapshot. When you make an architecture-level decision or
discover something not documented here (e.g. a new gotcha, a schema
change, a new country added), update this file as part of the same task —
per `Rules.md` §10, don't rely on chat memory for it.
