# Pilot section: New Zealand (`2026-09-30-new-zealand`)

Status: **scaffold only.** No research has been done, no candidate exists, nothing is staged or imported.
The workflow and all rules are in `docs/import-workflow.md` ("Regional research"); this file is the brief for this section.
(This README is not hashed into the batch; `section.json`, `sources.json`, `candidates.ndjson`, `reconcile.json` and `review.json` are.)

## Scope
- Country `NZ`, all regions (`scope.states: null`). Region codes: `js/modules/regions.js` (AUCKLAND, BAY_OF_PLENTY, CANTERBURY,
  GISBORNE, HAWKES_BAY, MANAWATU_WHANGANUI, MARLBOROUGH, NELSON, NORTHLAND, OTAGO, SOUTHLAND, TARANAKI, TASMAN, WAIKATO,
  WELLINGTON, WEST_COAST).
- In scope: indoor climbing gyms **with a bouldering offering** that are open to the public.
- Out of scope: outdoor crags/areas, shops, gyms that are closed, temporary or not yet open, rope-only gyms (`no-bouldering`).
- Already in Bouldeer: 9 NZ gyms (Auckland 4, Wellington 3, Canterbury 2, per the frozen dataset). Research them like any other gym:
  reconcile matches them (`same-as`); a better pin/address for one of them goes into a *separate* location-update batch, never here.

## Research (not started)
1. Register every source once in `sources.json` (id, `kind`, title, url, language, `accessed` date). Primary kinds:
   `official-site`, `official-social`, `chain-store-list`. `directory`, `federation`, `map-data`, `news`, `other` support but never
   prove a gym on their own. A search result is not a source.
2. Append one candidate per line to `candidates.ndjson`, including places you will reject (closed, rope-only, outdoor): the record of
   what was looked at is part of the audit. Example (illustrative values only):
   ```json
   {"cid":"nz-akl-001","name":"…","name_local":null,"aliases":[],"chain":null,"country":"NZ","state":"AUCKLAND","suburb":"…","address":"…","lat":-36.8,"lng":174.7,"coord_source":{"source":"S2","method":"osm","ref":"node/…"},"coord_precision":"building","types":["indoor-bouldering"],"website":"https://…","category":"commercial-gym","status_claim":"open","bouldering":"yes","evidence":[{"source":"S1","url":"https://…","accessed":"2026-10-01","supports":["exists","open","bouldering","address"]},{"source":"S2","url":"https://www.openstreetmap.org/node/…","accessed":"2026-10-01","supports":["location"]}],"research_notes":null,"notes":null,"photo":null}
   ```
   - Coordinates come from an identified source (`coord_source`); never invented or estimated. No reliable pin = `coord_precision:"area"` (cannot be accepted).
   - `bouldering`: `yes` only with a primary source saying so; `no` = confirmed rope-only (rejected `no-bouldering`); otherwise `unknown` (never assumed; defer or insufficient-evidence).
   - Record aliases, Māori or former names, and relocations in `aliases` / `research_notes`: they drive the stricter duplicate flags.

## Steps after research (each one explicit; nothing here touches production until the last three)
```
node scripts/gym-import.js research reconcile 2026-09-30-new-zealand   # offline -> reconcile.json + reconcile.md
#   owner reviews reconcile.md and writes review.json (one decision per candidate)
node scripts/gym-import.js research stage 2026-09-30-new-zealand       # accepted only -> import/batches/2026-09-30-new-zealand/
node scripts/gym-import.js validate 2026-09-30-new-zealand
node scripts/gym-import.js plan 2026-09-30-new-zealand                 # commit section + batch + plan.json/report.md
node scripts/gym-import.js import 2026-09-30-new-zealand --dry-run     # PARTIAL (public reads)
#   owner: FULL dry run with the service-role key -> confirmation token; explicit approval
#   owner: import --apply --confirm <token> --i-understand-this-writes-to-production
node scripts/gym-import.js import 2026-09-30-new-zealand --verify
node scripts/gym-import.js build-index --live                          # commit manifest.json + the rebuilt index
```
