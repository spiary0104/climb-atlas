# Gym information batch 1: handoff (paused 2026-10-04)

Owner decisions (2026-10-04): fill `website` + `hours` only; official gym site (or official location page) only;
English-web metros. Batch 1 = Sydney, Melbourne, New York, Los Angeles, SF Bay Area (89 gyms, `targets-batch1.json`,
content hashes taken from production and equal to the import index). Batch 2 = Seattle, Denver, Boston, San Diego
(64 gyms, `targets-batch2.json`). Research rules: `brief.md`. Mechanical check: `node check-info.js <targets> <research>`.

## Done
- `research-la.json`: 20/20 found (website + hours); check clean.
- `research-nysf.json`: 31 found, 1 not-found, 1 flag; check clean. Decisions for the batch:
  - seed-227 The Rock Health and Fitness: EXCLUDE (official site is a general fitness gym, address differs). Owner may
    want a retire review.
  - seed-228 The Wall at Palisades: nothing found (no official site; likely defunct). Owner may want a retire review.
  - seed-210 Island Rock Gym: website only, DROP hours (taken from hidden page data; third-party listings differ).

- `research-au.json` (Sydney + Melbourne, 36): 32 found, 2 website-only, 2 flag; check clean. To review before the batch:
  - seed-32 Hardrock Nunawading: PERMANENTLY CLOSED (operator notice, last day 19 Dec 2025): EXCLUDE; retire candidate.
  - seed-20 Skywood Climbing: site says it moved to 144 Old Pittwater Rd, Brookvale (footer still Freshwater): EXCLUDE
    hours until confirmed; location-update candidate.
  - Partial-hours entries (seed-34, seed-12, seed-39, seed-11 Wed/Thu only): decide whether partial weeks are acceptable;
    seed-11 (The Ledge) likely should be website-only.
  - The worker read some JS-rendered pages via page data and susf.com.au in the browser pane; spot-check those.

## Not done
- Pipeline: DONE by a worker, NOT reviewed or merged: PR #39 (`feature/import-info-updates`, b4c7e65): fill-only website/hours
  updates through the gated updater (`Api.updateSpotInfo`), 319 tests / 318 pass / 0 fail / 1 skipped per the worker. Review it
  (brain), then merge only with the owner's approval. Commands: docs/import-workflow.md "Filling gym information".
- Then: spot-check research against the sites, build the maintenance batch (`intent:update`, `expect_h`, `source`,
  `set:{website,hours}`), validate / plan / dry-run, and hand the owner the apply command (owner's own PowerShell,
  service-role key never shared). No production write without the owner's explicit go-ahead.
