# Tasks — open items only

Full history: `docs/archive/tasks.md` (archived, do not read); git log is the changelog.

Entry format: `### title` / Status / What / Notes. Move finished items out
(delete them; git keeps history). Keep this file under 60 lines.

## In progress
### Gym update 2026-10-05 (PR #74) — APPLIED, one step left
- Live 2026-10-05: +114 gyms (UK 30, DE 18, ES 4, IT 8, FR 43, KR 11), 4 pin fixes, Klättra Motala note, Arkose Cholet info; 2,386 gyms.
- Left: apply `2026-10-05-retire-mokpo-lead` (bouldering unconfirmed on the re-check; the other 5 weak KR gyms were confirmed).

## Gym data
### Research follow-ups (from the 2026-10-05 sections; details in each section's `review-notes.md` / `coverage.md`)
- Rename seed-1181 Monta Rex -> OneClimb (identity batch; same address, rebrand).
- Deferred: Lancaster Wall (site down), 4 UK gyms whose sites never say bouldering, 4 IT gyms (re-check via social), 3 KR
  (bouldering unstated), Arkose Issy (ex-MurMur), 6 DE (Ilmenau opening soon; Dessau, Ensdorf no current hours; 3 weak). Not to be listed: Boatyard Boulders (owner).
- Gaps: Napoli (no gym confirmed), UK towns not probed (uk-single-gym-towns coverage.md), Bloc Session Ardennes (no pin), sites that block
  automated reads (Kong Keswick, Indy Llanberis, Indirock, Spider Climbing).
- Decisions: KR evidence standard (Naver Place / Instagram); the merged Jeonnam-Gwangju region name in Korean addresses.
### Chain expansions
- Camp5 MY (~6), Hive CA (~4), Boulderwelt DE (~4), B-PUMP JP (~3), 9 Degrees AU (~2), Boulder Co NZ (~1). Verify each branch.
### Gym information (website, hours, day pass, facilities)
- 456 gyms in countries not yet researched; CN/KR need a source decision. Seed website + hours for the top metros.
### Locations and addresses
- 489 gyms with unresolved pin positions. `address` empty for ~299 (DE 112, GB 82, CN 54, NO 20, others few).
### Regional expansion
- Wave 3A (5 sections, PR #13) and 3C paused.

## Product
### Welcome after the first email confirmation
- Owner 2026-10-05: one-time welcome after a new user first confirms their email (log, save, add gyms); never on later sign-ins.
### Self-serve account deletion
- Users delete their own account from the app (the legal pages promise deletion within 30 days).
### Community publishing (Phase 4)
- Publish-then-review for edits, photos and confirm points are not built (gym-information edits still wait for moderation).
### Map performance
- MapLibre blocks first paint; the next step is architectural (lazy map or static first view).

## Blocked
- _(none)_
