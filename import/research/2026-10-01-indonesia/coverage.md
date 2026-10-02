# Coverage: Indonesia (ID), 2026-10-01

## Result
9 candidates in candidates.ndjson (check.js: ready 0 | review 7 | blocked 2 | existing 0 | invalid 0), 8 registered sources, about 22 further gyms or doubtful venues in unlocated.md (12 of them probably open with bouldering).

Candidates: Boulder Planet (Jakarta Barat), Indoclimb x3 (FX Sudirman, Kuningan City, Lippo Mall Kemang), Dreamstone Alam Sutera (Tangerang), Goodang Bouldering (Bandung), Bali Boulder (Sanur), plus two blocked ones (Boulder Climbing Gym in Boxies 123 Mall, Bogor: bouldering unknown from primary page; Bali Climbing Canggu: status not confirmed).
"review" flags are only single-source (all primary evidence comes from each gym's own site) and same-website for the three Indoclimb branches (one chain site, three branches).

## Cities covered
Jakarta (all districts), Tangerang / Tangerang Selatan, Bogor, Bandung, Surabaya, Yogyakarta, Semarang, Medan, Makassar, Bali (Canggu, Pererenan, Seminyak, Sanur, Ubud). Only brief searches for Malang, Solo, Balikpapan, Batam, Lombok, Palembang, Pontianak (nothing found).

## Main sources
Gym websites (several are script-rendered apps; read through page code and the booking platform's public location list, which carries lat/long), host-mall page, Instagram profiles, directories (indoorclimbing.com, Brocnbells, thecrag, Mountain Project, TripAdvisor) and Indonesian news/blogs as leads only. OSM extract used for Bali Climbing (node/5666666835) and to rule out others: it has very little for Indonesian indoor gyms (about 61 elements, mostly outdoor crags or school/stadium walls; only Bali Climbing and Class5 are named indoor gyms).

## Why so few located
The brief allows only OSM, an official-site pin, or a chain list for coordinates. OSM has almost none of Indonesia's gyms, and most gyms publish only an address or a text map query (Rock Island, Monk, Klimb, Peak to Peak blocked) or live on Instagram only. Those went to unlocated.md rather than guessing. Priority for a later pass: Dreamstone Kelapa Gading, Rock Island, Alpine Outpost, Climb ON, Manjat (Bandung), Peak to Peak, Ape Boulder Camp, Klimb, Monk, Boulder House (Makassar), RC Boulder (Medan), Phyxius.

## Probably missing
New gyms opened 2025-2026 that have only Instagram presence (Jakarta, Bali, Bandung, Yogyakarta, Medan, Makassar), small studio walls, and anything in cities I only skimmed. Bouldeer's existing 9 Indonesian entries were not looked at (reconcile step); none matched here, but check.js reports 0 "existing", so the reviewer should compare the unlocated gyms against them too.

## Access problems
- OSM/ID.json was initially an Overpass error page (regex failure); re-fetched file was used.
- bali-climbing.com now redirects to an unrelated gambling site (domain apparently lost); not opened beyond the redirect check.
- peaktopeakclimbing.com blocked access (Wordfence 503).
- bremgraindonesia.com, manjatclimbing.com, phyxius.com and similar guessed domains did not connect.
- Instagram/Facebook give only profile titles to a plain fetch; no post contents, so social-only gyms have no checked opening status.
- The shared Playwright browser was being used by other agents (page switched mid-session); a separate browser pane was used for the rendered pages.

## Notes for the reviewer
- Bali Boulder (id-007) is in soft opening per its page; Indoclimb Kemang (id-004) also states soft opening.
- Boxies coordinates are the mall pin; Boulder Planet coordinates come from the Wix business-location data (mall level).
- Bali Climbing has two OSM features (node/5666666835, way/1069153291) for one gym.
