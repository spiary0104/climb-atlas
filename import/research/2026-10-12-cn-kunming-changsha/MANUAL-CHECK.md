# Manual check list: China Kunming and Changsha (2026-10-12-cn-kunming-changsha)

Three gyms I could not settle; all stay `defer` in review.json and are not in the staged batch. RedNote needs the owner's login (rednote.com); Amap place pages are https://www.amap.com/place/<id>.

| Gym | City | Open these | The ONE question | Found so far |
|---|---|---|---|---|
| Jinri Climbing Life Gym, Jianshe Lu (今日攀岩生活馆建设路店, cn-km-006) | Kunming | https://www.amap.com/place/B0FFHCI8IL ; RedNote notes 698c7d04000000001a037aa5, 6aa6325300000000110338ce | Do you accept a gym whose open and bouldering evidence is visitor notes only (no own account, so the importer's primary-source gate blocks it)? | Visitor notes 2026-02-11 (bouldering at this branch), 2026-09-09, 2026-09-13; the 2026-10-04 guide (Tuesday black-training night, weekly reset); Amap live. |
| Zaoan Climbing (早安攀岩馆, cn-cs-003) | Changsha | https://www.amap.com/place/B0KKKCU3FV ; RedNote notes 6a1440cf0000000007020662, 6aca49700000000015002ef3 | Same question: visitor notes only (five, 2026-05-25 to 2026-10-10: V3 routes climbed, route-setting beta); the 早安攀岩馆 account is a gym-business account, not the gym's own. | Amap live (4.6, 14 ratings). |
| Xiangpan Climbing, Yinpenling Wanda (湘攀攀岩银盆岭万达店, cn-cs-004) | Changsha | https://www.amap.com/place/B0J0NZ9CJ7 ; RedNote account 64c88350000000000e026744 | Can adults walk in and boulder (own account: youth competition gym; one adult group class post 2026-09-30)? | One visitor note 2026-08-24: weekend bouldering, few people, many children, hard problems. |

Policy decision behind two of the three: if the owner wants visitor notes (two or more independent 2026 notes plus a live Amap listing) to count as evidence, the importer needs a new primary source kind (a code change in scripts/lib/gym-import/research.js, PRIMARY_KINDS); until then such gyms cannot be staged.

## Added by the brain review (2026-10-12): pin needed

| Gym | Question |
|---|---|
| Xiaoxiong Climbing (Hailer World) [昆明小熊攀岩俱乐部海乐世界馆] | Drop a pin on the entrance (its Amap listing has no entrance coordinate; the search pin is only street-level, ±150 m). Gym itself passes: open in 2026 with bouldering. |
| TBW Climbing (Longji Base) [TBW攀岩龙脊基地店] | Drop a pin on the entrance (its Amap listing has no entrance coordinate; the search pin is only street-level, ±150 m). Gym itself passes: open in 2026 with bouldering. |

## Follow-up 2026-11-11 (public-source verification)
Method: checked by Claude (AI) on public sources; ChatGPT leads re-verified; nothing written to production. amap.com/place pages return no place data to a fetch and web search found no gym-controlled pages for these gyms.
- **Policy: visitor notes as evidence (CN-080)**: STATUS: NEEDS HUMAN (owner policy decision). Not decided here; see the same entry in 2026-10-12-cn-beijing-chengdu/MANUAL-CHECK.md (a new provisional source kind would unblock Jinri Jianshe Lu and Zaoan, not Xiangpan or any pin). Next: owner decides.
- **TBW Climbing, Longji Base (cn-cs-002)**: STATUS: ALREADY RESOLVED (confidence High). Re-found in section 2026-11-06-cn-changsha (cn-cs-001): accepted from the gym's own RedNote account (bouldering zone A reset 2026-08-31) with a building-precision coordinate and imported 2026-11-07 as g-5ffbd76ef4 (import/batches/2026-11-06-cn-changsha/manifest.json; commit 4275923). Sources: those repo files (checked 2026-11-11). Next: none (do not stage cn-cs-002 again; record a same-as).
- **Xiaoxiong Climbing, Hailer World (cn-km-004)**: STATUS: NEEDS HUMAN (pin) (confidence Low). No operator entrance found; not re-covered by the 2026-11-06 Kunming section (grep). Sources: none reachable (checked 2026-11-11). Next: map look.
- **Jinri Climbing Life Gym, Jianshe Lu (cn-km-006)**: STATUS: NEEDS HUMAN (blocked on CN-080) (confidence Low). No gym-controlled source found. Sources: https://www.amap.com/place/B0FFHCI8IL (no data returned, checked 2026-11-11). Next: CN-080, or an own-account read.
- **Zaoan Climbing (cn-cs-003)**: STATUS: NEEDS HUMAN (blocked on CN-080) (confidence Low). Same. Sources: https://www.amap.com/place/B0KKKCU3FV (no data returned, checked 2026-11-11). Next: CN-080.
- **Xiangpan Climbing, Yinpenling Wanda (cn-cs-004)**: STATUS: OPEN (confidence Low). Whether adults can walk in and boulder is unknown; nothing public found. Sources: https://www.amap.com/place/B0J0NZ9CJ7 (no data returned, checked 2026-11-11). Next: someone asks the gym (WeChat or phone).
