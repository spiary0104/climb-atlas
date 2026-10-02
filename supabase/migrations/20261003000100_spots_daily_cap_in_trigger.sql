-- Post-launch fix: the 10-gyms-a-day submission cap can no longer be bypassed with one bulk insert.
--
-- Before: the cap lived only in the spots INSERT policy (`recent_submission_count() < 10`). A policy check sees one statement
-- snapshot, so a single multi-row INSERT (a JSON array in one REST call) of 15+ gyms passed it (shown by the INFO case in
-- scripts/migration-tests/20-tests.sql, 2026-10-02).
-- After: pin_community_submission() also enforces the cap per row, under a per-user advisory lock, exactly like the edit and
-- report caps (20261002000100). Over the cap the insert fails with 'daily gym limit reached'. The policy check stays as is
-- (defence in depth). The only change to the function is the cap block; the rest is the body from 20261002000300.
-- Service-role writes (the importer: auth.uid() is null) are untouched. Existing rows are untouched.
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
    -- At most 10 new gyms per user per rolling 24 hours, counted per row (a bulk insert cannot slip past it).
    perform pg_advisory_xact_lock(hashtextextended('spots:' || new.submitted_by::text, 0));
    if public.recent_submission_count() >= 10 then
      raise exception 'daily gym limit reached' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

-- Trigger functions are never called through the API.
revoke all on function public.pin_community_submission() from public, anon, authenticated;

commit;
