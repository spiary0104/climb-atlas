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
| `index.html` | App shell: top bar, list pane, map region (`data-theme="rock"`), tab bar, Me menu, all dialogs. No inline JS/CSS |
| `docs/DESIGN.md` | Bouldeer design spec (source of truth for UI; 73 KB: read by line range) + dated decision log at the end |
| `css/tokens.css` | The ONLY place raw colour/shadow/font values live: `--palette-*` primitives → semantic roles (paper on `:root`, `[data-theme="rock"]` overrides) → component tokens |
| `design/tokens.json` | W3C tokens for the native app, GENERATED from tokens.css: `node scripts/build-tokens-json.js` |
| `css/base.css`, `css/components.css` | Reset/type scale/focus; shared components (`.btn` tiers, fields, search, chips, rows, cards, tabs, top bar, tab bar + START, menu, dialogs, alerts, provenance, type tags, mascot hooks) |
| `css/style.css` | App layer: shell, list pane, map overlays/pins/clusters/labels, logbook + moderation lists, About page |
| `assets/icons.svg` | The one icon system: Phosphor Regular sprite (MIT); use `icon(name)` from `js/modules/icons.js` |
| `js/supabase-init.js` | Classic script: `window.sb`, `window.SUPABASE_CONFIGURED` |
| `js/auth.js` | Classic script: `window.auth` (`init`, `onChange`, sign-in/out, `user`) |
| `js/main.js` | Entry module: calls each `init*()` in order, then `init()` (boot) |
| `js/sw-register.js` | Registers `sw.js` on window load |
| `js/modules/state.js` | `appState` — every piece of mutable state (spots, marks, filters, markers, form state) |
| `js/modules/constants.js` | Type colours/labels, country labels + fly targets, zoom thresholds, `motion()` |
| `js/modules/regions.js` | `STATES_BY_COUNTRY` (static, ~620 lines) |
| `js/modules/utils.js` | `typeSwatch`, `directionsUrl`, `showToast`; re-exports `escapeHtml`, `safeUrl` |
| `js/modules/html-safe.js` | Pure `escapeHtml` (all of `& < > " ' \``) and `safeUrl` (http/https only). Every DB/form value in markup goes through these |
| `js/modules/popup-html.js`, `moderation-html.js` | Pure HTML builders for the map popup and the pending-review cards (no DOM, unit-tested) |
| `js/modules/map.js` | Map, clustering, label tiers, markers, popups, legend, first-visit hint (map paint colours read from tokens via `cssToken()`) |
| `js/modules/sidebar.js` | `render()`, filters, search, Saved button, `toggleMark` |
| `js/modules/nav.js` | Top bar + tab bar + Me menu: one delegated `[data-nav]` handler (explore/regions/log/start/me/add-gym) |
| `js/modules/icons.js` | `icon(name)` → sprite `<svg>`; unknown names throw |
| `js/modules/modals.js` | Modal focus/Escape handling, add/edit/report forms, Privacy/Terms |
| `js/modules/auth-ui.js` | Sign-in widget + modal |
| `js/modules/data-load.js` | `loadSpots` (Supabase → `data/gyms.json` fallback), marks, moderator, pending |
| `js/modules/logbook.js` | Logbook list + "Log a session" form |
| `js/modules/moderation.js` | Pending-review panel, approve/reject/dismiss |
| `data/gyms.json` | LEGACY seed dataset: offline fallback + "Revert to original" source in `data-load.js`/`modals.js` (ids stale vs production), and the reconciliation provenance input. **Never read; never edit** |
| `data/gyms.reconciled.json` | FROZEN reconciliation/provenance dataset (2,127 records = production at the first import). Not a runtime file |
| `supabase/schema.sql` | Tables, RLS, rate limit. Re-runnable |
| `supabase/geocode.html` | Pin-position checker (fetches `data/gyms.json`). The legacy `seed.html` seed-SQL generator was removed |
| `import/`, `scripts/gym-import.js`, `scripts/lib/gym-import/` | Gym import pipeline: staging batches, match index, validate/plan/dedupe. See `docs/import-workflow.md` |
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
  `initModeration`, `initInfoModals`, `initNavigation`.
