# Import dry-run: 2026-11-22-cn-banana-names

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

Index: 3658 known gyms (sha256 e44702806afb…). Plan: 843ca19f61ae… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (10)

- line 1 `seed-533` — Chinese name and address from the operator's official store list (sh-kerry)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 2 `seed-534` — Chinese name from the operator's official store list (sh-yananxi)
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 3 `seed-637` — Chinese name from the operator's official store list (bj-shangdi)
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 4 `seed-711` — Chinese name from the operator's official store list (cs-zhujiang)
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 5 `seed-712` — Chinese name from the operator's official store list (cs-yuefang)
  - FILLS gym information (only if empty in production; never overwrites): name_local
- line 6 `seed-714` — Chinese name and address from the operator's official store list (hz-raffles)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 7 `seed-715` — Chinese name and address from the operator's official store list (hz-xixi)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 8 `seed-716` — Chinese name and address from the operator's official store list (hz-aoti)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 9 `seed-735` — Chinese name and address from the operator's official store list (gz-junchao)
  - FILLS gym information (only if empty in production; never overwrites): name_local + address_local
- line 10 `seed-755` — Chinese name from the operator's official store list (zh-leshi)
  - FILLS gym information (only if empty in production; never overwrites): name_local

