# Import dry-run: 2026-10-06-rename-funattic

**Result: NOT importable yet** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 0 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 1 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 1 |

Index: 2419 known gyms (sha256 e50072d61b4c…). Plan: db50e4556fb2… Also compared against staged batches: 2026-10-01-peru, 2026-10-01-slovakia, 2026-10-01-ukraine.

## Blockers
- 1 invalid record(s) must be fixed or removed
- nothing to import (no new, update or retire records)

## Invalid records (1)

- line 1:
  - `changed-since-research` (expect_h): seed-1702 no longer has the content this update was researched against (expect_h 541e2ad986637bc1, index 83075d5dfdf6a6da); re-research it

