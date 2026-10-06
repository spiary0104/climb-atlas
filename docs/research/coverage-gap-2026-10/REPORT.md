# Global coverage-gap analysis and research sprint (2026-10-06)

**Question:** where is Bouldeer most incomplete relative to the real-world indoor bouldering market, and how much of that gap can
be closed now? Branch `research/2026-10-06-coverage-gap`. **Nothing was applied to production, merged or deployed.** Every new gym
below is staged through the existing research pipeline (candidates → reconcile → review → stage → validate → plan → read-only dry
run) and waits for the owner's sign-off and apply.

## Headline

- Bouldeer had **2,438 gyms** (84 countries). In the 58 countries estimated here the real-world market is **~6,770 gyms**:
  coverage **34%**.
- This sprint staged **896 new gyms** in 20 research sections (1,123 candidates checked). Applied, coverage in those 58 countries
  rises to **~48%** and Bouldeer to **~3,334 gyms**.
- 187 more candidates are real-looking but unconfirmed: each is in a `MANUAL-CHECK.md` with one question for the owner.
- **Strongest coverage:** Switzerland (77%), Lithuania, Luxembourg, Hong Kong, Israel, Ecuador, the Netherlands after this sprint (71%),
  the USA after this sprint (66%).
- **Weakest / biggest remaining gaps:** China (673, blocked on the source decision), South Korea (~375), the USA (~290, now mostly
  depth in covered metros), Japan (~250), France (~220), Germany (~200), UK (~170), Spain (~135), Italy (~130, not researched).

## Global ranking (after this sprint)

Full table: [`ranking-countries.md`](ranking-countries.md) (58 countries). Coverage = Bouldeer ÷ estimated mid. Priority weighs the
remaining gap by confidence and by how thin coverage still is (P1 highest).

| # | Country | Est. real-world (low-high) | Bouldeer before | Staged | After | Coverage | Still missing | Conf. | Priority |
|---:|---|---|---:|---:|---:|---|---:|---|---|
| 1 | China | 1050 (900-1250) | 377 | 0 | 377 | 36% → 36% | 673 | medium | P1 (blocked: source decision) |
| 2 | South Korea | 550 (400-750) | 135 | 40 | 175 | 25% → 32% | 375 | low | P1 |
| 3 | United States | 850 (700-1100) | 312 | 247 | 559 | 37% → 66% | 291 | medium | P1 |
| 4 | France | 420 (330-550) | 138 | 60 | 198 | 33% → 47% | 222 | medium | P1 |
| 5 | Japan | 540 (450-650) | 107 | 184 | 291 | 20% → 54% | 249 | medium | P1 |
| 6 | United Kingdom | 330 (270-420) | 141 | 18 | 159 | 43% → 48% | 171 | medium | P2 |
| 7 | Germany | 490 (400-570) | 160 | 133 | 293 | 33% → 60% | 197 | medium | P2 |
| 8 | Spain | 235 (190-300) | 61 | 38 | 99 | 26% → 42% | 136 | medium | P2 |
| 9 | Italy | 170 (120-260) | 40 | 0 | 40 | 24% | 130 | low | P2 |
| 10 | Brazil | 90 (70-130) | 14 | 0 | 14 | 16% | 76 | medium | P2 |
| 11 | Russia | 115 (80-170) | 26 | 0 | 26 | 23% | 89 | low | P2 |
| 12 | Poland | 110 (85-140) | 29 | 10 | 39 | 26% → 35% | 71 | medium | P2 |
| 13 | Canada | 190 (160-230) | 23 | 85 | 108 | 12% → 57% | 82 | medium | P2 |
| 14 | Czechia | 80 (60-105) | 24 | 6 | 30 | 30% → 38% | 50 | medium | P2 |
| 15 | Norway | 55 (45-65) | 20 | 0 | 20 | 36% | 35 | medium | P3 |
| 16 | Hungary | 45 (38-55) | 17 | 0 | 17 | 38% | 28 | high | P3 |
| 17 | Australia | 115 (90-150) | 66 | 0 | 66 | 57% | 49 | low | P3 |
| 18 | Austria | 80 (60-110) | 22 | 23 | 45 | 28% → 56% | 35 | medium | P3 |
| 19 | Finland | 40 (34-50) | 14 | 0 | 14 | 35% | 26 | medium | P3 |
| 20 | Netherlands | 85 (70-100) | 25 | 35 | 60 | 29% → 71% | 25 | high | P3 |
| 21 | Belgium | 65 (50-90) | 14 | 17 | 31 | 22% → 48% | 34 | low | P3 |
| 22 | Taiwan | 55 (40-80) | 22 | 0 | 22 | 40% | 33 | low | P3 |

