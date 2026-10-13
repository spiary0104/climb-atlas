# Import dry-run: 2026-10-13-fixes

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 14 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 14 |

Index: 3294 known gyms (sha256 2f47cb53e74b…). Plan: d5f2f705ce26… Also compared against staged batches: 2026-10-06-kr-seoul, 2026-10-13-australia.

## Updates to existing gyms (14)

- line 1 `seed-0` — Pin moved to the OSM element / gym map of the same street address (~1679 m from the old pin)
  - lat: -33.9042 → -33.918649
  - lng: 151.1968 → 151.191512
- line 2 `seed-48` — Pin moved to the OSM element / gym map of the same street address (~1525 m from the old pin)
  - lat: -27.4888048 → -27.477254
  - lng: 152.9998006 → 153.008132
- line 3 `seed-39` — Pin moved to the OSM element / gym map of the same street address (~1274 m from the old pin)
  - lat: -37.8817 → -37.883634
  - lng: 145.2836 → 145.269294
- line 4 `seed-5` — Pin moved to the OSM element / gym map of the same street address (~1143 m from the old pin)
  - lat: -33.8332 → -33.823816
  - lng: 151.1276 → 151.122547
- line 5 `seed-6` — Pin moved to the OSM element / gym map of the same street address (~578 m from the old pin)
  - lat: -33.9098 → -33.910319
  - lng: 151.1804 → 151.17417
- line 6 `seed-12` — Pin moved to the OSM element / gym map of the same street address (~488 m from the old pin)
  - lat: -33.7274309 → -33.731564
  - lng: 150.975305 → 150.973532
- line 7 `seed-7` — Pin moved to the OSM element / gym map of the same street address (~428 m from the old pin)
  - lat: -33.8823 → -33.879303
  - lng: 150.9757 → 150.978606
- line 8 `seed-4` — Pin moved to the OSM element / gym map of the same street address (~396 m from the old pin)
  - lat: -33.8853 → -33.885089
  - lng: 151.1706 → 151.174879
- line 9 `seed-1` — Pin moved to the OSM element / gym map of the same street address (~354 m from the old pin)
  - lat: -33.8109146 → -33.807992
  - lng: 151.1490018 → 151.150509
- line 10 `seed-43` — Pin moved to the OSM element / gym map of the same street address (~337 m from the old pin)
  - lat: -37.8311918 → -37.832135
  - lng: 144.8216048 → 144.825248
- line 11 `seed-45` — Pin moved to the OSM element / gym map of the same street address (~306 m from the old pin)
  - lat: -27.4191485 → -27.419927
  - lng: 152.9918792 → 152.994851
- line 12 `seed-8` — Pin moved to the OSM element / gym map of the same street address (~253 m from the old pin)
  - lat: -33.8166651 → -33.818605
  - lng: 151.1911127 → 151.189683
- line 13 `seed-29` — Pin moved to the OSM element / gym map of the same street address (~230 m from the old pin)
  - lat: -35.3224961 → -35.323109
  - lng: 149.1676387 → 149.165218
- line 14 `seed-322` — Pin and address moved to the gym's Thousand Oaks location, 880 Hampshire Rd Suite A (~3123 m from the old pin)
  - lat: 34.1361 → 34.1545321
  - lng: -118.8059 → -118.8315087
  - address: "880 Hampshire Rd Suite A, Westlake Village, CA 91361" → "880 Hampshire Rd Suite A, Thousand Oaks, CA 91361"

## Warnings

- `large-pin-move` × 6: lines 1, 2, 3, 4, 5, 14

