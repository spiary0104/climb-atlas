# Import dry-run: 2026-10-04-review-identity-1

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 8 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 8 |

Index: 2293 known gyms (sha256 af9c78d5f3ee…). Plan: 45b078cb2a8c… Also compared against staged batches: 2026-10-04-review-new-gyms.

## Updates to existing gyms (8)

- line 1 `seed-153` — Type tags: the official page says the gym is bouldering-only (no rope climbing at this location) (verified 2026-10-04)
  - CORRECTS identity (types; the stored slug and every other field stay as they are):
  - types: ["indoor-bouldering","top-rope"] → ["indoor-bouldering"]
- line 2 `seed-155` — Type tags: the official page says the gym is bouldering-only (no rope climbing at this location) (verified 2026-10-04)
  - CORRECTS identity (types; the stored slug and every other field stay as they are):
  - types: ["indoor-bouldering","top-rope"] → ["indoor-bouldering"]
- line 3 `seed-293` — Current official name; the home page offers top-rope, lead and bouldering (verified 2026-10-04)
  - CORRECTS identity (name + types; the stored slug and every other field stay as they are):
  - name: "Carabiner's Climbing Wall" → "Carabiner's Climbing & Fitness"
  - types: ["indoor-bouldering","top-rope"] → ["indoor-bouldering","top-rope","lead-climbing"]
- line 4 `seed-387` — The public full-service gym at 5160 Hollister Ave is The Pad Climbing - Santa Barbara (ropes with auto-belays, lead, bouldering); The BoardRoom is its members-only annex (verified 2026-10-04)
  - CORRECTS identity (name + types; the stored slug and every other field stay as they are):
  - name: "The BoardRoom" → "The Pad Climbing – Santa Barbara"
  - types: ["indoor-bouldering"] → ["indoor-bouldering","top-rope","lead-climbing"]
- line 5 `seed-376` — Name typo (Sancturary); the FAQ lists bouldering and roped climbing with auto-belays (verified 2026-10-04)
  - CORRECTS identity (name + types; the stored slug and every other field stay as they are):
  - name: "Sancturary Climbing & Fitness" → "Sanctuary Climbing & Fitness"
  - types: ["indoor-bouldering"] → ["indoor-bouldering","top-rope"]
- line 6 `seed-1130` — Official trade name (Bolder was a misspelling) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Bolder Neoliet - Rotterdam" → "Boulder Neoliet Rotterdam"
- line 7 `g-db0f20b48a` — Type tags: the official site lists 40+ rope / auto-belay routes besides bouldering (verified 2026-10-04)
  - CORRECTS identity (types; the stored slug and every other field stay as they are):
  - types: ["indoor-bouldering"] → ["indoor-bouldering","top-rope"]
- line 8 `seed-1285` — Same venue (Idlhofgasse 74) now named Kletterhalle Graz under a new operator (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "City Adventure Center CAC - Graz" → "Kletterhalle Graz"

## Warnings

- `rename` × 5: lines 3, 4, 5, 6, 8

