# Import dry-run: 2026-10-05-pin-fixes

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 4 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 4 |

Index: 2272 known gyms (sha256 c97e3035f020…). Plan: 430f27897c18… Also compared against staged batches: 2026-10-05-france-chains, 2026-10-05-germany-east-saar-berlin, 2026-10-05-italy-city-gaps, 2026-10-05-spain-asturias, 2026-10-05-uk-single-gym-towns.

## Updates to existing gyms (4)

- line 1 `seed-962` — Placeholder pin in central Berlin and no address; the branch is at Stresemannstraße 72 (research 2026-10-05-germany-east-saar-berlin dee-028)
  - address: null → "Stresemannstraße 72, 10963 Berlin"
  - lat: 52.52 → 52.5038087
  - lng: 13.405 → 13.3843469
- line 2 `seed-1167` — Pin about 435 m off; the gym is at 40-2 Chungjangroan-gil, 4F (research 2026-10-05-korea-gwangju-jeollanam kr-gj-001; Naver and Kakao pins agree within 6 m)
  - address: "42 Chungjangroan-gil, Chungjang-dong, Dong-gu, Gwangju, South Korea" → "4F, 40-2 Chungjangroan-gil, Dong-gu, Gwangju, South Korea"
  - lat: 35.1471085 → 35.146783
  - lng: 126.9123641 → 126.917134
- line 3 `seed-1176` — Pin about 110 m from the building at 1068 Imbangul-daero (research 2026-10-05-korea-gwangju-jeollanam kr-gj-006, the gym own Naver Place pin)
  - lat: 35.2120312 → 35.2111132
  - lng: 126.8740137 → 126.8735756
- line 4 `seed-1181` — Pin about 650 m from 2 Nakseon-gil, Haeryong-myeon (the gym now trades as OneClimb; research 2026-10-05-korea-gwangju-jeollanam kr-jn-001, own Naver Place pin)
  - lat: 34.9133187 → 34.9104312
  - lng: 127.5356436 → 127.5294181

## Warnings

- `large-pin-move` × 2: lines 1, 4

