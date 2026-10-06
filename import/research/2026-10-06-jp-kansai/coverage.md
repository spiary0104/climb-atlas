# Coverage: Japan, Kansai (2026-10-06-jp-kansai)

Scope: Osaka, Hyogo, Kyoto, Nara, Shiga, Wakayama (JP). Pass of 2026-10-06.

## Result
- 59 candidates (jpk-001 to jpk-059): **accept 32**, same-as 2 (existing gyms with a doubtful pin), defer 23 (see MANUAL-CHECK.md), reject 2 (closed).
- `research reconcile`: ready 29 | review 4 | blocked 25 | already in Bouldeer 1 | invalid 0. Staged: 32 records, `validate` 0 errors, `plan` exit 0, importer dry-run PREFLIGHT PASSED (partial coverage, no credentials).
- 54 sources registered; every accepted gym has its own site (or a chain store page) as the primary source, read on 2026-10-06, with at least one dated 2026 post, calendar or price revision. Pins are GSI house-number geocodes unless stated.

## Method
1. Names only from directories: rockgym.jp prefecture tables (Osaka 37, Hyogo 24-25, Kyoto 10, Nara 8, Shiga 6, Wakayama 4 listed) and its store pages (address, hours, official link); a few extra names from web searches (LINKS Daito, You-Rock Maizuru, CAL-COLO Kizugawa, CRUX Kyoto, FUSHIMITTO, UP Climbing).
2. Each official site was fetched; a gym is **accepted only if the site shows 2026 activity** (news, calendar, price revision, event dates) and names bouldering. Sites with live hours and prices but no dated post (or only 2017-2025 posts) are **deferred** for the owner's one-question check.
3. Address check: the official page was searched for the house number; the directory address was replaced where the site disagrees (Titan Wall moved to Wada 394-1).
4. Coordinates: GSI address search (msearch.gsi.go.jp, 1 request/s) for every gym except Key Bouldering and Gubboru (own-map pins) and GRANDWAZOO Nara (own embed, treated as street-level). The gyms' Google embeds were checked with the GSI reverse geocoder: two of four were centred in the wrong town, so they were not used for Rock Garden or KIAORA BROS.
5. Chains: Nakagai (all 6 store pages read: 5 accepted; Sakai Fukai is a lead/team gym with no general use; Sakai Kitahanada gone), Gravity Research (store list: Umeda, Mint Kobe, Himeji, Sanga already in Bouldeer; **Kishiwada closed 2026-01-12**), D.Bouldering (only Namba and Matsui-yamate in Kansai, both in Bouldeer; Rock Mate Matsuiyamate was replaced by D.Bouldering at the same address), Rock Mate (Otsu only, undated), KO-WALL (Shiga Boulder accepted; Shiga Lead is lead-only), City Rock Gym (Yamatokoriyama accepted), Higurashi, Siesta, Suhara, KIAORA BROS, GRANDWAZOO, CRUX, Rocher, mont-bell, Mizuno Sports Plaza. B-PUMP / PUMP (PUMP Osaka closed 2020-05-31), Base Camp, NOBOROCK, ROCKY, T-WALL, Big Rock and D.Bouldering have no other Kansai stores.

## Per prefecture
Estimates are the directory counts (rockgym.jp, 2025-10/11 tables, with its own gaps) plus the extra names found; Bouldeer count is before this section.

