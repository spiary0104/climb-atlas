# Manual checks: Japan Kansai (2026-10-06-jp-kansai)

Owner rule applied: low-confidence gyms are kept out. Each line below needs one answer (a quick look at the gym's Instagram or X:
"is there a post from 2026?" or the specific question). Claude then adds the gym through a small follow-up section. Candidate ids
(jpk-nnn) are in `candidates.ndjson`; pins are already geocoded for them.

## A. Deferred candidates (23): site is live but undated or stale

| # | Gym (cid) | Town | Open | Question | Findings |
|---|---|---|---|---|---|
| 1 | Climbing Gym Galera (jpk-015) | Taisho, Osaka | https://galera-climbing.com/ | Any post or booking from 2026? | Newest notice 2025-12-16; hours and web booking are live |
| 2 | CRUX Osaka (jpk-016) | Suita, Osaka | https://www.crux-jp.com/ | Any post from 2026? | Live prices/hours and online reception, no dated news; chain site dropped the Kyoto store |
| 3 | Siesta Yoshida (jpk-017) | Higashi-Osaka | https://www.siesta-climbing.com/ | Still open? | No dated post, copyright 2015 |
| 4 | Siesta Takaida (jpk-018) | Higashi-Osaka | https://www.siesta-climbing.com/takaida/ | Still open? | No dated post, copyright 2016 |
| 5 | SAN Climbing Gym (jpk-019) | Kaizuka | https://www.san-climbing-gym.com/ | Still open? | Jimdo site, no 2026 entry |
| 6 | Sanyo Climbing Gym (jpk-020) | Kishiwada | https://sanyoclimbinggym2008.jimdofree.com/ | Still open? | One undated page |
| 7 | MAHOROBA FOREST (jpk-021) | Tennoji, Osaka | https://www.mahorobaforest.com/ | Still open? | Calendar page empty, copyright 2015 |
| 8 | FunC2 (jpk-022) | Asahi, Osaka | https://func2.jp/ | Still open? | Newest news is from 2017 |
| 9 | MINORITE (jpk-023) | Osakasayama | https://minorite.jp/ | Still open? | Newest dated items 2019-2020 |
| 10 | Suhara Climbing Gym Ikeda (jpk-024) | Ikeda | http://suharagym.com/ | Still open? Also Takarazuka store (no candidate yet, same site and answer) | Newest post 2024-03-04 |
| 11 | Climbing Gym LINKS (jpk-025) | Daito | http://www.climbing-links.com/ | Any post from 2026 (Twitter @links_clgym_tw)? | Banner "2025/07: 24-hour operation, 1F extended" |
| 12 | Mizuno Sports Plaza Kobe Wadamisaki (jpk-033) | Hyogo, Kobe | https://shisetsu.mizuno.jp/MSS-7365 | Can anyone walk in for bouldering, or members/rental groups only? | Bouldering calendar posted 2026-10-01; multi-sport venue |
| 13 | Boulder Plus (jpk-034) | Toyooka | https://www.boulderplus.net/ | Still open? | Live hours and prices, no dated post |
| 14 | Bouldering Gym Style (jpk-035) | Amagasaki | https://boulderingstyle.com/ | Still open? | Newest dated item January 2023 |
| 15 | DAWN Climbing Gym (jpk-036) | Amagasaki | https://www.dawn-cgym.com/ | Still open? | No dated post |
| 16 | Hinotama Wall (jpk-037) | Kakogawa | https://www.hinotamawall.com/ | Still open? | Wix site, no dated post |
| 17 | Chargo Climbing Gym Hanada (jpk-038) | Himeji | http://chargo.info/ | Still open, and where is the entrance? (pin is only town-level) | Static site, no dates |
| 18 | OLD BUT GOLD (jpk-039) | Nishinomiya | https://oldbutgold-gym.com/ | Any post from 2026? | Newest notice 2025-07-27 |
| 19 | CAL-COLO Kizugawa (jpk-044) | Kizugawa, Kyoto | https://cal-colo.com/ | Still open? | Opened 2023-04-22, no dated news; sister gym in Umeda is already listed |
| 20 | GRANDWAZOO Osaka Kashiwara (jpk-048) | Kashiwara | https://grandwazoo-climbing.com/ | Has it closed? | Chain site's /osaka/ page returns "not found", only the Nara store is shown |
| 21 | NEON CLIMBING GYM (jpk-050) | Sakurai, Nara | https://neon-climbinggym.com/ | Any post from 2026? | Newest news 2025-08-21 (promotional text) |
| 22 | Rock Mate Otsu (jpk-053) | Otsu | http://rockmate.jp/shiga/ootsu/ | Any post from 2026? | News archive ends 2018; live hours and prices |
| 23 | Bouldering Space APE (jpk-056) | Wakayama | https://tooll.jp/ | Any post from 2026? | No dated entry |

