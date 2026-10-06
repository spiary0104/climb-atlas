# Import dry-run: 2026-10-06-small-fixes

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 3 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 3 |

Index: 2419 known gyms (sha256 e50072d61b4c…). Plan: 118962fd27d1…

## Updates to existing gyms (3)

- line 1 `seed-903` — Name capitalisation: the gym is White Spider (Spider Climbing group site)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "white Spider" → "White Spider"
- line 2 `seed-1028` — The hall is in Kirchheim bei München (Heimstetten), not München: its own address Sonnenallee 2, 85551 Kirchheim bei München
  - CORRECTS identity (suburb; the stored slug and every other field stay as they are):
  - suburb: "München, Oberbayern" → "Kirchheim bei München"
- line 3 `seed-1413` — Address typo (Rua Cristóvão Chiarada) and a pin shared with Das Pedras 4 km away; the gym is at Av. Dep. Cristovam Chiaradia 155, Buritis (CEP 30575-815); pin = that postcode block (street level)
  - address: "Rua Cristóvão Chiarada 155, Belo Horizonte, Brazil" → "Avenida Deputado Cristovam Chiaradia 155, Buritis, Belo Horizonte, 30575-815"
  - lat: -19.9472962 → -19.978388
  - lng: -43.9352098 → -43.9737288

## Warnings

- `large-pin-move` × 1: lines 3
- `rename` × 1: lines 1

