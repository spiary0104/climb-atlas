-- i18n PR 3: verified alternative names for a gym, so a traveller can search it by the name it is known by in another language
-- or script ("Banana Climbing" / "香蕉攀岩" / "바나나 클라이밍"). NOT APPLIED to production: needs the owner's approval, see docs/TASKS.md.
--
-- Adds to spots, optional:
--   aliases  text[] not null default '{}'  at most 10 entries, each trimmed and 1-120 characters, no control characters.
--            Search-only: the app never shows them as the gym's name (name stays the Latin name, name_local the local one).
--            Only verified aliases go in (the gym's own signage / site / social account); the import pipeline (service role) writes them.
-- Community edits do not carry aliases: pending_edits is not changed (like the 20261101000100 columns, no proposal can set them),
-- and the submission trigger below keeps a community-created row from carrying any.
-- Existing rows get '{}' (a constant default, no rewrite of data), RLS is unchanged, and the import content hash (normalize.js)
-- does not include this column, so no planned or applied batch changes meaning.
begin;

alter table public.spots
  add column if not exists aliases text[] not null default '{}';

-- A CHECK cannot contain a subquery, so the per-entry rule lives in an immutable function.
create or replace function public.spot_aliases_valid(a text[]) returns boolean
  language sql
  immutable
  set search_path = public
  as $$
  select coalesce(cardinality(a), 0) <= 10
    and not exists (
      select 1 from unnest(a) as x
      where x is null or char_length(x) not between 1 and 120 or x <> btrim(x) or x ~ '[[:cntrl:]]');
$$;

-- Callable by every role that can write spots: a CHECK runs the function as the writing user (it reads no table, so it is harmless via the API).
grant execute on function public.spot_aliases_valid(text[]) to anon, authenticated, service_role;

alter table public.spots drop constraint if exists spots_aliases_check;
alter table public.spots add constraint spots_aliases_check check (public.spot_aliases_valid(aliases));

-- The submission trigger from 20261101000100, plus: community submissions never carry aliases.
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
    new.info_source      := null;
    new.info_source_kind := null;
    new.info_checked_on  := null;
    new.aliases          := '{}';
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
