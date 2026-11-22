# Bouldeer deer: source artwork

The owner's original character renders (1024 x 1024 PNG, cream ground). These are the **source of truth for the
character**: product assets (`assets/mascot/*.svg`) are flat-vector derivatives traced from them, not new
characters. Do not edit these files; add derivatives elsewhere. Copied from the owner's reference folder
`OneDrive/Pictures/PANDABOULDERING/mascot/` on 2026-09-26 (original file names in brackets).

| File | Pose | Product role (docs/DESIGN.md sec. 12) |
|---|---|---|
| `head-on-boulder.png` | Head peeking over a cream boulder with forest/mustard holds [`…boulderin.png`] | App icon, head lockup, START, seal, default avatar |
| `topped-out-flag.png` | Seated on a granite boulder, fist up, mustard flag [`…boulderin1.png`] | Milestones |
| `dyno.png` | Leaping for a mustard hold [`…boulderin2.png`] | New top grade (milestone) |
| `chalking-up.png` | Seated on a crash pad, chalking hands [`…boulderin3.png`] | First-run Log, long loads |
| `traveller-passport.png` | Holding the forest passport with the mustard antler emblem, orange pin [`…boulderin4.png`] | Passport, check-in |
| `on-the-wall.png` | Focused, on the wall [`…boulderin5.png`] | Marketing |
| `fell-off.png` | Dizzy on the crash pad [`…boulderin6.png`] | Marketing only (not in product) |
| `backpacker.png` | Walking with pad bag and suitcase, paper plane [`…boulderin7.png`] | First-run Explore, new city/country |
| `rest-day.png` | Wrapped in a mustard blanket with a mug [`…boulderin8.png`] | Quiet-week Log state |
| `high-five.png` | Chalky high five [`…boulderin9.png`] | Onboarding welcome, first approved contribution |

Added 2026-10-03: three poses generated from the renders above as references (same character, not a redesign). field-notes
and fresh-stamp are in the product (DESIGN.md sec. 12.1); pin-drop's role is a proposal only.

| File | Pose | Product role |
|---|---|---|
| `field-notes.png` | Seated, writing in a small notebook with a pencil | First-run /me Saved (traced: `assets/mascot/field-notes.svg`) |
| `fresh-stamp.png` | Arms up, holding the open passport with a fresh stamp overhead | Milestone sheet: travel milestones (traced: `assets/mascot/fresh-stamp.svg`) |
| `pin-drop.png` | Planting an orange map pin | Proposed: add-a-gym "in review" screen (not traced; not a sanctioned surface) |

Added 2026-11-22: four poses generated with Higgsfield (GPT Image 2.6, high) from `head-on-boulder.png`, `backpacker.png` and
`traveller-passport.png` as references (same character, not a redesign), for surfaces inspired by the 攀搭攀岩 (Panda) mini
program. Proposals only: not traced, not in the product until approved (DESIGN.md sec. 12).

| File | Pose | Proposed role (Panda pattern) |
|---|---|---|
| `calendar-today.png` | Standing on a tear-off calendar page, waving | Log calendar: today's tile (Panda's mascot stands on today) |
| `city-map.png` | Reading an unfolded city map, pointing at an orange pin | City map / Regions call-to-action tile in Explore (Panda's orange "city map" tile) |
| `medal.png` | Holding a mustard medal with the antler emblem | Points and achievements on Me (Panda's points coin and achievements bar) |
| `wave-badge.png` | Head and shoulders waving, in a forest-green circle | START sheet header / sign-in prompt badge (Panda's mascot badge) |

Panda reference screenshots (`design/references/panda/`) are third-party app captures used as design reference only.
They are excluded from git (`.git/info/exclude`) because this repository is public: keep them local.
