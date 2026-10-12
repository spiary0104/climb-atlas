# Review notes: China Kunming and Changsha (2026-10-12-cn-kunming-changsha)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tally: accept 7 | same-as 2 | defer 3 | reject 0 (12 candidates).

## Method
Candidates were found with RedNote searches (city + 攀岩馆 / 抱石 / 探馆, brand and branch names, guides such as the 2026-10-04 Kunming bouldering guide and the 2026-08-27 Changsha climbing map) and Amap's own search endpoint for each city (read-only, owner logged in). A gym's own RedNote account (profile bio, posts) is the primary source (`official-social`); note dates come from the note id (the first 8 hex digits are the creation time as a Unix timestamp; checked against the displayed dates). Visitor notes are registered as `other` (support only). Accept rule used: the gym's own account has a 2026 post about this gym or branch, bouldering is shown in the gym's own text (bouldering area, route collections, bouldering reset notices, bio) and the Amap listing is live (no closed mark). Pins are the gym's own Amap POI (see "Pins and Amap reliability").

## accept (7)
- Kunming: Nayan Tuodong (pure bouldering gym, own account posts 2026-10-08/10), Nayan 0871 (older training gym; own bio lists a 4.9 m bouldering wall and MoonBoard, own post 2026-10-03, bouldering visitor notes 2026-08), Xiaoxiong Yunling Tianjiao and Hailer World (one chain account; own notices 2026-09-30 and 2026-06-25 list bouldering and high-wall areas for both), Panyang (new gym in Chenggong; own posts "bouldering area" 2026-10-04 and 99 yuan bouldering offer 2026-09-16).
- Changsha: CAMP4 Xihu Park (own account route collections for bouldering areas A, B and C, 2026-09-21 to 2026-10-06), TBW Longji Base (new gym; own post 2026-08-31 "bouldering area A reset").
- Name format: existing China records are English only, with the branch in round brackets. New records keep that and append the Chinese name in square brackets (name_local holds the same Chinese text); the owner may strip the `[...]` suffix if unwanted.

## same-as (2)
- Banana Climbing Zhujiang Star Ring = seed-711, Yuefang ID Mall = seed-712.
- Location-update follow-up (not part of this section): seed-711 sits about 3.3 km from the gym's Amap pin (the Amap POI is the L3 unit of Zhujiang Star Ring Mall, Fuyuan Xi Lu, Kaifu District). seed-712 is 104 m from the converted entrance (a mall-level point).

## Retire follow-up
- seed-713 Banana Climbing (CapitaLand One): the Amap listing is named "(暂停营业)" (business suspended) and a visitor note dated 2026-06-16 says goodbye to the CapitaLand One branch. Its stored pin is also about 8.7 km from the Amap POI. Not retired here.

## defer (3), see MANUAL-CHECK.md
- Jinri Climbing Life Gym Jianshe Lu (Kunming) and Zaoan Climbing (Changsha): visitor evidence only, no own account found. They meet the owner's visitor-note rule but the importer's primary-source gate (`official-site`, `official-social`, `chain-store-list`) blocks them.
- Xiangpan Climbing (Changsha): youth competition gym; adult walk-in bouldering shown by one visitor note only.

## Pins and Amap reliability (read this)
- Conversion: GCJ-02 to WGS-84 by iterating the forward WGS-to-GCJ transform (checked against Tiananmen: GCJ 116.3974,39.9092 is WGS 116.3913,39.9078). The brief expected the test point GCJ 102.732815,25.034905 to move south-west; in Kunming it moves north-west (WGS 25.037859,102.731343: 0.0015 degrees west, 0.0029 north, about 360 m). That direction is what the transform gives here.
- Amap's search endpoint (called from the logged-in tab; the tab is hidden, so the page itself cannot render and the script reads the endpoint) returns each POI pin shifted by roughly 100 m, and the shift changes between reading sessions: Nayan Tuodong read as 102.732815,25.034905 in the morning and 102.734590,25.034202 later. The `entrances` coordinate of the same listing never changed in any reading, lies at the midpoint of the shifted pins, and the converted entrance of Nayan 0871 is 12 m from OpenStreetMap node N14055656902 while its two pin readings are about 100 m away on opposite sides. Rule used: **pin = the listing's entrance coordinate when the listing has one** (`coord_precision: building`); **no entrance = mean of the pin readings, `coord_precision: street`** (about 100 m, flagged in reconcile; two accepted gyms are in this group: Xiaoxiong Hailer World and TBW Longji Base). The brief's test pair (and the first reading of every gym in my notes) is a shifted pin, not a true location. In the same reading sessions names and addresses sometimes had random characters dropped or inserted; addresses here were checked across several readings and written in English by hand.
- Existing-pin check: the converted entrance of Banana Yuefang is 104 m from the existing seed-712 pin (a mall-level point), the shifted pin was 55 m to 148 m; seed-711 is 3.3 km from Banana Zhujiang Star Ring (Amap) and seed-713 about 8.7 km from the Amap pin of CapitaLand One.
- OpenStreetMap has the venue itself only for Nayan 0871. Building-level OSM polygons within 250 m of the pin exist for Xiexin Tiandi, Yuxi International and the Yunfeng Tianjiao compound (three candidates, two deferred).
- A pin spot check in a browser on a few of the street-level ones is advisable before applying.

## Weaker accepts (owner may veto)
- Nayan 0871: a training gym (14 m lead wall, 4.9 m bouldering wall); bouldering is shown by the own bio and two visitor notes, no own post names the boulder wall.
- Xiaoxiong Hailer World: the bouldering area is small (guide).
- Panyang: one Amap rating only; the own account carries the open evidence.
- TBW: opened in summer 2026; one visitor note (2026-10-10) complains about pricing but is about a live gym.
- Xiaoxiong Hailer World and TBW Longji Base: street-level pins (about 100 m), no entrance coordinate on the listing.

## Brain review (2026-10-12)
Street-level pins (no Amap entrance coordinate) moved from accept to defer: cn-km-004, cn-cs-002. Owner rule: no reliable pin = defer; each is on MANUAL-CHECK.md with "drop a pin".
