# New Zealand coverage (section 2026-09-30-new-zealand, researched 2026-10-01)

## Result
- 18 candidates in candidates.ndjson (17 with a coordinate source, one closed gym kept as a rejected record).
- 10 real gyms or walls without a coordinate source are listed in unlocated.md (no candidate created for them).
- 17 sources registered in sources.json (22 gym or directory sites read; OpenStreetMap is not used, see access problems).

## Cities and regions covered
Auckland (Westgate, Glenfield, Eden Terrace, Panmure), Hamilton (Te Rapa, Frankton), Turangi, Taupo, Mount Maunganui, New Plymouth, Palmerston North (Massey wall), Wellington (Fergs; Faultline and Hangdog unlocated), Christchurch (3 gyms), Dunedin, Nelson (Gravity Well and closed Vertical Limits). Unlocated but verified real: Queenstown, Wanaka, Rotorua, Invercargill, Whangarei, Lower Hutt, Wellington (Faultline), Glen Eden.

Regions with at least one candidate: AUCKLAND, WAIKATO, BAY_OF_PLENTY, TARANAKI, MANAWATU_WHANGANUI, WELLINGTON, CANTERBURY, OTAGO, NELSON. With only unlocated entries: SOUTHLAND (Y Southland wall), NORTHLAND (Boulder House). None found: GISBORNE, HAWKES_BAY, MARLBOROUGH, TASMAN, WEST_COAST.

## Main sources
Gym sites and chain pages (primary): Boulder Co. location pages (structured-data coordinates), Uprising, Northern Rocks, Auckland Climbing Gym, Extreme Edge Panmure and Hamilton, Rocktopia, Turangi Climbing Gym, Taupo District Council rockwall pages, YMCA Taranaki, The Kind Foundation (Christchurch Adventure Centre), Fergs Wellington, Resistance Climbing, The Gravity Well, Vertical Limits, Wellington Climbing (Faultline and Hangdog), Basecamp Adventures, Basementcinema (The Wall Rotorua), Y Southland, Boulder House, Massey University Alpine Club. Directory (support only): indoorclimbing.com NZ list. Search listings and gym-owned map links were used to find leads and resolve published map pins.

## Coordinate method (important for review)
No OSM extract existed for NZ, so every coordinate is a pin or GeoCoordinates that the gym or chain itself publishes: structured data (Boulder Co. x3, Fergs, Gravity Well), a map marker (Uprising, Turangi, Taupo, Vertical Limits), a shortened Google Maps link the gym site publishes that I resolved (Northern Rocks, Auckland Climbing Gym, YMCA Taranaki, Massey), a Google embed centre (Extreme Edge Panmure and Hamilton, Rocktopia), or the place link on the climbing page (Kind Foundation). Weaker ones are flagged in research_notes (Northern Rocks street-level, Resistance map centre, Fergs approximate, Massey is the recreation centre not the wall). A later OSM or geocoder pass should confirm them.

## Things for the reviewer
- Resistance Climbing moved in mid 2026 to 56 Parry Street West; older records use 27 Moray Place. The marker on the gym map still points at the old site, so the pin used is the map centre.
- Extreme Edge Glen Eden is now Vertical Adventures; bouldering is not confirmed on any page, so it stays unlocated (it would be bouldering unknown, top-rope only).
- The Rock House (Mount Maunganui) appears to be the same venue as Rocktopia (9 Triton Avenue); one candidate with an alias.
- YMCA Christchurch Adventure Centre (The Roxx) is now run by The Kind Foundation; one candidate with aliases.
- The Gravity Well (Nelson) and the closed Vertical Limits are separate venues about 300 m apart; some listings mix their addresses.
- Weaker bouldering offers: Taupo Rockwall (low bouldering strip), YMCA Taranaki (public sessions a few days a week), Massey wall (club members only).
- Uprising and Northern Rocks show importer duplicate or weak-coordinate flags in check.js; left untouched.

## Probably missing or deliberately excluded
- Not public or no bouldering confirmed: The Den (St Martins Scout Hall, Christchurch; groups and schools only), Rockatipu at Queenstown Events Centre (rope wall, bouldering not confirmed), Vertigo Climbing Ohakune (Clip n Climb and a rope wall), Clip n Climb sites (auto-belay only), Aspyre Fitness Hastings (fitness gym with a small wall), Harvest Rock Otorohanga (site dead), Campion College Gisborne (school wall), YMCA Hastings wall (currently unavailable).
- Closed: VertX Palmerston North (closed 2019, from directories only), Kiwi Adventure Napier (closed, from search results only), Vertical Limits Nelson (kept as a rejected candidate).
- University walls (Canterbury, Auckland Hiwa) exist for members only and are listed in unlocated.md; walls at other universities were not found.
- Possible new or small bouldering gyms in smaller towns (Tauranga, Napier, Queenstown, Wanaka, Kapiti, Timaru) that do not yet show in search results.
- Facebook and Instagram pages were not read, so any gym that only posts there would be missed.

## Access problems
- OSM extract osm/NZ.json never appeared during the session (the download queue was still on other countries), so no OSM coordinates or OSM-discovered gyms are included. Rerun the OSM step to resolve the 10 unlocated gyms and cross-check pins.
- Some sites blocked plain fetches (Northern Rocks, NZ Alpine Club directory and shop returned 403; Vertx site unreachable); Northern Rocks content was read through a different fetcher.
- Faultline and Hangdog sites are Readymag pages; content was read from the embedded page data. The Faultline page itself gives bouldering only through metadata and the gym's own description of itself as a bouldering gym; this is thinner than the other primary evidence.
