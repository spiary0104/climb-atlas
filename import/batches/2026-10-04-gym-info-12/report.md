# Import dry-run: 2026-10-04-gym-info-12

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 0 |
| Retire existing gyms (closed / duplicate: status becomes rejected, record kept) | 47 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 47 |

Index: 2342 known gyms (sha256 19b373023bbb…). Plan: e75a3401b927…

## Retirements of existing gyms (47)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 1 `seed-1082` "Le 8 assure - Paris" (FR) — closed: Association club training at municipal centres; no public opening or day pass (own FAQ: no trial sessions)
- line 2 `seed-698` "Banana Climbing (Qincheng Wanxiang Mall)" (CN) — duplicate of `seed-693`: Duplicate of Banana Climbing (Qincheng MixC World): the chain lists one Qincheng location, L501 in the same mall
- line 3 `seed-636` "Banana Climbing (Dongsheng Xiaoyuehe)" (CN) — closed: Address (768 Creative Park) matches the Banana location the chain marks as closed
- line 4 `seed-49` "BOUNCE Hendra" (AU) — closed: Not a climbing gym: a trampoline and adventure park with one climbing wall as an attraction
- line 5 `seed-63` "Rockface" (AU) — closed: Official domain rockface.com.au now redirects to an unrelated site; no current presence found
- line 6 `seed-1524` "Golem Escalada" (AR) — closed: No current presence: the only web source is a news blog last updated 2011
- line 7 `seed-66` "Adelaide's Bouldering Club (BoulderZone)" (AU) — closed: No longer a public gym at this address: now a youth athlete club based at Urban Climb Adelaide
- line 8 `seed-69` "Beyond Bouldering" (AU) — closed: Closed permanently on 10 Jan 2024, per the operator
- line 9 `seed-1496` "Climb Academy" (BG) — duplicate of `seed-1499`: Duplicate of Momentum Climbing Sofia: climbacademy.eu is its kids academy at the same address
- line 10 `seed-1406` "FABRICA Escalada - Itaim" (BR) — closed: Closed: the operator lists only its Chácara and Vila Madalena units
- line 11 `g-4b38ee73ee` "Structure Pan d'Escalade" (CH) — closed: Did not reopen on 17 Aug 2026 after an inspection; the gym says it may not reopen
- line 12 `seed-1456` "Climbing Gym Holešovice" (CZ) — closed: Closed: reported closed on 31 Dec 2022 for redevelopment; official domain now redirects to an unrelated site
- line 13 `seed-1249` "Salamandra Boulder Café - Madrid" (ES) — closed: Closing permanently: the gym's homepage notice of 12 Sep 2026 says the climbing wall is closing for good
- line 14 `seed-1020` "HotzenBlock Bouldering" (DE) — duplicate of `seed-1019`: Duplicate of HotzenBlock: one gym (Waldshut-Tiengen) listed twice
- line 15 `seed-1044` "LÖ bloc - die Boulderhalle" (DE) — closed: No longer LÖ bloc: the hall at Im Fallberg 6 now runs as BoulderCenter Grenzach-Wyhlen and closes permanently after 31 Oct 2026
- line 16 `seed-879` "Parthian Climbing Manchester" (GB) — closed: Closed: the operator no longer lists a Manchester centre (its Manchester pages redirect or return 404)
- line 17 `seed-905` "Undercover Rock" (GB) — duplicate of `seed-889`: Duplicate of TCA The Church: the same climbing centre in St Werburgh's Church, Mina Road, Bristol
- line 18 `seed-944` "Hang On Climbing Centre" (GB) — closed: Closed: the official site says permanently closed as of 14 March
- line 19 `seed-1442` "Epos Filis, Climbing Hall" (GR) — closed: Not a public climbing gym: a mountaineering club with no public opening hours or day entry
- line 20 `g-4ca135ca76` "Alé Climbing Hyehwa (알레클라이밍 혜화)" (KR) — closed: Probably closed: listed as closed (2023-10-24) in the business registry; no current own web presence
- line 21 `seed-1066` "urban apes Boulderquartier Hamburg" (DE) — closed: No such location: urban apes lists Hamburg Ost, St. Pauli and West, none named Boulderquartier or at this pin
- line 22 `seed-975` "Bouldercity Dresden" (DE) — closed: Not a public gym since March 2025: a members-only club hall with no public day entry
- line 23 `seed-1364` "HikeandClimb" (IE) — closed: Not a climbing gym: a guiding and course company whose indoor courses run at Awesome Walls Dublin
- line 24 `seed-1362` "The Wall Climbing Gym" (IE) — closed: Closed at this location: the site says it has moved (to Bloc Dublin) and shows the gym as closed
- line 25 `seed-1595` "Kirono Climbing Gym" (IL) — closed: No current presence: the domain no longer resolves and the wall was reportedly dismantled in 2019
- … and 22 more (see plan.json)

## Warnings

- `duplicate-far-apart` × 5: lines 2, 14, 17, 30, 34

