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

## Blocked

_(none)_

## Done (recent)

_(none yet — once tasks start landing, log them here with the branch and
a one-line summary, then trim old entries once they're no longer useful
context)_
