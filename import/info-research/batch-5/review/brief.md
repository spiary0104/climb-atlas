# Bouldeer: resolve open review items (2026-10-04)

Bouldeer (www.bouldeer.com) is a community map of climbing gyms. Earlier research left items that need a decision. For
each item in your list, establish the facts from reliable sources TODAY and propose ONE decision. Research only: you change
no repository file and no database; write ONLY your output file (path in your prompt).

## Sources
- Facts only from the gym's own website / the operator's official location page / its own booking or price page /
  official registers (e.g. a company register) / official news posts on the gym's own site. Web search only to FIND those.
- Never take facts from Google Maps, Yelp, TripAdvisor, Facebook, Instagram, directories, blogs or aggregators (you may use
  them only as a lead to find an official page; say so in notes).
- If a site blocks plain fetches (geo-block, bot wall), try curl with a normal browser User-Agent, then the reader proxy
  `https://r.jina.ai/<official URL>` (it returns the official page's text; still counts as the official page; say so).
- Fetch with WebFetch, or curl via Bash (load WebFetch with ToolSearch "select:WebFetch" if deferred). No browser automation.
- Coordinates (ONLY if your prompt says you may geocode): OpenStreetMap Nominatim, at most 1 request per 1.5 s (sleep in
  Bash), User-Agent "Bouldeer gym location check (bouldeer.com)"; on HTTP 429 wait 60 s, retry once. Prefer an OSM element
  that IS the gym, else a house-number geocode of the official address (never street/postcode/town level), or the official
  site's own coordinates (JSON-LD geo, a map PLACE pin; not a viewport centre). Never Google Maps.

## Decisions (pick one per item; owner rule: "if unsure, retire" for closed / not-a-gym / duplicate evidence)
- `rename`: same venue, new official name. Give `name` exactly as the gym writes it (max 120 chars, drop marketing taglines).
- `retype`: types differ. `types` is a subset of exactly: indoor-bouldering, top-rope, lead-climbing (top-rope = rope
  climbing incl. auto-belays; lead-climbing only when the site states lead climbing).
- `suburb`: town/suburb wrong. Give `suburb` (the town as the official address gives it).
- `location`: give `address` (one line, as the official site gives it) + `lat`/`lng` + `coord_source`.
- `retire`: closed / not a climbing gym / no gym at this place: `reason_code` "closed"; or a duplicate of another listed gym:
  `reason_code` "duplicate" + `duplicate_of` (the other gym's id, given in your list).
- `add-gym`: a real gym that is missing from the map (e.g. a second hall, or a gym that moved to another state): give
  `new_gym` {name, address, suburb, state (full name), country (ISO-2), lat, lng, coord_source, types, website}.
- `fill`: official info for the gym: any of `website`, `hours` {mon..sun, all 7 days, format `6am–10pm`, EN DASH, `Closed`},
  `day_pass` (one line, as the gym states it, with currency, adult first), `facilities` (from: cafe, training, kids,
  shoe-hire, shop, showers, parking, yoga; only when stated for THIS location).
- `no-change`: our record is right (say why), or it cannot be settled from official sources (say exactly what you tried).
Several decisions may apply to one gym (e.g. rename + location + fill): list them all in `decisions`.

## Output (JSON array, one object per item, same order as your list)
{"item": <number>, "id": "<gym id>", "name": "<our name>", "decisions": ["rename","location",...],
 "values": {"name": "...", "types": [...], "suburb": "...", "address": "...", "lat": 0, "lng": 0, "coord_source": "...",
            "reason_code": "...", "duplicate_of": "...", "reason": "<one factual sentence for a retirement, max 300>",
            "website": "...", "hours": {...}, "day_pass": "...", "facilities": [...], "new_gym": {...}},
 "evidence": [{"url": "...", "supports": ["name","address",...], "accessed": "2026-10-04"}],
 "confidence": "high|medium|low", "notes": "<short: what you checked, any judgement call>"}
Save progress every few items. Finish by re-reading the file (valid JSON, one entry per item in order) and reply with one
line per item: item number, gym, decision(s), confidence.
