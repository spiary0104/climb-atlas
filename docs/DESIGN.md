# Bouldeer — Design & UX Implementation Specification

*Version 1.0 · 25 September 2026 · Status: approved direction, ready for implementation.*
*Source decisions: the critical design review (hybrid B + A + C-limited), the design strategy, the research reports, and the concept boards. Reviewed against the current codebase: vanilla HTML/CSS/JS, MapLibre GL + supercluster, Supabase (PostgREST + RLS), 2,127 gyms.*

This file is the single reference for all UI work on Bouldeer, web now and the native app later. It is written as decisions, not discussion. If an implementation choice cannot be traced to a section here, question it before building it.

---

## 0. Decision summary

### 0.1 Non-negotiable Design DNA

These fourteen constraints govern every screen. They are not up for reinterpretation during implementation.

1. **Paper for reading, rock for finding.** Documents (gym pages, region pages, logbook, profile, forms) sit on cream surfaces. The map and its immediate controls sit on rock-black. Nothing else is dark; nothing on the map canvas is cream except floating cards and controls.
2. **Density is a feature.** Any list that can exceed twenty items defaults to 56px rows. Photo cards are for first looks and heroes, never for scale.
3. **Missing data is invisible, not placeholdered.** A section with no data does not render. The only substitute is one contribution prompt per page.
4. **One accent, used like punctuation.** Forest green on the primary action, the active state and the selected pin. Climb types own their three colours; nothing else is coloured. Mustard is reserved for START, stamps and celebrations.
5. **Hairlines first, two shadows only.** Depth comes from 1px ink borders. `shadow.raised` is for the peek card over the map; `shadow.overlay` is for sheets and dialogs. No card, tile or row casts a shadow.
6. **One radius factor: 6 / 10 / 14 / 20.** Pills only on filter chips and the primary button.
7. **Serif for names, sans for everything, figures tabular.** Fraunces at 18px and above for wordmark, page titles, region names and stamps. Inter for the interface. Tabular figures on every number. No third family.
8. **Every place has a URL.** Gyms, regions, cities and profiles are pages, never popups or modals.
9. **The map and the list are one view.** The list is scoped to the viewport with a visible count; selection is synced both ways; on mobile the list is a persistent three-stop sheet, never a separate screen.
10. **Provenance is always visible and always quiet.** A small mark on the card, one line on the page, never a badge that competes with the name.
11. **The deer is a host, not a guide.** Flat-vector head on the icon, START and default avatar. Full character only at spot size in first-run empties, milestones and the passport. Never in forms, errors, moderation, the map canvas, desktop chrome or repeat-visit empties. Never larger than the primary action. Motion only on the stamp landing and the milestone reveal.
12. **The stamp is the souvenir.** Check-in → stamp → passport → share card. First release.
13. **Indoor first in vocabulary, place-agnostic in structure.** Copy and imagery speak gym. Page structure works for a crag with different fields. Contour texture only on placeholders and the passport.
14. **Tokens are the product.** Every colour, radius, shadow, size and duration is a named semantic role in one file that web and app both read. Components never reference a raw value.

### 0.2 Approved implementation decisions

- Primary visual language is **Field Guide** (cream, ink hairlines, serif display, stamps, contour placeholders). **Chalk & Rock** supplies the dark map, 56px rows, moderation, stats and every data-heavy surface. From **Companion** only the raised START face and the milestone celebration sheet are adopted; every other Companion element is rejected (rounded display face, pill-everything, tinted icon tiles, ambient card shadows, light basemap, search-bar avatar).
- Typography: Fraunces (display) + Inter (interface). Space Grotesk and Space Mono are retired.
- Colour roles: cream document surfaces, rock-black map, forest green accent, mustard for START/stamps/celebrations, ember orange demoted to the boulder climb-type colour, ink for text and hairlines.
- Map: the existing dark CARTO basemap is retained. Pins are type-coloured teardrops with an ink outline; 16px at city zoom, 6px dots below zoom 11; clusters are cream discs with an ink count. The per-region colour palette is deleted.
- Navigation: five areas (Explore · Regions · Log · Me, plus START on mobile). Passport lives inside Me at launch.
- Routing: real URLs for gyms, regions, cities, profiles via the History API with a hash fallback.
- Check-in is a first-release feature, stored in its own table, producing a stamp and a passport.
- The codebase is evolved, not rewritten: `index.html`, `css/style.css`, `js/app.js` are retained and split into modules where a section grows.

### 0.3 First-release features (this redesign)

Gym pages with real URLs; viewport-scoped map/list with "N gyms in view"; mobile persistent bottom sheet; designed no-photo placeholder; one icon system replacing emoji; consolidated button system; type-colour-only pins; removal of the region palette; cream surfaces against the dark map; check-in with stamp and passport; search across gym/city/region/country; region and city pages; provenance indicators; the existing logbook re-skinned (not redesigned); moderation queue re-skinned to the dense-row system.

### 0.4 Optional enhancements (after first release, only when asked for)

Warm custom basemap; hover synchronisation refinements beyond the basic card↔pin highlight; grade-system normalisation in the logbook; the retro app icon replacing the current goat; achievements beyond the passport's own milestones; facilities and hours data model plus the contribution flow to populate it.

### 0.5 Deferred (do not build in this redesign)

Five-photo mosaic hero; full-body mascot animation; photo or session feed; live "who's climbing now"; paper-grain textures; 3D/terrain layers; a command palette beyond good search; per-gym colour systems before a routes UI exists; public profiles with handles (see open decisions).

### 0.6 Open decisions requiring the owner's input

Listed in §19. None blocks Phase 1.

---

## 1. Bouldeer design foundation

### 1.1 The idea

Bouldeer is a guidebook to climbing places with a map inside it. That sentence produces every visual rule. A guidebook is paper: cream, hairlines, a serif for names, dense tables where the data is dense. Finding a place is terrain: dark, quiet, precise, with the pins as the only colour. Moving between the two is what a climber does on a trip, and the check-in stamp is the mark left behind. The three source concepts survive in exactly those roles: Field Guide is the paper, Chalk & Rock is the terrain, and Companion contributes the one warm gesture (the character on the START button and at milestones) that makes the transition human.

### 1.2 Why it is one system, not three

Every choice derives from a single split, surface versus map, and each side has one set of rules:

| | Paper (documents) | Rock (map) |
|---|---|---|
| Canvas | `surface.canvas` cream | `map.canvas` rock-black |
| Text | ink | rock-light |
| Borders | 1px ink hairline | 1px rock hairline |
| Accent | forest | forest (selected pin, locate) |
| Type | Fraunces titles, Inter body | Inter only |
| Density | dense rows for lists; generous for pages | dense |
| Colour | type colours on tags only | type colours on pins only |
| Character | START face, first-run, milestones, passport | never |

Floating elements over the map (peek card, controls, cluster discs) are paper objects placed on rock: cream, hairline, `shadow.raised`. That is the only place the two meet, and it is where the contrast does its work.

### 1.3 What is explicitly excluded

Rounded display faces; pills on anything but chips and the primary button; shadows on cards, tiles or rows; tinted icon tiles; ambient glows; light basemaps; textures on surfaces; hero-sized character art in product; full-bleed photos on cards; region-coloured anything; emoji as icons; a third type family; instructional banners; a legend panel.

---

## 2. Design tokens

### 2.1 Architecture

Three layers. Components reference **only** the third.

1. **Primitives** — raw ramps, named by hue and step. Never used in component CSS.
2. **Semantic roles** — `category.property.modifier` (e.g. `color.text.muted`, `color.border.strong`, `shadow.overlay`). Themed: the same role resolves differently on paper and rock.
3. **Component tokens** — only where a component needs a value that is not a plain role (e.g. `pin.size.city`). Kept to a minimum.

Storage: one source file `design/tokens.json` (W3C Design Tokens format) generates `css/tokens.css` (custom properties) for the web and is consumed directly by the native app later. Until a build step exists, `css/tokens.css` is hand-maintained and `tokens.json` mirrors it; the two must not drift.

CSS naming: `--{category}-{property}-{modifier}` (e.g. `--color-text-muted`). Theme scoping: `:root` carries paper values; `[data-theme="rock"]` (applied to the map region only) overrides the surface, text and border roles.

### 2.2 Primitives

Warm neutrals (paper → rock), 12 steps, OKLCH-generated, validated for APCA contrast between step pairs 1/11, 2/11, 3/12, 9/1.

```
paper.0  #FFFDF8   paper.6  #BFB7A6
paper.1  #F9F6EE   paper.7  #9C9484
paper.2  #F4F1EA   paper.8  #6F6A5E
paper.3  #ECE7DC   paper.9  #4A463E
paper.4  #E2DCCE   paper.10 #2F2C27
paper.5  #D5CEBE   paper.11 #1B1916
```

Ink (text and hairlines on paper):

```
ink.12 #22312A   ink.9 #5E6E64   ink.7 #8A968E   ink.4 #C6CDC8
ink.alpha.08  rgba(34,49,42,0.08)
ink.alpha.20  rgba(34,49,42,0.20)
ink.alpha.40  rgba(34,49,42,0.40)
```

