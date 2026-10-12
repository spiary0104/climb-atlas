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
- Location-update follow-up (not part of this section): seed-711 sits about 3.3 km from the gym's Amap pin (the Amap POI is the L3 unit of Zhujiang Star Ring Mall, Fuyuan Xi Lu, Kaifu District). seed-712 is 55 m from the converted pin (an independent check that the GCJ-02 conversion and the pin read are consistent).

## Retire follow-up
- seed-713 Banana Climbing (CapitaLand One): the Amap listing is named "(暂停营业)" (business suspended) and a visitor note dated 2026-06-16 says goodbye to the CapitaLand One branch. Its stored pin is also about 8.7 km from the Amap POI. Not retired here.

## defer (3), see MANUAL-CHECK.md
- Jinri Climbing Life Gym Jianshe Lu (Kunming) and Zaoan Climbing (Changsha): visitor evidence only, no own account found. They meet the owner's visitor-note rule but the importer's primary-source gate (`official-site`, `official-social`, `chain-store-list`) blocks them.
- Xiangpan Climbing (Changsha): youth competition gym; adult walk-in bouldering shown by one visitor note only.

## Pins and Amap reliability (read this)
- Conversion: GCJ-02 to WGS-84 by iterating the forward WGS-to-GCJ transform (checked against Tiananmen: GCJ 116.3974,39.9092 is WGS 116.3913,39.9078). The brief expected the test point GCJ 102.732815,25.034905 to move south-west; in Kunming it moves north-west (WGS 25.037859,102.731343: 0.0015 degrees west, 0.0029 north, about 360 m). The direction is what the transform gives at this location and is confirmed independently: the converted entrance of Nayan 0871 is 12 m from OpenStreetMap node N14055656902, and the converted Banana Yuefang pin is 55 m from the existing seed-712 pin.
- Amap's search endpoint, called repeatedly from the script (parallel at first, then sequential), began returning degraded answers on later reads: random characters dropped or inserted in names and addresses, and POI coordinates shifted by 100-200 m (list queries and by-id lookups alike), while the listing's `entrances` coordinates stayed identical in every sample. The pins in this section come from earlier reads, taken as the majority of repeated reads, before the degradation was noticed; the first two (Nayan Tuodong, Nayan 0871) also match the first read made through the page itself. A later re-read cannot confirm them (it returns shifted values). Safeguards: every pin is within 150 m of the entrance coordinate of the same listing; three also sit within 250 m of an OpenStreetMap feature of the same building or compound (协信天地, 御溪国际, 云峰天骄). A spot check of two or three pins in a browser is advisable before applying. Addresses were written in English by hand from the RedNote and Amap Chinese text.
- OpenStreetMap has the venue itself only for Nayan 0871; the other venues are not mapped there.

## Weaker accepts (owner may veto)
- Nayan 0871: a training gym (14 m lead wall, 4.9 m bouldering wall); bouldering is shown by the own bio and two visitor notes, no own post names the boulder wall.
- Xiaoxiong Hailer World: the bouldering area is small (guide).
- Panyang: one Amap rating only; the own account carries the open evidence.
- TBW: opened in summer 2026; one visitor note (2026-10-10) complains about pricing but is about a live gym.
