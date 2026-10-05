# Import dry-run: 2026-10-05-owner-checks-info

**Result: NOT importable yet** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 0 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 4 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 4 |

Index: 2412 known gyms (sha256 930823b07e4d…). Plan: 8757ca4bcf71… Also compared against staged batches: 2026-10-05-italy-owner-checks, 2026-10-05-spain-owner-checks, 2026-10-05-uk-owner-checks.

## Blockers
- 4 invalid record(s) must be fixed or removed
- nothing to import (no new, update or retire records)

## Invalid records (4)

- line 1:
  - `unknown-id` (id): no gym with id g-039b6ea9b5 exists in production (per the index); an update cannot create a gym
- line 2:
  - `unknown-id` (id): no gym with id g-ddbd31743b exists in production (per the index); an update cannot create a gym
- line 3:
  - `unknown-id` (id): no gym with id g-9be2fb9806 exists in production (per the index); an update cannot create a gym
- line 4:
  - `unknown-id` (id): no gym with id g-569cef7574 exists in production (per the index); an update cannot create a gym