- Popup buttons carry `data-popup-action` + `data-spot-id`; one delegated click listener in `sidebar.js` handles them
  (no inline `onclick`, no `window.__*` globals).
- Imports form cycles (map ↔ sidebar ↔ modals); that's safe because
  top-level code only does DOM lookups and `new maplibregl.Map`. Keep it so.

## Data model (`supabase/schema.sql`)
`moderators` (:19), `spots` (:39; status pending/approved/rejected; insert
needs sign-in + rate limit :104), `pending_edits` (:134), `reports` (:177),
`marks` (:204), `routes` (:248), `sessions` (:293), `session_climbs` (:335).

Spot shape: `id` (`seed-N` legacy, `community-<uuid>`, or frozen `g-<hex>` for imported gyms), `name`, `suburb`, `state`,
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
| List | `updateMarkUI`, `resetFilters`, `toggleMark` | `sidebar.js` (grep) |
| Nav | `initNavigation`, `ACTIONS` | `nav.js` |
| Forms | `populateStateSelect`, `getCountryState` | `modals.js:18`, `:36` |
| Forms | `startPlacing`, `stopPlacing`, `checkFormReady` | `modals.js:59`, `:65`, `:80` |
| Forms | `openEditModal`, `openReportModal`, `startAddGym` | `modals.js` (grep) |
| Modals | focus trap (MutationObserver) + Escape/Tab | `modals.js:183-212` |
| Auth UI | `renderAuthUI`, `openAuthModal` | `auth-ui.js:11`, `:30` |
| Logbook | `openLogbookModal`, `startLogSession`, `renderLogbookList` | `logbook.js` (grep) |
| Moderation | `renderPendingPanel`, `approveSpot`, `approveEdit` | `moderation.js:24`, `:83`, `:107` |

## Map label tiers (`constants.js:133-144`)
Continent labels below `CONTINENT_LABEL_ZOOM` (3.5), country labels below
`COUNTRY_LABEL_ZOOM` (5), hold icons from `HOLD_ICON_ZOOM` (9); numbered
badges in between.

## Design system (docs/DESIGN.md)
Components use semantic roles only (`--color-text-secondary`, `--radius-md`, `--shadow-overlay`), never
`--palette-*` or raw values. Paper = documents; `[data-theme="rock"]` = the map region; objects floating over the
map are `.map-float` + `data-theme="paper"` with `--shadow-raised`. Fraunces only >= 18px; Inter otherwise; no 700.
Buttons: `.btn` + exactly one of `.btn-primary` (one per surface) / `-secondary` / `-tertiary`, sizes `.btn-sm/-lg`,
`.btn-icon`; destructive = `.btn-danger` (Escape never clicks it). New icon: add Phosphor path data to the sprite +
`ICON_NAMES`. After editing tokens.css run `node scripts/build-tokens-json.js`.

## Offline / PWA (`sw.js`)
Shell precached (`SHELL_FILES`); bump `CACHE_VERSION` (:5) whenever a
precached file changes (now v6). Tiles cache-first, the rest stale-while-revalidate;
CDN assets carry `crossorigin="anonymous"` so they are cacheable for offline boot.
Supabase: ONLY the public `GET /rest/v1/spots?...status=eq.approved` read is
cached (network-first); marks/sessions/moderator/pending/auth and every write
are never intercepted (the Cache API ignores `Authorization`, so caching them
would leak across users). Popup/modal buttons use `data-*` + one delegated
listener (no inline `onclick`, no `window.__*`); Escape only clicks
`[data-modal-close]`.

## Tests
`node --test "tests/*.test.js"` (Node 24, no install): escaping/URL safety,
hostile-input rendering of popup + moderator panel, service-worker caching
(vm sandbox), static checks (no inline handlers, modal-close markers),
design system (`design-system.test.js`: tokens ↔ tokens.json, no raw colours,
fonts, radii, shadows, icons, no emoji, brand, mascot hooks, CDN `crossorigin`).

## Querying the seed data
```
jq length data/gyms.json
jq '[.[]|select(.country=="JP")]|length' data/gyms.json
jq -c '.[]|select(.name|test("Blochaus";"i"))' data/gyms.json
```
Read-only queries only: do not edit `data/gyms.json` (legacy, stale ids). New gyms go through the
import pipeline (`docs/import-workflow.md`).
