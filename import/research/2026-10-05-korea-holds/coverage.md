# Coverage: Korea Gwangju + Jeollanam second pass (2026-10-05-korea-holds)

## Result
- 6 candidates (kr-h-001..006), 18 sources registered. Reconcile: ready 0 | review 4 | blocked 2 | existing 0 | invalid 0.
- Decisions: accept 3 (Climb Lounge, Hwasun Rock Climbing Center, Yeosu Climbing Gym), same-as 1 (Grabit Climbing = seed-1175, location-update follow-up), defer 2 (Hwang Pyeong-ju Climbing Class, Mokpo International Sport Climbing Center; see MANUAL-CHECK.md), reject 0.
- The section id carries 2026-10-05 because the CLI stamps the date in UTC; research was done on 2026-10-06 and review.json says so.

## What changed since the first pass (2026-10-05-korea-gwangju-jeollanam)
The first pass read the Naver Place text, price list and hours. This pass also read what the owner uploads to the same listing (business photos and price-sheet images, fetched from the listing's image host), the gyms' own blogs (RSS for the full post list and post pages for photos), and Kakao for a pin cross-check.
| Gym | Source that settled it |
|---|---|
| Climb Lounge | owner photos on its Naver Place (uploaded 2022-12-22): crash-mat walls with numbered problem tags; price sheet 2026-04-03, MoonBoard poster 2026-05-06; Instagram bio and posts to 2026-10-02 |
| Grabit Climbing | same address as seed-1175; own blog post 2025-03-09 (junior bouldering party); live hours incl. 2026-10-05 and 2026-10-09 |
| Hwasun Rock Climbing Center | own blog cobo365: 2022-10-14 and 2021-11-19 posts (photos checked: bouldering room with crash mats); open from live hours, 2026-04-03 blog post, Instagram to 2026-09-27 |
| Yeosu Climbing Gym | owner photo 2021-06-01 (numbered tape tags, crash mats); price sheet 2026-07-13; live hours and Naver booking |
| Hwang Pyeong-ju Climbing Class | own blog: "not a bouldering business" and bouldering sessions at another gym; owner photos show a mat-floored training hall; public access unproven |
| Mokpo International Sport Climbing Center | nothing primary readable (Daum cafe, unmanaged Naver listing); directories only |

Coordinates: gym's own Naver Place pin (`map-service-pin`, precision `building`) for all six; Kakao Map pin within 38 m (Climb Lounge) or 3 m (the other five).

## Limits
- Instagram content is not readable without a login; the fetch tool returns only the profile header and sometimes post dates. No Instagram claim here rests on caption text.
- Photos were inspected for Climb Lounge, Hwasun, Yeosu, Hwang Pyeong-ju. Photos were not inspected for Grabit (same-as, not needed) or Mokpo.
