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
never `state` alone. Now 5 countries deep (AU, US, JP, CA, NZ), same
pattern each time — keep this in mind before adding a 6th.

## Seed data sourcing

`js/data.js` currently has 485 spots (77 AU, 352 US, 32 JP, 15 CA, 9 NZ),
all indoor gyms (bouldering and/or top rope — see "Known gaps" below on
why outdoor areas were removed). It was built up in layers, not from one
source:

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
  paints as a numbered badge (`buildSpotNumberMarker`, reusing the
  `.cluster-marker` look with the spot's own type colour as background)
  instead of the small hold-shaped icon, which is easy to miss at a wide
  zoom. `paintMarkers()` tracks which "bucket" (icon vs. number) it last
  painted in and clears every spot marker (not cluster badges) when the
  zoom crosses that threshold, so painted markers don't get stuck in the
  wrong style. `updateMarkUI()` only restyles `kind:'icon'` marker
  entries for the same reason — a numbered badge has no climbed/bookmarked
  state to reflect.
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
