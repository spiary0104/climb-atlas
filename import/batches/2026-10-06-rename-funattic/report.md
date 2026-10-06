# Import dry-run: 2026-10-06-rename-funattic

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

Index: 2419 known gyms (sha256 36a565e680f1…). Plan: 0ae6c81f137e… Also compared against staged batches: 2026-10-01-peru, 2026-10-01-slovakia, 2026-10-01-ukraine.

## Updates to existing gyms (1)

- line 1 `seed-1702` — Tsekh now trades as Funattic (its own Instagram names Tsekh as the former name)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Tsekh Climbing Gym" → "Funattic"

## Warnings

- `rename` × 1: lines 1