## B. Leads without a candidate (site unreachable, no address, or type not established)

| # | Gym | Town | URL | Question |
|---|---|---|---|---|
| 24 | LUCLU Kyoto | Kyoto | https://www.luclu.net/ | Opened 2026-09-19 per the Neyagawa gym's site. What is its address (not on the page)? |
| 25 | HAGO | Suita | http://www.bouldering85.com/ | Site does not connect; open? (rockgym.jp updated 2025-12) |
| 26 | CRONICO | Toyonaka | https://cronico.jp/ | Site returns 403 to our fetch; open now? |
| 27 | 6.spider (Rock Spider) | Tennoji, Osaka | directory only | Has any site/Instagram; open? |
| 28 | Fellows Climbing | Kashiba, Nara | https://www.fellows-climbing.com/ | Site returns 403; open now? |
| 29 | Aogaki | Yamatokoriyama | https://cg-aogaki.com/ | Site does not connect; open? |
| 30 | Community Park OTSUKYO | Otsu | https://communitypark.info/otsukyo/ | Site returns 403; open now, bouldering? |
| 31 | cocomo (Sumoto) | Sumoto, Awaji | http://cocomo550.com/ | Site returns 403; open now? (not the same gym as COCOMO Minamiawaji, jpk-026) |
| 32 | BOSSA | Nagata, Kobe | http://bossa-cl.com/ | Domain is now parked; closed? |
| 33 | Bouldering Life | Himeji | https://geekout-life.com/ | Site is password-protected; open? |
| 34 | RIVERSTONE | Sumoto | no site | Open? Any Instagram? |
| 35 | Freeze's Cave Tanba | Tamba | https://www.freescave.com/tanba | Domain taken over by spam; open? |
| 36 | milnorte | Kita-ku, Kyoto | https://milnorte.com/ | Site does not connect; open? |
| 37 | Ruka ra Ghaam | Nagaokakyo | http://rukaraghaam.net/ | Blog stops in 2021 and never names bouldering; open, bouldering? |
| 38 | FUSHIMITTO | Fushimi, Kyoto | via search results | Fitness club with a bouldering wall: list it? |
| 39 | You-Rock Bouldering Gym | Maizuru | https://you-rock-bouldering.com/ | Taken over from Freeze's Cave Maizuru in 2023, one blog post (2023-05); open now? |
| 40 | Nishikita Climbing Wall | Nishinomiya | https://nisikita.exblog.jp/ | Self-service wall (500 yen/day, post 2026-02-01): does it have bouldering? |
| 41 | UP Climbing Gym | Iwade, Wakayama | https://www.climbing-net.com/gym_detail/up-climbing-gym/ | A source says closed; open? |
| 42 | WAGOMU Climbing Gym (existing seed) | Nagata, Kobe | https://www.wagomu.jp/ | The Bouldeer pin is about 4 km from the address rockgym.jp lists; site does not connect. Where is it? |
