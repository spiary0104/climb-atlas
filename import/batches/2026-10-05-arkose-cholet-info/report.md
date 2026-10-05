# Import dry-run: 2026-10-05-arkose-cholet-info

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

Index: 2272 known gyms (sha256 c97e3035f020…). Plan: b1e11829dce5…

## Updates to existing gyms (1)

- line 1 `g-9e0a4cb76f` — Now open (owner re-check 2026-10-05): website, opening hours and facilities from the official branch page
  - FILLS gym information (only if empty in production; never overwrites): website arkose.com + hours mon,tue,wed,thu,fri,sat,sun + facilities (4)

