# Climb Atlas

A community-sourced map of indoor climbing gyms (bouldering, top rope) across Australia,
the United States, Japan, Canada, New Zealand, and China, modelled on [Track Atlas](https://trackatlas.org).

This is a static site: plain HTML/CSS/JS, no build step, no framework. Once Supabase is
configured (see below), open `index.html` in a browser and it runs.

## File structure

```
index.html             Page shell — header, sidebar, map container, all the modals
css/style.css           All styling (dark "chalk & rock" theme, MapLibre GL overrides)
js/supabase-init.js     Creates the shared Supabase client — put your project URL/key here
js/auth.js              Thin wrapper around Supabase Auth (magic link + Google)
js/data.js              The seed dataset — every gym/crag pin, as window.SEED_GYMS
js/app.js               Everything else: map rendering, filters, add/edit, marks
supabase/schema.sql      Run once in the Supabase SQL Editor — creates spots, pending_edits, reports, moderators, marks
supabase/seed.html       Run once in a browser — loads the spots table from js/data.js
supabase/geocode.html    Maintenance tool — re-geocodes spot addresses against OpenStreetMap
                         Nominatim to fix inaccurate pin positions, see "Fixing pin positions" below
```

Script load order in `index.html` matters: the Supabase JS CDN script, then
`supabase-init.js` (defines `window.sb`), then `auth.js` (defines `window.auth`), then
`data.js` (defines `window.SEED_GYMS`), then `app.js`, which depends on all of the above.

## Setup (required — the app doesn't do anything useful until this is done)

Spots, accounts, and marks (climbed/bookmarked) are all backed by
[Supabase](https://supabase.com) — Postgres + Auth, free to start (500MB database, 50k
monthly active users; free projects auto-pause after 7 days with no traffic, which just
means the first request after a pause takes a few seconds to wake it back up).

1. **Create a project** at [supabase.com](https://supabase.com).
2. **Run the schema.** Dashboard → SQL Editor → New query → paste in the contents of
   [`supabase/schema.sql`](supabase/schema.sql) → Run. This creates `spots` (public read of
   approved rows only — see "Moderation" below), `pending_edits` and `moderators` (both
   moderator-only), and `marks` (each user can only see and change their own). Safe to
   re-run on a project that already has these tables — e.g. if you set this up before
   multi-country or moderation support was added, re-running adds the new columns/tables
   without touching existing rows (they all default to `'AU'` / `'approved'`, i.e.
   everything already live stays live and public).
3. **Enable magic-link email sign-in.** Dashboard → Authentication → Providers → Email
   is on by default with "Confirm email" — that's the magic-link flow already. Under
   Authentication → URL Configuration, set **Site URL** to wherever you're running this
   (e.g. `http://localhost:8000` for local testing, your real domain once deployed), and
   add it to **Redirect URLs** too. Supabase's built-in email sender is rate-limited and
   meant for testing — before real traffic, add your own SMTP provider under
   Authentication → Providers → Email → SMTP Settings (Postmark, Resend, SES, etc. all work).
4. **Enable Google sign-in.** Dashboard → Authentication → Providers → Google → enable it.
   You'll need a Google OAuth client: in [Google Cloud Console](https://console.cloud.google.com/),
   create an OAuth consent screen and an OAuth 2.0 Client ID (type "Web application"), then
   add `https://<your-project-ref>.supabase.co/auth/v1/callback` as an authorized redirect
   URI (Supabase shows you this exact URL on the Google provider settings page). Paste the
   resulting Client ID and Client Secret into Supabase's Google provider settings.
5. **Fill in `js/supabase-init.js`** with your project's URL and anon/public key
   (Dashboard → Project Settings → API). The anon key is meant to be public/client-side —
   access control comes from the RLS policies in `schema.sql`, not from hiding this key.
6. **Seed the spots table.** Open `supabase/seed.html` in a browser and click the button.
   It loads `js/data.js` and upserts every seed spot as `status = 'approved'` — safe to re-run.
7. **Add yourself as a moderator** (so you can approve/reject submissions — see
   "Moderation" below). Sign in to the running app once with the account you want to use,
   then in the SQL Editor run:
   ```sql
   insert into public.moderators (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
   Reload the app — a "Pending review" button appears in the header once you're recognised
   as a moderator. Add more moderators the same way, one row per account.
8. Open `index.html`. If it just shows a banner saying it's using offline seed data,
   something above didn't take — check the browser console for the actual error.

Because the app fetches map tiles, fonts, and the Supabase/MapLibre CDN scripts over the
network, just double-clicking `index.html` works in most browsers once configured. If
sign-in redirects behave oddly, serve it over a local HTTP server instead (`npx serve .`
or `python3 -m http.server 8000`) so the Site URL / Redirect URL you configured in Supabase
actually matches what the browser is on.

## Accounts & marks

Signed-in users (Google or email magic link) can mark any spot as **climbed** (green ring
on its pin) or **bookmarked** (gold star badge) — both private to that user's account, and
both filterable from the "My marks" section of the sidebar. Marks live in the `marks`
table; RLS policies mean a user can only ever read or write their own rows, regardless of
what the client sends. Marks aren't moderated — they're private, so there's nothing to review.

Adding and editing spots themselves does **not** require signing in — see "Moderation" below.

## Moderation

New spots, edits to existing spots, and incorrect-info reports all go through review
before they're publicly visible (or, for reports, before anyone acts on them):

- **Adding a spot** inserts it into `spots` with `status = 'pending'` — the RLS policy
  forces this server-side, so a tampered client can't insert a pre-approved row. Pending
  spots don't appear on the public map at all until approved.
- **Editing a spot** (including "Revert to original data") doesn't touch the live row —
  it inserts a proposal into `pending_edits`. The spot keeps showing its current approved
  data on the map until a moderator approves the proposal, at which point its fields are
  copied onto the live row and the proposal is removed. Reject just deletes the proposal;
  the live spot is untouched either way.
- **Reporting incorrect information** (the popup's "Report incorrect info" link) inserts
  a free-text message into `reports`, tied to that spot — not a structured edit proposal,
  just a note for a moderator to read. It's never shown publicly. A moderator can dismiss
  it, or use it as a prompt to make the actual correction themselves via "Edit this spot".
- **Moderators** (accounts listed in the `moderators` table — see Setup step 7) get a
  "Pending review" button in the header showing a live count (pending spots + pending
  edits + open reports combined). It opens a panel listing all three, each with its own
  actions (Approve/Reject for spots and edits, Dismiss/Edit this spot for reports).
  Nobody can add themselves as a moderator through the app — that table has no public
  INSERT policy, so it's SQL-Editor-only by design.
- Only `spots`, `pending_edits`, and `reports` are moderated this way. There's still no
  accuracy review beyond that — a moderator can approve something wrong, and there's no
  edit history/audit log.

## Fixing pin positions (geocoding)

Most seed spots have a verified street `address`, but for many the `lat`/`lng` pin itself
was only ever estimated at city/suburb level, not computed from that address — see
`docs/architecture.md` "Seed data sourcing". If you get feedback that pins are off by a few
kilometres, open `supabase/geocode.html` in a browser: it re-geocodes every spot that has an
`address` against [OpenStreetMap's Nominatim](https://nominatim.openstreetmap.org/) (free,
keyless), shows how far each proposed position is from the current pin (sorted worst-first),
and lets you review and select individual corrections rather than applying anything blind —
each row includes the raw Nominatim match text and map links for both the old and new
position so you can sanity-check before accepting. Selected corrections generate both:
ready-to-run SQL (paste into the Supabase SQL Editor to fix the live map immediately) and a
JSON list of the same changes to apply to `js/data.js` too, so the offline fallback and any
future re-seed stay in sync. Nominatim's usage policy caps requests around 1/second, so a
full pass over ~600 addressed spots takes roughly 10–15 minutes.

## Before it's actually public

- **Privacy Policy & Terms of Service** are already in the app (footer links → modals) and
  now mention accounts, but are still a basic draft — date, jurisdiction, and contact email
  are filled in with real values (contact email is currently a placeholder inbox pending the
  real domain launch) but the legal text itself hasn't had a proper review — get one before
  relying on it, especially given there are now real accounts and personal data (email
  addresses, marks) involved.
- **Photos are links, not uploads** — the photo field stores a URL to an existing image
  (their site, Instagram, etc.), not a file you host. A real upload flow needs object
  storage (Supabase Storage, Cloudflare R2, or S3).
- **"Revert to original data"** only works for un-edited seed spots (it looks up the
  original values in `js/data.js`). Community-submitted spots have no stored "original" to
  revert to, so the button is hidden for those even if they've since been edited.
- **Outdoor bouldering was removed as a category** — the app now only tracks indoor gyms
  (bouldering, top rope). The 23 seed spots that were outdoor-only (crags/climbing areas
  researched from thecrag.com) were deleted outright rather than recategorized, per an
  explicit decision when this was scoped — if outdoor coverage comes back later, that data
  isn't sitting anywhere to restore from except old git history.

## Deploying

Simplest path once you're happy with it locally:

- **Netlify** — drag this whole folder onto [app.netlify.com/drop](https://app.netlify.com/drop). Done, you get a live URL.
- **Vercel** — push this folder to a GitHub repo, then import it at vercel.com. Auto-deploys on every push after that.

Either way, once you have the real URL: add it to Supabase's Site URL / Redirect URLs
(step 3 above), add it as an authorized redirect where relevant in Google Cloud Console,
and add a custom domain from the host's dashboard once you've bought one.

## Design notes

- **The map is MapLibre GL, not Leaflet** — switched to get the 3D globe projection
  (`map.setProjection({type:'globe'})`, set once in a `style.load` listener) plus the
  atmosphere glow (`map.setSky({...})`), matching the interaction style of
  [Track Atlas](https://trackatlas.org) without needing a Mapbox account/API key. The
  basemap is CARTO's free, keyless "Dark Matter" vector style — the same theme the old
  raster tiles used, just the GL sibling. Clustering is hand-rolled with `supercluster`
  (MapLibre only clusters GL-rendered symbol layers natively, not arbitrary DOM markers
  like the ones this app uses for its custom hold-shaped icons) — `rebuildClusterIndex()`
  loads the currently-visible spots into a `Supercluster` instance whenever filters
  change, and `paintMarkers()` repaints whatever's in the viewport on every `moveend`,
  reusing markers/clusters that are already correctly painted instead of tearing
  everything down each time.
  **The CDN pin must stay at `maplibre-gl@5` or later** — `@4` resolves to a 4.x release
  whose bundle only lists `globe` in the style-spec schema (for validation) and has no
  actual globe rendering engine, so `setProjection({type:'globe'})` silently does nothing
  and the map stays flat. Real globe rendering isn't there until v5. Don't downgrade this
  pin without re-checking that.
  DOM markers also visibly lag MapLibre's WebGL render loop while the camera is moving —
  a documented MapLibre/Mapbox limitation, not fixable from application code — so markers
  are hidden for the duration of a drag/zoom gesture (`#map.is-moving .maplibregl-marker`)
  and reappear once `moveend` repaints them, rather than visibly trailing the map.
- Marker/checkbox colour = climbing type (indoor bouldering or top rope — outdoor
  bouldering was removed as a category, see "Known gaps" below). A pin split into colour
  wedges means more than one type applies. A green ring means the signed-in user has
  marked it climbed; a gold star badge means bookmarked.
- Country/state filter, type filter, and marks filter are independent (AND'd together);
  search matches name or suburb.
- **`state` codes are only unique within a country** — e.g. AU's `WA` (Western Australia)
  and US's `WA` (Washington) are different regions that happen to share a code. Every
  spot has both a `country` and a `state` field, and anything that filters, colors, or
  edits by state (chips in `index.html`, `STATES_BY_COUNTRY` in `app.js`, the RLS-safe
  columns in `schema.sql`) keys off the pair together, never `state` alone. Japan,
  Canada, New Zealand, and China were all added following this same pattern — see
  `docs/architecture.md` "Seed data sourcing" for how each one's region codes were
  chosen (Japan and NZ use city/region names since neither has a widely-known
  short-code convention; Canada uses standard 2-letter province codes like AU/US;
  China uses the 9 city names its one data source itself groups by).
- Seed data in `data.js` was researched and cross-checked spot-by-spot rather than
  pulled from one source — see the in-app About section for the full story. It's not
  exhaustive; that's what the community add/edit flow is for. The US portion currently
  covers 12 states' worth of major-city indoor gyms, Japan covers 8 cities/prefectures,
  Canada covers 4 provinces, New Zealand covers 3 regions, and China covers every
  currently-open location of one single chain (Banana Climbing) across 9 cities —
  nowhere near exhaustive for the country as a whole, though complete for that one
  brand. Some listed states (e.g. AU's TAS, US's AL/GA/TN/UT) currently have zero
  spots, since their only entries were outdoor-bouldering areas removed in the pass
  below — the chips still show them since a future indoor gym in that state is
  entirely plausible, they'll just filter to nothing until one's added.
- Below HOLD_ICON_ZOOM (`js/app.js`), an ungrouped single spot marker paints as a
  numbered badge — deliberately styled identically to a real cluster badge, not
  colour-coded, so it reads as "just another badge" while zoomed out rather than a
  third distinct marker style. It switches to the real hold-shaped icon once you
  zoom in past that threshold, or click it to zoom straight there. The same zoomed-
  out window also shows plain text city/state labels (`.region-label`) at each
  visible region's centroid, for basic orientation on the globe without needing to
  zoom in — see `docs/architecture.md` "Map" for both.
- The country/state filter chips are grouped into a collapsible accordion per
  country (collapsed by default) rather than one long always-expanded list — with
  6+ countries the fully-expanded chip list ran the sidebar out of usable height
  (see `docs/architecture.md` "Sidebar chip growth"). A filter chosen inside a
  collapsed group stays applied and gets a small colour/dot indicator on that
  group's label so it's never silently invisible. The gym list below the filters
  is hidden (replaced by a one-line spot count) until you actually search by name
  or suburb — at 500+ spots it was expensive to render and mostly just pushed the
  map down for no benefit when nobody was scrolling through it anyway.
