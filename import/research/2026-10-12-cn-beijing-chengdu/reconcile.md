# Regional research: China: Beijing and Chengdu coverage gap (2026-10-12-cn-beijing-chengdu)

Scope: CN / BEIJING, CHENGDU
Index: 3294 gyms, sha256 2f47cb53e74b… | staged batches compared: 2026-10-06-kr-seoul, 2026-10-12-cn-kunming-changsha, 2026-10-12-cn-shanghai | other sections compared: 2026-10-12-cn-kunming-changsha, 2026-10-12-cn-shanghai
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
16 candidate(s): ready 7 | review 6 | blocked 3 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (6)
- cn-bj-005 "Qingshan Climbing Stone (Weigongcun) [青山攀石魏公村店]" [g-1d927b2104] reviewed_against must include: seed-682
  - related-name-nearby: seed-682 "Qingshan Climbing Stone (Qinghe)": related names "Qingshan Climbing Stone (Weigongcun) [青山攀石魏公村店]" / "Qingshan Climbing Stone (Qinghe)" 9066 m apart
- cn-bj-006 "Banana Climbing (Xiaoyuehe) [香蕉攀岩小月河店]" [g-1436556fe0] reviewed_against must include: seed-637
  - related-name-nearby: seed-637 "Banana Climbing (Shangdi)": related names "Banana Climbing (Xiaoyuehe) [香蕉攀岩小月河店]" / "Banana Climbing (Shangdi)" 5472 m apart
  - weak-coordinates: coordinates are street-level, not the building
- cn-bj-009 "Cishan Climbing (Yizhuang Tongminghu) [此山攀岩亦庄通明湖商业港店]" [g-210cab65bb]
  - weak-coordinates: coordinates are street-level, not the building
- cn-bj-010 "Surmount Climbing [SURMOUNT山迈攀岩]" [g-52c5fa2b26]
  - weak-coordinates: coordinates are street-level, not the building
- cn-bj-011 "Feline Climbing (Jijiamiao) [飞猫攀岩纪家庙店]" [g-eefe533a0f] reviewed_against must include: seed-642
  - related-name-nearby: seed-642 "Feline Climbing Gym": related names "Feline Climbing (Jijiamiao) [飞猫攀岩纪家庙店]" / "Feline Climbing Gym" 12153 m apart
- cn-cd-002 "Banana Climbing (Youfang) [香蕉攀岩悠方店]" [g-a5c1164e7e] reviewed_against must include: seed-606, seed-607, seed-608
  - related-name-nearby: seed-606 "Banana Climbing (COSMO)": related names "Banana Climbing (Youfang) [香蕉攀岩悠方店]" / "Banana Climbing (COSMO)" 7407 m apart
  - related-name-nearby: seed-607 "Banana Climbing (ICD)": related names "Banana Climbing (Youfang) [香蕉攀岩悠方店]" / "Banana Climbing (ICD)" 5670 m apart
  - related-name-nearby: seed-608 "Banana Climbing (CapitaLand Tianfu)": related names "Banana Climbing (Youfang) [香蕉攀岩悠方店]" / "Banana Climbing (CapitaLand Tianfu)" 2523 m apart
  - weak-coordinates: coordinates are street-level, not the building

## Blocked: cannot be accepted (3)
- cn-bj-012 "Renren Climbing (Happy Valley) [人人攀岩欢乐谷店]": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer
- cn-bj-013 "Climb On Gym (Shougang) [Climb On Gym攀岩馆COG首钢店]": insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer
- cn-cd-003 "Yanxuan Climbing (Donghu) [岩选攀岩]": no-bouldering-evidence (bouldering is "yes" but no primary source confirms it) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (7)
- cn-bj-001 "BLOC1 Climbing [BLOC1攀岩]" [g-d38f2a5e4d]
- cn-bj-002 "EDGE Climbing (Sanyuanqiao) [EDGE一直攀岩]" [g-474e548220]
- cn-bj-003 "Superbox Climbing (Happy Valley) [SUPERBOX超级秀场攀岩馆欢乐谷店]" [g-1ea116bacd]
- cn-bj-004 "ZOO Climb [ZOO攀岩馆]" [g-894e6ef315]
- cn-bj-007 "Wo Pan Climbing (Guangqu) [我攀攀岩广渠东路店]" [g-bb74ed73f6]
- cn-bj-008 "Qingteng Climbing [青藤攀岩]" [g-fde5f38e02]
- cn-cd-001 "SOFA Climbing [SOFA攀岩]" [g-fb88f1ad7d]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-12-cn-beijing-chengdu`.
Nothing here touches production.
