# Coverage: Portugal (PT), section 2026-10-01-portugal

## Result
31 candidates (pt-001 to pt-031). check.js: ready 8, review 5, blocked 18, existing 0, invalid 0. 3 further gyms in unlocated.md.
Bouldering confirmed from a primary source ("yes"): 15 candidates. The other 16 are "unknown" with empty types (mostly clubs, municipal walls, and gyms whose own site was down or blocked).

## Cities and regions covered
Lisboa metro (Lisboa, Carnaxide, Sao Domingos de Rana, Agualva-Cacem, Prior Velho, Olival Basto, Ericeira), Peniche, Setubal, Porto metro (Porto/Sao Mamede de Infesta, Matosinhos, Vila Nova de Gaia, Maia, Vila do Conde), Espinho, Braga, Guimaraes, Coimbra, Vila Real, Castelo Branco, Penha Garcia, Porto de Mos, Estombar (Algarve), Funchal and Machico (Madeira), Ponta Delgada (Azores).
Nothing found/checked for: Aveiro city, Leiria city, Viseu, Evora, Beja, Faro city, Viana do Castelo, Braganca, Guarda, Santarem, Portalegre.

## Main sources
- rockclimbingportugal.com gym directory: all 31 entries read (2 pages; page 3 empty). Each gym's detail page was fetched and its structured-data map pin and address recorded.
- Own sites read for: Climb UP, Escala25, Vertigo, CRUX, Altissimo, 9.8 Gravity, Ericeira Boulder, The West, IN WALL, upa!, Proa, The North Wall, Bloco, Madeira Climbing Center, CEB, NME Espinho, GMVR, Escalava, Dolinas.
- Cross-checks: Atlas Lisboa, Urban Sports Club (Lisbon/Porto), FCMP closure notice, local news.

## Coordinate sources (reviewer should know)
- OpenStreetMap extract W\osm\PT.json never appeared during the session (only MY/SG/IL/HR were present), so OSM was not used and is not registered in sources.json.
- 8 candidates use a gym-published pin (method official-map): CRUX, Ericeira Boulder, IN WALL, upa!, Proa, Escalava, Dolinas, Vila Real wall (short map links resolved, embeds, or site structured data).
- 23 candidates use the RCP directory's Google Maps pin with method "map-service-pin" and source RCP. That is not one of the three sources named in the brief; I used it because the numbers are published, not estimated. Reviewer may prefer to re-geocode these.
- Bloco and Madeira Climbing Center: their own sites only give coarse 4-decimal coordinates that disagree with the directory by 0.5 to 1 km, so the directory pin was used; both worth a location check.

## Probably missing / not verified
- Leads seen only on a Decathlon Portugal article ("Onde fazer escalada indoor em Portugal"): Boulder Society (Alvalade), Monk Boulder Bar (Benfica), Monks Braga, The Climb (Alcantara), Sharma Climbing Lisboa, Climbat Cascais/Gaia, UP Climbing Oeiras, UP Boulder Matosinhos, RocoClimb Braga, Boulder Lab Aveiro, Vertigym Almada, Vertigo Coimbra, Rocodromo AAC Coimbra. The article is demonstrably unreliable (it puts Vertigo in Picoas, Sharma has no Lisbon gym) and web searches found no own sites, so none were made candidates. Worth one more targeted pass (Instagram/Google Maps) for Boulder Society, Monk, Boulder Lab and Vertigym in particular.
- Algarve: "Algarve Boulder" (Portimao), "Lagos Climbing" and "Algar Climbing Gym" appear only in search-result summaries, not on any page I could confirm. Rocodromo Lagos em Forma also mentioned.
- Excluded: Higia (Torres Vedras) is a fitness/CrossFit gym whose own site mentions no wall; Escalodromo do Jamor, Escalodromo Seixal/Leiria/Evora and Viana do Castelo wall: only on the weak article, unchecked.
- Several clubs and municipal walls (CEM Maia, ADEB, CEB, Espinho, Vila Real, Penha Garcia, Agua de Pena, Casal Vistoso, 100 Vertigens) exist per directories but need a primary page for bouldering and public access.

## Access problems
- saorockclimbing.com: HTTP 403 (also in Playwright). verticalwall.pt: HTTP 522. murus.pt: connection/TLS failure. onesoul.pt/climbing: 404. escalava.com homepage is a placeholder; only a Sept 2025 post describes the gym.
- Facebook pages (ADEB, Areeiro, NEMF) not readable.
- 9.8 Gravity, The North Wall, Zone, Vertical Escalada sites are thin or script-built, so bouldering is "unknown" or weakly supported despite directory tags.
- Web-search quota was available but results were short summaries; no Nominatim or Overpass was used.
