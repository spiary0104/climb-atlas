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

## Not done
- Sydney + Melbourne (36 gyms, `targets-au.json`): research was interrupted; rerun with `brief.md`.
- Pipeline: the gated updater cannot write website/hours yet. Work in progress (uncommitted) on branch
  `feature/import-info-updates` in worktree `.claude/worktrees/agent-a7b3a0d8c0767c95b`: fill-only info updates
  (refuse if a field is already set), new `Api.updateSpotInfo` behind the update gate, tests, docs. Finish it, test,
  open a PR (do not merge without review).
- Then: spot-check research against the sites, build the maintenance batch (`intent:update`, `expect_h`, `source`,
  `set:{website,hours}`), validate / plan / dry-run, and hand the owner the apply command (owner's own PowerShell,
  service-role key never shared). No production write without the owner's explicit go-ahead.
