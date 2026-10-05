# Import dry-run: 2026-10-05-retire-mokpo-lead

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

Index: 2386 known gyms (sha256 c39a34e746be…). Plan: e4f48fc789ee…

## Retirements of existing gyms (1)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 1 `g-7b824ae5b6` "Mokpo Lead Climbing Center" (KR) — insufficient-evidence: Bouldering not confirmed: the gym pages only carry a #볼더링 hashtag and keyword, no bouldering area (re-check 2026-10-05)

