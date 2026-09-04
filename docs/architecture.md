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
never `state` alone. Now 13 countries deep (AU, US, JP, CA, NZ, CN, GB, DE,
FR, SE, NL, IT, BE), same pattern each time — keep this in mind before
adding a 14th. One collision
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

`js/data.js` currently has 772 spots (74 AU, 332 US, 32 JP, 15 CA, 9 NZ,
42 CN, 66 GB, 112 DE, 30 FR, 7 SE, 25 NL, 14 IT, 14 BE), all indoor gyms
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
    roof, not a duplicate listing. FR/SE/IT and BE have *not* had this
    same follow-up pass — still "real address, geocoded once" for those.
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
  painted twice at once. A tier's stale markers get cleaned up
  automatically by the existing per-frame diff once the zoom crosses a
  threshold and that tier's keys stop appearing in `seenLabels`. Which
  continent a country belongs to is a static `COUNTRY_TO_REGION` map in
  `js/app.js`, matching the `.region-group[data-region]` nesting already
  used in `index.html`'s sidebar — a spot whose country isn't in that map
  (e.g. one submitted via the "Other (not listed)" country option) is
  skipped from the continent tier rather than guessed into one.
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
  not restored), then **reintroduced as a type option by explicit
  request** — `outdoor-bouldering` is now a normal third value in
  `TYPE_COLORS`/`TYPE_LABELS`/`activeTypes` (`js/app.js`), with its own
  sidebar filter checkbox, map legend entry, and add/edit-spot form
  checkbox, reusing the `--t-outdoor` CSS variable that had been left
  over (unused) since the original removal. No existing seed spot has
  been retroactively tagged with this type — it only applies going
  forward to new/edited submissions.
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
