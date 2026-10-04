# Import dry-run: 2026-10-04-identity-fixes-1

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 10 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 10 |

Index: 2293 known gyms (sha256 af9c78d5f3ee…). Plan: 7a2bec596762… Also compared against staged batches: 2026-10-04-review-new-gyms.

## Updates to existing gyms (10)

- line 1 `seed-60` — Official name changed (same venue, same address) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "City Summit" → "Oasis Climbing Gym Malaga"
- line 2 `seed-962` — Official name changed (same venue, same address) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Basement Boulderstudio" → "urban apes Basement Berlin"
- line 3 `seed-458` — Official name changed (same venue, same address) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "T-WALL Kinshicho" → "BASE CAMP TOKYO Kinshicho"
- line 4 `seed-1108` — Official name changed (same venue, same address) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Be Boulder Amsterdam" → "Boulderhal Luchthaven"
- line 5 `seed-1115` — Official name changed (same venue, same address) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Mountain Network - Amsterdam" → "Climbing Center Amsterdam"
- line 6 `seed-1121` — Official name changed (same venue, same address) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "De Klimmuur - Den Haag de Uithof" → "BOK Den Haag"
- line 7 `seed-1314` — Official name changed (same venue, same address) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Fabryczna Boulder" → "NOISE Bouldering Spot"
- line 8 `seed-1079` — Type tags corrected to what the official site states (verified 2026-10-04)
  - CORRECTS identity (types; the stored slug and every other field stay as they are):
  - types: ["indoor-bouldering"] → ["top-rope"]
- line 9 `seed-1080` — Type tags corrected to what the official site states (verified 2026-10-04)
  - CORRECTS identity (types; the stored slug and every other field stay as they are):
  - types: ["indoor-bouldering"] → ["indoor-bouldering","top-rope"]
- line 10 `seed-1257` — Type tags corrected to what the official site states (verified 2026-10-04)
  - CORRECTS identity (types; the stored slug and every other field stay as they are):
  - types: ["indoor-bouldering"] → ["top-rope"]

## Warnings

- `rename` × 7: lines 1, 2, 3, 4, 5, 6, 7

