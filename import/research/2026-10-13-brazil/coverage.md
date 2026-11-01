# Coverage: Brazil (2026-10-13)

## Result
- 21 candidates (br-001 to br-021), 21 sources registered. Review: accept 7, same-as 10, defer 3, reject 1. 10 of the 21 candidates matched an existing Bouldeer gym (documented, never inserted).
- Bouldeer held 14 Brazilian gyms before this pass. Real-world estimate from the gap analysis (2026-10-06): about 90 (70-130); the CBEscalada mapping of Dec 2024 counted 68 indoor gyms. Not independently verified.
- Result: 14 -> 21 gyms if the batch is applied. Roughly 40 more gyms exist but have only an Instagram presence (unreadable) or no pin; see MANUAL-CHECK.md.

## Per city (estimate = CBEscalada list Dec 2024 plus 2025-26 growth, unverified)
| City / area | Est. gyms | In Bouldeer before | Accepted now | Deferred / leads |
|---|---|---|---|---|
| São Paulo city | ~10 | 5 (Casa de Pedra x2, Fábrica x2, 90 Graus) | 0 | TreeLab (site unreadable), República dos Macacos (site stale); Action Park and Voltz are not climbing gyms |
| SP metro / interior (Campinas, Sorocaba, Jundiaí, Indaiatuba, Ribeirão Preto, ...) | ~18 | 0 | 2 (PowerBloc, Geometrik) | Meru C3 deferred; Suba, Ibex deferred (open/pin); about 12 Instagram-only |
| Rio de Janeiro city | ~3 | 1 (Evolução) | 0 | none readable (Voltz is a parkour gym); Niterói Granito (indoor or outdoor?) and Volta Redonda/Resende are Instagram-led |
| Belo Horizonte | ~5 | 5 (Summit, Das Pedras, Up, Rokaz x2) | 0 | Rokaz Buritis pin duplicates Savassi (follow-up) |
| Minas Gerais interior | ~6 | 0 | 0 | Vertical Uberlândia (pin), 6 Instagram-only |
| Curitiba | ~5 | 3 (Caverna, UBT, Via Aventura/AltaMontanha) | 1 (Campo Base) | CT de Escalada (municipal Olympic training centre) not pursued; Paredão Parque Olímpico do Cajuru is municipal |
| Maringá | ~1 | 0 | 0 | Apus (pin) |
| Porto Alegre / Caxias | ~5 | 0 | 0 | Muro (open? pin), Climbing Wall (domain gone), AGM is a club; Venga, V10 Instagram-only |
| Florianópolis and Santa Catarina | ~8 | 0 | 0 | Blocs, YTA, Sirius, Fels, Jurapê, Cipó, Garopaba Vertical, Camboriú: Instagram-only or domain gone |
| Brasília | ~5 | 0 | 2 (UBT, Eleva) | Vértice (pin only missing), Kasa, Primata, Omni |
| Goiânia / Anápolis | ~4 | 0 | 0 | Vertical, Escale, Adrena Gyn, Block Rock: Instagram-only |
| Fortaleza | ~2 | 0 | 1 (Café com Magnésio) | Fábrica de Monstrinhos is a kids' space (OSM) |
| Vitória (ES) | ~2 | 0 | 1 (Toca) | Moddev |
| Salvador, Recife | ? | 0 | 0 | none found in any accessible source |

## Chains covered
- Casa de Pedra (2 units, both in Bouldeer), Fábrica (2 units on its own site, both in Bouldeer), Rokaz (2 units, one with a bad pin), UBT (Curitiba in Bouldeer, Brasília added), 90 Graus (in Bouldeer, pin follow-up).

## Method
- Leads: CBEscalada mapping via Go Outside and TopClimbing directory, Mountain Project and Redpoint gym lists, OSM `sport=climbing` country query (195 elements, about 12 gyms), São Paulo Secreto guide.
- Every accepted gym: own site read directly (curl with page text, WordPress `wp-json` page-modified dates and map embeds where present); pins from the gym's own OSM element or its own embedded map; Photon/Nominatim for address geocodes.
- Instagram, Facebook and Reddit were not used as sources.

## Remaining leads
See MANUAL-CHECK.md. Highest value: Vértice Escalada (Brasília, needs only a pin), Apus (Maringá, pin), and the Instagram-only gyms in Florianópolis, Porto Alegre, Goiânia and the São Paulo interior (a second source or the owner's check on each Instagram bio).