Rock (map neutrals):

```
rock.0 #1B1916   rock.3 #35312B   rock.6 #7A7366   rock.9 #F1EDE4
rock.1 #23211D   rock.4 #433E36   rock.7 #A39C8F
rock.2 #2B2823   rock.5 #5A544A   rock.8 #CFC8BA
```

Forest (UI accent):

```
forest.1 #EEF4EF  forest.4 #9DBFA9  forest.7 #2F6B4F  forest.9 #1B4231
forest.2 #DCE8DF  forest.5 #6FA184  forest.8 #245640  forest.10 #122D22
forest.3 #BFD5C6  forest.6 #4C8767
```

Mustard (START, stamps, celebration):

```
mustard.1 #FCF5E1  mustard.3 #F2D98F  mustard.5 #E9B53B  mustard.7 #A47A14
mustard.2 #F8E9BF  mustard.4 #EBC65E  mustard.6 #C9971F  mustard.8 #7A5A0F
```

Climb-type hues (three, distinct from the accent):

```
ember.3 #F5C4AC   ember.5 #E2793F   ember.7 #B85A28      (boulder)
lake.3  #BFD7E6   lake.5  #3F7FA6   lake.7  #2C5C7A      (top rope)
plum.3  #DCC4D9   plum.5  #8A4E7A   plum.7  #63365A      (lead)
```

Status:

```
brick.5 #B8452B  brick.1 #FBEAE5     (danger)
```

Stamp ink: `stamp.red #C8322B` (used only by the stamp component and share card).

Primitive values may be regenerated for contrast, but the *roles* below must keep their meaning.

### 2.3 Semantic roles — colour

Paper theme (`:root`):

```
--color-surface-canvas      paper.2     page background
--color-surface-default     paper.0     cards, sheets, panels
--color-surface-subtle      paper.1     grouped list backgrounds, table stripes
--color-surface-raised      paper.3     selected row, hover on dense rows
--color-surface-inverse     rock.0      tooltips, the map region

--color-text-primary        ink.12
--color-text-secondary      ink.9
--color-text-muted          ink.7       captions, placeholders (≥ 4.5:1 on paper.0 only at 12px+ regular; use ink.9 below that)
--color-text-inverse        rock.9
--color-text-link           forest.7
--color-text-on-accent      paper.0
--color-text-on-mustard     ink.12

--color-border-subtle       ink.alpha.20   default hairline
--color-border-strong       ink.12         primary button, selected card, focused input
--color-border-divider      ink.alpha.08   inside grouped lists

--color-accent-solid        forest.7
--color-accent-hover        forest.8
--color-accent-pressed      forest.9
--color-accent-subtle       forest.1       selected chip background, active tab tint
--color-accent-text         forest.8

--color-highlight-solid     mustard.5      START, stamp field, celebration
--color-highlight-subtle    mustard.1
--color-highlight-text      mustard.7

--color-status-success      forest.6       --color-status-success-subtle forest.1
--color-status-warning      mustard.6      --color-status-warning-subtle mustard.1
--color-status-danger       brick.5        --color-status-danger-subtle  brick.1
--color-status-info         lake.5         --color-status-info-subtle    lake.3

--color-focus-ring          forest.5
```

Rock theme (`[data-theme="rock"]`, the map region and its controls):

```
--color-surface-canvas      rock.0
--color-surface-default     paper.0    floating cards over the map stay paper
--color-surface-subtle      rock.1
--color-surface-raised      rock.2
--color-text-primary        rock.9
--color-text-secondary      rock.7
--color-text-muted          rock.6
--color-border-subtle       rock.3
--color-border-strong       rock.9
```

Climb types (never re-used for any UI meaning):

```
--color-type-boulder        ember.5    --color-type-boulder-subtle ember.3
--color-type-toprope        lake.5     --color-type-toprope-subtle lake.3
--color-type-lead           plum.5     --color-type-lead-subtle    plum.3
```

Provenance (quiet by design; text-only roles, no fills):

```
--color-provenance-community    ink.7     "community-added"
--color-provenance-verified     forest.6  "community-verified", "verified"
--color-provenance-pending      mustard.7 moderator-only surfaces
```

Map:

```
--map-canvas                rock.0
--map-pin-outline           ink.12
--map-pin-selected-ring     forest.5
--map-pin-saved-ring        mustard.5
--map-pin-climbed-ring      forest.6
--map-pin-checkedin-fill    forest.7      inner dot
--map-cluster-fill          paper.0
--map-cluster-text          ink.12
--map-cluster-border        ink.12
--map-label-text            rock.8
--map-control-surface       paper.0
--map-control-border        ink.alpha.20
```

Interaction states, expressed as modifiers rather than separate colours: `hover` uses `surface.raised` on rows and `accent.hover` on filled buttons; `pressed` uses `accent.pressed` and a 0.98 scale; `disabled` uses 40% opacity, never a grey; `focus-visible` uses a 2px `focus-ring` outline offset 2px.

### 2.4 Semantic roles — typography

```
--font-display   "Fraunces", Georgia, "Times New Roman", serif
--font-text      "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif
--font-features-numeric  "tnum" 1, "lnum" 1

--type-display-xl   40px / 44px / 600 / -0.01em   (desktop gym & region titles)
--type-display-lg   28px / 32px / 600 / -0.005em  (mobile page titles, desktop section heroes)
--type-display-md   22px / 28px / 600            (card-group headings, sheet titles)
--type-display-sm   18px / 24px / 600            (smallest serif; gym name on photo card)
--type-text-lg      16px / 24px / 400            (page body)
--type-text-md      14px / 20px / 400            (interface default)
--type-text-sm      13px / 18px / 400            (meta, secondary)
--type-caption      12px / 16px / 500            (labels, timestamps)
--type-micro        11px / 14px / 600            (type tags, count badges only)
--type-label        12px / 16px / 600 / +0.02em  (section labels, sentence case)
```

Weights available: Fraunces 500, 600 (never 700 in product); Inter 400, 500, 600 (never 700 in product). Text weights 500/600 are for emphasis and controls; body is always 400.

### 2.5 Spacing, radii, shadows, motion, sizes

```
--space-1 4px  --space-2 8px  --space-3 12px  --space-4 16px
--space-5 24px --space-6 32px --space-7 48px  --space-8 64px

--radius-sm 6px   inputs, tags, thumbnails
--radius-md 10px  buttons, dense-row thumbnails, small cards
--radius-lg 14px  cards, popovers, peek card
--radius-xl 20px  sheets, dialogs
--radius-pill 999px  filter chips, primary button, START only

--shadow-raised   0 2px 8px rgba(27,25,22,0.14), 0 1px 0 rgba(27,25,22,0.06)
--shadow-overlay  0 20px 48px -16px rgba(27,25,22,0.32), 0 4px 12px rgba(27,25,22,0.10)

--motion-fast 120ms   hover, pressed
--motion-base 180ms   state changes, chip toggles
--motion-slow 240ms   sheet snap, popover open
--motion-reveal 320ms stamp landing, milestone sheet (the only two "expressive" motions)
--ease-standard cubic-bezier(0.2, 0, 0, 1)
--ease-out      cubic-bezier(0, 0, 0.2, 1)
--ease-stamp    cubic-bezier(0.34, 1.4, 0.64, 1)   overshoot, stamp landing only

--size-touch-min 44px
--size-row-dense 56px
--size-thumb-dense 40px
--size-tabbar 84px (56px + safe-area)
--size-topbar-desktop 64px
--size-start-button 60px
--size-mascot-spot 96px  (max in-product character size except milestone sheet)
--size-mascot-milestone 160px
```

Component tokens (the short list that earns them):

```
--pin-size-city 16px      --pin-size-dot 6px      --pin-zoom-dot-max 11
--cluster-size 32px       --cluster-max-zoom 15   (force individual pins above)
--sheet-snap-peek 18%     --sheet-snap-half 52%   --sheet-snap-full 92%
--card-photo-ratio 4 / 3  --hero-photo-ratio 16 / 9
```

### 2.6 Native-app consumption

`tokens.json` uses `$type` and `$value` per the W3C format with `paper` and `rock` as theme sets; iOS reads it into a `Color`/`Font` extension, Android into a `MaterialTheme` override. Nothing in the role layer is web-specific: no `rem`, no `vw`, no CSS shorthand. Shadows are expressed as `{offsetY, blur, spread, color}` objects in JSON and compiled to CSS strings.

---

## 3. Typography

**Fraunces** is the display voice and appears only at `display-sm` (18px) and above, in weight 500 or 600, for: the wordmark, page titles (gym, region, city, profile, log), section heroes ("84 gyms in view · Sydney"), the gym name on photo cards, sheet titles, the stamp text and share card, and the number on stat tiles. Optical size axis left at auto. Never in buttons, chips, labels, table cells, inputs, or any text below 18px. Never italic in product.

