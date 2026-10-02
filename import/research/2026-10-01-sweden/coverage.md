# Coverage: Sweden (2026-10-01)

## Result
- 40 candidates (se-001 to se-040), 24 real venues listed in unlocated.md (no coordinate source), 34 sources registered.
- check.js: ready 17 | review 20 | blocked 0 | existing 3 | invalid 0. Existing matches (Klätterverket Gasverket, Backa Boulder, Malmö Klätterklubb) were left as-is for the reviewer.

## Cities / counties with candidates
Stockholm (Solna, Hägersten, Kista, Stockholm, Nacka, Johanneshov), Göteborg, Partille, Kungsbacka, Malmö, Lund, Helsingborg, Kristianstad,
Linköping, Norrköping, Motala, Örebro, Västerås, Uppsala, Nyköping, Falun, Gävle, Östersund, Åre/Duved, Luleå, Jönköping (2), Tranås, Växjö,
Halmstad, Karlstad. 16 of 21 counties have at least one candidate.
Counties with no candidate: Blekinge, Gotland, Kalmar, Västerbotten, Västernorrland. Venues exist there (see unlocated.md) but have no coordinate source.

## Main sources
- Klättercentret chain site (all 8 sites checked individually for hours and a bouldering mention; chain pages also publish a map pin per site).
- Each gym's own site, fetched directly (static fetch and a headless browser for JavaScript-only sites such as Klätterverket, Karbin, Åre, Urban Boulders).
- Svenska Klätterförbundet member-club list (https://www.klatterforbundet.se/om-forbundet/klubbar/) to enumerate club halls; activated.se climbing-wall list for cross-checking towns.
- OSM extract for coordinates (30 candidates) and site map pins for the rest (official-map 9, chain-store-list 1).

## Probably missing / uncertain
- Club halls: Sweden has about 80 federation clubs; 24 halls found without coordinates are in unlocated.md. A coordinate pass (geocoding the published addresses) would turn most of them into candidates.
- Not verified / not found: Borås Klätterklubb (hall not found on its site), Uppsala Klätterklubb hall (ukk.nu did not load), Lindesbergs, Enköpings, Örebro Klätterklubb, Södertälje, Norrtälje klättervägg, Gotland beyond Visby, Skellefteå/Piteå extras, Gislaved Modulen Beach Klättercenter, Lund "UASyds klättercenter", Arvika (Jösse Klättersällskap, Stallverket), Värnamo, Ljungby.
- Newly announced or changing: Beta Boulders Göteborg (opening soon, address not public), Karlstad Klätterklubb new hall (target Sept 2026), Åredalens Klätterklubb new boulder hall at Röjsmon (under construction), Klättercentret Solna closes 19 Dec 2026, Silk Bouldergym (Instagram teaser only, no location found).
- Borderline entries kept as candidates: Wallride Växjö (action-sports hall with bouldering walls), Racketcentrum Jönköping (racket centre with a climbing area), Fysiken Klätterlabbet (student-union gym, category university).
- Excluded as outdoor or not climbing venues: Höganäs Boulder Park (two outdoor boulders), Stenungsunds Klätterklubb (site shows outdoor activity only), Jumpyard trampoline parks, high-ropes courses (Upzone, Högt & Lågt, AccroPark, etc.), school sports halls.
- Rope-offer types are only listed where seen on the venue's own pages; some gyms probably also have rope walls (Örebro, Malmö, Helsingborg, Kungsbacka, C4).
- Addresses: a few come from OSM or a third-party directory rather than the venue site (Karbin, Åre has only Duved); noted in research_notes where relevant.

## Access problems
- Web search quota for the session ran out part-way (shared across parallel agents); later discovery used a public HTML search endpoint, which rate-limited after a few queries.
- Shared headless browser was occasionally interrupted by other agents navigating at the same time; affected probes were redone with static fetches.
- Some sites blocked plain fetches (Karbin, Urban Boulders, Åre returned 403/455 to curl); the headless browser read them. linkopingsklatterklubb.se has an expired TLS certificate (read with certificate checks off).
- vlym.se (old Volym Partille domain) is now a parked page.
