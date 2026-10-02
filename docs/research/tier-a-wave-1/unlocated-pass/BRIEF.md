# Track C brief: locating the unlocated Tier A wave 1 gyms (research only)

C = C:\Users\Spiar\AppData\Local\Temp\claude\C--Users-Spiar-Downloads-boulder-atlas-project\ca66a530-3cc7-49ef-92b6-7250569d7f15\scratchpad\trackc
REPO = C:\Users\Spiar\Downloads\boulder-atlas-project   (READ ONLY: never write there; no git)
OSM extracts = C:\Users\Spiar\AppData\Local\Temp\claude\C--Users-Spiar-Downloads-boulder-atlas-project\ca66a530-3cc7-49ef-92b6-7250569d7f15\scratchpad\wave1\osm\<ISO>.json

Each wave-1 section has an `unlocated.md`: real gyms the researchers found but could not give a sourced coordinate. Your job: find
AUTHORITATIVE location evidence for them, without guessing, and propose them as candidates in a separate file. You do not change any
section: a human decides later whether your proposals are merged.

## Inputs (read only)
- `REPO\import\research\<section>\unlocated.md` (the list), `candidates.ndjson` (existing candidates: do not duplicate them; continue the
  cid numbering after the highest existing number), `sources.json` (existing source ids), `coverage.md`, `section.json` (scope).
- The wave-1 research rules: `C:\...\scratchpad\wave1\BRIEF.md` (full path: C\..\wave1\BRIEF.md). The candidate schema, evidence rules
  and enums there apply exactly, with one update: if bouldering is "unknown" or "no" and no rope offer is confirmed, `types` is `[]`.
- The section's region codes: C\..\wave1\regions.txt.

## Location sources you may use (in order)
1. The gym's OSM element in the extract (method "osm", ref "node/…" or "way/…"), matched by name, website or address.
2. The gym's own published pin: a map embed or map link on its own site/social, a "place" pin it links to, published coordinates
   (method "official-map"); a chain's location list with coordinates (method "chain-store-list").
3. NOTHING ELSE. Do not use Nominatim or any geocoder, do not estimate, do not take a pin from a directory. If you find an official
   published STREET ADDRESS but no pin, record the gym in `address-only.json` (a separate, rate-limited geocoding pass handles those).

## Outputs in `C\<section>\`
- `located.ndjson`: proposed candidates (exact wave-1 schema; new cids continuing the section's numbering; evidence with URLs and
  `accessed:"2026-10-01"`; `research_notes` saying "Track C: located from <source>").
- `sources-additions.json`: `{"sources":{...}}` new sources only, with ids that do not clash with the section's sources.json.
- `address-only.json`: `{"gyms":[{"name","city","state","address","address_source_url","website","bouldering":"yes|no|unknown","evidence":[...],"notes"}]}`
  for gyms with an official published street address but no pin.
- `unresolved.md`: every unlocated entry you could not locate or address, with the reason (closed, no region code, no official
  address, unreachable site, not a bouldering gym, out of scope, ...).
- Every entry in the section's unlocated.md must end up in exactly one of: located.ndjson, address-only.json, unresolved.md.

## Check (read only)
`node "C\check.js" <section>` merges your proposals into a throwaway copy of the section and runs the real reconcile. Fix every INVALID
and every CID/SOURCE CLASH. Flags (review, existing matches) are for the human reviewer: do not change data to clear them.

## Rules
Never guess. Never copy text from sites (paraphrase). Russia: gyms in cities without a region code stay in unresolved.md ("no region
code"). Israel: Koala (Kfar Etzion) is in the West Bank: do not propose it; put it in unresolved.md with "scope decision pending".
Final reply: a SHORT summary per section (proposed / address-only / unresolved counts and main problems). Do not paste the files.
