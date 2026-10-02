# Global gap analysis (2026-09-30)

**Question:** which significant countries are missing from Bouldeer, or barely covered, despite having a real **indoor bouldering**
scene? This is a country-level discovery exercise only. **No candidates were researched for import, no research section or batch
was created, and nothing in production or the import pipeline was touched.** The output is the input for choosing the next
regional research sections (`docs/import-workflow.md`, "Regional research").

| File | Content |
|---|---|
| `PRIORITISATION.md` | The tiers as tables (generated from `countries.json`) |
| `countries.json` | One record per researched country: World Bank figures, Bouldeer count, evidence, counts, gap, tier, gyms found, caveats; plus the screened-but-not-researched list and every definition used |
| `sources.json` | Every source cited (300), with country, language, kind, access date and an HTTP check; plus the data sources |

Kept under `docs/` on purpose: Vercel redirects `/docs/*`, so these files are not served publicly. (Everything outside the hidden
paths is served: `www.bouldeer.com/import/...` returns the match index and research sections. The gym data there is public through the
app anyway; flagged here, not changed.)

## Method

1. **Bouldeer coverage.** Counted approved gyms per country from `import/index/gym-index.ndjson` after `verify-index --live`
   confirmed it equals production (2,127 gyms, 84 countries). Aggregates only.
2. **Size data.** World Bank WDI, most recent value per country: population (SP.POP.TOTL), GDP in current US$ (NY.GDP.MKTP.CD),
   GDP per capita (NY.GDP.PCAP.CD); aggregates excluded. Taiwan is not in the World Bank data (it has 23 gyms on Bouldeer, so it
   would not pass the screen anyway).
3. **Screen.** `Bouldeer count <= 10` AND (`population >= 5M` OR `GDP >= US$50B`): **104 countries**.
4. **Research threshold.** Every screened country with **GDP >= US$50B: 66 countries**, in six regional groups researched in parallel.
   The other 38 are listed as not researched (`not_researched` in `countries.json`).
5. **Evidence rules** given to every researcher: only indoor facilities with a bouldering offer count. Outdoor crags, mountain
   tourism, federations alone, rope-only walls, fitness gyms and kids' play walls do not. Strongest evidence is the gym's own site or
   official social account, or a chain's own location list; federation lists, directories, news and blogs only support. Local-language
   searches were required (Persian, Russian, Hebrew, Turkish, Arabic, French, Vietnamese, Thai, Czech, Swedish, Portuguese, Croatian,
   Spanish and others; see each source's `language`). Counts were never to be guessed.
6. **Scoring** (all in `countries.json` `definitions`):
   - *Confirmed* = gyms whose bouldering offer is shown on the gym's own site/social or its chain's list (chain branches counted
     individually), taken from each researcher's own caveats.
   - *Evidence strength* (strict, recomputed from Confirmed): strong >= 3; moderate 1-2, or >= 3 directory-listed; weak = indirect only;
     none. The researcher's own rating is kept as `researcher_rating`.
   - *Indicated* = max(gyms found, a count a source states, gyms found + named leads). *Gap* = Indicated minus Bouldeer's count.
   - *Size*: large = population >= 50M or GDP >= US$500B; substantial = >= 10M or >= US$100B; smaller otherwise.
   - *Tiers*: **A** = large + strong + gap >= 5; **B** = large or substantial + strong + gap >= 3; **C** = strong or moderate + gap >= 1;
     **watch** = weak evidence only; **covered** = Bouldeer already holds at least what is indicated; **no-evidence**.
   - *Priority* = order within a tier by gap, then confirmed gap, then population. A rule, not a ranking of countries' worth.
7. **Link check.** Every cited URL requested once (2026-09-30): 281 of 300 answered normally, 13 refused automated requests (403: theCrag,
   Tripadvisor, UKClimbing, Walltopia, a few others), 6 failed (each recorded in `sources.json`; none is the only support for a country's
   tier).

## Findings

**Tier A (9): large countries with an established scene and a big gap.** Switzerland, Singapore, Russia, Israel, Sweden, India,
Thailand, Turkiye, Indonesia. All are already supported by the app, so research sections can start without app work.

**Tier B (6): substantial countries, established scene, clear gap.** Malaysia, Portugal, Croatia, New Zealand (already the scaffolded
pilot), Iran, Czechia.

**Tier C (13): smaller gaps.** Eight have **no Bouldeer coverage but at least one confirmed gym**, and none is supported by the app yet:
Myanmar, Morocco, Macao, Bangladesh, Cambodia, Tunisia, Kuwait, Puerto Rico. The others (Slovakia, Ukraine, Peru, Belarus, Serbia) are
covered but a few gyms short.

**Watch (10):** Pakistan, Uzbekistan, Zimbabwe, Azerbaijan, Ethiopia, Uganda, Algeria, Iraq, Cote d'Ivoire, Cuba. Each has at most an
unconfirmed lead (a directory listing, a planned gym, a federation wall).

**Covered (18):** Egypt, Vietnam, Kenya, Saudi Arabia, Kazakhstan, Guatemala, Bolivia, Jordan, UAE, Bulgaria, Oman, Ireland, Costa Rica,
Panama, Uruguay, Qatar, Lithuania, Luxembourg. Bouldeer already holds at least what was found; single missing gyms are named in notes.

**No indoor bouldering gym found (10):** Nigeria, DR Congo, Tanzania, Sudan, Angola, Ghana, Cameroon, Sri Lanka, Dominican Republic,
Turkmenistan.

## Caveats (read before acting on a number)

- **Switzerland's gap rests on one directory count** (ClimbDirectory: 96 Boulderhallen; the SAC mentions ~90 climbing and bouldering
  facilities in Switzerland and neighbours). Only 6 gyms were confirmed on their own sites, and the search was German-language.
  Its Tier A place holds on the confirmed numbers alone, but the size of the gap is an estimate.
- **Counts are lower bounds from limited effort** (a few searches per country). Instagram and Facebook pages were mostly unreadable
  (login walls), so social-only gyms are undercounted, most in Latin America, the Gulf, North Africa and Sub-Saharan Africa.
- **Gaps assume Bouldeer's gyms are among those found.** This was not checked gym by gym; the reconcile step of a research section does
  that properly against the index.
- **Content was gathered by research subagents** and checked mechanically (country coverage, link check). I did not reopen every page;
  each record keeps the researcher's caveats and the evidence type per gym, so weak points are visible.
- **Operating status** was not verified per gym. Ukraine (war) and Myanmar (security) carry extra uncertainty.
- **World Bank values are the most recent available** (the year is recorded per country).
- **Out of this pass's screen:** countries with more than 10 Bouldeer gyms may also be thin relative to their scenes (e.g. Canada 23,
  Brazil 15, Mexico 16, Netherlands 25, Poland 31). A coverage-ratio pass over those is a separate exercise.
- **New countries need app support first** (region codes in `js/modules/regions.js`, labels, chips) before their gyms display correctly;
  the import pipeline only warns about it.

## Next phase (not started)

Pick sections from Tiers A and B and run the regional research workflow (`research new` → candidates with evidence → `reconcile` →
human review → `stage` → validate → plan → dry run → approval → apply → verify → rebuild index). Large countries should be split into
city or region sections (e.g. Moscow, Saint Petersburg; Zurich area, Romandie; Stockholm, Gothenburg). Tier C new countries need the
app-support change first.
