# Manual check list: China Kunming and Changsha (2026-10-12-cn-kunming-changsha)

Three gyms I could not settle; all stay `defer` in review.json and are not in the staged batch. RedNote needs the owner's login (rednote.com); Amap place pages are https://www.amap.com/place/<id>.

| Gym | City | Open these | The ONE question | Found so far |
|---|---|---|---|---|
| Jinri Climbing Life Gym, Jianshe Lu (今日攀岩生活馆建设路店, cn-km-006) | Kunming | https://www.amap.com/place/B0FFHCI8IL ; RedNote notes 698c7d04000000001a037aa5, 6aa6325300000000110338ce | Do you accept a gym whose open and bouldering evidence is visitor notes only (no own account, so the importer's primary-source gate blocks it)? | Visitor notes 2026-02-11 (bouldering at this branch), 2026-09-09, 2026-09-13; the 2026-10-04 guide (Tuesday black-training night, weekly reset); Amap live. |
| Zaoan Climbing (早安攀岩馆, cn-cs-003) | Changsha | https://www.amap.com/place/B0KKKCU3FV ; RedNote notes 6a1440cf0000000007020662, 6aca49700000000015002ef3 | Same question: visitor notes only (five, 2026-05-25 to 2026-10-10: V3 routes climbed, route-setting beta); the 早安攀岩馆 account is a gym-business account, not the gym's own. | Amap live (4.6, 14 ratings). |
| Xiangpan Climbing, Yinpenling Wanda (湘攀攀岩银盆岭万达店, cn-cs-004) | Changsha | https://www.amap.com/place/B0J0NZ9CJ7 ; RedNote account 64c88350000000000e026744 | Can adults walk in and boulder (own account: youth competition gym; one adult group class post 2026-09-30)? | One visitor note 2026-08-24: weekend bouldering, few people, many children, hard problems. |

Policy decision behind two of the three: if the owner wants visitor notes (two or more independent 2026 notes plus a live Amap listing) to count as evidence, the importer needs a new primary source kind (a code change in scripts/lib/gym-import/research.js, PRIMARY_KINDS); until then such gyms cannot be staged.
