# Wave 3 (2026-10-02)

Follows Tier A (wave 1) and Tier B (wave 2) of the global gap analysis (`docs/research/global-gap-analysis/`, PR #9).
**Nothing here is staged, imported or written to production.**

| Part | What | Status |
|---|---|---|
| 3A | Research sections for the app-supported Tier C countries: Slovakia, Ukraine, Belarus, Peru, Serbia | `import/research/2026-10-01-{slovakia,ukraine,belarus,peru,serbia}/`; status in `docs/research/wave-3a/STATUS.md`. Awaiting review; no decisions |
| 3B | Tier C countries Bouldeer does not support yet | **On hold** by owner decision (below); no app-support code |
| 3C | Coverage-gap check of established markets (> 10 gyms) | `COVERAGE-CHECK.md` + `coverage/*.json`. Shortlist only |

## 3B: held candidates (decision pending)

Each has at least one gym confirmed on its own site or social page in the gap analysis, and none is supported by the app yet
(region codes in `js/modules/regions.js`, labels, filter chips). They need that app-support change before any research section.

| Country | ISO | Confirmed gyms (gap analysis) |
|---|---|---:|
| Morocco | MA | 1 |
| Myanmar | MM | 1 (security situation: status uncertain) |
| Bangladesh | BD | 1 |
| Cambodia | KH | 1 |
| Tunisia | TN | 1 |
| Kuwait | KW | 1 |
| Puerto Rico | PR | 1 |
| Macao | MO | 1 |

## 3A finding worth noting

The gap analysis put each 3A country only 1-2 gyms short. Slovakia's section has 22 candidates against Bouldeer's 6, so the
small-country estimates were lower bounds, as its caveats said. The coverage check (3C) shows the same pattern in established
markets: Bouldeer usually covers about four cities per country well and little outside them.
