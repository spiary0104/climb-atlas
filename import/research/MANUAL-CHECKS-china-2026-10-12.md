# Manual checks and follow-ups (owner): China, 2026-10-12

Sources (owner decision 2026-10-12): RedNote (read-only, the owner's logged-in rednote.com tab) for open / bouldering, the gym's own
Amap listing for the pin (GCJ-02 -> WGS-84, the listing's entrance coordinate; cross-checked with OSM where it exists). Details and
links: each section's `MANUAL-CHECK.md` (`import/research/2026-10-12-cn-<section>/`).

## Deferred gyms (17), none on Bouldeer until you answer
| Section | Deferred | Question type |
|---|---:|---|
| `kunming-changsha` | 5 | 2 pin needed (Xiaoxiong Hailer World, TBW Longji); Jinri Jianshe Lu, Zaoan (visitor notes only); Xiangpan Yinpenling (adult walk-in?) |
| `shanghai` | 5 | pin needed: Banana Longfeng, Roc811, Wo Pan Moon Bay, AOB Chuangzhi Tiandi, Cishan FFC |
| `beijing-chengdu` | 7 | 4 pin needed (Banana Xiaoyuehe, Cishan Yizhuang, Surmount, Banana Youfang); Renren Happy Valley, Climb On Shougang (visitor notes only); Yanxuan Donghu (bouldering?) |

"Pin needed": the gym passes (open in 2026, bouldering) but its Amap listing has no entrance coordinate and Amap's search pins are
jittered by ~100-150 m. "Visitor notes only": 2+ independent 2026 visitor notes and a live Amap listing, but the importer only accepts
official / chain sources as primary evidence. Decide whether visitor notes may count (that needs a small importer change).

## Existing records: follow-ups (not changed by any batch)
- Retire candidates (Amap "暂停营业" = business suspended, or a closing note): seed-713 Banana CapitaLand One (Changsha); seed-605 Jibi
  Storm Bailian Xijiao (Shanghai, verify the match); seed-638 Rock Time Dawanglu, seed-684 Zhongpan Alps, seed-668 Yaoyan Shahe (Beijing);
  seed-628 Elephant, seed-617 Panda CapitaLand (Chengdu, per a 2026-09 gym map).
- Pins: many existing Shanghai, Beijing and Chengdu seeds are 1-2.6 km from their Amap listing entrance (lists in each review-notes.md);
  a further 12 are name matches 1.6-8.7 km away that must be confirmed first. seed-711 Banana Zhujiang (Changsha) is 3.3 km off.
  Next step: one China pin-fix maintenance batch using the listing entrance coordinates.
- Name format of the new records: `English (Branch) [中文]` (existing CN records are English only).
