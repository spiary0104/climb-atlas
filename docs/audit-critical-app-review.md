# Review: app changes on `origin/fix/audit-critical` (not merged, not ported)

Branch: 3 commits (`3fd04b1`, `28f24bb`, `8a0b098`, last 2026-09-20), 15 commits behind master. Its database half
(RLS pinning trigger, `recent_submission_count()`, extra indexes) is **already live** and is captured by the
baseline migration. This is a read-only review of its **app** half. Nothing here has been implemented or merged.

`js/app.js` no longer exists on `refactor/context-hygiene` (split into `js/modules/*`), so the branch cannot be
merged mechanically; each fix must be re-applied by hand to the module named below. Every issue was re-checked
against the current branch (grep, 2026-09-24): **all of them are still present.**

| # | Fix on the branch | Still present here? | Where to port (current layout) | Risk of porting | Priority |
|---|---|---|---|---|---|
| 1 | **XSS — `escapeHtml` only escapes `& < >`** (textContent→innerHTML trick). Attribute values such as `src="${escapeHtml(g.photo)}"` can be broken out of with a `"`. New impl escapes `& < > " '`. | Yes: `js/modules/utils.js:11` | `utils.js` (one function) | Low; output only gets safer | **High** |
| 2 | **XSS — unvalidated URLs**: `photo` rendered into `<img src>` / `<a href>`. New `safeUrl()` allows only `http(s)://`; forms reject other photo links. | Yes: `map.js:319` (`<img src>`), `moderation.js:34,49` (`<a href>`) | add `safeUrl` to `utils.js`; use in `map.js`, `moderation.js`, and the add/edit submit handlers in `modals.js` | Low | **High** — `pending_edits` has a public insert policy, so an anonymous visitor can plant a `javascript:` link that a moderator clicks in the review panel |
| 3 | **XSS — inline `onclick` with user-supplied id** (`onclick="window.__toggleMark('${g.id}',…)"`). Replaced by `data-popup-action` / `data-spot-id` plus one delegated listener; the `window.__…` globals removed. | Yes: `map.js:325-332`; globals set in `sidebar.js`/`modals.js` | `map.js` (`popupHtml`) + one delegated listener (e.g. in `sidebar.js` init) + remove the `window.__*` assignments | Medium: touches 4 modules; needs a popup click test | **High** (community ids are now forced to `community-<uuid>` by the live trigger, which removes the id-injection path, but seed/legacy ids and defence in depth still argue for it) |
| 4 | **XSS — unescaped fields in the moderator panel**: `g.state`, `g.country`, `pe.state`, `pe.country`, `data-id="${…}"`, types list. Now escaped. | Yes: `moderation.js:31,36,37,46,51,52,62`; `logbook.js:38,43` | `moderation.js`, `logbook.js` | Low | **High** |
| 5 | **Escape key deletes data**: Escape clicked the first `.btn-cancel`, which in the Pending-review and Logbook modals is a Reject/Delete button above the real Close. Fix: `[data-modal-close]` marker on real close buttons; Reject/Delete get `.btn-danger` (needs a new CSS rule). | Yes: `modals.js:201`; `btn-cancel` on destructive buttons in `moderation.js`, `logbook.js` | `modals.js` (selector), `index.html` (add attribute to each Cancel/Close), `moderation.js`/`logbook.js` (class), `css/style.css` (`.btn-danger`) | Medium: many small edits in `index.html`; must not miss a modal | **High** (silent data loss) |
| 6 | **Auth-change loop**: `onChange` handler re-ran the full reload on every `SIGNED_IN`/`TOKEN_REFRESHED`/tab focus, racing `loadSpots()` and closing open popups. Guard on same user id. Also `auth.init()` wrapped in try/catch. | Yes: `main.js:31-40` | `main.js` | Low–medium; behavioural | Medium |
| 7 | **Offline shell / service worker**: cache version bump, precache the new favicon + 192 px icon, and **only cache the public approved-spots read** in the data cache (per-user tables such as marks/sessions/moderator queue no longer sit in Cache Storage after sign-out). | Partly: `sw.js` has no `isPublicSpotsRead` rule (`sw.js:116` caches every Supabase read) | `sw.js` (this branch already bumped to v4 and has a different shell list) | Medium: conflicts with the current shell-file list; must bump `CACHE_VERSION` again | **High** for the privacy half (private data cached on shared devices); low for the rest |
| 8 | **PWA icons / manifest / iOS meta**: PNG icons (180/192/512), `favicon.svg`, `apple-touch-icon`, `viewport-fit=cover`, apple-mobile-web-app meta, manifest lists PNG + SVG; `crossorigin="anonymous"` on CDN links. | Yes: only `icons/icon.svg` exists | copy `icons/*` (binary PNGs), edit `manifest.json`, `index.html` `<head>` | Low, but PNGs are new binary files; `crossorigin` on CDN tags can break a CDN that omits CORS headers — test | Medium/low (installability polish) |
| 9 | Docs (`docs/architecture.md`, `docs/tasks.md`) | n/a | already archived here | none | ignore |

Also on the branch and worth knowing: `safe-area` insets CSS for the installed PWA (`28f24bb`, in `css/style.css`),
which was not in the diff listing above and needs a separate look.

## Recommendation
Treat items 1–5 and the privacy half of 7 as one security task ("port audit-critical app fixes to the modular
layout"), done by hand with a browser test for each (popup buttons, moderator panel, Escape in every modal,
offline reload). Do it after the migration work, on its own branch from this one. Items 6, 8 and the safe-area CSS
can follow as a second, low-risk task. Do not merge `origin/fix/audit-critical` itself.
