# Import dry-run: 2026-10-04-review-identity-2

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 18 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 18 |

Index: 2272 known gyms (sha256 fd9a5cf85872…). Plan: d8323bf7c5d6…

## Updates to existing gyms (18)

- line 1 `seed-308` — Renamed: same address, now Salt Pump Newburyport (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "MetroRock Newburyport" → "Salt Pump Newburyport"
- line 2 `seed-428` — Type tags: the official home page lists an OMC wall for rope climbing (verified 2026-10-04)
  - CORRECTS identity (types; the stored slug and every other field stay as they are):
  - types: ["indoor-bouldering"] → ["indoor-bouldering","top-rope"]
- line 3 `seed-866` — Renamed: Craggy Island Guildford is now Blue Spider Climbing (same address); suburb is the town, not the county (verified 2026-10-04)
  - CORRECTS identity (name + suburb; the stored slug and every other field stay as they are):
  - name: "Craggy Island" → "Blue Spider Climbing"
  - suburb: "Surrey" → "Guildford"
- line 4 `seed-891` — Renamed: The Bunker, formerly The Boulder Bunker (same address); suburb is the town (verified 2026-10-04)
  - CORRECTS identity (name + suburb; the stored slug and every other field stay as they are):
  - name: "The Boulder Bunker" → "The Bunker"
  - suburb: "Torbay" → "Torquay"
- line 5 `seed-871` — Flashpoint Swindon joined Rockstar and is now Rockstar Bouldering (Techno), Techno Trading Estate (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Flashpoint Swindon" → "Rockstar Bouldering (Techno)"
- line 6 `seed-877` — The operator has two sites; Basford is listed separately, so this record is the Lenton bouldering site (3 Prospect Place) (verified 2026-10-04)
  - CORRECTS identity (name + suburb + types; the stored slug and every other field stay as they are):
  - name: "Nottingham Climbing Centre" → "Nottingham Climbing Centre - Lenton"
  - suburb: "Nottingham" → "Lenton, Nottingham"
  - types: ["indoor-bouldering","lead-climbing","top-rope"] → ["indoor-bouldering"]
- line 7 `seed-973` — Rebranded: boulderhouse-roedental.de redirects to Cogito Boulderhalle Coburg (Cogito hall + BoulderHouse kids hall, Brueckenstrasse 6) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Boulder House Rödental" → "Cogito Boulderhalle Coburg"
- line 8 `seed-972` — Boulder Base Bremen has two halls; this record is the Walle hall (Hohweg 5); Tabakquartier is added separately (verified 2026-10-04)
  - CORRECTS identity (name + suburb; the stored slug and every other field stay as they are):
  - name: "Boulder Base Bremen" → "Boulder Base Bremen Walle"
  - suburb: "Bremen" → "Walle, Bremen"
- line 9 `seed-1041` — Renamed: Kraftwerk (domain parked) trades as urban apes Lüneburg at Pulverweg 6 (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Kraftwerk" → "urban apes Lüneburg"
- line 10 `seed-1013` — Renamed: Fitz Rocks is now Felswerk (the site honours old FitzRocks credit) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Fitz Rocks" → "Felswerk"
- line 11 `seed-1050` — Renamed: NORDBLOC now trades as urban apes Kiel at Grasweg 40 (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "NORDBLOC" → "urban apes Kiel"
- line 12 `seed-935` — Suburb: the official address is Fassifern Road, Fort William (not Inverness) (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Inverness, Highland" → "Fort William"
- line 13 `seed-951` — Suburb: the official address is Cibyn Estate, Caernarfon (not Bangor) (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Bangor, Gwynedd" → "Caernarfon"
- line 14 `seed-956` — Suburb: the official address is Rectors Lane, Pentre, Queensferry (not Mold) (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Mold, Flintshire" → "Queensferry"
- line 15 `seed-1062` — Suburb: the official address is Aybuehlweg 69, Kempten (not Augsburg) (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Augsburg, Schwaben" → "Kempten"
- line 16 `seed-1029` — Suburb: the official address is in Weitnau-Seltmans (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Schwaben" → "Weitnau"
- line 17 `seed-964` — Suburb: the official address is Kreuzbergstrasse 40, Fulda (not Kassel) (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Kassel" → "Fulda"
- line 18 `seed-963` — Suburb: the official address is Bahnhofsallee 35, Hilden (not Duesseldorf) (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Düsseldorf" → "Hilden"

## Warnings

- `rename` × 10: lines 1, 3, 4, 5, 6, 7, 8, 9, 10, 11

