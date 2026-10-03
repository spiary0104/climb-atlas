# Gym information batch 2 (2026-10-04)

Same rules as batch 1 (`../batch-1/brief.md`, `../batch-1/HANDOFF.md`): website + hours from the gym's official site only;
hours only when all 7 days are stated. Targets: Seattle, Denver, Boston, San Diego (64 gyms, `targets-batch2.json`; ids
and content hashes re-read from production on 2026-10-04, unchanged since batch 1 was planned).

Batch `import/batches/2026-10-04-gym-info-2` (built with `../batch-1/build-info-batch.js`, RESEARCH_FILES=research-swd.json,research-bsd.json):
- 55 website + hours, 4 website only (seed-177 Insight: unexplained Wednesday marker; seed-186 Summit Everett: pages disagree;
  seed-305 CRG Waltham and seed-355 Mesa Rim Climbing Academy: no hours published).
- Excluded: seed-81/82/83 Denver Bouldering Club (site expired; news reports the company closed after bankruptcy: retire
  review, owner decision); seed-86 G1 Climbing (site blocks every client: nothing verified); seed-401 Solid Rock Gym (address
  now Vertical Hold San Marcos: rename/retire review).
- Plus 1 retirement: seed-32 Hardrock Nunawading (closed 19 Dec 2025, operator notice, checked 2026-10-04).
- Independent fact-check of 14 records (`verify-*.json`): 14 OK; all websites official.
- Follow-up: seed-318 Asylum's site says "All Outdoor Facility" (type tag may be wrong).
