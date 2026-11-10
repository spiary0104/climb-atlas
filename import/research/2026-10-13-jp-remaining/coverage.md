# Coverage: Japan Tohoku / Chugoku / Shikoku / Okinawa (2026-10-13)

## Result
- 24 candidates, all accepted for staging (batch 2026-10-13-jp-remaining); no candidate was left deferred in review.json: everything uncertain is in MANUAL-CHECK.md (about 50 gyms, grouped by what is missing).
- Discovery: rockgym.jp prefecture lists (16 prefectures, ~110 entries, page dates 2025-11 to 2026-08), OSM via Photon/Overpass (sparse: Overpass answered only for Tohoku and Shikoku with 9 objects; Okinawa has none), Instagram public embeds for recency. Web search was nearly useless for Japanese gym names (3 queries used).
- Recency evidence: gyms' own Instagram embeds (post timestamps read 2026-10-13) and dated posts on own sites. Directory status alone was never trusted.
- The 2026-10-06 sections already covered Miyagi/Sendai (6 gyms), Hiroshima (7), Okayama (6) and Okinawa (8); this section only added what they left open.

## By prefecture (estimate = rockgym.jp count 2025-11/2026-08, a floor not a census)
| Prefecture | Directory | Already in Bouldeer | Accepted here | Deferred / leads (MANUAL-CHECK) |
|---|---|---|---|---|
| Aomori | 7 | 0 | 3 (glide, 2ND WALLY, North Rock) | TAiiKU (fitness), RAT Aomori + RAT Wall Hirosaki (no readable own source), Mutsu arena (municipal) |
| Iwate | 5 | 0 | 1 (Clambon) | Crager's, THE STONE SESSION, ONE MOVE (bouldering/own source unclear), Iwate Kenei (municipal) |
| Miyagi | 11 | 6 | 0 | Kotih (403), Matsu (shop), Moment Sendai-Minami (OSM only), BOLZ school, Genki Field (municipal) |
| Akita | 6 | 0 | 3 (TO-DO, Un Rocher, Freaky) | Garapaka (site 404), Taka, SUNBOW |
| Yamagata | 4 | 0 | 1 (Bouldering House 358) | FLAT and Nobaria (open, pin), Youzan wall (NPO), Key Stone (OSM only) |
| Fukushima | 11 | 0 | 4 (Drop in, Movement, Nanashino, Varappe) | Diverse, Gens d'armes Iwaki, Trailrock, Romanov, Rock & Fiddle, Skypia, Hale Rock |
| Tottori | 3 | 0 | 1 (Babaanz) | Kurayoshi (prefectural), Monkeypod |
| Shimane | 6 | 0 | 4 (Trans, BoulderBase, M Wall, K Climb) | Kabeya, Home (pin) |
| Okayama | 9 | 6 | 1 (rocks Kurashiki) | Healthpia, F.T, Yuhara (municipal) |
| Hiroshima | 10 | 7 | 0 | Guts Kure, SORA Fukuyama (undated), Solae (athletic park) |
| Yamaguchi | 6 | 0 | 3 (Unity, 9A, Labo Yamaguchi) | Rub a Dub, LABO Kudamatsu, Seminar Park (municipal) |
| Tokushima | 3 | 0 | 1 (Join) | Roots, Lion (open, pin) |
| Kagawa | 6 | 0 | 0 | STANCE, MINA. UTARI, iTTE Takamatsu (open, pin); High-Land, Jumbo, OWL |
| Ehime | 9 | 0 | 1 (iTTE Ehime) | BRAVE (pin), P-SPO24 (fitness), CROSSPOINT, Uwajima, Ishizuchi/Uwajima sports (municipal), Ascent Ray (dead) |
| Kochi | 3 | 0 | 1 (Allez) | Stone LAV, Motoyama (municipal) |
| Okinawa | 8 | 8 | 0 | TOPOUT and KORUPIKI closed (not candidates); the rest were added on 2026-10-06 |

(Accepted by prefecture: Aomori 3, Iwate 1, Akita 3, Yamagata 1, Fukushima 4, Tottori 1, Shimane 4, Okayama 1, Yamaguchi 3, Tokushima 1, Kagawa 0, Ehime 1, Kochi 1 = 24.)

## Method notes
- Tools: curl for pages (own-site dates, news sub-pages, Last-Modified), Instagram embeds (post timestamps and caption keywords), GSI address search (house/parcel/block level read from the result title), Photon for OSM names. Overpass was unreliable (timeouts).
- Pin rule applied: GSI house or parcel result > OSM object named after the gym > gym's own map embed; a street-level or conflicting pin (GSI and embed more than 150 m apart with no third source) kept the gym out. rockgym.jp's own map was never used as a pin.
- Not reachable or not readable from our IP: bolz-school.com, kotih.com, unity-c.net, X and Facebook; several own sites are JavaScript-only or undated.
- Chains: no B-PUMP, Base Camp, ROCKY or D.Bouldering store in this scope beyond the ones Bouldeer already has (D.Bouldering Sendai Nagamachi, Okinawa x2). B'nuts, iTTE (Takamatsu, Matsuyama), Stone LAV, LABO (Yamaguchi, Kudamatsu), STANCE/OWL (Takamatsu) are independents or small chains with separate sites.
