-- Security hardening 5/6: deleting an account must work. Shared contributions keep their content, lose the link.
--
-- Before: spots.submitted_by and routes.submitted_by referenced auth.users with NO ON DELETE action, so deleting an
-- auth user who had ever submitted a gym failed with a foreign-key violation. pending_edits.submitted_by had no foreign
-- key at all (a deleted user's id would stay behind as a dangling pointer).
-- After (every reference to auth.users in the public schema):
--   deleted together with the account (personal data):  profiles, marks, sessions (+ their session_climbs), checkins,
--                                                         moderators
--   kept, submitted_by set to NULL (shared content):     spots, pending_edits, reports, routes
-- Side effects of the SET NULL: the UPDATE fires spots_touch_updated_at, so a kept gym's updated_at moves to the
-- deletion time; an approved gym is shown as added by "a climber" (spot_provenance: no display name, not counted as a
-- contributor); a still-pending or rejected gym is no longer visible to anyone but moderators; contribution points
-- vanish with the account.
-- Orphaned pending_edits.submitted_by values (users deleted before this migration, when only unconstrained rows could
-- survive) are set to NULL first so the new foreign key validates. Idempotent: constraints are dropped and re-added.
-- Briefly takes a lock on spots/routes/pending_edits while the constraints are rebuilt (about 2,100 gyms: instant).

begin;

update public.pending_edits e
   set submitted_by = null
 where e.submitted_by is not null
   and not exists (select 1 from auth.users u where u.id = e.submitted_by);

alter table public.spots drop constraint if exists spots_submitted_by_fkey;
alter table public.spots add constraint spots_submitted_by_fkey
  foreign key (submitted_by) references auth.users(id) on delete set null;

alter table public.routes drop constraint if exists routes_submitted_by_fkey;
alter table public.routes add constraint routes_submitted_by_fkey
  foreign key (submitted_by) references auth.users(id) on delete set null;

alter table public.pending_edits drop constraint if exists pending_edits_submitted_by_fkey;
alter table public.pending_edits add constraint pending_edits_submitted_by_fkey
  foreign key (submitted_by) references auth.users(id) on delete set null;

commit;
