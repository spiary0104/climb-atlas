# Coverage: India (IN), 2026-10-01

## Result
16 candidates (check.js: ready 5, review 11, blocked 0, existing 0, invalid 0), 24 registered sources (OSM plus 23 pages/sites; some registered for unlocated leads only), 13 leads in unlocated.md.

## Cities covered
Delhi (BoulderBox), Gurugram (Climb Central), Noida (Climb City), Bengaluru (Climb Central, Equilibrium Hoodi and Indiranagar, Elevate, Bangalore Boulder), Goa/Anjuna (Equilibrium), Mumbai (The Indian Bouldering Company), Navi Mumbai (Boulder 21), Pune (Rock Aliens, GGIM/SMJV wall), Hyderabad and Secunderabad (Crag Studio, two sites), Chennai (Fit Rock Arena Chetpet).

## Main sources
Gyms' own sites (BoulderBox, Climb Central, Equilibrium, TIBC, Crag Studio, Fit Rock, Rock Aliens, GGIM, Climb City, Girivihar), two gym-run MyTribe storefronts (Elevate, Bangalore Boulder; registered as official-social, the reviewer may want to treat them as weaker than a own-domain site), and the OpenStreetMap extract for coordinates. Directories (BoulderingList, indoorclimbing.com, LBB) were used for leads only.

## Coordinates
- OSM: BoulderBox, Equilibrium Indiranagar and Goa, Elevate, Bangalore Boulder, Crag Studio Gachibowli.
- Gym's own map pin or published coordinates: Climb Central Gurugram and Bengaluru (map embeds), Equilibrium Hoodi (site structured data), TIBC (contact page embed), Crag Studio Mettuguda (map data in the site script), Fit Rock (map embed), Rock Aliens (site platform data), GGIM (map link on page), Climb City (Maps place link), Boulder 21 (Maps link on Girivihar page).
- Positions to eyeball: Equilibrium Goa (OSM vs site pin about 750 m apart), Equilibrium Indiranagar (about 300 m), Climb Central Bengaluru (two different embeds on the chain site, 3.4 km apart; the newer, place-labelled one was used), Rock Aliens (street level only).

## Judgement calls for the reviewer
- Boulder 21 (public, trust-run, registration required, free) is category "club"; GGIM wall is a company-run wall inside a school, category commercial-gym. Both are borderline "gym" cases.
- Chains (Climb Central, Equilibrium, Crag Studio) are one candidate per site.
- Equilibrium Hoodi / Indiranagar / Goa are the three EQ sites; Hoodi alone has ropes.

## Probably missing
- Gyms that live only on Instagram (not readable here): Climb Craft (Pune), Climbing Asylum (Kolkata), possibly small walls in Pune, Mumbai, Kochi, Jaipur, Ahmedabad.
- Four real gyms are in unlocated.md for lack of a coordinate source (Lets Play Climbing, Urban Climbers, On The Rocks, Girivihar YMCA).
- Rope-only gyms, college and army walls (IIT, Ramjas, St. Stephen's, IMF Delhi, Podar College) were not pursued: no evidence of public bouldering access.
- Search for Hindi terms returned only vendors (as in the gap analysis). Smaller cities (Chandigarh, Dehradun, Kochi, Coimbatore, Jaipur, Ahmedabad, Indore, Lucknow) returned nothing credible, which may reflect search limits rather than absence.

## Access problems
- The first OSM extract (IN.json) was an Overpass error page (encoding of the regex); a corrected extract with 76 elements appeared at 16:43 and was used.
- Several sites are JavaScript apps (Crag Studio, Fit Rock, Rock Aliens); details were read from page scripts and structured data, not rendered text. Crag Studio's own JSON-LD address is a placeholder and was ignored.
- Instagram and Facebook pages were not fetchable.
- Gym hours/open status for GGIM and Fit Rock are only indirectly shown.
