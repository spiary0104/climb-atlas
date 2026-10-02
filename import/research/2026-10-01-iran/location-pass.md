# Iran location pass (2026-10-01)

Scope: OSM extract `osm/IR.json` (38 elements), plus own-site pages re-read where reachable. No review decisions, no geocoders, no Overpass.

## Table

| cid | name | before (method, source) | after (method, source, precision) | moved (m) | status | note |
|---|---|---|---|---|---|---|
| ir-001 | Boulderland | official-map, S1 (own map link) | unchanged | 0 | unchanged-acceptable | no OSM element in extract |
| ir-002 | Tochal Club | official-map, S2 contact embed, area | unchanged (area) | 0 | unchanged-acceptable, concern documented | see Tochal section |
| ir-003 | Moj | official-map, S3 (page geo data), building | unchanged | 0 | unchanged-acceptable | no OSM element |
| ir-004 | MZ Sport Club | official-map, S4 (own map link), building | unchanged | 0 | unchanged-acceptable | nearest OSM element is a sports shop (about 500 m), not the gym |
| ir-005 (new) | Payam Climbing Academy | none (was unlocated) | osm, way/506455685, building | n/a | added (new candidate) | see below |

## Tochal (ir-002) concern
- Pin: Google embed on https://tochalclub.com/contact/ (35.69711933, 51.36983468, the embed centre `!2d/!3d`), which also carries a place id and a place title that decodes to "Tochal Club" (باشگاه توچال). So it is a place listing for the club, not a bare map centre.
- The written address on both the contact page and the bouldering page is identical: Qaem Cultural-Sports Complex (Saray-e Mahalle), first floor, Niyayesh Sq, Artesh Blvd. The contact page labels it the central office. So the club's office and the bouldering offer are given at the same address; the "office vs wall" concern is smaller than first feared, but the pin's position relative to the complex is unverified.
- Other web text describes the Qaem complex as southwest of Niyayesh Square and listing a rock-climbing academy; no coordinates were taken from those (directory/map services are not acceptable).
- OSM extract: no Qaem complex element. Nearest climbing-tagged element is a federation regional board office (node/11368065037, 35.69770, 51.41150), 3.76 km east: an organisation pin, not used. OSM way/1561031168 ("Tochal rock-climbing site", operator Tochal, underground building) is 30 km east and is not tied to the club's bouldering page.
- Result: not replaced. Precision stays `area`. Reviewer should compare the pin on a map with the Qaem complex. A note was appended to ir-002 research_notes (no coordinate change).

## New candidate
- ir-005 Payam Climbing Academy: OSM way/506455685 named exactly after the academy (آکادمی سنگ نوردی پیام), tagged sports centre + climbing, a 5-node closed outline; centre taken from the extract. Position agrees with the written address (Shariati St between Ghasr Sq and the Seyed Khandan bridge, opposite Andisheh Park). Precision `building`. Evidence: own Instagram (exists), directory iranrocktrip (address, rope and boulder), climbing federation article (national-team rope and bouldering camp there, July 2021). Weak: bouldering unknown, types [], status unknown; no own website read (payamclub.ir, the institution site, returns 403). check.js: blocked (status-not-open, insufficient-evidence, bouldering-unknown), reviewer to judge. New sources: S6 (Instagram), S7 (federation).

## Unresolved / not added
- Gmax Climbing Park: no OSM element; operator site gmaxparks.com has no pin (mentions a climbing club and Saadatabad, Payam Blvd); own climbing domains unreachable. Stays in unlocated.md.
- Enghelab bouldering gym: no OSM climbing element; complex site lists climbing and zipline lessons (2018 tariff), no bouldering, and its embed is the whole complex (35.78069, 51.39419; 485 m from Boulderland's pin): a venue pin, not the hall. Not added.
- Mohammad Davoudi hall (Shirudi): nothing in OSM, no own pin. Stays unlocated.
- Saeed Taheri hall (Dihkuh) and the other-city leads: nothing in OSM tied to them. Stay unlocated.
- Megapars climbing complex: OSM node/5115689244 (35.72725, 51.45166) tagged only as a pitch; own site suspended, no primary evidence; recorded as a lead in unlocated.md, not added.

## Suspicious
- Enghelab complex embed is only 485 m from Boulderland's pin: two different venues, no sign of a data error.
- ir-001, ir-003 and ir-005 trigger related-name-nearby review flags only; no data changed for them.
