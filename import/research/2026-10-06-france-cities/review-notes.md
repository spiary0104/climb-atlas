# Review notes: France cities (2026-10-06-france-cities)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Reviewed 2026-10-06. Tally: accept 60 | same-as 0 | reject 3 | defer 3 (66 candidates). Tool check: reconcile ready 53 | review 8 | blocked 5 | invalid 0; stage and validate pass; plan: new 60, probable-duplicate 0.

## Accepts (60)
- All 60 are new to Bouldeer (the importer found no existing or probable duplicate) and each has a primary source (own site or chain page) for open, address and a bouldering offer, plus an OSM element or BAN house-number point for the pin.
- 52 were clean ("ready"); 8 carried review flags and are accepted with a reason and `reviewed_against`:
  - frc-004 / frc-005 Altissimo Grabels and Odysseum: two halls 10.6 km apart.
  - frc-022 / frc-023 Hueco City and Zenith: two halls about 4 km apart (centre of Strasbourg and Eckbolsheim), shared website only.
  - frc-042 / frc-043 Boulder Line 1 and 3 City: two sites about 5 km apart, shared website only.
  - frc-040 B'wall Lanester: street-level pin (own JSON-LD coordinates, 175 m from the OSM node); optional spot check.
  - frc-041 B'wall Quimper: single source (own site), opened 3 Oct 2026, no OSM element yet; BAN house-number point.
- Chain-branch note: every Altissimo, The Roof, ABLOK, B'wall, Hueco, Boulder Line, Karma and UCPA branch has its own address and city; none is a duplicate of another gym (the importer and the stricter review radii found no name or distance match against Bouldeer).
- Rope types: `top-rope` is added only where the gym's own page describes rope or auto-belay walls; `lead-climbing` was not checked and is not set.
- Limited-hours or unusual venues accepted after reading their own pages: Au Perchoir (climbing bar and coworking, 1,400 m2, 150+ problems), Climb Arena, Instant Grimpe (term-time afternoons), Gravity Bouldering (short weekday hours), UCPA Sport Station Nantes and Bordeaux (multisport centres with a bouldering area), Atome Climbing (bouldering rests on its FAQ page), Space Bloc (no address or hours on the site), Karma Fontainebleau (FFME national hall, open to all, closed for works until 8 Aug), The Roof Rennes (temporary-use project in the former Hotel Dieu).
- Pins of the 60 accepted: 57 OSM elements, 1 official JSON-LD pin (B'wall Lanester), 2 BAN house-number points (Altissimo Metz Haut Gazon, B'wall Quimper); the deferred Annette K. uses the page's own embedded coordinates. OSM-to-BAN distances are in each candidate's notes; the largest are Boulder Line 1 (190 m, whole-hall polygon) and Instant Grimpe (160 m).
- Pins not used because they disagree with the address: Arcabloc JSON-LD (1.5 km), Bloc Zone embedded map (1.5 km), Altigrimp page pin (4 km from OSM; gym not entered).

## Rejects (3)
- frc-025 Vertical'Art Lille: temporarily closed after a fire (own page header), no reopening date. `temporary`.
- frc-031 Blocbuster La Defense and frc-032 Blocbuster Versailles: permanently closed after judicial liquidation (own pages). `closed`.

## Defers (3, in MANUAL-CHECK.md)
- frc-008 Altissimo Landes: bouldering not established beyond the page title.
- frc-046 Bloc'n Roll: possible rename of the existing "SOLO Escalade - Toulouse" record with a different pin.
- frc-062 Annette K. (Climbing District, Paris 6e): rope hall, no bouldering area shown.

## Things the owner may want to know
- Existing-record oddities seen while researching (no change made from here): "HAPIK - Lyon" is in Bouldeer although Hapik halls are fun-climbing sites; "SOLO Escalade - Toulouse" may be Bloc'n Roll (see above).
- The Roof Albi and Altissimo Albi are two different halls 3 km apart; both are accepted.
- The existing "Climb Up - Chambery" record is rope-only and sits in La Motte-Servolex; La Zipette (Voglans, bouldering) and Wattabloc (Saint-Alban-Leysse) are separate gyms.
