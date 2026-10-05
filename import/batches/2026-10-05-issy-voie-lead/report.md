# Import dry-run: 2026-10-05-issy-voie-lead

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

Index: 2412 known gyms (sha256 930823b07e4d…). Plan: cfb50132ec01… Also compared against staged batches: 2026-10-05-germany-owner-checks, 2026-10-05-italy-owner-checks, 2026-10-05-korea-owner-checks, 2026-10-05-spain-owner-checks, 2026-10-05-uk-owner-checks.

## Updates to existing gyms (1)

- line 1 `g-67ecd19a4e` — Owner manual check 2026-10-06: the voie hall is lead climbing only (its own page requires autonomous lead climbing)
  - CORRECTS identity (types; the stored slug and every other field stay as they are):
  - types: ["top-rope"] → ["lead-climbing"]

