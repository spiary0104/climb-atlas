# Import dry-run: 2026-10-04-identity-fixes-2

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 16 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 16 |

Index: 2293 known gyms (sha256 af9c78d5f3ee…). Plan: ce2fa97f8949… Also compared against staged batches: 2026-10-04-review-new-gyms.

## Updates to existing gyms (16)

- line 1 `seed-1265` — Official name changed (same venue, same address) (verified 2026-10-04)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Vertigo - Lisboa" → "Vertigo Oriente"
- line 2 `seed-970` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Freiburg" → "Villingen-Schwenningen"
- line 3 `seed-986` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Freiburg" → "Laufenburg (Baden)"
- line 4 `seed-1019` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Freiburg" → "Waldshut-Tiengen"
- line 5 `seed-1065` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Freiburg" → "Villingen-Schwenningen"
- line 6 `seed-971` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Tübingen" → "Ravensburg"
- line 7 `seed-1005` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Tübingen" → "Albstadt"
- line 8 `seed-1017` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Stuttgart" → "Ludwigsburg"
- line 9 `seed-1054` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Stuttgart" → "Böblingen"
- line 10 `seed-888` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "West Yorkshire" → "Brighouse"
- line 11 `seed-872` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Winchester, Hampshire" → "Romsey"
- line 12 `seed-1006` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Darmstadt" → "Frankfurt am Main"
- line 13 `seed-1033` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Oberbayern" → "Weyarn"
- line 14 `seed-976` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Dresden" → "Radebeul"
- line 15 `seed-988` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Dortmund, Arnsberg" → "Dortmund"
- line 16 `seed-1047` — Suburb corrected to the town of the official address (verified 2026-10-04)
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "Duisburg, Düsseldorf" → "Duisburg"

## Warnings

- `rename` × 1: lines 1

