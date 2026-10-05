# Import dry-run: 2026-10-05-owner-checks-info

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 7 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 7 |

Index: 2419 known gyms (sha256 e50072d61b4c…). Plan: 30fae7ab0415…

## Updates to existing gyms (7)

- line 1 `g-039b6ea9b5` — Website (the gym Instagram, owner request) and opening hours from the official site
  - FILLS gym information (only if empty in production; never overwrites): website instagram.com + hours mon,tue,wed,thu,fri,sun
- line 2 `g-ddbd31743b` — Website and opening hours (official site; confirmed by the owner 2026-10-06)
  - FILLS gym information (only if empty in production; never overwrites): website adventure-hub.com + hours mon,tue,wed,thu,fri,sat,sun
- line 3 `g-9be2fb9806` — Website and opening hours (official site and Instagram; confirmed by the owner 2026-10-06)
  - FILLS gym information (only if empty in production; never overwrites): website elroko.com + hours mon,tue,wed,thu,fri,sat,sun
- line 4 `g-569cef7574` — Website and opening hours from the official site
  - FILLS gym information (only if empty in production; never overwrites): website freeclimbingpalermo.wordpress.com + hours mon,tue,wed,thu
- line 5 `g-6a37cf87df` — Website and public opening hours (owner manual check 2026-10-06)
  - FILLS gym information (only if empty in production; never overwrites): website thebaseschmoelln.de + hours wed
- line 6 `g-c3eb253cd7` — Official website
  - FILLS gym information (only if empty in production; never overwrites): website zuckerturm.de
- line 7 `g-f412ee9caf` — Official cafe as its website
  - FILLS gym information (only if empty in production; never overwrites): website cafe.daum.net

