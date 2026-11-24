# Import dry-run: 2026-11-24-owner-fixes

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 4 |
| Retire existing gyms (closed / duplicate: status becomes rejected, record kept) | 3 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 7 |

Index: 3651 known gyms (sha256 ee0e0c45b261…). Plan: 1757589f1ab4… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (4)

- line 4 `g-02f57d3060` — Rebranded: Arkose says Bloc en Stock is now Arkose Strasbourg Meinau (same address).
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Bloc en Stock" → "Arkose - Strasbourg Meinau"
- line 5 `seed-1254` — Name typo: the gym is Uadibloc (one u), as on its own site and social accounts.
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Uuadibloc - Madrid" → "Uadibloc - Madrid"
- line 6 `seed-1060` — Stuntwerk has two Cologne halls; Zollstock is listed separately (g-01e07290ea), so this record is Koeln Muelheim.
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Stuntwerk Köln" → "Stuntwerk Köln Mülheim"
- line 7 `seed-1046` — Mandala has two Dresden halls; this record predates Postplatz (opened 2024), so it is the original hall at Zeitenstroemung.
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "Mandala Boulderhalle" → "Mandala Boulderhalle Dresden Zeitenströmung"

## Retirements of existing gyms (3)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 1 `g-5d90436009` "Sandstein Boulder Halle Aschaffenburg" (DE) — closed: Closed permanently in mid-November 2026 (high rent, too few summer visitors); its website is offline and the space goes to a fitness studio.
- line 2 `seed-1845` "GoNature Climbing Gym" (HK) — duplicate of `seed-1847`: GoNature now gives only the Sha Tin address (Belair Gardens, 52 Tai Chung Kiu Road), the same as Hong Kong Climbing Park (seed-1847); Kwun Tong no longer listed.
- line 3 `seed-994` "Climbing Factory" (DE) — closed: Climbing Factory closed in early 2026; DAV Nuernberg was still examining a takeover as of 05.08.2026 with no decision, so the hall is not open.

## Warnings

- `duplicate-far-apart` × 1: lines 2
- `rename` × 4: lines 4, 5, 6, 7

