# Coverage: UK, Greater London coverage gap (2026-10-06-london)

## Result
- Scope: GB, bbox -0.70,51.25,0.40,51.75 (all of Greater London plus the commuter belt: Watford, Hemel Hempstead, Slough/Windsor edge, Walton, Guildford edge, Dartford/Swanley edge, Romford, Grays).
- 21 candidates: 18 accepted (staged), 3 deferred (MANUAL-CHECK.md), 0 same-as, 0 rejected. 11 sources registered.
- Reconcile: ready 18 | review 0 | blocked 3 | existing 0 | invalid 0. Plan: new 18, nothing existing/duplicate. Production dry-run: PREFLIGHT PASSED (partial, no credentials).
- Bouldeer already had 14 gyms inside this bbox (CroyWall, HarroWall, RavensWall, VauxEast, VauxWest, Mile End, The Castle, Yonder, White Spider, Yellow Spider, Blue Spider, Rhino Boulder, Romford Rock & Boulder, The XC). With the 18 accepted this becomes 32 in the bbox.
- The brief's "about 50 real-world gyms" is not borne out for bouldering gyms with a readable primary source: after sweeping every chain list and every OSM `sport=climbing` element in the bbox, about 33 London-area gyms have a real bouldering offer (14 existing + 18 accepted + Hackney Wick Boulder Project). The rest of a "50" figure is made up of school/university/youth-club walls, hotel/leisure-centre rope walls, high-ropes and clip-and-climb centres, which are not bouldering gyms.

## Accepted, by area (18)
| Area | Gyms |
|---|---|
| Central / City | EustonWall (NW1), City Bouldering Aldgate (EC3N), The Font Borough (SE1) |
| East | Climbing District London Fields (E8), BethWall (E2), CanaryWall (E14), City Bouldering Stratford (E15), Rise Climbing (E16) |
| North | Climbing District Tottenham Hale (N15) |
| South-east | Climbing District Building One (SE16), The Reach (SE18) |
| South-west / South | The Font Wandsworth (SW18), Substation Brixton (SW2), BlocFit Brixton (SW9), Climbing Co Fulham (SW6) |
| West | City Bouldering White City (W12), Westway Climbing Centre (W10), The Font Hounslow (TW3) |

## Chains and groups swept (primary chain pages read)
- **Climbing District** (ex-Arch / Stronghold): Building One, London Fields, Tottenham Hale on the chain's own list; Surrey Quays still in the menu but its page is a 404; Arch North and Arch Acton are not on the chain site (deferred, see MANUAL-CHECK).
- **London Climbing Centres**: all 8 centres read; 5 already in Bouldeer, 3 new (BethWall, CanaryWall, EustonWall).
- **City Bouldering**: all 4 London centres (Aldgate, Stratford, White City, Climbing Co Fulham, the former Climbing Hangar Parsons Green).
- **The Font** (Parthian group): Wandsworth, Borough, Hounslow (Reading and Southampton are outside the bbox).
- **Substation**: Brixton (the other site is in Macclesfield).
- Not bouldering gyms, so not candidates: Clip 'n Climb (Chelsea/Wandsworth/O2), Rock Up (Walton, Lakeside, Watford: harness walls and soft play), Third Space (gym-club rope wall), Westminster Lodge St Albans (rope only per its page).

## Boroughs / areas with no candidate (and why)
- Barnet, Enfield, Haringey (apart from Tottenham Hale), Redbridge, Havering (Romford already in Bouldeer), Bexley, Bromley (Rhino already in), Sutton, Merton, Kingston (White Spider already in), Richmond, Hillingdon, Ealing (Arch Acton deferred), Brent, Lewisham, Greenwich (The Reach in Charlton), Barking and Dagenham, Newham beyond Stratford/Canning Town: no bouldering gym with a readable primary source found. Only OSM entries for council leisure-centre or school walls (see leads).
- Outer belt: Watford, St Albans, Dartford, Epsom, Staines, Slough, Brentwood: nothing found beyond rope walls and Rock Up.

## Remaining leads (not candidates)
- Hackney Wick Boulder Project, 117 Wallis Road E9 5LN: real per a directory; website unreachable (MANUAL-CHECK #1).
- The Arch Climbing Wall: Arch North (Burnt Oak, HA8 5LD) and Arch Acton (W3 6LJ): OSM only (MANUAL-CHECK #2, #3). Arch Surrey Quays (SE16 7LL) has a dead page and is probably closed.
- Council/Better/Everyone Active leisure-centre climbing walls that may include a boulder area, not checked or no boulder evidence on the operator page: Hendon Leisure Centre (Better; page says "climbing", no bouldering), Brixton Recreation Centre, Britannia Leisure Centre (Hoxton), Michael Sobell Sports Centre (Finsbury Park), Swiss Cottage Leisure Centre, Elmbridge Xcel Sports Hub (Walton-on-Thames, 20 m rope wall), Harrow Leisure Centre. The Better booking pages did not resolve from here.
- Unnamed OSM `sport=climbing/bouldering` sports centres (no name, no website, no address) at about 51.6113,-0.2953 (Bushey/Stanmore area, `sport=bouldering`), 51.4308,-0.0657 (Dulwich), 51.4414,0.0132 (Eltham), 51.4299,-0.3720 (Hampton): could be school or club walls; left alone.
- University and student-union walls (Imperial College, Brunel, others), youth-club walls (Downside Fisher, Ensign, Jubilee Waterside): not public bouldering gyms.
- Closed: The Boardroom Wimbledon (listed as permanently closed on findclimbingwalls.com).

## Access problems
- The shared web-search tool hit its session quota before this section started, so discovery used chain sites, Photon (OSM), the OSM API and an Overpass mirror (the main Overpass servers rate-limit this IP), plus directory pages (Bouldering London, findclimbingwalls.com, boulderinglist.com, londonclimbingguide.com) as signposts only.
- ukclimbing.com listings are behind a Cloudflare check; not read.
- hackneywickboulder.co.uk did not resolve (DNS failure on http and https).
- Two later Overpass queries timed out; the first, complete `sport=climbing` query of the bbox (OSM data dated 2026-06-01) was used.
