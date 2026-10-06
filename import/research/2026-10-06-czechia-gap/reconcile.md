# Regional research: Czechia: Prague and Brno coverage gap (2026-10-06-czechia-gap)

Scope: CZ (whole country)
Index: 2438 gyms, sha256 27073d25c2df… | staged batches compared: 2026-10-06-austria, 2026-10-06-de-south, 2026-10-06-london | other sections compared: 2026-10-01-czechia, 2026-10-03-czechia-pins
Review radii (stricter than the importer): any gym 150 m, related name 15 km, other country 2 km

## Summary
10 candidate(s): ready 6 | review 2 | blocked 2 | already in Bouldeer 0 | invalid 0

## Needs review (accept needs a reason and reviewed_against covering every listed id) (2)
- cz-jungle-holesovice "Jungle Holešovice" [g-b0f3258d1d] reviewed_against must include: seed-1451
  - importer-probable-duplicate: seed-1451 co-located 6 m
  - name-match: seed-1451 "Boulder Bar": co-located ("Jungle Holešovice" / "Boulder Bar", 6 m)
- cz-stena-ruzyne "Lezecká stěna Praha Ruzyně" [g-e7b0a9b8dd] reviewed_against must include: 2026-10-01-czechia#cz-008
  - other-section: 2026-10-01-czechia#cz-008 "Lezecké centrum Ruzyně": name-match same-address-different-name ("Lezecká stěna Praha Ruzyně" / "Lezecké centrum Ruzyně", 98 m)

## Blocked: cannot be accepted (2)
- cz-stena-hradec-kralove "Lezecká stěna Hradec Králové": status-not-open (status_claim is unknown); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer
- cz-sutr-liberec "Šutr": status-not-open (status_claim is unknown); insufficient-evidence (needs a primary source (official site/social, chain store list) confirming it exists and is open; a directory or search result alone is not enough); bouldering-unknown (bouldering offering not established (never assumed)) -> suggested: defer

## Ready (no flags; still needs an explicit accept) (6)
- cz-basecamp-boulder-brno "Basecamp boulder Brno" [g-f1f1c8c476]
- cz-crux24-harrachov "CRUX 24 Harrachov" [g-de272e83c6]
- cz-flash-boulder-bar-brno "Flash Boulder Bar" [g-be5da4691b]
- cz-freesolo "FreeSolo" [g-2d7816f43a]
- cz-jungle-letnany "Jungle Letňany" [g-063a1815aa]
- cz-lokal-blok "LOKAL BLOK" [g-b7d03849b6]

## Next
Write review.json with one decision per candidate (docs/import-workflow.md, "Regional research"), then `node scripts/gym-import.js research stage 2026-10-06-czechia-gap`.
Nothing here touches production.
