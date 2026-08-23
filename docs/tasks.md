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

## Blocked

_(none)_

## Done (recent)

_(none yet — once tasks start landing, log them here with the branch and
a one-line summary, then trim old entries once they're no longer useful
context)_
