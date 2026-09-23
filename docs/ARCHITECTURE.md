# Architecture (short form)

Distilled from `docs/archive/architecture.md` (5,600 lines, archived — do not
read it; grep it for a specific heading only if this file lacks something).
`file:line` refs are as of the ES-module split; re-grep if they drift.

## Stack
- Plain static site: HTML + CSS + vanilla JS as native ES modules. No build
  step, no package.json. Must be served over HTTP (modules + fetch + Auth).
- Map: MapLibre GL 5 (globe) + Supercluster, both from CDN.
- Backend: Supabase (Postgres + Auth + RLS), client from CDN.
- Hosting: Vercel (`vercel.json`), climbatlas.org. PWA via `sw.js`.

## File map
| Path | What it is |
|---|---|
| `index.html` | App shell: header, sidebar, chips, all modals. No inline JS/CSS |
| `css/style.css` | All styles; tokens on `:root`; former inline styles at the end |
| `css/chips.css` | Per-region chip colour (`--chip`), keyed on `data-country`+`data-state` |
| `js/supabase-init.js` | Classic script: `window.sb`, `window.SUPABASE_CONFIGURED` |
| `js/auth.js` | Classic script: `window.auth` (`init`, `onChange`, sign-in/out, `user`) |
| `js/main.js` | Entry module: calls each `init*()` in order, then `init()` (boot) |
| `js/sw-register.js` | Registers `sw.js` on window load |
| `js/modules/state.js` | `appState` — every piece of mutable state (spots, marks, filters, markers, form state) |
| `js/modules/constants.js` | Type colours/labels, country labels + fly targets, zoom thresholds, `motion()` |
| `js/modules/regions.js` | `STATES_BY_COUNTRY` (static, ~620 lines) |
| `js/modules/utils.js` | `typeSwatch`, `escapeHtml`, `directionsUrl`, `showToast` |
| `js/modules/map.js` | Map, clustering, label tiers, markers, popups, legend, first-visit hint |
| `js/modules/sidebar.js` | `render()`, filters, search, header nav, Saved button, `toggleMark` |
| `js/modules/modals.js` | Modal focus/Escape handling, add/edit/report forms, Privacy/Terms |
| `js/modules/auth-ui.js` | Sign-in widget + modal |
| `js/modules/data-load.js` | `loadSpots` (Supabase → `data/gyms.json` fallback), marks, moderator, pending |
| `js/modules/logbook.js` | Logbook list + "Log a session" form |
| `js/modules/moderation.js` | Pending-review panel, approve/reject/dismiss |
| `data/gyms.json` | Seed dataset, 1,867 spots, pure JSON. **Never read — use `jq`** |
| `supabase/schema.sql` | Tables, RLS, rate limit. Re-runnable |
| `supabase/seed.html`, `geocode.html` | Seed-SQL generator; pin-position checker (both fetch `data/gyms.json`) |
| `sw.js` | Service worker (`SHELL_FILES` :11 — add new JS/CSS files here) |
| `docs/TASKS.md` | Open work only |
| `docs/archive/` | Old long-form docs + data.js provenance comments. **Never read** |

## Load order (`index.html:1464-1473`)
MapLibre → Supercluster → Supabase CDN → `supabase-init.js` → `auth.js` →
`main.js` (module, deferred) → `sw-register.js`.

## Module conventions
- Shared mutable state is only ever `appState.x` (`js/modules/state.js`).
  Don't add module-level `let`s that another module needs to write.
- Each module's DOM wiring lives in an exported `init*()`; `main.js:13-20`
  calls them in the original order: `initMap`, `initSidebar`,
  `initModalKeyboard`, `initAuthUI`, `initForms`, `initLogbook`,
  `initModeration`, `initInfoModals`.
- Popup HTML uses inline `onclick` → globals `window.__toggleMark`
  (`sidebar.js:271`), `__editSpot` (`modals.js:328`), `__reportSpot`
  (`modals.js:402`).
