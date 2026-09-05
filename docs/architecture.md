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

Every spot has both a `country` and a `state` field, and **`state` codes
are only unique within a country** (e.g. AU's `WA` vs US's `WA` are
different regions). Anything that filters, colors, or edits by state —
the chips in `index.html`, `STATES_BY_COUNTRY` in `app.js`, the RLS-safe
columns in `schema.sql` — keys off the `(country, state)` pair together,
never `state` alone. Now 25 countries deep (AU, US, JP, CA, NZ, CN, GB, DE,
FR, SE, NL, IT, BE, KR, ES, PT, AT, CH, PL, DK, FI, IE, NO, MX, BR), same
pattern each time — keep this in mind before adding a 26th. One collision
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

`js/data.js` currently has 987 spots (74 AU, 332 US, 32 JP, 15 CA, 9 NZ,
42 CN, 66 GB, 112 DE, 30 FR, 7 SE, 25 NL, 14 IT, 14 BE, 37 KR, 22 ES,
7 PT, 22 AT, 8 CH, 31 PL, 14 DK, 14 FI, 9 IE, 20 NO, 16 MX, 15 BR), all
indoor gyms
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
