# Import dry-run: 2026-10-04-review-new-gym-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 4 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 4 |

Index: 2272 known gyms (sha256 c97e3035f020…). Plan: bc1652fb3704…

## Updates to existing gyms (4)

- line 1 `g-93b94b6196` — Official website, day-pass price from the gym's own site (new gym from the review follow-ups, researched 2026-10-04)
  - FILLS gym information (only if empty in production; never overwrites): website treadstoneclimbing.com + day pass
- line 2 `g-0bf1f11379` — Official website, weekly opening hours, day-pass price, facilities from the gym's own site (new gym from the review follow-ups, researched 2026-10-04)
  - FILLS gym information (only if empty in production; never overwrites): website rockstarclimbing.co.uk + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (3)
- line 3 `g-1c0ffa88fd` — Official website, weekly opening hours, day-pass price, facilities from the gym's own site (new gym from the review follow-ups, researched 2026-10-04)
  - FILLS gym information (only if empty in production; never overwrites): website boulbaka.com + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (2)
- line 4 `g-2432050418` — Official website, weekly opening hours, day-pass price, facilities from the gym's own site (new gym from the review follow-ups, researched 2026-10-04)
  - FILLS gym information (only if empty in production; never overwrites): website boulderbasebremen.de + hours mon,tue,wed,thu,fri,sat,sun + day pass + facilities (3)

