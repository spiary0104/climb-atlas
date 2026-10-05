# Import dry-run: 2026-10-05-klattra-motala-note

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 1 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 1 |

Index: 2272 known gyms (sha256 faac8086d857…). Plan: 9179a85ac9ad… Also compared against staged batches: 2026-10-05-france-chains, 2026-10-05-germany-east-saar-berlin, 2026-10-05-italy-city-gaps, 2026-10-05-korea-gwangju-jeollanam, 2026-10-05-spain-asturias, 2026-10-05-uk-single-gym-towns.

## Updates to existing gyms (1)

- line 1 `g-34538e5d42` — Official climbing page says Tillfälligt stängt (temporarily closed); owner re-check 2026-10-05
  - FILLS gym information (only if empty in production; never overwrites): notes "Temporarily closed (last checked 5 October 2026)."