- Imports form cycles (map ↔ sidebar ↔ modals); that's safe because
  top-level code only does DOM lookups and `new maplibregl.Map`. Keep it so.

## Data model (`supabase/schema.sql`)
`moderators` (:19), `spots` (:39; status pending/approved/rejected; insert
needs sign-in + rate limit :104), `pending_edits` (:134), `reports` (:177),
`marks` (:204), `routes` (:248), `sessions` (:293), `session_climbs` (:335).

Spot shape: `id` (`seed-N` for seed rows), `name`, `suburb`, `state`,
`country`, `lat`, `lng`, `address`, `types[]` (`indoor-bouldering` |
`top-rope` | `lead-climbing`), `notes`, `community`. `state` codes collide
across countries — always key on `country:state`.

## Data flow
1. `init()` (`main.js:22`) → `window.auth.init()` → `loadSpots()`
   (`data-load.js:17`).
2. Supabase unreachable/unconfigured → `ensureSeedData()` (`data-load.js:6`)
   fetches `data/gyms.json`, sets `appState.usingFallback` → offline banner.
3. `loadMarks` (:79), `checkModerator` (:44), `loadPending` (:57), then
   `render()` (`sidebar.js:27`).
4. `render()` filters via `passesFilters` (`sidebar.js:9`), rebuilds the
   list, then `rebuildClusterIndex` (`map.js:51`) → `paintMarkers` (`map.js:144`).
5. Auth changes re-run marks/moderator/pending + `render()`.
6. Writes: add → `spots` insert (pending, `modals.js` `initForms`); edit →
   `pending_edits`; report → `reports`; moderators act in `moderation.js`.

## Key functions
| Area | Function | Where |
|---|---|---|
| Map | `initialZoom`, `map` | `map.js:24`, `:29` |
| Map | `compute{Region,Country,Continent}Centroids` | `map.js:73-113` |
| Map | `buildSpotMarker`, `buildSpotNumberMarker`, `popupHtml` | `map.js:279`, `:302`, `:315` |
| List | `updateMarkUI`, `resetFilters`, `setNavOpen`, `toggleMark` | `sidebar.js:100`, `:118`, `:142`, `:148` |
| Forms | `populateStateSelect`, `getCountryState` | `modals.js:18`, `:36` |
| Forms | `startPlacing`, `stopPlacing`, `checkFormReady` | `modals.js:59`, `:65`, `:80` |
| Forms | `openEditModal`, `openReportModal` | `modals.js:95`, `:162` |
| Modals | focus trap (MutationObserver) + Escape/Tab | `modals.js:183-212` |
| Auth UI | `renderAuthUI`, `openAuthModal` | `auth-ui.js:11`, `:30` |
| Logbook | `loadSessions`, `renderLogbookList`, `openAddSessionModal` | `logbook.js:7`, `:29`, `:94` |
| Moderation | `renderPendingPanel`, `approveSpot`, `approveEdit` | `moderation.js:24`, `:83`, `:107` |

## Map label tiers (`constants.js:133-144`)
Continent labels below `CONTINENT_LABEL_ZOOM` (3.5), country labels below
`COUNTRY_LABEL_ZOOM` (5), hold icons from `HOLD_ICON_ZOOM` (9); numbered
badges in between.

## Offline / PWA (`sw.js`)
Shell precached (`SHELL_FILES`); bump `CACHE_VERSION` (:5) whenever a
precached file changes. Tiles cache-first, Supabase network-first, the rest
stale-while-revalidate.

## Querying the seed data
```
jq length data/gyms.json
jq '[.[]|select(.country=="JP")]|length' data/gyms.json
jq -c '.[]|select(.name|test("Blochaus";"i"))' data/gyms.json
```
Edit seed spots with `jq`/a script, keep `id`s stable, then regenerate SQL
with `supabase/seed.html`.
