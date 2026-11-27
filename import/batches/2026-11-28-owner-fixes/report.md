# Import dry-run: 2026-11-28-owner-fixes

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 1 |
| Retire existing gyms (closed / duplicate: status becomes rejected, record kept) | 4 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 5 |

Index: 3648 known gyms (sha256 266964b6c967…). Plan: 7c508e338be0… Also compared against staged batches: 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-kunming-changsha.

## Updates to existing gyms (1)

- line 5 `seed-1121` — De Uithof's own climbing page names the wall Klimmuur De Uithof (roped routes and bouldering, Jaap Edenweg 10); BOK is a separate bootcamp club.
  - CORRECTS identity (name; the stored slug and every other field stay as they are):
  - name: "BOK Den Haag" → "Klimmuur De Uithof"

## Retirements of existing gyms (4)

Each gym is set to `rejected` with the reason below (the moderator UI's own decision format); the row is kept, never deleted. Listed apart from location changes.

- line 1 `g-179440d317` "Gravity Bear Bouldering Gym" (US) — closed: Closed: the gym's own site says "we're closing" with last day to climb 7 Nov 2026, which has passed.
- line 2 `seed-1724` "Pirqa" (PE) — closed: Pirqa's own site says the José Gálvez 360, Miraflores gym closed on 30 Aug 2026; a new location is only planned, no address given.
- line 3 `g-8f44d0e169` "BoulderBase" (JP) — closed: BoulderBase Izumo's own site shows 閉店しました (closed); it had announced in April 2026 that it would close by end of May without a buyer.
- line 4 `seed-141` "Crux Climbing Center" (US) — closed: Crux left 121 Pickle Rd (Austin Bouldering Project took the space) and moved South Austin to 220 Ralph Ablanedo Dr, already listed as g-13c6a3645d.

## Warnings

- `rename` × 1: lines 5


## Owner check list: decision for every gym (researched 2026-11-27, official evidence only)

| # | Gym | Id | Decision | Evidence / reason |
|---|---|---|---|---|
| 1 | Gravity Bear, Tulsa | g-179440d317 | RETIRE closed | Own site: "we're closing", last day 7 Nov 2026 (passed). https://www.climbgravitybear.com/ |
| 2 | Pirqa, Lima | seed-1724 | RETIRE closed | Own site: José Gálvez 360 closed 30/08/2026; new local only "pronto", no address, so no replacement to keep. https://matiasrubiob.wixsite.com/pirqa-climbing (pirqa.com redirects here) |
| 3 | BoulderBase, Izumo | g-8f44d0e169 | RETIRE closed | Own site shows 閉店しました. https://boulderbase-izumo.com/ ; April 2026 closure/transfer notice https://izumo-unnan.goguynet.jp/2026/04/06/b-base/ |
| 4 | SPOLE, Tsukuba | g-1b002dcbb2 | HOLD (keep) | NOT closed on the evidence. The facility's own notice (https://spa-youworld.com/info/3766/, 13 Dec 2025) closes only the Spa Yu-World bath on 31 Jan 2026 and says "ボウリング、クライミング、映画館は営業してまいります". SPOLE's own site http://spoleclimbinggym.com/ still lists hours and the same address (370-1), with monthly calendar posts dated 2026-08-30, 09-29, 10-30. |
| 5 | Crux Climbing Center, 121 Pickle Rd | seed-141 | RETIRE closed | Crux moved South Austin to 220 Ralph Ablanedo Dr (already listed: g-13c6a3645d, "Crux Climbing Center South Austin"); Pickle Rd taken over by Austin Bouldering Project. https://climbingbusinessjournal.com/crux-returns-to-south-austin-with-taller-walls-outdoor-space-and-a-wellness-room/ ; https://www.kxan.com/news/local/austin-bouldering-project-to-take-over-crux-climbings-south-austin-location/amp/ ; Crux site lists Central/Houston/Pflugerville/South Austin at 220 Ralph Ablanedo. Lead for the owner: the ABP gym now at 121 Pickle Rd is not in the index (not staged; needs its own research batch). |
| 6 | Mahalo Extreme Park, Envigado | seed-1548 | HOLD (keep) | Not retired: a current official presence exists. http://www.mahaloxsports.com/ (Mahalo Action Sports Cafe & Park) says its main site is in Envigado; X account @MahaloXsports and directory pages also exist. Home page is undated and does not mention the wall, so climbing is unconfirmed but the venue is not shown closed. Searched: web (Spanish/English), official site, El Colombiano 2009 article, indoorclimbing.com Colombia directory (lists outdoor wall, 5 zones). |
| 7 | Climbing Co Fulham | g-025875152e | NO CHANGE | The reverse of the premise: The Climbing Hangar's Parsons Green gym now operates as Climbing Co (same address), so the current name is already right. No "Climbing Hangar Fulham" record exists in the index. Evidence: The Climbing Hangar's London page (via search result) says the gym continues "under Climbing Co rather than The Climbing Hangar"; direct fetch of theclimbinghangar.com/london returned 404 here, so re-check by hand if wanted. |
| 8 | Play Mountain Okazaki | g-b158de335f | HOLD | No official evidence. playmountain.jp has a broken TLS certificate (parked on a Sakura host) and could not be read; the Okazaki Facebook page title still exists; rockgym.jp (3rd party, updated 2025-12) shows it open. climbinggym-ray.com is the former Play Mountain Nagoya IC (g-2e11b2d5d0), never mentions Okazaki. Closed / renamed / still open is unknown. |
| 9 | Ozark Climbing Gym, Springdale | g-ef6f0389e0 | NO CHANGE | stoneyardclimbing.com is the Stoneyard brand site but its Springdale location (875 E Robinson Ave, same address) and nav are still titled "Ozark Climbing Gym"; no rename is announced. Production name already matches. Owner may want to decide if the brand should show as Stoneyard. |
| 10 | climbing.gym RAY | g-2e11b2d5d0 | NO CHANGE | Production name is already "Climbing Gym RAY" (not the old Play Mountain name). RAY's site writes the name "climbing.gym RAY (クライミングジム レイ)", logo "(旧)Play Mountain! 名古屋IC店"; the difference is capitalisation only, so no rename staged. https://climbinggym-ray.com |
| 11 | First Ascent West Loop | g-5649d0bd95 | NO CHANGE | Reverse of the premise: First Ascent took over the former Brooklyn Boulders West Loop (100 S Morgan St) from Feb 2026 and operates it as First Ascent West Loop (https://faclimbing.com/chicago/west-loop/, seen in search; direct fetch 403). No Brooklyn Boulders West Loop record exists in the index, and wl.brooklynboulders.com returned HTTP 402. Name is already correct. |
| 12 | EVO Rock + Fitness Portland | g-16ff5289b4 | HOLD (keep) | Salt Pump's owners bought Evo (Press Herald, 16 May 2026), but "delaying a name change until fall" (https://www.pressherald.com/?p=7644575). Both evorock.com and saltpumpclimbing.com still list it as "EVO Rock + Fitness" at 65 Warren Ave, so no official new name yet. Re-check later. |
| 13a | Climb Cleveland, OH | g-36babe30ce | HOLD | No official evidence. climbcleveland.com redirects to climbcleveland.org which redirects to a Lung Association fundraiser page. Directories conflict (mapquest/cleveland.co say closed; a May 2026 hours listing and April 2026 reviews say open). Needs a phone call or the gym's social. |
| 13b | Elite Climbing, NJ | g-c8ad94eac7 | KEEP | Own site https://eliteclimbing.com/maple-shade-nj/ says "Open 7 Days a Week", 67 Old Kings Highway, footer 2026. Closure labels on MapQuest are stale. |
| 13c | The Edge Rock Gym Miami | g-e5f92d09db | KEEP | Own site https://theedgerockgymmiami.com shows regular hours and news dated 13 Aug 2026. |
| 13d | Aiguille, Longwood FL | g-86ba9680ae | KEEP | Own site https://aiguille.com shows hours and no closure notice (footer 2023). The Climbing Business Journal closure article is from Oct 2019 (it moved to a temporary site), so it is stale. Not verified as current beyond that. |
| 13e | BOK Den Haag | seed-1121 | RENAME to "Klimmuur De Uithof" | BOK itself (https://deuithof.nl/en/bok/) is bootcamp/obstacle training, but the same venue (Jaap Edenweg 10) has the public wall Klimmuur De Uithof: https://deuithof.nl/en/climbing-bouldering/ (roped, ~130 routes on 39 ropes, plus a bouldering area; beginner lessons and reservations linked, no day-pass or hours text on the page). The separate Topzone roped course (https://deuithof.nl/en/topzone/) is group-only (5-25 people), so it was not used as the name. `types` left unchanged: the page does not mention lead climbing, so it is not removed. Open point for the owner: public drop-in access is not spelled out on the page. |
| 13f | Ethos Climbing, Toronto | g-778d964775 | KEEP | Only one Ethos record exists in the index (no duplicate found within the Queens Quay area; only Rock On Climbing nearby, a different gym). Open per Urban Toronto April 2026 photos and the Waterfront BIA listing; official site ethosclimbing.ca confirmed the name only. |
| 13g | ClimbPro Alicante | g-8cd75fe6cc | HOLD (address) | Record address "Carrer de l'Ebenisteria 1, 03007 Alicante" could not be confirmed or refuted: no official page or directory found stating a street address (EP Climbing's project page only says Alicante). Address changes cannot be staged in an identity batch anyway. |
| 13h | Arkose Canal, Bruxelles | seed-1159 | HOLD (address, for owner) | Arkose's own page (https://arkose.com/en/canal) gives "52 Willy de Bruyn Straat, 1000 Brussels"; the record says "Allée Verte 52". Allée Verte (FR) and Groendreef (NL) are a different street name for the same area, so this may be a street-name mismatch rather than a wrong pin. Not staged (identity updates allow only name/suburb/types); owner to decide on a location update batch. |

### Notes
- 5 records are staged: 4 retirements (closed) and 1 identity update (seed-1121 rename); no other identity updates were warranted by official evidence.
- Batch not applied. Retirements need the service-role flow (apply-batch.ps1) after review.
