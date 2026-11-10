# Import dry-run: 2026-10-12-cn-kunming-changsha

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 3 |
| Update existing gyms (explicit update records) | 0 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 2) | 2 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 5 |

Index: 3453 known gyms (sha256 4eeacfad3c59…). Plan: a5d12ff04344… Also compared against staged batches: 2026-10-06-kr-seoul, 2026-10-12-cn-beijing-chengdu, 2026-10-12-cn-shanghai, 2026-10-12-kr-busan-gyeongnam, 2026-10-12-kr-central-regions, 2026-10-12-kr-daegu-gyeongbuk, 2026-10-12-kr-gyeonggi-north, 2026-10-12-kr-gyeonggi-south, 2026-10-12-kr-gyeonggi-west, 2026-10-12-kr-incheon, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-fuzhou, 2026-11-08-cn-guiyang, 2026-11-08-cn-harbin, 2026-11-08-cn-hefei, 2026-11-08-cn-nanchang, 2026-11-08-cn-nanning, 2026-11-08-cn-shenyang, 2026-11-08-cn-xining, 2026-11-08-cn-yinchuan, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai.

## New gyms (3)

By country: CN 3

- line 1 `g-51e02d6afa` "CAMP4 Climbing (Changsha Xihu Park) [CAMP4岩肆长沙西湖公园店]" (CN)
- line 4 `g-d915cda237` "Xiaoxiong Climbing (Yunling Tianjiao) [昆明小熊攀岩俱乐部云岭天骄馆]" (CN)
- line 5 `g-957b283ccf` "Panyang Climbing Gym (Chenggong) [攀羊岩馆]" (CN)

## Existing gyms (2) — no action

Content differs from production for 2 (NOT applied — use an explicit update record):
- line 2 `g-5cd08d937f` "Nayan Climbing (Tuodong) [那岩拓东攀岩馆]": name, lat, lng, address
- line 3 `g-9c56253b23` "Nayan Climbing (0871) [那岩0871攀岩俱乐部]": name, lat, lng, address

2 matched with a different pin (largest 15 m); production pins are kept.