**Inter** carries everything else: navigation links, buttons, chips, body, meta, captions, tables, forms, the dense row (name at `text-md` 600, meta at `text-sm` 400). `font-feature-settings: "tnum", "lnum"` is set on any element that shows a number that can change (counts, distances, prices, grades, dates, times, stats). Letter-spacing is 0 except `type-label` (+0.02em) and `display-xl` (−0.01em).

**Scale** is the ten steps in §2.4. Line-heights are fixed pixels, not unitless, so rows and rhythm stay predictable. No sizes outside the scale; if one seems needed, the layout is wrong.

**Weights:** body 400; emphasis and controls 500/600; display 600, 500 for large hero numbers. 700 does not exist in the product.

**Fallbacks:** Fraunces → Georgia → serif; Inter → system-ui stack. Fonts load via Google Fonts `css2` with `display=swap` and only the weights listed (Fraunces 500/600 with the `opsz` axis; Inter 400/500/600). `font-synthesis: none`. For the native app the same two families are bundled.

**Retired:** Space Grotesk (all uses become Inter 600 or Fraunces per the rules above), Space Mono (all uses become Inter with tabular figures). `--font-mono` is deleted from the tokens.

---

## 4. Shape, surface and depth

### 4.1 Radius

Four values from one factor, applied by element class:

| Radius | Elements |
|---|---|
| 6px `sm` | inputs, textareas, selects, type tags, dense-row thumbnails, static map thumbnails, provenance marks |
| 10px `md` | secondary and tertiary buttons, icon buttons, small cards (stat tiles), popovers ≤ 240px wide |
| 14px `lg` | photo cards, peek card, region cards, panels, popovers > 240px |
| 20px `xl` | bottom sheet (top corners), dialogs, side sheets |
| pill | filter chips, applied-filter chips, the primary button, the START button, avatars (circular) |

Nested radii step down one level (a 14px card contains 10px buttons and 6px inputs). Nothing is fully rounded except the pill list and circular avatars. Checkboxes are 4px (outside the scale, platform convention); switches are pill by platform convention.

### 4.2 Hairlines

Default border is 1px `color.border.subtle` (ink at 20%). `color.border.strong` (full ink, still 1px) marks: the primary button outline, the selected card or row, a focused input (in addition to the focus ring), the peek card. 1.5px does not exist in product; the concept boards' 1.5px is normalised to 1px + strong colour. Dividers inside grouped lists use `border.divider` (8%). Borders are never coloured with the accent except on the selected map pin ring.

### 4.3 Shadows

Exactly two:

- `shadow.raised` — floating objects over the **map only**: the peek card, the map control stack, the "Search as I move" toggle, the mobile search field over the map. Not on anything on paper.
- `shadow.overlay` — sheets (bottom and side), dialogs, popovers/menus.

Forbidden: shadows on cards, rows, tiles, buttons, chips, inputs, the top bar, the tab bar (it uses a top hairline), section panels, or any element on a paper surface. Hover states change surface colour or border, never elevation.

### 4.4 Surfaces

Paper surfaces are flat. No gradients, no noise, no grain, no texture. The contour-line texture is a component (the placeholder and the passport background), not a surface treatment. Rock surfaces are flat too; the map style provides all texture.

---

## 5. Colour

### 5.1 Hierarchy

1. **Cream** — `surface.canvas` `#F4F1EA` and `surface.default` `#FFFDF8`. Every document.
2. **Rock-black** — `map.canvas` `#1B1916`. The map region and the controls physically inside it. Also `surface.inverse` for tooltips.
3. **Forest green** — the single UI accent. Primary button fill, active tab underline, selected chip fill, selected pin ring, focus ring (lighter step), links.
4. **Mustard** — START button fill, the stamp field on the passport, the celebration sheet's title colour and confetti-free highlight, the saved-pin ring. Nowhere else.
5. **Climb types** — ember orange (boulder), lake blue (top rope), plum (lead). On pins and type tags only. Never on buttons, headings, backgrounds or status.
6. **Ink** — `#22312A`. All text on paper, all hairlines (via alpha), the pin outline, the cluster count.

### 5.2 Rules

- Components use roles, never primitives. A grep for `#` in component CSS should return zero hits outside `tokens.css`.
- One filled-accent action per surface. If a second primary button appears on one screen, one of them is wrong.
- Status colours appear only in status components (inline validation, toasts, the open/closed dot, provenance text). Success is not the accent; it happens to share a hue family and that is acceptable because it never fills a button.
- The region palette (`--au-nsw`, `--de-bayern`, all 60+ `--xx-yyy` variables and the `--chip` custom property mechanism) is deleted. Region is text.
- Dark mode for paper surfaces is out of scope for this redesign; the rock theme exists only for the map. A future full dark theme derives from the same ramps read in reverse.

### 5.3 Contrast targets

Text ≥ 4.5:1 (APCA Lc 60 preferred) at all sizes; large display ≥ 3:1. `text.muted` on `surface.canvas` passes only at 12px 500 or larger; below that use `text.secondary`. Type-colour tags carry a text colour of the type's step 7 on step 3 background, which passes; never white text on step 5.

---

## 6. Navigation and information architecture

### 6.1 Areas

| Area | Desktop | Mobile | Auth |
|---|---|---|---|
| **Explore** `/` | split map + list | full-bleed map + sheet | public |
| **Regions** `/in/…` | index of countries → regions → cities, each a page | same pages, single column | public |
| **Gym** `/gym/{slug}` | page | page | public |
| **Log** `/log` | page (calendar + sessions) | page | signed in |
| **Me** `/me` | page with sections: Saved · Climbed · Passport · Settings | page | signed in |
| **START** | not a nav item (action available on gym pages and Log) | raised centre button → log/check-in sheet | signed in |
| **Add a gym** `/add` | page on desktop | full-screen sheet | signed in |
| **Moderation** `/mod` | page, dense rows, desktop-first | works but not optimised | moderators |
| About / Privacy / Terms | pages, footer links | pages | public |

Passport is a section of Me at `/me/passport` at launch, not a top-level area; it graduates to a tab only if usage justifies it. Public profiles (`/u/{handle}`) are deferred pending the open decision on handles; `/me` is private.

### 6.2 URL scheme

```
/                              explore (map+list); state in query: ?q=&c=lng,lat,z&t=boulder,toprope&open=1&saved=1
/gym/{slug}                    slug = kebab(name)-kebab(suburb), unique; stored in spots.slug
/in/{country}                  country code lowercase, e.g. /in/au
/in/{country}/{region}         region code lowercase, e.g. /in/au/nsw
/in/{country}/{region}/{city}  city slug, e.g. /in/au/nsw/sydney
/log                           /log/{session-id} for a session detail
/me  /me/saved  /me/climbed  /me/passport  /me/settings
/add                           /gym/{slug}/edit  /gym/{slug}/report
/mod
/about  /privacy  /terms
```

Routing is History API (`pushState`) with a hash fallback (`/#/gym/slug`) when the host cannot rewrite unknown paths to `index.html`. Every page sets `document.title` and `<link rel="canonical">`; gym and region pages render their content into the same shell. Back from a gym page returns to the explore state that was left (query preserved).

### 6.3 What is a page, sheet, dialog, inline or overlay

- **Page:** gym, region, city, log, me and its sections, add-gym (desktop), moderation, legal, about.
- **Sheet:** the mobile list/peek (bottom, persistent, three snaps); All filters (bottom on mobile, side on desktop); log a session / check in (bottom on mobile, dialog on desktop); add-gym on mobile (full-height sheet); sign-in prompt when an action needs it.
- **Dialog:** confirmations (delete a session, reject a submission), sign-in on desktop, share card preview. Never stacked.
- **Inline:** save/climbed toggles, chip toggles, sort, expanding hours, "Know the hours? Add them" prompt, report a problem (expands a small form on the page, does not navigate).
- **Map overlay:** peek card, control stack, "Search as I move" toggle, mobile search field, cluster/pin labels. Nothing else floats on the map.

### 6.4 Desktop navigation

