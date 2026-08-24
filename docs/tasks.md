# Current Development State

This is the living task tracker for Boulder Atlas. The brain session reads
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

_(empty — add real tasks here as they're identified; don't invent
placeholder work just to fill this section)_

## In Progress

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

## Blocked

_(none)_

## Done (recent)

_(none yet — once tasks start landing, log them here with the branch and
a one-line summary, then trim old entries once they're no longer useful
context)_
