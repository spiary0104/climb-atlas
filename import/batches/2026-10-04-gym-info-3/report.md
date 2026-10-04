# Import dry-run: 2026-10-04-gym-info-3

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

Index: 2342 known gyms (sha256 19b373023bbb…). Plan: d109f6d8974f…

## Updates to existing gyms (1)

- line 1 `g-c4a08fc866` — Official website and weekly opening hours from the gym's own site (checked 2026-10-04)
  - FILLS gym information (only if empty in production; never overwrites): website verticalhold.com + hours mon,tue,wed,thu,fri,sat,sun

