# Manual check list: China Beijing and Chengdu coverage gap (2026-10-12-cn-beijing-chengdu)

Three gyms I could not settle; all stay `defer` in review.json and are not in the staged batch. RedNote needs the owner's login (rednote.com); Amap place pages are https://www.amap.com/place/<id>.

| Gym | City | Open these | The ONE question | Found so far |
|---|---|---|---|---|
| Renren Climbing, Happy Valley (人人攀岩欢乐谷店, cn-bj-012) | Beijing | https://www.amap.com/place/B0FFKBJ8WQ ; RedNote notes 69cd40b40000000023005c43, 69ecc323000000002300512a, 6a9e80f4000000002901a0d3 | Do you accept visitor notes as evidence (no own account found; the importer's primary-source gate blocks it)? | Four visitor notes 2026-03-31 to 2026-09-07: opening, bouldering routes, V2-V4, a reset with the bouldering hashtag; Amap live (4.4, 8 ratings). |
| Climb On Gym, Shougang (Climb On Gym攀岩馆COG首钢店, cn-bj-013) | Beijing | https://www.amap.com/place/B0KRNUFURH ; RedNote notes 6a9862bb0000000011035f08, 6a76234e0000000025004a39, 6a4123830000000022008c74 | Same question (visitor notes only; the Climb On Gym own account posts about the Laiguangying store). | Four visitor notes 2026-06-28 to 2026-09-02: V2, V3 and V4 collections of the Shougang store; Amap live (4.6, 14 ratings). |
| Yanxuan Climbing, Donghu (岩选攀岩, cn-cd-003) | Chengdu | https://www.amap.com/place/B0MBNSSJKO ; RedNote account 678776e00000000008018fe1 ; note 6a59935b0000000001033b1e | Does the first store (Erhuan Lu Dongwuduan, 3/F) have a bouldering area? | Own posts 2026-05 to 2026-10-01 (zone D routes, a dyno route, announcement of a second store opening in November with an indoor bouldering area); one visitor note calls it a favourite bouldering gym; Amap live (4.6, 10 ratings). |

Policy decision behind two of the three: if the owner wants visitor notes (two or more independent 2026 notes plus a live Amap listing) to count as evidence, the importer needs a new primary source kind (a code change in scripts/lib/gym-import/research.js, PRIMARY_KINDS); until then such gyms cannot be staged.
