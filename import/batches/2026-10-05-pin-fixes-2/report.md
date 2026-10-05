# Import dry-run: 2026-10-05-pin-fixes-2

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 3 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 3 |

Index: 2385 known gyms (sha256 3f1ea249722b…). Plan: d3c210750ad0… Also compared against staged batches: 2026-10-05-korea-holds, 2026-10-05-uk-holds-gaps, 2026-10-06-france-holds, 2026-10-06-germany-holds, 2026-10-06-italy-holds-napoli.

## Updates to existing gyms (3)

- line 1 `seed-1175` — Pin about 3.6 km from the gym at 507 Imbangul-daero (Allpins Building D, B102); the gym own Naver Place pin and Kakao agree within 2 m (research korea-holds kr-h-002)
  - lat: 35.1722187 → 35.2049069
  - lng: 126.8172814 → 126.819462
- line 2 `seed-893` — Pin about 850 m from the centre at Unit G13, Baltic Wharf (OSM node of the gym); no address before (research uk-holds-gaps)
  - address: null → "Unit G13, Baltic Wharf, St Peter's Street, Maidstone ME16 0ST"
  - lat: 51.2704 → 51.2767513
  - lng: 0.5227 → 0.5158326
- line 3 `seed-878` — Pin about 1.9 km from the centre at Hornbeam Park Avenue (postcode HG2 8QT, street level; Live For Today took over Parthian Harrogate in 2024); no address before (research uk-holds-gaps)
  - address: null → "Hornbeam Park Avenue, Hornbeam Park, Harrogate HG2 8QT"
  - lat: 53.9919 → 53.97705
  - lng: -1.5378 → -1.52232

## Warnings

- `large-pin-move` × 3: lines 1, 2, 3