Small countries (≤10 Bouldeer gyms) were assessed on 2026-09-30 (`docs/research/global-gap-analysis/`) and are mostly covered now.

## City ranking

Biggest metro gaps from the estimates, with what this sprint staged. Estimates per city are lower-confidence than country totals.

| Country | City / metro | Est. gyms | Bouldeer before | Staged | Still missing | Note |
|---|---|---:|---:|---:|---:|---|
| KR | Seoul | ~150 | 32 | 40 | ~78 | estimate likely high; 10 deferred |
| KR | Gyeonggi (excl. Seoul) | ~130 | 24 | 0 | ~106 | **next wave** |
| KR | Busan | ~45 | 13 | 0 | ~32 | **next wave** |
| KR | Incheon / Daegu | ~30 / ~30 | 4 / 5 | 0 | ~51 | **next wave** |
| CN | Shanghai / Kunming / Changsha | 115 / 20 / 20 | 78 / 0 / 3 | 0 | ~74 | blocked: CN source decision |
| JP | Tokyo prefecture | ~71 | 42 | 13 | ~16 | 18 deferred in jp-kanto |
| JP | Aichi (Nagoya) | ~35 | 4 | 25 | ~6 | |
| JP | Kanagawa / Saitama / Chiba | ~38 / ~31 / ~25 | 9 / 8 / ? | 16 / 9 / 6 | ~25 | |
| JP | Osaka / Hyogo | ~37 / ~24 | 6 / 3 | 13 / 7 | ~32 | 23 deferred in jp-kansai |
| JP | Fukuoka / Hokkaido | ~25 / ~21 | 3 / 2 | 15 / 6 | ~22 | |
| US | Washington DC metro | ~18 | 0 | 9 | ~9 | |
| US | Philadelphia | ~10 | 0 | 11 | 0 | |
| US | Portland OR / Phoenix / Minneapolis | ~14 / ~11 / ~14 | 1 / 0 / 0 | 11 / 6 / 5 | ~17 | |
| US | Los Angeles / New York metro | ~40 / ~35 | 18 / 15 | 0 | ~42 | **next wave** (states already covered) |
| CA | Toronto / Montreal / Vancouver | ~20 / ~18 / ~14 | 7 / 5 / 4 | ~14 / ~10 / ~8 | ~10 | |
| GB | London | ~50 (≈33 real bouldering) | 12 | 18 | ~3 | estimate corrected by research |
| GB | Manchester / Bristol / Birmingham | ~14 / ~12 / ~10 | 4 / 4 / 3 | 0 | ~25 | **next wave** |
| ES | Barcelona / Madrid / Valencia | ~30 / ~28 / ~14 | 12 / 16 / 2 | 13 / 7 / 2 | ~30 | |
| FR | Paris / Grenoble | ~40 / ~12 | 26 / 1 | 6 / 7 | ~12 | |
| DE | München / Berlin / Hamburg | ~14 / ~22 / ~11 | 5 / 11 / 4 | 5 / 0 / 4 | ~23 | Berlin not in this sprint |
| AU | Sydney / Melbourne | ~40 / ~30 | 20 / 12 | 0 | ~38 | **next wave** |
| TW | Taipei + New Taipei | ~30 | 12 | 0 | ~18 | |

