# Import dry-run: 2026-10-03-location-fixes

**Result: READY for review/import** — this report is a dry-run; nothing was written anywhere except this batch directory.

| What would happen | Records |
|---|---:|
| Insert as NEW gyms | 0 |
| Update existing gyms (explicit update records) | 5 |
| Already exist — no action (identical content: 0; content differs, NOT applied: 0) | 0 |
| Probable duplicates — need a human decision | 0 |
| Invalid — rejected | 0 |
| Rejected by a human decision | 0 |
| **Total records in batch** | 5 |

Index: 2306 known gyms (sha256 3b20e7b458c7…). Plan: 67bfca6bfaa7…

## Updates to existing gyms (5)

- line 1 `seed-1493` — Location from regional research 2026-10-01-russia (ru-020): osm pin node/1402188633; existing pin 10546 m off. Verified again 2026-10-03 (own site / OSM); the old pin is a placeholder shared by three Saint Petersburg gyms.
  - lat: 59.9606739 → 59.914002
  - lng: 30.1586551 → 30.3234707
- line 2 `seed-1491` — Location from regional research 2026-10-01-russia (ru-018): official-map pin map marker on https://igelsclub.ru/kak-dobratsa; existing pin 9133 m off. Verified again 2026-10-03 (own site / OSM); the old pin is a placeholder shared by three Saint Petersburg gyms.
  - lat: 59.9606739 → 59.9062431
  - lng: 30.1586551 → 30.2814162
- line 3 `seed-1492` — Location from regional research 2026-10-01-russia (ru-022): osm pin node/9124072117; existing pin 7491 m off. Verified again 2026-10-03 (own site / OSM); the old pin is a placeholder shared by three Saint Petersburg gyms.
  - lat: 59.9606739 → 59.9682893
  - lng: 30.1586551 → 30.2923918
- line 4 `seed-1139` — Manga Climbing carried Rockspot's pin (Via Fantoli 11), about 7.4 km from the gym. New pin: OSM node/5961900633, which carries the gym name, house number 25 (Via Privata Giovanni Livraghi), phone and website. Gym open (site news Mar-Apr 2026). Verified 2026-10-03.
  - lat: 45.4528254 → 45.5160489
  - lng: 9.2530748 → 9.2228263
- line 5 `seed-906` — CityBloc has one site, 1-4 Kitson Road, Leeds LS10 1NT (its own site); both Bouldeer records were ~2 km off with no address. New pin: OSM node/3621422353. (seed-863 is the duplicate record of the same gym; retiring it is a separate step.) Verified 2026-10-03.
  - lat: 53.802 → 53.7857994
  - lng: -1.547 → -1.5340624
  - address: null → "1-4 Kitson Road, Leeds LS10 1NT, United Kingdom"

## Warnings

- `large-pin-move` × 5: lines 1, 2, 3, 4, 5

