# Regional research: Serbia (Tier C, wave 3A) (2026-10-01-serbia)

Scope: RS (whole country)
Index: 2127 gyms, sha256 8dbddf7924c2… | staged batches compared: none | other sections compared: none
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
5 candidate(s): ready 1 | review 2 | blocked 1 | already in Bouldeer 1 | invalid 0

## Already in Bouldeer (suggested: same-as; never inserted) (1)
- rs-002 "Adrenalin Climbing Club" -> seed-1670 "Adrenalin Climbing Club" (same-name, 152 m)

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- rs-001 "Sektor44" [g-3fe7f0e0a4] reviewed_against must include: rs-004, seed-1668
  - importer-probable-duplicate: seed-1668 renamed-or-related-name-nearby 0 m
  - name-match: seed-1668 "Penjački centar Sektor44": renamed-or-related-name-nearby ("Sektor44" / "Penjački centar Sektor44", 0 m)
  - related-name-nearby: candidate rs-004 "Pulse Climbing Hub": related names "Penjacki centar Sektor44" / "Penjacki centar PULS" 4086 m apart
- rs-005 "PAEK Nis bouldering hall" [g-de1b816d29]
  - limited-access: club wall: check it is open to the public

## Blocked: cannot be accepted (1)
- rs-004 "Pulse Climbing Hub": bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (1)
- rs-003 "SKC Baza Boulder Gym" [g-af4c4844b8]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-01-serbia`.
Nothing here touches production.
