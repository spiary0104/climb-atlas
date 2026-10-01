# Review notes: Sweden (2026-10-01-sweden)

Reviewer: Claude (AI) on the owner's instruction; owner sign-off pending. Tool check: OK, tally accept 31 | same-as 7 | defer 2 | reject 0.

## same-as (7)
- se-004 -> seed-1106, se-013 -> seed-1101, se-019 -> seed-1107 (importer exact matches, 5/23/27 m, no pin update).
- se-006 Bouldering Sthlm -> seed-1105 Bouldering Stockholm (0 m, same address).
- se-010 Klätterfabriken -> seed-1104, with followup location-update: existing pin is 223 m from OSM node 3715375091, which agrees with the gym's own site pin.
- se-011 -> seed-1103 (0 m), se-012 Fysiken Klätterlabbet -> seed-1102 (0 m). Fysiken is therefore already in Bouldeer; whether it is public is only relevant to that existing record (the candidate notes say members/drop-in).

## Defers (2)
- se-001 Klättercentret Solna: open today (hours, FAQ with bouldering, OSM node), but the chain announces closure on 19 Dec 2026 (contract not extended; no replacement site). Owner decides whether to add a gym closing in about 11 weeks. Evidence would otherwise support accept.
- se-029 F11 Klätterverkstad (Nyköping): only two try-out dates (11 and 25 Oct) and a member wall-card found; no regular drop-in, day pass or public hours. Need a source showing regular public access.

## Accepted with caveat
- Limited-access clubs accepted after re-reading their own sites (access evidence is mine, not in the candidate's evidence list): se-020 Skånes (day pass but booking needed), se-021 C4 (public hours about 12 h/week; adult bouldering wall inferred from bouldering groups and crashpad rental), se-023 Hangaren (weekly public drop-in plus reception entry; site has an expired TLS certificate), se-038 Halmstad (day entry without booking), se-039 Karlstad (guest pass via cafeteria, key access, youth blocks; new hall has no opening date), se-040 Tranås (public drop-in Wednesday evenings only).
- Single-source, primary site shows exists/open/bouldering: se-009, se-015 (JS app, re-read in a rendered browser), se-017, se-024, se-025, se-031, se-035, se-037.
- se-036 Racketcentrum: public day passes and daily hours, real bouldering area, but the pin is the OSM relation of the whole RC Arena building.
- se-037 Wallride: borderline (climbing hall inside an action-sports venue with skate and trampolines). Accepted because bouldering is a real, separate offer with public hours; owner may veto.
- se-007 Moumo: page still quotes summer hours to 10 Aug (stale); no closure notice.
- se-026 Örebro: rope offer unconfirmed, type left bouldering only. se-033 Åre: address only "Duved, Åre".
- se-014 Klättercentret Partille is the former Volym Partille (old domain parked); no existing Bouldeer record.

## Coordinates
No unresolved coordinate issues. se-003 chain pin is about 70 m from the OSM node (OSM kept). se-015 page embeds a second pin at Ollonborrstigen 13 (about 59.24, 15.17), a different town and probably another venue of the same operator; not used and not a candidate. se-009, 015, 017, 024, 025, 031, 035, 037, 039, 040 use the gym's own published pin (no OSM node).

## Owner decisions
1. Klättercentret Solna (se-001): add a gym that closes 19 Dec 2026, or skip.
2. Wallride Växjö (se-037): keep as a bouldering gym despite the action-sports setting?
3. Optional follow-up on se-015: what is the venue at Ollonborrstigen 13?

## Owner-directed follow-up (2026-10-01)
- se-001: defer -> accept. Owner question A: operating now per its own pages (hours, bookings, bouldering FAQ); closure 19 Dec 2026 recorded in the candidate notes.
- se-037 Wallride (owner question B, decision NOT changed, pending owner): own page (S WALLRIDE, re-read 2026-10-01) describes rope-free bouldering on crash pads, opening hours every day and the address Arabygatan 13, Växjö. PROBLEM: the recorded pin (56.8819139, 14.7812165) is the map VIEWPORT centre of the gym's own Google link, not its place pin (56.881911, 14.7837914); 156 m apart. Proposed: correct the pin to the place pin from the same official link, then keep accept. Until then the accept rests on a wrong pin.
- se-039 Karlstad Klätterklubb (decision NOT changed; flagged for owner): its own hall page (re-read 2026-10-01) says the guest card can only be bought together with a K3 member and entry is by key. That is guest-of-member access, not public access, so the drafted "limited-access cleared" accept is contradicted by the evidence. Owner to decide (rule F would defer it).
- Owner decisions 2026-10-01: se-037 Wallride ACCEPT with its pin corrected from the map viewport (56.8819139, 14.7812165) to the place pin of its own Google link (56.881911, 14.7837914); se-039 Karlstad DEFER (guest-of-member access only, per its own hall page).
