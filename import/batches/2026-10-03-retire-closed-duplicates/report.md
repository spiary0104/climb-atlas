# Import dry-run: 2026-10-03-retire-closed-duplicates

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 0 |
| Retire existing gyms (closed / duplicate: status becomes rejected, record kept) | 3 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 3 |

Index: 2344 known gyms (sha256 ed7d2445d60d…). Plan: 8211fc919f7e…

## Retirements of existing gyms (3)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 1 `seed-433` "Gravity Research Sapporo" (JP) — closed: Closed 14 Apr 2025 (operator store list); no relocation or successor.
- line 2 `seed-461` "T-WALL Ookayama" (JP) — closed: Closed 27 Dec 2020 (building sold and demolished; operator notice via Wayback); no successor.
- line 3 `seed-863` "Citybloc" (GB) — duplicate of `seed-906`: Duplicate of seed-906 CityBloc Leeds: one site only (1-4 Kitson Road, Leeds LS10 1NT).

## Warnings

- `duplicate-far-apart` × 1: lines 3

