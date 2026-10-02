-- Security hardening 3/6: a submitter can no longer forge "Verified" (or a rejection reason) on a new gym.
--
-- Before: pin_community_submission() pinned status/community/edited/submitted_by/id on insert but not verified_at or
-- rejection_reason (both added later), so a signed-in user could insert a pending gym with verified_at set; after a
-- moderator approved it (approval does not touch verified_at) it would show as moderator-"Verified".
-- After: for any API caller (auth.uid() is not null) both columns are forced to null on insert. Moderators still set
-- verified_at separately with the gym page "Mark verified" control (a moderator UPDATE, never an insert).
-- The only change to the function is the two added assignments; everything else is the baseline body.
-- Existing rows are not touched (see docs/migrations.md for the read-only audit query).

begin;

create or replace function public.pin_community_submission() returns trigger
  language plpgsql
  set search_path = public
  as $$
begin
  if auth.uid() is not null then
    new.created_at       := now();
    new.updated_at       := now();
    new.community        := true;
    new.edited           := false;
    new.status           := 'pending';
    new.submitted_by     := auth.uid();
    new.verified_at      := null;
    new.rejection_reason := null;
    -- Client ids must look like our own 'community-<uuid>' scheme; anything
    -- else (an injected string, a spoofed 'seed-N') is replaced server-side.
    if new.id is null or new.id !~ '^community-[0-9a-f-]{36}$' then
      new.id := 'community-' || gen_random_uuid()::text;
    end if;
  end if;
  return new;
end;
$$;

commit;
