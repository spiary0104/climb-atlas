# Gym information research brief v3 (Bouldeer, batch 5: non-metro gyms, 2026-10-04)

Bouldeer (www.bouldeer.com) is a community map of climbing gyms. For each gym in your target file, find from reliable
sources: (1) official website, (2) regular weekly opening hours, (3) day-pass price, (4) facilities. Research only: you
change no code, no repository file, no database. Write ONLY your output file (path in your prompt).

Do not spend more than a few minutes per gym. 3-4 reliable fields beat one uncertain field; leave a field null rather
than guess. Never infer; every non-null value must be stated on a page you actually fetched.

## Inputs
Target file (JSON array): `id, name, metro, country, state, suburb, address, lat, lng, types, expect_h`.
Copy `id`, `name`, `metro`, `expect_h` into your output unchanged.

## Sources (strict)
- Allowed: the gym's own website (its domain), the operator's official page for that location (chains: the location page,
  not the chain homepage, when one exists), and the gym's OWN booking/ticket page (e.g. its shop/ticket system linked from
  its site) for prices.
- Use web search only to FIND the official site. Never take facts from Google Maps, Yelp, TripAdvisor, Facebook,
  Instagram, Mountain Project, directories, blogs, news or third-party aggregators.
- Confirm it is this gym: name and street address match. If the gym appears permanently closed, renamed, moved, or not a
  climbing gym, set status "flag" and explain in notes.
- Many sites are JavaScript-rendered or in German: if WebFetch shows nothing useful, fetch raw HTML with curl via Bash
  (normal browser User-Agent) and read the text or embedded JSON; German pages are fine (translate the facts yourself).
  Do not use the in-app browser. If a site blocks automated clients, note it and move on.

## Field rules
- `website`: canonical https URL of the official site or location page. No tracking parameters. Max 300 chars.
- `hours`: keys `mon tue wed thu fri sat sun`. Use the general public opening hours (not office, café, kids-only,
  members-only/24-7 key access; if members have 24/7 access but staffed hours exist, use staffed hours). Ignore
  holiday/temporary notices; if only temporary or "varies"/calendar hours exist, set null. Try to state ALL 7 days (a
  closed day is "Closed"): hours are only published when all 7 days are known. If pages disagree, use the dedicated
  hours/visit page and say in notes which page differs. Multi-location operators: only THIS location's section.
- Hours format (exact): `6am–10pm` (lower-case am/pm, EN DASH U+2013, minutes only when non-zero `6:30am–10pm`, noon
  `12pm`, midnight `12am`); two ranges `9am–2pm, 4pm–10pm`; `Closed`; `24 hours`. Convert 24-hour times. Max 40 chars.
- `day_pass`: ONE line, max 120 chars, the standard single-entry adult price as the gym states it, with currency, e.g.
  `CHF 29 adult, CHF 23 student`, `€16 adult (bouldering)`, `£17.50 adult peak, £14 off-peak`, `C$27 adult`. Adult first;
  optionally one concession or peak/off-peak variant if it fits. Climbing entry only (no shoe hire, no induction fee, no
  membership). Use the currency symbol/code the gym uses (CHF, €, £, C$). If prices are only behind a login, or unclear,
  set null. Plain text, no line breaks, trimmed.
- `facilities`: array of keys from this fixed list ONLY: `cafe` (café/bistro/bar), `training` (training/fitness area,
  campus/system boards like Moonboard/Kilter, gym equipment), `kids` (kids climbing area, kids courses/parties),
  `shoe-hire` (rental shoes), `shop` (retail shop/pro shop), `showers`, `parking` (on-site/dedicated parking), `yoga`
  (yoga classes). Include a key only when the official site explicitly states it; order does not matter; null if none
  stated. Absence is not a claim, so a partial list is fine.

## Output (one JSON array, pretty-printed, one object per target, same order as the target file)
```json
{
  "id": "seed-500", "name": "Example Boulders", "metro": "Zurich", "expect_h": "0123456789abcdef",
  "website": "https://www.example.ch/",
  "hours": {"mon": "10am–10:30pm", "tue": "10am–10:30pm", "wed": "10am–10:30pm", "thu": "10am–10:30pm", "fri": "10am–10:30pm", "sat": "9am–9pm", "sun": "9am–9pm"},
  "day_pass": "CHF 29 adult, CHF 23 student",
  "facilities": ["cafe", "shoe-hire", "training"],
  "sources": [{"url": "https://www.example.ch/besuch", "accessed": "2026-10-04", "supports": ["website", "hours", "day_pass", "facilities"]}],
  "status": "found",
  "notes": ""
}
```
`status`: `found` (website + at least one of hours/day_pass/facilities), `website-only`, `not-found` (no official site),
`flag` (closed / renamed / moved / not a gym / doubtful match; explain). Every non-null field must be backed by a
`sources` entry whose `supports` names it. Keep notes short and factual (mention any judgement call).

## Finish
Write the file (save progress every ~5 gyms), re-read it, check: valid JSON; one entry per target in order; hours values
match the format and are <= 40 chars; day_pass one line <= 120 chars with a currency; facilities only from the list;
websites https. Reply with a short summary: counts per status, field counts (website/hours/day_pass/facilities), and the
`flag` gyms with one-line reasons.

## v3 additions: data-quality checks (do these for EVERY gym, also when no info fields are found)
Your target file gives our stored `address`, `suburb`, `lat`, `lng`. Add these fields to each output object:
- `operating`: `"yes"` (official site current, gym open), `"closed"` (official notice of closure, or the site/domain is dead
  AND no other official presence), `"not-a-gym"` (trampoline/adventure park, school, club without public access, shop...),
  `"unknown"` (no official presence found). A dead/parked domain alone is evidence, but say exactly what you saw.
- `official_address`: the street address as the official site gives it (one line), or null.
- `location`: `"ok"` (official address matches our address/pin area), `"wrong_pin"` (the official address is clearly in
  another town or more than ~1 km from our pin — give the distance estimate and the real town in notes), `"address_missing"`
  (we have no address; give the official one), `"mismatch"` (address differs but same area — explain), or `"unknown"`.
  Judge distance from the official address vs our lat/lng (you may geocode the official address with OpenStreetMap
  Nominatim, max 1 request per second, User-Agent "Bouldeer gym location check (bouldeer.com)").
- `renamed_to`: the current official name if the gym now trades under another name at the same address, else null.
- `duplicate_of_hint`: free text if the same venue seems to appear twice (e.g. two names at one address), else null.
Status rules stay as in the brief (`found` / `website-only` / `not-found` / `flag`): use `flag` for closed, not-a-gym,
renamed or doubtful-match gyms, and still record what you verified. Small independent gyms: give up after ~3 minutes if
there is no official presence (`not-found`, `operating: "unknown"`).
