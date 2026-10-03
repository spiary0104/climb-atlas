# Import dry-run: 2026-10-03-polish-fixes

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

Index: 2341 known gyms (sha256 3a79f5cf6f8d…). Plan: 3e0bfc717fd1… Also compared against staged batches: 2026-10-03-czechia-pins.

## Updates to existing gyms (11)

- line 1 `seed-1494` — Pin from OpenStreetMap way/1256637676 (Balkan Climbing: same website and phone as the gym site, building polygon); the old pin is a placeholder shared with other Sofia gyms. Address kept: the gym site, news and the stored address all say ul. 187-ma 9 (a numbered street of this villa zone; OSM only names the nearest road, Kalna reka). Verified 2026-10-03
  - lat: 42.6682265 → 42.6243875
  - lng: 23.3710644 → 23.3623358
- line 2 `seed-1446` — Pin from OpenStreetMap node/3771658163 (OAKA Indoor Climbing, website oakaindoorclimbing.gr, on Olympionikou Spyrou Loui street, the street of the gym site address); the old pin was a district-level approximation 2.9 km away. Address kept (site: Olympionikou Spyros Loui 37, Marousi). Verified 2026-10-03
  - lat: 38.0546653 → 38.0388745
  - lng: 23.8081533 → 23.7821696
- line 3 `seed-452` — Pin from OpenStreetMap node/2212617641 (Cell, phone 03-3429-5367 = the gym phone), inside Kyodo 1-chome 156-0052 and 3 min on foot from Kyodo station as the gym site says; the old pin was 1.5 km east. Address kept (1-23-3 Kyodo, from the gym site). Verified 2026-10-03
  - lat: 35.6469025 → 35.6498086
  - lng: 139.652531 → 139.6361263
- line 4 `seed-1437` — Pin from OpenStreetMap node/10789943271 (Mamouna Climbing Spot, edited 2026-05); it sits on Megalou Alexandrou at the Salaminos junction, where the street numbers interpolate to 88-90 (102 at 23.7153, 57 at 23.7178); the old pin was at about no. 116, 140 m west. Address kept. Verified 2026-10-03
  - lat: 37.9817934 → 37.9825128
  - lng: 23.7148207 → 23.7161147
- line 5 `seed-478` — Pin from OpenStreetMap node/11582816983 (Northern Rocks, 111 Diana Drive, same website and email as the gym; 37 m from the pin the gym publishes on its own map link, -36.775498,174.732769); the old pin was 1.5 km south. Address kept. Wave 2 follow-up nz-002, verified 2026-10-03
  - lat: -36.789 → -36.7758524
  - lng: 174.737 → 174.733038
- line 6 `seed-1479` — Pin is the place marker (!3d/!4d) of the Google link on the gym own contact page, at Slavenskoga ul. 1 (Precko shopping centre, Lidl next door at 45.79579,15.90021); the old pin sat 9.6 km east at the same coordinates as The Hive Zagreb. Address kept. Wave 2 follow-up hr-002, verified 2026-10-03
  - lat: 45.7959714 → 45.7958918
  - lng: 16.023592 → 15.9002847
- line 7 `seed-1480` — Pin from OpenStreetMap way/237011161 (Fothia Velesajam, website fothia.hr/velesajam), inside the building way/32771732 Paviljon 25 (35 m); the old pin was 5 km east at the same coordinates as The Hive Zagreb. Address was missing: Paviljon 25 of the Zagreb Fair (own site) at Avenija Dubrovnik 15 (OSM, Zagrebacki Velesajam). Wave 2 follow-up hr-003, verified 2026-10-03
  - lat: 45.7959714 → 45.7801721
  - lng: 16.023592 → 15.9685279
  - address: null → "Zagrebački Velesajam, Paviljon 25, Avenija Dubrovnik 15, 10000 Zagreb, Croatia"
- line 8 `seed-1689` — Pin from OpenStreetMap node/13945330302 (Project Rock, addr:place IKEA Batu Kawan, level L1, phone and email of the gym) inside the IKEA complex; the old pin is on the road 270 m west of it (same longitude as the centre of the gym own map embed, which is a viewport). Address kept. Wave 2 follow-up my-008, verified 2026-10-03
  - lat: 5.2340259 → 5.2329173
  - lng: 100.4377817 → 100.4399276
- line 9 `seed-1692` — Pin from OpenStreetMap way/888188170 (Kompleks Sukan Mendaki Putrajaya, Presint 5, inside Taman Cabaran = Challenge Park). Same facility: Perbadanan Putrajaya describes Kompleks Sukan Mendaki in Taman Cabaran Presint 5 with boulder, lead and top-rope zones; the old pin was 0.9 km north. Address kept. Wave 2 follow-up my-014, verified 2026-10-03
  - lat: 2.8957158 → 2.8886107
  - lng: 101.6648296 → 101.6679629
- line 10 `seed-1263` — Pin is the coordinate pair (q=) of the Google embed on the gym own contact page, 2 m from OpenStreetMap node/13230741433 (Escala25, same website); the old pin was 709 m south. Address: the street is Avenida da India (gym site and OSM, number 52 in OSM and in the old entry), not "Ponte 25 de Abril". Wave 2 follow-up pt-002, verified 2026-10-03
  - lat: 38.6939807 → 38.700331
  - lng: -9.1781386 → -9.178835
  - address: "Ponte 25 de Abril 52, Lisboa, Portugal" → "Avenida da Índia 52, 1349-028 Lisboa, Portugal"
- line 11 `seed-1269` — Pin from OpenStreetMap node/13267464289 (The North Wall, boulder, opening hours), on Rua do Tronco in postcode 4465-275; the old pin was 4.4 km away at the same coordinates as Sao Rock. Address was missing: Rua do Tronco 375 from the directory entry, street and postcode confirmed by OSM. Wave 2 follow-up pt-016, verified 2026-10-03
  - lat: 41.1544425 → 41.1845516
  - lng: -8.5872762 → -8.6217316
  - address: null → "Rua do Tronco 375, 4465-275 São Mamede de Infesta, Portugal"

## Warnings

- `large-pin-move` × 9: lines 1, 2, 3, 5, 6, 7, 9, 10, 11

