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
index.html             Page shell — header, sidebar, map container, all the modals
css/style.css           All styling (dark "chalk & rock" theme, MapLibre GL overrides)
js/supabase-init.js     Creates the shared Supabase client — project URL/key live here
js/auth.js              Thin wrapper around Supabase Auth (magic link + Google)
js/data.js              The seed dataset — every gym/crag pin, as window.SEED_GYMS
js/app.js               Everything else: map rendering, filters, add/edit, marks
supabase/schema.sql      Run once in the Supabase SQL Editor — creates spots, pending_edits, moderators, marks
supabase/seed.html       Run once in a browser — loads the spots table from js/data.js
```

**Script load order in `index.html` matters**: Supabase JS CDN script →
`supabase-init.js` (defines `window.sb`) → `auth.js` (defines
`window.auth`) → `data.js` (defines `window.SEED_GYMS`) → `app.js`, which
depends on all of the above. Breaking this order breaks the app silently
(check the browser console).

## Data model

- **`spots`** — public read of `status = 'approved'` rows only. Inserts
  from the client are forced to `status = 'pending'` by RLS — a tampered
  client can't insert a pre-approved row.
- **`pending_edits`** — proposed edits to existing spots. The live `spots`
  row is untouched until a moderator approves; approving copies the
  proposed fields onto the live row and deletes the proposal.
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
never `state` alone. Keep this in mind before adding a third country.

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
- DOM markers lag MapLibre's own WebGL render loop while the camera is
  moving (a documented MapLibre/Mapbox limitation, not fixable from
  application code) — markers are hidden for the duration of a
  drag/zoom (`#map.is-moving .maplibregl-marker`, toggled on
  `movestart`/`moveend`) rather than left to visibly trail the map.
- Marker/checkbox colour = climbing type (indoor bouldering, top rope —
  outdoor bouldering was removed as a category, see "Known gaps"); a pin
  split into colour wedges means more than one type applies. A green
  ring = signed-in user has marked it climbed; a gold star badge =
  bookmarked.
- Country/state filter, type filter, and marks filter are independent
  (AND'd together); search matches name or suburb.

## Known gaps (from README "Before it's actually public")

- Privacy Policy / Terms of Service are drafts with placeholders — not
  reviewed, not final.
- Photos are links (a URL to an existing image), not real uploads — a
  real upload flow would need object storage (Supabase Storage,
  Cloudflare R2, or S3).
- "Revert to original data" only works for un-edited seed spots — there's
  no stored "original" for community-submitted spots.
- Outdoor bouldering was removed as a type/category entirely (indoor
  gyms only now). The 23 outdoor-only seed spots were deleted rather than
  recategorized — that data no longer exists in the app, only in git
  history. Some seed states (AU's TAS, US's AL/GA/TN/UT) now have zero
  spots as a result; their filter chips remain since a future indoor gym
  there is plausible.

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