| Area | Est. real gyms | In Bouldeer before | Accepted | Same-as (existing) | Deferred | Notes |
|---|---:|---:|---:|---:|---:|---|
| Osaka | about 37 | 6 | 13 | 2 | 12 | accepted: Takatsuki, Settsu, Kyobashi (Soleil), Sakai Shirasagi, Chuo (Higurashi, Bum), Kita (Mushrooming, Kawasemi), Neyagawa, Yao x2, Suminoe, Higashi-Osaka. Closed: GR Kishiwada. Deferred: Galera, CRUX, Siesta x2, SAN, Sanyo, Mahoroba, FunC2, Minorite, Suhara Ikeda, LINKS, GRANDWAZOO Kashiwara |
| Hyogo | about 25 | 3 | 7 | 0 | 7 | accepted: Kobe (Rock Garden, Noboriba SG, mont-bell Rokko), Amagasaki, Kakogawa, Akashi, Awaji (COCOMO). Deferred: Boulder Plus, Style, DAWN, Hinotama, Chargo, OLD BUT GOLD, Mizuno |
| Kyoto | about 12 | 6 | 2 | 0 | 1 | accepted: noah (Fushimi), Rocher Makishima (Uji). Rock Mate Matsuiyamate rejected (replaced). Deferred: CAL-COLO Kizugawa. LUCLU Kyoto (opened 2026-09-19) has no published address yet |
| Nara | about 10 | 0 | 5 | 0 | 1 | accepted: Noboriko, Key Bouldering (Nara city), Nakagai Kashihara, GRANDWAZOO Nara, City Rock Gym Yamatokoriyama. Deferred: NEON (Sakurai). Fellows (Kashiba) and Aogaki (Yamatokoriyama) unreachable |
| Shiga | about 6 | 0 | 3 | 0 | 1 | accepted: KO-WALL Shiga Boulder (Ritto), Colors (Kusatsu), Gubboru (Hikone). Deferred: Rock Mate Otsu. Community Park Otsukyo is behind a 403 |
| Wakayama | about 4-5 | 0 | 2 | 0 | 1 | accepted: Titan Wall, WaBo (Wakayama city). Deferred: APE. Kimiidera park wall and Umenosato wall are municipal walls with no bouldering statement read |
| Total | about 95 | 15 | 32 | 2 | 23 | The Bouldeer figure for Osaka alone rises from 6 to 19 (+2 same-as pins to fix) |

## Remaining leads (no candidate; details in MANUAL-CHECK.md section B)
- Unreachable or dead sites: HAGO (Suita, site does not connect), CRONICO (Toyonaka, 403), Fellows Climbing (Kashiba, 403), Community Park Otsukyo (403), COCOMO Sumoto (cocomo550.com, 403), Aogaki (Yamatokoriyama), milnorte (Kita-ku Kyoto), WAGOMU (existing; its site no longer connects), BOSSA (Kobe, domain parked), Bouldering Life (Himeji, password-protected site), RIVERSTONE (Sumoto, no site found), Freeze's Cave Tanba (domain taken over), 6.spider (Tennoji, directory only).
- Wrong or dead according to primary evidence, not candidates: Higurashi Sakai Kitahanada (page gone from rockgym.jp and from the chain site), CLapple (closed 2023-05-31), Rockestra Nishinomiya (closed 2022-10-10), be colorful Nishinomiya (domain for sale), CRUX Kyoto (removed from the CRUX site), SQUAMISH Moriguchi and BOLD Osaka (dead sites), PUMP Osaka (closed 2020-05-31), AUBE Osaka (page removed from rockgym.jp, site not found).
- Borderline venues left out: R-PRESS AOAO Wall (outdoor-focused climbing school), Mizuno Sports Plaza (multi-sport rental; deferred), FUSHIMITTO (fitness club with a bouldering wall), mont-bell Kyoto/other stores (not checked), Michibi Climbing Wall (Kobe Eye Center, restricted hours), Nishikita Climbing Wall (self-service municipal-style wall, 500 yen, bouldering not named), Kimiidera and Umenosato park walls, UP Climbing Gym Iwade (a source says closed), travis bouldering studio Hirakata and climbinggym boruta Kawanishi (school/kids-oriented, not read).
- Existing gym pins to fix in a follow-up update batch: **Roca** (1.7 km from its address, same-as seed-414), **GRAVITY RESEARCH UMEDA** (408 m, seed-415), **WAGOMU** (existing pin about 4 km from the address listed by rockgym.jp, Nagata-ku; not verified because its site is down), **Adsummum** and **GR Himeji / Sanga** only geocode at town level (inconclusive).
