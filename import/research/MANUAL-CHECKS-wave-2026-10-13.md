# Manual checks (owner): research wave 2026-10-13

Nothing below is on Bouldeer until you answer. Each section's `MANUAL-CHECK.md` (folders `import/research/2026-10-13-<section>/`)
has the exact question, links and findings. Some sections also list "leads" (gyms found but not yet candidates).

| Section | Deferred | Typical questions |
|---|---:|---|
| `us-ny-boston-metros` | 2 (+2 leads) | La Vida (Gordon College) open to the public? Everyday Athlete still open? |
| `us-california-metros` | 5 | Rock City Huntington Beach (training centre: walk-in bouldering?), Aisle 19 opened?, Desert Rocks, Bladium, Touchstone TTC |
| `us-central-metros` | 3 (+leads) | Denver Bouldering Club x3 (site expired), The Campus (bouldering?), Lake Travis (opened?) |
| `italy-cities` | 11 | boulder area? day price? open in 2026? (Crazy Center x2, Kro, Mad Climbers, Deva Wall, Gioco Verticale...) |
| `uk-cities` | 6 | Last Sun Dance (day passes?), Boatyard Boulders, Social Climbing Leicester, Quay (council?), The Barn, Climb Rochdale |
| `australia` | 7 | Flow Bouldering, Mandurah (open?), Camp Street, Albury (bouldering?), Friction Ballarat; Pulse Adamstown & Portside Joondalup (pin only) |
| `jp-remaining` | 2 + ~55 listed | Trans, rocks Kurashiki (pin only); municipal walls (category), gyms with no usable pin, bouldering unclear, possibly closed |
| `brazil` | 4 (+~40 unreadable) | Eleva (day pass?), TreeLab, República dos Macacos, Meru C3; leads Vértice (Brasília, needs a pin), Apus (Maringá) |
| China (`MANUAL-CHECKS-china-2026-10-13.md`) | — | pins left out of the CN pin-fix batch (no entrance coordinate); 4 more Amap closures |

## Existing records: follow-ups (not changed by any batch)
- Retire candidates: seed-141 Crux Climbing Center (Pickle Rd, Austin: closed; reopened as Crux South Austin, staged); Dynomite seed-25/26
  (domain gone: open?); China closures in the CN index.
- Location updates still to do: seed-94 Movement Centennial, seed-157 Movement Plano (~155 m), seed-958 Boulder World Belfast (~440 m),
  seed-1409 90 Graus (211 m), seed-1415 ROKAZ Buritis (sits on the Savassi pin; needs the gym's own map), seed-31 Hardrock CBD, seed-11 The Ledge.
- Identity: seed-322 Boulderdash -> "Boulderdash Thousand Oaks", suburb Thousand Oaks (pin fixed in 2026-10-13-fixes); seed-1418 Via Aventura -> Via AltaMontanha.


## Follow-up 2026-11-11 (public-source verification)

Checked by Claude (AI) on public sources; ChatGPT leads re-verified; nothing written to production.

- **Australia (7 deferred)**: STATUS: OPEN (confidence M). See the follow-up of the same date in import/research/2026-10-13-australia/MANUAL-CHECK.md: Mandurah RESOLVED eligible; Boulder Lab Heidelberg DATE-GATED (early 2027); Flow, Friction and Camp Street not settled; Pulse and Portside pins NEEDS HUMAN. Sources: see that file (checked 2026-11-11). Next: per that file.
- **Dynomite seed-25/26 (retire candidate)**: STATUS: RESOLVED: keep, do not retire (confidence H). Operating on dynomite.net.au (footer 2026): North Wollongong and Albion Park Rail, both bouldering. The old .com.au domain going 410 was not a closure. Sources: https://www.dynomite.net.au/ (checked 2026-11-11). Next: map the seeds to the two addresses.
- **seed-11 The Ledge (location update)**: STATUS: NEEDS HUMAN (confidence M). Map inspection between two candidate pins; SUSF page was 403 to me. Sources: https://susf.com.au/contact-us/ (checked 2026-11-11). Next: owner compares pins.
- **UK cities deferred (6)**: STATUS: OPEN (confidence M). None closed; see the follow-up in import/research/2026-10-13-uk-cities/MANUAL-CHECK.md. Sources: see that file (checked 2026-11-11). Next: per that file.
- **Brazil deferred (4)**: STATUS: OPEN (confidence M). None closed; see the follow-up in import/research/2026-10-13-brazil/MANUAL-CHECK.md. Sources: see that file (checked 2026-11-11). Next: per that file.
- **Crux Climbing Center seed-141 (retire)**: STATUS: ALREADY RESOLVED in staging (confidence M). The reopened Crux South Austin was staged in 9e127e4 (us-central-metros); retiring seed-141 itself is an owner-approved pipeline action. Sources: git commit 9e127e4 (checked 2026-11-11). Next: owner approval to retire.
- **Boulderdash seed-322 rename / pin**: STATUS: ALREADY RESOLVED (confidence M). Pin fix is in batch 2026-10-13-fixes (commit 3aee399, staged); apply status per docs/TASKS.md. Sources: git commits 3aee399, 0836952 (checked 2026-11-11). Next: confirm applied; do the rename/suburb if it was not part of that batch.
- **seed-94 Movement Centennial, seed-157 Movement Plano, seed-958 Boulder World Belfast, seed-1409 90 Graus, seed-1415 ROKAZ Buritis, seed-31 Hardrock CBD**: STATUS: NEEDS HUMAN (confidence L). Location updates need map inspection; not re-researched in this pass. seed-31 was reviewed earlier as 157 m from its OSM node with the site giving the same corner (australia review-notes.md): left as is. Sources: none new (checked 2026-11-11). Next: owner map check.
- **seed-1418 Via Aventura -> Via AltaMontanha (identity)**: STATUS: OPEN (confidence L). Not re-researched. Sources: none new (checked 2026-11-11). Next: official site check of the name.
