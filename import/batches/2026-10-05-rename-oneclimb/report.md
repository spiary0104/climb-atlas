# Import dry-run: 2026-10-05-rename-oneclimb

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

Index: 2385 known gyms (sha256 e1d9ef5216f8…). Plan: 9d9d9e3b735e… Also compared against staged batches: 2026-10-05-korea-holds, 2026-10-05-uk-holds-gaps, 2026-10-06-france-holds, 2026-10-06-germany-holds, 2026-10-06-italy-holds-napoli.

## Updates to existing gyms (1)

- line 1 `seed-1181` — Same gym, new name: the Naver Place listing and Instagram at 2 Nakseon-gil, Haeryong-myeon now trade as 원클라임 (OneClimb)
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Monta Rex" → "OneClimb"

## Warnings

- `rename` × 1: lines 1

