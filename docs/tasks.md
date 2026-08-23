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

## Blocked

_(none)_

## Done (recent)

_(none yet — once tasks start landing, log them here with the branch and
a one-line summary, then trim old entries once they're no longer useful
context)_
