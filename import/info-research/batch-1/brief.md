# Gym information research brief (Bouldeer, batch 1, 2026-10-04)

Bouldeer (www.bouldeer.com) is a community map of climbing gyms. Each gym now has empty `website` and `hours` fields.
Your job: for each gym in your target file, find (1) its **official website** and (2) its **regular weekly opening hours**,
from the gym's **official site only**, and write the result to your output file. Research only: you change no code, no
repository file, no database. Write ONLY your output file in the scratchpad directory named in your prompt.

## Inputs
Target file (JSON array): each gym has `id, name, metro, country, state, suburb, address, lat, lng, types, expect_h`.
Copy `id`, `name`, `metro`, `expect_h` into your output unchanged.

## Sources (strict)
- Allowed: the gym's own website (its own domain), or the operator's official page for that specific location
  (chains: use the location page, e.g. `https://chain.com/locations/brooklyn`, not the chain homepage, when one exists).
- Use web search only to FIND the official site. Never take facts from Google Maps, Yelp, TripAdvisor, Facebook,
  Instagram, Mountain Project, directories, blogs or news. If the official site does not state it, leave it null.
- Confirm the site is this gym: name and suburb/address match. If the gym appears permanently closed, renamed, moved
  to a different address, or not a climbing gym, set status "flag" and say so in notes (still record what you found).
- Fetch the actual page that shows the hours (often /hours, /visit, /plan-your-visit, /contact, footer). Do not guess.

## Field rules
- `website`: the canonical https URL of the official site or location page, e.g. `https://www.example.com/` or
  `https://chain.com/locations/brooklyn`. https if the site supports it. No tracking parameters. Max 300 chars.
- `hours`: object with keys from `mon tue wed thu fri sat sun`, only days the site states. Use the general public /
  climbing opening hours (not office, café, kids-program or member-only 24/7 access; if members have 24/7 access but
  staffed hours exist, use staffed hours and note it). Skip holiday/temporary notices; if only temporary hours are
  shown, or hours "vary" / are calendar-only, set `hours` null and explain in notes.
- Hours format (exact): `6am–10pm` (lower-case am/pm, EN DASH U+2013 between times, minutes only when non-zero:
  `6:30am–10pm`, noon = `12pm`, midnight = `12am`); two ranges joined with `, ` (`6am–2pm, 4pm–10pm`); a closed day
  `Closed`; round the clock `24 hours`. Every value at most 40 characters.
- Australian sites may write 24-hour times; convert to the format above.
- Never copy descriptions or marketing text. Facts only.

## Output (one JSON array, pretty-printed, one object per target gym, same order as the target file)
```json
{
  "id": "seed-11", "name": "The Ledge Climbing Centre", "metro": "Sydney", "expect_h": "0123456789abcdef",
  "website": "https://www.example.com/",
  "hours": {"mon": "6am–10pm", "tue": "6am–10pm", "wed": "6am–10pm", "thu": "6am–10pm", "fri": "6am–10pm", "sat": "8am–8pm", "sun": "8am–8pm"},
  "sources": [{"url": "https://www.example.com/visit", "accessed": "2026-10-04", "supports": ["website", "hours"]}],
  "status": "found",
  "notes": ""
}
```
`status`: `found` (website and hours), `website-only` (official site found, no usable hours), `not-found` (no
official site), `flag` (closed / renamed / moved / not a gym / doubtful match; explain). Every non-null field must be
backed by a `sources` entry whose page you actually fetched and that states it. Keep notes short and factual.

## Finish
Write the file, re-read it, check: valid JSON; one entry per target; every `hours` value matches the format and is
at most 40 chars; every website starts with https:// (or http:// only if the site has no https). Then reply with a
short summary: counts per status, and the list of `flag` gyms with one-line reasons. Do not write anything else.
