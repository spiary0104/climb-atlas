# Import dry-run: 2026-10-04-review-locations

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 12 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 12 |

Index: 2272 known gyms (sha256 35c8dc9ee138…). Plan: 421063fef6d1…

## Updates to existing gyms (12)

- line 1 `seed-88` — Location correction from the gym's official address; pin from the gym's own site map marker (review follow-up, checked 2026-10-04)
  - lat: 37.279 → 37.2291837
  - lng: -107.883 → -107.8085475
- line 2 `seed-140` — Location correction from the gym's official address; pin from the US Census address geocoder (review follow-up, checked 2026-10-04)
  - lat: 30.1658 → 30.2155007
  - lng: -95.4613 → -95.5830892
- line 3 `seed-428` — Location correction from the gym's official address; pin from Japan's national address geocoder (GSI) (review follow-up, checked 2026-10-04)
  - lat: 35.1747 → 35.153152
  - lng: 136.9007 → 136.905869
- line 4 `seed-423` — Location correction from the gym's official address; pin from Japan's national address geocoder (GSI) (review follow-up, checked 2026-10-04)
  - lat: 33.589 → 33.56776
  - lng: 130.418 → 130.441788
- line 5 `seed-973` — Location correction from the gym's official address; pin from OpenStreetMap (review follow-up, checked 2026-10-04)
  - address: null → "Brückenstraße 6, 96472 Rödental"
  - lat: 50.3167 → 50.2939992
  - lng: 11.1167 → 11.0501736
- line 6 `seed-972` — Location correction from the gym's official address; pin from OpenStreetMap (review follow-up, checked 2026-10-04)
  - address: null → "Hohweg 5, 28219 Bremen"
  - lat: 53.0793 → 53.1061722
  - lng: 8.8017 → 8.7975242
- line 7 `seed-1041` — Location correction from the gym's official address; pin from OpenStreetMap (review follow-up, checked 2026-10-04)
  - address: null → "Pulverweg 6, 21337 Lüneburg"
  - lat: 53.2497 → 53.2500372
  - lng: 10.4149 → 10.4224786
- line 8 `seed-1013` — Location correction from the gym's official address; pin from OpenStreetMap (review follow-up, checked 2026-10-04)
  - address: null → "Albert-Einstein-Straße 6, 76829 Landau in der Pfalz"
  - lat: 49.1975 → 49.188012
  - lng: 8.117 → 8.1331402
- line 9 `seed-1050` — Location correction from the gym's official address; pin from OpenStreetMap (review follow-up, checked 2026-10-04)
  - address: null → "Grasweg 40, 24118 Kiel"
  - lat: 54.3233 → 54.33849
  - lng: 10.1228 → 10.1186983
- line 10 `seed-871` — Location correction from the gym's official address; pin from OpenStreetMap (review follow-up, checked 2026-10-04)
  - address: null → "Unit 30b, Techno Trading Estate, Bramble Road, Swindon SN2 8HB"
  - lat: 51.5558 → 51.5761594
  - lng: -1.7797 → -1.7639164
- line 11 `seed-877` — Location correction from the gym's official address; pin from OpenStreetMap (review follow-up, checked 2026-10-04)
  - address: null → "3 Prospect Pl, Lenton, Nottingham NG7 1RS"
  - lat: 52.9548 → 52.9476842
  - lng: -1.1581 → -1.1718441
- line 12 `seed-308` — Address correction: the official site gives ZIP 01950 for 40 Parker Street, Newburyport (review follow-up, checked 2026-10-04)
  - address: "40 Parker St, Newburyport, MA 01913" → "40 Parker St, Newburyport, MA 01950"

## Warnings

- `large-pin-move` × 11: lines 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
- `noop-field` × 4: lines 1, 2, 3, 4

