# Import dry-run: 2026-10-05-pin-check-uk-ie

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 35 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 35 |

Index: 2411 known gyms (sha256 cc019adb691a…). Plan: 29bb9e78dcdc… Also compared against staged batches: 2026-10-05-germany-owner-checks, 2026-10-05-italy-owner-checks, 2026-10-05-korea-owner-checks, 2026-10-05-spain-owner-checks, 2026-10-05-uk-owner-checks.

## Updates to existing gyms (35)

- line 1 `g-8e9f3f2af7` — Add official address; pin already on the building (13 m from OSM element)
  - address: null → "Hawthorn Avenue, Hull HU3 5GL"
- line 2 `seed-1359` — Pin was 771 m off the gym building (shares-coords-with:seed-1360); set building-level pin and official address
  - address: "Robinhood Road, Dublin, Ireland" → "Unit 23a, Robinhood Industrial Estate, Robinhood Road, Dublin 22, D22 WP86"
  - lat: 53.3253085 → 53.3184325
  - lng: -6.3454706 → -6.3469192
- line 3 `seed-1360` — Pin was 1864 m off the gym building (no-address,shares-coords-with:seed-1359); set building-level pin and official address
  - address: null → "6a Goldenbridge Industrial Estate, Inchicore, Dublin 8"
  - lat: 53.3253085 → 53.335835
  - lng: -6.3454706 → -6.3236231
- line 4 `seed-862` — Pin was 1064 m off the gym building (no-address); set building-level pin and official address
  - address: null → "Unit 4 Imperial Park, Empress Road, Southampton SO14 0JW"
  - lat: 50.9097 → 50.9165249
  - lng: -1.4044 → -1.3937588
- line 5 `seed-868` — Pin was 1223 m off the gym building (no-address); set building-level pin and official address
  - address: null → "Unit 7 New South Quarter, Whitestone Way, Croydon CR0 4WN"
  - lat: 51.3762 → 51.374156
  - lng: -0.0982 → -0.1155061
- line 6 `seed-870` — Pin was 1094 m off the gym building (no-address); set building-level pin and official address
  - address: null → "2a Templegate Park, Mead Street, Bristol BS3 4RP"
  - lat: 51.4545 → 51.4455997
  - lng: -2.5879 → -2.5811842
- line 7 `seed-873` — Pin was 188 m off the gym building (no-address); set building-level pin and official address
  - address: null → "Unit 2a & 3a, Neptune Trading Estate, Neptune Road, Harrow HA1 4HX"
  - lat: 51.5804 → 51.5806563
  - lng: -0.3417 → -0.3443853
- line 8 `seed-875` — Pin was 553 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "Haverfield Road, London E3 5BE"
  - lat: 51.525 → 51.5276743
  - lng: -0.033 → -0.0397471
- line 9 `seed-881` — Pin was 6269 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "Unit E1 Adanac Park, Adanac Drive, Southampton SO16 0BT"
  - lat: 50.905 → 50.9401749
  - lng: -1.4 → -1.469902
- line 10 `seed-882` — Pin was 11919 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "Arch 105 Ravenscourt Road, London W6 0UQ"
  - lat: 51.56 → 51.4943104
  - lng: -0.1 → -0.2361399
- line 11 `seed-886` — Pin was 716 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "26a Magdalen Street, Norwich NR3 1HU"
  - lat: 52.628 → 52.6343725
  - lng: 1.295 → 1.2965235
- line 12 `seed-889` — Pin was 1837 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "St Werburgh's Church, Mina Road, Bristol BS2 9YQ"
  - lat: 51.46 → 51.4717733
  - lng: -2.595 → -2.57639
- line 13 `seed-890` — Pin was 2223 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "85 Barrow Road, Bristol BS5 0FD"
  - lat: 51.45 → 51.455418
  - lng: -2.6 → -2.569119
- line 14 `seed-892` — Pin was 734 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "The Castle, Green Lanes, London N4 2HA"
  - lat: 51.57 → 51.5652897
  - lng: -0.085 → -0.0924406
- line 15 `seed-895` — Pin was 3389 m off the gym building (no-address); set building-level pin and official address
  - address: null → "Unit B2, Centenary Works, 150 Little London Road, Sheffield S8 0UJ"
  - lat: 53.3811 → 53.3519519
  - lng: -1.4701 → -1.4850489
- line 16 `seed-896` — Pin was 5814 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "Unit N1/N2 Mosley Road, Central Park Estate, Trafford Park, Manchester M17 1PG"
  - lat: 53.475 → 53.4641431
  - lng: -2.235 → -2.3209203
- line 17 `seed-898` — Pin was 154 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "Calshot Activities Centre, Calshot Spit, Fawley, Southampton SO45 1BR"
  - lat: 50.818 → 50.8187141
  - lng: -1.3093 → -1.3074291
- line 18 `seed-901` — Pin was 959 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "1 Cabanel Place, Lollard Street, London SE11 6BD"
  - lat: 51.486 → 51.49233
  - lng: -0.124 → -0.114591
- line 19 `seed-902` — Pin was 304 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "Arches 45b-47c South Lambeth Road, London SW8 1SR"
  - lat: 51.487 → 51.485051
  - lng: -0.126 → -0.122917
- line 20 `seed-903` — Pin was 22485 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "225 Hook Rise South, Surbiton KT6 7LD"
  - lat: 51.54 → 51.3723558
  - lng: -0.11 → -0.2914609
- line 21 `seed-904` — Pin was 10768 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "4-6 Hookers Road, London E17 6DP"
  - lat: 51.5 → 51.5896021
  - lng: -0.1 → -0.0409418
- line 22 `seed-907` — Pin was 1949 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "Units 11, 12, 14 & 15, Kirkstall Industrial Park, Leeds LS4 2AZ"
  - lat: 53.799 → 53.8031732
  - lng: -1.551 → -1.5798206
- line 23 `seed-910` — Pin was 2772 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "100A Gelderd Road, Leeds LS12 6BY"
  - lat: 53.801 → 53.7842461
  - lng: -1.545 → -1.5762472
- line 24 `seed-911` — Pin was 826 m off the gym building (coarse-coords,no-address); set building-level pin and official address
  - address: null → "45 Mowbray Street, Sheffield S3 8EN"
  - lat: 53.383 → 53.390117
  - lng: -1.468 → -1.4715444
- line 25 `seed-912` — Pin was 2588 m off the gym building (no-address); set building-level pin and official address
  - address: null → "Unit 2 Garter Street, Sheffield S4 7QX"
  - lat: 53.3806626 → 53.3992496
  - lng: -1.4702278 → -1.4467377
- … and 10 more (see plan.json)

## Warnings

- `large-pin-move` × 31: lines 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, …

