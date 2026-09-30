# Import dry-run: 2026-09-30-location-updates

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 11 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 11 |

Index: 2127 known gyms (sha256 fc944ec96698…). Plan: f6c016e46d00…

## Updates to existing gyms (11)

- line 1 `seed-1350` — Pin and address from OpenStreetMap node/6060938885 ("KiipeilyAreena Kalasatama", exact name, sport=climbing); the old pin was pin-shared + pin-noted-approximate; revalidated 2026-09-30 (approved list of 11)
  - lat: 60.1658575 → 60.1862665
  - lng: 24.9035949 → 24.9783567
  - address: null → "Hermannin rantatie 5, 00580 Helsinki, Finland"
- line 2 `seed-1002` — Pin and address from OpenStreetMap node/9396859544 ("Der Steinbock Nürnberg", exact name, sport=climbing); the old pin was pin-coarse; revalidated 2026-09-30 (approved list of 11)
  - lat: 49.46 → 49.4510292
  - lng: 11.09 → 11.0287018
  - address: null → "Leyher Straße 54, 90431 Nürnberg, Germany"
- line 3 `seed-884` — Pin and address from OpenStreetMap way/377204883 ("Redpoint Bristol", exact name, sport=climbing); the old pin was pin-coarse; revalidated 2026-09-30 (approved list of 11)
  - lat: 51.45 → 51.4339399
  - lng: -2.58 → -2.6117508
  - address: null → "40 Winterstoke Road, Bristol BS3 2NW, United Kingdom"
- line 4 `seed-978` — Pin and address from OpenStreetMap node/2331053313 ("Boulderhalle E4", exact name, sport=climbing); the old pin was pin-coarse; revalidated 2026-09-30 (approved list of 11)
  - lat: 49.45 → 49.4344151
  - lng: 11.08 → 11.0972883
  - address: null → "Allersberger Straße 185, 90461 Nürnberg, Germany"
- line 5 `seed-949` — Pin and address from OpenStreetMap way/1364140190 ("Alien Bloc", exact name, sport=climbing); the old pin was pin-coarse; revalidated 2026-09-30 (approved list of 11)
  - lat: 55.95 → 55.9646823
  - lng: -3.18 → -3.1929215
  - address: null → "23 Dunedin Street, Edinburgh EH7 4GJ, United Kingdom"
- line 6 `seed-979` — Pin and address from OpenStreetMap way/30650807 ("Boulderhaus Darmstadt", exact name, sport=climbing); the old pin was pin-shared; revalidated 2026-09-30 (approved list of 11)
  - lat: 49.8728 → 49.8799322
  - lng: 8.6512 → 8.6362005
  - address: null → "Landwehrstraße 79, 64293 Darmstadt, Germany"
- line 7 `seed-474` — Pin from OpenStreetMap node/13057325642 ("Bolder Climbing Community", exact name); its address matches the stored address; the old pin was pin-coarse; revalidated 2026-09-30 (approved list of 11)
  - lat: 51.03 → 51.0052807
  - lng: -114.08 → -114.061477
- line 8 `seed-399` — Pin from OpenStreetMap node/13812194501 ("Vertex Climbing Center", exact name); its address matches the stored address; the old pin was pin-coarse; revalidated 2026-09-30 (approved list of 11)
  - lat: 38.47 → 38.4722009
  - lng: -122.73 → -122.74367
- line 9 `seed-1242` — Pin from OpenStreetMap way/420034590 ("Boulder Madrid", exact name); its address matches the stored address; the old pin was pin-noted-approximate; revalidated 2026-09-30 (approved list of 11)
  - lat: 40.3956027 → 40.3912461
  - lng: -3.6785934 → -3.6696446
- line 10 `seed-1499` — Pin from OpenStreetMap node/6456475885 ("Momentum Indoor Climbing Sofia", exact name); its address matches the stored address; the old pin was pin-shared; revalidated 2026-09-30 (approved list of 11)
  - lat: 42.6682265 → 42.6652643
  - lng: 23.3710644 → 23.3746548
- line 11 `seed-163` — Pin from OpenStreetMap node/7073073961 ("The District", exact name); its address matches the stored address; the old pin was pin-coarse; revalidated 2026-09-30 (approved list of 11)
  - lat: 29.45 → 29.4490785
  - lng: -98.47 → -98.4742104

## Warnings

- `large-pin-move` × 9: lines 1, 2, 3, 4, 5, 6, 7, 8, 9