A 64px cream top bar with a bottom hairline: wordmark left (retro icon 28px + "Bouldeer" in Fraunces 600 22px), four text links (Explore · Regions · Log · Me) in Inter 500 14px with a 2px forest underline on the active one, a search field (pill, 1px hairline, placeholder "Search gyms, cities, regions", max-width 480px, expands to a results panel — see §9), and on the right a secondary "Add a gym" button and a 32px circular avatar (the user's photo; the flat-vector deer head if none). No count badge, no kebab, no character in the bar besides the icon in the wordmark. Signed-out: the avatar becomes a text link "Sign in". The tagline is gone.

### 6.5 Mobile navigation

An 84px tab bar (56px content + safe-area) on cream with a top hairline: Explore (map icon) · Regions (grid icon) · **START** · Log (book icon) · Me (person icon). Labels always visible, 11px 500, active item in forest with a 600 label. START is a 60px mustard disc with a 1px ink border, raised 26px above the bar, carrying the flat-vector deer head at 44px; its label reads "Log". Tapping START opens a sheet with two actions: "Check in here" (if a gym is selected or nearby) and "Log a session". The tab bar hides while the bottom sheet is at the full snap.

### 6.6 Removed navigation

Header count badge, kebab/"more" menu, Legend panel, hint banner, Saved and Logbook modals, the Pending-review header button (moves to `/mod`, reachable from Me for moderators), About/Privacy/Terms in the header (move to the footer of pages and the Me screen).

---

## 7. Explore, map and list

### 7.1 Desktop layout (≥ 1024px)

Top bar; below it a two-pane layout: list pane 460px on the left (paper theme), map filling the rest (rock theme). At ≥ 1440px the list pane may grow to 520px. No sidebar drawer, no hamburger.

List pane, top to bottom: chip row (horizontal scroll, no wrap), a status line, then the list. The status line reads `**84** gyms in view · Sydney` (count in 600, tabular) with a sort control on the right (Distance · Name · Recently added). When location is unknown, sort defaults to Name and the status line omits the city.

### 7.2 Viewport scoping

The list shows only gyms whose coordinates are inside the current map bounds (padding 0). It re-filters on `moveend`, debounced 150ms. The "Search as I move the map" toggle (top-centre of the map, paper chip with `shadow.raised`) defaults on; when off, a "Search this area" button appears after a pan. The count is always the scoped count. When the viewport contains more than 400 gyms the list shows the first 400 by the active sort with a final row "Zoom in to see all 1,204" — never an infinite alphabetical dump.

### 7.3 Synchronisation

Hover a row → its pin gets the selected ring and scales to 20px; hover a pin → its row gets `surface.raised`. Click a pin → peek card opens over the map, the row scrolls into view and gets the selected border. Click a row → map flies to the gym at max(current, 13), pin selected, peek card opens. Selection persists through zoom until dismissed (Esc, close, click on empty map). Keyboard: rows are focusable buttons; Enter opens the peek card; arrow keys move between rows; Esc closes the peek.

### 7.4 Row and card modes

**Dense row** (default, `--size-row-dense` 56px): 40px thumbnail (photo or placeholder, radius 6) · name (text-md 600, single line, ellipsis) · meta line (text-sm secondary: `Suburb · Region` on one line; type tags as 6px dots before the suburb, not text, when space is tight) · right column: distance (tabular) and the save toggle (28px icon button, 44px hit area). Provenance mark: a 6px ring-dot after the name for community-added (grey) or community-verified (forest); verified shows nothing. Rows are separated by `border.divider`; no card chrome.

**Photo card** (opt-in): 4:3 photo or contour placeholder with radius 14 on top; below: name (display-sm Fraunces), `Suburb, City · distance`, type tags, and a footer line with the open/closed dot and hours or price when present. Cards sit in a single column in the 460px pane, two columns at ≥ 1440px.

**Toggle:** a segmented control at the end of the chip row (list icon · grid icon), remembered in `localStorage`. Default is rows. The photo-card mode is intended for a first look at a new city, not for working through 300 results; the count line stays visible in both modes.

### 7.5 Search (summary; full spec in §9)

The top-bar field on desktop and the map-top field on mobile. Selecting a city/region/country result recentres the map to that area's fly target and sets a region pill in the chip row ("Sydney ×"). Selecting a gym opens its peek card and centres on it.

### 7.6 Filter chips and the All Filters sheet

Chip row order: Boulder · Top rope · Lead · Open now (only once hours data exists — until then omitted, not disabled) · Saved · Climbed · Checked in · Has photos · **All filters**. Type chips are multi-select and default to all three on (rendered unselected until the user narrows; the "all on" state shows no selected chips). Chips: pill, 32px tall, text-sm 500, 1px hairline; selected = forest fill, paper text. Applied filters that live in the sheet appear as removable pills after the fixed chips.

All filters sheet (side sheet 400px on desktop, bottom sheet on mobile): sections Type, Marks, Photos, and later Facilities; a footer with "Reset" (tertiary) and the primary "Show 84 gyms" whose count updates live. "Clear filters" also appears in the list's filtered-empty state.

### 7.7 Pins

Pin shape: a teardrop 16 × 21px (viewBox 24 × 32) filled with the climb-type colour (first type in the gym's array; multi-type gyms use boulder if present, else top rope), 1px ink outline, a 4px paper dot at the centre. Below zoom `--pin-zoom-dot-max` (11) pins render as 6px filled circles with a 1px ink outline and no drop. At zoom ≥ 14, pins carry a paper label pill with the gym name (Inter 500 12px) if it does not collide (MapLibre symbol collision handles this when pins move to a symbol layer; until then, labels only on selected/hovered).

States, applied as rings outside the outline: **selected** 2px forest ring + scale to 20px + label; **saved** 2px mustard ring; **climbed** 2px forest.6 ring; **checked-in** the centre dot becomes forest.7. Combined states stack in the order selected > saved > climbed. Hover = selected ring without the label.

### 7.8 Clusters

supercluster with radius 48, `maxZoom` 15 so individual pins are guaranteed above it. Cluster disc 32px (40px above 99 items) paper fill, 1px ink border, ink count in Inter 600 tabular. No colour by content. Click zooms to the cluster's expansion zoom. The 41 groups of identical coordinates in the data become a spread cluster at `maxZoom` via a 2m deterministic jitter applied at paint time, not in the database.

### 7.9 Mobile layout (< 1024px)

Full-bleed map behind everything. Over the map: the search field (paper pill, `shadow.raised`, 48px tall, 16px from the top safe-area) with a locate icon on its right; below it the chip row (horizontal scroll, padding 16px). The control stack (locate, style) sits right, above the sheet's peek edge.

The **bottom sheet** is paper, radius 20 top corners, 1px top hairline, a 36 × 4px grabber, and it never dismisses. Snap points: **peek** 18% (status line + first row visible), **half** 52% (default after a search or region selection), **full** 92% (tab bar hides; a close-chevron appears top-right). Dragging down collapses only when the inner list is scrolled to top. Tapping a pin sets the sheet to peek and shows a horizontal carousel of photo cards for the tapped cluster or the single tapped gym; swiping the carousel changes the selected pin; tapping the card opens the gym page. The list inside the sheet defaults to dense rows; the first four items after a fresh search render as photo cards, then rows.

A "Map / List" pill toggle is not used; the sheet's snap points do that job.

### 7.10 Loading, empty and no-photo

Loading: six skeleton rows (or three skeleton cards in card mode) mirroring the row layout; pins fade in at 60% opacity until data arrives; the count shows "…". No spinner, no character.

Empty in viewport: "No gyms in this area yet" + two secondary buttons, "Zoom out" and "Add a gym". Empty from filters: "No gyms match" + "Clear filters". Empty from search: "Nothing for 'xyz'" + "Search a city instead". First-ever visit with location denied and no data: the only empty state that shows the character (traveller pose, 96px) with "Where are you climbing?" and the search field focused.

No photo: the contour placeholder (§13).

---

## 8. Gym detail page

### 8.1 Data reality

`spots` today: name, suburb, state, country, lat, lng, types[], notes?, photo?, address?, community, edited, status, timestamps. Proposed additive columns for later phases: slug (Phase 3, required), website, instagram, hours (jsonb), day_pass_price, currency, facilities (text[]). Everything below that references a field which does not yet exist must render nothing until it does.

### 8.2 Hierarchy

**Header (always):** breadcrumb `Country › Region › City` (text-sm, links to region/city pages) · name (display-xl desktop / display-lg mobile) · one meta line: type tags, `Suburb, City`, distance if known, open/closed dot + hours summary if hours exist · provenance line (text-sm, quiet: "Community-verified · added by mika.sends · edited 3 days ago") · action row: **Save** (secondary) · **Climbed** (secondary) · **Check in** (primary) · **Directions** (secondary). On mobile the action row is sticky at the bottom above the safe area; on desktop it sits right of the title.

**Hero (conditional):** one photo at 16:9, radius 14, max-height 360px, only if a photo exists. No placeholder hero — with no photo the header simply sits on the canvas and the page is shorter. No mosaic.

**Essentials (conditional per row):** a two-column desktop layout with a 320px right column holding a single "Essentials" panel (paper.0, hairline, radius 14) whose rows appear only when data exists: day pass, grades on the wall (from routes), new-set day, hours (collapsible weekly table, today emphasised), address (text + a 120px static map thumbnail, always present since coordinates always exist), website / Instagram. If only the address row exists, the panel is just the address and map thumbnail — still intentional. Below the panel: "Your history here" (sessions, best send, last visit, check-ins) for signed-in users with any data at this gym; hidden otherwise.

**Body sections (each conditional):** Facilities (icon + label chips, hairline, radius 10); About (notes, prose at text-lg, 64ch max); On the wall (grade distribution bar + count + "Log a climb here", only when routes exist); Nearby (a horizontal strip of up to 4 photo cards from the same city, always present when the city has ≥ 2 gyms); Community (contributor attribution, edit count, and the three actions: Suggest an edit · Add a photo · Report a problem).

**The one contribution prompt:** when the page has no hours, no price and no photo, a single inline prompt appears directly under the header meta line: "Been here? Add the hours, a photo or the day-pass price." → opens the edit sheet pre-scrolled to those fields. It appears once per page, never as a section, and never on a page that already has all three.

**Minimum page (name, location, types only):** breadcrumb, name, meta line with type tags and suburb, provenance line, action row, the single prompt, an Essentials panel containing only the address/map thumbnail, Nearby, Community. That page is complete, not empty.

### 8.3 Responsive behaviour

≥ 1024px: 1120px max content width, two columns (main 1fr, aside 320px), 48px gutters. 768–1023px: single column, aside panel moves under the header, action row inline. < 768px: single column, 16px gutters, sticky bottom action row (four 44px buttons; labels shrink to icons + label under 360px), hours collapsed by default, Nearby becomes a horizontal scroll.

---

## 9. Search

### 9.1 Scope and matching

One index over four entity types: gyms (name, suburb, address), cities (from `suburb` grouped by city where a city field exists; until then suburbs act as cities), regions (`STATES_BY_COUNTRY` labels), countries (`COUNTRY_LABELS`). Matching is case- and diacritic-insensitive, prefix on word starts, and runs over both the English label and the local name where the data has one (e.g. "Tokyo" and "東京", "Munich" and "München"; the region tables gain an optional `local_name`). Codes are searchable too ("NSW", "JP").

### 9.2 Results

Grouped sections in fixed order with a maximum per group: **Cities** (5) · **Regions** (3) · **Countries** (2) · **Gyms** (8). Each row: an icon by type, primary label, secondary label (`Region · Country` for places; `Suburb · City` for gyms) and a count for places ("42 gyms"). Keyboard: arrow keys move, Enter selects, Esc closes. Recent searches (up to 5, local) show when the field is focused and empty. No results: "Nothing for 'xyz' — try a city or country."

### 9.3 Behaviour

Selecting a place flies the map to that place's bounds (countries use `COUNTRY_FLY_TARGETS`; regions and cities compute bounds from their gyms) and adds a removable region pill to the chip row; the URL gains `?q=`. Selecting a gym centres and opens its peek card on Explore, or navigates to `/gym/{slug}` when searching from any other page. Desktop: results in a popover under the field (radius 14, `shadow.overlay`, max-height 60vh). Mobile: the field expands to a full-height sheet with the keyboard up; results fill it; the sheet closes on select.

Debounce 120ms; the index is built once after `loadSpots()` and rebuilt when spots change.

---

## 10. Community and provenance

### 10.1 States

- **community-added**: submitted by a user, approved by a moderator, not yet corroborated. Mark: grey ring-dot (`provenance.community`), page text "Community-added".
- **community-verified**: two or more distinct contributors have edited or confirmed it, or a moderator has explicitly confirmed. Mark: forest ring-dot, page text "Community-verified".
- **verified**: confirmed by the gym itself or by a moderator with a source. Mark: none on the card (verified is the quiet default), page text "Verified".
- **pending** (moderator-only): shown only in `/mod` and to the submitter on their own submission, mustard text.

Seed-imported gyms start as community-added, which is honest. The state is derived from `spots.community`, `spots.edited`, a new `spots.verified_at`, and a contributor count from `pending_edits` history; no new enum is needed initially.

### 10.2 Card and page indicators

Card: the 6px ring-dot after the name, with a `title`/`aria-label` naming the state. Nothing else; no badge, no colour fill. Page: one text-sm line under the meta line: `{state} · added by {name or "a climber"} · last edited {relative time} · {n} contributors`. Contributor attribution uses the user's display name if they have set one, otherwise "a climber"; never an email.

### 10.3 Add a gym

Two steps. **Step 1 (30 seconds):** drop or confirm the pin (map with a centre crosshair; "Use my location"), name, climb types. Submit → "Thanks — it's in review. We'll show it once a moderator has checked it." **Step 2 (optional, same flow):** suburb/city (pre-filled by reverse geocode when available), address, website, photo link, notes. The "Still needed" hint from the current form is kept but only for step 1's three fields. Sign-in is required and requested at the moment of submitting, not on opening. The character does not appear.

### 10.4 Edit a gym

Opens as a sheet from the gym page with the current values, a required one-line "What changed and how do you know?" field (max 200 chars), and an optional "Please double-check this" toggle. Low-risk fields (hours, price, links, photo) publish immediately and are flagged for review; identity fields (name, location, types) and deletions go to the pending queue. The gym page keeps showing current data for queued edits, with "an edit is awaiting review" visible only to the editor.

### 10.5 Moderation (`/mod`)

Dense rows, paper theme, desktop-first. One unified queue: kind (new gym / edit / report) · gym · contributor and their level · age · actions. Edits open a side panel with a field-by-field diff (old → new), the contributor's note, and Approve / Reject / Edit-and-approve. Keyboard: A approve, R reject, J/K move. Escape closes the panel and nothing else — the current Escape-triggers-reject bug must be fixed before this surface is restyled. Rejection asks for a one-line reason that is stored and shown to the submitter. No character anywhere on `/mod`.

### 10.6 Trust levels (light, first release)

Contribution points are counted (new gym 15, photo 5, edit 5, confirm 1) and a level is shown on the profile and in the moderation queue; nothing is gated by level yet. A "Contributor" word (no badge art) appears on the profile from level 3. Points are removed if content is rejected or taken down.

---

## 11. Check-in, passport and stamp

### 11.1 Flow

**Gym page → Check in** (primary action; requires sign-in; enabled when the device is within 500m or the user confirms "I'm here" on desktop) → a bottom sheet (dialog on desktop) with the gym name, today's date, an optional note (140 chars), an optional photo, and one primary button **Stamp it**. → **Stamp landing:** the sheet's header area shows the stamp animating in (scale 1.3 → 1 with `ease-stamp`, 320ms, a 6° rotation settled from 12°), reduced-motion shows it static. → **Passport line:** under the stamp, one sentence generated from data: "Your 11th visit here" / "Your first gym in Tokyo" / "3rd city this year". → two actions: **Log this session** (opens the session form pre-filled with this gym) and **Share** (opens the share-card preview). → Done returns to the gym page, where the action button now reads "Checked in today".

### 11.2 Data

New table `checkins (id uuid pk, user_id uuid fk, spot_id text fk, checked_at timestamptz default now(), note text check (length ≤ 140), photo text, created_at)`, RLS owner-only read/write like `marks`, index on `(user_id, checked_at desc)` and `(spot_id)`. Not overloaded onto `marks` because check-ins are repeatable and timestamped. A check-in also inserts a `climbed` mark if absent. Milestones are computed client-side from the user's check-ins at stamp time (counts per gym, distinct cities, distinct countries, first-in-city, first-abroad relative to the user's home country); no achievements table is required for the first release.

### 11.3 Passport (`/me/passport`)

A paper page with a subtle contour background (the one permitted surface texture, because this page *is* the passport). Header: "Passport" (display-lg), a stat line "11 gyms · 4 cities · 2 countries". Body: **Stamps** — a grid of city stamps (one per distinct city, most recent first), each a circular ink stamp with the city name arched, the gym count and the first date; **Recent check-ins** — dense rows (gym, city, date, note snippet). Tapping a city stamp filters the rows. The traveller pose (96px) appears only when there are zero check-ins, with "Your first stamp is one check-in away."

### 11.4 Stamp visual

An SVG component, ink-only (`stamp.red` on paper, or ink on cream for the passport grid): two dashed concentric rings, the gym or city name arched at the top in Fraunces 600 caps with 3px tracking, the date in Inter 600 caps at the bottom, and the flat-vector stamp head in the centre. Rendered slightly rotated (−8° to +8°, seeded by the gym id so it is stable). The stamp is the only component allowed to use uppercase display text.

### 11.5 Share card

A 1080 × 1350 image generated on a canvas element: cream background, the stamp large, the gym name in Fraunces, the city and date, "Bouldeer" wordmark bottom-right at 5% width. Optional user photo above the stamp at 4:3 if one was attached. Shared via the Web Share API when available, otherwise downloaded. No feed, no likes, no follower graph — the card leaves the product.

---

## 12. Mascot

### 12.1 Assets to produce (flat vector, priority order)

1. **Head** — the peek-over-the-boulder face, cropped at the rim, in colour and in single-ink. Uses: app icon (composited on the retro sunset ground), START button (44px), default avatar (32/40px), favicon (16px mono).
2. **Stamp head** — ink-only head simplified to two weights of line, no shading. Uses: stamp component, share card, passport grid.
3. **Topped-out** — full body, arms up, flag. Uses: milestone sheet only.
4. **Chalking-up** — full body, seated. Uses: long loads (> 2s) and the first-run empty Log.
5. **Traveller** — full body with crash pad and case. Uses: first-run Explore with no location, empty passport, new-city prompt.

Marketing and sticker assets, not built into the product: dyno, heel hook, fell off, rest day, high five. The Higgsfield renders are the reference for redrawing; the product uses the flat-vector versions so the brand assets are style-stable.

### 12.2 Placement rules (enforced)

Allowed: app icon; START button; default avatar; first-run empty states for Explore (no location), Log (no sessions) and Passport (no check-ins); milestone celebration sheet; passport stamp; share card; onboarding screens of the native app; marketing pages.

Forbidden: forms and inputs; filters; sign-in; moderation; errors and toasts; the map canvas, pins, clusters, labels; gym, region and city pages; desktop top bar (beyond the wordmark icon); any empty state after the user has ever had content there; anywhere twice on one screen; hover or tap "reactions".

Scale: 96px maximum in product (`--size-mascot-spot`), except the milestone sheet at 160px; always narrower than the primary action row beneath it.

Motion: the stamp landing and the milestone reveal only (320ms, `ease-stamp` / `ease-out`, both replaced by an instant state under `prefers-reduced-motion`). The START face does not animate on tap; the button itself uses the standard pressed scale.

### 12.3 Milestone sheet (the Companion contribution)

A bottom sheet (dialog on desktop) over a dimmed page: the topped-out character breaking the top edge of the sheet at 160px, a title in Fraunces 600 26px in `highlight.text` ("First V6" / "10 gyms" / "First stamp abroad"), one sentence of data, up to three milestone marks as 44px ink-outline glyphs, and two actions (Share card · Done). Triggers: first check-in; every 5th distinct gym; first gym in a new country; a new highest grade in the log. Never more than one per session; if several trigger, show the highest and list the others in one line.

---

## 13. Photography and placeholder system

- **Crops are fixed.** Cards 4:3, hero 16:9, dense-row thumbnail 1:1, avatar 1:1. `object-fit: cover`, never stretched, never letterboxed.
- **No full-bleed hero cards.** Photos sit inside the card's radius with the card's own padding rules (the concept boards' 8px inset is not used; the photo meets the card edge at the top with the card radius, then content below).
- **Contour placeholder** for any gym without a photo: `surface.subtle` background, an SVG of five contour paths in `paper.5` at 1.4px, and the gym's initial letter in Fraunces 600 ink at the bottom-left (16px in rows, 34px in cards, absent in the hero because there is no placeholder hero). The SVG is one shared symbol; the letter is text. Forty of these in a grid must read as a system, so nothing varies between them except the letter.
- **Gym-first imagery.** Where a photo is chosen for a region page or marketing, it shows walls, holds, chalk, people climbing indoors. No landscapes as identity imagery; no stock climbing photography anywhere.
- **No grain or texture on ordinary surfaces.** Contours appear only in the placeholder and on the passport page.
- **Community photos** are validated as `https://` URLs, lazy-loaded, and shown at fixed crops; a broken URL falls back to the placeholder.

---

## 14. Responsive system

Breakpoints: `sm` < 600, `md` 600–1023, `lg` ≥ 1024, `xl` ≥ 1440.

| Surface | ≥ 1024 | 600–1023 | < 600 |
|---|---|---|---|
| Navigation | top bar with links | top bar with links (search collapses to an icon) | tab bar + START; top bar removed |
| Explore | 460px list + map | full map + bottom sheet (sheet max width 560px, centred) | full map + bottom sheet |
| Filters | chip row in list pane; side sheet | chip row over map; bottom sheet | same |
| Gym page | two columns, inline actions | single column, inline actions | single column, sticky bottom actions |
| Region page | 3-col card grid + map | 2-col + map below | 1-col; map as a 200px thumbnail linking to Explore |
| Log | calendar + list side by side | stacked | stacked |
| Moderation | table rows + side panel | rows; panel becomes a sheet | rows; panel becomes a sheet |

Touch targets are 44 × 44px minimum on every interactive element at < 1024px, including the 28px visual icon buttons (padding supplies the rest) and pins (their hit area is a 44px circle regardless of drawn size). Safe areas: `100dvh` layouts, `env(safe-area-inset-bottom)` on the tab bar and sticky action rows, `env(safe-area-inset-top)` on the mobile search field.

Map on small screens: the control stack collapses to locate only; the style toggle moves into the All filters sheet. The sheet's peek height accounts for the tab bar. Gestures: one-finger pan and pinch on the map; the sheet's drag handle and header are the drag surface; the list inside scrolls independently; a horizontal card carousel at peek height swipes.

---

## 15. Accessibility

- **Semantic HTML:** pages use `<main>`, `<nav>`, `<header>`, `<section>` with headings in order; rows are `<button>` or `<a>`; chips are `<button aria-pressed>`; the tab bar is a `<nav>` with `aria-current="page"`; sheets and dialogs are `role="dialog" aria-modal="true"` with `aria-labelledby`, focus moved in on open, trapped, restored on close; the bottom sheet at peek/half is *not* modal (it is `role="region"` with a label) so the map remains reachable.
- **Keyboard:** every action reachable by Tab; Escape closes the topmost dialog or peek card and nothing else (the current Escape-clicks-first-cancel-button behaviour is removed and replaced by an explicit `data-dismiss` target); arrow keys in lists and search results; the map is skippable via a "Skip map" link, and the list is the accessible equivalent of the map (same data, same filters, same order).
- **Focus:** 2px `focus-ring` outline, 2px offset, `:focus-visible` only; never removed; visible on rock surfaces by using `forest.4` there.
- **Contrast:** per §5.3; verified per token pair, not per screen.
- **Reduced motion:** all transitions collapse to 0ms except opacity fades ≤ 120ms; the stamp and milestone reveals render their end state; map `flyTo` becomes `jumpTo` (the existing `motion()` helper already does this).
- **Touch:** 44px minimum, 8px minimum gap between adjacent targets.
- **Screen readers:** pins carry `aria-label` = "{name}, {types}, {suburb}" and the peek card announces on open (`aria-live="polite"` region); the count line is `aria-live="polite"`; stamps have alt text naming gym and date; the character images have empty `alt` when decorative (all in-product uses) and descriptive `alt` on the share card.
- **Map limitations, stated:** MapLibre's canvas is not accessible; the product's accessibility contract is that everything the map shows is available in the list with equivalent filters and sort, that region and city pages provide a non-map browse path, and that no action is available *only* by interacting with a pin.

---

## 16. Existing codebase mapping

### 16.1 Retain

- `index.html` as the single shell; `about.html`, `privacy.html`, `terms.html` as static pages restyled with the new tokens.
- `css/style.css`'s token layer (Stage B) as the starting point for `css/tokens.css`; the `.btn` tier system; `.skip-link`, `.visually-hidden`, `:focus-visible`, reduced-motion block; modal focus trapping; `.skeleton-row`; `.gym-item` row structure (re-tokened to 56px).
- `js/app.js`: `loadSpots()` paging, `passesFilters()`, `render()` (becomes the scoped list renderer), `rebuildClusterIndex()` / supercluster setup, `paintMarkers()` diffing, `markerEls`, `updateMarkUI()`, `toggleMark()`, `loadMarks()`, `loadSessions()` and the logbook functions, `checkModerator()`/`loadPending()`, `stateLabel()`, `COUNTRY_LABELS`, `STATES_BY_COUNTRY`, `COUNTRY_FLY_TARGETS`, `initialZoom()`, `motion()`, `directionsUrl()`, `resetFilters()`, the CARTO label-layer suppression in `style.load`.
- `js/auth.js`, `js/config.js`, `sw.js` (with the `crossorigin` fix), `manifest.json`.
- `supabase/schema.sql`: `spots`, `moderators`, `pending_edits`, `reports`, `marks`, `routes`, `sessions`, `session_climbs` and their RLS unchanged.

### 16.2 Modify

- `css/style.css` → split into `css/tokens.css`, `css/base.css` (reset, type, focus), `css/components.css` (buttons, chips, cards, rows, inputs, sheet, dialog, stamp), `css/explore.css`, `css/page.css` (gym/region/me/log), `css/mod.css`. Delete all `--xx-yyy` region variables, `.legend*`, `.hint-banner*`, `.popup-*`, `.chip[data-country]` remnants, `.add-btn/.btn-submit/.btn-cancel/.mark-btn` (replaced by `.btn` tiers), `--font-mono`.
- `index.html`: replace the header with the top bar; remove sidebar accordion, legend, hint banner, count badge, kebab; add the tab bar, the sheet container, a `<main id="view">` the router renders into; move footer links.
- `js/app.js`: extract `js/map.js` (MapLibre setup, pins, clusters, sync events), `js/list.js` (scoped rendering, rows/cards, sort), `js/filters.js` (chips, sheet, URL state), `js/search.js` (index and results), `js/router.js` (History API, hash fallback, page templates), `js/gym-page.js`, `js/region-page.js`, `js/sheet.js` (snap-point bottom sheet), `js/checkin.js` (check-in, stamp, passport, share card), `js/mod.js`. `app.js` keeps bootstrapping, data loading, auth wiring and shared state. Replace `escapeHtml` with a real attribute-safe escaper and remove inline `onclick=` handlers (this also closes H1/C2 from the audit). Remove `popupHtml` in favour of the peek card component. Throttle the search input.
- Map style: keep the CARTO dark style; move pins from DOM markers to a GeoJSON source + symbol/circle layers when practical (better collision handling and label placement), otherwise keep DOM markers with the new SVG.
- `supabase/schema.sql` (additive only): `spots.slug text unique` (backfilled by a one-off script from name+suburb, disambiguated with a numeric suffix), `spots.verified_at timestamptz`, `checkins` table, optional `profiles (user_id, display_name, home_country)` for attribution and milestone geography, later `spots.hours jsonb / day_pass_price numeric / currency text / website text / instagram text / facilities text[]`. Fix the `created_at` client-writable loophole with a `before insert` trigger while touching the schema.

### 16.3 Replace

- MapLibre popups → peek card (desktop) / sheet carousel (mobile).
- Sidebar drawer on mobile → bottom sheet.
- Region accordion → search + region pages + viewport scoping.
- Emoji glyphs → one SVG icon sprite (Phosphor or Lucide, single weight; decide in §19) inlined via `<use>`.
- Logbook and Saved modals → `/log` and `/me/saved` pages using the dense row.
- Pending-review modal → `/mod` page.
- Goat icon → deer flat-vector head (icon change is optional per §0.4; the head is required for START/avatar regardless).

No framework, no bundler required. If module count makes a build step desirable, `<script type="module">` with native ES modules is sufficient.

---

## 17. Implementation phases

Each phase is independently shippable and testable. Do not start a phase before its dependencies are merged.

### Phase 0 — Safety fixes (½ day, before any visual work)

Objective: remove the known data-loss and injection bugs the redesign will otherwise paint over.
Scope: Escape handling uses explicit `data-dismiss`; attribute-safe `escapeHtml`; remove inline `onclick`; `crossorigin` on CDN tags; `before insert` trigger forcing `created_at`, `status`, `submitted_by`; PNG icons for iOS.
Files: `js/app.js`, `index.html`, `sw.js`, `supabase/schema.sql`, `manifest.json`.
Acceptance: Escape in the moderation and logbook modals closes without acting; a `<img onerror>` payload in a pending edit's country renders as text; offline reload boots the shell; a backdated `created_at` is overwritten server-side.
Exclusions: no visual change.

### Phase 1 — Foundations

Objective: install the token system and the base component set so every later phase builds on them.
Scope: `css/tokens.css` + `design/tokens.json` (all of §2); fonts swapped to Fraunces + Inter, Space Grotesk/Mono removed; radius, hairline and shadow rules; `.btn` primary/secondary/tertiary × sm/md/lg + icon-only (44px touch), replacing `.add-btn`, `.btn-submit`, `.btn-cancel`, `.mark-btn`; inputs, textarea, select, checkbox, switch; filter chip and applied chip; the icon sprite replacing every emoji; desktop top bar and mobile tab bar with the START disc (face asset required; a temporary vector head is acceptable); page shell with `<main id="view">`; footer links; delete the region palette and the legend/hint banner CSS.
Dependencies: Phase 0.
Files: `css/tokens.css`, `css/base.css`, `css/components.css`, `index.html`, `about.html`, `privacy.html`, `terms.html`, `js/app.js` (auth UI strings, nav toggle), new `assets/icons.svg`, `assets/mascot/head.svg`.
Acceptance: zero raw hex outside `tokens.css`; every button on every surface uses a `.btn` tier; no emoji in the DOM; Fraunces appears only ≥ 18px; tab bar and top bar render at 375/768/1440 with no overflow; all existing functionality still works behind the new chrome (map, filters, marks, logbook, moderation).
Exclusions: no layout changes to Explore, no gym page, no sheet.

### Phase 2 — Discovery

Objective: make Explore the map-and-list product described in §7.
Scope: two-pane desktop layout (460px list + map, no drawer); viewport-scoped list with count line and sort; dense 56px row and photo card with the grid/list toggle; contour placeholder; type-colour teardrop pins with the 6px-dot zoom rule and ink outline; cream count clusters with `maxZoom` 15 and coordinate jitter; saved/climbed/selected rings; row↔pin hover and selection sync; peek card over the map (desktop); "Search as I move" toggle and "Search this area"; chip row and All filters side/bottom sheet with live count; URL query state for filters and camera; skeleton loading; the three empty states; mobile bottom sheet with three snap points, drag rules, pin-tap carousel; mobile search field over the map (§9 basic: gyms + places from the existing label tables). Remove the sidebar accordion and its chips.
Dependencies: Phase 1.
Files: `js/map.js`, `js/list.js`, `js/filters.js`, `js/sheet.js`, `js/search.js`, `css/explore.css`, `index.html`, `js/app.js` (state wiring).
Acceptance: panning Sydney at zoom 12 updates the count and list within 200ms; 300+ gyms in view shows the capped list with the zoom-in row; hovering a row highlights its pin and vice versa; pins render as dots at zoom ≤ 10 and teardrops at ≥ 12; a cluster of identical coordinates expands at zoom 15; the sheet snaps at 18/52/92% and only collapses when the list is scrolled to top; back/forward restores filter and camera state; Lighthouse accessibility ≥ 95 on Explore; no console errors.
Exclusions: no gym page (peek card's "Full page" links to the popup-equivalent state until Phase 3); no check-in; no region pages.

### Phase 3 — Gym, region and city pages

Objective: every place gets a URL and a page.
Scope: `js/router.js` (History API + hash fallback), `spots.slug` migration and backfill, `/gym/{slug}` page per §8 with conditional sections and the single contribution prompt, sticky mobile action row, Nearby strip, static map thumbnail, `document.title`/canonical; `/in/{country}`, `/in/{country}/{region}`, `/in/{country}/{region}/{city}` pages with heading, count, card grid and embedded map; breadcrumbs; search results now navigate to pages from non-Explore contexts; `/log` and `/me` (Saved, Climbed, Settings) as pages replacing the modals; logbook re-skinned to dense rows and the existing calendar data.
Dependencies: Phase 2.
Files: `js/router.js`, `js/gym-page.js`, `js/region-page.js`, `js/log-page.js`, `js/me-page.js`, `css/page.css`, `supabase/schema.sql` (slug, verified_at), a one-off `supabase/backfill-slugs.sql`.
Acceptance: a gym with only name/location/types renders the minimum page with no empty boxes; a gym with a photo shows the 16:9 hero; refresh on `/gym/blochaus-marrickville` loads the page directly; back from a gym returns to the exact Explore state; region pages list the correct counts; all modals for Saved/Logbook are gone; keyboard and screen-reader pass on the gym page.
Exclusions: no hours/price/facilities fields (sections exist in the template but never render); no check-in button behaviour beyond a disabled state with tooltip "Coming in the next update" — or omit the button until Phase 5 (preferred).

### Phase 4 — Community and provenance

Objective: make contribution and trust visible and quiet.
Scope: provenance derivation and the ring-dot on rows/cards; the provenance line on pages; contributor attribution via `profiles.display_name`; two-step add-gym flow at `/add` (page) and as a sheet on mobile; edit sheet with the required "why" and the review toggle; publish-then-review for low-risk fields (requires the additive columns for hours/price/links to exist as nullable — add them now even though the UI for showing them is Phase 6/optional); `/mod` page with unified dense queue, diff panel, keyboard actions, rejection reason; light contribution points on `/me`.
Dependencies: Phase 3.
Files: `js/contribute.js`, `js/mod.js`, `css/mod.css`, `supabase/schema.sql` (profiles, edit_note, review_requested, rejection_reason, the nullable detail columns), RLS for new tables.
Acceptance: a new gym submitted from a phone in under a minute with only step 1; the ring-dot appears on community-added rows and not on verified ones; moderator approves an edit with the keyboard and the gym page reflects it; rejected submitter sees the reason; the character appears nowhere in these flows.
Exclusions: no photo upload storage (photo remains a URL); no public profiles; no gating by level.

### Phase 5 — Passport

Objective: ship the check-in → stamp → passport → share card loop and the milestone sheet.
Scope: `checkins` table and RLS; Check in as the primary action on gym pages with the proximity/confirm rule; the check-in sheet; the stamp SVG component and landing animation; `/me/passport` with city stamps and recent check-ins; passport line generation and milestone rules; the milestone sheet with the topped-out asset; share card canvas + Web Share; START sheet on mobile (Check in here / Log a session); the three first-run empty states with the chalking-up and traveller assets; retro app icon swap if approved (§0.4).
Dependencies: Phase 3 (pages), Phase 4 (profiles for home country; optional — falls back to "abroad" undefined).
Files: `js/checkin.js`, `js/passport.js`, `js/milestones.js`, `assets/mascot/*.svg`, `css/components.css` (stamp, milestone sheet), `supabase/schema.sql`.
Acceptance: check-in creates a row and a `climbed` mark; the stamp lands in 320ms and is static under reduced motion; the passport shows one stamp per city with correct counts; the milestone sheet fires once for the first check-in and never twice in a session; the share card exports at 1080 × 1350 with correct text; mascot appears only in the allowed places (audit against §12.2).
Exclusions: no feed, no kudos, no follower graph, no achievements table, no animation beyond the two permitted.

### Phase 6 — Optional enhancements (only on request)

Warm custom basemap; hours/price/facilities display and their contribution UI; grade normalisation; achievements beyond passport milestones; public profiles. Each becomes its own small phase when approved.

---

## 18. Visual QA checklist

Run after every phase. Each line is pass/fail.

**Typography** — Fraunces appears only at ≥ 18px and only in wordmark, page/section titles, card names, stamps, stat numbers. No Space Grotesk, Space Mono or Fredoka loaded. Inter body is 400; no 700 anywhere. Every changing number has tabular figures (check counts, distances, prices, dates). Sizes match the ten-step scale exactly.

**Spacing** — All gaps and paddings are multiples of 4; page gutters 48/24/16 by breakpoint; dense rows are exactly 56px; cards 16px internal padding; section spacing 32px on pages.

**Density** — Explore shows ≥ 9 rows per 900px viewport in row mode; the list caps at 400 with the zoom-in row; moderation shows ≥ 12 queue rows per screen.

**Colour hierarchy** — Exactly one forest-filled action per screen; mustard only on START, stamps, celebration and the saved ring; type colours only on pins and type tags; zero raw hex outside `tokens.css`; region colours absent from CSS and DOM.

**Radius** — Inputs/tags 6, buttons 10, cards/popovers 14, sheets/dialogs 20; pills only on chips, primary button, START, avatars; nested elements step down.

**Shadows** — `shadow.raised` only on objects over the map; `shadow.overlay` only on sheets/dialogs/popovers; no shadow on any card, row, button, chip, input, tab bar or top bar.

**Map/list sync** — Hover row → pin ring; hover pin → row raised; click either → peek + scroll; count updates on moveend; "Search as I move" toggle works both ways; selection persists through zoom; Escape clears selection.

**Pins and clusters** — Dots ≤ zoom 10, teardrops ≥ 12; ink outline present; type colour correct for first type; clusters are paper discs with ink counts; identical-coordinate groups spread at zoom 15; state rings render in the documented priority.

**Responsive** — 320, 375, 430, 768, 1024, 1440 checked; no horizontal scroll; sheet snaps correct; tab bar hidden at full snap; sticky actions respect safe areas; top bar ≥ 1024 only.

**Touch targets** — Every interactive element ≥ 44px hit area below 1024px (measure icon buttons and pins specifically); ≥ 8px between adjacent targets.

**Empty data** — A gym with only name/location/types renders the minimum page with no empty panels or "—" values; exactly one contribution prompt on such a page; no placeholder hero; loading uses skeletons; filtered empty shows "Clear filters"; first-run empties show the character, repeat empties do not.

**Provenance** — Ring-dot on community rows, absent on verified; page line reads state · attribution · edit time · contributors; no badges, no fills; no email addresses visible anywhere.

**Mascot** — Present only on: icon, START, default avatar, first-run empties (Explore-no-location, Log, Passport), milestone sheet, stamp, share card. Absent from: forms, filters, sign-in, errors, toasts, moderation, map canvas, gym/region/city pages, desktop top bar, repeat-visit empties. Never larger than the primary action; max 96px except the milestone sheet at 160px; no animation except stamp landing and milestone reveal.

**Loading and errors** — Skeletons mirror layout; long operations (> 2s) may show the chalking-up asset, nothing else does; errors are text + one action in `status.danger`, no character; offline shows an offline message, not the Supabase-config message.

**Accessibility** — Keyboard path through Explore, a gym page, add-gym, check-in; focus ring visible on paper and rock; Escape closes only the top layer; dialogs trap and restore focus; the bottom sheet at peek/half is non-modal; Lighthouse accessibility ≥ 95 on Explore, gym page, log; reduced motion honoured (including `flyTo` → `jumpTo`).

**Visual consistency** — Components look identical across Explore, pages, sheets and `/mod`; no one-off styles; the desktop top bar and mobile tab bar share the active-state language; the peek card, photo card and dense row share thumbnail/placeholder rendering.

---

## 19. Open decisions requiring the owner's input

1. **Top-rope and lead colours.** Ember for boulder is fixed. Proposed lake blue `#3F7FA6` (top rope) and plum `#8A4E7A` (lead). Confirm or supply alternatives; they must stay distinct from forest and mustard.
2. **Icon set.** Phosphor (friendlier, multiple weights available) or Lucide (sharper, single weight). Recommendation: Phosphor Regular at 1.5px stroke for a guidebook tone; either is acceptable.
3. **Hosting rewrite.** Does the host (Vercel assumed) allow rewriting unknown paths to `index.html`? If yes, clean URLs; if no, hash routing ships first and clean URLs follow.
4. **Slug policy.** `name-suburb` with numeric disambiguation is proposed. Renaming a gym should not change its slug (store it, don't derive it live). Confirm.
5. **Landing when geolocation is denied or unavailable.** Options: last city (local storage) → home country's largest city by gym count → world view at zoom 2. Recommendation: that order, with Sydney only as the *home-country* fallback for AU users, not globally.
6. **Public profiles and handles.** Requires a `profiles.handle` with uniqueness and moderation of names. Recommendation: defer; ship `/me` private with a display name only.
7. **Retro app icon adoption.** Replace the current goat icon with the deer sunset icon in Phase 5, or keep the goat until the native app? Recommendation: replace in Phase 5 so web PWA and the future app match from day one.
8. **Check-in proximity rule.** 500m geofence on mobile with a manual "I'm here" confirmation on desktop is proposed. Confirm the radius and whether desktop check-ins are allowed at all.
9. **Publish-then-review scope.** Which fields publish immediately with review flagged (proposed: hours, price, links, photo) versus queue (name, location, types, deletion). Confirm.
10. **Data columns.** Approve adding nullable `hours`, `day_pass_price`, `currency`, `website`, `instagram`, `facilities` in Phase 4 so contribution can start filling them, even though the display is optional/Phase 6.

---

*End of specification. Changes to this document go in a dated decision log appended below this line once it lives in the repository.*

## Decision log

**2026-09-26: Phase 0 + Phase 1 (branch `feature/bouldeer-design-foundations`).**
- *Icon set (sec. 19 decision 2):* **Phosphor Regular**, hand-built as one sprite `assets/icons.svg` (path data unmodified, MIT licence embedded); no npm or CDN dependency. `js/modules/icons.js` `icon(name)` accepts only sprite names.
- *Brand:* the visible product name is **Bouldeer** (wordmark, titles, About, manifest). The domain, the contact address and internal cache/storage keys (`climbatlas-*`, `climbatlas_*`) are identifiers and stay. The Privacy/Terms dialogs still name "Climb Atlas" as the party: renaming a party in legal text is a legal decision, left to the owner (docs/TASKS.md).
- *Navigation:* top bar (>= 600px) and mobile tab bar with START (< 600px) are built now, wired to what exists: Explore = map, Regions = the region list (drawer on narrow screens), Log = logbook dialog, Me = a menu (Saved, Add a gym, Pending review, About, account). START opens "Log a session" and has an empty mascot slot; no check-in until Phase 5.
- *Legend and first-visit hint:* kept and restyled until Phase 2 replaces the pins they explain (the spec deletes them in Phase 1; the owner chose to keep working UI until its replacement exists).
- *Type colours (sec. 19 decision 1):* the proposed lake `#3F7FA6` and plum `#8A4E7A` are in place as provisional values.
- *Phase 0:* Escape/`data-dismiss`, attribute-safe escaping and inline-handler removal were already done (security merge); the `before insert` trigger already exists in the baseline migration. Fixed now: `crossorigin="anonymous"` on every CDN script/stylesheet (without it the service worker could never cache MapLibre, supercluster, supabase-js or the font CSS, so an offline reload could not boot). Not done: PNG/iOS icons (tied to the app-icon decision 7).
- *Tokens:* `design/tokens.json` is generated from `css/tokens.css` by `scripts/build-tokens-json.js` (two-level paths `category.name`, e.g. `color.text-primary`); `tests/design-system.test.js` fails on drift. Additions beyond sec. 2.5, all component-level: `--z-*` layers, `--color-surface-scrim`, `--color-status-warning-text`, `--map-sky/-horizon/-fog/-road-label/-label-halo`, `--pin-size-hold` (current round pin), `--cluster-size-large`, a few layout sizes (`--size-list-pane`, `--size-dialog`, ...).
- *Codebase mapping:* sec. 16 describes the pre-refactor `js/app.js`; the equivalents now live in `js/main.js` + `js/modules/*`. The CSS split follows sec. 16.2 (`tokens.css`, `base.css`, `components.css`); `style.css` remains the app layer until Phase 2 splits it into `explore.css` / `page.css` / `mod.css`.