Full estimate list (129 cities ≥5 short): [`ranking-cities.md`](ranking-cities.md).

## Research completed

| Section | Country | Candidates | READY | REVIEW | BLOCKED | Already in Bouldeer | Accepted (staged) | Deferred (manual) | Rejected |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| us-northeast | US | 85 | 56 | 21 | 8 | 0 | 76 | 9 | 0 |
| us-south | US | 69 | 54 | 9 | 6 | 0 | 60 | 7 | 2 |
| us-midwest | US | 74 | 42 | 16 | 16 | 0 | 58 | 14 | 2 |
| us-west | US | 60 | 36 | 17 | 7 | 0 | 53 | 6 | 1 |
| canada | CA | 97 | 63 | 26 | 5 | 3 | 85 | 8 | 0 |
| de-south | DE | 82 | 0 | 70 | 12 | 0 | 67 | 15 | 0 |
| de-west-north | DE | 76 | 52 | 20 | 4 | 0 | 66 | 9 | 1 |
| france-cities | FR | 66 | 53 | 8 | 5 | 0 | 60 | 3 | 3 |
| spain-cities | ES | 43 | 33 | 7 | 3 | 0 | 38 | 5 | 0 |
| london | GB | 21 | 18 | 0 | 3 | 0 | 18 | 3 | 0 |
| netherlands | NL | 36 | 33 | 2 | 1 | 0 | 35 | 1 | 0 |
| belgium | BE | 21 | 13 | 4 | 4 | 0 | 17 | 4 | 0 |
| austria | AT | 33 | 23 | 0 | 10 | 0 | 23 | 10 | 0 |
| czechia-gap | CZ | 10 | 6 | 2 | 2 | 0 | 6 | 2 | 1 |
| poland | PL | 17 | 9 | 1 | 7 | 0 | 10 | 6 | 1 |
| jp-kanto | JP | 72 | 34 | 17 | 21 | 0 | 51 | 18 | 3 |
| jp-chubu | JP | 88 | 42 | 12 | 34 | 0 | 54 | 33 | 1 |
| jp-kansai | JP | 59 | 29 | 4 | 25 | 1 | 32 | 23 | 2 |
| jp-kyushu-hokkaido | JP | 48 | 38 | 10 | 0 | 0 | 47 | 1 | 0 |
| kr-seoul | KR | 66 | 1 | 40 | 14 | 11 | 40 | 10 | 0 |
| **Total** | 11 countries | **1,123** | | | | | **896** | **187** | **17** |

Plus 23 candidates matched to existing gyms (same-as). READY/REVIEW/BLOCKED are the reconcile classes; REVIEW items were accepted only
with a written reason, and every low-confidence gym (no 2026 sign of being open, bouldering unconfirmed, no reliable pin, public
facility) was deferred to the owner, never accepted.

**Checks on the whole set:** all 20 batches validate and plan clean **together** (896 new, 0 probable duplicates across batches);
read-only production dry runs pass; every new gym was compared with the nearest live gym and every other new gym: the six close
pairs found were checked by address (5 are separate gyms; Boulderplanet Köln was deferred as a possible rename of Einstein Köln).
Brain review also moved 12 weak accepts to manual checks and stopped two attempts to label public facilities as commercial gyms.

## Expected impact

- **Now:** 896 genuinely new locations (+37% on Bouldeer's 2,438), after the owner's sign-off and one apply run.
- **After the manual checks:** most of the 187 deferred gyms exist and are open but lack one readable fact; ~90-120 more additions
  are realistic.
- **Data fixes found on the way** (separate small batches): ~15 existing gyms with wrong pins (e.g. Rock Oasis Toronto 6.5 km,
  Boulderz Toronto 4.3 km, Roca Osaka 1.8 km, Stuntwerk Köln placeholder, Seoul Peakers/Climb Works/Route), 3-4 probable duplicate
  pairs already in Seoul's data, and 2 French records to re-check (HAPIK Lyon; SOLO Toulouse = Bloc'n Roll?). List in `STATUS.md`.

