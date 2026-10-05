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
