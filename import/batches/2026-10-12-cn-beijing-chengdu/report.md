# Import dry-run: 2026-10-12-cn-beijing-chengdu

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 8 |
| Update existing gyms (explicit update records) | 0 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 1) | 1 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 9 |

Index: 3457 known gyms (sha256 39a207384343…). Plan: 7fc55b692649… Also compared against staged batches: 2026-10-06-kr-seoul, 2026-10-12-cn-kunming-changsha, 2026-10-12-cn-shanghai, 2026-10-12-kr-busan-gyeongnam, 2026-10-12-kr-central-regions, 2026-10-12-kr-daegu-gyeongbuk, 2026-10-12-kr-gyeonggi-north, 2026-10-12-kr-gyeonggi-south, 2026-10-12-kr-gyeonggi-west, 2026-10-12-kr-incheon, 2026-11-08-cn-changzhou, 2026-11-08-cn-dalian, 2026-11-08-cn-fuzhou, 2026-11-08-cn-guiyang, 2026-11-08-cn-harbin, 2026-11-08-cn-hefei, 2026-11-08-cn-nanchang, 2026-11-08-cn-nanning, 2026-11-08-cn-shenyang, 2026-11-08-cn-xining, 2026-11-08-cn-yinchuan, 2026-11-08-cn-zhengzhou, 2026-11-08-cn-zhongshan, 2026-11-08-cn-zhuhai.

## New gyms (8)

By country: CN 8

- line 1 `g-d38f2a5e4d` "BLOC1 Climbing [BLOC1攀岩]" (CN)
- line 2 `g-474e548220` "EDGE Climbing (Sanyuanqiao) [EDGE一直攀岩]" (CN)
- line 3 `g-1ea116bacd` "Superbox Climbing (Happy Valley) [SUPERBOX超级秀场攀岩馆欢乐谷店]" (CN)
- line 4 `g-894e6ef315` "ZOO Climb [ZOO攀岩馆]" (CN)
- line 5 `g-1d927b2104` "Qingshan Climbing Stone (Weigongcun) [青山攀石魏公村店]" (CN)
- line 7 `g-fde5f38e02` "Qingteng Climbing [青藤攀岩]" (CN)
- line 8 `g-eefe533a0f` "Feline Climbing (Jijiamiao) [飞猫攀岩纪家庙店]" (CN)
- line 9 `g-fb88f1ad7d` "SOFA Climbing [SOFA攀岩]" (CN)

## Existing gyms (1) — no action

Content differs from production for 1 (NOT applied — use an explicit update record):
- line 6 `seed-679` "Wo Pan Climbing (Guangqu) [我攀攀岩广渠东路店]": name, address, types

