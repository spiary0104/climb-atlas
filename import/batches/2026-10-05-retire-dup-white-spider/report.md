# Import dry-run: 2026-10-05-retire-dup-white-spider

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 0 |
| Retire existing gyms (closed / duplicate: status becomes rejected, record kept) | 1 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 1 |

Index: 2412 known gyms (sha256 930823b07e4d…). Plan: 13d3c5b21437…

## Retirements of existing gyms (1)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 1 `g-7061a1fbb1` "White Spider" (GB) — duplicate of `seed-903`: Duplicate of seed-903 white Spider (same gym; seed-903 had a placeholder pin in Islington, corrected to 225 Hook Rise South)

## Warnings

- `duplicate-far-apart` × 1: lines 1

