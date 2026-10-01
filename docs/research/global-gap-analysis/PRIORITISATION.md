# Global gap analysis: prioritisation

> Which significant countries are missing from Bouldeer despite having a real indoor bouldering scene?

Snapshot: Bouldeer had **2,127 approved gyms in 84 countries** (index verified equal to live production 2026-09-30). Research date 2026-09-30. Methodology and caveats: `README.md`; data: `countries.json`; sources: `sources.json`.

## How to read this

- **Confirmed** = gyms whose bouldering offer is shown on the gym's own site/social or its chain's location list (the strict evidence).
- **Indicated** = the largest of: gyms found, a count stated by a source (e.g. a federation or directory), or gyms found plus named leads. It is an indication, not a census.
- **Gap** = Indicated minus Bouldeer's current count: how many more gyms the evidence points to. It assumes Bouldeer's gyms are among those found (not checked gym by gym).
- **New country** = the app has no region codes for it yet (`js/modules/regions.js`); it needs app support before any import.
- Order within a tier is a rule (Gap, then confirmed gap, then population), not a judgement.

## Tier criteria

- **Tier A**: large AND strong evidence AND opportunity_indicated >= 5
- **Tier B**: large or substantial AND strong evidence AND opportunity_indicated >= 3 (not A)
- **Tier C**: strong or moderate evidence AND opportunity_indicated >= 1 (not A or B)
- **watch**: only weak evidence (bouldering not confirmed by any gym's own site/social), or indicated gyms without confirmation
- **covered**: Bouldeer already holds at least as many gyms as the evidence indicates
- **no-evidence**: no indoor bouldering gym found
- Size: large = population >= 50M or GDP >= US$500B; substantial = population >= 10M or GDP >= US$100B; smaller = otherwise.
- Evidence: strong = >= 3 primary-confirmed gyms; moderate = 1-2 primary-confirmed, or >= 3 directory-listed; weak = only indirect or unconfirmed mentions; none = nothing found.

## Tier A: large country, established scene, big gap (9)

| # | Country | Population | GDP | Bouldeer | Confirmed | Indicated | Gap | Evidence | Confidence | Cities with gyms | App |
|---|---|---:|---:|---:|---:|---:|---:|---|---|---|---|
| A1 | Switzerland (CH) | 9.1M | $1,044B | 8 | 6 | 96 | **88** | strong | high | Zurich, Bern, Basel, Winterthur | supported |
| A2 | Singapore (SG) | 6.1M | $604B | 2 | 9 | 37 | **35** | strong | high | Singapore | supported |
| A3 | Russian Federation (RU) | 144M | $2,561B | 7 | 7 | 24 | **17** | strong | high | Moscow, Saint Petersburg, Yekaterinburg, Novosibirsk | supported |
| A4 | Israel (IL) | 10M | $611B | 8 | 12 | 19 | **11** | strong | high | Tel Aviv, Jerusalem, Haifa, Beer Sheva | supported |
| A5 | Sweden (SE) | 11M | $669B | 7 | 11 | 17 | **10** | strong | high | Stockholm, Gothenburg, Malmo, Uppsala | supported |
| A6 | India (IN) | 1464M | $3,956B | 8 | 8 | 16 | **8** | strong | high | Bengaluru, Delhi / Gurugram, Mumbai, Pune | supported |
| A7 | Thailand (TH) | 72M | $577B | 10 | 5 | 18 | **8** | strong | high | Bangkok, Chiang Mai, Pattaya, Phuket | supported |
| A8 | Turkiye (TR) | 86M | $1,597B | 3 | 4 | 8 | **5** | strong | medium | Istanbul, Ankara, Izmir, Antalya | supported |
| A9 | Indonesia (ID) | 286M | $1,446B | 9 | 6 | 14 | **5** | strong | high | Jakarta, Tangerang, Bandung, Surabaya | supported |

## Tier B: substantial country, established scene, clear gap (6)

| # | Country | Population | GDP | Bouldeer | Confirmed | Indicated | Gap | Evidence | Confidence | Cities with gyms | App |
|---|---|---:|---:|---:|---:|---:|---:|---|---|---|---|
| B1 | Malaysia (MY) | 36M | $472B | 6 | 11 | 21 | **15** | strong | high | Kuala Lumpur, Petaling Jaya, Shah Alam, Subang Jaya | supported |
| B2 | Portugal (PT) | 11M | $347B | 7 | 5 | 16 | **9** | strong | high | Lisbon, Porto, Coimbra, Braga | supported |
| B3 | Croatia (HR) | 3.9M | $105B | 8 | 3 | 14 | **6** | strong | medium | Zagreb, Rijeka, Pula, Osijek | supported |
| B4 | New Zealand (NZ) | 5.3M | $264B | 9 | 6 | 13 | **4** | strong | high | Auckland, Christchurch, Wellington, Hamilton | supported |
| B5 | Iran, Islamic Rep. (IR) | 92M | $363B | 4 | 3 | 7 | **3** | strong | medium | Tehran, Mashhad | supported |
| B6 | Czechia (CZ) | 11M | $391B | 8 | 3 | 11 | **3** | strong | medium | Prague, Brno, Ostrava, Plzen | supported |

## Tier C: smaller gap, smaller market or thinner evidence (13)

| # | Country | Population | GDP | Bouldeer | Confirmed | Indicated | Gap | Evidence | Confidence | Cities with gyms | App |
|---|---|---:|---:|---:|---:|---:|---:|---|---|---|---|
| C1 | Myanmar (MM) | 55M | $82B | 0 | 1 | 2 | **2** | moderate | medium | Yangon | **new country** |
| C2 | Morocco (MA) | 38M | $182B | 0 | 1 | 2 | **2** | moderate | medium | Marrakech, Rabat, Casablanca | **new country** |
| C3 | Macao SAR, China (MO) | 0.7M | $52B | 0 | 1 | 2 | **2** | moderate | medium | Macao | **new country** |
| C4 | Slovak Republic (SK) | 5.4M | $155B | 6 | 5 | 8 | **2** | strong | high | Bratislava, Kosice, Zilina, Nitra | supported |
| C5 | Bangladesh (BD) | 176M | $456B | 0 | 1 | 1 | **1** | moderate | medium | Dhaka | **new country** |
| C6 | Cambodia (KH) | 18M | $51B | 0 | 1 | 1 | **1** | moderate | medium | Phnom Penh | **new country** |
| C7 | Tunisia (TN) | 12M | $58B | 0 | 1 | 1 | **1** | moderate | medium | Tunis (La Marsa) | **new country** |
| C8 | Kuwait (KW) | 4.9M | $157B | 0 | 1 | 1 | **1** | moderate | medium | Kuwait City (Hawalli) | **new country** |
| C9 | Puerto Rico (US) (PR) | 3.2M | $129B | 0 | 1 | 1 | **1** | moderate | medium | San Juan, Bayamon | **new country** |
| C10 | Ukraine (UA) | 39M | $214B | 6 | 3 | 7 | **1** | strong | medium | Kyiv, Lviv, Kharkiv, Dnipro | supported |
| C11 | Peru (PE) | 35M | $335B | 5 | 2 | 6 | **1** | moderate | medium | Lima, Cusco, Arequipa | supported |
| C12 | Belarus (BY) | 9.1M | $93B | 5 | 4 | 6 | **1** | strong | medium | Minsk, Gomel, Brest, Grodno | supported |
| C13 | Serbia (RS) | 6.5M | $100B | 5 | 2 | 6 | **1** | moderate | medium | Belgrade, Novi Sad, Nis, Uzice | supported |

## Watch list: possible scene, not confirmed (10)

| Country | Population | GDP | Bouldeer | Confirmed | Indicated | Evidence | Why |
|---|---:|---:|---:|---:|---:|---|---|
| Pakistan (PK) | 255M | $407B | 0 | 0 | 1 | weak | bouldering not confirmed by any gym's own site/social |
| Uzbekistan (UZ) | 37M | $147B | 0 | 0 | 1 | weak | bouldering not confirmed by any gym's own site/social |
| Zimbabwe (ZW) | 17M | $51B | 0 | 0 | 1 | weak | bouldering not confirmed by any gym's own site/social |
| Azerbaijan (AZ) | 10M | $76B | 0 | 0 | 1 | weak | bouldering not confirmed by any gym's own site/social |
| Ethiopia (ET) | 135M | $126B | 0 | 0 | 0 | weak | only indirect or unconfirmed mentions |
| Uganda (UG) | 51M | $62B | 0 | 0 | 0 | weak | only indirect or unconfirmed mentions |
| Algeria (DZ) | 47M | $287B | 0 | 0 | 0 | weak | only indirect or unconfirmed mentions |
| Iraq (IQ) | 47M | $254B | 0 | 0 | 0 | weak | only indirect or unconfirmed mentions |
| Cote d'Ivoire (CI) | 33M | $100B | 0 | 0 | 0 | weak | only indirect or unconfirmed mentions |
| Cuba (CU) | 11M | $107B | 0 | 0 | 0 | weak | only indirect or unconfirmed mentions |
Each has at most an unconfirmed lead (e.g. a gym listed in a directory, a gym that is planned, or a federation wall); re-check before any research section.

## Already covered: no gap indicated (18)

| Country | Population | GDP | Bouldeer | Confirmed | Indicated | Evidence | Why |
|---|---:|---:|---:|---:|---:|---|---|
| Egypt, Arab Rep. (EG) | 118M | $365B | 2 | 2 | 2 | moderate | indicated gyms (2) do not exceed Bouldeer's 2 |
| Viet Nam (VN) | 102M | $515B | 7 | 6 | 7 | strong | indicated gyms (7) do not exceed Bouldeer's 7 |
| Kenya (KE) | 58M | $136B | 2 | 0 | 2 | weak | indicated gyms (2) do not exceed Bouldeer's 2 |
| Saudi Arabia (SA) | 37M | $1,277B | 5 | 3 | 4 | strong | indicated gyms (4) do not exceed Bouldeer's 5 |
| Kazakhstan (KZ) | 21M | $306B | 7 | 4 | 7 | strong | indicated gyms (7) do not exceed Bouldeer's 7 |
| Guatemala (GT) | 19M | $123B | 4 | 1 | 2 | moderate | indicated gyms (2) do not exceed Bouldeer's 4 |
| Bolivia (BO) | 13M | $65B | 6 | 1 | 6 | moderate | indicated gyms (6) do not exceed Bouldeer's 6 |
| Jordan (JO) | 12M | $62B | 2 | 1 | 2 | moderate | indicated gyms (2) do not exceed Bouldeer's 2 |
| United Arab Emirates (AE) | 12M | $552B | 7 | 4 | 6 | strong | indicated gyms (6) do not exceed Bouldeer's 7 |
| Bulgaria (BG) | 6.4M | $131B | 7 | 4 | 4 | strong | indicated gyms (4) do not exceed Bouldeer's 7 |
| Oman (OM) | 5.5M | $110B | 2 | 0 | 2 | weak | indicated gyms (2) do not exceed Bouldeer's 2 |
| Ireland (IE) | 5.5M | $722B | 9 | 6 | 7 | strong | indicated gyms (7) do not exceed Bouldeer's 9 |
| Costa Rica (CR) | 5.2M | $103B | 7 | 2 | 4 | moderate | indicated gyms (4) do not exceed Bouldeer's 7 |
| Panama (PA) | 4.6M | $90B | 3 | 0 | 3 | moderate | indicated gyms (3) do not exceed Bouldeer's 3 |
| Uruguay (UY) | 3.4M | $85B | 5 | 0 | 3 | moderate | indicated gyms (3) do not exceed Bouldeer's 5 |
| Qatar (QA) | 3.0M | $216B | 2 | 1 | 2 | moderate | indicated gyms (2) do not exceed Bouldeer's 2 |
| Lithuania (LT) | 2.9M | $95B | 8 | 3 | 5 | strong | indicated gyms (5) do not exceed Bouldeer's 8 |
| Luxembourg (LU) | 0.7M | $101B | 5 | 3 | 3 | strong | indicated gyms (3) do not exceed Bouldeer's 5 |
Bouldeer already holds at least as many gyms as the evidence indicates. Individual missing gyms may still exist (see each country's notes).

## No indoor bouldering gym found (10)

| Country | Population | GDP | Bouldeer | Confirmed | Indicated | Evidence | Why |
|---|---:|---:|---:|---:|---:|---|---|
| Nigeria (NG) | 238M | $291B | 0 | 0 | 0 | none | no indoor bouldering gym found |
| Congo, Dem. Rep. (CD) | 113M | $91B | 0 | 0 | 0 | none | no indoor bouldering gym found |
| Tanzania (TZ) | 71M | $90B | 0 | 0 | 0 | none | no indoor bouldering gym found |
| Sudan (SD) | 52M | $60B | 0 | 0 | 0 | none | no indoor bouldering gym found |
| Angola (AO) | 39M | $122B | 0 | 0 | 0 | none | no indoor bouldering gym found |
| Ghana (GH) | 35M | $114B | 0 | 0 | 0 | none | no indoor bouldering gym found |
| Cameroon (CM) | 30M | $59B | 0 | 0 | 0 | none | no indoor bouldering gym found |
| Sri Lanka (LK) | 22M | $109B | 0 | 0 | 0 | none | no indoor bouldering gym found |
| Dominican Republic (DO) | 12M | $127B | 0 | 0 | 0 | none | no indoor bouldering gym found |
| Turkmenistan (TM) | 7.6M | $50B | 0 | 0 | 0 | none | no indoor bouldering gym found |


## Screened but not researched in this pass (38)

Screen: bouldeer_count <= 10 AND (population >= 5,000,000 OR GDP >= US$50B). Research threshold: GDP >= US$50B. These 38 countries passed the screen on population but fall below the threshold:

Paraguay (PY, 7.0M, $49B, Bouldeer 2); Libya (LY, 7.5M, $48B, Bouldeer 0); Nepal (NP, 30M, $45B, Bouldeer 2); Honduras (HN, 11M, $40B, Bouldeer 0); Senegal (SN, 19M, $37B, Bouldeer 0); El Salvador (SV, 6.4M, $37B, Bouldeer 0); Papua New Guinea (PG, 11M, $32B, Bouldeer 0); Haiti (HT, 12M, $32B, Bouldeer 0); Mali (ML, 25M, $30B, Bouldeer 0); Zambia (ZM, 22M, $29B, Bouldeer 0); Guinea (GN, 15M, $28B, Bouldeer 0); Burkina Faso (BF, 24M, $28B, Bouldeer 0); Lebanon (LB, 5.8M, $26B, Bouldeer 3); Benin (BJ, 15M, $25B, Bouldeer 0); Syrian Arab Republic (SY, 26M, $24B, Bouldeer 0); Kyrgyz Republic (KG, 7.3M, $23B, Bouldeer 0); Mozambique (MZ, 36M, $22B, Bouldeer 0); Nicaragua (NI, 7.0M, $22B, Bouldeer 0); Niger (NE, 28M, $22B, Bouldeer 0); Yemen, Rep. (YE, 42M, $22B, Bouldeer 0); Chad (TD, 21M, $21B, Bouldeer 0); Madagascar (MG, 33M, $20B, Bouldeer 0); Lao PDR (LA, 7.9M, $18B, Bouldeer 0); Afghanistan (AF, 44M, $18B, Bouldeer 0); Tajikistan (TJ, 11M, $18B, Bouldeer 0); West Bank and Gaza (PS, 5.4M, $17B, Bouldeer 0); Rwanda (RW, 15M, $16B, Bouldeer 0); Congo, Rep. (CG, 6.5M, $16B, Bouldeer 0); Malawi (MW, 22M, $15B, Bouldeer 0); Somalia, Fed. Rep. (SO, 20M, $13B, Bouldeer 0); South Sudan (SS, 12M, $12B, Bouldeer 0); Togo (TG, 8.6M, $12B, Bouldeer 0); Mauritania (MR, 5.3M, $12B, Bouldeer 0); Sierra Leone (SL, 8.8M, $7B, Bouldeer 0); Liberia (LR, 5.7M, $5B, Bouldeer 0); Burundi (BI, 14M, $3B, Bouldeer 0); Central African Republic (CF, 5.5M, $3B, Bouldeer 0); Korea, Dem. People's Rep. (KP, 27M, -, Bouldeer 0).

