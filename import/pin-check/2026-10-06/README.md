# Pin check 2026-10-06

Approved gyms (China excluded: needs a source decision) whose pin looks unconfirmed in production on 2026-10-06:
`coarse-coords` (lat or lng with 3 or fewer decimals, typical of a city/area placeholder), `no-address`, or `shares-coords-with:<ids>`
(identical coordinates to 4 decimals). Generated read-only from the public API; `expect_h` = the gym's content hash at that moment.
Excluded: seed-878, seed-893, seed-1175, seed-1181 (fixed in the 2026-10-05/06 pin-fix batch, PR #75).

| File | Gyms |
|---|---|
| targets-uk-ie.json | GB, IE |
| targets-europe.json | DE, NO, CH, RO, FR, IT, GR, BG, BY |
| targets-rest-of-world.json | US, JP, AU, BR, CO, VE, others |

Each group's results: `<group>-results.md` (one line per gym: confirmed / fixed / retired / manual) and `MANUAL-CHECK-<group>.md`;
fixes go through the maintenance batch `import/batches/2026-10-06-pin-check-<group>/` (location updates and closed-gym retirements).

## Results (2026-10-06)
| Group | Fixed | Address added | Confirmed | Manual (owner) |
|---|---:|---:|---:|---:|
| UK/IE (36) | 34 | 1 | 1 | 0 (4 optional spot checks) |
| Europe (69) | 49 | 4 | 4 | 12 |
| Rest of world (72) | 38 | 1 | 5 | 28 |
| **Total (177)** | **121** | **6** | **10** | **40** |

Apply order: `2026-10-05-retire-dup-white-spider` first (g-7061a1fbb1, added 2026-10-05, duplicates seed-903, whose
placeholder pin hid it), then `pin-check-uk-ie`, `pin-check-europe`, `pin-check-rest-of-world`. Owner manual lists:
`MANUAL-CHECK-europe.md`, `MANUAL-CHECK-rest-of-world.md` (`MANUAL-CHECK-uk-ie.md` = optional spot checks only).
Later identity batch (after these apply): seed-903 name "white Spider" -> "White Spider"; seed-1028 Kletterhalle High-east
suburb -> Kirchheim bei München; seed-1413 Up Escalada address typo.
