# Manual check: uk-ie (2026-10-06)

No gym in this list needed a manual decision: all 36 were settled from a readable primary source
(official address on the gym's own site + an identified OSM element at that address). Nothing is blocked.

Optional spot checks (not blockers; the records are already written):

| Gym | URL | Question | What I found |
|---|---|---|---|
| seed-886 Rock Punk | https://www.rockpunk.co.uk/ | Is it still open? | The home page shows only "Rock Punk is unable to take bookings" (no closure statement); /location lists 26a Magdalen Street, Norwich NR3 1HU with opening hours. The pin fix is applied on the address either way. It is NOT retired (a notice alone is not proof of closure). |
| seed-898 The Hanger @ Calshot | https://www.hants.gov.uk/thingstodo/calshot/hangar/the-wall (403 to my fetcher) | Does the Hangar still have a bouldering wall? | Operator pages (seen only as search results) list a dedicated bouldering wall and opening times; the SO45 1BR address is from those results, not read directly. Pin set on OSM node "Calshot Climbing Wall" (154 m from the old pin). |
| seed-915 Rock Over Climbing | https://www.rockoverclimbing.com/manchestercentral | Is this record meant to be the Central (Cheviot St) gym? | Old pin was a house on Avian Drive, Withington (5.5 km away). Moved to Central ("first and biggest centre"). Rock Over also has Sharston and Bolton sites; if those are separate records they are not in this list. |
| seed-1359 Bloc / seed-1360 Gravity (Dublin) | https://blocdublin.ie/ , https://www.gravityclimbing.ie/ | Both sat on one pin; are both open? | Both sites list opening hours and no closure notice. Split to their own buildings (Bloc 771 m, Gravity 1864 m from the shared pin). |


## Follow-up 2026-11-11 (public-source verification)

Checked by Claude (AI) on public sources; ChatGPT leads re-verified; nothing written to production.

- **Rock Punk, Norwich (seed-886)**: STATUS: OPEN (confidence L). The home page now returns 404 to my fetcher (earlier it showed only "unable to take bookings"); neither is a closure statement. Not retired. Sources: https://www.rockpunk.co.uk/ (checked 2026-11-11). Next: owner check of its socials for a closure or reopening notice.
- **The Hanger @ Calshot (seed-898)**: STATUS: OPEN (confidence M, leaning yes). Search results for the official Hampshire County Council Hangar pages describe a bouldering wall (wall type bouldering, induction for bouldering/auto belay, helmets for under-10s on the bouldering and roped walls); the council page itself returned 403 to me, so I did not read it directly. Sources: https://www.hants.gov.uk/thingstodo/calshot/hangar , https://www.abcwalls.co.uk/wall/calshot-climbing-wall/ (checked 2026-11-11). Next: read the council page in a browser.
- **Rock Over Climbing (seed-915)**: STATUS: ALREADY RESOLVED (confidence H). The uk-cities review notes state seed-915 is the Cheviot Street (Central) centre; Rock Over Sharston and Bolton were accepted as separate candidates. Operator's locations page lists Central (Park Garage, Cheviot St), Bolton (21 Lostock Lane) and Sharston (Shentonfield Rd) with hours (it does not say "boulder"). Sources: import/research/2026-10-13-uk-cities/review-notes.md, https://www.rockoverclimbing.com/locations (checked 2026-11-11). Next: none.
- **Bloc (seed-1359) and Gravity (seed-1360), Dublin**: STATUS: OPEN (confidence M, leaning both open). Both own sites list current opening hours with no closure notice; Gravity's page mentions the 2026-27 Irish Bouldering League (round 1 17 Oct to 1 Nov 2026); Bloc's footer says 2023. Sources: https://blocdublin.ie/ , https://www.gravityclimbing.ie/ (checked 2026-11-11). Next: none required; optional check of Bloc's Instagram for 2026 activity.