## Recommended next wave (highest value per hour)

1. **Korea outside Seoul:** Gyeonggi, Busan, Incheon, Daegu (~200 missing). The Naver Place method worked well in Seoul.
2. **USA depth in covered states:** Los Angeles, New York, SF Bay, Chicago, Boston, Denver, Texas metros (~100+), plus the US leads
   listed in each us-* `coverage.md`.
3. **France and Germany long tail:** France outside the big cities (Normandie, Centre, Bourgogne, PACA, Occitanie), Germany's Sachsen,
   Brandenburg, MV and Berlin depth, plus the ~30 Bavarian/BW towns listed in de-south `coverage.md`.
4. **Italy** (~130 missing, not researched; needs working web search), **UK regional cities** (Manchester, Bristol, Birmingham),
   **Spain** outside the five regions done.
5. **Japan remainder:** Tohoku, Shikoku, Chugoku, and the 75 deferred Japanese gyms (mostly "posts only on Instagram").
6. **Brazil** (76 missing; the CBE map of 68 gyms is a good discovery source), **Russia**, **Australia** (Sydney, Melbourne),
   **Taiwan**, and a Poland/Czechia second pass with search.
7. **China (673)** once the owner decides whether Dianping / Amap / WeChat count as sources.

## Methodology and confidence

- **Bouldeer counts:** live production (public read), 2026-10-06, per country and per metro (lat/lng radius or district).
- **Real-world estimates:** four regional estimation workers, each required to find at least two independent sources per country
  (federation/alpine-club hall lists, chain location totals, industry reports such as Climbing Business Journal, national directories,
  local-language counts) and to give low/mid/high with a confidence. Sources and methods per country are in the four JSON files.
  Strongest: USA and Canada (CBJ + multiple directories), Japan (rockgym.jp prefecture tables + trade press), Germany (DAV),
  Netherlands (NKBV), Hungary (federation list). Weakest: South Korea (no national count; scaled from Seoul anchors), Italy, Russia,
  Belgium and most of Latin America (directory floors). Directories that look derived from Bouldeer's own data were down-weighted.
- **Research checks** were stricter than the estimates: a gym counted only with its own site, official social account or chain list
  showing it open (2026 activity) with bouldering, and a coordinate from an identified source (OSM, Photon, government geocoders
  GSI/BAN/PDOK, or the gym's own map). Several estimates were corrected downwards by this (London ≈33 real bouldering gyms, not 50;
  Freiburg 4, not 6).

## Tooling observations (to make the next sprint faster)

1. **Web search quota (200 per session) ran out early** and is shared by all workers; discovery then relied on directories and OSM.
   Poland and Czechia came out thin for this reason. Give each worker a budget, or run a discovery pass first.
2. **Nominatim rate-limits a shared IP** (HTTP 429) with several workers; Overpass public servers were mostly unreachable. Photon,
   GSI (Japan), BAN (France) and PDOK (Netherlands) worked well: document them as approved geocoders and add a small cached geocoder
   helper to the pipeline.
3. **Reconcile staleness across same-country sections:** staging one section makes the others' `reconcile.json` stale, and
   regenerating after staging changes a hashed research file. Consider binding reconcile only to the index and same-country
   *research files*, not to staged batches.
4. **No honest category for public facilities:** the importer blocks `other` as not-a-gym, which tempted workers to mislabel municipal
   walls as `commercial-gym`. Add a `public-facility` category that is flagged for review instead of blocked.
5. **`research new` / `new-batch` stamp the UTC date**, so sections created in the evening (AEST) get the previous day's date. Add `--date`.
6. **same-as + `followup:"location-update"`** is recorded but not actionable: a command that turns these into a draft location batch
   would save manual work.
7. **Shared scratchpad** caused file-name collisions between workers; use per-worker subfolders.
8. **Running 15 workers at once hit the account's API usage limit**; all were resumed, but fewer parallel workers would be smoother.
