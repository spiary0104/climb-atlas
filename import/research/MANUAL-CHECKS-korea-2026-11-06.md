# Manual checks (owner): Korea follow-up pass, 2026-11-06

**Result: no new gym could be accepted in this pass; nothing staged.** The 2026-10-12 passes (PR #83) already swept Naver Place and
Kakao Map for all provinces (see each section's `coverage.md`: saturation reached, 73 gyms deferred). This pass could only use
WebFetch/WebSearch, and the primary sources that decide those deferrals are not reachable that way. Checked 2026-11-06:

| Source needed (primary kind) | Result with WebFetch/WebSearch |
|---|---|
| Naver Place pages (`m.place.naver.com`, official-social) | tool refuses the host |
| Naver blogs (`blog.naver.com`) | tool refuses the host |
| Instagram (e.g. `instagram.com/seoulforest_climbing`) | returns an empty login shell, no text |
| The Climb site (`theclimb.co.kr`) | TLS error (self-signed certificate) |
| Climbing Park / other chain domains guessed | do not resolve; WebSearch finds no official branch list |
| Kakao Map | reachable but is a `directory` (supporting only, never primary) |
| General web search for Korean gym openings (Gangwon, chain branches) | nothing newer than 2026-10-12 coverage; only third-party aggregators |

Consequently none of the earlier deferrals (Newbie Suseong, Club Climbing Ansan, Grippick, Kim Dae-woo, Otter Climbing, the 73 listed in
`MANUAL-CHECKS-korea-2026-10-12.md`) could be resolved with primary evidence; they all remain open and unchanged. Nothing was guessed.

## What would unblock a next pass
- A session with Naver Place / Instagram access (logged-in browser on the owner's side), or the owner pasting the gyms' own
  posts, for the 73 deferred gyms; resolving those is more valuable than new discovery.
- Chain branch lists from the chains' own sites (The Climb, Climbing Park, Seoul Forest Climbing, Sports Island) fetched from a
  machine with a working TLS chain, to catch branches opened after 2026-10-12.
- Live Bouldeer KR count before PR #83: 135 (Seoul 32, Gyeonggi 24, Busan 13, Gwangju 13, Jeonbuk 7, others <= 5); #83 stages ~120 more.
  Largest remaining gaps per `docs/research/coverage-gap-2026-10/ranking-cities.md` after #83: Seoul districts (~118 estimated missing, 2026-10-06 kr-seoul batch covered part), Gyeonggi, Busan.
