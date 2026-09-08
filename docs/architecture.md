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
```

**Script load order in `index.html` matters**: Supabase JS CDN script →
`supabase-init.js` (defines `window.sb`) → `auth.js` (defines
`window.auth`) → `data.js` (defines `window.SEED_GYMS`) → `app.js`, which
depends on all of the above. Breaking this order breaks the app silently
(check the browser console).

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
  support it.
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
never `state` alone. Now 42 countries deep (AU, US, JP, CA, NZ, CN, GB, DE,
FR, SE, NL, IT, BE, KR, ES, PT, AT, CH, PL, DK, FI, IE, NO, MX, BR, HU, GR,
CZ, IS, RO, HR, RU, BG, AR, PH, CO, CL, VE, IN, IL, ID, TW), same pattern
each time — keep this in mind before adding a 43rd. One collision
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

`js/data.js` currently has 1245 spots (74 AU, 332 US, 32 JP, 15 CA, 9 NZ,
106 CN, 66 GB, 112 DE, 30 FR, 7 SE, 25 NL, 14 IT, 14 BE, 37 KR, 22 ES,
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

## Keeping this file honest

This file is a snapshot. When you make an architecture-level decision or
discover something not documented here (e.g. a new gotcha, a schema
change, a new country added), update this file as part of the same task —
per `Rules.md` §10, don't rely on chat memory for it.
